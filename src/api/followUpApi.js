import api from './axios'; // تأكد من أن هذا المسار يشير إلى إعدادات axios لديك

const BASE_URL = '/followup';

// ============================================================
// 1. إدارة المعقبين (Agents)
// ============================================================

export const getAllAgents = async (type = 'all', status = 'all') => {
  try {
    const { data } = await api.get(`${BASE_URL}/agents`, {
      params: { type, status }
    });
    return data;
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw new Error(error.response?.data?.message || 'فشل في جلب المعقبين');
  }
};

export const getAgentById = async (id) => {
  try {
    const { data } = await api.get(`${BASE_URL}/agents/${id}`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في جلب تفاصيل المعقب');
  }
};

export const createAgent = async (agentData) => {
  try {
    const { data } = await api.post(`${BASE_URL}/agents`, agentData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في إضافة المعقب');
  }
};

export const updateAgent = async (id, updates) => {
  try {
    const { data } = await api.put(`${BASE_URL}/agents/${id}`, updates);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في تحديث بيانات المعقب');
  }
};

// ============================================================
// 2. إدارة المهام (Tasks)
// ============================================================

export const getAllTasks = async () => {
  try {
    const { data } = await api.get(`${BASE_URL}/tasks`);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في جلب سجل المهام');
  }
};

export const createTask = async (taskData) => {
  try {
    const { data } = await api.post(`${BASE_URL}/tasks`, taskData);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في إسناد المهمة');
  }
};

export const updateTaskStatus = async (id, updates) => {
  try {
    const { data } = await api.put(`${BASE_URL}/tasks/${id}`, updates);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'فشل في تحديث حالة المهمة');
  }
};