import api from './axios';

export const getDocumentTypes = async (search = "") => {
  const response = await api.get('/document-types', { params: { search } });
  return response.data;
};

export const createDocumentType = async (data) => {
  const response = await api.post('/document-types', data);
  return response.data;
};