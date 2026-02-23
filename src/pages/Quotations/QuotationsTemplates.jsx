import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Layout,
  Search,
  Plus,
  Star,
  Settings,
  Eye,
  Copy,
  Ban,
  X,
  CircleCheckBig,
  FileText,
  Save,
  Loader2,
} from "lucide-react";

// ==========================================
// الإعدادات الثابتة
// ==========================================
const SECTIONS_CONFIG = [
  { key: "cover", label: "صفحة الغلاف" },
  { key: "header", label: "ترويسة (هيدر)" },
  { key: "footer", label: "تذييل (فوتر)" },
  { key: "intro", label: "مقدمة العرض" },
  { key: "scope", label: "نطاق العمل" },
  { key: "items", label: "جدول البنود والأسعار" },
  { key: "tax", label: "الضريبة (VAT)" },
  { key: "payments", label: "جدول الدفعات" },
  { key: "terms", label: "الشروط والأحكام" },
  { key: "signature", label: "صفحة التوقيع والاعتماد" },
];

const DEFAULT_NEW_TEMPLATE = {
  id: "NEW",
  title: "نموذج جديد",
  type: "SUMMARY",
  desc: "",
  sections: {
    cover: false,
    header: true,
    footer: true,
    intro: true,
    scope: false,
    items: true,
    tax: true,
    payments: true,
    terms: true,
    signature: true,
  },
  options: {
    showClientCode: true,
    showPropertyCode: true,
    detailedItems: false,
  },
  defaultTerms: "",
};

// ==========================================
// المكون الرئيسي
// ==========================================
const QuotationsTemplates = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");

  const [editingTemplate, setEditingTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // 1. جلب النماذج
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => {
      const res = await axios.get("/quotation-templates");
      return res.data.data;
    },
  });

  // 2. الحفظ / التعديل
  const saveMutation = useMutation({
    mutationFn: async (payload) => axios.post("/quotation-templates", payload),
    onSuccess: () => {
      toast.success("تم الحفظ بنجاح!");
      queryClient.invalidateQueries(["quotation-templates"]);
      setEditingTemplate(null);
    },
    onError: () => toast.error("فشل الحفظ"),
  });

  // 3. التفعيل والتعطيل
  const toggleStatusMutation = useMutation({
    mutationFn: async (id) =>
      axios.patch(`/quotation-templates/${id}/toggle-status`),
    onSuccess: () => {
      toast.success("تم التحديث");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
  });

  // 4. تعيين كافتراضي
  const setDefaultMutation = useMutation({
    mutationFn: async (id) =>
      axios.patch(`/quotation-templates/${id}/set-default`),
    onSuccess: () => {
      toast.success("تم التعيين كافتراضي");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
  });

  // الفلترة
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.title.includes(searchTerm) || t.id.includes(searchTerm);
    const matchesType = filterType === "ALL" || t.type === filterType;
    return matchesSearch && matchesType;
  });

  const getActiveSectionsCount = (sections) =>
    Object.values(sections || {}).filter(Boolean).length;

  // ==========================================
  // Render: شاشة التعديل / الإنشاء
  // ==========================================
  const renderEditModal = () => {
    const tpl = editingTemplate;
    if (!tpl) return null;

    const toggleSection = (key) =>
      setEditingTemplate((prev) => ({
        ...prev,
        sections: { ...prev.sections, [key]: !prev.sections[key] },
      }));
    const toggleOption = (key) =>
      setEditingTemplate((prev) => ({
        ...prev,
        options: { ...prev.options, [key]: !prev.options[key] },
      }));

    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl p-6 w-full max-w-[680px] max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-600" />{" "}
              {tpl.id === "NEW"
                ? "إنشاء نموذج جديد"
                : `تعديل النموذج — ${tpl.id}`}
            </div>
            <button
              onClick={() => setEditingTemplate(null)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                اسم النموذج
              </label>
              <input
                value={tpl.title}
                onChange={(e) =>
                  setEditingTemplate({ ...tpl, title: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                النوع
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setEditingTemplate({ ...tpl, type: "SUMMARY" })
                  }
                  className={`flex-1 p-2 rounded-lg text-xs font-bold transition-colors ${tpl.type === "SUMMARY" ? "bg-blue-600 text-white border border-blue-600" : "bg-white text-slate-500 border border-slate-300"}`}
                >
                  مختصر
                </button>
                <button
                  onClick={() =>
                    setEditingTemplate({ ...tpl, type: "DETAILED" })
                  }
                  className={`flex-1 p-2 rounded-lg text-xs font-bold transition-colors ${tpl.type === "DETAILED" ? "bg-violet-600 text-white border border-violet-600" : "bg-white text-slate-500 border border-slate-300"}`}
                >
                  تفصيلي
                </button>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              الوصف
            </label>
            <textarea
              value={tpl.desc}
              onChange={(e) =>
                setEditingTemplate({ ...tpl, desc: e.target.value })
              }
              rows={2}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500 resize-y"
            />
          </div>

          <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-3">
              أقسام العرض (إظهار / إخفاء)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {SECTIONS_CONFIG.map((sec) => {
                const isActive = tpl.sections[sec.key];
                return (
                  <button
                    key={sec.key}
                    onClick={() => toggleSection(sec.key)}
                    className={`p-2 rounded-lg text-[10px] font-bold text-center border transition-colors ${isActive ? "bg-emerald-100 text-emerald-700 border-emerald-300" : "bg-white text-slate-400 border-slate-200"}`}
                  >
                    {isActive ? (
                      <CircleCheckBig className="w-3.5 h-3.5 mx-auto mb-1" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 mx-auto mb-1" />
                    )}
                    {sec.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-xs font-bold text-slate-800 mb-2">
              خيارات العرض
            </label>
            <div className="flex gap-4 flex-wrap">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={tpl.options.showClientCode}
                  onChange={() => toggleOption("showClientCode")}
                  className="w-3.5 h-3.5 text-violet-600"
                />{" "}
                إظهار كود العميل
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={tpl.options.showPropertyCode}
                  onChange={() => toggleOption("showPropertyCode")}
                  className="w-3.5 h-3.5 text-violet-600"
                />{" "}
                إظهار كود الملكية
              </label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={tpl.options.detailedItems}
                  onChange={() => toggleOption("detailedItems")}
                  className="w-3.5 h-3.5 text-violet-600"
                />{" "}
                إظهار تفاصيل البنود
              </label>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              الشروط والأحكام الافتراضية
            </label>
            <textarea
              value={tpl.defaultTerms}
              onChange={(e) =>
                setEditingTemplate({ ...tpl, defaultTerms: e.target.value })
              }
              rows={4}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500 resize-y leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setEditingTemplate(null)}
              className="px-5 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إغلاق
            </button>
            <button
              onClick={() => saveMutation.mutate(tpl)}
              disabled={saveMutation.isPending}
              className="px-6 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-violet-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}{" "}
              حفظ النموذج
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Render: شاشة المعاينة
  // ==========================================
  const renderPreviewModal = () => {
    if (!previewTemplate) return null;
    const tpl = previewTemplate;

    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl p-6 w-full max-w-[520px] max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-600" /> معاينة النموذج —{" "}
              {tpl.id}
            </div>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg p-5 bg-[#fefefe] shadow-sm text-[10px] leading-[1.6]">
            {tpl.sections.header && (
              <div className="border-b-2 border-blue-700 pb-2 mb-3 text-[9px] text-slate-500 flex justify-between">
                <span>ترويسة المكتب</span>
                <span>عرض سعر — [رقم العرض]</span>
              </div>
            )}

            {tpl.sections.intro && (
              <div className="p-2 bg-slate-50 rounded border-r-4 border-blue-300 mb-3 text-[9px] text-slate-700">
                <div className="font-bold text-blue-900 mb-1">
                  مقدمة العرض — نتشرف بتقديم عرض السعر التالي...
                </div>
                {tpl.options.showClientCode && (
                  <div className="text-slate-500">
                    كود العميل: <strong>24-XX-XXXX</strong>
                  </div>
                )}
                {tpl.options.showPropertyCode && (
                  <div className="text-slate-500">
                    كود الملكية: <strong>P-310-XXXX</strong>
                  </div>
                )}
              </div>
            )}

            {tpl.sections.items && (
              <table className="w-full mb-3 text-right">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-1">#</th>
                    <th className="p-1">البند</th>
                    <th className="p-1">الإجمالي</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="p-1">1</td>
                    <td className="p-1 font-bold">بند خدمة هندسية 1</td>
                    <td className="p-1 font-mono">X,XXX ر.س</td>
                  </tr>
                  {tpl.options.detailedItems && (
                    <tr className="border-b border-slate-100">
                      <td className="p-1">2</td>
                      <td className="p-1">
                        <div className="font-bold">بند خدمة 2</div>
                        <div className="text-[8px] text-slate-400">
                          وصف تفصيلي للخدمة يظهر هنا...
                        </div>
                      </td>
                      <td className="p-1 font-mono">X,XXX ر.س</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            {tpl.sections.tax && (
              <div className="p-2 bg-blue-50/50 rounded mb-3">
                <div className="flex justify-between mb-1">
                  <span>ضريبة 15%:</span>
                  <strong>XXX ر.س</strong>
                </div>
                <div className="flex justify-between font-bold text-blue-700 border-t border-blue-100 pt-1 mt-1">
                  <span>الإجمالي شامل:</span>
                  <span>XX,XXX ر.س</span>
                </div>
              </div>
            )}

            {tpl.sections.payments && (
              <div className="p-2 border-r-4 border-emerald-300 mb-3 bg-emerald-50/30">
                <strong>جدول الدفعات:</strong> دفعة 1 (50%) — عند التعاقد | دفعة
                2 (50%) — عند الإنجاز
              </div>
            )}

            {tpl.sections.terms && (
              <div className="mb-3 text-[8px] text-slate-500 whitespace-pre-line">
                <strong className="text-[9px] text-slate-700">
                  الشروط والأحكام:
                </strong>
                <br />
                {tpl.defaultTerms}
              </div>
            )}

            {tpl.sections.signature && (
              <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-slate-200 text-center text-slate-400">
                <div>
                  <div className="h-8 border-b border-dashed border-slate-300 mb-1 mx-4"></div>
                  توقيع العميل / الممثل
                </div>
                <div>
                  <div className="h-8 border-b border-dashed border-slate-300 mb-1 mx-4"></div>
                  توقيع المكتب / المالك
                </div>
              </div>
            )}

            {tpl.sections.footer && (
              <div className="mt-4 pt-2 border-t border-slate-100 text-center text-[7px] text-slate-400">
                تذييل — بيانات المكتب — هاتف — عنوان
              </div>
            )}
          </div>
          <div className="flex justify-center mt-5">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="px-6 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إغلاق المعاينة
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Main
  // ==========================================
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 h-full" dir="rtl">
      <div className="p-5 md:p-6 font-sans max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layout className="w-5 h-5 text-violet-600" /> نماذج عروض الأسعار
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-mono">
                815-T01
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {templates.length} نموذج مسجل (
              {templates.filter((t) => t.type === "SUMMARY").length} مختصر ·{" "}
              {templates.filter((t) => t.type === "DETAILED").length} تفصيلي)
            </div>
          </div>
          <button
            onClick={() => setEditingTemplate(DEFAULT_NEW_TEMPLATE)}
            className="px-4 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-violet-700 shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" /> إنشاء نموذج جديد
          </button>
        </div>

        <div className="flex gap-2 mb-5 items-center flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="بحث بالكود أو الاسم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2.5 pr-9 pl-3 border border-slate-300 rounded-xl text-xs outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-200"
            />
          </div>
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${filterType === "ALL" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-300"}`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterType("SUMMARY")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${filterType === "SUMMARY" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-300"}`}
          >
            مختصر
          </button>
          <button
            onClick={() => setFilterType("DETAILED")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${filterType === "DETAILED" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-300"}`}
          >
            تفصيلي
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((tpl) => {
              const activeColor = tpl.type === "SUMMARY" ? "blue" : "violet";
              const isDisabled = tpl.status === "disabled";

              return (
                <div
                  key={tpl.id}
                  className={`p-4 md:p-5 bg-white rounded-2xl border-y border-l border-r-4 shadow-sm transition-all ${isDisabled ? "border-slate-200 opacity-60" : `border-slate-200 border-r-${activeColor}-500 hover:shadow-md`}`}
                >
                  <div className="flex justify-between items-start mb-3 relative">
                    {tpl.isDefault && (
                      <div className="absolute -top-1 -right-1 flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[9px] font-bold">
                        <Star className="w-3 h-3 fill-current" /> افتراضي
                      </div>
                    )}
                    {isDisabled && (
                      <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-red-100 text-red-700 rounded text-[9px] font-bold">
                        معطّل
                      </div>
                    )}

                    <div className="flex items-center gap-2 mt-4">
                      <span className="font-mono text-xs font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                        {tpl.id}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-md text-[9px] font-bold bg-${activeColor}-50 text-${activeColor}-700`}
                      >
                        {tpl.type === "SUMMARY" ? "مختصر" : "تفصيلي"}
                      </span>
                    </div>
                  </div>

                  <div className="text-sm font-bold text-slate-800 mb-1">
                    {tpl.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mb-4 line-clamp-2">
                    {tpl.desc}
                  </div>

                  <div className="flex gap-1.5 flex-wrap mb-4">
                    {SECTIONS_CONFIG.map((sec) => {
                      const isActive = tpl.sections[sec.key];
                      return (
                        <span
                          key={sec.key}
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-50 text-slate-400 border border-slate-200"}`}
                        >
                          {sec.label}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-3 mb-3">
                    <span>
                      {getActiveSectionsCount(tpl.sections)}/10 أقسام · استُخدم{" "}
                      {tpl.uses} مرة
                    </span>
                    <span className="font-mono">{tpl.date}</span>
                  </div>

                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setEditingTemplate({ ...tpl })}
                      className={`px-3 py-1.5 bg-${activeColor}-50 text-${activeColor}-700 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-${activeColor}-100 transition-colors`}
                    >
                      <Settings className="w-3 h-3" /> تعديل
                    </button>
                    <button
                      onClick={() => setPreviewTemplate(tpl)}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                    >
                      <Eye className="w-3 h-3" /> معاينة
                    </button>
                    <button
                      onClick={() => setDefaultMutation.mutate(tpl.id)}
                      disabled={tpl.isDefault || isDisabled}
                      className="px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-yellow-100 transition-colors disabled:opacity-50"
                    >
                      <Star className="w-3 h-3" /> افتراضي
                    </button>
                    <div className="flex-1"></div>
                    <button
                      onClick={() => toggleStatusMutation.mutate(tpl.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${isDisabled ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-red-50 text-red-700 hover:bg-red-100"}`}
                    >
                      {isDisabled ? (
                        <CircleCheckBig className="w-3 h-3" />
                      ) : (
                        <Ban className="w-3 h-3" />
                      )}{" "}
                      {isDisabled ? "تفعيل" : "تعطيل"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Render Modals */}
      {renderEditModal()}
      {renderPreviewModal()}
    </div>
  );
};

export default QuotationsTemplates;
