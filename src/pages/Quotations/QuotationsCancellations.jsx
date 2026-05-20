import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Ban, Undo2, CircleCheckBig, DollarSign, RotateCcw,
  Search, X, TriangleAlert, Loader2
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
// 1. دوال مساعدة
// ==========================================
const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === 'object') return client.name.ar || client.name.en || "عميل غير محدد";
  return client.name;
};

// ==========================================
// 2. المكون الرئيسي
// ==========================================
const QuotationsCancellations = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("cancelled"); // 'cancelled' | 'refunds'
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals States
  const [activeModal, setActiveModal] = useState(null); // 'cancel' | 'refund'
  const [cancelForm, setCancelForm] = useState({ quotationId: "", reason: "" });
  const [refundForm, setRefundForm] = useState({ quotationId: "", amount: "", method: "transfer", reason: "" });

  // ==========================================
  // API Calls (جلب البيانات)
  // ==========================================
  const { data: quotations = [], isLoading } = useQuery({
    queryKey: ["quotations-cancellations"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      return response.data.data;
    },
  });

  // ==========================================
  // معالجة البيانات والفلترة
  // ==========================================
  const processedData = useMemo(() => {
    // العروض الملغاة
    const cancelledQuotes = quotations.filter(q => q.status === 'CANCELLED' || q.status === 'REJECTED');
    
    // طلبات الاسترجاع
    const refundQuotes = quotations.filter(q => q.status === 'REFUND_IN_PROGRESS' || q.status === 'REFUNDED');

    // الإحصائيات
    const kpis = {
      totalCancelled: cancelledQuotes.length,
      activeRefunds: refundQuotes.filter(q => q.status === 'REFUND_IN_PROGRESS').length,
      completedRefunds: refundQuotes.filter(q => q.status === 'REFUNDED').length,
      totalRefundedAmount: refundQuotes.filter(q => q.status === 'REFUNDED').reduce((acc, q) => acc + (Number(q.collectedAmount) || 0), 0)
    };

    // العروض القابلة للإلغاء (ليست ملغاة ولا مسترجعة)
    const cancellableQuotes = quotations.filter(q => !['CANCELLED', 'REJECTED', 'REFUND_IN_PROGRESS', 'REFUNDED'].includes(q.status));
    
    // العروض القابلة للاسترجاع (تم تحصيل مبلغ منها)
    const refundableQuotes = quotations.filter(q => (Number(q.collectedAmount) > 0) && !['REFUND_IN_PROGRESS', 'REFUNDED'].includes(q.status));

    return { cancelledQuotes, refundQuotes, kpis, cancellableQuotes, refundableQuotes };
  }, [quotations]);

  const displayData = activeTab === "cancelled" 
    ? processedData.cancelledQuotes.filter(q => q.number.includes(searchTerm) || getClientName(q.client).includes(searchTerm))
    : processedData.refundQuotes.filter(q => q.number.includes(searchTerm) || getClientName(q.client).includes(searchTerm));

  // ==========================================
  // الإجراءات (Mutations & Handlers)
  // ==========================================
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => axios.put(`/quotations/${id}`, { status, notes }),
    onSuccess: () => {
      toast.success("تم تنفيذ الإجراء بنجاح");
      queryClient.invalidateQueries(["quotations-cancellations"]);
      queryClient.invalidateQueries(["quotations-stats"]);
      closeModal();
    },
    onError: () => toast.error("حدث خطأ أثناء التنفيذ")
  });

  // 👈 هذه هي الدالة التي كانت مفقودة!
  const openModal = (type) => {
    setActiveModal(type);
    setCancelForm({ quotationId: "", reason: "" });
    setRefundForm({ quotationId: "", amount: "", method: "transfer", reason: "" });
  };

  const closeModal = () => {
    setActiveModal(null);
    setCancelForm({ quotationId: "", reason: "" });
    setRefundForm({ quotationId: "", amount: "", method: "transfer", reason: "" });
  };

  const handleCancelQuote = () => {
    if (!cancelForm.quotationId) return toast.error("يرجى اختيار العرض");
    if (!cancelForm.reason.trim()) return toast.error("يرجى كتابة سبب الإلغاء");
    
    updateStatusMutation.mutate({
      id: cancelForm.quotationId,
      status: "CANCELLED",
      notes: `سبب الإلغاء: ${cancelForm.reason}` 
    });
  };

  const handleRequestRefund = () => {
    if (!refundForm.quotationId) return toast.error("يرجى اختيار العرض");
    if (!refundForm.amount || Number(refundForm.amount) <= 0) return toast.error("يرجى إدخال مبلغ صحيح");
    if (!refundForm.reason.trim()) return toast.error("يرجى كتابة سبب الاسترجاع");

    updateStatusMutation.mutate({
      id: refundForm.quotationId,
      status: "REFUND_IN_PROGRESS",
      notes: `طلب استرجاع (${refundForm.amount} ر.س) عبر ${refundForm.method} - السبب: ${refundForm.reason}`
    });
  };

  const handleCompleteRefund = (id) => {
    if (window.confirm("هل أنت متأكد من إتمام عملية الاسترجاع لهذا العرض؟")) {
      updateStatusMutation.mutate({ id, status: "REFUNDED" });
    }
  };

  // ==========================================
  // Render: Modals
  // ==========================================
  const renderCancelModal = () => {
    if (activeModal !== 'cancel') return null;
    const selectedQuote = processedData.cancellableQuotes.find(q => q.id === cancelForm.quotationId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[480px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 justify-between items-center mb-3">
            <div className="text-base font-bold text-red-600 flex min-w-0 items-center gap-2">
              <IconWithText icon={Ban} iconClassName="w-5 h-5" /> إلغاء عرض سعر
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-[#fbf8f1] rounded-xl text-[#94a3b8]"><X className="w-5 h-5" /></button>
          </div>

          {selectedQuote && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-3 text-xs text-red-700">
              <strong>{selectedQuote.number}</strong> — {getClientName(selectedQuote.client)} — {Number(selectedQuote.total).toLocaleString()} ر.س
            </div>
          )}

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">العرض المراد إلغاؤه</label>
            <select 
              value={cancelForm.quotationId} 
              onChange={e => setCancelForm({...cancelForm, quotationId: e.target.value})}
              className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-red-500"
            >
              <option value="">-- اختر عرضاً --</option>
              {processedData.cancellableQuotes.map(q => (
                <option key={q.id} value={q.id}>{q.number} — {getClientName(q.client)}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">سبب الإلغاء <span className="text-red-500">*</span></label>
            <textarea 
              value={cancelForm.reason}
              onChange={e => setCancelForm({...cancelForm, reason: e.target.value})}
              rows="3" 
              placeholder="اذكر سبب إلغاء العرض..." 
              className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-red-500 resize-y"
            ></textarea>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCancelQuote} disabled={updateStatusMutation.isPending} className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-red-700 flex min-w-0 items-center gap-1.5 disabled:opacity-50">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Ban className="w-4 h-4" />} تأكيد الإلغاء
            </button>
            <button onClick={closeModal} className="px-4 py-2.5 bg-[#fbf8f1] text-[#64748b] border border-[#d8b46a]/25 rounded-xl text-xs font-bold hover:bg-[#eef7f6]">تراجع</button>
          </div>
        </div>
      </div>
    );
  };

  const renderRefundModal = () => {
    if (activeModal !== 'refund') return null;
    const selectedQuote = processedData.refundableQuotes.find(q => q.id === refundForm.quotationId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[480px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 justify-between items-center mb-3">
            <div className="text-base font-bold text-violet-600 flex min-w-0 items-center gap-2">
              <Undo2 className="w-5 h-5" /> طلب استرجاع مبلغ
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-[#fbf8f1] rounded-xl text-[#94a3b8]"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">العرض</label>
            <select 
              value={refundForm.quotationId} 
              onChange={e => setRefundForm({...refundForm, quotationId: e.target.value})}
              className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-violet-500"
            >
              <option value="">-- اختر عرضاً مسدداً --</option>
              {processedData.refundableQuotes.map(q => (
                <option key={q.id} value={q.id}>{q.number} — {getClientName(q.client)} — المسدد: {Number(q.collectedAmount).toLocaleString()}</option>
              ))}
            </select>
          </div>

          {selectedQuote && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl mb-3 text-xs text-violet-700">
              المبلغ المسدد: <strong>{Number(selectedQuote.collectedAmount).toLocaleString()} ر.س</strong>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-3">
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">مبلغ الاسترجاع (ر.س) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                placeholder={`الحد الأقصى: ${selectedQuote ? Number(selectedQuote.collectedAmount).toLocaleString() : '0'}`} 
                value={refundForm.amount}
                onChange={e => setRefundForm({...refundForm, amount: e.target.value})}
                className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-sm font-mono outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">طريقة الاسترجاع</label>
              <select 
                value={refundForm.method}
                onChange={e => setRefundForm({...refundForm, method: e.target.value})}
                className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-violet-500"
              >
                <option value="transfer">تحويل بنكي</option>
                <option value="cash">نقد</option>
                <option value="check">شيك</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#475569] mb-1.5">سبب الاسترجاع <span className="text-red-500">*</span></label>
              <textarea 
                rows="2" 
                placeholder="سبب طلب الاسترجاع..." 
                value={refundForm.reason}
                onChange={e => setRefundForm({...refundForm, reason: e.target.value})}
                className="w-full p-2.5 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-violet-500 resize-y"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleRequestRefund} disabled={updateStatusMutation.isPending} className="px-4 py-2.5 bg-[#123f59] text-white rounded-xl text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-[#0f3448] flex min-w-0 items-center gap-1.5 disabled:opacity-50">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Undo2 className="w-4 h-4" />} تقديم طلب الاسترجاع
            </button>
            <button onClick={closeModal} className="px-4 py-2.5 bg-[#fbf8f1] text-[#64748b] border border-[#d8b46a]/25 rounded-xl text-xs font-bold hover:bg-[#eef7f6]">تراجع</button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Render Main Page
  // ==========================================
  if (isLoading) {
    return <div className="flex justify-center items-center h-full min-h-0 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] h-full" dir="rtl">
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3.5 md:p-3 max-w-7xl mx-auto">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex min-w-0 items-center justify-center"><Ban className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">إجمالي الملغاة</div><div className="text-lg font-bold text-[#123f59]">{processedData.kpis.totalCancelled}</div></div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-500 flex min-w-0 items-center justify-center"><Undo2 className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">طلبات استرجاع جارية</div><div className="text-lg font-bold text-[#123f59]">{processedData.kpis.activeRefunds}</div></div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex min-w-0 items-center justify-center"><CircleCheckBig className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">استرجاعات مكتملة</div><div className="text-lg font-bold text-[#123f59]">{processedData.kpis.completedRefunds}</div></div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex min-w-0 items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex min-w-0 items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-[#64748b]">إجمالي المبالغ المستردة</div><div className="text-lg font-bold text-[#123f59] font-mono">{processedData.kpis.totalRefundedAmount.toLocaleString()} ر.س</div></div>
          </div>
        </div>

        {/* Header & Actions */}
        <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] mb-3 flex flex-wrap items-center gap-3">
          <RotateCcw className="w-5 h-5 text-red-600 mr-1" />
          <span className="text-sm font-bold text-[#123f59]">الملغاة والاسترجاعات</span>
          
          <div className="flex-1"></div>

          <div className="flex gap-1 bg-[#fbf8f1] rounded-xl p-1">
            <button onClick={() => setActiveTab('cancelled')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'cancelled' ? 'bg-white text-[#123f59] shadow-[0_8px_22px_rgba(18,63,89,0.06)]' : 'text-[#64748b] hover:text-[#475569]'}`}>العروض الملغاة</button>
            <button onClick={() => setActiveTab('refunds')} className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'refunds' ? 'bg-white text-[#123f59] shadow-[0_8px_22px_rgba(18,63,89,0.06)]' : 'text-[#64748b] hover:text-[#475569]'}`}>طلبات الاسترجاع</button>
          </div>

          <button onClick={() => openModal('cancel')} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[11px] font-bold hover:bg-red-100 flex min-w-0 items-center gap-1.5 ml-2 transition-colors">
            <Ban className="w-3.5 h-3.5" /> إلغاء عرض
          </button>
          <button onClick={() => openModal('refund')} className="px-3 py-1.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-xl text-[11px] font-bold hover:bg-violet-100 flex min-w-0 items-center gap-1.5 transition-colors">
            <Undo2 className="w-3.5 h-3.5" /> طلب استرجاع
          </button>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] overflow-hidden">
          <div className="p-3 border-b border-[#e8ddc8] flex justify-end">
            <div className="relative w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
              <input 
                placeholder="بحث بالكود أو العميل..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full py-1.5 pr-9 pl-3 border border-[#d8b46a]/25 rounded-xl text-xs outline-none focus:border-slate-500 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar-slim min-h-[300px]">
            {activeTab === 'cancelled' ? (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">الكود</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">العميل</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">الإجمالي</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">الحالة</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">ملاحظات / السبب</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => (
                    <tr key={q.id} className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1] transition-colors">
                      <td className="p-3 text-xs font-bold text-red-600 font-mono">{q.number}</td>
                      <td className="p-3 text-xs text-[#475569] font-bold">{getClientName(q.client)}</td>
                      <td className="p-3 text-xs text-[#64748b] font-mono">{Number(q.total).toLocaleString()} ر.س</td>
                      <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3">
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-red-100 text-red-700">ملغى</span>
                      </td>
                      <td className="p-3 text-[11px] text-[#64748b] max-w-[200px] truncate" title={q.notes}>{q.notes || "لا يوجد سبب مسجل"}</td>
                      <td className="p-3 text-[11px] text-[#94a3b8] font-mono">{format(new Date(q.updatedAt || q.createdAt), "yyyy-MM-dd")}</td>
                    </tr>
                  ))}
                  {displayData.length === 0 && <tr><td colSpan={6} className="p-3 text-center text-[#94a3b8] text-sm">لا توجد عروض ملغاة</td></tr>}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">كود العرض</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">العميل</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">المبلغ المسترد (المحصّل)</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">ملاحظات</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">الحالة</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25">التاريخ</th>
                    <th className="p-3 text-[11px] text-[#64748b] font-bold whitespace-nowrap border-b-2 border-[#d8b46a]/25 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => (
                    <tr key={q.id} className="border-b border-[#e8ddc8] hover:bg-[#fbf8f1] transition-colors">
                      <td className="p-3 text-xs font-bold text-[#123f59] font-mono">{q.number}</td>
                      <td className="p-3 text-xs text-[#475569] font-bold">{getClientName(q.client)}</td>
                      <td className="p-3 text-xs font-bold text-red-600 font-mono">{Number(q.collectedAmount).toLocaleString()} ر.س</td>
                      <td className="p-3 text-[11px] text-[#64748b] max-w-[200px] truncate" title={q.notes}>{q.notes}</td>
                      <td className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3">
                        {q.status === 'REFUND_IN_PROGRESS' 
                          ? <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-orange-100 text-orange-700">قيد المعالجة</span>
                          : <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-green-100 text-green-700">مسترد بالكامل</span>
                        }
                      </td>
                      <td className="p-3 text-[11px] text-[#94a3b8] font-mono">{format(new Date(q.updatedAt), "yyyy-MM-dd")}</td>
                      <td className="p-3 text-center">
                        {q.status === 'REFUND_IN_PROGRESS' && (
                          <button onClick={() => handleCompleteRefund(q.id)} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-xl text-[10px] font-bold hover:bg-green-100 flex min-w-0 items-center gap-1.5 mx-auto transition-colors">
                            <CircleCheckBig className="w-3 h-3" /> إتمام
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayData.length === 0 && <tr><td colSpan={7} className="p-3 text-center text-[#94a3b8] text-sm">لا توجد طلبات استرجاع</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {renderCancelModal()}
      {renderRefundModal()}
    </div>
  );
};

export default QuotationsCancellations;