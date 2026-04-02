import React, { useState, useEffect, useRef, useCallback } from "react";
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
  SeparatorVertical, // 👈 أضف هذه الأيقونة
  Plus,
  Users,
  Trash2,
  ArrowUp,
  ArrowDown,
  Settings2,
  Edit2,
  Upload,
  Sparkles,
  Move,
  Square,
  ImagePlus,
  Building2,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";

// ==========================================
// 💡 ثوابت أبعاد الورقة
// ==========================================
const A4_WIDTH_PX = 794; // عرض الورقة التقريبي 210mm
const A4_HEIGHT_PX = 1122.5;

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
  {
    id: 26,
    type: "company_logo",
    label: "لوجو الشركة",
    desc: "صورة شعار الشركة",
    icon: Building2,
    color: "text-indigo-600",
    bg: "bg-indigo-600/10",
  },
  {
    id: 27,
    type: "vertical_separator",
    label: "فاصل رأسي",
    desc: "خط فاصل عمودي",
    icon: SeparatorVertical, // 👈 الأيقونة الجديدة
    color: "text-slate-400",
    bg: "bg-slate-400/10",
  },
  {
    id: 28,
    type: "square_frame",
    label: "إطار مربع",
    desc: "مربع شفاف بحدود",
    icon: Square, // 👈 استخدمنا أيقونة Square المستوردة مسبقاً
    color: "text-slate-700",
    bg: "bg-slate-700/10",
  },
];

const getBlockVisuals = (type) => {
  return FORM_BLOCKS.find((b) => b.type === type) || FORM_BLOCKS[0];
};

// ==========================================
// 💡 2. مكون العرض الساكن للمنشئ (Static Builder Renderer)
// ==========================================
const StaticBuilderRenderer = React.memo(({ block, formSettings }) => {
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
  const widthStyle = "100%";
  const heightStyle = "100%";
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
          className={`font-bold w-full h-full overflow-hidden whitespace-pre-wrap break-words ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}
        >
          {block.defaultValue || formSettings.name || "عنوان النموذج"}
        </h2>
      );
    case "version":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full h-full overflow-hidden"
        >
          الإصدار: {formSettings.version || "1.0"}
        </div>
      );
    case "subject":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="font-bold flex w-full h-full gap-2 items-start overflow-hidden"
        >
          <span className="whitespace-nowrap shrink-0">{block.label}:</span>
          <span className="border-b border-slate-400 flex-1 border-dashed text-slate-400 font-normal">
            نص الموضوع
          </span>
        </div>
      );
    case "reference_number":
      return (
        <div
          style={{ ...alignStyles, fontSize: fontSizeStyle }}
          className="text-slate-500 font-mono w-full h-full overflow-hidden"
        >
          {block.label}: {formSettings.code || "FRM-XXX"}-2026-001
        </div>
      );
    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      return (
        <div
          style={{
            ...alignStyles,
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <span className="font-bold shrink-0">{block.label}:</span>
          <div className="border border-slate-300 bg-slate-50 rounded px-3 py-1.5 text-slate-500 flex items-center gap-2 min-w-[120px] whitespace-nowrap">
            ____ / __ / __ <CalendarClock size={16} />
          </div>
        </div>
      );
    case "time":
      return (
        <div
          style={{
            ...alignStyles,
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <span className="font-bold shrink-0">{block.label}:</span>
          <span
            className="font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded whitespace-nowrap"
            dir="ltr"
          >
            10:30 AM
          </span>
        </div>
      );
    case "text_field":
      return (
        <div
          style={{
            ...alignStyles,
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="flex items-center gap-2 overflow-hidden"
        >
          <label className="font-bold text-slate-700 whitespace-nowrap shrink-0">
            {block.label}
          </label>
          <div className="border-b border-slate-300 flex-1 h-6 border-dashed"></div>
        </div>
      );
    case "text_area":
    case "static_text":
      return (
        <div
          style={{
            ...alignStyles,
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="flex flex-col overflow-hidden"
        >
          {block.type === "text_area" && (
            <label className="font-bold text-slate-700 mb-1.5 shrink-0">
              {block.label}
            </label>
          )}
          <div
            className={`${block.type === "text_area" ? "border border-slate-300 rounded bg-slate-50 p-2 text-slate-500" : "font-bold text-slate-800"} w-full h-full flex-1 overflow-hidden whitespace-pre-wrap break-words`}
          >
            {block.defaultValue ||
              (block.type === "text_area"
                ? "مساحة مخصصة لكتابة النصوص أثناء التعبئة..."
                : "نص ثابت")}
          </div>
        </div>
      );
    case "image_upload":
    case "company_logo":
    case "header_image":
    case "footer_image":
    case "background_image":
      // استخدام القيمة الافتراضية إذا كانت تحتوي على صورة لتعرض مباشرة في وضع المُنشئ
      const imgData =
        typeof block.defaultValue === "object"
          ? block.defaultValue
          : { url: block.defaultValue };
      const hasImage = !!imgData?.url;

      return (
        <div
          style={{ ...alignStyles, width: widthStyle, height: heightStyle }}
          className="flex flex-col overflow-hidden relative"
        >
          {block.type !== "background_image" &&
            block.type !== "header_image" &&
            block.type !== "footer_image" && (
              <label
                style={{ fontSize: fontSizeStyle }}
                className="font-bold text-slate-700 mb-1.5 shrink-0 z-10"
              >
                {block.label}
              </label>
            )}
          {hasImage ? (
            <div className="flex-1 w-full h-full relative">
              <img
                src={imgData.url}
                alt="block_img"
                className="w-full h-full pointer-events-none"
                style={{
                  objectFit:
                    imgData.fit ||
                    (block.type === "background_image" ? "cover" : "contain"),
                  opacity: imgData.opacity ?? 1,
                }}
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-blue-300 rounded-lg bg-blue-50/30 w-full h-full flex flex-col items-center justify-center text-blue-400">
              <ImageIcon size={32} className="mb-2 opacity-50" />
              <span style={{ fontSize: "10px" }} className="font-bold">
                مساحة {block.label}
              </span>
            </div>
          )}
        </div>
      );
    case "employee_info":
      return (
        <div
          style={{
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="border border-indigo-200 bg-indigo-50/30 rounded-xl p-4 overflow-hidden"
        >
          <div className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
            <User size={18} /> {block.label}
          </div>
          <div className="grid grid-cols-2 gap-3 text-slate-500">
            <div className="bg-white p-2 border border-indigo-100 rounded-lg truncate">
              الاسم: ----------------
            </div>
            <div className="bg-white p-2 border border-indigo-100 rounded-lg truncate">
              الرقم الوظيفي: ---------
            </div>
          </div>
        </div>
      );
    case "table":
      return (
        <div
          style={{
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="border border-slate-300 rounded-lg overflow-hidden flex flex-col"
        >
          <table className="w-full text-center bg-white flex-1">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr>
                <th className="p-2 border-r">العمود 1</th>
                <th className="p-2 border-r">العمود 2</th>
                <th className="p-2">العمود 3</th>
              </tr>
            </thead>
            <tbody className="text-slate-400">
              <tr className="border-b border-slate-200">
                <td className="p-2 border-r">—</td>
                <td className="p-2 border-r">—</td>
                <td className="p-2">—</td>
              </tr>
              <tr>
                <td className="p-2 border-r">—</td>
                <td className="p-2 border-r">—</td>
                <td className="p-2">—</td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    case "checkbox":
      return (
        <div
          style={{
            ...alignStyles,
            width: widthStyle,
            height: heightStyle,
            fontSize: fontSizeStyle,
          }}
          className="flex items-center gap-3 overflow-hidden"
        >
          <div className="w-4 h-4 border-2 border-slate-400 rounded-sm shrink-0"></div>
          <span className="font-bold text-slate-700 truncate">
            {block.label}
          </span>
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
          className={`flex flex-col overflow-hidden ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}
        >
          <div
            className="font-bold mb-2 shrink-0"
            style={{ textAlign: block.style?.alignment }}
          >
            {block.label}:
          </div>
          <div className="w-full flex-1 border-2 border-slate-300 border-dashed rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
            {block.type === "office_stamp" ? (
              <Stamp size={32} />
            ) : block.type === "fingerprint" ? (
              <span className="text-xs">البصمة</span>
            ) : (
              <Pen size={32} />
            )}
          </div>
        </div>
      );
    case "separator":
      return (
        <hr className="my-2 border-t-2 border-slate-300 w-full shrink-0" />
      );
    case "spacer":
      return (
        <div className="w-full h-full border border-dashed border-slate-200 bg-slate-50/50"></div>
      );
    // 👇 الكود الجديد الخاص بالفاصل الرأسي
    case "vertical_separator":
      return (
        <div className="mx-auto w-0 h-full border-r-2 border-slate-300 shrink-0"></div>
      );
    // 👇 الكود الخاص بالإطار المربع
    case "square_frame":
      const borderWidth = block.style?.borderWidth || 2;
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            border: `${borderWidth}px solid #000`, // لون الحد أسود
            backgroundColor: "transparent", // شفافية الخلفية
          }}
          className="pointer-events-none" // حتى لا يعيق السحب والإفلات
        ></div>
      );
    default:
      return (
        <div className="p-3 border border-dashed border-blue-300 bg-blue-50 text-blue-800 text-center rounded-lg w-full h-full font-bold">
          {block.label}
        </div>
      );
  }
});

// ==========================================
// 💡 3. المكون الرئيسي (Form Builder Modal)
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

  const paperRef = useRef(null);
  const [originalBlock, setOriginalBlock] = useState(null);

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
    borderSettings: { active: false, width: 2, margin: 30, color: "#0f172a" },
    watermark: {
      text: "مسودة",
      opacity: 0.1,
      size: 100,
      angle: -45,
      color: "#94a3b8",
      isImage: false,
      imgUrl: null,
      repeat: false,
      active: false,
    },
  });

  const [canvasBlocks, setCanvasBlocks] = useState([]);
  const [selectedBlockId, setSelectedBlockId] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);

  const [isWmSettingsOpen, setIsWmSettingsOpen] = useState(false);
  const [isBorderSettingsOpen, setIsBorderSettingsOpen] = useState(false);

  const [dragState, setDragState] = useState({
    isDragging: false,
    blockId: null,
    startX: 0,
    startY: 0,
    initialLeft: 0,
    initialTop: 0,
  });

  const [resizeState, setResizeState] = useState({
    isResizing: false,
    blockId: null,
    handle: null,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    initialW: 0,
    initialH: 0,
  });

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
        borderSettings: initialData.borderSettings || {
          active: initialData.showBorder || false,
          width: 2,
          margin: 30,
          color: "#0f172a",
        },
        watermark: initialData.watermark || formSettings.watermark,
      });

      if (initialData.blocks && initialData.blocks.length > 0) {
        const formattedBlocks = initialData.blocks
          .filter((b) => b.type !== "watermark")
          .map((b) => {
            let parsedDefault = b.defaultValue || "";
            // تفكيك الكائن لو كان محفوظاً على هيئة JSON
            if (
              typeof parsedDefault === "string" &&
              parsedDefault.startsWith("{")
            ) {
              try {
                parsedDefault = JSON.parse(parsedDefault);
              } catch (e) {}
            }
            return {
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
              defaultValue: parsedDefault,
              _ui: getBlockVisuals(b.type),
            };
          });
        setCanvasBlocks(formattedBlocks);
      }
    }
  }, [initialData]);

  const handleGenerateAICode = async () => {
    if (!formSettings.name)
      return toast.error("يرجى كتابة اسم النموذج أولاً لتوليد الكود");
    const loadingToast = toast.loading("جاري توليد الكود...");
    try {
      const res = await api.post("/forms/generate-code", {
        formName: formSettings.name,
        category: formSettings.category,
      });
      setFormSettings({ ...formSettings, code: res.data.data.code });
      toast.success("تم التوليد بنجاح!", { id: loadingToast });
    } catch {
      toast.error("فشل التوليد، حاول مجدداً.", { id: loadingToast });
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
        width: [
          "table",
          "employee_info",
          "header_image",
          "separator",
          "background_image",
        ].includes(blockDef.type)
          ? 600
          : ["vertical_separator"].includes(blockDef.type)
            ? 30
            : ["square_frame"].includes(blockDef.type) // 👈 عرض الإطار المربع
              ? 200
              : ["company_logo"].includes(blockDef.type)
                ? 150
                : 300,
        height: ["text_area", "image_upload"].includes(blockDef.type)
          ? 120
          : ["table", "background_image"].includes(blockDef.type)
            ? 200
            : ["company_logo"].includes(blockDef.type)
              ? 80
              : 50,
      },
      style: { alignment: "right", fontSize: 14 },
      isEditable: true,
      isRequired: false,
      dataSource: "manual",
      defaultValue: blockDef.type === "static_text" ? "نص ثابت جديد..." : "",
    };
    setCanvasBlocks([...canvasBlocks, newBlock]);
    setSelectedBlockId(newBlock.uid);
  };

  const handleRemoveBlock = (uid) => {
    setCanvasBlocks(canvasBlocks.filter((b) => b.uid !== uid));
    if (selectedBlockId === uid) setSelectedBlockId(null);
  };

  const onMouseDownDrag = (e, uid, position) => {
    e.preventDefault();
    e.stopPropagation();
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

  const onMouseDownResize = (e, uid, position, handle) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBlockId(uid);
    setResizeState({
      isResizing: true,
      blockId: uid,
      handle,
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y,
      initialW: position.width,
      initialH: position.height,
    });
  };

  useEffect(() => {
    const onMouseMove = (e) => {
      // 💡 التحكم بالسحب مع تقييد حدود الورقة
      if (dragState.isDragging && dragState.blockId) {
        const deltaX = (e.clientX - dragState.startX) / (zoomLevel / 100);
        const deltaY = (e.clientY - dragState.startY) / (zoomLevel / 100);
        setCanvasBlocks((prev) =>
          prev.map((b) => {
            if (b.uid === dragState.blockId) {
              let newX = dragState.initialLeft + deltaX;
              let newY = dragState.initialTop + deltaY;
              // التقييد بحدود الورقة
              newX = Math.max(
                0,
                Math.min(newX, A4_WIDTH_PX - b.position.width),
              );
              newY = Math.max(
                0,
                Math.min(newY, A4_HEIGHT_PX - b.position.height),
              );

              return {
                ...b,
                position: { ...b.position, x: newX, y: newY },
              };
            }
            return b;
          }),
        );
      }

      // 💡 التحكم بالتحجيم مع تقييد حدود الورقة
      if (resizeState.isResizing && resizeState.blockId) {
        const deltaX = (e.clientX - resizeState.startX) / (zoomLevel / 100);
        const deltaY = (e.clientY - resizeState.startY) / (zoomLevel / 100);

        setCanvasBlocks((prev) =>
          prev.map((b) => {
            if (b.uid === resizeState.blockId) {
              let { initialX, initialY, initialW, initialH, handle } =
                resizeState;
              let newX = initialX,
                newY = initialY,
                newW = initialW,
                newH = initialH;

              if (handle.includes("e")) {
                newW = Math.max(30, initialW + deltaX);
                newW = Math.min(newW, A4_WIDTH_PX - initialX);
              }
              if (handle.includes("w")) {
                const maxDeltaX = initialW - 30;
                const actualDeltaX = Math.max(
                  -initialX,
                  Math.min(deltaX, maxDeltaX),
                );
                newX = initialX + actualDeltaX;
                newW = initialW - actualDeltaX;
              }
              if (handle.includes("s")) {
                newH = Math.max(20, initialH + deltaY);
                newH = Math.min(newH, A4_HEIGHT_PX - initialY);
              }
              if (handle.includes("n")) {
                const maxDeltaY = initialH - 20;
                const actualDeltaY = Math.max(
                  -initialY,
                  Math.min(deltaY, maxDeltaY),
                );
                newY = initialY + actualDeltaY;
                newH = initialH - actualDeltaY;
              }

              return {
                ...b,
                position: {
                  ...b.position,
                  x: newX,
                  y: newY,
                  width: newW,
                  height: newH,
                },
              };
            }
            return b;
          }),
        );
      }
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
      if (resizeState.isResizing)
        setResizeState({
          isResizing: false,
          blockId: null,
          handle: null,
          startX: 0,
          startY: 0,
          initialX: 0,
          initialY: 0,
          initialW: 0,
          initialH: 0,
        });
    };

    if (dragState.isDragging || resizeState.isResizing) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragState, resizeState, zoomLevel]);

  const openEditDialog = (block) => {
    setOriginalBlock(JSON.parse(JSON.stringify(block)));
    setEditingBlock(JSON.parse(JSON.stringify(block)));
  };

  const updateEditingBlock = (updates) => {
    const updated = { ...editingBlock, ...updates };
    setEditingBlock(updated);
    setCanvasBlocks(
      canvasBlocks.map((b) => (b.uid === updated.uid ? updated : b)),
    );
  };

  const cancelEdit = () => {
    if (originalBlock)
      setCanvasBlocks(
        canvasBlocks.map((b) =>
          b.uid === originalBlock.uid ? originalBlock : b,
        ),
      );
    setEditingBlock(null);
    setOriginalBlock(null);
  };

  // رفع الصورة للبلوكات المدعومة من داخل إعدادات المُنشئ
  const handleImageUploadForBlock = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        let currentVal = editingBlock.defaultValue;
        if (typeof currentVal !== "object" || currentVal === null)
          currentVal = {};
        updateEditingBlock({
          defaultValue: {
            ...currentVal,
            url: ev.target.result,
            opacity: currentVal.opacity ?? 1,
            fit: "contain",
          },
        });
      };
      reader.readAsDataURL(file);
    }
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
            absolute: true,
          },
          style: { alignment: b.style.alignment, fontSize: b.style.fontSize },
          isEditable: b.isEditable,
          isRequired: b.isRequired,
          dataSource: b.dataSource,
          // تحويل الـ JSON لكائن نصي إذا كان يحتوي على صورة وشفافية للحفاظ عليه في الـ Backend
          defaultValue:
            typeof b.defaultValue === "object"
              ? JSON.stringify(b.defaultValue)
              : b.defaultValue,
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
        <div className="px-5 py-3.5 border-b-2 border-slate-200 flex items-center justify-between bg-slate-50 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-[15px] font-bold text-slate-900">
                مُنشئ النماذج الذكي
              </div>
              <div className="text-[10px] text-slate-500">
                سحب وإفلات، تحجيم بالحواف، وتخصيص دقيق
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
              <span>{isSaving ? "جاري الحفظ..." : "حفظ التصميم"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-lg border border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                  className="w-full p-3.5 flex items-center justify-between bg-transparent hover:bg-slate-50 transition-colors border-b border-slate-100"
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
                  <div className="p-4 flex flex-col gap-3">
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 min-h-[60px] resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1.5">
                          كود النموذج *
                        </label>
                        <div className="flex gap-1">
                          <input
                            type="text"
                            value={formSettings.code}
                            onChange={(e) =>
                              setFormSettings({
                                ...formSettings,
                                code: e.target.value,
                              })
                            }
                            className="w-full px-2 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 font-mono uppercase"
                          />
                          <button
                            onClick={handleGenerateAICode}
                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-200"
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
                    <Grid3x3 size={16} /> إضافة البلوكات للورقة
                  </div>
                  {isBlocksOpen ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </button>
                {isBlocksOpen && (
                  <div className="p-3 border-t border-slate-100 grid grid-cols-2 gap-2 bg-slate-50/50">
                    {FORM_BLOCKS.filter((b) => b.type !== "watermark").map(
                      (blockDef) => (
                        <button
                          key={blockDef.id}
                          onClick={() => handleAddBlock(blockDef)}
                          className={`flex flex-col items-start gap-2 p-3 bg-white border-2 rounded-xl transition-all group ${canvasBlocks.some((b) => b.type === blockDef.type && ["title", "version", "reference_number", "subject", "company_logo", "background_image"].includes(b.type)) ? "opacity-50 cursor-not-allowed border-slate-100" : "hover:border-blue-400 hover:shadow-sm border-slate-200"}`}
                          disabled={canvasBlocks.some(
                            (b) =>
                              b.type === blockDef.type &&
                              [
                                "title",
                                "version",
                                "reference_number",
                                "subject",
                                "company_logo",
                                "background_image",
                              ].includes(b.type),
                          )}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${blockDef.bg}`}
                          >
                            <blockDef.icon
                              size={16}
                              className={blockDef.color}
                            />
                          </div>
                          <div className="text-[11px] font-bold text-slate-800 text-right">
                            {blockDef.label}
                          </div>
                        </button>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Live Preview Area ── */}
          <div
            className="flex-1 flex flex-col bg-slate-200/80 relative"
            onClick={() => setSelectedBlockId(null)}
          >
            {/* Toolbar */}
            <div
              className="absolute top-4 left-6 flex items-center gap-1 bg-white shadow-sm p-1 rounded-xl z-20 border border-slate-200"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setZoomLevel((p) => Math.max(p - 10, 50))}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <ZoomOut size={18} />
              </button>
              <span className="text-[13px] font-bold font-mono text-slate-700 min-w-[50px] text-center">
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel((p) => Math.min(p + 10, 150))}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
              >
                <ZoomIn size={18} />
              </button>
            </div>
            <div
              className="absolute top-4 right-6 flex items-center gap-2 z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsBorderSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${formSettings.borderSettings?.active ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"}`}
              >
                <Square size={14} /> إطار الورقة
              </button>
              <button
                onClick={() => setIsWmSettingsOpen(true)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm ${formSettings.watermark?.active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-300 hover:bg-blue-50"}`}
              >
                <Droplet size={14} /> علامة مائية
              </button>
            </div>

            <div className="flex-1 overflow-auto flex items-start justify-center pt-24 pb-12 px-8 custom-scrollbar">
              <div
                ref={paperRef}
                className="bg-white shadow-[0_10px_40px_rgba(0,0,0,0.15)] relative flex flex-col origin-top transition-transform duration-300"
                style={{
                  width: `${A4_WIDTH_PX}px`,
                  height: `${A4_HEIGHT_PX}px`,
                  transform: `scale(${zoomLevel / 100})`,
                  padding: "0",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {formSettings.borderSettings?.active && (
                  <div
                    className="absolute z-0 pointer-events-none"
                    style={{
                      top: `${formSettings.borderSettings.margin}px`,
                      height: `${A4_HEIGHT_PX - formSettings.borderSettings.margin * 2}px`,
                      left: `${formSettings.borderSettings.margin}px`,
                      right: `${formSettings.borderSettings.margin}px`,
                      border: `${formSettings.borderSettings.width}px solid ${formSettings.borderSettings.color}`,
                    }}
                  ></div>
                )}

                {formSettings.watermark?.active &&
                  formSettings.watermark.text &&
                  !formSettings.watermark.isImage && (
                    <div
                      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
                      style={{ opacity: formSettings.watermark.opacity }}
                    >
                      <div
                        style={{
                          transform: `rotate(${formSettings.watermark.angle}deg)`,
                          fontSize: `${formSettings.watermark.size}px`,
                          color: formSettings.watermark.color,
                          fontWeight: 900,
                          whiteSpace: "nowrap",
                        }}
                        className="select-none"
                      >
                        {formSettings.watermark.repeat
                          ? Array(10)
                              .fill(formSettings.watermark.text)
                              .map((t, i) => (
                                <div key={i} className="my-8">
                                  {t} &nbsp;&nbsp;&nbsp; {t} &nbsp;&nbsp;&nbsp;{" "}
                                  {t}
                                </div>
                              ))
                          : formSettings.watermark.text}
                      </div>
                    </div>
                  )}
                {formSettings.watermark?.active &&
                  formSettings.watermark.isImage &&
                  formSettings.watermark.imgUrl && (
                    <div
                      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0"
                      style={{ opacity: formSettings.watermark.opacity }}
                    >
                      <img
                        src={formSettings.watermark.imgUrl}
                        alt="Watermark"
                        style={{
                          width: formSettings.watermark.repeat
                            ? "100%"
                            : `${formSettings.watermark.size}%`,
                          height: formSettings.watermark.repeat
                            ? "100%"
                            : "auto",
                          objectFit: formSettings.watermark.repeat
                            ? "cover"
                            : "contain",
                        }}
                      />
                    </div>
                  )}

                {/* Blocks Area */}
                {canvasBlocks.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 z-10">
                    <Grid3x3
                      size={64}
                      className="mb-4 text-slate-300"
                      strokeWidth={1}
                    />
                    <div className="text-lg font-bold mb-2 text-slate-600">
                      الورقة فارغة تماماً
                    </div>
                    <div className="text-sm">
                      قم باختيار الحقول من القائمة الجانبية لسحبها هنا
                    </div>
                  </div>
                ) : (
                  <div
                    className="w-full h-full relative z-10"
                    onClick={() => setSelectedBlockId(null)}
                  >
                    {canvasBlocks.map((block) => {
                      const isActive = selectedBlockId === block.uid;

                      return (
                        <div
                          key={block.uid}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(block.uid);
                          }}
                          className={`absolute group outline-none ${isActive ? "ring-2 ring-blue-500 z-50 bg-blue-50/10 shadow-lg" : "hover:ring-1 hover:ring-slate-300 z-10 bg-transparent"}`}
                          style={{
                            left: `${block.position.x}px`,
                            top: `${block.position.y}px`,
                            width: `${block.position.width}px`,
                            height: `${block.position.height}px`,
                            minWidth: "40px",
                            minHeight: "20px",
                          }}
                        >
                          {isActive && (
                            <>
                              <div
                                className="absolute top-0 bottom-0 -left-1.5 w-3 cursor-w-resize z-[60]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "w",
                                  )
                                }
                              />
                              <div
                                className="absolute top-0 bottom-0 -right-1.5 w-3 cursor-e-resize z-[60]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "e",
                                  )
                                }
                              />
                              <div
                                className="absolute top-0 left-0 right-0 -mt-1.5 h-3 cursor-n-resize z-[60]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "n",
                                  )
                                }
                              />
                              <div
                                className="absolute bottom-0 left-0 right-0 -mb-1.5 h-3 cursor-s-resize z-[60]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "s",
                                  )
                                }
                              />

                              <div
                                className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize z-[70]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "nw",
                                  )
                                }
                              />
                              <div
                                className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize z-[70]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "ne",
                                  )
                                }
                              />
                              <div
                                className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize z-[70]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "sw",
                                  )
                                }
                              />
                              <div
                                className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize z-[70]"
                                onMouseDown={(e) =>
                                  onMouseDownResize(
                                    e,
                                    block.uid,
                                    block.position,
                                    "se",
                                  )
                                }
                              />
                            </>
                          )}

                          {isActive && (
                            <div className="absolute -top-6 right-0 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shadow-sm font-bold truncate max-w-full">
                              {block.label}
                            </div>
                          )}

                          <div
                            className={`absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white p-1 rounded-full shadow-lg cursor-move transition-opacity z-[80] ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                            onMouseDown={(e) =>
                              onMouseDownDrag(e, block.uid, block.position)
                            }
                          >
                            <Move size={14} />
                          </div>

                          {isActive && (
                            <div className="absolute -top-8 left-0 flex gap-1 z-[80]">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditDialog(block);
                                }}
                                className="p-1.5 bg-white text-blue-600 hover:bg-blue-50 border border-slate-200 rounded shadow"
                              >
                                <Edit2 size={12} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveBlock(block.uid);
                                }}
                                className="p-1.5 bg-white text-red-600 hover:bg-red-50 border border-slate-200 rounded shadow"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          )}

                          <div className="w-full h-full p-1 pointer-events-none select-none">
                            <StaticBuilderRenderer
                              block={block}
                              formSettings={formSettings}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div
                  className="absolute left-[20mm] right-[20mm] flex justify-between text-[10px] text-slate-400 font-mono pointer-events-none"
                  style={{ top: `${A4_HEIGHT_PX - 40}px` }}
                >
                  <span dir="ltr">{formSettings.code || "FRM-XXX"}</span>
                  <span className="font-bold">صفحة 1 من 1</span>
                  <span>نظام الموارد البشرية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Editor Dialog (تعديل خصائص البلوك) ── */}
      {editingBlock && (
        <div className="fixed inset-0 bg-slate-900/40 z-[10000] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-[450px] shadow-2xl flex flex-col font-[Tajawal] overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Settings size={16} className="text-blue-600" /> إعدادات:{" "}
                {originalBlock?.label}
              </div>
              <button
                onClick={cancelEdit}
                className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  التسمية (تظهر للمستخدم)
                </label>
                <input
                  type="text"
                  value={editingBlock.label || ""}
                  onChange={(e) =>
                    updateEditingBlock({ label: e.target.value })
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>

              {/* 💡 إضافة زر رفع الصور للأنواع المحددة */}
              {[
                "company_logo",
                "header_image",
                "footer_image",
                "background_image",
              ].includes(editingBlock.type) && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <label className="text-xs font-bold text-blue-800 block mb-2 flex items-center gap-1">
                    <ImagePlus size={14} /> إرفاق ورفع الصورة
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadForBlock}
                    className="w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 mt-2">
                    ستكون هذه الصورة هي الافتراضية في هذا النموذج. (يمكن لاحقاً
                    تعديلها من الموظف أثناء تعبئة النموذج)
                  </p>
                </div>
              )}

              {/* 💡 تحكم سماكة الإطار المربع */}
              {editingBlock.type === "square_frame" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    سماكة خط الإطار (Px)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={editingBlock.style?.borderWidth || 2}
                    onChange={(e) =>
                      updateEditingBlock({
                        style: {
                          ...editingBlock.style,
                          borderWidth: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* 💡 تحكم شفافية الخلفية */}
              {editingBlock.type === "background_image" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    شفافية الخلفية:{" "}
                    {typeof editingBlock.defaultValue === "object"
                      ? (editingBlock.defaultValue?.opacity ?? 1)
                      : 1}
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="1"
                    step="0.05"
                    value={
                      typeof editingBlock.defaultValue === "object"
                        ? (editingBlock.defaultValue?.opacity ?? 1)
                        : 1
                    }
                    onChange={(e) => {
                      let currentVal = editingBlock.defaultValue;
                      if (typeof currentVal !== "object" || currentVal === null)
                        currentVal = { url: "" };
                      updateEditingBlock({
                        defaultValue: {
                          ...currentVal,
                          opacity: Number(e.target.value),
                        },
                      });
                    }}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                </div>
              )}

              {[
                "static_text",
                "text_area",
                "title",
                "subject",
                "text_field",
              ].includes(editingBlock.type) && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    النص / القيمة الافتراضية
                  </label>
                  <textarea
                    value={editingBlock.defaultValue || ""}
                    onChange={(e) =>
                      updateEditingBlock({ defaultValue: e.target.value })
                    }
                    className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 min-h-[80px]"
                    placeholder="اكتب النص الثابت هنا..."
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    العرض (Px)
                  </label>
                  <input
                    type="number"
                    value={Math.round(editingBlock.position.width) || ""}
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
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    الارتفاع (Px)
                  </label>
                  <input
                    type="number"
                    value={Math.round(editingBlock.position.height) || ""}
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
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  حجم الخط الأساسي (Px)
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
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  المحاذاة داخل الحاوية
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
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                onClick={cancelEdit}
                className="px-5 py-2.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-xs font-bold text-slate-700"
              >
                إلغاء التعديلات
              </button>
              <button
                onClick={() => {
                  setEditingBlock(null);
                  setOriginalBlock(null);
                }}
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
              >
                حفظ التغييرات
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modals (Watermark & Border) ── */}
      {isWmSettingsOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-[10001] backdrop-blur-sm"
          onClick={() => setIsWmSettingsOpen(false)}
        >
          <div
            className="bg-white w-[400px] rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Settings2 size={20} className="text-blue-500" /> العلامة
                المائية
              </h3>
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={formSettings.watermark?.active}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      watermark: {
                        ...formSettings.watermark,
                        active: e.target.checked,
                      },
                    })
                  }
                  className="accent-blue-600"
                />
                <span className="text-xs font-bold text-blue-800">تفعيل</span>
              </label>
            </div>
            <div
              className={`transition-opacity ${formSettings.watermark?.active ? "opacity-100" : "opacity-40 pointer-events-none"}`}
            >
              <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
                <button
                  onClick={() =>
                    setFormSettings({
                      ...formSettings,
                      watermark: { ...formSettings.watermark, isImage: false },
                    })
                  }
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md ${!formSettings.watermark?.isImage ? "bg-white shadow text-blue-600" : "text-slate-600"}`}
                >
                  نص
                </button>
                <button
                  onClick={() =>
                    setFormSettings({
                      ...formSettings,
                      watermark: { ...formSettings.watermark, isImage: true },
                    })
                  }
                  className={`flex-1 py-1.5 text-sm font-bold rounded-md ${formSettings.watermark?.isImage ? "bg-white shadow text-blue-600" : "text-slate-600"}`}
                >
                  صورة
                </button>
              </div>
              <div className="space-y-4">
                {!formSettings.watermark?.isImage ? (
                  <>
                    <div>
                      <label className="text-xs font-bold block mb-1">
                        النص:
                      </label>
                      <input
                        type="text"
                        value={formSettings.watermark?.text}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            watermark: {
                              ...formSettings.watermark,
                              text: e.target.value,
                            },
                          })
                        }
                        className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-xs font-bold block mb-1">
                          الحجم:
                        </label>
                        <input
                          type="number"
                          value={formSettings.watermark?.size}
                          onChange={(e) =>
                            setFormSettings({
                              ...formSettings,
                              watermark: {
                                ...formSettings.watermark,
                                size: Number(e.target.value),
                              },
                            })
                          }
                          className="w-full border rounded p-2 text-sm outline-none focus:border-blue-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-bold block mb-1">
                          اللون:
                        </label>
                        <input
                          type="color"
                          value={formSettings.watermark?.color}
                          onChange={(e) =>
                            setFormSettings({
                              ...formSettings,
                              watermark: {
                                ...formSettings.watermark,
                                color: e.target.value,
                              },
                            })
                          }
                          className="w-full h-[38px] border rounded p-1 cursor-pointer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">
                        زاوية الميل: {formSettings.watermark?.angle}°
                      </label>
                      <input
                        type="range"
                        min="-90"
                        max="90"
                        value={formSettings.watermark?.angle}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            watermark: {
                              ...formSettings.watermark,
                              angle: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-blue-500"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-xs font-bold block mb-1">
                        إرفاق صورة:
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            const r = new FileReader();
                            r.onload = (ev) =>
                              setFormSettings({
                                ...formSettings,
                                watermark: {
                                  ...formSettings.watermark,
                                  imgUrl: ev.target.result,
                                },
                              });
                            r.readAsDataURL(e.target.files[0]);
                          }
                        }}
                        className="w-full border rounded p-1 text-sm outline-none bg-slate-50"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold block mb-1">
                        الحجم (النسبة): {formSettings.watermark?.size}%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={formSettings.watermark?.size}
                        onChange={(e) =>
                          setFormSettings({
                            ...formSettings,
                            watermark: {
                              ...formSettings.watermark,
                              size: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-blue-500"
                        disabled={formSettings.watermark?.repeat}
                      />
                    </div>
                  </>
                )}
                <div>
                  <label className="text-xs font-bold block mb-1">
                    الشفافية: {formSettings.watermark?.opacity}
                  </label>
                  <input
                    type="range"
                    min="0.01"
                    max="1"
                    step="0.05"
                    value={formSettings.watermark?.opacity}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        watermark: {
                          ...formSettings.watermark,
                          opacity: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full accent-blue-500"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer mt-2 bg-slate-50 p-2 rounded border border-slate-200">
                  <input
                    type="checkbox"
                    checked={formSettings.watermark?.repeat}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        watermark: {
                          ...formSettings.watermark,
                          repeat: e.target.checked,
                        },
                      })
                    }
                    className="accent-blue-600"
                  />
                  <span className="text-sm font-bold">
                    تكرار النمط في كامل الورقة (Pattern)
                  </span>
                </label>
              </div>
            </div>
            <button
              onClick={() => setIsWmSettingsOpen(false)}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
            >
              تطبيق الإعدادات
            </button>
          </div>
        </div>
      )}

      {isBorderSettingsOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 flex items-center justify-center z-[10001] backdrop-blur-sm"
          onClick={() => setIsBorderSettingsOpen(false)}
        >
          <div
            className="bg-white w-[400px] rounded-2xl shadow-2xl p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Square size={20} className="text-slate-700" /> إطار الصفحة
                الخارجي
              </h3>
              <label className="flex items-center gap-2 cursor-pointer bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  checked={formSettings.borderSettings?.active}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      borderSettings: {
                        ...formSettings.borderSettings,
                        active: e.target.checked,
                      },
                    })
                  }
                  className="accent-blue-600"
                />
                <span className="text-xs font-bold text-blue-800">
                  إظهار الإطار
                </span>
              </label>
            </div>
            <div
              className={`transition-opacity space-y-5 ${formSettings.borderSettings?.active ? "opacity-100" : "opacity-40 pointer-events-none"}`}
            >
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs font-bold block mb-1">
                    سُمك الخط (Px):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formSettings.borderSettings?.width}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        borderSettings: {
                          ...formSettings.borderSettings,
                          width: Number(e.target.value),
                        },
                      })
                    }
                    className="w-full border border-slate-300 rounded p-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold block mb-1">
                    لون الخط:
                  </label>
                  <input
                    type="color"
                    value={formSettings.borderSettings?.color}
                    onChange={(e) =>
                      setFormSettings({
                        ...formSettings,
                        borderSettings: {
                          ...formSettings.borderSettings,
                          color: e.target.value,
                        },
                      })
                    }
                    className="w-full h-[38px] border border-slate-300 rounded p-1 cursor-pointer"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold block mb-1">
                  الهامش (البُعد عن حافة الورقة):{" "}
                  {formSettings.borderSettings?.margin} Px
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formSettings.borderSettings?.margin}
                  onChange={(e) =>
                    setFormSettings({
                      ...formSettings,
                      borderSettings: {
                        ...formSettings.borderSettings,
                        margin: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
            <button
              onClick={() => setIsBorderSettingsOpen(false)}
              className="w-full mt-6 bg-slate-800 text-white font-bold py-2.5 rounded-xl hover:bg-slate-900 transition-colors"
            >
              تطبيق وحفظ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
