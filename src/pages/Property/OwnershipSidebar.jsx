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
    <div className="w-60 bg-white border-l border-[#d8e6ee] flex flex-col h-full shrink-0 shadow-sm z-10 transition-all duration-300">
      
      {/* Header */}
      <div className="p-3 bg-gradient-to-l from-[#071927] to-[#0f6d7c] border-b border-[#d9b85b]/30">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-[#d9b85b] text-[#083646] rounded-xl shrink-0">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <h2 className="font-black text-white text-[13px] truncate">إدارة الملكيات</h2>
        </div>
        <p className="text-[9px] text-white/75 pr-8 truncate font-bold">الصكوك والعقارات</p>
      </div>

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto py-2 space-y-1 p-2 custom-scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-right transition-all duration-200 group relative
                ${isActive ? "bg-[#fbf7ef] border-[#d9b85b]/50 shadow-sm" : "hover:bg-[#f7fbfd] border-transparent hover:border-[#d8e6ee]"} border`}
            >
              {isActive && (
                <div className="absolute right-0 top-2 bottom-2 w-1 bg-[#083646] rounded-l-full"></div>
              )}

              {/* Icon - تم تصغير الأيقونة قليلاً */}
              <div className={`p-1.5 rounded-md shrink-0 transition-colors ${isActive ? "bg-[#083646] text-white" : "bg-[#f7fbfd] text-[#71839a] group-hover:text-[#0f6d7c] group-hover:bg-[#eef5f7]"}`}>
                <tab.icon className="w-3.5 h-3.5" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <span className={`block text-[11px] font-bold truncate ${isActive ? "text-[#123B5D]" : "text-[#123B5D]"}`}>
                  {tab.label}
                </span>
                <span className={`block text-[8px] mt-0.5 truncate ${isActive ? "text-[#0f6d7c]" : "text-[#71839a]"}`}>
                  {tab.description}
                </span>
              </div>

              {isActive && <ChevronLeft className="w-3.5 h-3.5 text-[#0f6d7c] shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-2 bg-[#f7fbfd] border-t border-[#d8e6ee] text-center">
        <p className="text-[8px] text-[#71839a] font-mono tracking-tighter">Property v1.0</p>
      </div>
    </div>
  );
};

export default OwnershipSidebar;