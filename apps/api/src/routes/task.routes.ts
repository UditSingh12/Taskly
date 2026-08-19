import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requestAssignmentLimiter } from '../middleware/rate-limit.middleware.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  ReorderTasksSchema,
  TaskQueryFilterSchema,
} from '@taskly/shared-types';

import { CommentController } from '../controllers/comment.controller.js';
import { CreateCommentSchema, CreateAssignmentRequestSchema } from '@taskly/shared-types';
import { AssignmentRequestController } from '../controllers/assignment-request.controller.js';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

router.get('/', validateQuery(TaskQueryFilterSchema), TaskController.getTasks);
router.post('/', validateBody(CreateTaskSchema), TaskController.createTask);
router.patch('/reorder', validateBody(ReorderTasksSchema), TaskController.reorderTasks);
router.get('/:id', TaskController.getTaskById);
router.patch('/:id/claim', TaskController.claimTask);
router.patch('/:id', validateBody(UpdateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

router.post('/:taskId/assignment-requests', requestAssignmentLimiter, validateBody(CreateAssignmentRequestSchema), AssignmentRequestController.createRequest);
router.get('/:taskId/assignment-requests', AssignmentRequestController.getRequestsForTask);

router.get('/:taskId/comments', CommentController.getComments);
router.post('/:taskId/comments', validateBody(CreateCommentSchema), CommentController.createComment);

export default router;
