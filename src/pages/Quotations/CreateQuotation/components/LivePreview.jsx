import React, { useRef, useState } from "react";
import {
  Eye,
  Printer,
  Edit3,
  Check,
  ZoomIn,
  ZoomOut,
  FileText,
  ShieldCheck,
  MapPin,
  Scale,
  Building,
  UserCheck,
  FolderOpen,
  DollarSign
} from "lucide-react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// ==========================================
// 🚀 إعدادات الخلفيات الرسمية
// ==========================================
const SECURITY_BACKGROUNDS = {
  none: { label: "بدون (سادة)", value: "none" },
  official1: {
    label: "خلفية رسمية 1 (الذهبية)",
    value: "url('/safe_background/1.png')",
  },
  official2: { label: "خلفية رسمية 2", value: "url('/safe_background/2.png')" },
  official3: { label: "خلفية رسمية 3", value: "url('/safe_background/3.png')" },
};

const IconWithText = ({ icon: Icon, text, className = "", iconClassName = "", textClassName = "", vertical = false }) => (
  <span className={`inline-flex min-w-0 items-center justify-center ${vertical ? "flex-col gap-0.5" : "gap-1.5"} ${className}`}>
    {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
    {text && <span className={textClassName || "min-w-0 break-words text-[10px] font-black leading-tight"}>{text}</span>}
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

const formatCurrency = (value) => Number(value || 0).toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const toArabicDigits = (value) => String(value ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

const getDatePart = (formatter, date, type) => formatter.formatToParts(date).find((part) => part.type === type)?.value || "";
const formatDateParts = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return { gregorian: value, hijri: value, combined: value };

  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", { year: "numeric", month: "2-digit", day: "2-digit" });
  const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", { year: "numeric", month: "2-digit", day: "2-digit" });

  const gregorian = toArabicDigits(`${getDatePart(gregorianFormatter, date, "day")}/${getDatePart(gregorianFormatter, date, "month")}/${getDatePart(gregorianFormatter, date, "year")}`);
  const hijri = toArabicDigits(`${getDatePart(hijriFormatter, date, "day")}/${getDatePart(hijriFormatter, date, "month")}/${getDatePart(hijriFormatter, date, "year")}`);

  return { gregorian, hijri, combined: `ميلادي: ${gregorian} / هجري: ${hijri}` };
};

export const LivePreview = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.68);
  const [bgType, setBgType] = useState("official1");
  const componentRef = useRef(null);

  const selectedStyle = previewStyles.classic;
  const issueDateParts = formatDateParts(data?.issueDate);

  const {
    transactionType,
    licenseNumber,
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

    // البيانات الخاصة بالتمثيل النظامي والعميل
    clientType = "فرد",
    signatureMethod = "SELF",
    repName,
    repIdNumber,
    repPhone,
    repCapacity,
    authDocType,
    authDocNumber,
    authDocDate,
  } = data || {};

  const referenceNumber = `QT-${Date.now().toString().slice(-5)}`;
  const calculatedOfficeDiscount = (taxAmount * (officeTaxBearing || 0)) / 100;
  const finalPayable = grandTotal - calculatedOfficeDiscount;

  const paymentMethodsLabels = { bank: "تحويل بنكي", cash: "نقدي بالمقر", sadad: "سداد" };

  const introText = (() => {
    let intro = `إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات (${transactionType || "الخدمات الهندسية والاستشارية"})`;
    if (showPropertyCode && propertyCodeForPreview) intro += ` لقطعة الأرض أو الملف رقم (${propertyCodeForPreview})`;
    intro += "، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة وفقاً لنطاق العمل والاشتراطات والملاحظات التالية:";
    return intro;
  })();

  const getItemTotal = (item) => Math.max(0, Number(item.qty ?? item.quantity ?? 1) * Number(item.price ?? item.unitPrice ?? 0) - Number(item.discount || 0));
  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.1, 0.38));

  const handlePrint = () => {
    const node = componentRef.current;
    if (!node) return;
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "-10000px";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    
    const appStyles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style')).map((s) => s.outerHTML).join("\n");

    doc.open();
    doc.write(`
      <!doctype html>
      <html dir="rtl" lang="ar">
        <head>
          <title>${referenceNumber}</title>
          ${appStyles}
          <style>
            @page { size: A4; margin: 0; }
            body { 
              margin: 0; background: #fff; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              font-family: Tajawal, Arial, sans-serif; 
            }
            .print-shell { width: 100%; margin: 0; }
            
            /* إعدادات الفواصل بين الصفحات في الطباعة */
            .print-wrapper { display: block !important; gap: 0 !important; padding: 0 !important; margin: 0 !important; width: 100% !important; }
            .cover-page { height: 1123px; page-break-after: always; position: relative; background: transparent !important; box-shadow: none !important; }
            .content-page { min-height: 1123px; width: 100%; background: transparent !important; box-shadow: none !important; }
            
            table.document-table { width: 100%; border-collapse: collapse; border: none; }
            table.document-table > thead { display: table-header-group; } 
            table.document-table > tfoot { display: table-footer-group; } 
            table.document-table > tbody > tr > td { padding: 0px 70px 20px 70px; }
            
            .avoid-break { page-break-inside: avoid; break-inside: avoid; } 
            
            /* الخلفية الرسمية للطباعة */
            .bg-layer { 
              position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
              background-image: ${SECURITY_BACKGROUNDS[bgType].value}; 
              background-size: 794px 1123px; background-repeat: repeat-y; 
              z-index: -2; 
            }
          </style>
        </head>
        <body>
          <div class="bg-layer"></div>
          <div class="print-shell">${node.innerHTML}</div>
        </body>
      </html>
    `);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 500);
  };

  const bgStyleConfig = {
    backgroundColor: selectedStyle.paper,
    backgroundImage: SECURITY_BACKGROUNDS[bgType].value !== "none" ? SECURITY_BACKGROUNDS[bgType].value : "none",
    backgroundSize: `${A4_WIDTH_PX}px 1123px`,
    backgroundRepeat: "repeat-y",
    backgroundPosition: "top center",
  };

  const renderClientRepresentation = () => {
    if (signatureMethod === "SELF" || !signatureMethod) return null;

    let text = `ويمثل العميل (${clientType.replace("_", " ")}) بالتوقيع والاعتماد على هذا العرض السيد/ة: `;
    text += repName ? `${repName}` : "........................";
    if (repIdNumber) text += `، (هوية رقم: ${repIdNumber})`;
    if (repCapacity) text += `، بصفته: ${repCapacity}`;

    if (authDocType || authDocNumber) {
      text += `، بموجب `;
      if (authDocType) text += `${authDocType} `;
      if (authDocNumber) text += `رقم (${authDocNumber}) `;
      if (authDocDate)
        text += `وتاريخ ${formatDateParts(authDocDate).gregorian}`;
    }
    text += ".";

    return (
      <div className="mt-2 mb-4 flex items-start gap-2 text-[12px] font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg p-3">
        <Scale className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">{text}</p>
      </div>
    );
  };

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-[#e8edf0] shadow-[0_10px_26px_rgba(18,63,89,0.08)]" dir="rtl">
      {/* شريط الأدوات العلوية */}
      <div className="shrink-0 border-b border-[#e8ddc8] bg-white px-3 py-2 z-10 shadow-sm">
        <div className="mx-auto max-w-[980px] rounded-[18px] border border-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-2 shadow-[0_4px_12px_rgba(18,63,89,0.04)]">
          <div className="flex min-w-0 items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#d8b46a]/25 rounded-xl shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c5983c]" />
              <select value={bgType} onChange={(e) => setBgType(e.target.value)} className="bg-transparent text-[10px] font-black text-[#123f59] outline-none cursor-pointer">
                {Object.entries(SECURITY_BACKGROUNDS).map(([key, bg]) => (
                  <option key={key} value={key}>{bg.label}</option>
                ))}
              </select>
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto custom-scrollbar-slim">
              <button onClick={() => setIsEditMode(!isEditMode)} className={`inline-flex h-8 shrink-0 items-center justify-center rounded-xl border px-2 text-[9px] font-black transition ${isEditMode ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#d8b46a]/25 bg-white text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"}`} type="button">
                <IconWithText icon={isEditMode ? Check : Edit3} text={isEditMode ? "حفظ التعديلات" : "تحرير العرض"} iconClassName="h-3.5 w-3.5" />
              </button>
              <button onClick={handlePrint} className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[#123f59] px-2.5 text-[9px] font-black text-white transition hover:bg-[#0f3448]" type="button">
                <IconWithText icon={Printer} text="طباعة المستند" iconClassName="h-3.5 w-3.5 text-[#e2bf74]" />
              </button>
              <div className="w-px h-5 bg-[#d8b46a]/30 mx-1"></div>
              <button onClick={handleZoomOut} className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"><ZoomOut className="w-3.5 h-3.5" /></button>
              <span className="inline-flex h-8 min-w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#123f59]">{Math.round(zoomScale * 100)}%</span>
              <button onClick={handleZoomIn} className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"><ZoomIn className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* منطقة عرض صفحات الـ PDF */}
      <div className="min-h-0 flex-1 overflow-auto p-6 pb-16 custom-scrollbar-slim flex flex-col items-center relative" style={{ backgroundColor: "#e8edf0" }}>
        <div id="pdf-scale-wrapper" style={{ transform: `scale(${zoomScale})`, transformOrigin: "top center", transition: "transform 0.2s" }}>
          
          {/* الغلاف (Ref) يشمل جميع الصفحات ليتم طباعتها معاً */}
          <div ref={componentRef} className="print-wrapper flex flex-col gap-8 items-center pb-12" style={{ width: `${A4_WIDTH_PX}px` }}>
            
            {/* ============================================== */}
            {/* 📄 الصفحة الأولى: الغلاف (Cover Page) */}
            {/* ============================================== */}
            <div className="cover-page relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] print:shadow-none" style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px`, ...bgStyleConfig }}>
              
              <div className="absolute inset-0 flex flex-col justify-between items-center text-center p-[80px]">
                
                {/* أعلى الغلاف: الشعار */}
                <div className="w-[300px] mt-16 bg-transparent">
                  <img src="/logo.jpeg" alt="Details Consulting Engineers" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>

                {/* وسط الغلاف: العناوين */}
                <div className="w-full flex flex-col items-center">
                  <div className="w-4/5 border-t-[5px] border-b-[5px] py-12 mb-8" style={{ borderColor: selectedStyle.accent }}>
                    <h1 className="text-[42px] font-black mb-6 leading-tight" style={{ color: selectedStyle.accent }}>عرض سعر فني ومالي</h1>
                    <h2 className="text-[22px] font-bold text-[#475569]">{transactionType || "خدمات هندسية واستشارية استراتيجية"}</h2>
                  </div>
                </div>

                {/* منتصف الغلاف: بيانات العميل */}
                <div className="w-full text-right bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-[#d8b46a]/30 shadow-sm">
                  <p className="text-[16px] font-black text-slate-500 mb-3">مقدم إلى السادة:</p>
                  <p className="text-[34px] font-black mb-8 leading-tight" style={{ color: selectedStyle.accent }}>
                    {clientTitle} / {clientNameForPreview}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-[14px] font-bold text-slate-700">
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                      <span className="text-slate-500">رقم المرجع:</span> 
                      <span className="font-mono text-slate-900 font-black">{referenceNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-300 pb-1">
                      <span className="text-slate-500">تاريخ الإصدار:</span> 
                      <span className="font-mono text-slate-900">{issueDateParts.gregorian}</span>
                    </div>
                    {propertyCodeForPreview && (
                      <div className="col-span-2 flex justify-between border-b border-dashed border-slate-300 pb-1">
                        <span className="text-slate-500">المشروع/الملكية:</span> 
                        <span className="font-mono text-slate-900 font-black">{propertyCodeForPreview}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* أسفل الغلاف */}
                <div className="mt-8">
                  <p className="text-[13px] font-black text-slate-400">شركة ديتيلز كونسولتس للاستشارات الهندسية</p>
                </div>
              </div>
            </div>


            {/* ============================================== */}
            {/* 📄 الصفحات المتتالية: المحتوى (Content Pages) */}
            {/* ============================================== */}
            <div className="content-page relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] print:shadow-none" style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px`, ...bgStyleConfig }}>
              <table className="document-table w-full border-collapse border-none">
                
                {/* 🌟 الترويسة (تتكرر في كل صفحة محتوى، ولكن لا تظهر في الغلاف) */}
                <thead className="table-header-group">
                  <tr>
                    <td style={{ padding: "60px 70px 20px 70px" }}>
                      <div className="flex justify-between items-start border-b-[3px] pb-4" style={{ borderColor: selectedStyle.accent }}>
                        <div className="flex h-16 w-48 items-center justify-center bg-transparent">
                          <img src="/logo.jpeg" alt="Details Consulting Engineers" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                        </div>
                        <div className="w-[280px]">
                          <table className="w-full text-right border-collapse text-[10px] font-bold border bg-transparent" style={{ borderColor: `${selectedStyle.accent}44` }}>
                            <tbody>
                              <tr>
                                <td className="p-2 border w-[35%] text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>نوع المستند</td>
                                <td className="p-2 border text-[12px] font-black" style={{ borderColor: `${selectedStyle.accent}44`, color: selectedStyle.accent }}>عرض سعر خدمات فنية</td>
                              </tr>
                              <tr>
                                <td className="p-2 border text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>التاريخ</td>
                                <td className="p-2 border text-[9.5px] font-bold text-[#123f59]" style={{ borderColor: `${selectedStyle.accent}44` }}>{issueDateParts.combined}</td>
                              </tr>
                              <tr>
                                <td className="p-2 border text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم المرجع</td>
                                <td className="p-2 border font-mono text-[11px] font-black text-[#123f59]" style={{ borderColor: `${selectedStyle.accent}44` }}>{referenceNumber}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </td>
                  </tr>
                </thead>

                {/* 🌟 المحتوى الأساسي */}
                <tbody className="table-row-group">
                  <tr>
                    <td style={{ padding: "0px 70px 20px 70px" }}>
                      
                      {/* جدول المواصفات الفنية للمستند */}
                      <table className="w-full border-collapse text-right text-[10px] font-bold border bg-transparent mb-6 mt-4" style={{ borderColor: `${selectedStyle.accent}44` }}>
                        <tbody>
                          <tr>
                            <td className="p-2 border bg-slate-50 text-[#475569] w-[20%]" style={{ borderColor: `${selectedStyle.accent}44` }}>نوع المستند</td>
                            <td className="p-2 border font-black w-[30%]" style={{ borderColor: `${selectedStyle.accent}44`, color: selectedStyle.accent }}>عرض سعر خدمات هندسية</td>
                            <td className="p-2 border bg-slate-50 text-[#475569] w-[20%]" style={{ borderColor: `${selectedStyle.accent}44` }}>حالة المستند</td>
                            <td className="p-2 border w-[30%] text-amber-700 font-black animate-pulse" style={{ borderColor: `${selectedStyle.accent}44` }}>مسودة مراجعة داخلية</td>
                          </tr>
                          <tr>
                            <td className="p-2 border bg-slate-50 text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم حساب العميل</td>
                            <td className="p-2 border font-mono text-slate-800" style={{ borderColor: `${selectedStyle.accent}44` }}>{clientCodeForPreview || "—"}</td>
                            <td className="p-2 border bg-slate-50 text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>كود أرشفة المشروع</td>
                            <td className="p-2 border font-mono text-slate-800" style={{ borderColor: `${selectedStyle.accent}44` }}>{propertyCodeForPreview || "—"}</td>
                          </tr>
                          <tr>
                            <td className="p-2 border bg-slate-50 text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>مدة صلاحية العرض</td>
                            <td className="p-2 border text-slate-800" style={{ borderColor: `${selectedStyle.accent}44` }}>30 يوماً من تاريخ التحرير</td>
                            <td className="p-2 border bg-slate-50 text-[#475569]" style={{ borderColor: `${selectedStyle.accent}44` }}>نسخة الوثيقة</td>
                            <td className="p-2 border font-mono text-slate-800" style={{ borderColor: `${selectedStyle.accent}44` }}>v1.0</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* المقدمة والمخاطبة */}
                      <section className="mb-6 avoid-break bg-transparent">
                        <h4 className="mb-4 text-[13px] font-black" style={{ color: selectedStyle.accent }}>
                           {clientTitle || "المواطن"} {clientNameForPreview || "عميل غير محدد"}
                        </h4>
                        
                        {renderClientRepresentation()}

                        <p className="mb-3 mt-3 text-[12px] font-black" style={{ color: selectedStyle.accent }}>السلام عليكم ورحمة الله وبركاته ،،,</p>
                        <div contentEditable={isEditMode} suppressContentEditableWarning style={{ letterSpacing: "0px", lineHeight: "24px", fontSize: "11.5px", whiteSpace: "pre-wrap" }} className="text-right font-bold text-[#475569] mb-4">
                          {introText}
                        </div>
                      </section>

                      {/* أولاً: بيانات العميل والمالك وصاحب العلاقة */}
                      <section className="mb-6 avoid-break bg-transparent">
                        <h4 className="mb-2 text-[11.5px] font-black flex items-center gap-1.5" style={{ color: selectedStyle.accent }}>
                          <UserCheck className="w-4 h-4 text-[#c5983c]" /> أولاً: بيانات العميل والمالك وصاحب العلاقة الأصلي
                        </h4>
                        <table className="w-full border-collapse text-right text-[10.5px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                          <tbody className="font-bold text-[#123f59]">
                            <tr>
                              <td className="p-2 border bg-slate-50 w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>تصنيف العميل الكياني</td>
                              <td className="p-2 border w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>{clientType.replace("_", " ") || "---"}</td>
                              <td className="p-2 border bg-slate-50 w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>اسم المالك المسجل بالتسجيل</td>
                              <td className="p-2 border w-1/4 font-black" style={{ borderColor: `${selectedStyle.accent}44`, color: selectedStyle.accent }}>{clientNameForPreview}</td>
                            </tr>
                            <tr>
                              <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>كود العميل بالنظام</td>
                              <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{clientCodeForPreview || "---"}</td>
                              <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم الجوال للاتصال</td>
                              <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{repPhone || "---"}</td>
                            </tr>
                            <tr>
                              <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>الصفة القانونية للتوقيع</td>
                              <td colSpan="3" className="p-2 border" style={{ borderColor: `${selectedStyle.accent}44` }}>{signatureMethod === "SELF" ? "المالك الأصلي مباشرة" : "ممثل نظامي بموجب مستند ساري الكفاءة"}</td>
                            </tr>
                          </tbody>
                        </table>
                      </section>

                      {/* ثانياً: بيانات التمثيل النظامي والمفوض بالتوقيع */}
                      {signatureMethod !== "SELF" && (
                        <section className="mb-6 avoid-break bg-transparent">
                          <h4 className="mb-2 text-[11.5px] font-black flex items-center gap-1.5" style={{ color: selectedStyle.accent }}>
                            <Scale className="w-4 h-4 text-[#c5983c]" /> ثانياً: بيانات التمثيل النظامي والمفوض بالتوقيع الشرعي
                          </h4>
                          <table className="w-full border-collapse text-right text-[10.5px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            <tbody className="font-bold text-[#123f59]">
                              <tr>
                                <td className="p-2 border bg-slate-50 w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>اسم المفوض بالتوقيع الكامل</td>
                                <td className="p-2 border w-1/4 font-black" style={{ borderColor: `${selectedStyle.accent}44` }}>{repName || "---"}</td>
                                <td className="p-2 border bg-slate-50 w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم السجل المدني / الهوية</td>
                                <td className="p-2 border w-1/4 font-mono font-black" style={{ borderColor: `${selectedStyle.accent}44` }}>{repIdNumber || "---"}</td>
                              </tr>
                              <tr>
                                <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>الصفة بالتكليف</td>
                                <td className="p-2 border" style={{ borderColor: `${selectedStyle.accent}44` }}>{repCapacity || "---"}</td>
                                <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم جوال المفوض الثابت</td>
                                <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{repPhone || "---"}</td>
                              </tr>
                              <tr>
                                <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>نوع مستند التفويض والصفة</td>
                                <td className="p-2 border" style={{ borderColor: `${selectedStyle.accent}44` }}>{authDocType || "---"}</td>
                                <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>توثيق رقم وتاريخ الصك</td>
                                <td className="p-2 border font-mono font-bold text-cyan-800" style={{ borderColor: `${selectedStyle.accent}44` }}>
                                  {authDocNumber ? `رقم: ${authDocNumber}` : "---"} {authDocDate ? `بتاريخ: ${formatDateParts(authDocDate).gregorian}` : ""}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </section>
                      )}

                      {/* ثالثاً: بيانات المشروع والملكية العقارية */}
                      <section className="mb-6 avoid-break bg-transparent">
                        <h4 className="mb-2 text-[11.5px] font-black flex items-center gap-1.5" style={{ color: selectedStyle.accent }}>
                          <Building className="w-4 h-4 text-[#c5983c]" /> {signatureMethod !== "SELF" ? "ثالثاً" : "ثانياً"}: بيانات المشروع والملكية العقارية
                        </h4>
                        <table className="w-full border-collapse text-right text-[10.5px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                          <tbody className="font-bold text-[#123f59]">
                            <tr>
                              <td className="p-2 border bg-slate-50 w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم صك الملكية العقاري</td>
                              <td className="p-2 border w-1/4 font-mono font-black text-emerald-800" style={{ borderColor: `${selectedStyle.accent}44` }}>{deedNumber || "—"}</td>
                              <td className="p-2 border bg-slate-50 w-1/4" style={{ borderColor: `${selectedStyle.accent}44` }}>كود الأرشفة والربط</td>
                              <td className="p-2 border w-1/4 font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{propertyCodeForPreview || "---"}</td>
                            </tr>
                            {(licenseNumber || serviceNumber) && (
                              <tr>
                                <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم وتاريخ رخصة البناء</td>
                                <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{licenseNumber ? `${licenseNumber} لعام ${licenseYear}هـ` : "---"}</td>
                                <td className="p-2 border bg-slate-50" style={{ borderColor: `${selectedStyle.accent}44` }}>رقم وتاريخ معاملة البلدي</td>
                                <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{serviceNumber ? `${serviceNumber} لعام ${serviceYear}هـ` : "---"}</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </section>

                      {/* بيانات قطع المخطط التنظيمي والأبعاد والحدود */}
                      {plots && plots.length > 0 && (
                        <div className="mb-6 avoid-break">
                          <table className="w-full border-collapse text-center text-[10px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            <thead>
                              <tr className="font-black text-white" style={{ backgroundColor: selectedStyle.accent }}>
                                <th className="p-2 border" style={{ borderColor: selectedStyle.accent }}>رقم القطعة الدقيق</th>
                                <th className="p-2 border" style={{ borderColor: selectedStyle.accent }}>إجمالي المساحة</th>
                                <th className="p-2 border" style={{ borderColor: selectedStyle.accent }}>الحد الشمالي</th>
                                <th className="p-2 border" style={{ borderColor: selectedStyle.accent }}>الحد الجنوبي</th>
                                <th className="p-2 border" style={{ borderColor: selectedStyle.accent }}>الحد الشرقي</th>
                                <th className="p-2 border" style={{ borderColor: selectedStyle.accent }}>الحد الغربي</th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#123f59]">
                              {plots.map((plot) => {
                                const n = boundaries.find((b) => b.direction === "شمال" && b.plotId === plot.id);
                                const s = boundaries.find((b) => b.direction === "جنوب" && b.plotId === plot.id);
                                const e = boundaries.find((b) => b.direction === "شرق" && b.plotId === plot.id);
                                const w = boundaries.find((b) => b.direction === "غرب" && b.plotId === plot.id);
                                return (
                                  <tr key={plot.id}>
                                    <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{plot.plotNumber || "---"}</td>
                                    <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{plot.area || "---"} م²</td>
                                    <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{n?.length || 0} م</td>
                                    <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{s?.length || 0} م</td>
                                    <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{e?.length || 0} م</td>
                                    <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{w?.length || 0} م</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* رابعاً: نطاق الأعمال المتفق عليها وقائمة التكاليف المادية */}
                      <section className="mb-6 bg-transparent">
                        <h4 className="mb-2 text-[11.5px] font-black flex items-center gap-1.5" style={{ color: selectedStyle.accent }}>
                          <FileText className="w-4 h-4 text-[#c5983c]" /> {signatureMethod !== "SELF" ? "رابعاً" : "ثالثاً"}: نطاق الأعمال وقائمة التكاليف المالية
                        </h4>
                        <table className="w-full border-collapse text-center text-[10.5px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                          <thead>
                            <tr className="font-black text-white avoid-break" style={{ backgroundColor: selectedStyle.accent }}>
                              <th className="w-8 p-2.5 border" style={{ borderColor: selectedStyle.accent }}>م</th>
                              <th className="p-2.5 text-right border" style={{ borderColor: selectedStyle.accent }}>وصف الخدمة الاستشارية / نطاق العمل الفني</th>
                              {showQuantity && <th className="w-16 p-2.5 border" style={{ borderColor: selectedStyle.accent }}>الكمية</th>}
                              <th className="w-24 p-2.5 border" style={{ borderColor: selectedStyle.accent }}>الفئة (ر.س)</th>
                              <th className="w-28 p-2.5 border" style={{ borderColor: selectedStyle.accent }}>الإجمالي قبل الضريبة</th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#123f59]">
                            {items.length === 0 ? (
                              <tr><td colSpan={showQuantity ? "5" : "4"} className="p-6 text-center text-[#94a3b8]">لا توجد بنود فنية مسجلة حتى الآن</td></tr>
                            ) : (
                              items.map((item, index) => (
                                <tr key={item.id || index} className="avoid-break">
                                  <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{index + 1}</td>
                                  <td className="p-2 text-right border leading-relaxed" style={{ borderColor: `${selectedStyle.accent}44` }}>{item.title}</td>
                                  {showQuantity && <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{item.qty || item.quantity || 1} {item.unit}</td>}
                                  <td className="p-2 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{formatCurrency(item.price || item.unitPrice)}</td>
                                  <td className="p-2 border font-mono font-black" style={{ borderColor: `${selectedStyle.accent}44`, color: selectedStyle.accent }}>{formatCurrency(getItemTotal(item))}</td>
                                </tr>
                              ))
                            )}
                            
                            <tr className="avoid-break bg-slate-50/50">
                              <td colSpan={showQuantity ? "4" : "3"} className="p-2.5 text-left font-black border" style={{ borderColor: selectedStyle.accent }}>المجموع الفرعي</td>
                              <td className="p-2.5 font-mono font-black text-[12px] border text-slate-800" style={{ borderColor: selectedStyle.accent }}>{formatCurrency(subtotal)}</td>
                            </tr>
                            <tr className="avoid-break bg-transparent">
                              <td colSpan={showQuantity ? "4" : "3"} className="p-2.5 text-left font-bold text-[#64748b] border" style={{ borderColor: selectedStyle.accent }}>
                                ضريبة القيمة المضافة {taxRate || 0}% {officeTaxBearing > 0 ? ` (يتحمل المكتب ${officeTaxBearing}%)` : ""}
                              </td>
                              <td className="p-2.5 font-mono font-bold text-[12px] border text-slate-700" style={{ borderColor: selectedStyle.accent }}>{formatCurrency(taxAmount)}</td>
                            </tr>
                            {officeTaxBearing > 0 && (
                              <tr className="avoid-break bg-transparent text-emerald-700">
                                <td colSpan={showQuantity ? "4" : "3"} className="p-2 text-left font-bold border" style={{ borderColor: selectedStyle.accent }}>خصم إعفاء ضريبي ضِمني (المكتب يتحمل نسبة {officeTaxBearing}%)</td>
                                <td className="p-2 font-mono font-black text-[12px] border" style={{ borderColor: selectedStyle.accent }}>- {formatCurrency(calculatedOfficeDiscount)}</td>
                              </tr>
                            )}
                            <tr className="font-black text-white avoid-break" style={{ backgroundColor: selectedStyle.accent }}>
                              <td colSpan={showQuantity ? "4" : "3"} className="p-3 text-left text-[12.5px] border" style={{ borderColor: selectedStyle.accent }}>الإجمالي النهائي المستحق الصافي للدفع</td>
                              <td className="p-3 font-mono text-[13.5px] border" style={{ borderColor: selectedStyle.accent }}>{formatCurrency(finalPayable)} ر.س</td>
                            </tr>
                          </tbody>
                        </table>
                      </section>

                      {/* خامساً: جدول الدفعات المالية الموزعة شاملة للضريبة */}
                      {paymentsList.length > 0 && (
                        <section className="mb-6 avoid-break bg-transparent">
                          <h4 className="mb-2 text-[11.5px] font-black flex items-center gap-1.5" style={{ color: selectedStyle.accent }}>
                            <DollarSign className="w-4 h-4 text-[#c5983c]" /> {signatureMethod !== "SELF" ? "خامساً" : "رابعاً"}: جدول توزيع الدفعات المالية
                          </h4>
                          <table className="w-full border-collapse text-center text-[10.5px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            <thead>
                              <tr className="font-black text-white" style={{ backgroundColor: selectedStyle.accent }}>
                                <th className="p-2.5 border w-[20%]" style={{ borderColor: selectedStyle.accent }}>الدفعة</th>
                                <th className="p-2.5 border w-[15%]" style={{ borderColor: selectedStyle.accent }}>النسبة (%)</th>
                                <th className="p-2.5 border w-[25%]" style={{ borderColor: selectedStyle.accent }}>المبلغ (شامل الضريبة)</th>
                                <th className="p-2.5 border w-[40%]" style={{ borderColor: selectedStyle.accent }}>الاستحقاق</th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#123f59]">
                              {paymentsList.map((payment, index) => (
                                <tr key={payment.id || index}>
                                  <td className="p-2 border text-center bg-slate-50/50" style={{ borderColor: `${selectedStyle.accent}44` }}>{payment.label || `الدفعة ${index + 1}`}</td>
                                  <td className="p-2 border text-center font-mono text-slate-700" style={{ borderColor: `${selectedStyle.accent}44` }}>{payment.percentage || Math.round(100 / paymentsList.length)}%</td>
                                  <td className="p-2 font-mono text-center border text-emerald-800 font-black bg-emerald-50/20" style={{ borderColor: `${selectedStyle.accent}44` }}>{formatCurrency(payment.amount)} ر.س</td>
                                  <td className="p-2 border text-right pr-3 text-[#556575] leading-relaxed" style={{ borderColor: `${selectedStyle.accent}44` }}>{payment.condition || "حسب الاتفاق وجداول إنجاز الأعمال الفنية"}</td>
                                </tr>
                              ))}
                              {acceptedMethods && acceptedMethods.length > 0 && (
                                <tr className="bg-slate-50">
                                  <td colSpan="4" className="p-2 text-right text-[10px] text-[#475569] border" style={{ borderColor: `${selectedStyle.accent}44` }}>
                                    <span className="font-black ml-2 text-slate-800">طرق وقنوات الدفع ونظام السداد المتاحة:</span>
                                    {acceptedMethods.map(m => paymentMethodsLabels[m] || m).join(" ، ")}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </section>
                      )}

                      {/* سادساً: المستندات والنواقص الفنية والشرعية المطلوب توفيرها من العميل */}
                      {showMissingDocs && (
                        <section className="mb-6 avoid-break bg-transparent">
                          <h4 className="mb-2 text-[11.5px] font-black flex items-center gap-1.5" style={{ color: selectedStyle.accent }}>
                            <FolderOpen className="w-4 h-4 text-[#c5983c]" /> {signatureMethod !== "SELF" ? "سادساً" : "خامساً"}: المستندات والمسوغات المطلوب توفيرها من طرفكم لبدء الخدمة
                          </h4>
                          <table className="w-full border-collapse text-right text-[10.5px] bg-transparent" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            <thead>
                              <tr className="font-black text-white" style={{ backgroundColor: selectedStyle.accent }}>
                                <th className="p-2 border">قائمة مسوغات العمل والنواقص العقارية والكيانية المطلوبة لتفعيل هذا العرض</th>
                              </tr>
                            </thead>
                            <tbody className="font-bold text-[#475569] bg-slate-50/50">
                              <tr>
                                <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-1">
                                    {missingDocs ? (
                                      missingDocs.split("\n").filter((doc) => doc.trim() !== "").map((doc, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-[11px] text-slate-700 font-bold">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#c5983c] shrink-0" />
                                          <span>{doc.replace(/^- /, "").trim()}</span>
                                        </div>
                                      ))
                                    ) : (
                                      <span className="text-slate-400">لا توجد نواقص مطلوبة حالياً.</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </section>
                      )}

                      {/* الشروط والأحكام الفنية العامة */}
                      <section className="mb-8 avoid-break bg-transparent">
                        <h4 className="mb-2 text-[11.5px] font-black" style={{ color: selectedStyle.accent }}>{signatureMethod !== "SELF" ? "سابعاً" : "سادساً"}: الشروط والأحكام والالتزامات العامة</h4>
                        <div contentEditable={isEditMode} suppressContentEditableWarning style={{ letterSpacing: "0px", lineHeight: "24px", fontSize: "11px", whiteSpace: "pre-wrap" }} className="text-right font-bold text-[#475569] bg-slate-50/30 p-2 rounded border border-slate-100">
                          {termsText || "خاضع للشروط العامة المسجلة بالمكتب."}
                        </div>
                      </section>

                      {/* جدول التواثيق والاعتماد النهائي */}
                      <section className="mt-8 pt-4 avoid-break bg-transparent">
                        <h4 className="mb-4 text-[12.5px] font-black text-center" style={{ color: selectedStyle.accent }}>صيغة الاعتماد والموافقة النهائية والتواقيع الرسمي</h4>
                        <table className="w-full border-collapse text-right text-[10px] bg-transparent table-fixed" style={{ border: `2px solid ${selectedStyle.accent}` }}>
                          <thead>
                            <tr className="font-black text-white text-center text-[11.5px]" style={{ backgroundColor: selectedStyle.accent }}>
                              <th className="p-2.5 border-l w-1/2" style={{ borderColor: selectedStyle.accent }}>طرف قبول وتوقيع العميل الأصلي / المفوض نظاماً</th>
                              <th className="p-2.5 w-1/2">اعتماد وختم مقدم الخدمة (المكتب الاستشاري)</th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#123f59]">
                            <tr>
                              <td className="p-3 border-l align-top" style={{ borderColor: `${selectedStyle.accent}44` }}>
                                <div className="flex flex-col gap-2.5">
                                  <div><span className="text-slate-500 font-bold">الاسم الكامل المعتمد:</span> <span className="font-black text-slate-800">{signatureMethod !== "SELF" ? repName : clientNameForPreview}</span></div>
                                  <div><span className="text-slate-500 font-bold">الصفة والتمثيل الكياني:</span> <span className="font-black text-slate-800">{signatureMethod !== "SELF" ? repCapacity : "المالك الفعلي ذو العلاقة"}</span></div>
                                  <div><span className="text-slate-500 font-bold">رقم الهوية الوطنية/الإقامة:</span> <span className="font-mono font-black text-slate-800">{signatureMethod !== "SELF" ? repIdNumber : "............................"}</span></div>
                                  <div><span className="text-slate-500 font-bold">رقم الجوال النشط:</span> <span className="font-mono font-black text-slate-800">{signatureMethod !== "SELF" ? repPhone : "............................"}</span></div>
                                  {signatureMethod !== "SELF" && (
                                    <div><span className="text-slate-500 font-bold">مستند التفويض/الوكالة:</span> <span className="font-mono font-black text-cyan-900">{authDocNumber ? `رقم (${authDocNumber})` : "............................"}</span></div>
                                  )}
                                  <div className="mt-8 text-center text-slate-400 font-bold">التوقيع الشخصي والختم: ........................................</div>
                                </div>
                              </td>
                              <td className="p-3 align-top" style={{ borderColor: `${selectedStyle.accent}44` }}>
                                <div className="flex flex-col gap-2.5">
                                  <div><span className="text-slate-500 font-bold">اسم المنشأة الهندسية:</span> <span className="font-black text-slate-800">شركة ديتيلز كونسولتس للاستشارات الهندسية</span></div>
                                  <div><span className="text-slate-500 font-bold">الإدارة المصدرة للعرض:</span> <span className="font-black text-slate-800">إدارة تطوير الأعمال والمشاريع</span></div>
                                  <div><span className="text-slate-500 font-bold">الموظف المسؤول الفعلي:</span> <span className="font-black text-slate-800">{employeeName || "إدارة الأنظمة والعقود"}</span></div>
                                  <div><span className="text-slate-500 font-bold">رقم الموظف الرقمي:</span> <span className="font-mono text-slate-800">{employeeId}</span></div>
                                  <div className="mt-14 text-center text-slate-400 font-bold">ختم الاعتماد والتوقيع: ........................................</div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </section>

                    </td>
                  </tr>
                </tbody>

                {/* 🌟 الفوتر (يظهر في أسفل جميع صفحات المحتوى) */}
                <tfoot className="table-footer-group">
                  <tr>
                    <td style={{ padding: "20px 60px 40px 60px" }}>
                      <div className="pt-2 text-center border-t-[2.5px]" style={{ borderColor: selectedStyle.accent }}>
                        <div className="flex flex-col items-center gap-1 whitespace-nowrap text-[9px] font-black leading-[1.35] opacity-80" dir="ltr" style={{ color: selectedStyle.accent }}>
                          <span>📍 King Fahd Dist - RIYADH - Kingdom of Saudi Arabia - POSTAL CODE : 12274</span>
                          <span>☎ 0590722827 | N.N: 7052303828 | ✉ info@details-consults.sa</span>
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