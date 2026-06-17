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
  Plus,
  Lock,
  DownloadCloud,
  Unlock // أيقونة فك القفل الجديدة
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import { toast } from "sonner";

import { useAppStore } from "../../stores/useAppStore";
import AccessControl from "../../components/AccessControl";
import QuotationDetailsModal from "./QuotationDetailsModal";
import { getFullUrl } from "../../utils/urlUtils";

const IconWithText = ({ icon: Icon, text, className = "", iconClassName = "", textClassName = "", vertical = false }) => (
  <span className={`inline-flex min-w-0 items-center justify-center ${vertical ? "flex-col gap-0.5" : "gap-1.5"} ${className}`}>
    {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
    {text && <span className={textClassName || "min-w-0 break-words text-[10px] font-black leading-tight"}>{text}</span>}
  </span>
);

// ==========================================
// ثوابت التطبيق
// ==========================================
const STATUS_CONFIG = {
  DRAFT: { label: "مسودة", bg: "bg-slate-100", text: "text-slate-600" },
  PENDING_APPROVAL: { label: "تحت المراجعة", bg: "bg-blue-100", text: "text-blue-700" },
  NEEDS_MODIFICATION: { label: "مُعاد للتعديل", bg: "bg-orange-100", text: "text-orange-700" },
  REJECTED: { label: "مرفوض", bg: "bg-rose-100", text: "text-rose-700" },
  APPROVED: { label: "معتمد (جاهز)", bg: "bg-emerald-100", text: "text-emerald-700" },
  SENT: { label: "مُرسل للعميل", bg: "bg-cyan-100", text: "text-cyan-700" },
  ACCEPTED: { label: "مقبول", bg: "bg-green-100", text: "text-green-700" },
  PARTIALLY_PAID: { label: "مسدد جزئياً", bg: "bg-lime-100", text: "text-lime-700" },
  EXPIRED: { label: "منتهي", bg: "bg-gray-100", text: "text-gray-500" },
  CANCELLED: { label: "ملغى", bg: "bg-red-100", text: "text-red-700" },
  REFUND_IN_PROGRESS: { label: "استرجاع جارٍ", bg: "bg-purple-100", text: "text-purple-700" },
  REFUNDED: { label: "مسترد بالكامل", bg: "bg-fuchsia-100", text: "text-fuchsia-700" },
};

const SCREEN_ID = "815";

const StatusBadge = React.memo(({ status }) => {
  const current = STATUS_CONFIG[status] || STATUS_CONFIG.DRAFT;
  return (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${current.bg} ${current.text} border border-white/20 shadow-sm whitespace-nowrap`}>
      {current.label}
    </span>
  );
});

const getClientName = (client) => {
  if (!client) return "عميل غير محدد";
  if (typeof client.name === "object") return client.name.ar || client.name.en || "عميل غير محدد";
  return client.name || "عميل غير محدد";
};

const formatCurrency = (value) => Number(value || 0).toLocaleString("ar-SA");

// ==========================================
// المكون الرئيسي
// ==========================================
const QuotationsDirectory = ({ onNavigate }) => {
  const queryClient = useQueryClient();
  const { addTab } = useAppStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [generatingPdfId, setGeneratingPdfId] = useState(null);

  // جلب البيانات
  const { data: quotationsData, isLoading: isListLoading, error: listError } = useQuery({
    queryKey: ["quotations-list"],
    queryFn: async () => (await axios.get("/quotations")).data.data,
    staleTime: 5 * 60 * 1000,
  });

  // النقل لسلة المحذوفات
  const deleteQuotationMutation = useMutation({
    mutationFn: async (id) => axios.delete(`/quotations/${id}`),
    onSuccess: () => {
      toast.success("تم النقل لسلة المحذوفات بنجاح");
      queryClient.invalidateQueries({ queryKey: ["quotations-list"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء محاولة الحذف");
    },
  });

  // تحديث العرض (يُستخدم لفك القفل وإرسال سبب التعديل)
  const updateQuotationMutation = useMutation({
    mutationFn: async ({ id, data }) => axios.put(`/quotations/${id}`, data),
    onSuccess: () => {
      toast.success("تم فك القفل بنجاح، يمكنك الآن تعديل العرض");
      queryClient.invalidateQueries({ queryKey: ["quotations-list"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء فك قفل العرض");
    },
  });

  const handleDelete = useCallback((e, quote) => {
    e.stopPropagation();
    if (window.confirm(`هل أنت متأكد من نقل العرض (${quote.number}) إلى سلة المحذوفات؟`)) {
      deleteQuotationMutation.mutate(quote.id);
    }
  }, [deleteQuotationMutation]);

  // فتح عرض جديد
  const handleCreateNew = useCallback(() => {
    if (onNavigate) onNavigate("CREATE_QUOTATION");
    else addTab(SCREEN_ID, { id: `CREATE-QUOTATION-${Date.now()}`, title: "إنشاء عرض سعر", type: "create-quotation", closable: true });
  }, [onNavigate, addTab]);

  // تعديل عرض (عادي أو بعد فك القفل)
  const handleEditQuotation = useCallback((e, quote) => {
    e?.stopPropagation();
    setIsDetailsModalOpen(false);
    if (onNavigate) onNavigate("CREATE_QUOTATION", { quotationId: quote.id });
    else addTab(SCREEN_ID, { id: `EDIT-QUOTATION-${quote.id}`, title: `تعديل ${quote.number}`, type: "create-quotation", closable: true, quotationId: quote.id, data: { quotationId: quote.id }, props: { quotationId: quote.id } });
  }, [onNavigate, addTab]);

  // 🌟 إجراء فك القفل وإعادة التوجيه للتعديل
  const handleUnlockAndEdit = useCallback((e, quote) => {
    e?.stopPropagation();
    const reason = window.prompt("يُرجى إدخال سبب التعديل بعد الاعتماد. سيتم إلغاء الأختام الحالية وإعادة العرض للمراجعة:");
    if (!reason || reason.trim() === "") {
      toast.error("تعديل العرض المعتمد يتطلب إدخال سبب واضح!");
      return;
    }

    const toastId = toast.loading("جاري فك قفل العرض...");
    updateQuotationMutation.mutate({
      id: quote.id,
      data: { editReason: reason } // 👈 إرسال السبب للباك إند لفك القفل
    }, {
      onSuccess: () => {
        toast.dismiss(toastId);
        // فتح شاشة التعديل مباشرة بعد نجاح فك القفل
        handleEditQuotation(null, quote);
      }
    });
  }, [handleEditQuotation, updateQuotationMutation]);

  // التفاصيل
  const handleViewDetails = useCallback((e, id) => {
    e?.stopPropagation();
    setSelectedQuoteId(id);
    setIsDetailsModalOpen(true);
  }, []);

  // الطباعة
  const handlePrint = async (e, quote) => {
    e?.stopPropagation();

    if (quote.pdfUrl) {
       window.open(getFullUrl(quote.pdfUrl), "_blank");
       return;
    }

    setGeneratingPdfId(quote.id);
    const loadingToast = toast.loading("جاري توليد معاينة مؤقتة للعرض...");

    try {
      const { data: quoteResponse } = await axios.get(`/quotations/${quote.id}`);
      const response = await axios.post("/quotations/generate-pdf", quoteResponse.data, { responseType: "blob" });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      toast.success("تم التجهيز بنجاح", { id: loadingToast });
    } catch (error) {
      toast.error("حدث خطأ أثناء المعالجة", { id: loadingToast });
    } finally {
      setGeneratingPdfId(null);
    }
  };

  // 🌟 الفلترة الشاملة بدون قيود المستخدمين
  const filteredData = useMemo(() => {
    if (!quotationsData) return [];
    return quotationsData.filter((q) => {
      if (q.isDeleted || q.status === "TRASHED") return false;

      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || q.number?.toLowerCase().includes(searchLower) || getClientName(q.client)?.toLowerCase().includes(searchLower) || q.ownership?.code?.toLowerCase().includes(searchLower);
      const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [quotationsData, searchTerm, filterStatus]);

  // 🌟 العداد الشامل بدون قيود المستخدمين
  const getStatusCount = useCallback((status) => {
    if (!quotationsData) return 0;
    return quotationsData.filter((q) => q.status === status && !q.isDeleted).length;
  }, [quotationsData]);

  if (listError) {
    return (
      <div className="flex h-full min-h-0 items-center justify-center bg-[#fbf8f1]" dir="rtl">
        <div className="text-center p-3 text-rose-500 font-bold">⚠️ حدث خطأ في تحميل البيانات</div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] relative" dir="rtl">
      
      <QuotationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        quotationId={selectedQuoteId}
        onPrint={(id) => {
          const q = quotationsData?.find((x) => x.id === id);
          handlePrint(null, q);
        }}
        onEdit={(quote) => {
          // إذا كان مقفول يطلب السبب، غير كدة يعدل على طول
          const isLocked = ["APPROVED", "SENT", "ACCEPTED", "PARTIALLY_PAID"].includes(quote.status);
          if (isLocked) {
             handleUnlockAndEdit(null, quote);
          } else {
             handleEditQuotation(null, quote);
          }
        }}
      />

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 md:p-4 w-full">
        
        {/* Header */}
        <div className="flex min-w-0 items-center justify-between mb-4">
          <div className="text-base font-black text-[#123f59] flex min-w-0 items-center gap-2">
            <div className="p-2 bg-[#123f59] text-[#e2bf74] rounded-xl shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2>دليل عروض الأسعار</h2>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                يحتوي على {filteredData.length} عرض مسجل بالنظام
              </p>
            </div>
          </div>

          <AccessControl code="QUOTE_ACTION_CREATE" name="إنشاء عرض سعر" moduleName="عروض الأسعار" tabName="الجدول">
            <button onClick={handleCreateNew} className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#123f59] to-[#0f3448] text-white rounded-xl font-black text-xs hover:shadow-lg transition-all">
              <Plus className="w-4 h-4 text-[#e2bf74]" /> عرض سعر جديد
            </button>
          </AccessControl>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث برقم العرض، اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#123f59] focus:ring-1 focus:ring-[#123f59] bg-white shadow-sm"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap flex-1">
            {[{ key: "ALL", label: "الكل" }, { key: "DRAFT", label: "مسودات" }, { key: "PENDING_APPROVAL", label: "تحت المراجعة" }, { key: "APPROVED", label: "معتمد وجاهز" }, { key: "ACCEPTED", label: "مقبول" }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                  filterStatus === key
                    ? "bg-[#123f59] border-[#123f59] text-white shadow-md"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label} ({key === "ALL" ? filteredData.length : getStatusCount(key)})
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar-slim min-h-[400px]">
            {isListLoading ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#123f59]" />
                <span className="text-xs font-bold">جاري التحميل...</span>
              </div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[1100px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-[10px] text-slate-500 font-black w-10">#</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black">رقم العرض</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black">التاريخ</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black">العميل</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black">الإجمالي</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black text-center w-32">نسبة التحصيل</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black text-center">الحالة</th>
                    <th className="p-3 text-[10px] text-slate-500 font-black text-center">الإجراءات المتاحة</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((q, idx) => {
                    const total = q.total || 0;
                    const paid = q.collectedAmount || 0; 
                    const paidPct = total > 0 ? Math.round((paid / total) * 100) : 0;

                    // 🌟 القيود المنطقية للعمل
                    const isLocked = ["APPROVED", "SENT", "ACCEPTED", "PARTIALLY_PAID"].includes(q.status);
                    const canEdit = ["DRAFT", "NEEDS_MODIFICATION", "PENDING_APPROVAL"].includes(q.status);
                    const canTrash = ["DRAFT", "NEEDS_MODIFICATION", "REJECTED"].includes(q.status);
                    const hasPdf = !!q.pdfUrl;

                    return (
                      <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={(e) => handleViewDetails(e, q.id)}>
                        <td className="p-3 text-[10px] text-slate-400 font-mono font-bold">{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#123f59]">{q.number}</span>
                            {q.templateType === "DETAILED" && (
                              <span className="text-[8px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-black">تفصيلي</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-[10px] font-mono text-slate-600 font-bold whitespace-nowrap">
                          {/* 🌟 التعديل: عرض التاريخ والساعة */}
                          <div className="flex flex-col gap-0.5">
                            <span>{format(new Date(q.issueDate), "yyyy-MM-dd", { locale: arSA })}</span>
                            <span className="text-[9px] text-slate-400">{format(new Date(q.issueDate), "hh:mm a", { locale: arSA })}</span>
                          </div>
                        </td>
                        <td className="p-3 font-bold text-xs text-slate-700">{getClientName(q.client)}</td>
                        <td className="p-3 text-xs font-black text-[#0f766e] font-mono">
                          {formatCurrency(q.total)} ر.س
                        </td>
                        
                        <td className="p-3 text-center align-middle" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col gap-1 w-20 mx-auto" title={`تم سداد ${formatCurrency(paid)} من أصل ${formatCurrency(total)}`}>
                            <div className="flex justify-between text-[9px] font-black">
                              <span className={paidPct > 0 ? "text-emerald-600" : "text-slate-400"}>{paidPct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all" style={{ width: `${paidPct}%` }}></div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3 text-center"><StatusBadge status={q.status} /></td>
                        
                        <td className="p-3 text-center">
                          <div className="flex min-w-0 items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                            
                            {/* استعراض التفاصيل */}
                            <button onClick={(e) => handleViewDetails(e, q.id)} className="p-1.5 bg-slate-100 text-slate-600 rounded hover:bg-slate-200 transition-colors" title="عرض تفاصيل الطلب والسجل">
                              <Eye className="w-4 h-4" />
                            </button>

                            {/* زر التعديل العادي */}
                            {canEdit && (
                              <AccessControl code="QUOTE_ACTION_EDIT" name="تعديل عرض سعر" moduleName="عروض الأسعار" tabName="الجدول">
                                <button
                                  onClick={(e) => handleEditQuotation(e, q)}
                                  className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="تعديل محتوى العرض"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </AccessControl>
                            )}

                            {/* زر التعديل الاستثنائي (فك القفل للملفات المعتمدة) */}
                            {isLocked && (
                              <AccessControl code="QUOTE_ACTION_EDIT" name="تعديل عرض سعر" moduleName="عروض الأسعار" tabName="الجدول">
                                <button
                                  onClick={(e) => handleUnlockAndEdit(e, q)}
                                  className="p-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 rounded transition-colors flex items-center justify-center"
                                  title="تعديل استثنائي: إلغاء الاعتماد وطلب التعديل"
                                >
                                  {updateQuotationMutation.isPending && selectedQuoteId === q.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Unlock className="w-4 h-4" />
                                  )}
                                </button>
                              </AccessControl>
                            )}

                            {/* زر الطباعة / PDF */}
                            <button
                              onClick={(e) => handlePrint(e, q)}
                              disabled={generatingPdfId === q.id}
                              className={`p-1.5 rounded transition-colors flex items-center justify-center ${hasPdf ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-amber-50 text-amber-600 hover:bg-amber-100"}`}
                              title={hasPdf ? "تحميل الوثيقة المعتمدة (PDF)" : "معاينة مسودة العرض مؤقتاً"}
                            >
                              {generatingPdfId === q.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : hasPdf ? (
                                <DownloadCloud className="w-4 h-4" />
                              ) : (
                                <Printer className="w-4 h-4" />
                              )}
                            </button>

                            {/* زر الحذف */}
                            <AccessControl code="QUOTE_ACTION_DELETE" name="حذف عرض السعر" moduleName="عروض الأسعار" tabName="الجدول">
                              <button
                                onClick={(e) => canTrash && handleDelete(e, q)}
                                disabled={!canTrash || deleteQuotationMutation.isPending}
                                className={`p-1.5 rounded transition-colors ${canTrash ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-slate-50 text-slate-300 cursor-not-allowed"}`}
                                title={canTrash ? "نقل لسلة المحذوفات" : "مغلق: لا يمكن حذف العروض المعتمدة مالياً"}
                              >
                                {deleteQuotationMutation.isPending && selectedQuoteId === q.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : canTrash ? (
                                  <Trash2 className="w-4 h-4" />
                                ) : (
                                  <Lock className="w-4 h-4" />
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
                      <td colSpan="8" className="p-8 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                          <FileText className="w-10 h-10 opacity-20" />
                          <span className="text-sm font-bold">لا يوجد عروض مطابقة للبحث</span>
                        </div>
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