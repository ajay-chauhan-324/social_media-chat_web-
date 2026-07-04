import mongoose from 'mongoose';
import Post from '../models/Post.js';
import User from '../models/User.js';
import Like from '../models/Like.js';
import Bookmark from '../models/Bookmark.js';
import Follow from '../models/Follow.js';
import Comment from '../models/Comment.js';
import ApiError from '../utils/ApiError.js';
import { extractHashtags, extractMentions } from '../utils/text.js';
import { uploadImages, destroyImage } from './upload.service.js';
import { createNotification } from './notification.service.js';

const AUTHOR_FIELDS = 'name username avatar headline isVerified';

/**
 * Attach viewer-specific flags (isLiked / isBookmarked / isAuthor) to a set of
 * posts in a constant number of queries.
 */
const decoratePosts = async (posts, viewerId) => {
  if (!posts.length) return [];
  const ids = posts.map((p) => p._id);

  let likedSet = new Set();
  let bookmarkedSet = new Set();
  if (viewerId) {
    const [likes, bookmarks] = await Promise.all([
      Like.find({ user: viewerId, targetType: 'Post', target: { $in: ids } }).select('target'),
      Bookmark.find({ user: viewerId, post: { $in: ids } }).select('post'),
    ]);
    likedSet = new Set(likes.map((l) => String(l.target)));
    bookmarkedSet = new Set(bookmarks.map((b) => String(b.post)));
  }

  return posts.map((p) => {
    const obj = p.toObject ? p.toObject() : p;
    obj.isLiked = likedSet.has(String(p._id));
    obj.isBookmarked = bookmarkedSet.has(String(p._id));
    obj.isAuthor = viewerId ? String(obj.author?._id || obj.author) === String(viewerId) : false;
    return obj;
  });
};

const decoratePost = async (post, viewerId) => (await decoratePosts([post], viewerId))[0];

const resolveMentions = async (content) => {
  const usernames = extractMentions(content);
  if (!usernames.length) return [];
  const users = await User.find({ username: { $in: usernames } }).select('_id');
  return users.map((u) => u._id);
};

export const createPost = async (authorId, { content = '', visibility, status }, files = []) => {
  const images = files.length ? await uploadImages(files, 'posts') : [];
  const post = await Post.create({
    author: authorId,
    content,
    images,
    hashtags: extractHashtags(content),
    mentions: await resolveMentions(content),
    visibility,
    status: status || 'published',
  });

  if (post.status === 'published') {
    await User.findByIdAndUpdate(authorId, { $inc: { postsCount: 1 } });
  }
  await post.populate('author', AUTHOR_FIELDS);
  return decoratePost(post, authorId);
};

export const getPostById = async (postId, viewerId) => {
  if (!mongoose.isValidObjectId(postId)) throw ApiError.badRequest('Invalid post id');
  const post = await Post.findById(postId).populate('author', AUTHOR_FIELDS);
  if (!post) throw ApiError.notFound('Post not found');
  return decoratePost(post, viewerId);
};

const listPosts = async (filter, { skip, limit }, viewerId) => {
  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', AUTHOR_FIELDS),
    Post.countDocuments(filter),
  ]);
  return { posts: await decoratePosts(posts, viewerId), total };
};

/**
 * Personalized feed: posts by people the viewer follows + their own.
 * Falls back to public explore posts when the personalized feed is empty
 * (e.g. brand-new users following nobody) so Home is never blank.
 */
export const getFeed = async (viewerId, pagination) => {
  const following = await Follow.find({ follower: viewerId }).select('following');
  const authorIds = [...following.map((f) => f.following), viewerId];
  const result = await listPosts(
    { author: { $in: authorIds }, status: 'published' },
    pagination,
    viewerId
  );
  if (result.total === 0) {
    const explore = await getExplore(viewerId, pagination);
    return { ...explore, fallback: 'explore' };
  }
  return result;
};

/** Explore: all public published posts, newest first. */
export const getExplore = (viewerId, pagination) =>
  listPosts({ status: 'published', visibility: 'public' }, pagination, viewerId);

/** A single user's published posts (drafts only visible to the owner). */
export const getUserPosts = async (username, viewerId, pagination) => {
  const user = await User.findOne({ username }).select('_id');
  if (!user) throw ApiError.notFound('User not found');
  const filter = { author: user._id, status: 'published' };
  if (viewerId && String(user._id) === String(viewerId)) delete filter.status;
  return listPosts(filter, pagination, viewerId);
};

/** Posts for a hashtag. */
export const getPostsByHashtag = (tag, viewerId, pagination) =>
  listPosts({ hashtags: tag.toLowerCase(), status: 'published' }, pagination, viewerId);

export const updatePost = async (postId, authorId, { content, visibility }) => {
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (String(post.author) !== String(authorId)) throw ApiError.forbidden('Not your post');

  if (content !== undefined) {
    post.content = content;
    post.hashtags = extractHashtags(content);
    post.mentions = await resolveMentions(content);
  }
  if (visibility !== undefined) post.visibility = visibility;
  post.editedAt = new Date();
  await post.save();
  await post.populate('author', AUTHOR_FIELDS);
  return decoratePost(post, authorId);
};

export const deletePost = async (postId, userId, isAdmin = false) => {
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (!isAdmin && String(post.author) !== String(userId)) {
    throw ApiError.forbidden('Not your post');
  }

  await Promise.all(post.images.map((img) => destroyImage(img.publicId)));
  await Promise.all([
    Comment.deleteMany({ post: post._id }),
    Like.deleteMany({ targetType: 'Post', target: post._id }),
    Bookmark.deleteMany({ post: post._id }),
  ]);
  await post.deleteOne();
  if (post.status === 'published') {
    await User.findByIdAndUpdate(post.author, { $inc: { postsCount: -1 } });
  }
  return { id: postId };
};

export const togglePin = async (postId, authorId) => {
  const post = await Post.findById(postId);
  if (!post) throw ApiError.notFound('Post not found');
  if (String(post.author) !== String(authorId)) throw ApiError.forbidden('Not your post');
  post.isPinned = !post.isPinned;
  await post.save();
  return { id: postId, isPinned: post.isPinned };
};

/** Toggle like on a post. Returns the new state + count. */
export const toggleLike = async (postId, user) => {
  const userId = user.id || user;
  const post = await Post.findById(postId).select('_id author likesCount');
  if (!post) throw ApiError.notFound('Post not found');

  const existing = await Like.findOne({ user: userId, targetType: 'Post', target: postId });
  if (existing) {
    await existing.deleteOne();
    const updated = await Post.findByIdAndUpdate(
      postId,
      { $inc: { likesCount: -1 } },
      { new: true }
    ).select('likesCount');
    return { liked: false, likesCount: Math.max(0, updated.likesCount) };
  }

  await Like.create({ user: userId, targetType: 'Post', target: postId });
  const updated = await Post.findByIdAndUpdate(
    postId,
    { $inc: { likesCount: 1 } },
    { new: true }
  ).select('likesCount');

  createNotification({
    recipient: post.author,
    actor: userId,
    type: 'like',
    text: `${user.name || 'Someone'} liked your post`,
    post: postId,
  }).catch(() => {});

  return { liked: true, likesCount: updated.likesCount };
};

export const toggleBookmark = async (postId, userId) => {
  const post = await Post.findById(postId).select('_id');
  if (!post) throw ApiError.notFound('Post not found');

  const existing = await Bookmark.findOne({ user: userId, post: postId });
  if (existing) {
    await existing.deleteOne();
    await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: -1 } });
    return { bookmarked: false };
  }
  await Bookmark.create({ user: userId, post: postId });
  await Post.findByIdAndUpdate(postId, { $inc: { bookmarksCount: 1 } });
  return { bookmarked: true };
};

export const getBookmarks = async (userId, { skip, limit }) => {
  const [bookmarks, total] = await Promise.all([
    Bookmark.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({ path: 'post', populate: { path: 'author', select: AUTHOR_FIELDS } }),
    Bookmark.countDocuments({ user: userId }),
  ]);
  const posts = bookmarks.map((b) => b.post).filter(Boolean);
  return { posts: await decoratePosts(posts, userId), total };
};

/** Trending hashtags over the last N days. */
export const getTrendingHashtags = async (days = 7, limit = 10) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return Post.aggregate([
    { $match: { createdAt: { $gte: since }, status: 'published' } },
    { $unwind: '$hashtags' },
    { $group: { _id: '$hashtags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: limit },
    { $project: { _id: 0, tag: '$_id', count: 1 } },
  ]);
};
