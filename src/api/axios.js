import axios from 'axios';

// 1. تحديد الرابط ديناميكياً
// في السيرفر سيقرأ: http://95.216.73.243/api
// في جهازك سيقرأ: http://localhost:5001/api
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // مهلة الانتظار (اختياري لكن مفيد للطلبات الطويلة مثل الذكاء الاصطناعي)
  timeout: 600000, // 10 دقائق
});

// 2. إضافة التوكن تلقائياً لكل طلب (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. (إضافة احترافية) معالجة انتهاء الجلسة (Response Interceptor)
// إذا رد السيرفر بـ 401 (غير مصرح)، نقوم بتسجيل الخروج فوراً
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // التوكن انتهى أو غير صالح -> تنظيف وطرد المستخدم
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // توجيه لصفحة الدخول (تغيير الرابط حسب الراوتر لديك)
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;