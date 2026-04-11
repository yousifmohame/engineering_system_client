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
  Legend,
} from "recharts";

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
    if (value > 80) return "bg-blue-600 text-white";
    if (value > 40) return "bg-blue-400 text-white";
    return "bg-blue-100 text-blue-900";
  };

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" />
        <p>جاري تحليل البيانات...</p>
      </div>
    );

  const { kpi, areaData, pieData, heatMapData } = statsData || {};

  return (
    <div
      className="flex-1 flex flex-col h-full bg-stone-50 overflow-hidden rounded-xl border border-stone-200 m-2 relative"
      dir="rtl"
    >
      {/* مؤشر تحديث خفي */}

      {isRefetching && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 z-50">
          <div className="h-full bg-blue-600 animate-[progress_1s_ease-in-out_infinite]"></div>
        </div>
      )}

      {/* Header & Filters */}

      <div className="bg-white border-b border-stone-200 p-4 shrink-0 shadow-sm z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" /> مركز الإحصائيات
              والتحليلات
            </h2>

            <p className="text-stone-500 text-sm mt-1">
              نظرة شاملة على أداء تقسيمات الرياض والمعاملات البلدية
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-500 bg-stone-100 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> <span>محدث الآن</span>
            </div>

            <button
              onClick={() => refetch()}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-stone-50 text-stone-600 border border-stone-200 hover:bg-stone-100"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
              />{" "}
              تحديث
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" /> تصدير التقرير
            </button>
          </div>
        </div>

        {/* Global Filters */}

        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-stone-100">
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((f) => ({ ...f, period: e.target.value }))
            }
            className="bg-stone-50 border border-stone-200 text-sm text-stone-700 rounded-lg px-3 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">آخر 7 أيام</option>

            <option value="30">آخر 30 يوم</option>

            <option value="90">آخر 3 أشهر</option>

            <option value="365">السنة الحالية</option>
          </select>

          <select
            value={filters.sectorId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, sectorId: e.target.value }))
            }
            className="bg-stone-50 border border-stone-200 text-sm text-stone-700 rounded-lg px-3 py-2 outline-none cursor-pointer min-w-[150px] focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل القطاعات</option>

            {/* يمكنك جلب أسماء القطاعات هنا ديناميكياً إذا أردت، أو تركها كمثال */}

            <option value="1">قطاع وسط الرياض</option>

            <option value="2">قطاع شمال الرياض</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar print:p-0">
        {/* Top KPI Cards (Real Data) */}

        {kpi && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-stone-500 text-sm font-medium">
                  إجمالي المعاملات
                </span>

                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl font-bold text-stone-900">
                {kpi.totalTransactions.toLocaleString()}
              </div>

              <div className="flex items-center gap-1 text-xs mt-2 text-green-600">
                <ArrowUpRight className="w-3 h-3" />{" "}
                <span className="font-bold">{kpi.transactionsGrowth}%</span>{" "}
                <span className="text-stone-400">عن الشهر الماضي</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-stone-500 text-sm font-medium">
                  العملاء المسجلين
                </span>

                <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl font-bold text-stone-900">
                {kpi.totalClients.toLocaleString()}
              </div>

              <div className="flex items-center gap-1 text-xs mt-2 text-green-600">
                <ArrowUpRight className="w-3 h-3" />{" "}
                <span className="font-bold">{kpi.clientsGrowth}%</span>{" "}
                <span className="text-stone-400">عن الشهر الماضي</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-stone-500 text-sm font-medium">
                  الملكيات العقارية
                </span>

                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Building2 className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl font-bold text-stone-900">
                {kpi.totalProperties.toLocaleString()}
              </div>

              <div className="flex items-center gap-1 text-xs mt-2 text-green-600">
                <ArrowUpRight className="w-3 h-3" />{" "}
                <span className="font-bold">{kpi.propertiesGrowth}%</span>{" "}
                <span className="text-stone-400">عن الشهر الماضي</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-stone-500 text-sm font-medium">
                  متوسط الإنجاز
                </span>

                <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl font-bold text-stone-900">
                {kpi.avgCompletionTime}{" "}
                <span className="text-sm text-stone-500 font-normal">ساعة</span>
              </div>

              <div className="flex items-center gap-1 text-xs mt-2 text-green-600">
                <TrendingDown className="w-3 h-3" />{" "}
                <span className="font-bold">
                  {Math.abs(kpi.completionGrowth)}%
                </span>{" "}
                <span className="text-stone-400">أسرع من الماضي</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-stone-500 text-sm font-medium">
                  نسبة التعثر
                </span>

                <div className="p-2 rounded-lg bg-red-50 text-red-600">
                  <TriangleAlert className="w-5 h-5" />
                </div>
              </div>

              <div className="text-2xl font-bold text-stone-900">
                {kpi.rejectionRate}%
              </div>

              <div className="flex items-center gap-1 text-xs mt-2 text-red-600">
                <ArrowUpRight className="w-3 h-3" />{" "}
                <span className="font-bold">{kpi.rejectionGrowth}%</span>{" "}
                <span className="text-stone-400">ارتفاع طفيف</span>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-stone-800">تحليل حركة المعاملات</h3>

              <div className="flex gap-4">
                <span className="flex items-center gap-1.5 text-xs text-stone-600">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div> جديدة
                </span>

                <span className="flex items-center gap-1.5 text-xs text-stone-600">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>{" "}
                  مكتملة
                </span>
              </div>
            </div>

            <div className="h-[300px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={areaData}
                  margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />

                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>

                    <linearGradient
                      id="colorCompleted"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />

                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />

                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dy={10}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                    dx={-10}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",

                      border: "none",

                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="new"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorNew)"
                    name="جديدة"
                  />

                  <Area
                    type="monotone"
                    dataKey="completed"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompleted)"
                    name="مكتملة"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col">
            <h3 className="font-bold text-stone-800 mb-4">
              توزيع أنواع العملاء
            </h3>

            <div className="flex-1 min-h-[250px]" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="none"
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",

                      border: "none",

                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />

                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Real Heatmap Table */}

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-stone-800">
              الكثافة التشغيلية (الخريطة الحرارية الحقيقية)
            </h3>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-right">
              <thead>
                <tr>
                  <th className="p-3 text-stone-500 font-bold border-b border-stone-100">
                    الحي
                  </th>

                  <th className="text-center p-3 text-stone-500 font-bold border-b border-stone-100">
                    تقييم
                  </th>

                  <th className="text-center p-3 text-stone-500 font-bold border-b border-stone-100">
                    فرز
                  </th>

                  <th className="text-center p-3 text-stone-500 font-bold border-b border-stone-100">
                    دمج
                  </th>

                  <th className="text-center p-3 text-stone-500 font-bold border-b border-stone-100">
                    إفراغ
                  </th>

                  <th className="text-center p-3 text-stone-500 font-bold border-b border-stone-100">
                    رخص
                  </th>

                  <th className="text-center p-3 text-stone-900 font-black border-b border-stone-100">
                    المجموع
                  </th>
                </tr>
              </thead>

              <tbody>
                {heatMapData?.map((row, i) => (
                  <tr key={i} className="hover:bg-stone-50 transition-colors">
                    <td className="p-3 font-bold text-stone-800 border-b border-stone-100 truncate max-w-[120px]">
                      {row.nbh}
                    </td>

                    <td className="p-2 border-b border-stone-100 text-center">
                      <div
                        className={`rounded py-1.5 px-2 text-xs font-bold ${getHeatColor(row.eval)}`}
                      >
                        {row.eval}
                      </div>
                    </td>

                    <td className="p-2 border-b border-stone-100 text-center">
                      <div
                        className={`rounded py-1.5 px-2 text-xs font-bold ${getHeatColor(row.split)}`}
                      >
                        {row.split}
                      </div>
                    </td>

                    <td className="p-2 border-b border-stone-100 text-center">
                      <div
                        className={`rounded py-1.5 px-2 text-xs font-bold ${getHeatColor(row.merge)}`}
                      >
                        {row.merge}
                      </div>
                    </td>

                    <td className="p-2 border-b border-stone-100 text-center">
                      <div
                        className={`rounded py-1.5 px-2 text-xs font-bold ${getHeatColor(row.transfer)}`}
                      >
                        {row.transfer}
                      </div>
                    </td>

                    <td className="p-2 border-b border-stone-100 text-center">
                      <div
                        className={`rounded py-1.5 px-2 text-xs font-bold ${getHeatColor(row.license)}`}
                      >
                        {row.license}
                      </div>
                    </td>

                    <td className="p-3 text-center font-black text-stone-900 border-b border-stone-100 bg-stone-50/50">
                      {row.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
