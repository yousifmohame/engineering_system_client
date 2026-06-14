import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { 
  Building2, 
  Copy, 
  Loader2, 
  CheckCircle2, 
  Share2, 
  Check, 
  ShieldCheck 
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner"; // 👈 تأكد من استخدام مكتبة التوست الخاصة بك

export default function SharedBankAccount() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 🚀 تتبع الحقل الذي تم نسخه لتغيير الأيقونة
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    api
      .get(`/bank-accounts/public/${id}`)
      .then((res) => {
        if (res.data.success) setAccount(res.data.data);
        else setError("الحساب غير موجود");
      })
      .catch(() => setError("عذراً، الرابط غير صالح أو تم حذفه."))
      .finally(() => setIsLoading(false));
  }, [id]);

  // 🚀 دالة النسخ الاحترافية مع التغذية البصرية
  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    
    // تغيير الأيقونة إلى (صح)
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);

    // إظهار إشعار توست
    toast.success(`تم نسخ ${fieldName} بنجاح`);
  };

  // 🚀 دالة مشاركة الرابط
  const handleShare = async () => {
    const publicUrl = window.location.href;
    const shareData = {
      title: `بيانات الحساب البنكي - ${account.bankName}`,
      text: `تفضل بيانات الحساب البنكي المعتمدة لـ ${account.accountNameAr || account.bankName}`,
      url: publicUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // بديل في حال المتصفح لا يدعم المشاركة
        await navigator.clipboard.writeText(publicUrl);
        toast.success("تم نسخ الرابط! يمكنك الآن مشاركته.");
      }
    } catch (error) {
      console.error("تم إلغاء المشاركة أو حدث خطأ:", error);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
          <span className="text-sm font-bold text-slate-500 animate-pulse">جاري تحميل البيانات...</span>
        </div>
      </div>
    );

  if (error || !account)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100 max-w-sm w-full animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">عذراً!</h2>
          <p className="text-slate-500 font-bold leading-relaxed">{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-slate-100 flex justify-center pb-10 font-[Tajawal]"
      dir="rtl"
    >
      {/* Container مقيد ليكون بشكل الموبايل دائماً */}
      <div className="w-full max-w-md bg-slate-50 min-h-screen shadow-2xl relative flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {/* الهيدر العلوي */}
        <div className="bg-gradient-to-b from-violet-700 to-violet-600 text-white pt-12 pb-10 px-6 relative rounded-b-[2.5rem] shadow-[0_10px_30px_rgba(124,58,237,0.15)] shrink-0">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden rounded-b-[2.5rem] opacity-20 pointer-events-none">
            {/* زخرفة بصرية للخلفية */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-violet-400 rounded-full blur-3xl"></div>
          </div>

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 p-2 shadow-inner border border-white/20">
              {account.bankLogo ? (
                <img
                  src={account.bankLogo}
                  alt="Bank Logo"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              ) : (
                <Building2 className="w-10 h-10 text-white" />
              )}
            </div>
            <h2 className="font-black text-2xl mb-1 tracking-tight">{account.bankName}</h2>
            <p className="text-xs font-bold text-violet-200 bg-white/10 px-3 py-1 rounded-full mt-2">
              بيانات التحويل البنكي المعتمدة
            </p>
          </div>
        </div>

        {/* الكروت القابلة للنسخ */}
        <div className="flex-1 px-5 space-y-3 -mt-5 z-10 relative">
          
          {/* الاسم بالعربي */}
          {(account.accountNameAr || account.accountName) && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="min-w-0 flex-1 pl-3">
                <p className="text-[10px] text-slate-400 font-bold mb-1">
                  اسم المستفيد (بالعربي)
                </p>
                <p className="font-black text-[14px] text-slate-800 truncate">
                  {account.accountNameAr || account.accountName}
                </p>
              </div>
              <button
                onClick={() => handleCopy(account.accountNameAr || account.accountName, "الاسم بالعربي")}
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  copiedField === "الاسم بالعربي" 
                  ? "bg-emerald-50 text-emerald-600 scale-95" 
                  : "bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 active:scale-95"
                }`}
              >
                {copiedField === "الاسم بالعربي" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* الاسم بالإنجليزي */}
          {account.accountNameEn && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="min-w-0 flex-1 pr-3" dir="ltr">
                <p className="text-[10px] text-slate-400 font-bold mb-1 text-left">
                  Beneficiary Name
                </p>
                <p className="font-black text-[14px] text-slate-800 truncate text-left">
                  {account.accountNameEn}
                </p>
              </div>
              <button
                onClick={() => handleCopy(account.accountNameEn, "الاسم بالإنجليزي")}
                className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                  copiedField === "الاسم بالإنجليزي" 
                  ? "bg-emerald-50 text-emerald-600 scale-95" 
                  : "bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 active:scale-95"
                }`}
              >
                {copiedField === "الاسم بالإنجليزي" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* رقم الحساب */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
            <div className="min-w-0 flex-1 pr-3" dir="ltr">
              <p className="text-[10px] text-slate-400 font-bold mb-1 text-left">
                Account Number / رقم الحساب
              </p>
              <p className="font-mono font-black text-lg text-slate-800 tracking-widest text-left">
                {account.accountNumber}
              </p>
            </div>
            <button
              onClick={() => handleCopy(account.accountNumber, "رقم الحساب")}
              className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                copiedField === "رقم الحساب" 
                ? "bg-emerald-50 text-emerald-600 scale-95" 
                : "bg-slate-50 hover:bg-violet-50 text-slate-500 hover:text-violet-600 active:scale-95"
              }`}
            >
              {copiedField === "رقم الحساب" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>

          {/* IBAN */}
          {account.iban && (
            <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-200 shadow-sm flex items-center justify-between relative overflow-hidden">
              {/* شريط زينة جانبي */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-500"></div>
              
              <div className="min-w-0 flex-1 pr-3 pl-2" dir="ltr">
                <p className="text-[10px] text-violet-600 font-black mb-1 text-left uppercase">
                  IBAN / رقم الآيبان
                </p>
                <p className="font-mono font-black text-[17px] text-violet-900 tracking-[0.15em] break-all leading-tight text-left">
                  {account.iban}
                </p>
              </div>
              <button
                onClick={() => handleCopy(account.iban, "رقم الآيبان")}
                className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-md transition-all ${
                  copiedField === "رقم الآيبان" 
                  ? "bg-emerald-500 text-white scale-95 shadow-emerald-500/20" 
                  : "bg-violet-600 hover:bg-violet-700 text-white active:scale-95 shadow-violet-600/30"
                }`}
              >
                {copiedField === "رقم الآيبان" ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          )}

        </div>

        {/* 🚀 قسم الإجراءات السفلية */}
        <div className="px-6 pt-2 pb-8 flex flex-col items-center gap-4 bg-white mt-auto rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          
          {/* زر المشاركة */}
          <button 
            onClick={handleShare}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20"
          >
            <Share2 className="w-4 h-4" />
            مشاركة بيانات الحساب
          </button>

          {/* شارة التوثيق */}
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] bg-emerald-50/80 px-4 py-2 rounded-full border border-emerald-100">
            <ShieldCheck className="w-4 h-4" /> تم التحقق من صحة وموثوقية الحساب
          </div>
        </div>

      </div>
    </div>
  );
}