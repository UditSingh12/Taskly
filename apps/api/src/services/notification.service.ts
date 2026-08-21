import mongoose from 'mongoose';
import { NotificationModel } from '../models/notification.model.js';
import { Notification } from '@taskly/shared-types';

const toNotification = (doc: any): Notification => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    userId: json.userId.toString(),
    type: json.type,
    taskId: json.taskId ? json.taskId.toString() : null,
    actorId: json.actorId ? json.actorId.toString() : null,
    message: json.message,
    read: json.read,
    createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
  };
};

export class NotificationService {
  static async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    const notifications = await NotificationModel.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit);
    return notifications.map(toNotification);
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return NotificationModel.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      read: false
    });
  }

  static async markAsRead(userId: string, notificationId: string): Promise<Notification | null> {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(notificationId), userId: new mongoose.Types.ObjectId(userId) },
      { $set: { read: true } },
      { new: true }
    );
    return notification ? toNotification(notification) : null;
  }

  static async markAllAsRead(userId: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), read: false },
      { $set: { read: true } }
    );
  }

  // Internal helper to create notifications (not exposed directly to HTTP)
  static async createNotification(
    userId: string,
    type: string,
    message: string,
    actorId?: string,
    taskId?: string
  ): Promise<void> {
    // Don't notify yourself for actions you took
    if (actorId && actorId === userId) return;
    
    await NotificationModel.create({
      userId: new mongoose.Types.ObjectId(userId),
      type,
      message,
      actorId: actorId ? new mongoose.Types.ObjectId(actorId) : undefined,
      taskId: taskId ? new mongoose.Types.ObjectId(taskId) : undefined,
    });
  }

  static async notifyProjectMembers(
    projectId: string | null,
    actorId: string,
    type: string,
    message: string,
    taskId?: string,
    assigneeId?: string | null
  ): Promise<void> {
    if (projectId) {
      const { ProjectModel } = await import('../models/project.model.js');
      const project = await ProjectModel.findById(projectId);
      if (project && project.members) {
        for (const memberId of project.members) {
          await this.createNotification(memberId.toString(), type, message, actorId, taskId);
        }
      }
    } else if (assigneeId) {
      // Independent task, just notify the assignee
      await this.createNotification(assigneeId, type, message, actorId, taskId);
    }
  }

  static async notifyProjectAccessRequest(requesterId: string, projectId: string, projectName: string): Promise<void> {
    const { UserModel } = await import('../models/user.model.js');
    const admins = await UserModel.find({ role: 'admin' });
    const requester = await UserModel.findById(requesterId);
    if (!requester) return;

    for (const admin of admins) {
      await this.createNotification(
        admin._id.toString(),
        'project_request',
        `${requester.name} has requested access to the project: ${projectName}`,
        requesterId
      );
    }
  }
}
