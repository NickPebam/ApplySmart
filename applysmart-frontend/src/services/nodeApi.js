import axios from 'axios';

const NODE_API_URL = import.meta.env.VITE_NODE_URL || 'http://localhost:3000';

const nodeApi = axios.create({
  baseURL: NODE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
nodeApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Resume API
export const resumeApi = {
  upload: async (file) => {
    const formData = new FormData();
    formData.append('resume', file);
    return nodeApi.post('/api/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => nodeApi.get('/api/resume'),
};

// Job Description API
export const jdApi = {
  create: (data) => nodeApi.post('/api/jd', data),
  getAll: () => nodeApi.get('/api/jd'),
};

// AI API
export const aiApi = {
  analyze: (data) => nodeApi.post('/api/ai/analyze', data),
  generateCoverLetter: (data) => nodeApi.post('/api/ai/cover-letter', data),
  generateFollowUp: (data) => nodeApi.post('/api/ai/follow-up', data),
};

// Application API
export const applicationApi = {
  create: (data) => nodeApi.post('/api/application', data),
  getAll: () => nodeApi.get('/api/application'),
  getOne: (id) => nodeApi.get(`/api/application/${id}`),
  updateStatus: (id, status) => nodeApi.patch(`/api/application/${id}/status`, { status }),
  delete: (id) => nodeApi.delete(`/api/application/${id}`),
  getStats: () => nodeApi.get('/api/application/stats/summary'),
};

export default nodeApi;