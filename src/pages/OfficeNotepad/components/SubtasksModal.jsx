import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  ListTodo,
  X,
  Check,
  Trash2,
  Plus,
  Loader2,
  User,
  Clock,
  Edit3,
  Save,
  AlertCircle,
  CheckCircle2,
  Snowflake,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export default function SubtasksModal({ task, onClose, currentUser }) {
  const queryClient = useQueryClient();

  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data: allTasks = [] } = useQuery({
    queryKey: ["office-tasks"],
    enabled: false,
  });

  const currentTask = allTasks.find((item) => item.id === task.id) || task;
  const isTaskCompleted = currentTask.status === "completed";
  const isFrozen = currentTask.status === "frozen";

  const addMutation = useMutation({
    mutationFn: (title) =>
      api.post(`/office-tasks/${currentTask.id}/subtasks`, {
        title,
        authorName: currentUser?.name || "مستخدم",
      }),

    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
      setNewTitle("");
      toast.success("تمت إضافة المهمة الفرعية");
    },

    onError: () => {
      toast.error("حدث خطأ أثناء إضافة المهمة الفرعية");
    },
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ subId, title }) =>
      api.put(`/office-tasks/subtasks/${subId}`, { title }),

    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
      setEditingId(null);
      setEditValue("");
      toast.success("تم تحديث المهمة الفرعية");
    },

    onError: () => {
      toast.error("حدث خطأ أثناء تحديث المهمة الفرعية");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (subId) => api.put(`/office-tasks/subtasks/${subId}/toggle`),

    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
    },

    onError: () => {
      toast.error("حدث خطأ أثناء تغيير حالة المهمة الفرعية");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (subId) => api.delete(`/office-tasks/subtasks/${subId}`),

    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
      toast.success("تم حذف المهمة الفرعية");
    },

    onError: () => {
      toast.error("حدث خطأ أثناء حذف المهمة الفرعية");
    },
  });

  const handleStartEdit = (subtask) => {
    setEditingId(subtask.id);
    setEditValue(subtask.title || "");
  };

  const handleAddSubtask = () => {
    if (!newTitle.trim()) return;
    addMutation.mutate(newTitle.trim());
  };

  const handleUpdateSubtask = (subId) => {
    if (!editValue.trim()) return;

    updateTitleMutation.mutate({
      subId,
      title: editValue.trim(),
    });
  };

  const subTasks = currentTask.subTasks || [];
  const completedCount = subTasks.filter((item) => item.isCompleted).length;
  const progress =
    subTasks.length > 0 ? Math.round((completedCount / subTasks.length) * 100) : 0;

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
          flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden
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
                <ListTodo className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-black md:text-xl">
                  المهام الفرعية
                </h3>

                <p className="mt-1 max-w-xl truncate text-xs font-bold text-white/65">
                  {currentTask.description || "تقسيم المهمة إلى خطوات قابلة للمتابعة"}
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

        {/* Status / Progress */}
        <div
          className="
            shrink-0 border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          {isTaskCompleted ? (
            <div
              className="
                flex items-center justify-center gap-2 rounded-2xl
                border border-amber-200 bg-amber-50
                px-4 py-3 text-center text-xs font-black text-amber-700
              "
            >
              <AlertCircle className="h-4 w-4" />
              هذه المهمة مكتملة، لا يمكن التعديل عليها.
            </div>
          ) : (
            <div
              className="
                rounded-[24px] border border-[#d8b46a]/30 bg-white/85
                p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
              "
            >
              <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                    <ShieldCheck className="h-4 w-4" />
                  </span>

                  <div>
                    <p className="text-xs font-black text-[#123f59]">
                      تقدم المهام الفرعية
                    </p>

                    <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                      {completedCount} مكتملة من أصل {subTasks.length}
                    </p>
                  </div>
                </div>

                <span
                  className="
                    w-fit rounded-xl border border-[#d8b46a]/30
                    bg-[#f8efe0] px-3 py-1.5
                    font-mono text-[10px] font-black text-[#9a6b16]
                  "
                >
                  {progress}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#e8ddc8]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#123f59] to-[#e2bf74] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* List */}
        <div
          className="
            min-h-0 flex-1 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-4 custom-scrollbar-slim md:p-6
          "
        >
          {subTasks.length > 0 ? (
            <div className="space-y-3">
              {subTasks.map((subtask) => (
                <SubtaskCard
                  key={subtask.id}
                  subtask={subtask}
                  editingId={editingId}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  isTaskCompleted={isTaskCompleted}
                  onToggle={() => toggleMutation.mutate(subtask.id)}
                  togglePending={toggleMutation.isPending}
                  onStartEdit={() => handleStartEdit(subtask)}
                  onCancelEdit={() => {
                    setEditingId(null);
                    setEditValue("");
                  }}
                  onSaveEdit={() => handleUpdateSubtask(subtask.id)}
                  updatePending={updateTitleMutation.isPending}
                  onDelete={() => {
                    if (window.confirm("هل تريد حذف هذه المهمة الفرعية؟")) {
                      deleteMutation.mutate(subtask.id);
                    }
                  }}
                  deletePending={deleteMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        {/* Add Input */}
        {!isTaskCompleted && (
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
                <Snowflake className="h-4 w-4" />
                لا يمكن إضافة مهام فرعية، المهمة مجمدة حالياً.
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="أدخل المهمة الفرعية..."
                  className="
                    h-12 flex-1 rounded-2xl
                    border border-[#d8b46a]/25 bg-white
                    px-4 text-sm font-bold text-[#123f59]
                    shadow-sm outline-none transition-all
                    placeholder:text-slate-400
                    focus:border-[#c5983c]/70
                    focus:bg-white
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                />

                <button
                  onClick={handleAddSubtask}
                  disabled={!newTitle.trim() || addMutation.isPending}
                  className="
                    flex h-12 min-w-[130px] items-center justify-center gap-2
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
                    <Plus className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  إضافة
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const SubtaskCard = ({
  subtask,
  editingId,
  editValue,
  setEditValue,
  isTaskCompleted,
  onToggle,
  togglePending,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  updatePending,
  onDelete,
  deletePending,
}) => {
  const isEditing = editingId === subtask.id;
  const isCompleted = subtask.isCompleted;

  return (
    <div
      className={`
        group overflow-hidden rounded-[24px] border p-4
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        backdrop-blur-xl transition-all
        hover:-translate-y-[1px]
        ${
          isCompleted
            ? "border-emerald-200 bg-emerald-50/85"
            : "border-[#d8b46a]/25 bg-white/92 hover:border-[#c5983c]/45"
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            onClick={onToggle}
            disabled={isTaskCompleted || togglePending}
            className={`
              mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border
              transition-all disabled:cursor-not-allowed disabled:opacity-50
              ${
                isCompleted
                  ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                  : "border-[#d8b46a]/35 bg-white text-transparent hover:border-emerald-400 hover:text-emerald-500"
              }
            `}
            type="button"
          >
            {togglePending ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#c5983c]" />
            ) : (
              <Check className="h-4 w-4" strokeWidth={3} />
            )}
          </button>

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                className="
                  h-10 w-full rounded-2xl
                  border border-emerald-300 bg-white
                  px-3 text-sm font-black text-[#123f59]
                  outline-none transition-all
                  focus:border-emerald-500
                  focus:ring-4 focus:ring-emerald-500/10
                "
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                autoFocus
              />
            ) : (
              <p
                className={`
                  text-sm font-black leading-7
                  ${
                    isCompleted
                      ? "text-emerald-700 line-through decoration-2"
                      : "text-[#123f59]"
                  }
                `}
              >
                {subtask.title}
              </p>
            )}

            <div
              className="
                mt-3 flex flex-wrap items-center gap-3
                border-t border-[#e8ddc8]/70 pt-2
                text-[10px] font-bold text-[#64748b]
              "
            >
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-[#c5983c]" />
                بواسطة: {subtask.authorName || "مستخدم"}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-[#c5983c]" />
                {subtask.createdAt
                  ? new Date(subtask.createdAt).toLocaleDateString("ar-SA")
                  : "—"}
              </span>

              {isCompleted && (
                <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-white px-2 py-0.5 text-[9px] font-black text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />
                  مكتملة
                </span>
              )}
            </div>
          </div>
        </div>

        {!isTaskCompleted && (
          <div className="flex shrink-0 items-center gap-1.5">
            {isEditing ? (
              <>
                <ActionButton
                  label="حفظ"
                  tone="emerald"
                  disabled={!editValue.trim() || updatePending}
                  onClick={onSaveEdit}
                >
                  {updatePending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                </ActionButton>

                <ActionButton label="إلغاء" tone="slate" onClick={onCancelEdit}>
                  <X className="h-4 w-4" />
                </ActionButton>
              </>
            ) : (
              <>
                <ActionButton label="تعديل" tone="blue" onClick={onStartEdit}>
                  <Edit3 className="h-4 w-4" />
                </ActionButton>

                <ActionButton
                  label={deletePending ? "حذف..." : "حذف"}
                  tone="rose"
                  disabled={deletePending}
                  onClick={onDelete}
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
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
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
      <ListTodo className="h-8 w-8" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد مهام فرعية حتى الآن
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      أضف أول مهمة فرعية لتقسيم العمل إلى خطوات واضحة.
    </p>

    <div className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      جاهز لإضافة الخطوات
    </div>
  </div>
);