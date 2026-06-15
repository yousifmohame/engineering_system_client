import React, { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  FileText,
  Search,
  Eye,
  Printer,
  Loader2,
  Trash2,
  Edit3,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";

// استيراد متجر التابات لفتح شاشة التعديل أو الإنشاء
import { useAppStore } from "../../stores/useAppStore";
import AccessControl from "../../components/AccessControl";
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

const QuotationsDirectory = () => {
  const queryClient = useQueryClient();
  const { addTab } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState(null);

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

  // فتح عرض سعر جديد
  const handleCreateNew = useCallback(() => {
    addTab(SCREEN_ID, {
      id: `CREATE-QUOTATION-${Date.now()}`,
      title: "إنشاء عرض سعر",
      type: "create-quotation",
      closable: true,
    });
  }, [addTab]);

  // التعديل
  const handleEditQuotation = useCallback(
    (e, quote) => {
      e?.stopPropagation();
      setIsDetailsModalOpen(false);
      addTab(SCREEN_ID, {
        id: `EDIT-QUOTATION-${quote.id}`,
        title: `تعديل عرض ${quote.number}`,
        type: "create-quotation",
        closable: true,
        quotationId: quote.id,
        data: { quotationId: quote.id },
        props: { quotationId: quote.id },
      });
    },
    [addTab],
  );

  // فتح التفاصيل السريعة
  const handleViewDetails = useCallback((e, id) => {
    e?.stopPropagation();
    setSelectedQuoteId(id);
    setIsDetailsModalOpen(true);
  }, []);

  // 🚀 الطباعة عبر الباك إند (Live Preview API)
  const handlePrint = async (e, quoteId, quoteNumber) => {
    e?.stopPropagation();
    setGeneratingPdfId(quoteId);
    const loadingToast = toast.loading("جاري معالجة وتجهيز الوثيقة للطباعة...");

    try {
      // 1. جلب بيانات العرض كاملة لتهيئة الـ Payload للطباعة
      const { data: quoteResponse } = await axios.get(`/quotations/${quoteId}`);
      const quoteData = quoteResponse.data;

      // 2. إرسال الطلب لتوليد الـ PDF في الباك إند
      const response = await axios.post("/quotations/generate-pdf", quoteData, {
        responseType: "blob",
      });

      // 3. معالجة الـ Blob وفتحه / تحميله
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // فتح في نافذة جديدة
      window.open(url, "_blank");

      // إنشاء خيار التحميل
      const link = document.createElement("a");
      link.href = url;
      link.download = `عرض_سعر_${quoteNumber || quoteId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

      toast.success("تم تجهيز الوثيقة بنجاح", { id: loadingToast });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast.error("حدث خطأ أثناء معالجة الوثيقة. يرجى المحاولة مرة أخرى.", { id: loadingToast });
    } finally {
      setGeneratingPdfId(null);
    }
  };

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
      <div className="flex h-full min-h-0 items-center justify-center bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white" dir="rtl">
        <div className="text-center p-3">
          <div className="text-red-500 font-bold mb-2">
            ⚠️ حدث خطأ في تحميل البيانات
          </div>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["quotations-list"] })}
            className="px-4 py-2 bg-[#123f59] text-white rounded-xl text-sm hover:bg-[#0f3448]"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] relative" dir="rtl">
      
      {/* مودال التفاصيل */}
      <QuotationDetailsModal 
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        quotationId={selectedQuoteId}
        onPrint={(id) => {
          const q = quotationsData?.find(x => x.id === id);
          handlePrint(null, id, q?.number);
        }}
        onEdit={(quote) => handleEditQuotation(null, quote)}
      />

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

          {/* 🌟 زر الإضافة الجديد */}
          <AccessControl
            code="QUOTE_ACTION_CREATE"
            name="إنشاء عرض سعر"
            moduleName="عروض الأسعار"
            tabName="الجدول"
          >
            <button
              onClick={handleCreateNew}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#123f59] to-[#0f3448] text-white rounded-xl font-black text-xs hover:shadow-[0_8px_18px_rgba(18,63,89,0.15)] hover:-translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4" />
              عرض سعر جديد
            </button>
          </AccessControl>
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
                    <th className="p-2 text-[10px] text-[#64748b] font-bold w-10">#</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">رقم العرض</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">التاريخ</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">العميل</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">الملكية</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">الإجمالي</th>
                    {/* 🌟 عمود التحصيل والنسب المضافة حديثاً */}
                    <th className="p-2 text-[10px] text-[#64748b] font-bold text-center w-32">نسبة التحصيل</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold">الحالة</th>
                    <th className="p-2 text-[10px] text-[#64748b] font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((q, idx) => {
                    // 🌟 الحسابات لنسبة السداد
                    const total = q.total || 0;
                    const paid = q.paidAmount || 0; // تأكد أن الباك إند يرسل paidAmount
                    const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;
                    const remPct = 100 - paidPct;

                    return (
                      <tr
                        key={q.id}
                        className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1] transition-colors cursor-pointer"
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
                        
                        {/* 🌟 عرض نسبة التحصيل بـ Progress Bar */}
                        <td className="p-2 text-center align-middle">
                          <div className="flex flex-col gap-1.5 w-24 mx-auto">
                            <div className="flex justify-between text-[8px] font-black">
                              <span className="text-emerald-600">{paidPct}% مسدد</span>
                              <span className="text-rose-600">{remPct}% متبقي</span>
                            </div>
                            <div className="w-full h-1.5 bg-rose-100 rounded-full overflow-hidden flex">
                              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${paidPct}%` }}></div>
                            </div>
                          </div>
                        </td>

                        <td className="p-2">
                          <StatusBadge status={q.status} />
                        </td>
                        <td className="p-2">
                          <div
                            className="flex min-w-0 items-center justify-center gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={(e) => handleEditQuotation(e, q)}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                              title="تعديل في معالج العروض"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={(e) => handleViewDetails(e, q.id)}
                              className="p-1.5 bg-slate-100 text-[#123f59] rounded hover:bg-slate-200 transition-colors"
                              title="استعراض التفاصيل"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* 🚀 الزر المحدث للطباعة باستخدام Endpoint الباك إند */}
                            <button
                              onClick={(e) => handlePrint(e, q.id, q.number)}
                              disabled={generatingPdfId === q.id}
                              className="p-1.5 bg-emerald-50 text-[#0f766e] rounded hover:bg-emerald-100 transition-colors disabled:opacity-50"
                              title="تصدير وطباعة"
                            >
                              {generatingPdfId === q.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Printer className="w-3.5 h-3.5" />
                              )}
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
                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors disabled:opacity-50"
                                title="حذف"
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
                    );
                  })}
                  {filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan="9"
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
    </div>
  );
};

export default React.memo(QuotationsDirectory);