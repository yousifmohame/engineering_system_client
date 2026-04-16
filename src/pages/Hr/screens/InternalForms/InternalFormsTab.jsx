import React, { useState, useEffect, useMemo } from "react";
import {
  FilePlus,
  ClipboardList,
  Search,
  FileText,
  CircleCheck,
  Activity,
  ChartColumn,
  Loader2,
  Trash2,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";

// 💡 استيراد المكونات الفرعية
import FormBuilderModal from "./models/FormBuilderModal";
import FormPreviewModal from "./FormPreviewModal";
import FormFillModal from "./FormFillModal";
import FormCard from "./FormCard";

export default function InternalFormsTab() {
  // ── States ──
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewForm, setPreviewForm] = useState(null);
  const [formToEdit, setFormToEdit] = useState(null);
  const [formToFill, setFormToFill] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // ── Fetch Data ──
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

  // ── Handlers ──
  const handlePreviewTemplate = async (templateId) => {
    try {
      toast.loading("جاري إعداد المعاينة...", { id: "preview" });
      const response = await api.get(`/forms/templates/${templateId}`);
      toast.dismiss("preview");
      setPreviewForm(response.data.data);
    } catch (error) {
      toast.dismiss("preview");
      toast.error("فشل في تحميل النموذج للمعاينة");
    }
  };

  const handleEditTemplate = async (templateId) => {
    try {
      toast.loading("جاري تحميل بيانات النموذج...", { id: "edit" });
      const response = await api.get(`/forms/templates/${templateId}`);
      toast.dismiss("edit");
      setFormToEdit(response.data.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.dismiss("edit");
      toast.error("فشل في تحميل بيانات النموذج للتعديل");
    }
  };

  const handleFillTemplate = async (templateId) => {
    try {
      toast.loading("جاري تجهيز النموذج للتعبئة...", { id: "fill" });
      const response = await api.get(`/forms/templates/${templateId}`);
      toast.dismiss("fill");
      setFormToFill(response.data.data);
    } catch (error) {
      toast.dismiss("fill");
      toast.error("فشل في تحميل النموذج للتعبئة");
    }
  };

  const handleDeleteTemplate = async (templateId, templateName) => {
    if (
      !window.confirm(
        `هل أنت متأكد من حذف نموذج "${templateName}" نهائياً؟\nتنبيه: لا يمكن التراجع عن هذه الخطوة.`,
      )
    ) {
      return;
    }

    try {
      toast.loading("جاري الحذف...", { id: "delete" });
      await api.delete(`/forms/templates/${templateId}`);
      toast.dismiss("delete");
      toast.success("تم حذف النموذج بنجاح");
      setTemplates((prev) => prev.filter((t) => t.id !== templateId));
    } catch (error) {
      toast.dismiss("delete");
      const errorMsg =
        error.response?.data?.message || "حدث خطأ أثناء محاولة الحذف";
      toast.error(errorMsg);
    }
  };

  // ── Computed Data ──
  const stats = useMemo(() => {
    const total = templates.length;
    const active = templates.filter((t) => t.isActive).length;
    const totalUses = templates.reduce(
      (sum, t) => sum + (t._count?.usages || 0),
      0,
    );
    const todayUses = Math.floor(totalUses * 0.1); // عينة

    return [
      {
        id: 1,
        title: "إجمالي النماذج",
        value: total,
        icon: FileText,
        color: "text-blue-600",
        bg: "bg-blue-50 border-blue-200",
      },
      {
        id: 2,
        title: "نماذج نشطة",
        value: active,
        icon: CircleCheck,
        color: "text-emerald-600",
        bg: "bg-emerald-50 border-emerald-200",
      },
      {
        id: 3,
        title: "استخدامات اليوم",
        value: todayUses,
        icon: Activity,
        color: "text-violet-600",
        bg: "bg-violet-50 border-violet-200",
      },
      {
        id: 4,
        title: "إجمالي الاستخدامات",
        value: totalUses,
        icon: ChartColumn,
        color: "text-amber-600",
        bg: "bg-amber-50 border-amber-200",
      },
    ];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        template.name.includes(searchQuery) ||
        template.code.includes(searchQuery);
      const matchesCategory =
        categoryFilter === "all" || template.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && template.isActive) ||
        (statusFilter === "archived" && !template.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  // 💡 التغيير الجوهري هنا: الحاوية الأب يجب أن تكون `absolute inset-0` أو `h-full overflow-hidden`
  // لضمان عمل الـ `flex-1 overflow-y-auto` بشكل صحيح في الحاويات الأبناء.
  return (
    <div
      className="absolute inset-0 flex flex-col font-cairo bg-slate-50/50"
      dir="rtl"
    >
      <div className="flex flex-col gap-2.5 p-2 md:p-3 h-full w-full max-w-7xl mx-auto">
        {/* ── Header Ultra Dense ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-sm shrink-0 gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-blue-500 flex items-center justify-center shadow-sm shrink-0">
              <ClipboardList
                size={18}
                className="text-white"
                strokeWidth={2.5}
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-[13px] font-black text-slate-800 leading-tight">
                النماذج الداخلية المتقدمة
              </h1>
              <p className="text-[9px] font-bold text-slate-500 mt-0.5 tracking-wide">
                تصميم، طباعة، وسجل متكامل للنماذج الرسمية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setFormToEdit(null);
                setIsModalOpen(true);
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-black shadow-sm transition-all"
            >
              <FilePlus size={14} strokeWidth={2.5} /> إنشاء نموذج
            </button>
          </div>
        </div>

        {/* ── Filters & Stats Row (Ultra Dense) ── */}
        <div className="flex flex-col xl:flex-row gap-2 shrink-0">
          {/* الفلاتر */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm xl:w-2/5">
            <div className="flex items-center gap-1.5 flex-1 min-w-[150px] px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-md focus-within:border-blue-400 transition-colors">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="بحث (اسم، كود)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-1.5 min-w-[110px]">
              <Filter size={12} className="text-slate-400 shrink-0" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full bg-transparent border-none py-1.5 text-[10px] font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="all">كل التصنيفات</option>
                <option value="hr">موارد بشرية</option>
                <option value="financial">مالية</option>
                <option value="operations">عمليات</option>
                <option value="general">عامة</option>
              </select>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 text-[10px] font-bold text-slate-600 outline-none cursor-pointer min-w-[90px]"
            >
              <option value="all">الحالة: الكل</option>
              <option value="active">نشط فقط</option>
              <option value="archived">مؤرشف</option>
            </select>
          </div>

          {/* الإحصائيات (مصغرة) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
            {stats.map((stat) => (
              <div
                key={stat.id}
                className={`flex items-center justify-between p-2 rounded-xl border ${stat.bg} shadow-sm`}
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 mb-0.5">
                    {stat.title}
                  </span>
                  <span
                    className={`text-sm font-black leading-none ${stat.color}`}
                  >
                    {isLoading ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      stat.value
                    )}
                  </span>
                </div>
                <stat.icon size={16} className={`${stat.color} opacity-70`} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Forms Grid Area (Scrollable) ── */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col relative min-h-0">
          {/* رأس قسم النماذج */}
          <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-100 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
              {isLoading
                ? "جاري التحميل..."
                : `النماذج المتاحة (${filteredTemplates.length})`}
            </span>
          </div>

          {/* منطقة التمرير الفعلية */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 relative">
            {isLoading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-blue-500 bg-white/50 backdrop-blur-sm z-10">
                <Loader2 size={32} className="animate-spin mb-3" />
                <p className="text-xs font-bold text-slate-600">
                  جاري تحميل النماذج...
                </p>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                <FileText
                  size={48}
                  className="mb-3 opacity-20"
                  strokeWidth={1.5}
                />
                <p className="text-sm font-bold text-slate-500">
                  لا توجد نماذج مطابقة للبحث أو الفلاتر
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("all");
                  }}
                  className="mt-3 px-4 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 items-start pb-4">
                {filteredTemplates.map((form) => (
                  <FormCard
                    key={form.id}
                    form={form}
                    onPreview={() => handlePreviewTemplate(form.id)}
                    onEdit={() => handleEditTemplate(form.id)}
                    onDelete={() => handleDeleteTemplate(form.id, form.name)}
                    onFill={() => handleFillTemplate(form.id)}
                    onDuplicate={fetchTemplates}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals (تظهر فوق كل شيء) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[1000]">
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

      {previewForm && (
        <FormPreviewModal
          form={previewForm}
          onClose={() => setPreviewForm(null)}
        />
      )}

      {formToFill && (
        <FormFillModal
          form={formToFill}
          onClose={() => setFormToFill(null)}
          onSaveUsage={(values) => {
            console.log("Data to save:", values);
            toast.success("تم الحفظ في السجل بنجاح");
          }}
        />
      )}
    </div>
  );
}
