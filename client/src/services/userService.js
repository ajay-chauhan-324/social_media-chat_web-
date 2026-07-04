import api from '@/lib/axios';

const userService = {
  getProfile: (username) => api.get(`/users/${username}`).then((r) => r.data.data.user),
  updateMe: (payload) => api.patch('/users/me', payload).then((r) => r.data.data.user),
  search: (q) => api.get('/users/search', { params: { q } }).then((r) => r.data.data.users),
  suggestions: (limit = 5) =>
    api.get('/users/suggestions', { params: { limit } }).then((r) => r.data.data.users),
  followers: (username, page = 1) =>
    api.get(`/users/${username}/followers`, { params: { page } }).then((r) => r.data),
  following: (username, page = 1) =>
    api.get(`/users/${username}/following`, { params: { page } }).then((r) => r.data),
  follow: (username) => api.post(`/users/${username}/follow`).then((r) => r.data.data),
  unfollow: (username) => api.delete(`/users/${username}/follow`).then((r) => r.data.data),
};

export default userService;
