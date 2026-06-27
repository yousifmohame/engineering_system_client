// src/pages/Hr/screens/payroll/components/Sidebar.jsx
import React from "react";
import { Calculator, History, Sparkles, PieChart, Banknote } from "lucide-react";

export default function Sidebar({ activeView, setActiveView }) {
  const menuItems = [
    { id: "HISTORY", label: "سجل المسيرات", icon: History, color: "text-blue-600" },
    { id: "GENERATE", label: "إصدار نظامي", icon: Calculator, color: "text-teal-600" },
    { id: "MUDAD", label: "مطابقة مدد (AI)", icon: Sparkles, color: "text-purple-600" },
    { id: "REPORTS", label: "التقارير والإحصائيات", icon: PieChart, color: "text-amber-600" },
  ];

  return (
    <div className="w-64 bg-white/50 backdrop-blur-xl border-l border-white/60 flex flex-col z-20 shadow-lg">
      <div className="p-6 border-b border-white/40 flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
          <Banknote size={24} />
        </div>
        <h2 className="text-xl font-black text-[#123f59]">الرواتب</h2>
      </div>

      <div className="flex-1 py-6 px-4 space-y-2 flex flex-col">
        {menuItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 ${
                isActive 
                  ? "bg-white shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-white/80 translate-x-1" 
                  : "text-gray-600 hover:bg-white/40 hover:text-[#123f59]"
              }`}
            >
              <Icon size={22} className={isActive ? item.color : "opacity-60"} />
              <span className={isActive ? "text-[#123f59] font-black" : ""}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}