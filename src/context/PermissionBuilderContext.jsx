import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import api from "../api/axios";

const PermissionBuilderContext = createContext();

export const PermissionBuilderProvider = ({ children }) => {
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [activeRoleId, setActiveRoleId] = useState("");

  // هذه الدالة السحرية التي ستعمل عند النقر على أي عنصر محاط بإطار أحمر
  const registerPermission = async (permissionData) => {
    if (!activeRoleId) {
      toast.error("يرجى اختيار الدور الوظيفي أولاً من الشريط العلوي!");
      return;
    }

    try {
      // إرسال الصلاحية للباك إند
      // ملاحظة: يجب أن يحتوي الباك إند على راوت يقبل (roleId) و(بيانات الصلاحية) ليقوم بعمل connectOrCreate
      await api.post(`/roles/${activeRoleId}/assign-permission`, {
        permission: permissionData
      });
      
      toast.success(`تم تسجيل وربط الصلاحية: ${permissionData.name}`);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تسجيل الصلاحية");
    }
  };

  return (
    <PermissionBuilderContext.Provider value={{ 
      isBuilderMode, 
      setIsBuilderMode, 
      activeRoleId, 
      setActiveRoleId,
      registerPermission 
    }}>
      {children}
    </PermissionBuilderContext.Provider>
  );
};

export const usePermissionBuilder = () => useContext(PermissionBuilderContext);