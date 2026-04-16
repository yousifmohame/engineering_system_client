import React, { useState } from "react";
import {
  Lock,
  Users,
  Eye,
  Copy,
  Calendar,
  Trash2,
  PenLine,
  Settings,
  Sparkles,
  X,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios"; // تأكد من مسار الـ API الخاص بك

export default function FormCard({
  form,
  onPreview,
  onEdit,
  onDelete,
  onFill,
  onDuplicate // 👈 تُستخدم هنا فقط لتحديث القائمة بعد نجاح الحفظ
}) {
  // حالات نافذة النسخ
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [newName, setNewName] = useState(`${form.name} (نسخة)`);
  const [newCode, setNewCode] = useState("");
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getCategoryIcon = (category) => {
    switch (category) {
      case "hr":
        return "👥";
      case "financial":
        return "💰";
      case "operations":
        return "⚙️";
      default:
        return "📄";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // 💡 دالة توليد الكود بالذكاء الاصطناعي مع ضمان عدم التكرار
  const handleGenerateAICode = async () => {
    if (!newName.trim()) return toast.error("يرجى كتابة اسم النموذج أولاً لتوليد الكود");
    
    setIsGeneratingCode(true);
    try {
      const res = await api.post("/forms/generate-code", {
        formName: newName,
        category: form.category,
      });
      
      // إضافة 4 أحرف/أرقام عشوائية لضمان تفرد الكود تماماً في قاعدة البيانات
      const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
      const generatedUniqueCode = `${res.data.data.code}-${uniqueSuffix}`;
      
      setNewCode(generatedUniqueCode);
      toast.success("تم توليد كود فريد بنجاح!");
    } catch (error) {
      toast.error("حدث خطأ أثناء توليد الكود، حاول يدوياً.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // 💡 دالة الحفظ المباشر في قاعدة البيانات
  const handleConfirmCopy = async () => {
    if (!newName.trim() || !newCode.trim()) {
      return toast.error("يرجى إدخال اسم النموذج والكود الخاص به.");
    }

    setIsSubmitting(true);
    try {
      // 1. جلب بيانات النموذج الأصلي بالكامل (لضمان وجود جميع البلوكات والإعدادات)
      const response = await api.get(`/forms/templates/${form.id}`);
      const originalForm = response.data?.data || response.data;

      // 2. إعداد الكائن الجديد للنموذج المنسوخ (مع إزالة المعرفات القديمة)
      const duplicatedFormPayload = {
        ...originalForm,
        name: newName,
        code: newCode,
        id: undefined,
        _id: undefined,
        createdAt: undefined,
        updatedAt: undefined,
        blocks: originalForm.blocks?.map(block => ({
          ...block,
          id: undefined,
          _id: undefined,
          templateId: undefined
        }))
      };

      // 3. الإرسال لقاعدة البيانات لحفظه كنموذج جديد
      await api.post("/forms/templates", duplicatedFormPayload);

      toast.success("تم نسخ النموذج وحفظه في النظام بنجاح!");
      setIsCopyModalOpen(false);

      // 4. تحديث القائمة في المكون الأب لإظهار النموذج الجديد
      if (onDuplicate) {
        await onDuplicate();
      }
    } catch (error) {
      console.error("Error duplicating form:", error);
      const errorMsg = error.response?.data?.message || "";
      
      // التقاط خطأ قاعدة البيانات إذا كان الكود مكرراً
      if (error.response?.status === 409 || errorMsg.toLowerCase().includes("unique") || errorMsg.toLowerCase().includes("code")) {
        toast.error("هذا الكود مستخدم بالفعل لنموذج آخر. يرجى إدخال كود مختلف.");
      } else {
        toast.error("حدث خطأ أثناء الحفظ في قاعدة البيانات.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-slate-300 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-blue-400 flex flex-col group h-full">
        {/* Card Header */}
        <div className="p-3 border-b border-slate-200 flex items-start justify-between bg-slate-50/50 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base leading-none">
                {getCategoryIcon(form.category)}
              </span>
              <div className="text-[12px] font-bold text-slate-900 truncate">
                {form.name}
              </div>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {form.code} • v{form.version}
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded border flex items-center justify-center text-[9px] font-bold ${form.isActive ? "bg-green-50 border-green-200 text-green-600" : "bg-slate-100 border-slate-200 text-slate-500"}`}
          >
            {form.isActive ? "نشط" : "مؤرشف"}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="text-[11px] text-slate-500 mb-3 h-8 line-clamp-2 leading-relaxed">
            {form.description || "لا يوجد وصف مخصص لهذا النموذج."}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 mb-3 shrink-0">
            <div className="p-1.5 bg-slate-50 rounded-lg text-center border border-slate-200">
              <div className="text-[13px] font-black text-blue-700">
                {form._count?.usages || 0}
              </div>
              <div className="text-[9px] font-bold text-slate-500 mt-0.5">
                استخدام
              </div>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg text-center border border-slate-200">
              <div className="text-[13px] font-black text-slate-800">
                {form.pageSettings?.size || "A4"}
              </div>
              <div className="text-[9px] font-bold text-slate-500 mt-0.5">
                الحجم
              </div>
            </div>
            <div className="p-1.5 bg-slate-50 rounded-lg text-center border border-slate-200">
              <div className="text-[13px] font-black text-slate-800 leading-[18px]">
                {form.colorMode === "color" ? "🎨" : "⚫"}
              </div>
              <div className="text-[9px] font-bold text-slate-500 mt-0.5">
                {form.colorMode === "color" ? "ألوان" : "أبيض وأسود"}
              </div>
            </div>
          </div>

          {/* Permissions Badge */}
          <div
            className={`flex items-center gap-1.5 mb-4 px-2 py-1 rounded border text-[10px] font-bold w-fit ${!form.isPublic ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-green-50 border-green-200 text-green-700"}`}
          >
            {!form.isPublic ? <Lock size={12} /> : <Users size={12} />}
            <span>{!form.isPublic ? "صلاحيات مخصصة" : "متاح للجميع"}</span>
          </div>

          {/* أزرار التحكم (Action Buttons) */}
          <div className="flex flex-col gap-1.5 mt-auto">
            {/* الزر الرئيسي: التعبئة */}
            <button
              onClick={onFill}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-[11px] font-bold shadow-sm"
            >
              <PenLine size={14} /> <span>تعبئة وإصدار النموذج</span>
            </button>

            {/* الأزرار الفرعية (الإدارية) */}
            <div className="flex items-center gap-1">
              <button
                onClick={onPreview}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[10px] font-bold"
              >
                <Eye size={12} /> <span>معاينة</span>
              </button>
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-slate-50 text-slate-700 border border-slate-200 rounded hover:bg-slate-100 transition-colors text-[10px] font-bold"
              >
                <Settings size={12} /> <span>تعديل</span>
              </button>
              <button
                onClick={() => {
                  setNewName(`${form.name} (نسخة)`);
                  setNewCode("");
                  setIsCopyModalOpen(true);
                }}
                title="نسخ النموذج"
                className="p-1.5 bg-slate-50 text-slate-600 border border-slate-200 rounded hover:bg-slate-100 transition-colors flex shrink-0"
              >
                <Copy size={12} />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 bg-red-50 text-red-600 border border-red-100 rounded hover:bg-red-100 transition-colors flex shrink-0"
                title="حذف النموذج"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-3 py-2 border-t border-slate-200 bg-slate-50 flex items-center gap-1.5 text-[9px] font-bold text-slate-500 shrink-0">
          <Calendar size={12} />
          <span>آخر تحديث: {formatDate(form.updatedAt)}</span>
        </div>
      </div>

      {/* 💡 نافذة نسخ النموذج (Copy Modal) */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm flex flex-col font-[Tajawal] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="font-bold text-slate-800 flex items-center gap-2 text-sm">
                <Copy size={18} className="text-blue-600" /> نسخ النموذج
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  اسم النموذج الجديد
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors"
                  placeholder="أدخل اسم النموذج..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  كود النموذج (معرّف فريد)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition-colors font-mono uppercase text-left"
                    placeholder="مثال: HR-VAC-02"
                    dir="ltr"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleGenerateAICode}
                    disabled={isGeneratingCode || isSubmitting}
                    title="توليد كود تلقائي عبر الذكاء الاصطناعي"
                    className="px-3 py-2 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center justify-center shrink-0"
                  >
                    {isGeneratingCode ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmCopy}
                disabled={isSubmitting || !newName.trim() || !newCode.trim()}
                className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> جاري النسخ والحفظ...
                  </>
                ) : (
                  <>
                    <Copy size={14} /> تأكيد النسخ
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}