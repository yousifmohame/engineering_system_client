import React, { useState, useRef, useMemo, useCallback } from "react";
import {
  Download,
  Printer,
  X,
  ZoomIn,
  ZoomOut,
  CheckCircle2,
  FileText,
  User,
  Calendar,
  Clock,
  Upload,
  Pen,
  Stamp,
  LayoutTemplate,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Maximize,
  Frame,
  Grid3x3,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ==========================================
// 💡 1. دوال مساعدة
// ==========================================
const formatHijriDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
};
const formatGregorianDate = (dateString) => {
  if (!dateString) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateString));
  } catch (e) {
    return dateString;
  }
};

// ==========================================
// 💡 2. محرر النصوص الغني المباشر على الورقة (Native Rich Text)
// ==========================================
const CanvasRichText = ({
  value,
  onChange,
  isForPrint,
  placeholder,
  isStatic,
}) => {
  const [isFocused, setIsFocused] = useState(true);
  const contentRef = useRef(null);

  // إذا كان نصاً ثابتاً نضع القيمة الافتراضية كنص حقيقي، أما إذا كان مساحة كتابة فنجعله فارغاً ليعمل الـ Placeholder
  const renderValue = value !== undefined ? value : isStatic ? placeholder : "";

  const handleFormat = (e, command, val = null) => {
    e.preventDefault();
    document.execCommand(command, false, val);
    contentRef.current.focus();
  };

  return (
    <>
      <style>{`
        /* CSS لعمل Placeholder احترافي يختفي عند الطباعة أو الكتابة */
        .rich-text-editor:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          pointer-events: none;
          display: block;
        }
        .print-container .rich-text-editor:empty:before {
          content: none !important;
        }
      `}</style>

      <div
        className={`relative w-full h-full group ${!isForPrint && isFocused ? "ring-2 ring-blue-400 bg-blue-50/10 rounded" : ""}`}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsFocused(false);
            // حفظ التعديلات عند الخروج من المربع
            onChange(contentRef.current.innerHTML);
          }
        }}
      >
        {/* شريط الأدوات العائم (يظهر فقط عند الضغط) */}
        {!isForPrint && isFocused && (
          <div className="absolute -top-12 left-0 right-0 mx-auto w-fit bg-slate-900 text-white rounded-lg shadow-xl flex items-center gap-1 p-1 z-[100] animate-in slide-in-from-bottom-2">
            {/* 💡 التعديل: أداة تغيير حجم الخط */}
            <select
              onChange={(e) => handleFormat(e, "fontSize", e.target.value)}
              className="bg-slate-700 text-white text-xs px-1.5 py-1 rounded outline-none cursor-pointer hover:bg-slate-600"
              defaultValue="3"
              title="حجم الخط"
            >
              <option value="1">صغير جداً</option>
              <option value="2">صغير</option>
              <option value="3">عادي</option>
              <option value="4">متوسط</option>
              <option value="5">كبير</option>
              <option value="6">كبير جداً</option>
              <option value="7">ضخم</option>
            </select>

            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button
              onMouseDown={(e) => handleFormat(e, "bold")}
              className="p-1.5 hover:bg-slate-700 rounded"
            >
              <Bold size={14} />
            </button>
            <button
              onMouseDown={(e) => handleFormat(e, "italic")}
              className="p-1.5 hover:bg-slate-700 rounded"
            >
              <Italic size={14} />
            </button>
            <button
              onMouseDown={(e) => handleFormat(e, "underline")}
              className="p-1.5 hover:bg-slate-700 rounded"
            >
              <Underline size={14} />
            </button>
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <input
              type="color"
              onInput={(e) => handleFormat(e, "foreColor", e.target.value)}
              className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
              title="لون النص"
            />
            <div className="w-px h-4 bg-slate-700 mx-1"></div>
            <button
              onMouseDown={(e) => handleFormat(e, "justifyRight")}
              className="p-1.5 hover:bg-slate-700 rounded"
            >
              <AlignRight size={14} />
            </button>
            <button
              onMouseDown={(e) => handleFormat(e, "justifyCenter")}
              className="p-1.5 hover:bg-slate-700 rounded"
            >
              <AlignCenter size={14} />
            </button>
            <button
              onMouseDown={(e) => handleFormat(e, "justifyLeft")}
              className="p-1.5 hover:bg-slate-700 rounded"
            >
              <AlignLeft size={14} />
            </button>
          </div>
        )}

        <div
          ref={contentRef}
          contentEditable={!isForPrint}
          className="rich-text-editor w-full h-full outline-none whitespace-pre-wrap break-words overflow-hidden"
          style={{
            minHeight: "100%",
            wordBreak: "break-word",
            cursor: isForPrint ? "default" : "text",
          }}
          dangerouslySetInnerHTML={{ __html: renderValue }}
          data-placeholder={placeholder}
        />
      </div>
    </>
  );
};

// ==========================================
// 💡 3. مكون رسم البلوكات الذكي على الورقة
// ==========================================
const CanvasBlockRenderer = ({
  block,
  formSettings,
  value,
  onChange,
  isForPrint,
}) => {
  const [imgHover, setImgHover] = useState(false);

  const alignStyles = {
    textAlign:
      block.style?.alignment === "left"
        ? "left"
        : block.style?.alignment === "center"
          ? "center"
          : "right",
    justifyContent:
      block.style?.alignment === "left"
        ? "flex-start"
        : block.style?.alignment === "center"
          ? "center"
          : "flex-start",
    flexDirection: block.style?.alignment === "left" ? "row-reverse" : "row",
  };

  const widthStyle = block.position?.width
    ? `${block.position.width}px`
    : "100%";
  const heightStyle = block.position?.height
    ? `${block.position.height}px`
    : "auto";
  const fontSizeStyle = block.style?.fontSize
    ? `${block.style.fontSize}px`
    : "inherit";

  const imgData =
    typeof value === "object" && value?.url
      ? value
      : { url: value, fit: "contain" };

  switch (block.type) {
    case "title":
      return (
        <h2
          style={{
            ...alignStyles,
            fontSize: block.style?.fontSize ? fontSizeStyle : "24px",
          }}
          className={`font-bold w-full truncate ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}
        >
          {formSettings.name}
        </h2>
      );

    case "version":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full truncate"
        >
          الإصدار: {formSettings.version}
        </div>
      );

    case "subject":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle, width: widthStyle }}
          className="font-bold flex gap-2 items-center overflow-hidden"
        >
          <span className="whitespace-nowrap shrink-0">{block.label}:</span>
          <span
            className={`border-b border-black flex-1 min-w-0 truncate ${value ? "border-solid" : "border-dashed"}`}
          >
            {value || ""}
          </span>
        </div>
      );

    case "reference_number":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full truncate"
        >
          {block.label}: {formSettings.code}-{new Date().getFullYear()}-0001
        </div>
      );

    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      let displayDate = value || block.defaultValue || "____ / __ / __";
      if (value)
        displayDate =
          block.type === "date_hijri"
            ? formatHijriDate(value)
            : formatGregorianDate(value);
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <span className="font-bold whitespace-nowrap shrink-0">
            {block.label}:
          </span>
          <span className="font-mono text-slate-800 truncate">
            {displayDate}
          </span>
        </div>
      );

    case "time":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <span className="font-bold whitespace-nowrap shrink-0">
            {block.label}:
          </span>
          <span className="font-mono text-slate-800 truncate" dir="ltr">
            {value || "__:__"}
          </span>
        </div>
      );

    case "text_field":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <label className="font-bold text-slate-700 whitespace-nowrap shrink-0">
            {block.label}:
          </label>
          <div
            className={`flex-1 min-w-0 w-full flex items-center border-b ${value ? "px-2 font-semibold text-blue-900 border-solid border-slate-400" : "border-slate-300 border-dashed h-6"}`}
          >
            <span className="truncate w-full block">{value || ""}</span>
          </div>
        </div>
      );

    // 💡 مساحة الكتابة والنص الثابت (كلاهما أصبح محرر غني مباشر على الورقة)
    case "text_area":
    case "static_text":
      const isStatic = block.type === "static_text";
      return (
        <div
          style={{
            ...alignStyles,
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="flex flex-col"
        >
          <CanvasRichText
            value={value}
            onChange={onChange}
            isForPrint={isForPrint}
            placeholder={block.defaultValue || block.label}
            isStatic={isStatic}
          />
        </div>
      );

    case "employee_info":
      const empData = value || { name: "", empId: "" };
      return (
        <div
          style={{ width: widthStyle, fontSize: fontSizeStyle }}
          className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-3 overflow-hidden"
        >
          <div className="font-bold text-indigo-800 mb-2 flex items-center gap-2 truncate">
            <User size={16} /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-2 text-indigo-900 font-semibold text-[0.9em]">
            <div className="truncate">الاسم: {empData.name || "---------"}</div>
            <div className="truncate">
              الرقم:{" "}
              <span className="font-mono">{empData.empId || "----"}</span>
            </div>
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div
            className={`w-4 h-4 shrink-0 border-2 rounded flex items-center justify-center ${value ? "border-blue-600 bg-blue-600" : "border-slate-400"}`}
          >
            {value && (
              <span className="text-white text-[10px] leading-none">✓</span>
            )}
          </div>
          <span className="font-bold text-slate-700 truncate">
            {block.label}
          </span>
        </div>
      );

    // تخصيص الصور بدون عناوين وبشريط أدوات
    case "image_upload":
    case "header_image":
    case "footer_image":
    case "background_image":
    case "signature":
    case "office_signature":
    case "fingerprint":
    case "office_stamp":
      return (
        <div
          style={{ width: widthStyle, height: heightStyle }}
          className="flex flex-col relative group"
          onMouseEnter={() => setImgHover(true)}
          onMouseLeave={() => setImgHover(false)}
        >
          <div
            className={`w-full h-full flex items-center justify-center overflow-hidden ${imgData.url ? "" : "border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50"}`}
          >
            {imgData.url ? (
              <img
                src={imgData.url}
                alt="Content"
                style={{ objectFit: imgData.fit }}
                className="w-full h-full"
              />
            ) : (
              !isForPrint && (
                <label className="cursor-pointer flex flex-col items-center text-slate-400 hover:text-blue-500 transition-colors w-full h-full justify-center">
                  <Upload size={24} className="mb-2" />
                  <span className="text-[10px] font-bold">
                    انقر لرفع {block.label}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          onChange({ url: ev.target.result, fit: "contain" });
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )
            )}
          </div>

          {!isForPrint && imgHover && imgData.url && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded-lg px-2 py-1.5 flex gap-2 z-50 backdrop-blur-sm shadow-xl">
              <button
                onClick={() => onChange({ ...imgData, fit: "contain" })}
                className={`p-1 rounded ${imgData.fit === "contain" ? "bg-blue-500" : "hover:bg-slate-700"}`}
                title="احتواء (Contain)"
              >
                <Frame size={14} />
              </button>
              <button
                onClick={() => onChange({ ...imgData, fit: "cover" })}
                className={`p-1 rounded ${imgData.fit === "cover" ? "bg-blue-500" : "hover:bg-slate-700"}`}
                title="تغطية (Cover)"
              >
                <Maximize size={14} />
              </button>
              <button
                onClick={() => onChange({ ...imgData, fit: "fill" })}
                className={`p-1 rounded ${imgData.fit === "fill" ? "bg-blue-500" : "hover:bg-slate-700"}`}
                title="ملء (Stretch)"
              >
                <Grid3x3 size={14} />
              </button>
              <div className="w-px h-4 bg-slate-600 mx-1 self-center"></div>
              <button
                onClick={() => onChange(null)}
                className="p-1 hover:bg-red-500 rounded text-red-300 hover:text-white"
                title="حذف الصورة"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      );

    case "separator":
      return <hr className="my-2 border-t-2 border-slate-800 w-full" />;
    default:
      return null;
  }
};

// ==========================================
// 💡 4. مكون الشاشة الرئيسية (Form Fill Modal)
// ==========================================
export default function FormFillModal({ form, onClose, onSaveUsage }) {
  const [formValues, setFormValues] = useState({});
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportType, setExportType] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [isForPrint, setIsForPrint] = useState(false);

  const componentRef = useRef();

  // 💡 التعديل: إخفاء جميع حقول النص الحر والصور من السايد بار لتكون التعبئة من الورقة فقط
  const sortedBlocks = useMemo(() => {
    if (!form?.blocks) return [];
    return [...form.blocks]
      .filter(
        (b) =>
          ![
            "title",
            "version",
            "reference_number",
            "separator",
            "static_text",
            "watermark",
            "text_area",
            "image_upload",
            "header_image",
            "footer_image",
            "background_image",
            "signature",
            "office_signature",
            "office_stamp",
            "fingerprint",
          ].includes(b.type),
      )
      .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));
  }, [form]);

  const handleValueChange = useCallback((id, val) => {
    setFormValues((prev) => ({ ...prev, [id]: val }));
  }, []);

  const pageSettings = form?.pageSettings || {
    size: "A4",
    orientation: "portrait",
  };
  const fontFamily = form?.fontFamily || "Tajawal";

  const A4_HEIGHT_PX = 1122.5;
  const calculatePaperHeight = () => {
    if (!form?.blocks || form.blocks.length === 0) return A4_HEIGHT_PX;
    const maxBottom = Math.max(
      ...form.blocks.map(
        (b) => (b.position?.y || 0) + (b.position?.height || 0),
      ),
    );
    return (
      Math.max(1, Math.ceil((maxBottom + 100) / A4_HEIGHT_PX)) * A4_HEIGHT_PX
    );
  };
  const dynamicHeight = calculatePaperHeight();
  const pagesCount = Math.ceil(dynamicHeight / A4_HEIGHT_PX);

  // 🖨️ الطباعة الاحترافية
  const handlePrintNatively = () => {
    if (!componentRef.current)
      return toast.error("لا يمكن الوصول لمحتوى الطباعة");
    setIsForPrint(true);
    const originalTransform = componentRef.current.style.transform;
    componentRef.current.style.transform = "scale(1)";

    setTimeout(() => {
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "0px";
      iframe.style.height = "0px";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const printDocument = iframe.contentWindow.document;
      const originalContent = componentRef.current.cloneNode(true);
      originalContent.style.transform = "none";
      originalContent.style.boxShadow = "none";

      const styles = Array.from(
        document.querySelectorAll('style, link[rel="stylesheet"]'),
      )
        .map((el) => el.outerHTML)
        .join("\n");
      const htmlContent = `
        <html dir="rtl"><head><title>${form?.name || "طباعة النموذج"}</title>${styles}
        <style>
          @page { size: A4 ${pageSettings.orientation}; margin: 0; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; }
          .page-break-indicator { display: none !important; }
        </style></head>
        <body style="font-family: ${fontFamily};">${originalContent.outerHTML}</body></html>
      `;

      printDocument.open();
      printDocument.write(htmlContent);
      printDocument.close();

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow.focus();
          iframe.contentWindow.print();
          setTimeout(() => document.body.removeChild(iframe), 1000);
          componentRef.current.style.transform = originalTransform;
          setIsForPrint(false);
        }, 500);
      };
    }, 300);
  };

  // 💾 التصدير الاحترافي
  const handleExport = async () => {
    if (!componentRef.current) return;
    setIsExporting(true);
    toast.loading("جاري إعداد الملف بدقة فائقة...", { duration: 5000 });

    try {
      const element = componentRef.current;
      const currentZoom = zoomLevel;
      const originalTransform = element.style.transform;

      setZoomLevel(100);
      setIsForPrint(true);
      element.style.transform = "scale(1)";

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
        width: element.offsetWidth,
        height: element.offsetHeight,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const fileName = `نموذج_${form?.name || "بدون_اسم"}_${new Date().getTime()}`;

      if (exportType === "image") {
        const link = document.createElement("a");
        link.download = `${fileName}.jpg`;
        link.href = imgData;
        link.click();
        toast.success("تم التصدير بنجاح");
      } else if (exportType === "pdf") {
        const pdf = new jsPDF({
          orientation: pageSettings.orientation,
          unit: "mm",
          format: "a4",
          compress: true,
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfPageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(
          imgData,
          "JPEG",
          0,
          position,
          pdfWidth,
          imgHeight,
          "",
          "FAST",
        );
        heightLeft -= pdfPageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(
            imgData,
            "JPEG",
            0,
            position,
            pdfWidth,
            imgHeight,
            "",
            "FAST",
          );
          heightLeft -= pdfPageHeight;
        }
        pdf.save(`${fileName}.pdf`);
        toast.success("تم التصدير بنجاح");
      } else if (exportType === "word") {
        const htmlContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>${form?.name}</title></head><body style="margin: 0; padding: 0; text-align: center;"><img src="${imgData}" style="width: 100%; max-width: 210mm;" /></body></html>`;
        const blob = new Blob(["\ufeff", htmlContent], {
          type: "application/msword",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${fileName}.doc`;
        link.click();
        toast.success("تم التصدير بنجاح");
      }

      element.style.transform = originalTransform;
      setZoomLevel(currentZoom);
      setIsForPrint(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء التصدير");
      setIsForPrint(false);
    } finally {
      setIsExporting(false);
      toast.dismiss();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-slate-100 flex flex-col font-[Tajawal]"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="h-[70px] bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
            <LayoutTemplate size={24} />
          </div>
          <div>
            <h1 className="text-[17px] font-black text-slate-900">
              تعبئة وتخصيص: {form?.name}
            </h1>
            <p className="text-[12px] text-slate-500 font-mono mt-0.5">
              Code: {form?.code} • Version: {form?.version}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="px-3 py-2.5 border border-slate-300 rounded-xl text-[12px] font-bold text-slate-700 bg-white outline-none cursor-pointer"
          >
            <option value="pdf">تصدير PDF</option>
            <option value="word">تصدير Word</option>
            <option value="image">تصدير صورة HD</option>
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 font-bold text-[13px] rounded-xl hover:bg-blue-100 transition-colors"
          >
            <Download size={18} />{" "}
            {isExporting ? "جاري التجهيز..." : "تصدير الملف"}
          </button>
          <button
            onClick={handlePrintNatively}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold text-[13px] rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
          >
            <Printer size={18} /> طباعة النموذج
          </button>
          <button
            onClick={() => onSaveUsage && onSaveUsage(formValues)}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold text-[13px] rounded-xl shadow-md hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 size={18} /> حفظ في السجل
          </button>
          <div className="w-px h-8 bg-slate-200 mx-2"></div>
          <button
            onClick={onClose}
            className="p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* ── Split Screen Layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Right Panel: Basic Form Entry ── */}
        <div className="w-[350px] bg-white border-l border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 shrink-0">
          <div className="p-5 border-b border-slate-100 bg-blue-50/50">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <Pen size={18} className="text-blue-600" /> البيانات الأساسية
            </h3>
            <p className="text-[10px] text-blue-700/80 mt-1 font-semibold leading-relaxed">
              تعبئة التواريخ والبيانات السريعة.
              <br />
              <span className="text-red-500 font-bold">تنبيه:</span>{" "}
              <strong>
                لتعديل النصوص الحرة أو الصور والتواقيع، انقر عليها مباشرة داخل
                الورقة (يسار) لتفعيل شريط التحرير الذكي.
              </strong>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {sortedBlocks.length === 0 ? (
              <div className="text-center text-slate-400 text-xs mt-10">
                جميع الحقول متاحة للتحرير المباشر على الورقة.
              </div>
            ) : (
              sortedBlocks.map((block) => {
                const bId = block.id || block.uid;

                return (
                  <div key={bId} className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-800 flex items-center gap-2">
                      {["date_gregorian", "date_hijri"].includes(
                        block.type,
                      ) && <Calendar size={14} className="text-slate-400" />}
                      {block.type === "time" && (
                        <Clock size={14} className="text-slate-400" />
                      )}
                      {block.type === "employee_info" && (
                        <User size={14} className="text-slate-400" />
                      )}
                      {block.label}
                    </label>

                    {["text_field", "subject"].includes(block.type) && (
                      <input
                        type="text"
                        value={formValues[bId] || ""}
                        onChange={(e) => handleValueChange(bId, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                        placeholder={`اكتب ${block.label}...`}
                      />
                    )}

                    {["date_gregorian", "date_hijri", "date_editable"].includes(
                      block.type,
                    ) && (
                      <input
                        type="date"
                        value={formValues[bId] || ""}
                        onChange={(e) => handleValueChange(bId, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                      />
                    )}

                    {block.type === "time" && (
                      <input
                        type="time"
                        value={formValues[bId] || ""}
                        onChange={(e) => handleValueChange(bId, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                      />
                    )}

                    {block.type === "employee_info" && (
                      <div className="grid grid-cols-1 gap-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                        <input
                          type="text"
                          placeholder="اسم الموظف"
                          value={formValues[bId]?.name || ""}
                          onChange={(e) =>
                            handleValueChange(bId, {
                              ...formValues[bId],
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 border border-indigo-200 rounded text-xs outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="الرقم الوظيفي"
                          value={formValues[bId]?.empId || ""}
                          onChange={(e) =>
                            handleValueChange(bId, {
                              ...formValues[bId],
                              empId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 border border-indigo-200 rounded text-xs outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    )}

                    {block.type === "checkbox" && (
                      <label className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100">
                        <input
                          type="checkbox"
                          checked={!!formValues[bId]}
                          onChange={(e) =>
                            handleValueChange(bId, e.target.checked)
                          }
                          className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          تفعيل ({block.label})
                        </span>
                      </label>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ── Left Panel: Live Interactive Canvas ── */}
        <div className="flex-1 bg-slate-200/80 overflow-y-auto flex justify-center py-12 custom-scrollbar relative">
          <div className="absolute top-4 left-6 flex items-center gap-1 bg-white shadow-sm p-1 rounded-xl z-20 border border-slate-200">
            <button
              onClick={() => setZoomLevel((p) => Math.max(p - 10, 50))}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ZoomOut size={18} />
            </button>
            <span className="text-[13px] font-bold font-mono text-slate-700 min-w-[50px] text-center">
              {zoomLevel}%
            </span>
            <button
              onClick={() => setZoomLevel((p) => Math.min(p + 10, 150))}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <div
            ref={componentRef}
            className={`print-container bg-white shadow-2xl relative flex flex-col origin-top transition-transform duration-200 ${form?.showBorder && !isForPrint ? "border-[6px] border-slate-900" : ""}`}
            style={{
              width: "210mm",
              height: `${dynamicHeight}px`,
              transform: `scale(${zoomLevel / 100})`,
              fontFamily: fontFamily,
            }}
          >
            {!isForPrint &&
              Array.from({ length: pagesCount - 1 }).map((_, i) => (
                <div
                  key={`break-${i}`}
                  className="page-break-indicator absolute left-0 right-0 border-b-2 border-dashed border-red-300 z-0 pointer-events-none"
                  style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
                ></div>
              ))}

            <div
              className={`w-full h-full relative z-10 min-h-full ${form?.colorMode === "bw" ? "grayscale" : ""}`}
            >
              <div className="w-full h-full relative z-10 min-h-full">
                {form?.blocks?.map((block) => {
                  const bId = block.id || block.uid;
                  return (
                    <div
                      key={bId}
                      className="absolute"
                      style={{
                        left: `${block.position?.x}px`,
                        top: `${block.position?.y}px`,
                        width: `${block.position?.width}px`,
                        height: `${block.position?.height}px`,
                      }}
                    >
                      <div className="w-full h-full flex flex-col p-1">
                        <CanvasBlockRenderer
                          block={block}
                          formSettings={form}
                          value={formValues[bId]}
                          onChange={(val) => handleValueChange(bId, val)}
                          isForPrint={isForPrint}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {Array.from({ length: pagesCount }).map((_, i) => (
              <div
                key={`footer-${i}`}
                className="absolute left-[20mm] right-[20mm] flex justify-between text-[10px] text-slate-500 font-mono pointer-events-none"
                style={{ top: `${(i + 1) * A4_HEIGHT_PX - 40}px` }}
              >
                <span dir="ltr">{form?.code}</span>
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
