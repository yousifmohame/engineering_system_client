import React from "react";
import {
  ArrowRight,
  Archive,
  Trash2,
  CircleDot,
  Reply,
  ReplyAll,
  Forward,
  Bot,
  Sparkles,
  CheckCircle,
  RefreshCw,
  FileText,
  Building2,
  Clock,
  CheckCircle2,
  Paperclip,
  Download,
  User,
} from "lucide-react";

export default function EmailViewer({
  selectedMessage,
  setSelectedMessage,
  updateMessageInDB,
  handleCompose,
  analyzeMutation,
}) {
  const hasAttachments =
    selectedMessage.attachments && selectedMessage.attachments.length > 0;

  const InfoCard = ({
    label,
    value,
    icon: Icon,
    colorClass = "text-[#c5983c]",
  }) => {
    if (!value) return null;

    return (
      <div className="rounded-xl border border-[#e7dcc5] bg-white px-3 py-2 shadow-sm">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-bold text-[#6b7a80]">
            {label}
          </p>

          {Icon && (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f8efe0]">
              <Icon className={`h-3.5 w-3.5 ${colorClass}`} />
            </span>
          )}
        </div>

        <p className="truncate text-xs font-black text-[#123f59]">{value}</p>
      </div>
    );
  };

  const senderName =
    selectedMessage.from?.split("<")[0].replace(/"/g, "").trim() ||
    "بدون مرسل";

  const senderEmail =
    selectedMessage.from?.match(/<([^>]+)>/)?.[1] || selectedMessage.from;

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-[#f6f1e8] animate-in slide-in-from-right-4 duration-300">
      <style>
        {`
          .email-viewer-content {
            line-height: 1.55;
            font-size: 13px;
            color: #25313b;
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          @media (min-width: 1280px) {
            .email-viewer-content {
              line-height: 1.7;
              font-size: 14px;
            }
          }

          .email-viewer-content img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 8px 0;
          }

          .email-viewer-content a {
            color: #123f59;
            font-weight: 700;
            text-decoration: none;
            word-break: break-all;
          }

          .email-viewer-content a:hover {
            color: #c5983c;
            text-decoration: underline;
          }
        `}
      </style>

      {/* HEADER */}
      <div className="relative z-10 shrink-0 border-b border-white/55 bg-white/55 px-2 py-2 shadow-[0_10px_28px_rgba(18,63,89,0.06)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#d8b46a]/25 bg-white/70 px-3 text-xs font-extrabold text-[#123f59] shadow-sm transition hover:bg-[#f8efe0]/75 hover:text-[#c5983c]"
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة</span>
            </button>

            <button
              onClick={() =>
                updateMessageInDB(selectedMessage, { isArchived: true }).then(
                  () => setSelectedMessage(null)
                )
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#d8b46a]/20 bg-white/70 text-[#123f59] shadow-sm transition hover:bg-[#f8efe0]/80 hover:text-[#c5983c]"
              title="أرشفة"
              type="button"
            >
              <Archive className="h-4 w-4" />
            </button>

            <button
              onClick={() =>
                updateMessageInDB(selectedMessage, { isDeleted: true }).then(
                  () => setSelectedMessage(null)
                )
              }
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-red-200/40 bg-white/70 text-[#64748b] shadow-sm transition hover:bg-red-50 hover:text-red-600"
              title="حذف"
              type="button"
            >
              <Trash2 className="h-4 w-4" />
            </button>

            <button
              onClick={() => {
                updateMessageInDB(selectedMessage, { isRead: false });
                setSelectedMessage(null);
              }}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#d8b46a]/20 bg-white/70 text-[#123f59] shadow-sm transition hover:bg-[#f8efe0]/80 hover:text-[#c5983c]"
              title="تعليم كغير مقروء"
              type="button"
            >
              <CircleDot className="h-4 w-4" />
            </button>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={() => handleCompose("reply", selectedMessage)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#d8b46a]/25 bg-white/70 px-2.5 text-xs font-extrabold text-[#123f59] shadow-sm transition hover:bg-[#f8efe0]/80 hover:text-[#c5983c] md:px-3"
              type="button"
            >
              <Reply className="h-3.5 w-3.5" />
              <span className="hidden md:inline">رد</span>
            </button>

            <button
              onClick={() => handleCompose("replyall", selectedMessage)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#d8b46a]/25 bg-white/70 px-2.5 text-xs font-extrabold text-[#123f59] shadow-sm transition hover:bg-[#f8efe0]/80 hover:text-[#c5983c] md:px-3"
              type="button"
            >
              <ReplyAll className="h-3.5 w-3.5" />
              <span className="hidden md:inline">للجميع</span>
            </button>

            <button
              onClick={() => handleCompose("forward", selectedMessage)}
              className="flex h-9 items-center gap-1.5 rounded-xl border border-[#d8b46a]/35 bg-gradient-to-l from-[#123f59] to-[#1a5874] px-2.5 text-xs font-extrabold text-white shadow-sm transition hover:-translate-y-[1px] md:px-3"
              type="button"
            >
              <Forward className="h-3.5 w-3.5 text-[#e2bf74]" />
              <span className="hidden md:inline">تحويل</span>
            </button>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="relative z-10 min-h-0 flex-1 overflow-hidden p-2 xl:p-3">
        <div
          dir="ltr"
          className="
            mx-auto grid h-full max-w-7xl gap-2 xl:gap-3
            grid-cols-1
            grid-rows-[minmax(0,0.56fr)_minmax(0,0.44fr)]
            xl:grid-cols-[370px_minmax(0,1fr)]
            xl:grid-rows-1
          "
        >
          {/* ANALYSIS LEFT ON LARGE SCREEN / BOTTOM ON SMALL SCREEN */}
          <aside
            dir="rtl"
            className="order-2 min-h-0 overflow-hidden rounded-[20px] border border-[#e8ddc8] bg-white shadow-[0_12px_30px_rgba(18,63,89,0.09)] xl:order-1 xl:rounded-[24px]"
          >
            {!selectedMessage.isAnalyzed ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl bg-[#123f59] xl:h-14 xl:w-14 xl:rounded-2xl">
                  <Bot className="h-6 w-6 text-[#e2bf74] xl:h-7 xl:w-7" />
                </div>

                <h3 className="mb-1 text-sm font-black text-[#123f59] xl:text-lg">
                  استخراج البيانات
                </h3>

                <p className="mb-3 max-w-sm text-[11px] font-semibold leading-5 text-[#53676d] xl:text-xs xl:leading-6">
                  قراءة الرسالة واستخراج التفاصيل تلقائياً.
                </p>

                <button
                  onClick={() => analyzeMutation.mutate(selectedMessage)}
                  disabled={analyzeMutation.isPending}
                  className="mx-auto flex items-center gap-2 rounded-xl bg-[#123f59] px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#0f3448] disabled:cursor-not-allowed disabled:opacity-50 xl:px-5 xl:py-2.5"
                  type="button"
                >
                  {analyzeMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin text-[#e2bf74]" />
                  ) : (
                    <Sparkles className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  بدء التحليل
                </button>
              </div>
            ) : (
              <div className="flex h-full min-h-0 flex-col overflow-hidden">
                <div className="shrink-0 border-b border-[#eadfca] bg-[#fbf8f1] px-4 py-3 xl:px-5 xl:py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 xl:gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74] xl:h-12 xl:w-12 xl:rounded-2xl">
                        <CheckCircle className="h-5 w-5 xl:h-6 xl:w-6" />
                      </span>

                      <h3 className="text-base font-black text-[#123f59] xl:text-lg">
                        ملخص التحليل الذكي
                      </h3>
                    </div>

                    {selectedMessage.linkedTxId && (
                      <div className="hidden items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[10px] font-black text-[#123f59] sm:flex">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#c5983c]" />
                        مربوط
                      </div>
                    )}
                  </div>
                </div>

                {/* ANALYSIS CONTENT SCROLLS INTERNALLY IF NEEDED */}
                <div className="min-h-0 flex-1 overflow-y-auto p-3 xl:p-4 custom-scrollbar-slim">
                  {/* SMALL / MEDIUM SCREEN COMPACT VERSION */}
                  <div className="grid grid-cols-2 gap-2 xl:hidden">
                    <InfoCard
                      label="نوع الخدمة"
                      value={selectedMessage.serviceType}
                    />

                    <InfoCard
                      label="الجهة المصدرة"
                      value={selectedMessage.entityName}
                      icon={Building2}
                    />

                    <InfoCard
                      label="رقم الطلب"
                      value={selectedMessage.reqNumber}
                      icon={FileText}
                    />

                    <InfoCard
                      label="سنة الطلب"
                      value={selectedMessage.reqYear}
                    />

                    <InfoCard
                      label="رقم الخدمة"
                      value={selectedMessage.serviceNumber}
                      icon={FileText}
                      colorClass="text-[#1c6b59]"
                    />

                    <InfoCard
                      label="سنة الخدمة"
                      value={selectedMessage.serviceYear}
                    />

                    {selectedMessage.ownerName && (
                      <div className="col-span-2">
                        <InfoCard
                          label="اسم المالك"
                          value={selectedMessage.ownerName}
                          icon={User}
                          colorClass="text-[#123f59]"
                        />
                      </div>
                    )}

                    {selectedMessage.replyText && (
                      <div className="col-span-2 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] p-2">
                        <div className="mb-1 flex items-center gap-2 text-[10px] font-black text-[#53676d]">
                          <FileText className="h-3.5 w-3.5 text-[#c5983c]" />
                          الإفادة / الملاحظات
                        </div>

                        <div className="max-h-[70px] overflow-y-auto rounded-xl bg-white p-2 text-[11px] font-semibold leading-5 text-[#334155] custom-scrollbar-slim">
                          {selectedMessage.replyText}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* LARGE SCREEN ORIGINAL FULL VERSION */}
                  <div className="hidden grid-cols-1 gap-3 xl:grid">
                    <InfoCard
                      label="نوع الخدمة"
                      value={selectedMessage.serviceType}
                    />

                    <InfoCard
                      label="اسم الجهة المصدرة"
                      value={selectedMessage.entityName}
                      icon={Building2}
                    />

                    <InfoCard
                      label="اسم المالك"
                      value={selectedMessage.ownerName}
                      icon={User}
                      colorClass="text-[#123f59]"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard
                        label="رقم الطلب"
                        value={selectedMessage.reqNumber}
                        icon={FileText}
                      />

                      <InfoCard
                        label="سنة الطلب"
                        value={selectedMessage.reqYear}
                      />

                      <InfoCard
                        label="رقم الخدمة"
                        value={selectedMessage.serviceNumber}
                        icon={FileText}
                        colorClass="text-[#1c6b59]"
                      />

                      <InfoCard
                        label="سنة الخدمة"
                        value={selectedMessage.serviceYear}
                      />
                    </div>

                    <InfoCard
                      label="القطاع"
                      value={selectedMessage.sectorName}
                    />

                    <InfoCard
                      label="وقت الإطلاع"
                      value={selectedMessage.viewTime}
                      icon={Clock}
                      colorClass="text-[#c5983c]"
                    />

                    {selectedMessage.replyText && (
                      <div className="rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1] p-4">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black text-[#53676d]">
                          <FileText className="h-4 w-4 text-[#c5983c]" />
                          الإفادة / الملاحظات
                        </div>

                        <div className="max-h-[95px] overflow-y-auto rounded-2xl bg-white p-3 text-xs font-semibold leading-6 text-[#334155] custom-scrollbar-slim">
                          {selectedMessage.replyText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* MESSAGE RIGHT ON LARGE SCREEN / TOP ON SMALL SCREEN */}
          <section
            dir="rtl"
            className="order-1 flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-[#e8ddc8] bg-white shadow-[0_12px_30px_rgba(18,63,89,0.09)] xl:order-2 xl:rounded-[24px]"
          >
            <div className="h-1.5 shrink-0 bg-gradient-to-l from-[#123f59] via-[#c5983c] to-[#1c6b59]" />

            <div className="shrink-0 px-4 py-3 xl:px-5 xl:py-4">
              <div className="mb-2 flex items-start justify-between gap-3 xl:mb-3">
                <div className="min-w-0">
                  <p className="mb-0.5 text-[10px] font-bold text-[#c5983c] xl:mb-1 xl:text-[11px]">
                    تفاصيل الرسالة
                  </p>

                  <h1 className="line-clamp-2 text-lg font-black leading-tight text-[#111827] xl:text-[23px]">
                    {selectedMessage.subject || "(بدون موضوع)"}
                  </h1>
                </div>

                <div className="hidden shrink-0 rounded-xl border border-[#e1d4bd] bg-[#fbf8f1] px-3 py-1.5 text-[10px] font-bold text-[#53676d] lg:block xl:rounded-2xl xl:px-4 xl:py-2 xl:text-xs">
                  {new Date(selectedMessage.date).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#eadfca] bg-[#fbf8f1] px-3 py-2 xl:rounded-3xl xl:px-4 xl:py-3">
                <div className="flex items-center gap-2.5 xl:gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#123f59] text-sm font-black text-white shadow-md xl:h-12 xl:w-12 xl:rounded-2xl xl:text-lg">
                    {selectedMessage.from?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-[#123f59] xl:text-base">
                          {senderName}
                        </p>

                        <p
                          className="truncate text-[10px] font-mono text-[#6b7280] xl:text-[11px]"
                          dir="ltr"
                        >
                          {senderEmail}
                        </p>
                      </div>

                      <p className="hidden shrink-0 text-[10px] font-semibold text-[#94a3b8] md:block xl:text-[11px]">
                        إلى: {selectedMessage.to || "أنا"}
                      </p>
                    </div>

                    <p className="mt-0.5 text-[10px] font-bold text-[#53676d] lg:hidden">
                      {new Date(selectedMessage.date).toLocaleString("ar-SA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* EMAIL TEXT SCROLLS HERE INTERNALLY */}
            <div className="min-h-0 flex-1 overflow-y-auto border-t border-[#eadfca] px-4 py-3 custom-scrollbar-slim xl:px-5 xl:py-4">
              <div className="email-viewer-content">
                {selectedMessage.html ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: selectedMessage.html }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {selectedMessage.body || selectedMessage.text}
                  </div>
                )}

                {(selectedMessage.signature || selectedMessage.footerText) &&
                  !selectedMessage.html && (
                    <div className="mt-4 border-t border-[#eadfca] pt-3">
                      {selectedMessage.signature && (
                        <div
                          className="mb-2"
                          dangerouslySetInnerHTML={{
                            __html: selectedMessage.signature,
                          }}
                        />
                      )}

                      {selectedMessage.footerText && (
                        <div
                          style={{
                            color: selectedMessage.footerColor || "#64748b",
                            fontSize: selectedMessage.footerSize || "11px",
                            textAlign: "center",
                            marginTop: "8px",
                          }}
                        >
                          {selectedMessage.footerText}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            {/* Attachments */}
            {hasAttachments && (
              <div className="shrink-0 border-t border-[#eadfca] bg-[#fbf8f1] px-4 py-2 xl:px-5 xl:py-3">
                <h4 className="mb-1.5 flex items-center gap-2 text-xs font-black text-[#123f59] xl:mb-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-[#c5983c]">
                    <Paperclip className="h-3.5 w-3.5" />
                  </span>
                  المرفقات ({selectedMessage.attachments.length})
                </h4>

                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-slim">
                  {selectedMessage.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex min-w-[180px] items-center justify-between gap-2 rounded-xl border border-[#e8ddc8] bg-white px-3 py-1.5 xl:min-w-[190px] xl:py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-[#123f59]" />
                        <span className="truncate text-[11px] font-bold text-[#334155]">
                          {att.filename || att.name || "مرفق"}
                        </span>
                      </div>

                      {(att.path || att.url) && (
                        <a
                          href={att.path || att.url}
                          download={att.filename || att.name || "attachment"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#f8efe0] text-[#c5983c] transition hover:bg-[#123f59] hover:text-white"
                          title="تحميل المرفق"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}