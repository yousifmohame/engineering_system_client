import React, { useRef, useState } from "react";
import {
  FileText,
  Building2,
  Eye,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Palette,
  Maximize2,
  Minimize2,
  ScanSearch,
} from "lucide-react";

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

const STYLE_PRESETS = {
  classic: {
    label: "كلاسيكي",
    accentColor: "#123f59",
    goldColor: "#c5983c",
    paperTone: "white",
  },
  teal: {
    label: "تركواز",
    accentColor: "#0e7490",
    goldColor: "#d8b46a",
    paperTone: "white",
  },
  emerald: {
    label: "أخضر",
    accentColor: "#0f766e",
    goldColor: "#c5983c",
    paperTone: "white",
  },
  graphite: {
    label: "رسمي داكن",
    accentColor: "#1f2937",
    goldColor: "#b0893c",
    paperTone: "soft",
  },
};

const DEFAULT_PAGE_STYLE = {
  preset: "classic",
  accentColor: "#123f59",
  goldColor: "#c5983c",
  paperTone: "white",
  fontScale: 1,
  density: "normal",
  pagePaddingMm: 15,
  showOuterBorder: false,
};



const DetailsPrintFooter = ({ accentColor = "#0f5570" }) => {
  return (
    <footer
      className="
        details-print-footer absolute bottom-[7mm] left-[10mm] right-[10mm]
        bg-white font-[Tajawal]
      "
      dir="ltr"
    >
      <div className="border-t-[2.5px] pt-1.5" style={{ borderColor: accentColor }}>
        <div className="flex items-start gap-2" style={{ color: accentColor }}>
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
              <span>حي الملك فهد - الرياض - المملكة العربية السعودية - الرمز البريدي : ١٢٢٧٤</span>
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
              <span>King Fahd Dist - RIYADH - Kingdom of Saudi Arabia -POSTAL CODE :12274</span>
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

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export default function A4Preview({ template, setTemplate }) {
  const printRef = useRef(null);
  const previewScrollRef = useRef(null);
  const [zoom, setZoom] = useState(0.7);

  const dummyData = {
    clientName: "شركة البلاد العقارية المحدودة",
    serviceType: "تعديل مكونات - مستودعات",
    plotNumber: "الثانية من ج (14)",
    planNumber: "1391",
    district: "المشاعل",
    area: "54726.75",
    oldLicenseNo: "1483/8744",
    date: formatDateParts(new Date()).combined,
  };

  const pageStyle = {
    ...DEFAULT_PAGE_STYLE,
    ...(template.pageStyle || {}),
  };

  const preset = STYLE_PRESETS[pageStyle.preset] || STYLE_PRESETS.classic;
  const accentColor = pageStyle.accentColor || preset.accentColor;
  const goldColor = pageStyle.goldColor || preset.goldColor;
  const paperBackground = pageStyle.paperTone === "soft" ? "#fffdf7" : "#ffffff";
  const paddingMm =
    pageStyle.density === "compact"
      ? 11
      : pageStyle.density === "wide"
        ? 18
        : Number(pageStyle.pagePaddingMm || 15);
  const fontScale = Number(pageStyle.fontScale || 1);

  const updatePageStyle = (patch) => {
    if (!setTemplate) return;

    setTemplate((prev) => ({
      ...prev,
      pageStyle: {
        ...DEFAULT_PAGE_STYLE,
        ...(prev.pageStyle || {}),
        ...patch,
      },
    }));
  };

  const applyPreset = (presetKey) => {
    const nextPreset = STYLE_PRESETS[presetKey] || STYLE_PRESETS.classic;

    updatePageStyle({
      preset: presetKey,
      accentColor: nextPreset.accentColor,
      goldColor: nextPreset.goldColor,
      paperTone: nextPreset.paperTone,
    });
  };

  let previewIntroText = template.intro.text || "";
  Object.keys(dummyData).forEach((key) => {
    previewIntroText = previewIntroText.replace(
      new RegExp(`{{${key}}}`, "g"),
      dummyData[key],
    );
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.35));
  const handleResetZoom = () => setZoom(0.7);

  const handleFitToWidth = () => {
    const containerWidth = previewScrollRef.current?.clientWidth || 900;
    const nextZoom = Math.max(
      0.35,
      Math.min(1.25, (containerWidth - 64) / A4_WIDTH_PX),
    );

    setZoom(Number(nextZoom.toFixed(2)));
  };

  const handlePrint = () => {
    const printNode = printRef.current;

    if (!printNode) return;

    const iframe = document.createElement("iframe");
    iframe.setAttribute("title", "print-a4-template");
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
      .map((node) => node.outerHTML)
      .join("\n");

    iframeDocument.open();
    iframeDocument.write(`
      <!doctype html>
      <html dir="rtl" lang="ar">
        <head>
          <meta charset="utf-8" />
          <title>${template.title || "quotation-template"}</title>
          ${appStyles}
          <style>
            html,
            body {
              width: 210mm;
              min-height: 297mm;
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              direction: rtl;
              font-family: Tajawal, Arial, sans-serif;
            }

            .print-shell {
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
              background: #ffffff;
            }

            .a4-template-print-area {
              width: 210mm !important;
              min-height: 297mm !important;
              margin: 0 !important;
              box-shadow: none !important;
              transform: none !important;
              overflow: visible !important;
            }

            @page {
              size: A4;
              margin: 0;
            }
          </style>
        </head>
        <body>
          <div class="print-shell">
            ${printNode.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDocument.close();

    const runPrint = () => {
      const images = Array.from(iframeDocument.images || []);

      Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();

          return new Promise((resolve) => {
            image.onload = resolve;
            image.onerror = resolve;
          });
        }),
      ).then(() => {
        setTimeout(() => {
          iframeWindow.focus();
          iframeWindow.print();

          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 600);
        }, 250);
      });
    };

    setTimeout(runPrint, 300);
  };

  const scaledWidth = Math.round(A4_WIDTH_PX * zoom);
  const scaledHeight = Math.round(A4_HEIGHT_PX * zoom);

  return (
    <div
      ref={previewScrollRef}
      className="
        min-h-0 flex-1 overflow-auto
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-4 pb-28 custom-scrollbar-slim
      "
      dir="rtl"
    >
      {/* Toolbar compactée */}
      <div className="sticky top-0 z-30 mx-auto mb-2 max-w-[980px] rounded-[18px] border border-[#d8b46a]/25 bg-white/95 p-2 shadow-[0_8px_18px_rgba(18,63,89,0.08)] backdrop-blur-xl">
        <div className="flex min-w-0 items-center justify-end gap-2">
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto custom-scrollbar-slim">
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
              {Math.round(zoom * 100)}%
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
              onClick={handleResetZoom}
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

      {/* Preview canvas */}
      <div className="mx-auto flex justify-center pb-12">
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
              transform: `scale(${zoom})`,
              width: `${A4_WIDTH_PX}px`,
            }}
          >
            <div
              ref={printRef}
              className="a4-template-print-area relative overflow-hidden bg-white shadow-[0_20px_55px_rgba(18,63,89,0.18)]"
              style={{
                width: "210mm",
                minHeight: "297mm",
                padding: `${paddingMm}mm ${paddingMm}mm 30mm ${paddingMm}mm`,
                transformOrigin: "top right",
                backgroundColor: paperBackground,
                color: "#123f59",
                fontSize: `${12 * fontScale}px`,
                border: pageStyle.showOuterBorder
                  ? `2px solid ${accentColor}`
                  : "none",
              }}
            >
              <header
                className="mb-5 border-b-2 pb-4"
                style={{ borderColor: accentColor }}
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="flex items-start">
                    {template.header.showLogo && (
                      <div
                        className="
                          flex h-20 w-64 shrink-0 items-center justify-center
                          rounded-xl border bg-white p-2
                        "
                        style={{ borderColor: `${goldColor}55` }}
                      >
                        <img
                          src="/logo.jpeg"
                          alt="Details Consulting Engineers"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-left">
                    <h3
                      className="mb-2 text-lg font-black"
                      style={{ color: accentColor }}
                    >
                      {template.header.documentTitle}
                    </h3>
                    {template.header.showDate && (
                      <p
                        className="inline-flex items-center rounded-xl border bg-[#fbf8f1] px-2 py-1 text-xs font-bold text-[#64748b]"
                        style={{ borderColor: `${goldColor}55` }}
                      >
التاريخ: {dummyData.date}
                      </p>
                    )}
                  </div>
                </div>
              </header>

              <section className="mb-5">
                <h4
                  className="mb-1 text-sm font-black"
                  style={{ color: accentColor }}
                >
                  {template.intro.addresseePrefix} {dummyData.clientName}
                </h4>
                <p
                  className="mb-3 text-sm font-bold"
                  style={{ color: accentColor }}
                >
                  المحترم
                </p>
                <p
                  className="mb-3 text-sm font-bold"
                  style={{ color: accentColor }}
                >
                  {template.intro.greeting}
                </p>
                <p className="text-justify text-xs font-medium leading-7 text-[#475569]">
                  {previewIntroText}
                </p>
              </section>

              <section className="mb-5">
                <div
                  className="mb-2 flex items-center gap-1.5 text-xs font-black"
                  style={{ color: accentColor }}
                >
                  <FileText className="h-4 w-4" style={{ color: goldColor }} />
                  نطاق العمل والتكاليف
                </div>

                <table
                  className="w-full border-collapse text-center text-xs"
                  style={{ border: `1px solid ${accentColor}` }}
                >
                  <thead>
                    <tr
                      className="font-black text-white"
                      style={{ backgroundColor: accentColor }}
                    >
                      <th className="w-8 p-2" style={{ border: `1px solid ${accentColor}` }}>م</th>
                      <th className="p-2 text-right" style={{ border: `1px solid ${accentColor}` }}>الوصف</th>
                      {template.table.showUnit && (
                        <th className="w-16 p-2" style={{ border: `1px solid ${accentColor}` }}>الوحدة</th>
                      )}
                      {template.table.showQuantity && (
                        <th className="w-16 p-2" style={{ border: `1px solid ${accentColor}` }}>الكمية</th>
                      )}
                      {template.table.showUnitPrice && (
                        <th className="w-20 p-2" style={{ border: `1px solid ${accentColor}` }}>سعر الوحدة</th>
                      )}
                      <th className="w-24 p-2" style={{ border: `1px solid ${accentColor}` }}>الإجمالي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>1</td>
                      <td className="p-2 text-right" style={{ border: `1px solid ${accentColor}` }}>
                        المخططات المعمارية حسب كود البناء السعودي
                      </td>
                      {template.table.showUnit && <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>خدمة</td>}
                      {template.table.showQuantity && <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>1</td>}
                      {template.table.showUnitPrice && <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>—</td>}
                      <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>—</td>
                    </tr>
                    {template.financials.showSubtotal && (
                      <tr className="bg-[#fbf8f1] font-bold">
                        <td
                          className="p-2 text-left"
                          style={{ border: `1px solid ${accentColor}` }}
                          colSpan={
                            2 +
                            (template.table.showUnit ? 1 : 0) +
                            (template.table.showQuantity ? 1 : 0) +
                            (template.table.showUnitPrice ? 1 : 0)
                          }
                        >
                          الإجمالي قبل الضريبة
                        </td>
                        <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>—</td>
                      </tr>
                    )}
                    <tr className="font-bold">
                      <td
                        className="p-2 text-left"
                        style={{ border: `1px solid ${accentColor}` }}
                        colSpan={
                          2 +
                          (template.table.showUnit ? 1 : 0) +
                          (template.table.showQuantity ? 1 : 0) +
                          (template.table.showUnitPrice ? 1 : 0)
                        }
                      >
                        ضريبة القيمة المضافة {template.financials.vatPercentage}%
                      </td>
                      <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>—</td>
                    </tr>
                    {template.financials.showTotal && (
                      <tr className="font-black text-white" style={{ backgroundColor: accentColor }}>
                        <td
                          className="p-2 text-left"
                          style={{ border: `1px solid ${accentColor}` }}
                          colSpan={
                            2 +
                            (template.table.showUnit ? 1 : 0) +
                            (template.table.showQuantity ? 1 : 0) +
                            (template.table.showUnitPrice ? 1 : 0)
                          }
                        >
                          الإجمالي النهائي
                        </td>
                        <td className="p-2" style={{ border: `1px solid ${accentColor}` }}>—</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>

              <section className="mb-10">
                <h4
                  className="mb-2 text-sm font-black underline underline-offset-4"
                  style={{ color: accentColor, textDecorationColor: goldColor }}
                >
                  {template.terms.title}
                </h4>
                <div className="whitespace-pre-line text-justify text-xs leading-7 text-[#475569]">
                  {template.terms.text}
                </div>
              </section>

              <section className="mt-14 grid grid-cols-2 gap-8 text-center">
                {template.signatures.showClient && (
                  <div>
                    <p className="mb-12 text-xs font-black" style={{ color: accentColor }}>
                      {template.signatures.clientLabel}
                    </p>
                    <div
                      className="mx-auto w-2/3 border-b"
                      style={{ borderColor: `${goldColor}80` }}
                    />
                  </div>
                )}
                {template.signatures.showOffice && (
                  <div>
                    <p className="mb-12 text-xs font-black" style={{ color: accentColor }}>
                      {template.signatures.officeLabel}
                    </p>
                    <div
                      className="mx-auto w-2/3 border-b"
                      style={{ borderColor: `${goldColor}80` }}
                    />
                  </div>
                )}
              </section>

              <DetailsPrintFooter accentColor={accentColor} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
