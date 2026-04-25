import React from "react";

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
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              نسبة الضريبة %
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              المكتب يتحمل (% من الضريبة)
            </label>
            <div className="flex gap-1.5">
              {[0, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setOfficeTaxBearing(val)}
                  className={`flex-1 p-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    officeTaxBearing === val
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="flex justify-between text-xs mb-1.5 text-slate-600">
            <span>إجمالي قبل الضريبة:</span>
            <strong className="font-mono">
              {subtotal.toLocaleString()} ر.س
            </strong>
          </div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-600">
            <span>ضريبة ({taxRate}%):</span>
            <strong className="font-mono">
              {taxAmount.toLocaleString()} ر.س
            </strong>
          </div>
          <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 text-sm font-black text-blue-700">
            <span>الإجمالي شامل:</span>
            <span className="font-mono">{grandTotal.toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>
    </div>
  );
};
