import React from "react";
import { Upload, Trash2, FileText } from "lucide-react";

export default function AttachmentsSection({ minute, updateField }) {
  
  // دالة وهمية لمحاكاة رفع الملفات (يمكنك ربطها بالباك إند لاحقاً)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newAttachments = files.map(f => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: f.name,
      date: new Date().toLocaleDateString('ar-SA'),
      uploadedBy: "المستخدم الحالي"
    }));

    updateField("attachments", [...(minute.attachments || []), ...newAttachments]);
  };

  const removeAttachment = (id) => {
    updateField("attachments", (minute.attachments || []).filter(a => a.id !== id));
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <label className="border-2 border-dashed border-[#d8b46a]/55 rounded-[20px] p-5 sm:p-5 flex flex-col items-center justify-center bg-[#fbf8f1] hover:bg-white transition-colors cursor-pointer group">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
          <Upload className="w-6 h-6 text-[#8da0bb]" />
        </div>
        <p className="text-sm font-black text-[#334155]">اضغط لرفع المرفقات أو صور السبورة</p>
        <p className="text-[10px] text-[#8da0bb] font-bold mt-1">يدعم PDF, JPG, PNG حتى 10MB</p>
        <input type="file" multiple className="hidden" onChange={handleFileUpload} />
      </label>

      <div className="space-y-2">
        {minute.attachments?.map((att) => (
          <div key={att.id} className="flex items-center justify-between p-3 bg-white border border-[#e8ddc8] rounded-xl shadow-sm hover:border-[#d8b46a]/45 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#eef7f6] flex items-center justify-center text-[#0e7490]">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-[#123f59]">{att.name}</p>
                <p className="text-[10px] font-bold text-[#64748b]">تم الرفع بواسطة {att.uploadedBy} • {att.date}</p>
              </div>
            </div>
            <button type="button" onClick={() => removeAttachment(att.id)} className="inline-flex h-7 items-center gap-1 rounded-xl bg-rose-50 px-2 text-[9px] font-black text-rose-600 transition hover:bg-rose-500 hover:text-white">
              <Trash2 className="w-3 h-3" /> حذف
            </button>
          </div>
        ))}

        {(!minute.attachments || minute.attachments.length === 0) && (
          <div className="text-center bg-[#fbf8f1] rounded-xl border border-dashed border-[#e8ddc8] py-5">
            <p className="text-xs text-[#8da0bb] font-bold">لم يتم إضافة أي مرفقات.</p>
          </div>
        )}
      </div>
    </div>
  );
}