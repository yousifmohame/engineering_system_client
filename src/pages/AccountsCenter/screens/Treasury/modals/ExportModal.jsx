import React from "react";
import { X, Download, Printer } from "lucide-react";
import { toast } from "sonner";

const ExportModal = ({ onClose, activeVault }) => {
  const handleExport = (type) => {
    toast.success(`جاري تصدير كشف ${activeVault.vaultName} بصيغة ${type}...`);
    setTimeout(() => onClose(), 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-sm text-slate-800">تصدير تقرير الخزنة</h3>
          <X className="w-4 h-4 cursor-pointer text-gray-500" onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs text-gray-600">اختر صيغة الملف المطلوبة لاستخراج كشوفات "{activeVault?.vaultName}":</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => handleExport("PDF")} className="flex items-center justify-center gap-2 bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg hover:bg-red-100 font-bold text-xs">
              <Download className="w-4 h-4" /> تصدير PDF معتمد
            </button>
            <button onClick={() => handleExport("Excel")} className="flex items-center justify-center gap-2 bg-green-50 text-green-700 border border-green-200 p-3 rounded-lg hover:bg-green-100 font-bold text-xs">
              <Download className="w-4 h-4" /> تصدير Excel (للتحليل)
            </button>
            <button onClick={() => { window.print(); onClose(); }} className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 border border-gray-300 p-3 rounded-lg hover:bg-gray-200 font-bold text-xs">
              <Printer className="w-4 h-4" /> طباعة مباشرة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;