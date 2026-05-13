import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Plus,
  Clock,
  CircleX,
  LayoutDashboard,
  SquareUserRound,
  FileText,
  Inbox,
  Banknote,
  Calendar,
  Settings,
  Award,
  Globe,
  Computer,
  Bot,
  Loader2
} from "lucide-react";
import api from "../../api/axios";

export default function HRDashboard({ onNavigate }) {
  const [dashboardStats, setDashboardStats] = useState({
    activeFormsCount: 0,
    formsLoading: true,
    activeEmployeesCount: 0,
    totalEmployeesCount: 0,
    employeesLoading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [formsRes, employeesRes] = await Promise.all([
          api.get("/forms/templates").catch(() => ({ data: { data: [] } })),
          api.get("/employees").catch(() => ({ data: { data: [] } })),
        ]);

        const templates = formsRes.data?.data || [];
        const employees = employeesRes.data?.data || employeesRes.data || [];

        setDashboardStats({
          activeFormsCount: templates.filter((t) => t.isActive).length,
          formsLoading: false,
          activeEmployeesCount: employees.filter((e) => e.status === "active").length,
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

  // 💡 قائمة الوحدات مطابقة تماماً للتصميم المرفق مع إضافة الإحصائيات الحية
  const HR_MODULES = useMemo(
    () => [
      {
        id: "DASHBOARD",
        title: "لوحة المؤشرات\n(Dashboard)",
        icon: LayoutDashboard,
        gradient: "from-blue-600 to-indigo-700",
      },
      {
        id: "HR_EMPLOYEES",
        title: "دليل الكوادر والشركاء",
        icon: Users,
        gradient: "from-cyan-500 to-blue-600",
        badge: dashboardStats.employeesLoading ? "LOADING" : `${dashboardStats.activeEmployeesCount} نشط`,
      },
      {
        id: "ATTENDANCE_AI",
        title: "الحضور والانصراف\n(AI Powered)",
        icon: Clock,
        gradient: "from-amber-400 to-orange-500",
        badge: "AI",
      },
      {
        id: "CONTRACTS_QIWA",
        title: "العقود والاتفاقيات\n(قوى)",
        icon: FileText,
        gradient: "from-purple-500 to-fuchsia-600",
      },
      {
        id: "HR_REQUESTS",
        title: "مركز الطلبات\nوالنماذج",
        icon: Inbox,
        gradient: "from-rose-400 to-red-500",
        badge: "7 إشعار",
      },
      {
        id: "MY_PORTAL",
        title: "بوابة الموظف\n(My Portal)",
        icon: SquareUserRound,
        gradient: "from-pink-500 to-rose-600",
      },
      {
        id: "HR_PAYROLL",
        title: "الرواتب والمسيرات\n(WPS)",
        icon: Banknote,
        gradient: "from-blue-500 to-cyan-500",
      },
      {
        id: "LEAVES_ABSENCE",
        title: "سجل الإجازات\nوالغياب",
        icon: Calendar,
        gradient: "from-lime-500 to-emerald-600",
      },
      {
        id: "HR_SETTINGS",
        title: "إعدادات الحالات\nوالبدلات",
        icon: Settings,
        gradient: "from-slate-700 to-slate-900",
      },
      {
        id: "PROF_PLATFORMS",
        title: "المنصات المهنية\nوالهيئات",
        icon: Award,
        gradient: "from-orange-400 to-amber-600",
      },
      {
        id: "RESIDENCY_INSURANCE",
        title: "شؤون المقيمين\nوالتأمين",
        icon: Globe,
        gradient: "from-sky-400 to-blue-600",
      },
      {
        id: "HR_INTERNAL_FORMS",
        title: "النماذج الذكية",
        icon: FileText,
        gradient: "from-violet-500 to-purple-700",
        badge: dashboardStats.formsLoading ? "LOADING" : `${dashboardStats.activeFormsCount} نموذج`,
      },
      {
        id: "ASSETS_CUSTODY",
        title: "العهد و الأصول",
        icon: Computer,
        gradient: "from-slate-600 to-slate-800",
      },
      {
        id: "SMART_UPDATE",
        title: "التحديث الذكي",
        icon: Bot,
        gradient: "from-fuchsia-500 to-pink-600",
        badge: "جديد",
      },
    ],
    [dashboardStats]
  );

  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-6 lg:p-10 flex flex-col gap-8 bg-slate-50/50 relative font-cairo" dir="rtl">
      {/* ─── الخلفية الجمالية (Glassmorphism Blobs) ─── */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-indigo-50 rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-96 bg-rose-50 rounded-tr-[100px] -z-10 blur-3xl opacity-50"></div>

      {/* ─── الشريط العلوي للعمليات السريعة ─── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white/80 backdrop-blur-xl p-5 md:p-6 rounded-3xl border border-slate-200 shadow-sm shrink-0 gap-4 animate-in fade-in slide-in-from-top-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-black text-slate-800 text-lg md:text-xl">العمليات السريعة</h3>
            <p className="text-xs font-bold text-slate-500 mt-0.5">مجموعة من الإجراءات الأكثر استخداماً اختصاراً للوقت</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-colors shadow-md shadow-indigo-600/10">
            <Plus className="w-4 h-4" /> موظف جديد
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-black transition-colors border border-slate-200 shadow-sm hover:border-slate-300">
            <Clock className="w-4 h-4 text-emerald-600" /> تسجيل إجازة أو إذن
          </button>
          <button className="flex items-center gap-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 px-5 py-2.5 rounded-xl text-sm font-black transition-colors border border-slate-200 shadow-sm hover:border-rose-200">
            <CircleX className="w-4 h-4 text-rose-500" /> إنهاء خدمات
          </button>
        </div>
      </div>

      {/* ─── شبكة الأنظمة والوحدات ─── */}
      <div className="h-full flex flex-col justify-center pb-12 animate-in fade-in duration-500 delay-150">
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-800 mb-2 border-r-4 border-indigo-600 pr-3">أنظمة الموارد البشرية (HR System)</h2>
          <p className="text-xs font-bold text-slate-500">اختر الوحدة التي تريد العمل عليها لتنفيذ الإجراءات وإدارة بيانات الموظفين والشركاء.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 justify-center">
          {HR_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                if (onNavigate) onNavigate(module.id);
              }}
              className={`bg-gradient-to-br ${module.gradient} p-6 rounded-[2rem] text-white hover:scale-[1.03] hover:-translate-y-2 hover:shadow-2xl transition-all flex flex-col items-center justify-center gap-4 group aspect-square relative overflow-hidden`}
            >
              {/* توهج خلفي في البطاقة */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
              
              {/* الشارات (Badges) */}
              {module.badge && (
                <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-sm animate-pulse-slow">
                  {module.badge === "LOADING" ? <Loader2 className="w-3 h-3 animate-spin" /> : module.badge}
                </div>
              )}

              {/* حاوية الأيقونة */}
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300 shadow-inner border border-white/10">
                <module.icon className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2} />
              </div>

              {/* العنوان */}
              <div className="font-black text-sm md:text-base text-center leading-snug whitespace-pre-line tracking-tight drop-shadow-sm z-10">
                {module.title}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}