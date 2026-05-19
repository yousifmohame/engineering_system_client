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
// الخطوة 4: الضريبة
// ==========================================
export const Step4Tax = ({ props }) => {
  const {
    taxRate,
    setTaxRate,
    officeTaxBearing,
    setOfficeTaxBearing,
    subtotal,
    taxAmount,
    grandTotal,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_6px_18px_rgba(18,63,89,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              نسبة الضريبة %
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-[#c5983c]/70"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[#475569] mb-1.5">
              المكتب يتحمل (% من الضريبة)
            </label>
            <div className="flex gap-1.5">
              {[0, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setOfficeTaxBearing(val)}
                  className={`flex-1 p-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    officeTaxBearing === val
                      ? "bg-[#123f59] text-white border-emerald-600"
                      : "bg-white text-[#64748b] border-[#d8b46a]/25 hover:bg-[#fbf8f1]"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl">
          <div className="flex min-w-0 justify-between text-xs mb-1.5 text-slate-600">
            <span>إجمالي قبل الضريبة:</span>
            <strong className="font-mono">
              {subtotal.toLocaleString()} ر.س
            </strong>
          </div>
          <div className="flex min-w-0 justify-between text-xs mb-1.5 text-slate-600">
            <span>ضريبة ({taxRate}%):</span>
            <strong className="font-mono">
              {taxAmount.toLocaleString()} ر.س
            </strong>
          </div>
          <div className="flex min-w-0 justify-between pt-2 mt-2 border-t border-[#d8b46a]/25 text-sm font-black text-[#123f59]">
            <span>الإجمالي شامل:</span>
            <span className="font-mono">{grandTotal.toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>
    </div>
  );
};
