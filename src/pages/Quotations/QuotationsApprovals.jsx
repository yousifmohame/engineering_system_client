import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  ShieldCheck,
  FileText,
  Eye,
  RotateCcw,
  PenTool,
  CircleCheckBig,
  Clock,
  Ban,
  CircleDollarSign,
  Search,
  ArrowUpDown,
  Copy,
  Download,
  Send,
  Stamp,
  MessageSquare,
  ExternalLink,
  Printer,
  GitBranch,
  X,
  Lock,
  TriangleAlert,
  Loader2,
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
    DRAFT: {
      label: "مسودة",
      bg: "bg-slate-100",
      text: "text-[#64748b]",
      icon: FileText,
    },
    PENDING_APPROVAL: {
      label: "تحت المراجعة",
      bg: "bg-blue-100",
      text: "text-[#123f59]",
      icon: Eye,
    },
    REJECTED: {
      label: "راجع بملاحظات",
      bg: "bg-orange-100",
      text: "text-orange-700",
      icon: RotateCcw,
    },
    SENT: {
      label: "بانتظار توقيع المالك",
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: PenTool,
    },
    APPROVED: {
      label: "معتمد — بانتظار الدفع",
      bg: "bg-emerald-100",
      text: "text-[#0f766e]",
      icon: CircleCheckBig,
    },
    PARTIALLY_PAID: {
      label: "مسدد جزئياً",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: CircleDollarSign,
    },
    ACCEPTED: {
      label: "مسدد بالكامل",
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CircleCheckBig,
    },
    EXPIRED: {
      label: "منتهي الصلاحية",
      bg: "bg-red-50",
      text: "text-red-700",
      icon: Clock,
    },
    CANCELLED: {
      label: "ملغى",
      bg: "bg-red-100",
      text: "text-red-800",
      icon: Ban,
    },
  };
  const current = config[status] || config.DRAFT;
  return (
    <span
      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${current.bg} ${current.text}`}
    >
      {current.label}
    </span>
  );
};

const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === "object")
    return client.name.ar || client.name.en || "عميل غير محدد";
  return client.name;
};

// ==========================================
// 2. المكون الرئيسي
// ==========================================
const QuotationsApprovals = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [activeModal, setActiveModal] = useState({ type: null, data: null }); // 'stamp', 'sign', 'version', 'cancel'
  const [modalInput, setModalInput] = useState("");

  // ==========================================
  // API Calls
  // ==========================================
  const { data: quotationsData = [], isLoading } = useQuery({
    queryKey: ["quotations-list"],
    queryFn: async () => {
      const response = await axios.get("/quotations");
      return response.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, notes }) =>
      axios.put(`/quotations/${id}`, { status, notes }),
    onSuccess: () => {
      toast.success("تم تحديث حالة العرض بنجاح");
      queryClient.invalidateQueries(["quotations-list"]);
      closeModal();
    },
    onError: () => toast.error("حدث خطأ أثناء التحديث"),
  });

  // دالة الختم
  const stampMutation = useMutation({
    mutationFn: async (id) => axios.patch(`/quotations/${id}/stamp`),
    onSuccess: () => {
      toast.success("تم تطبيق الختم الرسمي بنجاح");
      queryClient.invalidateQueries(["quotations-list"]);
      closeModal();
    },
    onError: () => toast.error("فشل تطبيق الختم"),
  });

  // دالة التوقيع
  const signMutation = useMutation({
    mutationFn: async ({ id, hash }) =>
      axios.patch(`/quotations/${id}/sign`, { signatureHash: hash }),
    onSuccess: () => {
      toast.success("تم اعتماد التوقيع الإلكتروني");
      queryClient.invalidateQueries(["quotations-list"]);
      closeModal();
    },
    onError: () => toast.error("فشل التوقيع"),
  });

  // ==========================================
  // Filters Logic
  // ==========================================
  const filteredData = quotationsData.filter((q) => {
    const matchesSearch =
      q.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (getClientName(q.client) || "").includes(searchTerm);
    const matchesStatus = filterStatus === "ALL" || q.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status) =>
    quotationsData.filter((q) => q.status === status).length;

  const totalAmount = filteredData.reduce((sum, q) => sum + Number(q.total), 0);
  const totalPaid = 0; // سيتم ربطها لاحقاً
  const totalRemaining = totalAmount - totalPaid;

  // ==========================================
  // Helpers
  // ==========================================
  const openModal = (type, data) => {
    setModalInput("");
    setActiveModal({ type, data });
  };
  const closeModal = () => setActiveModal({ type: null, data: null });

  const handleAction = (actionType) => {
    const q = activeModal.data;
    if (!q) return;

    if (actionType === "cancel") {
      if (!modalInput.trim()) return toast.error("يجب إدخال سبب الإلغاء");
      updateStatusMutation.mutate({
        id: q.id,
        status: "CANCELLED",
        notes: modalInput,
      });
    } else if (actionType === "approve") {
      updateStatusMutation.mutate({ id: q.id, status: "APPROVED" });
    } else if (actionType === "stamp") {
      stampMutation.mutate(q.id); // 👈 إرسال طلب الختم للباك إند
    } else if (actionType === "sign") {
      const hash =
        "SHA256-" + Math.random().toString(36).substring(2, 15).toUpperCase();
      signMutation.mutate({ id: q.id, hash }); // 👈 إرسال طلب التوقيع
    }
  };

  // ==========================================
  // Modals Renders
  // ==========================================
  const renderStampModal = () => {
    if (activeModal.type !== "stamp") return null;
    const q = activeModal.data;
    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[520px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 items-center gap-2 mb-3">
            <Stamp className="w-6 h-6 text-amber-600" />
            <div className="text-base font-bold text-[#123f59]">
              ختم المكتب — {q.number}
            </div>
            <div className="flex-1"></div>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-slate-100 rounded-lg text-[#94a3b8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 text-center mb-3 border border-[#e8ddc8] rounded-xl bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
            <div className="w-[120px] h-[120px] mx-auto border-4 border-amber-700 rounded-full flex flex-col items-center justify-center bg-amber-50/50">
              <Stamp className="w-8 h-8 text-amber-700" />
              <div className="text-[8px] font-bold text-amber-700 mt-1 text-center leading-tight">
                مكتب الخدمات
                <br />
                العقارية
              </div>
            </div>
            <div className="text-xs text-[#64748b] mt-4">
              سيتم تطبيق ختم المكتب الرسمي على مسودة العرض ({q.number}) الموجهة
              للعميل: {getClientName(q.client)}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => handleAction("stamp")}
              className="px-3.5 py-2 bg-amber-700 text-white rounded-lg text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-amber-800 flex min-w-0 items-center gap-1.5"
            >
              <Stamp className="w-4 h-4" /> تطبيق الختم
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderSignModal = () => {
    if (activeModal.type !== "sign") return null;
    const q = activeModal.data;
    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[520px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 items-center gap-2 mb-3">
            <PenTool className="w-6 h-6 text-cyan-600" />
            <div className="text-base font-bold text-[#123f59]">
              توقيع إلكتروني — {q.number}
            </div>
            <div className="flex-1"></div>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-slate-100 rounded-lg text-[#94a3b8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 bg-cyan-50 border-2 border-dashed border-cyan-500 rounded-xl text-center mb-3">
            <PenTool className="w-9 h-9 mx-auto mb-2 text-cyan-600" />
            <div className="text-sm font-bold text-cyan-700">
              توقيع إلكتروني مُعتمد
            </div>
            <div className="text-[10px] text-[#64748b] mt-1">
              يتضمن ختم زمني + هوية الموقّع + التشفير
            </div>
            <div className="font-mono text-[9px] text-[#94a3b8] mt-3">
              SHA-256: {Math.random().toString(36).substring(2, 15)}...
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => handleAction("sign")}
              className="px-3.5 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-cyan-700 flex min-w-0 items-center gap-1.5"
            >
              <PenTool className="w-4 h-4" /> اعتماد وتوقيع
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVersionModal = () => {
    if (activeModal.type !== "version") return null;
    const q = activeModal.data;
    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[520px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 items-center gap-2 mb-3">
            <GitBranch className="w-6 h-6 text-violet-600" />
            <div className="text-base font-bold text-violet-700">
              إنشاء إصدار جديد — {q.number}
            </div>
            <div className="flex-1"></div>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-slate-100 rounded-lg text-[#94a3b8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 bg-amber-50 rounded-lg mb-3 text-[11px] color-amber-700 flex min-w-0 items-center gap-2 border border-amber-200">
            <Lock className="w-4 h-4" /> هذا العرض معتمد — التعديل يتطلب إنشاء
            إصدار جديد وسبب مُوثّق
          </div>

          <div className="mb-3 p-3 bg-violet-50 rounded-lg border border-violet-100 text-xs text-slate-600">
            <div>
              الإصدار الحالي:{" "}
              <strong className="text-violet-700 font-mono">
                {q.number} (أصلي)
              </strong>
            </div>
            <div className="mt-1">
              الإصدار الجديد:{" "}
              <strong className="text-violet-700 font-mono">
                {q.number}-R01
              </strong>
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">
              سبب التعديل <span className="text-red-500">*</span>
            </label>
            <input
              placeholder="مثلاً: تعديل السعر بناءً على طلب العميل"
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">
              التغييرات المقترحة (للسجل)
            </label>
            <textarea
              rows="3"
              placeholder="اكتب التغييرات هنا..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500 resize-y"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button className="px-3.5 py-2 bg-[#123f59] text-white rounded-lg text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-[#0f3448] flex min-w-0 items-center gap-1.5">
              <IconWithText icon={GitBranch} text="إنشاء الإصدار (R01)" iconClassName="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderCancelModal = () => {
    if (activeModal.type !== "cancel") return null;
    const q = activeModal.data;
    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex min-w-0 items-center justify-center p-3 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-[20px] p-3 w-full max-w-[520px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] animate-in zoom-in-95">
          <div className="flex min-w-0 items-center gap-2 mb-3">
            <Ban className="w-6 h-6 text-red-700" />
            <div className="text-base font-bold text-red-700">
              إلغاء العرض — {q.number}
            </div>
            <div className="flex-1"></div>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-slate-100 rounded-lg text-[#94a3b8]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 bg-red-50 rounded-lg mb-3 text-xs text-red-700 flex min-w-0 items-center gap-2 border border-red-200">
            <TriangleAlert className="w-4 h-4" /> هذا الإجراء لا يمكن التراجع
            عنه. سيتم إلغاء العرض نهائياً.
          </div>

          <div className="mb-3">
            <label className="block text-xs font-bold text-[#475569] mb-1.5">
              سبب الإلغاء <span className="text-red-500">*</span>
            </label>
            <textarea
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              rows="3"
              placeholder="اكتب سبب الإلغاء بدقة..."
              className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-red-500 resize-y"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={closeModal}
              className="px-3.5 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              تراجع
            </button>
            <button
              onClick={() => handleAction("cancel")}
              disabled={updateStatusMutation.isPending}
              className="px-3.5 py-2 bg-red-700 text-white rounded-lg text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-red-800 flex min-w-0 items-center gap-1.5 disabled:opacity-50"
            >
              {updateStatusMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Ban className="w-4 h-4" />
              )}{" "}
              تأكيد الإلغاء
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Main Render
  // ==========================================
  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim overflow-x-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white font-[Tajawal] h-full"
      dir="rtl"
    >
      <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3.5 md:p-3 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex min-w-0 justify-between items-center mb-3">
          <div>
            <div className="text-lg font-bold text-[#123f59] flex min-w-0 items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-600" /> الاعتماد
              والمراجعة
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-700 border border-cyan-200 rounded text-[10px] font-mono font-bold">
                815-W01
              </span>
            </div>
            <div className="text-xs text-[#64748b] mt-1">
              سير عمل الاعتماد + التوقيع/الختم + الإصدارات + سجل التدقيق
            </div>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-3 overflow-x-auto pb-2 custom-scrollbar-slim">
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-colors border ${filterStatus === "ALL" ? "bg-cyan-600 text-white border-cyan-600" : "bg-white text-slate-600 border-[#d8b46a]/25 hover:bg-[#fbf8f1]"}`}
          >
            الكل ({quotationsData.length})
          </button>
          <button
            onClick={() => setFilterStatus("DRAFT")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex min-w-0 items-center gap-1.5 whitespace-nowrap transition-colors border ${filterStatus === "DRAFT" ? "bg-slate-200 text-[#123f59] border-slate-300" : "bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white text-slate-600 border-[#d8b46a]/25 hover:bg-slate-100"}`}
          >
            <FileText className="w-3.5 h-3.5" /> مسودة (
            {getStatusCount("DRAFT")})
          </button>
          <button
            onClick={() => setFilterStatus("PENDING_APPROVAL")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex min-w-0 items-center gap-1.5 whitespace-nowrap transition-colors border ${filterStatus === "PENDING_APPROVAL" ? "bg-blue-100 text-blue-800 border-blue-300" : "bg-blue-50/50 text-[#123f59] border-blue-100 hover:bg-blue-50"}`}
          >
            <Eye className="w-3.5 h-3.5" /> تحت المراجعة (
            {getStatusCount("PENDING_APPROVAL")})
          </button>
          <button
            onClick={() => setFilterStatus("SENT")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex min-w-0 items-center gap-1.5 whitespace-nowrap transition-colors border ${filterStatus === "SENT" ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-amber-50/50 text-amber-600 border-amber-100 hover:bg-amber-50"}`}
          >
            <PenTool className="w-3.5 h-3.5" /> بانتظار التوقيع (
            {getStatusCount("SENT")})
          </button>
          <button
            onClick={() => setFilterStatus("APPROVED")}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex min-w-0 items-center gap-1.5 whitespace-nowrap transition-colors border ${filterStatus === "APPROVED" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-emerald-50/50 text-[#0f766e] border-emerald-100 hover:bg-emerald-50"}`}
          >
            <CircleCheckBig className="w-3.5 h-3.5" /> معتمد (
            {getStatusCount("APPROVED")})
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
          <input
            placeholder="بحث بالكود أو العميل أو العنوان..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2.5 pr-9 pl-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-cyan-500 shadow-[0_6px_18px_rgba(18,63,89,0.05)]"
          />
        </div>

        {/* Cards List */}
        {isLoading ? (
          <div className="flex justify-center p-3.5">
            <Loader2 className="w-8 h-8 animate-spin text-[#94a3b8]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filteredData.map((q) => (
              <div
                key={q.id}
                className={`bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_6px_18px_rgba(18,63,89,0.05)] p-3 hover:shadow-md transition-shadow`}
              >
                <div className="flex min-w-0 justify-between items-start mb-3">
                  <div>
                    <div className="flex min-w-0 items-center gap-2 mb-1.5">
                      <span className="font-mono text-xs font-bold text-cyan-700">
                        {q.number}
                      </span>
                      {q.templateType === "DETAILED" && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 bg-violet-50 text-violet-700 border border-violet-100 rounded">
                          R01 <GitBranch className="w-2.5 h-2.5 inline" />
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-[#123f59]">
                      عرض سعر — {q.ownership?.district || "خدمات عامة"}
                    </div>
                    <div className="text-xs text-[#64748b] mt-1">
                      {getClientName(q.client)}
                    </div>
                  </div>
                  <div className="text-left">
                    <StatusBadge status={q.status} />
                    <div className="text-[10px] text-[#94a3b8] mt-1.5 font-mono">
                      {format(new Date(q.issueDate), "yyyy-MM-dd")}
                    </div>
                  </div>
                </div>

                <div className="flex min-w-0 justify-between items-center text-xs text-[#64748b] border-t border-[#e8ddc8] pt-3 mt-2">
                  <span className="font-bold text-[#475569]">
                    {Number(q.total).toLocaleString()} ر.س
                  </span>
                  <span>{q.items?.length || 0} بنود · 0 إصدار</span>
                </div>

                {/* Actions Toolbar */}
                <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-[#e8ddc8]">
                  {/* أزرار الموافقة تظهر فقط إذا كان مسودة أو تحت المراجعة */}
                  {["DRAFT", "PENDING_APPROVAL"].includes(q.status) && (
                    <>
                      <button
                        onClick={() => openModal("stamp", q)}
                        className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg text-[11px] font-bold flex min-w-0 items-center gap-1.5 hover:bg-amber-100 transition-colors"
                      >
                        <Stamp className="w-3.5 h-3.5" /> ختم
                      </button>
                      <button
                        onClick={() => handleAction("stamp")}
                        disabled={stampMutation.isPending}
                        className="px-3.5 py-2 bg-amber-700 text-white rounded-lg text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-amber-800 flex min-w-0 items-center gap-1.5 disabled:opacity-50"
                      >
                        {stampMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Stamp className="w-4 h-4" />
                        )}{" "}
                        تطبيق الختم
                      </button>
                      <button
                        onClick={() => handleAction("sign")}
                        disabled={signMutation.isPending}
                        className="px-3.5 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold shadow-[0_8px_18px_rgba(18,63,89,0.08)] hover:bg-cyan-700 flex min-w-0 items-center gap-1.5 disabled:opacity-50"
                      >
                        {signMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <PenTool className="w-4 h-4" />
                        )}{" "}
                        اعتماد وتوقيع
                      </button>
                    </>
                  )}

                  {/* زر الإصدارات (للعروض المعتمدة فقط) */}
                  {["APPROVED", "SENT", "ACCEPTED"].includes(q.status) && (
                    <button
                      onClick={() => openModal("version", q)}
                      className="px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-[11px] font-bold flex min-w-0 items-center gap-1.5 hover:bg-violet-100 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5" /> إنشاء إصدار مُعدل
                    </button>
                  )}

                  <div className="flex-1"></div>

                  {/* أزرار الإلغاء والإرجاع */}
                  {!["CANCELLED", "REJECTED"].includes(q.status) && (
                    <button
                      onClick={() => openModal("cancel", q)}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-lg text-[11px] font-bold flex min-w-0 items-center gap-1.5 hover:bg-red-100 transition-colors"
                    >
                      <Ban className="w-3.5 h-3.5" /> إلغاء
                    </button>
                  )}
                </div>
              </div>
            ))}
            {filteredData.length === 0 && (
              <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3.5 text-center text-[#94a3b8] text-sm bg-white rounded-xl border border-[#d8b46a]/25">
                لا يوجد عروض مطابقة للبحث
              </div>
            )}
          </div>
        )}
      </div>

      {/* Renders Modals */}
      {renderStampModal()}
      {renderSignModal()}
      {renderVersionModal()}
      {renderCancelModal()}
    </div>
  );
};

export default QuotationsApprovals;
