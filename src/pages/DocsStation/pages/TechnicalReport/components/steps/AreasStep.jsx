import React from "react";
import { useReport } from "../../context/ReportContext";

export default function AreasStep() {
  const { data, updateData } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex justify-between items-center">
        المساحات والاستخدام
        <button className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100 transition">مزامنة كالصك</button>
      </h3>
      <div className="grid grid-cols-3 gap-3">
        <div><label className="text-[10px] font-black text-slate-500 block mb-1.5">حسب الصك (م²)</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono outline-none focus:border-emerald-500" type="text" value={data.areaDeed} onChange={e=>updateData('areaDeed',e.target.value)} /></div>
        <div><label className="text-[10px] font-black text-slate-500 block mb-1.5">حسب الطبيعة (م²)</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono outline-none focus:border-amber-500" type="text" value={data.areaSite} onChange={e=>updateData('areaSite',e.target.value)} /></div>
        <div><label className="text-[10px] font-black text-slate-500 block mb-1.5">حسب الرخصة (م²)</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono outline-none focus:border-emerald-500" type="text" value={data.areaLicense} onChange={e=>updateData('areaLicense',e.target.value)} /></div>
      </div>
      <div className="pt-4 mt-2 border-t border-slate-100">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">الاستخدام المرخص</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none bg-slate-50" type="text" value={data.usageLicensed} onChange={e=>updateData('usageLicensed',e.target.value)} /></div>
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">الاستخدام القائم</label><input className="w-full border border-amber-300 bg-amber-50 rounded-lg p-2 text-sm outline-none" type="text" value={data.usageExisting} onChange={e=>updateData('usageExisting',e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
}