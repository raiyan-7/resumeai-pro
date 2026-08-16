import { api } from './api';

export const resumeService = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/upload', formData);
  },
  
  list: async () => {
    return api.get('/resumes/');
  },
  
  get: async (id) => {
    return api.get(`/resumes/${id}`);
  },
  
  delete: async (id) => {
    return api.delete(`/resumes/${id}`);
  }
};
