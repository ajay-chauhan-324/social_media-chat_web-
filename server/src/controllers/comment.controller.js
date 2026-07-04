import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as commentService from '../services/comment.service.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const addComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.params.postId, req.user.id, req.body);
  return ApiResponse.created(res, { comment }, 'Comment added');
});

export const getComments = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, { defaultLimit: 15 });
  const { comments, total } = await commentService.getComments(req.params.postId, req.user?.id, pg);
  return ApiResponse.ok(res, { comments }, 'Comments', buildMeta({ ...pg, total }));
});

export const getReplies = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query, { defaultLimit: 10 });
  const { replies, total } = await commentService.getReplies(req.params.commentId, req.user?.id, pg);
  return ApiResponse.ok(res, { replies }, 'Replies', buildMeta({ ...pg, total }));
});

export const updateComment = asyncHandler(async (req, res) => {
  const comment = await commentService.updateComment(req.params.commentId, req.user.id, req.body.content);
  return ApiResponse.ok(res, { comment }, 'Comment updated');
});

export const deleteComment = asyncHandler(async (req, res) => {
  const data = await commentService.deleteComment(
    req.params.commentId,
    req.user.id,
    req.user.role === 'admin'
  );
  return ApiResponse.ok(res, data, 'Comment deleted');
});

export const toggleCommentLike = asyncHandler(async (req, res) => {
  const data = await commentService.toggleCommentLike(req.params.commentId, req.user.id);
  return ApiResponse.ok(res, data, data.liked ? 'Liked' : 'Unliked');
});
