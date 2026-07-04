import api from '@/lib/axios';

const conversationService = {
  list: () => api.get('/conversations').then((r) => r.data.data.conversations),
  getOne: (id) => api.get(`/conversations/${id}`).then((r) => r.data.data.conversation),
  startPrivate: (username) =>
    api.post('/conversations/private', { username }).then((r) => r.data.data.conversation),
  createGroup: (payload) =>
    api.post('/conversations/group', payload).then((r) => r.data.data.conversation),
  markRead: (id) => api.post(`/conversations/${id}/read`).then((r) => r.data.data),
  addMembers: (id, usernames) =>
    api.post(`/conversations/${id}/members`, { usernames }).then((r) => r.data.data.conversation),
  leave: (id) => api.delete(`/conversations/${id}/leave`).then((r) => r.data.data),
  pinned: (id) => api.get(`/conversations/${id}/pinned`).then((r) => r.data.data.messages),
  search: (id, q) =>
    api.get(`/conversations/${id}/search`, { params: { q } }).then((r) => r.data.data.messages),
};

export default conversationService;
