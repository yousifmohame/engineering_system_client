import React from "react";
import { FileText, Save, ShieldCheck, X, Loader2 } from "lucide-react";
import { useReport } from "../../context/ReportContext";

export default function BuilderHeader({ onClose }) {
  // سحب دوال الحفظ والحالة من الـ Context
  const { reportSerial, saveReport, isSaving } = useReport();

  // 🚨 دالة جديدة للتعامل مع الحفظ والإغلاق معاً
  const handleSaveAndClose = async (status) => {
    const isSuccess = await saveReport(status);
    
    // إذا نجح الحفظ، قم بإغلاق المودل
    if (isSuccess) {
      onClose();
    }
  };

  return (
    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
      <div>
        <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" /> 
          التقرير الفني 
          <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600 mr-2">
            {reportSerial}
          </span>
        </h2>
      </div>
      <div className="flex gap-2">
        <button 
          onClick={() => handleSaveAndClose("DRAFT")} // 👈 استخدام الدالة الجديدة هنا
          disabled={isSaving}
          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          حفظ مسودة
        </button>
        
        <button 
          onClick={() => handleSaveAndClose("COMPLETED")} // 👈 واستخدامها هنا أيضاً
          disabled={isSaving}
          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" /> اعتماد نهائي
        </button>
        
        <button 
          onClick={onClose} 
          disabled={isSaving} // يُفضل تعطيل زر الإغلاق أثناء الحفظ
          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}