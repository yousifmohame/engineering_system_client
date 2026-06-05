import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import ClientsDashboard from "./ClientsDashboard";
import CreateClientPanel from "./screens/CreateClientPanel";
import ClientsPanel from "./screens/ClientsPanel";
import ClientFileView from "./components/clientDetails/ClientFileView";
// 👇 1. استيراد اللوحات الجديدة التي قمنا بإنشائها
import ClientsRatingsPanel from "./screens/ClientsRatingsPanel";
import ClientsDocsPanel from "./screens/ClientsDocsPanel";

const CLIENTS_NEW_DESIGN_STYLE = `
.clients-new-design{
  --c-navy:#083646;
  --c-navy-2:#071927;
  --c-teal:#0f6d7c;
  --c-gold:#d9b85b;
  --c-ink:#123B5D;
  --c-muted:#71839a;
  --c-border:#d8e6ee;
  --c-soft:#f7fbfd;
  --c-cream:#fbf7ef;
  color:var(--c-ink);
  font-family:Tajawal, Cairo, sans-serif;
}
.clients-new-design .custom-scrollbar::-webkit-scrollbar,
.clients-new-design .custom-scrollbar-slim::-webkit-scrollbar{width:8px;height:8px}
.clients-new-design .custom-scrollbar::-webkit-scrollbar-thumb,
.clients-new-design .custom-scrollbar-slim::-webkit-scrollbar-thumb{background:var(--c-gold);border-radius:99px}
.clients-new-design .custom-scrollbar::-webkit-scrollbar-track,
.clients-new-design .custom-scrollbar-slim::-webkit-scrollbar-track{background:#edf5f7}
.clients-new-design h1,.clients-new-design h2,.clients-new-design h3,.clients-new-design h4{color:var(--c-ink)!important;letter-spacing:-.02em}
.clients-new-design input,.clients-new-design select,.clients-new-design textarea{
  background:#fff!important;border:1px solid var(--c-border)!important;border-radius:16px!important;color:var(--c-ink)!important;
  box-shadow:0 8px 18px rgba(8,54,70,.04)!important;outline:none!important;
}
.clients-new-design input:focus,.clients-new-design select:focus,.clients-new-design textarea:focus{border-color:var(--c-gold)!important;box-shadow:0 0 0 3px rgba(217,184,91,.18)!important}
.clients-new-design button{border-radius:16px!important;font-weight:900!important;transition:.18s ease!important}
.clients-new-design button:hover{transform:translateY(-1px)}
.clients-new-design button[title]:has(svg):not(:has(span)):not(:has(div))::after{
  content:attr(title);font-size:11px;font-weight:900;margin-inline-start:6px;white-space:nowrap;line-height:1;
}
.clients-new-design button[aria-label]:has(svg):not(:has(span)):not(:has(div))::after{
  content:attr(aria-label);font-size:11px;font-weight:900;margin-inline-start:6px;white-space:nowrap;line-height:1;
}
.clients-new-design [class*="bg-white"][class*="rounded"]{border-color:var(--c-border)!important}
.clients-new-design [class*="shadow"]{box-shadow:0 12px 28px rgba(8,54,70,.07)!important}
.clients-new-design [class*="bg-slate-50"],.clients-new-design [class*="bg-gray-50"]{background:var(--c-soft)!important}
.clients-new-design [class*="border-slate"],.clients-new-design [class*="border-gray"]{border-color:var(--c-border)!important}
.clients-new-design [class*="text-slate-"],.clients-new-design [class*="text-gray-"]{color:var(--c-muted)!important}
.clients-new-design [class*="text-blue"],.clients-new-design [class*="text-indigo"],.clients-new-design [class*="text-violet"],.clients-new-design [class*="text-purple"]{color:var(--c-ink)!important}
.clients-new-design [class*="bg-blue-600"],.clients-new-design [class*="bg-indigo"],.clients-new-design [class*="bg-violet"],.clients-new-design [class*="bg-purple"],.clients-new-design [class*="bg-slate-800"],.clients-new-design [class*="bg-slate-700"]{background:var(--c-navy)!important;color:white!important;border:1px solid rgba(217,184,91,.35)!important}
.clients-new-design [class*="bg-blue-50"],.clients-new-design [class*="bg-indigo-50"],.clients-new-design [class*="bg-violet-50"],.clients-new-design [class*="bg-purple-50"]{background:#eef5f7!important;color:var(--c-ink)!important;border-color:var(--c-border)!important}
.clients-new-design [class*="bg-emerald"],.clients-new-design [class*="bg-green"]{border-color:#b9ead3!important}
.clients-new-design [class*="rounded-2xl"]{border-radius:24px!important}
.clients-new-design [class*="rounded-3xl"]{border-radius:28px!important}
.clients-new-design [class*="fixed"][class*="inset-0"] > [class*="bg-white"],
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="max-w"],
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="h-[95vh]"]{
  border-radius:24px!important;border:1px solid rgba(217,184,91,.28)!important;overflow:hidden!important;
}
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child,
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="px-6"][class*="py-4"]{
  background:linear-gradient(90deg,var(--c-navy-2),var(--c-navy))!important;color:#fff!important;padding:12px 18px!important;min-height:auto!important;
}
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child h1,
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child h2,
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child h3,
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child p{color:#fff!important}
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child h2{font-size:16px!important;line-height:1.2!important;font-weight:800!important}
.clients-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child p{font-size:10px!important;color:rgba(255,255,255,.75)!important}
.clients-new-design table thead,.clients-new-design [class*="bg-slate-100"]{background:#f3f8fb!important;color:var(--c-ink)!important}
.clients-new-design th{font-size:12px!important;font-weight:900!important;color:var(--c-muted)!important;padding-top:10px!important;padding-bottom:10px!important}
.clients-new-design td{font-size:12px!important;padding-top:10px!important;padding-bottom:10px!important;color:var(--c-ink)!important}
.clients-new-design .clients-compact-header{
  background:linear-gradient(90deg,#0b2f3f 0%,#092838 62%,#071927 100%);border:1px solid rgba(217,184,91,.28);border-radius:20px;padding:10px 18px;
  box-shadow:0 12px 24px rgba(8,54,70,.14);color:#fff;margin-bottom:12px;min-height:64px;
}
.clients-new-design .clients-compact-header *{color:#fff!important}
.clients-new-design .clients-compact-header h1,.clients-new-design .clients-compact-header h2{font-size:16px!important;line-height:1.2!important;font-weight:800!important}
.clients-new-design .clients-compact-header p{font-size:10px!important;line-height:1.3!important;color:rgba(255,255,255,.76)!important}
.clients-new-design .text-3xl{font-size:1.45rem!important;line-height:1.1!important}
.clients-new-design .text-2xl{font-size:1.25rem!important;line-height:1.2!important}
.clients-new-design .p-6{padding:1rem!important}
.clients-new-design .p-8{padding:1.25rem!important}


/* Compact clients log filters and table redesign */
.clients-new-design .clients-log-filters{
  padding:10px 14px!important;
  border-radius:22px!important;
  background:rgba(255,255,255,.92)!important;
  border:1px solid var(--c-border)!important;
  box-shadow:0 10px 24px rgba(8,54,70,.06)!important;
}
.clients-new-design .clients-log-filters input,
.clients-new-design .clients-log-filters select{
  height:42px!important;
  min-height:42px!important;
  font-size:12px!important;
  border-radius:16px!important;
}
.clients-new-design .clients-log-filters button{
  height:42px!important;
  min-height:42px!important;
  padding:0 14px!important;
  font-size:12px!important;
  display:inline-flex!important;
  align-items:center!important;
  gap:7px!important;
}
.clients-new-design .clients-log-table{
  border-radius:22px!important;
  border:1px solid var(--c-border)!important;
  background:white!important;
  box-shadow:0 12px 28px rgba(8,54,70,.06)!important;
}
.clients-new-design .clients-log-table table{border-collapse:separate!important;border-spacing:0!important;min-width:1180px!important}
.clients-new-design .clients-log-table thead tr{background:var(--c-navy)!important}
.clients-new-design .clients-log-table thead th{
  background:var(--c-navy)!important;
  color:#fff!important;
  font-size:12px!important;
  font-weight:900!important;
  padding:11px 10px!important;
  line-height:1.25!important;
  border-color:rgba(255,255,255,.16)!important;
  white-space:nowrap!important;
}
.clients-new-design .clients-log-table tbody td{
  padding:8px 10px!important;
  font-size:11.5px!important;
  line-height:1.25!important;
  border-color:#e6eef3!important;
  vertical-align:middle!important;
}
.clients-new-design .clients-log-table tbody tr{height:48px!important}
.clients-new-design .clients-log-table tbody tr:nth-child(odd){background:#fff!important}
.clients-new-design .clients-log-table tbody tr:nth-child(even){background:#f9fcfd!important}
.clients-new-design .clients-log-table tbody tr:hover{background:#eef7fb!important}
.clients-new-design .clients-log-table .client-row-actions{
  opacity:1!important;
  display:flex!important;
  justify-content:center!important;
  align-items:center!important;
  gap:6px!important;
  flex-wrap:nowrap!important;
}
.clients-new-design .clients-log-table .client-row-actions button{
  height:30px!important;
  min-height:30px!important;
  padding:0 8px!important;
  font-size:10px!important;
  border-radius:10px!important;
  white-space:nowrap!important;
}
.clients-new-design .clients-log-table .client-row-actions svg{width:13px!important;height:13px!important}
.clients-new-design .clients-log-table .client-name-cell{max-width:220px!important;min-width:170px!important}

`;

const ClientsScreenWrapper = () => {
  const screenId = "300";

  const { activeTabPerScreen, setActiveTab, addTab, removeTab } = useAppStore();
  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_CLIENTS";

  // 👇 2. تحديث دالة التنقل لدعم التابات الجديدة
  const handleNavigate = (targetId) => {
    switch (targetId) {
      case "NEW_CLIENT_TAB":
        addTab(screenId, {
          id: "NEW_CLIENT_TAB",
          title: "إنشاء عميل جديد",
          type: "wizard",
          closable: true,
        });
        setActiveTab(screenId, "NEW_CLIENT_TAB");
        break;
      case "300-MAIN":
        addTab(screenId, {
          id: "300-MAIN",
          title: "دليل العملاء",
          type: "list",
          closable: true,
        });
        setActiveTab(screenId, "300-MAIN");
        break;
      case "CLIENTS_RATINGS":
        addTab(screenId, {
          id: "CLIENTS_RATINGS",
          title: "تقييمات وتصنيفات",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "CLIENTS_RATINGS");
        break;
      case "CLIENTS_DOCS":
        addTab(screenId, {
          id: "CLIENTS_DOCS",
          title: "وثائق العملاء المركزية",
          type: "panel",
          closable: true,
        });
        setActiveTab(screenId, "CLIENTS_DOCS");
        break;
      default:
        setActiveTab(screenId, targetId);
    }
  };

  const renderContent = () => {
    // حالة: إنشاء عميل جديد
    if (activeTabId === "NEW_CLIENT_TAB") {
      return (
        <CreateClientPanel
          onComplete={() => {
            removeTab(screenId, "NEW_CLIENT_TAB");
            handleNavigate("300-MAIN");
          }}
        />
      );
    }

    // حالة: دليل العملاء
    if (activeTabId === "300-MAIN") {
      return (
        <ClientsPanel
          onOpenDetails={(clientId, clientCode) => {
            const tabId = `CLIENT-${clientId}`;
            addTab(screenId, {
              id: tabId,
              title: `ملف: ${clientCode}`,
              type: "details",
              clientId: clientId,
              closable: true,
            });
            setActiveTab(screenId, tabId);
          }}
        />
      );
    }

    // حالة: ملف العميل الفردي
    if (activeTabId?.startsWith("CLIENT-")) {
      const clientId = activeTabId.replace("CLIENT-", "");
      return (
        <ClientFileView
          clientId={clientId}
          onBack={() => {
            removeTab(screenId, activeTabId);
            setActiveTab(screenId, "300-MAIN");
          }}
        />
      );
    }

    // 👇 3. إضافة الحالات الجديدة للوحات
    if (activeTabId === "CLIENTS_RATINGS") {
      return (
        <div className="p-6 h-full overflow-y-auto">
          <ClientsRatingsPanel />
        </div>
      );
    }

    if (activeTabId === "CLIENTS_DOCS") {
      return (
        <div className="p-6 h-full overflow-y-auto">
          <ClientsDocsPanel />
        </div>
      );
    }

    // الحالة الافتراضية: لوحة التحكم (Dashboard)
    return <ClientsDashboard onNavigate={handleNavigate} />;
  };

  return (
    <div
      className="clients-new-design flex h-full w-full bg-[#eef5f7] overflow-hidden"
      dir="rtl"
    >
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-[28px] border border-[#d8e6ee] overflow-hidden relative">
        <style>{CLIENTS_NEW_DESIGN_STYLE}</style>
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ClientsScreenWrapper;
