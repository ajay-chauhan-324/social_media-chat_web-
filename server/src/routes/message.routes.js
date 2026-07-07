import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { editMessageSchema, reactMessageSchema } from '../validators/chat.validator.js';

const router = Router();

router.use(protect);

router.patch('/:messageId', validate(editMessageSchema), messageController.editMessage);
router.delete('/:messageId', messageController.deleteMessage);
router.post('/:messageId/pin', messageController.togglePin);
router.post('/:messageId/react', validate(reactMessageSchema), messageController.reactMessage);

export default router;
