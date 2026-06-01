import React from "react";
import { StickyNote } from "lucide-react";

export const NotesTab = ({ localData, handleBasicFieldChange }) => {
  return (
    <div className="animate-in fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#d8e6ee]">
        <span className="text-sm font-black text-[#123B5D] flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-[#0f6d7c]" /> ملاحظات الملف
          الداخلية
        </span>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
        <label className="block text-xs font-bold text-yellow-800 mb-3">
          أضف أي ملاحظات عامة متعلقة بهذه الملكية (ستظهر لجميع الموظفين):
        </label>
        <textarea
          value={localData.notes || ""}
          onChange={(e) => handleBasicFieldChange("notes", e.target.value)}
          className="w-full bg-white border border-yellow-300 rounded-xl p-4 text-sm text-[#123B5D] outline-none focus:ring-2 focus:ring-yellow-400 min-h-[250px]"
          placeholder="لا توجد ملاحظات. ابدأ بالكتابة هنا..."
        />
      </div>
    </div>
  );
};