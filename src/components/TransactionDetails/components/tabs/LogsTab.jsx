import React from "react";
import {
  User,
  Activity,
  Clock,
  History,
  ShieldCheck,
  FileText,
  AlertCircle,
  ScrollText,
  Database,
  Sparkles,
} from "lucide-react";

export const LogsTab = ({
  systemLogs = [],
  safeAuthorityHistory = [],
  formatDateTime,
}) => {
  const renderDate = (date) => {
    if (!date) return "—";

    if (formatDateTime) {
      return formatDateTime(date);
    }

    return new Date(date).toLocaleString();
  };

  const logsToDisplay =
    systemLogs.length > 0
      ? systemLogs.map((log) => ({
          type: log.type || "حركة نظام",
          action: log.action || "تحديث بيانات",
          details: log.details || "تم تسجيل حركة على هذه المعاملة.",
          date: log.date,
          user: log.user || "مدير النظام",
          source: "system",
        }))
      : safeAuthorityHistory.length > 0
        ? safeAuthorityHistory.map((note) => ({
            type: "ملاحظة جهة",
            action: "إضافة توجيه من منصة",
            details:
              note.text || note.note || "تم تسجيل ملاحظة مرتبطة بالمعاملة.",
            date: note.date,
            user: note.addedBy || "موظف النظام",
            source: "authority",
          }))
        : [];

  const systemCount = logsToDisplay.filter((log) => log.source === "system").length;
  const authorityCount = logsToDisplay.filter(
    (log) => log.source === "authority",
  ).length;

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
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
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
              <Activity className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h3 className="truncate text-lg font-black md:text-xl">
                سجل أحداث النظام
              </h3>

              <p className="mt-1 text-xs font-bold text-white/65">
                تتبع زمني دقيق لكل حركة تمت على هذه المعاملة منذ إنشائها.
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
                سجل قراءة فقط لتوثيق العمليات
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[420px]">
            <HeaderMetric
              icon={History}
              label="عدد الحركات"
              value={logsToDisplay.length}
              tone="gold"
            />

            <HeaderMetric
              icon={Database}
              label="النظام"
              value={systemCount}
              tone="cyan"
            />

            <HeaderMetric
              icon={FileText}
              label="ملاحظات جهة"
              value={authorityCount}
              tone="emerald"
            />
          </div>
        </div>
      </div>

      {/* Timeline container */}
      <section
        className="
          overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
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
              <Clock className="h-5 w-5" />
            </span>

            <div>
              <h4 className="text-sm font-black text-[#123f59]">
                التسلسل الزمني للمعاملة
              </h4>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                عرض مرتب للحركات من الأحدث إلى الأقدم.
              </p>
            </div>
          </div>

          <span
            className="
              w-fit rounded-2xl border border-[#d8b46a]/25
              bg-[#f8efe0] px-3 py-1.5
              text-[10px] font-black text-[#9a6b16]
            "
          >
            سجل النظام
          </span>
        </div>

        <div
          className="
            custom-scrollbar-slim max-h-[680px] overflow-y-auto
            bg-gradient-to-br from-[#eef7f6]/60 via-[#fbf8f1]/60 to-white
            p-5
          "
        >
          {logsToDisplay.length > 0 ? (
            <div className="relative mr-4 space-y-6 border-r-2 border-[#d8b46a]/35 pr-7">
              {logsToDisplay.map((log, index) => (
                <TimelineItem
                  key={`${log.source}-${index}`}
                  log={log}
                  renderDate={renderDate}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>
      </section>
    </div>
  );
};

const TimelineItem = ({ log, renderDate }) => {
  const isSystem = log.source === "system";
  const tone = isSystem ? "system" : "authority";
  const toneClass = getToneClass(tone);

  const MainIcon = isSystem ? Activity : FileText;

  return (
    <div className="relative">
      {/* Timeline point */}
      <div
        className={`
          absolute -right-[39px] top-5 grid h-7 w-7
          place-items-center rounded-full border-4 bg-white
          shadow-sm ${toneClass.pointBorder}
        `}
      >
        <span className={`h-2.5 w-2.5 rounded-full ${toneClass.point}`} />
      </div>

      <div
        className="
          group overflow-hidden rounded-[26px]
          border border-[#d8b46a]/30 bg-white
          shadow-sm transition-all
          hover:-translate-y-[1px]
          hover:shadow-[0_16px_38px_rgba(18,63,89,0.12)]
        "
      >
        {/* Card header */}
        <div
          className="
            flex flex-col gap-4 border-b border-[#e8ddc8]
            bg-[#fbf8f1]/65 px-5 py-4
            lg:flex-row lg:items-start lg:justify-between
          "
        >
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl border shadow-sm
                ${toneClass.icon}
              `}
            >
              <MainIcon className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className={`
                    rounded-xl border px-2.5 py-1
                    text-[10px] font-black
                    ${toneClass.badge}
                  `}
                >
                  {log.type}
                </span>

                <span className="text-sm font-black text-[#123f59]">
                  {log.action}
                </span>
              </div>

              <div
                className="
                  flex items-center gap-1.5
                  text-[10px] font-black text-[#64748b]
                "
              >
                <ShieldCheck className="h-3.5 w-3.5 text-[#c5983c]" />
                حركة موثقة داخل النظام
              </div>
            </div>
          </div>

          <div
            className="
              flex w-fit shrink-0 items-center gap-1.5
              rounded-xl border border-[#d8b46a]/25
              bg-white px-2.5 py-1.5
              font-mono text-[10px] font-black
              text-[#123f59] shadow-sm
            "
            dir="ltr"
          >
            <Clock className="h-3.5 w-3.5 text-[#c5983c]" />
            {renderDate(log.date)}
          </div>
        </div>

        {/* Details */}
        <div
          className="
            whitespace-pre-wrap px-6 py-5
            text-sm font-bold leading-8 text-[#334155]
          "
        >
          {log.details}
        </div>

        {/* Footer */}
        <div
          className="
            flex flex-col gap-3 border-t border-[#e8ddc8]
            bg-white px-5 py-3
            sm:flex-row sm:items-center sm:justify-between
          "
        >
          <div className="flex items-center gap-2">
            <div
              className="
                grid h-9 w-9 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <User className="h-4 w-4" />
            </div>

            <div>
              <div className="text-[9px] font-black text-[#94a3b8]">
                المستخدم
              </div>

              <div className="text-[11px] font-black text-[#123f59]">
                {log.user}
              </div>
            </div>
          </div>

          <span
            className={`
              w-fit rounded-xl border px-2.5 py-1
              text-[9px] font-black
              ${toneClass.footerBadge}
            `}
          >
            {isSystem ? "مصدرها النظام" : "مصدرها سجل الجهات"}
          </span>
        </div>
      </div>
    </div>
  );
};

const HeaderMetric = ({ icon: Icon, label, value, tone = "gold" }) => {
  const tones = {
    gold: "border-[#e2bf74]/25 bg-[#e2bf74]/15 text-[#e2bf74]",
    cyan: "border-cyan-300/20 bg-cyan-400/15 text-cyan-100",
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

          <div className="font-mono text-base font-black text-white">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div
    className="
      flex min-h-[320px] flex-col items-center justify-center
      rounded-[28px] border border-dashed
      border-[#d8b46a]/45 bg-white/75
      p-12 text-center
      shadow-[0_18px_45px_rgba(18,63,89,0.08)]
    "
  >
    <div
      className="
        mb-4 grid h-20 w-20 place-items-center
        rounded-[28px] bg-gradient-to-br
        from-[#123f59] to-[#0e7490]
        text-[#e2bf74]
        shadow-[0_16px_34px_rgba(18,63,89,0.22)]
      "
    >
      <AlertCircle className="h-10 w-10" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      لا توجد حركات مسجلة في السجل حتى الآن
    </p>

    <p className="mt-1 max-w-sm text-xs font-bold leading-6 text-[#64748b]">
      ستظهر هنا جميع العمليات، التحديثات، والملاحظات المرتبطة بهذه المعاملة فور
      تسجيلها في النظام.
    </p>

    <div
      className="
        mt-4 inline-flex items-center gap-1.5 rounded-xl
        border border-emerald-200 bg-emerald-50
        px-3 py-1.5 text-[10px] font-black text-emerald-700
      "
    >
      <ScrollText className="h-3.5 w-3.5" />
      السجل جاهز للتوثيق
    </div>
  </div>
);

const getToneClass = (tone) => {
  const tones = {
    system: {
      pointBorder: "border-[#c5983c]",
      point: "bg-[#c5983c]",
      icon: "border-[#d8b46a]/30 bg-[#123f59] text-[#e2bf74]",
      badge: "border-[#d8b46a]/30 bg-[#f8efe0] text-[#123f59]",
      footerBadge: "border-[#d8b46a]/30 bg-[#f8efe0] text-[#9a6b16]",
    },
    authority: {
      pointBorder: "border-cyan-400",
      point: "bg-cyan-500",
      icon: "border-cyan-200 bg-cyan-50 text-cyan-700",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
      footerBadge: "border-cyan-200 bg-cyan-50 text-cyan-700",
    },
  };

  return tones[tone] || tones.system;
};