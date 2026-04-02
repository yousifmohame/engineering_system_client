import React, { useState } from "react";
import {
  Bell,
  AlertTriangle,
  Clock,
  CheckCircle2,
  User,
  Eye,
  DollarSign,
  FileX,
  AlertCircle,
  ArrowRight,
  Calendar,
  Paperclip,
  X,
  Search,
  Filter,
  Settings
} from "lucide-react";

// ==========================================
// 💡 مكون مساعدة: Tooltip (بديل لـ radix-ui/tooltip)
// ==========================================
const SimpleTooltip = ({ children, content }) => {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-xs px-2.5 py-1.5 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50 pointer-events-none">
        {content}
        {/* سهم التولتيب */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
      </div>
    </div>
  );
};

// ==========================================
// 💡 البيانات الوهمية (Mock Data)
// ==========================================
const categories = [
  { code: "URG", label: "عاجل" },
  { code: "FIN", label: "مالي" },
  { code: "DOC", label: "توثيق" },
  { code: "SYS", label: "نظام" },
  { code: "TXN", label: "معاملات" },
];

const financialNotifications = [
  {
    id: "FIN-001",
    code: "NOTIF-FIN-2051",
    category: "مالي",
    subCategory: "فواتير متأخرة",
    relatedEntityCode: "INV-5678",
    title: "فاتورة متأخرة السداد - مكتب الزهراء",
    description:
      "الفاتورة INV-5678 لمكتب الزهراء متأخرة السداد منذ 21 يوم بمبلغ 15,500 ر.س",
    severity: "high",
    timestamp: "2026-02-06 14:10",
    createdByRule: "مالية: فاتورة متأخرة أكثر من 14 يوم",
    isRead: false,
    assignedTo: "أحمد المالية",
    linkedScreen: {
      screenCode: "667",
      iconId: "transactions",
      tabId: "payments",
    },
    amount: 15500,
    daysOverdue: 21,
  },
  {
    id: "FIN-002",
    code: "NOTIF-FIN-2052",
    category: "مالي",
    subCategory: "فواتير قريبة الاستحقاق",
    relatedEntityCode: "INV-BATCH-15",
    title: "8 فواتير قريبة من الاستحقاق خلال 3 أيام",
    description:
      "8 فواتير بإجمالي 47,200 ر.س تستحق خلال 3 أيام - يُنصح بالمتابعة",
    severity: "medium",
    timestamp: "2026-02-06 11:30",
    createdByRule: "مالية: فواتير قريبة الاستحقاق (3 أيام)",
    isRead: false,
    assignedTo: null,
    linkedScreen: {
      screenCode: "667",
      iconId: "transactions",
      tabId: "financial",
    },
    amount: 47200,
  },
  {
    id: "FIN-003",
    code: "NOTIF-FIN-2053",
    category: "مالي",
    subCategory: "دفعات غير مربوطة",
    relatedEntityCode: "PMT-UNMATCHED-7",
    title: "7 دفعات واردة غير مربوطة",
    description:
      "7 دفعات بإجمالي 23,800 ر.س لم يتم ربطها بفواتير أو معاملات - تحتاج ربط يدوي",
    severity: "high",
    timestamp: "2026-02-06 10:15",
    createdByRule: "مالية: دفعات غير مربوطة أكثر من 3 أيام",
    isRead: false,
    assignedTo: "فاطمة المحاسبة",
    linkedScreen: {
      screenCode: "667",
      iconId: "transactions",
      tabId: "unmatched",
    },
    amount: 23800,
  },
  {
    id: "FIN-004",
    code: "NOTIF-FIN-2054",
    category: "مالي",
    subCategory: "تسويات جاهزة",
    relatedEntityCode: "SETT-READY-5",
    title: "5 تسويات جاهزة لم تُسلم للموظفين",
    description:
      "5 تسويات بإجمالي 18,500 ر.س جاهزة للتسليم ولكن لم يتم تسليمها بعد",
    severity: "medium",
    timestamp: "2026-02-06 09:45",
    createdByRule: "تسويات: جاهزة لأكثر من يومين",
    isRead: false,
    assignedTo: null,
    linkedScreen: {
      screenCode: "667",
      iconId: "reconciliation",
      tabId: "quick-settlements",
    },
    amount: 18500,
  },
  {
    id: "FIN-005",
    code: "NOTIF-FIN-2055",
    category: "مالي",
    subCategory: "تسويات بدون مرفق",
    relatedEntityCode: "SETT-NOATTACH-3",
    title: "3 تسويات تمت بدون مرفق تحويل",
    description:
      '3 تسويات بطريقة "تحويل بنكي" تمت بدون رفع إيصال التحويل - مطلوب رفع المرفقات',
    severity: "high",
    timestamp: "2026-02-06 08:30",
    createdByRule: "تسويات: تحويل بدون مرفق",
    isRead: false,
    assignedTo: "خالد المحاسب",
    linkedScreen: {
      screenCode: "667",
      iconId: "reconciliation",
      tabId: "attachments",
    },
    attachmentMissing: true,
  },
  {
    id: "FIN-006",
    code: "NOTIF-FIN-2056",
    category: "مالي",
    subCategory: "معاملات معتمدة بمتأخرات",
    relatedEntityCode: "TX-OVERDUE-4",
    title: "4 معاملات معتمدة بها متأخرات مالية",
    description:
      "4 معاملات معتمدة لكن بها متأخرات مالية لم تُحصّل بمبلغ إجمالي 12,300 ر.س - تحذير",
    severity: "high",
    timestamp: "2026-02-06 08:00",
    createdByRule: "معاملات: معتمدة بمتأخرات أكثر من أسبوع",
    isRead: false,
    assignedTo: "سارة المتابعة",
    linkedScreen: {
      screenCode: "667",
      iconId: "transactions",
      tabId: "financial",
    },
    amount: 12300,
  },
  {
    id: "FIN-007",
    code: "NOTIF-FIN-2057",
    category: "مالي",
    subCategory: "تسويات جاهزة",
    relatedEntityCode: "REMOTE-SETT-3",
    title: "3 تسويات عمل عن بعد جاهزة",
    description:
      "3 موظفين عن بعد لديهم تسويات جاهزة بإجمالي 18,500 ر.س - جاهزة للتسليم",
    severity: "medium",
    timestamp: "2026-02-06 07:15",
    createdByRule: "عمل عن بعد: تسويات جاهزة",
    isRead: true,
    assignedTo: null,
    linkedScreen: { screenCode: "667", iconId: "remote", tabId: "settlements" },
    amount: 18500,
  },
];

const regularNotifications = [
  {
    id: "N-001",
    code: "NOTIF-2045",
    category: "عاجل",
    relatedEntityCode: "TX-2043",
    title: "معاملة تجاوزت المدة المحددة",
    description:
      "المعاملة TX-2043 تجاوزت المدة المحددة بـ 5 أيام وتحتاج متابعة فورية",
    severity: "high",
    timestamp: "2026-02-06 14:25",
    createdByRule: "معاملات: معاملة متأخرة أكثر من 5 أيام",
    isRead: false,
    assignedTo: null,
  },
  {
    id: "N-003",
    code: "NOTIF-2047",
    category: "توثيق",
    relatedEntityCode: "942-DOC-123",
    title: "مستندات تنتظر التوثيق",
    description: "5 مستندات تم رفعها وتنتظر المراجعة والتوثيق",
    severity: "medium",
    timestamp: "2026-02-06 13:45",
    isRead: false,
    assignedTo: null,
  },
  {
    id: "N-004",
    code: "NOTIF-2048",
    category: "نظام",
    relatedEntityCode: "SYS-UPD-02",
    title: "تحديث النظام متاح",
    description: "يتوفر تحديث جديد للنظام يحتوي على إصلاحات وتحسينات",
    severity: "low",
    timestamp: "2026-02-06 12:00",
    isRead: true,
    assignedTo: null,
  },
];

const allNotifications = [...financialNotifications, ...regularNotifications];

// ==========================================
// 💡 المكون الرئيسي
// ==========================================
export default function NotificationsCenter() {
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [financialFilter, setFinancialFilter] = useState(null);

  // إحصائيات سريعة
  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const urgentCount = allNotifications.filter(
    (n) => n.severity === "high",
  ).length;
  const assignedCount = allNotifications.filter((n) => n.assignedTo).length;
  const financialCount = financialNotifications.length;
  const snoozedCount = 0; // Mock

  const selectedNotification = allNotifications.find(
    (n) => n.id === selectedNotif,
  );

  const filteredNotifications = financialFilter
    ? allNotifications.filter(
        (n) => n.subCategory && n.subCategory === financialFilter,
      )
    : allNotifications;

  const handleRowClick = (id) => {
    const notif = allNotifications.find((n) => n.id === id);
    setSelectedNotif(id);
    if (notif?.subCategory) {
      // إشعار مالي يفتح مودال كبير
      setShowDetailsModal(true);
    } else {
      // إشعار عادي يفتح درج جانبي
      setIsDrawerOpen(true);
    }
  };

  const handleGoToSource = (linkedScreen) => {
    if (linkedScreen) {
      alert(
        `سيتم فتح الشاشة ${linkedScreen.screenCode} - الأيقونة ${linkedScreen.iconId}${linkedScreen.tabId ? " - التاب " + linkedScreen.tabId : ""}`,
      );
    }
  };

  const financialSubCategories = [
    {
      id: "فواتير متأخرة",
      label: "فواتير متأخرة",
      icon: AlertCircle,
      color: "red",
      count: financialNotifications.filter(
        (n) => n.subCategory === "فواتير متأخرة",
      ).length,
    },
    {
      id: "فواتير قريبة الاستحقاق",
      label: "فواتير قريبة الاستحقاق",
      icon: Calendar,
      color: "amber",
      count: financialNotifications.filter(
        (n) => n.subCategory === "فواتير قريبة الاستحقاق",
      ).length,
    },
    {
      id: "دفعات غير مربوطة",
      label: "دفعات غير مربوطة",
      icon: FileX,
      color: "orange",
      count: financialNotifications.filter(
        (n) => n.subCategory === "دفعات غير مربوطة",
      ).length,
    },
    {
      id: "تسويات جاهزة",
      label: "تسويات جاهزة",
      icon: CheckCircle2,
      color: "green",
      count: financialNotifications.filter(
        (n) => n.subCategory === "تسويات جاهزة",
      ).length,
    },
    {
      id: "تسويات بدون مرفق",
      label: "تسويات بدون مرفق",
      icon: Paperclip,
      color: "purple",
      count: financialNotifications.filter(
        (n) => n.subCategory === "تسويات بدون مرفق",
      ).length,
    },
    {
      id: "معاملات معتمدة بمتأخرات",
      label: "معاملات معتمدة بمتأخرات",
      icon: AlertTriangle,
      color: "red",
      count: financialNotifications.filter(
        (n) => n.subCategory === "معاملات معتمدة بمتأخرات",
      ).length,
    },
  ];

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-h-screen font-[Tajawal]"
      dir="rtl"
    >
      {/* 1️⃣ بديل مضمن لـ ScreenHeader */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              مركز الإشعارات{" "}
              <span className="text-slate-400 text-sm font-mono ml-2">
                (090)
              </span>
            </h1>
            <p className="text-xs text-slate-500">
              إدارة ومتابعة جميع الإشعارات حسب الصلاحيات والأدوار
            </p>
          </div>
        </div>
        <button className="px-4 py-2 text-[11px] font-bold bg-green-600 text-white rounded-lg shadow-sm hover:bg-green-700 transition-colors flex items-center gap-2">
          <CheckCircle2 size={14} /> وضع علامة على الكل كمقروء
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
        {/* 2️⃣ KPI Chips */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <SimpleTooltip content="الإشعارات التي لم تُقرأ بعد">
              <div className="flex items-center gap-3 px-4 py-2 bg-blue-50/50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50 transition-colors min-w-[120px]">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-md">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-blue-600/80">
                    غير مقروءة
                  </div>
                  <div className="text-xl font-black text-blue-900 leading-tight">
                    {unreadCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات عالية الأولوية">
              <div className="flex items-center gap-3 px-4 py-2 bg-red-50/50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition-colors min-w-[120px]">
                <div className="p-2 bg-red-100 text-red-600 rounded-md">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-red-600/80">
                    عاجلة
                  </div>
                  <div className="text-xl font-black text-red-900 leading-tight">
                    {urgentCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات مسندة لك">
              <div className="flex items-center gap-3 px-4 py-2 bg-purple-50/50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-50 transition-colors min-w-[120px]">
                <div className="p-2 bg-purple-100 text-purple-600 rounded-md">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-purple-600/80">
                    مسندة لي
                  </div>
                  <div className="text-xl font-black text-purple-900 leading-tight">
                    {assignedCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات مالية من الحسابات والخزينة">
              <div className="flex items-center gap-3 px-4 py-2 bg-green-50 border-2 border-green-400 rounded-lg cursor-pointer hover:bg-green-100 transition-colors min-w-[120px]">
                <div className="p-2 bg-green-200 text-green-700 rounded-md">
                  <DollarSign className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-green-700">
                    إشعارات مالية
                  </div>
                  <div className="text-xl font-black text-green-900 leading-tight">
                    {financialCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات مؤجلة للمراجعة لاحقاً">
              <div className="flex items-center gap-3 px-4 py-2 bg-amber-50/50 border border-amber-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors min-w-[120px]">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-md">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-amber-600/80">
                    مؤجلة
                  </div>
                  <div className="text-xl font-black text-amber-900 leading-tight">
                    {snoozedCount}
                  </div>
                </div>
              </div>
            </SimpleTooltip>
          </div>
        </div>

        {/* 3️⃣ Financial Filters Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-[13px] font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            فلاتر سريعة - الإشعارات المالية
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFinancialFilter(null)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${
                financialFilter === null
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              }`}
            >
              <DollarSign className="w-3 h-3" />
              جميع المالية ({financialCount})
            </button>
            {financialSubCategories.map((cat) => {
              const Icon = cat.icon;
              const colorClasses = {
                red: {
                  bg: "bg-red-50",
                  border: "border-red-200",
                  text: "text-red-800",
                  hover: "hover:bg-red-100",
                  active: "bg-red-600 text-white shadow-md border-red-600",
                },
                amber: {
                  bg: "bg-amber-50",
                  border: "border-amber-200",
                  text: "text-amber-800",
                  hover: "hover:bg-amber-100",
                  active: "bg-amber-600 text-white shadow-md border-amber-600",
                },
                orange: {
                  bg: "bg-orange-50",
                  border: "border-orange-200",
                  text: "text-orange-800",
                  hover: "hover:bg-orange-100",
                  active:
                    "bg-orange-600 text-white shadow-md border-orange-600",
                },
                green: {
                  bg: "bg-green-50",
                  border: "border-green-200",
                  text: "text-green-800",
                  hover: "hover:bg-green-100",
                  active: "bg-green-600 text-white shadow-md border-green-600",
                },
                purple: {
                  bg: "bg-purple-50",
                  border: "border-purple-200",
                  text: "text-purple-800",
                  hover: "hover:bg-purple-100",
                  active:
                    "bg-purple-600 text-white shadow-md border-purple-600",
                },
              };
              const colors = colorClasses[cat.color];

              return (
                <button
                  key={cat.id}
                  onClick={() => setFinancialFilter(cat.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all border ${
                    financialFilter === cat.id
                      ? colors.active
                      : `${colors.bg} ${colors.border} ${colors.text} ${colors.hover}`
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 4️⃣ Filters & Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          {/* Advanced Filters (Inline replacement for SelectWithSearch & QuickDateRangePicker) */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-[11px] font-bold text-slate-600">
                  تصفية:
                </span>
                <select className="text-xs border border-slate-300 rounded bg-white px-2 py-1.5 outline-none focus:border-blue-500">
                  <option value="">جميع الفئات</option>
                  {categories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  className="text-xs border border-slate-300 rounded bg-white px-2 py-1.5 outline-none focus:border-blue-500"
                />
                <span className="text-slate-400 text-xs">إلى</span>
                <input
                  type="date"
                  className="text-xs border border-slate-300 rounded bg-white px-2 py-1.5 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="بحث سريع..."
                  className="text-xs border border-slate-300 rounded-full bg-white pr-7 pl-3 py-1.5 outline-none focus:border-blue-500 w-48"
                />
              </div>
            </div>
          </div>

          {/* Notifications Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-right">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold w-24">الكود</th>
                  <th className="px-4 py-3 font-bold w-28">الفئة</th>
                  <th className="px-4 py-3 font-bold">العنوان</th>
                  <th className="px-4 py-3 font-bold w-32">المرجع</th>
                  <th className="px-4 py-3 font-bold w-28">المبلغ</th>
                  <th className="px-4 py-3 font-bold w-16">أولوية</th>
                  <th className="px-4 py-3 font-bold w-32">التاريخ</th>
                  <th className="px-4 py-3 font-bold w-20">الحالة</th>
                  <th className="px-4 py-3 font-bold w-16 text-center">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotifications.map((notif) => {
                  const isFinancial = !!notif.subCategory;
                  return (
                    <tr
                      key={notif.id}
                      className={`hover:bg-slate-50 cursor-pointer transition-colors group ${
                        !notif.isRead ? "bg-blue-50/30" : ""
                      } ${isFinancial ? "border-r-4 border-r-green-500" : "border-r-4 border-r-transparent"}`}
                      onClick={() => handleRowClick(notif.id)}
                    >
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-500">
                        {notif.code.split("-").pop()}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                              notif.category === "عاجل"
                                ? "bg-red-50 border-red-200 text-red-700"
                                : notif.category === "مالي"
                                  ? "bg-green-50 border-green-200 text-green-700"
                                  : notif.category === "توثيق"
                                    ? "bg-purple-50 border-purple-200 text-purple-700"
                                    : "bg-slate-100 border-slate-200 text-slate-700"
                            }`}
                          >
                            {notif.category}
                          </span>
                          {isFinancial && (
                            <span className="text-[9px] text-emerald-600 font-bold whitespace-nowrap">
                              {notif.subCategory}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-slate-800 font-semibold">
                        {notif.title}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500">
                        {notif.relatedEntityCode}
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-emerald-600">
                        {isFinancial && notif.amount
                          ? `${notif.amount.toLocaleString()} ر.س`
                          : "-"}
                      </td>
                      <td className="px-4 py-2.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                            notif.severity === "high"
                              ? "bg-red-500"
                              : notif.severity === "medium"
                                ? "bg-amber-400"
                                : "bg-blue-400"
                          }`}
                          title={notif.severity}
                        />
                      </td>
                      <td className="px-4 py-2.5 font-mono text-slate-500">
                        {notif.timestamp}
                      </td>
                      <td className="px-4 py-2.5">
                        {notif.isRead ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />{" "}
                            مقروء
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                            جديد
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 5️⃣ المودال الخاص بالإشعارات المالية (Financial Modal) */}
      {/* ========================================== */}
      {showDetailsModal &&
        selectedNotification &&
        "subCategory" in selectedNotification && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 font-[Tajawal]"
              dir="rtl"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-4 flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">تفاصيل الإشعار المالي</h3>
                    <p className="text-xs text-emerald-100 font-mono mt-0.5">
                      {selectedNotification.code}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 custom-scrollbar">
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 text-[11px] font-bold bg-green-100 border border-green-300 text-green-800 rounded-full shadow-sm">
                    {selectedNotification.category}
                  </span>
                  <span className="px-3 py-1 text-[11px] font-bold bg-blue-100 border border-blue-300 text-blue-800 rounded-full shadow-sm">
                    {selectedNotification.subCategory}
                  </span>
                  <div
                    className={`px-3 py-1 text-[11px] font-bold rounded-full shadow-sm border flex items-center gap-1.5 ${
                      selectedNotification.severity === "high"
                        ? "bg-red-50 border-red-200 text-red-700"
                        : selectedNotification.severity === "medium"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    {selectedNotification.severity === "high"
                      ? "أولوية عالية (عاجل)"
                      : selectedNotification.severity === "medium"
                        ? "أولوية متوسطة"
                        : "أولوية منخفضة"}
                  </div>
                </div>

                {/* Title & Desc */}
                <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-4">
                  <h4 className="text-sm font-bold text-slate-800 mb-2">
                    {selectedNotification.title}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedNotification.description}
                  </p>
                </div>

                {/* Financial Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {selectedNotification.amount && (
                    <div className="col-span-2 bg-emerald-50 border border-emerald-200 rounded-xl p-4 shadow-sm flex flex-col justify-center relative overflow-hidden">
                      <DollarSign className="absolute -left-4 -bottom-4 w-24 h-24 text-emerald-500/10" />
                      <p className="text-[11px] font-bold text-emerald-800 mb-1">
                        إجمالي المبلغ المرتبط
                      </p>
                      <p className="text-2xl font-black text-emerald-700 font-mono">
                        {selectedNotification.amount.toLocaleString()}{" "}
                        <span className="text-sm font-bold">ر.س</span>
                      </p>
                    </div>
                  )}
                  {selectedNotification.daysOverdue && (
                    <div className="col-span-2 sm:col-span-1 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                      <p className="text-[11px] font-bold text-red-800 mb-1">
                        أيام التأخير
                      </p>
                      <p className="text-xl font-black text-red-700">
                        {selectedNotification.daysOverdue}{" "}
                        <span className="text-xs font-bold">يوم</span>
                      </p>
                    </div>
                  )}
                  <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-[11px] font-bold text-slate-500 mb-1">
                      المرجع
                    </p>
                    <p
                      className="text-sm font-bold text-slate-800 font-mono truncate"
                      title={selectedNotification.relatedEntityCode}
                    >
                      {selectedNotification.relatedEntityCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedNotification.createdByRule && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0">
                        <Settings className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-indigo-500 mb-0.5">
                          القاعدة المولدة للإشعار
                        </p>
                        <p className="text-xs font-bold text-indigo-900">
                          {selectedNotification.createdByRule}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedNotification.assignedTo && (
                    <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm flex items-start gap-3">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-purple-500 mb-0.5">
                          موكل إلى
                        </p>
                        <p className="text-xs font-bold text-purple-900">
                          {selectedNotification.assignedTo}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {selectedNotification.attachmentMissing && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 mb-1">
                        مرفق مفقود (إجراء مطلوب)
                      </p>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        العملية مسجلة כـ "تحويل بنكي" ولكن لم يتم إرفاق إيصال
                        التحويل. يرجى مراجعة المعاملة وإرفاق المستند المطلوب.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-slate-200 p-5 flex flex-wrap items-center justify-between bg-white z-10 gap-3">
                <div className="flex items-center gap-2">
                  {selectedNotification.linkedScreen && (
                    <button
                      onClick={() =>
                        handleGoToSource(selectedNotification.linkedScreen)
                      }
                      className="px-5 py-2.5 text-xs font-bold bg-emerald-600 text-white rounded-lg shadow-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                      الانتقال למصدر المعاملة
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-4 py-2.5 text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-200 transition-colors">
                    تأجيل التنبيه
                  </button>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-5 py-2.5 text-xs font-bold bg-slate-800 text-white rounded-lg shadow-sm hover:bg-slate-900 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* ========================================== */}
      {/* 6️⃣ الدرج الجانبي للإشعارات العادية (Regular Drawer) */}
      {/* ========================================== */}
      {isDrawerOpen &&
        selectedNotification &&
        !selectedNotification.subCategory && (
          <div
            className="fixed inset-0 z-50 flex justify-start bg-slate-900/40 backdrop-blur-sm animate-in fade-in"
            dir="rtl"
          >
            {/* خلفية للإغلاق عند الضغط خارجها */}
            <div className="absolute inset-0" onClick={closeDrawer}></div>

            {/* الحاوية الجانبية (Drawer) تخرج من اليمين (لأننا RTL) */}
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300 font-[Tajawal]">
              {/* Drawer Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    تفاصيل الإشعار
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {selectedNotification.code}
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body (Inline NotificationCard) */}
              <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  {/* Header of Card */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                    <span
                      className={`px-2.5 py-1 rounded border text-[10px] font-bold ${
                        selectedNotification.category === "عاجل"
                          ? "bg-red-50 border-red-200 text-red-700"
                          : selectedNotification.category === "توثيق"
                            ? "bg-purple-50 border-purple-200 text-purple-700"
                            : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}
                    >
                      {selectedNotification.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {selectedNotification.timestamp}
                    </div>
                  </div>

                  {/* Content of Card */}
                  <div className="mb-5">
                    <h4 className="text-sm font-bold text-slate-900 mb-2 leading-tight">
                      {selectedNotification.title}
                    </h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                      {selectedNotification.description}
                    </p>
                  </div>

                  {/* Meta details */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 mb-1">
                        المرجع / المعاملة
                      </p>
                      <p className="text-xs font-bold text-slate-700 font-mono">
                        {selectedNotification.relatedEntityCode}
                      </p>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                      <p className="text-[9px] font-bold text-slate-400 mb-1">
                        مستوى الأهمية
                      </p>
                      <p
                        className={`text-xs font-bold ${
                          selectedNotification.severity === "high"
                            ? "text-red-600"
                            : selectedNotification.severity === "medium"
                              ? "text-amber-600"
                              : "text-blue-600"
                        }`}
                      >
                        {selectedNotification.severity === "high"
                          ? "مرتفع"
                          : selectedNotification.severity === "medium"
                            ? "متوسط"
                            : "عادي"}
                      </p>
                    </div>
                  </div>

                  {selectedNotification.createdByRule && (
                    <div className="mb-4 text-[10px] text-slate-500 bg-slate-50 px-3 py-2 rounded border border-slate-100 flex items-center gap-1.5">
                      <Settings className="w-3 h-3" />
                      تم التوليد بناءً على:{" "}
                      <span className="font-bold">
                        {selectedNotification.createdByRule}
                      </span>
                    </div>
                  )}

                  {selectedNotification.assignedTo && (
                    <div className="mb-4 text-[10px] text-purple-700 bg-purple-50 px-3 py-2 rounded border border-purple-100 flex items-center gap-1.5">
                      <User className="w-3 h-3" />
                      موكل إلى:{" "}
                      <span className="font-bold">
                        {selectedNotification.assignedTo}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-200 bg-white grid grid-cols-2 gap-2 shrink-0">
                <button className="col-span-2 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> تحديد كمقروء
                </button>
                <button className="py-2 bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4" /> تأجيل
                </button>
                <button className="py-2 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-1.5">
                  <User className="w-4 h-4" /> إعادة إسناد
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
