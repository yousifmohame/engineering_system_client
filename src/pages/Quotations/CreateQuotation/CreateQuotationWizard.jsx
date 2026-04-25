import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, CircleCheckBig, Save, Loader2 } from "lucide-react";

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

// 🔥 التصحيح الأول: استخراج البيانات بذكاء ليتوافق مع نظام التابات
const CreateQuotationWizard = (incomingProps) => {
  const quotationId = incomingProps.quotationId || incomingProps.props?.quotationId;
  const onComplete = incomingProps.onComplete || incomingProps.props?.onComplete;
  
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

  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
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

  const [termsText, setTermsText] = useState("1. الدفعة المقدمة غير مستردة.\n2. الرسوم الحكومية على المالك.");
  const [clientTitle, setClientTitle] = useState("المواطن");
  const [handlingMethod, setHandlingMethod] = useState("المالك مباشرة");
  const [selectedPresetTerm, setSelectedPresetTerm] = useState("manual");
  const [stampType, setStampType] = useState("NONE");

  // ==========================================
  // API Queries
  // ==========================================
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients", clientSearch],
    queryFn: async () => (await axios.get("/clients/simple", { params: { search: clientSearch } })).data,
  });

  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties", propertySearch],
    queryFn: async () => (await axios.get("/properties", { params: { search: propertySearch } })).data?.data || [],
  });

  const { data: serverTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => (await axios.get("/quotation-templates")).data.data,
  });

  const { data: serverItems = [], isLoading: libItemsLoading } = useQuery({
    queryKey: ["library-items"],
    queryFn: async () => (await axios.get("/quotation-library/items")).data.data,
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
    queryFn: async () => (await axios.get(`/quotations/${quotationId}`)).data.data,
    enabled: isEditMode, 
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
      const defaultTpl = serverTemplates.find((t) => t.isDefault) || serverTemplates[0];
      setSelectedTemplate(defaultTpl.id);
      setTemplateType(defaultTpl.type);
      setTermsText(defaultTpl.defaultTerms || termsText);
    }
  }, [serverTemplates, isEditMode]);

  useEffect(() => {
    if (tabsContainerRef.current) {
      const activeTab = tabsContainerRef.current.children[currentStep];
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [currentStep]);

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price - item.discount), 0);
  const taxAmount = subtotal * (taxRate / 100);
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
            condition: i === 1 ? "عند التعاقد" : i === paymentCount ? "عند التسليم" : "حسب الإنجاز",
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
          ? { ...i, [field]: field === "title" || field === "unit" ? value : Number(value) }
          : i
      )
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
      toast.success(isEditMode ? "تم تحديث عرض السعر بنجاح!" : "تم حفظ عرض السعر بنجاح!");
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
      status: isDraft ? "DRAFT" : existingQuote ? existingQuote.status : "PENDING_APPROVAL",
    };

    saveMutation.mutate(payload);
  };

  const handleNextOrSave = () => {
    setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1));
  };

  const stepProps = {
    selectedClient, setSelectedClient, selectedProperty, setSelectedProperty,
    clientSearch, setClientSearch, propertySearch, setPropertySearch,
    clientsData, propertiesData, clientsLoading, propertiesLoading,
    selectedTransaction, setSelectedTransaction, transactionSearch, setTransactionSearch, transactionsData, transactionsLoading,
    selectedMeeting, setSelectedMeeting, meetingSearch, setMeetingSearch, meetingsData, meetingsLoading,
    
    issueDate, setIssueDate, validityDays, setValidityDays, isRenewable, setIsRenewable,
    transactionType, setTransactionType, licenseNumber, setLicenseNumber,
    licenseYear, setLicenseYear, serviceYear, setServiceYear, serviceNumber, setServiceNumber,
    licenseYearsList: generateHijriYears(1400, getCurrentHijriYear()),

    templateType, setTemplateType, selectedTemplate, setSelectedTemplate,
    serverTemplates, templatesLoading, showClientCode, setShowClientCode, showPropertyCode, setShowPropertyCode,
    
    items, setItems, handleItemChange, removeItem, addItemFromLibrary,
    serverItems, libItemsLoading, subtotal, taxRate, setTaxRate,
    officeTaxBearing, setOfficeTaxBearing, taxAmount, grandTotal,
    
    paymentCount, setPaymentCount, paymentsList, setPaymentsList, acceptedMethods,
    toggleMethod: (m) => setAcceptedMethods((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]),
    missingDocs, setMissingDocs, showMissingDocs, setShowMissingDocs,
    termsText, setTermsText, clientTitle, setClientTitle, handlingMethod, setHandlingMethod,
    selectedPresetTerm, setSelectedPresetTerm,
    handleSave, saveMutation, stampType, setStampType,
  };

  const previewData = {
    templateType, issueDate, validityDays, clientTitle: clientTitle || "المواطن",
    clientNameForPreview: getClientName(clientsData?.find((c) => c.id === selectedClient)) || getClientName(existingQuote?.client) || "عميل غير محدد",
    propertyCodeForPreview: propertiesData?.find((p) => p.id === selectedProperty)?.code || existingQuote?.ownership?.code || "الملكية...",
    transactionType, licenseNumber, licenseYear, serviceNumber, serviceYear,
    items, subtotal, taxRate, taxAmount, grandTotal, termsText, missingDocs, showMissingDocs, 
    paymentsList, stampType, acceptedMethods, showPropertyCode, showClientCode, officeTaxBearing
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans" dir="rtl">
      {isEditMode && isQuoteLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="text-xs font-bold text-slate-600">جاري تحميل بيانات عرض السعر...</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-hidden p-4 md:p-5 flex gap-6">
        <div className="w-[50%] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div ref={tabsContainerRef} className="flex items-center gap-1 p-4 border-b border-slate-100 overflow-x-auto custom-scrollbar bg-slate-50 scroll-smooth">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = step.id < currentStep;
              const Icon = isCompleted ? CircleCheckBig : step.icon;
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex shrink-0 items-center gap-1.5 px-3 py-1.5 rounded-lg border-none text-[10px] font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/20 scale-105"
                      : isCompleted
                        ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" /> <span>{step.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-50/30">
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

            {currentStep === STEPS.length - 1 ? (
              <div className="w-[100px]"></div>
            ) : currentStep === STEPS.length - 2 ? (
              <button
                onClick={handleNextOrSave}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Save className="w-4 h-4" /> مراجعة وحفظ
              </button>
            ) : (
              <button
                onClick={handleNextOrSave}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-sm"
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <LivePreview data={previewData} />
      </div>
    </div>
  );
};

export default CreateQuotationWizard;