import React, {
  useState,
  useRef,
  useMemo,
  useCallback,
  useEffect,
} from "react";
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
  Move,
  Plus,
  Minus,
  Type,
  Droplet,
  Settings2,
  CalendarClock,
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
// 💡 دوال مساعدة للتواريخ والأوقات
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

const getCurrentDateStr = () => new Date().toISOString().split("T")[0];

const getCurrentTime24 = () => {
  const d = new Date();
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

const formatTime12Hour = (timeStr) => {
  if (!timeStr) return "";
  if (timeStr.toLowerCase().includes("m")) return timeStr;
  try {
    const [h, m] = timeStr.split(":");
    let hours = parseInt(h, 10);
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, "0")}:${m} ${ampm}`;
  } catch {
    return timeStr;
  }
};

// ==========================================
// 💡 محرر النصوص الغني المباشر
// ==========================================

const getBlockHelperText = (block) => {
  const label = block?.label || "هذا الحقل";

  switch (block?.type) {
    case "subject":
      return "يستعمل لكتابة موضوع الخطاب أو العنوان المختصر الذي يظهر في الورقة.";
    case "text_field":
      return `اكتب قيمة ${label} هنا، وسيتم تحديثها مباشرة داخل المستند.`;
    case "date_gregorian":
    case "date_editable":
      return "اختر التاريخ الميلادي، ويمكن استخدام زر اليوم للتعبئة السريعة.";
    case "date_hijri":
      return "اكتب التاريخ الهجري يدوياً أو اختر تاريخاً ميلادياً لتحويله تلقائياً.";
    case "time":
      return "حدد الوقت بصيغة 24 ساعة، أو استخدم زر الآن للتعبئة التلقائية.";
    case "employee_info":
      return "أدخل اسم الموظف ورقمه الوظيفي ليظهرا في القسم المخصص داخل الورقة.";
    case "checkbox":
      return "فعّل هذا الخيار عند الحاجة، ويمكن تعديل نص الخيار قبل الطباعة.";
    default:
      return "هذا الحقل قابل للتعبئة ويظهر أثره مباشرة داخل معاينة المستند.";
  }
};


const CanvasRichText = ({
  value,
  onChange,
  isForPrint,
  placeholder,
  isStatic,
  inline = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const contentRef = useRef(null);
  const renderValue = value !== undefined ? value : isStatic ? placeholder : "";

  const handleFormat = (e, command, val = null) => {
    e.preventDefault();
    document.execCommand(command, false, val);
    contentRef.current.focus();
  };

  return (
    <div
      className={`relative w-full h-full group ${isForPrint ? "bg-transparent" : ""} ${!isForPrint && isFocused ? "ring-2 ring-[#0e7490] bg-[#eef7f6]/20 rounded z-50" : ""}`}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
          setIsFocused(false);
          onChange(contentRef.current.innerHTML);
        }
      }}
      style={{ display: inline ? "inline-block" : "block" }}
    >
      {!isForPrint && isFocused && (
        <div
          className="absolute -top-4 left-0 right-0 mx-auto w-max bg-[#06111d] text-white rounded-lg shadow-[0_10px_24px_rgba(18,63,89,0.08)] flex items-center gap-1 p-1 z-[100] animate-in slide-in-from-bottom-2"
          contentEditable={false}
        >
          <select
            onChange={(e) => handleFormat(e, "fontSize", e.target.value)}
            className="bg-[#0e7490] text-white text-[10px] px-1 py-1 rounded outline-none cursor-pointer"
            defaultValue="3"
          >
            <option value="1">صغير جداً</option>
            <option value="2">صغير</option>
            <option value="3">عادي</option>
            <option value="4">متوسط</option>
            <option value="5">كبير</option>
            <option value="6">ضخم</option>
          </select>
          <div className="w-px h-3 bg-[#0e7490] mx-0.5"></div>
          <button
            onMouseDown={(e) => handleFormat(e, "bold")}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#0e7490] rounded"
          >
            <Bold size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "italic")}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#0e7490] rounded"
          >
            <Italic size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "underline")}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#0e7490] rounded"
          >
            <Underline size={12} />
          </button>
          <div className="w-px h-3 bg-[#0e7490] mx-0.5"></div>
          <input
            type="color"
            onInput={(e) => handleFormat(e, "foreColor", e.target.value)}
            className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
          />
          <div className="w-px h-3 bg-[#0e7490] mx-0.5"></div>
          <button
            onMouseDown={(e) => handleFormat(e, "justifyRight")}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#0e7490] rounded"
          >
            <AlignRight size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "justifyCenter")}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#0e7490] rounded"
          >
            <AlignCenter size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "justifyLeft")}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#0e7490] rounded"
          >
            <AlignLeft size={12} />
          </button>
        </div>
      )}

      <div
        ref={contentRef}
        contentEditable={!isForPrint}
        className={`rich-text-editor outline-none ${isForPrint ? "bg-transparent border-transparent" : inline ? "border-b border-dashed border-[#d8b46a]/35" : ""} ${inline ? "inline-block min-w-[50px]" : "w-full h-full whitespace-pre-wrap break-words"}`}
        style={{
          minHeight: inline ? "auto" : "100%",
          wordBreak: "break-word",
          cursor: isForPrint ? "default" : "text",
        }}
        dangerouslySetInnerHTML={{ __html: renderValue }}
        data-placeholder={placeholder}
      />
    </div>
  );
};

// ==========================================
// 💡 محرر الجداول المتقدم
// ==========================================
const InteractiveTable = ({ value, onChange, isForPrint }) => {
  const defaultState = {
    bg: "#ffffff",
    opacity: 1,
    data: [
      [
        { v: "العمود 1", cs: 1, rs: 1, bg: "#f1f5f9", b: true, w: "auto" },
        { v: "العمود 2", cs: 1, rs: 1, bg: "#f1f5f9", b: true, w: "auto" },
        { v: "العمود 3", cs: 1, rs: 1, bg: "#f1f5f9", b: true, w: "auto" },
      ],
      [
        { v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" },
        { v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" },
        { v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" },
      ],
    ],
  };

  let tableState = defaultState;
  if (value && value.data) {
    tableState = value;
  } else if (Array.isArray(value) && value.length > 0) {
    tableState = {
      bg: "#ffffff",
      opacity: 1,
      data: value.map((r) =>
        r.map((c) => ({
          v: typeof c === "string" ? c : c.v || "",
          cs: c.cs || 1,
          rs: c.rs || 1,
          bg: c.bg || "transparent",
          b: c.b || false,
          w: c.w || "auto",
        })),
      ),
    };
  }
  const tableData = tableState.data;

  const updateCell = (rIdx, cIdx, val) => {
    if (!onChange) return;
    const newData = [...tableData];
    newData[rIdx][cIdx] = { ...newData[rIdx][cIdx], v: val };
    onChange({ ...tableState, data: newData });
  };

  const toggleBold = (rIdx, cIdx) => {
    if (!onChange) return;
    const newData = [...tableData];
    newData[rIdx][cIdx].b = !newData[rIdx][cIdx].b;
    onChange({ ...tableState, data: newData });
  };

  const changeCellBg = (rIdx, cIdx, color) => {
    if (!onChange) return;
    const newData = [...tableData];
    newData[rIdx][cIdx].bg = color;
    onChange({ ...tableState, data: newData });
  };

  const mergeRight = (rIdx, cIdx) => {
    if (!onChange) return;
    const newData = [...tableData];
    if (cIdx + 1 < newData[rIdx].length && newData[rIdx][cIdx + 1].cs !== 0) {
      newData[rIdx][cIdx].cs += newData[rIdx][cIdx + 1].cs;
      newData[rIdx][cIdx + 1].cs = 0;
      onChange({ ...tableState, data: newData });
    }
  };

  const mergeDown = (rIdx, cIdx) => {
    if (!onChange) return;
    const newData = [...tableData];
    if (rIdx + 1 < newData.length && newData[rIdx + 1][cIdx].rs !== 0) {
      newData[rIdx][cIdx].rs += newData[rIdx + 1][cIdx].rs;
      newData[rIdx + 1][cIdx].rs = 0;
      onChange({ ...tableState, data: newData });
    }
  };

  const unmerge = (rIdx, cIdx) => {
    if (!onChange) return;
    const newData = [...tableData];
    newData[rIdx][cIdx].cs = 1;
    newData[rIdx][cIdx].rs = 1;
    if (cIdx + 1 < newData[rIdx].length) newData[rIdx][cIdx + 1].cs = 1;
    if (rIdx + 1 < newData.length) newData[rIdx + 1][cIdx].rs = 1;
    onChange({ ...tableState, data: newData });
  };

  const resizeColumn = (cIdx, action) => {
    if (!onChange) return;
    const newData = [...tableData];
    let currentWidthStr = newData[0][cIdx].w;
    let currentWidth =
      currentWidthStr === "auto" ? 100 : parseInt(currentWidthStr);
    let newWidth =
      action === "expand" ? currentWidth + 20 : Math.max(30, currentWidth - 20);
    newData.forEach((row) => {
      if (row[cIdx]) row[cIdx].w = `${newWidth}px`;
    });
    onChange({ ...tableState, data: newData });
  };

  const addRow = () =>
    onChange &&
    onChange({
      ...tableState,
      data: [
        ...tableData,
        Array(tableData[0].length).fill({
          v: "—",
          cs: 1,
          rs: 1,
          bg: "transparent",
          b: false,
          w: "auto",
        }),
      ],
    });
  const removeRow = () =>
    onChange &&
    tableData.length > 1 &&
    onChange({ ...tableState, data: tableData.slice(0, -1) });
  const addCol = () =>
    onChange &&
    onChange({
      ...tableState,
      data: tableData.map((row) => [
        ...row,
        { v: "جديد", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" },
      ]),
    });
  const removeCol = () =>
    onChange &&
    tableData[0].length > 1 &&
    onChange({ ...tableState, data: tableData.map((row) => row.slice(0, -1)) });
  const changeTableBg = (color) =>
    onChange && onChange({ ...tableState, bg: color });
  const changeTableOpacity = (opacity) =>
    onChange && onChange({ ...tableState, opacity: opacity });

  const hexToRgba = (hex, opacity) => {
    if (!hex || hex === "transparent") return "transparent";
    let r = parseInt(hex.slice(1, 3), 16),
      g = parseInt(hex.slice(3, 5), 16),
      b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const tableBgColor = hexToRgba(tableState.bg, tableState.opacity);

  return (
    <div
      className={`w-full h-full flex flex-col relative group ${isForPrint ? "bg-transparent" : ""}`}
      style={{ backgroundColor: isForPrint ? "transparent" : tableBgColor }}
    >
      {!isForPrint && onChange && (
        <div className="flex gap-1 mb-1 opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity flex-wrap items-center bg-white/80 p-1 rounded backdrop-blur-sm border border-[#e8ddc8]">
          <button
            onClick={addRow}
            className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold flex items-center gap-0.5"
          >
            <Plus size={10} /> صف
          </button>
          <button
            onClick={removeRow}
            className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold flex items-center gap-0.5"
          >
            <Minus size={10} /> صف
          </button>
          <div className="w-px h-3 bg-[#e8ddc8] mx-1"></div>
          <button
            onClick={addCol}
            className="px-1.5 py-0.5 bg-[#eef7f6] text-[#15536f] rounded text-[9px] font-bold flex items-center gap-0.5"
          >
            <Plus size={10} /> عمود
          </button>
          <button
            onClick={removeCol}
            className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold flex items-center gap-0.5"
          >
            <Minus size={10} /> عمود
          </button>
          <div className="w-px h-3 bg-[#e8ddc8] mx-1"></div>
          <div className="flex items-center gap-1 px-1 rounded">
            <span className="text-[8px] font-bold text-[#94a3b8]">
              خلفية الجدول:
            </span>
            <button
              onClick={() => changeTableBg("transparent")}
              className={`text-[8px] px-1 rounded ${tableState.bg === "transparent" ? "bg-[#e8ddc8] text-white" : "text-[#64748b] bg-[#fbf8f1]"}`}
            >
              شفاف
            </button>
            <input
              type="color"
              value={
                tableState.bg !== "transparent" ? tableState.bg : "#ffffff"
              }
              onChange={(e) => changeTableBg(e.target.value)}
              className="w-4 h-4 p-0 border border-[#d8b46a]/25 rounded-full cursor-pointer"
              title="لون الجدول"
            />
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={tableState.opacity}
              onChange={(e) => changeTableOpacity(Number(e.target.value))}
              className="w-9 h-1 accent-blue-500"
              title="شفافية الجدول"
              disabled={tableState.bg === "transparent"}
            />
          </div>
        </div>
      )}
      <div
        className="flex-1 w-full overflow-visible"
        style={{ backgroundColor: tableBgColor }}
      >
        <table className="w-full h-full text-center border-collapse border border-[#d8b46a]/35 bg-transparent table-fixed">
          <tbody>
            {tableData.map((row, rIdx) => (
              <tr key={rIdx} className="border-t border-[#d8b46a]/35">
                {row.map((cell, cIdx) => {
                  if (cell.cs === 0 || cell.rs === 0) return null;
                  return (
                    <td
                      key={cIdx}
                      colSpan={cell.cs}
                      rowSpan={cell.rs}
                      className="border border-[#d8b46a]/35 p-0 relative group/cell align-top"
                      style={{
                        backgroundColor:
                          cell.bg !== "transparent" ? cell.bg : "inherit",
                        width: cell.w,
                        minWidth: "30px",
                      }}
                    >
                      <textarea
                        value={cell.v}
                        onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                        className={`w-full h-full min-h-[30px] p-2 bg-transparent outline-none text-center resize-none ${isForPrint ? "bg-transparent border-none" : "focus:bg-[#eef7f6]/30"} ${cell.b ? "font-bold" : "font-normal"}`}
                        readOnly={isForPrint || !onChange}
                      />
                      {!isForPrint && onChange && (
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-[#123f59] text-white rounded p-1 flex gap-1 hidden group-focus-within/cell:flex z-[60] shadow-[0_10px_24px_rgba(18,63,89,0.08)] opacity-95 items-center w-max">
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              toggleBold(rIdx, cIdx);
                            }}
                            className={`p-0.5 rounded ${cell.b ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"}`}
                            title="نص عريض"
                          >
                            <Bold size={10} />
                          </button>
                          <input
                            type="color"
                            value={
                              cell.bg !== "transparent" ? cell.bg : "#ffffff"
                            }
                            onInput={(e) =>
                              changeCellBg(rIdx, cIdx, e.target.value)
                            }
                            className="w-3 h-3 p-0 border-0 rounded-full cursor-pointer bg-transparent"
                            title="تلوين الخلية"
                          />
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              changeCellBg(rIdx, cIdx, "transparent");
                            }}
                            className="text-[7px] bg-[#0e7490] px-1 rounded hover:bg-[#fbf8f1]0"
                          >
                            شفاف
                          </button>
                          <div className="w-px h-3 bg-[#0e7490] mx-0.5"></div>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              mergeRight(rIdx, cIdx);
                            }}
                            className="text-[8px] px-1 hover:bg-[#0e7490] rounded"
                          >
                            دمج ➡️
                          </button>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              mergeDown(rIdx, cIdx);
                            }}
                            className="text-[8px] px-1 hover:bg-[#0e7490] rounded"
                          >
                            دمج ⬇️
                          </button>
                          {(cell.cs > 1 || cell.rs > 1) && (
                            <button
                              onMouseDown={(e) => {
                                e.preventDefault();
                                unmerge(rIdx, cIdx);
                              }}
                              className="text-[8px] px-1 hover:bg-[#0e7490] rounded text-red-300"
                            >
                              ✖ فك
                            </button>
                          )}
                          <div className="w-px h-3 bg-[#0e7490] mx-0.5"></div>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              resizeColumn(cIdx, "expand");
                            }}
                            className="p-0.5 hover:bg-[#0e7490] rounded"
                            title="توسيع العمود"
                          >
                            ↔️
                          </button>
                          <button
                            onMouseDown={(e) => {
                              e.preventDefault();
                              resizeColumn(cIdx, "shrink");
                            }}
                            className="p-0.5 hover:bg-[#0e7490] rounded"
                            title="تضييق العمود"
                          >
                            ↔️
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 💡 بلوك الصورة والتوقيع والخلفية
// ==========================================
// ==========================================
// 💡 بلوك الصورة والتوقيع والخلفية
// ==========================================
const DraggableImageBlock = ({
  block,
  value,
  onChange,
  isForPrint,
  isSignature = false,
  isBackground = false,
}) => {
  // 1. معالجة القيمة بأمان واستخراج الصورة منها سواء كانت نص أو كائن
  let imgData = { url: null, fit: "contain", opacity: 1 };

  if (typeof value === "object" && value !== null) {
    imgData = { ...imgData, ...value };
  } else if (typeof value === "string" && value.trim() !== "") {
    imgData.url = value;
  }

  const defaultLogoUrl = block.type === "company_logo" ? "/logo.jpeg" : null;
  const effectiveImgData =
    imgData.url || !defaultLogoUrl
      ? imgData
      : { ...imgData, url: defaultLogoUrl, fit: "contain", opacity: 1, isDefaultLogo: true };

  return (
    <div
      className={`w-full h-full flex flex-col relative group ${isForPrint ? "bg-transparent" : ""}`}
    >
      {isSignature && (
        <div
          className={`font-bold mb-1 shrink-0 ${isForPrint ? "text-black" : ""}`}
          style={{
            textAlign: block.style?.alignment,
            fontSize: block.style?.fontSize,
          }}
        >
          {block.label}:
        </div>
      )}

      <div
        className={`w-full flex-1 flex items-center justify-center overflow-hidden relative ${isForPrint ? "bg-transparent border-none" : effectiveImgData.url || isBackground ? "bg-transparent border-transparent" : "border-2 border-dashed border-[#d8b46a]/40 bg-[#eef7f6]/50 rounded-xl"}`}
      >
        {effectiveImgData.url ? (
          <>
            <img
              src={effectiveImgData.url}
              alt={block.type === "company_logo" ? "Company Logo" : "img"}
              style={{ objectFit: effectiveImgData.fit, opacity: effectiveImgData.opacity }}
              className={`w-full h-full pointer-events-none ${isSignature ? "mix-blend-multiply" : ""}`}
            />
            {!isForPrint && effectiveImgData.isDefaultLogo && (
              <label className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-white/0 text-[#0e7490] opacity-0 transition-opacity hover:bg-white/70 hover:opacity-100 cursor-pointer">
                <Upload size={20} className="mb-1" />
                <span className="text-[10px] font-black">استبدال الشعار</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const reader = new FileReader();
                      reader.onload = (ev) =>
                        onChange({
                          url: ev.target.result,
                          fit: "contain",
                          opacity: 1,
                        });
                      reader.readAsDataURL(e.target.files[0]);
                    }
                  }}
                />
              </label>
            )}
          </>
        ) : !isForPrint && !isBackground ? (
          <label className="cursor-pointer flex flex-col items-center text-[#0e7490] hover:text-[#15536f] w-full h-full justify-center p-2 text-center">
            <Upload size={24} className="mb-1" />
            <span className="text-[10px] font-bold">رفع {block.label}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  const reader = new FileReader();
                  reader.onload = (ev) =>
                    onChange({
                      url: ev.target.result,
                      fit: "contain",
                      opacity: 1,
                    });
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />
          </label>
        ) : null}

        {isSignature && !imgData.url && !isForPrint && (
          <div
            className={`w-full h-full rounded flex flex-col items-center justify-end pb-2 border-2 border-dashed border-[#d8b46a]/25`}
          >
            <span className="text-[#94a3b8] mb-auto mt-2 text-xs">
              {block.type === "office_stamp"
                ? "مساحة الختم"
                : block.type === "fingerprint"
                  ? "البصمة"
                  : "التوقيع"}
            </span>
          </div>
        )}
      </div>

      {!isForPrint && imgData.url && !isBackground && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06111d] text-white rounded-lg px-2 py-1 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onChange({ ...imgData, fit: "contain" })}
            className={`p-1 rounded ${imgData.fit === "contain" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"}`}
            title="احتواء"
          >
            <Frame size={12} />
          </button>
          <button
            onClick={() => onChange({ ...imgData, fit: "cover" })}
            className={`p-1 rounded ${imgData.fit === "cover" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"}`}
            title="تغطية"
          >
            <Maximize size={12} />
          </button>
          <button
            onClick={() => onChange({ ...imgData, fit: "fill" })}
            className={`p-1 rounded ${imgData.fit === "fill" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"}`}
            title="ملء"
          >
            <Grid3x3 size={12} />
          </button>
          <div className="w-px h-3 bg-[#0e7490] mx-0.5 self-center"></div>
          <button
            onClick={() => onChange(null)}
            className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-red-500 rounded text-red-300 hover:text-white"
            title="حذف الصورة"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}

      {!isForPrint && isBackground && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#06111d] text-white rounded-lg px-3 py-1.5 flex items-center gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-[10px] text-[#cbd5e1] whitespace-nowrap">
            الشفافية:
          </span>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={imgData.opacity ?? 1}
            onChange={(e) =>
              onChange({ ...imgData, opacity: Number(e.target.value) })
            }
            className="w-24 h-1 accent-blue-500 cursor-pointer"
          />
          <span className="text-[10px] text-white font-mono w-8 text-center border-l border-[#d8b46a]/35 pl-2">
            {Math.round((imgData.opacity ?? 1) * 100)}%
          </span>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 💡 مكون رسم البلوكات الأساسي
// ==========================================
const CanvasBlockRenderer = ({
  block,
  formSettings,
  value,
  onChange,
  onLabelChange,
  customLabel,
  isForPrint,
}) => {
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

  const fontSizeStyle = block.style?.fontSize
    ? `${block.style.fontSize}px`
    : "inherit";

  switch (block.type) {
    case "title":
    case "version":
    case "reference_number":
    case "text_area":
    case "static_text":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className={`w-full h-full ${isForPrint ? "bg-transparent border-none" : ""}`}
        >
          <CanvasRichText
            value={value}
            onChange={onChange}
            isForPrint={isForPrint}
            placeholder={block.defaultValue || block.label}
            isStatic={block.type === "static_text" || block.type === "title"}
          />
        </div>
      );

    case "subject":
    case "text_field":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className={`font-bold w-full h-full flex gap-2 items-baseline ${isForPrint ? "bg-transparent" : ""}`}
        >
          <span
            className={`whitespace-nowrap shrink-0 ${isForPrint ? "text-black" : ""}`}
          >
            {block.label}:
          </span>
          <div className="flex-1 w-full flex items-center">
            <CanvasRichText
              value={value}
              onChange={onChange}
              isForPrint={isForPrint}
              placeholder="اكتب هنا..."
              inline={true}
            />
          </div>
        </div>
      );

    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      let displayDate = value || block.defaultValue || "____ / __ / __";
      if (isForPrint && !value) {
        displayDate =
          block.type === "date_hijri"
            ? formatHijriDate(new Date())
            : formatGregorianDate(new Date());
      } else if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        displayDate =
          block.type === "date_hijri"
            ? formatHijriDate(value)
            : formatGregorianDate(value);
      }
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className={`flex items-center gap-2 ${isForPrint ? "bg-transparent border-none" : ""}`}
        >
          <span
            className={`font-bold whitespace-nowrap shrink-0 ${isForPrint ? "text-black" : ""}`}
          >
            {block.label}:
          </span>
          <div
            className={`rounded flex items-center gap-2 min-w-[120px] ${isForPrint ? "bg-transparent border-none text-black p-0" : "border border-[#d8b46a]/25 bg-[#fbf8f1] px-3 py-1.5 text-[#94a3b8]"}`}
          >
            {displayDate} {!isForPrint && <CalendarClock size={14} />}
          </div>
        </div>
      );

    case "time":
      let displayTime = value || block.defaultValue || "__:__";
      if (isForPrint && !value) {
        displayTime = formatTime12Hour(getCurrentTime24());
      } else if (value) {
        displayTime = formatTime12Hour(value);
      }
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className={`flex items-center gap-2 ${isForPrint ? "bg-transparent border-none" : ""}`}
        >
          <span
            className={`font-bold whitespace-nowrap shrink-0 ${isForPrint ? "text-black" : ""}`}
          >
            {block.label}:
          </span>
          <span
            className={`font-mono px-3 py-1 rounded ${isForPrint ? "bg-transparent border-none text-black p-0" : "bg-[#fbf8f1] border border-[#e8ddc8]"}`}
            dir="ltr"
          >
            {displayTime}
          </span>
        </div>
      );

    case "employee_info":
      const empData = value || { name: "", empId: "" };
      return (
        <div
          style={{ fontSize: fontSizeStyle }}
          className={`rounded-xl h-full ${isForPrint ? "border-none bg-transparent p-0" : "border border-[#d8b46a]/35 bg-[#eef7f6]/30 p-3"}`}
        >
          <div
            className={`font-bold mb-2 flex items-center gap-2 ${isForPrint ? "text-black" : "text-[#123f59]"}`}
          >
            {!isForPrint && <User size={16} />} {block.label}
          </div>
          <div
            className={`grid min-w-0 grid-cols-2 gap-2 font-semibold text-[0.9em] ${isForPrint ? "text-black" : "text-[#123f59]"}`}
          >
            <div>الاسم: {empData.name || "---------"}</div>
            <div>
              الرقم:{" "}
              <span className="font-mono">{empData.empId || "----"}</span>
            </div>
          </div>
        </div>
      );

    case "checkbox":
      const cLabel = customLabel !== undefined ? customLabel : block.label;
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className={`flex items-center gap-2.5 ${isForPrint ? "bg-transparent" : ""}`}
        >
          <div
            onClick={() => !isForPrint && onChange(!value)}
            className={`w-4 h-4 shrink-0 rounded flex items-center justify-center ${isForPrint ? "border" : "border-2 cursor-pointer"} ${value ? (isForPrint ? "border-black bg-black" : "border-[#d8b46a]/35 bg-[#0e7490]") : isForPrint ? "border-black" : "border-[#d8b46a]/35"}`}
          >
            {value && (
              <span className="text-white text-[10px] leading-none">✓</span>
            )}
          </div>
          {!isForPrint ? (
            <input
              type="text"
              value={cLabel}
              onChange={(e) => onLabelChange && onLabelChange(e.target.value)}
              className="font-bold text-[#475569] bg-transparent border-b border-transparent hover:border-[#d8b46a]/25 focus:border-[#0e7490] outline-none w-full"
            />
          ) : (
            <span className="font-bold text-black">{cLabel}</span>
          )}
        </div>
      );

    case "table":
      return (
        <InteractiveTable
          value={value}
          onChange={onChange}
          isForPrint={isForPrint}
        />
      );

    case "company_logo":
    case "header_image":
    case "footer_image":
    case "image_upload":
      return (
        <DraggableImageBlock
          block={block}
          value={value}
          onChange={onChange}
          isForPrint={isForPrint}
        />
      );

    case "background_image":
      return (
        <DraggableImageBlock
          block={block}
          value={value}
          onChange={onChange}
          isForPrint={isForPrint}
          isBackground={true}
        />
      );

    case "signature":
    case "office_signature":
    case "office_stamp":
    case "fingerprint":
      return (
        <DraggableImageBlock
          block={block}
          value={value}
          onChange={onChange}
          isForPrint={isForPrint}
          isSignature={true}
        />
      );

    case "separator":
      return (
        <hr
          className={`my-2 border-t-2 w-full ${isForPrint ? "border-black" : "border-[#d8b46a]/35"}`}
        />
      );

    case "spacer":
      return <div className="w-full h-full"></div>;

    case "watermark":
      return null;

    default:
      return null;
  }
};

// ==========================================
// 💡 مكون الشاشة الرئيسية
// ==========================================
export default function FormFillModal({ form, onClose, onSaveUsage }) {
  const [formValues, setFormValues] = useState({});
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportType, setExportType] = useState("pdf");
  const [exportFileName, setExportFileName] = useState(
    `نموذج_${form?.name || "بدون_اسم"}`,
  );
  const [isExporting, setIsExporting] = useState(false);
  const [isForPrint, setIsForPrint] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);

  const componentRef = useRef();

  // 2. تحديث useEffect لربط الـ ID بشكل صحيح وفك تشفير الـ JSON
  useEffect(() => {
    if (form?.blocks) {
      const initialVals = {};
      form.blocks.forEach((b) => {
        const bId = b.id || b.uid; // إصلاح هام: استخدام الـ ID الحقيقي من الداتا بيز
        
        if (b.defaultValue) {
          let val = b.defaultValue;
          // التأكد من فك تشفير JSON إذا كانت الصورة/البيانات محفوظة كـ String
          if (typeof val === 'string' && val.trim().startsWith('{')) {
            try {
              val = JSON.parse(val);
            } catch {
              // تجاهل الخطأ واحتفظ بالنص كما هو
            }
          }
          initialVals[bId] = val;
        }
      });
      setFormValues(initialVals);
    }
  }, [form]);

  const sortedBlocks = useMemo(() => {
    if (!form?.blocks) return [];
    return [...form.blocks]
      .filter((b) =>
        [
          "date_gregorian",
          "date_hijri",
          "date_editable",
          "time",
          "text_field",
          "employee_info",
          "checkbox",
        ].includes(b.type),
      )
      .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));
  }, [form]);

  const handleValueChange = useCallback((id, val) => {
    setFormValues((prev) => ({ ...prev, [id]: val }));
  }, []);

  const handleBlockDragResize = (id, newPosition) => {
    setFormValues((prev) => ({ ...prev, [`${id}_pos`]: newPosition }));
  };

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
    if (maxBottom <= A4_HEIGHT_PX + 20) return A4_HEIGHT_PX;
    const requiredPages = Math.ceil(maxBottom / A4_HEIGHT_PX);
    return requiredPages * A4_HEIGHT_PX;
  };
  const dynamicHeight = calculatePaperHeight();
  const pagesCount = Math.max(1, Math.round(dynamicHeight / A4_HEIGHT_PX));


  const waitForRender = () =>
    new Promise((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    });

  const makeImageUrlsAbsolute = (rootNode) => {
    if (typeof window === "undefined" || !rootNode) return;

    rootNode.querySelectorAll("img").forEach((img) => {
      const src = img.getAttribute("src");

      if (src && src.startsWith("/")) {
        img.setAttribute("src", `${window.location.origin}${src}`);
      }
    });
  };

  const buildStandaloneDocument = (node, title = "النموذج") => {
    const safeTitle = String(title || "النموذج").replace(/[<>]/g, "");
    const clone = node.cloneNode(true);

    clone.style.transform = "none";
    clone.style.boxShadow = "none";
    clone.style.margin = "0 auto";
    clone.style.background = "#ffffff";
    clone.style.transformOrigin = "top center";

    makeImageUrlsAbsolute(clone);

    clone.querySelectorAll("[contenteditable]").forEach((el) => {
      el.setAttribute("contenteditable", "false");
    });

    clone.querySelectorAll("[data-no-print='true']").forEach((el) => {
      el.remove();
    });

    const styles = Array.from(
      document.querySelectorAll('style, link[rel="stylesheet"]'),
    )
      .map((el) => el.outerHTML)
      .join("\n");

    const baseHref =
      typeof window !== "undefined" ? `${window.location.origin}/` : "/";

    return `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <base href="${baseHref}" />
          <title>${safeTitle}</title>
          ${styles}
          <style>
            @page { size: 210mm 297mm; margin: 0; }
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              font-family: ${fontFamily || "Tajawal"}, Arial, sans-serif;
            }
            body {
              width: 100%;
              display: flex;
              justify-content: center;
              align-items: flex-start;
              overflow: visible;
            }
            .print-shell {
              width: ${pageSettings.orientation === "portrait" ? "210mm" : "297mm"};
              min-height: ${pageSettings.orientation === "portrait" ? "297mm" : "210mm"};
              background: #ffffff;
              overflow: visible;
            }
            .print-shell,
            .print-shell * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-shell button,
            .print-shell input[type="file"],
            .print-shell select,
            .print-shell [data-no-print="true"] {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <main class="print-shell">${clone.outerHTML}</main>
        </body>
      </html>
    `;
  };

  const waitForPopupImages = (popup) => {
    const images = Array.from(popup.document.images || []);

    if (!images.length) {
      return Promise.resolve();
    }

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

  const openPopupAndPrint = async (html, title = "النموذج") => {
    const popup = window.open("", "_blank", "width=1200,height=900");

    if (!popup) {
      toast.error("المتصفح منع فتح نافذة الطباعة");
      return false;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();

    const hint = popup.document.createElement("div");
    hint.textContent = "Format fixé: impression verticale A4. Décochez En-têtes et pieds de page si nécessaire.";
    hint.style.cssText = "position:fixed;top:8px;left:50%;transform:translateX(-50%);z-index:99999;background:#123f59;color:#fff;padding:8px 14px;border-radius:12px;font:700 12px Arial;box-shadow:0 8px 22px rgba(0,0,0,.15);";
    hint.setAttribute("data-no-print", "true");
    popup.document.body.appendChild(hint);

    await waitForPopupImages(popup);

    setTimeout(() => {
      popup.focus();
      popup.print();
    }, 200);

    return true;
  };



  const openPreparingPopup = (title = "النموذج") => {
    const popup = window.open("", "_blank", "width=1200,height=900");

    if (!popup) {
      return null;
    }

    popup.document.open();
    popup.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>${String(title || "النموذج").replace(/[<>]/g, "")}</title>
          <style>
            html,
            body {
              margin: 0;
              height: 100%;
              background: #ffffff;
              font-family: Tajawal, Arial, sans-serif;
              color: #123f59;
            }

            body {
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .loader {
              width: 420px;
              max-width: 90vw;
              border: 1px solid #e8ddc8;
              border-radius: 22px;
              padding: 28px;
              text-align: center;
              box-shadow: 0 18px 48px rgba(18, 63, 89, 0.14);
            }

            .loader strong {
              display: block;
              font-size: 20px;
              margin-bottom: 8px;
            }

            .loader span {
              color: #64748b;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="loader">
            <strong>جاري تجهيز المستند...</strong>
            <span>يرجى الانتظار لحظات قبل ظهور نافذة الطباعة.</span>
          </div>
        </body>
      </html>
    `);
    popup.document.close();

    return popup;
  };

  const getAbsoluteUrl = (src) => {
    if (!src || src.startsWith("data:") || src.startsWith("blob:")) {
      return src;
    }

    try {
      return new URL(src, window.location.origin).href;
    } catch {
      return src;
    }
  };


  const imageToDataUrl = async (src) => {
    if (!src || src.startsWith("data:")) {
      return src;
    }

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);

      const response = await fetch(getAbsoluteUrl(src), {
        mode: "cors",
        cache: "force-cache",
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        return src;
      }

      const blob = await response.blob();

      return await Promise.race([
        new Promise((resolve) => {
          const reader = new FileReader();

          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => resolve(src);
          reader.readAsDataURL(blob);
        }),
        new Promise((resolve) => setTimeout(() => resolve(src), 1800)),
      ]);
    } catch {
      return src;
    }
  };

  const inlineCloneImages = async (clone) => {
    const images = Array.from(clone.querySelectorAll("img"));

    await Promise.all(
      images.map(async (img) => {
        const src = img.getAttribute("src");

        if (!src) {
          return;
        }

        const dataUrl = await imageToDataUrl(src);
        img.setAttribute("src", dataUrl || src);
        img.setAttribute("crossorigin", "anonymous");
      }),
    );
  };

  const createExportClone = async () => {
    if (!componentRef.current) {
      throw new Error("MISSING_DOCUMENT_NODE");
    }

    const clone = componentRef.current.cloneNode(true);

    clone.setAttribute("data-export-clone", "true");
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top right";
    clone.style.boxShadow = "none";
    clone.style.background = "#ffffff";
    clone.style.margin = "0";
    clone.style.position = "fixed";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.zIndex = "-9999";
    clone.style.pointerEvents = "none";

    clone.querySelectorAll("[contenteditable]").forEach((el) => {
      el.setAttribute("contenteditable", "false");
    });

    clone.querySelectorAll("[data-no-print='true']").forEach((el) => {
      el.remove();
    });

    clone.querySelectorAll("input[type='file']").forEach((el) => {
      el.remove();
    });

    makeImageUrlsAbsolute(clone);
    await inlineCloneImages(clone);

    document.body.appendChild(clone);

    await waitForRender();

    return clone;
  };



  const captureDocumentCanvas = async () => {
    const clone = await createExportClone();

    try {
      const width = Math.max(clone.scrollWidth, clone.offsetWidth, 1);
      const height = Math.max(clone.scrollHeight, clone.offsetHeight, 1);

      return await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        imageTimeout: 15000,
        removeContainer: true,
        scrollX: 0,
        scrollY: 0,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        ignoreElements: (element) => {
          if (!element) return false;

          const tagName = element.tagName?.toLowerCase?.();
          const noPrint = element.getAttribute?.("data-no-print") === "true";
          const isFileInput =
            tagName === "input" && element.getAttribute?.("type") === "file";

          return noPrint || isFileInput;
        },
      });
    } finally {
      clone.remove();
    }
  };


  const openImagePrintPopup = async (imageData, title = "النموذج", existingPopup = null) => {
    const popup = existingPopup || window.open("", "_blank", "width=1200,height=900");

    if (!popup) {
      toast.error("المتصفح منع فتح نافذة الطباعة");
      return false;
    }

    const pageWidth = "210mm";
    const pageHeight = "297mm";
    const safeTitle = String(title || "النموذج").replace(/[<>]/g, "");

    popup.document.open();
    popup.document.write(`
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>${safeTitle}</title>
          <style>
            @page {
              size: 210mm 297mm;
              margin: 0;
            }

            * {
              box-sizing: border-box;
            }

            html,
            body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              display: flex;
              justify-content: center;
              align-items: flex-start;
              min-height: ${pageHeight};
              overflow: visible;
            }

            .print-page {
              width: ${pageWidth};
              min-height: ${pageHeight};
              background: #ffffff;
              overflow: visible;
            }

            .print-page img {
              display: block;
              width: 100%;
              height: auto;
              object-fit: contain;
            }
          </style>
        </head>

        <body>
          <main class="print-page">
            <img src="${imageData}" alt="${safeTitle}" />
          </main>
        </body>
      </html>
    `);
    popup.document.close();

    await waitForPopupImages(popup);

    setTimeout(() => {
      popup.focus();
      popup.print();
    }, 250);

    return true;
  };





  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const promiseWithTimeout = (promise, timeoutMs = 5000, fallback = null) =>
    Promise.race([
      promise,
      new Promise((resolve) => setTimeout(() => resolve(fallback), timeoutMs)),
    ]);


  const sanitizePrintCss = (css = "") => {
    return String(css)
      .replace(/body\s*\*\s*\{[^}]*visibility\s*:\s*hidden[^}]*\}/gi, "")
      .replace(/html\s*,\s*body\s*\{[^}]*visibility\s*:\s*hidden[^}]*\}/gi, "")
      .replace(/\.print-hidden\s*\{[^}]*\}/gi, "")
      .replace(/@media\s+print\s*\{\s*body\s*\*\s*\{[^}]*visibility\s*:\s*hidden[^}]*\}\s*\}/gi, "");
  };

  const collectInlineStyles = async () => {
    let css = `
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #ffffff; }
      body { font-family: Tajawal, Arial, sans-serif; direction: rtl; }
      [data-no-print='true'] { display: none !important; }
      input[type='file'] { display: none !important; }
      .custom-scrollbar, .custom-scrollbar-slim { scrollbar-width: none; }
      .custom-scrollbar::-webkit-scrollbar, .custom-scrollbar-slim::-webkit-scrollbar { display: none; }
    `;

    document.querySelectorAll("style").forEach((styleTag) => {
      css += `\n${styleTag.textContent || ""}`;
    });

    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    const linkedCss = await Promise.all(
      links.map(async (link) => {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 1500);
          const response = await fetch(link.href, {
            signal: controller.signal,
            cache: "force-cache",
          });
          clearTimeout(timer);

          if (!response.ok) return "";
          return await response.text();
        } catch {
          return "";
        }
      }),
    );

    css += `\n${linkedCss.join("\n")}`;

    return sanitizePrintCss(css).replace(/<\/style>/gi, "<\\/style>");
  };

  const prepareExportClone = async ({ inlineImages = false } = {}) => {
    if (!componentRef.current) {
      throw new Error("MISSING_DOCUMENT_NODE");
    }

    const clone = componentRef.current.cloneNode(true);

    clone.setAttribute("data-export-document", "true");
    clone.style.transform = "scale(1)";
    clone.style.transformOrigin = "top right";
    clone.style.boxShadow = "none";
    clone.style.background = "#ffffff";
    clone.style.margin = "0 auto";
    clone.style.position = "relative";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.zIndex = "1";
    clone.style.pointerEvents = "auto";

    makeImageUrlsAbsolute(clone);

    clone.querySelectorAll("[contenteditable]").forEach((el) => {
      el.setAttribute("contenteditable", "false");
    });

    clone.querySelectorAll("[data-no-print='true']").forEach((el) => {
      el.remove();
    });

    clone.querySelectorAll("input[type='file']").forEach((el) => {
      el.remove();
    });

    if (inlineImages) {
      await inlineCloneImages(clone);
    }

    const sourceWidth = Math.max(
      componentRef.current?.scrollWidth || 0,
      componentRef.current?.offsetWidth || 0,
      794,
    );
    const sourceHeight = Math.max(
      componentRef.current?.scrollHeight || 0,
      componentRef.current?.offsetHeight || 0,
      A4_HEIGHT_PX,
    );

    clone.setAttribute("data-source-width", String(sourceWidth));
    clone.setAttribute("data-source-height", String(sourceHeight));
    clone.style.width = `${sourceWidth}px`;
    clone.style.height = `${sourceHeight}px`;
    clone.style.minHeight = `${sourceHeight}px`;

    return clone;
  };

  const buildDirectHtmlDocument = async (title = "النموذج", { inlineImages = false } = {}) => {
    const safeTitle = String(title || "النموذج").replace(/[<>]/g, "");
    const css = await collectInlineStyles();
    const clone = await prepareExportClone({ inlineImages });

    const sourceWidth = Number(clone.getAttribute("data-source-width")) || 794;
    const sourceHeight = Number(clone.getAttribute("data-source-height")) || A4_HEIGHT_PX;

    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const pageWidthPx = 794;
    const pageHeightPx = A4_HEIGHT_PX;
    const fitScale = Math.min(pageWidthPx / sourceWidth, pageHeightPx / sourceHeight, 1);

    return `
      <!doctype html>
      <html lang="ar" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <base href="${window.location.origin}/" />
          <title>${safeTitle}</title>
          <style>
            @page {
              size: 210mm 297mm;
              margin: 0;
            }

            ${css}

            html,
            body {
              margin: 0 !important;
              padding: 0 !important;
              width: ${pageWidthMm}mm !important;
              height: ${pageHeightMm}mm !important;
              background: #ffffff !important;
              overflow: hidden !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
              display: block !important;
            }

            .print-shell {
              width: ${pageWidthMm}mm !important;
              height: ${pageHeightMm}mm !important;
              min-height: ${pageHeightMm}mm !important;
              max-height: ${pageHeightMm}mm !important;
              background: #ffffff !important;
              overflow: hidden !important;
              position: relative !important;
              page-break-after: avoid !important;
              page-break-inside: avoid !important;
            }

            .print-fit {
              position: absolute !important;
              top: 0 !important;
              left: 50% !important;
              width: ${sourceWidth}px !important;
              height: ${sourceHeight}px !important;
              min-height: ${sourceHeight}px !important;
              transform: translateX(-50%) scale(${fitScale}) !important;
              transform-origin: top center !important;
              background: #ffffff !important;
              overflow: visible !important;
            }

            .print-shell,
            .print-shell * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              visibility: visible !important;
              opacity: 1 !important;
            }

            .print-shell [data-no-print='true'],
            .print-shell button,
            .print-shell input[type='file'],
            .print-shell select {
              display: none !important;
              visibility: hidden !important;
            }
          </style>
        </head>
        <body>
          <main class="print-shell">
            <section class="print-fit">
              ${clone.outerHTML}
            </section>
          </main>
        </body>
      </html>
    `;
  };

  const writeHtmlToPopupAndPrint = async (popup, html) => {
    if (!popup) {
      toast.error("المتصفح منع فتح نافذة الطباعة. فعّل السماح بالنوافذ المنبثقة.");
      return false;
    }

    popup.document.open();
    popup.document.write(html);
    popup.document.close();

    const forceStyle = popup.document.createElement("style");
    forceStyle.textContent = `
      @media print {
        html, body {
          overflow: hidden !important;
          width: 100% !important;
          height: 100% !important;
          background: #fff !important;
        }
        body *, .print-shell, .print-shell *, .print-fit, .print-fit * {
          visibility: visible !important;
          opacity: 1 !important;
        }
        .print-shell {
          display: block !important;
          position: relative !important;
          background: #fff !important;
          page-break-after: avoid !important;
          page-break-before: avoid !important;
          page-break-inside: avoid !important;
        }
        .print-shell [data-no-print='true'],
        .print-shell button,
        .print-shell input[type='file'],
        .print-shell select {
          display: none !important;
          visibility: hidden !important;
        }
      }
    `;
    popup.document.head.appendChild(forceStyle);

    const shell = popup.document.querySelector(".print-shell");
    if (shell && !shell.textContent.trim() && !shell.querySelector("img")) {
      shell.innerHTML = `
        <div style="padding:24px; color:#123f59; font-family:Tajawal, Arial, sans-serif;">
          تعذر تحميل محتوى النموذج داخل نافذة الطباعة.
        </div>
      `;
    }

    await promiseWithTimeout(waitForPopupImages(popup), 1800, null);
    await sleep(250);

    popup.focus();
    popup.print();

    return true;
  };

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

  const renderDocumentCanvasBySvg = async (scale = 2) => {
    const clone = await prepareExportClone({ inlineImages: true });
    const css = await collectInlineStyles();

    const width = Math.max(
      componentRef.current?.scrollWidth || 0,
      componentRef.current?.offsetWidth || 0,
      1,
    );
    const height = Math.max(
      componentRef.current?.scrollHeight || 0,
      componentRef.current?.offsetHeight || 0,
      1,
    );

    clone.style.width = `${width}px`;
    clone.style.minHeight = `${height}px`;

    const xhtml = `
      <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px; min-height:${height}px; background:#ffffff;">
        <style>${css}</style>
        ${clone.outerHTML}
      </div>
    `;

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
        <foreignObject width="100%" height="100%">
          ${xhtml}
        </foreignObject>
      </svg>
    `;

    const svgUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    const image = await new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = svgUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width * scale);
    canvas.height = Math.ceil(height * scale);

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas;
  };



  const printStandaloneDocument = async (preOpenedPopup = null) => {
    if (!componentRef.current) {
      toast.error("لا يمكن الوصول إلى محتوى الطباعة");
      preOpenedPopup?.close?.();
      return;
    }

    setIsForPrint(true);
    setActiveBlockId(null);

    try {
      await waitForRender();

      const html = await buildDirectHtmlDocument(
        exportFileName?.trim?.() || form?.name || "النموذج",
        { inlineImages: false },
      );

      await writeHtmlToPopupAndPrint(preOpenedPopup, html);
    } catch (error) {
      console.error(error);
      preOpenedPopup?.close?.();
      toast.error("تعذرت الطباعة. تم إلغاء العملية لتفادي الصفحة البيضاء.");
    } finally {
      setIsForPrint(false);
    }
  };


  const exportCanvasImage = async (fileName, mode = "image") => {
    if (!componentRef.current) {
      toast.error("لا يمكن الوصول إلى محتوى التصدير");
      return;
    }

    setIsForPrint(true);
    setActiveBlockId(null);

    try {
      await waitForRender();

      const canvas = await promiseWithTimeout(
        renderDocumentCanvasBySvg(2),
        9000,
        null,
      );

      if (!canvas || !canvas.width || !canvas.height) {
        throw new Error("CANVAS_TIMEOUT_OR_EMPTY");
      }

      const imgData = canvas.toDataURL("image/png");

      if (mode === "pdf") {
        const orientation = "p";
        const pdf = new jsPDF(orientation, "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = (canvas.height * pdfWidth) / Math.max(canvas.width, 1);

        let position = 0;
        let heightLeft = imgHeight;

        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
          position -= pdfHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, pdfWidth, imgHeight);
          heightLeft -= pdfHeight;
        }

        downloadBlobFile(pdf.output("blob"), `${fileName}.pdf`, "application/pdf");
        return;
      }

      downloadBlobFile(
        await (await fetch(imgData)).blob(),
        `${fileName}.png`,
        "image/png",
      );
    } catch (error) {
      console.error(error);

      if (mode === "pdf") {
        const popup = openPreparingPopup(fileName);
        const html = await buildDirectHtmlDocument(fileName, { inlineImages: false });
        await writeHtmlToPopupAndPrint(popup, html);
        toast("تم فتح نافذة الطباعة. اختر Save as PDF من قائمة الطابعة.", {
          icon: "ℹ️",
        });
        return;
      }

      toast.error("تعذر توليد صورة HD بسبب قيود المتصفح أو الصور. جرّب تصدير Word أو PDF.");
      throw error;
    } finally {
      setIsForPrint(false);
    }
  };


  const exportStandaloneDocument = async () => {
    if (!componentRef.current) {
      toast.error("لا يمكن الوصول إلى محتوى التصدير");
      return;
    }

    const fileName =
      (exportFileName?.trim?.() || form?.name || "النموذج")
        .replace(/[\\/:*?"<>|]/g, "_");

    if (exportType === "pdf") {
      await exportCanvasImage(fileName, "pdf");
      toast.success("تم تجهيز ملف PDF");
      return;
    }

    if (exportType === "image") {
      await exportCanvasImage(fileName, "image");
      toast.success("تم تحميل الصورة HD");
      return;
    }

    setIsForPrint(true);
    setActiveBlockId(null);

    try {
      await waitForRender();

      const html = await buildDirectHtmlDocument(fileName, { inlineImages: false });

      downloadBlobFile(
        html,
        `${fileName}.doc`,
        "application/msword;charset=utf-8",
      );

      toast.success("تم تحميل ملف Word بنجاح");
    } finally {
      setIsForPrint(false);
    }
  };


  const handlePrintNatively = async () => {
    const title = exportFileName?.trim?.() || form?.name || "النموذج";
    const popup = openPreparingPopup(title);

    if (!popup) {
      toast.error("المتصفح منع فتح نافذة الطباعة. فعّل السماح بالنوافذ المنبثقة.");
      return;
    }

    await printStandaloneDocument(popup);
  };


  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportStandaloneDocument();
    } catch (error) {
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[10000] bg-[#fbf8f1] flex flex-col font-[Tajawal]"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="h-[76px] bg-white/95 border-b border-[#e8ddc8] px-3 flex items-center justify-between shrink-0 shadow-[0_6px_14px_rgba(18,63,89,0.04)] z-20">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-28 shrink-0 items-center justify-center rounded-2xl border border-[#e8ddc8] bg-white p-1.5 shadow-[0_8px_18px_rgba(18,63,89,0.06)]">
            <img
              src="/logo.jpeg"
              alt="Details Consulting Engineers"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-1 rounded-full bg-[#eef7f6] px-2 py-0.5 text-[10px] font-black text-[#0e7490]">
              <LayoutTemplate size={13} />
              مستند جاهز للطباعة والتصدير
            </div>
            <h1 className="truncate text-[16px] font-black text-[#123f59]">
              إصدار المستند: {form?.name}
            </h1>
            <p className="text-[11px] text-[#94a3b8] font-mono mt-0.5">
              Code: {form?.code} • Version: {form?.version} • A4 Preview
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* ── حقل اسم الملف ── */}
          <input
            type="text"
            value={exportFileName}
            onChange={(e) => setExportFileName(e.target.value)}
            className="px-2.5 py-2 border border-[#d8b46a]/25 rounded-xl text-[12px] font-bold text-[#475569] bg-[#fbf8f1] outline-none focus:border-[#0e7490] focus:bg-white transition-all w-[180px]"
            placeholder="اسم الملف لتصديره..."
            title="تخصيص اسم الملف قبل التصدير"
          />

          <select
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
            className="px-2.5 py-2 border border-[#d8b46a]/25 rounded-xl text-[12px] font-bold text-[#475569] bg-white outline-none cursor-pointer hover:border-[#d8b46a]/35"
          >
            <option value="pdf">تصدير PDF</option>
            <option value="word">تصدير Word</option>
            <option value="image">تصدير صورة HD</option>
          </select>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-[#d8b46a]/35 bg-[#eef7f6] px-3 text-[12px] font-black text-[#15536f] transition hover:bg-white disabled:opacity-60"
          >
            <IconWithText
              icon={Download}
              text={isExporting ? "جاري التجهيز..." : "تصدير الملف"}
              iconClassName="h-4 w-4"
            />
          </button>
          <button
            onClick={handlePrintNatively}
            disabled={isExporting}
            className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[12px] font-black text-white shadow-[0_8px_18px_rgba(18,63,89,0.08)] transition hover:bg-[#15536f] disabled:opacity-60"
          >
            <IconWithText icon={Printer} text="طباعة النموذج" iconClassName="h-4 w-4" />
          </button>
          <div className="w-px h-8 bg-[#eef7f6] mx-2"></div>
          <button
            onClick={onClose}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-[#e8ddc8] bg-white px-2.5 text-[10px] font-black text-[#64748b] transition hover:bg-red-50 hover:text-red-600"
          >
            <IconWithText icon={X} text="إغلاق" iconClassName="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Split Screen Layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Right Panel: Form Entry ── */}
        <div className="w-[390px] bg-white/95 border-l border-[#e8ddc8] flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 shrink-0">
          <div className="border-b border-[#e8ddc8] bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] p-3 text-white">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74]">
                <Type size={18} />
              </span>
              <div>
                <h3 className="text-[15px] font-black leading-tight">الحقول القابلة للتعبئة</h3>
                <p className="mt-0.5 text-[10px] font-bold text-white/60">
                  كل خانة موضحة بدورها، والتعديل يظهر فوراً داخل الورقة.
                </p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-white/10 bg-white/10 p-2 text-[10px] font-bold leading-relaxed text-white/75">
              للصور، الجداول، التوقيع أو النصوص الحرة: اضغط مباشرة على العنصر داخل الورقة لتعديله أو تغيير حجمه.
            </div>
          </div>

          <div className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim p-3 space-y-2.5">
            {sortedBlocks.length === 0 ? (
              <div className="text-center text-[#94a3b8] text-xs mt-10">
                جميع الحقول متاحة للتحرير المباشر داخل الورقة.
              </div>
            ) : (
              sortedBlocks.map((block) => {
                const bId = block.id || block.uid;
                const isActive = activeBlockId === bId;

                return (
                  <div
                    key={bId}
                    onClick={() => setActiveBlockId(bId)}
                    className={`flex flex-col gap-1.5 rounded-2xl border p-3 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#0e7490] bg-[#eef7f6]/60 shadow-[0_8px_18px_rgba(18,63,89,0.06)]"
                        : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/45 hover:bg-[#fbf8f1]"
                    }`}
                  >
                    <label className="text-[12px] font-black text-[#123f59] flex items-center gap-2">
                      {[
                        "date_gregorian",
                        "date_hijri",
                        "date_editable",
                      ].includes(block.type) && (
                        <Calendar size={14} className="text-[#94a3b8]" />
                      )}
                      {block.type === "time" && (
                        <Clock size={14} className="text-[#94a3b8]" />
                      )}
                      {block.type === "employee_info" && (
                        <User size={14} className="text-[#94a3b8]" />
                      )}
                      <span className="min-w-0 truncate">{block.label}</span>
                    </label>
                    <p className="rounded-lg bg-[#fbf8f1] px-2 py-1 text-[10px] font-bold leading-relaxed text-[#64748b]">
                      {getBlockHelperText(block)}
                    </p>

                    {["text_field", "subject"].includes(block.type) && (
                      <input
                        type="text"
                        value={formValues[bId] || ""}
                        onChange={(e) => handleValueChange(bId, e.target.value)}
                        className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-sm font-semibold outline-none focus:bg-white focus:border-[#0e7490] transition-all"
                        placeholder={`اكتب ${block.label}...`}
                      />
                    )}

                    {["date_gregorian", "date_editable"].includes(
                      block.type,
                    ) && (
                      <div className="flex gap-2">
                        <input
                          type="date"
                          value={formValues[bId] || ""}
                          onChange={(e) =>
                            handleValueChange(bId, e.target.value)
                          }
                          className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-[#0e7490] transition-all"
                        />
                        <button
                          onClick={() =>
                            handleValueChange(bId, getCurrentDateStr())
                          }
                          className="rounded-lg bg-[#eef7f6] px-3 py-2 text-xs font-black text-[#15536f] hover:bg-white border border-[#d8b46a]/25"
                        >
                          اليوم
                        </button>
                      </div>
                    )}

                    {block.type === "date_hijri" && (
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formValues[bId] || ""}
                            onChange={(e) =>
                              handleValueChange(bId, e.target.value)
                            }
                            placeholder="مثال: 1445/08/15"
                            className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-[#0e7490] transition-all"
                          />
                          <button
                            onClick={() =>
                              handleValueChange(
                                bId,
                                formatHijriDate(new Date()),
                              )
                            }
                            className="rounded-lg border border-[#d8b46a]/25 bg-[#eef7f6] px-3 py-2 text-xs font-black text-[#15536f] hover:bg-white whitespace-nowrap"
                          >
                            اليوم
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type="date"
                            onChange={(e) => {
                              if (e.target.value)
                                handleValueChange(
                                  bId,
                                  formatHijriDate(e.target.value),
                                );
                            }}
                            className="w-full px-3 py-1.5 text-xs text-[#94a3b8] bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg outline-none cursor-pointer"
                          />
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[10px] text-[#94a3b8] pointer-events-none">
                            اختر بالميلادي للتحويل للهجري
                          </span>
                        </div>
                      </div>
                    )}

                    {block.type === "time" && (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex gap-2">
                          <input
                            type="time"
                            value={formValues[bId] || ""}
                            onChange={(e) =>
                              handleValueChange(bId, e.target.value)
                            }
                            className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-[#0e7490] transition-all"
                          />
                          <button
                            onClick={() =>
                              handleValueChange(bId, getCurrentTime24())
                            }
                            className="rounded-lg border border-[#d8b46a]/25 bg-[#eef7f6] px-3 py-2 text-xs font-black text-[#15536f] hover:bg-white whitespace-nowrap"
                          >
                            الآن
                          </button>
                        </div>
                      </div>
                    )}

                    {block.type === "employee_info" && (
                      <div className="grid min-w-0 grid-cols-1 gap-2 p-3 bg-[#eef7f6]/50 border border-[#e8ddc8] rounded-lg">
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
                          className="w-full px-3 py-1.5 border border-[#d8b46a]/35 rounded text-xs outline-none focus:border-[#d8b46a]/35"
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
                          className="w-full px-3 py-1.5 border border-[#d8b46a]/35 rounded text-xs outline-none focus:border-[#d8b46a]/35 font-mono"
                        />
                      </div>
                    )}

                    {block.type === "checkbox" && (
                      <label className="flex items-center gap-2.5 p-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg cursor-pointer hover:bg-[#fbf8f1]">
                        <input
                          type="checkbox"
                          checked={!!formValues[bId]}
                          onChange={(e) =>
                            handleValueChange(bId, e.target.checked)
                          }
                          className="w-4 h-4 accent-[#0e7490] rounded cursor-pointer"
                        />
                        <span className="text-xs font-bold text-[#475569]">
                          تفعيل (
                          {formValues[`${bId}_label`] !== undefined
                            ? formValues[`${bId}_label`]
                            : block.label}
                          )
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
        <div
          className="flex-1 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white overflow-y-auto overflow-x-hidden custom-scrollbar-slim flex justify-center py-8 custom-scrollbar relative"
          onClick={() => setActiveBlockId(null)}
        >
          {!isForPrint && (
            <div className="absolute top-4 left-6 flex items-center gap-1 bg-white/95 shadow-[0_6px_14px_rgba(18,63,89,0.04)] p-1 rounded-xl z-20 border border-[#e8ddc8]">
              <button
                onClick={() => setZoomLevel((p) => Math.max(p - 10, 50))}
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg px-2.5 text-[10px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
              >
                <IconWithText icon={ZoomOut} text="تصغير" iconClassName="h-3.5 w-3.5" />
              </button>
              <span className="text-[13px] font-bold font-mono text-[#475569] min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((p) => Math.min(p + 10, 150))}
                className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 hover:bg-[#fbf8f1] rounded-lg text-[#64748b]"
              >
                <IconWithText icon={ZoomIn} text="تكبير" iconClassName="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div
            ref={componentRef}
            data-document-canvas="true"
            className="bg-white relative flex flex-col origin-top transition-transform duration-200"
            style={{
              width: "210mm",
              height: `${dynamicHeight}px`,
              transform: isForPrint ? "scale(1)" : `scale(${zoomLevel / 100})`,
              fontFamily: fontFamily,
              backgroundColor: isForPrint ? "transparent" : "#ffffff",
              boxShadow: isForPrint
                ? "none"
                : "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                  className="absolute left-0 right-0 border-b-2 border-dashed border-red-300 z-0 pointer-events-none"
                  style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
                ></div>
              ))}

            <div
              className={`w-full h-full relative z-10 min-h-full ${form?.colorMode === "bw" ? "grayscale" : ""}`}
            >
              <div className="w-full h-full relative z-10 min-h-full">
                {form?.blocks
                  ?.filter((b) => b.type !== "watermark")
                  .map((block) => {
                    const bId = block.id || block.uid;
                    const isActive = activeBlockId === bId;
                    const customPos = formValues[`${bId}_pos`] ||
                      block.position || { x: 0, y: 0, width: 200, height: 50 };
                    const isBackgroundLayer = block.type === "background_image";

                    return (
                      <div
                        key={bId}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBlockId(bId);
                        }}
                        className={`absolute ${!isForPrint && isActive ? "ring-2 ring-[#0e7490] rounded" : !isForPrint ? "hover:ring-1 hover:ring-[#d8b46a]/35" : ""} ${isBackgroundLayer ? "z-0" : isActive ? "z-50" : "z-10"}`}
                        style={{
                          left: `${customPos.x}px`,
                          top: `${customPos.y}px`,
                          width: `${customPos.width}px`,
                          height: `${customPos.height}px`,
                          resize:
                            !isForPrint &&
                            !isBackgroundLayer &&
                            [
                              "image_upload",
                              "company_logo",
                              "header_image",
                              "footer_image",
                              "table",
                              "text_area",
                              "static_text",
                            ].includes(block.type) &&
                            isActive
                              ? "both"
                              : "none",
                          overflow:
                            !isForPrint &&
                            [
                              "image_upload",
                              "company_logo",
                              "signature",
                              "office_signature",
                              "office_stamp",
                              "fingerprint",
                            ].includes(block.type)
                              ? "auto"
                              : "visible",
                        }}
                      >
                        {!isForPrint && isActive && !isBackgroundLayer && (
                          <div className="absolute -top-3 right-0 bg-[#0e7490] text-white text-[9px] px-2 py-0.5 rounded-t-md opacity-90">
                            {block.label}
                          </div>
                        )}

                        {!isForPrint &&
                          isActive &&
                          !isBackgroundLayer &&
                          [
                            "image_upload",
                            "company_logo",
                            "header_image",
                            "footer_image",
                            "signature",
                            "office_signature",
                            "office_stamp",
                            "fingerprint",
                          ].includes(block.type) && (
                            <div
                              className="absolute -right-6 top-1/2 -translate-y-1/2 bg-[#0e7490] text-white p-1 rounded shadow cursor-move z-50"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const startX = e.clientX;
                                const startY = e.clientY;
                                const startLeft = customPos.x;
                                const startTop = customPos.y;
                                const onMouseMove = (moveEvent) => {
                                  handleBlockDragResize(bId, {
                                    ...customPos,
                                    x:
                                      startLeft +
                                      (moveEvent.clientX - startX) /
                                        (zoomLevel / 100),
                                    y:
                                      startTop +
                                      (moveEvent.clientY - startY) /
                                        (zoomLevel / 100),
                                  });
                                };
                                const onMouseUp = () => {
                                  document.removeEventListener(
                                    "mousemove",
                                    onMouseMove,
                                  );
                                  document.removeEventListener(
                                    "mouseup",
                                    onMouseUp,
                                  );
                                };
                                document.addEventListener(
                                  "mousemove",
                                  onMouseMove,
                                );
                                document.addEventListener("mouseup", onMouseUp);
                              }}
                            >
                              <Move size={14} />
                            </div>
                          )}

                        <div className="w-full h-full flex flex-col p-0.5 relative z-10">
                          <CanvasBlockRenderer
                            block={block}
                            formSettings={form}
                            value={formValues[bId]}
                            onChange={(val) => handleValueChange(bId, val)}
                            onLabelChange={(val) =>
                              handleValueChange(`${bId}_label`, val)
                            }
                            customLabel={formValues[`${bId}_label`]}
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
                className={`absolute left-[20mm] right-[20mm] flex justify-between text-[10px] font-mono pointer-events-none ${isForPrint ? "text-black" : "text-[#94a3b8]"}`}
                style={{ top: `${(i + 1) * A4_HEIGHT_PX - 40}px` }}
              >
                <span dir="ltr">{form?.code}</span>
                <span className="font-bold">
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
