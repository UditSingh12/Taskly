import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { TaskService } from '../services/task.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class TaskController {
  static getTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const tasks = await TaskService.getTasks(req.user!._id.toString(), req.query);
    res.status(200).json({ tasks });
  });

  static createTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const task = await TaskService.createTask(req.user!._id.toString(), req.body);
    res.status(201).json({ task });
  });

  static getTaskById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const task = await TaskService.getTaskById(req.user!._id.toString(), req.params.id);
    res.status(200).json({ task });
  });

  static updateTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const task = await TaskService.updateTask(req.user!._id.toString(), req.params.id, req.body);
    res.status(200).json({ task });
  });

  static deleteTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await TaskService.deleteTask(req.user!._id.toString(), req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  });

  static reorderTasks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const tasks = await TaskService.reorderTasks(req.user!._id.toString(), req.body);
    res.status(200).json({ tasks });
  });
}
