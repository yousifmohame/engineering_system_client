import React from "react";
import { useReport } from "../../context/ReportContext";
import { History } from "lucide-react";

export default function CompareStep() {
  const { data } = useReport(); // لجلب البيانات عند ربطها مستقبلاً

  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-2">
        <History className="w-4 h-4 text-emerald-600" /> مقارنة النسخ (Revisions)
      </h3>
      <div className="flex gap-2 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <select className="flex-1 border border-slate-200 rounded p-2 text-xs font-bold outline-none">
          <option>المسودة الحالية (Unsaved)</option>
        </select>
        <div className="text-slate-400 font-black self-center">VS</div>
        <select className="flex-1 border border-slate-200 rounded p-2 text-xs font-bold outline-none">
          <option>الإصدار R00</option>
          <option>آخر إصدار معتمد</option>
        </select>
      </div>
      <div className="flex-1 border border-slate-200 rounded-xl bg-slate-50 overflow-y-auto p-4 text-center">
        <p className="text-xs text-slate-500 font-bold mb-4">
          التغييرات التي تمت:
        </p>
        <div className="space-y-2 max-w-sm mx-auto text-right">
          <div className="bg-white p-3 rounded shadow-sm border border-slate-100 text-[10px] font-bold">
            <span className="text-amber-500 block mb-1">الارتدادات والحدود</span>
            تمت إضافة{" "}
            <span className="text-emerald-600 bg-emerald-50 px-1 rounded">
              4 حدود
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}