import React from "react";
import { Upload, Plus, Paperclip, Trash2, FileText } from "lucide-react";

export const AttachmentsTab = ({
  localData,
  handleAttachmentUpload,
  handleDeleteItem,
}) => {
  return (
    <div className="animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" /> المرفقات العامة (
          {localData.attachments?.length || 0})
        </span>
        <label className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-purple-700 cursor-pointer shadow-sm">
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
              className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-purple-300 transition-all group"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                  <Paperclip className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-xs text-slate-700 truncate">
                    {att.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
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
        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
          <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">لا توجد مرفقات عامة للملف</p>
        </div>
      )}
    </div>
  );
};
