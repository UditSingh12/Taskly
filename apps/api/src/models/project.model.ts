import mongoose, { Schema, Document } from 'mongoose';
import { Project as IProjectType } from '@taskly/shared-types';

export interface IProjectDocument extends Omit<IProjectType, '_id' | 'owner' | 'taskCount' | 'completedTaskCount'>, Document {
  _id: mongoose.Types.ObjectId;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  pendingMembers: mongoose.Types.ObjectId[];
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
    members: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    pendingMembers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        ret.owner = ret.owner?.toString();
        ret.memberIds = ret.members?.map((m: any) => m.toString()) || [];
        ret.pendingMemberIds = ret.pendingMembers?.map((m: any) => m.toString()) || [];
        delete ret.members;
        delete ret.pendingMembers;
        return ret;
      },
    },
  }
);

export const ProjectModel = mongoose.model<IProjectDocument>('Project', ProjectSchema);
