import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  ShieldCheck,
  ClipboardCheck,
  FileSignature,
  Landmark,
  FileSearch,
  Banknote,
  Search,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";

export default function SupervisorDashboard({ onNavigate }) {
  const { data: statsData } = useQuery({
    queryKey: ["supervisor-stats"],
    queryFn: async () => {
      const response = await axios.get("/quotations/stats");
      return response.data.data;
    },
    refetchInterval: 60000,
  });

  const stats = statsData || {
    pendingApproval: 0,
  };

  const SUPERVISOR_MODULES = useMemo(
    () => [
      {
        id: "OPERATIONS_SUPERVISOR",
        title: "مشرف التوثيق\nوالختم",
        icon: ShieldCheck,
        color: "text-blue-700",
        bg: "bg-blue-500/20",
        borderColor: "border-blue-200",
        badge: "أساسي",
      },
      {
        id: "QUOTATIONS_SUPERVISOR",
        title: "مشرف عروض\nالأسعار",
        icon: ClipboardCheck,
        color: "text-teal-700",
        bg: "bg-teal-500/20",
        borderColor: "border-teal-200",
        badge:
          stats.pendingApproval > 0
            ? `${stats.pendingApproval} طلب معلق`
            : null,
      },
      {
        id: "CONTRACTS_SUPERVISOR",
        title: "مشرف العقود\nوالاتفاقيات",
        icon: FileSignature,
        color: "text-amber-700",
        bg: "bg-amber-500/20",
        borderColor: "border-amber-200",
      },
      {
        id: "FINANCE_SUPERVISOR",
        title: "مشرف الاعتمادات\nالمالية",
        icon: Landmark,
        color: "text-emerald-700",
        bg: "bg-emerald-500/20",
        borderColor: "border-emerald-200",
      },
      {
        id: "PAYROLL_SUPERVISOR",
        title: "مشرف مسيرات\nالرواتب",
        icon: Banknote,
        color: "text-indigo-700",
        bg: "bg-indigo-500/20",
        borderColor: "border-indigo-200",
        badge: "جديد",
      },
      {
        id: "AUDIT_SUPERVISOR",
        title: "مشرف الجودة\nوالتدقيق الشامل",
        icon: FileSearch,
        color: "text-purple-700",
        bg: "bg-purple-500/20",
        borderColor: "border-purple-200",
      },
    ],
    [stats]
  );

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden font-cairo"
      dir="rtl"
    >
      {/* Header */}
      <div className="shrink-0 p-4 sm:p-5 lg:p-6 border-b border-white/40 bg-white/40 backdrop-blur-md">
        <div className="flex flex-col xl:flex-row gap-5 justify-between xl:items-center">
          {/* Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 text-teal-800 flex items-center justify-center border border-teal-500/30 shadow-inner flex-shrink-0">
              <ShieldCheck className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-black text-[#123f59]">
                لوحة مشرفي الاعتمادات
              </h2>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                مركز التحكم الموحد للمشرفين، التوثيق، المسيرات وإدارة
                الموافقات.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <button className="px-3 sm:px-5 py-2 rounded-xl sm:rounded-2xl bg-white/50 text-[#123f59] font-black border border-white/60 hover:bg-white transition-all flex items-center gap-2 text-xs sm:text-sm shadow-sm">
              <CheckCircle2 size={16} className="text-emerald-600" />
              سجل الاعتمادات
            </button>

            <button className="px-3 sm:px-5 py-2 rounded-xl sm:rounded-2xl bg-white/50 text-[#123f59] font-black border border-white/60 hover:bg-white transition-all flex items-center gap-2 text-xs sm:text-sm shadow-sm">
              <Search size={16} className="text-sky-600" />
              بحث في السجلات
            </button>

            <button className="px-3 sm:px-6 py-2 rounded-xl sm:rounded-2xl bg-[#123f59] text-white font-black shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 text-xs sm:text-sm">
              <Clock size={16} className="text-amber-300" />
              الطلبات المعلقة
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6">
        <div
          className="
            grid
            grid-cols-1
            xs:grid-cols-2
            md:grid-cols-3
            xl:grid-cols-4
            gap-4
            sm:gap-6
            max-w-7xl
            mx-auto
          "
        >
          {SUPERVISOR_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => onNavigate?.(module.id)}
              className="
                group
                relative
                overflow-hidden
                bg-white/40
                backdrop-blur-xl
                border
                border-white/60
                rounded-3xl
                p-5
                sm:p-6
                shadow-lg
                hover:bg-white/60
                hover:-translate-y-1
                transition-all
                duration-300
                min-h-[180px]
                sm:min-h-[210px]
                flex
                flex-col
                items-center
                justify-center
                text-center
              "
            >
              {/* Glow */}
              <div className="absolute top-[-20%] right-[-20%] w-32 h-32 bg-white/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />

              {/* Badge */}
              {module.badge && (
                <div
                  className={`absolute top-3 right-3 z-20 text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded-xl backdrop-blur-md border shadow-sm flex items-center gap-1
                  ${
                    module.badge === "جديد"
                      ? "bg-indigo-500/20 text-indigo-700 border-indigo-200"
                      : "bg-white/50 text-[#123f59] border-white/60"
                  }`}
                >
                  {module.badge === "LOADING" ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    module.badge
                  )}
                </div>
              )}

              {/* Icon */}
              <div
                className={`
                  h-14 w-14
                  sm:h-16 sm:w-16
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  mb-4
                  ${module.bg}
                  ${module.color}
                  border
                  ${module.borderColor}
                  shadow-inner
                  group-hover:scale-110
                  group-hover:rotate-3
                  transition-all
                  duration-300
                  z-10
                `}
              >
                <module.icon
                  className="h-7 w-7 sm:h-8 sm:w-8"
                  strokeWidth={1.5}
                />
              </div>

              {/* Title */}
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-[#123f59] whitespace-pre-line leading-relaxed z-10">
                {module.title}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}