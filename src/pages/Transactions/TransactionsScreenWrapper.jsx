import React, { useState } from "react";
import TransactionsSidebar from "../../components/TransactionsSidebar"; // تأكد من المسار
import TransactionsList from "./TransactionsList";
import CreateTransactionWizard from "./CreateTransactionWizard";
// Import other components or Placeholder below

// مكونات نائبة (Placeholders) للتبويبات التي لم تكتمل بعد
const PlaceholderComponent = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center h-full bg-slate-50/50">
    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300 mb-4 animate-pulse">
      {icon}
    </div>
    <h3 className="text-lg font-bold text-slate-400">{title}</h3>
    <p className="text-xs text-slate-400 mt-2">
      هذه الشاشة قيد التطوير حالياً...
    </p>
  </div>
);

const TransactionsScreenWrapper = () => {
  const [activeTab, setActiveTab] = useState("log");

  // دالة لتحديد المحتوى بناءً على التبويب النشط
  const renderContent = () => {
    switch (activeTab) {
      case "log":
        return <TransactionsList />;
      case "create":
        return <CreateTransactionWizard />;
      case "details":
        return (
          <PlaceholderComponent
            title="تفاصيل المعاملة"
            icon={<span className="text-4xl">ℹ️</span>}
          />
        );
      case "track":
        return (
          <PlaceholderComponent
            title="تتبع المعاملة"
            icon={<span className="text-4xl">📊</span>}
          />
        );
      case "upload":
        return (
          <PlaceholderComponent
            title="مركز التجهيز والرفع"
            icon={<span className="text-4xl">☁️</span>}
          />
        );
      default:
        return <TransactionsList />;
    }
  };

  return (
    <div
      className="flex h-screen w-full bg-slate-100 overflow-hidden"
      dir="rtl"
    >
      {/* 1. Sidebar (Fixed Width) */}
      <TransactionsSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 2. Main Content Area (Flexible) */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-2 rounded-lg border border-slate-200 overflow-hidden relative">
        {/* يمكنك إضافة Header مشترك هنا إذا أردت، لكن كل شاشة داخلية لديها الهيدر الخاص بها */}

        <div className="flex-1 relative h-full">
          {/* Render Active Tab */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};


export default TransactionsScreenWrapper;