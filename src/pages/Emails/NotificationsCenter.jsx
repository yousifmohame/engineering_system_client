import React, { useState, useEffect } from "react";
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
  Settings,
  RefreshCw,
  Sparkles,
  Bot,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

const SimpleTooltip = ({ children, content }) => {
  return (
    <div className="relative group inline-flex">
      {children}

      <div
        className="
          pointer-events-none absolute top-full left-1/2 z-50 mt-2 hidden
          w-max max-w-xs -translate-x-1/2 rounded-xl
          bg-[#06111d] px-3 py-2 text-[10px] font-bold
          text-white shadow-xl group-hover:block
        "
      >
        {content}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#06111d]" />
      </div>
    </div>
  );
};

export default function EmailNotificationsCenter() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [financialFilter, setFinancialFilter] = useState(null);
  const [tableSearch, setTableSearch] = useState("");

  const fetchLocalNotifications = async () => {
    setIsLoading(true);

    try {
      const cachedData = localStorage.getItem("aiAnalyzedEmails");

      if (cachedData) {
        setAllNotifications(JSON.parse(cachedData));
      } else {
        await fetchAIAnalyzedEmails();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب الإشعارات المحفوظة");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAIAnalyzedEmails = async () => {
    setIsAnalyzing(true);

    try {
      const toastId = toast.loading(
        "جاري تحليل البريد الوارد باستخدام الذكاء الاصطناعي...",
      );

      const res = await api.get("/email/analyze-inbox");
      const analyzedData = res.data.data || [];

      setAllNotifications(analyzedData);

      localStorage.setItem("aiAnalyzedEmails", JSON.stringify(analyzedData));
      localStorage.setItem("lastAiAnalysisDate", new Date().toISOString());

      toast.success("تم جلب وتحليل الإشعارات بنجاح", { id: toastId });
    } catch (error) {
      toast.error("حدث خطأ أثناء تحليل الإشعارات الذكي");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    const lastAnalysisDate = localStorage.getItem("lastAiAnalysisDate");

    const shouldRunDailyAnalysis = () => {
      if (!lastAnalysisDate) return true;

      const lastDate = new Date(lastAnalysisDate);
      const now = new Date();
      const diffHours = Math.abs(now - lastDate) / 36e5;

      return diffHours >= 24;
    };

    if (shouldRunDailyAnalysis()) {
      fetchAIAnalyzedEmails();
    } else {
      fetchLocalNotifications();
    }
  }, []);

  const closeDrawer = () => setIsDrawerOpen(false);

  const financialNotifications = allNotifications.filter(
    (n) => n.category === "مالي",
  );

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const urgentCount = allNotifications.filter(
    (n) => n.severity === "high",
  ).length;
  const assignedCount = allNotifications.filter((n) => n.assignedTo).length;
  const financialCount = financialNotifications.length;

  const selectedNotification = allNotifications.find(
    (n) => n.id === selectedNotif,
  );

  const handleRowClick = (id) => {
    const notif = allNotifications.find((n) => n.id === id);

    setSelectedNotif(id);

    if (notif?.category === "مالي") {
      setShowDetailsModal(true);
    } else {
      setIsDrawerOpen(true);
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

  const filteredNotifications = allNotifications.filter((n) => {
    if (financialFilter && n.subCategory !== financialFilter) return false;

    if (tableSearch.trim()) {
      const q = tableSearch.trim().toLowerCase();

      const text = `
        ${n.relatedEntityCode || ""}
        ${n.code || ""}
        ${n.category || ""}
        ${n.subCategory || ""}
        ${n.title || ""}
        ${n.description || ""}
        ${n.amount || ""}
      `.toLowerCase();

      if (!text.includes(q)) return false;
    }

    return true;
  });

  const lastAnalysisDate = localStorage.getItem("lastAiAnalysisDate");

  return (
    <div
      className="
        flex min-h-screen flex-1 flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative shrink-0 overflow-hidden
          border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white
          shadow-[0_14px_34px_rgba(18,63,89,0.16)]
          md:px-8 md:py-5
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Bell className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black md:text-xl">
                مركز الإشعارات الذكي
              </h1>

              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs font-bold text-white/65">
                <span>فرز وتحليل رسائل البريد بالذكاء الاصطناعي مرة واحدة يومياً</span>

                {lastAnalysisDate && (
                  <span
                    className="
                      rounded-full border border-white/15
                      bg-white/10 px-2 py-0.5
                      font-mono text-[10px] text-[#e2bf74]
                    "
                  >
                    آخر تحليل:{" "}
                    {new Date(lastAnalysisDate).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={fetchAIAnalyzedEmails}
            disabled={isAnalyzing}
            className="
              flex h-11 shrink-0 items-center justify-center gap-2
              rounded-2xl bg-[#e2bf74] px-5
              text-sm font-black text-[#082032]
              shadow-[0_12px_28px_rgba(226,191,116,0.25)]
              transition-all hover:-translate-y-[1px]
              hover:bg-[#f5d99b]
              disabled:cursor-not-allowed disabled:opacity-70
            "
            type="button"
          >
            <RefreshCw className={`h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`} />
            {isAnalyzing ? "جاري التحليل المعمق..." : "تحديث وتحليل جديد الآن"}
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
        <div className="mx-auto max-w-7xl space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SimpleTooltip content="الإشعارات التي لم تُقرأ بعد">
              <KpiCard
                icon={Bell}
                label="غير مقروءة"
                value={unreadCount}
                tone="cyan"
              />
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات عالية الأولوية">
              <KpiCard
                icon={AlertTriangle}
                label="عاجلة"
                value={urgentCount}
                tone="rose"
              />
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات مسندة لك">
              <KpiCard
                icon={User}
                label="مسندة لي"
                value={assignedCount}
                tone="purple"
              />
            </SimpleTooltip>

            <SimpleTooltip content="إشعارات مالية من الحسابات والخزينة">
              <KpiCard
                icon={DollarSign}
                label="إشعارات مالية"
                value={financialCount}
                tone="emerald"
                highlighted
              />
            </SimpleTooltip>
          </div>

          {/* Financial Filters */}
          <div
            className="
              overflow-hidden rounded-[26px]
              border border-emerald-200 bg-white/90
              shadow-[0_16px_40px_rgba(18,63,89,0.08)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex flex-col gap-3 border-b border-emerald-100
                bg-gradient-to-l from-emerald-50 via-white to-[#fbf8f1]
                px-5 py-4 md:flex-row md:items-center md:justify-between
              "
            >
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                </span>

                <div>
                  <h3 className="text-sm font-black text-[#123f59]">
                    فلاتر سريعة - الإشعارات المالية
                  </h3>
                  <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                    اختر نوع الإشعار المالي لعرض النتائج المطابقة.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFinancialFilter(null)}
                className={`
                  flex h-9 items-center justify-center gap-1.5
                  rounded-2xl border px-4 text-[11px] font-black transition-all
                  ${
                    financialFilter === null
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-md"
                      : "border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-50"
                  }
                `}
                type="button"
              >
                <DollarSign className="h-3.5 w-3.5" />
                جميع المالية ({financialCount})
              </button>
            </div>

            <div className="flex flex-wrap gap-2 p-4">
              {financialSubCategories.map((cat) => {
                const Icon = cat.icon;
                const isActive = financialFilter === cat.id;

                return (
                  <button
                    key={cat.id}
                    onClick={() => setFinancialFilter(cat.id)}
                    className={`
                      flex items-center gap-1.5 rounded-2xl border
                      px-3 py-2 text-[11px] font-black
                      transition-all hover:-translate-y-[1px]
                      ${
                        isActive
                          ? getActiveFilterClass(cat.color)
                          : getFilterClass(cat.color)
                      }
                    `}
                    type="button"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                    <span className="rounded-full bg-white/55 px-1.5 py-0.5 font-mono text-[10px]">
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table Card */}
          <div
            className="
              overflow-hidden rounded-[26px]
              border border-[#d8b46a]/30 bg-white/90
              shadow-[0_16px_40px_rgba(18,63,89,0.08)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex flex-col gap-3 border-b border-[#e8ddc8]
                bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
                px-5 py-4 md:flex-row md:items-center md:justify-between
              "
            >
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                  <Bot className="h-5 w-5" />
                </span>

                <div>
                  <h3 className="text-sm font-black text-[#123f59]">
                    نتائج تحليل الإشعارات
                  </h3>
                  <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                    {filteredNotifications.length} نتيجة معروضة من أصل{" "}
                    {allNotifications.length}
                  </p>
                </div>
              </div>

              <div className="relative w-full md:w-64">
                <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

                <input
                  type="text"
                  placeholder="بحث سريع..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="
                    h-10 w-full rounded-2xl border border-[#d8b46a]/30
                    bg-white pr-10 pl-3 text-xs font-bold text-[#123f59]
                    outline-none transition-all
                    placeholder:text-slate-400
                    focus:border-[#c5983c]/70
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[880px] text-right text-[11px]">
                <thead className="bg-[#123f59] text-white">
                  <tr>
                    <TableHead>الكود / المرجع</TableHead>
                    <TableHead>التصنيف AI</TableHead>
                    <TableHead>الموضوع</TableHead>
                    <TableHead>المبلغ AI</TableHead>
                    <TableHead className="w-20 text-center">الأولوية</TableHead>
                    <TableHead className="w-32">التاريخ</TableHead>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e8ddc8]">
                  {isLoading || isAnalyzing ? (
                    <tr>
                      <td colSpan="6" className="py-14 text-center">
                        <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin text-[#c5983c]" />
                        <p className="font-black text-[#123f59]">
                          {isAnalyzing
                            ? "جاري تحليل رسائل البريد الجديدة باستخدام الذكاء الاصطناعي..."
                            : "جاري تحميل البيانات السابقة..."}
                        </p>
                      </td>
                    </tr>
                  ) : filteredNotifications.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-14 text-center">
                        <FileText className="mx-auto mb-3 h-9 w-9 text-[#c5983c]/55" />
                        <p className="font-black text-[#64748b]">
                          لا توجد إشعارات مطابقة
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const isFinancial = notif.category === "مالي";

                      return (
                        <tr
                          key={notif.id}
                          className={`
                            group cursor-pointer border-r-4 transition-colors
                            hover:bg-[#fbf8f1]
                            ${!notif.isRead ? "bg-cyan-50/30" : "bg-white"}
                            ${
                              isFinancial
                                ? "border-r-emerald-500"
                                : "border-r-transparent"
                            }
                          `}
                          onClick={() => handleRowClick(notif.id)}
                        >
                          <TableCell className="font-mono font-black text-[#64748b]">
                            {notif.relatedEntityCode || notif.code || "—"}
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              <CategoryBadge category={notif.category} />

                              {isFinancial && (
                                <span className="text-[9px] font-black text-emerald-600">
                                  {notif.subCategory}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="max-w-xs truncate font-bold text-[#123f59]">
                            {notif.title}
                          </TableCell>

                          <TableCell className="font-mono font-black text-emerald-600">
                            {isFinancial && notif.amount
                              ? `${notif.amount.toLocaleString()} ر.س`
                              : "-"}
                          </TableCell>

                          <TableCell className="text-center">
                            <SeverityDot severity={notif.severity} />
                          </TableCell>

                          <TableCell className="font-mono text-[#64748b]">
                            {notif.timestamp
                              ? new Date(notif.timestamp).toLocaleDateString(
                                  "ar-SA",
                                )
                              : "—"}
                          </TableCell>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Modal */}
      {showDetailsModal &&
        selectedNotification &&
        selectedNotification.category === "مالي" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06111d]/70 p-4 backdrop-blur-md animate-in fade-in">
            <div
              className="
                w-full max-w-2xl overflow-hidden rounded-[28px]
                border border-emerald-200 bg-white
                shadow-[0_30px_90px_rgba(0,0,0,0.35)]
                animate-in zoom-in-95
              "
              dir="rtl"
            >
              <div
                className="
                  flex items-center justify-between gap-3
                  bg-gradient-to-l from-emerald-700 via-emerald-600 to-teal-700
                  px-5 py-4 text-white
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/14 text-emerald-100">
                    <DollarSign className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate font-black">
                      تحليل الإشعار المالي AI
                    </h3>
                    <p className="mt-0.5 font-mono text-xs text-white/70">
                      {selectedNotification.relatedEntityCode || "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="
                    flex min-w-[54px] flex-col items-center justify-center gap-0.5
                    rounded-xl border border-white/15 bg-white/10
                    px-2 py-1 text-[8px] font-black leading-none text-white
                    transition hover:bg-red-500/30
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                  إغلاق
                </button>
              </div>

              <div className="space-y-4 p-6">
                <div className="rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1] p-4 text-sm font-bold leading-7 text-[#334155] whitespace-pre-wrap">
                  {selectedNotification.description}
                </div>

                {selectedNotification.amount && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                    <p className="mb-1 text-xs font-black text-emerald-800">
                      المبلغ المكتشف
                    </p>
                    <p className="font-mono text-3xl font-black text-emerald-600">
                      {selectedNotification.amount.toLocaleString()} ر.س
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* Normal Drawer */}
      {isDrawerOpen &&
        selectedNotification &&
        selectedNotification.category !== "مالي" && (
          <div
            className="fixed inset-0 z-50 flex justify-start bg-[#06111d]/55 backdrop-blur-md"
            dir="rtl"
          >
            <div className="absolute inset-0" onClick={closeDrawer} />

            <div
              className="
                relative flex h-full w-full max-w-md flex-col
                border-l border-[#d8b46a]/30 bg-white
                shadow-[0_30px_90px_rgba(0,0,0,0.35)]
                animate-in slide-in-from-right
              "
            >
              <div
                className="
                  flex items-center justify-between gap-3
                  bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                  px-5 py-4 text-white
                "
              >
                <h3 className="font-black">تفاصيل الإشعار</h3>

                <button
                  onClick={closeDrawer}
                  className="
                    flex min-w-[54px] flex-col items-center justify-center gap-0.5
                    rounded-xl border border-white/15 bg-white/10
                    px-2 py-1 text-[8px] font-black leading-none text-white
                    transition hover:bg-red-500/30
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                  إغلاق
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-6 custom-scrollbar">
                <h4 className="mb-4 text-lg font-black text-[#123f59]">
                  {selectedNotification.title}
                </h4>

                <div className="rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1] p-4 text-sm font-bold leading-8 text-[#334155] whitespace-pre-wrap">
                  {selectedNotification.description}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

const KpiCard = ({ icon: Icon, label, value, tone, highlighted }) => {
  const tones = {
    cyan: {
      border: "border-cyan-200",
      bg: "from-cyan-50 via-white to-[#fbf8f1]",
      icon: "bg-cyan-100 text-cyan-800",
      text: "text-cyan-900",
    },
    rose: {
      border: "border-rose-200",
      bg: "from-rose-50 via-white to-[#fbf8f1]",
      icon: "bg-rose-100 text-rose-600",
      text: "text-rose-900",
    },
    purple: {
      border: "border-purple-200",
      bg: "from-purple-50 via-white to-[#fbf8f1]",
      icon: "bg-purple-100 text-purple-700",
      text: "text-purple-900",
    },
    emerald: {
      border: "border-emerald-300",
      bg: "from-emerald-50 via-white to-[#fbf8f1]",
      icon: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-900",
    },
  };

  const t = tones[tone] || tones.cyan;

  return (
    <div
      className={`
        flex items-center gap-3 rounded-[22px]
        border ${t.border}
        bg-gradient-to-br ${t.bg}
        p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
        transition hover:-translate-y-[1px]
        ${highlighted ? "ring-2 ring-emerald-300/35" : ""}
      `}
    >
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${t.icon}`}>
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <div className={`text-[11px] font-black ${t.text}`}>{label}</div>
        <div className={`font-mono text-2xl font-black leading-tight ${t.text}`}>
          {value}
        </div>
      </div>
    </div>
  );
};

const TableHead = ({ children, className = "" }) => (
  <th
    className={`
      border-l border-white/10 px-4 py-3
      text-[11px] font-black text-white/90
      ${className}
    `}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = "" }) => (
  <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>
);

const CategoryBadge = ({ category }) => {
  const classes =
    category === "عاجل"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : category === "مالي"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : category === "توثيق"
          ? "border-purple-200 bg-purple-50 text-purple-700"
          : "border-slate-200 bg-slate-100 text-slate-700";

  return (
    <span
      className={`
        rounded-full border px-2 py-0.5
        text-[9px] font-black
        ${classes}
      `}
    >
      {category || "غير مصنف"}
    </span>
  );
};

const SeverityDot = ({ severity }) => {
  const classes =
    severity === "high"
      ? "bg-rose-500 shadow-[0_0_0_5px_rgba(244,63,94,0.12)]"
      : severity === "medium"
        ? "bg-amber-400 shadow-[0_0_0_5px_rgba(251,191,36,0.12)]"
        : "bg-cyan-400 shadow-[0_0_0_5px_rgba(34,211,238,0.12)]";

  return (
    <span
      className={`mx-auto block h-3 w-3 rounded-full ${classes}`}
      title={severity}
    />
  );
};

const getFilterClass = (color) => {
  const classes = {
    red: "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
    amber: "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
    orange: "border-orange-200 bg-orange-50 text-orange-800 hover:bg-orange-100",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100",
    purple: "border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100",
  };

  return classes[color] || classes.green;
};

const getActiveFilterClass = (color) => {
  const classes = {
    red: "border-rose-600 bg-rose-600 text-white shadow-md",
    amber: "border-amber-600 bg-amber-600 text-white shadow-md",
    orange: "border-orange-600 bg-orange-600 text-white shadow-md",
    green: "border-emerald-600 bg-emerald-600 text-white shadow-md",
    purple: "border-purple-600 bg-purple-600 text-white shadow-md",
  };

  return classes[color] || classes.green;
};
