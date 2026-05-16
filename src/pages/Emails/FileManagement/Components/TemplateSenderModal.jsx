import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  Send,
  Phone,
  Mail,
  MessageSquare,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  Users,
  Loader2,
  ShieldCheck,
  LayoutTemplate,
  MessageCircle,
  AtSign,
  Wand2,
  Contact,
} from "lucide-react";
import ContactPicker from "./ContactPicker";
import { useAuth } from "../../../../context/AuthContext";

const FALLBACK_TEMPLATES = [
  {
    code: "REQ_FIRST",
    type: "request",
    title: "طلب مستندات أول مرة",
    content:
      "السلام عليكم {targetName}،\nنأمل منكم تزويدنا بالمستندات المطلوبة بخصوص {title} عبر الرابط المرفق:\nرابط الرفع: {url}\n{pin_info}\n{expire_info}\nشكراً لتعاونكم.\nمع التحية،\n{userName}",
  },
  {
    code: "REQ_REMIND",
    type: "request",
    title: "تذكير قبل انتهاء الرابط",
    content:
      "تذكير كريم {targetName}،\nيرجى العلم بأن رابط طلب {title} سينتهي قريباً. نرجو استكمال رفع الوثائق المطلوبة.\nرابط الرفع: {url}\nمع التحية،\n{userName}",
  },
  {
    code: "SND_FIRST",
    type: "send",
    title: "إرسال وثائق للاطلاع",
    content:
      "الأخوة الأعزاء في {targetCompany}،\nمرفق لكم الوثائق المتعلقة بـ {title} للاطلاع والمراجعة.\nرابط الوصول: {url}\n{pin_info}\nمع التحية،\n{userName}",
  },
];

export default function TemplateSenderModal({ onClose, linkInfo }) {
  const { user } = useAuth();

  const [channel, setChannel] = useState("whatsapp");
  const [selectedTemplateCode, setSelectedTemplateCode] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  const { data: dbTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      try {
        const res = await api.get("/transfer-center/templates");
        return res.data?.data || [];
      } catch (error) {
        return [];
      }
    },
  });

  const activeTemplates =
    dbTemplates.length > 0 ? dbTemplates : FALLBACK_TEMPLATES;

  const availableTemplates = activeTemplates.filter(
    (template) => template.type === linkInfo.type,
  );

  useEffect(() => {
    if (availableTemplates.length > 0 && !selectedTemplateCode) {
      setSelectedTemplateCode(availableTemplates[0].code);
    }
  }, [availableTemplates, selectedTemplateCode]);

  useEffect(() => {
    const template = availableTemplates.find(
      (item) => item.code === selectedTemplateCode,
    );

    if (!template) return;

    let parsed = template.content
      .replace(/{targetName}/g, linkInfo.targetName || "العميل الكريم")
      .replace(/{targetCompany}/g, linkInfo.targetCompany || "الشركة الموقرة")
      .replace(/{title}/g, linkInfo.title || "")
      .replace(/{url}/g, linkInfo.url || "")
      .replace(/{userName}/g, user?.name || "فريق العمل");

    if (linkInfo.pin) {
      parsed = parsed.replace(
        /{pin_info}/g,
        `\nالرابط محمي بكلمة مرور: ${linkInfo.pin}`,
      );
    } else {
      parsed = parsed.replace(/{pin_info}/g, "");
    }

    if (linkInfo.expireDate) {
      parsed = parsed.replace(
        /{expire_info}/g,
        `\nصلاحية الرابط حتى: ${new Date(linkInfo.expireDate).toLocaleDateString(
          "ar-SA",
        )}`,
      );
    } else {
      parsed = parsed.replace(/{expire_info}/g, "");
    }

    setMessageContent(parsed.trim());
  }, [selectedTemplateCode, linkInfo, availableTemplates, user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setIsCopied(true);
    toast.success("تم نسخ نص الرسالة");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const enhanceWithAI = async () => {
    if (!messageContent.trim()) {
      return toast.error("لا يوجد نص لتحسينه");
    }

    setIsEnhancing(true);

    try {
      const res = await api.post("/transfer-center/ai/rephrase", {
        text: messageContent,
        tone: "professional",
      });

      if (res.data?.success) {
        setMessageContent(res.data.text);
        toast.success("تم تحسين الصياغة بنجاح عبر الذكاء الاصطناعي ✨");
      }
    } catch (error) {
      console.error("AI Rephrase Error:", error);
      toast.error(
        "فشل الاتصال بالذكاء الاصطناعي، تأكد من إعدادات الـ API Key في السيرفر.",
      );
    } finally {
      setIsEnhancing(false);
    }
  };

  const sendMutation = useMutation({
    mutationFn: async (data) =>
      await api.post("/transfer-center/send-notification", data),

    onSuccess: (res) => {
      setIsSent(true);
      toast.success(res.data?.message || "تم إرسال الرسالة بنجاح");
      setTimeout(() => onClose(), 2500);
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الإرسال");
    },
  });

  const handleSend = () => {
    const destination = selectedContact
      ? channel === "email"
        ? selectedContact.email1
        : selectedContact.mobile1
      : channel === "email"
        ? linkInfo.email
        : linkInfo.mobile;

    if (!destination) {
      return toast.error(
        "يرجى تحديد جهة اتصال لاختيار الرقم أو البريد الإلكتروني للعميل",
      );
    }

    if (!messageContent.trim()) {
      return toast.error("محتوى الرسالة فارغ");
    }

    sendMutation.mutate({
      to: destination,
      channel,
      message: messageContent,
    });
  };

  const channels = [
    {
      id: "whatsapp",
      icon: MessageCircle,
      label: "واتساب",
      tone: "emerald",
    },
    {
      id: "email",
      icon: Mail,
      label: "البريد",
      tone: "cyan",
    },
    {
      id: "sms",
      icon: Phone,
      label: "SMS",
      tone: "blue",
    },
    {
      id: "telegram",
      icon: Send,
      label: "تيليجرام",
      tone: "sky",
    },
  ];

  const activeChannel = channels.find((item) => item.id === channel);

  if (isSent) {
    return (
      <div
        className="
          fixed inset-0 z-50 flex items-center justify-center
          bg-[#06111d]/70 p-4 backdrop-blur-md
        "
        dir="rtl"
      >
        <div
          className="
            relative w-full max-w-sm overflow-hidden rounded-[32px]
            border border-emerald-200 bg-white/95
            p-8 text-center shadow-[0_30px_90px_rgba(0,0,0,0.35)]
            animate-in fade-in zoom-in-95
          "
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
              <Check className="h-10 w-10" />
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
              تم تسجيل العملية
            </div>

            <h3 className="mb-2 text-lg font-black text-[#123f59]">
              تم تجهيز الإرسال بنجاح
            </h3>

            <p className="text-xs font-bold leading-6 text-[#64748b]">
              تم تسجيل العملية في السجل النظامي وجاري الإرسال عبر{" "}
              <span className="font-black text-emerald-700">
                {activeChannel?.label}
              </span>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="
        fixed inset-0 z-50 flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in fade-in zoom-in-95 duration-200
          md:flex-row
        "
      >
        {/* Sidebar */}
        <aside
          className="
            flex w-full shrink-0 flex-col overflow-y-auto
            border-b border-[#e8ddc8]
            bg-gradient-to-b from-[#fbf8f1] via-white to-[#eef7f6]
            p-5 custom-scrollbar
            md:w-80 md:border-b-0 md:border-l
          "
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span
                className="
                  grid h-11 w-11 place-items-center rounded-2xl
                  bg-[#123f59] text-[#e2bf74]
                  shadow-[0_12px_26px_rgba(18,63,89,0.18)]
                "
              >
                <Send className="h-5 w-5" />
              </span>

              <div>
                <h3 className="text-sm font-black text-[#123f59]">
                  قنوات الإرسال
                </h3>

                <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                  اختر القناة والمرسل إليه
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                flex min-w-[50px] flex-col items-center justify-center gap-0.5
                rounded-xl border border-rose-200 bg-rose-50
                px-2 py-1 text-[8px] font-black leading-none text-rose-600
                transition hover:bg-rose-100 md:hidden
              "
              type="button"
            >
              <X className="h-4 w-4" />
              إغلاق
            </button>
          </div>

          <div className="mb-6 space-y-2">
            {channels.map((item) => {
              const Icon = item.icon;
              const isActive = channel === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setChannel(item.id)}
                  className={`
                    flex w-full items-center justify-between gap-3
                    rounded-2xl border p-3 text-right transition-all
                    hover:-translate-y-[1px]
                    ${
                      isActive
                        ? getChannelActiveClass(item.tone)
                        : "border-[#e8ddc8] bg-white text-[#64748b] hover:border-[#d8b46a]/45 hover:bg-[#fbf8f1]"
                    }
                  `}
                  type="button"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`
                        grid h-9 w-9 place-items-center rounded-xl
                        ${
                          isActive
                            ? "bg-white/80 text-[#123f59]"
                            : "bg-[#f8efe0] text-[#c5983c]"
                        }
                      `}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="text-xs font-black">{item.label}</span>
                  </span>

                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <SectionMiniTitle title="المرسل إليه" icon={Contact} />

          <div className="mb-6">
            {selectedContact ? (
              <div
                className="
                  rounded-[22px] border border-[#d8b46a]/25
                  bg-white p-4 shadow-sm
                "
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-[#123f59]">
                      {selectedContact.displayName}
                    </p>

                    <p
                      className="mt-1 truncate font-mono text-[10px] font-bold text-[#64748b]"
                      dir="ltr"
                    >
                      {channel === "email"
                        ? selectedContact.email1
                        : selectedContact.mobile1}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedContact(null)}
                    className="
                      rounded-xl border border-rose-200 bg-rose-50 p-1.5
                      text-rose-600 transition hover:bg-rose-100
                    "
                    type="button"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  جهة اتصال محددة
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className="
                  flex h-12 w-full items-center justify-center gap-2
                  rounded-2xl border border-dashed border-[#d8b46a]/45
                  bg-white text-xs font-black text-[#64748b]
                  transition hover:border-[#c5983c] hover:bg-[#f8efe0]
                  hover:text-[#123f59]
                "
                type="button"
              >
                <Users className="h-4 w-4" />
                اختيار جهة اتصال
              </button>
            )}
          </div>

          <SectionMiniTitle title="القوالب الجاهزة" icon={LayoutTemplate} />

          <div className="mb-6">
            {templatesLoading ? (
              <div
                className="
                  flex h-12 items-center justify-center rounded-2xl
                  border border-[#e8ddc8] bg-white
                "
              >
                <Loader2 className="h-5 w-5 animate-spin text-[#c5983c]" />
              </div>
            ) : (
              <select
                value={selectedTemplateCode}
                onChange={(e) => setSelectedTemplateCode(e.target.value)}
                className="
                  h-12 w-full rounded-2xl border border-[#d8b46a]/30
                  bg-white px-4 text-xs font-black text-[#123f59]
                  outline-none transition-all
                  focus:border-[#c5983c]/70
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              >
                {availableTemplates.map((template) => (
                  <option key={template.code} value={template.code}>
                    {template.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-auto rounded-[22px] border border-cyan-200 bg-cyan-50/85 p-4">
            <div className="flex gap-3 text-cyan-900">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" />

              <div>
                <p className="text-xs font-black">تنويه للإرسال</p>

                <p className="mt-1 text-[10px] font-bold leading-5 text-cyan-900/85">
                  عند الضغط على إرسال سيتم تحويل الرسالة للعميل عبر القناة
                  المختارة مباشرة.
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main className="relative flex min-h-0 flex-1 flex-col p-5 md:p-6">
          <button
            onClick={onClose}
            className="
              absolute left-6 top-6 hidden min-w-[54px] flex-col items-center
              justify-center gap-0.5 rounded-xl border border-rose-200
              bg-rose-50 px-2 py-1 text-[8px] font-black leading-none
              text-rose-600 transition hover:bg-rose-100 md:flex
            "
            type="button"
          >
            <X className="h-4 w-4" />
            إغلاق
          </button>

          <div className="mb-5 max-w-[calc(100%-70px)]">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="
                  grid h-10 w-10 place-items-center rounded-2xl
                  bg-[#123f59] text-[#e2bf74]
                "
              >
                <MessageSquare className="h-5 w-5" />
              </span>

              <div>
                <h2 className="text-lg font-black text-[#123f59]">
                  معاينة وتعديل نص الرسالة
                </h2>

                <p className="mt-0.5 text-xs font-bold text-[#64748b]">
                  يتم تعبئة المتغيرات تلقائياً ويمكنك التعديل اليدوي قبل الإرسال.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            <button
              onClick={enhanceWithAI}
              disabled={isEnhancing}
              className="
                flex h-9 items-center gap-1.5 rounded-2xl
                border border-[#d8b46a]/30 bg-[#f8efe0]
                px-4 text-xs font-black text-[#123f59]
                transition hover:bg-[#f3e2be]
                disabled:cursor-not-allowed disabled:opacity-50
              "
              type="button"
            >
              {isEnhancing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#c5983c]" />
              ) : (
                <Wand2 className="h-3.5 w-3.5 text-[#c5983c]" />
              )}
              تحسين الصياغة ذكياً
            </button>

            <ChannelChip channel={activeChannel} />
          </div>

          <div className="relative min-h-[320px] flex-1">
            <textarea
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              disabled={isEnhancing}
              className="
                h-full min-h-[320px] w-full resize-none rounded-[26px]
                border border-[#d8b46a]/30 bg-[#fbf8f1]/70
                p-5 text-sm font-bold leading-8 text-[#334155]
                outline-none transition-all
                focus:border-[#c5983c]/70
                focus:bg-white
                focus:ring-4 focus:ring-[#c5983c]/10
                disabled:opacity-70
                custom-scrollbar
              "
            />

            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={handleCopy}
                className="
                  flex min-w-[50px] flex-col items-center justify-center gap-0.5
                  rounded-xl border border-[#d8b46a]/30 bg-white
                  px-2 py-1.5 text-[8px] font-black leading-none
                  text-[#64748b] shadow-sm transition
                  hover:bg-[#f8efe0] hover:text-[#123f59]
                "
                title="نسخ النص"
                type="button"
              >
                {isCopied ? (
                  <Check className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                نسخ
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row">
            <button
              onClick={onClose}
              className="
                h-12 rounded-2xl border border-[#d8b46a]/30
                bg-white px-6 text-xs font-black text-[#64748b]
                transition hover:bg-[#f8efe0]
              "
              type="button"
            >
              إلغاء
            </button>

            <button
              onClick={handleSend}
              disabled={sendMutation.isPending || isEnhancing}
              className="
                flex h-12 flex-1 items-center justify-center gap-2
                rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                text-xs font-black text-white
                shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                transition hover:-translate-y-[1px]
                disabled:cursor-not-allowed disabled:opacity-70
              "
              type="button"
            >
              {sendMutation.isPending ? (
                <>
                  جاري الإرسال...
                  <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                </>
              ) : (
                <>
                  إرسال عبر {activeChannel?.label}
                  <Send className="h-4 w-4 text-[#e2bf74]" />
                </>
              )}
            </button>
          </div>
        </main>
      </div>

      {showPicker && (
        <ContactPicker
          onClose={() => setShowPicker(false)}
          onSelect={(contacts) => {
            setSelectedContact(contacts[0]);
            setShowPicker(false);
          }}
          multiSelect={false}
          channelFilter={channel}
        />
      )}
    </div>
  );
}

const SectionMiniTitle = ({ title, icon: Icon }) => (
  <div className="mb-3 flex items-center gap-2">
    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f8efe0] text-[#c5983c]">
      <Icon className="h-4 w-4" />
    </span>

    <h3 className="text-sm font-black text-[#123f59]">{title}</h3>
  </div>
);

const ChannelChip = ({ channel }) => {
  if (!channel) return null;

  const Icon = channel.icon;

  return (
    <span
      className={`
        inline-flex h-9 items-center gap-1.5 rounded-2xl border px-3
        text-xs font-black
        ${getChannelSoftClass(channel.tone)}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {channel.label}
    </span>
  );
};

const getChannelActiveClass = (tone) => {
  const classes = {
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-[0_10px_22px_rgba(16,185,129,0.10)]",
    cyan:
      "border-cyan-200 bg-cyan-50 text-cyan-800 shadow-[0_10px_22px_rgba(8,145,178,0.10)]",
    blue:
      "border-blue-200 bg-blue-50 text-blue-700 shadow-[0_10px_22px_rgba(37,99,235,0.10)]",
    sky:
      "border-sky-200 bg-sky-50 text-sky-700 shadow-[0_10px_22px_rgba(14,165,233,0.10)]",
  };

  return classes[tone] || classes.cyan;
};

const getChannelSoftClass = (tone) => {
  const classes = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    sky: "border-sky-200 bg-sky-50 text-sky-700",
  };

  return classes[tone] || classes.cyan;
};