import React, { useState } from "react";
import {
  X,
  Clock,
  BrainCircuit,
  ChartColumn,
  CalendarDays,
  Wifi,
  Settings,
} from "lucide-react";

// ⚠️ استيراد المكونات التي قمنا بتقسيمها للتو
import DashboardTab from "./components/DashboardTab";
import DailyLogTab from "./components/DailyLogTab";
import ReportsTab from "./components/ReportsTab";
import PoliciesTab from "./components/PoliciesTab";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default function AttendanceCenter({ onClose }) {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const TABS = [
    {
      id: "DASHBOARD",
      label: "تحليل المنظومة (AI Dashboard)",
      icon: ChartColumn,
    },
    { id: "DAILY", label: "السجل اللحظي واليومي", icon: Clock },
    { id: "REPORTS", label: "التقارير والأرشيف التاريخي", icon: CalendarDays },
    { id: "POLICIES", label: "سياسات الدوام", icon: Settings },
  ];

  return (
    <div
      className="relative flex h-full w-full max-w-full min-w-0 flex-col overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-cairo animate-in fade-in duration-300"
      dir="rtl"
    >
      {/* ─── Sticky Sub-Header ─── */}
      <div className="z-20 flex shrink-0 items-center justify-between border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-2.5 py-2 text-white shadow-[0_8px_22px_rgba(18,63,89,0.10)]">
        <div>
          <h2 className="text-base font-black text-[#123f59] flex items-center gap-2">
            <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-gradient-to-br from-[#e2bf74] to-[#c5983c] rounded-xl text-white shadow-[0_8px_22px_rgba(18,63,89,0.06)] shadow-[0_8px_18px_rgba(226,191,116,0.16)]">
              <Clock className="w-5 h-5" />
            </div>
            مركز الحضور والانصراف المتقدم
          </h2>
          <p className="text-xs font-bold text-[#94a3b8] mt-1.5 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-[#0e7490]" />
            مدعوم بالذكاء الاصطناعي لتحليل السلوك والانضباط (متصل بـ ZKTeco)
          </p>
        </div>
        <button
          onClick={onClose}
          className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 text-[#94a3b8] hover:text-rose-600 bg-[#fbf8f1] hover:bg-rose-50 rounded-xl transition-colors"
        >
          <IconWithText icon={X} text="إغلاق" iconClassName="w-5 h-5" />
        </button>
      </div>

      {/* ─── Tabs ─── */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-[#e8ddc8]/60 px-3 shrink-0 flex gap-2.5 overflow-x-auto custom-scrollbar-slim z-10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative inline-flex h-8 min-w-0 items-center justify-center rounded-lg px-2 text-[10px] font-black transition-colors ${
                isActive
                  ? "bg-[#eef7f6] text-[#123f59] border border-[#d8b46a]/35"
                  : "text-[#94a3b8] hover:bg-[#fbf8f1] hover:text-[#123f59]"
              }`}
            >
              <IconWithText
                icon={Icon}
                text={tab.label}
                iconClassName={`w-4 h-4 ${isActive ? "text-[#e2bf74]" : "text-[#94a3b8]"}`}
                textClassName="min-w-0 whitespace-nowrap text-xs font-black leading-none"
              />
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#fff8e7]0 rounded-t-full animate-in slide-in-from-bottom-1" />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Content Area ─── */}
      <div className="min-w-0 flex-1 overflow-y-auto custom-scrollbar-slim p-3 md:p-4 custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-1/2 h-96 bg-[#fff8e7] rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
        {activeTab === "DASHBOARD" && <DashboardTab />}
        {activeTab === "DAILY" && <DailyLogTab />}
        {activeTab === "REPORTS" && <ReportsTab />}

        {activeTab === "POLICIES" && <PoliciesTab />}
      </div>
    </div>
  );
}
