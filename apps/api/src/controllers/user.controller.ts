import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { AuthService } from '../services/auth.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class UserController {
  static updateTheme = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const user = await AuthService.updateTheme(req.user!._id.toString(), req.body);
    res.status(200).json({ user });
  });
}
