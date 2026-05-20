import React, { useState } from "react";
import { 
  Loader2, 
  Save, 
  Send, 
  Stamp, 
  ShieldCheck, 
  QrCode, 
  ScanBarcode, 
  Fingerprint,
  CheckCircle2,
  FileLock2,
  RotateCcw
} from "lucide-react";
import {OfficialStamp} from "../../../../../components/OfficialStamp/OfficialStamp";
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
// ثانياً: الخطوة 8: الاعتماد، الختم المشفر، والإرسال
// ==========================================
export const Step8Review = ({ props }) => {
  const { 
    handleSave, 
    saveMutation,
    stampType = "SECURE_QR", 
    setStampType 
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col max-w-2xl mx-auto gap-3 overflow-y-auto overflow-x-hidden custom-scrollbar-slim pr-2 pb-8">
      
      {/* 1️⃣ رسالة توجيهية */}
      <div className="text-center mb-2 flex-shrink-0">
        <div className="inline-flex p-3 bg-[#eef7f6] rounded-full mb-3">
          <IconWithText icon={ShieldCheck} iconClassName="w-8 h-8 text-[#123f59]" />
        </div>
        <h3 className="text-base font-black text-[#123f59] mb-1">المراجعة النهائية والمصادقة</h3>
        <p className="text-[12px] text-[#64748b] font-medium max-w-sm mx-auto leading-relaxed">
          اختر وسيلة الختم الرسمية. سيتم دمج الختم المختار آلياً مع الوثيقة لضمان الموثوقية.
        </p>
      </div>

      {/* 2️⃣ خيارات الختم والأمان */}
      <div className="bg-white rounded-[20px] border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] overflow-hidden flex flex-col flex-shrink-0">
        <div className="px-3.5 py-3 bg-[#fbf8f1]/80 border-b border-[#d8b46a]/25 flex min-w-0 items-center justify-between">
          <div className="flex min-w-0 items-center gap-2">
            <Stamp className="w-4 h-4 text-[#64748b]" />
            <span className="text-sm font-bold text-[#123f59]">طريقة المصادقة والختم</span>
          </div>
          {stampType !== "NONE" && (
             <span className="text-[10px] font-black text-[#0f766e] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                حماية نشطة
             </span>
          )}
        </div>

        <div className="p-3 grid grid-cols-1 gap-3">
          
          {/* الخيار الأول: بدون ختم (مسودة) */}
          <div 
            onClick={() => setStampType && setStampType("NONE")}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex min-w-0 items-center gap-3 ${
              stampType === "NONE" 
                ? "border-[#d8b46a]/35 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white shadow-[0_8px_22px_rgba(18,63,89,0.06)]" 
                : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/25"
            }`}
          >
            <div className="flex-shrink-0">
               {stampType === "NONE" ? <CheckCircle2 className="w-6 h-6 text-[#64748b]" /> : <div className="w-6 h-6 rounded-full border-2 border-[#d8b46a]/25" />}
            </div>
            <div>
              <div className={`text-sm font-bold ${stampType === "NONE" ? "text-[#123f59]" : "text-[#64748b]"}`}>بدون ختم إلكتروني</div>
              <div className="text-[11px] text-[#64748b] mt-0.5 font-medium">عرض سعر "مسودة" للاستخدام الداخلي فقط ولا يحمل صفة رسمية.</div>
            </div>
          </div>

          {/* الخيار الثاني: الختم المشفر (الاحترافي) */}
          <div 
            onClick={() => setStampType && setStampType("SECURE_QR")}
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex flex-col relative overflow-hidden ${
              stampType === "SECURE_QR" 
                ? "border-[#15536f] bg-[#eef7f6]/20 shadow-[0_8px_18px_rgba(18,63,89,0.08)]" 
                : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/25"
            }`}
          >
            {/* الخلفية الجمالية */}
            {stampType === "SECURE_QR" && <ShieldCheck className="absolute -left-6 -top-6 w-32 h-24 text-[#123f59]/5 pointer-events-none" />}
            
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0 mt-1">
                 {stampType === "SECURE_QR" ? <CheckCircle2 className="w-6 h-6 text-[#123f59]" /> : <div className="w-6 h-6 rounded-full border-2 border-[#d8b46a]/25" />}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold flex min-w-0 items-center gap-2 ${stampType === "SECURE_QR" ? "text-[#123f59]" : "text-[#475569]"}`}>
                  <FileLock2 className="w-4 h-4" /> ختم المكتب المشفّر (نظام التحقق الذكي)
                  <span className="px-2 py-0.5 bg-[#123f59] text-white text-[9px] font-black rounded uppercase tracking-wider">رسمي</span>
                </div>
                <p className="text-[11px] text-[#64748b] mt-1 font-medium leading-relaxed">
                  سيتم توليد بصمة رقمية فريدة لكل وثيقة مرتبطة بـ QR Code لا يمكن تكراره أو التلاعب به.
                </p>
              </div>
            </div>
            
            {/* معاينة الختم البرمجي - تظهر فقط عند الاختيار */}
            {stampType === "SECURE_QR" && (
              <div className="mt-2 p-3 bg-white rounded-xl border border-[#d8b46a]/25 shadow-inner animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  {/* استدعاء مكون الختم SVG */}
                  <div className="flex flex-col items-center gap-2">
                    <OfficialStamp size={110} rotation={-10} />
                    <span className="text-[9px] font-bold text-[#94a3b8]">معاينة الختم الحي</span>
                  </div>

                  {/* تفاصيل التشفير */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex min-w-0 items-center gap-3 p-2 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl border border-[#e8ddc8] group">
                      <QrCode className="w-8 h-8 text-[#123f59]" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#123f59]">QR-Verification Code</span>
                        <span className="text-[8px] font-mono text-[#64748b]">HTTPS://VERIFY.BLACKCUBE.SA/QT-8492</span>
                      </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-3 p-2 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl border border-[#e8ddc8]">
                      <ScanBarcode className="w-8 h-8 text-[#123f59]" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-[#123f59]">Digital Barcode</span>
                        <span className="text-[8px] font-mono text-[#64748b]">815-QT-2024-00192-X9</span>
                      </div>
                    </div>
                    <div className="flex min-w-0 items-center gap-2 px-1">
                      <Fingerprint className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-bold text-[#0f766e] uppercase">Document integrity encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3️⃣ أزرار الإجراءات */}
      <div className="mt-4 pt-6 border-t border-[#d8b46a]/25 flex-shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={saveMutation?.isPending}
            className="w-full py-3 px-4 bg-white border-2 border-[#d8b46a]/25 text-[#475569] hover:bg-[#fbf8f1] hover:border-[#d8b46a]/25 rounded-[20px] text-xs font-black cursor-pointer flex justify-center items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> حفظ كمسودة
          </button>
          
          <button
            onClick={() => handleSave(false)}
            disabled={saveMutation?.isPending}
            className="w-full py-3 px-4 bg-[#123f59] text-white hover:bg-[#0f3448] shadow-[0_10px_24px_rgba(18,63,89,0.10)]  border-none rounded-[20px] text-xs font-black cursor-pointer flex justify-center items-center gap-2 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saveMutation?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {stampType === "SECURE_QR" ? "ختم وإصدار الوثيقة الرسمية" : "إعتماد وإرسال العرض"}
          </button>
        </div>
        <p className="text-center text-[10px] text-[#94a3b8] mt-4 font-medium italic">
          بمجرد الضغط على إصدار، سيتم تسجيل هذا العرض في سجلات المكتب الرسمية.
        </p>
      </div>

    </div>
  );
};

export default Step8Review;