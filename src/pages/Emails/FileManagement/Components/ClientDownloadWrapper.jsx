import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import ExternalDownloadPage from "./ExternalDownloadPage";
import {
  Loader2,
  AlertTriangle,
  Download,
  ShieldCheck,
  FileX,
} from "lucide-react";

export default function ClientDownloadWrapper() {
  const { shortLink } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-send-link", shortLink],
    queryFn: async () => {
      const res = await api.get(`/transfer-center/verify/send/${shortLink}`);
      return res.data;
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <PageShell>
        <StatusCard
          tone="emerald"
          icon={Loader2}
          iconClassName="animate-spin"
          title="جاري تجهيز الملفات..."
          message="يتم الآن التحقق من الرابط وفك تشفير بيانات الحزمة المرسلة بشكل آمن."
          badge="تحميل آمن"
        />
      </PageShell>
    );
  }

  if (isError || !data?.success) {
    return (
      <PageShell>
        <StatusCard
          tone="rose"
          icon={AlertTriangle}
          title="رابط غير صالح"
          message="عذراً، هذا الرابط غير صحيح أو تم سحب صلاحيته من قبل المرسل."
          badge="غير متاح"
        />
      </PageShell>
    );
  }

  const files =
    typeof data.data?.filesData === "string"
      ? JSON.parse(data.data.filesData || "[]")
      : data.data?.filesData || [];

  const combinedConfig = {
    ...data.config,
    ...data.data,
    files,
    isPreview: false,
  };

  return <ExternalDownloadPage config={combinedConfig} />;
}

const PageShell = ({ children }) => (
  <div
    className="
      relative flex min-h-screen w-full items-center justify-center
      overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
      p-4 font-[Tajawal]
    "
    dir="rtl"
  >
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-[-140px] top-[-140px] h-96 w-96 rounded-full bg-[#123f59]/10 blur-3xl" />
      <div className="absolute left-[-140px] bottom-[-140px] h-96 w-96 rounded-full bg-[#c5983c]/16 blur-3xl" />
      <div className="absolute left-[22%] top-[18%] h-52 w-52 rounded-full bg-emerald-400/10 blur-3xl" />
    </div>

    {children}
  </div>
);

const StatusCard = ({
  icon: Icon,
  title,
  message,
  badge,
  tone = "emerald",
  iconClassName = "",
}) => {
  const tones = {
    emerald: {
      cardBorder: "border-emerald-200",
      iconBg: "from-emerald-600 to-emerald-500",
      iconText: "text-white",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      accent: "bg-emerald-400",
      smallIcon: Download,
    },
    rose: {
      cardBorder: "border-rose-200",
      iconBg: "from-rose-600 to-rose-500",
      iconText: "text-white",
      badge: "border-rose-200 bg-rose-50 text-rose-700",
      accent: "bg-rose-400",
      smallIcon: FileX,
    },
  };

  const t = tones[tone] || tones.emerald;
  const SmallIcon = t.smallIcon;

  return (
    <div
      className={`
        relative z-10 w-full max-w-md overflow-hidden rounded-[32px]
        border ${t.cardBorder}
        bg-white/88 p-8 text-center
        shadow-[0_30px_90px_rgba(18,63,89,0.18)]
        backdrop-blur-xl
      `}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbf8f1]/70 via-white/45 to-[#eef7f6]/70" />
        <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-[#123f59]/10 blur-3xl" />
        <div className="absolute left-[-60px] bottom-[-60px] h-40 w-40 rounded-full bg-[#c5983c]/18 blur-3xl" />
      </div>

      <div className="relative z-10">
        <div
          className={`
            mx-auto mb-5 grid h-20 w-20 place-items-center
            rounded-[28px] bg-gradient-to-br ${t.iconBg}
            shadow-[0_16px_34px_rgba(18,63,89,0.22)]
          `}
        >
          <Icon className={`h-10 w-10 ${t.iconText} ${iconClassName}`} />
        </div>

        <div
          className={`
            mx-auto mb-4 inline-flex items-center gap-1.5
            rounded-2xl border px-3 py-1.5 text-[10px] font-black
            ${t.badge}
          `}
        >
          <SmallIcon className="h-3.5 w-3.5" />
          {badge}
        </div>

        <h1 className="mb-2 text-2xl font-black text-[#123f59]">
          {title}
        </h1>

        <p className="mx-auto max-w-sm text-sm font-bold leading-7 text-[#64748b]">
          {message}
        </p>

        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-[#94a3b8]">
          <ShieldCheck className="h-4 w-4 text-[#c5983c]" />
          نظام مشاركة ملفات آمن
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 h-1.5 ${t.accent}`}
      />
    </div>
  );
};