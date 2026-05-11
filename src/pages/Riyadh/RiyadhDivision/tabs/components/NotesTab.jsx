import React from "react";
import { FileText, Info } from "lucide-react";

export default function NotesTab({ planModal, setPlanModal }) {
  return (
    <div className="space-y-6 animate-in fade-in h-full flex flex-col overflow-hidden p-6">
      <div className="flex items-center gap-2 border-b border-slate-200 pb-4">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h4 className="text-base font-black text-slate-800">الملاحظات العامة والقيود الفنية</h4>
      </div>
      <div className="flex-1 relative group">
        <textarea
          placeholder="اكتب هنا أية ملاحظات تنظيمية، قيود فنية، أو تنبيهات إدارية تخص هذا المخطط..."
          value={planModal.data.notes || ""}
          onChange={(e) => setPlanModal((p) => ({ ...p, data: { ...p.data, notes: e.target.value } }))}
          className="w-full h-full min-h-[400px] p-6 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 focus:bg-white text-sm font-bold text-slate-700 leading-loose resize-none transition-all duration-300 shadow-inner"
        />
        <div className="absolute bottom-6 left-6 pointer-events-none opacity-10">
          <FileText size={60} className="text-slate-500" />
        </div>
      </div>
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 flex items-start gap-3 shadow-sm">
        <Info size={20} className="text-amber-500 shrink-0" />
        <p className="text-xs font-black text-amber-800 leading-relaxed">
          تنبيه: هذه الملاحظات تظهر لجميع الإدارات المرتبطة بهذا المخطط، يرجى تحري الدقة عند تدوين القيود الفنية.
        </p>
      </div>
    </div>
  );
}