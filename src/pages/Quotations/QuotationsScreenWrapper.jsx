import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import QuotationsDashboard from "./QuotationsDashboard";
import CreateQuotationWizard from "./CreateQuotation/CreateQuotationWizard";
import QuotationsDirectory from "./QuotationsDirectory"; // 👈 استيراد الدليل
import QuotationsTemplates from "./Templates/index"; // 👈 استيراد النماذج
import QuotationsItems from "./QuotationsItems";
import QuotationsApprovals from "./QuotationsApprovals";
import QuotationsPayments from "./QuotationsPayments";
import QuotationsReports from "./QuotationsReports";
import QuotationsCancellations from "./QuotationsCancellations";

const QuotationsScreenWrapper = () => {
  const { screenTabs, activeTabPerScreen, removeTab } = useAppStore();
  const screenId = "815";

  const tabs = screenTabs[screenId] || [];
  const activeTabId = activeTabPerScreen[screenId];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      <div className="flex-1 relative overflow-y-auto">
        {tabs.map((tab) => {
          // فقط نظهر التاب إذا كان هو النشط حالياً
          if (tab.id !== activeTabId) return null;

          return (
            <div
              key={tab.id}
              className="h-full animate-in fade-in duration-300"
            >
              {tab.type === "dashboard" ? (
                <QuotationsDashboard />
              ) : tab.type === "create-quotation" ? (
                <CreateQuotationWizard
                  onComplete={(data) => {
                    // هنا نغلق تاب الإنشاء بعد الحفظ ونعود للوحة الرئيسية
                    console.log("تم الحفظ:", data);
                    removeTab(screenId, tab.id);
                  }}
                />
              ) : tab.type === "directory" ? ( // 👈 عرض الدليل
                <QuotationsDirectory />
              ) : tab.type === "templates" ? ( // 👈 عرض النماذج
                <QuotationsTemplates />
              ) : tab.type === "items" ? ( // 👈 إضافة هذا السطر
                <QuotationsItems />
              ) : tab.type === "approvals" ? (
                <QuotationsApprovals />
              ) : tab.type === "payments" ? ( // 👈 إضافة هذا السطر
                <QuotationsPayments />
              ) : tab.type === "reports" ? (
                <QuotationsReports />
              ) : tab.type === "cancellations" ? (
                <QuotationsCancellations />
              ) : (
                <div className="p-8 text-center text-slate-500 font-bold">
                  محتوى التاب غير معروف ({tab.id})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default QuotationsScreenWrapper;
