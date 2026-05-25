import React, { useState } from "react";
import { X, ShieldCheck, Users, Sparkles } from "lucide-react"; // لا تنسَ استيراد أيقونة الإغلاق

// استيراد الشاشة الرئيسية والمكونات الفرعية
import DocumentsDashboard from "./DocumentsDashboard";
import DocsStation from "./pages/DocsStation";


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
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

// 💡 قاموس بأسماء جميع الشاشات الجديدة (لعرضها في عنوان النافذة)
const TAB_TITLES = {
  DOCUMENT_TYPES: "أنواع المستندات",
  TECHNICAL_REPORT: "التقرير الفني",
};

const DocsStationScreenWrapper = () => {
  // 💡 حالة للتحكم في الشاشة المنبثقة (Null تعني لا يوجد نافذة مفتوحة)
  const [activeModal, setActiveModal] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  // دالة لفتح النافذة
  const handleNavigate = (targetId, action = null) => {
    if (targetId === "DASHBOARD") {
      setActiveModal(null);
      setModalAction(null);
      return;
    }

    setActiveModal(targetId);
    setModalAction(action);
  };

  // دالة لإغلاق النافذة
  const closeModal = () => {
    setActiveModal(null);
    setModalAction(null);
  };

  // دالة مساعدة لرسم شاشة "قيد التطوير"
  const renderPlaceholder = (title) => (
    <div className="p-3 h-full flex flex-col justify-center items-center text-[#94a3b8] font-bold gap-2.5 bg-[#fbf8f1]">
      <span className="text-5xl opacity-50">🚧</span>
      <span className="text-base">{title} (قيد التطوير حالياً)</span>
    </div>
  );

  // دالة جلب محتوى الشاشة بناءً على الاختيار
  const renderModalContent = () => {
    if (activeModal === "DOCUMENT_TYPES") {
      return <DocsStation />;
    }

    // if (activeModal === "TECHNICAL_REPORT") {
    //   return <TechnicalReportScreen />;
    // }

    if (TAB_TITLES[activeModal]) {
      return renderPlaceholder(TAB_TITLES[activeModal]);
    }

    return null;
  };

  return (
    <div
      className="flex h-full w-full overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
      dir="rtl"
    >
      {/* 1. الخلفية الثابتة: لوحة المؤشرات (Dashboard) ستكون دائماً معروضة ومحتفظة بحالتها */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-[0_10px_24px_rgba(18,63,89,0.08)] m-3 rounded-[18px] border border-[#e8ddc8] overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-hidden">
          <DocumentsDashboard onNavigate={handleNavigate} />
        </div>
      </div>

      {/* 2. النافذة المنبثقة (Modal / Popup Window) */}
      {activeModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4 font-cairo animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* الهيدر الموحد للنافذة (نخفيه فقط في شاشة الحضور لأننا برمجنا لها هيدر مخصص بداخلها) */}
            {activeModal !== "ATTENDANCE_AI" && (
              <div className="flex shrink-0 items-center justify-between border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-3 py-1.5 text-white shadow-[0_8px_22px_rgba(18,63,89,0.16)]">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="truncate text-[13px] font-black leading-tight text-white">
                      {TAB_TITLES[activeModal]}
                    </h2>
                    <p className="hidden text-[9px] font-bold text-white/55 lg:block">
                      نافذة عمل مدمجة لإدارة بيانات الموارد البشرية.
                    </p>
                  </div>
                </div>

                <button
                  onClick={closeModal}
                  className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/10 px-2 text-[9px] font-black text-white/80 transition hover:bg-rose-500/15 hover:text-white"
                >
                  <IconWithText
                    icon={X}
                    text="إغلاق"
                    iconClassName="h-3.5 w-3.5"
                  />
                </button>
              </div>
            )}

            {/* محتوى الشاشة الفعلي الذي يتم جلبه من الكومبوننت */}
            <div className="relative min-w-0 flex-1 overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocsStationScreenWrapper;
