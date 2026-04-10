import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Save,
  FileText,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Eye,
  Settings,
  Layout,
  DollarSign,
  Shield,
  QrCode,
  Link as LinkIcon,
  User,
  Building2,
  MapPin,
  Scale,
  FileSignature,
  Users,
  Sparkles,
  Loader2,
  LayoutTemplate,
} from "lucide-react";
import { generateContractHtml } from "../utils/contractExporter";

export default function ContractGenerator({ initialData, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  const [contract, setContract] = useState({
    id: initialData?.id || `C-${Date.now()}`,
    contractId: initialData?.contractId || `C-${Date.now()}`,
    code:
      initialData?.code ||
      (initialData?.isAddendum
        ? `${initialData.baseContractId}-M1`
        : `CT-${Math.floor(Math.random() * 1000)
            .toString()
            .padStart(3, "0")}`),
    name: initialData?.name || "",
    type: initialData?.type || "تصميم",
    status: initialData?.status || "مسودة",
    date: initialData?.date || new Date().toISOString().split("T")[0],
    dueDate: initialData?.dueDate || "",
    partyA: initialData?.partyA || "شركة الحلول الهندسية",
    partyB: initialData?.partyB || "",
    partyADetails: initialData?.partyADetails || {
      representant: "م. أحمد عبدالله",
      cr: "1010123456",
      address: "الرياض، حي الملقا، طريق الملك فهد",
      capacity: "الطرف الأول (مقدم الخدمة)",
    },
    partyBDetails: initialData?.partyBDetails || {
      representant: "",
      idNumber: "",
      address: "",
      phone: "",
      email: "",
      capacity: "الطرف الثاني (العميل)",
    },
    projectDetails: initialData?.projectDetails || {
      name: "",
      location: "",
      city: "",
      deedNumber: "",
      plotNumber: "",
    },
    financials: initialData?.financials || {
      taxAmount: 0,
      grandTotal: 0,
      advancePayment: 0,
    },
    contractValue: initialData?.contractValue || 0,
    paymentTerms: initialData?.paymentTerms || "تحويل بنكي لحساب الشركة",
    signatureStatus: initialData?.signatureStatus || "بانتظار التوقيع",
    scope: initialData?.scope || [],
    paymentSchedule: initialData?.paymentSchedule || [],
    attachments: initialData?.attachments || [],
    terms: initialData?.terms || "",
    specialTerms: initialData?.specialTerms || "",
    obligations: initialData?.obligations || "",
    partyAObligations: initialData?.partyAObligations || "",
    partyBObligations: initialData?.partyBObligations || "",
    generalConditions: initialData?.generalConditions || "",
    governingLaw:
      initialData?.governingLaw ||
      "يخضع هذا العقد للأنظمة والقوانين المعمول بها في المملكة العربية السعودية. في حال نشوء أي خلاف يتم حله ودياً، وإلا يحال للجهات القضائية المختصة.",
    penalties: initialData?.penalties || "",
    conclusion: initialData?.conclusion || "",
    witnesses: initialData?.witnesses || [
      { name: "", id: "" },
      { name: "", id: "" },
    ],
    version: initialData?.version || 1,
    isOriginal: initialData?.isOriginal ?? true,
    isFinal: initialData?.isFinal ?? false,
    isAddendum: initialData?.isAddendum ?? false,
    editPermission: initialData?.editPermission || "all",
    isRestricted: initialData?.isRestricted ?? false,
    statusHistory: initialData?.statusHistory || [],
    isDraft: initialData?.isDraft ?? true,
    baseContractId: initialData?.baseContractId,
    linkedQuoteId: initialData?.linkedQuoteId,
    approvalMethod: initialData?.approvalMethod || "platform",
    qrSettings: initialData?.qrSettings || {
      enabled: true,
      frontQrContent: "link",
      backQrContent: "both",
    },
    introduction:
      initialData?.introduction ||
      "حيث أن الطرف الأول يمتلك الخبرة والكفاءة الفنية اللازمة، وحيث أن الطرف الثاني يرغب في الاستفادة من خدمات الطرف الأول، فقد اتفق الطرفان وهما بكامل الأهلية المعتبرة شرعاً ونظاماً على إبرام هذا العقد وفقاً للبنود التالية:",
    hijriDate:
      initialData?.hijriDate ||
      new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    gregorianDate:
      initialData?.gregorianDate ||
      new Intl.DateTimeFormat("ar-SA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date()),
    coverSettings: initialData?.coverSettings || {
      showLogo: true,
      showSummary: true,
      subtitle: "وثيقة تعاقدية ملزمة",
      version: "1.0",
      background: { opacity: 0.1, size: "cover", applyTo: "all" },
    },
    backCoverSettings: initialData?.backCoverSettings || {
      contactEmail: "info@engineering-solutions.com",
      contactPhone: "+966 50 000 0000",
      address: "الرياض، المملكة العربية السعودية",
      background: { opacity: 0.1, size: "cover", applyTo: "all" },
    },
    verificationSettings: initialData?.verificationSettings || {
      allowPublicVerification: true,
      showParties: false,
      showFinancials: false,
      allowDownload: false,
      customErrorMessage: "عفواً، لا تملك صلاحية لعرض تفاصيل هذا العقد.",
    },
    activePresets: initialData?.activePresets || [],
    legalIntroduction:
      initialData?.legalIntroduction ||
      "الحمد لله والصلاة والسلام على رسول الله، وبعد:\nإنه في يوم الموافق [التاريخ]، تم الاتفاق والتراضي بين كل من:",
    isOnePageSummary: initialData?.isOnePageSummary || false,
    frameSettings: initialData?.frameSettings || {
      pageFrame: {
        enabled: true,
        style: "solid",
        color: "#e2e8f0",
        margin: "20px",
      },
      frontCoverFrame: {
        enabled: true,
        style: "double",
        color: "#0f172a",
        margin: "30px",
      },
      backCoverFrame: {
        enabled: true,
        style: "solid",
        color: "#065f46",
        margin: "30px",
      },
    },
    spacingSettings: initialData?.spacingSettings || {
      lineHeight: "1.8",
      paragraphSpacing: "16px",
      padding: "40px",
    },
    typographySettings: initialData?.typographySettings || {
      fontFamily: "Tajawal",
      fontSize: "14px",
      color: "#0f172a",
    },
    obligationsList: initialData?.obligationsList || [
      {
        id: "o1",
        code: "1.1",
        content: "الالتزام بتقديم المخططات في الموعد المحدد.",
        party: "A",
      },
      {
        id: "o2",
        code: "2.1",
        content: "الالتزام بدفع الدفعات المالية حسب الجدول.",
        party: "B",
      },
    ],
  });

  const [previewHtml, setPreviewHtml] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const previewContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    setPreviewHtml(generateContractHtml(contract));
  }, [contract]);

  // Auto-scale preview to fit width
  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        const targetWidth = 794;
        const availableWidth = containerWidth - 40;
        const scale = availableWidth / targetWidth;
        setPreviewScale(Math.min(scale, 1));
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const [aiModalConfig, setAiModalConfig] = useState({
    isOpen: false,
    field: null,
    currentText: "",
    formality: "strict",
    length: "detailed",
  });

  const openAiModal = (field, currentText) => {
    if (!currentText) return;
    setAiModalConfig((prev) => ({ ...prev, isOpen: true, field, currentText }));
  };

  const executeAiRephrase = async () => {
    if (!aiModalConfig.field) return;
    setIsGeneratingAI(true);
    setAiModalConfig((prev) => ({ ...prev, isOpen: false }));

    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemPrompt = `Act as an expert in legal and engineering contract drafting. Rephrase the following text. Formality: ${aiModalConfig.formality}. Length: ${aiModalConfig.length}.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${systemPrompt}\n\nText to rephrase:\n${aiModalConfig.currentText}`,
      });

      const rephrased = response.text || aiModalConfig.currentText;

      if (aiModalConfig.field === "obligationsList") {
        try {
          const parsed = JSON.parse(rephrased);
          setContract((prev) => ({ ...prev, obligationsList: parsed }));
        } catch (e) {
          console.error("Failed to parse obligations list", e);
        }
      } else if (aiModalConfig.field.startsWith("obs_")) {
        const id = aiModalConfig.field.replace("obs_", "");
        setContract((prev) => {
          const newList = prev.obligationsList?.map((o) =>
            o.id === id ? { ...o, content: rephrased } : o,
          );
          return { ...prev, obligationsList: newList };
        });
      } else {
        setContract((prev) => ({ ...prev, [aiModalConfig.field]: rephrased }));
      }
    } catch (error) {
      console.error("AI Rephrasing failed:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAI(true);
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

      const systemPrompt = `أنت خبير قانوني وهندسي. قم بإنشاء ملخص لعقد بناءً على البيانات التالية.
      الطرف الأول: ${contract.partyA || "غير محدد"}
      الطرف الثاني: ${contract.partyB || "غير محدد"}
      المشروع: ${contract.projectDetails?.name || "غير محدد"}
      المدينة: ${contract.projectDetails?.city || "غير محدد"}
      القيمة الإجمالية: ${contract.financials?.grandTotal || 0} ريال سعودي
      
      المطلوب:
      1. ملخص قصير جداً (سطر واحد) للغلاف.
      2. ملخص شامل (3-4 أسطر) يوضح الالتزامات والجانب المالي والقانون الحاكم.
      
      أعد النتيجة بصيغة JSON كالتالي:
      {
        "coverSummary": "الملخص القصير",
        "aiSummary": "الملخص الشامل"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: systemPrompt,
      });

      const text = response.text || "{}";
      const jsonMatch = text.match(/```(?:json)?\n([\s\S]*?)\n```/) || [
        null,
        text,
      ];
      const jsonString = jsonMatch[1].trim();

      try {
        const parsed = JSON.parse(jsonString);
        setContract((prev) => ({
          ...prev,
          coverSummary: parsed.coverSummary || prev.coverSummary,
          aiSummary: parsed.aiSummary || prev.aiSummary,
        }));
      } catch (e) {
        console.error("Failed to parse AI summary JSON", e);
      }
    } catch (error) {
      console.error("AI Summary generation failed:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const steps = [
    { id: 1, title: "البيانات والأطراف", icon: Users },
    { id: 2, title: "المشروع والنطاق", icon: MapPin },
    { id: 3, title: "المالية والدفعات", icon: DollarSign },
    { id: 4, title: "الشروط والالتزامات", icon: Scale },
    { id: 5, title: "إعدادات الغلاف والتحقق", icon: Settings },
    { id: 6, title: "إعدادات القوالب", icon: LayoutTemplate },
    { id: 7, title: "تنسيق المستند", icon: Layout },
    { id: 8, title: "تقييم المخاطر (AI)", icon: Shield },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-slate-900/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
        {/* Left Panel: Inputs */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border-l border-slate-200 shadow-xl z-10 h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {contract.isAddendum ? "إنشاء عقد إلحاقي" : "إنشاء عقد جديد"}
              </h2>
              <p className="text-xs text-slate-500 font-bold">
                أدخل بيانات العقد بدقة لضمان الموثوقية القانونية
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onCancel}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Export Button Area */}
          <div className="px-4 py-2 border-b border-slate-100 flex justify-end">
            <button
              onClick={() => {
                const html = generateContractHtml(contract);
                const printWindow = window.open("", "_blank");
                if (printWindow) {
                  printWindow.document.write(html);
                  printWindow.document.close();
                  printWindow.focus();
                  setTimeout(() => printWindow.print(), 500);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <FileText className="w-4 h-4" />
              تصدير إلى PDF
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0 overflow-x-auto scrollbar-hide">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex-1 min-w-[100px] py-3 flex flex-col items-center gap-1 relative transition-colors ${step === s.id ? "text-emerald-700 bg-emerald-50/50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-100/50"}`}
              >
                <s.icon
                  className={`w-4 h-4 ${step === s.id ? "text-emerald-600" : ""}`}
                />
                <span className="text-[10px] font-black">{s.title}</span>
                {step === s.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/30">
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                {/* Basic Info */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileText className="w-4 h-4 text-emerald-600" /> البيانات
                    الأساسية
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        عنوان العقد
                      </label>
                      <input
                        type="text"
                        value={contract.name}
                        onChange={(e) =>
                          setContract({ ...contract, name: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="مثال: عقد تصميم فيلا سكنية"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        تاريخ العقد (ميلادي)
                      </label>
                      <input
                        type="date"
                        value={contract.date}
                        onChange={(e) => {
                          const gDate = new Date(e.target.value);
                          const hDate = new Intl.DateTimeFormat(
                            "ar-SA-u-ca-islamic",
                            { day: "numeric", month: "long", year: "numeric" },
                          ).format(gDate);
                          setContract({
                            ...contract,
                            date: e.target.value,
                            hijriDate: hDate,
                            gregorianDate: new Intl.DateTimeFormat("ar-SA", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }).format(gDate),
                          });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-black text-slate-700">
                        مقدمة وتمهيد العقد
                      </label>
                      <button
                        onClick={() =>
                          openAiModal(
                            "introduction",
                            contract.introduction || "",
                          )
                        }
                        className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> صياغة ذكية
                      </button>
                    </div>
                    <textarea
                      value={contract.introduction}
                      onChange={(e) =>
                        setContract({
                          ...contract,
                          introduction: e.target.value,
                        })
                      }
                      className="w-full h-24 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
                      placeholder="اكتب التمهيد هنا..."
                    />
                  </div>
                </div>

                {/* Party A */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Building2 className="w-4 h-4 text-emerald-600" /> الطرف
                    الأول (مقدم الخدمة)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        اسم الجهة
                      </label>
                      <input
                        type="text"
                        value={contract.partyA}
                        onChange={(e) =>
                          setContract({ ...contract, partyA: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        يمثلها (المفوض)
                      </label>
                      <input
                        type="text"
                        value={contract.partyADetails?.representant}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyADetails: {
                              ...contract.partyADetails,
                              representant: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        السجل التجاري / الترخيص
                      </label>
                      <input
                        type="text"
                        value={contract.partyADetails?.cr}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyADetails: {
                              ...contract.partyADetails,
                              cr: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        العنوان الوطني
                      </label>
                      <input
                        type="text"
                        value={contract.partyADetails?.address}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyADetails: {
                              ...contract.partyADetails,
                              address: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Party B */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <User className="w-4 h-4 text-emerald-600" /> الطرف الثاني
                    (العميل)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        اسم العميل / الجهة
                      </label>
                      <input
                        type="text"
                        value={contract.partyB}
                        onChange={(e) =>
                          setContract({ ...contract, partyB: e.target.value })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        يمثلها (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={contract.partyBDetails?.representant}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyBDetails: {
                              ...contract.partyBDetails,
                              representant: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رقم الهوية / السجل التجاري
                      </label>
                      <input
                        type="text"
                        value={contract.partyBDetails?.idNumber}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyBDetails: {
                              ...contract.partyBDetails,
                              idNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رقم الجوال
                      </label>
                      <input
                        type="text"
                        value={contract.partyBDetails?.phone}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyBDetails: {
                              ...contract.partyBDetails,
                              phone: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-black text-slate-700">
                        العنوان الوطني
                      </label>
                      <input
                        type="text"
                        value={contract.partyBDetails?.address}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            partyBDetails: {
                              ...contract.partyBDetails,
                              address: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                {/* Project Details */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <MapPin className="w-4 h-4 text-emerald-600" /> بيانات
                    المشروع
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2">
                      <label className="text-xs font-black text-slate-700">
                        وصف المشروع
                      </label>
                      <input
                        type="text"
                        value={contract.projectDetails?.name}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            projectDetails: {
                              ...contract.projectDetails,
                              name: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="مثال: إنشاء فيلا سكنية دورين وملحق"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        المدينة
                      </label>
                      <input
                        type="text"
                        value={contract.projectDetails?.city}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            projectDetails: {
                              ...contract.projectDetails,
                              city: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        الحي / الموقع
                      </label>
                      <input
                        type="text"
                        value={contract.projectDetails?.location}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            projectDetails: {
                              ...contract.projectDetails,
                              location: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رقم الصك
                      </label>
                      <input
                        type="text"
                        value={contract.projectDetails?.deedNumber}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            projectDetails: {
                              ...contract.projectDetails,
                              deedNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رقم القطعة
                      </label>
                      <input
                        type="text"
                        value={contract.projectDetails?.plotNumber}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            projectDetails: {
                              ...contract.projectDetails,
                              plotNumber: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-emerald-600" /> نطاق العمل
                      التفصيلي
                    </h3>
                    <button
                      onClick={() => openAiModal("terms", contract.terms || "")}
                      disabled={isGeneratingAI || !contract.terms}
                      className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      إعدادات الصياغة الذكية
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <textarea
                      value={contract.terms}
                      onChange={(e) =>
                        setContract({ ...contract, terms: e.target.value })
                      }
                      className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
                      placeholder="اكتب تفاصيل نطاق العمل هنا بشكل دقيق ومفصل..."
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                {/* Financial Summary */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <DollarSign className="w-4 h-4 text-emerald-600" /> قيمة
                    العقد والملخص المالي
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        قيمة العقد (المبلغ الأساسي)
                      </label>
                      <input
                        type="number"
                        value={contract.contractValue}
                        onChange={(e) => {
                          const total = Number(e.target.value);
                          const tax = total * 0.15;
                          setContract({
                            ...contract,
                            contractValue: total,
                            financials: {
                              ...contract.financials,
                              taxAmount: tax,
                              grandTotal: total + tax,
                            },
                          });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        قيمة الضريبة (15%)
                      </label>
                      <input
                        type="number"
                        value={contract.financials?.taxAmount}
                        readOnly
                        className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        الإجمالي الشامل (ريال)
                      </label>
                      <input
                        type="number"
                        value={contract.financials?.grandTotal}
                        readOnly
                        className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-800 outline-none cursor-not-allowed"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    شروط وآلية الدفع
                  </h3>
                  <div className="space-y-1.5">
                    <textarea
                      value={contract.paymentTerms}
                      onChange={(e) =>
                        setContract({
                          ...contract,
                          paymentTerms: e.target.value,
                        })
                      }
                      className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
                      placeholder="مثال: يتم الدفع على دفعات حسب الإنجاز الموضح أدناه..."
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-emerald-600" /> الالتزامات
                      (الطرفين)
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          openAiModal(
                            "obligationsList",
                            JSON.stringify(contract.obligationsList),
                          )
                        }
                        className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" /> صياغة ذكية للجميع
                      </button>
                      <button
                        onClick={() => {
                          const newList = [
                            ...(contract.obligationsList || []),
                            {
                              id: `o${Date.now()}`,
                              code: `1.${(contract.obligationsList?.length || 0) + 1}`,
                              content: "",
                              party: "A",
                            },
                          ];
                          setContract({
                            ...contract,
                            obligationsList: newList,
                          });
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        إضافة التزام جديد
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {contract.obligationsList?.map((obs, index) => (
                      <div
                        key={obs.id}
                        className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100 group"
                      >
                        <div className="w-16 shrink-0">
                          <input
                            type="text"
                            value={obs.code}
                            onChange={(e) => {
                              const newList = [...contract.obligationsList];
                              newList[index].code = e.target.value;
                              setContract({
                                ...contract,
                                obligationsList: newList,
                              });
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                            placeholder="الكود"
                          />
                        </div>
                        <div className="w-32 shrink-0">
                          <select
                            value={obs.party}
                            onChange={(e) => {
                              const newList = [...contract.obligationsList];
                              newList[index].party = e.target.value;
                              setContract({
                                ...contract,
                                obligationsList: newList,
                              });
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          >
                            <option value="A">الطرف الأول</option>
                            <option value="B">الطرف الثاني</option>
                            <option value="Both">كلا الطرفين</option>
                          </select>
                        </div>
                        <div className="flex-1 relative">
                          <textarea
                            value={obs.content}
                            onChange={(e) => {
                              const newList = [...contract.obligationsList];
                              newList[index].content = e.target.value;
                              setContract({
                                ...contract,
                                obligationsList: newList,
                              });
                            }}
                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none min-h-[40px]"
                            placeholder="نص الالتزام..."
                            rows={2}
                          />
                        </div>
                        <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              openAiModal(`obs_${obs.id}`, obs.content)
                            }
                            className="p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg"
                            title="صياغة ذكية"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const btn = document.getElementById(
                                `save-btn-${obs.id}`,
                              );
                              if (btn) {
                                btn.innerHTML =
                                  '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                                btn.classList.add(
                                  "text-emerald-600",
                                  "bg-emerald-50",
                                );
                                setTimeout(() => {
                                  btn.innerHTML =
                                    '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>';
                                  btn.classList.remove(
                                    "text-emerald-600",
                                    "bg-emerald-50",
                                  );
                                }, 2000);
                              }
                            }}
                            id={`save-btn-${obs.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="حفظ في المكتبة"
                          >
                            <Save className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              const newList = contract.obligationsList.filter(
                                (o) => o.id !== obs.id,
                              );
                              setContract({
                                ...contract,
                                obligationsList: newList,
                              });
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg"
                            title="حذف"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-rose-600" /> الشروط العامة
                      والجزاءات
                    </h3>
                    <button
                      onClick={() =>
                        openAiModal(
                          "generalConditions",
                          contract.generalConditions || "",
                        )
                      }
                      disabled={isGeneratingAI || !contract.generalConditions}
                      className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      إعدادات الصياغة الذكية
                    </button>
                  </div>
                  <textarea
                    value={contract.generalConditions}
                    onChange={(e) =>
                      setContract({
                        ...contract,
                        generalConditions: e.target.value,
                      })
                    }
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
                    placeholder="الشروط العامة، فسخ العقد، غرامات التأخير..."
                  />
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Scale className="w-4 h-4 text-slate-600" /> القانون
                      الحاكم
                    </h3>
                    <button
                      onClick={() =>
                        openAiModal("governingLaw", contract.governingLaw || "")
                      }
                      disabled={isGeneratingAI || !contract.governingLaw}
                      className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      إعدادات الصياغة الذكية
                    </button>
                  </div>
                  <textarea
                    value={contract.governingLaw}
                    onChange={(e) =>
                      setContract({ ...contract, governingLaw: e.target.value })
                    }
                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
                    placeholder="يخضع هذا العقد للأنظمة والقوانين المعمول بها في..."
                  />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                {/* Cover Settings */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" /> إعدادات
                      الغلاف الأمامي
                    </h3>
                    <button
                      onClick={handleGenerateAiSummary}
                      disabled={isGeneratingAI}
                      className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Sparkles className="w-3 h-3" />
                      )}
                      توليد ملخص ذكي
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        العنوان الفرعي
                      </label>
                      <input
                        type="text"
                        value={contract.coverSettings?.subtitle || ""}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            coverSettings: {
                              ...contract.coverSettings,
                              subtitle: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="وثيقة تعاقدية ملزمة"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رقم الإصدار
                      </label>
                      <input
                        type="text"
                        value={contract.coverSettings?.version || ""}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            coverSettings: {
                              ...contract.coverSettings,
                              version: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        placeholder="1.0"
                      />
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        ملخص العقد (يظهر في الغلاف)
                      </label>
                      <textarea
                        value={contract.coverSummary || ""}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            coverSummary: e.target.value,
                          })
                        }
                        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
                        placeholder="ملخص مختصر لأهم بنود العقد..."
                      />
                    </div>
                    <div className="col-span-2 flex items-center gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={contract.coverSettings?.showLogo !== false}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              coverSettings: {
                                ...contract.coverSettings,
                                showLogo: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          إظهار الشعار
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            contract.coverSettings?.showSummary !== false
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              coverSettings: {
                                ...contract.coverSettings,
                                showSummary: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          إظهار الملخص
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Background Settings */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <h4 className="text-xs font-black text-slate-800 mb-3">
                      إعدادات الخلفية (صورة الغلاف)
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-bold text-slate-700">
                          رابط الصورة (URL)
                        </label>
                        <input
                          type="text"
                          value={
                            contract.coverSettings?.background?.imageUrl || ""
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              coverSettings: {
                                ...contract.coverSettings,
                                background: {
                                  ...contract.coverSettings?.background,
                                  imageUrl: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          الشفافية (
                          {contract.coverSettings?.background?.opacity || 0.1})
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={
                            contract.coverSettings?.background?.opacity || 0.1
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              coverSettings: {
                                ...contract.coverSettings,
                                background: {
                                  ...contract.coverSettings?.background,
                                  opacity: parseFloat(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          تطبيق على
                        </label>
                        <select
                          value={
                            contract.coverSettings?.background?.applyTo || "all"
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              coverSettings: {
                                ...contract.coverSettings,
                                background: {
                                  ...contract.coverSettings?.background,
                                  applyTo: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                        >
                          <option value="front">الغلاف الأمامي فقط</option>
                          <option value="back">الغلاف الخلفي فقط</option>
                          <option value="all">كافة الصفحات</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* References */}
                <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-blue-800 flex items-center gap-2 border-b border-blue-200 pb-3">
                    <LinkIcon className="w-4 h-4" /> الارتباطات المرجعية
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-blue-700">
                        العقد الأساسي (إن وجد)
                      </label>
                      <input
                        type="text"
                        value={contract.baseContractId || ""}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            baseContractId: e.target.value,
                            isAddendum: !!e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="رقم العقد الأساسي"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-blue-700">
                        عرض السعر المرجعي
                      </label>
                      <input
                        type="text"
                        value={contract.linkedQuoteId || ""}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            linkedQuoteId: e.target.value,
                          })
                        }
                        className="w-full p-2.5 bg-white border border-blue-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 outline-none"
                        placeholder="رقم عرض السعر"
                      />
                    </div>
                  </div>
                </div>

                {/* Approval Method */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Shield className="w-4 h-4 text-emerald-600" /> طريقة
                    الاعتماد
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "platform", label: "منصة رسمية (أبشر/نفاذ)" },
                      { id: "email", label: "بريد إلكتروني موثق" },
                      { id: "whatsapp", label: "رسالة واتساب معتمدة" },
                      { id: "verbal", label: "توقيع ورقي مباشر" },
                    ].map((m) => (
                      <label
                        key={m.id}
                        className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${contract.approvalMethod === m.id ? "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                      >
                        <input
                          type="radio"
                          name="approvalMethod"
                          checked={contract.approvalMethod === m.id}
                          onChange={() =>
                            setContract({ ...contract, approvalMethod: m.id })
                          }
                          className="hidden"
                        />
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${contract.approvalMethod === m.id ? "border-emerald-500" : "border-slate-300"}`}
                        >
                          {contract.approvalMethod === m.id && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                          )}
                        </div>
                        <span className="text-xs font-black">{m.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Verification Settings */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <QrCode className="w-4 h-4 text-emerald-600" /> إعدادات
                    التحقق من العقد
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 flex items-center gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={
                            contract.verificationSettings
                              ?.allowPublicVerification !== false
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              verificationSettings: {
                                ...contract.verificationSettings,
                                allowPublicVerification: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          السماح بالتحقق العام (لأي شخص يمسح الكود)
                        </span>
                      </label>
                    </div>
                    {contract.verificationSettings?.allowPublicVerification !==
                      false && (
                      <>
                        <div className="col-span-2 flex items-center gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                contract.verificationSettings?.showParties
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  verificationSettings: {
                                    ...contract.verificationSettings,
                                    showParties: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-700">
                              إظهار بيانات الأطراف
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                contract.verificationSettings?.showFinancials
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  verificationSettings: {
                                    ...contract.verificationSettings,
                                    showFinancials: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-700">
                              إظهار البيانات المالية
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={
                                contract.verificationSettings?.allowDownload
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  verificationSettings: {
                                    ...contract.verificationSettings,
                                    allowDownload: e.target.checked,
                                  },
                                })
                              }
                              className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                            />
                            <span className="text-xs font-bold text-slate-700">
                              السماح بتحميل نسخة PDF
                            </span>
                          </label>
                        </div>
                      </>
                    )}
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رسالة الخطأ (عند عدم وجود صلاحية)
                      </label>
                      <input
                        type="text"
                        value={
                          contract.verificationSettings?.customErrorMessage ||
                          "عفواً، لا تملك صلاحية لعرض تفاصيل هذا العقد."
                        }
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            verificationSettings: {
                              ...contract.verificationSettings,
                              customErrorMessage: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Witnesses */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                    <FileSignature className="w-4 h-4 text-emerald-600" />{" "}
                    الشهود (اختياري)
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        اسم الشاهد الأول
                      </label>
                      <input
                        type="text"
                        value={contract.witnesses?.[0]?.name || ""}
                        onChange={(e) => {
                          const w = [...(contract.witnesses || [])];
                          if (!w[0]) w[0] = { name: "", id: "" };
                          w[0].name = e.target.value;
                          setContract({ ...contract, witnesses: w });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رقم هوية الشاهد الأول
                      </label>
                      <input
                        type="text"
                        value={contract.witnesses?.[0]?.id || ""}
                        onChange={(e) => {
                          const w = [...(contract.witnesses || [])];
                          if (!w[0]) w[0] = { name: "", id: "" };
                          w[0].id = e.target.value;
                          setContract({ ...contract, witnesses: w });
                        }}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* QR Settings */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-emerald-600" /> إعدادات
                      الرموز (QR Codes)
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={contract.qrSettings?.enabled}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            qrSettings: {
                              ...contract.qrSettings,
                              enabled: e.target.checked,
                            },
                          })
                        }
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  {contract.qrSettings?.enabled && (
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">
                          رابط موقع المشروع (خرائط جوجل)
                        </label>
                        <input
                          type="text"
                          value={contract.qrSettings?.projectLocationUrl || ""}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              qrSettings: {
                                ...contract.qrSettings,
                                projectLocationUrl: e.target.value,
                              },
                            })
                          }
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500/20 outline-none"
                          dir="ltr"
                          placeholder="https://maps.google.com/..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <LayoutTemplate className="w-4 h-4 text-emerald-600" />{" "}
                      قوالب نطاق العمل
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-bold mb-4">
                    اختر القوالب الجاهزة التي ترغب بتطبيقها على هذا العقد. سيتم
                    دمج بنود القوالب المحددة مع نطاق العمل الحالي.
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        id: "p1",
                        name: "قالب تصميم فيلا سكنية",
                        description:
                          "يشمل التصميم المعماري والإنشائي والواجهات",
                        conditions: "سكني، فيلا",
                        items: [
                          { content: "التصميم المعماري المبدئي والنهائي" },
                          { content: "المخططات الإنشائية" },
                        ],
                      },
                      {
                        id: "p2",
                        name: "قالب إشراف هندسي",
                        description: "يشمل الزيارات الميدانية وتقارير الإشراف",
                        conditions: "إشراف، تجاري/سكني",
                        items: [
                          { content: "زيارات ميدانية أسبوعية" },
                          { content: "تقارير شهرية" },
                        ],
                      },
                      {
                        id: "p3",
                        name: "قالب تصميم داخلي",
                        description: "يشمل المخططات التنفيذية وجداول الكميات",
                        conditions: "تصميم داخلي",
                        items: [
                          { content: "مخططات تنفيذية للديكور" },
                          { content: "جداول كميات المواد" },
                        ],
                      },
                    ].map((preset) => (
                      <label
                        key={preset.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${contract.activePresets?.includes(preset.id) ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
                      >
                        <div className="mt-0.5">
                          <input
                            type="checkbox"
                            checked={
                              contract.activePresets?.includes(preset.id) ||
                              false
                            }
                            onChange={(e) => {
                              const current = contract.activePresets || [];
                              const updated = e.target.checked
                                ? [...current, preset.id]
                                : current.filter((id) => id !== preset.id);

                              let newTerms = contract.terms || "";
                              if (e.target.checked) {
                                const presetContent = preset.items
                                  .map((item) => `- ${item.content}`)
                                  .join("\n");
                                newTerms = newTerms
                                  ? `${newTerms}\n\n${presetContent}`
                                  : presetContent;
                              }

                              setContract({
                                ...contract,
                                activePresets: updated,
                                terms: newTerms,
                              });
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4
                              className={`text-sm font-black ${contract.activePresets?.includes(preset.id) ? "text-emerald-900" : "text-slate-800"}`}
                            >
                              {preset.name}
                            </h4>
                            <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {preset.conditions}
                            </span>
                          </div>
                          <p
                            className={`text-xs mt-1 ${contract.activePresets?.includes(preset.id) ? "text-emerald-700" : "text-slate-500"}`}
                          >
                            {preset.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {step === 7 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Layout className="w-4 h-4 text-emerald-600" /> إعدادات
                      الإطارات (Frames)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Page Frame */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700">
                          إطار الصفحات الداخلية
                        </label>
                        <input
                          type="checkbox"
                          checked={contract.frameSettings?.pageFrame?.enabled}
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              frameSettings: {
                                ...contract.frameSettings,
                                pageFrame: {
                                  ...contract.frameSettings?.pageFrame,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                      </div>
                      {contract.frameSettings?.pageFrame?.enabled && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">
                              النمط
                            </label>
                            <select
                              value={contract.frameSettings.pageFrame.style}
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    pageFrame: {
                                      ...contract.frameSettings?.pageFrame,
                                      style: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                            >
                              <option value="solid">متصل (Solid)</option>
                              <option value="double">مزدوج (Double)</option>
                              <option value="dashed">متقطع (Dashed)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">
                              اللون
                            </label>
                            <input
                              type="color"
                              value={contract.frameSettings.pageFrame.color}
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    pageFrame: {
                                      ...contract.frameSettings?.pageFrame,
                                      color: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-full h-8 p-0.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500">
                                الهامش (Margin)
                              </label>
                              <span className="text-[10px] font-mono text-emerald-600">
                                {contract.frameSettings.pageFrame.margin}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              step="1"
                              value={parseInt(
                                contract.frameSettings.pageFrame.margin || "20",
                              )}
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    pageFrame: {
                                      ...contract.frameSettings?.pageFrame,
                                      margin: `${e.target.value}px`,
                                    },
                                  },
                                })
                              }
                              className="w-full accent-emerald-600"
                              dir="ltr"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Front Cover Frame */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700">
                          إطار الغلاف الأمامي
                        </label>
                        <input
                          type="checkbox"
                          checked={
                            contract.frameSettings?.frontCoverFrame?.enabled
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              frameSettings: {
                                ...contract.frameSettings,
                                frontCoverFrame: {
                                  ...contract.frameSettings?.frontCoverFrame,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                      </div>
                      {contract.frameSettings?.frontCoverFrame?.enabled && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">
                              النمط
                            </label>
                            <select
                              value={
                                contract.frameSettings.frontCoverFrame.style
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    frontCoverFrame: {
                                      ...contract.frameSettings
                                        ?.frontCoverFrame,
                                      style: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                            >
                              <option value="solid">متصل (Solid)</option>
                              <option value="double">مزدوج (Double)</option>
                              <option value="dashed">متقطع (Dashed)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">
                              اللون
                            </label>
                            <input
                              type="color"
                              value={
                                contract.frameSettings.frontCoverFrame.color
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    frontCoverFrame: {
                                      ...contract.frameSettings
                                        ?.frontCoverFrame,
                                      color: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-full h-8 p-0.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500">
                                الهامش (Margin)
                              </label>
                              <span className="text-[10px] font-mono text-emerald-600">
                                {contract.frameSettings.frontCoverFrame.margin}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              step="1"
                              value={parseInt(
                                contract.frameSettings.frontCoverFrame.margin ||
                                  "30",
                              )}
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    frontCoverFrame: {
                                      ...contract.frameSettings
                                        ?.frontCoverFrame,
                                      margin: `${e.target.value}px`,
                                    },
                                  },
                                })
                              }
                              className="w-full accent-emerald-600"
                              dir="ltr"
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Back Cover Frame */}
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700">
                          إطار الغلاف الخلفي
                        </label>
                        <input
                          type="checkbox"
                          checked={
                            contract.frameSettings?.backCoverFrame?.enabled
                          }
                          onChange={(e) =>
                            setContract({
                              ...contract,
                              frameSettings: {
                                ...contract.frameSettings,
                                backCoverFrame: {
                                  ...contract.frameSettings?.backCoverFrame,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                        />
                      </div>
                      {contract.frameSettings?.backCoverFrame?.enabled && (
                        <>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">
                              النمط
                            </label>
                            <select
                              value={
                                contract.frameSettings.backCoverFrame.style
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    backCoverFrame: {
                                      ...contract.frameSettings?.backCoverFrame,
                                      style: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs outline-none"
                            >
                              <option value="solid">متصل (Solid)</option>
                              <option value="double">مزدوج (Double)</option>
                              <option value="dashed">متقطع (Dashed)</option>
                            </select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500">
                              اللون
                            </label>
                            <input
                              type="color"
                              value={
                                contract.frameSettings.backCoverFrame.color
                              }
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    backCoverFrame: {
                                      ...contract.frameSettings?.backCoverFrame,
                                      color: e.target.value,
                                    },
                                  },
                                })
                              }
                              className="w-full h-8 p-0.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-bold text-slate-500">
                                الهامش (Margin)
                              </label>
                              <span className="text-[10px] font-mono text-emerald-600">
                                {contract.frameSettings.backCoverFrame.margin}
                              </span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              step="1"
                              value={parseInt(
                                contract.frameSettings.backCoverFrame.margin ||
                                  "30",
                              )}
                              onChange={(e) =>
                                setContract({
                                  ...contract,
                                  frameSettings: {
                                    ...contract.frameSettings,
                                    backCoverFrame: {
                                      ...contract.frameSettings?.backCoverFrame,
                                      margin: `${e.target.value}px`,
                                    },
                                  },
                                })
                              }
                              className="w-full accent-emerald-600"
                              dir="ltr"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-emerald-600" /> إعدادات
                      المسافات والخطوط
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        نوع الخط
                      </label>
                      <select
                        value={contract.typographySettings?.fontFamily}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            typographySettings: {
                              ...contract.typographySettings,
                              fontFamily: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                      >
                        <option value="Tajawal">Tajawal</option>
                        <option value="Cairo">Cairo</option>
                        <option value="Almarai">Almarai</option>
                        <option value="IBM Plex Sans Arabic">
                          IBM Plex Sans Arabic
                        </option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        حجم الخط الأساسي
                      </label>
                      <input
                        type="text"
                        value={contract.typographySettings?.fontSize}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            typographySettings: {
                              ...contract.typographySettings,
                              fontSize: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        ارتفاع السطر
                      </label>
                      <input
                        type="text"
                        value={contract.spacingSettings?.lineHeight}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            spacingSettings: {
                              ...contract.spacingSettings,
                              lineHeight: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                        dir="ltr"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500">
                        المسافة بين الفقرات
                      </label>
                      <input
                        type="text"
                        value={contract.spacingSettings?.paragraphSpacing}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            spacingSettings: {
                              ...contract.spacingSettings,
                              paragraphSpacing: e.target.value,
                            },
                          })
                        }
                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-violet-600" /> اختصار
                      العقد (AI)
                    </h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={contract.isOnePageSummary}
                        onChange={(e) =>
                          setContract({
                            ...contract,
                            isOnePageSummary: e.target.checked,
                          })
                        }
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-500"></div>
                    </label>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">
                    عند تفعيل هذا الخيار، سيقوم الذكاء الاصطناعي باختصار جميع
                    بنود العقد (نطاق العمل، الالتزامات، الشروط) في صفحة واحدة
                    فقط، مع الاحتفاظ بصفحات الغلاف.
                  </p>
                </div>
              </div>
            )}

            {/* Step 8: AI Risk Assessment */}
            {step === 8 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-violet-200/50 pb-4">
                    <h3 className="text-sm font-black text-violet-900 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-violet-600" />
                      تقييم المخاطر بالذكاء الاصطناعي
                    </h3>
                    <button
                      onClick={async () => {
                        setIsGeneratingAI(true);
                        try {
                          const { GoogleGenAI } = await import("@google/genai");
                          const ai = new GoogleGenAI({
                            apiKey: process.env.GEMINI_API_KEY,
                          });

                          const prompt = `أنت مستشار قانوني خبير في العقود الهندسية في المملكة العربية السعودية.
                          قم بتحليل العقد التالي وتقييم المخاطر المحتملة على الطرف الأول (مقدم الخدمة).
                          
                          بيانات العقد:
                          الطرف الأول: ${contract.partyA}
                          الطرف الثاني: ${contract.partyB}
                          نطاق العمل: ${contract.scope?.map((s) => s.content).join("، ")}
                          الالتزامات: ${contract.obligationsList?.map((o) => o.content).join("، ")}
                          القيمة: ${contract.contractValue}
                          شروط الدفع: ${contract.paymentTerms}
                          
                          المطلوب:
                          قدم تقييماً للمخاطر في 3 نقاط رئيسية، مع اقتراح بند واحد لإضافته لحماية الطرف الأول.
                          نسق الإجابة كنص واضح ومباشر.`;

                          const response = await ai.models.generateContent({
                            model: "gemini-3-flash-preview",
                            contents: prompt,
                          });

                          setContract((prev) => ({
                            ...prev,
                            aiRiskAssessment: response.text,
                          }));
                        } catch (error) {
                          console.error("Risk assessment failed:", error);
                        } finally {
                          setIsGeneratingAI(false);
                        }
                      }}
                      disabled={isGeneratingAI}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-black rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20 disabled:opacity-50"
                    >
                      {isGeneratingAI ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      {isGeneratingAI ? "جاري التحليل..." : "بدء التقييم"}
                    </button>
                  </div>

                  <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 min-h-[200px]">
                    {contract.aiRiskAssessment ? (
                      <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
                        {contract.aiRiskAssessment}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-8">
                        <Shield className="w-12 h-12 text-violet-200" />
                        <p className="text-sm font-bold text-center">
                          اضغط على "بدء التقييم" لتحليل العقد واكتشاف الثغرات
                          القانونية
                          <br />
                          أو المخاطر المالية المحتملة.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>

            {step < 8 ? (
              <button
                onClick={() => setStep(Math.min(8, step + 1))}
                className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onSave(contract)}
                className="px-8 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Save className="w-4 h-4" /> حفظ وإصدار العقد
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div
          className="hidden md:flex w-1/2 bg-slate-200 p-8 flex-col items-center overflow-y-auto relative"
          ref={previewContainerRef}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

          <div className="w-full flex justify-between items-center mb-4 z-10 max-w-[794px]">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-white">
              <Eye className="w-4 h-4 text-emerald-600" /> معاينة حية (A4)
            </h3>
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              يتم التحديث تلقائياً
            </div>
          </div>

          {/* A4 Preview Container with Auto-Scaling */}
          <div
            className="bg-white shadow-2xl rounded-sm overflow-hidden z-10 ring-1 ring-slate-900/5 transition-transform duration-200 origin-top"
            style={{
              width: "794px",
              minHeight: "1123px",
              transform: `scale(${previewScale})`,
              marginBottom: `${(previewScale - 1) * 1123}px`,
            }}
          >
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-none"
              title="Contract Preview"
              style={{ minHeight: "1123px" }}
            />
          </div>
        </div>
      </div>

      {/* AI Rephrase Modal */}
      {aiModalConfig.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            dir="rtl"
          >
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
              <h3 className="font-black text-violet-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-600" />
                إعدادات الصياغة الذكية
              </h3>
              <button
                onClick={() =>
                  setAiModalConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">
                  مستوى الرسمية (Formality)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setAiModalConfig((prev) => ({
                        ...prev,
                        formality: "strict",
                      }))
                    }
                    className={`p-3 rounded-xl border text-sm font-bold transition-colors ${aiModalConfig.formality === "strict" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    قانوني صارم
                  </button>
                  <button
                    onClick={() =>
                      setAiModalConfig((prev) => ({
                        ...prev,
                        formality: "standard",
                      }))
                    }
                    className={`p-3 rounded-xl border text-sm font-bold transition-colors ${aiModalConfig.formality === "standard" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    أعمال قياسي
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 block">
                  مستوى التفصيل (Brevity/Detail)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() =>
                      setAiModalConfig((prev) => ({
                        ...prev,
                        length: "detailed",
                      }))
                    }
                    className={`p-3 rounded-xl border text-sm font-bold transition-colors ${aiModalConfig.length === "detailed" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    مفصل وشامل
                  </button>
                  <button
                    onClick={() =>
                      setAiModalConfig((prev) => ({
                        ...prev,
                        length: "concise",
                      }))
                    }
                    className={`p-3 rounded-xl border text-sm font-bold transition-colors ${aiModalConfig.length === "concise" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    موجز ومختصر
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-700">
                    تعليمات الذكاء الاصطناعي:
                  </strong>{" "}
                  سيتم توجيه النموذج للعمل كخبير متخصص في صياغة العقود القانونية
                  والهندسية لضمان أعلى درجات الدقة والموثوقية.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={() =>
                  setAiModalConfig((prev) => ({ ...prev, isOpen: false }))
                }
                className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={executeAiRephrase}
                className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2 shadow-lg shadow-violet-600/20"
              >
                <Sparkles className="w-4 h-4" />
                توليد الصياغة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
