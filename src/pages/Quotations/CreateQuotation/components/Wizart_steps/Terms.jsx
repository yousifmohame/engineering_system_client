import React, { useState, useEffect } from "react";
import { 
  ScrollText, 
  RotateCcw, 
  FileCheck2, 
  UserCheck, 
  ShieldCheck,
  Type,
  Users,
  Building,
  User
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
// الخطوة 7: الشروط والأحكام والافتتاحية وأطراف التعاقد
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
    
    // 🆕 خصائص أطراف التعاقد (تأكد من إضافتها في المكون الأب)
    firstPartyName = "",
    setFirstPartyName,
    firstPartyRep = "",
    setFirstPartyRep,
    secondPartyName = "",
    setSecondPartyName,
    secondPartyRep = "",
    setSecondPartyRep
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
            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">النموذج النشط</div>
            <div className="text-xs font-bold text-indigo-900">{activeTemplate?.title || "لم يتم تحديد نموذج"}</div>
          </div>
        </div>
        <button
          onClick={handleRestoreTemplateTerms}
          disabled={!activeTemplate}
          className="flex min-w-0 items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 text-[10px] font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all disabled:opacity-50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
        >
          <IconWithText icon={RotateCcw} text="استعادة النص الأصلي للنموذج" iconClassName="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2️⃣ محرر الشروط والأحكام (يأخذ المساحة الرئيسية) */}
      <div className="flex flex-col bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] overflow-hidden min-h-[250px]">
        <div className="px-4 py-2.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b border-[#d8b46a]/25 flex min-w-0 justify-between items-center">
          <label className="text-xs font-bold text-[#475569] flex min-w-0 items-center gap-2">
            <ScrollText className="w-4 h-4 text-[#64748b]" /> مراجعة وتعديل بنود العرض
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
          <UserCheck className="w-4 h-4 text-[#0e7490]" /> لقب العميل المستهدف في مقدمة العرض:
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

      {/* 4️⃣ قسم أطراف التعاقد (الطرف الأول والثاني) لغايات التوقيع والتحويل لعقد */}
      <div className="p-4 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] space-y-4">
        <div className="flex min-w-0 items-center justify-between pb-2 border-b border-slate-50">
          <div className="flex items-center gap-2 text-xs font-bold text-[#475569]">
            <Users className="w-4 h-4 text-purple-600" /> أطراف التعاقد والتواقيع 
          </div>
          <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
            ينعكس مباشرة في صيغة الاعتماد
          </span>
        </div>

        <div className="flex flex-col gap-4">
          {/* الطرف الأول */}
          <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 space-y-3">
            <h4 className="text-[11px] font-black text-indigo-900 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-indigo-500" /> الطرف الأول (مقدم الخدمة / المكتب)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">اسم الجهة / الشركة</label>
                <input
                  type="text"
                  value={firstPartyName}
                  onChange={(e) => setFirstPartyName && setFirstPartyName(e.target.value)}
                  placeholder="مثال: مكتب الإبداع الهندسي"
                  className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">يمثلها في التوقيع</label>
                <input
                  type="text"
                  value={firstPartyRep}
                  onChange={(e) => setFirstPartyRep && setFirstPartyRep(e.target.value)}
                  placeholder="مثال: م. أحمد محمد"
                  className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* الطرف الثاني */}
          <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/50 space-y-3">
            <h4 className="text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-500" /> الطرف الثاني (طالب الخدمة / العميل)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">اسم الجهة / العميل</label>
                <input
                  type="text"
                  value={secondPartyName}
                  onChange={(e) => setSecondPartyName && setSecondPartyName(e.target.value)}
                  placeholder="اسم العميل أو شركته"
                  className="w-full px-3 py-2 bg-white border border-emerald-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold text-slate-700"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500">يمثله في التوقيع (إن وجد)</label>
                <input
                  type="text"
                  value={secondPartyRep}
                  onChange={(e) => setSecondPartyRep && setSecondPartyRep(e.target.value)}
                  placeholder="صفة أو اسم الموقع (اختياري)"
                  className="w-full px-3 py-2 bg-white border border-emerald-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5️⃣ قسم أسلوب التعامل والتفويض */}
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] space-y-3 mb-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-bold text-[#475569] pb-2 border-b border-slate-50">
          <ShieldCheck className="w-4 h-4 text-emerald-500" /> أسلوب التعامل والتفويض القانوني (يظهر في التمهيد):
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