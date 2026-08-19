import { Router } from 'express';
import { AssignmentRequestController } from '../controllers/assignment-request.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

router.use(requireAuth);

router.patch('/:id', AssignmentRequestController.processRequest);

export default router;
