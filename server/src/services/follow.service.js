import mongoose from 'mongoose';
import Follow from '../models/Follow.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';

const CARD_FIELDS = 'name username avatar headline isVerified followersCount';

/** Annotate a list of users with whether the viewer follows each. */
const decorateFollowState = async (users, viewerId) => {
  if (!viewerId || !users.length) return users.map((u) => ({ ...u, isFollowing: false }));
  const ids = users.map((u) => u._id);
  const edges = await Follow.find({ follower: viewerId, following: { $in: ids } }).select('following');
  const set = new Set(edges.map((e) => String(e.following)));
  return users.map((u) => ({ ...u, isFollowing: set.has(String(u._id)) }));
};

export const followUser = async (followerId, username) => {
  const target = await User.findOne({ username }).select('_id');
  if (!target) throw ApiError.notFound('User not found');
  if (String(target._id) === String(followerId)) throw ApiError.badRequest('You cannot follow yourself');

  try {
    await Follow.create({ follower: followerId, following: target._id });
  } catch (err) {
    if (err.code === 11000) return { following: true }; // already following — idempotent
    throw err;
  }
  const [follower] = await Promise.all([
    User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } }).select('name'),
    User.findByIdAndUpdate(target._id, { $inc: { followersCount: 1 } }),
  ]);
  createNotification({
    recipient: target._id,
    actor: followerId,
    type: 'follow',
    text: `${follower?.name || 'Someone'} started following you`,
  }).catch(() => {});
  return { following: true };
};

export const unfollowUser = async (followerId, username) => {
  const target = await User.findOne({ username }).select('_id');
  if (!target) throw ApiError.notFound('User not found');

  const removed = await Follow.findOneAndDelete({ follower: followerId, following: target._id });
  if (removed) {
    await Promise.all([
      User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } }),
      User.findByIdAndUpdate(target._id, { $inc: { followersCount: -1 } }),
    ]);
  }
  return { following: false };
};

export const getFollowers = async (username, viewerId, { skip, limit }) => {
  const user = await User.findOne({ username }).select('_id');
  if (!user) throw ApiError.notFound('User not found');
  const [edges, total] = await Promise.all([
    Follow.find({ following: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('follower', CARD_FIELDS),
    Follow.countDocuments({ following: user._id }),
  ]);
  const users = edges.map((e) => e.follower.toObject());
  return { users: await decorateFollowState(users, viewerId), total };
};

export const getFollowing = async (username, viewerId, { skip, limit }) => {
  const user = await User.findOne({ username }).select('_id');
  if (!user) throw ApiError.notFound('User not found');
  const [edges, total] = await Promise.all([
    Follow.find({ follower: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('following', CARD_FIELDS),
    Follow.countDocuments({ follower: user._id }),
  ]);
  const users = edges.map((e) => e.following.toObject());
  return { users: await decorateFollowState(users, viewerId), total };
};

/** Whether viewer follows the given username (used on profile load). */
export const isFollowing = async (viewerId, targetId) => {
  if (!viewerId) return false;
  const edge = await Follow.exists({ follower: viewerId, following: targetId });
  return Boolean(edge);
};

/** Suggested users the viewer doesn't already follow (simple popularity-based). */
export const getSuggestions = async (viewerId, limit = 5) => {
  const following = await Follow.find({ follower: viewerId }).select('following');
  const excludeIds = [...following.map((f) => f.following), new mongoose.Types.ObjectId(viewerId)];
  const users = await User.find({ _id: { $nin: excludeIds }, isBanned: false })
    .sort({ followersCount: -1, createdAt: -1 })
    .limit(limit)
    .select(CARD_FIELDS)
    .lean();
  return users.map((u) => ({ ...u, isFollowing: false }));
};
