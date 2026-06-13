import React, { useState, useEffect, useMemo } from "react";
import {
  Landmark,
  Plus,
  Wallet,
  Receipt,
  FileSpreadsheet,
  Banknote,
  Building2,
  ShieldCheck,
} from "lucide-react";

import api from "../../api/axios";

export default function AccountsDashboard({ onNavigate }) {
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
          activeEmployeesCount: employees.filter(
            (e) => e.status === "active",
          ).length,
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

  const ACCOUNT_MODULES = useMemo(
    () => [
      {
        id: "CONTRACTS_QIWA",
        title: "رواتب موظفي الأوتسورس",
        icon: Receipt,
        gradient: "from-emerald-500 to-teal-700 border-emerald-400",
        shadow: "shadow-emerald-500/30",
      },
      {
        id: "HR_PAYROLL",
        title: "الخزنة الرئيسية",
        icon: Banknote,
        gradient: "from-indigo-600 to-blue-700 border-indigo-500",
        shadow: "shadow-indigo-600/30",
      },
      {
        id: "BANK_ACCOUNTS",
        title: "الحسابات البنكية",
        icon: Building2,
        gradient: "from-violet-600 to-purple-800 border-violet-500",
        shadow: "shadow-violet-600/30",
      },
    ],
    [],
  );

  return (
    <div
      className="flex-1 w-full h-full overflow-y-auto custom-scrollbar relative font-cairo bg-slate-50"
      dir="rtl"
    >
      {/* الخلفيات */}
      <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-emerald-100/40 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="absolute bottom-0 left-0 w-[600px] h-[450px] bg-blue-100/40 rounded-full blur-[110px] pointer-events-none -z-10"></div>

      <div className="p-6 lg:p-10 max-w-[1600px] mx-auto min-h-full flex flex-col gap-10">
        {/* ───────────────── Header ───────────────── */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-white/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] gap-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 border border-emerald-500/50">
              <Landmark className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-black text-slate-800 text-2xl tracking-tight">
                مركز الحسابات
              </h3>

              <p className="text-xs font-bold text-slate-500 mt-1">
                إدارة الخزنة والرواتب والعمليات المالية
              </p>
            </div>
          </div>

          {/* العمليات السريعة */}
          <div className="flex flex-wrap items-center gap-3">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-black transition-all shadow-md shadow-emerald-600/20 active:scale-95">
              <Plus className="w-4 h-4" />
              إضافة عملية مالية
            </button>

            <button className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl text-sm font-black transition-all border border-slate-200 shadow-sm">
              <Wallet className="w-4 h-4 text-emerald-600" />
              حركة الخزنة
            </button>

            <button className="flex items-center gap-2 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 px-6 py-3 rounded-xl text-sm font-black transition-all border border-slate-200 shadow-sm">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              التقارير المالية
            </button>
          </div>
        </div>

        {/* ───────────────── الأنظمة ───────────────── */}
        <div className="pb-10">
          <div className="mb-8 pl-2">
            <h2 className="text-2xl font-black text-slate-800 mb-2 border-r-4 border-emerald-600 pr-4">
              الأنظمة المالية
            </h2>

            <p className="text-sm font-bold text-slate-500 pr-4">
              اختر النظام المطلوب لإدارة الحسابات والرواتب والخزنة.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5 sm:gap-6">
            {ACCOUNT_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (onNavigate) onNavigate(module.id);
                }}
                className={`bg-gradient-to-br ${module.gradient} p-5 sm:p-6 rounded-[2rem] border text-white hover:scale-[1.03] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center justify-center gap-4 group aspect-square relative overflow-hidden shadow-lg hover:${module.shadow}`}
              >
                {/* تأثيرات */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                {/* الأيقونة */}
                <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl group-hover:scale-110 group-hover:bg-white/20 transition-all duration-300 border border-white/10 relative z-10">
                  <module.icon
                    className="w-8 h-8 md:w-9 md:h-9 text-white"
                    strokeWidth={1.5}
                  />
                </div>

                {/* الاسم */}
                <div className="font-black text-xs md:text-sm text-center leading-relaxed tracking-wide z-10 px-1 mt-1">
                  {module.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ───────────────── Footer Card ───────────────── */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200 p-6 flex items-center gap-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <ShieldCheck className="w-7 h-7" />
          </div>

          <div>
            <h4 className="font-black text-slate-800">
              مركز مالي آمن ومتكامل
            </h4>

            <p className="text-sm text-slate-500 font-semibold mt-1">
              جميع العمليات المالية والرواتب تتم إدارتها ومراجعتها بشكل آمن.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}