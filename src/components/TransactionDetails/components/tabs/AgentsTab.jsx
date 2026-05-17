import React from "react";
import {
  Plus,
  Check,
  Circle,
  Trash2,
  Banknote,
  Loader2,
  Users,
  UserCheck,
  Wallet,
  CreditCard,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

// 2. تبويب المعقبين
export const AgentsTab = ({
  tx,
  safeNum,
  setIsAddAgentOpen,
  deleteAgentMutation,
  setPayPersonData,
}) => {
  const agents = tx.agents || [];

  const getAgentPaymentData = (agent) => {
    const cost = safeNum(agent.fees);

    const paid =
      tx.settlements
        ?.filter(
          (settlement) =>
            settlement.targetId === agent.id &&
            settlement.status === "DELIVERED",
        )
        .reduce((sum, settlement) => sum + settlement.amount, 0) || 0;

    const remaining = Math.max(0, cost - paid);
    const isFullyPaid = paid >= cost && cost > 0;

    let statusLabel = "قيد الانتظار";
    let statusMeta = {
      icon: Circle,
      className:
        "border-amber-200 bg-amber-50 text-amber-700",
    };

    if (isFullyPaid) {
      statusLabel = "تم الدفع";
      statusMeta = {
        icon: Check,
        className:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    } else if (paid > 0) {
      statusLabel = "دفع جزئي";
      statusMeta = {
        icon: Circle,
        className:
          "border-blue-200 bg-blue-50 text-blue-700",
      };
    }

    return {
      cost,
      paid,
      remaining,
      isFullyPaid,
      statusLabel,
      statusMeta,
    };
  };

  const handlePayAgent = (agent, remaining) => {
    setPayPersonData({
      targetType: "معقب",
      targetId: agent.id,
      workerName: agent.name,
      taskName: agent.role || "أتعاب تعقيب",
      totalCost: remaining,
      paymentType: "full",
      amountSar: remaining,
      paymentDate: new Date().toISOString().split("T")[0],
    });
  };

  const handleDeleteAgent = (agent) => {
    if (window.confirm("هل تريد إزالة هذا المعقب من المعاملة؟")) {
      deleteAgentMutation.mutate(agent.id);
    }
  };

  return (
    <div
      className="
        space-y-5 p-4 animate-in fade-in
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          p-5 text-white
          shadow-[0_18px_45px_rgba(18,63,89,0.16)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Users className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black md:text-xl">
                المعقبون المرتبطون بالمعاملة
              </h3>

              <p className="mt-1 text-xs font-bold text-white/65">
                متابعة الأتعاب، المدفوعات، والمتبقي لكل معقب.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="
                flex items-center gap-2 rounded-2xl
                border border-rose-300/25 bg-rose-400/15
                px-4 py-2
              "
            >
              <Wallet className="h-4 w-4 text-rose-100" />

              <span className="text-[11px] font-black text-white/70">
                إجمالي أتعاب المعقبين
              </span>

              <span className="font-mono text-sm font-black text-white">
                {safeNum(tx.agentCost).toLocaleString()} ر.س
              </span>
            </div>

            <button
              onClick={() => setIsAddAgentOpen(true)}
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
              إضافة معقب
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          icon={Users}
          label="عدد المعقبين"
          value={agents.length}
          tone="blue"
        />

        <SummaryCard
          icon={CreditCard}
          label="إجمالي الأتعاب"
          value={`${safeNum(tx.agentCost).toLocaleString()} ر.س`}
          tone="rose"
        />

        <SummaryCard
          icon={ShieldCheck}
          label="حالة السجل"
          value={agents.length > 0 ? "نشط" : "فارغ"}
          tone="emerald"
        />
      </div>

      {/* Desktop table */}
      <div
        className="
          hidden overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30 bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl lg:block
        "
      >
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
              <UserCheck className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black text-[#123f59]">
                قائمة المعقبين
              </h4>

              <p className="text-[11px] font-bold text-[#64748b]">
                تفاصيل التكلفة والمدفوعات والإجراءات.
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
            {agents.length} معقب
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[920px] text-right text-[12px]">
            <thead>
              <tr
                className="
                  border-b border-[#e8ddc8]
                  bg-[#fbf8f1]/80 text-[#123f59]
                "
              >
                <th className="px-4 py-3 font-black">المعقب</th>
                <th className="px-4 py-3 font-black">الدور / المهمة</th>
                <th className="px-4 py-3 font-black">الأتعاب</th>
                <th className="px-4 py-3 font-black">المدفوع</th>
                <th className="px-4 py-3 font-black">المتبقي</th>
                <th className="px-4 py-3 font-black">الحالة</th>
                <th className="px-4 py-3 text-center font-black">
                  إجراءات
                </th>
              </tr>
            </thead>

            <tbody>
              {agents.length > 0 ? (
                agents.map((agent, index) => {
                  const {
                    cost,
                    paid,
                    remaining,
                    isFullyPaid,
                    statusLabel,
                    statusMeta,
                  } = getAgentPaymentData(agent);

                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr
                      key={agent.id || index}
                      className="
                        border-b border-[#e8ddc8]/65
                        transition-colors hover:bg-[#fbf8f1]/70
                      "
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <span
                            className="
                              grid h-10 w-10 place-items-center
                              rounded-2xl border border-blue-200
                              bg-blue-50 text-blue-700
                            "
                          >
                            <UserCheck className="h-4 w-4" />
                          </span>

                          <span className="font-black text-[#123f59]">
                            {agent.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-[#64748b]">
                        {agent.role || "معقب"}
                      </td>

                      <td className="px-4 py-4 font-mono font-black text-[#123f59]">
                        {cost.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 font-mono font-black text-emerald-600">
                        {paid.toLocaleString()}
                      </td>

                      <td className="px-4 py-4 font-mono font-black text-rose-600">
                        {remaining.toLocaleString()}
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge
                          icon={StatusIcon}
                          label={statusLabel}
                          className={statusMeta.className}
                        />
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {remaining > 0 && (
                            <ActionButton
                              label="سداد"
                              tone="emerald"
                              onClick={(event) => {
                                event.stopPropagation();
                                handlePayAgent(agent, remaining);
                              }}
                            >
                              <Banknote className="h-4 w-4" />
                            </ActionButton>
                          )}

                          <ActionButton
                            label={
                              deleteAgentMutation.isPending
                                ? "حذف..."
                                : "حذف"
                            }
                            tone="rose"
                            disabled={deleteAgentMutation.isPending}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteAgent(agent);
                            }}
                          >
                            {deleteAgentMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <EmptyState />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        {agents.length > 0 ? (
          agents.map((agent, index) => {
            const {
              cost,
              paid,
              remaining,
              statusLabel,
              statusMeta,
            } = getAgentPaymentData(agent);

            const StatusIcon = statusMeta.icon;

            return (
              <div
                key={agent.id || index}
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
                        rounded-2xl border border-blue-200
                        bg-blue-50 text-blue-700
                      "
                    >
                      <UserCheck className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-[#123f59]">
                        {agent.name}
                      </h4>

                      <p className="mt-1 text-xs font-bold text-[#64748b]">
                        {agent.role || "معقب"}
                      </p>
                    </div>
                  </div>

                  <StatusBadge
                    icon={StatusIcon}
                    label={statusLabel}
                    className={statusMeta.className}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <MoneyBox label="الأتعاب" value={cost} tone="slate" />
                  <MoneyBox label="المدفوع" value={paid} tone="emerald" />
                  <MoneyBox label="المتبقي" value={remaining} tone="rose" />
                </div>

                <div className="mt-4 flex items-center justify-end gap-2">
                  {remaining > 0 && (
                    <ActionButton
                      label="سداد"
                      tone="emerald"
                      onClick={(event) => {
                        event.stopPropagation();
                        handlePayAgent(agent, remaining);
                      }}
                    >
                      <Banknote className="h-4 w-4" />
                    </ActionButton>
                  )}

                  <ActionButton
                    label={
                      deleteAgentMutation.isPending ? "حذف..." : "حذف"
                    }
                    tone="rose"
                    disabled={deleteAgentMutation.isPending}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteAgent(agent);
                    }}
                  >
                    {deleteAgentMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </ActionButton>
                </div>
              </div>
            );
          })
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
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

        <div>
          <p className="text-[11px] font-black text-[#64748b]">
            {label}
          </p>

          <p className="mt-1 font-mono text-lg font-black text-[#123f59]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ icon: Icon, label, className }) => (
  <span
    className={`
      inline-flex w-fit items-center gap-1.5 rounded-xl border
      px-2.5 py-1 text-[10px] font-black
      ${className}
    `}
  >
    <Icon className="h-3.5 w-3.5" />
    {label}
  </span>
);

const ActionButton = ({
  children,
  label,
  tone = "emerald",
  onClick,
  disabled,
}) => {
  const tones = {
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    rose:
      "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex min-w-[54px] flex-col items-center justify-center gap-0.5
        rounded-xl border px-2 py-1.5
        text-[8px] font-black leading-none
        transition-all hover:-translate-y-[1px]
        disabled:cursor-not-allowed disabled:opacity-50
        ${tones[tone] || tones.emerald}
      `}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
};

const MoneyBox = ({ label, value, tone = "slate" }) => {
  const tones = {
    slate: "text-[#123f59]",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
  };

  return (
    <div
      className="
        rounded-2xl border border-[#e8ddc8]
        bg-[#fbf8f1]/70 p-3 text-center
      "
    >
      <p className="text-[10px] font-black text-[#64748b]">
        {label}
      </p>

      <p
        className={`
          mt-1 font-mono text-sm font-black
          ${tones[tone] || tones.slate}
        `}
      >
        {value.toLocaleString()}
      </p>
    </div>
  );
};

const EmptyState = () => (
  <div
    className="
      flex min-h-[220px] flex-col items-center justify-center
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
      لا يوجد معقبون مرتبطون بهذه المعاملة
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يمكنك إضافة معقب جديد من الزر العلوي.
    </p>
  </div>
);