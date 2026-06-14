import React, { useState, useEffect } from "react";
import {
  ScrollText,
  RotateCcw,
  FileCheck2,
  UserCheck,
  ShieldCheck,
  Type,
} from "lucide-react";
import {
  CLIENT_TITLES,
  HANDLING_METHODS,
} from "../../utils/quotationConstants";

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

// ==========================================
// الخطوة 7: الشروط والأحكام والافتتاحية
// ==========================================
export const Step7Terms = ({ props }) => {
  const {
    termsText,
    setTermsText,
    clientTitle,
    setClientTitle,
    handlingMethod,
    setHandlingMethod,
    selectedTemplate,
    serverTemplates,
  } = props;

  // حالة للتحقق مما إذا كان المستخدم يكتب لقباً مخصصاً
  const [isCustomTitle, setIsCustomTitle] = useState(false);

  // البحث عن بيانات النموذج المختار
  const activeTemplate = serverTemplates?.find(
    (t) => t.id === selectedTemplate,
  );

  // تحديث حالة اللقب المخصص عند التحميل بناءً على القيمة الحالية
  useEffect(() => {
    if (clientTitle && !CLIENT_TITLES.includes(clientTitle)) {
      setIsCustomTitle(true);
    }
  }, [clientTitle]);

  const handleRestoreTemplateTerms = () => {
    if (activeTemplate) {
      setTermsText(activeTemplate.defaultTerms || "");
    }
  };

  const handleTitleClick = (title) => {
    setIsCustomTitle(false);
    setClientTitle(title);
  };

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col gap-4 max-w-4xl mx-auto pb-4">
      {/* 1️⃣ قسم معلومات النموذج وزر الاستعادة (أعلى الصفحة) */}
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex min-w-0 items-center justify-between shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
        <div className="flex min-w-0 items-center gap-3">
          <div className="p-2 bg-white rounded-xl shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
              النموذج النشط
            </div>
            <div className="text-xs font-bold text-indigo-900">
              {activeTemplate?.title || "لم يتم تحديد نموذج"}
            </div>
          </div>
        </div>
        <button
          onClick={handleRestoreTemplateTerms}
          disabled={!activeTemplate}
          className="flex min-w-0 items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
        >
          <IconWithText
            icon={RotateCcw}
            text="استعادة النص الأصلي للنموذج"
            iconClassName="w-3.5 h-3.5"
          />
        </button>
      </div>

      {/* 2️⃣ محرر الشروط والأحكام (يأخذ المساحة الرئيسية) */}
      <div className="flex flex-col bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] overflow-hidden min-h-[250px]">
        <div className="px-4 py-2.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b border-[#d8b46a]/25 flex min-w-0 justify-between items-center">
          <label className="text-xs font-bold text-[#475569] flex min-w-0 items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#64748b]" /> مراجعة وتعديل بنود
            العرض
          </label>
          {activeTemplate && termsText !== activeTemplate.defaultTerms && (
            <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full border border-amber-200">
              تم التعديل يدوياً
            </span>
          )}
        </div>
        <textarea
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
          placeholder="أدخل الشروط والأحكام الخاصة بهذا العرض هنا..."
          className="w-full flex-1 p-3 text-sm outline-none focus:bg-[#eef7f6]/5 resize-none leading-relaxed text-[#475569] custom-scrollbar-slim"
        />
      </div>

      {/* 3️⃣ قسم اللقب المستهدف */}
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] space-y-3">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#475569] pb-2 border-b border-slate-50">
          <UserCheck className="w-4 h-4 text-[#0e7490]" /> لقب العميل المستهدف
          في مقدمة العرض:
        </div>

        <div className="flex flex-wrap gap-2">
          {CLIENT_TITLES.map((title) => (
            <button
              key={title}
              onClick={() => handleTitleClick(title)}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                clientTitle === title && !isCustomTitle
                  ? "bg-slate-800 text-white border-slate-800 shadow-[0_8px_18px_rgba(18,63,89,0.08)]"
                  : "bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white text-[#64748b] border-[#d8b46a]/25 hover:border-[#d8b46a]/35"
              }`}
            >
              {title}
            </button>
          ))}
          <button
            onClick={() => {
              setIsCustomTitle(true);
              setClientTitle("");
            }}
            className={`px-4 py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
              isCustomTitle
                ? "bg-[#123f59] text-white border-[#15536f] shadow-[0_8px_18px_rgba(18,63,89,0.08)]"
                : "bg-[#eef7f6] text-[#123f59] border-[#d8b46a]/25 hover:bg-[#eef7f6]"
            }`}
          >
            لقب مخصص...
          </button>
        </div>

        {isCustomTitle && (
          <div className="animate-in slide-in-from-top-2 duration-200 relative pt-2">
            <Type className="absolute right-3 top-5 w-3.5 h-3.5 text-blue-400" />
            <input
              type="text"
              autoFocus
              value={clientTitle}
              onChange={(e) => setClientTitle(e.target.value)}
              placeholder="اكتب اللقب المخصص هنا (مثال: سعادة المهندس /)"
              className="w-full pr-9 pl-3 py-2 bg-[#eef7f6]/30 border border-[#d8b46a]/35 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#0e7490] font-bold text-[#123f59]"
            />
          </div>
        )}
      </div>

      {/* 4️⃣ قسم أسلوب التعامل والتفويض */}
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] space-y-3 mb-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#475569] pb-2 border-b border-slate-50">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> أسلوب التعامل
          والتفويض القانوني (يظهر في التمهيد):
        </div>
        <div className="flex flex-wrap gap-2">
          {HANDLING_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => setHandlingMethod(method)}
              className={`px-3.5 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                handlingMethod === method
                  ? "bg-[#123f59] text-white border-emerald-600 shadow-[0_8px_18px_rgba(18,63,89,0.08)] scale-[1.02]"
                  : "bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white text-[#64748b] border-[#d8b46a]/25 hover:border-emerald-300"
              }`}
            >
              {method}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
