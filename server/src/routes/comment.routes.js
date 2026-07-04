import { Router } from 'express';
import * as commentController from '../controllers/comment.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updateCommentSchema } from '../validators/comment.validator.js';

const router = Router();

router.get('/:commentId/replies', optionalAuth, commentController.getReplies);
router.patch('/:commentId', protect, validate(updateCommentSchema), commentController.updateComment);
router.delete('/:commentId', protect, commentController.deleteComment);
router.post('/:commentId/like', protect, commentController.toggleCommentLike);

export default router;
