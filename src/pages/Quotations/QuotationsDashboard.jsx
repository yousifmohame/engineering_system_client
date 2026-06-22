import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  Plus,
  Upload,
  Search,
  ClipboardList,
  FileText,
  Layout,
  Package,
  ShieldCheck,
  CreditCard,
  BarChart3,
  RotateCcw,
  Settings,
  Bell,
  ScrollText,
  Archive,
  Link2,
  Sparkles,
  TrendingUp,
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

export default function QuotationsDashboard({ onNavigate }) {
  const { data: statsData, isLoading } = useQuery({
    queryKey: ["quotations-stats"],
    queryFn: async () => {
      const response = await axios.get("/quotations/stats");
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  const stats = statsData || {
    totalQuotations: 0,
    pendingApproval: 0,
    awaitingSignature: 0,
    cancelled: 0,
  };

  // 💡 قائمة الوحدات مطابقة لتصميم الـ HR المرفق
  const QUOTATION_MODULES = useMemo(
    () => [
      {
        id: "DASHBOARD",
        title: "لوحة المؤشرات\n(Dashboard)",
        icon: ClipboardList,
        gradient: "from-[#06111d] to-[#123f59]",
      },
      {
        id: "DIRECTORY",
        title: "دليل العروض",
        icon: FileText,
        gradient: "from-[#0e7490] to-[#15536f]",
        badge: isLoading ? "LOADING" : `${stats.totalQuotations} عرض`,
      },
      {
        id: "TEMPLATES",
        title: "نماذج عروض الأسعار",
        icon: Layout,
        gradient: "from-[#c5983c] to-[#e2bf74]",
      },
      {
        id: "ITEMS",
        title: "البنود والمجموعات",
        icon: Package,
        gradient: "from-[#0369a1] to-[#1e3a8a]",
      },
      {
        id: "PAYMENTS",
        title: "الدفعات والتحصيل",
        icon: CreditCard,
        gradient: "from-[#16a34a] to-[#059669]",
      },
      {
        id: "REPORTS",
        title: "تقارير العروض",
        icon: BarChart3,
        gradient: "from-[#ea580c] to-[#c2410c]",
      },
      {
        id: "CANCELLATIONS",
        title: "الملغاة والاسترجاع",
        icon: RotateCcw,
        gradient: "from-[#be123c] to-[#9f1239]",
        badge: stats.cancelled > 0 ? `${stats.cancelled} ملغى` : null,
      },
      {
        id: "SETTINGS",
        title: "إعدادات النظام",
        icon: Settings,
        gradient: "from-[#64748b] to-[#334155]",
      },
      {
        id: "NOTIFICATIONS",
        title: "مركز الإشعارات",
        icon: Bell,
        gradient: "from-[#ca8a04] to-[#a16207]",
      },
      {
        id: "AUDIT_LOGS",
        title: "سجل التدقيق",
        icon: ScrollText,
        gradient: "from-[#4f46e5] to-[#3730a3]",
      },
      {
        id: "ARCHIVE",
        title: "التصدير والأرشفة",
        icon: Archive,
        gradient: "from-[#0891b2] to-[#0e7490]",
      },
      {
        id: "CLIENTS_LINK",
        title: "ربط العملاء",
        icon: Link2,
        gradient: "from-[#0f766e] to-[#134e4a]",
      },
      {
        id: "AI_ASSISTANT",
        title: "المساعد الذكي",
        icon: Sparkles,
        gradient: "from-[#2563eb] to-[#1d4ed8]",
        badge: "AI",
      },
      {
        id: "ANALYTICS",
        title: "التحليلات الشاملة",
        icon: TrendingUp,
        gradient: "from-[#dc2626] to-[#b91c1c]",
      },
    ],
    [stats, isLoading]
  );

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col gap-1.5 overflow-hidden bg-[#fbf8f1]/50 p-2 font-cairo lg:p-2.5" dir="rtl">
      {/* ─── الخلفية الجمالية (Glassmorphism Blobs) ─── */}
      <div className="absolute top-0 right-0 w-1/2 h-96 bg-[#eef7f6] rounded-bl-[100px] -z-10 blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-96 bg-rose-50 rounded-tr-[100px] -z-10 blur-3xl opacity-50"></div>
      
      {/* ─── شريط العمليات السريعة ─── */}
      <div className="relative isolate flex shrink-0 flex-col gap-1.5 overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-3 py-1.5 text-white shadow-[0_12px_28px_rgba(18,63,89,0.14)] animate-in fade-in slide-in-from-top-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-white/5 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 left-10 h-28 w-28 rounded-full bg-[#e2bf74]/20 blur-3xl" />

        <div className="relative flex min-w-0 items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#e2bf74] text-[#06111d] shadow-[0_10px_24px_rgba(226,191,116,0.18)]">
            <ClipboardList className="h-4.5 w-4.5" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-black leading-tight text-white">
              عروض الأسعار والتسعير
            </h3>
            <p className="mt-0.5 hidden text-[9px] font-bold text-white/60 md:block">
              إجراءات مختصرة لإدارة عروض الأسعار والاعتمادات.
            </p>
          </div>
        </div>
        
        <div className="relative grid grid-cols-1 gap-1.5 sm:grid-cols-3 lg:flex lg:items-center lg:justify-end">
          <button
            type="button"
            onClick={() => onNavigate?.("CREATE_QUOTATION")}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl bg-[#e2bf74] px-3 text-[11px] font-black text-[#06111d] shadow-[0_10px_20px_rgba(226,191,116,0.18)] transition hover:-translate-y-0.5 hover:bg-[#f1d38f]"
          >
            <IconWithText icon={Plus} text="عرض سعر جديد" iconClassName="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-[11px] font-black text-white transition hover:-translate-y-0.5 hover:bg-white/18"
          >
            <IconWithText icon={Upload} text="استيراد البيانات" iconClassName="h-4 w-4 text-emerald-300" />
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-xl border border-sky-300/25 bg-sky-500/10 px-3 text-[11px] font-black text-white transition hover:-translate-y-0.5 hover:bg-sky-500/18"
          >
            <IconWithText icon={Search} text="بحث متقدم" iconClassName="h-4 w-4 text-sky-200" />
          </button>
        </div>
      </div>

      {/* ─── شبكة الأنظمة والوحدات ─── */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden animate-in fade-in duration-500 delay-150">
        <div data-hr-modules-scroll className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim rounded-2xl border border-[#e8ddc8]/60 bg-white/50 p-1.5">
          <div className="grid min-w-0 grid-cols-1 gap-2.5 pb-3 pr-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {QUOTATION_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (onNavigate) onNavigate(module.id);
                }}
                className={`relative flex min-h-[104px] min-w-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[16px] bg-gradient-to-br ${module.gradient} p-2.5 text-white transition-all hover:-translate-y-1 hover:shadow-[0_10px_24px_rgba(18,63,89,0.14)]`}
              >
                {/* توهج خلفي في البطاقة */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
                
                {/* الشارات (Badges) */}
                {module.badge && (
                  <div className="absolute top-4 right-4 bg-white/20 text-white text-[10px] font-black px-2 py-1 rounded-lg backdrop-blur-md border border-white/20 shadow-[0_6px_14px_rgba(18,63,89,0.04)] animate-pulse-slow">
                    {module.badge === "LOADING" ? <Loader2 className="w-3 h-3 animate-spin" /> : module.badge}
                  </div>
                )}

                {/* حاوية الأيقونة */}
                <div className="rounded-xl border border-white/15 bg-white/20 p-2.5 shadow-inner backdrop-blur-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-white/30">
                  <module.icon className="h-6 w-6 text-white" strokeWidth={2} />
                </div>

                {/* العنوان */}
                <div className="z-10 text-center text-[11px] font-black leading-snug tracking-tight drop-shadow-[0_6px_14px_rgba(18,63,89,0.04)] md:text-xs whitespace-pre-line">
                  {module.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        [data-hr-modules-scroll]::-webkit-scrollbar { width: 9px; }
        [data-hr-modules-scroll]::-webkit-scrollbar-track { background: rgba(216, 180, 106, 0.18); border-radius: 999px; }
        [data-hr-modules-scroll]::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #0e7490, #c5983c); border-radius: 999px; border: 2px solid rgba(255, 255, 255, 0.8); }
        [data-hr-modules-scroll] { scrollbar-width: thin; scrollbar-color: #0e7490 rgba(216, 180, 106, 0.18); }
      `}</style>
    </div>
  );
}