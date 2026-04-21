import React from "react";
import { Wand2 } from "lucide-react";

export default function AiSuggestionBox({ suggestion, setSuggestion, onApply }) {
  if (!suggestion) return null;

  return (
    <div className="mt-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl shadow-sm mb-4 animate-in fade-in slide-in-from-top-2">
      <h4 className="text-xs font-black text-indigo-900 mb-2 flex items-center gap-1.5">
        <Wand2 className="w-4 h-4" /> مقترح الذكاء الاصطناعي
      </h4>
      <p className="text-sm text-slate-800 whitespace-pre-wrap mb-4 bg-white p-3 rounded-lg border border-indigo-100">
        {suggestion.text}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => {
            onApply(suggestion.text);
            setSuggestion(null);
          }}
          className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-black rounded-lg hover:bg-indigo-700 transition"
        >
          استبدال النص الحالي
        </button>
        <button
          onClick={() => setSuggestion(null)}
          className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 text-xs font-black rounded-lg transition mr-auto"
        >
          تجاهل
        </button>
      </div>
    </div>
  );
}