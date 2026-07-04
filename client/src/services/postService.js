import api from '@/lib/axios';

const unwrap = (r) => r.data;

const postService = {
  feed: (page = 1, limit = 10) =>
    api.get('/posts/feed', { params: { page, limit } }).then(unwrap),
  explore: (page = 1, limit = 10) =>
    api.get('/posts/explore', { params: { page, limit } }).then(unwrap),
  bookmarks: (page = 1, limit = 10) =>
    api.get('/posts/bookmarks', { params: { page, limit } }).then(unwrap),
  userPosts: (username, page = 1, limit = 10) =>
    api.get(`/users/${username}/posts`, { params: { page, limit } }).then(unwrap),
  hashtag: (tag, page = 1, limit = 10) =>
    api.get(`/posts/hashtag/${tag}`, { params: { page, limit } }).then(unwrap),
  trending: () => api.get('/posts/trending').then((r) => r.data.data.tags),

  getOne: (id) => api.get(`/posts/${id}`).then((r) => r.data.data.post),

  create: (formData) =>
    api
      .post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((r) => r.data.data.post),
  update: (id, payload) => api.patch(`/posts/${id}`, payload).then((r) => r.data.data.post),
  remove: (id) => api.delete(`/posts/${id}`).then(unwrap),

  like: (id) => api.post(`/posts/${id}/like`).then((r) => r.data.data),
  bookmark: (id) => api.post(`/posts/${id}/bookmark`).then((r) => r.data.data),
  pin: (id) => api.post(`/posts/${id}/pin`).then((r) => r.data.data),
};

export default postService;
