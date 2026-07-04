import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import * as postService from '../services/post.service.js';
import { getPagination, buildMeta } from '../utils/pagination.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost(req.user.id, req.body, req.files || []);
  return ApiResponse.created(res, { post }, 'Post created');
});

export const getFeed = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { posts, total } = await postService.getFeed(req.user.id, pg);
  return ApiResponse.ok(res, { posts }, 'Your feed', buildMeta({ ...pg, total }));
});

export const getExplore = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { posts, total } = await postService.getExplore(req.user?.id, pg);
  return ApiResponse.ok(res, { posts }, 'Explore', buildMeta({ ...pg, total }));
});

export const getPost = asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id, req.user?.id);
  return ApiResponse.ok(res, { post }, 'Post');
});

export const getUserPosts = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { posts, total } = await postService.getUserPosts(
    req.params.username.toLowerCase(),
    req.user?.id,
    pg
  );
  return ApiResponse.ok(res, { posts }, 'User posts', buildMeta({ ...pg, total }));
});

export const getHashtagPosts = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { posts, total } = await postService.getPostsByHashtag(req.params.tag, req.user?.id, pg);
  return ApiResponse.ok(res, { posts }, `#${req.params.tag}`, buildMeta({ ...pg, total }));
});

export const updatePost = asyncHandler(async (req, res) => {
  const post = await postService.updatePost(req.params.id, req.user.id, req.body);
  return ApiResponse.ok(res, { post }, 'Post updated');
});

export const deletePost = asyncHandler(async (req, res) => {
  const data = await postService.deletePost(req.params.id, req.user.id, req.user.role === 'admin');
  return ApiResponse.ok(res, data, 'Post deleted');
});

export const togglePin = asyncHandler(async (req, res) => {
  const data = await postService.togglePin(req.params.id, req.user.id);
  return ApiResponse.ok(res, data, data.isPinned ? 'Post pinned' : 'Post unpinned');
});

export const toggleLike = asyncHandler(async (req, res) => {
  const data = await postService.toggleLike(req.params.id, req.user);
  return ApiResponse.ok(res, data, data.liked ? 'Liked' : 'Unliked');
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const data = await postService.toggleBookmark(req.params.id, req.user.id);
  return ApiResponse.ok(res, data, data.bookmarked ? 'Saved' : 'Removed');
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const pg = getPagination(req.query);
  const { posts, total } = await postService.getBookmarks(req.user.id, pg);
  return ApiResponse.ok(res, { posts }, 'Bookmarks', buildMeta({ ...pg, total }));
});

export const getTrending = asyncHandler(async (req, res) => {
  const tags = await postService.getTrendingHashtags();
  return ApiResponse.ok(res, { tags }, 'Trending hashtags');
});
