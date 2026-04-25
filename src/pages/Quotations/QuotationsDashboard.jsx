import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios"; // تأكد من مسار axios
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
} from "lucide-react";
import { useAppStore } from "../../stores/useAppStore";

const QuotationsDashboard = () => {
  const { addTab } = useAppStore();
  const SCREEN_ID = "815";

  // ... (نفس دوال فتح التابات بدون تغيير)
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-3 md:p-4 bg-slate-50 min-h-screen" dir="rtl">
      {/* 1. إجراءات سريعة - أكثر كثافة */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3 p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="text-[11px] font-bold text-slate-500 ml-1 whitespace-nowrap">
          إجراءات سريعة:
        </div>
        <button
          onClick={openCreateTab}
          className="px-2.5 py-1 bg-blue-500 text-white rounded text-[11px] font-bold flex items-center gap-1 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-3 h-3" /> عرض سعر جديد
        </button>
        <button className="px-2.5 py-1 bg-violet-50 text-violet-600 border border-violet-200 rounded text-[11px] font-bold flex items-center gap-1 hover:bg-violet-100 transition-colors">
          <Upload className="w-3 h-3" /> استيراد (PDF)
        </button>
        <button className="px-2.5 py-1 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded text-[11px] font-bold flex items-center gap-1 hover:bg-cyan-100 transition-colors">
          <Download className="w-3 h-3" /> تصدير سريع
        </button>
        <button className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1 relative hover:bg-emerald-100 transition-colors">
          <Stamp className="w-3 h-3" /> موافقة المالك
          {stats.awaitingSignature > 0 && (
            <span className="px-1 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold ml-1">
              {stats.awaitingSignature}
            </span>
          )}
        </button>
        <div className="flex-1"></div>
        <button className="px-2.5 py-1 bg-slate-50 text-slate-500 border border-slate-300 rounded text-[11px] flex items-center gap-1 hover:bg-slate-100 transition-colors">
          <Search className="w-3 h-3" /> بحث{" "}
          <span className="px-1 bg-slate-200 rounded text-[8px] font-mono">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* 2. الإحصائيات 8 بطاقات في سطر واحد للشاشات الكبيرة */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3">
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
      </div>

      {/* 3. الملخص المالي ومؤشرات الأداء في سطر واحد معاً */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-2 mb-3">
        <FinancialCard
          color="blue"
          label="إجمالي قيمة العروض"
          amount={stats.totalValue.toLocaleString()}
        />
        <FinancialCard
          color="green"
          label="إجمالي المحصّل (تقريبي)"
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
          label="معدل عدم الرد"
          value={`${stats.noResponseRate}%`}
        />
        <MetricCard
          color="sky"
          icon={Send}
          label="العروض المُرسلة"
          value={stats.totalSent}
        />
      </div>

      {/* 4. لوحة التحكم - شبكة الأزرار المكثفة (8 في السطر للشاشات الكبيرة جداً) */}
      <div className="p-3 md:p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-blue-600" /> العمليات
          والخدمات
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
          <DashboardButton
            color="blue"
            icon={FileText}
            label="دليل العروض"
            code="815-B"
            badge={stats.totalQuotations}
            onClick={openDirectoryTab}
          />
          <DashboardButton
            color="green"
            icon={FilePlus}
            label="إنشاء عرض"
            code="815-A"
            onClick={openCreateTab}
          />
          <DashboardButton
            color="violet"
            icon={Layout}
            label="نماذج العروض"
            code="815-T"
            onClick={openTemplatesTab}
          />
          <DashboardButton
            color="orange"
            icon={Package}
            label="البنود والمجموعات"
            code="815-I"
            onClick={openItemsTab}
          />
          <DashboardButton
            color="cyan"
            icon={ShieldCheck}
            label="الاعتماد والمراجعة"
            code="815-W"
            badge={stats.pendingApproval}
            onClick={openApprovalsTab}
          />
          <DashboardButton
            color="emerald"
            icon={CreditCard}
            label="الدفعات والتحصيل"
            code="815-P"
            onClick={openPaymentsTab}
          />
          <DashboardButton
            color="indigo"
            icon={BarChart3}
            label="تقارير العروض"
            code="815-R"
            onClick={openReportsTab}
          />
          <DashboardButton
            color="red"
            icon={RotateCcw}
            label="الملغاة/الاسترجاع"
            code="815-C"
            badge={stats.cancelled}
            onClick={openCancellationsTab}
          />
          <DashboardButton
            color="slate"
            icon={Settings}
            label="الإعدادات"
            code="815-S"
            readyForDev
          />
          <DashboardButton
            color="amber"
            icon={Bell}
            label="الإشعارات"
            code="815-N"
          />
          <DashboardButton
            color="slate"
            icon={ScrollText}
            label="سجل التدقيق"
            code="815-L"
          />
          <DashboardButton
            color="cyan"
            icon={Archive}
            label="التصدير والأرشفة"
            code="815-X"
            readyForDev
          />
          <DashboardButton
            color="pink"
            icon={Link2}
            label="ربط العملاء"
            code="815-CL"
            readyForDev
          />
          <DashboardButton
            color="violet"
            icon={Sparkles}
            label="المساعد الذكي"
            code="815-AI"
            readyForDev
          />
          <DashboardButton
            color="sky"
            icon={TrendingUp}
            label="التحليلات"
            code="815-D"
            readyForDev
          />
          <DashboardButton
            color="yellow"
            icon={Bookmark}
            label="القوالب السريعة"
            code="815-M"
            badge="1"
            readyForDev
          />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// المكونات المساعدة - تم تكثيفها بشدة
// ==========================================

const StatCard = ({ color, icon: Icon, count, label }) => {
  const colorMap = {
    blue: "border-t-blue-500 text-blue-500 bg-blue-50/30",
    indigo: "border-t-indigo-500 text-indigo-500 bg-indigo-50/30",
    amber: "border-t-amber-500 text-amber-500 bg-amber-50/30",
    emerald: "border-t-emerald-500 text-emerald-500 bg-emerald-50/30",
    yellow: "border-t-yellow-500 text-yellow-500 bg-yellow-50/30",
    green: "border-t-green-500 text-green-500 bg-green-50/30",
    orange: "border-t-orange-500 text-orange-500 bg-orange-50/30",
    red: "border-t-red-500 text-red-500 bg-red-50/30",
  };
  return (
    <div
      className={`p-2 rounded-lg border border-slate-200 border-t-2 shadow-sm text-center flex flex-col items-center justify-center ${colorMap[color]}`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-3.5 h-3.5" />
        <span className="text-lg font-bold leading-none text-slate-800">
          {count}
        </span>
      </div>
      <div className="text-[9.5px] font-medium text-slate-500 leading-tight truncate w-full">
        {label}
      </div>
    </div>
  );
};

const FinancialCard = ({ color, label, amount }) => {
  const colorMap = { blue: "border-r-blue-500", green: "border-r-green-500" };
  const textMap = { blue: "text-blue-700", green: "text-green-700" };

  return (
    <div
      className={`p-2.5 bg-white rounded-lg border border-slate-200 border-r-4 shadow-sm flex flex-col justify-center ${colorMap[color]}`}
    >
      <div className="text-[10px] text-slate-500 mb-0.5">{label}</div>
      <div className={`text-lg font-bold leading-none ${textMap[color]}`}>
        {amount}{" "}
        <span className="text-[10px] font-normal text-slate-400">ر.س</span>
      </div>
    </div>
  );
};

const MetricCard = ({ color, icon: Icon, label, value, unit }) => {
  const colorMap = {
    violet: "border-r-violet-500 text-violet-600 bg-violet-50/50",
    emerald: "border-r-emerald-500 text-emerald-600 bg-emerald-50/50",
    red: "border-r-red-500 text-red-600 bg-red-50/50",
    sky: "border-r-sky-500 text-sky-600 bg-sky-50/50",
  };
  const bgClass = colorMap[color].split(" ")[2];

  return (
    <div
      className={`p-2 bg-white rounded-lg border border-slate-200 border-r-4 shadow-sm flex items-center gap-2 ${colorMap[color].split(" ")[0]}`}
    >
      <div
        className={`w-7 h-7 rounded bg-white shadow-sm flex items-center justify-center ${colorMap[color].split(" ")[1]}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="text-[9.5px] text-slate-500 truncate">{label}</div>
        <div className="text-sm font-bold text-slate-800 leading-tight">
          {value}{" "}
          {unit && (
            <span className="text-[9px] font-normal text-slate-400">
              {unit}
            </span>
          )}
        </div>
      </div>
    </div>
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
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    orange: "bg-orange-50 text-orange-500 border-orange-100",
    cyan: "bg-cyan-50 text-cyan-600 border-cyan-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    red: "bg-red-50 text-red-600 border-red-100",
    slate: "bg-slate-50 text-slate-500 border-slate-200",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    pink: "bg-pink-50 text-pink-600 border-pink-100",
    sky: "bg-sky-50 text-sky-600 border-sky-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };
  const selectedColor = colorMap[color] || colorMap.slate;

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2.5 bg-white border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors relative min-h-[85px] hover:border-slate-300`}
    >
      {badge && (
        <span
          className={`absolute top-1 right-1 px-1.5 py-0.5 text-white rounded text-[9px] font-bold leading-none ${selectedColor.split(" ")[1].replace("text", "bg")}`}
        >
          {badge}
        </span>
      )}
      {readyForDev && (
        <span
          title="جاهز للتطوير"
          className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-slate-300"
        ></span>
      )}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 ${selectedColor.split(" ").slice(0, 2).join(" ")}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-[10.5px] font-bold text-slate-700 text-center leading-tight w-full truncate px-1">
        {label}
      </div>
      <div className="text-[8px] text-slate-400 font-mono mt-1">{code}</div>
    </button>
  );
};

export default QuotationsDashboard;
