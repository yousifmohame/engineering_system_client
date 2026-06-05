// ContractSteps.jsx
import React from "react";
import { DollarSign, Link as LinkIcon } from "lucide-react";

export const Step3Financials = ({ contract, setContract }) => (
  <div className="space-y-4 animate-in slide-in-from-right-4">
    {/* Financial Summary */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2 border-b border-[#e7eef2] pb-3">
        <DollarSign className="w-4 h-4 text-[#0f6d7c]" /> قيمة العقد والملخص
        المالي
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
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
            className="w-full p-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            قيمة الضريبة (15%)
          </label>
          <input
            type="number"
            value={contract.financials?.taxAmount}
            readOnly
            className="w-full p-2 bg-slate-100 border border-[#d8e6ee] rounded-xl text-[13px] font-bold text-[#71839a] outline-none cursor-not-allowed"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] font-black text-[#123B5D]">
            الإجمالي الشامل (ريال)
          </label>
          <input
            type="number"
            value={contract.financials?.grandTotal}
            readOnly
            className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] font-black text-emerald-800 outline-none cursor-not-allowed"
          />
        </div>
      </div>
    </div>

    {/* Payment Method */}
    <div className="p-4 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm space-y-4">
      <h3 className="text-[13px] font-black text-[#123B5D] flex items-center gap-2 border-b border-[#e7eef2] pb-3">
        شروط وآلية الدفع
      </h3>
      <div className="space-y-1.5">
        <textarea
          value={contract.paymentTerms}
          onChange={(e) =>
            setContract({ ...contract, paymentTerms: e.target.value })
          }
          className="w-full h-24 p-4 bg-[#f7fbfd] border border-[#d8e6ee] rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-[#d9b85b]/20 outline-none resize-none leading-relaxed"
          placeholder="مثال: يتم الدفع على دفعات حسب الإنجاز الموضح أدناه..."
        />
      </div>
    </div>
  </div>
);
