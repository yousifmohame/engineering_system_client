import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Sparkles,
  FileText,
  Eye,
  Receipt,
  CreditCard,
  Paperclip,
  ScrollText,
  QrCode,
  Upload,
  Users,
  Search,
  Plus,
  Building,
  ChevronRight,
  ChevronLeft,
  CircleCheckBig,
  FileSearch,
  Package,
  Trash2,
  TriangleAlert,
  Save,
  Send,
  Download,
  Copy,
  Loader2,
  MapPin,
} from "lucide-react";

// ==========================================
// 1. الثوابت (Constants)
// ==========================================
const STEPS = [
  { id: 0, label: "الملكية والعميل", icon: Building },
  { id: 1, label: "البيانات", icon: FileText },
  { id: 2, label: "النموذج", icon: Eye },
  { id: 3, label: "البنود", icon: Receipt },
  { id: 4, label: "الضريبة", icon: CreditCard },
  { id: 5, label: "الدفعات", icon: CreditCard },
  { id: 6, label: "المرفقات", icon: Paperclip },
  { id: 7, label: "الشروط", icon: ScrollText },
  { id: 8, label: "المعاينة", icon: QrCode },
];

const PRESET_TERMS = [
  { id: "manual", label: "يدوي", type: "custom" },
  { id: "short_gen", label: "شروط مختصرة — عامة", type: "short" },
  { id: "det_gen", label: "شروط تفصيلية — عامة (شاملة)", type: "detailed" },
  { id: "short_real", label: "شروط مختصرة — عقارية (أفراد)", type: "short" },
  { id: "det_real", label: "شروط تفصيلية — عقارية (أفراد)", type: "detailed" },
  { id: "short_eng", label: "شروط مختصرة — هندسية (شركات)", type: "short" },
  { id: "det_eng", label: "شروط تفصيلية — هندسية (شركات)", type: "detailed" },
  { id: "det_gov", label: "شروط تفصيلية — جهات حكومية", type: "detailed" },
];

const CLIENT_TITLES = [
  "المواطن",
  "المواطنة",
  "السادة / شركة",
  "السادة / كيان",
  "السادة / وقف",
  "صاحب السمو الأمير",
  "صاحبة السمو الأميرة",
  "صاحب السمو الملكي الأمير",
  "صاحبة السمو الملكي الأميرة",
  "لقب مخصص",
];

const HANDLING_METHODS = ["المالك مباشرة", "عن طريق مفوض", "عن طريق وكيل"];

// دالة لاستخراج اسم العميل (لتفادي خطأ Object in React Child)
const getClientName = (client) => {
  if (!client || !client.name) return "عميل غير محدد";
  if (typeof client.name === "object")
    return client.name.ar || client.name.en || "عميل غير محدد";
  return client.fullNameRaw || client.name;
};

const mapTitleToEnum = (arTitle) => {
  const map = {
    المواطن: "MR",
    المواطنة: "MRS",
    "السادة / شركة": "SIR_COMPANY",
    "السادة / كيان": "SIR_ENTITY",
    "السادة / وقف": "SIR_WAQF",
    "صاحب السمو الأمير": "PRINCE",
    "صاحبة السمو الأميرة": "PRINCESS",
    "صاحب السمو الملكي الأمير": "ROYAL_PRINCE",
    "صاحبة السمو الملكي الأميرة": "ROYAL_PRINCESS",
    "لقب مخصص": "CUSTOM",
  };
  return map[arTitle] || "MR";
};

const mapHandlingToEnum = (arMethod) => {
  const map = {
    "المالك مباشرة": "DIRECT",
    "عن طريق مفوض": "AUTHORIZED",
    "عن طريق وكيل": "AGENT",
  };
  return map[arMethod] || "DIRECT";
};

// دالة لحساب السنة الهجرية الحالية تقريبياً
const getCurrentHijriYear = () => {
  const currentYear = new Date().getFullYear();
  // معادلة تقريبية لتحويل الميلادي إلى هجري
  return Math.floor((currentYear - 622) * (33 / 32));
};

// دالة لتوليد مصفوفة السنوات الهجرية مع ما يقابلها بالميلادي
const generateHijriYears = (startYear, endYear) => {
  const years = [];
  for (let hYear = endYear; hYear >= startYear; hYear--) {
    // ترتيب تنازلي (الأحدث أولاً)
    // معادلة تقريبية لحساب بداية ونهاية السنة الميلادية المقابلة للسنة الهجرية
    const gYearStart = Math.floor(hYear - hYear / 33 + 622);
    years.push({
      value: hYear.toString(),
      label: `${hYear} هـ (${gYearStart} - ${gYearStart + 1} م)`,
    });
  }
  return years;
};

// ==========================================
// 2. المكون الرئيسي
// ==========================================
const CreateQuotationWizard = ({ onComplete }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);

  // States for Step 0
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");

  // States for Step 1
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [validityDays, setValidityDays] = useState(30);
  const [isRenewable, setIsRenewable] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [serviceNumber, setServiceNumber] = useState("");
  const [serviceYear, setServiceYear] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseYear, setLicenseYear] = useState("");

  // States for Step 2
  const [templateType, setTemplateType] = useState("SUMMARY");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showClientCode, setShowClientCode] = useState(true);
  const [showPropertyCode, setShowPropertyCode] = useState(true);

  // States (3: Items)
  const [items, setItems] = useState([]);

  // States (4: Tax)
  const [isTaxInclusive, setIsTaxInclusive] = useState(false);
  const [taxRate, setTaxRate] = useState(15);
  const [officeTaxBearing, setOfficeTaxBearing] = useState(0);

  // States (5: Payments)
  const [paymentCount, setPaymentCount] = useState(1);
  const [acceptedMethods, setAcceptedMethods] = useState(["bank"]);

  // States (6: Attachments)
  const [missingDocs, setMissingDocs] = useState("");
  const [showMissingDocs, setShowMissingDocs] = useState(false);

  // States (7: Terms)
  const [termsText, setTermsText] = useState(
    "1. الدفعة المقدمة غير مستردة بعد بدء العمل بأي حال من الأحوال.\n2. جميع الرسوم الحكومية تقع على المالك.\n3. العرض ساري لمدة 30 يوم.",
  );
  const [internalNotes, setInternalNotes] = useState("");
  const [clientTitle, setClientTitle] = useState("المواطن");
  const [handlingMethod, setHandlingMethod] = useState("المالك مباشرة");
  const [selectedPresetTerm, setSelectedPresetTerm] = useState("manual");

  // ==========================================
  // API Queries (جلب البيانات الحقيقية من الباك إند)
  // ==========================================

  // 1. العملاء
  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ["clients", clientSearch],
    queryFn: async () => {
      const res = await axios.get("/clients/simple", {
        params: { search: clientSearch },
      });
      return res.data;
    },
  });

  // 2. الملكيات
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery({
    queryKey: ["properties", propertySearch],
    queryFn: async () => {
      const res = await axios.get("/properties", {
        params: { search: propertySearch },
      });
      return res.data?.data || res.data || [];
    },
  });

  // 3. النماذج
  const { data: serverTemplates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => {
      const res = await axios.get("/quotation-templates");
      return res.data.data.filter((t) => t.status !== "disabled");
    },
  });

  // 4. مكتبة البنود
  const { data: serverItems = [], isLoading: libItemsLoading } = useQuery({
    queryKey: ["quotation-library-items"],
    queryFn: async () => {
      const res = await axios.get("/quotation-library/items");
      return res.data.data.filter((i) => i.isActive);
    },
  });

  // تحديد النموذج الافتراضي بمجرد جلب النماذج
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
  // العمليات الحسابية والدوال المساعدة
  // ==========================================
  const subtotal = items.reduce(
    (sum, item) => sum + (item.qty * item.price - item.discount),
    0,
  );
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

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

  const handleItemChange = (id, field, value) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]:
                field === "title" || field === "unit" ? value : Number(value),
            }
          : item,
      ),
    );
  };

  const removeItem = (id) => setItems(items.filter((item) => item.id !== id));

  const toggleMethod = (method) => {
    setAcceptedMethods((prev) =>
      prev.includes(method)
        ? prev.filter((m) => m !== method)
        : [...prev, method],
    );
  };

  const calculateExpiryDate = (days) => {
    const date = new Date(issueDate);
    date.setDate(date.getDate() + (days === "custom" ? 0 : Number(days)));
    return date.toISOString().split("T")[0];
  };

  // دالة إضافة بند من المكتبة
  const addItemFromLibrary = (e) => {
    const itemCode = e.target.value;
    if (!itemCode) return;

    const libItem = serverItems.find((i) => i.code === itemCode);
    if (libItem) {
      setItems([
        ...items,
        {
          id: Date.now(),
          title: libItem.title,
          category: libItem.category,
          qty: 1,
          unit: libItem.unit,
          price: libItem.price,
          discount: 0,
          discountType: "PERCENTAGE",
        },
      ]);
    }
    e.target.value = ""; // Reset dropdown
  };

  // ==========================================
  // حفظ العرض في الداتابيز
  // ==========================================
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/quotations", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("تم حفظ عرض السعر بنجاح!");
      queryClient.invalidateQueries(["quotations"]);
      queryClient.invalidateQueries(["quotations-stats"]); // تحديث الداشبورد
      if (onComplete) onComplete(data);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  const handleSave = (isDraft = false) => {
    if (!selectedClient && !selectedProperty) {
      toast.error("يرجى اختيار ملف عميل أو ملف ملكية واحد على الأقل.");
      setCurrentStep(0);
      return;
    }

    if (items.length === 0) {
      toast.error("يرجى إضافة بند واحد على الأقل");
      setCurrentStep(3);
      return;
    }

    const payload = {
      clientId: selectedClient || null, // قد يكون null لو اختار ملكية فقط بدون عميل (نظرياً)
      propertyId: selectedProperty || null,
      issueDate,
      validityDays: validityDays === "custom" ? 30 : validityDays,
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
      items: items.map((i) => ({
        title: i.title,
        category: i.category,
        qty: i.qty,
        unit: i.unit,
        price: i.price,
        discount: i.discount,
        discountType: i.discountType || "PERCENTAGE",
      })),
      taxRate: taxRate,
      officeTaxBearing: officeTaxBearing,
      payments: paymentsList,
      acceptedMethods,
      missingDocs,
      showMissingDocs,
      terms: termsText,
      notes: internalNotes,
      clientTitle: mapTitleToEnum(clientTitle),
      handlingMethod: mapHandlingToEnum(handlingMethod),
      isDraft,
    };

    saveMutation.mutate(payload);
  };

  // ==========================================
  // المعاينة الفورية (Live Preview)
  // ==========================================
  const LivePreview = () => {
    const selectedClientData = clientsData?.find(
      (c) => c.id === selectedClient,
    );
    const clientNameForPreview = selectedClientData
      ? getClientName(selectedClientData)
      : "العميل...";

    const selectedPropertyData = propertiesData?.find(
      (p) => p.id === selectedProperty,
    );
    const propertyCodeForPreview = selectedPropertyData
      ? selectedPropertyData.code
      : "الملكية...";

    return (
      <div className="hidden lg:block w-[38%] border-r border-slate-200 bg-white p-4 h-full overflow-y-auto custom-scrollbar">
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
          <Eye className="w-4 h-4 text-blue-600" /> معاينة فورية —{" "}
          {templateType === "SUMMARY" ? "مختصر" : "تفصيلي"}
        </div>

        <div className="border border-slate-200 rounded-lg p-4 bg-[#fefefe] shadow-sm relative text-[10px] leading-relaxed">
          <div className="text-center pb-2 border-b-2 border-blue-700 mb-3">
            <div className="text-sm font-black text-blue-700">
              مكتب الخدمات العقارية
            </div>
            <div className="text-[9px] text-slate-500">
              Real Estate Services Office
            </div>
          </div>

          <div className="text-xs font-bold text-slate-800 mb-1">عرض سعر</div>
          <div className="text-[9px] text-slate-500 mb-2">
            رقم: <strong className="font-mono text-blue-600">QT-Auto</strong> |
            تاريخ: {issueDate} | صلاحية:{" "}
            {validityDays === "custom" ? "مخصص" : `${validityDays} يوم`}
          </div>

          <div className="grid grid-cols-2 gap-1.5 mb-2">
            <div className="p-1.5 bg-slate-50 rounded">
              <div className="text-[8px] text-slate-400">العميل</div>
              <div className="font-bold text-[10px] truncate">
                {clientTitle !== "لقب مخصص" ? `${clientTitle} / ` : ""}
                {clientNameForPreview}
              </div>
            </div>
            <div className="p-1.5 bg-slate-50 rounded">
              <div className="text-[8px] text-slate-400">الملكية</div>
              <div className="font-bold text-[10px] truncate">
                {propertyCodeForPreview}
              </div>
            </div>
          </div>

          <table className="w-full mb-2">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-1 text-right text-[8px] text-slate-500 font-bold">
                  #
                </th>
                <th className="p-1 text-right text-[8px] text-slate-500 font-bold">
                  البند
                </th>
                <th className="p-1 text-center text-[8px] text-slate-500 font-bold">
                  الكمية
                </th>
                <th className="p-1 text-center text-[8px] text-slate-500 font-bold">
                  السعر
                </th>
                <th className="p-1 text-left text-[8px] text-slate-500 font-bold">
                  الإجمالي
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className="border-b border-slate-100">
                  <td className="p-1 text-[8px] text-slate-600 font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-1 text-[9px] text-slate-700 truncate max-w-[100px]">
                    {item.title || "بند جديد"}
                  </td>
                  <td className="p-1 text-center text-[8px] text-slate-600 font-mono">
                    {item.qty}
                  </td>
                  <td className="p-1 text-center text-[8px] text-slate-600 font-mono">
                    {item.price.toLocaleString()}
                  </td>
                  <td className="p-1 text-left text-[8px] font-bold text-slate-700 font-mono">
                    {(item.qty * item.price - item.discount).toLocaleString()}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-2 text-center text-slate-400 text-[8px]"
                  >
                    أضف بنوداً من الخطوة 3
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="p-1.5 bg-blue-50/50 rounded mb-2">
            <div className="flex justify-between text-[9px] mb-0.5">
              <span className="text-slate-600">قبل الضريبة:</span>
              <strong className="font-mono text-slate-800">
                {subtotal.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between text-[9px] mb-0.5">
              <span className="text-slate-600">ضريبة ({taxRate}%):</span>
              <strong className="font-mono text-slate-800">
                {taxAmount.toLocaleString()}
              </strong>
            </div>
            <div className="flex justify-between pt-1 mt-1 border-t border-blue-100 text-[11px] font-bold text-blue-700">
              <span>الإجمالي شامل:</span>
              <span className="font-mono">
                {grandTotal.toLocaleString()} ر.س
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Renders (Steps)
  // ==========================================
  const renderStep0 = () => (
    <div className="animate-in fade-in duration-300">
      <div className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-blue-600" />
        الخطوة 0 — تحديد الملكية والعميل (الأساس)
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 1. اختيار الملكية (تم نقله ليصبح الأول على اليمين) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          {/* شريط زينة جانبي */}
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500"></div>

          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-500" /> تحديد ملف الملكية
          </div>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="بحث برقم الصك، الحي، أو الكود..."
              className="w-full py-2.5 pr-9 pl-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {propertiesLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : propertiesData?.length > 0 ? (
              propertiesData.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedProperty(prop.id);
                    // 👈 الربط الذكي: إذا اخترت ملكية، نحدد العميل الخاص بها تلقائياً
                    const relatedClientId = prop.clientId || prop.client?.id;
                    if (relatedClientId) {
                      setSelectedClient(relatedClientId);
                    }
                  }}
                  className={`flex flex-col gap-1 p-3 rounded-xl cursor-pointer border transition-all ${selectedProperty === prop.id ? "border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm" : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-sm text-cyan-700">
                      {prop.code}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-100">
                      صك: {prop.deedNumber || "—"}
                    </div>
                  </div>
                  {prop.district && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {prop.city}{" "}
                      - {prop.district}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center p-4">
                لا توجد ملكيات مطابقة
              </div>
            )}
          </div>
        </div>

        {/* 2. اختيار العميل (أصبح على اليسار) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          {/* شريط زينة جانبي */}
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-blue-500"></div>

          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> تحديد ملف العميل
          </div>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="بحث بالاسم، الهوية، الجوال..."
              className="w-full py-2.5 pr-9 pl-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
            {clientsLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : clientsData?.length > 0 ? (
              clientsData.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`flex flex-col p-3 rounded-xl cursor-pointer border transition-all ${selectedClient === client.id ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm" : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-blue-800">
                      {getClientName(client)}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {client.clientCode}
                    </div>
                  </div>
                  {(client.idNumber || client.mobile) && (
                    <div className="text-[10px] text-slate-500 flex gap-3 mt-1">
                      {client.idNumber && <span>هوية: {client.idNumber}</span>}
                      {client.mobile && (
                        <span className="dir-ltr text-left">
                          {client.mobile}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center p-4">
                لا يوجد عملاء مطابقين
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2 text-xs text-blue-800">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <strong>نصيحة:</strong> اختيار ملف الملكية أولاً سيقوم بتحديد العميل
        المالك لها تلقائياً. يمكنك الاستمرار بتحديد أحدهما فقط إذا لزم الأمر.
      </div>
    </div>
  );

  const renderStep1 = () => {
    // 1. توليد قائمة سنوات طلب الخدمة (من 1430 إلى السنة الحالية)
    const currentHijri = getCurrentHijriYear();
    const serviceYearsList = generateHijriYears(1430, currentHijri);

    // 2. توليد قائمة سنوات الرخصة بناءً على نوع المعاملة
    let licenseYearsList = [];
    if (transactionType === "تصحيح وضع مبنى قائم") {
      licenseYearsList = generateHijriYears(1370, 1427);
    } else {
      licenseYearsList = generateHijriYears(1427, currentHijri);
    }

    return (
      <div className="animate-in fade-in duration-300">
        <div className="text-[15px] font-bold text-slate-800 mb-3">
          الخطوة 1 — البيانات الأساسية
        </div>

        {/* ----------------- الجزء الأول: تواريخ وصلاحية العرض ----------------- */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 mb-3 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                تاريخ العرض
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                صلاحية العرض (أيام)
              </label>
              <input
                type="text" // غيرناه لـ text ليقبل كلمة "غير محدد"
                value={validityDays === "unlimited" ? "غير محدد" : validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                readOnly={validityDays === "unlimited"}
                className={`w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 ${validityDays === "unlimited" ? "bg-slate-100 font-bold" : ""}`}
              />
            </div>
          </div>

          {/* أزرار الصلاحية السريعة (حسب التصميم المرفق) */}
          <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
            {[3, 7, 14, 30, 60, "unlimited"].map((val) => (
              <button
                key={val}
                onClick={() => setValidityDays(val)}
                className={`px-4 py-1.5 rounded-md text-[11px] font-bold cursor-pointer border transition-colors ${
                  validityDays === val
                    ? "bg-slate-800 text-white border-slate-800 shadow-md" // لون داكن ليتطابق مع شكل الأزرار في رسمتك
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {val === "unlimited" ? "غير محدد" : `${val} أيام`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <label className="text-[11px] font-bold text-slate-700">
              قابل للتجديد التلقائي؟
            </label>
            <button
              onClick={() => setIsRenewable(!isRenewable)}
              className={`px-4 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
                isRenewable
                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                  : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
              }`}
            >
              {isRenewable ? "نعم" : "لا"}
            </button>
          </div>
        </div>

        {/* ----------------- الجزء الثاني: بيانات الخدمة والرخصة ----------------- */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 border-r-[3px] border-r-cyan-600 mb-3 shadow-sm relative">
          <div className="text-xs font-bold text-cyan-700 mb-3 flex items-center gap-1.5">
            <FileSearch className="w-3.5 h-3.5" /> بيانات الخدمة والرخصة
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                نوع المعاملة
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
              >
                <option value="">— اختر المعاملة —</option>
                <option value="إفراغ عقاري">إفراغ عقاري</option>
                <option value="رهن عقاري">رهن عقاري</option>
                <option value="تصحيح وضع مبنى قائم">
                  تصحيح وضع مبنى قائم
                </option>{" "}
                {/* الخيار الذي يغير السنوات */}
              </select>
              <div className="text-[9px] text-slate-400 mt-1">
                سيتم ربطها بشاشة الخدمات لاحقاً
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم الخدمة
              </label>
              <input
                type="text"
                value={serviceNumber}
                onChange={(e) => setServiceNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                سنة طلب الخدمة
              </label>
              <select
                value={serviceYear}
                onChange={(e) => setServiceYear(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500 bg-white"
              >
                <option value="">— اختر السنة —</option>
                {serviceYearsList.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                رقم الرخصة
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                سنة الرخصة
              </label>
              <select
                value={licenseYear}
                onChange={(e) => setLicenseYear(e.target.value)}
                className={`w-full p-2 border rounded-lg text-xs font-mono outline-none bg-white transition-colors ${
                  transactionType === "تصحيح وضع مبنى قائم"
                    ? "border-amber-400 focus:border-amber-500 bg-amber-50/30" // تمييز لوني إذا تغير النطاق
                    : "border-slate-300 focus:border-blue-500"
                }`}
              >
                <option value="">— اختر السنة —</option>
                {licenseYearsList.map((year) => (
                  <option key={year.value} value={year.value}>
                    {year.label}
                  </option>
                ))}
              </select>
              {transactionType === "تصحيح وضع مبنى قائم" && (
                <div className="text-[9px] text-amber-600 mt-1 font-bold">
                  * تم تحديد النطاق (1370 هـ - 1427 هـ) بناءً على نوع المعاملة
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    const summaryTemplates = serverTemplates.filter(
      (t) => t.type === "SUMMARY",
    );
    const detailedTemplates = serverTemplates.filter(
      (t) => t.type === "DETAILED",
    );

    return (
      <div className="animate-in fade-in duration-300">
        <div className="text-[15px] font-bold text-slate-800 mb-3">
          الخطوة 2 — اختيار النموذج
        </div>

        {templatesLoading ? (
          <div className="p-8 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div
                onClick={() => {
                  setTemplateType("SUMMARY");
                  setSelectedTemplate("");
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${templateType === "SUMMARY" ? "bg-blue-50/30 border-blue-500 shadow-sm" : "bg-white border-slate-200 hover:border-blue-300"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {templateType === "SUMMARY" ? (
                    <CircleCheckBig className="w-4 h-4 text-blue-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span
                    className={`text-[13px] font-bold ${templateType === "SUMMARY" ? "text-blue-600" : "text-slate-700"}`}
                  >
                    مختصر (صفحة واحدة)
                  </span>
                </div>
              </div>
              <div
                onClick={() => {
                  setTemplateType("DETAILED");
                  setSelectedTemplate("");
                }}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${templateType === "DETAILED" ? "bg-violet-50/30 border-violet-500 shadow-sm" : "bg-white border-slate-200 hover:border-violet-300"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {templateType === "DETAILED" ? (
                    <CircleCheckBig className="w-4 h-4 text-violet-500" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                  )}
                  <span
                    className={`text-[13px] font-bold ${templateType === "DETAILED" ? "text-violet-600" : "text-slate-700"}`}
                  >
                    تفصيلي (عدة صفحات)
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 mb-3 shadow-sm">
              <div className="text-xs font-bold text-slate-700 mb-2">
                النماذج المتاحة
              </div>
              <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                {(templateType === "SUMMARY"
                  ? summaryTemplates
                  : detailedTemplates
                ).map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  const activeColor =
                    templateType === "SUMMARY" ? "blue" : "violet";
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => {
                        setSelectedTemplate(tpl.id);
                        setTermsText(tpl.defaultTerms || termsText);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border transition-colors ${isSelected ? `border-${activeColor}-200 bg-${activeColor}-50/50` : "border-slate-100 bg-white hover:bg-slate-50"}`}
                    >
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? `bg-${activeColor}-100 text-${activeColor}-700` : "bg-slate-100 text-slate-500"}`}
                      >
                        {tpl.id}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-bold truncate ${isSelected ? `text-${activeColor}-800` : "text-slate-800"}`}
                        >
                          {tpl.title}
                        </div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">
                          {tpl.desc}
                        </div>
                      </div>
                      {tpl.isDefault && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold whitespace-nowrap">
                          افتراضي
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="text-xs font-bold text-slate-700 mb-2">
                خيارات العرض
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 font-medium hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={showClientCode}
                    onChange={(e) => setShowClientCode(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />{" "}
                  إظهار كود العميل
                </label>
                <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 font-medium hover:text-blue-600">
                  <input
                    type="checkbox"
                    checked={showPropertyCode}
                    onChange={(e) => setShowPropertyCode(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />{" "}
                  إظهار كود الملكية
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:w-[62%] p-4 md:p-5 overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-3">
          <div className="text-[15px] font-bold text-slate-800">
            الخطوة 3 — البنود والتسعير
          </div>
          <div className="flex gap-1.5">
            {libItemsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
            ) : (
              <select
                onChange={addItemFromLibrary}
                className="px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold outline-none cursor-pointer max-w-[150px]"
              >
                <option value="">+ إضافة من المكتبة</option>
                {serverItems.map((i) => (
                  <option key={i.code} value={i.code}>
                    {i.title} ({i.price} ر.س)
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={() =>
                setItems([
                  ...items,
                  {
                    id: Date.now(),
                    title: "",
                    category: "عام",
                    qty: 1,
                    unit: "وحدة",
                    price: 0,
                    discount: 0,
                  },
                ])
              }
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-700"
            >
              <Plus className="w-3 h-3" /> بند حر
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-right border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-2 text-[10px] text-slate-500 font-bold w-6">
                    #
                  </th>
                  <th className="p-2 text-[10px] text-slate-500 font-bold">
                    البند
                  </th>
                  <th className="p-2 text-[10px] text-slate-500 font-bold w-14">
                    الكمية
                  </th>
                  <th className="p-2 text-[10px] text-slate-500 font-bold w-14">
                    الوحدة
                  </th>
                  <th className="p-2 text-[10px] text-slate-500 font-bold w-20">
                    السعر
                  </th>
                  <th className="p-2 text-[10px] text-slate-500 font-bold w-16">
                    خصم
                  </th>
                  <th className="p-2 text-[10px] text-slate-500 font-bold w-16">
                    الإجمالي
                  </th>
                  <th className="p-2 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50"
                  >
                    <td className="p-2 text-[11px] text-slate-400 font-mono">
                      {index + 1}
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) =>
                          handleItemChange(item.id, "title", e.target.value)
                        }
                        className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(item.id, "qty", e.target.value)
                        }
                        className="w-full p-1.5 border border-slate-200 rounded text-[11px] outline-none text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) =>
                          handleItemChange(item.id, "unit", e.target.value)
                        }
                        className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded text-[10px] outline-none text-center text-slate-500"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) =>
                          handleItemChange(item.id, "price", e.target.value)
                        }
                        className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-mono outline-none text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        value={item.discount}
                        onChange={(e) =>
                          handleItemChange(item.id, "discount", e.target.value)
                        }
                        className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-mono outline-none text-center text-red-500"
                      />
                    </td>
                    <td className="p-2 text-[11px] font-bold text-blue-700 font-mono text-left">
                      {(item.qty * item.price - item.discount).toLocaleString()}
                    </td>
                    <td className="p-2 text-left">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-4 text-center text-[10px] text-slate-400"
                    >
                      لا يوجد بنود، قم بإضافة بند حر أو من المكتبة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end pt-3 mt-2 border-t border-slate-200 text-[13px] font-black text-blue-700">
            المجموع الفرعي: {subtotal.toLocaleString()} ر.س
          </div>
        </div>
      </div>
      <LivePreview />
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:w-[62%] p-4 md:p-5 overflow-y-auto custom-scrollbar">
        <div className="text-[15px] font-bold text-slate-800 mb-4">
          الخطوة 4 — الضريبة (VAT)
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                نسبة الضريبة %
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                المكتب يتحمل (% من الضريبة)
              </label>
              <div className="flex gap-1.5">
                {[0, 50, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setOfficeTaxBearing(val)}
                    className={`flex-1 p-1.5 rounded-lg text-[11px] font-bold border transition-colors ${officeTaxBearing === val ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <div className="flex justify-between text-xs mb-1.5 text-slate-600">
              <span>إجمالي قبل الضريبة:</span>
              <strong className="font-mono">
                {subtotal.toLocaleString()} ر.س
              </strong>
            </div>
            <div className="flex justify-between text-xs mb-1.5 text-slate-600">
              <span>ضريبة ({taxRate}%):</span>
              <strong className="font-mono">
                {taxAmount.toLocaleString()} ر.س
              </strong>
            </div>
            <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 text-sm font-black text-blue-700">
              <span>الإجمالي شامل:</span>
              <span className="font-mono">
                {grandTotal.toLocaleString()} ر.س
              </span>
            </div>
          </div>
        </div>
      </div>
      <LivePreview />
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:w-[62%] p-4 md:p-5 overflow-y-auto custom-scrollbar">
        <div className="text-[15px] font-bold text-slate-800 mb-4">
          الخطوة 5 — الدفعات وطرق الدفع
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-[11px] font-bold text-slate-700 mb-0">
              عدد الدفعات:
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  onClick={() => setPaymentCount(num)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${paymentCount === num ? "bg-blue-500 text-white border-blue-500" : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                  الدفعة
                </th>
                <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                  النسبة %
                </th>
                <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                  المبلغ
                </th>
                <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                  الاستحقاق
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentsList.map((p) => (
                <tr key={p.id} className="border-b border-slate-50">
                  <td className="p-1.5 text-[11px] font-bold text-slate-700">
                    {p.label}
                  </td>
                  <td className="p-1.5 text-[11px] text-slate-600">
                    {p.percentage}%
                  </td>
                  <td className="p-1.5 text-[11px] font-bold text-blue-700 font-mono">
                    {p.amount.toLocaleString(undefined, {
                      maximumFractionDigits: 0,
                    })}{" "}
                    ر.س
                  </td>
                  <td className="p-1.5 text-[10px] text-slate-500">
                    <input
                      type="text"
                      defaultValue={p.condition}
                      className="w-full p-1 bg-transparent border-b border-dashed border-slate-300 outline-none focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
          <label className="block text-[12px] font-bold text-slate-700 mb-2">
            طرق الدفع المقبولة
          </label>
          <div className="flex gap-2 flex-wrap">
            {[
              { id: "bank", label: "تحويل بنكي" },
              { id: "cash", label: "نقدي بالمقر" },
              { id: "sadad", label: "سداد" },
            ].map((method) => (
              <label
                key={method.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border transition-colors ${acceptedMethods.includes(method.id) ? "bg-blue-50 border-blue-300 text-blue-800 font-bold" : "bg-slate-50 border-slate-200 text-slate-600"}`}
              >
                <input
                  type="checkbox"
                  checked={acceptedMethods.includes(method.id)}
                  onChange={() => toggleMethod(method.id)}
                  className="w-3 h-3 text-blue-600 rounded"
                />
                {method.label}
              </label>
            ))}
          </div>
        </div>
      </div>
      <LivePreview />
    </div>
  );

  const renderStep6 = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:w-[62%] p-4 md:p-5 overflow-y-auto custom-scrollbar">
        <div className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-amber-600" /> الخطوة 6 — المرفقات
          والنواقص
        </div>
        <div className="p-4 bg-white rounded-xl border-y border-l border-r-[3px] border-slate-200 border-r-red-600 mb-4 shadow-sm relative overflow-hidden">
          <div className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
            <TriangleAlert className="w-4 h-4" /> نواقص مستندات (Free text)
          </div>
          <textarea
            value={missingDocs}
            onChange={(e) => setMissingDocs(e.target.value)}
            placeholder="اكتب هنا أي ملاحظات حول نواقص المستندات..."
            rows={3}
            className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-y leading-relaxed"
          />
          <label className="flex items-center gap-1.5 text-[11px] cursor-pointer mt-3 font-medium text-slate-700 hover:text-red-600 transition-colors w-fit">
            <input
              type="checkbox"
              checked={showMissingDocs}
              onChange={(e) => setShowMissingDocs(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
            />
            <Eye className="w-3.5 h-3.5 text-red-500" /> إظهار نواقص المستندات
            في عرض السعر المطبوع
          </label>
        </div>
      </div>
      <LivePreview />
    </div>
  );

  const renderStep7 = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:w-[62%] p-4 md:p-5 overflow-y-auto custom-scrollbar">
        <div className="text-[15px] font-bold text-slate-800 mb-4">
          الخطوة 7 — الشروط والأحكام
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm">
          <label className="block text-[11px] font-bold text-slate-700 mb-2">
            اختر حزمة شروط جاهزة (اختياري)
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TERMS.map((term) => (
              <button
                key={term.id}
                onClick={() => setSelectedPresetTerm(term.id)}
                className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-colors ${selectedPresetTerm === term.id ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
              >
                {term.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm">
          <label className="block text-[11px] font-bold text-slate-700 mb-2">
            الشروط والأحكام (تظهر للعميل)
          </label>
          <textarea
            rows={7}
            value={termsText}
            onChange={(e) => setTermsText(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-y leading-[1.7] text-slate-700"
          />
        </div>
        <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 mb-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="w-4 h-4 text-purple-600" />
            <label className="block text-[12px] font-bold text-purple-700 mb-0">
              الافتتاحية الذكية والتفويض
            </label>
          </div>
          <div className="mb-4">
            <div className="text-[11px] font-bold text-slate-700 mb-2">
              لقب العميل المستهدف:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CLIENT_TITLES.map((title) => (
                <button
                  key={title}
                  onClick={() => setClientTitle(title)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer border transition-colors ${clientTitle === title ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-700 mb-2">
              أسلوب التعامل والتفويض:
            </div>
            <div className="flex gap-2">
              {HANDLING_METHODS.map((method) => (
                <button
                  key={method}
                  onClick={() => setHandlingMethod(method)}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer border transition-colors ${handlingMethod === method ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <LivePreview />
    </div>
  );

  const renderStep8 = () => (
    <div className="animate-in fade-in duration-300 h-full flex flex-col lg:flex-row">
      <div className="flex-1 w-full lg:w-[62%] p-4 md:p-5 flex flex-col justify-center items-center text-center">
        <div className="text-[20px] font-black text-slate-800 mb-2">
          الخطوة الأخيرة — المعاينة والتصدير
        </div>
        <div className="text-[13px] text-slate-500 mb-8 max-w-sm">
          قم بمراجعة العرض بشكله النهائي في الجهة اليسرى. إذا كان كل شيء صحيحاً،
          يمكنك حفظه أو إرساله للعميل مباشرة.
        </div>
        <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md">
          <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4 opacity-20" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => handleSave(true)}
              disabled={saveMutation.isPending}
              className="py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-xl text-xs font-bold cursor-pointer flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> حفظ كمسودة
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saveMutation.isPending}
              className="py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 border-none rounded-xl text-xs font-bold cursor-pointer flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}{" "}
              إرسال لاعتماد
            </button>
          </div>
        </div>
      </div>
      <LivePreview />
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans" dir="rtl">
      <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar">
        {/* شريط الخطوات */}
        <div className="flex items-center gap-1 mb-5 overflow-x-auto py-1 custom-scrollbar">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = step.id < currentStep;
            const Icon = isCompleted ? CircleCheckBig : step.icon;
            let btnClass = "bg-slate-100 text-slate-500 hover:bg-slate-200";
            if (isActive) btnClass = "bg-blue-500 text-white shadow-sm";
            if (isCompleted) btnClass = "bg-emerald-100 text-emerald-600";

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-none cursor-pointer text-[10px] font-bold whitespace-nowrap transition-colors ${btnClass}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {!isCompleted && <span>{step.id}</span>}
                  <span>{step.label}</span>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-3 h-[2px] shrink-0 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-slate-200"}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="max-w-5xl mx-auto h-[calc(100vh-200px)] border border-slate-200 rounded-xl overflow-hidden bg-white">
          {currentStep === 0 && renderStep0()}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
          {currentStep === 6 && renderStep6()}
          {currentStep === 7 && renderStep7()}
          {currentStep === 8 && renderStep8()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200 max-w-5xl mx-auto">
          <button
            disabled={currentStep === 0}
            onClick={() => setCurrentStep((p) => p - 1)}
            className="px-5 py-2.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 hover:bg-slate-200 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" /> السابق
          </button>
          <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
            الخطوة {currentStep + 1} من {STEPS.length}
          </div>
          <button
            onClick={() =>
              setCurrentStep((p) => Math.min(STEPS.length - 1, p + 1))
            }
            className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white border-none rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            التالي <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotationWizard;
