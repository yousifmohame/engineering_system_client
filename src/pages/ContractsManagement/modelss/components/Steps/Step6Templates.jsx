// ContractSteps.jsx
import React from "react";
import { Link as LinkIcon, LayoutTemplate } from "lucide-react";

export const Step6Templates = ({ contract, setContract }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <LayoutTemplate className="w-4 h-4 text-emerald-600" /> قوالب نطاق
          العمل
        </h3>
      </div>
      <p className="text-xs text-slate-500 font-bold mb-4">
        اختر القوالب الجاهزة التي ترغب بتطبيقها على هذا العقد. سيتم دمج بنود
        القوالب المحددة مع نطاق العمل الحالي.
      </p>

      <div className="space-y-3">
        {[
          {
            id: "p1",
            name: "قالب تصميم فيلا سكنية",
            description: "يشمل التصميم المعماري والإنشائي والواجهات",
            conditions: "سكني، فيلا",
            items: [
              { content: "التصميم المعماري المبدئي والنهائي" },
              { content: "المخططات الإنشائية" },
            ],
          },
          {
            id: "p2",
            name: "قالب إشراف هندسي",
            description: "يشمل الزيارات الميدانية وتقارير الإشراف",
            conditions: "إشراف، تجاري/سكني",
            items: [
              { content: "زيارات ميدانية أسبوعية" },
              { content: "تقارير شهرية" },
            ],
          },
          {
            id: "p3",
            name: "قالب تصميم داخلي",
            description: "يشمل المخططات التنفيذية وجداول الكميات",
            conditions: "تصميم داخلي",
            items: [
              { content: "مخططات تنفيذية للديكور" },
              { content: "جداول كميات المواد" },
            ],
          },
        ].map((preset) => (
          <label
            key={preset.id}
            className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${contract.activePresets?.includes(preset.id) ? "bg-emerald-50 border-emerald-500 shadow-sm" : "bg-white border-slate-200 hover:bg-slate-50"}`}
          >
            <div className="mt-0.5">
              <input
                type="checkbox"
                checked={contract.activePresets?.includes(preset.id) || false}
                onChange={(e) => {
                  const current = contract.activePresets || [];
                  const updated = e.target.checked
                    ? [...current, preset.id]
                    : current.filter((id) => id !== preset.id);

                  let newTerms = contract.terms || "";
                  if (e.target.checked) {
                    const presetContent = preset.items
                      .map((item) => `- ${item.content}`)
                      .join("\n");
                    newTerms = newTerms
                      ? `${newTerms}\n\n${presetContent}`
                      : presetContent;
                  }

                  setContract({
                    ...contract,
                    activePresets: updated,
                    terms: newTerms,
                  });
                }}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4
                  className={`text-sm font-black ${contract.activePresets?.includes(preset.id) ? "text-emerald-900" : "text-slate-800"}`}
                >
                  {preset.name}
                </h4>
                <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  {preset.conditions}
                </span>
              </div>
              <p
                className={`text-xs mt-1 ${contract.activePresets?.includes(preset.id) ? "text-emerald-700" : "text-slate-500"}`}
              >
                {preset.description}
              </p>
            </div>
          </label>
        ))}
      </div>
    </div>
  </div>
);
