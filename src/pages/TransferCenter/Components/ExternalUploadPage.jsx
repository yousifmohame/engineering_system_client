import React, { useState, useRef, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertTriangle,
  Send,
  Shield,
  Lock,
  Clock,
  Building,
  Mail,
  Phone,
  Info,
  Trash2,
  File,
  ArrowRight,
  Loader2,
  MessageCircle,
  Smartphone,
  ShieldCheck,
  User,
  AtSign,
  MessageSquare,
  ScanLine,
  ShieldAlert,
} from "lucide-react";

export default function ExternalUploadPage({ config = {} }) {
  const [internalStatus, setInternalStatus] = useState(
    config.status || "active",
  );
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);

  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false); // حالة الإرسال النهائي

  const [senderData, setSenderData] = useState({
    senderName: "",
    senderMobile: "",
    senderEmail: "",
    senderNote: "",
  });

  const fileInputRef = useRef(null);

  const brandColor = config.brandColor || "#123f59";
  const brandStyle = { color: brandColor };
  const brandBgStyle = { backgroundColor: brandColor };

  const maxFiles = config.maxFiles || 10;
  const maxFileSize = config.maxFileSize || 50;

  const reqSenderMobile = config.reqSenderMobile || config.reqSenderPhone;

  useEffect(() => {
    if (config.isPreview) {
      setInternalStatus(config.status || "active");
    }
  }, [config.status, config.isPreview]);

  const handlePinSubmit = (e) => {
    e.preventDefault();

    if (pin === config.pinCode || config.isPreview) {
      setInternalStatus("active");
      return;
    }

    setPinError(true);
    setTimeout(() => setPinError(false), 2000);
  };

  const validateFile = (file) => {
    if (file.size > maxFileSize * 1024 * 1024) {
      return `حجم الملف يتجاوز ${maxFileSize}MB`;
    }
    return null;
  };

  // 🚀 دالة الرفع الفوري والفحص الأمني لكل ملف على حدة
  const uploadAndScanFile = async (fileObj) => {
    if (config.isPreview) {
      // محاكاة الرفع للـ Preview
      for (let i = 0; i <= 100; i += 20) {
        await new Promise((r) => setTimeout(r, 200));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileObj.id
              ? {
                  ...f,
                  progress: i,
                  status: i === 100 ? "scanning" : "uploading",
                }
              : f,
          ),
        );
      }
      await new Promise((r) => setTimeout(r, 1500)); // محاكاة الفحص الأمني
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, status: "safe", serverId: "mock-id" }
            : f,
        ),
      );
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append("file", fileObj.file);

    try {
      const res = await api.post(
        `/transfer-center/upload-temp/${config.shortLink}`,
        uploadFormData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileObj.id
                  ? {
                      ...f,
                      progress: percentCompleted,
                      status:
                        percentCompleted === 100 ? "scanning" : "uploading",
                    }
                  : f,
              ),
            );
          },
        },
      );

      // بمجرد نجاح الطلب، الملف آمن وتم حفظه مبدئياً
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id
            ? { ...f, status: "safe", serverId: res.data.data.id }
            : f,
        ),
      );
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "فشل الرفع أو اكتشاف تهديد أمني";
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileObj.id ? { ...f, status: "infected", errorMsg } : f,
        ),
      );
    }
  };

  const processFiles = (newFiles) => {
    const filesArray = Array.from(newFiles);

    if (files.length + filesArray.length > maxFiles) {
      toast.error(`عذراً، الحد الأقصى للملفات هو ${maxFiles} ملفات.`);
      return;
    }

    const newFileObjects = filesArray.map((file) => {
      const error = validateFile(file);
      return {
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: error ? "error" : "uploading",
        errorMsg: error || undefined,
        serverId: null,
      };
    });

    setFiles((prev) => [...prev, ...newFileObjects]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // 🚀 تشغيل الرفع والفحص فوراً للملفات الصالحة
    newFileObjects
      .filter((f) => f.status === "uploading")
      .forEach((f) => uploadAndScanFile(f));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  // دوال التحقق من حالات الملفات
  const hasUploadingOrScanning = files.some(
    (file) => file.status === "uploading" || file.status === "scanning",
  );
  const safeFiles = files.filter((file) => file.status === "safe");

  // 🚀 الاعتماد النهائي (تأكيد وإرسال الملفات بعد الفحص)
  const handleSubmit = async () => {
    if (safeFiles.length === 0) {
      toast.error("يرجى التأكد من رفع وفحص ملف واحد آمن على الأقل");
      return;
    }

    setIsFinalizing(true);

    if (config.isPreview) {
      setTimeout(() => {
        setIsFinalizing(false);
        setInternalStatus("success");
      }, 1000);
      return;
    }

    try {
      const payload = {
        fileIds: safeFiles.map((f) => f.serverId), // نرسل الـ IDs للملفات الآمنة المرفوعة مسبقاً
        senderName: senderData.senderName,
        senderMobile: senderData.senderMobile,
        senderEmail: senderData.senderEmail,
        senderNote: senderData.senderNote,
      };

      await api.post(`/transfer-center/finalize/${config.shortLink}`, payload);
      setInternalStatus("success");
    } catch (error) {
      console.error("Finalize Error:", error);
      toast.error(
        error.response?.data?.message ||
          "حدث خطأ أثناء اعتماد الملفات، يرجى المحاولة مرة أخرى",
      );
    } finally {
      setIsFinalizing(false);
    }
  };

  const handleWhatsApp = () => {
    if (config.isPreview) return;

    const msg = encodeURIComponent(
      config.whatsAppMessage || `مرحباً، بخصوص رابط الطلب: ${config.title}`,
    );

    window.open(
      `https://wa.me/${config.contactPhone?.replace(/\D/g, "")}?text=${msg}`,
    );
  };

  const handleEmail = () => {
    if (config.isPreview) return;

    const subject = encodeURIComponent(`استفسار بخصوص: ${config.title}`);
    const body = encodeURIComponent(
      config.emailMessage || "لدي استفسار بخصوص طلب الملفات المرسل.",
    );

    window.open(
      `mailto:${config.contactEmail}?subject=${subject}&body=${body}`,
    );
  };

  const handleSMS = () => {
    if (config.isPreview) return;

    const msg = encodeURIComponent(
      config.smsMessage || `بخصوص رقم المرجع: ${config.title}`,
    );

    window.open(`sms:${config.contactPhone}?body=${msg}`);
  };

  if (internalStatus === "expired") {
    return (
      <PageShell>
        <StatusCard
          tone="rose"
          icon={Clock}
          title="انتهت صلاحية الرابط"
          message="عذراً، هذا الرابط لم يعد متاحاً لاستقبال الملفات. يرجى التواصل مع الجهة المرسلة لطلب رابط جديد."
          companyName={config.companyName}
        />
      </PageShell>
    );
  }

  if (internalStatus === "success") {
    return (
      <PageShell>
        <div
          className="
            relative z-10 w-full max-w-md overflow-hidden rounded-[32px]
            border border-emerald-200 bg-white/90
            p-8 text-center shadow-[0_30px_90px_rgba(18,63,89,0.18)]
            backdrop-blur-xl
          "
          dir="rtl"
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/75 via-white/55 to-[#fbf8f1]/70" />
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-emerald-400/16 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
          </div>

          <div className="relative z-10">
            <div
              className="
                mx-auto mb-5 grid h-20 w-20 place-items-center
                rounded-[28px] bg-gradient-to-br from-emerald-600 to-emerald-500
                text-white shadow-[0_16px_34px_rgba(16,185,129,0.22)]
              "
            >
              <CheckCircle2 className="h-10 w-10" />
            </div>

            <div
              className="
                mx-auto mb-4 inline-flex items-center gap-1.5
                rounded-2xl border border-emerald-200
                bg-emerald-50 px-3 py-1.5
                text-[10px] font-black text-emerald-700
              "
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              تم الفحص والاستلام بأمان
            </div>

            <h1 className="mb-2 text-2xl font-black text-[#123f59]">
              تم الإرسال بنجاح
            </h1>

            <p className="mx-auto mb-6 max-w-sm text-sm font-bold leading-7 text-[#64748b]">
              شكراً لك، تم استقبال ملفاتك وتشفيرها وحفظها بأمان. سيتم عرضها
              ومراجعتها من قبل فريق العمل.
            </p>

            <div
              className="
                mb-7 rounded-2xl border border-[#d8b46a]/25
                bg-[#fbf8f1] p-4 text-sm font-bold
              "
            >
              <div className="flex justify-between gap-3 text-[#64748b]">
                <span>رقم المرجع:</span>
                <span
                  className="font-mono font-black tracking-widest text-[#123f59]"
                  dir="ltr"
                >
                  REF-{Math.floor(Math.random() * 1000000)}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setInternalStatus("active");
                setFiles([]);
              }}
              className="
                mx-auto flex items-center justify-center gap-2
                rounded-2xl border border-[#d8b46a]/30 bg-white
                px-5 py-2.5 text-xs font-black text-[#64748b]
                transition hover:bg-[#f8efe0] hover:text-[#123f59]
              "
              type="button"
            >
              <ArrowRight className="h-4 w-4" />
              إرسال ملفات إضافية
            </button>
          </div>
        </div>
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
              يرجى إدخال رمز المرور PIN المرسل لك للتمكن من الوصول إلى صفحة رفع
              الملفات.
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
              منصة رفع الملفات والفحص الآمن
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
              <UploadCloud className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1
                className="mb-3 text-2xl font-black leading-tight"
                style={brandStyle}
              >
                {config.title || "طلب رفع ملفات"}
              </h1>

              {config.welcomeText && (
                <p className="whitespace-pre-wrap text-sm font-bold leading-7 text-[#64748b]">
                  {config.welcomeText}
                </p>
              )}
            </div>
          </div>

          {(config.showClientName || config.showRefNumber) && (
            <div
              className="
                mt-4 flex flex-wrap gap-3 rounded-2xl
                border border-[#e8ddc8] bg-[#fbf8f1] p-4
                text-xs font-bold
              "
            >
              {config.showClientName && (
                <InfoPill
                  label="لصالح العميل"
                  value={config.clientName || "غير محدد"}
                />
              )}

              {config.showRefNumber && (
                <InfoPill
                  label="رقم المرجع"
                  value={config.reqRefNumber || "—"}
                  dir="ltr"
                />
              )}
            </div>
          )}

          {config.showReqDescription && config.reqDescription && (
            <div
              className="
                mt-4 flex items-start gap-3 rounded-2xl
                border border-amber-200 bg-amber-50/90
                p-4 text-amber-900
              "
            >
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <p className="text-sm font-bold leading-7">
                {config.reqDescription}
              </p>
            </div>
          )}
        </section>

        {/* Sender data */}
        {(config.reqSenderName ||
          reqSenderMobile ||
          config.reqSenderEmail ||
          config.reqSenderNote) && (
          <section
            className="
              overflow-hidden rounded-[30px]
              border border-[#d8b46a]/30 bg-white/90
              shadow-[0_18px_45px_rgba(18,63,89,0.10)]
              backdrop-blur-xl
            "
          >
            <SectionHeader
              icon={FileText}
              title="بيانات المرسل"
              subtitle="يرجى تعبئة البيانات المطلوبة لتوثيق الملفات."
            />

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {config.reqSenderName && (
                <FormField label="الاسم الكريم" icon={User} required>
                  <input
                    type="text"
                    value={senderData.senderName}
                    onChange={(e) =>
                      setSenderData((prev) => ({
                        ...prev,
                        senderName: e.target.value,
                      }))
                    }
                    className={INPUT_CLASS}
                    placeholder="أدخل الاسم الكامل"
                    required
                  />
                </FormField>
              )}

              {reqSenderMobile && (
                <FormField label="رقم الجوال" icon={Phone} required>
                  <input
                    type="tel"
                    value={senderData.senderMobile}
                    onChange={(e) =>
                      setSenderData((prev) => ({
                        ...prev,
                        senderMobile: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLASS} text-left font-mono`}
                    placeholder="05XXXXXXXX"
                    dir="ltr"
                    required
                  />
                </FormField>
              )}

              {config.reqSenderEmail && (
                <FormField
                  label="البريد الإلكتروني"
                  icon={AtSign}
                  required
                  className="md:col-span-2"
                >
                  <input
                    type="email"
                    value={senderData.senderEmail}
                    onChange={(e) =>
                      setSenderData((prev) => ({
                        ...prev,
                        senderEmail: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLASS} text-left font-mono`}
                    placeholder="name@example.com"
                    dir="ltr"
                    required
                  />
                </FormField>
              )}

              {config.reqSenderNote && (
                <FormField
                  label="ملاحظة للجهة المستلمة"
                  icon={MessageSquare}
                  className="md:col-span-2"
                >
                  <textarea
                    value={senderData.senderNote}
                    onChange={(e) =>
                      setSenderData((prev) => ({
                        ...prev,
                        senderNote: e.target.value,
                      }))
                    }
                    className={`${INPUT_CLASS} h-24 resize-none leading-7`}
                    placeholder="اكتب أي ملاحظة إضافية هنا..."
                  />
                </FormField>
              )}
            </div>
          </section>
        )}

        {/* Upload & Security Scan Area */}
        <section
          className="
            overflow-hidden rounded-[30px]
            border border-[#d8b46a]/30 bg-white/90
            shadow-[0_18px_45px_rgba(18,63,89,0.10)]
            backdrop-blur-xl
          "
        >
          <SectionHeader
            icon={UploadCloud}
            title="إرفاق المستندات المحددة"
            subtitle={`سيتم فحص الملفات أمنياً فوراً بمجرد إفلاتها. (الحد الأقصى ${maxFiles} ملفات).`}
          />

          <div className="space-y-5 p-5">
            <div
              className={`
                group relative flex min-h-[220px] cursor-pointer flex-col
                items-center justify-center overflow-hidden rounded-[28px]
                border-2 border-dashed p-8 text-center transition-all
                ${
                  isDragging
                    ? "scale-[0.99] border-emerald-400 bg-emerald-50"
                    : "border-[#d8b46a]/45 bg-[#fbf8f1]/80 hover:border-[#c5983c] hover:bg-[#f8efe0]/70"
                }
              `}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={isDragging ? { borderColor: brandColor } : {}}
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#eef7f6]/60" />

              <input
                type="file"
                multiple
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => {
                  if (e.target.files) processFiles(e.target.files);
                }}
              />

              <div
                className="
                  relative z-10 mb-4 grid h-16 w-16 place-items-center
                  rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
                  text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                  transition group-hover:scale-105
                "
              >
                <UploadCloud className="h-8 w-8" />
              </div>

              <p className="relative z-10 mb-2 text-sm font-black text-[#123f59]">
                اسحب الملفات وأفلتها هنا للرفع والفحص
              </p>

              <p className="relative z-10 text-xs font-bold text-[#64748b]">
                أو اضغط لاختيار الملفات من جهازك
              </p>

              <p
                className="
                  relative z-10 mt-4 inline-flex items-center gap-2
                  rounded-xl border border-[#d8b46a]/25 bg-white
                  px-3 py-1.5 text-[10px] font-bold text-[#64748b]
                  shadow-sm
                "
              >
                تصل مساحة كل ملف إلى {maxFileSize}MB
              </p>
            </div>

            {/* 💡 مكون الملفات الذكي (UploadFileRow) المدمج داخلياً في نفس الملف */}
            <AnimatePresence>
              {files.length > 0 && (
                <div className="space-y-3">
                  {files.map((fileItem) => (
                    <UploadFileRow
                      key={fileItem.id}
                      fileItem={fileItem}
                      onRemove={() => removeFile(fileItem.id)}
                    />
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Disclaimer */}
        {config.showDisclaimer && (
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

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={
            safeFiles.length === 0 || hasUploadingOrScanning || isFinalizing
          }
          className="
            flex h-14 w-full items-center justify-center gap-2
            rounded-2xl text-sm font-black text-white
            shadow-[0_16px_34px_rgba(18,63,89,0.22)]
            transition hover:-translate-y-[1px] hover:opacity-95
            disabled:cursor-not-allowed disabled:opacity-50
          "
          style={brandBgStyle}
          type="button"
        >
          {isFinalizing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}

          {hasUploadingOrScanning
            ? "يرجى الانتظار لحين اكتمال الرفع والفحص..."
            : "تأكيد واعتماد إرسال الملفات"}
        </button>

        {/* Contact */}
        {(config.enableWhatsApp ||
          config.enableEmailCTA ||
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
                  tone="emerald"
                  icon={Phone}
                  onClick={handleWhatsApp}
                />
              )}

              {config.enableEmailCTA && (
                <ContactButton
                  label="مراسلة إلكترونية"
                  tone="cyan"
                  icon={Mail}
                  onClick={handleEmail}
                />
              )}

              {config.enableSms && (
                <ContactButton
                  label="رسالة SMS"
                  tone="blue"
                  icon={MessageSquare}
                  onClick={handleSMS}
                />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer
        className="
          mx-auto mb-4 mt-8 flex max-w-4xl flex-col items-center gap-3
          border-t border-[#e8ddc8] p-6 text-center
        "
      >
        <p className="text-xs font-bold text-[#64748b]">{config.footerText}</p>

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

// ==========================================
// 🚀 مكون ملف الرفع الذكي (Smart File Row)
// ==========================================
const UploadFileRow = ({ fileItem, onRemove }) => {
  const sizeMB = (fileItem.file.size / (1024 * 1024)).toFixed(1);
  const { status, progress, errorMsg } = fileItem;

  const isUploading = status === "uploading";
  const isScanning = status === "scanning";
  const isSafe = status === "safe";
  const isError = status === "error" || status === "infected";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`flex flex-col gap-3 rounded-[22px] border p-4 sm:flex-row sm:items-center transition-all ${isError ? "border-rose-200 bg-rose-50" : isSafe ? "border-emerald-200 bg-emerald-50/50" : isScanning ? "border-indigo-200 bg-indigo-50/50" : "border-[#e8ddc8] bg-white"}`}
    >
      {/* الأيقونة */}
      <div
        className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${isError ? "bg-rose-100 text-rose-600" : isSafe ? "bg-emerald-100 text-emerald-600" : isScanning ? "bg-indigo-100 text-indigo-600 animate-pulse" : "bg-[#f8efe0] text-[#c5983c]"}`}
      >
        {isScanning ? (
          <ScanLine className="h-5 w-5" />
        ) : isError ? (
          <ShieldAlert className="h-5 w-5" />
        ) : isSafe ? (
          <ShieldCheck className="h-5 w-5" />
        ) : (
          <File className="h-5 w-5" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-start justify-between gap-3 text-xs">
          <span className="truncate font-black text-[#123f59]" dir="ltr">
            {fileItem.file.name}
          </span>
          <span className="shrink-0 font-bold text-[#64748b]">{sizeMB} MB</span>
        </div>

        {/* 💡 شريط التقدم والفحص الذكي */}
        {isError ? (
          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-black text-rose-600">
            <AlertTriangle className="h-3.5 w-3.5" /> {errorMsg}
          </p>
        ) : isSafe ? (
          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
            <CheckCircle2 className="h-3.5 w-3.5" /> ملف آمن وموثوق
          </p>
        ) : isScanning ? (
          <div className="flex w-full items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-indigo-100">
              {/* شريط متحرك للفحص */}
              <div className="h-full w-full bg-indigo-500 rounded-full animate-pulse"></div>
            </div>
            <span className="shrink-0 text-[10px] font-black text-indigo-600 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> فحص أمني
            </span>
          </div>
        ) : (
          <div className="flex w-full items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#eef2f2]">
              <div
                className="h-full rounded-full bg-[#c5983c] transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-[10px] font-black text-[#64748b]">
              {progress}%
            </span>
          </div>
        )}
      </div>

      {/* زر الحذف */}
      {(isError || isSafe) && (
        <button
          onClick={onRemove}
          className="flex min-w-[48px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-xl border border-rose-200 bg-white px-2 py-1.5 text-[8px] font-black text-rose-600 transition hover:bg-rose-50"
          type="button"
        >
          <Trash2 className="h-4 w-4" /> حذف
        </button>
      )}
    </motion.div>
  );
};

// ==========================================
// 🎨 المكونات المساعدة للواجهة (Helpers)
// ==========================================

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
      className={`relative z-10 w-full max-w-md overflow-hidden rounded-[32px] border ${isRose ? "border-rose-200" : "border-emerald-200"} bg-white/90 p-8 text-center shadow-[0_30px_90px_rgba(18,63,89,0.18)] backdrop-blur-xl`}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#fbf8f1]/70 via-white/45 to-[#eef7f6]/70" />
      </div>
      <div className="relative z-10">
        <div
          className={`mx-auto mb-5 grid h-20 w-20 place-items-center rounded-[28px] text-white shadow-[0_16px_34px_rgba(18,63,89,0.22)] ${isRose ? "bg-gradient-to-br from-rose-600 to-rose-500" : "bg-gradient-to-br from-emerald-600 to-emerald-500"}`}
        >
          <Icon className="h-10 w-10" />
        </div>
        <h1 className="mb-3 text-2xl font-black text-[#123f59]">{title}</h1>
        <p className="mx-auto mb-7 max-w-sm text-sm font-bold leading-7 text-[#64748b]">
          {message}
        </p>
        <div className="flex items-center justify-center gap-2 border-t border-[#e8ddc8] pt-5 text-xs font-black text-[#94a3b8]">
          <Building className="h-4 w-4 text-[#c5983c]" />{" "}
          {companyName || "الجهة المرسلة"}
        </div>
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <div className="flex items-center gap-3 border-b border-[#e8ddc8] bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6] px-5 py-4">
    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
      <Icon className="h-5 w-5" />
    </span>
    <div>
      <h3 className="text-sm font-black text-[#123f59]">{title}</h3>
      <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">{subtitle}</p>
    </div>
  </div>
);

const FormField = ({
  label,
  icon: Icon,
  required,
  children,
  className = "",
}) => (
  <div className={className}>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />} {label}{" "}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

const InfoPill = ({ label, value, dir }) => (
  <div className="flex items-center gap-1.5">
    <span className="text-[#94a3b8]">{label}:</span>
    <span className="font-black text-[#123f59]" dir={dir}>
      {value}
    </span>
  </div>
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
      className={`flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-black transition hover:-translate-y-[1px] ${tones[tone] || tones.cyan}`}
      type="button"
    >
      <Icon className="h-4 w-4" /> {label}
    </button>
  );
};

const INPUT_CLASS =
  "w-full rounded-2xl border border-[#d8b46a]/25 bg-white px-4 py-3 text-sm font-bold text-[#123f59] shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-[#c5983c]/70 focus:bg-white focus:ring-4 focus:ring-[#c5983c]/10";
