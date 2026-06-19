import React, { useState, useRef, useMemo, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import {
  X,
  FileText,
  Edit3,
  Layers,
  MapPin,
  Save,
  Loader2,
  CloudUpload,
  Brain,
  Copy,
  ChevronRight,
  ChevronLeft,
  Sparkles,
} from "lucide-react";

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
        className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-3 animate-in fade-in"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center flex flex-col items-center border border-[#e8dcc8] relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-1.5 text-slate-400 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 bg-[#edf2f4] rounded-full flex items-center justify-center mb-5">
            <Brain className="w-8 h-8 text-[#0f3d50]" />
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
            className={`w-full border-2 border-dashed rounded-xl p-8 mb-6 cursor-pointer transition-colors ${file ? "border-emerald-300 bg-emerald-50" : "border-[#e8dcc8] bg-slate-50 hover:bg-[#f4f7f8]"}`}
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
                <CloudUpload className="w-10 h-10 text-[#6f8494] mx-auto mb-2" />
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
              className="flex-1 py-3 bg-[#0f3d50] text-white font-bold rounded-xl hover:bg-[#12495f] flex items-center justify-center gap-2"
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
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-3 animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full flex flex-col border border-[#e8dcc8] max-h-[95vh]">
        <div className="flex items-center justify-between px-6 py-3 border-b border-[#d7b96d]/40 bg-gradient-to-l from-[#0f3d50] to-[#1a7d89] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-[#0f3d50]" />
            <div>
              <h3 className="font-black text-[#123B5D] text-base">
                المراجعة والربط الذكي
              </h3>
              <p className="text-[11px] text-[#0f3d50] font-bold mt-0.5">
                اللون الأخضر يعني أن الذكاء الاصطناعي وجد تطابقاً في قاعدة
                البيانات!
              </p>
            </div>
          </div>

          {permits.length > 1 && (
            <div className="flex items-center gap-4 bg-white px-3 py-1.5 rounded-lg border border-[#e8dcc8] shadow-sm">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
              <span className="text-xs font-bold text-[#123B5D]">
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
            className="p-2 hover:bg-white rounded-lg text-[#6f8494] hover:text-[#0f3d50]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-[#fafbfc] custom-scrollbar-slim space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Edit3 className="w-4 h-4 text-[#0f3d50]" /> المعلومات الأساسية
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
                      className="text-slate-400 hover:text-[#123B5D]"
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
              className="px-8 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-[#123B5D] flex items-center justify-center gap-2 shadow-md shadow-[#0f3d50]/20 text-sm transition-all disabled:opacity-50"
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
