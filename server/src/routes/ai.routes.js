import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { aiLimiter } from '../middlewares/rateLimit.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { chatSchema, toolSchema, confirmSchema } from '../validators/ai.validator.js';

const router = Router();

router.use(protect);

router.get('/tools', aiController.getTools);
router.post('/chat', aiLimiter, validate(chatSchema), aiController.chat);
router.post('/chat/confirm', aiLimiter, validate(confirmSchema), aiController.confirmAction);
router.post('/tool', aiLimiter, validate(toolSchema), aiController.runTool);

router.get('/history', aiController.listHistory);
router.get('/history/:id', aiController.getConversation);
router.delete('/history/:id', aiController.deleteConversation);
router.delete('/history', aiController.clearHistory);

export default router;
