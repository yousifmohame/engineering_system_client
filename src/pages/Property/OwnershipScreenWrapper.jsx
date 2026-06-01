import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import OwnershipSidebar from "./OwnershipSidebar";
import DeedsLog from "./components/DeedsLog";
import PropertiesDashboardTab from "./PropertiesDashboardTab";
import NewPropertyWizard from "./components/NewPropertyWizard";
import DeedDetailsTab from "./components/DeedDetailsTab";


const PROPERTY_NEW_DESIGN_STYLE = `
.property-new-design{
  --prop-navy:#0b2f3f;
  --prop-teal:#147785;
  --prop-gold:#d9b85b;
  --prop-ink:#123B5D;
  --prop-muted:#71839a;
  --prop-border:#d8e6ee;
  --prop-soft:#f7fbfd;
  --prop-cream:#fbf7ef;
  color:var(--prop-ink);
}
.property-new-design .custom-scrollbar::-webkit-scrollbar,
.property-new-design .custom-scrollbar-slim::-webkit-scrollbar{width:8px;height:8px}
.property-new-design .custom-scrollbar::-webkit-scrollbar-thumb,
.property-new-design .custom-scrollbar-slim::-webkit-scrollbar-thumb{background:#d9b85b;border-radius:999px}
.property-new-design .custom-scrollbar::-webkit-scrollbar-track,
.property-new-design .custom-scrollbar-slim::-webkit-scrollbar-track{background:#edf5f7}
.property-new-design h1,
.property-new-design h2,
.property-new-design h3,
.property-new-design h4{letter-spacing:-.02em}
.property-new-design input,
.property-new-design select,
.property-new-design textarea{
  border:1px solid var(--prop-border)!important;
  border-radius:16px!important;
  color:var(--prop-ink)!important;
  box-shadow:0 8px 18px rgba(8,54,70,.04)!important;
  outline:none!important;
}
.property-new-design input:focus,
.property-new-design select:focus,
.property-new-design textarea:focus{
  border-color:#d9b85b!important;
  box-shadow:0 0 0 3px rgba(217,184,91,.18)!important;
}
.property-new-design button{
  border-radius:16px!important;
  transition:.2s ease!important;
}
.property-new-design button:hover{transform:translateY(-1px)}
.property-new-design button[title]:not([title=""]):has(svg):not(:has(span)):not(:has(div)):after{
  content:attr(title);
  font-size:11px;
  font-weight:900;
  margin-inline-start:6px;
  white-space:nowrap;
}
.property-new-design .prop-page-header{
  background:linear-gradient(90deg,#0b2f3f 0%,#092838 62%,#071927 100%);
  border:1px solid rgba(217,184,91,.28);
  border-radius:20px;
  padding:10px 18px;
  box-shadow:0 12px 26px rgba(8,54,70,.14);
  color:#fff;
}
.property-new-design .prop-page-header h1,
.property-new-design .prop-page-header h2{
  color:#fff!important;
  font-size:16px!important;
  line-height:1.2!important;
  font-weight:800!important;
}
.property-new-design .prop-page-header p{
  color:rgba(255,255,255,.76)!important;
  font-size:10px!important;
  line-height:1.35!important;
  font-weight:700!important;
}
.property-new-design .prop-gold-icon{
  background:#d9b85b;
  color:#083646;
  border-radius:16px;
  display:flex;
  align-items:center;
  justify-content:center;
  box-shadow:0 8px 18px rgba(8,54,70,.1);
}
.property-new-design [class*="bg-gradient-to-r"],
.property-new-design [class*="bg-gradient-to-l"],
.property-new-design [class*="from-green"],
.property-new-design [class*="from-blue"],
.property-new-design [class*="from-indigo"],
.property-new-design [class*="from-emerald"]{
  border-color:rgba(217,184,91,.28)!important;
}
.property-new-design [class*="bg-[#083646]"],
.property-new-design [class*="bg-[#083646]"],
.property-new-design [class*="bg-[#083646]"],
.property-new-design [class*="bg-amber-600"],
.property-new-design [class*="bg-indigo-600"]{
  background:#083646!important;
  color:#fff!important;
  border:1px solid rgba(217,184,91,.35)!important;
}
.property-new-design [class*="text-[#0f6d7c]"],
.property-new-design [class*="text-emerald-600"],
.property-new-design [class*="text-[#0f6d7c]"],
.property-new-design [class*="text-[#0f6d7c]"]{color:#0f6d7c!important}
.property-new-design [class*="text-[#123B5D]"],
.property-new-design [class*="text-[#123B5D]"],
.property-new-design [class*="text-[#123B5D]"],
.property-new-design [class*="text-[#123B5D]"]{color:var(--prop-ink)!important}
.property-new-design [class*="text-[#71839a]"],
.property-new-design [class*="text-[#71839a]"],
.property-new-design [class*="text-[#71839a]"],
.property-new-design [class*="text-[#71839a]"]{color:var(--prop-muted)!important}
.property-new-design [class*="border-slate"],
.property-new-design [class*="border-stone"]{border-color:var(--prop-border)!important}
.property-new-design [class*="bg-[#f7fbfd]"],
.property-new-design [class*="bg-[#f7fbfd]"]{background:var(--prop-soft)!important}
.property-new-design [class*="rounded-xl"]{border-radius:14px!important}
.property-new-design [class*="rounded-xl"]{border-radius:18px!important}
.property-new-design table thead{background:#f3f8fb!important;color:var(--prop-ink)!important}
.property-new-design .fixed [class*="bg-white"]{
  border-color:var(--prop-border)!important;
}
.property-new-design .fixed h3,
.property-new-design .fixed h2{
  color:var(--prop-ink)!important;
}
.property-new-design .fixed [class*="from-green"],
.property-new-design .fixed [class*="to-green"],
.property-new-design .fixed [class*="bg-gradient"]{
  background:linear-gradient(90deg,#0b2f3f,#071927)!important;
  color:#fff!important;
}
.property-new-design .fixed [class*="bg-gradient"] h3,
.property-new-design .fixed [class*="bg-gradient"] h2{
  color:#fff!important;
}

/* Extra harmonization pass: old pages, sub-pages, modals and icon-only actions */
.property-new-design .text-2xl{font-size:1.25rem!important;line-height:1.3!important}
.property-new-design .text-3xl{font-size:1.45rem!important;line-height:1.25!important}
.property-new-design .text-4xl{font-size:1.65rem!important;line-height:1.2!important}
.property-new-design [class*="text-[28px]"],
.property-new-design [class*="text-[30px]"],
.property-new-design [class*="text-[32px]"]{font-size:20px!important;line-height:1.25!important}
.property-new-design [class*="p-8"]{padding:1.25rem!important}
.property-new-design [class*="p-6"]{padding:1rem!important}
.property-new-design [class*="rounded-3xl"]{border-radius:24px!important}

.property-new-design [class*="bg-slate-900"],
.property-new-design [class*="bg-slate-800"],
.property-new-design [class*="bg-slate-700"],
.property-new-design [class*="bg-gray-900"],
.property-new-design [class*="bg-gray-800"]{
  background:#083646!important;
  color:#fff!important;
  border-color:rgba(217,184,91,.35)!important;
}
.property-new-design [class*="bg-slate-200"],
.property-new-design [class*="bg-[#f7fbfd]"],
.property-new-design [class*="bg-gray-100"],
.property-new-design [class*="bg-[#f7fbfd]"]{
  background:#f7fbfd!important;
  color:var(--prop-ink)!important;
  border-color:var(--prop-border)!important;
}
.property-new-design [class*="text-[#123B5D]"],
.property-new-design [class*="text-[#123B5D]"],
.property-new-design [class*="text-gray-900"],
.property-new-design [class*="text-[#123B5D]"]{color:var(--prop-ink)!important}
.property-new-design [class*="text-[#52677e]"],
.property-new-design [class*="text-[#52677e]"],
.property-new-design [class*="text-gray-700"],
.property-new-design [class*="text-[#52677e]"]{color:#52677e!important}
.property-new-design [class*="text-[#71839a]"],
.property-new-design [class*="text-[#8aa0b4]"],
.property-new-design [class*="text-gray-500"],
.property-new-design [class*="text-gray-400"]{color:var(--prop-muted)!important}

.property-new-design [class*="bg-purple-600"],
.property-new-design [class*="bg-purple-700"],
.property-new-design [class*="bg-indigo-600"],
.property-new-design [class*="bg-indigo-700"],
.property-new-design [class*="bg-blue-600"],
.property-new-design [class*="bg-blue-700"]{
  background:#083646!important;
  color:#fff!important;
  border-color:rgba(217,184,91,.38)!important;
}
.property-new-design [class*="bg-purple-50"],
.property-new-design [class*="bg-indigo-50"],
.property-new-design [class*="bg-blue-50"],
.property-new-design [class*="bg-emerald-50"],
.property-new-design [class*="bg-amber-50"]{
  background:#fbf7ef!important;
  color:var(--prop-ink)!important;
  border-color:#ecd8a6!important;
}
.property-new-design [class*="bg-purple-100"],
.property-new-design [class*="bg-indigo-100"],
.property-new-design [class*="bg-blue-100"],
.property-new-design [class*="bg-emerald-100"],
.property-new-design [class*="bg-amber-100"]{
  background:#eef5f7!important;
  color:var(--prop-ink)!important;
  border-color:var(--prop-border)!important;
}
.property-new-design [class*="text-purple-700"],
.property-new-design [class*="text-purple-800"],
.property-new-design [class*="text-indigo-700"],
.property-new-design [class*="text-indigo-800"],
.property-new-design [class*="text-[#123B5D]"],
.property-new-design [class*="text-blue-800"]{color:var(--prop-ink)!important}

.property-new-design .fixed [class*="bg-white"][class*="rounded"],
.property-new-design [class*="bg-white"][class*="rounded"]{
  border-color:var(--prop-border)!important;
  box-shadow:0 12px 28px rgba(8,54,70,.07)!important;
}
.property-new-design .fixed [class*="border-b"]:first-child{
  min-height:auto!important;
}
.property-new-design .fixed button[title]:not([title=""]):has(svg):not(:has(span)):not(:has(div)):after,
.property-new-design button[aria-label]:not([aria-label=""]):has(svg):not(:has(span)):not(:has(div)):after{
  content:attr(title);
  font-size:11px;
  font-weight:900;
  margin-inline-start:6px;
  white-space:nowrap;
}
.property-new-design button:has(svg) span{white-space:nowrap}
.property-new-design table th{font-size:11px!important;color:var(--prop-muted)!important;font-weight:900!important}
.property-new-design table td{font-size:12px!important;color:var(--prop-ink)!important}
.property-new-design .prop-action-button{
  background:#083646!important;color:#fff!important;border:1px solid rgba(217,184,91,.38)!important;
  border-radius:16px!important;font-size:12px!important;font-weight:900!important;
  display:inline-flex!important;align-items:center!important;gap:.45rem!important;
}

`;

const OwnershipScreenWrapper = () => {
  const screenId = "310";
  const { screenTabs, activeTabPerScreen, setActiveTab, addTab, removeTab } =
    useAppStore();

  const tabs = screenTabs[screenId] || [];
  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_TAB";

  // دالة لفتح تفاصيل أي صك في تاب جديد (تظهر في الـ Header)
  const handleOpenDetails = (id, code) => {
    addTab(screenId, {
      id: `DEED-${id}`,
      title: code || "تفاصيل الصك",
      type: "details",
      deedId: id,
      closable: true,
    });
  };

  const handleOpenLog = () => {
    addTab(screenId, {
      id: "310-MAIN",
      title: "سجل الصكوك",
      type: "log",
      closable: true, // يمكنك جعله true ليتمكن المستخدم من إغلاقه والعودة للوحة فقط
    });
  };

  // دالة لفتح شاشة الإضافة في تاب جديد
  const handleOpenNewWizard = () => {
    addTab(screenId, {
      id: "NEW_DEED_TAB",
      title: "إنشاء ملكية جديدة",
      type: "wizard",
      closable: true,
    });
  };

  const renderContent = () => {
    const activeTab = tabs.find((t) => t.id === activeTabId);

    // 1. عرض لوحة القيادة
    if (activeTabId === "DASHBOARD_TAB") {
      return (
        <PropertiesDashboardTab
          onNavigate={(targetId) => {
            if (targetId === "new") handleOpenNewWizard();
            else if (targetId === "log") setActiveTab(screenId, "310-MAIN");
            else setActiveTab(screenId, targetId);
          }}
          onOpenDetails={handleOpenDetails}
        />
      );
    }

    // 2. عرض السجل
    if (activeTabId === "310-MAIN") {
      return <DeedsLog onOpenDetails={handleOpenDetails} />;
    }

    // 3. عرض شاشة التفاصيل (إذا كان التاب من نوع details)
    if (activeTab?.type === "details") {
      return (
        <DeedDetailsTab
          deedId={activeTab.deedId}
          onBack={() => removeTab(screenId, activeTab.id)}
        />
      );
    }

    // 4. عرض شاشة الإضافة (الويزارد)
    if (activeTabId === "NEW_DEED_TAB") {
      return (
        <NewPropertyWizard
          onComplete={(newDeed) => {
            removeTab(screenId, "NEW_DEED_TAB");
            if (newDeed) handleOpenDetails(newDeed.id, newDeed.code);
          }}
        />
      );
    }

    return <DeedsLog onOpenDetails={handleOpenDetails} />;
  };

  return (
    <div className="property-new-design flex h-full w-full bg-[#eef5f7] overflow-hidden" dir="rtl">
      <OwnershipSidebar
        activeTab={activeTabId}
        hasSelectedDeed={activeTabId?.startsWith("DEED-")}
        onTabChange={(id) => {
          if (id === "DASHBOARD_TAB") {
            setActiveTab(screenId, id);
          } else if (id === "310-MAIN") {
            handleOpenLog(); // 👈 فتح (إضافة) تاب السجل عند النقر
          } else if (id === "NEW_DEED_TAB") {
            handleOpenNewWizard(); // 👈 فتح (إضافة) تاب الإضافة
          }
        }}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-[28px] border border-[#d8e6ee] overflow-hidden relative">
        <style>{PROPERTY_NEW_DESIGN_STYLE}</style>
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnershipScreenWrapper;