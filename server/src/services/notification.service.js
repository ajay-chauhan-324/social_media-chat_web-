import Notification from '../models/Notification.js';
import { emitToUser } from '../socket/index.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

const ACTOR_FIELDS = 'name username avatar isVerified';

/**
 * Create a notification and push it to the recipient in realtime.
 * No-op when the actor is the recipient (don't notify yourself).
 */
export const createNotification = async ({ recipient, actor, type, text, post, comment, conversation }) => {
  if (actor && String(recipient) === String(actor)) return null;
  const notification = await Notification.create({
    recipient,
    actor,
    type,
    text,
    post,
    comment,
    conversation,
  });
  const populated = await Notification.findById(notification._id).populate('actor', ACTOR_FIELDS);
  emitToUser(recipient, 'notification:new', { notification: populated });
  return populated;
};

export const listNotifications = async (userId, query) => {
  const pg = getPagination(query, { defaultLimit: 20 });
  const [notifications, total, unread] = await Promise.all([
    Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate('actor', ACTOR_FIELDS)
      .populate('post', 'content images'),
    Notification.countDocuments({ recipient: userId }),
    Notification.countDocuments({ recipient: userId, read: false }),
  ]);
  return { notifications, unread, meta: buildMeta({ ...pg, total }) };
};

export const unreadCount = (userId) =>
  Notification.countDocuments({ recipient: userId, read: false });

export const markAllRead = (userId) =>
  Notification.updateMany({ recipient: userId, read: false }, { read: true });

export const markRead = (id, userId) =>
  Notification.findOneAndUpdate({ _id: id, recipient: userId }, { read: true }, { new: true });
