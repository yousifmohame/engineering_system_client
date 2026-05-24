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

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


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
      <div className="bg-white/95 border border-[#d8b46a]/25 rounded-lg overflow-hidden transition-all hover:shadow-[0_8px_18px_rgba(18,63,89,0.05)] hover:border-[#d8b46a]/35 flex flex-col group h-full">
        {/* Card Header */}
        <div className="p-3 border-b border-[#e8ddc8] flex items-start justify-between bg-[#fbf8f1]/50 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-base leading-none">
                {getCategoryIcon(form.category)}
              </span>
              <div className="text-[12px] font-bold text-[#123f59] truncate">
                {form.name}
              </div>
            </div>
            <div className="text-[10px] text-[#94a3b8] font-mono">
              {form.code} • v{form.version}
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded border flex items-center justify-center text-[9px] font-bold ${form.isActive ? "bg-green-50 border-green-200 text-green-600" : "bg-[#fbf8f1] border-[#e8ddc8] text-[#94a3b8]"}`}
          >
            {form.isActive ? "نشط" : "مؤرشف"}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-3 flex-1 flex flex-col">
          <div className="text-[11px] text-[#94a3b8] mb-3 h-8 line-clamp-2 leading-relaxed">
            {form.description || "لا يوجد وصف مخصص لهذا النموذج."}
          </div>

          {/* Stats Row */}
          <div className="grid min-w-0 grid-cols-3 gap-2 mb-3 shrink-0">
            <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-[#fbf8f1] rounded-lg text-center border border-[#e8ddc8]">
              <div className="text-[13px] font-black text-[#15536f]">
                {form._count?.usages || 0}
              </div>
              <div className="text-[9px] font-bold text-[#94a3b8] mt-0.5">
                استخدام
              </div>
            </div>
            <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-[#fbf8f1] rounded-lg text-center border border-[#e8ddc8]">
              <div className="text-[13px] font-black text-[#123f59]">
                {form.pageSettings?.size || "A4"}
              </div>
              <div className="text-[9px] font-bold text-[#94a3b8] mt-0.5">
                الحجم
              </div>
            </div>
            <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-[#fbf8f1] rounded-lg text-center border border-[#e8ddc8]">
              <div className="text-[13px] font-black text-[#123f59] leading-[18px]">
                {form.colorMode === "color" ? "🎨" : "⚫"}
              </div>
              <div className="text-[9px] font-bold text-[#94a3b8] mt-0.5">
                {form.colorMode === "color" ? "ألوان" : "أبيض وأسود"}
              </div>
            </div>
          </div>

          {/* Permissions Badge */}
          <div
            className={`flex items-center gap-1.5 mb-4 px-2 py-1 rounded border text-[10px] font-bold w-fit ${!form.isPublic ? "bg-[#fff8e7] border-[#e2bf74]/45 text-[#a87819]" : "bg-green-50 border-green-200 text-green-700"}`}
          >
            {!form.isPublic ? <Lock size={12} /> : <Users size={12} />}
            <span>{!form.isPublic ? "صلاحيات مخصصة" : "متاح للجميع"}</span>
          </div>

          {/* أزرار التحكم (Action Buttons) */}
          <div className="flex flex-col gap-1.5 mt-auto">
            {/* الزر الرئيسي: التعبئة */}
            <button
              onClick={onFill}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-[#0e7490] text-white rounded-md hover:bg-[#0e7490] transition-colors text-[11px] font-bold shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
            >
              <PenLine size={14} /> <span>تعبئة وإصدار النموذج</span>
            </button>

            {/* الأزرار الفرعية (الإدارية) */}
            <div className="flex flex-wrap items-center gap-1">
              <button
                onClick={onPreview}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#fbf8f1] text-[#475569] border border-[#e8ddc8] rounded hover:bg-[#fbf8f1] transition-colors text-[10px] font-bold"
              >
                <Eye size={12} /> <span>معاينة</span>
              </button>
              <button
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-[#fbf8f1] text-[#475569] border border-[#e8ddc8] rounded hover:bg-[#fbf8f1] transition-colors text-[10px] font-bold"
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
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-[#e8ddc8] bg-[#fbf8f1] px-2 text-[9px] font-black text-[#64748b] transition hover:bg-white"
              >
                <IconWithText icon={Copy} text="نسخ" iconClassName="h-3 w-3" />
              </button>
              <button
                onClick={onDelete}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2 text-[9px] font-black text-red-600 transition hover:bg-red-100"
                title="حذف النموذج"
              >
                <IconWithText icon={Trash2} text="حذف" iconClassName="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-3 py-2 border-t border-[#e8ddc8] bg-[#fbf8f1] flex items-center gap-1.5 text-[9px] font-bold text-[#94a3b8] shrink-0">
          <Calendar size={12} />
          <span>آخر تحديث: {formatDate(form.updatedAt)}</span>
        </div>
      </div>

      {/* 💡 نافذة نسخ النموذج (Copy Modal) */}
      {isCopyModalOpen && (
        <div className="fixed inset-0 z-[100] bg-[#06111d]/50 backdrop-blur-sm flex items-center justify-center p-4" dir="rtl">
          <div className="bg-white/95 rounded-xl shadow-[0_10px_24px_rgba(18,63,89,0.08)] w-full max-w-sm flex flex-col font-[Tajawal] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-3 py-4 border-b border-[#e8ddc8] flex items-center justify-between bg-[#fbf8f1]">
              <div className="font-bold text-[#123f59] flex items-center gap-2 text-sm">
                <Copy size={18} className="text-[#0e7490]" /> نسخ النموذج
              </div>
              <button
                onClick={() => setIsCopyModalOpen(false)}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-[#e8ddc8] bg-white px-2 text-[9px] font-black text-[#64748b] transition hover:bg-red-50 hover:text-red-600"
                disabled={isSubmitting}
              >
                <IconWithText icon={X} text="إغلاق" iconClassName="h-3 w-3" />
              </button>
            </div>

            <div className="p-3 flex flex-col gap-2.5">
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1.5">
                  اسم النموذج الجديد
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 border border-[#d8b46a]/25 rounded-lg text-sm outline-none focus:border-[#0e7490] transition-colors"
                  placeholder="أدخل اسم النموذج..."
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1.5">
                  كود النموذج (معرّف فريد)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-[#d8b46a]/25 rounded-lg text-sm outline-none focus:border-[#0e7490] transition-colors font-mono uppercase text-left"
                    placeholder="مثال: HR-VAC-02"
                    dir="ltr"
                    disabled={isSubmitting}
                  />
                  <button
                    onClick={handleGenerateAICode}
                    disabled={isGeneratingCode || isSubmitting}
                    title="توليد كود تلقائي عبر الذكاء الاصطناعي"
                    className="inline-flex h-9 shrink-0 items-center justify-center gap-1 rounded-lg border border-[#d8b46a]/35 bg-[#eef7f6] px-2 text-[9px] font-black text-[#0e7490] transition hover:bg-white disabled:opacity-50"
                  >
                    {isGeneratingCode ? (
                      <IconWithText icon={Loader2} text="توليد" iconClassName="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <IconWithText icon={Sparkles} text="توليد" iconClassName="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="px-3 py-4 border-t border-[#e8ddc8] bg-[#fbf8f1] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsCopyModalOpen(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-bold text-[#64748b] bg-white/95 border border-[#d8b46a]/25 hover:bg-[#fbf8f1] transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmCopy}
                disabled={isSubmitting || !newName.trim() || !newCode.trim()}
                className="px-3 py-2 rounded-lg text-xs font-bold text-white bg-[#0e7490] hover:bg-[#0e7490] transition-colors flex items-center gap-2"
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