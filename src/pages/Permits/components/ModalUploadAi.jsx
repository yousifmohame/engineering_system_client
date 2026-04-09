import React, { useState, useMemo, useRef, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";
import moment from "moment-hijri";
import {
  X,
  Brain,
  CloudUpload,
  FileText,
  Sparkles,
  Loader2,
  Link,
  User,
  Briefcase,
  Building,
  FileSignature,
  Edit3,
  ChevronRight,
  ChevronLeft,
  Save,
  Layers,
  MapPin,
  AlertTriangle,
  Copy,
  Eye,
} from "lucide-react";
import {
  SmartLinkedField,
  CopyableInput,
  SearchableDropdown,
} from "./PermitSharedUI";
import {
  toEnglishNumbers,
  normalizeArabicText,
  normalizePlan,
  copyToClipboard,
} from "../utils/permitHelpers";

export function ModalUploadAi({ onClose, fixedOffice }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // 👈 حالة لحفظ رابط معاينة الملف
  const [permits, setPermits] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [linkingMode, setLinkingMode] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");

  // 💡 إنشاء رابط مؤقت لمعاينة الملف عند اختياره
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      // تنظيف الرابط من الذاكرة عند إغلاق المكون أو تغيير الملف
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

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
        engineeringOffice: fixedOffice || p.engineeringOffice || "",
        notes: p.notes || "",
        detailedReport: p.detailedReport || "",
        componentsData: p.componentsData || [],
        boundariesData: p.boundariesData || [],
        source: "رفع يدوي (AI)",
        linkedClientId: p.linkedClientId || "",
        linkedOfficeId: p.linkedOfficeId || "",
        linkedDistrictId: p.linkedDistrictId || "",
        linkedPlanId: p.linkedPlanId || "",
        linkedOwnershipId: "",
        linkedTransactionId: "",
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
          } else if (
            permit[key] !== null &&
            permit[key] !== undefined &&
            permit[key] !== ""
          ) {
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
    if (linkedFieldToClear) updated[currentIndex][linkedFieldToClear] = "";
    setPermits(updated);
  };

  const updateTableData = (table, index, field, value) => {
    const updated = [...permits];
    updated[currentIndex][table][index][field] = toEnglishNumbers(value);
    setPermits(updated);
  };

  const handleApplyLink = () => {
    if (!selectedValue) return toast.error("يرجى اختيار السجل من القائمة");
    const updated = [...permits];
    if (linkingMode === "client")
      updated[currentIndex].linkedClientId = selectedValue;
    if (linkingMode === "office")
      updated[currentIndex].linkedOfficeId = selectedValue;
    if (linkingMode === "ownership")
      updated[currentIndex].linkedOwnershipId = selectedValue;
    if (linkingMode === "privateTransaction")
      updated[currentIndex].linkedTransactionId = selectedValue;
    setPermits(updated);
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
                <div className="text-[10px] font-bold text-slate-400 mt-1">
                  يدعم PDF, JPG, PNG
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-2 animate-in fade-in"
      dir="rtl"
    >
      {/* Container widened to w-[98vw] to fit split screen nicely */}
      <div className="bg-white rounded-2xl shadow-2xl w-[98vw] max-w-[1600px] flex flex-col border border-purple-200 max-h-[96vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-purple-100 bg-purple-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            <div>
              <h3 className="font-black text-purple-900 text-base">
                المراجعة والربط الذكي
              </h3>
              <p className="text-[11px] text-purple-600 font-bold mt-0.5">
                قم بتأكيد البيانات وتصحيحها من المستند المرفق
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

        {/* أزرار الربط العلوية */}
        <div className="bg-slate-50 p-3 border-b border-slate-200 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-slate-600 ml-2">
              <Link size={14} className="inline mr-1 text-blue-500" /> إضافة
              ارتباط للرخصة:
            </span>
            {!current.linkedClientId && (
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
            {!current.linkedOfficeId && (
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
            {!current.linkedOwnershipId && (
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
            {!current.linkedTransactionId && (
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
            <div className="mt-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2">
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
                  className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
                >
                  اختيار وربط
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

          <div className="flex flex-wrap gap-2 mt-2">
            {current.linkedClientId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-200">
                <User size={12} /> عميل:{" "}
                {clients.find((c) => c.id === current.linkedClientId)?.name ||
                  "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedClientId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {current.linkedOfficeId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Briefcase size={12} /> مكتب:{" "}
                {offices.find((o) => o.id === current.linkedOfficeId)?.nameAr ||
                  "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedOfficeId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {current.linkedOwnershipId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-200">
                <Building size={12} /> ملكية:{" "}
                {ownerships.find((o) => o.id === current.linkedOwnershipId)
                  ?.deedNumber || "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedOwnershipId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
            {current.linkedTransactionId && (
              <span className="flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-[10px] font-bold border border-emerald-200">
                <FileSignature size={12} /> معاملة:{" "}
                {privateTransactions.find(
                  (t) => t.id === current.linkedTransactionId,
                )?.ref || "مربوط"}
                <button
                  onClick={() => updateCurrentPermit("linkedTransactionId", "")}
                  className="text-emerald-500 hover:text-red-500 ml-1"
                >
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        </div>

        {/* 🚀 Main Split Screen Area */}
        <div className="flex-1 flex overflow-hidden bg-[#fafbfc]">
          {/* اليمين: البيانات المستخرجة (60%) */}
          <div className="w-[60%] flex flex-col overflow-y-auto p-4 custom-scrollbar-slim">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-5">
              <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Edit3 className="w-4 h-4 text-blue-500" /> البيانات المستخرجة
              </h4>

              {/* شبكة مدخلات البيانات الأساسية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-4">
                <div className="lg:col-span-2">
                  <SmartLinkedField
                    label="اسم المالك (العميل) *"
                    value={current.ownerName}
                    linkedId={current.linkedClientId}
                    onChange={(val) => {
                      const found = clients.find(
                        (c) =>
                          c.name === val || c.idNumber === current.idNumber,
                      );
                      updateCurrentPermit("ownerName", val, "linkedClientId");
                      if (found)
                        updateCurrentPermit("linkedClientId", found.id);
                    }}
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

                <div className="space-y-1 relative">
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[11px] font-bold text-slate-500 flex items-center gap-2">
                      رقم الرخصة *{" "}
                      {isDuplicatePermit && (
                        <span className="flex items-center gap-1 bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[9px] border border-amber-300 shadow-sm animate-pulse">
                          <AlertTriangle size={10} /> مكرر
                        </span>
                      )}{" "}
                      <button
                        onClick={() => copyToClipboard(current.permitNumber)}
                        className="text-slate-400 hover:text-blue-600 transition-colors"
                        title="نسخ المحتوى"
                      >
                        <Copy size={12} />
                      </button>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={current.permitNumber}
                    onChange={(e) =>
                      updateCurrentPermit("permitNumber", e.target.value)
                    }
                    placeholder="مثال: 1445/1234"
                    dir="rtl"
                    className={`w-full text-[11px] font-bold border rounded-lg px-3 py-2 outline-none focus:ring-1 transition-colors ${isDuplicatePermit ? "bg-amber-50 border-amber-300 focus:ring-amber-400 text-amber-900" : "bg-slate-50 border-slate-200 text-slate-700 focus:ring-blue-400 focus:bg-white"}`}
                  />
                  {isDuplicatePermit && (
                    <div className="absolute top-[100%] left-0 right-0 mt-1 z-10 bg-amber-50 border border-amber-200 rounded-lg p-2.5 shadow-lg text-[10px] leading-relaxed animate-in fade-in zoom-in-95">
                      <div className="font-bold text-amber-800 mb-1 flex items-center gap-1">
                        <AlertTriangle size={12} className="text-amber-600" />{" "}
                        هذا الرقم مسجل في النظام مسبقاً!
                      </div>
                    </div>
                  )}
                </div>

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
                  label="سنة الرخصة"
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
                    matchFn={(opt, val) => {
                      const normOpt = normalizeArabicText(opt.name);
                      const normVal = normalizeArabicText(val);
                      if (!normOpt || !normVal) return false;
                      return (
                        normOpt.includes(normVal) || normVal.includes(normOpt)
                      );
                    }}
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
                  label="شكل الرخصة"
                  value={current.form}
                  onChange={() => {}}
                  disabled={true}
                  style={{ backgroundColor: "#f1f5f9" }}
                />

                <div className="md:col-span-2">
                  <SmartLinkedField
                    label="المكتب الهندسي"
                    value={current.engineeringOffice}
                    disabled={!!fixedOffice}
                    linkedId={current.linkedOfficeId}
                    onChange={(val) => {
                      const found = offices.find(
                        (o) => o.nameAr === val || o.nameEn === val,
                      );
                      updateCurrentPermit(
                        "engineeringOffice",
                        val,
                        "linkedOfficeId",
                      );
                      if (found)
                        updateCurrentPermit("linkedOfficeId", found.id);
                    }}
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

                <div className="sm:col-span-2 lg:col-span-3 mt-1">
                  <CopyableInput
                    label="ملاحظات / اشتراطات"
                    value={current.notes}
                    onChange={(val) => updateCurrentPermit("notes", val)}
                    placeholder="ملاحظات إضافية"
                  />
                </div>
              </div>
            </div>

            {/* الجداول (المكونات والحدود) تُعرض عمودياً لتناسب عرض 60% */}
            <div className="space-y-5 mb-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <h4 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" /> تفاصيل
                  المكونات
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

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
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

          {/* اليسار: معاينة المستند المرفوع (40%) */}
          <div className="w-[40%] flex flex-col border-r border-slate-300 bg-slate-200 relative">
            <div className="px-4 py-2.5 bg-slate-800 text-white flex justify-between items-center shrink-0 shadow-md z-10">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Eye size={14} className="text-blue-400" /> معاينة المستند
                للمطابقة
              </h3>
              {file && (
                <span className="text-[9px] font-mono bg-slate-700 px-2 py-1 rounded border border-slate-600 truncate max-w-[150px]">
                  {file.name}
                </span>
              )}
            </div>
            <div className="flex-1 p-2 overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                file?.type.includes("pdf") ? (
                  <iframe
                    src={`${previewUrl}#view=FitH&toolbar=0`}
                    className="w-full h-full rounded border border-slate-300 bg-white shadow-inner"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="w-full h-full overflow-auto flex items-center justify-center bg-slate-100 rounded border border-slate-300 shadow-inner p-2 custom-scrollbar">
                    <img
                      src={previewUrl}
                      className="max-w-full h-auto object-contain shadow-sm"
                      alt="Preview"
                    />
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <span className="text-xs font-bold">
                    جاري تحميل المعاينة...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
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
