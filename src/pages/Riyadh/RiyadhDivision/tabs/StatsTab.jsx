import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import {
  TrendingUp,
  Clock,
  RefreshCw,
  Download,
  FileText,
  Users,
  Building2,
  TriangleAlert,
  TrendingDown,
  Loader2,
  ArrowUpRight,
  PieChart,
  BarChart3,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

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

const printRiyadhNode = (selector, title = "Riyadh Report") => {
  const node = document.querySelector(selector);

  if (!node) {
    window.print();
    return;
  }

  const styles = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((item) => item.outerHTML)
    .join("\n");

  const popup = window.open("", "_blank", "width=1200,height=900");

  if (!popup) {
    window.print();
    return;
  }

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html lang="ar" dir="rtl">
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        ${styles}
        <style>
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #123f59 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            font-family: Tajawal, Arial, sans-serif !important;
          }

          body {
            width: 100% !important;
            overflow: visible !important;
          }

          #print-root {
            width: 100% !important;
            max-width: 100% !important;
            min-height: auto !important;
            overflow: visible !important;
            background: #ffffff !important;
          }

          #print-root * {
            max-width: 100% !important;
          }

          [data-no-print="true"],
          .no-print,
          .print-hidden,
          button,
          select,
          input,
          textarea {
            display: none !important;
          }

          .hidden {
            display: block !important;
          }

          .print\\:hidden {
            display: none !important;
          }

          .print\\:block {
            display: block !important;
          }

          .overflow-hidden,
          .overflow-y-auto,
          .overflow-x-auto,
          .overflow-auto,
          .custom-scrollbar-slim {
            overflow: visible !important;
          }

          .fixed,
          .sticky {
            position: static !important;
          }

          .shadow-xl,
          .shadow-lg,
          .shadow-md,
          .shadow-sm,
          [class*="shadow-"] {
            box-shadow: none !important;
          }

          .grid {
            page-break-inside: avoid;
          }

          table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          th,
          td {
            border-color: #d8b46a !important;
            padding: 6px !important;
          }

          svg {
            max-width: 100% !important;
          }
        </style>
      </head>

      <body>
        <main id="print-root">${node.outerHTML}</main>
      </body>
    </html>
  `);
  popup.document.close();

  setTimeout(() => {
    popup.focus();
    popup.print();
    setTimeout(() => popup.close(), 600);
  }, 350);
};

const escapeCsvValue = (value) => {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
};

const buildCsvContent = (headers, rows) => {
  return (
    "\uFEFF" +
    [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n")
  );
};

const getExportDateStamp = () => new Date().toISOString().slice(0, 10);



const formatNumber = (value) =>
  Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 1 });

const EmptyState = ({ icon: Icon = PieChart, title = "لا توجد بيانات" }) => {
  return (
    <div className="flex h-full min-h-[130px] flex-col items-center justify-center rounded-xl border border-dashed border-[#d8b46a]/35 bg-[#fbf8f1]/60 text-center">
      <Icon className="mb-2 h-7 w-7 text-[#94a3b8]" />
      <p className="text-[11px] font-black text-[#64748b]">{title}</p>
    </div>
  );
};

const KpiCard = ({ title, value, suffix = "", hint, icon: Icon, tone = "teal" }) => {
  const toneClasses = {
    teal: "text-[#0e7490] bg-[#eef7f6]",
    green: "text-emerald-600 bg-emerald-50",
    orange: "text-orange-500 bg-orange-50",
    red: "text-red-600 bg-red-50",
    navy: "text-[#123f59] bg-[#eef7f6]",
  };

  return (
    <div className="min-w-0 rounded-xl border border-[#d8b46a]/25 bg-white/95 p-2.5 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
      <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate text-[10px] font-black text-[#94a3b8]">
          {title}
        </span>
        <span
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg ${
            toneClasses[tone] || toneClasses.teal
          }`}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>

      <div className="truncate text-lg font-black leading-tight text-[#123f59]">
        {value}
        {suffix && (
          <span className="mr-1 text-[10px] font-black text-[#94a3b8]">
            {suffix}
          </span>
        )}
      </div>

      {hint && (
        <div className="mt-1 flex min-w-0 items-center gap-1 text-[9px] font-bold text-emerald-600">
          <ArrowUpRight className="h-3 w-3 shrink-0" />
          <span className="truncate">{hint}</span>
        </div>
      )}
    </div>
  );
};

const StatsTab = () => {
  const [filters, setFilters] = useState({
    period: "30",
    sectorId: "all",
    transactionType: "all",
  });

  const {
    data: statsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["riyadh-stats", filters],
    queryFn: async () =>
      (await api.get("/riyadh-streets/dashboard-stats", { params: filters }))
        .data,
  });

  const getHeatColor = (value) => {
    if (value > 80) return "bg-[#0e7490] text-white";
    if (value > 40) return "bg-[#eef7f6] text-[#123f59]";
    return "bg-white text-[#64748b]";
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white/90">
        <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#0e7490]" />
        <p className="text-[12px] font-black text-[#64748b]">
          جاري تحليل البيانات...
        </p>
      </div>
    );
  }

  const { kpi = {}, areaData = [], pieData = [], heatMapData = [] } =
    statsData || {};

  const safeAreaData = Array.isArray(areaData) ? areaData : [];
  const safePieData = Array.isArray(pieData) ? pieData : [];
  const safeHeatMap = Array.isArray(heatMapData) ? heatMapData : [];

  const kpiCards = [
    {
      title: "إجمالي المعاملات",
      value: formatNumber(kpi.totalTransactions),
      hint: `${formatNumber(kpi.transactionsGrowth)}% عن الماضي`,
      icon: FileText,
      tone: "teal",
    },
    {
      title: "العملاء المسجلين",
      value: formatNumber(kpi.totalClients),
      hint: `${formatNumber(kpi.clientsGrowth)}% عن الماضي`,
      icon: Users,
      tone: "navy",
    },
    {
      title: "الملكيات العقارية",
      value: formatNumber(kpi.totalProperties),
      hint: `${formatNumber(kpi.propertiesGrowth)}% عن الماضي`,
      icon: Building2,
      tone: "green",
    },
    {
      title: "متوسط الإنجاز",
      value: formatNumber(kpi.avgCompletionTime),
      suffix: "ساعة",
      hint: `${formatNumber(Math.abs(kpi.completionGrowth))}% أسرع`,
      icon: Clock,
      tone: "orange",
    },
    {
      title: "نسبة التعثر",
      value: `${formatNumber(kpi.rejectionRate)}%`,
      hint: `${formatNumber(kpi.rejectionGrowth)}% ارتفاع`,
      icon: TriangleAlert,
      tone: "red",
    },
  ];

  const pieColors = ["#0e7490", "#123f59", "#c5983c", "#10b981", "#f97316"];

  return (
    <section
      data-print-root="riyadh-stats-report"
      className="
        flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden
        rounded-[18px] border border-[#d8b46a]/25 bg-white/90
        shadow-[0_8px_22px_rgba(18,63,89,0.06)]
      "
      dir="rtl"
    >
      {isRefetching && (
        <div className="h-1 shrink-0 bg-[#d8b46a]/20">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-[#0e7490]" />
        </div>
      )}

      <div className="shrink-0 border-b border-[#e8ddc8] bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6] p-2.5">
        <div className="flex min-w-0 flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#0e7490] text-white">
              <BarChart3 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black text-[#123f59]">
                مركز التحليلات والإحصائيات
              </h2>
              <p className="truncate text-[10px] font-bold text-[#94a3b8]">
                مؤشرات مختصرة ورسوم بيانية متجاوبة مع حجم الشاشة.
              </p>
            </div>
          </div>

          <div data-no-print="true" className="flex min-w-0 flex-wrap items-center gap-1.5">
            <button
              onClick={() => printRiyadhNode('[data-print-root="riyadh-stats-report"]', "Riyadh Statistics Report")}
              className="inline-flex h-8 items-center justify-center rounded-xl bg-[#0e7490] px-2.5 text-[10px] font-black text-white transition hover:bg-[#15536f]"
              type="button"
            >
              <IconWithText
                icon={Download}
                text="تصدير"
                iconClassName="h-3.5 w-3.5"
              />
            </button>

            <button
              onClick={() => refetch()}
              className="inline-flex h-8 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2.5 text-[10px] font-black text-[#64748b] transition hover:bg-[#fbf8f1] hover:text-[#123f59]"
              type="button"
            >
              <IconWithText
                icon={RefreshCw}
                text="تحديث"
                iconClassName={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />
            </button>

            <select
              value={filters.period}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, period: event.target.value }))
              }
              className="h-8 rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[10px] font-black text-[#475569] outline-none focus:border-[#0e7490]"
            >
              <option value="7">آخر 7 أيام</option>
              <option value="30">آخر 30 يوم</option>
              <option value="90">آخر 3 أشهر</option>
              <option value="365">السنة الحالية</option>
            </select>

            <select
              value={filters.sectorId}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, sectorId: event.target.value }))
              }
              className="h-8 rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[10px] font-black text-[#475569] outline-none focus:border-[#0e7490]"
            >
              <option value="all">كل القطاعات</option>
              <option value="1">قطاع وسط الرياض</option>
              <option value="2">قطاع شمال الرياض</option>
            </select>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-2.5 custom-scrollbar-slim">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} />
          ))}
        </div>

        <div className="mt-2.5 grid min-h-0 grid-cols-1 gap-2.5 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <div className="min-w-0 space-y-2.5">
            <div className="rounded-xl border border-[#d8b46a]/25 bg-white/95 p-2.5 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <div className="mb-2 flex min-w-0 items-center justify-between gap-2">
                <h3 className="truncate text-[12px] font-black text-[#123f59]">
                  حركة المعاملات الزمنية
                </h3>
                <div className="hidden items-center gap-2 text-[9px] font-bold text-[#94a3b8] sm:flex">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#0e7490]" />
                    جديدة
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    مكتملة
                  </span>
                </div>
              </div>

              <div className="h-[230px] min-h-[180px]" dir="ltr">
                {safeAreaData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={safeAreaData}
                      margin={{ top: 8, right: 4, left: -16, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="newColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0e7490" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#0e7490" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="doneColor" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8ddc8" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e8ddc8",
                          boxShadow: "0 8px 22px rgba(18,63,89,.08)",
                          fontSize: 11,
                        }}
                      />
                      <Area type="monotone" dataKey="new" stroke="#0e7490" strokeWidth={2} fillOpacity={1} fill="url(#newColor)" />
                      <Area type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#doneColor)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={PieChart} title="لا توجد بيانات زمنية" />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#d8b46a]/25 bg-white/95 p-2.5 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <h3 className="mb-2 truncate text-[12px] font-black text-[#123f59]">
                الكثافة التشغيلية للأحياء
              </h3>

              <div className="overflow-x-auto custom-scrollbar-slim">
                <table className="w-full min-w-[440px] text-right text-[10px]">
                  <thead>
                    <tr className="border-b border-[#e8ddc8] text-[#94a3b8]">
                      <th className="px-2 py-2 font-black">الحي</th>
                      <th className="px-2 py-2 font-black">تقديم</th>
                      <th className="px-2 py-2 font-black">فرز</th>
                      <th className="px-2 py-2 font-black">دمج</th>
                      <th className="px-2 py-2 font-black">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeHeatMap.length ? (
                      safeHeatMap.map((row, index) => (
                        <tr key={row.name || index} className="border-b border-[#f1eadc] last:border-none">
                          <td className="px-2 py-2 font-black text-[#123f59]">
                            {row.name}
                          </td>
                          {["submission", "sorting", "merging", "total"].map((field) => (
                            <td key={field} className="px-2 py-2">
                              <span
                                className={`inline-flex min-w-[42px] items-center justify-center rounded-lg px-2 py-1 text-[9px] font-black ${getHeatColor(row[field])}`}
                              >
                                {formatNumber(row[field])}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-[11px] font-black text-[#94a3b8]">
                          لا توجد بيانات تشغيلية حالياً
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <aside className="min-w-0 space-y-2.5">
            <div className="rounded-xl border border-[#d8b46a]/25 bg-white/95 p-2.5 shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
              <h3 className="mb-2 truncate text-[12px] font-black text-[#123f59]">
                توزيع قاعدة العملاء
              </h3>

              <div className="h-[230px] min-h-[180px]">
                {safePieData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={safePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={74}
                        dataKey="value"
                        paddingAngle={2}
                      >
                        {safePieData.map((entry, index) => (
                          <Cell
                            key={`cell-${entry.name || index}`}
                            fill={pieColors[index % pieColors.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid #e8ddc8",
                          fontSize: 11,
                        }}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyState icon={PieChart} title="لا توجد بيانات للعملاء" />
                )}
              </div>
            </div>

            <div className="rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1]/80 p-2.5">
              <h3 className="mb-2 text-[12px] font-black text-[#123f59]">
                ملخص سريع
              </h3>
              <div className="space-y-1.5 text-[10px] font-bold text-[#64748b]">
                <p>• إجمالي المعاملات: {formatNumber(kpi.totalTransactions)}</p>
                <p>• عدد العملاء: {formatNumber(kpi.totalClients)}</p>
                <p>• متوسط الإنجاز: {formatNumber(kpi.avgCompletionTime)} ساعة</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

export default StatsTab;
