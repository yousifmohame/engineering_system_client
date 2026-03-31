import React, { useState, useRef } from "react";
import { Download, Printer, X, ZoomIn, ZoomOut, Grid3x3 } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ==========================================
// 💡 مكون رسم البلوكات (مع دعم البيانات التجريبية)
// ==========================================
// ملاحظة: تأكد من دمج هذا المكون إذا كان في ملف منفصل
// قمت بتعديله هنا ليقبل `isFilled`
const PreviewBlockRenderer = ({ block, formSettings, isFilled }) => {
  const getAlignStyles = (align) => {
    if (align === "center")
      return {
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      };
    if (align === "left")
      return {
        textAlign: "left",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row-reverse",
      };
    return {
      textAlign: "right",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    };
  };

  const alignStyles = getAlignStyles(block.style?.alignment);
  const widthStyle = block.position?.width
    ? `${block.position.width}mm`
    : "100%";
  const heightStyle = block.position?.height
    ? `${block.position.height}mm`
    : "auto";

  switch (block.type) {
    case "title":
      return (
        <h2
          style={alignStyles}
          className={`text-xl font-bold mb-4 w-full ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}
        >
          {formSettings.name || "عنوان النموذج"}
        </h2>
      );
    case "version":
      return (
        <div
          style={alignStyles}
          className="text-[10px] text-slate-500 font-mono mb-2 w-full"
        >
          الإصدار: {formSettings.version || "1.0"}
        </div>
      );
    case "subject":
      return (
        <div
          style={alignStyles}
          className="text-[11px] font-bold mb-2 flex w-full gap-2"
        >
          <span>{block.label}:</span>
          <span
            className={`border-b border-black flex-1 ${isFilled ? "border-solid font-normal" : "border-dashed"}`}
          >
            {isFilled ? "طلب تجديد إقامة" : ""}
          </span>
        </div>
      );
    case "reference_number":
      return (
        <div
          style={alignStyles}
          className="text-[10px] text-slate-500 font-mono mb-2 w-full"
        >
          {block.label}: {formSettings.code || "FRM-XXX"}-
          {new Date().getFullYear()}-0001
        </div>
      );
    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex items-center gap-2 text-[11px]"
        >
          <span className="font-bold">{block.label}:</span>
          <div
            className={`border rounded px-3 py-1 flex items-center gap-2 min-w-[100px] ${isFilled ? "bg-white border-slate-200 text-slate-800 font-mono font-bold" : "bg-slate-50 border-slate-300 text-slate-500"}`}
          >
            {isFilled ? "2026/03/30" : block.defaultValue || "__ / __ / ____"}
          </div>
        </div>
      );
    case "time":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex items-center gap-2 text-[11px]"
        >
          <span className="font-bold">{block.label}:</span>
          <span
            className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
            dir="ltr"
          >
            {isFilled ? "09:45 AM" : "10:30 AM"}
          </span>
        </div>
      );
    case "text_field":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex items-center gap-2"
        >
          <label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
            {block.label}
          </label>
          <div
            className={`flex-1 min-h-[24px] ${isFilled ? "text-[11px] px-2 font-semibold text-blue-900 border-b border-dotted border-slate-400" : "border-b border-slate-300 h-4"}`}
          >
            {isFilled ? "شركة الرواد للتقنية" : ""}
          </div>
        </div>
      );
    case "text_area":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex flex-col"
        >
          <label className="text-[11px] font-bold text-slate-700 mb-1">
            {block.label}
          </label>
          <div
            className={`border rounded w-full p-2 text-[10px] overflow-hidden ${isFilled ? "bg-white border-slate-200 text-slate-800 leading-loose" : "bg-slate-50 border-slate-300 text-slate-500"}`}
            style={{ height: heightStyle }}
          >
            {isFilled
              ? "نأمل منكم الموافقة على طلبنا الموضح أعلاه، حيث أن جميع الأوراق والمستندات الثبوتية قد تم استيفاؤها وجاهزة للتسليم."
              : block.defaultValue || "مساحة للكتابة..."}
          </div>
        </div>
      );
    case "employee_info":
      return (
        <div
          style={{ width: widthStyle }}
          className="mb-4 border border-indigo-200 bg-indigo-50/30 rounded-lg p-3"
        >
          <div className="text-[11px] font-bold text-indigo-800 mb-2 flex items-center gap-1.5">
            {block.label}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1.5 border border-indigo-100 rounded">
              الاسم:{" "}
              {isFilled ? (
                <span className="font-bold">أحمد محمد الغامدي</span>
              ) : (
                "----------------"
              )}
            </div>
            <div className="bg-white p-1.5 border border-indigo-100 rounded">
              الرقم الوظيفي:{" "}
              {isFilled ? (
                <span className="font-bold font-mono">EMP-8492</span>
              ) : (
                "---------"
              )}
            </div>
          </div>
        </div>
      );
    case "table":
      return (
        <div
          style={{ width: widthStyle }}
          className="mb-4 border border-slate-300 rounded overflow-hidden"
        >
          <table className="w-full text-center text-[10px] bg-white">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-1.5">م</th>
                <th className="p-1.5">البيان</th>
                <th className="p-1.5">القيمة</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-1.5">1</td>
                <td className="p-1.5">{isFilled ? "بدل سكن" : "—"}</td>
                <td className="p-1.5">{isFilled ? "2,500" : "—"}</td>
              </tr>
              <tr>
                <td className="p-1.5">2</td>
                <td className="p-1.5">{isFilled ? "بدل مواصلات" : "—"}</td>
                <td className="p-1.5">{isFilled ? "500" : "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case "checkbox":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-2 flex items-center gap-2"
        >
          <div
            className={`w-3.5 h-3.5 border-2 rounded-sm flex items-center justify-center ${isFilled ? "bg-blue-600 border-blue-600" : "border-slate-400"}`}
          >
            {isFilled && <span className="text-white text-[10px]">✓</span>}
          </div>
          <span className="text-[11px] font-bold text-slate-700">
            {block.label}
          </span>
        </div>
      );
    case "signature":
      return (
        <div
          style={{ width: widthStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            style={{ height: heightStyle }}
            className={`w-full border-2 border-slate-300 rounded flex items-center justify-center ${isFilled ? "bg-transparent" : "bg-slate-50"}`}
          >
            {isFilled && (
              <span className="font-['Brush_Script_MT',cursive] text-2xl opacity-80 rotate-[-10deg]">
                Youssef.F
              </span>
            )}
          </div>
        </div>
      );
    case "office_signature":
      return (
        <div
          style={{ width: widthStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1 text-cyan-700"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            style={{ height: heightStyle }}
            className={`w-full border-2 rounded flex items-center justify-center text-[10px] overflow-hidden ${isFilled ? "border-transparent" : "border-cyan-600 bg-cyan-50 text-cyan-600"}`}
          >
            {isFilled ? (
              block.defaultValue ? (
                <img
                  src={block.defaultValue}
                  alt="Signature"
                  className="max-w-full max-h-full mix-blend-multiply"
                />
              ) : (
                <span className="font-bold text-blue-900 text-lg">
                  المدير العام
                </span>
              )
            ) : block.defaultValue ? (
              <img
                src={block.defaultValue}
                alt="Signature"
                className="max-w-full max-h-full"
              />
            ) : (
              "توقيع رسمي"
            )}
          </div>
        </div>
      );
    case "office_stamp":
      return (
        <div
          style={{ width: widthStyle, height: heightStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1 text-rose-700"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            className={`w-full h-full border-2 rounded-full flex items-center justify-center overflow-hidden aspect-square ${isFilled ? "border-transparent mix-blend-multiply opacity-80" : "border-dashed border-rose-600 bg-rose-50 text-rose-600"}`}
          >
            {isFilled ? (
              block.defaultValue ? (
                <img
                  src={block.defaultValue}
                  alt="Stamp"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full border-[3px] border-red-500 flex items-center justify-center text-[8px] font-bold text-red-500 rotate-[-15deg]">
                  ختم معتمد
                </div>
              )
            ) : block.defaultValue ? (
              <img
                src={block.defaultValue}
                alt="Stamp"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-[8px] font-bold">ختم</span>
            )}
          </div>
        </div>
      );
    case "fingerprint":
      return (
        <div
          style={{ width: widthStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            style={{ height: heightStyle }}
            className={`w-full border-2 rounded aspect-square flex items-center justify-center ${isFilled ? "border-transparent opacity-50" : "border-slate-300 bg-slate-50"}`}
          >
            {isFilled && <span className="text-2xl">☝️</span>}
          </div>
        </div>
      );
    case "separator":
      return <hr className="my-4 border-t-2 border-slate-300 w-full" />;
    case "spacer":
      return <div style={{ height: heightStyle, width: "100%" }}></div>;
    case "watermark":
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-6xl font-black text-slate-400/10 -rotate-45 overflow-hidden z-0">
          {block.defaultValue || "WATERMARK"}
        </div>
      );
    case "static_text":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="text-[11px] leading-relaxed mb-3 w-full whitespace-pre-wrap"
        >
          {block.defaultValue || block.label}
        </div>
      );
    default:
      return null;
  }
};

// ==========================================
// 💡 مكون نافذة المعاينة (Preview Modal)
// ==========================================
export default function FormPreviewModal({ form, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  // States للخيارات
  const [exportType, setExportType] = useState("pdf");
  const [fillMode, setFillMode] = useState("blank"); // blank أو filled
  const [isExporting, setIsExporting] = useState(false);

  // Reference للمنطقة المراد طباعتها/تصديرها
  const componentRef = useRef();
  const prevZoomRef = useRef(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));

  // استخراج الإعدادات لتجنب الأخطاء
  const pageSettings = form?.pageSettings || {
    size: "A4",
    orientation: "portrait",
  };
  const colorMode = form?.colorMode === "color" ? "🎨 ملون" : "⚫ أبيض وأسود";
  const fontFamily = form?.fontFamily || "Tajawal";

  // 🖨️ دالة الطباعة (تستخدم react-to-print)
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `نموذج_${form?.name || "بدون_اسم"}`,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        prevZoomRef.current = zoomLevel; // حفظ الزوم الحالي
        setZoomLevel(100); // إعادة الزوم لـ 100% للطباعة الصحيحة
        setTimeout(resolve, 300); // انتظار الريندر
      });
    },
    onAfterPrint: () => {
      setZoomLevel(prevZoomRef.current); // استرجاع الزوم القديم
    },
    onPrintError: () => {
      toast.error("حدث خطأ أثناء الطباعة");
      setZoomLevel(prevZoomRef.current);
    },
  });

  // 💾 دالة التصدير (PDF / صـورة)
  const handleExport = async () => {
    if (!componentRef.current) return;
    setIsExporting(true);
    toast.loading("جاري تجهيز الملف للتصدير...");

    try {
      // إعادة الزوم لـ 100% للحصول على دقة عالية
      const currentZoom = zoomLevel;
      setZoomLevel(100);

      // ننتظر قليلاً ليتم تطبيق الزوم
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = componentRef.current;

      // استخدام html2canvas لالتقاط صورة للعنصر
      const canvas = await html2canvas(element, {
        scale: 2, // دقة عالية
        useCORS: true, // السماح بتحميل الصور الخارجية
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const fileName = `نموذج_${form?.name || "بدون_اسم"}_${new Date().getTime()}`;

      if (exportType === "image") {
        // تحميل كصورة
        const link = document.createElement("a");
        link.download = `${fileName}.jpg`;
        link.href = imgData;
        link.click();
        toast.dismiss();
        toast.success("تم تصدير الصورة بنجاح");
      } else if (exportType === "pdf") {
        // تحميل كـ PDF
        // A4 مقاس بالمليمتر = 210x297
        const pdf = new jsPDF({
          orientation: pageSettings.orientation,
          unit: "mm",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${fileName}.pdf`);
        toast.dismiss();
        toast.success("تم تصدير ملف الـ PDF بنجاح");
      } else if (exportType === "docx") {
        // بما أن تصدير Word معقد جداً في المتصفح، سنقوم بإنشاء ملف HTML كبديل يقرأه الـ Word
        const htmlContent = `
          <html dir="rtl" lang="ar">
            <head><meta charset="utf-8"><title>${form?.name}</title></head>
            <body style="font-family: ${fontFamily}, Arial, sans-serif;">
              <h2>${form?.name}</h2>
              <p>تم التصدير من النظام. لعرض دقيق يرجى استخدام التصدير كـ PDF.</p>
              <img src="${imgData}" style="width: 100%;" />
            </body>
          </html>
        `;
        const blob = new Blob(["\ufeff", htmlContent], {
          type: "application/msword",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.doc`;
        link.click();
        toast.dismiss();
        toast.success("تم تصدير ملف الـ Word بنجاح");
      }

      // استرجاع الزوم
      setZoomLevel(currentZoom);
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-xl w-full max-w-[1200px] h-[90vh] flex flex-col shadow-2xl overflow-hidden font-[Tajawal]">
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b-2 border-slate-200 flex items-center justify-between bg-white shrink-0 z-10">
          <div>
            <div className="text-[15px] font-bold text-slate-900">
              معاينة النموذج: {form?.name || "بدون اسم"}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              {form?.code || "FRM-XXX"} • الإصدار {form?.version || "1.0"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 ml-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-[11px] font-bold font-mono text-slate-700 min-w-[40px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1 hover:bg-white rounded text-slate-600 transition-colors"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            {/* 💡 خيارات التصدير والتعبئة مربوطة بالـ State */}
            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 bg-white outline-none cursor-pointer"
            >
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="image">صورة</option>
            </select>

            <select
              value={fillMode}
              onChange={(e) => setFillMode(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 bg-white outline-none cursor-pointer"
            >
              <option value="blank">نموذج فارغ</option>
              <option value="filled">معبأ ببيانات تجريبية</option>
            </select>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-bold text-[12px] shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Download size={16} /> {isExporting ? "جاري التصدير..." : "تصدير"}
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-800 text-white font-bold text-[12px] shadow-sm hover:bg-blue-900 transition-colors"
            >
              <Printer size={16} /> طباعة
            </button>

            <div className="w-px h-6 bg-slate-300 mx-1"></div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Canvas Area ── */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-400 to-slate-500 flex items-start justify-center py-10 px-5 custom-scrollbar">
          <div
            // 💡 أضفنا ref هنا ليتمكن النظام من تصوير وطباعة هذا المكون تحديداً
            ref={componentRef}
            className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden transition-transform duration-200 origin-top flex flex-col"
            style={{
              width: "210mm", // مقاس A4
              minHeight:
                pageSettings.orientation === "portrait" ? "297mm" : "210mm",
              transform: `scale(${zoomLevel / 100})`,
              padding: `${pageSettings.margins?.top || 20}mm ${pageSettings.margins?.right || 20}mm ${pageSettings.margins?.bottom || 20}mm ${pageSettings.margins?.left || 20}mm`,
              fontFamily: fontFamily,
            }}
          >
            {/* Background Image */}
            {form?.bgImage && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-5 z-0"
                style={{ backgroundImage: `url(${form.bgImage})` }}
              />
            )}

            {/* Header Image */}
            {form?.headerImage && (
              <div
                className="absolute top-0 left-0 right-0 bg-cover bg-center z-[1]"
                style={{
                  height: `${pageSettings.header_height}mm`,
                  backgroundImage: `url(${form.headerImage})`,
                }}
              />
            )}

            {/* Content Area */}
            <div
              className={`flex-1 w-full relative z-10 ${form?.colorMode === "bw" ? "grayscale" : ""}`}
              style={{
                paddingTop: form?.headerImage
                  ? `${pageSettings.header_height}mm`
                  : 0,
                paddingBottom: form?.footerImage
                  ? `${pageSettings.footer_height}mm`
                  : 0,
              }}
            >
              {!form.blocks || form.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-slate-500 opacity-60 h-full mt-20">
                  <Grid3x3
                    size={48}
                    className="mb-3 text-slate-300"
                    strokeWidth={1.5}
                  />
                  <div className="text-[14px] font-bold mb-1">
                    نموذج فارغ للتصدير
                  </div>
                  <div className="text-[11px]">
                    لم يتم إضافة بلوكات لهذا النموذج
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {form.blocks.map((block) => (
                    <div key={block.id || block.uid}>
                      {/* 💡 نمرر حالة fillMode ليقوم بلوك الـ Renderer برسم بيانات تجريبية */}
                      <PreviewBlockRenderer
                        block={block}
                        formSettings={form}
                        isFilled={fillMode === "filled"}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Image */}
            {form?.footerImage && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-cover bg-center z-[1]"
                style={{
                  height: `${pageSettings.footer_height}mm`,
                  backgroundImage: `url(${form.footerImage})`,
                }}
              />
            )}

            {/* Serial Number */}
            <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] border-t border-slate-200 pt-2 text-center text-[8px] text-slate-400 font-mono flex justify-between z-10">
              <span dir="ltr">
                Serial: {form?.code || "FRM-XXX"}-{new Date().getFullYear()}
                -0001
              </span>
              <span>نظام الموارد البشرية المتقدم</span>
              <span dir="ltr">Ver: {form?.version || "1.0"}</span>
            </div>
          </div>
        </div>

        {/* ── Footer Stats ── */}
        <div className="px-6 py-3 border-t border-slate-300 bg-slate-50 flex items-center justify-between text-[10.5px] text-slate-600 shrink-0 z-10">
          <div>
            استخدامات النموذج:{" "}
            <strong className="text-slate-900">
              {form?._count?.usages || 0}
            </strong>{" "}
            مرة
          </div>
          <div className="flex items-center gap-3">
            <span>
              حجم الورقة:{" "}
              <strong className="text-slate-900">{pageSettings.size}</strong>
            </span>
            <span>•</span>
            <span>
              الاتجاه:{" "}
              <strong className="text-slate-900">
                {pageSettings.orientation === "portrait" ? "عمودي" : "أفقي"}
              </strong>
            </span>
            <span>•</span>
            <span>
              الألوان: <strong className="text-slate-900">{colorMode}</strong>
            </span>
          </div>
          <div>
            الخط:{" "}
            <strong className="text-slate-900 font-mono">{fontFamily}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
