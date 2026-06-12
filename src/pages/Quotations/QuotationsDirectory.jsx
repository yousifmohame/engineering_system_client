import React, { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  FileText,
  Filter,
  Search,
  Eye,
  Printer,
  X,
  Loader2,
  Trash2,
  ShieldCheck,
  Calendar,
  Globe,
  MapPin,
  Phone,
  Mail,
  Download,
  Edit3 // 👈 تم إضافة استيراد أيقونة التعديل
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import { useReactToPrint } from "react-to-print";

// 💡 استيراد متجر التابات لفتح شاشة التعديل
import { useAppStore } from "../../stores/useAppStore";
// 💡 استيراد مكون الختم الاحترافي
import { OfficialStamp } from "../../components/OfficialStamp/OfficialStamp";
import AccessControl from "../../components/AccessControl";

// 🚀 استيراد مودال تفاصيل عرض السعر
import QuotationDetailsModal from "./QuotationDetailsModal";

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
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

// ==========================================
// ثوابت التطبيق
// ==========================================
const STATUS_CONFIG = {
  DRAFT: { label: "مسودة", bg: "bg-[#fbf8f1]", text: "text-[#64748b]" },
  PENDING_APPROVAL: {
    label: "تحت المراجعة",
    bg: "bg-blue-100",
    text: "text-[#123f59]",
  },
  REJECTED: {
    label: "راجع بملاحظات",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  SENT: {
    label: "بانتظار توقيع المالك",
    bg: "bg-amber-100",
    text: "text-amber-700",
  },
  APPROVED: {
    label: "معتمد — بانتظار الدفع",
    bg: "bg-emerald-100",
    text: "text-[#0f766e]",
  },
  PARTIALLY_PAID: {
    label: "مسدد جزئياً",
    bg: "bg-yellow-100",
    text: "text-yellow-700",
  },
  ACCEPTED: {
    label: "مسدد بالكامل",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  EXPIRED: { label: "منتهي الصلاحية", bg: "bg-red-50", text: "text-red-700" },
  CANCELLED: { label: "ملغى", bg: "bg-red-100", text: "text-red-800" },
};

const SCREEN_ID = "815";

// ==========================================
// مكونات مساعدة
// ==========================================
const StatusBadge = React.memo(({ status }) => {
  const current = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span
      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
});

const getClientName = (client) => {
  if (!client) return "عميل غير محدد";
  if (typeof client.name === "object") {
    return client.name.ar || client.name.en || "عميل غير محدد";
  }
  return client.name || "عميل غير محدد";
};

const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("ar-SA");
};

const toArabicDigits = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

const getDatePart = (formatter, date, type) =>
  formatter.formatToParts(date).find((part) => part.type === type)?.value || "";

const formatDateParts = (value) => {
  const date = value ? new Date(value) : new Date();

  if (Number.isNaN(date.getTime())) {
    const fallback = String(value || "");
    return {
      gregorian: fallback,
      hijri: fallback,
      combined: `ميلادي: ${fallback} / هجري: ${fallback}`,
    };
  }

  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const hijriFormatter = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );

  const gregorianDay = getDatePart(gregorianFormatter, date, "day");
  const gregorianMonth = getDatePart(gregorianFormatter, date, "month");
  const gregorianYear = getDatePart(gregorianFormatter, date, "year");

  const hijriDay = getDatePart(hijriFormatter, date, "day");
  const hijriMonth = getDatePart(hijriFormatter, date, "month");
  const hijriYear = getDatePart(hijriFormatter, date, "year");

  const gregorian = toArabicDigits(
    `${gregorianDay}/${gregorianMonth}/${gregorianYear}`,
  );
  const hijri = toArabicDigits(`${hijriDay}/${hijriMonth}/${hijriYear}`);

  return {
    gregorian,
    hijri,
    combined: `ميلادي: ${gregorian} / هجري: ${hijri}`,
  };
};

const DetailsPrintFooter = ({ accentColor = "#0f5570" }) => {
  return (
    <footer
      className="
        details-print-footer absolute bottom-[7mm] left-[10mm] right-[10mm]
        bg-white font-[Tajawal]
      "
      dir="ltr"
    >
      <div
        className="border-t-[2.5px] pt-1.5"
        style={{ borderColor: accentColor }}
      >
        <div className="flex items-start gap-2" style={{ color: accentColor }}>
          <img
            src="/qrcode.png"
            alt="QR Code"
            className="h-[16mm] w-[16mm] shrink-0 object-contain"
          />

          <div className="min-w-0 flex-1">
            <div
              className="
                flex items-center justify-end gap-1 whitespace-nowrap
                text-[10.5px] font-black leading-[1.35]
              "
              dir="rtl"
            >
              <span>📍</span>
              <span>
                حي الملك فهد - الرياض - المملكة العربية السعودية - الرمز البريدي
                : ١٢٢٧٤
              </span>
              <span>·</span>
              <span>جوال : ٠٥٩٠٧٢٢٨٢٧</span>
              <span>·</span>
              <span>الرقم الوطني الموحد : ٧٠٥٢٣٠٣٨٢٨</span>
            </div>

            <div
              className="
                mt-0.5 flex items-center gap-1 whitespace-nowrap
                text-[10.5px] font-black leading-[1.35]
              "
              dir="ltr"
            >
              <span>📍</span>
              <span>
                King Fahd Dist - RIYADH - Kingdom of Saudi Arabia -POSTAL CODE
                :12274
              </span>
              <span>☎</span>
              <span>0590722827</span>
              <span>- N.N:</span>
              <span>7052303828</span>
              <span>✉</span>
              <span>info@details-consults.sa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const QuotationsDirectory = () => {
  const queryClient = useQueryClient();
  const { addTab } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // 🚀 حالة المودال الجديد

  const printComponentRef = useRef(null);

  // 1. جلب البيانات الأساسية للجدول
  const {
    data: quotationsData,
    isLoading: isListLoading,
    error: listError,
  } = useQuery({
    queryKey: ["quotations-list"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 2. جلب البيانات الكاملة عند طلب الطباعة فقط
  const { data: fullQuoteData, isFetching: isDetailLoading } = useQuery({
    queryKey: ["quotation-detail", selectedQuoteId],
    queryFn: async () => {
      const response = await axios.get(`/quotations/${selectedQuoteId}`);
      return response.data.data;
    },
    enabled: !!selectedQuoteId && isPrintModalOpen,
    staleTime: 1 * 60 * 1000,
  });

  // الحذف
  const deleteQuotationMutation = useMutation({
    mutationFn: async (id) => axios.delete(`/quotations/${id}`),
    onSuccess: () => {
      toast.success("تم النقل لسلة المحذوفات");
      queryClient.invalidateQueries({ queryKey: ["quotations-list"] });
    },
    onError: (err) => {
      console.error("Delete error:", err);
      toast.error("حدث خطأ أثناء محاولة الحذف");
    },
  });

  const handleDelete = useCallback(
    (e, id) => {
      e.stopPropagation();
      if (window.confirm("هل أنت متأكد من النقل لسلة المحذوفات؟")) {
        deleteQuotationMutation.mutate(id);
      }
    },
    [deleteQuotationMutation],
  );

  // 🚀 دالة فتح التاب والتأكد من وصول المعرف (ID) للتعديل
  const handleEditQuotation = useCallback(
    (e, quote) => {
      e?.stopPropagation();
      setIsDetailsModalOpen(false); // إغلاق المودال إذا كان مفتوحاً
      addTab(SCREEN_ID, {
        id: `EDIT-QUOTATION-${quote.id}`,
        title: `تعديل عرض ${quote.number}`,
        type: "create-quotation",
        closable: true,
        // نمرر الـ ID في جميع الأماكن المحتملة لمنع أي فقدان للبيانات
        quotationId: quote.id,
        data: { quotationId: quote.id },
        props: { quotationId: quote.id },
      });
    },
    [addTab],
  );

  // 🚀 دالة فتح مودال التفاصيل السريع (للعرض فقط)
  const handleViewDetails = useCallback((e, id) => {
    e?.stopPropagation();
    setSelectedQuoteId(id);
    setIsDetailsModalOpen(true);
  }, []);

  // فتح نافذة الطباعة
  const handleOpenPrint = useCallback((e, id) => {
    e?.stopPropagation();
    setSelectedQuoteId(id);
    setIsDetailsModalOpen(false); // إغلاق التفاصيل إن كانت مفتوحة
    setIsPrintModalOpen(true);
  }, []);

  const handleClosePrint = useCallback(() => {
    setIsPrintModalOpen(false);
    setSelectedQuoteId(null);
  }, []);

  // إعداد الطباعة
  const handlePrint = useReactToPrint({
    contentRef: printComponentRef,
    documentTitle: `Quotation_${fullQuoteData?.number || "Print"}`,
    onAfterPrint: () => {
      toast.success("تمت الطباعة بنجاح");
    },
    onPrintError: (error) => {
      console.error("Print error:", error);
      toast.error("حدث خطأ أثناء الطباعة");
    },
  });

  // الفلترة
  const filteredData = useMemo(() => {
    if (!quotationsData) return [];

    return quotationsData.filter((q) => {
      if (q.isDeleted || q.status === "TRASHED") return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        q.number?.toLowerCase().includes(searchLower) ||
        getClientName(q.client)?.toLowerCase().includes(searchLower) ||
        q.ownership?.code?.toLowerCase().includes(searchLower);

      const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [quotationsData, searchTerm, filterStatus]);

  const getStatusCount = useCallback(
    (status) => {
      if (!quotationsData) return 0;
      return quotationsData.filter((q) => q.status === status && !q.isDeleted)
        .length;
    },
    [quotationsData],
  );

  if (listError) {
    return (
      <div
        className="flex h-full min-h-0 items-center justify-center bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
        dir="rtl"
      >
        <div className="text-center p-3">
          <div className="text-red-500 font-bold mb-2">
            ⚠️ حدث خطأ في تحميل البيانات
          </div>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["quotations-list"] })
            }
            className="px-4 py-2 bg-[#123f59] text-white rounded-xl text-sm hover:bg-[#0f3448]"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] relative"
      dir="rtl"
    >
      {/* 🚀 إدراج مودال التفاصيل الجديد */}
      <QuotationDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        quotationId={selectedQuoteId}
        onPrint={(id) => handleOpenPrint(null, id)}
        onEdit={(quote) => handleEditQuotation(null, quote)}
      />

      {/* الجدول الرئيسي */}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 md:p-3.5 w-full">
        <div className="flex min-w-0 items-center justify-between mb-3">
          <div className="text-base font-bold text-[#123f59] flex min-w-0 items-center gap-2">
            <IconWithText
              icon={FileText}
              iconClassName="w-5 h-5 text-[#123f59]"
            />
            دليل عروض الأسعار
            <span className="text-xs text-[#64748b] font-normal">
              ({filteredData.length} من {quotationsData?.length || 0})
            </span>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="بحث ذكي: اسم العميل، الكود، آخر 4 أرقام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pr-9 pl-3 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-[#c5983c]/70 focus:ring-1 focus:ring-blue-500 transition-all"
            aria-label="بحث في العروض"
          />
        </div>

        {/* أزرار الفلترة */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {[
            { key: "ALL", label: "الكل" },
            { key: "DRAFT", label: "مسودة" },
            { key: "PENDING_APPROVAL", label: "تحت المراجعة" },
            { key: "APPROVED", label: "معتمد" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                filterStatus === key
                  ? "bg-[#123f59] border-blue-600 text-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                  : "bg-white border-[#d8b46a]/25 text-[#64748b] hover:bg-[#fbf8f1]"
              }`}
            >
              {label} (
              {key === "ALL" ? filteredData.length : getStatusCount(key)})
            </button>
          ))}
        </div>

        {/* جدول البيانات */}
        <div className="bg-white rounded-xl border border-[#d8b46a]/25 overflow-hidden shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
          <div className="overflow-x-auto custom-scrollbar-slim min-h-[300px]">
            {isListLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-[#94a3b8]">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#123f59]" />
                <span className="text-xs">جاري التحميل...</span>
              </div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b-2 border-[#d8b46a]/25">
                    <th className="p-2 text-[10px] text-[#64748b] font-bold w-10">
                      #
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">
                      رقم العرض
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">
                      التاريخ
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">
                      العميل
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">
                      الملكية
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">
                      الإجمالي
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">
                      الحالة
                    </th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((q, idx) => (
                    <tr
                      key={q.id}
                      className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1] transition-colors cursor-pointer"
                      // 🚀 التعديل هنا: عند الضغط على الصف يفتح مودال التفاصيل وليس الويزارد
                      onClick={(e) => handleViewDetails(e, q.id)}
                    >
                      <td className="p-2 text-[10px] text-[#94a3b8] font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-2">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-[#123f59]">
                            {q.number}
                          </span>
                          <span className="text-[8px] text-purple-600 font-bold bg-purple-50 px-1 rounded">
                            {q.templateType === "DETAILED" ? "T" : "S"}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="text-[10px] font-mono">
                          {format(new Date(q.issueDate), "yyyy-MM-dd", {
                            locale: arSA,
                          })}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-bold text-[11px] text-[#475569]">
                          {getClientName(q.client)}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-mono text-[10px] text-[#0f766e] font-bold">
                          {q.ownership?.code || "—"}
                        </span>
                      </td>
                      <td className="p-2 text-[11px] font-bold text-[#123f59] font-mono">
                        {formatCurrency(q.total)} ر.س
                      </td>
                      <td className="p-2">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="p-2">
                        <div
                          className="flex min-w-0 items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* 🚀 زر التعديل يفتح الويزارد */}
                          <button
                            onClick={(e) => handleEditQuotation(e, q)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="تعديل في معالج العروض"
                            aria-label="تعديل العرض"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* 🚀 زر العرض يفتح المودال الجديد */}
                          <button
                            onClick={(e) => handleViewDetails(e, q.id)}
                            className="p-1.5 bg-slate-100 text-[#123f59] rounded hover:bg-slate-200 transition-colors"
                            title="استعراض التفاصيل"
                            aria-label="عرض التفاصيل"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* زر الطباعة */}
                          <button
                            onClick={(e) => handleOpenPrint(e, q.id)}
                            className="p-1.5 bg-emerald-50 text-[#0f766e] rounded hover:bg-emerald-100 transition-colors"
                            title="طباعة العرض"
                            aria-label="طباعة العرض"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <AccessControl
                            code="QUOTE_ACTION_DELETE"
                            name="حذف عرض السعر"
                            moduleName="عروض الأسعار"
                            tabName="الجدول"
                          >
                            <button
                              onClick={(e) => handleDelete(e, q.id)}
                              disabled={deleteQuotationMutation.isPending}
                              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="حذف"
                              aria-label="حذف العرض"
                            >
                              {deleteQuotationMutation.isPending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </AccessControl>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="p-3 text-center text-[#94a3b8] text-xs"
                      >
                        {searchTerm || filterStatus !== "ALL"
                          ? "لا يوجد عروض أسعار مطابقة لبحثك"
                          : "لا توجد عروض أسعار حالياً"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* مودال الطباعة الاحترافية A4 */}
      {/* ========================================== */}
      {isPrintModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-[2000] flex min-w-0 items-center justify-center p-3 backdrop-blur-sm"
          onClick={handleClosePrint}
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-modal-title"
        >
          <div
            className="bg-[#eef7f6] rounded-[20px] w-full max-w-[1000px] h-[95vh] flex flex-col shadow-[0_20px_55px_rgba(18,63,89,0.18)] overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* شريط الأدوات */}
            <div className="shrink-0 z-50 w-full flex min-w-0 justify-between items-center bg-white px-4 py-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] border-b border-[#d8b46a]/25">
              <div className="flex min-w-0 items-center gap-3">
                <Printer className="w-5 h-5 text-[#123f59]" />
                <div>
                  <h3
                    id="print-modal-title"
                    className="text-sm font-black text-[#123f59]"
                  >
                    تصدير وطباعة عرض السعر
                  </h3>
                  {isDetailLoading ? (
                    <span className="text-[10px] text-orange-500 animate-pulse font-bold">
                      جاري جلب البنود والماليات...
                    </span>
                  ) : (
                    <p className="text-[10px] text-[#123f59] font-mono font-bold bg-blue-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                      {fullQuoteData?.number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => handlePrint()}
                  disabled={isDetailLoading || !fullQuoteData}
                  className="flex min-w-0 items-center gap-2 px-4 py-2 bg-[#123f59] text-white rounded-xl text-xs font-black hover:bg-[#0f3448] transition-all shadow-[0_8px_18px_rgba(18,63,89,0.08)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" /> طباعة فورية
                </button>
                <div className="w-px h-6 bg-[#eef7f6]"></div>
                <button
                  onClick={handleClosePrint}
                  className="p-2 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* مساحة عرض الورقة */}
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim custom-scrollbar-slim flex justify-center py-3">
              {isDetailLoading || !fullQuoteData ? (
                <div className="m-auto flex flex-col items-center gap-3">
                  <Loader2 className="w-9 h-9 animate-spin text-[#123f59]" />
                  <p className="text-[#64748b] font-bold">
                    جاري تجهيز بيانات العرض والختم...
                  </p>
                </div>
              ) : (
                <div
                  ref={printComponentRef}
                  className="bg-white shadow-[0_14px_34px_rgba(18,63,89,0.12)] relative border border-[#d8b46a]/25 print-area"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    paddingBottom: "32mm",
                  }}
                  dir="rtl"
                >
                  <div className="p-[15mm] relative z-10 flex flex-col h-full">
                    {/* الترويسة */}
                    <div className="flex min-w-0 justify-between items-start border-b-4 border-[#123f59] pb-6 mb-3">
                      <div className="flex items-start">
                        <div className="mb-2 flex h-20 w-64 min-w-0 items-center justify-center">
                          <img
                            src="/logo.jpeg"
                            alt="Details Consulting Engineers"
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      </div>
                      <div className="text-left mt-2">
                        <h3 className="text-lg font-black text-[#123f59] mb-3 tracking-tighter">
                          عرض سعر خدمات
                        </h3>
                        <div className="text-[10px] font-bold text-[#475569] space-y-1.5">
                          <p className="flex min-w-0 justify-between gap-3">
                            <span>التاريخ:</span>
                            <span>
                              {format(
                                new Date(fullQuoteData.issueDate),
                                "yyyy-MM-dd",
                                { locale: arSA },
                              )}
                            </span>
                          </p>
                          <p className="flex min-w-0 justify-between gap-3">
                            <span>المرجع:</span>
                            <span className="font-mono text-[#123f59]">
                              {fullQuoteData.number}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* بيانات العميل */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-[13px] font-black text-[#123f59]">
                          السادة /
                        </span>
                        <span className="text-[13px] font-black text-blue-800">
                          {getClientName(fullQuoteData.client)}
                        </span>
                      </div>
                      <p className="text-[13px] font-black text-[#123f59] mb-3">
                        المحترم
                      </p>
                      <p className="text-[12px] font-black text-[#123f59] mb-3">
                        السلام عليكم ورحمة الله وبركاته ،،،،
                      </p>
                      <div className="text-[12px] leading-[2] text-[#475569] text-justify whitespace-pre-wrap">
                        {fullQuoteData.terms ||
                          "إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات هندسية، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة على أن يكون نطاق العمل كما يلي:"}
                      </div>
                    </div>

                    {/* جدول البنود */}
                    <div className="mb-3">
                      <table className="w-full border-collapse border-2 border-[#123f59] text-[10px] text-center shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
                        <thead className="bg-blue-900 text-white font-black">
                          <tr>
                            <th className="border border-[#123f59] p-2.5 w-8">
                              م
                            </th>
                            <th className="border border-[#123f59] p-2.5 text-right">
                              الوصـف
                            </th>
                            <th className="border border-[#123f59] p-2.5 w-14">
                              الكمية
                            </th>
                            <th className="border border-[#123f59] p-2.5 w-20">
                              سعر الوحدة
                            </th>
                            <th className="border border-[#123f59] p-2.5 w-24">
                              الإجمالي
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-[#123f59] font-bold">
                          {(fullQuoteData.items || []).map((item, idx) => (
                            <tr
                              key={idx}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                              }
                            >
                              <td className="border border-blue-100 p-2 font-mono text-[#94a3b8]">
                                {idx + 1}
                              </td>
                              <td className="border border-blue-100 p-2 text-right">
                                {item.title}
                              </td>
                              <td className="border border-blue-100 p-2 font-mono">
                                {item.quantity}
                              </td>
                              <td className="border border-blue-100 p-2 font-mono">
                                {formatCurrency(item.unitPrice)}
                              </td>
                              <td className="border border-blue-100 p-2 font-mono text-[#123f59]">
                                {formatCurrency(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-50/50">
                            <td
                              colSpan="4"
                              className="border border-[#123f59] p-2 text-left font-black text-[#123f59]"
                            >
                              المجموع الفرعي
                            </td>
                            <td className="border border-[#123f59] p-2 font-black font-mono text-[#123f59]">
                              {formatCurrency(fullQuoteData.subtotal)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan="4"
                              className="border border-[#123f59] p-2 text-left font-bold text-[#64748b]"
                            >
                              ضريبة القيمة المضافة (
                              {fullQuoteData.taxRate * 100}%)
                            </td>
                            <td className="border border-[#123f59] p-2 font-bold font-mono text-[#64748b]">
                              {formatCurrency(fullQuoteData.taxAmount)}
                            </td>
                          </tr>
                          <tr className="bg-blue-900 text-white">
                            <td
                              colSpan="4"
                              className="border border-[#123f59] p-2.5 text-left font-black text-[12px]"
                            >
                              الإجمالي الشامل
                            </td>
                            <td className="border border-[#123f59] p-2.5 font-black font-mono text-[12px]">
                              {formatCurrency(fullQuoteData.total)} ر.س
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* التوقيعات والختم */}
                    <div className="mt-auto pt-12">
                      <div className="grid grid-cols-2 gap-12 text-center">
                        <div className="space-y-12">
                          <p className="text-[11px] font-black text-[#123f59]">
                            توقيع العميل بالموافقة
                          </p>
                          <div className="border-b-2 border-[#d8b46a]/25 w-48 mx-auto border-dashed"></div>
                        </div>

                        <div className="space-y-12 relative flex flex-col items-center">
                          <p className="text-[11px] font-black text-[#123f59] z-20 bg-white px-2">
                            الاعتماد والختم الرسمي
                          </p>
                          <div className="border-b-2 border-[#d8b46a]/25 w-48 mx-auto border-dashed relative z-10 hidden"></div>

                          <div className="absolute top-4 flex flex-col items-center justify-center w-full z-[10000] pointer-events-none opacity-90">
                            <OfficialStamp
                              code={fullQuoteData.number}
                              color="#0e2a47"
                              width={320}
                              rotation={-2}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* الفوتر الرسمي */}
                    <DetailsPrintFooter accentColor="#0f5570" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* أنماط الطباعة */}
      {/* ========================================== */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        
        @media print {
          @page { 
            size: A4; 
            margin: 0; 
          }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          body * { 
            visibility: hidden !important; 
          }
          .print-area, 
          .print-area * { 
            visibility: visible !important; 
          }
          .print-area { 
            position: absolute !important; 
            left: 0 !important; 
            top: 0 !important; 
            width: 210mm !important; 
            height: 297mm !important;
            margin: 0 !important; 
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-area .absolute {
            position: absolute !important;
          }
        }
      `}</style>
    </div>
  );
};

export default React.memo(QuotationsDirectory);