import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    this.setAuthData(response.data);
    return response.data;
  },

  async login(data) {
    const response = await api.post('/auth/login', data);
    this.setAuthData(response.data);
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      this.clearAuthData();
    }
  },

  async getCurrentUser() {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  setAuthData(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify({
      userId: data.userId,
      name: data.name,
      email: data.email,
      role: data.role,
    }));
  },

  clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem('token');
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};