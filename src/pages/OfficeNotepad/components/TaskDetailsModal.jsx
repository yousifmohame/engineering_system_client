import React from "react";
import {
  X,
  Calendar,
  User,
  Flag,
  FolderOpen,
  AlignLeft,
  FileText,
  Download,
  Hash,
  Link as LinkIcon,
  Building2,
  MapPin,
  Clock,
} from "lucide-react";

export default function TaskDetailsModal({ task, onClose }) {
  if (!task) return null;

  const getPriorityLabel = (priority) => {
    if (priority === "high")
      return (
        <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-[11px] font-black flex items-center gap-1 border border-rose-100">
          <Flag size={12} /> أولوية عالية
        </span>
      );
    if (priority === "medium")
      return (
        <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-[11px] font-black flex items-center gap-1 border border-amber-100">
          <Flag size={12} /> أولوية متوسطة
        </span>
      );
    return (
      <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-[11px] font-black flex items-center gap-1 border border-slate-200">
        <Flag size={12} /> أولوية منخفضة
      </span>
    );
  };

  const getStatusLabel = (status) => {
    const classes = {
      completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
      frozen: "bg-blue-50 text-blue-600 border-blue-200",
      cancelled: "bg-slate-100 text-slate-500 border-slate-200",
      active: "bg-amber-50 text-amber-600 border-amber-200",
    };
    const names = {
      completed: "مكتملة ✅",
      frozen: "مجمدة ❄️",
      cancelled: "ملغاة ❌",
      active: "نشطة ⏳",
    };
    return (
      <span
        className={`px-3 py-1 rounded-lg text-xs font-black border ${classes[status] || classes.active}`}
      >
        {names[status] || "نشطة"}
      </span>
    );
  };

  // دالة لحساب الوقت المتبقي
  const getRemainingDaysText = () => {
    if (task.status === "completed") return "تم إنجاز المهمة بنجاح";
    if (task.status === "cancelled") return "تم إلغاء المهمة";
    if (!task.dueDate) return "لا يوجد موعد محدد";

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "ينتهي موعدها اليوم";
    if (diffDays < 0) return `متأخرة عن موعدها بـ ${Math.abs(diffDays)} يوم`;
    return `متبقي ${diffDays} يوم`;
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* --- 1. Header --- */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="text-blue-600" size={24} /> تفاصيل المهمة
              </h3>
              {getStatusLabel(task.status)}
              {getPriorityLabel(task.priority)}
            </div>
            {task.serialNumber && (
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded w-max flex items-center gap-1 border border-slate-200">
                <Hash size={10} /> رقم السجل: {task.serialNumber}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors self-start"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- 2. Body --- */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar-slim">
          {/* الوصف الأساسي */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <AlignLeft size={16} /> <span>وصف المهمة المطلوب تنفيذها:</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-100 text-slate-800 font-black text-[13px] leading-relaxed whitespace-pre-wrap shadow-sm">
              {task.description}
            </div>
          </div>

          {/* الموظفين المعينين */}
          {task.assignedEmployees?.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <div className="text-slate-500 font-bold text-xs flex items-center gap-2">
                <User size={14} /> الموظفين المسؤولين عن التنفيذ:
              </div>
              <div className="flex flex-wrap gap-2">
                {task.assignedEmployees.map((emp, i) => (
                  <span
                    key={i}
                    className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm"
                  >
                    {emp.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 🚀 قسم الروابط الاختيارية (Linking Data) */}
          {(task.client || task.transaction || task.ownership) && (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="text-slate-700 font-black text-xs flex items-center gap-2 mb-2">
                <LinkIcon size={14} className="text-slate-400" /> الارتباط
                بسجلات النظام
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {task.client && (
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-2">
                    <User size={14} className="text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold">
                        العميل المرتبط
                      </p>
                      <p
                        className="text-xs font-black text-slate-800 truncate"
                        title={task.client.name?.ar || task.client.name}
                      >
                        {task.client.name?.ar || task.client.name}
                      </p>
                    </div>
                  </div>
                )}
                {task.transaction && (
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-2">
                    <Building2
                      size={14}
                      className="text-indigo-500 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold">
                        المعاملة المرتبطة
                      </p>
                      <p
                        className="text-xs font-black text-slate-800 truncate"
                        title={task.transaction.title}
                      >
                        {task.transaction.transactionCode}
                      </p>
                      <p className="text-[9px] text-slate-500 font-bold truncate">
                        {task.transaction.title}
                      </p>
                    </div>
                  </div>
                )}
                {task.ownership && (
                  <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-start gap-2">
                    <MapPin
                      size={14}
                      className="text-emerald-500 mt-0.5 shrink-0"
                    />
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold">
                        ملف الصك/الملكية
                      </p>
                      <p className="text-xs font-black text-slate-800 truncate">
                        رقم {task.ownership.deedNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ملاحظات إضافية */}
          {task.additionalNotes && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                <FileText size={16} /> <span>ملاحظات إضافية:</span>
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-amber-900 font-bold text-sm leading-relaxed whitespace-pre-wrap">
                {task.additionalNotes}
              </div>
            </div>
          )}

          {/* شبكة البيانات (تاريخ، منشئ، مرفق) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            {/* المنشئ والتاريخ */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
                <User size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold">
                  بواسطة (منشئ المهمة)
                </p>
                <p className="text-sm font-black text-slate-800">
                  {task.creatorName}
                </p>
                <p className="text-[9px] font-mono font-bold text-slate-400 mt-0.5">
                  {new Date(task.createdAt).toLocaleString("ar-SA")}
                </p>
              </div>
            </div>

            {/* تاريخ الاستحقاق */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-500">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold">
                  تاريخ الإستحقاق النهائي
                </p>
                <p className="text-sm font-black text-slate-800" dir="ltr">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString("en-GB")
                    : "غير محدد"}
                </p>
                <p
                  className={`text-[9px] font-black mt-0.5 flex items-center gap-1 ${task.status === "completed" ? "text-emerald-500" : task.dueDate && new Date(task.dueDate) < new Date() ? "text-rose-500" : "text-blue-500"}`}
                >
                  <Clock size={10} /> {getRemainingDaysText()}
                </p>
              </div>
            </div>

            {/* المرفقات / مسار الملفات */}
            {task.filePath && (
              <div className="flex flex-col gap-2 md:col-span-2 mt-2 pt-4 border-t border-slate-200">
                <p className="text-[10px] text-slate-500 font-bold">
                  الملفات والمستندات المرفقة
                </p>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600 shrink-0">
                      <FolderOpen size={16} />
                    </div>
                    <div className="truncate" dir="ltr" title={task.filePath}>
                      <p className="text-xs font-black text-slate-700 truncate">
                        {task.filePath.split("/").pop()}
                      </p>
                      <p className="text-[9px] font-mono text-slate-400 truncate">
                        {task.filePath}
                      </p>
                    </div>
                  </div>
                  {/* زر تحميل إذا كان المسار مسار ويب */}
                  <a
                    href={
                      task.filePath.startsWith("/")
                        ? `${import.meta.env.VITE_API_URL}${task.filePath}`
                        : task.filePath
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition-colors shrink-0 shadow-sm"
                  >
                    <Download size={14} /> تحميل / فتح
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- 3. Footer --- */}
        <div className="p-5 border-t border-slate-100 bg-white shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2 bg-slate-800 text-white text-xs font-black rounded-xl hover:bg-slate-900 transition-colors shadow-md"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
