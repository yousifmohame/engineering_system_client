import React, { useState, useRef } from "react";
import {
  Download,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  CalendarClock,
  User,
  Pen,
  Stamp,
  Upload,
} from "lucide-react";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ==========================================
// 💡 1. مكون رسم البلوكات (تفاعلي + طباعة + بيانات تجريبية)
// ==========================================
const PreviewBlockRenderer = ({
  block,
  formSettings,
  fillMode,
  value,
  onChange,
  isForPrint,
}) => {
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
    ? `${block.position.width}px`
    : "100%";
  const heightStyle = block.position?.height
    ? `${block.position.height}px`
    : "auto";
  const fontSizeStyle = block.style?.fontSize
    ? `${block.style.fontSize}px`
    : "inherit";

  const isInteractive = fillMode === "interactive";
  const isFilled = fillMode === "filled";

  // 💡 الذكاء هنا: إظهار حقل الإدخال فقط إذا كنا في وضع التفاعل ولسنا في لحظة الطباعة
  const shouldShowInput = isInteractive && !isForPrint;

  // دالة مساعدة لتحديد القيمة المعروضة وقت الطباعة
  const getDisplayValue = (dummyValue) => {
    if (isInteractive && isForPrint) return value || "";
    if (isFilled) return dummyValue;
    return "";
  };

  switch (block.type) {
    case "title":
      return (
        <h2
          style={{
            ...alignStyles,
            fontSize: block.style?.fontSize ? fontSizeStyle : "24px",
          }}
          className={`font-bold w-full ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}
        >
          {formSettings.name || "عنوان النموذج"}
        </h2>
      );

    case "version":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full"
        >
          الإصدار: {formSettings.version || "1.0"}
        </div>
      );

    case "subject":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="font-bold flex w-full gap-2 items-center"
        >
          <span className="whitespace-nowrap">{block.label}:</span>
          {shouldShowInput ? (
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-transparent border-b border-blue-300 outline-none px-2 text-blue-900 font-normal"
              placeholder="اكتب الموضوع..."
            />
          ) : (
            <span
              className={`border-b border-black flex-1 ${isFilled || (isInteractive && isForPrint && value) ? "border-solid font-normal" : "border-dashed"}`}
            >
              {getDisplayValue("طلب تجديد إقامة")}
            </span>
          )}
        </div>
      );

    case "reference_number":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full"
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
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <span className="font-bold whitespace-nowrap">{block.label}:</span>
          {shouldShowInput ? (
            <input
              type="date"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-mono text-blue-900 w-full"
            />
          ) : (
            <div
              className={`border rounded px-3 py-1 flex items-center gap-2 w-full ${isFilled || (isInteractive && value) ? "bg-white border-slate-200 text-slate-800 font-mono font-bold" : "bg-slate-50 border-slate-300 text-slate-500"}`}
            >
              {getDisplayValue("2026-03-30") ||
                block.defaultValue ||
                "____ / __ / __"}{" "}
              {(!isInteractive || !value) && !isFilled && (
                <CalendarClock size={14} />
              )}
            </div>
          )}
        </div>
      );

    case "time":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <span className="font-bold whitespace-nowrap">{block.label}:</span>
          {shouldShowInput ? (
            <input
              type="time"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2 py-1 outline-none focus:border-blue-500 font-mono text-blue-900 w-full"
            />
          ) : (
            <span
              className="font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded w-full"
              dir="ltr"
            >
              {getDisplayValue("09:45 AM") || "10:30 AM"}
            </span>
          )}
        </div>
      );

    case "text_field":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <label className="font-bold text-slate-700 whitespace-nowrap">
            {block.label}
          </label>
          {shouldShowInput ? (
            <input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 bg-blue-50/30 border-b border-blue-400 outline-none px-2 text-blue-900 w-full"
              placeholder="اكتب هنا..."
            />
          ) : (
            <div
              className={`flex-1 min-h-[24px] w-full flex items-center ${isFilled || (isInteractive && value) ? "px-2 font-semibold text-blue-900 border-b border-solid border-slate-400" : "border-b border-slate-300 border-dashed h-6"}`}
            >
              {getDisplayValue("شركة الرواد للتقنية")}
            </div>
          )}
        </div>
      );

    case "text_area":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex flex-col h-full"
        >
          <label className="font-bold text-slate-700 mb-1.5">
            {block.label}
          </label>
          {shouldShowInput ? (
            <textarea
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              className="w-full flex-1 border border-blue-400 bg-blue-50/30 rounded p-2 outline-none resize-none text-blue-900"
              placeholder="اكتب التفاصيل هنا..."
              style={{ height: heightStyle }}
            />
          ) : (
            <div
              className={`border rounded w-full p-3 flex-1 overflow-hidden whitespace-pre-wrap ${isFilled || (isInteractive && value) ? "bg-white border-slate-200 text-slate-800 leading-loose" : "bg-slate-50 border-slate-300 border-dashed text-slate-500"}`}
              style={{ height: heightStyle }}
            >
              {getDisplayValue(
                "نأمل منكم الموافقة على طلبنا الموضح أعلاه، حيث أن جميع الأوراق والمستندات الثبوتية قد تم استيفاؤها وجاهزة للتسليم.",
              ) ||
                block.defaultValue ||
                "مساحة للكتابة..."}
            </div>
          )}
        </div>
      );

    case "image_upload":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, height: heightStyle }}
          className="flex flex-col"
        >
          <label
            style={{ fontSize: fontSizeStyle }}
            className="font-bold text-slate-700 mb-1.5"
          >
            {block.label}
          </label>
          {shouldShowInput ? (
            <div className="relative border-2 border-dashed border-blue-400 rounded-lg bg-blue-50/30 w-full flex-1 flex flex-col items-center justify-center text-blue-500 overflow-hidden group">
              {value ? (
                <img
                  src={value}
                  alt="uploaded"
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <Upload
                    size={24}
                    className="mb-1 opacity-70 group-hover:scale-110 transition-transform"
                  />
                  <span style={{ fontSize: "10px" }}>ارفع الصورة</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => onChange(ev.target.result);
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div
              className={`border-2 rounded-lg w-full flex-1 flex flex-col items-center justify-center overflow-hidden ${value && isForPrint ? "border-transparent bg-transparent" : "border-dashed border-slate-300 bg-slate-50 text-slate-400"}`}
            >
              {value ? (
                <img
                  src={value}
                  alt="uploaded"
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <Upload size={32} className="mb-2 opacity-50" />
                  <span style={{ fontSize: "12px" }}>انقر لإرفاق صورة</span>
                </>
              )}
            </div>
          )}
        </div>
      );

    case "employee_info":
      return (
        <div
          style={{ width: widthStyle, fontSize: fontSizeStyle }}
          className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4"
        >
          <div className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <User size={18} /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-2 border border-indigo-100 rounded-lg flex gap-2 items-center">
              <span>الاسم:</span>
              {shouldShowInput ? (
                <input
                  type="text"
                  onChange={(e) => onChange({ ...value, name: e.target.value })}
                  value={value?.name || ""}
                  className="border-b border-indigo-200 outline-none flex-1 bg-transparent text-indigo-900"
                />
              ) : (
                <span
                  className={
                    isFilled || (isInteractive && value?.name)
                      ? "font-bold text-indigo-900"
                      : "text-slate-400"
                  }
                >
                  {isInteractive && isForPrint
                    ? value?.name || "--------"
                    : isFilled
                      ? "أحمد محمد الغامدي"
                      : "--------"}
                </span>
              )}
            </div>
            <div className="bg-white p-2 border border-indigo-100 rounded-lg flex gap-2 items-center">
              <span>الرقم:</span>
              {shouldShowInput ? (
                <input
                  type="text"
                  onChange={(e) =>
                    onChange({ ...value, empId: e.target.value })
                  }
                  value={value?.empId || ""}
                  className="border-b border-indigo-200 outline-none flex-1 bg-transparent text-indigo-900 font-mono"
                />
              ) : (
                <span
                  className={
                    isFilled || (isInteractive && value?.empId)
                      ? "font-bold font-mono text-indigo-900"
                      : "text-slate-400"
                  }
                >
                  {isInteractive && isForPrint
                    ? value?.empId || "--------"
                    : isFilled
                      ? "EMP-8492"
                      : "--------"}
                </span>
              )}
            </div>
          </div>
        </div>
      );

    case "checkbox":
      const isChecked = isInteractive ? !!value : isFilled;
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-3"
        >
          {shouldShowInput ? (
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => onChange(e.target.checked)}
              className="w-5 h-5 accent-blue-600 cursor-pointer"
            />
          ) : (
            <div
              className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${isChecked ? "bg-blue-600 border-blue-600" : "border-slate-400"}`}
            >
              {isChecked && (
                <span className="text-white text-[10px] leading-none">✓</span>
              )}
            </div>
          )}
          <span className="font-bold text-slate-700">{block.label}</span>
        </div>
      );

    case "signature":
    case "office_signature":
    case "fingerprint":
    case "office_stamp":
      return (
        <div
          style={{
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className={`flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="font-bold mb-2"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            className={`w-full flex-1 border-2 rounded-xl flex items-center justify-center overflow-hidden
            ${shouldShowInput ? "border-blue-300 bg-blue-50/50 cursor-pointer border-dashed hover:bg-blue-100" : isFilled || (isInteractive && value && isForPrint) ? "border-transparent bg-transparent" : "border-slate-300 border-dashed bg-slate-50 text-slate-400"}
          `}
          >
            {shouldShowInput ? (
              <label className="text-[10px] text-blue-500 flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center">
                <Upload size={16} /> انقر لإرفاق توقيع/ختم
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => onChange(ev.target.result);
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            ) : isInteractive && value && isForPrint ? (
              <img
                src={value}
                alt="signature"
                className="max-w-full max-h-full mix-blend-multiply"
              />
            ) : isFilled ? (
              <span className="font-['Brush_Script_MT',cursive] text-2xl opacity-80 rotate-[-10deg] text-blue-900">
                Youssef.F
              </span>
            ) : block.type === "office_stamp" ? (
              <Stamp size={32} />
            ) : (
              <Pen size={32} />
            )}
          </div>
        </div>
      );

    case "separator":
      return <hr className="my-2 border-t-2 border-slate-300 w-full" />;
    case "static_text":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="leading-relaxed w-full whitespace-pre-wrap"
        >
          {block.defaultValue || block.label}
        </div>
      );

    default:
      return (
        <div className="p-3 border border-dashed border-blue-300 bg-blue-50 text-blue-800 text-center rounded-lg w-full font-bold">
          {block.label}
        </div>
      );
  }
};

// ==========================================
// 💡 2. مكون نافذة المعاينة والطباعة (Preview Modal)
// ==========================================
export default function FormPreviewModal({ form, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const [exportType, setExportType] = useState("pdf");
  const [fillMode, setFillMode] = useState("interactive");
  const [isExporting, setIsExporting] = useState(false);
  const [formValues, setFormValues] = useState({});

  // 💡 State سرية لتغيير مظهر الـ Inputs أثناء الطباعة
  const [isForPrint, setIsForPrint] = useState(false);

  const componentRef = useRef();
  const prevZoomRef = useRef(100);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));

  const handleValueChange = (uid, val) => {
    setFormValues((prev) => ({ ...prev, [uid]: val }));
  };

  const pageSettings = form?.pageSettings || {
    size: "A4",
    orientation: "portrait",
  };
  const colorMode = form?.colorMode === "color" ? "🎨 ملون" : "⚫ أبيض وأسود";
  const fontFamily = form?.fontFamily || "Tajawal";

  const A4_HEIGHT_PX = 1122.5;
  const calculatePaperHeight = () => {
    if (!form?.blocks || form.blocks.length === 0) return A4_HEIGHT_PX;
    const maxBottom = Math.max(
      ...form.blocks.map(
        (b) => (b.position?.y || 0) + (b.position?.height || 0),
      ),
    );
    const requiredPages = Math.max(
      1,
      Math.ceil((maxBottom + 100) / A4_HEIGHT_PX),
    );
    return requiredPages * A4_HEIGHT_PX;
  };
  const dynamicHeight = calculatePaperHeight();
  const pagesCount = Math.ceil(dynamicHeight / A4_HEIGHT_PX);

  // 🖨️ الطباعة الاحترافية عبر المتصفح
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `نموذج_${form?.name || "بدون_اسم"}`,
    pageStyle: `
      @page { size: A4 ${pageSettings.orientation}; margin: 0mm !important; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-container { transform: scale(1) !important; box-shadow: none !important; border: none !important; }
      }
    `,
    onBeforeGetContent: () => {
      return new Promise((resolve) => {
        prevZoomRef.current = zoomLevel;
        setZoomLevel(100);
        setIsForPrint(true); // 💡 إخفاء حقول الإدخال وتحويلها لنصوص للطباعة
        setTimeout(resolve, 400); // 💡 انتظار الريندر
      });
    },
    onAfterPrint: () => {
      setZoomLevel(prevZoomRef.current);
      setIsForPrint(false); // 💡 إعادة حقول الإدخال
    },
    onPrintError: () => {
      toast.error("حدث خطأ أثناء الطباعة");
      setZoomLevel(prevZoomRef.current);
      setIsForPrint(false);
    },
  });

  // 💾 التصدير الاحترافي (PDF/صورة) بدقة فائقة
  const handleExport = async () => {
    if (!componentRef.current) return;
    setIsExporting(true);
    toast.loading("جاري إعداد الملف بدقة فائقة...", { duration: 5000 });

    try {
      const currentZoom = zoomLevel;
      setZoomLevel(100);
      setIsForPrint(true); // 💡 إخفاء حقول الإدخال

      await new Promise((resolve) => setTimeout(resolve, 500)); // انتظار تطبيق التعديلات

      const element = componentRef.current;

      // 💡 دقة استوديو (Scale: 4) للشركات
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const fileName = `نموذج_${form?.name || "بدون_اسم"}_${new Date().getTime()}`;

      if (exportType === "image") {
        const link = document.createElement("a");
        link.download = `${fileName}.jpg`;
        link.href = imgData;
        link.click();
        toast.dismiss();
        toast.success("تم تصدير الصورة بدقة عالية بنجاح");
      } else if (exportType === "pdf") {
        // 💡 ضغط PDF بمستوى الشركات
        const pdf = new jsPDF({
          orientation: pageSettings.orientation,
          unit: "mm",
          format: "a4",
          compress: true,
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, "", "FAST"); // FAST compression
        pdf.save(`${fileName}.pdf`);
        toast.dismiss();
        toast.success("تم تصدير ملف الـ PDF بنجاح");
      }

      setZoomLevel(currentZoom);
      setIsForPrint(false);
    } catch (error) {
      console.error(error);
      toast.dismiss();
      toast.error("حدث خطأ أثناء التصدير");
      setIsForPrint(false);
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
              معاينة وتعبئة: {form?.name || "بدون اسم"}
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

            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 bg-white outline-none cursor-pointer"
            >
              <option value="pdf">تصدير كـ PDF</option>
              <option value="image">تصدير كصورة HD</option>
            </select>

            <select
              value={fillMode}
              onChange={(e) => setFillMode(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 bg-blue-50 outline-none cursor-pointer"
            >
              <option value="interactive">✍️ وضع التعبئة والطباعة</option>
              <option value="blank">📄 معاينة فارغة</option>
              <option value="filled">🧪 معاينة ببيانات تجريبية</option>
            </select>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-bold text-[12px] shadow-sm hover:brightness-110 transition-all disabled:opacity-50"
            >
              <Download size={16} />{" "}
              {isExporting ? "جاري التجهيز..." : "تحميل الملف"}
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
            ref={componentRef}
            className={`print-container bg-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative flex flex-col origin-top transition-transform duration-200 ${form?.showBorder ? "border-[6px] border-slate-900" : ""}`}
            style={{
              width: "210mm",
              height: `${dynamicHeight}px`,
              transform: `scale(${zoomLevel / 100})`,
              fontFamily: fontFamily,
            }}
          >
            {/* 💡 خطوط الفواصل الوهمية تظهر فقط وقت التصميم/المعاينة وليس وقت الطباعة */}
            {!isForPrint &&
              Array.from({ length: pagesCount - 1 }).map((_, i) => (
                <div
                  key={`break-${i}`}
                  className="absolute left-0 right-0 border-b-2 border-dashed border-red-200 z-0 pointer-events-none"
                  style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
                ></div>
              ))}

            {/* Content Area */}
            <div
              className={`w-full h-full relative z-10 min-h-full ${form?.colorMode === "bw" ? "grayscale" : ""}`}
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
                </div>
              ) : (
                <div className="w-full h-full relative z-10 min-h-full">
                  {form.blocks.map((block) => {
                    const pos = block.position || {
                      x: 0,
                      y: 0,
                      width: 200,
                      height: 50,
                    };
                    return (
                      <div
                        key={block.id || block.uid}
                        className="absolute"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          width: `${pos.width}px`,
                          height: `${pos.height}px`,
                          overflow: "visible", // لتجنب قص التواقيع
                        }}
                      >
                        <div className="w-full h-full flex flex-col">
                          {/* 💡 تمرير isForPrint للمكون ليقوم بتحويل المدخلات إلى نصوص */}
                          <PreviewBlockRenderer
                            block={block}
                            formSettings={form}
                            fillMode={fillMode}
                            value={formValues[block.uid]}
                            onChange={(val) =>
                              handleValueChange(block.uid, val)
                            }
                            isForPrint={isForPrint}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 💡 ترقيم الصفحات الديناميكي */}
            {Array.from({ length: pagesCount }).map((_, i) => (
              <div
                key={`footer-${i}`}
                className="absolute left-[20mm] right-[20mm] flex justify-between text-[10px] text-slate-500 font-mono pointer-events-none"
                style={{ top: `${(i + 1) * A4_HEIGHT_PX - 40}px` }}
              >
                <span dir="ltr">{form?.code || "FRM-XXX"}</span>
                <span className="font-bold text-slate-700">
                  صفحة {i + 1} من {pagesCount}
                </span>
                <span>نظام الموارد البشرية</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
