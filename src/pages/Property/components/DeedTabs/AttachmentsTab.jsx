import React from "react";
import { Upload, Plus, Paperclip, Trash2, FileText } from "lucide-react";

export const AttachmentsTab = ({
  localData,
  handleAttachmentUpload,
  handleDeleteItem,
}) => {
  return (
    <div className="animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#d8e6ee]">
        <span className="text-sm font-black text-[#123B5D] flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#0f6d7c]" /> المرفقات العامة (
          {localData.attachments?.length || 0})
        </span>
        <label className="bg-[#083646] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#0f6d7c] cursor-pointer shadow-sm">
          <Plus className="w-4 h-4" /> رفع مرفق جديد
          <input
            type="file"
            className="hidden"
            onChange={handleAttachmentUpload}
          />
        </label>
      </div>

      {localData.attachments?.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {localData.attachments.map((att) => (
            <div
              key={att.id}
              className="bg-white border border-[#d8e6ee] rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-purple-50 text-[#0f6d7c] rounded-xl shrink-0">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-[#123B5D] truncate">
                    {att.name}
                  </p>
                  <p className="text-[10px] text-[#71839a] font-mono mt-0.5">
                    {att.size}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteItem("attachments", att.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-[#f7fbfd] border-2 border-dashed border-slate-300 rounded-xl">
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-[#71839a] font-bold">لا توجد مرفقات عامة للملف</p>
        </div>
      )}
    </div>
  );
};