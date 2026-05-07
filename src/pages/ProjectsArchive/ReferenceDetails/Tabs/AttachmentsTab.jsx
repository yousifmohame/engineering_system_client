import React, { useState, useRef } from "react";
import {
  FolderArchive,
  FileText,
  Eye,
  Trash2,
  PenLine,
  Check,
  X,
  UploadCloud,
  Download, // أيقونة إضافية للتحميل داخل المعاينة
} from "lucide-react";

export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export default function AttachmentsTab({
  data,
  onDeleteFile,
  onRenameFile,
  onUploadFile,
}) {
  const [editingFileId, setEditingFileId] = useState(null);
  const [newName, setNewName] = useState("");

  // 💡 حالة جديدة لمعاينة الملفات
  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  const getArabicFileName = (name) => {
    try {
      return decodeURIComponent(escape(name));
    } catch (e) {
      try {
        return decodeURIComponent(name);
      } catch (err) {
        return name;
      }
    }
  };

  const handleEditStart = (file, currentName) => {
    const fileIdentifier = file.id || file.fileUrl;
    setEditingFileId(fileIdentifier);
    setNewName(getArabicFileName(currentName));
  };

  const handleRenameSubmit = (file) => {
    if (onRenameFile && newName.trim() !== "") {
      onRenameFile(file, newName);
    }
    setEditingFileId(null);
  };

  const handleCancelEdit = () => {
    setEditingFileId(null);
    setNewName("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onUploadFile) {
      onUploadFile(file);
    }
    e.target.value = null;
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300 relative">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
          <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
            <FolderArchive className="w-4 h-4 text-indigo-600" /> المصادر
            والمرفقات ({data.files?.length || 0})
          </h4>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-bold transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            رفع ملف إضافي
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.files?.map((file, idx) => {
            const fileIdentifier = file.id || file.fileUrl;
            const isEditing = editingFileId === fileIdentifier;

            const fullFileUrl = getFullUrl(file.fileUrl);

            return (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1 overflow-hidden">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shrink-0 shadow-sm">
                    <FileText className="w-6 h-6 text-indigo-600" />
                  </div>

                  <div className="overflow-hidden flex-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="text"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full text-xs font-black text-slate-700 border border-indigo-300 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-indigo-100"
                          dir="rtl"
                          autoFocus
                        />
                        <button
                          onClick={() => handleRenameSubmit(file)}
                          className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-md transition-colors"
                          title="حفظ"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-rose-600 hover:bg-rose-50 p-1.5 rounded-md transition-colors"
                          title="إلغاء"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-sm font-black text-slate-700 truncate block mt-1"
                        dir="rtl"
                        title={getArabicFileName(file.originalName)}
                      >
                        {getArabicFileName(file.originalName)}
                      </span>
                    )}

                    <span className="text-xs text-slate-400 font-mono mt-1 block">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* 💡 تحويل زر المعاينة ليفتح الـ Modal بدلاً من صفحة جديدة */}
                    <button
                      type="button"
                      onClick={() => setPreviewUrl(fullFileUrl)}
                      className="p-1.5 bg-indigo-50/50 text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white rounded-lg transition-colors shadow-sm"
                      title="معاينة الملف"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditStart(file, file.originalName)}
                      className="p-1.5 bg-amber-50/50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white rounded-lg transition-colors shadow-sm"
                      title="تغيير الاسم"
                    >
                      <PenLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFile && onDeleteFile(file)}
                      className="p-1.5 bg-rose-50/50 text-rose-600 border border-rose-100 hover:bg-rose-600 hover:text-white rounded-lg transition-colors shadow-sm"
                      title="حذف الملف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {(!data.files || data.files.length === 0) && (
            <div className="col-span-2 p-8 text-center text-slate-400 text-sm font-bold bg-slate-50 rounded-xl border border-dashed border-slate-200">
              لا توجد ملفات مرفقة بهذا المشروع.
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 💡 نافذة المعاينة المنبثقة (File Preview Modal) */}
      {/* ======================================================== */}
      {previewUrl && (
        <div className="fixed !m-0 inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 md:p-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            {/* رأس النافذة */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="p-2 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-full transition-colors"
                  title="إغلاق المعاينة"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-black text-slate-800 text-lg">
                  معاينة المستند
                </h3>
              </div>

              {/* زر لتحميل الملف */}
              <a
                href={previewUrl}
                download
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                فتح / تحميل الملف
              </a>
            </div>

            {/* منطقة العرض (Iframe) */}
            <div className="flex-1 bg-slate-200 relative w-full h-full p-2 md:p-4">
              <iframe
                src={previewUrl}
                title="File Preview"
                className="w-full h-full bg-white rounded-xl border border-slate-300 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
