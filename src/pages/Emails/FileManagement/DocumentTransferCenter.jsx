import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  Share2,
  Send,
  Plus,
  Link as LinkIcon,
  Inbox,
  Activity,
  LayoutTemplate,
  Settings,
  Clock,
  Loader2,
  ShieldCheck,
  RefreshCw,
  FileText,
  BarChart3,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import RequestLinkModal from "./Components/modals_screens/RequestLinkModal";
import SendPackageModal from "./Components/modals_screens/SendPackageModal";
import RequestsTab from "./Components/Tabs_screens/RequestsTab";
import InboxTab from "./Components/Tabs_screens/InboxTab";
import SettingsTab from "./Components/Tabs_screens/SettingsTab";
import StatsTab from "./Components/Tabs_screens/StatsTab";
import HistoryTab from "./Components/Tabs_screens/HistoryTab";
import TemplatesTab from "./Components/Tabs_screens/TemplatesTab";
import { FileAnalysisPanel } from "./Components/ai/FileAnalysisPanel";

export default function DocumentTransferCenter() {
  const [activeTab, setActiveTab] = useState("requests");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(null);

  const {
    data: centerData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["transfer-center-data"],
    queryFn: async () => {
      const res = await api.get("/transfer-center/dashboard");
      return res.data?.data;
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  const {
    requests = [],
    packages = [],
    inbox = [],
    logs = [],
    stats = {},
    settings = {},
  } = centerData || {};

  const sidebarTabs = [
    {
      id: "requests",
      label: "الطلبات النشطة",
      subLabel: "وارد",
      icon: LinkIcon,
      tone: "blue",
    },
    {
      id: "inbox",
      label: "الملفات المستلمة",
      subLabel: "صندوق الوارد",
      icon: Inbox,
      tone: "amber",
    },
    {
      id: "outbox",
      label: "الحزم الصادرة",
      subLabel: "إرسال خارجي",
      icon: Send,
      tone: "emerald",
    },
    {
      id: "templates",
      label: "القوالب المحفوظة",
      subLabel: "رسائل جاهزة",
      icon: LayoutTemplate,
      tone: "purple",
    },
    {
      id: "stats",
      label: "تقارير الأداء",
      subLabel: "إحصائيات",
      icon: Activity,
      tone: "cyan",
    },
    {
      id: "settings",
      label: "إعدادات المركز",
      subLabel: "الهوية والصفحات",
      icon: Settings,
      tone: "slate",
    },
    {
      id: "history",
      label: "سجل العمليات",
      subLabel: "Audit Trail",
      icon: Clock,
      tone: "rose",
    },
  ];

  const topStats = [
    {
      label: "روابط نشطة",
      count: stats.activeLinks || 0,
      icon: LinkIcon,
      tone: "blue",
    },
    {
      label: "ملفات للفرز",
      count: stats.pendingFiles || 0,
      icon: Inbox,
      tone: "amber",
    },
    {
      label: "إجمالي المستلم",
      count: stats.totalReceived || 0,
      icon: Activity,
      tone: "emerald",
    },
    {
      label: "إجمالي الصادر",
      count: stats.totalSent || 0,
      icon: Send,
      tone: "cyan",
    },
  ];

  return (
    <div
      className="
        relative flex h-full flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-140px] top-[-140px] h-96 w-96 rounded-full bg-[#123f59]/10 blur-3xl" />
        <div className="absolute left-[-140px] bottom-[-140px] h-96 w-96 rounded-full bg-[#c5983c]/16 blur-3xl" />
      </div>

      {/* Header */}
      <header
        className="
          relative z-10 shrink-0 overflow-hidden
          border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-4 py-4 text-white
          shadow-[0_14px_34px_rgba(18,63,89,0.16)]
          lg:px-6
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          {/* Title */}
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Share2 className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black md:text-xl">
                مركز الإرسال والاستقبال
              </h1>

              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-white/65">
                <span>منظومة التبادل الخارجي للوثائق والملفات</span>

                {isFetching && (
                  <span
                    className="
                      inline-flex items-center gap-1.5 rounded-full
                      border border-white/15 bg-white/10 px-2 py-0.5
                      text-[10px] font-black text-[#e2bf74]
                    "
                  >
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    تحديث
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div
            className="
              flex w-full items-center gap-2 overflow-x-auto
              pb-1 custom-scrollbar xl:w-auto xl:pb-0
            "
          >
            {topStats.map((stat, index) => (
              <TopStat key={index} stat={stat} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex w-full shrink-0 items-center gap-2 xl:w-auto">
            <button
              onClick={() => setShowSendModal(true)}
              className="
                flex h-11 flex-1 items-center justify-center gap-2
                rounded-2xl border border-white/15
                bg-white/10 px-4 text-xs font-black text-white
                shadow-[0_12px_28px_rgba(0,0,0,0.12)]
                transition-all hover:-translate-y-[1px] hover:bg-white/18
                xl:flex-none
              "
              type="button"
            >
              <Send className="h-4 w-4 text-[#e2bf74]" />
              إرسال صادر
            </button>

            <button
              onClick={() => setShowRequestModal(true)}
              className="
                flex h-11 flex-1 items-center justify-center gap-2
                rounded-2xl bg-[#e2bf74] px-4
                text-xs font-black text-[#082032]
                shadow-[0_12px_28px_rgba(226,191,116,0.25)]
                transition-all hover:-translate-y-[1px]
                hover:bg-[#f5d99b]
                xl:flex-none
              "
              type="button"
            >
              <Plus className="h-4 w-4" />
              طلب وارد
            </button>
          </div>
        </div>
      </header>

      {/* Mobile tabs */}
      <div
        className="
          relative z-10 shrink-0 border-b border-[#e8ddc8]
          bg-white/80 p-2 backdrop-blur-xl lg:hidden
        "
      >
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {sidebarTabs.map((tab) => (
            <MobileTab
              key={tab.id}
              tab={tab}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            />
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside
          className="
            hidden w-72 shrink-0 overflow-y-auto
            border-l border-[#d8b46a]/25
            bg-white/75 p-4 backdrop-blur-xl
            custom-scrollbar lg:block
          "
        >
          <div
            className="
              mb-4 rounded-[24px] border border-[#d8b46a]/30
              bg-gradient-to-br from-[#fbf8f1] via-white to-[#eef7f6]
              p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
            "
          >
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                <ShieldCheck className="h-5 w-5" />
              </span>

              <div>
                <p className="text-xs font-black text-[#123f59]">
                  لوحة التحكم
                </p>
                <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                  إدارة روابط الطلبات والحزم
                </p>
              </div>
            </div>
          </div>

          <div className="mb-2 px-2 text-[10px] font-black uppercase tracking-wider text-[#94a3b8]">
            القائمة الرئيسية
          </div>

          <div className="space-y-2">
            {sidebarTabs.map((tab) => (
              <SideTab
                key={tab.id}
                tab={tab}
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </aside>

        {/* Content */}
        <main className="min-w-0 flex-1 overflow-hidden p-2 sm:p-3">
          <div
            className="
              flex h-full flex-col overflow-hidden rounded-[28px]
              border border-[#d8b46a]/30 bg-white/82
              shadow-[0_18px_45px_rgba(18,63,89,0.10)]
              backdrop-blur-xl
            "
          >
            {(activeTab === "requests" || activeTab === "outbox") && (
              <RequestsTab
                activeTab={activeTab}
                requests={activeTab === "requests" ? requests : packages}
                setAnalyzingFile={setAnalyzingFile}
              />
            )}

            {activeTab === "inbox" && (
              <InboxTab
                inboxFiles={inbox}
                setAnalyzingFile={setAnalyzingFile}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab initialSettings={settings} refetch={refetch} />
            )}

            {activeTab === "stats" && <StatsTab stats={stats} />}

            {activeTab === "history" && <HistoryTab logs={logs} />}

            {activeTab === "templates" && <TemplatesTab />}
          </div>
        </main>
      </div>

      {/* Modals */}
      {showRequestModal && (
        <RequestLinkModal
          onClose={() => {
            setShowRequestModal(false);
            refetch();
          }}
        />
      )}

      {showSendModal && (
        <SendPackageModal
          onClose={() => {
            setShowSendModal(false);
            refetch();
          }}
        />
      )}

      {analyzingFile && (
        <div
          className="
            fixed inset-0 z-50 flex items-center justify-center
            bg-[#06111d]/70 p-4 backdrop-blur-md
          "
          dir="rtl"
        >
          <FileAnalysisPanel
            file={analyzingFile}
            onClose={() => setAnalyzingFile(null)}
            onApprove={() => {
              toast.success("تم تحليل وربط الملف بنجاح");
              refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}

const LoadingScreen = () => (
  <div
    className="
      relative flex h-full items-center justify-center overflow-hidden
      bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
      font-[Tajawal]
    "
    dir="rtl"
  >
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-[-140px] top-[-140px] h-96 w-96 rounded-full bg-[#123f59]/10 blur-3xl" />
      <div className="absolute left-[-140px] bottom-[-140px] h-96 w-96 rounded-full bg-[#c5983c]/16 blur-3xl" />
    </div>

    <div
      className="
        relative z-10 w-full max-w-sm overflow-hidden rounded-[32px]
        border border-[#d8b46a]/35 bg-white/90
        p-8 text-center shadow-[0_30px_90px_rgba(18,63,89,0.18)]
        backdrop-blur-xl
      "
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#fbf8f1]/70 via-white/45 to-[#eef7f6]/70" />

      <div className="relative z-10">
        <div
          className="
            mx-auto mb-5 grid h-20 w-20 place-items-center
            rounded-[28px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
            text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.22)]
          "
        >
          <Loader2 className="h-10 w-10 animate-spin" />
        </div>

        <h2 className="mb-2 text-xl font-black text-[#123f59]">
          جاري تحميل مركز الوثائق...
        </h2>

        <p className="text-sm font-bold leading-7 text-[#64748b]">
          يتم جلب بيانات الروابط، الحزم، الملفات، والسجل التشغيلي.
        </p>
      </div>
    </div>
  </div>
);

const TopStat = ({ stat }) => {
  const Icon = stat.icon;
  const tone = getTone(stat.tone);

  return (
    <div
      className={`
        flex min-w-[128px] shrink-0 items-center gap-2
        rounded-2xl border px-3 py-2
        backdrop-blur-md ${tone.headerCard}
      `}
    >
      <span
        className={`
          grid h-9 w-9 shrink-0 place-items-center
          rounded-xl border ${tone.iconSoft}
        `}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0">
        <span className="block truncate text-[9px] font-black text-white/70">
          {stat.label}
        </span>

        <span className="font-mono text-lg font-black leading-none text-white">
          {stat.count}
        </span>
      </div>
    </div>
  );
};

const SideTab = ({ tab, active, onClick }) => {
  const Icon = tab.icon;
  const tone = getTone(tab.tone);

  return (
    <button
      onClick={onClick}
      className={`
        group relative flex w-full items-center gap-3 rounded-[20px]
        border p-3 text-right transition-all
        hover:-translate-y-[1px]
        ${
          active
            ? `border-[#d8b46a]/45 bg-gradient-to-l from-[#123f59] to-[#0e7490] text-white shadow-[0_12px_28px_rgba(18,63,89,0.18)]`
            : "border-[#e8ddc8] bg-white text-[#64748b] hover:border-[#d8b46a]/45 hover:bg-[#fbf8f1] hover:text-[#123f59]"
        }
      `}
      type="button"
    >
      <span
        className={`
          grid h-10 w-10 shrink-0 place-items-center rounded-2xl
          ${
            active
              ? "bg-white/15 text-[#e2bf74]"
              : `${tone.iconSoft} group-hover:bg-white`
          }
        `}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`
            block truncate text-sm font-black
            ${active ? "text-white" : "text-[#123f59]"}
          `}
        >
          {tab.label}
        </span>

        <span
          className={`
            mt-0.5 block truncate text-[10px] font-bold
            ${active ? "text-white/60" : "text-[#94a3b8]"}
          `}
        >
          {tab.subLabel}
        </span>
      </span>

      {active && (
        <span className="absolute left-3 h-2 w-2 rounded-full bg-[#e2bf74]" />
      )}
    </button>
  );
};

const MobileTab = ({ tab, active, onClick }) => {
  const Icon = tab.icon;
  const tone = getTone(tab.tone);

  return (
    <button
      onClick={onClick}
      className={`
        flex min-w-[135px] shrink-0 items-center gap-2
        rounded-2xl border px-3 py-2 text-right transition-all
        ${
          active
            ? "border-[#d8b46a]/45 bg-[#123f59] text-white shadow-sm"
            : "border-[#e8ddc8] bg-white text-[#64748b]"
        }
      `}
      type="button"
    >
      <span
        className={`
          grid h-8 w-8 shrink-0 place-items-center rounded-xl
          ${active ? "bg-white/15 text-[#e2bf74]" : tone.iconSoft}
        `}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span className="min-w-0">
        <span className="block truncate text-[11px] font-black">
          {tab.label}
        </span>

        <span
          className={`block truncate text-[9px] font-bold ${
            active ? "text-white/60" : "text-[#94a3b8]"
          }`}
        >
          {tab.subLabel}
        </span>
      </span>
    </button>
  );
};

const getTone = (tone) => {
  const tones = {
    blue: {
      headerCard: "border-blue-300/20 bg-blue-400/12",
      iconSoft: "border-blue-200 bg-blue-50 text-blue-700",
    },
    amber: {
      headerCard: "border-amber-300/20 bg-amber-400/12",
      iconSoft: "border-amber-200 bg-amber-50 text-amber-700",
    },
    emerald: {
      headerCard: "border-emerald-300/20 bg-emerald-400/12",
      iconSoft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cyan: {
      headerCard: "border-cyan-300/20 bg-cyan-400/12",
      iconSoft: "border-cyan-200 bg-cyan-50 text-cyan-800",
    },
    purple: {
      headerCard: "border-purple-300/20 bg-purple-400/12",
      iconSoft: "border-purple-200 bg-purple-50 text-purple-700",
    },
    slate: {
      headerCard: "border-slate-300/20 bg-slate-400/12",
      iconSoft: "border-slate-200 bg-slate-100 text-slate-700",
    },
    rose: {
      headerCard: "border-rose-300/20 bg-rose-400/12",
      iconSoft: "border-rose-200 bg-rose-50 text-rose-700",
    },
  };

  return tones[tone] || tones.blue;
};