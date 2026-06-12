import React, { useRef, useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Trash2,
  User,
  Clock,
  Image as ImageIcon,
  File,
  Eye,
  AlertTriangle,
  MessageSquareText,
  Loader2,
  CheckSquare,
  Square,
  Printer
} from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";

const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const Step6Attachments = ({ props }) => {
  const {
    ownerAttachments = [],
    setOwnerAttachments,
    clientType = "فرد",
    missingDocs = "",
    setMissingDocs,
    showMissingDocs = false,
    setShowMissingDocs,
  } = props;

  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // 🧠 دالة لاقتراح النواقص بناءً على نوع العميل
  const getRecommendedMissingDocs = (type) => {
    switch (type) {
      case "ورثة":
        return ["صك حصر الورثة", "وكالة شرعية من جميع الورثة", "هوية ممثل الورثة", "صك الملكية المحدث"];
      case "شركة_مؤسسة":
        return ["السجل التجاري ساري المفعول", "هوية المفوض بالتوقيع", "خطاب تفويض أو قرار مديرين", "صك الملكية"];
      case "وقف":
        return ["صك النظارة ساري المفعول", "هوية ناظر الوقف", "صك الوقف"];
      case "جهة_حكومية":
        return ["خطاب تفويض رسمي أو تعميد", "بيانات المشروع"];
      case "فرد":
      default:
        return ["صورة هوية المالك", "صورة صك الملكية", "وكالة شرعية (إن كان الموقّع وكيلًا)"];
    }
  };

  const [recommendedDocs] = useState(getRecommendedMissingDocs(clientType));

  // تحويل النص الحالي للنواقص إلى مصفوفة لتسهيل التحكم بالـ Checkbox
  const missingDocsArray = missingDocs
    .split("\n")
    .filter((doc) => doc.trim() !== "")
    .map((doc) => doc.replace("- ", "").trim());

  // التعامل مع تحديد/إلغاء تحديد المستندات المقترحة
  const toggleMissingDoc = (docTitle) => {
    let currentArray = [...missingDocsArray];
    if (currentArray.includes(docTitle)) {
      currentArray = currentArray.filter((d) => d !== docTitle);
    } else {
      currentArray.push(docTitle);
    }
    const newText = currentArray.map((d) => `- ${d}`).join("\n");
    if (setMissingDocs) setMissingDocs(newText);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newAttachments = await Promise.all(
        files.map(async (file) => {
          const base64Data = await convertToBase64(file);
          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2),
            type: file.type,
            fileData: base64Data,
            description: "",
            uploadedBy: user?.name || "موظف النظام",
            uploadedAt: new Date().toISOString(),
          };
        })
      );
      if (setOwnerAttachments) setOwnerAttachments([...ownerAttachments, ...newAttachments]);
    } catch (error) {
      console.error("Error reading files:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateDescription = (id, text) => {
    if (setOwnerAttachments) {
      setOwnerAttachments(
        ownerAttachments.map((att) =>
          att.id === id ? { ...att, description: text } : att
        )
      );
    }
  };

  const removeAttachment = (id) => {
    if (setOwnerAttachments) {
      setOwnerAttachments(ownerAttachments.filter((att) => att.id !== id));
    }
  };

  const openFilePreview = (fileData, fileType) => {
    if (!fileData) return;
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (fileType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto mt-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* القسم الأيمن: النواقص والمستندات المطلوبة (Checklist) */}
        {/* ========================================== */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">مستندات مطلوبة من العميل</h3>
                <p className="text-[10px] text-slate-500">حسب نوع العميل ({clientType.replace("_", " ")})</p>
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-600 mb-3">
              حدد المستندات الناقصة التي يجب على العميل توفيرها:
            </p>

            {/* Checklist */}
            <div className="flex flex-col gap-2 mb-4">
              {recommendedDocs.map((doc, idx) => {
                const isChecked = missingDocsArray.includes(doc);
                return (
                  <label key={idx} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors select-none">
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={isChecked}
                      onChange={() => toggleMissingDoc(doc)}
                    />
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300" />
                    )}
                    <span className={`text-[11px] font-bold ${isChecked ? "text-emerald-800" : "text-slate-600"}`}>
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* مربع إدخال يدوي إضافي للنواقص */}
            <div className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5">ملاحظات إضافية / نواقص أخرى</label>
              <textarea 
                value={missingDocs}
                onChange={(e) => setMissingDocs && setMissingDocs(e.target.value)}
                placeholder="أضف أي نواقص أخرى هنا (كل ناقص في سطر يبدأ بـ - )..."
                className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white resize-none transition-all custom-scrollbar-slim"
                dir="rtl"
              />
            </div>

            {/* خيار إظهار النواقص في الطباعة */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <input
                type="checkbox"
                id="printMissingDocs"
                checked={showMissingDocs}
                onChange={(e) => setShowMissingDocs && setShowMissingDocs(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="printMissingDocs" className="flex items-center gap-1.5 text-[11px] font-black text-blue-800 cursor-pointer select-none">
                <Printer className="w-3.5 h-3.5" /> إظهار النواقص في العرض المطبوع للعميل
              </label>
            </div>
          </div>
        </div>


        {/* ========================================== */}
        {/* القسم الأيسر: المرفقات الداخلية (Upload) */}
        {/* ========================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-md">
            <div className="p-2 bg-slate-700 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">مرفقات داخلية للمكتب</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ارفع المخططات، الكراسات، أو مسوغات التسعير هنا. <span className="text-amber-400 font-bold">لن تظهر في العرض المطبوع.</span>
              </p>
            </div>
          </div>

          <div 
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`bg-white border-2 border-dashed border-slate-300 rounded-[20px] p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#123f59] transition-all ${isUploading ? "opacity-50 cursor-wait" : ""}`}
          >
            <div className="w-14 h-14 bg-[#eef7f6] rounded-full flex items-center justify-center mb-3">
              {isUploading ? <Loader2 className="w-6 h-6 text-[#0e7490] animate-spin" /> : <Upload className="w-6 h-6 text-[#0e7490]" />}
            </div>
            <p className="font-black text-[#123f59] text-sm mb-1 text-center">اسحب وأفلت الملفات، أو اضغط للاستعراض</p>
            <p className="text-[10px] text-slate-400 font-bold text-center">يدعم PDF, الصور, والملفات المضغوطة</p>
            <input type="file" multiple ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
          </div>

          {/* قائمة المرفقات الداخلية */}
          {ownerAttachments.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-black text-[#123f59] text-[11px] flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#c5983c]" /> الملفات المرفوعة ({ownerAttachments.length})
              </h4>
              
              <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar-slim">
                {ownerAttachments.map((att) => (
                  <div key={att.id} className="border border-slate-100 bg-slate-50/50 rounded-lg p-3 hover:bg-white hover:border-slate-200 transition-colors relative group">
                    <button 
                      onClick={() => removeAttachment(att.id)}
                      className="absolute top-2 left-2 p-1.5 bg-white border border-red-100 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-3 mb-2.5 pr-6">
                      <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0">
                        {getFileIcon(att.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-[#123f59] text-xs truncate" title={att.name}>{att.name}</h5>
                        <div className="flex gap-2 items-center text-[9px] text-slate-500 font-mono mt-0.5">
                          <span className="bg-slate-200/50 px-1.5 py-0.5 rounded">{att.size} MB</span>
                          <button onClick={() => openFilePreview(att.fileData, att.type)} className="text-[#0e7490] hover:underline flex items-center gap-0.5">
                            <Eye className="w-3 h-3" /> استعراض
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="relative">
                      <MessageSquareText className="absolute right-2 top-1.5 w-3 h-3 text-slate-400" />
                      <input 
                        type="text" 
                        value={att.description}
                        onChange={(e) => updateDescription(att.id, e.target.value)}
                        placeholder="وصف للمرفق (مثال: مسودة الكروكي)..."
                        className="w-full bg-white border border-slate-200 rounded-md py-1 pl-2 pr-7 text-[10px] font-bold text-slate-700 outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]/20"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Step6Attachments;