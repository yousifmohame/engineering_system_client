import { clsx } from "clsx";

export default function UnifiedTabsSidebar({
  tabs,
  activeTab,
  onTabChange,
  disabledTabs = [],
}) {
  return (
    <aside
      className="
        ml-4 flex h-[calc(100vh-220px)] w-72 shrink-0 flex-col
        overflow-hidden rounded-[26px]
        border border-[#d8b46a]/30
        bg-gradient-to-b from-[#08111c] via-[#0f3448] to-[#123f59]
        shadow-[0_18px_55px_rgba(15,23,42,0.26)]
      "
      dir="rtl"
    >
      <div className="custom-scrollbar-slim flex-1 space-y-2 overflow-y-auto p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = disabledTabs.includes(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && onTabChange(tab.id)}
              disabled={isDisabled}
              className={clsx(
                `
                  group relative flex w-full items-center gap-3
                  rounded-2xl border p-3 text-right
                  transition-all duration-300
                `,
                isActive
                  ? `
                    border-[#d8b46a]/45
                    bg-[#fbf8f1]
                    shadow-[0_14px_34px_rgba(0,0,0,0.20)]
                  `
                  : `
                    border-white/10
                    bg-white/[0.06]
                    hover:border-[#d8b46a]/30
                    hover:bg-white/[0.10]
                  `,
                isDisabled &&
                  `
                    cursor-not-allowed opacity-45 grayscale
                    hover:border-white/10 hover:bg-white/[0.06]
                  `,
              )}
              type="button"
            >
              {isActive && (
                <div
                  className="
                    absolute right-0 top-3 bottom-3
                    w-1 rounded-l-full bg-[#c5983c]
                  "
                />
              )}

              {Icon && (
                <div
                  className={clsx(
                    `
                      grid h-11 w-11 shrink-0 place-items-center
                      rounded-2xl border transition-all duration-300
                    `,
                    isActive
                      ? `
                        border-[#d8b46a]/35
                        bg-[#123f59]
                        text-[#e2bf74]
                        shadow-sm
                      `
                      : `
                        border-white/10
                        bg-white/10
                        text-white/55
                        group-hover:bg-[#e2bf74]/15
                        group-hover:text-[#e2bf74]
                      `,
                  )}
                >
                  <Icon size={18} />
                </div>
              )}

              <div className="min-w-0 flex-1">
                <span
                  className={clsx(
                    "block truncate text-xs font-black",
                    isActive
                      ? "text-[#123f59]"
                      : "text-white/80 group-hover:text-white",
                  )}
                >
                  {tab.title}
                </span>

                {tab.number && (
                  <span
                    className={clsx(
                      "mt-1 block truncate font-mono text-[10px] font-black",
                      isActive
                        ? "text-[#c5983c]"
                        : "text-white/35 group-hover:text-white/50",
                    )}
                  >
                    {tab.number}
                  </span>
                )}
              </div>

              {isDisabled && (
                <span
                  className="
                    shrink-0 rounded-xl border border-white/10
                    bg-white/10 px-2 py-1
                    text-[9px] font-black text-white/40
                  "
                >
                  مقفل
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}