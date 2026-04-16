import React, { useState, useEffect, useMemo } from "react";
import {
  TriangleAlert,
  ChevronDown,
  Users,
  FilePlus,
  FileCheck,
  DollarSign,
  Ticket,
  CircleUser,
  Briefcase,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

// 💡 1. تأكد من استقبال onNavigate هنا
export default function HRDashboard({ onNavigate }) {
  const [dashboardStats, setDashboardStats] = useState({
    activeFormsCount: 0,
    formsLoading: true,

    // 💡 إضافة حالات الموظفين
    activeEmployeesCount: 0,
    totalEmployeesCount: 0,
    employeesLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // 💡 جلب النماذج والموظفين في نفس الوقت (بشكل متوازي لسرعة الأداء)
        const [formsRes, employeesRes] = await Promise.all([
          api.get("/forms/templates"),
          api.get("/employees"),
        ]);

        const templates = formsRes.data?.data || [];
        // قد يكون الرد الخاص بالموظفين موجوداً في .data أو مباشرة حسب إعدادات الـ API الخاص بك
        const employees = employeesRes.data?.data || employeesRes.data || [];

        setDashboardStats({
          activeFormsCount: templates.filter((t) => t.isActive).length,
          formsLoading: false,

          // 💡 حساب إحصائيات الموظفين
          activeEmployeesCount: employees.filter((e) => e.status === "active")
            .length,
          totalEmployeesCount: employees.length,
          employeesLoading: false,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setDashboardStats((prev) => ({
          ...prev,
          formsLoading: false,
          employeesLoading: false,
        }));
      }
    };
    fetchStats();
  }, []);

  const HR_MODULES = useMemo(
    () => [
      {
        id: 1,
        targetId: "HR_EMPLOYEES",
        title: "إدارة الموظفين",
        desc: "بيانات الموظفين وملفاتهم",
        stat: `${dashboardStats.activeEmployeesCount} نشط`,
        gradient: "from-blue-500 to-blue-700",
        icon: Users,
        actions: [
          {
            // 💡 عرض عدد الموظفين الحقيقي في الشارة العلوية
            count: dashboardStats.employeesLoading
              ? "..."
              : dashboardStats.totalEmployeesCount.toString(),
            badgeColor: "bg-blue-500",
          },
        ],
      },
      {
        id: 2,
        targetId: "HR_INTERNAL_FORMS",
        title: "النماذج الداخلية",
        desc: "تصميم وطباعة النماذج",
        stat: "نظام ديناميكي",
        gradient: "from-indigo-600 to-purple-700",
        icon: FilePlus,
        actions: [
          {
            count: dashboardStats.formsLoading
              ? "..."
              : dashboardStats.activeFormsCount.toString(),
            badgeColor: "bg-emerald-500",
          },
        ],
      },
      {
        id: 3,
        targetId: "HR_PAYROLL",
        title: "إدارة المرتبات",
        desc: "مسير الرواتب والبدلات",
        stat: "الشهر الحالي",
        gradient: "from-emerald-500 to-teal-700",
        icon: DollarSign,
        actions: [{ count: "1", badgeColor: "bg-sky-500" }],
      },
      {
        id: 4,
        targetId: "HR_CONTRACTS",
        title: "مركز العقود",
        desc: "صياغة واعتماد العقود",
        stat: "4 قيد المراجعة",
        gradient: "from-violet-500 to-fuchsia-700",
        icon: FileCheck,
        actions: [{ count: "4", badgeColor: "bg-red-500" }],
      },
      {
        id: 5,
        targetId: "HR_REQUESTS",
        title: "الطلبات والإجازات",
        desc: "طلبات الموظفين والموافقات",
        stat: "سير العمل الآلي",
        gradient: "from-rose-500 to-red-700",
        icon: Ticket,
        actions: [{ count: "3", badgeColor: "bg-rose-600" }],
      },
      {
        id: 6,
        targetId: "HR_PORTALS",
        title: "بوابات الدخول",
        desc: "صلاحيات ولوحات الموظفين",
        stat: "نظام آمن",
        gradient: "from-slate-700 to-slate-900",
        icon: CircleUser,
        actions: [],
      },
    ],
    [dashboardStats],
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-[Tajawal]" dir="rtl">
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Briefcase className="text-blue-600 w-6 h-6 md:w-8 md:h-8" />{" "}
              إدارة الموارد البشرية
            </h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 mt-1.5">
              اختر الوحدة المطلوبة من القائمة للبدء في إدارتها
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {HR_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (module.targetId && onNavigate) {
                    onNavigate(module.targetId);
                  }
                }}
                className="relative flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-400 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                {module.actions && module.actions.length > 0 && (
                  <div
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${module.actions[0].badgeColor}`}
                  >
                    {module.actions[0].count === "..." ? (
                      <Loader2 size={10} className="animate-spin inline" />
                    ) : (
                      module.actions[0].count
                    )}
                  </div>
                )}
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${module.gradient} shadow-inner group-hover:scale-110 transition-transform duration-300`}
                >
                  <module.icon className="text-white w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="flex flex-col items-center gap-1 w-full">
                  <h3 className="font-black text-[13px] md:text-[15px] text-slate-800 text-center leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] font-bold text-slate-400 text-center line-clamp-2 w-full mt-1">
                    {module.desc}
                  </p>
                </div>
                {/* 💡 إعادة شريط الإحصائية السفلي ليظهر حالة الموظفين (نشط) */}
                <div className="mt-4 w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-2 text-center text-[9px] md:text-[10px] font-bold text-slate-600 truncate group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">
                  {module.stat}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
