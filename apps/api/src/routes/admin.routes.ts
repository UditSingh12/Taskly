import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import { AdminInviteSchema } from '@taskly/shared-types';
import { AppError } from '../utils/AppError.js';

const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') {
        return next(new AppError(403, 'Administrator access required'));
    }
    next();
};

const router: Router = Router();

router.use(requireAuth, requireAdmin);

router.get('/team', AdminController.getTeam);
router.post('/invite', validateBody(AdminInviteSchema), AdminController.generateInvite);
router.delete('/invite/:userId', AdminController.revokeInvite);
router.post('/deactivate/:userId', AdminController.deactivateMember);
router.get('/audit-log', AdminController.getAuditLog);

export default router;
