import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Ban, Undo2, CircleCheckBig, DollarSign, RotateCcw,
  Search, X, Loader2, Trash2, ArchiveRestore, AlertOctagon, User
} from "lucide-react";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";

// 🌟 استدعاء سياق المصادقة لمعرفة المستخدم الحالي
import { useAuth } from "../../context/AuthContext";

const IconWithText = ({ icon: Icon, text, className = "", iconClassName = "", textClassName = "", vertical = false }) => (
  <span className={`inline-flex min-w-0 items-center justify-center ${vertical ? "flex-col gap-0.5" : "gap-1.5"} ${className}`}>
    {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
    {text && <span className={textClassName || "min-w-0 break-words text-[10px] font-black leading-tight"}>{text}</span>}
  </span>
);

const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === 'object') return client.name.ar || client.name.en || "عميل غير محدد";
  return client.name;
};

// ==========================================
// المكون الرئيسي
// ==========================================
const QuotationsCancellations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // 🌟 جلب بيانات الموظف الحالي
  const [activeTab, setActiveTab] = useState("trashed"); // 'cancelled' | 'refunds' | 'trashed'
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modals States
  const [activeModal, setActiveModal] = useState(null); // 'cancel' | 'refund'
  const [cancelForm, setCancelForm] = useState({ quotationId: "", reason: "" });
  const [refundForm, setRefundForm] = useState({ quotationId: "", amount: "", method: "transfer", reason: "" });

  // ==========================================
  // API Calls (جلب البيانات)
  // ==========================================
  
  // جلب العروض النشطة (الملغاة والاسترجاع)
  const { data: activeQuotations = [], isLoading: isLoadingActive } = useQuery({
    queryKey: ["quotations-cancellations"],
    queryFn: async () => (await axios.get("/quotations")).data.data,
  });

  // 🌟 جلب العروض المحذوفة (سلة المحذوفات)
  // ملاحظة: تأكد أن الباك إند يدعم جلب المحذوفات عبر تمرير query أو مسار مخصص
  const { data: trashedQuotations = [], isLoading: isLoadingTrashed } = useQuery({
    queryKey: ["quotations-trashed"],
    queryFn: async () => {
      try {
        // نمرر query للباك إند لجلب المحذوفات (إذا كان الباك إند مبرمجاً لاستقبالها)
        const res = await axios.get("/quotations?status=TRASHED"); 
        return res.data.data.filter(q => q.status === "TRASHED");
      } catch (err) {
        return [];
      }
    },
  });

  // ==========================================
  // معالجة البيانات والفلترة
  // ==========================================
  const processedData = useMemo(() => {
    const cancelledQuotes = activeQuotations.filter(q => q.status === 'CANCELLED' || q.status === 'REJECTED');
    const refundQuotes = activeQuotations.filter(q => q.status === 'REFUND_IN_PROGRESS' || q.status === 'REFUNDED');
    const trashedQuotes = trashedQuotations;

    const kpis = {
      totalCancelled: cancelledQuotes.length,
      activeRefunds: refundQuotes.filter(q => q.status === 'REFUND_IN_PROGRESS').length,
      totalTrashed: trashedQuotes.length,
      totalRefundedAmount: refundQuotes.filter(q => q.status === 'REFUNDED').reduce((acc, q) => acc + (Number(q.collectedAmount) || 0), 0)
    };

    const cancellableQuotes = activeQuotations.filter(q => !['CANCELLED', 'REJECTED', 'REFUND_IN_PROGRESS', 'REFUNDED', 'TRASHED'].includes(q.status));
    const refundableQuotes = activeQuotations.filter(q => (Number(q.collectedAmount) > 0) && !['REFUND_IN_PROGRESS', 'REFUNDED', 'TRASHED'].includes(q.status));

    return { cancelledQuotes, refundQuotes, trashedQuotes, kpis, cancellableQuotes, refundableQuotes };
  }, [activeQuotations, trashedQuotations]);

  const displayData = useMemo(() => {
    let baseData = [];
    if (activeTab === "cancelled") baseData = processedData.cancelledQuotes;
    if (activeTab === "refunds") baseData = processedData.refundQuotes;
    if (activeTab === "trashed") baseData = processedData.trashedQuotes;

    return baseData.filter(q => q.number?.includes(searchTerm) || getClientName(q.client).includes(searchTerm));
  }, [activeTab, processedData, searchTerm]);

  // ==========================================
  // الإجراءات (Mutations)
  // ==========================================
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }) => axios.put(`/quotations/${id}`, { status, notes }),
    onSuccess: () => {
      toast.success("تم تنفيذ الإجراء بنجاح");
      queryClient.invalidateQueries(["quotations-cancellations"]);
    },
    onError: () => toast.error("حدث خطأ أثناء التنفيذ")
  });

  // 🌟 استعادة من سلة المحذوفات
  const restoreMutation = useMutation({
    mutationFn: async (id) => axios.put(`/quotations/${id}/restore`, {
      userId: user?.id,
      userName: user?.name
    }),
    onSuccess: () => {
      toast.success("تم استعادة عرض السعر بنجاح!");
      queryClient.invalidateQueries(["quotations-trashed"]);
      queryClient.invalidateQueries(["quotations-list"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "فشلت عملية الاستعادة")
  });

  // 🌟 الحذف النهائي (Hard Delete)
  const hardDeleteMutation = useMutation({
    // نرسل مسار الحذف النهائي (تأكد من إضافته في الباك إند: router.delete('/:id/force'))
    // أو نمرر هيدر/بدي يخبر الباك إند أنه حذف نهائي
    mutationFn: async (id) => axios.delete(`/quotations/${id}/force`, { 
      data: { userId: user?.id, userName: user?.name } 
    }),
    onSuccess: () => {
      toast.success("تم الحذف النهائي من قاعدة البيانات.");
      queryClient.invalidateQueries(["quotations-trashed"]);
    },
    onError: (err) => toast.error(err.response?.data?.message || "فشلت عملية الحذف النهائي")
  });

  const handleRestore = (id) => {
    if (window.confirm("هل أنت متأكد من استعادة هذا العرض ليعود إلى العمل؟")) {
      restoreMutation.mutate(id);
    }
  };

  const handleHardDelete = (id, number) => {
    if (window.confirm(`⚠️ تحذير أمني: هل أنت متأكد من الحذف النهائي للعرض ${number}؟\n\nهذا الإجراء لا يمكن التراجع عنه وسيحذف جميع سجلاته المالية والزمنية للأبد!`)) {
      hardDeleteMutation.mutate(id);
    }
  };

  const openModal = (type) => {
    setActiveModal(type);
    setCancelForm({ quotationId: "", reason: "" });
    setRefundForm({ quotationId: "", amount: "", method: "transfer", reason: "" });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleCancelQuote = () => {
    if (!cancelForm.quotationId) return toast.error("يرجى اختيار العرض");
    if (!cancelForm.reason.trim()) return toast.error("يرجى كتابة سبب الإلغاء");
    updateStatusMutation.mutate({ id: cancelForm.quotationId, status: "CANCELLED", notes: `سبب الإلغاء: ${cancelForm.reason}` });
    closeModal();
  };

  const handleRequestRefund = () => {
    if (!refundForm.quotationId || !refundForm.amount || !refundForm.reason.trim()) return toast.error("يرجى إكمال جميع الحقول");
    updateStatusMutation.mutate({ id: refundForm.quotationId, status: "REFUND_IN_PROGRESS", notes: `طلب استرجاع (${refundForm.amount} ر.س) عبر ${refundForm.method} - السبب: ${refundForm.reason}` });
    closeModal();
  };

  // ==========================================
  // Render: Modals (Cancel & Refund)
  // ==========================================
  // ... (نفس النوافذ السابقة للـ Cancel و Refund بدون تغيير) ...
  const renderCancelModal = () => {
    if (activeModal !== 'cancel') return null;
    const selectedQuote = processedData.cancellableQuotes.find(q => q.id === cancelForm.quotationId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-[20px] p-4 w-full max-w-[480px] shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold text-red-600 flex items-center gap-2">
              <Ban className="w-5 h-5" /> إلغاء عرض سعر
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">العرض المراد إلغاؤه</label>
            <select value={cancelForm.quotationId} onChange={e => setCancelForm({...cancelForm, quotationId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500">
              <option value="">-- اختر عرضاً --</option>
              {processedData.cancellableQuotes.map(q => <option key={q.id} value={q.id}>{q.number} — {getClientName(q.client)}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">سبب الإلغاء <span className="text-red-500">*</span></label>
            <textarea value={cancelForm.reason} onChange={e => setCancelForm({...cancelForm, reason: e.target.value})} rows="3" placeholder="اذكر سبب الإلغاء ليتم تسجيله في النظام..." className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-red-500 resize-y"></textarea>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCancelQuote} disabled={updateStatusMutation.isPending} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-red-700 flex justify-center items-center gap-2 disabled:opacity-50">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Ban className="w-4 h-4" />} تأكيد الإلغاء
            </button>
            <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">تراجع</button>
          </div>
        </div>
      </div>
    );
  };

  const renderRefundModal = () => {
    if (activeModal !== 'refund') return null;
    const selectedQuote = processedData.refundableQuotes.find(q => q.id === refundForm.quotationId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[200] flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-[20px] p-4 w-full max-w-[480px] shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold text-violet-600 flex items-center gap-2">
              <Undo2 className="w-5 h-5" /> طلب استرجاع مبلغ
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-xl text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-2">اختر العرض المسدد</label>
            <select value={refundForm.quotationId} onChange={e => setRefundForm({...refundForm, quotationId: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500">
              <option value="">-- اختر العرض --</option>
              {processedData.refundableQuotes.map(q => <option key={q.id} value={q.id}>{q.number} — {getClientName(q.client)}</option>)}
            </select>
          </div>

          {selectedQuote && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-xl mb-4 text-xs font-bold text-violet-700 text-center">
              المبلغ المحصل القابل للاسترداد: {Number(selectedQuote.collectedAmount).toLocaleString()} ر.س
            </div>
          )}

          <div className="flex flex-col gap-3 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">المبلغ المطلوب استرجاعه <span className="text-red-500">*</span></label>
              <input type="number" value={refundForm.amount} onChange={e => setRefundForm({...refundForm, amount: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة الاسترجاع</label>
              <select value={refundForm.method} onChange={e => setRefundForm({...refundForm, method: e.target.value})} className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500">
                <option value="transfer">تحويل بنكي</option>
                <option value="cash">نقد</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب الاسترجاع <span className="text-red-500">*</span></label>
              <textarea value={refundForm.reason} onChange={e => setRefundForm({...refundForm, reason: e.target.value})} rows="2" className="w-full p-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-violet-500 resize-y"></textarea>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleRequestRefund} disabled={updateStatusMutation.isPending} className="flex-1 py-2.5 bg-violet-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-violet-700 flex justify-center items-center gap-2 disabled:opacity-50">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Undo2 className="w-4 h-4" />} تقديم الطلب
            </button>
            <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200">تراجع</button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Render Main Page
  // ==========================================
  if (isLoadingActive || isLoadingTrashed) {
    return <div className="flex justify-center items-center h-full min-h-0 bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-[#123f59]" /></div>;
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] h-full" dir="rtl">
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3.5 md:p-4 max-w-7xl mx-auto">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center"><Ban className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500 font-bold">إجمالي الملغاة</div><div className="text-lg font-black text-[#123f59]">{processedData.kpis.totalCancelled}</div></div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center"><Undo2 className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500 font-bold">طلبات استرجاع جارية</div><div className="text-lg font-black text-[#123f59]">{processedData.kpis.activeRefunds}</div></div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center"><Trash2 className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500 font-bold">المحذوفات (السلة)</div><div className="text-lg font-black text-[#123f59]">{processedData.kpis.totalTrashed}</div></div>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500 font-bold">المبالغ المستردة</div><div className="text-lg font-black text-[#123f59] font-mono">{processedData.kpis.totalRefundedAmount.toLocaleString()} ر.س</div></div>
          </div>
        </div>

        {/* Toolbar & Tabs */}
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-wrap items-center gap-3">
          <RotateCcw className="w-5 h-5 text-[#123f59] mr-1 hidden md:block" />
          <span className="text-sm font-black text-[#123f59] hidden md:block">إدارة السجلات والملغيات</span>
          
          <div className="flex-1"></div>

          <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
            <button onClick={() => setActiveTab('cancelled')} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'cancelled' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>الملغاة والمرفوضة</button>
            <button onClick={() => setActiveTab('refunds')} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === 'refunds' ? 'bg-white text-violet-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>طلبات الاسترجاع</button>
            <button onClick={() => setActiveTab('trashed')} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${activeTab === 'trashed' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Trash2 className="w-3.5 h-3.5" /> سلة المحذوفات
            </button>
          </div>

          <button onClick={() => openModal('cancel')} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-[11px] font-bold hover:bg-red-100 flex items-center gap-1.5 ml-2 transition-colors">
            <Ban className="w-3.5 h-3.5" /> إلغاء عرض
          </button>
          <button onClick={() => openModal('refund')} className="px-3 py-1.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-xl text-[11px] font-bold hover:bg-violet-100 flex items-center gap-1.5 transition-colors">
            <Undo2 className="w-3.5 h-3.5" /> طلب استرجاع
          </button>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-3 border-b border-slate-100 flex justify-end bg-slate-50/50">
            <div className="relative w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="بحث بالكود أو العميل..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full py-1.5 pr-9 pl-3 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#123f59] bg-white shadow-sm"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto custom-scrollbar-slim min-h-[350px]">
            {activeTab === 'trashed' ? (
              // ==========================================
              // جدول سلة المحذوفات (TRASHED)
              // ==========================================
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">كود العرض</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">العميل</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">تاريخ الحذف</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">حُذف بواسطة</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200 text-center">إجراءات الاستعادة والحذف</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => {
                    // استخراج معلومات الحذف من السجل إن وجدت
                    const trashLog = q.logs?.find(l => l.action === 'TRASH');
                    const deletedBy = trashLog?.userName || q.updatedBy || "مستخدم النظام";
                    const deletedAt = trashLog?.createdAt || q.updatedAt;

                    return (
                      <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-3 text-xs font-black text-slate-700 font-mono">{q.number}</td>
                        <td className="p-3 text-xs text-slate-600 font-bold">{getClientName(q.client)}</td>
                        <td className="p-3 text-[11px] text-slate-500 font-mono">{format(new Date(deletedAt), "yyyy-MM-dd hh:mm a")}</td>
                        <td className="p-3 text-[11px] font-bold text-slate-600 flex items-center gap-1.5 mt-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {deletedBy}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleRestore(q.id)}
                              disabled={restoreMutation.isPending}
                              className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black hover:bg-emerald-100 transition-colors flex items-center gap-1"
                              title="استعادة كمسودة"
                            >
                              <ArchiveRestore className="w-3.5 h-3.5" /> استعادة
                            </button>
                            <button 
                              onClick={() => handleHardDelete(q.id, q.number)}
                              disabled={hardDeleteMutation.isPending}
                              className="px-3 py-1.5 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-black hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1"
                              title="حذف نهائي من قاعدة البيانات"
                            >
                              <AlertOctagon className="w-3.5 h-3.5" /> حذف للأبد
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {displayData.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-slate-400 text-sm font-bold flex flex-col items-center gap-2"><Trash2 className="w-8 h-8 opacity-20"/> السلة فارغة</td></tr>}
                </tbody>
              </table>
            ) : activeTab === 'cancelled' ? (
              // ==========================================
              // جدول العروض الملغاة (CANCELLED)
              // ==========================================
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">الكود</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">العميل</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">الإجمالي</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">الحالة</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">السبب</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-xs font-bold text-red-600 font-mono">{q.number}</td>
                      <td className="p-3 text-xs text-slate-700 font-bold">{getClientName(q.client)}</td>
                      <td className="p-3 text-xs text-slate-500 font-mono">{Number(q.total).toLocaleString()} ر.س</td>
                      <td className="p-3"><span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-red-100 text-red-700">{q.status === 'REJECTED' ? 'مرفوض' : 'ملغى'}</span></td>
                      <td className="p-3 text-[11px] text-slate-500 max-w-[200px] truncate" title={q.notes}>{q.notes || "لا يوجد سبب مسجل"}</td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">{format(new Date(q.updatedAt || q.createdAt), "yyyy-MM-dd")}</td>
                    </tr>
                  ))}
                  {displayData.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm font-bold">لا توجد عروض ملغاة</td></tr>}
                </tbody>
              </table>
            ) : (
              // ==========================================
              // جدول طلبات الاسترجاع (REFUNDS)
              // ==========================================
              <table className="w-full text-right border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">الكود</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">العميل</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">المبلغ المحصل</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">الحالة</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200">التاريخ</th>
                    <th className="p-3 text-[11px] text-slate-500 font-black border-b border-slate-200 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-xs font-bold text-violet-700 font-mono">{q.number}</td>
                      <td className="p-3 text-xs text-slate-700 font-bold">{getClientName(q.client)}</td>
                      <td className="p-3 text-xs font-bold text-violet-600 font-mono">{Number(q.collectedAmount).toLocaleString()} ر.س</td>
                      <td className="p-3">
                        {q.status === 'REFUND_IN_PROGRESS' 
                          ? <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-orange-100 text-orange-700">قيد المعالجة</span>
                          : <span className="px-2 py-1 rounded-lg text-[9px] font-bold bg-green-100 text-green-700">مسترد بالكامل</span>
                        }
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">{format(new Date(q.updatedAt), "yyyy-MM-dd")}</td>
                      <td className="p-3 text-center">
                        {q.status === 'REFUND_IN_PROGRESS' && (
                          <button onClick={() => {
                            if(window.confirm("هل تأكدت من تحويل المبلغ للعميل؟ سيتم إغلاق الملف كـ (مسترد بالكامل).")) {
                              updateStatusMutation.mutate({ id: q.id, status: "REFUNDED" });
                            }
                          }} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold hover:bg-green-600 hover:text-white flex items-center gap-1.5 mx-auto transition-colors">
                            <CircleCheckBig className="w-3.5 h-3.5" /> إتمام الاسترجاع
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayData.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm font-bold">لا توجد طلبات استرجاع</td></tr>}
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