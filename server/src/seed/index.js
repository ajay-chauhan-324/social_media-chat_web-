/* eslint-disable no-await-in-loop */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import env from '../config/env.js';
import logger from '../utils/logger.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { extractHashtags } from '../utils/text.js';

import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Follow from '../models/Follow.js';
import Bookmark from '../models/Bookmark.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import AIHistory from '../models/AIHistory.js';
import Report from '../models/Report.js';

import {
  FIRST_NAMES, LAST_NAMES, CITIES, ROLES, BIOS, POST_TEMPLATES, COMMENTS,
  CHAT_MESSAGES, GROUP_NAMES, AI_PROMPTS, REPORT_REASONS, REPORT_DETAILS,
} from './data.js';

// ── Random helpers ─────────────────────────────────────────────────────────
const rand = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rand(arr.length)];
const sample = (arr, k) => {
  const copy = [...arr];
  const out = [];
  for (let i = 0; i < k && copy.length; i += 1) out.push(copy.splice(rand(copy.length), 1)[0]);
  return out;
};
const chance = (p) => Math.random() < p;
const between = (min, max) => min + rand(max - min + 1);
const daysAgo = (n) => new Date(Date.now() - n * 86400000);
const randomDateWithin = (days) => daysAgo(Math.random() * days);
const oid = () => new mongoose.Types.ObjectId();

const avatarUrl = (seed) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
const coverUrl = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}-cover/1200/400`;
const postImg = (seed) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/600`;

const TOPICS = Object.keys(POST_TEMPLATES);
const TECH_TAGS = ['react', 'nodejs', 'mongodb', 'javascript', 'typescript', 'python', 'webdev'];

// ── Seed steps ───────────────────────────────────────────────────────────
const wipe = async () => {
  logger.warn('Wiping existing collections…');
  await Promise.all(
    [User, Post, Comment, Like, Follow, Bookmark, Conversation, Message, Notification, AIHistory, Report].map(
      (M) => M.deleteMany({})
    )
  );
  // Drop the tokens collection too (sessions from any prior run).
  await mongoose.connection.collection('tokens').deleteMany({}).catch(() => {});
  // Drop conversations collection so any stale (sparse) pairKey index is rebuilt
  // to match the current schema (partial unique), then re-sync indexes.
  await mongoose.connection.collection('conversations').drop().catch(() => {});
  await Conversation.syncIndexes().catch(() => {});
};

const createUsers = async () => {
  const adminHash = await bcrypt.hash('Admin@123', 12);
  const demoHash = await bcrypt.hash('Password@123', 12);

  const usedUsernames = new Set();
  const makeUsername = (first, last) => {
    let base = `${first}.${last}`.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    let uname = base;
    let n = 1;
    while (usedUsernames.has(uname)) uname = `${base}${n++}`;
    usedUsernames.add(uname);
    return uname;
  };

  const admin = {
    _id: oid(),
    name: 'ArtROOT Admin',
    username: 'admin',
    email: 'admin@artrootchat.com',
    password: adminHash,
    role: 'admin',
    avatar: avatarUrl('admin'),
    cover: coverUrl('admin'),
    headline: 'Platform Administrator',
    bio: 'Keeping ArtROOT Chat safe, fast, and delightful. ⚙️',
    location: 'Bengaluru, Karnataka',
    isVerified: true,
    theme: 'system',
    createdAt: daysAgo(365),
    updatedAt: new Date(),
    lastActiveAt: new Date(),
  };
  usedUsernames.add('admin');

  const users = [admin];
  for (let i = 0; i < 100; i += 1) {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const username = makeUsername(first, last);
    const [city, state] = pick(CITIES);
    const role = pick(ROLES);
    const createdAt = randomDateWithin(360);
    users.push({
      _id: oid(),
      name: `${first} ${last}`,
      username,
      email: `${username}@example.com`,
      password: demoHash,
      role: 'user',
      avatar: avatarUrl(username),
      cover: chance(0.7) ? coverUrl(username) : '',
      headline: role.headline,
      bio: pick(BIOS).replace('{city}', city),
      location: `${city}, ${state}`,
      website: chance(0.4) ? `https://${username}.dev` : '',
      skills: sample(role.skills, between(2, role.skills.length)),
      isVerified: chance(0.18),
      isBanned: false,
      theme: 'system',
      aiScore: between(0, 950),
      createdAt,
      updatedAt: createdAt,
      lastActiveAt: randomDateWithin(14),
    });
  }

  await User.insertMany(users, { timestamps: false });
  logger.success(`Created ${users.length} users (incl. admin)`);
  return users;
};

const createFollows = async (users) => {
  const real = users.filter((u) => u.role === 'user');
  const edges = [];
  const seen = new Set();
  for (const u of users) {
    const count = between(4, 35);
    const targets = sample(
      real.filter((t) => String(t._id) !== String(u._id)),
      count
    );
    for (const t of targets) {
      const key = `${u._id}:${t._id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push({
        _id: oid(),
        follower: u._id,
        following: t._id,
        createdAt: randomDateWithin(300),
        updatedAt: new Date(),
      });
    }
  }
  await Follow.insertMany(edges, { timestamps: false });
  logger.success(`Created ${edges.length} follow relationships`);
  return edges;
};

const createPosts = async (users) => {
  const real = users.filter((u) => !u.isBanned);
  const posts = [];
  const total = between(520, 600);
  for (let i = 0; i < total; i += 1) {
    const author = pick(real);
    const topic = pick(TOPICS);
    let caption = pick(POST_TEMPLATES[topic]);
    caption = caption.replace(/{tag}/g, () => pick(TECH_TAGS));
    const createdAt = randomDateWithin(360);
    const imageCount = chance(0.5) ? between(1, topic === 'photography' || topic === 'travel' ? 3 : 2) : 0;
    const images = Array.from({ length: imageCount }, (_, k) => ({
      url: postImg(`post-${i}-${k}`),
      publicId: '',
    }));
    posts.push({
      _id: oid(),
      author: author._id,
      content: caption,
      images,
      hashtags: extractHashtags(caption),
      mentions: [],
      likesCount: 0,
      commentsCount: 0,
      bookmarksCount: 0,
      sharesCount: between(0, 40),
      isPinned: chance(0.03),
      visibility: 'public',
      status: 'published',
      createdAt,
      updatedAt: createdAt,
    });
  }
  await Post.insertMany(posts, { timestamps: false });
  logger.success(`Created ${posts.length} posts`);
  return posts;
};

const createComments = async (users, posts) => {
  const real = users.filter((u) => !u.isBanned);
  const comments = [];
  const topLevelByPost = new Map();

  const targetTotal = 3200;
  for (let i = 0; i < targetTotal; i += 1) {
    const post = pick(posts);
    const author = pick(real);
    const postDate = new Date(post.createdAt).getTime();
    const createdAt = new Date(postDate + Math.random() * (Date.now() - postDate));

    const tops = topLevelByPost.get(String(post._id)) || [];
    const isReply = tops.length > 0 && chance(0.25);
    const parent = isReply ? pick(tops) : null;

    const c = {
      _id: oid(),
      post: post._id,
      author: author._id,
      content: pick(COMMENTS),
      parent: parent ? parent._id : null,
      likesCount: between(0, 25),
      repliesCount: 0,
      createdAt,
      updatedAt: createdAt,
    };
    comments.push(c);
    if (!parent) {
      if (!topLevelByPost.has(String(post._id))) topLevelByPost.set(String(post._id), []);
      topLevelByPost.get(String(post._id)).push(c);
    } else {
      parent.repliesCount += 1;
    }
  }

  await Comment.insertMany(comments, { timestamps: false });

  // Reconcile counts.
  const commentsByPost = {};
  comments.forEach((c) => {
    commentsByPost[c.post] = (commentsByPost[c.post] || 0) + 1;
  });
  await Post.bulkWrite(
    Object.entries(commentsByPost).map(([postId, count]) => ({
      updateOne: { filter: { _id: postId }, update: { $set: { commentsCount: count } } },
    }))
  );
  const replies = comments.filter((c) => c.parent && c.repliesCount === 0);
  if (replies.length) {
    // repliesCount already tracked on parent objects; persist those.
    const parentUpdates = comments
      .filter((c) => c.repliesCount > 0)
      .map((c) => ({
        updateOne: { filter: { _id: c._id }, update: { $set: { repliesCount: c.repliesCount } } },
      }));
    if (parentUpdates.length) await Comment.bulkWrite(parentUpdates);
  }
  logger.success(`Created ${comments.length} comments (with nested replies)`);
  return comments;
};

const createLikes = async (users, posts) => {
  const allUserIds = users.map((u) => u._id);
  const likes = [];
  // Mark ~8% of posts as "popular" → near-max distinct likers.
  posts.forEach((post, idx) => {
    const popular = idx % 12 === 0;
    const likeCount = popular ? between(60, allUserIds.length - 1) : between(3, 45);
    const likers = sample(allUserIds, Math.min(likeCount, allUserIds.length));
    const postDate = new Date(post.createdAt).getTime();
    likers.forEach((uid) => {
      likes.push({
        _id: oid(),
        user: uid,
        targetType: 'Post',
        target: post._id,
        createdAt: new Date(postDate + Math.random() * (Date.now() - postDate)),
        updatedAt: new Date(),
      });
    });
    post.likesCount = likers.length; // stash for count update
  });

  await Like.insertMany(likes, { timestamps: false });
  await Post.bulkWrite(
    posts.map((p) => ({
      updateOne: { filter: { _id: p._id }, update: { $set: { likesCount: p.likesCount } } },
    }))
  );
  logger.success(`Created ${likes.length} likes`);
  return likes;
};

const createBookmarks = async (users, posts) => {
  const bookmarks = [];
  const seen = new Set();
  for (let i = 0; i < 600; i += 1) {
    const user = pick(users);
    const post = pick(posts);
    const key = `${user._id}:${post._id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    bookmarks.push({
      _id: oid(),
      user: user._id,
      post: post._id,
      createdAt: randomDateWithin(120),
      updatedAt: new Date(),
    });
  }
  await Bookmark.insertMany(bookmarks, { timestamps: false });
  const byPost = {};
  bookmarks.forEach((b) => (byPost[b.post] = (byPost[b.post] || 0) + 1));
  await Post.bulkWrite(
    Object.entries(byPost).map(([postId, count]) => ({
      updateOne: { filter: { _id: postId }, update: { $set: { bookmarksCount: count } } },
    }))
  );
  logger.success(`Created ${bookmarks.length} bookmarks`);
};

const recomputeUserCounts = async (users, follows, posts) => {
  const followers = {};
  const following = {};
  follows.forEach((f) => {
    following[f.follower] = (following[f.follower] || 0) + 1;
    followers[f.following] = (followers[f.following] || 0) + 1;
  });
  const postsCount = {};
  posts.forEach((p) => (postsCount[p.author] = (postsCount[p.author] || 0) + 1));

  await User.bulkWrite(
    users.map((u) => ({
      updateOne: {
        filter: { _id: u._id },
        update: {
          $set: {
            followersCount: followers[u._id] || 0,
            followingCount: following[u._id] || 0,
            postsCount: postsCount[u._id] || 0,
          },
        },
      },
    }))
  );
  logger.success('Recomputed user follower/following/post counts');
};

const createConversations = async (users) => {
  const real = users.filter((u) => u.role === 'user');
  const conversations = [];
  const messages = [];

  const buildMessages = (convId, members, count) => {
    let t = daysAgo(between(5, 40)).getTime();
    const msgs = [];
    for (let i = 0; i < count; i += 1) {
      t += between(1, 240) * 60000; // 1min–4h apart
      const at = new Date(Math.min(t, Date.now()));
      const sender = pick(members);
      const withImage = chance(0.12);
      msgs.push({
        _id: oid(),
        conversation: convId,
        sender,
        type: withImage ? 'image' : 'text',
        content: withImage ? '' : pick(CHAT_MESSAGES),
        images: withImage ? [{ url: postImg(`chat-${convId}-${i}`), publicId: '' }] : [],
        readBy: members,
        isDeleted: false,
        isPinned: i === 0 && chance(0.15),
        createdAt: at,
        updatedAt: at,
      });
    }
    return msgs;
  };

  // Private conversations
  for (let i = 0; i < 45; i += 1) {
    const [a, b] = sample(real, 2);
    const convId = oid();
    const count = between(3, 22);
    const msgs = buildMessages(convId, [a._id, b._id], count);
    const last = msgs[msgs.length - 1];
    messages.push(...msgs);

    // Leave some unread for `a`: set a's lastReadAt before the last few messages.
    const unread = chance(0.5);
    const aRead = unread ? msgs[Math.max(0, count - between(1, 3))].createdAt : last.createdAt;
    conversations.push({
      _id: convId,
      type: 'private',
      pairKey: [String(a._id), String(b._id)].sort().join(':'),
      members: [
        { user: a._id, role: 'member', lastReadAt: aRead, joinedAt: msgs[0].createdAt },
        { user: b._id, role: 'member', lastReadAt: last.createdAt, joinedAt: msgs[0].createdAt },
      ],
      lastMessage: last._id,
      lastMessageAt: last.createdAt,
      createdAt: msgs[0].createdAt,
      updatedAt: last.createdAt,
    });
  }

  // Group conversations
  for (let i = 0; i < GROUP_NAMES.length; i += 1) {
    const memberUsers = sample(real, between(3, 6));
    const convId = oid();
    const count = between(6, 30);
    const memberIds = memberUsers.map((u) => u._id);
    const msgs = buildMessages(convId, memberIds, count);
    const last = msgs[msgs.length - 1];
    messages.push(...msgs);
    conversations.push({
      _id: convId,
      type: 'group',
      name: GROUP_NAMES[i],
      createdBy: memberIds[0],
      members: memberUsers.map((u, idx) => ({
        user: u._id,
        role: idx === 0 ? 'admin' : 'member',
        lastReadAt: chance(0.4) ? msgs[Math.max(0, count - between(1, 4))].createdAt : last.createdAt,
        joinedAt: msgs[0].createdAt,
      })),
      lastMessage: last._id,
      lastMessageAt: last.createdAt,
      createdAt: msgs[0].createdAt,
      updatedAt: last.createdAt,
    });
  }

  await Conversation.insertMany(conversations, { timestamps: false });
  await Message.insertMany(messages, { timestamps: false });
  logger.success(`Created ${conversations.length} conversations, ${messages.length} messages`);
  return { conversations, messages };
};

const createNotifications = async (users, posts, follows) => {
  const notifs = [];
  const types = ['like', 'comment', 'reply', 'follow', 'message'];
  const texts = {
    like: 'liked your post',
    comment: 'commented on your post',
    reply: 'replied to your comment',
    follow: 'started following you',
    message: 'sent you a message',
  };
  for (let i = 0; i < 600; i += 1) {
    const recipient = pick(users);
    const actor = pick(users.filter((u) => String(u._id) !== String(recipient._id)));
    const type = pick(types);
    const post = ['like', 'comment', 'reply'].includes(type) ? pick(posts)._id : null;
    const createdAt = randomDateWithin(30);
    notifs.push({
      _id: oid(),
      recipient: recipient._id,
      actor: actor._id,
      type,
      text: `${actor.name} ${texts[type]}`,
      post,
      read: chance(0.55),
      createdAt,
      updatedAt: createdAt,
    });
  }
  // A few AI/system notifications
  users.slice(0, 20).forEach((u) => {
    const createdAt = randomDateWithin(20);
    notifs.push({
      _id: oid(),
      recipient: u._id,
      type: 'ai',
      text: 'Your AI-generated captions are ready ✨',
      read: chance(0.5),
      createdAt,
      updatedAt: createdAt,
    });
  });
  await Notification.insertMany(notifs, { timestamps: false });
  logger.success(`Created ${notifs.length} notifications`);
};

const createAIHistory = async (users) => {
  const histories = [];
  for (let i = 0; i < 70; i += 1) {
    const user = pick(users);
    const prompt = pick(AI_PROMPTS);
    const createdAt = randomDateWithin(90);
    histories.push({
      _id: oid(),
      user: user._id,
      title: prompt.q.slice(0, 60),
      tool: prompt.tool,
      messages: [
        { role: 'user', content: prompt.q, at: createdAt },
        { role: 'assistant', content: prompt.a, at: new Date(createdAt.getTime() + 4000) },
      ],
      model: env.gemini.model,
      tokens: between(120, 900),
      createdAt,
      updatedAt: createdAt,
    });
  }
  await AIHistory.insertMany(histories, { timestamps: false });
  logger.success(`Created ${histories.length} AI conversations`);
};

const createReports = async (users, posts, comments) => {
  const reports = [];
  for (let i = 0; i < 18; i += 1) {
    const kind = pick(['Post', 'Comment', 'User']);
    const target =
      kind === 'Post' ? pick(posts)._id : kind === 'Comment' ? pick(comments)._id : pick(users)._id;
    const createdAt = randomDateWithin(45);
    reports.push({
      _id: oid(),
      reporter: pick(users)._id,
      targetType: kind,
      target,
      reason: pick(REPORT_REASONS),
      details: pick(REPORT_DETAILS),
      status: pick(['pending', 'pending', 'reviewed', 'resolved', 'dismissed']),
      createdAt,
      updatedAt: createdAt,
    });
  }
  await Report.insertMany(reports, { timestamps: false });

  // Ban a few non-admin users to populate "banned users".
  const bannable = users.filter((u) => u.role === 'user');
  const banned = sample(bannable, 3);
  await User.updateMany({ _id: { $in: banned.map((u) => u._id) } }, { isBanned: true });
  logger.success(`Created ${reports.length} reports; banned ${banned.length} users`);
};

// ── Orchestration ──────────────────────────────────────────────────────────
export const runSeed = async () => {
  const startedConnection = mongoose.connection.readyState !== 1;
  if (startedConnection) await connectDB();

  logger.info('🌱 Seeding ArtROOT Chat demo data…');
  await wipe();

  const users = await createUsers();
  const follows = await createFollows(users);
  const posts = await createPosts(users);
  const comments = await createComments(users, posts);
  await createLikes(users, posts);
  await createBookmarks(users, posts);
  await recomputeUserCounts(users, follows, posts);
  await createConversations(users);
  await createNotifications(users, posts, follows);
  await createAIHistory(users);
  await createReports(users, posts, comments);

  logger.success('✅ Seed complete! Log in as  admin@artrootchat.com / Admin@123');
  logger.info('   Demo users password: Password@123  (e.g. try any @username)');

  if (startedConnection) await disconnectDB();
};

// Run directly via `npm run seed`.
const isDirectRun = process.argv[1] && process.argv[1].includes('seed');
if (isDirectRun) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Seed failed:', err);
      process.exit(1);
    });
}

export default runSeed;
