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
import jsPDF from "jspdf";
import { toast } from "sonner";

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
      className={`relative w-full h-full group print:bg-transparent ${!isForPrint && isFocused ? "ring-2 ring-blue-400 bg-blue-50/20 rounded z-50" : ""}`}
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
          className="absolute -top-12 left-0 right-0 mx-auto w-max bg-slate-900 text-white rounded-lg shadow-xl flex items-center gap-1 p-1 z-[100] animate-in slide-in-from-bottom-2"
          contentEditable={false}
        >
          <select
            onChange={(e) => handleFormat(e, "fontSize", e.target.value)}
            className="bg-slate-700 text-white text-[10px] px-1 py-1 rounded outline-none cursor-pointer"
            defaultValue="3"
          >
            <option value="1">صغير جداً</option>
            <option value="2">صغير</option>
            <option value="3">عادي</option>
            <option value="4">متوسط</option>
            <option value="5">كبير</option>
            <option value="6">ضخم</option>
          </select>
          <div className="w-px h-3 bg-slate-700 mx-0.5"></div>
          <button
            onMouseDown={(e) => handleFormat(e, "bold")}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <Bold size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "italic")}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <Italic size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "underline")}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <Underline size={12} />
          </button>
          <div className="w-px h-3 bg-slate-700 mx-0.5"></div>
          <input
            type="color"
            onInput={(e) => handleFormat(e, "foreColor", e.target.value)}
            className="w-5 h-5 p-0 border-0 rounded cursor-pointer bg-transparent"
          />
          <div className="w-px h-3 bg-slate-700 mx-0.5"></div>
          <button
            onMouseDown={(e) => handleFormat(e, "justifyRight")}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <AlignRight size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "justifyCenter")}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <AlignCenter size={12} />
          </button>
          <button
            onMouseDown={(e) => handleFormat(e, "justifyLeft")}
            className="p-1 hover:bg-slate-700 rounded"
          >
            <AlignLeft size={12} />
          </button>
        </div>
      )}

      <div
        ref={contentRef}
        contentEditable={!isForPrint}
        className={`rich-text-editor outline-none print:bg-transparent ${inline ? "inline-block min-w-[50px] border-b border-dashed border-slate-400 print:border-solid print:border-transparent" : "w-full h-full whitespace-pre-wrap break-words"}`}
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
// 💡 محرر الجداول المتقدم (دمج، خلفيات، تحجيم أعمدة، وتنسيق)
// ==========================================
const InteractiveTable = ({ value, onChange, isForPrint }) => {
  // الهيكل الافتراضي: يحتوي على إعدادات الجدول الكلية، وبيانات الخلايا
  const defaultState = {
    bg: "#ffffff", // لون خلفية الجدول الافتراضي (معتم)
    opacity: 1,    // شفافية الجدول
    data: [
      [{ v: "العمود 1", cs: 1, rs: 1, bg: "#f1f5f9", b: true, w: "auto" }, { v: "العمود 2", cs: 1, rs: 1, bg: "#f1f5f9", b: true, w: "auto" }, { v: "العمود 3", cs: 1, rs: 1, bg: "#f1f5f9", b: true, w: "auto" }],
      [{ v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" }, { v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" }, { v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" }]
    ]
  };

  // معالجة البيانات القديمة (إذا كانت نصوص فقط) وتحويلها للنظام الذكي
  let tableState = defaultState;
  if (value && value.data) {
    tableState = value;
  } else if (Array.isArray(value) && value.length > 0) {
    tableState = { 
      bg: "#ffffff", opacity: 1, 
      data: value.map(r => r.map(c => ({ 
        v: typeof c === 'string' ? c : c.v || "", 
        cs: c.cs || 1, rs: c.rs || 1, 
        bg: c.bg || "transparent", b: c.b || false, w: c.w || "auto" 
      }))) 
    };
  }
  const tableData = tableState.data;

  // ── تحديث نص الخلية ──
  const updateCell = (rIdx, cIdx, val) => {
    if (!onChange) return;
    const newData = [...tableData];
    newData[rIdx][cIdx] = { ...newData[rIdx][cIdx], v: val };
    onChange({ ...tableState, data: newData });
  };

  // ── أدوات الخلية (Cell Tools) ──
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

  // ── الدمج (Merge) ──
  const mergeLeft = (rIdx, cIdx) => { // يمين في الواجهة، يسار برمجياً بسبب LTR/RTL
    if (!onChange) return;
    const newData = [...tableData];
    // التأكد من وجود خلية تالية غير مدمجة مسبقاً
    if (cIdx + 1 < newData[rIdx].length && newData[rIdx][cIdx + 1].cs !== 0) {
      newData[rIdx][cIdx].cs += newData[rIdx][cIdx + 1].cs;
      newData[rIdx][cIdx + 1].cs = 0; // إخفاء الخلية المدمجة
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
    // إعادة إظهار الخلايا المجاورة (تبسيط: نعيد الخلية التي تليها مباشرة)
    if (cIdx + 1 < newData[rIdx].length) newData[rIdx][cIdx + 1].cs = 1;
    if (rIdx + 1 < newData.length) newData[rIdx + 1][cIdx].rs = 1;
    onChange({ ...tableState, data: newData });
  };

  // ── تحجيم العمود (Column Resize) ──
  const resizeColumn = (cIdx, action) => {
      if (!onChange) return;
      const newData = [...tableData];
      // نأخذ العرض الحالي من الصف الأول
      let currentWidthStr = newData[0][cIdx].w;
      let currentWidth = currentWidthStr === "auto" ? 100 : parseInt(currentWidthStr); // افتراض 100px لو كان auto
      
      let newWidth = action === "expand" ? currentWidth + 20 : Math.max(30, currentWidth - 20);
      
      // تطبيق العرض الجديد على كل خلايا العمود
      newData.forEach(row => {
          if(row[cIdx]) row[cIdx].w = `${newWidth}px`;
      });
      onChange({ ...tableState, data: newData });
  };


  // ── أدوات الجدول العامة ──
  const addRow = () => onChange && onChange({ ...tableState, data: [...tableData, Array(tableData[0].length).fill({ v: "—", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" })] });
  const removeRow = () => onChange && tableData.length > 1 && onChange({ ...tableState, data: tableData.slice(0, -1) });
  const addCol = () => onChange && onChange({ ...tableState, data: tableData.map(row => [...row, { v: "جديد", cs: 1, rs: 1, bg: "transparent", b: false, w: "auto" }]) });
  const removeCol = () => onChange && tableData[0].length > 1 && onChange({ ...tableState, data: tableData.map(row => row.slice(0, -1)) });
  const changeTableBg = (color) => onChange && onChange({ ...tableState, bg: color });
  const changeTableOpacity = (opacity) => onChange && onChange({ ...tableState, opacity: opacity });


  // تحويل اللون السداسي العشري (Hex) والشفافية (Opacity) إلى rgba
  const hexToRgba = (hex, opacity) => {
    if (!hex || hex === 'transparent') return 'transparent';
    let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const tableBgColor = hexToRgba(tableState.bg, tableState.opacity);

  return (
    <div className="w-full h-full flex flex-col relative group print:bg-transparent" style={{ backgroundColor: isForPrint ? 'transparent' : tableBgColor }}>
      
      {/* ── شريط أدوات الجدول (General Table Toolbar) ── */}
      {!isForPrint && onChange && (
        <div className="flex gap-1 mb-1 print-hidden opacity-30 hover:opacity-100 focus-within:opacity-100 transition-opacity flex-wrap items-center bg-white/80 p-1 rounded backdrop-blur-sm border border-slate-200">
          <button onClick={addRow} className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[9px] font-bold flex items-center gap-0.5"><Plus size={10} /> صف</button>
          <button onClick={removeRow} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold flex items-center gap-0.5"><Minus size={10} /> صف</button>
          <div className="w-px h-3 bg-slate-300 mx-1"></div>
          <button onClick={addCol} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[9px] font-bold flex items-center gap-0.5"><Plus size={10} /> عمود</button>
          <button onClick={removeCol} className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold flex items-center gap-0.5"><Minus size={10} /> عمود</button>
          <div className="w-px h-3 bg-slate-300 mx-1"></div>
          
          {/* التحكم بخلفية الجدول كاملة */}
          <div className="flex items-center gap-1 px-1 rounded">
            <span className="text-[8px] font-bold text-slate-500">خلفية الجدول:</span>
            <button onClick={() => changeTableBg("transparent")} className={`text-[8px] px-1 rounded ${tableState.bg === 'transparent' ? 'bg-slate-300 text-white' : 'text-slate-600 bg-slate-100'}`}>شفاف</button>
            <input type="color" value={tableState.bg !== 'transparent' ? tableState.bg : '#ffffff'} onChange={(e) => changeTableBg(e.target.value)} className="w-4 h-4 p-0 border border-slate-300 rounded-full cursor-pointer" title="لون الجدول" />
            
            {/* مؤشر شفافية الجدول */}
            <input type="range" min="0.1" max="1" step="0.1" value={tableState.opacity} onChange={(e) => changeTableOpacity(Number(e.target.value))} className="w-12 h-1 accent-blue-500" title="شفافية الجدول" disabled={tableState.bg === 'transparent'} />
          </div>
        </div>
      )}

      {/* ── هيكل الجدول ── */}
      <div className="flex-1 w-full overflow-visible" style={{ backgroundColor: tableBgColor }}>
        <table className="w-full h-full text-center border-collapse border border-slate-800 bg-transparent table-fixed">
          <tbody>
            {tableData.map((row, rIdx) => (
              <tr key={rIdx} className="border-t border-slate-800">
                {row.map((cell, cIdx) => {
                  if (cell.cs === 0 || cell.rs === 0) return null; // إخفاء الخلايا المدمجة
                  
                  return (
                    <td 
                      key={cIdx} 
                      colSpan={cell.cs} 
                      rowSpan={cell.rs} 
                      className="border border-slate-800 p-0 relative group/cell align-top" 
                      style={{ 
                        backgroundColor: cell.bg !== 'transparent' ? cell.bg : 'inherit',
                        width: cell.w,
                        minWidth: '30px' // عرض أدنى
                      }}
                    >
                      <textarea
                        value={cell.v}
                        onChange={(e) => updateCell(rIdx, cIdx, e.target.value)}
                        className={`w-full h-full min-h-[30px] p-2 bg-transparent outline-none text-center focus:bg-blue-50/30 resize-none print:bg-transparent print:border-none ${cell.b ? 'font-bold' : 'font-normal'}`}
                        readOnly={isForPrint || !onChange}
                      />
                      
                      {/* ── شريط أدوات الخلية (يظهر عند التركيز) ── */}
                      {!isForPrint && onChange && (
                        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white rounded p-1 flex gap-1 hidden group-focus-within/cell:flex z-[60] shadow-xl opacity-95 items-center w-max">
                          
                          {/* تنسيق وتلوين الخلية */}
                          <button onMouseDown={(e) => { e.preventDefault(); toggleBold(rIdx, cIdx) }} className={`p-0.5 rounded ${cell.b ? 'bg-blue-500' : 'hover:bg-slate-600'}`} title="نص عريض"><Bold size={10} /></button>
                          <input type="color" value={cell.bg !== 'transparent' ? cell.bg : '#ffffff'} onInput={(e) => changeCellBg(rIdx, cIdx, e.target.value)} className="w-3 h-3 p-0 border-0 rounded-full cursor-pointer bg-transparent" title="تلوين الخلية" />
                          <button onMouseDown={(e) => { e.preventDefault(); changeCellBg(rIdx, cIdx, 'transparent') }} className="text-[7px] bg-slate-600 px-1 rounded hover:bg-slate-500">شفاف</button>
                          
                          <div className="w-px h-3 bg-slate-600 mx-0.5"></div>
                          
                          {/* الدمج */}
                          <button onMouseDown={(e) => { e.preventDefault(); mergeRight(rIdx, cIdx) }} className="text-[8px] px-1 hover:bg-slate-600 rounded">دمج ➡️</button>
                          <button onMouseDown={(e) => { e.preventDefault(); mergeDown(rIdx, cIdx) }} className="text-[8px] px-1 hover:bg-slate-600 rounded">دمج ⬇️</button>
                          {(cell.cs > 1 || cell.rs > 1) && (
                             <button onMouseDown={(e) => { e.preventDefault(); unmerge(rIdx, cIdx) }} className="text-[8px] px-1 hover:bg-slate-600 rounded text-red-300">✖ فك</button>
                          )}

                          <div className="w-px h-3 bg-slate-600 mx-0.5"></div>
                          
                          {/* تحجيم العمود */}
                          <button onMouseDown={(e) => { e.preventDefault(); resizeColumn(cIdx, 'expand') }} className="p-0.5 hover:bg-slate-600 rounded" title="توسيع العمود">↔️</button>
                          <button onMouseDown={(e) => { e.preventDefault(); resizeColumn(cIdx, 'shrink') }} className="p-0.5 hover:bg-slate-600 rounded" title="تضييق العمود">↔️</button>
                          
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
// 💡 بلوك الصورة والتوقيع (Draggable & Signature)
// ==========================================
const DraggableImageBlock = ({
  block,
  value,
  onChange,
  isForPrint,
  isSignature = false,
}) => {
  const imgData =
    typeof value === "object" && value?.url
      ? value
      : { url: value, fit: "contain" };

  return (
    <div className="w-full h-full flex flex-col relative group print:bg-transparent">
      {/* عرض عنوان البلوك في حالة التوقيع */}
      {isSignature && (
        <div
          className="font-bold mb-1 shrink-0 print:text-black"
          style={{
            textAlign: block.style?.alignment,
            fontSize: block.style?.fontSize,
          }}
        >
          {block.label}:
        </div>
      )}

      <div
        className={`w-full flex-1 flex items-center justify-center overflow-hidden relative print:bg-transparent print:border-none ${imgData.url ? "bg-transparent" : "border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl"}`}
      >
        {imgData.url ? (
          <img
            src={imgData.url}
            alt="img"
            style={{ objectFit: imgData.fit }}
            className={`w-full h-full pointer-events-none ${isSignature ? "mix-blend-multiply" : ""}`} // إضافة دمج الحبر للتوقيع
          />
        ) : !isForPrint ? (
          <label className="cursor-pointer flex flex-col items-center text-blue-500 hover:text-blue-700 w-full h-full justify-center p-2 text-center">
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
                    onChange({ url: ev.target.result, fit: "contain" });
                  reader.readAsDataURL(e.target.files[0]);
                }
              }}
            />
          </label>
        ) : (
          // في حالة الطباعة ولم يتم رفع صورة توقيع، اظهر المربع المفرغ اليدوي
          isSignature && (
            <div className="w-full h-full border-2 border-dashed border-slate-300 print:border-solid print:border-slate-800 rounded flex flex-col items-center justify-end pb-2 print:bg-transparent">
              {block.type === "office_stamp" ? (
                <span className="text-slate-300 print:text-slate-400 mb-auto mt-2 text-xs">
                  مساحة الختم
                </span>
              ) : block.type === "fingerprint" ? (
                <span className="text-slate-300 print:text-slate-400 mb-auto mt-2 text-xs">
                  البصمة
                </span>
              ) : (
                <div className="w-3/4 border-t border-slate-800 mt-auto"></div>
              )}
            </div>
          )
        )}
      </div>

      {/* شريط أدوات الصورة */}
      {!isForPrint && imgData.url && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white rounded-lg px-2 py-1 flex gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity print-hidden">
          <button
            onClick={() => onChange({ ...imgData, fit: "contain" })}
            className={`p-1 rounded ${imgData.fit === "contain" ? "bg-blue-500" : "hover:bg-slate-700"}`}
            title="احتواء"
          >
            <Frame size={12} />
          </button>
          <button
            onClick={() => onChange({ ...imgData, fit: "cover" })}
            className={`p-1 rounded ${imgData.fit === "cover" ? "bg-blue-500" : "hover:bg-slate-700"}`}
            title="تغطية"
          >
            <Maximize size={12} />
          </button>
          <button
            onClick={() => onChange({ ...imgData, fit: "fill" })}
            className={`p-1 rounded ${imgData.fit === "fill" ? "bg-blue-500" : "hover:bg-slate-700"}`}
            title="ملء"
          >
            <Grid3x3 size={12} />
          </button>
          <div className="w-px h-3 bg-slate-600 mx-0.5 self-center"></div>
          <button
            onClick={() => onChange(null)}
            className="p-1 hover:bg-red-500 rounded text-red-300 hover:text-white"
            title="حذف الصورة"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 💡 مكون رسم البلوكات الأساسي (Canvas Block Renderer)
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
          className="w-full h-full print:bg-transparent print:border-none"
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
          className="font-bold w-full h-full flex gap-2 items-start print:bg-transparent"
        >
          <span className="whitespace-nowrap shrink-0 print:text-black">
            {block.label}:
          </span>
          <div className="flex-1 w-full">
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
      // التعبئة التلقائية للتواريخ وقت الطباعة إذا كانت فارغة
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
          className="flex items-center gap-2 print:bg-transparent print:border-none"
        >
          <span className="font-bold whitespace-nowrap shrink-0 print:text-black">
            {block.label}:
          </span>
          <div className="border border-slate-300 bg-slate-50 rounded px-3 py-1.5 text-slate-500 flex items-center gap-2 min-w-[120px] print:bg-transparent print:border-none print:text-black print:p-0">
            {displayDate}{" "}
            {!isForPrint && (
              <CalendarClock size={14} className="print-hidden" />
            )}
          </div>
        </div>
      );

    case "time":
      let displayTime = value || block.defaultValue || "__:__";
      // التعبئة التلقائية للوقت وقت الطباعة إذا كان فارغاً
      if (isForPrint && !value) {
        displayTime = formatTime12Hour(getCurrentTime24());
      } else if (value) {
        displayTime = formatTime12Hour(value);
      }
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="flex items-center gap-2 print:bg-transparent print:border-none"
        >
          <span className="font-bold whitespace-nowrap shrink-0 print:text-black">
            {block.label}:
          </span>
          <span
            className="font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded print:bg-transparent print:border-none print:text-black print:p-0"
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
          className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-3 h-full print:border-none print:bg-transparent print:p-0"
        >
          <div className="font-bold text-indigo-800 mb-2 flex items-center gap-2 print:text-black">
            <User size={16} className="print-hidden" /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-2 text-indigo-900 font-semibold text-[0.9em] print:text-black">
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
          className="flex items-center gap-3 print:bg-transparent"
        >
          <div
            onClick={() => !isForPrint && onChange(!value)}
            className={`w-4 h-4 shrink-0 border-2 rounded flex items-center justify-center cursor-pointer ${value ? "border-blue-600 bg-blue-600 print:bg-black print:border-black" : "border-slate-400 print:border-black"}`}
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
              className="font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 outline-none w-full print:hidden"
            />
          ) : (
            <span className="font-bold text-slate-700 print:text-black">
              {cLabel}
            </span>
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
    case "background_image":
    case "image_upload":
      return (
        <DraggableImageBlock
          block={block}
          value={value}
          onChange={onChange}
          isForPrint={isForPrint}
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
      return <hr className="my-2 border-t-2 border-slate-800 w-full" />;

    case "spacer":
      return <div className="w-full h-full"></div>;

    case "watermark":
      return null;

    default:
      return null;
  }
};

// ==========================================
// 💡 مكون الشاشة الرئيسية (Form Fill Modal)
// ==========================================
export default function FormFillModal({ form, onClose, onSaveUsage }) {
  const [formValues, setFormValues] = useState({});
  const [zoomLevel, setZoomLevel] = useState(100);
  const [exportType, setExportType] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);
  const [isForPrint, setIsForPrint] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState(null);

  const componentRef = useRef();

  useEffect(() => {
    if (form?.blocks) {
      const initialVals = {};
      form.blocks.forEach((b) => {
        if (b.defaultValue) {
          try {
            initialVals[b.uid] = JSON.parse(b.defaultValue);
          } catch {
            initialVals[b.uid] = b.defaultValue;
          }
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

  const handlePrintNatively = () => {
    if (!componentRef.current)
      return toast.error("لا يمكن الوصول لمحتوى الطباعة");
    setActiveBlockId(null);
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
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; background: transparent; }
          .print-hidden { display: none !important; }
        </style></head>
        <body style="font-family: ${fontFamily}; background: transparent;">${originalContent.outerHTML}</body></html>
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

  const handleExport = async () => {
    if (!componentRef.current) return;
    setActiveBlockId(null);
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
              إصدار المستند: {form?.name}
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
        {/* ── Right Panel: Form Entry ── */}
        <div className="w-[350px] bg-white border-l border-slate-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-10 shrink-0">
          <div className="p-5 border-b border-slate-100 bg-blue-50/50">
            <h3 className="font-bold text-blue-900 flex items-center gap-2">
              <Type size={18} className="text-blue-600" /> الحقول الأساسية
            </h3>
            <p className="text-[10px] text-blue-700/80 mt-1 font-semibold leading-relaxed">
              تعبئة سريعة للتواريخ والحقول القصيرة.
              <br />
              <span className="text-red-500 font-bold">
                للتنسيق الحر والصور والجداول:
              </span>{" "}
              <strong>انقر عليها داخل الورقة لتعديلها.</strong>
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
            {sortedBlocks.length === 0 ? (
              <div className="text-center text-slate-400 text-xs mt-10">
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
                    className={`flex flex-col gap-1.5 p-3 rounded-lg border-2 transition-all cursor-pointer ${isActive ? "border-blue-400 bg-blue-50/30" : "border-transparent hover:border-slate-200"}`}
                  >
                    <label className="text-[12px] font-bold text-slate-800 flex items-center gap-2">
                      {[
                        "date_gregorian",
                        "date_hijri",
                        "date_editable",
                      ].includes(block.type) && (
                        <Calendar size={14} className="text-slate-400" />
                      )}
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
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                        />
                        <button
                          onClick={() =>
                            handleValueChange(bId, getCurrentDateStr())
                          }
                          className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200"
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                          />
                          <button
                            onClick={() =>
                              handleValueChange(
                                bId,
                                formatHijriDate(new Date()),
                              )
                            }
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 whitespace-nowrap"
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
                            className="w-full px-3 py-1.5 text-xs text-slate-500 bg-slate-100 border border-slate-200 rounded-lg outline-none cursor-pointer"
                          />
                          <span className="absolute left-10 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 pointer-events-none">
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
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono font-semibold outline-none focus:bg-white focus:border-blue-500 transition-all"
                          />
                          <button
                            onClick={() =>
                              handleValueChange(bId, getCurrentTime24())
                            }
                            className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 whitespace-nowrap"
                          >
                            الآن
                          </button>
                        </div>
                      </div>
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
          className="flex-1 bg-slate-200/80 overflow-y-auto flex justify-center py-12 custom-scrollbar relative"
          onClick={() => setActiveBlockId(null)}
        >
          <div className="absolute top-4 left-6 flex items-center gap-1 bg-white shadow-sm p-1 rounded-xl z-20 border border-slate-200 print-hidden">
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
            className="print-container bg-white shadow-2xl relative flex flex-col origin-top transition-transform duration-200"
            style={{
              width: "210mm",
              height: `${dynamicHeight}px`,
              transform: `scale(${zoomLevel / 100})`,
              fontFamily: fontFamily,
              backgroundColor: isForPrint ? "transparent" : "#ffffff",
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
                  className="page-break-indicator absolute left-0 right-0 border-b-2 border-dashed border-red-300 z-0 pointer-events-none"
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
                        className={`absolute ${!isForPrint && isActive ? "ring-2 ring-blue-400 rounded" : "hover:ring-1 hover:ring-slate-300"} ${isBackgroundLayer ? "z-0" : isActive ? "z-50" : "z-10"}`}
                        style={{
                          left: `${customPos.x}px`,
                          top: `${customPos.y}px`,
                          width: `${customPos.width}px`,
                          height: `${customPos.height}px`,
                          resize:
                            !isForPrint &&
                            [
                              "image_upload",
                              "company_logo",
                              "background_image",
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
                        onMouseUp={(e) => {
                          if (
                            [
                              "image_upload",
                              "company_logo",
                              "header_image",
                              "footer_image",
                              "background_image",
                              "signature",
                              "office_signature",
                              "office_stamp",
                              "fingerprint",
                            ].includes(block.type) &&
                            isActive
                          ) {
                            handleBlockDragResize(bId, {
                              ...customPos,
                              width: e.currentTarget.offsetWidth,
                              height: e.currentTarget.offsetHeight,
                            });
                          }
                        }}
                      >
                        {!isForPrint && isActive && (
                          <div className="print-hidden absolute -top-5 right-0 bg-blue-500 text-white text-[9px] px-2 py-0.5 rounded-t-md opacity-90">
                            {block.label}
                          </div>
                        )}

                        {!isForPrint &&
                          isActive &&
                          [
                            "image_upload",
                            "company_logo",
                            "background_image",
                            "header_image",
                            "footer_image",
                            "signature",
                            "office_signature",
                            "office_stamp",
                            "fingerprint",
                          ].includes(block.type) && (
                            <div
                              className="print-hidden absolute -right-6 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded shadow cursor-move z-50"
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
                className="absolute left-[20mm] right-[20mm] flex justify-between text-[10px] text-slate-500 font-mono pointer-events-none"
                style={{ top: `${(i + 1) * A4_HEIGHT_PX - 40}px` }}
              >
                <span dir="ltr" className={isForPrint ? "text-black" : ""}>
                  {form?.code}
                </span>
                <span
                  className={`font-bold ${isForPrint ? "text-black" : "text-slate-700"}`}
                >
                  صفحة {i + 1} من {pagesCount}
                </span>
                <span className={isForPrint ? "text-black" : ""}>
                  نظام الموارد البشرية
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
