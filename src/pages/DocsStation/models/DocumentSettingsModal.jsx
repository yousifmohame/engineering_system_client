import React, { useState, useEffect } from "react";
import api from "../../../api/axios"; // تأكد من مسار ملف الـ API
import {
  Settings,
  Save,
  X,
  Shield,
  Info,
  TriangleAlert,
  Plus,
  ChevronDown,
  List,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function DocumentSettingsModal({
  isOpen,
  onClose,
  templateId,
  onSuccess,
}) {
  // ==========================================
  // 1. إدارة الحالة (States)
  // ==========================================
  const [activeTab, setActiveTab] = useState("الإعدادات التفصيلية");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // حالة الإدخالات النصية للمصفوفات (الشروط، الملاحظات، الخ)
  const [newItemInputs, setNewItemInputs] = useState({});

  const tabs = [
    "الإعدادات التفصيلية",
    "خصائص وسرية المستند",
    "مراحل المستند (SLA)",
    "إعدادات البلوكات والعناصر",
    "قواعد تطبيق النوع/النموذج",
    "الشروط والأحكام",
  ];

  // الحالة الافتراضية الشاملة لكل حقول قاعدة البيانات
  const defaultState = {
    title: "مستند تقرير عن عميل",
    code: "",
    internalCode: "",
    dueDate: "",
    pageSize: "A4",
    orientation: "portrait",
    showPageNumber: false,
    showDate: false,
    hideTableHeader: false,
    sourceType: "system",
    category: "document",
    securityLevel: "public",
    requiresApproval: false,
    preventPrintUnapproved: false,
    maxFileSize: 10,
    allowMultiplePages: true,
    allowedSizes: ["A4", "A3"],
    allowedOrientations: ["portrait", "landscape"],
    allowedExtensions: [".pdf"],
    aiEnabled: true,
    readinessLevel: "مكتمل",
    status: "نشطة",
    slaStages: [],
    blocks: [],
    rules: [],
    obligations: [],
    notes: [],
    exceptions: [],
    // قواعد تطبيق النموذج
    ruleTransactionStatus: "غير مستخدم",
    ruleTransactionType: "غير مستخدم",
    ruleDistrict: "غير مستخدم",
    ruleSector: "غير مستخدم",
    ruleOwnerType: "غير مستخدم",
    ruleApplicantType: "غير مستخدم",
    ruleStreetWidthLogic: "غير مستخدم",
    ruleStreetWidthFrom: "",
    ruleStreetWidthTo: "",
    ruleFloorsLogic: "غير مستخدم",
    ruleFloorsFrom: "",
    ruleFloorsTo: "",
    ruleConditionLogic: "إلزامية",
  };

  const [formData, setFormData] = useState(defaultState);

  // ==========================================
  // 2. جلب البيانات من السيرفر (Backend Fetch)
  // ==========================================
  useEffect(() => {
    if (isOpen && templateId) {
      const fetchTemplate = async () => {
        setIsLoading(true);
        try {
          const res = await api.get(`/doc-templates/${templateId}`);
          setFormData({
            ...defaultState,
            ...res.data,
            dueDate: res.data.dueDate ? res.data.dueDate.split("T")[0] : "",
          });
        } catch (error) {
          console.error("Error fetching template:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTemplate();
    } else if (isOpen && !templateId) {
      setFormData(defaultState);
    }
  }, [isOpen, templateId]);

  if (!isOpen) return null;

  // ==========================================
  // 3. معالجات التغيير (Handlers)
  // ==========================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleArrayToggle = (arrayName, value) => {
    setFormData((prev) => {
      const arr = prev[arrayName] || [];
      return {
        ...prev,
        [arrayName]: arr.includes(value)
          ? arr.filter((i) => i !== value)
          : [...arr, value],
      };
    });
  };

  const handleAddStringToArray = (arrayName) => {
    const val = newItemInputs[arrayName];
    if (!val || !val.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [arrayName]: [...(prev[arrayName] || []), val.trim()],
    }));
    setNewItemInputs((prev) => ({ ...prev, [arrayName]: "" }));
  };

  const handleRemoveFromArray = (arrayName, index) => {
    setFormData((prev) => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index),
    }));
  };

  // --- إضافة مراحل SLA ---
  const addSlaStage = () => {
    setFormData((prev) => ({
      ...prev,
      slaStages: [
        ...(prev.slaStages || []),
        { name: "مرحلة جديدة", duration: 1, description: "" },
      ],
    }));
  };

  const updateSlaStage = (index, field, value) => {
    const updated = [...formData.slaStages];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, slaStages: updated }));
  };

  // --- إضافة بلوكات المستند ---
  const addBlock = () => {
    setFormData((prev) => ({
      ...prev,
      blocks: [
        ...(prev.blocks || []),
        {
          name: "بلوك جديد",
          type: "text",
          mandatory: false,
          aiSupport: true,
          repeat: false,
        },
      ],
    }));
  };

  const updateBlock = (index, field, value) => {
    const updated = [...formData.blocks];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, blocks: updated }));
  };

  const handleSave = async () => {
    if (!formData.title) return alert("يرجى إدخال اسم الوثيقة.");
    setIsSaving(true);
    try {
      if (templateId) {
        await api.put(`/doc-templates/${templateId}`, formData);
      } else {
        await api.post("/doc-templates", formData);
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      alert(
        "حدث خطأ أثناء الحفظ. " +
          (error.response?.data?.error || error.message),
      );
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================
  // 4. مكون المعاينة الحية (Live Preview)
  // ==========================================
  const renderLivePreview = () => {
    const isLandscape = formData.orientation === "landscape";
    const isA3 = formData.pageSize === "A3";
    const width = isLandscape
      ? isA3
        ? "420mm"
        : "297mm"
      : isA3
        ? "297mm"
        : "210mm";
    const height = isLandscape
      ? isA3
        ? "297mm"
        : "210mm"
      : isA3
        ? "420mm"
        : "297mm";
    const scale = isA3 ? "scale-[0.40]" : "scale-[0.50]";

    return (
      <div className="w-[380px] bg-slate-100 p-6 flex flex-col items-center overflow-y-auto border-r border-slate-200 shrink-0 hidden lg:flex">
        <h3 className="text-xs font-black text-slate-500 mb-4 w-full text-right flex justify-between items-center">
          <span>معاينة حية للمستند</span>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-mono text-[9px]">
            {formData.pageSize} {isLandscape ? "أفقي" : "رأسي"}
          </span>
        </h3>
        <div
          className={`bg-white shadow-xl text-slate-800 border border-slate-200 origin-top transition-all duration-500 ease-out flex flex-col relative ${scale}`}
          style={{ width, height, minHeight: height }}
        >
          {/* خلفية مائية وهمية للمسودة */}
          {!formData.requiresApproval && (
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none z-0">
              <span className="text-8xl font-black rotate-[-45deg]">مسودة</span>
            </div>
          )}

          <div className="relative z-10 flex flex-col h-full p-10">
            <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                  {formData.title || "عنوان المستند"}
                </h2>
                {formData.showDate && (
                  <p className="text-xs font-bold text-slate-500">
                    التاريخ: {new Date().toLocaleDateString("ar-SA")}
                  </p>
                )}
              </div>
              <div className="w-20 h-20 bg-slate-100 rounded-lg"></div>
            </div>

            <div className="flex-1 flex flex-col gap-6">
              {!formData.hideTableHeader && (
                <div className="h-12 bg-slate-100 rounded-md w-full"></div>
              )}
              <div className="space-y-4 opacity-50">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                <div className="h-4 bg-slate-200 rounded w-4/6"></div>
              </div>

              {(formData.obligations.length > 0 ||
                formData.notes.length > 0 ||
                formData.exceptions.length > 0) && (
                <div className="mt-8 border-t border-dashed border-slate-300 pt-6">
                  <h3 className="text-lg font-black mb-4 text-slate-700">
                    البنود والشروط
                  </h3>
                  <div className="space-y-3">
                    {formData.obligations.map((ob, i) => (
                      <div
                        key={`ob-${i}`}
                        className="text-sm text-slate-600 flex gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />{" "}
                        {ob}
                      </div>
                    ))}
                    {formData.notes.map((nt, i) => (
                      <div
                        key={`nt-${i}`}
                        className="text-sm text-slate-600 flex gap-2"
                      >
                        <Info className="w-5 h-5 text-blue-500 shrink-0" /> {nt}
                      </div>
                    ))}
                    {formData.exceptions.map((ex, i) => (
                      <div
                        key={`ex-${i}`}
                        className="text-sm text-slate-600 flex gap-2"
                      >
                        <TriangleAlert className="w-5 h-5 text-rose-500 shrink-0" />{" "}
                        {ex}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-xs font-bold text-slate-400">
              <p>الرمز: {formData.code || "سيتم التوليد"}</p>
              {formData.showPageNumber && <p>صفحة 1 من 1</p>}
            </div>

            {formData.requiresApproval && (
              <div className="absolute bottom-32 left-16 w-40 h-40 rounded-full border-4 border-rose-500/20 flex items-center justify-center rotate-[-15deg] opacity-60">
                <span className="text-rose-500 font-black text-3xl">
                  مُعتمد
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 5. محتويات التبويبات بالكامل
  // ==========================================

  // --- التبويب 1: الإعدادات التفصيلية ---
  const renderDetailedSettings = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar animate-in slide-in-from-right-4 duration-300">
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
          الإعدادات العامة
        </h3>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            اسم الوثيقة
          </label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors"
            placeholder="مستند تقرير عن عميل"
          />
        </div>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            رمز الوثيقة
          </label>
          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded font-mono focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors"
            placeholder="يترك فارغاً للتوليد الآلي"
          />
        </div>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            الكود الداخلي
          </label>
          <input
            name="internalCode"
            value={formData.internalCode || ""}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded font-mono focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors"
            placeholder="CLI-REP-01"
          />
        </div>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            تاريخ الاستحقاق
          </label>
          <input
            name="dueDate"
            type="date"
            value={formData.dueDate || ""}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded focus:border-indigo-500 outline-none bg-slate-50 focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
          المقاس والاتجاه والطباعة
        </h3>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            نوع المقاس
          </label>
          <select
            name="pageSize"
            value={formData.pageSize}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded focus:border-indigo-500 outline-none bg-slate-50 cursor-pointer"
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
          </select>
        </div>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            الاتجاه
          </label>
          <select
            name="orientation"
            value={formData.orientation}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded focus:border-indigo-500 outline-none bg-slate-50 cursor-pointer"
          >
            <option value="portrait">رأسي (Portrait)</option>
            <option value="landscape">أفقي (Landscape)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
          خيارات العرض
        </h3>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2">
          <label className="text-[11px] font-black text-slate-500">
            خيارات العرض
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors">
              <input
                type="checkbox"
                name="showPageNumber"
                checked={formData.showPageNumber}
                onChange={handleChange}
                className="accent-indigo-600 rounded w-4 h-4"
              />{" "}
              إظهار رقم الصفحة
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors">
              <input
                type="checkbox"
                name="showDate"
                checked={formData.showDate}
                onChange={handleChange}
                className="accent-indigo-600 rounded w-4 h-4"
              />{" "}
              إظهار التاريخ
            </label>
            <label className="flex items-center gap-2 text-[10px] font-black text-slate-700 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition-colors">
              <input
                type="checkbox"
                name="hideTableHeader"
                checked={formData.hideTableHeader}
                onChange={handleChange}
                className="accent-indigo-600 rounded w-4 h-4"
              />{" "}
              إخفاء ترويسة الجداول
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
          المرفقات
        </h3>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            إضافة مرفقات (.txt)
          </label>
          <input
            accept=".txt"
            className="text-xs font-bold file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-black file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            type="file"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
          إعدادات الذكاء الصناعي والتحقق
        </h3>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            دعم الذكاء الصناعي
          </label>
          <input
            type="checkbox"
            name="aiEnabled"
            checked={formData.aiEnabled}
            onChange={handleChange}
            className="accent-indigo-600 rounded w-4 h-4 cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            مستوى الجاهزية
          </label>
          <select
            name="readinessLevel"
            value={formData.readinessLevel}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-slate-50 cursor-pointer"
          >
            <option value="مكتمل">مكتمل</option>
            <option value="جاهز ابتدائيًا">جاهز ابتدائيًا</option>
            <option value="يحتاج تحسين">يحتاج تحسين</option>
          </select>
        </div>
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-2 border-b border-slate-50 last:border-0">
          <label className="text-[11px] font-black text-slate-500">
            حالة الوثيقة
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-slate-50 cursor-pointer"
          >
            <option value="نشطة">نشطة</option>
            <option value="قيد المراجعة">قيد المراجعة</option>
            <option value="قيد التدقيق">قيد التدقيق</option>
            <option value="مكتملة">مكتملة</option>
            <option value="مرفوضة">مرفوضة</option>
          </select>
        </div>
      </div>
    </div>
  );

  // --- التبويب 2: خصائص وسرية المستند ---
  const renderPropertiesAndSecurity = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar animate-in slide-in-from-right-4 duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تصنيف المستند الأساسي */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
            تصنيف المستند الأساسي
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[11px] font-black text-slate-500">
                نوع المصدر
              </label>
              <select
                name="sourceType"
                value={formData.sourceType}
                onChange={handleChange}
                className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg outline-none bg-slate-50 focus:border-indigo-500 cursor-pointer"
              >
                <option value="system">مستند مولّد من النظام</option>
                <option value="external">مستند خارجي</option>
              </select>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[11px] font-black text-slate-500">
                تصنيف المستند
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg outline-none bg-slate-50 focus:border-indigo-500 cursor-pointer"
              >
                <option value="template">نموذج (Template)</option>
                <option value="report">تقرير (مكتمل ومستخرج)</option>
                <option value="attachment">مرفقات</option>
                <option value="document">مستندات عامة</option>
              </select>
            </div>
          </div>
        </div>

        {/* مستوى السرية والاعتمادات */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
          <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
            مستوى السرية والاعتمادات
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-[120px_1fr] items-center gap-4">
              <label className="text-[11px] font-black text-slate-500">
                مستوى السرية
              </label>
              <select
                name="securityLevel"
                value={formData.securityLevel}
                onChange={handleChange}
                className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg outline-none bg-slate-50 focus:border-indigo-500 cursor-pointer"
              >
                <option value="public">عام (Public)</option>
                <option value="internal">داخلي (Internal)</option>
                <option value="confidential">سري (Confidential)</option>
              </select>
            </div>
            <div className="grid grid-cols-[120px_1fr] items-start gap-4">
              <label className="text-[11px] font-black text-slate-500 mt-2">
                دورة الاعتماد
              </label>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-[11px] font-black text-slate-700 cursor-pointer">
                  <input
                    name="requiresApproval"
                    checked={formData.requiresApproval}
                    onChange={handleChange}
                    className="accent-indigo-600 rounded w-4 h-4"
                    type="checkbox"
                  />
                  تفعيل دورة اعتماد للمستند
                </label>
                <label
                  className={`flex items-center gap-2 text-[11px] font-black cursor-pointer ${formData.requiresApproval ? "text-slate-700" : "text-slate-400 opacity-60"}`}
                >
                  <input
                    name="preventPrintUnapproved"
                    checked={formData.preventPrintUnapproved}
                    onChange={handleChange}
                    disabled={!formData.requiresApproval}
                    className="accent-indigo-600 rounded w-4 h-4"
                    type="checkbox"
                  />
                  منع الطباعة/الاستخراج النهائي إلا بموافقة المشرف (يسمح فقط
                  كمسودة)
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* صيغ وقيود المستند */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <h3 className="text-xs font-black text-indigo-800 mb-4 pb-2 border-b border-slate-100">
          صيغ وقيود المستند
        </h3>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-3 border-b border-slate-50">
          <label className="text-[11px] font-black text-slate-500">
            الحد الأقصى لحجم الملف (MB)
          </label>
          <input
            name="maxFileSize"
            type="number"
            value={formData.maxFileSize}
            onChange={handleChange}
            className="w-full max-w-[150px] p-2.5 text-xs font-bold border border-slate-200 rounded-lg outline-none bg-slate-50 focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-4 border-b border-slate-50">
          <label className="text-[11px] font-black text-slate-500 mt-1">
            قيود الصفحات
          </label>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-2 text-[11px] font-black text-slate-700 cursor-pointer">
              <input
                name="allowMultiplePages"
                checked={formData.allowMultiplePages}
                onChange={handleChange}
                className="accent-indigo-600 rounded w-4 h-4"
                type="checkbox"
              />{" "}
              السماح بأكثر من صفحة
            </label>
            <div className="grid grid-cols-2 gap-6 pt-3 border-t border-slate-100">
              <div>
                <span className="block text-[10px] text-slate-500 mb-2">
                  الأحجام المسموحة
                </span>
                <div className="flex flex-wrap gap-2">
                  {["A4", "A3", "A2", "A1", "A0"].map((size) => (
                    <label
                      key={size}
                      className="flex items-center gap-2 text-[11px] font-black text-slate-700 cursor-pointer"
                    >
                      <input
                        checked={formData.allowedSizes?.includes(size)}
                        onChange={() => handleArrayToggle("allowedSizes", size)}
                        className="accent-indigo-600 rounded w-4 h-4"
                        type="checkbox"
                      />{" "}
                      {size}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <span className="block text-[10px] text-slate-500 mb-2">
                  الاتجاهات المسموحة
                </span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-700 cursor-pointer">
                    <input
                      checked={formData.allowedOrientations?.includes(
                        "portrait",
                      )}
                      onChange={() =>
                        handleArrayToggle("allowedOrientations", "portrait")
                      }
                      className="accent-indigo-600 rounded w-4 h-4"
                      type="checkbox"
                    />
                    عمودي (Portrait)
                  </label>
                  <label className="flex items-center gap-2 text-[11px] font-black text-slate-700 cursor-pointer">
                    <input
                      checked={formData.allowedOrientations?.includes(
                        "landscape",
                      )}
                      onChange={() =>
                        handleArrayToggle("allowedOrientations", "landscape")
                      }
                      className="accent-indigo-600 rounded w-4 h-4"
                      type="checkbox"
                    />
                    أفقي (Landscape)
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] items-start gap-4 py-4">
          <label className="text-[11px] font-black text-slate-500 mt-2">
            صيغ الملفات المسموحة (Extensions)
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              {
                label: "أوفيس (Word, Excel, PPT)",
                ext: ".doc, .docx, .xls, .xlsx",
                id: ".docx",
              },
              { label: "ملفات PDF", ext: ".pdf", id: ".pdf" },
              {
                label: "صور (JPG, PNG, TIFF..)",
                ext: ".jpg, .jpeg, .png",
                id: ".jpg",
              },
              { label: "أوتوكاد (CAD)", ext: ".dwg, .dxf", id: ".dwg" },
              { label: "سكتش أب (SketchUp)", ext: ".skp", id: ".skp" },
              { label: "أرشيكاد/ريفيت (BIM)", ext: ".rvt, .rfa", id: ".rvt" },
              { label: "فوتوشوب ولوميون", ext: ".psd, .ai", id: ".psd" },
            ].map((f) => (
              <label
                key={f.id}
                className={`border px-3 py-2 rounded-lg flex flex-col gap-1 w-[calc(50%-0.5rem)] cursor-pointer transition-colors ${formData.allowedExtensions?.includes(f.id) ? "bg-indigo-50/50 border-indigo-500" : "bg-slate-50 border-slate-200 hover:bg-slate-100"}`}
              >
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-800">
                  <input
                    checked={formData.allowedExtensions?.includes(f.id)}
                    onChange={() =>
                      handleArrayToggle("allowedExtensions", f.id)
                    }
                    className="accent-indigo-600 rounded w-3.5 h-3.5"
                    type="checkbox"
                  />{" "}
                  {f.label}
                </div>
                <span
                  className="text-[9px] text-slate-500 mr-5 block font-mono"
                  dir="ltr"
                >
                  {f.ext}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // --- التبويب 3: مراحل المستند (SLA) ---
  const renderSLA = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
      <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-xl p-4">
        <div>
          <h3 className="text-sm font-black text-slate-800">
            مراحل دورة حياة المستند (SLA)
          </h3>
          <p className="text-[10px] text-slate-500 font-bold mt-1">
            قم بترتيب المراحل وتحديد الوقت المتوقع.
          </p>
        </div>
        <button
          onClick={addSlaStage}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black hover:bg-slate-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> إضافة مرحلة جديدة
        </button>
      </div>

      <div className="space-y-4">
        {formData.slaStages.map((stage, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-start shadow-sm group"
          >
            <div className="bg-slate-100 text-slate-500 font-bold w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-slate-200">
              {idx + 1}
            </div>
            <div className="flex-1 grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-5">
                <input
                  className="w-full text-xs font-black p-2 border border-slate-200 rounded-lg"
                  value={stage.name}
                  onChange={(e) => updateSlaStage(idx, "name", e.target.value)}
                />
              </div>
              <div className="col-span-6 md:col-span-3">
                <input
                  className="w-full text-xs font-black p-2 border border-slate-200 rounded-lg"
                  type="number"
                  value={stage.duration}
                  onChange={(e) =>
                    updateSlaStage(idx, "duration", e.target.value)
                  }
                />
              </div>
              <div className="col-span-12">
                <textarea
                  className="w-full text-xs p-2 border border-slate-200 rounded-lg min-h-[40px]"
                  value={stage.description}
                  onChange={(e) =>
                    updateSlaStage(idx, "description", e.target.value)
                  }
                  placeholder="وصف المرحلة..."
                />
              </div>
            </div>
            <button
              onClick={() => handleRemoveFromArray("slaStages", idx)}
              className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // --- التبويب 4: البلوكات والعناصر ---
  const renderBlocks = () => (
    <div className="flex-1 overflow-y-auto p-6 animate-in slide-in-from-right-4">
      <div className="flex justify-between items-center mb-5">
        <h3 className="text-sm font-black text-slate-800">
          إدارة بلوكات المستند
        </h3>
        <button
          onClick={addBlock}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-black hover:bg-indigo-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> إضافة بلوك جديد
        </button>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-xs text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="p-3">اسم البلوك</th>
              <th className="p-3">النوع</th>
              <th className="p-3 text-center">إلزامي</th>
              <th className="p-3 text-center">AI</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {formData.blocks.map((block, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3">
                  <input
                    className="font-black border border-slate-200 rounded p-1"
                    value={block.name}
                    onChange={(e) => updateBlock(idx, "name", e.target.value)}
                  />
                </td>
                <td className="p-3">
                  <select
                    value={block.type}
                    onChange={(e) => updateBlock(idx, "type", e.target.value)}
                  >
                    <option value="text">نص</option>
                    <option value="table">جدول</option>
                  </select>
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={block.mandatory}
                    onChange={(e) =>
                      updateBlock(idx, "mandatory", e.target.checked)
                    }
                  />
                </td>
                <td className="p-3 text-center">
                  <input
                    type="checkbox"
                    checked={block.aiSupport}
                    onChange={(e) =>
                      updateBlock(idx, "aiSupport", e.target.checked)
                    }
                  />
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleRemoveFromArray("blocks", idx)}
                    className="text-rose-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // --- التبويب 5: قواعد تطبيق النوع/النموذج ---
  const renderRules = () => (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar animate-in slide-in-from-right-4 duration-300">
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-black text-indigo-800 mb-5 pb-2 border-b border-slate-100">محددات الاستخدام (قواعد الإلزام والظهور)</h3>
        
        {[
          { label: 'حالة المعاملة', name: 'ruleTransactionStatus' },
          { label: 'نوع المعاملة', name: 'ruleTransactionType' },
          { label: 'الحي', name: 'ruleDistrict' },
          { label: 'القطاع', name: 'ruleSector' },
          { label: 'نوع المالك', name: 'ruleOwnerType' },
          { label: 'نوع مقدم الطلب', name: 'ruleApplicantType' }
        ].map((item, idx) => (
          <div key={idx} className="grid grid-cols-[180px_1fr] items-center gap-4 py-3 border-b border-slate-100 last:border-0">
            <label className="text-[11px] font-black text-slate-500">{item.label}</label>
            <select name={item.name} value={formData[item.name]} onChange={handleChange} className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-slate-50 cursor-pointer">
              <option value="غير مستخدم">غير مستخدم</option>
              <option value="أي قيمة">أي قيمة</option>
              <option value="قيمة واحدة">قيمة واحدة</option>
              <option value="عدة قيم">عدة قيم</option>
            </select>
          </div>
        ))}

        {/* عرض الشارع - مع ربط حقيقي */}
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-3 border-b border-slate-100">
          <label className="text-[11px] font-black text-slate-500">عرض الشارع</label>
          <div className="flex gap-2">
            <select name="ruleStreetWidthLogic" value={formData.ruleStreetWidthLogic} onChange={handleChange} className="flex-1 p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-slate-50">
              <option value="غير مستخدم">غير مستخدم</option>
              <option value="أي قيمة">أي قيمة</option>
              <option value="مدى رقمي">مدى رقمي</option>
            </select>
            <input name="ruleStreetWidthFrom" type="number" value={formData.ruleStreetWidthFrom} onChange={handleChange} placeholder="من" className="w-20 p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" />
            <input name="ruleStreetWidthTo" type="number" value={formData.ruleStreetWidthTo} onChange={handleChange} placeholder="إلى" className="w-20 p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" />
          </div>
        </div>

        {/* عدد الأدوار - مع ربط حقيقي */}
        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-3 border-b border-slate-100">
          <label className="text-[11px] font-black text-slate-500">عدد الأدوار</label>
          <div className="flex gap-2">
            <select name="ruleFloorsLogic" value={formData.ruleFloorsLogic} onChange={handleChange} className="flex-1 p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-slate-50">
              <option value="غير مستخدم">غير مستخدم</option>
              <option value="أي قيمة">أي قيمة</option>
              <option value="مدى رقمي">مدى رقمي</option>
            </select>
            <input name="ruleFloorsFrom" type="number" value={formData.ruleFloorsFrom} onChange={handleChange} placeholder="من" className="w-20 p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" />
            <input name="ruleFloorsTo" type="number" value={formData.ruleFloorsTo} onChange={handleChange} placeholder="إلى" className="w-20 p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none" />
          </div>
        </div>

        <div className="grid grid-cols-[180px_1fr] items-center gap-4 py-3 border-b border-slate-100">
          <label className="text-[11px] font-black text-slate-500">منطق الشروط</label>
          <select name="ruleConditionLogic" value={formData.ruleConditionLogic} onChange={handleChange} className="w-full p-2.5 text-xs font-bold border border-slate-200 rounded-lg focus:border-indigo-500 outline-none bg-slate-50">
            <option value="إلزامية">إلزامية</option>
            <option value="اختيارية">اختيارية</option>
            <option value="مركبة">مركبة</option>
          </select>
        </div>
      </div>
    </div>
  );

  // --- التبويب 6: الشروط والأحكام ---
  const renderTermsSection = (
    icon,
    title,
    desc,
    iconColor,
    bgColor,
    arrayName,
  ) => (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm mb-6">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg bg-${bgColor}-100 text-${iconColor}-700`}
          >
            {icon}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">{title}</h3>
            <p className="text-[10px] font-bold text-slate-500 mt-0.5">
              {desc}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            اختيار من المكتبة <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="p-6">
        {formData[arrayName]?.length > 0 ? (
          <ul className="space-y-2 mb-4">
            {formData[arrayName].map((item, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-sm hover:border-slate-300 transition-all"
              >
                {item}
                <button
                  onClick={() => handleRemoveFromArray(arrayName, idx)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50 mb-4">
            <List className="w-12 h-12 opacity-20 mb-3" />
            <p className="font-bold text-sm text-slate-600 mb-1">
              لا يوجد بنود حالياً
            </p>
            <p className="text-[10px] font-bold">
              ابدأ بإضافة بنود يدوياً أو اختر من المكتبة الجاهزة
            </p>
          </div>
        )}
        <div className="flex gap-2 mt-4 border-t border-slate-100 pt-4">
          <input
            value={newItemInputs[arrayName] || ""}
            onChange={(e) =>
              setNewItemInputs((prev) => ({
                ...prev,
                [arrayName]: e.target.value,
              }))
            }
            onKeyDown={(e) =>
              e.key === "Enter" && handleAddStringToArray(arrayName)
            }
            placeholder={`إضافة ${title} جديد...`}
            className="flex-1 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-slate-50 hover:bg-white focus:bg-white"
          />
          <button
            onClick={() => handleAddStringToArray(arrayName)}
            className={`px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-indigo-700 shadow-md hover:shadow-lg transition-all`}
          >
            إضافة بند يدوي <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderTermsAndConditions = () => (
    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar animate-in slide-in-from-right-4 duration-300">
      {renderTermsSection(
        <Shield className="w-5 h-5" />,
        "الالتزامات والمسؤوليات",
        "إدارة الالتزامات والمسؤوليات وتخصيصها للعرض",
        "blue",
        "blue",
        "obligations",
      )}
      {renderTermsSection(
        <Info className="w-5 h-5" />,
        "الملاحظات",
        "إدارة الملاحظات وتخصيصها للعرض",
        "indigo",
        "indigo",
        "notes",
      )}
      {renderTermsSection(
        <TriangleAlert className="w-5 h-5" />,
        "الاستثناءات",
        "إدارة الاستثناءات وتخصيصها للعرض",
        "rose",
        "rose",
        "exceptions",
      )}
    </div>
  );

  // ==========================================
  // الموجه (Router)
  // ==========================================
  const renderActiveContent = () => {
    if (isLoading)
      return (
        <div className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      );

    switch (activeTab) {
      case "الإعدادات التفصيلية":
        return renderDetailedSettings();
      case "خصائص وسرية المستند":
        return renderPropertiesAndSecurity();
      case "مراحل المستند (SLA)":
        return renderSLA();
      case "إعدادات البلوكات والعناصر":
        return renderBlocks();
      case "قواعد تطبيق النوع/النموذج":
        return renderRules();
      case "الشروط والأحكام":
        return renderTermsAndConditions();
      default:
        return renderDetailedSettings();
    }
  };

  // ==========================================
  // التصيير الرئيسي للمودال (Main Render)
  // ==========================================
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 lg:p-8"
      dir="rtl"
    >
      {/* حاوية المودال الأساسية */}
      <div className="bg-white rounded-[2rem] w-full max-w-[1400px] h-full max-h-[900px] flex flex-col overflow-hidden shadow-2xl border border-slate-200/50 ring-1 ring-white/20 animate-in zoom-in-95 duration-200">
        {/* الهيدر العلوي */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between shrink-0 z-20 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 border-2 border-indigo-100/50">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {templateId
                  ? `إعدادات نوع المستند: ${formData.title}`
                  : "إنشاء نوع مستند جديد"}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 uppercase">
                  {formData.code || "سيتم توليد الرمز آلياً بعد الحفظ"}
                </span>
                <span className="text-[10px] font-black text-slate-500">
                  {formData.category === "template"
                    ? "نموذج إدخال"
                    : formData.category === "report"
                      ? "تقرير عام"
                      : "مستندات عامة"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shadow-sm border border-transparent hover:border-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg hover:shadow-indigo-500/30 hover:bg-indigo-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              حفظ التغييرات
            </button>
          </div>
        </header>

        {/* جسم المودال: تابات يمين + محتوى وسط + معاينة يسار */}
        <div className="flex flex-1 overflow-hidden bg-slate-50/50 relative z-10">
          {/* 1. قائمة التبويبات (Sidebar Tabs) */}
          <div className="w-64 bg-white/80 border-l border-slate-200 flex flex-col py-4 px-3 gap-1.5 overflow-y-auto z-10 backdrop-blur-sm shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 mt-2 px-3">
              أقسام الإعدادات
            </span>
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full text-right px-4 py-3.5 text-xs font-black rounded-xl transition-all flex items-center justify-between group ${
                  activeTab === tab
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent hover:border-slate-200"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                )}
              </button>
            ))}
          </div>

          {/* 2. منطقة المحتوى الديناميكية (Middle Content) */}
          <div className="flex-1 flex flex-col overflow-hidden relative z-0">
            {renderActiveContent()}
          </div>

          {/* 3. منطقة المعاينة الحية الثابتة (Left Live Preview) */}
          {renderLivePreview()}
        </div>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
        }}
      />
    </div>
  );
}
