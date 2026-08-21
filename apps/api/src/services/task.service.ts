import mongoose from 'mongoose';
import { TaskModel } from '../models/task.model.js';
import { UserModel } from '../models/user.model.js';
import { ProjectModel } from '../models/project.model.js';
import { AdminAuditLogModel } from '../models/audit-log.model.js';
import { NotificationService } from './notification.service.js';
import {
  CreateTaskInput,
  UpdateTaskInput,
  ReorderTasksInput,
  ReorderItem,
  TaskQueryFilter,
  Task,
  TaskActivity,
} from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

const toTask = (doc: any): Task => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    title: json.title,
    description: json.description || '',
    status: json.status,
    assignmentStatus: json.assignmentStatus || 'unassigned',
    priority: json.priority,
    dueDate: json.dueDate ? new Date(json.dueDate) : null,
    tags: json.tags || [],
    assignee: json.assignee ? {
        _id: json.assignee._id.toString(),
        name: json.assignee.name,
        avatarColor: json.assignee.avatarColor,
        avatarUrl: json.assignee.avatarUrl,
    } : null,
    subtasks: json.subtasks || [],
    projectId: json.projectId ? json.projectId.toString() : null,
    owner: json.owner.toString(),
    order: json.order || 0,
    activity: json.activity || [],
    createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
    updatedAt: json.updatedAt ? new Date(json.updatedAt) : undefined,
  };
};

export class TaskService {
  static async getTasks(userId: string, filter?: TaskQueryFilter): Promise<Task[]> {
    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, 'User not found');

    const query: mongoose.FilterQuery<any> = {};
    const andConditions: any[] = [];

    // Access control: Non-admins can only see their own tasks, assigned tasks, or tasks in their projects
    if (user.role !== 'admin') {
      const userProjects = await ProjectModel.find({ members: new mongoose.Types.ObjectId(userId) }).select('_id');
      const projectIds = userProjects.map(p => p._id);
      
      andConditions.push({
        $or: [
          { owner: new mongoose.Types.ObjectId(userId) },
          { assignee: new mongoose.Types.ObjectId(userId) },
          { projectId: { $in: projectIds } }
        ]
      });
    }

    if (filter?.status) query.status = filter.status;
    if (filter?.priority) query.priority = filter.priority;
    if (filter?.tag) query.tags = { $in: [filter.tag] };
    if (filter?.projectId) query.projectId = new mongoose.Types.ObjectId(filter.projectId);
    if (filter?.assigneeId) query.assignee = new mongoose.Types.ObjectId(filter.assigneeId);

    if (filter?.search) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { tags: { $in: [searchRegex] } },
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const tasks = await TaskModel.find(query)
        .populate('assignee', 'name avatarColor avatarUrl')
        .sort({ status: 1, order: 1, createdAt: -1 });
    return tasks.map(toTask);
  }

  static async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
    const highestOrderTask = await TaskModel.findOne({
      status: input.status || 'todo',
    }).sort({ order: -1 });

    const nextOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;

    const activity: TaskActivity[] = [{
      type: 'created',
      actorId: userId,
      timestamp: new Date()
    }];

    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, 'User not found');
    
    let project: any = null;
    if (input.projectId) {
      project = await ProjectModel.findById(input.projectId);
      if (user.role !== 'admin') {
        if (!project || !project.members.includes(new mongoose.Types.ObjectId(userId))) {
          throw new AppError(403, 'You must be a member of this project to create tasks in it.');
        }
      }
    }

    const task = await TaskModel.create({
      ...input,
      projectId: input.projectId ? new mongoose.Types.ObjectId(input.projectId) : null,
      assignee: input.assigneeId ? new mongoose.Types.ObjectId(input.assigneeId) : null,
      assignmentStatus: input.assigneeId ? 'assigned' : 'unassigned',
      owner: new mongoose.Types.ObjectId(userId),
      order: input.order !== undefined ? input.order : nextOrder,
      activity
    });

    await task.populate('assignee', 'name avatarColor avatarUrl');

    if (input.assigneeId && input.assigneeId !== userId) {
      await NotificationService.createNotification(
        input.assigneeId,
        'assigned',
        `You were assigned to a new task: ${task.title}`,
        userId,
        task._id.toString()
      );
    }

    // Notify project members (except creator and assignee, who are already handled)
    if (project && project.members) {
      for (const memberId of project.members) {
        const memberIdStr = memberId.toString();
        if (memberIdStr !== userId && memberIdStr !== input.assigneeId) {
          await NotificationService.createNotification(
            memberIdStr,
            'task_created',
            `${user.name} created a new task in ${project.name}: ${task.title}`,
            userId,
            task._id.toString()
          );
        }
      }
    }

    return toTask(task);
  }

  static async getTaskById(userId: string, taskId: string): Promise<Task> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findById(taskId).populate('assignee', 'name avatarColor avatarUrl');

    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    return toTask(task);
  }

  static async updateTask(userId: string, taskId: string, input: UpdateTaskInput): Promise<Task> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, 'User not found');

    // Status transition gating logic
    if (input.status && input.status !== task.status) {
      const isAdmin = user.role === 'admin';
      const isCreatorOrAssignee = task.owner.toString() === userId || (task.assignee && task.assignee.toString() === userId);
      
      if (!isAdmin) {
        if (!isCreatorOrAssignee) {
          throw new AppError(403, 'Only admins or the task owner/assignee can change task status.');
        }

        const allowedTransitions: Record<string, string[]> = {
          'todo': ['doing'],
          'doing': ['todo', 'completed'],
          'completed': [],
          'on_hold': [] // Only admins can move out of on_hold or reopen completed
        };

        const allowed = allowedTransitions[task.status] || [];
        if (!allowed.includes(input.status)) {
          throw new AppError(403, `Members cannot transition task from ${task.status} to ${input.status}.`);
        }
      }
    }


    // Enforce edit permissions: Admin, Creator (owner), Assignee, or Project Member
    const isOwner = task.owner.toString() === userId;
    const isAssignee = task.assignee && task.assignee.toString() === userId;
    const isAdmin = user.role === 'admin';
    let isProjectMember = false;

    if (task.projectId) {
      const project = await ProjectModel.findById(task.projectId);
      if (project && project.members.includes(new mongoose.Types.ObjectId(userId))) {
        isProjectMember = true;
      }
    }

    if (!isOwner && !isAssignee && !isAdmin && !isProjectMember) {
      throw new AppError(403, 'You do not have permission to edit this task.');
    }

    const updatePayload: any = { ...input };
    if (input.projectId !== undefined) {
      updatePayload.projectId = input.projectId
        ? new mongoose.Types.ObjectId(input.projectId)
        : null;
    }
    
    // Admins can direct-assign
    if (input.assigneeId !== undefined) {
      if (isAdmin) {
         updatePayload.assignee = input.assigneeId ? new mongoose.Types.ObjectId(input.assigneeId) : null;
         updatePayload.assignmentStatus = input.assigneeId ? 'assigned' : 'unassigned';
      } else {
         // Prevent normal users from updating assignee via generic update (they must use claim or request flows)
         throw new AppError(403, 'Members cannot directly reassign tasks. Use the claim or request workflow.');
      }
    }

    const newActivities: TaskActivity[] = [];

    if (input.status && input.status !== task.status) {
        newActivities.push({
            type: 'status_change',
            actorId: userId,
            fromValue: task.status,
            toValue: input.status,
            timestamp: new Date()
        });
    }

    if (input.priority && input.priority !== task.priority) {
        newActivities.push({
            type: 'priority_change',
            actorId: userId,
            fromValue: task.priority,
            toValue: input.priority,
            timestamp: new Date()
        });
    }

    if (input.assigneeId !== undefined && input.assigneeId !== task.assignee?.toString()) {
        newActivities.push({
            type: 'assignee_change',
            actorId: userId,
            fromValue: task.assignee?.toString() || 'unassigned',
            toValue: input.assigneeId || 'unassigned',
            timestamp: new Date()
        });
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      { 
          $set: updatePayload,
          $push: { activity: { $each: newActivities } }
      },
      { new: true, runValidators: true }
    ).populate('assignee', 'name avatarColor avatarUrl');

    if (!updatedTask) {
      throw new AppError(404, 'Task not found');
    }
    
    if (isAdmin && !isOwner && !isAssignee && newActivities.length > 0) {
        // Admin force edited someone else's task
        await AdminAuditLogModel.create({
            adminId: user._id.toString(),
            adminName: user.name,
            action: 'task_force_edited',
            targetType: 'task',
            targetId: taskId,
            details: { changes: newActivities }
        });
    }

    // Trigger Notifications
    if (input.assigneeId !== undefined && input.assigneeId !== (task.assignee?.toString() || undefined)) {
        if (input.assigneeId) {
            await NotificationService.createNotification(
                input.assigneeId,
                'assigned',
                `You were assigned to task: ${updatedTask.title}`,
                userId,
                updatedTask._id.toString()
            );
        }
        
        // Also notify everyone else about the assignment change
        await NotificationService.notifyProjectMembers(
            updatedTask.projectId?.toString() || null,
            userId,
            'assignee_changed',
            `${user.name} reassigned task "${updatedTask.title}"`,
            updatedTask._id.toString(),
            updatedTask.assignee?._id?.toString()
        );
    }

    if (input.status && input.status !== task.status) {
        await NotificationService.notifyProjectMembers(
            updatedTask.projectId?.toString() || null,
            userId,
            'status_changed',
            `${user.name} changed the status of task "${updatedTask.title}" to ${input.status.replace('_', ' ')}`,
            updatedTask._id.toString(),
            updatedTask.assignee?._id?.toString()
        );
    }
    
    if (input.tags && JSON.stringify(input.tags) !== JSON.stringify(task.tags)) {
        await NotificationService.notifyProjectMembers(
            updatedTask.projectId?.toString() || null,
            userId,
            'tags_changed',
            `${user.name} updated the tags on task "${updatedTask.title}"`,
            updatedTask._id.toString(),
            updatedTask.assignee?._id?.toString()
        );
    }
    
    if (input.description !== undefined && input.description !== task.description) {
        await NotificationService.notifyProjectMembers(
            updatedTask.projectId?.toString() || null,
            userId,
            'description_changed',
            `${user.name} updated the description of task "${updatedTask.title}"`,
            updatedTask._id.toString(),
            updatedTask.assignee?._id?.toString()
        );
    }

    return toTask(updatedTask);
  }

  static async deleteTask(userId: string, taskId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    const user = await UserModel.findById(userId);
    const isOwner = task.owner.toString() === userId;
    const isAdmin = user?.role === 'admin';
    let isProjectMember = false;

    if (task.projectId) {
      const project = await ProjectModel.findById(task.projectId);
      if (project && project.members.includes(new mongoose.Types.ObjectId(userId))) {
        isProjectMember = true;
      }
    }

    if (!isOwner && !isAdmin && !isProjectMember) {
      throw new AppError(403, 'You do not have permission to delete this task.');
    }

    await TaskModel.findByIdAndDelete(taskId);
  }

  static async reorderTasks(userId: string, input: ReorderTasksInput): Promise<Task[]> {
      const user = await UserModel.findById(userId);
      if (!user) throw new AppError(401, 'User not found');
      
    const taskIds = input.tasks.map(t => t.id);
    const tasksToUpdate = await TaskModel.find({ _id: { $in: taskIds } });

    // Access Control Validation for reordering
    if (user.role !== 'admin') {
      const userProjects = await ProjectModel.find({ members: new mongoose.Types.ObjectId(userId) }).select('_id');
      const projectIds = userProjects.map(p => p._id.toString());
      
      for (const task of tasksToUpdate) {
        const isOwner = task.owner.toString() === userId;
        const isAssignee = task.assignee && task.assignee.toString() === userId;
        const isProjectMember = task.projectId && projectIds.includes(task.projectId.toString());
        
        if (!isOwner && !isAssignee && !isProjectMember) {
          throw new AppError(403, 'You do not have permission to reorder or edit one or more of these tasks.');
        }
      }
    }

    const bulkOps = input.tasks.map((item: ReorderItem) => {
      return {
        updateOne: {
          filter: {
            _id: new mongoose.Types.ObjectId(item.id)
          },
          update: {
            $set: {
              status: item.status,
              order: item.order,
            },
          },
        },
      };
    });

    if (bulkOps.length > 0) {
      await TaskModel.bulkWrite(bulkOps);

      // Check for status changes and trigger notifications
      for (const item of input.tasks) {
        const oldTask = tasksToUpdate.find(t => t._id.toString() === item.id);
        if (oldTask && item.status && item.status !== oldTask.status) {
          await NotificationService.notifyProjectMembers(
            oldTask.projectId?.toString() || null,
            userId,
            'status_changed',
            `${user.name} moved task "${oldTask.title}" to ${item.status.replace('_', ' ')}`,
            oldTask._id.toString(),
            oldTask.assignee?.toString()
          );
        }
      }
    }

    const updatedTasks = await TaskModel.find({ _id: { $in: taskIds } })
        .populate('assignee', 'name avatarColor avatarUrl')
        .sort({ status: 1, order: 1 });

    return updatedTasks.map(toTask);
  }

  static async claimTask(userId: string, taskId: string): Promise<Task> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) throw new AppError(400, 'Invalid task ID');
    
    const task = await TaskModel.findById(taskId);
    if (!task) throw new AppError(404, 'Task not found');

    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(401, 'User not found');

    // Only unassigned tasks can be claimed directly
    if (task.assignee || task.assignmentStatus === 'assigned') {
      throw new AppError(400, 'Task is already assigned. Submit an assignment request instead.');
    }

    const activity: TaskActivity = {
      type: 'assignee_change',
      actorId: userId,
      fromValue: 'unassigned',
      toValue: userId,
      timestamp: new Date()
    };

    const updatedTask = await TaskModel.findByIdAndUpdate(
      taskId,
      {
        $set: { 
          assignee: new mongoose.Types.ObjectId(userId),
          assignmentStatus: 'assigned'
        },
        $push: { activity }
      },
      { new: true, runValidators: true }
    ).populate('assignee', 'name avatarColor avatarUrl');

    if (!updatedTask) throw new AppError(404, 'Task not found');
    
    // We'll hook up notifications later, but for now we're returning the task
    return toTask(updatedTask);
  }
}
