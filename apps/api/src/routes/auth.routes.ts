import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import {
  CreateGuestUserSchema,
  RegisterUserSchema,
  LoginUserSchema,
  GoogleAuthSchema,
} from '@taskly/shared-types';

const router: Router = Router();

router.post('/guest', validateBody(CreateGuestUserSchema), AuthController.createGuest);
router.post('/register', validateBody(RegisterUserSchema), AuthController.register);
router.post('/login', validateBody(LoginUserSchema), AuthController.login);
router.post('/google', validateBody(GoogleAuthSchema), AuthController.googleAuth);
router.get('/me', requireAuth, AuthController.getMe);
router.get('/active-users', AuthController.getActiveUsers);
router.post('/logout', AuthController.logout);

export default router;
