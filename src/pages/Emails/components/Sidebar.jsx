import React from "react";
import {
  MailPlus,
  Inbox,
  Star,
  Send,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  currentView,
  setCurrentView,
  setSelectedMessage,
  unreadCount,
  handleCompose,
}) {
  const menuItems = [
    { id: "inbox", label: "الوارد", icon: Inbox, badge: unreadCount },
    { id: "starred", label: "المهم", icon: Star },
    { id: "sent", label: "الصادر", icon: Send },
    { id: "archived", label: "الأرشيف", icon: Archive },
    { id: "drafts", label: "المسودات", icon: MailPlus },
    { id: "trash", label: "المهملات", icon: Trash2 },
  ];

  const isExpanded = !isSidebarCollapsed;

  return (
    <aside
      className={`relative flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-l border-white/50 bg-white/55 shadow-[0_18px_45px_rgba(18,63,89,0.12)] backdrop-blur-xl transition-all duration-300
        w-[86px] sm:w-[96px]
        ${isSidebarCollapsed ? "lg:w-28" : "lg:w-72"}
      `}
      dir="rtl"
    >
      {/* Decorative soft background */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#f8efe0]/70 via-white/50 to-[#e8f0ef]/70" />
        <div className="absolute right-[-45px] top-[-45px] h-32 w-32 rounded-full bg-[#123f59]/10 blur-2xl lg:h-36 lg:w-36" />
        <div className="absolute left-[-45px] bottom-[-45px] h-32 w-32 rounded-full bg-[#c5983c]/16 blur-2xl lg:h-36 lg:w-36" />

        <div className="hidden absolute right-6 top-24 h-0 w-0 border-b-[38px] border-l-[24px] border-r-[24px] border-b-[#123f59]/10 border-l-transparent border-r-transparent sm:block" />

        <div className="hidden absolute left-8 bottom-28 h-0 w-0 rotate-12 border-b-[28px] border-l-[18px] border-r-[18px] border-b-[#c5983c]/12 border-l-transparent border-r-transparent sm:block" />
      </div>

      {/* Top compose button */}
      <div className="relative z-10 shrink-0 p-2 sm:p-3 lg:p-4">
        <button
          onClick={() => handleCompose("new")}
          className={`group flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d8b46a]/45 bg-gradient-to-l from-[#123f59] to-[#1a5874] font-bold text-white shadow-[0_12px_28px_rgba(18,63,89,0.28)] transition-all duration-300 hover:from-[#10364c] hover:to-[#184d65] hover:shadow-[0_16px_34px_rgba(18,63,89,0.34)]
            h-12 px-0
            ${isExpanded ? "lg:h-[52px] lg:px-6 lg:py-3" : "lg:h-12 lg:px-0"}
          `}
          title="رسالة جديدة"
          type="button"
        >
          <span className="flex flex-col items-center justify-center gap-0.5">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/12 text-[#e2bf74] transition group-hover:bg-white/18">
              <MailPlus className="h-5 w-5" />
            </span>

            <span className="text-[9px] font-black leading-none text-white/90 lg:hidden">
              رسالة
            </span>
          </span>

          {isExpanded && (
            <span className="hidden text-[15px] tracking-wide lg:inline">
              رسالة جديدة
            </span>
          )}

          {!isExpanded && (
            <span className="hidden text-[9px] font-black leading-none text-white/90 lg:block">
              رسالة
            </span>
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-2 pb-2 sm:px-3 custom-scrollbar-slim">
        {menuItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          const showText = isExpanded;

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSelectedMessage(null);
              }}
              title={item.label}
              type="button"
              className={`group relative flex w-full min-w-0 overflow-hidden rounded-2xl text-right transition-all duration-300 ${
                showText
                  ? "items-center gap-3 px-2 py-3 sm:px-3"
                  : "flex-col items-center justify-center gap-1.5 px-1.5 py-3"
              } ${
                isActive
                  ? "border border-[#d8b46a]/65 bg-gradient-to-b from-[#f8efe0]/95 to-white/80 text-[#123f59] shadow-[0_10px_24px_rgba(197,152,60,0.16)]"
                  : "border border-[#d8b46a]/15 bg-white/28 text-[#354b55] hover:border-[#d8b46a]/35 hover:bg-white/65 hover:text-[#123f59] hover:shadow-[0_8px_20px_rgba(18,63,89,0.10)]"
              } ${showText ? "justify-center lg:justify-start" : "justify-center"}`}
            >
              {isActive && (
                <span className="absolute right-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-l-full bg-[#e2bf74]" />
              )}

              <span className="relative flex shrink-0 flex-col items-center justify-center gap-1">
                <span
                  className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all duration-300 ${
                    isActive
                      ? "border-[#d8b46a]/40 bg-[#123f59] text-[#e2bf74]"
                      : "border-[#d8b46a]/20 bg-[#f8efe0]/72 text-[#123f59] group-hover:bg-[#f8efe0]"
                  }`}
                >
                  <Icon className="h-5 w-5" />

                  {/* Badge compact sur petit écran */}
                  {item.badge > 0 && (
                    <span
                      className={`absolute -left-1.5 -top-1.5 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[9px] font-extrabold lg:hidden ${
                        isActive
                          ? "bg-[#e2bf74] text-[#123f59]"
                          : "bg-[#123f59] text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </span>

                <span
                  className={`max-w-[72px] truncate text-center text-[10px] font-black leading-none lg:hidden ${
                    isActive ? "text-[#123f59]" : "text-[#123f59]"
                  }`}
                >
                  {item.label}
                </span>

                {!showText && (
                  <span
                    className={`hidden max-w-[76px] truncate text-center text-[10px] font-black leading-none lg:block ${
                      isActive ? "text-[#123f59]" : "text-[#123f59]"
                    }`}
                  >
                    {item.label}
                  </span>
                )}
              </span>

              {showText && (
                <>
                  <span
                    className={`hidden min-w-0 flex-1 truncate text-[15px] lg:block ${
                      isActive ? "font-extrabold" : "font-bold"
                    }`}
                  >
                    {item.label}
                  </span>

                  {item.badge > 0 && (
                    <span
                      className={`hidden min-w-[28px] rounded-full px-2 py-1 text-center text-[10px] font-extrabold lg:inline-block ${
                        isActive
                          ? "bg-[#e2bf74] text-[#123f59]"
                          : "bg-[#123f59] text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Collapse button: desktop only */}
      <div className="relative z-10 hidden shrink-0 border-t border-white/50 p-4 lg:block">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl border border-[#d8b46a]/25 bg-white/55 p-2.5 text-[#123f59] shadow-sm transition-all duration-300 hover:bg-[#f8efe0]/75 hover:text-[#c5983c] hover:shadow-md"
          title={isSidebarCollapsed ? "توسيع القائمة" : "طي القائمة"}
          type="button"
        >
          {isSidebarCollapsed ? (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span className="text-[10px] font-black">عرض القائمة</span>
            </>
          ) : (
            <>
              <ChevronRight className="h-5 w-5" />
              <span className="text-[10px] font-black">تصغير القائمة</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}