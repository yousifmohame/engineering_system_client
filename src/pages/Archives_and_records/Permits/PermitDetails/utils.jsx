import React, { useState, useRef, useMemo, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  Loader2,
  Plus,
  Copy,
  ChevronLeft,
  Search,
} from "lucide-react";

// ==========================================
// 💡 دوال المعالجة الذكية والمساعدة
// ==========================================

export const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

export const normalizeArabicText = (str) => {
  if (!str) return "";
  return toEnglishNumbers(str)
    .replace(/(^|\s)(حي|مخطط|رقم)(\s+|$)/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ي/g, "ى")
    .replace(/[\s\-_]/g, "")
    .toLowerCase();
};

export const normalizePlan = (str) => {
  if (!str) return "";
  let cleaned = toEnglishNumbers(str).replace(/\s+/g, "").replace(/\\/g, "/");

  if (cleaned.includes("/")) {
    cleaned = cleaned.split("/").sort().join("/");
  }
  return cleaned.toLowerCase();
};

export const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

// ==========================================
// 💡 مكونات مساعدة للواجهة
// ==========================================

export function AiBadge({ status }) {
  if (!status || status === "غير مطبق")
    return <span className="text-[10px] text-slate-400 font-bold">—</span>;
  const config = {
    "تم التحليل": {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle2 size={10} />,
    },
    "يحتاج مراجعة": {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <AlertTriangle size={10} />,
    },
    "فشل التحليل": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle size={10} />,
    },
  }[status] || {
    bg: "bg-slate-50",
    text: "text-slate-500",
    border: "border-slate-200",
    icon: <Minus size={10} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.icon} {status}
    </span>
  );
}

export function FormBadge({ form }) {
  const config = {
    يدوي: { bg: "bg-slate-100", text: "text-slate-600" },
    أصفر: { bg: "bg-yellow-50", text: "text-yellow-700" },
    أخضر: { bg: "bg-green-50", text: "text-green-700" },
  }[form] || { bg: "bg-gray-100", text: "text-gray-600" };
  return (
    <span
      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.text}`}
    >
      {form || "—"}
    </span>
  );
}

// ==========================================
// 💡 القائمة الذكية القابلة للبحث (Searchable Dropdown)
// ==========================================
export const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isAdding,
  onQuickAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex gap-2">
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex-1 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:border-blue-400 transition-colors"
        >
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronLeft
            size={14}
            className={`text-slate-400 transition-transform ${isOpen ? "-rotate-90" : ""}`}
          />
        </div>
        {onQuickAdd && (
          <button
            onClick={onQuickAdd}
            disabled={isAdding}
            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors"
            title="إضافة سريعة"
          >
            {isAdding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                className="w-full pl-3 pr-8 py-2 text-[11px] font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400"
                placeholder="اكتب للبحث..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-y-auto p-1 custom-scrollbar-slim">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  className={`px-3 py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${
                    value === opt.value
                      ? "bg-[#f4f7f8] text-[#123B5D]"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[11px] text-slate-400 font-bold">
                لا توجد نتائج مطابقة
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 💡 مكونات الإدخال والربط الذكية الأساسية
// ==========================================
export const SmartLinkedField = ({
  label,
  value,
  onChange,
  options,
  matchFn,
  onQuickAdd,
  isAdding,
  placeholder,
  listId,
  linkedId,
}) => {
  const isLinked = useMemo(() => {
    if (linkedId) return true;
    if (!value || value.trim() === "") return false;
    return options.some((opt) => matchFn(opt, value));
  }, [value, options, matchFn, linkedId]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between mb-0.5">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
          {label}
          <button
            onClick={() => copyToClipboard(value)}
            className="text-slate-400 hover:text-[#123B5D] transition-colors"
            title="نسخ المحتوى"
          >
            <Copy size={12} />
          </button>
        </label>
        {value &&
          value.trim() !== "" &&
          (isLinked ? (
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold shadow-sm">
              <CheckCircle2 size={10} /> مسجل
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shadow-sm">
                <AlertTriangle size={10} /> غير مسجل
              </span>
              {onQuickAdd && (
                <button
                  onClick={onQuickAdd}
                  disabled={isAdding}
                  className="text-[9px] bg-[#0f3d50] text-white hover:bg-[#174e65] px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all shadow-sm disabled:opacity-50"
                  title="إضافة سريعة للنظام"
                >
                  {isAdding ? (
                    <Loader2 size={10} className="animate-spin" />
                  ) : (
                    <Plus size={10} />
                  )}{" "}
                  إضافة
                </button>
              )}
            </div>
          ))}
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-[11px] font-bold text-slate-700 outline-none transition-all ${value && isLinked ? "border-emerald-300 focus:ring-1 focus:ring-emerald-400 bg-white" : "border-slate-200 focus:ring-1 focus:ring-blue-400 focus:bg-white"}`}
          placeholder={placeholder}
          list={listId}
        />
        <datalist id={listId}>
          {options.map((opt, idx) => (
            <option key={idx} value={opt.name || opt.nameAr || opt.label} />
          ))}
        </datalist>
      </div>
    </div>
  );
};

export const CopyableInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  style = {},
  warning = null,
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between mb-0.5">
      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
        {label}
        <button
          onClick={() => copyToClipboard(value)}
          className="text-slate-400 hover:text-[#123B5D] transition-colors"
          title="نسخ المحتوى"
        >
          <Copy size={12} />
        </button>
      </label>
    </div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      style={style}
      className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:bg-white transition-colors ${warning ? "border-amber-400 bg-amber-50 focus:ring-amber-500 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700 focus:ring-blue-400"}`}
    />
    {warning && (
      <div className="text-[10px] text-amber-600 font-bold flex items-start gap-1 mt-1 leading-tight">
        <AlertTriangle size={12} className="shrink-0 mt-0.5" />
        <span>{warning}</span>
      </div>
    )}
  </div>
);
