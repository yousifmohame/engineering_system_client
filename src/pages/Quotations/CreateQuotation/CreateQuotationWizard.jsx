import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../../api/axios";
import { toast } from "sonner";
import { ChevronRight, ChevronLeft, Save, Loader2, Check } from "lucide-react";

import {
  STEPS,
  getClientName,
  mapTitleToEnum,
  mapHandlingToEnum,
  getCurrentHijriYear,
  generateHijriYears,
} from "./utils/quotationConstants";
import { LivePreview } from "./components/LivePreview";
import { useAuth } from "../../../context/AuthContext";
import { getEmployees } from "../../../api/employeeApi";

import { Step0ClientProperty } from "./components/Wizart_steps/ClientProperty";
import { Step1BasicInfo } from "./components/Wizart_steps/BasicInfo";
import { Step2Template } from "./components/Wizart_steps/Template";
import { Step3Items } from "./components/Wizart_steps/Items";
import { Step4Tax } from "./components/Wizart_steps/Tax";
import { Step5Payments } from "./components/Wizart_steps/Payments";
import { Step6Attachments } from "./components/Wizart_steps/Attachments";
import { Step7Terms } from "./components/Wizart_steps/Terms";
import Conclusion from "./components/Wizart_steps/Conclusion"; // تم إضافة الاستيراد هنا
import StepPartiesSettings from "./components/Wizart_steps/StepPartiesSettings";
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

const generateReferenceNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  return `QT-${year}${month}-${randomStr}`;
};

const CreateQuotationWizard = (incomingProps) => {
  const quotationId =
    incomingProps.quotationId || incomingProps.props?.quotationId;
  const onComplete =
    incomingProps.onComplete || incomingProps.props?.onComplete;

  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const isEditMode = !!quotationId;

  const [referenceNumber, setReferenceNumber] = useState(
    generateReferenceNumber(),
  );
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

  const [firstPartyEmployeeId, setFirstPartyEmployeeId] = useState("");
  const [firstPartyRepCapacity, setFirstPartyRepCapacity] = useState(
    "إدارة المشاريع وعقود العملاء",
  );
  const [showFirstPartyEmpId, setShowFirstPartyEmpId] = useState(true);
  const [firstPartySignatureType, setFirstPartySignatureType] =
    useState("MANUAL");

  const [selectedBankAccounts, setSelectedBankAccounts] = useState([]);
  const [bankAccountsData, setBankAccountsData] = useState([
    { id: "bank_1", name: "مصرف الراجحي", account: "SA0000000000000000000000" },
    {
      id: "bank_2",
      name: "البنك الأهلي السعودي",
      account: "SA1111111111111111111111",
    },
    { id: "bank_3", name: "بنك الإنماء", account: "SA2222222222222222222222" },
  ]);

  const [missingDocs, setMissingDocs] = useState("");
  const [showMissingDocs, setShowMissingDocs] = useState(true);

  const [ownerAttachments, setOwnerAttachments] = useState([]);

  const [termsText, setTermsText] = useState(
    "1. الدفعة المقدمة غير مستردة.\n2. الرسوم الحكومية على المالك.",
  );
  // إضافة حالة الخاتمة الجديدة هنا
  const [conclusion, setConclusion] = useState("");

  const [clientTitle, setClientTitle] = useState("المواطن");
  const [handlingMethod, setHandlingMethod] = useState("المالك مباشرة");
  const [selectedPresetTerm, setSelectedPresetTerm] = useState("manual");
  const [stampType, setStampType] = useState("NONE");

  const [clientType, setClientType] = useState("فرد");
  const [signatureMethod, setSignatureMethod] = useState("SELF");
  const [repName, setRepName] = useState("");
  const [repIdNumber, setRepIdNumber] = useState("");
  const [repPhone, setRepPhone] = useState("");
  const [repCapacity, setRepCapacity] = useState("");
  const [authDocType, setAuthDocType] = useState("");
  const [authDocNumber, setAuthDocNumber] = useState("");
  const [authDocDate, setAuthDocDate] = useState("");

  const [firstPartyName, setFirstPartyName] = useState("");
  const [firstPartyRep, setFirstPartyRep] = useState("");
  const [secondPartyName, setSecondPartyName] = useState("");
  const [secondPartyRep, setSecondPartyRep] = useState("");

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients", clientSearch],
    queryFn: async () =>
      (await axios.get("/clients/simple", { params: { search: clientSearch } }))
        .data,
  });

  const { data: employeesData = [], isLoading: isLoadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: getEmployees,
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

  const { data: existingQuote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: async () =>
      (await axios.get(`/quotations/${quotationId}`)).data.data,
    enabled: isEditMode,
  });

  const { data: officeServices = [], isLoading: servicesLoading } = useQuery({
    queryKey: ["office-services"],
    queryFn: async () =>
      (await axios.get("/services")).data?.data ||
      (await axios.get("/services")).data ||
      [],
  });

  useEffect(() => {
    if (existingQuote) {
      setReferenceNumber(
        existingQuote.referenceNumber || generateReferenceNumber(),
      );
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

      setClientType(existingQuote.clientType || "فرد");
      setSignatureMethod(existingQuote.signatureMethod || "SELF");
      setRepName(existingQuote.repName || "");
      setRepIdNumber(existingQuote.repIdNumber || "");
      setRepPhone(existingQuote.repPhone || "");
      setRepCapacity(existingQuote.repCapacity || "");
      setAuthDocType(existingQuote.authDocType || "");
      setAuthDocNumber(existingQuote.authDocNumber || "");
      setAuthDocDate(
        existingQuote.authDocDate
          ? existingQuote.authDocDate.split("T")[0]
          : "",
      );

      setFirstPartyName(existingQuote.firstPartyName || "");
      setFirstPartyRep(existingQuote.firstPartyRep || "");
      setSecondPartyName(existingQuote.secondPartyName || "");
      setSecondPartyRep(existingQuote.secondPartyRep || "");

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
      setSelectedBankAccounts(existingQuote.selectedBankAccounts || []);
      setMissingDocs(existingQuote.missingDocs || "");
      setShowMissingDocs(existingQuote.showMissingDocs);
      setTermsText(existingQuote.terms || "");
      // جلب الخاتمة عند التعديل
      setConclusion(existingQuote.conclusion || "");
      setOwnerAttachments(existingQuote.ownerAttachments || []);
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

  const subtotal = items.reduce(
    (sum, item) => sum + (item.qty * item.price - item.discount),
    0,
  );
  const taxAmount = items.reduce(
    (sum, item) =>
      sum +
      (item.qty * item.price - item.discount) *
        ((item.taxRate !== undefined ? item.taxRate : 15) / 100),
    0,
  );
  const grandTotal = subtotal + taxAmount;
  const calculatedOfficeDiscount = (taxAmount * (officeTaxBearing || 0)) / 100;
  const finalPayable = grandTotal - calculatedOfficeDiscount;

  useEffect(() => {
    if (!isEditMode || (isEditMode && paymentsList.length === 0)) {
      let payments = [];
      if (paymentCount > 0 && finalPayable > 0) {
        const amountPerPayment = finalPayable / paymentCount;
        const percentagePerPayment = 100 / paymentCount;
        for (let i = 1; i <= paymentCount; i++) {
          payments.push({
            id: i,
            label: `الدفعة ${i}`,
            percentage: percentagePerPayment.toFixed(0),
            amount: amountPerPayment.toFixed(2),
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
  }, [paymentCount, finalPayable, isEditMode]);

  // 🚀 تعيين الموظف الحالي كافتراضي للطرف الأول عند إنشاء عرض جديد
  useEffect(() => {
    if (!isEditMode && user?.id && !firstPartyEmployeeId) {
      setFirstPartyEmployeeId(user.id);
    }
  }, [user, isEditMode, firstPartyEmployeeId]);

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
      if (isEditMode)
        return (await axios.put(`/quotations/${quotationId}`, payload)).data;
      return (await axios.post("/quotations", payload)).data;
    },
    onSuccess: (data) => {
      toast.success(
        isEditMode ? "تم تحديث عرض السعر بنجاح!" : "تم حفظ عرض السعر بنجاح!",
      );
      queryClient.invalidateQueries(["quotations", "quotations-list"]);
      if (onComplete) onComplete(data);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ"),
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
      referenceNumber,
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
      clientType,
      signatureMethod,
      repName: signatureMethod !== "SELF" ? repName : null,
      repIdNumber: signatureMethod !== "SELF" ? repIdNumber : null,
      repPhone: signatureMethod !== "SELF" ? repPhone : null,
      repCapacity: signatureMethod !== "SELF" ? repCapacity : null,
      authDocType: signatureMethod !== "SELF" ? authDocType : null,
      authDocNumber: signatureMethod !== "SELF" ? authDocNumber : null,
      authDocDate: signatureMethod !== "SELF" ? authDocDate || null : null,
      firstPartyName,
      firstPartyRep,
      secondPartyName,
      secondPartyRep,
      items: items.map((i, idx) => ({
        order: idx + 1,
        title: i.title,
        category: i.category || "عام",
        qty: i.qty,
        unit: i.unit,
        price: i.price,
        discount: i.discount,
        discountType: i.discountType || "PERCENTAGE",
        taxRate: i.taxRate !== undefined ? i.taxRate : 15,
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
      selectedBankAccounts,
      bankAccountsData,
      ownerAttachments: ownerAttachments.map((att) => ({
        name: att.name,
        type: att.type,
        size: att.size,
        fileData: att.fileData,
        description: att.description,
        uploadedBy: att.uploadedBy,
        uploadedAt: att.uploadedAt,
      })),
      missingDocs,
      showMissingDocs,
      terms: termsText,
      conclusion: conclusion, // تضمين الخاتمة في الطلب المرفوع للباك إند
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

  const handleNextOrSave = () =>
    setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1));

  const stepProps = {
    referenceNumber,
    setReferenceNumber,
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
    clientType,
    setClientType,
    signatureMethod,
    setSignatureMethod,
    repName,
    setRepName,
    repIdNumber,
    setRepIdNumber,
    repPhone,
    setRepPhone,
    repCapacity,
    setRepCapacity,
    authDocType,
    setAuthDocType,
    authDocNumber,
    setAuthDocNumber,
    authDocDate,
    setAuthDocDate,
    firstPartyName,
    setFirstPartyName,
    firstPartyRep,
    setFirstPartyRep,
    secondPartyName,
    setSecondPartyName,
    secondPartyRep,
    setSecondPartyRep,
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
    selectedBankAccounts,
    setSelectedBankAccounts,
    bankAccountsData,
    setBankAccountsData,
    missingDocs,
    setMissingDocs,
    showMissingDocs,
    setShowMissingDocs,
    ownerAttachments,
    setOwnerAttachments,
    termsText,
    setTermsText,
    conclusion, // تمرير الحالة للمكونات
    setConclusion, // تمرير دالة التحديث للمكونات
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
    officeServices,
    servicesLoading,
    firstPartyEmployeeId,
    setFirstPartyEmployeeId,
    firstPartyRepCapacity,
    setFirstPartyRepCapacity,
    showFirstPartyEmpId,
    setShowFirstPartyEmpId,
    firstPartySignatureType,
    setFirstPartySignatureType,
    employeesData,
    quotationData: {
      clientName:
        getClientName(clientsData?.find((c) => c.id === selectedClient)) ||
        getClientName(existingQuote?.client),
      projectName:
        propertiesData?.find((p) => p.id === selectedProperty)?.code ||
        existingQuote?.ownership?.code,
    },
  };

  const selectedPropertyDetails = propertiesData?.find(
    (p) => p.id === selectedProperty,
  );

  const selectedEmployee = employeesData?.find(
    (emp) => emp.id === firstPartyEmployeeId,
  );

  // 🚀 استخراج بيانات المعاملة والمحضر للمعاينة
  const selectedTxObj = transactionsData?.find(tx => tx.id === selectedTransaction);
  const selectedMeetingObj = meetingsData?.find(m => m.id === selectedMeeting);

  

  const previewData = {
    referenceNumber,
    templateType,
    issueDate,
    validityDays,
    clientTitle: clientTitle || "المواطن",
    clientNameForPreview:
      getClientName(clientsData?.find((c) => c.id === selectedClient)) ||
      getClientName(existingQuote?.client) ||
      "عميل غير محدد",
    clientCodeForPreview:
      clientsData?.find((c) => c.id === selectedClient)?.clientCode ||
      existingQuote?.client?.clientCode ||
      "—",
    propertyCodeForPreview:
      propertiesData?.find((p) => p.id === selectedProperty)?.code ||
      existingQuote?.ownership?.code ||
      "الملكية...",
    deedNumber:
      selectedPropertyDetails?.deedNumber ||
      existingQuote?.ownership?.deedNumber ||
      "",
    transactionType,
    licenseNumber,
    licenseYear,
    serviceNumber,
    serviceYear,
    clientType,
    signatureMethod,
    repName,
    repIdNumber,
    repPhone,
    repCapacity,
    authDocType,
    authDocNumber,
    authDocDate,
    secondPartyName,
    secondPartyRep,
    items,
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    firstPartyName: "شركة ديتيلز كونسولتس للاستشارات الهندسية", // ثابتة أو يمكن تغييرها
    firstPartyRep: 
      selectedEmployee?.fullName || 
      selectedEmployee?.name || 
      user?.fullName || 
      user?.name || 
      "_________________",
      
    firstPartyEmpCode: 
      selectedEmployee?.employeeCode || 
      user?.employeeCode || 
      "SYS-XXX",
      
    employeeSignatureUrl: 
      selectedEmployee?.signatureUrl || 
      user?.signatureUrl || 
      null,

    firstPartyRepCapacity,
    showFirstPartyEmpId,
    firstPartySignatureType,
    employeeName:
      user?.name || user?.fullName || "إدارة المشاريع وعقود العملاء",
    employeeId: user?.employeeCode || user?.id || "SYS-109",
    termsText,
    conclusion, // إرسال الخاتمة لبيانات المعاينة الحية
    missingDocs,
    showMissingDocs,
    paymentsList,
    stampType,
    acceptedMethods,
    selectedBankAccounts,
    bankAccountsData,
    handlingMethod,
    showPropertyCode,
    showClientCode,
    officeTaxBearing,
    transactionRefForPreview: selectedTxObj?.referenceNumber || selectedTxObj?.ref || existingQuote?.transaction?.referenceNumber || null,
    meetingTitleForPreview: selectedMeetingObj?.referenceNumber || existingQuote?.meetingMinute?.title || null,
    status: existingQuote?.status || "DRAFT",
    plots:
      selectedPropertyDetails?.plots || existingQuote?.ownership?.plots || [],
    boundaries:
      selectedPropertyDetails?.boundaries ||
      existingQuote?.ownership?.boundaries ||
      [],
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-2 sm:p-3 font-[Tajawal] text-[#123f59]"
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

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <section className="flex min-h-0 min-w-0 flex-1 lg:flex-[1.1] flex-col overflow-hidden rounded-[20px] sm:rounded-[24px] border border-[#d8b46a]/25 bg-white shadow-[0_10px_26px_rgba(18,63,89,0.08)]">
          <div className="shrink-0 border-b border-[#e8ddc8] bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 sm:h-11 sm:w-11 shrink-0 place-items-center rounded-2xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74] shadow-md">
                  <IconWithText
                    icon={Save}
                    text="عرض"
                    vertical
                    iconClassName="h-4 w-4 sm:h-5 sm:w-5"
                    textClassName="text-[7px] font-black leading-none hidden sm:block"
                  />
                </span>
                <div className="min-w-0 flex flex-col gap-1">
                  <h2 className="truncate text-base sm:text-lg font-black flex items-center gap-2">
                    {isEditMode ? "تعديل عرض سعر" : "إنشاء عرض سعر"}
                    <span className="text-[10px] font-mono font-bold bg-[#123f59] border border-[#15536f] px-2 py-0.5 rounded text-indigo-100 hidden sm:inline-block">
                      {referenceNumber}
                    </span>
                  </h2>
                  <p className="mt-0.5 truncate text-[10px] sm:text-[11px] font-bold text-white/60">
                    بناء العرض، البنود، الضريبة، والمراجعة بكل سهولة.
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-xl border border-[#e2bf74]/35 bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black text-[#e2bf74]">
                المرحلة {currentStep + 1} / {STEPS.length}
              </span>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden bg-[#fbf8f1]/30">
            <aside className="hidden md:block w-[180px] shrink-0 border-l border-[#e8ddc8] bg-white/50 p-4 overflow-y-auto custom-scrollbar-slim">
              <div className="relative">
                <div className="absolute right-[19px] top-4 bottom-8 w-[2px] bg-slate-200/80 rounded-full" />
                <div className="flex flex-col gap-5 relative z-10">
                  {STEPS.map((step, index) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = step.id < currentStep;
                    const Icon = isCompleted ? Check : step.icon;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(step.id)}
                        className={`group relative flex items-start gap-3 text-right transition-all duration-300 ${isActive ? "opacity-100" : isCompleted ? "opacity-80 hover:opacity-100" : "opacity-50 hover:opacity-80"}`}
                        type="button"
                      >
                        <div
                          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${isActive ? "border-[#e2bf74] bg-[#123f59] text-[#e2bf74] shadow-[0_4px_12px_rgba(18,63,89,0.2)] scale-110" : isCompleted ? "border-emerald-500 bg-emerald-50 text-emerald-600" : "border-slate-300 bg-slate-50 text-slate-400"}`}
                        >
                          <Icon
                            className={`h-4 w-4 ${isCompleted && !isActive ? "text-emerald-500 stroke-[3]" : ""}`}
                          />
                        </div>
                        <div className="flex flex-col pt-1">
                          <span
                            className={`text-[11px] font-black transition-colors ${isActive ? "text-[#123f59]" : "text-slate-600"}`}
                          >
                            {step.label}
                          </span>
                          {isActive && (
                            <span className="text-[9px] font-bold text-[#e2bf74] mt-0.5">
                              قيد الإجراء
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-5 custom-scrollbar-slim relative">
              <div className="mx-auto max-w-3xl h-full">
                <div className="md:hidden flex items-center justify-between mb-4 pb-2 border-b border-[#e8ddc8]">
                  <span className="text-xs font-black text-[#123f59]">
                    {STEPS[currentStep]?.label}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    خطوة {currentStep + 1} من {STEPS.length}
                  </span>
                </div>
                {/* ترتيب الخطوات مع إدراج الخاتمة قبل خطوة المعاينة */}
                {currentStep === 0 && <Step2Template props={stepProps} />}
                {currentStep === 1 && <Step0ClientProperty props={stepProps} />}
                {currentStep === 2 && <Step1BasicInfo props={stepProps} />}
                {currentStep === 3 && <Step3Items props={stepProps} />}
                {currentStep === 4 && <Step4Tax props={stepProps} />}
                {currentStep === 5 && <Step5Payments props={stepProps} />}
                {currentStep === 6 && <Step6Attachments props={stepProps} />}
                {currentStep === 7 && <Step7Terms props={stepProps} />}
                {currentStep === 8 && <Conclusion props={stepProps} />}{" "}
                {/* الخطوة الجديدة */}
                {currentStep === 9 && <StepPartiesSettings props={stepProps} />}
                {currentStep === 10 && <Step8Review props={stepProps} />}{" "}
                {/* تم تأخيرها لتصبح الخطوة الأخيرة */}
              </div>
            </div>
          </div>

          <div className="shrink-0 border-t border-[#e8ddc8] bg-white p-3 sm:p-4 shadow-[0_-4px_15px_rgba(0,0,0,0.02)] z-10">
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((p) => p - 1)}
                className="inline-flex h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-6 text-xs font-black text-slate-500 transition hover:border-[#d8b46a]/50 hover:bg-[#fbf8f1] hover:text-[#123f59] disabled:cursor-not-allowed disabled:opacity-40"
                type="button"
              >
                <ChevronRight className="h-5 w-5" /> رجوع للخلف
              </button>
              <div className="hidden sm:flex flex-col items-center">
                <div className="text-[10px] font-bold text-slate-400">
                  إكمال الإعدادات
                </div>
                <div className="text-xs font-black text-[#123f59]">
                  {Math.round(((currentStep + 1) / STEPS.length) * 100)}%
                </div>
              </div>
              {currentStep === STEPS.length - 1 ? (
                <div className="hidden sm:block h-11 w-[180px]" />
              ) : currentStep === STEPS.length - 2 ? (
                <button
                  onClick={handleNextOrSave}
                  className="inline-flex h-11 w-full sm:w-auto min-w-0 sm:min-w-[180px] items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] px-6 text-xs font-black text-white shadow-[0_8px_20px_rgba(18,63,89,0.2)] transition-transform hover:-translate-y-[2px] active:scale-[0.98]"
                  type="button"
                >
                  <IconWithText
                    icon={Save}
                    text="مراجعة واعتماد"
                    iconClassName="h-5 w-5 text-[#e2bf74]"
                    textClassName="text-[13px] font-black"
                  />
                </button>
              ) : (
                <button
                  onClick={handleNextOrSave}
                  className="group inline-flex h-11 w-full sm:w-auto min-w-0 sm:min-w-[180px] items-center justify-between rounded-xl bg-[#123f59] px-4 sm:px-6 text-xs font-black text-white shadow-[0_8px_20px_rgba(18,63,89,0.15)] transition-all hover:bg-[#0e7490] hover:-translate-y-[2px] active:scale-[0.98]"
                  type="button"
                >
                  <div className="flex flex-col items-start text-right leading-tight">
                    <span className="text-[9px] text-[#e2bf74] font-bold opacity-80">
                      الخطوة التالية
                    </span>
                    <span className="text-[11px] truncate max-w-[120px]">
                      {STEPS[currentStep + 1]?.label}
                    </span>
                  </div>
                  <div className="p-1 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors mr-2">
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </div>
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="hidden lg:flex min-h-0 min-w-0 flex-[0.9] overflow-hidden rounded-[24px] border border-[#d8b46a]/25 shadow-sm bg-white">
          <LivePreview data={previewData} />
        </aside>
      </div>
    </div>
  );
};
export default CreateQuotationWizard;
