import React from "react";
import {
  Lock,
  Users,
  Eye,
  Copy,
  Download,
  Calendar,
  Trash2,
  PenLine,   // 👈 أيقونة للتعبئة
  Settings   // 👈 أيقونة لتعديل الإعدادات والقالب
} from "lucide-react";

export default function FormCard({ form, onPreview, onEdit, onDelete, onFill }) {
  const getCategoryIcon = (category) => {
    switch (category) {
      case "hr":
        return "👥";
      case "financial":
        return "💰";
      case "operations":
        return "⚙️";
      default:
        return "📄";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white border border-slate-300 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-blue-400 flex flex-col group h-full">
      {/* Card Header */}
      <div className="p-3 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 shrink-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base leading-none">
              {getCategoryIcon(form.category)}
            </span>
            <div className="text-[12px] font-bold text-slate-900 truncate">
              {form.name}
            </div>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {form.code} • v{form.version}
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded border flex items-center justify-center text-[9px] font-bold ${form.isActive ? "bg-green-50 border-green-200 text-green-600" : "bg-slate-100 border-slate-200 text-slate-500"}`}
        >
          {form.isActive ? "نشط" : "مؤرشف"}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[11px] text-slate-500 mb-3 h-8 line-clamp-2 leading-relaxed">
          {form.description || "لا يوجد وصف مخصص لهذا النموذج."}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
          <div className="p-1.5 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-[13px] font-black text-blue-700">
              {form._count?.usages || 0}
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">استخدام</div>
          </div>
          <div className="p-1.5 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-[13px] font-black text-slate-800">
              {form.pageSettings?.size || "A4"}
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">الحجم</div>
          </div>
          <div className="p-1.5 bg-slate-50 rounded-lg text-center border border-slate-200">
            <div className="text-[13px] font-black text-slate-800 leading-[18px]">
              {form.colorMode === "color" ? "🎨" : "⚫"}
            </div>
            <div className="text-[9px] font-bold text-slate-500 mt-0.5">
              {form.colorMode === "color" ? "ألوان" : "أبيض وأسود"}
            </div>
          </div>
        </div>

        {/* Permissions Badge */}
        <div
          className={`flex items-center gap-1.5 mb-4 px-2 py-1 rounded border text-[10px] font-bold w-fit ${!form.isPublic ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700"}`}
        >
          {!form.isPublic ? <Lock size={12} /> : <Users size={12} />}
          <span>{!form.isPublic ? "صلاحيات مخصصة" : "متاح للجميع"}</span>
        </div>

        {/* 💡 أزرار التحكم (Action Buttons) */}
        <div className="flex flex-col gap-1.5 mt-auto">
          {/* الزر الرئيسي: التعبئة */}
          <button
            onClick={onFill} // 👈 تم ربط الخاصية هنا
            className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[11px] font-bold shadow-sm"
          >
            <PenLine size={14} /> <span>تعبئة وإصدار النموذج</span>
          </button>

          {/* الأزرار الفرعية (الإدارية) */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPreview}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[10px] font-bold"
            >
              <Eye size={12} /> <span>معاينة</span>
            </button>
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[10px] font-bold"
            >
              <Settings size={12} /> <span>تعديل</span>
            </button>
            <button
              title="نسخ النموذج"
              className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors flex shrink-0"
            >
              <Copy size={12} />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors flex shrink-0"
              title="حذف النموذج"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 shrink-0">
        <Calendar size={12} />
        <span>آخر تحديث: {formatDate(form.updatedAt)}</span>
      </div>
    </div>
  );
}