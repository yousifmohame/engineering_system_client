import { useAuth } from "../context/AuthContext";

export const usePermissions = () => {
  const { user } = useAuth();
  
  // نفترض أن الباك إند يرسل مصفوفة بأكواد الصلاحيات داخل كائن user
  // مثال: user.permissions = ["CLIENT_VIEW", "CLIENT_EDIT", "TRANS_CREATE"]
  const permissions = user?.permissions || [];
  
  // إذا كان الموظف لديه دور مدير النظام المطلق
  const isSuperAdmin = user?.role?.name === "SuperAdmin" || permissions.includes("SUPER_ADMIN");

  const hasPermission = (permissionCode) => {
    if (isSuperAdmin) return true;
    return permissions.includes(permissionCode);
  };

  return { hasPermission, isSuperAdmin };
};