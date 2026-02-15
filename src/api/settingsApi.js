import api from './axios'; // تأكد من المسار الصحيح لـ axios

// --- إعدادات النظام ---
export const getSystemSettings = async () => {
  const { data } = await api.get('/settings/system');
  return data;
};

export const getClientClassifications = async () => {
  const { data } = await api.get('/classifications/client');
  return data;
};

// --- أغراض الطلب (Request Purposes) ---
export const getRequestPurposes = async (type) => {
  const params = type ? { type } : {};
  const { data } = await api.get('/settings/request-purposes', { params });
  return data;
};

export const createRequestPurpose = async (purposeData) => {
  const { data } = await api.post('/settings/request-purposes', purposeData);
  return data;
};

export const updateRequestPurpose = async (id, purposeData) => {
  const { data } = await api.put(`/settings/request-purposes/${id}`, purposeData);
  return data;
};

export const deleteRequestPurpose = async (id) => {
  await api.delete(`/settings/request-purposes/${id}`);
};

// --- منشئ النماذج (Form Builder) ---
export const getFormDefinition = async (purposeId) => {
  const { data } = await api.get(`/settings/purposes/${purposeId}/form`);
  return data;
};