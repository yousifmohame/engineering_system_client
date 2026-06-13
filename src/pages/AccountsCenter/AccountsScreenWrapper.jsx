import React, { useState } from "react";
import {
  X,
  ReceiptText,
  WalletCards,
  ChevronRight,
  Building2, // تم إضافة الأيقونة
} from "lucide-react";

// الشاشات
import AccountsDashboard from "./AccountsDashboard";
import OutsourceSalariesPage from "./screens/OutsourceSalaries/OutsourceSalariesPage";
import TreasuryPage from "./screens/Treasury/TreasuryPage";
import BankAccountsPage from "./screens/BankAccounts/BankAccountsPage"; // الشاشة الجديدة

// ─────────────────────────────────────────────
// بيانات التبويبات
// ─────────────────────────────────────────────
const TAB_CONFIG = {
  CONTRACTS_QIWA: {
    title: "رواتب موظفي الأوتسورس",
    icon: ReceiptText,
    gradient: "from-emerald-500 to-teal-700",
  },
  HR_PAYROLL: {
    title: "الخزنة الرئيسية",
    icon: WalletCards,
    gradient: "from-indigo-600 to-blue-700",
  },
  BANK_ACCOUNTS: {
    title: "الحسابات البنكية",
    icon: Building2,
    gradient: "from-violet-600 to-purple-800",
  },
};

const AccountsScreenWrapper = () => {
  const [activeModal, setActiveModal] = useState(null);

  const handleNavigate = (targetId) => {
    setActiveModal(targetId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderPlaceholder = (title) => (
    <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 text-slate-500 gap-5">
      <div className="w-24 h-24 rounded-[2rem] bg-white shadow-lg flex items-center justify-center text-5xl">
        🚧
      </div>
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-700">{title}</h2>
        <p className="text-sm font-bold text-slate-400 mt-2">
          هذه الصفحة مازالت قيد التطوير
        </p>
      </div>
    </div>
  );

  const renderModalContent = () => {
    switch (activeModal) {
      case "CONTRACTS_QIWA":
        return <OutsourceSalariesPage onClose={closeModal} />;
      case "HR_PAYROLL":
        return <TreasuryPage onClose={closeModal} />;
      case "BANK_ACCOUNTS":
        return <BankAccountsPage onClose={closeModal} />; // استدعاء الشاشة الجديدة
      default:
        return TAB_CONFIG[activeModal]
          ? renderPlaceholder(TAB_CONFIG[activeModal].title)
          : null;
    }
  };

  const currentTab = TAB_CONFIG[activeModal];

  return (
    <div
      className="flex h-full w-full bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 overflow-hidden"
      dir="rtl"
    >
      {/* الخلفية الرئيسية */}
      <div className="flex-1 flex flex-col min-w-0 p-3">
        <div className="flex-1 bg-white/90 backdrop-blur-2xl border border-white rounded-[2.5rem] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.06)] relative">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-emerald-100/30 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none"></div>
          <div className="relative z-10 h-full overflow-hidden">
            <AccountsDashboard onNavigate={handleNavigate} />
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-950/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-[96vw] h-[95vh] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.25)] flex flex-col border border-white/50 animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="relative overflow-hidden shrink-0 border-b border-slate-200">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentTab?.gradient || "from-slate-700 to-slate-800"}`}
              ></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_40%)]"></div>

              <div className="relative z-10 flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={closeModal}
                    className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center shadow-lg">
                      {currentTab?.icon && (
                        <currentTab.icon
                          className="w-7 h-7 text-white"
                          strokeWidth={1.7}
                        />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {currentTab?.title}
                      </h2>
                      <p className="text-xs font-bold text-white/70 mt-1">
                        مركز الحسابات والإدارة المالية
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-400/30 flex items-center justify-center text-white transition-all active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden bg-slate-50 relative">
              {renderModalContent()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsScreenWrapper;
