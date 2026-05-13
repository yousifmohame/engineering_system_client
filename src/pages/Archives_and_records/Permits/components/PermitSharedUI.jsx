import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  Search,
  ChevronLeft,
  Loader2,
  Plus,
  Copy,
} from "lucide-react";
import { toEnglishNumbers, copyToClipboard } from "../utils/permitHelpers"; // تأكد من مسار الاستيراد

export function AiBadge({ status }) {
  if (!status || status === "غير مطبق")
    return <span className="text-[10px] text-slate-400 font-bold">—</span>;
  const config = {
    "تم التحليل": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: <CheckCircle2 size={10} /> },
    "يحتاج مراجعة": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: <AlertTriangle size={10} /> },
    "فشل التحليل": { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: <XCircle size={10} /> },
  }[status] || { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200", icon: <Minus size={10} /> };

  return (
    <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${config.bg} ${config.text} ${config.border}`}>
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
    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${config.bg} ${config.text}`}>
      {form || "—"}
    </span>
  );
}

export const SearchableDropdown = ({ options, value, onChange, placeholder, isAdding, onQuickAdd }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.filter((opt) => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [options, searchTerm]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="flex gap-2">
        <div onClick={() => setIsOpen(!isOpen)} className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all">
          <span>{selectedOption ? selectedOption.label : placeholder}</span>
          <ChevronLeft size={14} className={`text-slate-400 transition-transform ${isOpen ? "-rotate-90" : ""}`} />
        </div>
        {onQuickAdd && (
          <button onClick={onQuickAdd} disabled={isAdding} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors" title="إضافة سريعة">
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
          <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0">
            <div className="relative">
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" className="w-full pl-3 pr-8 py-2 text-[11px] font-bold border border-slate-200 rounded-lg outline-none focus:border-blue-400" placeholder="اكتب للبحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
            </div>
          </div>
          <div className="overflow-y-auto p-1 custom-scrollbar-slim">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div key={idx} onClick={() => { onChange(opt.value); setIsOpen(false); setSearchTerm(""); }} className={`px-3 py-2 text-[11px] font-bold rounded-lg cursor-pointer transition-colors ${value === opt.value ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"}`}>
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-[11px] text-slate-400 font-bold">لا توجد نتائج مطابقة</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const SmartLinkedField = ({ label, value, onChange, options, matchFn, onQuickAdd, isAdding, placeholder, listId, linkedId, disabled = false }) => {
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
          <button onClick={() => copyToClipboard(value)} className="text-slate-400 hover:text-blue-600 transition-colors" title="نسخ المحتوى">
            <Copy size={12} />
          </button>
        </label>
        {!disabled && value && value.trim() !== "" && (
          isLinked ? (
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold shadow-sm">
              <CheckCircle2 size={10} /> مسجل
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded font-bold flex items-center gap-0.5 shadow-sm">
                <AlertTriangle size={10} /> غير مسجل
              </span>
              {onQuickAdd && (
                <button onClick={onQuickAdd} disabled={isAdding} className="text-[9px] bg-blue-600 text-white hover:bg-blue-700 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all shadow-sm disabled:opacity-50" title="إضافة سريعة للنظام">
                  {isAdding ? <Loader2 size={10} className="animate-spin" /> : <Plus size={10} />} إضافة
                </button>
              )}
            </div>
          )
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(toEnglishNumbers(e.target.value))}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg text-[11px] font-bold outline-none transition-all ${disabled ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : value && isLinked ? "border-emerald-300 focus:ring-1 focus:ring-emerald-400 bg-white text-slate-700" : "bg-slate-50 border-slate-200 focus:ring-1 focus:ring-blue-400 focus:bg-white text-slate-700"}`}
          placeholder={placeholder}
          list={listId}
        />
        {!disabled && (
          <datalist id={listId}>
            {options.map((opt, idx) => (
              <option key={idx} value={opt.name || opt.nameAr || opt.label || opt.planNumber} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
};

export const CopyableInput = ({ label, value, onChange, placeholder, type = "text", dir = "rtl", style = {}, warning = null, disabled = false }) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between mb-0.5">
      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
        {label}
        {warning && (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
            <AlertTriangle size={10} /> {warning}
          </span>
        )}
        <button onClick={() => copyToClipboard(value)} className="text-slate-400 hover:text-blue-600 transition-colors" title="نسخ المحتوى">
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
      disabled={disabled}
      className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none transition-colors ${disabled ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : warning ? "border-amber-400 bg-amber-50 focus:ring-amber-500 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
    />
  </div>
);