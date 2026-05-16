import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import {
  Settings,
  MonitorSmartphone,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
  UploadCloud,
  Download,
  Mail,
  Phone,
  Palette,
  FileText,
  MessageSquare,
  ShieldCheck,
  Eye,
} from "lucide-react";
import ExternalUploadPage from "../ExternalUploadPage";
import ExternalDownloadPage from "../ExternalDownloadPage";

const DEFAULT_SETTINGS = {
  upload: {
    companyName: "مكتب ريمكس للاستشارات الهندسية",
    welcomeText:
      "نأمل منكم تزويدنا بالملفات المطلوبة أدناه للبدء في الإجراءات.",
    brandColor: "#4f46e5",
    contactEmail: "info@remix-eng.com",
    contactPhone: "920000000",
    footerText: "نظام ريمكس للإدارة الهندسية © 2026",
    defaultDisclaimer:
      "برفعك لهذه الملفات، أنت تقر بأنها صحيحة وخالية من أي فيروسات وتتحمل كامل المسؤولية القانونية.",
    showDisclaimer: true,
    enableWhatsApp: true,
    enableEmailCTA: true,
    enableSms: true,
  },
  download: {
    companyName: "مكتب ريمكس للاستشارات الهندسية",
    welcomeText: "مرحباً بك، يمكنك تحميل ومراجعة الملفات المرفقة أدناه بأمان.",
    brandColor: "#059669",
    contactEmail: "info@remix-eng.com",
    contactPhone: "920000000",
    footerText: "نظام ريمكس للإدارة الهندسية © 2026",
    enableWhatsApp: true,
    enableEmail: true,
    requireOtp: false,
  },
};

export default function SettingsTab({ initialSettings, refetch }) {
  const [settingsTab, setSettingsTab] = useState("landing-upload");

  const [localSettings, setLocalSettings] = useState({
    upload: initialSettings?.uploadSettings?.companyName
      ? initialSettings.uploadSettings
      : DEFAULT_SETTINGS.upload,
    download: initialSettings?.downloadSettings?.companyName
      ? initialSettings.downloadSettings
      : DEFAULT_SETTINGS.download,
  });

  useEffect(() => {
    setLocalSettings({
      upload: initialSettings?.uploadSettings?.companyName
        ? initialSettings.uploadSettings
        : DEFAULT_SETTINGS.upload,
      download: initialSettings?.downloadSettings?.companyName
        ? initialSettings.downloadSettings
        : DEFAULT_SETTINGS.download,
    });
  }, [initialSettings]);

  const activePage = settingsTab === "landing-upload" ? "upload" : "download";
  const currentSettings = localSettings[activePage];

  const updateLocalSettings = (page, updates) => {
    setLocalSettings((prev) => ({
      ...prev,
      [page]: {
        ...prev[page],
        ...updates,
      },
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put("/transfer-center/settings", data);
      return res.data;
    },

    onSuccess: () => {
      toast.success("تم حفظ إعدادات صفحات الهبوط بنجاح");
      if (refetch) refetch();
    },

    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء حفظ الإعدادات");
    },
  });

  const handleSave = () => {
    saveMutation.mutate({
      uploadSettings: localSettings.upload,
      downloadSettings: localSettings.download,
    });
  };

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

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Settings className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                إعدادات المركز وصفحات الهبوط
              </h2>

              <p className="mt-1 truncate text-xs font-bold text-white/65">
                تخصيص الهوية البصرية، بيانات التواصل، وصلاحيات الوصول.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div
              className="
                flex rounded-2xl border border-white/15
                bg-white/10 p-1 backdrop-blur-md
              "
            >
              <TabButton
                active={settingsTab === "landing-upload"}
                onClick={() => setSettingsTab("landing-upload")}
                icon={UploadCloud}
                label="صفحة الرفع"
              />

              <TabButton
                active={settingsTab === "landing-download"}
                onClick={() => setSettingsTab("landing-download")}
                icon={Download}
                label="صفحة التنزيل"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="
                flex h-11 items-center justify-center gap-2
                rounded-2xl bg-[#e2bf74] px-5
                text-sm font-black text-[#082032]
                shadow-[0_12px_28px_rgba(226,191,116,0.25)]
                transition-all hover:-translate-y-[1px]
                hover:bg-[#f5d99b]
                disabled:cursor-not-allowed disabled:opacity-70
              "
              type="button"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar md:p-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {/* Settings Form */}
            <div className="space-y-5">
              <SettingsCard
                icon={Palette}
                title="الهوية البصرية والنصوص"
                subtitle="تحديد اسم الجهة، النص الترحيبي، واللون الأساسي."
              >
                <div className="space-y-4">
                  <FormField label="اسم الجهة Company Name">
                    <input
                      type="text"
                      value={currentSettings.companyName || ""}
                      onChange={(e) =>
                        updateLocalSettings(activePage, {
                          companyName: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="رسالة الترحيب الافتراضية">
                    <textarea
                      value={currentSettings.welcomeText || ""}
                      onChange={(e) =>
                        updateLocalSettings(activePage, {
                          welcomeText: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} h-24 resize-none leading-7`}
                    />
                  </FormField>

                  <FormField label="اللون الأساسي Brand Color">
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={currentSettings.brandColor || "#123f59"}
                        onChange={(e) =>
                          updateLocalSettings(activePage, {
                            brandColor: e.target.value,
                          })
                        }
                        className="
                          h-11 w-14 cursor-pointer rounded-2xl
                          border border-[#d8b46a]/30 bg-white p-1
                          shadow-sm
                        "
                      />

                      <span
                        className="
                          rounded-2xl border border-[#d8b46a]/25
                          bg-[#fbf8f1] px-4 py-2
                          font-mono text-xs font-black text-[#123f59]
                        "
                        dir="ltr"
                      >
                        {currentSettings.brandColor}
                      </span>

                      <span
                        className="
                          h-9 w-9 rounded-2xl border border-[#d8b46a]/30
                          shadow-inner
                        "
                        style={{
                          backgroundColor: currentSettings.brandColor,
                        }}
                      />
                    </div>
                  </FormField>
                </div>
              </SettingsCard>

              <SettingsCard
                icon={Mail}
                title="بيانات التواصل والفوتر"
                subtitle="تحديد وسائل التواصل الظاهرة في صفحات العملاء."
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormField label="البريد الإلكتروني للعملاء">
                    <input
                      type="email"
                      value={currentSettings.contactEmail || ""}
                      onChange={(e) =>
                        updateLocalSettings(activePage, {
                          contactEmail: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} text-left font-mono`}
                      dir="ltr"
                    />
                  </FormField>

                  <FormField label="رقم الدعم WhatsApp / SMS">
                    <input
                      type="text"
                      value={currentSettings.contactPhone || ""}
                      onChange={(e) =>
                        updateLocalSettings(activePage, {
                          contactPhone: e.target.value,
                        })
                      }
                      className={`${INPUT_CLASS} text-left font-mono`}
                      dir="ltr"
                    />
                  </FormField>
                </div>

                <div className="mt-4">
                  <FormField label="نص التذييل Footer Text">
                    <input
                      type="text"
                      value={currentSettings.footerText || ""}
                      onChange={(e) =>
                        updateLocalSettings(activePage, {
                          footerText: e.target.value,
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </FormField>
                </div>
              </SettingsCard>

              <SettingsCard
                icon={ShieldCheck}
                title="خيارات الوصول والتواصل"
                subtitle="تفعيل أو تعطيل وسائل التواصل والحماية حسب نوع الصفحة."
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <ToggleOption
                    label="تفعيل واتساب"
                    checked={currentSettings.enableWhatsApp}
                    onChange={(checked) =>
                      updateLocalSettings(activePage, {
                        enableWhatsApp: checked,
                      })
                    }
                  />

                  <ToggleOption
                    label={
                      activePage === "upload"
                        ? "تفعيل زر البريد"
                        : "تفعيل البريد"
                    }
                    checked={
                      activePage === "upload"
                        ? currentSettings.enableEmailCTA
                        : currentSettings.enableEmail
                    }
                    onChange={(checked) =>
                      updateLocalSettings(activePage, {
                        [activePage === "upload"
                          ? "enableEmailCTA"
                          : "enableEmail"]: checked,
                      })
                    }
                  />

                  {activePage === "upload" && (
                    <>
                      <ToggleOption
                        label="تفعيل SMS"
                        checked={currentSettings.enableSms}
                        onChange={(checked) =>
                          updateLocalSettings("upload", {
                            enableSms: checked,
                          })
                        }
                      />

                      <ToggleOption
                        label="عرض إخلاء المسؤولية"
                        checked={currentSettings.showDisclaimer}
                        onChange={(checked) =>
                          updateLocalSettings("upload", {
                            showDisclaimer: checked,
                          })
                        }
                      />
                    </>
                  )}

                  {activePage === "download" && (
                    <ToggleOption
                      label="طلب OTP قبل التنزيل"
                      checked={currentSettings.requireOtp}
                      onChange={(checked) =>
                        updateLocalSettings("download", {
                          requireOtp: checked,
                        })
                      }
                    />
                  )}
                </div>

                {activePage === "upload" && (
                  <div className="mt-4">
                    <FormField label="نص إخلاء المسؤولية الافتراضي">
                      <textarea
                        value={currentSettings.defaultDisclaimer || ""}
                        onChange={(e) =>
                          updateLocalSettings("upload", {
                            defaultDisclaimer: e.target.value,
                          })
                        }
                        className={`${INPUT_CLASS} h-24 resize-none leading-7`}
                      />
                    </FormField>
                  </div>
                )}
              </SettingsCard>
            </div>

            {/* Preview */}
            <div className="flex min-h-[600px] flex-col">
              <div
                className="
                  mb-4 flex items-center justify-between gap-3
                  rounded-[24px] border border-[#d8b46a]/30
                  bg-white/85 p-4
                  shadow-[0_12px_30px_rgba(18,63,89,0.07)]
                "
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                    <MonitorSmartphone className="h-5 w-5" />
                  </span>

                  <div>
                    <h3 className="text-sm font-black text-[#123f59]">
                      معاينة حية Live Preview
                    </h3>

                    <p className="text-[11px] font-bold text-[#64748b]">
                      يتم تحديث المعاينة فور تعديل البيانات.
                    </p>
                  </div>
                </div>

                <span
                  className="
                    hidden items-center gap-1.5 rounded-xl
                    border border-emerald-200 bg-emerald-50
                    px-3 py-1.5 text-[10px] font-black text-emerald-700
                    sm:inline-flex
                  "
                >
                  <Eye className="h-3.5 w-3.5" />
                  مباشر
                </span>
              </div>

              <div
                className="
                  flex min-h-0 flex-1 flex-col overflow-hidden
                  rounded-[30px] border border-[#d8b46a]/35
                  bg-[#06111d] shadow-[0_24px_70px_rgba(18,63,89,0.20)]
                "
              >
                <div className="flex shrink-0 items-center gap-2 border-b border-white/10 bg-[#0d1824] p-3">
                  <div className="mr-2 flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>

                  <div
                    className="
                      flex flex-1 items-center justify-center gap-2
                      rounded-xl border border-white/10
                      bg-white/10 px-3 py-1.5
                      font-mono text-[10px] font-bold text-white/70
                    "
                  >
                    <Lock className="h-3 w-3 text-emerald-300" />
                    <span>
                      {settingsTab === "landing-upload"
                        ? "https://details-worksystem1.com/req/preview"
                        : "https://details-worksystem1.com/s/preview"}
                    </span>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-white custom-scrollbar">
                  <div className="pointer-events-auto origin-top md:scale-[0.9]">
                    {settingsTab === "landing-upload" ? (
                      <ExternalUploadPage
                        config={{
                          ...localSettings.upload,
                          title: "طلب مستندات (معاينة)",
                          status: "active",
                          clientName: "اسم العميل",
                          showClientName: true,
                          reqDescription: "هذه الواجهة ستظهر للعميل الخارجي.",
                          showReqDescription: true,
                          reqRefNumber: "REQ-PREVIEW",
                          showRefNumber: true,
                          reqSenderName: true,
                          reqSenderMobile: true,
                          reqSenderEmail: true,
                          reqSenderNote: false,
                          maxFiles: 5,
                          maxFileSize: 20,
                          allowedTypes: ["all"],
                          isPreview: true,
                        }}
                      />
                    ) : (
                      <ExternalDownloadPage
                        config={{
                          ...localSettings.download,
                          title: "حزمة مستندات للاستلام",
                          message:
                            "هذه الواجهة ستظهر للعميل الخارجي عند استقباله للملفات.",
                          status: "active",
                          isPreview: true,
                          permissions: "both",
                          showDisclaimer: true,
                          disclaimerText: "هذه الملفات سرية.",
                          files: [
                            {
                              id: "1",
                              name: "المخططات.pdf",
                              size: "2.4 MB",
                              type: "application/pdf",
                            },
                          ],
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {saveMutation.isSuccess && (
            <div
              className="
                mt-5 flex items-center gap-2 rounded-2xl
                border border-emerald-200 bg-emerald-50
                px-4 py-3 text-xs font-black text-emerald-700
              "
            >
              <CheckCircle2 className="h-4 w-4" />
              تم حفظ آخر تعديل بنجاح.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex h-10 items-center gap-2 rounded-xl px-4
      text-xs font-black transition-all whitespace-nowrap
      ${
        active
          ? "bg-white text-[#123f59] shadow-sm"
          : "text-white/65 hover:bg-white/10 hover:text-white"
      }
    `}
    type="button"
  >
    <Icon className="h-4 w-4" />
    {label}
  </button>
);

const SettingsCard = ({ icon: Icon, title, subtitle, children }) => (
  <section
    className="
      overflow-hidden rounded-[26px]
      border border-[#d8b46a]/30 bg-white/90
      shadow-[0_16px_40px_rgba(18,63,89,0.08)]
      backdrop-blur-xl
    "
  >
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

    <div className="p-5">{children}</div>
  </section>
);

const FormField = ({ label, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-black text-[#123f59]">
      {label}
    </label>

    {children}
  </div>
);

const ToggleOption = ({ label, checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="
      flex items-center justify-between gap-3 rounded-2xl
      border border-[#d8b46a]/25 bg-white
      px-4 py-3 text-right
      transition hover:bg-[#fbf8f1]
    "
    type="button"
  >
    <span className="flex items-center gap-2 text-xs font-black text-[#123f59]">
      <MessageSquare className="h-4 w-4 text-[#c5983c]" />
      {label}
    </span>

    <span
      className={`
        relative h-6 w-12 shrink-0 rounded-full transition-colors
        ${checked ? "bg-[#123f59]" : "bg-slate-300"}
      `}
    >
      <span
        className={`
          absolute top-1 h-4 w-4 rounded-full bg-white transition-all
          ${checked ? "left-1" : "left-7"}
        `}
      />
    </span>
  </button>
);

const INPUT_CLASS = `
  w-full rounded-2xl border border-[#d8b46a]/25
  bg-white px-4 py-3 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4
  focus:ring-[#c5983c]/10
`;