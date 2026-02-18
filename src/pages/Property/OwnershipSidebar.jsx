import React from "react";
import {
  FileSpreadsheet,
  PlusCircle,
  BrainCircuit,
  FileSearch,
  ChevronLeft,
  LayoutGrid,
} from "lucide-react";

const OwnershipSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "log",
      label: "سجل الصكوك",
      icon: FileSpreadsheet,
      description: "قائمة الصكوك المعتمدة والمؤرشفة",
    },
    
  ];

  return (
    <div className="w-64 bg-white border-l-2 border-stone-200 flex flex-col h-full shrink-0 shadow-sm z-10">
      {/* Header */}
      <div className="p-4 bg-stone-50 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
            <LayoutGrid className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-stone-800 text-sm">إدارة الملكيات</h2>
        </div>
        <p className="text-[10px] text-stone-500 pr-9">
          الصكوك، العقارات، والأراضي
        </p>
      </div>

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 p-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-right transition-all duration-200 group relative
                ${
                  isActive
                    ? "bg-emerald-50 border-emerald-200 shadow-sm"
                    : "hover:bg-stone-50 border-transparent hover:border-stone-100"
                } border`}
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-l-full"></div>
              )}

              {/* Icon */}
              <div
                className={`p-2 rounded-md transition-colors ${isActive ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-500 group-hover:text-emerald-600 group-hover:bg-emerald-100"}`}
              >
                <tab.icon className="w-4 h-4" />
              </div>

              {/* Text */}
              <div className="flex-1">
                <span
                  className={`block text-xs font-bold ${isActive ? "text-emerald-900" : "text-stone-700"}`}
                >
                  {tab.label}
                </span>
                <span
                  className={`block text-[9px] mt-0.5 ${isActive ? "text-emerald-500" : "text-stone-400"}`}
                >
                  {tab.description}
                </span>
              </div>

              {/* Arrow */}
              {isActive && (
                <ChevronLeft className="w-4 h-4 text-emerald-500 opacity-100" />
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-3 bg-stone-50 border-t border-stone-200 text-center">
        <p className="text-[10px] text-stone-400 font-mono">
          Property Module v1.0
        </p>
      </div>
    </div>
  );
};

export default OwnershipSidebar;
