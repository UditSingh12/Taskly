import mongoose from 'mongoose';
import { CommentModel } from '../models/comment.model.js';
import { TaskModel } from '../models/task.model.js';
import { Comment, CreateCommentInput } from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

export class CommentService {
  static async getComments(taskId: string): Promise<Comment[]> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }
    const comments = await CommentModel.find({ taskId })
      .populate('author', 'name avatarColor avatarUrl')
      .sort({ createdAt: 1 });
    
    return comments.map(c => c.toJSON() as unknown as Comment);
  }

  static async createComment(userId: string, taskId: string, input: CreateCommentInput): Promise<Comment> {
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, 'Invalid task ID');
    }

    const task = await TaskModel.findById(taskId);
    if (!task) {
      throw new AppError(404, 'Task not found');
    }

    const comment = await CommentModel.create({
      taskId: new mongoose.Types.ObjectId(taskId),
      author: new mongoose.Types.ObjectId(userId),
      body: input.body,
    });

    await comment.populate('author', 'name avatarColor avatarUrl');
    return comment.toJSON() as unknown as Comment;
  }
}
