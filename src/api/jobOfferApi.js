import api from './axios';

// جلب جميع العروض الوظيفية
export const getAllJobOffers = async () => {
  const response = await api.get('/hr/job-offers');
  return response.data;
};

// جلب تفاصيل عرض وظيفي محدد
export const getJobOfferById = async (id) => {
  const response = await api.get(`/hr/job-offers/${id}`);
  return response.data;
};

// إنشاء عرض وظيفي جديد (نستخدم FormData لوجود ملفات)
export const createJobOffer = async (formData) => {
  const response = await api.post('/hr/job-offers', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// تسجيل قبول الموظف ورفع الملف الموقع
export const acceptJobOffer = async (id, formData) => {
  const response = await api.post(`/hr/job-offers/${id}/accept`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const generateJobOfferPdf = async (offerData) => {
  const response = await api.post('/hr/job-offers/generate-pdf', offerData, {
    responseType: 'blob', // ضروري جداً لاستقبال الملف
  });
  return response.data;
};