import React from "react";
import { TriangleAlert, Eye, Paperclip } from "lucide-react";
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
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

// ==========================================
// الخطوة 6: المرفقات
// ==========================================
export const Step6Attachments = ({ props }) => {
  const { missingDocs, setMissingDocs, showMissingDocs, setShowMissingDocs } =
    props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col text-[#123f59]">
      
      <div className="p-3 bg-white rounded-xl border-y border-l border-r-[3px] border-[#d8b46a]/25 border-r-red-600 mb-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden">
        <div className="text-xs font-bold text-red-800 mb-2 flex min-w-0 items-center gap-1.5">
          <IconWithText icon={TriangleAlert} iconClassName="w-4 h-4" /> نواقص مستندات (Free text)
        </div>
        <textarea
          value={missingDocs}
          onChange={(e) => setMissingDocs(e.target.value)}
          placeholder="اكتب هنا أي ملاحظات حول نواقص المستندات..."
          rows={4}
          className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-y leading-relaxed"
        />
        <label className="flex min-w-0 items-center gap-1.5 text-[11px] cursor-pointer mt-3 font-medium text-[#475569] hover:text-red-600 transition-colors w-fit">
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
