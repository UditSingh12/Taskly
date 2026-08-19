import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { NotificationService } from '../services/notification.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class NotificationController {
  static getNotifications = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 20;
    const notifications = await NotificationService.getNotifications(req.user!._id.toString(), limit);
    res.status(200).json({ notifications });
  });

  static getUnreadCount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const count = await NotificationService.getUnreadCount(req.user!._id.toString());
    res.status(200).json({ count });
  });

  static markAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const notification = await NotificationService.markAsRead(req.user!._id.toString(), req.params.id);
    res.status(200).json({ notification });
  });

  static markAllAsRead = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await NotificationService.markAllAsRead(req.user!._id.toString());
    res.status(200).json({ message: 'All notifications marked as read' });
  });
}
