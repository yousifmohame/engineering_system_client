import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import {
  Plus,
  Edit,
  Trash2,
  LayoutTemplate,
  Search,
  MessageSquare,
  Send,
  Sparkles,
  Loader2,
  Info,
  X,
  ShieldCheck,
  FileText,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

export default function TemplatesTab() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      const res = await api.get("/transfer-center/templates");
      return res.data?.data || [];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/transfer-center/templates/${id}`);
    },

    onSuccess: () => {
      toast.success("تم حذف القالب بنجاح");
      queryClient.invalidateQueries(["notification-templates"]);
    },

    onError: () => {
      toast.error("حدث خطأ أثناء حذف القالب");
    },
  });

  const handleEdit = (tpl) => {
    setEditingTemplate(tpl);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setIsModalOpen(true);
  };

  const handleDelete = (tpl) => {
    if (window.confirm(`هل أنت متأكد من حذف القالب "${tpl.title}"؟`)) {
      deleteMutation.mutate(tpl.id);
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    const query = searchTerm.trim();

    if (!query) return true;

    return (
      String(tpl.title || "").includes(query) ||
      String(tpl.content || "").includes(query) ||
      String(tpl.type || "").includes(query)
    );
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
      {/* Header */}
      <div
        className="
          relative shrink-0 overflow-hidden
          border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white
          shadow-[0_14px_34px_rgba(18,63,89,0.16)]
          md:px-6
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <LayoutTemplate className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                قوالب رسائل الإشعارات
              </h2>

              <p className="mt-1 truncate text-xs font-bold text-white/65">
                إدارة قوالب واتساب و SMS المستخدمة في روابط الطلبات والإرسالات.
              </p>
            </div>
          </div>

          <button
            onClick={handleCreate}
            className="
              flex h-11 shrink-0 items-center justify-center gap-2
              rounded-2xl bg-[#e2bf74] px-5
              text-sm font-black text-[#082032]
              shadow-[0_12px_28px_rgba(226,191,116,0.25)]
              transition-all hover:-translate-y-[1px]
              hover:bg-[#f5d99b]
            "
            type="button"
          >
            <Plus className="h-4 w-4" />
            إضافة قالب جديد
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div
        className="
          shrink-0 border-b border-[#e8ddc8]
          bg-white/80 px-4 py-4 backdrop-blur-xl
        "
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-sm font-black text-[#123f59]">
              مكتبة القوالب
            </h3>

            <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
              {filteredTemplates.length} قالب معروض من أصل {templates.length}
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

            <input
              type="text"
              placeholder="بحث في القوالب..."
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
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
        {isLoading ? (
          <div
            className="
              flex flex-col items-center justify-center
              rounded-[28px] border border-[#d8b46a]/30
              bg-white/80 py-20
              shadow-[0_18px_45px_rgba(18,63,89,0.08)]
            "
          >
            <Loader2 className="mb-3 h-8 w-8 animate-spin text-[#c5983c]" />
            <p className="text-sm font-black text-[#123f59]">
              جاري تحميل القوالب...
            </p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <EmptyState onCreate={handleCreate} />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredTemplates.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onEdit={() => handleEdit(tpl)}
                onDelete={() => handleDelete(tpl)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <TemplateFormModal
          template={editingTemplate}
          onClose={() => setIsModalOpen(false)}
          queryClient={queryClient}
        />
      )}
    </div>
  );
}

const TemplateCard = ({ template, onEdit, onDelete, isDeleting }) => {
  const typeMeta = getTemplateTypeMeta(template.type);
  const TypeIcon = typeMeta.icon;

  return (
    <div
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

      <div className="relative z-10 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`
              grid h-11 w-11 shrink-0 place-items-center
              rounded-2xl border shadow-sm
              ${typeMeta.iconClass}
            `}
          >
            <TypeIcon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-black text-[#123f59]">
              {template.title}
            </h4>

            <span
              className={`
                mt-1 inline-flex items-center gap-1.5 rounded-xl border
                px-2.5 py-1 text-[9px] font-black
                ${typeMeta.badgeClass}
              `}
            >
              <TypeIcon className="h-3.5 w-3.5" />
              {typeMeta.label}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <ActionButton label="تعديل" tone="blue" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </ActionButton>

          <ActionButton
            label={isDeleting ? "حذف..." : "حذف"}
            tone="rose"
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </ActionButton>
        </div>
      </div>

      <div
        className="
          relative z-10 mt-4 min-h-[92px]
          rounded-[22px] border border-[#e8ddc8]
          bg-[#fbf8f1]/80 p-4
        "
      >
        <p className="line-clamp-5 whitespace-pre-wrap text-xs font-bold leading-7 text-[#64748b]">
          {template.content}
        </p>
      </div>

      <div className="relative z-10 mt-3 flex flex-wrap items-center gap-2">
        <ChannelBadge icon={MessageSquare} label="واتساب" tone="emerald" />
        <ChannelBadge icon={Send} label="SMS" tone="cyan" />
      </div>
    </div>
  );
};

function TemplateFormModal({ template, onClose, queryClient }) {
  const [formData, setFormData] = useState(
    template || {
      title: "",
      content: "",
      type: "request",
      code: "",
    },
  );

  const mutation = useMutation({
    mutationFn: async (data) => {
      if (template) {
        return await api.put(`/transfer-center/templates/${template.id}`, data);
      }

      return await api.post("/transfer-center/templates", data);
    },

    onSuccess: () => {
      toast.success("تم حفظ القالب بنجاح");
      queryClient.invalidateQueries(["notification-templates"]);
      onClose();
    },

    onError: () => {
      toast.error("حدث خطأ أثناء حفظ القالب");
    },
  });

  return (
    <div
      className="
        fixed inset-0 z-[110] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
      "
      dir="rtl"
    >
      <div
        className="
          w-full max-w-lg overflow-hidden rounded-[28px]
          border border-[#d8b46a]/35 bg-white
          shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95
        "
      >
        {/* Modal header */}
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
                <LayoutTemplate className="h-5 w-5" />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black">
                  {template ? "تعديل القالب" : "إضافة قالب جديد"}
                </h3>

                <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                  Notification template
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
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

        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate(formData);
          }}
          className="space-y-4 p-5"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="اسم القالب">
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    title: e.target.value,
                  })
                }
                className={INPUT_CLASS}
                placeholder="مثال: تذكير بموعد انتهاء الرابط"
              />
            </FormField>

            <FormField label="نوع العملية">
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value,
                  })
                }
                className={INPUT_CLASS}
              >
                <option value="request">طلب وثائق وارد</option>
                <option value="send">إرسال حزمة صادر</option>
              </select>
            </FormField>
          </div>

          <FormField label="محتوى الرسالة">
            <textarea
              required
              value={formData.content}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  content: e.target.value,
                })
              }
              className={`${INPUT_CLASS} h-36 resize-none leading-7`}
              placeholder="اكتب نص الرسالة هنا..."
            />
          </FormField>

          <div
            className="
              rounded-[22px] border border-amber-200
              bg-amber-50/90 p-4
            "
          >
            <div className="flex gap-3 text-amber-900">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />

              <div>
                <p className="text-xs font-black">متغيرات جاهزة للاستخدام</p>

                <p className="mt-1 text-xs font-bold leading-7">
                  يمكنك استخدام المتغيرات التالية داخل نص الرسالة:
                </p>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {["{targetName}", "{title}", "{url}", "{pin_info}"].map(
                    (item) => (
                      <code
                        key={item}
                        className="
                          rounded-lg border border-amber-200
                          bg-white px-2 py-1
                          font-mono text-[10px] font-black text-rose-600
                        "
                      >
                        {item}
                      </code>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
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
              disabled={mutation.isPending}
              className="
                flex h-11 flex-1 items-center justify-center gap-2
                rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                text-xs font-black text-white
                shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                transition hover:-translate-y-[1px]
                disabled:cursor-not-allowed disabled:opacity-70
              "
            >
              {mutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
              ) : (
                <Sparkles className="h-4 w-4 text-[#e2bf74]" />
              )}
              حفظ القالب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const getTemplateTypeMeta = (type) => {
  if (type === "request") {
    return {
      label: "طلب وارد",
      icon: FileText,
      iconClass: "border-amber-200 bg-amber-50 text-amber-700",
      badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "إرسال صادر",
    icon: Send,
    iconClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
    badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };
};

const ActionButton = ({
  children,
  label,
  tone = "blue",
  onClick,
  disabled,
}) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    rose: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex min-w-[50px] flex-col items-center justify-center gap-0.5
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

const ChannelBadge = ({ icon: Icon, label, tone = "emerald" }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-xl border
        px-2.5 py-1 text-[9px] font-black
        ${tones[tone] || tones.emerald}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

const EmptyState = ({ onCreate }) => (
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
      <LayoutTemplate className="h-8 w-8" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد قوالب مطابقة
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يمكنك إنشاء قالب جديد لاستخدامه في الإرسال والطلبات.
    </p>

    <button
      onClick={onCreate}
      className="
        mt-5 flex h-11 items-center gap-2
        rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
        px-5 text-xs font-black text-white
        shadow-[0_14px_30px_rgba(18,63,89,0.22)]
        transition hover:-translate-y-[1px]
      "
      type="button"
    >
      <Plus className="h-4 w-4 text-[#e2bf74]" />
      إضافة قالب جديد
    </button>
  </div>
);

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