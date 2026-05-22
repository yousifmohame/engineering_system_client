import React, { useState } from "react";
import { 
  FileUp, 
  UploadCloud, 
  Eye, 
  Download, 
  Trash2, 
  FileImage, 
  FileText, 
  FileCode, 
  File,
  Info,
  FolderOpen
} from "lucide-react";
import { toast } from "sonner";


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


export default function FilesTab({ planModal, setPlanModal, setPreviewFile }) {
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // 🎨 دالة ذكية لاختيار أيقونة ولون الملف حسب نوعه
  const getFileIcon = (type) => {
    const t = type?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "tiff", "gif"].includes(t)) 
      return <FileImage className="w-6 h-6 mb-1 text-emerald-500" />;
    if (["pdf"].includes(t)) 
      return <FileText className="w-6 h-6 mb-1 text-rose-500" />;
    if (["dwg", "dxf"].includes(t)) 
      return <FileCode className="w-6 h-6 mb-1 text-[#0e7490]" />;
    return <File className="w-6 h-6 mb-1 text-[#94a3b8]" />;
  };

  // 🔗 دالة لتجهيز الرابط سواء كان Base64 جديد أو رابط من السيرفر
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("data:") || url.startsWith("blob:") || url.startsWith("http")) return url;
    let fixedUrl = url.startsWith("/uploads/") ? `/api${url}` : url;
    return `https://details-worksystem1.com${fixedUrl}`;
  };

  // 🚀 معالجة الملفات المرفوعة (إضافة وتحويل لـ Base64)
  const processFiles = (filesList) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    let processedCount = 0;

    files.forEach((file) => {
      // فلترة مبدئية لحجم الملف إذا أردت (اختياري)
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`الملف ${file.name} يتجاوز الحجم المسموح به (50MB).`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile = {
          id: Date.now() + Math.random(),
          name: file.name,
          url: event.target.result,
          desc: "",
          type: file.name.split(".").pop().toUpperCase(),
        };
        
        setPlanModal((prev) => ({ 
          ...prev, 
          data: { ...prev.data, files: [...(prev.data.files || []), newFile] } 
        }));

        processedCount++;
        if (processedCount === files.length) {
          toast.success(`تم إضافة ${processedCount} ملفات للمخطط بنجاح.`);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // 📋 دعم النسخ واللصق (Ctrl + V)
  const handlePasteEvent = (e) => {
    const items = e.clipboardData?.items || [];
    const filesToProcess = [];
    for (let i = 0; i < items.length; i++) {
      if (items[i].kind === 'file') {
        filesToProcess.push(items[i].getAsFile());
      }
    }
    if (filesToProcess.length > 0) {
      processFiles(filesToProcess);
    }
  };

  // 🗑️ دالة حذف الملف
  const handleDeleteFile = (fileId, fileName) => {
    if (window.confirm(`هل أنت متأكد من إزالة الملف (${fileName})؟`)) {
      setPlanModal((prev) => ({
        ...prev,
        data: { ...prev.data, files: prev.data.files.filter((f) => f.id !== fileId) }
      }));
      toast.success("تم إزالة الملف من القائمة المؤقتة.");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-3 space-y-3 animate-in fade-in custom-scrollbar" dir="rtl">
      
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-wrap md:flex-nowrap justify-between items-end border-b border-[#e8ddc8] pb-4 gap-2.5">
        <div>
          <h4 className="text-sm font-black text-[#123f59] flex items-center gap-2">
            ملفات المخطط والمرفقات الهندسية
          </h4>
          <p className="text-xs font-bold text-[#94a3b8] mt-1.5 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-[#0e7490]" />
            يدعم الصور (JPG, PNG)، ملفات الأوتوكاد (DWG)، وملفات PDF.
          </p>
        </div>
        
        <div className="relative shrink-0">
          <button type="button" className="px-3 py-2.5 bg-[#0e7490] text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-[#15536f] shadow-[0_8px_18px_rgba(18,63,89,0.05)] shadow-[0_8px_18px_rgba(18,63,89,0.06)]/20 transition-all pointer-events-none">
            <IconWithText icon={FileUp} text="تصفح وإضافة ملفات" iconClassName="w-4 h-4" /></button>
          <input 
            key={fileInputKey}
            type="file" 
            multiple 
            accept=".jpg,.jpeg,.png,.webp,.tiff,.dwg,.dxf,.pdf" 
            onChange={(e) => { 
              processFiles(e.target.files); 
              e.target.value = null;
              setFileInputKey(Date.now());
            }} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          />
        </div>
      </div>

      {/* ---------------- Drop Zone ---------------- */}
      <div
        className={`w-full py-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all relative group focus:outline-none focus:ring-4 focus:ring-[#0e7490]/20
          ${isDraggingFiles ? "border-[#0e7490] bg-[#eef7f6] scale-[0.99]" : "border-[#cbd5e1] bg-[#fbf8f1] hover:border-[#0e7490] hover:bg-[#eef7f6]/50"}`}
        onDragOver={(e) => { e.preventDefault(); setIsDraggingFiles(true); }}
        onDragLeave={() => setIsDraggingFiles(false)}
        onDrop={(e) => { e.preventDefault(); setIsDraggingFiles(false); processFiles(e.dataTransfer.files); }}
        onPaste={handlePasteEvent}
        tabIndex="0" // ليقبل الـ Focus ويستطيع التقاط عملية اللصق
      >
        <div className={`p-4 rounded-full mb-3 transition-colors ${isDraggingFiles ? "bg-[#d8b46a]/25 text-[#0e7490]" : "bg-white text-[#94a3b8] shadow-[0_6px_14px_rgba(18,63,89,0.04)] group-hover:text-[#0e7490] group-hover:bg-white"}`}>
          <UploadCloud className="w-10 h-10" />
        </div>
        <span className="text-sm font-black text-[#475569] mb-1">
          اسحب وأفلت الملفات هنا
        </span>
        <span className="text-xs font-bold text-[#94a3b8]">
          أو اضغط (Ctrl + V) للصق الصور والملفات مباشرة
        </span>
      </div>

      {/* ---------------- Files List ---------------- */}
      <div className="space-y-3">
        {(planModal.data.files || []).map((file) => (
          <div 
            key={file.id} 
            className="flex flex-wrap sm:flex-nowrap gap-2.5 p-4 bg-white border border-[#e8ddc8] rounded-xl items-start shadow-[0_6px_14px_rgba(18,63,89,0.04)] transition-all hover:border-[#d8b46a]/40 hover:shadow-[0_8px_18px_rgba(18,63,89,0.05)] group"
          >
            {/* File Icon */}
            <div className="w-10 h-10 bg-[#fbf8f1] border border-[#fbf8f1] rounded-xl flex flex-col items-center justify-center shrink-0 shadow-inner group-hover:bg-white transition-colors">
              {getFileIcon(file.type)}
              <span className="text-[9px] font-black text-[#94a3b8] tracking-wider">
                {file.type || "FILE"}
              </span>
            </div>

            {/* File Details & Description Input */}
            <div className="flex-1 space-y-2.5 min-w-[200px]">
              <div className="text-xs font-black text-[#123f59] truncate" dir="ltr" title={file.name}>
                {file.name}
              </div>
              <input 
                type="text" 
                placeholder="أضف وصفاً تقنياً لهذا الملف (اختياري)..." 
                value={file.desc || ""} 
                onChange={(e) => { 
                  const nF = [...planModal.data.files]; 
                  const idx = nF.findIndex((f) => f.id === file.id); 
                  if (idx !== -1) { 
                    nF[idx].desc = e.target.value; 
                    setPlanModal((p) => ({ ...p, data: { ...p.data, files: nF } })); 
                  } 
                }} 
                className="w-full px-3 py-2 text-xs font-bold border border-[#e8ddc8] rounded-lg outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 bg-[#fbf8f1] focus:bg-white transition-all" 
              />
            </div>

            {/* Actions (Preview, Download, Delete) */}
            <div className="flex gap-2 shrink-0 sm:mt-0 mt-2 w-full sm:w-auto justify-end">
              {/* Preview Button */}
              {setPreviewFile && (
                <button 
                  type="button" 
                  onClick={() => setPreviewFile({ url: getFullUrl(file.url), type: file.type, name: file.name })} 
                  className="p-2.5 text-cyan-600 bg-cyan-50 hover:bg-cyan-600 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                  title="معاينة الملف"
                >
                  <IconWithText icon={Eye} text="" iconClassName="w-4 h-4" /></button>
              )}

              {/* Download Button */}
              <a 
                href={getFullUrl(file.url)} 
                download={file.name}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 text-[#0e7490] bg-[#eef7f6] hover:bg-[#0e7490] hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title="تنزيل الملف"
              >
                <Download className="w-4 h-4" />
              </a>

              {/* Delete Button */}
              <button 
                type="button" 
                onClick={() => handleDeleteFile(file.id, file.name)} 
                className="p-2.5 text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg transition-colors flex items-center justify-center"
                title="حذف الملف"
              >
                <IconWithText icon={Trash2} text="حذف" iconClassName="w-4 h-4" /></button>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {(planModal.data.files || []).length === 0 && (
          <div className="text-center py-4 bg-[#fbf8f1]/50 rounded-xl border border-dashed border-[#e8ddc8] text-[#94a3b8]">
            <FolderOpen className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-bold">لا توجد ملفات مرفقة بهذا المخطط حتى الآن.</p>
          </div>
        )}
      </div>
    </div>
  );
}