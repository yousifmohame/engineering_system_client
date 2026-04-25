import React from "react";
import { FileSearch } from "lucide-react";

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
      

      <div className="p-4 bg-white rounded-xl border border-slate-200 mb-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              تاريخ العرض
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              صلاحية العرض (أيام)
            </label>
            <input
              type="text"
              value={validityDays === "unlimited" ? "غير محدد" : validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              readOnly={validityDays === "unlimited"}
              className={`w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 ${validityDays === "unlimited" ? "bg-slate-100 font-bold" : ""}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
          {[3, 7, 14, 30, 60, "unlimited"].map((val) => (
            <button
              key={val}
              onClick={() => setValidityDays(val)}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold cursor-pointer border transition-colors ${
                validityDays === val
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {val === "unlimited" ? "غير محدد" : `${val} أيام`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-700">
            قابل للتجديد التلقائي؟
          </label>
          <button
            onClick={() => setIsRenewable(!isRenewable)}
            className={`px-4 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
              isRenewable
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isRenewable ? "نعم" : "لا"}
          </button>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200 border-r-[3px] border-r-cyan-600 mb-3 shadow-sm relative">
        <div className="text-xs font-bold text-cyan-700 mb-3 flex items-center gap-1.5">
          <FileSearch className="w-3.5 h-3.5" /> بيانات الخدمة والرخصة
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              نوع المعاملة
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— اختر المعاملة —</option>
              <option value="إفراغ عقاري">إفراغ عقاري</option>
              <option value="رهن عقاري">رهن عقاري</option>
              <option value="تصحيح وضع مبنى قائم">تصحيح وضع مبنى قائم</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              رقم الخدمة
            </label>
            <input
              type="text"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              سنة طلب الخدمة
            </label>
            <select
              value={serviceYear}
              onChange={(e) => setServiceYear(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500 bg-white"
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
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              رقم الرخصة
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              سنة الرخصة
            </label>
            <select
              value={licenseYear}
              onChange={(e) => setLicenseYear(e.target.value)}
              className={`w-full p-2 border rounded-lg text-xs font-mono outline-none bg-white transition-colors ${
                transactionType === "تصحيح وضع مبنى قائم"
                  ? "border-amber-400 focus:border-amber-500 bg-amber-50/30"
                  : "border-slate-300 focus:border-blue-500"
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
