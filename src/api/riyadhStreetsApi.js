import api from './axios';

const BASE_URL = '/riyadh-streets';

// جلب الشوارع مع الفلاتر
export const getAllStreets = async (filters = {}) => {
  try {
    const { data } = await api.get(BASE_URL, { params: filters });
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في جلب بيانات الشوارع');
  }
};

// إنشاء شارع جديد
export const createStreet = async (payload) => {
  try {
    const { data } = await api.post(BASE_URL, payload);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في إضافة الشارع');
  }
};

// جلب القوائم المساعدة (قطاعات وأحياء)
export const getLookups = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/lookups`);
    return data;
  } catch (error) {
    throw new Error('فشل في جلب القوائم');
  }
};

// جلب الإحصائيات
export const getStatistics = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/stats`);
    return data;
  } catch (error) {
    throw new Error('فشل في جلب الإحصائيات');
  }
};