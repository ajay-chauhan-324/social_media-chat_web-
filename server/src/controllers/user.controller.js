import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';
import User from '../models/User.js';
import Follow from '../models/Follow.js';
import { isFollowing } from '../services/follow.service.js';
import { deleteOwnAccount } from '../services/user.service.js';
import { clearRefreshCookie } from '../utils/cookies.js';

const EDITABLE_FIELDS = [
  'name',
  'bio',
  'headline',
  'location',
  'website',
  'skills',
  'experience',
  'education',
  'avatar',
  'cover',
  'theme',
];

/** Current authenticated user. */
export const getMe = asyncHandler(async (req, res) =>
  ApiResponse.ok(res, { user: req.user }, 'Current user')
);

/** Update the current user's profile (whitelisted fields only). */
export const updateMe = asyncHandler(async (req, res) => {
  const updates = {};
  for (const key of EDITABLE_FIELDS) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }
  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: true,
  });
  return ApiResponse.ok(res, { user }, 'Profile updated');
});

/** Permanently delete the current user's own account and all owned data. */
export const deleteMe = asyncHandler(async (req, res) => {
  await deleteOwnAccount(req.user.id);
  clearRefreshCookie(res);
  return ApiResponse.ok(res, null, 'Account deleted');
});

/** Public profile by username, with viewer-relative follow state. */
export const getUserByUsername = asyncHandler(async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) throw ApiError.notFound('User not found');

  const profile = user.toObject();
  profile.isFollowing = await isFollowing(req.user?.id, user._id);
  profile.isSelf = req.user ? String(req.user.id) === String(user._id) : false;
  return ApiResponse.ok(res, { user: profile }, 'User profile');
});

/**
 * User search for the search bar & mentions. Case-insensitive match on name,
 * username, or email; excludes the current user and banned accounts; annotates
 * each result with the viewer's follow state.
 */
export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || '').trim();
  const limit = Math.min(Number(req.query.limit) || 12, 25);
  if (!q) return ApiResponse.ok(res, { users: [] }, 'No query');

  // Escape regex metacharacters so a stray "(" etc. can't break the query.
  const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rx = { $regex: safe, $options: 'i' };

  const users = await User.find({
    _id: { $ne: req.user.id },
    isBanned: false,
    $or: [{ name: rx }, { username: rx }, { email: rx }],
  })
    .select('name username avatar headline bio followersCount isVerified')
    .limit(limit)
    .lean();

  // Annotate follow state in one query.
  const ids = users.map((u) => u._id);
  const edges = await Follow.find({ follower: req.user.id, following: { $in: ids } }).select(
    'following'
  );
  const followingSet = new Set(edges.map((e) => String(e.following)));
  const withFollow = users.map((u) => ({ ...u, isFollowing: followingSet.has(String(u._id)) }));

  return ApiResponse.ok(res, { users: withFollow }, 'Search results');
});
