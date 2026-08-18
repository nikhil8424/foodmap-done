import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token if saved in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('foodmap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const foodApi = {
  getFoods: (params = {}) => api.get('/foods', { params }).then((r) => r.data),
  getFoodById: (id) => api.get(`/foods/${id}`).then((r) => r.data),
  createFood: (data) => api.post('/foods', data).then((r) => r.data),
  updateFood: (id, data) => api.put(`/foods/${id}`, data).then((r) => r.data),
  deleteFood: (id) => api.delete(`/foods/${id}`).then((r) => r.data)
};

export const vendorApi = {
  getVendors: (params = {}) => api.get('/vendors', { params }).then((r) => r.data),
  getVendorById: (id) => api.get(`/vendors/${id}`).then((r) => r.data),
  updateVendor: (id, data) => api.put(`/vendors/${id}`, data).then((r) => r.data)
};

export const orderApi = {
  getOrders: (params = {}) => api.get('/orders', { params }).then((r) => r.data),
  getOrderById: (id) => api.get(`/orders/${id}`).then((r) => r.data),
  createOrder: (data) => api.post('/orders', data).then((r) => r.data),
  updateStatus: (id, status, note = '') => api.put(`/orders/${id}/status`, { status, note }).then((r) => r.data)
};

export const authApi = {
  requestOtp: (phone) => api.post('/auth/request-otp', { phone }).then((r) => r.data),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload).then((r) => r.data),
  getCurrentUser: () => api.get('/auth/me').then((r) => r.data),
  updateProfile: (data) => api.put('/auth/profile', data).then((r) => r.data)
};

export default api;
