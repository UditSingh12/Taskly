import crypto from 'crypto';
import { UserModel } from '../models/user.model.js';
import { TaskModel } from '../models/task.model.js';
import { AdminAuditLogModel } from '../models/audit-log.model.js';
import { AdminInviteInput, User, AdminAuditLog } from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';
import { env } from '../config/env.js';

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
  };
};

export class AdminService {
  static async getTeam(adminId: string): Promise<User[]> {
    const users = await UserModel.find().sort({ createdAt: -1 });
    return users.map(toUser);
  }

  static async generateInvite(adminId: string, input: AdminInviteInput): Promise<string> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') throw new AppError(403, 'Admin only');

    const existingUser = await UserModel.findOne({ email: input.email.trim().toLowerCase() });
    if (existingUser) {
        if (existingUser.status === 'invited' || existingUser.status === 'deactivated') {
             // Overwrite invite token for an already invited or deactivated user
        } else {
             throw new AppError(400, 'User already exists and is active');
        }
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

    if (existingUser) {
        existingUser.inviteTokenHash = tokenHash;
        existingUser.name = input.name;
        existingUser.jobTitle = input.jobTitle;
        existingUser.status = 'invited';
        (existingUser as any).inviteExpiresAt = expiresAt;
        await existingUser.save();
    } else {
        await UserModel.create({
            email: input.email.trim().toLowerCase(),
            name: input.name,
            jobTitle: input.jobTitle,
            role: 'member',
            status: 'invited',
            inviteTokenHash: tokenHash,
            avatarColor: '#4F46E5', // Randomize later if needed
            inviteExpiresAt: expiresAt
        });
    }

    await AdminAuditLogModel.create({
        adminId: admin._id.toString(),
        adminName: admin.name,
        action: 'invite_sent',
        targetType: 'user',
        targetId: input.email.trim().toLowerCase(),
        details: { name: input.name, jobTitle: input.jobTitle }
    });

    return token;
  }

  static async revokeInvite(adminId: string, userId: string): Promise<void> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') throw new AppError(403, 'Admin only');

    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(404, 'User not found');
    
    if (user.status !== 'invited') {
        throw new AppError(400, 'User is not in invited status');
    }

    await UserModel.findByIdAndDelete(userId);

    await AdminAuditLogModel.create({
        adminId: admin._id.toString(),
        adminName: admin.name,
        action: 'invite_revoked',
        targetType: 'user',
        targetId: userId,
        details: { email: user.email }
    });
  }

  static async deactivateMember(adminId: string, userId: string): Promise<void> {
    const admin = await UserModel.findById(adminId);
    if (!admin || admin.role !== 'admin') throw new AppError(403, 'Admin only');

    if (adminId === userId) {
        throw new AppError(400, 'You cannot deactivate yourself');
    }

    const user = await UserModel.findById(userId);
    if (!user) throw new AppError(404, 'User not found');

    if (user.role === 'admin') {
        // Last admin standing check
        const adminCount = await UserModel.countDocuments({ role: 'admin', status: 'active' });
        if (adminCount <= 1) {
            throw new AppError(400, 'Cannot deactivate the last active admin');
        }
    }

    user.status = 'deactivated';
    await user.save();

    await AdminAuditLogModel.create({
        adminId: admin._id.toString(),
        adminName: admin.name,
        action: 'member_deactivated',
        targetType: 'user',
        targetId: userId,
        details: { email: user.email }
    });
  }

  static async getAuditLog(adminId: string): Promise<AdminAuditLog[]> {
    const logs = await AdminAuditLogModel.find().sort({ timestamp: -1 }).limit(100);
    return logs.map(l => {
        const json = l.toJSON ? l.toJSON() : l;
        return {
            _id: json._id.toString(),
            adminId: json.adminId,
            adminName: json.adminName,
            action: json.action,
            targetType: json.targetType,
            targetId: json.targetId,
            timestamp: new Date(json.timestamp),
            details: json.details
        };
    });
  }
}
