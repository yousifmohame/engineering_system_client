import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../api/axios";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  Briefcase,
  FileText,
  Activity,
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  CheckCircle2,
  MapPin,
  Clock,
  Download,
  UserPlus,
  Building,
  Link2,
  FileSignature,
  Layers,
  Loader2,
  X,
  ExternalLink,
  Lock,
  Pin,
} from "lucide-react";
import { toast } from "sonner";

import { Table, TableBody, TableCell, TableRow } from "../components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../stores/useAppStore";

// مكون البطاقة الإحصائية
const StatCard = ({ title, value, change, icon: Icon, trend, colorClass }) => (
  <Card className="border-0 shadow-sm">
    <CardContent className="p-5">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">{title}</p>
            <h3 className="text-2xl font-black text-gray-800">{value}</h3>
          </div>
        </div>
        {change && (
          <div
            className={`flex items-center text-[10px] font-bold ${trend === "up" ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"} px-2 py-1 rounded-full`}
          >
            {trend === "up" ? (
              <ArrowUpRight className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownRight className="h-3 w-3 mr-0.5" />
            )}
            {change}
          </div>
        )}
      </div>
    </CardContent>
  </Card>
);

// مكون زر الإجراء السريع
const QuickActionButton = ({ title, icon: Icon, colorClass, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
  >
    <div
      className={`p-3 rounded-full mb-3 transition-transform group-hover:scale-110 ${colorClass}`}
    >
      <Icon className="h-6 w-6" />
    </div>
    <span className="text-xs font-bold text-gray-700">{title}</span>
  </button>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [showQuickLinks, setShowQuickLinks] = useState(false);

  const { openScreen } = useAppStore();

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("صباح الخير");
    else setGreeting("مساء الخير");
  }, []);

  // 1. جلب إحصائيات الداشبورد
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data.data;
    },
  });

  // 2. 🚀 جلب الروابط السريعة الحقيقية عند فتح النافذة
  const { data: quickLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["quick-links-dashboard"],
    queryFn: async () => (await api.get("/quick-links")).data.data,
    enabled: showQuickLinks, // لا يتم الجلب إلا عند فتح النافذة لتوفير الموارد
  });

  // 3. 🚀 زيادة عدد الاستخدام عند فتح الرابط
  const incrementUsageMutation = useMutation({
    mutationFn: async (id) => api.post(`/quick-links/${id}/increment`),
  });

  const handleNavigate = (screenId, screenTitle) => {
    if (openScreen) {
      openScreen(screenId, screenTitle);
    } else {
      toast.error("حدث خطأ في نظام التابات");
    }
  };

  const handleOpenLink = (link) => {
    incrementUsageMutation.mutate(link.id);
    window.open(link.url, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
        <h2 className="text-lg font-bold text-gray-600">
          جاري تحميل لوحة القيادة...
        </h2>
      </div>
    );
  }

  const stats = data?.kpis || {};
  const chartData = data?.chartData || [];
  const statusData = data?.statusData || [];
  const recentTransactions = data?.recentTransactions || [];
  const upcomingTasks = data?.upcomingTasks || [];

  return (
    <div
      className="p-6 space-y-6 bg-[#fafbfc] min-h-screen font-sans relative"
      dir="rtl"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            {greeting}، {user?.name || "المدير العام"} 👋
          </h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            إليك ملخص النشاطات والعمليات في المكتب الهندسي اليوم.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="بحث في النظام..."
              className="pl-4 pr-10 py-2 border border-gray-200 rounded-xl text-sm font-bold w-64 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-gray-50"
            />
          </div>
          <button className="relative p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 border border-gray-200 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-black text-gray-700 mb-3 flex items-center gap-2">
          <Activity className="h-4 w-4 text-blue-500" /> الإجراءات السريعة
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <QuickActionButton
            title="إنشاء ملف عميل"
            icon={UserPlus}
            colorClass="bg-blue-50 text-blue-600"
            onClick={() => handleNavigate("300", "العملاء")}
          />
          <QuickActionButton
            title="إنشاء ملف ملكية"
            icon={Building}
            colorClass="bg-emerald-50 text-emerald-600"
            onClick={() => handleNavigate("310", "الملكيات والصكوك")}
          />
          <QuickActionButton
            title="معاملة جديدة"
            icon={FileSignature}
            colorClass="bg-purple-50 text-purple-600"
            onClick={() => handleNavigate("055", "المعاملات")}
          />
          <QuickActionButton
            title="سجل المعاملات"
            icon={Layers}
            colorClass="bg-amber-50 text-amber-600"
            onClick={() => handleNavigate("055", "المعاملات")}
          />
          <QuickActionButton
            title="دليل العملاء"
            icon={Users}
            colorClass="bg-cyan-50 text-cyan-600"
            onClick={() => handleNavigate("300", "العملاء")}
          />
          <QuickActionButton
            title="الروابط السريعة"
            icon={Link2}
            colorClass="bg-slate-100 text-slate-600"
            onClick={() => setShowQuickLinks(true)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي العملاء"
          value={stats.totalClients || 0}
          change="+12"
          trend="up"
          icon={Users}
          colorClass="bg-blue-50 text-blue-600 border border-blue-100"
        />
        <StatCard
          title="المعاملات النشطة"
          value={stats.activeTransactions || 0}
          change="+5"
          trend="up"
          icon={FileText}
          colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100"
        />
        <StatCard
          title="ملفات الملكيات والصكوك"
          value={stats.totalProperties || 0}
          change="+8"
          trend="up"
          icon={Building}
          colorClass="bg-purple-50 text-purple-600 border border-purple-100"
        />
        <StatCard
          title="مهام متأخرة أو معلقة"
          value={stats.pendingTasks || 0}
          change="عاجل"
          trend="down"
          icon={AlertCircle}
          colorClass="bg-rose-50 text-rose-600 border border-rose-100"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-black">
              معدل النشاط الشهري
            </CardTitle>
            <CardDescription className="text-xs font-bold text-gray-500">
              حركة إضافة العملاء والمعاملات خلال الأشهر الماضية
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorClients"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "#374151", fontWeight: "bold" }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "12px", fontWeight: "bold" }}
                  />
                  <Area
                    type="monotone"
                    name="عملاء جدد"
                    dataKey="clients"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorClients)"
                  />
                  <Area
                    type="monotone"
                    name="معاملات جديدة"
                    dataKey="transactions"
                    stroke="#10b981"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorTrans)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-2xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-black">
              حالات المعاملات
            </CardTitle>
            <CardDescription className="text-xs font-bold text-gray-500">
              توزيع المعاملات حسب الحالة
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center">
            <div className="h-[180px] w-full relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2.5">
              {statusData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between text-xs font-bold"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="text-gray-900">{item.value} معاملة</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
        <Card className="lg:col-span-2 shadow-sm border-0 rounded-2xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-black">
                أحدث المعاملات المضافة
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate("055", "المعاملات")}
              className="text-xs font-bold rounded-lg cursor-pointer"
            >
              عرض السجل الكامل
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableBody>
                  {recentTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="hover:bg-blue-50/50 border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-800">
                              {tx.type}
                            </p>
                            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                              {tx.id}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-700">
                            {tx.clientName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-mono font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                          {tx.date}
                        </span>
                      </TableCell>
                      <TableCell className="text-left">
                        <Badge
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            tx.status === "مكتملة"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : tx.status === "قيد التنفيذ" ||
                                  tx.status === "مفتوحة"
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {tx.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-0 rounded-2xl flex flex-col">
          <CardHeader>
            <CardTitle className="text-base font-black">
              المهام والمواعيد
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <ScrollArea className="h-[250px] pr-3 -mr-3">
              <div className="space-y-4">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 pb-4 border-b border-gray-50 last:border-0"
                    >
                      <div
                        className={`p-2.5 rounded-xl mt-0.5 shrink-0 ${item.type === "visit" ? "bg-orange-50 text-orange-600" : item.type === "meeting" ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"}`}
                      >
                        {item.type === "visit" ? (
                          <MapPin className="h-4 w-4" />
                        ) : item.type === "meeting" ? (
                          <Users className="h-4 w-4" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-xs leading-relaxed">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-[10px] font-bold font-mono text-gray-500">
                            {item.date} - {item.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-gray-400">
                    <CheckCircle2 className="h-12 w-12 mb-3 opacity-20" />
                    <span className="text-sm font-bold">
                      لا توجد مهام أو مواعيد قادمة
                    </span>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* 🚀 نافذة الروابط السريعة (تأتي الآن من قاعدة البيانات) */}
      {showQuickLinks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-4 shrink-0">
              <h3 className="font-black text-lg text-gray-800 flex items-center gap-2">
                <Link2 className="h-5 w-5 text-blue-500" /> الروابط السريعة
                للنظام
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowQuickLinks(false);
                    handleNavigate("109", "إدارة الروابط"); // افتراض أن كود شاشة الروابط 109
                  }}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  إدارة الروابط بالكامل
                </button>
                <button
                  onClick={() => setShowQuickLinks(false)}
                  className="p-1.5 bg-gray-100 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-2">
              {isLoadingLinks ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
                  <span className="text-sm text-gray-500 font-bold">
                    جاري تحميل الروابط...
                  </span>
                </div>
              ) : quickLinks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                  <Link2 className="h-12 w-12 mb-3 opacity-20" />
                  <span className="text-sm font-bold">
                    لم يتم إضافة أي روابط سريعة بعد
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* نقوم بترتيب المثبت (Pinned) أولاً ثم بقية الروابط */}
                  {quickLinks
                    .sort((a, b) => b.isPinned - a.isPinned)
                    .map((link) => (
                      <button
                        key={link.id}
                        onClick={() => handleOpenLink(link)}
                        className="flex flex-col text-right p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group relative bg-white"
                      >
                        <div className="flex justify-between items-start w-full mb-2">
                          <div className="p-1.5 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors">
                            <ExternalLink className="h-4 w-4 text-blue-500 group-hover:text-white" />
                          </div>
                          {link.isPinned && (
                            <Pin
                              size={14}
                              className="text-amber-500"
                              fill="currentColor"
                            />
                          )}
                        </div>
                        <span className="font-bold text-sm text-gray-800 truncate w-full">
                          {link.title}
                        </span>
                        <div className="flex items-center justify-between w-full mt-2">
                          <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded truncate max-w-[70%]">
                            {link.category?.name || "بدون تصنيف"}
                          </span>
                          {link.requiresLogin && (
                            <Lock
                              size={12}
                              className="text-rose-400"
                              title="يحتوي على بيانات دخول"
                            />
                          )}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="shrink-0 pt-4 mt-2 border-t border-gray-100">
              <Button
                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold"
                onClick={() => setShowQuickLinks(false)}
              >
                إغلاق النافذة
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
