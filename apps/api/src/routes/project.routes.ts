import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { CreateProjectSchema, UpdateProjectSchema } from '@taskly/shared-types';

const router: Router = Router();

router.use(requireAuth);

router.get('/', ProjectController.getProjects);
router.post('/', validateBody(CreateProjectSchema), ProjectController.createProject);
router.get('/:id', ProjectController.getProjectById);
router.patch('/:id', validateBody(UpdateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

router.post('/:id/request-access', ProjectController.requestAccess);
router.post('/:id/members', ProjectController.addMember);
router.delete('/:id/members/:userId', ProjectController.removeMember);

export default router;
