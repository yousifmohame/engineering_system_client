import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { toast } from "sonner";
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
  Copy, // 👈 أيقونة النسخ
} from "lucide-react";

// ==========================================
// 💡 دالة مساعدة للنسخ (Clipboard)
// ==========================================
const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

// ==========================================
// 💡 مكون الحقل الذكي للربط (مضاف إليه زر النسخ)
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
}) => {
  const isLinked = useMemo(() => {
    if (!value || value.trim() === "") return false;
    return options.some((opt) => matchFn(opt, value));
  }, [value, options, matchFn]);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between mb-0.5">
        <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
          {label}
          {/* 💡 زر النسخ الموحد */}
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

// ==========================================
// 💡 مكون لحقل إدخال عادي مع زر النسخ
// ==========================================
const CopyableInput = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir = "rtl",
  style = {},
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
      className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
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

  // ==========================================
  // 💡 1. جلب البيانات للدروب داون
  // ==========================================
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

  // 💡 جلب المخططات (Plans) لدعم الحقل الذكي الجديد
  const { data: plans = [] } = useQuery({
    queryKey: ["plans-list"],
    queryFn: async () => (await api.get("/riyadh-streets/plans")).data || [],
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

  // ==========================================
  // 💡 2. الإضافة السريعة (Mutations)
  // ==========================================
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

  // 💡 إضافة المخطط السريعة
  const quickAddPlan = useMutation({
    mutationFn: async (data) => await api.post("/riyadh-streets/plans", data),
    onSuccess: () => {
      toast.success("تمت إضافة المخطط بنجاح!");
      queryClient.invalidateQueries(["plans-list"]);
    },
  });

  // ==========================================
  // 💡 3. حالة الفورم (Form State)
  // ==========================================
  const [formData, setFormData] = useState({
    permitNumber: "",
    year: "1446", // سيتم التعامل معه كمدخل نصي
    type: "بناء جديد",
    form: "يدوي",
    ownerName: "",
    idNumber: "",
    district: "",
    sector: "",
    plotNumber: "",
    planNumber: "",
    landArea: "",
    mainUsage: "سكني", // 👈 التصنيف الرئيسي
    subUsage: "", // 👈 التصنيف الفرعي
    engineeringOffice: "",
    source: "يدوي",
    notes: "",
    file: null,
  });

  useEffect(() => {
    if (mode === "edit" && permitData) {
      setFormData({
        ...permitData,
        mainUsage: permitData.mainUsage || permitData.usage || "سكني", // التوافق مع القديم
        subUsage: permitData.subUsage || "",
        landArea: permitData.landArea || "",
        notes: permitData.notes || "",
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

  // ==========================================
  // 💡 4. الحفظ النهائي (Submit)
  // ==========================================
  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const fd = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === "file" && data.file) fd.append("file", data.file);
        else if (key !== "file" && data[key] !== null)
          fd.append(key, data[key]);
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
                  opt.fullNameRaw?.includes(val) ||
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

            <CopyableInput
              label="رقم الرخصة *"
              value={formData.permitNumber}
              onChange={(val) =>
                setFormData({ ...formData, permitNumber: val })
              }
              placeholder="مثال: 1445/1234"
            />

            {/* 💡 حقل السنة أصبح نصياً حراً مع زر نسخ */}
            <CopyableInput
              label="سنة الرخصة"
              type="text"
              value={formData.year}
              onChange={(val) => setFormData({ ...formData, year: val })}
              placeholder="مثال: 1447"
            />

            {/* 💡 القطاع والحي */}
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
                  opt.name?.trim() === val?.trim() || opt.name?.includes(val)
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

            {/* 💡 الحقل الذكي لرقم المخطط */}
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
                  opt.name?.trim() === val?.trim() ||
                  opt.planNumber?.includes(val)
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
              type="number"
              value={formData.landArea}
              onChange={(val) => setFormData({ ...formData, landArea: val })}
              placeholder="المساحة"
            />

            {/* 💡 تقسيم الاستخدام إلى رئيسي وفرعي مع زر نسخ مدمج */}
            <div className="space-y-1">
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                  التصنيف الرئيسي
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
                  التصنيف الفرعي
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

            {/* 💡 حقل ذكي للمكتب الهندسي */}
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
                  opt.nameAr?.includes(val) || opt.nameEn?.includes(val)
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

            {/* باقي الحقول (Select) */}
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

          {/* 💡 منطقة رفع الملف */}
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
