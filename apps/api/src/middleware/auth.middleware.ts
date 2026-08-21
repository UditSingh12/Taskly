import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { UserModel, IUserDocument } from '../models/user.model.js';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

export const requireAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token = req.cookies?.jwt;

    // Also support Authorization: Bearer <token> for flex testing
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(401, 'Authentication required. Please continue as guest or login.');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };

    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      throw new AppError(401, 'User session not found or expired.');
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'Your account is not active. Please contact an administrator.');
    }

    // Update presence (fire and forget) - throttled to once every 5 minutes to prevent DB thrashing
    const FIVE_MINUTES = 5 * 60 * 1000;
    if (!user.lastActiveAt || (Date.now() - new Date(user.lastActiveAt).getTime() > FIVE_MINUTES)) {
      UserModel.updateOne({ _id: user._id }, { lastActiveAt: new Date() }).catch(console.error);
    }
    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      next(new AppError(401, 'Invalid or expired session token.'));
    } else {
      next(error);
    }
  }
};
