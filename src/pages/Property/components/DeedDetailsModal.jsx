import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDeedById, updateDeed } from "../../../api/propertyApi";
import {
  X,
  Home,
  Sparkles,
  FileText,
  Map as MapIcon,
  Users,
  Camera,
  Paperclip,
  CheckCircle2,
  Maximize2,
  AlertTriangle,
  RefreshCw,
  Upload,
  Download,
  Plus,
  Ruler,
  Image as ImageIcon,
  Save,
  Trash2,
  Loader2,
  Rocket,
  Compass,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { analyzeDeedWithAI } from "../../../api/propertyApi"; // استيراد الدالة

// --- دالة تحويل الملفات إلى Base64 (لحفظ الصور محلياً في JSON) ---
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

const getSafeClientName = (client) => {
  if (!client) return "غير محدد";
  const name = client.name;
  if (!name) return "غير محدد";
  if (typeof name === "string") return name;
  if (name.ar) return name.ar;
  if (typeof name === "object")
    return [
      name.firstName,
      name.fatherName,
      name.grandFatherName,
      name.familyName,
    ]
      .filter(Boolean)
      .join(" ");
  return "اسم غير معروف";
};

const DeedDetailsModal = ({ isOpen, deedId, onClose }) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("ai"); // جعلت الـ AI هو الافتراضي للتجربة
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleAiUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("الرجاء اختيار ملف صورة أو PDF صالح.");
      return;
    }

    try {
      setAiAnalyzing(true);
      setAiResult(null);

      const base64Image = await convertToBase64(file);

      toast.info(
        "جاري تحليل الوثيقة بالذكاء الاصطناعي... قد يستغرق ذلك ثواني.",
      );

      const extractedData = await analyzeDeedWithAI(base64Image);

      setAiResult(extractedData);
      toast.success("تم استخراج البيانات بنجاح!");
    } catch (error) {
      toast.error(error.message || "حدث خطأ أثناء التحليل");
    } finally {
      setAiAnalyzing(false);
      e.target.value = ""; // مسح الملف لتمكين اختيار نفس الملف مجدداً
    }
  };

  const handleConfirmAiData = () => {
    if (!aiResult) return;

    // 1. تحديث المصفوفات (القطع، الملاك، الحدود) محلياً
    setLocalData((prev) => ({
      ...prev,

      // إضافة كل القطع المستخرجة (يدعم تعدد العقارات)
      plots: [
        ...prev.plots,
        ...(aiResult.plots || []).map((plot, i) => ({
          id: Date.now() + i,
          plotNumber: plot.plotNumber || "",
          planNumber:
            plot.planNumber || aiResult.locationInfo?.planNumber || "",
          area: plot.area || "",
          district: aiResult.locationInfo?.district || "",
          notes: `${plot.propertyType || ""} - ${plot.usageType || ""}`,
        })),
      ],

      // إضافة الملاك
      owners: [
        ...prev.owners,
        ...(aiResult.owners || []).map((o, i) => ({
          id: Date.now() + i + 100,
          name: o.name,
          idNumber: o.identityNumber,
          share: o.sharePercentage || 100,
          role: "مالك",
        })),
      ],

      // إضافة الحدود
      boundaries: [
        // في حال كان هناك حدود قديمة، نحذفها ونضع الجديدة لتجنب التكرار
        ...(aiResult.boundaries || []).map((b, i) => ({
          id: Date.now() + i + 200,
          direction: b.direction,
          length: b.length,
          description: b.description,
        })),
      ],

      // إضافة الوثيقة نفسها إلى تاب الوثائق تلقائياً
      documents: [
        ...prev.documents,
        {
          id: Date.now() + 300,
          number: aiResult.documentInfo?.documentNumber || "",
          date: aiResult.documentInfo?.gregorianDate || "",
          type: aiResult.documentInfo?.documentType || "صك ملكية",
          area: aiResult.propertySpecs?.totalArea || 0,
        },
      ],
    }));

    // 2. إعداد الحقول الأساسية (Root Fields) لإرسالها لقاعدة البيانات
    setLocalData((prev) => ({
      ...prev,
      area: aiResult.propertySpecs?.totalArea || prev.area,
      city: aiResult.locationInfo?.city || prev.city,
      district: aiResult.locationInfo?.district || prev.district,
      planNumber: aiResult.locationInfo?.planNumber || prev.planNumber,
    }));

    toast.success(
      "تم نقل جميع البيانات بنجاح (بما في ذلك القطع المتعددة)! تذكر الضغط على (حفظ التعديلات الان).",
    );
    setHasChanges(true);
    setAiResult(null); // إخفاء النتائج بعد التأكيد
  };

  // --- حالة البيانات المحلية (التي يتم التعديل عليها) ---
  const [localData, setLocalData] = useState({
    documents: [],
    plots: [],
    owners: [],
    boundaries: [],
    attachments: [],
  });

  // --- حالة التتبع: هل يوجد تغييرات تستدعي الحفظ؟ ---
  const [hasChanges, setHasChanges] = useState(false);

  // --- حالات النماذج المصغرة (للإضافة) ---
  const [showDocForm, setShowDocForm] = useState(false);
  const [newDoc, setNewDoc] = useState({
    number: "",
    date: "",
    type: "صك ملكية",
  });

  const [showPlotForm, setShowPlotForm] = useState(false);
  const [newPlot, setNewPlot] = useState({
    plotNumber: "",
    planNumber: "",
    area: "",
    notes: "",
  });

  const [showOwnerForm, setShowOwnerForm] = useState(false);
  const [newOwner, setNewOwner] = useState({
    name: "",
    idNumber: "",
    share: "",
    role: "مالك",
  });

  // جلب البيانات من السيرفر
  const { data: response, isLoading } = useQuery({
    queryKey: ["deedDetails", deedId],
    queryFn: () => getDeedById(deedId),
    enabled: !!deedId && isOpen,
  });

  const deed = response?.data || {};

  // عند تحميل البيانات من السيرفر، نقوم بنسخها للحالة المحلية
  useEffect(() => {
    if (isOpen && deed.id) {
      setLocalData({
        documents: Array.isArray(deed.documents) ? deed.documents : [],
        plots: Array.isArray(deed.plots) ? deed.plots : [],
        owners: Array.isArray(deed.owners) ? deed.owners : [],
        boundaries: Array.isArray(deed.boundaries) ? deed.boundaries : [],
        attachments: Array.isArray(deed.attachments) ? deed.attachments : [],
      });
      setHasChanges(false);
      setActiveTab("ai"); // إرجاعها إلى summary أو ai حسب رغبتك
    }
  }, [isOpen, deed.id]);

  const triggerChange = () => setHasChanges(true);

  // دوال الإضافة والحذف
  const handleAddDoc = () => {
    if (!newDoc.number) return toast.error("رقم الوثيقة مطلوب");
    setLocalData((prev) => ({
      ...prev,
      documents: [...prev.documents, { ...newDoc, id: Date.now() }],
    }));
    setNewDoc({ number: "", date: "", type: "صك ملكية" });
    setShowDocForm(false);
    triggerChange();
  };

  const handleAddPlot = () => {
    if (!newPlot.plotNumber || !newPlot.area)
      return toast.error("رقم القطعة والمساحة مطلوبان");
    setLocalData((prev) => ({
      ...prev,
      plots: [...prev.plots, { ...newPlot, id: Date.now() }],
    }));
    setNewPlot({ plotNumber: "", planNumber: "", area: "", notes: "" });
    setShowPlotForm(false);
    triggerChange();
  };

  const handleAddOwner = () => {
    if (!newOwner.name || !newOwner.share)
      return toast.error("الاسم ونسبة التملك مطلوبان");
    setLocalData((prev) => ({
      ...prev,
      owners: [...prev.owners, { ...newOwner, id: Date.now() }],
    }));
    setNewOwner({ name: "", idNumber: "", share: "", role: "مالك" });
    setShowOwnerForm(false);
    triggerChange();
  };

  const handleAttachmentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    const attachment = {
      id: Date.now(),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB",
      type: file.type,
      dataUrl: base64,
    };
    setLocalData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, attachment],
    }));
    triggerChange();
    e.target.value = "";
  };

  const handleUpdateBoundary = (direction, field, value) => {
    setLocalData((prev) => {
      const existing = prev.boundaries.filter((b) => b.direction !== direction);
      const current = prev.boundaries.find(
        (b) => b.direction === direction,
      ) || {
        id: Date.now(),
        direction,
        length: 0,
        description: "",
        imageUrl: null,
      };
      return {
        ...prev,
        boundaries: [...existing, { ...current, [field]: value }],
      };
    });
    triggerChange();
  };

  const handleBoundaryImageUpload = async (direction, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    handleUpdateBoundary(direction, "imageUrl", base64);
    e.target.value = "";
  };

  const handleBoundaryUpload = async (direction, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setLocalData((prev) => {
      const existing = prev.boundaries.filter((b) => b.direction !== direction);
      return {
        ...prev,
        boundaries: [
          ...existing,
          {
            id: Date.now(),
            direction,
            imageUrl: base64,
            length: 0,
            description: "تم تحديث الصورة",
          },
        ],
      };
    });
    triggerChange();
    e.target.value = "";
  };

  const handleDeleteItem = (listName, id) => {
    setLocalData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((item) => item.id !== id),
    }));
    triggerChange();
  };

  const updateMutation = useMutation({
    mutationFn: updateDeed,
    onSuccess: () => {
      toast.success("تم حفظ التعديلات في قاعدة البيانات بنجاح!");
      setHasChanges(false);
      queryClient.invalidateQueries(["deedDetails", deedId]);
      queryClient.invalidateQueries(["deeds"]);
    },
    onError: (err) => toast.error("فشل الحفظ: " + err.message),
  });

  const saveChangesToDB = () =>
    updateMutation.mutate({ id: deedId, data: localData });

  if (!isOpen) return null;

  const safeName = getSafeClientName(deed?.client);
  const plotsCount = localData.plots.length;
  const docsCount = localData.documents.length;
  const ownersCount = localData.owners.length;

  const tabs = [
      { id: "docs", label: "الوثائق", icon: FileText },
      { id: "plots", label: "القطع", icon: MapIcon },
      { id: "owners", label: "الملاك", icon: Users },
      { id: "bounds", label: "الحدود والصور", icon: Ruler },
      { id: "attachments", label: "المرفقات", icon: Paperclip },
      { id: "ai", label: "استخراج بيانات الوثيقة AI", icon: Sparkles },
      { id: "summary", label: "ملخص", icon: Home },
  ];

  const getBound = (dir) =>
    localData.boundaries.find((b) => b.direction === dir) || {
      length: "",
      description: "",
    };
  const north = getBound("شمال");
  const south = getBound("جنوب");
  const east = getBound("شرق");
  const west = getBound("غرب");

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-lg w-full max-w-[1400px] h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* --- زر الحفظ العائم --- */}
        <div
          className={`absolute bottom-6 left-6 z-50 transition-all duration-500 transform ${hasChanges ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}
        >
          <button
            onClick={saveChangesToDB}
            disabled={updateMutation.isPending}
            className="px-6 py-3 bg-green-600 text-white rounded-full font-bold shadow-[0_10px_25px_rgba(22,163,74,0.4)] hover:bg-green-700 flex items-center gap-2 hover:scale-105 transition-all"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            حفظ التعديلات الان
          </button>
        </div>

        {/* === Header === */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-4 flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className="text-lg font-bold">
                {isLoading ? "جاري التحميل..." : safeName}
              </h3>
              <p className="text-sm text-green-100 font-mono">
                {deed.code || "---"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="bg-white/10 rounded p-2">
              <span className="text-green-200">المساحة:</span>
              <p className="font-bold">{deed.area || 0} م²</p>
            </div>
            <div className="bg-white/10 rounded p-2">
              <span className="text-green-200">القطع:</span>
              <p className="font-bold">{plotsCount}</p>
            </div>
            <div className="bg-white/10 rounded p-2">
              <span className="text-green-200">الوثائق:</span>
              <p className="font-bold">{docsCount}</p>
            </div>
            <div className="bg-white/10 rounded p-2">
              <span className="text-green-200">الملاك:</span>
              <p className="font-bold">{ownersCount}</p>
            </div>
          </div>
        </div>

        {/* === شريط التابات === */}
        <div className="border-b border-stone-300 bg-stone-50 flex-shrink-0 pt-2 px-3 overflow-x-auto shadow-sm z-10 flex flex-row justify-start">
          <div className="flex gap-1 min-w-max flex-row-reverse">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-bold rounded-t-lg flex items-center gap-2 transition-all flex-row-reverse ${
                  activeTab === tab.id
                    ? "bg-white text-green-700 border-t-2 border-x border-green-600 relative top-[1px]"
                    : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" /> {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* === محتوى التابات === */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-400">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p>جاري التحميل...</p>
            </div>
          ) : (
            <>
              {/* ======================================================== */}
              {/* 1. تاب استخراج الذكاء الاصطناعي (تم التصميم ليطابق الصورة تماماً) */}
              {/* ======================================================== */}
              {activeTab === "ai" && (
                <div className="animate-in fade-in duration-300 h-full flex flex-col">
                  {/* العنوان العلوي */}
                  <div className="px-6 py-4 border-b border-stone-200 text-right">
                    <h2 className="text-lg font-bold text-stone-800">
                      استخراج بيانات الوثيقة باستخدام الذكاء الاصطناعي
                    </h2>
                  </div>

                  <div className="flex-1 p-6">
                    {/* منطقة الرفع (مطابقة للصورة) */}
                    {!aiAnalyzing && !aiResult && (
                      <div className="max-w-4xl mx-auto border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
                        {/* الهيدر الأبيض */}
                        <div className="px-4 py-3 flex items-center justify-end gap-2 text-blue-800 border-b border-blue-100">
                          <span className="font-bold text-sm">
                            رفع وثيقة جديدة
                          </span>
                          <Upload className="w-4 h-4" />
                        </div>
                        {/* الشريط الأزرق */}
                        <div className="bg-[#1d4ed8] p-3 relative cursor-pointer hover:bg-blue-700 transition-colors">
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleAiUpload}
                          />
                          <div className="flex justify-end items-center text-white text-sm">
                            <span className="mr-2">No file chosen</span>
                            <span className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded font-medium transition-colors">
                              Choose File
                            </span>
                          </div>
                        </div>
                        {/* الفوتر الأزرق الفاتح */}
                        <div className="bg-[#eff6ff] p-3 text-right text-xs text-blue-600 font-medium">
                          يمكن تحليل الوثيقة تلقائياً (QR/نص) بعد الرفع
                        </div>
                      </div>
                    )}

                    {/* حالة التحميل */}
                    {aiAnalyzing && (
                      <div className="max-w-4xl mx-auto bg-stone-50 border-2 border-dashed border-blue-200 rounded-xl p-16 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                        <h4 className="text-base font-bold text-blue-900">
                          جاري قراءة وتحليل الصك... يرجى الانتظار
                        </h4>
                      </div>
                    )}

                    {/* عرض النتائج (قائمة رأسية محاذاة لليمين مطابقة للصورة) */}
                    {/* عرض النتائج */}
                    {aiResult && (
                      <div className="border border-green-200 rounded-xl overflow-hidden bg-[#f4fcf6]">
                        <div className="p-5">
                          <div className="flex items-center justify-between mb-6 border-b border-green-200 pb-3">
                            <h4 className="text-base font-bold text-green-700">
                              تم استخراج البيانات بنجاح
                            </h4>
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          </div>

                          {/* قائمة البيانات المستخرجة */}
                          <div className="space-y-6 text-right pr-2">
                            {/* 1. بيانات الوثيقة الأساسية */}
                            <div>
                              <h5 className="text-sm font-bold text-green-800 mb-3 border-r-4 border-green-500 pr-2">
                                البيانات الأساسية
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg border border-green-50">
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    رقم الوثيقة/العقار:
                                  </span>
                                  <strong className="text-stone-900 font-mono">
                                    {aiResult.documentInfo?.documentNumber ||
                                      "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    نوع الوثيقة:
                                  </span>
                                  <strong className="text-stone-900">
                                    {aiResult.documentInfo?.documentType ||
                                      "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    الجهة المصدرة:
                                  </span>
                                  <strong className="text-stone-900">
                                    {aiResult.documentInfo?.issuingAuthority ||
                                      "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    التاريخ الهجري:
                                  </span>
                                  <strong className="text-stone-900 font-mono">
                                    {aiResult.documentInfo?.hijriDate || "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    التاريخ الميلادي:
                                  </span>
                                  <strong className="text-stone-900 font-mono">
                                    {aiResult.documentInfo?.gregorianDate ||
                                      "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    الهوية العقارية:
                                  </span>
                                  <strong className="text-stone-900 font-mono">
                                    {aiResult.documentInfo?.propertyId || "---"}
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {/* 2. بيانات الموقع والقطع */}
                            <div>
                              <h5 className="text-sm font-bold text-green-800 mb-3 border-r-4 border-green-500 pr-2">
                                المدينة والمساحة
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white p-4 rounded-lg border border-green-50">
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    المدينة:
                                  </span>
                                  <strong className="text-stone-900">
                                    {aiResult.locationInfo?.city || "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    الحي:
                                  </span>
                                  <strong className="text-stone-900">
                                    {aiResult.locationInfo?.district || "---"}
                                  </strong>
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-stone-400 text-xs">
                                    المساحة الإجمالية:
                                  </span>
                                  <strong className="text-green-700 font-bold">
                                    {aiResult.propertySpecs?.totalArea || 0} م²
                                  </strong>
                                </div>
                              </div>
                            </div>

                            {/* عرض القطع المتعددة */}
                            {aiResult.plots && aiResult.plots.length > 0 && (
                              <div>
                                <h5 className="text-sm font-bold text-green-800 mb-3 border-r-4 border-green-500 pr-2">
                                  تفاصيل القطع المستخرجة (
                                  {aiResult.plots.length})
                                </h5>
                                <div className="space-y-2">
                                  {aiResult.plots.map((plot, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-green-50 text-sm"
                                    >
                                      <div>
                                        <span className="text-stone-500 text-xs ml-1">
                                          قطعة رقم:
                                        </span>
                                        <strong className="font-bold text-blue-700">
                                          {plot.plotNumber}
                                        </strong>
                                        <span className="text-stone-300 mx-2">
                                          |
                                        </span>
                                        <span className="text-stone-500 text-xs ml-1">
                                          مخطط:
                                        </span>
                                        <strong className="font-bold">
                                          {plot.planNumber ||
                                            aiResult.locationInfo?.planNumber ||
                                            "---"}
                                        </strong>
                                      </div>
                                      <div className="text-left font-bold text-green-700">
                                        {plot.area} م²
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* 3. بيانات الصفقة السابقة */}
                            {aiResult.previousDocumentInfo
                              ?.previousDocumentNumber && (
                              <div>
                                <h5 className="text-sm font-bold text-green-800 mb-3 border-r-4 border-green-500 pr-2">
                                  معلومات الانتقال والصفقة
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm bg-white p-4 rounded-lg border border-green-50">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-stone-400 text-xs">
                                      الصك السابق:
                                    </span>
                                    <strong className="text-stone-900 font-mono">
                                      {
                                        aiResult.previousDocumentInfo
                                          .previousDocumentNumber
                                      }
                                    </strong>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-stone-400 text-xs">
                                      تاريخه:
                                    </span>
                                    <strong className="text-stone-900 font-mono">
                                      {aiResult.previousDocumentInfo
                                        .previousDocumentDate || "---"}
                                    </strong>
                                  </div>
                                  <div className="flex flex-col gap-1">
                                    <span className="text-stone-400 text-xs">
                                      قيمة الصفقة/الثمن:
                                    </span>
                                    <strong className="text-blue-700 font-bold">
                                      {aiResult.previousDocumentInfo
                                        .transactionValue
                                        ? aiResult.previousDocumentInfo.transactionValue.toLocaleString() +
                                          " ريال"
                                        : "---"}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 4. الملاك والحدود */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* الملاك */}
                              <div className="bg-white p-4 rounded-lg border border-green-50">
                                <h5 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                                  <Users className="w-4 h-4 text-amber-500" />{" "}
                                  الملاك والحصص
                                </h5>
                                <ul className="space-y-2 text-sm">
                                  {aiResult.owners &&
                                  aiResult.owners.length > 0 ? (
                                    aiResult.owners.map((owner, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-start justify-between border-b border-stone-50 pb-2 last:border-0"
                                      >
                                        <div>
                                          <p className="font-bold text-stone-800">
                                            {owner.name}
                                          </p>
                                          <p className="text-[10px] text-stone-500 font-mono">
                                            {owner.identityNumber} |{" "}
                                            {owner.nationality}
                                          </p>
                                        </div>
                                        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-bold">
                                          {owner.sharePercentage}%
                                        </span>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-stone-400 text-xs">
                                      لا يوجد ملاك مستخرجين
                                    </li>
                                  )}
                                </ul>
                              </div>

                              {/* الحدود */}
                              <div className="bg-white p-4 rounded-lg border border-green-50">
                                <h5 className="text-sm font-bold text-stone-700 mb-3 flex items-center gap-2">
                                  <MapIcon className="w-4 h-4 text-blue-500" />{" "}
                                  الحدود والأطوال
                                </h5>
                                <ul className="space-y-2 text-sm">
                                  {aiResult.boundaries &&
                                  aiResult.boundaries.length > 0 ? (
                                    aiResult.boundaries.map((b, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center gap-2 border-b border-stone-50 pb-2 last:border-0"
                                      >
                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs w-12 text-center">
                                          {b.direction}
                                        </span>
                                        <span
                                          className="font-bold text-blue-700 w-12 text-left"
                                          dir="ltr"
                                        >
                                          {b.length}m
                                        </span>
                                        <span
                                          className="text-stone-600 text-xs truncate flex-1"
                                          title={b.description}
                                        >
                                          {b.description}
                                        </span>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-stone-400 text-xs">
                                      لا توجد حدود مستخرجة
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>

                            {/* الملاحظات والثقة */}
                            <div className="flex items-center justify-between bg-stone-50 p-3 rounded text-xs">
                              <span className="text-stone-600 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-purple-500" />{" "}
                                ملاحظات AI:{" "}
                                {aiResult.metadata?.aiNotes || "لا يوجد"}
                              </span>
                              <span className="font-bold text-stone-800">
                                مستوى الثقة:{" "}
                                <span
                                  className={
                                    aiResult.metadata?.confidenceScore > 90
                                      ? "text-green-600"
                                      : "text-amber-500"
                                  }
                                >
                                  {aiResult.metadata?.confidenceScore || 0}%
                                </span>
                              </span>
                            </div>
                          </div>

                          {/* الأزرار بالأسفل */}
                          <div className="px-6 py-4 bg-white border-t border-green-100 flex items-center justify-end gap-3 flex-row-reverse mt-4">
                            <button
                              onClick={handleConfirmAiData}
                              className="bg-[#16a34a] hover:bg-[#15803d] text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shadow-sm"
                            >
                              تأكيد واعتماد البيانات
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setAiResult(null)}
                              className="bg-white border border-stone-300 text-stone-700 hover:bg-stone-50 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors"
                            >
                              إعادة المحاولة
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* باقي التابات */}
              {/* ======================================================== */}
              {activeTab === "summary" && (
                <div className="space-y-4 animate-in fade-in duration-300 p-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
                      <MapIcon className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm font-bold text-blue-900">القطع</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {plotsCount}
                      </p>
                    </div>
                    <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                      <FileText className="w-8 h-8 text-purple-600 mb-2" />
                      <p className="text-sm font-bold text-purple-900">
                        الوثائق
                      </p>
                      <p className="text-3xl font-bold text-purple-700">
                        {docsCount}
                      </p>
                    </div>
                    <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                      <Home className="w-8 h-8 text-green-600 mb-2" />
                      <p className="text-sm font-bold text-green-900">
                        إجمالي المساحة
                      </p>
                      <p className="text-3xl font-bold text-green-700">
                        {deed.area || 0} م²
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                      <Users className="w-8 h-8 text-amber-600 mb-2" />
                      <p className="text-sm font-bold text-amber-900">
                        عدد الملاك
                      </p>
                      <p className="text-3xl font-bold text-amber-700">
                        {ownersCount}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "docs" && (
                <div className="space-y-4 animate-in fade-in duration-300 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800">
                      الوثائق ({docsCount})
                    </h3>
                    <button
                      onClick={() => setShowDocForm(!showDocForm)}
                      className="px-3 py-1.5 text-xs font-bold bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> إضافة وثيقة
                    </button>
                  </div>
                  {showDocForm && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg flex items-end gap-3 animate-in slide-in-from-top-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold block mb-1">
                          رقم الوثيقة
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 text-xs border rounded"
                          value={newDoc.number}
                          onChange={(e) =>
                            setNewDoc({ ...newDoc, number: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold block mb-1">
                          التاريخ
                        </label>
                        <input
                          type="date"
                          className="w-full p-2 text-xs border rounded"
                          value={newDoc.date}
                          onChange={(e) =>
                            setNewDoc({ ...newDoc, date: e.target.value })
                          }
                        />
                      </div>
                      <button
                        onClick={handleAddDoc}
                        className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded hover:bg-green-700"
                      >
                        حفظ مؤقت
                      </button>
                    </div>
                  )}
                  <div className="bg-white border border-stone-300 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-purple-100">
                        <tr>
                          <th className="px-4 py-2.5 font-bold">رقم الوثيقة</th>
                          <th className="px-4 py-2.5 font-bold">التاريخ</th>
                          <th className="px-4 py-2.5 font-bold text-center">
                            إجراءات
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {localData.documents.map((doc) => (
                          <tr key={doc.id} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-mono font-bold">
                              {doc.number}
                            </td>
                            <td className="px-4 py-3 font-mono">{doc.date}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() =>
                                  handleDeleteItem("documents", doc.id)
                                }
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "plots" && (
                <div className="space-y-4 animate-in fade-in duration-300 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800">
                      القطع المرتبطة ({plotsCount})
                    </h3>
                    <button
                      onClick={() => setShowPlotForm(!showPlotForm)}
                      className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> إضافة قطعة
                    </button>
                  </div>
                  {showPlotForm && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg grid grid-cols-4 items-end gap-3 animate-in slide-in-from-top-2">
                      <div>
                        <label className="text-xs font-bold block mb-1">
                          رقم القطعة
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 text-xs border rounded"
                          value={newPlot.plotNumber}
                          onChange={(e) =>
                            setNewPlot({
                              ...newPlot,
                              plotNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">
                          المخطط
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 text-xs border rounded"
                          value={newPlot.planNumber}
                          onChange={(e) =>
                            setNewPlot({
                              ...newPlot,
                              planNumber: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">
                          المساحة
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 text-xs border rounded"
                          value={newPlot.area}
                          onChange={(e) =>
                            setNewPlot({ ...newPlot, area: e.target.value })
                          }
                        />
                      </div>
                      <button
                        onClick={handleAddPlot}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 h-8"
                      >
                        إضافة
                      </button>
                    </div>
                  )}
                  <div className="space-y-2">
                    {localData.plots.map((plot) => (
                      <div
                        key={plot.id}
                        className="bg-white border border-stone-300 rounded-lg p-3 flex justify-between items-center"
                      >
                        <div className="flex gap-6 text-xs">
                          <div>
                            <span className="text-stone-500 block">
                              رقم القطعة:
                            </span>
                            <p className="font-bold text-sm">
                              {plot.plotNumber}
                            </p>
                          </div>
                          <div>
                            <span className="text-stone-500 block">
                              رقم المخطط:
                            </span>
                            <p className="font-bold text-sm">
                              {plot.planNumber}
                            </p>
                          </div>
                          <div>
                            <span className="text-stone-500 block">
                              المساحة:
                            </span>
                            <p className="font-bold text-green-700 text-sm">
                              {plot.area} م²
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteItem("plots", plot.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "owners" && (
                <div className="space-y-4 animate-in fade-in duration-300 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-stone-800">
                      الملاك والحصص ({ownersCount})
                    </h3>
                    <button
                      onClick={() => setShowOwnerForm(!showOwnerForm)}
                      className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded hover:bg-amber-700 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> إضافة مالك
                    </button>
                  </div>
                  {showOwnerForm && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg grid grid-cols-4 items-end gap-3 animate-in slide-in-from-top-2">
                      <div className="col-span-2">
                        <label className="text-xs font-bold block mb-1">
                          الاسم
                        </label>
                        <input
                          type="text"
                          className="w-full p-2 text-xs border rounded"
                          value={newOwner.name}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold block mb-1">
                          النسبة %
                        </label>
                        <input
                          type="number"
                          className="w-full p-2 text-xs border rounded"
                          value={newOwner.share}
                          onChange={(e) =>
                            setNewOwner({ ...newOwner, share: e.target.value })
                          }
                        />
                      </div>
                      <button
                        onClick={handleAddOwner}
                        className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded hover:bg-amber-700 h-8"
                      >
                        إضافة
                      </button>
                    </div>
                  )}
                  <div className="bg-white border border-stone-300 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-amber-100">
                        <tr>
                          <th className="px-4 py-2 font-bold">اسم المالك</th>
                          <th className="px-4 py-2 font-bold text-center">
                            النسبة
                          </th>
                          <th className="px-4 py-2 text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {localData.owners.map((owner) => (
                          <tr key={owner.id}>
                            <td className="px-4 py-3 font-bold">
                              {owner.name}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span className="px-3 py-1 rounded-full bg-green-600 text-white font-bold">
                                {owner.share}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() =>
                                  handleDeleteItem("owners", owner.id)
                                }
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "bounds" && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* قسم الكروكي والرسم الهندسي */}
                  <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
                    {/* معلومات الرسم (يمين) */}
                    <div className="w-full md:w-1/3 bg-slate-800 text-white p-6 flex flex-col justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Compass className="w-32 h-32" />
                      </div>
                      <h3 className="text-xl font-bold mb-2 relative z-10">
                        المخطط الكروكي للحدود
                      </h3>
                      <p className="text-slate-300 text-sm mb-6 relative z-10">
                        هذا الرسم التوضيحي يعكس البيانات المدخلة للأطوال
                        والاتجاهات لتسهيل المراجعة الهندسية.
                      </p>
                      <div className="space-y-3 relative z-10">
                        <div className="flex justify-between border-b border-slate-700 pb-1 text-sm">
                          <span className="text-slate-400">
                            إجمالي المساحة:
                          </span>
                          <strong className="text-emerald-400">
                            {deed.area || 0} م²
                          </strong>
                        </div>
                        <div className="flex justify-between border-b border-slate-700 pb-1 text-sm">
                          <span className="text-slate-400">محيط القطعة:</span>
                          <strong>
                            {(
                              parseFloat(north.length || 0) +
                              parseFloat(south.length || 0) +
                              parseFloat(east.length || 0) +
                              parseFloat(west.length || 0)
                            ).toFixed(2)}{" "}
                            م
                          </strong>
                        </div>
                      </div>
                    </div>

                    {/* لوحة الرسم الهندسي (يسار) */}
                    <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-blue-50/50 p-8 flex items-center justify-center min-h-[350px]">
                      <div className="relative w-64 h-64 bg-white border-2 border-blue-500 shadow-xl flex items-center justify-center">
                        {/* الشمال */}
                        <div className="absolute -top-8 left-0 right-0 text-center">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow">
                            شمال: {north.length || 0}م
                          </span>
                          <p
                            className="text-[10px] text-stone-600 mt-1 truncate max-w-[200px] mx-auto"
                            title={north.description}
                          >
                            {north.description || "جار/شارع"}
                          </p>
                        </div>
                        {/* الجنوب */}
                        <div className="absolute -bottom-8 left-0 right-0 text-center">
                          <p
                            className="text-[10px] text-stone-600 mb-1 truncate max-w-[200px] mx-auto"
                            title={south.description}
                          >
                            {south.description || "جار/شارع"}
                          </p>
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow">
                            جنوب: {south.length || 0}م
                          </span>
                        </div>
                        {/* الشرق */}
                        <div className="absolute top-0 bottom-0 -right-8 flex flex-col justify-center text-center w-8">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow rotate-90 origin-center whitespace-nowrap">
                            شرق: {east.length || 0}م
                          </span>
                        </div>
                        {/* الغرب */}
                        <div className="absolute top-0 bottom-0 -left-8 flex flex-col justify-center text-center w-8">
                          <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold shadow -rotate-90 origin-center whitespace-nowrap">
                            غرب: {west.length || 0}م
                          </span>
                        </div>

                        <div className="text-stone-300 font-bold tracking-widest opacity-50 text-xl rotate-45 border-2 border-stone-200 p-2">
                          قطعة الأرض
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* قسم تحرير البيانات التفصيلية للحدود */}
                  <div>
                    <h3 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" /> تفاصيل
                      الحدود والصور من الطبيعة
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {["شمال", "جنوب", "شرق", "غرب"].map((dir) => {
                        const bound = getBound(dir);
                        return (
                          <div
                            key={dir}
                            className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all hover:border-blue-300 hover:shadow-md"
                          >
                            {/* رأس البطاقة */}
                            <div className="bg-slate-50 border-b border-stone-200 p-3 flex justify-between items-center">
                              <h4 className="font-black text-blue-900 text-sm">
                                الحد ال{dir}
                              </h4>
                              <Compass className="w-4 h-4 text-slate-400" />
                            </div>

                            {/* مدخلات البيانات */}
                            <div className="p-4 space-y-3 flex-1">
                              <div>
                                <label className="text-[11px] font-bold text-stone-500 mb-1 block">
                                  الطول (متر)
                                </label>
                                <input
                                  type="number"
                                  className="w-full border border-stone-300 rounded p-2 text-sm font-bold text-blue-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                  value={bound.length}
                                  onChange={(e) =>
                                    handleUpdateBoundary(
                                      dir,
                                      "length",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="مثال: 25"
                                />
                              </div>
                              <div>
                                <label className="text-[11px] font-bold text-stone-500 mb-1 block">
                                  الوصف / المجاور
                                </label>
                                <textarea
                                  className="w-full border border-stone-300 rounded p-2 text-xs text-stone-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all h-16 resize-none"
                                  value={bound.description}
                                  onChange={(e) =>
                                    handleUpdateBoundary(
                                      dir,
                                      "description",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="شارع عرض 15م..."
                                />
                              </div>
                            </div>

                            {/* منطقة الصورة */}
                            <div className="p-3 bg-stone-50 border-t border-stone-100">
                              {bound.imageUrl ? (
                                <div className="relative h-24 rounded border border-stone-300 overflow-hidden group">
                                  <img
                                    src={bound.imageUrl}
                                    alt={dir}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                    <button
                                      onClick={() =>
                                        handleUpdateBoundary(
                                          dir,
                                          "imageUrl",
                                          null,
                                        )
                                      }
                                      className="bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                                      title="حذف الصورة"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group">
                                  <Camera className="w-6 h-6 text-slate-400 mb-1 group-hover:text-blue-500 transition-colors" />
                                  <span className="text-[10px] text-slate-500 font-bold group-hover:text-blue-600">
                                    إرفاق صورة من الطبيعة
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleBoundaryImageUpload(dir, e)
                                    }
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "attachments" && (
                <div className="space-y-4 animate-in fade-in duration-300 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold">المرفقات العامة</h3>
                    <label className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3 h-3" /> رفع مرفق
                      <input
                        type="file"
                        className="hidden"
                        onChange={handleAttachmentUpload}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {localData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-lg shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 text-blue-600 rounded">
                            <Paperclip className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden">
                            <p className="font-bold text-sm truncate max-w-[150px]">
                              {att.name}
                            </p>
                            <p className="text-[10px] text-stone-500">
                              {att.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDeleteItem("attachments", att.id)
                          }
                          className="p-1.5 hover:bg-red-50 text-red-500 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeedDetailsModal;
