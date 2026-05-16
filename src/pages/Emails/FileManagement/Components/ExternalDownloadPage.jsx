import React, { useState, useEffect } from "react";
import {
  Building,
  Download,
  FileText,
  Lock,
  Clock,
  Shield,
  Mail,
  Phone,
  Eye,
  AlertCircle,
  FileArchive,
  FileImage,
  FileVideo,
  File,
  Loader2,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  PackageCheck,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  let fixedUrl = url;

  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }

  const baseUrl = "https://details-worksystem1.com";

  return `${baseUrl}${fixedUrl}`;
};

export default function ExternalDownloadPage({ config = {} }) {
  const [internalStatus, setInternalStatus] = useState(
    config.status || "active",
  );
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [downloading, setDownloading] = useState(null);

  const files = Array.isArray(config.files) ? config.files : [];

  const brandColor = config.brandColor || "#123f59";
  const brandStyle = { color: brandColor };
  const brandBgStyle = { backgroundColor: brandColor };

  useEffect(() => {
    if (config.isPreview) {
      setInternalStatus(config.status || "active");
    }
  }, [config.status, config.isPreview]);

  useEffect(() => {
    if (config.directDownloadMode && internalStatus === "active") {
      setDownloading("all");

      const timer = setTimeout(() => {
        if (!config.isPreview && files.length > 0) {
          files.forEach((file, index) => {
            handleRealDownload(file, file.id || index);
          });
        }

        setDownloading(null);
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [config.directDownloadMode, internalStatus, config.files, config.isPreview]);

  const handlePinSubmit = (e) => {
    e.preventDefault();

    if (pin === config.pinCode || config.isPreview) {
      setInternalStatus("active");
      return;
    }

    setPinError(true);
    setTimeout(() => setPinError(false), 2000);
  };

  const getFileIcon = (type) => {
    if (!type) return <File className="h-6 w-6" />;

    const fileType = type.toLowerCase();

    if (fileType.includes("pdf")) return <FileText className="h-6 w-6" />;
    if (
      fileType.includes("image") ||
      fileType.includes("png") ||
      fileType.includes("jpg") ||
      fileType.includes("jpeg")
    ) {
      return <FileImage className="h-6 w-6" />;
    }

    if (fileType.includes("video") || fileType.includes("mp4")) {
      return <FileVideo className="h-6 w-6" />;
    }

    if (
      fileType.includes("zip") ||
      fileType.includes("rar") ||
      fileType.includes("archive")
    ) {
      return <FileArchive className="h-6 w-6" />;
    }

    return <File className="h-6 w-6" />;
  };

  const handleRealDownload = (file, downloadKey = file.id) => {
    if (config.isPreview) {
      toast.info("هذه مجرد معاينة، لا يوجد ملف حقيقي للتنزيل");
      return;
    }

    setDownloading(downloadKey);

    try {
      const fileUrl = getFullUrl(file.url || file.filePath);

      if (!fileUrl) {
        toast.error("رابط الملف غير متوفر");
        return;
      }

      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = file.name || file.fileName || "document";
      link.target = "_blank";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("حدث خطأ أثناء محاولة تنزيل الملف");
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  const handleRealView = (file) => {
    if (config.isPreview) {
      toast.info("هذه مجرد معاينة، لا يوجد ملف حقيقي للعرض");
      return;
    }

    const fileUrl = getFullUrl(file.url || file.filePath);

    if (fileUrl) {
      window.open(fileUrl, "_blank");
      return;
    }

    toast.error("رابط الملف غير متوفر");
  };

  const handleWhatsApp = () => {
    if (config.isPreview) return;

    const msg = encodeURIComponent(
      config.whatsAppMessage || `مرحباً، بخصوص الحزمة: ${config.title}`,
    );

    window.open(
      `https://wa.me/${(config.contactPhone || "").replace(/\D/g, "")}?text=${msg}`,
    );
  };

  const handleEmail = () => {
    if (config.isPreview) return;

    const subject = encodeURIComponent(`استفسار بخصوص: ${config.title}`);
    const body = encodeURIComponent(
      config.emailMessage || "لدي استفسار بخصوص الحزمة المرسلة.",
    );

    window.open(`mailto:${config.contactEmail}?subject=${subject}&body=${body}`);
  };

  const handleSMS = () => {
    if (config.isPreview) return;

    const msg = encodeURIComponent(
      config.smsMessage || `بخصوص رقم المرجع: ${config.title}`,
    );

    window.open(`sms:${config.contactPhone}?body=${msg}`);
  };

  if (internalStatus === "expired" || internalStatus === "revoked") {
    return (
      <PageShell>
        <StatusCard
          tone="rose"
          icon={Clock}
          title={
            internalStatus === "expired"
              ? "انتهت صلاحية الرابط"
              : "تم سحب صلاحية الرابط"
          }
          message="عذراً، هذا الرابط لم يعد متاحاً لعرض أو تحميل الملفات. يرجى التواصل مع الجهة المرسلة."
          companyName={config.companyName}
        />
      </PageShell>
    );
  }

  if (internalStatus === "pin-required") {
    return (
      <PageShell>
        <div
          className="
            relative z-10 w-full max-w-md overflow-hidden rounded-[32px]
            border border-[#d8b46a]/35 bg-white/90
            p-8 text-center shadow-[0_30px_90px_rgba(18,63,89,0.18)]
            backdrop-blur-xl
          "
          dir="rtl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#fbf8f1]/75 via-white/55 to-[#eef7f6]/75" />
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#123f59]/12 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div
              className="
                mx-auto mb-5 grid h-20 w-20 place-items-center
                rounded-[28px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
                text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.22)]
              "
            >
              <Lock className="h-10 w-10" />
            </div>

            <div
              className="
                mx-auto mb-4 inline-flex items-center gap-1.5
                rounded-2xl border border-[#d8b46a]/35
                bg-[#f8efe0] px-3 py-1.5
                text-[10px] font-black text-[#9a6b16]
              "
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              رابط محمي
            </div>

            <h1 className="mb-2 text-2xl font-black text-[#123f59]">
              الرابط محمي برمز مرور
            </h1>

            <p className="mx-auto mb-7 max-w-sm text-sm font-bold leading-7 text-[#64748b]">
              يرجى إدخال رمز المرور PIN المرسل لك للتمكن من الوصول إلى الملفات.
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <input
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className={`
                  w-full rounded-2xl border p-4 text-center
                  font-mono text-2xl font-black tracking-[0.35em]
                  outline-none transition-all
                  ${
                    pinError
                      ? "border-rose-300 bg-rose-50 text-rose-700 focus:ring-4 focus:ring-rose-500/10"
                      : "border-[#d8b46a]/35 bg-white text-[#123f59] focus:border-[#c5983c]/70 focus:ring-4 focus:ring-[#c5983c]/10"
                  }
                `}
              />

              {pinError && (
                <p className="text-xs font-black text-rose-500">
                  الرمز غير صحيح، حاول مرة أخرى
                </p>
              )}

              <button
                type="submit"
                className="
                  flex h-12 w-full items-center justify-center gap-2
                  rounded-2xl text-sm font-black text-white
                  shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                  transition hover:-translate-y-[1px] hover:opacity-95
                "
                style={brandBgStyle}
              >
                <Lock className="h-4 w-4 text-white/90" />
                فتح الرابط
              </button>
            </form>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <div
      className="
        min-h-full bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal] text-[#123f59]
      "
      dir="rtl"
    >
      {/* Header */}
      <header
        className="
          relative overflow-hidden border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-4 py-6 text-white shadow-[0_14px_34px_rgba(18,63,89,0.16)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-90px] top-[-90px] h-56 w-56 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-90px] bottom-[-90px] h-56 w-56 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto flex max-w-4xl items-center justify-center gap-3">
          <div
            className="
              grid h-12 w-12 shrink-0 place-items-center rounded-2xl
              border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74]
              shadow-[0_14px_30px_rgba(0,0,0,0.20)]
            "
          >
            <Building className="h-6 w-6" />
          </div>

          <div className="min-w-0 text-center">
            <p className="mb-1 text-[11px] font-black text-[#e2bf74]">
              منصة مشاركة الملفات الآمنة
            </p>

            <h2 className="truncate text-xl font-black">
              {config.companyName || "مركز الملفات"}
            </h2>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 p-4 py-8">
        {/* Intro */}
        <section
          className="
            overflow-hidden rounded-[30px]
            border border-[#d8b46a]/30 bg-white/90
            p-6 shadow-[0_18px_45px_rgba(18,63,89,0.10)]
            backdrop-blur-xl md:p-8
          "
        >
          <div className="mb-5 flex items-start gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl bg-[#f8efe0] text-[#c5983c]
              "
            >
              <PackageCheck className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1
                className="mb-3 text-2xl font-black leading-tight"
                style={brandStyle}
              >
                {config.title || "حزمة ملفات للاستلام"}
              </h1>

              {config.message && (
                <p className="whitespace-pre-wrap text-sm font-bold leading-7 text-[#64748b]">
                  {config.message}
                </p>
              )}
            </div>
          </div>

          <div
            className="
              flex items-start gap-3 rounded-2xl
              border border-cyan-200 bg-cyan-50/85
              p-4 text-cyan-900
            "
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-cyan-800" />

            <p className="text-xs font-bold leading-6">
              هذا الرابط يحتوي على ملفات مرسلة لكم.
              {config.permissions === "download" &&
                " يمكنك تحميل الملفات للرجوع إليها."}
              {config.permissions === "view" &&
                " هذه الملفات متاحة للاستعراض فقط ولا يمكن تحميلها."}
              {config.permissions === "both" &&
                " يمكنك استعراض الملفات أو تحميلها على جهازك."}
            </p>
          </div>
        </section>

        {/* Files */}
        <section
          className="
            overflow-hidden rounded-[30px]
            border border-[#d8b46a]/30 bg-white/90
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
            <div className="flex items-center gap-2">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                <FileText className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-sm font-black text-[#123f59]">
                  الملفات المرفقة
                </h3>

                <p className="text-[11px] font-bold text-[#64748b]">
                  قائمة الملفات المتاحة ضمن هذه الحزمة.
                </p>
              </div>
            </div>

            <span
              className="
                w-fit rounded-2xl border border-[#d8b46a]/30
                bg-[#f8efe0] px-3 py-1.5
                text-xs font-black text-[#9a6b16]
              "
            >
              {files.length} ملفات
            </span>
          </div>

          <div className="space-y-3 p-5">
            {files.length > 0 ? (
              files.map((file, index) => {
                const fileKey = file.id || index;
                const isDownloading = downloading === fileKey;

                return (
                  <div
                    key={fileKey}
                    className="
                      group relative overflow-hidden rounded-[24px]
                      border border-[#e8ddc8] bg-white
                      p-4 transition-all
                      hover:border-[#d8b46a]/55
                      hover:bg-[#fbf8f1]/80
                      hover:shadow-[0_16px_35px_rgba(18,63,89,0.10)]
                    "
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <div
                          className="
                            grid h-12 w-12 shrink-0 place-items-center
                            rounded-2xl bg-[#f8efe0] text-[#c5983c]
                            transition group-hover:bg-[#123f59] group-hover:text-[#e2bf74]
                          "
                        >
                          {getFileIcon(file.type)}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p
                            className="truncate text-sm font-black text-[#123f59]"
                            dir="ltr"
                            style={{ textAlign: "right" }}
                          >
                            {file.name || file.fileName || "ملف غير معروف"}
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-black text-[#64748b]">
                            {file.size && <InfoPill label={file.size} />}

                            {file.type && (
                              <InfoPill
                                label={file.type.split("/")[1] || file.type}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex w-full shrink-0 items-center gap-2 sm:w-auto">
                        {(config.permissions === "both" ||
                          config.permissions === "view") && (
                          <button
                            onClick={() => handleRealView(file)}
                            className="
                              flex h-10 flex-1 items-center justify-center gap-1.5
                              rounded-2xl border border-cyan-200 bg-cyan-50
                              px-4 text-xs font-black text-cyan-800
                              transition hover:bg-cyan-100 sm:flex-none
                            "
                            type="button"
                          >
                            <Eye className="h-4 w-4" />
                            عرض
                          </button>
                        )}

                        {(config.permissions === "both" ||
                          config.permissions === "download") && (
                          <button
                            onClick={() => handleRealDownload(file, fileKey)}
                            disabled={isDownloading}
                            className="
                              flex h-10 flex-1 items-center justify-center gap-1.5
                              rounded-2xl px-4 text-xs font-black text-white
                              shadow-[0_12px_26px_rgba(18,63,89,0.18)]
                              transition hover:-translate-y-[1px]
                              disabled:cursor-not-allowed disabled:opacity-60
                              sm:flex-none
                            "
                            style={brandBgStyle}
                            type="button"
                          >
                            {isDownloading ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                جاري...
                              </>
                            ) : (
                              <>
                                <Download className="h-4 w-4" />
                                تنزيل
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div
                className="
                  flex flex-col items-center justify-center
                  rounded-[24px] border border-dashed border-[#d8b46a]/35
                  bg-[#fbf8f1]/70 p-8 text-center
                "
              >
                <File className="mb-3 h-9 w-9 text-[#c5983c]/60" />
                <p className="text-xs font-black text-[#64748b]">
                  لا توجد ملفات مرفقة
                </p>
              </div>
            )}

            {(config.permissions === "both" ||
              config.permissions === "download") &&
              files.length > 1 && (
                <div className="border-t border-[#e8ddc8] pt-5 text-center">
                  <button
                    onClick={() => toast.info("جاري تجهيز حزمة ZIP...")}
                    className="
                      mx-auto flex h-11 w-full items-center justify-center gap-2
                      rounded-2xl border-2 bg-white px-8
                      text-sm font-black transition-all
                      hover:bg-[#fbf8f1] sm:w-auto
                    "
                    style={{
                      borderColor: brandColor,
                      color: brandColor,
                    }}
                    type="button"
                  >
                    <Download className="h-4 w-4" />
                    تنزيل كل الملفات كـ ZIP
                  </button>
                </div>
              )}
          </div>
        </section>

        {/* Disclaimer */}
        {config.showDisclaimer && config.disclaimerText && (
          <div
            className="
              flex items-start gap-3 rounded-[24px]
              border border-[#d8b46a]/30 bg-[#f8efe0]/80
              p-4 text-[#755017]
            "
          >
            <Shield className="mt-0.5 h-5 w-5 shrink-0" />

            <p className="text-[11px] font-bold leading-6">
              {config.disclaimerText}
            </p>
          </div>
        )}

        {/* Contact CTA */}
        {(config.enableWhatsApp ||
          config.enableEmailCTA ||
          config.enableEmail ||
          config.enableSms) && (
          <section
            className="
              overflow-hidden rounded-[30px]
              border border-cyan-200 bg-white/90
              p-6 text-center shadow-[0_18px_45px_rgba(18,63,89,0.08)]
              backdrop-blur-xl
            "
          >
            <div
              className="
                mx-auto mb-3 grid h-12 w-12 place-items-center
                rounded-2xl bg-cyan-50 text-cyan-800
              "
            >
              <Mail className="h-5 w-5" />
            </div>

            <h3 className="mb-2 text-sm font-black text-[#123f59]">
              هل لديك استفسار؟
            </h3>

            <p className="mb-5 text-xs font-bold text-[#64748b]">
              تواصل معنا مباشرة عبر القنوات التالية.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {config.enableWhatsApp && (
                <ContactButton
                  label="واتساب"
                  icon={MessageCircle}
                  tone="emerald"
                  onClick={handleWhatsApp}
                />
              )}

              {(config.enableEmailCTA || config.enableEmail) && (
                <ContactButton
                  label="مراسلة إلكترونية"
                  icon={Mail}
                  tone="cyan"
                  onClick={handleEmail}
                />
              )}

              {config.enableSms && (
                <ContactButton
                  label="رسالة SMS"
                  icon={Smartphone}
                  tone="blue"
                  onClick={handleSMS}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Direct download overlay */}
      {config.directDownloadMode && internalStatus === "active" && (
        <div
          className="
            fixed inset-0 z-50 flex flex-col items-center justify-center
            bg-white/85 p-4 backdrop-blur-md
          "
          dir="rtl"
        >
          <div
            className="
              mb-5 grid h-20 w-20 place-items-center rounded-[28px]
              bg-gradient-to-br from-[#123f59] to-[#0e7490]
              text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.22)]
            "
          >
            <Download className="h-9 w-9 animate-pulse" />
          </div>

          <h2 className="mb-2 text-xl font-black text-[#123f59]">
            جاري بدء التنزيل...
          </h2>

          <p className="text-sm font-bold text-[#64748b]">
            سيتم حفظ الملفات على جهازك تلقائياً.
          </p>

          {downloading === "all" && (
            <div className="mt-8 h-2 w-56 overflow-hidden rounded-full bg-[#e8ddc8]">
              <div className="h-full w-3/5 animate-pulse rounded-full bg-[#123f59]" />
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <footer
        className="
          mx-auto mb-4 mt-8 flex max-w-4xl flex-col items-center gap-3
          border-t border-[#e8ddc8] p-6 text-center
        "
      >
        <p className="text-xs font-bold text-[#64748b]">
          {config.footerText}
        </p>

        <div className="flex flex-wrap justify-center gap-4 text-xs font-bold text-[#94a3b8]">
          {config.contactEmail && (
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {config.contactEmail}
            </span>
          )}

          {config.contactPhone && (
            <span className="flex items-center gap-1" dir="ltr">
              <Phone className="h-3 w-3" />
              {config.contactPhone}
            </span>
          )}
        </div>
      </footer>
    </div>
  );
}

const PageShell = ({ children }) => (
  <div
    className="
      relative flex min-h-full items-center justify-center
      overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
      p-4 py-12 font-[Tajawal]
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

const StatusCard = ({ icon: Icon, title, message, companyName, tone }) => {
  const isRose = tone === "rose";

  return (
    <div
      className={`
        relative z-10 w-full max-w-md overflow-hidden rounded-[32px]
        border ${isRose ? "border-rose-200" : "border-[#d8b46a]/35"}
        bg-white/90 p-8 text-center
        shadow-[0_30px_90px_rgba(18,63,89,0.18)]
        backdrop-blur-xl
      `}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbf8f1]/70 via-white/45 to-[#eef7f6]/70" />
      </div>

      <div className="relative z-10">
        <div
          className={`
            mx-auto mb-5 grid h-20 w-20 place-items-center
            rounded-[28px] text-white
            shadow-[0_16px_34px_rgba(18,63,89,0.22)]
            ${
              isRose
                ? "bg-gradient-to-br from-rose-600 to-rose-500"
                : "bg-gradient-to-br from-[#123f59] to-[#0e7490]"
            }
          `}
        >
          <Icon className="h-10 w-10" />
        </div>

        <h1 className="mb-3 text-2xl font-black text-[#123f59]">
          {title}
        </h1>

        <p className="mx-auto mb-7 max-w-sm text-sm font-bold leading-7 text-[#64748b]">
          {message}
        </p>

        <div
          className="
            flex items-center justify-center gap-2
            border-t border-[#e8ddc8] pt-5
            text-xs font-black text-[#94a3b8]
          "
        >
          <Building className="h-4 w-4 text-[#c5983c]" />
          {companyName || "الجهة المرسلة"}
        </div>
      </div>
    </div>
  );
};

const InfoPill = ({ label }) => (
  <span
    className="
      rounded-xl border border-[#e8ddc8]
      bg-[#fbf8f1] px-2.5 py-1
      text-[#64748b]
    "
  >
    {label}
  </span>
);

const ContactButton = ({ label, icon: Icon, tone = "cyan", onClick }) => {
  const tones = {
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex h-10 items-center gap-2 rounded-2xl
        border px-4 text-xs font-black
        transition hover:-translate-y-[1px]
        ${tones[tone] || tones.cyan}
      `}
      type="button"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
};