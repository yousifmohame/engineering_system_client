// ContractSteps.jsx
import React from "react";
import { Sparkles, Loader2, Shield, Link as LinkIcon } from "lucide-react";

export const Step8RiskAssessment = ({
  contract,
  isGeneratingAI,
  handleRiskAssessment,
}) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
    <div className="p-6 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-2xl border border-violet-100 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-violet-200/50 pb-4">
        <h3 className="text-sm font-black text-violet-900 flex items-center gap-2">
          <Shield className="w-5 h-5 text-violet-600" />
          تقييم المخاطر بالذكاء الاصطناعي
        </h3>
        <button
          onClick={handleRiskAssessment}
          disabled={isGeneratingAI}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-xs font-black rounded-xl hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20 disabled:opacity-50"
        >
          {isGeneratingAI ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isGeneratingAI ? "جاري التحليل..." : "بدء التقييم"}
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50 min-h-[200px]">
        {contract.aiRiskAssessment ? (
          <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-medium">
            {contract.aiRiskAssessment}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-3 py-8">
            <Shield className="w-12 h-12 text-violet-200" />
            <p className="text-sm font-bold text-center">
              اضغط على "بدء التقييم" لتحليل العقد واكتشاف الثغرات القانونية
              <br />
              أو المخاطر المالية المحتملة عبر الذكاء الاصطناعي الخاص بالخادم.
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);
