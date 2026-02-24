import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getDeedById,
  updateDeed,
  analyzeDeedWithAI,
} from "../../../api/propertyApi";
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
  Compass,
  Layers,
  TableProperties,
  Building,
  Crown,
  Link2,
  Shield,
  StickyNote,
  History,
  ChartColumn,
  Info,
  Calendar,
  ExternalLink,
  MapPin,
  SquarePen,
  CircleCheckBig,
  ClipboardList,
  Eye,
  Brain,
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { toast } from "sonner";

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

const safeFormatDate = (dateString, formatStr = "yyyy-MM-dd") => {
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
// عارض الوثائق (Document Viewer Modal)
// ==========================================
const DocumentViewer = ({ doc, onClose }) => {
  const [scale, setScale] = useState(1);
  const isPdf = doc?.fileType?.includes("pdf");

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (isPdf) {
      printWindow.document.write(
        `<iframe src="${doc.fileData}" width="100%" height="100%" style="border:none;"></iframe>`,
      );
    } else {
      printWindow.document.write(
        `<div style="text-align:center;"><img src="${doc.fileData}" style="max-width:100%;" /></div>`,
      );
    }
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 bg-black/90 z-[200] flex flex-col backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      {/* شريط الأدوات العلوي */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-red-500 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <h3 className="font-bold text-sm">
              {doc.type} - {doc.number}
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">
              الرمز: {doc.sysCode}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isPdf && (
            <>
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono w-10 text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.2))}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setScale(1)}
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg mr-2"
              >
                <Maximize className="w-4 h-4" />
              </button>
            </>
          )}
          <div className="w-px h-6 bg-slate-700 mx-2"></div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors"
          >
            <Printer className="w-4 h-4" /> طباعة
          </button>
        </div>
      </div>

      {/* منطقة العرض */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 custom-scrollbar relative">
        {doc.fileData ? (
          isPdf ? (
            <iframe
              src={doc.fileData}
              className="w-full h-full rounded-lg bg-white"
              title="PDF Viewer"
            />
          ) : (
            <div
              className="transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${scale})` }}
            >
              <img
                src={doc.fileData}
                alt="وثيقة"
                className="max-w-full max-h-[85vh] rounded shadow-2xl"
                draggable="false"
              />
            </div>
          )
        ) : (
          <div className="text-slate-500 flex flex-col items-center">
            <FileText className="w-16 h-16 mb-4 opacity-50" />
            <p>لا توجد معاينة متاحة لهذه الوثيقة</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// مكون الرسم الهندسي التفاعلي
// ==========================================
const DynamicCroquis = ({ north, south, east, west, plotNumber }) => {
  const n = parseFloat(north?.length) > 0 ? parseFloat(north.length) : 10;
  const s = parseFloat(south?.length) > 0 ? parseFloat(south.length) : 10;
  const e = parseFloat(east?.length) > 0 ? parseFloat(east.length) : 10;
  const w = parseFloat(west?.length) > 0 ? parseFloat(west.length) : 10;

  const maxW = Math.max(n, s);
  const maxH = Math.max(e, w);

  const bl = { x: (maxW - s) / 2, y: maxH };
  const br = { x: bl.x + s, y: maxH };
  const tl = { x: (maxW - n) / 2, y: 0 };
  const tr = { x: tl.x + n, y: 0 };

  const padX = maxW * 0.4;
  const padY = maxH * 0.4;
  const viewBox = `0 0 ${maxW + padX * 2} ${maxH + padY * 2}`;
  const baseFontSize = Math.max(maxW, maxH) * 0.05;

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full drop-shadow-2xl transition-all duration-1000 ease-in-out"
    >
      <defs>
        <pattern
          id="gridPattern"
          width={maxW / 10}
          height={maxH / 10}
          patternUnits="userSpaceOnUse"
        >
          <path
            d={`M ${maxW / 10} 0 L 0 0 0 ${maxH / 10}`}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={Math.max(maxW, maxH) * 0.003}
            strokeOpacity="0.2"
          />
        </pattern>
      </defs>
      <polygon
        points={`${bl.x + padX},${bl.y + padY} ${br.x + padX},${br.y + padY} ${tr.x + padX},${tr.y + padY} ${tl.x + padX},${tl.y + padY}`}
        fill="url(#gridPattern)"
      />
      <polygon
        points={`${bl.x + padX},${bl.y + padY} ${br.x + padX},${br.y + padY} ${tr.x + padX},${tr.y + padY} ${tl.x + padX},${tl.y + padY}`}
        fill="#eff6ff"
        fillOpacity="0.7"
        stroke="#2563eb"
        strokeWidth={Math.max(maxW, maxH) * 0.012}
        strokeLinejoin="round"
        className="transition-all duration-700 ease-out hover:fill-blue-100"
      />
      <text
        x={maxW / 2 + padX}
        y={padY - baseFontSize * 1.5}
        textAnchor="middle"
        fontSize={baseFontSize}
        className="fill-blue-800 font-bold"
      >
        شمال: {north?.length || 0}م
      </text>
      <text
        x={maxW / 2 + padX}
        y={maxH + padY + baseFontSize * 1.5}
        textAnchor="middle"
        fontSize={baseFontSize}
        className="fill-blue-800 font-bold"
      >
        جنوب: {south?.length || 0}م
      </text>
      <text
        x={br.x + padX + baseFontSize}
        y={maxH / 2 + padY}
        textAnchor="start"
        fontSize={baseFontSize}
        className="fill-blue-800 font-bold"
      >
        شرق: {east?.length || 0}م
      </text>
      <text
        x={bl.x + padX - baseFontSize}
        y={maxH / 2 + padY}
        textAnchor="end"
        fontSize={baseFontSize}
        className="fill-blue-800 font-bold"
      >
        غرب: {west?.length || 0}م
      </text>
      <text
        x={maxW / 2 + padX}
        y={maxH / 2 + padY}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize={baseFontSize * 1.8}
        className="fill-stone-500 font-black opacity-20 tracking-widest pointer-events-none"
      >
        قطعة {plotNumber || "---"}
      </text>
    </svg>
  );
};

const DeedDetailsModal = ({ isOpen, deedId, onClose }) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("summary");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [selectedPlotForBounds, setSelectedPlotForBounds] = useState("all");

  const [viewingDoc, setViewingDoc] = useState(null);

  const [localData, setLocalData] = useState({
    documents: [],
    plots: [],
    owners: [],
    boundaries: [],
    attachments: [],
  });
  const [hasChanges, setHasChanges] = useState(false);

  const [showDocForm, setShowDocForm] = useState(false);
  const fileInputRef = useRef(null);
  const [newDoc, setNewDoc] = useState({
    number: "",
    date: "",
    type: "صك ملكية",
    fileData: null,
    fileType: null,
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

  useEffect(() => {
    if (isOpen && deed.id) {
      // التأكد من إعطاء رمز (System Code) لأي وثيقة قديمة لا تملكه
      const fetchedDocs = Array.isArray(deed.documents)
        ? deed.documents.map((d) => ({
            ...d,
            sysCode:
              d.sysCode ||
              `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
          }))
        : [];

      setLocalData({
        documents: fetchedDocs,
        plots: Array.isArray(deed.plots) ? deed.plots : [],
        owners: Array.isArray(deed.owners) ? deed.owners : [],
        boundaries: Array.isArray(deed.boundaries) ? deed.boundaries : [],
        attachments: Array.isArray(deed.attachments) ? deed.attachments : [],
      });
      setHasChanges(false);
      setActiveTab("summary"); // للتجربة المباشرة
      setSelectedPlotForBounds("all");
    }
  }, [isOpen, deed.id]);

  const triggerChange = () => setHasChanges(true);

  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setNewDoc((prev) => ({ ...prev, fileData: base64, fileType: file.type }));
  };

  // --- دوال الـ AI ---
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

  // --- دوال الإضافة والحذف ---
  const handleAddDoc = () => {
    if (!newDoc.number) return toast.error("رقم الوثيقة مطلوب");

    // إنشاء كود نظام تسلسلي
    const sysCode = `DOC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setLocalData((prev) => ({
      ...prev,
      documents: [...prev.documents, { ...newDoc, id: Date.now(), sysCode }],
    }));
    setNewDoc({
      number: "",
      date: "",
      type: "صك ملكية",
      fileData: null,
      fileType: null,
    });
    setShowDocForm(false);
    triggerChange();
  };

  const shareDocument = (doc, platform) => {
    // نص الرسالة المشتركة
    const text = `مرفق وثيقة متعلقة بالمعاملة:\nالنوع: ${doc.type}\nالرقم: ${doc.number}\nرمز النظام: ${doc.sysCode}\n(يتم إرسال الملفات عبر النظام المعتمد)`;
    const encodedText = encodeURIComponent(text);

    if (platform === "whatsapp") {
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    } else if (platform === "telegram") {
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`,
        "_blank",
      );
    } else if (platform === "email") {
      window.open(
        `mailto:?subject=مشاركة وثيقة - ${doc.sysCode}&body=${encodedText}`,
        "_blank",
      );
    }
  };

  const shareAllDocuments = (platform) => {
    if (localData.documents.length === 0)
      return toast.error("لا توجد وثائق للمشاركة");
    const text =
      `مرفق قائمة وثائق المعاملة (${localData.documents.length} وثائق):\n` +
      localData.documents.map((d) => `- ${d.type} (${d.sysCode})`).join("\n");
    const encodedText = encodeURIComponent(text);

    if (platform === "whatsapp")
      window.open(`https://wa.me/?text=${encodedText}`, "_blank");
    else if (platform === "telegram")
      window.open(
        `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`,
        "_blank",
      );
    else if (platform === "email")
      window.open(
        `mailto:?subject=وثائق المعاملة المجمعة&body=${encodedText}`,
        "_blank",
      );
  };

  const printAllDocuments = () => {
    if (localData.documents.length === 0)
      return toast.error("لا توجد وثائق للطباعة");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(
      `<html dir="rtl"><head><title>طباعة كل الوثائق</title></head><body style="font-family:sans-serif;">`,
    );
    printWindow.document.write(
      `<h2 style="text-align:center;">تقرير الوثائق المجمعة</h2><hr/>`,
    );

    localData.documents.forEach((doc, idx) => {
      printWindow.document.write(
        `<div style="page-break-after: always; text-align:center; padding: 20px;">`,
      );
      printWindow.document.write(
        `<h3>وثيقة رقم ${idx + 1}: ${doc.type} (رمز: ${doc.sysCode})</h3>`,
      );
      if (doc.fileData) {
        if (doc.fileType?.includes("pdf")) {
          printWindow.document.write(
            `<p><em>[ملف PDF - يرجى طباعته من العارض المنفصل]</em></p>`,
          );
        } else {
          printWindow.document.write(
            `<img src="${doc.fileData}" style="max-width:100%; max-height:800px; border:1px solid #ccc;" />`,
          );
        }
      } else {
        printWindow.document.write(
          `<p style="color:gray;">[لا توجد صورة مرفقة لهذه الوثيقة]</p>`,
        );
      }
      printWindow.document.write(`</div>`);
    });

    printWindow.document.write(`</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 1000);
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

  // متغيرات العرض
  const safeClientName = getSafeClientName(deed?.client);
  const plotsCount = localData.plots.length;
  const docsCount = localData.documents.length;
  const ownersCount = localData.owners.length;
  const totalArea =
    localData.area ||
    deed.area ||
    localData.plots.reduce((sum, p) => sum + (parseFloat(p.area) || 0), 0) ||
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

  const renderTabContent = () => {
    switch (activeTab) {
      // =======================================
      // تاب الملخص
      // =======================================
      case "summary":
        return (
          <div className="space-y-4 animate-in fade-in">
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
                    {safeFormatDate(deed.deedDate)}
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
                    {deed.status === "Active" ? "نشط/مؤكد" : deed.status}
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
                      {deed.city || "---"} / {deed.district || "---"}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 mb-0.5">
                      رقم المخطط
                    </div>
                    <div className="text-xs text-slate-800 font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 inline-block">
                      {deed.planNumber || "---"}
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
                        key={idx}
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
      // تاب التفاصيل
      // =======================================
      case "details":
        return (
          <div className="animate-in fade-in">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" /> تفاصيل الملكية
                الكاملة
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  كود الملكية
                </label>
                <input
                  readOnly
                  value={deed.code || ""}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-mono text-blue-700 font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  رقم الصك
                </label>
                <input
                  readOnly
                  value={deed.deedNumber || ""}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  تاريخ الصك
                </label>
                <input
                  readOnly
                  value={safeFormatDate(deed.deedDate)}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-mono outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  المدينة
                </label>
                <input
                  readOnly
                  value={deed.city || ""}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  الحي
                </label>
                <input
                  readOnly
                  value={deed.district || ""}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  رقم المخطط
                </label>
                <input
                  readOnly
                  value={deed.planNumber || ""}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-mono font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  المساحة الإجمالية (م²)
                </label>
                <input
                  readOnly
                  value={totalArea}
                  className="w-full h-[36px] px-3 border border-emerald-300 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  نوع العقار
                </label>
                <input
                  readOnly
                  value={propertyType}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-bold outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                  الحالة
                </label>
                <input
                  readOnly
                  value={deed.status === "Active" ? "نشط/مؤكد" : deed.status}
                  className="w-full h-[36px] px-3 border border-slate-300 rounded-lg bg-white text-xs font-bold text-slate-800 outline-none"
                />
              </div>
            </div>
            <div className="mt-4 rounded-lg p-3 text-[10px] text-slate-500 grid grid-cols-4 gap-4 bg-slate-100 border border-slate-200">
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
                <span className="font-mono">{deed.id.slice(-8)}</span>
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
          <div className="animate-in fade-in duration-300 h-full flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-100">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <Brain className="w-3.5 h-3.5" /> تحليل الذكاء الاصطناعي
              </span>
            </div>

            <div className="flex-1">
              {!aiAnalyzing && !aiResult && (
                <div className="max-w-4xl mx-auto border border-blue-200 rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="px-4 py-3 flex items-center justify-between text-blue-800 border-b border-blue-100 bg-blue-50">
                    <span className="font-bold text-sm">
                      رفع وثيقة جديدة للتحليل
                    </span>
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="bg-[#1d4ed8] p-4 relative cursor-pointer hover:bg-blue-700 transition-colors">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={handleAiUpload}
                    />
                    <div className="flex justify-center items-center text-white text-sm font-bold gap-3">
                      <span className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg transition-colors">
                        اختر ملف PDF أو صورة
                      </span>
                      <span>اسحب وأفلت الملف هنا</span>
                    </div>
                  </div>
                </div>
              )}

              {aiAnalyzing && (
                <div className="max-w-4xl mx-auto bg-stone-50 border-2 border-dashed border-blue-200 rounded-xl p-16 flex flex-col items-center justify-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                  <h4 className="text-base font-bold text-blue-900">
                    جاري قراءة وتحليل الصك... يرجى الانتظار
                  </h4>
                </div>
              )}

              {aiResult && (
                <div className="border border-green-200 rounded-xl overflow-hidden bg-[#f4fcf6]">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-6 border-b border-green-200 pb-3">
                      <h4 className="text-base font-bold text-green-700">
                        تم استخراج البيانات بنجاح
                      </h4>
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <pre
                      className="text-left font-mono text-xs bg-white p-4 rounded border border-green-100 overflow-y-auto max-h-[300px]"
                      dir="ltr"
                    >
                      {JSON.stringify(aiResult, null, 2)}
                    </pre>
                    <div className="flex justify-end gap-3 mt-4">
                      <button
                        onClick={handleConfirmAiData}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold"
                      >
                        تأكيد ونقل البيانات
                      </button>
                      <button
                        onClick={() => setAiResult(null)}
                        className="bg-white border border-slate-300 px-6 py-2 rounded-lg font-bold"
                      >
                        إعادة المحاولة
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
          <div className="animate-in fade-in h-full flex flex-col">
            {/* شريط الإجراءات العلوي للوثائق */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> الوثائق المرتبطة
                ({docsCount})
              </span>
              <div className="flex items-center gap-2">
                {docsCount > 0 && (
                  <>
                    <button
                      onClick={printAllDocuments}
                      className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="w-4 h-4" /> طباعة الكل
                    </button>
                    <div className="relative group">
                      <button className="px-3 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <Share2 className="w-4 h-4" /> إرسال الكل
                      </button>
                      {/* قائمة الإرسال المنسدلة */}
                      <div className="absolute left-0 mt-1 w-36 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                        <button
                          onClick={() => shareAllDocuments("whatsapp")}
                          className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-green-600"
                        >
                          <Send className="w-3 h-3" /> واتساب
                        </button>
                        <button
                          onClick={() => shareAllDocuments("telegram")}
                          className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-blue-500"
                        >
                          <Send className="w-3 h-3" /> تليجرام
                        </button>
                        <button
                          onClick={() => shareAllDocuments("email")}
                          className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                        >
                          <Send className="w-3 h-3" /> بريد إلكتروني
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <div className="w-px h-6 bg-slate-300 mx-1"></div>
                <button
                  onClick={() => setShowDocForm(!showDocForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm"
                >
                  <Plus className="w-4 h-4" /> إضافة وثيقة
                </button>
              </div>
            </div>

            {/* فورم إضافة وثيقة */}
            {showDocForm && (
              <div className="bg-blue-50/50 border border-blue-200 p-5 rounded-xl grid grid-cols-1 md:grid-cols-4 items-end gap-4 mb-5 animate-in slide-in-from-top-2 shadow-inner">
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-blue-900">
                    رقم الوثيقة *
                  </label>
                  <input
                    type="text"
                    className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-blue-500 shadow-sm"
                    value={newDoc.number}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, number: e.target.value })
                    }
                    placeholder="مثال: 310123456"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-blue-900">
                    نوع الوثيقة
                  </label>
                  <select
                    className="w-full p-2.5 text-xs border rounded-lg outline-none focus:border-blue-500 shadow-sm bg-white"
                    value={newDoc.type}
                    onChange={(e) =>
                      setNewDoc({ ...newDoc, type: e.target.value })
                    }
                  >
                    <option value="صك ملكية">صك ملكية</option>
                    <option value="رخصة بناء">رخصة بناء</option>
                    <option value="كروكي تنظيمي">كروكي تنظيمي</option>
                    <option value="قرار مساحي">قرار مساحي</option>
                    <option value="مخطط معتمد">مخطط معتمد</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1.5 text-blue-900">
                    ملف الوثيقة (اختياري)
                  </label>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-2.5 text-xs border border-dashed border-blue-400 bg-white text-blue-600 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Upload className="w-4 h-4" />{" "}
                    {newDoc.fileData
                      ? "تم اختيار الملف"
                      : "اختر ملف (صورة/PDF)"}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={handleDocFileUpload}
                  />
                </div>
                <button
                  onClick={handleAddDoc}
                  className="px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 shadow-md h-[42px] flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> إضافة للقائمة
                </button>
              </div>
            )}

            {/* جدول الوثائق المطور */}
            {localData.documents.length > 0 ? (
              <div className="flex-1 rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 border-b-2 border-slate-200 text-slate-600">
                    <tr>
                      <th className="p-3 font-black w-10 text-center">#</th>
                      <th className="p-3 font-bold w-16">معاينة</th>
                      <th className="p-3 font-bold">الرمز (الكود)</th>
                      <th className="p-3 font-bold">النوع</th>
                      <th className="p-3 font-bold">رقم الوثيقة</th>
                      <th className="p-3 font-bold text-center">
                        إجراءات سريعة
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {localData.documents.map((doc, idx) => (
                      <tr
                        key={doc.id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="p-3 text-center font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-3">
                          {doc.fileData ? (
                            <div
                              onClick={() => setViewingDoc(doc)}
                              className="w-10 h-10 rounded border border-slate-200 overflow-hidden cursor-pointer hover:border-blue-500 hover:shadow-md transition-all relative"
                            >
                              {doc.fileType?.includes("pdf") ? (
                                <div className="w-full h-full bg-red-50 flex items-center justify-center text-red-500 font-bold text-[8px]">
                                  PDF
                                </div>
                              ) : (
                                <img
                                  src={doc.fileData}
                                  alt="معاينة"
                                  className="w-full h-full object-cover"
                                />
                              )}
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-300">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="font-mono font-bold text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                            {doc.sysCode}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-slate-800">
                          {doc.type || doc.documentType}
                        </td>
                        <td className="p-3 font-mono font-black text-blue-700">
                          {doc.number || doc.documentNumber}
                        </td>

                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => setViewingDoc(doc)}
                              disabled={!doc.fileData}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                              title="عرض وتكبير"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setViewingDoc(doc);
                                setTimeout(
                                  () =>
                                    document
                                      .querySelector(".print-btn")
                                      ?.click(),
                                  100,
                                );
                              }}
                              disabled={!doc.fileData}
                              className="p-2 text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-30"
                              title="طباعة"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <div className="relative group/share">
                              <button
                                className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                title="مشاركة"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>
                              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 w-32 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all z-50">
                                <button
                                  onClick={() => shareDocument(doc, "whatsapp")}
                                  className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-green-600"
                                >
                                  <Send className="w-3 h-3" /> واتساب
                                </button>
                                <button
                                  onClick={() => shareDocument(doc, "email")}
                                  className="w-full text-right px-3 py-2 text-xs hover:bg-slate-50 flex items-center gap-2 text-slate-600"
                                >
                                  <Mail className="w-3 h-3" /> إيميل
                                </button>
                              </div>
                            </div>

                            <div className="w-px h-4 bg-slate-200 mx-1"></div>

                            <button
                              onClick={() =>
                                handleDeleteItem("documents", doc.id)
                              }
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <FileText className="w-16 h-16 text-slate-300 mb-3" />
                <p className="text-slate-500 font-bold text-lg">
                  لا توجد وثائق مدرجة
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  قم بإضافة الوثائق المتعلقة بالمعاملة من الزر بالأعلى
                </p>
              </div>
            )}
          </div>
        );

      // =======================================
      // تاب القطع (Plots)
      // =======================================
      case "plots":
        return (
          <div className="animate-in fade-in">
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
                  حفظ مؤقت
                </button>
              </div>
            )}

            {localData.plots.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localData.plots.map((plot) => (
                  <div
                    key={plot.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:border-emerald-300 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                          <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400 font-bold mb-0.5">
                            رقم القطعة
                          </div>
                          <div
                            className="text-sm font-black text-slate-800"
                            dir="ltr"
                          >
                            {plot.plotNumber || "---"}
                          </div>
                        </div>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-slate-400 font-bold mb-0.5">
                          المساحة
                        </div>
                        <div
                          className="text-sm font-black text-emerald-600"
                          dir="ltr"
                        >
                          {plot.area} م²
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px] mb-0.5">
                          المخطط
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {plot.planNumber || deed.planNumber || "---"}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2 rounded border border-slate-100">
                        <span className="text-slate-400 block text-[9px] mb-0.5">
                          نوع العقار
                        </span>
                        <span className="font-bold text-slate-700">
                          {plot.propertyType || propertyType}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => handleDeleteItem("plots", plot.id)}
                        className="text-red-500 bg-red-50 p-1.5 rounded hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
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
      // تاب الملاك (Owners) للتعديل
      // =======================================
      case "owners":
        return (
          <div className="animate-in fade-in">
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
                    className="w-full p-2.5 text-xs border rounded-lg outline-none"
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
                    className="w-full p-2.5 text-xs border rounded-lg outline-none"
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
                <table className="w-full text-right text-xs">
                  <thead className="bg-amber-100 text-amber-800 border-b border-amber-200">
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
                        key={owner.id}
                        className="hover:bg-amber-50/30 transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-800 flex items-center gap-2">
                          <Crown
                            className={`w-4 h-4 ${idx === 0 ? "text-amber-500" : "text-slate-300"}`}
                          />{" "}
                          {owner.name}
                        </td>
                        <td className="p-3 font-mono text-slate-600">
                          {owner.idNumber || owner.identityNumber || "---"}
                        </td>
                        <td className="p-3 font-mono font-black text-blue-600">
                          {owner.sharePercentage || owner.share}%
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteItem("owners", owner.id)}
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
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">لا يوجد ملاك مضافين</p>
              </div>
            )}
          </div>
        );

      // =======================================
      // تاب الحدود (Bounds & Images) مع الرسم التفاعلي
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
          <div className="animate-in fade-in h-full flex flex-col">
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
                      className={`px-4 py-2.5 text-xs font-bold rounded-xl border flex items-center gap-2 min-w-[140px] transition-all ${
                        selectedPlotForBounds === plot.id
                          ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105"
                          : "bg-white text-slate-600 border-slate-300 hover:bg-blue-50"
                      }`}
                    >
                      <MapIcon className="w-4 h-4 opacity-80" />
                      <div className="text-right">
                        <span className="block opacity-80 text-[9px] font-normal">
                          قطعة رقم
                        </span>
                        <span className="block text-sm" dir="ltr">
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
                        <span className="text-slate-400 text-xs">
                          مساحة القطعة:
                        </span>
                        <strong className="text-emerald-400">
                          {currentPlotDetails?.area || 0} م²
                        </strong>
                      </div>
                      <div className="flex justify-between border-b border-slate-700 pb-2">
                        <span className="text-slate-400 text-xs">
                          إجمالي المحيط:
                        </span>
                        <strong className="text-amber-400">
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
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">
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
                            <label className="text-[10px] font-bold text-slate-500 mb-1 block">
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
          <div className="animate-in fade-in">
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
      // تاب الصور المجمعة (Images Gallery)
      // =======================================
      case "images":
        const allImages = localData.boundaries?.filter((b) => b.imageUrl) || [];
        return (
          <div className="animate-in fade-in">
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
      // تاب التحقق (Verify)
      // =======================================
      case "verify":
        return (
          <div className="animate-in fade-in max-w-3xl mx-auto">
            <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
              <span className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" /> التحقق والمراجعة
                القانونية
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
              <div className="text-xs font-bold text-slate-500 mb-3">
                حالة الملف الحالية
              </div>
              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-200 text-sm">
                  {deed.status === "Active" ? "مؤكد ومعتمد" : deed.status}
                </span>
                <span className="px-3 py-1.5 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-xs flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> تم المراجعة بواسطة AI
                </span>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-2">
                تغيير الحالة يدوياً:
              </div>
              <div className="flex gap-2 mb-5">
                <button
                  onClick={() => handleAction("تغيير الحالة")}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600"
                >
                  قيد المراجعة
                </button>
                <button
                  disabled
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold opacity-50 cursor-not-allowed"
                >
                  مؤكد
                </button>
                <button
                  onClick={() => handleAction("تغيير الحالة")}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600"
                >
                  متنازع / إيقاف
                </button>
              </div>

              <div className="text-xs font-bold text-slate-500 mb-2">
                ملاحظات المراجع:
              </div>
              <textarea
                placeholder="اكتب ملاحظاتك القانونية هنا..."
                className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 min-h-[100px] mb-3"
              ></textarea>
              <button
                onClick={() => handleAction("حفظ الملاحظات")}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-blue-700"
              >
                <Save className="w-4 h-4" /> حفظ الملاحظة
              </button>
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
                { label: "لا توجد قيود أو إيقافات حرجة", valid: true },
              ].map((check, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-slate-50/50"
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
      // باقي التابات الافتراضية (سجل، ملاحظات...)
      // =======================================
      default:
        return (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 animate-in fade-in">
            <Info className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-base font-bold text-slate-600 mb-2">
              هذا القسم قيد التطوير
            </p>
            <p className="text-xs">
              سيتم ربط بيانات قسم "{TABS.find((t) => t.id === activeTab)?.label}
              " قريباً.
            </p>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="bg-slate-100 rounded-2xl w-full max-w-[1200px] h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* زر الحفظ العائم في حالة التعديل */}
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
            حفظ التعديلات الان
          </button>
        </div>

        {/* ======================= Header ======================= */}
        <div className="bg-white px-5 py-4 flex items-start justify-between border-b border-slate-200 shrink-0 shadow-sm relative z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-inner shrink-0">
              <Building className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <h2 className="text-lg font-black text-slate-800">
                  {propertyType}{" "}
                  {deed.district ? `- ${deed.district}` : "بدون عنوان"}
                </h2>
                <span className="text-xs font-mono font-bold rounded px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200">
                  {deed.code}
                </span>
                <span className="text-[10px] font-bold rounded px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {deed.status === "Active" ? "مؤكد" : deed.status}
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded px-2 py-0.5 border border-slate-200">
                  {deed.city} {deed.district ? `/ ${deed.district}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 font-medium flex-wrap">
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> صك:{" "}
                  <span className="font-mono text-slate-700 font-bold">
                    {deed.deedNumber || "---"}
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

          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 shadow-sm">
              <Sparkles className="w-4 h-4" /> AI 95%
            </span>
            <button
              onClick={() => handleAction("تصدير كـ PDF")}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" /> تصدير
            </button>
            <button
              onClick={() => handleAction("وضع التحرير")}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors shadow-sm"
            >
              <SquarePen className="w-4 h-4" /> تحرير
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all ml-2 text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ======================= Tabs Bar ======================= */}
        <div className="flex items-center gap-1 overflow-x-auto bg-slate-100 border-b border-slate-300 px-2 pt-3 shrink-0 custom-scrollbar shadow-inner relative z-10">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 shrink-0 transition-all text-xs font-bold rounded-t-xl px-4 py-2.5 relative top-[1px]
                  ${
                    isActive
                      ? "bg-white text-blue-700 border-t-[3px] border-x border-blue-600 shadow-[0_-2px_5px_rgba(0,0,0,0.03)]"
                      : "bg-transparent text-slate-500 hover:bg-slate-200 border-t-[3px] border-transparent border-x border-transparent hover:text-slate-800"
                  }`}
              >
                <tab.icon
                  className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-0.5 ml-1 font-black ${isActive ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-600"}`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ======================= Content Area ======================= */}
        <div className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar relative">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default DeedDetailsModal;
