import { api } from './api';

export const interviewService = {
  start: async (jobTitle, difficulty) => {
    return api.post('/interviews/', {
      job_title: jobTitle,
      difficulty: difficulty
    });
  },
  
  list: async () => {
    return api.get('/interviews/');
  },
  
  get: async (id) => {
    return api.get(`/interviews/${id}`);
  },
  
  sendMessage: async (id, content) => {
    return api.post(`/interviews/${id}/message`, { content });
  },
  
  delete: async (id) => {
    return api.delete(`/interviews/${id}`);
  },
  
  getSummary: async (id) => {
    return api.get(`/interviews/${id}/summary`);
  }
};
