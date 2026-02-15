import api from './axios';

export const getAttachments = async (transactionId) => {
  const response = await api.get(`/transactions/${transactionId}/attachments`); // تأكد من مسار الباك اند
  // أو إذا كان لديك مسار عام: api.get('/attachments', { params: { transactionId } })
  return response.data;
};

export const uploadAttachment = async (file, transactionId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('transactionId', transactionId);
  
  const response = await api.post('/attachments/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAttachment = async (id) => {
  const response = await api.delete(`/attachments/${id}`);
  return response.data;
};