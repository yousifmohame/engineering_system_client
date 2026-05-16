import React, { useState, useEffect } from "react";
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Link as LinkIcon,
  Building2,
  X,
  FileText,
  Sparkles,
  ShieldCheck,
  PencilLine,
  ExternalLink,
} from "lucide-react";

export function FileAnalysisPanel({ file, onClose, onApprove }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // Fake AI Processing Delay
  useEffect(() => {
    setLoading(true);

    const timer = setTimeout(() => {
      setResult({
        expectedType: "مخطط إنشائي (PDF)",
        relatedEntity: "مكتب الرؤية للتصميم",
        issueDate: "2026-04-10",
        expiryDate: "لا يوجد",
        referenceNumber: "STR-2026-092",
        isOfficial: true,
        isMissingInfo: false,
        reviewNotes: "الملف مطابق للاشتراطات الفنية ولا يحتوي على صفحات فارغة.",
        linkageSuggestions: ["معاملة #1024 - فيلا سكنية بحي الملقا"],
      });

      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [file]);

  if (loading) {
    return (
      <div
        className="
          relative w-full max-w-sm overflow-hidden rounded-[30px]
          border border-[#d8b46a]/35 bg-white/92
          p-8 text-center shadow-[0_28px_80px_rgba(18,63,89,0.18)]
          backdrop-blur-xl
        "
        dir="rtl"
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-60px] top-[-60px] h-36 w-36 rounded-full bg-[#123f59]/12 blur-3xl" />
          <div className="absolute left-[-60px] bottom-[-60px] h-36 w-36 rounded-full bg-[#c5983c]/18 blur-3xl" />
        </div>

        <div className="relative z-10 space-y-5">
          <div className="relative mx-auto h-20 w-20">
            <div className="absolute inset-0 rounded-[28px] border-4 border-[#d8b46a]/25 animate-ping" />
            <div
              className="
                absolute inset-2 grid place-items-center rounded-[24px]
                bg-gradient-to-br from-[#06111d] via-[#123f59] to-[#0e7490]
                text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.24)]
              "
            >
              <FileSearch className="h-8 w-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-black text-[#123f59]">
              جاري التحليل الشامل للملف...
            </h3>

            <p className="mt-2 text-sm font-bold leading-7 text-[#64748b]">
              يتم استخراج البيانات والتحقق من التواريخ والمراجع وربطها بالمعاملات.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div
      className="
        relative w-full max-w-2xl overflow-hidden rounded-[30px]
        border border-[#d8b46a]/35 bg-white/94
        shadow-[0_30px_90px_rgba(18,63,89,0.22)]
        backdrop-blur-xl
      "
      dir="rtl"
    >
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-85px] top-[-85px] h-52 w-52 rounded-full bg-[#123f59]/12 blur-3xl" />
        <div className="absolute left-[-85px] bottom-[-85px] h-52 w-52 rounded-full bg-[#c5983c]/18 blur-3xl" />
      </div>

      {/* Header */}
      <div
        className="
          relative overflow-hidden border-b border-[#d8b46a]/25
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-60px] top-[-60px] h-36 w-36 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-60px] bottom-[-60px] h-36 w-36 rounded-full bg-emerald-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center rounded-2xl
                border border-[#e2bf74]/35 bg-white/12
                text-[#e2bf74] shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Sparkles className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black">
                نتائج التحليل الذكي
              </h2>

              <p className="mt-0.5 truncate text-xs font-bold text-white/65">
                {file?.name || "ملف مستند"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="
              flex min-w-[54px] flex-col items-center justify-center gap-0.5
              rounded-xl border border-white/15 bg-white/10
              px-2 py-1 text-[8px] font-black leading-none text-white
              transition hover:bg-red-500/30
            "
            title="إغلاق"
            type="button"
          >
            <X className="h-4 w-4" />
            <span>إغلاق</span>
          </button>
        </div>
      </div>

      <div className="relative z-10 space-y-4 p-5">
        {/* Core Info */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <InfoCard
            icon={FileText}
            label="النوع المتوقع"
            value={result.expectedType}
            tone="cyan"
          />

          <InfoCard
            icon={Building2}
            label="الجهة المصدرة / المرتبطة"
            value={result.relatedEntity}
            tone="emerald"
          />
        </div>

        {/* Dates & Refs */}
        <div
          className="
            rounded-[24px] border border-[#d8b46a]/25
            bg-gradient-to-br from-[#fbf8f1] via-white to-[#eef7f6]
            p-4 shadow-[0_12px_30px_rgba(18,63,89,0.06)]
          "
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <MetaRow
              icon={Calendar}
              label="تاريخ الإصدار"
              value={result.issueDate}
            />

            <MetaRow
              icon={Calendar}
              label="تاريخ الانتهاء"
              value={result.expiryDate}
              danger={result.expiryDate !== "لا يوجد"}
            />
          </div>

          <div className="my-3 border-t border-[#e8ddc8]" />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-black text-[#64748b]">
              الرقم المرجعي المستخرج
            </span>

            <span
              className="
                inline-flex w-fit items-center gap-1.5 rounded-xl
                border border-[#d8b46a]/30 bg-white px-3 py-1.5
                font-mono text-xs font-black tracking-wider text-[#123f59]
              "
            >
              {result.referenceNumber}
            </span>
          </div>
        </div>

        {/* Status flags */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <StatusBadge
            active={result.isOfficial}
            activeText="وثيقة رسمية خارجية"
            inactiveText="مستند داخلي"
            tone="cyan"
          />

          <StatusBadge
            active={!result.isMissingInfo}
            activeText="مكتمل البيانات"
            inactiveText="ينقصه بيانات أساسية"
            tone={result.isMissingInfo ? "amber" : "emerald"}
          />
        </div>

        {/* Linkage Suggestions */}
        {result.linkageSuggestions && result.linkageSuggestions.length > 0 && (
          <div
            className="
              flex items-start gap-3 rounded-[22px]
              border border-cyan-200 bg-cyan-50/85
              p-4 text-cyan-900
            "
          >
            <span
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-2xl bg-white text-cyan-800 shadow-sm
              "
            >
              <LinkIcon className="h-5 w-5" />
            </span>

            <div className="min-w-0">
              <p className="mb-1 text-xs font-black">
                اقتراح ربط بمعاملات قائمة
              </p>

              {result.linkageSuggestions.map((ls, i) => (
                <button
                  key={i}
                  className="
                    flex max-w-full items-center gap-1.5 truncate
                    text-right text-xs font-black text-cyan-700
                    underline-offset-4 hover:text-cyan-900 hover:underline
                  "
                  type="button"
                >
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{ls}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {result.reviewNotes && (
          <div
            className="
              flex items-start gap-3 rounded-[22px]
              border border-amber-200 bg-amber-50/90
              p-4 text-amber-900
            "
          >
            <span
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-2xl bg-white text-amber-700 shadow-sm
              "
            >
              <AlertCircle className="h-5 w-5" />
            </span>

            <div>
              <p className="text-xs font-black">ملاحظات الفحص الآلي</p>
              <p className="mt-1 text-xs font-bold leading-6 text-amber-800/90">
                {result.reviewNotes}
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col-reverse gap-2 border-t border-[#e8ddc8] pt-4 sm:flex-row sm:items-center sm:justify-end">
          <ActionButton tone="light" onClick={onClose}>
            <X className="h-4 w-4" />
            تجاهل
          </ActionButton>

          <ActionButton tone="outline">
            <PencilLine className="h-4 w-4" />
            تعديل الاستخراج
          </ActionButton>

          <ActionButton
            tone="primary"
            onClick={() => {
              onApprove(result);
              onClose();
            }}
          >
            <CheckCircle2 className="h-4 w-4 text-[#e2bf74]" />
            اعتماد وربط
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

const InfoCard = ({ icon: Icon, label, value, tone = "cyan" }) => {
  const tones = {
    cyan: "bg-cyan-50 text-cyan-800 border-cyan-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
  };

  return (
    <div
      className={`
        rounded-[22px] border p-4
        ${tones[tone] || tones.cyan}
      `}
    >
      <span className="mb-2 block text-[10px] font-black uppercase opacity-70">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="truncate text-sm font-black">{value}</span>
      </div>
    </div>
  );
};

const MetaRow = ({ icon: Icon, label, value, danger = false }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/70 px-3 py-2">
    <div className="flex items-center gap-2 text-xs font-black text-[#64748b]">
      <Icon className={`h-4 w-4 ${danger ? "text-rose-500" : "text-[#c5983c]"}`} />
      {label}
    </div>

    <span
      className={`font-mono text-xs font-black ${
        danger ? "text-rose-600" : "text-[#123f59]"
      }`}
    >
      {value}
    </span>
  </div>
);

const StatusBadge = ({ active, activeText, inactiveText, tone = "emerald" }) => {
  const tones = {
    emerald: active
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700",
    cyan: active
      ? "border-cyan-200 bg-cyan-50 text-cyan-800"
      : "border-slate-200 bg-slate-100 text-slate-600",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <span
      className={`
        flex items-center justify-center gap-1.5 rounded-2xl
        border px-3 py-2 text-[11px] font-black
        ${tones[tone] || tones.emerald}
      `}
    >
      <ShieldCheck className="h-3.5 w-3.5" />
      {active ? activeText : inactiveText}
    </span>
  );
};

const ActionButton = ({ children, onClick, tone = "light" }) => {
  const tones = {
    light:
      "border-[#d8b46a]/30 bg-white text-[#64748b] hover:bg-[#f8efe0] hover:text-[#123f59]",
    outline:
      "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
    primary:
      "border-[#d8b46a]/40 bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] text-white shadow-[0_14px_30px_rgba(18,63,89,0.22)] hover:-translate-y-[1px]",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex h-10 items-center justify-center gap-2 rounded-2xl
        border px-4 text-xs font-black transition-all
        ${tones[tone] || tones.light}
      `}
      type="button"
    >
      {children}
    </button>
  );
};
