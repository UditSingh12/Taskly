import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { UserModel } from '../models/user.model.js';
import { NotificationService } from './notification.service.js';
import {
  LoginUserInput,
  AcceptInviteInput,
  UpdateThemeInput,
  User,
} from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

const toUser = (doc: any): User => {
  const json = doc.toJSON ? doc.toJSON() : doc;
  return {
    _id: json._id.toString(),
    name: json.name,
    email: json.email || undefined,
    role: json.role,
    status: json.status,
    avatarColor: json.avatarColor || '#4F46E5',
    avatarUrl: json.avatarUrl || undefined,
    theme: json.theme || 'dark',
    lastActiveAt: json.lastActiveAt ? new Date(json.lastActiveAt) : undefined,
    createdAt: json.createdAt ? new Date(json.createdAt) : undefined,
    jobTitle: json.jobTitle || undefined,
  };
};

export class AuthService {
  static createToken(userId: string): string {
    return jwt.sign({ userId }, env.JWT_SECRET, { expiresIn: '30d' });
  }

  static async login(input: LoginUserInput): Promise<{ user: User; token: string }> {
    const email = input.email.trim().toLowerCase();
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user || !user.password) {
      throw new AppError(401, 'Invalid email or password. Please check your credentials.');
    }

    if (user.status !== 'active') {
      if (user.status === 'invited') {
        throw new AppError(403, 'Account not activated. Please accept your invite first.');
      }
      throw new AppError(403, 'Your account has been deactivated. Contact an administrator.');
    }

    const isMatch = await bcrypt.compare(input.password, user.password);
    if (!isMatch) {
      throw new AppError(401, 'Invalid email or password. Please check your credentials.');
    }

    const token = this.createToken(user._id.toString());

    return {
      user: toUser(user),
      token,
    };
  }

  static async acceptInvite(input: AcceptInviteInput): Promise<{ user: User; token: string }> {
    const tokenHash = crypto.createHash('sha256').update(input.token).digest('hex');

    const user = await UserModel.findOne({
      inviteTokenHash: tokenHash,
      status: 'invited',
    }).select('+inviteTokenHash');

    if (!user) {
      throw new AppError(400, 'Invalid or expired invite link.');
    }

    // Check expiration if we implemented one, or simply clear the token.
    if ((user as any).inviteExpiresAt && new Date() > (user as any).inviteExpiresAt) {
        throw new AppError(400, 'Invite link has expired. Please ask your admin for a new one.');
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);

    user.password = hashedPassword;
    user.status = 'active';
    user.inviteTokenHash = undefined;
    (user as any).inviteExpiresAt = undefined;

    await user.save();

    const admins = await UserModel.find({ role: 'admin', status: 'active' });
    for (const admin of admins) {
      await NotificationService.createNotification(
        admin._id.toString(),
        'invite_accepted',
        `User ${user.name} (${user.email}) has accepted their invite and joined the organization.`,
        user._id.toString()
      );
    }

    const token = this.createToken(user._id.toString());

    return {
      user: toUser(user),
      token,
    };
  }

  static async getCurrentUser(userId: string): Promise<User | null> {
    const user = await UserModel.findById(userId);
    return user ? toUser(user) : null;
  }

  static async updateTheme(userId: string, input: UpdateThemeInput): Promise<User | null> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { theme: input.theme },
      { new: true }
    );
    return user ? toUser(user) : null;
  }

  static async getActiveUsers(): Promise<import('@taskly/shared-types').ActiveUser[]> {
    // Find users who have been active in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const activeUsers = await UserModel.find({
      status: 'active',
      lastActiveAt: { $gte: fiveMinutesAgo }
    }).select('_id name avatarColor role jobTitle lastActiveAt').sort({ name: 1 });

    return activeUsers.map(u => ({
      id: u._id.toString(),
      name: u.name,
      avatarColor: u.avatarColor || '#4F46E5',
      role: u.role,
      jobTitle: u.jobTitle,
      statusText: 'Online',
    }));
  }

  static async changePassword(userId: string, input: import('@taskly/shared-types').ChangePasswordInput): Promise<void> {
    const user = await UserModel.findById(userId).select('+password');
    if (!user || !user.password) {
      throw new AppError(404, 'User not found or password not set.');
    }

    const isMatch = await bcrypt.compare(input.oldPassword, user.password);
    if (!isMatch) {
      throw new AppError(401, 'Incorrect current password.');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    user.password = hashedPassword;
    await user.save();
  }
}
