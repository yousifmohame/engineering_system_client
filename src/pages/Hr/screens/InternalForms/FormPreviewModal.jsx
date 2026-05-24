import React, { useState, useRef, useCallback } from "react";
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
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "sonner";


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
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


// ==========================================
// 💡 1. دوال مساعدة للتواريخ
// ==========================================
const formatHijriDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

const formatGregorianDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

// ==========================================
// 💡 2. مكون رسم البلوكات (للمعاينة)
// ==========================================
const PreviewBlockRenderer = React.memo(
  ({ block, formSettings, fillMode, value, onChange, isForPrint }) => {
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
    const shouldShowInput = isInteractive && !isForPrint;

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
            className={`font-bold w-full ${formSettings.colorMode === "color" ? "text-[#123f59]" : "text-black"}`}
          >
            {formSettings.name || "عنوان النموذج"}
          </h2>
        );
      case "version":
        return (
          <div
            style={{ ...alignStyles, fontSize: fontSizeStyle }}
            className="text-[#94a3b8] font-mono w-full"
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
                className="flex-1 bg-transparent border-b border-[#d8b46a]/40 outline-none px-2 text-[#123f59] font-normal"
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
            className="text-[#94a3b8] font-mono w-full"
          >
            {block.label}: {formSettings.code || "FRM-XXX"}-
            {new Date().getFullYear()}-0001
          </div>
        );
      case "date_gregorian":
      case "date_hijri":
      case "date_editable":
        let displayDate = "";
        if (isInteractive && value && isForPrint) {
          displayDate =
            block.type === "date_hijri"
              ? formatHijriDate(value)
              : formatGregorianDate(value);
        } else if (isFilled) {
          displayDate =
            block.type === "date_hijri" ? "1447/10/12" : "2026/03/30";
        } else {
          displayDate = block.defaultValue || "____ / __ / __";
        }
        return (
          <div
            style={{
              ...alignStyles,
              width: widthStyle,
              fontSize: fontSizeStyle,
            }}
            className="grid w-full grid-cols-[auto_150px] items-center justify-end gap-2 whitespace-nowrap"
          >
            <span className="inline-flex h-8 shrink-0 items-center justify-end font-bold leading-none">
              {block.label}:
            </span>
            {shouldShowInput ? (
              <input
                type="date"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="h-8 w-[150px] shrink-0 rounded-md border border-[#d8b46a]/25 bg-white/95 px-2 py-1 text-center font-mono text-[#123f59] outline-none focus:border-[#0e7490]"
              />
            ) : (
              <div
                className={`h-8 w-[150px] shrink-0 rounded-md border px-2 py-1 flex items-center justify-center gap-2 ${isFilled || (isInteractive && value) ? "bg-white/95 border-[#e8ddc8] text-[#123f59] font-mono font-bold" : "bg-[#fbf8f1] border-[#d8b46a]/25 text-[#94a3b8]"}`}
              >
                <span dir="ltr" className="inline-flex min-w-0 items-center justify-center leading-none">
                  {displayDate}
                </span>
                {(!isInteractive || !value) && !isFilled && (
                  <CalendarClock size={14} className="shrink-0" />
                )}
              </div>
            )}
          </div>
        );
      case "time":
        return (
          <div
            style={{
              ...alignStyles,
              width: widthStyle,
              fontSize: fontSizeStyle,
            }}
            className="flex items-center gap-2"
          >
            <span className="font-bold whitespace-nowrap">{block.label}:</span>
            {shouldShowInput ? (
              <input
                type="time"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="bg-white/95 border border-[#d8b46a]/25 rounded px-2 py-1 outline-none focus:border-[#0e7490] font-mono text-[#123f59] w-full"
              />
            ) : (
              <span
                className="font-mono bg-[#fbf8f1] border border-[#e8ddc8] px-3 py-1 rounded w-full"
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
            style={{
              ...alignStyles,
              width: widthStyle,
              fontSize: fontSizeStyle,
            }}
            className="flex items-center gap-2"
          >
            <label className="font-bold text-[#475569] whitespace-nowrap">
              {block.label}
            </label>
            {shouldShowInput ? (
              <input
                type="text"
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-[#eef7f6]/30 border-b border-[#d8b46a]/35 outline-none px-2 text-[#123f59] w-full"
                placeholder="اكتب هنا..."
              />
            ) : (
              <div
                className={`flex-1 min-h-[24px] w-full flex items-center ${isFilled || (isInteractive && value) ? "px-2 font-semibold text-[#123f59] border-b border-solid border-[#d8b46a]/35" : "border-b border-[#d8b46a]/25 border-dashed h-6"}`}
              >
                {getDisplayValue("شركة الرواد للتقنية")}
              </div>
            )}
          </div>
        );
      case "text_area":
        return (
          <div
            style={{
              ...alignStyles,
              width: widthStyle,
              fontSize: fontSizeStyle,
            }}
            className="flex flex-col h-full"
          >
            <label className="font-bold text-[#475569] mb-1.5">
              {block.label}
            </label>
            {shouldShowInput ? (
              <textarea
                value={value || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full flex-1 border border-[#d8b46a]/35 bg-[#eef7f6]/30 rounded p-2 outline-none resize-none text-[#123f59]"
                placeholder="اكتب التفاصيل هنا..."
                style={{ height: heightStyle }}
              />
            ) : (
              <div
                className={`border rounded w-full p-3 min-w-0 flex-1 overflow-hidden whitespace-pre-wrap ${isFilled || (isInteractive && value) ? "bg-white/95 border-[#e8ddc8] text-[#123f59] leading-loose" : "bg-[#fbf8f1] border-[#d8b46a]/25 border-dashed text-[#94a3b8]"}`}
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
      case "company_logo":
      case "header_image":
      case "footer_image":
      case "background_image":
      case "image_upload":
        // 💡 استخراج بيانات الصورة بأمان من الـ value
        let imgData = { url: null, opacity: 1, fit: "contain" };
        if (typeof value === "object" && value !== null) {
          imgData = { ...imgData, ...value };
        } else if (
          typeof value === "string" &&
          value.startsWith("data:image")
        ) {
          // في حال كانت الصورة مخزنة كنص Base64 مباشر
          imgData.url = value;
        }

        const defaultCompanyLogoUrl = block.type === "company_logo" ? "/logo.jpeg" : null;
        if (!imgData.url && defaultCompanyLogoUrl) {
          imgData = { ...imgData, url: defaultCompanyLogoUrl, fit: "contain", opacity: 1 };
        }

        const isBackground = block.type === "background_image";

        return (
          <div
            style={{ ...alignStyles, width: widthStyle, height: heightStyle }}
            className="flex flex-col relative"
          >
            {!isBackground &&
              block.type !== "company_logo" &&
              block.type !== "header_image" &&
              block.type !== "footer_image" && (
                <label
                  style={{ fontSize: fontSizeStyle }}
                  className="font-bold text-[#475569] mb-1.5 z-10"
                >
                  {block.label}
                </label>
              )}

            {shouldShowInput && !isBackground ? (
              <div className="relative border-2 border-dashed border-[#d8b46a]/35 rounded-lg bg-[#eef7f6]/30 w-full flex-1 flex flex-col items-center justify-center text-[#0e7490] overflow-hidden group">
                {imgData.url ? (
                  <img
                    src={imgData.url}
                    alt="uploaded"
                    className="w-full h-full"
                    style={{ objectFit: imgData.fit, opacity: imgData.opacity }}
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
                      reader.onload = (ev) =>
                        onChange({ ...imgData, url: ev.target.result });
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            ) : (
              <div
                className={`w-full flex-1 flex flex-col items-center justify-center overflow-hidden ${imgData.url || isFilled ? "bg-transparent border-transparent" : "border-2 border-dashed border-[#d8b46a]/25 bg-[#fbf8f1] text-[#94a3b8] rounded-lg"}`}
              >
                {imgData.url || isFilled ? (
                  <img
                    src={
                      imgData.url || "https://placehold.co/400x200?text=Preview"
                    }
                    alt="block_image"
                    className="w-full h-full pointer-events-none"
                    style={{
                      objectFit:
                        imgData.fit || (isBackground ? "cover" : "contain"),
                      opacity: imgData.opacity ?? 1,
                    }}
                  />
                ) : (
                  !isBackground && (
                    <>
                      <Upload size={32} className="mb-2 opacity-50" />
                      <span style={{ fontSize: "12px" }}>انقر لإرفاق صورة</span>
                    </>
                  )
                )}
              </div>
            )}
          </div>
        );
      case "employee_info":
        const empData =
          typeof value === "object" && value !== null
            ? value
            : { name: "", empId: "" };
        return (
          <div
            style={{ width: widthStyle, fontSize: fontSizeStyle }}
            className="border border-[#d8b46a]/35 bg-[#eef7f6]/30 rounded-xl p-4"
          >
            <div className="font-bold text-[#123f59] mb-3 flex items-center gap-2">
              <User size={18} /> {block.label}
            </div>
            <div className="grid min-w-0 grid-cols-2 gap-2.5">
              <div className="bg-white/95 p-2 border border-[#e8ddc8] rounded-lg flex gap-2 items-center">
                <span>الاسم:</span>
                {shouldShowInput ? (
                  <input
                    type="text"
                    onChange={(e) =>
                      onChange({ ...empData, name: e.target.value })
                    }
                    value={empData.name}
                    className="border-b border-[#d8b46a]/35 outline-none flex-1 bg-transparent text-[#123f59]"
                  />
                ) : (
                  <span
                    className={
                      isFilled || (isInteractive && empData.name)
                        ? "font-bold text-[#123f59]"
                        : "text-[#94a3b8]"
                    }
                  >
                    {isInteractive && isForPrint
                      ? empData.name || "--------"
                      : isFilled
                        ? "أحمد محمد الغامدي"
                        : "--------"}
                  </span>
                )}
              </div>
              <div className="bg-white/95 p-2 border border-[#e8ddc8] rounded-lg flex gap-2 items-center">
                <span>الرقم:</span>
                {shouldShowInput ? (
                  <input
                    type="text"
                    onChange={(e) =>
                      onChange({ ...empData, empId: e.target.value })
                    }
                    value={empData.empId}
                    className="border-b border-[#d8b46a]/35 outline-none flex-1 bg-transparent text-[#123f59] font-mono"
                  />
                ) : (
                  <span
                    className={
                      isFilled || (isInteractive && empData.empId)
                        ? "font-bold font-mono text-[#123f59]"
                        : "text-[#94a3b8]"
                    }
                  >
                    {isInteractive && isForPrint
                      ? empData.empId || "--------"
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
            style={{
              ...alignStyles,
              width: widthStyle,
              fontSize: fontSizeStyle,
            }}
            className="flex items-center gap-2.5"
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
                className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center ${isChecked ? "bg-[#0e7490] border-[#d8b46a]/35" : "border-[#d8b46a]/35"}`}
              >
                {isChecked && (
                  <span className="text-white text-[10px] leading-none">✓</span>
                )}
              </div>
            )}
            <span className="font-bold text-[#475569]">{block.label}</span>
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
              className={`w-full flex-1 border-2 rounded-xl flex items-center justify-center overflow-hidden ${shouldShowInput ? "border-[#d8b46a]/40 bg-[#eef7f6]/50 cursor-pointer border-dashed hover:bg-[#eef7f6]" : isFilled || (isInteractive && value && isForPrint) ? "border-transparent bg-transparent" : "border-[#d8b46a]/25 border-dashed bg-[#fbf8f1] text-[#94a3b8]"}`}
            >
              {shouldShowInput ? (
                <label className="text-[10px] text-[#0e7490] flex flex-col items-center gap-1 cursor-pointer w-full h-full justify-center">
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
                  src={typeof value === "object" ? value.url : value}
                  alt="signature"
                  className="max-w-full max-h-full mix-blend-multiply"
                />
              ) : isFilled ? (
                <span className="font-['Brush_Script_MT',cursive] text-lg opacity-80 rotate-[-10deg] text-[#123f59]">
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
        return <hr className="my-2 border-t-2 border-[#d8b46a]/25 w-full" />;
      case "static_text":
        return (
          <div
            style={{
              ...alignStyles,
              width: widthStyle,
              fontSize: fontSizeStyle,
            }}
            className="leading-relaxed w-full whitespace-pre-wrap"
          >
            {block.defaultValue || block.label}
          </div>
        );
      default:
        return (
          <div className="p-3 border border-dashed border-[#d8b46a]/40 bg-[#eef7f6] text-[#123f59] text-center rounded-lg w-full font-bold">
            {block.label}
          </div>
        );
    }
  },
);

export default function FormPreviewModal({ form, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportType, setExportType] = useState("pdf");
  const [fillMode, setFillMode] = useState("blank");
  const [isExporting, setIsExporting] = useState(false);
  const [formValues, setFormValues] = useState({});
  const [isForPrint, setIsForPrint] = useState(false);

  const componentRef = useRef();

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 10, 50));

  const handleValueChange = useCallback((uid, val) => {
    setFormValues((prev) => ({ ...prev, [uid]: val }));
  }, []);

  // المعاينة والطباعة في هذه الشاشة عمودية دائماً، مع ضغط النموذج كاملاً داخل صفحة واحدة.
  const pageSettings = { size: "A4", orientation: "portrait" };
  const fontFamily = form?.fontFamily || "Tajawal";

  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1122.5;
  const PAGE_WIDTH_MM = "210mm";
  const PAGE_HEIGHT_MM = "297mm";

  const calculatePaperHeight = () => A4_HEIGHT_PX;

  const dynamicHeight = A4_HEIGHT_PX;
  const pagesCount = 1;
  const exportFileName = `${form?.code || "form"}-${form?.name || "النموذج"}`;

  // 🖨️ الطباعة الأصلية


  const waitForRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  const waitForPopupImages = (popup) => {
    const images = Array.from(popup?.document?.images || []);

    if (!images.length) return Promise.resolve();

    return Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }

            img.onload = resolve;
            img.onerror = resolve;
          }),
      ),
    );
  };

  const makeImageUrlsAbsolute = (rootNode) => {
    if (!rootNode || typeof window === "undefined") return;

    rootNode.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");

      if (src && src.startsWith("/")) {
        img.setAttribute("src", `${window.location.origin}${src}`);
      }
    });
  };

  const sanitizeFileName = (name = "النموذج") =>
    String(name || "النموذج").replace(/[\\/:*?"<>|]/g, "_");

  const downloadBlobFile = (content, fileName, mimeType) => {
    const blob =
      content instanceof Blob
        ? content
        : new Blob(["\ufeff", content], { type: mimeType });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = fileName;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
    }, 500);
  };

  const clonePreviewNode = () => {
    if (!componentRef.current) {
      throw new Error("MISSING_PREVIEW_NODE");
    }

    const clone = componentRef.current.cloneNode(true);

    const sourceWidthPx = Math.max(
      componentRef.current?.scrollWidth || 0,
      componentRef.current?.offsetWidth || 0,
      A4_WIDTH_PX,
    );
    const sourceHeightPx = Math.max(
      componentRef.current?.scrollHeight || 0,
      componentRef.current?.offsetHeight || 0,
      dynamicHeight,
      A4_HEIGHT_PX,
    );

    clone.style.width = `${sourceWidthPx}px`;
    clone.style.height = `${sourceHeightPx}px`;
    clone.style.minHeight = `${sourceHeightPx}px`;
    clone.style.transform = "none";
    clone.style.transformOrigin = "top center";
    clone.style.boxShadow = "none";
    clone.style.margin = "0 auto";
    clone.style.background = "#ffffff";

    makeImageUrlsAbsolute(clone);

    clone.querySelectorAll("[contenteditable]").forEach((el) => {
      el.setAttribute("contenteditable", "false");
    });

    clone.querySelectorAll("button, input[type='file'], select, [data-no-print='true']").forEach((el) => {
      el.remove();
    });

    return clone;
  };



  const buildStandaloneDocument = (node, title = "النموذج") => {
    const safeTitle = String(title || "النموذج").replace(/[<>]/g, "");
    const clone = clonePreviewNode();

    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]'),
    )
      .map((el) => el.outerHTML)
      .join("\n");

    const sourceWidthPx = Math.max(
      node?.scrollWidth || 0,
      node?.offsetWidth || 0,
      A4_WIDTH_PX,
    );

    const sourceHeightPx = Math.max(
      node?.scrollHeight || 0,
      node?.offsetHeight || 0,
      A4_HEIGHT_PX,
    );

    clone.style.width = `${sourceWidthPx}px`;
    clone.style.height = `${sourceHeightPx}px`;
    clone.style.minHeight = `${sourceHeightPx}px`;
    clone.style.maxHeight = "none";

    // Page entière dans une seule feuille A4 verticale.
    const fitScale = Math.min(
      A4_WIDTH_PX / sourceWidthPx,
      A4_HEIGHT_PX / sourceHeightPx,
      1,
    );

    return `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <base href="${window.location.origin}/" />
          <title>${safeTitle}</title>
          ${styles}
          <style>
            @page { size: 210mm 297mm; margin: 0; }
            * { box-sizing: border-box; }

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              background: #ffffff !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: ${fontFamily || "Tajawal"}, Arial, sans-serif;
            }

            body {
              display: block !important;
            }

            .print-shell {
              width: 210mm !important;
              height: 297mm !important;
              min-height: 297mm !important;
              max-height: 297mm !important;
              background: #ffffff !important;
              overflow: hidden !important;
              position: relative !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .print-fit {
              position: absolute !important;
              top: 0 !important;
              left: 50% !important;
              width: ${sourceWidthPx}px !important;
              height: ${sourceHeightPx}px !important;
              min-height: ${sourceHeightPx}px !important;
              transform: translateX(-50%) scale(${fitScale}) !important;
              transform-origin: top center !important;
              background: #ffffff !important;
              overflow: visible !important;
            }

            .print-fit > .print-container {
              width: ${sourceWidthPx}px !important;
              height: ${sourceHeightPx}px !important;
              min-height: ${sourceHeightPx}px !important;
              transform: none !important;
            }

            .print-shell,
            .print-shell *,
            .print-fit,
            .print-fit * {
              visibility: visible !important;
              opacity: 1 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            .print-shell button,
            .print-shell input,
            .print-shell select,
            .print-shell textarea,
            .print-shell [data-no-print="true"] {
              display: none !important;
              visibility: hidden !important;
            }

            @media print {
              @page { size: 210mm 297mm; margin: 0; }

              html,
              body {
                width: 210mm !important;
                height: 297mm !important;
                overflow: hidden !important;
              }

              .print-shell {
                width: 210mm !important;
                height: 297mm !important;
                min-height: 297mm !important;
                max-height: 297mm !important;
              }
            }
          </style>
        </head>
        <body>
          <main class="print-shell">
            <section class="print-fit">${clone.outerHTML}</section>
          </main>
        </body>
      </html>
    `;
  };

  const capturePreviewCanvas = async () => {
    setIsForPrint(true);
    await waitForRender();

    let clone = null;

    try {
      clone = clonePreviewNode();

      clone.style.position = "fixed";
      clone.style.left = "0";
      clone.style.top = "0";
      clone.style.zIndex = "-9999";
      clone.style.pointerEvents = "none";

      document.body.appendChild(clone);

      await waitForRender();

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: clone.scrollWidth,
        height: clone.scrollHeight,
        windowWidth: clone.scrollWidth,
        windowHeight: clone.scrollHeight,
      });

      return canvas;
    } finally {
      clone?.remove?.();
      setIsForPrint(false);
    }
  };



  const printStandaloneDocument = async () => {
    if (!componentRef.current) {
      toast.error("لا يمكن الوصول إلى محتوى الطباعة");
      return;
    }

    const popup = window.open("", "_blank", "width=1200,height=900");

    if (!popup) {
      toast.error("المتصفح منع فتح نافذة الطباعة. فعّل السماح بالنوافذ المنبثقة.");
      return;
    }

    popup.document.open();
    popup.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>جاري تجهيز المستند</title>
          <style>
            body {
              margin: 0;
              height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Tajawal, Arial, sans-serif;
              color: #123f59;
              background: #fff;
            }
            div {
              border: 1px solid #e8ddc8;
              border-radius: 18px;
              padding: 22px 28px;
              font-weight: 900;
              box-shadow: 0 14px 34px rgba(18, 63, 89, .14);
            }
          </style>
        </head>
        <body><div>جاري تجهيز الطباعة العمودية...</div></body>
      </html>
    `);
    popup.document.close();

    setIsForPrint(true);

    try {
      await waitForRender();

      const html = buildStandaloneDocument(
        componentRef.current,
        exportFileName || form?.name || "النموذج",
      );

      popup.document.open();
      popup.document.write(html);
      popup.document.close();

      await waitForPopupImages(popup);

      setTimeout(() => {
        popup.focus();
        popup.print();
      }, 250);
    } catch (error) {
      console.error(error);
      popup.close();
      toast.error("تعذرت الطباعة");
    } finally {
      setIsForPrint(false);
    }
  };


  const exportStandaloneDocument = async () => {
    if (!componentRef.current) {
      toast.error("لا يمكن الوصول إلى محتوى التصدير");
      return;
    }

    const fileName = sanitizeFileName(exportFileName || form?.name || "النموذج");

    if (exportType === "word") {
      const html = buildStandaloneDocument(componentRef.current, fileName);

      downloadBlobFile(
        html,
        `${fileName}.doc`,
        "application/msword;charset=utf-8",
      );

      toast.success("تم تحميل ملف Word");
      return;
    }

    const canvas = await capturePreviewCanvas();

    if (!canvas || !canvas.width || !canvas.height) {
      throw new Error("EMPTY_CANVAS");
    }

    const imgData = canvas.toDataURL("image/png");

    if (exportType === "image") {
      downloadBlobFile(
        await (await fetch(imgData)).blob(),
        `${fileName}.png`,
        "image/png",
      );

      toast.success("تم تحميل الصورة HD");
      return;
    }

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    // Export portrait: the full form is fitted into one A4 vertical page.
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    downloadBlobFile(pdf.output("blob"), `${fileName}.pdf`, "application/pdf");

    toast.success("تم تحميل ملف PDF");
  };


  const handlePrintNatively = async () => {
    if (isExporting) return;
    await printStandaloneDocument();
  };


  // 💾 التصدير (PDF / صورة / Word)
  const handleExport = async () => {
    if (isExporting) return;

    try {
      setIsExporting(true);
      await exportStandaloneDocument();
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء التصدير");
    } finally {
      setIsExporting(false);
      setIsForPrint(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-[#06111d]/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white/95 rounded-[22px] w-full max-w-[96vw] h-[92vh] flex flex-col shadow-2xl overflow-hidden font-[Tajawal]">
        {/* ── Header ── */}
        <div className="px-3 py-2 border-b border-[#e8ddc8] flex flex-wrap items-center justify-between gap-2 bg-white shrink-0 z-10">
          <div>
            <div className="text-[15px] font-black text-[#123f59]">
              معاينة النموذج: {form?.name || "بدون اسم"}
            </div>
            <div className="text-[11px] text-[#94a3b8] font-mono mt-0.5">
              {form?.code || "FRM-XXX"} • الإصدار {form?.version || "1.0"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 ml-3 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-white/95 rounded text-[#64748b] transition-colors"
              >
                <IconWithText icon={ZoomOut} text="تصغير" iconClassName="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-bold font-mono text-[#475569] min-w-[40px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={handleZoomIn}
                className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-white/95 rounded text-[#64748b] transition-colors"
              >
                <IconWithText icon={ZoomIn} text="تكبير" iconClassName="h-3.5 w-3.5" />
              </button>
            </div>

            <select
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="px-3 py-2 border border-[#d8b46a]/25 rounded-lg text-[11px] font-bold text-[#475569] bg-white outline-none cursor-pointer"
            >
              <option value="pdf">تصدير كـ PDF</option>
              <option value="word">تصدير كـ Word</option>
              <option value="image">تصدير كصورة HD</option>
            </select>

            <select
              value={fillMode}
              onChange={(e) => setFillMode(e.target.value)}
              className="px-3 py-2 border border-[#d8b46a]/25 rounded-lg text-[11px] font-bold text-[#475569] bg-[#eef7f6] outline-none cursor-pointer"
            >
              <option value="blank">📄 معاينة نموذج فارغ</option>
              <option value="filled">🧪 معاينة ببيانات تجريبية</option>
            </select>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-500 px-4 text-[12px] font-black text-white shadow-[0_6px_14px_rgba(18,63,89,0.08)] transition hover:brightness-110 disabled:opacity-60"
            >
              <IconWithText
                icon={Download}
                text={isExporting ? "جاري التحميل..." : "تنزيل الملف"}
                iconClassName="h-3.5 w-3.5"
              />
            </button>
            <button
              onClick={handlePrintNatively}
              disabled={isExporting}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0e7490] px-4 text-[12px] font-black text-white shadow-[0_6px_14px_rgba(18,63,89,0.08)] transition hover:bg-[#15536f] disabled:opacity-60"
            >
              <IconWithText icon={Printer} text="طباعة" iconClassName="h-3.5 w-3.5" />
            </button>

            <div className="w-px h-6 bg-[#e8ddc8] mx-1"></div>
            <button
              onClick={onClose}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#d8b46a]/25 bg-white px-2.5 text-[10px] font-black text-[#64748b] transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <IconWithText icon={X} text="إغلاق" iconClassName="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* ── Canvas Area ── */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white flex items-start justify-center py-6 px-4 custom-scrollbar">
          <div
            ref={componentRef}
            data-preview-document="true"
            className="print-container bg-white shadow-[0_20px_60px_rgba(18,63,89,0.22)] ring-1 ring-[#d8b46a]/30 relative flex flex-col origin-top transition-transform duration-200"
            style={{
              width: PAGE_WIDTH_MM,
              height: PAGE_HEIGHT_MM,
              minHeight: PAGE_HEIGHT_MM,
              transform: isForPrint ? "scale(1)" : `scale(${zoomLevel / 100})`,
              fontFamily: fontFamily,
              padding: 0,
            }}
          >
            {/* 💡 الإطار الداخلي للورقة من إعدادات الباك إند */}
            {form?.borderSettings?.active &&
              Array.from({ length: pagesCount }).map((_, i) => (
                <div
                  key={`border-${i}`}
                  className="absolute z-0 pointer-events-none"
                  style={{
                    top: `${i * A4_HEIGHT_PX + form.borderSettings.margin}px`,
                    height: `${A4_HEIGHT_PX - form.borderSettings.margin * 2}px`,
                    left: `${form.borderSettings.margin}px`,
                    right: `${form.borderSettings.margin}px`,
                    border: `${form.borderSettings.width}px solid ${form.borderSettings.color}`,
                  }}
                ></div>
              ))}

            {/* 💡 العلامة المائية الشاملة من إعدادات الباك إند */}
            {form?.watermark?.active &&
              form.watermark.text &&
              !form.watermark.isImage && (
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
                  style={{ opacity: form.watermark.opacity }}
                >
                  <div
                    style={{
                      transform: `rotate(${form.watermark.angle}deg)`,
                      fontSize: `${form.watermark.size}px`,
                      color: form.watermark.color,
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                    className="select-none"
                  >
                    {form.watermark.repeat
                      ? Array(10)
                          .fill(form.watermark.text)
                          .map((t, i) => (
                            <div key={i} className="my-8">
                              {t} &nbsp;&nbsp;&nbsp; {t} &nbsp;&nbsp;&nbsp; {t}
                            </div>
                          ))
                      : form.watermark.text}
                  </div>
                </div>
              )}
            {form?.watermark?.active &&
              form.watermark.isImage &&
              form.watermark.imgUrl && (
                <div
                  className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
                  style={{ opacity: form.watermark.opacity }}
                >
                  <img
                    src={form.watermark.imgUrl}
                    alt="Watermark"
                    style={{
                      width: form.watermark.repeat
                        ? "100%"
                        : `${form.watermark.size}%`,
                      height: form.watermark.repeat ? "100%" : "auto",
                      objectFit: form.watermark.repeat ? "cover" : "contain",
                    }}
                  />
                </div>
              )}

            {!isForPrint &&
              Array.from({ length: pagesCount - 1 }).map((_, i) => (
                <div
                  key={`break-${i}`}
                  className="page-break-indicator absolute left-0 right-0 border-b-2 border-dashed border-red-200 z-0 pointer-events-none"
                  style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
                ></div>
              ))}

            <div
              className={`w-full h-full relative z-10 min-h-full ${form?.colorMode === "bw" ? "grayscale" : ""}`}
            >
              {!form.blocks || form.blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-[#94a3b8] opacity-60 h-full mt-20">
                  <Grid3x3
                    size={48}
                    className="mb-3 text-[#cbd5e1]"
                    strokeWidth={1.5}
                  />
                  <div className="text-[14px] font-bold mb-1">نموذج فارغ</div>
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

                    // 💡 تحويل القيمة من الباك إند بأمان سواء كانت نصاً أو JSON
                    let val = block.defaultValue;
                    if (typeof val === "string" && val.trim().startsWith("{")) {
                      try {
                        val = JSON.parse(val);
                      } catch {
                        /* Ignore */
                      }
                    }

                    return (
                      <div
                        key={block.id || block.uid}
                        className="absolute"
                        style={{
                          left: `${pos.x}px`,
                          top: `${pos.y}px`,
                          width: `${pos.width}px`,
                          height: `${pos.height}px`,
                          overflow:
                            block.type === "background_image" ||
                            block.type === "header_image" ||
                            block.type === "footer_image" ||
                            block.type === "company_logo" ||
                            block.type === "signature" ||
                            block.type === "office_signature"
                              ? "visible"
                              : "hidden",
                        }}
                      >
                        <div className="w-full h-full flex flex-col pointer-events-none">
                          <PreviewBlockRenderer
                            block={block}
                            formSettings={form}
                            fillMode={fillMode}
                            value={val}
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

            {Array.from({ length: pagesCount }).map((_, i) => (
              <div
                key={`footer-${i}`}
                className="absolute left-[20mm] right-[20mm] flex justify-between text-[10px] text-[#94a3b8] font-mono pointer-events-none"
                style={{ top: `${(i + 1) * A4_HEIGHT_PX - 40}px` }}
              >
                <span dir="ltr">{form?.code || "FRM-XXX"}</span>
                <span className="font-bold text-[#475569]">
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
