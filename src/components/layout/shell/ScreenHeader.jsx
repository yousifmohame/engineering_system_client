import React, { useState, useEffect } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import {
  X,
  Home,
  ChevronLeft,
  RefreshCw,
  Clock,
  Calendar,
  Wifi,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";

export const ScreenHeader = ({ screenId }) => {
  const { screenTabs, activeTabPerScreen, setActiveTab, removeTab } =
    useAppStore();
  const [sessionDuration, setSessionDuration] = useState(0);
  const [currentDate, setCurrentDate] = useState("");

  const tabs = screenTabs[screenId] || [];
  const activeTabId = activeTabPerScreen[screenId];
  const activeTabTitle = tabs.find((t) => t.id === activeTabId)?.title;

  // 1. منطق عداد الجلسة
  useEffect(() => {
    // تنسيق التاريخ مرة واحدة عند التحميل
    const dateOptions = {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    setCurrentDate(new Date().toLocaleDateString("ar-SA", dateOptions));

    const timer = setInterval(() => {
      setSessionDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // تحويل الثواني إلى تنسيق HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // تحديد اسم الشاشة للعرض
  const getScreenName = () => {
    switch (screenId) {
      case "300":
        return "إدارة العملاء";
      case "310":
        return "ملفات الملكية";
      case "320":
        return "المعاملات"; // افتراض
      default:
        return "النظام";
    }
  };

  return (
    <div className="sticky top-0 z-40 flex flex-col bg-white border-b border-gray-200 shadow-sm transition-all">
      {/* ==================================================================================
          الشريط العلوي: شريط المعلومات والأدوات (Info Bar)
      ================================================================================== */}
      <div className="h-9 flex items-center justify-between px-4 bg-slate-50 border-b border-gray-200/50">
        {/* اليمين: مسار التنقل (Breadcrumbs) */}
        <div className="flex items-center text-[11px] text-gray-500 font-medium">
          <div className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
            <Home className="w-3.5 h-3.5 ml-1.5" />
            <span>الرئيسية</span>
          </div>

          <ChevronLeft className="w-3 h-3 mx-1 text-gray-300" />

          <span className="text-gray-700">{getScreenName()}</span>

          {activeTabTitle && (
            <>
              <ChevronLeft className="w-3 h-3 mx-1 text-gray-300" />
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                {activeTabTitle}
              </span>
            </>
          )}
        </div>

        {/* اليسار: مؤشرات النظام (System Indicators) */}
        <div className="flex items-center gap-4 text-[10px] text-gray-500">
          {/* التاريخ */}
          <div className="hidden md:flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm">
            <Calendar className="w-3 h-3 text-indigo-500" />
            <span className="pt-0.5">{currentDate}</span>
          </div>

          {/* عداد الجلسة */}
          <div
            className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-gray-100 shadow-sm"
            title="مدة الجلسة النشطة"
          >
            <Clock className="w-3 h-3 text-emerald-500" />
            <span className="font-mono pt-0.5 font-bold text-gray-700">
              {formatTime(sessionDuration)}
            </span>
          </div>

          {/* حالة الاتصال */}
          <div className="flex items-center gap-1.5" title="حالة النظام: متصل">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-600 font-semibold">متصل</span>
          </div>
        </div>
      </div>

      {/* ==================================================================================
          الشريط السفلي: الألسنة (Tabs Strip)
      ================================================================================== */}
      <div className="flex items-end px-2 pt-2 gap-1 overflow-x-auto bg-[#e5e7eb] scrollbar-hide h-[40px]">
        {tabs.map((tab) => {
          const isActive = activeTabId === tab.id;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTab(screenId, tab.id)}
              className={clsx(
                "group relative flex items-center min-w-[150px] max-w-[220px] h-[36px] px-3 rounded-t-lg text-xs cursor-pointer select-none transition-all duration-200 border-t border-l border-r",
                isActive
                  ? "bg-white border-gray-300 text-blue-700 font-bold z-10 shadow-[0_-2px_5px_rgba(0,0,0,0.02)] translate-y-[1px]" // translate-y لإخفاء خط الحدود السفلي
                  : "bg-gray-100 border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 mt-1 h-[34px]", // الألسنة غير النشطة أقصر قليلاً
              )}
            >
              {/* أيقونة صغيرة للتبويب (اختياري) */}
              <Activity
                className={clsx(
                  "w-3 h-3 ml-2 opacity-70",
                  isActive ? "text-blue-500" : "text-gray-400",
                )}
              />

              <span className="truncate flex-1 pt-0.5">{tab.title}</span>

              {/* أزرار التحكم في التبويب */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                {/* زر التحديث */}
                {isActive && (
                  <button
                    className="p-1 hover:bg-blue-50 rounded-full text-blue-400 hover:text-blue-600 ml-1"
                    title="تحديث هذا التبويب"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}

                {/* زر الإغلاق */}
                {tab.closable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTab(screenId, tab.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded-full text-gray-400 hover:text-red-600"
                    title="إغلاق"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* خط ملون علوي للتبويب النشط */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-blue-600 rounded-t-lg"></div>
              )}
            </div>
          );
        })}

        {/* زر إضافة تبويب جديد (وهمي للتصميم) */}
        {/* <button className="mb-2 mr-1 p-1 hover:bg-gray-200 rounded text-gray-500 transition-colors">
          <Plus className="w-4 h-4" />
        </button> */}
      </div>
    </div>
  );
};
