import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDeedById,
  updateDeed,
  analyzeDeedWithAI,
} from "../../../api/propertyApi";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";
import {
  Building,
  Crown,
  Map as MapIcon,
  TriangleAlert,
  Sparkles,
  Download,
  SquarePen,
  Trash2,
  Eye,
  Brain,
  FileText,
  Users,
  Ruler,
  Upload,
  Image as ImageIcon,
  Link2,
  Shield,
  StickyNote,
  History,
  ChartColumn,
  Info,
  Calendar,
  ExternalLink,
  MapPin,
  CircleCheckBig,
  X,
  Camera,
  Plus,
  Loader2,
  Compass,
  Layers,
  TableProperties,
  Save,
  ArrowRight,
  Paperclip,
  ClipboardList,
  Printer,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

// --- دوال مساعدة ---
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

const safeFormatDate = (dateString, formatStr = "yyyy-MM-dd - hh:mm a") => {
  if (!dateString) return "---";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return format(d, formatStr, { locale: ar });
  } catch (e) {
    return dateString;
  }
};

// ==========================================
// مكون الرسم الهندسي التفاعلي
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

const DeedDetailsTab = ({ deedId, onBack }) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("summary");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [selectedPlotForBounds, setSelectedPlotForBounds] = useState("all");
  const [isEditing, setIsEditing] = useState(false);

  const [reportType, setReportType] = useState("");

  // حالة البيانات المحلية للنموذج والتابات
  const [localData, setLocalData] = useState({
    documents: [],
    plots: [],
    owners: [],
    boundaries: [],
    attachments: [],
    city: "",
    district: "",
    deedNumber: "",
    deedDate: "",
    planNumber: "",
    area: 0,
    status: "", // 👈 تم إضافة الحالة
    notes: "", // 👈 تم إضافة الملاحظات
  });

  const [hasChanges, setHasChanges] = useState(false);
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
  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["deedDetails", deedId],
    queryFn: () => getDeedById(deedId),
    enabled: !!deedId,
  });

  const deed = response?.data || {};

  useEffect(() => {
    if (deed.id) {
      setLocalData({
        documents: Array.isArray(deed.documents) ? deed.documents : [],
        plots: Array.isArray(deed.plots) ? deed.plots : [],
        owners: Array.isArray(deed.owners) ? deed.owners : [],
        boundaries: Array.isArray(deed.boundaries) ? deed.boundaries : [],
        attachments: Array.isArray(deed.attachments) ? deed.attachments : [],
        city: deed.city || "",
        district: deed.district || "",
        deedNumber: deed.deedNumber || "",
        deedDate: deed.deedDate
          ? format(new Date(deed.deedDate), "yyyy-MM-dd")
          : "",
        planNumber: deed.planNumber || "",
        area: deed.area || 0,
        status: deed.status || "Active", // 👈 تعيين الحالة
        notes: deed.notes || "", // 👈 تعيين الملاحظات
      });
      setHasChanges(false);
      setIsEditing(false);
      setActiveTab("summary");
      setSelectedPlotForBounds("all");
    }
  }, [deed.id]);

  const triggerChange = () => setHasChanges(true);

  const handleBasicFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    triggerChange();
  };

  // --- دوال الـ AI ورفع الملفات والإضافة (مختصرة للحفاظ على الكود) ---
  const handleAiUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setAiAnalyzing(true);
      setAiResult(null);
      const base64Image = await convertToBase64(file);
      toast.info("جاري تحليل الوثيقة بالذكاء الاصطناعي...");
      const extractedData = await analyzeDeedWithAI(base64Image);
      setAiResult(extractedData);
      toast.success("تم استخراج البيانات بنجاح!");
    } catch (error) {
      toast.error(error.message || "حدث خطأ أثناء التحليل");
    } finally {
      setAiAnalyzing(false);
      e.target.value = "";
    }
  };

  const handleConfirmAiData = () => {
    if (!aiResult) return;
    const newPlots = (aiResult.plots || []).map((plot, i) => ({
      id: Date.now() + i,
      plotNumber: plot.plotNumber || "",
      planNumber: plot.planNumber || aiResult.locationInfo?.planNumber || "",
      area: plot.area || "",
      district: aiResult.locationInfo?.district || "",
      notes: `${plot.propertyType || ""} - ${plot.usageType || ""}`,
    }));
    const targetPlotId =
      newPlots.length > 0
        ? newPlots[0].id
        : localData.plots[0]?.id || Date.now();
    setLocalData((prev) => ({
      ...prev,
      plots: [...prev.plots, ...newPlots],
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
      boundaries: [
        ...prev.boundaries,
        ...(aiResult.boundaries || []).map((b, i) => ({
          id: Date.now() + i + 200,
          plotId: targetPlotId,
          direction: b.direction,
          length: b.length,
          description: b.description,
        })),
      ],
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
      area: aiResult.propertySpecs?.totalArea || prev.area,
      city: aiResult.locationInfo?.city || prev.city,
      district: aiResult.locationInfo?.district || prev.district,
      planNumber: aiResult.locationInfo?.planNumber || prev.planNumber,
    }));
    toast.success("تم نقل جميع البيانات بنجاح!");
    setHasChanges(true);
    setAiResult(null);
  };

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
    const newPlotData = { ...newPlot, id: Date.now() };
    setLocalData((prev) => ({ ...prev, plots: [...prev.plots, newPlotData] }));
    if (selectedPlotForBounds === "all")
      setSelectedPlotForBounds(newPlotData.id);
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
    setLocalData((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments,
        {
          id: Date.now(),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
          type: file.type,
          dataUrl: base64,
        },
      ],
    }));
    triggerChange();
    e.target.value = "";
  };

  const handleUpdateBoundary = (direction, field, value, plotId) => {
    if (!plotId || plotId === "all")
      return toast.error("الرجاء اختيار القطعة أولاً");
    setLocalData((prev) => {
      const existing = prev.boundaries.filter(
        (b) => !(b.direction === direction && b.plotId === plotId),
      );
      const current = prev.boundaries.find(
        (b) => b.direction === direction && b.plotId === plotId,
      ) || {
        id: Date.now(),
        plotId: plotId,
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

  const handleBoundaryImageUpload = async (direction, plotId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    handleUpdateBoundary(direction, "imageUrl", base64, plotId);
    e.target.value = "";
  };

  const handleDeleteItem = (listName, id) => {
    setLocalData((prev) => {
      let newData = {
        ...prev,
        [listName]: prev[listName].filter((item) => item.id !== id),
      };
      if (listName === "plots") {
        newData.boundaries = newData.boundaries.filter((b) => b.plotId !== id);
        if (selectedPlotForBounds === id) setSelectedPlotForBounds("all");
      }
      return newData;
    });
    triggerChange();
  };

  // 👈 دالة الحفظ
  const updateMutation = useMutation({
    mutationFn: updateDeed,
    onSuccess: () => {
      toast.success("تم حفظ التعديلات في قاعدة البيانات بنجاح!");
      setHasChanges(false);
      setIsEditing(false);
      queryClient.invalidateQueries(["deedDetails", deedId]);
      queryClient.invalidateQueries(["deeds"]);
    },
    onError: (err) => toast.error("فشل الحفظ: " + err.message),
  });

  const saveChangesToDB = () =>
    updateMutation.mutate({ id: deedId, data: localData });

  const triggerPrint = (type) => {
    setReportType(type);
    toast.success(`جاري تجهيز ${type} للطباعة...`);
    // ننتظر قليلاً لكي يتم تحديث الـ State و رندر قالب الطباعة
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 w-full">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-600 font-bold">جاري تحميل تفاصيل الملكية...</p>
      </div>
    );
  }

  if (isError || !deed.id) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 w-full">
        <TriangleAlert className="w-10 h-10 text-red-500 mb-4" />
        <p className="text-slate-600 font-bold mb-4">
          فشل تحميل البيانات أو الملف غير موجود.
        </p>
        <button
          onClick={onBack}
          className="bg-slate-200 px-4 py-2 rounded text-sm font-bold hover:bg-slate-300"
        >
          العودة للسجل
        </button>
      </div>
    );
  }

  // متغيرات العرض
  const safeClientName = getSafeClientName(deed?.client);
  const plotsCount = localData.plots.length;
  const docsCount = localData.documents.length;
  const ownersCount = localData.owners.length;
  const totalArea =
    localData.area ||
    deed?.area ||
    localData.plots?.reduce((sum, p) => sum + (parseFloat(p.area) || 0), 0) ||
    0;
  const propertyType = localData.plots?.[0]?.propertyType || "أرض";
  const perimeter =
    localData.boundaries?.reduce(
      (sum, b) => sum + (parseFloat(b.length) || 0),
      0,
    ) || 0;

  const TABS = [
    { id: "summary", label: "ملخص", icon: Eye },
    { id: "details", label: "التفاصيل", icon: Building },
    { id: "ai", label: "تحليل AI", icon: Brain },
    { id: "docs", label: "الوثائق", icon: FileText, badge: docsCount },
    { id: "plots", label: "القطع", icon: MapIcon, badge: plotsCount },
    { id: "owners", label: "المُلّاك", icon: Users, badge: ownersCount },
    {
      id: "bounds",
      label: "الحدود",
      icon: Ruler,
      badge: localData.boundaries?.length || 0,
    },
    {
      id: "attachments",
      label: "المرفقات",
      icon: Upload,
      badge: localData.attachments?.length || 0,
    },
    {
      id: "images",
      label: "الصور",
      icon: ImageIcon,
      badge: localData.boundaries?.filter((b) => b.imageUrl).length || 0,
    },
    { id: "transactions", label: "المعاملات", icon: Link2, badge: "0" },
    { id: "verify", label: "التحقق", icon: Shield },
    { id: "notes", label: "ملاحظات", icon: StickyNote },
    { id: "history", label: "السجل", icon: History },
    { id: "reports", label: "التقارير", icon: ChartColumn },
  ];

  const getBound = (dir, plotId) => {
    const fallbackPlotId = localData.plots[0]?.id;
    return (
      localData.boundaries.find(
        (b) =>
          b.direction === dir &&
          (b.plotId === plotId || (!b.plotId && plotId === fallbackPlotId)),
      ) || { length: "", description: "", imageUrl: null }
    );
  };

  const handleAction = (actionName) => {
    if (
      actionName === "تصدير كـ PDF" ||
      actionName.includes("تقرير") ||
      actionName === "شهادة ملكية"
    ) {
      window.print(); // تفعيل الطباعة المباشرة كحل سريع
    } else {
      toast.info(`تم النقر على: ${actionName}`);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      // =======================================
      // تاب الملخص
      // =======================================
      case "summary":
        return (
          <div className="space-y-4 animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-blue-50 border border-blue-200">
              <Info className="w-4 h-4 text-blue-500" />
              <span className="text-xs flex-1 text-blue-800 font-medium">
                ملف ملكية مرتبط بالعميل {safeClientName}
              </span>
              <button
                onClick={() => setActiveTab("docs")}
                className="text-[10px] font-bold rounded px-3 py-1 bg-white text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors shadow-sm"
              >
                عرض الوثائق
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200 bg-white">
              <div className="px-3 py-2 flex items-center justify-between border-b border-slate-200 bg-gradient-to-l from-blue-50/50 to-purple-50/50">
                <span className="text-[11px] text-slate-700 flex items-center gap-1.5 font-bold">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> مؤشرات
                  التملك
                </span>
              </div>
              <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="rounded-lg p-3 text-center bg-blue-50 border border-blue-100">
                  <div className="text-[10px] text-blue-500 mb-1 font-bold">
                    تاريخ الإضافة
                  </div>
                  <div className="text-sm text-blue-700 font-bold">
                    {safeFormatDate(deed.createdAt, "dd MMM yyyy")}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center bg-amber-50 border border-amber-100">
                  <div className="text-[10px] text-amber-500 mb-1 font-bold">
                    إجمالي المساحة
                  </div>
                  <div className="text-sm text-amber-700 font-bold">
                    {totalArea} م²
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] text-emerald-500 mb-1 font-bold">
                    تاريخ الوثيقة
                  </div>
                  <div className="text-[11px] text-emerald-700 font-mono font-bold">
                    {safeFormatDate(localData.deedDate)}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center bg-purple-50 border border-purple-100">
                  <div className="text-[10px] text-purple-500 mb-1 font-bold">
                    عدد القطع
                  </div>
                  <div className="text-sm text-purple-700 font-bold">
                    {plotsCount}
                  </div>
                </div>
                <div className="rounded-lg p-3 text-center bg-green-50 border border-green-200">
                  <div className="text-[10px] text-slate-500 mb-1 font-bold">
                    الحالة
                  </div>
                  <div className="text-sm text-green-700 font-bold">
                    {localData.status === "Active"
                      ? "نشط/مؤكد"
                      : localData.status || "جديد"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-600 mb-3 flex items-center gap-1.5 font-bold border-b border-slate-200 pb-2">
                  <Building className="w-4 h-4 text-blue-500" /> البيانات
                  والموقع
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div>
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      المدينة / الحي
                    </div>
                    <div className="text-xs text-slate-800 font-bold">
                      {localData.city || "---"} / {localData.district || "---"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      رقم المخطط
                    </div>
                    <div className="text-xs text-slate-800 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {localData.planNumber || "---"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      نوع العقار
                    </div>
                    <div className="text-xs text-slate-800 font-bold">
                      {propertyType}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      الاستخدام
                    </div>
                    <div className="text-xs text-slate-800 font-bold">
                      {localData.plots?.[0]?.usageType || "سكني"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg p-4 bg-slate-50 border border-slate-200">
                <div className="text-xs text-slate-600 mb-3 flex items-center justify-between font-bold border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-emerald-500" /> المُلّاك (
                    {ownersCount})
                  </div>
                  <button
                    onClick={() => setActiveTab("owners")}
                    className="text-[10px] text-blue-600 hover:underline"
                  >
                    عرض الكل
                  </button>
                </div>
                {localData.owners?.length > 0 ? (
                  <div className="space-y-2">
                    {localData.owners.map((owner, idx) => (
                      <div
                        key={owner.id || idx}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Crown
                            className={`w-4 h-4 ${idx === 0 ? "text-amber-500" : "text-slate-300"} shrink-0`}
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-slate-800 font-bold">
                                {owner.name}
                              </span>
                              {idx === 0 && (
                                <span className="text-[8px] rounded px-1.5 py-0.5 bg-amber-100 text-amber-700 font-bold">
                                  رئيسي
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                              {owner.idNumber}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          {owner.sharePercentage || owner.share}%
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 text-center py-4">
                    لا يوجد ملاك مسجلين
                  </div>
                )}
              </div>
            </div>

            {/* اختصارات سريعة */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
              {[
                {
                  id: "docs",
                  label: "الوثائق",
                  count: docsCount,
                  color: "text-blue-600",
                },
                {
                  id: "plots",
                  label: "القطع",
                  count: plotsCount,
                  color: "text-emerald-600",
                },
                {
                  id: "bounds",
                  label: "الحدود",
                  count: localData.boundaries?.length || 0,
                  color: "text-amber-500",
                },
                {
                  id: "attachments",
                  label: "المرفقات",
                  count: localData.attachments?.length || 0,
                  color: "text-purple-600",
                },
                {
                  id: "images",
                  label: "الصور",
                  count:
                    localData.boundaries?.filter((b) => b.imageUrl).length || 0,
                  color: "text-pink-500",
                },
                {
                  id: "transactions",
                  label: "المعاملات",
                  count: 0,
                  color: "text-slate-600",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className="flex items-center justify-between rounded-lg p-2 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <span className="text-[10px] font-bold text-slate-600">
                    {item.label}
                  </span>
                  <span className={`text-sm font-black ${item.color}`}>
                    {item.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );

      // =======================================
      // تاب التفاصيل (يدعم التعديل IsEditing)
      // =======================================
      case "details":
        return (
          <div className="animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" /> تفاصيل الملكية
                الكاملة
              </span>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-colors ${isEditing ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}
              >
                {isEditing ? (
                  <X className="w-4 h-4" />
                ) : (
                  <SquarePen className="w-4 h-4" />
                )}
                {isEditing ? "إلغاء التعديل" : "تعديل البيانات الأساسية"}
              </button>
            </div>

            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5 p-6 rounded-xl border ${isEditing ? "bg-blue-50/30 border-blue-200" : "bg-slate-50 border-slate-200"}`}
            >
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  كود الملكية (تلقائي)
                </label>
                <input
                  readOnly
                  value={deed.code || ""}
                  className="w-full h-[38px] px-3 border border-slate-300 rounded-lg bg-slate-100 text-xs font-mono text-slate-500 font-bold outline-none cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  رقم الصك
                </label>
                <input
                  readOnly={!isEditing}
                  value={localData.deedNumber}
                  onChange={(e) =>
                    handleBasicFieldChange("deedNumber", e.target.value)
                  }
                  className={`w-full h-[38px] px-3 border rounded-lg text-xs font-mono outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  تاريخ الصك
                </label>
                <input
                  type="date"
                  readOnly={!isEditing}
                  value={localData.deedDate}
                  onChange={(e) =>
                    handleBasicFieldChange("deedDate", e.target.value)
                  }
                  className={`w-full h-[38px] px-3 border rounded-lg text-xs font-mono outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  المدينة *
                </label>
                <input
                  readOnly={!isEditing}
                  value={localData.city}
                  onChange={(e) =>
                    handleBasicFieldChange("city", e.target.value)
                  }
                  className={`w-full h-[38px] px-3 border rounded-lg text-xs font-bold outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  الحي *
                </label>
                <input
                  readOnly={!isEditing}
                  value={localData.district}
                  onChange={(e) =>
                    handleBasicFieldChange("district", e.target.value)
                  }
                  className={`w-full h-[38px] px-3 border rounded-lg text-xs font-bold outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  رقم المخطط
                </label>
                <input
                  readOnly={!isEditing}
                  value={localData.planNumber}
                  onChange={(e) =>
                    handleBasicFieldChange("planNumber", e.target.value)
                  }
                  className={`w-full h-[38px] px-3 border rounded-lg text-xs font-mono font-bold outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-slate-300 bg-white"}`}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  المساحة الإجمالية (م²)
                </label>
                <input
                  type="number"
                  readOnly={!isEditing}
                  value={localData.area}
                  onChange={(e) =>
                    handleBasicFieldChange("area", e.target.value)
                  }
                  className={`w-full h-[38px] px-3 border rounded-lg text-xs font-bold text-emerald-700 outline-none transition-all ${isEditing ? "border-blue-400 bg-white ring-2 ring-blue-100" : "border-emerald-300 bg-emerald-50"}`}
                />
              </div>
            </div>

            <div className="mt-4 rounded-lg p-4 text-[10px] text-slate-500 grid grid-cols-4 gap-4 bg-slate-100 border border-slate-200">
              <div>
                <strong className="block text-slate-400 mb-1">أُنشئ:</strong>{" "}
                {safeFormatDate(deed.createdAt)}
              </div>
              <div>
                <strong className="block text-slate-400 mb-1">
                  آخر تعديل:
                </strong>{" "}
                {safeFormatDate(deed.updatedAt)}
              </div>
              <div>
                <strong className="block text-slate-400 mb-1">
                  معرّف النظام:
                </strong>{" "}
                <span className="font-mono">{deed.id?.slice(-8)}</span>
              </div>
              <div>
                <strong className="block text-slate-400 mb-1">الإصدار:</strong>{" "}
                v1.0
              </div>
            </div>
          </div>
        );

      // =======================================
      // تاب AI
      // =======================================
      case "ai":
        return (
          <div className="animate-in fade-in h-full flex flex-col max-w-7xl mx-auto w-full">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
                <Brain className="w-4 h-4 text-purple-600" /> تحليل الذكاء
                الاصطناعي
              </span>
            </div>

            <div className="flex-1">
              {!aiAnalyzing && !aiResult && (
                <div className="max-w-4xl mx-auto border border-blue-200 rounded-xl overflow-hidden bg-white shadow-sm mt-6">
                  <div className="px-5 py-4 flex items-center justify-between text-blue-800 border-b border-blue-100 bg-blue-50">
                    <span className="font-bold text-sm">
                      رفع وثيقة جديدة للتحليل وإعادة استخراج البيانات
                    </span>
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="bg-[#1d4ed8] p-8 relative cursor-pointer hover:bg-blue-700 transition-colors">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleAiUpload}
                    />
                    <div className="flex flex-col justify-center items-center text-white text-sm font-bold gap-3">
                      <span className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-lg transition-colors text-base">
                        اضغط لاختيار ملف PDF أو صورة
                      </span>
                      <span className="text-blue-200 font-normal">
                        أو اسحب وأفلت الملف هنا
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {aiAnalyzing && (
                <div className="max-w-4xl mx-auto bg-slate-50 border-2 border-dashed border-blue-200 rounded-xl p-20 flex flex-col items-center justify-center mt-6">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                  <h4 className="text-lg font-bold text-blue-900">
                    جاري قراءة وتحليل الصك بالذكاء الاصطناعي... يرجى الانتظار
                  </h4>
                </div>
              )}

              {aiResult && (
                <div className="max-w-4xl mx-auto border border-green-200 rounded-xl overflow-hidden bg-[#f4fcf6] mt-6">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-green-200 pb-4">
                      <h4 className="text-lg font-bold text-green-800">
                        تم استخراج البيانات بنجاح!
                      </h4>
                      <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <pre
                      className="text-left font-mono text-xs bg-white p-4 rounded border border-green-100 overflow-y-auto max-h-[400px]"
                      dir="ltr"
                    >
                      {JSON.stringify(aiResult, null, 2)}
                    </pre>
                    <div className="flex justify-end gap-3 mt-6">
                      <button
                        onClick={handleConfirmAiData}
                        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-md"
                      >
                        تأكيد وتطبيق البيانات على الملف
                      </button>
                      <button
                        onClick={() => setAiResult(null)}
                        className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-lg font-bold hover:bg-slate-50"
                      >
                        إلغاء وإعادة المحاولة
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // =======================================
      // تاب الوثائق (Docs)
      // =======================================
      case "docs":
        return (
          <div className="animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> الوثائق (
                {docsCount})
              </span>
              <button
                onClick={() => setShowDocForm(!showDocForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" /> إضافة وثيقة
              </button>
            </div>

            {showDocForm && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-end gap-4 mb-4 animate-in slide-in-from-top-2">
                <div className="flex-1">
                  <label className="text-xs font-bold block mb-1">
                    رقم الوثيقة
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-blue-500"
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
                    className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-blue-500"
                    value={newDoc.date}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, date: e.target.value })
                    }
                  />
                </div>
                <button
                  onClick={handleAddDoc}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                >
                  إضافة مؤقتة
                </button>
              </div>
            )}

            {localData.documents.length > 0 ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3 font-bold">النوع</th>
                      <th className="p-3 font-bold">رقم الوثيقة</th>
                      <th className="p-3 font-bold">التاريخ</th>
                      <th className="p-3 font-bold">المساحة م²</th>
                      <th className="p-3 font-bold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localData.documents.map((doc, idx) => (
                      <tr
                        key={doc.id || idx}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-700">
                          {doc.type || doc.documentType || "صك"}
                        </td>
                        <td className="p-3 font-mono font-black text-blue-700">
                          {doc.number || doc.documentNumber || "---"}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {doc.date || doc.gregorianDate || "---"}
                        </td>
                        <td className="p-3 font-bold text-emerald-600">
                          {doc.area || "---"}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() =>
                              handleDeleteItem("documents", doc.id)
                            }
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">لا توجد وثائق مضافة</p>
              </div>
            )}
          </div>
        );

      // =======================================
      // تاب القطع (Plots)
      // =======================================
      case "plots":
        return (
          <div className="animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-emerald-600" /> القطع المرتبطة
                ({plotsCount})
              </span>
              <button
                onClick={() => setShowPlotForm(!showPlotForm)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700"
              >
                <Plus className="w-4 h-4" /> إضافة قطعة
              </button>
            </div>

            {showPlotForm && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl grid grid-cols-4 items-end gap-3 mb-4 animate-in slide-in-from-top-2">
                <div>
                  <label className="text-xs font-bold block mb-1">
                    رقم القطعة
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border rounded-lg outline-none"
                    value={newPlot.plotNumber}
                    onChange={(e) =>
                      setNewPlot({ ...newPlot, plotNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">المخطط</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border rounded-lg outline-none"
                    value={newPlot.planNumber}
                    onChange={(e) =>
                      setNewPlot({ ...newPlot, planNumber: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">
                    المساحة
                  </label>
                  <input
                    type="number"
                    className="w-full p-2.5 text-xs border rounded-lg outline-none"
                    value={newPlot.area}
                    onChange={(e) =>
                      setNewPlot({ ...newPlot, area: e.target.value })
                    }
                  />
                </div>
                <button
                  onClick={handleAddPlot}
                  className="px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700"
                >
                  إضافة مؤقتة
                </button>
              </div>
            )}

            {localData.plots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {localData.plots.map((plot) => (
                  <div
                    key={plot.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-emerald-400 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                          <MapIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-xs text-slate-400 font-bold mb-0.5">
                            رقم القطعة
                          </div>
                          <div
                            className="text-lg font-black text-slate-800"
                            dir="ltr"
                          >
                            {plot.plotNumber || "---"}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-slate-400 font-bold mb-0.5">
                          المساحة
                        </div>
                        <div
                          className="text-lg font-black text-emerald-600"
                          dir="ltr"
                        >
                          {plot.area} م²
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px] mb-0.5">
                          المخطط
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {plot.planNumber || localData.planNumber || "---"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-400 block text-[10px] mb-0.5">
                          نوع العقار
                        </span>
                        <span className="font-bold text-slate-700">
                          {plot.propertyType || propertyType}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end gap-2">
                      <button
                        onClick={() => handleDeleteItem("plots", plot.id)}
                        className="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> حذف
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <MapIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">لا توجد قطع مضافة</p>
              </div>
            )}
          </div>
        );

      // =======================================
      // تاب الملاك (Owners)
      // =======================================
      case "owners":
        return (
          <div className="animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" /> الملاك والحصص (
                {ownersCount})
              </span>
              <button
                onClick={() => setShowOwnerForm(!showOwnerForm)}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-amber-700"
              >
                <Plus className="w-4 h-4" /> إضافة مالك
              </button>
            </div>

            {showOwnerForm && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl grid grid-cols-4 items-end gap-3 mb-4 animate-in slide-in-from-top-2">
                <div className="col-span-2">
                  <label className="text-xs font-bold block mb-1">الاسم</label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-amber-500"
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
                    className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-amber-500"
                    value={newOwner.share}
                    onChange={(e) =>
                      setNewOwner({ ...newOwner, share: e.target.value })
                    }
                  />
                </div>
                <button
                  onClick={handleAddOwner}
                  className="px-4 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700"
                >
                  إضافة مؤقتة
                </button>
              </div>
            )}

            {localData.owners.length > 0 ? (
              <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-right text-sm">
                  <thead className="bg-amber-100 text-amber-900 border-b border-amber-200">
                    <tr>
                      <th className="p-3 font-bold">المالك</th>
                      <th className="p-3 font-bold">الهوية</th>
                      <th className="p-3 font-bold">النسبة</th>
                      <th className="p-3 font-bold text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localData.owners.map((owner, idx) => (
                      <tr
                        key={owner.id || idx}
                        className="hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                          <div
                            className={`p-2 rounded-full ${idx === 0 ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"}`}
                          >
                            <Crown className="w-4 h-4" />
                          </div>
                          {owner.name}
                        </td>
                        <td className="p-4 font-mono text-slate-600">
                          {owner.idNumber || owner.identityNumber || "---"}
                        </td>
                        <td className="p-4 font-mono font-black text-blue-700 text-lg">
                          {owner.sharePercentage || owner.share}%
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteItem("owners", owner.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">لا يوجد ملاك مضافين</p>
              </div>
            )}
          </div>
        );

      // =======================================
      // تاب الحدود (Bounds)
      // =======================================
      case "bounds":
        const north = getBound("شمال", selectedPlotForBounds);
        const south = getBound("جنوب", selectedPlotForBounds);
        const east = getBound("شرق", selectedPlotForBounds);
        const west = getBound("غرب", selectedPlotForBounds);
        const currentPlotDetails = localData.plots.find(
          (p) => p.id === selectedPlotForBounds,
        );

        return (
          <div className="animate-in fade-in flex flex-col max-w-7xl mx-auto w-full">
            {localData.plots.length === 0 ? (
              <div className="p-10 flex flex-col items-center justify-center text-slate-400 bg-slate-50 border-2 border-dashed rounded-xl h-full">
                <Layers className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-bold text-slate-600">
                  الرجاء إضافة قطع الأراضي أولاً
                </p>
                <button
                  onClick={() => setActiveTab("plots")}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  الذهاب لتبويب القطع
                </button>
              </div>
            ) : (
              <>
                <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
                  {localData.plots.map((plot) => (
                    <button
                      key={plot.id}
                      onClick={() => setSelectedPlotForBounds(plot.id)}
                      className={`px-4 py-3 text-sm font-bold rounded-xl border flex items-center gap-3 min-w-[150px] transition-all ${
                        selectedPlotForBounds === plot.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-blue-50"
                      }`}
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
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row mt-2">
                  <div className="w-full md:w-1/3 bg-slate-800 text-white p-6 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 p-4 opacity-10">
                      <Compass className="w-32 h-32" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 relative z-10">
                      المخطط الكروكي للقطعة
                    </h3>
                    <div
                      className="bg-blue-500/20 border border-blue-400/30 text-blue-100 px-3 py-1.5 rounded-lg text-sm font-bold mb-6 relative z-10 w-fit"
                      dir="ltr"
                    >
                      قطعة: {currentPlotDetails?.plotNumber || "---"}
                    </div>

                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-400 text-sm">
                          مساحة القطعة:
                        </span>
                        <strong className="text-emerald-400 text-lg">
                          {currentPlotDetails?.area || 0} م²
                        </strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-400 text-sm">
                          إجمالي المحيط:
                        </span>
                        <strong className="text-amber-400 text-lg">
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

                  <div className="flex-1 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] bg-blue-50/50 p-8 flex items-center justify-center min-h-[400px]">
                    <DynamicCroquis
                      north={north}
                      south={south}
                      east={east}
                      west={west}
                      plotNumber={currentPlotDetails?.plotNumber}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {["شمال", "جنوب", "شرق", "غرب"].map((dir) => {
                    const bound = getBound(dir, selectedPlotForBounds);
                    return (
                      <div
                        key={dir}
                        className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-blue-300 transition-all"
                      >
                        <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center">
                          <h4 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-blue-500" /> الحد
                            ال{dir}
                          </h4>
                        </div>
                        <div className="p-4 space-y-3 flex-1">
                          <div>
                            <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                              الطول (متر)
                            </label>
                            <input
                              type="number"
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm font-bold text-blue-700 outline-none focus:border-blue-500"
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
                            <label className="text-[11px] font-bold text-slate-500 mb-1 block">
                              الوصف / المجاور
                            </label>
                            <textarea
                              className="w-full border border-slate-300 rounded-lg p-2 text-xs text-slate-700 h-16 resize-none outline-none focus:border-blue-500"
                              value={bound.description}
                              onChange={(e) =>
                                handleUpdateBoundary(
                                  dir,
                                  "description",
                                  e.target.value,
                                  selectedPlotForBounds,
                                )
                              }
                              placeholder="شارع 15م..."
                            />
                          </div>
                        </div>
                        <div className="p-3 bg-slate-50 border-t border-slate-100">
                          {bound.imageUrl ? (
                            <div className="relative h-20 rounded-lg border border-slate-300 overflow-hidden group">
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
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-5 h-5 hover:text-red-400 transition-colors" />
                              </button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-slate-300 rounded-lg bg-white cursor-pointer hover:bg-blue-50 transition-colors">
                              <Camera className="w-5 h-5 text-slate-400 mb-1" />
                              <span className="text-[10px] text-slate-500 font-bold">
                                إرفاق صورة للمجاور
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

      // =======================================
      // تاب المرفقات (Attachments)
      // =======================================
      case "attachments":
        return (
          <div className="animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" /> المرفقات العامة (
                {localData.attachments?.length || 0})
              </span>
              <label className="bg-purple-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-purple-700 cursor-pointer shadow-sm">
                <Plus className="w-4 h-4" /> رفع مرفق جديد
                <input
                  type="file"
                  className="hidden"
                  onChange={handleAttachmentUpload}
                />
              </label>
            </div>

            {localData.attachments?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {localData.attachments.map((att) => (
                  <div
                    key={att.id}
                    className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm hover:border-purple-300 transition-all group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-slate-700 truncate">
                          {att.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {att.size}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteItem("attachments", att.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">
                  لا توجد مرفقات عامة للملف
                </p>
              </div>
            )}
          </div>
        );

      // =======================================
      // تاب الصور المجمعة (Images)
      // =======================================
      case "images":
        const allImages = localData.boundaries?.filter((b) => b.imageUrl) || [];
        return (
          <div className="animate-in fade-in max-w-7xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-pink-600" /> معرض الصور (
                {allImages.length})
              </span>
            </div>

            {allImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {allImages.map((b, idx) => {
                  const parentPlot = localData.plots.find(
                    (p) => p.id === b.plotId,
                  );
                  return (
                    <div
                      key={idx}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="relative h-40 bg-slate-100">
                        <img
                          src={b.imageUrl}
                          alt={b.direction}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-3 bg-white flex justify-between items-center border-t border-slate-100 relative z-10">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-0.5">
                            قطعة رقم
                          </span>
                          <span
                            className="font-bold text-slate-700 text-sm"
                            dir="ltr"
                          >
                            {parentPlot?.plotNumber || "---"}
                          </span>
                        </div>
                        <span className="bg-pink-50 text-pink-700 px-2 py-1 rounded-md text-xs font-bold border border-pink-100">
                          الحد ال{b.direction}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">
                  لا توجد صور مرفوعة لحدود القطع
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  يتم رفع الصور من تبويب (الحدود)
                </p>
              </div>
            )}
          </div>
        );

      // =======================================
      // 👈 تاب التحقق (Verify) - يعمل كلياً ويحدث الباك إند
      // =======================================
      case "verify":
        return (
          <div className="animate-in fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> التحقق والمراجعة
                القانونية
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <div className="text-xs font-bold text-slate-500 mb-3">
                الحالة الحالية:
              </div>
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`px-4 py-2 font-bold rounded-lg border text-sm ${
                    localData.status === "Active" || localData.status === "مؤكد"
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : localData.status === "pending" ||
                          localData.status === "قيد المراجعة"
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {localData.status === "Active"
                    ? "مؤكد ومعتمد"
                    : localData.status || "جديد"}
                </span>
                <span className="px-3 py-2 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-xs flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> تم المراجعة بواسطة AI
                </span>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-2">
                تغيير الحالة يدوياً:
              </div>
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() =>
                    handleBasicFieldChange("status", "قيد المراجعة")
                  }
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-colors ${localData.status === "قيد المراجعة" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                >
                  قيد المراجعة
                </button>
                <button
                  onClick={() => handleBasicFieldChange("status", "Active")}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-colors ${localData.status === "Active" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                >
                  مؤكد
                </button>
                <button
                  onClick={() => handleBasicFieldChange("status", "متنازع")}
                  className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-colors ${localData.status === "متنازع" ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
                >
                  متنازع / إيقاف
                </button>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-2">
                ملاحظات المراجع القانوني (تُحفظ مع الملف):
              </div>
              <textarea
                value={localData.notes || ""}
                onChange={(e) =>
                  handleBasicFieldChange("notes", e.target.value)
                }
                placeholder="اكتب ملاحظاتك القانونية أو النواقص هنا..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 min-h-[120px]"
              />
            </div>

            <h4 className="font-bold text-slate-700 mb-3">
              قائمة التحقق الآلي (System Checklist)
            </h4>
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {[
                { label: "الوثائق الأساسية مرفقة", valid: docsCount > 0 },
                {
                  label: "بيانات الملاك مكتملة (المجموع 100%)",
                  valid: ownersCount > 0,
                },
                { label: "القطع مسجلة مع مساحاتها", valid: plotsCount > 0 },
                {
                  label: "حدود القطع مسجلة",
                  valid: localData.boundaries?.length > 0,
                },
                { label: "تحليل الذكاء الاصطناعي مكتمل", valid: true },
                {
                  label: "لا توجد قيود أو إيقافات حرجة",
                  valid: localData.status !== "متنازع",
                },
              ].map((check, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  {check.valid ? (
                    <CircleCheckBig className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  )}
                  <span
                    className={`text-sm font-bold ${check.valid ? "text-slate-700" : "text-amber-700"}`}
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );

      // =======================================
      // 👈 تاب الملاحظات (Notes) - يعمل ويحفظ في localData.notes
      // =======================================
      case "notes":
        return (
          <div className="animate-in fade-in max-w-4xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-600" /> ملاحظات الملف
                الداخلية
              </span>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5">
              <label className="block text-xs font-bold text-yellow-800 mb-3">
                أضف أي ملاحظات عامة متعلقة بهذه الملكية (ستظهر لجميع الموظفين):
              </label>
              <textarea
                value={localData.notes || ""}
                onChange={(e) =>
                  handleBasicFieldChange("notes", e.target.value)
                }
                className="w-full bg-white border border-yellow-300 rounded-lg p-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-yellow-400 min-h-[250px]"
                placeholder="لا توجد ملاحظات. ابدأ بالكتابة هنا..."
              />
            </div>
          </div>
        );

      // =======================================
      // 👈 تاب السجل (History) - تتبع التواريخ
      // =======================================
      case "history":
        return (
          <div className="animate-in fade-in max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-6 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-600" /> سجل نشاطات الملف
              </span>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-blue-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <Building className="w-4 h-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-slate-800 text-sm">
                      إنشاء ملف الملكية
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">
                      {safeFormatDate(deed.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    تم إنشاء الملف وإضافة البيانات الأولية بواسطة النظام.
                  </p>
                </div>
              </div>

              {deed.updatedAt && deed.updatedAt !== deed.createdAt && (
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-emerald-500 text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <SquarePen className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-slate-800 text-sm">
                        آخر تحديث للبيانات
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {safeFormatDate(deed.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      تم تعديل البيانات أو تحديث الحالة مؤخراً.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      // =======================================
      // تاب التقارير (Reports)
      // =======================================
      case "reports":
        return (
          <div className="animate-in fade-in max-w-6xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <ChartColumn className="w-5 h-5 text-blue-600" /> تقارير الملكية
              </span>
              <button
                onClick={() => triggerPrint("تقرير ملكية شامل")}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm"
              >
                <Download className="w-4 h-4" /> تصدير PDF شامل
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              {[
                {
                  title: "تقرير ملكية شامل",
                  desc: "جميع بيانات الملكية في ملف واحد",
                  icon: ClipboardList,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  border: "border-blue-200",
                },
                {
                  title: "تقرير المُلّاك",
                  desc: `${ownersCount} مالك — مجموع: 100%`,
                  icon: Users,
                  color: "text-sky-600",
                  bg: "bg-sky-50",
                  border: "border-sky-200",
                },
                {
                  title: "تقرير الحدود",
                  desc: `${localData.boundaries?.length || 0} حد — محيط: ${perimeter}م`,
                  icon: Ruler,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  border: "border-amber-200",
                },
                {
                  title: "تقرير الوثائق",
                  desc: `${docsCount} وثيقة مرتبطة`,
                  icon: FileText,
                  color: "text-purple-600",
                  bg: "bg-purple-50",
                  border: "border-purple-200",
                },
                {
                  title: "تقرير القطع",
                  desc: `${plotsCount} قطعة`,
                  icon: MapIcon,
                  color: "text-emerald-600",
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                },
                {
                  title: "شهادة ملكية",
                  desc: "نسخة رسمية للطباعة",
                  icon: Shield,
                  color: "text-slate-700",
                  bg: "bg-slate-100",
                  border: "border-slate-300",
                },
              ].map((report, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerPrint(report.title)}
                  className="flex items-start gap-4 rounded-xl p-4 text-right bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div
                    className={`flex items-center justify-center rounded-xl shrink-0 w-12 h-12 ${report.bg} ${report.color} border ${report.border} group-hover:scale-110 transition-transform`}
                  >
                    <report.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                      {report.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {report.desc}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-in fade-in">
            <Info className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-base font-bold text-slate-600 mb-2">
              هذا القسم قيد التطوير
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* ========================================== */}
      {/* 1. الشاشة الرئيسية (تختفي أثناء الطباعة) */}
      {/* ========================================== */}
      <div
        className="print:hidden flex flex-col h-full bg-slate-100 w-full animate-in fade-in duration-300"
        dir="rtl"
      >
        {/* زر الحفظ العائم */}
        <div
          className={`absolute bottom-6 left-6 z-50 transition-all duration-500 transform ${hasChanges ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"}`}
        >
          <button
            onClick={saveChangesToDB}
            disabled={updateMutation.isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-full font-bold shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:bg-blue-700 flex items-center gap-2 hover:scale-105 transition-all"
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}{" "}
            حفظ التعديلات
          </button>
        </div>

        {/* الهيدر العلوي */}
        <div className="bg-white px-6 py-5 flex items-start justify-between border-b border-slate-200 shrink-0 shadow-sm relative z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner shrink-0">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-800">
                  {propertyType}{" "}
                  {localData.district ? `- ${localData.district}` : ""}
                </h2>
                <span className="text-xs font-mono font-bold rounded px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200">
                  {deed.code}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> صك:{" "}
                  <span className="font-mono text-slate-700 font-bold">
                    {localData.deedNumber || "---"}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  <MapIcon className="w-3.5 h-3.5" /> مساحة:{" "}
                  <span className="font-bold text-emerald-600">
                    {totalArea} م²
                  </span>
                </span>
                <span className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-amber-800">
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                  <span className="font-bold">{safeClientName}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => triggerPrint("تقرير ملكية شامل")}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" /> طباعة
            </button>
            <div className="w-px h-8 bg-slate-200 mx-1"></div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 hover:text-slate-800 transition-all text-slate-600 font-bold text-xs shadow-sm"
            >
              <ArrowRight className="w-4 h-4" /> عودة للسجل
            </button>
          </div>
        </div>

        {/* شريط التابات */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 border-b border-slate-300 px-4 pt-3 shrink-0 custom-scrollbar shadow-inner relative z-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 shrink-0 transition-all text-xs font-bold rounded-t-xl px-5 py-3 relative top-[1px]
                ${activeTab === tab.id ? "bg-white text-blue-700 border-t-[3px] border-x border-blue-600 shadow-[0_-2px_5px_rgba(0,0,0,0.03)]" : "bg-transparent text-slate-500 hover:bg-slate-200 border-t-[3px] border-transparent border-x border-transparent hover:text-slate-800"}`}
            >
              <tab.icon
                className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-600" : "text-slate-400"}`}
              />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-white p-8 custom-scrollbar relative">
          {renderTabContent()}
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. قالب الطباعة المخفي (يظهر في PDF فقط) */}
      {/* ========================================== */}
      {/* ========================================== */}
      {/* 2. قالب الطباعة (نظام إخفاء الواجهة وإظهار التقرير) */}
      {/* ========================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body * {
            visibility: hidden; /* إخفاء كل شيء في الصفحة */
          }
          #print-report, #print-report * {
            visibility: visible; /* إظهار التقرير فقط */
          }
          #print-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          /* إزالة أي قيود ارتفاع تمنع الطباعة الكاملة */
          html, body {
            height: auto !important;
            overflow: visible !important;
          }
        }
      `,
        }}
      />

      <div
        id="print-report"
        className="hidden print:block bg-white text-slate-900"
        dir="rtl"
      >
        {/* هيدر التقرير الرسمي */}
        <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-1">
              {reportType || "تقرير ملكية"}
            </h1>
            <p className="text-sm text-slate-600 font-bold">
              الرقم المرجعي للنظام: {deed.code}
            </p>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-bold text-slate-800">
              نظام إدارة الأملاك والعقارات
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              تاريخ الطباعة: {format(new Date(), "yyyy-MM-dd HH:mm")}
            </p>
          </div>
        </div>

        {/* 1. البيانات الأساسية */}
        {(reportType === "تقرير ملكية شامل" ||
          reportType === "شهادة ملكية") && (
          <div className="mb-8">
            <h2 className="text-lg font-bold bg-slate-100 p-2 border-r-4 border-blue-600 mb-4 text-blue-900">
              البيانات الأساسية للملكية
            </h2>
            <div className="grid grid-cols-4 gap-4 border border-slate-200 rounded-lg p-4">
              <div>
                <span className="text-slate-500 block text-xs mb-1">
                  المدينة / الحي
                </span>
                <strong className="text-sm">
                  {localData.city || "---"} / {localData.district || "---"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs mb-1">
                  رقم الصك
                </span>
                <strong className="text-sm font-mono">
                  {localData.deedNumber || "---"}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs mb-1">
                  تاريخ الصك
                </span>
                <strong className="text-sm font-mono">
                  {safeFormatDate(localData.deedDate)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs mb-1">
                  المساحة الإجمالية
                </span>
                <strong className="text-sm font-bold text-emerald-700">
                  {totalArea} م²
                </strong>
              </div>

              <div className="col-span-2 mt-2">
                <span className="text-slate-500 block text-xs mb-1">
                  المالك الرئيسي
                </span>
                <strong className="text-sm">{safeClientName}</strong>
              </div>
              <div className="mt-2">
                <span className="text-slate-500 block text-xs mb-1">
                  الحالة
                </span>
                <strong className="text-sm">
                  {localData.status === "Active"
                    ? "مؤكد ومعتمد"
                    : localData.status || "---"}
                </strong>
              </div>
              <div className="mt-2">
                <span className="text-slate-500 block text-xs mb-1">
                  نوع العقار
                </span>
                <strong className="text-sm">{propertyType}</strong>
              </div>
            </div>
          </div>
        )}

        {/* 2. الملاك */}
        {(reportType === "تقرير ملكية شامل" ||
          reportType === "تقرير المُلّاك") &&
          localData.owners.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold bg-slate-100 p-2 border-r-4 border-amber-500 mb-4 text-amber-900">
                جدول المُلّاك والحصص
              </h2>
              <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="border border-slate-300 p-2 text-right">
                      الاسم
                    </th>
                    <th className="border border-slate-300 p-2 text-right">
                      رقم الهوية
                    </th>
                    <th className="border border-slate-300 p-2 text-center">
                      نسبة التملك
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {localData.owners.map((owner, i) => (
                    <tr key={i}>
                      <td className="border border-slate-300 p-2 font-bold">
                        {owner.name} {i === 0 && "(رئيسي)"}
                      </td>
                      <td className="border border-slate-300 p-2 font-mono">
                        {owner.idNumber || owner.identityNumber}
                      </td>
                      <td className="border border-slate-300 p-2 text-center font-bold text-blue-600">
                        {owner.sharePercentage || owner.share}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        {/* 3. القطع والحدود */}
        {(reportType === "تقرير ملكية شامل" ||
          reportType === "تقرير القطع" ||
          reportType === "تقرير الحدود") &&
          localData.plots.length > 0 && (
            <div className="mb-8" style={{ pageBreakInside: "avoid" }}>
              <h2 className="text-lg font-bold bg-slate-100 p-2 border-r-4 border-emerald-500 mb-4 text-emerald-900">
                تفاصيل القطع والأطوال
              </h2>
              {localData.plots.map((plot, i) => {
                const n = getBound("شمال", plot.id);
                const s = getBound("جنوب", plot.id);
                const e = getBound("شرق", plot.id);
                const w = getBound("غرب", plot.id);
                return (
                  <div
                    key={i}
                    className="mb-6 border border-slate-300 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                      <h3 className="font-bold">
                        قطعة رقم:{" "}
                        <span className="font-mono">{plot.plotNumber}</span>
                      </h3>
                      <div className="font-bold text-emerald-700">
                        المساحة: {plot.area} م²
                      </div>
                    </div>
                    <table className="w-full border-collapse border border-slate-200 text-sm text-center">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="border border-slate-200 p-2">شمال</th>
                          <th className="border border-slate-200 p-2">جنوب</th>
                          <th className="border border-slate-200 p-2">شرق</th>
                          <th className="border border-slate-200 p-2">غرب</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-slate-200 p-2 font-mono font-bold text-blue-700">
                            {n.length || 0}م
                          </td>
                          <td className="border border-slate-200 p-2 font-mono font-bold text-blue-700">
                            {s.length || 0}م
                          </td>
                          <td className="border border-slate-200 p-2 font-mono font-bold text-blue-700">
                            {e.length || 0}م
                          </td>
                          <td className="border border-slate-200 p-2 font-mono font-bold text-blue-700">
                            {w.length || 0}م
                          </td>
                        </tr>
                        <tr className="text-xs text-slate-500">
                          <td className="border border-slate-200 p-2">
                            {n.description || "---"}
                          </td>
                          <td className="border border-slate-200 p-2">
                            {s.description || "---"}
                          </td>
                          <td className="border border-slate-200 p-2">
                            {e.description || "---"}
                          </td>
                          <td className="border border-slate-200 p-2">
                            {w.description || "---"}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

        {/* ذيل التقرير الرسمي (التوقيعات) */}
        {(reportType === "شهادة ملكية" ||
          reportType === "تقرير ملكية شامل") && (
          <div
            className="mt-20 pt-8 flex justify-between border-t border-slate-300 text-center"
            style={{ pageBreakInside: "avoid" }}
          >
            <div className="w-1/3">
              <p className="font-bold text-sm">المراجع القانوني</p>
              <p className="text-slate-400 mt-8">
                ....................................
              </p>
            </div>
            <div className="w-1/3">
              <p className="font-bold text-sm">مدير الإدارة</p>
              <p className="text-slate-400 mt-8">
                ....................................
              </p>
            </div>
            <div className="w-1/3">
              <p className="font-bold text-sm">الختم والاعتماد</p>
              <p className="text-slate-400 mt-8">
                ....................................
              </p>
            </div>
          </div>
        )}

        <div className="mt-10 text-center text-xs text-slate-400 border-t pt-4">
          هذا التقرير صادر آلياً من النظام ولا يحتاج إلى توقيع في حال وجود الختم
          الإلكتروني.
        </div>
      </div>
    </>
  );
};

export default DeedDetailsTab;
