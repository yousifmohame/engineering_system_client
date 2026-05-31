import React from "react";
import { ShieldCheck, TriangleAlert } from "lucide-react";

export default function ReviewStep() {
  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600" /> الفحص العميق للإصدار
      </h3>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 text-center">
          <div className="text-[10px] font-black text-slate-500 mb-1">
            النتيجة النهائية
          </div>
          <div className="text-xl font-black text-amber-600 mb-1 flex justify-center items-center gap-2">
            <TriangleAlert className="w-5 h-5" /> يتطلب اتخاذ إجراء (85/100)
          </div>
          <p className="text-[10px] font-bold text-slate-600">
            تم رصد بعض المشاكل التي قد تمنع الاعتماد.
          </p>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-3 overflow-hidden">
            <div className="bg-amber-500 h-full w-[85%]"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="border border-rose-200 bg-rose-50 rounded-lg p-3">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <TriangleAlert className="w-3 h-3" /> بيانات الارتدادات غير مطابقة
              </span>
            </div>
            <p className="text-[10px] text-rose-700">
              الارتداد الأمامي المقترح أطول من النظامي بدون مبرر.
            </p>
          </div>
        </div>
      </div>
      <div className="w-full space-y-2 pt-2 border-t border-slate-100 shrink-0">
        <button className="w-full py-3 bg-emerald-600 text-white rounded-xl text-sm font-black hover:bg-emerald-700 shadow-sm transition">
          إصدار وتوثيق إلكتروني
        </button>
      </div>
    </div>
  );
}