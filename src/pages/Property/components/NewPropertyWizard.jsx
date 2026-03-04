import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { analyzeDeedWithAI, createDeed } from "../../../api/propertyApi";
import { getSimpleClients } from "../../../api/clientApi";
import { toast } from "sonner";
import api from "../../../api/axios";
import {
  Upload,
  Brain,
  Users,
  Building,
  Percent,
  Ruler,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  File,
  X,
  Loader2,
  Plus,
  Trash2,
  MapPin,
  Hash,
  Sparkles,
  Save,
  Compass,
  Camera,
  Layers,
  MapIcon,
  Info,
  FileText,
  AlertTriangle
} from "lucide-react";

// ==========================================
// 1. دوال مساعدة
// ==========================================
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// ==========================================
// 2. مكون إدخال الصكوك المتعددة (Tags Input)
// ==========================================
const MultiDeedInput = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState("");
  // تحويل النص المفصول بفاصلة إلى مصفوفة
  const tags = value
    ? value
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : [];

  const addTag = (tag) => {
    if (!tag) return;
    const newTags = [...new Set([...tags, tag])]; // منع التكرار
    onChange(newTags.join(" , "));
    setInputValue("");
  };

  const removeTag = (tagToRemove) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    onChange(newTags.join(" , "));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 w-full p-2 border border-slate-300 rounded-lg bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all min-h-[46px]">
      <Hash className="w-4 h-4 text-slate-400 ml-1" />
      {tags.map((tag, idx) => (
        <span
          key={idx}
          className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md text-xs font-bold font-mono"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="text-blue-500 hover:text-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue.trim())}
        placeholder={
          tags.length === 0
            ? "أدخل رقم الصك ثم اضغط Enter..."
            : "أضف صكاً آخر..."
        }
        className="flex-1 min-w-[150px] outline-none text-sm font-mono bg-transparent placeholder:text-slate-400"
      />
    </div>
  );
};

// ==========================================
// 3. مكون الرسم الهندسي التفاعلي
// ==========================================
const DynamicCroquis = ({ north, south, east, west, plotNumber }) => {
  const parseLength = (val) => {
    const parsed = parseFloat(val);
    return isNaN(parsed) || parsed <= 0 ? 100 : parsed;
  };

  const n = parseLength(north?.length);
  const s = parseLength(south?.length);
  const e = parseLength(east?.length);
  const w = parseLength(west?.length);

  const maxW = Math.max(n, s);
  const maxH = Math.max(e, w);
  const scale = 500 / Math.max(maxW, maxH);

  const scaledN = n * scale;
  const scaledS = s * scale;
  const scaledE = e * scale;
  const scaledW = w * scale;

  const width = Math.max(scaledN, scaledS);
  const height = Math.max(scaledE, scaledW);

  const bl = { x: (width - scaledS) / 2, y: height };
  const br = { x: bl.x + scaledS, y: height };
  const tl = { x: (width - scaledN) / 2, y: 0 };
  const tr = { x: tl.x + scaledN, y: 0 };

  const padX = 150;
  const padY = 100;
  const viewBoxWidth = width + padX * 2;
  const viewBoxHeight = height + padY * 2;
  const viewBox = `0 0 ${viewBoxWidth} ${viewBoxHeight}`;

  const fontSize = 16;
  const smallFontSize = 12;

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full drop-shadow-2xl transition-all duration-700 ease-in-out"
    >
      <defs>
        <pattern
          id="gridPattern"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1"
            strokeOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect
        x="0"
        y="0"
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill="#f8fafc"
        rx="20"
      />
      <rect
        x="0"
        y="0"
        width={viewBoxWidth}
        height={viewBoxHeight}
        fill="url(#gridPattern)"
        rx="20"
      />

      <polygon
        points={`${bl.x + padX},${bl.y + padY} ${br.x + padX},${br.y + padY} ${tr.x + padX},${tr.y + padY} ${tl.x + padX},${tl.y + padY}`}
        fill="#eff6ff"
        fillOpacity="0.8"
        stroke="#2563eb"
        strokeWidth="4"
        strokeLinejoin="round"
        className="transition-all duration-700 ease-out hover:fill-blue-100"
      />

      <text
        x={width / 2 + padX}
        y={padY - 25}
        textAnchor="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        شمال: {north?.length || 0}م
      </text>
      <text
        x={width / 2 + padX}
        y={padY - 10}
        textAnchor="middle"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {north?.description || "جار/شارع"}
      </text>

      <text
        x={width / 2 + padX}
        y={height + padY + 20}
        textAnchor="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        جنوب: {south?.length || 0}م
      </text>
      <text
        x={width / 2 + padX}
        y={height + padY + 35}
        textAnchor="middle"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {south?.description || "جار/شارع"}
      </text>

      <text
        x={br.x + padX + 20}
        y={height / 2 + padY}
        textAnchor="start"
        alignmentBaseline="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        شرق: {east?.length || 0}م
      </text>
      <text
        x={br.x + padX + 20}
        y={height / 2 + padY + 15}
        textAnchor="start"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {east?.description || "جار/شارع"}
      </text>

      <text
        x={bl.x + padX - 20}
        y={height / 2 + padY}
        textAnchor="end"
        alignmentBaseline="middle"
        fontSize={fontSize}
        className="fill-blue-800 font-bold"
      >
        غرب: {west?.length || 0}م
      </text>
      <text
        x={bl.x + padX - 20}
        y={height / 2 + padY + 15}
        textAnchor="end"
        fontSize={smallFontSize}
        className="fill-slate-500"
      >
        {west?.description || "جار/شارع"}
      </text>

      <text
        x={width / 2 + padX}
        y={height / 2 + padY}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize="30"
        className="fill-blue-900 font-black opacity-10 tracking-widest pointer-events-none"
      >
        قطعة {plotNumber || "---"}
      </text>
    </svg>
  );
};

// ==========================================
// 4. المكون الأساسي (Wizard)
// ==========================================
const STEPS = [
  { id: 0, label: "رفع الوثائق", icon: Upload },
  { id: 1, label: "مراجعة AI", icon: Brain },
  { id: 2, label: "ربط العميل", icon: Users },
  { id: 3, label: "بيانات الملكية", icon: Building },
  { id: 4, label: "المُلّاك", icon: Percent },
  { id: 5, label: "الحدود والقطع", icon: Ruler },
  { id: 6, label: "المراجعة والحفظ", icon: CheckCircle },
];

const NewPropertyWizard = ({ onComplete }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [selectedPlotForBounds, setSelectedPlotForBounds] = useState(null);

  // === حالات تقسيم الرياض (السحر الجديد) ===
  const [isDistrictNotFound, setIsDistrictNotFound] = useState(false);
  const [isAddDistrictModalOpen, setIsAddDistrictModalOpen] = useState(false);
  const [newDistrictSectorId, setNewDistrictSectorId] = useState("");

  // جلب القطاعات والأحياء من الباك إند
  const { data: riyadhZones = [], refetch: refetchZones } = useQuery({
    queryKey: ["riyadhZones"],
    queryFn: async () => {
      const res = await api.get("/riyadh-zones"); // تأكد من مسار الـ API الخاص بك
      return res.data?.data || [];
    },
  });

  // إضافة حي جديد
  const addDistrictMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.post("/riyadh-zones/districts", payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم تسجيل الحي الجديد وربطه بالقطاع بنجاح!");
      refetchZones(); // تحديث القائمة
      setIsAddDistrictModalOpen(false);
      // إعادة تقييم الحي المدخل لربطه فوراً
      checkDistrictMatch(formData.district, riyadhZones);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء إضافة الحي"),
  });

  const { data: clientsList = [] } = useQuery({
    queryKey: ["clients", "simple"],
    queryFn: async () => {
      try {
        const response = await getSimpleClients();
        return response.data || response || [];
      } catch (e) {
        return [];
      }
    },
  });

  const [formData, setFormData] = useState({
    clientId: "",
    customClientName: "",
    deedNumber: "",
    deedDate: "",
    area: "",
    city: "",
    district: "",
    planNumber: "",
    propertyType: "أرض",
    owners: [],
    plots: [],
    boundaries: [],
    documents: [],
    sectorId: "",
    sectorName: "",
    districtId: "",
  });

  useEffect(() => {
    if (formData.plots.length > 0 && !selectedPlotForBounds) {
      setSelectedPlotForBounds(formData.plots[0].id);
    }
  }, [formData.plots]);

  const matchClient = (ownersList) => {
    if (!ownersList || ownersList.length === 0 || clientsList.length === 0)
      return "";
    const primaryOwner = ownersList[0];
    for (const client of clientsList) {
      const clientName = client.label || client.name?.ar || client.name || "";
      const clientIdNumber = client.idNumber || "";
      const clientId = client.value || client.id;
      if (
        (primaryOwner.identityNumber &&
          clientIdNumber &&
          primaryOwner.identityNumber === clientIdNumber) ||
        (primaryOwner.name &&
          clientName &&
          clientName.includes(primaryOwner.name))
      ) {
        return clientId;
      }
    }
    return "";
  };

  const saveMutation = useMutation({
    mutationFn: createDeed,
    onSuccess: () => {
      toast.success("تم حفظ ملف الملكية بنجاح!");
      queryClient.invalidateQueries(["properties"]);
      queryClient.invalidateQueries(["deeds"]);
      if (onComplete) onComplete();
    },
    onError: (error) =>
      toast.error(error.message || "حدث خطأ أثناء حفظ البيانات"),
  });

  const handleNext = () => {
    if (currentStep === 0 && uploadedFiles.length === 0)
      return toast.error("الرجاء رفع وثيقة واحدة للاستمرار");
    if (currentStep === 2 && !formData.clientId && !formData.customClientName)
      return toast.warning("يجب اختيار عميل أو كتابة اسمه لإنشائه");

    // التحقق من نسبة الملاك
    if (currentStep === 4) {
      const totalShare = formData.owners.reduce(
        (sum, o) => sum + (parseFloat(o.share) || 0),
        0,
      );
      if (formData.owners.length > 0 && totalShare !== 100) {
        return toast.warning(
          `إجمالي حصص الملاك حالياً هو ${totalShare}%. يجب أن يكون المجموع 100%`,
        );
      }
    }

    if (currentStep < STEPS.length - 1) setCurrentStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const handleSave = () => {
    const payload = {
      ...formData,
      clientId: formData.customClientName || formData.clientId,
    };
    saveMutation.mutate(payload);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) setUploadedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (idx) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // دالة لتنظيف اسم الحي (إزالة كلمة "حي" أو "ال" أو المسافات للمطابقة الدقيقة)
  const cleanDistrictName = (name) => {
    if (!name) return "";
    return name
      .replace(/^(حي\s+|ال)/g, "") // يزيل كلمة "حي " أو "ال" من البداية
      .replace(/\s+/g, " ") // يزيل المسافات الزائدة
      .trim();
  };

  // دالة مطابقة الحي وجلب القطاع
  const checkDistrictMatch = (districtName, zonesList) => {
    // إذا لم يكن هناك اسم حي، أو قائمة القطاعات فارغة، لا تفعل شيئاً
    if (!districtName || !zonesList || zonesList.length === 0) {
      setFormData((prev) => ({
        ...prev,
        sectorId: "",
        sectorName: "",
        districtId: "",
      }));
      setIsDistrictNotFound(false); // لا تظهر رسالة الخطأ إذا كان الحقل فارغاً
      return;
    }

    const cleanedInput = cleanDistrictName(districtName);
    let matchedSector = null;
    let matchedDistrict = null;

    // البحث في جميع القطاعات وأحيائها
    for (const sector of zonesList) {
      const found = sector.districts.find((d) => {
        const dbDistrictClean = cleanDistrictName(d.name);
        // مطابقة مرنة: إما تطابق تام، أو واحد يحتوي على الآخر
        return (
          dbDistrictClean === cleanedInput ||
          dbDistrictClean.includes(cleanedInput) ||
          cleanedInput.includes(dbDistrictClean)
        );
      });

      if (found) {
        matchedSector = sector;
        matchedDistrict = found;
        break; // توقف عن البحث بمجرد إيجاد تطابق
      }
    }

    if (matchedSector && matchedDistrict) {
      // تم إيجاد الحي!
      setFormData((prev) => ({
        ...prev,
        sectorId: matchedSector.id,
        sectorName: matchedSector.name,
        districtId: matchedDistrict.id,
      }));
      setIsDistrictNotFound(false);
    } else {
      // لم يتم إيجاد الحي
      setFormData((prev) => ({
        ...prev,
        sectorId: "",
        sectorName: "",
        districtId: "",
      }));
      setIsDistrictNotFound(true);
    }
  };

  // مراقبة أي تغيير في اسم الحي (formData.district) أو عند تحميل القطاعات (riyadhZones)
  useEffect(() => {
    // يتم التفعيل فقط إذا كنا في الخطوة 3 (بيانات الملكية) وهناك اسم حي مكتوب
    if (currentStep === 3 && formData.district) {
      const timer = setTimeout(() => {
        checkDistrictMatch(formData.district, riyadhZones);
      }, 600); // 600 مللي ثانية (Debounce) لكي لا يبحث مع كل حرف فوراً

      return () => clearTimeout(timer);
    } else if (!formData.district) {
      // إذا قام المستخدم بمسح اسم الحي، إخفاء التحذير وتفريغ القطاع
      setIsDistrictNotFound(false);
      setFormData((prev) => ({
        ...prev,
        sectorId: "",
        sectorName: "",
        districtId: "",
      }));
    }
  }, [formData.district, riyadhZones, currentStep]);

  const handleAiExtraction = async () => {
    if (uploadedFiles.length === 0) return toast.error("ارفع ملفاً أولاً");
    try {
      setIsAiAnalyzing(true);
      const base64 = await convertToBase64(uploadedFiles[0]);
      const extracted = await analyzeDeedWithAI(base64);
      setAiResult(extracted);

      const newPlots =
        extracted.plots?.map((p, i) => ({
          id: Date.now() + i,
          plotNumber: p.plotNumber,
          area: p.area,
          planNumber: p.planNumber,
        })) || [];
      const targetPlotId = newPlots.length > 0 ? newPlots[0].id : Date.now();

      const matchedClientId = matchClient(extracted.owners);

      setFormData((prev) => ({
        ...prev,
        clientId: matchedClientId || prev.clientId,
        customClientName: matchedClientId
          ? ""
          : extracted.owners?.[0]?.name || prev.customClientName,
        deedNumber: extracted.documentInfo?.documentNumber || prev.deedNumber,
        deedDate:
          extracted.documentInfo?.hijriDate ||
          extracted.documentInfo?.gregorianDate ||
          prev.deedDate,
        city: extracted.locationInfo?.city || prev.city,
        district: extracted.locationInfo?.district || prev.district,
        planNumber: extracted.locationInfo?.planNumber || prev.planNumber,
        area: extracted.propertySpecs?.totalArea || prev.area,
        owners:
          extracted.owners?.map((o, i) => ({
            id: Date.now() + i,
            name: o.name,
            idNumber: o.identityNumber,
            share: o.sharePercentage,
          })) || [],
        plots: newPlots,
        boundaries:
          extracted.boundaries?.map((b, i) => ({
            id: Date.now() + i,
            plotId: targetPlotId,
            direction: b.direction,
            length: b.length,
            description: b.description,
          })) || [],
        documents: [
          {
            id: Date.now(),
            number: extracted.documentInfo?.documentNumber,
            type: "صك ملكية",
          },
        ],
      }));

      // 👈 Move the code here, inside the try block
      const extractedDistrict = extracted.locationInfo?.district || "";
      if (extractedDistrict) {
        checkDistrictMatch(extractedDistrict, riyadhZones); // المطابقة التلقائية بعد AI
      }

      if (newPlots.length > 0) setSelectedPlotForBounds(newPlots[0].id);

      if (matchedClientId)
        toast.success("تم استخراج البيانات وربط العميل تلقائياً!");
      else toast.success("تم استخراج البيانات، يرجى تأكيد العميل.");

      handleNext();
    } catch (error) {
      toast.error("فشل تحليل الذكاء الاصطناعي: " + error.message);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleChange = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleUpdateBoundary = (direction, field, value, plotId) => {
    if (!plotId) return toast.error("الرجاء اختيار القطعة أولاً");
    setFormData((prev) => {
      const existing = prev.boundaries.filter(
        (b) => !(b.direction === direction && b.plotId === plotId),
      );
      const current = prev.boundaries.find(
        (b) => b.direction === direction && b.plotId === plotId,
      ) || {
        id: Date.now(),
        plotId,
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
  };

  const handleBoundaryImageUpload = async (direction, plotId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    handleUpdateBoundary(direction, "imageUrl", base64, plotId);
    e.target.value = "";
  };

  const getBound = (dir, plotId) => {
    return (
      formData.boundaries.find(
        (b) => b.direction === dir && b.plotId === plotId,
      ) || { length: "", description: "", imageUrl: null }
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 animate-in fade-in duration-300 max-w-3xl mx-auto mt-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors hover:bg-blue-50 border-2 border-dashed border-blue-300 bg-slate-50 py-16 px-4"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Upload className="w-8 h-8 animate-bounce" />
              </div>
              <div className="text-lg font-bold text-slate-700">
                اسحب وأفلت الصكوك هنا أو{" "}
                <span className="text-blue-600 underline">تصفح الملفات</span>
              </div>
              <div className="text-sm text-slate-400 mt-2 font-medium">
                يدعم PDF, JPG, PNG (يمكنك رفع صكوك متعددة للملف الواحد)
              </div>
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          className="text-sm font-bold text-slate-700 truncate max-w-[200px]"
                          dir="ltr"
                        >
                          {file.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="animate-in fade-in duration-300 max-w-2xl mx-auto text-center mt-12 space-y-6">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-purple-200 blur-2xl rounded-full opacity-50"></div>
              <Brain className="w-24 h-24 text-purple-600 mx-auto relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">
              استخراج البيانات الذكي
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-lg mx-auto">
              سيقوم محرك الذكاء الاصطناعي بقراءة الصكوك المرفقة واستخراج كافة
              التفاصيل (أرقام الصكوك، التواريخ، الملاك، المساحات، والحدود) لبناء
              ملف ملكية متكامل آلياً.
            </p>
            <button
              onClick={handleAiExtraction}
              disabled={isAiAnalyzing || uploadedFiles.length === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-10 py-4 rounded-xl font-bold shadow-lg flex items-center gap-3 mx-auto disabled:opacity-50 transition-all hover:scale-105 text-lg"
            >
              {isAiAnalyzing ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> جاري قراءة وتحليل
                  الوثائق...
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6" /> بدء التحليل والاستخراج
                </>
              )}
            </button>
            {aiResult && (
              <div className="mt-6 text-emerald-700 font-bold bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-center gap-2 max-w-sm mx-auto">
                <CheckCircle className="w-5 h-5" /> تم استخراج البيانات بنجاح!
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="animate-in fade-in duration-300 max-w-2xl mx-auto mt-8 space-y-6">
            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-500" /> لمن يعود هذا العقار؟
              (ربط العميل)
            </h3>
            <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl space-y-6">
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  اختر عميلاً مسجلاً في النظام:
                </label>
                <select
                  value={formData.clientId}
                  onChange={(e) => {
                    handleChange("clientId", e.target.value);
                    handleChange("customClientName", "");
                  }}
                  className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-slate-50 hover:bg-white font-bold text-slate-700 transition-all"
                >
                  <option value="">-- اضغط للبحث واختيار عميل --</option>
                  {clientsList.map((client) => {
                    const val = client.value || client.id;
                    const label =
                      client.label || client.name?.ar || client.name;
                    return (
                      <option key={val} value={val}>
                        {label} {client.mobile ? `(${client.mobile})` : ""}
                      </option>
                    );
                  })}
                </select>
                {formData.clientId && (
                  <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> العميل مرتبط وجاهز
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs font-black text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  أو
                </span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  تسجيل عميل جديد مؤقت (سيتم إنشاؤه تلقائياً):
                </label>
                <input
                  type="text"
                  value={formData.customClientName}
                  onChange={(e) => {
                    handleChange("customClientName", e.target.value);
                    handleChange("clientId", "");
                  }}
                  placeholder="اكتب اسم العميل (مثال: شركة العقار المتقدمة)..."
                  className="w-full p-3.5 border border-slate-300 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-bold text-slate-700 transition-all placeholder:font-normal"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="animate-in fade-in duration-300 max-w-4xl mx-auto mt-6">
            <div className="flex items-center gap-2 mb-6 bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-200">
              <Info className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">
                إذا كان الملف يضم أكثر من صك، يمكنك إضافة جميع أرقام الصكوك
                بالضغط على <strong className="font-bold">Enter</strong> بعد كل
                رقم.
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  رقم الصك (أو الصكوك المتعددة)
                </label>
                {/* 👈 استخدام مكون Tags للأرقام المتعددة */}
                <MultiDeedInput
                  value={formData.deedNumber}
                  onChange={(val) => handleChange("deedNumber", val)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  تاريخ الصك الرئيسي
                </label>
                <input
                  type="text"
                  value={formData.deedDate}
                  onChange={(e) => handleChange("deedDate", e.target.value)}
                  placeholder="مثال: 1445-05-20"
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-mono"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-slate-100 pt-5 mt-2">
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    المدينة
                  </label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className="w-full p-3 pr-10 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5 flex justify-between">
                    الحي
                    {formData.districtId && (
                      <span className="text-[9px] text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> مربوط
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => handleChange("district", e.target.value)}
                    placeholder="اكتب اسم الحي (مثال: الملقا)"
                    className={`w-full p-3 border rounded-lg outline-none transition-all font-bold ${isDistrictNotFound ? "border-amber-400 focus:ring-amber-100 bg-amber-50" : formData.districtId ? "border-emerald-300 focus:ring-emerald-100 bg-emerald-50 text-emerald-800" : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"}`}
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">
                    القطاع التابع له
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={formData.sectorName || "---"}
                    placeholder="يتم تحديده تلقائياً"
                    className="w-full p-3 border border-slate-200 bg-slate-100 text-slate-500 rounded-lg outline-none font-bold cursor-not-allowed"
                  />
                </div>

                {/* 👈 التنبيه إذا كان الحي غير موجود */}
                {isDistrictNotFound && formData.district && (
                  <div className="md:col-span-3 flex items-center justify-between p-3 bg-amber-100 border border-amber-200 rounded-xl animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-3 text-amber-800">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <div>
                        <div className="text-sm font-bold">
                          الحي "{formData.district}" غير مسجل في التقسيم
                          الإداري!
                        </div>
                        <div className="text-[10px] mt-0.5 opacity-80">
                          لن تتمكن من الاستفادة من إحصائيات القطاعات إلا إذا قمت
                          بربطه.
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsAddDistrictModalOpen(true)}
                      className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm"
                    >
                      + إضافة الحي للتقسيم
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  إجمالي المساحة (م²)
                </label>
                <input
                  type="number"
                  value={formData.area}
                  onChange={(e) => handleChange("area", e.target.value)}
                  className="w-full p-3 border border-emerald-300 bg-emerald-50 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all font-black text-emerald-700 text-lg"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 block mb-1.5">
                  نوع العقار
                </label>
                <select
                  value={formData.propertyType}
                  onChange={(e) => handleChange("propertyType", e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white font-bold text-slate-700 cursor-pointer"
                >
                  <option value="أرض">قطعة أرض</option>
                  <option value="سكني">مبنى سكني (فيلا / عمارة)</option>
                  <option value="تجاري">مجمع تجاري</option>
                  <option value="زراعي">أرض زراعية / مزرعة</option>
                  <option value="صناعي">أرض صناعية / مستودع</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        const totalShare = formData.owners.reduce(
          (sum, o) => sum + (parseFloat(o.share) || 0),
          0,
        );
        const isShareComplete = totalShare === 100;

        return (
          <div className="animate-in fade-in duration-300 max-w-4xl mx-auto mt-6">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-800">
                  قائمة المُلاّك ({formData.owners.length})
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-slate-500">
                    إجمالي الحصص:
                  </span>
                  <span
                    className={`text-sm font-black px-2 py-0.5 rounded ${isShareComplete ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                  >
                    {totalShare}%
                  </span>
                  {!isShareComplete && (
                    <span className="text-[10px] text-red-500 font-bold">
                      (يجب أن يكون المجموع 100%)
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() =>
                  setFormData((p) => ({
                    ...p,
                    owners: [
                      ...p.owners,
                      {
                        id: Date.now(),
                        name: "",
                        share: 100 - totalShare > 0 ? 100 - totalShare : 0,
                      },
                    ],
                  }))
                }
                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 shadow-sm transition-all hover:scale-105"
              >
                <Plus className="w-4 h-4" /> إضافة مالك جديد
              </button>
            </div>

            <div className="space-y-4">
              {formData.owners.map((owner, idx) => (
                <div
                  key={owner.id}
                  className="flex flex-wrap md:flex-nowrap gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-blue-300 transition-all"
                >
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      اسم المالك / الشركة
                    </label>
                    <input
                      type="text"
                      value={owner.name}
                      onChange={(e) => {
                        const newOwners = [...formData.owners];
                        newOwners[idx].name = e.target.value;
                        handleChange("owners", newOwners);
                      }}
                      placeholder="الاسم الكامل"
                      className="w-full p-2.5 text-sm font-bold text-slate-800 border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="w-full md:w-48">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      رقم الهوية / السجل
                    </label>
                    <input
                      type="text"
                      value={owner.idNumber || ""}
                      onChange={(e) => {
                        const newOwners = [...formData.owners];
                        newOwners[idx].idNumber = e.target.value;
                        handleChange("owners", newOwners);
                      }}
                      placeholder="10xxxxxxx"
                      className="w-full p-2.5 text-sm font-mono border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">
                      النسبة %
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={owner.share}
                        onChange={(e) => {
                          const newOwners = [...formData.owners];
                          newOwners[idx].share = e.target.value;
                          handleChange("owners", newOwners);
                        }}
                        className="w-full p-2.5 text-lg font-black text-blue-700 text-center border border-slate-300 rounded-lg outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all pr-8"
                      />
                      <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      handleChange(
                        "owners",
                        formData.owners.filter((o) => o.id !== owner.id),
                      )
                    }
                    className="mt-5 text-slate-400 hover:text-red-500 hover:bg-red-50 p-3 rounded-lg transition-colors"
                    title="حذف المالك"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {formData.owners.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                  <Users className="w-12 h-12 mb-3 opacity-50" />
                  <p className="font-bold">لا يوجد ملاك مسجلين في هذا الملف</p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        const north = getBound("شمال", selectedPlotForBounds);
        const south = getBound("جنوب", selectedPlotForBounds);
        const east = getBound("شرق", selectedPlotForBounds);
        const west = getBound("غرب", selectedPlotForBounds);
        const currentPlotDetails = formData.plots.find(
          (p) => p.id === selectedPlotForBounds,
        );

        return (
          <div className="animate-in fade-in duration-300 flex flex-col max-w-7xl mx-auto w-full">
            {formData.plots.length === 0 ? (
              <div className="p-16 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl">
                <Layers className="w-16 h-16 mb-4 opacity-50 text-blue-500" />
                <h3 className="text-xl font-bold text-slate-700 mb-2">
                  لا توجد قطع أراضي مضافة
                </h3>
                <p className="text-sm text-slate-500 mb-6 max-w-md text-center">
                  أضف قطعة الأرض الأولى للبدء في تحديد أطوالها وحدودها وإنشاء
                  المخطط الكروكي التفاعلي.
                </p>
                <button
                  onClick={() => {
                    const newPlot = {
                      id: Date.now(),
                      plotNumber: "1",
                      area: formData.area || "",
                    };
                    setFormData((p) => ({ ...p, plots: [newPlot] }));
                    setSelectedPlotForBounds(newPlot.id);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" /> إضافة القطعة الأولى
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                  {formData.plots.map((plot) => (
                    <button
                      key={plot.id}
                      onClick={() => setSelectedPlotForBounds(plot.id)}
                      className={`px-5 py-3 text-sm font-bold rounded-xl border flex items-center gap-3 min-w-[140px] transition-all ${selectedPlotForBounds === plot.id ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105" : "bg-white text-slate-600 border-slate-300 hover:bg-blue-50"}`}
                    >
                      <MapIcon className="w-5 h-5 opacity-80" />
                      <div className="text-right">
                        <span className="block opacity-80 text-[10px] font-normal">
                          قطعة رقم
                        </span>
                        <span className="block text-base" dir="ltr">
                          {plot.plotNumber || "بدون رقم"}
                        </span>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      const newPlot = {
                        id: Date.now(),
                        plotNumber: "",
                        area: "",
                      };
                      setFormData((p) => ({
                        ...p,
                        plots: [...p.plots, newPlot],
                      }));
                      setSelectedPlotForBounds(newPlot.id);
                    }}
                    className="px-5 py-3 text-sm font-bold rounded-xl border border-dashed border-blue-400 text-blue-600 hover:bg-blue-50 flex items-center justify-center min-w-[140px] transition-colors"
                  >
                    <Plus className="w-5 h-5 ml-1" /> إضافة قطعة أخرى
                  </button>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row mt-2">
                  <div className="w-full md:w-1/3 bg-slate-800 text-white p-8 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-4 opacity-10">
                      <Compass className="w-40 h-40" />
                    </div>
                    <h3 className="text-2xl font-black mb-6 relative z-10">
                      بيانات القطعة والمخطط
                    </h3>

                    <div className="space-y-5 relative z-10">
                      <div>
                        <label className="text-slate-400 text-xs font-bold block mb-1.5">
                          رقم القطعة / البلك:
                        </label>
                        <input
                          type="text"
                          value={currentPlotDetails?.plotNumber || ""}
                          onChange={(e) => {
                            const p = [...formData.plots];
                            const idx = p.findIndex(
                              (pl) => pl.id === selectedPlotForBounds,
                            );
                            if (idx > -1) p[idx].plotNumber = e.target.value;
                            handleChange("plots", p);
                          }}
                          placeholder="مثال: 145"
                          className="bg-slate-700 text-white border border-slate-600 outline-none w-full px-4 py-3 rounded-xl text-base font-bold focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 text-xs font-bold block mb-1.5">
                          مساحة القطعة (م²):
                        </label>
                        <input
                          type="number"
                          value={currentPlotDetails?.area || ""}
                          onChange={(e) => {
                            const p = [...formData.plots];
                            const idx = p.findIndex(
                              (pl) => pl.id === selectedPlotForBounds,
                            );
                            if (idx > -1) p[idx].area = e.target.value;
                            handleChange("plots", p);
                          }}
                          placeholder="مثال: 450"
                          className="bg-slate-700 text-emerald-400 border border-slate-600 outline-none w-full px-4 py-3 rounded-xl text-xl font-black focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-blue-50/50 p-10 flex items-center justify-center min-h-[400px]">
                    <DynamicCroquis
                      north={north}
                      south={south}
                      east={east}
                      west={west}
                      plotNumber={currentPlotDetails?.plotNumber}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
                  {["شمال", "جنوب", "شرق", "غرب"].map((dir) => {
                    const bound = getBound(dir, selectedPlotForBounds);
                    return (
                      <div
                        key={dir}
                        className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col hover:border-blue-400 transition-colors group"
                      >
                        <div className="bg-slate-50 border-b border-slate-200 p-4 flex justify-between items-center">
                          <h4 className="font-black text-slate-800 text-sm flex items-center gap-2">
                            <Compass className="w-5 h-5 text-blue-500" /> الحد
                            ال{dir}
                          </h4>
                        </div>
                        <div className="p-5 space-y-4 flex-1">
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                              الطول (متر)
                            </label>
                            <input
                              type="number"
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-base font-black text-blue-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                              value={bound.length}
                              onChange={(e) =>
                                handleUpdateBoundary(
                                  dir,
                                  "length",
                                  e.target.value,
                                  selectedPlotForBounds,
                                )
                              }
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 mb-1.5 block">
                              الوصف / المجاور
                            </label>
                            <textarea
                              className="w-full border border-slate-300 rounded-lg p-2.5 text-sm font-medium text-slate-700 h-20 resize-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                              value={bound.description}
                              onChange={(e) =>
                                handleUpdateBoundary(
                                  dir,
                                  "description",
                                  e.target.value,
                                  selectedPlotForBounds,
                                )
                              }
                              placeholder="شارع عرض 15م..."
                            />
                          </div>
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100">
                          {bound.imageUrl ? (
                            <div className="relative h-24 rounded-lg border border-slate-300 overflow-hidden group/img">
                              <img
                                src={bound.imageUrl}
                                alt={dir}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() =>
                                  handleUpdateBoundary(
                                    dir,
                                    "imageUrl",
                                    null,
                                    selectedPlotForBounds,
                                  )
                                }
                                className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-6 h-6 hover:text-red-400 transition-colors" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all">
                              <Camera className="w-6 h-6 text-slate-400 mb-2 group-hover:text-blue-500" />
                              <span className="text-[11px] text-slate-500 font-bold group-hover:text-blue-700">
                                إرفاق صورة من الطبيعة
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleBoundaryImageUpload(
                                    dir,
                                    selectedPlotForBounds,
                                    e,
                                  )
                                }
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        );

      case 6:
        return (
          <div className="animate-in fade-in duration-300 max-w-2xl mx-auto mt-12 text-center">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-emerald-200 blur-2xl rounded-full opacity-60"></div>
              <CheckCircle className="w-24 h-24 text-emerald-500 relative z-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-800">
              البيانات جاهزة للاعتماد!
            </h2>
            <p className="text-slate-500 text-base mt-3 mb-10 max-w-md mx-auto">
              تم تجميع بيانات الملكية وإنشاء المخططات الكروكية بنجاح. راجع
              الملخص أدناه قبل الحفظ النهائي.
            </p>

            <div className="bg-white shadow-xl border border-slate-200 rounded-2xl p-8 text-right mb-10">
              <h3 className="text-sm font-bold text-blue-600 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Building className="w-4 h-4" /> ملخص الملف النهائي
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div>
                  <span className="text-slate-400 block text-xs mb-1">
                    المدينة والحي
                  </span>
                  <strong className="text-slate-800 text-base">
                    {formData.city} - {formData.district}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1">
                    أرقام الصكوك
                  </span>
                  <strong
                    className="text-slate-800 font-mono text-base truncate block max-w-[150px]"
                    title={formData.deedNumber}
                  >
                    {formData.deedNumber || "---"}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1">
                    المساحة الإجمالية
                  </span>
                  <strong className="text-emerald-600 text-xl font-black">
                    {formData.area} م²
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs mb-1">
                    القطع والمُلاّك
                  </span>
                  <strong className="text-blue-600 text-lg font-black">
                    {formData.plots.length} قطع | {formData.owners.length} ملاك
                  </strong>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-xl text-lg font-bold shadow-[0_10px_20px_rgba(5,150,105,0.3)] flex items-center gap-3 mx-auto transition-transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
            >
              {saveMutation.isPending ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" /> جاري حفظ الملف...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" /> اعتماد وإنشاء ملف الملكية الآن
                </>
              )}
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-slate-50 animate-in fade-in h-full flex flex-col"
      dir="rtl"
    >
      <div className="flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 m-4 overflow-hidden">
        {/* شريط التقدم العلوي */}
        <div className="shrink-0 flex items-center px-6 py-4 bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar">
          {STEPS.map((step, index) => {
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;
            const Icon = step.icon;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                  disabled={!isCompleted && !isActive}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all text-xs font-bold shrink-0
                    ${isActive ? "bg-white text-blue-700 border-2 border-blue-500 shadow-md scale-105" : isCompleted ? "bg-emerald-50 text-emerald-700 border-2 border-transparent hover:border-emerald-200 cursor-pointer" : "bg-transparent text-slate-400 border-2 border-transparent cursor-not-allowed opacity-60"}
                  `}
                >
                  <span
                    className={`flex items-center justify-center rounded-full text-[10px] font-black w-6 h-6 ${isActive ? "bg-blue-100 text-blue-700" : isCompleted ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"}`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      step.id + 1
                    )}
                  </span>
                  <Icon className="w-4 h-4" />
                  {step.label}
                </button>

                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 mx-2 h-[3px] min-w-[15px] max-w-[40px] rounded-full transition-colors ${isCompleted ? "bg-emerald-400" : "bg-slate-200"}`}
                  ></div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* منطقة المحتوى */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          {renderStepContent()}
        </div>

        {/* الفوتر وأزرار التحكم */}
        <div className="shrink-0 flex items-center justify-between px-8 py-5 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] z-10">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || saveMutation.isPending}
            className="flex items-center gap-2 text-sm font-bold rounded-xl px-6 py-3 transition-colors disabled:opacity-40 border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 shadow-sm hover:shadow"
          >
            <ArrowRight className="w-4 h-4" /> السابق
          </button>

          <div className="text-xs font-bold text-slate-500 bg-slate-100 px-5 py-2 rounded-full border border-slate-200">
            الخطوة{" "}
            <span className="text-blue-600 mx-1 text-sm">
              {currentStep + 1}
            </span>{" "}
            من {STEPS.length}
          </div>

          <button
            onClick={currentStep === STEPS.length - 1 ? handleSave : handleNext}
            disabled={saveMutation.isPending}
            className={`flex items-center gap-2 text-sm font-bold rounded-xl px-8 py-3 text-white transition-all shadow-md ${currentStep === STEPS.length - 1 ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-md"}`}
          >
            {currentStep === STEPS.length - 1
              ? "اعتماد وإرسال"
              : "متابعة وإكمال"}
            {currentStep !== STEPS.length - 1 && (
              <ArrowLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
      {/* مودال إضافة حي جديد لتقسيم الرياض */}
      {isAddDistrictModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsAddDistrictModalOpen(false)}
          ></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-slate-800 mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" /> إضافة حي جديد للتقسيم
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              سيتم إضافة حي{" "}
              <span className="font-bold text-slate-800">
                "{formData.district}"
              </span>{" "}
              وتوفيره لجميع المعاملات القادمة.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر القطاع الذي يتبعه هذا الحي *
                </label>
                <select
                  value={newDistrictSectorId}
                  onChange={(e) => setNewDistrictSectorId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:border-blue-500 bg-slate-50 font-bold"
                >
                  <option value="">-- اختر القطاع --</option>
                  {riyadhZones.map((sector) => (
                    <option key={sector.id} value={sector.id}>
                      {sector.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsAddDistrictModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={() =>
                    addDistrictMutation.mutate({
                      name: formData.district,
                      sectorId: newDistrictSectorId,
                    })
                  }
                  disabled={
                    !newDistrictSectorId || addDistrictMutation.isPending
                  }
                  className="flex-[2] py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {addDistrictMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  اعتماد الحي
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPropertyWizard;
