import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Brain, Plus, Search, FileText, Download, MoreVertical, 
  Loader2, Trash2, Edit2, Snowflake, Play, X
} from "lucide-react";

import api from "../../../api/axios";
import AddReferenceModal from "./Models/AddReferenceModal";
import ReferenceDetailsModal from "./Models/ReferenceDetailsModal";
import ModalUploadReferenceAi from "./Models/ModalUploadReferenceAi";

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  return `https://details-worksystem1.com${fixedUrl}`;
};

// 💡 الشاشة الأساسية تستقبل: التصنيف، العنوان، الوصف، والألوان من الشاشات الفرعية
export default function ReferenceBaseScreen({ 
  fixedCategory, 
  pageTitle, 
  pageDescription, 
  themeColor, 
  HeaderIcon 
}) {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAiUploadModalOpen, setIsAiUploadModalOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [documentToEdit, setDocumentToEdit] = useState(null);
  const [freezeModal, setFreezeModal] = useState({ isOpen: false, doc: null, reason: "" });
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["reference-documents"],
    queryFn: async () => {
      const res = await api.get("/references");
      return res.data?.data || [];
    },
    refetchInterval: 5000,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/references/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المرجع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reference-documents"] });
    },
    onError: () => toast.error("فشل حذف المرجع"),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status, reason }) => api.put(`/references/${id}/status`, { status, freezeReason: reason }),
    onSuccess: () => {
      toast.success("تم تحديث حالة المرجع بنجاح");
      queryClient.invalidateQueries({ queryKey: ["reference-documents"] });
      setFreezeModal({ isOpen: false, doc: null, reason: "" });
    },
    onError: () => toast.error("حدث خطأ أثناء تحديث الحالة"),
  });

  const selectedDocument = useMemo(() => {
    if (!selectedDocumentId) return null;
    return documents.find((doc) => doc.id === selectedDocumentId) || null;
  }, [documents, selectedDocumentId]);

  // 💡 فلترة البيانات بناءً على التصنيف الثابت للشاشة فقط!
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesCategory = doc.category === fixedCategory;
      const matchesSearch = (doc.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (doc.source || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, fixedCategory, documents]);

  // 💡 طريقة آمنة جداً ومضمونة لإدارة الألوان بدون استخدام split 
  const THEMES = {
    purple: {
      btn: "bg-[#0f3d50] hover:bg-[#174e65] shadow-[#0f3d50]/20",
      iconBox: "bg-[#f4f7f8] text-[#123B5D] border-[#e8dcc8]"
    },
    blue: {
      btn: "bg-[#0f3d50] hover:bg-[#174e65] shadow-[#0f3d50]/20",
      iconBox: "bg-[#f4f7f8] text-[#123B5D] border-[#e8dcc8]"
    },
    amber: {
      btn: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
      iconBox: "bg-amber-50 text-amber-600 border-amber-200"
    },
    emerald: {
      btn: "bg-emerald-600 hover:bg-[#123B5D] shadow-[#0f3d50]/20",
      iconBox: "bg-emerald-50 text-emerald-600 border-emerald-200"
    }
  };

  // تأمين اللون الافتراضي في حال تمرير لون غير معروف
  const activeTheme = THEMES[themeColor] || THEMES.purple;

  return (
    <div className="h-full block font-sans relative" dir="rtl">
      <div className="p-4 bg-[#f4f7f8] min-h-full">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* 🚀 الهيدر المخصص للشاشة */}
          <div className="flex items-center gap-4 bg-[#0f3d50] text-white p-4 rounded-[1.5rem] border border-white/10 shadow-lg">
            <div className={`p-3 rounded-2xl border bg-[#d7b96d] text-[#0f3d50] border-white/10`}>
              <HeaderIcon size={26} strokeWidth={2.4} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{pageTitle}</h1>
              <p className="text-xs font-bold text-white/65 mt-1">{pageDescription} - ({filteredDocuments.length} سجل)</p>
            </div>
          </div>

          {/* شريط الإجراءات والبحث */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e8dcc8] shadow-sm">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder={`ابحث في ${pageTitle}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:border-blue-400 outline-none transition-all"
                type="text"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setIsAiUploadModalOpen(true)} 
                className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-xs font-black shadow-md transition-all ${activeTheme.btn}`}
              >
                <Brain className="w-4 h-4" /> رفع وتحليل ذكي (AI)
              </button>
              <button 
                onClick={() => { setDocumentToEdit(null); setIsAddModalOpen(true); }} 
                className="flex items-center gap-2 px-5 py-2.5 bg-[#d7b96d] text-[#0f3d50] rounded-xl text-xs font-black shadow-md hover:bg-[#e4c87d] transition-all"
              >
                <Plus className="w-4 h-4" /> إضافة يدوية
              </button>
            </div>
          </div>

          {/* الجدول المكتمل */}
          <div className="bg-white rounded-2xl border border-[#e8dcc8] shadow-sm overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar-slim pb-24 min-h-[400px]">
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-[#f4f7f8] border-b border-slate-200">
                    <th className="p-4 text-xs font-black text-slate-500">العنوان</th>
                    <th className="p-4 text-xs font-black text-slate-500">الجهة المصدرة</th>
                    <th className="p-4 text-xs font-black text-slate-500">تاريخ الإصدار</th>
                    <th className="p-4 text-xs font-black text-slate-500">التحليل</th>
                    <th className="p-4 text-xs font-black text-slate-500 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="p-16 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#0f3d50] mb-4" />
                        <span className="text-sm font-bold text-slate-500">جاري التحميل...</span>
                      </td>
                    </tr>
                  ) : filteredDocuments.length > 0 ? (
                    filteredDocuments.map((doc) => {
                      const isFrozen = doc.status === "مجمد";
                      
                      return (
                        <tr key={doc.id} onClick={() => setSelectedDocumentId(doc.id)} className={`hover:bg-slate-50 cursor-pointer transition-colors ${isFrozen ? "opacity-60 grayscale-[0.3]" : ""}`}>
                          <td className="p-4 font-black text-sm text-slate-800 max-w-xs truncate" title={doc.title}>
                            {doc.title}
                          </td>
                          <td className="p-4 font-bold text-xs text-slate-600 max-w-[150px] truncate" title={doc.source}>
                            {doc.source || "—"}
                          </td>
                          <td className="p-4 font-bold text-xs text-slate-500 font-mono">
                            {doc.issueDate ? new Date(doc.issueDate).toLocaleDateString("en-GB") : "—"}
                          </td>
                          <td className="p-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black ${doc.analysisStatus === 'محلل' ? 'bg-emerald-100 text-emerald-800' : doc.analysisStatus === 'قيد التحليل' ? 'bg-[#edf2f4] text-[#123B5D] animate-pulse' : 'bg-slate-100 text-slate-600'}`}>
                              {doc.analysisStatus || "غير محلل"}
                            </span>
                          </td>
                          
                          {/* 🚀 الإجراءات مع القائمة المنسدلة */}
                          <td className="p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-center gap-2 relative">
                              {doc.fileUrl && (
                                <button onClick={() => window.open(getFullUrl(doc.fileUrl.split(",")[0]), "_blank")} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-[#123B5D] bg-[#edf7fb] border border-[#cfe3ea] hover:bg-[#dff0f6] transition-all rounded-xl shadow-sm">
                                  <Download size={15}/>
                                  <span>تحميل</span>
                                </button>
                              )}
                              
                              <button onClick={() => setActiveMenuId(activeMenuId === doc.id ? null : doc.id)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-all rounded-xl shadow-sm">
                                <MoreVertical size={15}/>
                                <span>إجراءات</span>
                              </button>

                              {/* القائمة المنسدلة */}
                              {activeMenuId === doc.id && (
                                <>
                                  <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)}></div>
                                  <div className="absolute left-10 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-20 w-40 py-1 font-bold text-xs animate-in zoom-in-95">
                                    
                                    <button onClick={() => { setDocumentToEdit(doc); setIsAddModalOpen(true); setActiveMenuId(null); }} className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700">
                                      <Edit2 size={14} className="text-[#0f3d50]" /> تعديل المرجع
                                    </button>
                                    
                                    {doc.status === "نشط" ? (
                                      <button onClick={() => { setFreezeModal({ isOpen: true, doc, reason: "" }); setActiveMenuId(null); }} className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-cyan-50 text-cyan-700">
                                        <Snowflake size={14} /> تجميد وإيقاف
                                      </button>
                                    ) : (
                                      <button onClick={() => { statusMutation.mutate({ id: doc.id, status: "نشط", reason: "إعادة تنشيط" }); setActiveMenuId(null); }} className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-emerald-50 text-emerald-700">
                                        <Play size={14} /> إعادة تنشيط
                                      </button>
                                    )}
                                    
                                    <div className="border-t border-slate-100 my-1"></div>
                                    
                                    <button onClick={() => { if (window.confirm("حذف المرجع نهائياً؟")) deleteMutation.mutate(doc.id); setActiveMenuId(null); }} className="flex items-center gap-2 w-full text-right px-4 py-2 hover:bg-rose-50 text-rose-600">
                                      <Trash2 size={14} /> حذف نهائي
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="p-16 text-center text-slate-500 font-bold">
                        <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                        لا توجد سجلات في هذا التصنيف.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 النوافذ المنبثقة (Modals) */}
      
      {/* نافذة الإضافة والتعديل */}
      {isAddModalOpen && (
        <AddReferenceModal 
          isOpen={true} 
          onClose={() => { setIsAddModalOpen(false); setDocumentToEdit(null); }} 
          fixedCategory={fixedCategory} 
          documentToEdit={documentToEdit} // 👈 تم التمرير بنجاح للتعديل
        />
      )}
      
      {/* نافذة التفاصيل الحية */}
      <ReferenceDetailsModal 
        isOpen={!!selectedDocument} 
        document={selectedDocument} 
        onClose={() => setSelectedDocumentId(null)} 
      />
      
      {/* نافذة الذكاء الاصطناعي (تعمل في الطابور) */}
      {isAiUploadModalOpen && (
        <ModalUploadReferenceAi 
          onClose={() => setIsAiUploadModalOpen(false)} 
          fixedCategory={fixedCategory} 
        />
      )}

      {/* 🚀 نافذة تجميد المرجع (مكتملة ومدمجة) */}
      {freezeModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative animate-in zoom-in-95">
            <button onClick={() => setFreezeModal({ isOpen: false, doc: null, reason: "" })} className="absolute top-4 left-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-cyan-50 text-cyan-600 rounded-full flex items-center justify-center mb-4 mx-auto border border-cyan-100">
              <Snowflake size={24} />
            </div>
            <h3 className="text-lg font-black text-center text-slate-800 mb-2">تأكيد تجميد المرجع</h3>
            <p className="text-xs font-bold text-center text-slate-500 mb-4 leading-relaxed">
              سيتم إيقاف العمل بهذا المرجع ولن يتم تضمينه في التحليلات المستقبلية. يرجى ذكر السبب:
            </p>
            <textarea 
              placeholder="مثال: تم صدور تعميم جديد يلغي هذا النظام..." 
              value={freezeModal.reason} 
              onChange={(e) => setFreezeModal({ ...freezeModal, reason: e.target.value })} 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 outline-none resize-none min-h-[100px] mb-4" 
            />
            <button 
              onClick={() => statusMutation.mutate({ id: freezeModal.doc.id, status: "مجمد", reason: freezeModal.reason })} 
              disabled={!freezeModal.reason.trim() || statusMutation.isPending} 
              className="w-full py-3 bg-cyan-600 text-white rounded-xl font-black hover:bg-cyan-700 transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-md shadow-cyan-600/20"
            >
              {statusMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : "تأكيد التجميد وحفظ السجل"}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}