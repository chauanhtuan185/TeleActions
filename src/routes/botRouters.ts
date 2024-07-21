import { Router } from 'express';
import { handleBotRequest } from '../controllers/botController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/request', authMiddleware, handleBotRequest);

export default router;