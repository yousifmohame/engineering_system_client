import React, { useRef, useState } from "react";
import {
  Upload,
  FileText,
  Trash2,
  Image as ImageIcon,
  File,
  Eye,
  AlertTriangle,
  MessageSquareText,
  Loader2,
  CheckSquare,
  Square,
  Printer,
  Plus,
  Edit2,
  Check,
} from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";

// ⚠️ تأكد من تعديل هذه المسارات لتتطابق مع مشروعك
import axios from "../../../../../api/axios"; 
import { getFullUrl } from "../../../../../utils/urlUtils"; 
import FileViewerModal from "../../../../FilesExplorer/modals/FileViewerModal";

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

  // 1. حالة لإضافة مستند مخصص بالكتابة الحرة
  const [customDocInput, setCustomDocInput] = useState("");

  // 2. حالات التحكم في نافذة عرض الملفات
  const [viewingFile, setViewingFile] = useState(null);

  // 3. حالات التحكم في إعادة التسمية
  const [editingAttachmentId, setEditingAttachmentId] = useState(null);
  const [newAttachmentName, setNewAttachmentName] = useState("");

  // دالة لاقتراح النواقص بناءً على نوع العميل
  const getRecommendedMissingDocs = (type) => {
    switch (type) {
      case "ورثة":
        return [
          "صك حصر الورثة",
          "وكالة شرعية من جميع الورثة",
          "هوية ممثل الورثة",
          "صك الملكية المحدث",
        ];
      case "شركة_مؤسسة":
        return [
          "السجل التجاري ساري المفعول",
          "هوية المفوض بالتوقيع",
          "خطاب تفويض أو قرار مديرين",
          "صك الملكية",
        ];
      case "وقف":
        return ["صك النظارة ساري المفعول", "هوية ناظر الوقف", "صك الوقف"];
      case "جهة_حكومية":
        return ["خطاب تفويض رسمي أو تعميد", "بيانات المشروع"];
      case "فرد":
      default:
        return [
          "صورة هوية المالك",
          "صورة صك الملكية",
          "وكالة شرعية (إن كان الموقّع وكيلًا)",
        ];
    }
  };

  const [recommendedDocs] = useState(getRecommendedMissingDocs(clientType));

  // تحويل النص الحالي للنواقص إلى مصفوفة لتسهيل التحكم
  const missingDocsArray = missingDocs
    .split("\n")
    .filter((doc) => doc.trim() !== "")
    .map((doc) => doc.replace(/^- /, "").trim());

  // التعامل مع تحديد/إلغاء تحديد المستندات
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

  // 🚀 إضافة مستند مخصص بالكتابة الحرة
  const handleAddCustomDoc = (e) => {
    e.preventDefault();
    if (!customDocInput.trim()) return;

    // إضافته للقائمة كعنصر محدد مسبقاً
    const currentArray = [...missingDocsArray];
    if (!currentArray.includes(customDocInput.trim())) {
      currentArray.push(customDocInput.trim());
      const newText = currentArray.map((d) => `- ${d}`).join("\n");
      if (setMissingDocs) setMissingDocs(newText);
    }
    setCustomDocInput(""); // تفريغ الحقل
  };

  // 🚀 الرفع الفوري للملفات إلى السيرفر (Temp Upload) 
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // 1. تجهيز الملفات للإرسال المباشر
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      // 2. إرسال الملفات للسيرفر ليحفظها في المجلد المؤقت temp
      const res = await axios.post("/quotations/upload-temp", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        const uploadedFilesData = res.data.data;

        // 3. دمج البيانات الراجعة من السيرفر مع بيانات الملف لإنشاء objectUrl للاستعراض
        const newAttachments = files.map((file, index) => {
          const serverData = uploadedFilesData[index];
          const tempObjectUrl = URL.createObjectURL(file); // 👈 لغرض الاستعراض المحلي السريع فقط

          return {
            id: Date.now() + Math.random(),
            name: file.name,
            size: (file.size / 1024 / 1024).toFixed(2), // بالحجم الميغابايت
            type: file.type,
            tempPath: serverData.tempPath, // 👈 نحتفظ بالمسار المؤقت لإرساله لاحقاً في الحفظ النهائي
            objectUrl: tempObjectUrl,      // 👈 يستخدم فقط للعرض المباشر عبر الـ FileViewer
            description: "",
            uploadedBy: user?.name || "موظف النظام",
            uploadedAt: new Date().toISOString(),
          };
        });

        if (setOwnerAttachments) {
          setOwnerAttachments([...ownerAttachments, ...newAttachments]);
        }
      }
    } catch (error) {
      console.error("Error uploading temp files:", error);
      alert("حدث خطأ أثناء رفع الملفات للسيرفر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateDescription = (id, text) => {
    if (setOwnerAttachments) {
      setOwnerAttachments(
        ownerAttachments.map((att) =>
          att.id === id ? { ...att, description: text } : att,
        ),
      );
    }
  };

  const removeAttachment = (id) => {
    if (setOwnerAttachments) {
      setOwnerAttachments(ownerAttachments.filter((att) => att.id !== id));
    }
  };

  // 🚀 بدء تعديل اسم الملف
  const startRenaming = (att) => {
    setEditingAttachmentId(att.id);
    const nameWithoutExt =
      att.name.substring(0, att.name.lastIndexOf(".")) || att.name;
    setNewAttachmentName(nameWithoutExt);
  };

  // 🚀 حفظ الاسم الجديد
  const saveRename = (att) => {
    if (!newAttachmentName.trim()) {
      setEditingAttachmentId(null);
      return;
    }
    const extension = att.name.includes(".")
      ? att.name.substring(att.name.lastIndexOf("."))
      : "";
    const finalName = `${newAttachmentName.trim()}${extension}`;

    if (setOwnerAttachments) {
      setOwnerAttachments(
        ownerAttachments.map((item) =>
          item.id === att.id ? { ...item, name: finalName } : item,
        ),
      );
    }
    setEditingAttachmentId(null);
  };

  // 🚀 فتح نافذة عرض الملفات داخل النظام
  const handlePreviewFile = (att) => {
    const extension = att.name.includes(".")
      ? att.name.split(".").pop()
      : "pdf";

    // 👈 إذا كان الملف له filePath فهذا يعني أنه محفوظ مسبقاً، وإلا نستخدم objectUrl الوهمي للملف المؤقت
    const fileUrl = att.filePath 
                    ? getFullUrl(att.filePath) 
                    : (att.objectUrl || att.fileData);

    setViewingFile({
      url: fileUrl,
      name: att.name,
      originalName: att.name,
      extension: extension,
      size: parseFloat(att.size) * 1024 * 1024, // تحويل الميجا إلى بايت للمودال
    });
  };

  const getFileIcon = (fileType) => {
    if (fileType.includes("image"))
      return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (fileType.includes("pdf"))
      return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  // دمج القائمة المقترحة مع العناصر المخصصة التي أضافها المستخدم
  const allDisplayDocs = Array.from(
    new Set([...recommendedDocs, ...missingDocsArray]),
  );

  return (
    <div className="animate-in fade-in duration-300 max-w-5xl mx-auto mt-6">
      {/* 🚀 استدعاء مودال العرض */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* ========================================== */}
        {/* القسم الأول: النواقص والمستندات المطلوبة */}
        {/* ========================================== */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-emerald-50 rounded-lg shrink-0">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">
                  مستندات مطلوبة من العميل
                </h3>
                <p className="text-[10px] text-slate-500">
                  حسب نوع العميل ({clientType.replace("_", " ")})
                </p>
              </div>
            </div>

            <p className="text-[11px] font-bold text-slate-600 mb-3">
              حدد المستندات الناقصة التي يجب على العميل توفيرها:
            </p>

            {/* Checklist */}
            <div className="flex flex-col gap-2 mb-4 max-h-[200px] overflow-y-auto custom-scrollbar-slim pr-1">
              {allDisplayDocs.map((doc, idx) => {
                const isChecked = missingDocsArray.includes(doc);
                return (
                  <label
                    key={idx}
                    className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors select-none"
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isChecked}
                      onChange={() => toggleMissingDoc(doc)}
                    />
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-300 shrink-0" />
                    )}
                    <span
                      className={`text-[11px] font-bold leading-relaxed ${isChecked ? "text-emerald-800" : "text-slate-600"}`}
                    >
                      {doc}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* 🚀 مربع إدخال مستند مخصص (الكتابة الحرة) */}
            <form onSubmit={handleAddCustomDoc} className="mb-4">
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5">
                إضافة مستند آخر (غير موجود بالقائمة)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDocInput}
                  onChange={(e) => setCustomDocInput(e.target.value)}
                  placeholder="اكتب اسم المستند هنا..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  disabled={!customDocInput.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-3 py-2 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* خيار إظهار النواقص في الطباعة */}
            <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <input
                type="checkbox"
                id="printMissingDocs"
                checked={showMissingDocs}
                onChange={(e) =>
                  setShowMissingDocs && setShowMissingDocs(e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label
                htmlFor="printMissingDocs"
                className="flex items-center gap-1.5 text-[11px] font-black text-blue-800 cursor-pointer select-none"
              >
                <Printer className="w-3.5 h-3.5" /> إظهار النواقص في العرض
                المطبوع
              </label>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* القسم الثاني: المرفقات الداخلية (Upload) */}
        {/* ========================================== */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-md">
            <div className="p-2 bg-slate-700 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm mb-1">
                مرفقات داخلية للمكتب
              </h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                ارفع المخططات، الكراسات، أو مسوغات التسعير هنا.{" "}
                <span className="text-amber-400 font-bold">
                  لن تظهر في العرض المطبوع.
                </span>
              </p>
            </div>
          </div>

          <div
            onClick={() => !isUploading && fileInputRef.current?.click()}
            className={`bg-white border-2 border-dashed border-slate-300 rounded-[20px] p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#123f59] transition-all ${isUploading ? "opacity-50 cursor-wait" : ""}`}
          >
            <div className="w-14 h-14 bg-[#eef7f6] rounded-full flex items-center justify-center mb-3">
              {isUploading ? (
                <Loader2 className="w-6 h-6 text-[#0e7490] animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-[#0e7490]" />
              )}
            </div>
            <p className="font-black text-[#123f59] text-sm mb-1 text-center">
              اسحب وأفلت الملفات، أو اضغط للاستعراض
            </p>
            <p className="text-[10px] text-slate-400 font-bold text-center">
              يدعم PDF, الصور, والملفات المضغوطة
            </p>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* قائمة المرفقات الداخلية */}
          {ownerAttachments.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <h4 className="font-black text-[#123f59] text-[11px] flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-[#c5983c]" /> الملفات المرفوعة
                ({ownerAttachments.length})
              </h4>

              <div className="grid grid-cols-1 gap-3 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar-slim">
                {ownerAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="border border-slate-100 bg-slate-50/50 rounded-lg p-3 hover:bg-white hover:border-slate-200 transition-colors relative group"
                  >
                    <button
                      onClick={() => removeAttachment(att.id)}
                      className="absolute top-2 left-0 p-1.5 bg-white border border-red-100 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 shadow-sm"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <div className="flex items-center gap-3 mb-2.5 pr-6">
                      <div className="p-2 bg-white rounded-lg border border-slate-100 shrink-0">
                        {getFileIcon(att.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* 🚀 نظام إعادة التسمية */}
                        {editingAttachmentId === att.id ? (
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              autoFocus
                              value={newAttachmentName}
                              onChange={(e) =>
                                setNewAttachmentName(e.target.value)
                              }
                              onKeyDown={(e) =>
                                e.key === "Enter" && saveRename(att)
                              }
                              className="flex-1 text-xs font-bold text-[#123f59] border-b-2 border-indigo-500 bg-transparent outline-none pb-0.5"
                            />
                            <button
                              onClick={() => saveRename(att)}
                              className="text-emerald-600 bg-emerald-50 p-1 rounded hover:bg-emerald-100"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1 group/title">
                            <h5
                              className="font-bold text-[#123f59] text-xs truncate max-w-[80%]"
                              title={att.name}
                            >
                              {att.name}
                            </h5>
                            <button
                              onClick={() => startRenaming(att)}
                              className="text-slate-400 opacity-0 bg-white group-hover/title:opacity-100 hover:text-indigo-600 transition-all"
                              title="إعادة تسمية"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        <div className="flex gap-2 items-center text-[9px] text-slate-500 font-mono mt-0.5">
                          <span className="bg-slate-200/50 px-1.5 py-0.5 rounded">
                            {att.size} MB
                          </span>
                          <button
                            onClick={() => handlePreviewFile(att)}
                            className="text-[#0e7490] hover:underline flex items-center gap-0.5"
                          >
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
                        onChange={(e) =>
                          updateDescription(att.id, e.target.value)
                        }
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