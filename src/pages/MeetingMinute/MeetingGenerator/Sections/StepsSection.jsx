import React from "react";
import { Plus, Trash2, Zap } from "lucide-react";

export default function StepsSection({ minute, setMinute }) {
  const addStep = () => {
    setMinute(prev => ({
      ...prev, steps: [...(prev.steps || []), { id: Date.now().toString(), description: "", action: "", responsible: "", deadline: "", status: "معلق" }]
    }));
  };

  const updateStep = (id, field, value) => {
    setMinute(prev => ({
      ...prev, steps: (prev.steps || []).map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeStep = (id) => {
    setMinute(prev => ({
      ...prev, steps: (prev.steps || []).filter(s => s.id !== id)
    }));
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-600" /> إدارة الخطوات القادمة
        </h3>
        <button onClick={addStep} className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-indigo-600 flex items-center gap-1.5 shadow-sm transition-all hover:bg-slate-50">
          <Plus className="w-3.5 h-3.5" /> خطوة جديدة
        </button>
      </div>
      <div className="space-y-3">
        {(minute.steps || []).map((step, idx) => (
          <div key={step.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative group">
            <button onClick={() => removeStep(step.id)} className="absolute top-2 left-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 mb-3">
              <span className="w-6 h-6 rounded-full bg-indigo-50 flex items-center justify-center text-[10px] font-black text-indigo-600 shrink-0">
                {idx + 1}
              </span>
              <input
                type="text"
                value={step.description}
                onChange={(e) => updateStep(step.id, "description", e.target.value)}
                className="w-full text-xs font-bold border-b border-transparent hover:border-slate-200 outline-none focus:border-indigo-500 pb-1 transition-colors"
                placeholder="وصف المهمة أو الخطوة المطلوبة..."
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                 <label className="text-[9px] font-bold text-slate-500 mb-1 block">المسؤول</label>
                 <input type="text" value={step.responsible} onChange={(e) => updateStep(step.id, "responsible", e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold" placeholder="جهة التنفيذ" />
              </div>
              <div>
                 <label className="text-[9px] font-bold text-slate-500 mb-1 block">تاريخ الإنجاز</label>
                 <input type="date" value={step.deadline} onChange={(e) => updateStep(step.id, "deadline", e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold" />
              </div>
              <div>
                 <label className="text-[9px] font-bold text-slate-500 mb-1 block">الحالة</label>
                 <select value={step.status} onChange={(e) => updateStep(step.id, "status", e.target.value)} className="w-full text-[10px] p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 font-bold">
                   <option value="معلق">معلق</option>
                   <option value="جاري">جاري</option>
                   <option value="مكتمل">مكتمل</option>
                 </select>
              </div>
            </div>
          </div>
        ))}
        {minute.steps?.length === 0 && <div className="text-center p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold">لا يوجد خطوات مجدولة</div>}
      </div>
    </div>
  );
}