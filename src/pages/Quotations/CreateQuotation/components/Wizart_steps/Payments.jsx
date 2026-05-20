import React from "react";
const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

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
    <div className="animate-in fade-in duration-300 h-full flex flex-col text-[#123f59]">
      
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 mb-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim">
        <div className="flex min-w-0 items-center gap-3 mb-3">
          <label className="text-[11px] font-bold text-[#475569] mb-0">
            عدد الدفعات:
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setPaymentCount(num)}
                className={`w-8 h-8 rounded-xl border text-xs font-bold transition-colors ${
                  paymentCount === num
                    ? "bg-[#0e7490] text-white border-[#0e7490]"
                    : "bg-white text-[#64748b] border-[#d8b46a]/25 hover:bg-[#fbf8f1]"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b border-[#d8b46a]/25">
              <th className="p-1.5 text-[10px] text-[#64748b] font-bold">
                الدفعة
              </th>
              <th className="p-1.5 text-[10px] text-[#64748b] font-bold">
                النسبة %
              </th>
              <th className="p-1.5 text-[10px] text-[#64748b] font-bold">
                المبلغ
              </th>
              <th className="p-1.5 text-[10px] text-[#64748b] font-bold">
                الاستحقاق
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentsList.map((p) => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="p-1.5 text-[11px] font-bold text-[#475569]">
                  {p.label}
                </td>
                <td className="p-1.5 text-[11px] text-[#64748b]">
                  {p.percentage}%
                </td>
                <td className="p-1.5 text-[11px] font-bold text-[#123f59] font-mono">
                  {p.amount.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ر.س
                </td>
                <td className="p-1.5 text-[10px] text-[#64748b]">
                  <input
                    type="text"
                    defaultValue={p.condition}
                    className="w-full p-1 bg-transparent border-b border-dashed border-[#d8b46a]/25 outline-none focus:border-[#c5983c]/70"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] mt-4">
        <label className="block text-[12px] font-bold text-[#475569] mb-2">
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
              className={`flex min-w-0 items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] cursor-pointer border transition-colors ${
                acceptedMethods.includes(method.id)
                  ? "bg-[#eef7f6] border-blue-300 text-[#123f59] font-bold"
                  : "bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-[#d8b46a]/25 text-[#64748b]"
              }`}
            >
              <input
                type="checkbox"
                checked={acceptedMethods.includes(method.id)}
                onChange={() => toggleMethod(method.id)}
                className="w-3 h-3 text-[#123f59] rounded"
              />
              {method.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};
