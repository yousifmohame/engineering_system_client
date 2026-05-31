import React from "react";
import { useReport } from "../../context/ReportContext";
import { ArrowRightLeft, Layers, User, House, FilePenLine, Ruler, Maximize, ListChecks, Camera, Settings, Printer, History, CircleCheck, TriangleAlert } from "lucide-react";

const steps = [
  { id: "LINKING", icon: ArrowRightLeft, label: "الربط بالمعاملة", status: "success" },
  { id: "TEMPLATES", icon: Layers, label: "إعدادات وقوالب", status: "success" },
  { id: "OWNER", icon: User, label: "بيانات العميل", status: "success" },
  { id: "PROPERTY", icon: House, label: "الملكية والموقع", status: "warning" },
  { id: "LICENSE", icon: FilePenLine, label: "الرخصة أو الطلب", status: "none" },
  { id: "AREAS", icon: Ruler, label: "المساحات والاستخدام", status: "none" },
  { id: "COMPONENTS", icon: Layers, label: "مكونات المبنى", status: "none" },
  { id: "SETBACKS", icon: Maximize, label: "الارتدادات والحدود", status: "none" },
  { id: "COMPLIANCE", icon: ListChecks, label: "المطابقة والملاحظات", status: "none" },
  { id: "PHOTOS", icon: Camera, label: "الصور والمرفقات", status: "warning" },
  { id: "SETTINGS", icon: Settings, label: "الشكل والإظهار", status: "none" },
  { id: "PRINT", icon: Printer, label: "فحص الطباعة", status: "none" },
  { id: "COMPARE", icon: History, label: "مقارنة النسخ", status: "none" },
  { id: "REVIEW", icon: CircleCheck, label: "مراجعة وجاهزية", status: "none" }
];

export default function BuilderSidebar() {
  const { activeStep, setActiveStep } = useReport();

  return (
    <div className="w-48 bg-slate-50 border-l border-slate-200 flex flex-col overflow-y-auto custom-scrollbar shrink-0">
      {steps.map((step) => {
        const Icon = step.icon;
        const isActive = activeStep === step.id;
        return (
          <button 
            key={step.id} 
            onClick={() => setActiveStep(step.id)}
            className={`flex items-center gap-3 p-3 text-[11px] font-bold text-right border-y-[0.5px] border-r-4 transition-colors ${isActive ? "border-emerald-500 border-y-slate-200 bg-white text-emerald-800 shadow-sm" : "border-transparent border-y-transparent text-slate-600 hover:bg-slate-100"}`}
          >
            <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} /> 
            {step.label}
            {step.status === "success" && <CircleCheck className="w-3 h-3 text-emerald-500 mr-auto" />}
            {step.status === "warning" && <TriangleAlert className="w-3 h-3 text-amber-500 mr-auto" />}
          </button>
        )
      })}
    </div>
  );
}