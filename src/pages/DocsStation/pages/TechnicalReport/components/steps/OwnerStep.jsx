import React, { useState } from "react";
import { useReport } from "../../context/ReportContext";
import { User, Search, List, PlusCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../../api/axios";

export default function OwnerStep() {
  const { data, updateData, selectedClient, setSelectedClient } = useReport();
  const [mode, setMode] = useState("search"); // 'search' | 'manual'
  const [search, setSearch] = useState("");

  const { data: clients, isLoading } = useQuery({
    queryKey: ["clients-search", search],
    queryFn: async () => (await api.get("/clients/simple", { params: { search } })).data,
  });

  const getClientName = (client) => client.name || `${client.firstNameAr || ''} ${client.lastNameAr || ''}`.trim() || client.entityNameAr || "عميل غير معروف";

  const handleSelectClient = (client) => {
    setSelectedClient(client.id);
    updateData("ownerName", getClientName(client));
    updateData("ownerId", client.idNumber || client.unifiedNumber || "");
    updateData("ownerType", client.type === "company" ? "مفوض" : "مالك");
  };

  return (
    <div className="space-y-4 animate-in fade-in flex flex-col h-full">
      <div className="flex justify-between items-end border-b pb-2">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><User className="w-4 h-4 text-emerald-600"/> بيانات العميل والمالك</h3>
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setMode("search")} className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${mode === "search" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500"}`}>
            <List className="w-3.5 h-3.5" /> مسجل مسبقاً
          </button>
          <button onClick={() => { setMode("manual"); setSelectedClient(null); }} className={`px-3 py-1.5 text-[10px] font-bold rounded-md flex items-center gap-1.5 transition-all ${mode === "manual" ? "bg-white shadow-sm text-emerald-700" : "text-slate-500"}`}>
            <PlusCircle className="w-3.5 h-3.5" /> إدخال يدوي
          </button>
        </div>
      </div>

      {mode === "search" ? (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث باسم العميل، الهوية، الجوال..." className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500 bg-slate-50 font-bold" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar border border-slate-100 rounded-xl p-2 bg-slate-50/50">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-emerald-500 animate-spin" /></div>
            ) : clients?.length > 0 ? (
              clients.map((client) => {
                const isSelected = selectedClient === client.id;
                return (
                  <div key={client.id} onClick={() => handleSelectClient(client)} className={`flex justify-between items-center p-3 mb-2 rounded-xl cursor-pointer border transition-all ${isSelected ? "border-emerald-500 bg-emerald-50 shadow-sm" : "border-slate-200 bg-white hover:border-emerald-300"}`}>
                    <div className="flex items-center gap-3">
                      {isSelected ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                      <div>
                        <span className={`font-black text-xs block ${isSelected ? "text-emerald-800" : "text-slate-700"}`}>{getClientName(client)}</span>
                        <span className="text-[10px] text-slate-500 font-bold mt-0.5 block">{client.idNumber || client.unifiedNumber || "بدون هوية"}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-xs text-slate-400 text-center py-8 font-bold">لا يوجد عملاء مطابقين</div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4 pt-2">
          <div><label className="text-xs font-bold text-slate-600 block mb-1.5">الاسم الظاهر في التقرير</label><input className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none font-bold text-slate-800" type="text" value={data.ownerName} onChange={(e) => updateData('ownerName', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">صفة العميل</label>
              <select className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none bg-white font-bold text-slate-800" value={data.ownerType} onChange={(e) => updateData('ownerType', e.target.value)}>
                <option>مالك</option><option>وكيل</option><option>مفوض</option>
              </select>
            </div>
            <div><label className="text-xs font-bold text-slate-600 block mb-1.5">رقم الهوية / السجل</label><input className="w-full border border-slate-200 rounded-lg p-2.5 text-sm focus:border-emerald-500 outline-none font-bold text-slate-800" type="text" value={data.ownerId} onChange={(e) => updateData('ownerId', e.target.value)} /></div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 space-y-2 mt-auto shrink-0">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input className="rounded text-emerald-600 w-4 h-4" type="checkbox" checked={data.showOwnerName} onChange={e=>updateData('showOwnerName', e.target.checked)} /> إظهار اسم العميل في التقرير المطبوع
        </label>
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
          <input className="rounded text-emerald-600 w-4 h-4" type="checkbox" checked={data.maskOwnerId} onChange={e=>updateData('maskOwnerId', e.target.checked)} /> تقنيع أرقام الهوية للخصوصية (مثال: 10****4455)
        </label>
      </div>
    </div>
  );
}