import React from "react";
import { 
  Loader2, 
  Save, 
  ShieldCheck, 
  FileCheck
} from "lucide-react";

export const Step8Review = ({ props }) => {
  const { 
    handleSave,        
    saveMutation      
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center max-w-2xl mx-auto gap-6 p-4">
      
      <div className="text-center flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500 blur-[40px] opacity-20 rounded-full animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-[#123f59] to-[#0f3448] rounded-3xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
            <FileCheck className="w-12 h-12 text-[#e2bf74]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white z-20 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-[#123f59] mb-2">مراجعة وحفظ العرض</h2>
        <p className="text-sm text-[#64748b] font-medium max-w-md mx-auto leading-relaxed">
          لقد قمت بإعداد وتجهيز عرض السعر بنجاح. يمكنك الآن حفظه في النظام لمراجعته، وسيكون متاحاً في دليل العروض لإرساله للاعتماد والتوثيق لاحقاً.
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3 mt-4">
        {/* زر الحفظ الرئيسي والوحيد */}
        <button
          // نمرر true ليتم حفظه كمسودة / تحت المراجعة حسب اللوجيك الخاص بك في handleSave
          onClick={() => handleSave(true)}
          disabled={saveMutation?.isPending}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#123f59] to-[#0f3448] text-white rounded-2xl text-sm font-black cursor-pointer flex justify-center items-center gap-3 hover:shadow-[0_15px_30px_rgba(18,63,89,0.2)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saveMutation?.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#e2bf74]" />
          ) : (
            <Save className="w-5 h-5 text-[#e2bf74]" />
          )}
          {saveMutation?.isPending ? "جاري حفظ العرض..." : "حفظ عرض السعر"}
        </button>
      </div>

      <div className="mt-6 px-4 py-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-3 max-w-md w-full">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <p className="text-[10px] font-bold text-blue-800 leading-relaxed">
          بعد الحفظ، يمكنك الذهاب إلى <strong>"دليل عروض الأسعار"</strong> واستخدام خيار "تصدير / اعتماد" لتوليد الوثيقة النهائية وتطبيق الأختام الرقمية.
        </p>
      </div>
    </div>
  );
};

export default Step8Review;