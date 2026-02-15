import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api', // رابط السيرفر الذي بنيناه
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن تلقائياً لكل طلب
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;