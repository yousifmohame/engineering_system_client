import React from "react";
import { useAppStore } from "../../stores/useAppStore";

// استيراد الشاشة الرئيسية والمكونات الفرعية
import HRDashboard from "./HRDashboard";
import InternalFormsTab from "./screens/InternalForms/InternalFormsTab";
import EmployeesManagement from "./screens/employees/EmployeesManagement";

// 💡 قاموس بأسماء جميع الشاشات الجديدة (لفتح التبويبات بأسماء صحيحة)
const TAB_TITLES = {
  HR_EMPLOYEES: "دليل الكوادر والشركاء",
  ATTENDANCE_AI: "الحضور والانصراف (AI)",
  CONTRACTS_QIWA: "العقود والاتفاقيات",
  HR_REQUESTS: "مركز الطلبات والنماذج",
  MY_PORTAL: "بوابة الموظف",
  HR_PAYROLL: "الرواتب والمسيرات",
  LEAVES_ABSENCE: "سجل الإجازات والغياب",
  HR_SETTINGS: "إعدادات الحالات والبدلات",
  PROF_PLATFORMS: "المنصات المهنية والهيئات",
  RESIDENCY_INSURANCE: "شؤون المقيمين والتأمين",
  HR_INTERNAL_FORMS: "النماذج الذكية",
  ASSETS_CUSTODY: "العهد والأصول",
  SMART_UPDATE: "التحديث الذكي",
};

const HRScreenWrapper = () => {
  // ⚠️ الكود الخاص بشاشة الموارد البشرية في نظامك
  const screenId = "88";

  const { activeTabPerScreen, setActiveTab, addTab, removeTab } = useAppStore();
  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_HR";

  // 💡 دالة التنقل الديناميكية
  const handleNavigate = (targetId) => {
    // إذا ضغط المستخدم على لوحة المؤشرات، نعود للصفحة الرئيسية
    if (targetId === "DASHBOARD") {
      setActiveTab(screenId, "DASHBOARD_HR");
      return;
    }

    // فتح تبويب جديد بناءً على القاموس
    if (TAB_TITLES[targetId]) {
      addTab(screenId, {
        id: targetId,
        title: TAB_TITLES[targetId],
        type: "panel",
        closable: true,
      });
      setActiveTab(screenId, targetId);
    } else {
      setActiveTab(screenId, targetId);
    }
  };

  // 💡 دالة مساعدة لرسم شاشة "قيد التطوير" لتوفير التكرار
  const renderPlaceholder = (title) => (
    <div className="p-6 h-full flex flex-col justify-center items-center text-slate-400 font-bold gap-4 bg-slate-50">
      <span className="text-5xl opacity-50">🚧</span>
      <span className="text-xl">{title} (قيد التطوير حالياً)</span>
    </div>
  );

  const renderContent = () => {
    // 1. شاشة النماذج الذكية (الداخلية)
    if (activeTabId === "HR_INTERNAL_FORMS") {
      return (
        <div className="p-3 h-full overflow-y-auto bg-slate-50 custom-scrollbar">
          <InternalFormsTab />
        </div>
      );
    }

    // 2. شاشة دليل الكوادر (إدارة الموظفين)
    if (activeTabId === "HR_EMPLOYEES") {
      return (
        <div className="h-full overflow-y-auto bg-slate-50 custom-scrollbar">
          <EmployeesManagement />
        </div>
      );
    }

    // 3. التحقق من باقي الشاشات وعرض (قيد التطوير) لها
    if (TAB_TITLES[activeTabId]) {
      return renderPlaceholder(TAB_TITLES[activeTabId]);
    }

    // 4. الحالة الافتراضية: عرض لوحة القيادة
    return <HRDashboard onNavigate={handleNavigate} />;
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* الغلاف الأبيض الزجاجي المحيط بالشاشات */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-[2rem] border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default HRScreenWrapper;