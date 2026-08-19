import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { authLimiter } from '../middleware/rate-limit.middleware.js';
import {
  LoginUserSchema,
  AcceptInviteSchema,
  ChangePasswordSchema
} from '@taskly/shared-types';

const router: Router = Router();

router.post('/login', authLimiter, validateBody(LoginUserSchema), AuthController.login);
router.post('/accept-invite', authLimiter, validateBody(AcceptInviteSchema), AuthController.acceptInvite);
router.get('/me', requireAuth, AuthController.getMe);
router.get('/active-users', requireAuth, AuthController.getActiveUsers);
router.put('/change-password', requireAuth, validateBody(ChangePasswordSchema), AuthController.changePassword);
router.post('/logout', AuthController.logout);

export default router;
