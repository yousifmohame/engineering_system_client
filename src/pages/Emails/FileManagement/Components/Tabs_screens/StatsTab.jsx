import React from "react";
import {
  Activity,
  Send,
  Search,
  Sparkles,
  Link as LinkIcon,
  FileCheck2,
  FileBox,
  Clock,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  MessageCircle,
  Mail,
  Smartphone,
  SendHorizontal,
  CheckCircle2,
  FolderInput,
  Bot,
  XCircle,
} from "lucide-react";

export default function StatsTab({ stats = {} }) {
  const dynamicStats = [
    {
      l: "روابط نشطة",
      v: stats.activeLinks || 0,
      icon: LinkIcon,
      tone: "emerald",
    },
    {
      l: "إرسالات مكتملة",
      v: stats.totalSent || 0,
      icon: Send,
      tone: "cyan",
    },
    {
      l: "ملفات مستلمة",
      v: stats.totalReceived || 0,
      icon: FileCheck2,
      tone: "blue",
    },
    {
      l: "ملفات قيد الفرز",
      v: stats.pendingFiles || 0,
      icon: Clock,
      tone: "amber",
    },
    {
      l: "روابط منتهية",
      v: 0,
      icon: AlertTriangle,
      tone: "rose",
    },
    {
      l: "متوسط الملفات/الطلب",
      v: 0,
      icon: BarChart3,
      tone: "slate",
    },
    {
      l: "روابط مرتبطة بمعاملات",
      v: 0,
      icon: ShieldCheck,
      tone: "sky",
    },
    {
      l: "ملفات مرفوضة/مشبوهة",
      v: 0,
      icon: XCircle,
      tone: "dark",
    },
  ];

  const channels = [
    {
      ch: "واتساب",
      perc: 65,
      icon: MessageCircle,
      tone: "emerald",
    },
    {
      ch: "البريد الإلكتروني",
      perc: 20,
      icon: Mail,
      tone: "cyan",
    },
    {
      ch: "رسائل قصيرة SMS",
      perc: 10,
      icon: Smartphone,
      tone: "blue",
    },
    {
      ch: "تيليجرام",
      perc: 5,
      icon: SendHorizontal,
      tone: "sky",
    },
  ];

  const completedFiles = stats.totalReceived
    ? stats.totalReceived - (stats.pendingFiles || 0)
    : 0;

  return (
    <div
      className="
        flex h-full flex-1 flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative shrink-0 overflow-hidden
          border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white
          shadow-[0_14px_34px_rgba(18,63,89,0.16)]
          md:px-6
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Activity className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                إحصائيات المركز
              </h2>

              <p className="mt-1 truncate text-xs font-bold text-white/65">
                نظرة شاملة على حركة الملفات والروابط وقنوات الإرسال.
              </p>
            </div>
          </div>

          <div
            className="
              flex w-fit items-center gap-2 rounded-2xl
              border border-emerald-300/25 bg-emerald-400/15
              px-3 py-2 text-[11px] font-black text-emerald-100
            "
          >
            <ShieldCheck className="h-4 w-4" />
            لوحة متابعة تشغيلية
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar md:p-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Main Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {dynamicStats.map((st, i) => (
              <StatCard key={i} stat={st} />
            ))}
          </div>

          {/* Charts / Details */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Channels */}
            <section
              className="
                overflow-hidden rounded-[28px]
                border border-[#d8b46a]/30 bg-white/90
                shadow-[0_16px_40px_rgba(18,63,89,0.08)]
                backdrop-blur-xl
              "
            >
              <SectionHeader
                icon={Send}
                title="قنوات الإرسال الأكثر استخداماً"
                subtitle="نسبة استخدام كل قناة في مشاركة الروابط والحزم."
              />

              <div className="space-y-5 p-5">
                {channels.map((ch, i) => (
                  <ChannelRow key={i} channel={ch} />
                ))}
              </div>
            </section>

            {/* Received Files */}
            <section
              className="
                overflow-hidden rounded-[28px]
                border border-[#d8b46a]/30 bg-white/90
                shadow-[0_16px_40px_rgba(18,63,89,0.08)]
                backdrop-blur-xl
              "
            >
              <SectionHeader
                icon={Search}
                title="نظرة على الملفات المستلمة"
                subtitle="حالة الملفات بعد الاستلام والفحص والفرز."
              />

              <div className="space-y-3 p-5">
                <FileInsightRow
                  icon={FolderInput}
                  label="تحتاج تعييناً لعميل/مشروع"
                  value={`${stats.pendingFiles || 0} ملف`}
                  tone="amber"
                />

                <FileInsightRow
                  icon={Bot}
                  label="بانتظار مراجعة الذكاء الاصطناعي"
                  value="0 ملف"
                  tone="purple"
                  tooltip="الذكاء الاصطناعي يقوم باستخراج البيانات الحيوية من هذه الملفات لمقارنتها بشروط الجودة وتنبيهك بوجود نقص."
                />

                <FileInsightRow
                  icon={CheckCircle2}
                  label="مكتملة ومعتمدة"
                  value={`${completedFiles} ملف`}
                  tone="emerald"
                />

                <FileInsightRow
                  icon={XCircle}
                  label="مرفوضة من النظام"
                  value="0 ملف"
                  tone="rose"
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ stat }) => {
  const Icon = stat.icon;
  const tone = getTone(stat.tone);

  return (
    <div
      className={`
        group relative overflow-hidden rounded-[26px]
        border bg-white/90 p-5
        shadow-[0_14px_34px_rgba(18,63,89,0.08)]
        backdrop-blur-xl transition-all
        hover:-translate-y-[1px]
        hover:shadow-[0_20px_45px_rgba(18,63,89,0.12)]
        ${tone.border}
      `}
    >
      <div
        className={`
          pointer-events-none absolute bottom-0 left-0 right-0 h-1.5
          ${tone.line}
        `}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <span className={`mb-1 block font-mono text-3xl font-black ${tone.text}`}>
            {stat.v}
          </span>

          <span className="text-[11px] font-black text-[#64748b]">
            {stat.l}
          </span>
        </div>

        <div
          className={`
            grid h-12 w-12 shrink-0 place-items-center
            rounded-2xl border shadow-sm
            ${tone.icon}
          `}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div
    className="
      flex items-center gap-3 border-b border-[#e8ddc8]
      bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
      px-5 py-4
    "
  >
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
      <Icon className="h-5 w-5" />
    </span>

    <div>
      <h3 className="text-sm font-black text-[#123f59]">{title}</h3>
      <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
        {subtitle}
      </p>
    </div>
  </div>
);

const ChannelRow = ({ channel }) => {
  const Icon = channel.icon;
  const tone = getTone(channel.tone);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={`
              grid h-8 w-8 place-items-center rounded-xl border
              ${tone.icon}
            `}
          >
            <Icon className="h-4 w-4" />
          </span>

          <span className="text-xs font-black text-[#123f59]">
            {channel.ch}
          </span>
        </div>

        <span
          className={`
            rounded-xl border px-2.5 py-1
            font-mono text-[10px] font-black
            ${tone.badge}
          `}
        >
          {channel.perc}%
        </span>
      </div>

      <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#eef2f2]">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${tone.line}`}
          style={{ width: `${channel.perc}%` }}
        />
      </div>
    </div>
  );
};

const FileInsightRow = ({ icon: Icon, label, value, tone = "emerald", tooltip }) => {
  const t = getTone(tone);

  return (
    <div className="group relative">
      <div
        className="
          flex items-center justify-between gap-3
          rounded-2xl border border-[#e8ddc8]
          bg-[#fbf8f1]/70 p-3.5
          transition-all hover:border-[#d8b46a]/45 hover:bg-white
        "
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`
              grid h-9 w-9 shrink-0 place-items-center rounded-xl border
              ${t.icon}
            `}
          >
            <Icon className="h-4 w-4" />
          </span>

          <span className="truncate text-xs font-black text-[#123f59]">
            {label}
          </span>
        </div>

        <span
          className={`
            shrink-0 rounded-xl border px-2.5 py-1
            text-[10px] font-black
            ${t.badge}
          `}
        >
          {value}
        </span>
      </div>

      {tooltip && (
        <div
          className="
            pointer-events-none absolute right-0 top-full z-20 mt-2 hidden
            w-72 rounded-2xl border border-[#d8b46a]/30
            bg-white p-3 text-[10px] font-bold leading-5 text-[#64748b]
            shadow-[0_18px_45px_rgba(18,63,89,0.16)]
            group-hover:block
          "
        >
          <div className="mb-1 flex items-center gap-1.5 text-[#123f59]">
            <Sparkles className="h-3.5 w-3.5 text-[#c5983c]" />
            <span className="font-black">معلومة AI</span>
          </div>
          {tooltip}
        </div>
      )}
    </div>
  );
};

const getTone = (tone) => {
  const tones = {
    emerald: {
      text: "text-emerald-700",
      border: "border-emerald-200",
      line: "bg-emerald-400",
      icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    cyan: {
      text: "text-cyan-800",
      border: "border-cyan-200",
      line: "bg-cyan-400",
      icon: "border-cyan-200 bg-cyan-50 text-cyan-800",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-800",
    },
    blue: {
      text: "text-blue-700",
      border: "border-blue-200",
      line: "bg-blue-400",
      icon: "border-blue-200 bg-blue-50 text-blue-700",
      badge: "border-blue-200 bg-blue-50 text-blue-700",
    },
    amber: {
      text: "text-amber-700",
      border: "border-amber-200",
      line: "bg-amber-400",
      icon: "border-amber-200 bg-amber-50 text-amber-700",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    },
    rose: {
      text: "text-rose-700",
      border: "border-rose-200",
      line: "bg-rose-400",
      icon: "border-rose-200 bg-rose-50 text-rose-700",
      badge: "border-rose-200 bg-rose-50 text-rose-700",
    },
    purple: {
      text: "text-purple-700",
      border: "border-purple-200",
      line: "bg-purple-400",
      icon: "border-purple-200 bg-purple-50 text-purple-700",
      badge: "border-purple-200 bg-purple-50 text-purple-700",
    },
    sky: {
      text: "text-sky-700",
      border: "border-sky-200",
      line: "bg-sky-400",
      icon: "border-sky-200 bg-sky-50 text-sky-700",
      badge: "border-sky-200 bg-sky-50 text-sky-700",
    },
    slate: {
      text: "text-slate-700",
      border: "border-slate-200",
      line: "bg-slate-400",
      icon: "border-slate-200 bg-slate-100 text-slate-700",
      badge: "border-slate-200 bg-slate-100 text-slate-700",
    },
    dark: {
      text: "text-[#123f59]",
      border: "border-[#d8b46a]/30",
      line: "bg-[#c5983c]",
      icon: "border-[#d8b46a]/35 bg-[#f8efe0] text-[#123f59]",
      badge: "border-[#d8b46a]/35 bg-[#f8efe0] text-[#123f59]",
    },
  };

  return tones[tone] || tones.emerald;
};