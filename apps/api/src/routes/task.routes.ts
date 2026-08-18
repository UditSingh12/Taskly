import { Router } from 'express';
import { TaskController } from '../controllers/task.controller.js';
import { validateBody, validateQuery } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  CreateTaskSchema,
  UpdateTaskSchema,
  ReorderTasksSchema,
  TaskQueryFilterSchema,
} from '@taskly/shared-types';

import { CommentController } from '../controllers/comment.controller.js';
import { CreateCommentSchema } from '@taskly/shared-types';

const router = Router();

// All task routes require authentication
router.use(requireAuth);

router.get('/', validateQuery(TaskQueryFilterSchema), TaskController.getTasks);
router.post('/', validateBody(CreateTaskSchema), TaskController.createTask);
router.patch('/reorder', validateBody(ReorderTasksSchema), TaskController.reorderTasks);
router.get('/:id', TaskController.getTaskById);
router.patch('/:id', validateBody(UpdateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

router.get('/:taskId/comments', CommentController.getComments);
router.post('/:taskId/comments', validateBody(CreateCommentSchema), CommentController.createComment);

export default router;
