import { Request, Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';

const setAuthCookie = (res: Response, token: string) => {
  const isProduction = env.NODE_ENV === 'production';
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: '/',
  });
};

export class AuthController {
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await AuthService.login(req.body);
    setAuthCookie(res, token);
    res.status(200).json({ user, token });
  });

  static acceptInvite = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await AuthService.acceptInvite(req.body);
    setAuthCookie(res, token);
    res.status(200).json({ user, token });
  });

  static getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.getCurrentUser(req.user!._id.toString());
    res.status(200).json({ user });
  });

  static getActiveUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const activeUsers = await AuthService.getActiveUsers();
    
    // Mark if it's the current user
    const currentUserId = req.user?._id.toString();
    const mappedUsers = activeUsers.map(u => ({
      ...u,
      isCurrentUser: u.id === currentUserId
    }));

    res.status(200).json({ activeUsers: mappedUsers });
  });

  static logout = asyncHandler(async (_req: Request, res: Response) => {
    const isProduction = env.NODE_ENV === 'production';
    res.cookie('jwt', '', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      expires: new Date(0),
      maxAge: 0,
      path: '/',
    });
    res.status(200).json({ message: 'Logged out successfully' });
  });

  static changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await AuthService.changePassword(req.user!._id.toString(), req.body);
    res.status(200).json({ message: 'Password updated successfully' });
  });
}
