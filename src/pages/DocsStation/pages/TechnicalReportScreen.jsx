import React, { useState, useEffect } from "react";
import { Search, Filter, Hash, PenLine, Printer, X, Plus, Loader2 } from "lucide-react";
import TechnicalReportBuilder from "./TechnicalReport/TechnicalReportBuilder";
import api from "../../../api/axios"; // 🚨 تأكد من مسار الأكسيوس الصحيح لديك
import { toast } from "sonner"; // مكتبة التنبيهات (استخدم ما يناسب مشروعك)

export default function TechnicalReportScreen() {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // التحكم في الشاشة والـ ID الممرر
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingReportId, setEditingReportId] = useState(null);

  // 1. جلب التقارير من السيرفر
  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/technical-reports");
      setReports(res.data?.data || res.data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
      toast.error("فشل جلب التقارير الفنية");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // 2. دالة فتح الباني (إنشاء جديد أو تعديل)
  const openBuilder = (reportId = null) => {
    setEditingReportId(reportId);
    setIsBuilderOpen(true);
  };

  // 3. دالة الحذف
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 🚨 لمنع فتح التقرير عند الضغط على زر الحذف
    if (!window.confirm("هل أنت متأكد من حذف هذا التقرير نهائياً؟")) return;
    
    try {
      await api.delete(`/technical-reports/${id}`);
      toast.success("تم حذف التقرير بنجاح");
      fetchReports(); // تحديث القائمة بعد الحذف
    } catch (error) {
      toast.error("فشل حذف التقرير");
    }
  };

  // دالة لاستخراج اسم العميل من JSON الداتابيز
  const getClientName = (client) => {
    if (!client) return "غير محدد";
    if (client.officialNameAr) return client.officialNameAr;
    if (typeof client.name === 'string') {
      try { return JSON.parse(client.name).ar || "عميل"; } catch { return client.name; }
    }
    return client.name?.ar || "عميل";
  };

  // 4. الفلترة المتقدمة (تعمل على البيانات الحقيقية)
  const filteredReports = reports.filter((report) => {
    const searchLower = searchQuery.toLowerCase();
    const type = report.reportData?.template || "";
    const txCode = report.transaction?.transactionCode || "";
    const clientName = getClientName(report.client).toLowerCase();

    return (
      report.serialNumber?.toLowerCase().includes(searchLower) ||
      txCode.toLowerCase().includes(searchLower) ||
      type.toLowerCase().includes(searchLower) ||
      clientName.includes(searchLower)
    );
  });

  // 5. إذا كان الباني مفتوحاً، نعرضه ونمرر له الـ ID (إن وجد)
  if (isBuilderOpen) {
    return (
      <TechnicalReportBuilder 
        existingReportId={editingReportId} // تمرير الـ ID لجلبه في الـ Context
        onClose={() => {
          setIsBuilderOpen(false);
          fetchReports(); // تحديث القائمة عند العودة
        }} 
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-white animate-in fade-in" dir="rtl">
      
      {/* الشريط العلوي */}
      <div className="p-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
            <input
              placeholder="بحث برقم المرجع، العميل، المعاملة..."
              className="w-64 pl-2 pr-8 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-black focus:border-emerald-500 outline-none transition-colors"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex gap-2">
          <button onClick={() => openBuilder(null)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-black hover:bg-emerald-700 transition-colors shadow-sm">
            <Plus className="w-3.5 h-3.5" /> إنشاء تقرير فني جديد
          </button>
        </div>
      </div>

      {/* الجدول الرئيسي */}
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
          </div>
        ) : (
          <table className="w-full text-right border-collapse text-[11px]">
            <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
              <tr className="text-slate-600 font-extrabold uppercase tracking-wide">
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 w-8 text-center text-slate-400">#</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 whitespace-nowrap">الرقم المرجعي (Serial)</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50">العميل</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">المعاملة</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">الحالة</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">بواسطة</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">التاريخ</th>
                <th className="px-3 py-2 border-b border-slate-200 text-center w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="font-bold text-slate-700">
              {filteredReports.map((report, index) => {
                const clientName = getClientName(report.client);
                const txCode = report.transaction?.transactionCode || "بدون ربط";
                const isDraft = report.status === "DRAFT";

                return (
                  <tr 
                    key={report.id} 
                    onClick={() => openBuilder(report.id)} // 👈 فتح التقرير عند الضغط على الصف
                    className="border-b border-slate-100 hover:bg-emerald-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-400">{index + 1}</td>
                    <td className="px-3 py-2 border-l border-slate-100 font-mono text-emerald-700">{report.serialNumber}</td>
                    <td className="px-3 py-2 border-l border-slate-100"><span className="truncate block max-w-[150px]">{clientName}</span></td>
                    <td className="px-3 py-2 border-l border-slate-100 text-center"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200 font-mono">{txCode}</span></td>
                    <td className="px-3 py-2 border-l border-slate-100 text-center">
                      <span className={`px-2 py-0.5 rounded uppercase tracking-wider text-[9px] border ${isDraft ? "bg-amber-50 text-amber-700 border-amber-100" : "bg-emerald-50 text-emerald-700 border-emerald-100"}`}>
                        {isDraft ? "مسودة" : "مكتمل"}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-500">{report.createdBy || "النظام"}</td>
                    <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-400 font-mono tracking-tighter">{new Date(report.createdAt).toLocaleDateString('ar-SA')}</td>
                    
                    {/* 👈 أزرار الإجراءات ظاهرة دائماً (تم إزالة group-hover) */}
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          title="استكمال/تعديل" 
                          onClick={(e) => { e.stopPropagation(); openBuilder(report.id); }} // إيقاف الانتشار مهم جداً
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          title="معاينة وطباعة" 
                          onClick={(e) => { e.stopPropagation(); /* أضف كود الطباعة السريعة لاحقاً */ }}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          title="حذف" 
                          onClick={(e) => handleDelete(e, report.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredReports.length === 0 && !isLoading && (
                 <tr><td colSpan="8" className="text-center py-12 text-slate-400 font-bold">لا توجد تقارير مسجلة في النظام.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}