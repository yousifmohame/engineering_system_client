import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios"; // تأكد من مسار axios
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
} from "lucide-react";
import { toast } from "sonner";

// المكونات الفرعية المقسمة
import RequestLinkModal from "./Components/modals_screens/RequestLinkModal";
import SendPackageModal from "./Components/modals_screens/SendPackageModal";
import RequestsTab from "./Components/Tabs_screens/RequestsTab";
import InboxTab from "./Components/Tabs_screens/InboxTab";
import SettingsTab from "./Components/Tabs_screens/SettingsTab";
import StatsTab from "./Components/Tabs_screens/StatsTab";
import HistoryTab from "./Components/Tabs_screens/HistoryTab";
import TemplatesTab from "./Components/Tabs_screens/TemplatesTab"; // 🚀 استدعاء شاشة القوالب الحقيقية
import { FileAnalysisPanel } from "./Components/ai/FileAnalysisPanel";

export default function DocumentTransferCenter() {
  const [activeTab, setActiveTab] = useState("requests");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [analyzingFile, setAnalyzingFile] = useState(null);

  // 🚀 جلب البيانات الحقيقية من الباك إند
  const {
    data: centerData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["transfer-center-data"],
    queryFn: async () => {
      const res = await api.get("/transfer-center/dashboard");
      return res.data?.data;
    },
  });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-[11px] text-slate-500 font-bold">
            جاري تحميل مركز الوثائق...
          </p>
        </div>
      </div>
    );
  }

  const {
    requests = [],
    packages = [],
    inbox = [],
    logs = [],
    stats = {},
    settings = {},
  } = centerData || {};

  // تعريف التبويبات للشريط الجانبي مع أيقوناتها
  const sidebarTabs = [
    { id: "requests", label: "الطلبات النشطة (وارد)", icon: LinkIcon },
    { id: "inbox", label: "الملفات المستلمة", icon: Inbox },
    { id: "outbox", label: "الحزم الصادرة", icon: Send },
    { id: "templates", label: "القوالب المحفوظة", icon: LayoutTemplate },
    { id: "stats", label: "تقارير الأداء", icon: Activity },
    { id: "settings", label: "إعدادات المركز", icon: Settings },
    { id: "history", label: "سجل العمليات", icon: Clock },
  ];

  return (
    <div
      className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* 💡 الشريط العلوي المكثف (Ultra-Dense Top Bar) */}
      <header className="bg-white p-2 sm:px-4 sm:py-2.5 border-b border-slate-200 shrink-0 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 shadow-sm z-10">
        {/* العنوان */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md text-white">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              مركز الإرسال والاستقبال
            </h1>
            <p className="text-[9px] font-bold text-slate-500">
              منظومة التبادل الخارجي
            </p>
          </div>
        </div>

        {/* الإحصائيات المكثفة (Ultra-Compact Stats) */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar w-full xl:w-auto pb-1 xl:pb-0">
          {[
            {
              label: "روابط نشطة",
              count: stats.activeLinks || 0,
              icon: LinkIcon,
              color: "text-indigo-600",
              bg: "bg-indigo-50 border-indigo-100",
            },
            {
              label: "ملفات للفرز",
              count: stats.pendingFiles || 0,
              icon: Inbox,
              color: "text-amber-600",
              bg: "bg-amber-50 border-amber-100",
            },
            {
              label: "إجمالي المستلم",
              count: stats.totalReceived || 0,
              icon: Activity,
              color: "text-emerald-600",
              bg: "bg-emerald-50 border-emerald-100",
            },
            {
              label: "إجمالي الصادر",
              count: stats.totalSent || 0,
              icon: Send,
              color: "text-sky-600",
              bg: "bg-sky-50 border-sky-100",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border shrink-0 ${s.bg}`}
            >
              <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
              <div className="flex flex-col">
                <span
                  className={`text-[8px] font-black uppercase leading-none mb-0.5 ${s.color}`}
                >
                  {s.label}
                </span>
                <span className="text-[11px] font-black text-slate-800 leading-none">
                  {s.count}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex items-center gap-1.5 shrink-0 w-full xl:w-auto">
          <button
            onClick={() => setShowSendModal(true)}
            className="flex-1 xl:flex-none px-3 py-1.5 bg-slate-800 text-white rounded-lg text-[10px] font-black shadow-sm flex justify-center items-center gap-1.5 hover:bg-slate-700 transition"
          >
            <Send className="w-3 h-3" /> إرسال صادر
          </button>
          <button
            onClick={() => setShowRequestModal(true)}
            className="flex-1 xl:flex-none px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-black shadow-sm flex justify-center items-center gap-1.5 hover:bg-indigo-700 transition-all"
          >
            <Plus className="w-3 h-3" /> طلب وارد
          </button>
        </div>
      </header>

      {/* 💡 منطقة المحتوى الرئيسية مع الشريط الجانبي */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* الشريط الجانبي (Sidebar Tabs) */}
        <aside className="w-40 sm:w-48 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar">
          <div className="p-2 space-y-1">
            <div className="text-[9px] font-black text-slate-400 mb-2 px-2 mt-2 uppercase tracking-wider">
              القائمة الرئيسية
            </div>
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-[10px] sm:text-[11px] font-black rounded-lg transition-colors text-right ${
                  activeTab === tab.id
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent"
                }`}
              >
                <tab.icon
                  className={`w-3.5 h-3.5 shrink-0 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`}
                />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* منطقة عرض المحتوى (Content Pane) */}
        <div className="flex-1 bg-slate-50/50 p-2 sm:p-3 flex flex-col overflow-hidden min-w-0">
          <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
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

            {/* 🚀 تم استبدال الـ EmptyState بالمكون الفعلي TemplatesTab */}
            {activeTab === "templates" && <TemplatesTab />}
          </div>
        </div>
      </div>

      {/* 💡 Modals & AI Panels */}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <FileAnalysisPanel
            file={analyzingFile}
            onClose={() => setAnalyzingFile(null)}
            onApprove={(res) => {
              toast.success("تم تحليل وربط الملف بنجاح");
              refetch();
            }}
          />
        </div>
      )}
    </div>
  );
}
