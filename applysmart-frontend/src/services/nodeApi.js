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
    return nodeApi.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getAll: () => nodeApi.get('/resume'),
};

// Job Description API
export const jdApi = {
  create: (data) => nodeApi.post('/jd', data),
  getAll: () => nodeApi.get('/jd'),
};

// AI API
export const aiApi = {
  analyze: (data) => nodeApi.post('/ai/analyze', data),
  generateCoverLetter: (data) => nodeApi.post('/ai/cover-letter', data),
  generateFollowUp: (data) => nodeApi.post('/ai/follow-up', data),
};

// Application API
export const applicationApi = {
  create: (data) => nodeApi.post('/application', data),
  getAll: () => nodeApi.get('/application'),
  getOne: (id) => nodeApi.get(`/application/${id}`),
  updateStatus: (id, status) => nodeApi.patch(`/application/${id}/status`, { status }),
  delete: (id) => nodeApi.delete(`/application/${id}`),
  getStats: () => nodeApi.get('/application/stats/summary'),
};

export default nodeApi;