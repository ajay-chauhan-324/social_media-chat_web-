import api from '@/lib/axios';

const messageService = {
  history: (conversationId, page = 1, limit = 30) =>
    api.get(`/conversations/${conversationId}/messages`, { params: { page, limit } }).then((r) => r.data),
  send: (conversationId, formData) =>
    api
      .post(`/conversations/${conversationId}/messages`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((r) => r.data.data.message),
  edit: (messageId, content) =>
    api.patch(`/messages/${messageId}`, { content }).then((r) => r.data.data.message),
  remove: (messageId) => api.delete(`/messages/${messageId}`).then((r) => r.data.data),
  pin: (messageId) => api.post(`/messages/${messageId}/pin`).then((r) => r.data.data.message),
};

export default messageService;
