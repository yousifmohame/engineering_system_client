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

// ==========================================
// ثوابت التطبيق
// ==========================================
const STATUS_CONFIG = {
  DRAFT: { label: "مسودة", bg: "bg-slate-100", text: "text-slate-500" },
  PENDING_APPROVAL: {
    label: "تحت المراجعة",
    bg: "bg-blue-100",
    text: "text-blue-700",
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
    text: "text-emerald-700",
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
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${current.bg} ${current.text}`}
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

// ==========================================
// المكون الرئيسي: دليل العروض
// ==========================================
const QuotationsDirectory = () => {
  const queryClient = useQueryClient();
  const { addTab } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

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
    staleTime: 5 * 60 * 1000, // 5 دقائق
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

  // فتح شاشة التعديل/المعاينة
  const handleEditQuotation = useCallback(
    (e, quote) => {
      e.stopPropagation();
      addTab(SCREEN_ID, {
        id: `EDIT-QUOTATION-${quote.id}`,
        title: `تعديل عرض ${quote.number}`,
        type: "create-quotation",
        closable: true,
        props: { quotationId: quote.id },
      });
    },
    [addTab],
  );

  // فتح نافذة الطباعة
  const handleOpenPrint = useCallback((e, id) => {
    e.stopPropagation();
    setSelectedQuoteId(id);
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

  // الفلترة - باستخدام useMemo للأداء
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

  // ==========================================
  // عرض التحميل أو الخطأ
  // ==========================================
  if (listError) {
    return (
      <div
        className="flex h-full items-center justify-center bg-slate-50"
        dir="rtl"
      >
        <div className="text-center p-6">
          <div className="text-red-500 font-bold mb-2">
            ⚠️ حدث خطأ في تحميل البيانات
          </div>
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["quotations-list"] })
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50 font-sans relative" dir="rtl">
      {/* ========================================== */}
      {/* الجدول الرئيسي */}
      {/* ========================================== */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 w-full">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            دليل عروض الأسعار
            <span className="text-xs text-slate-500 font-normal">
              ({filteredData.length} من {quotationsData?.length || 0})
            </span>
          </div>
        </div>

        {/* شريط البحث */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث ذكي: اسم العميل، الكود، آخر 4 أرقام..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pr-9 pl-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
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
              className={`px-3 py-1 rounded-md text-[10px] font-bold border transition-all ${
                filterStatus === key
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
              }`}
            >
              {label} (
              {key === "ALL" ? filteredData.length : getStatusCount(key)})
            </button>
          ))}
        </div>

        {/* جدول البيانات */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[300px]">
            {isListLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-blue-600" />
                <span className="text-xs">جاري التحميل...</span>
              </div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="p-2 text-[10px] text-slate-500 font-bold w-10">
                      #
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      رقم العرض
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      التاريخ
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      العميل
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الملكية
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الإجمالي
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الحالة
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((q, idx) => (
                    <tr
                      key={q.id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                      onClick={(e) => handleEditQuotation(e, q)}
                    >
                      <td className="p-2 text-[10px] text-slate-400 font-mono">
                        {idx + 1}
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[11px] font-bold text-blue-600">
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
                        <div className="font-bold text-[11px] text-slate-700">
                          {getClientName(q.client)}
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="font-mono text-[10px] text-emerald-600 font-bold">
                          {q.ownership?.code || "—"}
                        </span>
                      </td>
                      <td className="p-2 text-[11px] font-bold text-blue-700 font-mono">
                        {formatCurrency(q.total)} ر.س
                      </td>
                      <td className="p-2">
                        <StatusBadge status={q.status} />
                      </td>
                      <td className="p-2">
                        <div
                          className="flex items-center justify-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* زر التعديل */}
                          <button
                            onClick={(e) => handleEditQuotation(e, q)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="تعديل ومعاينة"
                            aria-label="تعديل العرض"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* زر الطباعة */}
                          <button
                            onClick={(e) => handleOpenPrint(e, q.id)}
                            className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
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
                        className="p-8 text-center text-slate-400 text-xs"
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
          className="fixed inset-0 bg-slate-900/80 z-[2000] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={handleClosePrint}
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-modal-title"
        >
          <div
            className="bg-slate-200 rounded-2xl w-full max-w-[1000px] h-[95vh] flex flex-col shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* شريط الأدوات */}
            <div className="shrink-0 z-50 w-full flex justify-between items-center bg-white px-6 py-3 shadow-sm border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Printer className="w-5 h-5 text-blue-600" />
                <div>
                  <h3
                    id="print-modal-title"
                    className="text-sm font-black text-slate-800"
                  >
                    تصدير وطباعة عرض السعر
                  </h3>
                  {isDetailLoading ? (
                    <span className="text-[10px] text-orange-500 animate-pulse font-bold">
                      جاري جلب البنود والماليات...
                    </span>
                  ) : (
                    <p className="text-[10px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded mt-0.5 inline-block">
                      {fullQuoteData?.number}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrint()}
                  disabled={isDetailLoading || !fullQuoteData}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="w-4 h-4" /> طباعة فورية
                </button>
                <div className="w-px h-6 bg-slate-200"></div>
                <button
                  onClick={handleClosePrint}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* مساحة عرض الورقة */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex justify-center py-8">
              {isDetailLoading || !fullQuoteData ? (
                <div className="m-auto flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                  <p className="text-slate-500 font-bold">
                    جاري تجهيز بيانات العرض والختم...
                  </p>
                </div>
              ) : (
                <div
                  ref={printComponentRef}
                  className="bg-white shadow-xl relative border border-slate-300 print-area"
                  style={{
                    width: "210mm",
                    minHeight: "297mm",
                    paddingBottom: "50mm",
                  }}
                  dir="rtl"
                >
                  <div className="p-[15mm] relative z-10 flex flex-col h-full">
                    {/* الترويسة */}
                    <div className="flex justify-between items-start border-b-4 border-blue-900 pb-6 mb-8">
                      <div className="flex flex-col items-center">
                        <div className="w-32 h-12 flex items-center justify-center mb-2">
                          <img
                            src="/logo.jpeg"
                            alt="شعار بلاك كيوب"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <h1 className="font-black text-[13px] text-blue-900">
                          بلاك كيوب للإستشارات الهندسية
                        </h1>
                        <h2 className="text-[8px] text-slate-500 uppercase tracking-widest mt-0.5">
                          Black Cube Engineering
                        </h2>
                      </div>
                      <div className="text-left mt-2">
                        <h3 className="text-2xl font-black text-blue-900 mb-3 tracking-tighter">
                          عرض سعر خدمات
                        </h3>
                        <div className="text-[10px] font-bold text-slate-700 space-y-1.5">
                          <p className="flex justify-between gap-6">
                            <span>التاريخ:</span>
                            <span>
                              {format(
                                new Date(fullQuoteData.issueDate),
                                "yyyy-MM-dd",
                                { locale: arSA },
                              )}
                            </span>
                          </p>
                          <p className="flex justify-between gap-6">
                            <span>المرجع:</span>
                            <span className="font-mono text-blue-700">
                              {fullQuoteData.number}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* بيانات العميل */}
                    <div className="mb-8">
                      <div className="flex items-baseline gap-1 mb-1">
                        <span className="text-[13px] font-black text-slate-900">
                          السادة /
                        </span>
                        <span className="text-[13px] font-black text-blue-800">
                          {getClientName(fullQuoteData.client)}
                        </span>
                      </div>
                      <p className="text-[13px] font-black text-slate-900 mb-4">
                        المحترم
                      </p>
                      <p className="text-[12px] font-black text-slate-900 mb-4">
                        السلام عليكم ورحمة الله وبركاته ،،،،
                      </p>
                      <div className="text-[12px] leading-[2] text-slate-700 text-justify whitespace-pre-wrap">
                        {fullQuoteData.terms ||
                          "إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات هندسية، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة على أن يكون نطاق العمل كما يلي:"}
                      </div>
                    </div>

                    {/* جدول البنود */}
                    <div className="mb-6">
                      <table className="w-full border-collapse border-2 border-blue-900 text-[10px] text-center shadow-sm">
                        <thead className="bg-blue-900 text-white font-black">
                          <tr>
                            <th className="border border-blue-900 p-2.5 w-8">
                              م
                            </th>
                            <th className="border border-blue-900 p-2.5 text-right">
                              الوصـف
                            </th>
                            <th className="border border-blue-900 p-2.5 w-14">
                              الكمية
                            </th>
                            <th className="border border-blue-900 p-2.5 w-20">
                              سعر الوحدة
                            </th>
                            <th className="border border-blue-900 p-2.5 w-24">
                              الإجمالي
                            </th>
                          </tr>
                        </thead>
                        <tbody className="text-slate-800 font-bold">
                          {(fullQuoteData.items || []).map((item, idx) => (
                            <tr
                              key={idx}
                              className={
                                idx % 2 === 0 ? "bg-white" : "bg-blue-50/30"
                              }
                            >
                              <td className="border border-blue-100 p-2 font-mono text-slate-400">
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
                              <td className="border border-blue-100 p-2 font-mono text-blue-900">
                                {formatCurrency(item.subtotal)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-blue-50/50">
                            <td
                              colSpan="4"
                              className="border border-blue-900 p-2 text-left font-black text-blue-900"
                            >
                              المجموع الفرعي
                            </td>
                            <td className="border border-blue-900 p-2 font-black font-mono text-blue-900">
                              {formatCurrency(fullQuoteData.subtotal)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan="4"
                              className="border border-blue-900 p-2 text-left font-bold text-slate-600"
                            >
                              ضريبة القيمة المضافة (
                              {fullQuoteData.taxRate * 100}%)
                            </td>
                            <td className="border border-blue-900 p-2 font-bold font-mono text-slate-600">
                              {formatCurrency(fullQuoteData.taxAmount)}
                            </td>
                          </tr>
                          <tr className="bg-blue-900 text-white">
                            <td
                              colSpan="4"
                              className="border border-blue-900 p-2.5 text-left font-black text-[12px]"
                            >
                              الإجمالي الشامل
                            </td>
                            <td className="border border-blue-900 p-2.5 font-black font-mono text-[12px]">
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
                          <p className="text-[11px] font-black text-blue-900">
                            توقيع العميل بالموافقة
                          </p>
                          <div className="border-b-2 border-slate-300 w-48 mx-auto border-dashed"></div>
                        </div>

                        <div className="space-y-12 relative flex flex-col items-center">
                          <p className="text-[11px] font-black text-blue-900 z-20 bg-white px-2">
                            الاعتماد والختم الرسمي
                          </p>
                          <div className="border-b-2 border-slate-300 w-48 mx-auto border-dashed relative z-10 hidden"></div>

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

                    {/* الفوتر */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white px-[15mm] pb-[10mm] pt-4">
                      <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-500 font-sans print:border-slate-300 break-inside-avoid">
                        <div className="flex flex-col gap-1 w-1/3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 tracking-tight">
                              الرقم المرجعي:
                            </span>
                            <span className="font-mono text-xs">
                              {fullQuoteData.number}
                            </span>
                          </div>
                          <p className="leading-relaxed opacity-75 max-w-xs">
                            جميع الأسعار خاضعة لضريبة القيمة المضافة حسب الأنظمة
                            المتبعة.
                          </p>
                        </div>

                        {/* باركود */}
                        <div className="flex flex-col items-center gap-1 w-1/3">
                          <div className="h-10 mb-1 w-[135px] flex items-center justify-center opacity-80">
                            <div className="w-full h-[35px] bg-[repeating-linear-gradient(90deg,#000_0,#000_2px,transparent_0,transparent_4px,transparent_6px,#000_6px,#000_8px,transparent_8px,transparent_10px)]"></div>
                          </div>
                          <span className="font-mono text-[9px] tracking-[0.2em]">
                            {fullQuoteData.number}
                          </span>
                        </div>

                        {/* QR */}
                        <div className="flex justify-end gap-6 items-end w-1/3">
                          <div className="bg-white p-1 border border-slate-100 rounded shadow-sm">
                            <svg
                              height="60"
                              width="60"
                              viewBox="0 0 21 21"
                              aria-hidden="true"
                            >
                              <path
                                fill="#FFFFFF"
                                d="M0,0 h21v21H0z"
                                shapeRendering="crispEdges"
                              ></path>
                              <path
                                fill="#000000"
                                d="M0 0h7v1H0zM9 0h1v1H9zM11 0h2v1H11zM14,0 h7v1H14zM0 1h1v1H0zM6 1h1v1H6zM8 1h2v1H8zM14 1h1v1H14zM20,1 h1v1H20zM0 2h1v1H0zM2 2h3v1H2zM6 2h1v1H6zM8 2h1v1H8zM10 2h1v1H10zM12 2h1v1H12zM14 2h1v1H14zM16 2h3v1H16zM20,2 h1v1H20zM0 3h1v1H0zM2 3h3v1H2zM6 3h1v1H6zM8 3h2v1H8zM12 3h1v1H12zM14 3h1v1H14zM16 3h3v1H16zM20,3 h1v1H20zM0 4h1v1H0zM2 4h3v1H2zM6 4h1v1H6zM8 4h1v1H8zM11 4h1v1H11zM14 4h1v1H14zM16 4h3v1H16zM20,4 h1v1H20zM0 5h1v1H0zM6 5h1v1H6zM8 5h5v1H8zM14 5h1v1H14zM20,5 h1v1H20zM0 6h7v1H0zM8 6h1v1H8zM10 6h1v1H10zM12 6h1v1H12zM14,6 h7v1H14zM9 7h1v1H9zM12 7h1v1H12zM2 8h1v1H2zM5 8h7v1H5zM13 8h1v1H13zM15 8h5v1H15zM0 9h2v1H0zM3 9h3v1H3zM7 9h1v1H7zM9 9h3v1H9zM18,9 h3v1H18zM0 10h4v1H0zM5 10h2v1H5zM8 10h2v1H8zM11 10h3v1H11zM17 10h3v1H17zM0 11h2v1H0zM3 11h3v1H3zM7 11h1v1H7zM9 11h4v1H9zM16 11h1v1H16zM19,11 h2v1H19zM0 12h3v1H0zM4 12h4v1H4zM9 12h2v1H9zM12 12h3v1H12zM19 12h1v1H19zM8 13h3v1H8zM13 13h1v1H13zM15 13h1v1H15zM0 14h7v1H0zM8 14h1v1H8zM10 14h1v1H10zM12 14h1v1H12zM15 14h2v1H15zM0 15h1v1H0zM6 15h1v1H6zM8 15h3v1H8zM15 15h1v1H15zM20,15 h1v1H20zM0 16h1v1H0zM2 16h3v1H2zM6 16h1v1H6zM10 16h1v1H10zM14,16 h7v1H14zM0 17h1v1H0zM2 17h3v1H2zM6 17h1v1H6zM12 17h3v1H12zM0 18h1v1H0zM2 18h3v1H2zM6 18h1v1H6zM8 18h1v1H8zM11 18h2v1H11zM14 18h1v1H14zM17,18 h4v1H17zM0 19h1v1H0zM6 19h1v1H6zM10 19h2v1H10zM16 19h1v1H16zM20,19 h1v1H20zM0 20h7v1H0zM12 20h1v1H12zM14 20h1v1H14zM17,20 h4v1H17z"
                                shapeRendering="crispEdges"
                              ></path>
                            </svg>
                          </div>
                          <div className="text-left font-black text-slate-900 border-r-2 border-slate-900 pr-4 h-full flex flex-col justify-center">
                            <div className="text-xs uppercase tracking-widest text-slate-400 mb-0.5">
                              Page
                            </div>
                            <div className="text-lg leading-none print:hidden">
                              1 <span className="text-slate-300 mx-1">/</span> 1
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* معلومات الاتصال */}
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500 font-bold gap-2">
                      <div className="flex gap-4 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" /> 0547267500
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> info@blackcube.sa
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3" /> www.blackcube.sa
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100/50">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="uppercase tracking-widest text-[8px] font-black">
                          Secure Digital Original
                        </span>
                      </div>
                    </div>
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
