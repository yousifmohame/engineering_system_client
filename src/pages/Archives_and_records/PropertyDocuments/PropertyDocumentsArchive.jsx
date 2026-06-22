import React, { useState } from "react";
import { 
  FileText, Search, Plus, BrainCircuit, ShieldAlert, 
  Map, FileSearch, Layers, Link as LinkIcon, CheckCircle2, AlertCircle, Loader2, ChevronRight, ChevronLeft
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../../api/axios"; // تأكد من مسار الـ axios الصحيح في مشروعك
import { UploadDocumentModal } from "./Modals/UploadDocumentModal";
import { DocumentDetailsModal } from "./Modals/DocumentDetailsModal";

export const PropertyDocumentsArchive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // لتجنب إرسال طلب مع كل حرف
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const skip = (page - 1) * limit;
  
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState(null);

  // 1. Debounce Search (لتحسين أداء البحث)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // العودة للصفحة الأولى عند البحث
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 2. Fetch Data (جلب البيانات الحقيقية من الباك إند)
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["archive-docs", debouncedSearch, page],
    queryFn: async () => {
      const response = await axios.get("/doc-archive", {
        params: {
          search: debouncedSearch,
          page,
          limit,
        },
      });
      return response.data;
    },
    keepPreviousData: true,
  });

  const docs = data?.data || [];
  const serverStats = data?.stats || { total: 0, confirmed: 0, needsReview: 0, linked: 0 };
  const pagination = data?.pagination || { total: 0, pages: 1 };

  // 3. ترتيب البطاقات الإحصائية لتعرض بيانات الباك إند
  const stats = [
    { label: "إجمالي الوثائق", value: serverStats.total, icon: Layers, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "تم التحليل / مؤكدة", value: serverStats.confirmed, icon: BrainCircuit, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "تحتاج مراجعة", value: serverStats.needsReview, icon: ShieldAlert, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "مرتبطة بمشاريع", value: serverStats.linked, icon: LinkIcon, color: "text-indigo-600", bg: "bg-indigo-50" },
  ];

  // 4. دالة مساعدة لترجمة حالة الوثيقة إلى شكل مرئي (Badge)
  const renderStatusBadge = (status) => {
    const statusConfig = {
      UPLOADED: { text: "مرفوعة (قيد الانتظار)", bg: "bg-slate-100", textCol: "text-slate-600", icon: FileText },
      NEEDS_REVIEW: { text: "تحتاج مراجعة", bg: "bg-amber-50 border-amber-100", textCol: "text-amber-600", icon: AlertCircle },
      CONFIRMED: { text: "مؤكدة (مراجعة)", bg: "bg-emerald-50 border-emerald-100", textCol: "text-emerald-600", icon: CheckCircle2 },
      ARCHIVED: { text: "مؤرشفة (ملغية)", bg: "bg-rose-50 border-rose-100", textCol: "text-rose-600", icon: ShieldAlert },
    };

    const config = statusConfig[status] || statusConfig.UPLOADED;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black border ${config.bg} ${config.textCol}`}>
        <Icon className="w-3 h-3" /> {config.text}
      </span>
    );
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/50 p-6 font-[Tajawal]" dir="rtl">
      
      {/* 🌟 الهيدر (Header) 🌟 */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-black text-[#123f59] flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#d8b46a]" />
            أرشيف وثائق الملكية
          </h1>
          <p className="mt-1.5 text-sm font-bold text-slate-500">
            سجل مركزي لحفظ، تحليل (AI)، وأرشفة وثائق الملكية وربطها التشغيلي
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 shadow-sm transition-all">
            <ShieldAlert className="h-4 w-4" /> فحص التكرارات
          </button>
          <button 
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-[#123f59] px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-[#0e7490] hover:-translate-y-0.5 transition-all"
          >
            <Plus className="h-4 w-4 text-[#d8b46a]" /> رفع وثيقة ملكية
          </button>
        </div>
      </div>

      {/* 🌟 البطاقات الإحصائية 🌟 */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.bg}`}>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500">{stat.label}</p>
              <h3 className="text-xl font-black text-slate-800">{stat.value.toLocaleString('en-US')}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* 🌟 منطقة البحث والجدول 🌟 */}
      <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        
        {/* شريط البحث */}
        <div className="border-b border-slate-100 p-4 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برقم الوثيقة، رقم العقار، المالك، الحي، رقم الصك القديم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-4 text-sm font-bold text-[#123f59] outline-none focus:border-[#123f59] focus:ring-1 focus:ring-[#123f59] transition-all"
            />
          </div>
          <button className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-colors">
            فلاتر متقدمة
          </button>
        </div>

        {/* الجدول (Table) */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-[#123f59] animate-spin mb-2" />
              <span className="text-xs font-bold text-slate-500">جاري جلب الوثائق...</span>
            </div>
          )}

          <table className="w-full text-right text-sm">
            <thead className="sticky top-0 bg-slate-50 z-10 shadow-sm border-b border-slate-200">
              <tr>
                <th className="p-4 font-black text-slate-500 text-[11px] w-12 text-center">م</th>
                <th className="p-4 font-black text-slate-500 text-[11px]">رقم الوثيقة / العقار</th>
                <th className="p-4 font-black text-slate-500 text-[11px]">نوع ومصدر الوثيقة</th>
                <th className="p-4 font-black text-slate-500 text-[11px]">المدينة / الحي</th>
                <th className="p-4 font-black text-slate-500 text-[11px]">المالك الرئيسي</th>
                <th className="p-4 font-black text-slate-500 text-[11px] text-center">القيود</th>
                <th className="p-4 font-black text-slate-500 text-[11px] text-center">حالة التحليل</th>
                <th className="p-4 font-black text-slate-500 text-[11px] text-center">الارتباط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              
              {!isLoading && docs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-slate-400 font-bold">
                    <FileSearch className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    لا توجد وثائق ملكية مؤرشفة مطابقة لبحثك.
                  </td>
                </tr>
              ) : (
                docs.map((doc, idx) => {
                  const mainOwner = doc.owners?.[0]?.ownerName || "غير محدد";
                  const firstProp = doc.properties?.[0] || {};
                  const isLinked = !!doc.ownershipId;

                  return (
                    <tr 
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      <td className="p-4 text-center text-xs font-bold text-slate-400">
                        {skip + idx + 1}
                      </td>
                      <td className="p-4">
                        <div className="font-black text-[#123f59]">{doc.documentNumber || "---"}</div>
                        {doc.propertyNumber && (
                          <div className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                            رقم العقار: <span className="font-mono text-slate-600">{doc.propertyNumber}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700 text-xs">{doc.docType || "غير مصنف"}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{doc.docSource || "---"}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 text-xs">{firstProp.city || "---"}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{firstProp.district || "---"}</div>
                      </td>
                      <td className="p-4 font-bold text-slate-700 text-xs truncate max-w-[150px]">
                        {mainOwner}
                        {doc.owners?.length > 1 && (
                           <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded ml-1">+{doc.owners.length - 1} آخرين</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {doc.hasRestrictions === "مرهون" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100">
                            مرهون
                          </span>
                        ) : doc.hasRestrictions === "NONE" ? (
                          <span className="text-[10px] font-bold text-slate-400">لا يوجد</span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-500">غير واضح</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {renderStatusBadge(doc.status)}
                      </td>
                      <td className="p-4 text-center">
                        {isLinked ? (
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-black bg-indigo-50 text-indigo-600 border border-indigo-100">
                             <LinkIcon className="w-3 h-3" /> {doc.ownership?.code || "ملف قائم"}
                           </span>
                        ) : (
                           <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded-md bg-white">غير مرتبط</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* أزرار التنقل (Pagination) */}
        {pagination.pages > 1 && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">
              إجمالي {pagination.total} وثيقة (صفحة {page} من {pagination.pages})
            </span>
            <div className="flex gap-2">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                disabled={page === pagination.pages}
                onClick={() => setPage(p => p + 1)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      <UploadDocumentModal 
        isOpen={isUploadModalOpen} 
        onClose={() => {
          setUploadModalOpen(false);
          refetch(); // 👈 إعادة جلب البيانات فور إغلاق نافذة الرفع الناجح
        }} 
      />
        
      <DocumentDetailsModal 
        docId={selectedDocId} 
        onClose={() => setSelectedDocId(null)} 
      />
     

    </div>
  );
};