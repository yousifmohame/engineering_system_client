import React, { useState, useMemo, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../api/axios";
import moment from "moment-hijri";
import {
  X,
  Plus,
  FileText,
  User,
  Calculator,
  Briefcase,
  MapPin,
  Trash2,
  Paperclip,
  CheckCircle2,
  EyeOff,
  Search,
  ChevronDown,
  Loader2,
  AlertTriangle,
  Copy,
  ChevronLeft,
  Building,
  FileSignature,
  Link,
  Save,
  CloudUpload,
  CalendarDays,
  Clock,
  Edit3,
  Check
} from "lucide-react";

// ============================================================================
// 💡 Helpers
// ============================================================================
const formatNumberWithCommas = (val) => {
  if (!val) return "";
  const numStr = val.toString().replace(/,/g, "");
  if (isNaN(numStr)) return val;
  return Number(numStr).toLocaleString("en-US");
};

const parseNumber = (val) => {
  if (!val) return 0;
  return Number(val.toString().replace(/,/g, ""));
};

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
  let cleaned = toEnglishNumbers(str)
    .replace(/(^|\s)(مخطط|رقم)(\s+|$)/g, "")
    .replace(/[أإآ]/g, "ا")
    .replace(/[\s\\_\-]/g, "/")
    .replace(/\/+/g, "/");

  if (cleaned.includes("/")) {
    cleaned = cleaned.split("/").filter(Boolean).sort().join("/");
  }
  return cleaned.toLowerCase();
};

const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

const initialOwnerState = {
  isNewClient: false,
  clientId: "",
  ownerName: "",
  newClient: {
    type: "فرد سعودي",
    first: "",
    last: "",
    companyName: "",
    idNumber: "",
  },
};

// ============================================================================
// 💡 القائمة الذكية القابلة للبحث
// ============================================================================
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
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
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
          className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 cursor-pointer flex items-center justify-between hover:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all"
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
            className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
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

// ============================================================================
// 💡 مكون مساعد: قائمة منسدلة قابلة للبحث (Searchable Select) - للاستخدامات القديمة
// ============================================================================
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(toEnglishNumbers(search).toLowerCase()),
    );
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label || "";

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full border rounded-lg px-3 py-2.5 text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${disabled ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed" : "bg-gray-50 border-gray-300 focus-within:border-blue-500 focus-within:bg-white"}`}
      >
        <span className={selectedLabel ? "text-gray-800" : "text-gray-400"}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-gray-100 bg-gray-50 sticky top-0">
            <div className="relative">
              <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="اكتب للبحث..."
                value={search}
                onChange={(e) => setSearch(toEnglishNumbers(e.target.value))}
                className="w-full pl-2 pr-7 py-1.5 text-xs font-bold border border-gray-300 rounded outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar-slim">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value, opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer border-b border-gray-50 last:border-0 font-bold"
                >
                  {opt.label}
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-xs text-gray-400">
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
// 💡 مكون الحقل الذكي الهجين (Hybrid Smart Field)
// يدمج بين إمكانية الكتابة الحرة والبحث من الداتاليست والبحث السريع
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
  disabled = false,
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
        {!disabled &&
          value &&
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
          onChange={(e) => onChange(toEnglishNumbers(e.target.value))}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-lg text-[11px] font-bold outline-none transition-all ${
            disabled
              ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
              : value && isLinked
                ? "border-emerald-300 focus:ring-1 focus:ring-emerald-400 bg-white text-slate-700"
                : "bg-slate-50 border-slate-200 focus:ring-1 focus:ring-blue-400 focus:bg-white text-slate-700"
          }`}
          placeholder={placeholder}
          list={listId}
        />
        {!disabled && (
          <datalist id={listId}>
            {options.map((opt, idx) => (
              <option
                key={idx}
                value={opt.name || opt.nameAr || opt.label || opt.planNumber}
              />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 💡 مكون الإدخال العادي القابل للنسخ
// ==========================================
const CopyableInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  style = {},
  warning = null,
  disabled = false,
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between mb-0.5">
      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
        {label}
        {warning && (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
            <AlertTriangle size={10} /> {warning}
          </span>
        )}
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
      onChange={(e) => onChange(toEnglishNumbers(e.target.value))}
      placeholder={placeholder}
      dir={dir}
      style={style}
      disabled={disabled}
      className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none transition-colors ${disabled ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed" : warning ? "border-amber-400 bg-amber-50 focus:ring-amber-500 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
    />
  </div>
);

// ==========================================
// 💡 المودل الرئيسي للإضافة اليدوية
// ==========================================
export function ModalManualPermit({
  mode = "add",
  permitData = null,
  onClose,
  fixedOffice, // 👈 نستقبل اسم المكتب الافتراضي
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

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
  const { data: ownerships = [] } = useQuery({
    queryKey: ["properties-list"],
    queryFn: async () => (await api.get("/properties")).data?.data || [],
  });
  const { data: privateTransactions = [] } = useQuery({
    queryKey: ["private-transactions-list"],
    queryFn: async () =>
      (await api.get("/private-transactions")).data?.data || [],
  });
  const { data: existingPermits = [] } = useQuery({
    queryKey: ["building-permits"],
    queryFn: async () => (await api.get("/permits")).data?.data || [],
  });

  const flatDistricts = useMemo(() => {
    let all = [];
    districtsTree.forEach((s) => {
      if (s.neighborhoods)
        all = [
          ...all,
          ...s.neighborhoods.map((n) => ({ ...n, sectorName: s.name })),
        ];
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

  // 💡 إضافة الـ State لعملية الربط في الهيدر/لوحة التحكم العلوية
  const [linkingMode, setLinkingMode] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  const [formData, setFormData] = useState({
    permitNumber: "",
    year: "1446",
    type: "بناء جديد",
    form: "يدوي",
    ownerName: "",
    idNumber: "",
    district: "",
    sector: "",
    plotNumber: "",
    planNumber: "",
    landArea: "",
    mainUsage: "سكني",
    subUsage: "",
    engineeringOffice: fixedOffice || "",
    source: "يدوي",
    notes: "",
    issueDate: "",
    expiryDate: "",
    file: null,

    // 💡 حقول الربط المباشر
    linkedClientId: "",
    linkedOfficeId: "",
    linkedOwnershipId: "",
    linkedTransactionId: "",
  });

  useEffect(() => {
    if (mode === "edit" && permitData) {
      setFormData({
        ...permitData,
        mainUsage: permitData.mainUsage || permitData.usage || "سكني",
        subUsage: permitData.subUsage || "",
        landArea: permitData.landArea || "",
        notes: permitData.notes || "",
        expiryDate: permitData.expiryDate || "",
        engineeringOffice: fixedOffice || permitData.engineeringOffice || "",
        linkedClientId: permitData.linkedClientId || "",
        linkedOfficeId: permitData.linkedOfficeId || "",
        linkedOwnershipId: permitData.linkedOwnershipId || "",
        linkedTransactionId: permitData.linkedTransactionId || "",
        file: null,
      });
    }
  }, [mode, permitData, fixedOffice]);

  useEffect(() => {
    if (formData.district && flatDistricts.length > 0) {
      const found = flatDistricts.find((d) => d.name === formData.district);
      if (found && formData.sector !== `قطاع ${found.sectorName}`) {
        setFormData((prev) => ({
          ...prev,
          sector: `قطاع ${found.sectorName}`,
        }));
      }
    }
  }, [formData.district, flatDistricts]);

  // ==========================================
  // 💡 فحص التكرار اللحظي המتقدم
  // ==========================================
  const duplicateWarning = useMemo(() => {
    if (!formData.permitNumber || formData.permitNumber.trim() === "")
      return null;
    const others =
      mode === "edit"
        ? existingPermits.filter((p) => p.id !== permitData.id)
        : existingPermits;
    const duplicatePermit = others.find(
      (p) =>
        String(p.permitNumber) ===
        String(toEnglishNumbers(formData.permitNumber)),
    );
    if (duplicatePermit) {
      return {
        ownerName: duplicatePermit.ownerName || "غير محدد",
        year: duplicatePermit.year || "غير محدد",
        idNumber: duplicatePermit.idNumber || "غير محدد",
      };
    }
    return null;
  }, [formData.permitNumber, existingPermits, mode, permitData]);

  const expiryInfo = useMemo(() => {
    if (!formData.expiryDate) return null;
    try {
      const gregorianDate = moment(
        toEnglishNumbers(formData.expiryDate),
        "iYYYY/iM/iD",
      ).format("YYYY-MM-DD");
      if (gregorianDate === "Invalid date") return null;
      const end = new Date(gregorianDate);
      const now = new Date();
      end.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      const diffTime = end - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return {
        gregorian: gregorianDate,
        diffDays: diffDays,
        isValid: diffDays >= 0,
      };
    } catch (e) {
      return null;
    }
  }, [formData.expiryDate]);

  const issueInfo = useMemo(() => {
    if (!formData.year || formData.year.length !== 4) return null;
    const currentHijriYear = moment().iYear();
    const parsedYear = parseInt(toEnglishNumbers(formData.year));
    if (isNaN(parsedYear)) return null;
    const diff = currentHijriYear - parsedYear;
    return diff >= 0 ? diff : 0;
  }, [formData.year]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      Object.keys(data).forEach((key) => {
        let safeValue = data[key];
        if (
          [
            "permitNumber",
            "idNumber",
            "plotNumber",
            "planNumber",
            "landArea",
            "year",
            "expiryDate",
          ].includes(key)
        ) {
          safeValue = toEnglishNumbers(data[key]);
        }
        if (key === "file" && data.file) fd.append("file", data.file);
        else if (
          key !== "file" &&
          safeValue !== null &&
          safeValue !== undefined &&
          safeValue !== ""
        )
          fd.append(key, safeValue);
      });

      if (mode === "edit")
        return await api.put(`/permits/${permitData.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      else
        return await api.post("/permits", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    },
    onSuccess: () => {
      toast.success(
        mode === "add"
          ? "تم حفظ وتسجيل الرخصة بنجاح"
          : "تم تحديث بيانات الرخصة بنجاح",
      );
      queryClient.invalidateQueries(["building-permits"]);
      onClose();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ"),
  });

  const handleSubmit = () => {
    if (!formData.permitNumber || !formData.ownerName)
      return toast.error("يرجى إدخال رقم الرخصة واسم المالك كحد أدنى");
    saveMutation.mutate(formData);
  };

  // 💡 دوال الربط
  const handleApplyLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");

    if (linkingMode === "client")
      setFormData({ ...formData, linkedClientId: selectedValue });
    if (linkingMode === "office")
      setFormData({ ...formData, linkedOfficeId: selectedValue });
    if (linkingMode === "ownership")
      setFormData({ ...formData, linkedOwnershipId: selectedValue });
    if (linkingMode === "privateTransaction")
      setFormData({ ...formData, linkedTransactionId: selectedValue });

    setLinkingMode(null);
    setSelectedValue("");
    toast.success("تم تحديد السجل للربط، سيتم حفظه مع الرخصة.");
  };

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

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-5xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 rounded-t-xl bg-blue-600 shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Edit3 className="w-5 h-5" />
            <span className="text-base font-bold">
              {mode === "add" ? "إضافة رخصة يدوية" : "تعديل بيانات الرخصة"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 💡 أزرار الربط في أعلى النموذج */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 ml-2">
              <Link size={14} className="inline mr-1 text-blue-500" /> إضافة
              ارتباط للرخصة:
            </span>
            {!formData.linkedClientId && (
              <button
                onClick={() => {
                  setLinkingMode("client");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "client" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <User size={14} />{" "}
                <span className="text-[10px] font-black">بعميل</span>
              </button>
            )}
            {!formData.linkedOfficeId && (
              <button
                onClick={() => {
                  setLinkingMode("office");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "office" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <Briefcase size={14} />{" "}
                <span className="text-[10px] font-black">بمكتب</span>
              </button>
            )}
            {!formData.linkedOwnershipId && (
              <button
                onClick={() => {
                  setLinkingMode("ownership");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "ownership" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <Building size={14} />{" "}
                <span className="text-[10px] font-black">بملكية</span>
              </button>
            )}
            {!formData.linkedTransactionId && (
              <button
                onClick={() => {
                  setLinkingMode("privateTransaction");
                  setSelectedValue("");
                }}
                className={`flex-1 min-w-[100px] p-2 border rounded-lg flex items-center justify-center gap-1.5 transition-all ${linkingMode === "privateTransaction" ? "border-blue-500 bg-blue-100 text-blue-700 shadow-sm" : "border-slate-200 bg-white text-slate-500 hover:border-blue-300"}`}
              >
                <FileSignature size={14} />{" "}
                <span className="text-[10px] font-black">بمعاملة فرعية</span>
              </button>
            )}
          </div>

          {/* منطقة البحث المنسدلة للربط */}
          {linkingMode && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
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
                  onClick={handleApplyLink}
                  className="px-4 py-2.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                >
                  اختيار وربط
                </button>
                <button
                  onClick={() => setLinkingMode(null)}
                  className="px-3 py-2.5 bg-white text-slate-500 border border-slate-200 text-[10px] font-black rounded-lg hover:bg-slate-50 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}

          {/* استعراض السجلات المربوطة */}
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.linkedClientId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <User size={12} /> عميل:{" "}
                {clients.find((c) => c.id === formData.linkedClientId)?.name ||
                  "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedClientId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {formData.linkedOfficeId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Briefcase size={12} /> مكتب:{" "}
                {offices.find((o) => o.id === formData.linkedOfficeId)
                  ?.nameAr || "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedOfficeId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {formData.linkedOwnershipId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Building size={12} /> ملكية:{" "}
                {ownerships.find((o) => o.id === formData.linkedOwnershipId)
                  ?.deedNumber || "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedOwnershipId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {formData.linkedTransactionId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-200">
                <FileSignature size={12} /> معاملة:{" "}
                {privateTransactions.find(
                  (t) => t.id === formData.linkedTransactionId,
                )?.ref || "مربوط"}
                <button
                  onClick={() =>
                    setFormData({ ...formData, linkedTransactionId: "" })
                  }
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar-slim bg-[#fafbfc] space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-3 pb-2 border-b border-slate-100 mb-1 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h4 className="font-bold text-slate-800 text-sm">
                المعلومات الأساسية للرخصة
              </h4>
            </div>

            <div className="lg:col-span-2">
              <SmartLinkedField
                label="اسم المالك (العميل) *"
                value={formData.ownerName}
                linkedId={formData.linkedClientId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    ownerName: val,
                    linkedClientId: "",
                  })
                } // 👈 عند الكتابة يتم فك الربط المباشر
                options={clients}
                listId="manualClientsList"
                placeholder="اكتب اسم العميل..."
                matchFn={(opt, val) =>
                  normalizeArabicText(opt.fullNameRaw) ===
                    normalizeArabicText(val) ||
                  opt.idNumber === formData.idNumber
                }
                isAdding={quickAddClient.isPending}
                onQuickAdd={() =>
                  quickAddClient.mutate({
                    name: JSON.stringify({ ar: formData.ownerName }),
                    officialNameAr: formData.ownerName,
                    idNumber: formData.idNumber || `TMP-${Date.now()}`,
                    type: "individual",
                    mobile: "0500000000",
                  })
                }
              />
            </div>

            <CopyableInput
              label="رقم الهوية"
              value={formData.idNumber}
              onChange={(val) => setFormData({ ...formData, idNumber: val })}
              placeholder="10 أرقام"
              dir="ltr"
              style={{ textAlign: "right" }}
            />

            <div className="space-y-1 relative">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  رقم الرخصة *
                  {duplicateWarning && (
                    <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
                      <AlertTriangle size={10} /> تنبيه: مكرر
                    </span>
                  )}
                  <button
                    onClick={() => copyToClipboard(formData.permitNumber)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    title="نسخ المحتوى"
                  >
                    <Copy size={12} />
                  </button>
                </label>
              </div>
              <input
                type="text"
                value={formData.permitNumber}
                onChange={(e) =>
                  setFormData({ ...formData, permitNumber: e.target.value })
                }
                placeholder="مثال: 1445/1234"
                dir="rtl"
                className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 transition-colors ${duplicateWarning ? "bg-amber-50 border-amber-300 focus:ring-amber-400 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
              />
              {duplicateWarning && (
                <div className="absolute top-[100%] left-0 right-0 mt-1 z-10 bg-amber-50 border border-amber-200 rounded-lg p-2.5 shadow-lg text-[10px] leading-relaxed animate-in fade-in zoom-in-95">
                  <div className="font-bold text-amber-800 mb-1 flex items-center gap-1">
                    <AlertTriangle size={12} className="text-amber-600" /> هذا
                    الرقم مسجل في النظام مسبقاً!
                  </div>
                  <div className="text-amber-700 font-semibold space-y-0.5">
                    <div>
                      المالك السابق:{" "}
                      <span className="font-bold">
                        {duplicateWarning.ownerName}
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <span>
                        السنة:{" "}
                        <span className="font-bold">
                          {duplicateWarning.year}
                        </span>
                      </span>
                      <span>
                        الهوية:{" "}
                        <span className="font-bold">
                          {duplicateWarning.idNumber}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <CopyableInput
                label="سنة الرخصة"
                type="text"
                value={formData.year}
                onChange={(val) => setFormData({ ...formData, year: val })}
                placeholder="مثال: 1447"
              />
              {issueInfo !== null && (
                <div className="text-[9px] text-slate-500 font-bold flex items-center gap-1">
                  <Clock size={10} /> صُدرت منذ {issueInfo} سنة
                </div>
              )}
            </div>

            <div className="space-y-1">
              <CopyableInput
                label="تاريخ الانتهاء (هجري)"
                type="text"
                value={formData.expiryDate}
                onChange={(val) =>
                  setFormData({ ...formData, expiryDate: val })
                }
                placeholder="يوم/شهر/سنة (مثال: 1445/05/12)"
              />
              {expiryInfo && (
                <div className="flex flex-col gap-0.5 mt-1">
                  <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1">
                    <CalendarDays size={10} /> الميلادي:{" "}
                    <span dir="ltr">{expiryInfo.gregorian}</span>
                  </div>
                  <div
                    className={`text-[9px] font-bold flex items-center gap-1 ${expiryInfo.isValid ? "text-emerald-600" : "text-red-600"}`}
                  >
                    <Clock size={10} />{" "}
                    {expiryInfo.isValid
                      ? `سارية المفعول (متبقي ${expiryInfo.diffDays} يوم)`
                      : `منتهية (منذ ${Math.abs(expiryInfo.diffDays)} يوم)`}
                  </div>
                </div>
              )}
            </div>

            <CopyableInput
              label="القطاع (تلقائي)"
              value={formData.sector}
              onChange={() => {}}
              placeholder="يحدد تلقائياً حسب الحي"
              disabled={true}
            />

            <div>
              <SmartLinkedField
                label="الحي"
                value={formData.district}
                onChange={(val) => setFormData({ ...formData, district: val })}
                options={flatDistricts}
                listId="manualDistrictsList"
                placeholder={
                  loadingDistricts ? "جاري التحميل..." : "ابحث أو اكتب الحي..."
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
                    name: formData.district,
                    sectorId: sectors[0]?.id,
                  })
                }
              />
            </div>
            <div>
              <SmartLinkedField
                label="رقم المخطط"
                value={formData.planNumber}
                onChange={(val) =>
                  setFormData({ ...formData, planNumber: val })
                }
                options={plans}
                listId="manualPlansList"
                placeholder="ابحث أو اكتب رقم المخطط..."
                matchFn={(opt, val) =>
                  normalizePlan(opt.name) === normalizePlan(val) ||
                  normalizePlan(opt.planNumber) === normalizePlan(val)
                }
                isAdding={quickAddPlan.isPending}
                onQuickAdd={() =>
                  quickAddPlan.mutate({
                    name: formData.planNumber,
                    planNumber: formData.planNumber,
                  })
                }
              />
            </div>
            <CopyableInput
              label="رقم القطعة"
              value={formData.plotNumber}
              onChange={(val) => setFormData({ ...formData, plotNumber: val })}
              placeholder="رقم القطعة"
            />
            <CopyableInput
              label="مساحة الأرض (م²)"
              type="text"
              value={formData.landArea}
              onChange={(val) => setFormData({ ...formData, landArea: val })}
              placeholder="المساحة"
            />

            <div className="space-y-1">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  التصنيف الرئيسي{" "}
                  <button
                    onClick={() => copyToClipboard(formData.mainUsage)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </label>
              </div>
              <input
                type="text"
                value={formData.mainUsage}
                onChange={(e) =>
                  setFormData({ ...formData, mainUsage: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="مثال: سكني، تجاري"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  التصنيف الفرعي{" "}
                  <button
                    onClick={() => copyToClipboard(formData.subUsage)}
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Copy size={12} />
                  </button>
                </label>
              </div>
              <input
                type="text"
                value={formData.subUsage}
                onChange={(e) =>
                  setFormData({ ...formData, subUsage: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 outline-none focus:ring-1 focus:ring-blue-400"
                placeholder="مثال: مستودعات، مكتبي، فيلا"
              />
            </div>

            <div>
              <SmartLinkedField
                label="المكتب الهندسي"
                value={formData.engineeringOffice}
                disabled={!!fixedOffice}
                linkedId={formData.linkedOfficeId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    engineeringOffice: val,
                    linkedOfficeId: "",
                  })
                }
                options={offices}
                listId="manualOfficesList"
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
                    nameAr: formData.engineeringOffice,
                    nameEn: formData.engineeringOffice,
                    phone: "0500000000",
                    commercialRegister: "0000000000",
                    city: "الرياض",
                    status: "نشط",
                  })
                }
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                شكل الرخصة
              </label>
              <select
                value={formData.form}
                onChange={(e) =>
                  setFormData({ ...formData, form: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
              >
                {["يدوي", "أصفر", "أخضر"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                المصدر
              </label>
              <select
                value={formData.source}
                onChange={(e) =>
                  setFormData({ ...formData, source: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50"
              >
                {[
                  "نظام المعاملات",
                  "رفع يدوي (AI)",
                  "بوابة بلدي",
                  "استيراد تاريخي",
                  "يدوي",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-3 space-y-1 mt-2">
              <CopyableInput
                label="ملاحظات"
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
                placeholder="ملاحظات إضافية (اختياري)"
              />
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                <CloudUpload className="w-4 h-4 text-blue-500" /> إرفاق مستند
                الرخصة الأصلي
                <span className="text-[10px] text-slate-400 font-normal">
                  {mode === "edit"
                    ? "(ارفع ملفاً جديداً لاستبدال القديم)"
                    : "(اختياري ولكن محبذ)"}
                </span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer bg-slate-50 shadow-sm"
              >
                <CloudUpload className="w-10 h-10 mx-auto text-blue-400 mb-3" />
                <div className="text-[13px] font-bold text-slate-700">
                  {formData.file
                    ? formData.file.name
                    : "اسحب الملف هنا أو اضغط للاختيار"}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1.5">
                  يدعم صيغ PDF, JPG, PNG بحجم أقصى 25MB
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    setFormData({ ...formData, file: e.target.files[0] })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-white rounded-b-xl shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <button
            onClick={onClose}
            className="px-6 text-xs font-bold bg-slate-100 text-slate-600 rounded-xl py-2.5 hover:bg-slate-200 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="px-8 text-xs font-bold bg-blue-600 text-white rounded-xl py-2.5 hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-blue-600/20"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "add" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {mode === "add" ? "حفظ وتسجيل السجل" : "اعتماد التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}
