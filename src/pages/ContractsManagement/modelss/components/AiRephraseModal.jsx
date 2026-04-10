// AiRephraseModal.jsx
import React from "react";
import { X, Sparkles } from "lucide-react";

export default function AiRephraseModal({ config, setConfig, onExecute, isGenerating }) {
  if (!config.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-violet-50/50">
          <h3 className="font-black text-violet-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-600" /> إعدادات الصياغة الذكية
          </h3>
          <button onClick={() => setConfig({ ...config, isOpen: false })} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 block">مستوى الرسمية (Formality)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig({ ...config, formality: "strict" })}
                className={`p-3 rounded-xl border text-sm font-bold transition-colors ${config.formality === "strict" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                قانوني صارم
              </button>
              <button
                onClick={() => setConfig({ ...config, formality: "standard" })}
                className={`p-3 rounded-xl border text-sm font-bold transition-colors ${config.formality === "standard" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                أعمال قياسي
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 block">مستوى التفصيل (Length)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig({ ...config, length: "detailed" })}
                className={`p-3 rounded-xl border text-sm font-bold transition-colors ${config.length === "detailed" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                مفصل وشامل
              </button>
              <button
                onClick={() => setConfig({ ...config, length: "concise" })}
                className={`p-3 rounded-xl border text-sm font-bold transition-colors ${config.length === "concise" ? "bg-violet-50 border-violet-500 text-violet-700" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                موجز ومختصر
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={() => setConfig({ ...config, isOpen: false })} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-colors">
            إلغاء
          </button>
          <button
            onClick={onExecute}
            disabled={isGenerating}
            className="px-6 py-2.5 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "جاري التوليد..." : "توليد الصياغة"}
          </button>
        </div>
      </div>
    </div>
  );
}