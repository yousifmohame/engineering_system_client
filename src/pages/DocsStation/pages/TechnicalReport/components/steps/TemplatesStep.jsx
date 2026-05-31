import React from "react";
import { useReport } from "../../context/ReportContext";
import { CircleCheck, Settings } from "lucide-react";

export default function TemplatesStep() {
  const { data, updateData } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2">القوالب ونوع المستند</h3>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h4 className="text-xs font-bold text-slate-700 mb-3 block">غرض التقرير</h4>
        <select className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:border-emerald-500 outline-none" value={data.purpose} onChange={e=>updateData('purpose', e.target.value)}>
          <option>إصدار رخصة بناء</option><option>تصحيح وضع مبنى قائم</option><option>تجديد رخصة</option><option>تعديل مكونات</option><option>تقرير للعميل</option><option>تقرير للجهة</option>
        </select>
      </div>
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-700 mt-2">القوالب المتاحة</h4>
        <div className="cursor-pointer p-4 rounded-xl border transition-all bg-emerald-50 border-emerald-500 shadow-sm">
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold text-sm text-emerald-800">التقرير الفني القياسي</span>
            <CircleCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex gap-2 text-[10px] mt-2"><span className="font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">TPL-TECH-STD-01</span></div>
        </div>
      </div>
    </div>
  );
}