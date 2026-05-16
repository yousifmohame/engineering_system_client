import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
  User,
  Phone,
  Mail,
  ShieldCheck,
  FileUp,
  Info,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";

export default function ClientUploadPage() {
  const { shortLink } = useParams();

  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const res = await api.get(`/file-requests/verify/${shortLink}`);

        if (res.data?.success) {
          setRequestData(res.data.data);
        }
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message ||
            "حدث خطأ غير معروف، يرجى المحاولة لاحقاً.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkDetails();
  }, [shortLink]);

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";

    const mb = bytes / (1024 * 1024);

    if (mb >= 1) return `${mb.toFixed(2)} MB`;

    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile) {
      const maxSizeBytes = requestData.maxSizeMB * 1024 * 1024;

      if (selectedFile.size > maxSizeBytes) {
        toast.error(
          `حجم الملف يتجاوز الحد الأقصى المسموح به (${requestData.maxSizeMB}MB)`,
        );
        setFile(null);
        e.target.value = null;
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return toast.error("يرجى اختيار ملف أولاً");

    setIsUploading(true);

    const data = new FormData();
    data.append("file", file);

    if (requestData.reqSenderName) {
      data.append("senderName", formData.senderName);
    }

    if (requestData.reqSenderPhone) {
      data.append("senderPhone", formData.senderPhone);
    }

    data.append("senderEmail", formData.senderEmail);

    try {
      const res = await api.post(`/file-requests/upload/${shortLink}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setIsSuccess(true);
        toast.success("تم إرسال الملف بنجاح");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "حدث خطأ. قد يكون الرابط منتهي الصلاحية.";

      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <PageShell>
        <StatusCard
          tone="blue"
          icon={Loader2}
          iconClassName="animate-spin"
          title="جاري التحقق من الرابط..."
          message="يرجى الانتظار لحظات حتى يتم التأكد من صلاحية رابط رفع الملف."
        />
      </PageShell>
    );
  }

  if (errorMsg) {
    return (
      <PageShell>
        <StatusCard
          tone="red"
          icon={XCircle}
          title="الرابط غير متاح"
          message={errorMsg}
        />
      </PageShell>
    );
  }

  if (isSuccess) {
    return (
      <PageShell>
        <StatusCard
          tone="emerald"
          icon={CheckCircle}
          title="شكراً لكم، تم الاستلام"
          message="تم رفع الملف وفحصه أمنياً بنجاح. سيقوم الفريق المختص بمراجعته قريباً."
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div
        className="
          relative z-10 w-full max-w-3xl overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white/88 shadow-[0_30px_90px_rgba(18,63,89,0.20)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            relative overflow-hidden
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-6 text-white sm:px-8 sm:py-8
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  grid h-14 w-14 shrink-0 place-items-center
                  rounded-3xl border border-[#e2bf74]/35
                  bg-white/12 text-[#e2bf74]
                  shadow-[0_16px_34px_rgba(0,0,0,0.22)]
                "
              >
                <UploadCloud className="h-7 w-7" />
              </div>

              <div className="min-w-0">
                <p className="mb-1 text-[11px] font-black text-[#e2bf74]">
                  منصة رفع الملفات الآمنة
                </p>

                <h1 className="line-clamp-2 text-lg font-black leading-8 sm:text-2xl">
                  {requestData.title}
                </h1>
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
              فحص أمني قبل الإدخال
            </div>
          </div>

          {requestData.description && (
            <div
              className="
                relative z-10 mt-5 rounded-2xl border border-white/15
                bg-white/10 px-4 py-3 text-sm font-bold leading-7
                text-white/82 backdrop-blur-md
              "
            >
              {requestData.description}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-8">
          <div
            className="
              flex items-start gap-3 rounded-2xl
              border border-cyan-700/20 bg-cyan-50/80
              p-4 text-cyan-900
            "
          >
            <div
              className="
                grid h-10 w-10 shrink-0 place-items-center
                rounded-2xl bg-white text-cyan-800 shadow-sm
              "
            >
              <Info className="h-5 w-5" />
            </div>

            <div>
              <p className="text-xs font-black">تنبيه أمني</p>
              <p className="mt-1 text-xs font-bold leading-6 text-cyan-900/80">
                أمانكم يهمنا: جميع الملفات يتم فحصها عبر نظام الحماية من
                الفيروسات قبل دخولها للنظام.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {requestData.reqSenderName && (
              <FormField
                label="الاسم الكامل"
                icon={User}
                required
                className="sm:col-span-2"
              >
                <input
                  required
                  type="text"
                  value={formData.senderName}
                  onChange={(e) =>
                    setFormData({ ...formData, senderName: e.target.value })
                  }
                  className={INPUT_CLASS}
                  placeholder="أدخل اسمك الثلاثي"
                />
              </FormField>
            )}

            {requestData.reqSenderPhone && (
              <FormField label="رقم الجوال" icon={Phone} required>
                <input
                  required
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, senderPhone: e.target.value })
                  }
                  className={INPUT_CLASS}
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </FormField>
            )}

            <FormField
              label="البريد الإلكتروني"
              icon={Mail}
              hint="اختياري"
              className={!requestData.reqSenderPhone ? "sm:col-span-2" : ""}
            >
              <input
                type="email"
                value={formData.senderEmail}
                onChange={(e) =>
                  setFormData({ ...formData, senderEmail: e.target.value })
                }
                className={INPUT_CLASS}
                placeholder="name@example.com"
                dir="ltr"
              />
            </FormField>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <label className="text-xs font-black text-[#123f59]">
                اختيار الملف
              </label>

              <span
                className="
                  rounded-full border border-[#d8b46a]/30
                  bg-[#f8efe0] px-3 py-1
                  text-[10px] font-black text-[#9a6b16]
                "
              >
                الحد الأقصى {requestData.maxSizeMB}MB
              </span>
            </div>

            <label
              className={`
                group relative flex min-h-[170px] w-full cursor-pointer
                flex-col items-center justify-center overflow-hidden
                rounded-[28px] border-2 border-dashed p-5 text-center
                transition-all duration-300
                ${
                  file
                    ? "border-emerald-400 bg-emerald-50/80"
                    : "border-[#d8b46a]/45 bg-[#fbf8f1]/70 hover:border-[#c5983c] hover:bg-[#f8efe0]/80"
                }
              `}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/45 via-transparent to-[#e8f0ef]/40" />

              <div
                className={`
                  relative z-10 mb-3 grid h-16 w-16 place-items-center
                  rounded-3xl border shadow-sm transition-transform
                  group-hover:scale-105
                  ${
                    file
                      ? "border-emerald-300 bg-white text-emerald-600"
                      : "border-[#d8b46a]/35 bg-white text-[#c5983c]"
                  }
                `}
              >
                {file ? (
                  <FileText className="h-8 w-8" />
                ) : (
                  <FileUp className="h-8 w-8" />
                )}
              </div>

              <p className="relative z-10 max-w-full truncate px-4 text-sm font-black text-[#123f59]">
                {file ? file.name : "اسحب الملف هنا أو اضغط للاختيار"}
              </p>

              <p className="relative z-10 mt-1 text-[11px] font-bold text-[#64748b]">
                {file
                  ? `الحجم: ${formatFileSize(file.size)}`
                  : `PDF, JPG, PNG فقط`}
              </p>

              <input
                type="file"
                required
                className="hidden"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className="
              flex w-full items-center justify-center gap-2
              rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
              px-5 py-4 text-sm font-black text-white
              shadow-[0_16px_34px_rgba(18,63,89,0.22)]
              transition-all hover:-translate-y-[1px]
              hover:shadow-[0_20px_40px_rgba(18,63,89,0.28)]
              disabled:cursor-not-allowed disabled:opacity-55
              disabled:hover:translate-y-0
            "
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#e2bf74]" />
            ) : (
              <UploadCloud className="h-6 w-6 text-[#e2bf74]" />
            )}

            {isUploading ? "جاري الفحص والرفع..." : "تأكيد وإرسال الوثيقة"}
          </button>
        </form>
      </div>
    </PageShell>
  );
}

const PageShell = ({ children }) => (
  <div
    className="
      relative flex min-h-screen items-center justify-center overflow-hidden
      bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
      p-4 font-[Tajawal]
    "
    dir="rtl"
  >
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute right-[-120px] top-[-120px] h-80 w-80 rounded-full bg-[#123f59]/10 blur-3xl" />
      <div className="absolute left-[-120px] bottom-[-120px] h-80 w-80 rounded-full bg-[#c5983c]/16 blur-3xl" />
      <div className="absolute left-[20%] top-[15%] h-44 w-44 rounded-full bg-emerald-400/10 blur-3xl" />
    </div>

    {children}
  </div>
);

const StatusCard = ({
  icon: Icon,
  title,
  message,
  tone = "blue",
  iconClassName = "",
}) => {
  const tones = {
    blue: {
      border: "border-cyan-700/20",
      bg: "from-cyan-50 via-white to-[#fbf8f1]",
      iconBg: "from-[#123f59] to-[#0e7490]",
      iconText: "text-[#e2bf74]",
    },
    red: {
      border: "border-rose-200",
      bg: "from-rose-50 via-white to-[#fbf8f1]",
      iconBg: "from-rose-600 to-rose-500",
      iconText: "text-white",
    },
    emerald: {
      border: "border-emerald-200",
      bg: "from-emerald-50 via-white to-[#fbf8f1]",
      iconBg: "from-emerald-600 to-emerald-500",
      iconText: "text-white",
    },
  };

  const t = tones[tone] || tones.blue;

  return (
    <div
      className={`
        relative z-10 w-full max-w-md rounded-[32px]
        border ${t.border}
        bg-gradient-to-br ${t.bg}
        p-8 text-center shadow-[0_24px_70px_rgba(18,63,89,0.16)]
      `}
    >
      <div
        className={`
          mx-auto mb-5 grid h-20 w-20 place-items-center
          rounded-[28px] bg-gradient-to-br ${t.iconBg}
          shadow-[0_16px_34px_rgba(18,63,89,0.22)]
        `}
      >
        <Icon className={`h-10 w-10 ${t.iconText} ${iconClassName}`} />
      </div>

      <h2 className="mb-2 text-xl font-black text-[#123f59]">
        {title}
      </h2>

      <p className="text-sm font-bold leading-7 text-[#64748b]">
        {message}
      </p>
    </div>
  );
};

const FormField = ({
  label,
  icon: Icon,
  hint,
  required,
  children,
  className = "",
}) => (
  <div className={className}>
    <div className="mb-2 flex items-center justify-between gap-2">
      <label className="flex items-center gap-2 text-xs font-black text-[#123f59]">
        {Icon && (
          <span className="grid h-7 w-7 place-items-center rounded-xl bg-[#f8efe0] text-[#c5983c]">
            <Icon className="h-3.5 w-3.5" />
          </span>
        )}

        {label}

        {required && <span className="text-rose-500">*</span>}
      </label>

      {hint && (
        <span className="text-[10px] font-black text-[#94a3b8]">
          {hint}
        </span>
      )}
    </div>

    {children}
  </div>
);

const INPUT_CLASS = `
  w-full rounded-2xl border border-[#d8b46a]/25
  bg-white px-4 py-3.5 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4
  focus:ring-[#c5983c]/10
`;
