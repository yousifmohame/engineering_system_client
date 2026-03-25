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
} from "lucide-react";

// ==========================================
// 💡 مكون الحقل الذكي للربط (نفس المستخدم في الذكاء الاصطناعي)
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
        <label className="text-[11px] font-bold text-slate-500">{label}</label>
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
          className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-[11px] font-bold text-slate-700 outline-none transition-all ${
            value && isLinked
              ? "border-emerald-300 focus:ring-1 focus:ring-emerald-400 bg-white"
              : "border-slate-200 focus:ring-1 focus:ring-blue-400 focus:bg-white"
          }`}
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
  // 💡 1. جلب البيانات للدروب داون والتحقق (نفس لوجيك الـ AI)
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

  // تفكيك الأحياء
  const flatDistricts = useMemo(() => {
    let all = [];
    districtsTree.forEach((s) => {
      if (s.neighborhoods) {
        const mapped = s.neighborhoods.map((n) => ({
          ...n,
          sectorName: s.name,
        }));
        all = [...all, ...mapped];
      }
    });
    return all;
  }, [districtsTree]);

  // ==========================================
  // 💡 2. عمليات الإضافة السريعة (Mutations)
  // ==========================================
  const quickAddClient = useMutation({
    mutationFn: async (clientData) => await api.post("/clients", clientData),
    onSuccess: () => {
      toast.success("تمت إضافة العميل بنجاح!");
      queryClient.invalidateQueries(["clients-simple"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "فشل إضافة العميل."),
  });

  const quickAddDistrict = useMutation({
    mutationFn: async (districtData) =>
      await api.post("/riyadh-streets/districts", districtData),
    onSuccess: () => {
      toast.success("تمت إضافة الحي بنجاح!");
      queryClient.invalidateQueries(["districts-tree-list"]);
    },
    onError: () => toast.error("فشل إضافة الحي."),
  });

  const quickAddOffice = useMutation({
    mutationFn: async (officeData) =>
      await api.post("/intermediary-offices", officeData),
    onSuccess: () => {
      toast.success("تمت إضافة المكتب بنجاح!");
      queryClient.invalidateQueries(["offices-list"]);
    },
    onError: () => toast.error("فشل إضافة المكتب."),
  });

  // ==========================================
  // 💡 3. حالة الفورم (Form State)
  // ==========================================
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
    usage: "سكني",
    engineeringOffice: "",
    source: "يدوي",
    notes: "",
    file: null,
  });

  useEffect(() => {
    if (mode === "edit" && permitData) {
      setFormData({
        ...permitData,
        landArea: permitData.landArea || "",
        notes: permitData.notes || "",
        file: null,
      });
    }
  }, [mode, permitData]);

  // تحديث القطاع تلقائياً عند تغيير الحي
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

      if (mode === "edit") {
        return await api.put(`/permits/${permitData.id}`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        return await api.post("/permits", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
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
      return toast.error("يرجى إدخال رقم الرخصة واسم المالك");
    saveMutation.mutate(formData);
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
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
            {/* 💡 الحقل الذكي للعميل (المالك) */}
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
                onQuickAdd={() => {
                  const randomMobile = `0500${Math.floor(100000 + Math.random() * 900000)}`;
                  const randomId = `TMP-${Math.floor(10000 + Math.random() * 90000)}`;
                  quickAddClient.mutate({
                    name: JSON.stringify({ ar: formData.ownerName }),
                    officialNameAr: formData.ownerName,
                    idNumber: formData.idNumber || randomId,
                    type: "individual",
                    mobile: randomMobile,
                  });
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                رقم الهوية
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) =>
                  setFormData({ ...formData, idNumber: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
                placeholder="10 أرقام"
                dir="ltr"
                style={{ textAlign: "right" }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                رقم الرخصة *
              </label>
              <input
                type="text"
                value={formData.permitNumber}
                onChange={(e) =>
                  setFormData({ ...formData, permitNumber: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
                placeholder="مثال: 1445/1234"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                سنة الرخصة
              </label>
              <select
                value={formData.year}
                onChange={(e) =>
                  setFormData({ ...formData, year: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
              >
                {[1446, 1445, 1444, 1443, 1442, 1441, 1440].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                نوع الرخصة
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
              >
                {[
                  "بناء جديد",
                  "ترميم",
                  "إضافة",
                  "هدم وإعادة بناء",
                  "تعديل",
                  "سور",
                  "تمديد",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* 💡 الحقل الذكي للحي */}
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
                onQuickAdd={() => {
                  const fallbackSector = sectors[0]?.id;
                  if (!fallbackSector)
                    return toast.error("لا توجد قطاعات مسجلة!");
                  quickAddDistrict.mutate({
                    name: formData.district,
                    sectorId: fallbackSector,
                  });
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                القطاع (تلقائي)
              </label>
              <input
                type="text"
                value={formData.sector}
                readOnly
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-100 text-slate-500 cursor-not-allowed"
                placeholder="يحدد تلقائياً حسب الحي"
              />
            </div>

            {/* 💡 الحقل الذكي للمكتب الهندسي */}
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
                onQuickAdd={() => {
                  quickAddOffice.mutate({
                    nameAr: formData.engineeringOffice,
                    nameEn: formData.engineeringOffice,
                    phone: "0500000000",
                    commercialRegister: "0000000000",
                    city: "الرياض",
                    status: "نشط",
                  });
                }}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                رقم القطعة
              </label>
              <input
                type="text"
                value={formData.plotNumber}
                onChange={(e) =>
                  setFormData({ ...formData, plotNumber: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
                placeholder="رقم القطعة"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                رقم المخطط
              </label>
              <input
                type="text"
                value={formData.planNumber}
                onChange={(e) =>
                  setFormData({ ...formData, planNumber: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
                placeholder="رقم المخطط"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                مساحة الأرض (م²)
              </label>
              <input
                type="number"
                value={formData.landArea}
                onChange={(e) =>
                  setFormData({ ...formData, landArea: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
                placeholder="المساحة"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 block">
                الاستخدام
              </label>
              <select
                value={formData.usage}
                onChange={(e) =>
                  setFormData({ ...formData, usage: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
              >
                {[
                  "سكني",
                  "تجاري",
                  "سكني تجاري",
                  "مكتبي",
                  "صناعي",
                  "تعليمي",
                  "صحي",
                ].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
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
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
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
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
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
              <label className="text-[11px] font-bold text-slate-500 block">
                ملاحظات
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white"
                placeholder="ملاحظات إضافية (اختياري)"
              ></textarea>
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
