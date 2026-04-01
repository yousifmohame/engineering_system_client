import React from "react";
import {
  Lock,
  Users,
  Eye,
  Pen,
  Copy,
  Download,
  Calendar,
  Trash2,
} from "lucide-react";

export default function FormCard({ form, onPreview, onEdit, onDelete }) {
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
    <div className="bg-white border border-slate-300 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-blue-300 flex flex-col group">
      {/* Card Header */}
      <div className="p-3 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base leading-none">
              {getCategoryIcon(form.category)}
            </span>
            <div className="text-[11px] font-bold text-slate-900 truncate">
              {form.name}
            </div>
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            {form.code} • v{form.version}
          </div>
        </div>
        <div
          className={`px-1.5 py-0.5 rounded flex items-center justify-center text-[9px] font-bold ${form.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}
        >
          {form.isActive ? "نشط" : "مؤرشف"}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[10px] text-slate-500 mb-3 h-8 line-clamp-2 leading-relaxed">
          {form.description || "لا يوجد وصف لهذا النموذج."}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="p-1.5 bg-slate-50 rounded text-center border border-slate-100">
            <div className="text-xs font-bold text-blue-800">
              {form._count?.usages || 0}
            </div>
            <div className="text-[8px] text-slate-500 mt-0.5">استخدام</div>
          </div>
          <div className="p-1.5 bg-slate-50 rounded text-center border border-slate-100">
            <div className="text-xs font-bold text-slate-900">
              {form.pageSettings?.size || "A4"}
            </div>
            <div className="text-[8px] text-slate-500 mt-0.5">الحجم</div>
          </div>
          <div className="p-1.5 bg-slate-50 rounded text-center border border-slate-100">
            <div className="text-[10px] font-bold text-slate-900 leading-[14px]">
              {form.colorMode === "color" ? "🎨" : "⚫"}
            </div>
            <div className="text-[8px] text-slate-500 mt-0.5">
              {form.colorMode === "color" ? "ألوان" : "أبيض وأسود"}
            </div>
          </div>
        </div>

        {/* Permissions Badge */}
        <div
          className={`flex items-center gap-1 mb-3 px-1.5 py-1 rounded text-[9px] font-bold w-fit ${!form.isPublic ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}
        >
          {!form.isPublic ? <Lock size={10} /> : <Users size={10} />}
          <span>{!form.isPublic ? "صلاحيات مخصصة" : "متاح للجميع"}</span>
        </div>

        {/* Actions Row */}
        <div className="flex items-center gap-1 mt-auto">
          <button
            onClick={onPreview}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-800 rounded hover:bg-blue-100 transition-colors text-[10px] font-bold"
          >
            <Eye size={12} /> <span>معاينة النموذج</span>
          </button>
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[10px] font-bold"
          >
            <Pen size={12} /> <span>تعديل القالب</span>
          </button>
          {/* 💡 التعديل: إضافة زر الحذف هنا */}
          <button
            onClick={onDelete}
            className="p-1.5 bg-red-50 text-red-500 rounded-md hover:bg-red-100 transition-colors"
            title="حذف النموذج"
          >
            <Trash2 size={16} />
          </button>
          <button
            title="نسخ النموذج"
            className="p-1.5 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition-colors flex shrink-0"
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1 text-[9px] text-slate-500">
        <Calendar size={10} />
        <span>آخر تحديث: {formatDate(form.updatedAt)}</span>
      </div>
    </div>
  );
}
