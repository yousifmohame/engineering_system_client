import React from "react";
import { Wand2, Check, X } from "lucide-react";

export default function AiSuggestionBox({ suggestion, setSuggestion, onApply }) {
  if (!suggestion) return null;

  return (
    <div className="mb-4 mt-3 overflow-hidden rounded-[18px] border border-[#d8b46a]/35 bg-white shadow-[0_10px_28px_rgba(18,63,89,0.06)] animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 border-b border-[#e8ddc8]/70 bg-gradient-to-l from-[#fbf8f1] to-white px-4 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
          <Wand2 className="h-4 w-4" />
        </span>
        <div>
          <h4 className="text-[13px] font-black text-[#123f59]">مقترح الذكاء الاصطناعي</h4>
          <p className="text-[10px] font-bold text-[#8da0bb]">راجع النص قبل اعتماده داخل المحضر.</p>
        </div>
      </div>

      <p className="m-3 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] p-3 text-[12px] font-semibold leading-relaxed text-[#334155] whitespace-pre-wrap">
        {suggestion.text}
      </p>

      <div className="flex flex-wrap justify-end gap-2 border-t border-[#e8ddc8]/70 bg-white px-3 py-3">
        <button 
          type="button"
          onClick={() => {
            onApply(suggestion.text);
            setSuggestion(null);
          }}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-[#0e7490] px-3 text-[11px] font-black text-white transition hover:bg-[#15536f]"
        >
          <Check className="h-3.5 w-3.5" />
          استبدال النص الحالي
        </button>
        
        <button 
          type="button"
          onClick={() => setSuggestion(null)}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 text-[11px] font-black text-[#60738f] transition hover:bg-white"
        >
          <X className="h-3.5 w-3.5" />
          تجاهل
        </button>
      </div>
    </div>
  );
}