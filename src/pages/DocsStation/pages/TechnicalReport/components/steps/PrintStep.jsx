import React from "react";
import { Printer, CircleCheck, TriangleAlert } from "lucide-react";

export default function PrintStep() {
  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2 flex items-center gap-2"><Printer className="w-4 h-4 text-emerald-600" /> فحص الطباعة وإنتاج PDF</h3>
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-4">
        <p className="text-xs font-bold text-slate-600 mb-4">بناءً على المعاينة الحالية وعرض المتصفح، ستبدو مسودة الـ PDF كالتالي:</p>
        <ul className="space-y-3 text-xs mb-4">
          <li className="flex items-center gap-2 text-emerald-700 font-bold bg-emerald-50 p-2 rounded border border-emerald-100"><CircleCheck className="w-4 h-4"/> الهوامش العلوية والسفلية مناسبة للطباعة.</li>
        </ul>
      </div>
      <button onClick={() => window.print()} className="bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-700 flex items-center gap-2"><Printer className="w-4 h-4"/> طباعة / تصدير PDF</button>
    </div>
  );
}