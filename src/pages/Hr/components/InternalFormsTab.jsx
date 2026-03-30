import React, { useState, useEffect, useMemo } from "react";
import {
  FilePlus, ClipboardList, Search, FileText, CircleCheck, Activity, ChartColumn,
  Lock, Eye, Pen, Copy, Download, Calendar, Users, Loader2, Printer, X, ZoomIn, 
  ZoomOut, Grid3x3, CalendarClock, User, Stamp
} from "lucide-react";
import { toast } from "sonner";

import api from "../../../api/axios"; // تأكد من مسار الاستيراد لملف الاتصال بالباك إند
import FormBuilderModal from "./models/FormBuilderModal"; 

// ==========================================
// 💡 محرك رسم البلوكات للمعاينة الحقيقية
// ==========================================
const PreviewBlockRenderer = ({ block, formSettings }) => {
  const getAlignStyles = (align) => {
    if (align === "center") return { textAlign: "center", justifyContent: "center", alignItems: "center" };
    if (align === "left") return { textAlign: "left", justifyContent: "flex-start", alignItems: "flex-start", flexDirection: "row-reverse" };
    return { textAlign: "right", justifyContent: "flex-start", alignItems: "flex-start" };
  };

  const alignStyles = getAlignStyles(block.style?.alignment);
  const widthStyle = block.position?.width ? `${block.position.width}mm` : "100%";
  const heightStyle = block.position?.height ? `${block.position.height}mm` : "auto";

  switch (block.type) {
    case "title":
      return <h2 style={alignStyles} className={`text-xl font-bold mb-4 w-full ${formSettings.colorMode === "color" ? "text-blue-900" : "text-black"}`}>{formSettings.name || "عنوان النموذج"}</h2>;
    case "version":
      return <div style={alignStyles} className="text-[10px] text-slate-500 font-mono mb-2 w-full">الإصدار: {formSettings.version || "1.0"}</div>;
    case "subject":
      return <div style={alignStyles} className="text-[11px] font-bold mb-2 flex w-full gap-2"><span>{block.label}:</span><span className="border-b border-black flex-1 border-dashed"></span></div>;
    case "reference_number":
      return <div style={alignStyles} className="text-[10px] text-slate-500 font-mono mb-2 w-full">{block.label}: {formSettings.code || "FRM-XXX"}-{new Date().getFullYear()}-0001</div>;
    case "date_gregorian":
    case "date_hijri":
    case "date_editable":
      return (
        <div style={{ ...alignStyles, width: widthStyle }} className="mb-3 flex items-center gap-2 text-[11px]">
          <span className="font-bold">{block.label}:</span>
          <div className="border border-slate-300 bg-slate-50 rounded px-3 py-1 text-slate-500 flex items-center gap-2 min-w-[100px]">
            {block.defaultValue || "__ / __ / ____"} <CalendarClock size={12} />
          </div>
        </div>
      );
    case "time":
      return (
        <div style={{ ...alignStyles, width: widthStyle }} className="mb-3 flex items-center gap-2 text-[11px]">
          <span className="font-bold">{block.label}:</span>
          <span className="font-mono bg-slate-50 border border-slate-200 px-2 py-0.5 rounded" dir="ltr">10:30 AM</span>
        </div>
      );
    case "text_field":
      return (
        <div style={{ ...alignStyles, width: widthStyle }} className="mb-3 flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{block.label}</label>
          <div className="border-b border-slate-300 flex-1 h-4"></div>
        </div>
      );
    case "text_area":
      return (
        <div style={{ ...alignStyles, width: widthStyle }} className="mb-3 flex flex-col">
          <label className="text-[11px] font-bold text-slate-700 mb-1">{block.label}</label>
          <div className="border border-slate-300 rounded bg-slate-50 w-full p-2 text-[10px] text-slate-500 overflow-hidden" style={{ height: heightStyle }}>
            {block.defaultValue || "مساحة للكتابة..."}
          </div>
        </div>
      );
    case "employee_info":
      return (
        <div style={{ width: widthStyle }} className="mb-4 border border-indigo-200 bg-indigo-50/30 rounded-lg p-3">
          <div className="text-[11px] font-bold text-indigo-800 mb-2 flex items-center gap-1.5"><User size={14} /> {block.label}</div>
          <div className="grid grid-cols-2 gap-2 text-[10px]">
            <div className="bg-white p-1.5 border border-indigo-100 rounded">الاسم: ----------------</div>
            <div className="bg-white p-1.5 border border-indigo-100 rounded">الرقم الوظيفي: ---------</div>
          </div>
        </div>
      );
    case "table":
      return (
        <div style={{ width: widthStyle }} className="mb-4 border border-slate-300 rounded overflow-hidden">
          <table className="w-full text-center text-[10px] bg-white">
            <thead className="bg-slate-100 border-b border-slate-300">
              <tr><th className="p-1.5">العمود 1</th><th className="p-1.5">العمود 2</th><th className="p-1.5">العمود 3</th></tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200"><td className="p-1.5">—</td><td className="p-1.5">—</td><td className="p-1.5">—</td></tr>
              <tr><td className="p-1.5">—</td><td className="p-1.5">—</td><td className="p-1.5">—</td></tr>
            </tbody>
          </table>
        </div>
      );
    case "checkbox":
      return (
        <div style={{ ...alignStyles, width: widthStyle }} className="mb-2 flex items-center gap-2">
          <div className="w-3.5 h-3.5 border-2 border-slate-400 rounded-sm"></div>
          <span className="text-[11px] font-bold text-slate-700">{block.label}</span>
        </div>
      );
    case "signature":
      return (
        <div style={{ width: widthStyle }} className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}>
          <div className="text-[10px] font-bold mb-1" style={{ textAlign: block.style?.alignment }}>{block.label}:</div>
          <div style={{ height: heightStyle }} className="w-full border-2 border-slate-300 rounded bg-slate-50"></div>
        </div>
      );
    case "office_signature":
      return (
        <div style={{ width: widthStyle }} className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}>
          <div className="text-[10px] font-bold mb-1 text-cyan-700" style={{ textAlign: block.style?.alignment }}>{block.label}:</div>
          <div style={{ height: heightStyle }} className="w-full border-2 border-cyan-600 rounded bg-cyan-50 flex items-center justify-center text-cyan-600 text-[10px] overflow-hidden">
            {block.defaultValue ? <img src={block.defaultValue} alt="Signature" className="max-w-full max-h-full" /> : "توقيع رسمي"}
          </div>
        </div>
      );
    case "office_stamp":
      return (
        <div style={{ width: widthStyle, height: heightStyle }} className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}>
          <div className="text-[10px] font-bold mb-1 text-rose-700" style={{ textAlign: block.style?.alignment }}>{block.label}:</div>
          <div className="w-full h-full border-2 border-dashed border-rose-600 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 overflow-hidden aspect-square">
            {block.defaultValue ? <img src={block.defaultValue} alt="Stamp" className="w-full h-full rounded-full object-cover" /> : <Stamp size={24} />}
          </div>
        </div>
      );
    case "fingerprint":
      return (
        <div style={{ width: widthStyle }} className={`mb-4 flex flex-col ${block.style?.alignment === "left" ? "ml-auto" : block.style?.alignment === "center" ? "mx-auto" : "mr-auto"}`}>
          <div className="text-[10px] font-bold mb-1" style={{ textAlign: block.style?.alignment }}>{block.label}:</div>
          <div style={{ height: heightStyle }} className="w-full border-2 border-slate-300 rounded bg-slate-50 aspect-square"></div>
        </div>
      );
    case "separator":
      return <hr className="my-4 border-t-2 border-slate-300 w-full" />;
    case "spacer":
      return <div style={{ height: heightStyle, width: "100%" }}></div>;
    case "watermark":
      return <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-6xl font-black text-slate-400/10 -rotate-45 overflow-hidden z-0">{block.defaultValue || "WATERMARK"}</div>;
    case "static_text":
      return <div style={{ ...alignStyles, width: widthStyle }} className="text-[11px] leading-relaxed mb-3 w-full whitespace-pre-wrap">{block.defaultValue || block.label}</div>;
    default:
      return null; // سيتم تجاهل البلوكات المخفية (مثل صور الخلفية) في هذا القسم ويتم رسمها فوق
  }
};

// ==========================================
// 💡 مكون نافذة المعاينة الحقيقية
// ==========================================
function FormPreviewModal({ form, onClose }) {
  const [zoomLevel, setZoomLevel] = useState(100);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 50));

  const pageSettings = form?.pageSettings || { size: 'A4', orientation: 'portrait' };
  const colorMode = form?.colorMode === 'color' ? '🎨 ملون' : '⚫ أبيض وأسود';
  const fontFamily = form?.fontFamily || 'Tajawal';

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-xl w-full max-w-[1200px] h-[90vh] flex flex-col shadow-2xl overflow-hidden font-[Tajawal]">
        
        {/* ── Header ── */}
        <div className="px-6 py-4 border-b-2 border-slate-200 flex items-center justify-between bg-white shrink-0 z-10">
          <div>
            <div className="text-[15px] font-bold text-slate-900">معاينة النموذج: {form?.name || 'بدون اسم'}</div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">{form?.code || 'FRM-XXX'} • الإصدار {form?.version || '1.0'}</div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 ml-3 bg-slate-50 border border-slate-200 rounded-lg p-1">
              <button onClick={handleZoomOut} className="p-1 hover:bg-white rounded text-slate-600 transition-colors"><ZoomOut size={16} /></button>
              <span className="text-[11px] font-bold font-mono text-slate-700 min-w-[40px] text-center">{zoomLevel}%</span>
              <button onClick={handleZoomIn} className="p-1 hover:bg-white rounded text-slate-600 transition-colors"><ZoomIn size={16} /></button>
            </div>

            <select className="px-3 py-2 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 bg-white outline-none cursor-pointer">
              <option value="pdf">PDF</option>
              <option value="docx">Word</option>
              <option value="image">صورة</option>
            </select>
            <select className="px-3 py-2 border border-slate-300 rounded-lg text-[11px] font-bold text-slate-700 bg-white outline-none cursor-pointer">
              <option value="blank">نموذج فارغ</option>
              <option value="filled">معبأ ببيانات تجريبية</option>
            </select>

            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-500 text-white font-bold text-[12px] shadow-sm hover:brightness-110 transition-all">
              <Download size={16} /> تصدير
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-800 text-white font-bold text-[12px] shadow-sm hover:bg-blue-900 transition-colors">
              <Printer size={16} /> طباعة
            </button>
            
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            
            <button onClick={onClose} className="p-2 rounded-lg border border-slate-300 bg-white text-slate-500 hover:bg-slate-100 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Canvas Area ── */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-400 to-slate-500 flex items-start justify-center py-10 px-5 custom-scrollbar">
          <div 
            className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.4)] relative overflow-hidden transition-transform duration-200 origin-top flex flex-col"
            style={{ 
              width: '210mm', 
              minHeight: pageSettings.orientation === 'portrait' ? '297mm' : '210mm',
              transform: `scale(${zoomLevel / 100})`,
              padding: `${pageSettings.margins?.top || 20}mm ${pageSettings.margins?.right || 20}mm ${pageSettings.margins?.bottom || 20}mm ${pageSettings.margins?.left || 20}mm`,
              fontFamily: fontFamily
            }}
          >
            {/* Background Image */}
            {form?.bgImage && (
              <div className="absolute inset-0 bg-cover bg-center opacity-5 z-0" style={{ backgroundImage: `url(${form.bgImage})` }} />
            )}

            {/* Header Image */}
            {form?.headerImage && (
              <div className="absolute top-0 left-0 right-0 bg-cover bg-center z-[1]" style={{ height: `${pageSettings.header_height}mm`, backgroundImage: `url(${form.headerImage})` }} />
            )}

            <div className="flex-1 w-full relative z-10" style={{ paddingTop: form?.headerImage ? `${pageSettings.header_height}mm` : 0, paddingBottom: form?.footerImage ? `${pageSettings.footer_height}mm` : 0 }}>
               {(!form.blocks || form.blocks.length === 0) ? (
                 <div className="flex flex-col items-center justify-center text-slate-500 opacity-60 h-full mt-20">
                    <Grid3x3 size={48} className="mb-3 text-slate-300" strokeWidth={1.5} />
                    <div className="text-[14px] font-bold mb-1">نموذج فارغ</div>
                    <div className="text-[11px]">لم يتم إضافة بلوكات لهذا النموذج</div>
                 </div>
               ) : (
                 <div className="flex flex-col gap-2">
                    {form.blocks.map(block => (
                      <div key={block.id || block.uid}>
                        <PreviewBlockRenderer block={block} formSettings={form} />
                      </div>
                    ))}
                 </div>
               )}
            </div>

            {/* Footer Image */}
            {form?.footerImage && (
              <div className="absolute bottom-0 left-0 right-0 bg-cover bg-center z-[1]" style={{ height: `${pageSettings.footer_height}mm`, backgroundImage: `url(${form.footerImage})` }} />
            )}

            <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] border-t border-slate-200 pt-2 text-center text-[8px] text-slate-400 font-mono flex justify-between z-10">
              <span dir="ltr">Form: {form?.code || 'FRM-XXX'}</span>
              <span>نظام الموارد البشرية المتقدم</span>
              <span dir="ltr">Ver: {form?.version || '1.0'}</span>
            </div>
          </div>
        </div>

        {/* ── Footer Stats ── */}
        <div className="px-6 py-3 border-t border-slate-300 bg-slate-50 flex items-center justify-between text-[10.5px] text-slate-600 shrink-0 z-10">
          <div>استخدامات النموذج: <strong className="text-slate-900">{form?._count?.usages || 0}</strong> مرة</div>
          <div className="flex items-center gap-3">
            <span>حجم الورقة: <strong className="text-slate-900">{pageSettings.size}</strong></span>
            <span>•</span>
            <span>الاتجاه: <strong className="text-slate-900">{pageSettings.orientation === 'portrait' ? 'عمودي' : 'أفقي'}</strong></span>
            <span>•</span>
            <span>الألوان: <strong className="text-slate-900">{colorMode}</strong></span>
          </div>
          <div>الخط: <strong className="text-slate-900 font-mono">{fontFamily}</strong></div>
        </div>

      </div>
    </div>
  );
}

// ==========================================
// 💡 المكون الرئيسي للشاشة (Internal Forms Tab)
// ==========================================
export default function InternalFormsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState(null); 
  const [formToEdit, setFormToEdit] = useState(null); 
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/forms/templates");
      setTemplates(response.data.data || []);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("حدث خطأ أثناء جلب النماذج");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // 💡 الدالة التي تعالج مشكلة فتح نافذة المعاينة بشكل كامل
  const handlePreviewTemplate = async (templateId) => {
    try {
      toast.loading("جاري إعداد المعاينة...");
      // جلب النموذج كاملًا مع البلوكات من السيرفر
      const response = await api.get(`/forms/templates/${templateId}`);
      toast.dismiss();
      setPreviewForm(response.data.data); // فتح المودل وتمرير البيانات الكاملة
    } catch (error) {
      toast.dismiss();
      toast.error("فشل في تحميل النموذج للمعاينة");
    }
  };

  const handleEditTemplate = async (templateId) => {
    try {
      toast.loading("جاري تحميل بيانات النموذج...");
      const response = await api.get(`/forms/templates/${templateId}`); 
      toast.dismiss();
      setFormToEdit(response.data.data); 
      setIsModalOpen(true); 
    } catch (error) {
      toast.dismiss();
      toast.error("فشل في تحميل بيانات النموذج للتعديل");
    }
  };

  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.isActive).length;
    const totalUses = templates.reduce((sum, t) => sum + (t._count?.usages || 0), 0);
    const todayUses = Math.floor(totalUses * 0.1);

    return [
      { id: 1, title: "إجمالي النماذج", value: total, icon: FileText, color: "text-blue-500", bg: "bg-blue-50" },
      { id: 2, title: "نماذج نشطة", value: active, icon: CircleCheck, color: "text-green-600", bg: "bg-green-50" },
      { id: 3, title: "استخدامات اليوم", value: todayUses, icon: Activity, color: "text-violet-600", bg: "bg-violet-50" },
      { id: 4, title: "إجمالي الاستخدامات", value: totalUses, icon: ChartColumn, color: "text-amber-600", bg: "bg-amber-50" },
    ];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch = template.name.includes(searchQuery) || template.code.includes(searchQuery);
      const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || (statusFilter === "active" && template.isActive) || (statusFilter === "archived" && !template.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "hr": return "👥";
      case "financial": return "💰";
      case "operations": return "⚙️";
      default: return "📄";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col gap-3 h-full font-[Tajawal] relative min-h-0" dir="rtl">
      {/* 1. Header */}
      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-lg shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center shadow-[0_4px_12px_rgba(30,64,175,0.2)]">
            <FilePlus size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">📋 النماذج الداخلية</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{templates.length} نموذج متاح • نظام متقدم لإدارة النماذج</div>
          </div>
        </div>
        
        <button 
          onClick={() => { setFormToEdit(null); setIsModalOpen(true); }} 
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-lg text-[13px] font-bold shadow-[0_4px_12px_rgba(5,150,105,0.25)] hover:shadow-md hover:brightness-110 transition-all"
        >
          <FilePlus size={18} strokeWidth={2.5} />
          <span>+ إنشاء نموذج جديد</span>
        </button>
      </div>

      {/* 2. Banner */}
      <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-xl flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-[0_4px_12px_rgba(59,130,246,0.3)] shrink-0">
          <ClipboardList size={26} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-blue-800 mb-0.5">📋 نظام النماذج الداخلية المتقدم</div>
          <div className="text-[11px] text-blue-800 leading-relaxed">صمم واطبع النماذج الرسمية مع 24 نوع بلوك ديناميكي • إعدادات متقدمة للجداول والصلاحيات • سجل استخدام كامل • سريلة تلقائية</div>
        </div>
      </div>

      {/* 3. Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white border border-slate-300 rounded-lg shrink-0 shadow-sm">
        <div className="flex items-center gap-1.5 flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <Search size={14} className="text-slate-500" />
          <input type="text" placeholder="بحث باسم أو كود النموذج..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-none outline-none bg-transparent w-full text-[11px] text-slate-900" />
        </div>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-300 rounded-md text-[11px] text-slate-600 bg-white outline-none cursor-pointer">
          <option value="all">كل التصنيفات</option>
          <option value="hr">👥 موارد بشرية</option>
          <option value="financial">💰 مالية</option>
          <option value="operations">⚙️ عمليات</option>
          <option value="general">📄 عامة</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2.5 py-1.5 border border-slate-300 rounded-md text-[11px] text-slate-600 bg-white outline-none cursor-pointer">
          <option value="all">كل الحالات</option>
          <option value="active">نشط فقط</option>
          <option value="archived">مؤرشف</option>
        </select>
      </div>

      {/* 4. Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {stats.map((stat) => (
          <div key={stat.id} className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center gap-2.5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}><stat.icon size={18} className={stat.color} /></div>
            <div className="flex-1">
              <div className={`text-lg font-bold leading-tight ${stat.color}`}>
                {isLoading ? <Loader2 size={16} className="animate-spin inline" /> : stat.value}
              </div>
              <div className="text-[10px] text-slate-500">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* 5. Forms Grid */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-6 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-2" />
            <p className="text-xs font-bold">جاري تحميل النماذج...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-white border border-dashed border-slate-300 rounded-lg">
            <FileText size={40} className="mb-2 opacity-50" />
            <p className="text-sm font-bold">لا توجد نماذج مطابقة</p>
            <p className="text-xs">جرب تغيير كلمات البحث أو أضف نموذجاً جديداً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
            {filteredTemplates.map((form) => (
              <div key={form.id} className="bg-white border border-slate-300 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-blue-300 flex flex-col group">
                
                <div className="p-3 border-b border-slate-200 flex items-start justify-between bg-slate-50/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-base leading-none">{getCategoryIcon(form.category)}</span>
                      <div className="text-[11px] font-bold text-slate-900 truncate">{form.name}</div>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono">{form.code} • v{form.version}</div>
                  </div>
                  <div className={`px-1.5 py-0.5 rounded flex items-center justify-center text-[9px] font-bold ${form.isActive ? "bg-green-50 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                    {form.isActive ? "نشط" : "مؤرشف"}
                  </div>
                </div>

                <div className="p-3 flex-1 flex flex-col">
                  <div className="text-[10px] text-slate-500 mb-3 h-8 line-clamp-2 leading-relaxed">{form.description || "لا يوجد وصف لهذا النموذج."}</div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-1.5 bg-slate-50 rounded text-center border border-slate-100">
                      <div className="text-xs font-bold text-blue-800">{form._count?.usages || 0}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">استخدام</div>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded text-center border border-slate-100">
                      <div className="text-xs font-bold text-slate-900">{form.pageSettings?.size || "A4"}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">الحجم</div>
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded text-center border border-slate-100">
                      <div className="text-[10px] font-bold text-slate-900 leading-[14px]">{form.colorMode === "color" ? "🎨" : "⚫"}</div>
                      <div className="text-[8px] text-slate-500 mt-0.5">{form.colorMode === "color" ? "ألوان" : "أبيض وأسود"}</div>
                    </div>
                  </div>

                  <div className={`flex items-center gap-1 mb-3 px-1.5 py-1 rounded text-[9px] font-bold w-fit ${!form.isPublic ? "bg-amber-50 text-amber-600" : "bg-green-50 text-green-600"}`}>
                    {!form.isPublic ? <Lock size={10} /> : <Users size={10} />}
                    <span>{!form.isPublic ? "صلاحيات مخصصة" : "متاح للجميع"}</span>
                  </div>

                  <div className="flex items-center gap-1 mt-auto">
                    {/* 💡 ربط زر المعاينة بالدالة الجديدة لضمان جلب البلوكات */}
                    <button onClick={() => handlePreviewTemplate(form.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-50 text-blue-800 rounded hover:bg-blue-100 transition-colors text-[10px] font-bold">
                      <Eye size={12} /> <span>معاينة النموذج</span>
                    </button>
                    <button onClick={() => handleEditTemplate(form.id)} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[10px] font-bold">
                      <Pen size={12} /> <span>تعديل القالب</span>
                    </button>
                    <button title="نسخ النموذج" className="p-1.5 bg-green-50 text-green-600 border border-green-200 rounded hover:bg-green-100 transition-colors flex shrink-0">
                      <Copy size={12} />
                    </button>
                  </div>
                </div>

                <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1 text-[9px] text-slate-500">
                  <Calendar size={10} />
                  <span>آخر تحديث: {formatDate(form.updatedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* نافذة إنشاء/تعديل نموذج جديد */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100]">
          <FormBuilderModal
            initialData={formToEdit}
            onClose={() => {
              setIsModalOpen(false);
              setFormToEdit(null);
            }}
            onSaveSuccess={() => {
              setIsModalOpen(false);
              setFormToEdit(null);
              fetchTemplates(); 
            }}
          />
        </div>
      )}

      {/* نافذة المعاينة التابعة لكل كارت */}
      {previewForm && (
        <FormPreviewModal 
          form={previewForm} 
          onClose={() => setPreviewForm(null)} 
        />
      )}

    </div>
  );
}