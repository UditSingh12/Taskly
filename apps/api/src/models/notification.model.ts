import mongoose, { Schema, Document } from 'mongoose';
import { Notification as INotificationType } from '@taskly/shared-types';

export interface INotificationDocument extends Omit<INotificationType, '_id' | 'userId' | 'taskId' | 'actorId'>, Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId | null;
  actorId?: mongoose.Types.ObjectId | null;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'assigned', 
        'assignment_requested', 
        'assignment_approved', 
        'assignment_rejected', 
        'status_changed', 
        'mentioned', 
        'invite_accepted',
        'project_request',
        'task_created'
      ],
      required: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        ret.userId = ret.userId?.toString();
        ret.taskId = ret.taskId ? ret.taskId.toString() : null;
        ret.actorId = ret.actorId ? ret.actorId.toString() : null;
        return ret;
      },
    },
  }
);

// Index for efficiently fetching unread notifications for a user
NotificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const NotificationModel = mongoose.model<INotificationDocument>('Notification', NotificationSchema);
