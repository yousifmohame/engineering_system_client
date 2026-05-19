import React, { useState } from "react";
import { X } from "lucide-react"; // لا تنسَ استيراد أيقونة الإغلاق

// استيراد الشاشة الرئيسية والمكونات الفرعية
import HRDashboard from "./HRDashboard";
import InternalFormsTab from "./screens/InternalForms/InternalFormsTab";
import EmployeesManagement from "./screens/employees/EmployeesManagement";
import AttendanceCenter from "./screens/Attendance/AttendanceCenter";
import OutsourceSalariesPage from "./screens/OutsourceSalaries/OutsourceSalariesPage";
import TreasuryPage from "./screens/Treasury/TreasuryPage";

// 💡 قاموس بأسماء جميع الشاشات الجديدة (لعرضها في عنوان النافذة)
const TAB_TITLES = {
  HR_EMPLOYEES: "إدارة الموظفين",
  ATTENDANCE_AI: "الحضور والانصراف (AI)",
  CONTRACTS_QIWA: "رواتب موظفي الأوتسورس",
  // HR_REQUESTS: "مركز الطلبات والنماذج",
  MY_PORTAL: "بوابة الموظف",
  HR_PAYROLL: "الخزنة",
  LEAVES_ABSENCE: "سجل الإجازات والغياب",
  HR_SETTINGS: "إعدادات الحالات والبدلات",
  PROF_PLATFORMS: "المنصات المهنية والهيئات",
  RESIDENCY_INSURANCE: "شؤون المقيمين والتأمين",
  HR_INTERNAL_FORMS: "النماذج الذكية",
  ASSETS_CUSTODY: "العهد والأصول",
  SMART_UPDATE: "التحديث الذكي",
};

const HRScreenWrapper = () => {
  // 💡 حالة للتحكم في الشاشة المنبثقة (Null تعني لا يوجد نافذة مفتوحة)
  const [activeModal, setActiveModal] = useState(null);

  // دالة لفتح النافذة
  const handleNavigate = (targetId) => {
    if (targetId === "DASHBOARD") {
      setActiveModal(null);
      return;
    }
    setActiveModal(targetId);
  };

  // دالة لإغلاق النافذة
  const closeModal = () => setActiveModal(null);

  // دالة مساعدة لرسم شاشة "قيد التطوير"
  const renderPlaceholder = (title) => (
    <div className="p-6 h-full flex flex-col justify-center items-center text-slate-400 font-bold gap-4 bg-slate-50">
      <span className="text-5xl opacity-50">🚧</span>
      <span className="text-xl">{title} (قيد التطوير حالياً)</span>
    </div>
  );

  // دالة جلب محتوى الشاشة بناءً على الاختيار
  const renderModalContent = () => {
    if (activeModal === "HR_INTERNAL_FORMS") {
      return (
        <div className="p-3 h-full overflow-y-auto bg-slate-50 custom-scrollbar">
          <InternalFormsTab />
        </div>
      );
    }

    if (activeModal === "HR_EMPLOYEES") {
      return (
        <div className="h-full overflow-y-auto bg-slate-50 custom-scrollbar">
          <EmployeesManagement />
        </div>
      );
    }

    if (activeModal === "ATTENDANCE_AI") {
      return (
        <div className="h-full overflow-hidden bg-slate-50">
          {/* نمرر دالة الإغلاق لشاشة الحضور لأن بداخلها زر إغلاق خاص بها */}
          <AttendanceCenter onClose={closeModal} />
        </div>
      );
    }

    if (activeModal === "CONTRACTS_QIWA") {
      return (
        <div className="h-full overflow-hidden bg-slate-50">
          {/* نمرر دالة الإغلاق لشاشة الحضور لأن بداخلها زر إغلاق خاص بها */}
          <OutsourceSalariesPage onClose={closeModal} />
        </div>
      );
    }

    if (activeModal === "HR_PAYROLL") {
      return (
        <div className="h-full overflow-hidden bg-slate-50">
          {/* نمرر دالة الإغلاق لشاشة الحضور لأن بداخلها زر إغلاق خاص بها */}
          <TreasuryPage onClose={closeModal} />
        </div>
      );
    }

    if (TAB_TITLES[activeModal]) {
      return renderPlaceholder(TAB_TITLES[activeModal]);
    }

    return null;
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      
      {/* 1. الخلفية الثابتة: لوحة المؤشرات (Dashboard) ستكون دائماً معروضة ومحتفظة بحالتها */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-[2rem] border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-hidden">
          <HRDashboard onNavigate={handleNavigate} />
        </div>
      </div>

      {/* 2. النافذة المنبثقة (Modal / Popup Window) */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-cairo animate-in fade-in duration-200">
          
          <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* الهيدر الموحد للنافذة (نخفيه فقط في شاشة الحضور لأننا برمجنا لها هيدر مخصص بداخلها) */}
            {activeModal !== "ATTENDANCE_AI" && (
              <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <h2 className="text-lg font-black text-slate-800">{TAB_TITLES[activeModal]}</h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* محتوى الشاشة الفعلي الذي يتم جلبه من الكومبوننت */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">
              {renderModalContent()}
            </div>
            
          </div>
        </div>
      )}
      
    </div>
  );
};

export default HRScreenWrapper;