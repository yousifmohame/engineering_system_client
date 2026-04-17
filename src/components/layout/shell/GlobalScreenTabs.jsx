import React from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { X, Layers, RefreshCw, Trash2 } from "lucide-react";
import { clsx } from "clsx";

const GlobalScreenTabs = () => {
  const { openScreens, activeScreenId, openScreen, closeScreen } =
    useAppStore();
  const queryClient = useQueryClient();

  const handleCloseAll = () => {
    openScreens.forEach((screen) => {
      if (screen.isClosable) {
        closeScreen(screen.id);
      }
    });
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div className="h-[40px] bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border-t-2 border-red-600 flex items-end px-2 select-none">
      {/* App Icon */}
      <div className="h-full flex items-center px-2 text-slate-500 flex-shrink-0">
        <Layers className="w-4.5 h-4.5" />
      </div>

      {/* Tabs Container */}
      <div className="flex flex-1 items-end gap-[2px] overflow-hidden pl-2">
        {openScreens.map((screen) => {
          const isActive = screen.id === activeScreenId;

          return (
            <div
              key={screen.id}
              onClick={() => openScreen(screen.id)}
              // 👈 إضافة خاصية title لظهور التلميح عند وقوف الماوس
              title={`الشاشة: ${screen.title}\nالكود: ${screen.id}`}
              className={clsx(
                "group relative flex items-center h-[32px]",
                "flex-1 min-w-[90px] max-w-[220px]",
                "px-3 cursor-pointer rounded-t-md",
                "transition-all duration-200 ease-out",
                isActive
                  ? "bg-slate-100 text-slate-900 z-20 shadow-[0_-1px_6px_rgba(0,0,0,0.25)]"
                  : "bg-slate-100/70 text-slate-900 hover:bg-slate-700 hover:text-slate-200",
              )}
            >
              {/* Title */}
              <span
                className={clsx(
                  "truncate flex-1 text-[11.5px]",
                  isActive && "font-semibold",
                )}
              >
                {screen.title}
              </span>

              {/* Close */}
              {screen.isClosable && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeScreen(screen.id);
                  }}
                  className={clsx(
                    "ml-2 p-1 rounded transition",
                    isActive
                      ? "opacity-100 hover:bg-slate-300 text-slate-600"
                      : "opacity-0 group-hover:opacity-100 hover:bg-slate-600 text-slate-300",
                  )}
                  title="إغلاق" // تلميح لزر الإغلاق أيضاً
                >
                  <X className="w-3 h-3" />
                </button>
              )}

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-blue-600 rounded-full" />
              )}
            </div>
          );
        })}
      </div>

      {/* أزرار الإجراءات السريعة (تحديث وإغلاق الكل) */}
      <div className="h-full flex items-center gap-1.5 px-3 border-r border-slate-700/50 flex-shrink-0 mb-1">
        <button
          onClick={handleRefreshAll}
          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded transition-colors group relative"
          title="تحديث بيانات النظام"
        >
          <RefreshCw className="w-4 h-4 group-hover:animate-spin-once" />
        </button>

        <button
          onClick={handleCloseAll}
          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
          title="إغلاق جميع الشاشات"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GlobalScreenTabs;
