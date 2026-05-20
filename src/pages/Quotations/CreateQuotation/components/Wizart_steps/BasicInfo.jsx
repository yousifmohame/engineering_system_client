import React from "react";
import { FileSearch } from "lucide-react";
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
// الخطوة 1: البيانات الأساسية
// ==========================================
export const Step1BasicInfo = ({ props }) => {
  const {
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
    serviceYearsList,
    licenseYearsList,
  } = props;

  return (
    <div className="animate-in fade-in duration-300">
      

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
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-[#c5983c]/70"
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
              className={`w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-[#c5983c]/70 ${validityDays === "unlimited" ? "bg-[#fbf8f1] font-bold" : ""}`}
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
                  ? "bg-slate-800 text-white border-slate-800 shadow-[0_8px_18px_rgba(18,63,89,0.08)]"
                  : "bg-white text-[#475569] border-[#d8b46a]/25 hover:bg-[#fbf8f1]"
              }`}
            >
              {val === "unlimited" ? "غير محدد" : `${val} أيام`}
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
                ? "bg-emerald-50 text-[#0f766e] border-emerald-200"
                : "bg-[#fbf8f1] text-[#94a3b8] border-[#d8b46a]/25 hover:bg-[#eef7f6]"
            }`}
          >
            {isRenewable ? "نعم" : "لا"}
          </button>
        </div>
      </div>

      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 border-r-[3px] border-r-cyan-600 mb-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative">
        <div className="text-xs font-bold text-cyan-700 mb-3 flex min-w-0 items-center gap-1.5">
          <IconWithText icon={FileSearch} iconClassName="w-3.5 h-3.5" /> بيانات الخدمة والرخصة
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              نوع المعاملة
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-[#c5983c]/70 bg-white"
            >
              <option value="">— اختر المعاملة —</option>
              <option value="إفراغ عقاري">إفراغ عقاري</option>
              <option value="رهن عقاري">رهن عقاري</option>
              <option value="تصحيح وضع مبنى قائم">تصحيح وضع مبنى قائم</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              رقم الخدمة
            </label>
            <input
              type="text"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-[#c5983c]/70"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              سنة طلب الخدمة
            </label>
            <select
              value={serviceYear}
              onChange={(e) => setServiceYear(e.target.value)}
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-[#c5983c]/70 bg-white"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              رقم الرخصة
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full p-2 border border-[#d8b46a]/25 rounded-xl text-xs font-mono outline-none focus:border-[#c5983c]/70"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1">
              سنة الرخصة
            </label>
            <select
              value={licenseYear}
              onChange={(e) => setLicenseYear(e.target.value)}
              className={`w-full p-2 border rounded-xl text-xs font-mono outline-none bg-white transition-colors ${
                transactionType === "تصحيح وضع مبنى قائم"
                  ? "border-amber-400 focus:border-amber-500 bg-amber-50/30"
                  : "border-[#d8b46a]/25 focus:border-[#c5983c]/70"
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
