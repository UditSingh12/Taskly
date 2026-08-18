import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { AdminService } from '../services/admin.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AdminController {
  static getTeam = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const team = await AdminService.getTeam(req.user!._id.toString());
    res.status(200).json({ team });
  });

  static generateInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const token = await AdminService.generateInvite(req.user!._id.toString(), req.body);
    // In a real app, send an email here. For now, we return the token to construct a link in the UI.
    res.status(201).json({ token });
  });

  static revokeInvite = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AdminService.revokeInvite(req.user!._id.toString(), req.params.userId);
    res.status(200).json({ message: 'Invite revoked' });
  });

  static deactivateMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AdminService.deactivateMember(req.user!._id.toString(), req.params.userId);
    res.status(200).json({ message: 'Member deactivated' });
  });

  static getAuditLog = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const logs = await AdminService.getAuditLog(req.user!._id.toString());
    res.status(200).json({ logs });
  });
}
