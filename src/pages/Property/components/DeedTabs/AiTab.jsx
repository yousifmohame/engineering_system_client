import React from "react";
import { Brain, Upload, Loader2, CheckCircle2 } from "lucide-react";

export const AiTab = ({
  aiAnalyzing,
  aiResult,
  handleAiUpload,
  handleConfirmAiData,
  setAiResult,
}) => {
  return (
    <div className="animate-in fade-in h-full flex flex-col max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-[#e7eef2]">
        <span className="text-sm font-bold text-[#123B5D] flex items-center gap-1">
          <Brain className="w-4 h-4 text-[#0f6d7c]" /> تحليل الذكاء الاصطناعي
        </span>
      </div>

      <div className="flex-1">
        {!aiAnalyzing && !aiResult && (
          <div className="max-w-4xl mx-auto border border-blue-200 rounded-xl overflow-hidden bg-white shadow-sm mt-6">
            <div className="px-5 py-4 flex items-center justify-between text-blue-800 border-b border-blue-100 bg-blue-50">
              <span className="font-bold text-sm">
                رفع وثيقة جديدة للتحليل وإعادة استخراج البيانات
              </span>
              <Upload className="w-5 h-5" />
            </div>
            <div className="bg-[#1d4ed8] p-8 relative cursor-pointer hover:bg-[#0f6d7c] transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={handleAiUpload}
              />
              <div className="flex flex-col justify-center items-center text-white text-sm font-bold gap-3">
                <span className="bg-white/20 hover:bg-white/30 text-white px-8 py-3 rounded-xl transition-colors text-base">
                  اضغط لاختيار ملف PDF أو صورة
                </span>
                <span className="text-blue-200 font-normal">
                  أو اسحب وأفلت الملف هنا
                </span>
              </div>
            </div>
          </div>
        )}

        {aiAnalyzing && (
          <div className="max-w-4xl mx-auto bg-[#f7fbfd] border-2 border-dashed border-blue-200 rounded-xl p-20 flex flex-col items-center justify-center mt-6">
            <Loader2 className="w-12 h-12 text-[#0f6d7c] animate-spin mb-4" />
            <h4 className="text-lg font-bold text-[#123B5D]">
              جاري قراءة وتحليل الصك بالذكاء الاصطناعي... يرجى الانتظار
            </h4>
          </div>
        )}

        {aiResult && (
          <div className="max-w-4xl mx-auto border border-green-200 rounded-xl overflow-hidden bg-[#f4fcf6] mt-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6 border-b border-green-200 pb-4">
                <h4 className="text-lg font-bold text-green-800">
                  تم استخراج البيانات بنجاح!
                </h4>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <pre
                className="text-left font-mono text-xs bg-white p-4 rounded border border-green-100 overflow-y-auto max-h-[400px]"
                dir="ltr"
              >
                {JSON.stringify(aiResult, null, 2)}
              </pre>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={handleConfirmAiData}
                  className="bg-[#083646] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#0f6d7c] shadow-md"
                >
                  تأكيد وتطبيق البيانات على الملف
                </button>
                <button
                  onClick={() => setAiResult(null)}
                  className="bg-white border border-slate-300 text-[#123B5D] px-6 py-2.5 rounded-xl font-bold hover:bg-[#f7fbfd]"
                >
                  إلغاء وإعادة المحاولة
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};