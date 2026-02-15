import api from './axios';

// ============================================================
// 1. إدارة المعاملات اليومية (Instances) - شاشة 286 و 284
// ============================================================

// إنشاء معاملة جديدة
export const createTransaction = async (data) => {
  const response = await api.post('/transactions', data);
  return response.data;
};

// تحديث معاملة موجودة
export const updateTransaction = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

// جلب تفاصيل معاملة
export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

// جلب كل المعاملات
export const getAllTransactions = async () => {
  const response = await api.get('/transactions');
  return response.data;
};

// حذف معاملة
export const deleteTransaction = async (id) => {
  const response = await api.delete(`/transactions/${id}`);
  return response.data;
};

// جلب قائمة مختصرة للأنواع (للقوائم المنسدلة)
export const getTransactionTypes = async () => {
  const response = await api.get('/transactions/types/simple'); // تأكد من المسار في الباك اند
  // إذا لم يكن لديك مسار simple، استخدم العام:
  // const response = await api.get('/transactions/types');
  return response.data;
};

// ============================================================
// 2. إدارة قوالب/أنواع المعاملات (Templates) - شاشة الإعدادات 701
// (هذه هي الدوال التي كانت ناقصة لديك)
// ============================================================

// جلب الأنواع بالكامل (مع التفاصيل)
export const getFullTransactionTypes = async () => {
  const response = await api.get('/transactions/types/full'); // أو '/transactions/types' حسب الباك اند
  return response.data;
};

// إنشاء نوع معاملة جديد
export const createTransactionType = async (typeData) => {
  const response = await api.post('/transactions/types', typeData);
  return response.data;
};

// تحديث نوع معاملة
export const updateTransactionType = async (id, typeData) => {
  const response = await api.put(`/transactions/types/${id}`, typeData);
  return response.data;
};

// حذف نوع معاملة
export const deleteTransactionType = async (id) => {
  const response = await api.delete(`/transactions/types/${id}`);
  return response.data;
};

// ============================================================
// 3. تحديثات التبويبات الفرعية (Partial Updates)
// ============================================================

export const updateTransactionTasks = async (id, tasks) => {
  const response = await api.put(`/transactions/${id}/tasks`, tasks);
  return response.data;
};

export const updateTransactionStaff = async (id, staff) => {
  const response = await api.put(`/transactions/${id}/staff`, staff);
  return response.data;
};

export const updateTransactionCosts = async (id, costs) => {
  const response = await api.put(`/transactions/${id}/costs`, costs);
  return response.data;
};

export const getTransactionTemplateFees = async (typeId) => {
  const response = await api.get(`/transactions/template-fees/${typeId}`);
  return response.data;
};

export const updateTransactionFloors = async (id, floors) => {
  const response = await api.put(`/transactions/${id}`, { floors });
  return response.data;
};

export const updateTransactionSetbacks = async (id, setbacks) => {
  const response = await api.put(`/transactions/${id}`, { setbacks });
  return response.data;
};

export const updateTransactionComponents = async (id, components) => {
  const response = await api.put(`/transactions/${id}`, { components });
  return response.data;
};

export const updateTransactionGenericComponents = async (id, type, data) => {
  let fieldName = '';
  if (type === 'old-license') fieldName = 'componentsOldLicense';
  if (type === 'proposed') fieldName = 'componentsProposed';
  if (type === 'existing') fieldName = 'componentsExisting';

  const response = await api.put(`/transactions/${id}`, { [fieldName]: data });
  return response.data;
};

export const updateTransactionBoundaries = async (id, boundaries) => {
  const response = await api.put(`/transactions/${id}`, { boundaries });
  return response.data;
};

export const updateTransactionLandArea = async (id, landArea) => {
  const response = await api.put(`/transactions/${id}`, { landArea });
  return response.data;
};