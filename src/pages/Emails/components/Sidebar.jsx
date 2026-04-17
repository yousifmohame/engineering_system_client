import React from "react";
import { MailPlus, Inbox, Star, Send, Archive, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  currentView,
  setCurrentView,
  setSelectedMessage,
  unreadCount,
  handleCompose,
}) {
  const menuItems = [
    { id: "inbox", label: "الوارد", icon: Inbox, badge: unreadCount },
    { id: "starred", label: "المهم", icon: Star },
    { id: "sent", label: "الصادر", icon: Send },
    { id: "archived", label: "الأرشيف", icon: Archive },
    { id: "drafts", label: "المسودات", icon: MailPlus },
    { id: "trash", label: "المهملات", icon: Trash2 },
  ];

  return (
    <aside
      className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? "w-20" : "w-64"
      } shrink-0 z-10`}
    >
      <div className="p-4">
        <button
          onClick={() => handleCompose("new")}
          className={`w-full bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 ${
            isSidebarCollapsed ? "h-12" : "h-12 px-6"
          }`}
        >
          <MailPlus className="w-5 h-5" />
          {!isSidebarCollapsed && <span>رسالة جديدة</span>}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentView(item.id);
              setSelectedMessage(null);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
              currentView === item.id
                ? "bg-blue-50 text-blue-700 font-bold"
                : "text-gray-600 hover:bg-gray-100"
            } ${isSidebarCollapsed ? "justify-center" : ""}`}
          >
            <item.icon
              className={`w-5 h-5 ${currentView === item.id ? "text-blue-600" : ""}`}
            />
            {!isSidebarCollapsed && (
              <>
                <span className="flex-1 text-right text-sm">{item.label}</span>
                {item.badge > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
        >
          {isSidebarCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}