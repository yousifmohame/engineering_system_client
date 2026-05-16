import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Check,
  Loader2,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Snowflake,
  Activity,
  MessageSquare,
} from "lucide-react";

export default function StatusConfirmModal({ config, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const getStatusInfo = (status) => {
    switch (status) {
      case "completed":
        return {
          name: "مكتملة",
          description: "سيتم اعتبار المهمة منتهية وجاهزة للأرشفة أو المراجعة النهائية.",
          icon: CheckCircle2,
          cardClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
          iconClass: "bg-emerald-600 text-white",
          buttonClass:
            "bg-emerald-600 hover:bg-emerald-700 shadow-[0_14px_30px_rgba(16,185,129,0.22)]",
          accentClass: "bg-emerald-400",
        };

      case "cancelled":
        return {
          name: "ملغاة",
          description: "سيتم إلغاء المهمة ولن يتم التعامل معها كعمل نشط.",
          icon: XCircle,
          cardClass: "border-rose-200 bg-rose-50 text-rose-700",
          iconClass: "bg-rose-600 text-white",
          buttonClass:
            "bg-rose-600 hover:bg-rose-700 shadow-[0_14px_30px_rgba(225,29,72,0.22)]",
          accentClass: "bg-rose-400",
        };

      case "frozen":
        return {
          name: "مجمدة",
          description:
            "سيتم تجميد المهمة مؤقتاً، مما يمنع الإضافات أو التعديلات عليها إلى حين إعادة تفعيلها.",
          icon: Snowflake,
          cardClass: "border-blue-200 bg-blue-50 text-blue-700",
          iconClass: "bg-blue-600 text-white",
          buttonClass:
            "bg-blue-600 hover:bg-blue-700 shadow-[0_14px_30px_rgba(37,99,235,0.22)]",
          accentClass: "bg-blue-400",
        };

      default:
        return {
          name: "نشطة",
          description: "سيتم إعادة المهمة إلى الحالة النشطة ومتابعة العمل عليها.",
          icon: Activity,
          cardClass: "border-amber-200 bg-amber-50 text-amber-700",
          iconClass: "bg-amber-500 text-white",
          buttonClass:
            "bg-amber-600 hover:bg-amber-700 shadow-[0_14px_30px_rgba(217,119,6,0.22)]",
          accentClass: "bg-amber-400",
        };
    }
  };

  const statusInfo = getStatusInfo(config.newStatus);
  const StatusIcon = statusInfo.icon;

  const updateMutation = useMutation({
    mutationFn: () =>
      api.put(`/office-tasks/${config.task.id}/status`, {
        status: config.newStatus,
        commentText: comment,
        authorName: currentUser?.name || "موظف",
      }),

    onSuccess: () => {
      toast.success(`تم تحديث حالة المهمة إلى ${statusInfo.name}`);
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      onClose();
    },

    onError: (error) => {
      toast.error(
        "فشل تحديث الحالة: " +
          (error.response?.data?.message || "خطأ في السيرفر"),
      );
    },
  });

  return (
    <div
      className="
        fixed inset-0 z-[200] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
        animate-in fade-in
      "
      dir="rtl"
    >
      <div
        className="
          flex w-full max-w-lg flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div
          className="
            relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  grid h-12 w-12 shrink-0 place-items-center rounded-2xl
                  border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74]
                  shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                "
              >
                <AlertCircle className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-black">
                  تأكيد تغيير الحالة
                </h3>

                <p className="mt-1 truncate text-xs font-bold text-white/65">
                  سيتم تسجيل هذا التغيير في سجل ملاحظات المهمة.
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

        {/* Body */}
        <div
          className="
            space-y-5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-5
          "
        >
          <div
            className={`
              relative overflow-hidden rounded-[28px] border p-5 text-center
              shadow-[0_16px_40px_rgba(18,63,89,0.08)]
              ${statusInfo.cardClass}
            `}
          >
            <div className="pointer-events-none absolute inset-0 bg-white/35" />

            <div className="relative z-10">
              <div
                className={`
                  mx-auto mb-4 grid h-16 w-16 place-items-center
                  rounded-[24px] shadow-[0_14px_30px_rgba(18,63,89,0.18)]
                  ${statusInfo.iconClass}
                `}
              >
                <StatusIcon className="h-8 w-8" />
              </div>

              <p className="mb-1 text-xs font-black opacity-80">
                سيتم نقل المهمة إلى حالة:
              </p>

              <h4 className="mb-3 text-2xl font-black">
                {statusInfo.name}
              </h4>

              <p className="mx-auto max-w-sm text-xs font-bold leading-6 opacity-85">
                {statusInfo.description}
              </p>

              {config.newStatus === "frozen" && (
                <div
                  className="
                    mt-4 flex items-start gap-2 rounded-2xl
                    border border-blue-200 bg-white/75
                    p-3 text-right text-[10px] font-bold leading-5 text-blue-700
                  "
                >
                  <Snowflake className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    ملاحظة: تجميد المهمة سيمنع أي إضافات أو تعديلات عليها مؤقتاً.
                  </span>
                </div>
              )}
            </div>

            <div
              className={`absolute bottom-0 left-0 right-0 h-1.5 ${statusInfo.accentClass}`}
            />
          </div>

          <div
            className="
              overflow-hidden rounded-[26px]
              border border-[#d8b46a]/30 bg-white/90
              shadow-[0_16px_40px_rgba(18,63,89,0.08)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                flex items-center gap-3 border-b border-[#e8ddc8]
                bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
                px-5 py-4
              "
            >
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                <MessageSquare className="h-5 w-5" />
              </span>

              <div>
                <h4 className="text-sm font-black text-[#123f59]">
                  تعليق توضيحي
                </h4>
                <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                  سيظهر هذا التعليق في سجل ملاحظات المهمة.
                </p>
              </div>
            </div>

            <div className="p-5">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="اكتب هنا سبب تغيير الحالة أو أي ملاحظات..."
                className="
                  min-h-[120px] w-full resize-none rounded-2xl
                  border border-[#d8b46a]/25 bg-white
                  px-4 py-3 text-sm font-bold leading-7 text-[#123f59]
                  shadow-sm outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:bg-white
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b]">
              <ShieldCheck className="h-4 w-4 text-[#c5983c]" />
              سيتم حفظ العملية في سجل المهمة.
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                onClick={onClose}
                className="
                  h-11 rounded-2xl border border-[#d8b46a]/30
                  bg-white px-6 text-xs font-black text-[#64748b]
                  transition hover:bg-[#f8efe0]
                "
                type="button"
              >
                إلغاء
              </button>

              <button
                onClick={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
                className={`
                  flex h-11 items-center justify-center gap-2 rounded-2xl
                  px-8 text-xs font-black text-white
                  transition hover:-translate-y-[1px]
                  disabled:cursor-not-allowed disabled:opacity-50
                  ${statusInfo.buttonClass}
                `}
                type="button"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
                تأكيد التغيير
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}