import React from "react";
import { FileText, AlertTriangle, Brain, Copy } from "lucide-react";
import { AiBadge } from "../utils";

export function TabAiReport({ permit }) {
  if (permit?.source !== "رفع يدوي (AI)") {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400 p-4 text-center">
        <AlertTriangle size={40} className="mb-3 opacity-30" />
        <span className="text-sm font-bold text-slate-500">
          لا يوجد تقرير ذكاء اصطناعي
        </span>
        <span className="text-[10px] mt-1">
          هذه الرخصة لم يتم إدخالها أو معالجتها عبر الأرشفة الذكية.
        </span>
      </div>
    );
  }

  const detailedReport =
    permit?.detailedReport ||
    "تم استخراج البيانات الأساسية بنجاح ولكن لم يتم توليد تقرير مفصل لهذه الرخصة.";

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <Brain size={16} className="text-[#0f3d50]" />
        <span className="text-[12px] font-black text-slate-700">
          تقرير التحليل الشامل بالذكاء الاصطناعي
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="border border-[#e8dcc8] rounded-xl p-4 bg-[#f4f7f8]/50 space-y-3 text-[11px] font-bold shadow-sm h-fit">
          <div className="flex justify-between items-center">
            <span className="text-[#0f3d50]">حالة التحليل</span>
            <AiBadge status={permit?.aiStatus} />
          </div>
          <div className="w-full bg-[#edf2f4] rounded-full h-2 mt-2">
            <div
              className="bg-[#f4f7f8]0 h-2 rounded-full transition-all"
              style={{
                width: permit?.aiStatus === "تم التحليل" ? "95%" : "60%",
              }}
            />
          </div>
          <div className="flex justify-between pt-2 border-t border-[#e8dcc8]">
            <span className="text-slate-500">المودل المستخدم</span>
            <span className="text-slate-700">GPT-4o Vision</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">الدقة المتوقعة</span>
            <span className="text-emerald-600">98%</span>
          </div>
        </div>

        <div className="lg:col-span-2 border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
          <h4 className="text-[12px] font-black text-slate-800 mb-3 flex items-center gap-2">
            <FileText size={14} className="text-[#0f3d50]" /> الملخص الهندسي
            للرخصة
            <button
              onClick={() => copyToClipboard(detailedReport)}
              className="text-slate-400 hover:text-[#123B5D] mr-auto"
            >
              <Copy size={12} />
            </button>
          </h4>
          <p className="text-[12px] leading-loose text-slate-600 font-semibold text-justify whitespace-pre-wrap">
            {detailedReport}
          </p>
        </div>
      </div>
    </div>
  );
}
