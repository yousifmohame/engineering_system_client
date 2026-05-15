import React from "react";
import {
  User,
  Activity,
  Clock,
  History,
  ShieldCheck,
  FileText,
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
            details: note.text || note.note || "تم تسجيل ملاحظة مرتبطة بالمعاملة.",
            date: note.date,
            user: note.addedBy || "موظف النظام",
            source: "authority",
          }))
        : [];

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
              <Activity className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                سجل أحداث النظام
              </h3>

              <p className="mt-1 text-xs font-bold text-white/55">
                تتبع زمني دقيق لكل حركة تمت على هذه المعاملة منذ إنشائها.
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
              <History className="h-5 w-5" />
            </span>

            <div>
              <div className="text-[10px] font-black text-white/55">
                عدد الحركات
              </div>

              <div className="font-mono text-base font-black text-white">
                {logsToDisplay.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
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
          <h4 className="flex items-center gap-2 text-xs font-black text-[#123f59]">
            <span
              className="
                grid h-8 w-8 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <Clock className="h-4 w-4" />
            </span>
            التسلسل الزمني للمعاملة
          </h4>

          <span
            className="
              rounded-2xl border border-[#d8b46a]/25
              bg-white px-3 py-1.5 text-[10px]
              font-black text-[#123f59]
            "
          >
            سجل النظام
          </span>
        </div>

        <div
          className="
            custom-scrollbar-slim max-h-[620px] overflow-y-auto
            bg-gradient-to-br from-[#eef7f6]/60 via-[#fbf8f1]/60 to-white
            p-5
          "
        >
          {logsToDisplay.length > 0 ? (
            <div className="relative mr-4 space-y-6 border-r-2 border-[#d8b46a]/35 pr-7">
              {logsToDisplay.map((log, idx) => {
                const isSystem = log.source === "system";

                return (
                  <div key={idx} className="relative">
                    {/* Timeline point */}
                    <div
                      className={`
                        absolute -right-[38px] top-4 grid h-6 w-6
                        place-items-center rounded-full border-4 bg-white shadow-sm
                        ${
                          isSystem
                            ? "border-[#c5983c]"
                            : "border-cyan-400"
                        }
                      `}
                    >
                      <span
                        className={`
                          h-2 w-2 rounded-full
                          ${
                            isSystem
                              ? "bg-[#c5983c]"
                              : "bg-cyan-500"
                          }
                        `}
                      />
                    </div>

                    <div
                      className="
                        group overflow-hidden rounded-[24px]
                        border border-[#d8b46a]/30 bg-white
                        shadow-sm transition-all
                        hover:shadow-[0_14px_34px_rgba(18,63,89,0.12)]
                      "
                    >
                      {/* Card header */}
                      <div
                        className="
                          flex items-start justify-between gap-4
                          border-b border-[#e8ddc8]
                          bg-[#fbf8f1]/65 px-5 py-4
                        "
                      >
                        <div className="flex min-w-0 items-start gap-3">
                          <div
                            className={`
                              grid h-11 w-11 shrink-0 place-items-center
                              rounded-2xl border shadow-sm
                              ${
                                isSystem
                                  ? "border-[#d8b46a]/30 bg-[#123f59] text-[#e2bf74]"
                                  : "border-cyan-200 bg-cyan-50 text-cyan-700"
                              }
                            `}
                          >
                            {isSystem ? (
                              <Activity className="h-5 w-5" />
                            ) : (
                              <FileText className="h-5 w-5" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <span
                                className={`
                                  rounded-xl border px-2.5 py-1
                                  text-[10px] font-black
                                  ${
                                    isSystem
                                      ? "border-[#d8b46a]/30 bg-[#f8efe0] text-[#123f59]"
                                      : "border-cyan-200 bg-cyan-50 text-cyan-700"
                                  }
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
                              <ShieldCheck className="h-3 w-3 text-[#c5983c]" />
                              حركة موثقة داخل النظام
                            </div>
                          </div>
                        </div>

                        <div
                          className="
                            flex shrink-0 items-center gap-1.5
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

                      {/* User */}
                      <div
                        className="
                          flex items-center gap-2 border-t border-[#e8ddc8]
                          bg-white px-5 py-3
                        "
                      >
                        <div
                          className="
                            grid h-8 w-8 place-items-center rounded-2xl
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
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
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
                <Activity className="h-10 w-10" />
              </div>

              <p className="text-sm font-black text-[#123f59]">
                لا توجد حركات مسجلة في السجل حتى الآن.
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                ستظهر هنا جميع العمليات والتحديثات المرتبطة بهذه المعاملة.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};