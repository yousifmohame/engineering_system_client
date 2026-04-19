import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // 💡 تأكد من مسار الـ axios الصحيح
import {
  Search,
  Filter,
  Link as LinkIcon,
  Send,
  Activity,
  Eye,
  Sparkles,
  Unlock,
  Lock,
  Hash,
  Copy,
  Clock,
  Trash2,
  Edit,
  Loader2,
  X,
  Save,
} from "lucide-react";
import { AIActionButton } from "../../Components/ai/AIActionButton"; // 💡 تأكد من المسار
import { toast } from "sonner";

export default function RequestsTab({
  activeTab,
  requests = [],
  setAnalyzingFile,
  onEdit, // 💡 يمكنك الاستمرار بتمرير onEdit لفتح الشاشات الكبيرة إذا أردت
}) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);

  // 🚀 حالة التعديل السريع (نافذة مدمجة)
  const [editingReq, setEditingReq] = useState(null);

  // =========================================
  // 🚀 1. ميوتيشن الحذف (Delete Mutation)
  // =========================================
  const deleteMutation = useMutation({
    mutationFn: async ({ id, isRequest }) => {
      const endpoint = isRequest
        ? `/transfer-center/requests/${id}`
        : `/transfer-center/packages/${id}`;
      await api.delete(endpoint);
    },
    onMutate: (variables) => {
      setDeletingId(variables.id);
    },
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries(["transfer-center-data"]); // تحديث البيانات فوراً
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء عملية الحذف");
    },
    onSettled: () => {
      setDeletingId(null);
    },
  });

  const handleDelete = (e, req) => {
    e.stopPropagation();
    if (
      window.confirm(
        `هل أنت متأكد من رغبتك في حذف "${req.title}" نهائياً؟ لا يمكن التراجع عن هذا الإجراء.`,
      )
    ) {
      deleteMutation.mutate({
        id: req.id,
        isRequest: activeTab === "requests",
      });
    }
  };

  // =========================================
  // 🚀 2. ميوتيشن التعديل (Edit Mutation)
  // =========================================
  const editMutation = useMutation({
    mutationFn: async (data) => {
      const endpoint =
        activeTab === "requests"
          ? `/transfer-center/requests/${data.id}`
          : `/transfer-center/packages/${data.id}`;
      const response = await api.put(endpoint, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("تم تحديث بيانات الرابط بنجاح");
      setEditingReq(null);
      queryClient.invalidateQueries(["transfer-center-data"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "فشل تحديث البيانات");
    },
  });

  const handleQuickEditSubmit = (e) => {
    e.preventDefault();
    editMutation.mutate(editingReq);
  };

  // =========================================
  // 💡 دوال مساعدة للعرض
  // =========================================
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getLinkTypeName = (type) => {
    const types = {
      open: "مفتوح",
      pin: "محمي برمز",
      expire: "ينتهي بوقت",
      single: "مرة واحدة",
    };
    return types[type] || "مفتوح";
  };

  const getPermissionsName = (perm) => {
    const perms = {
      view: "عرض فقط",
      download: "تنزيل فقط",
      both: "عرض وتنزيل",
    };
    return perms[perm] || "";
  };

  const getFilesCount = (req) => {
    if (activeTab === "requests") return req.uploadCount || 0;
    try {
      const files =
        typeof req.filesData === "string"
          ? JSON.parse(req.filesData)
          : req.filesData || [];
      return files.length;
    } catch {
      return 0;
    }
  };

  const handleCopyLink = (req) => {
    const prefix = activeTab === "requests" ? "/req/" : "/s/";
    const url = `https://details-worksystem1.com${prefix}${req.shortLink}`; // 💡 الدومين الخاص بك
    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط بنجاح");
  };

  // الفلترة
  const filteredRequests = requests.filter(
    (r) =>
      (r.title && r.title.includes(searchTerm)) ||
      (r.entityName && r.entityName.includes(searchTerm)),
  );

  return (
    <>
      {/* 💡 شريط البحث والفلترة */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-3 items-center justify-between shrink-0">
        <div className="flex items-center gap-2 flex-1 max-w-sm relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3" />
          <input
            type="text"
            placeholder={`بحث في ${activeTab === "requests" ? "الطلبات" : "الإرسالات"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none hidden sm:block">
            <option>مستوى الجاهزية</option>
            <option>جاهز للاعتماد</option>
            <option>قيد المراجعة</option>
          </select>
          <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none">
            <option>كل الحالات</option>
            <option>نشط</option>
            <option>منتهي</option>
          </select>
          <button className="p-2 border border-slate-200 bg-white rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 💡 قائمة الروابط */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid gap-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all cursor-pointer group"
            >
              {/* أيقونة وتفاصيل أساسية */}
              <div className="flex items-start gap-4 mb-3 sm:mb-0 relative w-full sm:w-auto">
                <div
                  className={`p-3 rounded-xl transition-colors shrink-0 ${activeTab === "requests" ? "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100 group-hover:text-indigo-600" : "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-100 group-hover:text-emerald-600"}`}
                >
                  {activeTab === "requests" ? (
                    <LinkIcon className="w-5 h-5" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-black text-slate-800">
                      {req.title}
                    </h4>

                    {req.systemLinkStatus &&
                      req.systemLinkStatus !== "unlinked" && (
                        <span className="bg-blue-100 text-blue-700 text-[9px] px-1.5 rounded font-black flex items-center gap-0.5">
                          <Activity className="w-2.5 h-2.5" /> مرتبط
                        </span>
                      )}

                    {activeTab === "outbox" && req.permissions && (
                      <span className="bg-sky-100 text-sky-700 text-[9px] px-1.5 rounded font-black flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5" />{" "}
                        {getPermissionsName(req.permissions)}
                      </span>
                    )}

                    {activeTab === "requests" &&
                      req.uploadCount > 0 &&
                      req.status === "نشط" && (
                        <span className="bg-amber-100 text-amber-700 text-[9px] px-1.5 rounded font-black flex items-center gap-0.5 border border-amber-200">
                          <Sparkles className="w-2.5 h-2.5" /> متاح للفحص
                        </span>
                      )}
                  </div>

                  <p className="text-[10px] text-slate-500 font-bold mb-1">
                    {activeTab === "requests" ? "موجه إلى:" : "المرسل إليه:"}{" "}
                    <span className="text-slate-700">
                      {req.entityName || "رابط عام"}
                    </span>{" "}
                    • {formatDate(req.createdAt)}
                  </p>

                  <div className="flex gap-3 text-[10px] font-black">
                    <span className="text-slate-400">
                      الملفات: {getFilesCount(req)}
                    </span>
                    <span className="text-slate-400">
                      الزيارات: {req.viewCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* الأزرار والإجراءات */}
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {activeTab === "requests" && req.uploadCount > 0 && (
                  <div className="hidden sm:block">
                    <AIActionButton
                      label="تحليل الملفات"
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setAnalyzingFile({ name: req.title, id: req.id });
                      }}
                    />
                  </div>
                )}

                <div className="flex flex-col items-end gap-2 flex-1 sm:flex-none">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[9px] font-black ${
                      req.status === "نشط"
                        ? "bg-emerald-100 text-emerald-700"
                        : req.status === "تم الاستلام"
                          ? "bg-indigo-100 text-indigo-700"
                          : req.status === "منتهي" || req.status === "مغلق"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {req.status}
                  </span>

                  <span className="text-[9px] font-bold text-slate-400 bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                    {req.linkType === "open" ? (
                      <Unlock className="w-2.5 h-2.5" />
                    ) : req.linkType === "pin" ? (
                      <Lock className="w-2.5 h-2.5" />
                    ) : req.linkType === "expire" ? (
                      <Clock className="w-2.5 h-2.5" />
                    ) : (
                      <Hash className="w-2.5 h-2.5" />
                    )}
                    {getLinkTypeName(req.linkType)}
                  </span>
                </div>

                {/* 🚀 الإجراءات المخفية (تظهر عند التمرير) */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity sm:flex hidden">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(req);
                    }}
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-600 hover:border-indigo-200 bg-white shadow-sm transition-colors"
                    title="نسخ الرابط"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // نفتح التعديل السريع إذا لم يمرر الأب onEdit لفتح الشاشة الكبيرة
                      if (onEdit) onEdit(req);
                      else setEditingReq(req);
                    }}
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-emerald-600 hover:border-emerald-200 bg-white shadow-sm transition-colors"
                    title="تعديل سريع"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={(e) => handleDelete(e, req)}
                    disabled={deletingId === req.id}
                    className="p-2 border border-slate-200 rounded-xl text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 bg-white shadow-sm transition-colors disabled:opacity-50"
                    title="حذف الرابط"
                  >
                    {deletingId === req.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-400">
                لا توجد سجلات متاحة
              </p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          🚀 3. نافذة التعديل السريع (Quick Edit Modal)
          ========================================= */}
      {editingReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-600" /> تعديل إعدادات
                الرابط
              </h3>
              <button
                onClick={() => setEditingReq(null)}
                className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-black text-slate-700 block mb-1.5">
                  عنوان الرابط
                </label>
                <input
                  type="text"
                  value={editingReq.title || ""}
                  onChange={(e) =>
                    setEditingReq({ ...editingReq, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    حالة الرابط
                  </label>
                  <select
                    value={editingReq.status || "نشط"}
                    onChange={(e) =>
                      setEditingReq({ ...editingReq, status: e.target.value })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="نشط">نشط (يعمل)</option>
                    <option value="منتهي">منتهي (مغلق)</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-700 block mb-1.5">
                    تاريخ الانتهاء
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      editingReq.expireDate
                        ? new Date(editingReq.expireDate)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setEditingReq({
                        ...editingReq,
                        expireDate: e.target.value,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[9px] text-slate-400 mt-1">
                    اتركه فارغاً ليكون مفتوحاً
                  </p>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg hover:bg-indigo-700 flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  {editMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ التعديلات
                </button>
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-black hover:bg-slate-200"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
