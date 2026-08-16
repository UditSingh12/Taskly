import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { UpdateThemeSchema } from '@taskly/shared-types';

const router = Router();

router.patch('/me/theme', requireAuth, validateBody(UpdateThemeSchema), UserController.updateTheme);

export default router;
