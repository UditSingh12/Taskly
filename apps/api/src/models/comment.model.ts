import mongoose, { Schema, Document } from 'mongoose';
import { Comment as ICommentType } from '@taskly/shared-types';

export interface ICommentDocument extends Omit<ICommentType, '_id' | 'author' | 'taskId'>, Document {
  _id: mongoose.Types.ObjectId;
  taskId: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
}

const CommentSchema = new Schema<ICommentDocument>(
  {
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      required: true,
      index: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        ret.taskId = ret.taskId?.toString();
        // author gets populated
        return ret;
      },
    },
  }
);

export const CommentModel = mongoose.model<ICommentDocument>('Comment', CommentSchema);
