import React from "react";
import {
  User,
  Plus,
  Check,
  Circle,
  Trash2,
  Monitor,
  Wallet,
  DollarSign,
  Landmark,
  ShieldCheck,
  Clock,
  AlertCircle,
  Sparkles,
  CreditCard,
  Loader2,
} from "lucide-react";

// =========================================================================
// Remote Employees / Tasks Tab
// =========================================================================
export const RemoteTab = ({
  tx,
  safeNum,
  formatDateTime,
  exchangeRates,
  setIsAddRemoteTaskOpen,
  deleteRemoteTaskMutation,
  setPayTaskData,
}) => {
  const usdRate =
    exchangeRates?.find((r) => r.currency === "USD")?.rate || 0.266;

  const egpRate =
    exchangeRates?.find((r) => r.currency === "EGP")?.rate || 13.2;

  const totalTasks = tx?.remoteTasks?.length || 0;

  const totalCost =
    tx?.remoteTasks?.reduce(
      (sum, task) => sum + safeNum(task.cost),
      0,
    ) || 0;

  const settledCount =
    tx?.remoteTasks?.filter((task) => {
      const taskCost = safeNum(task.cost);
      const taskPaid = task.isPaid
        ? taskCost
        : safeNum(task.paidAmount);

      return taskPaid >= taskCost && taskCost > 0;
    }).length || 0;

  return (
    <div
      className="
        min-h-full space-y-5 p-4 pb-10 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        animate-in fade-in duration-300 font-[Tajawal]
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
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-emerald-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div
              className="
                grid h-14 w-14 shrink-0 place-items-center rounded-3xl
                border border-[#e2bf74]/35 bg-white/12
                text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Monitor className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                سجل العمل والمهام عن بُعد
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                متابعة المهام الخارجية، التكلفة، التسويات، وحالة الدفع لكل موظف.
              </p>

              <div
                className="
                  mt-3 inline-flex items-center gap-1.5 rounded-xl
                  border border-white/15 bg-white/10
                  px-3 py-1.5 text-[10px]
                  font-black text-white/85
                "
              >
                <Sparkles className="h-3.5 w-3.5 text-[#e2bf74]" />
                لوحة متابعة ذكية للمهام الخارجية
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddRemoteTaskOpen(true)}
            className="
              flex h-11 items-center justify-center gap-2
              rounded-2xl bg-[#e2bf74] px-5
              text-xs font-black text-[#082032]
              shadow-[0_12px_28px_rgba(226,191,116,0.25)]
              transition-all hover:-translate-y-[1px]
              hover:bg-[#f5d99b]
            "
            type="button"
          >
            <Plus className="h-4 w-4" />
            تعيين مهمة جديدة
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon={Monitor}
          label="عدد المهام"
          value={totalTasks}
          tone="blue"
        />

        <SummaryCard
          icon={Wallet}
          label="إجمالي التكلفة"
          value={`${totalCost.toLocaleString()} ر.س`}
          tone="purple"
        />

        <SummaryCard
          icon={ShieldCheck}
          label="المهام المُسواة"
          value={`${settledCount}/${totalTasks}`}
          tone="emerald"
        />
      </div>

      {/* Desktop table */}
      <section
        className="
          hidden overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl xl:block
        "
      >
        <div
          className="
            flex items-center justify-between
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
              <Monitor className="h-5 w-5" />
            </span>

            <div>
              <h3 className="text-sm font-black text-[#123f59]">
                قائمة المهام الخارجية
              </h3>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                جميع المهام، الموظفين، العملات، وحالة التسوية.
              </p>
            </div>
          </div>

          <span
            className="
              rounded-2xl border border-[#d8b46a]/30
              bg-[#f8efe0] px-3 py-1.5
              text-xs font-black text-[#9a6b16]
            "
          >
            {totalTasks} مهمة
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[1100px] text-right text-[12px]">
            <thead>
              <tr
                className="
                  h-[52px] border-b border-[#e8ddc8]
                  bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                  text-white
                "
              >
                <th className="border-l border-white/10 px-4 font-black">
                  المهمة والموظف
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  التكلفة والعملات
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  المُنشئ والتاريخ
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  الحالة
                </th>

                <th className="px-4 text-center font-black">
                  إجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/70">
              {tx.remoteTasks?.length > 0 ? (
                tx.remoteTasks.map((task, index) => (
                  <DesktopRow
                    key={task.id || index}
                    task={task}
                    safeNum={safeNum}
                    formatDateTime={formatDateTime}
                    usdRate={usdRate}
                    egpRate={egpRate}
                    setPayTaskData={setPayTaskData}
                    deleteRemoteTaskMutation={deleteRemoteTaskMutation}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="5">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <div className="space-y-3 xl:hidden">
        {tx.remoteTasks?.length > 0 ? (
          tx.remoteTasks.map((task, index) => (
            <MobileCard
              key={task.id || index}
              task={task}
              safeNum={safeNum}
              formatDateTime={formatDateTime}
              usdRate={usdRate}
              egpRate={egpRate}
              setPayTaskData={setPayTaskData}
              deleteRemoteTaskMutation={deleteRemoteTaskMutation}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

// =========================================================================
// Desktop Row
// =========================================================================
const DesktopRow = ({
  task,
  safeNum,
  formatDateTime,
  usdRate,
  egpRate,
  setPayTaskData,
  deleteRemoteTaskMutation,
}) => {
  const taskCost = safeNum(task.cost);

  const taskPaid = task.isPaid
    ? taskCost
    : safeNum(task.paidAmount);

  const taskRemaining = Math.max(0, taskCost - taskPaid);

  const isFullyPaid = taskPaid >= taskCost && taskCost > 0;

  return (
    <tr className="transition-colors hover:bg-[#fbf8f1]/55">
      {/* Task */}
      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className="
              grid h-11 w-11 place-items-center rounded-2xl
              border border-emerald-200
              bg-emerald-50 text-emerald-700
            "
          >
            <Monitor className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <div className="truncate text-[13px] font-black text-[#123f59]">
              {task.taskName}
            </div>

            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <User className="h-3 w-3" />
              {task.workerName}
            </div>
          </div>
        </div>
      </td>

      {/* Currency */}
      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <div className="space-y-1.5">
          <CurrencyLine
            icon={Wallet}
            value={taskCost}
            label="SAR"
            tone="dark"
          />

          <CurrencyLine
            icon={DollarSign}
            value={(taskCost * usdRate).toFixed(2)}
            label="USD"
            tone="blue"
          />

          <CurrencyLine
            icon={Landmark}
            value={(taskCost * egpRate).toFixed(2)}
            label="EGP"
            tone="emerald"
          />
        </div>
      </td>

      {/* Assigned */}
      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <div className="text-[11px] font-black text-[#123f59]">
          {task.assignedBy || "موظف النظام"}
        </div>

        <div
          className="
            mt-1 inline-flex items-center gap-1 rounded-xl
            border border-[#e8ddc8]
            bg-white px-2 py-1
            font-mono text-[10px]
            font-black text-[#64748b]
          "
          dir="ltr"
        >
          <Clock className="h-3 w-3 text-[#c5983c]" />
          {formatDateTime(task.createdAt)}
        </div>
      </td>

      {/* Status */}
      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        {isFullyPaid ? (
          <StatusBadge
            icon={Check}
            label="تمت التسوية"
            tone="emerald"
          />
        ) : (
          <StatusBadge
            icon={Circle}
            label="بانتظار التسوية"
            tone="amber"
          />
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-4 text-center">
        <div className="flex items-center justify-center gap-2">
          {taskRemaining > 0 && (
            <button
              onClick={() => {
                setPayTaskData({
                  taskId: task.id,
                  workerName: task.workerName,
                  taskName: task.taskName,
                  totalCost: taskRemaining,
                  paymentType: "full",
                  amountSar: taskRemaining,
                  paymentDate: new Date()
                    .toISOString()
                    .split("T")[0],
                });
              }}
              className="
                flex h-9 items-center justify-center gap-1.5
                rounded-xl border border-emerald-200
                bg-emerald-50 px-3
                text-[10px] font-black text-emerald-700
                transition hover:bg-emerald-600 hover:text-white
              "
              type="button"
            >
              <CreditCard className="h-3.5 w-3.5" />
              تسوية
            </button>
          )}

          <DeleteButton
            onClick={() => {
              if (window.confirm("حذف المهمة؟")) {
                deleteRemoteTaskMutation.mutate(task.id);
              }
            }}
            loading={deleteRemoteTaskMutation.isPending}
          />
        </div>
      </td>
    </tr>
  );
};

// =========================================================================
// Mobile Card
// =========================================================================
const MobileCard = ({
  task,
  safeNum,
  formatDateTime,
  usdRate,
  egpRate,
  setPayTaskData,
  deleteRemoteTaskMutation,
}) => {
  const taskCost = safeNum(task.cost);

  const taskPaid = task.isPaid
    ? taskCost
    : safeNum(task.paidAmount);

  const taskRemaining = Math.max(0, taskCost - taskPaid);

  const isFullyPaid = taskPaid >= taskCost && taskCost > 0;

  return (
    <div
      className="
        overflow-hidden rounded-[26px]
        border border-[#d8b46a]/30 bg-white/90
        p-4 shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        backdrop-blur-xl
      "
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="
              grid h-11 w-11 shrink-0 place-items-center
              rounded-2xl border border-emerald-200
              bg-emerald-50 text-emerald-700
            "
          >
            <Monitor className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h4 className="truncate text-sm font-black text-[#123f59]">
              {task.taskName}
            </h4>

            <p className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-700">
              <User className="h-3 w-3" />
              {task.workerName}
            </p>
          </div>
        </div>

        {isFullyPaid ? (
          <StatusBadge
            icon={Check}
            label="تمت التسوية"
            tone="emerald"
          />
        ) : (
          <StatusBadge
            icon={Circle}
            label="بانتظار التسوية"
            tone="amber"
          />
        )}
      </div>

      {/* Currency */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <CurrencyBox
          label="SAR"
          value={taskCost}
          icon={Wallet}
          tone="dark"
        />

        <CurrencyBox
          label="USD"
          value={(taskCost * usdRate).toFixed(2)}
          icon={DollarSign}
          tone="blue"
        />

        <CurrencyBox
          label="EGP"
          value={(taskCost * egpRate).toFixed(2)}
          icon={Landmark}
          tone="emerald"
        />
      </div>

      {/* Footer */}
      <div
        className="
          mt-4 flex flex-col gap-3 border-t border-[#e8ddc8]
          pt-4 sm:flex-row sm:items-center sm:justify-between
        "
      >
        <div>
          <div className="text-[10px] font-black text-[#94a3b8]">
            المُنشئ
          </div>

          <div className="mt-1 text-xs font-black text-[#123f59]">
            {task.assignedBy || "موظف النظام"}
          </div>

          <div
            className="
              mt-1 inline-flex items-center gap-1 rounded-xl
              border border-[#e8ddc8]
              bg-white px-2 py-1
              font-mono text-[10px]
              font-black text-[#64748b]
            "
            dir="ltr"
          >
            <Clock className="h-3 w-3 text-[#c5983c]" />
            {formatDateTime(task.createdAt)}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {taskRemaining > 0 && (
            <button
              onClick={() => {
                setPayTaskData({
                  taskId: task.id,
                  workerName: task.workerName,
                  taskName: task.taskName,
                  totalCost: taskRemaining,
                  paymentType: "full",
                  amountSar: taskRemaining,
                  paymentDate: new Date()
                    .toISOString()
                    .split("T")[0],
                });
              }}
              className="
                flex h-10 items-center justify-center gap-1.5
                rounded-xl border border-emerald-200
                bg-emerald-50 px-4
                text-[10px] font-black text-emerald-700
                transition hover:bg-emerald-600 hover:text-white
              "
              type="button"
            >
              <CreditCard className="h-3.5 w-3.5" />
              تسوية
            </button>
          )}

          <DeleteButton
            onClick={() => {
              if (window.confirm("حذف المهمة؟")) {
                deleteRemoteTaskMutation.mutate(task.id);
              }
            }}
            loading={deleteRemoteTaskMutation.isPending}
          />
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// Components
// =========================================================================
const SummaryCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className="
        rounded-[24px] border border-[#d8b46a]/30
        bg-white/90 p-4
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        backdrop-blur-xl
      "
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            grid h-11 w-11 shrink-0 place-items-center
            rounded-2xl border
            ${tones[tone] || tones.blue}
          `}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <p className="text-[11px] font-black text-[#64748b]">
            {label}
          </p>

          <p className="mt-1 truncate font-mono text-lg font-black text-[#123f59]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const CurrencyLine = ({
  icon: Icon,
  value,
  label,
  tone = "dark",
}) => {
  const tones = {
    dark: "text-[#123f59]",
    blue: "text-blue-700",
    emerald: "text-emerald-700",
  };

  return (
    <div className={`flex items-center gap-1.5 ${tones[tone]}`}>
      <Icon className="h-3.5 w-3.5" />

      <span className="font-mono text-sm font-black">
        {value}
      </span>

      <span className="text-[10px] font-black opacity-70">
        {label}
      </span>
    </div>
  );
};

const CurrencyBox = ({
  label,
  value,
  icon: Icon,
  tone = "dark",
}) => {
  const tones = {
    dark: "border-[#d8b46a]/30 bg-[#fbf8f1] text-[#123f59]",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <div
      className={`
        rounded-2xl border p-3
        ${tones[tone] || tones.dark}
      `}
    >
      <div className="mb-1 flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />

        <span className="text-[9px] font-black">
          {label}
        </span>
      </div>

      <div className="font-mono text-sm font-black">
        {value}
      </div>
    </div>
  );
};

const StatusBadge = ({
  icon: Icon,
  label,
  tone = "emerald",
}) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-xl border
        px-2.5 py-1 text-[10px] font-black
        ${tones[tone] || tones.emerald}
      `}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const DeleteButton = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    className="
      grid h-10 w-10 place-items-center
      rounded-xl border border-rose-200
      bg-rose-50 text-rose-600
      transition hover:bg-rose-100
    "
    type="button"
  >
    {loading ? (
      <Loader2 className="h-4 w-4 animate-spin" />
    ) : (
      <Trash2 className="h-4 w-4" />
    )}
  </button>
);

const EmptyState = () => (
  <div
    className="
      flex min-h-[260px] flex-col items-center justify-center
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
      <AlertCircle className="h-8 w-8" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد مهام خارجية حتى الآن
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يمكنك إضافة أول مهمة من زر تعيين مهمة جديدة.
    </p>
  </div>
);