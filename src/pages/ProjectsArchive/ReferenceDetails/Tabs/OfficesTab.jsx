import React from "react";
import { Briefcase, ShieldAlert } from "lucide-react";
import LinkStatusBadge from "../LinkStatusBadge";

export default function OfficesTab({ data, handleChange, offices, linkingStates, handleAutoLink, inputClass, labelClass }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h4 className="text-sm font-black text-purple-800 border-b border-purple-100 pb-3 mb-5 flex items-center gap-2">
        <Briefcase className="w-4 h-4" /> المكاتب المهنية والملاحظات
      </h4>
      <div className="grid grid-cols-1 gap-6">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className={labelClass}>المكتب المصمم</label>
            <LinkStatusBadge isLinked={!!data.designerOfficeId} extractedText={data.designerOfficeName} isLinking={linkingStates.designer} onLinkClick={() => handleAutoLink("designer", data.designerOfficeName)} />
          </div>
          <select name="designerOfficeId" value={data.designerOfficeId || ""} onChange={handleChange} className={inputClass}>
            <option value="">-- اختر المكتب --</option>
            {offices.map((off, idx) => (
              <option key={`${off.id}-${idx}`} value={off.id}>
                {off.nameAr || (typeof off.name === "object" ? off.name?.ar : off.name) || "مكتب بدون اسم"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className={labelClass}>المكتب المشرف</label>
            <LinkStatusBadge isLinked={!!data.supervisorOfficeId} extractedText={data.supervisorOfficeName} isLinking={linkingStates.supervisor} onLinkClick={() => handleAutoLink("supervisor", data.supervisorOfficeName)} />
          </div>
          <select name="supervisorOfficeId" value={data.supervisorOfficeId || ""} onChange={handleChange} className={inputClass}>
            <option value="">-- اختر المكتب --</option>
            {offices.map((off, idx) => (
              <option key={`${off.id}-${idx}`} value={off.id}>
                {off.nameAr || (typeof off.name === "object" ? off.name?.ar : off.name) || "مكتب بدون اسم"}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-2 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
          <label className={`${labelClass} mb-2 flex items-center gap-2 text-amber-800`}>
            <ShieldAlert className="w-4 h-4" /> ملاحظات التحليل الآلي
          </label>
          <textarea
            name="archiveNotes"
            value={data.archiveNotes || ""}
            onChange={handleChange}
            rows="6"
            className={`${inputClass} resize-none leading-relaxed bg-white border-amber-200`}
            placeholder="ملاحظات النظام..."
          ></textarea>
        </div>
      </div>
    </div>
  );
}