import React from "react";
import { Scale, Plus } from "lucide-react";

export default function EngineeringTab({ data, handleChange, handleArrayChange, setData, inputClass, labelClass }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h4 className="text-sm font-black text-amber-800 border-b border-amber-100 pb-3 mb-5 flex items-center gap-2">
        <Scale className="w-4 h-4" /> المساحات والمعطيات الهندسية
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
        <div className="col-span-2">
          <label className={labelClass}>مساحة الأرض الإجمالية (م2)</label>
          <input name="totalArea" value={data.totalArea || ""} onChange={handleChange} className="w-full mt-1.5 px-4 py-3 text-sm font-black text-amber-700 bg-amber-50/50 border border-amber-200 rounded-xl outline-none focus:ring-4 focus:ring-amber-500/10 font-mono" type="number" />
        </div>
        <div>
          <label className={labelClass}>نسبة التغطية %</label>
          <input name="coverageRatio" value={data.coverageRatio || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono`} type="number" />
        </div>
        <div>
          <label className={labelClass}>معامل البناء F.A.R</label>
          <input name="far" value={data.far || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono`} type="number" />
        </div>
        <div>
          <label className={labelClass}>الأدوار فوق الأرض</label>
          <input name="floorsAbove" value={data.floorsAbove || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono text-center`} type="number" />
        </div>
        <div>
          <label className={labelClass}>الأدوار تحت الأرض</label>
          <input name="floorsBelow" value={data.floorsBelow || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono text-center`} type="number" />
        </div>
        <div>
          <label className={labelClass}>مواقف (مطلوبة)</label>
          <input name="parkingRequired" value={data.parkingRequired || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono text-center`} type="number" />
        </div>
        <div>
          <label className={labelClass}>مواقف (متوفرة)</label>
          <input name="parkingAvailable" value={data.parkingAvailable || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono text-center`} type="number" />
        </div>
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h5 className="text-xs font-black text-slate-800 mb-3">تفصيل مسطحات البناء</h5>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {data.floorAreas?.map((item, idx) => (
            <div key={idx} className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm">
              <input value={item.floor || ""} onChange={(e) => handleArrayChange("floorAreas", idx, "floor", e.target.value)} className="block w-full text-center text-[10px] text-slate-500 font-bold mb-2 outline-none" placeholder="اسم الدور" />
              <div className="flex items-center justify-center gap-1">
                <input value={item.area || ""} onChange={(e) => handleArrayChange("floorAreas", idx, "area", e.target.value)} className="font-mono text-sm w-16 text-center font-black text-slate-800 outline-none" type="number" />
                <span className="text-[10px] font-bold text-slate-400">م2</span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={() => setData({ ...data, floorAreas: [...data.floorAreas, { floor: "دور إضافي", area: 0 }] })} className="text-[11px] font-bold text-amber-600 hover:text-amber-800 mt-3 flex items-center gap-1">
          <Plus className="w-3 h-3" /> إضافة دور
        </button>
      </div>
    </div>
  );
}