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
} from "lucide-react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// ==========================================
// 🚀 إعدادات الخلفيات الرسمية (من مجلد public)
// ==========================================
const SECURITY_BACKGROUNDS = {
  none: {
    label: "بدون (سادة)",
    value: "none",
  },
  official1: {
    label: "خلفية رسمية 1 (الذهبية)",
    // 👈 استبدل bg1.png باسم صورتك الحقيقية الموجودة في مجلد public
    value: "url('/safe_background/1.png')",
  },
  official2: {
    label: "خلفية رسمية 2",
    // 👈 استبدل bg2.png باسم صورتك الحقيقية
    value: "url('/safe_background/2.png')",
  },
  official3: {
    label: "خلفية رسمية 3",
    // 👈 استبدل bg3.png باسم صورتك الحقيقية
    value: "url('/safe_background/3.png')",
  },
};

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
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
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

const previewStyles = {
  classic: {
    label: "كلاسيكي",
    accent: "#123f59",
    gold: "#c5983c",
    paper: "#ffffff",
  },
  teal: {
    label: "تركواز",
    accent: "#0e7490",
    gold: "#d8b46a",
    paper: "#ffffff",
  },
  emerald: {
    label: "أخضر",
    accent: "#0f766e",
    gold: "#c5983c",
    paper: "#ffffff",
  },
  graphite: {
    label: "رسمي داكن",
    accent: "#1f2937",
    gold: "#b0893c",
    paper: "#fffdf7",
  },
};

const formatCurrency = (value) => {
  const numeric = Number(value || 0);
  return numeric.toLocaleString("ar-SA", {
    minimumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

const toArabicDigits = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => "٠١٢٣٤٥٦٧٨٩"[Number(digit)]);

const getDatePart = (formatter, date, type) =>
  formatter.formatToParts(date).find((part) => part.type === type)?.value || "";

const formatDateParts = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    const fallback = String(value || "");
    return {
      gregorian: fallback,
      hijri: fallback,
      combined: `ميلادي: ${fallback} / هجري: ${fallback}`,
    };
  }
  const gregorianFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-gregory", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const hijriFormatter = new Intl.DateTimeFormat(
    "ar-SA-u-ca-islamic-umalqura",
    { year: "numeric", month: "2-digit", day: "2-digit" },
  );

  const gregorianDay = getDatePart(gregorianFormatter, date, "day");
  const gregorianMonth = getDatePart(gregorianFormatter, date, "month");
  const gregorianYear = getDatePart(gregorianFormatter, date, "year");
  const hijriDay = getDatePart(hijriFormatter, date, "day");
  const hijriMonth = getDatePart(hijriFormatter, date, "month");
  const hijriYear = getDatePart(hijriFormatter, date, "year");

  const gregorian = toArabicDigits(
    `${gregorianDay}/${gregorianMonth}/${gregorianYear}`,
  );
  const hijri = toArabicDigits(`${hijriDay}/${hijriMonth}/${hijriYear}`);

  return {
    gregorian,
    hijri,
    combined: `ميلادي: ${gregorian} / هجري: ${hijri}`,
  };
};

const DetailsFooter = ({ accent = "#0f5570" }) => {
  return (
    <footer
      className="absolute bottom-[25px] left-[60px] right-[60px] bg-transparent font-[Tajawal]"
      dir="ltr"
    >
      {/* تم إزالة الخط العلوي للفوتر حتى لا يتعارض مع تصميم الصورة الخاصة بك */}
      <div className="pt-1.5 text-center">
        <div
          className="flex flex-col items-center gap-1 whitespace-nowrap text-[9px] font-black leading-[1.35] opacity-80"
          dir="ltr"
          style={{ color: accent }}
        >
          <span>
            📍 King Fahd Dist - RIYADH - Kingdom of Saudi Arabia - POSTAL CODE :
            12274
          </span>
          <span>
            ☎ 0590722827 | N.N: 7052303828 | ✉ info@details-consults.sa
          </span>
        </div>
      </div>
    </footer>
  );
};

export const LivePreview = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.68);
  const [bgType, setBgType] = useState("official1"); // 👈 جعلنا الصورة الأولى هي الافتراضية
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
    taxRate,
    taxAmount,
    grandTotal,
    officeTaxBearing,
    paymentsList = [],
    showMissingDocs,
    missingDocs,
    showQuantity = false,
    plots = [],
    boundaries = [],
    clientType = "فرد",
    employeeName = "",
    employeeId = "SYS-109",
  } = data || {};

  const isIndividual = clientType.includes("فرد") || clientType === "ورثة";
  const referenceNumber = `QT-${Date.now().toString().slice(-5)}`;

  const introText = (() => {
    let intro = `إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات (${transactionType || "الخدمات الهندسية والاستشارية"})`;

    if (showPropertyCode && propertyCodeForPreview) {
      intro += ` لقطعة الأرض أو الملف رقم (${propertyCodeForPreview})`;
    }
    if (licenseNumber) {
      intro += `، وفقاً لرخصة البناء رقم (${licenseNumber})${licenseYear ? ` لسنة (${licenseYear} هـ)` : ""}`;
    }
    if (serviceNumber) {
      intro += ` وموجب الطلب رقم (${serviceNumber})${serviceYear ? ` لسنة (${serviceYear} هـ)` : ""}`;
    }

    if (plots && plots.length > 0) {
      intro += `، وتفاصيل المخطط التنظيمي كالتالي: `;
      const plotTexts = plots.map((plot) => {
        let pt = `القطعة رقم (${plot.plotNumber || "---"}) بمساحة إجمالية قدرها (${plot.area || "---"} م²)`;

        const n =
          boundaries.find((b) => b.direction === "شمال" && b.plotId === plot.id)
            ?.length || 0;
        const s =
          boundaries.find((b) => b.direction === "جنوب" && b.plotId === plot.id)
            ?.length || 0;
        const e =
          boundaries.find((b) => b.direction === "شرق" && b.plotId === plot.id)
            ?.length || 0;
        const w =
          boundaries.find((b) => b.direction === "غرب" && b.plotId === plot.id)
            ?.length || 0;

        if (n || s || e || w) {
          pt += `، ويحدها (شمالاً: ${n}م، جنوباً: ${s}م، شرقاً: ${e}م، غرباً: ${w}م)`;
        }
        return pt;
      });
      intro += plotTexts.join(" | ") + `،`;
    }

    intro +=
      " فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة على النحو التالي:";
    return intro;
  })();

  const getItemTotal = (item) => {
    const qty = Number(item.qty ?? item.quantity ?? 1);
    const price = Number(item.price ?? item.unitPrice ?? 0);
    const discount = Number(item.discount || 0);
    return Math.max(0, qty * price - discount);
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () =>
    setZoomScale((prev) => Math.max(prev - 0.1, 0.38));
  const handleZoomReset = () => setZoomScale(0.68);

  const handlePrint = () => {
    const node = componentRef.current;
    if (!node) return;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "print-quotation-preview");
    iframe.style.position = "fixed";
    iframe.style.left = "-10000px";
    iframe.style.top = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const iframeWindow = iframe.contentWindow;
    const iframeDocument = iframeWindow.document;

    const appStyles = Array.from(
      document.querySelectorAll('link[rel="stylesheet"], style'),
    )
      .map((styleNode) => styleNode.outerHTML)
      .join("\n");

    iframeDocument.open();
    iframeDocument.write(`
      <!doctype html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>${referenceNumber}</title>
          ${appStyles}
          <style>
            @page { size: A4; margin: 0; }
            html, body {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: Tajawal, Arial, sans-serif;
            }
            .print-shell { width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; }
            .print-area { width: 210mm !important; min-height: 297mm !important; margin: 0 !important; box-shadow: none !important; transform: none !important; overflow: visible !important; }
          </style>
        </head>
        <body>
          <div class="print-shell">${node.outerHTML}</div>
        </body>
      </html>
    `);
    iframeDocument.close();

    const images = Array.from(iframeDocument.images || []);
    Promise.all(
      images.map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }),
    ).then(() => {
      setTimeout(() => {
        iframeWindow.focus();
        iframeWindow.print();
        setTimeout(() => document.body.removeChild(iframe), 700);
      }, 250);
    });
  };

  const scaledWidth = Math.round(A4_WIDTH_PX * zoomScale);
  const scaledHeight = Math.round(A4_HEIGHT_PX * zoomScale);

  return (
    <section
      className="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[24px] border border-[#d8b46a]/25 bg-white/90 shadow-[0_10px_26px_rgba(18,63,89,0.08)] backdrop-blur-xl"
      dir="rtl"
    >
      <div className="shrink-0 border-b border-[#e8ddc8] bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white px-3 py-2">
        <div className="mx-auto max-w-[980px] rounded-[18px] border border-[#d8b46a]/25 bg-white/95 p-2 shadow-[0_8px_18px_rgba(18,63,89,0.08)] backdrop-blur-xl">
          <div className="flex min-w-0 items-center justify-between gap-2">
            {/* 👈 أداة التحكم بالخلفية */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#fbf8f1] border border-[#d8b46a]/25 rounded-xl">
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
                className={`inline-flex h-8 shrink-0 items-center justify-center rounded-xl border px-2 text-[9px] font-black transition ${isEditMode ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#d8b46a]/25 bg-[#fbf8f1] text-[#64748b] hover:bg-white hover:text-[#123f59]"}`}
                type="button"
              >
                <IconWithText
                  icon={isEditMode ? Check : Edit3}
                  text={isEditMode ? "حفظ التعديلات" : "تحرير العرض"}
                  iconClassName="h-3.5 w-3.5"
                  textClassName="text-[9px] font-black leading-none"
                />
              </button>
              <button
                onClick={handlePrint}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl bg-[#123f59] px-2.5 text-[9px] font-black text-white transition hover:bg-[#0f3448]"
                type="button"
              >
                <IconWithText
                  icon={Printer}
                  text="طباعة"
                  iconClassName="h-3.5 w-3.5 text-[#e2bf74]"
                  textClassName="text-[9px] font-black leading-none"
                />
              </button>
              <button
                onClick={handleZoomOut}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#64748b] transition hover:bg-white hover:text-[#123f59]"
                type="button"
              >
                <IconWithText
                  icon={ZoomOut}
                  text="تصغير"
                  iconClassName="h-3.5 w-3.5"
                  textClassName="text-[9px] font-black leading-none"
                />
              </button>
              <span className="inline-flex h-8 min-w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#123f59]">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#64748b] transition hover:bg-white hover:text-[#123f59]"
                type="button"
              >
                <IconWithText
                  icon={ZoomIn}
                  text="تكبير"
                  iconClassName="h-3.5 w-3.5"
                  textClassName="text-[9px] font-black leading-none"
                />
              </button>
              <button
                onClick={handleZoomReset}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#c5983c] transition hover:bg-white hover:text-[#123f59]"
                type="button"
              >
                <IconWithText
                  icon={RotateCcw}
                  text="إعادة"
                  iconClassName="h-3.5 w-3.5"
                  textClassName="text-[9px] font-black leading-none"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#e8edf0] p-4 pb-12 custom-scrollbar-slim">
        <div className="mx-auto flex justify-center">
          <div
            className="relative"
            style={{
              width: `${scaledWidth}px`,
              minHeight: `${scaledHeight}px`,
            }}
          >
            <div
              className="absolute right-0 top-0 origin-top-right transition-transform duration-200 ease-out"
              style={{
                transform: `scale(${zoomScale})`,
                width: `${A4_WIDTH_PX}px`,
              }}
            >
              {/* 🚀 إعدادات الحاوية الرئيسية والصورة */}
              <div
                id="quotation-preview-container"
                ref={componentRef}
                className="pdf-page-capture print-area relative overflow-hidden shadow-[0_20px_55px_rgba(18,63,89,0.18)]"
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  minHeight: `${A4_HEIGHT_PX}px`,
                  // 👈 زدت الهوامش (padding) لتتفادى الإطار الذهبي الخاص بالصورة المرفوعة
                  padding: "100px 70px 100px 70px",
                  backgroundColor: selectedStyle.paper,
                  backgroundImage:
                    SECURITY_BACKGROUNDS[bgType].value !== "none"
                      ? SECURITY_BACKGROUNDS[bgType].value
                      : "none",
                  backgroundSize: "100% 100%", // 👈 لضمان تمدد الصورة لتغطي الصفحة كاملة من الحافة للحافة
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  color: "#123f59",
                  boxSizing: "border-box",
                  textRendering: "geometricPrecision",
                }}
                dir="rtl"
              >
                {/* الهوامش الجانبية (Watermarks) */}
                <div className="absolute top-0 bottom-0 right-[25px] w-6 flex items-center justify-center pointer-events-none">
                  <span
                    className="text-[8px] text-slate-400/80 font-mono tracking-widest whitespace-nowrap"
                    style={{ transform: "rotate(90deg)" }}
                  >
                    تاريخ ووقت الاستخراج: {new Date().toLocaleString("ar-SA")}
                  </span>
                </div>
                <div className="absolute top-0 bottom-0 left-[25px] w-6 flex items-center justify-center pointer-events-none">
                  <span
                    className="text-[8px] text-slate-400/80 font-mono tracking-widest whitespace-nowrap uppercase"
                    style={{ transform: "rotate(-90deg)" }}
                  >
                    رقم مُصدر العرض: {employeeId} | ENGINE: DETAILS CONSULTANTS
                    SYSTEM
                  </span>
                </div>

                <header className="mb-6 flex justify-between items-start pb-4 relative z-10">
                  <div className="flex h-16 w-48 items-center justify-center bg-white/70 backdrop-blur-sm rounded-xl p-2 border border-[#d8b46a]/20">
                    <img
                      src="/logo.jpeg"
                      alt="Details Consulting Engineers"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="w-[280px]">
                    <table
                      className="w-full text-right border-collapse text-[10px] font-bold border bg-white/70 backdrop-blur-sm"
                      style={{ borderColor: `${selectedStyle.accent}44` }}
                    >
                      <tbody>
                        <tr>
                          <td
                            className="p-2 border w-[35%] text-[#475569]"
                            style={{ borderColor: `${selectedStyle.accent}44` }}
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
                            style={{ borderColor: `${selectedStyle.accent}44` }}
                          >
                            التاريخ
                          </td>
                          <td
                            className="p-2 border text-[9.5px] font-bold text-[#123f59]"
                            style={{ borderColor: `${selectedStyle.accent}44` }}
                          >
                            {issueDateParts.combined}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="p-2 border text-[#475569]"
                            style={{ borderColor: `${selectedStyle.accent}44` }}
                          >
                            رقم المرجع
                          </td>
                          <td
                            className="p-2 border font-mono text-[12px] font-black text-[#123f59]"
                            style={{ borderColor: `${selectedStyle.accent}44` }}
                          >
                            {referenceNumber}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </header>

                <main className="relative z-10 bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/50">
                  <section className="mb-6">
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
                      style={{ letterSpacing: "normal", wordSpacing: "normal" }}
                      className={`text-right text-[12px] font-bold leading-[1.8] text-[#475569] ${isEditMode ? "rounded-xl border border-dashed border-amber-300 bg-amber-50/90 p-2 outline-none" : ""}`}
                    >
                      {introText}
                    </div>
                  </section>

                  <section className="mb-6">
                    <div
                      className="mb-3 flex items-center gap-2 text-[14px] font-black"
                      style={{ color: selectedStyle.accent }}
                    >
                      <FileText className="h-5 w-5 text-[#c5983c]" />
                      نطاق العمل والتكاليف
                    </div>

                    <table
                      className="w-full border-collapse text-center text-[11px] bg-white/70 backdrop-blur-sm"
                      style={{ border: `1px solid ${selectedStyle.accent}` }}
                    >
                      <thead>
                        <tr
                          className="font-black text-white"
                          style={{ backgroundColor: selectedStyle.accent }}
                        >
                          <th
                            className="w-8 p-3"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            م
                          </th>
                          <th
                            className="p-3 text-right"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            الوصف
                          </th>
                          {showQuantity && (
                            <th
                              className="w-16 p-3"
                              style={{
                                border: `1px solid ${selectedStyle.accent}`,
                              }}
                            >
                              الكمية
                            </th>
                          )}
                          <th
                            className="w-24 p-3"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            السعر
                          </th>
                          <th
                            className="w-28 p-3"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
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
                            <tr key={item.id || index}>
                              <td
                                className="p-2.5 font-mono"
                                style={{
                                  border: `1px solid ${selectedStyle.accent}33`,
                                }}
                              >
                                {index + 1}
                              </td>
                              <td
                                className="p-2.5 text-right leading-[1.6]"
                                style={{
                                  border: `1px solid ${selectedStyle.accent}33`,
                                }}
                              >
                                {item.title}
                              </td>
                              {showQuantity && (
                                <td
                                  className="p-2.5 font-mono"
                                  style={{
                                    border: `1px solid ${selectedStyle.accent}33`,
                                  }}
                                >
                                  {item.qty || item.quantity || 1} {item.unit}
                                </td>
                              )}
                              <td
                                className="p-2.5 font-mono"
                                style={{
                                  border: `1px solid ${selectedStyle.accent}33`,
                                }}
                              >
                                {formatCurrency(item.price || item.unitPrice)}
                              </td>
                              <td
                                className="p-2.5 font-mono font-black"
                                style={{
                                  border: `1px solid ${selectedStyle.accent}33`,
                                  color: selectedStyle.accent,
                                }}
                              >
                                {formatCurrency(getItemTotal(item))}
                              </td>
                            </tr>
                          ))
                        )}
                        <tr>
                          <td
                            colSpan={showQuantity ? "4" : "3"}
                            className="p-3 text-left font-black"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            الإجمالي قبل الضريبة
                          </td>
                          <td
                            className="p-3 font-mono font-black text-[12px]"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>
                        <tr>
                          <td
                            colSpan={showQuantity ? "4" : "3"}
                            className="p-3 text-left font-bold text-[#64748b]"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            ضريبة القيمة المضافة {taxRate || 0}%{" "}
                            {officeTaxBearing > 0
                              ? ` - يتحمل المكتب ${officeTaxBearing}%`
                              : ""}
                          </td>
                          <td
                            className="p-3 font-mono font-bold text-[12px]"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            {formatCurrency(taxAmount)}
                          </td>
                        </tr>
                        <tr
                          className="font-black text-white"
                          style={{ backgroundColor: selectedStyle.accent }}
                        >
                          <td
                            colSpan={showQuantity ? "4" : "3"}
                            className="p-3 text-left text-[14px]"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            الإجمالي شامل ضريبة القيمة المضافة
                          </td>
                          <td
                            className="p-3 font-mono text-[14px]"
                            style={{
                              border: `1px solid ${selectedStyle.accent}`,
                            }}
                          >
                            {formatCurrency(grandTotal)} ر.س
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {paymentsList.length > 0 && (
                    <section className="mb-6">
                      <h4
                        className="mb-3 text-[14px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        الدفعات:
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {paymentsList.map((payment, index) => (
                          <div
                            key={payment.id || index}
                            className="rounded-xl border border-[#d8b46a]/25 bg-white/70 backdrop-blur-sm p-3 text-[11px] font-bold text-[#475569]"
                          >
                            <div className="flex justify-between gap-2">
                              <span className="font-black text-[#123f59]">
                                {payment.label || `الدفعة ${index + 1}`}
                              </span>
                              <span className="font-mono text-[#c5983c] font-black">
                                {formatCurrency(payment.amount)} ر.س
                              </span>
                            </div>
                            <div className="mt-1.5 text-[#64748b]">
                              {payment.condition || "حسب الاتفاق"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mb-12">
                    <h4
                      className="mb-3 text-[14px] font-black"
                      style={{ color: selectedStyle.accent }}
                    >
                      الشروط والأحكام:
                    </h4>
                    <div
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      style={{ letterSpacing: "normal", wordSpacing: "normal" }}
                      className={`whitespace-pre-line text-right text-[11px] font-bold leading-[1.8] text-[#475569] ${isEditMode ? "rounded-xl border border-dashed border-amber-300 bg-amber-50/90 p-2 outline-none" : ""}`}
                    >
                      {termsText || "لم يتم إدراج شروط وأحكام."}
                    </div>
                  </section>

                  <section
                    className="mt-12"
                    style={{ pageBreakInside: "avoid" }}
                  >
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
                      <div>
                        <p
                          className="mb-2 text-[12px] font-black"
                          style={{ color: selectedStyle.accent }}
                        >
                          توقيع وختم مقدم الخدمة
                        </p>
                        <p className="mb-8 text-[10px] font-bold text-[#475569]">
                          المكتب الهندسي شركة ديتيلز كونسولتس للاستشارات
                          الهندسية
                        </p>
                        <div className="mb-2"></div>
                        <div className="mx-auto w-3/4 border-b-2 border-dashed border-[#d8b46a]/60" />
                      </div>
                    </div>
                    <div className="text-center mt-6 pt-6 border-t border-slate-200">
                      <p
                        className="mb-6 text-[12px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        ممثل الخدمة
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
                </main>
                <DetailsFooter accent={selectedStyle.accent} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
