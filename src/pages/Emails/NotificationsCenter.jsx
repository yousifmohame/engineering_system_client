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
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

const SimpleTooltip = ({ children, content }) => {
  return (
    <div className="relative group inline-flex">
      {children}
      <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 hidden group-hover:block w-max max-w-xs px-2.5 py-1.5 bg-slate-800 text-white text-[10px] rounded shadow-lg z-50 pointer-events-none">
        {content}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
      </div>
    </div>
  );
};

const categories = [
  { code: "URG", label: "عاجل" },
  { code: "FIN", label: "مالي" },
  { code: "DOC", label: "توثيق" },
  { code: "SYS", label: "نظام" },
  { code: "TXN", label: "معاملات" },
];

export default function EmailNotificationsCenter() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // 👈 حالة خاصة لمعرفة هل الـ AI يحلل الآن

  const [selectedNotif, setSelectedNotif] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [financialFilter, setFinancialFilter] = useState(null);

  // 💡 1. دالة جلب الإشعارات المحفوظة مسبقاً (بدون AI)
  const fetchLocalNotifications = async () => {
    setIsLoading(true);
    try {
      // يمكنك لاحقاً إنشاء مسار GET /email/notifications يجلب الرسائل من قاعدة البيانات مباشرة بدون AI
      // هنا سنستخدم localStorage للمحاكاة وتوفير الـ API
      const cachedData = localStorage.getItem("aiAnalyzedEmails");
      if (cachedData) {
        setAllNotifications(JSON.parse(cachedData));
      } else {
        // إذا لم يكن هناك داتا سابقة، نقوم بالتحليل التلقائي كأول مرة فقط
        await fetchAIAnalyzedEmails();
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء جلب الإشعارات المحفوظة");
    } finally {
      setIsLoading(false);
    }
  };

  // 💡 2. دالة تشغيل الذكاء الاصطناعي (يتم استدعاؤها يدوياً أو مرة يومياً)
  const fetchAIAnalyzedEmails = async () => {
    setIsAnalyzing(true);
    try {
      const toastId = toast.loading(
        "جاري تحليل البريد الوارد باستخدام الذكاء الاصطناعي...",
      );

      const res = await api.get("/email/analyze-inbox");
      const analyzedData = res.data.data || [];

      setAllNotifications(analyzedData);

      // حفظ النتيجة ووقت التحليل محلياً
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

  // 💡 3. الـ useEffect يعمل عند فتح الشاشة
  useEffect(() => {
    const lastAnalysisDate = localStorage.getItem("lastAiAnalysisDate");

    // التحقق هل مر 24 ساعة على آخر تحليل؟
    const shouldRunDailyAnalysis = () => {
      if (!lastAnalysisDate) return true;
      const lastDate = new Date(lastAnalysisDate);
      const now = new Date();
      const diffHours = Math.abs(now - lastDate) / 36e5;
      return diffHours >= 24;
    };

    if (shouldRunDailyAnalysis()) {
      fetchAIAnalyzedEmails(); // تشغيل الـ AI إذا مر يوم
    } else {
      fetchLocalNotifications(); // غير ذلك، جلب الداتا القديمة المحفوظة لتوفير التكلفة
    }
  }, []);

  const closeDrawer = () => setIsDrawerOpen(false);

  // تصنيف الإشعارات المعروضة
  const financialNotifications = allNotifications.filter(
    (n) => n.category === "مالي",
  );
  const filteredNotifications = financialFilter
    ? allNotifications.filter(
        (n) => n.subCategory && n.subCategory === financialFilter,
      )
    : allNotifications;

  // إحصائيات سريعة
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

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden bg-slate-50 min-h-screen font-[Tajawal]"
      dir="rtl"
    >
      {/* 1️⃣ Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 text-blue-700 flex items-center justify-center rounded-lg">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">
              مركز الإشعارات الذكي (AI)
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              يتم فرز وتحليل الرسائل ذكياً لمرة واحدة يومياً لتوفير الموارد
              {localStorage.getItem("lastAiAnalysisDate") && (
                <span className="bg-slate-100 px-1.5 rounded border border-slate-200 font-mono text-[9px]">
                  آخر تحليل:{" "}
                  {new Date(
                    localStorage.getItem("lastAiAnalysisDate"),
                  ).toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 💡 4. زر التحديث اليدوي (يُشغّل الـ AI بالقوة عند ضغطه) */}
        <button
          onClick={fetchAIAnalyzedEmails}
          disabled={isAnalyzing}
          className="px-4 py-2 text-[11px] font-bold bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          <RefreshCw size={14} className={isAnalyzing ? "animate-spin" : ""} />{" "}
          {isAnalyzing ? "جاري التحليل المعمق..." : "تحديث وتحليل جديد الآن"}
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
          </div>
        </div>

        {/* 3️⃣ Financial Filters Section */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 shadow-sm">
          <h3 className="text-[13px] font-bold text-emerald-900 mb-3 flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> فلاتر سريعة - الإشعارات المالية
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFinancialFilter(null)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all ${financialFilter === null ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-emerald-200 text-emerald-800 hover:bg-emerald-100"}`}
            >
              <DollarSign className="w-3 h-3" /> جميع المالية ({financialCount})
            </button>
            {financialSubCategories.map((cat) => {
              const Icon = cat.icon;
              const activeClass =
                cat.color === "red"
                  ? "bg-red-600 text-white border-red-600"
                  : cat.color === "amber"
                    ? "bg-amber-600 text-white border-amber-600"
                    : cat.color === "orange"
                      ? "bg-orange-600 text-white border-orange-600"
                      : cat.color === "green"
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-purple-600 text-white border-purple-600";
              const bgClass =
                cat.color === "red"
                  ? "bg-red-50 border-red-200 text-red-800"
                  : cat.color === "amber"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : cat.color === "orange"
                      ? "bg-orange-50 border-orange-200 text-orange-800"
                      : cat.color === "green"
                        ? "bg-green-50 border-green-200 text-green-800"
                        : "bg-purple-50 border-purple-200 text-purple-800";

              return (
                <button
                  key={cat.id}
                  onClick={() => setFinancialFilter(cat.id)}
                  className={`px-3 py-1.5 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition-all border ${financialFilter === cat.id ? activeClass : bgClass}`}
                >
                  <Icon className="w-3 h-3" /> {cat.label} ({cat.count})
                </button>
              );
            })}
          </div>
        </div>

        {/* 4️⃣ Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl flex justify-end">
            <div className="relative">
              <Search className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="بحث سريع..."
                className="text-xs border border-slate-300 rounded-full bg-white pr-7 pl-3 py-1.5 outline-none focus:border-blue-500 w-48"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-right">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-bold">الكود / المرجع</th>
                  <th className="px-4 py-3 font-bold">التصنيف (AI)</th>
                  <th className="px-4 py-3 font-bold">الموضوع</th>
                  <th className="px-4 py-3 font-bold">المبلغ (AI)</th>
                  <th className="px-4 py-3 font-bold w-16">أولوية</th>
                  <th className="px-4 py-3 font-bold w-32">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading || isAnalyzing ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-slate-500 font-bold"
                    >
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-500 mx-auto mb-2" />
                      {isAnalyzing
                        ? "جاري تحليل رسائل البريد الجديدة باستخدام الذكاء الاصطناعي..."
                        : "جاري تحميل البيانات السابقة..."}
                    </td>
                  </tr>
                ) : filteredNotifications.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-10 text-slate-400 font-bold"
                    >
                      لا توجد إشعارات مطابقة
                    </td>
                  </tr>
                ) : (
                  filteredNotifications.map((notif) => {
                    const isFinancial = notif.category === "مالي";
                    return (
                      <tr
                        key={notif.id}
                        className={`hover:bg-slate-50 cursor-pointer transition-colors group ${!notif.isRead ? "bg-blue-50/30" : ""} ${isFinancial ? "border-r-4 border-r-green-500" : "border-r-4 border-r-transparent"}`}
                        onClick={() => handleRowClick(notif.id)}
                      >
                        <td className="px-4 py-2.5 font-mono font-bold text-slate-500">
                          {notif.relatedEntityCode || notif.code}
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${notif.category === "عاجل" ? "bg-red-50 border-red-200 text-red-700" : notif.category === "مالي" ? "bg-green-50 border-green-200 text-green-700" : notif.category === "توثيق" ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-slate-100 border-slate-200 text-slate-700"}`}
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
                        <td className="px-4 py-2.5 text-slate-800 font-semibold max-w-xs truncate">
                          {notif.title}
                        </td>
                        <td className="px-4 py-2.5 font-mono font-bold text-emerald-600">
                          {isFinancial && notif.amount
                            ? `${notif.amount.toLocaleString()} ر.س`
                            : "-"}
                        </td>
                        <td className="px-4 py-2.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shadow-sm ${notif.severity === "high" ? "bg-red-500" : notif.severity === "medium" ? "bg-amber-400" : "bg-blue-400"}`}
                            title={notif.severity}
                          />
                        </td>
                        <td className="px-4 py-2.5 font-mono text-slate-500">
                          {new Date(notif.timestamp).toLocaleDateString(
                            "ar-SA",
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5️⃣ Modal المالي */}
      {showDetailsModal &&
        selectedNotification &&
        selectedNotification.category === "مالي" && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col animate-in zoom-in-95"
              dir="rtl"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-5 py-4 flex justify-between">
                <div>
                  <h3 className="font-bold">تحليل الإشعار المالي (AI)</h3>
                  <p className="text-xs opacity-80">
                    {selectedNotification.relatedEntityCode}
                  </p>
                </div>
                <button onClick={() => setShowDetailsModal(false)}>
                  <X />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-700 whitespace-pre-wrap">
                  {selectedNotification.description}
                </div>
                {selectedNotification.amount && (
                  <div className="bg-emerald-50 border-emerald-200 border p-4 rounded-lg text-center">
                    <p className="text-xs text-emerald-800 font-bold mb-1">
                      المبلغ المكتشف
                    </p>
                    <p className="text-3xl font-black text-emerald-600">
                      {selectedNotification.amount} ر.س
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* 6️⃣ Drawer العادي */}
      {isDrawerOpen &&
        selectedNotification &&
        selectedNotification.category !== "مالي" && (
          <div
            className="fixed inset-0 z-50 flex justify-start bg-slate-900/40 backdrop-blur-sm"
            dir="rtl"
          >
            <div className="absolute inset-0" onClick={closeDrawer}></div>
            <div className="relative w-full max-w-md h-full bg-white shadow-2xl border-l flex flex-col animate-in slide-in-from-right">
              <div className="px-5 py-4 border-b flex justify-between bg-slate-50">
                <h3 className="font-bold">تفاصيل الإشعار</h3>
                <button onClick={closeDrawer}>
                  <X />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <h4 className="font-bold text-lg mb-4 text-blue-600">
                  {selectedNotification.title}
                </h4>
                <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 whitespace-pre-wrap leading-loose border">
                  {selectedNotification.description}
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
