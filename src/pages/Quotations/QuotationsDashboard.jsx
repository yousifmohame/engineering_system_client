import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  Plus,
  Upload,
  Download,
  Stamp,
  Search,
  ClipboardList,
  FileSearch,
  PenTool,
  CircleDollarSign,
  Hourglass,
  CheckCircle,
  Clock,
  Ban,
  Send,
  FileText,
  FilePlus,
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
  Bookmark,
  Loader2,
  ArrowUpLeft,
  WalletCards,
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";

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
      className={`
        inline-flex items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4"} />}

      {text && (
        <span className={textClassName || "text-[10px] font-black leading-none"}>
          {text}
        </span>
      )}
    </span>
  );
};

const QuotationsDashboard = () => {
  const { addTab } = useAppStore();
  const SCREEN_ID = "815";

  const openCreateTab = () =>
    addTab(SCREEN_ID, {
      id: `CREATE-QUOTATION-${Date.now()}`,
      title: "إنشاء عرض سعر",
      type: "create-quotation",
      closable: true,
    });

  const openDirectoryTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-DIRECTORY`,
      title: "دليل العروض",
      type: "directory",
      closable: true,
    });

  const openTemplatesTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-TEMPLATES`,
      title: "نماذج عروض الأسعار",
      type: "templates",
      closable: true,
    });

  const openItemsTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-ITEMS`,
      title: "البنود والمجموعات",
      type: "items",
      closable: true,
    });

  const openApprovalsTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-APPROVALS`,
      title: "الاعتماد والمراجعة",
      type: "approvals",
      closable: true,
    });

  const openPaymentsTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-PAYMENTS`,
      title: "الدفعات والتحصيل",
      type: "payments",
      closable: true,
    });

  const openReportsTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-REPORTS`,
      title: "تقارير عروض الأسعار",
      type: "reports",
      closable: true,
    });

  const openCancellationsTab = () =>
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-CANCELLATIONS`,
      title: "الملغاة والاسترجاع",
      type: "cancellations",
      closable: true,
    });

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
    approvedPendingPayment: 0,
    partiallyPaid: 0,
    fullyPaid: 0,
    expired: 0,
    cancelled: 0,
    totalValue: 0,
    totalCollected: 0,
    avgApprovalDays: 0,
    approvalRate: 0,
    noResponseRate: 0,
    totalSent: 0,
  };

  const operationButtons = [
    {
      color: "blue",
      icon: FileText,
      label: "دليل العروض",
      code: "B-815",
      badge: stats.totalQuotations,
      onClick: openDirectoryTab,
    },
    {
      color: "emerald",
      icon: FilePlus,
      label: "إنشاء عرض",
      code: "A-815",
      onClick: openCreateTab,
    },
    {
      color: "violet",
      icon: Layout,
      label: "نماذج العروض",
      code: "T-815",
      onClick: openTemplatesTab,
    },
    {
      color: "orange",
      icon: Package,
      label: "البنود والمجموعات",
      code: "I-815",
      onClick: openItemsTab,
    },
    {
      color: "cyan",
      icon: ShieldCheck,
      label: "الاعتماد والمراجعة",
      code: "W-815",
      badge: stats.pendingApproval,
      onClick: openApprovalsTab,
    },
    {
      color: "green",
      icon: CreditCard,
      label: "الدفعات والتحصيل",
      code: "P-815",
      onClick: openPaymentsTab,
    },
    {
      color: "indigo",
      icon: BarChart3,
      label: "تقارير العروض",
      code: "R-815",
      onClick: openReportsTab,
    },
    {
      color: "red",
      icon: RotateCcw,
      label: "الملغاة والاسترجاع",
      code: "C-815",
      badge: stats.cancelled,
      onClick: openCancellationsTab,
    },
    {
      color: "slate",
      icon: Settings,
      label: "الإعدادات",
      code: "S-815",
      readyForDev: true,
    },
    {
      color: "amber",
      icon: Bell,
      label: "الإشعارات",
      code: "N-815",
    },
    {
      color: "slate",
      icon: ScrollText,
      label: "سجل التدقيق",
      code: "L-815",
    },
    {
      color: "cyan",
      icon: Archive,
      label: "التصدير والأرشفة",
      code: "X-815",
      readyForDev: true,
    },
    {
      color: "pink",
      icon: Link2,
      label: "ربط العملاء",
      code: "CL-815",
      readyForDev: true,
    },
    {
      color: "violet",
      icon: Sparkles,
      label: "المساعد الذكي",
      code: "AI-815",
      readyForDev: true,
    },
    {
      color: "sky",
      icon: TrendingUp,
      label: "التحليلات",
      code: "D-815",
      readyForDev: true,
    },
    {
      color: "yellow",
      icon: Bookmark,
      label: "القوالب السريعة",
      code: "M-815",
      badge: 1,
      readyForDev: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#d8b46a]/35 bg-white shadow-[0_10px_24px_rgba(18,63,89,0.10)]">
            <Loader2 className="h-6 w-6 animate-spin text-[#123f59]" />
          </div>

          <p className="text-xs font-black text-[#123f59]">
            جاري تحميل لوحة عروض الأسعار...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        h-full min-h-0 w-full max-w-full overflow-y-auto overflow-x-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-3 pb-20 font-[Tajawal] text-right text-[#123f59]
        md:p-4 md:pb-20
        custom-scrollbar-slim
      "
      dir="rtl"
    >
      <div className="max-w-full space-y-3 overflow-x-hidden">
        {/* Header + quick actions */}
        <section
          className="
            relative max-w-full overflow-hidden rounded-[22px]
            border border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-3 py-3 text-white
            shadow-[0_10px_24px_rgba(18,63,89,0.14)]
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-80px] h-36 w-36 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-80px] h-40 w-40 rounded-full bg-cyan-400/18 blur-3xl" />
          </div>

          <div className="relative z-10 flex max-w-full flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="
                  grid h-11 w-11 shrink-0 place-items-center
                  rounded-2xl border border-[#e2bf74]/35
                  bg-white/10 text-[#e2bf74]
                  shadow-md backdrop-blur-xl
                "
              >
                <IconWithText
                  icon={ClipboardList}
                  text="عروض"
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </span>

              <div className="min-w-0">
                <h2 className="truncate text-xl font-black">
                  لوحة عروض الأسعار
                </h2>

                <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                  متابعة العروض، الموافقات، التحصيل، التقارير والخدمات المرتبطة.
                </p>
              </div>
            </div>

            <div className="flex max-w-full flex-wrap items-center gap-2">
              <QuickButton
                icon={Plus}
                label="عرض جديد"
                onClick={openCreateTab}
                variant="primary"
              />

              <QuickButton icon={Upload} label="استيراد" variant="ghost" />

              <QuickButton icon={Download} label="تصدير" variant="ghost" />

              <QuickButton
                icon={Stamp}
                label="موافقة المالك"
                variant="ghost"
                badge={stats.awaitingSignature}
              />

              <QuickButton
                icon={Search}
                label="بحث"
                variant="soft"
                shortcut="Ctrl+K"
              />
            </div>
          </div>
        </section>

        {/* Main stats */}
        <section className="grid max-w-full grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          <StatCard
            color="blue"
            icon={ClipboardList}
            count={stats.totalQuotations}
            label="إجمالي العروض"
          />

          <StatCard
            color="indigo"
            icon={FileSearch}
            count={stats.pendingApproval}
            label="قيد المراجعة"
          />

          <StatCard
            color="amber"
            icon={PenTool}
            count={stats.awaitingSignature}
            label="بانتظار التوقيع"
          />

          <StatCard
            color="emerald"
            icon={CircleDollarSign}
            count={stats.approvedPendingPayment}
            label="بانتظار الدفع"
          />

          <StatCard
            color="yellow"
            icon={Hourglass}
            count={stats.partiallyPaid}
            label="مسددة جزئياً"
          />

          <StatCard
            color="green"
            icon={CheckCircle}
            count={stats.fullyPaid}
            label="مسددة بالكامل"
          />

          <StatCard
            color="orange"
            icon={Clock}
            count={stats.expired}
            label="منتهية الصلاحية"
          />

          <StatCard
            color="red"
            icon={Ban}
            count={stats.cancelled}
            label="ملغاة / مستردة"
          />
        </section>

        {/* Financial + metrics */}
        <section className="grid max-w-full grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          <FinancialCard
            color="blue"
            icon={WalletCards}
            label="إجمالي قيمة العروض"
            amount={stats.totalValue.toLocaleString()}
          />

          <FinancialCard
            color="green"
            icon={CircleDollarSign}
            label="إجمالي المحصّل"
            amount={stats.totalCollected.toLocaleString()}
          />

          <MetricCard
            color="violet"
            icon={Stamp}
            label="متوسط الموافقة"
            value={stats.avgApprovalDays}
            unit="يوم"
          />

          <MetricCard
            color="emerald"
            icon={CheckCircle}
            label="نسبة الموافقة"
            value={`${stats.approvalRate}%`}
          />

          <MetricCard
            color="red"
            icon={Clock}
            label="عدم الرد"
            value={`${stats.noResponseRate}%`}
          />

          <MetricCard
            color="sky"
            icon={Send}
            label="العروض المُرسلة"
            value={stats.totalSent}
          />
        </section>

        {/* Operations */}
        <section
          className="
            max-w-full overflow-hidden rounded-[22px]
            border border-[#d8b46a]/25 bg-white/90
            shadow-[0_8px_22px_rgba(18,63,89,0.06)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex items-center justify-between gap-3
              border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
              px-4 py-3
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className="
                  grid h-9 w-9 shrink-0 place-items-center
                  rounded-xl bg-[#123f59] text-[#e2bf74]
                "
              >
                <ClipboardList className="h-4 w-4" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-black text-[#123f59]">
                  العمليات والخدمات
                </h3>

                <p className="mt-0.5 truncate text-[10px] font-bold text-[#94a3b8]">
                  فتح الشاشات الفرعية الخاصة بإدارة عروض الأسعار.
                </p>
              </div>
            </div>

            <span
              className="
                shrink-0 rounded-xl border border-[#d8b46a]/25
                bg-[#fbf8f1] px-3 py-1.5
                text-[10px] font-black text-[#64748b]
              "
            >
              {operationButtons.length} خدمة
            </span>
          </div>

          <div className="p-3">
            <div className="grid max-w-full grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
              {operationButtons.map((button) => (
                <DashboardButton key={button.code} {...button} />
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const QuickButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "ghost",
  badge,
  shortcut,
}) => {
  const variants = {
    primary:
      "border-[#e2bf74]/40 bg-[#e2bf74] text-[#082032] hover:bg-[#f5d99b] shadow-[0_10px_20px_rgba(226,191,116,0.18)]",
    ghost:
      "border-white/15 bg-white/10 text-white hover:bg-white/18 hover:border-[#e2bf74]/35",
    soft:
      "border-white/15 bg-white text-[#123f59] hover:bg-[#fbf8f1]",
  };

  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex h-9 items-center justify-center gap-1.5
        rounded-xl border px-3 text-[11px] font-black
        transition-all hover:-translate-y-[1px]
        ${variants[variant] || variants.ghost}
      `}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}

      {badge > 0 && (
        <span
          className="
            mr-1 rounded-xl bg-rose-600 px-1.5 py-0.5
            text-[8px] font-black text-white
          "
        >
          {badge}
        </span>
      )}

      {shortcut && (
        <span
          className="
            mr-1 hidden rounded-xl border border-[#d8b46a]/25
            bg-[#fbf8f1] px-1.5 py-0.5
            font-mono text-[8px] font-black text-[#64748b]
            sm:inline-flex
          "
        >
          {shortcut}
        </span>
      )}
    </button>
  );
};

const StatCard = ({ color, icon: Icon, count, label }) => {
  const colorMap = {
    blue: {
      icon: "border-blue-200 bg-blue-50 text-blue-700",
      bar: "bg-blue-500",
    },
    indigo: {
      icon: "border-indigo-200 bg-indigo-50 text-indigo-700",
      bar: "bg-indigo-500",
    },
    amber: {
      icon: "border-amber-200 bg-amber-50 text-amber-700",
      bar: "bg-amber-500",
    },
    emerald: {
      icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
      bar: "bg-emerald-500",
    },
    yellow: {
      icon: "border-yellow-200 bg-yellow-50 text-yellow-700",
      bar: "bg-yellow-500",
    },
    green: {
      icon: "border-green-200 bg-green-50 text-green-700",
      bar: "bg-green-500",
    },
    orange: {
      icon: "border-orange-200 bg-orange-50 text-orange-700",
      bar: "bg-orange-500",
    },
    red: {
      icon: "border-rose-200 bg-rose-50 text-rose-700",
      bar: "bg-rose-500",
    },
  };

  const selected = colorMap[color] || colorMap.blue;

  return (
    <article
      className="
        relative min-w-0 overflow-hidden rounded-[16px]
        border border-[#d8b46a]/25 bg-white/90
        p-2.5 shadow-[0_8px_18px_rgba(18,63,89,0.05)]
        backdrop-blur-xl
      "
    >
      <span className={`absolute right-0 top-0 h-full w-1 ${selected.bar}`} />

      <div className="flex min-w-0 items-center justify-between gap-2 pr-1">
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-black leading-none text-[#123f59]">
            {count}
          </div>

          <div className="mt-1 line-clamp-2 min-h-[24px] text-[9px] font-black leading-3 text-[#64748b]">
            {label}
          </div>
        </div>

        <span
          className={`
            grid h-8 w-8 shrink-0 place-items-center
            rounded-xl border
            ${selected.icon}
          `}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
};

const FinancialCard = ({ color, icon: Icon, label, amount }) => {
  const colors = {
    blue: {
      icon: "border-blue-200 bg-blue-50 text-blue-700",
      value: "text-[#123f59]",
      bar: "bg-blue-500",
    },
    green: {
      icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
      value: "text-emerald-700",
      bar: "bg-emerald-500",
    },
  };

  const selected = colors[color] || colors.blue;

  return (
    <article
      className="
        relative min-w-0 overflow-hidden rounded-[16px]
        border border-[#d8b46a]/25 bg-white/90
        p-2.5 shadow-[0_8px_18px_rgba(18,63,89,0.05)]
        backdrop-blur-xl
      "
    >
      <span className={`absolute right-0 top-0 h-full w-1 ${selected.bar}`} />

      <div className="flex min-w-0 items-center gap-2 pr-1">
        <span
          className={`
            grid h-8 w-8 shrink-0 place-items-center
            rounded-xl border
            ${selected.icon}
          `}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[9.5px] font-black text-[#64748b]">
            {label}
          </div>

          <div
            className={`mt-1 truncate text-base font-black leading-none ${selected.value}`}
          >
            {amount}
            <span className="mr-1 text-[9px] font-bold text-[#94a3b8]">
              ر.س
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

const MetricCard = ({ color, icon: Icon, label, value, unit }) => {
  const colorMap = {
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return (
    <article
      className="
        min-w-0 rounded-[16px] border border-[#d8b46a]/25
        bg-white/90 p-2.5
        shadow-[0_8px_18px_rgba(18,63,89,0.05)]
        backdrop-blur-xl
      "
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`
            grid h-8 w-8 shrink-0 place-items-center
            rounded-xl border
            ${colorMap[color] || colorMap.sky}
          `}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="truncate text-[9.5px] font-black text-[#64748b]">
            {label}
          </div>

          <div className="mt-1 truncate text-sm font-black leading-none text-[#123f59]">
            {value}
            {unit && (
              <span className="mr-1 text-[9px] font-bold text-[#94a3b8]">
                {unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const DashboardButton = ({
  color,
  icon: Icon,
  label,
  code,
  badge,
  readyForDev,
  onClick,
}) => {
  const colorMap = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    indigo: "border-indigo-200 bg-indigo-50 text-indigo-700",
    red: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-[#d8b46a]/25 bg-[#fbf8f1] text-[#64748b]",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    pink: "border-pink-200 bg-pink-50 text-pink-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-700",
  };

  const selected = colorMap[color] || colorMap.slate;

  return (
    <button
      onClick={onClick}
      className="
        group relative flex min-h-[76px] min-w-0 flex-col items-center justify-center
        rounded-[16px] border border-[#e8ddc8]
        bg-white px-2 py-2
        text-center transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-[#d8b46a]/55 hover:bg-[#fbf8f1]
        hover:shadow-[0_10px_24px_rgba(18,63,89,0.08)]
      "
      type="button"
      title={label}
    >
      {badge !== undefined && Number(badge) > 0 && (
        <span
          className="
            absolute right-1.5 top-1.5
            rounded-xl bg-[#123f59]
            px-1.5 py-0.5
            text-[8px] font-black leading-none text-[#e2bf74]
            shadow-[0_8px_18px_rgba(18,63,89,0.05)]
          "
        >
          {badge}
        </span>
      )}

      {readyForDev && (
        <span
          title="جاهز للتطوير"
          className="
            absolute left-2 top-2
            h-1.5 w-1.5 rounded-full bg-slate-300
          "
        />
      )}

      <span
        className={`
          grid h-8 w-8 shrink-0 place-items-center rounded-xl border
          transition-transform group-hover:scale-105
          ${selected}
        `}
      >
        <Icon className="h-4 w-4" />
      </span>

      <span
        className="
          mt-1.5 line-clamp-2 min-h-[28px]
          px-1 text-[9.5px] font-black
          leading-[14px] text-[#123f59]
        "
      >
        {label}
      </span>

      <span
        className="
          mt-0.5 rounded-xl bg-[#fbf8f1]
          px-1.5 py-0.5
          font-mono text-[7.5px] font-black text-[#94a3b8]
        "
      >
        {code}
      </span>

      <ArrowUpLeft
        className="
          absolute bottom-1.5 left-1.5 h-3 w-3
          text-[#c5983c] opacity-0
          transition-opacity group-hover:opacity-100
        "
      />
    </button>
  );
};

export default QuotationsDashboard;