import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../../../api/axios"; // ⚠️ تأكد من صحة مسار ملف الـ API
import { Settings, Clock, BrainCircuit, CircleCheckBig, Loader2 } from "lucide-react";

export default function PoliciesTab() {
  const queryClient = useQueryClient();

  // 💡 حالات محلية (States) لربطها بالمدخلات
  const [formData, setFormData] = useState({
    morningGracePeriodMins: 15,
    autoAbsentAfterMins: 120,
    enableAiExcuseApproval: true,
    enableAiCriticalAlerts: true,
  });

  // 💡 جلب السياسات الحالية من الباك إند
  const { data: policies, isLoading } = useQuery({
    queryKey: ["attendance-policies"],
    queryFn: async () => {
      const res = await api.get("/attendance/policies");
      return res.data.data;
    },
  });

  // تحديث الحالات المحلية بمجرد جلب البيانات من السيرفر
  useEffect(() => {
    if (policies) {
      setFormData({
        morningGracePeriodMins: policies.morningGracePeriodMins,
        autoAbsentAfterMins: policies.autoAbsentAfterMins,
        enableAiExcuseApproval: policies.enableAiExcuseApproval,
        enableAiCriticalAlerts: policies.enableAiCriticalAlerts,
      });
    }
  }, [policies]);

  // 💡 إرسال البيانات للباك إند عند الحفظ
  const saveMutation = useMutation({
    mutationFn: async (updatedData) => {
      return await api.put("/attendance/policies", updatedData);
    },
    onSuccess: () => {
      toast.success("تم حفظ وتحديث سياسات الدوام بنجاح!");
      queryClient.invalidateQueries(["attendance-policies"]);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حفظ السياسات.");
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-indigo-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <h3 className="font-bold text-slate-500">جاري جلب إعدادات السياسات...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-8 max-w-4xl mx-auto shadow-sm mb-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/30 rounded-full blur-3xl -z-10"></div>
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl text-slate-700 shadow-sm border border-slate-200/50">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-xl text-slate-900">إعدادات سياسات الدوام</h3>
          <p className="text-xs font-bold text-slate-500 mt-1.5">
            تكوين القواعد، السماحيات الأوتوماتيكية، ومسارات الذكاء الاصطناعي
          </p>
        </div>
      </div>

      <div className="space-y-8 relative z-10">
        {/* ── Attendance Settings ── */}
        <div>
          <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" /> حسابات التأخير والغياب
          </h4>
          <div className="grid grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
              <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-wide">
                فترة السماحية الصباحية (دقائق)
              </label>
              <input
                type="number"
                name="morningGracePeriodMins"
                value={formData.morningGracePeriodMins}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
              />
            </div>
            <div className="p-5 bg-slate-50/50 rounded-2xl border border-slate-200/60 hover:bg-slate-50 transition-colors">
              <label className="block text-[10px] font-black text-slate-500 mb-3 uppercase tracking-wide">
                احتساب الغياب التلقائي إذا تأخر بعد (دقائق)
              </label>
              <input
                type="number"
                name="autoAbsentAfterMins"
                value={formData.autoAbsentAfterMins}
                onChange={handleChange}
                className="w-full bg-white border border-slate-200/60 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* ── AI Settings ── */}
        <div>
          <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-indigo-500" /> إعدادات الذكاء الاصطناعي للاستثناءات
          </h4>
          <div className="p-6 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 space-y-6">
            
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="enableAiExcuseApproval"
                  checked={formData.enableAiExcuseApproval}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-indigo-700 transition-colors">
                  تفعيل التجاوز التلقائي للأعذار المتكررة
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1.5 leading-relaxed">
                  يقوم النموذج الذكي بدراسة التبريرات اللحظية للموظفين والموافقة المبدئية عليها إذا توافقت مع حالة الموظف المعتادة والتاريخ السلوكي لتخفيف العبء الإداري.
                </div>
              </div>
            </label>

            <div className="h-px bg-indigo-100 w-full"></div>

            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  name="enableAiCriticalAlerts"
                  checked={formData.enableAiCriticalAlerts}
                  onChange={handleChange}
                  className="peer sr-only"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
              </div>
              <div>
                <div className="text-sm font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                  التنبيه المسبق للمستويات الحرجة للقوة العاملة
                </div>
                <div className="text-xs font-bold text-slate-500 mt-1.5 leading-relaxed">
                  إرسال تنبيه في حال اكتشاف النظام لاحتمالية غياب جماعي في طقس معين أو تأخير مجدول يضر بسير العمل في أقسام حيوية.
                </div>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-slate-200/60 flex justify-end relative z-10">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-70"
        >
          {saveMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CircleCheckBig className="w-4 h-4" />
          )}
          حفظ السياسات والتكوينات
        </button>
      </div>
    </div>
  );
}