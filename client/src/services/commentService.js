import api from '@/lib/axios';

const commentService = {
  list: (postId, page = 1, limit = 15) =>
    api.get(`/posts/${postId}/comments`, { params: { page, limit } }).then((r) => r.data),
  replies: (commentId, page = 1, limit = 10) =>
    api.get(`/comments/${commentId}/replies`, { params: { page, limit } }).then((r) => r.data),
  add: (postId, payload) =>
    api.post(`/posts/${postId}/comments`, payload).then((r) => r.data.data.comment),
  update: (commentId, content) =>
    api.patch(`/comments/${commentId}`, { content }).then((r) => r.data.data.comment),
  remove: (commentId) => api.delete(`/comments/${commentId}`).then((r) => r.data.data),
  like: (commentId) => api.post(`/comments/${commentId}/like`).then((r) => r.data.data),
};

export default commentService;
