import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  DollarSign, ArrowDownRight, ArrowUpRight, CircleCheckBig, Clock,
  TriangleAlert, CreditCard, Search, Download, X, Loader2
} from "lucide-react";
import { format } from "date-fns";
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
// 1. مكونات مساعدة
// ==========================================
const StatusBadge = ({ status }) => {
  const config = {
    DRAFT: { label: "مسودة", bg: "bg-[#fbf8f1]", text: "text-[#64748b]" },
    PENDING_APPROVAL: { label: "تحت المراجعة", bg: "bg-blue-100", text: "text-[#123f59]" },
    REJECTED: { label: "مرفوض", bg: "bg-orange-100", text: "text-orange-700" },
    SENT: { label: "بانتظار التوقيع", bg: "bg-amber-100", text: "text-amber-700" },
    APPROVED: { label: "بانتظار الدفع", bg: "bg-emerald-100", text: "text-[#0f766e]" },
    PARTIALLY_PAID: { label: "مسدد جزئياً", bg: "bg-yellow-100", text: "text-yellow-700" },
    ACCEPTED: { label: "مسدد بالكامل", bg: "bg-green-100", text: "text-green-700" },
    EXPIRED: { label: "منتهي الصلاحية", bg: "bg-red-50", text: "text-red-700" },
    CANCELLED: { label: "ملغى", bg: "bg-red-100", text: "text-red-800" },
  };
  const current = config[status] || config.DRAFT;
  return (
    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${current.bg} ${current.text}`}>
      {current.label}
    </span>
  );
};

const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === 'object') return client.name.ar || client.name.en || "عميل غير محدد";
  return client.name;
};

// ==========================================
// 2. المكون الرئيسي
// ==========================================
const QuotationsPayments = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Modal States
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", method: "transfer", reference: "" });

  // ==========================================
  // API Calls
  // ==========================================
  const { data: quotationsData = [], isLoading } = useQuery({
    queryKey: ["quotations-payments-list"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      // تصفية العروض لاعتماد المعاملات المالية فقط (نتجاهل المسودات والملغية)
      return response.data.data.filter(q => !['DRAFT', 'CANCELLED', 'REJECTED'].includes(q.status));
    }
  });

  const recordPaymentMutation = useMutation({
    // نفترض وجود مسار في الباك إند لتسجيل الدفعات الخاصة بالعروض
    mutationFn: async (payload) => axios.post(`/quotations/${payload.quotationId}/payments`, payload),
    onSuccess: () => {
      toast.success("تم تسجيل الدفعة بنجاح");
      queryClient.invalidateQueries(["quotations-payments-list"]);
      queryClient.invalidateQueries(["quotations-stats"]); // لتحديث الداشبورد
      closeModal();
    },
    onError: (error) => {
      // محاكاة للنجاح في حال لم تبرمج المسار بعد في الباك إند:
      // toast.success("تم تسجيل الدفعة محلياً (المسار قيد التطوير)"); closeModal();
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التسجيل");
    }
  });

  // ==========================================
  // حسابات المالية (Financial Calculations)
  // ==========================================
  let totalDues = 0;
  let totalCollected = 0;
  let fullyPaidCount = 0;
  let partiallyPaidCount = 0;
  let pendingPaymentCount = 0;

  const processedData = quotationsData.map(q => {
    // حساب المبالغ (افتراضياً: إذا كانت مسددة بالكامل نعتبر المحصل = الإجمالي، وإلا نجمع المدفوعات إن وجدت)
    const quoteTotal = Number(q.total) || 0;
    
    // ملاحظة: يمكنك جلب المدفوعات الحقيقية من q.payments إذا قمت بربطها في الباك إند
    let collected = Number(q.collectedAmount) || 0; // 👈 جلب المحصل الحقيقي من الداتابيز
    
    const remaining = quoteTotal - collected;
    const progress = quoteTotal > 0 ? Math.round((collected / quoteTotal) * 100) : 0;

    // تجميع الإحصائيات العلوية
    totalDues += quoteTotal;
    totalCollected += collected;
    if (q.status === 'ACCEPTED') fullyPaidCount++;
    else if (q.status === 'PARTIALLY_PAID') partiallyPaidCount++;
    else if (['APPROVED', 'SENT'].includes(q.status)) pendingPaymentCount++;

    return { ...q, quoteTotal, collected, remaining, progress };
  });

  const totalRemaining = totalDues - totalCollected;

  // الفلترة
  const filteredData = processedData.filter((q) => {
    const matchesSearch = q.number.toLowerCase().includes(searchTerm.toLowerCase()) || (getClientName(q.client) || "").includes(searchTerm);
    let matchesStatus = true;
    if (filterStatus === "approved_pending_payment") matchesStatus = ['APPROVED', 'SENT'].includes(q.status);
    if (filterStatus === "partially_paid") matchesStatus = q.status === 'PARTIALLY_PAID';
    if (filterStatus === "fully_paid") matchesStatus = q.status === 'ACCEPTED';
    
    return matchesSearch && matchesStatus;
  });

  // ==========================================
  // Modal Handlers
  // ==========================================
  const openPaymentModal = (quote) => {
    setSelectedQuote(quote);
    setPaymentForm({ amount: quote.remaining.toString(), method: "transfer", reference: "" });
    setIsPaymentModalOpen(true);
  };

  const closeModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedQuote(null);
  };

  const handleSavePayment = () => {
    if (!paymentForm.amount || Number(paymentForm.amount) <= 0) return toast.error("أدخل مبلغاً صحيحاً");
    if (Number(paymentForm.amount) > selectedQuote.remaining) return toast.error("المبلغ المدخل أكبر من المتبقي");

    recordPaymentMutation.mutate({
      quotationId: selectedQuote.id,
      amount: Number(paymentForm.amount),
      method: paymentForm.method,
      reference: paymentForm.reference
    });
  };

  // ==========================================
  // Render: Payment Modal
  // ==========================================
  const renderPaymentModal = () => {
    if (!isPaymentModalOpen || !selectedQuote) return null;

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[480px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 justify-between items-center mb-3">
            <div className="text-base font-bold text-[#123f59]">تسجيل دفعة — {selectedQuote.number}</div>
            <button onClick={closeModal} className="p-1 hover:bg-[#fbf8f1] rounded-xl text-[#94a3b8]"><X className="w-5 h-5" /></button>
          </div>

          <div className="p-3 bg-green-50 border border-green-200 rounded-xl mb-3 text-xs text-green-700">
            المتبقي: <strong className="text-sm">{selectedQuote.remaining.toLocaleString()} ر.س</strong> — إجمالي العرض: {selectedQuote.quoteTotal.toLocaleString()} ر.س
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">المبلغ (ر.س) *</label>
              <input 
                type="number" 
                value={paymentForm.amount}
                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                placeholder={`الحد الأقصى: ${selectedQuote.remaining.toLocaleString()}`} 
                className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-sm font-mono outline-none focus:border-green-500 focus:ring-1 focus:ring-green-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">طريقة الدفع</label>
              <select 
                value={paymentForm.method}
                onChange={e => setPaymentForm({...paymentForm, method: e.target.value})}
                className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-sm outline-none focus:border-green-500"
              >
                <option value="transfer">تحويل بنكي</option>
                <option value="cash">نقد</option>
                <option value="check">شيك</option>
                <option value="sadad">سداد</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">مرجع العملية (اختياري)</label>
              <input 
                type="text" 
                value={paymentForm.reference}
                onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})}
                placeholder="رقم الحوالة / الشيك..." 
                className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-sm outline-none focus:border-green-500"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSavePayment} disabled={recordPaymentMutation.isPending} className="px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-green-700 flex min-w-0 items-center gap-1.5 disabled:opacity-50">
              {recordPaymentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <CircleCheckBig className="w-4 h-4" />} تسجيل الدفعة
            </button>
            <button onClick={closeModal} className="px-4 py-2.5 bg-[#fbf8f1] text-[#64748b] border border-[#d8b46a]/25 rounded-xl text-sm hover:bg-[#eef7f6] font-bold">إلغاء</button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] h-full" dir="rtl">
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3.5 md:p-3 max-w-7xl mx-auto">
        
        {/* Top Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
          <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex min-w-0 items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">إجمالي المستحقات</div><div className="text-base font-bold text-[#123f59] font-mono">{totalDues.toLocaleString()} ر.س</div></div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex min-w-0 items-center justify-center"><ArrowDownRight className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">إجمالي المحصّل</div><div className="text-base font-bold text-[#123f59] font-mono">{totalCollected.toLocaleString()} ر.س</div></div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex min-w-0 items-center justify-center"><ArrowUpRight className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">المتبقي</div><div className="text-base font-bold text-[#123f59] font-mono">{totalRemaining.toLocaleString()} ر.س</div></div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex min-w-0 items-center justify-center"><CircleCheckBig className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">مسددة بالكامل</div><div className="text-base font-bold text-[#123f59]">{fullyPaidCount}</div></div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-600 flex min-w-0 items-center justify-center"><Clock className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">مسددة جزئياً</div><div className="text-base font-bold text-[#123f59]">{partiallyPaidCount}</div></div>
          </div>
          <div className="p-3.5 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex min-w-0 items-center justify-center"><TriangleAlert className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">بانتظار الدفع</div><div className="text-base font-bold text-[#123f59]">{pendingPaymentCount}</div></div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] mb-3 flex flex-wrap items-center gap-3">
          <CreditCard className="w-5 h-5 text-[#0f766e] mr-1" />
          <span className="text-sm font-bold text-[#123f59]">الدفعات والتحصيل</span>
          <span className="px-2.5 py-0.5 rounded-xl text-[10px] font-bold bg-emerald-50 text-[#0f766e]">{filteredData.length}</span>
          
          <div className="flex-1"></div>
          
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
            <input 
              placeholder="بحث بالكود أو العميل..." 
              value={searchTerm}
              onChange={e=>setSearchTerm(e.target.value)}
              className="py-1.5 pr-9 pl-3 border border-[#d8b46a]/25 rounded-xl text-xs w-[220px] outline-none focus:border-[#c5983c]/70" 
            />
          </div>
          
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="py-1.5 px-3 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-[#c5983c]/70 cursor-pointer bg-white">
            <option value="all">جميع الحالات</option>
            <option value="approved_pending_payment">بانتظار الدفع</option>
            <option value="partially_paid">مسددة جزئياً</option>
            <option value="fully_paid">مسددة بالكامل</option>
          </select>
          
          <button className="px-3 py-1.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white text-[#64748b] border border-[#d8b46a]/25 rounded-xl text-[11px] font-bold hover:bg-[#fbf8f1] flex min-w-0 items-center gap-1.5">
            <IconWithText icon={Download} text="تصدير" iconClassName="w-3 h-3" />
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar-slim min-h-[300px]">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center h-40 text-[#94a3b8]"><Loader2 className="w-8 h-8 animate-spin mb-2" /> جاري التحميل...</div>
            ) : (
              <table className="w-full text-right border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b-2 border-[#d8b46a]/25">
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">الكود</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">العميل</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">إجمالي العرض</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">المسدد</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">المتبقي</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">نسبة التحصيل</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap">الحالة</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map(q => {
                    // لون شريط التقدم بناءً على النسبة
                    let progressColor = "bg-blue-500";
                    if (q.progress === 100) progressColor = "bg-green-600";
                    else if (q.progress > 0) progressColor = "bg-yellow-500";

                    return (
                      <tr key={q.id} className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1]/50 transition-colors">
                        <td className="p-3 text-xs font-bold text-[#123f59] font-mono">{q.number}</td>
                        <td className="p-3 text-xs text-[#475569] font-bold">{getClientName(q.client)}</td>
                        <td className="p-3 text-xs text-[#475569] font-mono">{q.quoteTotal.toLocaleString()}</td>
                        <td className="p-3 text-xs text-green-600 font-mono font-bold">{q.collected.toLocaleString()}</td>
                        <td className="p-3 text-xs text-red-600 font-mono font-bold">{q.remaining.toLocaleString()}</td>
                        <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[#eef7f6] rounded-full overflow-hidden">
                              <div className={`h-full ${progressColor} transition-all duration-500`} style={{ width: `${q.progress}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-[#64748b] min-w-[32px]">{q.progress}%</span>
                          </div>
                        </td>
                        <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3"><StatusBadge status={q.status} /></td>
                        <td className="p-3 text-center">
                          {q.remaining > 0 ? (
                            <button onClick={() => openPaymentModal(q)} className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-xl text-[10px] font-bold hover:bg-green-100 flex min-w-0 items-center gap-1.5 mx-auto">
                              <CreditCard className="w-3 h-3" /> تسجيل دفعة
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#94a3b8]">مكتمل</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredData.length === 0 && <tr><td colSpan={8} className="p-3 text-center text-[#94a3b8] text-sm">لا توجد عروض لعرضها هنا</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {renderPaymentModal()}
    </div>
  );
};

export default QuotationsPayments;