import axios from './axios';

export const getDeeds = async (params) => {
  const response = await axios.get('/properties', { params });
  return response.data;
};

export const createDeed = async (data) => {
  const response = await axios.post('/properties', data);
  return response.data;
};

export const getDeedById = async (id) => {
  const response = await axios.get(`/properties/${id}`);
  return response.data;
};

// 👈 الدالة الجديدة للحفظ
export const updateDeed = async ({ id, data }) => {
  const response = await axios.put(`/properties/${id}`, data);
  return response.data;
};

export const analyzeDeedWithAI = async (imageBase64) => {
  const response = await axios.post('/properties/analyze-ai', { imageBase64 });
  return response.data.data;
};