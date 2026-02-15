import api from './axios'; // تأكد أن هذا المسار يشير إلى إعدادات axios لديك

// 1. جلب قائمة الموظفين
export const fetchEmployees = async () => {
  const { data } = await api.get('/employees');
  return data;
};

export const getEmployees = fetchEmployees; // اسم بديل لنفس الدالة

// 2. إنشاء موظف جديد
export const createEmployee = async (employeeData) => {
  const { data } = await api.post('/employees', employeeData);
  return data;
};

// 3. تحديث حالة الموظف (تجميد/إنهاء)
export const updateEmployeeStatus = async (id, statusData) => {
  const { data } = await api.patch(`/employees/${id}/status`, statusData);
  return data;
};

// 4. تحديث الترقية (أو البيانات الوظيفية)
export const updateEmployeePromotion = async (id, promotionData) => {
  const { data } = await api.post(`/employees/${id}/promotion`, promotionData);
  return data;
};

// 5. رفع المرفقات
export const uploadEmployeeAttachment = async (file, employeeId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('employeeId', employeeId);

  const { data } = await api.post('/attachments/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

// --- دوال الجلب الفرعية (للتابات التفصيلية) ---

// الحضور
export const fetchEmployeeAttendance = async (id) => {
  const { data } = await api.get(`/employees/${id}/attendance`);
  return data;
};

// الإجازات
export const fetchEmployeeLeaveRequests = async (id) => {
  const { data } = await api.get(`/employees/${id}/leave-requests`);
  return data;
};

// المهارات
export const fetchEmployeeSkills = async (id) => {
  const { data } = await api.get(`/employees/${id}/skills`);
  return data;
};

// الشهادات
export const fetchEmployeeCertifications = async (id) => {
  const { data } = await api.get(`/employees/${id}/certifications`);
  return data;
};

// التقييمات
export const fetchEmployeeEvaluations = async (id) => {
  const { data } = await api.get(`/employees/${id}/evaluations`);
  return data;
};

// سجل الترقيات
export const fetchEmployeePromotions = async (id) => {
  const { data } = await api.get(`/employees/${id}/promotions`);
  return data;
};

// المرفقات
export const fetchEmployeeAttachments = async (id) => {
  const { data } = await api.get(`/employees/${id}/attachments`); // أو المسار العام للمرفقات مع فلتر
  return data;
};