import React from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import { X, Layers, RefreshCw, Trash2 } from "lucide-react";
import { clsx } from "clsx";

const GlobalScreenTabs = () => {
  const { openScreens, activeScreenId, openScreen, closeScreen } =
    useAppStore();

  const queryClient = useQueryClient();

  const closableScreens = openScreens.filter((screen) => screen.isClosable);

  const handleCloseAll = () => {
    closableScreens.forEach((screen) => {
      closeScreen(screen.id);
    });
  };

  const handleRefreshAll = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div
      className="
        relative z-20 flex h-[44px] shrink-0 items-end overflow-hidden
        border-b border-[#c5983c]/20 border-t border-[#c5983c]/25
        bg-gradient-to-l from-[#08111c] via-[#0f172a] to-[#123f59]
        px-2 shadow-[0_8px_24px_rgba(15,23,42,0.22)]
        select-none
      "
      dir="rtl"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute right-[12%] top-[-45px] h-24 w-24 rounded-full bg-[#c5983c]/12 blur-3xl" />
        <div className="absolute left-[18%] bottom-[-55px] h-28 w-28 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#c5983c]/70 to-transparent" />
      </div>

      {/* App Icon */}
      <div className="relative z-10 flex h-full shrink-0 items-center px-2">
        <div
          className="
            grid h-8 w-8 place-items-center rounded-2xl
            border border-[#c5983c]/25 bg-white/[0.06]
            text-[#e2bf74] shadow-sm
          "
          title="الشاشات المفتوحة"
        >
          <Layers className="h-4 w-4" />
        </div>
      </div>

      {/* Tabs Container */}
      <div
        className="
          relative z-10 flex min-w-0 flex-1 items-end gap-1
          overflow-x-auto overflow-y-hidden px-1 pb-0.5
          custom-scrollbar-slim
        "
      >
        {openScreens.map((screen) => {
          const isActive = screen.id === activeScreenId;

          return (
            <button
              key={screen.id}
              onClick={() => openScreen(screen.id)}
              title={`الشاشة: ${screen.title}\nالكود: ${screen.id}`}
              type="button"
              className={clsx(
                `
                  group relative flex h-[34px] min-w-[115px] max-w-[230px]
                  flex-1 items-center gap-2 overflow-hidden rounded-t-2xl
                  border px-3 text-right transition-all duration-300
                `,
                isActive
                  ? `
                    border-[#c5983c]/45 bg-gradient-to-l from-white via-[#fbf8f1] to-[#eef7f6]
                    text-[#0f3448] shadow-[0_-8px_22px_rgba(197,152,60,0.16)]
                  `
                  : `
                    border-white/10 bg-white/[0.055] text-slate-300
                    hover:border-[#c5983c]/30 hover:bg-white/[0.10] hover:text-white
                  `,
              )}
            >
              {/* Active glow */}
              {isActive && (
                <>
                  <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-l from-transparent via-[#c5983c] to-transparent" />
                  <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-gradient-to-l from-[#123f59] via-[#c5983c] to-[#0e7490]" />
                </>
              )}

              {/* Code badge */}
              <span
                className={clsx(
                  `
                    relative z-10 shrink-0 rounded-lg border px-1.5 py-0.5
                    text-[9px] font-black font-mono
                  `,
                  isActive
                    ? "border-[#c5983c]/30 bg-[#f8efe0] text-[#123f59]"
                    : "border-white/10 bg-[#08111c]/70 text-[#e2bf74]",
                )}
              >
                {screen.id}
              </span>

              {/* Title */}
              <span
                className={clsx(
                  "relative z-10 min-w-0 flex-1 truncate text-[11.5px]",
                  isActive ? "font-black" : "font-bold",
                )}
              >
                {screen.title}
              </span>

              {/* Close */}
              {screen.isClosable && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeScreen(screen.id);
                  }}
                  title="إغلاق"
                  className={clsx(
                    `
                      relative z-10 grid h-6 w-6 shrink-0 place-items-center
                      rounded-xl transition-all duration-300
                    `,
                    isActive
                      ? "bg-[#123f59]/10 text-[#123f59] hover:bg-rose-50 hover:text-rose-600"
                      : "bg-white/[0.04] text-slate-400 opacity-0 hover:bg-rose-500/15 hover:text-rose-300 group-hover:opacity-100",
                  )}
                >
                  <X className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div
        className="
          relative z-10 mb-1 flex h-[34px] shrink-0 items-center gap-1.5
          border-r border-[#c5983c]/20 px-2
        "
      >
        <button
          onClick={handleRefreshAll}
          className="
            group grid h-8 w-8 place-items-center rounded-2xl
            border border-cyan-500/20 bg-cyan-500/8
            text-cyan-200 transition-all duration-300
            hover:border-cyan-400/40 hover:bg-cyan-400/15 hover:text-cyan-100
          "
          title="تحديث بيانات النظام"
          type="button"
        >
          <RefreshCw className="h-4 w-4 transition-transform duration-500 group-hover:rotate-180" />
        </button>

        <button
          onClick={handleCloseAll}
          disabled={closableScreens.length === 0}
          className={clsx(
            `
              grid h-8 w-8 place-items-center rounded-2xl border
              transition-all duration-300
            `,
            closableScreens.length === 0
              ? "cursor-not-allowed border-white/5 bg-white/[0.03] text-slate-600"
              : "border-rose-400/20 bg-rose-400/8 text-rose-200 hover:border-rose-400/40 hover:bg-rose-400/15 hover:text-rose-100",
          )}
          title="إغلاق جميع الشاشات"
          type="button"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default GlobalScreenTabs;