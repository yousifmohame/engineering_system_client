import React, { useRef, useState, useEffect } from "react";
import {
  Eye,
  Printer,
  Edit3,
  Check,
  ZoomIn,
  ZoomOut,
  FileText,
  ShieldCheck,
  Loader,
  Scale,
  Building,
  UserCheck,
  FolderOpen,
  DollarSign,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";
import api from "../../../../api/axios";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const SECURITY_BACKGROUNDS = {
  none: { label: "بدون (سادة)", value: "none" },
  official1: {
    label: "خلفية رسمية 1 (الذهبية)",
    value: "url('/safe_background/1.webp')",
  },
  official2: {
    label: "خلفية رسمية 2",
    value: "url('/safe_background/2.webp')",
  },
  official3: {
    label: "خلفية رسمية 3",
    value: "url('/safe_background/3.webp')",
  },
};

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => (
  <span
    className={`inline-flex min-w-0 items-center justify-center ${vertical ? "flex-col gap-0.5" : "gap-1.5"} ${className}`}
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

const previewStyles = {
  classic: {
    label: "كلاسيكي",
    accent: "#123f59",
    gold: "#c5983c",
    paper: "#ffffff",
  },
};

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatArea = (value) =>
  Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toArabicDigits = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

const getDatePart = (formatter, date, type) =>
  formatter.formatToParts(date).find((part) => part.type === type)?.value || "";

const formatDateParts = (value) => {
  const date = value ? new Date(value) : new Date();
  const dayName = new Intl.DateTimeFormat("ar-SA", { weekday: "long" }).format(
    date,
  );
  if (Number.isNaN(date.getTime()))
    return { gregorian: value, hijri: value, combined: value };
  const gregorianFormatter = new Intl.DateTimeFormat("en-US-u-ca-gregory", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const hijriFormatter = new Intl.DateTimeFormat(
    "en-US-u-ca-islamic-umalqura",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  );
  const gregorian = `${getDatePart(gregorianFormatter, date, "year")}/${getDatePart(gregorianFormatter, date, "month")}/${getDatePart(gregorianFormatter, date, "day")}`;

  const hijri = `${getDatePart(hijriFormatter, date, "year")}/${getDatePart(hijriFormatter, date, "month")}/${getDatePart(hijriFormatter, date, "day")}`;
  return {
    gregorian,
    hijri,
    combined: `${dayName}، ميلادي: ${gregorian} / هجري: ${hijri}`,
    dayName,
  };
};

const EditableSpan = ({
  value,
  placeholder = "---",
  isEditMode,
  className = "",
  onChange, // 👈 أضفنا onChange بدلاً من dataObj و dataKey
}) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => {
    if (value !== undefined && value !== null && localValue !== value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleBlur = (e) => {
    const newVal = e.currentTarget.textContent;
    setLocalValue(newVal);
    // 👈 إرسال القيمة الجديدة للمكون الأب لتحديث الـ State الحقيقي
    if (onChange) {
      onChange(newVal);
    }
  };

  return (
    <span
      contentEditable={isEditMode}
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`outline-none transition-colors ${isEditMode ? "bg-amber-50 border-b border-dashed border-amber-400 px-1 min-w-[50px] inline-block cursor-text text-amber-900" : ""} ${className}`}
    >
      {localValue || (isEditMode ? "" : placeholder)}
    </span>
  );
};

export const LivePreview = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.68);
  const [bgType, setBgType] = useState("official1");
  const [selectedFont, setSelectedFont] = useState("Tajawal");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const componentRef = useRef(null);

  const selectedStyle = previewStyles.classic;
  const issueDateParts = formatDateParts(data?.issueDate);

  const {
    referenceNumber = `QT-${Date.now().toString().slice(-5)}`,
    transactionType,
    licenseNumber,
    subject,
    address,
    licenseYear,
    serviceNumber,
    serviceYear,
    clientTitle,
    clientNameForPreview,
    clientCodeForPreview,
    showClientCode,
    showPropertyCode,
    propertyCodeForPreview,
    termsText,
    conclusion,
    validityDays,
    items = [],
    subtotal = 0,
    taxAmount = 0,
    grandTotal = 0,
    officeTaxBearing = 0,
    paymentsList = [],
    showQuantity = false,
    plots = [],
    boundaries = [],
    employeeName = "إدارة المشاريع وعقود العملاء",
    employeeId = "SYS-109",
    taxRate = 15,
    acceptedMethods = [],
    missingDocs = "",
    showMissingDocs = false,
    deedNumber,
    deedDate,
    clientType = "فرد", // 👈 سيأخذ القيمة الافتراضية إذا لم يصل من الباك إند
    signatureMethod = "SELF",
    handlingMethod = "المالك مباشرة",
    repName,
    repIdNumber,
    repPhone,
    repCapacity,
    authDocType,
    authDocNumber,
    authDocDate,
    selectedBankAccounts = [],
    bankAccountsData = [],
    propertyDistrict = "---",
    propertyPlanNumber = "---",
    firstPartyName,
    firstPartyRep,
    secondPartyName,
    secondPartyRep,
    issueDate,
    firstPartyRepCapacity = "إدارة المشاريع وعقود العملاء",
    firstPartyEmpCode,
    showFirstPartyEmpId = true,
    firstPartySignatureType = "MANUAL",
    employeeSignatureUrl,
    transactionRefForPreview,
    meetingTitleForPreview,
    status,
    authDocIssueDate,
    showAuthDocIssueDate,
    authDocExpiryDate,
    showAuthDocExpiryDate,
    customUsufructType,
    documentType,
    timelineState,
    showSummaryTable = true,
  } = data || {};

  const getArabicHandlingMethod = (method) => {
    if (!method) return "المالك مباشرة";
    const map = {
      DIRECT: "المالك مباشرة",
      AGENT: "وكيل بموجب وكالة",
      AUTHORIZED: "مفوض بموجب تفويض",
      BENEFICIARY: "ناظر وقف / مستفيد",
    };
    return map[method] || method;
  };
  const safeHandlingMethod = getArabicHandlingMethod(handlingMethod);

  const getQuotationStatusBadge = () => {
    const currentStatus = status || "DRAFT";

    const isDraft =
      currentStatus === "DRAFT" || currentStatus === "PENDING_APPROVAL";
    const isOfficeApproved =
      currentStatus === "APPROVED" || currentStatus === "SENT";
    const isFullyApproved =
      currentStatus === "ACCEPTED" || currentStatus === "PARTIALLY_PAID";
    const isCancelled =
      currentStatus === "CANCELLED" || currentStatus === "REJECTED";

    let isExpired = false;
    if (
      !isFullyApproved &&
      !isCancelled &&
      issueDate &&
      validityDays !== "unlimited"
    ) {
      const expiryDate = new Date(issueDate);
      expiryDate.setDate(expiryDate.getDate() + parseInt(validityDays));
      expiryDate.setHours(23, 59, 59, 999);
      if (new Date() > expiryDate) {
        isExpired = true;
      }
    }

    if (isExpired)
      return {
        text: "منتهي (انتهت الصلاحية)",
        styles: "bg-slate-100 text-slate-700 border-slate-300",
      };
    if (isCancelled)
      return { text: "ملغي", styles: "bg-red-50 text-red-700 border-red-200" };
    if (isFullyApproved)
      return {
        text: "معتمد من جميع الأطراف",
        styles: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    if (isOfficeApproved)
      return {
        text: "معتمد من مقدم الخدمة فقط",
        styles: "bg-blue-50 text-blue-700 border-blue-200",
      };

    return {
      text: "مسودة غير معتمدة",
      styles: "bg-amber-50 text-amber-700 border-amber-200",
    };
  };

  const statusBadge = getQuotationStatusBadge();

  // --- إزالة دالة getQuotationStatusBadge السابقة ---

  // 🚀 استخراج وتعريف متغيرات الحالة لكي يراها الجدول العلوي
  const currentStatus = status || "DRAFT";
  const isOfficeApproved =
    currentStatus === "APPROVED" || currentStatus === "SENT";
  const isFullyApproved =
    currentStatus === "ACCEPTED" || currentStatus === "PARTIALLY_PAID";
  const isCancelled =
    currentStatus === "CANCELLED" || currentStatus === "REJECTED";

  let isExpired = false;
  if (
    !isFullyApproved &&
    !isCancelled &&
    issueDate &&
    validityDays !== "unlimited"
  ) {
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(expiryDate.getDate() + parseInt(validityDays));
    expiryDate.setHours(23, 59, 59, 999);
    if (new Date() > expiryDate) {
      isExpired = true;
    }
  }

  // ================= إعدادات جدول الاعتماد العلوي =================
  const validityText = isExpired ? "غير ساري" : "ساري";
  const validityColor = isExpired ? "text-rose-600" : "text-emerald-600";

  let firstPartyStatusText = "مسودة";
  let firstPartyStatusColor = "text-slate-500";
  if (status === "REJECTED" || status === "CANCELLED") {
    firstPartyStatusText = "مرفوض / ملغي";
    firstPartyStatusColor = "text-rose-600";
  } else if (isOfficeApproved || isFullyApproved) {
    firstPartyStatusText = `معتمد بتاريخ ${issueDateParts.gregorian}`;
    firstPartyStatusColor = "text-[#123f59]";
  } else {
    firstPartyStatusText = "في انتظار الاعتماد";
    firstPartyStatusColor = "text-amber-600";
  }

  let secondPartyStatusText = "في انتظار الاعتماد";
  let secondPartyStatusColor = "text-amber-600";
  if (isFullyApproved) {
    secondPartyStatusText = "معتمد";
    secondPartyStatusColor = "text-emerald-600";
  } else if (status === "REJECTED" || status === "CANCELLED") {
    secondPartyStatusText = "مرفوض / ملغي";
    secondPartyStatusColor = "text-rose-600";
  }

  // --- نهاية إعدادات الحالة ---

  const calculatedOfficeDiscount = (taxAmount * (officeTaxBearing || 0)) / 100;
  const finalPayable = grandTotal - calculatedOfficeDiscount;

  const paymentMethodsLabels = {
    bank: "تحويل بنكي",
    cash: "نقدي",
    sadad: "رقم سداد",
    pos: "دفع الكترونى POS",
  };

  const introText = (() => {
    let intro = `إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات (${transactionType || "الخدمات الهندسية والاستشارية"})`;
    if (handlingMethod)
      intro += `، بناءً على أسلوب التعامل والتفويض المعتمد (${handlingMethod})`;
    intro +=
      "، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة وفقاً لنطاق العمل والاشتراطات والملاحظات التالية:";
    return intro;
  })();

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () =>
    setZoomScale((prev) => Math.max(prev - 0.1, 0.38));

  const handlePrint = async () => {
    setIsGeneratingPdf(true);
    try {
      const printData = {
        ...data,
        bgType: bgType,
        fontFamily: selectedFont,
      };

      const response = await api.post("/quotations/generate-pdf", printData, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `عرض_سعر_${referenceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("حدث خطأ أثناء معالجة الوثيقة. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const bgStyleConfig = {
    backgroundColor: selectedStyle.paper,
    backgroundImage:
      SECURITY_BACKGROUNDS[bgType].value !== "none"
        ? SECURITY_BACKGROUNDS[bgType].value
        : "none",
    backgroundSize: `${A4_WIDTH_PX}px 1123px`,
    backgroundRepeat: "repeat-y",
    backgroundPosition: "top center",
    fontFamily: selectedFont,
  };

  const clientTypeTranslations = {
    individual: "فرد",
    company: "شركة",
    institution: "مؤسسة",
    government: "جهة حكومية",
    charity: "جهة خيرية / جمعية",
    organization: "منظمة / هيئة",
  };

  // دالة مساعدة لترجمة النوع
  const getArabicClientType = (type) => {
    if (!type) return "فرد";
    const normalizedType = String(type).toLowerCase().trim();
    return (
      clientTypeTranslations[normalizedType] || String(type).replace(/_/g, " ")
    );
  };

  const safeClientType = getArabicClientType(
    clientType ? String(clientType).replace(/_/g, " ") : "العميل",
  );

  // const renderClientRepresentation = () => {
  //   if (signatureMethod === "SELF" || !signatureMethod) return null;

  //   let text = `ويمثل العميل (${safeClientType}) بالتوقيع والاعتماد على هذا العرض السيد/ة: `;
  //   text += repName ? `${repName}` : "........................";
  //   if (repIdNumber) text += `، (هوية رقم: ${repIdNumber})`;
  //   if (repCapacity) text += `، بصفته: ${repCapacity}`;
  //   if (authDocType || authDocNumber) {
  //     text += `، بموجب `;
  //     if (authDocType)
  //       text += `${authDocType === "مستند انتفاع" && customUsufructType ? customUsufructType : authDocType} `;
  //     if (authDocNumber) text += `رقم (${authDocNumber}) `;
  //     if (authDocIssueDate && showAuthDocIssueDate)
  //       text += `بتاريخ ${formatDateParts(authDocIssueDate).gregorian}`;
  //   }
  //   text += ".";
  //   return (
  //     <div className="mt-2 mb-4 flex items-start gap-2 text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
  //       <Scale className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
  //       <p className="leading-relaxed">{text}</p>
  //     </div>
  //   );
  // };

  const totalPlotsArea = plots.reduce(
    (sum, plot) => sum + (Number(plot.area) || 0),
    0,
  );

  let rowSpans = { district: [], plan: [], deed: [], date: [] };
  if (plots && plots.length > 0) {
    let currentIdx = { district: 0, plan: 0, deed: 0, date: 0 };
    rowSpans.district = Array(plots.length).fill(0);
    rowSpans.plan = Array(plots.length).fill(0);
    rowSpans.deed = Array(plots.length).fill(0);
    rowSpans.date = Array(plots.length).fill(0);
    rowSpans.district[0] = 1;
    rowSpans.plan[0] = 1;
    rowSpans.deed[0] = 1;
    rowSpans.date[0] = 1;
    for (let i = 1; i < plots.length; i++) {
      const prevPlot = plots[i - 1];
      const currPlot = plots[i];
      if (
        (currPlot.district || propertyDistrict) ===
        (prevPlot.district || propertyDistrict)
      ) {
        rowSpans.district[currentIdx.district] += 1;
        rowSpans.district[i] = 0;
      } else {
        rowSpans.district[i] = 1;
        currentIdx.district = i;
      }
      if (
        (currPlot.planNumber || propertyPlanNumber) ===
        (prevPlot.planNumber || propertyPlanNumber)
      ) {
        rowSpans.plan[currentIdx.plan] += 1;
        rowSpans.plan[i] = 0;
      } else {
        rowSpans.plan[i] = 1;
        currentIdx.plan = i;
      }
      if (
        (currPlot.deedNumber || deedNumber) ===
        (prevPlot.deedNumber || deedNumber)
      ) {
        rowSpans.deed[currentIdx.deed] += 1;
        rowSpans.deed[i] = 0;
      } else {
        rowSpans.deed[i] = 1;
        currentIdx.deed = i;
      }
      // 👈 نضع deedDate العام كبديل إذا لم يوجد للقطعة تاريخ منفصل
      if ((currPlot.deedDate || deedDate) === (prevPlot.deedDate || deedDate)) {
        rowSpans.date[currentIdx.date] += 1;
        rowSpans.date[i] = 0;
      } else {
        rowSpans.date[i] = 1;
        currentIdx.date = i;
      }
    }
  }

  // ==========================================
  // 🚀 دوال مساعدة للجدول الزمني
  // ==========================================
  const DURATION_UNITS_AR = {
    WORKING_DAY: "يوم عمل",
    CALENDAR_DAY: "يوم تقويمي",
    WEEK: "أسبوع",
    MONTH: "شهر",
  };

  const getTimelineStartText = () => {
    if (!timelineState?.startConditions?.length) return "";
    const conds = timelineState.startConditions;
    let parts = [];
    if (conds.includes("DOCUMENTS_RECEIVED"))
      parts.push("استلام كافة المستندات والبيانات المطلوبة");
    if (conds.includes("ADVANCE_PAYMENT"))
      parts.push("تأكيد استلام الدفعة الأولى أو المستحق المالي");
    if (conds.includes("SPECIFIC_DATE") && timelineState.customStartDate) {
      parts.push(
        `التاريخ المحدد (${new Date(timelineState.customStartDate).toLocaleDateString("ar-SA")})`,
      );
    }

    let text =
      "تبدأ مدة تنفيذ الخدمات من تاريخ " +
      parts.join("، و") +
      (parts.length > 1 ? "، أيهما لاحق." : ".");

    if (conds.includes("TRAFFIC_STUDY")) {
      text +=
        " وفي حال تطلب الأمر دراسة مرورية، تستكمل المدة بعد استلام خطاب الاعتماد من الجهة المختصة.";
    }
    return text;
  };

  const distributedDuration =
    timelineState?.timelineItems?.reduce(
      (sum, item) => sum + (Number(item.duration) || 0),
      0,
    ) || 0;

  const totalDuration = Number(timelineState?.totalDuration) || 0;
  const remainingDuration = Math.max(0, totalDuration - distributedDuration);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-[#e8edf0] shadow-[0_10px_26px_rgba(18,63,89,0.08)]"
      dir="rtl"
    >
      <style>{`@media print { body { counter-reset: page; } .page-number::after { counter-increment: page; content: counter(page); } }`}</style>
      <div className="shrink-0 border-b border-[#e8ddc8] bg-white px-3 py-2 z-10 shadow-sm">
        <div className="mx-auto max-w-[980px] rounded-[18px] border border-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-2 shadow-[0_4px_12px_rgba(18,63,89,0.04)]">
          <div className="flex min-w-0 items-center justify-between gap-2">
            {/* اختيار الخلفية */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#d8b46a]/25 rounded-xl shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c5983c]" />
              <select
                value={bgType}
                onChange={(e) => setBgType(e.target.value)}
                className="bg-transparent text-[10px] font-black text-[#123f59] outline-none cursor-pointer"
              >
                {Object.entries(SECURITY_BACKGROUNDS).map(([key, bg]) => (
                  <option key={key} value={key}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 🌟 اختيار الخط الجديد */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#d8b46a]/25 rounded-xl shadow-sm">
              <FileText className="w-3.5 h-3.5 text-[#c5983c]" />
              <select
                value={selectedFont}
                onChange={(e) => setSelectedFont(e.target.value)}
                className="bg-transparent text-[10px] font-black text-[#123f59] outline-none cursor-pointer"
              >
                <option value="Tajawal">تجوال (Tajawal)</option>
                <option value="Cairo">القاهرة (Cairo)</option>
                <option value="Almarai">المراعي (Almarai)</option>
                <option value="Arial">Arial</option>
              </select>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto custom-scrollbar-slim">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-xl border px-2 text-[9px] font-black transition ${isEditMode ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#d8b46a]/25 bg-white text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"}`}
                type="button"
              >
                <IconWithText
                  icon={isEditMode ? Check : Edit3}
                  text={
                    isEditMode
                      ? "حفظ التعديلات المباشرة"
                      : "تعديل مباشر بالمستند"
                  }
                  iconClassName="h-3.5 w-3.5"
                />
              </button>
              <button
                onClick={handlePrint}
                disabled={isGeneratingPdf}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#123f59] px-3 text-[10px] font-black text-white transition hover:bg-[#0f3448] disabled:opacity-70 disabled:cursor-not-allowed"
                type="button"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5 text-[#e2bf74]" />
                    <span>تصدير مستند (PDF)</span>
                  </>
                )}
              </button>
              <div className="w-px h-5 bg-[#d8b46a]/30 mx-1"></div>
              <button
                onClick={handleZoomOut}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="inline-flex h-8 min-w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#123f59]">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="min-h-0 flex-1 overflow-auto p-6 pb-16 custom-scrollbar-slim flex flex-col items-center relative"
        style={{ backgroundColor: "#e8edf0" }}
      >
        <div
          id="pdf-scale-wrapper"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s",
          }}
        >
          <div
            ref={componentRef}
            className="print-wrapper flex flex-col gap-8 items-center pb-12"
            style={{ width: `${A4_WIDTH_PX}px` }}
          >
            {/* 📄 الغلاف */}
            <div
              className="cover-page relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] print:shadow-none"
              style={{
                width: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                ...bgStyleConfig,
              }}
            >
              {/* 🚀 التعديل هنا: جدول الاعتمادات العلوي المدمج (لصفحة الغلاف) */}
              {showSummaryTable && (
                <div className="absolute bottom-20 left-8 right-8 z-20">
                  <table
                    className="w-full border-collapse bg-white/95 backdrop-blur-sm shadow-sm text-right"
                    style={{ border: `2px solid ${selectedStyle.accent}` }}
                  >
                    <tbody>
                      <tr>
                        {/* العمود الأيمن: الـ QR */}
                        <td
                          className="w-[30%] p-2 text-center align-middle"
                          style={{
                            borderLeft: `2px solid ${selectedStyle.accent}`,
                          }}
                        >
                          <div className="flex flex-col items-center justify-center gap-1">
                            {/* في نافذة الـ Preview للفرونت إند لا يوجد verificationQrImage مولد بشكل حقيقي، لذا نضع أيقونة توضيحية */}
                            <div className="w-14 h-14 border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                              <span className="text-[8px] text-slate-400 font-black">
                                QR
                              </span>
                            </div>
                            <span className="text-[8px] font-black text-[#123f59] leading-tight">
                              شركة ديتيلز كونسولتس
                              <br />
                              للاستشارات الهندسية
                            </span>
                          </div>
                        </td>

                        {/* العمود الأوسط: حالات الاعتماد */}
                        <td
                          className="w-[40%] p-0 align-top"
                          style={{
                            borderLeft: `2px solid ${selectedStyle.accent}`,
                          }}
                        >
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between px-3 py-2 border-b border-slate-300 flex-1 items-center">
                              <span className="text-[11px] font-black text-slate-600">
                                حالة السريان
                              </span>
                              <span
                                className={`text-[11px] font-black ${validityColor}`}
                              >
                                {validityText}
                              </span>
                            </div>
                            <div className="flex justify-between px-3 py-2 border-b border-slate-300 flex-1 items-center">
                              <span className="text-[11px] font-black text-slate-600">
                                اعتماد الطرف الأول
                              </span>
                              <span
                                className={`text-[11px] font-black ${firstPartyStatusColor}`}
                              >
                                {firstPartyStatusText}
                              </span>
                            </div>
                            <div className="flex justify-between px-3 py-2 flex-1 items-center">
                              <span className="text-[11px] font-black text-slate-600">
                                اعتماد الطرف الثاني
                              </span>
                              <span
                                className={`text-[11px] font-black ${secondPartyStatusColor}`}
                              >
                                {secondPartyStatusText}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* العمود الأيسر: بيانات العقار */}
                        <td className="w-[30%] p-0 align-top">
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between px-3 py-2 border-b border-slate-300 flex-1 items-center">
                              <span className="text-[11px] font-black text-slate-600">
                                اسم الحي
                              </span>
                              <span className="text-[11px] font-black text-[#123f59] truncate max-w-[100px]">
                                {propertyDistrict || "---"}
                              </span>
                            </div>
                            <div className="flex justify-between px-3 py-2 border-b border-slate-300 flex-1 items-center">
                              <span className="text-[11px] font-black text-slate-600">
                                مساحة الأرض
                              </span>
                              <span className="text-[11px] font-mono font-black text-[#123f59]">
                                {formatArea(totalPlotsArea)} م²
                              </span>
                            </div>
                            <div className="flex justify-between px-3 py-2 bg-slate-50 flex-1 items-center">
                              <span className="text-[10px] font-black text-slate-600">
                                إجمالي قيمة مع الضريبة
                              </span>
                              <span className="text-[12px] font-mono font-black text-emerald-700">
                                {formatCurrency(finalPayable)}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              <div className="absolute inset-0 flex flex-col justify-between items-center text-center p-[80px]">
                <div className="w-full mt-1 flex flex-col items-center justify-center gap-5 bg-transparent">
                  {/* 🌟 الشعار */}
                  <div className="w-[300px] flex items-center justify-center">
                    <img
                      src="/logo.jpeg"
                      alt="Logo"
                      className="max-h-full max-w-full object-contain mix-blend-multiply drop-shadow-sm"
                    />
                  </div>

                  {/* 🌟 العنوان الرئيسي للمستند (عنوان الكتاب/التقرير) */}
                  {address && (
                    <div className="flex flex-col items-center text-center max-w-3xl px-6 gap-5">
                      {/* خط ذهبي ديكوري علوي */}
                      <div className="w-20 h-1.5 bg-[#d8b46a] rounded-full opacity-80"></div>

                      <h1 className="text-4xl md:text-5xl font-black text-[#123f59] leading-[1.4] tracking-wide">
                        {address}
                      </h1>

                      {/* خط ذهبي ديكوري سفلي */}
                      <div className="w-20 h-1.5 bg-[#d8b46a] rounded-full opacity-80"></div>
                    </div>
                  )}
                </div>
                <div className="w-full flex flex-col items-center">
                  <div
                    className="w-4/5 border-t-[5px] border-b-[5px] py-12 mb-8"
                    style={{ borderColor: selectedStyle.accent }}
                  >
                    <h1
                      className="text-[42px] font-black mb-6 leading-tight"
                      style={{ color: selectedStyle.accent }}
                    >
                      {/* 🌟 الآن سيقرأ الاسم الذي قمنا بتمريره */}
                      {data.documentType}
                    </h1>
                    <h2 className="text-[22px] font-bold text-[#475569]">
                      {data.transactionType ||
                        "خدمات هندسية واستشارية استراتيجية"}
                    </h2>
                  </div>
                </div>
                <div className="w-full text-right bg-transparent p-8 rounded-3xl border border-[#d8b46a]/30 shadow-sm">
                  <p className="text-[16px] text-center font-black text-slate-500 mb-3">
                    مقدم إلى السادة / الطرف الثاني:
                  </p>

                  {/* 🚀 تم تعديل الـ mb-8 لتصبح ديناميكية */}
                  <p
                    className={`text-[28px] font-black text-center leading-tight ${signatureMethod !== "SELF" ? "mb-2" : "mb-8"}`}
                    style={{ color: selectedStyle.accent }}
                  >
                    <EditableSpan value={clientTitle} isEditMode={isEditMode} />{" "}
                    /{" "}
                    <EditableSpan
                      value={secondPartyName || clientNameForPreview}
                      isEditMode={isEditMode}
                      placeholder="اسم العميل"
                    />
                  </p>

                  {/* 🚀 السطر الجديد الخاص بمعلومات التفويض والوكالة */}
                  {signatureMethod !== "SELF" && (
                    <p className="text-[11.5px] text-center font-black text-rose-600 mb-6">
                      {[
                        (
                          authDocType === "مستند انتفاع" && customUsufructType
                            ? customUsufructType
                            : authDocType
                        )
                          ? `معلومات التفويض: ${authDocType === "مستند انتفاع" && customUsufructType ? customUsufructType : authDocType}`
                          : "",
                        authDocNumber ? `رقم المستند: ${authDocNumber}` : "",
                        showAuthDocExpiryDate && authDocExpiryDate
                          ? `تاريخ انتهاء المستند: ${new Date(authDocExpiryDate).toLocaleDateString("en-US")}`
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" | ")}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px] font-bold text-slate-700">
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                      <span className="text-slate-500 text-[12px]">
                        رقم العرض /الرقم المرجعي:
                      </span>
                      <span className="font-mono text-slate-900 text-[12px] font-black">
                        {referenceNumber}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                      <span className="text-slate-500">تاريخ الإصدار:</span>
                      <span className="font-mono text-slate-900">
                        {new Date(issueDate).toLocaleDateString("en-US")}
                      </span>
                    </div>
                    {transactionRefForPreview && (
                      <div
                        className={`flex justify-between border-b border-dashed border-slate-300 pb-1 ${!meetingTitleForPreview ? "col-span-2" : ""}`}
                      >
                        <span className="text-slate-500">
                          {" "}
                          الرقم الداخلي للمعاملة:
                        </span>
                        <span className="font-mono text-slate-900 font-black">
                          {transactionRefForPreview}
                        </span>
                      </div>
                    )}
                    {meetingTitleForPreview && (
                      <div
                        className={`flex justify-between border-b border-dashed border-slate-300 pb-1 ${!transactionRefForPreview ? "col-span-2" : ""}`}
                      >
                        <span className="text-slate-500">
                          استناداً لمحضر اجتماع:
                        </span>
                        <span className="font-mono text-slate-900 font-black truncate max-w-[150px]">
                          {meetingTitleForPreview}
                        </span>
                      </div>
                    )}
                    {propertyCodeForPreview && (
                      <div className="col-span-2 flex justify-between border-b border-dashed border-slate-300 pb-1">
                        <span className="text-slate-500">المشروع/الملكية:</span>
                        <span className="font-mono text-slate-900 font-black">
                          <EditableSpan
                            value={propertyCodeForPreview}
                            isEditMode={isEditMode}
                          />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  <p className="text-[13px] font-black text-slate-400">
                    <EditableSpan
                      value={
                        firstPartyName ||
                        "شركة ديتيلز كونسولتس للاستشارات الهندسية"
                      }
                      isEditMode={isEditMode}
                    />
                  </p>
                </div>
              </div>
            </div>

            {/* 📄 المحتوى */}
            <div
              className="content-page relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] print:shadow-none"
              style={{
                width: `${A4_WIDTH_PX}px`,
                minHeight: `${A4_HEIGHT_PX}px`,
                ...bgStyleConfig,
              }}
            >
              <table className="document-table w-full border-collapse border-none">
                <thead className="table-header-group">
                  <tr>
                    <td style={{ padding: "60px 70px 20px 70px" }}>
                      <div
                        className="flex w-full items-stretch justify-between border-b-[3px] pb-4"
                        style={{ borderColor: selectedStyle.accent }}
                      >
                        {/* المربع الأيمن: الموضوع */}
                        <div
                          className="w-[220px] border flex flex-col justify-center p-3 bg-transparent"
                          style={{ borderColor: `${selectedStyle.accent}44` }}
                        >
                          <div className="text-[#475569] text-[10px] mb-1 font-bold">
                            الموضوع
                          </div>
                          <div className="text-[13px] font-bold text-[#123f59] leading-relaxed break-words">
                            {subject || "—"}
                          </div>
                        </div>

                        {/* المربع الأوسط: الشعار */}
                        <div className="flex flex-1 items-center justify-center px-4 bg-transparent">
                          <img
                            src="/logo.jpeg"
                            alt="Logo"
                            className="h-16 w-auto object-contain mix-blend-multiply"
                          />
                        </div>

                        {/* المربع الأيسر: التاريخ ورقم المرجع */}
                        <div
                          className="w-[240px] border flex flex-col bg-transparent"
                          style={{ borderColor: `${selectedStyle.accent}44` }}
                        >
                          <div
                            className="flex flex-1 border-b"
                            style={{ borderColor: `${selectedStyle.accent}44` }}
                          >
                            <div
                              className="w-[85px] p-2 border-l text-[#475569] text-[10px] font-bold flex items-center bg-transparent"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              التاريخ
                            </div>
                            <div className="flex-1 p-2 text-[9px] font-bold text-[#123f59] flex items-center bg-transparent">
                              {issueDateParts.combined}
                            </div>
                          </div>
                          <div className="flex flex-1 bg-transparent">
                            <div
                              className="w-[85px] p-2 border-l text-[#475569] text-[10px] font-bold flex items-center bg-transparent"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              رقم المرجع
                            </div>
                            <div className="flex-1 p-2 font-mono text-[11px] font-black text-[#123f59] flex items-center bg-transparent">
                              {referenceNumber}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </thead>

                <tbody className="table-row-group">
                  <tr>
                    <td style={{ padding: "0px 70px 20px 70px" }}>
                      <table
                        className="w-full border-collapse text-right text-[10px] font-bold border bg-transparent mb-6 mt-4"
                        style={{ borderColor: `${selectedStyle.accent}44` }}
                      >
                        <tbody>
                          <tr>
                            <td
                              className="p-2 border bg-slate-50 text-[#475569] w-[20%]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              نوع الخدمة
                            </td>
                            <td
                              className="p-2 border font-black w-[30%]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                                color: selectedStyle.accent,
                              }}
                            >
                              <EditableSpan
                                value={transactionType || "عرض سعر خدمات فنية"}
                                isEditMode={isEditMode}
                                placeholder="نوع الخدمة"
                                onChange={(val) =>
                                  onUpdate && onUpdate("transactionType", val)
                                } // 👈 التعديل هنا
                              />
                            </td>
                            <td
                              className="p-2 border bg-slate-50 text-[#475569] w-[20%]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              حالة المستند
                            </td>
                            <td
                              className="p-2 border w-[30%] text-amber-700 font-black animate-pulse"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              مسودة مراجعة داخلية
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="p-2 border bg-slate-50 text-[#475569]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              رقم حساب العميل
                            </td>
                            <td
                              className="p-2 border font-mono text-slate-800"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              <EditableSpan
                                value={clientCodeForPreview}
                                isEditMode={isEditMode}
                                placeholder="لم يتم توليد كود"
                              />
                            </td>
                            <td
                              className="p-2 border bg-slate-50 text-[#475569]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              رمز أرشفة المشروع
                            </td>
                            <td
                              className="p-2 border font-mono text-slate-800"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              <EditableSpan
                                value={propertyCodeForPreview}
                                isEditMode={isEditMode}
                                placeholder="لم يتم توليد كود"
                              />
                            </td>
                          </tr>
                          <tr>
                            <td
                              className="p-2 border bg-slate-50 text-[#475569]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              مدة صلاحية العرض
                            </td>
                            <td
                              className="p-2 border text-slate-800"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              {validityDays === "unlimited"
                                ? "مفتوح / غير محدد"
                                : `${validityDays} يوماً تبدأ بعد اعتماد مقدم الخدمة`}
                            </td>
                            <td
                              className="p-2 border bg-slate-50 text-[#475569]"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              نسخة الوثيقة
                            </td>
                            <td
                              className="p-2 border font-mono text-slate-800"
                              style={{
                                borderColor: `${selectedStyle.accent}44`,
                              }}
                            >
                              v1.0
                            </td>
                          </tr>
                        </tbody>
                      </table>

                      <section className="mb-6 avoid-break bg-transparent">
                        <h4
                          className="mb-4 text-[13px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          <EditableSpan
                            value={clientTitle}
                            isEditMode={isEditMode}
                          />{" "}
                          <EditableSpan
                            value={secondPartyName || clientNameForPreview}
                            isEditMode={isEditMode}
                            placeholder="اسم العميل"
                          />
                        </h4>
                        {/* {renderClientRepresentation()} */}
                        <p
                          className="mb-3 mt-3 text-[12px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          السلام عليكم ورحمة الله وبركاته ،،,
                        </p>
                        <div
                          contentEditable={isEditMode}
                          suppressContentEditableWarning
                          style={{
                            letterSpacing: "0px",
                            lineHeight: "24px",
                            fontSize: "11.5px",
                            whiteSpace: "pre-wrap",
                          }}
                          className={`text-right font-bold text-[#475569] mb-4 ${isEditMode ? "bg-amber-50 p-2 rounded outline-none border border-amber-300" : ""}`}
                        >
                          {introText}
                        </div>
                      </section>

                      <section className="mb-6 avoid-break bg-transparent">
                        <h4
                          className="mb-2 text-[11.5px] font-black flex items-center gap-1.5"
                          style={{ color: selectedStyle.accent }}
                        >
                          <UserCheck className="w-4 h-4 text-[#c5983c]" />{" "}
                          أولاً: بيانات العميل والمالك وصاحب العلاقة الأصلي
                        </h4>
                        <table
                          className="w-full border-collapse text-right text-[10.5px] bg-transparent"
                          style={{
                            border: `1px solid ${selectedStyle.accent}`,
                          }}
                        >
                          <tbody className="font-bold text-[#123f59]">
                            <tr>
                              <td
                                className="p-2 border bg-slate-50 w-1/4"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                تصنيف العميل الكياني
                              </td>
                              <td
                                className="p-2 border w-1/4"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                {/* 🚀 التعديل الهام والآمن */}
                                <EditableSpan
                                  value={
                                    safeClientType
                                      ? String(safeClientType).replace(
                                          /_/g,
                                          " ",
                                        )
                                      : "فرد"
                                  }
                                  isEditMode={isEditMode}
                                  placeholder="أدخل تصنيف العميل"
                                />
                              </td>
                              <td
                                className="p-2 border bg-slate-50 w-1/4"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                اسم المالك المسجل بالتسجيل
                              </td>
                              <td
                                className="p-2 border w-1/4 font-black"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                  color: selectedStyle.accent,
                                }}
                              >
                                <EditableSpan
                                  value={clientNameForPreview}
                                  isEditMode={isEditMode}
                                  placeholder="أدخل اسم المالك"
                                />
                              </td>
                            </tr>
                            <tr>
                              <td
                                className="p-2 border text-[10px] bg-slate-50"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                الصفة الرسمية للتعامل و الاعتماد
                              </td>
                              <td
                                className="p-2 border"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                <EditableSpan
                                  value={safeHandlingMethod} // 👈 استخدام القيمة المترجمة بدلاً من handlingMethod مباشرة
                                  isEditMode={isEditMode}
                                  placeholder="المالك مباشرة"
                                  onChange={(val) =>
                                    onUpdate && onUpdate("handlingMethod", val)
                                  } // 👈 التعديل هنا
                                />
                              </td>
                              <td
                                className="p-2 border bg-slate-50"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                رقم الجوال للاتصال
                              </td>
                              <td
                                className="p-2 border font-mono text-blue-700"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                <EditableSpan
                                  value={repPhone}
                                  isEditMode={isEditMode}
                                  placeholder="أدخل رقم الهاتف"
                                />
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </section>

                      {signatureMethod !== "SELF" && (
                        <div className="avoid-break mb-6">
                          <div className="section-title text-[#123f59] font-black text-[11.5px] mb-2 border-b-2 border-[#123f59] pb-1 inline-block">
                            ثانياً: بيانات التمثيل النظامي والمفوض بالتوقيع
                            الشرعي
                          </div>
                          <table
                            className="w-full border-collapse text-right text-[10.5px] border border-[#123f59]"
                            style={{ borderColor: selectedStyle.accent }}
                          >
                            <tbody className="font-bold text-[#123f59]">
                              <tr>
                                <td
                                  className="p-2 border bg-slate-50 w-1/4"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  اسم المفوض / الممثل
                                </td>
                                <td
                                  className="p-2 border w-1/4 font-black"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  <EditableSpan
                                    value={repName}
                                    placeholder="اسم الممثل"
                                    isEditMode={isEditMode}
                                  />
                                </td>
                                <td
                                  className="p-2 border bg-slate-50 w-1/4"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  رقم السجل المدني / الهوية
                                </td>
                                <td
                                  className="p-2 border w-1/4 font-mono font-black"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  <EditableSpan
                                    value={repIdNumber}
                                    placeholder="رقم الهوية"
                                    isEditMode={isEditMode}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="p-2 border bg-slate-50"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  الصفة القانونية للتمثيل
                                </td>
                                <td
                                  className="p-2 border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {signatureMethod === "AGENT" && "وكيل شرعي"}
                                  {signatureMethod === "AUTHORIZED" &&
                                    "مفوض نظامي"}
                                  {signatureMethod === "BENEFICIARY" &&
                                    "مستفيد"}
                                </td>
                                <td
                                  className="p-2 border bg-slate-50"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  رقم جوال الممثل
                                </td>
                                <td
                                  className="p-2 border font-mono text-blue-700"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  <EditableSpan
                                    value={repPhone}
                                    placeholder="رقم الجوال"
                                    isEditMode={isEditMode}
                                  />
                                </td>
                              </tr>
                              <tr>
                                <td
                                  className="p-2 border bg-slate-50"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  نوع مستند التفويض والصفة
                                </td>
                                <td
                                  className="p-2 border font-black text-slate-700"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {authDocType === "مستند انتفاع" &&
                                  customUsufructType
                                    ? customUsufructType
                                    : authDocType || "---"}
                                </td>
                                <td
                                  className="p-2 border bg-slate-50"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  بيانات المستند المعتمد
                                </td>
                                <td
                                  className="p-2 border font-mono font-bold text-cyan-800"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <span>
                                      {authDocNumber
                                        ? `رقم: ${authDocNumber}`
                                        : "رقم: ---"}
                                    </span>
                                    {showAuthDocIssueDate &&
                                      authDocIssueDate && (
                                        <span className="text-[9px] text-slate-500">
                                          إصدار:{" "}
                                          {new Date(
                                            authDocIssueDate,
                                          ).toLocaleDateString("ar-SA")}
                                        </span>
                                      )}
                                    {showAuthDocExpiryDate &&
                                      authDocExpiryDate && (
                                        <span className="text-[9px] text-rose-500">
                                          انتهاء:{" "}
                                          {new Date(
                                            authDocExpiryDate,
                                          ).toLocaleDateString("ar-SA")}
                                        </span>
                                      )}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      <section className="mb-6 avoid-break bg-transparent">
                        <div className="flex justify-between items-end mb-2">
                          <h4
                            className="text-[11.5px] font-black flex items-center gap-1.5"
                            style={{ color: selectedStyle.accent }}
                          >
                            <Building className="w-4 h-4 text-[#c5983c]" />{" "}
                            {signatureMethod !== "SELF" ? "ثالثاً" : "ثانياً"}:
                            بيانات المشروع والملكية العقارية
                          </h4>
                          {plots && plots.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-1 border border-slate-200 rounded-lg shadow-sm">
                              عدد القطع: {plots.length} | إجمالي المساحة:{" "}
                              {formatArea(totalPlotsArea)} م² | رمز الملف:{" "}
                              {propertyCodeForPreview || "---"}
                            </span>
                          )}
                        </div>

                        {plots && plots.length > 0 ? (
                          <table
                            className="w-full border-collapse text-center text-[10.5px] bg-transparent"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            <thead>
                              <tr
                                className="font-black text-white"
                                style={{
                                  backgroundColor: selectedStyle.accent,
                                }}
                              >
                                <th
                                  className="p-2 border w-10"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  م
                                </th>
                                <th
                                  className="p-2 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  رقم القطعة
                                </th>
                                <th
                                  className="p-2 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  الحي
                                </th>
                                <th
                                  className="p-2 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  رقم المخطط التنظيمي
                                </th>
                                <th
                                  className="p-2 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  رقم وثيقة الملكية
                                </th>
                                <th
                                  className="p-2 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  تاريخ الوثيقة
                                </th>
                                <th
                                  className="p-2 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  مساحة القطعة
                                </th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#123f59]">
                              {plots.map((plot, index) => (
                                <tr key={plot.id}>
                                  <td
                                    className="p-2 border bg-slate-50/50"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    <EditableSpan
                                      value={plot.plotNumber}
                                      isEditMode={isEditMode}
                                      placeholder="---"
                                    />
                                  </td>
                                  {rowSpans.district[index] > 0 && (
                                    <td
                                      rowSpan={rowSpans.district[index]}
                                      className="p-2 border"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      <EditableSpan
                                        value={
                                          plot.district || propertyDistrict
                                        }
                                        isEditMode={isEditMode}
                                        placeholder="---"
                                      />
                                    </td>
                                  )}
                                  {rowSpans.plan[index] > 0 && (
                                    <td
                                      rowSpan={rowSpans.plan[index]}
                                      className="p-2 border font-mono text-slate-700"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      <EditableSpan
                                        value={
                                          plot.planNumber || propertyPlanNumber
                                        }
                                        isEditMode={isEditMode}
                                        placeholder="---"
                                      />
                                    </td>
                                  )}
                                  {rowSpans.deed[index] > 0 && (
                                    <td
                                      rowSpan={rowSpans.deed[index]}
                                      className="p-2 border font-mono text-emerald-800 font-black"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      <EditableSpan
                                        value={plot.deedNumber || deedNumber}
                                        isEditMode={isEditMode}
                                        placeholder="---"
                                      />
                                    </td>
                                  )}
                                  {rowSpans.date[index] > 0 && (
                                    <td
                                      rowSpan={rowSpans.date[index]}
                                      className="p-2 border font-mono text-slate-600"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      {/* 👈 نأخذ تاريخ القطعة، وإن لم يوجد نأخذ تاريخ الملكية الرئيسي */}
                                      {plot.deedDate || deedDate
                                        ? formatDateParts(
                                            plot.deedDate || deedDate,
                                          ).gregorian
                                        : "---"}
                                    </td>
                                  )}
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    <EditableSpan
                                      value={formatArea(plot.area)}
                                      isEditMode={isEditMode}
                                      placeholder="---"
                                    />{" "}
                                    م²
                                  </td>
                                </tr>
                              ))}
                              <tr className="bg-slate-50">
                                <td
                                  colSpan="6"
                                  className="p-2 border text-left font-black"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  إجمالي مساحة الموقع:
                                </td>
                                <td
                                  className="p-2 border font-mono font-black text-[12px] text-emerald-800"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {formatArea(totalPlotsArea)} م²
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        ) : (
                          <div className="p-4 border border-dashed border-slate-300 rounded-xl text-center text-slate-400 text-xs font-bold">
                            لا توجد قطع مضافة في ملف الملكية المرفق
                          </div>
                        )}

                        {(licenseNumber || serviceNumber) && (
                          <table
                            className="w-full border-collapse text-right text-[10.5px] bg-transparent mt-3"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            <tbody className="font-bold text-[#123f59]">
                              <tr>
                                {licenseNumber && (
                                  <>
                                    <td
                                      className="p-2 border bg-slate-50"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        width: "25%",
                                      }}
                                    >
                                      رقم وتاريخ رخصة البناء
                                    </td>
                                    <td
                                      className="p-2 border font-mono"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        width:
                                          licenseNumber && serviceNumber
                                            ? "25%"
                                            : "75%",
                                      }}
                                    >
                                      <EditableSpan
                                        value={`${licenseNumber} لعام ${licenseYear}هـ`}
                                        isEditMode={isEditMode}
                                        placeholder="رقم الرخصة"
                                      />
                                    </td>
                                  </>
                                )}
                                {serviceNumber && (
                                  <>
                                    <td
                                      className="p-2 border bg-slate-50"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        width: "25%",
                                      }}
                                    >
                                      رقم وتاريخ المعاملة / الطلب
                                    </td>
                                    <td
                                      className="p-2 border font-mono"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                        width:
                                          licenseNumber && serviceNumber
                                            ? "25%"
                                            : "75%",
                                      }}
                                    >
                                      <EditableSpan
                                        value={`${serviceNumber} لعام ${serviceYear}هـ`}
                                        isEditMode={isEditMode}
                                        placeholder="رقم المعاملة"
                                      />
                                    </td>
                                  </>
                                )}
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </section>

                      <section className="mb-6 bg-transparent">
                        <h4
                          className="mb-2 text-[11.5px] font-black flex items-center gap-1.5"
                          style={{ color: selectedStyle.accent }}
                        >
                          <FileText className="w-4 h-4 text-[#c5983c]" />{" "}
                          {signatureMethod !== "SELF" ? "رابعاً" : "ثالثاً"}:
                          نطاق الأعمال و التكلفة
                        </h4>
                        <table
                          className="w-full border-collapse text-center text-[10.5px] bg-transparent"
                          style={{
                            border: `1px solid ${selectedStyle.accent}`,
                            tableLayout: "fixed",
                          }}
                        >
                          <thead>
                            <tr
                              className="font-black text-white avoid-break"
                              style={{ backgroundColor: selectedStyle.accent }}
                            >
                              <th
                                className="p-2.5 border"
                                style={{
                                  borderColor: selectedStyle.accent,
                                  width: "5%",
                                }}
                              >
                                م
                              </th>
                              <th
                                className="p-2.5 text-right border"
                                style={{
                                  borderColor: selectedStyle.accent,
                                  width: showQuantity ? "80%" : "95%",
                                }}
                              >
                                وصف الخدمة
                              </th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#123f59]">
                            {items.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={showQuantity ? "3" : "2"}
                                  className="p-6 text-center text-[#94a3b8]"
                                >
                                  لا توجد بنود فنية مسجلة حتى الآن
                                </td>
                              </tr>
                            ) : (
                              items.map((item, index) => (
                                <tr
                                  key={item.id || index}
                                  className="avoid-break"
                                >
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {index + 1}
                                  </td>
                                  <td
                                    className="p-2 text-right border leading-relaxed break-words whitespace-pre-wrap"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {item.title}
                                  </td>
                                  {showQuantity && (
                                    <td
                                      className="p-2 border font-mono"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                      }}
                                    >
                                      {item.qty || item.quantity || 1}{" "}
                                      {item.unit}
                                    </td>
                                  )}
                                </tr>
                              ))
                            )}
                            <tr className="avoid-break bg-slate-50/50">
                              <td
                                colSpan={showQuantity ? "3" : "2"}
                                className="p-0 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                <div className="flex justify-between items-center w-full px-4 py-2.5">
                                  <span className="font-black">
                                    المجموع الفرعي
                                  </span>
                                  <span className="font-mono font-black text-[12px] text-slate-800">
                                    {formatCurrency(subtotal)} ر.س
                                  </span>
                                </div>
                              </td>
                            </tr>
                            <tr className="avoid-break bg-transparent">
                              <td
                                colSpan={showQuantity ? "3" : "2"}
                                className="p-0 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                <div className="flex justify-between items-center w-full px-4 py-2.5">
                                  <span className="font-bold text-[#64748b]">
                                    ضريبة القيمة المضافة {taxRate || 0}%{" "}
                                    {officeTaxBearing > 0
                                      ? ` (يتحمل المكتب ${officeTaxBearing}%)`
                                      : ""}
                                  </span>
                                  <span className="font-mono font-bold text-[12px] text-slate-700">
                                    {formatCurrency(taxAmount)} ر.س
                                  </span>
                                </div>
                              </td>
                            </tr>
                            {officeTaxBearing > 0 && (
                              <tr className="avoid-break bg-transparent text-emerald-700">
                                <td
                                  colSpan={showQuantity ? "3" : "2"}
                                  className="p-0 border"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  <div className="flex justify-between items-center w-full px-4 py-2">
                                    <span className="font-bold">
                                      خصم إعفاء ضريبي ضِمني (المكتب يتحمل نسبة{" "}
                                      {officeTaxBearing}%)
                                    </span>
                                    <span className="font-mono font-black text-[12px]">
                                      -{" "}
                                      {formatCurrency(calculatedOfficeDiscount)}{" "}
                                      ر.س
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                            <tr
                              className="font-black text-white avoid-break"
                              style={{ backgroundColor: selectedStyle.accent }}
                            >
                              <td
                                colSpan={showQuantity ? "3" : "2"}
                                className="p-0 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                <div className="flex justify-between items-center w-full px-4 py-3">
                                  <span className="text-[12.5px]">
                                    الإجمالي النهائي المستحق الصافي للدفع
                                  </span>
                                  <span className="font-mono text-[13.5px]">
                                    {formatCurrency(finalPayable)} ر.س
                                  </span>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </section>

                      {/* 🚀 قسم الجدول الزمني 🚀 */}
                      {timelineState && timelineState.showTimeline && (
                        <section className="mb-6 avoid-break bg-transparent">
                          <h4
                            className="mb-3 text-[11.5px] font-black flex items-center gap-1.5"
                            style={{ color: selectedStyle.accent }}
                          >
                            <Calendar className="w-4 h-4 text-[#c5983c]" />{" "}
                            {signatureMethod !== "SELF" ? "خامساً" : "رابعاً"}:
                            الجدول الزمني لتنفيذ الخدمات
                          </h4>

                          {/* نص شروط البداية */}
                          <div className="mb-3 text-[10.5px] font-bold text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                            {getTimelineStartText()}
                          </div>

                          <table
                            className="w-full border-collapse text-center text-[10.5px] bg-transparent"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            <thead>
                              <tr
                                className="font-black text-white"
                                style={{
                                  backgroundColor: selectedStyle.accent,
                                }}
                              >
                                <th
                                  className="p-2 border w-[8%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  م
                                </th>
                                <th
                                  className="p-2 border w-[45%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  الخدمة / المرحلة
                                </th>
                                <th
                                  className="p-2 border w-[22%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  المدة
                                </th>
                                <th
                                  className="p-2 border w-[25%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  ملاحظات
                                </th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#123f59]">
                              {timelineState.timelineItems?.map(
                                (tItem, index) => {
                                  const relatedItem = items.find(
                                    (i) =>
                                      String(i.id) === String(tItem.itemId),
                                  );
                                  return (
                                    <tr
                                      key={tItem.id}
                                      className="border-b border-slate-100"
                                    >
                                      <td
                                        className="p-2 border bg-slate-50/50 font-mono"
                                        style={{
                                          borderColor: `${selectedStyle.accent}44`,
                                        }}
                                      >
                                        {index + 1}
                                      </td>
                                      <td
                                        className="p-2 border text-right leading-relaxed"
                                        style={{
                                          borderColor: `${selectedStyle.accent}44`,
                                        }}
                                      >
                                        {relatedItem
                                          ? relatedItem.title
                                          : "خدمة غير محددة"}
                                      </td>
                                      <td
                                        className="p-2 border font-mono"
                                        style={{
                                          borderColor: `${selectedStyle.accent}44`,
                                        }}
                                      >
                                        {tItem.duration}{" "}
                                        {
                                          DURATION_UNITS_AR[
                                            tItem.unit ||
                                              timelineState.durationUnit
                                          ]
                                        }
                                      </td>
                                      <td
                                        className="p-2 border text-[9.5px] text-slate-500"
                                        style={{
                                          borderColor: `${selectedStyle.accent}44`,
                                        }}
                                      >
                                        {tItem.notes || "---"}
                                      </td>
                                    </tr>
                                  );
                                },
                              )}

                              {/* صف بقية الخدمات */}
                              {remainingDuration > 0 &&
                                timelineState.timelineItems?.length > 0 && (
                                  <tr className="bg-slate-50 border-b border-slate-100">
                                    <td
                                      className="p-2 border font-mono text-slate-400"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                      }}
                                    >
                                      *
                                    </td>
                                    <td
                                      className="p-2 border text-right text-slate-700"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                      }}
                                    >
                                      بقية خدمات نطاق العمل
                                    </td>
                                    <td
                                      className="p-2 border font-mono text-slate-700"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                      }}
                                    >
                                      {remainingDuration}{" "}
                                      {
                                        DURATION_UNITS_AR[
                                          timelineState.durationUnit
                                        ]
                                      }
                                    </td>
                                    <td
                                      className="p-2 border text-[9.5px] text-slate-500"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                      }}
                                    >
                                      حسب التتابع الزمني
                                    </td>
                                  </tr>
                                )}

                              {/* الإجمالي */}
                              <tr className="bg-slate-100/80">
                                <td
                                  colSpan="2"
                                  className="p-2 border text-left font-black text-slate-800"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  إجمالي مدة تنفيذ الخدمات:
                                </td>
                                <td
                                  colSpan="2"
                                  className="p-2 border font-black font-mono text-[#123f59]"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {totalDuration}{" "}
                                  {
                                    DURATION_UNITS_AR[
                                      timelineState.durationUnit
                                    ]
                                  }
                                  {timelineState.showEndDate &&
                                    timelineState.startConditions.includes(
                                      "SPECIFIC_DATE",
                                    ) &&
                                    timelineState.customStartDate && (
                                      <span className="block text-[9px] text-emerald-700 mt-1 font-sans">
                                        (ينتهي تقريباً في:{" "}
                                        {new Date(
                                          new Date(
                                            timelineState.customStartDate,
                                          ).getTime() +
                                            totalDuration * 24 * 60 * 60 * 1000,
                                        ).toLocaleDateString("ar-SA")}
                                        )
                                      </span>
                                    )}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {/* الملاحظة التقديرية */}
                          {timelineState.showTimelineNotes &&
                            timelineState.timelineNotes && (
                              <div className="mt-2 text-[10px] font-bold text-slate-500 leading-relaxed text-justify">
                                * {timelineState.timelineNotes}
                              </div>
                            )}
                        </section>
                      )}

                      {(paymentsList.length > 0 ||
                        acceptedMethods.length > 0) && (
                        <section className="mb-6 avoid-break bg-transparent">
                          <h4
                            className="mb-2 text-[11.5px] font-black flex items-center gap-1.5"
                            style={{ color: selectedStyle.accent }}
                          >
                            <DollarSign className="w-4 h-4 text-[#c5983c]" />{" "}
                            {signatureMethod !== "SELF" ? "سادساً" : "خامساً"}:
                            الجدول الزمني للدفعات المالية
                          </h4>
                          <table
                            className="w-full border-collapse text-center text-[10.5px] bg-transparent"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            <thead>
                              <tr
                                className="font-black text-white"
                                style={{
                                  backgroundColor: selectedStyle.accent,
                                }}
                              >
                                <th
                                  className="p-2.5 border w-[20%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  الدفعة
                                </th>
                                <th
                                  className="p-2.5 border w-[15%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  النسبة (%)
                                </th>
                                <th
                                  className="p-2.5 border w-[25%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  المبلغ (شامل الضريبة)
                                </th>
                                <th
                                  className="p-2.5 border w-[40%]"
                                  style={{ borderColor: selectedStyle.accent }}
                                >
                                  الاستحقاق
                                </th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#123f59]">
                              {paymentsList.map((payment, index) => (
                                <tr key={payment.id || index}>
                                  <td
                                    className="p-2 border text-center bg-slate-50/50"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {payment.label || `الدفعة ${index + 1}`}
                                  </td>
                                  <td
                                    className="p-2 border text-center font-mono text-slate-700"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {payment.percentage ||
                                      Math.round(100 / paymentsList.length)}
                                    %
                                  </td>
                                  <td
                                    className="p-2 font-mono text-center border text-emerald-800 font-black bg-emerald-50/20"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {formatCurrency(payment.amount)} ر.س
                                  </td>
                                  <td
                                    className="p-2 border text-right pr-3 text-[#556575] leading-relaxed"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {payment.condition ||
                                      "حسب الاتفاق وجداول إنجاز الأعمال الفنية"}
                                  </td>
                                </tr>
                              ))}
                              {acceptedMethods &&
                                acceptedMethods.length > 0 && (
                                  <tr className="bg-slate-50">
                                    <td
                                      colSpan="4"
                                      className="p-3 text-right text-[10.5px] text-[#475569] border"
                                      style={{
                                        borderColor: `${selectedStyle.accent}44`,
                                      }}
                                    >
                                      <div className="flex flex-col gap-3">
                                        <div>
                                          <span className="font-black ml-2 text-slate-800">
                                            طرق السداد المتاحة:
                                          </span>
                                          {acceptedMethods
                                            .map(
                                              (m) =>
                                                paymentMethodsLabels[m] || m,
                                            )
                                            .join(" ، ")}
                                        </div>
                                        {acceptedMethods.includes("bank") &&
                                          selectedBankAccounts.length > 0 && (
                                            <div className="mt-1 border-t border-[#d8b46a]/20 pt-3">
                                              <span className="font-black text-[#123f59] mb-2 text-[11px] block text-right">
                                                البيانات البنكية المعتمدة
                                                للسداد:
                                              </span>
                                              <table className="w-full border-collapse bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm text-center">
                                                <thead className="bg-slate-100/80">
                                                  <tr>
                                                    <th className="p-2 border border-slate-200 text-[9px] font-black text-slate-600">
                                                      البنك
                                                    </th>
                                                    <th className="p-2 border border-slate-200 text-[9px] font-black text-slate-600">
                                                      اسم المستفيد
                                                    </th>
                                                    <th className="p-2 border border-slate-200 text-[9px] font-black text-slate-600">
                                                      رقم الحساب
                                                    </th>
                                                    <th className="p-2 border border-slate-200 text-[9px] font-black text-slate-600">
                                                      الآيبان / IBAN
                                                    </th>
                                                    <th className="p-2 border border-slate-200 text-[8px] font-black text-slate-600 w-[15%]">
                                                      QR للنسخ والمشاركة
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {selectedBankAccounts.map(
                                                    (bankId) => {
                                                      const bank =
                                                        bankAccountsData.find(
                                                          (b) =>
                                                            b.id === bankId,
                                                        );
                                                      if (!bank) return null;
                                                      const formatIBAN = (
                                                        iban,
                                                      ) => {
                                                        if (!iban) return "---";
                                                        return iban
                                                          .replace(/\s+/g, "")
                                                          .replace(
                                                            /(.{4})/g,
                                                            "$1 ",
                                                          )
                                                          .trim();
                                                      };
                                                      return (
                                                        <tr
                                                          key={bank.id}
                                                          className="hover:bg-slate-50/50 transition-colors"
                                                        >
                                                          <td className="p-2 border border-slate-200 align-middle text-center">
                                                            <div className="flex flex-col items-center justify-center gap-1.5">
                                                              {bank.logo ? (
                                                                <img
                                                                  src={
                                                                    bank.logo
                                                                  }
                                                                  alt="logo"
                                                                  className="w-6 h-6 object-contain shrink-0"
                                                                />
                                                              ) : (
                                                                <Building className="w-5 h-5 text-slate-400 shrink-0" />
                                                              )}
                                                              <span className="font-black text-[#123f59] text-[10.5px]">
                                                                {bank.name}
                                                              </span>
                                                            </div>
                                                          </td>
                                                          <td className="p-2 border border-slate-200 align-middle text-center text-[10.5px] text-slate-600 leading-relaxed">
                                                            <div className="font-bold text-slate-800">
                                                              {bank.accountNameAr ||
                                                                bank.accountName ||
                                                                "---"}
                                                            </div>
                                                            <div
                                                              dir="ltr"
                                                              className="mt-0.5"
                                                            >
                                                              {bank.accountNameEn ||
                                                                "---"}
                                                            </div>
                                                          </td>
                                                          <td className="p-2 border border-slate-200 align-middle text-center">
                                                            <div
                                                              className="font-mono font-bold text-slate-800 text-[10.5px] tracking-widest"
                                                              dir="ltr"
                                                            >
                                                              {bank.accountNumber ||
                                                                "---"}
                                                            </div>
                                                          </td>
                                                          <td className="p-2 border border-slate-200 align-middle text-center">
                                                            <div
                                                              className="font-mono font-black text-indigo-800 text-[10.5px] tracking-wider"
                                                              dir="ltr"
                                                            >
                                                              {formatIBAN(
                                                                bank.iban,
                                                              )}
                                                            </div>
                                                          </td>
                                                          <td className="p-0 border border-slate-200 align-middle text-center">
                                                            <div className="flex items-center justify-center">
                                                              <img
                                                                src={
                                                                  bank.qrCodeData
                                                                }
                                                                alt="QR"
                                                                className="w-full h-full object-contain mb-1 border border-slate-100 p-0.5 rounded shadow-sm bg-white"
                                                              />
                                                            </div>
                                                          </td>
                                                        </tr>
                                                      );
                                                    },
                                                  )}
                                                </tbody>
                                              </table>
                                            </div>
                                          )}
                                      </div>
                                    </td>
                                  </tr>
                                )}
                            </tbody>
                          </table>
                        </section>
                      )}

                      {showMissingDocs &&
                        missingDocs &&
                        missingDocs.trim() !== "" && (
                          <section className="mb-6 avoid-break bg-transparent">
                            <h4
                              className="mb-3 text-[11.5px] font-black flex items-center gap-1.5"
                              style={{ color: selectedStyle.accent }}
                            >
                              <FolderOpen className="w-4 h-4 text-[#c5983c]" />{" "}
                              {signatureMethod !== "SELF" ? "سابعاً" : "سادساً"}
                              : المستندات والمسوغات المطلوب توفيرها من طرفكم
                              لبدء العمل
                            </h4>
                            <div
                              className="w-full rounded-[14px] overflow-hidden bg-transparent border border-slate-200 shadow-sm"
                              style={{
                                border: `1px solid ${selectedStyle.accent}33`,
                              }}
                            >
                              <div
                                className="px-4 py-2.5 flex items-center gap-2"
                                style={{
                                  backgroundColor: `${selectedStyle.accent}0A`,
                                  borderBottom: `1px solid ${selectedStyle.accent}22`,
                                }}
                              >
                                <AlertTriangle className="w-4 h-4 text-amber-600" />
                                <span
                                  className="text-[10px] font-black"
                                  style={{ color: selectedStyle.accent }}
                                >
                                  نأمل منكم التكرم بتجهيز المستندات التالية
                                  وتسليمها إلي الطرف الأول ليتسنى لنا البدء في
                                  تنفيذ الأعمال:
                                </span>
                              </div>
                              <div className="p-4">
                                {/* 🌟 التعديل هنا: تحويل الشبكة إلى قائمة رأسية مرقمة متناسقة */}
                                <div className="flex flex-col gap-2">
                                  {missingDocs
                                    .split("\n")
                                    .filter((doc) => doc.trim() !== "")
                                    .map((doc, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-start gap-2.5 p-2 rounded-lg bg-transparent border border-slate-100/50"
                                      >
                                        {/* الرقم التسلسلي */}
                                        <span
                                          className="shrink-0 flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold text-white shadow-sm mt-0.5"
                                          style={{
                                            backgroundColor:
                                              selectedStyle.accent || "#123f59",
                                          }}
                                        >
                                          {idx + 1}
                                        </span>

                                        {/* نص المستند */}
                                        <span className="text-[11px] font-bold text-slate-700 leading-snug">
                                          {doc.replace(/^- /, "").trim()}
                                        </span>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </div>
                          </section>
                        )}

                      <section className="mb-8 avoid-break bg-transparent">
                        <h4
                          className="mb-2 text-[11.5px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          {signatureMethod !== "SELF" ? "ثامناً" : "سابعاً"}:
                          الشروط والأحكام والالتزامات العامة
                        </h4>
                        <div
                          contentEditable={isEditMode}
                          suppressContentEditableWarning
                          style={{
                            letterSpacing: "0px",
                            lineHeight: "24px",
                            fontSize: "11px",
                            whiteSpace: "pre-wrap",
                          }}
                          className={`text-right font-bold text-[#475569] bg-slate-50/30 p-2 rounded border border-slate-100 ${isEditMode ? "bg-amber-50 border-amber-300" : ""}`}
                        >
                          {termsText || "خاضع للشروط العامة المسجلة بالمكتب."}
                        </div>
                      </section>

                      {conclusion && (
                        <section className="mb-8 avoid-break bg-transparent">
                          <div
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            style={{
                              letterSpacing: "0px",
                              lineHeight: "26px",
                              fontSize: "12px",
                              whiteSpace: "pre-wrap",
                            }}
                            className={`text-center font-bold text-[#475569] px-8 ${isEditMode ? "bg-amber-50 p-2 rounded outline-none border border-amber-300" : ""}`}
                          >
                            {conclusion}
                          </div>
                        </section>
                      )}

                      <section className="mt-8 pt-4 avoid-break bg-transparent">
                        <h4
                          className="mb-4 text-[12.5px] font-black text-center"
                          style={{ color: selectedStyle.accent }}
                        >
                          صيغة الاعتماد والموافقة النهائية والتواقيع الرسمية
                        </h4>
                        <table
                          className="w-full border-collapse text-right text-[10px] bg-transparent table-fixed"
                          style={{
                            border: `2px solid ${selectedStyle.accent}`,
                          }}
                        >
                          <thead>
                            <tr
                              className="font-black text-white text-center text-[11.5px]"
                              style={{ backgroundColor: selectedStyle.accent }}
                            >
                              <th
                                className="p-2.5 border-l w-1/2"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                الطرف الثاني: اعتماد المالك أو المستفيد أو من
                                يمثله
                              </th>
                              <th className="p-2.5 w-1/2">
                                الطرف الأول: اعتماد مقدم الخدمة
                              </th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#123f59]">
                            <tr>
                              <td
                                className="p-3 border-l align-top leading-relaxed"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                <div className="flex flex-col gap-3">
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      اسم الجهة / العميل:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      {/* 🚀 قابل للتعديل */}
                                      <EditableSpan
                                        value={clientNameForPreview}
                                        dataObj={data}
                                        dataKey="clientNameForPreview"
                                        isEditMode={isEditMode}
                                        placeholder="اسم العميل"
                                      />
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      يمثلها في التوقيع:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      {/* 🚀 قابل للتعديل */}
                                      <EditableSpan
                                        value={
                                          signatureMethod === "SELF"
                                            ? "المالك الفعلي ذو العلاقة"
                                            : repName
                                        }
                                        dataObj={data}
                                        dataKey="repName"
                                        placeholder="............................"
                                        isEditMode={isEditMode}
                                      />
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      الصفة والتمثيل الكياني:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      {signatureMethod === "SELF"
                                        ? "عن نفسه (المالك الأصلي)"
                                        : signatureMethod === "AGENT"
                                          ? "وكيل شرعي"
                                          : signatureMethod === "AUTHORIZED"
                                            ? "مفوض نظامي"
                                            : "مستفيد"}
                                    </span>
                                  </div>
                                  {signatureMethod !== "SELF" && (
                                    <>
                                      <div>
                                        <span className="text-slate-500 font-bold">
                                          رقم الهوية / السجل:
                                        </span>{" "}
                                        <span className="font-mono font-black text-slate-800">
                                          {/* 🚀 قابل للتعديل */}
                                          <EditableSpan
                                            value={repIdNumber}
                                            dataObj={data}
                                            dataKey="repIdNumber"
                                            placeholder="............................"
                                            isEditMode={isEditMode}
                                          />
                                        </span>
                                      </div>
                                      <div className="flex flex-col gap-1">
                                        <div>
                                          <span className="text-slate-500 font-bold">
                                            مستند التمثيل (
                                            {authDocType === "مستند انتفاع" &&
                                            customUsufructType
                                              ? customUsufructType
                                              : authDocType ||
                                                "الوكالة/التفويض"}
                                            ):
                                          </span>{" "}
                                          <span className="font-mono font-black text-cyan-900">
                                            {/* 🚀 قابل للتعديل */}
                                            <EditableSpan
                                              value={authDocNumber}
                                              dataObj={data}
                                              dataKey="authDocNumber"
                                              placeholder="............................"
                                              isEditMode={isEditMode}
                                            />
                                          </span>
                                        </div>
                                        {(showAuthDocIssueDate ||
                                          showAuthDocExpiryDate) && (
                                          <div className="flex items-center gap-4 text-[9px] mt-0.5">
                                            {showAuthDocIssueDate &&
                                              authDocIssueDate && (
                                                <span className="text-slate-500">
                                                  تاريخ الإصدار:{" "}
                                                  <span className="font-mono font-bold text-slate-700">
                                                    {new Date(
                                                      authDocIssueDate,
                                                    ).toLocaleDateString(
                                                      "ar-SA",
                                                    )}
                                                  </span>
                                                </span>
                                              )}
                                            {showAuthDocExpiryDate &&
                                              authDocExpiryDate && (
                                                <span className="text-slate-500">
                                                  تاريخ الانتهاء:{" "}
                                                  <span className="font-mono font-bold text-rose-600">
                                                    {new Date(
                                                      authDocExpiryDate,
                                                    ).toLocaleDateString(
                                                      "ar-SA",
                                                    )}
                                                  </span>
                                                </span>
                                              )}
                                          </div>
                                        )}
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      رقم الجوال:
                                    </span>{" "}
                                    <span className="font-mono font-black text-slate-800">
                                      {/* 🚀 يقرأ التعديلات */}
                                      <EditableSpan
                                        value={repPhone}
                                        dataObj={data}
                                        dataKey="repPhone"
                                        isEditMode={isEditMode}
                                        placeholder="............................"
                                      />{" "}
                                    </span>
                                  </div>
                                  <div className="mt-6 text-center text-slate-400 font-bold">
                                    التوقيع الشخصي والختم:
                                    <br />
                                    <span className="inline-block mt-4">
                                      ........................................
                                    </span>
                                  </div>
                                </div>
                              </td>
                              <td
                                className="p-3 align-top leading-relaxed"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                <div className="flex flex-col gap-3">
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      اسم المنشأة الهندسية:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      شركة ديتيلز كونسولتس | Details consults
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      إسم ممثل مقدم الخدمة:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      {/* 🚀 قابل للتعديل */}
                                      <EditableSpan
                                        value={firstPartyRep}
                                        dataObj={data}
                                        dataKey="firstPartyRep"
                                        placeholder="__________________"
                                        isEditMode={isEditMode}
                                      />
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      صفة ممثل مقدم الخدمة:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      {/* 🚀 قابل للتعديل */}
                                      <EditableSpan
                                        value={firstPartyRepCapacity}
                                        dataObj={data}
                                        dataKey="firstPartyRepCapacity"
                                        placeholder="__________________"
                                        isEditMode={isEditMode}
                                      />
                                    </span>
                                  </div>
                                  {showFirstPartyEmpId && (
                                    <div>
                                      <span className="text-slate-500 font-bold">
                                        الرقم الوظيفي:
                                      </span>{" "}
                                      <span className="font-mono font-black text-slate-800">
                                        {/* 🚀 قابل للتعديل */}
                                        <EditableSpan
                                          value={firstPartyEmpCode}
                                          dataObj={data}
                                          dataKey="firstPartyEmpCode"
                                          placeholder="__________________"
                                          isEditMode={isEditMode}
                                        />
                                      </span>
                                    </div>
                                  )}
                                  <div className="mt-6 text-center text-slate-400 font-bold">
                                    التوقيع الشخصي :
                                    <br />
                                    {firstPartySignatureType === "SYSTEM" &&
                                    employeeSignatureUrl ? (
                                      <img
                                        src={employeeSignatureUrl}
                                        alt="توقيع الموظف"
                                        className="h-16 mt-2 mx-auto mix-blend-multiply object-contain"
                                      />
                                    ) : (
                                      <span className="inline-block mt-4">
                                        ........................................
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </section>
                    </td>
                  </tr>
                </tbody>

                <tfoot className="table-footer-group">
                  <tr>
                    <td style={{ padding: "20px 60px 40px 60px" }}>
                      <div
                        className="border-t-[2.5px] pt-3"
                        style={{ borderColor: selectedStyle.accent }}
                        dir="ltr"
                      >
                        <div
                          className="flex items-start gap-3"
                          style={{ color: selectedStyle.accent }}
                        >
                          <div className="h-[16mm] w-[16mm] shrink-0 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center bg-slate-50/50">
                            <span className="text-[7px] font-black text-slate-400 leading-tight text-center">
                              QR
                              <br />
                              للتحقق
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 flex flex-col justify-center py-1">
                            <div
                              className="flex items-center justify-end gap-1.5 whitespace-nowrap text-[10.5px] font-black leading-[1.4]"
                              dir="rtl"
                            >
                              <span>📍</span>
                              <span>
                                حي الملك فهد - الرياض - المملكة العربية السعودية
                                - الرمز البريدي : ١٢٢٧٤
                              </span>
                              <span className="opacity-50">·</span>
                              <span>جوال : ٠٥٩٠٧٢٢٨٢٧</span>
                              <span className="opacity-50">·</span>
                              <span>الرقم الوطني الموحد : ٧٠٥٢٣٠٣٨٢٨</span>
                            </div>
                            <div
                              className="mt-1 flex items-center justify-start gap-1 whitespace-nowrap text-[10px] font-black leading-[1.4]"
                              dir="ltr"
                            >
                              <span>📍</span>
                              <span>
                                King Fahd Dist - RIYADH - Kingdom of Saudi
                                Arabia - POSTAL CODE : 12274
                              </span>
                              <span className="ml-1">☎</span>
                              <span>0590722827</span>
                              <span className="ml-1">- N.N:</span>
                              <span>7052303828</span>
                              <span className="ml-1">✉</span>
                              <span>info@details-consults.sa</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 text-center text-[10px] font-bold text-slate-400">
                          <span className="page-number"></span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
