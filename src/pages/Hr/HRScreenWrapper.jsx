import React from "react";
import { useAppStore } from "../../stores/useAppStore";

// استيراد الشاشة الرئيسية والمكونات الفرعية
import HRDashboard from "./HRDashboard";
import InternalFormsTab from "./screens/InternalForms/InternalFormsTab";
import EmployeesManagement from "./screens/employees/EmployeesManagement";

const HRScreenWrapper = () => {
  // ⚠️ الكود الخاص بشاشة الموارد البشرية في نظامك هو 817
  const screenId = "88";

  const { activeTabPerScreen, setActiveTab, addTab, removeTab } = useAppStore();
  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_HR";

  // 💡 دالة التنقل لفتح تابات جديدة
  const handleNavigate = (targetId) => {
    switch (targetId) {
      case "HR_EMPLOYEES":
        addTab(screenId, {
          id: "HR_EMPLOYEES",
          title: "إدارة الموظفين",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "HR_EMPLOYEES");
        break;

      case "HR_INTERNAL_FORMS":
        addTab(screenId, {
          id: "HR_INTERNAL_FORMS",
          title: "النماذج الداخلية",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "HR_INTERNAL_FORMS");
        break;

      case "HR_PAYROLL":
        addTab(screenId, {
          id: "HR_PAYROLL",
          title: "إدارة المرتبات",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "HR_PAYROLL");
        break;

      case "HR_CONTRACTS":
        addTab(screenId, {
          id: "HR_CONTRACTS",
          title: "مركز العقود",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "HR_CONTRACTS");
        break;

      case "HR_REQUESTS":
        addTab(screenId, {
          id: "HR_REQUESTS",
          title: "الطلبات والإجازات",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "HR_REQUESTS");
        break;

      case "HR_PORTALS":
        addTab(screenId, {
          id: "HR_PORTALS",
          title: "بوابات الدخول",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "HR_PORTALS");
        break;

      default:
        setActiveTab(screenId, targetId);
    }
  };

  const renderContent = () => {
    // حالة: النماذج الداخلية
    if (activeTabId === "HR_INTERNAL_FORMS") {
      return (
        <div className="p-3 h-full overflow-y-auto bg-slate-50">
          <InternalFormsTab />
        </div>
      );
    }

    // حالات باقي الشاشات (قيد التطوير حالياً)
    if (activeTabId === "HR_EMPLOYEES")
      return (
        <div className="p-6 h-full flex justify-center items-center text-slate-400 font-bold text-xl">
          <EmployeesManagement />
        </div>
      );
    if (activeTabId === "HR_PAYROLL")
      return (
        <div className="p-6 h-full flex justify-center items-center text-slate-400 font-bold text-xl">
          إدارة المرتبات (قيد التطوير)
        </div>
      );
    if (activeTabId === "HR_CONTRACTS")
      return (
        <div className="p-6 h-full flex justify-center items-center text-slate-400 font-bold text-xl">
          مركز العقود (قيد التطوير)
        </div>
      );
    if (activeTabId === "HR_REQUESTS")
      return (
        <div className="p-6 h-full flex justify-center items-center text-slate-400 font-bold text-xl">
          الطلبات والإجازات (قيد التطوير)
        </div>
      );
    if (activeTabId === "HR_PORTALS")
      return (
        <div className="p-6 h-full flex justify-center items-center text-slate-400 font-bold text-xl">
          بوابات الدخول (قيد التطوير)
        </div>
      );

    // الحالة الافتراضية: عرض لوحة القيادة وتمرير دالة التنقل لها
    return <HRDashboard onNavigate={handleNavigate} />;
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-2xl border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HRScreenWrapper;
