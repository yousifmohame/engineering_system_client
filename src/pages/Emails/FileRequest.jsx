import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../api/axios"; // تأكد من مسار axios
import {
  Link as LinkIcon,
  Inbox,
  Send,
  BarChart3,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Search,
  X,
  UploadCloud,
  Settings,
  ShieldCheck,
  Share2,
  Copy,
  Bot,
  CheckCircle2,
  FolderInput,
  HardDrive,
  User,
  Edit,
  Trash2, // 💡 تم إضافة أيقونات التعديل والحذف
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// 1. نافذة إنشاء/تعديل طلب جديد
// ==========================================
const InlineFileRequestGenerator = ({
  isOpen,
  onClose,
  onSave,
  isPending,
  initialData,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    maxSizeMB: 10,
    expiresAt: "",
    reqSenderName: true,
    reqSenderPhone: true,
    sentToEmail: "",
  });

  // 💡 تعبئة الحقول إذا كان هناك بيانات مرسلة للتعديل
  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        maxSizeMB: initialData.maxSizeMB || 10,
        expiresAt: initialData.expiresAt
          ? new Date(initialData.expiresAt).toISOString().split("T")[0]
          : "",
        reqSenderName: initialData.reqSenderName ?? true,
        reqSenderPhone: initialData.reqSenderPhone ?? true,
        sentToEmail: initialData.sentToEmail || "",
      });
    } else if (isOpen) {
      // تفريغ الحقول في حالة الإنشاء الجديد
      setFormData({
        title: "",
        description: "",
        maxSizeMB: 10,
        expiresAt: "",
        reqSenderName: true,
        reqSenderPhone: true,
        sentToEmail: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <LinkIcon size={18} className="text-emerald-600" />
            {isEditing ? "تعديل رابط طلب الوثائق" : "إنشاء رابط طلب وثائق جديد"}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-5 bg-slate-50/50">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <FileText size={16} className="text-blue-500" /> تفاصيل الطلب
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  عنوان الطلب *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="مثال: طلب مستندات المعاملة رقم 1024"
                  className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  الوثائق المطلوبة (وصف)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="يرجى إرفاق الهوية الوطنية ورخصة البناء..."
                  className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Settings size={16} className="text-amber-500" /> إعدادات الرفع
              (وحدود الأمان)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  أقصى حجم للملف (MB)
                </label>
                <input
                  type="number"
                  value={formData.maxSizeMB}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSizeMB: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg text-sm outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  تاريخ انتهاء الرابط
                </label>
                <input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                  className="w-full p-2 border rounded-lg text-sm outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-sm font-medium text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reqSenderName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reqSenderName: e.target.checked,
                    })
                  }
                  className="accent-emerald-600 w-4 h-4"
                />{" "}
                طلب اسم المرسل
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.reqSenderPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reqSenderPhone: e.target.checked,
                    })
                  }
                  className="accent-emerald-600 w-4 h-4"
                />{" "}
                طلب رقم الجوال
              </label>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Share2 size={16} className="text-purple-500" /> خيارات الإرسال
              المباشر (اختياري)
            </h4>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                البريد الإلكتروني للعميل
              </label>
              <input
                type="email"
                value={formData.sentToEmail}
                onChange={(e) =>
                  setFormData({ ...formData, sentToEmail: e.target.value })
                }
                placeholder="client@example.com"
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
          >
            إلغاء
          </button>
          <button
            disabled={isPending || !formData.title}
            onClick={() => onSave(formData)}
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              "جاري الحفظ..."
            ) : (
              <>
                <LinkIcon size={16} />{" "}
                {isEditing ? "تحديث الرابط" : "توليد وإرسال الرابط"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. إدارة الملفات المستلمة (نفس الكود السابق لم يتغير)
const InlineReceivedFilesManager = ({ files, onPreview }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Inbox className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm font-bold">لا توجد ملفات مستلمة حالياً</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-50/50">
      <div className="space-y-4">
        {files.map((file) => (
          <div
            key={file.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold uppercase shrink-0 border border-blue-100 shadow-sm">
                  {file.fileExtension}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    {file.originalName}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />{" "}
                      {new Date(file.uploadedAt).toLocaleDateString("ar-SA")}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive size={12} /> {formatFileSize(file.fileSize)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={12} /> المرسل: {file.senderName || "غير محدد"}
                    </span>
                    {file.isSafe ? (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <ShieldCheck size={12} /> مفحوص وآمن
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={12} /> ملف ضار (محذوف)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`/api${file.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <Eye size={14} /> معاينة / تحميل
                </a>
                <button className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5">
                  <FolderInput size={14} /> حفظ في المعاملة
                </button>
              </div>
            </div>

            {file.aiAnalysis && (
              <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl">
                <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
                  <Bot size={18} /> تحليل النظام الذكي للملف (ثقة{" "}
                  {file.aiAnalysis.categoryConfidence * 100}%)
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                    <span className="block text-slate-500 mb-1">
                      نوع المستند
                    </span>
                    <strong className="text-slate-800">
                      {file.aiAnalysis.category === "building-license"
                        ? "رخصة بناء"
                        : file.aiAnalysis.category}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                    <span className="block text-slate-500 mb-1">
                      المعاملة المقترحة
                    </span>
                    <strong className="text-blue-600 block">
                      {file.aiAnalysis.suggestedTransaction
                        ?.transactionNumber || "—"}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                    <span className="block text-slate-500 mb-1">
                      اسم المالك
                    </span>
                    <strong className="text-slate-800 truncate block">
                      {file.aiAnalysis.suggestedTransaction?.ownerName || "—"}
                    </strong>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm bg-emerald-600 text-white flex flex-col justify-center items-center text-center">
                    <span className="block opacity-90 mb-0.5">
                      نسبة المطابقة
                    </span>
                    <strong className="text-lg leading-none">
                      {file.aiAnalysis.suggestedTransaction?.matchPercentage ||
                        0}
                      %
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 💡 المكون الرئيسي (Main Screen)
// ==========================================
export default function FileRequest() {
  const queryClient = useQueryClient();
  const [currentView, setCurrentView] = useState("requests");
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 💡 حالة تتبع الطلب الجاري تعديله
  const [editingRequest, setEditingRequest] = useState(null);

  // جلب البيانات
  const { data, isLoading } = useQuery({
    queryKey: ["file-requests-data"],
    queryFn: async () => {
      const res = await api.get("/file-requests");
      return res.data?.data || { requests: [], receivedFiles: [] };
    },
  });

  const fileRequests = data?.requests || [];
  const receivedFiles = data?.receivedFiles || [];

  // 🚀 إنشاء طلب جديد
  const createRequestMutation = useMutation({
    mutationFn: (newReqData) => api.post("/file-requests", newReqData),
    onSuccess: () => {
      queryClient.invalidateQueries(["file-requests-data"]);
      toast.success("تم توليد الرابط السري بنجاح");
      setShowGenerator(false);
    },
    onError: () => toast.error("حدث خطأ أثناء توليد الرابط"),
  });

  // 🚀 تعديل طلب موجود
  const updateRequestMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/file-requests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["file-requests-data"]);
      toast.success("تم تعديل الطلب بنجاح");
      setShowGenerator(false);
      setEditingRequest(null);
    },
    onError: () => toast.error("حدث خطأ أثناء تعديل الطلب"),
  });

  // 🚀 حذف طلب
  const deleteRequestMutation = useMutation({
    mutationFn: (id) => api.delete(`/file-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["file-requests-data"]);
      toast.success("تم حذف الطلب بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  // دالة موحدة للحفظ (تحدد هل هو إنشاء أم تعديل)
  const handleSaveForm = (formData) => {
    if (editingRequest) {
      updateRequestMutation.mutate({ id: editingRequest.id, data: formData });
    } else {
      createRequestMutation.mutate(formData);
    }
  };

  const openCreateModal = () => {
    setEditingRequest(null);
    setShowGenerator(true);
  };

  const openEditModal = (req) => {
    setEditingRequest(req);
    setShowGenerator(true);
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        "هل أنت متأكد من حذف هذا الطلب؟ لن يتمكن العميل من الدخول للرابط بعد الحذف.",
      )
    ) {
      deleteRequestMutation.mutate(id);
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      sent: {
        label: "بانتظار العميل",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: Send,
      },
      viewed: {
        label: "تم الاطلاع",
        color: "bg-purple-100 text-purple-700 border-purple-300",
        icon: Eye,
      },
      uploaded: {
        label: "تم الرفع",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: CheckCircle,
      },
      completed: {
        label: "مكتمل",
        color: "bg-emerald-100 text-emerald-700 border-emerald-300",
        icon: CheckCircle,
      },
    };
    return configs[status] || configs.sent;
  };

  const filteredRequests = fileRequests.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.title.toLowerCase().includes(query) ||
      req.requestNumber.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white font-[Tajawal]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-l from-emerald-600 to-emerald-700 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg shadow-sm">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">مركز طلب وإرسال الوثائق</h1>
              <p className="text-sm text-emerald-100 mt-0.5">
                توليد روابط آمنة واستقبال الملفات مع فحص الفيروسات تلقائياً 🛡️
              </p>
            </div>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 text-sm font-bold rounded-lg hover:bg-emerald-50 shadow-sm"
          >
            <Plus className="w-4 h-4" /> إنشاء رابط طلب جديد
          </button>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {currentView === "requests" && (
            <div className="flex-1 w-full relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث برقم أو عنوان الطلب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          )}
          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm w-full md:w-auto">
            <button
              onClick={() => setCurrentView("requests")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold transition-colors ${currentView === "requests" ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Send className="w-4 h-4" /> الروابط المرسلة
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${currentView === "requests" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {fileRequests.length}
              </span>
            </button>
            <button
              onClick={() => setCurrentView("received")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold border-r border-slate-300 transition-colors ${currentView === "received" ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Inbox className="w-4 h-4" /> الملفات المستلمة
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] ${currentView === "received" ? "bg-white/20 text-white" : "bg-red-100 text-red-600"}`}
              >
                {receivedFiles.filter((f) => !f.isProcessed).length}
              </span>
            </button>
            <button
              onClick={() => setCurrentView("stats")}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold border-r border-slate-300 transition-colors ${currentView === "stats" ? "bg-emerald-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <BarChart3 className="w-4 h-4" /> الإحصائيات
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-hidden bg-slate-50/30">
        {/* Requests View */}
        {currentView === "requests" && (
          <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            {isLoading ? (
              <div className="text-center p-10">جاري التحميل...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <LinkIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm font-bold">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRequests.map((req) => {
                  const statusBadge = getStatusBadge(req.status);
                  const StatusIcon = statusBadge.icon;
                  return (
                    <div
                      key={req.id}
                      className="p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="text-sm font-bold text-slate-900 leading-tight pr-2">
                              {req.title}
                            </h3>

                            {/* 💡 أزرار التعديل والحذف */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openEditModal(req)}
                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                title="تعديل"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(req.id)}
                                className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                title="حذف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-500 mb-3">
                            {req.description || "بدون وصف"}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                            <span className="font-bold text-emerald-700 font-mono">
                              {req.requestNumber}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock size={10} />{" "}
                              {new Date(req.createdAt).toLocaleDateString(
                                "ar-SA",
                              )}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end mb-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 ${statusBadge.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />{" "}
                          {statusBadge.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-auto">
                        <div className="text-center border-l border-slate-200">
                          <div className="text-lg font-black text-slate-700">
                            {req.viewCount}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                            زيارة للرابط
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-emerald-600">
                            {req.uploadCount}
                          </div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                            ملف مرفوع
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(req.uniqueLink);
                          toast.success("تم نسخ الرابط السري الموجه للعميل");
                        }}
                        className="w-full px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Copy size={14} /> نسخ الرابط لمشاركته مع العميل
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Received Files View */}
        {currentView === "received" && (
          <InlineReceivedFilesManager files={receivedFiles} />
        )}

        {/* Stats View */}
        {currentView === "stats" && (
          <div className="h-full overflow-y-auto p-6 bg-slate-50/50">
            {/* Stats UI placeholder */}
            <div className="text-center py-20 text-slate-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="font-bold">مخططات الإحصائيات</p>
            </div>
          </div>
        )}
      </div>

      {/* 💡 المودال أصبح ديناميكياً للإنشاء والتعديل معاً */}
      <InlineFileRequestGenerator
        isOpen={showGenerator}
        onClose={() => {
          setShowGenerator(false);
          setEditingRequest(null);
        }}
        onSave={handleSaveForm}
        isPending={
          createRequestMutation.isPending || updateRequestMutation.isPending
        }
        initialData={editingRequest}
      />
    </div>
  );
}
