import React, { useState } from "react";
import { X, ShieldCheck } from "lucide-react";

// 🌟 استيراد الداشبورد الخاصة بالمشرفين
import SupervisorDashboard from "./SupervisorDashboard";
// 🌟 استيراد شاشة مشرف التوثيق (تأكد من صحة المسار حسب هيكلة مشروعك)
import OperationsSupervisorScreen from "./pages/OperationsSupervisorScreen";
// 🌟 استيراد شاشات عروض الأسعار (ليستخدمها مشرف العروض)
import QuotationsSupervisorScreen from "./pages/QuotationsSupervisorScreen";
// 🌟 استيراد شاشة مشرف الرواتب (تأكد من المسار أو استخدم الـ Placeholder)
// import PayrollSupervisorScreen from "./pages/PayrollSupervisorScreen";

// 💡 قاموس بأسماء شاشات المشرفين لعرضها في عنوان النافذة
const TAB_TITLES = {
  OPERATIONS_SUPERVISOR: "مشرف التوثيق والختم",
  QUOTATIONS_SUPERVISOR: "إدارة عروض الأسعار",
  CONTRACTS_SUPERVISOR: "إدارة العقود والاتفاقيات",
  FINANCE_SUPERVISOR: "الاعتمادات المالية",
  PAYROLL_SUPERVISOR: "مشرف مسيرات الرواتب", // 🌟 القسم الجديد
  AUDIT_SUPERVISOR: "الجودة والتدقيق الشامل",
  CREATE_QUOTATION: "إنشاء / تعديل عرض سعر",
};

const SupervisorScreenWrapper = () => {
  const [activeModal, setActiveModal] = useState(null);
  const [editQuoteId, setEditQuoteId] = useState(null);

  const handleNavigate = (targetId, data = null) => {
    if (targetId === "DASHBOARD") {
      setActiveModal(null);
      setEditQuoteId(null);
      return;
    }
    setActiveModal(targetId);

    if (data?.quotationId) {
      setEditQuoteId(data.quotationId);
    } else {
      setEditQuoteId(null);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setEditQuoteId(null);
  };

  const renderPlaceholder = (title) => (
    <div className="h-full flex flex-col justify-center items-center text-gray-500 gap-5 p-6">
      <div className="h-32 w-32 rounded-full bg-white/30 backdrop-blur-xl border border-white/50 flex items-center justify-center shadow-xl">
        <span className="text-6xl opacity-60">🚧</span>
      </div>
      <h2 className="text-2xl font-black drop-shadow-md text-[#123f59]">
        {title}
      </h2>
      <p className="text-base font-bold text-gray-500">
        هذه الوحدة قيد التطوير والربط حالياً
      </p>
    </div>
  );

  const renderModalContent = () => {
    if (activeModal === "OPERATIONS_SUPERVISOR") {
      return (
        <div className="h-full min-h-0 overflow-hidden bg-transparent">
          <OperationsSupervisorScreen />
        </div>
      );
    }

    if (activeModal === "QUOTATIONS_SUPERVISOR") {
      return (
        <div className="h-full min-h-0 overflow-hidden bg-transparent">
          <QuotationsSupervisorScreen onNavigate={handleNavigate} />
        </div>
      );
    }
    
    // إذا كان لديك شاشة للرواتب يمكنك تفعيلها هنا
    // if (activeModal === "PAYROLL_SUPERVISOR") {
    //   return <div className="h-full min-h-0 overflow-hidden bg-transparent"><PayrollSupervisorScreen /></div>;
    // }

    if (TAB_TITLES[activeModal]) {
      return renderPlaceholder(TAB_TITLES[activeModal]);
    }

    return null;
  };

  return (
    <div
      className="flex h-full w-full overflow-hidden bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] font-cairo relative"
      dir="rtl"
    >
      {/* ─── الخلفية الجمالية (Animated Blobs) ─── */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      {/* 1. الداشبورد الرئيسية (Glassmorphism Container) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-[400px] w-full h-full z-10 relative p-4 lg:p-6">
        <div className="flex-1 relative w-full h-full min-h-0 bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.05)] rounded-[32px] overflow-hidden">
          <SupervisorDashboard onNavigate={handleNavigate} />
        </div>
      </div>

      {/* 2. النافذة المنبثقة لإنشاء عرض السعر */}
      {/* {activeModal === "CREATE_QUOTATION" && (
        <CreateQuotationWizard
          quotationId={editQuoteId}
          onClose={closeModal}
          onComplete={closeModal}
        />
      )} */}

      {/* 3. النافذة المنبثقة (Modal) الموحدة الزجاجية */}
      {activeModal && activeModal !== "CREATE_QUOTATION" && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-md p-4 sm:p-6 font-cairo">
          <div className="bg-white/90 backdrop-blur-2xl border border-white/70 w-full max-w-[95vw] h-[95vh] rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
            
            {/* الهيدر الزجاجي للنافذة */}
            <div className="p-5 border-b border-gray-200/60 flex justify-between items-center relative z-10 bg-white/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-teal-500/20 text-teal-700 flex items-center justify-center border border-teal-500/30 shadow-inner">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#123f59] drop-shadow-sm">
                    {TAB_TITLES[activeModal]}
                  </h3>
                  <p className="text-sm font-bold text-gray-500 mt-0.5">
                    نافذة الإشراف المتقدمة للتحكم في الاعتمادات والعمليات.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="h-12 w-12 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all shadow-sm"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* محتوى الشاشة הפعلي */}
            <div className="relative min-w-0 flex-1 overflow-hidden bg-gradient-to-br from-[#e0eafc]/50 to-[#cfdef3]/50">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorScreenWrapper;