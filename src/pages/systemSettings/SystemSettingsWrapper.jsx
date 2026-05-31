import React from "react";
import { useAppStore } from "../../stores/useAppStore";

// استيراد المكونات الفرعية
import SystemSettingsDashboard from "./SystemSettingsDashboard";
import SidebarSettingsTab from "./Screens/SidebarSettingsTab";
import ServerManagementTab from "./Screens/ServerManagementTab";
import SystemBackupTab from "./Screens/SystemBackupTab";
import HardwareMonitorTab from "./Screens/HardwareMonitorTab";
import TailscaleIntegrationScreen from "./Screens/tailscale/tailscalePage";
import DeviceManagementTab from "./Screens/DeviceManagementTab";
import AiSettings from "./Screens/AiSettings";


const SYSTEM_SETTINGS_STYLE = `
.system-settings-new-design{
  --sys-navy:#0b2f3f;
  --sys-teal:#147785;
  --sys-gold:#d9b85b;
  --sys-ink:#123b5d;
  --sys-muted:#6b7c91;
  --sys-border:#d8e6ee;
  --sys-soft:#f7fbfd;
  --sys-cream:#fbf7ef;
  color:#123b5d;
}
.system-settings-new-design .custom-scrollbar::-webkit-scrollbar{width:8px;height:8px}
.system-settings-new-design .custom-scrollbar::-webkit-scrollbar-thumb{background:#d9b85b;border-radius:99px}
.system-settings-new-design .custom-scrollbar::-webkit-scrollbar-track{background:#edf5f7}
.system-settings-new-design h1,
.system-settings-new-design h2,
.system-settings-new-design h3{color:var(--sys-ink)!important;letter-spacing:-.02em}
.system-settings-new-design input,
.system-settings-new-design select,
.system-settings-new-design textarea{
  background:#fff!important;border:1px solid var(--sys-border)!important;border-radius:16px!important;color:var(--sys-ink)!important;
  box-shadow:0 8px 18px rgba(8,54,70,.04)!important;outline:none!important;
}
.system-settings-new-design input:focus,
.system-settings-new-design select:focus,
.system-settings-new-design textarea:focus{border-color:#d9b85b!important;box-shadow:0 0 0 3px rgba(217,184,91,.18)!important}
.system-settings-new-design button{border-radius:18px!important;font-weight:900!important;transition:.2s ease!important}
.system-settings-new-design button[class*="bg-[#083646]"],
.system-settings-new-design button[class*="bg-indigo"],
.system-settings-new-design button[class*="bg-emerald"],
.system-settings-new-design button[class*="bg-green"],
.system-settings-new-design button[class*="from-emerald"],
.system-settings-new-design button[class*="from-blue"],
.system-settings-new-design button[class*="from-indigo"]{
  background:#083646!important;color:white!important;border:1px solid rgba(217,184,91,.45)!important;box-shadow:0 14px 30px rgba(8,54,70,.18)!important;
}
.system-settings-new-design button[class*="bg-white"],
.system-settings-new-design button[class*="bg-[#eef5f7]"]{
  background:#fff!important;color:var(--sys-ink)!important;border:1px solid var(--sys-border)!important;box-shadow:0 8px 18px rgba(8,54,70,.05)!important;
}
.system-settings-new-design button:hover{transform:translateY(-1px)}
.system-settings-new-design button[title]:not([title=""]):has(svg):not(:has(span)):not(:has(div)):after{
  content:attr(title);font-size:11px;font-weight:900;margin-inline-start:6px;white-space:nowrap;
}
.system-settings-new-design [class*="bg-white"][class*="rounded"]{border-color:var(--sys-border)!important}
.system-settings-new-design [class*="shadow"]{box-shadow:0 12px 28px rgba(8,54,70,.07)!important}
.system-settings-new-design [class*="bg-[#f7fbfd]"]{background:var(--sys-soft)!important}
.system-settings-new-design [class*="text-[#123B5D]"],
.system-settings-new-design [class*="text-[#123B5D]"],
.system-settings-new-design [class*="text-[#123B5D]"]{color:var(--sys-ink)!important}
.system-settings-new-design [class*="text-[#71839a]"],
.system-settings-new-design [class*="text-[#8aa0b4]"]{color:#71839a!important}
.system-settings-new-design [class*="border-slate"]{border-color:var(--sys-border)!important}
.system-settings-new-design [class*="rounded-[26px]"]{border-radius:28px!important}
.system-settings-new-design [class*="rounded-[22px]"]{border-radius:22px!important}
.system-settings-new-design [class*="fixed"][class*="inset-0"] > [class*="bg-white"],
.system-settings-new-design [class*="fixed"][class*="inset-0"] [class*="max-w"]{
  border-radius:24px!important;border:1px solid rgba(217,184,91,.35)!important;overflow:hidden!important;
}
.system-settings-new-design [class*="fixed"][class*="inset-0"] [class*="border-b"]:first-child,
.system-settings-new-design [class*="fixed"][class*="inset-0"] [class*="p-6"][class*="border-b"]{
  background:linear-gradient(90deg,#0b2f3f,#071927)!important;color:#fff!important;padding:10px 18px!important;min-height:auto!important;
}
.system-settings-new-design [class*="fixed"][class*="inset-0"] h2,
.system-settings-new-design [class*="fixed"][class*="inset-0"] h3{color:#fff!important}
.system-settings-new-design [class*="fixed"][class*="inset-0"] button[class*="p-2"]{min-width:42px!important;min-height:38px!important}
.system-settings-new-design table thead,
.system-settings-new-design [class*="bg-[#f7fbfd]"][class*="border-b"]{background:#f3f8fb!important;color:var(--sys-ink)!important}
.system-settings-new-design .sys-compact-page-header{
  background:linear-gradient(90deg,#0b2f3f 0%,#092838 62%,#071927 100%);border:1px solid rgba(217,184,91,.28);border-radius:18px;padding:7px 16px;
  box-shadow:0 10px 22px rgba(8,54,70,.14);color:#fff;margin-bottom:10px;min-height:52px;
}
.system-settings-new-design .sys-compact-page-header *{color:#fff!important}
.system-settings-new-design .sys-compact-page-header h1,
.system-settings-new-design .sys-compact-page-header h2,
.system-settings-new-design .sys-compact-page-header h3{font-size:16px!important;line-height:1.2!important;font-weight:800!important;letter-spacing:-.01em!important}
.system-settings-new-design .sys-compact-page-header p{font-size:9.5px!important;line-height:1.25!important;font-weight:600!important;color:rgba(255,255,255,.72)!important}
.system-settings-new-design .sys-compact-page-header svg.text-\[\#d9b85b\]{color:#d9b85b!important}
.system-settings-new-design .sys-card{
  background:#fff;border:1px solid var(--sys-border);border-radius:24px;box-shadow:0 12px 28px rgba(8,54,70,.06);
}

.system-settings-new-design > div{background:#eef5f7!important}
.system-settings-new-design .sys-module-header,
.system-settings-new-design [class*="bg-white"][class*="border-b"][class*="shadow-sm"]:not(table *):first-child{
  min-height:auto!important;
}
.system-settings-new-design [class*="bg-gradient-to-br"]{background:#083646!important;color:#fff!important}
.system-settings-new-design [class*="text-indigo"],
.system-settings-new-design [class*="text-blue"],
.system-settings-new-design [class*="text-purple"]{color:#123b5d!important}
.system-settings-new-design [class*="bg-indigo"],
.system-settings-new-design [class*="bg-blue-600"],
.system-settings-new-design [class*="bg-purple"]{background:#083646!important;color:#fff!important}
.system-settings-new-design [class*="border-indigo"],
.system-settings-new-design [class*="border-blue"]{border-color:#d8e6ee!important}
.system-settings-new-design [class*="shadow-indigo"],
.system-settings-new-design [class*="shadow-blue"],
.system-settings-new-design [class*="shadow-purple"]{box-shadow:0 12px 28px rgba(8,54,70,.08)!important}
.system-settings-new-design a{color:#0f6d7c!important;font-weight:800}

.system-settings-new-design [class*="bg-gradient-to-r"][class*="#0b2f3f"] h1,
.system-settings-new-design [class*="bg-gradient-to-r"][class*="#0b2f3f"] h2{font-size:16px!important;line-height:1.2!important}
.system-settings-new-design [class*="bg-gradient-to-r"][class*="#0b2f3f"] p{font-size:9.5px!important;line-height:1.25!important}

.system-settings-new-design :not(button)[class*="bg-indigo-50"],
.system-settings-new-design :not(button)[class*="bg-indigo-50/50"]{background:#eef2ff!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-indigo-100"]{background:#e0e7ff!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-blue-50"]{background:#eff6ff!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-blue-100"]{background:#dbeafe!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-emerald-50"]{background:#ecfdf5!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-emerald-100"]{background:#d1fae5!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-red-50"]{background:#fef2f2!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-red-100"]{background:#fee2e2!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-gray-50"]{background:#f8fafc!important;color:var(--sys-ink)!important}
.system-settings-new-design :not(button)[class*="bg-amber-100"]{background:#fef3c7!important;color:var(--sys-ink)!important}
.system-settings-new-design [class*="text-indigo-400"],
.system-settings-new-design [class*="text-indigo-500"],
.system-settings-new-design [class*="text-indigo-600"],
.system-settings-new-design [class*="text-indigo-700"]{color:#4f5f75!important}
.system-settings-new-design [class*="text-emerald-500"],
.system-settings-new-design [class*="text-emerald-600"],
.system-settings-new-design [class*="text-emerald-700"],
.system-settings-new-design [class*="text-emerald-800"]{color:#0f6d7c!important}
.system-settings-new-design [class*="text-blue-400"],
.system-settings-new-design [class*="text-blue-500"],
.system-settings-new-design [class*="text-blue-600"],
.system-settings-new-design [class*="text-blue-700"],
.system-settings-new-design [class*="text-blue-800"]{color:#123b5d!important}
.system-settings-new-design [class*="text-red-600"],
.system-settings-new-design [class*="text-red-700"],
.system-settings-new-design [class*="text-red-800"]{color:#9f1239!important}

.system-settings-new-design [class*="bg-gradient-to-l"] h1,
.system-settings-new-design [class*="bg-gradient-to-l"] h2,
.system-settings-new-design [class*="bg-gradient-to-l"] h3,
.system-settings-new-design [class*="bg-gradient-to-l"] .text-\[15px\],
.system-settings-new-design [class*="bg-gradient-to-l"] .text-\[16px\],
.system-settings-new-design [class*="bg-gradient-to-l"] .text-\[17px\],
.system-settings-new-design [class*="bg-gradient-to-l"] .text-\[18px\]{
  color:#ffffff!important;
  font-size:15px!important;
  line-height:1.2!important;
  font-weight:800!important;
  text-shadow:0 1px 2px rgba(0,0,0,.24)!important;
}
.system-settings-new-design [class*="bg-gradient-to-l"] p,
.system-settings-new-design [class*="bg-gradient-to-l"] .text-xs,
.system-settings-new-design [class*="bg-gradient-to-l"] .text-\[11px\],
.system-settings-new-design [class*="bg-gradient-to-l"] .text-\[12px\]{
  color:rgba(255,255,255,.84)!important;
  font-size:10.5px!important;
  line-height:1.35!important;
  font-weight:700!important;
}
.system-settings-new-design .text-2xl{font-size:1.25rem!important;line-height:1.28!important}
.system-settings-new-design .text-3xl{font-size:1.55rem!important;line-height:1.15!important}
.system-settings-new-design [class*="text-[32px]"]{font-size:28px!important;line-height:1!important}
.system-settings-new-design [class*="text-lg"][class*="font-black"]{line-height:1.25!important}
.system-settings-new-design [class*="bg-blue-50"],
.system-settings-new-design [class*="bg-red-50"],
.system-settings-new-design [class*="bg-emerald-50"]{border-color:var(--sys-border)!important}

`;


export default function SystemSettingsWrapper() {
  const screenId = "71"; // 💡 كود شاشة الإعدادات في useAppStore
  const { activeTabPerScreen, setActiveTab, addTab } = useAppStore();

  const activeTabId = activeTabPerScreen[screenId] || "DASHBOARD_SETTINGS";

  // دالة التنقل وإضافة التبويبات
  const handleNavigate = (targetId, title) => {
    addTab(screenId, {
      id: targetId,
      title: title,
      type: "panel",
      closable: true,
    });
    setActiveTab(screenId, targetId);
  };

  const renderContent = () => {
    switch (activeTabId) {
      case "SET_SIDEBAR":
        return <SidebarSettingsTab />;
      case "SET_SERVER":
        return <ServerManagementTab />;
      case "SET_BACKUP":
        return <SystemBackupTab />;
      case "SET_MONITOR":
        return <HardwareMonitorTab />;
      case "SET_TAILSCALE":
        return <TailscaleIntegrationScreen />;
      case "SET_DEVICES":
        return <DeviceManagementTab />;
      case "SET_AI":
        return <AiSettings />;
      // case "SET_HEADER": return <HeaderSettingsTab />;
      // case "SET_FOOTER": return <FooterSettingsTab />;
      default:
        return <SystemSettingsDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="system-settings-new-design flex h-full w-full bg-[#eef5f7] overflow-hidden" dir="rtl">
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-[28px] border border-[#d8e6ee] overflow-hidden relative">
        <style>{SYSTEM_SETTINGS_STYLE}</style>
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
