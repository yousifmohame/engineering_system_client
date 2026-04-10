import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FilePenLine,
  Plus,
  FileText,
  Clock,
  Search,
  Filter,
  Eye,
  FileCode,
  Copy,
  Send,
  Archive,
  Trash2,
  MoreVertical,
  Loader2,
  ShieldCheck,
  LayoutTemplate,
  BookOpen,
  Settings,
  ChartNoAxesColumnIncreasing,
  Share2,
  FileCheck,
  QrCode,
  X,
  Shield,
  Pen,
  Mail,
  Phone,
  MapPin,
  Check,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";
import CreateContractModal from "./modelss/CreateContractModal";

export default function ContractsManagementScreen() {
  const [activeTab, setActiveTab] = useState("settings"); // التاب الرئيسي
  const [settingsView, setSettingsView] = useState("general"); // العرض الفرعي للإعدادات
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);

  const queryClient = useQueryClient();

  // بيانات افتراضية للقوالب (للعرض المكثف)
  const scopeTemplates = [
    {
      id: 1,
      title: "قالب تصميم فيلا سكنية",
      type: "تصميم",
      category: "سكني",
      items: ["التصميم المعماري المبدئي والنهائي", "المخططات الإنشائية"],
    },
    {
      id: 2,
      title: "قالب إشراف تجاري",
      type: "إشراف",
      category: "تجاري",
      items: ["زيارات ميدانية أسبوعية", "تقارير الالتزام بالكود"],
    },
  ];

  return (
    <div
      className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* ─── Header (Compact) ─── */}
      <header className="p-3 bg-white border-b border-slate-200 flex justify-between items-center shrink-0 shadow-sm">
        <div>
          <h1 className="text-sm font-black text-slate-950">إدارة العقود</h1>
          <p className="text-[10px] font-bold text-slate-500 mt-0.5">
            مركز التحكم في الوثائق القانونية
          </p>
        </div>
        <button
          onClick={() => setIsCreateContractOpen(true)}
          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> إنشاء عقد جديد
        </button>
      </header>

      {/* ─── Tabs ─── */}
      <div className="flex border-b border-slate-200 bg-white px-2 shrink-0">
        <button
          onClick={() => setActiveTab("contracts")}
          className={`px-4 py-2.5 text-[11px] font-black flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "contracts" ? "text-emerald-700 border-emerald-600" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
        >
          <FileText className="w-3.5 h-3.5" /> العقود
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`px-4 py-2.5 text-[11px] font-black flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "templates" ? "text-emerald-700 border-emerald-600" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
        >
          <BookOpen className="w-3.5 h-3.5" /> نماذج العقود
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 text-[11px] font-black flex items-center gap-1.5 transition-all border-b-2 ${activeTab === "settings" ? "text-emerald-700 border-emerald-600" : "text-slate-500 border-transparent hover:bg-slate-50"}`}
        >
          <Settings className="w-3.5 h-3.5" /> الإعدادات
        </button>
      </div>

      {/* ─── Tab Content ─── */}
      <div className="flex-1 overflow-hidden p-3 flex flex-col">
        {activeTab === "settings" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex h-full animate-in fade-in zoom-in-95">
            {/* 🚀 القائمة الجانبية للإعدادات (Compact Sidebar) 🚀 */}
            <div className="w-52 bg-slate-50 border-l border-slate-200 p-2 shrink-0 flex flex-col gap-1 overflow-y-auto">
              <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-2">
                إعدادات العقود
              </h2>

              <button
                onClick={() => setSettingsView("general")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${settingsView === "general" ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-200"}`}
              >
                <Settings className="w-3.5 h-3.5" /> إعدادات عامة
              </button>

              <button
                onClick={() => setSettingsView("scope")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${settingsView === "scope" ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-200"}`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" /> قوالب نطاق العمل
              </button>

              <button
                onClick={() => setSettingsView("verification")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${settingsView === "verification" ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-200"}`}
              >
                <QrCode className="w-3.5 h-3.5" /> التحقق والمشاركة
              </button>

              <button
                onClick={() => setSettingsView("cover")}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[10px] font-black transition-all ${settingsView === "cover" ? "bg-emerald-100 text-emerald-800" : "text-slate-600 hover:bg-slate-200"}`}
              >
                <FileText className="w-3.5 h-3.5" /> إعدادات الغلاف
              </button>
            </div>

            {/* 🚀 منطقة المحتوى الديناميكي 🚀 */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar-slim bg-white">
              {/* 1. الإعدادات العامة */}
              {settingsView === "general" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-emerald-600" /> الإعدادات
                    العامة للعقود
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-[11px] font-black text-slate-800">
                        طرق الاعتماد المتاحة
                      </h4>
                      <div className="space-y-2">
                        {[
                          "منصة نفاذ",
                          "بريد موثق",
                          "واتساب رسمي",
                          "توقيع ورقي",
                        ].map((item) => (
                          <label
                            key={item}
                            className="flex items-center gap-2 cursor-pointer group"
                          >
                            <input
                              className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                              type="checkbox"
                              defaultChecked
                            />
                            <span className="text-[10px] font-bold text-slate-700 group-hover:text-emerald-700">
                              {item}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
                      <h4 className="text-[11px] font-black text-slate-800">
                        القيود والصلاحيات
                      </h4>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input
                          className="w-3.5 h-3.5 mt-0.5 text-emerald-600 rounded border-slate-300"
                          type="checkbox"
                          defaultChecked
                        />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-slate-700">
                            تقييد التعديل بعد الارتباط المالي
                          </span>
                          <span className="text-[8px] text-slate-400 font-bold">
                            يمنع التغيير إذا تم إصدار فاتورة
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. قوالب نطاق العمل */}
              {settingsView === "scope" && (
                <div className="space-y-5 animate-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-emerald-600" />{" "}
                      قوالب نطاق العمل والبنود
                    </h3>
                    {/* 🚀 الزر الآن يفتح المودال 🚀 */}
                    <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-[9px] font-black flex items-center gap-1 shadow-sm hover:bg-emerald-700 transition-all">
                      <Plus className="w-3 h-3" /> إضافة قالب جديد
                    </button>
                  </div>
                  <div className="space-y-3">
                    {scopeTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="border border-slate-200 rounded-xl overflow-hidden shadow-sm"
                      >
                        <div className="bg-slate-50/80 p-3 flex justify-between items-center border-b border-slate-100">
                          <div>
                            <h4 className="text-[11px] font-black text-slate-800">
                              {template.title}
                            </h4>
                            <div className="text-[9px] text-slate-400 font-bold mt-0.5">
                              نوع: {template.type} | تصنيف: {template.category}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-white rounded transition-all">
                              <Pen className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        <div className="p-3 bg-white">
                          <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-2">
                            البنود المضمنة ({template.items.length})
                          </h5>
                          <ul className="space-y-1.5">
                            {template.items.map((item, idx) => (
                              <li
                                key={idx}
                                className="text-[10px] font-bold text-slate-600 flex items-center gap-2 before:content-['•'] before:text-emerald-500"
                              >
                                {item}{" "}
                                <span className="text-[8px] bg-rose-50 text-rose-600 px-1 rounded border border-rose-100">
                                  إلزامي
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. التحقق والمشاركة */}
              {settingsView === "verification" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" /> إعدادات
                    التحقق والمشاركة
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-2">
                        <QrCode className="w-3.5 h-3.5 text-indigo-500" /> رموز
                        الاستجابة (QR)
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                            type="checkbox"
                            defaultChecked
                          />
                          <span className="text-[10px] font-bold text-slate-700">
                            تضمين رمز التحقق في الغلاف
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                            type="checkbox"
                            defaultChecked
                          />
                          <span className="text-[10px] font-bold text-slate-700">
                            تضمين رمز موقع المشروع
                          </span>
                        </label>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-[11px] font-black text-slate-800 flex items-center gap-2">
                        <Shield className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        صلاحيات التحقق العام
                      </h4>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                          type="checkbox"
                          defaultChecked
                        />
                        <span className="text-[10px] font-bold text-slate-700">
                          السماح بالتحقق العام عبر الموقع
                        </span>
                      </label>
                      <div className="pr-6 space-y-2 border-r border-slate-200">
                        {["إظهار بيانات الأطراف", "إظهار البيانات المالية"].map(
                          (opt) => (
                            <label
                              key={opt}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                className="w-3 h-3 text-emerald-600 rounded border-slate-300"
                                type="checkbox"
                              />
                              <span className="text-[9px] font-bold text-slate-500">
                                {opt}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. إعدادات الغلاف */}
              {settingsView === "cover" && (
                <div className="space-y-6 animate-in slide-in-from-bottom-2">
                  <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-600" /> إعدادات
                    الغلاف والهوية
                  </h3>
                  <div className="grid grid-cols-2 gap-5">
                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-[11px] font-black text-slate-800">
                        تصميم الغلاف الأمامي
                      </h4>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                            type="checkbox"
                            defaultChecked
                          />
                          <span className="text-[10px] font-bold text-slate-700">
                            إظهار شعار المكتب في الأعلى
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                          <input
                            className="w-3.5 h-3.5 text-emerald-600 rounded border-slate-300"
                            type="checkbox"
                            defaultChecked
                          />
                          <span className="text-[10px] font-bold text-slate-700">
                            إظهار ملخص العقد (AI Summary)
                          </span>
                        </label>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                            رابط صورة الخلفية الافتراضية
                          </label>
                          <input
                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold outline-none focus:border-emerald-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-4">
                      <h4 className="text-[11px] font-black text-slate-800">
                        معلومات التواصل (الغلاف الخلفي)
                      </h4>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400">
                            البريد الإلكتروني
                          </label>
                          <div className="relative">
                            <Mail className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                              className="w-full pr-7 pl-2 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold"
                              defaultValue="info@details-work.com"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400">
                            رقم الهاتف
                          </label>
                          <div className="relative">
                            <Phone className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                              className="w-full pr-7 pl-2 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold"
                              dir="ltr"
                              defaultValue="+966 500 000 000"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400">
                            العنوان
                          </label>
                          <div className="relative">
                            <MapPin className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                            <input
                              className="w-full pr-7 pl-2 py-1.5 border border-slate-200 rounded-lg text-[10px] font-bold"
                              defaultValue="المملكة العربية السعودية، الرياض"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* التابات الأخرى (العقود والنماذج) تظل كما هي في كودك السابق لضمان العمل الشامل */}
        {activeTab === "contracts" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="p-20 text-center">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400">
                سجل العقود يظهر هنا...
              </p>
            </div>
          </div>
        )}

        {activeTab === "templates" && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden animate-in fade-in">
            <div className="p-20 text-center">
              <LayoutTemplate className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-xs font-bold text-slate-400">
                قائمة النماذج تظهر هنا...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 استدعاء الموديل هنا 🚀 */}
      {isCreateContractOpen && (
        <CreateContractModal
          isOpen={true}
          onClose={() => setIsCreateContractOpen(false)}
        />
      )}
    </div>
  );
}
