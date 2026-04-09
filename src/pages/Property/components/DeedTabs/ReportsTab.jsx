import React from "react";
import {
  ChartColumn,
  Download,
  ClipboardList,
  Users,
  Ruler,
  FileText,
  Map as MapIcon,
  Shield,
} from "lucide-react";

export const ReportsTab = ({
  triggerPrint,
  ownersCount,
  localData,
  perimeter,
  docsCount,
  plotsCount,
}) => {
  return (
    <div className="animate-in fade-in max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <ChartColumn className="w-5 h-5 text-blue-600" /> تقارير الملكية
        </span>
        <button
          onClick={() => triggerPrint("تقرير ملكية شامل")}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm"
        >
          <Download className="w-4 h-4" /> تصدير PDF شامل
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {[
          {
            title: "تقرير ملكية شامل",
            desc: "جميع بيانات الملكية في ملف واحد",
            icon: ClipboardList,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200",
          },
          {
            title: "تقرير المُلّاك",
            desc: `${ownersCount} مالك — مجموع: 100%`,
            icon: Users,
            color: "text-sky-600",
            bg: "bg-sky-50",
            border: "border-sky-200",
          },
          {
            title: "تقرير الحدود",
            desc: `${localData.boundaries?.length || 0} حد — محيط: ${perimeter}م`,
            icon: Ruler,
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
          },
          {
            title: "تقرير الوثائق",
            desc: `${docsCount} وثيقة مرتبطة`,
            icon: FileText,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-200",
          },
          {
            title: "تقرير القطع",
            desc: `${plotsCount} قطعة`,
            icon: MapIcon,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
          },
          {
            title: "شهادة ملكية",
            desc: "نسخة رسمية للطباعة",
            icon: Shield,
            color: "text-slate-700",
            bg: "bg-slate-100",
            border: "border-slate-300",
          },
        ].map((report, idx) => (
          <button
            key={idx}
            onClick={() => triggerPrint(report.title)}
            className="flex items-start gap-4 rounded-xl p-4 text-right bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
          >
            <div
              className={`flex items-center justify-center rounded-xl shrink-0 w-12 h-12 ${report.bg} ${report.color} border ${report.border} group-hover:scale-110 transition-transform`}
            >
              <report.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                {report.title}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                {report.desc}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
