import mongoose, { Schema, Document } from 'mongoose';
import { Task as ITaskType } from '@taskly/shared-types';

export interface ITaskDocument extends Omit<ITaskType, '_id' | 'owner' | 'projectId' | 'assignee'>, Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId | null;
  assignee?: mongoose.Types.ObjectId | null;
}

const SubtaskSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const TaskActivitySchema = new Schema(
  {
    type: { type: String, enum: ['status_change', 'priority_change', 'assignee_change', 'created'], required: true },
    actorId: { type: String, required: true },
    fromValue: { type: String },
    toValue: { type: String },
    timestamp: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const TaskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'doing', 'completed', 'on_hold'],
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    tags: {
      type: [String],
      default: [],
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    subtasks: {
      type: [SubtaskSchema],
      default: [],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
      index: true,
    },
    activity: {
      type: [TaskActivitySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        ret.owner = ret.owner?.toString();
        ret.projectId = ret.projectId ? ret.projectId.toString() : null;
        if (ret.assignee && typeof ret.assignee !== 'object') {
            ret.assignee = { _id: ret.assignee.toString() }; // Or it gets populated
        }
        return ret;
      },
    },
  }
);

// Compound index for efficient queries
TaskSchema.index({ owner: 1, status: 1, order: 1 });
TaskSchema.index({ owner: 1, projectId: 1 });

export const TaskModel = mongoose.model<ITaskDocument>('Task', TaskSchema);
