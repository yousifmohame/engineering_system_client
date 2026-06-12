import React, { useRef, useState } from "react";
import {
  Eye,
  Printer,
  Edit3,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  ShieldCheck,
  MapPin,
} from "lucide-react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// ==========================================
// 🚀 إعدادات الخلفيات الرسمية (من مجلد public)
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
  Number(value || 0).toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const toArabicDigits = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);
const getDatePart = (formatter, date, type) =>
  formatter.formatToParts(date).find((part) => part.type === type)?.value || "";

const formatDateParts = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime()))
    return { gregorian: value, hijri: value, combined: value };

  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const hijriFormatter = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    { year: "numeric", month: "2-digit", day: "2-digit" },
  );

  const gregorian = toArabicDigits(
    `${getDatePart(gregorianFormatter, date, "day")}/${getDatePart(gregorianFormatter, date, "month")}/${getDatePart(gregorianFormatter, date, "year")}`,
  );
  const hijri = toArabicDigits(
    `${getDatePart(hijriFormatter, date, "day")}/${getDatePart(hijriFormatter, date, "month")}/${getDatePart(hijriFormatter, date, "year")}`,
  );

  return {
    gregorian,
    hijri,
    combined: `ميلادي: ${gregorian} / هجري: ${hijri}`,
  };
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
    subtotal,
    taxAmount,
    grandTotal,
    officeTaxBearing,
    paymentsList = [],
    showQuantity = false,
    plots = [],
    boundaries = [],
    clientType = "فرد",
    employeeName = "",
    employeeId = "SYS-109",
    taxRate,
    acceptedMethods = [],
  } = data || {};

  const isIndividual = clientType.includes("فرد") || clientType === "ورثة";
  const referenceNumber = `QT-${Date.now().toString().slice(-5)}`;

  const calculatedOfficeDiscount = (taxAmount * (officeTaxBearing || 0)) / 100;
  const finalPayable = grandTotal - calculatedOfficeDiscount;

  // أسماء طرق الدفع المعتمدة
  const paymentMethodsLabels = {
    bank: "تحويل بنكي",
    cash: "نقدي بالمقر",
    sadad: "سداد",
  };

  const introText = (() => {
    let intro = `إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات (${transactionType || "الخدمات الهندسية والاستشارية"})`;
    if (showPropertyCode && propertyCodeForPreview)
      intro += ` لقطعة الأرض أو الملف رقم (${propertyCodeForPreview})`;
    if (licenseNumber)
      intro += `، وفقاً لرخصة البناء رقم (${licenseNumber})${licenseYear ? ` لسنة (${licenseYear} هـ)` : ""}`;
    if (serviceNumber)
      intro += ` وموجب الطلب رقم (${serviceNumber})${serviceYear ? ` لسنة (${serviceYear} هـ)` : ""}`;
    intro +=
      "، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة على النحو التالي:";
    return intro;
  })();

  const getItemTotal = (item) =>
    Math.max(
      0,
      Number(item.qty ?? item.quantity ?? 1) *
        Number(item.price ?? item.unitPrice ?? 0) -
        Number(item.discount || 0),
    );

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () =>
    setZoomScale((prev) => Math.max(prev - 0.1, 0.38));
  const handleZoomReset = () => setZoomScale(0.68);

  const handlePrint = () => {
    const node = componentRef.current;
    if (!node) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "-10000px";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    const appStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((s) => s.outerHTML)
      .join("\n");

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
              margin: 0; 
              background: #fff; 
              -webkit-print-color-adjust: exact !important; 
              print-color-adjust: exact !important; 
              font-family: Tajawal, Arial, sans-serif; 
            }
            .print-shell { width: 100%; margin: 0; }
            table.document-table { width: 100%; border-collapse: collapse; border: none; }
            table.document-table > thead { display: table-header-group; } 
            table.document-table > tfoot { display: table-footer-group; } 
            table.document-table > tbody > tr > td { padding: 0px 70px 20px 70px; }
            .avoid-break { page-break-inside: avoid; break-inside: avoid; } 
            .fixed-watermark-right { position: fixed; top: 0; bottom: 0; right: 25px; display: flex; align-items: center; justify-content: center; z-index: -1; }
            .fixed-watermark-left { position: fixed; top: 0; bottom: 0; left: 25px; display: flex; align-items: center; justify-content: center; z-index: -1; }
            .bg-layer {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background-image: ${SECURITY_BACKGROUNDS[bgType].value};
              background-size: 794px 1123px; 
              background-repeat: repeat-y;
              z-index: -2;
            }
            /* جعل جميع خلفيات الجداول والصناديق شفافة للطباعة */
            .bg-transparent-print { background-color: transparent !important; }
          </style>
        </head>
        <body>
          <div class="bg-layer"></div>
          <div class="fixed-watermark-right">
            <span style="transform: rotate(90deg); font-size: 8px; color: rgba(148, 163, 184, 0.8); font-family: monospace; letter-spacing: 2px; white-space: nowrap;">تاريخ ووقت الاستخراج: ${new Date().toLocaleString("ar-SA")}</span>
          </div>
          <div class="fixed-watermark-left">
            <span style="transform: rotate(-90deg); font-size: 8px; color: rgba(148, 163, 184, 0.8); font-family: monospace; letter-spacing: 2px; white-space: nowrap;">رقم مُصدر العرض: ${employeeId} | ENGINE: DETAILS CONSULTANTS SYSTEM</span>
          </div>
          
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
    backgroundImage:
      SECURITY_BACKGROUNDS[bgType].value !== "none"
        ? SECURITY_BACKGROUNDS[bgType].value
        : "none",
    backgroundSize: `${A4_WIDTH_PX}px 1123px`,
    backgroundRepeat: "repeat-y",
    backgroundPosition: "top center",
  };

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-[#e8edf0] shadow-[0_10px_26px_rgba(18,63,89,0.08)]"
      dir="rtl"
    >
      {/* شريط الأدوات العلوي */}
      <div className="shrink-0 border-b border-[#e8ddc8] bg-white px-3 py-2 z-10 shadow-sm">
        <div className="mx-auto max-w-[980px] rounded-[18px] border border-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-2 shadow-[0_4px_12px_rgba(18,63,89,0.04)]">
          <div className="flex min-w-0 items-center justify-between gap-2">
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

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto custom-scrollbar-slim">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-xl border px-2 text-[9px] font-black transition ${isEditMode ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#d8b46a]/25 bg-white text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"}`}
                type="button"
              >
                <IconWithText
                  icon={isEditMode ? Check : Edit3}
                  text={isEditMode ? "حفظ التعديلات" : "تحرير العرض"}
                  iconClassName="h-3.5 w-3.5"
                />
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[#123f59] px-2.5 text-[9px] font-black text-white transition hover:bg-[#0f3448]"
                type="button"
              >
                <IconWithText
                  icon={Printer}
                  text="طباعة المباشرة"
                  iconClassName="h-3.5 w-3.5 text-[#e2bf74]"
                />
              </button>
              <div className="w-px h-5 bg-[#d8b46a]/30 mx-1"></div>
              <button
                onClick={handleZoomOut}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
                type="button"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="inline-flex h-8 min-w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#123f59]">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
                type="button"
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
            className="pdf-page-capture relative overflow-hidden shadow-[0_20px_55px_rgba(18,63,89,0.18)]"
            style={{
              width: `${A4_WIDTH_PX}px`,
              minHeight: `${A4_HEIGHT_PX}px`,
              ...bgStyleConfig,
            }}
          >
            {/* الهوامش الجانبية للـ Preview الشاشة */}
            <div className="absolute top-0 bottom-0 right-[25px] w-6 flex items-center justify-center pointer-events-none z-0 print:hidden">
              <span
                className="text-[8px] text-slate-400/80 font-mono tracking-widest whitespace-nowrap"
                style={{ transform: "rotate(90deg)" }}
              >
                تاريخ ووقت الاستخراج: {new Date().toLocaleString("ar-SA")}
              </span>
            </div>
            <div className="absolute top-0 bottom-0 left-[25px] w-6 flex items-center justify-center pointer-events-none z-0 print:hidden">
              <span
                className="text-[8px] text-slate-400/80 font-mono tracking-widest whitespace-nowrap uppercase"
                style={{ transform: "rotate(-90deg)" }}
              >
                رقم مُصدر العرض: {employeeId} | ENGINE: DETAILS CONSULTANTS
                SYSTEM
              </span>
            </div>

            {/* ========================================== */}
            {/* 🌟 الهيكل السحري: جدول واحد يغلف كل شيء لضمان تكرار الترويسة والفوتر عند الطباعة */}
            {/* ========================================== */}
            <table
              className="document-table"
              style={{
                width: "100%",
                borderCollapse: "collapse",
                border: "none",
              }}
              ref={componentRef}
            >
              {/* الترويسة - تتكرر في كل صفحة */}
              <thead className="table-header-group">
                <tr>
                  <td style={{ padding: "60px 70px 20px 70px" }}>
                    <div
                      className="flex justify-between items-start border-b-[3px] pb-4"
                      style={{ borderColor: selectedStyle.accent }}
                    >
                      {/* الشعار شفاف بالكامل */}
                      <div className="flex h-16 w-48 items-center justify-center bg-transparent">
                        <img
                          src="/logo.jpeg"
                          alt="Details Consulting Engineers"
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="w-[280px]">
                        <table
                          className="w-full text-right border-collapse text-[10px] font-bold border bg-transparent"
                          style={{ borderColor: `${selectedStyle.accent}44` }}
                        >
                          <tbody>
                            <tr>
                              <td
                                className="p-2 border w-[35%] text-[#475569]"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                نوع المستند
                              </td>
                              <td
                                className="p-2 border text-[13px] font-black"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                  color: selectedStyle.accent,
                                }}
                              >
                                عرض سعر خدمات
                              </td>
                            </tr>
                            <tr>
                              <td
                                className="p-2 border text-[#475569]"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                التاريخ
                              </td>
                              <td
                                className="p-2 border text-[9.5px] font-bold text-[#123f59]"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                {issueDateParts.combined}
                              </td>
                            </tr>
                            <tr>
                              <td
                                className="p-2 border text-[#475569]"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                رقم المرجع
                              </td>
                              <td
                                className="p-2 border font-mono text-[12px] font-black text-[#123f59]"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                {referenceNumber}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </td>
                </tr>
              </thead>

              {/* المحتوى الرئيسي المتدفق */}
              <tbody className="table-row-group">
                <tr>
                  <td style={{ padding: "0px 70px 20px 70px" }}>
                    {/* 📄 صفحة الغلاف (تظهر كأول عنصر داخل الـ tbody لتأخذ مساحة صفحة كاملة تقريباً) */}
                    <section className="avoid-break flex flex-col items-center justify-center min-h-[700px] mb-12">
                      <div className="w-full text-center">
                        <div
                          className="border-t-4 border-b-4 py-8 mb-16 mx-10"
                          style={{ borderColor: selectedStyle.accent }}
                        >
                          <h1
                            className="text-4xl font-black mb-4"
                            style={{ color: selectedStyle.accent }}
                          >
                            عرض سعر فني ومالي
                          </h1>
                          <h2 className="text-xl font-bold text-slate-700">
                            {transactionType ||
                              "خدمات هندسية واستشارية استراتيجية"}
                          </h2>
                        </div>

                        <div className="w-full p-8 mt-10">
                          <p className="text-sm font-bold text-slate-500 mb-3">
                            مقدم إلى السادة:
                          </p>
                          <p
                            className="text-3xl font-black mb-10"
                            style={{ color: selectedStyle.accent }}
                          >
                            {clientTitle} / {clientNameForPreview}
                          </p>

                          <div className="grid grid-cols-2 gap-4 text-sm font-bold text-slate-700 border-t border-slate-300 pt-8 mx-12">
                            <div>
                              رقم المرجع:{" "}
                              <span className="font-mono text-slate-900 font-black">
                                {referenceNumber}
                              </span>
                            </div>
                            <div>
                              التاريخ:{" "}
                              <span className="font-mono text-slate-900">
                                {issueDateParts.gregorian}
                              </span>
                            </div>
                            {propertyCodeForPreview && (
                              <div className="col-span-2 mt-2">
                                المشروع/الملكية:{" "}
                                <span className="font-mono text-slate-900 font-black">
                                  {propertyCodeForPreview}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* 📄 المقدمة */}
                    <section className="mb-6 avoid-break bg-transparent">
                      <h4
                        className="mb-2 text-[14px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        السادة / {clientTitle || "المواطن"}{" "}
                        {clientNameForPreview || "عميل غير محدد"}
                      </h4>
                      {showClientCode && clientCodeForPreview && (
                        <p className="mb-3 text-[11px] font-bold text-[#94a3b8]">
                          رقم العميل: {clientCodeForPreview}
                        </p>
                      )}
                      <p
                        className="mb-3 text-[13px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        السلام عليكم ورحمة الله وبركاته ،،،
                      </p>
                      <div
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        style={{
                          letterSpacing: "0px",
                          wordSpacing: "0px",
                          lineHeight: "26px",
                          fontSize: "12px",
                          whiteSpace: "pre-wrap",
                          direction: "rtl",
                          background: "transparent",
                        }}
                        className={`text-right font-bold text-[#475569] ${isEditMode ? "rounded-xl border border-dashed border-amber-300 p-3 outline-none" : ""}`}
                      >
                        {introText}
                      </div>
                    </section>

                    {/* 📄 بيانات القطع والمخطط التنظيمي (الجدول الجديد بدلاً من النص) */}
                    {plots && plots.length > 0 && (
                      <section className="mb-6 avoid-break bg-transparent">
                        <div
                          className="mb-3 flex items-center gap-2 text-[14px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          <MapPin className="h-5 w-5 text-[#c5983c]" /> بيانات
                          القطع والمخطط التنظيمي
                        </div>
                        <table
                          className="w-full border-collapse text-center text-[10px] bg-transparent"
                          style={{
                            border: `1px solid ${selectedStyle.accent}`,
                          }}
                        >
                          <thead>
                            <tr
                              className="font-black text-white"
                              style={{ backgroundColor: selectedStyle.accent }}
                            >
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                القطعة
                              </th>
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                المساحة
                              </th>
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                شمالاً
                              </th>
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                جنوباً
                              </th>
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                شرقاً
                              </th>
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                غرباً
                              </th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#123f59]">
                            {plots.map((plot) => {
                              const n = boundaries.find(
                                (b) =>
                                  b.direction === "شمال" &&
                                  b.plotId === plot.id,
                              );
                              const s = boundaries.find(
                                (b) =>
                                  b.direction === "جنوب" &&
                                  b.plotId === plot.id,
                              );
                              const e = boundaries.find(
                                (b) =>
                                  b.direction === "شرق" && b.plotId === plot.id,
                              );
                              const w = boundaries.find(
                                (b) =>
                                  b.direction === "غرب" && b.plotId === plot.id,
                              );
                              return (
                                <tr key={plot.id}>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {plot.plotNumber || "---"}
                                  </td>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {plot.area || "---"} م²
                                  </td>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {n?.length || 0} م
                                  </td>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {s?.length || 0} م
                                  </td>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {e?.length || 0} م
                                  </td>
                                  <td
                                    className="p-2 border font-mono"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {w?.length || 0} م
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </section>
                    )}

                    {/* 📄 نطاق العمل والتكاليف */}
                    <section className="mb-6 bg-transparent">
                      <div
                        className="mb-3 flex items-center gap-2 text-[14px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        <FileText className="h-5 w-5 text-[#c5983c]" /> نطاق
                        العمل والتكاليف
                      </div>

                      <table
                        className="w-full border-collapse text-center text-[11px] bg-transparent"
                        style={{ border: `1px solid ${selectedStyle.accent}` }}
                      >
                        <thead>
                          <tr
                            className="font-black text-white avoid-break"
                            style={{ backgroundColor: selectedStyle.accent }}
                          >
                            <th
                              className="w-8 p-3 border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              م
                            </th>
                            <th
                              className="p-3 text-right border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              الوصف
                            </th>
                            {showQuantity && (
                              <th
                                className="w-16 p-3 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                الكمية
                              </th>
                            )}
                            <th
                              className="w-24 p-3 border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              السعر
                            </th>
                            <th
                              className="w-28 p-3 border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              الإجمالي
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-bold text-[#123f59]">
                          {items.length === 0 ? (
                            <tr>
                              <td
                                colSpan={showQuantity ? "5" : "4"}
                                className="p-6 text-center text-[#94a3b8]"
                              >
                                لا توجد بنود مسجلة
                              </td>
                            </tr>
                          ) : (
                            items.map((item, index) => (
                              <tr
                                key={item.id || index}
                                className="avoid-break"
                              >
                                <td
                                  className="p-2.5 font-mono border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {index + 1}
                                </td>
                                <td
                                  className="p-2.5 text-right leading-[1.6] border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {item.title}
                                </td>
                                {showQuantity && (
                                  <td
                                    className="p-2.5 font-mono border"
                                    style={{
                                      borderColor: `${selectedStyle.accent}44`,
                                    }}
                                  >
                                    {item.qty || item.quantity || 1} {item.unit}
                                  </td>
                                )}
                                <td
                                  className="p-2.5 font-mono border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {formatCurrency(item.price || item.unitPrice)}
                                </td>
                                <td
                                  className="p-2.5 font-mono font-black border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                    color: selectedStyle.accent,
                                  }}
                                >
                                  {formatCurrency(getItemTotal(item))}
                                </td>
                              </tr>
                            ))
                          )}

                          {/* الإجماليات */}
                          <tr className="avoid-break bg-transparent">
                            <td
                              colSpan={showQuantity ? "4" : "3"}
                              className="p-3 text-left font-black border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              الإجمالي قبل الضريبة
                            </td>
                            <td
                              className="p-3 font-mono font-black text-[12px] border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              {formatCurrency(subtotal)}
                            </td>
                          </tr>
                          <tr className="avoid-break bg-transparent">
                            <td
                              colSpan={showQuantity ? "4" : "3"}
                              className="p-3 text-left font-bold text-[#64748b] border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              ضريبة القيمة المضافة {taxRate || 0}%{" "}
                              {officeTaxBearing > 0
                                ? ` - يتحمل المكتب ${officeTaxBearing}%`
                                : ""}
                            </td>
                            <td
                              className="p-3 font-mono font-bold text-[12px] border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              {formatCurrency(taxAmount)}
                            </td>
                          </tr>
                          {officeTaxBearing > 0 && (
                            <tr className="avoid-break bg-transparent text-emerald-700">
                              <td
                                colSpan={showQuantity ? "4" : "3"}
                                className="p-3 text-left font-bold border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                خصم (مقدم الخدمة يتحمل {officeTaxBearing}% من
                                قيمة الضريبة)
                              </td>
                              <td
                                className="p-3 font-mono font-black text-[12px] border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                - {formatCurrency(calculatedOfficeDiscount)}
                              </td>
                            </tr>
                          )}
                          <tr
                            className="font-black text-white avoid-break"
                            style={{ backgroundColor: selectedStyle.accent }}
                          >
                            <td
                              colSpan={showQuantity ? "4" : "3"}
                              className="p-3 text-left text-[14px] border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              الإجمالي النهائي المستحق
                            </td>
                            <td
                              className="p-3 font-mono text-[14px] border"
                              style={{ borderColor: selectedStyle.accent }}
                            >
                              {formatCurrency(finalPayable)} ر.س
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </section>

                    {/* 📄 الدفعات */}
                    {paymentsList.length > 0 && (
                      <section className="mb-6 avoid-break bg-transparent">
                        <h4
                          className="mb-3 text-[14px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          جدول الدفعات:
                        </h4>
                        <table
                          className="w-full border-collapse text-center text-[10px] bg-transparent"
                          style={{
                            border: `1px solid ${selectedStyle.accent}`,
                          }}
                        >
                          <thead>
                            <tr
                              className="font-black text-white"
                              style={{ backgroundColor: selectedStyle.accent }}
                            >
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                الدفعة
                              </th>
                              <th
                                className="p-2 border"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                المبلغ
                              </th>
                              <th
                                className="p-2 border w-1/2"
                                style={{ borderColor: selectedStyle.accent }}
                              >
                                شرط الاستحقاق
                              </th>
                            </tr>
                          </thead>
                          <tbody className="font-bold text-[#123f59]">
                            {paymentsList.map((payment, index) => (
                              <tr key={payment.id || index}>
                                <td
                                  className="p-2 border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {payment.label || `الدفعة ${index + 1}`}
                                </td>
                                <td
                                  className="p-2 font-mono border"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {formatCurrency(payment.amount)} ر.س
                                </td>
                                <td
                                  className="p-2 border text-[#64748b]"
                                  style={{
                                    borderColor: `${selectedStyle.accent}44`,
                                  }}
                                >
                                  {payment.condition || "حسب الاتفاق"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {acceptedMethods.length > 0 && (
                          <div className="mt-3 text-[10px] font-bold text-[#475569] flex gap-2 items-center">
                            <span>طرق الدفع المعتمدة:</span>
                            {acceptedMethods.map((m) => (
                              <span
                                key={m}
                                className="px-2 py-0.5 border rounded"
                                style={{
                                  borderColor: `${selectedStyle.accent}44`,
                                }}
                              >
                                {m === "bank"
                                  ? "تحويل بنكي"
                                  : m === "cash"
                                    ? "نقدي"
                                    : "سداد"}
                              </span>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                    {/* 📄 الشروط والأحكام */}
                    <section className="mb-10 avoid-break bg-transparent">
                      <h4
                        className="mb-3 text-[14px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        الشروط والأحكام:
                      </h4>
                      <div
                        contentEditable={isEditMode}
                        suppressContentEditableWarning
                        style={{
                          letterSpacing: "0px",
                          wordSpacing: "0px",
                          lineHeight: "26px",
                          fontSize: "11px",
                          whiteSpace: "pre-wrap",
                          direction: "rtl",
                          background: "transparent",
                        }}
                        className={`text-right font-bold text-[#475569] ${isEditMode ? "rounded-xl border border-dashed border-amber-300 p-3 outline-none" : ""}`}
                      >
                        {termsText || "لم يتم إدراج شروط وأحكام."}
                      </div>
                    </section>

                    {/* 📄 التواقيع */}
                    <section className="mt-8 pt-8 avoid-break bg-transparent">
                      <div className="grid grid-cols-2 gap-8 text-center mb-10">
                        <div>
                          <p
                            className="mb-6 text-[12px] font-black"
                            style={{ color: selectedStyle.accent }}
                          >
                            {isIndividual
                              ? "توقيع العميل / المالك"
                              : "توقيع المفوض عن العميل"}
                          </p>
                          {!isIndividual && (
                            <div className="mb-6 text-[10px] text-[#475569] flex flex-col gap-2 items-center">
                              <div className="flex gap-1.5 items-center">
                                الصفة:{" "}
                                <span
                                  contentEditable={isEditMode}
                                  suppressContentEditableWarning
                                  className={`inline-block min-w-[100px] border-b border-dashed border-slate-300 ${isEditMode ? "bg-amber-50 outline-none" : ""}`}
                                ></span>
                              </div>
                              <div className="flex gap-1.5 items-center">
                                نوع التفويض:{" "}
                                <span
                                  contentEditable={isEditMode}
                                  suppressContentEditableWarning
                                  className={`inline-block min-w-[100px] border-b border-dashed border-slate-300 ${isEditMode ? "bg-amber-50 outline-none" : ""}`}
                                ></span>
                              </div>
                            </div>
                          )}
                          {isIndividual && <div className="mb-12"></div>}
                          <div className="mx-auto w-3/4 border-b-2 border-dashed border-[#d8b46a]/60" />
                        </div>
                        <div className="flex flex-col items-center">
                          <p
                            className="mb-2 text-[12px] font-black flex items-center gap-2"
                            style={{ color: selectedStyle.accent }}
                          >
                            توقيع وختم مقدم الخدمة
                          </p>
                          <p className="mb-8 text-[10px] font-bold text-[#475569]">
                            (شركة ديتيلز كونسولتس للاستشارات الهندسية)
                          </p>
                          <div className="mb-2"></div>
                          <div className="mx-auto w-3/4 border-b-2 border-dashed border-[#d8b46a]/60" />
                        </div>
                      </div>

                      <div className="text-center mt-6 pt-6 border-t border-slate-300/50">
                        <p
                          className="mb-6 text-[12px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          ممثل الخدمة (الموظف)
                        </p>
                        <div className="mb-6 text-[10px] text-[#475569] flex gap-6 justify-center">
                          <div className="flex gap-1.5 items-center">
                            الاسم:{" "}
                            <span
                              contentEditable={isEditMode}
                              suppressContentEditableWarning
                              className={`inline-block min-w-[140px] border-b border-dashed border-slate-400 font-bold ${isEditMode ? "bg-amber-50 outline-none" : ""}`}
                            >
                              {employeeName}
                            </span>
                          </div>
                          <div className="flex gap-1.5 items-center">
                            الصفة:{" "}
                            <span
                              contentEditable={isEditMode}
                              suppressContentEditableWarning
                              className={`inline-block min-w-[120px] border-b border-dashed border-slate-400 font-bold ${isEditMode ? "bg-amber-50 outline-none" : ""}`}
                            >
                              مُعد العرض
                            </span>
                          </div>
                        </div>
                        <div className="mx-auto w-1/3 border-b-2 border-dashed border-[#d8b46a]/60" />
                      </div>
                    </section>
                  </td>
                </tr>
              </tbody>

              <tfoot className="table-footer-group">
                <tr>
                  <td style={{ padding: "20px 60px 40px 60px" }}>
                    <div
                      className="pt-2 text-center border-t-[2.5px]"
                      style={{ borderColor: selectedStyle.accent }}
                    >
                      <div
                        className="flex flex-col items-center gap-1 whitespace-nowrap text-[9px] font-black leading-[1.35] opacity-80"
                        dir="ltr"
                        style={{ color: selectedStyle.accent }}
                      >
                        <span>
                          📍 King Fahd Dist - RIYADH - Kingdom of Saudi Arabia -
                          POSTAL CODE : 12274
                        </span>
                        <span>
                          ☎ 0590722827 | N.N: 7052303828 | ✉
                          info@details-consults.sa
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
