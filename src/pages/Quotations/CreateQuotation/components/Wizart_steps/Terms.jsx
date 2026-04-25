import React, { useState, useEffect } from "react";
import { 
  ScrollText, 
  RotateCcw, 
  FileCheck2, 
  UserCheck, 
  ShieldCheck,
  Type
} from "lucide-react";
import {
  CLIENT_TITLES,
  HANDLING_METHODS,
} from "../../utils/quotationConstants";

// ==========================================
// الخطوة 7: الشروط والأحكام والافتتاحية (تنسيق مكثف وعمودي)
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
  const activeTemplate = serverTemplates?.find((t) => t.id === selectedTemplate);

  // تحديث حالة اللقب المخصص عند التحميل بناءً على القيمة الحالية
  useEffect(() => {
    if (clientTitle && !CLIENT_TITLES.includes(clientTitle)) {
      setIsCustomTitle(true);
    }
  }, []);

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
    <div className="animate-in fade-in duration-300 h-full flex flex-col gap-4 max-w-4xl mx-auto">
      
      {/* 1️⃣ قسم معلومات النموذج وزر الاستعادة (أعلى الصفحة) */}
      <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <FileCheck2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">النموذج النشط</div>
            <div className="text-xs font-bold text-indigo-900">{activeTemplate?.title || "لم يتم تحديد نموذج"}</div>
          </div>
        </div>
        <button
          onClick={handleRestoreTemplateTerms}
          disabled={!activeTemplate}
          className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold rounded-lg hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" /> استعادة النص الأصلي للنموذج
        </button>
      </div>

      {/* 2️⃣ محرر الشروط والأحكام (يأخذ المساحة الرئيسية) */}
      <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[300px]">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-slate-500" /> مراجعة وتعديل بنود العرض
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
          className="w-full flex-1 p-4 text-sm outline-none focus:bg-blue-50/5 resize-none leading-relaxed text-slate-700 custom-scrollbar"
        />
      </div>

      {/* 3️⃣ قسم اللقب المستهدف (تنسيق عمودي) */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-50">
          <UserCheck className="w-4 h-4 text-blue-500" /> لقب العميل المستهدف في مقدمة العرض:
        </div>
        
        <div className="flex flex-wrap gap-2">
          {CLIENT_TITLES.map((title) => (
            <button
              key={title}
              onClick={() => handleTitleClick(title)}
              className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                clientTitle === title && !isCustomTitle
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-400"
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
            className={`px-4 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
              isCustomTitle
                ? "bg-blue-600 text-white border-blue-600 shadow-md"
                : "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
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
              className="w-full pr-9 pl-3 py-2 bg-blue-50/30 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold text-blue-900"
            />
          </div>
        )}
      </div>

      {/* 4️⃣ قسم أسلوب التعامل والتفويض (تنسيق عمودي) */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3 mb-6">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 pb-2 border-b border-slate-50">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> أسلوب التعامل والتفويض القانوني:
        </div>
        <div className="flex flex-wrap gap-2">
          {HANDLING_METHODS.map((method) => (
            <button
              key={method}
              onClick={() => setHandlingMethod(method)}
              className={`px-5 py-2 text-[11px] font-bold rounded-lg border transition-all ${
                handlingMethod === method
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-emerald-300"
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