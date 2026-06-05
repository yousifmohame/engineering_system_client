import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  XCircle, CheckCircle2, FileText, UserCheck, 
  Loader2, Clock, ShieldAlert, FileSearch,
  User, Link as LinkIcon, ShieldCheck, History, ExternalLink,
  Hash
} from "lucide-react";
import api from "../../api/axios"; // ⚠️ تأكد من المسار حسب مشروعك
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";

// 💡 استدعاء عارض الملفات الاحترافي الخاص بالنظام
import FileViewerModal from "../FilesExplorer/modals/FileViewerModal";
import { getFullUrl } from "../../utils/urlUtils"; // دالة مساعدة لتصحيح روابط الملفات

// للحصول على الرابط الكامل للملف
// export const getFullUrl = (url) => {
//   if (!url) return null;
//   if (url.startsWith("http")) return url;
//   let fixedUrl = url;
//   if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
//   const baseUrl = "https://details-worksystem1.com"; 
//   return `${baseUrl}${fixedUrl}`;
// };

export default function OperationsSupervisorScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 💡 حالة تخزين الملف المراد معاينته
  const [viewingFile, setViewingFile] = useState(null);

  // 🚀 جلب المستندات المعلقة
  const { data: pendingDocs = [], isLoading } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: async () => {
      const res = await api.get("/documentation/pending");
      return res.data.data;
    },
    // تمت إزالة enabled: isOpen لأنها الآن شاشة وستعمل بمجرد فتحها
  });

  // 🚀 اعتماد المستند نهائياً
  const handleApprove = async () => {
    if (!selectedDoc) return;
    setIsProcessing(true);
    const toastId = toast.loading("جاري اعتماد المستند...");
    try {
      await api.put(`/documentation/${selectedDoc.id}/final-approve`);
      toast.success("تم اعتماد المستند وأصبح سارياً ✅", { id: toastId });
      setSelectedDoc(null);
      queryClient.invalidateQueries(["pending-approvals"]);
      queryClient.invalidateQueries(["documentation-logs"]);
    } catch (error) {
      toast.error("فشل في اعتماد المستند", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // 🚀 رفض المستند
  const handleReject = async () => {
    if (!selectedDoc) return;
    if (!rejectReason.trim()) return toast.error("يرجى كتابة سبب الرفض");
    
    setIsProcessing(true);
    const toastId = toast.loading("جاري رفض المستند...");
    try {
      await api.put(`/documentation/${selectedDoc.id}/reject`, { reason: rejectReason });
      toast.success("تم رفض المستند بنجاح ❌", { id: toastId });
      setSelectedDoc(null);
      setShowRejectInput(false);
      setRejectReason("");
      queryClient.invalidateQueries(["pending-approvals"]);
      queryClient.invalidateQueries(["documentation-logs"]);
    } catch (error) {
      toast.error("فشل في رفض المستند", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  // 💡 دالة تجهيز الملف للمعاينة في FileViewerModal
  const handleViewFile = (doc) => {
    const extension = doc.fileUrl ? doc.fileUrl.split(".").pop().toLowerCase() : "";
    setViewingFile({
      url: getFullUrl(doc.fileUrl),
      name: doc.name,
      extension: extension,
      size: 0, 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white animate-in fade-in" dir="rtl">
      
      {/* ── Header ── */}
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">مشرف العمليات والاعتمادات</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> المشرف الحالي: <span className="text-purple-700 font-black">{user?.name || "مدير النظام"}</span>
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {pendingDocs.length} طلبات معلقة
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Body (Split Screen) ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* 📋 القائمة الجانبية (الطلبات) - يمين */}
        <div className="w-full lg:w-[350px] xl:w-[400px] bg-slate-50/50 border-l border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 bg-white">
            <h3 className="font-black text-slate-700 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> بانتظار قرارك
            </h3>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-4 space-y-3">
            {isLoading ? (
              <div className="flex justify-center p-10"><Loader2 className="w-6 h-6 animate-spin text-purple-600" /></div>
            ) : pendingDocs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-70">
                <CheckCircle2 className="w-12 h-12 mb-3 text-emerald-400" />
                <p className="font-black text-sm text-emerald-600">صندوق الاعتمادات فارغ</p>
                <p className="text-xs font-bold mt-1">عمل رائع! تم إنجاز كافة المهام.</p>
              </div>
            ) : (
              pendingDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => { setSelectedDoc(doc); setShowRejectInput(false); }}
                  className={`w-full text-right p-4 rounded-2xl border transition-all ${selectedDoc?.id === doc.id ? 'bg-purple-50 border-purple-300 shadow-sm ring-1 ring-purple-200' : 'bg-white border-slate-200 hover:border-purple-200 hover:bg-slate-50 shadow-sm'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-black text-slate-800 line-clamp-1 pl-2">{doc.name}</span>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">معلق</span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-[10px] font-bold text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" /> <span className="bg-slate-100 px-1.5 rounded text-slate-600">{doc.type}</span>
                        <span className="truncate text-slate-400 font-mono">{doc.serialNumber}</span>
                      </div>
                      <div className="flex justify-between items-center mt-1 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 text-slate-400"><User className="w-3 h-3" /> {doc.createdBy || "موظف"}</span>
                        <span className="flex items-center gap-1 text-slate-400"><Clock className="w-3 h-3" /> {new Date(doc.createdAt).toLocaleDateString('ar-SA')}</span>
                      </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 👁️ مساحة التفاصيل والقرار - يسار */}
        <div className="flex-1 bg-white flex flex-col overflow-y-auto custom-scrollbar">
          {!selectedDoc ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
              <div className="w-24 h-24 mb-4 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm">
                <FileSearch className="w-10 h-10 text-slate-300" />
              </div>
              <p className="font-black text-xl text-slate-500">اختر مستنداً للمراجعة</p>
              <p className="text-sm font-bold mt-2 text-slate-400">انقر على أي طلب من القائمة لعرض تفاصيله واعتماده.</p>
            </div>
          ) : (
            <div className="flex flex-col min-h-full">
              
              {/* بيانات وتفاصيل المستند */}
              <div className="flex-1 p-6 md:p-8 flex flex-col gap-8 max-w-5xl mx-auto w-full">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                      <h3 className="text-2xl font-black text-slate-800 mb-2">{selectedDoc.name}</h3>
                      <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <Hash className="w-4 h-4" /> {selectedDoc.serialNumber}
                      </p>
                    </div>
                    
                    {/* 💡 زر معاينة الملف عبر FileViewerModal */}
                    <button 
                      onClick={() => handleViewFile(selectedDoc)}
                      className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-5 py-3 rounded-xl font-black text-sm transition-all shadow-sm border border-blue-100 shrink-0"
                    >
                      <ExternalLink className="w-4 h-4" /> معاينة المستند
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* الارتباطات */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4"><LinkIcon className="w-4 h-4 text-blue-500" /> ارتباطات المستند</h4>
                      <div className="space-y-3 text-xs font-bold">
                        <div className="flex justify-between"><span className="text-slate-500">نوع المستند:</span> <span className="text-slate-800 bg-white px-2 py-0.5 border rounded">{selectedDoc.type}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">رقم المعاملة:</span> <span className="text-slate-800">{selectedDoc.transactionId || "غير مرتبط"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">هوية العميل:</span> <span className="text-slate-800">{selectedDoc.clientId || "غير مرتبط"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">الطرف الثاني:</span> <span className="text-slate-800">{selectedDoc.partyB || "غير محدد"}</span></div>
                      </div>
                    </div>

                    {/* قيود الأمان */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4"><ShieldCheck className="w-4 h-4 text-emerald-500" /> قيود الأمان المطبقة</h4>
                      <div className="space-y-3 text-xs font-bold">
                        <div className="flex justify-between"><span className="text-slate-500">التحقق العام:</span> 
                          <span className={selectedDoc.isVerifiable ? "text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100" : "text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100"}>
                            {selectedDoc.isVerifiable ? "مسموح للعامة ✅" : "محظور ❌"}
                          </span>
                        </div>
                        <div className="flex justify-between"><span className="text-slate-500">الحد الأقصى للفتح:</span> <span className="text-slate-800">{selectedDoc.maxViews ? `${selectedDoc.maxViews} مرات فقط` : "غير محدود ♾️"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">تاريخ الصلاحية:</span> <span className="text-slate-800">{selectedDoc.expiryDate ? new Date(selectedDoc.expiryDate).toLocaleDateString('ar-SA') : "دائمة ♾️"}</span></div>
                      </div>
                    </div>
                  </div>

                  {/* السجل الزمني السريع */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3 mb-4"><History className="w-4 h-4 text-amber-500" /> مسار المستند</h4>
                    <div className="flex items-center gap-8 px-4 overflow-x-auto custom-scrollbar-slim pb-2">
                      <div className="flex flex-col items-center shrink-0">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2"><CheckCircle2 className="w-4 h-4" /></div>
                          <p className="text-[11px] font-black text-slate-700">إنشاء وتوثيق</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1">{new Date(selectedDoc.createdAt).toLocaleString('ar-SA')}</p>
                      </div>
                      <div className="flex-1 min-w-[50px] h-1 bg-slate-200 rounded-full mb-6"></div>
                      <div className="flex flex-col items-center shrink-0">
                          <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center mb-2 animate-pulse shadow-lg shadow-amber-500/30"><Clock className="w-4 h-4" /></div>
                          <p className="text-[11px] font-black text-amber-700">بانتظار الاعتماد</p>
                      </div>
                      <div className="flex-1 min-w-[50px] h-1 bg-slate-100 rounded-full mb-6 border border-dashed border-slate-300"></div>
                      <div className="flex flex-col items-center shrink-0 opacity-40">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center mb-2"><ShieldCheck className="w-4 h-4" /></div>
                          <p className="text-[11px] font-black text-slate-500">معتمد نهائياً</p>
                      </div>
                    </div>
                  </div>
              </div>

              {/* منطقة القرار (Action Bar) أسفل الشاشة */}
              <div className="p-6 bg-white border-t border-slate-200 sticky bottom-0 z-20">
                <div className="max-w-5xl mx-auto">
                  {showRejectInput ? (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3 bg-rose-50 p-4 rounded-2xl border border-rose-100">
                      <label className="text-sm font-black text-rose-800 flex items-center gap-1.5"><XCircle className="w-4 h-4"/> سبب الرفض (إلزامي)</label>
                      <input 
                        type="text" 
                        placeholder="اكتب سبب الرفض ليظهر للموظف في السجل..." 
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full text-sm font-bold px-4 py-3 border border-rose-300 rounded-xl outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-white transition-all"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleReject()}
                      />
                      <div className="flex gap-3 mt-2">
                        <button onClick={handleReject} disabled={isProcessing} className="flex-1 bg-rose-600 text-white text-sm font-black py-3 rounded-xl hover:bg-rose-700 shadow-md shadow-rose-600/20 disabled:opacity-50 transition-all flex justify-center items-center gap-2">
                          {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "تأكيد الرفض والإلغاء"}
                        </button>
                        <button onClick={() => setShowRejectInput(false)} className="px-8 bg-white border border-slate-300 text-slate-700 text-sm font-black py-3 rounded-xl hover:bg-slate-50 transition-all">تراجع</button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button 
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white text-lg font-black py-4 rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50 active:scale-[0.98]"
                      >
                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />} الموافقة واعتماد الوثيقة
                      </button>
                      <button 
                        onClick={() => setShowRejectInput(true)}
                        disabled={isProcessing}
                        className="flex items-center justify-center gap-2 bg-white border-2 border-rose-200 text-rose-600 text-sm font-black px-8 py-4 rounded-2xl hover:bg-rose-50 hover:border-rose-300 transition-all disabled:opacity-50 active:scale-[0.98] sm:w-[250px]"
                      >
                        <XCircle className="w-5 h-5" /> رفض الطلب
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>

      {/* 💡 استدعاء شاشة المعاينة المستقلة (FileViewerModal) תظهر فوق كل شيء */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
}