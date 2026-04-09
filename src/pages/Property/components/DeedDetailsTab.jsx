import React, { useState, useEffect, useRef } from "react";
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
  X,
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
  Loader2,
  Save,
  ArrowRight,
  Printer,
  TriangleAlert,
  Building,
  Crown,
  MapPin,
  Copy,
  ZoomOut,
  ZoomIn,
  Maximize,
  MapIcon,
} from "lucide-react";

// ==========================================
// 💡 استيراد التابات المنفصلة
// ==========================================
import { SummaryTab } from "./DeedTabs/SummaryTab";
import { DetailsTab } from "./DeedTabs/DetailsTab";
import { AiTab } from "./DeedTabs/AiTab";
import { DocsTab } from "./DeedTabs/DocsTab";
import { PlotsTab } from "./DeedTabs/PlotsTab";
import { OwnersTab } from "./DeedTabs/OwnersTab";
import { BoundsTab } from "./DeedTabs/BoundsTab";
import { AttachmentsTab } from "./DeedTabs/AttachmentsTab";
import { ImagesTab } from "./DeedTabs/ImagesTab";
import { VerifyTab } from "./DeedTabs/VerifyTab";
import { NotesTab } from "./DeedTabs/NotesTab";
import { HistoryTab } from "./DeedTabs/HistoryTab";
import { ReportsTab } from "./DeedTabs/ReportsTab";

// ==========================================
// 💡 دوال مساعدة
// ==========================================
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

const copyToClipboard = (text) => {
  if (!text) return toast.error("الحقل فارغ لا يوجد شيء لنسخه!");
  navigator.clipboard.writeText(text);
  toast.success("تم النسخ بنجاح! 📋");
};

// ==========================================
// 💡 مكون عارض الوثائق
// ==========================================
const DocumentViewer = ({ doc, onClose }) => {
  const [scale, setScale] = useState(1);
  const isPdf =
    doc?.fileType?.includes("pdf") || doc?.filePath?.endsWith(".pdf");
  const fileSource = doc.fileData || doc.filePath;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (isPdf) {
      printWindow.document.write(
        `<iframe src="${fileSource}" width="100%" height="100%" style="border:none;"></iframe>`,
      );
    } else {
      printWindow.document.write(
        `<div style="text-align:center;"><img src="${fileSource}" style="max-width:100%;" /></div>`,
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
      <div className="flex-1 overflow-auto flex items-center justify-center p-4 custom-scrollbar relative">
        {fileSource ? (
          isPdf ? (
            <iframe
              src={fileSource}
              className="w-full h-full rounded-lg bg-white"
              title="PDF Viewer"
            />
          ) : (
            <div
              className="transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${scale})` }}
            >
              <img
                src={fileSource}
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
// 💡 المكون الرئيسي للشاشة
// ==========================================
const DeedDetailsTab = ({ deedId, onBack }) => {
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("summary");
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [selectedPlotForBounds, setSelectedPlotForBounds] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [viewingDoc, setViewingDoc] = useState(null);
  const [reportType, setReportType] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // States الخاص بالفورمات السريعة (تُمرر كـ Props للتابات)
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
    status: "",
    notes: "",
  });

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
        city: deed.city || "",
        district: deed.district || "",
        deedNumber: deed.deedNumber || "",
        deedDate: deed.deedDate
          ? format(new Date(deed.deedDate), "yyyy-MM-dd")
          : "",
        planNumber: deed.planNumber || "",
        area: deed.area || 0,
        status: deed.status || "Active",
        notes: deed.notes || "",
      });
      setHasChanges(false);
      setIsEditing(false);
      setActiveTab("summary");
      setSelectedPlotForBounds("all");
    }
  }, [deed.id]);

  const triggerChange = () => setHasChanges(true);

  // --- دوال العمليات (Handlers) التي يتم تمريرها للتابات الفرعية ---
  const handleBasicFieldChange = (field, value) => {
    setLocalData((prev) => ({ ...prev, [field]: value }));
    triggerChange();
  };

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

  const handleDocFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await convertToBase64(file);
    setNewDoc((prev) => ({ ...prev, fileData: base64, fileType: file.type }));
  };

  const handleAddDoc = () => {
    if (!newDoc.number) return toast.error("رقم الوثيقة مطلوب");
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
      const fileSource = doc.fileData || doc.filePath;
      const isPdf =
        doc.fileType?.includes("pdf") || doc.filePath?.endsWith(".pdf");
      printWindow.document.write(
        `<div style="page-break-after: always; text-align:center; padding: 20px;">`,
      );
      printWindow.document.write(
        `<h3>وثيقة رقم ${idx + 1}: ${doc.type} (رمز: ${doc.sysCode})</h3>`,
      );
      if (fileSource) {
        if (isPdf) {
          printWindow.document.write(
            `<p><em>[ملف PDF - يرجى طباعته من العارض المنفصل]</em></p>`,
          );
        } else {
          printWindow.document.write(
            `<img src="${fileSource}" style="max-width:100%; max-height:800px; border:1px solid #ccc;" />`,
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

  const triggerPrint = (type) => {
    setReportType(type);
    toast.success(`جاري تجهيز ${type} للطباعة...`);
    setTimeout(() => {
      window.print();
    }, 300);
  };

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

  // --- حالات جلب البيانات (Loading / Error) ---
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

  // --- متغيرات العرض ---
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

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return (
          <SummaryTab
            deed={deed}
            localData={localData}
            safeClientName={safeClientName}
            totalArea={totalArea}
            plotsCount={plotsCount}
            safeFormatDate={safeFormatDate}
            setActiveTab={setActiveTab}
          />
        );
      case "details":
        return (
          <DetailsTab
            deed={deed}
            localData={localData}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            handleBasicFieldChange={handleBasicFieldChange}
            safeFormatDate={safeFormatDate}
            totalArea={totalArea}
            propertyType={propertyType}
          />
        );
      case "ai":
        return (
          <AiTab
            aiAnalyzing={aiAnalyzing}
            aiResult={aiResult}
            handleAiUpload={handleAiUpload}
            handleConfirmAiData={handleConfirmAiData}
            setAiResult={setAiResult}
          />
        );
      case "docs":
        return (
          <DocsTab
            localData={localData}
            docsCount={docsCount}
            printAllDocuments={printAllDocuments}
            shareAllDocuments={shareAllDocuments}
            showDocForm={showDocForm}
            setShowDocForm={setShowDocForm}
            newDoc={newDoc}
            setNewDoc={setNewDoc}
            fileInputRef={fileInputRef}
            handleDocFileUpload={handleDocFileUpload}
            handleAddDoc={handleAddDoc}
            setViewingDoc={setViewingDoc}
            handleDeleteItem={handleDeleteItem}
          />
        );
      case "plots":
        return (
          <PlotsTab
            localData={localData}
            plotsCount={plotsCount}
            showPlotForm={showPlotForm}
            setShowPlotForm={setShowPlotForm}
            newPlot={newPlot}
            setNewPlot={setNewPlot}
            handleAddPlot={handleAddPlot}
            handleDeleteItem={handleDeleteItem}
          />
        );
      case "owners":
        return (
          <OwnersTab
            localData={localData}
            ownersCount={ownersCount}
            showOwnerForm={showOwnerForm}
            setShowOwnerForm={setShowOwnerForm}
            newOwner={newOwner}
            setNewOwner={setNewOwner}
            handleAddOwner={handleAddOwner}
            handleDeleteItem={handleDeleteItem}
          />
        );
      case "bounds":
        return (
          <BoundsTab
            localData={localData}
            selectedPlotForBounds={selectedPlotForBounds}
            setSelectedPlotForBounds={setSelectedPlotForBounds}
            getBound={getBound}
            setActiveTab={setActiveTab}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            updateMutation={updateMutation}
            handleUpdateBoundary={handleUpdateBoundary}
            handleBoundaryImageUpload={handleBoundaryImageUpload}
          />
        );
      case "attachments":
        return (
          <AttachmentsTab
            localData={localData}
            handleAttachmentUpload={handleAttachmentUpload}
            handleDeleteItem={handleDeleteItem}
          />
        );
      case "images":
        return <ImagesTab localData={localData} />;
      case "verify":
        return (
          <VerifyTab
            localData={localData}
            handleBasicFieldChange={handleBasicFieldChange}
            docsCount={docsCount}
            ownersCount={ownersCount}
            plotsCount={plotsCount}
          />
        );
      case "notes":
        return (
          <NotesTab
            localData={localData}
            handleBasicFieldChange={handleBasicFieldChange}
          />
        );
      case "history":
        return <HistoryTab deed={deed} safeFormatDate={safeFormatDate} />;
      case "reports":
        return (
          <ReportsTab
            triggerPrint={triggerPrint}
            ownersCount={ownersCount}
            localData={localData}
            perimeter={perimeter}
            docsCount={docsCount}
            plotsCount={plotsCount}
          />
        );
      default:
        return (
          <div className="p-20 text-center text-slate-400 font-bold">
            جاري تطوير هذا القسم...
          </div>
        );
    }
  };

  return (
    <>
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
              onClick={() => copyToClipboard(deed.code)}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 hover:bg-blue-100 transition-colors shadow-sm"
            >
              <Copy className="w-4 h-4" /> نسخ الكود
            </button>
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

        {/* 💡 الشريط الجانبي ومساحة المحتوى */}
        <div className="flex flex-row flex-1 overflow-hidden bg-slate-50/50 min-h-0">
          {/* 👈 Sidebar (Vertical Tabs) */}
          <div className="w-full md:w-[240px] bg-white border-l border-slate-200 overflow-y-auto custom-scrollbar-slim p-3 flex flex-col gap-1.5 shrink-0 h-full shadow-[2px_0_10px_-5px_rgba(0,0,0,0.1)] z-10 min-h-0">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-lg text-sm font-bold transition-all text-right w-full shrink-0 relative ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  {/* خط التحديد النشط الجانبي */}
                  {isActive && (
                    <div className="absolute right-0 top-1/4 bottom-1/4 w-[3px] bg-blue-600 rounded-l-full"></div>
                  )}

                  <tab.icon
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isActive
                        ? "text-blue-600 scale-110"
                        : "text-slate-400 group-hover:scale-110"
                    }`}
                  />
                  <span className="truncate">{tab.label}</span>

                  {/* الشارة (Badge) */}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`mr-auto px-2 py-0.5 rounded-full text-[10px] font-black shadow-sm ${
                        isActive
                          ? "bg-blue-200 text-blue-800"
                          : "bg-slate-100 text-slate-500 border border-slate-200"
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* 👈 منطقة المحتوى (Content Area) */}
          <div className="flex-1 overflow-y-auto bg-transparent p-6 custom-scrollbar relative min-h-0">
            <div className="max-w-6xl mx-auto h-full">{renderTabContent()}</div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 2. قالب الطباعة المخفي (يظهر في PDF فقط) */}
      {/* ========================================== */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body * { visibility: hidden; }
          #print-report, #print-report * { visibility: visible; }
          #print-report { position: absolute; left: 0; top: 0; width: 100%; background: white !important; }
          html, body { height: auto !important; overflow: visible !important; }
        }
      `,
        }}
      />
      <div
        id="print-report"
        className="hidden print:block bg-white text-slate-900"
        dir="rtl"
      >
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

      {/* 💡 عارض الوثائق يظهر فوق كل شيء إذا كان هناك ملف ممرر للرؤية */}
      {viewingDoc && (
        <DocumentViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />
      )}
    </>
  );
};

export default DeedDetailsTab;
