import React, { useState, useRef, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "sonner";
import {
  X,
  FileText,
  Edit3,
  Layers,
  MapPin,
  History,
  BarChart3,
  QrCode,
  Eye,
  FileDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Minus,
  Save,
  Loader2,
  Plus,
  Trash2,
  CloudUpload,
  Brain,
  Cpu,
  Copy,
  Link,
  Briefcase,
  User,
  Building,
  FileSignature,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Search,
  Paperclip,
  Clock,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ==========================================
// 💡 دوال المعالجة الذكية والمساعدة
// ==========================================

const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const normalizeArabicText = (str) => {
  if (!str) return "";
  return toEnglishNumbers(str)
    .replace(/(^|\s)(حي|مخطط|رقم)(\s+|$)/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ي/g, "ى")
    .replace(/[\s\-_]/g, "")
    .toLowerCase();
};

const normalizePlan = (str) => {
  if (!str) return "";
  let cleaned = toEnglishNumbers(str).replace(/\s+/g, "").replace(/\\/g, "/");

  if (cleaned.includes("/")) {
    cleaned = cleaned.split("/").sort().join("/");
  }
  return cleaned.toLowerCase();
};

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }
  const baseUrl = "http://95.216.73.243";
  return `${baseUrl}${fixedUrl}`;
};

// ==========================================
// 💡 مكونات مساعدة للواجهة
// ==========================================

function AiBadge({ status }) {
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

function FormBadge({ form }) {
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
const SearchableDropdown = ({
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
                      ? "bg-blue-50 text-blue-700"
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
const SmartLinkedField = ({
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
            className="text-slate-400 hover:text-blue-600 transition-colors"
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
                  className="text-[9px] bg-blue-600 text-white hover:bg-blue-700 px-2 py-0.5 rounded font-bold flex items-center gap-1 transition-all shadow-sm disabled:opacity-50"
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

const CopyableInput = ({
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
          className="text-slate-400 hover:text-blue-600 transition-colors"
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

// ==========================================
// 💡 محتوى التبويبات (Tabs)
// ==========================================

function TabDocument({ permit }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newFile, setNewFile] = useState(null);

  const fileUrl = getFullUrl(permit?.attachmentUrl);
  const isImage = fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i) != null;
  const isPdf =
    fileUrl?.toLowerCase().endsWith(".pdf") || (fileUrl && !isImage);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return await api.put(`/permits/${permit.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث مستند الرخصة بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
      setNewFile(null);
    },
    onError: () => toast.error("حدث خطأ أثناء رفع المستند"),
  });

  const handleSave = () => {
    if (!newFile) return toast.error("يرجى اختيار ملف أولاً");
    uploadMutation.mutate(newFile);
  };

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-slate-700">
          مستند الرخصة
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تحديث المرفق
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewFile(null);
              }}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={uploadMutation.isPending || !newFile}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ المستند
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-blue-300 rounded-xl bg-blue-50/50 h-64 flex flex-col items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-50 transition-colors"
        >
          <CloudUpload size={32} className="mb-2" />
          <span className="text-sm font-bold">
            {newFile ? newFile.name : "اضغط لاختيار ملف PDF أو صورة"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setNewFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl bg-slate-50 h-[400px] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full rounded-xl"
                title="Permit Document"
              />
            ) : (
              <img
                src={fileUrl}
                alt="رخصة"
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <>
              <FileText size={40} className="mb-2 opacity-50" />
              <span className="text-xs font-bold">المستند غير متوفر</span>
            </>
          )}
        </div>
      )}

      {!isEditing && fileUrl && (
        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-[11px] font-bold bg-blue-600 text-white rounded-lg py-2.5 hover:bg-blue-700 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye size={14} /> عرض المستند كامل
          </a>
          <a
            href={fileUrl}
            download
            className="flex-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg py-2.5 hover:bg-slate-200 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <FileDown size={14} /> تحميل المرفق
          </a>
        </div>
      )}
    </div>
  );
}

function TabExtractedData({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...permit });

  const updateMutation = useMutation({
    mutationFn: async (data) => await api.put(`/permits/${permit.id}`, data),
    onSuccess: () => {
      toast.success("تم تحديث البيانات بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
    onError: () => toast.error("حدث خطأ أثناء تحديث البيانات"),
  });

  const fields = [
    { key: "permitNumber", label: "رقم الرخصة" },
    { key: "year", label: "سنة الرخصة" },
    { key: "type", label: "نوع الرخصة" },
    { key: "ownerName", label: "اسم المالك" },
    { key: "idNumber", label: "رقم الهوية" },
    { key: "district", label: "الحي" },
    { key: "sector", label: "القطاع" },
    { key: "plotNumber", label: "رقم القطعة" },
    { key: "planNumber", label: "رقم المخطط" },
    { key: "mainUsage", label: "التصنيف الرئيسي (الاستخدام)" },
    { key: "subUsage", label: "التصنيف الفرعي" },
    { key: "landArea", label: "مساحة الأرض", type: "number" },
    { key: "engineeringOffice", label: "المكتب الهندسي" },
  ];

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          البيانات الأساسية المستخرجة
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل البيانات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...permit });
              }}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ التعديلات
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
              {f.label}
              {!isEditing && (
                <button
                  onClick={() => copyToClipboard(formData[f.key])}
                  className="text-slate-400 hover:text-blue-600"
                  title="نسخ"
                >
                  <Copy size={10} />
                </button>
              )}
            </span>
            {isEditing ? (
              <input
                type={f.type || "text"}
                value={formData[f.key] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [f.key]: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 min-h-[28px] flex items-center">
                {formData[f.key] || "—"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabComponents({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [components, setComponents] = useState(() => {
    try {
      return permit.componentsData ? JSON.parse(permit.componentsData) : [];
    } catch {
      return [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await api.put(`/permits/${permit.id}`, {
        componentsData: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("تم تحديث جدول المكونات");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
  });

  const addRow = () =>
    setComponents([
      ...components,
      { name: "", usage: "", area: "", units: "" },
    ]);
  const removeRow = (idx) =>
    setComponents(components.filter((_, i) => i !== idx));
  const updateRow = (idx, field, val) => {
    const newComp = [...components];
    newComp[idx][field] = val;
    setComponents(newComp);
  };

  return (
    <div className="p-4 animate-in fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          مكونات المبنى
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل المكونات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(components)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ المكونات
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-1/3">المكون</th>
              <th className="px-3 py-2 w-1/4">الاستخدام</th>
              <th className="px-3 py-2 w-1/4">المساحة م²</th>
              <th className="px-3 py-2 w-1/6">عدد الوحدات</th>
              {isEditing && <th className="px-3 py-2 w-10 text-center">حذف</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {components.length === 0 && !isEditing && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-400">
                  لا توجد مكونات مضافة
                </td>
              </tr>
            )}
            {components.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-700">{c.name}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={c.usage}
                      onChange={(e) => updateRow(i, "usage", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.usage}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.area}
                      onChange={(e) => updateRow(i, "area", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.area}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.units}
                      onChange={(e) => updateRow(i, "units", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.units}</span>
                  )}
                </td>
                {isEditing && (
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeRow(i)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditing && (
        <button
          onClick={addRow}
          className="w-full mt-3 py-2 bg-slate-50 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center gap-1 text-[11px] font-bold transition-colors"
        >
          <Plus size={14} /> إضافة مكون جديد
        </button>
      )}
    </div>
  );
}

function TabBoundaries({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [boundaries, setBoundaries] = useState(() => {
    try {
      return permit.boundariesData
        ? JSON.parse(permit.boundariesData)
        : [
            { direction: "شمال", length: "", neighbor: "" },
            { direction: "جنوب", length: "", neighbor: "" },
            { direction: "شرق", length: "", neighbor: "" },
            { direction: "غرب", length: "", neighbor: "" },
          ];
    } catch {
      return [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await api.put(`/permits/${permit.id}`, {
        boundariesData: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("تم تحديث حدود الأرض");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
  });

  const updateRow = (idx, field, val) => {
    const newB = [...boundaries];
    newB[idx][field] = val;
    setBoundaries(newB);
  };

  return (
    <div className="p-4 animate-in fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          حدود وأبعاد الأرض
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل الحدود
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(boundaries)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 flex items-center gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-20">الاتجاه</th>
              <th className="px-3 py-2 w-24">الطول (م)</th>
              <th className="px-3 py-2">يحدها</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {boundaries.map((b, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50 transition-colors font-bold"
              >
                <td className="px-3 py-2 text-slate-700">{b.direction}</td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={b.length}
                      onChange={(e) => updateRow(i, "length", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-slate-600">{b.length || "—"}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={b.neighbor}
                      onChange={(e) => updateRow(i, "neighbor", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-slate-600">{b.neighbor || "—"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TabAiReport({ permit }) {
  if (permit?.source !== "رفع يدوي (AI)") {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
        <AlertTriangle size={40} className="mb-3 opacity-30" />
        <span className="text-sm font-bold text-slate-500">
          لا يوجد تقرير ذكاء اصطناعي
        </span>
        <span className="text-[10px] mt-1">
          هذه الرخصة لم يتم إدخالها أو معالجتها عبر الأرشفة الذكية.
        </span>
      </div>
    );
  }

  const detailedReport =
    permit?.detailedReport ||
    "تم استخراج البيانات الأساسية بنجاح ولكن لم يتم توليد تقرير مفصل لهذه الرخصة.";

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Brain size={16} className="text-purple-600" />
        <span className="text-[12px] font-black text-slate-700">
          تقرير التحليل الشامل بالذكاء الاصطناعي
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-purple-100 rounded-xl p-4 bg-purple-50/50 space-y-3 text-[11px] font-bold shadow-sm h-fit">
          <div className="flex justify-between items-center">
            <span className="text-purple-600">حالة التحليل</span>
            <AiBadge status={permit?.aiStatus} />
          </div>
          <div className="w-full bg-purple-100 rounded-full h-2 mt-2">
            <div
              className="bg-purple-500 h-2 rounded-full transition-all"
              style={{
                width: permit?.aiStatus === "تم التحليل" ? "95%" : "60%",
              }}
            />
          </div>
          <div className="flex justify-between pt-2 border-t border-purple-100">
            <span className="text-slate-500">المودل المستخدم</span>
            <span className="text-slate-700">GPT-4o Vision</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">الدقة المتوقعة</span>
            <span className="text-emerald-600">98%</span>
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
          <h4 className="text-[12px] font-black text-slate-800 mb-3 flex items-center gap-2">
            <FileText size={14} className="text-blue-500" /> الملخص الهندسي
            للرخصة
            <button
              onClick={() => copyToClipboard(detailedReport)}
              className="text-slate-400 hover:text-blue-600 mr-auto"
            >
              <Copy size={12} />
            </button>
          </h4>
          <p className="text-[12px] leading-loose text-slate-600 font-semibold text-justify whitespace-pre-wrap">
            {detailedReport}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 6. التاب الجديد: المعاملات والارتباطات ───
// ─── 6. التاب الجديد: المعاملات والارتباطات ───
function TabLinkedRecords({
  permit,
  localLinks,
  setLocalLinks,
  linkingMode,
  setLinkingMode,
  selectedValue,
  setSelectedValue,
  handleSaveLink,
  handleUnlink,
  getOptions,
  linkMutation,
  autoLinkedTransactions,
  loadingAuto,
  clients,
  offices,
  ownerships,
  privateTransactions,
}) {
  return (
    <div className="p-5 animate-in fade-in space-y-6">
      {/* القسم الأول: الربط التلقائي */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
          <FileSignature size={16} className="text-blue-500" /> المعاملات
          المرتبطة تلقائياً (تطابق رقم الرخصة)
        </h4>

        {loadingAuto ? (
          <div className="flex justify-center p-6 text-blue-500">
            <Loader2 className="animate-spin w-6 h-6" />
          </div>
        ) : autoLinkedTransactions.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {autoLinkedTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white shadow-sm hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600">
                    <FileSignature size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-800">
                      معاملة رقم: {tx.ref || tx.id}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 mt-0.5">
                      {tx.status || "نشطة"} • {tx.clientName || tx.client}
                    </div>
                  </div>
                </div>
                <button className="text-[10px] font-bold text-blue-600 hover:text-white hover:bg-blue-600 bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                  عرض المعاملة
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
            <span className="text-[11px] font-bold">
              لم يتم العثور على أي معاملات متطابقة تلقائياً.
            </span>
          </div>
        )}
      </div>

      {/* القسم الثاني: السجلات المرتبطة يدوياً */}
      <div className="space-y-4">
        <h4 className="text-[12px] font-black text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2 mt-6">
          <Link size={16} className="text-emerald-500" /> السجلات المرتبطة
          يدوياً
        </h4>

        {/* 💡 أزرار إضافة ارتباط جديد (نفس تصميم الهيدر) */}
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm mb-4">
          <div className="flex flex-wrap gap-2">
            {!localLinks.linkedClientId && (
              <button
                onClick={() => {
                  setLinkingMode("client");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "client" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
              >
                <User size={20} />{" "}
                <span className="text-[10px] font-black">ربط بعميل</span>
              </button>
            )}
            {!localLinks.linkedOfficeId && (
              <button
                onClick={() => {
                  setLinkingMode("office");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "office" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
              >
                <Briefcase size={20} />{" "}
                <span className="text-[10px] font-black">ربط بمكتب</span>
              </button>
            )}
            {!localLinks.linkedOwnershipId && (
              <button
                onClick={() => {
                  setLinkingMode("ownership");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "ownership" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
              >
                <Building size={20} />{" "}
                <span className="text-[10px] font-black">ربط بملكية</span>
              </button>
            )}
            {!localLinks.linkedTransactionId && (
              <button
                onClick={() => {
                  setLinkingMode("privateTransaction");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[120px] p-3 border rounded-xl flex flex-col items-center gap-2 transition-all ${linkingMode === "privateTransaction" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md scale-105" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
              >
                <FileSignature size={20} />{" "}
                <span className="text-[10px] font-black">
                  ربط بمعاملة (ن. فرعي)
                </span>
              </button>
            )}
            <button className="flex-1 min-w-[120px] p-3 border border-slate-200 bg-slate-50 text-slate-400 rounded-xl flex flex-col items-center gap-2 opacity-50 cursor-not-allowed">
              <FileSignature size={20} />{" "}
              <span className="text-[10px] font-black">
                معاملة (رئيسي) - قريباً
              </span>
            </button>
          </div>

          {/* 💡 منطقة البحث العائمة (تظهر عند تحديد نوع الربط) */}
          {linkingMode && (
            <div className="mt-4 p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex flex-col md:flex-row items-center gap-3 animate-in slide-in-from-top-2">
              <div className="flex-1 w-full">
                <SearchableDropdown
                  options={getOptions(linkingMode)}
                  value={selectedValue}
                  onChange={(val) => setSelectedValue(val)}
                  placeholder={`ابحث واختر ${linkingMode === "client" ? "العميل" : linkingMode === "office" ? "المكتب" : linkingMode === "ownership" ? "الملكية" : "المعاملة"}...`}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button
                  onClick={handleSaveLink}
                  disabled={linkMutation.isPending}
                  className="flex-1 md:flex-none px-6 py-2.5 bg-blue-600 text-white text-[11px] font-black rounded-xl hover:bg-blue-700 shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  {linkMutation.isPending ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}{" "}
                  تأكيد الربط
                </button>
                <button
                  onClick={() => setLinkingMode(null)}
                  className="px-4 py-2.5 bg-white text-slate-500 border border-slate-200 text-[11px] font-black rounded-xl hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 💡 السجلات المرتبطة بالفعل */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          {localLinks.linkedClientId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <User size={14} /> عميل:{" "}
                {clients.find((c) => c.id === localLinks.linkedClientId)
                  ?.name || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedClientId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}
          {localLinks.linkedOfficeId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <Briefcase size={14} /> مكتب:{" "}
                {offices.find((o) => o.id === localLinks.linkedOfficeId)
                  ?.nameAr || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedOfficeId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}
          {localLinks.linkedOwnershipId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <Building size={14} /> صك:{" "}
                {ownerships.find((o) => o.id === localLinks.linkedOwnershipId)
                  ?.deedNumber || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedOwnershipId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}
          {localLinks.linkedTransactionId && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-xl shadow-sm">
              <span className="text-[11px] font-bold text-emerald-800 flex items-center gap-2">
                <FileSignature size={14} /> معاملة:{" "}
                {privateTransactions.find(
                  (t) => t.id === localLinks.linkedTransactionId,
                )?.ref || "مسجل"}
              </span>
              <button
                onClick={() => handleUnlink("linkedTransactionId")}
                className="text-[10px] font-black text-red-500 hover:underline"
              >
                إلغاء الربط
              </button>
            </div>
          )}

          {!localLinks.linkedClientId &&
            !localLinks.linkedOfficeId &&
            !localLinks.linkedOwnershipId &&
            !localLinks.linkedTransactionId && (
              <div className="col-span-1 md:col-span-2 text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400">
                <span className="text-[11px] font-bold">
                  لا توجد سجلات مرتبطة يدوياً. استخدم الأزرار أعلاه لربط سجل
                  جديد.
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ─── 7. تاب المرفقات الأخرى ───
// ==========================================
function TabExtraAttachments({ permit }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // 💡 جلب بيانات المستخدم الحالي من الـ Auth Context
  const { user } = useAuth();

  const [attachments, setAttachments] = useState(() => {
    try {
      return permit.extraAttachments ? JSON.parse(permit.extraAttachments) : [];
    } catch {
      return [];
    }
  });

  const [newFile, setNewFile] = useState(null);
  const [fileNote, setFileNote] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload) => {
      const fd = new FormData();
      fd.append("file", fileToUpload);
      const res = await api.post(`/attachments/upload-general`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      const newAttachment = {
        id: Date.now().toString(),
        name: newFile.name,
        url: data.url || `/uploads/general/${newFile.name}`,
        size: newFile.size,
        note: fileNote,
        uploadDate: new Date().toISOString(),
        // 💡 استخدام اسم الموظف الفعلي أو الافتراضي في حال عدم توفره
        uploader: user?.name || user?.fullName || "موظف النظام",
      };

      const updatedAttachments = [...attachments, newAttachment];
      saveAttachmentsToPermit.mutate(updatedAttachments);
    },
    onError: () =>
      toast.error("حدث خطأ أثناء رفع الملف. تأكد من وجود مسار الرفع العام."),
  });

  const saveAttachmentsToPermit = useMutation({
    mutationFn: async (updatedArray) => {
      return await api.put(`/permits/${permit.id}`, {
        extraAttachments: JSON.stringify(updatedArray),
      });
    },
    onSuccess: (_, variables) => {
      setAttachments(variables);
      setNewFile(null);
      setFileNote("");
      toast.success("تم تحديث المرفقات الإضافية بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
    },
  });

  const handleDelete = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المرفق؟")) return;
    const updated = attachments.filter((a) => a.id !== id);
    saveAttachmentsToPermit.mutate(updated);
  };

  const handleUpload = () => {
    if (!newFile) return toast.error("يرجى اختيار ملف");
    uploadMutation.mutate(newFile);
  };

  return (
    <div className="p-5 animate-in fade-in space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
        <h4 className="text-[12px] font-black text-slate-800 flex items-center gap-2">
          <CloudUpload size={16} className="text-blue-500" /> رفع مرفق إضافي
        </h4>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-between p-3 border border-dashed rounded-xl cursor-pointer transition-colors ${newFile ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip
                  size={16}
                  className={newFile ? "text-emerald-500" : "text-slate-400"}
                />
                <span
                  className={`text-[11px] font-bold truncate ${newFile ? "text-emerald-700" : "text-slate-500"}`}
                >
                  {newFile
                    ? newFile.name
                    : "اضغط لاختيار ملف (PDF, صور, مخططات)..."}
                </span>
              </div>
              {newFile && (
                <span className="text-[9px] font-bold text-emerald-600 bg-white px-2 py-1 rounded-md">
                  {formatBytes(newFile.size)}
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setNewFile(e.target.files[0])}
              />
            </div>

            <input
              type="text"
              value={fileNote}
              onChange={(e) => setFileNote(e.target.value)}
              placeholder="اسم داخلي للمستند أو ملاحظة (اختياري)..."
              className="w-full p-3 text-[11px] font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={
              !newFile ||
              uploadMutation.isPending ||
              saveAttachmentsToPermit.isPending
            }
            className="md:w-32 h-auto py-3 md:py-0 bg-blue-600 text-white font-black text-[11px] rounded-xl hover:bg-blue-700 shadow-md flex flex-col items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {uploadMutation.isPending || saveAttachmentsToPermit.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CloudUpload size={20} />
            )}
            <span>رفع وحفظ</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-3 w-1/3">اسم المستند وملاحظاته</th>
              <th className="p-3">تاريخ الرفع</th>
              <th className="p-3">بواسطة</th>
              <th className="p-3">الحجم</th>
              <th className="p-3 text-center w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
            {attachments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  لا توجد مرفقات إضافية مسجلة لهذه الرخصة.
                </td>
              </tr>
            ) : (
              attachments.map((att) => (
                <tr
                  key={att.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-start gap-2">
                      <FileText
                        size={16}
                        className="text-blue-500 mt-0.5 shrink-0"
                      />
                      <div>
                        <a
                          href={getFullUrl(att.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {att.name}
                        </a>
                        {att.note && (
                          <div className="text-[10px] text-slate-500 mt-1 leading-relaxed bg-slate-100 p-1.5 rounded-md inline-block">
                            {att.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />{" "}
                      {new Date(att.uploadDate).toLocaleDateString("ar-EG")}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />{" "}
                      {att.uploader}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-500">
                    {formatBytes(att.size)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(att.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف المرفق"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 💡 المودل الرئيسي لرفع الذكاء الاصطناعي
// ==========================================
export function ModalUploadAi({ onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [permits, setPermits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => (await api.get("/clients/simple")).data || [],
  });
  const { data: offices = [] } = useQuery({
    queryKey: ["offices-list"],
    queryFn: async () =>
      (await api.get("/intermediary-offices")).data?.data || [],
  });
  const { data: districtsTree = [], isLoading: loadingDistricts } = useQuery({
    queryKey: ["districts-tree-list"],
    queryFn: async () => (await api.get("/riyadh-streets/tree")).data || [],
  });
  const { data: sectors = [] } = useQuery({
    queryKey: ["sectors-list"],
    queryFn: async () => (await api.get("/riyadh-streets/sectors")).data || [],
  });
  const { data: plans = [] } = useQuery({
    queryKey: ["plans-list"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data || [],
  });
  const { data: existingPermits = [] } = useQuery({
    queryKey: ["building-permits"],
    queryFn: async () => (await api.get("/permits")).data?.data || [],
  });

  const flatDistricts = useMemo(() => {
    let all = [];
    districtsTree.forEach((s) => {
      if (s.neighborhoods) {
        all = [
          ...all,
          ...s.neighborhoods.map((n) => ({ ...n, sectorName: s.name })),
        ];
      }
    });
    return all;
  }, [districtsTree]);

  const quickAddClient = useMutation({
    mutationFn: async (data) => await api.post("/clients", data),
    onSuccess: () => {
      toast.success("تمت إضافة العميل بنجاح!");
      queryClient.invalidateQueries(["clients-simple"]);
    },
  });
  const quickAddDistrict = useMutation({
    mutationFn: async (data) =>
      await api.post("/riyadh-streets/districts", data),
    onSuccess: () => {
      toast.success("تمت إضافة الحي بنجاح!");
      queryClient.invalidateQueries(["districts-tree-list"]);
    },
  });
  const quickAddOffice = useMutation({
    mutationFn: async (data) => await api.post("/intermediary-offices", data),
    onSuccess: () => {
      toast.success("تمت إضافة المكتب بنجاح!");
      queryClient.invalidateQueries(["offices-list"]);
    },
  });
  const quickAddPlan = useMutation({
    mutationFn: async (data) => await api.post("/riyadh-streets/plans", data),
    onSuccess: () => {
      toast.success("تمت إضافة المخطط بنجاح!");
      queryClient.invalidateQueries(["plans-list"]);
    },
  });

  const analyzeMutation = useMutation({
    mutationFn: async (selectedFile) => {
      const fd = new FormData();
      fd.append("file", selectedFile);
      return await api.post("/permits/analyze", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: (res) => {
      const aiPermits = res.data.data || [];
      if (aiPermits.length === 0)
        return toast.error("لم يتم العثور على أي رخص صالحة في الملف.");

      toast.success(
        `تم استخراج ومطابقة بيانات ${aiPermits.length} رخصة بنجاح!`,
      );

      const mappedPermits = aiPermits.map((p) => ({
        ...p,
        permitNumber: toEnglishNumbers(p.permitNumber || ""),
        issueDate: toEnglishNumbers(p.issueDate || ""),
        expiryDate: toEnglishNumbers(p.expiryDate || ""),
        year: toEnglishNumbers(p.year || new Date().getFullYear()),
        type: p.type || "غير محدد",
        form: p.form || "أخضر",
        ownerName: p.ownerName || "",
        idNumber: toEnglishNumbers(p.idNumber || ""),
        district: p.district || "",
        sector: p.sector || "",
        plotNumber: toEnglishNumbers(p.plotNumber || ""),
        planNumber: toEnglishNumbers(p.planNumber || ""),
        landArea: toEnglishNumbers(p.landArea || ""),
        mainUsage: p.mainUsage || p.usage || "سكني",
        subUsage: p.subUsage || "",
        engineeringOffice: p.engineeringOffice || "",
        notes: p.notes || "",
        detailedReport: p.detailedReport || "",
        componentsData: p.componentsData || [],
        boundariesData: p.boundariesData || [],
        source: "رفع يدوي (AI)",
        linkedClientId: p.linkedClientId || null,
        linkedOfficeId: p.linkedOfficeId || null,
        linkedDistrictId: p.linkedDistrictId || null,
        linkedPlanId: p.linkedPlanId || null,
      }));

      setPermits(mappedPermits);
      setStep(2);
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "فشل التحليل، تأكد من وضوح الملف.",
      );
      setFile(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const promises = permits.map((permit) => {
        const fd = new FormData();
        Object.keys(permit).forEach((key) => {
          if (key === "componentsData" || key === "boundariesData") {
            fd.append(key, JSON.stringify(permit[key]));
          } else if (permit[key] !== null && permit[key] !== undefined) {
            fd.append(key, permit[key]);
          }
        });
        if (file) fd.append("file", file);
        return api.post("/permits", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      });

      return await Promise.allSettled(promises);
    },
    onSuccess: (results) => {
      const succeeded = results.filter((r) => r.status === "fulfilled");
      const failed = results.filter((r) => r.status === "rejected");

      if (succeeded.length > 0) {
        toast.success(`تم حفظ واعتماد ${succeeded.length} رخصة بنجاح!`);
        queryClient.invalidateQueries(["building-permits"]);
      }
      if (failed.length > 0) {
        failed.forEach((f) =>
          toast.error(
            f.reason?.response?.data?.message || "فشل الحفظ لبعض السجلات",
          ),
        );
      }
      if (failed.length === 0) onClose();
    },
  });

  const handleFinalSave = () => {
    if (permits.some((p) => !p.permitNumber || !p.ownerName))
      return toast.error(
        "يرجى التأكد من إدخال رقم الرخصة واسم المالك كحد أدنى.",
      );
    saveMutation.mutate();
  };

  const updateCurrentPermit = (field, value, linkedFieldToClear = null) => {
    const updated = [...permits];
    updated[currentIndex][field] = toEnglishNumbers(value);
    if (linkedFieldToClear) {
      updated[currentIndex][linkedFieldToClear] = null;
    }
    setPermits(updated);
  };

  const updateTableData = (table, index, field, value) => {
    const updated = [...permits];
    updated[currentIndex][table][index][field] = toEnglishNumbers(value);
    setPermits(updated);
  };

  if (step === 1) {
    return (
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center flex flex-col items-center border border-purple-100 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-5">
            <Brain className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">
            استخراج البيانات بذكاء
          </h3>
          <p className="text-sm text-slate-500 font-semibold mb-6 px-4">
            ارفع ملف الرخصة وسنقوم بتفريغ كل الحقول والجداول بدقة متناهية
            ومطابقتها مع النظام.
          </p>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`w-full border-2 border-dashed rounded-xl p-8 mb-6 cursor-pointer transition-colors ${file ? "border-emerald-300 bg-emerald-50" : "border-purple-200 bg-slate-50 hover:bg-purple-50"}`}
          >
            {file ? (
              <>
                <FileText className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <div className="text-sm font-bold text-emerald-700 truncate px-2">
                  {file.name}
                </div>
              </>
            ) : (
              <>
                <CloudUpload className="w-10 h-10 text-purple-400 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-700">
                  اختر ملف الرخصة
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-[0.4] py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 text-sm"
            >
              إلغاء
            </button>
            <button
              onClick={() => analyzeMutation.mutate(file)}
              disabled={!file || analyzeMutation.isPending}
              className="flex-1 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2"
            >
              {analyzeMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}{" "}
              بدء التحليل والمطابقة
            </button>
          </div>
        </div>
      </div>
    );
  }

  const current = permits[currentIndex];
  const isDuplicatePermit = existingPermits.some(
    (p) =>
      String(p.permitNumber) === String(current.permitNumber) &&
      String(p.year) === String(current.year),
  );

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col border border-purple-200 max-h-[95vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-100 bg-purple-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-black text-purple-900 text-base">
                المراجعة والربط الذكي
              </h3>
              <p className="text-[11px] text-purple-600 font-bold mt-0.5">
                اللون الأخضر يعني أن الذكاء الاصطناعي وجد تطابقاً في قاعدة
                البيانات!
              </p>
            </div>
          </div>

          {permits.length > 1 && (
            <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-purple-200 shadow-sm">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-xs font-bold text-purple-800">
                رخصة {currentIndex + 1} من {permits.length}
              </span>
              <button
                disabled={currentIndex === permits.length - 1}
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-lg text-purple-400 hover:text-purple-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#fafbfc] custom-scrollbar-slim space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Edit3 className="w-4 h-4 text-blue-500" /> المعلومات الأساسية
              للرخصة
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-5">
              <div className="lg:col-span-2">
                <SmartLinkedField
                  label="اسم المالك (العميل) *"
                  value={current.ownerName}
                  linkedId={current.linkedClientId}
                  onChange={(val) =>
                    updateCurrentPermit("ownerName", val, "linkedClientId")
                  }
                  options={clients}
                  listId="aiClientsList"
                  placeholder="ابحث أو اكتب اسم العميل..."
                  matchFn={(opt, val) =>
                    normalizeArabicText(opt.fullNameRaw) ===
                      normalizeArabicText(val) ||
                    opt.idNumber === current.idNumber
                  }
                  isAdding={quickAddClient.isPending}
                  onQuickAdd={() =>
                    quickAddClient.mutate({
                      name: JSON.stringify({ ar: current.ownerName }),
                      officialNameAr: current.ownerName,
                      idNumber: current.idNumber || `TMP-${Date.now()}`,
                      type: "individual",
                      mobile: `0500${Math.floor(100000 + Math.random() * 900000)}`,
                    })
                  }
                />
              </div>

              <CopyableInput
                label="رقم الهوية"
                value={current.idNumber}
                onChange={(val) => updateCurrentPermit("idNumber", val)}
                placeholder="10 أرقام"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
              <CopyableInput
                label="رقم الرخصة *"
                value={current.permitNumber}
                onChange={(val) => updateCurrentPermit("permitNumber", val)}
                placeholder="مثال: 1445/1234"
                warning={
                  isDuplicatePermit
                    ? "تنبيه: هذا الرقم مسجل مسبقاً بنفس السنة في النظام."
                    : null
                }
              />
              <CopyableInput
                label="تاريخ الإصدار"
                value={current.issueDate}
                onChange={(val) => updateCurrentPermit("issueDate", val)}
              />
              <CopyableInput
                label="تاريخ الانتهاء"
                value={current.expiryDate}
                onChange={(val) => updateCurrentPermit("expiryDate", val)}
              />
              <CopyableInput
                label="سنة الرخصة (للفلترة)"
                value={current.year}
                onChange={(val) => updateCurrentPermit("year", val)}
              />

              <div>
                <SmartLinkedField
                  label="الحي"
                  value={current.district}
                  linkedId={current.linkedDistrictId}
                  onChange={(val) =>
                    updateCurrentPermit("district", val, "linkedDistrictId")
                  }
                  options={flatDistricts}
                  listId="aiDistrictsList"
                  placeholder={
                    loadingDistricts ? "جاري التحميل..." : "ابحث أو اكتب..."
                  }
                  matchFn={(opt, val) =>
                    normalizeArabicText(opt.name).includes(
                      normalizeArabicText(val),
                    ) ||
                    normalizeArabicText(val).includes(
                      normalizeArabicText(opt.name),
                    )
                  }
                  isAdding={quickAddDistrict.isPending}
                  onQuickAdd={() =>
                    quickAddDistrict.mutate({
                      name: current.district,
                      sectorId: sectors[0]?.id,
                    })
                  }
                />
              </div>

              <div>
                <SmartLinkedField
                  label="رقم المخطط"
                  value={current.planNumber}
                  linkedId={current.linkedPlanId}
                  onChange={(val) =>
                    updateCurrentPermit("planNumber", val, "linkedPlanId")
                  }
                  options={plans}
                  listId="aiPlansList"
                  placeholder="ابحث أو اكتب رقم المخطط..."
                  matchFn={(opt, val) =>
                    normalizePlan(opt.name) === normalizePlan(val) ||
                    normalizePlan(opt.planNumber) === normalizePlan(val)
                  }
                  isAdding={quickAddPlan.isPending}
                  onQuickAdd={() =>
                    quickAddPlan.mutate({
                      name: current.planNumber,
                      planNumber: current.planNumber,
                    })
                  }
                />
              </div>

              <CopyableInput
                label="القطاع / البلدية"
                value={current.sector}
                onChange={(val) => updateCurrentPermit("sector", val)}
              />
              <CopyableInput
                label="رقم القطعة"
                value={current.plotNumber}
                onChange={(val) => updateCurrentPermit("plotNumber", val)}
              />
              <CopyableInput
                label="مساحة الأرض (م²)"
                type="text"
                value={current.landArea}
                onChange={(val) => updateCurrentPermit("landArea", val)}
              />
              <CopyableInput
                label="التصنيف الرئيسي"
                value={current.mainUsage}
                onChange={(val) => updateCurrentPermit("mainUsage", val)}
                placeholder="مثال: سكني"
              />
              <CopyableInput
                label="التصنيف الفرعي"
                value={current.subUsage}
                onChange={(val) => updateCurrentPermit("subUsage", val)}
                placeholder="مثال: فيلا"
              />
              <CopyableInput
                label="نوع الطلب"
                value={current.type}
                onChange={(val) => updateCurrentPermit("type", val)}
              />
              <CopyableInput
                label="شكل الرخصة (تلقائي)"
                value={current.form}
                onChange={() => {}}
                style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
              />

              <div className="md:col-span-2">
                <SmartLinkedField
                  label="المكتب الهندسي"
                  value={current.engineeringOffice}
                  linkedId={current.linkedOfficeId}
                  onChange={(val) =>
                    updateCurrentPermit(
                      "engineeringOffice",
                      val,
                      "linkedOfficeId",
                    )
                  }
                  options={offices}
                  listId="aiOfficesList"
                  placeholder="ابحث أو اكتب المكتب..."
                  matchFn={(opt, val) =>
                    normalizeArabicText(opt.nameAr).includes(
                      normalizeArabicText(val),
                    ) ||
                    normalizeArabicText(opt.nameEn).includes(
                      normalizeArabicText(val),
                    )
                  }
                  isAdding={quickAddOffice.isPending}
                  onQuickAdd={() =>
                    quickAddOffice.mutate({
                      nameAr: current.engineeringOffice,
                      nameEn: current.engineeringOffice,
                      phone: "0500000000",
                      commercialRegister: "0000000000",
                      city: "الرياض",
                      status: "نشط",
                    })
                  }
                />
              </div>

              <div className="md:col-span-4">
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                    ملاحظات / اشتراطات{" "}
                    <button
                      onClick={() => copyToClipboard(current.notes)}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      <Copy size={12} />
                    </button>
                  </label>
                </div>
                <textarea
                  rows={2}
                  value={current.notes}
                  onChange={(e) => updateCurrentPermit("notes", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] font-bold outline-none focus:ring-1 focus:ring-purple-400 leading-relaxed"
                ></textarea>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" /> تفاصيل المكونات
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-right">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2 border-b border-slate-200 w-1/3">
                        المكون
                      </th>
                      <th className="p-2 border-b border-slate-200 w-1/4">
                        الاستخدام
                      </th>
                      <th className="p-2 border-b border-slate-200 w-1/4">
                        المساحة
                      </th>
                      <th className="p-2 border-b border-slate-200 w-1/6">
                        الوحدات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {current.componentsData.map((comp, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-1">
                          <input
                            value={comp.name || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "name",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={comp.usage || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "usage",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={comp.area || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "area",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent text-center font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={comp.units || comp.rooms || ""}
                            onChange={(e) =>
                              updateTableData(
                                "componentsData",
                                i,
                                "units",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent text-center font-mono"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" /> الحدود والأبعاد
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-[11px] text-right">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-2 border-b border-slate-200 w-24">
                        الاتجاه
                      </th>
                      <th className="p-2 border-b border-slate-200 w-20">
                        الطول (م)
                      </th>
                      <th className="p-2 border-b border-slate-200">
                        يحدها / الشارع
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {current.boundariesData.map((bound, i) => (
                      <tr
                        key={i}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-1">
                          <input
                            value={bound.direction || ""}
                            onChange={(e) =>
                              updateTableData(
                                "boundariesData",
                                i,
                                "direction",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={bound.length || ""}
                            onChange={(e) =>
                              updateTableData(
                                "boundariesData",
                                i,
                                "length",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent text-center font-mono"
                          />
                        </td>
                        <td className="p-1">
                          <input
                            value={bound.neighbor || ""}
                            onChange={(e) =>
                              updateTableData(
                                "boundariesData",
                                i,
                                "neighbor",
                                e.target.value,
                              )
                            }
                            className="w-full p-1.5 border border-transparent hover:border-slate-200 focus:border-purple-400 rounded outline-none font-bold text-slate-700 bg-transparent"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-200 rounded-b-2xl flex items-center justify-between shrink-0">
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            رخصة {currentIndex + 1} من {permits.length} جاهزة للاعتماد
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 text-xs shadow-sm transition-colors"
            >
              إلغاء وإعادة الرفع
            </button>
            <button
              onClick={handleFinalSave}
              disabled={saveMutation.isPending}
              className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 text-sm transition-all disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              اعتماد وحفظ السجلات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 💡 المكون الرئيسي للنافذة (Modal) المجمع
// ==========================================
export function ModalPermitDetails({ permit, onClose }) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState(0);

  // 💡 التعديل الأهم: رفعنا حالة الربط هنا لتكون متاحة للهيدر والتاب معاً
  const [linkingMode, setLinkingMode] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const [localLinks, setLocalLinks] = useState({
    linkedClientId: permit.linkedClientId || null,
    linkedOfficeId: permit.linkedOfficeId || null,
    linkedOwnershipId: permit.linkedOwnershipId || null,
    linkedTransactionId: permit.linkedTransactionId || null,
  });

  const { data: autoLinkedTransactions = [], isLoading: loadingAuto } =
    useQuery({
      queryKey: ["linked-transactions", permit.permitNumber, permit.year],
      queryFn: async () => {
        const res = await api.get(
          `/private-transactions?permitNumber=${permit.permitNumber}&year=${permit.year}`,
        );
        return res.data?.data || [];
      },
      enabled: !!permit.permitNumber && !!permit.year,
    });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients-simple"],
    queryFn: async () => (await api.get("/clients/simple")).data || [],
  });
  const { data: offices = [] } = useQuery({
    queryKey: ["offices-list"],
    queryFn: async () =>
      (await api.get("/intermediary-offices")).data?.data || [],
  });
  const { data: ownerships = [] } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => (await api.get("/properties")).data?.data || [],
  });
  const { data: privateTransactions = [] } = useQuery({
    queryKey: ["private-transactions-list"],
    queryFn: async () =>
      (await api.get("/private-transactions")).data?.data || [],
  });

  const linkMutation = useMutation({
    mutationFn: async (payload) =>
      await api.put(`/permits/${permit.id}`, payload),
    onSuccess: (data, variables) => {
      toast.success("تم تحديث الارتباط بنجاح!");
      queryClient.invalidateQueries(["building-permits"]);
      setLocalLinks((prev) => ({ ...prev, ...variables }));
      setLinkingMode(null);
      setSelectedValue("");
    },
    onError: () => toast.error("حدث خطأ أثناء الربط"),
  });

  const handleSaveLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");
    const payload = {};
    if (linkingMode === "client") payload.linkedClientId = selectedValue;
    if (linkingMode === "office") payload.linkedOfficeId = selectedValue;
    if (linkingMode === "ownership") payload.linkedOwnershipId = selectedValue;
    if (linkingMode === "privateTransaction")
      payload.linkedTransactionId = selectedValue;
    linkMutation.mutate(payload);
  };

  const handleUnlink = (field) => linkMutation.mutate({ [field]: null });

  const getOptions = (mode) => {
    if (mode === "client")
      return clients.map((c) => ({ label: c.name, value: c.id }));
    if (mode === "office")
      return offices.map((o) => ({ label: o.nameAr || o.name, value: o.id }));
    if (mode === "ownership")
      return ownerships.map((o) => ({
        label: `صك رقم: ${o.deedNumber || o.id}`,
        value: o.id,
      }));
    if (mode === "privateTransaction")
      return privateTransactions.map((t) => ({
        label: `رقم: ${t.ref || t.id} - ${t.client}`,
        value: t.id,
      }));
    return [];
  };

  const tabs = [
    { label: "البيانات", icon: <Edit3 size={12} /> },
    { label: "المستند", icon: <FileText size={12} /> },
    { label: "المكونات", icon: <Layers size={12} /> },
    { label: "الحدود", icon: <MapPin size={12} /> },
    { label: "المعاملات والارتباطات", icon: <Link size={12} /> },
    { label: "مرفقات أخرى", icon: <Paperclip size={12} /> },
    { label: "تقرير AI", icon: <Brain size={12} /> },
  ];

  if (!permit) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                <FileText size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  رخصة رقم {permit.permitNumber || "—"}
                  <AiBadge status={permit.aiStatus} />
                </h2>
                <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                  تفاصيل، مكونات، ومرفقات الرخصة
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors border border-slate-200 text-slate-400 shadow-sm"
            >
              <X size={18} />
            </button>
          </div>

          {/* 💡 أزرار الربط في الهيدر */}
          <div className="bg-white p-3 border border-slate-200 rounded-xl shadow-sm relative">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500 ml-2">
                <Link size={14} className="inline mr-1 text-blue-500" /> ربط
                السجل الحالي:
              </span>
              {!localLinks.linkedClientId && (
                <button
                  onClick={() => {
                    setLinkingMode("client");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "client" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
                >
                  <User size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بعميل</span>
                </button>
              )}
              {!localLinks.linkedOfficeId && (
                <button
                  onClick={() => {
                    setLinkingMode("office");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "office" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
                >
                  <Briefcase size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بمكتب</span>
                </button>
              )}
              {!localLinks.linkedOwnershipId && (
                <button
                  onClick={() => {
                    setLinkingMode("ownership");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "ownership" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
                >
                  <Building size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بملكية</span>
                </button>
              )}
              {!localLinks.linkedTransactionId && (
                <button
                  onClick={() => {
                    setLinkingMode("privateTransaction");
                    setSelectedValue("");
                  }}
                  className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "privateTransaction" ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm" : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-300 hover:bg-white"}`}
                >
                  <FileSignature size={14} />{" "}
                  <span className="text-[9px] font-black">ربط بمعاملة</span>
                </button>
              )}
            </div>

            {/* منطقة البحث العائمة في الهيدر */}
            {linkingMode && (
              <div className="absolute top-[110%] left-0 right-0 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 z-[250] shadow-xl animate-in slide-in-from-top-2">
                <div className="flex-1">
                  <SearchableDropdown
                    options={getOptions(linkingMode)}
                    value={selectedValue}
                    onChange={(val) => setSelectedValue(val)}
                    placeholder={`ابحث واختر ${linkingMode === "client" ? "العميل" : linkingMode === "office" ? "المكتب" : linkingMode === "ownership" ? "الملكية" : "المعاملة"}...`}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveLink}
                    disabled={linkMutation.isPending}
                    className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    {linkMutation.isPending ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Save size={12} />
                    )}
                    تأكيد الربط
                  </button>
                  <button
                    onClick={() => setLinkingMode(null)}
                    className="px-3 py-2 bg-white text-slate-500 border border-slate-200 text-[10px] font-black rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Info Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 bg-white border-b border-slate-100 text-[11px] shrink-0">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              المالك
              <button
                onClick={() => copyToClipboard(permit.ownerName)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all"
              >
                <Copy size={10} />
              </button>
            </span>
            <span className="text-slate-800 font-bold truncate text-sm">
              {permit.ownerName || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              الهوية
              <button
                onClick={() => copyToClipboard(permit.idNumber)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-blue-600 transition-all"
              >
                <Copy size={10} />
              </button>
            </span>
            <span className="text-slate-800 font-mono font-bold text-sm">
              {permit.idNumber || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex flex-col justify-between group">
            <span className="text-slate-400 font-bold mb-1 flex justify-between items-center">
              الحي / القطاع
            </span>
            <span className="text-slate-800 font-bold truncate text-sm">
              {permit.district || "—"} - {permit.sector || "—"}
            </span>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-400 font-bold block mb-1">
              شكل ومصدر الرخصة
            </span>
            <div className="flex items-center gap-1 mt-1">
              <FormBadge form={permit.form} />
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                {permit.source}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0 px-2 custom-scrollbar-slim">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-3.5 text-[11px] font-bold whitespace-nowrap border-b-[3px] transition-colors ${
                activeTab === i
                  ? "border-blue-600 text-blue-700 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-auto custom-scrollbar-slim bg-[#fafbfc] relative">
          {activeTab === 0 && <TabExtractedData permit={permit} />}
          {activeTab === 1 && <TabDocument permit={permit} />}
          {activeTab === 2 && <TabComponents permit={permit} />}
          {activeTab === 3 && <TabBoundaries permit={permit} />}
          {activeTab === 4 && (
            <TabLinkedRecords
              permit={permit}
              localLinks={localLinks}
              setLocalLinks={setLocalLinks}
              linkingMode={linkingMode}
              setLinkingMode={setLinkingMode}
              selectedValue={selectedValue}
              setSelectedValue={setSelectedValue}
              handleSaveLink={handleSaveLink}
              handleUnlink={handleUnlink}
              getOptions={getOptions}
              linkMutation={linkMutation}
              autoLinkedTransactions={autoLinkedTransactions}
              loadingAuto={loadingAuto}
              clients={clients}
              offices={offices}
              ownerships={ownerships}
              privateTransactions={privateTransactions}
            />
          )}
          {activeTab === 5 && <TabExtraAttachments permit={permit} />}
          {activeTab === 6 && <TabAiReport permit={permit} />}
        </div>
      </div>
    </div>
  );
}
