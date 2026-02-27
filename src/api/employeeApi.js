import api from "./axios";

// ==========================================
// إدارة الموظفين
// ==========================================
export const getEmployees = async () => {
  const { data } = await api.get("/employees");
  return data;
};

export const createEmployee = async (employeeData) => {
  const { data } = await api.post("/employees", employeeData);
  return data;
};

export const deleteEmployee = async (id) => {
  const { data } = await api.delete(`/employees/${id}`);
  return data;
};

export const toggleEmployeeStatus = async ({ id, status }) => {
  const { data } = await api.patch(`/employees/${id}/status`, { status });
  return data;
};

// ==========================================
// إدارة الأدوار والصلاحيات (بناءً على مخطط Prisma)
// ==========================================
export const getRoles = async () => {
  const { data } = await api.get("/roles"); // يجب إنشاء هذا الراوت في الباك إند
  return data;
};

export const getPermissions = async () => {
  const { data } = await api.get("/permissions"); // يجب إنشاء هذا الراوت في الباك إند
  return data;
};

export const updateRolePermissions = async ({ roleId, permissions }) => {
  const { data } = await api.put(`/roles/${roleId}/permissions`, { permissions });
  return data;
};

// إضافة دور وظيفي جديد مع صلاحياته
export const createRole = async (roleData) => {
  const { data } = await api.post("/roles", roleData);
  return data;
};