import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Save,
  X,
  Settings,
  ChevronUp,
  ChevronDown,
  Type,
  Hash,
  AlignLeft,
  Calendar,
  CalendarClock,
  Clock,
  User,
  Pen,
  FilePenLine,
  Stamp,
  FileText,
  Table,
  SquareCheckBig,
  Minus,
  Maximize2,
  Image as ImageIcon,
  Droplet,
  Eye,
  ZoomOut,
  ZoomIn,
  Grid3x3,
  Plus,
  Users,
  Trash2,
  ArrowUp,
  ArrowDown,
  Copy,
  Edit2,
  Upload,
  Sparkles,
  Move,
  Square,
  ImagePlus,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";

// ==========================================
// 💡 1. قائمة البلوكات المتاحة
// ==========================================
const FORM_BLOCKS = [
  {
    id: 1,
    type: "title",
    label: "عنوان النموذج",
    desc: "عنوان رئيسي",
    icon: Type,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: 2,
    type: "version",
    label: "رقم الإصدار",
    desc: "v1.0",
    icon: Hash,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  {
    id: 3,
    type: "subject",
    label: "الموضوع",
    desc: "موضوع النموذج",
    icon: AlignLeft,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    id: 4,
    type: "reference_number",
    label: "رقم الخطاب",
    desc: "ترقيم داخلي",
    icon: Hash,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    id: 5,
    type: "date_gregorian",
    label: "تاريخ ميلادي",
    desc: "تاريخ ميلادي",
    icon: Calendar,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: 6,
    type: "date_hijri",
    label: "تاريخ هجري",
    desc: "تاريخ هجري",
    icon: Calendar,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: 7,
    type: "date_editable",
    label: "تاريخ قابل للتعديل",
    desc: "تاريخ من تقويم",
    icon: CalendarClock,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    id: 8,
    type: "time",
    label: "الوقت",
    desc: "وقت بالساعة والدقيقة",
    icon: Clock,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    id: 9,
    type: "employee_info",
    label: "بيانات موظف",
    desc: "معلومات كاملة",
    icon: User,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    id: 10,
    type: "signature",
    label: "توقيع",
    desc: "مربع توقيع",
    icon: Pen,
    color: "text-teal-500",
    bg: "bg-teal-500/10",
  },
  {
    id: 11,
    type: "office_signature",
    label: "توقيع المكتب",
    desc: "توقيع رسمي",
    icon: FilePenLine,
    color: "text-cyan-600",
    bg: "bg-cyan-600/10",
  },
  {
    id: 12,
    type: "office_stamp",
    label: "ختم المكتب",
    desc: "ختم رسمي",
    icon: Stamp,
    color: "text-rose-700",
    bg: "bg-rose-700/10",
  },
  {
    id: 13,
    type: "fingerprint",
    label: "بصمة إصبع",
    desc: "بصمة حبر",
    icon: User,
    color: "text-lime-500",
    bg: "bg-lime-500/10",
  },
  {
    id: 14,
    type: "text_field",
    label: "حقل نصي",
    desc: "حقل نص قصير",
    icon: Type,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  {
    id: 15,
    type: "text_area",
    label: "منطقة نصية",
    desc: "نص طويل",
    icon: FileText,
    color: "text-stone-500",
    bg: "bg-stone-500/10",
  },
  {
    id: 16,
    type: "static_text",
    label: "نص ثابت",
    desc: "نص ثابت",
    icon: AlignLeft,
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
  },
  {
    id: 17,
    type: "table",
    label: "جدول",
    desc: "جدول بيانات",
    icon: Table,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    id: 18,
    type: "checkbox",
    label: "خانة اختيار",
    desc: "checkbox",
    icon: SquareCheckBig,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: 19,
    type: "separator",
    label: "فاصل",
    desc: "خط فاصل",
    icon: Minus,
    color: "text-slate-400",
    bg: "bg-slate-400/10",
  },
  {
    id: 20,
    type: "spacer",
    label: "مسافة",
    desc: "مسافة فارغة",
    icon: Maximize2,
    color: "text-slate-300",
    bg: "bg-slate-300/10",
  },
  {
    id: 21,
    type: "header_image",
    label: "صورة الهيدر",
    desc: "صورة أعلى الصفحة",
    icon: ImageIcon,
    color: "text-blue-800",
    bg: "bg-blue-800/10",
  },
  {
    id: 22,
    type: "footer_image",
    label: "صورة الفوتر",
    desc: "صورة أسفل الصفحة",
    icon: ImageIcon,
    color: "text-slate-900",
    bg: "bg-slate-900/10",
  },
  {
    id: 23,
    type: "background_image",
    label: "صورة الخلفية",
    desc: "صورة خلف المحتوى",
    icon: ImageIcon,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
  {
    id: 24,
    type: "watermark",
    label: "علامة مائية",
    desc: "نص أو صورة شفافة",
    icon: Droplet,
    color: "text-sky-600",
    bg: "bg-sky-600/10",
  },
  {
    id: 25,
    type: "image_upload",
    label: "إرفاق صورة",
    desc: "مربع لرفع صورة",
    icon: ImagePlus,
    color: "text-fuchsia-500",
    bg: "bg-fuchsia-500/10",
  },
];

const getBlockVisuals = (type) => {
  return FORM_BLOCKS.find((b) => b.type === type) || FORM_BLOCKS[0];
};

// ==========================================
// 💡 2. مكون رسم البلوكات على الورقة
// ==========================================
const PreviewBlockRenderer = ({ block, formSettings }) => {
  const getAlignStyles = (align) => {
    if (align === "center")
      return {
        textAlign: "center",
        justifyContent: "center",
        alignItems: "center",
      };
    if (align === "left")
      return {
        textAlign: "left",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        flexDirection: "row-reverse",
      };
    return {
      textAlign: "right",
      justifyContent: "flex-start",
      alignItems: "flex-start",
    };
  };

  const alignStyles = getAlignStyles(block.style?.alignment);
  const widthStyle = block.position?.width
    ? `${block.position.width}px`
    : "100%";
  const heightStyle = block.position?.height
    ? `${block.position.height}px`
    : "auto";
  const fontSizeStyle = block.style?.fontSize
    ? `${block.style.fontSize}px`
    : "inherit";

  switch (block.type) {
    case "title":
      return (
        <h2
          style={{
            ...alignStyles,
            fontSize: block.style?.fontSize ? fontSizeStyle : "24px",
          }}
          className={`font-bold w-full ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}
        >
          {formSettings.name || "عنوان النموذج"}
        </h2>
      );
    case "version":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full"
        >
          الإصدار: {formSettings.version || "1.0"}
        </div>
      );
    case "subject":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="font-bold flex w-full gap-2"
        >
          <span>{block.label}:</span>
          <span className="border-b border-black flex-1 border-dashed"></span>
        </div>
      );
    case "reference_number":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full"
        >
          {block.label}: {formSettings.code || "FRM-XXX"}-
          {new Date().getFullYear()}-001
        </div>
      );
    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <span className="font-bold">{block.label}:</span>
          <div className="border border-slate-300 bg-slate-50 rounded px-3 py-1.5 text-slate-500 flex items-center gap-2 min-w-[120px]">
            {block.defaultValue || "__ / __ / ____"} <CalendarClock size={16} />
          </div>
        </div>
      );
    case "time":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <span className="font-bold">{block.label}:</span>
          <span
            className="font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded"
            dir="ltr"
          >
            10:30 AM
          </span>
        </div>
      );
    case "text_field":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-2"
        >
          <label className="font-bold text-slate-700 whitespace-nowrap">
            {block.label}
          </label>
          <div className="border-b border-slate-300 flex-1 h-6"></div>
        </div>
      );
    case "text_area":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex flex-col h-full"
        >
          <label className="font-bold text-slate-700 mb-1.5">
            {block.label}
          </label>
          <div
            className="border border-slate-300 rounded bg-slate-50 w-full p-3 text-slate-500 flex-1"
            style={{ height: heightStyle }}
          >
            {block.defaultValue || "مساحة للكتابة..."}
          </div>
        </div>
      );
    case "image_upload":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, height: heightStyle }}
          className="flex flex-col"
        >
          <label
            style={{ fontSize: fontSizeStyle }}
            className="font-bold text-slate-700 mb-1.5"
          >
            {block.label}
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 w-full flex-1 flex flex-col items-center justify-center text-slate-400">
            <Upload size={32} className="mb-2 opacity-50" />
            <span style={{ fontSize: "12px" }}>انقر لإرفاق صورة</span>
          </div>
        </div>
      );
    case "employee_info":
      return (
        <div
          style={{ width: widthStyle, fontSize: fontSizeStyle }}
          className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4"
        >
          <div className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <User size={18} /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-2 border border-indigo-100 rounded-lg">
              الاسم: ----------------
            </div>
            <div className="bg-white p-2 border border-indigo-100 rounded-lg">
              الرقم الوظيفي: ---------
            </div>
          </div>
        </div>
      );
    case "table":
      return (
        <div
          style={{ width: widthStyle, fontSize: fontSizeStyle }}
          className="border border-slate-300 rounded-lg overflow-hidden"
        >
          <table className="w-full text-center bg-white">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2">العمود 1</th>
                <th className="p-2">العمود 2</th>
                <th className="p-2">العمود 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-2">—</td>
                <td className="p-2">—</td>
                <td className="p-2">—</td>
              </tr>
              <tr>
                <td className="p-2">—</td>
                <td className="p-2">—</td>
                <td className="p-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case "checkbox":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="flex items-center gap-3"
        >
          <div className="w-4 h-4 border-2 border-slate-400 rounded-sm"></div>
          <span className="font-bold text-slate-700">{block.label}</span>
        </div>
      );
    case "signature":
    case "office_signature":
    case "fingerprint":
    case "office_stamp":
      return (
        <div
          style={{
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className={`flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="font-bold mb-2"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div className="w-full flex-1 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            {block.type === "office_stamp" ? (
              <Stamp size={32} />
            ) : (
              <Pen size={32} />
            )}
          </div>
        </div>
      );
    case "separator":
      return <hr className="my-2 border-t-2 border-slate-300 w-full" />;
    case "static_text":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle, fontSize: fontSizeStyle }}
          className="leading-relaxed w-full whitespace-pre-wrap"
        >
          {block.defaultValue || block.label}
        </div>
      );
    default:
      return (
        <div className="p-3 border border-dashed border-blue-300 bg-blue-50 text-blue-800 text-center rounded-lg w-full font-bold">
          {block.label}
        </div>
      );
  }
};

// ==========================================
// 💡 3. المكون الرئيسي
// ==========================================
export default function FormBuilderModal({
  onClose,
  onSaveSuccess,
  initialData = null,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isBlocksOpen, setIsBlocksOpen] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  // إعدادات النموذج (الآن تشمل showBorder لتُحفظ في الباك إند)
  const [formSettings, setFormSettings] = useState({
    name: "",
    description: "",
    code: "",
    version: "1.0",
    category: "hr",
    colorMode: "color",
    numberFormat: "english",
    timezone: "Asia/Riyadh",
    fontFamily: "Tajawal",
    fontSize: 14,
    isPublic: false,
    showBorder: false, // 👈 حفظ إطار الورقة
  });

  const [canvasBlocks, setCanvasBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [originalBlock, setOriginalBlock] = useState(null);

  // متغيرات السحب الحر
  const [dragState, setDragState] = useState({
    isDragging: false,
    blockId: null,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const paperRef = useRef(null);
  const A4_HEIGHT_PX = 1122.5; // طول صفحة A4 بالبيكسل

  // 💡 حساب الطول الديناميكي للورقة وبناء الصفحات
  const calculatePaperHeight = () => {
    if (canvasBlocks.length === 0) return A4_HEIGHT_PX;
    // استخراج أبعد نقطة وصل إليها أي بلوك للأسفل
    const maxBottom = Math.max(
      ...canvasBlocks.map(
        (b) => (b.position.y || 0) + (b.position.height || 0),
      ),
    );
    // حساب كم ورقة نحتاج (كل ورقة = 1122.5px)
    const requiredPages = Math.max(
      1,
      Math.ceil((maxBottom + 100) / A4_HEIGHT_PX),
    );
    return requiredPages * A4_HEIGHT_PX;
  };
  const dynamicHeight = calculatePaperHeight();
  const pagesCount = Math.ceil(dynamicHeight / A4_HEIGHT_PX);

  useEffect(() => {
    if (initialData) {
      setFormSettings({
        name: initialData.name || "",
        code: initialData.code || "",
        description: initialData.description || "",
        version: initialData.version || "1.0",
        category: initialData.category || "hr",
        colorMode: initialData.colorMode || "color",
        numberFormat: initialData.numberFormat || "english",
        timezone: initialData.timezone || "Asia/Riyadh",
        fontFamily: initialData.fontFamily || "Tajawal",
        fontSize: initialData.fontSize || 14,
        isPublic: initialData.isPublic || false,
        showBorder: initialData.showBorder || false, // 👈 استرجاع إطار الورقة
      });

      if (initialData.blocks && initialData.blocks.length > 0) {
        const formattedBlocks = initialData.blocks.map((b) => ({
          uid:
            b.id ||
            `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: b.type,
          label: b.label,
          position: b.position || {
            x: 50,
            y: 50,
            width: 300,
            height: 50,
            absolute: true,
          },
          style: b.style || { alignment: "right", fontSize: 14 },
          isEditable: b.isEditable,
          isRequired: b.isRequired,
          dataSource: b.dataSource,
          defaultValue: b.defaultValue || "",
          _ui: getBlockVisuals(b.type),
        }));
        setCanvasBlocks(formattedBlocks);
      }
    }
  }, [initialData]);

  const handleGenerateAICode = async () => {
    if (!formSettings.name)
      return toast.error("يرجى كتابة اسم النموذج أولاً لتوليد الكود");

    // إظهار حالة التحميل على الزر (اختياري، يمكنك إضافة state اسمها isGeneratingCode)
    const loadingToast = toast.loading("جاري توليد الكود الذكي...");

    try {
      // 💡 استدعاء مسار الباك إند الجديد (تأكد من إضافته للـ routes)
      const res = await api.post("/forms/generate-code", {
        formName: formSettings.name,
        category: formSettings.category,
      });

      setFormSettings({ ...formSettings, code: res.data.data.code });
      toast.success("تم توليد الكود الذكي بنجاح!", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("فشل توليد الكود الذكي، حاول مجدداً.", { id: loadingToast });
    }
  };

  const handleAddBlock = (blockDef) => {
    const newBlock = {
      uid: `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: blockDef.type,
      label: blockDef.label,
      position: {
        x: Math.floor(Math.random() * 50) + 50,
        y: Math.floor(Math.random() * 50) + 100,
        absolute: true,
        width: ["table", "employee_info", "header_image", "separator"].includes(
          blockDef.type,
        )
          ? 600
          : 300,
        height: ["text_area", "image_upload"].includes(blockDef.type)
          ? 120
          : ["table"].includes(blockDef.type)
            ? 200
            : 50,
      },
      style: { alignment: "right", fontSize: 14 },
      isEditable: true,
      isRequired: false,
      dataSource: "manual",
      defaultValue: "",
      _ui: { bg: blockDef.bg, color: blockDef.color, icon: blockDef.icon },
    };
    setCanvasBlocks([...canvasBlocks, newBlock]);
    setSelectedBlockId(newBlock.uid);
  };

  const handleRemoveBlock = (uid) => {
    setCanvasBlocks(canvasBlocks.filter((b) => b.uid !== uid));
    if (selectedBlockId === uid) setSelectedBlockId(null);
  };

  // نظام السحب الحر
  const onMouseDown = (e, uid, position) => {
    e.preventDefault();
    setSelectedBlockId(uid);
    setDragState({
      isDragging: true,
      blockId: uid,
      startX: e.clientX,
      startY: e.clientY,
      initialLeft: position.x,
      initialTop: position.y,
    });
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!dragState.isDragging || !dragState.blockId) return;
      const deltaX = (e.clientX - dragState.startX) / (zoomLevel / 100);
      const deltaY = (e.clientY - dragState.startY) / (zoomLevel / 100);

      setCanvasBlocks((prev) =>
        prev.map((b) => {
          if (b.uid === dragState.blockId) {
            return {
              ...b,
              position: {
                ...b.position,
                x: Math.max(0, dragState.initialLeft + deltaX),
                y: Math.max(0, dragState.initialTop + deltaY),
              },
            };
          }
          return b;
        }),
      );
    };

    const onMouseUp = () => {
      if (dragState.isDragging)
        setDragState({
          isDragging: false,
          blockId: null,
          startX: 0,
          startY: 0,
          initialLeft: 0,
          initialTop: 0,
        });
    };

    if (dragState.isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState, zoomLevel]);

  // 💡 التعديل: التقاط الأبعاد بدقة بعد انتهاء التكبير/التصغير (Resize)
  const handleResizeEnd = (e, uid) => {
    const el = e.currentTarget;
    const newWidth = el.offsetWidth;
    const newHeight = el.offsetHeight;

    setCanvasBlocks((prev) =>
      prev.map((b) => {
        if (b.uid === uid) {
          return {
            ...b,
            position: { ...b.position, width: newWidth, height: newHeight },
          };
        }
        return b;
      }),
    );
  };

  const openEditDialog = (block) => {
    const originalCopy = JSON.parse(JSON.stringify(block));
    originalCopy._ui = getBlockVisuals(originalCopy.type);
    setOriginalBlock(originalCopy);
    const editingCopy = JSON.parse(JSON.stringify(block));
    editingCopy._ui = getBlockVisuals(editingCopy.type);
    setEditingBlock(editingCopy);
  };

  const updateEditingBlock = (updates) => {
    const updated = { ...editingBlock, ...updates };
    setEditingBlock(updated);
    setCanvasBlocks(
      canvasBlocks.map((b) => (b.uid === updated.uid ? updated : b)),
    );
  };

  const cancelEdit = () => {
    setCanvasBlocks(
      canvasBlocks.map((b) =>
        b.uid === originalBlock.uid ? originalBlock : b,
      ),
    );
    setEditingBlock(null);
    setOriginalBlock(null);
  };

  const handleSaveToBackend = async () => {
    if (!formSettings.name || !formSettings.code)
      return toast.error("يرجى إدخال اسم النموذج والكود.");
    setIsSaving(true);
    try {
      const payload = {
        ...formSettings,
        blocks: canvasBlocks.map((b, index) => ({
          type: b.type,
          label: b.label,
          position: {
            x: b.position.x,
            y: b.position.y,
            width: b.position.width,
            height: b.position.height,
            absolute: b.position.absolute,
          },
          style: { alignment: b.style.alignment, fontSize: b.style.fontSize },
          isEditable: b.isEditable,
          isRequired: b.isRequired,
          dataSource: b.dataSource,
          defaultValue: b.defaultValue,
          order: index,
        })),
      };
      if (initialData && initialData.id) {
        await api.put(`/forms/templates/${initialData.id}`, payload);
        toast.success("تم تحديث النموذج بنجاح (بالتنسيقات الدقيقة)!");
      } else {
        await api.post("/forms/templates", payload);
        toast.success("تم إنشاء النموذج بنجاح!");
      }
      if (onSaveSuccess) onSaveSuccess();
      else onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="bg-white rounded-xl w-full max-w-[1600px] h-[92vh] flex flex-col shadow-2xl overflow-hidden font-[Tajawal]">
        {/* ── Header ── */}
        <div className="px-5 py-3.5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-slate-900">
                محرر النماذج الذكي
              </div>
              <div className="text-[10px] text-slate-500">
                سحب وإفلات، تحريك حر، وتعديل الأبعاد
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToBackend}
              disabled={isSaving}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-[13px] transition-all ${isSaving ? "opacity-70" : "hover:bg-emerald-700 shadow-md shadow-emerald-600/20"}`}
            >
              <Save size={16} className={isSaving ? "animate-pulse" : ""} />{" "}
              <span>{isSaving ? "جاري الحفظ..." : "حفظ النموذج كما هو"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Main Layout Split ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── Sidebar (Right) ── */}
          <div className="w-[400px] border-l border-slate-300 flex flex-col bg-slate-50 shrink-0 z-10">
            <div className="flex-1 overflow-auto p-4 custom-scrollbar">
              <div className="bg-white rounded-xl border border-slate-200 mb-4 shadow-sm overflow-hidden">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="w-full p-3.5 flex items-center justify-between bg-transparent hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-[13px]">
                    <Settings size={16} /> الإعدادات الأساسية
                  </div>
                  {isSettingsOpen ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>

                {isSettingsOpen && (
                  <div className="p-4 pt-0 border-t border-slate-100 mt-1 flex flex-col gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        اسم النموذج *
                      </label>
                      <input
                        type="text"
                        value={formSettings.name}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            name: e.target.value,
                          })
                        }
                        placeholder="مثال: نموذج استلام عهدة"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                        وصف النموذج (مختصر)
                      </label>
                      <textarea
                        value={formSettings.description}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            description: e.target.value,
                          })
                        }
                        placeholder="اكتب وصفاً قصيراً للنموذج..."
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[60px] resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          كود النموذج *
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={formSettings.code}
                            onChange={(e) =>
                              setFormSettings({
                                ...formSettings,
                                code: e.target.value,
                              })
                            }
                            placeholder="FRM-001"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 font-mono uppercase"
                          />
                          <button
                            onClick={handleGenerateAICode}
                            title="توليد كود تلقائي"
                            className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 transition-colors"
                          >
                            <Sparkles size={16} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          التصنيف
                        </label>
                        <select
                          value={formSettings.category}
                          onChange={(e) =>
                            setFormSettings({
                              ...formSettings,
                              category: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
                        >
                          <option value="hr">موارد بشرية</option>
                          <option value="financial">مالية</option>
                          <option value="operations">عمليات</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-4">
                <button
                  onClick={() => setIsBlocksOpen(!isBlocksOpen)}
                  className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2 text-indigo-700 font-bold text-[13px]">
                    <Grid3x3 size={16} /> البلوكات المتاحة
                  </div>
                  {isBlocksOpen ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>
                {isBlocksOpen && (
                  <div className="p-3 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50/50">
                    {FORM_BLOCKS.map((blockDef) => (
                      <button
                        key={blockDef.id}
                        onClick={() => handleAddBlock(blockDef)}
                        className="flex flex-col items-start gap-2 p-3 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-sm transition-all group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${blockDef.bg}`}
                        >
                          <blockDef.icon size={16} className={blockDef.color} />
                        </div>
                        <div className="text-[11px] font-bold text-slate-800 text-right">
                          {blockDef.label}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Live Preview Area ── */}
          <div className="flex-1 flex flex-col bg-slate-200/80 relative">
            <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Eye size={16} className="text-blue-600" /> معاينة حية للنموذج
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setFormSettings({
                      ...formSettings,
                      showBorder: !formSettings.showBorder,
                    })
                  }
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${formSettings.showBorder ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
                >
                  <Square size={14} /> إطار للورقة
                </button>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                  <button
                    onClick={() =>
                      setZoomLevel((prev) => Math.max(prev - 10, 50))
                    }
                    className="p-1.5 hover:bg-white rounded text-slate-600"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-[12px] w-12 text-center font-mono font-bold text-slate-700">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() =>
                      setZoomLevel((prev) => Math.min(prev + 10, 150))
                    }
                    className="p-1.5 hover:bg-white rounded text-slate-600"
                  >
                    <ZoomIn size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-12 px-8 custom-scrollbar">
              <div
                ref={paperRef}
                className={`bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative flex flex-col origin-top transition-all duration-300
                  ${formSettings.showBorder ? "border-4 border-slate-800" : ""}
                `}
                style={{
                  width: "210mm",
                  height: `${dynamicHeight}px`, // 💡 ارتفاع ديناميكي متعدد الصفحات
                  transform: `scale(${zoomLevel / 100})`,
                }}
              >
                {/* 💡 رسم الفواصل الوهمية بين الصفحات إذا زاد الطول عن ورقة A4 واحدة */}
                {Array.from({ length: pagesCount - 1 }).map((_, i) => (
                  <div
                    key={`break-${i}`}
                    className="absolute left-0 right-0 border-b-2 border-dashed border-red-300 z-0 pointer-events-none"
                    style={{ top: `${(i + 1) * A4_HEIGHT_PX}px` }}
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded font-bold">
                      نهاية الصفحة {i + 1}
                    </div>
                  </div>
                ))}

                {canvasBlocks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60">
                    <Grid3x3
                      size={64}
                      className="mb-4 text-slate-300"
                      strokeWidth={1}
                    />
                    <div className="text-lg font-bold mb-2 text-slate-600">
                      الورقة فارغة
                    </div>
                    <div className="text-sm">
                      قم باختيار الحقول من القائمة لبناء نموذجك
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative z-10 min-h-full">
                    {canvasBlocks.map((block) => (
                      <div
                        key={block.uid}
                        onClick={() => setSelectedBlockId(block.uid)}
                        onMouseUp={(e) => handleResizeEnd(e, block.uid)} // 💡 التقاط الأبعاد الجديدة بعد انتهاء الـ Resize
                        className={`group flex absolute
                          ${selectedBlockId === block.uid ? "ring-2 ring-blue-400 bg-blue-50/20 z-50 rounded-sm" : "hover:ring-2 hover:ring-slate-300 z-10 rounded"} 
                        `}
                        style={{
                          left: `${block.position.x}px`,
                          top: `${block.position.y}px`,
                          width: `${block.position.width}px`,
                          height: `${block.position.height}px`,
                          resize: "both",
                          overflow: "hidden",
                          minWidth: "50px",
                          minHeight: "20px",
                        }}
                      >
                        {/* مقبض السحب الحر */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <div
                            onMouseDown={(e) =>
                              onMouseDown(e, block.uid, block.position)
                            }
                            className="bg-blue-600 text-white p-2 rounded-full shadow-lg pointer-events-auto cursor-move hover:scale-110 hover:bg-blue-700 transition-transform active:cursor-grabbing"
                            title="اسحب للتحريك الحر"
                          >
                            <Move size={20} />
                          </div>
                        </div>

                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex flex-col gap-1 pointer-events-auto">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(block);
                            }}
                            className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 rounded shadow-sm"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBlock(block.uid);
                            }}
                            className="p-1.5 bg-white text-red-600 hover:bg-red-50 border border-red-200 rounded shadow-sm"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        <div className="w-full h-full flex flex-col pointer-events-none p-1 overflow-hidden">
                          <PreviewBlockRenderer
                            block={block}
                            formSettings={formSettings}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 💡 الترقيم والفوتر لكل صفحة بناءً على طول المحتوى */}
                {Array.from({ length: pagesCount }).map((_, i) => (
                  <div
                    key={`footer-${i}`}
                    className="absolute left-[20mm] right-[20mm] flex justify-between text-[10px] text-slate-400 font-mono"
                    style={{ top: `${(i + 1) * A4_HEIGHT_PX - 40}px` }}
                  >
                    <span dir="ltr">{formSettings.code || "FRM-XXX"}</span>
                    <span className="font-bold text-slate-600">
                      صفحة {i + 1} من {pagesCount}
                    </span>
                    <span>نظام الموارد البشرية</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Editor Dialog ── */}
      {editingBlock && (
        <div className="fixed inset-0 bg-slate-900/40 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl flex flex-col font-[Tajawal] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <div className="p-1.5 rounded bg-blue-100 text-blue-600">
                  <Settings size={16} />
                </div>
                تعديل خصائص: {originalBlock?.label || "الحقل"}
              </div>
              <button
                onClick={cancelEdit}
                className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-2">
                  التسمية (تظهر للمستخدم)
                </label>
                <input
                  type="text"
                  value={editingBlock.label || ""}
                  onChange={(e) =>
                    updateEditingBlock({ label: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-2">
                    العرض (Px)
                  </label>
                  <input
                    type="number"
                    value={editingBlock.position.width || ""}
                    onChange={(e) =>
                      updateEditingBlock({
                        position: {
                          ...editingBlock.position,
                          width: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-2">
                    الارتفاع (Px)
                  </label>
                  <input
                    type="number"
                    value={editingBlock.position.height || ""}
                    onChange={(e) =>
                      updateEditingBlock({
                        position: {
                          ...editingBlock.position,
                          height: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-2">
                  حجم النص الداخلي (Px)
                </label>
                <input
                  type="number"
                  min="8"
                  max="72"
                  value={editingBlock.style?.fontSize || 14}
                  onChange={(e) =>
                    updateEditingBlock({
                      style: {
                        ...editingBlock.style,
                        fontSize: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="مثال: 14"
                />
              </div>

              <div>
                <label className="text-[12px] font-bold text-slate-700 block mb-2">
                  المحاذاة داخل الورقة
                </label>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                  {["right", "center", "left"].map((align) => (
                    <button
                      key={align}
                      onClick={() =>
                        updateEditingBlock({
                          style: { ...editingBlock.style, alignment: align },
                        })
                      }
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${editingBlock.style?.alignment === align ? "bg-white shadow-sm text-blue-600" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {align === "right"
                        ? "يمين"
                        : align === "center"
                          ? "وسط"
                          : "يسار"}
                    </button>
                  ))}
                </div>
              </div>

              {["static_text", "watermark"].includes(editingBlock.type) && (
                <div>
                  <label className="text-[12px] font-bold text-slate-700 block mb-2">
                    النص المعروض
                  </label>
                  <textarea
                    value={editingBlock.defaultValue || ""}
                    onChange={(e) =>
                      updateEditingBlock({ defaultValue: e.target.value })
                    }
                    rows={3}
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-y"
                  />
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-sm font-bold text-slate-700 transition-colors"
              >
                إلغاء التعديلات
              </button>
              <button
                onClick={() => {
                  setEditingBlock(null);
                  setOriginalBlock(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20 transition-all"
              >
                إعتماد التغييرات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
