import mongoose, { Schema, Document } from 'mongoose';
import { AdminAuditLog as IAdminAuditLogType } from '@taskly/shared-types';

export interface IAdminAuditLogDocument extends Omit<IAdminAuditLogType, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLogDocument>(
  {
    adminId: {
      type: String,
      required: true,
      index: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['invite_sent', 'invite_revoked', 'member_deactivated', 'member_promoted', 'task_force_edited'],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'task'],
      required: true,
    },
    targetId: {
      type: String,
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        return ret;
      },
    },
  }
);

export const AdminAuditLogModel = mongoose.model<IAdminAuditLogDocument>('AdminAuditLog', AdminAuditLogSchema);
