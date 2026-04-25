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
    <div className="animate-in fade-in duration-300 h-full flex flex-col max-w-2xl mx-auto gap-4 overflow-y-auto custom-scrollbar pr-2 pb-8">
      
      {/* 1️⃣ رسالة توجيهية */}
      <div className="text-center mb-2 flex-shrink-0">
        <div className="inline-flex p-3 bg-blue-50 rounded-full mb-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
        </div>
        <h3 className="text-base font-black text-slate-800 mb-1">المراجعة النهائية والمصادقة</h3>
        <p className="text-[12px] text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
          اختر وسيلة الختم الرسمية. سيتم دمج الختم المختار آلياً مع الوثيقة لضمان الموثوقية.
        </p>
      </div>

      {/* 2️⃣ خيارات الختم والأمان */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-shrink-0">
        <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stamp className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-800">طريقة المصادقة والختم</span>
          </div>
          {stampType !== "NONE" && (
             <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                حماية نشطة
             </span>
          )}
        </div>

        <div className="p-4 grid grid-cols-1 gap-4">
          
          {/* الخيار الأول: بدون ختم (مسودة) */}
          <div 
            onClick={() => setStampType && setStampType("NONE")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-4 ${
              stampType === "NONE" 
                ? "border-slate-400 bg-slate-50 shadow-sm" 
                : "border-slate-100 bg-white hover:border-slate-200"
            }`}
          >
            <div className="flex-shrink-0">
               {stampType === "NONE" ? <CheckCircle2 className="w-6 h-6 text-slate-600" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
            </div>
            <div>
              <div className={`text-sm font-bold ${stampType === "NONE" ? "text-slate-800" : "text-slate-600"}`}>بدون ختم إلكتروني</div>
              <div className="text-[11px] text-slate-500 mt-0.5 font-medium">عرض سعر "مسودة" للاستخدام الداخلي فقط ولا يحمل صفة رسمية.</div>
            </div>
          </div>

          {/* الخيار الثاني: الختم المشفر (الاحترافي) */}
          <div 
            onClick={() => setStampType && setStampType("SECURE_QR")}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col relative overflow-hidden ${
              stampType === "SECURE_QR" 
                ? "border-blue-600 bg-blue-50/20 shadow-md" 
                : "border-slate-100 bg-white hover:border-blue-100"
            }`}
          >
            {/* الخلفية الجمالية */}
            {stampType === "SECURE_QR" && <ShieldCheck className="absolute -left-6 -top-6 w-32 h-32 text-blue-600/5 pointer-events-none" />}
            
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0 mt-1">
                 {stampType === "SECURE_QR" ? <CheckCircle2 className="w-6 h-6 text-blue-600" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-200" />}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-bold flex items-center gap-2 ${stampType === "SECURE_QR" ? "text-blue-900" : "text-slate-700"}`}>
                  <FileLock2 className="w-4 h-4" /> ختم المكتب المشفّر (نظام التحقق الذكي)
                  <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded uppercase tracking-wider">رسمي</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 font-medium leading-relaxed">
                  سيتم توليد بصمة رقمية فريدة لكل وثيقة مرتبطة بـ QR Code لا يمكن تكراره أو التلاعب به.
                </p>
              </div>
            </div>
            
            {/* معاينة الختم البرمجي - تظهر فقط عند الاختيار */}
            {stampType === "SECURE_QR" && (
              <div className="mt-2 p-4 bg-white rounded-xl border border-blue-100 shadow-inner animate-in slide-in-from-top-2 duration-300">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  {/* استدعاء مكون الختم SVG */}
                  <div className="flex flex-col items-center gap-2">
                    <OfficialStamp size={110} rotation={-10} />
                    <span className="text-[9px] font-bold text-slate-400">معاينة الختم الحي</span>
                  </div>

                  {/* تفاصيل التشفير */}
                  <div className="flex-1 space-y-2 w-full">
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100 group">
                      <QrCode className="w-8 h-8 text-slate-800" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800">QR-Verification Code</span>
                        <span className="text-[8px] font-mono text-slate-500">HTTPS://VERIFY.BLACKCUBE.SA/QT-8492</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                      <ScanBarcode className="w-8 h-8 text-slate-800" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-800">Digital Barcode</span>
                        <span className="text-[8px] font-mono text-slate-500">815-QT-2024-00192-X9</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <Fingerprint className="w-3 h-3 text-emerald-500" />
                      <span className="text-[9px] font-bold text-emerald-600 uppercase">Document integrity encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 3️⃣ أزرار الإجراءات */}
      <div className="mt-4 pt-6 border-t border-slate-200 flex-shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={saveMutation?.isPending}
            className="w-full py-4 px-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-2xl text-xs font-black cursor-pointer flex justify-center items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> حفظ كمسودة
          </button>
          
          <button
            onClick={() => handleSave(false)}
            disabled={saveMutation?.isPending}
            className="w-full py-4 px-4 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 border-none rounded-2xl text-xs font-black cursor-pointer flex justify-center items-center gap-2 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {saveMutation?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {stampType === "SECURE_QR" ? "ختم وإصدار الوثيقة الرسمية" : "إعتماد وإرسال العرض"}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-4 font-medium italic">
          بمجرد الضغط على إصدار، سيتم تسجيل هذا العرض في سجلات المكتب الرسمية.
        </p>
      </div>

    </div>
  );
};

export default Step8Review;