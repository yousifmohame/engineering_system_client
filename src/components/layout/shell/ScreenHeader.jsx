import React from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  Home,
  ChevronLeft,
  RefreshCw,
  LayoutTemplate,
  Layers,
} from "lucide-react";
import { clsx } from "clsx";

const ScreenHeader = ({ screenId }) => {
  const {
    screenTabs,
    activeTabPerScreen,
    setActiveTab,
    removeTab,
    openScreen,
  } = useAppStore();

  const queryClient = useQueryClient();

  const tabs = screenTabs[screenId] || [];
  const activeTabId = activeTabPerScreen[screenId];
  const activeTabTitle = tabs.find((t) => t.id === activeTabId)?.title;

  const getScreenName = () => {
    const screenNames = {
      "01": "لوحة التحكم",
      DASH: "لوحة التحكم",
      "300": "إدارة العملاء",
      "310": "ملفات الملكية",
      "815": "عروض الأسعار",
      "39": "تقسيمات الرياض",
      "40": "القطاعات",
      "41": "الأحياء",
      "222": "العقود",
      "30": "الوسطاء",
      "31": "مكاتب الوسطاء",
      "32": "الشركاء",
      "71": "إعدادات النظام",
      "09": "رخص البناء",
      "0010": "رخص المكتب",
      "10": "المعاملات",
      "88": "الموارد البشرية",
      "16": "مستكشف الملفات",
      "98": "إشعارات البريد",
      "99": "صندوق البريد",
      "100": "طلبات الملفات",
      "101": "إعدادات البريد",
      "109": "الروابط السريعة",
      "112": "المكتبة المرجعية",
      "170": "إدارة العقود",
      "030": "مفكرة المكتب",
      "58": "Details Office",
      "91": "محاضر الاجتماعات",
      "20": "التوثيق الإلكتروني",
      "11": "أرشيف المشاريع",
      "52": "الذكاء الاصطناعي",
    };

    return screenNames[screenId] || "شاشة النظام";
  };

  const handleGoHome = () => {
    openScreen("01", "لوحة التحكم");
  };

  const handleResetScreen = () => {
    if (tabs.length > 0) {
      setActiveTab(screenId, tabs[0].id);
    }
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <div
      className="
        sticky top-0 z-20 flex shrink-0 flex-col overflow-hidden
        border-b border-[#c5983c]/20 bg-white
        shadow-[0_8px_24px_rgba(18,63,89,0.08)]
      "
      dir="rtl"
    >
      {/* Breadcrumb */}
      <div
        className="
          relative flex h-11 items-center justify-between overflow-hidden
          border-b border-[#e8ddc8]
          bg-gradient-to-l from-white via-[#fbf8f1] to-[#eef7f6]
          px-4
        "
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute right-[18%] top-[-45px] h-24 w-24 rounded-full bg-[#123f59]/7 blur-3xl" />
          <div className="absolute left-[20%] bottom-[-50px] h-24 w-24 rounded-full bg-[#c5983c]/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-w-0 items-center text-[11px] font-bold text-[#64748b]">
          <button
            onClick={handleGoHome}
            className="
              group flex items-center gap-1.5 rounded-2xl border border-transparent
              px-2.5 py-1.5 transition-all
              hover:border-[#c5983c]/25 hover:bg-white hover:text-[#123f59]
            "
            title="العودة للصفحة الرئيسية للنظام"
            type="button"
          >
            <span className="grid h-6 w-6 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74] shadow-sm">
              <Home className="h-3.5 w-3.5" />
            </span>

            <span className="hidden sm:inline">الرئيسية</span>
          </button>

          <ChevronLeft className="mx-1 h-3.5 w-3.5 text-[#c5983c]/70" />

          <button
            onClick={handleResetScreen}
            className="
              flex min-w-0 items-center gap-2 rounded-2xl border border-[#d8b46a]/25
              bg-white/75 px-2.5 py-1.5 shadow-sm transition-all
              hover:border-[#c5983c]/45 hover:bg-[#f8efe0]/70
            "
            title={`إعادة تعيين شاشة ${getScreenName()}`}
            type="button"
          >
            <span
              className="
                shrink-0 rounded-lg border border-[#c5983c]/25
                bg-[#f8efe0] px-2 py-0.5 font-mono text-[9px]
                font-black text-[#123f59]
              "
            >
              {screenId}
            </span>

            <span className="min-w-0 truncate text-[12px] font-black text-[#123f59]">
              {getScreenName()}
            </span>
          </button>

          {activeTabTitle && (
            <>
              <ChevronLeft className="mx-1 h-3.5 w-3.5 text-[#c5983c]/70" />

              <span
                className="
                  max-w-[240px] truncate rounded-2xl border border-cyan-700/20
                  bg-cyan-50 px-3 py-1.5 text-[11px]
                  font-black text-cyan-900
                "
                title={activeTabTitle}
              >
                {activeTabTitle}
              </span>
            </>
          )}
        </div>

        <div className="relative z-10 hidden items-center gap-2 md:flex">
          <div
            className="
              flex items-center gap-2 rounded-2xl border border-[#d8b46a]/25
              bg-white/70 px-3 py-1.5 shadow-sm
            "
          >
            <Layers className="h-3.5 w-3.5 text-[#c5983c]" />
            <span className="text-[10px] font-black text-[#123f59]">
              التبويبات الداخلية
            </span>
          </div>

          <button
            onClick={handleRefresh}
            className="
              grid h-8 w-8 place-items-center rounded-2xl border border-cyan-700/20
              bg-cyan-50 text-cyan-800 transition-all
              hover:bg-cyan-100
            "
            title="تحديث بيانات الشاشة"
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Local Tabs Strip */}
      {tabs.length > 0 && (
        <div
          className="
            flex h-[46px] items-end gap-1 overflow-x-auto overflow-y-hidden
            border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#f8efe0]/70 via-white to-[#eef7f6]
            px-3 pt-2 custom-scrollbar-slim
          "
        >
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(screenId, tab.id)}
                title={`الشاشة: ${tab.title}\nالكود: ${tab.id}`}
                type="button"
                className={clsx(
                  `
                    group relative flex h-[36px] min-w-[140px] max-w-[230px]
                    items-center gap-2 overflow-hidden rounded-t-2xl border
                    px-3 text-right text-xs transition-all duration-300
                  `,
                  isActive
                    ? `
                      z-10 border-[#c5983c]/45 border-b-white
                      bg-white text-[#123f59]
                      shadow-[0_-8px_22px_rgba(197,152,60,0.14)]
                    `
                    : `
                      border-[#e8ddc8] bg-white/45 text-[#64748b]
                      hover:border-[#c5983c]/35 hover:bg-white hover:text-[#123f59]
                    `,
                )}
                style={
                  isActive
                    ? {
                        marginBottom: "-1px",
                      }
                    : {}
                }
              >
                {isActive && (
                  <>
                    <span className="absolute inset-x-3 top-0 h-px bg-gradient-to-l from-transparent via-[#c5983c] to-transparent" />
                    <span className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-gradient-to-l from-[#123f59] via-[#c5983c] to-[#0e7490]" />
                  </>
                )}

                <span
                  className={clsx(
                    `
                      relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-xl
                      border transition-all
                    `,
                    isActive
                      ? "border-[#c5983c]/30 bg-[#f8efe0] text-[#c5983c]"
                      : "border-[#e8ddc8] bg-white text-[#94a3b8] group-hover:text-[#c5983c]",
                  )}
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                </span>

                <span
                  className={clsx(
                    "relative z-10 min-w-0 flex-1 truncate pt-0.5",
                    isActive ? "font-black" : "font-bold",
                  )}
                >
                  {tab.title}
                </span>

                <div
                  className={clsx(
                    "relative z-10 flex shrink-0 items-center gap-1 transition-opacity duration-300",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
                  )}
                >
                  {isActive && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefresh();
                      }}
                      className="
                        grid h-6 w-6 place-items-center rounded-xl
                        text-cyan-700 transition hover:bg-cyan-50
                      "
                      title="تحديث البيانات"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </span>
                  )}

                  {tab.closable && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTab(screenId, tab.id);
                      }}
                      className="
                        grid h-6 w-6 place-items-center rounded-xl
                        text-slate-400 transition
                        hover:bg-rose-50 hover:text-rose-600
                      "
                      title="إغلاق التبويب"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScreenHeader;