import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useAppStore } from "./stores/useAppStore";
import { Toaster } from "sonner"; 

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
import Screen942_DocumentTypes from "./pages/Settings/Screen942_DocumentTypes"; 
import QuotationsScreenWrapper from "./pages/Quotations/QuotationsScreenWrapper";
import EmployeesManagement from "./pages/employees/EmployeesManagement";

// --- Icons & Context ---
import { Wrench } from "lucide-react"; // 👈 استيراد أيقونة شاشة الصيانة
import SystemHeader from "./components/layout/shell/SystemHeader";
import { PermissionBuilderProvider } from "./context/PermissionBuilderContext";
import PermissionBuilderToolbar from "./components/PermissionBuilderToolbar";

const queryClient = new QueryClient();

// ==========================================
// 👈 مكون شاشة "قيد التطوير" (Coming Soon)
// ==========================================
const ComingSoonScreen = ({ screenId }) => (
  <div className="flex-1 flex flex-col items-center justify-center bg-[#f3f4f6] p-6 text-center h-full animate-in fade-in duration-500">
    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm max-w-md w-full relative overflow-hidden">
      {/* تأثيرات خلفية خفيفة */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-slate-50 rounded-tr-full -z-10"></div>

      <div className="w-20 h-20 bg-blue-50 border-8 border-white shadow-sm text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
        <Wrench size={32} className="animate-[spin_4s_linear_infinite]" />
      </div>
      
      <h2 className="text-2xl font-black text-slate-800 mb-2">هذه الشاشة قيد التطوير</h2>
      <p className="text-slate-500 mb-6 text-sm leading-relaxed">
        نحن نعمل بجد لإتاحة هذه الميزة في التحديثات القادمة للنظام. شكراً لثقتكم وتفهمكم.
      </p>
      
      <div className="inline-flex flex-col gap-1 items-center">
        <div className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-widest font-mono border border-slate-200">
          Coming Soon
        </div>
        <div className="text-[10px] text-slate-400 font-mono mt-2">
          Screen Code: {screenId || "UNKNOWN"}
        </div>
      </div>
    </div>
  </div>
);

const AppContent = () => {
  const { user, loading } = useAuth();
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

  // 👈 قائمة بأكواد الشاشات التي قمت ببرمجتها بالفعل
  const implementedScreens = ["DASH", "055", "300", "310", "817", "815", "942", "SET"];
  // فحص هل الشاشة المطلوبة مبرمجة أم لا
  const isImplemented = implementedScreens.includes(activeScreenId);

  return (
    <div className="flex h-screen bg-gray-50 direction-rtl font-sans text-right" dir="rtl">
      <Sidebar />

      {/* المحتوى الرئيسي */}
      {/* 👈 تم تعديل الهامش إلى mr-[280px] ليتطابق مع السايدبار الجديد */}
      <div className="flex-1 flex flex-col mr-[280px] h-screen overflow-hidden bg-[#f3f4f6]">
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

          <div className="flex-1 overflow-auto p-0 pb-8 scroll-smooth relative h-full">
            
            {/* --- الشاشات المبرمجة --- */}
            <div className={activeScreenId === "DASH" ? "block h-full" : "hidden"}><Dashboard /></div>
            <div className={activeScreenId === "055" ? "block h-full" : "hidden"}><TransactionsScreenWrapper /></div>
            <div className={activeScreenId === "300" ? "block h-full" : "hidden"}><ClientsScreenWrapper /></div>
            <div className={activeScreenId === "310" ? "block h-full" : "hidden"}><OwnershipScreenWrapper /></div>
            <div className={activeScreenId === "817" ? "block h-full" : "hidden"}><EmployeesManagement /></div>
            <div className={activeScreenId === "815" ? "block h-full" : "hidden"}><QuotationsScreenWrapper /></div>
            <div className={activeScreenId === "942" ? "block h-full" : "hidden"}><Screen942_DocumentTypes /></div>
            <div className={activeScreenId === "SET" ? "block h-full" : "hidden"}><ServerSettings /></div>

            {/* --- 👈 السحر هنا: شاشة Fallback لأي كود غير مبرمج --- */}
            {!isImplemented && (
              <div className="block h-full">
                <ComingSoonScreen screenId={activeScreenId} />
              </div>
            )}

          </div>
        </main>
        <SystemFooter />
      </div>

      <Toaster richColors position="top-center" />
    </div>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionBuilderProvider>
          <AppContent />
          <PermissionBuilderToolbar />
        </PermissionBuilderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;