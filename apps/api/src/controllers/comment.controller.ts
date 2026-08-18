import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { CommentService } from '../services/comment.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class CommentController {
  static getComments = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const comments = await CommentService.getComments(req.params.taskId);
    res.status(200).json({ comments });
  });

  static createComment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const comment = await CommentService.createComment(
      req.user!._id.toString(),
      req.params.taskId,
      req.body
    );
    res.status(201).json({ comment });
  });
}
