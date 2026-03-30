import api from "./axios";

// استعادة الملفات
export const restoreFiles = async (payload) => {
  return await api.post("/files/restore", payload);
};

// الحذف النهائي
export const permanentDeleteFiles = async (payload) => {
  return await api.post("/files/permanent-delete", payload);
};

// جلب سجل حركات الملف (Audit Log)
export const getFileLogs = async (fileId) => {
  return await api.get(`/files/logs/${fileId}`);
};

// جلب الإصدارات السابقة للملف
export const getFileVersions = async (fileId) => {
  return await api.get(`/files/versions/${fileId}`);
};