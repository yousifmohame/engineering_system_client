import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios";
import { toast } from "sonner";
import {
  Landmark,
  ChevronLeft,
  Search,
  Clock,
  Shield,
  EyeOff,
  Rows4,
  Rows3,
  Copy,
  ChevronDown,
  Camera,
  BarChart3,
  MapPin,
  Building2,
  Layers,
  TrendingUp,
  PanelLeftClose,
  Route,
  GripVertical,
  ChevronRight,
  ExternalLink,
  Download,
  Printer,
  GitCompare,
  PenLine,
  Upload,
  Link2,
  QrCode,
  CircleCheck,
  CircleAlert,
  X,
  FileText,
  Users,
  Plus,
  Loader2,
  Edit,
  Map,
  Satellite,
  Globe,
  Image as ImageIcon,
  ShieldCheck,
  Lightbulb,
  ArrowUpDown,
  Paperclip,
  Eye,
  RefreshCw,
  ArrowUpRight,
  TrendingDown,
  TriangleAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// ==========================================
// 📊 مكون فرعي: تاب "الإحصائيات" (Stats Tab) - 🔴 نسخة حقيقية
// ==========================================
const StatsTab = () => {
  const [filters, setFilters] = useState({
    period: "30",
    sectorId: "all",
    transactionType: "all",
  });

  // جلب البيانات الحقيقية من الـ API
  const {
    data: statsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["riyadh-stats", filters],
    queryFn: async () => {
      const response = await api.get("/riyadh-streets/dashboard-stats", {
        params: filters,
      });
      return response.data;
    },
  });

  const getHeatColor = (value) => {
    if (value > 80) return "bg-blue-600 text-white";
    if (value > 60) return "bg-blue-500 text-white";
    if (value > 40) return "bg-blue-400 text-white";
    if (value > 20) return "bg-blue-300 text-white";
    return "bg-blue-100 text-blue-900";
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-stone-50 m-2 rounded-xl">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
        <p className="text-stone-500 font-bold text-sm">
          جاري تحليل البيانات...
        </p>
      </div>
    );
  }

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

// ==========================================
// مكون فرعي: تاب "مخططات الرياض" (Plans Tab)
// ==========================================
const PlansTab = () => {
  const queryClient = useQueryClient();

  // جلب المخططات الحقيقية من الداتابيز
  const { data: plansData = [], isLoading } = useQuery({
    queryKey: ["riyadh-plans"],
    queryFn: async () => {
      const response = await api.get("/riyadh-streets/plans");
      return response.data;
    },
  });

  // حالة المودال (النافذة المنبثقة)
  const [planModal, setPlanModal] = useState({
    isOpen: false,
    mode: "create",
    data: {
      id: null,
      planNumber: "",
      oldNumber: "",
      status: "معتمد",
      isWithout: false,
      properties: 0,
      plots: 0,
    },
  });

  // حالة الحذف
  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/riyadh-streets/plans/${id}`),
    onSuccess: () => {
      toast.success("تم حذف المخطط بنجاح");
      queryClient.invalidateQueries(["riyadh-plans"]);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد من حذف هذا المخطط نهائياً؟")) {
      deleteMutation.mutate(id);
    }
  };

  // حالة الإضافة/التعديل
  const planMutation = useMutation({
    mutationFn: async (payload) =>
      planModal.mode === "create"
        ? await api.post("/riyadh-streets/plans", payload)
        : await api.put(`/riyadh-streets/plans/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم حفظ المخطط بنجاح");
      queryClient.invalidateQueries(["riyadh-plans"]);
      setPlanModal({ ...planModal, isOpen: false });
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ في الحفظ"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    planMutation.mutate(planModal.data);
  };

  // دوال مساعدة للألوان
  const getStatusColor = (status) => {
    switch (status) {
      case "معتمد":
        return { color: "rgb(22, 163, 74)", bg: "rgb(240, 253, 244)" };
      case "قيد المراجعة":
        return { color: "rgb(202, 138, 4)", bg: "rgb(254, 252, 232)" };
      case "ملغى":
        return { color: "rgb(220, 38, 38)", bg: "rgb(254, 242, 242)" };
      case "مُعدَّل":
        return { color: "rgb(37, 99, 235)", bg: "rgb(239, 246, 255)" };
      default:
        return { color: "rgb(100, 116, 139)", bg: "rgb(241, 245, 249)" };
    }
  };

  return (
    <div
      className="flex-1 overflow-hidden m-2 rounded-xl bg-white border border-black/5 shadow-sm flex flex-col"
      dir="rtl"
    >
      {/* Header */}
      <div className="p-3 border-b border-stone-200 bg-white shrink-0 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-[16px] text-stone-900 font-extrabold">
              مخططات الرياض (المخطط التنظيمي)
            </h2>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold">
              {plansData.length} مخطط
            </span>
          </div>
          <p className="text-[11px] text-stone-500 mt-1">
            إدارة المخططات التنظيمية المعتمدة والمُعدَّلة وربطها بالأحياء
            والقطاعات
          </p>
        </div>
        {/* زر إضافة مخطط جديد */}
        <button
          onClick={() =>
            setPlanModal({
              isOpen: true,
              mode: "create",
              data: {
                id: null,
                planNumber: "",
                oldNumber: "",
                status: "معتمد",
                isWithout: false,
                properties: 0,
                plots: 0,
              },
            })
          }
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-[11px] font-bold hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> إضافة مخطط
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 flex flex-col">
        {/* Filters Area */}
        <div className="flex items-center gap-2 flex-wrap p-2 bg-stone-50 rounded-lg border border-stone-200 mb-3 shrink-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="بحث برقم المخطط أو الكود..."
              className="w-full pr-8 pl-3 py-1.5 text-[11px] border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400 outline-none"
            />
          </div>
          <select className="px-2 py-1.5 text-[11px] border border-stone-300 rounded bg-white outline-none">
            <option value="">كل الحالات</option>
            <option value="معتمد">معتمد</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="ملغى">ملغى</option>
            <option value="مُعدَّل">مُعدَّل</option>
          </select>
          <div className="flex items-center gap-1 mr-auto">
            <button className="px-2 py-1 text-[10px] bg-green-50 text-green-700 rounded border border-green-200 hover:bg-green-100 flex items-center gap-1">
              <Download className="w-3 h-3" /> CSV
            </button>
            <button className="px-2 py-1 text-[10px] bg-stone-100 text-stone-600 rounded border border-stone-200 hover:bg-stone-200 flex items-center gap-1">
              <Printer className="w-3 h-3" /> طباعة
            </button>
          </div>
        </div>

        {/* Table Area */}
        <div className="border border-stone-200 rounded-lg overflow-hidden flex-1 flex flex-col">
          <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-[11px] text-right">
                <thead className="sticky top-0 z-10 bg-stone-800 text-white shadow-sm">
                  <tr>
                    <th className="py-2 px-3 text-center w-8">#</th>
                    <th className="py-2 px-3" style={{ width: "130px" }}>
                      رقم المخطط الرسمي
                    </th>
                    <th className="py-2 px-3" style={{ width: "90px" }}>
                      الترقيم القديم
                    </th>
                    <th className="py-2 px-3" style={{ width: "90px" }}>
                      رمز داخلي
                    </th>
                    <th className="py-2 px-3" style={{ width: "80px" }}>
                      الحالة
                    </th>
                    <th className="py-2 px-3" style={{ width: "150px" }}>
                      الأحياء المرتبطة
                    </th>
                    <th className="py-2 px-3" style={{ width: "65px" }}>
                      الملكيات
                    </th>
                    <th className="py-2 px-3" style={{ width: "55px" }}>
                      القطع
                    </th>
                    <th className="py-2 px-3" style={{ width: "85px" }}>
                      آخر تحديث
                    </th>
                    <th className="py-2 px-3 text-center w-20">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {plansData.length === 0 ? (
                    <tr>
                      <td
                        colSpan="10"
                        className="py-4 text-center text-stone-500 font-bold"
                      >
                        لا توجد مخططات مسجلة حالياً
                      </td>
                    </tr>
                  ) : (
                    plansData.map((plan, idx) => {
                      const statusStyle = getStatusColor(plan.status);
                      return (
                        <tr
                          key={plan.id}
                          className={`border-b border-stone-100 hover:bg-blue-50 transition-colors ${idx % 2 !== 0 ? "bg-stone-50/50" : "bg-white"}`}
                        >
                          <td className="py-2 px-3 text-center text-stone-400 font-mono">
                            {(idx + 1).toString().padStart(2, "0")}
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[12px] font-bold text-stone-900">
                                {plan.planNumber}
                              </span>
                              {plan.isWithout && (
                                <span className="px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-bold">
                                  بدون
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[10px] text-stone-500">
                            {plan.oldNumber || "—"}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[9px] text-stone-500 font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200">
                              {plan.internalCode}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className="px-1.5 py-0.5 rounded text-[9px] font-bold border"
                              style={{
                                backgroundColor: statusStyle.bg,
                                color: statusStyle.color,
                                borderColor: statusStyle.bg,
                              }}
                            >
                              {plan.status}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <div className="flex flex-wrap gap-0.5">
                              {plan.districts?.length > 0 ? (
                                plan.districts.map((nbh, i) => (
                                  <span
                                    key={i}
                                    className="px-1.5 py-0.5 bg-blue-50 border border-blue-100 text-blue-600 rounded text-[8px] font-bold"
                                  >
                                    {nbh.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[9px] text-stone-400">
                                  غير مرتبط
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2 px-3 font-bold text-blue-600">
                            {plan.properties}
                          </td>
                          <td className="py-2 px-3 text-stone-600 font-bold">
                            {plan.plots === 0 ? (
                              <span className="text-stone-300">0</span>
                            ) : (
                              plan.plots
                            )}
                          </td>
                          <td className="py-2 px-3 text-[10px] font-mono text-stone-500">
                            {new Date(plan.updatedAt).toLocaleDateString(
                              "en-GB",
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {/* زر التعديل */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPlanModal({
                                    isOpen: true,
                                    mode: "edit",
                                    data: plan,
                                  });
                                }}
                                className="p-1 rounded text-stone-400 hover:bg-blue-100 hover:text-blue-600 transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              {/* زر الحذف */}
                              <button
                                onClick={(e) => handleDelete(e, plan.id)}
                                className="p-1 rounded text-stone-400 hover:bg-red-100 hover:text-red-600 transition-colors"
                                title="حذف"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ================= مودال إضافة/تعديل مخطط ================= */}
      {planModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-800 text-lg">
                    {planModal.mode === "create"
                      ? "تسجيل مخطط جديد"
                      : "تعديل المخطط"}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    إدارة بيانات المخطط التنظيمي
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPlanModal({ ...planModal, isOpen: false })}
                className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              id="planForm"
              onSubmit={handleSubmit}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {/* قسم رقم المخطط */}
              <div>
                <label className="flex items-center gap-2 mb-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planModal.data.isWithout}
                    onChange={(e) =>
                      setPlanModal({
                        ...planModal,
                        data: {
                          ...planModal.data,
                          isWithout: e.target.checked,
                          planNumber: e.target.checked ? "بدون" : "",
                        },
                      })
                    }
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[12px] font-bold text-stone-700">
                    هذا المخطط مسجل كـ "بدون" (لا يوجد له رقم رسمي)
                  </span>
                </label>

                {!planModal.data.isWithout && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                        رقم المخطط المعتمد{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={!planModal.data.isWithout}
                        value={planModal.data.planNumber}
                        onChange={(e) =>
                          setPlanModal({
                            ...planModal,
                            data: {
                              ...planModal.data,
                              planNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="مثال: 2345"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                        الترقيم القديم (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={planModal.data.oldNumber}
                        onChange={(e) =>
                          setPlanModal({
                            ...planModal,
                            data: {
                              ...planModal.data,
                              oldNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                        placeholder="مثال: ٢٣٣/ق"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* قسم الحالة والإحصائيات */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                    الحالة الحالية
                  </label>
                  <select
                    value={planModal.data.status}
                    onChange={(e) =>
                      setPlanModal({
                        ...planModal,
                        data: { ...planModal.data, status: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 bg-white"
                  >
                    <option value="معتمد">معتمد</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                    <option value="مُعدَّل">مُعدَّل</option>
                    <option value="ملغى">ملغى</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                    إجمالي الملكيات المتوقعة
                  </label>
                  <input
                    type="number"
                    value={planModal.data.properties}
                    onChange={(e) =>
                      setPlanModal({
                        ...planModal,
                        data: { ...planModal.data, properties: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1.5">
                    عدد القطع
                  </label>
                  <input
                    type="number"
                    value={planModal.data.plots}
                    onChange={(e) =>
                      setPlanModal({
                        ...planModal,
                        data: { ...planModal.data, plots: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* ملاحظة حول الربط */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-3 text-blue-700">
                <Shield className="w-5 h-5 shrink-0" />
                <p className="text-[11px] font-bold leading-relaxed">
                  يتم ربط هذا المخطط مع "الأحياء" بشكل تلقائي من خلال شاشة ملفات
                  الملكية عند إدخال بيانات الصكوك، لضمان دقة التقاطع الجغرافي.
                </p>
              </div>
            </form>
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setPlanModal({ ...planModal, isOpen: false })}
                className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors w-32"
              >
                إلغاء
              </button>
              <button
                type="submit"
                form="planForm"
                disabled={planMutation.isPending}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {planMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CircleCheck className="w-5 h-5" /> حفظ بيانات المخطط
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RiyadhDivisionScreen = () => {
  const queryClient = useQueryClient();

  const { data: treeData = [], isLoading } = useQuery({
    queryKey: ["riyadh-tree"],
    queryFn: async () => {
      const response = await api.get("/riyadh-streets/tree");
      return response.data;
    },
  });
  const [activeMainTab, setActiveMainTab] = useState("division"); // 'division' | 'plans'

  const [viewMode, setViewMode] = useState("compact");
  const [expandedSectors, setExpandedSectors] = useState([]);
  const [expandedNeighborhoods, setExpandedNeighborhoods] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(380);

  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [isEditingLink, setIsEditingLink] = useState(false);
  const [tempLink, setTempLink] = useState("");

  const [sectorModal, setSectorModal] = useState({
    isOpen: false,
    mode: "create",
    data: {
      id: null,
      name: "",
      code: "",
      officialLink: "",
      mapImage: "",
      satelliteImage: "",
    },
  });
  const [districtModal, setDistrictModal] = useState({
    isOpen: false,
    mode: "create",
    sectorId: null,
    data: {
      id: null,
      name: "",
      code: "",
      officialLink: "",
      mapImage: "",
      satelliteImage: "",
    },
  });
  const [streetModal, setStreetModal] = useState({
    isOpen: false,
    sectorId: null,
    districtId: null,
    data: {
      name: "",
      width: "",
      length: "",
      lanes: "2",
      type: "normal",
      lighting: true,
      sidewalks: true,
    },
  });

  useEffect(() => {
    if (treeData.length > 0 && !selectedSector) {
      setExpandedSectors([treeData[0].id]);
      setSelectedSector(treeData[0]);
      setSelectedNode(treeData[0]);
      setSelectedType("sector");
    }
  }, [treeData, selectedSector]);

  useEffect(() => {
    if (selectedNode) {
      setTempLink(selectedNode.officialLink || "");
      setIsEditingLink(false);
    }
  }, [selectedNode]);

  const toggleSector = (e, sector) => {
    e.stopPropagation();
    setExpandedSectors((prev) =>
      prev.includes(sector.id)
        ? prev.filter((id) => id !== sector.id)
        : [...prev, sector.id],
    );
  };
  const selectSector = (sector) => {
    setSelectedSector(sector);
    setSelectedNode(sector);
    setSelectedType("sector");
  };
  const toggleNeighborhood = (e, nbhId) => {
    e.stopPropagation();
    setExpandedNeighborhoods((prev) =>
      prev.includes(nbhId)
        ? prev.filter((id) => id !== nbhId)
        : [...prev, nbhId],
    );
  };
  const selectNeighborhood = (sector, nbh) => {
    setSelectedSector(sector);
    setSelectedNode(nbh);
    setSelectedType("neighborhood");
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ: ${text}`);
  };

  // ==========================================
  // 💡 دالة تحميل الـ QR Code كصورة 💡
  // ==========================================
  const handleDownloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width + 40; // إضافة هوامش بيضاء
      canvas.height = img.height + 40;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20); // توسيط الـ QR

      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_${selectedNode.name}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
      toast.success("تم تحميل رمز الاستجابة السريعة بنجاح");
    };

    img.src =
      "data:image/svg+xml;base64," +
      btoa(unescape(encodeURIComponent(svgData)));
  };

  // ==========================================
  // دالة الطباعة
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  const quickUpdateMutation = useMutation({
    mutationFn: async ({ id, type, data }) => {
      const endpoint =
        type === "sector"
          ? `/riyadh-streets/sectors/${id}`
          : `/riyadh-streets/districts/${id}`;
      return await api.put(endpoint, data);
    },
    onSuccess: (updatedData, variables) => {
      toast.success("تم الحفظ بنجاح");
      queryClient.invalidateQueries(["riyadh-tree"]);
      setEditingField(null);
      setSelectedNode((prev) => ({ ...prev, ...variables.data }));
    },
  });

  const handleSaveInline = (field) => {
    if (!selectedNode) return;
    quickUpdateMutation.mutate({
      id: selectedNode.id,
      type: selectedType,
      data: { [field]: tempValue },
    });
  };

  const openInlineEditor = (field, currentValue) => {
    setTempValue(currentValue || "");
    setEditingField(field);
  };

  const sectorMutation = useMutation({
    mutationFn: async (payload) =>
      sectorModal.mode === "create"
        ? await api.post("/riyadh-streets/sectors", payload)
        : await api.put(`/riyadh-streets/sectors/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم حفظ القطاع");
      queryClient.invalidateQueries(["riyadh-tree"]);
      setSectorModal({ ...sectorModal, isOpen: false });
    },
  });

  const districtMutation = useMutation({
    mutationFn: async (payload) =>
      districtModal.mode === "create"
        ? await api.post("/riyadh-streets/districts", {
            ...payload,
            sectorId: districtModal.sectorId,
          })
        : await api.put(`/riyadh-streets/districts/${payload.id}`, payload),
    onSuccess: () => {
      toast.success("تم حفظ الحي");
      queryClient.invalidateQueries(["riyadh-tree"]);
      setDistrictModal({ ...districtModal, isOpen: false });
    },
  });

  const streetMutation = useMutation({
    mutationFn: async (payload) =>
      await api.post("/riyadh-streets/quick-street", {
        ...payload,
        sectorId: streetModal.sectorId,
        districtId: streetModal.districtId,
      }),
    onSuccess: () => {
      toast.success("تم إضافة الشارع");
      queryClient.invalidateQueries(["riyadh-tree"]);
      setStreetModal({ ...streetModal, isOpen: false });
    },
  });

  const handleSaveLink = () => {
    if (selectedType === "sector")
      sectorMutation.mutate({ id: selectedNode.id, officialLink: tempLink });
    else
      districtMutation.mutate({ id: selectedNode.id, officialLink: tempLink });
    setIsEditingLink(false);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F6F7F9]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-stone-500 font-bold">
          جاري تحميل خريطة تقسيم الرياض...
        </p>
      </div>
    );
  }

  const renderImageCard = (title, icon, dbField, placeholderText) => {
    const Icon = icon;
    const isEditing = editingField === dbField;
    const hasImage = !!selectedNode[dbField];

    return (
      <div className="bg-white rounded-xl border border-stone-200/80 p-3 flex-1 min-w-[250px] shadow-sm flex flex-col transition-all hover:border-blue-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-blue-700">
            <Icon className="w-4 h-4" />{" "}
            <span className="text-[12px] font-bold">{title}</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => openInlineEditor(dbField, selectedNode[dbField])}
              className="text-[10px] font-bold text-stone-500 hover:text-blue-600 flex items-center gap-1 bg-stone-50 px-2 py-1 rounded-md transition-colors"
            >
              <PenLine className="w-3 h-3" />{" "}
              {hasImage ? "تغيير الرابط" : "إضافة رابط"}
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 flex-1 justify-center bg-blue-50/50 p-2 rounded-lg border border-blue-100">
            <input
              type="url"
              dir="ltr"
              placeholder="أدخل رابط الصورة (URL) هنا..."
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              className="w-full px-3 py-2 text-[11px] font-mono text-left border border-blue-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSaveInline(dbField)}
                disabled={quickUpdateMutation.isPending}
                className="flex-1 bg-blue-600 text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 hover:bg-blue-700"
              >
                {quickUpdateMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <CircleCheck className="w-3 h-3" /> حفظ
                  </>
                )}
              </button>
              <button
                onClick={() => setEditingField(null)}
                className="flex-1 bg-white border border-stone-300 text-stone-600 text-[10px] font-bold py-1.5 rounded hover:bg-stone-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-stone-50 rounded-lg border border-dashed border-stone-300 flex items-center justify-center relative overflow-hidden group">
            {hasImage ? (
              <>
                <img
                  src={selectedNode[dbField]}
                  alt={title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
                <div className="hidden absolute inset-0 bg-red-50 flex-col items-center justify-center gap-2 text-red-400">
                  <CircleAlert className="w-6 h-6" />
                  <span className="text-[9px] font-bold">الرابط معطوب</span>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <a
                    href={selectedNode[dbField]}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-white rounded-lg text-blue-600 hover:bg-blue-50"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col items-center justify-center gap-2 text-stone-400">
                <ImageIcon className="w-6 h-6 opacity-30" />
                <span className="text-[10px] font-bold text-stone-500">
                  {placeholderText}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col overflow-hidden bg-[#F6F7F9] font-sans text-right"
      dir="rtl"
    >
      {/* ========================================== */}
      {/* الواجهة الرئيسية (تختفي عند الطباعة) */}
      {/* ========================================== */}
      <div className="print:hidden h-full flex flex-col">
        {/* Header Area */}
        <div className="shrink-0 bg-white/90 backdrop-blur-md border-b border-black/5 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-sm">
                <Map className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-[14px] font-black text-stone-900 leading-tight">
                  المنظومة الجغرافية والتقسيم البلدي
                </h1>
                <p className="text-[10px] text-stone-500 font-medium">
                  إدارة قطاعات وأحياء وشوارع مدينة الرياض
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= التابات العلوية (Sub Header) ================= */}
        <div className="shrink-0 flex items-center gap-3 px-2 py-1.5 border-b border-black/5">
          <div className="flex-1 max-w-[340px]">
            <div className="relative w-full bg-gradient-to-br from-rose-500/10 to-rose-500/5 border-[1.5px] border-rose-500/20 rounded-xl p-[3px]">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 backdrop-blur-sm cursor-text">
                <div className="w-7 h-7 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="البحث السريع..."
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-stone-700 font-medium placeholder:text-stone-400"
                />
              </div>
            </div>
          </div>
          <div className="w-1 h-1 rounded-full bg-stone-300 shrink-0" />

          <div className="flex items-center bg-stone-100/60 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setActiveMainTab("division")}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-all font-bold ${activeMainTab === "division" ? "bg-white text-blue-700 shadow-sm" : "text-stone-500 hover:bg-white/50 hover:text-stone-700"}`}
            >
              <Building2 className="w-3.5 h-3.5" /> التقسيم البلدي
              {activeMainTab === "division" && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveMainTab("plans")}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-all font-bold ${activeMainTab === "plans" ? "bg-white text-blue-700 shadow-sm" : "text-stone-500 hover:bg-white/50 hover:text-stone-700"}`}
            >
              <Layers className="w-3.5 h-3.5" /> مخططات الرياض
              {activeMainTab === "plans" && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveMainTab("stats")}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-md transition-all font-bold ${activeMainTab === "stats" ? "bg-white text-blue-700 shadow-sm" : "text-stone-500 hover:bg-white/50 hover:text-stone-700"}`}
            >
              <BarChart3 className="w-3.5 h-3.5" /> الإحصائيات الشاملة
              {activeMainTab === "stats" && (
                <span className="absolute bottom-0 inset-x-2 h-0.5 bg-blue-500 rounded-full" />
              )}
            </button>
          </div>
        </div>

        {activeMainTab === "division" && (
          <div className="flex-1 flex overflow-hidden px-3 pb-3 gap-3 mt-3">
            {/* === Right Sidebar (Tree View) === */}
            <div
              className="flex shrink-0 relative"
              style={{ width: sidebarWidth }}
            >
              <div className="bg-white flex flex-col overflow-hidden h-full flex-1 border border-stone-200/80 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50 shrink-0">
                  <span className="text-[12px] text-stone-800 font-extrabold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" /> الهيكل الجغرافي
                  </span>
                  <button
                    onClick={() =>
                      setSectorModal({
                        isOpen: true,
                        mode: "create",
                        data: {
                          id: null,
                          name: "",
                          code: "",
                          officialLink: "",
                          mapImage: "",
                          satelliteImage: "",
                        },
                      })
                    }
                    className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-[10px] font-bold hover:bg-stone-800 shadow-sm"
                  >
                    <Plus className="w-3 h-3" /> قطاع
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                  <div className="space-y-3">
                    {treeData.map((sector) => {
                      const isSectorExpanded = expandedSectors.includes(
                        sector.id,
                      );
                      const isSectorSelected =
                        selectedType === "sector" &&
                        selectedNode?.id === sector.id;

                      return (
                        <div key={sector.id} className="relative">
                          <div
                            className="absolute top-0 bottom-0 right-0 w-[3px] rounded-r-lg opacity-50"
                            style={{ backgroundColor: sector.color || "#ccc" }}
                          />
                          <div
                            className={`flex items-start gap-2 p-2 rounded-xl transition-all cursor-pointer border ${isSectorSelected ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-stone-100 hover:border-stone-300 hover:bg-stone-50"}`}
                            onClick={() => selectSector(sector)}
                          >
                            <button
                              onClick={(e) => toggleSector(e, sector)}
                              className={`w-6 h-6 flex items-center justify-center rounded-lg transition-colors shrink-0 mt-1 ${isSectorSelected ? "bg-blue-100 text-blue-700" : "bg-stone-100 text-stone-500"}`}
                            >
                              <ChevronDown
                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isSectorExpanded ? "rotate-0" : "-rotate-90"}`}
                              />
                            </button>

                            <div className="flex-1 min-w-0 pt-0.5">
                              <div className="flex items-center justify-between">
                                <div className="text-[13px] font-black text-stone-800 leading-tight">
                                  قطاع{" "}
                                  <span style={{ color: sector.color }}>
                                    {sector.name}
                                  </span>
                                </div>
                                <span className="text-[9px] font-mono font-bold text-stone-400">
                                  {sector.code}
                                </span>
                              </div>

                              {/* أزرار إضافة حي داخل القطاع */}
                              {isSectorSelected && (
                                <div className="mt-3 pt-2 border-t border-blue-200/50 flex gap-2">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setDistrictModal({
                                        isOpen: true,
                                        mode: "create",
                                        sectorId: sector.id,
                                        data: {
                                          id: null,
                                          name: "",
                                          code: "",
                                          officialLink: "",
                                          mapImage: "",
                                          satelliteImage: "",
                                        },
                                      });
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-bold hover:bg-emerald-50 transition-colors"
                                  >
                                    <Plus className="w-3 h-3" /> تسجيل حي
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Districts Nodes */}
                          {isSectorExpanded && (
                            <div className="mt-2 mr-3 pr-4 border-r-2 border-stone-100 space-y-2 pb-2 relative">
                              {sector.neighborhoods &&
                              sector.neighborhoods.length > 0 ? (
                                sector.neighborhoods.map((nbh) => {
                                  const isSelected =
                                    selectedType === "neighborhood" &&
                                    selectedNode?.id === nbh.id;
                                  const isNbhExpanded =
                                    expandedNeighborhoods.includes(nbh.id);

                                  return (
                                    <div
                                      key={nbh.id}
                                      className="relative group"
                                    >
                                      <div className="absolute top-4 -right-4 w-4 h-0.5 bg-stone-100"></div>
                                      <div
                                        className={`flex items-start gap-2 p-2 rounded-xl transition-all cursor-pointer border ${isSelected ? "bg-white border-stone-800 shadow-md ring-1 ring-stone-800" : "bg-white border-stone-100 hover:border-stone-300"}`}
                                        onClick={() =>
                                          selectNeighborhood(sector, nbh)
                                        }
                                      >
                                        <button
                                          onClick={(e) =>
                                            toggleNeighborhood(e, nbh.id)
                                          }
                                          className={`w-5 h-5 flex items-center justify-center rounded transition-colors shrink-0 mt-0.5 ${isSelected ? "text-stone-800" : "text-stone-400"}`}
                                        >
                                          {nbh.streets &&
                                            nbh.streets.length > 0 && (
                                              <ChevronDown
                                                className={`w-3.5 h-3.5 transition-transform duration-200 ${isNbhExpanded ? "rotate-0" : "-rotate-90"}`}
                                              />
                                            )}
                                        </button>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                          <div className="flex items-center justify-between">
                                            <div
                                              className={`text-[12px] font-bold truncate ${isSelected ? "text-stone-900" : "text-stone-700"}`}
                                            >
                                              {nbh.name}
                                            </div>
                                            <span className="text-[9px] font-mono text-stone-400">
                                              {nbh.code}
                                            </span>
                                          </div>

                                          {/* زر إضافة شارع داخل الحي */}
                                          {isSelected && (
                                            <div className="mt-3 pt-2 border-t border-stone-100 flex gap-2">
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setStreetModal({
                                                    isOpen: true,
                                                    sectorId: sector.id,
                                                    districtId: nbh.id,
                                                    data: {
                                                      name: "",
                                                      width: "",
                                                      length: "",
                                                      lanes: "2",
                                                      type: "normal",
                                                      lighting: true,
                                                      sidewalks: true,
                                                    },
                                                  });
                                                }}
                                                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-stone-900 text-white rounded-lg text-[10px] font-bold hover:bg-stone-800 transition-colors"
                                              >
                                                <Plus className="w-3 h-3" />{" "}
                                                إضافة شارع
                                              </button>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      {/* Streets Display */}
                                      {isNbhExpanded &&
                                        nbh.streets &&
                                        nbh.streets.length > 0 && (
                                          <div className="mt-2 mr-6 pr-3 border-r-2 border-orange-100/50 space-y-1 pb-1">
                                            {nbh.streets.map((street) => (
                                              <div
                                                key={street.id}
                                                className="flex items-center justify-between py-1.5 px-2 bg-stone-50 rounded-lg group hover:bg-orange-50"
                                              >
                                                <div className="flex items-center gap-2">
                                                  <Route className="w-3 h-3 text-orange-400" />
                                                  <span className="text-[11px] font-medium text-stone-700">
                                                    {street.name}
                                                  </span>
                                                </div>
                                                <span className="px-1.5 py-0.5 bg-white text-stone-500 text-[8px] font-mono font-bold rounded shadow-sm border border-stone-200">
                                                  {street.width}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                    </div>
                                  );
                                })
                              ) : (
                                <div className="text-[10px] text-stone-400 font-bold py-2">
                                  لا يوجد أحياء مسجلة.
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="group relative flex items-center justify-center shrink-0 cursor-col-resize select-none z-10 w-[12px] mx-1">
                <div className="absolute inset-y-0 w-1 rounded-full bg-stone-200 group-hover:bg-blue-400 transition-colors" />
              </div>
            </div>

            {/* === Left Details Panel === */}
            <div className="bg-white flex flex-col overflow-hidden h-full flex-1 rounded-2xl shadow-sm border border-stone-200/80 relative">
              {selectedNode ? (
                <div className="flex-1 overflow-y-auto bg-[#FAFAFA] flex flex-col relative">
                  {/* Cover Background */}
                  <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-stone-100 to-white border-b border-stone-200 z-0">
                    <div
                      className="absolute inset-0 opacity-[0.03]"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 2px 2px, black 1px, transparent 0)",
                        backgroundSize: "24px 24px",
                      }}
                    ></div>
                  </div>

                  <div className="relative z-10 p-6 flex-1 flex flex-col max-w-5xl mx-auto w-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm w-fit">
                          <Landmark className="w-3 h-3 text-stone-400" /> أمانة
                          الرياض
                          <ChevronRight className="w-3 h-3 text-stone-300 scale-x-[-1]" />
                          <span className="text-stone-700">
                            قطاع {selectedSector.name}
                          </span>
                          {selectedType === "neighborhood" && (
                            <>
                              <ChevronRight className="w-3 h-3 text-stone-300 scale-x-[-1]" />
                              <span className="text-blue-600">
                                {selectedNode.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      {/* 🖨️ زر طباعة التقرير */}
                      <div className="flex gap-2">
                        <button
                          onClick={handlePrint}
                          className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white text-[11px] font-bold rounded-lg shadow-md hover:bg-stone-800 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> طباعة التقرير
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm mb-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-stone-100 border-2 border-stone-200 flex items-center justify-center text-2xl shadow-inner">
                          {selectedType === "sector"
                            ? selectedSector.icon
                            : "🏘️"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <h2 className="text-2xl font-black text-stone-900">
                              {selectedType === "sector"
                                ? `قطاع ${selectedNode.name}`
                                : selectedNode.name}
                            </h2>
                            <span
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${selectedType === "sector" ? "bg-stone-100 text-stone-600 border border-stone-200" : "bg-blue-50 text-blue-700 border border-blue-200"}`}
                            >
                              {selectedType === "sector"
                                ? "قطاع إداري"
                                : "حي سكني"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
                              {selectedNode.code}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedType === "sector")
                            setSectorModal({
                              isOpen: true,
                              mode: "edit",
                              data: {
                                id: selectedNode.id,
                                name: selectedNode.name,
                                code: selectedNode.code,
                                officialLink: selectedNode.officialLink || "",
                                mapImage: selectedNode.mapImage || "",
                                satelliteImage:
                                  selectedNode.satelliteImage || "",
                              },
                            });
                          else
                            setDistrictModal({
                              isOpen: true,
                              mode: "edit",
                              sectorId: selectedSector.id,
                              data: {
                                id: selectedNode.id,
                                name: selectedNode.name,
                                code: selectedNode.code,
                                officialLink: selectedNode.officialLink || "",
                                mapImage: selectedNode.mapImage || "",
                                satelliteImage:
                                  selectedNode.satelliteImage || "",
                              },
                            });
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-xl hover:bg-blue-100 transition-colors border border-blue-100"
                      >
                        <Edit className="w-3.5 h-3.5" /> تحديث البيانات
                      </button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-[13px] font-extrabold text-stone-800 mb-3 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-blue-500" />{" "}
                          إحصائيات المؤشرات
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {selectedType === "sector" ? (
                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
                              <span className="text-[11px] font-bold text-stone-500 block mb-1">
                                الأحياء التابعة
                              </span>
                              <span className="text-2xl font-black text-stone-800">
                                {selectedNode.stats?.neighborhoods ||
                                  selectedNode.neighborhoods?.length ||
                                  0}
                              </span>
                            </div>
                          ) : (
                            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                              <span className="text-[11px] font-bold text-stone-500 block mb-1">
                                الشوارع الموثقة
                              </span>
                              <span className="text-2xl font-black text-stone-800">
                                {selectedNode.streets?.length || 0}
                              </span>
                            </div>
                          )}
                          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                            <span className="text-[11px] font-bold text-stone-500 block mb-1">
                              المعاملات النشطة
                            </span>
                            <span className="text-2xl font-black text-stone-800">
                              {selectedNode.stats?.transactions?.toLocaleString() ||
                                0}
                            </span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                            <span className="text-[11px] font-bold text-stone-500 block mb-1">
                              الملكيات والعقارات
                            </span>
                            <span className="text-2xl font-black text-stone-800">
                              {selectedNode.stats?.properties?.toLocaleString() ||
                                0}
                            </span>
                          </div>
                          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-violet-500"></div>
                            <span className="text-[11px] font-bold text-stone-500 block mb-1">
                              العملاء المرتبطين
                            </span>
                            <span className="text-2xl font-black text-stone-800">
                              {selectedNode.stats?.clients?.toLocaleString() ||
                                0}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[13px] font-extrabold text-stone-800 mb-3 flex items-center gap-2">
                          <Map className="w-4 h-4 text-emerald-500" /> الخرائط
                          والبيانات المكانية
                        </h3>
                        <div className="flex gap-4 flex-col lg:flex-row">
                          {renderImageCard(
                            "المخطط الرسمي",
                            Map,
                            "mapImage",
                            "لم يتم ربط صورة المخطط",
                          )}
                          {renderImageCard(
                            "صورة القمر الصناعي",
                            Satellite,
                            "satelliteImage",
                            "لم يتم ربط صورة جوية",
                          )}
                        </div>
                      </div>

                      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-stone-800 font-bold text-[13px]">
                            <Link2 className="w-4 h-4 text-blue-600" /> رابط
                            الخريطة التفاعلية
                          </div>
                          {!isEditingLink && (
                            <button
                              onClick={() =>
                                openInlineEditor(
                                  "link",
                                  selectedNode.officialLink,
                                )
                              }
                              className="text-[10px] font-bold bg-stone-50 text-stone-600 border border-stone-200 px-3 py-1.5 rounded-lg hover:bg-stone-100 flex items-center gap-1 transition-colors"
                            >
                              <PenLine className="w-3 h-3" />{" "}
                              {selectedNode.officialLink
                                ? "تغيير الرابط"
                                : "إضافة رابط"}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex-1">
                            {editingField === "link" ? (
                              <div className="flex gap-2 bg-blue-50/50 p-2 rounded-xl border border-blue-100">
                                <input
                                  type="url"
                                  dir="ltr"
                                  placeholder="https://..."
                                  autoFocus
                                  value={tempValue}
                                  onChange={(e) => setTempValue(e.target.value)}
                                  className="flex-1 px-3 py-2 text-[12px] font-mono text-left border border-blue-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <button
                                  onClick={() =>
                                    handleSaveInline("officialLink")
                                  }
                                  disabled={quickUpdateMutation.isPending}
                                  className="bg-blue-600 text-white text-[11px] px-4 font-bold rounded-lg flex items-center gap-1 hover:bg-blue-700"
                                >
                                  {quickUpdateMutation.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CircleCheck className="w-4 h-4" /> حفظ
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => setEditingField(null)}
                                  className="bg-white border border-stone-300 text-stone-600 text-[11px] px-4 font-bold rounded-lg hover:bg-stone-50"
                                >
                                  إلغاء
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={
                                    selectedNode.officialLink ||
                                    "لا يوجد رابط مسجل"
                                  }
                                  className={`flex-1 px-4 py-3 text-[12px] font-mono text-left bg-stone-50 border border-stone-200 rounded-xl outline-none ${selectedNode.officialLink ? "text-blue-600" : "text-stone-400"}`}
                                  dir="ltr"
                                />
                                {selectedNode.officialLink && (
                                  <>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          selectedNode.officialLink,
                                        )
                                      }
                                      className="p-3 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 border border-stone-200 transition-colors"
                                    >
                                      <Copy className="w-4 h-4" />
                                    </button>
                                    <a
                                      href={selectedNode.officialLink}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 border border-blue-200 transition-colors"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                          {/* ⬇️ زر تحميل QR Code ⬇️ */}
                          <div className="w-[90px] h-[90px] bg-white border border-stone-200 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-sm p-1.5 relative overflow-hidden group">
                            {selectedNode.officialLink ? (
                              <>
                                <QRCodeSVG
                                  id="qr-code-svg"
                                  value={selectedNode.officialLink}
                                  size={70}
                                  level="H"
                                />
                                <div
                                  onClick={handleDownloadQR}
                                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer backdrop-blur-sm"
                                >
                                  <Download className="w-5 h-5 mb-1" />
                                  <span className="text-[8px] font-bold">
                                    تحميل QR
                                  </span>
                                </div>
                              </>
                            ) : (
                              <>
                                <QrCode className="w-6 h-6 text-stone-300 mb-1" />
                                <span className="text-[7px] text-stone-400 font-bold text-center leading-tight">
                                  لا يوجد
                                  <br />
                                  رابط
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-stone-50 text-stone-400 flex-col gap-3">
                  <Layers className="w-16 h-16 opacity-10" />
                  <p className="font-extrabold text-[14px]">
                    حدد قطاعاً أو حياً من الشجرة لاستعراض البيانات
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeMainTab === "plans" && <PlansTab />}

        {activeMainTab === "stats" && <StatsTab />}
      </div>

      {/* ========================================== */}
      {/* 🖨️ قالب الطباعة الاحترافي (يظهر في الورق فقط) 🖨️ */}
      {/* ========================================== */}
      {selectedNode && (
        <div
          className="hidden print:block bg-white text-black p-8 font-sans"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-stone-800 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-stone-100 border-2 border-stone-800 rounded-xl flex items-center justify-center">
                <Landmark className="w-8 h-8 text-stone-800" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-stone-900">
                  تقرير المنظومة الجغرافية
                </h1>
                <p className="text-lg text-stone-600 font-bold mt-1">
                  أمانة منطقة الرياض
                </p>
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-stone-500">تاريخ الإصدار</p>
              <p className="text-lg font-bold font-mono">
                {new Date().toLocaleDateString("ar-SA")}
              </p>
            </div>
          </div>

          {/* Node Info */}
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-6 mb-8 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-stone-500 mb-1">
                {selectedType === "sector"
                  ? "بيانات القطاع البلدي"
                  : `حي تابع لـ: قطاع ${selectedSector.name}`}
              </p>
              <h2 className="text-4xl font-black text-stone-900">
                {selectedType === "sector"
                  ? `قطاع ${selectedNode.name}`
                  : selectedNode.name}
              </h2>
              <span className="inline-block mt-3 px-3 py-1 bg-stone-200 text-stone-800 font-mono font-bold rounded-lg border border-stone-300">
                كود المرجع: {selectedNode.code}
              </span>
            </div>
            {selectedNode.officialLink && (
              <div className="text-center">
                <div className="p-2 bg-white border-2 border-stone-800 rounded-xl inline-block">
                  <QRCodeSVG
                    value={selectedNode.officialLink}
                    size={100}
                    level="H"
                  />
                </div>
                <p className="text-[10px] font-bold mt-2">امسح للوصول للموقع</p>
              </div>
            )}
          </div>

          {/* Statistics */}
          <h3 className="text-2xl font-bold text-stone-800 border-b border-stone-200 pb-2 mb-4">
            الإحصائيات المعتمدة
          </h3>
          <div className="grid grid-cols-4 gap-4 mb-8">
            {selectedType === "sector" ? (
              <div className="border-2 border-stone-200 rounded-xl p-4 text-center bg-white">
                <p className="text-sm font-bold text-stone-500 mb-2">الأحياء</p>
                <p className="text-3xl font-black">
                  {selectedNode.stats?.neighborhoods ||
                    selectedNode.neighborhoods?.length ||
                    0}
                </p>
              </div>
            ) : (
              <div className="border-2 border-stone-200 rounded-xl p-4 text-center bg-white">
                <p className="text-sm font-bold text-stone-500 mb-2">الشوارع</p>
                <p className="text-3xl font-black">
                  {selectedNode.streets?.length || 0}
                </p>
              </div>
            )}
            <div className="border-2 border-stone-200 rounded-xl p-4 text-center bg-white">
              <p className="text-sm font-bold text-stone-500 mb-2">المعاملات</p>
              <p className="text-3xl font-black">
                {selectedNode.stats?.transactions?.toLocaleString() || 0}
              </p>
            </div>
            <div className="border-2 border-stone-200 rounded-xl p-4 text-center bg-white">
              <p className="text-sm font-bold text-stone-500 mb-2">الملكيات</p>
              <p className="text-3xl font-black">
                {selectedNode.stats?.properties?.toLocaleString() || 0}
              </p>
            </div>
            <div className="border-2 border-stone-200 rounded-xl p-4 text-center bg-white">
              <p className="text-sm font-bold text-stone-500 mb-2">العملاء</p>
              <p className="text-3xl font-black">
                {selectedNode.stats?.clients?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          {/* Details Table (If Neighborhood, show streets) */}
          {selectedType === "neighborhood" &&
            selectedNode.streets &&
            selectedNode.streets.length > 0 && (
              <form>
                <h3 className="text-2xl font-bold text-stone-800 border-b border-stone-200 pb-2 mb-4">
                  قائمة الشوارع الموثقة
                </h3>
                <table className="w-full border-collapse border border-stone-300 text-sm">
                  <thead>
                    <tr className="bg-stone-100">
                      <th className="border border-stone-300 p-3 text-right font-bold">
                        اسم الشارع
                      </th>
                      <th className="border border-stone-300 p-3 text-center font-bold">
                        النوع
                      </th>
                      <th className="border border-stone-300 p-3 text-center font-bold">
                        العرض
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedNode.streets.map((st, i) => (
                      <tr key={i}>
                        <td className="border border-stone-300 p-3 font-bold text-stone-800">
                          {st.name}
                        </td>
                        <td className="border border-stone-300 p-3 text-center">
                          {st.type === "main" ? "طريق محوري" : "شارع داخلي"}
                        </td>
                        <td className="border border-stone-300 p-3 text-center font-mono">
                          {st.width}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </form>
            )}

          {/* Footer */}
          <div className="fixed bottom-0 left-0 right-0 p-8 text-center text-sm font-bold text-stone-400 border-t border-stone-200">
            هذا المستند مستخرج آلياً من نظام إدارة المكتب الهندسي ولا يحتاج إلى
            توقيع.
          </div>
        </div>
      )}

      {/* ================= Nودلز (Modals) ================= */}
      {/* 1. Modal القطاع (Sector) */}
      {sectorModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-800 text-lg">
                    {sectorModal.mode === "create"
                      ? "تسجيل قطاع جديد"
                      : "تعديل بيانات القطاع"}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    إدارة البيانات الأساسية والروابط الجغرافية للقطاع
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setSectorModal({ ...sectorModal, isOpen: false })
                }
                className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sectorMutation.mutate(sectorModal.data);
              }}
              className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar"
            >
              <section>
                <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <FileText className="w-4 h-4 text-blue-500" /> البيانات
                  الأساسية
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      اسم القطاع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={sectorModal.data.name}
                      onChange={(e) =>
                        setSectorModal({
                          ...sectorModal,
                          data: { ...sectorModal.data, name: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                      placeholder="مثال: وسط، شمال، غرب..."
                    />
                  </div>
                  {/* يظهر الكود فقط في حالة التعديل ومقفل (لأن الباك إند يولده) */}
                  {sectorModal.mode === "edit" && (
                    <div>
                      <label className="block text-[12px] font-bold text-stone-700 mb-2">
                        كود القطاع الداخلي (تلقائي)
                      </label>
                      <input
                        type="text"
                        readOnly
                        dir="ltr"
                        value={sectorModal.data.code}
                        className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-mono text-left text-stone-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </section>
              <section>
                <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Globe className="w-4 h-4 text-emerald-500" /> الروابط
                  والخرائط
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      رابط الخريطة الرسمية (URL)
                    </label>
                    <div className="relative">
                      <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="url"
                        dir="ltr"
                        value={sectorModal.data.officialLink}
                        onChange={(e) =>
                          setSectorModal({
                            ...sectorModal,
                            data: {
                              ...sectorModal.data,
                              officialLink: e.target.value,
                            },
                          })
                        }
                        className="w-full pr-9 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-left outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all"
                        placeholder="https://maps.example.com/..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-stone-700 mb-2">
                        رابط صورة المخطط
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={sectorModal.data.mapImage}
                        onChange={(e) =>
                          setSectorModal({
                            ...sectorModal,
                            data: {
                              ...sectorModal.data,
                              mapImage: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[12px] font-mono text-left outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-stone-700 mb-2">
                        رابط صورة القمر الصناعي
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={sectorModal.data.satelliteImage}
                        onChange={(e) =>
                          setSectorModal({
                            ...sectorModal,
                            data: {
                              ...sectorModal.data,
                              satelliteImage: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[12px] font-mono text-left outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </section>
            </form>
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setSectorModal({ ...sectorModal, isOpen: false })
                }
                className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors w-32"
              >
                إلغاء
              </button>
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  sectorMutation.mutate(sectorModal.data);
                }}
                disabled={sectorMutation.isPending}
                className="flex-1 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-blue-500/20"
              >
                {sectorMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CircleCheck className="w-5 h-5" /> حفظ بيانات القطاع
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal الحي (District) */}
      {districtModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-800 text-lg">
                    {districtModal.mode === "create"
                      ? "تسجيل حي جديد"
                      : "تعديل بيانات الحي"}
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    تسجيل حي جديد داخل القطاع المحدد
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setDistrictModal({ ...districtModal, isOpen: false })
                }
                className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <section>
                <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <FileText className="w-4 h-4 text-emerald-500" /> البيانات
                  الأساسية
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      اسم الحي <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={districtModal.data.name}
                      onChange={(e) =>
                        setDistrictModal({
                          ...districtModal,
                          data: { ...districtModal.data, name: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                      placeholder="مثال: العليا، النرجس..."
                    />
                  </div>
                  {districtModal.mode === "edit" && (
                    <div>
                      <label className="block text-[12px] font-bold text-stone-700 mb-2">
                        كود الحي (تلقائي)
                      </label>
                      <input
                        type="text"
                        readOnly
                        dir="ltr"
                        value={districtModal.data.code}
                        className="w-full px-4 py-2.5 bg-stone-100 border border-stone-200 rounded-xl text-sm font-mono text-left text-stone-500 outline-none cursor-not-allowed"
                      />
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Globe className="w-4 h-4 text-blue-500" /> الروابط والخرائط
                </h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      رابط الخريطة الرسمية (URL)
                    </label>
                    <div className="relative">
                      <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                      <input
                        type="url"
                        dir="ltr"
                        value={districtModal.data.officialLink}
                        onChange={(e) =>
                          setDistrictModal({
                            ...districtModal,
                            data: {
                              ...districtModal.data,
                              officialLink: e.target.value,
                            },
                          })
                        }
                        className="w-full pr-9 pl-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono text-left outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-[12px] font-bold text-stone-700 mb-2">
                        رابط صورة المخطط
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={districtModal.data.mapImage}
                        onChange={(e) =>
                          setDistrictModal({
                            ...districtModal,
                            data: {
                              ...districtModal.data,
                              mapImage: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[12px] font-mono text-left outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-[12px] font-bold text-stone-700 mb-2">
                        رابط صورة القمر الصناعي
                      </label>
                      <input
                        type="url"
                        dir="ltr"
                        value={districtModal.data.satelliteImage}
                        onChange={(e) =>
                          setDistrictModal({
                            ...districtModal,
                            data: {
                              ...districtModal.data,
                              satelliteImage: e.target.value,
                            },
                          })
                        }
                        className="w-full px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-[12px] font-mono text-left outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </section>
            </form>
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setDistrictModal({ ...districtModal, isOpen: false })
                }
                className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors w-32"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => districtMutation.mutate(districtModal.data)}
                disabled={districtMutation.isPending}
                className="flex-1 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
              >
                {districtMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CircleCheck className="w-5 h-5" /> حفظ بيانات الحي
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal الشارع (Street) */}
      {streetModal.isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Route className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-800 text-lg">
                    تسجيل شارع جديد
                  </h3>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5">
                    إضافة شارع وتحديد مواصفاته الهندسية
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  setStreetModal({ ...streetModal, isOpen: false })
                }
                className="p-2 hover:bg-stone-200 rounded-lg text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              <section>
                <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <Route className="w-4 h-4 text-orange-500" /> التصنيف
                  والقياسات
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div className="col-span-2">
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      اسم الشارع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={streetModal.data.name}
                      onChange={(e) =>
                        setStreetModal({
                          ...streetModal,
                          data: { ...streetModal.data, name: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="مثال: طريق الملك فهد"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      نوع الشارع
                    </label>
                    <div className="relative">
                      <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                      <select
                        value={streetModal.data.type}
                        onChange={(e) =>
                          setStreetModal({
                            ...streetModal,
                            data: { ...streetModal.data, type: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm appearance-none outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        <option value="normal">شارع داخلي (فرعي)</option>
                        <option value="main">طريق محوري (رئيسي)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      عرض الشارع (متر) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={streetModal.data.width}
                      onChange={(e) =>
                        setStreetModal({
                          ...streetModal,
                          data: { ...streetModal.data, width: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      طول الشارع التقريبي (متر)
                    </label>
                    <input
                      type="number"
                      value={streetModal.data.length}
                      onChange={(e) =>
                        setStreetModal({
                          ...streetModal,
                          data: { ...streetModal.data, length: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="1500"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-stone-700 mb-2">
                      عدد المسارات (Lanes)
                    </label>
                    <input
                      type="number"
                      value={streetModal.data.lanes}
                      onChange={(e) =>
                        setStreetModal({
                          ...streetModal,
                          data: { ...streetModal.data, lanes: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      placeholder="2"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h4 className="text-[12px] font-bold text-stone-800 mb-4 flex items-center gap-2 border-b border-stone-100 pb-2">
                  <ShieldCheck className="w-4 h-4 text-purple-500" /> البنية
                  التحتية
                </h4>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={streetModal.data.lighting}
                        onChange={(e) =>
                          setStreetModal({
                            ...streetModal,
                            data: {
                              ...streetModal.data,
                              lighting: e.target.checked,
                            },
                          })
                        }
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${streetModal.data.lighting ? "bg-orange-500" : "bg-stone-300"}`}
                      ></div>
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${streetModal.data.lighting ? "left-1 translate-x-4" : "left-1"}`}
                      ></div>
                    </div>
                    <span className="text-[13px] font-bold text-stone-700 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4" /> تتوفر إنارة
                    </span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={streetModal.data.sidewalks}
                        onChange={(e) =>
                          setStreetModal({
                            ...streetModal,
                            data: {
                              ...streetModal.data,
                              sidewalks: e.target.checked,
                            },
                          })
                        }
                      />
                      <div
                        className={`w-10 h-6 rounded-full transition-colors ${streetModal.data.sidewalks ? "bg-orange-500" : "bg-stone-300"}`}
                      ></div>
                      <div
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${streetModal.data.sidewalks ? "left-1 translate-x-4" : "left-1"}`}
                      ></div>
                    </div>
                    <span className="text-[13px] font-bold text-stone-700 group-hover:text-orange-600 transition-colors flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> تتوفر أرصفة مشاة
                    </span>
                  </label>
                </div>
              </section>
            </form>
            <div className="p-4 border-t border-stone-100 bg-stone-50 flex gap-3 shrink-0">
              <button
                type="button"
                onClick={() =>
                  setStreetModal({ ...streetModal, isOpen: false })
                }
                className="px-6 py-2.5 bg-white border border-stone-200 text-stone-700 font-bold rounded-xl hover:bg-stone-50 transition-colors w-32"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => streetMutation.mutate(streetModal.data)}
                disabled={streetMutation.isPending}
                className="flex-1 px-6 py-2.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
              >
                {streetMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CircleCheck className="w-5 h-5" /> إضافة الشارع للمنظومة
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiyadhDivisionScreen;
