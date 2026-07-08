import api from '@/lib/axios';

const pushService = {
  publicKey: () => api.get('/push/public-key').then((r) => r.data.data.publicKey),
  subscribe: (subscription) =>
    api.post('/push/subscribe', { subscription }).then((r) => r.data.data),
  unsubscribe: (endpoint) => api.post('/push/unsubscribe', { endpoint }).then((r) => r.data.data),
};

export default pushService;
