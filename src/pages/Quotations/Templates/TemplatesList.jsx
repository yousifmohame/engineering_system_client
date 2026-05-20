import React, { useMemo } from "react";
import api from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Lock,
  Unlock,
  Loader2,
  FileText,
  Layers,
  CalendarDays,
  Clock3,
  UserRound,
  Hash,
  ShieldCheck,
  Sparkles,
  LayoutTemplate,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";

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

export default function TemplatesList({ onCreateNew, onEdit }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => {
      const res = await api.get("/quotation-templates");
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await api.delete(`/quotation-templates/${id}`),
    onSuccess: () => {
      toast.success("تم حذف النموذج بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "تعذر حذف النموذج");
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: async (id) => {
      return await api.post(`/quotation-templates/${id}/duplicate`, {
        employeeId: user?.id,
      });
    },
    onSuccess: () => {
      toast.success("تم إنشاء نسخة من النموذج بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "تعذر نسخ النموذج");
    },
  });

  const toggleFreezeMutation = useMutation({
    mutationFn: async ({ id, isFrozen }) => {
      return await api.patch(`/quotation-templates/${id}/freeze`, {
        isFrozen: !isFrozen,
        employeeId: user?.id,
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة النموذج بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "تعذر تحديث حالة النموذج");
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const summary = useMemo(() => {
    const frozen = templates.filter((tpl) => tpl.isFrozen).length;
    const totalUses = templates.reduce((acc, tpl) => acc + (Number(tpl.uses) || 0), 0);
    return {
      total: templates.length,
      active: templates.length - frozen,
      frozen,
      totalUses,
    };
  }, [templates]);

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النموذج؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id) => {
    if (window.confirm("هل تريد إنشاء نسخة من هذا النموذج؟")) {
      duplicateMutation.mutate(id);
    }
  };

  const handleToggleFreeze = (tpl) => {
    const action = tpl.isFrozen ? "إلغاء تجميد" : "تجميد";
    if (window.confirm(`هل أنت متأكد من ${action} هذا النموذج؟`)) {
      toggleFreezeMutation.mutate({ id: tpl.id, isFrozen: tpl.isFrozen });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[360px] items-center justify-center bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
        <div className="flex flex-col items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-[#d8b46a]/35 bg-white shadow-[0_10px_24px_rgba(18,63,89,0.10)]">
            <Loader2 className="h-6 w-6 animate-spin text-[#123f59]" />
          </div>
          <p className="text-xs font-black text-[#123f59]">
            جاري تحميل نماذج عروض الأسعار...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        h-full min-h-0 w-full max-w-full overflow-y-auto overflow-x-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-3 pb-20 font-[Tajawal] text-right text-[#123f59]
        md:p-4 md:pb-20 custom-scrollbar-slim
      "
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl space-y-3">
        <section
          className="
            relative overflow-hidden rounded-[22px]
            border border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-4 py-3 text-white
            shadow-[0_10px_24px_rgba(18,63,89,0.14)]
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-80px] h-36 w-36 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-80px] h-40 w-40 rounded-full bg-cyan-400/18 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span
                className="
                  grid h-11 w-11 shrink-0 place-items-center
                  rounded-2xl border border-[#e2bf74]/35
                  bg-white/10 text-[#e2bf74]
                  shadow-md backdrop-blur-xl
                "
              >
                <IconWithText
                  icon={LayoutTemplate}
                  text="نماذج"
                  vertical
                  iconClassName="h-5 w-5"
                  textClassName="text-[7px] font-black leading-none"
                />
              </span>

              <div className="min-w-0">
                <h1 className="truncate text-xl font-black md:text-2xl">
                  نماذج عروض الأسعار
                </h1>
                <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                  إدارة وتخصيص قوالب عروض الأسعار للعملاء بطريقة منظمة وسريعة.
                </p>
              </div>
            </div>

            <button
              onClick={onCreateNew}
              className="
                inline-flex h-10 items-center justify-center gap-2
                rounded-xl border border-[#e2bf74]/40
                bg-[#e2bf74] px-4
                text-xs font-black text-[#082032]
                shadow-[0_10px_20px_rgba(226,191,116,0.18)]
                transition hover:-translate-y-[1px] hover:bg-[#f5d99b]
              "
              type="button"
            >
              <IconWithText icon={Plus} text="إنشاء نموذج جديد" iconClassName="h-4 w-4" />
            </button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <SummaryCard icon={FileText} label="إجمالي النماذج" value={summary.total} tone="blue" />
          <SummaryCard icon={ShieldCheck} label="النماذج النشطة" value={summary.active} tone="emerald" />
          <SummaryCard icon={Lock} label="النماذج المجمدة" value={summary.frozen} tone="amber" />
          <SummaryCard icon={Layers} label="مرات الاستخدام" value={summary.totalUses} tone="violet" />
        </section>

        <section
          className="
            overflow-hidden rounded-[22px]
            border border-[#d8b46a]/25 bg-white/90
            shadow-[0_8px_22px_rgba(18,63,89,0.06)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              flex items-center justify-between gap-3
              border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
              px-4 py-3
            "
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
                <FileText className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-xs font-black text-[#123f59]">
                  سجل النماذج
                </h2>
                <p className="mt-0.5 truncate text-[10px] font-bold text-[#94a3b8]">
                  عرض، تعديل، نسخ، تجميد أو حذف النماذج.
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-3 py-1.5 text-[10px] font-black text-[#64748b]">
              {templates.length} نموذج
            </span>
          </div>

          {templates.length === 0 ? (
            <EmptyState onCreateNew={onCreateNew} />
          ) : (
            <div className="overflow-x-auto custom-scrollbar-slim custom-scrollbar-slim">
              <table className="w-full min-w-[980px] border-collapse text-right">
                <thead className="border-b border-[#e8ddc8] bg-[#fbf8f1] text-[11px] font-black text-[#64748b]">
                  <tr>
                    <th className="px-4 py-3">م</th>
                    <th className="px-4 py-3">اسم النموذج</th>
                    <th className="px-4 py-3">رمز النموذج</th>
                    <th className="px-4 py-3 text-center">الاستخدام</th>
                    <th className="px-4 py-3">تاريخ الإنشاء</th>
                    <th className="px-4 py-3">آخر تعديل</th>
                    <th className="px-4 py-3">بواسطة</th>
                    <th className="w-48 px-4 py-3 text-center">الإجراءات</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#e8ddc8]">
                  {templates.map((tpl, index) => (
                    <tr
                      key={tpl.id}
                      className={`transition-colors hover:bg-[#fbf8f1]/70 ${
                        tpl.isFrozen ? "bg-[#fbf8f1]/80 opacity-80" : "bg-white"
                      }`}
                    >
                      <td className="px-4 py-3 font-mono text-xs font-black text-[#94a3b8]">
                        {index + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                              tpl.isFrozen
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                            }`}
                          >
                            {tpl.isFrozen ? <Lock className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                          </span>
                          <div className="min-w-0">
                            <div className="line-clamp-2 text-xs font-black leading-5 text-[#123f59]">
                              {tpl.title}
                            </div>
                            {tpl.isFrozen && (
                              <span className="mt-1 inline-flex rounded-xl border border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700">
                                مجمد
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-2 py-1 font-mono text-[10px] font-black text-[#64748b]">
                          <Hash className="h-3 w-3 text-[#c5983c]" />
                          {tpl.code || "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-[46px] justify-center rounded-xl border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-black text-violet-700">
                          {tpl.uses || 0}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-[11px] font-bold text-[#64748b]">
                        <IconWithText icon={CalendarDays} text={formatDate(tpl.createdAt)} iconClassName="h-3.5 w-3.5 text-[#c5983c]" />
                      </td>

                      <td className="px-4 py-3 text-[11px] font-bold text-[#64748b]">
                        <IconWithText icon={Clock3} text={formatDate(tpl.updatedAt)} iconClassName="h-3.5 w-3.5 text-[#c5983c]" />
                      </td>

                      <td className="px-4 py-3 text-[11px] font-bold text-[#64748b]">
                        <IconWithText
                          icon={UserRound}
                          text={tpl.creator?.name || (tpl.userId === user?.id ? "أنت" : "—")}
                          iconClassName="h-3.5 w-3.5 text-[#c5983c]"
                        />
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <ActionButton
                            icon={Edit}
                            label="تعديل"
                            onClick={() => onEdit(tpl.id)}
                            disabled={tpl.isFrozen}
                            tone="blue"
                          />
                          <ActionButton
                            icon={Copy}
                            label="نسخ"
                            onClick={() => handleDuplicate(tpl.id)}
                            tone="emerald"
                          />
                          <ActionButton
                            icon={tpl.isFrozen ? Unlock : Lock}
                            label={tpl.isFrozen ? "فتح" : "تجميد"}
                            onClick={() => handleToggleFreeze(tpl)}
                            tone="amber"
                          />
                          <ActionButton
                            icon={Trash2}
                            label="حذف"
                            onClick={() => handleDelete(tpl.id)}
                            tone="rose"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const SummaryCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    violet: "border-violet-200 bg-violet-50 text-violet-700",
  };

  return (
    <article className="relative overflow-hidden rounded-[18px] border border-[#d8b46a]/25 bg-white/90 p-3 shadow-[0_8px_18px_rgba(18,63,89,0.05)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[10px] font-black text-[#64748b]">{label}</div>
          <div className="mt-1 text-xl font-black leading-none text-[#123f59]">{value}</div>
        </div>
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${tones[tone] || tones.blue}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </article>
  );
};

const ActionButton = ({ icon: Icon, label, onClick, tone = "blue", disabled = false }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex h-8 items-center justify-center gap-1 rounded-xl border px-2 text-[9px] font-black transition disabled:cursor-not-allowed disabled:border-[#e8ddc8] disabled:bg-[#fbf8f1] disabled:text-[#cbd5e1] ${tones[tone] || tones.blue}`}
      type="button"
      title={label}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
};

const EmptyState = ({ onCreateNew }) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-14 text-center">
      <div className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-[#fbf8f1] text-[#c5983c]">
        <AlertCircle className="h-7 w-7" />
      </div>
      <h3 className="text-xs font-black text-[#123f59]">لا توجد نماذج حالياً</h3>
      <p className="mt-1 text-xs font-bold text-[#64748b]">
        ابدأ بإنشاء نموذج عرض سعر جديد لاستخدامه لاحقاً.
      </p>
      <button
        onClick={onCreateNew}
        className="mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#123f59] px-4 text-xs font-black text-white transition hover:bg-[#0f3448]"
        type="button"
      >
        <Plus className="h-4 w-4 text-[#e2bf74]" />
        إنشاء نموذج جديد
      </button>
    </div>
  );
};
