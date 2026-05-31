import React, { useState } from "react";
import { useReport } from "../../context/ReportContext";
import { House, Search, List, PlusCircle, Loader2, CheckCircle2, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../../api/axios";

export default function PropertyStep() {
  const { data, updateData, selectedProperty, setSelectedProperty } = useReport();
  const [mode, setMode] = useState("search");
  const [search, setSearch] = useState("");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["properties-search", search],
    queryFn: async () => {
      const res = await api.get("/properties", { params: { search } });
      return res.data?.data || res.data || [];
    },
  });

  const handleSelectProperty = (prop) => {
    setSelectedProperty(prop.id);
    updateData("deedNumber", prop.deedNumber || "");
    // تعبئة باقي البيانات إن توفرت
    updateData("district", prop.district || prop.city || "");
    updateData("planNumber", prop.planNumber || "");
    updateData("plotNumber", prop.plotNumber || "");
    updateData("areaDeed", prop.area || "");
    updateData("areaSite", prop.area || ""); // افتراضياً مطابقة
  };

  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <div className="flex justify-between items-end border-b pb-2">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><House className="w-4 h-4 text-emerald-600"/> بيانات الملكية والصك</h3>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setMode("search")} className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${mode === "search" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500"}`}>
            <List className="w-3.5 h-3.5" /> صك مسجل
          </button>
          <button onClick={() => { setMode("manual"); setSelectedProperty(null); }} className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${mode === "manual" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500"}`}>
            <PlusCircle className="w-3.5 h-3.5" /> صك جديد
          </button>
        </div>
      </div>

      {mode === "search" ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث برقم الصك، الكود، الحي..." className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 bg-slate-50 font-bold" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
            ) : properties?.length > 0 ? (
              properties.map((prop) => {
                const isSelected = selectedProperty === prop.id;
                return (
                  <div key={prop.id} onClick={() => handleSelectProperty(prop)} className={`flex justify-between items-center p-3 mb-2 rounded-xl cursor-pointer border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                      <div>
                        <span className={`font-black text-xs block ${isSelected ? "text-emerald-800" : "text-slate-700"}`}>رقم الصك: {prop.deedNumber || "غير مسجل"}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3"/> {prop.city} {prop.district ? `- ${prop.district}` : ''}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 text-center py-8 font-bold">لا يوجد صكوك مطابقة</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-600 block mb-1.5">رقم الصك</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono outline-none focus:border-emerald-500 font-bold" type="text" value={data.deedNumber} onChange={e=>updateData('deedNumber',e.target.value)} /></div>
            <div><label className="text-xs font-bold text-slate-600 block mb-1.5">تاريخ الصك</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm font-mono outline-none focus:border-emerald-500 font-bold" type="text" value={data.deedDate} onChange={e=>updateData('deedDate',e.target.value)} placeholder="مثال: 1445-01-01"/></div>
            <div><label className="text-xs font-bold text-slate-600 block mb-1.5">المدينة / الحي</label><input className="w-full border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500 font-bold" type="text" value={data.district} onChange={e=>updateData('district',e.target.value)} /></div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">المخطط / القطعة</label>
              <div className="flex gap-2">
                <input className="w-1/2 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500 font-bold placeholder:font-normal" placeholder="مخطط" type="text" value={data.planNumber} onChange={e=>updateData('planNumber',e.target.value)} />
                <input className="w-1/2 border border-slate-200 rounded-lg p-2 text-sm outline-none focus:border-emerald-500 font-bold placeholder:font-normal" placeholder="قطعة" type="text" value={data.plotNumber} onChange={e=>updateData('plotNumber',e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}