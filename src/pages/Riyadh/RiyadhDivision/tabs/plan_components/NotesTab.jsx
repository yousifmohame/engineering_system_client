import React from "react";
import { FileText, Info } from "lucide-react";


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
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


export default function NotesTab({ planModal, setPlanModal }) {
  return (
    <div className="space-y-3 animate-in fade-in h-full flex flex-col overflow-hidden p-3">
      <div className="flex items-center gap-2 border-b border-[#e8ddc8] pb-4">
        <div className="w-1.5 h-6 bg-[#0e7490] rounded-full"></div>
        <h4 className="text-sm font-black text-[#123f59]">الملاحظات العامة والقيود الفنية</h4>
      </div>
      <div className="flex-1 relative group">
        <textarea
          placeholder="اكتب هنا أية ملاحظات تنظيمية، قيود فنية، أو تنبيهات إدارية تخص هذا المخطط..."
          value={planModal.data.notes || ""}
          onChange={(e) => setPlanModal((p) => ({ ...p, data: { ...p.data, notes: e.target.value } }))}
          className="w-full h-full min-h-[240px] p-3 bg-[#fbf8f1] border border-[#e8ddc8] rounded-2xl outline-none focus:ring-4 focus:ring-[#0e7490]/10 focus:border-[#0e7490] focus:bg-white text-sm font-bold text-[#475569] leading-loose resize-none transition-all duration-300 shadow-inner"
        />
        <div className="absolute bottom-6 left-6 pointer-events-none opacity-10">
          <FileText size={60} className="text-[#94a3b8]" />
        </div>
      </div>
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
        <Info size={20} className="text-amber-500 shrink-0" />
        <p className="text-xs font-black text-amber-800 leading-relaxed">
          تنبيه: هذه الملاحظات تظهر لجميع الإدارات المرتبطة بهذا المخطط، يرجى تحري الدقة عند تدوين القيود الفنية.
        </p>
      </div>
    </div>
  );
}