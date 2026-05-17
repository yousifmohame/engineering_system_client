import React, { useState } from "react";

import {
  MessageCircle,
  Trash2,
  Plus,
  Loader2,
  User,
  Clock,
  History,
  Send,
  ShieldCheck,
  Sparkles,
  MessageSquareText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { formatDateTime } from "../../utils/transactionUtils";

export const CommentsTab = ({
  tx,
  updateTxMutation,
  currentUser,
}) => {
  const [newComment, setNewComment] = useState("");

  const comments =
    tx.notes?.transactionComments || [];

  const getUserName = () => {
    if (!currentUser) return "موظف النظام";

    if (typeof currentUser === "string") {
      return currentUser;
    }

    return (
      currentUser.name ||
      currentUser.fullName ||
      "موظف النظام"
    );
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newCommentObj = {
      id:
        Date.now().toString() +
        Math.random()
          .toString(36)
          .substr(2, 9),

      text: newComment.trim(),

      user: getUserName(),

      date: new Date().toISOString(),
    };

    const updatedNotes = {
      ...(tx.notes || {}),
      transactionComments: [
        newCommentObj,
        ...comments,
      ],
    };

    updateTxMutation.mutate({
      notes: updatedNotes,
    });

    setNewComment("");
  };

  const handleDeleteComment = (
    commentId,
  ) => {
    if (
      !window.confirm(
        "هل أنت متأكد من حذف هذا التعليق؟",
      )
    )
      return;

    const updatedComments =
      comments.filter(
        (comment) =>
          comment.id !== commentId,
      );

    const updatedNotes = {
      ...(tx.notes || {}),
      transactionComments:
        updatedComments,
    };

    updateTxMutation.mutate({
      notes: updatedNotes,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddComment();
  };

  return (
    <div
      className="
        min-h-full space-y-5 p-4 pb-10 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        animate-in fade-in duration-300
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          p-5 text-white
          shadow-[0_20px_55px_rgba(18,63,89,0.18)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />

          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                grid h-14 w-14 place-items-center rounded-3xl
                bg-[#e2bf74] text-[#123f59]
                shadow-[0_12px_24px_rgba(0,0,0,0.18)]
              "
            >
              <MessageCircle className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black">
                تعليقات المعاملة
              </h2>

              <p className="mt-1 text-xs font-bold text-white/60">
                إضافة ومتابعة التعليقات
                الداخلية الخاصة بهذه
                المعاملة.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatsPill
              icon={History}
              label="عدد التعليقات"
              value={comments.length}
            />

            <div
              className="
                hidden items-center gap-2 rounded-2xl
                border border-white/15 bg-white/10
                px-4 py-3 backdrop-blur-md
                sm:flex
              "
            >
              <Sparkles className="h-4 w-4 text-[#e2bf74]" />

              <span className="text-[11px] font-black text-white/75">
                يدعم Ctrl + Enter للحفظ
                السريع
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add comment */}
      <form
        onSubmit={handleSubmit}
        className="
          overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        {/* Card header */}
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                grid h-10 w-10 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <Plus className="h-5 w-5" />
            </span>

            <div>
              <h3 className="text-sm font-black text-[#123f59]">
                إضافة تعليق جديد
              </h3>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                تعليقات داخلية خاصة
                بالمعاملة.
              </p>
            </div>
          </div>

          <div
            className="
              hidden items-center gap-1.5 rounded-2xl
              border border-[#d8b46a]/25 bg-white
              px-3 py-1.5 text-[10px]
              font-black text-[#64748b]
              sm:flex
            "
          >
            <ShieldCheck className="h-3.5 w-3.5 text-[#c5983c]" />
            تعليق داخلي
          </div>
        </div>

        {/* Form body */}
        <div className="space-y-4 p-5">
          <textarea
            value={newComment}
            onChange={(e) =>
              setNewComment(
                e.target.value,
              )
            }
            placeholder="اكتب تعليقك، ملاحظتك، أو التوجيه هنا..."
            className="
              min-h-[130px] w-full resize-none rounded-[24px]
              border border-[#d8b46a]/30 bg-[#fbf8f1]/70
              p-4 text-sm font-bold leading-8 text-[#123f59]
              outline-none transition-all
              placeholder:text-[#64748b]/70
              focus:border-[#c5983c]
              focus:bg-white
              focus:ring-4 focus:ring-[#c5983c]/10
            "
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                (e.ctrlKey || e.metaKey)
              ) {
                handleAddComment();
              }
            }}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="
                flex items-center gap-2 rounded-2xl
                border border-[#d8b46a]/20
                bg-[#fbf8f1] px-3 py-2
                text-[10px] font-black text-[#64748b]
              "
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[#c5983c]" />

              يمكنك استخدام{" "}
              <span className="text-[#123f59]">
                Ctrl + Enter
              </span>{" "}
              للحفظ السريع.
            </div>

            <button
              type="submit"
              disabled={
                updateTxMutation.isPending ||
                !newComment.trim()
              }
              className="
                flex w-full items-center justify-center gap-2
                rounded-2xl bg-gradient-to-l
                from-[#123f59] via-[#15536f] to-[#0e7490]
                px-6 py-3 text-xs font-black text-white
                shadow-[0_12px_26px_rgba(18,63,89,0.20)]
                transition hover:-translate-y-[1px]
                disabled:cursor-not-allowed disabled:opacity-50
                sm:w-auto
              "
            >
              {updateTxMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
              ) : (
                <Send className="h-4 w-4 text-[#e2bf74]" />
              )}

              حفظ التعليق
            </button>
          </div>
        </div>
      </form>

      {/* Comments history */}
      <div
        className="
          overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        {/* History header */}
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                grid h-10 w-10 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <History className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black text-[#123f59]">
                سجل التعليقات
              </h4>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                جميع التعليقات السابقة
                المرتبطة بهذه المعاملة.
              </p>
            </div>
          </div>

          <span
            className="
              rounded-2xl border border-[#d8b46a]/25
              bg-[#fbf8f1] px-3 py-1.5
              text-[10px] font-black text-[#9a6b16]
            "
          >
            {comments.length} تعليق
          </span>
        </div>

        {/* Comments body */}
        <div
          className="
            custom-scrollbar-slim max-h-[620px]
            overflow-y-auto bg-gradient-to-br
            from-[#eef7f6]/60 via-[#fbf8f1]/60 to-white
            p-5
          "
        >
          {comments.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {comments.map(
                (comment, index) => (
                  <CommentCard
                    key={
                      comment.id ||
                      index
                    }
                    comment={comment}
                    updateTxMutation={
                      updateTxMutation
                    }
                    onDelete={() =>
                      handleDeleteComment(
                        comment.id,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsPill = ({
  icon: Icon,
  label,
  value,
}) => (
  <div
    className="
      flex items-center gap-2 rounded-2xl
      border border-white/15 bg-white/10
      px-4 py-3 backdrop-blur-md
    "
  >
    <span
      className="
        grid h-10 w-10 place-items-center rounded-2xl
        bg-[#e2bf74]/15 text-[#e2bf74]
      "
    >
      <Icon className="h-5 w-5" />
    </span>

    <div>
      <div className="text-[10px] font-black text-white/55">
        {label}
      </div>

      <div className="font-mono text-base font-black text-white">
        {value}
      </div>
    </div>
  </div>
);

const CommentCard = ({
  comment,
  updateTxMutation,
  onDelete,
}) => (
  <div
    className="
      group relative overflow-hidden rounded-[26px]
      border border-[#d8b46a]/30 bg-white
      shadow-sm transition-all
      hover:shadow-[0_14px_34px_rgba(18,63,89,0.12)]
    "
  >
    {/* Accent */}
    <div
      className="
        absolute right-0 top-0 h-full w-1.5
        bg-gradient-to-b from-[#c5983c] to-[#123f59]
        opacity-80 transition-opacity group-hover:opacity-100
      "
    />

    {/* Header */}
    <div
      className="
        flex items-start justify-between gap-4
        border-b border-[#e8ddc8]
        bg-[#fbf8f1]/65 px-5 py-4
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            grid h-11 w-11 shrink-0 place-items-center
            rounded-2xl bg-[#123f59] text-[#e2bf74]
            shadow-sm
          "
        >
          <User className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <div className="truncate text-xs font-black text-[#123f59]">
            {comment.user ||
              "موظف النظام"}
          </div>

          <div
            className="
              mt-1 flex items-center gap-1.5
              text-[10px] font-black text-[#64748b]
            "
          >
            <Clock className="h-3 w-3 text-[#c5983c]" />

            <span dir="ltr">
              {formatDateTime
                ? formatDateTime(
                    comment.date,
                  )
                : new Date(
                    comment.date,
                  ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={onDelete}
        disabled={
          updateTxMutation.isPending
        }
        className="
          grid h-10 w-10 place-items-center rounded-xl
          bg-rose-50 text-rose-500 opacity-0
          transition-all hover:bg-rose-500 hover:text-white
          disabled:opacity-50 group-hover:opacity-100
        "
        title="حذف التعليق"
        type="button"
      >
        {updateTxMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>

    {/* Body */}
    <div
      className="
        whitespace-pre-wrap px-6 py-5 pr-8
        text-sm font-bold leading-8 text-[#334155]
      "
    >
      {comment.text}
    </div>
  </div>
);

const EmptyState = () => (
  <div
    className="
      flex flex-col items-center justify-center
      rounded-[28px] border border-dashed
      border-[#d8b46a]/45 bg-white/75
      p-12 text-center
      shadow-[0_18px_45px_rgba(18,63,89,0.08)]
    "
  >
    <div
      className="
        mb-4 grid h-20 w-20 place-items-center
        rounded-[28px] bg-gradient-to-br
        from-[#123f59] to-[#0e7490]
        text-[#e2bf74]
        shadow-[0_16px_34px_rgba(18,63,89,0.22)]
      "
    >
      <MessageSquareText className="h-10 w-10" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد تعليقات مسجلة بعد
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يمكنك البدء بإضافة أول
      تعليق من النموذج أعلاه.
    </p>
  </div>
);