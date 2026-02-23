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

  const openCreateTab = () => {
    addTab(SCREEN_ID, {
      id: `CREATE-QUOTATION-${Date.now()}`,
      title: "إنشاء عرض سعر",
      type: "create-quotation",
      closable: true,
    });
  };

  const openDirectoryTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-DIRECTORY`,
      title: "دليل العروض",
      type: "directory",
      closable: true,
    });
  };

  // 👈 دالة فتح تاب نماذج العروض
  const openTemplatesTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-TEMPLATES`,
      title: "نماذج عروض الأسعار",
      type: "templates",
      closable: true,
    });
  };

  const openItemsTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-ITEMS`,
      title: "البنود والمجموعات",
      type: "items",
      closable: true,
    });
  };

  const openApprovalsTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-APPROVALS`,
      title: "الاعتماد والمراجعة",
      type: "approvals",
      closable: true,
    });
  };

  const openPaymentsTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-PAYMENTS`,
      title: "الدفعات والتحصيل",
      type: "payments",
      closable: true,
    });
  };

  const openReportsTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-REPORTS`,
      title: "تقارير عروض الأسعار",
      type: "reports",
      closable: true,
    });
  };

  const openCancellationsTab = () => {
    addTab(SCREEN_ID, {
      id: `QUOTATIONS-CANCELLATIONS`,
      title: "الملغاة والاسترجاع",
      type: "cancellations",
      closable: true,
    });
  };

  // ==========================================
  // جلب الإحصائيات الحقيقية من السيرفر
  // ==========================================
  const {
    data: statsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quotations-stats"],
    queryFn: async () => {
      const response = await axios.get("/quotations/stats");
      return response.data.data;
    },
    // تحديث البيانات كل دقيقة تلقائياً
    refetchInterval: 60000,
  });

  // قيم افتراضية في حال التحميل أو الخطأ
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
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="font-bold text-sm">جاري تحميل الإحصائيات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 md:p-6 bg-slate-50 min-h-screen" dir="rtl">
      {/* 1. إجراءات سريعة */}
      <div className="flex flex-wrap items-center gap-2 mb-5 p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="text-xs font-bold text-slate-500 ml-2 whitespace-nowrap">
          إجراءات سريعة:
        </div>
        <button
          onClick={openCreateTab}
          className="px-3.5 py-1.5 bg-blue-500 text-white border-none rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> عرض سعر جديد
        </button>
        <button className="px-3.5 py-1.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-violet-100 transition-colors">
          <Upload className="w-3.5 h-3.5" /> استيراد عرض خارجي (PDF)
        </button>
        <button className="px-3.5 py-1.5 bg-cyan-50 text-cyan-700 border border-cyan-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 hover:bg-cyan-100 transition-colors">
          <Download className="w-3.5 h-3.5" /> تصدير سريع
        </button>
        <button className="px-3.5 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 relative hover:bg-emerald-100 transition-colors">
          <Stamp className="w-3.5 h-3.5" /> تسجيل موافقة المالك
          {stats.awaitingSignature > 0 && (
            <span className="px-1.5 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-bold ml-1">
              {stats.awaitingSignature}
            </span>
          )}
        </button>
        <div className="flex-1"></div>
        <button className="px-3.5 py-1.5 bg-slate-50 text-slate-500 border border-slate-300 rounded-lg text-xs cursor-pointer flex items-center gap-1.5 hover:bg-slate-100 transition-colors">
          <Search className="w-3.5 h-3.5" /> بحث سريع
          <span className="px-1.5 py-0.5 bg-slate-200 rounded text-[9px] font-mono">
            Ctrl+K
          </span>
        </button>
      </div>

      {/* 2. الإحصائيات العلوية - الصف الأول */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
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
          label="قيد المراجعة / الاعتماد الداخلي"
        />
        <StatCard
          color="amber"
          icon={PenTool}
          count={stats.awaitingSignature}
          label="بانتظار توقيع المالك"
        />
        <StatCard
          color="emerald"
          icon={CircleDollarSign}
          count={stats.approvedPendingPayment}
          label="معتمدة بانتظار الدفع"
        />
      </div>

      {/* 3. الإحصائيات العلوية - الصف الثاني */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
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

      {/* 4. الملخص المالي */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <FinancialCard
          color="blue"
          label="إجمالي قيمة العروض (النشطة)"
          amount={stats.totalValue.toLocaleString()}
        />
        <FinancialCard
          color="green"
          label="إجمالي المحصّل (تقريبي)"
          amount={stats.totalCollected.toLocaleString()}
        />
      </div>

      {/* 5. مؤشرات الأداء */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <MetricCard
          color="violet"
          icon={Stamp}
          label="متوسط مدة الموافقة"
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
          label="إجمالي العروض المُرسلة"
          value={stats.totalSent}
        />
      </div>

      {/* 6. لوحة التحكم - الأزرار المركزية */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm mb-5">
        <div className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-blue-600" /> لوحة التحكم — عروض
          الأسعار
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <DashboardButton
            color="blue"
            icon={FileText}
            label="دليل العروض"
            code="815-B01"
            badge={stats.totalQuotations}
            onClick={openDirectoryTab} // 👈 ربط الدالة هنا
          />
          <DashboardButton
            color="green"
            icon={FilePlus}
            label="إنشاء عرض سعر"
            code="815-A01"
            onClick={openCreateTab}
          />
          <DashboardButton
            color="violet"
            icon={Layout}
            label="نماذج العروض"
            code="815-T01"
            onClick={openTemplatesTab} // 👈 ربط الدالة هنا
          />
          <DashboardButton
            color="orange"
            icon={Package}
            label="البنود والمجموعات"
            code="815-I01"
            onClick={openItemsTab}
          />
          <DashboardButton
            color="cyan"
            icon={ShieldCheck}
            label="الاعتماد والمراجعة"
            code="815-W01"
            badge={stats.pendingApproval}
            onClick={openApprovalsTab}
          />
          <DashboardButton
            color="emerald"
            icon={CreditCard}
            label="الدفعات والتحصيل"
            code="815-P01"
            onClick={openPaymentsTab}
          />
          <DashboardButton
            color="indigo"
            icon={BarChart3}
            label="تقارير العروض"
            code="815-R01"
            onClick={openReportsTab}
          />
          <DashboardButton
            color="red"
            icon={RotateCcw}
            label="الملغاة / الاسترجاع"
            code="815-C01"
            badge={stats.cancelled}
            onClick={openCancellationsTab}
          />
          <DashboardButton
            color="slate"
            icon={Settings}
            label="الإعدادات"
            code="815-S01"
            readyForDev
          />
          <DashboardButton
            color="amber"
            icon={Bell}
            label="الإشعارات والتنبيهات"
            code="815-N01"
          />
          <DashboardButton
            color="slate"
            icon={ScrollText}
            label="سجل التدقيق"
            code="815-L01"
          />
          <DashboardButton
            color="cyan"
            icon={Archive}
            label="التصدير والأرشفة"
            code="815-X01"
            readyForDev
          />
          <DashboardButton
            color="pink"
            icon={Link2}
            label="ربط العملاء"
            code="815-CL01"
            readyForDev
          />
          <DashboardButton
            color="violet"
            icon={Sparkles}
            label="المساعد الذكي"
            code="815-AI01"
            readyForDev
          />
          <DashboardButton
            color="sky"
            icon={TrendingUp}
            label="التحليلات"
            code="815-D01"
            readyForDev
          />
          <DashboardButton
            color="yellow"
            icon={Bookmark}
            label="المفضلة والقوالب السريعة"
            code="815-M01"
            badge="1"
            readyForDev
          />
        </div>
      </div>
    </div>
  );
};

// ... المكونات المساعدة (StatCard, FinancialCard, MetricCard, DashboardButton) تبقى كما هي بدون تغيير ...
const StatCard = ({ color, icon: Icon, count, label }) => {
  const colorMap = {
    blue: "border-t-blue-500 text-blue-500",
    indigo: "border-t-indigo-600 text-indigo-600",
    amber: "border-t-amber-500 text-amber-500",
    emerald: "border-t-emerald-600 text-emerald-600",
    yellow: "border-t-yellow-500 text-yellow-500",
    green: "border-t-green-600 text-green-600",
    orange: "border-t-orange-500 text-orange-500",
    red: "border-t-red-600 text-red-600",
  };
  return (
    <div
      className={`p-3.5 bg-white rounded-xl border-x border-b border-slate-200 border-t-[3px] shadow-sm text-center cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all ${colorMap[color]}`}
    >
      <div className="mb-1.5 flex justify-center">
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-[22px] font-bold leading-none mb-1">{count}</div>
      <div className="text-[10px] text-slate-500 mt-1">{label}</div>
    </div>
  );
};

const FinancialCard = ({ color, label, amount }) => {
  const colorMap = {
    blue: "border-r-blue-500 text-blue-700",
    green: "border-r-green-600 text-green-600",
  };
  return (
    <div
      className={`p-4 bg-white rounded-xl border-y border-l border-r-4 border-slate-200 shadow-sm ${colorMap[color]}`}
    >
      <div className="text-xs text-slate-500 mb-1">{label}</div>
      <div className="text-[26px] font-bold">
        {amount} <span className="text-[13px] font-normal">ر.س</span>
      </div>
    </div>
  );
};

const MetricCard = ({ color, icon: Icon, label, value, unit }) => {
  const colorMap = {
    violet: "border-r-violet-500 text-violet-500 bg-violet-50",
    emerald: "border-r-emerald-600 text-emerald-600 bg-emerald-50",
    red: "border-r-red-600 text-red-600 bg-red-50",
    sky: "border-r-sky-600 text-sky-600 bg-sky-50",
  };
  return (
    <div
      className={`p-3 bg-white rounded-xl border-y border-l border-r-4 border-slate-200 shadow-sm flex items-center gap-3 ${colorMap[color].split(" ")[0]}`}
    >
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color].split(" ").slice(1).join(" ")}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <div className="text-[11px] text-slate-500">{label}</div>
        <div
          className={`text-[20px] font-bold ${colorMap[color].split(" ")[1]}`}
        >
          {value}{" "}
          {unit && <span className="text-[11px] font-normal">{unit}</span>}
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
    blue: "bg-blue-50 text-blue-500 border-blue-100",
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
      className={`flex flex-col items-center justify-center p-4 bg-white border-[1.5px] rounded-xl cursor-pointer hover:shadow-md transition-all duration-200 relative min-h-[110px] ${selectedColor.split(" ").slice(2).join(" ")} hover:scale-[1.02]`}
    >
      {badge && (
        <span
          className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 text-white rounded-[10px] text-[10px] font-bold ${selectedColor.split(" ")[1].replace("text", "bg")}`}
        >
          {badge}
        </span>
      )}
      {readyForDev && (
        <span
          title="جاهز للتطوير"
          className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-slate-300"
        ></span>
      )}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2 ${selectedColor.split(" ").slice(0, 2).join(" ")}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-[12px] font-bold text-slate-800 text-center leading-tight">
        {label}
      </div>
      <div className="text-[9px] text-slate-400 font-mono mt-0.5">{code}</div>
    </button>
  );
};

export default QuotationsDashboard;
