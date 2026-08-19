import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { ProjectService } from '../services/project.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class ProjectController {
  static getProjects = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projects = await ProjectService.getProjects();
    res.status(200).json({ projects });
  });

  static createProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const project = await ProjectService.createProject(req.user!._id.toString(), req.body);
    res.status(201).json({ project });
  });

  static getProjectById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const project = await ProjectService.getProjectById(req.params.id);
    res.status(200).json({ project });
  });

  static updateProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin only', statusCode: 403 } });
    }
    const project = await ProjectService.updateProject(
      req.params.id,
      req.body
    );
    res.status(200).json({ project });
  });

  static deleteProject = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin only', statusCode: 403 } });
    }
    await ProjectService.deleteProject(req.params.id);
    res.status(200).json({ message: 'Project deleted successfully' });
  });

  static requestAccess = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await ProjectService.requestAccess(req.user!._id.toString(), req.params.id);
    res.status(200).json({ message: 'Access requested' });
  });

  static addMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin only', statusCode: 403 } });
    }
    await ProjectService.addMember(req.user!._id.toString(), req.params.id, req.body.userId);
    res.status(200).json({ message: 'Member added' });
  });

  static removeMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin only', statusCode: 403 } });
    }
    await ProjectService.removeMember(req.user!._id.toString(), req.params.id, req.params.userId);
    res.status(200).json({ message: 'Member removed' });
  });

  static denyRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: { message: 'Admin only', statusCode: 403 } });
    }
    await ProjectService.denyRequest(req.user!._id.toString(), req.params.id, req.params.userId);
    res.status(200).json({ message: 'Request denied' });
  });
}
