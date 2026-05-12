import axios from "axios";

// 1. --- الإعدادات الأساسية ---
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const api = axios.create({
  baseURL: API_URL,
});

// 2. --- معترض الطلبات (Request Interceptor) ---
// (هذا يضيف الـ Access Token لكل طلب)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // (لاحظ: قمنا بإزالة "Bearer " من الـ Backend، لذا نحن نضيفه هنا)
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. --- 💡 الحل الكامل لمعالجة تحديث التوكن (Response Interceptor) ---
// (هذا الكود يعالج انتهاء الصلاحية وحالات السباق)

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // أي رد ناجح يمر من هنا
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isLoginEndpoint =
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/login");

    // إذا كان الخطأ 401 (Unauthorized) ولم يكن هذا الطلب هو طلب إعادة المحاولة
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isLoginRequest
    ) {
      if (isRefreshing) {
        // إذا كان هناك عملية تحديث جارية، أضف الطلب إلى قائمة الانتظار
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = "Bearer " + token;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // هذا هو الطلب الأول، ابدأ عملية التحديث
      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise(async (resolve, reject) => {
        try {
          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) {
            throw new Error("No refresh token available");
          }

          console.log("Access token expired. Refreshing token...");

          // اطلب access token جديد باستخدام الـ refresh token
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: refreshToken,
          });

          // تم النجاح، خزّن الـ token الجديد
          const newAccessToken = data.accessToken; // (يجب أن يكون بدون "Bearer ")
          localStorage.setItem("token", newAccessToken);

          // حدّث الـ header في الطلب الأصلي
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;

          // (نفّذ جميع الطلبات في قائمة الانتظار)
          processQueue(null, newAccessToken);

          // أعد إرسال الطلب الأصلي
          resolve(api(originalRequest));
        } catch (refreshError) {
          // إذا فشل الـ refresh token (انتهت صلاحيته أو غير صالح)
          console.error(
            "Refresh token failed or expired. Logging out.",
            refreshError,
          );

          // (ارفض جميع الطلبات في قائمة الانتظار)
          processQueue(refreshError, null);

          // قم بتسجيل الخروج بالكامل
          if (window.location.pathname !== '/login') {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }

          reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      });
    }

    // لأي أخطاء أخرى غير 401
    return Promise.reject(error);
  },
);

export default api;
