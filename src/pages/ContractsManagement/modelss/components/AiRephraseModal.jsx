// AiRephraseModal.jsx
import React from "react";
import { X, Sparkles } from "lucide-react";

export default function AiRephraseModal({ config, setConfig, onExecute, isGenerating }) {
  if (!config.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/55 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-md overflow-hidden border border-[#d8e6ee]">
        <div className="px-4 py-3 border-b border-[#d8e6ee] flex justify-between items-center bg-gradient-to-l from-[#071927] to-[#147785]">
          <h3 className="font-black text-white text-[14px] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d9b85b]" /> إعدادات الصياغة الذكية
          </h3>
          <button onClick={() => setConfig({ ...config, isOpen: false })} className="text-white/75 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-3">
            <label className="text-xs font-black text-[#123B5D] block">مستوى الرسمية (Formality)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig({ ...config, formality: "strict" })}
                className={`p-2.5 rounded-xl border text-[12px] font-black transition-colors ${config.formality === "strict" ? "bg-[#eef5f7] border-[#0f6d7c] text-[#123B5D]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                قانوني صارم
              </button>
              <button
                onClick={() => setConfig({ ...config, formality: "standard" })}
                className={`p-2.5 rounded-xl border text-[12px] font-black transition-colors ${config.formality === "standard" ? "bg-[#eef5f7] border-[#0f6d7c] text-[#123B5D]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                أعمال قياسي
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-[#123B5D] block">مستوى التفصيل (Length)</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setConfig({ ...config, length: "detailed" })}
                className={`p-2.5 rounded-xl border text-[12px] font-black transition-colors ${config.length === "detailed" ? "bg-[#eef5f7] border-[#0f6d7c] text-[#123B5D]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                مفصل وشامل
              </button>
              <button
                onClick={() => setConfig({ ...config, length: "concise" })}
                className={`p-2.5 rounded-xl border text-[12px] font-black transition-colors ${config.length === "concise" ? "bg-[#eef5f7] border-[#0f6d7c] text-[#123B5D]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
              >
                موجز ومختصر
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[#d8e6ee] bg-[#f7fbfd] flex justify-end gap-2">
          <button onClick={() => setConfig({ ...config, isOpen: false })} className="px-4 py-2 text-[#52677e] text-xs font-bold hover:bg-[#eef5f7] rounded-xl transition-colors">
            إلغاء
          </button>
          <button
            onClick={onExecute}
            disabled={isGenerating}
            className="px-5 py-2 bg-[#083646] text-white text-xs font-black rounded-xl hover:bg-[#0f6d7c] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "جاري التوليد..." : "توليد الصياغة"}
          </button>
        </div>
      </div>
    </div>
  );
}