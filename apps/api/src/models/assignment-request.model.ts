import mongoose, { Schema, Document } from 'mongoose';
import { AssignmentRequest as IAssignmentRequestType } from '@taskly/shared-types';

export interface IAssignmentRequestDocument extends Omit<IAssignmentRequestType, '_id' | 'taskId' | 'requesterId' | 'requester'>, Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  requesterId: mongoose.Types.ObjectId;
}

const AssignmentRequestSchema = new Schema<IAssignmentRequestDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        ret.taskId = ret.taskId?.toString();
        ret.requesterId = ret.requesterId?.toString();
        if (ret.requesterId && typeof ret.requesterId !== 'object') {
            ret.requester = undefined;
        }
        return ret;
      },
    },
  }
);

// Compound index to ensure efficient lookup per task and requester
AssignmentRequestSchema.index({ taskId: 1, requesterId: 1, status: 1 });

export const AssignmentRequestModel = mongoose.model<IAssignmentRequestDocument>('AssignmentRequest', AssignmentRequestSchema);
