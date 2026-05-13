import React, { useState } from "react";
import { X } from "lucide-react";
import UploadAnalysisStep from "./UploadAnalysisStep";
import ProjectDetailsStep from "./ProjectDetailsStep";

export default function AddReferenceProjectModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [projectId, setProjectId] = useState(null);

  if (!isOpen) return null;

  // دالة تنتقل للخطوة الثانية وتمرر آي دي المشروع
  const handleAnalysisStarted = (id) => {
    setProjectId(id);
    setStep(2); // الانتقال لشاشة التفاصيل
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-slate-50 font-sans animate-in fade-in zoom-in-95"
      dir="rtl"
    >
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
              إضافة مشروع مرجعي جديد
            </h1>
            <p className="text-[11px] font-bold text-slate-500">
              {step === 1
                ? "ارفع الملفات ليقوم الذكاء الاصطناعي بتحليلها."
                : "راجع البيانات المستخرجة وقم بتأكيدها."}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      {step === 1 ? (
        <UploadAnalysisStep
          onAnalysisStarted={handleAnalysisStarted}
          onClose={onClose}
        />
      ) : (
        <ProjectDetailsStep projectId={projectId} onClose={onClose} />
      )}
    </div>
  );
}
