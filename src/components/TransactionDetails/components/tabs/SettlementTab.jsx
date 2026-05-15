import React from "react";
import {
  Check,
  ChevronUp,
  ChevronDown,
  Loader2,
  User,
  Handshake,
  Monitor,
  Scale,
  Banknote,
  TrendingUp,
  Receipt,
  ShieldCheck,
  Circle,
  Wallet,
  Activity,
  ArrowLeft,
} from "lucide-react";

export const SettlementTab = ({
  totalFees,
  totalCosts,
  estimatedProfit,
  distributableProfit,
  tx,
  openSections,
  toggleSection,
  finalizeSettlementMutation,
  safeNum,
  setActiveTab,
}) => {
  const deliveredSettlements =
    tx.settlements
      ?.filter((s) => s.status === "DELIVERED")
      .reduce((sum, s) => sum + safeNum(s.amount), 0) || 0;

  const remainingToSettle = Math.max(0, safeNum(totalCosts) - deliveredSettlements);

  const settlementProgress =
    safeNum(totalCosts) > 0
      ? Math.min(100, (deliveredSettlements / safeNum(totalCosts)) * 100)
      : 0;

  const brokersPaid =
    tx.settlements
      ?.filter((s) => s.targetType === "وسيط" && s.status === "DELIVERED")
      .reduce((sum, s) => sum + safeNum(s.amount), 0) || 0;

  const agentsPaid =
    tx.settlements
      ?.filter((s) => s.targetType === "معقب" && s.status === "DELIVERED")
      .reduce((sum, s) => sum + safeNum(s.amount), 0) || 0;

  const remotePaid =
    tx.remoteTasks
      ?.filter((t) => t.isPaid)
      .reduce((sum, t) => sum + safeNum(t.cost), 0) || 0;

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
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-emerald-400/12 blur-3xl" />
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
              <Scale className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">
                التسوية الشاملة للمعاملة
              </h2>

              <p className="mt-1 text-xs font-bold text-white/55">
                مراجعة التكاليف، المدفوعات، المتبقي، ثم اعتماد التسوية النهائية.
              </p>
            </div>
          </div>

          <div
            className="
              flex w-max items-center gap-2 rounded-2xl
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
              <ShieldCheck className="h-5 w-5" />
            </span>

            <div>
              <div className="text-[10px] font-black text-white/55">
                المتبقي للتسوية
              </div>

              <div className="font-mono text-base font-black text-white">
                {remainingToSettle.toLocaleString()} ر.س
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="السعر المتفق الإجمالي"
          value={totalFees}
          icon={Banknote}
          tone="blue"
        />

        <SummaryCard
          label="إجمالي التكاليف"
          value={totalCosts}
          icon={Receipt}
          tone="rose"
        />

        <SummaryCard
          label="الربح التقديري"
          value={estimatedProfit}
          icon={TrendingUp}
          tone="emerald"
        />

        <SummaryCard
          label="صافي قابل للتسوية"
          value={distributableProfit}
          icon={Wallet}
          tone="gold"
        />
      </div>

      {/* Progress */}
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
              <Activity className="h-4 w-4" />
            </span>
            تقدم التسوية
          </h3>

          <span
            className="
              rounded-2xl border border-[#d8b46a]/25
              bg-white px-3 py-1.5 text-[10px]
              font-black text-[#123f59]
            "
          >
            {settlementProgress.toFixed(0)}%
          </span>
        </div>

        <div className="p-5">
          <div className="mb-3 flex items-center justify-between text-[11px] font-black">
            <span className="text-[#64748b]">المدفوع من إجمالي التكاليف</span>

            <span className="font-mono text-[#123f59]" dir="ltr">
              {deliveredSettlements.toLocaleString()} /{" "}
              {safeNum(totalCosts).toLocaleString()} ر.س
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-[#eef7f6]">
            <div
              className="
                h-full rounded-full bg-gradient-to-l
                from-emerald-500 via-[#c5983c] to-[#123f59]
                transition-all duration-500
              "
              style={{ width: `${settlementProgress}%` }}
            />
          </div>

          <div className="mt-3 flex justify-between text-[10px] font-bold text-[#64748b]">
            <span>بداية التسوية</span>
            <span>اكتمال التسوية</span>
          </div>
        </div>
      </div>

      {/* Brokers */}
      <SettlementSection
        title="تسوية الوسطاء"
        subtitle="مراجعة مستحقات الوسطاء والمدفوع والمتبقي"
        icon={Handshake}
        tone="cyan"
        isOpen={openSections.brokers}
        onToggle={() => toggleSection("brokers")}
        paid={brokersPaid}
        remaining={Math.max(0, safeNum(tx.mediatorFees) - brokersPaid)}
      >
        <SettlementTable
          emptyText="لا يوجد وسطاء"
          rows={tx.brokers || []}
          columns={["الوسيط", "المبلغ", "المدفوع", "المتبقي", "الحالة", "إجراء"]}
          renderRow={(b, i) => {
            const cost = safeNum(b.fees);

            const paid =
              tx.settlements
                ?.filter(
                  (s) =>
                    s.targetId === b.personId && s.status === "DELIVERED",
                )
                .reduce((sum, s) => sum + safeNum(s.amount), 0) || 0;

            const remaining = Math.max(0, cost - paid);
            const isFullyPaid = paid >= cost && cost > 0;

            return (
              <SettlementRow
                key={b.id || i}
                index={i}
                name={b.name}
                typeLabel="وسيط"
                icon={Handshake}
                cost={cost}
                paid={paid}
                remaining={remaining}
                isFullyPaid={isFullyPaid}
              />
            );
          }}
        />
      </SettlementSection>

      {/* Agents */}
      <SettlementSection
        title="تسوية المعقبين"
        subtitle="مراجعة مستحقات المعقبين والمدفوع والمتبقي"
        icon={User}
        tone="purple"
        isOpen={openSections.agents}
        onToggle={() => toggleSection("agents")}
        paid={agentsPaid}
        remaining={Math.max(0, safeNum(tx.agentCost) - agentsPaid)}
      >
        <SettlementTable
          emptyText="لا يوجد معقبين"
          rows={tx.agents || []}
          columns={["المعقب", "المبلغ", "المدفوع", "المتبقي", "الحالة", "إجراء"]}
          renderRow={(ag, i) => {
            const cost = safeNum(ag.fees);

            const paid =
              tx.settlements
                ?.filter((s) => s.targetId === ag.id && s.status === "DELIVERED")
                .reduce((sum, s) => sum + safeNum(s.amount), 0) || 0;

            const remaining = Math.max(0, cost - paid);
            const isFullyPaid = paid >= cost && cost > 0;

            return (
              <SettlementRow
                key={ag.id || i}
                index={i}
                name={ag.name}
                typeLabel={ag.role || "معقب"}
                icon={User}
                cost={cost}
                paid={paid}
                remaining={remaining}
                isFullyPaid={isFullyPaid}
              />
            );
          }}
        />
      </SettlementSection>

      {/* Remote */}
      <SettlementSection
        title="تسوية العمل عن بعد"
        subtitle="مراجعة تكاليف منفذي العمل عن بعد وتسوياتهم"
        icon={Monitor}
        tone="emerald"
        isOpen={openSections.remote}
        onToggle={() => toggleSection("remote")}
        paid={remotePaid}
        remaining={Math.max(0, safeNum(tx.remoteCost) - remotePaid)}
      >
        <SettlementTable
          emptyText="لا توجد مهام مسجلة"
          rows={tx.remoteTasks || []}
          columns={["الموظف", "المبلغ", "المدفوع", "المتبقي", "الحالة", "إجراء"]}
          renderRow={(rt, i) => {
            const cost = safeNum(rt.cost);
            const paid = rt.isPaid ? cost : safeNum(rt.paidAmount);
            const remaining = Math.max(0, cost - paid);
            const isFullyPaid = paid >= cost && cost > 0;

            return (
              <SettlementRow
                key={rt.id || i}
                index={i}
                name={rt.workerName}
                typeLabel={rt.taskName || "مهمة عن بعد"}
                icon={Monitor}
                cost={cost}
                paid={paid}
                remaining={remaining}
                isFullyPaid={isFullyPaid}
              />
            );
          }}
        />
      </SettlementSection>

      {/* Footer */}
      <div
        className="
          relative overflow-hidden rounded-[28px]
          border border-emerald-300/35
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-5 shadow-[0_20px_55px_rgba(18,63,89,0.20)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-emerald-400/12 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-[#c5983c]/18 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[11px] font-black text-white/55">
              صافي قابل للتسوية
            </div>

            <div className="mt-1 font-mono text-3xl font-black text-white">
              {safeNum(distributableProfit).toLocaleString()}{" "}
              <span className="text-[12px] text-white/45">ر.س</span>
            </div>

            <div className="mt-2 text-[11px] font-bold text-white/55">
              المتبقي من التسويات:{" "}
              <span className="font-mono font-black text-rose-300">
                {remainingToSettle.toLocaleString()} ر.س
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {setActiveTab && (
              <button
                onClick={() => setActiveTab("profits")}
                className="
                  flex h-12 items-center justify-center gap-2
                  rounded-2xl border border-white/15
                  bg-white/10 px-5 text-xs font-black text-white
                  transition hover:bg-white/15
                "
                type="button"
              >
                عرض الأرباح
                <ArrowLeft className="h-4 w-4 text-[#e2bf74]" />
              </button>
            )}

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "هل أنت متأكد من اعتماد التسوية الشاملة؟ سيتم إغلاق التعديلات المالية لهذه المعاملة.",
                  )
                ) {
                  finalizeSettlementMutation.mutate();
                }
              }}
              disabled={finalizeSettlementMutation.isPending}
              className="
                flex h-12 items-center justify-center gap-2
                rounded-2xl bg-emerald-500 px-6
                text-xs font-black text-white
                shadow-[0_12px_30px_rgba(16,185,129,0.20)]
                transition hover:-translate-y-[1px]
                hover:bg-emerald-600
                disabled:opacity-50
              "
              type="button"
            >
              {finalizeSettlementMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Check className="h-4 w-4" />
              )}
              تنفيذ التسوية الشاملة
            </button>
          </div>
        </div>
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
    gold: {
      card: "border-[#d8b46a]/40 bg-[#fbf8f1]",
      icon: "bg-[#f8efe0] text-[#c5983c]",
      label: "text-[#64748b]",
      value: "text-[#c5983c]",
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
        <span className="mr-1 text-[10px] font-black text-[#64748b]">
          ر.س
        </span>
      </div>
    </div>
  );
};

const SettlementSection = ({
  title,
  subtitle,
  icon: Icon,
  tone = "cyan",
  isOpen,
  onToggle,
  paid,
  remaining,
  children,
}) => {
  const tones = {
    cyan: {
      icon: "bg-cyan-50 text-cyan-700 border-cyan-200",
      title: "text-cyan-900",
      border: "border-cyan-200",
      badge: "bg-cyan-50 text-cyan-700 border-cyan-200",
    },
    purple: {
      icon: "bg-purple-50 text-purple-700 border-purple-200",
      title: "text-purple-900",
      border: "border-purple-200",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
    },
    emerald: {
      icon: "bg-emerald-50 text-emerald-700 border-emerald-200",
      title: "text-emerald-900",
      border: "border-emerald-200",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
  };

  const t = tones[tone] || tones.cyan;

  return (
    <div
      className={`
        overflow-hidden rounded-[28px] border bg-white
        shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        ${t.border}
      `}
    >
      <button
        onClick={onToggle}
        className="
          flex w-full items-center justify-between gap-4
          border-b border-[#e8ddc8]
          bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
          px-5 py-4 text-right transition hover:bg-[#fbf8f1]
        "
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${t.icon}`}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h3 className={`truncate text-sm font-black ${t.title}`}>
              {title}
            </h3>

            <p className="mt-0.5 truncate text-[10px] font-bold text-[#64748b]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`
              hidden rounded-2xl border px-3 py-1.5
              text-[10px] font-black md:inline-flex
              ${t.badge}
            `}
          >
            مدفوع: {Number(paid || 0).toLocaleString()}
          </span>

          <span
            className="
              hidden rounded-2xl border border-rose-200
              bg-rose-50 px-3 py-1.5
              text-[10px] font-black text-rose-700 md:inline-flex
            "
          >
            متبقي: {Number(remaining || 0).toLocaleString()}
          </span>

          <span
            className="
              grid h-9 w-9 place-items-center rounded-2xl
              border border-[#d8b46a]/25 bg-white
              text-[#c5983c]
            "
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </div>
      </button>

      {isOpen && <div className="p-4 animate-in fade-in">{children}</div>}
    </div>
  );
};

const SettlementTable = ({ columns, rows, emptyText, renderRow }) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d8b46a]/30 bg-white">
      <div className="overflow-x-auto custom-scrollbar-slim">
        <table className="w-full min-w-[850px] text-right text-[12px]">
          <thead className="bg-[#0f3448] text-white">
            <tr className="h-[46px]">
              {columns.map((col) => (
                <th
                  key={col}
                  className="border-l border-white/10 px-4 font-black last:border-l-0"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#e8ddc8]/70">
            {safeRows.length > 0 ? (
              safeRows.map(renderRow)
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-12 text-center"
                >
                  <div
                    className="
                      mx-auto mb-3 grid h-14 w-14 place-items-center
                      rounded-3xl border border-[#d8b46a]/35
                      bg-[#f8efe0] text-[#c5983c]
                    "
                  >
                    <ShieldCheck className="h-7 w-7" />
                  </div>

                  <p className="text-sm font-black text-[#123f59]">
                    {emptyText}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SettlementRow = ({
  index,
  name,
  typeLabel,
  icon: Icon,
  cost,
  paid,
  remaining,
  isFullyPaid,
}) => {
  return (
    <tr
      className={`
        transition-colors hover:bg-cyan-50/40
        ${index % 2 === 1 ? "bg-[#fbf8f1]/50" : "bg-white"}
      `}
    >
      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className="
              grid h-10 w-10 place-items-center rounded-2xl
              bg-[#123f59] text-[#e2bf74]
            "
          >
            <Icon className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <div className="truncate text-[12px] font-black text-[#123f59]">
              {name || "غير محدد"}
            </div>

            <div className="mt-0.5 text-[10px] font-bold text-[#64748b]">
              {typeLabel}
            </div>
          </div>
        </div>
      </td>

      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <Amount value={cost} tone="blue" />
      </td>

      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <Amount value={paid} tone="emerald" />
      </td>

      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <Amount value={remaining} tone={remaining > 0 ? "rose" : "emerald"} />
      </td>

      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <span
          className={`
            flex w-max items-center gap-1.5 rounded-xl
            border px-3 py-1.5 text-[10px] font-black
            ${
              isFullyPaid
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }
          `}
        >
          {isFullyPaid ? (
            <Check className="h-3 w-3" />
          ) : (
            <Circle className="h-3 w-3" />
          )}

          {isFullyPaid ? "مُسوّى" : "قيد الانتظار"}
        </span>
      </td>

      <td className="px-4 py-4">
        <button
          className="
            rounded-xl border border-[#d8b46a]/25
            bg-[#fbf8f1] px-3 py-2
            text-[10px] font-black text-[#123f59]
            transition hover:bg-[#f8efe0]
          "
          type="button"
        >
          تفاصيل
        </button>
      </td>
    </tr>
  );
};

const Amount = ({ value, tone = "blue" }) => {
  const colors = {
    blue: "text-[#123f59]",
    emerald: "text-emerald-700",
    rose: "text-rose-600",
  };

  return (
    <div className={`font-mono text-[13px] font-black ${colors[tone]}`}>
      {Number(value || 0).toLocaleString()}
      <span className="mr-1 text-[10px] text-[#64748b]">ر.س</span>
    </div>
  );
};