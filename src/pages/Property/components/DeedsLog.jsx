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
      <span className="text-[9px] font-bold rounded px-2 py-0.5 whitespace-nowrap bg-slate-100 text-slate-800 border border-slate-200">
        {status || "جديد"}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    if (!type)
      return (
        <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600">
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
      <span className="text-[9px] font-bold rounded px-1.5 py-0.5 bg-slate-100 text-slate-600">
        أرض
      </span>
    );
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الكود: " + text);
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
        className={`p-3 ${align} ${width} text-[10px] font-bold cursor-pointer hover:bg-slate-200 transition-colors border-b-2 ${isActive ? "border-blue-500 bg-blue-50/50 text-blue-700" : "border-slate-300 text-slate-500"}`}
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
      <div className="shrink-0 bg-white border-b border-slate-200 shadow-sm z-10 relative">
        <div className="flex flex-wrap items-center gap-2 p-3">
          {/* مربع البحث الذكي */}
          <div className="relative flex-1 min-w-[250px] max-w-[400px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحث بالكود، الصك، اسم العميل، المدينة..."
              className="w-full text-xs rounded-lg border border-slate-300 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-slate-50 focus:bg-white"
              style={{
                height: "36px",
                paddingRight: "36px",
                paddingLeft: "36px",
              }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button
                onClick={() => setSearchInput("")}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
              >
                <XIcon className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* فلاتر سريعة */}
          <select
            className="h-[36px] px-3 border border-slate-300 rounded-lg text-xs bg-slate-50 hover:bg-white outline-none cursor-pointer focus:border-blue-500 font-bold text-slate-600"
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
            className="h-[36px] px-3 border border-slate-300 rounded-lg text-xs bg-slate-50 hover:bg-white outline-none cursor-pointer focus:border-blue-500 font-bold text-slate-600"
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

          {/* زر إعادة ضبط الفلاتر إذا كانت نشطة */}
          {(filters.status !== "all" ||
            filters.type !== "all" ||
            filters.city !== "all" ||
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
              className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 h-[36px] rounded-lg font-bold hover:bg-red-100 transition-colors mr-auto"
            >
              <FilterX className="w-3.5 h-3.5" /> مسح الفلاتر
            </button>
          )}
        </div>

        {/* شريط الإحصائيات والأدوات */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold">
            <span>
              إجمالي النتائج:{" "}
              <strong className="text-blue-700 text-xs bg-blue-100 px-2 py-0.5 rounded-full">
                {totalItems}
              </strong>
            </span>
            <div className="w-px h-4 bg-slate-300"></div>
            <span className="flex items-center gap-1.5 text-slate-500">
              ترتيب حسب:
              <span className="flex items-center gap-1 rounded-md px-2 py-1 bg-white border border-slate-200 text-slate-700 shadow-sm">
                {sortConfig.key === "code"
                  ? "كود الملكية"
                  : sortConfig.key === "createdAt"
                    ? "تاريخ الإضافة"
                    : "مخصص"}
                <ArrowUp
                  className={`w-3 h-3 text-blue-500 transition-transform ${sortConfig.direction === "desc" ? "rotate-180" : ""}`}
                />
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 hover:text-blue-700 rounded-lg px-3 py-1.5 bg-white border border-slate-200 shadow-sm hover:shadow transition-all">
              <Download className="w-3.5 h-3.5" /> تصدير إكسيل
            </button>
          </div>
        </div>
      </div>

      {/* ======================= منطقة الجدول ======================= */}
      <div className="flex-1 overflow-auto bg-white custom-scrollbar relative">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 absolute inset-0 bg-white/80 z-50">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-blue-600" />
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
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Search className="w-12 h-12 mb-4 opacity-20" />
            <p className="font-bold text-sm text-slate-500">
              لا توجد نتائج تطابق معايير البحث.
            </p>
            <p className="text-xs mt-1">جرب تغيير الفلاتر أو كلمات البحث.</p>
          </div>
        ) : (
          <table
            className="w-full border-collapse"
            style={{ minWidth: "1200px" }}
          >
            <thead className="sticky top-0 z-20 bg-slate-50 shadow-sm">
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
                <th className="p-3 text-right w-[80px] text-[10px] font-bold text-slate-500 border-b-2 border-slate-300">
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
                  className="p-3 text-center w-[60px] text-[10px] font-bold text-slate-500 border-b-2 border-slate-300"
                  title="عدد الوثائق"
                >
                  وث
                </th>
                <th
                  className="p-3 text-center w-[60px] text-[10px] font-bold text-slate-500 border-b-2 border-slate-300"
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
                <th className="p-3 text-center w-[80px] text-[10px] font-bold text-slate-500 border-b-2 border-slate-300">
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
                    className="group transition-colors bg-white hover:bg-blue-50/50 cursor-pointer h-[46px]"
                  >
                    {/* Code */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-100 group-hover:bg-white transition-colors">
                          {item.code}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(item.code);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-opacity p-1 bg-white rounded shadow-sm"
                          title="نسخ الكود"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Deed Number */}
                    <td className="p-3">
                      <div
                        className="text-[11px] font-mono font-bold text-slate-600 truncate max-w-[120px]"
                        title={item.deedNumber}
                      >
                        {item.deedNumber || "---"}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="p-3">{getTypeBadge(propertyType)}</td>

                    {/* Owner */}
                    <td className="p-3" title={clientName}>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                          <Users className="w-3 h-3" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-slate-800 font-bold truncate max-w-[130px]">
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
                    <td className="p-3">
                      <div className="text-xs text-slate-700 font-bold">
                        {item.city || "---"}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {item.district || "بدون حي"}
                      </div>
                    </td>

                    {/* Area */}
                    <td className="p-3 text-center">
                      <span className="text-xs font-mono font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        {totalArea.toLocaleString()}
                      </span>
                    </td>

                    {/* Counts */}
                    <td className="p-3 text-center text-xs font-bold text-slate-600">
                      {item.documents?.length || 0}
                    </td>
                    <td className="p-3 text-center text-xs font-bold text-slate-600">
                      {item.plots?.length || 0}
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {getStatusBadge(item.status)}
                    </td>

                    {/* Date */}
                    <td className="p-3 text-center text-[10px] font-bold text-slate-500 font-mono">
                      {formattedDate}
                    </td>

                    {/* Actions */}
                    <td
                      className="p-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            onOpenDetails && onOpenDetails(item.id)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-colors shadow-sm"
                          title="فتح الملف التفصيلي"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ======================= شريط التصفح السفلي (Pagination) ======================= */}
      <div className="flex items-center justify-between shrink-0 bg-white border-t border-slate-200 px-5 py-3 rounded-b-lg shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.03)] z-10 relative">
        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500">
          <span>
            عرض {(currentPage - 1) * pageSize + 1} إلى{" "}
            {Math.min(currentPage * pageSize, totalItems)} من أصل{" "}
            <span className="text-blue-600">{totalItems}</span> ملف
          </span>
          <div className="flex items-center gap-2">
            <span>الصفوف:</span>
            <select
              className="h-[28px] px-2 border border-slate-300 rounded-md text-[11px] bg-slate-50 outline-none cursor-pointer focus:border-blue-500"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5" dir="ltr">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4 -mr-1.5" />
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 shadow-sm transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3 h-8 flex items-center justify-center rounded-lg bg-blue-600 text-white text-[11px] font-black shadow-md mx-1">
            صفحة {currentPage} من {totalPages}
          </div>

          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 shadow-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600 shadow-sm transition-all"
          >
            <ChevronRight className="w-4 h-4" />
            <ChevronRight className="w-4 h-4 -ml-1.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeedsLog;
