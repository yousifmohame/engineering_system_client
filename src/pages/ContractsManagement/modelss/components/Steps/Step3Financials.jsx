// ContractSteps.jsx
import React from "react";
import { DollarSign, Link as LinkIcon } from "lucide-react";

export const Step3Financials = ({ contract, setContract }) => (
  <div className="space-y-6 animate-in slide-in-from-right-4">
    {/* Financial Summary */}
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        <DollarSign className="w-4 h-4 text-emerald-600" /> قيمة العقد والملخص
        المالي
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">
            قيمة العقد (المبلغ الأساسي)
          </label>
          <input
            type="number"
            value={contract.contractValue}
            onChange={(e) => {
              const total = Number(e.target.value);
              const tax = total * 0.15;
              setContract({
                ...contract,
                contractValue: total,
                financials: {
                  ...contract.financials,
                  taxAmount: tax,
                  grandTotal: total + tax,
                },
              });
            }}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">
            قيمة الضريبة (15%)
          </label>
          <input
            type="number"
            value={contract.financials?.taxAmount}
            readOnly
            className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm font-bold text-slate-500 outline-none cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-700">
            الإجمالي الشامل (ريال)
          </label>
          <input
            type="number"
            value={contract.financials?.grandTotal}
            readOnly
            className="w-full p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-sm font-black text-emerald-800 outline-none cursor-not-allowed"
          />
        </div>
      </div>
    </div>

    {/* Payment Method */}
    <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
      <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
        شروط وآلية الدفع
      </h3>
      <div className="space-y-1.5">
        <textarea
          value={contract.paymentTerms}
          onChange={(e) =>
            setContract({ ...contract, paymentTerms: e.target.value })
          }
          className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none leading-relaxed"
          placeholder="مثال: يتم الدفع على دفعات حسب الإنجاز الموضح أدناه..."
        />
      </div>
    </div>
  </div>
);
