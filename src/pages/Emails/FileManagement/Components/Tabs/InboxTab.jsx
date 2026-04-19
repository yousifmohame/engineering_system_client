import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // 💡 تأكد من صحة مسار الـ axios
import { toast } from "sonner";
import {
  Search,
  Filter,
  FileBox,
  Activity,
  Shield,
  Clock,
  FolderInput,
  Download,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { AIActionButton } from "../../Components/ai/AIActionButton";

// 💡 دالة تحويل الروابط للعمل بشكل صحيح مع الباك إند
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com"; // 💡 الدومين المخصص
  return `${baseUrl}${fixedUrl}`;
};

export default function InboxTab({ inboxFiles = [], setAnalyzingFile }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState(null); // لحفظ ID الملف الجاري حذفه

  // 💡 دوال مساعدة للتنسيق
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 🚀 ميوتيشن حذف الملف
  const deleteMutation = useMutation({
    mutationFn: async (fileId) => {
      await api.delete(`/transfer-center/files/${fileId}`);
    },
    onMutate: (fileId) => {
      setIsDeleting(fileId);
    },
    onSuccess: () => {
      toast.success("تم حذف الملف بنجاح");
      queryClient.invalidateQueries(["transfer-center-data"]); // تحديث القائمة
    },
    onError: () => {
      toast.error("فشل حذف الملف، يرجى المحاولة لاحقاً");
    },
    onSettled: () => {
      setIsDeleting(null);
    }
  });

  const handleDelete = (e, id) => {
    e.preventDefault();
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً؟")) {
      deleteMutation.mutate(id);
    }
  };

  // 💡 فلترة الملفات بناءً على البحث
  const filteredFiles = inboxFiles.filter(f => 
    (f.fileName && f.fileName.includes(searchTerm)) ||
    (f.originalName && f.originalName.includes(searchTerm)) ||
    (f.senderName && f.senderName.includes(searchTerm))
  );

  return (
    <>
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-3 items-center justify-between shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3" />
          <input
            type="text"
            placeholder="بحث بالاسم أو اسم المرسل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none">
            <option>إحصائيات الفحص</option>
            <option>مفحوص ونظيف</option>
            <option>بانتظار الفحص</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none">
            <option>حالة الربط</option>
            <option>مرتبط بالعميل</option>
            <option>غير مرتبط</option>
          </select>
          <button className="p-2 border border-slate-200 bg-white rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid gap-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group"
            >
              <div className="flex items-start gap-4 mb-3 sm:mb-0 w-full sm:w-auto">
                <div className="p-3 bg-red-50 text-red-500 rounded-xl shrink-0 group-hover:bg-red-100 transition-colors">
                  <FileBox className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-slate-800" dir="ltr">
                      {file.originalName || file.fileName}
                    </h4>
                    {file.isProcessed ? (
                      <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 rounded font-black flex items-center gap-0.5">
                        <Activity className="w-2.5 h-2.5" /> مرتبط
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 rounded font-black border border-amber-200">
                        غير مرتبط
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mb-1">
                    المرسل:{" "}
                    <span className="text-slate-700">
                      {file.senderName || "غير محدد"}
                    </span>{" "}
                    • {formatDate(file.uploadedAt)}
                  </p>
                  <div className="flex gap-3 text-[10px] font-black mt-2">
                    <span className="text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      الحجم: {formatFileSize(file.fileSize)}
                    </span>
                    <span className="text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded">
                      المصدر: {file.fileRequest?.title || "استقبال عام"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end mt-3 sm:mt-0">
                <AIActionButton
                  label="استخراج البيانات"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setAnalyzingFile({ name: file.originalName || file.fileName, id: file.id })
                  }
                />
                
                <div className="flex items-center gap-2 flex-1 sm:flex-none justify-end mx-2">
                  {file.isSafe ? (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> مفحوص وآمن
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-amber-100 text-amber-700 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> قيد الفحص الأمني
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {/* زر التعيين لمجلد (يظهر إذا لم يتم معالجته) */}
                  {!file.isProcessed && (
                    <button className="px-2 py-1.5 flex items-center gap-1 text-[10px] font-black bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100 shadow-sm opacity-0 group-hover:opacity-100 hidden sm:flex">
                      <FolderInput className="w-3 h-3" /> تعيين
                    </button>
                  )}

                  {/* 🚀 زر معاينة الملف */}
                  <a
                    href={getFullUrl(file.filePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="معاينة الملف"
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 bg-white shadow-sm transition-colors sm:block hidden"
                  >
                    <Eye className="w-4 h-4" />
                  </a>

                  {/* 🚀 زر تنزيل الملف */}
                  <a
                    href={getFullUrl(file.filePath)}
                    download={file.originalName || file.fileName} // يجبر المتصفح على التحميل
                    title="تنزيل الملف"
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 bg-white shadow-sm transition-colors sm:block hidden"
                  >
                    <Download className="w-4 h-4" />
                  </a>

                  {/* 🚀 زر الحذف */}
                  <button
                    onClick={(e) => handleDelete(e, file.id)}
                    disabled={isDeleting === file.id}
                    title="حذف الملف"
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 bg-white shadow-sm transition-colors opacity-0 group-hover:opacity-100 sm:block hidden disabled:opacity-50"
                  >
                    {isDeleting === file.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredFiles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400">
                لا توجد ملفات مستلمة تطابق بحثك
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}