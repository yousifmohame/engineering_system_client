import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X, Search, AlertTriangle, Ban, CheckCircle2,
  Loader2, Trash2, ShieldCheck, History, User, FileText, Eye, Clock
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext"; // 👈 استدعاء useAuth

// 💡 استدعاء عارض الملفات الاحترافي
import FileViewerModal from "../../FilesExplorer/modals/FileViewerModal";

// 💡 دالة جلب الرابط الكامل للملف
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export default function RegistryModal({ isOpen, onClose }) {
  const { user } = useAuth(); // 👈 جلب بيانات المستخدم الحالي
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [viewingFile, setViewingFile] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["doc-registry", search, type],
    queryFn: async () => {
      const res = await api.get(`/documentation/registry`, {
        params: { search, type },
      });
      return res.data.data;
    },
    enabled: isOpen,
  });

  // 🚀 إبطال الوثيقة (Revoke)
  const handleRevoke = async (id) => {
    if (!window.confirm("إجراء أمني: هل أنت متأكد من إبطال وإلغاء هذه الوثيقة؟")) return;
    const toastId = toast.loading("جاري إبطال الوثيقة...");
    try {
      await api.put(`/documentation/${id}/revoke`);
      toast.success("تم إبطال الوثيقة بنجاح", { id: toastId });
      queryClient.invalidateQueries(["doc-registry"]);
      queryClient.invalidateQueries(["documentation-logs"]);
    } catch (e) {
      toast.error("فشل الإجراء", { id: toastId });
    }
  };

  // 🚀 الحذف النهائي (Delete) - الجديد
  const handleDelete = async (id) => {
    if (!window.confirm("⚠️ تحذير خطير: هل أنت متأكد من حذف هذا السجل نهائياً من قاعدة البيانات؟ (لا يمكن التراجع)")) return;
    const toastId = toast.loading("جاري الحذف النهائي...");
    try {
      await api.delete(`/documentation/${id}`);
      toast.success("تم حذف السجل نهائياً", { id: toastId });
      queryClient.invalidateQueries(["doc-registry"]);
      queryClient.invalidateQueries(["documentation-logs"]);
    } catch (e) {
      toast.error("فشل الحذف. قد لا تملك الصلاحية الكافية.", { id: toastId });
    }
  };

  // 💡 تجهيز الملف للمعاينة في المودال الاحترافي
  const handleViewFile = (row) => {
    const extension = row.fileUrl ? row.fileUrl.split(".").pop().toLowerCase() : "";
    setViewingFile({
      url: getFullUrl(row.fileUrl),
      name: row.name || "مستند موثق",
      extension: extension,
      size: 0, 
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 font-tajawal" dir="rtl">
          
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-7xl h-[90vh] bg-slate-50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-300"
          >
            {/* ── Header ── */}
            <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <History className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">الأرشيف المركزي وسجل الوثائق</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <User className="w-3.5 h-3.5" /> الموظف الحالي: <span className="text-blue-700 font-black">{user?.name || "مدير النظام"}</span>
                    </span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      إدارة وحذف السجلات
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-2.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all border border-transparent hover:border-rose-100">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* ── Filters ── */}
            <div className="p-5 flex flex-wrap gap-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="البحث باسم المستند، السيريال، أو الطرف الثاني..."
                  className="w-full pr-11 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <select value={type} onChange={(e) => setType(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-blue-500 cursor-pointer">
                  <option value="ALL">كل الأنواع</option>
                  <option value="CONTRACT">عقود</option>
                  <option value="INVOICE">فواتير</option>
                  <option value="EXTERNAL">مستندات خارجية</option>
                </select>
              </div>
            </div>

            {/* ── Table (Data Grid) ── */}
            <div className="flex-1 overflow-auto bg-white custom-scrollbar">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                  <p className="font-bold text-slate-500">جاري جلب الأرشيف...</p>
                </div>
              ) : records.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                  <History className="w-16 h-16 mb-4 opacity-30" />
                  <p className="font-black text-lg text-slate-500">لا توجد سجلات مطابقة</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse min-w-[900px]">
                  <thead className="bg-slate-100/80 sticky top-0 z-10 shadow-sm border-b border-slate-200">
                    <tr className="text-slate-500 text-[11px] font-black uppercase tracking-wider">
                      <th className="p-4 border-x border-slate-200 w-1/4">المستند وتاريخ الإنشاء</th>
                      <th className="p-4 border-x border-slate-200">الطرف الثاني</th>
                      <th className="p-4 border-x border-slate-200">السيريال / التوكن</th>
                      <th className="p-4 border-x border-slate-200 w-28 text-center">الحالة</th>
                      <th className="p-4 border-x border-slate-200 w-44 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-bold text-slate-700">
                    {records.map((row, idx) => {
                      const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/50";
                      
                      return (
                        <tr key={row.id} className={`${rowBg} hover:bg-blue-50/50 transition-colors border-b border-slate-200 group`}>
                          <td className="p-4 border-x border-slate-200">
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${row.status === 'VALID' ? 'bg-emerald-50 text-emerald-600' : row.status === 'REVOKED' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-black text-sm text-slate-800 line-clamp-1" title={row.name}>{row.name}</div>
                                <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-mono">
                                  <Clock className="w-3 h-3" /> {new Date(row.createdAt).toLocaleString("ar-SA")}
                                </div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="p-4 border-x border-slate-200 text-xs text-slate-600">
                            {row.partyB || "غير محدد"}
                          </td>
                          
                          <td className="p-4 border-x border-slate-200">
                            <div className="flex flex-col gap-1">
                              <code className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded w-fit border border-blue-100">{row.verificationToken}</code>
                              <code className="text-[10px] text-slate-400 font-mono tracking-widest">{row.serialNumber}</code>
                            </div>
                          </td>
                          
                          <td className="p-4 border-x border-slate-200 text-center">
                            {row.status === "VALID" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                <CheckCircle2 className="w-3 h-3" /> معتمد ساري
                              </span>
                            ) : row.status === "REVOKED" ? (
                              <span className="inline-flex items-center gap-1 text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                <Ban className="w-3 h-3" /> تم الإبطال
                              </span>
                            ) : row.status === "PENDING_APPROVAL" ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                <Loader2 className="w-3 h-3 animate-spin" /> قيد المراجعة
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg text-[10px] font-black shadow-sm">
                                {row.status}
                              </span>
                            )}
                          </td>
                          
                          <td className="p-4 border-x border-slate-200 text-center">
                            <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              
                              <button onClick={() => handleViewFile(row)} title="معاينة الملف" className="p-2 hover:bg-blue-100 text-slate-500 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200 shadow-sm">
                                <Eye className="w-4 h-4" />
                              </button>
                              
                              {row.status === "VALID" && (
                                <button onClick={() => handleRevoke(row.id)} title="إبطال الوثيقة أمنياً" className="p-2 hover:bg-amber-100 text-slate-500 hover:text-amber-700 rounded-lg transition-colors border border-transparent hover:border-amber-200 shadow-sm">
                                  <AlertTriangle className="w-4 h-4" />
                                </button>
                              )}

                              {/* 💡 زر الحذف الجديد */}
                              <button onClick={() => handleDelete(row.id)} title="حذف نهائي" className="p-2 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-lg transition-colors border border-transparent hover:border-rose-200 shadow-sm">
                                <Trash2 className="w-4 h-4" />
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* 💡 استدعاء شاشة المعاينة لتعمل بشكل مستقل فوق المودال */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}