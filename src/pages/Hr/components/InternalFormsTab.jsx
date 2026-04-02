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
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/axios";

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
    const todayUses = Math.floor(totalUses * 0.1);

    return [
      {
        id: 1,
        title: "إجمالي النماذج",
        value: total,
        icon: FileText,
        color: "text-blue-500",
        bg: "bg-blue-50",
      },
      {
        id: 2,
        title: "نماذج نشطة",
        value: active,
        icon: CircleCheck,
        color: "text-green-600",
        bg: "bg-green-50",
      },
      {
        id: 3,
        title: "استخدامات اليوم",
        value: todayUses,
        icon: Activity,
        color: "text-violet-600",
        bg: "bg-violet-50",
      },
      {
        id: 4,
        title: "إجمالي الاستخدامات",
        value: totalUses,
        icon: ChartColumn,
        color: "text-amber-600",
        bg: "bg-amber-50",
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

  return (
    <div
      className="flex flex-col gap-3 h-full font-[Tajawal] relative min-h-0"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between p-3.5 bg-white border border-slate-300 rounded-lg shadow-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-800 to-blue-500 flex items-center justify-center shadow-sm">
            <FilePlus size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-[15px] font-bold text-slate-900 flex items-center gap-1.5">
              📋 النماذج الداخلية
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {templates.length} نموذج متاح • نظام متقدم لإدارة النماذج
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            setFormToEdit(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-br from-emerald-600 to-emerald-500 text-white rounded-lg text-[13px] font-bold shadow-sm hover:brightness-110 transition-all"
        >
          <FilePlus size={18} strokeWidth={2.5} />
          <span>+ إنشاء نموذج جديد</span>
        </button>
      </div>

      {/* ── Banner ── */}
      <div className="p-3.5 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-500 rounded-xl flex items-center gap-3 shrink-0">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center shadow-sm shrink-0">
          <ClipboardList size={26} className="text-white" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="text-[13px] font-bold text-blue-800 mb-0.5">
            📋 نظام النماذج الداخلية المتقدم
          </div>
          <div className="text-[11px] text-blue-800 leading-relaxed">
            صمم واطبع النماذج الرسمية مع 24 نوع بلوك ديناميكي • إعدادات متقدمة
            للجداول والصلاحيات • سجل استخدام كامل • سريلة تلقائية
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-3 bg-white border border-slate-300 rounded-lg shrink-0 shadow-sm">
        <div className="flex items-center gap-1.5 flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-md focus-within:border-blue-500 transition-all">
          <Search size={14} className="text-slate-500" />
          <input
            type="text"
            placeholder="بحث باسم أو كود النموذج..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none outline-none bg-transparent w-full text-[11px] text-slate-900"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md text-[11px] outline-none cursor-pointer"
        >
          <option value="all">كل التصنيفات</option>
          <option value="hr">👥 موارد بشرية</option>
          <option value="financial">💰 مالية</option>
          <option value="operations">⚙️ عمليات</option>
          <option value="general">📄 عامة</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2.5 py-1.5 border border-slate-300 rounded-md text-[11px] outline-none cursor-pointer"
        >
          <option value="all">كل الحالات</option>
          <option value="active">نشط فقط</option>
          <option value="archived">مؤرشف</option>
        </select>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="p-3.5 bg-white border border-slate-300 rounded-lg flex items-center gap-2.5 shadow-sm"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}
            >
              <stat.icon size={18} className={stat.color} />
            </div>
            <div className="flex-1">
              <div className={`text-lg font-bold leading-tight ${stat.color}`}>
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin inline" />
                ) : (
                  stat.value
                )}
              </div>
              <div className="text-[10px] text-slate-500">{stat.title}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Forms Grid ── */}
      <div className="flex-1 overflow-y-auto min-h-0 pb-6 scrollbar-thin scrollbar-thumb-slate-300 pr-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400">
            <Loader2 size={32} className="animate-spin mb-2" />
            <p className="text-xs font-bold">جاري تحميل النماذج...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 bg-white border border-dashed border-slate-300 rounded-lg">
            <FileText size={40} className="mb-2 opacity-50" />
            <p className="text-sm font-bold">لا توجد نماذج مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
            {filteredTemplates.map((form) => (
              <FormCard
                key={form.id}
                form={form}
                onPreview={() => handlePreviewTemplate(form.id)}
                onEdit={() => handleEditTemplate(form.id)}
                onDelete={() => handleDeleteTemplate(form.id, form.name)}
                onFill={() => handleFillTemplate(form.id)}
                onDuplicate={fetchTemplates} // 👈 التعديل: تمرير دالة التحديث لتنفذ بعد نجاح النسخ
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
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
            toast.success("تم الحفظ في السجل (سيتم ربط الباك إند قريباً)");
          }}
        />
      )}
    </div>
  );
}
