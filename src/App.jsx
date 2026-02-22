import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useAppStore } from "./stores/useAppStore";
import { Toaster } from "sonner"; // 👈 1. استيراد المكون

// --- Components (Layout & Shell) ---
import Sidebar from "./components/layout/shell/Sidebar";
import GlobalScreenTabs from "./components/layout/shell/GlobalScreenTabs";
import ScreenHeader from "./components/layout/shell/ScreenHeader";
import SystemFooter from "./components/layout/shell/SystemFooter";
import ServerSettings from "./components/ServerSettings";
// --- Pages / Screens ---
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransactionsScreenWrapper from "./pages/Transactions/TransactionsScreenWrapper";
import ClientsScreenWrapper from "./pages/Clients/ClientsScreenWrapper";
import OwnershipScreenWrapper from "./pages/Property/OwnershipScreenWrapper";
import Screen942_DocumentTypes from "./pages/Settings/Screen942_DocumentTypes"; // تأكد من استيراد الشاشة الجديدة

// --- Icons ---
import { Search, Bell, Settings, ChevronDown } from "lucide-react";
import SystemHeader from "./components/layout/shell/SystemHeader";

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, loading } = useAuth();
  const { activeScreenId } = useAppStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 text-sm font-medium">
          جاري تحميل النظام...
        </p>
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

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col mr-[260px] h-screen overflow-hidden bg-[#f3f4f6]">
        {" "}
        {/* ================= Header ================= */}
        <SystemHeader />
        {/* ================= Tabs Strip ================= */}
        <GlobalScreenTabs />
        {/* ================= Main Content Viewport ================= */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {activeScreenId !== "DASH" && (
            <div className="shrink-0">
              <ScreenHeader screenId={activeScreenId} />
            </div>
          )}

          <div className="flex-1 overflow-auto p-0 pb-8 scroll-smooth">
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
            <div
              className={activeScreenId === "310" ? "block h-full" : "hidden"}
            >
              <OwnershipScreenWrapper />
            </div>

            {/* ✅ إضافة شاشة المستندات هنا */}
            <div
              className={activeScreenId === "942" ? "block h-full" : "hidden"}
            >
              <Screen942_DocumentTypes />
            </div>
            {/* 👈 2. عرض شاشة الإعدادات عندما يكون activeScreenId هو "SET" */}
            <div className={activeScreenId === "SET" ? "block h-full" : "hidden"}>
              <ServerSettings />
            </div>
          </div>
        </main>
        <SystemFooter />
      </div>

      {/* 👈 2. إضافة مكون التنبيهات هنا ليظهر فوق كل شيء */}
      <Toaster richColors position="top-center" />
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
