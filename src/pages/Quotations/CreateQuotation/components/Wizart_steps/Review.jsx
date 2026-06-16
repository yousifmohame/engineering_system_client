import React from "react";
import { 
  Loader2, 
  Save, 
  ShieldCheck, 
  FileCheck,
  User,
  Send
} from "lucide-react";
// استدعاء السياق الخاص بالمصادقة
import { useAuth } from "../../../../../context/AuthContext"; 

export const Step8Review = ({ props }) => {
  const { 
    handleSave,        
    saveMutation      
  } = props;

  // جلب بيانات الموظف الحالي من نظام المصادقة
  const { user } = useAuth();

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center max-w-2xl mx-auto gap-6 p-4">
      
      <div className="text-center flex flex-col items-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-emerald-500 blur-[40px] opacity-20 rounded-full animate-pulse"></div>
          <div className="w-24 h-24 bg-gradient-to-br from-[#123f59] to-[#0f3448] rounded-3xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
            <FileCheck className="w-12 h-12 text-[#e2bf74]" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-2 border-white z-20 shadow-lg">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-black text-[#123f59] mb-2">مراجعة واعتماد العرض</h2>
        <p className="text-sm text-[#64748b] font-medium max-w-md mx-auto leading-relaxed">
          لقد قمت بإعداد وتجهيز عرض السعر بنجاح. يمكنك إرساله فوراً للمشرف للاعتماد، أو حفظه كمسودة للعودة إليه لاحقاً.
        </p>
      </div>

      {/* 🟢 بطاقة معلومات منشئ العرض */}
      <div className="w-full max-w-md bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm">
        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <User className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1 text-right">
          <p className="text-[11px] text-slate-500 font-bold mb-0.5">منشئ العرض (الموظف الحالي)</p>
          <p className="text-sm font-black text-[#123f59]">{user?.name || "جاري التحميل..."}</p>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3 mt-2">
        
        {/* 🌟 الزر الرئيسي: حفظ وإرسال للمراجعة */}
        <button
          // نمرر false ليتم حفظه وإرساله كـ (PENDING_APPROVAL)
          onClick={() => handleSave(false)}
          disabled={saveMutation?.isPending}
          className="w-full py-4 px-6 bg-emerald-600 text-white rounded-2xl text-sm font-black cursor-pointer flex justify-center items-center gap-3 hover:bg-emerald-700 hover:shadow-[0_15px_30px_rgba(5,150,105,0.2)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saveMutation?.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-white" />
          ) : (
            <Send className="w-5 h-5 text-white" />
          )}
          {saveMutation?.isPending ? "جاري الحفظ والإرسال..." : "حفظ وإرسال للمشرف للمراجعة"}
        </button>

        {/* 🌟 الزر الثانوي: حفظ كمسودة */}
        <button
          // نمرر true ليتم حفظه كمسودة (DRAFT)
          onClick={() => handleSave(true)}
          disabled={saveMutation?.isPending}
          className="w-full py-3 px-6 bg-white border-2 border-[#123f59] text-[#123f59] rounded-2xl text-sm font-black cursor-pointer flex justify-center items-center gap-3 hover:bg-slate-50 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {saveMutation?.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin text-[#123f59]" />
          ) : (
            <Save className="w-5 h-5 text-[#123f59]" />
          )}
          حفظ العرض كمسودة فقط
        </button>
      </div>

      <div className="mt-2 px-4 py-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start gap-3 max-w-md w-full">
        <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] font-bold text-blue-800 leading-relaxed text-right">
          <strong>إرسال للمشرف:</strong> سيتم توجيه العرض مباشرة للمدير ليقوم بتدقيقه واعتماده وتطبيق الختم الرقمي.<br/>
          <strong>حفظ كمسودة:</strong> سيبقى العرض في ملفاتك الخاصة لتعديله لاحقاً قبل إرساله.
        </p>
      </div>
    </div>
  );
};

export default Step8Review;