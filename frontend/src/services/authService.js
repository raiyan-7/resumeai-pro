import { api } from './api';

export const authService = {
  login: async (email, password) => {
    return api.post('/auth/login', { email, password });
  },
  
  signup: async (email, password, fullName) => {
    return api.post('/auth/register', { email, password, full_name: fullName });
  },
  
  me: async () => {
    return api.get('/auth/me');
  },
  
  update: async (data) => {
    return api.put('/auth/me', data);
  }
};
