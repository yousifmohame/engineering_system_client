import React from "react";
import { useReport } from "../../context/ReportContext";
import { Plus } from "lucide-react";

export default function SetbacksStep() {
  const { data, updateArrayItem } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2">الارتدادات والحدود</h3>
      <div className="overflow-x-auto pb-4">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
              <th className="p-2 w-16">الجهة</th><th className="p-2 w-28">الحد (حسب الصك)</th><th className="p-2 w-16 text-center">الطول</th><th className="p-2 w-16 text-center">نظامي</th><th className="p-2 w-16 text-center">قائم</th><th className="p-2 w-16 text-center text-emerald-700">مقترح</th>
            </tr>
          </thead>
          <tbody>
            {data.setbacks.map(setback => (
              <tr key={setback.id} className="border-b border-slate-100 group align-top hover:bg-emerald-50 transition-colors">
                <td className="p-1"><input className="w-full bg-slate-50 font-bold border border-transparent rounded px-1.5 py-1.5 outline-none text-center" type="text" value={setback.direction} onChange={(e)=>updateArrayItem('setbacks', setback.id,'direction',e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-white border border-transparent rounded px-1.5 py-1.5 outline-none" type="text" value={setback.bound} onChange={(e)=>updateArrayItem('setbacks', setback.id,'bound',e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 outline-none text-center font-mono" type="text" value={setback.length} onChange={(e)=>updateArrayItem('setbacks', setback.id,'length',e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 outline-none text-center font-mono" type="text" value={setback.system} onChange={(e)=>updateArrayItem('setbacks', setback.id,'system',e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1.5 outline-none text-center font-mono" type="text" value={setback.site} onChange={(e)=>updateArrayItem('setbacks', setback.id,'site',e.target.value)} /></td>
                <td className="p-1"><input className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 rounded px-1.5 py-1.5 outline-none text-center font-mono font-bold" type="text" value={setback.proposed} onChange={(e)=>updateArrayItem('setbacks', setback.id,'proposed',e.target.value)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 p-4 border border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:border-emerald-500 hover:text-emerald-600 transition">
          <Plus className="w-4 h-4 mb-2" /> إضافة رسم توضيحي مبسط للقطعة
        </div>
      </div>
    </div>
  );
}