import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  MessageSquare,
  X,
  User,
  Loader2,
  Edit3,
  Trash2,
  Save,
  Send,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Bot,
} from "lucide-react";
import { toast } from "sonner";

export default function CommentsModal({ task, onClose, currentUser }) {
  const queryClient = useQueryClient();

  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data: allTasks = [] } = useQuery({
    queryKey: ["office-tasks"],
    enabled: false,
  });

  const currentTask = allTasks.find((item) => item.id === task.id) || task;
  const isFrozen = task.status === "frozen";

  const addMutation = useMutation({
    mutationFn: (text) =>
      api.post(`/office-tasks/${currentTask.id}/comments`, {
        text,
        authorName: currentUser?.name || "مستخدم",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      setText("");
      toast.success("تم إضافة التعليق");
    },

    onError: () => {
      toast.error("حدث خطأ أثناء إضافة التعليق");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, newText }) =>
      api.put(`/office-tasks/comments/${commentId}`, { text: newText }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      setEditingId(null);
      setEditValue("");
      toast.success("تم تعديل التعليق بنجاح");
    },

    onError: () => {
      toast.error("حدث خطأ أثناء تعديل التعليق");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId) => api.delete(`/office-tasks/comments/${commentId}`),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      toast.success("تم حذف التعليق");
    },

    onError: () => {
      toast.error("حدث خطأ أثناء حذف التعليق");
    },
  });

  const handleStartEdit = (comment) => {
    setEditingId(comment.id);
    setEditValue(comment.text || "");
  };

  const handleSubmitComment = () => {
    if (!text.trim()) return;
    addMutation.mutate(text.trim());
  };

  const handleUpdateComment = (commentId) => {
    if (!editValue.trim()) return;

    updateMutation.mutate({
      commentId,
      newText: editValue.trim(),
    });
  };

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
          flex max-h-[86vh] w-full max-w-3xl flex-col overflow-hidden
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
            px-5 py-4 text-white md:px-6
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
                <MessageSquare className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-black md:text-xl">
                  الملاحظات والتعليقات
                </h3>

                <p className="mt-1 max-w-xl truncate text-xs font-bold text-white/65">
                  {currentTask.description || "متابعة التعليقات الخاصة بالمهمة"}
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

        {/* Comments List */}
        <div
          className="
            min-h-0 flex-1 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-4 custom-scrollbar-slim md:p-6
          "
        >
          {currentTask.comments?.length > 0 ? (
            <div className="relative mr-2 border-r-2 border-[#d8b46a]/35 pr-6">
              <div className="space-y-5">
                {currentTask.comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    editingId={editingId}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={() => {
                      setEditingId(null);
                      setEditValue("");
                    }}
                    onUpdate={() => handleUpdateComment(comment.id)}
                    onDelete={() => {
                      if (window.confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
                        deleteMutation.mutate(comment.id);
                      }
                    }}
                    updatePending={updateMutation.isPending}
                    deletePending={deleteMutation.isPending}
                  />
                ))}
              </div>
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Input Area */}
        <div
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            p-4
          "
        >
          {isFrozen ? (
            <div
              className="
                flex items-center justify-center gap-2 rounded-2xl
                border border-blue-200 bg-blue-50
                px-4 py-3 text-center text-xs font-black text-blue-700
              "
            >
              <AlertCircle className="h-4 w-4" />
              لا يمكن إضافة تعليقات، المهمة مجمدة حالياً.
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitComment();
                  }
                }}
                placeholder="اكتب تعليقاً جديداً..."
                className="
                  h-14 flex-1 resize-none rounded-2xl
                  border border-[#d8b46a]/25 bg-white
                  px-4 py-3 text-sm font-bold text-[#123f59]
                  shadow-sm outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:bg-white
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />

              <button
                onClick={handleSubmitComment}
                disabled={!text.trim() || addMutation.isPending}
                className="
                  flex h-14 min-w-[120px] items-center justify-center gap-2
                  rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                  px-6 text-xs font-black text-white
                  shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                  transition hover:-translate-y-[1px]
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                type="button"
              >
                {addMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                ) : (
                  <Send className="h-4 w-4 text-[#e2bf74]" />
                )}
                إرسال
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const CommentItem = ({
  comment,
  editingId,
  editValue,
  setEditValue,
  onStartEdit,
  onCancelEdit,
  onUpdate,
  onDelete,
  updatePending,
  deletePending,
}) => {
  const isEditing = editingId === comment.id;
  const isSystem = comment.isSystem;

  return (
    <div className="relative">
      <div
        className={`
          absolute -right-[33px] top-4 grid h-5 w-5 place-items-center
          rounded-full border-4 border-white shadow-sm
          ${isSystem ? "bg-amber-500" : "bg-emerald-500"}
        `}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </div>

      <div
        className={`
          overflow-hidden rounded-[24px] border p-4
          shadow-[0_14px_34px_rgba(18,63,89,0.08)]
          backdrop-blur-xl transition-all hover:-translate-y-[1px]
          ${
            isSystem
              ? "border-amber-200 bg-amber-50/85"
              : "border-[#d8b46a]/25 bg-white/92"
          }
        `}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <div
              className={`
                grid h-9 w-9 shrink-0 place-items-center rounded-2xl border
                ${
                  isSystem
                    ? "border-amber-200 bg-white text-amber-700"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }
              `}
            >
              {isSystem ? (
                <Bot className="h-4 w-4" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-black text-[#123f59]">
                {comment.authorName || "مستخدم"}
              </p>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-[#94a3b8]">
                <Clock className="h-3.5 w-3.5" />
                <span>
                  {new Date(comment.createdAt).toLocaleDateString("ar-SA")}
                </span>
                <span>•</span>
                <span>
                  {new Date(comment.createdAt).toLocaleTimeString("ar-SA", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {!isSystem && (
            <div className="flex shrink-0 items-center gap-1.5">
              {isEditing ? (
                <ActionButton tone="slate" label="إلغاء" onClick={onCancelEdit}>
                  <X className="h-4 w-4" />
                </ActionButton>
              ) : (
                <>
                  <ActionButton
                    tone="blue"
                    label="تعديل"
                    onClick={() => onStartEdit(comment)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </ActionButton>

                  <ActionButton
                    tone="rose"
                    label={deletePending ? "حذف..." : "حذف"}
                    onClick={onDelete}
                    disabled={deletePending}
                  >
                    {deletePending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </ActionButton>
                </>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="
                h-20 flex-1 resize-none rounded-2xl
                border border-emerald-300 bg-white
                px-4 py-3 text-sm font-bold text-[#123f59]
                outline-none transition-all
                focus:border-emerald-500
                focus:ring-4 focus:ring-emerald-500/10
              "
              autoFocus
            />

            <button
              onClick={onUpdate}
              disabled={!editValue.trim() || updatePending}
              className="
                flex h-11 min-w-[90px] items-center justify-center gap-2
                rounded-2xl bg-emerald-600 px-4
                text-xs font-black text-white
                transition hover:bg-emerald-700
                disabled:cursor-not-allowed disabled:opacity-50
                sm:h-auto
              "
              type="button"
            >
              {updatePending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ
            </button>
          </div>
        ) : (
          <p
            className={`
              mt-2 whitespace-pre-wrap text-sm font-bold leading-8
              ${isSystem ? "text-amber-900" : "text-[#475569]"}
            `}
          >
            {comment.text}
          </p>
        )}

        {isSystem && (
          <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-2.5 py-1 text-[10px] font-black text-amber-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            تعليق نظامي
          </div>
        )}
      </div>
    </div>
  );
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
    slate: "border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex min-w-[48px] flex-col items-center justify-center gap-0.5
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

const EmptyState = () => (
  <div
    className="
      flex min-h-[300px] flex-col items-center justify-center
      rounded-[28px] border border-dashed border-[#d8b46a]/40
      bg-white/75 px-5 py-12 text-center
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
      <MessageSquare className="h-8 w-8" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد تعليقات حتى الآن
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      اكتب أول تعليق لمتابعة هذه المهمة.
    </p>

    <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      جاهز لإضافة الملاحظات
    </div>
  </div>
);