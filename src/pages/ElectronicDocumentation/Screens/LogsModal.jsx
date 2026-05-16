import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { 
  X, Search, Fingerprint, Printer, Trash2, Download, Send, Eye, ShieldCheck, FileText, Loader2, AlertCircle
} from "lucide-react";
import api from "../../../api/axios"; // ⚠️ عدل المسار حسب بنية مشروعك
import { toast } from "sonner";

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

export default function LogsModal({ isOpen, onClose }) {
  const [search, setSearch] = useState("");
  
  // 💡 حالة جديدة لتخزين الملف المراد معاينته في FileViewerModal
  const [viewingFile, setViewingFile] = useState(null);

  // 🚀 جلب السجلات
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["documentation-logs", search],
    queryFn: async () => {
      const res = await api.get("/documentation/logs", { params: { search } });
      return res.data.data;
    },
    enabled: isOpen,
  });

  // 🚀 تسجيل الحدث في الباك إند
  const logAction = async (recordId, action, details) => {
    if(!recordId) return;
    try {
      await api.post("/documentation/logs/action", { recordId, action, details });
    } catch (e) { console.error(e); }
  };

  const handlePrint = (log) => {
    logAction(log.record?.id, "PRINTED", "تمت طباعة الوثيقة");
    const printWindow = window.open(getFullUrl(log.record.fileUrl), '_blank');
    if (printWindow) {
      printWindow.onload = () => { printWindow.print(); };
    }
  };

  const handleDownload = (log) => {
    logAction(log.record?.id, "DOWNLOADED", "تم تحميل الوثيقة");
    const link = document.createElement('a');
    link.href = getFullUrl(log.record.fileUrl);
    link.download = log.record.name || 'Document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSend = (log) => {
    toast.success("تم فتح نافذة إرسال الوثيقة للعميل");
    logAction(log.record?.id, "SHARED", "تم إرسال الوثيقة للعميل");
    // هنا تفتح الـ ComposerModal الخاص بالايميلات أو الواتساب لاحقاً
  };

  // 💡 دالة لتجهيز الملف للمعاينة في المودال الاحترافي
  const handleViewFile = (log) => {
    logAction(log.record?.id, "VIEWED", "تم استعراض الملف داخل النظام");
    const extension = log.record.fileUrl ? log.record.fileUrl.split(".").pop().toLowerCase() : "";
    
    setViewingFile({
      url: getFullUrl(log.record.fileUrl),
      name: log.record.name,
      extension: extension,
      size: 0, 
    });
  };

  // 💡 دالة لترجمة الأحداث (Actions) إلى العربية
  const translateAction = (action) => {
    switch (action) {
      case "SUBMITTED_FOR_APPROVAL": return { text: "طلب اعتماد", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <Loader2 className="w-3 h-3" /> };
      case "APPROVED": return { text: "تم الاعتماد", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <ShieldCheck className="w-3 h-3" /> };
      case "REJECTED": return { text: "تم الرفض", color: "text-rose-600 bg-rose-50 border-rose-200", icon: <X className="w-3 h-3" /> };
      case "DOCUMENTED": return { text: "تم التوثيق", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <ShieldCheck className="w-3 h-3" /> };
      case "REVOKED": return { text: "إبطال", color: "text-rose-600 bg-rose-50 border-rose-200", icon: <AlertCircle className="w-3 h-3" /> };
      case "VIEWED": return { text: "تمت المشاهدة", color: "text-blue-600 bg-blue-50 border-blue-200", icon: <Eye className="w-3 h-3" /> };
      case "PRINTED": return { text: "تمت الطباعة", color: "text-slate-600 bg-slate-50 border-slate-200", icon: <Printer className="w-3 h-3" /> };
      case "DOWNLOADED": return { text: "تم التحميل", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Download className="w-3 h-3" /> };
      case "SHARED": return { text: "تم الإرسال", color: "text-teal-600 bg-teal-50 border-teal-200", icon: <Send className="w-3 h-3" /> };
      case "VERIFIED": return { text: "تم التحقق (QR)", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <Search className="w-3 h-3" /> };
      case "DELETED": return { text: "تم الحذف", color: "text-rose-600 bg-rose-50 border-rose-200", icon: <Trash2 className="w-3 h-3" /> };
      default: return { text: action, color: "text-slate-600 bg-slate-100 border-slate-200", icon: <FileText className="w-3 h-3" /> };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-cairo" dir="rtl">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" />

          {/* 💡 أزلنا العرض المقسوم وأعدنا الشاشة لوضع العرض الكامل */}
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-6xl h-[85vh] bg-slate-50 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-300">
            
            {/* Header */}
            <div className="bg-white px-8 py-6 flex justify-between items-center shrink-0 border-b border-slate-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-md">
                  <Fingerprint className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">سجل عمليات التوثيق (Audit Trail)</h2>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Security Logs</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="relative w-72">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" placeholder="بحث بالسريال أو اسم الوثيقة..." 
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
                <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-white custom-scrollbar">
              {/* 📊 Data Grid (Excel Like Table) */}
              {isLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
              ) : logs.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                   <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                   <p className="font-bold">لا توجد سجلات مطابقة.</p>
                </div>
              ) : (
                <table className="w-full text-right border-collapse">
                  <thead className="bg-slate-100/80 sticky top-0 z-10 shadow-sm border-b border-slate-300">
                    <tr className="text-slate-500 text-[11px] font-black uppercase tracking-wider">
                      <th className="p-3 border-x border-slate-200 w-24">التاريخ</th>
                      <th className="p-3 border-x border-slate-200 w-24">الوقت</th>
                      <th className="p-3 border-x border-slate-200 w-36">الموظف</th>
                      <th className="p-3 border-x border-slate-200 w-32">الحدث</th>
                      <th className="p-3 border-x border-slate-200">الوثيقة / السريال</th>
                      <th className="p-3 border-x border-slate-200 w-44 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs font-bold text-slate-700">
                    {logs.map((log, idx) => {
                      const logDate = new Date(log.createdAt);
                      const rowBg = idx % 2 === 0 ? "bg-white" : "bg-slate-50/50";
                      const actionData = translateAction(log.action);
                      
                      return (
                        <tr key={log.id} className={`${rowBg} hover:bg-blue-50/50 transition-colors border-b border-slate-200 group`}>
                          <td className="p-3 border-x border-slate-200 font-mono text-slate-600">
                            {logDate.toLocaleDateString('ar-SA')}
                          </td>
                          <td className="p-3 border-x border-slate-200 font-mono text-slate-500">
                            {logDate.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </td>
                          <td className="p-3 border-x border-slate-200 text-slate-800">
                            {log.employee?.name || "مدير النظام"}
                          </td>
                          <td className="p-3 border-x border-slate-200">
                            <span className={`${actionData.color} px-2 py-1 rounded border flex items-center gap-1.5 w-fit shadow-sm`}>
                              {actionData.icon} {actionData.text}
                            </span>
                          </td>
                          <td className="p-3 border-x border-slate-200">
                            {log.record ? (
                              <div>
                                <p className="truncate text-sm text-slate-800 mb-1 font-black" title={log.record.name}>{log.record.name}</p>
                                <code className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono">{log.record.serialNumber}</code>
                              </div>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>
                          <td className="p-3 border-x border-slate-200 text-center">
                            {log.record && log.record.fileUrl && (
                              <div className="flex items-center justify-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                {/* 💡 استخدام دالة handleViewFile التي تفتح المودال الاحترافي */}
                                <button onClick={() => handleViewFile(log)} title="عرض الملف" className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                                <button onClick={() => handlePrint(log)} title="طباعة" className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Printer className="w-4 h-4" /></button>
                                <button onClick={() => handleDownload(log)} title="تنزيل" className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Download className="w-4 h-4" /></button>
                                <button onClick={() => handleSend(log)} title="إرسال للعميل" className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"><Send className="w-4 h-4" /></button>
                              </div>
                            )}
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

      {/* 💡 استدعاء عارض الملفات المستقل يطفو فوق السجلات */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}