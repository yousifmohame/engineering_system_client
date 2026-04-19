import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "../../../../api/axios"; // 💡 تأكد من مسار axios
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
} from "lucide-react";
import ContactPicker from "./ContactPicker";

// يرجى التأكد من مسار الاستدعاء حسب هيكلة مشروعك
import { useAuth } from "../../../../context/AuthContext";

// قوالب احتياطية (Fallback) في حال لم يتم جلبها من الباك إند
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
  // 🚀 جلب بيانات الموظف الحالي
  const { user } = useAuth();

  const [channel, setChannel] = useState("whatsapp");
  const [selectedTemplateCode, setSelectedTemplateCode] = useState("");
  const [messageContent, setMessageContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // حالة التحميل لزر الذكاء الاصطناعي
  const [isEnhancing, setIsEnhancing] = useState(false);

  // 1. جلب القوالب الحقيقية من الداتابيز
  const { data: dbTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["notification-templates"],
    queryFn: async () => {
      try {
        const res = await api.get("/transfer-center/templates");
        return res.data?.data || [];
      } catch (err) {
        return [];
      }
    },
  });

  const activeTemplates =
    dbTemplates.length > 0 ? dbTemplates : FALLBACK_TEMPLATES;
  const availableTemplates = activeTemplates.filter(
    (t) => t.type === linkInfo.type,
  );

  useEffect(() => {
    if (availableTemplates.length > 0 && !selectedTemplateCode) {
      setSelectedTemplateCode(availableTemplates[0].code);
    }
  }, [availableTemplates, selectedTemplateCode]);

  // 2. معالجة النص (حقن المتغيرات الحقيقية في القالب المختار)
  useEffect(() => {
    const template = availableTemplates.find(
      (t) => t.code === selectedTemplateCode,
    );
    if (!template) return;

    let parsed = template.content
      .replace(/{targetName}/g, linkInfo.targetName || "العميل الكريم")
      .replace(/{targetCompany}/g, linkInfo.targetCompany || "الشركة الموقرة")
      .replace(/{title}/g, linkInfo.title)
      .replace(/{url}/g, linkInfo.url)
      .replace(/{userName}/g, user?.name || "فريق العمل"); // 💡 دمج اسم المستخدم هنا

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
        `\nصلاحية الرابط حتى: ${new Date(linkInfo.expireDate).toLocaleDateString("ar-SA")}`,
      );
    } else {
      parsed = parsed.replace(/{expire_info}/g, "");
    }

    setMessageContent(parsed.trim());
  }, [selectedTemplateCode, linkInfo, availableTemplates, user]);

  const handleCopy = () => {
    navigator.clipboard.writeText(messageContent);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // 🚀 3. الاتصال الفعلي بالذكاء الاصطناعي (OpenAI) لإعادة الصياغة
  const enhanceWithAI = async () => {
    if (!messageContent.trim()) {
      return toast.error("لا يوجد نص لتحسينه");
    }

    setIsEnhancing(true);
    try {
      const res = await api.post("/transfer-center/ai/rephrase", {
        text: messageContent,
        tone: "professional", // يمكن تغييره إلى 'friendly' حسب الرغبة
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

  // 4. إرسال الرسالة للباك إند (Twilio)
  const sendMutation = useMutation({
    mutationFn: async (data) =>
      await api.post("/transfer-center/send-notification", data),
    onSuccess: (res) => {
      setIsSent(true);
      toast.success(res.message || "تم إرسال الرسالة بنجاح");
      setTimeout(() => onClose(), 2500);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الإرسال");
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
      channel: channel,
      message: messageContent,
    });
  };

  const channels = [
    {
      id: "whatsapp",
      icon: MessageSquare,
      label: "واتساب",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      id: "email",
      icon: Mail,
      label: "البريد",
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      id: "sms",
      icon: Phone,
      label: "SMS",
      color: "bg-sky-50 text-sky-600 border-sky-200",
    },
    {
      id: "telegram",
      icon: Send,
      label: "تيليجرام",
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
  ];

  if (isSent) {
    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        dir="rtl"
      >
        <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center animate-in fade-in zoom-in">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2">
            تم تجهيز الإرسال بنجاح
          </h3>
          <p className="text-xs font-bold text-slate-500">
            تم تسجيل العملية في السجل النظامي وجاري الإرسال عبر{" "}
            {channels.find((c) => c.id === channel)?.label}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-3xl shadow-xl flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        {/* Left Side: Settings & Channels */}
        <div className="w-full md:w-1/3 bg-slate-50 border-l border-slate-200 p-6 flex flex-col custom-scrollbar overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" /> قنوات الإرسال
            </h3>
            <button onClick={onClose} className="md:hidden text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {channels.map((c) => (
              <button
                key={c.id}
                onClick={() => setChannel(c.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-all border outline-none ${
                  channel === c.id
                    ? c.color +
                      " ring-2 ring-offset-1 " +
                      c.color.replace("bg-", "ring-").split(" ")[0]
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <c.icon className="w-4 h-4" /> {c.label}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-black text-slate-800 mb-3">
            المرسل إليه
          </h3>
          <div className="mb-6">
            {selectedContact ? (
              <div className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-black text-slate-800">
                    {selectedContact.displayName}
                  </p>
                  <p
                    className="text-[10px] text-slate-500 font-mono mt-0.5"
                    dir="ltr"
                  >
                    {channel === "email"
                      ? selectedContact.email1
                      : selectedContact.mobile1}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowPicker(true)}
                className="w-full p-3 bg-white border border-dashed border-slate-300 rounded-xl text-slate-500 text-xs font-bold hover:border-indigo-400 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
              >
                <Users className="w-4 h-4" /> اختيار جهة اتصال
              </button>
            )}
          </div>

          <h3 className="text-sm font-black text-slate-800 mb-3">
            القوالب الجاهزة
          </h3>
          <div className="flex flex-col gap-2">
            {templatesLoading ? (
              <div className="w-full p-3 flex justify-center bg-white border border-slate-200 rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              </div>
            ) : (
              <select
                value={selectedTemplateCode}
                onChange={(e) => setSelectedTemplateCode(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {availableTemplates.map((template) => (
                  <option key={template.code} value={template.code}>
                    {template.title}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mt-auto pt-6">
            <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
              <p className="text-[10px] font-bold text-indigo-800 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> تنويه للإرسال
              </p>
              <p className="text-[9px] text-indigo-600 leading-relaxed">
                عند الضغط على إرسال سيتم تحويل الرسالة للعميل عبر القناة
                المختارة مباشرة (WhatsApp أو SMS).
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Editor & Preview */}
        <div className="w-full md:w-2/3 flex flex-col p-6 relative">
          <button
            onClick={onClose}
            className="absolute left-6 top-6 hidden md:block text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-lg font-black text-slate-800 mb-1">
            معاينة وتعديل نص الرسالة
          </h2>
          <p className="text-xs text-slate-500 font-bold mb-6">
            يتم تعبئة المتغيرات تلقائياً ويمكنك التعديل اليدوي قبل الإرسال.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {/* 🚀 الزر الآن يستدعي الدالة الحقيقية */}
            <button
              onClick={enhanceWithAI}
              disabled={isEnhancing}
              className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-xs font-black flex items-center gap-1.5 hover:bg-indigo-100 transition shadow-sm disabled:opacity-50"
            >
              {isEnhancing ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              تحسين الصياغة ذكياً
            </button>
          </div>

          <div className="flex-1 relative">
            <div className="min-h-[250px] relative h-full">
              <textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                disabled={isEnhancing}
                className="w-full h-full min-h-[300px] p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed resize-none font-medium text-slate-700 focus:ring-2 focus:ring-indigo-100 focus:bg-white outline-none transition-all custom-scrollbar disabled:opacity-70"
              />
              <div className="absolute left-4 bottom-4 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="p-2 bg-white border border-slate-200 rounded-xl shadow-sm text-slate-500 hover:text-indigo-600 transition"
                  title="نسخ النص"
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSend}
              disabled={sendMutation.isPending || isEnhancing}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {sendMutation.isPending ? (
                <>
                  جاري الإرسال... <Loader2 className="w-4 h-4 animate-spin" />
                </>
              ) : (
                <>
                  إرسال عبر {channels.find((c) => c.id === channel)?.label}{" "}
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
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
