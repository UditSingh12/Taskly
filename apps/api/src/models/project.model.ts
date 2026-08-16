import mongoose, { Schema, Document } from 'mongoose';
import { Project as IProjectType } from '@taskly/shared-types';

export interface IProjectDocument extends Omit<IProjectType, '_id' | 'owner' | 'taskCount' | 'completedTaskCount'>, Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#4F46E5',
    },
    icon: {
      type: String,
      default: 'folder',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        ret.owner = ret.owner?.toString();
        return ret;
      },
    },
  }
);

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
