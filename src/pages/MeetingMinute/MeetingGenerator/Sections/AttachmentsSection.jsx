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
      <label className="border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
        <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-105 transition-transform">
          <Upload className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-sm font-black text-slate-700">اضغط لرفع المرفقات أو صور السبورة</p>
        <p className="text-[10px] text-slate-400 font-bold mt-1">يدعم PDF, JPG, PNG حتى 10MB</p>
        <input type="file" multiple className="hidden" onChange={handleFileUpload} />
      </label>

      <div className="space-y-2">
        {minute.attachments?.map((att) => (
          <div key={att.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">{att.name}</p>
                <p className="text-[10px] font-bold text-slate-500">تم الرفع بواسطة {att.uploadedBy} • {att.date}</p>
              </div>
            </div>
            <button onClick={() => removeAttachment(att.id)} className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-rose-50 rounded-lg transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {(!minute.attachments || minute.attachments.length === 0) && (
          <div className="text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 py-6">
            <p className="text-xs text-slate-400 font-bold">لم يتم إضافة أي مرفقات.</p>
          </div>
        )}
      </div>
    </div>
  );
}