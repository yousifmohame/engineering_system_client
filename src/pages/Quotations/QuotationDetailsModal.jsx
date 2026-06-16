import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios";
import {
  X,
  Loader2,
  FileText,
  UserCheck,
  Building,
  Calendar,
  DollarSign,
  ListChecks,
  ShieldCheck,
  Printer,
  Edit3,
  AlertTriangle,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

const STATUS_CONFIG = {
  DRAFT: { label: "مسودة", bg: "bg-slate-100", text: "text-slate-600" },
  PENDING_APPROVAL: {
    label: "تحت المراجعة",
    bg: "bg-blue-100",
    text: "text-blue-700",
  },
  NEEDS_MODIFICATION: {
    label: "مُعاد للتعديل",
    bg: "bg-orange-100",
    text: "text-orange-700",
  },
  REJECTED: { label: "مرفوض", bg: "bg-rose-100", text: "text-rose-700" },
  APPROVED: {
    label: "معتمد (جاهز)",
    bg: "bg-emerald-100",
    text: "text-emerald-700",
  },
  SENT: { label: "مُرسل للعميل", bg: "bg-cyan-100", text: "text-cyan-700" },
  ACCEPTED: {
    label: "مقبول ومسدد بالكامل",
    bg: "bg-green-100",
    text: "text-green-700",
  },
  PARTIALLY_PAID: {
    label: "مسدد جزئياً",
    bg: "bg-lime-100",
    text: "text-lime-700",
  },
  EXPIRED: { label: "منتهي", bg: "bg-gray-100", text: "text-gray-500" },
  CANCELLED: { label: "ملغى", bg: "bg-red-100", text: "text-red-700" },
  REFUND_IN_PROGRESS: {
    label: "طلب استرجاع جارٍ",
    bg: "bg-purple-100",
    text: "text-purple-700",
  },
  REFUNDED: {
    label: "مسترد بالكامل",
    bg: "bg-fuchsia-100",
    text: "text-fuchsia-700",
  },
  TRASHED: {
    label: "في سلة المحذوفات",
    bg: "bg-slate-800",
    text: "text-slate-100",
  },
};

const formatCurrency = (val) =>
  Number(val || 0).toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function QuotationDetailsModal({
  isOpen,
  onClose,
  quotationId,
  onPrint,
  onEdit,
}) {
  // جلب تفاصيل عرض السعر بناءً على الـ ID
  const {
    data: quote,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["quotation-detail-modal", quotationId],
    queryFn: async () => {
      const res = await axios.get(`/quotations/${quotationId}`);
      return res.data.data;
    },
    enabled: !!quotationId && isOpen,
  });

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-6 font-[Tajawal]"
      dir="rtl"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl bg-[#e8edf0] rounded-[24px] shadow-2xl flex flex-col max-h-[95vh] overflow-hidden animate-in zoom-in-95 duration-200 border border-[#d8b46a]/30">
        {/* ── الترويسة ── */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#d8b46a]/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#123f59] rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5 text-[#e2bf74]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#123f59] flex items-center gap-2">
                تفاصيل عرض السعر
                {!isLoading && quote && (
                  <span className="font-mono text-xs bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg text-slate-600">
                    {quote.number}
                  </span>
                )}
              </h2>
              <p className="text-[11px] font-bold text-slate-400">
                استعراض سريع للبيانات والبنود
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isLoading && quote && !isError && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onEdit(quote);
                  }}
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold hover:bg-blue-100 flex items-center gap-2 transition-colors"
                >
                  <Edit3 className="w-4 h-4" /> تعديل
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onPrint(quote.id);
                  }}
                  className="px-4 py-2 bg-[#123f59] text-white rounded-xl text-xs font-black hover:bg-[#0f3448] flex items-center gap-2 transition-colors shadow-md"
                >
                  <Printer className="w-4 h-4 text-[#e2bf74]" /> طباعة / تصدير
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* ── المحتوى ── */}
        <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#123f59]" />
              <p className="font-bold text-slate-500">
                جاري جلب تفاصيل العرض...
              </p>
            </div>
          ) : isError || !quote ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
              <AlertTriangle className="w-10 h-10" />
              <p className="font-bold">حدث خطأ أثناء جلب البيانات</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {/* البطاقات العلوية (ملخص) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> تاريخ الإصدار
                  </span>
                  <span className="font-black text-[#123f59] font-mono text-sm">
                    {format(new Date(quote.issueDate), "yyyy-MM-dd", {
                      locale: arSA,
                    })}
                  </span>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> الحالة الحالية
                  </span>
                  <div>
                    <span
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-black ${STATUS_CONFIG[quote.status]?.bg || "bg-slate-100"} ${STATUS_CONFIG[quote.status]?.text || "text-slate-600"}`}
                    >
                      {STATUS_CONFIG[quote.status]?.label || quote.status}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> العميل
                  </span>
                  <span
                    className="font-black text-[#123f59] text-sm truncate"
                    title={quote.client?.name || "---"}
                  >
                    {typeof quote.client?.name === "object"
                      ? quote.client?.name?.ar || quote.client?.name?.en
                      : quote.client?.name || "عميل غير محدد"}
                  </span>
                </div>
                <div className="bg-gradient-to-br from-[#123f59] to-[#0f3448] p-4 rounded-2xl shadow-md flex flex-col justify-center text-white relative overflow-hidden">
                  <DollarSign className="absolute left-[-10px] bottom-[-10px] w-20 h-20 text-white/10" />
                  <span className="text-[10px] font-bold text-blue-200 mb-1">
                    الإجمالي النهائي
                  </span>
                  <span className="font-black text-xl font-mono text-[#e2bf74]">
                    {formatCurrency(quote.total)}{" "}
                    <span className="text-xs font-sans">ر.س</span>
                  </span>
                </div>
              </div>

              {/* 🌟 صندوق الأسباب والملاحظات (يظهر فقط إذا كان هناك سبب مسجل) */}
              {quote.notes && (
                <div
                  className={`p-4 rounded-2xl border flex items-start gap-3 shadow-sm ${
                    ["REJECTED", "CANCELLED", "NEEDS_MODIFICATION"].includes(
                      quote.status,
                    )
                      ? "bg-rose-50 border-rose-200 text-rose-800"
                      : ["REFUND_IN_PROGRESS", "REFUNDED"].includes(
                            quote.status,
                          )
                        ? "bg-purple-50 border-purple-200 text-purple-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  <Info className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-black text-xs mb-1">
                      الملاحظات / سبب الحالة الحالية:
                    </h4>
                    <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">
                      {quote.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* تفاصيل المشروع والملكية */}
              <div className="bg-white rounded-2xl border border-[#d8b46a]/20 overflow-hidden shadow-sm">
                <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#c5983c]" />
                  <h3 className="font-black text-[#123f59] text-xs">
                    بيانات المشروع والملكية
                  </h3>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold mb-1">
                      نوع المعاملة / الخدمة
                    </div>
                    <div className="text-xs font-black text-slate-800">
                      {quote.transactionTypeId || "---"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold mb-1">
                      كود الأرشفة (الملكية)
                    </div>
                    <div className="text-xs font-black text-slate-800 font-mono">
                      {quote.ownership?.code || "---"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold mb-1">
                      رقم الصك الرئيسي
                    </div>
                    <div className="text-xs font-black text-slate-800 font-mono">
                      {quote.ownership?.deedNumber || "---"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold mb-1">
                      الصفة القانونية للتوقيع
                    </div>
                    <div className="text-xs font-black text-slate-800">
                      {quote.signatureMethod === "SELF"
                        ? "المالك مباشرة"
                        : "ممثل نظامي / مفوض"}
                    </div>
                  </div>
                </div>
              </div>

              {/* جدول البنود المالية */}
              <div className="bg-white rounded-2xl border border-[#d8b46a]/20 overflow-hidden shadow-sm">
                <div className="bg-[#123f59] px-4 py-3 flex items-center gap-2 text-white">
                  <ListChecks className="w-4 h-4 text-[#e2bf74]" />
                  <h3 className="font-black text-sm">البنود ونطاق الأعمال</h3>
                </div>
                <div className="overflow-x-auto custom-scrollbar-slim">
                  <table className="w-full text-right text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="p-3 font-bold w-12 text-center">م</th>
                        <th className="p-3 font-bold">وصف الخدمة</th>
                        <th className="p-3 font-bold text-center">الكمية</th>
                        <th className="p-3 font-bold text-center">
                          سعر الوحدة
                        </th>
                        <th className="p-3 font-bold text-center">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {quote.items?.length > 0 ? (
                        quote.items.map((item, idx) => (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="p-3 font-mono text-slate-400 text-center">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-bold text-[#123f59]">
                              {item.title}
                            </td>
                            <td className="p-3 font-mono text-center">
                              {item.quantity} {item.unit}
                            </td>
                            <td className="p-3 font-mono text-center">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="p-3 font-mono text-center font-black text-[#123f59]">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="p-4 text-center text-slate-400 font-bold"
                          >
                            لا توجد بنود مسجلة في هذا العرض
                          </td>
                        </tr>
                      )}

                      {quote.items?.length > 0 && (
                        <>
                          <tr className="bg-slate-50/50">
                            <td
                              colSpan="4"
                              className="p-3 text-left font-black text-slate-600"
                            >
                              المجموع الفرعي
                            </td>
                            <td className="p-3 font-mono font-black text-center text-slate-800">
                              {formatCurrency(quote.subtotal)}
                            </td>
                          </tr>
                          <tr>
                            <td
                              colSpan="4"
                              className="p-3 text-left font-bold text-slate-500"
                            >
                              ضريبة القيمة المضافة ({quote.taxRate * 100}%)
                            </td>
                            <td className="p-3 font-mono font-bold text-center text-slate-600">
                              {formatCurrency(quote.taxAmount)}
                            </td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* الدفعات والشروط */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* الدفعات */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-black text-[#123f59] text-xs">
                      جدول الدفعات المالية
                    </h3>
                    {quote.collectedAmount > 0 && (
                      <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        المحصل: {formatCurrency(quote.collectedAmount)}
                      </span>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    {quote.payments?.length > 0 ? (
                      <div className="space-y-3">
                        {quote.payments.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-3 border border-slate-100 rounded-xl bg-slate-50/30 hover:bg-slate-50 transition-colors"
                          >
                            <div>
                              <div className="font-bold text-xs text-[#123f59]">
                                الدفعة {p.installmentNumber} ({p.percentage}%)
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">
                                {p.dueCondition || "حسب الاتفاق"}
                              </div>
                            </div>
                            <div className="font-mono font-black text-emerald-700">
                              {formatCurrency(p.amount)} ر.س
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-slate-400 text-xs py-4">
                        لا توجد دفعات مسجلة
                      </div>
                    )}
                  </div>
                </div>

                {/* الشروط */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-100">
                    <h3 className="font-black text-[#123f59] text-xs">
                      الشروط والأحكام
                    </h3>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="text-xs leading-loose text-slate-600 font-medium whitespace-pre-wrap bg-slate-50/50 p-4 rounded-xl border border-slate-100 h-full custom-scrollbar-slim overflow-y-auto max-h-[300px]">
                      {quote.terms || "لا توجد شروط مرفقة بهذا العرض."}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
