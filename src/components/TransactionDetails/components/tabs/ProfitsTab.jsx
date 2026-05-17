import React from "react";
import {
  Check,
  TriangleAlert,
  Briefcase,
  Crown,
  PieChart,
  Scale,
  Users,
  ShieldCheck,
  ArrowLeft,
  AlertCircle,
  Wallet,
  Percent,
  Landmark,
  Sparkles,
} from "lucide-react";

export const ProfitsTab = ({
  isSettlementComplete,
  setActiveTab,
  officeShareLabel,
  officeShareAmount,
  safeText,
  tx,
  sourcePercent,
  sourceShare,
  partnersDistribution = [],
}) => {
  const totalPartnersAmount = partnersDistribution.reduce(
    (sum, partner) => sum + Number(partner.finalAmount || 0),
    0,
  );

  const safeLabel = (value) => {
    if (typeof safeText === "function") return safeText(value);
    return value || "—";
  };

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
              <PieChart className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                توزيع الأرباح النهائي والتصفيات
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                عرض حصة المكتب، المصدر، والشركاء بعد احتساب قواعد التوزيع.
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
                النتائج مرتبطة بحالة التسوية النهائية
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[360px]">
            <HeaderMetric
              icon={ShieldCheck}
              label="حالة النظام"
              value="مُفعل"
              tone="gold"
            />

            <HeaderMetric
              icon={Users}
              label="عدد الشركاء"
              value={partnersDistribution.length}
              tone="emerald"
            />
          </div>
        </div>
      </div>

      {/* Warning */}
      {!isSettlementComplete && (
        <div
          className="
            flex flex-col gap-3 rounded-[26px]
            border border-rose-300/45 bg-rose-50
            p-4 shadow-[0_14px_34px_rgba(244,63,94,0.08)]
            md:flex-row md:items-center md:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl bg-rose-600 text-white
                shadow-[0_12px_24px_rgba(225,29,72,0.20)]
              "
            >
              <TriangleAlert className="h-5 w-5" />
            </span>

            <div>
              <div className="text-sm font-black text-rose-700">
                التسوية غير مكتملة
              </div>

              <div className="mt-1 text-xs font-bold leading-relaxed text-rose-700/75">
                لا يمكن توزيع الأرباح فعلياً قبل إتمام تسوية جميع التكاليف
                التشغيلية. الأرقام أدناه استرشادية فقط.
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab("settlement")}
            className="
              flex h-11 items-center justify-center gap-2 rounded-2xl
              bg-rose-600 px-5 text-xs font-black text-white
              shadow-[0_12px_26px_rgba(225,29,72,0.18)]
              transition hover:-translate-y-[1px] hover:bg-rose-700
            "
            type="button"
          >
            الذهاب للتسوية
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ProfitSummaryCard
          title="حصة المكتب"
          value={officeShareAmount}
          subtitle={officeShareLabel}
          icon={Briefcase}
          tone="blue"
        />

        <ProfitSummaryCard
          title="حصة المصدر"
          value={sourceShare}
          subtitle={`${sourcePercent || 0}% من المتبقي`}
          icon={Crown}
          tone="purple"
        />

        <ProfitSummaryCard
          title="إجمالي أرباح الشركاء"
          value={totalPartnersAmount}
          subtitle={`${partnersDistribution.length} شريك`}
          icon={Users}
          tone="emerald"
        />
      </div>

      {/* Distribution table desktop */}
      <section
        className="
          hidden overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl lg:block
        "
      >
        <SectionHeader
          isSettlementComplete={isSettlementComplete}
          title="جدول التوزيع التفصيلي"
          subtitle="تفصيل الحصص حسب المكتب، المصدر، والشركاء."
        />

        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[860px] text-right text-[12px]">
            <thead>
              <tr
                className="
                  h-[50px] border-b border-[#e8ddc8]
                  bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                  text-white
                "
              >
                <th className="border-l border-white/10 px-4 font-black">
                  البند / الشريك
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  النسبة / القاعدة
                </th>

                <th className="px-4 font-black">المستحق</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/70">
              <DistributionRow
                icon={Briefcase}
                title="حصة المكتب"
                subtitle="اقتطاع آلي حسب الشريحة"
                rule={officeShareLabel}
                amount={officeShareAmount}
                tone="blue"
              />

              <DistributionRow
                icon={Crown}
                title={`المصدر: ${safeLabel(tx?.sourceName || tx?.source)}`}
                subtitle="حصة المصدر من المتبقي"
                rule={`${sourcePercent || 0}%`}
                amount={sourceShare}
                tone="purple"
              />

              {partnersDistribution.length > 0 ? (
                partnersDistribution.map((partner, index) => (
                  <DistributionRow
                    key={partner.id || index}
                    icon={Users}
                    title={partner.name}
                    subtitle="شريك في التوزيع"
                    rule={`${partner.percent || 0}%`}
                    amount={partner.finalAmount}
                    tone="emerald"
                    striped={index % 2 !== 0}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="3">
                    <EmptyPartners />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Mobile cards */}
      <div className="space-y-3 lg:hidden">
        <MobileDistributionCard
          icon={Briefcase}
          title="حصة المكتب"
          subtitle="اقتطاع آلي حسب الشريحة"
          rule={officeShareLabel}
          amount={officeShareAmount}
          tone="blue"
        />

        <MobileDistributionCard
          icon={Crown}
          title={`المصدر: ${safeLabel(tx?.sourceName || tx?.source)}`}
          subtitle="حصة المصدر من المتبقي"
          rule={`${sourcePercent || 0}%`}
          amount={sourceShare}
          tone="purple"
        />

        {partnersDistribution.length > 0 ? (
          partnersDistribution.map((partner, index) => (
            <MobileDistributionCard
              key={partner.id || index}
              icon={Users}
              title={partner.name}
              subtitle="شريك في التوزيع"
              rule={`${partner.percent || 0}%`}
              amount={partner.finalAmount}
              tone="emerald"
            />
          ))
        ) : (
          <EmptyPartners />
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, isSettlementComplete }) => (
  <div
    className="
      flex flex-col gap-3 border-b border-[#e8ddc8]
      bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
      px-5 py-4 sm:flex-row sm:items-center sm:justify-between
    "
  >
    <div className="flex items-center gap-3">
      <span
        className="
          grid h-10 w-10 place-items-center rounded-2xl
          bg-[#123f59] text-[#e2bf74]
        "
      >
        <Scale className="h-5 w-5" />
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

    <span
      className={`
        flex w-fit items-center gap-1.5 rounded-2xl border px-3 py-1.5
        text-[10px] font-black
        ${
          isSettlementComplete
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-rose-200 bg-rose-50 text-rose-700"
        }
      `}
    >
      {isSettlementComplete ? (
        <>
          <Check className="h-3.5 w-3.5" />
          التسوية مكتملة
        </>
      ) : (
        <>
          <TriangleAlert className="h-3.5 w-3.5" />
          أرقام استرشادية
        </>
      )}
    </span>
  </div>
);

const ProfitSummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
}) => {
  const tones = {
    blue: {
      card: "border-[#d8b46a]/30 bg-white/90",
      icon: "bg-[#123f59] text-[#e2bf74]",
      title: "text-[#64748b]",
      value: "text-[#123f59]",
    },
    purple: {
      card: "border-purple-300/45 bg-purple-50/75",
      icon: "bg-purple-600 text-white",
      title: "text-purple-700",
      value: "text-purple-900",
    },
    emerald: {
      card: "border-emerald-300/45 bg-emerald-50/75",
      icon: "bg-emerald-600 text-white",
      title: "text-emerald-700",
      value: "text-emerald-900",
    },
  };

  const style = tones[tone] || tones.blue;

  return (
    <div
      className={`
        rounded-[26px] border p-4
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        backdrop-blur-xl ${style.card}
      `}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className={`truncate text-[11px] font-black ${style.title}`}>
            {title}
          </div>

          <div className="mt-0.5 truncate text-[10px] font-bold text-[#64748b]">
            {subtitle}
          </div>
        </div>

        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style.icon}`}
        >
          <Icon className="h-5 w-5" />
        </span>
      </div>

      <AmountText value={value} tone={tone} size="lg" />
    </div>
  );
};

const DistributionRow = ({
  icon: Icon,
  title,
  subtitle,
  rule,
  amount,
  tone = "blue",
  striped = false,
}) => {
  const style = getTone(tone);

  return (
    <tr
      className={`
        transition-colors hover:bg-[#fbf8f1]/70
        ${striped ? "bg-[#fbf8f1]/45" : "bg-white"}
      `}
    >
      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <div className="flex items-center gap-3">
          <span
            className={`
              grid h-11 w-11 shrink-0 place-items-center
              rounded-2xl border ${style.icon}
            `}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <div className={`truncate text-[13px] font-black ${style.title}`}>
              {title}
            </div>

            <div className="mt-0.5 text-[10px] font-bold text-[#64748b]">
              {subtitle}
            </div>
          </div>
        </div>
      </td>

      <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
        <span
          className={`
            rounded-xl border px-3 py-1.5
            font-mono text-[11px] font-black ${style.badge}
          `}
        >
          {rule}
        </span>
      </td>

      <td className="px-4 py-4">
        <AmountText value={amount} tone={tone} />
      </td>
    </tr>
  );
};

const MobileDistributionCard = ({
  icon: Icon,
  title,
  subtitle,
  rule,
  amount,
  tone = "blue",
}) => {
  const style = getTone(tone);

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
            className={`
              grid h-11 w-11 shrink-0 place-items-center
              rounded-2xl border ${style.icon}
            `}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h4 className={`truncate text-sm font-black ${style.title}`}>
              {title}
            </h4>

            <p className="mt-1 text-xs font-bold text-[#64748b]">
              {subtitle}
            </p>
          </div>
        </div>

        <span
          className={`
            shrink-0 rounded-xl border px-2.5 py-1
            font-mono text-[10px] font-black ${style.badge}
          `}
        >
          {rule}
        </span>
      </div>

      <div
        className="
          rounded-2xl border border-[#e8ddc8]
          bg-[#fbf8f1]/70 p-3
        "
      >
        <p className="mb-1 flex items-center gap-1 text-[9px] font-black text-[#94a3b8]">
          <Wallet className="h-3 w-3 text-[#c5983c]" />
          المستحق
        </p>

        <AmountText value={amount} tone={tone} />
      </div>
    </div>
  );
};

const AmountText = ({ value, tone = "blue", size = "md" }) => {
  const colors = {
    blue: "text-[#123f59]",
    purple: "text-purple-800",
    emerald: "text-emerald-700",
  };

  const sizes = {
    md: "text-[14px]",
    lg: "text-2xl",
  };

  return (
    <div
      className={`
        font-mono font-black
        ${sizes[size] || sizes.md}
        ${colors[tone] || colors.blue}
      `}
    >
      {Number(value || 0).toLocaleString()}
      <span className="mr-1 text-[10px] font-black text-[#64748b]">
        ر.س
      </span>
    </div>
  );
};

const HeaderMetric = ({ icon: Icon, label, value, tone = "gold" }) => {
  const tones = {
    gold: "border-[#e2bf74]/25 bg-[#e2bf74]/15 text-[#e2bf74]",
    emerald: "border-emerald-300/20 bg-emerald-400/15 text-emerald-100",
  };

  return (
    <div
      className={`
        rounded-2xl border px-3 py-3 backdrop-blur-md
        ${tones[tone] || tones.gold}
      `}
    >
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10">
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <div className="truncate text-[9px] font-black text-white/60">
            {label}
          </div>

          <div className="truncate text-xs font-black text-white">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyPartners = () => (
  <div
    className="
      flex min-h-[240px] flex-col items-center justify-center
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
      لا توجد بيانات توزيع للشركاء
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      ستظهر هنا حصة كل شريك بعد إعداد نسب التوزيع.
    </p>
  </div>
);

const getTone = (tone) => {
  const tones = {
    blue: {
      icon: "border-[#d8b46a]/30 bg-[#123f59] text-[#e2bf74]",
      title: "text-[#123f59]",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-800",
    },
    purple: {
      icon: "border-purple-200 bg-purple-50 text-purple-700",
      title: "text-purple-900",
      badge: "border-purple-200 bg-purple-50 text-purple-700",
    },
    emerald: {
      icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
      title: "text-[#123f59]",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
  };

  return tones[tone] || tones.blue;
};