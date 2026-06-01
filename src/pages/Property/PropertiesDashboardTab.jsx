import React, { useMemo } from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getDeeds } from "../../api/propertyApi";
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
  ChevronLeft,
  MapPin,
  User
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

const getStatusStyles = (status) => {
  const st = status?.toLowerCase() || "";
  if (st === "active" || st === "مؤكد" || st === "معتمد") {
    return {
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      label: "مؤكد",
    };
  }
  if (st === "pending" || st === "قيد المراجعة") {
    return {
      bg: "bg-amber-50 text-amber-700 border-amber-200",
      label: "قيد المراجعة",
    };
  }
  if (st === "disputed" || st === "متنازع") {
    return { bg: "bg-red-50 text-red-700 border-red-200", label: "متنازع" };
  }
  return {
    bg: "bg-[#f7fbfd] text-[#123B5D] border-[#d8e6ee]",
    label: status || "غير محدد",
  };
};

const PropertiesDashboardTab = ({ onNavigate, onOpenDetails }) => {
  // 1. جلب البيانات
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getDeeds(),
  });

  const properties = response?.data || [];

  // 2. تحليل البيانات واستخراج الإحصائيات
  const stats = useMemo(() => {
    let confirmed = 0;
    let pending = 0;
    let disputed = 0;
    let totalDocs = 0;
    let totalOwners = 0;

    const types = {
      land: 0,
      residential: 0,
      commercial: 0,
      agricultural: 0,
      industrial: 0,
      mixed: 0,
    };

    properties.forEach((p) => {
      const st = p.status?.toLowerCase() || "";
      if (st === "active" || st === "مؤكد") confirmed++;
      else if (st === "pending" || st === "قيد المراجعة") pending++;
      else if (st === "disputed" || st === "متنازع") disputed++;

      totalDocs += p.documents?.length || 0;
      totalOwners += p.owners?.length || 0;

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

  // 3. ترتيب أحدث الملكيات
  const recentProperties = useMemo(() => {
    const sorted = [...properties].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
    return sorted.slice(0, 5); // تقليل العدد الظاهر لتقليص المساحة
  }, [properties]);

  // =====================================
  // مصفوفات العرض (مكثفة)
  // =====================================
  const compactStats = [
    {
      title: "الإجمالي",
      value: properties.length,
      icon: Building,
      color: "text-[#0f6d7c]",
      bg: "bg-blue-50 border-blue-100",
    },
    {
      title: "مؤكدة",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      title: "قيد المراجعة",
      value: stats.pending,
      icon: Loader2,
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-100",
    },
    {
      title: "متنازع عليها",
      value: stats.disputed,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 border-red-100",
    },
    {
      title: "وثائق",
      value: stats.totalDocs,
      icon: FileText,
      color: "text-[#0f6d7c]",
      bg: "bg-purple-50 border-purple-100",
    },
    {
      title: "مُلّاك",
      value: stats.totalOwners,
      icon: Users,
      color: "text-sky-600",
      bg: "bg-sky-50 border-sky-100",
    },
  ];

  const quickAccessItems = [
    {
      id: "log",
      title: "السجل",
      icon: FolderOpen,
      color: "text-[#0f6d7c]",
      bg: "bg-blue-50",
    },
    {
      id: "new",
      title: "جديد",
      icon: Plus,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      id: "verify",
      title: "مراجعة",
      icon: Shield,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      id: "ai",
      title: "AI محلل",
      icon: Brain,
      color: "text-[#0f6d7c]",
      bg: "bg-purple-50",
    },
    {
      id: "search",
      title: "بحث",
      icon: FileSearch,
      color: "text-rose-600",
      bg: "bg-rose-50",
    },
  ];

  const propertyTypes = [
    { label: "أرض", count: stats.types.land },
    { label: "سكني", count: stats.types.residential },
    { label: "تجاري", count: stats.types.commercial },
    { label: "زراعي", count: stats.types.agricultural },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#71839a]">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-emerald-500" />
        <p className="font-bold text-sm">جاري إعداد لوحة القيادة...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-400">
        <AlertTriangle className="w-8 h-8 mb-2 text-red-500" />
        <p className="font-bold text-sm">
          حدث خطأ أثناء جلب إحصائيات الملكيات.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#eef5f7]" dir="rtl">
      <div className="shrink-0 p-4 pb-2">
        <div className="prop-page-header flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 prop-gold-icon shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
              <h1 className="whitespace-nowrap">لوحة الملكيات والصكوك</h1>
              <p className="whitespace-nowrap">متابعة الصكوك والعقارات والوثائق المرتبطة بها</p>
            </div>
          </div>
        </div>
      </div>
      {/* 💡 الجزء العلوي المكثف (الإحصائيات والروابط) لا يخضع للاسكرول الأساسي */}
      <div className="shrink-0 px-4 pb-2 bg-transparent z-10">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* ========================================= */}
          {/* الإحصائيات (صف واحد مكثف) */}
          {/* ========================================= */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {compactStats.map((stat, idx) => (
              <button
                key={idx}
                onClick={() => onNavigate && onNavigate("log")}
                className={`min-h-[54px] rounded-[16px] px-2.5 py-2 flex items-center justify-between border transition-all hover:shadow-md cursor-pointer group bg-white border-[#d8e6ee]`}
              >
                <div>
                  <div className="text-[9px] font-bold text-[#71839a] mb-0.5 group-hover:text-[#123B5D] leading-tight">
                    {stat.title}
                  </div>
                  <div
                    className="text-[17px] font-black text-[#123B5D] leading-none"
                  >
                    {stat.value}
                  </div>
                </div>
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-xl bg-[#f7fbfd] text-[#0f6d7c] border border-[#d8e6ee] shadow-sm group-hover:scale-110 transition-transform"
                >
                  <stat.icon className="w-3 h-3" />
                </div>
              </button>
            ))}
          </div>

          {/* ========================================= */}
          {/* الوصول السريع (أزرار أفقية صغيرة) */}
          {/* ========================================= */}
          <div className="w-full flex items-center gap-2 bg-white border border-[#d8e6ee] p-1.5 rounded-[16px] shadow-sm">
            <div className="text-[9px] text-[#71839a] font-black px-2 flex items-center gap-1 border-l border-[#d8e6ee] whitespace-nowrap">
              <Grid3x3 className="w-3 h-3" /> سريع
            </div>
            <div className="flex flex-1 justify-between gap-1">
              {quickAccessItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => onNavigate && onNavigate(item.id)}
                  className="flex-1 flex flex-row items-center justify-center gap-1.5 px-2 py-1.5 min-h-[38px] rounded-xl hover:bg-white border border-transparent hover:border-[#d8e6ee] hover:shadow-sm transition-all group"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-3 h-3" />
                  </div>
                  <span className="text-[9px] font-bold text-[#52677e] group-hover:text-[#123B5D]">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 💡 الجزء السفلي القابل للاسكرول (المحتوى الرئيسي) */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========================================= */}
          {/* قسم: التوزيع حسب النوع */}
          {/* ========================================= */}
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="rounded-[24px] bg-white p-5 border border-[#d8e6ee] shadow-sm flex-1">
              <div className="text-sm mb-4 text-[#123B5D] font-black flex items-center justify-between border-b border-[#e7eef2] pb-2">
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> توزيع
                  العقارات
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {propertyTypes.map((type, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl p-3 text-center bg-[#f7fbfd] border border-[#d8e6ee] hover:bg-emerald-50 hover:border-emerald-200 transition-colors flex flex-col items-center justify-center gap-1"
                  >
                    <div className="text-xl font-black text-[#123B5D] leading-none">
                      {type.count}
                    </div>
                    <div className="text-[10px] font-bold text-[#71839a]">
                      {type.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* بطاقة إعلانية أو تنبيه إضافي لموازنة التصميم */}
            <div className="rounded-[24px] bg-gradient-to-l from-[#071927] to-[#0f6d7c] p-5 shadow-sm text-white flex flex-col items-center justify-center text-center border border-[#d9b85b]/30">
              <Shield className="w-8 h-8 mb-2 text-blue-200 opacity-80" />
              <h4 className="text-sm font-black mb-1">أرشفة آمنة</h4>
              <p className="text-[10px] text-blue-100 font-medium">
                جميع الوثائق والملكيات مشفرة ومحفوظة ضمن خوادم النظام بصلاحيات
                وصول مقيدة.
              </p>
            </div>
          </div>

          {/* ========================================= */}
          {/* قسم: آخر الملكيات المضافة */}
          {/* ========================================= */}
          <div className="lg:col-span-2 rounded-[24px] bg-white border border-[#d8e6ee] shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-[#d8e6ee] bg-[#f7fbfd] shrink-0">
              <span className="text-sm font-black text-[#123B5D] flex items-center gap-2">
                <History className="w-4 h-4 text-blue-500" /> أحدث الملفات
                المضافة
              </span>
              <button
                onClick={() => onNavigate && onNavigate("log")}
                className="text-[10px] font-bold text-[#0f6d7c] hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors flex items-center gap-1"
              >
                عرض السجل كاملاً <ChevronLeft className="w-3 h-3" />
              </button>
            </div>

            <div className="flex flex-col divide-y divide-slate-100 flex-1 overflow-y-auto custom-scrollbar-slim">
              {recentProperties.length > 0 ? (
                recentProperties.map((prop) => {
                  const clientName = getSafeClientName(prop.client);
                  const statusInfo = getStatusStyles(prop.status);

                  return (
                    <button
                      key={prop.id}
                      onClick={() => onOpenDetails && onOpenDetails(prop.id)}
                      className="w-full flex items-center gap-3 text-right transition-colors p-3.5 hover:bg-blue-50/50 group"
                    >
                      {/* الأيقونة */}
                      <div className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10 bg-[#f7fbfd] border border-[#d8e6ee] text-[#71839a] group-hover:bg-blue-100 group-hover:text-[#0f6d7c] group-hover:border-blue-200 transition-all">
                        <Building className="w-4 h-4" />
                      </div>

                      {/* التفاصيل */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold text-[#123B5D] bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-sm">
                            {prop.code}
                          </span>
                          <span className="text-xs font-black text-[#123B5D] truncate group-hover:text-[#123B5D] transition-colors">
                            {prop.plots?.[0]?.propertyType || "أرض"}{" "}
                            {prop.district ? `- ${prop.district}` : ""}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#71839a] font-bold flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#71839a]" />{" "}
                          {prop.city || "---"} - {prop.district || "---"}
                          <span className="mx-1 text-slate-300">|</span>
                          <User className="w-3 h-3 text-[#71839a]" />{" "}
                          <span className="text-[#123B5D] truncate max-w-[150px]">
                            {clientName}
                          </span>
                        </div>
                      </div>

                      {/* الحالة والتاريخ */}
                      <div className="shrink-0 flex flex-col items-end gap-1.5">
                        <span
                          className={`text-[9px] font-bold rounded px-2 py-0.5 border ${statusInfo.bg}`}
                        >
                          {statusInfo.label}
                        </span>
                        <span className="text-[9px] text-[#71839a] font-mono font-bold flex items-center gap-1">
                          {format(new Date(prop.createdAt), "dd MMM yyyy", {
                            locale: ar,
                          })}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center text-[#71839a]">
                  <Building className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold">
                    لا توجد ملكيات مضافة حتى الآن.
                  </p>
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