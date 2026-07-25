import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import * as followController from '../controllers/follow.controller.js';
import * as postController from '../controllers/post.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Current user
router.get('/me', protect, userController.getMe);
router.patch('/me', protect, userController.updateMe);
router.delete('/me', protect, userController.deleteMe);

// Discovery (must precede the /:username catch-all)
router.get('/search', protect, userController.searchUsers);
router.get('/suggestions', protect, followController.suggestions);

// Public profile & their content
router.get('/:username', optionalAuth, userController.getUserByUsername);
router.get('/:username/posts', optionalAuth, postController.getUserPosts);
router.get('/:username/followers', optionalAuth, followController.followers);
router.get('/:username/following', optionalAuth, followController.following);

// Follow actions
router.post('/:username/follow', protect, followController.follow);
router.delete('/:username/follow', protect, followController.unfollow);

export default router;
