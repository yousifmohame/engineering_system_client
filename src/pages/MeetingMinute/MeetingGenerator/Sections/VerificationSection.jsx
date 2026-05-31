import React from "react";
import { QrCode } from "lucide-react";

export default function VerificationSection({ minute, updateField }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-4 border-b border-[#e8ddc8] pb-3">
          <QrCode className="w-5 h-5 text-[#334155]" />
          <h3 className="text-sm font-black text-[#123f59]">إعدادات التحقق (QR Code)</h3>
        </div>
        <div className="flex items-center justify-between">
           <div>
             <h4 className="text-xs font-black text-[#123f59]">تضمين رمز التحقق السريع</h4>
             <p className="text-[10px] font-bold text-[#64748b] mt-1">يسمح بمسح الكود للوصول إلى تفاصيل المحضر للتحقق من صحته</p>
           </div>
           <label className="relative inline-flex items-center cursor-pointer">
             <input type="checkbox" className="sr-only peer" checked={minute.verification?.qrSettings?.enabled || false} onChange={e => updateField("verification", { ...minute.verification, qrSettings: { ...minute.verification?.qrSettings, enabled: e.target.checked }})} />
             <div className="w-11 h-6 bg-[#e8ddc8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#d8b46a]/45 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
           </label>
        </div>
      </div>
    </div>
  );
}