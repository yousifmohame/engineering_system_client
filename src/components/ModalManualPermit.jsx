import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "sonner";
import moment from "moment-hijri"; // 👈 مكتبة التقويم الهجري والميلادي
import {
  Edit3,
  X,
  CloudUpload,
  Loader2,
  Check,
  Save,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Search,
  ChevronLeft,
  CalendarDays,
  Clock,
} from "lucide-react";

// ==========================================
// 💡 دوال المعالجة الذكية (Advanced Normalization)
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

// 💡 توحيد أرقام المخططات المتقدم (أب/222 = 222\اب = 222 مخطط أب)
const normalizePlan = (str) => {
  if (!str) return "";
  let cleaned = toEnglishNumbers(str)
    .replace(/(^|\s)(مخطط|رقم)(\s+|$)/g, "") // إزالة الكلمات الزائدة
    .replace(/[أإآ]/g, "ا") // توحيد الألف
    .replace(/[\s\\_\-]/g, "/") // تحويل كل المسافات والفواصل إلى سلاش
    .replace(/\/+/g, "/"); // إزالة السلاش المكرر

  // فصل الأجزاء، ترتيبها أبجدياً، ثم دمجها لكي تتطابق بغض النظر عن الترتيب
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

// ==========================================
// 💡 مكون الحقل الذكي للربط (مدعوم بالقائمة البحثية)
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
}) => {
  const isLinked = useMemo(() => {
    if (!value || value.trim() === "") return false;
    return options.some((opt) => matchFn(opt, value));
  }, [value, options, matchFn]);

  // تحويل الخيارات لشكل يدعمه SearchableDropdown
  const dropdownOptions = useMemo(() => {
    return options.map((opt) => ({
      label: opt.name || opt.nameAr || opt.label || opt.planNumber,
      value: opt.name || opt.nameAr || opt.label || opt.planNumber,
    }));
  }, [options]);

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
            </div>
          ))}
      </div>
      <SearchableDropdown
        options={dropdownOptions}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        isAdding={isAdding}
        onQuickAdd={!isLinked ? onQuickAdd : null}
      />
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
  isDuplicate = false,
}) => (
  <div className="space-y-1">
    <div className="flex items-center justify-between mb-0.5">
      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
        {label}
        {isDuplicate && (
          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
            <AlertTriangle size={10} /> مكرر
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
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      style={style}
      className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 transition-colors ${isDuplicate ? "bg-amber-50 border-amber-300 focus:ring-amber-400 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
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

  // 💡 جلب الرخص لمعرفة التكرار
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
    engineeringOffice: "",
    source: "يدوي",
    notes: "",
    issueDate: "",
    expiryDate: "", // 👈 إضافة تاريخ الانتهاء الهجري
    file: null,
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
        file: null,
      });
    }
  }, [mode, permitData]);

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

  // 💡 فحص التكرار (رقم الرخصة + السنة الهجرية + رقم الهوية) - لا يمنع الحفظ
  const isDuplicate = useMemo(() => {
    if (!formData.permitNumber || !formData.year || !formData.idNumber)
      return false;
    // استثناء الرخصة الحالية من الفحص إذا كنا في وضع التعديل
    const others =
      mode === "edit"
        ? existingPermits.filter((p) => p.id !== permitData.id)
        : existingPermits;

    return others.some(
      (p) =>
        String(p.permitNumber) === String(formData.permitNumber) &&
        String(p.year) === String(formData.year) &&
        String(p.idNumber) === String(formData.idNumber),
    );
  }, [
    formData.permitNumber,
    formData.year,
    formData.idNumber,
    existingPermits,
    mode,
    permitData,
  ]);

  // 💡 حسابات التواريخ الذكية
  const expiryInfo = useMemo(() => {
    if (!formData.expiryDate) return null;

    try {
      // تحويل التاريخ الهجري (YYYY/MM/DD) إلى ميلادي
      const gregorianDate = moment(
        toEnglishNumbers(formData.expiryDate),
        "iYYYY/iM/iD",
      ).format("YYYY-MM-DD");
      if (gregorianDate === "Invalid date") return null;

      const end = new Date(gregorianDate);
      const now = new Date();

      // تفريغ الوقت للمقارنة الدقيقة للأيام
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
        // حماية البيانات وتحويل الأرقام قبل الحفظ
        let safeValue = data[key];
        if (
          key === "permitNumber" ||
          key === "idNumber" ||
          key === "plotNumber" ||
          key === "planNumber" ||
          key === "landArea" ||
          key === "year" ||
          key === "expiryDate"
        ) {
          safeValue = toEnglishNumbers(data[key]);
        }

        if (key === "file" && data.file) fd.append("file", data.file);
        else if (
          key !== "file" &&
          safeValue !== null &&
          safeValue !== undefined
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
              {mode === "add" ? "إضافة رخصة يدوية ذكية" : "تعديل بيانات الرخصة"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 custom-scrollbar-slim bg-[#fafbfc]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SmartLinkedField
                label="اسم المالك (العميل) *"
                value={formData.ownerName}
                onChange={(val) => setFormData({ ...formData, ownerName: val })}
                options={clients}
                listId="manualClientsList"
                placeholder="ابحث أو اكتب اسم العميل..."
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

            {/* 💡 رقم الرخصة (مع التنبيه) */}
            <CopyableInput
              label="رقم الرخصة *"
              value={formData.permitNumber}
              onChange={(val) =>
                setFormData({ ...formData, permitNumber: val })
              }
              placeholder="مثال: 1445/1234"
              isDuplicate={isDuplicate}
            />

            {/* 💡 التواريخ الذكية */}
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
              style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
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

            {/* 💡 الحقل الذكي لرقم المخطط (مع الفلترة القوية) */}
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
                onChange={(val) =>
                  setFormData({ ...formData, engineeringOffice: val })
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
                الرخصة
                <span className="text-[10px] text-slate-400 font-normal">
                  {mode === "edit"
                    ? "(ارفع ملفاً جديداً لاستبدال القديم)"
                    : "(اختياري)"}
                </span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-colors cursor-pointer bg-white shadow-sm"
              >
                <CloudUpload className="w-8 h-8 mx-auto text-blue-400 mb-2" />
                <div className="text-[12px] font-bold text-slate-700">
                  {formData.file
                    ? formData.file.name
                    : "اسحب الملف هنا أو اضغط للاختيار"}
                </div>
                <div className="text-[10px] font-bold text-slate-400 mt-1">
                  يدعم PDF, JPG, PNG - حد أقصى 25MB
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
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-200 bg-white rounded-b-xl shrink-0">
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
