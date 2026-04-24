import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, CircleCheckBig } from "lucide-react";

// استيراد المكونات الفرعية والثوابت
import {
  STEPS,
  getClientName,
  mapTitleToEnum,
  mapHandlingToEnum,
  getCurrentHijriYear,
  generateHijriYears,
} from "./utils/quotationConstants";
import { LivePreview } from "./components/LivePreview";
import {
  Step0ClientProperty,
  Step1BasicInfo,
  Step2Template,
  Step3Items,
  Step4Tax,
  Step5Payments,
  Step6Attachments,
  Step7Terms,
  Step8Review,
} from "./components/WizardSteps";

const CreateQuotationWizard = ({ onComplete }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  // ==========================================
  // States - الخطوة 0 (الملكية، العميل، الارتباطات)
  // ==========================================
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");

  // حالات المعاملات (Transactions)
  const [selectedTransaction, setSelectedTransaction] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");

  // حالات محاضر الاجتماع (Meeting Minutes)
  const [selectedMeeting, setSelectedMeeting] = useState("");
  const [meetingSearch, setMeetingSearch] = useState("");

  // ==========================================
  // States - الخطوة 1
  // ==========================================
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [validityDays, setValidityDays] = useState(30);
  const [isRenewable, setIsRenewable] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseYear, setLicenseYear] = useState("");
  const [serviceYear, setServiceYear] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");

  // ==========================================
  // States - الخطوة 2
  // ==========================================
  const [templateType, setTemplateType] = useState("SUMMARY");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showClientCode, setShowClientCode] = useState(true);
  const [showPropertyCode, setShowPropertyCode] = useState(true);

  // ==========================================
  // States - الخطوة 3 & 4 (البنود والضريبة)
  // ==========================================
  const [items, setItems] = useState([]);
  const [taxRate, setTaxRate] = useState(15);
  const [officeTaxBearing, setOfficeTaxBearing] = useState(0);

  // ==========================================
  // States - الخطوة 5 (الدفعات)
  // ==========================================
  const [paymentCount, setPaymentCount] = useState(1);
  const [acceptedMethods, setAcceptedMethods] = useState(["bank"]);

  // ==========================================
  // States - الخطوة 6 (المرفقات والنواقص)
  // ==========================================
  const [missingDocs, setMissingDocs] = useState("");
  const [showMissingDocs, setShowMissingDocs] = useState(false);

  // ==========================================
  // States - الخطوة 7 (الشروط)
  // ==========================================
  const [termsText, setTermsText] = useState(
    "1. الدفعة المقدمة غير مستردة.\n2. الرسوم الحكومية على المالك."
  );
  const [clientTitle, setClientTitle] = useState("المواطن");
  const [handlingMethod, setHandlingMethod] = useState("المالك مباشرة");
  const [selectedPresetTerm, setSelectedPresetTerm] = useState("manual");

  // ==========================================
  // API Queries (جلب البيانات من السيرفر)
  // ==========================================
  
  // 1. العملاء
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients", clientSearch],
    queryFn: async () =>
      (await axios.get("/clients/simple", { params: { search: clientSearch } }))
        .data,
  });

  // 2. الملكيات
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties", propertySearch],
    queryFn: async () =>
      (await axios.get("/properties", { params: { search: propertySearch } }))
        .data?.data || [],
  });

  // 3. المعاملات (Transactions)
  const { data: transactionsData, isLoading: transactionsLoading } = useQuery({
    queryKey: ["transactions", transactionSearch, selectedClient],
    queryFn: async () => {
      const params = { search: transactionSearch };
      // إذا تم اختيار عميل، يمكننا فلترة المعاملات الخاصة به فقط
      if (selectedClient) params.clientId = selectedClient; 
      const res = await axios.get("/private-transactions", { params });
      return res.data?.data || res.data || [];
    },
  });

  // 4. محاضر الاجتماع (Meeting Minutes)
  const { data: meetingsData, isLoading: meetingsLoading } = useQuery({
    queryKey: ["meeting-minutes", meetingSearch, selectedClient],
    queryFn: async () => {
      const params = { search: meetingSearch };
      if (selectedClient) params.clientId = selectedClient;
      const res = await axios.get("/meeting-minutes", { params });
      return res.data?.data || res.data || [];
    },
  });

  // 5. نماذج عروض السعر
  const { data: serverTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => (await axios.get("/quotation-templates")).data.data,
  });

  // 6. مكتبة البنود
  const { data: serverItems = [], isLoading: libItemsLoading } = useQuery({
    queryKey: ["library-items"],
    queryFn: async () =>
      (await axios.get("/quotation-library/items")).data.data,
  });

  // ضبط النموذج الافتراضي عند جلب النماذج من السيرفر
  useEffect(() => {
    if (serverTemplates.length > 0 && !selectedTemplate) {
      const defaultTpl =
        serverTemplates.find((t) => t.isDefault) || serverTemplates[0];
      setSelectedTemplate(defaultTpl.id);
      setTemplateType(defaultTpl.type);
      setTermsText(defaultTpl.defaultTerms || termsText);
    }
  }, [serverTemplates]);

  // ==========================================
  // Calculations (الحسابات المالية وتوليد الدفعات)
  // ==========================================
  const subtotal = items.reduce(
    (sum, item) => sum + (item.qty * item.price - item.discount),
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  // دالة توليد الدفعات بناءً على إجمالي المبلغ وعدد الدفعات المختار
  const generatePayments = () => {
    let payments = [];
    if (paymentCount <= 0 || grandTotal <= 0) return payments;

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
    return payments;
  };
  const paymentsList = generatePayments();

  // دوال التحكم بالبنود (Items)
  const handleItemChange = (id, field, value) =>
    setItems(
      items.map((i) =>
        i.id === id
          ? {
              ...i,
              [field]:
                field === "title" || field === "unit" ? value : Number(value),
            }
          : i
      )
    );

  const removeItem = (id) => setItems(items.filter((i) => i.id !== id));

  const addItemFromLibrary = (e) => {
    const libItem = serverItems.find((i) => i.code === e.target.value);
    if (libItem) {
      setItems([
        ...items,
        {
          id: Date.now(),
          title: libItem.title,
          qty: 1,
          unit: libItem.unit,
          price: libItem.price,
          discount: 0,
        },
      ]);
    }
    e.target.value = "";
  };

  const toggleMethod = (method) => {
    setAcceptedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method]
    );
  };

  // ==========================================
  // حفظ العرض في السيرفر (Mutation)
  // ==========================================
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/quotations", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("تم حفظ عرض السعر بنجاح!");
      queryClient.invalidateQueries(["quotations"]);
      if (onComplete) onComplete(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  const handleSave = (isDraft = false) => {
    if (!selectedClient && !selectedProperty) {
      toast.error("يرجى اختيار ملف عميل أو ملكية.");
      setCurrentStep(0);
      return;
    }
    if (items.length === 0) {
      toast.error("يرجى إضافة بند واحد على الأقل");
      setCurrentStep(3);
      return;
    }

    const payload = {
      // الأساسيات
      clientId: selectedClient || null,
      propertyId: selectedProperty || null,
      
      // الارتباطات المضافة حديثاً
      transactionId: selectedTransaction || null,
      meetingMinuteId: selectedMeeting || null,

      // التواريخ والمعلومات
      issueDate,
      validityDays: validityDays === "unlimited" ? 30 : validityDays,
      isRenewable,
      templateType,
      templateId: selectedTemplate,
      showClientCode,
      showPropertyCode,
      transactionType: transactionType || null,
      serviceNumber,
      serviceYear,
      licenseNumber,
      licenseYear,

      // البنود
      items: items.map((i) => ({
        title: i.title,
        category: i.category || "عام",
        qty: i.qty,
        unit: i.unit,
        price: i.price,
        discount: i.discount,
        discountType: "PERCENTAGE",
      })),

      // الماليات
      taxRate,
      officeTaxBearing,
      payments: paymentsList,
      acceptedMethods,

      // الشروط والنواقص
      missingDocs,
      showMissingDocs,
      terms: termsText,
      clientTitle: mapTitleToEnum(clientTitle),
      handlingMethod: mapHandlingToEnum(handlingMethod),
      isDraft,
    };

    saveMutation.mutate(payload);
  };

  // ==========================================
  // تجميع الـ Props لتمريرها للخطوات الفرعية
  // ==========================================
  const stepProps = {
    // Step 0 (شاملة العملاء، الملكيات، المعاملات، والمحاضر)
    selectedClient, setSelectedClient,
    selectedProperty, setSelectedProperty,
    clientSearch, setClientSearch,
    propertySearch, setPropertySearch,
    clientsData, propertiesData,
    clientsLoading, propertiesLoading,
    
    selectedTransaction, setSelectedTransaction,
    transactionSearch, setTransactionSearch,
    transactionsData, transactionsLoading,
    
    selectedMeeting, setSelectedMeeting,
    meetingSearch, setMeetingSearch,
    meetingsData, meetingsLoading,

    // Step 1
    issueDate, setIssueDate,
    validityDays, setValidityDays,
    isRenewable, setIsRenewable,
    transactionType, setTransactionType,
    licenseNumber, setLicenseNumber,
    licenseYear, setLicenseYear,
    serviceYear, setServiceYear,
    serviceNumber, setServiceNumber,
    licenseYearsList: generateHijriYears(1400, getCurrentHijriYear()),

    // Step 2
    templateType, setTemplateType,
    selectedTemplate, setSelectedTemplate,
    serverTemplates, templatesLoading,
    showClientCode, setShowClientCode,
    showPropertyCode, setShowPropertyCode,

    // Step 3
    items, setItems,
    handleItemChange, removeItem, addItemFromLibrary,
    serverItems, libItemsLoading, subtotal,

    // Step 4
    taxRate, setTaxRate,
    officeTaxBearing, setOfficeTaxBearing,
    taxAmount, grandTotal,

    // Step 5
    paymentCount, setPaymentCount,
    paymentsList, acceptedMethods, toggleMethod,

    // Step 6
    missingDocs, setMissingDocs,
    showMissingDocs, setShowMissingDocs,

    // Step 7
    termsText, setTermsText,
    clientTitle, setClientTitle,
    handlingMethod, setHandlingMethod,
    selectedPresetTerm, setSelectedPresetTerm,

    // Step 8
    handleSave, saveMutation,
  };

  // بيانات المعاينة للجانب الأيسر
  const previewData = {
    templateType,
    issueDate,
    validityDays,
    clientTitle: clientTitle || "المواطن",
    clientNameForPreview: getClientName(
      clientsData?.find((c) => c.id === selectedClient)
    ),
    propertyCodeForPreview:
      propertiesData?.find((p) => p.id === selectedProperty)?.code ||
      "الملكية...",
    transactionType,
    licenseNumber,
    licenseYear,
    items,
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    termsText,
    missingDocs,
    showMissingDocs,
    paymentsList,
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans" dir="rtl">
      <div className="flex-1 overflow-hidden p-4 md:p-5 flex gap-6">
        {/* الجانب الأيمن (الخطوات) 50% */}
        <div className="w-[50%] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* شريط الخطوات العلوية */}
          <div className="flex items-center gap-1 p-4 border-b border-slate-100 overflow-x-auto custom-scrollbar bg-slate-50">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const Icon = isCompleted ? CircleCheckBig : step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none text-[10px] font-bold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* محتوى الخطوة الديناميكي (يتغير حسب الخطوة النشطة) */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
            {currentStep === 0 && <Step0ClientProperty props={stepProps} />}
            {currentStep === 1 && <Step1BasicInfo props={stepProps} />}
            {currentStep === 2 && <Step2Template props={stepProps} />}
            {currentStep === 3 && <Step3Items props={stepProps} />}
            {currentStep === 4 && <Step4Tax props={stepProps} />}
            {currentStep === 5 && <Step5Payments props={stepProps} />}
            {currentStep === 6 && <Step6Attachments props={stepProps} />}
            {currentStep === 7 && <Step7Terms props={stepProps} />}
            {currentStep === 8 && <Step8Review props={stepProps} />}
          </div>

          {/* أزرار التنقل السفلية */}
          <div className="flex justify-between items-center p-4 border-t border-slate-200 bg-white shrink-0">
            <button
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((p) => p - 1)}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 disabled:opacity-40 transition-colors"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>
            <div className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              الخطوة {currentStep + 1} من {STEPS.length}
            </div>
            <button
              onClick={() =>
                setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1))
              }
              disabled={currentStep === 8}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm"
            >
              التالي <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* الجانب الأيسر (المعاينة الحية للورقة A4) 50% */}
        <LivePreview data={previewData} />
      </div>
    </div>
  );
};

export default CreateQuotationWizard;