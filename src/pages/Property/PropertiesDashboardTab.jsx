import React, { useMemo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale"; // (اختياري) إذا كنت تريد أن يظهر اسم الشهر بالعربي
import { useQuery } from "@tanstack/react-query";
import { getDeeds } from "../../api/propertyApi"; // تأكد من المسار
import {
  Building,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  FileText,
  Users,
  Link2,
  Grid3x3,
  FolderOpen,
  Plus,
  Shield,
  Receipt,
  Brain,
  FileSearch,
  BarChart3,
  ScrollText,
  Archive,
  History,
} from "lucide-react";

// --- دوال مساعدة ---
const getSafeClientName = (client) => {
  if (!client) return "غير محدد";
  const name = client.name;
  if (!name) return "غير محدد";
  if (typeof name === "string") return name;
  if (name.ar) return name.ar;
  if (typeof name === "object")
    return [
      name.firstName,
      name.fatherName,
      name.grandFatherName,
      name.familyName,
    ]
      .filter(Boolean)
      .join(" ");
  return "اسم غير معروف";
};

// دالة لتحديد ألوان الحالة
const getStatusStyles = (status) => {
  const st = status?.toLowerCase() || "";
  if (st === "active" || st === "مؤكد" || st === "معتمد") {
    return { bg: "bg-emerald-100 text-emerald-800", label: "مؤكد" };
  }
  if (st === "pending" || st === "قيد المراجعة") {
    return { bg: "bg-amber-100 text-amber-800", label: "قيد المراجعة" };
  }
  if (st === "disputed" || st === "متنازع") {
    return { bg: "bg-red-100 text-red-800", label: "متنازع" };
  }
  return { bg: "bg-slate-100 text-slate-800", label: status || "غير محدد" };
};

const PropertiesDashboardTab = ({ onNavigate, onOpenDetails }) => {
  // 1. جلب البيانات الحقيقية من الباك إند
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getDeeds(),
  });

  const properties = response?.data || [];

  // 2. تحليل البيانات واستخراج الإحصائيات (Dynamic Calculations)
  const stats = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let disputed = 0;
    let totalDocs = 0;
    let totalOwners = 0;

    // إحصائيات الأنواع
    const types = {
      land: 0,
      residential: 0,
      commercial: 0,
      agricultural: 0,
      industrial: 0,
      mixed: 0,
    };

    properties.forEach((p) => {
      // حساب الحالات
      const st = p.status?.toLowerCase() || "";
      if (st === "active" || st === "مؤكد") confirmed++;
      else if (st === "pending" || st === "قيد المراجعة") pending++;
      else if (st === "disputed" || st === "متنازع") disputed++;

      // جمع عدد الوثائق والملاك
      totalDocs += p.documents?.length || 0;
      totalOwners += p.owners?.length || 0;

      // حساب الأنواع (بناءً على أول قطعة، أو افتراضياً أرض)
      const pType = p.plots?.[0]?.propertyType || "أرض";
      if (pType.includes("سكني")) types.residential++;
      else if (pType.includes("تجاري")) types.commercial++;
      else if (pType.includes("زراعي")) types.agricultural++;
      else if (pType.includes("صناعي")) types.industrial++;
      else if (pType.includes("مختلط")) types.mixed++;
      else types.land++;
    });

    return { confirmed, pending, disputed, totalDocs, totalOwners, types };
  }, [properties]);

  // 3. ترتيب وجلب أحدث 6 ملكيات تمت إضافتها
  const recentProperties = useMemo(() => {
    const sorted = [...properties].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return sorted.slice(0, 6);
  }, [properties]);

  // =====================================
  // تجهيز مصفوفات العرض (UI Arrays)
  // =====================================
  const mainStats = [
    {
      title: "إجمالي الملكيات",
      value: properties.length,
      icon: Building,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      title: "مؤكدة",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      title: "قيد المراجعة",
      value: stats.pending,
      icon: Loader2,
      color: "text-amber-600",
      bg: "bg-amber-100",
    },
    {
      title: "متنازع عليها",
      value: stats.disputed,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-100",
    },
  ];

  const secondaryStats = [
    {
      title: "إجمالي الوثائق المرفقة",
      value: stats.totalDocs,
      icon: FileText,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "المُلّاك المسجلين",
      value: stats.totalOwners,
      icon: Users,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      title: "المعاملات المرتبطة",
      value: "0",
      icon: Link2,
      color: "text-pink-500",
      bg: "bg-pink-50",
    }, // يتطلب ربط بجدول المعاملات مستقبلاً
  ];

  const propertyTypes = [
    { label: "أرض", count: stats.types.land },
    { label: "سكني", count: stats.types.residential },
    { label: "تجاري", count: stats.types.commercial },
    { label: "زراعي", count: stats.types.agricultural },
    { label: "صناعي", count: stats.types.industrial },
    { label: "مختلط", count: stats.types.mixed },
  ];

  const quickAccessItems = [
    {
      id: "log",
      title: "دليل الملكيات",
      icon: FolderOpen,
      color: "text-sky-500",
      bg: "bg-sky-100",
    },
    {
      id: "new",
      title: "ملكية جديدة",
      icon: Plus,
      color: "text-emerald-500",
      bg: "bg-emerald-100",
    },
    {
      id: "docs",
      title: "الوثائق",
      icon: FileText,
      color: "text-indigo-500",
      bg: "bg-indigo-100",
    },
    {
      id: "verify",
      title: "التحقق والمراجعة",
      icon: Shield,
      color: "text-teal-500",
      bg: "bg-teal-100",
    },
    {
      id: "ai",
      title: "محلل وثائق AI",
      icon: Brain,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
    {
      id: "search",
      title: "البحث بوثيقة",
      icon: FileSearch,
      color: "text-fuchsia-500",
      bg: "bg-fuchsia-100",
    },
  ];

  // شاشة التحميل
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
        <p className="font-bold">جاري إعداد لوحة القيادة...</p>
      </div>
    );
  }

  // شاشة الخطأ
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertTriangle className="w-8 h-8 mb-2 text-red-500" />
        <p className="font-bold">حدث خطأ أثناء جلب إحصائيات الملكيات.</p>
      </div>
    );
  }

  return (
    <div
      className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-slate-50"
      dir="rtl"
    >
      <div className="max-w-7xl mx-auto">
        {/* ========================================= */}
        {/* الصف الأول: الإحصائيات الرئيسية (4 أعمدة) */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {mainStats.map((stat, idx) => (
            <button
              key={idx}
              onClick={() => onNavigate && onNavigate("log")} // تحويل للسجل عند الضغط
              className="rounded-xl bg-white p-5 text-right hover:shadow-lg transition-all cursor-pointer group border border-slate-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-500 mb-1 group-hover:text-slate-700 transition-colors">
                    {stat.title}
                  </div>
                  <div className={`text-3xl font-black ${stat.color}`}>
                    {stat.value}
                  </div>
                </div>
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-xl group-hover:scale-110 transition-transform ${stat.bg} ${stat.color}`}
                >
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* ========================================= */}
        {/* الصف الثاني: الإحصائيات الثانوية (3 أعمدة) */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {secondaryStats.map((stat, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-white p-4 flex items-center gap-4 border border-slate-200 shadow-sm"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-lg ${stat.bg} ${stat.color}`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-500">
                  {stat.title}
                </div>
                <div className={`text-xl font-black ${stat.color}`}>
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ========================================= */}
        {/* قسم: الوصول السريع */}
        {/* ========================================= */}
        <div className="rounded-xl bg-white p-5 mb-6 border border-slate-200 shadow-sm">
          <div className="text-sm mb-4 text-slate-800 font-black flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-blue-500" /> الوصول السريع
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {quickAccessItems.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate && onNavigate(item.id)} // يتم التوجيه بناءً على ה-ID
                className="flex flex-col items-center justify-center gap-2 rounded-xl p-4 transition-all hover:shadow-md group text-center border border-slate-200 bg-slate-50 hover:bg-white hover:border-blue-300"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-2xl transition-transform group-hover:scale-110 relative shadow-sm ${item.bg} ${item.color}`}
                >
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-slate-600 group-hover:text-blue-700 transition-colors mt-1">
                  {item.title}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========================================= */}
          {/* قسم: التوزيع حسب النوع */}
          {/* ========================================= */}
          <div className="lg:col-span-1 rounded-xl bg-white p-5 border border-slate-200 shadow-sm h-fit">
            <div className="text-sm mb-4 text-slate-800 font-black flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> توزيع العقارات
            </div>
            <div className="grid grid-cols-2 gap-3">
              {propertyTypes.map((type, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-3 text-center bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-colors"
                >
                  <div className="text-2xl font-black text-slate-700">
                    {type.count}
                  </div>
                  <div className="text-xs font-bold text-slate-500 mt-1">
                    {type.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ========================================= */}
          {/* قسم: آخر الملكيات المضافة */}
          {/* ========================================= */}
          <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" /> أحدث الملفات
                المضافة
              </span>
              <button
                onClick={() => onNavigate && onNavigate("log")}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                عرض السجل كاملاً
              </button>
            </div>

            <div className="flex flex-col divide-y divide-slate-100">
              {recentProperties.length > 0 ? (
                recentProperties.map((prop, idx) => {
                  const clientName = getSafeClientName(prop.client);
                  const statusInfo = getStatusStyles(prop.status);

                  return (
                    <button
                      key={prop.id}
                      onClick={() => onOpenDetails && onOpenDetails(prop.id)} // 👈 فتح التفاصيل عند النقر
                      className="w-full flex items-center gap-4 text-right transition-colors p-4 hover:bg-blue-50/50 group"
                    >
                      {/* الأيقونة */}
                      <div className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10 bg-blue-100 text-blue-600 group-hover:scale-105 transition-transform">
                        <Building className="w-5 h-5" />
                      </div>

                      {/* التفاصيل */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-mono font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200">
                            {prop.code}
                          </span>
                          <span className="text-sm font-black text-slate-700 truncate group-hover:text-blue-700 transition-colors">
                            {prop.plots?.[0]?.propertyType || "أرض"}{" "}
                            {prop.district ? `- ${prop.district}` : ""}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {prop.city || "---"} - {prop.district || "---"} |{" "}
                          <span className="text-slate-600 font-bold">
                            {clientName}
                          </span>
                        </div>
                      </div>

                      {/* الحالة */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span
                          className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border ${statusInfo.bg.replace("bg-", "border-").replace("100", "200")} ${statusInfo.bg}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {format(new Date(prop.createdAt), "dd MMMM yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-10 text-center text-slate-400">
                  <Building className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-bold">لا توجد ملكيات مضافة حتى الآن.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertiesDashboardTab;
