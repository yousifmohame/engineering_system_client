// ContractSteps.jsx
import React from "react";
import {
  Scale,
  Save,
  X,
  Sparkles,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";

export const Step4Obligations = ({
  contract,
  setContract,
  openAiModal,
  isGeneratingAI,
}) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Scale className="w-4 h-4 text-emerald-600" /> الالتزامات (الطرفين)
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() =>
              openAiModal(
                "obligationsList",
                JSON.stringify(contract.obligationsList),
              )
            }
            className="text-[10px] font-bold text-violet-700 bg-violet-50 hover:bg-violet-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3 h-3" /> صياغة ذكية للجميع
          </button>
          <button
            onClick={() => {
              const newList = [
                ...(contract.obligationsList || []),
                {
                  id: `o${Date.now()}`,
                  code: `1.${(contract.obligationsList?.length || 0) + 1}`,
                  content: "",
                  party: "A",
                },
              ];
              setContract({ ...contract, obligationsList: newList });
            }}
            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            إضافة التزام جديد
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {contract.obligationsList?.map((obs, index) => (
          <div
            key={obs.id}
            className="flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100 group"
          >
            <div className="w-16 shrink-0">
              <input
                type="text"
                value={obs.code}
                onChange={(e) => {
                  const newList = [...contract.obligationsList];
                  newList[index].code = e.target.value;
                  setContract({ ...contract, obligationsList: newList });
                }}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-mono text-center focus:ring-2 focus:ring-emerald-500/20 outline-none"
                placeholder="الكود"
              />
            </div>
            <div className="w-32 shrink-0">
              <select
                value={obs.party}
                onChange={(e) => {
                  const newList = [...contract.obligationsList];
                  newList[index].party = e.target.value;
                  setContract({ ...contract, obligationsList: newList });
                }}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                <option value="A">الطرف الأول</option>
                <option value="B">الطرف الثاني</option>
                <option value="Both">كلا الطرفين</option>
              </select>
            </div>
            <div className="flex-1 relative">
              <textarea
                value={obs.content}
                onChange={(e) => {
                  const newList = [...contract.obligationsList];
                  newList[index].content = e.target.value;
                  setContract({ ...contract, obligationsList: newList });
                }}
                className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none min-h-[40px]"
                placeholder="نص الالتزام..."
                rows={2}
              />
            </div>
            <div className="shrink-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => openAiModal(`obs_${obs.id}`, obs.content)}
                className="p-1.5 text-violet-600 hover:bg-violet-100 rounded-lg"
                title="صياغة ذكية"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const btn = document.getElementById(`save-btn-${obs.id}`);
                  if (btn) {
                    btn.innerHTML =
                      '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                    btn.classList.add("text-emerald-600", "bg-emerald-50");
                    setTimeout(() => {
                      btn.innerHTML =
                        '<svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>';
                      btn.classList.remove("text-emerald-600", "bg-emerald-50");
                    }, 2000);
                  }
                }}
                id={`save-btn-${obs.id}`}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                title="حفظ في المكتبة"
              >
                <Save className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  const newList = contract.obligationsList.filter(
                    (o) => o.id !== obs.id,
                  );
                  setContract({ ...contract, obligationsList: newList });
                }}
                className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg"
                title="حذف"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Scale className="w-4 h-4 text-rose-600" /> الشروط العامة والجزاءات
        </h3>
        <button
          onClick={() =>
            openAiModal("generalConditions", contract.generalConditions || "")
          }
          disabled={isGeneratingAI || !contract.generalConditions}
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
      <textarea
        value={contract.generalConditions}
        onChange={(e) =>
          setContract({ ...contract, generalConditions: e.target.value })
        }
        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
        placeholder="الشروط العامة، فسخ العقد، غرامات التأخير..."
      />
    </div>

    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-600" /> القانون الحاكم
        </h3>
        <button
          onClick={() =>
            openAiModal("governingLaw", contract.governingLaw || "")
          }
          disabled={isGeneratingAI || !contract.governingLaw}
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
      <textarea
        value={contract.governingLaw}
        onChange={(e) =>
          setContract({ ...contract, governingLaw: e.target.value })
        }
        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
        placeholder="يخضع هذا العقد للأنظمة والقوانين المعمول بها في..."
      />
    </div>
  </div>
);
