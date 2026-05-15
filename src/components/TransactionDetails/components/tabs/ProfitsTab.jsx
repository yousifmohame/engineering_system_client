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
  partnersDistribution,
}) => {
  const totalPartnersAmount = partnersDistribution.reduce(
    (sum, p) => sum + Number(p.finalAmount || 0),
    0,
  );

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
              <PieChart className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">
                توزيع الأرباح النهائي والتصفيات
              </h2>

              <p className="mt-1 text-xs font-bold text-white/55">
                عرض حصة المكتب، المصدر، والشركاء بعد احتساب قواعد التوزيع.
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
                حالة النظام
              </div>

              <div className="text-xs font-black text-white">
                النظام الآلي مُفعل
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Warning */}
      {!isSettlementComplete && (
        <div
          className="
            flex flex-col gap-3 rounded-[24px]
            border border-rose-300/45 bg-rose-50
            p-4 shadow-[0_14px_34px_rgba(244,63,94,0.08)]
            md:flex-row md:items-center md:justify-between
          "
        >
          <div className="flex items-start gap-3">
            <span
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl bg-rose-500 text-white
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
              flex items-center justify-center gap-2 rounded-2xl
              bg-rose-600 px-4 py-2.5
              text-xs font-black text-white
              transition hover:bg-rose-700
            "
            type="button"
          >
            الذهاب للتسوية
            <ArrowLeft className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Summary Cards */}
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
          subtitle={`${sourcePercent}% من المتبقي`}
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

      {/* Distribution Table */}
      <div
        className="
          overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30
          bg-white shadow-[0_18px_45px_rgba(18,63,89,0.10)]
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
              <Scale className="h-4 w-4" />
            </span>
            جدول التوزيع التفصيلي
          </h3>

          <span
            className={`
              flex items-center gap-1.5 rounded-2xl border px-3 py-1.5
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

        <div className="overflow-x-auto custom-scrollbar-slim">
          <table className="w-full min-w-[800px] text-right text-[12px]">
            <thead className="bg-[#0f3448] text-white">
              <tr className="h-[48px]">
                <th className="border-l border-white/10 px-4 font-black">
                  البند / الشريك
                </th>

                <th className="border-l border-white/10 px-4 font-black">
                  النسبة / القاعدة
                </th>

                <th className="px-4 font-black">
                  المستحق
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#e8ddc8]/70">
              {/* Office Share */}
              <tr className="bg-cyan-50/55 transition-colors hover:bg-cyan-50">
                <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="
                        grid h-11 w-11 place-items-center
                        rounded-2xl bg-[#123f59] text-[#e2bf74]
                      "
                    >
                      <Briefcase className="h-5 w-5" />
                    </span>

                    <div>
                      <div className="text-[13px] font-black text-[#123f59]">
                        حصة المكتب
                      </div>

                      <div className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                        اقتطاع آلي حسب الشريحة
                      </div>
                    </div>
                  </div>
                </td>

                <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                  <span
                    className="
                      rounded-xl border border-cyan-200
                      bg-white px-3 py-1.5
                      font-mono text-[11px] font-black text-cyan-700
                    "
                  >
                    {officeShareLabel}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <AmountText value={officeShareAmount} tone="blue" />
                </td>
              </tr>

              {/* Source Share */}
              <tr className="bg-purple-50/45 transition-colors hover:bg-purple-50">
                <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="
                        grid h-11 w-11 place-items-center
                        rounded-2xl bg-purple-100 text-purple-700
                      "
                    >
                      <Crown className="h-5 w-5" />
                    </span>

                    <div>
                      <div className="text-[13px] font-black text-purple-900">
                        المصدر: {safeText(tx.sourceName || tx.source)}
                      </div>

                      <div className="mt-0.5 text-[10px] font-bold text-purple-700/70">
                        حصة المصدر من المتبقي
                      </div>
                    </div>
                  </div>
                </td>

                <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                  <span
                    className="
                      rounded-xl border border-purple-200
                      bg-white px-3 py-1.5
                      font-mono text-[11px] font-black text-purple-700
                    "
                  >
                    {sourcePercent}%
                  </span>
                </td>

                <td className="px-4 py-4">
                  <AmountText value={sourceShare} tone="purple" />
                </td>
              </tr>

              {/* Partners */}
              {partnersDistribution.length > 0 ? (
                partnersDistribution.map((p, idx) => (
                  <tr
                    key={p.id || idx}
                    className={`
                      transition-colors hover:bg-emerald-50/40
                      ${idx % 2 === 0 ? "bg-white" : "bg-[#fbf8f1]/55"}
                    `}
                  >
                    <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="
                            grid h-10 w-10 place-items-center
                            rounded-2xl bg-emerald-50 text-emerald-700
                            border border-emerald-200
                          "
                        >
                          <Users className="h-4 w-4" />
                        </span>

                        <div>
                          <div className="text-[12px] font-black text-[#123f59]">
                            {p.name}
                          </div>

                          <div className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                            شريك في التوزيع
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="border-l border-[#e8ddc8]/70 px-4 py-4">
                      <span
                        className="
                          rounded-xl border border-emerald-200
                          bg-emerald-50 px-3 py-1.5
                          font-mono text-[11px] font-black text-emerald-700
                        "
                      >
                        {p.percent}%
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <AmountText value={p.finalAmount} tone="emerald" />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="py-14 text-center">
                    <div
                      className="
                        mx-auto mb-3 grid h-16 w-16 place-items-center
                        rounded-3xl border border-[#d8b46a]/35
                        bg-[#f8efe0] text-[#c5983c]
                      "
                    >
                      <Users className="h-8 w-8" />
                    </div>

                    <p className="text-sm font-black text-[#123f59]">
                      لا توجد بيانات توزيع للشركاء
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[#64748b]">
                      ستظهر هنا حصة كل شريك بعد إعداد نسب التوزيع.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ProfitSummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = "blue",
}) => {
  const tones = {
    blue: {
      card: "border-[#d8b46a]/30 bg-white",
      icon: "bg-[#123f59] text-[#e2bf74]",
      title: "text-[#64748b]",
      value: "text-[#123f59]",
    },
    purple: {
      card: "border-purple-300/45 bg-purple-50/70",
      icon: "bg-purple-600 text-white",
      title: "text-purple-700",
      value: "text-purple-900",
    },
    emerald: {
      card: "border-emerald-300/45 bg-emerald-50/70",
      icon: "bg-emerald-600 text-white",
      title: "text-emerald-700",
      value: "text-emerald-900",
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
        <div>
          <div className={`text-[11px] font-black ${t.title}`}>{title}</div>
          <div className="mt-0.5 text-[10px] font-bold text-[#64748b]">
            {subtitle}
          </div>
        </div>

        <span className={`grid h-11 w-11 place-items-center rounded-2xl ${t.icon}`}>
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

const AmountText = ({ value, tone = "blue" }) => {
  const colors = {
    blue: "text-[#123f59]",
    purple: "text-purple-800",
    emerald: "text-emerald-700",
  };

  return (
    <div className={`font-mono text-[14px] font-black ${colors[tone]}`}>
      {Number(value || 0).toLocaleString()}
      <span className="mr-1 text-[10px] text-[#64748b]">ر.س</span>
    </div>
  );
};