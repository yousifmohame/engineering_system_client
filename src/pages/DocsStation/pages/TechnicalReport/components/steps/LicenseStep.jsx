import React from "react";
import { useReport } from "../../context/ReportContext";

export default function LicenseStep() {
  const { data, updateData } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2">بيانات الرخصة السابقة</h3>
      <div>
        <label className="text-xs font-bold text-slate-600 block mb-2">حالة الرخصة</label>
        <div className="flex gap-2 mb-4">
          {["لا توجد رخصة", "حديثة إلكترونية", "قديمة يدوية"].map(status => (
            <button key={status} onClick={() => updateData('licenseStatus', status)} className={`flex-1 py-2 rounded-lg text-xs font-bold border ${data.licenseStatus === status ? "bg-emerald-50 border-emerald-300 text-emerald-800" : "bg-white border-slate-200 text-slate-600"}`}>
              {status}
            </button>
          ))}
        </div>
      </div>
      {data.licenseStatus !== "لا توجد رخصة" && (
        <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2">
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">رقم الرخصة</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none" type="text" value={data.licenseNumber} onChange={e=>updateData('licenseNumber',e.target.value)} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">تاريخ / سنة الرخصة</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none" type="text" value={data.licenseDate} onChange={e=>updateData('licenseDate',e.target.value)} /></div>
        </div>
      )}
    </div>
  );
}