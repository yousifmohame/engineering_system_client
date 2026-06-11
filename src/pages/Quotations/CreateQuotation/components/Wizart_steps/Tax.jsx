import React from "react";

// ==========================================
// الخطوة 4: ملخص الضريبة وتحمل المكتب
// ==========================================
export const Step4Tax = ({ props }) => {
  const {
    officeTaxBearing,
    setOfficeTaxBearing,
    subtotal,
    taxAmount,
    grandTotal,
  } = props;

  // حساب قيمة الخصم إذا كان المكتب يتحمل جزءاً من الضريبة
  const officeDiscount = (taxAmount * (officeTaxBearing || 0)) / 100;
  const finalPayable = grandTotal - officeDiscount;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col text-[#123f59]">
      <div className="p-4 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
        
        {/* قسم تحمل المكتب للضريبة */}
        <div className="mb-5">
          <label className="block text-[12px] font-bold text-[#475569] mb-2.5">
            هل سيتحمل مقدم الخدمة جزءاً من الضريبة كخصم للعميل؟
          </label>
          <div className="flex gap-2">
            {[0, 50, 100].map((val) => (
              <button
                key={val}
                onClick={() => setOfficeTaxBearing(val)}
                className={`flex-1 p-2 rounded-xl text-[11px] font-bold border transition-colors ${
                  officeTaxBearing === val
                    ? "bg-[#123f59] text-white border-[#123f59] shadow-md"
                    : "bg-slate-50 text-[#64748b] border-[#d8b46a]/25 hover:bg-[#fbf8f1]"
                }`}
              >
                {val === 0 ? "العميل يتحمل بالكامل (0%)" : `مقدم الخدمة يتحمل ${val}%`}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
            * يتم حساب نسبة الضريبة لكل بند بشكل مستقل بناءً على إعدادات الخطوة السابقة.
          </p>
        </div>

        {/* الملخص المالي النهائي */}
        <div className="p-4 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl border border-[#e8ddc8]">
          <div className="flex min-w-0 justify-between items-center text-xs mb-2.5 text-[#64748b] font-bold">
            <span>إجمالي الخدمات (قبل الضريبة):</span>
            <strong className="font-mono text-[#123f59]">
              {subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
            </strong>
          </div>
          
          <div className="flex min-w-0 justify-between items-center text-xs mb-2.5 text-[#64748b] font-bold">
            <span>إجمالي ضريبة القيمة المضافة المحسوبة:</span>
            <strong className="font-mono text-orange-600">
              {taxAmount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
            </strong>
          </div>

          {officeTaxBearing > 0 && (
            <div className="flex min-w-0 justify-between items-center text-xs mb-2 text-emerald-600 font-bold bg-emerald-50 p-1.5 rounded">
              <span>خصم (تحمل مقدم الخدمة للضريبة):</span>
              <strong className="font-mono">
                - {officeDiscount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
              </strong>
            </div>
          )}

          <div className="flex min-w-0 justify-between items-center pt-3 mt-3 border-t border-[#d8b46a]/30 text-sm font-black text-[#123f59]">
            <span>الإجمالي النهائي المستحق:</span>
            <span className="font-mono text-lg">
              {finalPayable?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};