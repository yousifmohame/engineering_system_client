import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import ClientsDashboard from "./ClientsDashboard";
import CreateClientWizard from "./CreateClientWizard"; 
import ClientsLog from "./ClientsLog"; // 👈 1. استيراد شاشة سجل العملاء الجديدة

const ClientsScreenWrapper = () => {
  const screenId = "300"; // كود شاشة العملاء
  
  // جلب الدوال والحالة من الستور
  const { activeTabPerScreen, setActiveTab, addTab, removeTab } = useAppStore();
  
  // تحديد التاب النشط حالياً (الافتراضي هو لوحة العملاء)
  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_CLIENTS";

  // دالة التنقل التي سيتم تمريرها للوحة العملاء
  const handleNavigate = (targetId) => {
    if (targetId === "NEW_CLIENT_TAB") {
      addTab(screenId, {
        id: "NEW_CLIENT_TAB",
        title: "إنشاء عميل جديد",
        type: "wizard",
        closable: true,
      });
      setActiveTab(screenId, "NEW_CLIENT_TAB");
    } else if (targetId === "300-MAIN") {
      // 👈 2. إضافة تاب دليل العملاء عند النقر عليه من اللوحة
      addTab(screenId, {
        id: "300-MAIN",
        title: "دليل العملاء",
        type: "list",
        closable: true,
      });
      setActiveTab(screenId, "300-MAIN");
    } else {
      setActiveTab(screenId, targetId);
    }
  };

  // 👈 3. دالة منفصلة لترتيب عرض الشاشات (Routing)
  const renderContent = () => {
    // حالة 1: شاشة إضافة عميل جديد
    if (activeTabId === "NEW_CLIENT_TAB") {
      return (
        <CreateClientWizard 
          onComplete={() => {
            // عند الانتهاء يتم إغلاق التاب والعودة إلى دليل العملاء لرؤية العميل الجديد
            removeTab(screenId, "NEW_CLIENT_TAB");
            handleNavigate("300-MAIN");
          }} 
        />
      );
    }

    // حالة 2: شاشة دليل/سجل العملاء
    if (activeTabId === "300-MAIN") {
      return (
        <ClientsLog 
          onOpenDetails={(clientId, clientCode) => {
            // فتح تاب جديد خاص بملف العميل عند النقر على (عين) في الجدول
            const tabId = `CLIENT-${clientId}`;
            addTab(screenId, {
              id: tabId,
              title: `ملف: ${clientCode}`,
              type: "details",
              clientId: clientId,
              closable: true,
            });
            setActiveTab(screenId, tabId);
          }} 
        />
      );
    }

    // حالة 3: شاشة تفاصيل ملف العميل (سنقوم ببرمجتها لاحقاً)
    if (activeTabId?.startsWith("CLIENT-")) {
      return (
        <div className="flex items-center justify-center h-full text-slate-500 font-bold">
          جاري بناء شاشة تفاصيل العميل المحددة...
        </div>
      );
    }

    // الحالة الافتراضية: لوحة التحكم (Dashboard)
    return <ClientsDashboard onNavigate={handleNavigate} />;
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      
      {/* الغلاف الرئيسي للمحتوى */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-2xl border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          
          {/* استدعاء دالة العرض */}
          {renderContent()}

        </div>
      </div>

    </div>
  );
};

export default ClientsScreenWrapper;