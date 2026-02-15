import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/layout/shell/Sidebar";
import { GlobalScreenTabs } from "./components/layout/shell/GlobalScreenTabs";
import { ScreenHeader } from "./components/layout/shell/ScreenHeader";
import { useAppStore } from "./stores/useAppStore";
import { 
  Search, Bell, Settings, LogOut, 
  User as UserIcon, Menu, ChevronDown 
} from "lucide-react";

// الشاشات
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import { TransactionsScreenWrapper } from "./pages/Transactions/TransactionsScreenWrapper";
import { ClientsScreenWrapper } from "./pages/Clients/ClientsScreenWrapper";
import { OwnershipScreenWrapper } from './pages/Property/OwnershipScreenWrapper';
import { SystemFooter } from "./components/layout/shell/SystemFooter";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading, logout } = useAuth(); // نفترض وجود دالة logout
  const { activeScreenId } = useAppStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">جاري تحميل النظام...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div
      className="flex h-screen bg-gray-50 direction-rtl font-sans text-right"
      dir="rtl"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col mr-[260px] h-screen overflow-hidden bg-[#f3f4f6]">
        
        {/* ==================================================================================
            1. Global Top Bar (الهيدر الرئيسي المطور)
        ================================================================================== */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0 z-30 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)]">
          
          {/* اليمين: البحث السريع */}
          <div className="flex items-center flex-1 max-w-xl gap-4">
            <div className="relative w-full max-w-md hidden md:block">
              <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="بحث عام (رقم معاملة، اسم عميل، رقم صك)..." 
                className="w-full bg-gray-50 hover:bg-gray-100 focus:bg-white border border-gray-200 rounded-full py-2 pr-10 pl-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              <div className="absolute left-2 top-2 text-[10px] text-gray-400 bg-white border px-1.5 rounded shadow-sm">⌘K</div>
            </div>
          </div>

          {/* اليسار: الإجراءات والملف الشخصي */}
          <div className="flex items-center gap-2">
            
            {/* منطقة الإشعارات والإعدادات */}
            <div className="flex items-center gap-1 pl-4 border-l border-gray-200 ml-4">
              <button className="relative p-2 text-gray-500 hover:bg-gray-100 hover:text-blue-600 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
              </button>
              <button className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-full transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* الملف الشخصي (Profile Dropdown Trigger) */}
            <div className="flex items-center gap-3 group cursor-pointer p-1.5 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <div className="text-left hidden sm:block leading-tight">
                <div className="text-sm font-bold text-gray-800">{user.name}</div>
                <div className="text-[10px] text-gray-500 font-medium">مهندس أول • مسؤول نظام</div>
              </div>
              
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center shadow-md shadow-blue-200 border-2 border-white">
                  <span className="font-bold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-3.5 h-3.5 border-2 border-white rounded-full"></div>
              </div>
              
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>

          </div>
        </header>

        {/* ==================================================================================
             نهاية الهيدر المطور
        ================================================================================== */}

        {/* Global Tabs Strip */}
        <GlobalScreenTabs />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth p-0 pb-10 mb-8">
          {/* هنا يظهر هيدر الشاشة الفرعي (مثل أزرار التحديث والوقت) */}
          {activeScreenId !== "DASH" && (
            <ScreenHeader screenId={activeScreenId} />
          )}

          <div className="min-h-full pb-10">
            <div
              className={activeScreenId === "DASH" ? "block h-full" : "hidden"}
            >
              <Dashboard />
            </div>
            <div
              className={activeScreenId === "055" ? "block h-full" : "hidden"}
            >
              <TransactionsScreenWrapper />
            </div>
            <div
              className={activeScreenId === "300" ? "block h-full" : "hidden"}
            >
              <ClientsScreenWrapper />
            </div>
            <div className={activeScreenId === "310" ? "block" : "hidden"}>
              <OwnershipScreenWrapper />
            </div>
          </div>
        </main>
        <SystemFooter />
      </div>
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;