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

  const isUnread = !selectedMessage.isRead;

  const decodeHtmlEntities = (value = "") => {
    if (!value) return "";

    let decoded = String(value);

    if (typeof document === "undefined") {
      return decoded
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    }

    const textarea = document.createElement("textarea");

    for (let i = 0; i < 3; i++) {
      textarea.innerHTML = decoded;
      const next = textarea.value;

      if (next === decoded) break;
      decoded = next;
    }

    return decoded;
  };

  const escapeHtml = (value = "") => {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const cleanEmailHtml = (html = "") => {
    return String(html)
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
      .replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, "")
      .replace(/<object[\s\S]*?>[\s\S]*?<\/object>/gi, "")
      .replace(/<embed[\s\S]*?>[\s\S]*?<\/embed>/gi, "")
      .replace(/\son\w+="[^"]*"/gi, "")
      .replace(/\son\w+='[^']*'/gi, "")
      .replace(/\shref=["']javascript:[^"']*["']/gi, "")
      .replace(/\ssrc=["']javascript:[^"']*["']/gi, "");
  };

  const getRawEmailContent = () => {
    return selectedMessage.html || selectedMessage.body || selectedMessage.text || "";
  };

  const isEmailHtmlContent = () => {
    const decodedContent = decodeHtmlEntities(getRawEmailContent());
    return /<\/?[a-z][\s\S]*>/i.test(decodedContent);
  };

  const getEmailContent = () => {
    const rawContent = getRawEmailContent();

    if (!rawContent) return "";

    const decodedContent = decodeHtmlEntities(rawContent);
    const isHtml = /<\/?[a-z][\s\S]*>/i.test(decodedContent);

    if (isHtml) {
      return cleanEmailHtml(decodedContent);
    }

    return escapeHtml(decodedContent).replace(/\n/g, "<br />");
  };

  const InfoCard = ({ label, value, icon: Icon, tone = "gold" }) => {
    if (!value) return null;

    const tones = {
      gold: {
        border: "border-[#c5983c]/45",
        bg: "bg-white",
        iconBg: "bg-[#f8efe0]",
        iconBorder: "border-[#d8b46a]/35",
        iconText: "text-[#c5983c]",
      },
      blue: {
        border: "border-[#0f3448]/30",
        bg: "bg-[#f8fafc]",
        iconBg: "bg-[#e7f3f7]",
        iconBorder: "border-[#0f3448]/20",
        iconText: "text-[#0f3448]",
      },
      emerald: {
        border: "border-emerald-500/25",
        bg: "bg-emerald-50/60",
        iconBg: "bg-emerald-100/80",
        iconBorder: "border-emerald-400/20",
        iconText: "text-emerald-700",
      },
      cyan: {
        border: "border-cyan-700/25",
        bg: "bg-cyan-50/70",
        iconBg: "bg-cyan-100",
        iconBorder: "border-cyan-700/20",
        iconText: "text-cyan-800",
      },
      red: {
        border: "border-rose-300/40",
        bg: "bg-rose-50/60",
        iconBg: "bg-rose-100/80",
        iconBorder: "border-rose-300/30",
        iconText: "text-rose-600",
      },
    };

    const t = tones[tone] || tones.gold;

    return (
      <div
        className={`rounded-xl border ${t.border} ${t.bg} px-3 py-2 shadow-[0_8px_18px_rgba(18,63,89,0.10)] transition hover:shadow-[0_12px_24px_rgba(18,63,89,0.16)]`}
      >
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="truncate text-[10px] font-black text-[#334155]">
            {label}
          </p>

          {Icon && (
            <span
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border ${t.iconBorder} ${t.iconBg}`}
            >
              <Icon className={`h-3.5 w-3.5 ${t.iconText}`} />
            </span>
          )}
        </div>

        <p className="truncate text-xs font-black text-[#0f172a]">{value}</p>
      </div>
    );
  };

  const senderName =
    selectedMessage.from?.split("<")[0].replace(/"/g, "").trim() ||
    "بدون مرسل";

  const senderEmail =
    selectedMessage.from?.match(/<([^>]+)>/)?.[1] || selectedMessage.from;

  const emailIsHtml = isEmailHtmlContent();

  return (
    <div className="absolute inset-0 z-20 flex flex-col overflow-hidden bg-gradient-to-br from-[#dfe8e7] via-[#f6f1e8] to-[#e8f0ef] animate-in slide-in-from-right-4 duration-300">
      <style>
        {`
          .email-viewer-content {
            line-height: 1.8;
            font-size: 14px;
            color: #111827;
            font-weight: 500;
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          .email-viewer-content p {
            margin: 0 0 10px 0;
          }

          .email-viewer-content div,
          .email-viewer-content span,
          .email-viewer-content font {
            max-width: 100%;
          }

          .email-viewer-content table {
            max-width: 100%;
            width: auto;
            border-collapse: collapse;
          }

          .email-viewer-content td,
          .email-viewer-content th {
            word-break: break-word;
            overflow-wrap: anywhere;
          }

          .email-viewer-content img {
            max-width: 100%;
            height: auto;
            border-radius: 10px;
            margin: 8px 0;
          }

          .email-viewer-content a {
            color: #0f3448;
            font-weight: 800;
            text-decoration: none;
            word-break: break-all;
          }

          .email-viewer-content a:hover {
            color: #c5983c;
            text-decoration: underline;
          }

          .email-viewer-content blockquote {
            margin: 10px 0;
            padding: 10px 14px;
            border-right: 4px solid #c5983c;
            background: #f8efe0;
            border-radius: 12px;
          }
        `}
      </style>

      {/* HEADER */}
      <div className="relative z-10 shrink-0 border-b border-[#c5983c]/40 bg-white/90 px-2 py-2 shadow-[0_10px_30px_rgba(18,63,89,0.16)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <button
              onClick={() => setSelectedMessage(null)}
              className="flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-[#c5983c]/50 bg-white px-3 text-xs font-black text-[#0f3448] shadow-[0_6px_16px_rgba(18,63,89,0.12)] transition hover:bg-[#f8efe0] hover:text-[#c5983c]"
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة</span>
            </button>

            <HeaderActionButton
              label="أرشفة"
              title="أرشفة"
              tone="cyan"
              onClick={() =>
                updateMessageInDB(selectedMessage, { isArchived: true }).then(
                  () => setSelectedMessage(null),
                )
              }
            >
              <Archive className="h-4 w-4" />
            </HeaderActionButton>

            <HeaderActionButton
              label="حذف"
              title="حذف"
              tone="rose"
              onClick={() =>
                updateMessageInDB(selectedMessage, { isDeleted: true }).then(
                  () => setSelectedMessage(null),
                )
              }
            >
              <Trash2 className="h-4 w-4" />
            </HeaderActionButton>

            <HeaderActionButton
              label="غير مقروء"
              title="تعليم كغير مقروء"
              tone="emerald"
              onClick={() => {
                updateMessageInDB(selectedMessage, { isRead: false });
                setSelectedMessage(null);
              }}
            >
              <CircleDot className="h-4 w-4" />
            </HeaderActionButton>
          </div>

          <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
            <HeaderActionButton
              label="رد"
              title="رد"
              tone="gold"
              onClick={() => handleCompose("reply", selectedMessage)}
            >
              <Reply className="h-4 w-4" />
            </HeaderActionButton>

            <HeaderActionButton
              label="للجميع"
              title="رد للجميع"
              tone="gold"
              onClick={() => handleCompose("replyall", selectedMessage)}
            >
              <ReplyAll className="h-4 w-4" />
            </HeaderActionButton>

            <HeaderActionButton
              label="تحويل"
              title="تحويل"
              tone="primary"
              onClick={() => handleCompose("forward", selectedMessage)}
            >
              <Forward className="h-4 w-4" />
            </HeaderActionButton>
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
          {/* ANALYSIS */}
          <aside
            dir="rtl"
            className="order-2 min-h-0 overflow-hidden rounded-[20px] border border-[#0f3448]/25 bg-white shadow-[0_18px_42px_rgba(18,63,89,0.16)] xl:order-1 xl:rounded-[24px]"
          >
            {!selectedMessage.isAnalyzed ? (
              <div className="flex h-full flex-col items-center justify-center bg-gradient-to-br from-white via-[#f8efe0] to-cyan-50 p-4 text-center">
                <div className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#0f3448] to-[#0e7490] shadow-lg xl:h-14 xl:w-14 xl:rounded-2xl">
                  <Bot className="h-6 w-6 text-[#e2bf74] xl:h-7 xl:w-7" />
                </div>

                <h3 className="mb-1 text-sm font-black text-[#0f3448] xl:text-lg">
                  استخراج البيانات
                </h3>

                <p className="mb-3 max-w-sm text-[11px] font-bold leading-5 text-[#334155] xl:text-xs xl:leading-6">
                  قراءة الرسالة واستخراج التفاصيل تلقائياً.
                </p>

                <button
                  onClick={() => analyzeMutation.mutate(selectedMessage)}
                  disabled={analyzeMutation.isPending}
                  className="mx-auto flex items-center gap-2 rounded-xl bg-gradient-to-l from-[#0f3448] to-[#0e7490] px-4 py-2 text-xs font-black text-white shadow-md transition hover:bg-[#092637] disabled:cursor-not-allowed disabled:opacity-50 xl:px-5 xl:py-2.5"
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
                <div className="shrink-0 border-b border-[#0f3448]/20 bg-gradient-to-l from-[#0f3448] via-[#15536f] to-[#0e7490] px-4 py-3 text-white xl:px-5 xl:py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 xl:gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/12 text-[#e2bf74] shadow-md xl:h-12 xl:w-12 xl:rounded-2xl">
                        <CheckCircle className="h-5 w-5 xl:h-6 xl:w-6" />
                      </span>

                      <h3 className="text-base font-black text-white xl:text-lg">
                        ملخص التحليل الذكي
                      </h3>
                    </div>

                    {selectedMessage.linkedTxId && (
                      <div className="hidden items-center gap-1 rounded-full border border-white/25 bg-white/15 px-3 py-1.5 text-[10px] font-black text-[#e2bf74] sm:flex">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#e2bf74]" />
                        مربوط
                      </div>
                    )}
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-[#fbf8f1] via-white to-cyan-50 p-3 xl:p-4 custom-scrollbar-slim">
                  <div className="grid grid-cols-2 gap-2 xl:hidden">
                    <InfoCard
                      label="نوع الخدمة"
                      value={selectedMessage.serviceType}
                      tone="emerald"
                    />

                    <InfoCard
                      label="الجهة المصدرة"
                      value={selectedMessage.entityName}
                      icon={Building2}
                      tone="blue"
                    />

                    <InfoCard
                      label="رقم الطلب"
                      value={selectedMessage.reqNumber}
                      icon={FileText}
                      tone="gold"
                    />

                    <InfoCard
                      label="سنة الطلب"
                      value={selectedMessage.reqYear}
                      tone="cyan"
                    />

                    <InfoCard
                      label="رقم الخدمة"
                      value={selectedMessage.serviceNumber}
                      icon={FileText}
                      tone="emerald"
                    />

                    <InfoCard
                      label="سنة الخدمة"
                      value={selectedMessage.serviceYear}
                      tone="cyan"
                    />

                    {selectedMessage.ownerName && (
                      <div className="col-span-2">
                        <InfoCard
                          label="اسم المالك"
                          value={selectedMessage.ownerName}
                          icon={User}
                          tone="blue"
                        />
                      </div>
                    )}

                    {selectedMessage.replyText && (
                      <div className="col-span-2 rounded-xl border border-[#c5983c]/35 bg-white p-2 shadow-sm">
                        <div className="mb-1 flex items-center gap-2 text-[10px] font-black text-[#0f3448]">
                          <FileText className="h-3.5 w-3.5 text-[#c5983c]" />
                          الإفادة / الملاحظات
                        </div>

                        <div className="max-h-[70px] overflow-y-auto rounded-xl bg-[#f8efe0] p-2 text-[11px] font-bold leading-5 text-[#111827] custom-scrollbar-slim">
                          {selectedMessage.replyText}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="hidden grid-cols-1 gap-3 xl:grid">
                    <InfoCard
                      label="نوع الخدمة"
                      value={selectedMessage.serviceType}
                      tone="emerald"
                    />

                    <InfoCard
                      label="اسم الجهة المصدرة"
                      value={selectedMessage.entityName}
                      icon={Building2}
                      tone="blue"
                    />

                    <InfoCard
                      label="اسم المالك"
                      value={selectedMessage.ownerName}
                      icon={User}
                      tone="cyan"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <InfoCard
                        label="رقم الطلب"
                        value={selectedMessage.reqNumber}
                        icon={FileText}
                        tone="gold"
                      />

                      <InfoCard
                        label="سنة الطلب"
                        value={selectedMessage.reqYear}
                        tone="cyan"
                      />

                      <InfoCard
                        label="رقم الخدمة"
                        value={selectedMessage.serviceNumber}
                        icon={FileText}
                        tone="emerald"
                      />

                      <InfoCard
                        label="سنة الخدمة"
                        value={selectedMessage.serviceYear}
                        tone="blue"
                      />
                    </div>

                    <InfoCard
                      label="القطاع"
                      value={selectedMessage.sectorName}
                      tone="gold"
                    />

                    <InfoCard
                      label="وقت الإطلاع"
                      value={selectedMessage.viewTime}
                      icon={Clock}
                      tone="red"
                    />

                    {selectedMessage.replyText && (
                      <div className="rounded-2xl border border-[#c5983c]/35 bg-white p-4 shadow-sm">
                        <div className="mb-2 flex items-center gap-2 text-xs font-black text-[#0f3448]">
                          <FileText className="h-4 w-4 text-[#c5983c]" />
                          الإفادة / الملاحظات
                        </div>

                        <div className="max-h-[95px] overflow-y-auto rounded-2xl bg-[#f8efe0] p-3 text-xs font-bold leading-6 text-[#111827] custom-scrollbar-slim">
                          {selectedMessage.replyText}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* MESSAGE */}
          <section
            dir="rtl"
            className={`order-1 flex min-h-0 flex-col overflow-hidden rounded-[20px] border shadow-[0_18px_42px_rgba(18,63,89,0.16)] xl:order-2 xl:rounded-[24px] ${
              isUnread
                ? "border-rose-300 bg-white ring-2 ring-rose-200/60"
                : "border-emerald-300 bg-white ring-1 ring-emerald-200/50"
            }`}
          >
            <div
              className={`h-1.5 shrink-0 ${
                isUnread
                  ? "bg-gradient-to-l from-rose-500 via-rose-400 to-orange-300"
                  : "bg-gradient-to-l from-emerald-600 via-emerald-400 to-cyan-400"
              }`}
            />

            <div
              className={`shrink-0 border-b px-4 py-3 xl:px-5 xl:py-4 ${
                isUnread
                  ? "border-rose-200 bg-gradient-to-l from-rose-50/80 via-white to-orange-50/50"
                  : "border-emerald-200 bg-gradient-to-l from-emerald-50/80 via-white to-cyan-50/50"
              }`}
            >
              <div className="mb-2 flex items-start justify-between gap-3 xl:mb-3">
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <p
                      className={`text-[10px] font-black xl:text-[11px] ${
                        isUnread ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      تفاصيل الرسالة
                    </p>

                    {isUnread ? (
                      <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                        غير مقروء
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                        مقروء
                      </span>
                    )}
                  </div>

                  <h1 className="line-clamp-2 text-lg font-black leading-tight text-[#0f172a] xl:text-[23px]">
                    {selectedMessage.subject || "(بدون موضوع)"}
                  </h1>
                </div>

                <div
                  className={`hidden shrink-0 rounded-xl border px-3 py-1.5 text-[10px] font-black lg:block xl:rounded-2xl xl:px-4 xl:py-2 xl:text-xs ${
                    isUnread
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {new Date(selectedMessage.date).toLocaleString("ar-SA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              <div
                className={`rounded-2xl border px-3 py-2 shadow-sm xl:rounded-3xl xl:px-4 xl:py-3 ${
                  isUnread
                    ? "border-rose-200 bg-rose-50/70"
                    : "border-emerald-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2.5 xl:gap-3">
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-md xl:h-12 xl:w-12 xl:rounded-2xl xl:text-lg ${
                      isUnread
                        ? "bg-gradient-to-br from-rose-500 to-rose-400"
                        : "bg-gradient-to-br from-emerald-600 to-emerald-400"
                    }`}
                  >
                    {selectedMessage.from?.charAt(0).toUpperCase() || "?"}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`truncate text-sm font-black xl:text-base ${
                            isUnread ? "text-rose-950" : "text-emerald-950"
                          }`}
                        >
                          {senderName}
                        </p>

                        <p
                          className="truncate text-[10px] font-mono font-bold text-[#475569] xl:text-[11px]"
                          dir="ltr"
                        >
                          {senderEmail}
                        </p>
                      </div>

                      <p className="hidden shrink-0 text-[10px] font-black text-[#475569] md:block xl:text-[11px]">
                        إلى: {selectedMessage.to || "أنا"}
                      </p>
                    </div>

                    <p
                      className={`mt-0.5 text-[10px] font-black lg:hidden ${
                        isUnread ? "text-rose-600" : "text-emerald-700"
                      }`}
                    >
                      {new Date(selectedMessage.date).toLocaleString("ar-SA", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* EMAIL TEXT */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-3 custom-scrollbar-slim xl:px-5 xl:py-4">
              <div className="email-viewer-content">
                <div dangerouslySetInnerHTML={{ __html: getEmailContent() }} />

                {(selectedMessage.signature || selectedMessage.footerText) &&
                  !emailIsHtml && (
                    <div className="mt-4 border-t border-[#0e7490]/30 pt-3">
                      {selectedMessage.signature && (
                        <div
                          className="mb-2"
                          dangerouslySetInnerHTML={{
                            __html: cleanEmailHtml(
                              decodeHtmlEntities(selectedMessage.signature),
                            ),
                          }}
                        />
                      )}

                      {selectedMessage.footerText && (
                        <div
                          style={{
                            color: selectedMessage.footerColor || "#334155",
                            fontSize: selectedMessage.footerSize || "11px",
                            textAlign: "center",
                            marginTop: "8px",
                            fontWeight: 700,
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
              <div className="shrink-0 border-t border-[#0e7490]/30 bg-gradient-to-l from-[#f8efe0] to-cyan-50 px-4 py-2 xl:px-5 xl:py-3">
                <h4 className="mb-1.5 flex items-center gap-2 text-xs font-black text-[#0f3448] xl:mb-2">
                  <span className="grid h-7 w-7 place-items-center rounded-xl bg-white text-[#0e7490] shadow-sm">
                    <Paperclip className="h-3.5 w-3.5" />
                  </span>
                  المرفقات ({selectedMessage.attachments.length})
                </h4>

                <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar-slim">
                  {selectedMessage.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex min-w-[180px] items-center justify-between gap-2 rounded-xl border border-[#0e7490]/25 bg-white px-3 py-1.5 shadow-sm xl:min-w-[190px] xl:py-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-[#0f3448]" />
                        <span className="truncate text-[11px] font-black text-[#334155]">
                          {att.filename || att.name || "مرفق"}
                        </span>
                      </div>

                      {(att.path || att.url) && (
                        <a
                          href={att.path || att.url}
                          download={att.filename || att.name || "attachment"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#0f3448] text-[#e2bf74] transition hover:bg-[#0e7490] hover:text-white"
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

const HeaderActionButton = ({
  label,
  title,
  tone = "gold",
  onClick,
  children,
}) => {
  const tones = {
    gold:
      "border-[#c5983c]/35 bg-white text-[#0f3448] hover:bg-[#f8efe0] hover:text-[#c5983c]",
    cyan:
      "border-cyan-700/25 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
    rose:
      "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700",
    emerald:
      "border-emerald-500/25 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    primary:
      "border-[#c5983c]/45 bg-gradient-to-l from-[#0f3448] via-[#15536f] to-[#0e7490] text-white hover:-translate-y-[1px]",
  };

  const iconColor = tone === "primary" ? "text-[#e2bf74]" : "";

  return (
    <button
      onClick={onClick}
      title={title}
      className={`
        flex min-w-[56px] flex-col items-center justify-center
        gap-0.5 rounded-xl border px-2 py-1.5
        text-[8px] font-black leading-none
        shadow-sm transition-all duration-200
        ${tones[tone] || tones.gold}
      `}
      type="button"
    >
      <span className={iconColor}>{children}</span>
      <span className="whitespace-nowrap">{label}</span>
    </button>
  );
};
