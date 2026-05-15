import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Plus,
  Save,
  User,
  Check,
  CalendarDays,
  Loader2,
  X,
  Trash2,
  MessageSquare,
  Flag,
  ClipboardList,
  ShieldCheck,
  Briefcase,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";

// عداد تنازلي
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft("بدون موعد");
      setIsUrgent(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft("وقت التسليم انتهى");
        setIsUrgent(true);
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`متبقي: ${days}ي ${hours}س ${minutes}د`);
      setIsUrgent(days < 1);
    };

    updateTimer();

    const timer = setInterval(updateTimer, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <span
      className={`
        flex w-max items-center gap-1.5 rounded-xl border
        px-3 py-1.5 font-mono text-[10px] font-black
        ${
          isUrgent
            ? "border-rose-200 bg-rose-50 text-rose-700"
            : "border-cyan-200 bg-cyan-50 text-cyan-700"
        }
      `}
    >
      <Clock className="h-3.5 w-3.5" />
      {timeLeft}
    </span>
  );
};

// استخراج الموظفين بشكل آمن
const getSafeEmployees = (empData) => {
  if (!empData) return [];

  if (Array.isArray(empData)) return empData;

  if (typeof empData === "string") {
    try {
      const parsed = JSON.parse(empData);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return [];
};

// استخراج التعليقات بشكل آمن
const getSafeComments = (comments) => {
  if (!comments) return [];

  if (Array.isArray(comments)) return comments;

  if (typeof comments === "string") {
    try {
      const parsed = JSON.parse(comments);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  return [];
};

export const TasksTab = ({
  tx,
  isSuperAdmin,
  persons = [],
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isAdding, setIsAdding] = useState(false);

  const { data: rawTasks = [], isLoading: isTasksLoading } = useQuery({
    queryKey: ["transaction-office-tasks", tx.id],
    queryFn: async () => {
      const res = await api.get("/office-tasks");
      const allTasks = res.data?.data || [];

      return allTasks.filter((t) => t.transactionId === tx.id);
    },
    enabled: !!tx.id,
  });

  const visibleTasks = useMemo(() => {
    return rawTasks.filter((t) => {
      if (t.isDeleted || t.status === "deleted") return false;

      const safeEmps = getSafeEmployees(t.assignedEmployees);

      const isMyTask = safeEmps.some(
        (e) => (e.name || e) === user?.name,
      );

      return isSuperAdmin || isMyTask;
    });
  }, [rawTasks, isSuperAdmin, user?.name]);

  const employees = useMemo(
    () => persons.filter((p) => p.role !== "عميل"),
    [persons],
  );

  const completedCount = visibleTasks.filter(
    (t) => t.status === "completed",
  ).length;

  const urgentCount = visibleTasks.filter(
    (t) => t.priority === "high" && t.status !== "completed",
  ).length;

  const pendingCount = visibleTasks.filter(
    (t) =>
      t.status !== "completed" &&
      t.status !== "frozen" &&
      t.status !== "cancelled",
  ).length;

  const [taskForm, setTaskForm] = useState({
    title: `مهمة جديدة - ${tx.transactionCode || "معاملة"}`,
    description: "",
    dueDate: "",
    priority: "medium",
    assignedEmployees: [],
  });

  const saveTaskMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();

      fd.append("title", taskForm.title);
      fd.append("description", taskForm.description);
      fd.append("dueDate", taskForm.dueDate);
      fd.append("priority", taskForm.priority);
      fd.append("transactionId", tx.id);
      fd.append(
        "assignedEmployees",
        JSON.stringify(taskForm.assignedEmployees),
      );
      fd.append("creatorName", user?.name || "مدير النظام");

      return api.post("/office-tasks", fd);
    },
    onSuccess: () => {
      toast.success("تم إسناد المهمة بنجاح");

      queryClient.invalidateQueries(["transaction-office-tasks", tx.id]);
      queryClient.invalidateQueries(["office-tasks"]);

      setIsAdding(false);

      setTaskForm({
        title: `مهمة جديدة - ${tx.transactionCode || "معاملة"}`,
        description: "",
        dueDate: "",
        priority: "medium",
        assignedEmployees: [],
      });
    },
    onError: () => toast.error("حدث خطأ أثناء حفظ المهمة"),
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId) => api.delete(`/office-tasks/${taskId}`),
    onSuccess: () => {
      toast.success("تم حذف المهمة");

      queryClient.invalidateQueries(["transaction-office-tasks", tx.id]);
      queryClient.invalidateQueries(["office-tasks"]);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId) =>
      api.put(`/office-tasks/${taskId}/status`, { status: "completed" }),
    onSuccess: () => {
      toast.success("تم إتمام المهمة");

      queryClient.invalidateQueries(["transaction-office-tasks", tx.id]);
      queryClient.invalidateQueries(["office-tasks"]);
    },
  });

  return (
    <div
      className="
        min-h-full space-y-5 p-4 pb-10 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        animate-in fade-in
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-5 shadow-[0_20px_55px_rgba(18,63,89,0.20)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
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
              <ClipboardList className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">
                مهام المعاملة
              </h2>

              <p className="mt-1 text-xs font-bold text-white/55">
                إسناد المهام للموظفين، متابعة المواعيد، واعتماد الإنجاز.
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button
              onClick={() => setIsAdding(!isAdding)}
              className={`
                flex h-12 items-center justify-center gap-2
                rounded-2xl px-5 text-xs font-black
                shadow-[0_12px_30px_rgba(255,255,255,0.12)]
                transition-all duration-300
                hover:-translate-y-[1px]
                ${
                  isAdding
                    ? "border border-rose-300/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500 hover:text-white"
                    : "bg-white text-[#123f59] hover:bg-[#fbf8f1]"
                }
              `}
              type="button"
            >
              {isAdding ? (
                <X className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4 text-[#c5983c]" />
              )}
              {isAdding ? "إلغاء الأمر" : "إسناد مهمة جديدة"}
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryCard
          label="إجمالي المهام"
          value={visibleTasks.length}
          icon={CalendarDays}
          tone="blue"
        />

        <SummaryCard
          label="قيد التنفيذ"
          value={pendingCount}
          icon={Activity}
          tone="cyan"
        />

        <SummaryCard
          label="المهام العاجلة"
          value={urgentCount}
          icon={Flag}
          tone="rose"
        />

        <SummaryCard
          label="المهام المكتملة"
          value={completedCount}
          icon={Check}
          tone="emerald"
        />
      </div>

      {/* Add Task Form */}
      {isAdding && isSuperAdmin && (
        <div
          className="
            overflow-hidden rounded-[28px]
            border border-[#d8b46a]/30 bg-white
            shadow-[0_18px_45px_rgba(18,63,89,0.10)]
            animate-in slide-in-from-top-2
          "
        >
          <div
            className="
              flex items-center justify-between
              border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
              px-5 py-4
            "
          >
            <h3 className="flex items-center gap-2 text-sm font-black text-[#123f59]">
              <span
                className="
                  grid h-9 w-9 place-items-center rounded-2xl
                  bg-[#123f59] text-[#e2bf74]
                "
              >
                <Briefcase className="h-4 w-4" />
              </span>
              إسناد مهمة جديدة
            </h3>

            <span
              className="
                rounded-2xl border border-[#d8b46a]/25
                bg-white px-3 py-1.5
                text-[10px] font-black text-[#64748b]
              "
            >
              مهمة داخلية
            </span>
          </div>

          <div className="space-y-5 p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="عنوان المهمة">
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  className="
                    h-12 w-full rounded-2xl border border-[#d8b46a]/35
                    bg-[#fbf8f1]/70 px-4 text-sm font-black text-[#123f59]
                    outline-none transition
                    focus:border-[#c5983c] focus:bg-white
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                />
              </Field>

              <Field label="اختر الموظف المستهدف">
                <select
                  value={
                    taskForm.assignedEmployees.length > 0
                      ? taskForm.assignedEmployees[0].name
                      : ""
                  }
                  onChange={(e) => {
                    const empName = e.target.value;
                    const emp = employees.find((p) => p.name === empName);

                    setTaskForm({
                      ...taskForm,
                      assignedEmployees: emp
                        ? [{ id: emp.id || "auto", name: emp.name }]
                        : [],
                    });
                  }}
                  className="
                    h-12 w-full rounded-2xl border border-[#d8b46a]/35
                    bg-[#fbf8f1]/70 px-4 text-sm font-black text-[#123f59]
                    outline-none transition
                    focus:border-[#c5983c] focus:bg-white
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                >
                  <option value="">-- اختر موظف --</option>

                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="تاريخ التسليم النهائي">
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, dueDate: e.target.value })
                  }
                  className="
                    h-12 w-full rounded-2xl border border-[#d8b46a]/35
                    bg-[#fbf8f1]/70 px-4 font-mono text-sm font-black
                    text-[#123f59] outline-none transition
                    focus:border-[#c5983c] focus:bg-white
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                  dir="ltr"
                />
              </Field>

              <Field label="الأولوية">
                <select
                  value={taskForm.priority}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, priority: e.target.value })
                  }
                  className="
                    h-12 w-full rounded-2xl border border-[#d8b46a]/35
                    bg-[#fbf8f1]/70 px-4 text-sm font-black text-[#123f59]
                    outline-none transition
                    focus:border-[#c5983c] focus:bg-white
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                >
                  <option value="low">عادية</option>
                  <option value="medium">متوسطة</option>
                  <option value="high">عاجلة جداً 🔥</option>
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field label="وصف المهمة بدقة">
                  <textarea
                    value={taskForm.description}
                    onChange={(e) =>
                      setTaskForm({
                        ...taskForm,
                        description: e.target.value,
                      })
                    }
                    className="
                      min-h-[95px] w-full resize-none rounded-2xl
                      border border-[#d8b46a]/35
                      bg-[#fbf8f1]/70 p-4
                      text-sm font-bold leading-relaxed text-[#123f59]
                      outline-none transition
                      placeholder:text-[#94a3b8]
                      focus:border-[#c5983c] focus:bg-white
                      focus:ring-4 focus:ring-[#c5983c]/10
                    "
                    placeholder="اكتب التوجيهات والمطلوب من الموظف إنجازه..."
                  />
                </Field>
              </div>
            </div>

            <div className="flex justify-end border-t border-[#e8ddc8] pt-4">
              <button
                onClick={() => {
                  if (
                    !taskForm.title ||
                    taskForm.assignedEmployees.length === 0 ||
                    !taskForm.description
                  ) {
                    return toast.error(
                      "يرجى إكمال عنوان ووصف المهمة واختيار الموظف",
                    );
                  }

                  saveTaskMutation.mutate();
                }}
                disabled={saveTaskMutation.isPending}
                className="
                  flex items-center gap-2 rounded-2xl
                  bg-[#123f59] px-7 py-3
                  text-sm font-black text-white
                  shadow-[0_12px_30px_rgba(18,63,89,0.22)]
                  transition hover:-translate-y-[1px] hover:bg-[#0f3448]
                  disabled:opacity-50
                "
                type="button"
              >
                {saveTaskMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
                ) : (
                  <Save className="h-5 w-5 text-[#e2bf74]" />
                )}
                حفظ وإرسال المهمة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div
        className="
          overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        "
      >
        <div
          className="
            flex items-center justify-between
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <h3 className="flex items-center gap-2 text-xs font-black text-[#123f59]">
            <span
              className="
                grid h-9 w-9 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <CalendarDays className="h-4 w-4" />
            </span>
            قائمة المهام المرتبطة بالمعاملة
          </h3>

          <span
            className="
              rounded-2xl border border-[#d8b46a]/25
              bg-white px-3 py-1.5 text-[10px]
              font-black text-[#123f59]
            "
          >
            {visibleTasks.length} مهمة
          </span>
        </div>

        <div
          className="
            custom-scrollbar-slim max-h-[680px] space-y-4 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6]/60 via-[#fbf8f1]/60 to-white
            p-5
          "
        >
          {isTasksLoading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="h-9 w-9 animate-spin text-[#c5983c]" />
            </div>
          ) : visibleTasks.length > 0 ? (
            visibleTasks.map((t) => {
              const safeEmps = getSafeEmployees(t.assignedEmployees);
              const safeComments = getSafeComments(t.comments);

              const empNames = safeEmps.map((e) => e.name || e).join("، ");

              const isMyTask = safeEmps.some(
                (e) => (e.name || e) === user?.name,
              );

              const isCompleted = t.status === "completed";
              const isFrozen = t.status === "frozen";
              const isCancelled = t.status === "cancelled";
              const isHighPriority = t.priority === "high";

              return (
                <TaskCard
                  key={t.id}
                  task={t}
                  empNames={empNames}
                  isCompleted={isCompleted}
                  isFrozen={isFrozen}
                  isCancelled={isCancelled}
                  isHighPriority={isHighPriority}
                  isSuperAdmin={isSuperAdmin}
                  isMyTask={isMyTask}
                  safeComments={safeComments}
                  deleteTaskMutation={deleteTaskMutation}
                  completeTaskMutation={completeTaskMutation}
                />
              );
            })
          ) : (
            <EmptyTasks />
          )}
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({
  task,
  empNames,
  isCompleted,
  isFrozen,
  isCancelled,
  isHighPriority,
  isSuperAdmin,
  isMyTask,
  safeComments,
  deleteTaskMutation,
  completeTaskMutation,
}) => {
  const disabledState = isFrozen || isCancelled;

  const stateText = isCompleted
    ? "مكتملة ✅"
    : isFrozen
      ? "مجمدة ❄️"
      : isCancelled
        ? "ملغاة ❌"
        : "قيد التنفيذ";

  return (
    <div
      className={`
        group overflow-hidden rounded-[26px] border bg-white
        shadow-sm transition-all
        hover:shadow-[0_14px_34px_rgba(18,63,89,0.12)]
        ${
          isCompleted
            ? "border-emerald-200 bg-emerald-50/25"
            : disabledState
              ? "border-slate-200 bg-slate-50 opacity-70"
              : isHighPriority
                ? "border-rose-300 bg-white"
                : "border-[#d8b46a]/30"
        }
      `}
    >
      <div
        className={`
          flex flex-col gap-4 border-b px-5 py-4
          lg:flex-row lg:items-start lg:justify-between
          ${
            isHighPriority && !isCompleted
              ? "border-rose-100 bg-rose-50/50"
              : "border-[#e8ddc8] bg-[#fbf8f1]/65"
          }
        `}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span
            className={`
              grid h-12 w-12 shrink-0 place-items-center rounded-2xl
              ${
                isCompleted
                  ? "bg-emerald-600 text-white"
                  : isHighPriority
                    ? "bg-rose-500 text-white"
                    : "bg-[#123f59] text-[#e2bf74]"
              }
            `}
          >
            {isCompleted ? (
              <Check className="h-5 w-5" />
            ) : isHighPriority ? (
              <Flag className="h-5 w-5" />
            ) : (
              <User className="h-5 w-5" />
            )}
          </span>

          <div className="min-w-0">
            <div
              className={`
                truncate text-sm font-black
                ${
                  isCompleted
                    ? "text-emerald-800 line-through"
                    : "text-[#123f59]"
                }
              `}
              title={task.title}
            >
              {task.title || "مهمة"}
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span
                className="
                  rounded-xl border border-cyan-200
                  bg-cyan-50 px-2.5 py-1
                  text-[10px] font-black text-cyan-700
                "
              >
                المُنفذ: {empNames || "غير محدد"}
              </span>

              <span
                className="
                  rounded-xl border border-[#d8b46a]/25
                  bg-white px-2.5 py-1
                  text-[10px] font-black text-[#64748b]
                "
              >
                بواسطة: {task.creatorName || "النظام"}
              </span>

              {isHighPriority && !isCompleted && (
                <span
                  className="
                    flex items-center gap-1 rounded-xl
                    border border-rose-200 bg-rose-50
                    px-2.5 py-1
                    text-[10px] font-black text-rose-700
                  "
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  عاجلة جداً
                </span>
              )}
            </div>

            <div className="mt-2 font-mono text-[10px] font-bold text-[#64748b]">
              {task.createdAt
                ? new Date(task.createdAt).toLocaleDateString("ar-SA")
                : "—"}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {isSuperAdmin && (
            <button
              onClick={() => {
                if (window.confirm("حذف المهمة نهائياً؟")) {
                  deleteTaskMutation.mutate(task.id);
                }
              }}
              disabled={deleteTaskMutation.isPending}
              className="
                grid h-10 w-10 place-items-center rounded-xl
                bg-rose-50 text-rose-500
                transition hover:bg-rose-500 hover:text-white
                disabled:opacity-50
              "
              title="حذف المهمة"
              type="button"
            >
              {deleteTaskMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          )}

          {!isCompleted && !isFrozen && !isCancelled ? (
            <>
              <CountdownTimer targetDate={task.dueDate} />

              {(isMyTask || isSuperAdmin) && (
                <button
                  onClick={() => {
                    if (window.confirm("تأكيد إتمام المهمة؟")) {
                      completeTaskMutation.mutate(task.id);
                    }
                  }}
                  disabled={completeTaskMutation.isPending}
                  className="
                    flex items-center gap-1.5 rounded-xl
                    border border-emerald-200 bg-emerald-50
                    px-3 py-2 text-[10px]
                    font-black text-emerald-700
                    transition hover:bg-emerald-600 hover:text-white
                    disabled:opacity-50
                  "
                  type="button"
                >
                  {completeTaskMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  اعتماد الإنجاز
                </button>
              )}
            </>
          ) : (
            <span
              className="
                rounded-xl border border-slate-200 bg-slate-100
                px-3 py-2 text-xs font-black text-slate-600
              "
            >
              {stateText}
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <div
          className="
            whitespace-pre-wrap rounded-2xl
            border border-[#e8ddc8] bg-white
            p-4 text-sm font-bold leading-8 text-[#334155]
          "
        >
          {task.description || "لا يوجد وصف لهذه المهمة."}
        </div>

        {safeComments.length > 0 && (
          <div className="mt-4 border-t border-[#e8ddc8] pt-4">
            <h5 className="mb-3 flex items-center gap-1.5 text-[10px] font-black text-[#64748b]">
              <MessageSquare className="h-3.5 w-3.5 text-[#c5983c]" />
              الملاحظات والتعليقات
            </h5>

            <div className="space-y-2">
              {safeComments.map((c) => (
                <div
                  key={c.id}
                  className="
                    rounded-xl border border-[#e8ddc8]
                    bg-[#fbf8f1] p-3
                    text-[11px] font-bold text-[#334155]
                  "
                >
                  <span className="font-black text-[#123f59]">
                    {c.authorName || "مستخدم"}:
                  </span>{" "}
                  {c.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, tone = "blue" }) => {
  const tones = {
    blue: {
      card: "border-[#d8b46a]/30 bg-white",
      icon: "bg-[#123f59] text-[#e2bf74]",
      label: "text-[#64748b]",
      value: "text-[#123f59]",
    },
    cyan: {
      card: "border-cyan-300/45 bg-cyan-50/70",
      icon: "bg-cyan-600 text-white",
      label: "text-cyan-700",
      value: "text-cyan-800",
    },
    rose: {
      card: "border-rose-300/45 bg-rose-50/70",
      icon: "bg-rose-500 text-white",
      label: "text-rose-700",
      value: "text-rose-700",
    },
    emerald: {
      card: "border-emerald-300/45 bg-emerald-50/70",
      icon: "bg-emerald-600 text-white",
      label: "text-emerald-700",
      value: "text-emerald-800",
    },
  };

  const t = tones[tone] || tones.blue;

  return (
    <div
      className={`
        rounded-[24px] border p-4
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        ${t.card}
      `}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className={`text-[11px] font-black ${t.label}`}>{label}</div>

        <span className={`grid h-10 w-10 place-items-center rounded-2xl ${t.icon}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <div className={`font-mono text-2xl font-black ${t.value}`}>
        {Number(value || 0).toLocaleString()}
      </div>
    </div>
  );
};

const Field = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-black text-[#64748b]">
      {label}
    </label>

    {children}
  </div>
);

const EmptyTasks = () => (
  <div
    className="
      flex flex-col items-center justify-center
      rounded-[26px] border border-dashed
      border-[#d8b46a]/45 bg-white/70
      p-12 text-center
    "
  >
    <div
      className="
        mb-4 grid h-20 w-20 place-items-center
        rounded-[28px] bg-[#f8efe0]
        text-[#c5983c]
      "
    >
      <ShieldCheck className="h-10 w-10" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد مهام مسندة لهذه المعاملة حالياً
    </p>

    <p className="mt-1 max-w-sm text-xs font-bold leading-relaxed text-[#64748b]">
      عند إسناد مهمة جديدة، ستظهر هنا مع حالة الإنجاز والموعد النهائي.
    </p>
  </div>
);