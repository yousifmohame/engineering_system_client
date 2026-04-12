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
    return "bg-blue-50 text-blue-800";
  };

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" />
        <p className="text-sm font-bold text-stone-600">
          جاري تحليل البيانات...
        </p>
      </div>
    );

  const { kpi, areaData, pieData, heatMapData } = statsData || {};

  return (
    <div
      className="flex-1 flex flex-col h-full bg-stone-50/50 overflow-hidden rounded-xl border border-stone-200 m-1 relative"
      dir="rtl"
    >
      {/* مؤشر تحديث خفي */}
      {isRefetching && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 z-50">
          <div className="h-full bg-blue-600 animate-[progress_1s_ease-in-out_infinite]"></div>
        </div>
      )}

      {/* Header & Filters (مكثف) */}
      <div className="bg-white border-b border-stone-200 p-2.5 shrink-0 z-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 rounded-lg">
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-sm font-black text-stone-900 leading-none">
            مركز التحليلات والإحصائيات
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* الفلاتر مدمجة مع الأزرار */}
          <select
            value={filters.period}
            onChange={(e) =>
              setFilters((f) => ({ ...f, period: e.target.value }))
            }
            className="bg-stone-50 border border-stone-200 text-[11px] font-bold text-stone-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
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
            className="bg-stone-50 border border-stone-200 text-[11px] font-bold text-stone-700 rounded-lg px-2 py-1.5 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">كل القطاعات</option>
            <option value="1">قطاع وسط الرياض</option>
            <option value="2">قطاع شمال الرياض</option>
          </select>

          <div className="h-5 w-px bg-stone-200 mx-1"></div>

          <button
            onClick={() => refetch()}
            title="تحديث البيانات"
            className="p-1.5 rounded-lg text-stone-500 bg-stone-50 border border-stone-200 hover:bg-stone-100 hover:text-stone-800 transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
          </button>
          <button
            onClick={() => window.print()}
            title="تصدير التقرير"
            className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area (شاشة كاملة بدون سكرول خارجي) */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 gap-3 print:p-0">
        {/* Top KPI Cards (Ultra Dense) */}
        {kpi && (
          <div className="grid grid-cols-5 gap-1 shrink-0">
            {/* Card 1 */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-stone-500">
                  إجمالي المعاملات
                </span>
                <FileText className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <div className="text-xl font-black text-stone-800 tracking-tight">
                {kpi.totalTransactions.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[9px] mt-1 text-green-600 font-bold">
                <ArrowUpRight className="w-2.5 h-2.5" />{" "}
                {kpi.transactionsGrowth}% عن الماضي
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-stone-500">
                  العملاء المسجلين
                </span>
                <Users className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <div className="text-xl font-black text-stone-800 tracking-tight">
                {kpi.totalClients.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[9px] mt-1 text-green-600 font-bold">
                <ArrowUpRight className="w-2.5 h-2.5" /> {kpi.clientsGrowth}% عن
                الماضي
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-stone-500">
                  الملكيات العقارية
                </span>
                <Building2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-stone-800 tracking-tight">
                {kpi.totalProperties.toLocaleString()}
              </div>
              <div className="flex items-center gap-1 text-[9px] mt-1 text-green-600 font-bold">
                <ArrowUpRight className="w-2.5 h-2.5" /> {kpi.propertiesGrowth}%
                عن الماضي
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-stone-500">
                  متوسط الإنجاز
                </span>
                <Clock className="w-3.5 h-3.5 text-orange-500" />
              </div>
              <div className="text-xl font-black text-stone-800 tracking-tight">
                {kpi.avgCompletionTime}{" "}
                <span className="text-[10px] text-stone-400 font-bold">
                  ساعة
                </span>
              </div>
              <div className="flex items-center gap-1 text-[9px] mt-1 text-green-600 font-bold">
                <TrendingDown className="w-2.5 h-2.5" />{" "}
                {Math.abs(kpi.completionGrowth)}% أسرع
              </div>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-stone-500">
                  نسبة التعثر
                </span>
                <TriangleAlert className="w-3.5 h-3.5 text-red-500" />
              </div>
              <div className="text-xl font-black text-red-600 tracking-tight">
                {kpi.rejectionRate}%
              </div>
              <div className="flex items-center gap-1 text-[9px] mt-1 text-red-600 font-bold">
                <ArrowUpRight className="w-2.5 h-2.5" /> {kpi.rejectionGrowth}%
                ارتفاع
              </div>
            </div>
          </div>
        )}

        {/* Charts & Heatmap Row (Flex 1 to fill remaining space) */}
        <div className="flex-1 flex gap-3 min-h-0">
          {/* العمود الأيمن: الشارتات (2/3 المساحة) */}
          <div className="flex-[2] flex flex-col gap-3 min-w-0">
            {/* Area Chart */}
            <div className="flex-1 bg-white p-3 rounded-xl border border-stone-200 flex flex-col min-h-0">
              <div className="flex justify-between items-center mb-2 shrink-0">
                <h3 className="text-[11px] font-black text-stone-800">
                  حركة المعاملات الزمنية
                </h3>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1 text-[9px] font-bold text-stone-500">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>{" "}
                    جديدة
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-stone-500">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                    مكتملة
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-0" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={areaData}
                    margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorCompleted"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
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
                      tick={{ fill: "#9ca3af", fontSize: 9 }}
                      dy={5}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#9ca3af", fontSize: 9 }}
                      dx={-5}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        fontSize: "10px",
                        padding: "4px 8px",
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

            {/* Pie Chart */}
            <div className="h-[140px] shrink-0 bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between">
              <div className="w-1/3 pr-2">
                <h3 className="text-[11px] font-black text-stone-800 leading-tight mb-2">
                  توزيع قاعدة العملاء
                </h3>
                <p className="text-[9px] text-stone-400 font-bold leading-relaxed">
                  تحليل سريع لنوعية الملاك المتعاملين مع المنظومة.
                </p>
              </div>
              <div className="flex-1 h-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={4}
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
                        fontSize: "9px",
                        padding: "4px 8px",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Legend
                      verticalAlign="middle"
                      layout="vertical"
                      align="right"
                      wrapperStyle={{ fontSize: "9px", fontWeight: "bold" }}
                      iconType="circle"
                      iconSize={6}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* العمود الأيسر: الجدول الحراري (1/3 المساحة) */}
          <div className="flex-1 bg-white border border-stone-200 rounded-xl flex flex-col min-w-[280px]">
            <div className="p-3 border-b border-stone-100 shrink-0 bg-stone-50/50 rounded-t-xl">
              <h3 className="text-[11px] font-black text-stone-800">
                الكثافة التشغيلية للأحياء
              </h3>
            </div>
            {/* Table wrapper with internal scroll */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-slim">
              <table className="w-full text-right text-[9px] font-bold">
                <thead className="bg-white sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="p-2 border-b border-stone-100 text-stone-500">
                      الحي
                    </th>
                    <th
                      className="p-2 border-b border-stone-100 text-stone-500 text-center"
                      title="تقييم"
                    >
                      تقييم
                    </th>
                    <th
                      className="p-2 border-b border-stone-100 text-stone-500 text-center"
                      title="فرز"
                    >
                      فرز
                    </th>
                    <th
                      className="p-2 border-b border-stone-100 text-stone-500 text-center"
                      title="دمج"
                    >
                      دمج
                    </th>
                    <th
                      className="p-2 border-b border-stone-100 text-blue-600 text-center"
                      title="المجموع"
                    >
                      المجموع
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {heatMapData?.map((row, i) => (
                    <tr key={i} className="hover:bg-stone-50">
                      <td className="p-2 text-stone-800 truncate max-w-[80px]">
                        {row.nbh}
                      </td>
                      <td className="p-1 text-center">
                        <div
                          className={`mx-auto w-6 py-1 rounded ${getHeatColor(row.eval)}`}
                        >
                          {row.eval}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div
                          className={`mx-auto w-6 py-1 rounded ${getHeatColor(row.split)}`}
                        >
                          {row.split}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div
                          className={`mx-auto w-6 py-1 rounded ${getHeatColor(row.merge)}`}
                        >
                          {row.merge}
                        </div>
                      </td>
                      <td className="p-1 text-center">
                        <div className="mx-auto w-6 py-1 rounded bg-stone-100 text-stone-800 font-black">
                          {row.total}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab;
