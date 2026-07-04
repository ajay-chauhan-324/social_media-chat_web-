import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import * as commentController from '../controllers/comment.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { uploadArray } from '../middlewares/upload.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { createPostSchema, updatePostSchema } from '../validators/post.validator.js';
import { createCommentSchema } from '../validators/comment.validator.js';

const router = Router();

// Collections & discovery
router.get('/feed', protect, postController.getFeed);
router.get('/explore', optionalAuth, postController.getExplore);
router.get('/bookmarks', protect, postController.getBookmarks);
router.get('/trending', optionalAuth, postController.getTrending);
router.get('/hashtag/:tag', optionalAuth, postController.getHashtagPosts);

// Create
router.post(
  '/',
  protect,
  uploadArray('images', 4),
  validate(createPostSchema),
  postController.createPost
);

// Single post
router.get('/:id', optionalAuth, postController.getPost);
router.patch('/:id', protect, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', protect, postController.deletePost);
router.post('/:id/pin', protect, postController.togglePin);
router.post('/:id/like', protect, postController.toggleLike);
router.post('/:id/bookmark', protect, postController.toggleBookmark);

// Comments nested under a post
router.get('/:postId/comments', optionalAuth, commentController.getComments);
router.post(
  '/:postId/comments',
  protect,
  validate(createCommentSchema),
  commentController.addComment
);

export default router;
