import React, { useRef, useState, useEffect } from "react";
import {
  FileText,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Building,
  UserCheck,
  Eye,
  Scale,
} from "lucide-react";


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

// ==========================================
// مكون تذييل الصفحة الموحد (Footer)
// ==========================================
const DetailsPrintFooter = ({ accentColor = "#0f5570" }) => {
  return (
    <div
      className="border-t-[2.5px] pt-2 mt-4"
      style={{ borderColor: accentColor }}
      dir="ltr"
    >
      <div className="flex items-start gap-3" style={{ color: accentColor }}>
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
              حي الملك فهد - الرياض - المملكة العربية السعودية - الرمز البريدي :
              ١٢٢٧٤
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
              King Fahd Dist - RIYADH - Kingdom of Saudi Arabia - POSTAL CODE :
              12274
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
    </div>
  );
};

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

export default function A4Preview({ template, setTemplate }) {
  const printRef = useRef(null);
  const previewScrollRef = useRef(null);
  const [zoom, setZoom] = useState(0.75);

  // 🚀 بيانات وهمية لمحاكاة العرض وتوضيح المتغيرات
  const dummyData = {
    clientName: "شركة أبعاد التطوير العقارية المحدودة",
    serviceType: template.title || "خدمات هندسية متكاملة",
    plotNumber: "847 / ج",
    planNumber: "2944",
    district: "الملقا",
    area: "12,500.00",
    date: new Date().toLocaleDateString("ar-SA"),
    reference: `QT-${Date.now().toString().slice(-5)}`,
  };

  const pageStyle = { ...DEFAULT_PAGE_STYLE, ...(template.pageStyle || {}) };
  const preset = STYLE_PRESETS[pageStyle.preset] || STYLE_PRESETS.classic;
  const accentColor = pageStyle.accentColor || preset.accentColor;
  const goldColor = pageStyle.goldColor || preset.goldColor;
  const paperBackground =
    pageStyle.paperTone === "soft" ? "#fdfbf7" : "#ffffff";
  const paddingMm =
    pageStyle.density === "compact"
      ? 11
      : pageStyle.density === "wide"
        ? 18
        : Number(pageStyle.pagePaddingMm || 15);
  const fontScale = Number(pageStyle.fontScale || 1);

  // استبدال المتغيرات في نص المقدمة
  let previewIntroText = template.intro?.text || "";
  Object.keys(dummyData).forEach((key) => {
    previewIntroText = previewIntroText.replace(
      new RegExp(`{{${key}}}`, "g"),
      dummyData[key],
    );
  });

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 1.6));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.35));
  const handleResetZoom = () => setZoom(0.75);

  // 🚀 دالة طباعة مخصصة للـ Iframe (ممتازة للنماذج السريعة)
  const handlePrint = () => {
    const printNode = printRef.current;
    if (!printNode) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "-10000px";
    document.body.appendChild(iframe);

    const iframeDocument = iframe.contentWindow.document;
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
          <title>معاينة النموذج - ${template.title}</title>
          ${appStyles}
          <style>
            @page { size: A4; margin: 0; }
            body { margin: 0; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; font-family: Tajawal, sans-serif; }
            .print-shell { width: 210mm; margin: 0 auto; background: ${paperBackground}; }
            .a4-template-print-area { width: 210mm !important; min-height: 297mm !important; box-shadow: none !important; transform: none !important; }
            .avoid-break { page-break-inside: avoid; }
          </style>
        </head>
        <body><div class="print-shell">${printNode.outerHTML}</div></body>
      </html>
    `);
    iframeDocument.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => document.body.removeChild(iframe), 500);
    }, 500);
  };

  const scaledWidth = Math.round(A4_WIDTH_PX * zoom);
  const scaledHeight = Math.round(A4_HEIGHT_PX * zoom);

  return (
    <div
      ref={previewScrollRef}
      className="min-h-0 flex-1 overflow-auto bg-transparent p-4 pb-28 custom-scrollbar flex flex-col items-center relative"
      dir="rtl"
    >
      {/* 🚀 Toolbar - Liquid Glass Design */}
      <div className="sticky top-2 z-30 mx-auto w-full max-w-[800px] mb-6 rounded-[20px] border border-white/60 bg-white/40 p-2.5 shadow-[0_8px_32px_0_rgba(18,63,89,0.06)] backdrop-blur-2xl transition-all hover:bg-white/50">
        <div className="flex min-w-0 items-center justify-between gap-4">
          <div className="flex items-center gap-2 px-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#123f59] to-[#0e7490] text-[#d8b46a] shadow-sm">
              <Eye className="w-4 h-4" />
            </span>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-[#123f59]">
                المعاينة الحية للنموذج
              </span>
              <span className="text-[9px] font-bold text-slate-500">
                يتحدث تلقائياً حسب التعديلات
              </span>
            </div>
          </div>

          <div className="flex min-w-0 items-center justify-end gap-1.5 overflow-x-auto custom-scrollbar-slim">
            <button
              onClick={handlePrint}
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-l from-[#123f59] to-[#0e7490] px-4 text-[10px] font-black text-white transition hover:shadow-md hover:-translate-y-0.5"
            >
              <Printer className="w-3.5 h-3.5 text-[#d8b46a]" /> تصدير ومعاينة
              الطباعة
            </button>
            <div className="w-px h-5 bg-[#d8b46a]/30 mx-1"></div>
            <button
              onClick={handleZoomOut}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-white/60 text-slate-600 transition hover:bg-white shadow-sm"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="inline-flex h-9 min-w-[50px] shrink-0 items-center justify-center rounded-xl border border-white/50 bg-[#fbf8f1]/80 px-2 text-[10px] font-black text-[#123f59] font-mono shadow-inner">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-white/60 text-slate-600 transition hover:bg-white shadow-sm"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white bg-white/60 text-[#c5983c] transition hover:bg-white shadow-sm"
              title="إعادة الحجم الافتراضي"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 🚀 Preview Canvas (تطبيق هندسة LivePreview) */}
      <div
        className="mx-auto flex justify-center pb-12 transition-transform duration-300"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "top center",
          width: `${A4_WIDTH_PX}px`,
        }}
      >
        <div
          ref={printRef}
          className="a4-template-print-area relative overflow-hidden bg-white shadow-[0_20px_60px_-15px_rgba(18,63,89,0.3)] ring-1 ring-slate-900/5 print:shadow-none print:ring-0"
          style={{
            width: "210mm",
            minHeight: "297mm",
            backgroundColor: paperBackground,
            color: "#123f59",
            fontSize: `${12 * fontScale}px`,
            fontFamily: "'Tajawal', sans-serif",
          }}
        >
          {/* إطار الصفحة الخارجي إذا تم تفعيله */}
          {pageStyle.showOuterBorder && (
            <div
              className="absolute inset-0 z-0 pointer-events-none"
              style={{ border: `3px solid ${accentColor}`, margin: "5mm" }}
            ></div>
          )}

          {/* الاعتماد على نظام الجداول لترويسة وتذييل احترافي في الطباعة */}
          <table
            className="document-table w-full border-collapse border-none relative z-10"
            style={{ padding: `${paddingMm}mm` }}
          >
            {/* 🚀 الترويسة (Header) */}
            <thead className="table-header-group">
              <tr>
                <td
                  style={{
                    padding: `${paddingMm}mm ${paddingMm}mm 5mm ${paddingMm}mm`,
                  }}
                >
                  <div
                    className="flex w-full items-stretch justify-between border-b-[3px] pb-4"
                    style={{ borderColor: accentColor }}
                  >
                    {/* المربع الأيمن: الموضوع */}
                    <div
                      className="w-[220px] border flex flex-col justify-center p-3 bg-white/50"
                      style={{ borderColor: `${accentColor}44` }}
                    >
                      <div className="text-slate-500 text-[10px] mb-1 font-bold">
                        الموضوع
                      </div>
                      <div className="text-[13px] font-black text-[#123f59] leading-relaxed break-words">
                        {template.header?.documentTitle ||
                          "عرض سعر خدمات هندسية"}
                      </div>
                    </div>
                    {/* المربع الأوسط: الشعار */}
                    {template.header?.showLogo && (
                      <div className="flex flex-1 items-center justify-center px-4">
                        <img
                          src="/logo.jpeg"
                          alt="Logo"
                          className="h-16 w-auto object-contain mix-blend-multiply grayscale-[20%]"
                        />
                      </div>
                    )}
                    {/* المربع الأيسر: التاريخ ورقم المرجع */}
                    <div
                      className="w-[240px] border flex flex-col bg-white/50"
                      style={{ borderColor: `${accentColor}44` }}
                    >
                      {template.header?.showDate && (
                        <div
                          className="flex flex-1 border-b"
                          style={{ borderColor: `${accentColor}44` }}
                        >
                          <div
                            className="w-[85px] p-2 border-l text-slate-500 text-[10px] font-bold flex items-center"
                            style={{ borderColor: `${accentColor}44` }}
                          >
                            تاريخ الإصدار
                          </div>
                          <div className="flex-1 p-2 text-[11px] font-black text-[#123f59] flex items-center font-mono">
                            {dummyData.date}
                          </div>
                        </div>
                      )}
                      <div className="flex flex-1">
                        <div
                          className="w-[85px] p-2 border-l text-slate-500 text-[10px] font-bold flex items-center"
                          style={{ borderColor: `${accentColor}44` }}
                        >
                          رقم المرجع
                        </div>
                        <div className="flex-1 p-2 font-mono text-[11px] font-black text-[#123f59] flex items-center">
                          {dummyData.reference}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </thead>

            {/* 🚀 المحتوى (Body) */}
            <tbody className="table-row-group">
              <tr>
                <td
                  style={{ padding: `5mm ${paddingMm}mm 10mm ${paddingMm}mm` }}
                >
                  {/* المقدمة */}
                  <section className="mb-8 avoid-break">
                    <h4
                      className="mb-3 text-[13px] font-black flex items-center gap-1.5"
                      style={{ color: accentColor }}
                    >
                      <UserCheck
                        className="w-4.5 h-4.5"
                        style={{ color: goldColor }}
                      />{" "}
                      أولاً: بيانات العميل والمشروع
                    </h4>
                    <table
                      className="w-full border-collapse text-right text-[11px] mb-4"
                      style={{ border: `1px solid ${accentColor}` }}
                    >
                      <tbody className="font-bold text-[#123f59]">
                        <tr>
                          <td
                            className="p-2.5 border bg-slate-50/60 w-1/4"
                            style={{ borderColor: `${accentColor}44` }}
                          >
                            {template.intro?.addresseePrefix ||
                              "السادة المحترمين"}
                          </td>
                          <td
                            className="p-2.5 border font-black w-3/4"
                            style={{
                              borderColor: `${accentColor}44`,
                              color: accentColor,
                            }}
                          >
                            {dummyData.clientName}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="p-2.5 border bg-slate-50/60"
                            style={{ borderColor: `${accentColor}44` }}
                          >
                            بيانات المشروع المعني
                          </td>
                          <td
                            className="p-2.5 border font-mono font-bold text-slate-700"
                            style={{ borderColor: `${accentColor}44` }}
                          >
                            حي {dummyData.district} | مخطط رقم{" "}
                            {dummyData.planNumber} | قطعة رقم{" "}
                            {dummyData.plotNumber} | المساحة {dummyData.area} م²
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <p
                      className="mb-3 text-[12px] font-black"
                      style={{ color: accentColor }}
                    >
                      {template.intro?.greeting ||
                        "السلام عليكم ورحمة الله وبركاته،،،"}
                    </p>
                    <div className="text-justify text-[11.5px] leading-[2.2] font-bold text-slate-700 whitespace-pre-wrap pl-4">
                      {previewIntroText}
                    </div>
                  </section>

                  {/* جدول البنود والتكاليف */}
                  <section className="mb-8 avoid-break">
                    <h4
                      className="mb-3 text-[13px] font-black flex items-center gap-1.5"
                      style={{ color: accentColor }}
                    >
                      <FileText
                        className="w-4.5 h-4.5"
                        style={{ color: goldColor }}
                      />{" "}
                      ثانياً: نطاق العمل المعتمد والتكلفة
                    </h4>

                    <table
                      className="w-full border-collapse text-center text-[11px]"
                      style={{
                        border: `1px solid ${accentColor}`,
                        tableLayout: "fixed",
                      }}
                    >
                      <thead>
                        <tr
                          className="font-black text-white"
                          style={{ backgroundColor: accentColor }}
                        >
                          <th
                            className="p-2.5 border w-[6%]"
                            style={{ borderColor: accentColor }}
                          >
                            م
                          </th>
                          <th
                            className="p-2.5 text-right border"
                            style={{
                              borderColor: accentColor,
                              width: template.table?.showQuantity
                                ? "44%"
                                : "60%",
                            }}
                          >
                            وصف نطاق العمل (البند)
                          </th>
                          {template.table?.showUnit && (
                            <th
                              className="p-2.5 border w-[12%]"
                              style={{ borderColor: accentColor }}
                            >
                              الوحدة
                            </th>
                          )}
                          {template.table?.showQuantity && (
                            <th
                              className="p-2.5 border w-[12%]"
                              style={{ borderColor: accentColor }}
                            >
                              الكمية
                            </th>
                          )}
                          {template.table?.showUnitPrice && (
                            <th
                              className="p-2.5 border w-[16%]"
                              style={{ borderColor: accentColor }}
                            >
                              سعر الوحدة
                            </th>
                          )}
                          <th
                            className="p-2.5 border w-[18%]"
                            style={{ borderColor: accentColor }}
                          >
                            الإجمالي
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-[#123f59]">
                        {!template.items || template.items.length === 0 ? (
                          // عرض بيانات تجريبية إذا لم يتم إضافة بنود في النموذج
                          <tr>
                            <td
                              className="p-3 border font-mono bg-slate-50/50"
                              style={{ borderColor: `${accentColor}44` }}
                            >
                              1
                            </td>
                            <td
                              className="p-3 text-right border leading-relaxed"
                              style={{ borderColor: `${accentColor}44` }}
                            >
                              {dummyData.serviceType}
                              <br />
                              <span className="text-[9px] text-slate-500 font-bold mt-1 block">
                                شاملة استخراج الرخص وإعداد المخططات المعمارية
                                والإنشائية متوافقة مع كود البناء السعودي.
                              </span>
                            </td>
                            {template.table?.showUnit && (
                              <td
                                className="p-3 border text-slate-600"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                خدمة مقطوعة
                              </td>
                            )}
                            {template.table?.showQuantity && (
                              <td
                                className="p-3 border font-mono text-slate-600"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                1
                              </td>
                            )}
                            {template.table?.showUnitPrice && (
                              <td
                                className="p-3 border font-mono text-slate-600"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                25,000 ر.س
                              </td>
                            )}
                            <td
                              className="p-3 border font-mono font-black text-cyan-800 bg-cyan-50/20"
                              style={{ borderColor: `${accentColor}44` }}
                            >
                              25,000 ر.س
                            </td>
                          </tr>
                        ) : (
                          // عرض البنود الافتراضية الخاصة بالنموذج
                          template.items.map((item, idx) => (
                            <tr
                              key={idx}
                              className="avoid-break border-b border-slate-100"
                            >
                              <td
                                className="p-3 border font-mono bg-slate-50/50"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                {idx + 1}
                              </td>
                              <td
                                className="p-3 text-right border leading-relaxed"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                <span className="block font-black mb-1">
                                  {item.name}
                                </span>
                                {item.description && (
                                  <span className="text-[9.5px] text-slate-500 font-bold block">
                                    {item.description}
                                  </span>
                                )}
                              </td>
                              {template.table?.showUnit && (
                                <td
                                  className="p-3 border text-slate-600"
                                  style={{ borderColor: `${accentColor}44` }}
                                >
                                  {item.unit}
                                </td>
                              )}
                              {template.table?.showQuantity && (
                                <td
                                  className="p-3 border font-mono text-slate-600"
                                  style={{ borderColor: `${accentColor}44` }}
                                >
                                  {item.quantity}
                                </td>
                              )}
                              {template.table?.showUnitPrice && (
                                <td
                                  className="p-3 border font-mono text-slate-600"
                                  style={{ borderColor: `${accentColor}44` }}
                                >
                                  {item.unitPrice.toLocaleString()} ر.س
                                </td>
                              )}
                              <td
                                className="p-3 border font-mono font-black text-cyan-800 bg-cyan-50/20"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                {(
                                  item.quantity * item.unitPrice
                                ).toLocaleString()}{" "}
                                ر.س
                              </td>
                            </tr>
                          ))
                        )}

                        {/* قسم الماليات */}
                        {template.financials?.showSubtotal && (
                          <tr className="bg-slate-50/80">
                            <td
                              colSpan={
                                2 +
                                (template.table?.showUnit ? 1 : 0) +
                                (template.table?.showQuantity ? 1 : 0) +
                                (template.table?.showUnitPrice ? 1 : 0) -
                                1
                              }
                              className="p-2.5 border text-left font-black"
                              style={{ borderColor: `${accentColor}44` }}
                            >
                              الإجمالي قبل الضريبة:
                            </td>
                            <td
                              className="p-2.5 border font-mono font-black text-[12px] text-slate-800"
                              style={{ borderColor: `${accentColor}44` }}
                            >
                              25,000.00 ر.س
                            </td>
                          </tr>
                        )}
                        <tr className="bg-transparent">
                          <td
                            colSpan={
                              2 +
                              (template.table?.showUnit ? 1 : 0) +
                              (template.table?.showQuantity ? 1 : 0) +
                              (template.table?.showUnitPrice ? 1 : 0) -
                              1
                            }
                            className="p-2.5 border text-left font-bold text-slate-600"
                            style={{ borderColor: `${accentColor}44` }}
                          >
                            ضريبة القيمة المضافة (
                            {template.financials?.vatPercentage || 15}%):
                          </td>
                          <td
                            className="p-2.5 border font-mono font-bold text-[12px] text-slate-700"
                            style={{ borderColor: `${accentColor}44` }}
                          >
                            3,750.00 ر.س
                          </td>
                        </tr>
                        {template.financials?.showTotal && (
                          <tr
                            className="font-black text-white"
                            style={{ backgroundColor: accentColor }}
                          >
                            <td
                              colSpan={
                                2 +
                                (template.table?.showUnit ? 1 : 0) +
                                (template.table?.showQuantity ? 1 : 0) +
                                (template.table?.showUnitPrice ? 1 : 0) -
                                1
                              }
                              className="p-3 border text-left text-[12.5px]"
                              style={{ borderColor: accentColor }}
                            >
                              الإجمالي النهائي المستحق الصافي للدفع:
                            </td>
                            <td
                              className="p-3 border font-mono text-[13px]"
                              style={{ borderColor: accentColor }}
                            >
                              28,750.00 ر.س
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </section>

                  {/* الشروط والأحكام */}
                  <section className="mb-10 avoid-break">
                    <h4
                      className="mb-3 text-[13px] font-black flex items-center gap-1.5"
                      style={{ color: accentColor }}
                    >
                      <Scale
                        className="w-4.5 h-4.5"
                        style={{ color: goldColor }}
                      />{" "}
                      ثالثاً:{" "}
                      {template.terms?.title ||
                        "الشروط والأحكام والالتزامات العامة"}
                    </h4>
                    <div className="bg-slate-50/50 border border-slate-100 p-4 rounded-xl text-justify text-[11.5px] leading-[2.2] text-slate-700 font-bold whitespace-pre-wrap">
                      {template.terms?.text ||
                        "سيتم إدراج الشروط والأحكام الخاصة بالمكتب هنا..."}
                    </div>
                  </section>

                  {/* التوقيعات */}
                  {(template.signatures?.showClient ||
                    template.signatures?.showOffice) && (
                    <section className="mt-12 avoid-break">
                      <h4
                        className="mb-6 text-[12.5px] font-black text-center"
                        style={{ color: accentColor }}
                      >
                        صيغة الاعتماد والموافقة النهائية والتواقيع الرسمية
                      </h4>
                      <table
                        className="w-full border-collapse text-center text-[11px] table-fixed"
                        style={{ border: `2px solid ${accentColor}` }}
                      >
                        <thead>
                          <tr
                            className="font-black text-white text-[12px]"
                            style={{ backgroundColor: accentColor }}
                          >
                            {template.signatures?.showClient && (
                              <th
                                className="p-3 border-l"
                                style={{ borderColor: accentColor }}
                              >
                                الطرف الثاني:{" "}
                                {template.signatures?.clientLabel ||
                                  "اعتماد العميل المالك"}
                              </th>
                            )}
                            {template.signatures?.showOffice && (
                              <th className="p-3">
                                الطرف الأول:{" "}
                                {template.signatures?.officeLabel ||
                                  "مقدم الخدمة"}
                              </th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="font-bold text-[#123f59]">
                          <tr>
                            {template.signatures?.showClient && (
                              <td
                                className="p-4 border-l align-top"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                <div className="flex flex-col gap-4 text-right pr-4">
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      الاسم:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      {dummyData.clientName}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      الصفة:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      المالك للمشروع
                                    </span>
                                  </div>
                                  <div className="mt-6 text-center text-slate-400 font-bold mb-4">
                                    التوقيع والختم:
                                    <br />
                                    <span className="inline-block mt-6">
                                      ...................................................
                                    </span>
                                  </div>
                                </div>
                              </td>
                            )}
                            {template.signatures?.showOffice && (
                              <td
                                className="p-4 align-top"
                                style={{ borderColor: `${accentColor}44` }}
                              >
                                <div className="flex flex-col gap-4 text-right pr-4">
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      الجهة:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      شركة ديتيلز كونسولتس الهندسية
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 font-bold">
                                      الممثل:
                                    </span>{" "}
                                    <span className="font-black text-slate-800">
                                      إدارة العقود والمشاريع
                                    </span>
                                  </div>
                                  <div className="mt-6 text-center text-slate-400 font-bold mb-4">
                                    الاعتماد الرسمي:
                                    <br />
                                    <span className="inline-block mt-6">
                                      ...................................................
                                    </span>
                                  </div>
                                </div>
                              </td>
                            )}
                          </tr>
                        </tbody>
                      </table>
                    </section>
                  )}
                </td>
              </tr>
            </tbody>

            {/* 🚀 التذييل (Footer) */}
            <tfoot className="table-footer-group">
              <tr>
                <td
                  style={{ padding: `10mm ${paddingMm}mm 10mm ${paddingMm}mm` }}
                >
                  <DetailsPrintFooter accentColor={accentColor} />
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
