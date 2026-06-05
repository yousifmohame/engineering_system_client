import React from "react";
import {
  FileStack,
  FileText,
  ClipboardList,
} from "lucide-react";


export default function DocumentsDashboard({ onNavigate }) {
  const MODULES = [
    {
      id: "DOCUMENT_TYPES",
      title: "أنواع المستندات",
      icon: FileText,
      gradient: "from-[#0e7490] to-[#15536f]",
      badge: "إدارة",
    },
    {
      id: "TECHNICAL_REPORT",
      title: "التقرير الفني",
      icon: ClipboardList,
      gradient: "from-[#7c3aed] to-[#5b21b6]",
      badge: "جديد",
    },
  ];

  return (
    <div
      className="relative flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden bg-[#fbf8f1]/50 p-3 font-cairo"
      dir="rtl"
    >
      {/* الخلفية */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-[#eef7f6] rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-96 bg-rose-50 rounded-tr-[100px] -z-10 blur-3xl opacity-50"></div>

      {/* الهيدر */}
      <div className="relative isolate flex items-center justify-between overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white shadow-[0_12px_28px_rgba(18,63,89,0.14)]">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e2bf74] text-[#06111d] shadow-[0_10px_24px_rgba(226,191,116,0.18)]">
            <FileStack className="h-5 w-5" />
          </span>

          <div>
            <h2 className="text-[16px] font-black">
              المستندات والقوالب
            </h2>

            <p className="text-[10px] text-white/70 font-bold">
              إدارة أنواع المستندات والتقارير الفنية.
            </p>
          </div>
        </div>
      </div>

      {/* البطاقات */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-[#e8ddc8]/60 bg-white/50 p-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          {MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => onNavigate?.(module.id)}
              className={`group relative flex min-h-[170px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[22px] bg-gradient-to-br ${module.gradient} p-5 text-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(18,63,89,0.18)]`}
            >
              {/* Glow */}
              <div className="absolute top-0 right-0 h-36 w-36 rounded-full bg-white/10 blur-3xl transition-transform duration-700 group-hover:scale-150"></div>

              {/* Badge */}
              <div className="absolute top-4 right-4 rounded-xl border border-white/15 bg-white/15 px-2.5 py-1 text-[10px] font-black backdrop-blur-md">
                {module.badge}
              </div>

              {/* Icon */}
              <div className="rounded-2xl border border-white/20 bg-white/15 p-4 backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-white/25">
                <module.icon className="h-10 w-10 text-white" />
              </div>

              {/* Title */}
              <div className="text-center text-[15px] font-black leading-snug">
                {module.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}