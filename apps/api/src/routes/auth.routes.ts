import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  LoginUserSchema,
  AcceptInviteSchema,
} from '@taskly/shared-types';

const router: Router = Router();

router.post('/login', validateBody(LoginUserSchema), AuthController.login);
router.post('/accept-invite', validateBody(AcceptInviteSchema), AuthController.acceptInvite);
router.get('/me', requireAuth, AuthController.getMe);
router.get('/active-users', requireAuth, AuthController.getActiveUsers);
router.post('/logout', AuthController.logout);

export default router;
