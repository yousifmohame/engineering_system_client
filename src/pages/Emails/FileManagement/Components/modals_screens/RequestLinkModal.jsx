import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import {
  FileBox,
  UploadCloud,
  Activity,
  Shield,
  LayoutPanelTop,
  Send,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Users,
  Search,
  Unlock,
  Lock,
  Hash,
  Calendar,
  CheckSquare,
  MonitorSmartphone,
  QrCode,
  Copy,
  Loader2,
  Info,
  Sparkles,
  Building2,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import ExternalUploadPage from "../ExternalUploadPage";
import TemplateSenderModal from "../TemplateSenderModal";
import ContactPicker from "../ContactPicker";
import { useAuth } from "../../../../../context/AuthContext";

export default function RequestLinkModal({ onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [showSender, setShowSender] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [generatedLinkData, setGeneratedLinkData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    targetType: "specific",
    entityName: "",
    mobile: "",
    email: "",
    reqSenderName: true,
    reqSenderMobile: true,
    reqSenderEmail: true,
    reqSenderNote: false,
    reqRefNumber: false,
    allowMultiple: true,
    maxFiles: 10,
    maxFileSize: 50,
    totalSize: 500,
    linkType: "open",
    pinCode: "",
    expireDate: "",
    maxUses: 0,
    allowedTypes: "all",
    showDisclaimer: true,
    disclaimerText:
      "برفعك لهذه الملفات، أنت تقر بأنها صحيحة وخالية من أي فيروسات وتتحمل كامل المسؤولية القانونية.",
    systemLinkStatus: "unlinked",
    linkedEntityId: "",
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

  const uploadSettings = centerData?.settings?.uploadSettings || {};

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/transfer-center/requests", data);
      return response.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        setGeneratedLinkData(res.data);
        setStep(6);
        toast.success("تم إنشاء وتأمين الرابط بنجاح");
        queryClient.invalidateQueries(["transfer-center-data"]);
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "حدث خطأ أثناء إنشاء الرابط، يرجى المحاولة لاحقاً",
      );
    },
  });

  const handleFinalSave = () => {
    if (!formData.title) {
      return toast.error("يرجى إدخال عنوان الطلب قبل الاعتماد");
    }

    createRequestMutation.mutate(formData);
  };

  const steps = [
    { id: 1, title: "تفاصيل الطلب", icon: FileBox },
    { id: 2, title: "إعدادات الرفع", icon: UploadCloud },
    { id: 3, title: "الربط بالنظام", icon: Activity },
    { id: 4, title: "الحماية والصلاحية", icon: Shield },
    { id: 5, title: "البراندينج والمعاينة", icon: LayoutPanelTop },
    { id: 6, title: "الإرسال والاعتماد", icon: Send },
  ];

  const securityPercent =
    formData.linkType === "pin"
      ? 90
      : formData.linkType === "single" || formData.linkType === "expire"
        ? 70
        : 40;

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
                <LinkIcon className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-lg font-black md:text-xl">
                  إنشاء رابط طلب وثائق احترافي
                </h2>

                <p className="mt-1 truncate text-xs font-bold text-white/65">
                  نموذج متقدم لتجهيز وحماية رابط استقبال الملفات
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
          {/* Sidebar Steps */}
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
                  disabled={s.id === 6 && !generatedLinkData}
                  onClick={() => {
                    if (s.id === 6 && !generatedLinkData) return;
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
                    مؤشر الأمان
                  </span>
                  <span className="text-[10px] font-bold text-[#64748b]">
                    حسب إعدادات الرابط
                  </span>
                </div>
              </div>

              <div className="h-2 w-full overflow-hidden rounded-full bg-[#e8ddc8]">
                <div
                  className="h-full rounded-full bg-gradient-to-l from-[#123f59] to-[#e2bf74] transition-all duration-500"
                  style={{ width: `${securityPercent}%` }}
                />
              </div>

              <p className="mt-3 text-[10px] font-bold leading-5 text-[#64748b]">
                اضبط إعدادات الحماية في الخطوة 4 للحصول على أقصى أمان للرابط.
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-cyan-200 bg-cyan-50/75 p-3">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-800" />
                <p className="text-[10px] font-bold leading-5 text-cyan-900">
                  سيتم إنشاء الرابط باسم الموظف الحالي:
                  <span className="font-black"> {user?.name || user?.nameAr || "المستخدم الحالي"}</span>
                </p>
              </div>
            </div>
          </aside>

          {/* Form Content Area */}
          <main className="min-w-0 flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
            {/* Mobile step indicator */}
            <div className="mb-4 rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1] p-3 lg:hidden">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-black text-[#123f59]">
                  الخطوة {step} من 6
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
                title="المعلومات الأساسية للطلب"
                subtitle="حدد عنوان الطلب، وصف الوثائق، وجهة الاتصال المستهدفة."
              >
                <div className="space-y-5">
                  <FormField
                    label="عنوان الطلب"
                    required
                    hint="يظهر للمستلم في صفحة الرفع"
                  >
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      placeholder="مثال: طلب مستندات رخصة بناء لفيلا الملقا"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <FormField label="وصف تفصيلي للوثائق المطلوبة">
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        updateForm({ description: e.target.value })
                      }
                      placeholder="نرجو تزويدنا بالمخططات المعمارية وصورة الصك..."
                      className={`${INPUT_CLASS} h-28 resize-none leading-7`}
                    />
                  </FormField>

                  <FormField label="تعليمات إضافية للمرسل">
                    <input
                      type="text"
                      value={formData.instructions}
                      onChange={(e) =>
                        updateForm({ instructions: e.target.value })
                      }
                      placeholder="ملاحظة: المرجو دمج المخططات في ملف PDF واحد إن أمكن"
                      className={INPUT_CLASS}
                    />
                  </FormField>

                  <SectionDivider title="توجيه الطلب وجهة الاتصال" />

                  <div className="grid gap-3 md:grid-cols-2">
                    <RadioCard
                      selected={formData.targetType === "specific"}
                      title="لشخص / جهة محددة"
                      description="يتم توجيه الرابط إلى عميل أو جهة اتصال محددة."
                      icon={Users}
                      onClick={() => updateForm({ targetType: "specific" })}
                    />

                    <RadioCard
                      selected={formData.targetType === "general"}
                      title="رابط عام"
                      description="استقبال مفتوح من أي شخص يملك الرابط."
                      icon={LinkIcon}
                      onClick={() => updateForm({ targetType: "general" })}
                    />
                  </div>

                  {formData.targetType === "specific" && (
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
                  )}
                </div>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell
                icon={UploadCloud}
                title="بيانات المرسل وقيود الرفع"
                subtitle="حدد الحقول المطلوبة وحدود رفع الملفات."
              >
                <div className="space-y-6">
                  <div>
                    <SectionDivider title="الحقول الإلزامية المطلوبة من المرسل" />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      <CheckOption
                        checked={formData.reqSenderName}
                        label="اسم المرسل"
                        onChange={(checked) =>
                          updateForm({ reqSenderName: checked })
                        }
                      />

                      <CheckOption
                        checked={formData.reqSenderMobile}
                        label="رقم الجوال"
                        onChange={(checked) =>
                          updateForm({ reqSenderMobile: checked })
                        }
                      />

                      <CheckOption
                        checked={formData.reqSenderEmail}
                        label="البريد الإلكتروني"
                        onChange={(checked) =>
                          updateForm({ reqSenderEmail: checked })
                        }
                      />

                      <CheckOption
                        checked={formData.reqSenderNote}
                        label="ملاحظة نصية"
                        onChange={(checked) =>
                          updateForm({ reqSenderNote: checked })
                        }
                      />

                      <CheckOption
                        checked={formData.reqRefNumber}
                        label="رقم مرجعي"
                        onChange={(checked) =>
                          updateForm({ reqRefNumber: checked })
                        }
                      />
                    </div>
                  </div>

                  <SectionDivider title="تفاصيل الملفات المسموحة" />

                  <div className="rounded-[24px] border border-[#d8b46a]/25 bg-[#fbf8f1]/70 p-4">
                    <ToggleRow
                      label="السماح برفع ملفات متعددة دفعة واحدة"
                      checked={formData.allowMultiple}
                      onChange={(checked) => updateForm({ allowMultiple: checked })}
                    />

                    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FormField label="الحد الأقصى لعدد الملفات">
                        <input
                          type="number"
                          value={formData.maxFiles}
                          onChange={(e) =>
                            updateForm({ maxFiles: Number(e.target.value) })
                          }
                          className={`${INPUT_CLASS} text-center font-mono`}
                        />
                      </FormField>

                      <FormField label="أقصى حجم للملف MB">
                        <input
                          type="number"
                          value={formData.maxFileSize}
                          onChange={(e) =>
                            updateForm({ maxFileSize: Number(e.target.value) })
                          }
                          className={`${INPUT_CLASS} text-center font-mono`}
                        />
                      </FormField>

                      <FormField label="إجمالي الحجم المسموح MB">
                        <input
                          type="number"
                          value={formData.totalSize}
                          onChange={(e) =>
                            updateForm({ totalSize: Number(e.target.value) })
                          }
                          className={`${INPUT_CLASS} text-center font-mono`}
                        />
                      </FormField>
                    </div>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell
                icon={Activity}
                title="الربط واستلام الملفات"
                subtitle="حدد أين ستظهر الملفات بعد وصولها للنظام."
              >
                <div className="space-y-5">
                  <div
                    className="
                      flex items-start gap-3 rounded-[22px]
                      border border-cyan-200 bg-cyan-50/80
                      p-4 text-cyan-900
                    "
                  >
                    <Activity className="mt-0.5 h-5 w-5 shrink-0" />
                    <p className="text-sm font-bold leading-7">
                      توجيه الملفات المستلمة يحدد أين ستظهر فور وصولها في النظام
                      لتقليل عبء الفرز اليدوي.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: "unlinked",
                        title: "صندوق الاستقبال العام",
                        desc: "تصل الملفات إلى مركز الإرسال وتنتظر التوزيع.",
                      },
                      {
                        id: "client",
                        title: "ربط بملف عميل",
                        desc: "تضاف فوراً إلى محفظة الوثائق الخاصة بالعميل.",
                      },
                      {
                        id: "transaction",
                        title: "ربط بمعاملة نشطة",
                        desc: "ترفق كمسوغات ضمن معاملة محددة.",
                      },
                      {
                        id: "property",
                        title: "ربط بملكية / عقار",
                        desc: "تدرج ضمن أرشيف العقار.",
                      },
                    ].map((opt) => (
                      <RadioListItem
                        key={opt.id}
                        selected={formData.systemLinkStatus === opt.id}
                        title={opt.title}
                        description={opt.desc}
                        onClick={() => updateForm({ systemLinkStatus: opt.id })}
                      />
                    ))}
                  </div>

                  {formData.systemLinkStatus !== "unlinked" && (
                    <div className="animate-in fade-in zoom-in-95">
                      <FormField label="البحث عن السجل المرتبط">
                        <div className="relative">
                          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />
                          <input
                            type="text"
                            placeholder="ابحث برقم المعاملة أو اسم العميل..."
                            className={`${INPUT_CLASS} pr-10`}
                          />
                        </div>
                      </FormField>
                    </div>
                  )}
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell
                icon={Shield}
                title="الحماية والصلاحية"
                subtitle="حدد نوع الرابط، مدة صلاحيته، ونص إخلاء المسؤولية."
              >
                <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {[
                      {
                        id: "open",
                        title: "رابط مفتوح",
                        icon: Unlock,
                        desc: "أي شخص يملك الرابط يمكنه الرفع بحرية.",
                      },
                      {
                        id: "pin",
                        title: "محمي برمز PIN",
                        icon: Lock,
                        desc: "يتطلب إدخال رمز مرور لفتح صفحة الرفع.",
                      },
                      {
                        id: "single",
                        title: "استخدام لمرة واحدة",
                        icon: Hash,
                        desc: "ينتهي الرابط فور الانتهاء من عملية رفع واحدة.",
                      },
                      {
                        id: "expire",
                        title: "ينتهي بتاريخ",
                        icon: Calendar,
                        desc: "صالح للرفع حتى تاريخ معين فقط.",
                      },
                    ].map((opt) => (
                      <RadioCard
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
                          onChange={(e) => updateForm({ pinCode: e.target.value })}
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

                  <div className="rounded-[24px] border border-rose-200 bg-rose-50/80 p-4">
                    <ToggleRow
                      label="عرض نص إخلاء المسؤولية Disclaimer"
                      checked={formData.showDisclaimer}
                      onChange={(checked) =>
                        updateForm({ showDisclaimer: checked })
                      }
                      icon={CheckSquare}
                      tone="rose"
                    />

                    {formData.showDisclaimer && (
                      <textarea
                        value={formData.disclaimerText}
                        onChange={(e) =>
                          updateForm({ disclaimerText: e.target.value })
                        }
                        className="
                          mt-4 h-24 w-full resize-none rounded-2xl
                          border border-rose-200 bg-white
                          p-3 text-xs font-bold leading-6 text-rose-800
                          outline-none transition
                          focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10
                        "
                      />
                    )}
                  </div>
                </div>
              </StepShell>
            )}

            {step === 5 && (
              <StepShell
                icon={LayoutPanelTop}
                title="هوية المتصفح ومعاينة الرابط"
                subtitle="عاين واجهة الرفع كما ستظهر للعميل الخارجي."
                fullHeight
              >
                <div className="flex h-full min-h-[520px] flex-col space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-3 py-2">
                      <MonitorSmartphone className="h-4 w-4 text-[#c5983c]" />
                      <span className="text-xs font-black text-[#123f59]">
                        معاينة ديسكتوب
                      </span>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[26px] border border-[#d8b46a]/30 bg-slate-100 shadow-inner">
                    <div className="flex shrink-0 items-center gap-2 border-b border-[#e8ddc8] bg-[#fbf8f1] p-2">
                      <div className="mr-2 flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>

                      <div className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#e8ddc8] bg-white px-3 py-1.5 font-mono text-[10px] font-bold text-[#64748b]">
                        <Lock className="h-3 w-3 text-emerald-500" />
                        <span>https://details-worksystem1.com/req/preview-xyz</span>
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto bg-white custom-scrollbar">
                      <ExternalUploadPage
                        config={{
                          companyName:
                            uploadSettings.companyName ||
                            "مكتب ريمكس للاستشارات الهندسية",
                          brandColor: uploadSettings.brandColor || "#4f46e5",
                          footerText:
                            uploadSettings.footerText ||
                            "نظام ريمكس للإدارة الهندسية",
                          contactEmail:
                            uploadSettings.contactEmail || "info@remix-eng.com",
                          contactPhone:
                            uploadSettings.contactPhone || "920000000",
                          enableWhatsApp: uploadSettings.enableWhatsApp ?? true,
                          enableEmailCTA: uploadSettings.enableEmailCTA ?? true,
                          enableSms: uploadSettings.enableSms ?? true,
                          title: formData.title || "طلب ملفات ووثائق المشروع",
                          welcomeText:
                            formData.description ||
                            "نأمل منكم تزويدنا بالملفات المطلوبة أدناه للبدء في الإجراءات.",
                          status:
                            formData.linkType === "pin"
                              ? "pin-required"
                              : "active",
                          pinCode: formData.pinCode,
                          clientName: formData.entityName || "عميل تجريبي",
                          showClientName: formData.targetType === "specific",
                          reqDescription: formData.instructions,
                          showReqDescription: !!formData.instructions,
                          reqRefNumber: "SYS-REQ-99X",
                          showRefNumber: true,
                          reqSenderName: formData.reqSenderName,
                          reqSenderMobile: formData.reqSenderMobile,
                          reqSenderEmail: formData.reqSenderEmail,
                          reqSenderNote: formData.reqSenderNote,
                          maxFiles: formData.maxFiles,
                          maxFileSize: formData.maxFileSize,
                          allowedTypes: ["all"],
                          showDisclaimer: formData.showDisclaimer,
                          disclaimerText: formData.disclaimerText,
                          isPreview: true,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </StepShell>
            )}

            {step === 6 && generatedLinkData && (
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
                    الرابط جاهز للعمل
                  </h3>

                  <p className="mb-8 text-sm font-bold text-[#64748b]">
                    تم توليد الرابط وتأمين صلاحياته بنجاح في قاعدة البيانات.
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
                        {`https://details-worksystem1.com/req/${generatedLinkData.shortLink}`}
                      </span>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://details-worksystem1.com/req/${generatedLinkData.shortLink}`,
                          );
                          toast.success("تم نسخ الرابط الحقيقي بنجاح");
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
                      إرسال الرابط للعميل الآن
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

        {/* Footer Navigation */}
        <footer
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          {step < 6 && (
            <div className="flex items-center justify-between gap-3">
              <button
                disabled={step === 1 || createRequestMutation.isPending}
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

              {step === 5 ? (
                <button
                  onClick={handleFinalSave}
                  disabled={createRequestMutation.isPending}
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
                  {createRequestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-[#e2bf74]" />
                  )}
                  اعتماد وحفظ الرابط
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step < 5) setStep((s) => s + 1);
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
            url: `https://details-worksystem1.com/req/${generatedLinkData.shortLink}`,
            title: generatedLinkData.title,
            targetName: formData.entityName,
            pin: formData.pinCode,
            expireDate: formData.expireDate,
            type: "request",
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
        {completed ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
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

const FormField = ({ label, required, hint, children }) => (
  <div>
    <div className="mb-1.5 flex items-center justify-between gap-2">
      <label className="text-xs font-black text-[#123f59]">
        {label}
        {required && <span className="mr-1 text-rose-500">*</span>}
      </label>

      {hint && <span className="text-[10px] font-bold text-[#94a3b8]">{hint}</span>}
    </div>

    {children}
  </div>
);

const RadioCard = ({ selected, title, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`
      flex items-start gap-3 rounded-[22px] border p-4 text-right
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

const RadioListItem = ({ selected, title, description, onClick }) => (
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
        mt-1 h-4 w-4 shrink-0 rounded-full border
        ${selected ? "border-[#123f59] bg-[#123f59] shadow-[0_0_0_4px_rgba(18,63,89,0.12)]" : "border-[#cbd5e1] bg-white"}
      `}
    />

    <span>
      <span className="block text-sm font-black text-[#123f59]">{title}</span>
      <span className="mt-1 block text-xs font-bold leading-6 text-[#64748b]">
        {description}
      </span>
    </span>
  </button>
);

const CheckOption = ({ checked, label, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`
      flex items-center gap-3 rounded-2xl border p-3 text-right
      transition-all hover:-translate-y-[1px]
      ${
        checked
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-[#e8ddc8] bg-white text-[#64748b] hover:bg-[#fbf8f1]"
      }
    `}
    type="button"
  >
    <span
      className={`
        grid h-7 w-7 place-items-center rounded-xl border
        ${checked ? "border-emerald-300 bg-white text-emerald-700" : "border-[#e8ddc8] bg-[#fbf8f1] text-[#94a3b8]"}
      `}
    >
      <CheckCircle2 className="h-4 w-4" />
    </span>

    <span className="text-xs font-black">{label}</span>
  </button>
);

const ToggleRow = ({ label, checked, onChange, icon: Icon = CheckSquare, tone = "blue" }) => {
  const isRose = tone === "rose";

  return (
    <button
      onClick={() => onChange(!checked)}
      className={`
        flex w-full items-center justify-between gap-3 rounded-2xl border p-4
        text-right transition
        ${
          isRose
            ? "border-rose-200 bg-rose-50 text-rose-800"
            : "border-[#e8ddc8] bg-white text-[#123f59]"
        }
      `}
      type="button"
    >
      <span className="flex items-center gap-2 text-xs font-black">
        <Icon className="h-4 w-4" />
        {label}
      </span>

      <span
        className={`
          relative h-6 w-12 rounded-full transition-colors
          ${checked ? (isRose ? "bg-rose-600" : "bg-[#123f59]") : "bg-slate-300"}
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
};

const StepDots = ({ step }) => (
  <div className="flex items-center justify-center gap-1.5">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <span
        key={i}
        className={`
          h-1.5 rounded-full transition-all
          ${i === step ? "w-9 bg-[#123f59]" : i < step ? "w-4 bg-[#c5983c]" : "w-3 bg-[#e8ddc8]"}
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
