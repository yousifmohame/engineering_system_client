import React from "react";
import { useReport } from "../../context/ReportContext";
import { Image as ImageIcon } from "lucide-react";

export default function SettingsStep() {
  const { data, updateNestedData } = useReport();
  return (
    <div className="space-y-4 animate-in fade-in">
      <h3 className="text-sm font-black text-slate-800 border-b pb-2">إعدادات الإظهار (Preview)</h3>
      <div className="space-y-3 pt-2">
        <label className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
          <input className="w-4 h-4 rounded text-emerald-600" type="checkbox" checked={data.settings.showHeaderCover} onChange={e=>updateNestedData('settings', 'showHeaderCover', e.target.checked)} /><span className="text-xs font-bold text-slate-700">إظهار شعار وبيانات المكتب (الغلاف)</span>
        </label>
        <label className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
          <input className="w-4 h-4 rounded text-emerald-600" type="checkbox" checked={data.settings.showQR} onChange={e=>updateNestedData('settings', 'showQR', e.target.checked)} /><span className="text-xs font-bold text-slate-700">إظهار الوثيقة الموثقة (QR)</span>
        </label>
        <label className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition">
          <input className="w-4 h-4 rounded text-emerald-600" type="checkbox" checked={data.settings.showFooterInner} onChange={e=>updateNestedData('settings', 'showFooterInner', e.target.checked)} /><span className="text-xs font-bold text-slate-700">إظهار التذييل (Footer)</span>
        </label>
      </div>
    </div>
  );
}