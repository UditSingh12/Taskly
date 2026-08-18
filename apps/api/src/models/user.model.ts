import mongoose, { Schema, Document } from 'mongoose';
import { User as IUserType } from '@taskly/shared-types';

export interface IUserDocument extends Omit<IUserType, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  password?: string;
  inviteTokenHash?: string;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      select: false, // Don't return password in queries by default
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['invited', 'active', 'deactivated'],
      default: 'active',
    },
    inviteTokenHash: {
      type: String,
      select: false,
    },
    avatarUrl: {
      type: String,
    },
    avatarColor: {
      type: String,
      required: true,
      default: '#4F46E5',
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark',
    },
    lastActiveAt: {
      type: Date,
    },
    jobTitle: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        delete ret.password;
        delete ret.inviteTokenHash;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
