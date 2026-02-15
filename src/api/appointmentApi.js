import api from './axios';

export const getAppointmentsByTransaction = async (transactionId) => {
  const response = await api.get(`/appointments?transactionId=${transactionId}`);
  return response.data;
};

export const createAppointment = async (data) => {
  const response = await api.post('/appointments', data);
  return response.data;
};

export const deleteAppointment = async (id) => {
  const response = await api.delete(`/appointments/${id}`);
  return response.data;
};