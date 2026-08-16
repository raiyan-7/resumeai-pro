import { api } from './api';

export const jobMatchService = {
  match: async (resumeId, jobTitle, jobDescription) => {
    return api.post('/job-matches/', {
      resume_id: resumeId,
      job_title: jobTitle,
      job_description: jobDescription
    });
  },
  
  list: async () => {
    return api.get('/job-matches/');
  },
  
  get: async (id) => {
    return api.get(`/job-matches/${id}`);
  },
  
  delete: async (id) => {
    return api.delete(`/job-matches/${id}`);
  }
};
