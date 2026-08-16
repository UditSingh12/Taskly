import mongoose, { Schema, Document } from 'mongoose';
import { User as IUserType } from '@taskly/shared-types';

export interface IUserDocument extends Omit<IUserType, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
  password?: string;
  googleId?: string;
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
      sparse: true,
      index: true,
    },
    password: {
      type: String,
      select: false, // Don't return password in queries by default
    },
    googleId: {
      type: String,
      sparse: true,
    },
    avatarUrl: {
      type: String,
    },
    isGuest: {
      type: Boolean,
      default: true,
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
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret: any) => {
        ret._id = ret._id?.toString();
        delete ret.password;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
