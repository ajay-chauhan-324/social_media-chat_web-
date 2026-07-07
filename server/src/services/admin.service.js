import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Report from '../models/Report.js';
import ApiError from '../utils/ApiError.js';
import { getPagination, buildMeta } from '../utils/pagination.js';
import { getOnlineUserIds } from '../socket/index.js';

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysAgo = (n) => new Date(Date.now() - n * 86400000);

/** Aggregated dashboard statistics. */
export const getStats = async () => {
  const today = startOfToday();
  const weekAgo = daysAgo(7);

  const [
    totalUsers,
    verifiedUsers,
    bannedUsers,
    activeUsers,
    newUsersToday,
    totalPosts,
    postsToday,
    totalComments,
    totalLikes,
    totalConversations,
    totalMessages,
    messagesToday,
    pendingReports,
    totalReports,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ isBanned: true }),
    User.countDocuments({ lastActiveAt: { $gte: weekAgo } }),
    User.countDocuments({ createdAt: { $gte: today } }),
    Post.countDocuments(),
    Post.countDocuments({ createdAt: { $gte: today } }),
    Comment.countDocuments(),
    Like.countDocuments(),
    Conversation.countDocuments(),
    Message.countDocuments(),
    Message.countDocuments({ createdAt: { $gte: today } }),
    Report.countDocuments({ status: 'pending' }),
    Report.countDocuments(),
  ]);

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      banned: bannedUsers,
      active: activeUsers,
      online: getOnlineUserIds().length,
      newToday: newUsersToday,
    },
    content: { posts: totalPosts, postsToday, comments: totalComments, likes: totalLikes },
    chat: { conversations: totalConversations, messages: totalMessages, messagesToday },
    reports: { pending: pendingReports, total: totalReports },
  };
};

/** Time-series data for charts. */
export const getCharts = async () => {
  const twelveMonths = new Date();
  twelveMonths.setMonth(twelveMonths.getMonth() - 11);
  twelveMonths.setDate(1);
  twelveMonths.setHours(0, 0, 0, 0);

  const [userGrowth, postActivity, trendingTags, topUsers, popularPosts] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: twelveMonths } } },
      { $group: { _id: { y: { $year: '$createdAt' }, m: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.y': 1, '_id.m': 1 } },
    ]),
    Post.aggregate([
      { $match: { createdAt: { $gte: daysAgo(13) } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Post.aggregate([
      { $unwind: '$hashtags' },
      { $group: { _id: '$hashtags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]),
    User.find({ isBanned: false })
      .sort({ followersCount: -1, postsCount: -1 })
      .limit(5)
      .select('name username avatar followersCount postsCount isVerified'),
    Post.find()
      .sort({ likesCount: -1 })
      .limit(5)
      .populate('author', 'name username avatar')
      .select('content likesCount commentsCount images author createdAt'),
  ]);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return {
    userGrowth: userGrowth.map((d) => ({ label: `${MONTHS[d._id.m - 1]}`, value: d.count })),
    postActivity: postActivity.map((d) => ({ label: d._id.slice(5), value: d.count })),
    trendingTags,
    topUsers,
    popularPosts,
  };
};

// ── User management ──────────────────────────────────────────────────────
export const listUsers = async (query) => {
  const pg = getPagination(query, { defaultLimit: 12, maxLimit: 50 });
  const filter = {};
  if (query.q) {
    filter.$or = [
      { name: { $regex: query.q, $options: 'i' } },
      { username: { $regex: query.q, $options: 'i' } },
      { email: { $regex: query.q, $options: 'i' } },
    ];
  }
  if (query.status === 'verified') filter.isVerified = true;
  if (query.status === 'banned') filter.isBanned = true;
  if (query.role) filter.role = query.role;

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(pg.skip).limit(pg.limit),
    User.countDocuments(filter),
  ]);
  return { users, meta: buildMeta({ ...pg, total }) };
};

export const updateUser = async (userId, updates) => {
  const allowed = {};
  ['isVerified', 'isBanned', 'role'].forEach((k) => {
    if (updates[k] !== undefined) allowed[k] = updates[k];
  });
  const user = await User.findByIdAndUpdate(userId, allowed, { new: true });
  if (!user) throw ApiError.notFound('User not found');
  return user;
};

export const deleteUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User not found');
  if (user.role === 'admin') throw ApiError.forbidden('Cannot delete an admin account');

  await Promise.all([
    Post.deleteMany({ author: userId }),
    Comment.deleteMany({ author: userId }),
    Like.deleteMany({ user: userId }),
    Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
  ]);
  await user.deleteOne();
  return { id: userId };
};

// ── Post & comment management ────────────────────────────────────────────
export const listPosts = async (query) => {
  const pg = getPagination(query, { defaultLimit: 12, maxLimit: 50 });
  const filter = {};
  if (query.q) filter.content = { $regex: query.q, $options: 'i' };
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate('author', 'name username avatar'),
    Post.countDocuments(filter),
  ]);
  return { posts, meta: buildMeta({ ...pg, total }) };
};

export const listComments = async (query) => {
  const pg = getPagination(query, { defaultLimit: 15, maxLimit: 50 });
  const filter = {};
  if (query.q) filter.content = { $regex: query.q, $options: 'i' };
  const [comments, total] = await Promise.all([
    Comment.find(filter)
      .sort({ createdAt: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate('author', 'name username avatar')
      .populate('post', 'content'),
    Comment.countDocuments(filter),
  ]);
  return { comments, meta: buildMeta({ ...pg, total }) };
};

// ── Reports ──────────────────────────────────────────────────────────────
export const listReports = async (query) => {
  const pg = getPagination(query, { defaultLimit: 15 });
  const filter = {};
  if (query.status) filter.status = query.status;
  const [reports, total] = await Promise.all([
    Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(pg.skip)
      .limit(pg.limit)
      .populate('reporter', 'name username avatar')
      .populate('reviewedBy', 'name username'),
    Report.countDocuments(filter),
  ]);
  return { reports, meta: buildMeta({ ...pg, total }) };
};

export const resolveReport = async (reportId, adminId, status) => {
  const report = await Report.findByIdAndUpdate(
    reportId,
    { status, reviewedBy: adminId },
    { new: true }
  );
  if (!report) throw ApiError.notFound('Report not found');
  return report;
};
