import React, { useState } from "react";
import { FileSearch, Loader2, Type, ChevronDown, MapPin, AlignLeft, Book } from "lucide-react";

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

const getFallbackHijriYears = () => {
  const currentYear = 1445; 
  const years = [];
  for (let y = currentYear + 5; y >= 1400; y--) {
    years.push({ value: y.toString(), label: `${y} هـ` });
  }
  return years;
};

export const Step1BasicInfo = ({ props }) => {
  const {
    // 🌟 المتغيرات الجديدة التي تمت إضافتها
    subject,
    setSubject,
    address,
    setAddress,
    
    // المتغيرات السابقة
    issueDate,
    setIssueDate,
    validityDays,
    setValidityDays,
    isRenewable,
    setIsRenewable,
    transactionType,
    setTransactionType,
    serviceNumber,
    setServiceNumber,
    serviceYear,
    setServiceYear,
    licenseNumber,
    setLicenseNumber,
    licenseYear,
    setLicenseYear,
    serviceYearsList = getFallbackHijriYears(), 
    licenseYearsList = getFallbackHijriYears(),
    officeServices = [],
    servicesLoading,
  } = props;

  const [showServicesDropdown, setShowServicesDropdown] = useState(false);

  const handleDropdownBlur = () => {
    setTimeout(() => setShowServicesDropdown(false), 200);
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* 🌟 كارت العناوين الرئيسية (الموضوع والعنوان) */}
      <div className="p-4 bg-white rounded-xl border border-[#d8b46a]/25 border-r-[3px] border-r-indigo-500 mb-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
        <div className="text-xs font-bold text-indigo-700 mb-4 flex min-w-0 items-center gap-1.5">
          <IconWithText icon={AlignLeft} iconClassName="w-4 h-4" /> البيانات الوصفية للمستند
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              موضوع العرض <span className="text-indigo-500/70 text-[9px] font-normal">(يظهر في صفحة الغلاف)</span>
            </label>
            <div className="relative">
              <AlignLeft className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={subject || ""}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثال: عرض سعر للإشراف الهندسي..."
                className="w-full py-2 pr-9 pl-3 border border-[#d8b46a]/35 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              العنوان<span className="text-indigo-500/70 text-[9px] font-normal">(يظهر في ترويسة الغلاف)</span>
            </label>
            <div className="relative">
              <Book className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={address || ""}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="مثال: عرض سعر "
                className="w-full py-2 pr-9 pl-3 border border-[#d8b46a]/35 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-200 transition-all bg-slate-50/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 🌟 كارت معلومات العرض العامة (التواريخ والصلاحية) */}
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 mb-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              تاريخ العرض
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-[#c5983c]/70 transition-colors"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              صلاحية العرض (أيام)
            </label>
            <input
              type="text"
              value={validityDays === "unlimited" ? "غير محدد" : validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              readOnly={validityDays === "unlimited"}
              className={`w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-[#c5983c]/70 transition-colors ${validityDays === "unlimited" ? "bg-[#fbf8f1] font-bold text-center" : "font-mono"}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3 justify-center md:justify-start">
          {[3, 7, 14, 30, 60, "unlimited"].map((val) => (
            <button
              key={val}
              onClick={() => setValidityDays(val)}
              className={`px-4 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer border transition-colors ${
                validityDays === val
                  ? "bg-slate-800 text-white border-slate-800 shadow-[0_8px_18px_rgba(18,63,89,0.08)] scale-[1.02]"
                  : "bg-white text-[#475569] border-[#d8b46a]/25 hover:bg-[#fbf8f1]"
              }`}
            >
              {val === "unlimited" ? "مفتوح / غير محدد" : `${val} أيام`}
            </button>
          ))}
        </div>

        <div className="flex min-w-0 items-center gap-2 pt-3 border-t border-[#e8ddc8]">
          <label className="text-[11px] font-bold text-[#475569]">
            قابل للتجديد التلقائي؟
          </label>
          <button
            onClick={() => setIsRenewable(!isRenewable)}
            className={`px-4 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
              isRenewable
                ? "bg-emerald-50 text-[#0f766e] border-emerald-200 shadow-sm"
                : "bg-[#fbf8f1] text-[#94a3b8] border-[#d8b46a]/25 hover:bg-[#eef7f6]"
            }`}
          >
            {isRenewable ? "نعم" : "لا"}
          </button>
        </div>
      </div>

      {/* 🌟 كارت بيانات الخدمة والمراجع */}
      <div className="p-4 bg-white rounded-xl border border-[#d8b46a]/25 border-r-[3px] border-r-cyan-600 mb-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative">
        <div className="text-xs font-bold text-cyan-700 mb-4 flex min-w-0 items-center gap-1.5">
          <IconWithText icon={FileSearch} iconClassName="w-4 h-4" /> بيانات
          الخدمة والرخصة
        </div>

        {/* 🚀 حقل نوع الخدمة في سطر منفصل */}
        <div className="mb-4">
          <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
            نوع الخدمة / المعاملة <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Type className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              onFocus={() => setShowServicesDropdown(true)}
              onBlur={handleDropdownBlur}
              placeholder="اكتب اسم الخدمة يدوياً أو اختر..."
              className="w-full py-2 pr-9 pl-8 border border-[#d8b46a]/35 rounded-xl text-xs font-bold outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all bg-slate-50/50"
            />
            <button
              onClick={() => setShowServicesDropdown(!showServicesDropdown)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-cyan-600 rounded-md"
              type="button"
            >
              {servicesLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* القائمة المنسدلة للخدمات */}
            {showServicesDropdown && (
              <div className="absolute top-full right-0 left-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 custom-scrollbar-slim">
                {officeServices && officeServices.length > 0 ? (
                  officeServices.map((srv) => (
                    <div
                      key={srv.id || srv.code}
                      onClick={() => {
                        setTransactionType(srv.name);
                        setShowServicesDropdown(false);
                      }}
                      className="px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer transition-colors"
                    >
                      {srv.name}
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      onClick={() => setTransactionType("إفراغ عقاري")}
                      className="px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer"
                    >
                      إفراغ عقاري
                    </div>
                    <div
                      onClick={() => setTransactionType("رهن عقاري")}
                      className="px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer"
                    >
                      رهن عقاري
                    </div>
                    <div
                      onClick={() =>
                        setTransactionType("تصحيح وضع مبنى قائم")
                      }
                      className="px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-cyan-50 hover:text-cyan-700 cursor-pointer"
                    >
                      تصحيح وضع مبنى قائم
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          <p className="text-[9px] text-slate-400 mt-1 mr-1">
            سيظهر هذا في نوع المستند في المعاينة. يمكنك الاختيار أو الكتابة يدوياً.
          </p>
        </div>

        {/* الحقول الأخرى في سطر (رقم الطلب وسنة الطلب) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 border-t border-slate-50 pt-4">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              رقم الطلب / الخدمة
            </label>
            <input
              type="text"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              placeholder="مثال: 44002938"
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              سنة طلب الخدمة
            </label>
            <select
              value={serviceYear}
              onChange={(e) => setServiceYear(e.target.value)}
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all bg-white"
            >
              <option value="">— اختر السنة —</option>
              {serviceYearsList?.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-4">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              رقم الرخصة (إن وُجد)
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              placeholder="رقم رخصة البناء إن كان متوفراً"
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 transition-all bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              سنة الرخصة
            </label>
            <select
              value={licenseYear}
              onChange={(e) => setLicenseYear(e.target.value)}
              className={`w-full p-2 border rounded-xl text-xs font-mono outline-none bg-white transition-colors ${
                transactionType === "تصحيح وضع مبنى قائم"
                  ? "border-amber-400 focus:border-amber-500 bg-amber-50/30 ring-1 ring-amber-200"
                  : "border-[#d8b46a]/25 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
              }`}
            >
              <option value="">— اختر السنة —</option>
              {licenseYearsList?.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};