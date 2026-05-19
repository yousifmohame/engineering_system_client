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
const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

const QuotationsScreenWrapper = () => {
  const { screenTabs, activeTabPerScreen, removeTab } = useAppStore();
  const screenId = "815";

  const tabs = screenTabs[screenId] || [];
  const activeTabId = activeTabPerScreen[screenId];

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
      <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim">
        {tabs.map((tab) => {
          // فقط نظهر التاب إذا كان هو النشط حالياً
          if (tab.id !== activeTabId) return null;

          return (
            <div
              key={tab.id}
              className="h-full font-[Tajawal] animate-in fade-in duration-300"
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
                <div className="p-3 text-center text-[#64748b] font-bold">
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
