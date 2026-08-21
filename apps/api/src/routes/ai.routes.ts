import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { aiParserLimiter } from '../middleware/rate-limit.middleware.js';
import { AiController } from '../controllers/ai.controller.js';

const router = Router();

router.use(requireAuth);

router.post('/parse-task', aiParserLimiter, AiController.parseTask);
router.get('/greeting', AiController.generateGreeting);

export default router;
