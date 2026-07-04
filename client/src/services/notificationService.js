import api from '@/lib/axios';

const notificationService = {
  list: (page = 1) => api.get('/notifications', { params: { page } }).then((r) => r.data),
  unreadCount: () => api.get('/notifications/unread-count').then((r) => r.data.data.count),
  markAllRead: () => api.post('/notifications/read-all').then((r) => r.data),
  markRead: (id) => api.post(`/notifications/${id}/read`).then((r) => r.data),
};

export default notificationService;
