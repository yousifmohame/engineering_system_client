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
  CalendarClock,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";

// ==========================================
// 💡 1. دوال التحويل الذكي للتواريخ
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
// 💡 2. مكون رسم البلوكات على الورقة (للعرض فقط - Read Only)
// ==========================================
const ReadOnlyBlockRenderer = ({ block, formSettings, value }) => {
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
          {formSettings.name}
        </h2>
      );

    case "version":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full"
        >
          الإصدار: {formSettings.version}
        </div>
      );

    case "subject":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="font-bold flex w-full gap-2 items-center"
        >
          <span className="whitespace-nowrap">{block.label}:</span>
          <span
            className={`border-b border-black flex-1 ${value ? "border-solid" : "border-dashed"}`}
          >
            {value || ""}
          </span>
        </div>
      );

    case "reference_number":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full"
        >
          {block.label}: {formSettings.code}-{new Date().getFullYear()}-0001
        </div>
      );

    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      let displayDate = value || block.defaultValue || "____ / __ / __";
      if (value) {
        displayDate =
          block.type === "date_hijri"
            ? formatHijriDate(value)
            : formatGregorianDate(value);
      }
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <span className="font-bold whitespace-nowrap">{block.label}:</span>
          <span className="font-mono text-slate-800">{displayDate}</span>
        </div>
      );

    case "time":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <span className="font-bold whitespace-nowrap">{block.label}:</span>
          <span className="font-mono text-slate-800" dir="ltr">
            {value || "__:__"}
          </span>
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
          <div
            className={`flex-1 w-full flex items-center border-b ${value ? "px-2 font-semibold text-blue-900 border-solid border-slate-400" : "border-slate-300 border-dashed h-6"}`}
          >
            {value || ""}
          </div>
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
          <div
            className="w-full flex-1 whitespace-pre-wrap text-blue-900 leading-relaxed overflow-hidden"
            style={{ height: heightStyle }}
          >
            {value || block.defaultValue || ""}
          </div>
        </div>
      );

    case "employee_info":
      const empData = value || { name: "", empId: "" };
      return (
        <div
          style={{ width: widthStyle, fontSize: fontSizeStyle }}
          className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4"
        >
          <div className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <User size={18} /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-3 text-indigo-900 font-semibold">
            <div>الاسم: {empData.name || "----------------"}</div>
            <div>
              الرقم:{" "}
              <span className="font-mono">{empData.empId || "--------"}</span>
            </div>
          </div>
        </div>
      );

    case "checkbox":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-3"
        >
          <div
            className={`w-4 h-4 border-2 rounded flex items-center justify-center ${value ? "border-blue-600 bg-blue-600" : "border-slate-400"}`}
          >
            {value && (
              <span className="text-white text-[10px] leading-none">✓</span>
            )}
          </div>
          <span className="font-bold text-slate-700">{block.label}</span>
        </div>
      );

    case "image_upload":
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
          className="flex flex-col"
        >
          <div className="font-bold mb-2 text-slate-700">{block.label}:</div>
          <div
            className={`w-full flex-1 flex items-center justify-center overflow-hidden ${value ? "" : "border-2 border-dashed border-slate-300 rounded-xl bg-slate-50"}`}
          >
            {value ? (
              <img
                src={value}
                alt="attachment"
                className="max-w-full max-h-full mix-blend-multiply object-contain"
              />
            ) : (
              ""
            )}
          </div>
        </div>
      );

    case "separator":
      return <hr className="my-2 border-t-2 border-slate-800 w-full" />;
    case "static_text":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="leading-relaxed w-full whitespace-pre-wrap font-bold text-slate-800"
        >
          {block.defaultValue || block.label}
        </div>
      );
    default:
      return null;
  }
};

// ==========================================
// 💡 3. مكون شاشة التعبئة الاحترافية (Fill Screen)
// ==========================================
export default function FormFillModal({ form, onClose, onSaveUsage }) {
  const [formValues, setFormValues] = useState({});
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportType, setExportType] = useState("pdf"); // 💡 خيار التصدير المضاف
  const [isExporting, setIsExporting] = useState(false);
  const [isForPrint, setIsForPrint] = useState(false); // 💡 حالة الطباعة لإخفاء العناصر الوهمية

  const componentRef = useRef();

  // ترتيب الحقول منطقياً
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

  // 🖨️ الطباعة الاحترافية عبر Native Iframe
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

  // 💾 التصدير الاحترافي (PDF / صورة / Word) بأبعاد مضبوطة وتقطيع الصفحات
  const handleExport = async () => {
    if (!componentRef.current) return;
    setIsExporting(true);
    toast.loading("جاري إعداد الملف بأبعاد دقيقة...", { duration: 5000 });

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
        toast.dismiss();
        toast.success("تم تصدير الصورة بدقة عالية بنجاح");
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
        toast.dismiss();
        toast.success("تم تصدير الـ PDF بأبعاد صحيحة بنجاح");
      } else if (exportType === "word") {
        const htmlContent = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>${form?.name}</title></head>
            <body style="margin: 0; padding: 0; text-align: center;">
              <img src="${imgData}" style="width: 100%; max-width: 210mm;" />
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
        toast.success("تم تصدير ملف Word بنجاح");
      }

      element.style.transform = originalTransform;
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
              تعبئة نموذج: {form?.name}
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
        {/* ── Right Panel: Clean Form Entry ── */}
        <div className="w-[450px] bg-white border-l border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 shrink-0">
          <div className="p-5 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Pen size={18} className="text-blue-600" /> حقول البيانات
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              قم بتعبئة الحقول لتظهر مباشرة في المستند النهائي.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {sortedBlocks.map((block) => {
              const bId = block.id || block.uid;

              return (
                <div key={bId} className="flex flex-col gap-2">
                  <label className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                    {["date_gregorian", "date_hijri"].includes(block.type) && (
                      <Calendar size={14} className="text-slate-400" />
                    )}
                    {block.type === "time" && (
                      <Clock size={14} className="text-slate-400" />
                    )}
                    {block.type === "employee_info" && (
                      <User size={14} className="text-slate-400" />
                    )}
                    {block.type === "image_upload" && (
                      <Upload size={14} className="text-slate-400" />
                    )}
                    {block.label}
                    {block.type === "date_hijri" && (
                      <span className="text-[9px] text-blue-500 font-normal mr-auto">
                        (اختر ميلادي، وسنطبعه هجري)
                      </span>
                    )}
                  </label>

                  {["text_field", "subject"].includes(block.type) && (
                    <input
                      type="text"
                      value={formValues[bId] || ""}
                      onChange={(e) => handleValueChange(bId, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                      placeholder={`اكتب ${block.label}...`}
                    />
                  )}

                  {block.type === "text_area" && (
                    <textarea
                      value={formValues[bId] || ""}
                      onChange={(e) => handleValueChange(bId, e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all min-h-[100px] resize-y"
                      placeholder={`اكتب التفاصيل...`}
                    />
                  )}

                  {["date_gregorian", "date_hijri", "date_editable"].includes(
                    block.type,
                  ) && (
                    <input
                      type="date"
                      value={formValues[bId] || ""}
                      onChange={(e) => handleValueChange(bId, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                  )}

                  {block.type === "time" && (
                    <input
                      type="time"
                      value={formValues[bId] || ""}
                      onChange={(e) => handleValueChange(bId, e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                    />
                  )}

                  {block.type === "employee_info" && (
                    <div className="grid grid-cols-2 gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-800 mb-1 block">
                          اسم الموظف
                        </span>
                        <input
                          type="text"
                          value={formValues[bId]?.name || ""}
                          onChange={(e) =>
                            handleValueChange(bId, {
                              ...formValues[bId],
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-indigo-800 mb-1 block">
                          الرقم الوظيفي
                        </span>
                        <input
                          type="text"
                          value={formValues[bId]?.empId || ""}
                          onChange={(e) =>
                            handleValueChange(bId, {
                              ...formValues[bId],
                              empId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-xs outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  {block.type === "checkbox" && (
                    <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                      <input
                        type="checkbox"
                        checked={!!formValues[bId]}
                        onChange={(e) =>
                          handleValueChange(bId, e.target.checked)
                        }
                        className="w-5 h-5 accent-blue-600 rounded cursor-pointer"
                      />
                      <span className="text-sm font-bold text-slate-700">
                        تفعيل ({block.label})
                      </span>
                    </label>
                  )}

                  {[
                    "image_upload",
                    "signature",
                    "office_signature",
                    "office_stamp",
                    "fingerprint",
                  ].includes(block.type) && (
                    <div className="w-full h-[120px] bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center relative hover:bg-slate-100 transition-colors group">
                      {formValues[bId] ? (
                        <img
                          src={formValues[bId]}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                      ) : (
                        <>
                          <Upload
                            size={28}
                            className="text-slate-400 mb-2 group-hover:text-blue-500 transition-colors"
                          />
                          <span className="text-xs font-bold text-slate-500 group-hover:text-blue-600">
                            انقر لرفع ملف (صورة/توقيع)
                          </span>
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
                              handleValueChange(bId, ev.target.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Left Panel: Live Preview Canvas ── */}
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
              fontFamily: form?.fontFamily || "Tajawal",
            }}
          >
            {/* 💡 إخفاء خطوط الفواصل في وضع الطباعة */}
            {!isForPrint &&
              Array.from({ length: pagesCount - 1 }).map((_, i) => (
                <div
                  key={`break-${i}`}
                  className="page-break-indicator absolute left-0 right-0 border-b-2 border-dashed border-red-300 z-0 pointer-events-none"
                  style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
                ></div>
              ))}

            {form?.bgImage && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-5 z-0"
                style={{ backgroundImage: `url(${form.bgImage})` }}
              />
            )}
            {form?.headerImage && (
              <div
                className="absolute top-0 left-0 right-0 bg-cover bg-center z-[1]"
                style={{
                  height: "30mm",
                  backgroundImage: `url(${form.headerImage})`,
                }}
              />
            )}

            {/* Read-Only Live Blocks */}
            <div className="w-full h-full relative z-10">
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
                    <div className="w-full h-full flex flex-col p-1 pointer-events-none">
                      <ReadOnlyBlockRenderer
                        block={block}
                        formSettings={form}
                        value={formValues[bId]}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {form?.footerImage && (
              <div
                className="absolute bottom-0 left-0 right-0 bg-cover bg-center z-[1]"
                style={{
                  height: "20mm",
                  backgroundImage: `url(${form.footerImage})`,
                }}
              />
            )}

            {/* Pagination */}
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
