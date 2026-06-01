import React, { useState, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  ArrowUp,
  X as XIcon,
  Bookmark,
  Columns3,
  Download,
  ArrowUpDown,
  Copy,
  Eye,
  MoreHorizontal,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FilterX,
  Users
} from "lucide-react";

// استيراد دالة جلب البيانات
import { getDeeds } from "../../../api/propertyApi";

// دالة مساعدة سريعة لاستخراج اسم العميل
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

// دالة لحساب المساحة الإجمالية للملف
const calculateTotalArea = (item) => {
  return (
    item.area ||
    item.plots?.reduce((sum, p) => sum + (parseFloat(p.area) || 0), 0) ||
    0
  );
};

const DeedsLog = ({ onOpenDetails }) => {
  // 1. حالات الفلترة والبحث السريع (Debounce)
  const [searchInput, setSearchInput] = useState(""); // ما يكتبه المستخدم فوراً
  const [debouncedSearch, setDebouncedSearch] = useState(""); // ما يُستخدم للبحث الفعلي

  // تأثير تأخير البحث (Debounce) لضمان أداء فائق السرعة
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCurrentPage(1); // العودة للصفحة الأولى عند البحث
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [filters, setFilters] = useState({
    status: "all",
    type: "all",
    city: "all",
    district: "all",
  });

  // 2. حالات الترتيب وتقسيم الصفحات
  const [sortConfig, setSortConfig] = useState({
    key: "createdAt",
    direction: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selectedItems, setSelectedItems] = useState([]);

  // 3. جلب البيانات من الباك إند
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["properties"],
    queryFn: () => getDeeds(),
  });

  const rawData = response?.data || [];

  // 4. معالجة البيانات (فلترة + ترتيب) - باستخدام useMemo للأداء
  const processedData = useMemo(() => {
    let result = [...rawData];

    // أ. البحث النصي السريع
    if (debouncedSearch) {
      const lowerTerm = debouncedSearch.toLowerCase();
      result = result.filter((item) => {
        const clientName = getSafeClientName(item.client).toLowerCase();
        return (
          item.code?.toLowerCase().includes(lowerTerm) ||
          item.deedNumber?.toLowerCase().includes(lowerTerm) ||
          clientName.includes(lowerTerm) ||
          item.city?.toLowerCase().includes(lowerTerm) ||
          item.district?.toLowerCase().includes(lowerTerm)
        );
      });
    }

    // ب. فلاتر القوائم المنسدلة
    if (filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status);
    }
    if (filters.type !== "all") {
      result = result.filter((item) => {
        const itemType = item.plots?.[0]?.propertyType || "land";
        return itemType.includes(filters.type);
      });
    }
    if (filters.city !== "all") {
      result = result.filter((item) => item.city === filters.city);
    }
    if (filters.district !== "all") {
      result = result.filter((item) => item.district === filters.district);
    }

    // ج. الترتيب الديناميكي الذكي
    result.sort((a, b) => {
      let aVal, bVal;

      // تحديد القيمة المراد ترتيبها بناءً على الـ key
      if (sortConfig.key === "client.name") {
        aVal = getSafeClientName(a.client);
        bVal = getSafeClientName(b.client);
      } else if (sortConfig.key === "area") {
        aVal = calculateTotalArea(a);
        bVal = calculateTotalArea(b);
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
      }

      // معالجة القيم الفارغة
      if (aVal === null || aVal === undefined) aVal = "";
      if (bVal === null || bVal === undefined) bVal = "";

      // المقارنة
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal, "ar")
          : bVal.localeCompare(aVal, "ar");
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [rawData, debouncedSearch, filters, sortConfig]);

  // 5. تقسيم الصفحات
  const totalItems = processedData.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedData = processedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  // --- دوال مساعدة للتنسيق ---
  const getStatusBadge = (status) => {
    const st = status?.toLowerCase();
    if (st === "active" || st === "مؤكد" || st === "معتمد")
      return (
        <span className="text-[9px] font-bold rounded px-2 py-0.5 whitespace-nowrap bg-emerald-100 text-emerald-800 border border-emerald-200">
          مؤكد
        </span>
      );
    if (st === "pending" || st === "قيد المراجعة")
      return (
        <span className="text-[9px] font-bold rounded px-2 py-0.5 whitespace-nowrap bg-amber-100 text-amber-800 border border-amber-200">
          قيد المراجعة
        </span>
      );
    if (st === "disputed" || st === "متنازع")
      return (
        <span className="text-[9px] font-bold rounded px-2 py-0.5 whitespace-nowrap bg-red-100 text-red-800 border border-red-200">
          متنازع
        </span>
      );
    return (
      <span className="text-[9px] font-bold rounded px-2 py-0.5 whitespace-nowrap bg-[#f7fbfd] text-[#123B5D] border border-[#d8e6ee]">
        {status || "جديد"}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (!type)
      return (
        <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-[#f7fbfd] text-[#52677e]">
          أرض
        </span>
      );
    if (type.includes("سكني"))
      return (
        <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-blue-100 text-blue-800">
          سكني
        </span>
      );
    if (type.includes("تجاري"))
      return (
        <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-indigo-100 text-indigo-800">
          تجاري
        </span>
      );
    if (type.includes("زراعي"))
      return (
        <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-emerald-100 text-emerald-800">
          زراعي
        </span>
      );
    if (type.includes("صناعي"))
      return (
        <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-purple-100 text-purple-800">
          صناعي
        </span>
      );
    return (
      <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-[#f7fbfd] text-[#52677e]">
        أرض
      </span>
    );
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الكود: " + text);
  };

  const escapeExcelCell = (value) => {
    if (value === null || value === undefined || value === "") return "---";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const formatExcelDate = (value) => {
    if (!value) return "---";
    try {
      return format(new Date(value), "yyyy-MM-dd");
    } catch {
      return "---";
    }
  };

  const handleExportExcel = () => {
    const rows = processedData || [];

    if (!rows.length) {
      toast.error("لا توجد بيانات لتصديرها");
      return;
    }

    const columns = [
      "كود الملف",
      "رقم الصك",
      "نوع العقار",
      "المالك / الموكل",
      "المدينة",
      "الحي",
      "المساحة م²",
      "عدد الوثائق",
      "عدد القطع",
      "حالة الملف",
      "تاريخ الإضافة",
    ];

    const tableRows = rows
      .map((item) => {
        const propertyType = item.plots?.[0]?.propertyType || "أرض";
        const values = [
          item.code,
          item.deedNumber,
          propertyType,
          getSafeClientName(item.client),
          item.city,
          item.district,
          calculateTotalArea(item),
          item.documents?.length || 0,
          item.plots?.length || 0,
          item.status || "جديد",
          formatExcelDate(item.createdAt),
        ];

        return `<tr>${values
          .map((value) => `<td style="mso-number-format:'\@';">${escapeExcelCell(value)}</td>`)
          .join("")}</tr>`;
      })
      .join("");

    const html = `
      <!doctype html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8" />
          <style>
            table { border-collapse: collapse; width: 100%; direction: rtl; font-family: Arial, Tahoma, sans-serif; }
            th { background: #083646; color: #ffffff; font-weight: 700; }
            th, td { border: 1px solid #d8e6ee; padding: 8px 10px; text-align: right; font-size: 12px; }
            td { color: #123B5D; }
          </style>
        </head>
        <body>
          <table>
            <thead><tr>${columns.map((column) => `<th>${column}</th>`).join("")}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob(["\ufeff", html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `سجل_الصكوك_${format(new Date(), "yyyy-MM-dd")}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`تم تصدير ${rows.length} ملف من سجل الصكوك بنجاح`);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  // هيدر الجدول (مكون لتجنب التكرار ولإضافة تصميم السهم النشط)
  const SortableTH = ({
    label,
    sortKey,
    width,
    align = "text-right",
    isMono = false,
  }) => {
    const isActive = sortConfig.key === sortKey;
    return (
      <th
        onClick={() => handleSort(sortKey)}
        className={`px-3 py-2 ${align} ${width} text-[10px] font-bold cursor-pointer hover:bg-slate-200 transition-colors border-b border-slate-200 h-[38px] ${isActive ? "border-blue-500 bg-blue-50/50 text-[#123B5D]" : "border-slate-200 text-[#71839a]"}`}
      >
        <div
          className={`flex items-center gap-1 ${align === "text-center" ? "justify-center" : ""}`}
        >
          <span className={isMono ? "font-mono" : ""}>{label}</span>
          <ArrowUpDown
            className={`w-3 h-3 ${isActive ? "text-blue-500 opacity-100" : "text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"}`}
          />
        </div>
      </th>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white animate-in fade-in" dir="rtl">
      {/* ======================= الشريط العلوي (الفلاتر) ======================= */}
      <div className="shrink-0 bg-white border-b border-[#d8e6ee] shadow-sm z-10 relative">
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 px-3 py-2 min-h-[58px]">
          {/* البحث */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71839a] w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث بالكود، الصك، اسم العميل، المدينة..."
              className="w-full h-[36px] text-xs rounded-xl border border-[#d8e6ee] outline-none bg-[#f7fbfd] focus:bg-white focus:border-[#d9b85b] focus:ring-2 focus:ring-[#d9b85b]/20 transition-all pr-9 pl-9 font-bold text-[#123B5D] placeholder:text-[#8aa0b4]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-[#71839a] hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                <XIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* الفلاتر */}
          <select
            className="h-[36px] min-w-[135px] px-3 border border-[#d8e6ee] rounded-xl text-xs bg-white hover:bg-[#f7fbfd] outline-none cursor-pointer focus:border-[#d9b85b] font-black text-[#52677e]"
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setCurrentPage(1);
            }}
          >
            <option value="all">جميع الحالات</option>
            <option value="Active">مؤكد / نشط</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="متنازع">متنازع</option>
          </select>

          <select
            className="h-[36px] min-w-[125px] px-3 border border-[#d8e6ee] rounded-xl text-xs bg-white hover:bg-[#f7fbfd] outline-none cursor-pointer focus:border-[#d9b85b] font-black text-[#52677e]"
            value={filters.type}
            onChange={(e) => {
              setFilters({ ...filters, type: e.target.value });
              setCurrentPage(1);
            }}
          >
            <option value="all">كل الأنواع</option>
            <option value="سكني">سكني</option>
            <option value="تجاري">تجاري</option>
            <option value="زراعي">زراعي</option>
            <option value="صناعي">صناعي</option>
          </select>


          <button
            onClick={handleExportExcel}
            disabled={isLoading || processedData.length === 0}
            className="h-[36px] flex items-center gap-1.5 text-[11px] font-black text-[#52677e] hover:text-[#123B5D] rounded-xl px-3 bg-white border border-[#d8e6ee] shadow-sm hover:shadow transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-3.5 h-3.5" /> تصدير إكسيل
          </button>

          {(filters.status !== "all" ||
            filters.type !== "all" ||
            filters.city !== "all" ||
            filters.district !== "all" ||
            searchInput !== "") && (
            <button
              onClick={() => {
                setFilters({
                  status: "all",
                  type: "all",
                  city: "all",
                  district: "all",
                });
                setSearchInput("");
              }}
              className="h-[36px] flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 px-3 rounded-xl font-black hover:bg-red-100 transition-colors whitespace-nowrap"
            >
              <FilterX className="w-3.5 h-3.5" /> مسح
            </button>
          )}
        </div>
      </div>
      {/* ======================= منطقة الجدول ======================= */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-[#71839a] absolute inset-0 bg-white/80 z-50">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-[#0f6d7c]" />
            <p className="font-bold">جاري تحميل السجل...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <AlertTriangle className="w-12 h-12 mb-3 text-red-500 opacity-80" />
            <p className="font-bold text-sm">
              فشل الاتصال بالخادم لجلب البيانات.
            </p>
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-[#71839a]">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold text-sm text-[#71839a]">
              لا توجد نتائج تطابق معايير البحث.
            </p>
            <p className="text-xs mt-1">جرب تغيير الفلاتر أو كلمات البحث.</p>
          </div>
        ) : (
          <table
            className="w-full border-collapse"
            style={{ minWidth: "1200px" }}
          >
            <thead className="sticky top-0 z-20 bg-[#f7fbfd] shadow-sm">
              <tr className="group">
                <SortableTH
                  label="كود الملف"
                  sortKey="code"
                  width="w-[120px]"
                  isMono
                />
                <SortableTH
                  label="رقم الصك"
                  sortKey="deedNumber"
                  width="w-[130px]"
                  isMono
                />
                <th className="px-3 py-2 text-right w-[80px] h-[38px] text-[10px] font-bold text-[#71839a] border-b border-slate-200">
                  النوع
                </th>
                <SortableTH
                  label="المالك / الموكل"
                  sortKey="client.name"
                  width="w-[180px]"
                />
                <SortableTH
                  label="المدينة والحي"
                  sortKey="city"
                  width="w-[140px]"
                />
                <SortableTH
                  label="مساحة م²"
                  sortKey="area"
                  width="w-[100px]"
                  align="text-center"
                  isMono
                />
                <th
                  className="px-3 py-2 text-center w-[60px] h-[38px] text-[10px] font-bold text-[#71839a] border-b border-slate-200"
                  title="عدد الوثائق"
                >
                  وث
                </th>
                <th
                  className="px-3 py-2 text-center w-[60px] h-[38px] text-[10px] font-bold text-[#71839a] border-b border-slate-200"
                  title="عدد القطع المستخرجة"
                >
                  ق
                </th>
                <SortableTH
                  label="حالة الملف"
                  sortKey="status"
                  width="w-[110px]"
                  align="text-center"
                />
                <SortableTH
                  label="تاريخ الإضافة"
                  sortKey="createdAt"
                  width="w-[100px]"
                  align="text-center"
                  isMono
                />
                <th className="px-3 py-2 text-center w-[80px] h-[38px] text-[10px] font-bold text-[#71839a] border-b border-slate-200">
                  إجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {paginatedData.map((item) => {
                const clientName = getSafeClientName(item.client);
                const propertyType = item.plots?.[0]?.propertyType || "أرض";
                const totalArea = calculateTotalArea(item);
                const formattedDate = item.createdAt
                  ? format(new Date(item.createdAt), "yyyy-MM-dd")
                  : "---";

                return (
                  <tr
                    key={item.id}
                    onClick={() => onOpenDetails && onOpenDetails(item.id, item.code)}
                    className="group transition-colors bg-white hover:bg-[#f7fbfd] cursor-pointer h-[42px]"
                  >
                    {/* Code */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-[#123B5D] bg-blue-50 px-2 py-1 rounded border border-blue-100 group-hover:bg-white transition-colors">
                          {item.code}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.code);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[#71839a] hover:text-[#0f6d7c] transition-opacity p-1 bg-white rounded shadow-sm"
                          title="نسخ الكود"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Deed Number */}
                    <td className="px-3 py-2">
                      <div
                        className="text-[11px] font-mono font-bold text-[#52677e] truncate max-w-[120px]"
                        title={item.deedNumber}
                      >
                        {item.deedNumber || "---"}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-3 py-2">{getTypeBadge(propertyType)}</td>

                    {/* Owner */}
                    <td className="px-3 py-2" title={clientName}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-[#f7fbfd] flex items-center justify-center text-[#71839a] shrink-0">
                          <Users className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-[#123B5D] font-bold truncate max-w-[130px]">
                            {clientName}
                          </div>
                          {item.owners?.length > 1 && (
                            <div className="text-[9px] text-blue-500 font-bold mt-0.5">
                              +{item.owners.length - 1} شركاء آخرين
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-3 py-2">
                      <div className="text-xs text-[#123B5D] font-bold">
                        {item.city || "---"}
                      </div>
                      <div className="text-[10px] text-[#71839a] mt-0.5">
                        {item.district || "بدون حي"}
                      </div>
                    </td>

                    {/* Area */}
                    <td className="px-3 py-2 text-center">
                      <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {totalArea.toLocaleString()}
                      </span>
                    </td>

                    {/* Counts */}
                    <td className="px-3 py-2 text-center text-xs font-bold text-[#52677e]">
                      {item.documents?.length || 0}
                    </td>
                    <td className="px-3 py-2 text-center text-xs font-bold text-[#52677e]">
                      {item.plots?.length || 0}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Date */}
                    <td className="px-3 py-2 text-center text-[10px] font-bold text-[#71839a] font-mono">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td
                      className="px-3 py-2 text-center w-[110px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          onOpenDetails && onOpenDetails(item.id)
                        }
                        className="h-8 px-3 mx-auto flex items-center justify-center gap-1.5 rounded-xl bg-[#083646] text-white hover:bg-[#0f6d7c] transition-colors shadow-sm text-[10px] font-black whitespace-nowrap"
                        title="فتح الملف التفصيلي"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فتح الملف</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ======================= Clean Pagination Footer ======================= */}
      <div className="shrink-0 bg-white border-t border-[#d8e6ee] px-4 py-3 rounded-b-[22px] shadow-[0_-6px_18px_rgba(8,54,70,0.04)] z-10 relative">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 min-h-[44px]" dir="rtl">
          {/* Right: total results */}
          <div className="h-9 flex items-center gap-2 px-3 rounded-xl bg-[#f7fbfd] border border-[#d8e6ee] shadow-sm shrink-0">
            <span className="text-[11px] font-bold text-[#71839a]">النتائج:</span>
            <strong className="text-[#123B5D] text-[13px] bg-[#eef5f7] min-w-8 h-6 px-2 rounded-full flex items-center justify-center">
              {totalItems}
            </strong>
          </div>

          {/* Center: range */}
          <div className="justify-self-center h-9 flex items-center justify-center px-4 rounded-xl bg-white border border-[#d8e6ee] shadow-sm text-[12px] font-bold text-[#52677e] whitespace-nowrap">
            عرض {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, totalItems)} من {totalItems}
          </div>

          {/* Left: page navigation */}
          <div className="justify-self-end flex items-center gap-2 shrink-0" dir="ltr">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(1)}
              aria-label="الصفحة الأولى"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#d8e6ee] bg-white hover:bg-[#f7fbfd] disabled:opacity-35 disabled:cursor-not-allowed text-[#123B5D] shadow-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4 -mr-1" />
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              aria-label="السابق"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#d8e6ee] bg-white hover:bg-[#f7fbfd] disabled:opacity-35 disabled:cursor-not-allowed text-[#123B5D] shadow-sm transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="px-4 h-9 flex items-center justify-center rounded-xl bg-[#083646] text-white text-[12px] font-black shadow-sm whitespace-nowrap" dir="rtl">
              صفحة {currentPage} من {totalPages}
            </div>

            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              aria-label="التالي"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#d8e6ee] bg-white hover:bg-[#f7fbfd] disabled:opacity-35 disabled:cursor-not-allowed text-[#123B5D] shadow-sm transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
              aria-label="الصفحة الأخيرة"
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#d8e6ee] bg-white hover:bg-[#f7fbfd] disabled:opacity-35 disabled:cursor-not-allowed text-[#123B5D] shadow-sm transition-all"
            >
              <ChevronRight className="w-4 h-4" />
              <ChevronRight className="w-4 h-4 -ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeedsLog;