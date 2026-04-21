import React, { useState } from "react";
import { Plus, Trash2, Wand2, Layout, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";

export default function ContentSection({ minute, setMinute }) {
  const [loadingAiId, setLoadingAiId] = useState(null);

  const addAxis = () => {
    setMinute(prev => ({
      ...prev,
      axes: [...(prev.axes || []), { id: `ax-${Date.now()}`, title: "محور جديد", clientRequests: [], companyResponses: [], outcomes: [] }]
    }));
  };

  const updateAxis = (axisId, attr, value) => {
    setMinute(prev => ({
      ...prev, axes: (prev.axes || []).map(a => a.id === axisId ? { ...a, [attr]: value } : a)
    }));
  };

  const removeAxis = (axisId) => {
    setMinute(prev => ({ ...prev, axes: (prev.axes || []).filter(a => a.id !== axisId) }));
  };

  const addOutcome = (axisId) => {
    const newOutcome = { id: `out-${Date.now()}`, source: "قرار مشترك", title: "", content: "", status: "معلق", responsible: "", targetDate: "", dueDate: "" };
    setMinute(prev => ({
      ...prev, axes: (prev.axes || []).map(a => a.id === axisId ? { ...a, outcomes: [...(a.outcomes || []), newOutcome] } : a)
    }));
  };

  const updateOutcome = (axisId, outcomeId, attr, value) => {
    setMinute(prev => ({
      ...prev, axes: (prev.axes || []).map(a => a.id === axisId ? { ...a, outcomes: a.outcomes.map(o => o.id === outcomeId ? { ...o, [attr]: value } : o) } : a)
    }));
  };

  const removeOutcome = (axisId, outcomeId) => {
    setMinute(prev => ({
      ...prev, axes: (prev.axes || []).map(a => a.id === axisId ? { ...a, outcomes: a.outcomes.filter(o => o.id !== outcomeId) } : a)
    }));
  };

  // معالجة الذكاء الاصطناعي الموضعية
  const handleInlineAi = async (axisId, outcomeId, currentText, promptType) => {
    if (!currentText) return toast.error("أدخل محتوى لتتمكن من استخدام الذكاء الاصطناعي");
    setLoadingAiId(outcomeId);
    let prompt = promptType === 'improve' 
        ? `أعد صياغة النص كقرار رسمي هندسي محترف: "${currentText}"`
        : `حول النص التالي إلى إجراء تنفيذي واضح: "${currentText}"`;
    try {
      const res = await api.post("/meeting-minutes/ai/generate", { prompt });
      if (res.data?.success) {
        updateOutcome(axisId, outcomeId, "content", res.data.text);
        toast.success("تم التحديث عبر الذكاء الاصطناعي");
      }
    } catch (e) {
      toast.error("حدث خطأ في الاتصال بالذكاء الاصطناعي");
    } finally {
      setLoadingAiId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Layout className="w-4 h-4 text-indigo-600" /> جدول الأعمال والقرارات
        </h3>
        <button onClick={addAxis} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-indigo-100 transition-colors">
          <Plus className="w-3 h-3" /> محور جديد
        </button>
      </div>

      {minute.axes?.map((axis) => (
        <div key={axis.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
          <div className="flex justify-between items-start gap-2">
            <input
              type="text"
              value={axis.title}
              onChange={(e) => updateAxis(axis.id, "title", e.target.value)}
              className="flex-1 text-sm font-black w-full p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
              placeholder="عنوان المحور..."
            />
            <button onClick={() => removeAxis(axis.id)} className="p-2 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 rounded-xl">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-700 mb-1">نقاشات وطلبات العميل</label>
              <textarea
                value={(axis.clientRequests || []).join("\n")}
                onChange={(e) => updateAxis(axis.id, "clientRequests", e.target.value.split("\n"))}
                className="w-full text-xs font-bold p-3 bg-white border border-slate-200 rounded-xl h-24 resize-none outline-none focus:border-indigo-500 custom-scrollbar"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-700 mb-1">إفادات الشركة</label>
              <textarea
                value={(axis.companyResponses || []).join("\n")}
                onChange={(e) => updateAxis(axis.id, "companyResponses", e.target.value.split("\n"))}
                className="w-full text-xs font-bold p-3 bg-white border border-slate-200 rounded-xl h-24 resize-none outline-none focus:border-indigo-500 custom-scrollbar"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-[11px] font-black text-slate-800">القرارات والمخرجات المتفق عليها</label>
              <button onClick={() => addOutcome(axis.id)} className="text-[10px] font-black text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded bg-white border border-slate-200 flex items-center gap-1 shadow-sm">
                <Plus className="w-3 h-3" /> مخرج جديد
              </button>
            </div>
            {axis.outcomes?.map((outcome) => (
              <div key={outcome.id} className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col gap-3 relative group">
                <button onClick={() => removeOutcome(axis.id, outcome.id)} className="absolute top-2 left-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 z-10">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="pr-2 w-full grid grid-cols-12 gap-2">
                  <div className="col-span-8">
                    <input
                      value={outcome.title}
                      onChange={(e) => updateOutcome(axis.id, outcome.id, "title", e.target.value)}
                      className="w-full text-xs font-black p-1.5 border-b border-transparent focus:border-indigo-500 outline-none transition-colors"
                      placeholder="عنوان المخرج المختصر..."
                    />
                  </div>
                  <div className="col-span-4">
                    <select
                      value={outcome.source}
                      onChange={(e) => updateOutcome(axis.id, outcome.id, "source", e.target.value)}
                      className="w-full text-[10px] font-bold p-1.5 bg-slate-50 border border-slate-100 rounded outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="قرار مشترك">قرار مشترك</option>
                      <option value="طلب عميل">طلب عميل</option>
                    </select>
                  </div>
                </div>

                <textarea
                  value={outcome.content}
                  onChange={(e) => updateOutcome(axis.id, outcome.id, "content", e.target.value)}
                  className="w-full text-xs font-bold text-slate-700 p-2 bg-slate-50 border border-slate-200 rounded-lg h-20 resize-none outline-none focus:border-indigo-500 custom-scrollbar"
                  placeholder="نص المخرج والتفاصيل التنفيذية..."
                />

                <div className="flex gap-2">
                  <button
                    onClick={() => handleInlineAi(axis.id, outcome.id, outcome.content, 'improve')}
                    disabled={loadingAiId === outcome.id}
                    className="text-[9px] px-2 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded hover:bg-indigo-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {loadingAiId === outcome.id ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />} تحسين الصياغة
                  </button>
                  <button
                    onClick={() => handleInlineAi(axis.id, outcome.id, outcome.content, 'action')}
                    disabled={loadingAiId === outcome.id}
                    className="text-[9px] px-2 py-1.5 bg-emerald-50 text-emerald-600 font-bold rounded hover:bg-emerald-100 flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    <Wand2 className="w-3 h-3" /> استخراج كإجراء
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border-t border-slate-100 pt-2 mt-1">
                  <select
                    value={outcome.status}
                    onChange={(e) => updateOutcome(axis.id, outcome.id, "status", e.target.value)}
                    className="text-[10px] font-bold p-1.5 bg-slate-50 border border-slate-100 rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="معلق">معلق</option>
                    <option value="منجز">منجز</option>
                  </select>
                  <input
                    value={outcome.responsible}
                    onChange={(e) => updateOutcome(axis.id, outcome.id, "responsible", e.target.value)}
                    placeholder="المسؤول..."
                    className="text-[10px] font-bold p-1.5 bg-slate-50 border border-slate-100 rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={outcome.targetDate || ""}
                    onChange={(e) => updateOutcome(axis.id, outcome.id, "targetDate", e.target.value)}
                    className="text-[10px] font-bold p-1.5 bg-slate-50 border border-slate-100 rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <input
                    type="date"
                    value={outcome.dueDate || ""}
                    onChange={(e) => updateOutcome(axis.id, outcome.id, "dueDate", e.target.value)}
                    className="text-[10px] font-bold p-1.5 bg-slate-50 border border-slate-100 rounded-md outline-none focus:ring-1 focus:ring-indigo-500"
                    title="تاريخ الاستحقاق"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}