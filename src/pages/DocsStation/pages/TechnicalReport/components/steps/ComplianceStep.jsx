import React from "react";
import { useReport } from "../../context/ReportContext";
import { Cpu, Plus } from "lucide-react";

export default function ComplianceStep() {
  const { data, updateData, updateNestedData } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex justify-between items-center">
        المطابقة والملاحظات
        <div className="flex gap-2">
          <button className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded font-bold border border-emerald-200 flex items-center gap-1 hover:bg-emerald-100 transition"><Cpu className="w-3 h-3"/> فحص النواقص</button>
        </div>
      </h3>
      <div className="overflow-hidden border border-slate-200 rounded-lg bg-white shadow-sm">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr><th className="px-3 py-2 text-slate-600 font-bold w-2/3 border-l border-slate-200">بند المطابقة والتحقق</th><th className="px-3 py-2 text-slate-600 font-bold w-1/3 text-center">النتيجة</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {['nameMatch', 'plotMatch', 'areaMatch', 'usageMatch', 'componentsMatch'].map(field => {
              const titles = { nameMatch: 'مطابقة اسم المالك', plotMatch: 'مطابقة المخطط/القطعة', areaMatch: 'تطابق المساحات', usageMatch: 'تطابق الاستخدام', componentsMatch: 'تطابق المكونات' };
              return (
                <tr key={field} className="hover:bg-slate-50 transition-colors">
                  <td className="px-3 py-2 border-l border-slate-100 font-bold text-slate-700">{titles[field]}</td>
                  <td className="px-1 py-1">
                    <select value={data.compliance[field]} onChange={e=>updateNestedData('compliance', field, e.target.value)} className={`w-full p-1.5 rounded outline-none text-[10px] font-bold text-center ${data.compliance[field]==='مطابق'?'bg-emerald-50 text-emerald-800':'bg-amber-50 text-amber-800'}`}>
                      <option>مطابق</option><option>غير مطابق</option><option>يحتاج مراجعة</option>
                    </select>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex-1 flex flex-col pt-2">
        <label className="text-xs font-bold text-slate-600 block mb-1.5">الملاحظات الفنية للتقرير</label>
        <textarea value={data.technicalNotes} onChange={e => updateData('technicalNotes', e.target.value)} className="w-full flex-1 min-h-[150px] border border-slate-200 rounded-xl p-3 text-sm focus:border-emerald-500 outline-none leading-relaxed resize-none" />
      </div>
    </div>
  );
}