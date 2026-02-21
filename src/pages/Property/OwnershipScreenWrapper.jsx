import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import OwnershipSidebar from "./OwnershipSidebar";
import DeedsLog from "./components/DeedsLog";
import PropertiesDashboardTab from "./PropertiesDashboardTab";
import NewPropertyWizard from "./components/NewPropertyWizard";
import DeedDetailsTab from "./components/DeedDetailsTab";

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
    <div className="flex h-full w-full bg-stone-100 overflow-hidden" dir="rtl">
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

      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-2 rounded-lg border border-stone-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnershipScreenWrapper;
