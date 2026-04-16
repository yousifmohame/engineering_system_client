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
      // case "SET_HEADER": return <HeaderSettingsTab />;
      // case "SET_FOOTER": return <FooterSettingsTab />;
      default:
        return <SystemSettingsDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-2xl border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
