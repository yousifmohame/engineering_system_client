import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Ban, Undo2, CircleCheckBig, DollarSign, RotateCcw,
  Search, X, TriangleAlert, Loader2
} from "lucide-react";
import { format } from "date-fns";

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
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-2xl p-6 w-full max-w-[480px] shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-5">
            <div className="text-base font-bold text-red-600 flex items-center gap-2">
              <Ban className="w-5 h-5" /> إلغاء عرض سعر
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          {selectedQuote && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg mb-4 text-xs text-red-700">
              <strong>{selectedQuote.number}</strong> — {getClientName(selectedQuote.client)} — {Number(selectedQuote.total).toLocaleString()} ر.س
            </div>
          )}

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">العرض المراد إلغاؤه</label>
            <select 
              value={cancelForm.quotationId} 
              onChange={e => setCancelForm({...cancelForm, quotationId: e.target.value})}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-red-500"
            >
              <option value="">-- اختر عرضاً --</option>
              {processedData.cancellableQuotes.map(q => (
                <option key={q.id} value={q.id}>{q.number} — {getClientName(q.client)}</option>
              ))}
            </select>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب الإلغاء <span className="text-red-500">*</span></label>
            <textarea 
              value={cancelForm.reason}
              onChange={e => setCancelForm({...cancelForm, reason: e.target.value})}
              rows="3" 
              placeholder="اذكر سبب إلغاء العرض..." 
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-red-500 resize-y"
            ></textarea>
          </div>

          <div className="flex gap-2">
            <button onClick={handleCancelQuote} disabled={updateStatusMutation.isPending} className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-red-700 flex items-center gap-1.5 disabled:opacity-50">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Ban className="w-4 h-4" />} تأكيد الإلغاء
            </button>
            <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200">تراجع</button>
          </div>
        </div>
      </div>
    );
  };

  const renderRefundModal = () => {
    if (activeModal !== 'refund') return null;
    const selectedQuote = processedData.refundableQuotes.find(q => q.id === refundForm.quotationId);

    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
        <div className="bg-white rounded-2xl p-6 w-full max-w-[480px] shadow-2xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-5">
            <div className="text-base font-bold text-violet-600 flex items-center gap-2">
              <Undo2 className="w-5 h-5" /> طلب استرجاع مبلغ
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"><X className="w-5 h-5" /></button>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">العرض</label>
            <select 
              value={refundForm.quotationId} 
              onChange={e => setRefundForm({...refundForm, quotationId: e.target.value})}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500"
            >
              <option value="">-- اختر عرضاً مسدداً --</option>
              {processedData.refundableQuotes.map(q => (
                <option key={q.id} value={q.id}>{q.number} — {getClientName(q.client)} — المسدد: {Number(q.collectedAmount).toLocaleString()}</option>
              ))}
            </select>
          </div>

          {selectedQuote && (
            <div className="p-3 bg-violet-50 border border-violet-100 rounded-lg mb-4 text-xs text-violet-700">
              المبلغ المسدد: <strong>{Number(selectedQuote.collectedAmount).toLocaleString()} ر.س</strong>
            </div>
          )}

          <div className="flex flex-col gap-3 mb-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">مبلغ الاسترجاع (ر.س) <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                placeholder={`الحد الأقصى: ${selectedQuote ? Number(selectedQuote.collectedAmount).toLocaleString() : '0'}`} 
                value={refundForm.amount}
                onChange={e => setRefundForm({...refundForm, amount: e.target.value})}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-sm font-mono outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">طريقة الاسترجاع</label>
              <select 
                value={refundForm.method}
                onChange={e => setRefundForm({...refundForm, method: e.target.value})}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500"
              >
                <option value="transfer">تحويل بنكي</option>
                <option value="cash">نقد</option>
                <option value="check">شيك</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">سبب الاسترجاع <span className="text-red-500">*</span></label>
              <textarea 
                rows="2" 
                placeholder="سبب طلب الاسترجاع..." 
                value={refundForm.reason}
                onChange={e => setRefundForm({...refundForm, reason: e.target.value})}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500 resize-y"
              ></textarea>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleRequestRefund} disabled={updateStatusMutation.isPending} className="px-6 py-2.5 bg-violet-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-violet-700 flex items-center gap-1.5 disabled:opacity-50">
              {updateStatusMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Undo2 className="w-4 h-4" />} تقديم طلب الاسترجاع
            </button>
            <button onClick={closeModal} className="px-6 py-2.5 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200">تراجع</button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Render Main Page
  // ==========================================
  if (isLoading) {
    return <div className="flex justify-center items-center h-full min-h-screen bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 font-sans h-full" dir="rtl">
      <div className="p-5 md:p-6 max-w-7xl mx-auto">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center"><Ban className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500">إجمالي الملغاة</div><div className="text-lg font-bold text-slate-800">{processedData.kpis.totalCancelled}</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center"><Undo2 className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500">طلبات استرجاع جارية</div><div className="text-lg font-bold text-slate-800">{processedData.kpis.activeRefunds}</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center"><CircleCheckBig className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500">استرجاعات مكتملة</div><div className="text-lg font-bold text-slate-800">{processedData.kpis.completedRefunds}</div></div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-3 hover:-translate-y-0.5 transition-transform">
            <div className="w-10 h-10 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center"><DollarSign className="w-5 h-5" /></div>
            <div><div className="text-[10px] text-slate-500">إجمالي المبالغ المستردة</div><div className="text-lg font-bold text-slate-800 font-mono">{processedData.kpis.totalRefundedAmount.toLocaleString()} ر.س</div></div>
          </div>
        </div>

        {/* Header & Actions */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm mb-4 flex flex-wrap items-center gap-3">
          <RotateCcw className="w-5 h-5 text-red-600 mr-1" />
          <span className="text-sm font-bold text-slate-800">الملغاة والاسترجاعات</span>
          
          <div className="flex-1"></div>

          <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setActiveTab('cancelled')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'cancelled' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>العروض الملغاة</button>
            <button onClick={() => setActiveTab('refunds')} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === 'refunds' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>طلبات الاسترجاع</button>
          </div>

          <button onClick={() => openModal('cancel')} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-bold hover:bg-red-100 flex items-center gap-1.5 ml-2 transition-colors">
            <Ban className="w-3.5 h-3.5" /> إلغاء عرض
          </button>
          <button onClick={() => openModal('refund')} className="px-3 py-1.5 bg-violet-50 text-violet-600 border border-violet-200 rounded-lg text-[11px] font-bold hover:bg-violet-100 flex items-center gap-1.5 transition-colors">
            <Undo2 className="w-3.5 h-3.5" /> طلب استرجاع
          </button>
        </div>

        {/* Table Area */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex justify-end">
            <div className="relative w-[250px]">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                placeholder="بحث بالكود أو العميل..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full py-1.5 pr-9 pl-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-slate-500 bg-slate-50"
              />
            </div>
          </div>
          
          <div className="overflow-x-auto min-h-[300px]">
            {activeTab === 'cancelled' ? (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">الكود</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">العميل</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">الإجمالي</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">الحالة</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">ملاحظات / السبب</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-xs font-bold text-red-600 font-mono">{q.number}</td>
                      <td className="p-3 text-xs text-slate-700 font-bold">{getClientName(q.client)}</td>
                      <td className="p-3 text-xs text-slate-600 font-mono">{Number(q.total).toLocaleString()} ر.س</td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-red-100 text-red-700">ملغى</span>
                      </td>
                      <td className="p-3 text-[11px] text-slate-500 max-w-[200px] truncate" title={q.notes}>{q.notes || "لا يوجد سبب مسجل"}</td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">{format(new Date(q.updatedAt || q.createdAt), "yyyy-MM-dd")}</td>
                    </tr>
                  ))}
                  {displayData.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-slate-400 text-sm">لا توجد عروض ملغاة</td></tr>}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">كود العرض</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">العميل</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">المبلغ المسترد (المحصّل)</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">ملاحظات</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">الحالة</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200">التاريخ</th>
                    <th className="p-3 text-[11px] text-slate-500 font-bold whitespace-nowrap border-b-2 border-slate-200 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.map(q => (
                    <tr key={q.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-3 text-xs font-bold text-blue-600 font-mono">{q.number}</td>
                      <td className="p-3 text-xs text-slate-700 font-bold">{getClientName(q.client)}</td>
                      <td className="p-3 text-xs font-bold text-red-600 font-mono">{Number(q.collectedAmount).toLocaleString()} ر.س</td>
                      <td className="p-3 text-[11px] text-slate-500 max-w-[200px] truncate" title={q.notes}>{q.notes}</td>
                      <td className="p-3">
                        {q.status === 'REFUND_IN_PROGRESS' 
                          ? <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-100 text-orange-700">قيد المعالجة</span>
                          : <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-green-100 text-green-700">مسترد بالكامل</span>
                        }
                      </td>
                      <td className="p-3 text-[11px] text-slate-400 font-mono">{format(new Date(q.updatedAt), "yyyy-MM-dd")}</td>
                      <td className="p-3 text-center">
                        {q.status === 'REFUND_IN_PROGRESS' && (
                          <button onClick={() => handleCompleteRefund(q.id)} className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-lg text-[10px] font-bold hover:bg-green-100 flex items-center gap-1.5 mx-auto transition-colors">
                            <CircleCheckBig className="w-3 h-3" /> إتمام
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {displayData.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-slate-400 text-sm">لا توجد طلبات استرجاع</td></tr>}
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