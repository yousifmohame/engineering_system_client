import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";

// ==========================================
// 💡 1. قائمة البلوكات المتاحة (القوالب الأساسية)
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
];

const getBlockVisuals = (type) => {
  return FORM_BLOCKS.find((b) => b.type === type) || FORM_BLOCKS[0];
};

// ==========================================
// 💡 2. مكون رسم البلوكات على الورقة (Live Preview Renderer)
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
    ? `${block.position.width}mm`
    : "100%";
  const heightStyle = block.position?.height
    ? `${block.position.height}mm`
    : "auto";

  switch (block.type) {
    case "title":
      return (
        <h2
          style={alignStyles}
          className={`text-xl font-bold mb-4 w-full ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}
        >
          {formSettings.name || "عنوان النموذج"}
        </h2>
      );
    case "version":
      return (
        <div
          style={alignStyles}
          className="text-[10px] text-slate-500 font-mono mb-2 w-full"
        >
          الإصدار: {formSettings.version || "1.0"}
        </div>
      );
    case "subject":
      return (
        <div
          style={alignStyles}
          className="text-[11px] font-bold mb-2 flex w-full gap-2"
        >
          <span>{block.label}:</span>
          <span className="border-b border-black flex-1 border-dashed"></span>
        </div>
      );
    case "reference_number":
      return (
        <div
          style={alignStyles}
          className="text-[10px] text-slate-500 font-mono mb-2 w-full"
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
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex items-center gap-2 text-[11px]"
        >
          <span className="font-bold">{block.label}:</span>
          <div className="border border-slate-300 bg-slate-50 rounded px-3 py-1 text-slate-500 flex items-center gap-2 min-w-[100px]">
            {block.defaultValue || "__ / __ / ____"} <CalendarClock size={12} />
          </div>
        </div>
      );
    case "time":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex items-center gap-2 text-[11px]"
        >
          <span className="font-bold">{block.label}:</span>
          <span
            className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded"
            dir="ltr"
          >
            10:30 AM
          </span>
        </div>
      );
    case "text_field":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex items-center gap-2"
        >
          <label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">
            {block.label}
          </label>
          <div className="border-b border-slate-300 flex-1 h-4"></div>
        </div>
      );
    case "text_area":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-3 flex flex-col"
        >
          <label className="text-[11px] font-bold text-slate-700 mb-1">
            {block.label}
          </label>
          <div
            className="border border-slate-300 rounded bg-slate-50 w-full p-2 text-[10px] text-slate-500 overflow-hidden"
            style={{ height: heightStyle }}
          >
            {block.defaultValue || "مساحة للكتابة..."}
          </div>
        </div>
      );
    case "employee_info":
      return (
        <div
          style={{ width: widthStyle }}
          className="mb-4 border border-indigo-200 bg-indigo-50/30 rounded-lg p-3"
        >
          <div className="text-[11px] font-bold text-indigo-800 mb-2 flex items-center gap-1.5">
            <User size={14} /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1.5 border border-indigo-100 rounded">
              الاسم: ----------------
            </div>
            <div className="bg-white p-1.5 border border-indigo-100 rounded">
              الرقم الوظيفي: ---------
            </div>
          </div>
        </div>
      );
    case "table":
      return (
        <div
          style={{ width: widthStyle }}
          className="mb-4 border border-slate-300 rounded overflow-hidden"
        >
          <table className="w-full text-center text-[10px] bg-white">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-1.5">العمود 1</th>
                <th className="p-1.5">العمود 2</th>
                <th className="p-1.5">العمود 3</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-1.5">—</td>
                <td className="p-1.5">—</td>
                <td className="p-1.5">—</td>
              </tr>
              <tr>
                <td className="p-1.5">—</td>
                <td className="p-1.5">—</td>
                <td className="p-1.5">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case "checkbox":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="mb-2 flex items-center gap-2"
        >
          <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm"></div>
          <span className="text-[11px] font-bold text-slate-700">
            {block.label}
          </span>
        </div>
      );
    case "signature":
      return (
        <div
          style={{ width: widthStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            style={{ height: heightStyle }}
            className="w-full border-2 border-slate-300 rounded bg-slate-50"
          ></div>
        </div>
      );
    case "office_signature":
      return (
        <div
          style={{ width: widthStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1 text-cyan-700"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            style={{ height: heightStyle }}
            className="w-full border-2 border-cyan-600 rounded bg-cyan-50 flex items-center justify-center text-cyan-600 text-[10px] overflow-hidden"
          >
            {block.defaultValue ? (
              <img
                src={block.defaultValue}
                alt="Signature"
                className="max-w-full max-h-full"
              />
            ) : (
              "توقيع رسمي"
            )}
          </div>
        </div>
      );
    case "office_stamp":
      return (
        <div
          style={{ width: widthStyle, height: heightStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1 text-rose-700"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div className="w-full h-full border-2 border-dashed border-rose-600 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 overflow-hidden aspect-square">
            {block.defaultValue ? (
              <img
                src={block.defaultValue}
                alt="Stamp"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <Stamp size={24} />
            )}
          </div>
        </div>
      );
    case "fingerprint":
      return (
        <div
          style={{ width: widthStyle }}
          className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="text-[10px] font-bold mb-1"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div
            style={{ height: heightStyle }}
            className="w-full border-2 border-slate-300 rounded bg-slate-50 aspect-square"
          ></div>
        </div>
      );
    case "separator":
      return <hr className="my-4 border-t-2 border-slate-300 w-full" />;
    case "spacer":
      return <div style={{ height: heightStyle, width: "100%" }}></div>;
    case "watermark":
      return (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-6xl font-black text-slate-400/10 -rotate-45 overflow-hidden z-0">
          {block.defaultValue || "WATERMARK"}
        </div>
      );
    case "static_text":
      return (
        <div
          style={{ ...alignStyles, width: widthStyle }}
          className="text-[11px] leading-relaxed mb-3 w-full whitespace-pre-wrap"
        >
          {block.defaultValue || block.label}
        </div>
      );
    default:
      return (
        <div className="mb-2 p-2 border border-dashed border-blue-300 bg-blue-50 text-blue-800 text-[10px] text-center rounded w-full">
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

  // إعدادات النموذج
  const [formSettings, setFormSettings] = useState({
    name: "",
    code: "",
    description: "",
    version: "1.0",
    category: "hr",
    colorMode: "color",
    numberFormat: "english",
    timezone: "Asia/Riyadh",
    fontFamily: "Tajawal",
    fontSize: 12,
    isPublic: false,
  });

  const [canvasBlocks, setCanvasBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [originalBlock, setOriginalBlock] = useState(null);

  // 💡 التعديل الجوهري: تعبئة البيانات المبدئية عند تعديل نموذج موجود
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
        fontSize: initialData.fontSize || 12,
        isPublic: initialData.isPublic || false,
      });

      if (initialData.blocks && initialData.blocks.length > 0) {
        // إعادة بناء البلوكات لتتوافق مع الواجهة
        const formattedBlocks = initialData.blocks.map((b) => ({
          uid:
            b.id ||
            `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: b.type,
          label: b.label,
          position: b.position || { width: 80, height: 10 },
          style: b.style || { alignment: "right" },
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

  // --- Handlers ---
  const handleAddBlock = (blockDef) => {
    const newBlock = {
      uid: `block_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: blockDef.type,
      label: blockDef.label,
      position: {
        x: 20,
        y: 50,
        width: [
          "table",
          "employee_info",
          "header_image",
          "footer_image",
          "background_image",
          "separator",
        ].includes(blockDef.type)
          ? 170
          : 80,
        height: ["text_area"].includes(blockDef.type)
          ? 30
          : ["table"].includes(blockDef.type)
            ? 60
            : ["office_stamp", "fingerprint"].includes(blockDef.type)
              ? 20
              : 10,
      },
      style: { alignment: "right" },
      isEditable: ![
        "header_image",
        "footer_image",
        "background_image",
        "watermark",
        "office_stamp",
        "office_signature",
        "separator",
        "spacer",
      ].includes(blockDef.type),
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

  const handleDuplicateBlock = (block) => {
    const newBlock = {
      ...JSON.parse(JSON.stringify(block)),
      uid: `block_${Date.now()}_dup`,
    };
    newBlock._ui = getBlockVisuals(newBlock.type); // إستعادة الأيقونة بعد الـ Parse
    setCanvasBlocks([...canvasBlocks, newBlock]);
  };

  const moveBlock = (index, direction) => {
    if (
      (direction === -1 && index === 0) ||
      (direction === 1 && index === canvasBlocks.length - 1)
    )
      return;
    const newBlocks = [...canvasBlocks];
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[index + direction];
    newBlocks[index + direction] = temp;
    setCanvasBlocks(newBlocks);
  };

  // فتح نافذة التعديل مع الاحتفاظ بنسخة للـ Cancel
  const openEditDialog = (block) => {
    // 1. أخذ نسخة آمنة مع استرجاع الأيقونة المفقودة بسبب الـ JSON.parse
    const originalCopy = JSON.parse(JSON.stringify(block));
    originalCopy._ui = getBlockVisuals(originalCopy.type); // 💡 السطر السحري لاسترجاع الأيقونة
    setOriginalBlock(originalCopy);

    // 2. إعداد نسخة التعديل بنفس الطريقة
    const editingCopy = JSON.parse(JSON.stringify(block));
    editingCopy._ui = getBlockVisuals(editingCopy.type); // 💡 السطر السحري لاسترجاع الأيقونة
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
    if (!formSettings.name || !formSettings.code) {
      return toast.error("يرجى إدخال اسم النموذج والكود.");
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formSettings,
        blocks: canvasBlocks.map((b, index) => ({
          type: b.type,
          label: b.label,
          position: b.position,
          style: b.style,
          isEditable: b.isEditable,
          isRequired: b.isRequired,
          dataSource: b.dataSource,
          defaultValue: b.defaultValue,
          order: index,
        })),
      };

      // 💡 التعديل الجوهري: تحديد هل العملية إنشاء أم تعديل بناءً على وجود initialData
      if (initialData && initialData.id) {
        await api.put(`/forms/templates/${initialData.id}`, payload);
        toast.success("تم تحديث النموذج بنجاح!");
      } else {
        await api.post("/forms/templates", payload);
        toast.success("تم إنشاء النموذج بنجاح!");
      }

      if (onSaveSuccess) onSaveSuccess();
      else onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "حدث خطأ أثناء الاتصال بالخادم",
      );
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
                {initialData ? "تعديل النموذج" : "إنشاء نموذج جديد"}
              </div>
              <div className="text-[10px] text-slate-500">
                محرر السحب والافلات التفاعلي
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
              <span>{isSaving ? "جاري الحفظ..." : "حفظ النموذج"}</span>
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
              {/* Settings Accordion */}
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
                        placeholder="مثال: إقرار الحساب البنكي"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          كود النموذج *
                        </label>
                        <input
                          type="text"
                          value={formSettings.code}
                          onChange={(e) =>
                            setFormSettings({
                              ...formSettings,
                              code: e.target.value,
                            })
                          }
                          placeholder="FRM-HR-001"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 font-mono uppercase"
                        />
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

              {/* Blocks Palette Accordion */}
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

              {/* Added Blocks List */}
              {canvasBlocks.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[13px] font-bold text-slate-900">
                      العناصر المضافة ({canvasBlocks.length})
                    </span>
                    <button
                      onClick={() => {
                        if (window.confirm("حذف الكل؟")) setCanvasBlocks([]);
                      }}
                      className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      حذف الكل
                    </button>
                  </div>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2 -mr-2">
                    {canvasBlocks.map((block, index) => {
                      const isSelected = selectedBlockId === block.uid;
                      const Icon = block._ui?.icon || Type; // حماية ضد الـ undefined
                      return (
                        <div
                          key={block.uid}
                          onClick={() => setSelectedBlockId(block.uid)}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${isSelected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${block._ui?.bg}`}
                          >
                            <Icon size={14} className={block._ui?.color} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-slate-900 truncate">
                              {block.label}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(index, -1);
                              }}
                              disabled={index === 0}
                              className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                moveBlock(index, 1);
                              }}
                              disabled={index === canvasBlocks.length - 1}
                              className="p-1.5 hover:bg-slate-100 rounded disabled:opacity-30"
                            >
                              <ArrowDown size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(block);
                              }}
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveBlock(block.uid);
                              }}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Live Preview Area ── */}
          <div className="flex-1 flex flex-col bg-slate-200/80 relative">
            <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur border border-slate-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
              <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Eye size={16} className="text-blue-600" /> معاينة حية للنموذج
              </div>
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

            <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-12 px-8 custom-scrollbar">
              <div
                className="w-[210mm] min-h-[297mm] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col transition-transform duration-300 origin-top"
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  padding: "20mm",
                }}
              >
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
                  <div className="flex flex-col gap-2 w-full relative z-10">
                    {canvasBlocks.map((block) => (
                      <div
                        key={block.uid}
                        onClick={() => setSelectedBlockId(block.uid)}
                        className={`relative group transition-all rounded ${selectedBlockId === block.uid ? "ring-2 ring-blue-400 bg-blue-50/20" : "hover:ring-2 hover:ring-slate-200"} p-2 -mx-2 flex`}
                      >
                        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1">
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
                        <div
                          className={`w-full ${selectedBlockId === block.uid ? "pointer-events-none" : ""}`}
                        >
                          <PreviewBlockRenderer
                            block={block}
                            formSettings={formSettings}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-auto pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono flex justify-between">
                  <span dir="ltr">{formSettings.code || "FRM-XXX"}</span>
                  <span>نظام الموارد البشرية</span>
                </div>
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

            <div className="p-6 flex flex-col gap-5">
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
                    العرض (مم)
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
                    الارتفاع (مم)
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
