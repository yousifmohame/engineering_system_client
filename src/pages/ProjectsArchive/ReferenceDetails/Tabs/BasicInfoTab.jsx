import React from "react";
import { Building2 } from "lucide-react";
import LinkStatusBadge from "../LinkStatusBadge"; // تأكد من المسار

export default function BasicInfoTab({ data, handleChange, clients, linkingStates, handleAutoLink, inputClass, labelClass }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h4 className="text-sm font-black text-indigo-800 border-b border-indigo-100 pb-3 mb-5 flex items-center gap-2">
        <Building2 className="w-4 h-4" /> بيانات المشروع والمالك
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelClass}>اسم المشروع <span className="text-rose-500">*</span></label>
          <input name="title" value={data.title || ""} onChange={handleChange} className={`${inputClass} mt-1.5`} type="text" />
        </div>
        <div>
          <label className={labelClass}>الرقم الموحد</label>
          <input readOnly value={data.archiveCode || ""} className={`${inputClass} bg-slate-100 text-slate-500 mt-1.5`} type="text" />
        </div>
        <div>
          <label className={labelClass}>نوع المشروع</label>
          <input name="projectType" value={data.projectType || ""} onChange={handleChange} className={`${inputClass} mt-1.5`} type="text" />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>نوع المعاملة</label>
          <input name="transactionType" value={data.transactionType || ""} onChange={handleChange} className={`${inputClass} mt-1.5`} type="text" />
        </div>
        
        {/* Owner Data */}
        <div className="md:col-span-2 mt-4 border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className={labelClass}>اسم المالك (ربط بسجل العملاء)</label>
            <LinkStatusBadge isLinked={!!data.clientId} extractedText={data.ownerName} isLinking={linkingStates.client} onLinkClick={() => handleAutoLink("client", data.ownerName)} />
          </div>
          <select name="clientId" value={data.clientId || ""} onChange={handleChange} className={inputClass}>
            <option value="">-- اختر المالك --</option>
            {clients.map((client, idx) => (
              <option key={`${client.id}-${idx}`} value={client.id}>
                {typeof client.name === "object" ? client.name?.ar : client.name} {client.idNumber ? `(${client.idNumber})` : ""}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>نوع المالك</label>
          <select name="ownerType" value={data.ownerType || ""} onChange={handleChange} className={`${inputClass} mt-1.5`}>
            <option value="">اختر...</option>
            <option value="اعتباري (شركة)">اعتباري (شركة)</option>
            <option value="طبيعي (أفراد)">طبيعي (أفراد)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>رقم الجوال</label>
          <input name="contactMobile" value={data.contactMobile || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono`} dir="ltr" />
        </div>
      </div>
    </div>
  );
}