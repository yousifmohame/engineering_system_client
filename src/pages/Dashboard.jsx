import React, { useMemo, useState, useEffect } from "react";
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
  FileText,
  Activity,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bell,
  CheckCircle2,
  MapPin,
  Clock,
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
  RefreshCw,
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

const cn = (...classes) => classes.filter(Boolean).join(" ");

const IconWithText = ({ icon: Icon, text, iconClassName = "h-4 w-4" }) => (
  <>
    <Icon className={iconClassName} />
    <span>{text}</span>
  </>
);

const SectionHeader = ({ title, description, icon: Icon, tone = "teal" }) => {
  const toneClass =
    tone === "gold"
      ? "bg-amber-50 text-[#b8872f]"
      : tone === "rose"
        ? "bg-rose-50 text-rose-600"
        : "bg-[#eef7f6] text-[#0e7490]";

  return (
    <CardHeader className="border-b border-[#e8ddc8]/65 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 text-right">
          <CardTitle className="text-[15px] font-black leading-tight text-[#123f59]">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="mt-0.5 text-[11px] font-bold leading-relaxed text-[#60738f]">
              {description}
            </CardDescription>
          )}
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-2xl", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardHeader>
  );
};

const KpiCard = ({ title, value, change, icon: Icon, trend = "up", tone = "teal" }) => {
  const toneMap = {
    blue: {
      icon: "bg-blue-50 text-blue-600 border-blue-100",
      accent: "bg-blue-500",
      badge: "bg-blue-50 text-blue-700",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accent: "bg-emerald-500",
      badge: "bg-emerald-50 text-emerald-700",
    },
    violet: {
      icon: "bg-violet-50 text-violet-600 border-violet-100",
      accent: "bg-violet-500",
      badge: "bg-violet-50 text-violet-700",
    },
    rose: {
      icon: "bg-rose-50 text-rose-600 border-rose-100",
      accent: "bg-rose-500",
      badge: "bg-rose-50 text-rose-700",
    },
    teal: {
      icon: "bg-[#eef7f6] text-[#0e7490] border-[#d8b46a]/30",
      accent: "bg-[#0e7490]",
      badge: "bg-[#eef7f6] text-[#0e7490]",
    },
  };

  const toneStyle = toneMap[tone] || toneMap.teal;

  return (
    <Card className="relative min-h-[106px] overflow-hidden rounded-[20px] border border-[#e4dccb] bg-gradient-to-br from-white via-white to-[#f8fbfb] shadow-[0_8px_22px_rgba(18,63,89,0.055)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(18,63,89,0.09)]">
      <div className={`absolute right-0 top-0 h-full w-1.5 ${toneStyle.accent}`} />

      <CardContent className="flex min-h-[106px] flex-col justify-between gap-3 p-4 pr-5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 text-right" dir="rtl">
            <p className="text-[13px] font-black leading-[1.45] text-[#123f59]">
              {title}
            </p>
          </div>

          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${toneStyle.icon}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="flex items-end justify-between gap-3" style={{ direction: "ltr" }}>
          <div className="flex min-w-[72px] items-end justify-start">
            <span className="text-[34px] font-black leading-none tracking-tight text-[#123f59]">
              {value ?? 0}
            </span>
          </div>

          {change ? (
            <span
              className={`mb-1 inline-flex h-7 max-w-[120px] items-center justify-center gap-1 whitespace-nowrap rounded-full px-3 text-[11px] font-black ${
                trend === "up" ? toneStyle.badge : "bg-rose-50 text-rose-700"
              }`}
              dir="rtl"
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span>{change}</span>
            </span>
          ) : (
            <span />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionButton = ({ title, icon: Icon, colorClass, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex h-14 items-center justify-between gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 text-white shadow-[0_8px_18px_rgba(2,12,23,0.10)] transition hover:-translate-y-0.5 hover:bg-white/16 focus:outline-none focus:ring-2 focus:ring-[#e2bf74]/60"
  >
    <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/20", colorClass)}>
      <Icon className="h-4 w-4" />
    </div>
    <span className="min-w-0 flex-1 text-right text-[12px] font-black leading-tight">
      {title}
    </span>
  </button>
);

const EmptyBox = ({ icon: Icon, title, description, height = "h-[180px]" }) => (
  <div className={cn("flex items-center justify-center rounded-[18px] border border-dashed border-[#d8b46a]/40 bg-[#fbf8f1]/55 p-4 text-center", height)}>
    <div>
      <Icon className="mx-auto mb-2 h-9 w-9 text-[#8da0bb]" />
      <p className="text-sm font-black text-[#123f59]">{title}</p>
      {description && (
        <p className="mt-1 text-[11px] font-bold leading-relaxed text-[#8da0bb]">
          {description}
        </p>
      )}
    </div>
  </div>
);


const normalizeText = (value) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

const flattenSidebarItems = (input) => {
  const result = [];
  const visited = new Set();

  const visit = (node) => {
    if (!node || typeof node !== "object" || visited.has(node)) return;
    visited.add(node);

    if (node.id || node.code || node.label || node.title || node.name) {
      result.push(node);
    }

    const childGroups = [
      node.items,
      node.children,
      node.screens,
      node.subItems,
      node.menuItems,
      node.routes,
    ];

    childGroups.forEach((group) => {
      if (Array.isArray(group)) {
        group.forEach(visit);
      }
    });
  };

  if (Array.isArray(input)) {
    input.forEach(visit);
  } else if (input && typeof input === "object") {
    [input.categories, input.items, input.screens, input.menuItems, input.routes]
      .filter(Array.isArray)
      .forEach((group) => group.forEach(visit));

    visit(input);
  }

  return result;
};

const Dashboard = () => {
  const { user } = useAuth();
  const { openScreen, sidebarConfig } = useAppStore();

  const [greeting, setGreeting] = useState("");
  const [showQuickLinks, setShowQuickLinks] = useState(false);
  const [quickLinksSearch, setQuickLinksSearch] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? "صباح الخير" : "مساء الخير");
  }, []);

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data.data;
    },
    staleTime: 60_000,
  });

  const { data: quickLinks = [], isLoading: isLoadingLinks } = useQuery({
    queryKey: ["quick-links-dashboard"],
    queryFn: async () => (await api.get("/quick-links")).data.data,
    enabled: showQuickLinks,
    staleTime: 60_000,
  });

  const incrementUsageMutation = useMutation({
    mutationFn: async (id) => api.post(`/quick-links/${id}/increment`),
  });

  const stats = data?.kpis || {};
  const chartData = Array.isArray(data?.chartData) ? data.chartData : [];
  const statusData = Array.isArray(data?.statusData) ? data.statusData : [];
  const recentTransactions = Array.isArray(data?.recentTransactions)
    ? data.recentTransactions
    : [];
  const upcomingTasks = Array.isArray(data?.upcomingTasks) ? data.upcomingTasks : [];

  const sidebarItems = useMemo(() => flattenSidebarItems(sidebarConfig), [sidebarConfig]);

  const filteredQuickLinks = useMemo(() => {
    const query = quickLinksSearch.trim().toLowerCase();

    return [...quickLinks]
      .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
      .filter((link) => {
        if (!query) return true;

        return [link.title, link.url, link.category?.name]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      });
  }, [quickLinks, quickLinksSearch]);

  const resolveScreenTarget = (candidates = [], fallbackTitle = "") => {
    const list = Array.isArray(candidates) ? candidates : [candidates];
    const wanted = list.map(normalizeText).filter(Boolean);

    const exactMatch = sidebarItems.find((item) => {
      const fields = [
        item.id,
        item.code,
        item.permissionCode,
        item.label,
        item.title,
        item.name,
        item.route,
        item.path,
      ].map(normalizeText);

      return wanted.some((candidate) => fields.includes(candidate));
    });

    if (exactMatch) return exactMatch;

    const fuzzyMatch = sidebarItems.find((item) => {
      const fields = [
        item.label,
        item.title,
        item.name,
        item.categoryTitle,
        item.description,
      ].map(normalizeText);

      return wanted.some((candidate) =>
        fields.some((field) => field && (field.includes(candidate) || candidate.includes(field))),
      );
    });

    if (fuzzyMatch) return fuzzyMatch;

    return {
      id: list[0],
      label: fallbackTitle || list[0],
    };
  };

  const handleNavigate = (candidates, fallbackTitle) => {
    if (typeof openScreen !== "function") {
      toast.error("حدث خطأ في نظام التابات");
      return;
    }

    const target = resolveScreenTarget(candidates, fallbackTitle);

    if (!target?.id) {
      toast.error("تعذر فتح الشاشة المطلوبة");
      return;
    }

    openScreen(target.id, target.label || target.title || fallbackTitle || target.id);
  };

  const normalizeUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    return `https://${url}`;
  };

  const handleOpenLink = (link) => {
    const url = normalizeUrl(link?.url);

    if (!url) {
      toast.error("الرابط غير صالح");
      return;
    }

    if (link?.id) {
      incrementUsageMutation.mutate(link.id);
    }

    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (isLoading) {
    return (
      <div
        dir="rtl"
        className="flex min-h-screen flex-col items-center justify-center bg-[#f3f7f6] p-4 text-center"
      >
        <div className="rounded-[24px] border border-[#e8ddc8] bg-white px-8 py-7 shadow-[0_18px_45px_rgba(18,63,89,0.10)]">
          <Loader2 className="mx-auto mb-4 h-11 w-11 animate-spin text-[#0e7490]" />
          <h2 className="text-lg font-black text-[#123f59]">
            جاري تحميل لوحة القيادة...
          </h2>
          <p className="mt-1 text-xs font-bold text-[#8da0bb]">
            يتم جلب المؤشرات والعمليات الحديثة.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_left,#eef7f6,transparent_36%),linear-gradient(135deg,#fbf8f1_0%,#ffffff_46%,#f3f7f6_100%)] p-2 font-sans md:p-3"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3">
        <section className="relative overflow-hidden rounded-[22px] border border-[#d8b46a]/30 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] p-3 text-white shadow-[0_14px_30px_rgba(18,63,89,0.16)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(226,191,116,0.23),transparent_28%)]" />

          <div className="relative flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <h1 className="text-xl font-black leading-tight md:text-2xl">
                {greeting}، {user?.name || "المدير العام"} 👋
              </h1>
              <p className="mt-0.5 max-w-2xl text-xs font-bold leading-relaxed text-white/65">
                ملخص متوازن للنشاطات والعمليات داخل المكتب الهندسي.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative min-w-[230px] flex-1 sm:w-80">
                <Search className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8da0bb]" />
                <input
                  type="text"
                  placeholder="بحث في النظام..."
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      toast.info("البحث العام غير مفعّل بعد، استعمل بحث كل شاشة حالياً.");
                    }
                  }}
                  className="h-9 w-full rounded-xl border border-white/10 bg-white/95 pr-9 pl-3 text-xs font-bold text-[#123f59] outline-none transition focus:border-[#e2bf74] focus:ring-2 focus:ring-[#e2bf74]/25"
                />
              </div>

              <button
                type="button"
                onClick={() => refetch()}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 text-[11px] font-black text-white transition hover:bg-white/15"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                تحديث
              </button>

              <button
                type="button"
                onClick={() => toast.info("لا توجد إشعارات جديدة حالياً")}
                className="relative grid h-9 w-9 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/15"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#123f59] bg-rose-500" />
              </button>
            </div>
          </div>
        </section>

        {isError && (
          <div className="rounded-[18px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700">
            تعذر تحميل بعض بيانات لوحة القيادة. يمكنك الضغط على زر التحديث لإعادة المحاولة.
          </div>
        )}

        <section className="overflow-hidden rounded-[22px] border border-[#d8b46a]/30 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] shadow-[0_12px_30px_rgba(18,63,89,0.13)]">
          <div className="flex flex-col gap-3 p-3 xl:flex-row xl:items-center">
            <div className="flex min-w-[220px] items-center gap-3 border-b border-white/10 pb-2 xl:border-b-0 xl:border-l xl:pb-0 xl:pl-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e2bf74] text-[#06111d] shadow-[0_10px_22px_rgba(226,191,116,0.25)]">
                <Activity className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black leading-tight text-white">
                  الإجراءات السريعة
                </h3>
                <p className="mt-0.5 text-[11px] font-bold text-white/55">
                  وصول مباشر لأكثر العمليات استعمالاً.
                </p>
              </div>
            </div>

            <div className="grid flex-1 grid-cols-2 gap-2 md:grid-cols-3 2xl:grid-cols-6">
              <QuickActionButton
                title="إنشاء ملف عميل"
                icon={UserPlus}
                colorClass="bg-blue-500/25 text-blue-100"
                onClick={() => handleNavigate(["العملاء", "إدارة العملاء", "سجل العملاء", "300", "010"], "العملاء")}
              />
              <QuickActionButton
                title="إنشاء ملف ملكية"
                icon={Building}
                colorClass="bg-emerald-500/25 text-emerald-100"
                onClick={() => handleNavigate(["الملكيات", "الصكوك", "ملفات الملكيات", "الملكيات والصكوك", "310"], "الملكيات والصكوك")}
              />
              <QuickActionButton
                title="معاملة جديدة"
                icon={FileSignature}
                colorClass="bg-violet-500/25 text-violet-100"
                onClick={() => handleNavigate(["المعاملات", "سجل المعاملات", "055"], "المعاملات")}
              />
              <QuickActionButton
                title="سجل المعاملات"
                icon={Layers}
                colorClass="bg-amber-500/25 text-amber-100"
                onClick={() => handleNavigate(["المعاملات", "سجل المعاملات", "055"], "المعاملات")}
              />
              <QuickActionButton
                title="دليل العملاء"
                icon={Users}
                colorClass="bg-cyan-500/25 text-cyan-100"
                onClick={() => handleNavigate(["العملاء", "إدارة العملاء", "سجل العملاء", "300", "010"], "العملاء")}
              />
              <QuickActionButton
                title="الروابط السريعة"
                icon={Link2}
                colorClass="bg-slate-400/25 text-slate-100"
                onClick={() => setShowQuickLinks(true)}
              />
            </div>
          </div>
        </section>

        <section className="space-y-2.5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              title="إجمالي العملاء"
              value={stats.totalClients || 0}
              change="+12"
              trend="up"
              icon={Users}
              tone="blue"
            />
            <KpiCard
              title="المعاملات النشطة"
              value={stats.activeTransactions || 0}
              change="+5"
              trend="up"
              icon={FileText}
              tone="emerald"
            />
            <KpiCard
              title="ملفات الملكيات والصكوك"
              value={stats.totalProperties || 0}
              change="+8"
              trend="up"
              icon={Building}
              tone="violet"
            />
            <KpiCard
              title="المهام العاجلة"
              value={stats.pendingTasks || 0}
              change="لا عاجل"
              trend="down"
              icon={AlertCircle}
              tone="rose"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-[1.65fr_1fr]">
            <Card className="overflow-hidden rounded-[22px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.05)]">
              <SectionHeader
                title="معدل النشاط الشهري"
                description="حركة إضافة العملاء والمعاملات خلال الأشهر الماضية"
                icon={Activity}
              />

              <CardContent className="p-3">
                {chartData.length > 0 ? (
                  <div
                    className="h-[185px] w-full rounded-[18px] bg-gradient-to-b from-[#f8fbfb] to-white px-2 pt-2"
                    dir="ltr"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 8, right: 8, left: -22, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0e7490" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#0e7490" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorTrans" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="name"
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#94a3b8"
                          fontSize={10}
                          tickLine={false}
                          axisLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "14px",
                            border: "1px solid #e8ddc8",
                            boxShadow: "0 14px 30px rgba(18,63,89,0.10)",
                            fontSize: "12px",
                          }}
                          labelStyle={{ color: "#123f59", fontWeight: 900 }}
                        />
                        <Legend wrapperStyle={{ fontSize: "11px", fontWeight: 900 }} />
                        <Area
                          type="monotone"
                          name="عملاء جدد"
                          dataKey="clients"
                          stroke="#0e7490"
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
                ) : (
                  <EmptyBox
                    icon={Activity}
                    title="لا توجد بيانات كافية للرسم البياني"
                    description="سيظهر الرسم عند توفر بيانات شهرية."
                    height="h-[185px]"
                  />
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden rounded-[22px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.05)]">
              <SectionHeader
                title="حالات المعاملات"
                description="توزيع المعاملات حسب الحالة"
                icon={FileText}
                tone="gold"
              />

              <CardContent className="p-3">
                {statusData.length > 0 ? (
                  <div className="grid min-h-[185px] grid-cols-1 items-center gap-3 sm:grid-cols-[132px_1fr] xl:grid-cols-1 2xl:grid-cols-[132px_1fr]">
                    <div className="h-[120px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius={36}
                            outerRadius={56}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || "#0e7490"} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      {statusData.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-center justify-between rounded-2xl border border-[#e8ddc8]/60 bg-[#fbf8f1]/55 px-3 py-2 text-[11px] font-black"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: item.color || "#0e7490" }}
                            />
                            <span className="truncate text-[#60738f]">{item.name}</span>
                          </div>
                          <span className="shrink-0 text-[#123f59]">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyBox
                    icon={FileText}
                    title="لا توجد حالات معاملات"
                    description="سيظهر التوزيع بعد تسجيل الحالات."
                    height="h-[185px]"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 pb-4 xl:grid-cols-3">
          <Card className="overflow-hidden rounded-[22px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.05)] xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-[#e8ddc8]/65 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
              <div>
                <CardTitle className="text-[15px] font-black leading-tight text-[#123f59]">
                  أحدث المعاملات المضافة
                </CardTitle>
                <CardDescription className="mt-0.5 text-[11px] font-bold text-[#60738f]">
                  آخر العمليات المسجلة داخل النظام
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleNavigate(["المعاملات", "سجل المعاملات", "055"], "المعاملات")}
                className="h-9 rounded-xl border-[#d8b46a]/55 px-3 text-[11px] font-black text-[#123f59] hover:bg-[#fbf8f1]"
              >
                عرض السجل الكامل
              </Button>
            </CardHeader>

            <CardContent className="p-3">
              {recentTransactions.length > 0 ? (
                <div className="max-h-[236px] overflow-auto rounded-2xl border border-[#e8ddc8]/60">
                  <Table>
                    <TableBody>
                      {recentTransactions.slice(0, 8).map((tx) => (
                        <TableRow
                          key={tx.id}
                          className="border-b border-[#e8ddc8]/45 transition-colors last:border-0 hover:bg-[#eef7f6]/55"
                        >
                          <TableCell className="py-2.5">
                            <div className="flex items-center gap-3">
                              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#eef7f6] text-[#0e7490]">
                                <FileText className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-[#123f59]">
                                  {tx.type}
                                </p>
                                <p className="mt-0.5 text-[10px] font-mono text-[#8da0bb]">
                                  {tx.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className="text-xs font-black text-[#60738f]">
                              {tx.clientName}
                            </span>
                          </TableCell>

                          <TableCell>
                            <span className="rounded-lg bg-[#fbf8f1] px-2 py-1 text-[10px] font-black text-[#60738f]">
                              {tx.date}
                            </span>
                          </TableCell>

                          <TableCell className="text-left">
                            <Badge
                              className={cn(
                                "rounded-lg border px-2 py-0.5 text-[10px] font-black",
                                tx.status === "مكتملة"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : tx.status === "قيد التنفيذ" || tx.status === "مفتوحة"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : "border-amber-200 bg-amber-50 text-amber-700",
                              )}
                            >
                              {tx.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <EmptyBox
                  icon={FileText}
                  title="لا توجد معاملات حديثة"
                  description="ستظهر هنا أحدث المعاملات فور إضافتها."
                  height="h-[180px]"
                />
              )}
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-[22px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.05)]">
            <SectionHeader
              title="المهام والمواعيد"
              description="المتابعات القادمة والتنبيهات التشغيلية"
              icon={CheckCircle2}
            />

            <CardContent className="p-3">
              <ScrollArea className="h-[236px] pr-3">
                <div className="space-y-2.5">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 rounded-2xl border border-[#e8ddc8]/60 bg-white p-3"
                      >
                        <div
                          className={cn(
                            "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl",
                            item.type === "visit"
                              ? "bg-orange-50 text-orange-600"
                              : item.type === "meeting"
                                ? "bg-violet-50 text-violet-600"
                                : "bg-emerald-50 text-emerald-600",
                          )}
                        >
                          {item.type === "visit" ? (
                            <MapPin className="h-4 w-4" />
                          ) : item.type === "meeting" ? (
                            <Users className="h-4 w-4" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-black leading-relaxed text-[#123f59]">
                            {item.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-[#8da0bb]" />
                            <span className="text-[10px] font-bold text-[#8da0bb]">
                              {item.date} - {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyBox
                      icon={CheckCircle2}
                      title="لا توجد مهام أو مواعيد قادمة"
                      description="كل شيء يبدو منظماً في الوقت الحالي."
                      height="h-[210px]"
                    />
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </section>
      </div>

      {showQuickLinks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06111d]/75 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-[28px] border border-[#d8b46a]/30 bg-white shadow-[0_24px_70px_rgba(2,12,23,0.35)]">
            <div className="shrink-0 border-b border-[#e8ddc8] bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] p-4 text-white">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-black">
                    <Link2 className="h-5 w-5 text-[#e2bf74]" />
                    الروابط السريعة للنظام
                  </h3>
                  <p className="mt-0.5 text-[11px] font-bold text-white/60">
                    روابط مختصرة محفوظة من قاعدة البيانات.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowQuickLinks(false)}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-3 text-[12px] font-black transition hover:bg-white/15"
                >
                  <IconWithText icon={X} text="إغلاق" iconClassName="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8da0bb]" />
                  <input
                    value={quickLinksSearch}
                    onChange={(event) => setQuickLinksSearch(event.target.value)}
                    type="text"
                    placeholder="بحث باسم الرابط أو التصنيف..."
                    className="h-11 w-full rounded-2xl border border-white/10 bg-white pr-10 pl-3 text-sm font-bold text-[#123f59] outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuickLinks(false);
                    handleNavigate(["الروابط السريعة", "إدارة الروابط", "Quick Links", "109"], "إدارة الروابط");
                  }}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#e2bf74] px-4 text-[12px] font-black text-[#06111d] transition hover:bg-[#f1d38f]"
                >
                  إدارة الروابط
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingLinks ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#0e7490]" />
                  <span className="text-sm font-black text-[#60738f]">
                    جاري تحميل الروابط...
                  </span>
                </div>
              ) : filteredQuickLinks.length === 0 ? (
                <EmptyBox
                  icon={Link2}
                  title="لا توجد روابط مطابقة"
                  description="أضف روابط جديدة أو غيّر كلمات البحث."
                  height="h-[180px]"
                />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredQuickLinks.map((link) => (
                    <button
                      key={link.id}
                      type="button"
                      onClick={() => handleOpenLink(link)}
                      className="group relative flex min-h-[128px] flex-col rounded-[22px] border border-[#e8ddc8] bg-[#fbf8f1]/70 p-4 text-right transition hover:-translate-y-0.5 hover:border-[#0e7490]/45 hover:bg-[#eef7f6]"
                    >
                      <div className="mb-3 flex w-full items-start justify-between gap-2">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#0e7490] shadow-sm transition group-hover:bg-[#0e7490] group-hover:text-white">
                          <ExternalLink className="h-4 w-4" />
                        </div>
                        {link.isPinned && (
                          <Pin
                            size={15}
                            className="shrink-0 text-[#d8b46a]"
                            fill="currentColor"
                          />
                        )}
                      </div>

                      <span className="truncate text-sm font-black leading-relaxed text-[#123f59]">
                        {link.title}
                      </span>

                      <div className="mt-auto flex w-full items-center justify-between gap-2 pt-3">
                        <span className="max-w-[75%] truncate rounded-full bg-white px-2 py-1 text-[10px] font-black text-[#8da0bb]">
                          {link.category?.name || "بدون تصنيف"}
                        </span>
                        {link.requiresLogin && (
                          <Lock
                            size={13}
                            className="shrink-0 text-rose-500"
                            title="يحتوي على بيانات دخول"
                          />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-[#e8ddc8] bg-[#fbf8f1]/70 p-3">
              <Button
                type="button"
                className="h-11 w-full rounded-2xl bg-[#123f59] text-sm font-black text-white hover:bg-[#15536f]"
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
