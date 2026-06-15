import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  ShieldCheck,
  ClipboardCheck,
  FileSignature,
  Landmark,
  FileSearch,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default function SupervisorDashboard({ onNavigate }) {
  // جلب إحصائيات الاعتمادات (يمكنك تعديل الرابط لاحقاً ليناسب الباك إند الخاص بالاعتمادات)
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["supervisor-stats"],
    queryFn: async () => {
      const response = await axios.get("/quotations/stats"); // مثال
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  const stats = statsData || {
    pendingApproval: 0,
    awaitingSignature: 0,
  };

  // 💡 وحدات الإشراف الخمسة (Supervisor Modules)
  const SUPERVISOR_MODULES = useMemo(
    () => [
      {
        id: "OPERATIONS_SUPERVISOR", // سيفتح OperationsSupervisorScreen من الـ Wrapper
        title: "مشرف التوثيق\nوالختم",
        icon: ShieldCheck,
        gradient: "from-[#06111d] to-[#123f59]",
        badge: "نظام التوثيق",
      },
      {
        id: "QUOTATIONS_SUPERVISOR",
        title: "مشرف عروض\nالأسعار",
        icon: ClipboardCheck,
        gradient: "from-[#0e7490] to-[#15536f]",
        badge: stats.pendingApproval > 0 ? `${stats.pendingApproval} طلب معلق` : null,
      },
      {
        id: "CONTRACTS_SUPERVISOR",
        title: "مشرف العقود\nوالاتفاقيات",
        icon: FileSignature,
        gradient: "from-[#c5983c] to-[#e2bf74]",
      },
      {
        id: "FINANCE_SUPERVISOR",
        title: "مشرف الاعتمادات\nالمالية",
        icon: Landmark,
        gradient: "from-[#16a34a] to-[#059669]",
      },
      {
        id: "AUDIT_SUPERVISOR",
        title: "مشرف الجودة\nوالتدقيق الشامل",
        icon: FileSearch,
        gradient: "from-[#8b5cf6] to-[#7c3aed]",
      },
    ],
    [stats, isLoading]
  );

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-hidden bg-[#fbf8f1]/50 p-2 font-cairo lg:p-2.5" dir="rtl">
      {/* ─── الخلفية الجمالية (Glassmorphism Blobs) ─── */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-[#eef7f6] rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-96 bg-rose-50 rounded-tr-[100px] -z-10 blur-3xl opacity-50"></div>
      
      {/* ─── شريط العمليات السريعة للمشرفين ─── */}
      <div className="relative isolate flex shrink-0 flex-col gap-1.5 overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-3 py-1.5 text-white shadow-[0_12px_28px_rgba(18,63,89,0.14)] animate-in fade-in slide-in-from-top-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 left-10 h-28 w-28 rounded-full bg-[#e2bf74]/20 blur-3xl" />

        <div className="relative flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e2bf74] text-[#06111d] shadow-[0_10px_24px_rgba(226,191,116,0.18)]">
            <ShieldCheck className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-black leading-tight text-white">
              لوحة مشرفي الاعتمادات
            </h3>
            <p className="mt-0.5 hidden text-[9px] font-bold text-white/60 md:block">
              مركز التحكم الموحد للمشرفين، التوثيق، إدارة العروض والموافقات المالية.
            </p>
          </div>
        </div>
        
        <div className="relative grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:flex lg:items-center lg:justify-end">
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/30 px-3 text-[11px] font-black text-emerald-100 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-500/30"
          >
            <IconWithText icon={CheckCircle2} text="سجل الاعتمادات" iconClassName="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-[11px] font-black text-white transition hover:-translate-y-0.5 hover:bg-white/18"
          >
            <IconWithText icon={Clock} text="الطلبات المعلقة" iconClassName="h-4 w-4 text-amber-300" />
          </button>
          <button
            type="button"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-sky-300/25 bg-sky-500/10 px-3 text-[11px] font-black text-white transition hover:-translate-y-0.5 hover:bg-sky-500/18"
          >
            <IconWithText icon={Search} text="بحث في السجلات" iconClassName="h-4 w-4 text-sky-200" />
          </button>
        </div>
      </div>

      {/* ─── شبكة مشرفي النظام (5 بطاقات) ─── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-in fade-in duration-500 delay-150 justify-center">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4 flex items-center justify-center">
          {/* تم استخدام flex-wrap و تمديد البطاقات لتظهر بشكل متناسق في منتصف الشاشة */}
          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto w-full">
            {SUPERVISOR_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (onNavigate) onNavigate(module.id);
                }}
                className={`relative flex h-[160px] w-[180px] sm:w-[200px] flex-col items-center justify-center gap-3 overflow-hidden rounded-[24px] bg-gradient-to-br ${module.gradient} p-4 text-white transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(18,63,89,0.2)] group border border-white/10`}
              >
                {/* توهج خلفي في البطاقة */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                
                {/* الشارات (Badges) */}
                {module.badge && (
                  <div className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-[0_6px_14px_rgba(18,63,89,0.04)] animate-pulse-slow">
                    {module.badge === "LOADING" ? <Loader2 className="w-3 h-3 animate-spin" /> : module.badge}
                  </div>
                )}

                {/* حاوية الأيقونة */}
                <div className="rounded-2xl border border-white/15 bg-white/20 p-3.5 shadow-inner backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:bg-white/30">
                  <module.icon className="h-8 w-8 text-white" strokeWidth={1.5} />
                </div>

                {/* العنوان */}
                <div className="z-10 text-center text-xs font-black leading-snug tracking-tight drop-shadow-[0_6px_14px_rgba(18,63,89,0.04)] whitespace-pre-line">
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