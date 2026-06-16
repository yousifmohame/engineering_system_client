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
  FileText,
  Loader2,
  X,
  User,
  MapPin,
  Landmark,
  Paperclip,
  Clock,
  RefreshCw,
  MessageSquare,
  Send,
  DownloadCloud
} from "lucide-react";

import { getFullUrl } from "../../../utils/urlUtils";
// 🌟 استدعاء سياق المصادقة لمعرفة المستخدم الحالي
import { useAuth } from "../../../context/AuthContext"; 

const formatCurrency = (value) => Number(value || 0).toLocaleString("ar-SA");

// مترجم لحالات السجل التاريخي
const translateAction = (action) => {
  switch (action) {
    case 'CREATE': return { label: 'إنشاء مسودة', color: 'text-blue-600 bg-blue-50' };
    case 'SUBMIT': return { label: 'إرسال للمراجعة', color: 'text-purple-600 bg-purple-50' };
    case 'REQUEST_MODIFICATION': return { label: 'طلب تعديل', color: 'text-amber-600 bg-amber-50' };
    case 'REJECT': return { label: 'رفض نهائي', color: 'text-rose-600 bg-rose-50' };
    case 'APPROVE': return { label: 'اعتماد وختم', color: 'text-emerald-600 bg-emerald-50' };
    case 'RESTORE': return { label: 'استرجاع من السلة', color: 'text-cyan-600 bg-cyan-50' };
    default: return { label: 'إجراء نظام', color: 'text-slate-600 bg-slate-50' };
  }
};

// ==========================================
// 1. المكون الفرعي: نافذة المراجعة والاعتماد
// ==========================================
const QuotationReviewModal = ({ quoteId, onClose }) => {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // 🌟 جلب بيانات المستخدم الحالي
  const [reasonModal, setReasonModal] = useState({ isOpen: false, type: null, text: '' }); 

  // جلب تفاصيل العرض (تتضمن السجلات والمرفقات)
  const { data: quote, isLoading } = useQuery({
    queryKey: ["quotation-review", quoteId],
    queryFn: async () => (await axios.get(`/quotations/${quoteId}`)).data.data,
    enabled: !!quoteId,
  });

  // دالة الإجراءات المحدثة
  const actionMutation = useMutation({
    mutationFn: async ({ actionType, payload }) => {
      let endpoint = '';
      
      if (actionType === "SUBMIT") endpoint = `/quotations/${quoteId}/submit`;
      if (actionType === "APPROVE") endpoint = `/quotations/${quoteId}/approve`;
      if (actionType === "REJECT") endpoint = `/quotations/${quoteId}/reject`;
      if (actionType === "MODIFY") endpoint = `/quotations/${quoteId}/modify`;

      // 🌟 السيرفر سيقوم بكل شيء (تغيير الحالة + توليد QR + إنشاء PDF) ويعيد لنا النتيجة!
      const res = await axios.put(endpoint, payload || {});
      return res.data;
    },
    onSuccess: (_, variables) => {
      let msg = "تمت العملية بنجاح";
      if (variables.actionType === "SUBMIT") msg = "تم تقديم العرض للمشرف للمراجعة بنجاح!";
      if (variables.actionType === "APPROVE") msg = "تم اعتماد العرض وختمه إلكترونياً!";
      if (variables.actionType === "REJECT") msg = "تم رفض العرض وإرسال السبب للموظف.";
      if (variables.actionType === "MODIFY") msg = "تمت إعادة العرض للموظف لعمل التعديلات المطلوبة.";

      toast.success(msg);
      setReasonModal({ isOpen: false, type: null, text: '' });
      queryClient.invalidateQueries(["supervisor-quotations"]);
      queryClient.invalidateQueries(["quotations-stats"]);
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "حدث خطأ أثناء تنفيذ الإجراء"),
  });

  const handleActionClick = (type) => {
    if (type === 'APPROVE') {
      if (window.confirm("هل أنت متأكد من اعتماد هذا العرض وختمه بشكل نهائي؟")) {
        actionMutation.mutate({ actionType: "APPROVE", payload: {} });
      }
    } else if (type === 'SUBMIT') {
      if (window.confirm("هل أنت متأكد من إرسال هذا العرض للمراجعة والاعتماد؟")) {
        actionMutation.mutate({ actionType: "SUBMIT", payload: {} });
      }
    } else {
      setReasonModal({ isOpen: true, type, text: '' });
    }
  };

  const submitReasonAction = () => {
    if (!reasonModal.text.trim()) return toast.error("الرجاء كتابة الملاحظات أو السبب أولاً");
    const payload = reasonModal.type === 'REJECT' ? { reason: reasonModal.text } : { notes: reasonModal.text };
    actionMutation.mutate({ actionType: reasonModal.type, payload });
  };

  if (!quoteId) return null;

  // التحقق هل المستخدم الحالي هو منشئ العرض
  const isCreator = user?.id === quote?.createdBy;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-cairo animate-in fade-in duration-200" dir="rtl">
      
      {/* 🔴 نافذة إدخال السبب المنبثقة */}
      {reasonModal.isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in zoom-in-95">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200">
            <div className={`p-4 text-white font-black flex items-center gap-2 ${reasonModal.type === 'REJECT' ? 'bg-rose-600' : 'bg-amber-500'}`}>
              {reasonModal.type === 'REJECT' ? <XCircle size={18} /> : <RefreshCw size={18} />}
              {reasonModal.type === 'REJECT' ? 'تأكيد الرفض النهائي للعرض' : 'طلب تعديل من الموظف'}
            </div>
            <div className="p-4">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                {reasonModal.type === 'REJECT' ? 'الرجاء توضيح سبب الرفض (سيتم حفظه في السجل):' : 'الرجاء كتابة التعديلات المطلوبة بوضوح:'}
              </label>
              <textarea
                value={reasonModal.text}
                onChange={(e) => setReasonModal({ ...reasonModal, text: e.target.value })}
                className="w-full h-32 p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 outline-none resize-none"
                placeholder="اكتب ملاحظاتك هنا..."
              />
              <div className="flex gap-2 mt-4">
                <button
                  disabled={actionMutation.isPending}
                  onClick={submitReasonAction}
                  className={`flex-1 py-2 text-white text-sm font-black rounded-xl transition-colors ${reasonModal.type === 'REJECT' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-amber-500 hover:bg-amber-600'}`}
                >
                  {actionMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'تأكيد الإرسال'}
                </button>
                <button onClick={() => setReasonModal({ isOpen: false, type: null, text: '' })} className="px-6 py-2 bg-slate-100 text-slate-600 hover:bg-slate-200 text-sm font-bold rounded-xl transition-colors">
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الشاشة الرئيسية للمراجعة */}
      <div className="bg-white w-full max-w-[95vw] h-[95vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-[#e2bf74]/30 text-[#e2bf74]">
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black flex items-center gap-2">
                مراجعة وتدقيق عرض السعر
                {quote && <span className="bg-[#e2bf74] text-[#06111d] px-2 py-0.5 rounded text-[10px]">{quote.number}</span>}
              </h2>
              <p className="text-[10px] text-white/60 font-bold mt-0.5">شاشة التدقيق والمراجعة - المرفقات والاعتمادات</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-rose-500/20 rounded-xl transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading || !quote ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-[#123f59]" />
            <span className="text-xs font-bold">جاري جلب تفاصيل العرض...</span>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0 overflow-hidden bg-[#fbf8f1]/50">
            
            {/* القائمة اليمنى: التفاصيل والإجراءات والمرفقات والسجلات */}
            <div className="w-[380px] shrink-0 border-l border-slate-200 bg-white flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar-slim space-y-4">
                
                {/* 1. معلومات الارتباط */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] font-black text-slate-400 mb-2">معلومات الارتباط الأساسية</div>
                  <div className="space-y-2.5 text-xs font-bold text-[#123f59]">
                    <div className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-indigo-500" /> {quote.client?.name?.ar || quote.client?.name || "غير محدد"}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> {quote.ownership?.code || "بدون ملكية مرتبطة"}</div>
                    <div className="flex items-center gap-2"><Landmark className="w-3.5 h-3.5 text-amber-500" /> قالب: {quote.templateType === 'SUMMARY' ? 'مختصر' : 'تفصيلي'}</div>
                  </div>
                </div>

                {/* 2. الملخص المالي */}
                <div className="p-3 bg-gradient-to-br from-[#eef7f6] to-white rounded-xl border border-emerald-100">
                  <div className="text-[10px] font-black text-emerald-600 mb-2">الملخص المالي</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>المجموع (قبل الضريبة):</span> <span className="font-mono font-bold">{formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>الضريبة ({quote.taxRate * 100}%):</span> <span className="font-mono font-bold">{formatCurrency(quote.taxAmount)}</span>
                    </div>
                    <div className="h-px w-full bg-emerald-100 my-1"></div>
                    <div className="flex justify-between text-sm font-black text-[#0f766e]">
                      <span>الإجمالي المستحق:</span> <span className="font-mono">{formatCurrency(quote.total)} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* 🌟 3. المرفقات (معززة للمشرف) */}
                <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-[11px] font-black text-blue-800 flex items-center gap-1.5">
                      <Paperclip className="w-3.5 h-3.5" /> مسوغات ومرفقات العرض
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                      {quote.attachments?.length || 0} ملف
                    </span>
                  </div>
                  
                  {quote.attachments?.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar-slim pr-1">
                      {quote.attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-all group">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                            <span className="text-[11px] font-bold text-slate-700 truncate" title={att.fileName}>{att.fileName}</span>
                          </div>
                          <a 
                            href={getFullUrl(att.filePath)} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors shrink-0"
                            title="تنزيل / عرض"
                          >
                            <DownloadCloud className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-4 bg-white/50 rounded-lg border border-dashed border-blue-200 text-[10px] text-slate-500 font-bold">
                      لم يتم إرفاق أي مسوغات أو ملفات داعمة مع هذا العرض.
                    </div>
                  )}
                </div>

                {/* 4. السجل التاريخي (Audit Logs) */}
                {quote.logs?.length > 0 && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <div className="text-[10px] font-black text-slate-400 mb-3 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> سجل الحركات والاعتمادات
                    </div>
                    <div className="relative border-r border-slate-200 pr-3 mr-1 space-y-4">
                      {quote.logs.map(log => {
                        const meta = translateAction(log.action);
                        return (
                          <div key={log.id} className="relative">
                            <span className="absolute -right-[17px] top-1 w-2 h-2 rounded-full bg-slate-300 border-2 border-white" />
                            <div className="bg-slate-50 rounded-lg p-2 border border-slate-100">
                              <div className="flex justify-between items-start mb-1">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${meta.color}`}>{meta.label}</span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {format(new Date(log.createdAt), "yyyy-MM-dd hh:mm a")}
                                </span>
                              </div>
                              <div className="text-[10px] font-bold text-slate-600 mb-1 flex items-center gap-1">
                                <User className="w-3 h-3" /> {log.userName || "النظام"}
                              </div>
                              {log.notes && (
                                <div className="text-[10px] text-slate-700 bg-white p-1.5 rounded border border-slate-200 flex items-start gap-1">
                                  <MessageSquare className="w-3 h-3 mt-0.5 text-slate-400 shrink-0" />
                                  <p className="leading-relaxed">{log.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 🌟 شريط الإجراءات الديناميكي بناءً على الحالة والصلاحية */}
              {quote.status === "PENDING_APPROVAL" ? (
                <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-2 shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                  <div className="text-[10px] font-bold text-center text-slate-500 mb-1">أنت تتصرف الآن بصفتك: مشرف الاعتمادات</div>
                  <button
                    disabled={actionMutation.isPending}
                    onClick={() => handleActionClick("APPROVE")}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    {actionMutation.isPending && reasonModal.type === null ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    اعتماد، توليد PDF، والختم النهائي
                  </button>

                  <div className="flex gap-2">
                    <button
                      disabled={actionMutation.isPending}
                      onClick={() => handleActionClick("MODIFY")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 py-2 rounded-xl text-[11px] font-black transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> طلب تعديل
                    </button>
                    <button
                      disabled={actionMutation.isPending}
                      onClick={() => handleActionClick("REJECT")}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 py-2 rounded-xl text-[11px] font-black transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" /> رفض نهائي
                    </button>
                  </div>
                </div>
              ) : (quote.status === "DRAFT" || quote.status === "NEEDS_MODIFICATION") ? (
                <div className="p-4 border-t border-amber-200 bg-amber-50 flex flex-col gap-2 shrink-0">
                  <div className="text-[10px] text-amber-800 text-center mb-1 flex flex-col gap-1 font-bold">
                    <span>حالة العرض: {quote.status === "DRAFT" ? "مسودة غير مكتملة" : "مُعاد للتعديل"}</span>
                    <span className="text-slate-500">تم إنشاؤه بواسطة: {quote.creator?.name || "الموظف"}</span>
                  </div>
                  
                  {/* زر التقديم متاح لمنشئ العرض أو للمشرفين */}
                  <button
                    disabled={actionMutation.isPending}
                    onClick={() => handleActionClick("SUBMIT")}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-black shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50"
                  >
                    {actionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    إرسال العرض للمراجعة والاعتماد
                  </button>
                </div>
              ) : (
                <div className="p-4 border-t border-slate-200 bg-slate-100 text-center text-xs font-bold text-slate-500">
                  العرض معتمد أو ملغي ولا يتطلب إجراءً حالياً
                </div>
              )}
            </div>

            {/* القسم الأيسر: مستعرض الـ PDF التفاعلي */}
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
                  <span className="text-sm font-bold">لم يتم توليد ملف PDF النهائي بعد</span>
                  <span className="text-xs mt-1">سيتم توليد الملف تلقائياً بمجرد الاعتماد وتطبيق الختم</span>
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
// 2. الشاشة الرئيسية للوحة المشرف
// ==========================================
export default function QuotationsSupervisorScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reviewQuoteId, setReviewQuoteId] = useState(null);

  const { data: quotations, isLoading, error } = useQuery({
    queryKey: ["supervisor-quotations"],
    queryFn: async () => {
      const res = await axios.get("/quotations");
      // تصفية الواجهة لعرض المسودات والطلبات التي تحتاج مراجعة أو تعديل فقط
      return res.data.data.filter(q => 
        q.status === "DRAFT" || 
        q.status === "PENDING_APPROVAL" ||
        q.status === "NEEDS_MODIFICATION"
      );
    },
    refetchInterval: 30000, 
  });

  const filteredData = useMemo(() => {
    if (!quotations) return [];
    const term = searchTerm.toLowerCase();
    return quotations.filter(
      (q) => !searchTerm || q.number?.toLowerCase().includes(term) || q.client?.name?.toLowerCase().includes(term),
    );
  }, [quotations, searchTerm]);

  return (
    <div className="flex flex-col h-full bg-transparent p-4" dir="rtl">
      
      {/* استدعاء نافذة المراجعة */}
      <QuotationReviewModal quoteId={reviewQuoteId} onClose={() => setReviewQuoteId(null)} />

      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-lg font-black text-[#123f59] flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-[#c5983c]" />
            طلبات الاعتماد والمراجعة الفنية
          </h1>
          <p className="text-xs font-bold text-slate-500 mt-1">
            إدارة عروض الأسعار التي تتطلب المراجعة، طلب التعديلات، أو الاعتماد النهائي لتوليد العقد.
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
              <span className="text-xs">لا توجد عروض أسعار بانتظار الاعتماد أو المراجعة حالياً.</span>
            </div>
          ) : (
            <table className="w-full text-right border-collapse">
              <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">رقم العرض</th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">تاريخ الإنشاء</th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">العميل</th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">الحالة</th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200">الإجمالي</th>
                  <th className="p-3 text-[11px] text-slate-500 font-bold border-b border-slate-200 text-center">إجراء المشرف</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((q) => (
                  <tr key={q.id} className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
                    <td className="p-3 font-mono text-xs font-bold text-[#123f59]">{q.number}</td>
                    <td className="p-3 text-xs text-slate-500 font-mono">
                      {format(new Date(q.createdAt), "yyyy-MM-dd", { locale: arSA })}
                    </td>
                    <td className="p-3 text-xs font-bold text-slate-700">
                      {q.client?.name?.ar || q.client?.name || "—"}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                        q.status === "PENDING_APPROVAL" ? "bg-amber-100 text-amber-700" :
                        q.status === "NEEDS_MODIFICATION" ? "bg-rose-100 text-rose-700" :
                        "bg-slate-100 text-slate-600"
                      }`}>
                        {q.status === "PENDING_APPROVAL" ? "تحت المراجعة (بانتظارك)" : 
                         q.status === "NEEDS_MODIFICATION" ? "مُعاد للموظف (قيد التعديل)" : 
                         "مسودة (عند الموظف)"}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs font-bold text-emerald-600">
                      {formatCurrency(q.total)} ر.س
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => setReviewQuoteId(q.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors shadow-sm ${
                          q.status === "PENDING_APPROVAL" 
                            ? "bg-[#123f59] text-white hover:bg-[#0e7490] animate-pulse-slow" 
                            : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> 
                        {q.status === "PENDING_APPROVAL" ? "استعراض واتخاذ قرار" : "عرض التفاصيل"}
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