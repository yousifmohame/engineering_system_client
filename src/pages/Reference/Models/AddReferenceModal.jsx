import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Plus,
  X,
  Upload,
  Filter,
  Brain,
  Loader2,
  ChevronDown,
  Check,
  FileText,
  Trash2,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../api/axios";

// 💡 دالة تحويل الأرقام (عربي إلى إنجليزي)
const toEnglishNumbers = (str) => {
  if (str === null || str === undefined) return "";
  return String(str).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
};

const BUILDING_TYPES = [
  "سكني",
  "تجاري",
  "إداري",
  "صناعي",
  "زراعي",
  "مستودعات",
  "تعليمي",
  "صحي",
];

// 💡 مكون مساعد للقائمة المنسدلة متعددة الاختيارات
const MultiSelectDropdown = ({
  label,
  options,
  selectedItems,
  onChange,
  disabled,
  isLoading,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleItem = (item) => {
    onChange(
      selectedItems.includes(item)
        ? selectedItems.filter((i) => i !== item)
        : [...selectedItems, item],
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[46px] p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between transition-all ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:border-emerald-300"}`}
      >
        <div className="flex flex-wrap gap-1.5 flex-1">
          {isLoading ? (
            <span className="text-sm font-bold text-slate-400 px-2 py-1 flex items-center gap-2">
              <Loader2 className="w-3 h-3 animate-spin" /> جاري التحميل...
            </span>
          ) : selectedItems.length === 0 ? (
            <span className="text-sm font-bold text-slate-400 px-2 py-1">
              اختر من القائمة...
            </span>
          ) : (
            selectedItems.map((item) => (
              <span
                key={item}
                className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-md text-[10px] font-bold flex items-center gap-1"
              >
                {item}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-emerald-950"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item);
                  }}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mx-2" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto custom-scrollbar-slim py-2">
          {options.map((option) => (
            <div
              key={option}
              onClick={() => toggleItem(option)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center ${selectedItems.includes(option) ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300"}`}
              >
                {selectedItems.includes(option) && (
                  <Check className="w-3 h-3" />
                )}
              </div>
              <span className="text-xs font-bold text-slate-700">{option}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function AddReferenceModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // States - معلومات المرجع
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("اشتراطات");
  const [type, setType] = useState("");

  // 🌟 تعديل: دعم مصفوفة من الملفات بدلاً من ملف واحد
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0); // 🌟 حالة نسبة الرفع

  const [txType, setTxType] = useState("");
  const [txMainCategory, setTxMainCategory] = useState("");
  const [txSubCategory, setTxSubCategory] = useState("");

  const [buildTypes, setBuildTypes] = useState([]);
  const [landAreaFrom, setLandAreaFrom] = useState("");
  const [landAreaTo, setLandAreaTo] = useState("");

  const [city, setCity] = useState("");
  const [sector, setSector] = useState("");
  const [districts, setDistricts] = useState([]);

  const [floorsFrom, setFloorsFrom] = useState("");
  const [floorsTo, setFloorsTo] = useState("");
  const [streetFrom, setStreetFrom] = useState("");
  const [streetTo, setStreetTo] = useState("");

  const [issueDate, setIssueDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [autoAnalyze, setAutoAnalyze] = useState(true);

  const { data: sectorMap = {}, isLoading: isLoadingDistricts } = useQuery({
    queryKey: ["sectors-grouped-map"],
    queryFn: async () => {
      try {
        const res = await api.get("/riyadh-zones");
        const payload = res.data;

        const sectorsData = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        const grouped = {};
        sectorsData.forEach((sectorObj) => {
          if (sectorObj.name) {
            grouped[sectorObj.name] = Array.isArray(sectorObj.districts)
              ? sectorObj.districts.map((d) => d.name)
              : [];
          }
        });
        return grouped;
      } catch (error) {
        console.error("فشل جلب الأحياء والقطاعات", error);
        return {};
      }
    },
    staleTime: Infinity,
  });

  const allDynamicDistricts = useMemo(() => {
    return Object.values(sectorMap).flat().sort();
  }, [sectorMap]);

  useEffect(() => {
    if (sector && sectorMap && Array.isArray(sectorMap[sector])) {
      const sectorDistricts = sectorMap[sector];
      setDistricts((prev) => {
        const safePrev = Array.isArray(prev) ? prev : [];
        return Array.from(new Set([...safePrev, ...sectorDistricts]));
      });
    }
  }, [sector, sectorMap]);

  // 🌟 معالجة إضافة الملفات الجديدة للمصفوفة
  const handleFileChange = (e) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  // 🌟 معالجة حذف ملف من المصفوفة
  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("source", source);
      formData.append("category", category);
      formData.append("type", type);

      // 🌟 إضافة جميع الملفات للـ FormData تحت مفتاح 'files'
      files.forEach((file) => {
        formData.append("files", file);
      });

      formData.append("txType", txType);
      formData.append("txMainCategory", txMainCategory);
      formData.append("txSubCategory", txSubCategory);
      formData.append("buildingTypes", JSON.stringify(buildTypes));

      formData.append("landAreaFrom", landAreaFrom);
      formData.append("landAreaTo", landAreaTo);

      formData.append("city", city);
      formData.append("sector", sector);
      formData.append("districts", JSON.stringify(districts));

      if (floorsFrom) formData.append("floorsFrom", floorsFrom);
      if (floorsTo) formData.append("floorsTo", floorsTo);
      if (streetFrom) formData.append("streetWidthFrom", streetFrom);
      if (streetTo) formData.append("streetWidthTo", streetTo);

      if (issueDate) formData.append("issueDate", issueDate);
      if (expiryDate) formData.append("expiryDate", expiryDate);
      formData.append("autoAnalyze", autoAnalyze);

      // 🌟 إرسال الطلب مع مراقبة نسبة التقدم (Progress)
      return await api.post("/references", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setUploadProgress(percentCompleted);
        },
      });
    },
    onSuccess: () => {
      toast.success("تمت إضافة المرجع للمكتبة بنجاح");
      queryClient.invalidateQueries(["reference-documents"]);
      setUploadProgress(0); // إعادة تعيين التقدم
      onClose();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حفظ المرجع");
      setUploadProgress(0);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !source || !category) {
      return toast.error("يرجى تعبئة الحقول الأساسية");
    }
    saveMutation.mutate();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Plus className="w-6 h-6 text-emerald-600" /> إضافة مرجع جديد
            للمكتبة
          </h2>
          <button
            onClick={onClose}
            disabled={saveMutation.isPending}
            className="p-2 hover:bg-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        <form className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar-slim">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                عنوان المرجع *
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: كود البناء السعودي - العام"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                الجهة المصدرة *
              </label>
              <input
                required
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="مثال: أمانة منطقة الرياض"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                type="text"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">
                التصنيف *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors cursor-pointer appearance-none"
              >
                <option value="اشتراطات">اشتراطات</option>
                <option value="أدلة">أدلة</option>
                <option value="تعاميم">تعاميم</option>
                <option value="عروض">عروض</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700">النوع</label>
              <input
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="مثال: تعميم، دليل إجرائي..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                type="text"
              />
            </div>
          </div>

          {/* 🌟 منطقة رفع الملفات المتعددة */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-700">
              المستندات والمرفقات (PDF، صور، ملفات مفتوحة الحجم)
            </label>
            <div
              onClick={() =>
                !saveMutation.isPending && fileInputRef.current?.click()
              }
              className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-colors ${saveMutation.isPending ? "opacity-50 cursor-not-allowed bg-slate-100" : "cursor-pointer bg-slate-50 hover:bg-emerald-50/30 border-slate-300 hover:border-emerald-400"}`}
            >
              <div className="p-4 bg-white rounded-2xl shadow-sm transition-transform">
                <Upload className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-900">
                  اسحب الملفات هنا أو انقر للاختيار (يمكنك تحديد عدة ملفات)
                </p>
                <p className="text-[10px] font-bold text-slate-400 mt-1">
                  حجم مفتوح للملفات المتعددة
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple // 🌟 تفعيل الرفع المتعدد
                accept=".pdf,image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={saveMutation.isPending}
              />
            </div>

            {/* 🌟 قائمة الملفات المختارة */}
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileText className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span
                        className="text-xs font-bold text-slate-700 truncate"
                        dir="ltr"
                      >
                        {f.name}
                      </span>
                    </div>
                    {!saveMutation.isPending && (
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 hover:bg-red-50 rounded-md transition-colors text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* 🌟 شريط التقدم عند الرفع */}
            {saveMutation.isPending && (
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-emerald-700 animate-pulse">
                    جاري رفع الملفات ومعالجتها...
                  </span>
                  <span className="text-slate-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pb-2 border-b">
              <Filter className="w-4 h-4 text-emerald-600" /> تحديد نطاق
              الانطباق (Applicability Scope)
            </h3>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-slate-800">
                بيانات المعاملة المستهدفة
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">
                    نوع المعاملة
                  </label>
                  <select
                    value={txType}
                    onChange={(e) => setTxType(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="">الكل</option>
                    <option value="إصدار رخصة بناء">إصدار رخصة بناء</option>
                    <option value="تعديل رخصة بناء">تعديل رخصة بناء</option>
                    <option value="تصحيح وضع">تصحيح وضع</option>
                    <option value="تقرير فني">تقرير فني</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">
                    التصنيف الرئيسي
                  </label>
                  <select
                    value={txMainCategory}
                    onChange={(e) => setTxMainCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="">الكل</option>
                    <option value="مستندات معاملات">مستندات معاملات</option>
                    <option value="مستندات مساحية">مستندات مساحية</option>
                    <option value="مستندات ملكية">مستندات ملكية</option>
                    <option value="مستندات مخططات">مستندات مخططات</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">
                    التصنيف الفرعي
                  </label>
                  <select
                    value={txSubCategory}
                    onChange={(e) => setTxSubCategory(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    <option value="">الكل</option>
                    <option value="تقارير هندسية">تقارير هندسية</option>
                    <option value="مستندات رفع">مستندات رفع</option>
                    <option value="مخططات معمارية">مخططات معمارية</option>
                    <option value="مخططات إنشائية">مخططات إنشائية</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-slate-800">
                العقار والأرض
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">
                    أنواع المباني (اختيار متعدد)
                  </label>
                  <MultiSelectDropdown
                    options={BUILDING_TYPES}
                    selectedItems={buildTypes}
                    onChange={setBuildTypes}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-500">
                    نطاق مساحة الأرض م² (من - إلى)
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={landAreaFrom}
                      onChange={(e) =>
                        setLandAreaFrom(toEnglishNumbers(e.target.value))
                      }
                      placeholder="أدنى مساحة"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      type="number"
                    />
                    <input
                      value={landAreaTo}
                      onChange={(e) =>
                        setLandAreaTo(toEnglishNumbers(e.target.value))
                      }
                      placeholder="أقصى مساحة"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <h4 className="text-xs font-black text-slate-800">
                  الموقع الجغرافي
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      المدينة
                    </label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer"
                    >
                      <option value="">الكل</option>
                      <option value="الرياض">الرياض</option>
                      <option value="جدة">جدة</option>
                      <option value="الدمام">الدمام</option>
                      <option value="مكة المكرمة">مكة المكرمة</option>
                      <option value="المدينة المنورة">المدينة المنورة</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      القطاع
                    </label>
                    <select
                      value={sector}
                      onChange={(e) => setSector(e.target.value)}
                      disabled={isLoadingDistricts}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer disabled:opacity-50"
                    >
                      <option value="">غير محدد</option>
                      {Object.keys(sectorMap).map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      الأحياء (تعبئة تلقائية باختيار القطاع)
                    </label>
                    <MultiSelectDropdown
                      isLoading={isLoadingDistricts}
                      disabled={isLoadingDistricts}
                      options={allDynamicDistricts}
                      selectedItems={districts}
                      onChange={setDistricts}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5 bg-slate-50 border border-slate-100 rounded-2xl">
                <h4 className="text-xs font-black text-slate-800">
                  تفاصيل فنية وزمنية
                </h4>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      عدد الأدوار (من - إلى)
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={floorsFrom}
                        onChange={(e) =>
                          setFloorsFrom(toEnglishNumbers(e.target.value))
                        }
                        placeholder="من"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        type="number"
                      />
                      <input
                        value={floorsTo}
                        onChange={(e) =>
                          setFloorsTo(toEnglishNumbers(e.target.value))
                        }
                        placeholder="إلى"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">
                      عرض الشارع بالمتر (من - إلى)
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={streetFrom}
                        onChange={(e) =>
                          setStreetFrom(toEnglishNumbers(e.target.value))
                        }
                        placeholder="من"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        type="number"
                      />
                      <input
                        value={streetTo}
                        onChange={(e) =>
                          setStreetTo(toEnglishNumbers(e.target.value))
                        }
                        placeholder="إلى"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        type="number"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">
                        تاريخ الإصدار
                      </label>
                      <input
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        type="date"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">
                        الانتهاء (اختياري)
                      </label>
                      <input
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                        type="date"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`p-6 rounded-3xl border flex items-center justify-between transition-colors ${autoAnalyze ? "bg-purple-50 border-purple-200" : "bg-slate-50 border-slate-200"}`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-2xl shadow-sm transition-colors ${autoAnalyze ? "bg-white text-purple-600" : "bg-slate-200 text-slate-500"}`}
              >
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={`text-sm font-black transition-colors ${autoAnalyze ? "text-purple-900" : "text-slate-700"}`}
                >
                  بدء التحليل الذكي تلقائياً
                </p>
                <p
                  className={`text-[10px] font-bold transition-colors ${autoAnalyze ? "text-purple-600" : "text-slate-500"}`}
                >
                  سيقوم النظام باستخراج النص وتلخيصه وشرحه فور الرفع لجميع
                  المرفقات
                </p>
              </div>
            </div>
            <div
              onClick={() => setAutoAnalyze(!autoAnalyze)}
              className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${autoAnalyze ? "bg-purple-600" : "bg-slate-300"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${autoAnalyze ? "left-1 translate-x-6" : "left-1"}`}
              ></div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={saveMutation.isPending}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl text-sm font-black hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={saveMutation.isPending}
            className="px-8 py-3 bg-emerald-600 text-white rounded-2xl text-sm font-black hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50 flex items-center gap-2 relative overflow-hidden"
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin relative z-10" />
                <span className="relative z-10">جاري الرفع...</span>
                {/* 🌟 تأثير تقدم لوني خلف الزر كبديل إضافي لشريط التقدم */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-800/40 transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </>
            ) : (
              "حفظ وإضافة للمكتبة"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
