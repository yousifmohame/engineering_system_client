import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { 
  Loader2, 
  Search, 
  Grid3X3, 
  ChevronRight, 
  User, 
  ExternalLink,
  MapPin,
  Fingerprint,
  X,
  FileBox
} from "lucide-react";

export default function PlotsDetailsTab({ planId, setArchiveModal, setClientModal }) {
  const [selectedPlot, setSelectedPlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // جلب البيانات الخاصة بالقطع المرتبطة بهذا المخطط
  const { data: plotsDetails = [], isLoading: plotsLoading } = useQuery({
    queryKey: ["plan-plots-details", planId],
    queryFn: async () => {
      const res = await api.get(`/riyadh-streets/plans/${planId}/plots-details`);
      return res.data; // 👈 الباك إند يرجع المصفوفة مباشرة بناءً على التعديل الأخير
    },
    enabled: !!planId,
  });

  // 💡 التجميع الذكي: تجميع المشاريع تحت الكيان الرئيسي للقطعة
  const groupedPlots = useMemo(() => {
    if (!plotsDetails || plotsDetails.length === 0) return [];
    
    const groups = {};
    plotsDetails.forEach((item) => {
      const key = item.plotNumber || "غير محدد";
      
      if (!groups[key]) {
        groups[key] = {
          plotId: item.plotId,
          plotNumber: item.plotNumber,
          plotCode: item.plotCode,
          records: [], // المشاريع المرتبطة
        };
      }
      
      // إذا كان هناك مشروع مرتبط بالقطعة، أضفه للسجلات
      if (item.project) {
        groups[key].records.push(item.project);
      }
    });

    // تحويل الكائن إلى مصفوفة وترتيبها تصاعدياً حسب رقم القطعة
    return Object.values(groups).sort((a, b) => 
      a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true })
    );
  }, [plotsDetails]);

  // 🔍 محرك البحث الاحترافي (يبحث برقم القطعة أو بالكود المميز)
  const filteredPlots = useMemo(() => {
    if (!searchTerm.trim()) return groupedPlots;
    
    const lowerTerm = searchTerm.toLowerCase().trim();
    return groupedPlots.filter(
      (p) =>
        p.plotNumber.toLowerCase().includes(lowerTerm) ||
        (p.plotCode && p.plotCode.toLowerCase().includes(lowerTerm))
    );
  }, [groupedPlots, searchTerm]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden animate-in fade-in" dir="rtl">
      
      {!selectedPlot ? (
        // =================================================================
        // 🟩 العرض الأول: شبكة المربعات (Master Grid View)
        // =================================================================
        <>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                القطع التابعة للمخطط
              </h4>
              <p className="text-xs text-slate-500 font-bold mt-1">
                اضغط على أي قطعة لعرض جميع المعاملات والمشاريع المقامة عليها.
              </p>
            </div>
            
            {/* 🔍 شريط البحث الاحترافي */}
            <div className="relative w-full sm:w-72 group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="ابحث برقم القطعة أو الكود..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all shadow-sm" 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
            {plotsLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <Loader2 className="animate-spin text-indigo-600 w-10 h-10" />
                <p className="text-sm font-bold text-slate-500">جاري تحميل خريطة القطع...</p>
              </div>
            ) : filteredPlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
                {filteredPlots.map((plot) => (
                  <button
                    key={plot.plotId}
                    onClick={() => setSelectedPlot(plot)}
                    className="aspect-square bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 p-3 hover:border-indigo-400 hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden text-center"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* رقم القطعة */}
                    <span className="text-3xl font-black text-slate-700 group-hover:text-indigo-700 transition-colors">
                      {plot.plotNumber}
                    </span>
                    
                    {/* كود القطعة المميز */}
                    <span className="text-[9px] font-mono text-slate-400 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-100 flex items-center gap-1 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <Fingerprint className="w-3 h-3" /> {plot.plotCode || "بدون كود"}
                    </span>
                    
                    {/* عدد السجلات */}
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full mt-1 w-full flex items-center justify-center gap-1.5 transition-colors
                      ${plot.records.length > 0 
                        ? "bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-100" 
                        : "bg-slate-100 text-slate-500"}`}
                    >
                      <FileBox className="w-3 h-3" />
                      {plot.records.length} سجل
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-slate-200 rounded-3xl h-full">
                <Grid3X3 className="mb-4 text-slate-200" size={60} />
                <span className="font-black text-slate-600 text-lg">لا توجد قطع مطابقة</span>
                <span className="text-sm font-bold text-slate-400 mt-1">
                  {searchTerm ? "جرب البحث برقم أو كود مختلف." : "لم يتم تسجيل أي قطع لهذا المخطط حتى الآن."}
                </span>
              </div>
            )}
          </div>
        </>
      ) : (
        
        // =================================================================
        // 🗂️ العرض الثاني: تفاصيل القطعة المحددة (Detail Table View)
        // =================================================================
        <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-left-4 duration-300">
          
          {/* Header التفاصيل */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSelectedPlot(null)} 
                className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 shadow-sm transition-all"
                title="العودة لخريطة القطع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div>
                <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
                  التاريخ السجلي للقطعة
                  <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-0.5 rounded-lg text-lg">
                    {selectedPlot.plotNumber}
                  </span>
                </h4>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-[11px] text-slate-500 font-mono font-bold flex items-center gap-1">
                    <Fingerprint className="w-3.5 h-3.5" /> كود النظام: {selectedPlot.plotCode || "---"}
                  </span>
                  <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 flex items-center gap-1">
                    <FileBox className="w-3.5 h-3.5" /> {selectedPlot.records.length} سجل مؤرشف
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* جدول المشاريع المرتبطة */}
          <div className="flex-1 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col bg-white relative">
            {selectedPlot.records.length > 0 ? (
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-right text-sm border-collapse">
                  <thead className="bg-slate-800 text-white sticky top-0 z-10 shadow-md">
                    <tr>
                      <th className="p-4 font-bold text-xs">رقم/سنة الرخصة</th>
                      <th className="p-4 font-bold text-xs border-r border-slate-700">رقم/سنة الطلب</th>
                      <th className="p-4 font-bold text-xs border-r border-slate-700">المالك</th>
                      <th className="p-4 font-bold text-xs text-center border-r border-slate-700">فتح الملف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPlot.records.map((project, idx) => (
                      <tr key={idx} className="hover:bg-indigo-50/40 transition-colors">
                        
                        {/* بيانات الرخصة */}
                        <td className="p-4">
                          <div className="font-black text-slate-700">
                            {project.licenseNumber || "بدون رخصة"}
                          </div>
                          {project.licenseHijriYear && (
                            <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                              لسنة {project.licenseHijriYear} هـ
                            </div>
                          )}
                        </td>

                        {/* بيانات الطلب */}
                        <td className="p-4">
                          <div className="font-bold text-slate-700">
                            {project.requestNumber || "---"}
                          </div>
                          {project.requestYear && (
                            <div className="text-[11px] text-slate-400 font-bold mt-0.5">
                              سنة الطلب: {project.requestYear}
                            </div>
                          )}
                        </td>

                        {/* بيانات المالك */}
                        <td className="p-4">
                          {project.clientId ? (
                            <button 
                              type="button" 
                              onClick={() => setClientModal({ isOpen: true, clientId: project.clientId })} 
                              className="text-slate-800 font-black hover:text-indigo-600 transition-all flex items-center gap-2 group"
                            >
                              <div className="p-1.5 bg-slate-100 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                <User size={14} className="text-slate-500 group-hover:text-indigo-600" />
                              </div>
                              <span className="group-hover:underline">{project.ownerName || "---"}</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-slate-600 font-bold">
                              <User size={14} className="text-slate-400" /> {project.ownerName || "---"}
                            </div>
                          )}
                        </td>

                        {/* الإجراءات */}
                        <td className="p-4 text-center">
                          <button 
                            type="button" 
                            onClick={() => setArchiveModal({ isOpen: true, projectId: project.id })} 
                            className="inline-flex items-center justify-center p-2.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm transition-all active:scale-95" 
                            title={`فتح ملف الأرشيف (${project.archiveCode})`}
                          >
                            <ExternalLink size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              // ⚠️ حالة: قطعة موجودة في النظام ولكن لا يوجد عليها مشاريع
              <div className="flex flex-col items-center justify-center h-full bg-slate-50/50 p-10">
                <div className="w-20 h-20 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <FileBox className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-black text-slate-700">لا توجد معاملات مسجلة</h3>
                <p className="text-sm font-bold text-slate-500 mt-2 text-center max-w-md">
                  هذه القطعة مسجلة ومحفوظة في قاعدة بيانات المخطط، ولكن لم يتم ربط أي رخصة أو مشروع مؤرشف بها حتى الآن.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}