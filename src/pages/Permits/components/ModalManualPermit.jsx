import React, { useState, useMemo, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios"; // تأكد من مسار الاستيراد
import { toast } from "sonner";
import moment from "moment-hijri";
import {
  Edit3,
  X,
  Link,
  User,
  Briefcase,
  Building,
  FileSignature,
  AlertTriangle,
  Clock,
  CalendarDays,
  CloudUpload,
  Check,
  Loader2,
  Copy
} from "lucide-react";
import {
  SmartLinkedField,
  CopyableInput,
  SearchableDropdown,
} from "./PermitSharedUI"; // الاستيراد من الملف المشترك
import {
  toEnglishNumbers,
  normalizeArabicText,
  normalizePlan,
  copyToClipboard,
} from "../utils/permitHelpers"; // المساعدات

export function ModalManualPermit({
  mode = "add",
  permitData = null,
  onClose,
  fixedOffice,
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
      const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
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

        {/* 💡 أزرار الربط */}
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
        <div className="flex-1 overflow-auto p-6 custom-scrollbar-slim bg-[#fafbfc]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SmartLinkedField
                label="اسم المالك (العميل) *"
                value={formData.ownerName}
                linkedId={formData.linkedClientId}
                onChange={(val) => {
                  const found = clients.find(
                    (c) => c.name === val || c.idNumber === formData.idNumber,
                  );
                  setFormData({
                    ...formData,
                    ownerName: val,
                    linkedClientId: found ? found.id : "",
                  });
                }}
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
                linkedId={formData.linkedDistrictId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    district: val,
                    linkedDistrictId: "",
                  })
                }
                options={flatDistricts}
                listId="manualDistrictsList"
                placeholder={
                  loadingDistricts ? "جاري التحميل..." : "ابحث أو اكتب الحي..."
                }
                matchFn={(opt, val) => {
                  const normOpt = normalizeArabicText(opt.name);
                  const normVal = normalizeArabicText(val);
                  if (!normOpt || !normVal) return false;
                  return normOpt.includes(normVal) || normVal.includes(normOpt);
                }}
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
                linkedId={formData.linkedPlanId}
                onChange={(val) =>
                  setFormData({
                    ...formData,
                    planNumber: val,
                    linkedPlanId: "",
                  })
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
            <CopyableInput
              label="التصنيف الرئيسي"
              value={formData.mainUsage}
              onChange={(val) => setFormData({ ...formData, mainUsage: val })}
              placeholder="مثال: سكني، تجاري"
            />
            <CopyableInput
              label="التصنيف الفرعي"
              value={formData.subUsage}
              onChange={(val) => setFormData({ ...formData, subUsage: val })}
              placeholder="مثال: مستودعات، مكتبي، فيلا"
            />
            <CopyableInput
              label="نوع الطلب"
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
            />
            <CopyableInput
              label="شكل الرخصة (تلقائي)"
              value={formData.form}
              onChange={() => {}}
              disabled={true}
              style={{ backgroundColor: "#f1f5f9", cursor: "not-allowed" }}
            />

            <div className="md:col-span-2">
              <SmartLinkedField
                label="المكتب الهندسي"
                value={formData.engineeringOffice}
                disabled={!!fixedOffice}
                linkedId={formData.linkedOfficeId}
                onChange={(val) => {
                  const found = offices.find(
                    (o) => o.nameAr === val || o.nameEn === val,
                  );
                  setFormData({
                    ...formData,
                    engineeringOffice: val,
                    linkedOfficeId: found ? found.id : "",
                  });
                }}
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
            ) : (
              <Check className="w-4 h-4" />
            )}
            {mode === "add" ? "حفظ وتسجيل السجل" : "اعتماد التعديلات"}
          </button>
        </div>
      </div>
    </div>
  );
}
