import React, { useState, useRef, useEffect } from "react";
import {
  FolderArchive,
  FileText,
  Eye,
  Trash2,
  PenLine,
  Check,
  X,
  UploadCloud,
  Download,
  Loader2,
  CopyPlus,
  FileImage,
  Box,
  PenTool,
  FileArchive,
  FileQuestion,
  ChevronRight,
  ChevronLeft,
  RotateCw,
  RotateCcw,
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

// 💡 دالة ذكية لمعرفة نوع الملف وتحديد الأيقونة واللون وقابلية المعاينة
const getFileMeta = (fileName) => {
  if (!fileName)
    return { icon: FileQuestion, color: "text-slate-500", preview: false };
  const ext = fileName.split(".").pop().toLowerCase();

  if (["pdf"].includes(ext))
    return {
      icon: FileText,
      color: "text-rose-500",
      bg: "bg-rose-50",
      preview: true,
      label: "PDF",
    };
  if (["jpg", "jpeg", "png", "webp"].includes(ext))
    return {
      icon: FileImage,
      color: "text-sky-500",
      bg: "bg-sky-50",
      preview: true,
      label: "صورة",
    };
  if (["dwg", "dxf"].includes(ext))
    return {
      icon: PenTool,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
      preview: false,
      label: "AutoCAD",
    };
  if (["rvt", "rfa"].includes(ext))
    return {
      icon: Box,
      color: "text-teal-500",
      bg: "bg-teal-50",
      preview: false,
      label: "Revit",
    };
  if (["zip", "rar", "7z"].includes(ext))
    return {
      icon: FileArchive,
      color: "text-amber-500",
      bg: "bg-amber-50",
      preview: false,
      label: "أرشيف",
    };

  return {
    icon: FileQuestion,
    color: "text-slate-500",
    bg: "bg-slate-50",
    preview: false,
    label: "ملف",
  };
};

export default function AttachmentsTab({
  data,
  onDeleteFile,
  onRenameFile,
  onUploadFile,
}) {
  const [editingFileId, setEditingFileId] = useState(null);
  const [newName, setNewName] = useState("");
  const [editingExtension, setEditingExtension] = useState("");

  // 💡 تغيير حالة المعاينة لتحفظ "رقم" الملف بدلاً من كائنه لسهولة التنقل
  const [previewIndex, setPreviewIndex] = useState(null);
  const [rotation, setRotation] = useState(0); // 💡 حالة التدوير

  const [inputKey, setInputKey] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const processFiles = async (filesArray) => {
    if (!filesArray || filesArray.length === 0) return;
    setIsUploading(true);
    try {
      if (onUploadFile) await onUploadFile(filesArray);
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
      setInputKey(Date.now());
    }
  };

  const handleFileChange = (e) => processFiles(Array.from(e.target.files));
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  useEffect(() => {
    const handlePaste = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      const pastedFiles = e.clipboardData?.files;
      if (pastedFiles && pastedFiles.length > 0)
        processFiles(Array.from(pastedFiles));
    };
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [onUploadFile]);

  // 1. عند بدء التعديل: نفصل الاسم عن الامتداد
  const handleEditStart = (file, currentName) => {
    setEditingFileId(file.id || file.fileUrl);

    const decodedName = getArabicFileName(currentName);
    const lastDotIndex = decodedName.lastIndexOf("."); // نبحث عن آخر نقطة في الاسم

    if (lastDotIndex !== -1) {
      // إذا وجدنا امتداد، نفصله
      setNewName(decodedName.substring(0, lastDotIndex));
      setEditingExtension(decodedName.substring(lastDotIndex)); // مثال: ".pdf"
    } else {
      // إذا كان الملف بدون امتداد (نادر جداً)
      setNewName(decodedName);
      setEditingExtension("");
    }
  };

  // 2. عند الحفظ: ندمج الاسم الجديد مع الامتداد المحفوظ
  const handleRenameSubmit = (file) => {
    if (onRenameFile && newName.trim() !== "") {
      const finalName = newName.trim() + editingExtension; // 👈 الدمج هنا
      onRenameFile(file, finalName);
    }
    setEditingFileId(null);
    setEditingExtension(""); // تفريغ
  };

  // 3. عند الإلغاء
  const handleCancelEdit = () => {
    setEditingFileId(null);
    setNewName("");
    setEditingExtension(""); // تفريغ
  };

  // ==========================================
  // 💡 دوال التنقل في المعاينة (التالي / السابق / تدوير)
  // ==========================================
  const handleNextPreview = () => {
    if (!data?.files?.length) return;
    setPreviewIndex((prev) => (prev + 1) % data.files.length);
    setRotation(0); // إعادة التدوير للصفر عند فتح ملف جديد
  };

  const handlePrevPreview = () => {
    if (!data?.files?.length) return;
    setPreviewIndex((prev) => (prev === 0 ? data.files.length - 1 : prev - 1));
    setRotation(0);
  };

  const openPreview = (index) => {
    setPreviewIndex(index);
    setRotation(0);
  };

  const closePreview = () => {
    setPreviewIndex(null);
    setRotation(0);
  };

  // تجهيز بيانات الملف المفتوح حالياً في المعاينة
  const currentPreviewFile =
    previewIndex !== null ? data?.files?.[previewIndex] : null;
  const currentPreviewMeta = currentPreviewFile
    ? getFileMeta(currentPreviewFile.originalName)
    : null;
  const currentPreviewUrl = currentPreviewFile
    ? getFullUrl(currentPreviewFile.fileUrl)
    : null;
  const currentPreviewName = currentPreviewFile
    ? getArabicFileName(currentPreviewFile.originalName)
    : null;

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`bg-white rounded-2xl shadow-sm border p-6 relative transition-all duration-300 animate-in fade-in slide-in-from-bottom-4
          ${isDragging ? "border-indigo-500 border-dashed bg-indigo-50/50 shadow-md ring-4 ring-indigo-50" : "border-slate-200"}
        `}
      >
        {isUploading && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl animate-in fade-in">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
            <p className="text-sm font-black text-slate-800">
              جاري الرفع والضغط...
            </p>
            <p className="text-xs font-bold text-slate-500 mt-1">
              يرجى الانتظار، السيرفر يعالج الملفات
            </p>
          </div>
        )}

        {isDragging && !isUploading && (
          <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-indigo-50/90 backdrop-blur-sm rounded-2xl border-2 border-indigo-400 border-dashed animate-in zoom-in-95">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 animate-bounce">
              <CopyPlus className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-indigo-900">
              أفلت الملفات الهندسية هنا
            </h3>
            <p className="text-sm font-bold text-indigo-600 mt-2">
              يدعم PDF, صور, AutoCAD, Revit
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 mb-5 gap-4">
          <div>
            <h4 className="text-base font-black text-slate-800 flex items-center gap-2">
              <FolderArchive className="w-5 h-5 text-indigo-600" /> المصادر
              والمرفقات ({data.files?.length || 0})
            </h4>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
              يدعم كافة الصيغ الهندسية (AutoCAD, Revit, PDF) والصور
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            رفع ملفات إضافية
          </button>

          <input
            key={inputKey}
            type="file"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* 💡 التعديل هنا: استخدام flex-col لكي تظهر الملفات كقائمة عمودية تحت بعضها */}
        <div className="flex flex-col gap-3">
          {data.files?.map((file, idx) => {
            const fileIdentifier = file.id || file.fileUrl;
            const isEditing = editingFileId === fileIdentifier;
            const fullFileUrl = getFullUrl(file.fileUrl);
            const originalName = getArabicFileName(file.originalName);

            const meta = getFileMeta(originalName);
            const Icon = meta.icon;

            return (
              <div
                key={idx}
                className="flex items-start justify-between gap-4 p-4 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-indigo-200 hover:shadow-sm transition-all group"
              >
                <div className="flex items-start gap-4 flex-1 overflow-hidden">
                  <div
                    className={`p-3 ${meta.bg} border border-slate-100 rounded-xl shrink-0 shadow-sm transition-colors`}
                  >
                    <Icon className={`w-6 h-6 ${meta.color}`} />
                  </div>

                  <div className="overflow-hidden flex-1 pt-1">
                    {isEditing ? (
                      <div className="flex items-center gap-2 w-full">
                        <div className="flex items-center flex-1 border-b-2 border-indigo-500 bg-transparent">
                          <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full text-xs font-black text-slate-800 px-1 py-1 outline-none min-w-0"
                            dir="rtl"
                            autoFocus
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleRenameSubmit(file)
                            }
                          />
                          {/* 👈 عرض الامتداد كنص ثابت للمستخدم */}
                          <span
                            className="text-xs font-bold text-slate-400 font-mono px-1 shrink-0"
                            dir="ltr"
                          >
                            {editingExtension}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRenameSubmit(file)}
                          className="text-emerald-600 hover:bg-emerald-100 p-1.5 rounded-lg shrink-0"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-rose-600 hover:bg-rose-100 p-1.5 rounded-lg shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      // 💡 الآن الاسم سيأخذ مساحته بالكامل ولن يختنق
                      <span
                        className="text-sm font-black text-slate-700 truncate block cursor-default"
                        dir="rtl"
                        title={originalName}
                      >
                        {originalName}
                      </span>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                        {meta.label}
                      </span>
                      <span className="text-[11px] font-black text-slate-400 tracking-wider">
                        {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1.5 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">
                    {meta.preview ? (
                      <button
                        onClick={() => openPreview(idx)}
                        className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg transition-all"
                        title="معاينة"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    ) : (
                      <a
                        href={fullFileUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-teal-50 text-teal-600 hover:bg-teal-600 hover:text-white rounded-lg transition-all flex items-center justify-center"
                        title="تحميل الملف الهندسي"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleEditStart(file, file.originalName)}
                      className="p-2 bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white rounded-lg transition-all"
                      title="إعادة تسمية"
                    >
                      <PenLine className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteFile && onDeleteFile(file)}
                      className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {(!data.files || data.files.length === 0) && (
            <div className="p-10 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200">
              <div className="w-16 h-16 bg-white border border-slate-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                <UploadCloud className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="text-sm font-black text-slate-700">
                لا توجد مرفقات حتى الآن
              </h4>
              <p className="text-xs font-bold text-slate-400 mt-1">
                قم بسحب وإفلات ملفات الأوتوكاد، الريفيت، أو الـ PDF هنا
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- نافذة المعاينة الآمنة مع أزرار التدوير والتنقل --- */}
      {previewIndex !== null && currentPreviewFile && (
        <div className="fixed !m-0 inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          {/* 💡 أزرار التنقل (Next / Prev) */}
          {data.files.length > 1 && (
            <>
              {/* زر السابق (يمين الشاشة لأننا في بيئة عربية RTL) */}
              <button
                onClick={handlePrevPreview}
                className="absolute right-4 md:right-8 z-[210] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
                title="الملف السابق"
              >
                <ChevronRight className="w-8 h-8" />
              </button>

              {/* زر التالي (يسار الشاشة) */}
              <button
                onClick={handleNextPreview}
                className="absolute left-4 md:left-8 z-[210] p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all border border-white/20"
                title="الملف التالي"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative z-[205]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3 overflow-hidden">
                <button
                  onClick={closePreview}
                  className="p-2 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-full transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="font-black text-slate-800 text-base md:text-lg truncate">
                  {currentPreviewName}
                </h3>
                <span className="text-xs font-bold text-slate-400 shrink-0 hidden md:block">
                  ({previewIndex + 1} من {data.files.length})
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* 💡 أزرار التدوير */}
                {currentPreviewMeta?.preview && (
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-2">
                    <button
                      onClick={() => setRotation((r) => r - 90)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="تدوير عكس عقارب الساعة"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-200"></div>
                    <button
                      onClick={() => setRotation((r) => r + 90)}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="تدوير مع عقارب الساعة"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <a
                  href={currentPreviewUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" />{" "}
                  <span className="hidden md:inline">تحميل الملف</span>
                </a>
              </div>
            </div>

            <div className="flex-1 bg-slate-200 relative w-full h-full p-2 md:p-6 flex items-center justify-center overflow-hidden">
              {currentPreviewMeta?.preview ? (
                // 💡 الحاوية المسؤولة عن التدوير
                <div
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className="w-full h-full transition-transform duration-300 flex items-center justify-center"
                >
                  <iframe
                    src={currentPreviewUrl}
                    title="File Preview"
                    className="w-full h-full bg-white rounded-xl border border-slate-300 shadow-inner"
                  />
                </div>
              ) : (
                <div className="text-center p-10 bg-white rounded-2xl shadow-sm border border-slate-300 max-w-sm">
                  <Box className="w-20 h-20 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-slate-700 mb-2">
                    لا يمكن معاينة هذا الملف
                  </h3>
                  <p className="text-slate-500 text-sm font-bold leading-relaxed">
                    هذا الملف ({currentPreviewMeta.label}) لا يدعم المعاينة
                    المباشرة داخل المتصفح. يمكنك تخطيه للملف التالي أو تحميله
                    مباشرة.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
