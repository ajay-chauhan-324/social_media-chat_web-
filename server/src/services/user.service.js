import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Bookmark from '../models/Bookmark.js';
import Notification from '../models/Notification.js';
import PushSubscription from '../models/PushSubscription.js';
import AIHistory from '../models/AIHistory.js';
import Token from '../models/Token.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import ApiError from '../utils/ApiError.js';

/**
 * Permanently delete a user's own account and every piece of data owned by
 * or tied to it. Private (1:1) conversations are removed entirely since they
 * can't exist without the other participant's counterpart; group
 * conversations just lose this member so the remaining members keep their
 * history.
 */
export const deleteOwnAccount = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');

  const conversations = await Conversation.find({ 'members.user': userId }).select('_id type');
  const privateIds = conversations.filter((c) => c.type === 'private').map((c) => c._id);
  const groupIds = conversations.filter((c) => c.type === 'group').map((c) => c._id);

  await Promise.all([
    Post.deleteMany({ author: userId }),
    Comment.deleteMany({ author: userId }),
    Like.deleteMany({ user: userId }),
    Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
    Bookmark.deleteMany({ user: userId }),
    Notification.deleteMany({ $or: [{ recipient: userId }, { actor: userId }] }),
    PushSubscription.deleteMany({ user: userId }),
    AIHistory.deleteMany({ user: userId }),
    Token.deleteMany({ user: userId }),
    Message.deleteMany({ conversation: { $in: privateIds } }),
    Conversation.deleteMany({ _id: { $in: privateIds } }),
    Conversation.updateMany({ _id: { $in: groupIds } }, { $pull: { members: { user: userId } } }),
  ]);

  await user.deleteOne();
  return { id: userId };
};
