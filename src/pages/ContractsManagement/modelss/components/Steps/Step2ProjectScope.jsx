// ContractSteps.jsx
import React from "react";
import {
  MapPin,
  Layout,
  Sparkles,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

export const Step2ProjectScope = ({
  contract,
  setContract,
  openAiModal,
  isGeneratingAI,
}) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
    {/* Project Details */}
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <MapPin className="w-4 h-4 text-emerald-600" /> بيانات المشروع
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5 col-span-2">
          <label className="text-xs font-black text-slate-700">
            وصف المشروع
          </label>
          <input
            type="text"
            value={contract.projectDetails?.name}
            onChange={(e) =>
              setContract({
                ...contract,
                projectDetails: {
                  ...contract.projectDetails,
                  name: e.target.value,
                },
              })
            }
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
            placeholder="مثال: إنشاء فيلا سكنية دورين وملحق"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">المدينة</label>
          <input
            type="text"
            value={contract.projectDetails?.city}
            onChange={(e) =>
              setContract({
                ...contract,
                projectDetails: {
                  ...contract.projectDetails,
                  city: e.target.value,
                },
              })
            }
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">
            الحي / الموقع
          </label>
          <input
            type="text"
            value={contract.projectDetails?.location}
            onChange={(e) =>
              setContract({
                ...contract,
                projectDetails: {
                  ...contract.projectDetails,
                  location: e.target.value,
                },
              })
            }
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">رقم الصك</label>
          <input
            type="text"
            value={contract.projectDetails?.deedNumber}
            onChange={(e) =>
              setContract({
                ...contract,
                projectDetails: {
                  ...contract.projectDetails,
                  deedNumber: e.target.value,
                },
              })
            }
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">
            رقم القطعة
          </label>
          <input
            type="text"
            value={contract.projectDetails?.plotNumber}
            onChange={(e) =>
              setContract({
                ...contract,
                projectDetails: {
                  ...contract.projectDetails,
                  plotNumber: e.target.value,
                },
              })
            }
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
      </div>
    </div>

    {/* Scope of Work */}
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Layout className="w-4 h-4 text-emerald-600" /> نطاق العمل التفصيلي
        </h3>
        <button
          onClick={() => openAiModal("terms", contract.terms || "")}
          disabled={isGeneratingAI || !contract.terms}
          className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
        >
          {isGeneratingAI ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3" />
          )}
          إعدادات الصياغة الذكية
        </button>
      </div>
      <div className="space-y-1.5">
        <textarea
          value={contract.terms}
          onChange={(e) => setContract({ ...contract, terms: e.target.value })}
          className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
          placeholder="اكتب تفاصيل نطاق العمل هنا بشكل دقيق ومفصل..."
        />
      </div>
    </div>
  </div>
);
