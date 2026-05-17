import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../../../api/axios"; // ⚠️ تأكد من صحة مسار ملف الـ API
import { 
  Settings, Clock, BrainCircuit, CircleCheckBig, Loader2, CalendarDays, Plus, Trash2 
} from "lucide-react";

export default function PoliciesTab() {
  const queryClient = useQueryClient();

  // 💡 حالات الإعدادات العامة والذكاء الاصطناعي
  const [formData, setFormData] = useState({
    morningGracePeriodMins: 15,
    autoAbsentAfterMins: 120,
    enableAiExcuseApproval: true,
    enableAiCriticalAlerts: true,
  });

  // 💡 حالات أيام العمل الافتراضية للشركة
  const [workingDays, setWorkingDays] = useState({
    sunday: true, monday: true, tuesday: true, wednesday: true,
    thursday: true, friday: false, saturday: false
  });

  // 💡 حالات الإجازات الرسمية للشركة
  const [publicHolidays, setPublicHolidays] = useState([]);

  // جلب كافة السياسات والإعدادات من الباك إند
  const { data: policiesData, isLoading } = useQuery({
    queryKey: ["attendance-policies-full"],
    queryFn: async () => {
      const res = await api.get("/attendance/policies/full");
      return res.data.data;
    },
  });

  useEffect(() => {
    if (policiesData) {
      if (policiesData.policy) setFormData(policiesData.policy);
      if (policiesData.workingDays) setWorkingDays(policiesData.workingDays);
      if (policiesData.publicHolidays) setPublicHolidays(policiesData.publicHolidays);
    }
  }, [policiesData]);

  // إرسال كافة التحديثات دفعة واحدة للباك إند
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.put("/attendance/policies/full", payload);
    },
    onSuccess: () => {
      toast.success("تم حفظ وتحديث سياسات وإجازات الشركة بنجاح!");
      queryClient.invalidateQueries(["attendance-policies-full"]);
    },
    onError: () => {
      toast.error("حدث خطأ أثناء حفظ السياسات.");
    },
  });

  // دوال معالجة التغييرات
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleWorkingDayChange = (day) => {
    setWorkingDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const handleAddHoliday = () => {
    setPublicHolidays([...publicHolidays, { id: Date.now().toString(), name: "", startDate: "", endDate: "", isPaid: true }]);
  };

  const handleHolidayChange = (id, field, value) => {
    setPublicHolidays(prev => prev.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleRemoveHoliday = (id) => {
    setPublicHolidays(prev => prev.filter(h => h.id !== id));
  };

  const handleSave = () => {
    // فلترة الإجازات للتأكد من عدم وجود بيانات فارغة
    const validHolidays = publicHolidays.filter(h => h.name.trim() !== "" && h.startDate !== "" && h.endDate !== "");
    saveMutation.mutate({ policy: formData, workingDays, publicHolidays: validHolidays });
  };

  const dayNamesAr = { sunday: "الأحد", monday: "الإثنين", tuesday: "الثلاثاء", wednesday: "الأربعاء", thursday: "الخميس", friday: "الجمعة", saturday: "السبت" };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-indigo-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <h3 className="font-bold text-slate-500">جاري جلب إعدادات وسياسات الشركة...</h3>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 p-6 sm:p-8 max-w-5xl mx-auto shadow-sm mb-10 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo">
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-200/30 rounded-full blur-3xl -z-10"></div>
      
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200/60">
        <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl text-slate-700 shadow-sm border border-slate-200/50">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-black text-xl text-slate-900">إعدادات سياسات الدوام والإجازات</h3>
          <p className="text-xs font-bold text-slate-500 mt-1.5">
            تكوين القواعد العامة للشركة، أيام العمل، والإجازات الرسمية السنوية
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* ── العمود الأيمن (التأخيرات والذكاء الاصطناعي) ── */}
        <div className="space-y-8">
          <div>
            <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" /> حسابات التأخير والغياب (الافتراضية)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wide">السماحية الصباحية (دقائق)</label>
                <input type="number" name="morningGracePeriodMins" value={formData.morningGracePeriodMins} onChange={handleChange} className="w-full bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800" />
              </div>
              <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-200/60">
                <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-wide">غياب تلقائي بعد (دقائق)</label>
                <input type="number" name="autoAbsentAfterMins" value={formData.autoAbsentAfterMins} onChange={handleChange} className="w-full bg-white border border-slate-200/60 rounded-xl px-3 py-2 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-slate-800" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-500" /> إعدادات الذكاء الاصطناعي (AI)
            </h4>
            <div className="p-5 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-2xl border border-indigo-100 space-y-5">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" name="enableAiExcuseApproval" checked={formData.enableAiExcuseApproval} onChange={handleChange} className="peer sr-only" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600 shadow-inner"></div>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-indigo-700 transition-colors">تفعيل التجاوز التلقائي للأعذار المتكررة</div>
                  <div className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">يقوم النموذج الذكي بدراسة التبريرات اللحظية والموافقة المبدئية عليها بناءً على التاريخ السلوكي للموظف.</div>
                </div>
              </label>

              <div className="h-px bg-indigo-100 w-full"></div>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input type="checkbox" name="enableAiCriticalAlerts" checked={formData.enableAiCriticalAlerts} onChange={handleChange} className="peer sr-only" />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 group-hover:text-amber-700 transition-colors">التنبيه المسبق للمستويات الحرجة</div>
                  <div className="text-[10px] font-bold text-slate-500 mt-1 leading-relaxed">إرسال تنبيهات للذكاء الاصطناعي في حال التنبؤ بنقص في القوة العاملة (مثال: سوء الأحوال الجوية).</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── العمود الأيسر (أيام العمل والإجازات) ── */}
        <div className="space-y-8">
          
          <div>
            <h4 className="font-black text-slate-900 text-sm mb-4 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-500" /> أيام العمل الافتراضية للشركة
            </h4>
            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
              <p className="text-[10px] font-bold text-slate-500 mb-4">حدد أيام العمل. الأيام غير المحددة ستحتسب كأيام راحة (Weekend) ولن يطلب النظام فيها حضوراً.</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(dayNamesAr).map(day => (
                  <label key={day} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-black cursor-pointer transition-all ${workingDays[day] ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                    <input type="checkbox" checked={workingDays[day]} onChange={() => handleWorkingDayChange(day)} className="hidden" />
                    {workingDays[day] && <div className="w-1.5 h-1.5 rounded-full bg-emerald-600"></div>}
                    {dayNamesAr[day]}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
               <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                 <CalendarDays className="w-4 h-4 text-rose-500" /> الإجازات والعطلات الرسمية
               </h4>
               <button onClick={handleAddHoliday} className="text-[10px] font-black bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg flex items-center gap-1 hover:bg-rose-100 transition-colors">
                 <Plus className="w-3 h-3" /> إضافة إجازة
               </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
              {publicHolidays.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 text-xs font-bold">
                  لم يتم إضافة أي عطلات رسمية للشركة بعد.
                </div>
              ) : (
                publicHolidays.map((holiday, idx) => (
                  <div key={holiday.id} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm relative group">
                    <button onClick={() => handleRemoveHoliday(holiday.id)} className="absolute top-2 left-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-500 mb-1">اسم الإجازة (مثال: عيد الفطر)</label>
                        <input type="text" value={holiday.name} onChange={(e) => handleHolidayChange(holiday.id, "name", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-rose-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">من تاريخ</label>
                        <input type="date" value={holiday.startDate ? holiday.startDate.split('T')[0] : ""} onChange={(e) => handleHolidayChange(holiday.id, "startDate", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-rose-300" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-1">إلى تاريخ</label>
                        <input type="date" value={holiday.endDate ? holiday.endDate.split('T')[0] : ""} onChange={(e) => handleHolidayChange(holiday.id, "endDate", e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold outline-none focus:border-rose-300" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200/60 flex justify-end relative z-10">
        <button
          onClick={handleSave}
          disabled={saveMutation.isPending}
          className="px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl transition-all shadow-xl shadow-slate-900/20 active:scale-95 flex items-center gap-2 disabled:opacity-70"
        >
          {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CircleCheckBig className="w-4 h-4" />}
          حفظ سياسات وإجازات الشركة
        </button>
      </div>
    </div>
  );
}