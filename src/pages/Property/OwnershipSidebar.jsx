import React from "react";
import {
  FileSpreadsheet,
  LayoutDashboard,
  PlusCircle,
  ChevronLeft,
  LayoutGrid,
  Building,
} from "lucide-react";

const OwnershipSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "DASHBOARD_TAB", 
      label: "لوحة الملكيات",
      icon: LayoutDashboard,
      description: "إحصائيات ونظرة عامة", // تم تقصير الوصف ليناسب العرض الجديد
    },
    {
      id: "310-MAIN",
      label: "سجل الصكوك",
      icon: FileSpreadsheet,
      description: "القائمة المعتمدة والمؤرشفة",
    },
    {
      id: "NEW_DEED_TAB",
      label: "إنشاء ملكية جديدة",
      icon: PlusCircle,
      description: "إضافة صك وربط عبر AI",
    },
  ];

  const isDetailTabActive = activeTab?.startsWith("DEED-");

  if (isDetailTabActive) {
    tabs.push({
      id: activeTab,
      label: "تفاصيل الملكية",
      icon: Building,
      description: "بيانات الصك المفتوح حالياً",
    });
  }

  return (
    // 👈 تم تغيير العرض هنا من w-64 إلى w-56
    <div className="w-56 bg-white border-l-2 border-stone-200 flex flex-col h-full shrink-0 shadow-sm z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="p-3 bg-stone-50 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h2 className="font-bold text-stone-800 text-[13px] truncate">إدارة الملكيات</h2>
        </div>
        <p className="text-[9px] text-stone-400 pr-8 truncate">الصكوك والعقارات</p>
      </div>

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 p-2 custom-scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg text-right transition-all duration-200 group relative
                ${isActive ? "bg-emerald-50 border-emerald-200 shadow-sm" : "hover:bg-stone-50 border-transparent hover:border-stone-100"} border`}
            >
              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-emerald-600 rounded-l-full"></div>
              )}

              {/* Icon - تم تصغير الأيقونة قليلاً */}
              <div className={`p-1.5 rounded-md shrink-0 transition-colors ${isActive ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-400 group-hover:text-emerald-600 group-hover:bg-emerald-100"}`}>
                <tab.icon className="w-3.5 h-3.5" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className={`block text-[11px] font-bold truncate ${isActive ? "text-emerald-900" : "text-stone-700"}`}>
                  {tab.label}
                </span>
                <span className={`block text-[8px] mt-0.5 truncate ${isActive ? "text-emerald-500" : "text-stone-400"}`}>
                  {tab.description}
                </span>
              </div>

              {isActive && <ChevronLeft className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 bg-stone-50 border-t border-stone-200 text-center">
        <p className="text-[8px] text-stone-300 font-mono tracking-tighter">Property v1.0</p>
      </div>
    </div>
  );
};

export default OwnershipSidebar;