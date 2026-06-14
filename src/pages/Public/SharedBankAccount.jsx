import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Building2, Copy, Loader2, CheckCircle2 } from "lucide-react";
import api from "../../api/axios"; // استخدم axios المباشر هنا أو عبر api/axios

export default function SharedBankAccount() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // 💡 يجب أن يكون هذا الرابط هو المسار العام الذي أضفته في الباك إند
    api
      .get(`/bank-accounts/public/${id}`)
      .then((res) => {
        if (res.data.success) setAccount(res.data.data);
        else setError("الحساب غير موجود");
      })
      .catch(() => setError("عذراً، الرابط غير صالح أو تم حذفه."))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("تم النسخ بنجاح!");
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );

  if (error || !account)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-black text-slate-800 mb-2">عفواً</h2>
          <p className="text-slate-500 font-bold">{error}</p>
        </div>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-slate-50 flex justify-center pb-10"
      dir="rtl"
    >
      {/* Container مقيد ليكون بشكل الموبايل دائماً */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        {/* الهيدر العلوي */}
        <div className="bg-violet-600 text-white pt-12 pb-8 px-6 relative rounded-b-[2.5rem] shadow-lg shrink-0">
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-4 p-2 shadow-inner">
              {account.bankLogo ? (
                <img
                  src={account.bankLogo}
                  alt="Bank Logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-10 h-10 text-violet-300" />
              )}
            </div>
            <h2 className="font-black text-2xl mb-1">{account.bankName}</h2>
            <p className="text-sm font-semibold text-violet-200">
              بيانات التحويل البنكي المعتمدة
            </p>
          </div>
        </div>

        {/* الكروت القابلة للنسخ */}
        <div className="flex-1 p-6 space-y-4 -mt-4 z-10 relative">
          {/* الاسم بالعربي */}
          {(account.accountNameAr || account.accountName) && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md flex items-center justify-between">
              <div className="min-w-0 flex-1 pl-3">
                <p className="text-[11px] text-slate-400 font-bold mb-1">
                  اسم الحساب المستفيد (بالعربي)
                </p>
                <p className="font-black text-[15px] text-slate-800 truncate">
                  {account.accountNameAr || account.accountName}
                </p>
              </div>
              <button
                onClick={() =>
                  handleCopy(account.accountNameAr || account.accountName)
                }
                className="shrink-0 w-12 h-12 bg-violet-50 hover:bg-violet-100 active:scale-95 text-violet-600 rounded-xl flex items-center justify-center transition-all"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* الاسم بالإنجليزي */}
          {account.accountNameEn && (
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3" dir="ltr">
                <p className="text-[11px] text-slate-400 font-bold mb-1 text-left">
                  Beneficiary Name (English)
                </p>
                <p className="font-black text-[15px] text-slate-800 truncate text-left">
                  {account.accountNameEn}
                </p>
              </div>
              <button
                onClick={() => handleCopy(account.accountNameEn)}
                className="shrink-0 w-12 h-12 bg-violet-50 hover:bg-violet-100 active:scale-95 text-violet-600 rounded-xl flex items-center justify-center transition-all"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* رقم الحساب */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3" dir="ltr">
              <p className="text-[11px] text-slate-400 font-bold mb-1 text-left">
                Account Number / رقم الحساب
              </p>
              <p className="font-mono font-black text-xl text-slate-800 tracking-widest text-left">
                {account.accountNumber}
              </p>
            </div>
            <button
              onClick={() => handleCopy(account.accountNumber)}
              className="shrink-0 w-12 h-12 bg-violet-50 hover:bg-violet-100 active:scale-95 text-violet-600 rounded-xl flex items-center justify-center transition-all"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>

          {/* IBAN */}
          {account.iban && (
            <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-200 shadow-md flex items-center justify-between">
              <div className="min-w-0 flex-1 pr-3" dir="ltr">
                <p className="text-[11px] text-violet-500 font-bold mb-1 text-left">
                  IBAN / رقم الآيبان
                </p>
                <p className="font-mono font-black text-lg text-violet-900 tracking-wider break-all leading-tight text-left">
                  {account.iban}
                </p>
              </div>
              <button
                onClick={() => handleCopy(account.iban)}
                className="shrink-0 w-12 h-12 bg-violet-600 hover:bg-violet-700 active:scale-95 text-white rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/30 transition-all"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 pb-8 flex flex-col items-center justify-center gap-1">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
            <CheckCircle2 className="w-4 h-4" /> حساب بنكي موثق
          </div>
        </div>
      </div>
    </div>
  );
}
