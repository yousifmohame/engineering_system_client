import React from "react";
import {
  Plus,
  Trash2,
  Building2,
  Edit3,
  Banknote,
  Check,
  Circle,
  Loader2,
  ShieldCheck,
  CreditCard,
  Wallet,
  AlertCircle,
  FileText,
} from "lucide-react";

// 4. تبويب المكتب المتعاون
export const CoopOfficeTab = ({
  tx,
  txCoopFees = [],
  setIsCoopFeeModalOpen,
  setCoopFeeMode,
  setCoopFeeForm,
  initialCoopFeeForm,
  handleOpenCoopFeeEdit,
  deleteCoopFeeMutation,
  safeNum,
}) => {
  const totalFees = txCoopFees.reduce(
    (sum, item) => sum + safeNum(item.officeFees),
    0,
  );

  const totalPaid = txCoopFees.reduce(
    (sum, item) => sum + safeNum(item.paidAmount),
    0,
  );

  const totalRemaining = Math.max(0, totalFees - totalPaid);

  const handleAddCoopFee = () => {
    setCoopFeeMode("add");
    setCoopFeeForm(initialCoopFeeForm);
    setIsCoopFeeModalOpen(true);
  };

  const getFeePaymentData = (fee) => {
    const cost = safeNum(fee.officeFees);
    const paid = safeNum(fee.paidAmount);
    const remaining = Math.max(0, cost - paid);

    const isFullyPaid = paid >= cost && cost > 0;
    const isPartiallyPaid = paid > 0 && !isFullyPaid;

    let statusLabel = "غير مدفوع";
    let statusMeta = {
      icon: Circle,
      className: "border-rose-200 bg-rose-50 text-rose-700",
    };

    if (isFullyPaid) {
      statusLabel = "مدفوع بالكامل";
      statusMeta = {
        icon: Check,
        className: "border-emerald-200 bg-emerald-50 text-emerald-700",
      };
    } else if (isPartiallyPaid) {
      statusLabel = "دفع جزئي";
      statusMeta = {
        icon: Circle,
        className: "border-cyan-200 bg-cyan-50 text-cyan-800",
      };
    }

    return {
      cost,
      paid,
      remaining,
      isFullyPaid,
      isPartiallyPaid,
      statusLabel,
      statusMeta,
    };
  };

  const handleDeleteFee = (fee) => {
    if (window.confirm("حذف المطالبة؟")) {
      deleteCoopFeeMutation.mutate(fee.id);
    }
  };

  return (
    <div
      className="
        min-h-full space-y-5 p-4 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal] animate-in fade-in duration-300
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
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-cyan-400/14 blur-3xl" />
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
              <Building2 className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                تكاليف المكتب المنفذ الخارجي
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                إدارة مطالبات أتعاب المكاتب المتعاونة، المدفوع، والمتبقي.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="
                flex items-center gap-2 rounded-2xl
                border border-cyan-300/25 bg-cyan-400/15
                px-4 py-2
              "
            >
              <Banknote className="h-4 w-4 text-cyan-100" />

              <span className="text-[11px] font-black text-white/70">
                إجمالي الأتعاب
              </span>

              <span className="font-mono text-sm font-black text-white">
                {totalFees.toLocaleString()} ر.س
              </span>
            </div>

            <button
              onClick={handleAddCoopFee}
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
              إضافة مطالبة أتعاب مكتب
            </button>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <SummaryCard
          icon={Building2}
          label="عدد المطالبات"
          value={txCoopFees.length}
          tone="blue"
        />

        <SummaryCard
          icon={CreditCard}
          label="إجمالي الأتعاب"
          value={`${totalFees.toLocaleString()} ر.س`}
          tone="cyan"
        />

        <SummaryCard
          icon={Check}
          label="إجمالي المدفوع"
          value={`${totalPaid.toLocaleString()} ر.س`}
          tone="emerald"
        />

        <SummaryCard
          icon={Wallet}
          label="إجمالي المتبقي"
          value={`${totalRemaining.toLocaleString()} ر.س`}
          tone="rose"
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
              <FileText className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black text-[#123f59]">
                مطالبات المكاتب المتعاونة
              </h4>

              <p className="text-[11px] font-bold text-[#64748b]">
                تفاصيل الطلب، الأتعاب، حالة الدفع، والإجراءات.
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
            {txCoopFees.length} مطالبة
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[980px] text-right text-[12px]">
            <thead>
              <tr
                className="
                  border-b border-[#e8ddc8]
                  bg-[#fbf8f1]/80 text-[#123f59]
                "
              >
                <th className="px-4 py-3 font-black">المكتب المتعاون</th>
                <th className="px-4 py-3 font-black">نوع الطلب</th>
                <th className="px-4 py-3 font-black">الأتعاب المستحقة</th>
                <th className="px-4 py-3 font-black">المدفوع</th>
                <th className="px-4 py-3 font-black">المتبقي</th>
                <th className="px-4 py-3 font-black">حالة الدفع</th>
                <th className="px-4 py-3 text-center font-black">
                  إجراءات
                </th>
              </tr>
            </thead>

            <tbody>
              {txCoopFees.length > 0 ? (
                txCoopFees.map((fee, index) => {
                  const {
                    cost,
                    paid,
                    remaining,
                    statusLabel,
                    statusMeta,
                  } = getFeePaymentData(fee);

                  const StatusIcon = statusMeta.icon;

                  return (
                    <tr
                      key={fee.id || index}
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
                              rounded-2xl border border-cyan-200
                              bg-cyan-50 text-cyan-800
                            "
                          >
                            <Building2 className="h-4 w-4" />
                          </span>

                          <div className="min-w-0">
                            <p className="truncate font-black text-[#123f59]">
                              {fee.officeName || "مكتب غير محدد"}
                            </p>

                            <p className="mt-1 text-[10px] font-bold text-[#64748b]">
                              مكتب منفذ / متعاون
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className="
                            inline-flex rounded-xl border border-[#d8b46a]/35
                            bg-[#f8efe0] px-3 py-1.5
                            text-[10px] font-black text-[#123f59]
                          "
                        >
                          {fee.requestType || "—"}
                        </span>
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
                          <ActionButton
                            label="تعديل"
                            tone="cyan"
                            onClick={() => handleOpenCoopFeeEdit(fee)}
                          >
                            <Edit3 className="h-4 w-4" />
                          </ActionButton>

                          <ActionButton
                            label={
                              deleteCoopFeeMutation.isPending
                                ? "حذف..."
                                : "حذف"
                            }
                            tone="rose"
                            disabled={deleteCoopFeeMutation.isPending}
                            onClick={() => handleDeleteFee(fee)}
                          >
                            {deleteCoopFeeMutation.isPending ? (
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
        {txCoopFees.length > 0 ? (
          txCoopFees.map((fee, index) => {
            const {
              cost,
              paid,
              remaining,
              statusLabel,
              statusMeta,
            } = getFeePaymentData(fee);

            const StatusIcon = statusMeta.icon;

            return (
              <div
                key={fee.id || index}
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
                        rounded-2xl border border-cyan-200
                        bg-cyan-50 text-cyan-800
                      "
                    >
                      <Building2 className="h-5 w-5" />
                    </span>

                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-black text-[#123f59]">
                        {fee.officeName || "مكتب غير محدد"}
                      </h4>

                      <p className="mt-1 text-xs font-bold text-[#64748b]">
                        {fee.requestType || "نوع الطلب غير محدد"}
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
                  <ActionButton
                    label="تعديل"
                    tone="cyan"
                    onClick={() => handleOpenCoopFeeEdit(fee)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </ActionButton>

                  <ActionButton
                    label={
                      deleteCoopFeeMutation.isPending ? "حذف..." : "حذف"
                    }
                    tone="rose"
                    disabled={deleteCoopFeeMutation.isPending}
                    onClick={() => handleDeleteFee(fee)}
                  >
                    {deleteCoopFeeMutation.isPending ? (
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
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
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
  tone = "cyan",
  onClick,
  disabled,
}) => {
  const tones = {
    cyan:
      "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
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
        ${tones[tone] || tones.cyan}
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
      لا توجد مطالبات مسجلة للمكاتب
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يمكنك إضافة مطالبة أتعاب مكتب من الزر العلوي.
    </p>
  </div>
);