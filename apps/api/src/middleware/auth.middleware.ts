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
