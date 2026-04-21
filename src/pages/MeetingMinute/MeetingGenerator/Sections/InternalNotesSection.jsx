import React, { useState } from "react";
import { AlertCircle, Wand2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios";

export default function InternalNotesSection({ minute, updateField }) {
  const [loading, setLoading] = useState(false);

  const extractInternalNotes = async () => {
    // تجميع المحاور لاستخراج الملاحظات منها
    const allOutcomesText = minute.axes?.map(a => a.outcomes?.map(o => o.content).join(' ')).join(' ');
    if (!allOutcomesText || allOutcomesText.trim() === '') {
       return toast.error("لا توجد مخرجات كافية لاستخراج التنبيهات.");
    }
    
    setLoading(true);
    try {
      const res = await api.post("/meeting-minutes/ai/generate", { 
        prompt: `بصفتك مهندس استشاري، استخرج ملاحظات فنية دقيقة وتنبيهات داخلية لفريق العمل بناءً على هذه المخرجات: "${allOutcomesText}"` 
      });
      if (res.data?.success) {
        updateField("internalNotes", (minute.internalNotes ? minute.internalNotes + "\n\n" : "") + res.data.text);
        toast.success("تم استخراج التنبيهات بنجاح");
      }
    } catch (e) {
      toast.error("فشل الاتصال بالذكاء الاصطناعي");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl shadow-sm">
        <div className="flex items-center justify-between mb-3 border-b border-amber-200/50 pb-2">
           <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> ملاحظات داخلية لفريق العمل
           </h3>
           <button onClick={extractInternalNotes} disabled={loading} className="text-[10px] px-3 py-1.5 bg-white border border-amber-200 text-amber-800 font-black rounded-lg flex items-center gap-1.5 hover:bg-amber-100 shadow-sm transition-colors disabled:opacity-50">
             {loading ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3" />} استخراج تنبيهات عبر AI
           </button>
        </div>
        <p className="text-[10px] font-bold text-amber-700/80 mb-3">لن تظهر هذه الملاحظات في النسخة المطبوعة أو الموجهة للعميل.</p>
        <textarea
          value={minute.internalNotes || ""}
          onChange={(e) => updateField("internalNotes", e.target.value)}
          className="w-full h-40 p-4 text-xs font-bold text-slate-800 border border-amber-300 rounded-xl resize-none outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white transition-all custom-scrollbar"
          placeholder="سجل تنبيهات للمهندسين، تكاليف خفية، أو أي تفاصيل تخص الفريق الداخلي..."
        />
      </div>
    </div>
  );
}