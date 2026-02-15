import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import ClientManagement from "./ClientManagement";

export const ClientsScreenWrapper = () => {
  const { activeTabPerScreen } = useAppStore();
  const activeTabId = activeTabPerScreen["300"];

  // هذا المكون الآن يعمل كـ "بوابة"
  // بما أن ClientManagement أصبح يحتوي على SidebarMenu و renderContent بداخله
  // فنحن نحتاج فقط لعرض ClientManagement وهو سيتكفل بالباقي بناءً على activeTabId

  return (
    <div className="h-full w-full bg-gray-50/50">
      <ClientManagement />
    </div>
  );
};
