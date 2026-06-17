import React from "react";
import {
  Calendar,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Info,
  CalendarDays,
  ListChecks,
  Check
} from "lucide-react";

export const Step5Timeline = ({ props }) => {
  const {
    timelineState,
    setTimelineState,
    itemsList = [],
  } = props;

  // ==========================================
  // 🚀 الثوابت والخيارات
  // ==========================================
  const DURATION_UNITS = [
    { id: "WORKING_DAY", label: "يوم عمل" },
    { id: "CALENDAR_DAY", label: "يوم تقويمي" },
    { id: "WEEK", label: "أسبوع" },
    { id: "MONTH", label: "شهر" },
  ];

  const START_CONDITIONS = [
    { id: "DOCUMENTS_RECEIVED", label: "استلام كافة المستندات والبيانات المطلوبة من المالك أو المستفيد." },
    { id: "ADVANCE_PAYMENT", label: "تأكيد استلام الدفعة الأولى أو المستحق المالي المتفق عليه." },
    { id: "TRAFFIC_STUDY", label: "استلام خطاب اعتماد الدراسة المرورية (إن كانت متطلباً)." },
    { id: "SPECIFIC_DATE", label: "البدء من تاريخ محدد (يتم إدخاله يدوياً)." },
  ];

  // ==========================================
  // 🚀 الدوال المساعدة لمعالجة الأحداث
  // ==========================================
  const handleStateChange = (field, value) => {
    setTimelineState((prev) => ({ ...prev, [field]: value }));
  };

  const toggleStartCondition = (conditionId) => {
    setTimelineState((prev) => {
      const current = prev.startConditions || [];
      const updated = current.includes(conditionId)
        ? current.filter((id) => id !== conditionId)
        : [...current, conditionId];
      return { ...prev, startConditions: updated };
    });
  };

  const handleAddTimelineItem = () => {
    const newItem = {
      id: `time_${Date.now()}`,
      itemId: "", 
      duration: 0,
      unit: timelineState.durationUnit,
      notes: "",
      showInQuote: true,
    };
    handleStateChange("timelineItems", [...timelineState.timelineItems, newItem]);
  };

  const handleUpdateTimelineItem = (id, field, value) => {
    const updated = timelineState.timelineItems.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    handleStateChange("timelineItems", updated);
  };

  const handleRemoveTimelineItem = (id) => {
    handleStateChange(
      "timelineItems",
      timelineState.timelineItems.filter((item) => item.id !== id)
    );
  };

  // ==========================================
  // 🚀 الحسابات الذكية
  // ==========================================
  const totalDuration = Number(timelineState.totalDuration) || 0;
  const distributedDuration = timelineState.timelineItems.reduce(
    (sum, item) => sum + (Number(item.duration) || 0),
    0
  );
  
  const remainingDuration = totalDuration - distributedDuration;
  const isExceeding = remainingDuration < 0;

  const selectedUnitLabel = DURATION_UNITS.find(u => u.id === timelineState.durationUnit)?.label || "يوم عمل";

  return (
    <div className="flex flex-col gap-6 text-[#123f59] pb-8 animate-in fade-in duration-500">
      
      {/* 🌟 1. المفتاح الرئيسي (تم إصلاحه برمجياً وتصميمياً) 🌟 */}
      <div 
        onClick={() => handleStateChange("showTimeline", !timelineState.showTimeline)}
        className={`relative overflow-hidden p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between shadow-sm ${
          timelineState.showTimeline 
          ? "border-[#0e7490] bg-[#eef7f6]" 
          : "border-slate-200 bg-white hover:border-slate-300"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full transition-colors ${timelineState.showTimeline ? "bg-[#0e7490] text-white" : "bg-slate-100 text-slate-400"}`}>
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h3 className={`font-black text-sm transition-colors ${timelineState.showTimeline ? "text-[#123f59]" : "text-slate-500"}`}>
              تضمين الجدول الزمني في عرض السعر
            </h3>
            <p className="text-[11px] font-bold text-slate-400">
              قم بتفعيل هذا الخيار لإضافة وتفصيل مدد التنفيذ وشروط البدء في المستند.
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="shrink-0 flex items-center justify-center">
           <button
            type="button"
            role="switch"
            aria-checked={timelineState.showTimeline}
            className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
              timelineState.showTimeline ? 'bg-[#0e7490]' : 'bg-slate-300'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                timelineState.showTimeline ? '-translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 🌟 المحتوى يظهر فقط عند التفعيل 🌟 */}
      {timelineState.showTimeline && (
        <div className="flex flex-col gap-6 animate-in slide-in-from-top-4 fade-in duration-500">
          
          {/* --- القسم الأول: الإعدادات الأساسية --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* مدة التنفيذ */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 group focus-within:border-[#0e7490] transition-colors">
              <label className="text-xs font-black text-[#123f59] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#d8b46a]" /> إجمالي مدة التنفيذ
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-2 focus-within:ring-[#0e7490]/20 focus-within:border-[#0e7490] transition-all">
                <input
                  type="number"
                  min="1"
                  value={timelineState.totalDuration}
                  onChange={(e) => handleStateChange("totalDuration", e.target.value)}
                  className="w-1/2 p-3 bg-slate-50 text-center font-black text-[#0e7490] text-lg font-mono outline-none"
                />
                <div className="w-[1px] bg-slate-200"></div>
                <select
                  value={timelineState.durationUnit}
                  onChange={(e) => handleStateChange("durationUnit", e.target.value)}
                  className="w-1/2 p-3 bg-white font-bold text-slate-700 outline-none cursor-pointer"
                >
                  {DURATION_UNITS.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
            </div>

            {/* تاريخ الانتهاء */}
            <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3 group focus-within:border-[#0e7490] transition-colors">
              <label className="text-xs font-black text-[#123f59] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#d8b46a]" /> تاريخ الانتهاء التقريبي
              </label>
              <select
                value={timelineState.showEndDate ? "true" : "false"}
                onChange={(e) => handleStateChange("showEndDate", e.target.value === "true")}
                className="w-full mt-auto p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 transition-all cursor-pointer"
              >
                <option value="false">إخفاء (يُحدد لاحقاً بعد تحقق الشروط)</option>
                <option value="true">إظهار التاريخ التقريبي في العرض</option>
              </select>
            </div>
          </div>

          {/* --- القسم الثاني: شروط البدء (تم تحسين الـ UX) --- */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <div className="mb-4">
              <h3 className="text-sm font-black text-[#123f59] flex items-center gap-2">
                <ListChecks className="w-5 h-5 text-[#d8b46a]" /> متى يبدأ احتساب المدة؟
              </h3>
              <p className="text-[11px] font-bold text-slate-400 mt-1">يمكنك اختيار شرط واحد أو أكثر (إذا تعددت الشروط، يبدأ الاحتساب بعد تحققها جميعاً).</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {START_CONDITIONS.map((cond) => {
                const isSelected = timelineState.startConditions.includes(cond.id);
                return (
                  <div key={cond.id} className="flex flex-col gap-2">
                    <div 
                      onClick={() => toggleStartCondition(cond.id)}
                      className={`flex items-start gap-3 p-3.5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        isSelected 
                        ? "bg-indigo-50/50 border-indigo-500 shadow-sm" 
                        : "bg-slate-50 border-slate-200 hover:border-indigo-200 hover:bg-slate-50/80"
                      }`}
                    >
                      <div className={`shrink-0 w-5 h-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${isSelected ? "bg-indigo-500 border-indigo-500" : "bg-white border-slate-300"}`}>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>
                      <span className={`text-[11px] leading-relaxed ${isSelected ? "font-black text-indigo-900" : "font-bold text-slate-600"}`}>
                        {cond.label}
                      </span>
                    </div>
                    
                    {/* حقل التاريخ المنبثق */}
                    {cond.id === "SPECIFIC_DATE" && isSelected && (
                      <div className="mr-8 animate-in slide-in-from-top-2 fade-in">
                        <input
                          type="date"
                          value={timelineState.customStartDate}
                          onChange={(e) => handleStateChange("customStartDate", e.target.value)}
                          className="w-full p-2.5 bg-white border-2 border-indigo-100 focus:border-indigo-500 rounded-xl text-xs font-bold text-[#123f59] outline-none shadow-sm transition-all"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* --- القسم الثالث: التوزيع الفني --- */}
          <div className="p-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-5 border-b border-slate-100 bg-slate-50/50 gap-4">
              <div>
                <h3 className="text-sm font-black text-[#123f59]">توزيع مدة التنفيذ على الخدمات</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1">تحديد المدد التفصيلية لكل مرحلة عمل (اختياري).</p>
              </div>
              <button
                onClick={handleAddTimelineItem}
                disabled={itemsList.length === 0}
                className="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#123f59] text-white rounded-xl text-[11px] font-black hover:bg-[#0e7490] hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> إضافة مرحلة
              </button>
            </div>

            {itemsList.length === 0 && (
              <div className="m-5 p-4 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold rounded-xl flex items-center gap-3">
                <Info className="w-5 h-5 shrink-0" /> يجب إضافة خدمات في قسم "نطاق العمل" أولاً لتتمكن من التوزيع.
              </div>
            )}

            {timelineState.timelineItems.length > 0 && (
              <div className="overflow-x-auto custom-scrollbar-slim">
                <table className="w-full text-right border-collapse min-w-[750px]">
                  <thead>
                    <tr className="bg-white border-b border-slate-200">
                      <th className="p-3 text-[10px] text-slate-400 font-black w-12 text-center">م</th>
                      <th className="p-3 text-[10px] text-slate-500 font-black w-1/3">الخدمة / المرحلة المحددة</th>
                      <th className="p-3 text-[10px] text-slate-500 font-black w-32 text-center">المدة المخصصة</th>
                      <th className="p-3 text-[10px] text-slate-500 font-black">ملاحظات (للعميل)</th>
                      <th className="p-3 text-[10px] text-slate-500 font-black w-12 text-center"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {timelineState.timelineItems.map((item, index) => (
                      <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                        <td className="p-3 text-[11px] font-black text-slate-300 text-center">{index + 1}</td>
                        <td className="p-3">
                          <select
                            value={item.itemId}
                            onChange={(e) => handleUpdateTimelineItem(item.id, "itemId", e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-[#123f59] outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all"
                          >
                            <option value="">-- اختر الخدمة --</option>
                            {itemsList.map(srv => (
                              <option key={srv.id} value={srv.id}>{srv.title}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2 focus-within:border-[#0e7490] focus-within:ring-1 focus-within:ring-[#0e7490] transition-all">
                            <input
                              type="number"
                              min="0"
                              value={item.duration}
                              onChange={(e) => handleUpdateTimelineItem(item.id, "duration", e.target.value)}
                              className="w-12 p-2 bg-transparent text-center text-sm font-black text-[#0e7490] outline-none font-mono"
                            />
                            <span className="text-[10px] font-bold text-slate-400">{selectedUnitLabel}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <input
                            type="text"
                            placeholder="مثال: بعد موافقة الأمانة..."
                            value={item.notes}
                            onChange={(e) => handleUpdateTimelineItem(item.id, "notes", e.target.value)}
                            className="w-full p-2.5 bg-transparent border-b border-dashed border-slate-300 text-xs font-bold text-[#475569] outline-none focus:border-[#0e7490] transition-colors"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => handleRemoveTimelineItem(item.id)} 
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {/* 🚀 الصف التلقائي */}
                    {remainingDuration > 0 && (
                      <tr className="bg-emerald-50/50">
                        <td className="p-3 text-xs font-black text-emerald-400 text-center">*</td>
                        <td className="p-3 text-xs font-black text-emerald-800">بقية خدمات نطاق العمل</td>
                        <td className="p-3 text-center">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-emerald-200 shadow-sm text-emerald-700 rounded-lg">
                            <span className="font-mono text-sm font-black">{remainingDuration}</span>
                            <span className="text-[9px] font-bold">{selectedUnitLabel}</span>
                          </div>
                        </td>
                        <td className="p-3 text-[10px] font-bold text-emerald-600/70" colSpan="2">
                          تُحسب تلقائياً لباقي الخدمات (إجمالي: {totalDuration} - موزع: {distributedDuration})
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* 🛑 تحذير التجاوز */}
            {isExceeding && (
              <div className="m-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 animate-in slide-in-from-top-2">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-black">تحذير: تجاوز الإجمالي الزمني!</span>
                  <span className="text-[11px] font-bold opacity-90">
                    مجموع مدد الخدمات ({distributedDuration}) يتجاوز الإجمالي المسموح به ({totalDuration}). يرجى زيادة الإجمالي أو تقليل المدد لكي تتمكن من الحفظ.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* --- القسم الرابع: الملاحظة التقديرية السفلية --- */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <label className="text-sm font-black text-[#123f59]">
                 الملاحظة التوضيحية أسفل الجدول
               </label>
               
               {/* مفتاح تبديل صغير (Mini Toggle) */}
               <div 
                 onClick={() => handleStateChange("showTimelineNotes", !timelineState.showTimelineNotes)}
                 className="flex items-center gap-2 cursor-pointer group"
               >
                 <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-700">إظهار الملاحظة</span>
                 <button
                    type="button"
                    role="switch"
                    aria-checked={timelineState.showTimelineNotes}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      timelineState.showTimelineNotes ? 'bg-[#0e7490]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        timelineState.showTimelineNotes ? '-translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
               </div>
             </div>
             
             {timelineState.showTimelineNotes && (
               <div className="animate-in slide-in-from-top-2 fade-in">
                 <textarea
                   value={timelineState.timelineNotes}
                   onChange={(e) => handleStateChange("timelineNotes", e.target.value)}
                   className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 transition-all resize-none leading-relaxed"
                 />
               </div>
             )}
          </div>

        </div>
      )}
    </div>
  );
};