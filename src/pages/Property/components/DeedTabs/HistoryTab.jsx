import React from "react";
import { History, Building, SquarePen } from "lucide-react";

export const HistoryTab = ({ deed, safeFormatDate }) => {
  return (
    <div className="animate-in fade-in max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-6 pb-2 border-b border-[#d8e6ee]">
        <span className="text-sm font-black text-[#123B5D] flex items-center gap-2">
          <History className="w-5 h-5 text-[#52677e]" /> سجل نشاطات الملف
        </span>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <Building className="w-4 h-4" />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-[#d8e6ee] shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <h4 className="font-bold text-[#123B5D] text-sm">
                إنشاء ملف الملكية
              </h4>
              <span className="text-[10px] font-mono text-[#71839a]">
                {safeFormatDate(deed.createdAt)}
              </span>
            </div>
            <p className="text-xs text-[#71839a]">
              تم إنشاء الملف وإضافة البيانات الأولية بواسطة النظام.
            </p>
          </div>
        </div>

        {deed.updatedAt && deed.updatedAt !== deed.createdAt && (
          <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
              <SquarePen className="w-4 h-4" />
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-[#d8e6ee] shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-[#123B5D] text-sm">
                  آخر تحديث للبيانات
                </h4>
                <span className="text-[10px] font-mono text-[#71839a]">
                  {safeFormatDate(deed.updatedAt)}
                </span>
              </div>
              <p className="text-xs text-[#71839a]">
                تم تعديل البيانات أو تحديث الحالة مؤخراً.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};