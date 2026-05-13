import React, { useState } from "react";
import { X, Clock, BrainCircuit, ChartColumn, CalendarDays, Wifi, Settings } from "lucide-react";

// ⚠️ استيراد المكونات التي قمنا بتقسيمها للتو
import DashboardTab from "./components/DashboardTab";
import DailyLogTab from "./components/DailyLogTab";
import ReportsTab from "./components/ReportsTab";
import DevicesTab from "./components/DevicesTab";
import PoliciesTab from "./components/PoliciesTab";

export default function AttendanceCenter({ onClose }) {
  const [activeTab, setActiveTab] = useState("DASHBOARD");

  const TABS = [
    { id: "DASHBOARD", label: "تحليل المنظومة (AI Dashboard)", icon: ChartColumn },
    { id: "DAILY", label: "السجل اللحظي واليومي", icon: Clock },
    { id: "REPORTS", label: "التقارير والأرشيف التاريخي", icon: CalendarDays },
    { id: "DEVICES", label: "إدارة أجهزة البصمة", icon: Wifi },
    { id: "POLICIES", label: "سياسات الدوام", icon: Settings },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative bg-slate-50 font-cairo animate-in fade-in duration-300" dir="rtl">
      
      {/* ─── Sticky Sub-Header ─── */}
      <div className="bg-white/80 backdrop-blur-xl px-6 py-5 border-b border-slate-200/60 shadow-sm flex justify-between items-center shrink-0 z-20">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-white shadow-lg shadow-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
            مركز الحضور والانصراف المتقدم
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1.5 flex items-center gap-1.5">
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
            مدعوم بالذكاء الاصطناعي لتحليل السلوك والانضباط (متصل بـ ZKTeco)
          </p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ─── Tabs ─── */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 shrink-0 flex gap-6 overflow-x-auto custom-scrollbar-slim z-10">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 relative flex items-center gap-2 text-sm font-bold transition-colors whitespace-nowrap ${
                isActive ? "text-amber-600" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-slate-400"}`} />
              {tab.label}
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500 rounded-t-full animate-in slide-in-from-bottom-1" />}
            </button>
          );
        })}
      </div>

      {/* ─── Content Area ─── */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar relative">
        <div className="absolute top-0 right-0 w-1/2 h-96 bg-amber-50 rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
        {activeTab === "DASHBOARD" && <DashboardTab />}
        {activeTab === "DAILY" && <DailyLogTab />}
        {activeTab === "REPORTS" && <ReportsTab />}
        {activeTab === "DEVICES" && <DevicesTab />}
        {activeTab === "POLICIES" && <PoliciesTab />}
      </div>
    </div>
  );
}