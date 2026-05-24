import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 600000, 
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. تحديد ما إذا كان الطلب الحالي هو طلب تسجيل دخول
    const isLoginRequest = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/login');

    // 2. التحقق من الخطأ 401 مع استثناء صفحة تسجيل الدخول
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      // لا ننفذ الطرد التلقائي إلا إذا كان المستخدم مسجلاً بالفعل وانتهت صلاحية التوكن الخاص به
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // توجيه فقط إذا لم نكن في صفحة الدخول لمنع الـ Reload اللانهائي
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    // ضروري جداً: نمرر الخطأ كما هو لكي يستطيع الـ Catch في مكون Login.jsx التقاطه وعرضه
    return Promise.reject(error);
  }
);

export default api;