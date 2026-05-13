import React from "react";
import { Map, Ruler, Plus } from "lucide-react";

export default function BoundariesTab({ data, handleArrayChange, setData, inputClass }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-sm font-black text-rose-800 border-b border-rose-100 pb-3 mb-5 flex items-center gap-2">
          <Map className="w-4 h-4" /> الحدود الجغرافية (Borders)
        </h4>
        <div className="grid grid-cols-5 gap-3 text-[10px] font-bold text-slate-500 text-center mb-2 px-1">
          <div className="col-span-1 text-right">الاتجاه</div>
          <div className="col-span-3">وصف الحد</div>
          <div className="col-span-1">الطول (م)</div>
        </div>
        <div className="space-y-2">
          {data.boundaries?.map((item, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-3 items-center">
              <input value={item.direction || ""} onChange={(e) => handleArrayChange("boundaries", idx, "direction", e.target.value)} className={`${inputClass} col-span-1`} placeholder="شمالاً" />
              <input value={item.desc || ""} onChange={(e) => handleArrayChange("boundaries", idx, "desc", e.target.value)} className={`${inputClass} col-span-3`} placeholder="وصف الحد" />
              <input value={item.length || ""} onChange={(e) => handleArrayChange("boundaries", idx, "length", e.target.value)} className={`${inputClass} col-span-1 text-center font-mono`} type="number" />
            </div>
          ))}
          <button onClick={() => setData({ ...data, boundaries: [...data.boundaries, { direction: "", desc: "", length: 0 }] })} className="text-[11px] font-bold text-rose-600 mt-2 flex items-center gap-1">
            <Plus className="w-3 h-3" /> إضافة حد
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h4 className="text-sm font-black text-rose-800 border-b border-rose-100 pb-3 mb-5 flex items-center gap-2">
          <Ruler className="w-4 h-4" /> الارتدادات (Setbacks)
        </h4>
        <table className="w-full text-right text-[10px] font-bold border-separate border-spacing-y-2">
          <thead className="text-slate-400">
            <tr>
              <th className="px-2 pb-2">الجهة</th>
              <th className="px-2 pb-2 text-center">النظامي (م)</th>
              <th className="px-2 pb-2 text-center">المنفذ (م)</th>
              <th className="px-2 pb-2 text-center">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {data.setbacks?.map((item, idx) => (
              <tr key={idx} className={item.status === "مخالف" ? "bg-rose-50/50 rounded-lg" : ""}>
                <td className="p-1"><input value={item.direction || ""} onChange={(e) => handleArrayChange("setbacks", idx, "direction", e.target.value)} className={`${inputClass}`} /></td>
                <td className="p-1"><input value={item.required || ""} onChange={(e) => handleArrayChange("setbacks", idx, "required", e.target.value)} className={`${inputClass} text-center font-mono`} type="number" /></td>
                <td className="p-1"><input value={item.implemented || ""} onChange={(e) => handleArrayChange("setbacks", idx, "implemented", e.target.value)} className={`${inputClass} text-center font-mono`} type="number" /></td>
                <td className="p-1 text-center">
                  <select value={item.status || "مطابق"} onChange={(e) => handleArrayChange("setbacks", idx, "status", e.target.value)} className={`${inputClass} ${item.status === "مخالف" ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                    <option value="مطابق">مطابق</option>
                    <option value="مخالف">مخالف</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setData({ ...data, setbacks: [...data.setbacks, { direction: "", required: 0, implemented: 0, status: "مطابق" }] })} className="text-[11px] font-bold text-rose-600 mt-2 flex items-center gap-1">
          <Plus className="w-3 h-3" /> إضافة ارتداد
        </button>
      </div>
    </div>
  );
}