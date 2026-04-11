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

// --- Pages / Screens ---
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import TransactionsScreenWrapper from "./pages/Transactions/TransactionsScreenWrapper";
import ClientsScreenWrapper from "./pages/Clients/ClientsScreenWrapper";
import OwnershipScreenWrapper from "./pages/Property/OwnershipScreenWrapper";
import Screen942_DocumentTypes from "./pages/Settings/Screen942_DocumentTypes"; 
import QuotationsScreenWrapper from "./pages/Quotations/QuotationsScreenWrapper";
import EmployeesManagement from "./pages/employees/EmployeesManagement";
import RiyadhDivisionScreen from "./pages/Riyadh/RiyadhDivisionScreen";
import Screen40_Sectors from "./pages/Riyadh/Screen40_Sectors";
import Screen41_Districts from "./pages/Riyadh/Screen41_Districts";
import ContractsScreen from "./pages/Contracts/ContractsScreen";
import {Screen860IntermediaryOffices} from "./pages/intermediaryOfficesPage";
import BrokersPage from "./pages/BrokersPage";
import PartnersPage from "./pages/PartnersPage";
import HardwareMonitor from "./pages/systemSettings/HardwareMonitor";
import SystemBackup from "./pages/systemSettings/SystemBackup";
import SystemSettings from "./pages/systemSettings/SystemSettings";
import BuildingPermitsRegistry from "./pages/Permits/BuildingPermitsRegistry";
import OurOfficePermits from "./pages/Permits/OurOfficePermits";
import TransactionsDashboard from "./pages/Transactions/TransactionsDashboard";
import HRDashboard from "./pages/Hr/HRDashboard";
import SystemFilesExplorer from "./pages/FilesExplorer/SystemFilesExplorer";
import EmailNotificationsCenter from "./pages/Emails/NotificationsCenter";
import InboxCenter from "./pages/Emails/InboxCenter";
import FileRequest from "./pages/Emails/FileRequest";
import EmailSettingsScreen from "./pages/Emails/EmailSettingsScreen";
import TailscalePage from "./pages/tailscale/tailscalePage";
import QuickLinksScreen from "./pages/QuickLinksScreen";
import ReferenceLibraryScreen from "./pages/Reference/ReferenceLibraryScreen";
import ContractsManagementScreen from "./pages/ContractsManagement/ContractsManagementScreen";
import OfficeNotepadScreen from "./pages/OfficeNotepad/OfficeNotepadScreen";

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
  const implementedScreens = ["01","DASH", "055", "300", "310", "817", "815", "942", "SET", "39", "40", "41", "222", "30", "31", "32", "71", "73", "74", "09", "0010", "10", "88", "16", "98", "99", "100", "101", "83", "109", "112", "170", "030"];
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
          {activeScreenId !== "01" && (
            <div className="shrink-0">
              <ScreenHeader screenId={activeScreenId} />
            </div>
          )}

          <div className="flex-1 overflow-auto p-0 pb-8 scroll-smooth relative h-full">
            
            {/* --- الشاشات المبرمجة --- */}
            <div className={activeScreenId === "01" ? "block h-full" : "hidden"}><Dashboard /></div>
            <div className={activeScreenId === "DASH" ? "block h-full" : "hidden"}><Dashboard /></div>
            <div className={activeScreenId === "055" ? "block h-full" : "hidden"}><TransactionsScreenWrapper /></div>
            <div className={activeScreenId === "300" ? "block h-full" : "hidden"}><ClientsScreenWrapper /></div>
            <div className={activeScreenId === "310" ? "block h-full" : "hidden"}><OwnershipScreenWrapper /></div>
            <div className={activeScreenId === "817" ? "block h-full" : "hidden"}><EmployeesManagement /></div>
            <div className={activeScreenId === "815" ? "block h-full" : "hidden"}><QuotationsScreenWrapper /></div>
            <div className={activeScreenId === "942" ? "block h-full" : "hidden"}><Screen942_DocumentTypes /></div>
            <div className={activeScreenId === "39" ? "block h-full" : "hidden"}><RiyadhDivisionScreen /></div>
            <div className={activeScreenId === "40" ? "block h-full" : "hidden"}><Screen40_Sectors /></div>
            <div className={activeScreenId === "41" ? "block h-full" : "hidden"}><Screen41_Districts /></div>
            <div className={activeScreenId === "222" ? "block h-full" : "hidden"}><ContractsScreen /></div>
            <div className={activeScreenId === "30" ? "block h-full" : "hidden"}><BrokersPage /></div>
            <div className={activeScreenId === "31" ? "block h-full" : "hidden"}><Screen860IntermediaryOffices /></div>
            <div className={activeScreenId === "32" ? "block h-full" : "hidden"}><PartnersPage /></div>
            <div className={activeScreenId === "71" ? "block h-full" : "hidden"}><SystemSettings /></div>
            <div className={activeScreenId === "73" ? "block h-full" : "hidden"}><SystemBackup /></div>
            <div className={activeScreenId === "74" ? "block h-full" : "hidden"}><HardwareMonitor /></div>
            <div className={activeScreenId === "09" ? "block h-full" : "hidden"}><BuildingPermitsRegistry /></div>
            <div className={activeScreenId === "0010" ? "block h-full" : "hidden"}><OurOfficePermits /></div>
            <div className={activeScreenId === "10" ? "block h-full" : "hidden"}><TransactionsDashboard /></div>
            <div className={activeScreenId === "88" ? "block h-full" : "hidden"}><HRDashboard /></div>
            <div className={activeScreenId === "16" ? "block h-full" : "hidden"}><SystemFilesExplorer /></div>
            <div className={activeScreenId === "98" ? "block h-full" : "hidden"}><EmailNotificationsCenter /></div>
            <div className={activeScreenId === "99" ? "block h-full" : "hidden"}><InboxCenter /></div>
            <div className={activeScreenId === "100" ? "block h-full" : "hidden"}><FileRequest /></div>
            <div className={activeScreenId === "101" ? "block h-full" : "hidden"}><EmailSettingsScreen /></div>
            <div className={activeScreenId === "83" ? "block h-full" : "hidden"}><TailscalePage /></div>
            <div className={activeScreenId === "109" ? "block h-full" : "hidden"}><QuickLinksScreen /></div>
            <div className={activeScreenId === "112" ? "block h-full" : "hidden"}><ReferenceLibraryScreen /></div>
            <div className={activeScreenId === "170" ? "block h-full" : "hidden"}><ContractsManagementScreen /></div>
            <div className={activeScreenId === "030" ? "block h-full" : "hidden"}><OfficeNotepadScreen /></div>
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