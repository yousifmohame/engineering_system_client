import React from "react";
import {
  Banknote,
  Plus,
  Trash2,
  User,
  Wallet,
  CreditCard,
  Percent,
  ShieldCheck,
  AlertCircle,
  Clock,
  History,
  Loader2,
  CalendarDays,
  ReceiptText,
  CheckCircle2,
} from "lucide-react";

export const PaymentsTab = ({
  setIsAddPaymentOpen,
  totalFees,
  totalPaid,
  remaining,
  collectionPercent,
  safePayments = [],
  formatDateTime,
  safeNum,
  deletePaymentMutation,
}) => {
  const toNum = (value) => {
    if (typeof safeNum === "function") return safeNum(value);
    return Number(value || 0);
  };

  const renderDate = (date) => {
    if (!date) return "—";
    if (formatDateTime) return formatDateTime(date);
    return new Date(date).toLocaleString("ar-SA");
  };

  const safeCollectionPercent = Math.max(
    0,
    Math.min(100, Number(collectionPercent || 0)),
  );

  const handleDeletePayment = (paymentId) => {
    if (window.confirm("هل تريد حذف هذه الدفعة؟")) {
      deletePaymentMutation.mutate(paymentId);
    }
  };

  return (
    <div
      className="
        min-h-full space-y-5 p-4 pb-10 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal] animate-in fade-in duration-300
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
              <Banknote className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                سجل التحصيلات المالية من العميل
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                متابعة الدفعات المحصلة، المتبقي، نسبة التحصيل، ومرجع كل عملية.
              </p>

              <div
                className="
                  mt-3 inline-flex items-center gap-1.5 rounded-xl
                  border border-white/15 bg-white/10
                  px-3 py-1.5 text-[10px]
                  font-black text-white/85
                "
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#e2bf74]" />
                سجل مالي موثق داخل المعاملة
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddPaymentOpen(true)}
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
            إضافة دفعة تحصيل جديدة
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <SummaryCard
          icon={Wallet}
          label="إجمالي الأتعاب"
          value={`${toNum(totalFees).toLocaleString()} ر.س`}
          tone="blue"
        />

        <SummaryCard
          icon={CheckCircle2}
          label="تم تحصيله"
          value={`${toNum(totalPaid).toLocaleString()} ر.س`}
          tone="emerald"
        />

        <SummaryCard
          icon={CreditCard}
          label="المتبقي"
          value={`${toNum(remaining).toLocaleString()} ر.س`}
          tone={toNum(remaining) > 0 ? "rose" : "emerald"}
        />

        <SummaryCard
          icon={Percent}
          label="نسبة التحصيل"
          value={`${safeCollectionPercent}%`}
          tone="cyan"
        />
      </div>

      {/* Progress */}
      <section
        className="
          overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30 bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            flex flex-col gap-4 border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4 md:flex-row md:items-center md:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
              <ReceiptText className="h-5 w-5" />
            </span>

            <div>
              <h3 className="text-sm font-black text-[#123f59]">
                حالة التحصيل الحالية
              </h3>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                نسبة ما تم تحصيله مقارنة بإجمالي الأتعاب.
              </p>
            </div>
          </div>

          <span
            className="
              w-fit rounded-2xl border border-emerald-200
              bg-emerald-50 px-3 py-1.5
              font-mono text-xs font-black text-emerald-700
            "
          >
            {safeCollectionPercent}%
          </span>
        </div>

        <div className="p-5">
          <div className="h-3 w-full overflow-hidden rounded-full bg-[#e8ddc8]">
            <div
              className="
                h-full rounded-full bg-gradient-to-l
                from-emerald-600 via-emerald-500 to-[#e2bf74]
                transition-all duration-500
              "
              style={{ width: `${safeCollectionPercent}%` }}
            />
          </div>

          <div className="mt-3 flex flex-col gap-2 text-[10px] font-bold text-[#64748b] sm:flex-row sm:items-center sm:justify-between">
            <span>
              المحصل:{" "}
              <strong className="font-black text-emerald-700">
                {toNum(totalPaid).toLocaleString()} ر.س
              </strong>
            </span>

            <span>
              المتبقي:{" "}
              <strong className="font-black text-rose-600">
                {toNum(remaining).toLocaleString()} ر.س
              </strong>
            </span>
          </div>
        </div>
      </section>

      {/* Desktop table */}
      <section
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
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
              <History className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black text-[#123f59]">
                قائمة الدفعات المحصلة
              </h4>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                تفاصيل التاريخ، المبلغ، طريقة الدفع، المرجع، والمُحصّل.
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
            {safePayments.length} دفعة
          </span>
        </div>

        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[900px] text-right text-[12px]">
            <thead>
              <tr
                className="
                  border-b border-[#e8ddc8]
                  bg-[#fbf8f1]/80 text-[#123f59]
                "
              >
                <th className="px-4 py-3 font-black">التاريخ</th>
                <th className="px-4 py-3 font-black">المبلغ</th>
                <th className="px-4 py-3 font-black">طريقة الدفع / المرجع</th>
                <th className="px-4 py-3 font-black">المُحصّل</th>
                <th className="px-4 py-3 text-center font-black">إجراء</th>
              </tr>
            </thead>

            <tbody>
              {safePayments.length > 0 ? (
                safePayments.map((payment, index) => (
                  <PaymentRow
                    key={payment.id || index}
                    payment={payment}
                    renderDate={renderDate}
                    toNum={toNum}
                    onDelete={() => handleDeletePayment(payment.id)}
                    deletePending={deletePaymentMutation.isPending}
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
      <div className="space-y-3 lg:hidden">
        {safePayments.length > 0 ? (
          safePayments.map((payment, index) => (
            <PaymentCard
              key={payment.id || index}
              payment={payment}
              renderDate={renderDate}
              toNum={toNum}
              onDelete={() => handleDeletePayment(payment.id)}
              deletePending={deletePaymentMutation.isPending}
            />
          ))
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

const PaymentRow = ({
  payment,
  renderDate,
  toNum,
  onDelete,
  deletePending,
}) => (
  <tr
    className="
      border-b border-[#e8ddc8]/65
      transition-colors hover:bg-emerald-50/35
    "
  >
    <td className="px-4 py-4">
      <div
        className="
          inline-flex items-center gap-1.5 rounded-xl
          border border-[#e8ddc8] bg-white
          px-2.5 py-1.5
          font-mono text-[10px] font-black text-[#123f59]
          shadow-sm
        "
        dir="ltr"
      >
        <Clock className="h-3.5 w-3.5 text-[#c5983c]" />
        {renderDate(payment.date || payment.createdAt)}
      </div>
    </td>

    <td className="px-4 py-4">
      <span
        className="
          inline-flex rounded-xl border border-emerald-200
          bg-emerald-50 px-3 py-1.5
          font-mono text-sm font-black text-emerald-700
        "
      >
        {toNum(payment.amount).toLocaleString()} ر.س
      </span>
    </td>

    <td className="px-4 py-4">
      <div className="max-w-[320px]">
        <p className="truncate text-xs font-black text-[#123f59]">
          {payment.method || "غير محدد"}
        </p>

        <p className="mt-1 truncate font-mono text-[10px] font-bold text-[#94a3b8]">
          {payment.periodRef || payment.ref || "بدون مرجع"}
        </p>
      </div>
    </td>

    <td className="px-4 py-4">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
          <User className="h-4 w-4" />
        </span>

        <span className="text-[11px] font-black text-[#64748b]">
          {payment.collectedBy || "موظف النظام"}
        </span>
      </div>
    </td>

    <td className="px-4 py-4 text-center">
      <DeleteButton
        onClick={onDelete}
        disabled={deletePending}
        loading={deletePending}
      />
    </td>
  </tr>
);

const PaymentCard = ({
  payment,
  renderDate,
  toNum,
  onDelete,
  deletePending,
}) => (
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
          <Banknote className="h-5 w-5" />
        </span>

        <div className="min-w-0">
          <h4 className="truncate font-mono text-lg font-black text-emerald-700">
            {toNum(payment.amount).toLocaleString()} ر.س
          </h4>

          <p className="mt-1 truncate text-xs font-bold text-[#64748b]">
            {payment.method || "طريقة دفع غير محددة"}
          </p>
        </div>
      </div>

      <DeleteButton
        onClick={onDelete}
        disabled={deletePending}
        loading={deletePending}
      />
    </div>

    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      <InfoBox
        icon={CalendarDays}
        label="تاريخ التحصيل"
        value={renderDate(payment.date || payment.createdAt)}
        dir="ltr"
      />

      <InfoBox
        icon={ReceiptText}
        label="المرجع"
        value={payment.periodRef || payment.ref || "بدون مرجع"}
        dir="ltr"
      />

      <InfoBox
        icon={User}
        label="المُحصّل"
        value={payment.collectedBy || "موظف النظام"}
      />

      <InfoBox
        icon={ShieldCheck}
        label="الحالة"
        value="دفعة محصلة"
      />
    </div>
  </div>
);

const SummaryCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
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

const InfoBox = ({ icon: Icon, label, value, dir = "rtl" }) => (
  <div
    className="
      rounded-2xl border border-[#e8ddc8]
      bg-[#fbf8f1]/70 p-3
    "
  >
    <p className="mb-1 flex items-center gap-1 text-[9px] font-black text-[#94a3b8]">
      <Icon className="h-3 w-3 text-[#c5983c]" />
      {label}
    </p>

    <p
      className="truncate text-xs font-black text-[#123f59]"
      dir={dir}
      title={value}
    >
      {value}
    </p>
  </div>
);

const DeleteButton = ({ onClick, disabled, loading }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="
      grid h-10 w-10 place-items-center
      rounded-xl border border-rose-200
      bg-rose-50 text-rose-600
      transition hover:bg-rose-100
      disabled:cursor-not-allowed disabled:opacity-50
    "
    type="button"
    title="حذف الدفعة"
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
      لا توجد دفعات محصلة حتى الآن
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يمكنك إضافة أول دفعة من زر إضافة دفعة تحصيل جديدة.
    </p>
  </div>
);