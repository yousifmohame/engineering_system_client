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
  Loader2,
  Building2,
  ShieldCheck
} from "lucide-react";
import api from "../../api/axios"; // تأكد من مسار الـ API

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

  // 💡 ألوان Premium Gradient للمربعات مع التباين العالي والتأثير الزجاجي
  const HR_MODULES = useMemo(
    () => [
      {
        id: "DASHBOARD",
        title: "لوحة المؤشرات\nالتحليلية",
        icon: LayoutDashboard,
        gradient: "from-slate-800 to-slate-900 border-slate-700",
        shadow: "shadow-slate-900/30",
      },
      {
        id: "HR_EMPLOYEES",
        title: "إدارة الموظفين\nوملفاتهم",
        icon: Users,
        gradient: "from-blue-600 to-indigo-700 border-blue-500",
        shadow: "shadow-blue-600/30",
        badge: dashboardStats.employeesLoading ? "LOADING" : `${dashboardStats.activeEmployeesCount} نشط`,
        badgeColor: "bg-emerald-500/20 text-emerald-100 border-emerald-500/30"
      },
      {
        id: "ATTENDANCE_AI",
        title: "الحضور والانصراف\n(الذكي)",
        icon: Clock,
        gradient: "from-amber-500 to-orange-600 border-amber-400",
        shadow: "shadow-amber-500/30",
        badge: "AI Powered",
        badgeColor: "bg-white/20 text-white border-white/30"
      },
      {
        id: "CONTRACTS_QIWA",
        title: "العقود والاتفاقيات\n(بوابة قوى)",
        icon: FileText,
        gradient: "from-emerald-500 to-teal-600 border-emerald-400",
        shadow: "shadow-emerald-500/30",
      },
      {
        id: "HR_PAYROLL",
        title: "مسيرات الرواتب\n(نظام WPS)",
        icon: Banknote,
        gradient: "from-cyan-600 to-blue-700 border-cyan-500",
        shadow: "shadow-cyan-600/30",
      },
      {
        id: "LEAVES_ABSENCE",
        title: "الإجازات، السلف\nوالغياب",
        icon: Calendar,
        gradient: "from-rose-500 to-pink-600 border-rose-400",
        shadow: "shadow-rose-500/30",
      },
      {
        id: "HR_REQUESTS",
        title: "مركز الطلبات\nوالإجراءات",
        icon: Inbox,
        gradient: "from-violet-600 to-fuchsia-700 border-violet-500",
        shadow: "shadow-violet-600/30",
        badge: "إشعار جديد",
        badgeColor: "bg-rose-500/20 text-rose-100 border-rose-500/30"
      },
      {
        id: "MY_PORTAL",
        title: "بوابة الموظف\n(My Portal)",
        icon: SquareUserRound,
        gradient: "from-sky-500 to-blue-600 border-sky-400",
        shadow: "shadow-sky-500/30",
      },
      {
        id: "PROF_PLATFORMS",
        title: "المنصات المهنية\n(مهندسين/تخصصات)",
        icon: Award,
        gradient: "from-yellow-500 to-amber-600 border-yellow-400",
        shadow: "shadow-yellow-500/30",
      },
      {
        id: "RESIDENCY_INSURANCE",
        title: "الإقامات والتأمين\nالطبي",
        icon: ShieldCheck,
        gradient: "from-teal-500 to-emerald-600 border-teal-400",
        shadow: "shadow-teal-500/30",
      },
      {
        id: "HR_INTERNAL_FORMS",
        title: "النماذج الداخلية\nوالخطابات",
        icon: FileText,
        gradient: "from-purple-600 to-indigo-700 border-purple-500",
        shadow: "shadow-purple-600/30",
        badge: dashboardStats.formsLoading ? "LOADING" : `${dashboardStats.activeFormsCount} نموذج`,
        badgeColor: "bg-white/20 text-white border-white/30"
      },
      {
        id: "ASSETS_CUSTODY",
        title: "العهد، الأصول\nومركبات الشركة",
        icon: Computer,
        gradient: "from-slate-600 to-slate-800 border-slate-500",
        shadow: "shadow-slate-600/30",
      },
      {
        id: "HR_SETTINGS",
        title: "إعدادات الهيكل\nوالبدلات",
        icon: Settings,
        gradient: "from-zinc-700 to-neutral-900 border-zinc-600",
        shadow: "shadow-zinc-700/30",
      },
      {
        id: "SMART_UPDATE",
        title: "التحديث الذكي\n(Smart AI)",
        icon: Bot,
        gradient: "from-fuchsia-600 to-pink-700 border-fuchsia-500",
        shadow: "shadow-fuchsia-600/30",
        badge: "BETA",
        badgeColor: "bg-yellow-500/20 text-yellow-100 border-yellow-500/30"
      },
    ],
    [dashboardStats]
  );

  return (
    // 💡 تم إصلاح الـ flex هنا لإتاحة الـ Scrolling الصحيح لكامل الصفحة
    <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar relative font-cairo bg-slate-50" dir="rtl">
      
      {/* ─── الخلفيات الزخرفية (Ambient Backgrounds) ─── */}
      <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] pointer-events-none -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[500px] bg-indigo-100/40 rounded-full blur-[100px] pointer-events-none -z-10 mix-blend-multiply"></div>

      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full flex flex-col gap-10">
        
        {/* ─── الشريط العلوي للعمليات السريعة ─── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white/70 backdrop-blur-2xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] shrink-0 gap-5 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 border border-indigo-500/50">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-black text-slate-800 text-xl md:text-2xl tracking-tight">إدارة الموارد البشرية</h3>
              <p className="text-xs font-bold text-slate-500 mt-1">بوابة العمليات السريعة والاختصارات الإدارية</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-md shadow-indigo-600/20 active:scale-95">
              <Plus className="w-4 h-4" /> إضافة موظف
            </button>
            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl text-sm font-black transition-all border border-slate-200 shadow-sm hover:border-slate-300 active:scale-95">
              <Clock className="w-4 h-4 text-emerald-600" /> إجازة / استئذان
            </button>
            <button className="flex items-center gap-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-700 px-6 py-3 rounded-xl text-sm font-black transition-all border border-slate-200 shadow-sm hover:border-rose-200 active:scale-95">
              <CircleX className="w-4 h-4 text-rose-500" /> طي قيد
            </button>
          </div>
        </div>

        {/* ─── شبكة الأنظمة والوحدات ─── */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-10">
          <div className="mb-8 pl-2">
            <h2 className="text-2xl font-black text-slate-800 mb-2 border-r-4 border-indigo-600 pr-4">الأنظمة الفرعية والوحدات</h2>
            <p className="text-sm font-bold text-slate-500 pr-4">انقر على أي وحدة للدخول وإدارة البيانات المتعلقة بها.</p>
          </div>

          {/* 💡 تصميم الشبكة تم تحديثه ليكون مرناً مع الشاشات ويدعم التمرير */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6 justify-center">
            {HR_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (onNavigate) onNavigate(module.id);
                }}
                className={`bg-gradient-to-br ${module.gradient} p-5 sm:p-6 rounded-[2rem] border text-white hover:scale-[1.03] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-4 group aspect-square relative overflow-hidden shadow-lg hover:${module.shadow}`}
              >
                {/* ── مؤثر الإضاءة الداخلي ── */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                
                {/* ── الشارات (Badges) ── */}
                {module.badge && (
                  <div className={`absolute top-4 right-4 ${module.badgeColor || 'bg-white/20 text-white border-white/30'} text-[9px] font-black px-2 py-1 rounded-lg backdrop-blur-md border shadow-sm flex items-center gap-1`}>
                    {module.badge === "LOADING" ? <Loader2 className="w-3 h-3 animate-spin" /> : module.badge}
                  </div>
                )}

                {/* ── الأيقونة ── */}
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 shadow-inner border border-white/10 relative z-10">
                  <module.icon className="w-8 h-8 md:w-9 md:h-9 text-white drop-shadow-sm" strokeWidth={1.5} />
                </div>

                {/* ── العنوان ── */}
                <div className="font-black text-xs md:text-sm text-center leading-relaxed tracking-wide drop-shadow-md z-10 px-1 mt-1">
                  {module.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}