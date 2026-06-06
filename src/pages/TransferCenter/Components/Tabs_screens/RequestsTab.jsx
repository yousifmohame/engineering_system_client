import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
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
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AIActionButton } from "../ai/AIActionButton";
import { toast } from "sonner";

export default function RequestsTab({
  activeTab,
  requests = [],
  setAnalyzingFile,
  onEdit,
}) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [readinessFilter, setReadinessFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  const [editingReq, setEditingReq] = useState(null);

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
      queryClient.invalidateQueries(["transfer-center-data"]);
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

  const formatDate = (dateString) => {
    if (!dateString) return "—";

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
    const url = `https://details-worksystem1.com${prefix}${req.shortLink}`;

    navigator.clipboard.writeText(url);
    toast.success("تم نسخ الرابط بنجاح");
  };

  const filteredRequests = requests.filter((req) => {
    const query = searchTerm.trim();

    const searchMatch =
      !query ||
      String(req.title || "").includes(query) ||
      String(req.entityName || "").includes(query) ||
      String(req.shortLink || "").includes(query);

    const statusMatch =
      statusFilter === "all" || String(req.status || "") === statusFilter;

    const filesCount = getFilesCount(req);

    const readinessMatch =
      readinessFilter === "all" ||
      (readinessFilter === "ready" && filesCount > 0) ||
      (readinessFilter === "empty" && filesCount === 0) ||
      (readinessFilter === "linked" &&
        req.systemLinkStatus &&
        req.systemLinkStatus !== "unlinked") ||
      (readinessFilter === "unlinked" &&
        (!req.systemLinkStatus || req.systemLinkStatus === "unlinked"));

    return searchMatch && statusMatch && readinessMatch;
  });

  return (
    <div
      className="
        flex h-full flex-1 flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header / Filters */}
      <div
        className="
          shrink-0 border-b border-[#e8ddc8]
          bg-white/80 px-4 py-4 backdrop-blur-xl
        "
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl bg-gradient-to-br from-[#123f59] to-[#0e7490]
                text-[#e2bf74]
                shadow-[0_14px_30px_rgba(18,63,89,0.18)]
              "
            >
              {activeTab === "requests" ? (
                <LinkIcon className="h-5 w-5" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-[#123f59]">
                {activeTab === "requests"
                  ? "روابط طلب الوثائق"
                  : "حزم إرسال الملفات"}
              </h2>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                {filteredRequests.length} عنصر معروض من أصل {requests.length}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:flex-row xl:w-auto">
            <div className="relative flex-1 xl:w-72">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

              <input
                type="text"
                placeholder={`بحث في ${
                  activeTab === "requests" ? "الطلبات" : "الإرسالات"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  h-10 w-full rounded-2xl border border-[#d8b46a]/30
                  bg-white pr-10 pl-3 text-xs font-bold text-[#123f59]
                  outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />
            </div>

            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="
                h-10 rounded-2xl border border-[#d8b46a]/30
                bg-white px-3 text-xs font-black text-[#123f59]
                outline-none transition-all
                focus:border-[#c5983c]/70
                focus:ring-4 focus:ring-[#c5983c]/10
              "
            >
              <option value="all">مستوى الجاهزية</option>
              <option value="ready">جاهز / يحتوي ملفات</option>
              <option value="empty">بدون ملفات</option>
              <option value="linked">مرتبط بالنظام</option>
              <option value="unlinked">غير مرتبط</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="
                h-10 rounded-2xl border border-[#d8b46a]/30
                bg-white px-3 text-xs font-black text-[#123f59]
                outline-none transition-all
                focus:border-[#c5983c]/70
                focus:ring-4 focus:ring-[#c5983c]/10
              "
            >
              <option value="all">كل الحالات</option>
              <option value="نشط">نشط</option>
              <option value="تم الاستلام">تم الاستلام</option>
              <option value="منتهي">منتهي</option>
              <option value="مغلق">مغلق</option>
              <option value="قيد المراجعة">قيد المراجعة</option>
            </select>

            <button
              className="
                flex h-10 min-w-[48px] items-center justify-center
                rounded-2xl border border-[#d8b46a]/30 bg-white
                text-[#64748b] transition
                hover:bg-[#f8efe0] hover:text-[#123f59]
              "
              type="button"
              title="تصفية"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid gap-3">
          {filteredRequests.map((req) => {
            const filesCount = getFilesCount(req);
            const isRequest = activeTab === "requests";

            return (
              <div
                key={req.id}
                className="
                  group relative overflow-hidden rounded-[26px]
                  border border-[#d8b46a]/25 bg-white/90
                  p-4 shadow-[0_14px_34px_rgba(18,63,89,0.08)]
                  backdrop-blur-xl transition-all
                  hover:-translate-y-[1px]
                  hover:border-[#c5983c]/45
                  hover:bg-[#fbf8f1]/80
                  hover:shadow-[0_20px_45px_rgba(18,63,89,0.12)]
                "
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#fbf8f1]/45 via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />

                <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  {/* Main info */}
                  <div className="flex min-w-0 items-start gap-4">
                    <div
                      className={`
                        grid h-12 w-12 shrink-0 place-items-center
                        rounded-2xl shadow-sm transition
                        ${
                          isRequest
                            ? "bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100"
                            : "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100"
                        }
                      `}
                    >
                      {isRequest ? (
                        <LinkIcon className="h-5 w-5" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1.5 flex flex-wrap items-center gap-2">
                        <h4 className="max-w-full truncate text-sm font-black text-[#123f59]">
                          {req.title}
                        </h4>

                        {req.systemLinkStatus &&
                          req.systemLinkStatus !== "unlinked" && (
                            <StatusBadge
                              tone="blue"
                              icon={Activity}
                              label="مرتبط"
                            />
                          )}

                        {activeTab === "outbox" && req.permissions && (
                          <StatusBadge
                            tone="sky"
                            icon={Eye}
                            label={getPermissionsName(req.permissions)}
                          />
                        )}

                        {activeTab === "requests" &&
                          req.uploadCount > 0 &&
                          req.status === "نشط" && (
                            <StatusBadge
                              tone="amber"
                              icon={Sparkles}
                              label="متاح للفحص"
                            />
                          )}
                      </div>

                      <p className="mb-2 text-[10px] font-bold text-[#64748b]">
                        {activeTab === "requests"
                          ? "موجه إلى:"
                          : "المرسل إليه:"}{" "}
                        <span className="font-black text-[#123f59]">
                          {req.entityName || "رابط عام"}
                        </span>{" "}
                        • {formatDate(req.createdAt)}
                      </p>

                      <div className="flex flex-wrap gap-2 text-[10px] font-black">
                        <InfoPill label={`الملفات: ${filesCount}`} />
                        <InfoPill label={`الزيارات: ${req.viewCount || 0}`} />
                        <InfoPill label={`الرابط: ${req.shortLink || "—"}`} />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3 xl:items-end">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      {activeTab === "requests" && req.uploadCount > 0 && (
                        <AIActionButton
                          label="تحليل الملفات"
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAnalyzingFile({ name: req.title, id: req.id });
                          }}
                        />
                      )}

                      <StatusBadge
                        tone={getStatusTone(req.status)}
                        label={req.status || "غير محدد"}
                      />

                      <LinkTypeBadge
                        type={req.linkType}
                        label={getLinkTypeName(req.linkType)}
                      />
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <ActionButton
                        label="نسخ"
                        tone="blue"
                        title="نسخ الرابط"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyLink(req);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </ActionButton>

                      <ActionButton
                        label="تعديل"
                        tone="emerald"
                        title="تعديل سريع"
                        onClick={(e) => {
                          e.stopPropagation();

                          if (onEdit) {
                            onEdit(req);
                          } else {
                            setEditingReq(req);
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </ActionButton>

                      <ActionButton
                        label={deletingId === req.id ? "حذف..." : "حذف"}
                        tone="rose"
                        title="حذف الرابط"
                        disabled={deletingId === req.id}
                        onClick={(e) => handleDelete(e, req)}
                      >
                        {deletingId === req.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </ActionButton>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredRequests.length === 0 && (
            <div
              className="
                flex flex-col items-center justify-center
                rounded-[28px] border border-dashed border-[#d8b46a]/40
                bg-white/75 px-5 py-16 text-center
                shadow-[0_18px_45px_rgba(18,63,89,0.08)]
              "
            >
              <div
                className="
                  mb-4 grid h-16 w-16 place-items-center
                  rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
                  text-[#e2bf74]
                  shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                "
              >
                <Search className="h-8 w-8" />
              </div>

              <p className="text-sm font-black text-[#123f59]">
                لا توجد سجلات متاحة
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                جرّب تغيير كلمات البحث أو الفلاتر.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Edit Modal */}
      {editingReq && (
        <div
          className="
            fixed inset-0 z-[100] flex items-center justify-center
            bg-[#06111d]/70 p-4 backdrop-blur-md
          "
          dir="rtl"
        >
          <div
            className="
              w-full max-w-md overflow-hidden rounded-[28px]
              border border-[#d8b46a]/35 bg-white
              shadow-[0_30px_90px_rgba(0,0,0,0.35)]
              animate-in zoom-in-95
            "
          >
            <div
              className="
                relative overflow-hidden border-b border-[#d8b46a]/25
                bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                px-5 py-4 text-white
              "
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-55px] top-[-55px] h-32 w-32 rounded-full bg-[#e2bf74]/18 blur-3xl" />
                <div className="absolute left-[-55px] bottom-[-55px] h-32 w-32 rounded-full bg-emerald-400/14 blur-3xl" />
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="
                      grid h-11 w-11 shrink-0 place-items-center
                      rounded-2xl border border-[#e2bf74]/35
                      bg-white/12 text-[#e2bf74]
                    "
                  >
                    <Edit className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black">
                      تعديل إعدادات الرابط
                    </h3>

                    <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                      Quick edit
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setEditingReq(null)}
                  className="
                    flex min-w-[54px] flex-col items-center justify-center gap-0.5
                    rounded-xl border border-white/15 bg-white/10
                    px-2 py-1 text-[8px] font-black leading-none text-white
                    transition hover:bg-red-500/30
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                  إغلاق
                </button>
              </div>
            </div>

            <form onSubmit={handleQuickEditSubmit} className="space-y-4 p-5">
              <FormField label="عنوان الرابط">
                <input
                  type="text"
                  value={editingReq.title || ""}
                  onChange={(e) =>
                    setEditingReq({ ...editingReq, title: e.target.value })
                  }
                  className={INPUT_CLASS}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="حالة الرابط">
                  <select
                    value={editingReq.status || "نشط"}
                    onChange={(e) =>
                      setEditingReq({ ...editingReq, status: e.target.value })
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="نشط">نشط يعمل</option>
                    <option value="منتهي">منتهي مغلق</option>
                    <option value="قيد المراجعة">قيد المراجعة</option>
                  </select>
                </FormField>

                <FormField label="تاريخ الانتهاء">
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
                    className={`${INPUT_CLASS} text-xs`}
                  />

                  <p className="mt-1 text-[9px] font-bold text-[#94a3b8]">
                    اتركه فارغاً ليكون مفتوحاً
                  </p>
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setEditingReq(null)}
                  className="
                    h-11 rounded-2xl border border-[#d8b46a]/30
                    bg-white px-6 text-xs font-black text-[#64748b]
                    transition hover:bg-[#f8efe0]
                  "
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="
                    flex h-11 flex-1 items-center justify-center gap-2
                    rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                    text-xs font-black text-white
                    shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                    transition hover:-translate-y-[1px]
                    disabled:cursor-not-allowed disabled:opacity-70
                  "
                >
                  {editMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                  ) : (
                    <Save className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const InfoPill = ({ label }) => (
  <span
    className="
      rounded-xl border border-[#e8ddc8]
      bg-[#fbf8f1] px-2.5 py-1
      text-[#64748b]
    "
  >
    {label}
  </span>
);

const StatusBadge = ({ icon: Icon, label, tone = "emerald" }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    slate: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-xl border
        px-2.5 py-1 text-[9px] font-black
        ${tones[tone] || tones.emerald}
      `}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
};

const LinkTypeBadge = ({ type, label }) => {
  const Icon =
    type === "open"
      ? Unlock
      : type === "pin"
        ? Lock
        : type === "expire"
          ? Clock
          : Hash;

  return (
    <span
      className="
        inline-flex items-center gap-1.5 rounded-xl
        border border-[#e8ddc8] bg-[#fbf8f1]
        px-2.5 py-1 text-[9px] font-black text-[#64748b]
      "
    >
      <Icon className="h-3.5 w-3.5 text-[#c5983c]" />
      {label}
    </span>
  );
};

const getStatusTone = (status) => {
  if (status === "نشط") return "emerald";
  if (status === "تم الاستلام") return "blue";
  if (status === "منتهي" || status === "مغلق") return "slate";
  if (status === "قيد المراجعة") return "amber";
  return "amber";
};

const ActionButton = ({
  children,
  label,
  tone = "blue",
  title,
  onClick,
  disabled,
}) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    rose: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`
        flex min-w-[54px] flex-col items-center justify-center gap-0.5
        rounded-xl border px-2 py-1.5
        text-[8px] font-black leading-none
        transition-all hover:-translate-y-[1px]
        disabled:cursor-not-allowed disabled:opacity-50
        ${tones[tone] || tones.blue}
      `}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
};

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-black text-[#123f59]">
      {label}
    </label>

    {children}
  </div>
);

const INPUT_CLASS = `
  w-full rounded-2xl border border-[#d8b46a]/25
  bg-white px-4 py-3 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4
  focus:ring-[#c5983c]/10
`;