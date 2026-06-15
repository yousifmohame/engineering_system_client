import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";
import {
  ClipboardCheck,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Ban,
  FileText,
  Loader2,
  X,
  User,
  MapPin,
  Landmark,
} from "lucide-react";

// استيراد دالة معالجة الروابط لفتح الـ PDF
import { getFullUrl } from "../../../utils/urlUtils";

const formatCurrency = (value) => Number(value || 0).toLocaleString("ar-SA");

// ==========================================
// 1. المكون الفرعي: نافذة المراجعة والاعتماد (Review Modal)
// ==========================================
const QuotationReviewModal = ({ quoteId, onClose }) => {
  const queryClient = useQueryClient();

  // جلب تفاصيل العرض
  const { data: quote, isLoading } = useQuery({
    queryKey: ["quotation-review", quoteId],
    queryFn: async () => (await axios.get(`/quotations/${quoteId}`)).data.data,
    enabled: !!quoteId,
  });

  // دالة الإجراءات (اعتماد، رفض، إلغاء)
  const actionMutation = useMutation({
    mutationFn: async ({ actionType, payload }) => {
      // تحديث حالة العرض في قاعدة البيانات
      const res = await axios.put(`/quotations/${quoteId}`, payload);

      // 🌟 إذا كان الإجراء "اعتماد"، نطلب من السيرفر إعادة توليد الـ PDF
      // ليتم إضافة الـ QR Code والتوقيعات والأختام النهائية
      if (actionType === "APPROVE") {
        await axios.post("/quotations/generate-and-save-pdf", {
          ...res.data.data,
          quotationId: quoteId,
        });
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      let msg = "تم تحديث حالة العرض";
      if (variables.actionType === "APPROVE")
        msg = "تم اعتماد العرض، وإضافة الختم والـ QR بنجاح!";
      if (variables.actionType === "REJECT")
        msg = "تم رفض العرض وإعادته للموظف.";
      if (variables.actionType === "CANCEL") msg = "تم إلغاء العرض نهائياً.";

      toast.success(msg);
      queryClient.invalidateQueries(["supervisor-quotations"]);
      queryClient.invalidateQueries(["quotations-stats"]);
      onClose();
    },
    onError: () => toast.error("حدث خطأ أثناء تنفيذ الإجراء"),
  });

  if (!quoteId) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-cairo animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-7xl h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-[#e2bf74]/30 text-[#e2bf74]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black flex items-center gap-2">
                مراجعة واعتماد عرض السعر
                {quote && (
                  <span className="bg-[#e2bf74] text-[#06111d] px-2 py-0.5 rounded text-[10px]">
                    {quote.number}
                  </span>
                )}
              </h2>
              <p className="text-[10px] text-white/60 font-bold mt-0.5">
                شاشة التدقيق للإدارة وإضافة الأختام الرسمية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-rose-500/20 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !quote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#123f59]" />
            <span className="text-xs font-bold">جاري تحميل وثيقة العرض...</span>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 overflow-hidden bg-[#fbf8f1]/50">
            {/* القائمة اليمنى: التفاصيل والإجراءات */}
            <div className="w-[350px] shrink-0 border-l border-slate-200 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-slim space-y-4">
                {/* معلومات العميل */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 mb-2">
                    معلومات الارتباط
                  </div>
                  <div className="space-y-2.5 text-xs font-bold text-[#123f59]">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-500" />{" "}
                      {quote.client?.name?.ar ||
                        quote.client?.name ||
                        "غير محدد"}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />{" "}
                      {quote.ownership?.code || "بدون ملكية"}
                    </div>
                    <div className="flex items-center gap-2">
                      <Landmark className="w-3.5 h-3.5 text-amber-500" /> نموذج:{" "}
                      {quote.templateType}
                    </div>
                  </div>
                </div>

                {/* الملخص المالي */}
                <div className="p-3 bg-gradient-to-br from-[#eef7f6] to-white rounded-xl border border-emerald-100">
                  <div className="text-[10px] font-black text-emerald-600 mb-2">
                    الملخص المالي
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>الإجمالي (بدون ضريبة):</span>{" "}
                      <span className="font-mono font-bold">
                        {formatCurrency(quote.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>الضريبة المضافة:</span>{" "}
                      <span className="font-mono font-bold">
                        {formatCurrency(quote.taxAmount)}
                      </span>
                    </div>
                    <div className="h-px w-full bg-emerald-100 my-1"></div>
                    <div className="flex justify-between text-sm font-black text-[#0f766e]">
                      <span>الإجمالي المستحق:</span>{" "}
                      <span className="font-mono">
                        {formatCurrency(quote.total)} ر.س
                      </span>
                    </div>
                  </div>
                </div>

                {/* الدفعات */}
                {quote.payments?.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] font-black text-slate-400 mb-2">
                      جدولة الدفعات
                    </div>
                    <div className="space-y-1.5">
                      {quote.payments.map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center text-[11px] bg-slate-50 p-1.5 rounded-lg border border-slate-100"
                        >
                          <span className="font-bold text-slate-600">
                            دفعة {p.installmentNumber} ({p.percentage}%)
                          </span>
                          <span className="font-mono font-bold text-[#123f59]">
                            {formatCurrency(p.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* أزرار الإجراءات السفلية */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0">
                <button
                  disabled={actionMutation.isPending}
                  onClick={() =>
                    actionMutation.mutate({
                      actionType: "APPROVE",
                      // نحدث الحالة إلى APPROVED ونطلب إضافة الختم الأمني SECURE_QR
                      payload: { status: "APPROVED", stampType: "SECURE_QR" },
                    })
                  }
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                >
                  {actionMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  اعتماد، إضافة QR، وإصدار العرض
                </button>

                <div className="flex gap-2">
                  <button
                    disabled={actionMutation.isPending}
                    onClick={() =>
                      actionMutation.mutate({
                        actionType: "REJECT",
                        payload: { status: "REJECTED" },
                      })
                    }
                    className="flex-1 flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 rounded-xl text-[11px] font-black transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" /> رفض وإعادة
                  </button>
                  <button
                    disabled={actionMutation.isPending}
                    onClick={() => {
                      if (
                        window.confirm(
                          "هل أنت متأكد من إلغاء هذا العرض نهائياً؟",
                        )
                      )
                        actionMutation.mutate({
                          actionType: "CANCEL",
                          payload: { status: "CANCELLED" },
                        });
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 py-2 rounded-xl text-[11px] font-black transition-colors disabled:opacity-50"
                  >
                    <Ban className="w-3.5 h-3.5" /> إلغاء نهائي
                  </button>
                </div>
              </div>
            </div>

            {/* القسم الأيسر: مستعرض الـ PDF */}
            <div className="flex-1 bg-slate-200/50 p-4 flex flex-col relative">
              {quote.pdfUrl ? (
                <iframe
                  src={`${getFullUrl(quote.pdfUrl)}#toolbar=0`}
                  className="w-full h-full rounded-xl shadow-lg border border-slate-300 bg-white"
                  title="PDF Preview"
                />
              ) : (
                <div className="w-full h-full rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400">
                  <FileText className="w-12 h-12 mb-3 opacity-20" />
                  <span className="text-sm font-bold">
                    لم يتم توليد ملف PDF بعد
                  </span>
                  <span className="text-xs mt-1">
                    سيتم توليد الملف تلقائياً عند الاعتماد
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 2. الشاشة الرئيسية: جدول طلبات المراجعة
// ==========================================
export default function QuotationsSupervisorScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewQuoteId, setReviewQuoteId] = useState(null);

  // جلب العروض التي حالتها مسودة أو تحت المراجعة فقط
  const {
    data: quotations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["supervisor-quotations"],
    queryFn: async () => {
      const res = await axios.get("/quotations");
      // تصفية البيانات في الواجهة (أو يمكنك تمرير بارامتر للسيرفر)
      return res.data.data.filter(
        (q) => q.status === "DRAFT" || q.status === "PENDING_APPROVAL",
      );
    },
    refetchInterval: 30000, // تحديث تلقائي كل 30 ثانية
  });

  const filteredData = useMemo(() => {
    if (!quotations) return [];
    const term = searchTerm.toLowerCase();
    return quotations.filter(
      (q) =>
        !searchTerm ||
        q.number?.toLowerCase().includes(term) ||
        q.client?.name?.toLowerCase().includes(term),
    );
  }, [quotations, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-transparent p-4" dir="rtl">
      {/* استدعاء نافذة المراجعة إذا تم تحديد عرض */}
      <QuotationReviewModal
        quoteId={reviewQuoteId}
        onClose={() => setReviewQuoteId(null)}
      />

      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-lg font-black text-[#123f59] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#c5983c]" />
            طلبات الاعتماد والمراجعة
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            العروض المعروضة هنا هي المسودات والطلبات التي تنتظر اعتمادك للبدء
            الفعلي.
          </p>
        </div>

        <div className="relative w-72">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="بحث برقم العرض أو اسم العميل..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#123f59] focus:ring-1 focus:ring-[#123f59] transition-all bg-white shadow-sm"
          />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar-slim">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center text-rose-500 font-bold text-xs">
              حدث خطأ في جلب البيانات
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col h-full items-center justify-center text-slate-400 gap-2">
              <CheckCircle className="w-12 h-12 opacity-20 text-emerald-500" />
              <span className="text-sm font-bold">صندوق المراجعة فارغ!</span>
              <span className="text-xs">
                لا توجد عروض أسعار بانتظار اعتمادك حالياً.
              </span>
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                    رقم العرض
                  </th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                    تاريخ الإنشاء
                  </th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                    العميل
                  </th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                    الحالة
                  </th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">
                    الإجمالي
                  </th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200 text-center">
                    إجراء
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((q) => (
                  <tr
                    key={q.id}
                    className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="p-3 font-mono text-xs font-bold text-[#123f59]">
                      {q.number}
                    </td>
                    <td className="p-3 text-xs text-slate-500 font-mono">
                      {format(new Date(q.createdAt), "yyyy-MM-dd", {
                        locale: arSA,
                      })}
                    </td>
                    <td className="p-3 text-xs font-bold text-slate-700">
                      {q.client?.name?.ar || q.client?.name || "—"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                          q.status === "DRAFT"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {q.status === "DRAFT" ? "مسودة" : "بانتظار المراجعة"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs font-bold text-emerald-600">
                      {formatCurrency(q.total)} ر.س
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setReviewQuoteId(q.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#123f59] text-white rounded-lg text-[10px] font-black hover:bg-[#0e7490] transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> مراجعة واتخاذ قرار
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
