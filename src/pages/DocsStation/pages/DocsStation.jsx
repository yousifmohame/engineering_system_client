import React, { useState, useEffect, useMemo } from "react";
import api from "../../../api/axios";
import {
  FileText,
  Search,
  Settings,
  Hash,
  Funnel,
  PenLine,
  Printer,
  X,
  Plus,
  Loader2,
  Trash2,
  FolderOpen,
  Download,
  Eye,
  Grid3X3,
  List,
  ChevronLeft,
  Star,
  Clock,
  User,
} from "lucide-react";

// استيراد مودال الإعدادات الذي قمنا بإنشائه مسبقاً
import DocumentSettingsModal from "../models/DocumentSettingsModal";

// بيانات وهمية لمحاكاة سجل المستندات المولدة (Generated Docs Log)
const mockGeneratedDocs = [
  {
    id: 1,
    serial: "CLI-REP-001-GEN-2026-05-20-901",
    type: "مستند تقرير عن عميل",
    transaction: "-",
    status: "مكتمل",
    statusColor: "emerald",
    user: "المستخدم الحالي",
    date: "2026-05-20 16:15",
  },
  {
    id: 2,
    serial: "CLI-REP-001-GEN-2026-05-20-254",
    type: "مستند تقرير عن عميل",
    transaction: "-",
    status: "مسودة",
    statusColor: "amber",
    user: "المستخدم الحالي",
    date: "2026-05-20 16:15",
  },
  {
    id: 3,
    serial: "DOC-TRX5001-2026-05-01-001",
    type: "التقرير الفني الموحد",
    transaction: "TRX-5001",
    status: "مكتمل",
    statusColor: "emerald",
    user: "م. خالد",
    date: "2026-05-01 10:30",
  },
];

// فئات المستندات للتصنيف
const DOCUMENT_CATEGORIES = [
  { id: "all", name: "جميع القوالب", icon: FolderOpen, color: "slate" },
  { id: "contracts", name: "العقود", icon: FileText, color: "blue" },
  { id: "reports", name: "التقارير", icon: FileText, color: "green" },
  { id: "certificates", name: "الشهادات", icon: FileText, color: "purple" },
  { id: "letters", name: "الخطابات", icon: FileText, color: "orange" },
  { id: "forms", name: "النماذج", icon: FileText, color: "pink" },
];

export default function DocumentCenterScreen() {
  // 1. حالات التنقل والبحث
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog' | 'log'
  const [catalogSearch, setCatalogSearch] = useState("");
  const [logSearch, setLogSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'

  // 2. حالات البيانات (Data States)
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  // 3. حالات المودال (الإضافة / التعديل)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState("");

  // للمعاينة الحية في الشاشة الرئيسية
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // حالة القائمة المنسدلة للإجراءات
  const [activeDropdown, setActiveDropdown] = useState(null);

  // ==========================================
  // دوال الاتصال بالخادم (API Calls)
  // ==========================================

  // جلب القوالب
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/doc-templates");
      setTemplates(res.data);
      if (res.data.length > 0 && !previewTemplate) {
        setPreviewTemplate(res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // حذف قالب
  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("هل أنت متأكد من حذف هذا القالب؟")) return;
    try {
      await api.delete(`/doc-templates/${id}`);
      fetchTemplates(); // تحديث القائمة فوراً
      if (previewTemplate?.id === id) setPreviewTemplate(null);
    } catch (error) {
      alert("خطأ أثناء الحذف");
    }
  };

  // فتح مودال الإعدادات (للإضافة أو التعديل)
  const openSettingsModal = (e, template = null) => {
    if (e) e.stopPropagation();
    setSelectedTemplateId(template?.id || null);
    setSelectedTemplateTitle(template?.title || "مستند جديد");
    setIsModalOpen(true);
  };

  // تبديل المفضلة
  const toggleFavorite = (e, templateId) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(templateId)
        ? prev.filter((id) => id !== templateId)
        : [...prev, templateId],
    );
  };

  // تصفية القوالب حسب الفئة والبحث
  const filteredTemplates = useMemo(() => {
    return templates.filter((doc) => {
      const matchesSearch =
        doc.title?.includes(catalogSearch) || doc.code?.includes(catalogSearch);
      const matchesCategory =
        selectedCategory === "all" || doc.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [templates, catalogSearch, selectedCategory]);

  // ==========================================
  // مكون: بطاقة القالب (Template Card)
  // ==========================================
  const TemplateCard = ({ doc, isCompact = false }) => {
    const isFav = favorites.includes(doc.id);
    const isActive = previewTemplate?.id === doc.id;

    return (
      <div
        onClick={() => {
          setPreviewTemplate(doc);
          setIsPreviewOpen(true);
        }}
        className={`group relative bg-white rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden ${
          isActive
            ? "border-indigo-500 shadow-lg shadow-indigo-100 ring-2 ring-indigo-100"
            : "border-slate-200 hover:border-indigo-300 hover:shadow-md"
        } ${isCompact ? "p-3" : "p-5"}`}
      >
        {/* شريط الحالة العلوي */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* زر المفضلة */}
        <button
          onClick={(e) => toggleFavorite(e, doc.id)}
          className={`absolute top-3 left-3 p-1.5 rounded-full transition-all z-10 ${
            isFav
              ? "bg-amber-50 text-amber-500"
              : "bg-white/80 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-amber-500"
          }`}
        >
          <Star className={`w-4 h-4 ${isFav ? "fill-current" : ""}`} />
        </button>

        {/* قائمة الإجراءات */}
        <div className="absolute top-3 right-3 flex items-center gap-1">
          <div
            className={`flex items-center gap-1 transition-all ${isCompact ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
          >
            <button
              onClick={(e) => openSettingsModal(e, doc)}
              className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
              title="إعدادات"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleDeleteTemplate(e, doc.id)}
              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* أيقونة المستند */}
        <div
          className={`mb-4 flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 group-hover:from-indigo-100 group-hover:to-purple-100 transition-colors ${isCompact ? "w-10 h-10 mb-2" : ""}`}
        >
          <FileText className="w-7 h-7 text-indigo-600" />
        </div>

        {/* معلومات القالب */}
        <div className="space-y-2">
          <h4
            className={`font-black text-slate-800 group-hover:text-indigo-700 transition-colors line-clamp-2 ${isCompact ? "text-xs" : "text-sm"}`}
          >
            {doc.title}
          </h4>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
              {doc.code || "---"}
            </span>
            {doc.category && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                {doc.category}
              </span>
            )}
          </div>

          {!isCompact && (
            <div className="pt-3 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {doc.updatedAt
                  ? new Date(doc.updatedAt).toLocaleDateString("ar-SA")
                  : "-"}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {doc.createdBy || "النظام"}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ==========================================
  // مكون: شاشة عرض القوالب/الكتالوج (Catalog View)
  // ==========================================
  const renderCatalogView = () => {
    return (
      <div className="h-full flex overflow-hidden bg-slate-50">
        {/* Sidebar - قائمة الفئات */}
        <div className="w-64 bg-white border-l border-slate-200 flex flex-col shrink-0 z-10">
          {/* هيدر القائمة الجانبية */}
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-xs font-black text-slate-700 mb-4 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-indigo-500" />
              تصنيفات المستندات
            </h3>

            {/* أزرار الفئات */}
            <div className="space-y-1.5">
              {DOCUMENT_CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                    />
                    {cat.name}
                    {isActive && (
                      <ChevronLeft className="w-3 h-3 mr-auto text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* إحصائيات سريعة */}
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/50">
            <div className="bg-white rounded-xl p-3 border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-500">
                  إجمالي القوالب
                </span>
                <Star className="w-3 h-3 text-amber-500" />
              </div>
              <div className="text-lg font-black text-slate-800">
                {templates.length}
              </div>
              <div className="text-[9px] text-slate-400 mt-1">
                {favorites.length} في المفضلة
              </div>
            </div>
          </div>
        </div>

        {/* منطقة المحتوى الرئيسية */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* شريط الأدوات العلوي */}
          <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
            {/* البحث والفلاتر */}
            <div className="flex items-center gap-3 flex-1">
              <div className="relative w-80">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  placeholder="ابحث باسم القالب أو الرمز..."
                  className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  type="text"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>

              <div className="h-8 w-px bg-slate-200 mx-2" />

              {/* أزرار عرض الشبكة/القائمة */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* زر إضافة جديد */}
            <button
              onClick={(e) => openSettingsModal(e)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              قالب جديد
            </button>
          </div>

          {/* شبكة القوالب */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                <span className="text-xs font-bold">جاري تحميل القوالب...</span>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-sm font-black text-slate-600 mb-2">
                  لا توجد قوالب مطابقة
                </h3>
                <p className="text-xs text-slate-400 max-w-xs text-center">
                  {catalogSearch || selectedCategory !== "all"
                    ? "حاول تغيير معايير البحث أو الفئة"
                    : "ابدأ بإضافة أول قالب للمستندات"}
                </p>
                {!catalogSearch && selectedCategory === "all" && (
                  <button
                    onClick={(e) => openSettingsModal(e)}
                    className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    إضافة قالب جديد
                  </button>
                )}
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredTemplates.map((doc) => (
                      <TemplateCard key={doc.id} doc={doc} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredTemplates.map((doc) => (
                      <TemplateCard key={doc.id} doc={doc} isCompact />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ----------------------------------------------------
  // مكون: شاشة سجل المستندات (Log View)
  // ----------------------------------------------------
  const renderLogView = () => {
    return (
      <div className="h-full flex flex-col bg-white animate-in fade-in">
        <div className="p-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              <input
                placeholder="بحث برقم المرجع..."
                className="w-64 pl-2 pr-8 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-black focus:border-indigo-500 outline-none"
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>
            <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100">
              <Funnel className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-black hover:bg-indigo-100 transition-colors">
              تصدير السجل المكثف
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-right border-collapse text-[11px]">
            <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
              <tr className="text-slate-600 font-extrabold uppercase tracking-wide">
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 w-8 text-center text-slate-400">
                  <Hash className="w-3 h-3 mx-auto" />
                </th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 whitespace-nowrap">
                  الرقم المرجعي (Serial)
                </th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50">
                  نوع المستند
                </th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">
                  الحالة
                </th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">
                  التاريخ
                </th>
                <th className="px-3 py-2 border-b border-slate-200 text-center w-32">
                  إجراءات
                </th>
              </tr>
            </thead>
            <tbody className="font-bold text-slate-700">
              {mockGeneratedDocs
                .filter(
                  (doc) =>
                    doc.serial.includes(logSearch) ||
                    doc.type.includes(logSearch),
                )
                .map((doc) => (
                  <tr
                    key={doc.id}
                    className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors group"
                  >
                    <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-400">
                      {doc.id}
                    </td>
                    <td className="px-3 py-2 border-l border-slate-100 font-mono text-indigo-700">
                      {doc.serial}
                    </td>
                    <td className="px-3 py-2 border-l border-slate-100">
                      {doc.type}
                    </td>
                    <td className="px-3 py-2 border-l border-slate-100 text-center">
                      <span
                        className={`px-2 py-0.5 rounded uppercase text-[9px] bg-${doc.statusColor}-50 text-${doc.statusColor}-700 border border-${doc.statusColor}-100`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-400 font-mono">
                      {doc.date}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          title="استكمال/تعديل"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        >
                          <PenLine className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="معاينة وطباعة"
                          className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden"
      dir="rtl"
    >
      {/* Header */}
      <div className="h-14 bg-white border-b border-indigo-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">
              مركز المستندات والقوالب
            </h1>
          </div>
        </div>

        {/* أزرار التبديل */}
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "catalog"
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 border border-transparent"
            }`}
          >
            أنواع القوالب (Templates)
          </button>
          <button
            onClick={() => setActiveTab("log")}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === "log"
                ? "bg-white text-indigo-700 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700 border border-transparent"
            }`}
          >
            سجل المستندات المولدة
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === "catalog" ? renderCatalogView() : renderLogView()}
      </div>

      {/* مودال الإعدادات (إنشاء / تعديل) */}
      {isModalOpen && (
        <DocumentSettingsModal
          isOpen={isModalOpen}
          templateId={selectedTemplateId}
          documentTitle={selectedTemplateTitle}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTemplates} // تحديث القائمة بعد الحفظ
        />
      )}

      {/* ========================================= */}
      {/* Preview Modal */}
      {/* ========================================= */}
      {isPreviewOpen && previewTemplate && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#020617]/70 backdrop-blur-md p-6 animate-in fade-in duration-200">
          {/* النافذة */}
          <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-[30px] overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
            {/* Glow */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-white/90 backdrop-blur-xl z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <FileText className="w-5 h-5" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-sm font-black text-slate-800 truncate">
                    {previewTemplate.title}
                  </h2>

                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                      {previewTemplate.code || "---"}
                    </span>

                    {previewTemplate.category && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                        {previewTemplate.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => openSettingsModal(e, previewTemplate)}
                  className="h-10 px-4 rounded-xl bg-indigo-600 text-white text-xs font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  تعديل القالب
                </button>

                <button className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-black hover:bg-slate-50 transition-all">
                  إنشاء مستند
                </button>

                <button
                  onClick={() => setIsPreviewOpen(false)}
                  className="w-10 h-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="h-[calc(100%-64px)] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-100 custom-scrollbar">
              <div className="max-w-4xl mx-auto p-10">
                {/* الورقة */}
                <div className="bg-white min-h-[1000px] rounded-[24px] border border-slate-200 shadow-[0_20px_60px_rgba(0,0,0,0.08)] overflow-hidden">
                  {/* شريط علوي */}
                  <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

                  {/* محتوى المعاينة */}
                  <div className="p-12">
                    {/* رأس المستند */}
                    <div className="flex items-start justify-between border-b border-slate-200 pb-8 mb-8">
                      <div>
                        <h1 className="text-3xl font-black text-slate-800 mb-3">
                          {previewTemplate.title}
                        </h1>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-mono">
                            {previewTemplate.code}
                          </span>

                          <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                            {previewTemplate.category || "عام"}
                          </span>
                        </div>
                      </div>

                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl">
                        <FileText className="w-10 h-10" />
                      </div>
                    </div>

                    {/* بيانات */}
                    <div className="grid grid-cols-2 gap-5 mb-10">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-[11px] text-slate-500 font-bold mb-2">
                          مستوى الأمان
                        </div>

                        <div className="text-sm font-black text-slate-800">
                          {previewTemplate.securityLevel || "عام"}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="text-[11px] text-slate-500 font-bold mb-2">
                          حجم الصفحة
                        </div>

                        <div className="text-sm font-black text-slate-800">
                          {previewTemplate.pageSize || "A4"}
                        </div>
                      </div>
                    </div>

                    {/* محتوى وهمي */}
                    <div className="space-y-5 text-slate-600 leading-8 text-sm">
                      <div className="h-4 rounded bg-slate-100 w-full" />
                      <div className="h-4 rounded bg-slate-100 w-[90%]" />
                      <div className="h-4 rounded bg-slate-100 w-[95%]" />
                      <div className="h-4 rounded bg-slate-100 w-[70%]" />

                      <div className="pt-6" />

                      <div className="h-4 rounded bg-slate-100 w-full" />
                      <div className="h-4 rounded bg-slate-100 w-[85%]" />
                      <div className="h-4 rounded bg-slate-100 w-[92%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}
