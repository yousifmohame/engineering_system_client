import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // 💡 تأكد من مسار axios الصحيح
import { toast } from "sonner";
import {
  Settings,
  MonitorSmartphone,
  Lock,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import ExternalUploadPage from "../ExternalUploadPage";
import ExternalDownloadPage from "../ExternalDownloadPage";

// 💡 القيم الافتراضية في حال كانت قاعدة البيانات فارغة (أول مرة)
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

// 💡 لاحظ أننا نستقبل initialSettings من الباك إند
export default function SettingsTab({ initialSettings, refetch }) {
  const [settingsTab, setSettingsTab] = useState("landing-upload");

  // 💡 دمج البيانات القادمة من الباك إند مع القيم الافتراضية
  const [localSettings, setLocalSettings] = useState({
    upload: initialSettings?.uploadSettings?.companyName
      ? initialSettings.uploadSettings
      : DEFAULT_SETTINGS.upload,
    download: initialSettings?.downloadSettings?.companyName
      ? initialSettings.downloadSettings
      : DEFAULT_SETTINGS.download,
  });

  const updateLocalSettings = (page, updates) => {
    setLocalSettings((prev) => ({
      ...prev,
      [page]: { ...prev[page], ...updates },
    }));
  };

  // 🚀 إرسال التعديلات للباك إند للحفظ في قاعدة البيانات
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const res = await api.put("/transfer-center/settings", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم حفظ إعدادات صفحات الهبوط بنجاح");
      if (refetch) refetch(); // تحديث البيانات في الملف الرئيسي
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
    <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col h-full bg-slate-50/50">
      <div className="p-6 border-b border-slate-200 bg-white shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">
                إعدادات المركز وصفحات الهبوط
              </h2>
              <p className="text-[10px] font-bold text-slate-500">
                تخصيص الهوية البصرية، وصلاحيات الوصول.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 p-1 rounded-xl custom-scrollbar overflow-x-auto">
              <button
                onClick={() => setSettingsTab("landing-upload")}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${settingsTab === "landing-upload" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                صفحة الهبوط (للرفع)
              </button>
              <button
                onClick={() => setSettingsTab("landing-download")}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all whitespace-nowrap ${settingsTab === "landing-download" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                صفحة الهبوط (للتنزيل)
              </button>
            </div>

            {/* 🚀 زر الحفظ الفعلي */}
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-70"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              حفظ التغييرات
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in zoom-in-95">
            {/* نماذج الإعدادات */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  الهوية البصرية والنصوص
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">
                      اسم الجهة (Company Name)
                    </label>
                    <input
                      type="text"
                      value={
                        localSettings[
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download"
                        ].companyName
                      }
                      onChange={(e) =>
                        updateLocalSettings(
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download",
                          { companyName: e.target.value },
                        )
                      }
                      className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">
                      رسالة الترحيب الافتراضية
                    </label>
                    <textarea
                      value={
                        localSettings[
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download"
                        ].welcomeText
                      }
                      onChange={(e) =>
                        updateLocalSettings(
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download",
                          { welcomeText: e.target.value },
                        )
                      }
                      className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 h-20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">
                      اللون الأساسي (Brand Color)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={
                          localSettings[
                            settingsTab === "landing-upload"
                              ? "upload"
                              : "download"
                          ].brandColor
                        }
                        onChange={(e) =>
                          updateLocalSettings(
                            settingsTab === "landing-upload"
                              ? "upload"
                              : "download",
                            { brandColor: e.target.value },
                          )
                        }
                        className="h-10 w-10 border-0 rounded cursor-pointer p-0"
                      />
                      <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">
                        {
                          localSettings[
                            settingsTab === "landing-upload"
                              ? "upload"
                              : "download"
                          ].brandColor
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">
                  بيانات التواصل والفوتر
                </h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">
                      البريد الإلكتروني للعملاء
                    </label>
                    <input
                      type="email"
                      value={
                        localSettings[
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download"
                        ].contactEmail
                      }
                      onChange={(e) =>
                        updateLocalSettings(
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download",
                          { contactEmail: e.target.value },
                        )
                      }
                      className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 block mb-1">
                      رقم الدعم (للواتساب/SMS)
                    </label>
                    <input
                      type="text"
                      value={
                        localSettings[
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download"
                        ].contactPhone
                      }
                      onChange={(e) =>
                        updateLocalSettings(
                          settingsTab === "landing-upload"
                            ? "upload"
                            : "download",
                          { contactPhone: e.target.value },
                        )
                      }
                      className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 block mb-1">
                    نص التذييل (Footer Text)
                  </label>
                  <input
                    type="text"
                    value={
                      localSettings[
                        settingsTab === "landing-upload" ? "upload" : "download"
                      ].footerText
                    }
                    onChange={(e) =>
                      updateLocalSettings(
                        settingsTab === "landing-upload"
                          ? "upload"
                          : "download",
                        { footerText: e.target.value },
                      )
                    }
                    className="w-full p-2.5 border border-slate-200 bg-slate-50 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            {/* المعاينة الحية */}
            <div className="flex flex-col h-full">
              <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center justify-between">
                معاينة حية (Live Preview)
                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                  يتم التحديث فوراً
                </span>
              </h3>
              <div className="flex-1 min-h-[500px] border-4 border-slate-800 rounded-3xl overflow-hidden bg-white shadow-xl relative isolate">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-2 custom-scrollbar">
                  <div className="pointer-events-auto transform scale-[0.85] origin-top">
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
        </div>
      </div>
    </div>
  );
}
