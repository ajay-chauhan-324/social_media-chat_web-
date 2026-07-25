import api from '@/lib/axios';

const aiService = {
  tools: () => api.get('/ai/tools').then((r) => r.data.data),
  chat: (payload) => api.post('/ai/chat', payload).then((r) => r.data.data.conversation),
  confirmAction: (payload) => api.post('/ai/chat/confirm', payload).then((r) => r.data.data.conversation),
  runTool: (payload) => api.post('/ai/tool', payload).then((r) => r.data.data.content),
  history: (params) => api.get('/ai/history', { params }).then((r) => r.data),
  conversation: (id) => api.get(`/ai/history/${id}`).then((r) => r.data.data.conversation),
  deleteConversation: (id) => api.delete(`/ai/history/${id}`).then((r) => r.data),
  clearHistory: () => api.delete('/ai/history').then((r) => r.data),
};

export default aiService;
