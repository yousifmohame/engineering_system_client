import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  LayoutDashboard,
  History,
  PlusCircle,
  Settings,
  Link as LinkIcon,
  ShieldCheck,
} from "lucide-react";
import DashboardTab from "./tabs/DashboardTab";
import RegistryTab from "./tabs/RegistryTab";
import NewDocumentationTab from "./tabs/NewDocumentationModal";
import { LinkageTab } from "./tabs/LinkageTab";

export default function ElectronicDocumentation() {
  const [activeTab, setActiveTab] = useState("new"); // الافتراضي "توثيق جديد"

  const tabs = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "new", label: "توثيق ملف جديد", icon: PlusCircle },
    { id: "registry", label: "سجل الوثائق", icon: History },
    { id: "linkage", label: "ربط المستندات", icon: LinkIcon },
  ];

  return (
    <div className="h-full bg-slate-50 flex flex-col font-tajawal" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">
              نظام التوثيق الإلكتروني
            </h1>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Digital Certification & Stamping Hub
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-8 shrink-0 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 flex items-center gap-2 text-sm font-black transition-all border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === "dashboard" && <DashboardTab />}
            {activeTab === "new" && <NewDocumentationTab />}
            {activeTab === "registry" && <RegistryTab />}
            {activeTab === "linkage" && <LinkageTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
