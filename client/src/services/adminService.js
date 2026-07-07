import api from '@/lib/axios';

const adminService = {
  stats: () => api.get('/admin/stats').then((r) => r.data.data.stats),
  charts: () => api.get('/admin/charts').then((r) => r.data.data.charts),

  users: (params) => api.get('/admin/users', { params }).then((r) => r.data),
  updateUser: (id, payload) => api.patch(`/admin/users/${id}`, payload).then((r) => r.data.data.user),
  deleteUser: (id) => api.delete(`/admin/users/${id}`).then((r) => r.data),

  posts: (params) => api.get('/admin/posts', { params }).then((r) => r.data),
  deletePost: (id) => api.delete(`/admin/posts/${id}`).then((r) => r.data),

  comments: (params) => api.get('/admin/comments', { params }).then((r) => r.data),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`).then((r) => r.data),

  reports: (params) => api.get('/admin/reports', { params }).then((r) => r.data),
  resolveReport: (id, status) =>
    api.patch(`/admin/reports/${id}`, { status }).then((r) => r.data.data.report),
};

export default adminService;
