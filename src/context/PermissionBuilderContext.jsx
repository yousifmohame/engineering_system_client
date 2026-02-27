import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/axios";

const PermissionBuilderContext = createContext();

export const PermissionBuilderProvider = ({ children }) => {
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState("");
  
  // 👈 إضافة حالة جديدة لحفظ "أكواد الصلاحيات" الممنوحة للدور المختار حالياً
  const [activeRolePermissions, setActiveRolePermissions] = useState([]);

  // جلب الصلاحيات عندما يتغير الدور المختار
  useEffect(() => {
    if (isBuilderMode && activeRoleId) {
      fetchRoleDetails();
    } else {
      setActiveRolePermissions([]); // تفريغ عند الإغلاق
    }
  }, [activeRoleId, isBuilderMode]);

  const fetchRoleDetails = async () => {
    try {
      const res = await api.get(`/roles/${activeRoleId}`);
      if (res.data && res.data.permissions) {
        // نستخرج الأكواد فقط في مصفوفة لسهولة المقارنة
        const codes = res.data.permissions.map(p => p.code);
        setActiveRolePermissions(codes);
      }
    } catch (error) {
      console.error("Failed to fetch role details:", error);
    }
  };

  const togglePermission = async (permissionData) => {
    if (!activeRoleId) {
      toast.error("يرجى اختيار الدور الوظيفي أولاً من الشريط العلوي!");
      return;
    }

    try {
      const res = await api.post(`/roles/${activeRoleId}/assign-permission`, {
        permission: permissionData
      });
      
      // تحديث الواجهة فوراً (Optimistic Update)
      if (res.data.action === 'added') {
        setActiveRolePermissions(prev => [...prev, permissionData.code]);
        toast.success(`🟢 تم منح الصلاحية: ${permissionData.name}`);
      } else {
        setActiveRolePermissions(prev => prev.filter(code => code !== permissionData.code));
        toast.info(`🔴 تم سحب الصلاحية: ${permissionData.name}`);
      }

    } catch (error) {
      toast.error("حدث خطأ أثناء تعديل الصلاحية");
    }
  };

  return (
    <PermissionBuilderContext.Provider value={{ 
      isBuilderMode, setIsBuilderMode, 
      activeRoleId, setActiveRoleId,
      activeRolePermissions, // 👈 تمرير الصلاحيات
      togglePermission 
    }}>
      {children}
    </PermissionBuilderContext.Provider>
  );
};

export const usePermissionBuilder = () => useContext(PermissionBuilderContext);