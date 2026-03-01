import React from "react";
import { useAppStore } from "../../../stores/useAppStore";
import {
  X,
  Home,
  ChevronLeft,
  RefreshCw,
  LayoutTemplate
} from "lucide-react";
import { clsx } from "clsx";

const ScreenHeader = ({ screenId }) => {
  // 👈 تمت إضافة openScreen للعودة للرئيسية
  const { screenTabs, activeTabPerScreen, setActiveTab, removeTab, openScreen } = useAppStore();

  const tabs = screenTabs[screenId] || [];
  const activeTabId = activeTabPerScreen[screenId];
  const activeTabTitle = tabs.find((t) => t.id === activeTabId)?.title;

  // تحديد اسم الشاشة للعرض
  const getScreenName = () => {
    switch (screenId) {
      case "300": return "إدارة العملاء";
      case "310": return "ملفات الملكية";
      case "320": return "المعاملات";
      default: return "شاشة النظام";
    }
  };

  return (
    <div className="sticky top-0 z-20 flex flex-col bg-white shrink-0">
      
      {/* ==================================================================================
          1. شريط مسار التنقل (Breadcrumbs) - الآن تفاعلي بالكامل
      ================================================================================== */}
      <div className="h-10 flex items-center justify-between px-4 bg-white border-b border-slate-100 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        
        <div className="flex items-center text-[11px] font-medium text-slate-500">
          
          {/* 👈 1. زر الرئيسية (ينقلك للداشبورد) */}
          <div 
            onClick={() => openScreen('001')} // افتراض أن 001 هو كود الرئيسية، عدله حسب نظامك
            className="flex items-center hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer group"
            title="العودة للصفحة الرئيسية للنظام"
          >
            <Home className="w-3.5 h-3.5 ml-1.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>الرئيسية</span>
          </div>

          <ChevronLeft className="w-3.5 h-3.5 mx-0.5 text-slate-300" />

          {/* 👈 2. زر الشاشة (يعيدك للتاب الأساسي الأول للشاشة المفتوحة) */}
          <div 
            onClick={() => {
              if (tabs.length > 0) setActiveTab(screenId, tabs[0].id);
            }}
            className="flex items-center gap-1.5 cursor-pointer hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
            title={`إعادة تعيين شاشة ${getScreenName()}`}
          >
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[9px] font-mono border border-slate-200">
              {screenId}
            </span>
            <span className="text-slate-700 font-bold hover:text-blue-700">{getScreenName()}</span>
          </div>

          {/* التاب النشط الحالي (غير قابل للضغط لأنه التاب الحالي) */}
          {activeTabTitle && (
            <>
              <ChevronLeft className="w-3.5 h-3.5 mx-0.5 text-slate-300" />
              <span className="text-blue-700 font-bold bg-blue-50/50 px-2 py-1 rounded cursor-default select-text">
                {activeTabTitle}
              </span>
            </>
          )}
        </div>

      </div>

      {/* ==================================================================================
          2. شريط الألسنة المحلية (Local Tabs Strip)
      ================================================================================== */}
      <div className="flex items-end px-3 pt-2 gap-[2px] bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar-hide h-[42px]">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(screenId, tab.id)}
              // 👈 إضافة خاصية Title لظهور التلميح (Tooltip) عند وقوف الماوس
              title={`الشاشة: ${tab.title}\nالكود: ${tab.id}`} 
              className={clsx(
                "group relative flex items-center h-[34px] min-w-[130px] max-w-[200px] px-3 rounded-t-md text-xs cursor-pointer select-none transition-all duration-200",
                isActive
                  ? "bg-white text-blue-700 font-bold border border-b-0 border-slate-200 z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.03)] pb-px" 
                  : "bg-slate-100/50 text-slate-500 hover:bg-slate-200 hover:text-slate-800 border border-transparent border-b-slate-200"
              )}
              style={isActive ? { marginBottom: "-1px", borderBottomColor: "white" } : {}}
            >
              
              <LayoutTemplate className={clsx("w-3 h-3 ml-2 shrink-0 transition-colors", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-500")} />
              <span className="truncate flex-1 pt-0.5">{tab.title}</span>

              {/* أزرار الإجراءات للتاب */}
              <div className={clsx(
                "flex items-center mr-1 transition-opacity duration-200",
                isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                {isActive && (
                  <button
                    className="p-1 hover:bg-blue-50 rounded text-blue-400 hover:text-blue-600 ml-1 transition-colors"
                    title="تحديث البيانات"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}

                {tab.closable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(screenId, tab.id);
                    }}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
                    title="إغلاق التبويب"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-t-md"></div>
              )}
            </div>
          );
        })}
      </div>
      
    </div>
  );
};

export default ScreenHeader;