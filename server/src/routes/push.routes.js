import { Router } from 'express';
import * as pushController from '../controllers/push.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/public-key', pushController.getPublicKey); // public — needed before login-gated subscribe
router.post('/subscribe', protect, pushController.subscribe);
router.post('/unsubscribe', protect, pushController.unsubscribe);

export default router;
