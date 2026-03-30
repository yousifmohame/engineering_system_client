import React, { useState, useEffect, useMemo } from "react";
import {
  TriangleAlert,
  Pin,
  ChevronDown,
  LayoutDashboard,
  Users,
  FilePlus,
  FileCheck,
  DollarSign,
  Ticket,
  CircleUser,
  Clock,
  Briefcase,
  ShieldAlert,
  Award,
  Star,
  MapPin,
  Building2,
  Mail,
  FileText,
  Lock,
  Settings2,
  Upload,
  Zap,
  CircleDot,
  ClipboardList,
  UserPlus,
  Search,
  CircleAlert,
  Bell,
  RefreshCw,
  ChevronLeft,
  Plus,
  BellOff,
  Smartphone,
  Package,
  HeartPulse,
  Plane,
  Car,
  Sun,
  Shield,
  CircleCheck,
  Fingerprint,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// استيراد ملف الاتصال بالباك إند
import api from "../../api/axios";

// استيراد مكون النماذج الداخلية
import InternalFormsTab from "./components/InternalFormsTab";

const NAV_TABS = [
  {
    id: 1,
    title: "الرئيسية",
    icon: LayoutDashboard,
    badge: "Home",
    badgeColor: "bg-emerald-600",
    active: true,
  },
  {
    id: 2,
    title: "لوحة القيادة",
    icon: LayoutDashboard,
    badge: "4 تنبيه",
    badgeColor: "bg-red-500",
  },
  {
    id: 3,
    title: "الموظفون",
    icon: Users,
    badge: "17",
    badgeColor: "bg-slate-400",
  },
  {
    id: 4,
    title: "النماذج الداخلية",
    icon: FilePlus,
    badge: "قوي",
    badgeColor: "bg-blue-800",
  },
  {
    id: 5,
    title: "مركز العقود",
    icon: FileCheck,
    badge: "قوي",
    badgeColor: "bg-violet-600",
  },
  {
    id: 6,
    title: "إدارة المرتبات",
    icon: DollarSign,
    badge: "جديد",
    badgeColor: "bg-emerald-600",
  },
  {
    id: 7,
    title: "مركز الطلبات",
    icon: Ticket,
    badge: "3",
    badgeColor: "bg-red-600",
  },
  {
    id: 8,
    title: "إدارة البوابات",
    icon: CircleUser,
    badge: "جديد",
    badgeColor: "bg-sky-600",
  },
];

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState(1);

  // 💡 State لحفظ إحصائيات النظام من الباك إند
  const [dashboardStats, setDashboardStats] = useState({
    activeFormsCount: 0,
    formsLoading: true,
  });

  // 💡 جلب إحصائيات النماذج بمجرد تحميل الشاشة الرئيسية
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // نستدعي الـ API الذي برمجناه لجلب كل النماذج
        const response = await api.get("/forms/templates");
        const templates = response.data.data;

        setDashboardStats({
          activeFormsCount: templates.filter((t) => t.isActive).length,
          formsLoading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDashboardStats((prev) => ({ ...prev, formsLoading: false }));
        toast.error("فشل في جلب إحصائيات لوحة القيادة");
      }
    };

    fetchStats();
  }, []);

  // 💡 بناء كروت النظام ديناميكياً لكي تعكس الإحصائيات الحقيقية
  const HR_MODULES = useMemo(
    () => [
      {
        id: 1,
        tabId: 1,
        title: "إدارة الموظفين",
        desc: "بيانات الموظفين وملفاتهم الشخصية",
        stat: "14 نشط",
        gradient: "from-blue-500 to-blue-700",
        icon: Users,
        borderColor: "border-amber-200",
        actions: [
          {
            label: "ملفات ناقصة",
            count: "17",
            color: "bg-amber-100 text-amber-600 border-amber-200",
            badgeColor: "bg-amber-600",
          },
        ],
      },
      {
        id: 99,
        tabId: 4,
        title: "النماذج الداخلية",
        desc: "تصميم وطباعة النماذج الرسمية",
        stat: "نظام ديناميكي",
        gradient: "from-blue-800 to-blue-600",
        icon: FilePlus,
        borderColor: "border-slate-300",
        actions: [
          {
            label: "نماذج نشطة",
            count: dashboardStats.formsLoading
              ? "..."
              : dashboardStats.activeFormsCount.toString(),
            color: "bg-green-50 text-green-600 border-green-200",
            badgeColor: "bg-green-600",
          },
        ],
      },
      {
        id: 3,
        tabId: 6,
        title: "إدارة المرتبات",
        desc: "مسير الرواتب والبدلات والاستقطاعات",
        stat: "Open Run: الشهر الحالي",
        gradient: "from-emerald-600 to-emerald-800",
        icon: DollarSign,
        borderColor: "border-amber-200",
        actions: [
          {
            label: "فترة مفتوحة",
            count: "1",
            color: "bg-sky-50 text-sky-600 border-sky-200",
            badgeColor: "bg-sky-600",
          },
          {
            label: "استثناءات معلقة",
            count: "3",
            color: "bg-amber-50 text-amber-600 border-amber-200",
            badgeColor: "bg-amber-600",
          },
        ],
      },
    ],
    [dashboardStats],
  );

  return (
    <div
      className="flex flex-col h-screen bg-slate-50 font-[Tajawal]"
      dir="rtl"
    >
      {/* --- شريط التنبيهات العلوي --- */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border-b-2 border-red-300 shrink-0">
        <TriangleAlert size={14} className="text-red-600 animate-pulse" />
        <span className="text-[11px] font-bold text-red-900">22 تنبيه نشط</span>
        <div className="flex-1 flex items-center justify-end gap-1">
          <span className="text-[8px] text-slate-500">+19</span>
          <ChevronDown size={14} className="text-slate-500 cursor-pointer" />
        </div>
      </div>

      {/* --- شريط التبويبات (Tabs) --- */}
      <div className="flex bg-white border-b-2 border-slate-200 px-2 shrink-0 overflow-x-auto hide-scrollbar">
        {NAV_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 cursor-pointer transition-all whitespace-nowrap border-b-[3px] ${
              activeTab === tab.id
                ? "bg-blue-100 text-blue-800 border-blue-800"
                : "bg-transparent text-slate-600 border-transparent hover:bg-slate-50"
            }`}
          >
            <tab.icon size={14} />
            <span
              className={`text-xs ${activeTab === tab.id ? "font-bold" : "font-medium"}`}
            >
              {tab.title}
            </span>
            {tab.badge && (
              <span
                className={`px-1.5 py-0.5 rounded-lg text-[9px] font-semibold text-white ${tab.badgeColor}`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* --- منطقة المحتوى المتغيرة --- */}
      <div className="flex-1 overflow-hidden flex flex-col bg-slate-50">
        {/* 🌟 إذا كان التاب النشط هو (الرئيسية) 🌟 */}
        {activeTab === 1 && (
          <div className="flex-1 overflow-auto p-3">
            <div className="flex flex-col gap-4 max-w-7xl mx-auto animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="m-0 text-slate-900 text-lg font-bold">
                    الموارد البشرية
                  </h2>
                  <p className="m-0 mt-0.5 text-xs text-slate-500">
                    اختر الوحدة المطلوبة للبدء
                  </p>
                </div>
              </div>

              {/* 🌟 شبكة الكروت (Grid) 🌟 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {HR_MODULES.map((module) => (
                  <div
                    key={module.id}
                    className={`flex flex-col bg-white border rounded-xl overflow-hidden transition-all hover:shadow-md ${module.borderColor}`}
                  >
                    <button
                      onClick={() => {
                        if (module.tabId) setActiveTab(module.tabId);
                      }}
                      className="flex items-start gap-3 p-3.5 pb-2 border-none bg-transparent w-full text-right hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${module.gradient} shadow-sm`}
                      >
                        <module.icon size={22} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-[13px] text-slate-900">
                          {module.title}
                        </div>
                        <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                          {module.desc}
                        </div>
                        <div className="text-[8px] font-mono font-bold mt-0.5 text-blue-600">
                          {module.stat}
                        </div>
                      </div>
                      <ChevronLeft size={16} className="text-slate-400 mt-1" />
                    </button>

                    <div className="flex flex-col gap-1 px-2.5 pb-2.5 mt-2">
                      {module.actions.map((act, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <button
                            className={`flex-1 flex items-center gap-1.5 px-2 py-1 rounded-md border text-right transition-colors hover:brightness-95 ${act.color}`}
                          >
                            <span
                              className={`inline-flex items-center justify-center min-w-[20px] h-5 rounded text-[10px] font-bold text-white ${act.badgeColor}`}
                            >
                              {/* إظهار علامة تحميل إذا كانت البيانات قيد الجلب */}
                              {act.count === "..." ? (
                                <Loader2 size={10} className="animate-spin" />
                              ) : (
                                act.count
                              )}
                            </span>
                            <span className="text-[10px] font-bold flex-1">
                              {act.label}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 🌟 إذا كان التاب النشط هو (النماذج الداخلية) 🌟 */}
        {activeTab === 4 && (
          <div className="flex-1 overflow-auto p-3 bg-slate-50">
            <InternalFormsTab />
          </div>
        )}

        {/* 🌟 التبويبات الأخرى (قيد التطوير) 🌟 */}
        {activeTab !== 1 && activeTab !== 4 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 animate-in fade-in">
            <Settings2 size={48} className="opacity-20" />
            <h3 className="text-lg font-bold">هذه الشاشة قيد التطوير</h3>
            <button
              onClick={() => setActiveTab(1)}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300"
            >
              العودة للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
