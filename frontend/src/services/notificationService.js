import { api } from './api';

export const notificationService = {
  list: async () => {
    return api.get('/notifications/');
  },
  
  markRead: async (id) => {
    return api.put(`/notifications/${id}/read`);
  },
  
  markAllRead: async () => {
    return api.put('/notifications/read-all');
  },
  
  clearAll: async () => {
    return api.delete('/notifications/');
  }
};
export default notificationService;
