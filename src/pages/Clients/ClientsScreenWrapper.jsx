import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import ClientsDashboard from "./ClientsDashboard";
import CreateClientWizard from "./CreateClientWizard"; 
// 💡 ملاحظة: تأكد أن مسار الاستيراد للملفات أعلاه صحيح حسب مجلداتك

const ClientsScreenWrapper = () => {
  const screenId = "300"; // كود شاشة العملاء
  
  // 1. جلب الدوال والحالة من الستور
  const { activeTabPerScreen, setActiveTab, addTab, removeTab } = useAppStore();
  
  // 2. تحديد التاب النشط حالياً (الافتراضي هو لوحة العملاء)
  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_CLIENTS";

  // 3. دالة التنقل التي سيتم تمريرها للوحة العملاء
  const handleNavigate = (targetId) => {
    if (targetId === "NEW_CLIENT_TAB") {
      // إضافة التاب للشريط العلوي
      addTab(screenId, {
        id: "NEW_CLIENT_TAB",
        title: "إنشاء عميل جديد",
        type: "wizard",
        closable: true,
      });
      // الانتقال إليه فوراً
      setActiveTab(screenId, "NEW_CLIENT_TAB");
    } else {
      setActiveTab(screenId, targetId);
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      
      {/* الغلاف الرئيسي للمحتوى */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-2xl border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          
          {/* =======================================================
              نظام التوجيه (Routing) يقرأ من الستور مباشرة
          ======================================================= */}
          {activeTabId === "NEW_CLIENT_TAB" ? (
            <CreateClientWizard 
              onComplete={() => {
                // عند الانتهاء يتم إغلاق التاب والعودة للوحة
                removeTab(screenId, "NEW_CLIENT_TAB");
                setActiveTab(screenId, "DASHBOARD_CLIENTS");
              }} 
            />
          ) : (
            // الشاشة الافتراضية
            <ClientsDashboard onNavigate={handleNavigate} />
          )}

        </div>
      </div>

    </div>
  );
};

export default ClientsScreenWrapper;