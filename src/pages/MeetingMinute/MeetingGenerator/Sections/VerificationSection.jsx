import React from "react";
import { QrCode } from "lucide-react";

export default function VerificationSection({ minute, updateField }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-slate-200 pb-3">
          <QrCode className="w-5 h-5 text-slate-700" />
          <h3 className="text-sm font-black text-slate-800">إعدادات التحقق (QR Code)</h3>
        </div>
        <div className="flex items-center justify-between">
           <div>
             <h4 className="text-xs font-black text-slate-800">تضمين رمز التحقق السريع</h4>
             <p className="text-[10px] font-bold text-slate-500 mt-1">يسمح بمسح الكود للوصول إلى تفاصيل المحضر للتحقق من صحته</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input type="checkbox" className="sr-only peer" checked={minute.verification?.qrSettings?.enabled || false} onChange={e => updateField("verification", { ...minute.verification, qrSettings: { ...minute.verification?.qrSettings, enabled: e.target.checked }})} />
             <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
           </label>
        </div>
      </div>
    </div>
  );
}