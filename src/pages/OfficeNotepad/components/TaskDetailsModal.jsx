import React from "react";
import { X, Calendar, User, Flag, FolderOpen, AlignLeft, FileText, Download } from "lucide-react";

export default function TaskDetailsModal({ task, onClose }) {
  if (!task) return null;

  const getPriorityLabel = (priority) => {
    if (priority === "high") return <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Flag size={12}/> أولوية عالية</span>;
    if (priority === "medium") return <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Flag size={12}/> أولوية متوسطة</span>;
    return <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded-md text-xs font-bold flex items-center gap-1"><Flag size={12}/> أولوية منخفضة</span>;
  };

  const getStatusLabel = (status) => {
    const classes = {
      completed: "bg-emerald-100 text-emerald-700",
      frozen: "bg-blue-100 text-blue-700",
      cancelled: "bg-slate-100 text-slate-700",
      active: "bg-amber-100 text-amber-700",
    };
    const names = {
      completed: "مكتملة ✅",
      frozen: "مجمدة ❄️",
      cancelled: "ملغاة ❌",
      active: "نشطة ⏳",
    };
    return (
      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${classes[status] || classes.active}`}>
        {names[status] || "نشطة"}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-black text-slate-900">تفاصيل المهمة</h3>
            {getStatusLabel(task.status)}
            {getPriorityLabel(task.priority)}
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar-slim">
          {/* الوصف الأساسي */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
              <AlignLeft size={16} /> <span>الوصف:</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-800 font-bold text-sm leading-relaxed whitespace-pre-wrap">
              {task.description}
            </div>
          </div>

          {/* ملاحظات إضافية إن وجدت */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500"><User size={16}/></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold">بواسطة</p>
                <p className="text-xs font-black text-slate-800">{task.creatorName}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-500"><Calendar size={16}/></div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold">تاريخ الإستحقاق</p>
                <p className="text-xs font-black text-slate-800" dir="ltr">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-GB") : "غير محدد"}
                </p>
              </div>
            </div>

            {/* المرفقات */}
            {task.filePath && (
               <div className="flex items-center gap-3 md:col-span-2 mt-2 pt-4 border-t border-slate-200">
                 <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-600"><FolderOpen size={16}/></div>
                 <div className="flex-1 flex items-center justify-between">
                   <div>
                     <p className="text-[10px] text-slate-500 font-bold">الملف المرفق</p>
                     <p className="text-xs font-black text-emerald-700 truncate max-w-[200px]" dir="ltr">{task.filePath.split("/").pop()}</p>
                   </div>
                   {/* إذا كان السيرفر يدعم مسار الملف مباشرة يمكننا وضع زر تحميل */}
                   <a href={`${import.meta.env.VITE_API_URL}${task.filePath}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-bold transition-colors">
                     <Download size={14} /> تحميل
                   </a>
                 </div>
               </div>
            )}
          </div>

          {/* الموظفين */}
          {task.assignedEmployees?.length > 0 && (
            <div className="space-y-3">
              <div className="text-slate-500 font-bold text-sm">الموظفين المعينين:</div>
              <div className="flex flex-wrap gap-2">
                {task.assignedEmployees.map((emp, i) => (
                  <span key={i} className="bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                    {emp.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}