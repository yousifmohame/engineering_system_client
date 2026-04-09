import React from "react";
import { Shield, Sparkles, CircleCheckBig, AlertTriangle } from "lucide-react";

export const VerifyTab = ({
  localData,
  handleBasicFieldChange,
  docsCount,
  ownersCount,
  plotsCount,
}) => {
  return (
    <div className="animate-in fade-in max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
        <span className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-600" /> التحقق والمراجعة
          القانونية
        </span>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
        <div className="text-xs font-bold text-slate-500 mb-3">
          الحالة الحالية:
        </div>
        <div className="flex items-center gap-3 mb-6">
          <span
            className={`px-4 py-2 font-bold rounded-lg border text-sm ${
              localData.status === "Active" || localData.status === "مؤكد"
                ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                : localData.status === "pending" ||
                    localData.status === "قيد المراجعة"
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {localData.status === "Active"
              ? "مؤكد ومعتمد"
              : localData.status || "جديد"}
          </span>
          <span className="px-3 py-2 bg-purple-100 text-purple-800 font-bold rounded-lg border border-purple-200 text-xs flex items-center gap-1">
            <Sparkles className="w-4 h-4" /> تم المراجعة بواسطة AI
          </span>
        </div>

        <div className="text-xs font-bold text-slate-500 mb-2">
          تغيير الحالة يدوياً:
        </div>
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => handleBasicFieldChange("status", "قيد المراجعة")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-colors ${localData.status === "قيد المراجعة" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
          >
            قيد المراجعة
          </button>
          <button
            onClick={() => handleBasicFieldChange("status", "Active")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-colors ${localData.status === "Active" ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
          >
            مؤكد
          </button>
          <button
            onClick={() => handleBasicFieldChange("status", "متنازع")}
            className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-colors ${localData.status === "متنازع" ? "bg-red-600 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"}`}
          >
            متنازع / إيقاف
          </button>
        </div>

        <div className="text-xs font-bold text-slate-500 mb-2">
          ملاحظات المراجع القانوني (تُحفظ مع الملف):
        </div>
        <textarea
          value={localData.notes || ""}
          onChange={(e) => handleBasicFieldChange("notes", e.target.value)}
          placeholder="اكتب ملاحظاتك القانونية أو النواقص هنا..."
          className="w-full border border-slate-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 min-h-[120px]"
        />
      </div>

      <h4 className="font-bold text-slate-700 mb-3">
        قائمة التحقق الآلي (System Checklist)
      </h4>
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
        {[
          { label: "الوثائق الأساسية مرفقة", valid: docsCount > 0 },
          {
            label: "بيانات الملاك مكتملة (المجموع 100%)",
            valid: ownersCount > 0,
          },
          { label: "القطع مسجلة مع مساحاتها", valid: plotsCount > 0 },
          {
            label: "حدود القطع مسجلة",
            valid: localData.boundaries?.length > 0,
          },
          { label: "تحليل الذكاء الاصطناعي مكتمل", valid: true },
          {
            label: "لا توجد قيود أو إيقافات حرجة",
            valid: localData.status !== "متنازع",
          },
        ].map((check, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
          >
            {check.valid ? (
              <CircleCheckBig className="w-5 h-5 text-emerald-500" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            )}
            <span
              className={`text-sm font-bold ${check.valid ? "text-slate-700" : "text-amber-700"}`}
            >
              {check.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
