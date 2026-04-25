import React from "react";
import { TriangleAlert, Eye, Paperclip } from "lucide-react";

// ==========================================
// الخطوة 6: المرفقات
// ==========================================
export const Step6Attachments = ({ props }) => {
  const { missingDocs, setMissingDocs, showMissingDocs, setShowMissingDocs } =
    props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      
      <div className="p-4 bg-white rounded-xl border-y border-l border-r-[3px] border-slate-200 border-r-red-600 mb-4 shadow-sm relative overflow-hidden">
        <div className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
          <TriangleAlert className="w-4 h-4" /> نواقص مستندات (Free text)
        </div>
        <textarea
          value={missingDocs}
          onChange={(e) => setMissingDocs(e.target.value)}
          placeholder="اكتب هنا أي ملاحظات حول نواقص المستندات..."
          rows={4}
          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-y leading-relaxed"
        />
        <label className="flex items-center gap-1.5 text-[11px] cursor-pointer mt-3 font-medium text-slate-700 hover:text-red-600 transition-colors w-fit">
          <input
            type="checkbox"
            checked={showMissingDocs}
            onChange={(e) => setShowMissingDocs(e.target.checked)}
            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
          />
          <Eye className="w-3.5 h-3.5 text-red-500" /> إظهار نواقص المستندات في
          عرض السعر المطبوع
        </label>
      </div>
    </div>
  );
};
