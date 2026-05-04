import React from "react";
import { X } from "lucide-react";
import ProjectDetailsStep from "./ProjectDetailsStep"; // هذا هو المكون الذي يحتوي على تفاصيل المشروع و AI 

export default function ReferenceDetailsModal({ isOpen, onClose, projectId }) {
  if (!isOpen || !projectId) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50/90 backdrop-blur-sm font-sans animate-in fade-in zoom-in-95" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0 shadow-sm flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-800">
              تفاصيل المشروع المرجعي
            </h1>
            <p className="text-[11px] font-bold text-slate-500">
              عرض وتعديل تفاصيل المشروع والبيانات المستخرجة بواسطة الذكاء الاصطناعي.
            </p>
          </div>
        </div>
      </div>

      {/* إدراج المكون الذي يحتوي على الحقول والاتصال بالـ API */}
      <ProjectDetailsStep projectId={projectId} onClose={onClose} />
    </div>
  );
}