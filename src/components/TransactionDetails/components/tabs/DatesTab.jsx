import React from "react";
import { toast } from "sonner";
import {
  Save,
  Loader2,
  TriangleAlert,
  CalendarDays,
  Timer,
  Archive,
  User,
  Info,
  History,
  Clock,
  Wallet,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  AlertCircle,
  CalendarClock,
  Banknote,
} from "lucide-react";

export const DatesTab = ({
  remaining,
  safeCollectionDates = [],
  safeNum,
  dateForm,
  setDateForm,
  addDateMutation,
  calculateDays,
  getDayNameAndDate,
  formatDateTime,
  deleteDateMutation,
}) => {
  const scheduledTotal = safeCollectionDates.reduce(
    (acc, curr) => acc + safeNum(curr.amount),
    0,
  );

  const unscheduledAmount = Math.max(0, remaining - scheduledTotal);

  const fullAmountValue = Math.max(0, remaining - scheduledTotal);

  const handleSubmitDate = () => {
    if (dateForm.type === "specific_date" && !dateForm.date) {
      return toast.error("يرجى تحديد التاريخ");
    }

    if (
      dateForm.amountType === "partial" &&
      (!dateForm.amount || Number(dateForm.amount) <= 0)
    ) {
      return toast.error("يرجى إدخال مبلغ صحيح");
    }

    addDateMutation.mutate(dateForm);
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
              <CalendarClock className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                خطة ومواعيد التحصيل
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                جدولة دفعات التحصيل، متابعة المبالغ غير المجدولة، والتنبيه عند الاستحقاق أو التأخير.
              </p>
            </div>
          </div>

          <div
            className="
              flex w-fit items-center gap-2 rounded-2xl
              border border-[#e2bf74]/25 bg-[#e2bf74]/15
              px-4 py-2 text-xs font-black text-[#f8efe0]
            "
          >
            <ShieldCheck className="h-4 w-4 text-[#e2bf74]" />
            خطة تحصيل نشطة
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SummaryCard
          icon={Wallet}
          label="المتبقي الكلي للتحصيل"
          value={`${remaining.toLocaleString()} ر.س`}
          tone="blue"
        />

        <SummaryCard
          icon={CreditCard}
          label="إجمالي المبالغ المجدولة"
          value={`${scheduledTotal.toLocaleString()} ر.س`}
          tone="purple"
        />

        <SummaryCard
          icon={TriangleAlert}
          label="مبالغ غير مجدولة"
          value={`${unscheduledAmount.toLocaleString()} ر.س`}
          tone={unscheduledAmount > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Add date form */}
      <section
        className="
          overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30 bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        <SectionHeader
          icon={CalendarDays}
          title="إدراج موعد تحصيل جديد في الخطة"
          subtitle="حدد نوع الاستحقاق، التاريخ، المبلغ المستهدف، وتعليمات المتابعة."
        />

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Date type */}
            <div
              className="
                rounded-[24px] border border-[#d8b46a]/25
                bg-[#fbf8f1]/75 p-4
              "
            >
              <label className="mb-3 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
                <CalendarDays className="h-4 w-4 text-[#c5983c]" />
                طريقة تحديد تاريخ الاستحقاق
                <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#e8ddc8] bg-white p-1.5 sm:grid-cols-2">
                <ChoiceButton
                  active={dateForm.type === "specific_date"}
                  label="تاريخ تقويمي محدد"
                  icon={CalendarDays}
                  onClick={() =>
                    setDateForm({
                      ...dateForm,
                      type: "specific_date",
                    })
                  }
                />

                <ChoiceButton
                  active={dateForm.type === "upon_approval"}
                  label="يُستحق فور الاعتماد"
                  icon={Timer}
                  onClick={() =>
                    setDateForm({
                      ...dateForm,
                      type: "upon_approval",
                    })
                  }
                />
              </div>

              <div
                className="
                  mt-3 flex items-start gap-2 rounded-2xl
                  border border-cyan-200 bg-cyan-50/75
                  p-3 text-[10px] font-bold leading-5 text-cyan-900
                "
              >
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-700" />

                <span>
                  {dateForm.type === "specific_date"
                    ? "سيتم تنبيهك عند اقتراب التاريخ المحدد أو عند تأخر الموعد."
                    : "سيظل الموعد معلقاً، ويبدأ عداد التأخير تلقائياً بمجرد تحويل حالة المعاملة إلى تم الاعتماد."}
                </span>
              </div>
            </div>

            {/* Date field / approval info */}
            <div
              className="
                flex flex-col justify-center rounded-[24px]
                border border-[#d8b46a]/25 bg-white p-4
              "
            >
              {dateForm.type === "specific_date" ? (
                <FormField label="التاريخ المتوقع للسداد" icon={CalendarDays} required>
                  <input
                    type="date"
                    value={dateForm.date}
                    onChange={(e) =>
                      setDateForm({
                        ...dateForm,
                        date: e.target.value,
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </FormField>
              ) : (
                <div
                  className="
                    flex items-start gap-3 rounded-[24px]
                    border border-amber-200 bg-amber-50
                    p-4 text-amber-800
                  "
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-amber-600">
                    <Timer className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-black">
                      العداد متوقف حالياً
                    </p>

                    <p className="text-xs font-bold leading-6 opacity-85">
                      سيتم ربط هذا الموعد برقم وتاريخ قرار الاعتماد فور صدوره من الجهات المعنية.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount and notes */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <FormField label="المبلغ المستهدف" icon={Banknote} required>
              <div className="flex gap-2">
                <select
                  value={dateForm.amountType}
                  onChange={(e) => {
                    const val = e.target.value;

                    setDateForm({
                      ...dateForm,
                      amountType: val,
                      amount: val === "full" ? fullAmountValue : "",
                    });
                  }}
                  className="
                    h-12 w-24 rounded-2xl border border-[#d8b46a]/25
                    bg-[#fbf8f1] px-2 text-xs font-black text-[#123f59]
                    outline-none transition-all
                    focus:border-[#c5983c]/70
                    focus:ring-4 focus:ring-[#c5983c]/10
                  "
                >
                  <option value="full">الباقي</option>
                  <option value="partial">مخصص</option>
                </select>

                <div className="relative flex-1">
                  <input
                    type="number"
                    disabled={dateForm.amountType === "full"}
                    value={
                      dateForm.amountType === "full"
                        ? fullAmountValue
                        : dateForm.amount
                    }
                    onChange={(e) =>
                      setDateForm({
                        ...dateForm,
                        amount: e.target.value,
                      })
                    }
                    className={`
                      ${INPUT_CLASS}
                      pl-12 font-mono text-lg font-black
                      disabled:bg-[#f1f5f9] disabled:text-[#64748b]
                    `}
                    placeholder="0"
                  />

                  <span
                    className="
                      absolute left-3 top-1/2 -translate-y-1/2
                      text-[10px] font-black text-[#94a3b8]
                    "
                  >
                    SAR
                  </span>
                </div>
              </div>
            </FormField>

            <div className="lg:col-span-2">
              <FormField label="البيان / توجيهات المتابعة" icon={Info}>
                <input
                  type="text"
                  value={dateForm.notes}
                  onChange={(e) =>
                    setDateForm({
                      ...dateForm,
                      notes: e.target.value,
                    })
                  }
                  className={INPUT_CLASS}
                  placeholder="مثال: الدفعة الثانية بعد الرفع المساحي، التواصل مع وكيل المالك..."
                />
              </FormField>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#64748b]">
              <ShieldCheck className="h-4 w-4 text-[#c5983c]" />
              سيتم اعتماد الموعد ضمن خطة التحصيل الزمنية.
            </div>

            <button
              onClick={handleSubmitDate}
              disabled={addDateMutation.isPending || remaining <= 0}
              className="
                flex h-11 items-center justify-center gap-2
                rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                px-8 text-xs font-black text-white
                shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                transition hover:-translate-y-[1px]
                disabled:cursor-not-allowed disabled:opacity-50
              "
              type="button"
            >
              {addDateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
              ) : (
                <Save className="h-4 w-4 text-[#e2bf74]" />
              )}
              اعتماد الموعد في الخطة
            </button>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section
        className="
          overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30 bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        <SectionHeader
          icon={History}
          title="السجل الزمني لخطة التحصيل"
          subtitle="متابعة المواعيد المجدولة، حالة الاستحقاق، والتأخير."
          count={`${safeCollectionDates.length} موعد`}
        />

        <div className="space-y-3 p-5">
          {safeCollectionDates.length > 0 ? (
            safeCollectionDates.map((item, index) => {
              const status = getCollectionStatus({
                item,
                calculateDays,
              });

              return (
                <TimelineCard
                  key={item.id || index}
                  item={item}
                  status={status}
                  safeNum={safeNum}
                  getDayNameAndDate={getDayNameAndDate}
                  formatDateTime={formatDateTime}
                  deleteDateMutation={deleteDateMutation}
                />
              );
            })
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </div>
  );
};

const getCollectionStatus = ({ item, calculateDays }) => {
  const days = calculateDays(item.date, item.type === "upon_approval");

  if (item.type === "specific_date") {
    if (days < 0) {
      return {
        icon: TriangleAlert,
        label: `متأخر ${Math.abs(days)} يوم`,
        cardClass: "border-rose-200 bg-rose-50/70",
        badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
        accentClass: "bg-rose-500",
      };
    }

    if (days === 0) {
      return {
        icon: Timer,
        label: "يستحق اليوم",
        cardClass: "border-amber-200 bg-amber-50/70",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        accentClass: "bg-amber-500",
      };
    }

    return {
      icon: CalendarDays,
      label: `متبقي ${days} يوم`,
      cardClass: "border-blue-200 bg-blue-50/45",
      badgeClass: "border-blue-200 bg-blue-50 text-blue-700",
      accentClass: "bg-blue-500",
    };
  }

  if (item.type === "upon_approval") {
    if (days !== null) {
      return {
        icon: TriangleAlert,
        label: `متأخر! مر ${days} يوم على الاعتماد`,
        cardClass: "border-rose-200 bg-rose-50/70",
        badgeClass: "border-rose-200 bg-rose-50 text-rose-700",
        accentClass: "bg-rose-500",
      };
    }

    return {
      icon: Archive,
      label: "معلق بانتظار الاعتماد",
      cardClass: "border-slate-200 bg-slate-50 border-dashed",
      badgeClass: "border-slate-200 bg-slate-100 text-slate-600",
      accentClass: "bg-slate-400",
    };
  }

  return {
    icon: Clock,
    label: "بانتظار الإجراء",
    cardClass: "border-[#d8b46a]/30 bg-white",
    badgeClass: "border-[#d8b46a]/30 bg-[#fbf8f1] text-[#64748b]",
    accentClass: "bg-[#c5983c]",
  };
};

const TimelineCard = ({
  item,
  status,
  safeNum,
  getDayNameAndDate,
  formatDateTime,
  deleteDateMutation,
}) => {
  const StatusIcon = status.icon;

  return (
    <div
      className={`
        group relative overflow-hidden rounded-[26px] border
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        transition-all hover:-translate-y-[1px]
        hover:shadow-[0_18px_42px_rgba(18,63,89,0.12)]
        ${status.cardClass}
      `}
    >
      <div className={`absolute right-0 top-0 h-full w-1.5 ${status.accentClass}`} />

      <div className="flex flex-col lg:flex-row">
        <div className="min-w-0 flex-1 p-5 pr-7">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span
              className={`
                inline-flex items-center gap-1.5 rounded-xl border
                px-2.5 py-1 text-[10px] font-black
                ${status.badgeClass}
              `}
            >
              <StatusIcon className="h-3.5 w-3.5" />
              {status.label}
            </span>

            <span
              className="
                inline-flex items-center gap-1.5 rounded-xl
                border border-[#e8ddc8] bg-white
                px-2.5 py-1 font-mono text-[10px]
                font-black text-[#64748b]
              "
              dir="ltr"
            >
              <CalendarDays className="h-3.5 w-3.5 text-[#c5983c]" />
              {item.type === "upon_approval"
                ? "الاستحقاق: شرطي عند الاعتماد"
                : getDayNameAndDate(item.date)}
            </span>
          </div>

          <h4 className="text-sm font-black leading-7 text-[#123f59]">
            {item.notes || "متابعة تحصيل دفعة من العميل"}
          </h4>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-[10px] font-bold text-[#64748b]">
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-[#c5983c]" />
              أُضيف بواسطة:
              <strong className="text-[#123f59]">
                {item.addedBy || "النظام"}
              </strong>
            </span>

            {item.createdAt && (
              <span className="flex items-center gap-1" dir="ltr">
                <Clock className="h-3.5 w-3.5 text-[#c5983c]" />
                {formatDateTime
                  ? formatDateTime(item.createdAt)
                  : new Date(item.createdAt).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div
          className="
            flex min-w-[220px] flex-col justify-center
            border-t border-[#e8ddc8] bg-white/70 p-5
            lg:border-r lg:border-t-0
          "
        >
          <span className="mb-1 text-[11px] font-black text-[#64748b]">
            المبلغ المطلوب
          </span>

          <div className="font-mono text-3xl font-black tracking-tight text-[#123f59]">
            {safeNum(item.amount).toLocaleString()}
            <span className="mr-1 text-[12px] font-bold text-[#64748b]">
              ر.س
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();

              if (window.confirm("حذف الموعد نهائياً؟")) {
                deleteDateMutation.mutate(item.id);
              }
            }}
            disabled={deleteDateMutation.isPending}
            className="
              mt-4 flex w-fit items-center gap-1.5
              rounded-xl border border-rose-200
              bg-rose-50 px-3 py-1.5
              text-[10px] font-black text-rose-600
              transition hover:bg-rose-100
              disabled:cursor-not-allowed disabled:opacity-50
            "
            type="button"
          >
            {deleteDateMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            حذف الموعد
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, tone = "blue" }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
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

const SectionHeader = ({ icon: Icon, title, subtitle, count }) => (
  <div
    className="
      flex flex-col gap-3 border-b border-[#e8ddc8]
      bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
      px-5 py-4 sm:flex-row sm:items-center sm:justify-between
    "
  >
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <h3 className="text-sm font-black text-[#123f59]">
          {title}
        </h3>

        <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
          {subtitle}
        </p>
      </div>
    </div>

    {count && (
      <span
        className="
          w-fit rounded-2xl border border-[#d8b46a]/30
          bg-[#f8efe0] px-3 py-1.5
          text-xs font-black text-[#9a6b16]
        "
      >
        {count}
      </span>
    )}
  </div>
);

const ChoiceButton = ({ active, label, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex h-10 items-center justify-center gap-2 rounded-xl
      text-xs font-black transition-all
      ${
        active
          ? "bg-[#123f59] text-white shadow-sm"
          : "text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"
      }
    `}
    type="button"
  >
    <Icon className={`h-4 w-4 ${active ? "text-[#e2bf74]" : "text-[#c5983c]"}`} />
    {label}
  </button>
);

const FormField = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />}
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>

    {children}
  </div>
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
      لا توجد خطط أو مواعيد تحصيل مسجلة
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      قم بإضافة المواعيد بالأعلى لتفعيل العدادات الآلية.
    </p>

    <div
      className="
        mt-4 inline-flex items-center gap-1.5 rounded-xl
        border border-emerald-200 bg-emerald-50
        px-3 py-1.5 text-[10px] font-black text-emerald-700
      "
    >
      <CheckCircle2 className="h-3.5 w-3.5" />
      جاهز لإضافة أول موعد
    </div>
  </div>
);

const INPUT_CLASS = `
  h-12 w-full rounded-2xl
  border border-[#d8b46a]/25 bg-white
  px-4 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;