import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { protect, authorize } from '../middlewares/auth.middleware.js';

const router = Router();

// Every admin route requires an authenticated admin.
router.use(protect, authorize('admin'));

router.get('/stats', adminController.getStats);
router.get('/charts', adminController.getCharts);

router.get('/users', adminController.listUsers);
router.patch('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

router.get('/posts', adminController.listPosts);
router.delete('/posts/:id', adminController.deletePost);

router.get('/comments', adminController.listComments);
router.delete('/comments/:id', adminController.deleteComment);

router.get('/reports', adminController.listReports);
router.patch('/reports/:id', adminController.resolveReport);

export default router;
