import React from "react";
import {
  FileText,
  PlusCircle,
  Info,
  Activity,
  UploadCloud,
  ChevronLeft,
  LayoutDashboard,
} from "lucide-react";

const TransactionsSidebar = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: "log",
      label: "سجل المعاملات",
      icon: FileText,
      description: "عرض وفلترة كافة المعاملات",
    },
    {
      id: "create",
      label: "إنشاء معاملة",
      icon: PlusCircle,
      description: "تسجيل معاملة جديدة (Wizard)",
    },
    {
      id: "details",
      label: "تفاصيل معاملة",
      icon: Info,
      description: "عرض بيانات معاملة محددة",
    },
    {
      id: "track",
      label: "تتبع معاملة",
      icon: Activity,
      description: "متابعة مسار وسير العمل",
    },
    {
      id: "upload",
      label: "مركز التجهيز والرفع",
      icon: UploadCloud,
      description: "إدارة الملفات والمرفقات",
    },
  ];

  return (
    <aside
      className="
        flex h-full w-72 shrink-0 flex-col overflow-hidden
        border-l border-[#d8b46a]/30
        bg-gradient-to-b from-[#08111c] via-[#0f3448] to-[#123f59]
        shadow-[0_18px_55px_rgba(15,23,42,0.28)]
        z-10
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden border-b border-white/10
          px-4 py-5
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-55px] top-[-55px] h-32 w-32 rounded-full bg-[#c5983c]/20 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-36 w-36 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div
            className="
              grid h-12 w-12 shrink-0 place-items-center
              rounded-2xl bg-[#e2bf74] text-[#123f59]
              shadow-[0_12px_24px_rgba(0,0,0,0.20)]
            "
          >
            <LayoutDashboard className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-white">
              لوحة المعاملات
            </h2>

            <p className="mt-1 truncate text-[10px] font-bold text-white/45">
              التحكم الكامل في العمليات
            </p>
          </div>
        </div>
      </div>

      {/* Tabs List */}
      <div className="custom-scrollbar-slim flex-1 space-y-2 overflow-y-auto p-3">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex w-full items-center gap-3
                rounded-2xl border p-3 text-right
                transition-all duration-300
                ${
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
                    `
                }
              `}
              type="button"
            >
              {/* Active Indicator Line */}
              {isActive && (
                <div
                  className="
                    absolute right-0 top-3 bottom-3
                    w-1 rounded-l-full
                    bg-[#c5983c]
                  "
                />
              )}

              {/* Icon */}
              <div
                className={`
                  grid h-11 w-11 shrink-0 place-items-center
                  rounded-2xl border transition-all duration-300
                  ${
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
                      `
                  }
                `}
              >
                <Icon className="h-5 w-5" />
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <span
                  className={`
                    block truncate text-xs font-black
                    ${
                      isActive
                        ? "text-[#123f59]"
                        : "text-white/80 group-hover:text-white"
                    }
                  `}
                >
                  {tab.label}
                </span>

                <span
                  className={`
                    mt-1 block truncate text-[9px] font-bold
                    ${
                      isActive
                        ? "text-[#64748b]"
                        : "text-white/35 group-hover:text-white/50"
                    }
                  `}
                >
                  {tab.description}
                </span>
              </div>

              {/* Arrow */}
              <ChevronLeft
                className={`
                  h-4 w-4 shrink-0 transition-all duration-300
                  ${
                    isActive
                      ? "translate-x-0 text-[#c5983c] opacity-100"
                      : "-translate-x-1 text-white/20 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  }
                `}
              />
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div
        className="
          border-t border-white/10
          bg-black/10 px-4 py-3 text-center
        "
      >
        <p
          className="
            rounded-2xl border border-white/10
            bg-white/[0.06] px-3 py-2
            font-mono text-[10px] font-black
            text-[#e2bf74]/75
          "
        >
          Ver 2.5.0-Build286
        </p>
      </div>
    </aside>
  );
};

export default TransactionsSidebar;