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
  Building2,
} from "lucide-react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

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

  const hijriFormatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const gregorianDay = getDatePart(gregorianFormatter, date, "day");
  const gregorianMonth = getDatePart(gregorianFormatter, date, "month");
  const gregorianYear = getDatePart(gregorianFormatter, date, "year");

  const hijriDay = getDatePart(hijriFormatter, date, "day");
  const hijriMonth = getDatePart(hijriFormatter, date, "month");
  const hijriYear = getDatePart(hijriFormatter, date, "year");

  const gregorian = toArabicDigits(`${gregorianDay}/${gregorianMonth}/${gregorianYear}`);
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
      className="
        absolute bottom-[7mm] left-[10mm] right-[10mm]
        bg-white font-[Tajawal]
      "
      dir="ltr"
    >
      <div className="border-t-[2.5px] pt-1.5" style={{ borderColor: accent }}>
        <div className="flex items-start gap-2" style={{ color: accent }}>
          <img
            src="/qrcode.png"
            alt="QR Code"
            className="h-[16mm] w-[16mm] shrink-0 object-contain"
          />

          <div className="min-w-0 flex-1">
            <div
              className="
                flex items-center justify-end gap-1 whitespace-nowrap
                text-[10.5px] font-black leading-[1.35]
              "
              dir="rtl"
            >
              <span>📍</span>
              <span>
                حي الملك فهد - الرياض - المملكة العربية السعودية - الرمز البريدي : ١٢٢٧٤
              </span>
              <span>·</span>
              <span>جوال : ٠٥٩٠٧٢٢٨٢٧</span>
              <span>·</span>
              <span>الرقم الوطني الموحد : ٧٠٥٢٣٠٣٨٢٨</span>
            </div>

            <div
              className="
                mt-0.5 flex items-center gap-1 whitespace-nowrap
                text-[10.5px] font-black leading-[1.35]
              "
              dir="ltr"
            >
              <span>📍</span>
              <span>
                King Fahd Dist - RIYADH - Kingdom of Saudi Arabia -POSTAL CODE :12274
              </span>
              <span>☎</span>
              <span>0590722827</span>
              <span>- N.N:</span>
              <span>7052303828</span>
              <span>✉</span>
              <span>info@details-consults.sa</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export const LivePreview = ({ data }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.68);
  const componentRef = useRef(null);
  const scrollRef = useRef(null);

  const selectedStyle = previewStyles.classic;

  const issueDateParts = formatDateParts(data?.issueDate);

  const {
    templateType,
    issueDate,
    validityDays,
    clientTitle,
    clientNameForPreview,
    clientCodeForPreview,
    showClientCode,
    showPropertyCode,
    propertyCodeForPreview,
    transactionType,
    licenseNumber,
    licenseYear,
    serviceNumber,
    serviceYear,
    termsText,
    items = [],
    subtotal,
    taxRate,
    taxAmount,
    grandTotal,
    officeTaxBearing,
    paymentsList = [],
    acceptedMethods = [],
    showMissingDocs,
    missingDocs,
  } = data || {};

  const referenceNumber = `QT-${Date.now().toString().slice(-5)}`;
  const validityText =
    validityDays === "unlimited" || validityDays === "custom"
      ? "غير محدد"
      : `${validityDays || 30} يوم`;

  const introText = (() => {
    let intro = `إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات (${transactionType || "الخدمات الهندسية والاستشارية"})`;
    if (showPropertyCode && propertyCodeForPreview) {
      intro += ` لقطعة الأرض أو الملف رقم (${propertyCodeForPreview})`;
    }
    if (licenseNumber) {
      intro += `، وفقاً لرخصة البناء رقم (${licenseNumber})${
        licenseYear ? ` لسنة (${licenseYear} هـ)` : ""
      }`;
    }
    if (serviceNumber) {
      intro += ` وموجب الطلب رقم (${serviceNumber})${
        serviceYear ? ` لسنة (${serviceYear} هـ)` : ""
      }`;
    }
    intro +=
      "، فإنه يسرنا تقديم العرض المالي والفني لإنهاء الأعمال المطلوبة على النحو التالي:";
    return intro;
  })();

  const getItemTotal = (item) => {
    const qty = Number(item.qty ?? item.quantity ?? 1);
    const price = Number(item.price ?? item.unitPrice ?? 0);
    const discount = Number(item.discount || 0);
    return Math.max(0, qty * price - discount);
  };

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.1, 0.38));
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

            html,
            body {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: Tajawal, Arial, sans-serif;
            }

            .print-shell {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: #ffffff;
            }

            .print-area {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              transform: none !important;
              overflow: visible !important;
            }
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
      className="
        flex h-full min-h-0 w-full flex-col overflow-hidden
        rounded-[24px] border border-[#d8b46a]/25
        bg-white/90 shadow-[0_10px_26px_rgba(18,63,89,0.08)]
        backdrop-blur-xl
      "
      dir="rtl"
    >
      {/* Toolbar comme la preview des modèles */}
      <div
        className="
          shrink-0 border-b border-[#e8ddc8]
          bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
          px-3 py-2
        "
      >
        <div className="mx-auto max-w-[980px] rounded-[18px] border border-[#d8b46a]/25 bg-white/95 p-2 shadow-[0_8px_18px_rgba(18,63,89,0.08)] backdrop-blur-xl">
          <div className="flex min-w-0 items-center justify-end gap-2">
            

            <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto custom-scrollbar-slim">
              <button
                onClick={() => setIsEditMode(!isEditMode)}
                className={`
                  inline-flex h-8 shrink-0 items-center justify-center rounded-xl border px-2
                  text-[9px] font-black transition
                  ${
                    isEditMode
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-[#d8b46a]/25 bg-[#fbf8f1] text-[#64748b] hover:bg-white hover:text-[#123f59]"
                  }
                `}
                type="button"
              >
                <IconWithText
                  icon={isEditMode ? Check : Edit3}
                  text={isEditMode ? "حفظ النص" : "تحرير النص"}
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

      <div
        ref={scrollRef}
        className="
          min-h-0 flex-1 overflow-auto
          bg-[#e8edf0] p-4 pb-12 custom-scrollbar-slim
        "
      >
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
              <div
                ref={componentRef}
                className="print-area relative overflow-hidden bg-white shadow-[0_20px_55px_rgba(18,63,89,0.18)]"
                style={{
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "14mm 14mm 28mm 14mm",
                  backgroundColor: selectedStyle.paper,
                  color: "#123f59",
                }}
                dir="rtl"
              >
                <header
                  className="mb-4 border-b-[3px] pb-4"
                  style={{ borderColor: selectedStyle.accent }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-start">
                      <div className="flex h-20 w-64 items-center justify-center">
                        <img
                          src="/logo.jpeg"
                          alt="Details Consulting Engineers"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    </div>

                    <div className="text-left">
                      <h3
                        className="mb-2 text-lg font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        عرض سعر خدمات
                      </h3>

                      <div className="space-y-1 text-[10px] font-bold text-[#475569]">
                        <p className="inline-flex items-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 py-1">
                          التاريخ: {issueDateParts.combined}
                        </p>
                        <p className="font-mono text-[#123f59]">
                          {referenceNumber}
                        </p>
                      </div>
                    </div>
                  </div>
                </header>

                <main>
                  <section className="mb-4">
                    <h4
                      className="mb-1 text-[13px] font-black"
                      style={{ color: selectedStyle.accent }}
                    >
                      السادة / {clientTitle || "المواطن"}{" "}
                      {clientNameForPreview || "عميل غير محدد"}
                    </h4>

                    {showClientCode && clientCodeForPreview && (
                      <p className="mb-2 text-[10px] font-bold text-[#94a3b8]">
                        رقم العميل: {clientCodeForPreview}
                      </p>
                    )}

                    <p
                      className="mb-2 text-[12px] font-black"
                      style={{ color: selectedStyle.accent }}
                    >
                      السلام عليكم ورحمة الله وبركاته ،،،
                    </p>

                    <div
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      className={`
                        text-justify text-[11px] font-bold leading-7 text-[#475569]
                        ${
                          isEditMode
                            ? "rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-2 outline-none"
                            : ""
                        }
                      `}
                    >
                      {introText}
                    </div>
                  </section>

                  <section className="mb-4">
                    <div
                      className="mb-2 flex items-center gap-1.5 text-[12px] font-black"
                      style={{ color: selectedStyle.accent }}
                    >
                      <FileText className="h-4 w-4 text-[#c5983c]" />
                      نطاق العمل والتكاليف
                    </div>

                    <table
                      className="w-full border-collapse text-center text-[10px]"
                      style={{ border: `1px solid ${selectedStyle.accent}` }}
                    >
                      <thead>
                        <tr
                          className="font-black text-white"
                          style={{ backgroundColor: selectedStyle.accent }}
                        >
                          <th className="w-8 p-2" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            م
                          </th>
                          <th className="p-2 text-right" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            الوصف
                          </th>
                          <th className="w-16 p-2" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            الكمية
                          </th>
                          <th className="w-20 p-2" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            السعر
                          </th>
                          <th className="w-24 p-2" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                            الإجمالي
                          </th>
                        </tr>
                      </thead>

                      <tbody className="font-bold text-[#123f59]">
                        {items.length === 0 ? (
                          <tr>
                            <td
                              colSpan="5"
                              className="p-5 text-center text-[#94a3b8]"
                              style={{ border: `1px solid ${selectedStyle.accent}` }}
                            >
                              لا توجد بنود مسجلة
                            </td>
                          </tr>
                        ) : (
                          items.map((item, index) => {
                            const qty = Number(item.qty ?? item.quantity ?? 1);
                            const price = Number(item.price ?? item.unitPrice ?? 0);

                            return (
                              <tr
                                key={item.id || index}
                                className={index % 2 === 0 ? "bg-white" : "bg-[#fbf8f1]"}
                              >
                                <td className="p-2 font-mono" style={{ border: `1px solid ${selectedStyle.accent}33` }}>
                                  {index + 1}
                                </td>
                                <td className="p-2 text-right" style={{ border: `1px solid ${selectedStyle.accent}33` }}>
                                  {item.title || "بند غير مسمى"}
                                </td>
                                <td className="p-2 font-mono" style={{ border: `1px solid ${selectedStyle.accent}33` }}>
                                  {qty} {item.unit || ""}
                                </td>
                                <td className="p-2 font-mono" style={{ border: `1px solid ${selectedStyle.accent}33` }}>
                                  {formatCurrency(price)}
                                </td>
                                <td className="p-2 font-mono font-black" style={{ border: `1px solid ${selectedStyle.accent}33`, color: selectedStyle.accent }}>
                                  {formatCurrency(getItemTotal(item))}
                                </td>
                              </tr>
                            );
                          })
                        )}

                        <tr className="bg-[#fbf8f1]">
                          <td
                            colSpan="4"
                            className="p-2 text-left font-black"
                            style={{ border: `1px solid ${selectedStyle.accent}` }}
                          >
                            الإجمالي قبل الضريبة
                          </td>
                          <td
                            className="p-2 font-mono font-black"
                            style={{ border: `1px solid ${selectedStyle.accent}` }}
                          >
                            {formatCurrency(subtotal)}
                          </td>
                        </tr>

                        <tr>
                          <td
                            colSpan="4"
                            className="p-2 text-left font-bold text-[#64748b]"
                            style={{ border: `1px solid ${selectedStyle.accent}` }}
                          >
                            ضريبة القيمة المضافة {taxRate || 0}%
                            {officeTaxBearing > 0 ? ` - يتحمل المكتب ${officeTaxBearing}%` : ""}
                          </td>
                          <td
                            className="p-2 font-mono font-bold"
                            style={{ border: `1px solid ${selectedStyle.accent}` }}
                          >
                            {formatCurrency(taxAmount)}
                          </td>
                        </tr>

                        <tr
                          className="font-black text-white"
                          style={{ backgroundColor: selectedStyle.accent }}
                        >
                          <td
                            colSpan="4"
                            className="p-2.5 text-left text-[12px]"
                            style={{ border: `1px solid ${selectedStyle.accent}` }}
                          >
                            الإجمالي شامل ضريبة القيمة المضافة
                          </td>
                          <td
                            className="p-2.5 font-mono text-[12px]"
                            style={{ border: `1px solid ${selectedStyle.accent}` }}
                          >
                            {formatCurrency(grandTotal)} ر.س
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </section>

                  {paymentsList.length > 0 && (
                    <section className="mb-4">
                      <h4
                        className="mb-2 text-[12px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        الدفعات:
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {paymentsList.map((payment, index) => (
                          <div
                            key={payment.id || index}
                            className="rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] p-2 text-[10px] font-bold text-[#475569]"
                          >
                            <div className="flex justify-between gap-2">
                              <span>{payment.label || `الدفعة ${index + 1}`}</span>
                              <span className="font-mono text-[#123f59]">
                                {formatCurrency(payment.amount)} ر.س
                              </span>
                            </div>
                            <div className="mt-1 text-[#94a3b8]">
                              {payment.condition || "حسب الاتفاق"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  <section className="mb-10">
                    <h4
                      className="mb-2 text-[12px] font-black"
                      style={{ color: selectedStyle.accent }}
                    >
                      الشروط والأحكام:
                    </h4>

                    <div
                      contentEditable={isEditMode}
                      suppressContentEditableWarning
                      className={`
                        whitespace-pre-line text-justify text-[10.5px] font-bold leading-7 text-[#475569]
                        ${
                          isEditMode
                            ? "rounded-xl border border-dashed border-amber-300 bg-amber-50/70 p-2 outline-none"
                            : ""
                        }
                      `}
                    >
                      {termsText || "لم يتم إدراج شروط وأحكام."}
                    </div>

                    {showMissingDocs && missingDocs && (
                      <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] font-bold text-red-800">
                        <span className="mb-1 block text-[11px] font-black">
                          مستندات مطلوبة للبدء:
                        </span>
                        {missingDocs}
                      </div>
                    )}
                  </section>

                  <section className="mt-10 grid grid-cols-2 gap-8 text-center">
                    <div>
                      <p
                        className="mb-10 text-[11px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        توقيع العميل / الممثل
                      </p>
                      <div className="mx-auto w-2/3 border-b-2 border-dashed border-[#d8b46a]/60" />
                    </div>

                    <div>
                      <p
                        className="mb-10 text-[11px] font-black"
                        style={{ color: selectedStyle.accent }}
                      >
                        توقيع وختم المكتب
                      </p>
                      <div className="mx-auto w-2/3 border-b-2 border-dashed border-[#d8b46a]/60" />
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
