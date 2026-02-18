import React, { useState } from "react";
import OwnershipSidebar from "./OwnershipSidebar";
import { PropertyAIWorkspace } from "./PropertyAIWorkspace";
import DeedsLog from "./components/DeedsLog"; // 👈 استيراد


const OwnershipScreenWrapper = () => {
  const [activeTab, setActiveTab] = useState("log");

  const renderContent = () => {
    // إذا تم اختيار صك معين، اعرض التفاصيل بغض النظر عن التبويب (أو اجعلها تبويب منفصل)

    return <DeedsLog />;
  };

  return (
    <div className="flex h-full w-full bg-stone-100 overflow-hidden" dir="rtl">
      <OwnershipSidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== "details") setSelectedDeedId(null);
        }}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-2 rounded-lg border border-stone-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OwnershipScreenWrapper;
