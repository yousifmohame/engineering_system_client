import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  FileBox,
  Users,
  Shield,
  LayoutPanelTop,
  Share2,
  Send,
  X,
  CheckCircle2,
  Plus,
  LayoutTemplate,
  Eye,
  Download,
  Unlock,
  Lock,
  Clock,
  QrCode,
  Copy,
  Loader2,
  Trash2,
  Sparkles,
  UploadCloud,
  Info,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckSquare,
  MonitorSmartphone,
} from "lucide-react";
import ExternalDownloadPage from "../ExternalDownloadPage";
import TemplateSenderModal from "../TemplateSenderModal";
import ContactPicker from "../ContactPicker";
import { useAuth } from "../../../../context/AuthContext";

export default function SendPackageModal({ onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [showSender, setShowSender] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const [isEnhancing, setIsEnhancing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "specific",
    entityName: "",
    mobile: "",
    email: "",
    linkType: "open",
    pinCode: "",
    expireDate: "",
    permissions: "both",
    showDisclaimer: true,
    disclaimerText:
      "هذه الملفات سرية ومخصصة للمستلم فقط. يمنع تداولها أو نشرها دون إذن مسبق.",
    selectedFiles: [],
    directDownloadMode: false,
  });

  const updateForm = (updates) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  const { data: centerData } = useQuery({
    queryKey: ["transfer-center-data"],
    queryFn: async () => {
      const res = await api.get("/transfer-center/dashboard");
      return res.data?.data;
    },
    staleTime: Infinity,
  });

  const downloadSettings = centerData?.settings?.downloadSettings || {};

  const enhanceMessageWithAI = async () => {
    if (!formData.message.trim()) {
      return toast.error("يرجى كتابة نص مبدئي ليقوم الذكاء الاصطناعي بتحسينه");
    }

    setIsEnhancing(true);

    try {
      const res = await api.post("/transfer-center/ai/rephrase", {
        text: formData.message,
        tone: "professional",
      });

      if (res.data?.success) {
        updateForm({ message: res.data.text });
        toast.success("تم تحسين الصياغة بنجاح ✨");
      }
    } catch (error) {
      console.error("AI Rephrase Error:", error);
      toast.error("فشل الاتصال بالذكاء الاصطناعي.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      type: file.type,
    }));

    updateForm({
      selectedFiles: [...formData.selectedFiles, ...newFiles],
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (id) => {
    updateForm({
      selectedFiles: formData.selectedFiles.filter((f) => f.id !== id),
    });
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
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };

  const createPackageMutation = useMutation({
    mutationFn: async (data) => {
      const uploadData = new FormData();

      let finalMessage = data.message;

      if (finalMessage && user?.name) {
        finalMessage = finalMessage.replace(/{userName}/g, user.name);
      }

      Object.keys(data).forEach((key) => {
        if (key === "message") {
          uploadData.append("message", finalMessage);
        } else if (
          key !== "selectedFiles" &&
          data[key] !== null &&
          data[key] !== undefined
        ) {
          uploadData.append(key, data[key]);
        }
      });

      const fileMetadata = [];

      data.selectedFiles.forEach((f) => {
        uploadData.append("files", f.file);
        fileMetadata.push({
          name: f.name,
          size: f.size,
          type: f.type,
        });
      });

      uploadData.append("filesMetadata", JSON.stringify(fileMetadata));

      const response = await api.post("/transfer-center/packages", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },

    onSuccess: (res) => {
      if (res.success) {
        setGeneratedLinkData(res.data);
        setStep(5);
        toast.success("تم إنشاء حزمة الإرسال بنجاح");
        queryClient.invalidateQueries(["transfer-center-data"]);
      }
    },

    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "حدث خطأ أثناء حفظ الحزمة، يرجى المحاولة لاحقاً",
      );
    },
  });

  const handleFinalSave = () => {
    if (formData.selectedFiles.length === 0) {
      return toast.error("يرجى إرفاق ملف واحد على الأقل قبل الاعتماد");
    }

    if (!formData.title) {
      return toast.error("يرجى إدخال عنوان الحزمة قبل الاعتماد");
    }

    createPackageMutation.mutate(formData);
  };

  const steps = [
    { id: 1, title: "تجميع الملفات", icon: FileBox },
    { id: 2, title: "المرسل إليه", icon: Users },
    { id: 3, title: "صلاحيات الاستعراض", icon: Shield },
    { id: 4, title: "تخصيص الهوية", icon: LayoutPanelTop },
    { id: 5, title: "مشاركة الحزمة", icon: Share2 },
  ];

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
          flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in fade-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div
          className="
            relative shrink-0 overflow-hidden
            border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white md:px-6
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  grid h-12 w-12 shrink-0 place-items-center rounded-2xl
                  border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74]
                  shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                "
              >
                <Send className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-black md:text-xl">
                  إنشاء حزمة إرسال ملفات جديدة
                </h2>

                <p className="mt-1 truncate text-xs font-bold text-white/65">
                  نموذج تجميع وإرسال الوثائق للأطراف الخارجية
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

        {/* Body */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className="
              hidden w-72 shrink-0 overflow-y-auto border-l border-[#e8ddc8]
              bg-gradient-to-b from-[#fbf8f1] via-white to-[#eef7f6]
              p-4 custom-scrollbar lg:block
            "
          >
            <div className="space-y-2">
              {steps.map((s) => (
                <StepButton
                  key={s.id}
                  step={s}
                  currentStep={step}
                  disabled={s.id === 5 && !generatedLinkData}
                  onClick={() => {
                    if (s.id === 5 && !generatedLinkData) return;
                    setStep(s.id);
                  }}
                />
              ))}
            </div>

            <div
              className="
                mt-6 rounded-[24px] border border-[#d8b46a]/30
                bg-white/80 p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
              "
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                  <ShieldCheck className="h-4 w-4" />
                </span>

                <div>
                  <span className="block text-xs font-black text-[#123f59]">
                    حالة الحزمة
                  </span>
                  <span className="text-[10px] font-bold text-[#64748b]">
                    {formData.selectedFiles.length} ملفات محددة
                  </span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8ddc8]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#123f59] to-[#e2bf74] transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      20 + formData.selectedFiles.length * 20,
                    )}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-[10px] font-bold leading-5 text-[#64748b]">
                أضف الملفات ثم حدد المستلم والصلاحيات قبل إنشاء رابط المشاركة.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50/75 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" />
                <p className="text-[10px] font-bold leading-5 text-cyan-900">
                  سيتم إنشاء الحزمة باسم الموظف الحالي:
                  <span className="font-black">
                    {" "}
                    {user?.name || user?.nameAr || "المستخدم الحالي"}
                  </span>
                </p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            <div className="mb-4 rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1] p-3 lg:hidden">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black text-[#123f59]">
                  الخطوة {step} من 5
                </span>
                <span className="text-xs font-black text-[#c5983c]">
                  {steps.find((s) => s.id === step)?.title}
                </span>
              </div>
              <StepDots step={step} />
            </div>

            {step === 1 && (
              <StepShell
                icon={FileBox}
                title="تجميع الملفات للحزمة"
                subtitle="اختر الملفات من جهازك أو من مكتبة النظام لإدراجها في الحزمة."
              >
                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                    relative flex min-h-[220px] flex-col items-center justify-center
                    overflow-hidden rounded-[28px] border-2 border-dashed p-8
                    text-center transition-all
                    ${
                      isDragging
                        ? "scale-[0.99] border-emerald-400 bg-emerald-50"
                        : "border-[#d8b46a]/45 bg-[#fbf8f1]/80 hover:border-[#c5983c]"
                    }
                  `}
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-[#eef7f6]/60" />

                  <div
                    className="
                      relative z-10 mb-4 grid h-16 w-16 place-items-center
                      rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
                      text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                    "
                  >
                    <Plus className="h-8 w-8" />
                  </div>

                  <h4 className="relative z-10 mb-1 text-base font-black text-[#123f59]">
                    أضف ملفات للحزمة
                  </h4>

                  <p className="relative z-10 mb-5 text-xs font-bold text-[#64748b]">
                    يمكنك السحب والإفلات هنا أو تصفح جهازك
                  </p>

                  <div className="relative z-10 flex flex-wrap justify-center gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="
                        flex h-10 items-center gap-2 rounded-2xl
                        bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                        px-5 text-xs font-black text-white
                        shadow-[0_12px_26px_rgba(18,63,89,0.20)]
                        transition hover:-translate-y-[1px]
                      "
                      type="button"
                    >
                      <UploadCloud className="h-4 w-4 text-[#e2bf74]" />
                      تصفح جهازك
                    </button>

                    <button
                      className="
                        flex h-10 items-center gap-2 rounded-2xl
                        border border-[#d8b46a]/30 bg-white
                        px-5 text-xs font-black text-[#123f59]
                        transition hover:bg-[#f8efe0]
                      "
                      type="button"
                    >
                      <LayoutTemplate className="h-4 w-4 text-[#c5983c]" />
                      من مكتبة النظام
                    </button>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <SectionDivider
                    title={`الملفات المحددة (${formData.selectedFiles.length})`}
                  />

                  {formData.selectedFiles.length === 0 ? (
                    <div className="rounded-[22px] border border-dashed border-[#d8b46a]/35 bg-white/70 py-8 text-center">
                      <p className="text-xs font-black text-[#94a3b8]">
                        لم يتم اختيار أي ملفات بعد
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {formData.selectedFiles.map((f) => (
                        <div
                          key={f.id}
                          className="
                            group flex items-center justify-between gap-3
                            rounded-2xl border border-[#e8ddc8] bg-white
                            p-3 transition hover:border-[#d8b46a]/50
                            hover:bg-[#fbf8f1]
                          "
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-rose-50 text-rose-500">
                              <LayoutTemplate className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p
                                className="truncate text-xs font-black text-[#123f59]"
                                dir="ltr"
                              >
                                {f.name}
                              </p>
                              <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                                {f.size}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => removeFile(f.id)}
                            className="
                              flex min-w-[46px] flex-col items-center justify-center gap-0.5
                              rounded-xl border border-rose-200 bg-rose-50
                              px-2 py-1 text-[8px] font-black text-rose-600
                              transition hover:bg-rose-100
                            "
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                icon={Users}
                title="بيانات الحزمة والمرسل إليه"
                subtitle="حدد عنوان الحزمة، الرسالة، وبيانات المستلم."
              >
                <div className="space-y-5">
                  <FormField label="عنوان الحزمة" required>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      placeholder="مثال: المخططات المعتمدة للمشروع"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="رسالة إضافية">
                    <div className="mb-2 flex justify-end">
                      <button
                        onClick={enhanceMessageWithAI}
                        disabled={isEnhancing || !formData.message}
                        className="
                          flex items-center gap-1.5 rounded-xl
                          border border-[#d8b46a]/30 bg-[#f8efe0]
                          px-3 py-1.5 text-[10px] font-black text-[#123f59]
                          transition hover:bg-[#f3e2be]
                          disabled:cursor-not-allowed disabled:opacity-50
                        "
                        type="button"
                      >
                        {isEnhancing ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5 text-[#c5983c]" />
                        )}
                        تحسين بالذكاء الاصطناعي
                      </button>
                    </div>

                    <textarea
                      value={formData.message}
                      onChange={(e) => updateForm({ message: e.target.value })}
                      placeholder="نرفق لكم المخططات النهائية للاعتماد..."
                      className={`${INPUT_CLASS} h-28 resize-none leading-7`}
                      disabled={isEnhancing}
                    />
                  </FormField>

                  <SectionDivider title="بيانات المرسل إليه" />

                  <div
                    className="
                      rounded-[24px] border border-[#d8b46a]/25
                      bg-gradient-to-br from-[#fbf8f1] via-white to-[#eef7f6]
                      p-4
                    "
                  >
                    <button
                      onClick={() => setShowContactPicker(true)}
                      className="
                        mb-4 flex h-11 w-full items-center justify-center gap-2
                        rounded-2xl border border-cyan-200 bg-cyan-50
                        text-xs font-black text-cyan-800 transition hover:bg-cyan-100
                      "
                      type="button"
                    >
                      <Users className="h-4 w-4" />
                      اختيار من جهات الاتصال
                    </button>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField label="اسم الجهة / العميل">
                        <input
                          type="text"
                          value={
                            selectedContact
                              ? selectedContact.displayName
                              : formData.entityName
                          }
                          onChange={(e) =>
                            !selectedContact &&
                            updateForm({ entityName: e.target.value })
                          }
                          disabled={!!selectedContact}
                          className={INPUT_CLASS}
                          placeholder="الاسم"
                        />
                      </FormField>

                      <FormField label="رقم الجوال">
                        <input
                          type="text"
                          value={
                            selectedContact
                              ? selectedContact.mobile1
                              : formData.mobile
                          }
                          onChange={(e) =>
                            !selectedContact &&
                            updateForm({ mobile: e.target.value })
                          }
                          disabled={!!selectedContact}
                          className={`${INPUT_CLASS} text-left font-mono`}
                          placeholder="05XXXXXXXX"
                          dir="ltr"
                        />
                      </FormField>
                    </div>

                    {selectedContact && (
                      <button
                        onClick={() => setSelectedContact(null)}
                        className="mt-3 text-[10px] font-black text-rose-500 hover:underline"
                        type="button"
                      >
                        إلغاء الربط بجهة الاتصال
                      </button>
                    )}
                  </div>
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                icon={Shield}
                title="الصلاحيات والحماية"
                subtitle="حدد طريقة الوصول وصلاحيات المستلم على الملفات."
              >
                <div className="space-y-6">
                  <SectionDivider title="صلاحيات المستلم على الملفات" />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    {[
                      {
                        id: "view",
                        title: "عرض فقط",
                        icon: Eye,
                        desc: "مشاهدة الملفات بدون تنزيل.",
                      },
                      {
                        id: "download",
                        title: "تنزيل فقط",
                        icon: Download,
                        desc: "تنزيل الملفات مباشرة.",
                      },
                      {
                        id: "both",
                        title: "عرض وتنزيل",
                        icon: FileBox,
                        desc: "عرض وتحميل المرفقات.",
                      },
                    ].map((opt) => (
                      <RadioCard
                        key={opt.id}
                        selected={formData.permissions === opt.id}
                        title={opt.title}
                        description={opt.desc}
                        icon={opt.icon}
                        onClick={() => updateForm({ permissions: opt.id })}
                      />
                    ))}
                  </div>

                  <SectionDivider title="حماية الوصول للرابط" />

                  <div className="space-y-3">
                    {[
                      {
                        id: "open",
                        title: "مفتوح بدون رمز",
                        icon: Unlock,
                        desc: "أي شخص يملك الرابط يمكنه الدخول.",
                      },
                      {
                        id: "pin",
                        title: "محمي برمز PIN",
                        icon: Lock,
                        desc: "يتطلب إدخال رمز صحيح للوصول.",
                      },
                      {
                        id: "expire",
                        title: "ينتهي بوقت محدد",
                        icon: Clock,
                        desc: "يغلق الرابط بعد تاريخ معين.",
                      },
                    ].map((opt) => (
                      <RadioListItem
                        key={opt.id}
                        selected={formData.linkType === opt.id}
                        title={opt.title}
                        description={opt.desc}
                        icon={opt.icon}
                        onClick={() => updateForm({ linkType: opt.id })}
                      />
                    ))}
                  </div>

                  {formData.linkType === "pin" && (
                    <div className="rounded-[22px] border border-[#d8b46a]/25 bg-[#fbf8f1] p-4 animate-in fade-in zoom-in-95">
                      <FormField label="تعيين رمز مرور للرابط">
                        <input
                          type="text"
                          value={formData.pinCode}
                          onChange={(e) =>
                            updateForm({ pinCode: e.target.value })
                          }
                          placeholder="مثال: 9482"
                          className={`${INPUT_CLASS} max-w-xs text-center font-mono tracking-widest`}
                        />
                      </FormField>
                    </div>
                  )}

                  {formData.linkType === "expire" && (
                    <div className="rounded-[22px] border border-[#d8b46a]/25 bg-[#fbf8f1] p-4 animate-in fade-in zoom-in-95">
                      <FormField label="تاريخ ووقت الانتهاء">
                        <input
                          type="datetime-local"
                          value={formData.expireDate}
                          onChange={(e) =>
                            updateForm({ expireDate: e.target.value })
                          }
                          className={`${INPUT_CLASS} max-w-xs text-center`}
                        />
                      </FormField>
                    </div>
                  )}
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                icon={LayoutPanelTop}
                title="معاينة واجهة تنزيل وعرض الوثائق"
                subtitle="عاين كيف ستظهر الحزمة للعميل واضبط التنزيل المباشر."
                fullHeight
              >
                <div className="flex h-full min-h-[520px] flex-col space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-3 py-2">
                      <MonitorSmartphone className="h-4 w-4 text-[#c5983c]" />
                      <span className="text-xs font-black text-[#123f59]">
                        معاينة واجهة العميل
                      </span>
                    </div>

                    <ToggleRow
                      label="تنزيل مباشر بدون واجهة"
                      checked={formData.directDownloadMode}
                      onChange={(checked) =>
                        updateForm({ directDownloadMode: checked })
                      }
                    />
                  </div>

                  <div
                    className="
                      flex min-h-0 flex-1 flex-col overflow-hidden
                      rounded-[26px] border border-[#d8b46a]/30
                      bg-slate-100 shadow-inner
                    "
                  >
                    <div className="flex shrink-0 items-center gap-2 border-b border-[#e8ddc8] bg-[#fbf8f1] p-2">
                      <div className="mr-2 flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>

                      <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e8ddc8] bg-white px-3 py-1.5 font-mono text-[10px] font-bold text-[#64748b]">
                        <Lock className="h-3 w-3 text-emerald-500" />
                        <span>https://details-worksystem1.com/s/preview-xyz</span>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-white custom-scrollbar">
                      <div className="pointer-events-auto origin-top md:scale-[0.92]">
                        <ExternalDownloadPage
                          config={{
                            companyName:
                              downloadSettings.companyName ||
                              "مكتب ريمكس للاستشارات الهندسية",
                            brandColor: downloadSettings.brandColor || "#10b981",
                            footerText:
                              downloadSettings.footerText ||
                              "نظام ريمكس للإدارة الهندسية",
                            contactEmail: downloadSettings.contactEmail || "",
                            contactPhone: downloadSettings.contactPhone || "",
                            enableWhatsApp:
                              downloadSettings.enableWhatsApp ?? true,
                            enableEmailCTA:
                              downloadSettings.enableEmailCTA ?? true,
                            enableSms: downloadSettings.enableSms ?? true,

                            title:
                              formData.title ||
                              "حزمة مستندات للاستلام والتنزيل",
                            message:
                              formData.message ||
                              "هذه الواجهة ستظهر للعميل الخارجي عند استقباله للملفات المرسلة من المركز.",
                            status:
                              formData.linkType === "pin"
                                ? "pin-required"
                                : "active",
                            pinCode: formData.pinCode,
                            permissions: formData.permissions,
                            showDisclaimer: formData.showDisclaimer,
                            disclaimerText: formData.disclaimerText,

                            files:
                              formData.selectedFiles.length > 0
                                ? formData.selectedFiles
                                : [
                                    {
                                      id: "1",
                                      name: "المخططات المعمارية المعتمدة.pdf",
                                      size: "2.4 MB",
                                      type: "application/pdf",
                                    },
                                  ],
                            directDownloadMode:
                              formData.directDownloadMode || false,
                            isPreview: true,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 5 && generatedLinkData && (
              <div className="flex h-full min-h-[560px] items-center justify-center">
                <div className="w-full max-w-xl text-center">
                  <div
                    className="
                      mx-auto mb-6 grid h-24 w-24 place-items-center
                      rounded-[32px] bg-gradient-to-br from-emerald-600 to-emerald-500
                      text-white shadow-[0_18px_42px_rgba(16,185,129,0.22)]
                    "
                  >
                    <CheckCircle2 className="h-12 w-12" />
                  </div>

                  <h3 className="mb-2 text-2xl font-black text-[#123f59]">
                    الحزمة جاهزة للمشاركة
                  </h3>

                  <p className="mb-8 text-sm font-bold text-[#64748b]">
                    تم حفظ الحزمة وتأمين رابط الإرسال بنجاح.
                  </p>

                  <div
                    className="
                      mb-8 rounded-[28px] border border-[#d8b46a]/30
                      bg-gradient-to-br from-[#fbf8f1] via-white to-[#eef7f6]
                      p-5 shadow-[0_16px_40px_rgba(18,63,89,0.08)]
                    "
                  >
                    <div className="mb-4 flex justify-center">
                      <QrCode className="h-24 w-24 text-[#123f59]" />
                    </div>

                    <div className="flex items-center justify-between gap-2 rounded-2xl border border-[#d8b46a]/25 bg-white p-3">
                      <span
                        className="min-w-0 truncate font-mono text-xs font-black text-[#123f59]"
                        dir="ltr"
                      >
                        {`https://details-worksystem1.com/s/${generatedLinkData.shortLink}`}
                      </span>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://details-worksystem1.com/s/${generatedLinkData.shortLink}`,
                          );
                          toast.success("تم نسخ الرابط");
                        }}
                        className="
                          flex min-w-[48px] flex-col items-center justify-center gap-0.5
                          rounded-xl border border-cyan-200 bg-cyan-50
                          px-2 py-1 text-[8px] font-black text-cyan-800
                          transition hover:bg-cyan-100
                        "
                        title="نسخ الرابط"
                        type="button"
                      >
                        <Copy className="h-4 w-4" />
                        نسخ
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      onClick={() => setShowSender(true)}
                      className="
                        flex h-12 flex-1 items-center justify-center gap-2
                        rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                        text-sm font-black text-white
                        shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                        transition hover:-translate-y-[1px]
                      "
                      type="button"
                    >
                      <Send className="h-4 w-4 text-[#e2bf74]" />
                      شارك الرابط الآن
                    </button>

                    <button
                      onClick={onClose}
                      className="
                        h-12 rounded-2xl border border-[#d8b46a]/30
                        bg-white px-6 text-sm font-black text-[#64748b]
                        transition hover:bg-[#f8efe0]
                      "
                      type="button"
                    >
                      العودة للمركز
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Footer */}
        <footer
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          {step < 5 && (
            <div className="flex items-center justify-between gap-3">
              <button
                disabled={step === 1 || createPackageMutation.isPending}
                onClick={() => setStep((s) => s - 1)}
                className="
                  flex h-10 items-center gap-2 rounded-2xl
                  border border-[#d8b46a]/30 bg-white px-5
                  text-xs font-black text-[#64748b]
                  transition hover:bg-[#f8efe0]
                  disabled:cursor-not-allowed disabled:opacity-50
                "
                type="button"
              >
                <ArrowRight className="h-4 w-4" />
                السابق
              </button>

              <StepDots step={step} />

              {step === 4 ? (
                <button
                  onClick={handleFinalSave}
                  disabled={createPackageMutation.isPending}
                  className="
                    flex h-10 items-center gap-2 rounded-2xl
                    bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                    px-6 text-xs font-black text-white
                    shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                    transition hover:-translate-y-[1px]
                    disabled:cursor-not-allowed disabled:opacity-70
                  "
                  type="button"
                >
                  {createPackageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  اعتماد وإنشاء الرابط
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step < 4) setStep((s) => s + 1);
                  }}
                  className="
                    flex h-10 items-center gap-2 rounded-2xl
                    bg-[#123f59] px-6 text-xs font-black text-white
                    transition hover:bg-[#0f3448]
                  "
                  type="button"
                >
                  التالي
                  <ArrowLeft className="h-4 w-4 text-[#e2bf74]" />
                </button>
              )}
            </div>
          )}
        </footer>
      </div>

      {showSender && generatedLinkData && (
        <TemplateSenderModal
          onClose={() => {
            setShowSender(false);
            onClose();
          }}
          linkInfo={{
            id: generatedLinkData.id,
            url: `https://details-worksystem1.com/s/${generatedLinkData.shortLink}`,
            title: generatedLinkData.title,
            targetCompany: formData.entityName || "",
            pin: formData.pinCode,
            expireDate: formData.expireDate,
            type: "send",
          }}
        />
      )}

      {showContactPicker && (
        <ContactPicker
          onClose={() => setShowContactPicker(false)}
          onSelect={(contacts) => {
            setSelectedContact(contacts[0]);
            setShowContactPicker(false);
            updateForm({
              entityName: contacts[0].displayName,
              mobile: contacts[0].mobile1,
            });
          }}
          multiSelect={false}
        />
      )}
    </div>
  );
}

const StepButton = ({ step, currentStep, disabled, onClick }) => {
  const Icon = step.icon;
  const completed = currentStep > step.id;
  const active = currentStep === step.id;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex w-full items-center gap-3 rounded-2xl border p-3
        text-right text-xs font-black transition-all
        ${
          active
            ? "border-[#d8b46a]/40 bg-gradient-to-l from-[#123f59] to-[#0e7490] text-white shadow-[0_12px_28px_rgba(18,63,89,0.18)]"
            : completed
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-[#e8ddc8] bg-white text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"
        }
        disabled:cursor-not-allowed disabled:opacity-50
      `}
      type="button"
    >
      <span
        className={`
          grid h-9 w-9 shrink-0 place-items-center rounded-xl
          ${
            active
              ? "bg-white/15 text-[#e2bf74]"
              : completed
                ? "bg-emerald-100 text-emerald-700"
                : "bg-[#f8efe0] text-[#c5983c]"
          }
        `}
      >
        {completed ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
      </span>

      <span className="truncate">{step.title}</span>
    </button>
  );
};

const StepShell = ({ icon: Icon, title, subtitle, children, fullHeight = false }) => (
  <div className={`animate-in fade-in slide-in-from-left-4 ${fullHeight ? "h-full" : ""}`}>
    <div className="mb-5 flex items-start gap-3 border-b border-[#e8ddc8] pb-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
        <Icon className="h-5 w-5" />
      </span>

      <div>
        <h3 className="text-base font-black text-[#123f59]">{title}</h3>
        <p className="mt-1 text-xs font-bold text-[#64748b]">{subtitle}</p>
      </div>
    </div>

    {children}
  </div>
);

const SectionDivider = ({ title }) => (
  <div className="flex items-center gap-3">
    <span className="h-px flex-1 bg-[#e8ddc8]" />
    <span className="text-xs font-black text-[#123f59]">{title}</span>
    <span className="h-px flex-1 bg-[#e8ddc8]" />
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-black text-[#123f59]">
      {label}
      {required && <span className="mr-1 text-rose-500">*</span>}
    </label>

    {children}
  </div>
);

const RadioCard = ({ selected, title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center gap-3 rounded-[22px] border p-4 text-center
      transition-all hover:-translate-y-[1px]
      ${
        selected
          ? "border-[#d8b46a]/45 bg-[#fbf8f1] ring-2 ring-[#c5983c]/15"
          : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/40"
      }
    `}
    type="button"
  >
    <span
      className={`
        grid h-11 w-11 shrink-0 place-items-center rounded-2xl
        ${selected ? "bg-[#123f59] text-[#e2bf74]" : "bg-[#f8efe0] text-[#c5983c]"}
      `}
    >
      <Icon className="h-5 w-5" />
    </span>

    <span>
      <span className="block text-sm font-black text-[#123f59]">{title}</span>
      <span className="mt-1 block text-xs font-bold leading-6 text-[#64748b]">
        {description}
      </span>
    </span>
  </button>
);

const RadioListItem = ({ selected, title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex w-full items-start gap-3 rounded-[22px] border p-4 text-right
      transition-all hover:-translate-y-[1px]
      ${
        selected
          ? "border-[#d8b46a]/45 bg-[#fbf8f1] ring-2 ring-[#c5983c]/15"
          : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/40"
      }
    `}
    type="button"
  >
    <span
      className={`
        grid h-10 w-10 shrink-0 place-items-center rounded-2xl
        ${selected ? "bg-[#123f59] text-[#e2bf74]" : "bg-[#f8efe0] text-[#c5983c]"}
      `}
    >
      <Icon className="h-5 w-5" />
    </span>

    <span>
      <span className="block text-sm font-black text-[#123f59]">{title}</span>
      <span className="mt-1 block text-xs font-bold leading-6 text-[#64748b]">
        {description}
      </span>
    </span>
  </button>
);

const ToggleRow = ({ label, checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="
      flex items-center justify-between gap-3 rounded-2xl
      border border-[#d8b46a]/25 bg-white
      px-3 py-2 text-xs font-black text-[#123f59]
      transition hover:bg-[#fbf8f1]
    "
    type="button"
  >
    <span className="flex items-center gap-2">
      <CheckSquare className="h-4 w-4 text-[#c5983c]" />
      {label}
    </span>

    <span
      className={`
        relative h-6 w-12 rounded-full transition-colors
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

const StepDots = ({ step }) => (
  <div className="flex items-center justify-center gap-1.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className={`
          h-1.5 rounded-full transition-all
          ${
            i === step
              ? "w-9 bg-[#123f59]"
              : i < step
                ? "w-4 bg-[#c5983c]"
                : "w-3 bg-[#e8ddc8]"
          }
        `}
      />
    ))}
  </div>
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
  disabled:bg-slate-100 disabled:text-slate-500
`;