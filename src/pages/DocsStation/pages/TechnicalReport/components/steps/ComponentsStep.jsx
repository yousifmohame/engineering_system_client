import React from "react";
import { useReport } from "../../context/ReportContext";
import { Plus, Trash2 } from "lucide-react";

export default function ComponentsStep() {
  const { data, updateArrayItem } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <div className="flex justify-between items-end border-b pb-2">
        <h3 className="text-sm font-black text-slate-800">مكونات المبنى</h3>
        <button className="text-[10px] font-bold text-white bg-emerald-600 px-3 py-1.5 rounded hover:bg-emerald-700 transition flex items-center gap-1"><Plus className="w-3 h-3"/> إضافة دور</button>
      </div>
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <th className="p-2 w-16">الدور</th><th className="p-2 w-28">الاستخدام</th><th className="p-2 w-16 text-center">القائم</th><th className="p-2 w-16 text-center">الرخصة</th><th className="p-2 w-16 text-center text-emerald-700">المقترح</th><th className="p-2">ملاحظات</th><th className="p-2 w-6"></th>
            </tr>
          </thead>
          <tbody>
            {data.components.map(comp => (
              <tr key={comp.id} className="border-b border-slate-100 group align-top hover:bg-emerald-50 transition-colors">
                <td className="p-1"><input className="w-full bg-white border border-transparent rounded px-1.5 py-1.5 outline-none font-medium" type="text" value={comp.level} onChange={(e) => updateArrayItem('components', comp.id, 'level', e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-white border border-transparent rounded px-1.5 py-1.5 outline-none" type="text" value={comp.usage} onChange={(e) => updateArrayItem('components', comp.id, 'usage', e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 outline-none text-center font-mono" type="text" value={comp.site} onChange={(e) => updateArrayItem('components', comp.id, 'site', e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 outline-none text-center font-mono" type="text" value={comp.license} onChange={(e) => updateArrayItem('components', comp.id, 'license', e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-1.5 py-1.5 outline-none text-center font-mono font-bold" type="text" value={comp.proposed} onChange={(e) => updateArrayItem('components', comp.id, 'proposed', e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-amber-50/50 border border-transparent rounded px-1.5 py-1.5 outline-none text-[10px]" type="text" value={comp.notes} onChange={(e) => updateArrayItem('components', comp.id, 'notes', e.target.value)} /></td>
                <td className="p-1 text-center align-middle"><button className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-100 rounded opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}