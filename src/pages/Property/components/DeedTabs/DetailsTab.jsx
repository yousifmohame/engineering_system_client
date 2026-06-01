import React from "react";
import { Building, SquarePen, X } from "lucide-react";

export const DetailsTab = ({
  deed,
  localData,
  isEditing,
  setIsEditing,
  handleBasicFieldChange,
  safeFormatDate,
  totalArea,
  propertyType,
}) => {
  return (
    <div className="animate-in fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#d8e6ee]">
        <span className="text-sm font-black text-[#123B5D] flex items-center gap-2">
          <Building className="w-5 h-5 text-[#0f6d7c]" /> تفاصيل الملكية الكاملة
        </span>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl transition-colors ${isEditing ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-[#0f6d7c] hover:bg-blue-100"}`}
        >
          {isEditing ? (
            <X className="w-4 h-4" />
          ) : (
            <SquarePen className="w-4 h-4" />
          )}
          {isEditing ? "إلغاء التعديل" : "تعديل البيانات الأساسية"}
        </button>
      </div>

      <div
        className={`grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 p-6 rounded-xl border ${isEditing ? "bg-blue-50/30 border-blue-200" : "bg-[#f7fbfd] border-[#d8e6ee]"}`}
      >
        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            كود الملكية (تلقائي)
          </label>
          <input
            readOnly
            value={deed.code || ""}
            className="w-full h-[38px] px-3 border border-slate-300 rounded-xl bg-[#f7fbfd] text-xs font-mono text-[#71839a] font-bold outline-none cursor-not-allowed"
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            رقم الصك
          </label>
          <input
            readOnly={!isEditing}
            value={localData.deedNumber}
            onChange={(e) =>
              handleBasicFieldChange("deedNumber", e.target.value)
            }
            className={`w-full h-[38px] px-3 border rounded-xl text-xs font-mono outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            تاريخ الصك
          </label>
          <input
            type="date"
            readOnly={!isEditing}
            value={localData.deedDate}
            onChange={(e) => handleBasicFieldChange("deedDate", e.target.value)}
            className={`w-full h-[38px] px-3 border rounded-xl text-xs font-mono outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            المدينة *
          </label>
          <input
            readOnly={!isEditing}
            value={localData.city}
            onChange={(e) => handleBasicFieldChange("city", e.target.value)}
            className={`w-full h-[38px] px-3 border rounded-xl text-xs font-bold outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            الحي *
          </label>
          <input
            readOnly={!isEditing}
            value={localData.district}
            onChange={(e) => handleBasicFieldChange("district", e.target.value)}
            className={`w-full h-[38px] px-3 border rounded-xl text-xs font-bold outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            رقم المخطط
          </label>
          <input
            readOnly={!isEditing}
            value={localData.planNumber}
            onChange={(e) =>
              handleBasicFieldChange("planNumber", e.target.value)
            }
            className={`w-full h-[38px] px-3 border rounded-xl text-xs font-mono font-bold outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
          />
        </div>

        <div>
          <label className="text-[11px] font-bold text-[#71839a] mb-1.5 block">
            المساحة الإجمالية (م²)
          </label>
          <input
            type="number"
            readOnly={!isEditing}
            value={localData.area}
            onChange={(e) => handleBasicFieldChange("area", e.target.value)}
            className={`w-full h-[38px] px-3 border rounded-xl text-xs font-bold text-emerald-700 outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-emerald-300 bg-emerald-50"}`}
          />
        </div>
      </div>

      <div className="mt-4 rounded-xl p-4 text-[10px] text-[#71839a] grid grid-cols-4 gap-4 bg-[#f7fbfd] border border-[#d8e6ee]">
        <div>
          <strong className="block text-[#71839a] mb-1">أُنشئ:</strong>{" "}
          {safeFormatDate(deed.createdAt)}
        </div>
        <div>
          <strong className="block text-[#71839a] mb-1">آخر تعديل:</strong>{" "}
          {safeFormatDate(deed.updatedAt)}
        </div>
        <div>
          <strong className="block text-[#71839a] mb-1">معرّف النظام:</strong>{" "}
          <span className="font-mono">{deed.id?.slice(-8)}</span>
        </div>
        <div>
          <strong className="block text-[#71839a] mb-1">الإصدار:</strong> v1.0
        </div>
      </div>
    </div>
  );
};