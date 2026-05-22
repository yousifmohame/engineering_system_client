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


const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


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
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2.5">
            <div>
              <h4 className="text-sm font-black text-[#123f59] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#0e7490]" />
                القطع التابعة للمخطط
              </h4>
              <p className="text-xs text-[#94a3b8] font-bold mt-1">
                اضغط على أي قطعة لعرض جميع المعاملات والمشاريع المقامة عليها.
              </p>
            </div>
            
            {/* 🔍 شريط البحث الاحترافي */}
            <div className="relative w-full sm:w-72 group">
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Search className="w-4 h-4 text-[#94a3b8] group-focus-within:text-[#0e7490] transition-colors" />
              </div>
              <input 
                type="text"
                placeholder="ابحث برقم القطعة أو الكود..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-10 py-2.5 bg-white border border-[#e8ddc8] rounded-xl text-sm font-bold text-[#475569] outline-none focus:ring-4 focus:ring-[#0e7490]/10 focus:border-[#0e7490] transition-all shadow-[0_6px_14px_rgba(18,63,89,0.04)]" 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#94a3b8] hover:text-rose-500 transition-colors"
                >
                  <IconWithText icon={X} text="إغلاق" iconClassName="w-4 h-4" /></button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-slim custom-scrollbar pr-2 pb-6">
            {plotsLoading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-2.5">
                <Loader2 className="animate-spin text-[#0e7490] w-10 h-10" />
                <p className="text-sm font-bold text-[#94a3b8]">جاري تحميل خريطة القطع...</p>
              </div>
            ) : filteredPlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
                {filteredPlots.map((plot) => (
                  <button
                    key={plot.plotId}
                    onClick={() => setSelectedPlot(plot)}
                    className="aspect-square bg-white border border-[#e8ddc8] rounded-2xl flex flex-col items-center justify-center gap-2 p-3 hover:border-[#0e7490] hover:shadow-[0_8px_22px_rgba(18,63,89,0.06)] hover:-translate-y-1 transition-all group relative overflow-hidden text-center"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0e7490] to-[#0e7490] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    {/* رقم القطعة */}
                    <span className="text-sm font-black text-[#475569] group-hover:text-[#15536f] transition-colors">
                      {plot.plotNumber}
                    </span>
                    
                    {/* كود القطعة المميز */}
                    <span className="text-[9px] font-mono text-[#94a3b8] font-bold bg-[#fbf8f1] px-2 py-0.5 rounded border border-[#fbf8f1] flex items-center gap-1 group-hover:bg-[#eef7f6] group-hover:text-[#0e7490] transition-colors">
                      <Fingerprint className="w-3 h-3" /> {plot.plotCode || "بدون كود"}
                    </span>
                    
                    {/* عدد السجلات */}
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full mt-1 w-full flex items-center justify-center gap-1.5 transition-colors
                      ${plot.records.length > 0 
                        ? "bg-amber-50 text-amber-700 border border-amber-100 group-hover:bg-amber-100" 
                        : "bg-[#fbf8f1] text-[#94a3b8]"}`}
                    >
                      <FileBox className="w-3 h-3" />
                      {plot.records.length} سجل
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-[#e8ddc8] rounded-2xl h-full">
                <Grid3X3 className="mb-4 text-[#e8ddc8]" size={60} />
                <span className="font-black text-[#64748b] text-sm">لا توجد قطع مطابقة</span>
                <span className="text-sm font-bold text-[#94a3b8] mt-1">
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
          <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={() => setSelectedPlot(null)} 
                className="p-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[#94a3b8] hover:text-[#0e7490] hover:bg-[#eef7f6] hover:border-[#d8b46a]/35 shadow-[0_6px_14px_rgba(18,63,89,0.04)] transition-all"
                title="العودة لخريطة القطع"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <div>
                <h4 className="text-sm font-black text-[#123f59] flex items-center gap-2">
                  التاريخ السجلي للقطعة
                  <span className="text-[#15536f] bg-[#eef7f6] border border-[#d8b46a]/25 px-3 py-0.5 rounded-lg text-sm">
                    {selectedPlot.plotNumber}
                  </span>
                </h4>
                <div className="flex items-center gap-2.5 mt-1.5">
                  <span className="text-[11px] text-[#94a3b8] font-mono font-bold flex items-center gap-1">
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
          <div className="flex-1 border border-[#e8ddc8] rounded-2xl overflow-hidden shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex flex-col bg-white relative">
            {selectedPlot.records.length > 0 ? (
              <div className="overflow-y-auto custom-scrollbar-slim flex-1 custom-scrollbar">
                <table className="w-full text-right text-sm border-collapse">
                  <thead className="bg-[#123f59] text-white sticky top-0 z-10 shadow-[0_8px_18px_rgba(18,63,89,0.05)]">
                    <tr>
                      <th className="p-4 font-bold text-xs">رقم/سنة الرخصة</th>
                      <th className="p-4 font-bold text-xs border-r border-[#475569]">رقم/سنة الطلب</th>
                      <th className="p-4 font-bold text-xs border-r border-[#475569]">المالك</th>
                      <th className="p-4 font-bold text-xs text-center border-r border-[#475569]">فتح الملف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedPlot.records.map((project, idx) => (
                      <tr key={idx} className="hover:bg-[#eef7f6]/40 transition-colors">
                        
                        {/* بيانات الرخصة */}
                        <td className="p-4">
                          <div className="font-black text-[#475569]">
                            {project.licenseNumber || "بدون رخصة"}
                          </div>
                          {project.licenseHijriYear && (
                            <div className="text-[11px] text-[#94a3b8] font-bold mt-0.5">
                              لسنة {project.licenseHijriYear} هـ
                            </div>
                          )}
                        </td>

                        {/* بيانات الطلب */}
                        <td className="p-4">
                          <div className="font-bold text-[#475569]">
                            {project.requestNumber || "---"}
                          </div>
                          {project.requestYear && (
                            <div className="text-[11px] text-[#94a3b8] font-bold mt-0.5">
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
                              className="text-[#123f59] font-black hover:text-[#0e7490] transition-all flex items-center gap-2 group"
                            >
                              <div className="p-1.5 bg-[#fbf8f1] rounded-lg group-hover:bg-[#d8b46a]/25 transition-colors">
                                <User size={14} className="text-[#94a3b8] group-hover:text-[#0e7490]" />
                              </div>
                              <span className="group-hover:underline">{project.ownerName || "---"}</span>
                            </button>
                          ) : (
                            <div className="flex items-center gap-2 text-[#64748b] font-bold">
                              <User size={14} className="text-[#94a3b8]" /> {project.ownerName || "---"}
                            </div>
                          )}
                        </td>

                        {/* الإجراءات */}
                        <td className="p-4 text-center">
                          <button 
                            type="button" 
                            onClick={() => setArchiveModal({ isOpen: true, projectId: project.id })} 
                            className="inline-flex items-center justify-center p-2.5 bg-white border border-[#e8ddc8] rounded-xl text-[#94a3b8] hover:text-[#0e7490] hover:border-[#d8b46a]/40 hover:bg-[#eef7f6] hover:shadow-[0_6px_14px_rgba(18,63,89,0.04)] transition-all active:scale-95" 
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
              <div className="flex flex-col items-center justify-center h-full bg-[#fbf8f1]/50 p-4">
                <div className="w-20 h-20 bg-white border border-[#e8ddc8] rounded-full flex items-center justify-center mb-4 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
                  <FileBox className="w-10 h-10 text-[#cbd5e1]" />
                </div>
                <h3 className="text-sm font-black text-[#475569]">لا توجد معاملات مسجلة</h3>
                <p className="text-sm font-bold text-[#94a3b8] mt-2 text-center max-w-md">
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