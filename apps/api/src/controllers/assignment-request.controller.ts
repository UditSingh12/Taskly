import { Response } from 'express';
import { asyncHandler } from '../utils/AppError.js';
import { AssignmentRequestService } from '../services/assignment-request.service.js';
import { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AssignmentRequestController {
  static createRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const request = await AssignmentRequestService.createRequest(req.user!._id.toString(), req.params.taskId);
    res.status(201).json({ request });
  });

  static getRequestsForTask = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const requests = await AssignmentRequestService.getRequestsForTask(req.params.taskId);
    res.status(200).json({ requests });
  });

  static processRequest = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { approve } = req.body;
    const request = await AssignmentRequestService.processRequest(req.user!._id.toString(), req.params.id, approve);
    res.status(200).json({ request });
  });
}
