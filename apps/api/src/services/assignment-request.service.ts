import mongoose from 'mongoose';
import { AssignmentRequestModel } from '../models/assignment-request.model.js';
import { TaskModel } from '../models/task.model.js';
import { UserModel } from '../models/user.model.js';
import { AdminAuditLogModel } from '../models/audit-log.model.js';
import { NotificationService } from './notification.service.js';
import { AssignmentRequest, TaskActivity } from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

const toAssignmentRequest = (doc: any): AssignmentRequest => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    taskId: json.taskId.toString(),
    requesterId: json.requesterId.toString(),
    status: json.status,
    requester: json.requesterId && typeof json.requesterId === 'object' ? {
        _id: json.requesterId._id.toString(),
        name: json.requesterId.name,
        avatarColor: json.requesterId.avatarColor,
        avatarUrl: json.requesterId.avatarUrl,
    } : undefined,
    createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
    updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
  };
};

export class AssignmentRequestService {
  static async createRequest(userId: string, taskId: string): Promise<AssignmentRequest> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    if (task.assignmentStatus === 'unassigned' && !task.assignee) {
      throw new AppError(400, 'Task is unassigned. You can claim it directly.');
    }

    // Check for existing pending request
    const existing = await AssignmentRequestModel.findOne({
      taskId: new mongoose.Types.ObjectId(taskId),
      requesterId: new mongoose.Types.ObjectId(userId),
      status: 'pending'
    });

    if (existing) {
      throw new AppError(400, 'You already have a pending assignment request for this task.');
    }

    const request = await AssignmentRequestModel.create({
      taskId: new mongoose.Types.ObjectId(taskId),
      requesterId: new mongoose.Types.ObjectId(userId),
      status: 'pending'
    });

    // Update task assignmentStatus to reflect there's a pending request
    await TaskModel.findByIdAndUpdate(taskId, {
      $set: { assignmentStatus: 'pending_request' }
    });

    // Notify current assignee and admins
    if (task.assignee) {
      await NotificationService.createNotification(
        task.assignee.toString(),
        'assignment_requested',
        `User requested to be assigned to your task: ${task.title}`,
        userId,
        task._id.toString()
      );
    }

    const admins = await UserModel.find({ role: 'admin', status: 'active' });
    for (const admin of admins) {
        await NotificationService.createNotification(
            admin._id.toString(),
            'assignment_requested',
            `New assignment request for task: ${task.title}`,
            userId,
            task._id.toString()
        );
    }

    await request.populate('requesterId', 'name avatarColor avatarUrl');

    return toAssignmentRequest(request);
  }

  static async getRequestsForTask(taskId: string): Promise<AssignmentRequest[]> {
    const requests = await AssignmentRequestModel.find({ taskId: new mongoose.Types.ObjectId(taskId) })
      .populate('requesterId', 'name avatarColor avatarUrl')
      .sort({ createdAt: -1 });
    return requests.map(toAssignmentRequest);
  }

  static async processRequest(userId: string, requestId: string, approve: boolean): Promise<AssignmentRequest> {
    const request = await AssignmentRequestModel.findById(requestId);
    if (!request) {
      throw new AppError(404, 'Assignment request not found');
    }

    if (request.status !== 'pending') {
      throw new AppError(400, 'This request has already been processed.');
    }

    const task = await TaskModel.findById(request.taskId);
    if (!task) {
      throw new AppError(404, 'Associated task not found');
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, 'User not found');

    const isAdmin = user.role === 'admin';
    const isCurrentAssignee = task.assignee && task.assignee.toString() === userId;

    if (!isAdmin && !isCurrentAssignee) {
      throw new AppError(403, 'Only admins or the current assignee can approve or reject assignment requests.');
    }

    request.status = approve ? 'approved' : 'rejected';
    await request.save();

    if (approve) {
      const activity: TaskActivity = {
        type: 'assignee_change',
        actorId: userId,
        fromValue: task.assignee ? task.assignee.toString() : 'unassigned',
        toValue: request.requesterId.toString(),
        timestamp: new Date()
      };

      await TaskModel.findByIdAndUpdate(task._id, {
        $set: {
          assignee: request.requesterId,
          assignmentStatus: 'assigned'
        },
        $push: { activity }
      });
      
      if (isAdmin && !isCurrentAssignee) {
          // Admin force processed
          await AdminAuditLogModel.create({
              adminId: user._id.toString(),
              adminName: user.name,
              action: 'task_force_edited',
              targetType: 'task',
              targetId: task._id.toString(),
              details: { changes: [{ type: 'assignment_request_approved', newAssignee: request.requesterId.toString() }] }
          });
      }
    } else {
      // Revert task assignmentStatus if no other pending requests exist
      const otherPending = await AssignmentRequestModel.findOne({
        taskId: task._id,
        status: 'pending'
      });
      
      if (!otherPending) {
        await TaskModel.findByIdAndUpdate(task._id, {
          $set: { assignmentStatus: task.assignee ? 'assigned' : 'unassigned' }
        });
      }
    }

    // Notify requester
    await NotificationService.createNotification(
      request.requesterId.toString(),
      approve ? 'assignment_approved' : 'assignment_rejected',
      `Your assignment request for "${task.title}" was ${approve ? 'approved' : 'rejected'}.`,
      userId,
      task._id.toString()
    );

    await request.populate('requesterId', 'name avatarColor avatarUrl');
    return toAssignmentRequest(request);
  }
}
