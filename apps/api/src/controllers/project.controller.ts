import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { ProjectService } from '../services/project.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class ProjectController {
  static getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projects = await ProjectService.getProjects(req.user!._id.toString());
    res.status(200).json({ projects });
  });

  static createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const project = await ProjectService.createProject(req.user!._id.toString(), req.body);
    res.status(201).json({ project });
  });

  static getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const project = await ProjectService.getProjectById(req.user!._id.toString(), req.params.id);
    res.status(200).json({ project });
  });

  static updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const project = await ProjectService.updateProject(
      req.user!._id.toString(),
      req.params.id,
      req.body
    );
    res.status(200).json({ project });
  });

  static deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await ProjectService.deleteProject(req.user!._id.toString(), req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
  });
}
