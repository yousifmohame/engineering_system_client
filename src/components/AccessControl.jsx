import React from "react";
import { usePermissionBuilder } from "../context/PermissionBuilderContext";
import { usePermissions } from "../hooks/usePermissions";

const AccessControl = ({ 
  code,         // الكود البرمجي الفريد (مثال: CLIENT_SAVE_BTN)
  name,         // اسم الصلاحية للعرض (مثال: حفظ بيانات العميل)
  moduleName,   // اسم الشاشة (مثال: دليل العملاء)
  tabName = "عام", // اسم التاب (اختياري)
  type = "action", // نوعها: screen, tab, action, field
  children,     // العنصر المراد حمايته (زر، حقل...)
  fallback = null // ماذا يظهر إذا لم يمتلك الصلاحية؟
}) => {
  const { isBuilderMode, registerPermission } = usePermissionBuilder();
  const { hasPermission } = usePermissions();

  // ==========================================
  // 1. حالة المدير (وضع بناء الصلاحيات)
  // ==========================================
  if (isBuilderMode) {
    return (
      <div 
        className="relative group inline-block w-full transition-all"
        onClick={(e) => {
          e.preventDefault();   // منع الزر من العمل (مثل إرسال فورم)
          e.stopPropagation();  // منع النقرة من التأثير على العناصر الأب
          registerPermission({ code, name, screenName: moduleName, tabName, level: type });
        }}
      >
        {/* الإطار الأحمر المتقطع الذي يظهر في وضع البناء */}
        <div className="absolute inset-0 z-50 border-2 border-dashed border-red-500 bg-red-500/10 cursor-pointer hover:bg-red-500/30 transition-colors rounded"></div>
        
        {/* شريط صغير يظهر اسم الصلاحية عند تمرير الماوس */}
        <div className="absolute -top-6 right-0 z-[60] bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {name} ({code})
        </div>

        {/* تعطيل التفاعل مع العنصر الداخلي أثناء وضع البناء */}
        <div className="pointer-events-none opacity-80">
          {children}
        </div>
      </div>
    );
  }

  // ==========================================
  // 2. حالة الموظف (الوضع الطبيعي)
  // ==========================================
  const isAuthorized = hasPermission(code);

  if (!isAuthorized) {
    return fallback; // إذا لم يمتلك الصلاحية، لا تعرض شيء (أو اعرض الـ fallback)
  }

  // إذا كان يمتلك الصلاحية، اعرض العنصر بشكل طبيعي تماماً
  return <>{children}</>;
};

export default AccessControl;