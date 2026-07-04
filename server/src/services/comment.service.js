import mongoose from 'mongoose';
import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import Like from '../models/Like.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { createNotification } from './notification.service.js';

const AUTHOR_FIELDS = 'name username avatar isVerified';

const decorateComments = async (comments, viewerId) => {
  if (!comments.length) return [];
  let likedSet = new Set();
  if (viewerId) {
    const likes = await Like.find({
      user: viewerId,
      targetType: 'Comment',
      target: { $in: comments.map((c) => c._id) },
    }).select('target');
    likedSet = new Set(likes.map((l) => String(l.target)));
  }
  return comments.map((c) => {
    const obj = c.toObject ? c.toObject() : c;
    obj.isLiked = likedSet.has(String(c._id));
    obj.isAuthor = viewerId ? String(obj.author?._id || obj.author) === String(viewerId) : false;
    return obj;
  });
};

export const addComment = async (postId, authorId, { content, parent = null }) => {
  const post = await Post.findById(postId).select('_id author');
  if (!post) throw ApiError.notFound('Post not found');

  let parentComment = null;
  if (parent) {
    parentComment = await Comment.findById(parent).select('post author');
    if (!parentComment || String(parentComment.post) !== String(postId)) {
      throw ApiError.badRequest('Invalid parent comment');
    }
  }

  const comment = await Comment.create({ post: postId, author: authorId, content, parent });
  await Promise.all([
    Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } }),
    parent ? Comment.findByIdAndUpdate(parent, { $inc: { repliesCount: 1 } }) : Promise.resolve(),
  ]);

  await comment.populate('author', AUTHOR_FIELDS);

  // Notify: reply → parent author; top-level → post author.
  const actor = await User.findById(authorId).select('name');
  const actorName = actor?.name || 'Someone';
  if (parentComment) {
    createNotification({
      recipient: parentComment.author,
      actor: authorId,
      type: 'reply',
      text: `${actorName} replied to your comment`,
      post: postId,
      comment: comment._id,
    }).catch(() => {});
  } else {
    createNotification({
      recipient: post.author,
      actor: authorId,
      type: 'comment',
      text: `${actorName} commented on your post`,
      post: postId,
      comment: comment._id,
    }).catch(() => {});
  }

  const [decorated] = await decorateComments([comment], authorId);
  return decorated;
};

/** Top-level comments for a post (with a small preview of replies count). */
export const getComments = async (postId, viewerId, { skip, limit }) => {
  if (!mongoose.isValidObjectId(postId)) throw ApiError.badRequest('Invalid post id');
  const filter = { post: postId, parent: null };
  const [comments, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('author', AUTHOR_FIELDS),
    Comment.countDocuments(filter),
  ]);
  return { comments: await decorateComments(comments, viewerId), total };
};

/** Replies to a specific comment. */
export const getReplies = async (commentId, viewerId, { skip, limit }) => {
  const filter = { parent: commentId };
  const [replies, total] = await Promise.all([
    Comment.find(filter).sort({ createdAt: 1 }).skip(skip).limit(limit).populate('author', AUTHOR_FIELDS),
    Comment.countDocuments(filter),
  ]);
  return { replies: await decorateComments(replies, viewerId), total };
};

export const updateComment = async (commentId, authorId, content) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (String(comment.author) !== String(authorId)) throw ApiError.forbidden('Not your comment');
  comment.content = content;
  comment.editedAt = new Date();
  await comment.save();
  await comment.populate('author', AUTHOR_FIELDS);
  const [decorated] = await decorateComments([comment], authorId);
  return decorated;
};

export const deleteComment = async (commentId, userId, isAdmin = false) => {
  const comment = await Comment.findById(commentId);
  if (!comment) throw ApiError.notFound('Comment not found');
  if (!isAdmin && String(comment.author) !== String(userId)) {
    throw ApiError.forbidden('Not your comment');
  }

  // Remove replies too, and reconcile counters.
  const replies = await Comment.find({ parent: commentId }).select('_id');
  const replyIds = replies.map((r) => r._id);
  const removedCount = 1 + replyIds.length;

  await Promise.all([
    Comment.deleteMany({ _id: { $in: [commentId, ...replyIds] } }),
    Like.deleteMany({ targetType: 'Comment', target: { $in: [commentId, ...replyIds] } }),
    Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -removedCount } }),
    comment.parent
      ? Comment.findByIdAndUpdate(comment.parent, { $inc: { repliesCount: -1 } })
      : Promise.resolve(),
  ]);
  return { id: commentId, removedCount };
};

export const toggleCommentLike = async (commentId, userId) => {
  const comment = await Comment.findById(commentId).select('_id');
  if (!comment) throw ApiError.notFound('Comment not found');

  const existing = await Like.findOne({ user: userId, targetType: 'Comment', target: commentId });
  if (existing) {
    await existing.deleteOne();
    const updated = await Comment.findByIdAndUpdate(
      commentId,
      { $inc: { likesCount: -1 } },
      { new: true }
    ).select('likesCount');
    return { liked: false, likesCount: Math.max(0, updated.likesCount) };
  }
  await Like.create({ user: userId, targetType: 'Comment', target: commentId });
  const updated = await Comment.findByIdAndUpdate(
    commentId,
    { $inc: { likesCount: 1 } },
    { new: true }
  ).select('likesCount');
  return { liked: true, likesCount: updated.likesCount };
};
