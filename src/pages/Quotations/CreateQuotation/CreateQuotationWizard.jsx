import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  CircleCheckBig,
  Save,
  Loader2,
} from "lucide-react";

import {
  STEPS,
  getClientName,
  mapTitleToEnum,
  mapHandlingToEnum,
  getCurrentHijriYear,
  generateHijriYears,
} from "./utils/quotationConstants";
import { LivePreview } from "./components/LivePreview";

import { Step0ClientProperty } from "./components/Wizart_steps/ClientProperty";
import { Step1BasicInfo } from "./components/Wizart_steps/BasicInfo";
import { Step2Template } from "./components/Wizart_steps/Template";
import { Step3Items } from "./components/Wizart_steps/Items";
import { Step4Tax } from "./components/Wizart_steps/Tax";
import { Step5Payments } from "./components/Wizart_steps/Payments";
import { Step6Attachments } from "./components/Wizart_steps/Attachments";
import { Step7Terms } from "./components/Wizart_steps/Terms";
import { Step8Review } from "./components/Wizart_steps/Review";
const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

// 🔥 التصحيح الأول: استخراج البيانات بذكاء ليتوافق مع نظام التابات
const CreateQuotationWizard = (incomingProps) => {
  const quotationId =
    incomingProps.quotationId || incomingProps.props?.quotationId;
  const onComplete =
    incomingProps.onComplete || incomingProps.props?.onComplete;

  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const tabsContainerRef = useRef(null);

  const isEditMode = !!quotationId;

  // ==========================================
  // States - الحالات المشتركة
  // ==========================================
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [meetingSearch, setMeetingSearch] = useState("");

  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [validityDays, setValidityDays] = useState(30);
  const [isRenewable, setIsRenewable] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseYear, setLicenseYear] = useState("");
  const [serviceYear, setServiceYear] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");

  const [templateType, setTemplateType] = useState("SUMMARY");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showClientCode, setShowClientCode] = useState(true);
  const [showPropertyCode, setShowPropertyCode] = useState(true);

  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(15);
  const [officeTaxBearing, setOfficeTaxBearing] = useState(0);

  const [paymentCount, setPaymentCount] = useState(1);
  const [paymentsList, setPaymentsList] = useState([]);
  const [acceptedMethods, setAcceptedMethods] = useState(["bank"]);

  const [missingDocs, setMissingDocs] = useState("");
  const [showMissingDocs, setShowMissingDocs] = useState(false);

  const [termsText, setTermsText] = useState(
    "1. الدفعة المقدمة غير مستردة.\n2. الرسوم الحكومية على المالك.",
  );
  const [clientTitle, setClientTitle] = useState("المواطن");
  const [handlingMethod, setHandlingMethod] = useState("المالك مباشرة");
  const [selectedPresetTerm, setSelectedPresetTerm] = useState("manual");
  const [stampType, setStampType] = useState("NONE");

  // ==========================================
  // API Queries
  // ==========================================
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients", clientSearch],
    queryFn: async () =>
      (await axios.get("/clients/simple", { params: { search: clientSearch } }))
        .data,
  });

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties", propertySearch],
    queryFn: async () =>
      (await axios.get("/properties", { params: { search: propertySearch } }))
        .data?.data || [],
  });

  const { data: serverTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => (await axios.get("/quotation-templates")).data.data,
  });

  const { data: serverItems = [], isLoading: libItemsLoading } = useQuery({
    queryKey: ["library-items"],
    queryFn: async () =>
      (await axios.get("/quotation-library/items")).data.data,
  });

  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", transactionSearch, selectedClient],
    queryFn: async () => {
      const params = { search: transactionSearch };
      if (selectedClient) params.clientId = selectedClient;
      const res = await axios.get("/private-transactions", { params });
      return res.data?.data || res.data || [];
    },
  });

  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ["meeting-minutes", meetingSearch, selectedClient],
    queryFn: async () => {
      const params = { search: meetingSearch };
      if (selectedClient) params.clientId = selectedClient;
      const res = await axios.get("/meeting-minutes", { params });
      return res.data?.data || res.data || [];
    },
  });

  // ==========================================
  // جلب بيانات العرض في حالة التعديل
  // ==========================================
  const { data: existingQuote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: async () =>
      (await axios.get(`/quotations/${quotationId}`)).data.data,
    enabled: isEditMode,
  });

  // 👈 إضافة استعلام جلب خدمات المكتب
  const { data: officeServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["office-services"],
    queryFn: async () =>
      (await axios.get("/services")).data?.data ||
      (await axios.get("/services")).data ||
      [],
  });

  useEffect(() => {
    if (existingQuote) {
      setSelectedClient(existingQuote.clientId || "");
      setSelectedProperty(existingQuote.ownershipId || "");
      setSelectedTransaction(existingQuote.transactionId || "");
      setSelectedMeeting(existingQuote.meetingMinuteId || "");

      setIssueDate(
        existingQuote.issueDate
          ? existingQuote.issueDate.split("T")[0]
          : new Date().toISOString().split("T")[0],
      );
      setValidityDays(existingQuote.validityDays);
      setIsRenewable(existingQuote.isRenewable);

      setTemplateType(existingQuote.templateType);
      setSelectedTemplate(existingQuote.templateId || "");
      setShowClientCode(existingQuote.showClientCode);
      setShowPropertyCode(existingQuote.showPropertyCode);

      setTransactionType(existingQuote.transactionTypeId || "");
      setLicenseNumber(existingQuote.licenseNumber || "");
      setLicenseYear(existingQuote.licenseYear || "");
      setServiceNumber(existingQuote.serviceNumber || "");
      setServiceYear(existingQuote.serviceYear || "");

      setTaxRate(existingQuote.taxRate * 100);
      setOfficeTaxBearing(existingQuote.officeTaxBearing);
      setStampType(existingQuote.stampType || "NONE");

      setItems(
        (existingQuote.items || []).map((i) => ({
          id: i.id,
          title: i.title,
          category: i.category,
          qty: i.quantity,
          unit: i.unit,
          price: i.unitPrice,
          discount: i.discount,
          discountType: i.discountType,
        })),
      );

      setPaymentsList(
        (existingQuote.payments || []).map((p) => ({
          id: p.id,
          label: `الدفعة ${p.installmentNumber}`,
          percentage: p.percentage,
          amount: p.amount,
          condition: p.dueCondition,
        })),
      );
      setPaymentCount(existingQuote.payments?.length || 1);

      setAcceptedMethods(existingQuote.acceptedMethods || ["bank"]);
      setMissingDocs(existingQuote.missingDocs || "");
      setShowMissingDocs(existingQuote.showMissingDocs);
      setTermsText(existingQuote.terms || "");
    }
  }, [existingQuote]);

  useEffect(() => {
    if (!isEditMode && serverTemplates.length > 0 && !selectedTemplate) {
      const defaultTpl =
        serverTemplates.find((t) => t.isDefault) || serverTemplates[0];
      setSelectedTemplate(defaultTpl.id);
      setTemplateType(defaultTpl.type);
      setTermsText(defaultTpl.defaultTerms || termsText);
    }
  }, [serverTemplates, isEditMode]);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTab = tabsContainerRef.current.children[currentStep];
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentStep]);

  // 1. حساب الإجمالي قبل الضريبة
  const subtotal = items.reduce(
    (sum, item) => sum + (item.qty * item.price - item.discount),
    0,
  );

  // 2. حساب إجمالي الضريبة (بجمع ضريبة كل بند على حدة)
  const taxAmount = items.reduce((sum, item) => {
    const lineSubtotal = item.qty * item.price - item.discount;
    // إذا لم يحدد الموظف ضريبة للبند، نفترض أنها 15%
    const itemTaxRate = item.taxRate !== undefined ? item.taxRate : 15;
    return sum + lineSubtotal * (itemTaxRate / 100);
  }, 0);

  // 3. الإجمالي الشامل
  const grandTotal = subtotal + taxAmount;

  useEffect(() => {
    if (!isEditMode || (isEditMode && paymentsList.length === 0)) {
      let payments = [];
      if (paymentCount > 0 && grandTotal > 0) {
        const amountPerPayment = grandTotal / paymentCount;
        const percentagePerPayment = 100 / paymentCount;
        for (let i = 1; i <= paymentCount; i++) {
          payments.push({
            id: i,
            label: `الدفعة ${i}`,
            percentage: percentagePerPayment.toFixed(0),
            amount: amountPerPayment,
            condition:
              i === 1
                ? "عند التعاقد"
                : i === paymentCount
                  ? "عند التسليم"
                  : "حسب الإنجاز",
          });
        }
      }
      setPaymentsList(payments);
    }
  }, [paymentCount, grandTotal, isEditMode]);

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              [field]:
                field === "title" || field === "unit" ? value : Number(value),
            }
          : i,
      ),
    );
  };

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const addItemFromLibrary = (e) => {
    const libItem = serverItems.find((i) => i.code === e.target.value);
    if (libItem) {
      setItems([
        ...items,
        {
          id: Date.now(),
          title: libItem.title,
          category: libItem.category || "عام",
          qty: 1,
          unit: libItem.unit,
          price: libItem.price,
          discount: 0,
          discountType: "PERCENTAGE",
        },
      ]);
    }
    e.target.value = "";
  };

  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      if (isEditMode) {
        const response = await axios.put(`/quotations/${quotationId}`, payload);
        return response.data;
      } else {
        const response = await axios.post("/quotations", payload);
        return response.data;
      }
    },
    onSuccess: (data) => {
      toast.success(
        isEditMode ? "تم تحديث عرض السعر بنجاح!" : "تم حفظ عرض السعر بنجاح!",
      );
      queryClient.invalidateQueries(["quotations", "quotations-list"]);
      if (onComplete) onComplete(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  const handleSave = (isDraft = false) => {
    if (!selectedClient && !selectedProperty) {
      toast.error("يرجى اختيار ملف عميل أو ملكية أولاً.");
      setCurrentStep(0);
      return;
    }
    if (items.length === 0) {
      toast.error("يرجى إضافة بند واحد على الأقل");
      setCurrentStep(3);
      return;
    }

    const payload = {
      clientId: selectedClient || null,
      propertyId: selectedProperty || null,
      transactionId: selectedTransaction || null,
      meetingId: selectedMeeting || null,

      issueDate,
      validityDays: validityDays === "unlimited" ? 30 : validityDays,
      isRenewable,
      templateType,
      templateId: selectedTemplate,
      showClientCode,
      showPropertyCode,
      transactionTypeId: transactionType || null,
      serviceNumber,
      serviceYear,
      licenseNumber,
      licenseYear,

      items: items.map((i, idx) => ({
        order: idx + 1,
        title: i.title,
        category: i.category || "عام",
        qty: i.qty,
        unit: i.unit,
        price: i.price,
        discount: i.discount,
        discountType: i.discountType || "PERCENTAGE",
        taxRate: i.taxRate !== undefined ? i.taxRate : 15, // 👈 أضفنا هذا السطر لنرسل نسبة الضريبة للسيرفر
      })),

      taxRate,
      officeTaxBearing,
      payments: paymentsList.map((p, idx) => ({
        installmentNumber: idx + 1,
        percentage: p.percentage,
        amount: p.amount,
        condition: p.condition,
      })),
      acceptedMethods,

      missingDocs,
      showMissingDocs,
      terms: termsText,
      clientTitle: mapTitleToEnum(clientTitle),
      handlingMethod: mapHandlingToEnum(handlingMethod),
      stampType,
      isDraft,
      status: isDraft
        ? "DRAFT"
        : existingQuote
          ? existingQuote.status
          : "PENDING_APPROVAL",
    };

    saveMutation.mutate(payload);
  };

  const handleNextOrSave = () => {
    setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1));
  };

  const stepProps = {
    selectedClient,
    setSelectedClient,
    selectedProperty,
    setSelectedProperty,
    clientSearch,
    setClientSearch,
    propertySearch,
    setPropertySearch,
    clientsData,
    propertiesData,
    clientsLoading,
    propertiesLoading,
    selectedTransaction,
    setSelectedTransaction,
    transactionSearch,
    setTransactionSearch,
    transactionsData,
    transactionsLoading,
    selectedMeeting,
    setSelectedMeeting,
    meetingSearch,
    setMeetingSearch,
    meetingsData,
    meetingsLoading,

    issueDate,
    setIssueDate,
    validityDays,
    setValidityDays,
    isRenewable,
    setIsRenewable,
    transactionType,
    setTransactionType,
    licenseNumber,
    setLicenseNumber,
    licenseYear,
    setLicenseYear,
    serviceYear,
    setServiceYear,
    serviceNumber,
    setServiceNumber,
    licenseYearsList: generateHijriYears(1400, getCurrentHijriYear()),

    templateType,
    setTemplateType,
    selectedTemplate,
    setSelectedTemplate,
    serverTemplates,
    templatesLoading,
    showClientCode,
    setShowClientCode,
    showPropertyCode,
    setShowPropertyCode,

    items,
    setItems,
    handleItemChange,
    removeItem,
    addItemFromLibrary,
    serverItems,
    libItemsLoading,
    subtotal,
    taxRate,
    setTaxRate,
    officeTaxBearing,
    setOfficeTaxBearing,
    taxAmount,
    grandTotal,

    paymentCount,
    setPaymentCount,
    paymentsList,
    setPaymentsList,
    acceptedMethods,
    toggleMethod: (m) =>
      setAcceptedMethods((prev) =>
        prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m],
      ),
    missingDocs,
    setMissingDocs,
    showMissingDocs,
    setShowMissingDocs,
    termsText,
    setTermsText,
    clientTitle,
    setClientTitle,
    handlingMethod,
    setHandlingMethod,
    selectedPresetTerm,
    setSelectedPresetTerm,
    handleSave,
    saveMutation,
    stampType,
    setStampType,
    officeServices, // 👈 تمرير قائمة الخدمات
    servicesLoading,
  };

  const previewData = {
    templateType,
    issueDate,
    validityDays,
    clientTitle: clientTitle || "المواطن",
    clientNameForPreview:
      getClientName(clientsData?.find((c) => c.id === selectedClient)) ||
      getClientName(existingQuote?.client) ||
      "عميل غير محدد",
    propertyCodeForPreview:
      propertiesData?.find((p) => p.id === selectedProperty)?.code ||
      existingQuote?.ownership?.code ||
      "الملكية...",
    transactionType,
    licenseNumber,
    licenseYear,
    serviceNumber,
    serviceYear,
    items,
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    termsText,
    missingDocs,
    showMissingDocs,
    paymentsList,
    stampType,
    acceptedMethods,
    showPropertyCode,
    showClientCode,
    officeTaxBearing,
  };

  return (
    <div
      className="
        flex h-full min-h-0 flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-3 font-[Tajawal] text-[#123f59]
      "
      dir="rtl"
    >
      {isEditMode && isQuoteLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#d8b46a]/25 bg-white px-8 py-6 shadow-[0_16px_38px_rgba(18,63,89,0.14)]">
            <Loader2 className="h-8 w-8 animate-spin text-[#123f59]" />
            <span className="text-xs font-black text-[#64748b]">
              جاري تحميل بيانات عرض السعر...
            </span>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden">
        <section
          className="
            flex min-h-0 min-w-0 flex-[1.05] flex-col overflow-hidden
            rounded-[24px] border border-[#d8b46a]/25 bg-white/95
            shadow-[0_10px_26px_rgba(18,63,89,0.08)]
            backdrop-blur-xl
          "
        >
          <div
            className="
              shrink-0 border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
              px-4 py-3 text-white
            "
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="
                    grid h-11 w-11 shrink-0 place-items-center
                    rounded-2xl border border-[#e2bf74]/35
                    bg-white/10 text-[#e2bf74]
                    shadow-md backdrop-blur-xl
                  "
                >
                  <IconWithText
                    icon={Save}
                    text="عرض"
                    vertical
                    iconClassName="h-5 w-5"
                    textClassName="text-[7px] font-black leading-none"
                  />
                </span>

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-black">
                    {isEditMode ? "تعديل عرض سعر" : "إنشاء عرض سعر"}
                  </h2>
                  <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                    بناء العرض، اختيار النموذج، البنود، الضريبة، الدفعات
                    والمراجعة.
                  </p>
                </div>
              </div>

              <span className="shrink-0 rounded-xl border border-[#e2bf74]/35 bg-white/10 px-3 py-1.5 text-[10px] font-black text-[#e2bf74]">
                الخطوة {currentStep + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          <div
            ref={tabsContainerRef}
            className="
              shrink-0 overflow-x-auto border-b border-[#e8ddc8]
              bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
              p-2 custom-scrollbar-slim
            "
          >
            <div className="flex min-w-max items-center gap-1.5">
              {STEPS.map((step) => {
                const isActive = currentStep === step.id;
                const isCompleted = step.id < currentStep;
                const Icon = isCompleted ? CircleCheckBig : step.icon;

                return (
                  <button
                    key={step.id}
                    onClick={() => setCurrentStep(step.id)}
                    className={`
                      group inline-flex h-10 shrink-0 items-center justify-center gap-1.5
                      rounded-2xl border px-3 text-[10px] font-black
                      transition-all duration-200
                      ${
                        isActive
                          ? "border-[#e2bf74]/55 bg-[#123f59] text-white shadow-[0_10px_22px_rgba(18,63,89,0.18)]"
                          : isCompleted
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                            : "border-[#d8b46a]/25 bg-white text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"
                      }
                    `}
                    type="button"
                    title={step.label}
                  >
                    <Icon
                      className={`
                        h-4 w-4 shrink-0
                        ${isActive ? "text-[#e2bf74]" : ""}
                      `}
                    />
                    <span className="whitespace-nowrap">{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#fbf8f1]/40 p-3 custom-scrollbar-slim">
            <div className="mx-auto max-w-4xl">
              {currentStep === 0 && <Step2Template props={stepProps} />}
              {currentStep === 1 && <Step0ClientProperty props={stepProps} />}
              {currentStep === 2 && <Step1BasicInfo props={stepProps} />}
              {currentStep === 3 && <Step3Items props={stepProps} />}
              {currentStep === 4 && <Step4Tax props={stepProps} />}
              {currentStep === 5 && <Step5Payments props={stepProps} />}
              {currentStep === 6 && <Step6Attachments props={stepProps} />}
              {currentStep === 7 && <Step7Terms props={stepProps} />}
              {currentStep === 8 && <Step8Review props={stepProps} />}
            </div>
          </div>

          <div className="shrink-0 border-t border-[#e8ddc8] bg-white/95 p-3">
            <div className="flex items-center justify-between gap-3">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((p) => p - 1)}
                className="
                  inline-flex h-10 items-center justify-center gap-1.5
                  rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1]
                  px-4 text-xs font-black text-[#64748b]
                  transition hover:bg-[#f8efe0]
                  disabled:cursor-not-allowed disabled:opacity-40
                "
                type="button"
              >
                <ChevronRight className="h-4 w-4" />
                السابق
              </button>

              <div className="rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-4 py-2 text-[10px] font-black text-[#64748b]">
                {STEPS[currentStep]?.label || "خطوة"}
              </div>

              {currentStep === STEPS.length - 1 ? (
                <div className="h-10 w-[110px]" />
              ) : currentStep === STEPS.length - 2 ? (
                <button
                  onClick={handleNextOrSave}
                  className="
                    inline-flex h-10 items-center justify-center gap-1.5
                    rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                    px-4 text-xs font-black text-white
                    shadow-[0_10px_24px_rgba(18,63,89,0.18)]
                    transition hover:-translate-y-[1px]
                  "
                  type="button"
                >
                  <IconWithText
                    icon={Save}
                    text="مراجعة وحفظ"
                    iconClassName="h-4 w-4 text-[#e2bf74]"
                  />
                </button>
              ) : (
                <button
                  onClick={handleNextOrSave}
                  className="
                    inline-flex h-10 items-center justify-center gap-1.5
                    rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                    px-4 text-xs font-black text-white
                    shadow-[0_10px_24px_rgba(18,63,89,0.18)]
                    transition hover:-translate-y-[1px]
                  "
                  type="button"
                >
                  التالي
                  <ChevronLeft className="h-4 w-4 text-[#e2bf74]" />
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="min-h-0 min-w-0 flex-[0.95] overflow-hidden">
          <LivePreview data={previewData} />
        </aside>
      </div>
    </div>
  );
};

export default CreateQuotationWizard;
