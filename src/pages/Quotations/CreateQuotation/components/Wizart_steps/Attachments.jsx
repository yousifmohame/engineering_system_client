import React, { useRef, useState } from "react";
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
  Loader2
} from "lucide-react";
// 🚨 تأكد من صحة مسار useAuth بناءً على هيكلة مشروعك
import { useAuth } from "../../../../../context/AuthContext";

// دالة مساعدة لتحويل الملفات إلى Base64 لتخزينها في قاعدة البيانات بسهولة
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

export const Step6Attachments = ({ props }) => {
  const { ownerAttachments = [], setOwnerAttachments } = props;
  const { user } = useAuth(); // جلب بيانات الموظف الحالي
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

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
            size: (file.size / 1024 / 1024).toFixed(2), // الحجم بالميجا
            type: file.type,
            fileData: base64Data, // الملف الفعلي كـ Base64
            description: "", // وصف فارغ مبدئياً
            uploadedBy: user?.name || "موظف النظام",
            uploadedAt: new Date().toISOString(),
          };
        })
      );

      setOwnerAttachments([...ownerAttachments, ...newAttachments]);
    } catch (error) {
      console.error("Error reading files:", error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const updateDescription = (id, text) => {
    setOwnerAttachments(
      ownerAttachments.map((att) =>
        att.id === id ? { ...att, description: text } : att
      )
    );
  };

  const removeAttachment = (id) => {
    setOwnerAttachments(ownerAttachments.filter((att) => att.id !== id));
  };

  const openFilePreview = (fileData, fileType) => {
    if (!fileData) return;
    // فتح الملف في نافذة جديدة بناءً على الـ Base64
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(
        `<iframe src="${fileData}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
      );
    }
  };

  // دالة لاختيار الأيقونة المناسبة بناءً على نوع الملف
  const getFileIcon = (fileType) => {
    if (fileType.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (fileType.includes("pdf")) return <FileText className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-slate-500" />;
  };

  return (
    <div className="animate-in fade-in duration-300 max-w-4xl mx-auto mt-6">
      {/* ⚠️ تنبيه الاستخدام الداخلي */}
      <div className="mb-6 p-4 bg-slate-800 rounded-xl flex items-start gap-3 shadow-lg">
        <div className="p-2 bg-slate-700 rounded-lg shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>
        <div>
          <h3 className="text-white font-bold text-sm mb-1">مرفقات داخلية (مسوغات التسعير)</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            هذا القسم مخصص للاستخدام الداخلي للمكتب فقط. قم برفع المخططات، الكراسات، أو أي مستندات تم بناء العرض بناءً عليها. <span className="text-amber-400 font-bold">هذه المرفقات لن تظهر للعميل في العرض النهائي.</span>
          </p>
        </div>
      </div>

      {/* منطقة الرفع */}
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`bg-white border-2 border-dashed border-slate-300 rounded-[24px] p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-[#123f59] transition-all mb-8 ${isUploading ? "opacity-50 cursor-wait" : ""}`}
      >
        <div className="w-16 h-16 bg-[#eef7f6] rounded-full flex items-center justify-center mb-4">
          {isUploading ? (
            <Loader2 className="w-8 h-8 text-[#0e7490] animate-spin" />
          ) : (
            <Upload className="w-8 h-8 text-[#0e7490]" />
          )}
        </div>
        <p className="font-black text-[#123f59] text-lg mb-2">
          اسحب وأفلت المرفقات هنا أو اضغط للاستعراض
        </p>
        <p className="text-sm text-slate-400 font-bold">يدعم جميع صيغ الملفات (PDF, صور, ملفات أوتوكاد مضغوطة...)</p>
        <input 
          type="file" 
          multiple 
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden" 
        />
      </div>

      {/* قائمة المرفقات */}
      {ownerAttachments.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-black text-[#123f59] text-sm flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#c5983c]" /> الملفات المرفوعة ({ownerAttachments.length})
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ownerAttachments.map((att) => (
              <div key={att.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                
                {/* زر الحذف */}
                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="absolute top-3 left-3 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  title="حذف المرفق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-start gap-4 mb-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                    {getFileIcon(att.type)}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h5 className="font-bold text-[#123f59] text-sm truncate mb-1" title={att.name}>{att.name}</h5>
                    <div className="flex gap-2 items-center text-[10px] text-slate-500 font-mono">
                      <span className="bg-slate-100 px-2 py-0.5 rounded">{att.size} MB</span>
                      <button 
                        onClick={() => openFilePreview(att.fileData, att.type)}
                        className="text-[#0e7490] hover:underline flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> استعراض
                      </button>
                    </div>
                  </div>
                </div>

                {/* حقل الوصف المخصص */}
                <div className="mb-4 relative">
                  <MessageSquareText className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={att.description}
                    onChange={(e) => updateDescription(att.id, e.target.value)}
                    placeholder="أضف وصفاً لهذا المرفق (مثال: كروكي الأرض، طلب العميل...)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-3 pr-9 text-xs font-bold text-slate-700 outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490]/20 transition-all"
                  />
                </div>

                {/* بيانات التدقيق (Audit Trail) */}
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-[9px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" /> بواسطة: <span className="text-slate-600">{att.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" /> {new Date(att.uploadedAt).toLocaleString('ar-SA')}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Step6Attachments;