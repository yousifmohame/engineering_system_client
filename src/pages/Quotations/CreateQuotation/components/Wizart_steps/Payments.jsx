import React from "react";

// ==========================================
// الخطوة 5: الدفعات
// ==========================================
export const Step5Payments = ({ props }) => {
  const {
    paymentCount,
    setPaymentCount,
    paymentsList,
    acceptedMethods,
    toggleMethod,
    grandTotal,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      
      <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-[11px] font-bold text-slate-700 mb-0">
            عدد الدفعات:
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setPaymentCount(num)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${
                  paymentCount === num
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                الدفعة
              </th>
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                النسبة %
              </th>
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                المبلغ
              </th>
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                الاستحقاق
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentsList.map((p) => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="p-1.5 text-[11px] font-bold text-slate-700">
                  {p.label}
                </td>
                <td className="p-1.5 text-[11px] text-slate-600">
                  {p.percentage}%
                </td>
                <td className="p-1.5 text-[11px] font-bold text-blue-700 font-mono">
                  {p.amount.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ر.س
                </td>
                <td className="p-1.5 text-[10px] text-slate-500">
                  <input
                    type="text"
                    defaultValue={p.condition}
                    className="w-full p-1 bg-transparent border-b border-dashed border-slate-300 outline-none focus:border-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm mt-4">
        <label className="block text-[12px] font-bold text-slate-700 mb-2">
          طرق الدفع المقبولة
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "bank", label: "تحويل بنكي" },
            { id: "cash", label: "نقدي بالمقر" },
            { id: "sadad", label: "سداد" },
          ].map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border transition-colors ${
                acceptedMethods.includes(method.id)
                  ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={acceptedMethods.includes(method.id)}
                onChange={() => toggleMethod(method.id)}
                className="w-3 h-3 text-blue-600 rounded"
              />
              {method.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
