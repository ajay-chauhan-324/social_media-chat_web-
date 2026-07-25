import { Router } from 'express';
import * as convController from '../controllers/conversation.controller.js';
import * as messageController from '../controllers/message.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { uploadArray } from '../middlewares/upload.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import {
  startPrivateSchema,
  createGroupSchema,
  createRoomSchema,
  sendMessageSchema,
  addMembersSchema,
} from '../validators/chat.validator.js';
import { messageLimiter } from '../middlewares/rateLimit.middleware.js';

const router = Router();

router.use(protect); // every chat route requires auth

router.get('/', convController.listConversations);
router.post('/private', validate(startPrivateSchema), convController.startPrivate);
router.post('/group', validate(createGroupSchema), convController.createGroup);

// Public rooms — registered before the '/:id' param routes below so
// 'rooms' is never mistaken for a conversation id.
router.get('/rooms', convController.listPublicRooms);
router.post('/rooms', validate(createRoomSchema), convController.createPublicRoom);
router.post('/rooms/:id/join', convController.joinPublicRoom);

router.get('/:id', convController.getConversation);
router.post('/:id/read', convController.markRead);
router.post('/:id/members', validate(addMembersSchema), convController.addMembers);
router.delete('/:id/leave', convController.leaveGroup);
router.delete('/:id', convController.deleteConversation);

// Messages within a conversation
router.get('/:id/messages', messageController.getMessages);
router.post(
  '/:id/messages',
  messageLimiter,
  uploadArray('images', 4),
  validate(sendMessageSchema),
  messageController.sendMessage
);
router.get('/:id/pinned', messageController.getPinned);
router.get('/:id/search', messageController.searchMessages);

export default router;
