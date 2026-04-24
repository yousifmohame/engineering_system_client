import React from "react";
import { Plus, Palette, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/axios"; // استدعاء API لحذف القالب

export const TemplatesTab = ({
  sealTemplates,
  setSealTemplates,
  setIsTemplateModalOpen,
  setEditingTemplate,
}) => {
  
  // دالة الحذف الفعلية من السيرفر
  const handleDelete = async (templateId) => {
    if (confirm("هل أنت متأكد من حذف هذا القالب نهائياً؟")) {
      try {
        // افترض وجود مسار DELETE /api/documentation/templates/:id
        await api.delete(`/documentation/templates/${templateId}`);
        setSealTemplates(sealTemplates.filter((t) => t.id !== templateId));
        toast.success("تم حذف القالب بنجاح");
      } catch (error) {
        toast.error("حدث خطأ أثناء حذف القالب");
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-slate-900">
            قوالب الأختام الرقمية
          </h3>
          <p className="text-xs text-slate-500 font-bold">
            إدارة وتخصيص قوالب الأختام المؤمنة المربوطة بقاعدة البيانات
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTemplate({
              name: "",
              stampImage: "https://picsum.photos/seed/stamp/200/200",
              serialPrefix: "SEC-",
              backgroundText: "وثيقة رسمية",
              backgroundColor: "#eff6ff",
              backgroundOpacity: 0.6,
              serialPosition: "inside",
              showTimestamp: true,
              securityHash: true,
              verificationCode: true,
            });
            setIsTemplateModalOpen(true);
          }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md"
        >
          <Plus className="w-4 h-4" /> إضافة قالب جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sealTemplates && sealTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Palette className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-sm font-black text-slate-800">
                  {template.name}
                </span>
              </div>
              {template.isDefault && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> افتراضي
                </span>
              )}
            </div>

            <div className="p-8 bg-slate-50 flex items-center justify-center relative overflow-hidden h-48">
              <div
                className="w-32 h-32 border-2 border-blue-600 rounded-2xl p-2 flex flex-col items-center justify-center shadow-xl rotate-[-5deg]"
                style={{ backgroundColor: template.backgroundColor + "CC" || "#eff6ffCC" }}
              >
                <div className="text-[7px] font-black text-blue-800 mb-1 text-center">
                  {template.backgroundText || "توثيق معتمد"}
                </div>
                <img
                  loading="lazy"
                  src={template.stampImage}
                  alt="Stamp"
                  className="w-10 h-10 object-contain mix-blend-multiply"
                />
                <div className="text-[6px] font-mono text-slate-600 mt-2 font-black">
                  {template.serialPrefix}00000000
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4 text-[10px]">
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">
                    بادئة السريال
                  </span>
                  <div className="text-slate-700 font-black">
                    {template.serialPrefix}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-bold">موقع السريال</span>
                  <div className="text-slate-700 font-black">
                    {template.serialPosition === "inside"
                      ? "داخل"
                      : template.serialPosition === "bottom"
                        ? "أسفل"
                        : "أعلى"}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsTemplateModalOpen(true);
                  }}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black transition-colors"
                >
                  تعديل القالب
                </button>
                {!template.isDefault && (
                  <button
                    onClick={async () => {
                      // تحديث وهمي محلي (يُفضل إرسال طلب POST لجعل القالب افتراضي في السيرفر)
                      setSealTemplates(
                        sealTemplates.map((t) => ({
                          ...t,
                          isDefault: t.id === template.id,
                        })),
                      );
                      toast.success("تم تعيين القالب كافتراضي");
                    }}
                    className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black transition-colors"
                  >
                    تعيين كافتراضي
                  </button>
                )}
                <button
                  onClick={() => {
                    if (template.isDefault) {
                      toast.error("لا يمكن حذف القالب الافتراضي للشركة");
                      return;
                    }
                    handleDelete(template.id);
                  }}
                  className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};