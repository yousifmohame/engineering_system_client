import React, { useEffect } from "react";
import {
  AlertTriangle,
  Building,
  Landmark,
  Loader2,
  QrCode,
} from "lucide-react"; // 👈 إضافة QrCode
import { useQuery } from "@tanstack/react-query";
import axios from "../../../../../api/axios";

// ==========================================
// الخطوة 5: الدفعات
// ==========================================
export const Step5Payments = ({ props }) => {
  const {
    paymentCount,
    setPaymentCount,
    paymentsList,
    setPaymentsList,
    acceptedMethods,
    toggleMethod,
    finalPayable = 0,
    selectedBankAccounts = [],
    setSelectedBankAccounts,
    bankAccountsData = [],
    setBankAccountsData,
  } = props;

  // 🚀 جلب الحسابات البنكية من الباك إند
  const { data: fetchedBanks = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: async () => {
      const res = await axios.get("/bank-accounts");
      return res.data?.data || [];
    },
  });

  // 🚀 تحديث بيانات الحسابات مع الاحتفاظ بالشعار والآيبان
  // 🚀 تحديث بيانات الحسابات مع الاحتفاظ بالشعار والآيبان والـ QR Code
  useEffect(() => {
    if (fetchedBanks.length > 0 && setBankAccountsData) {
      const formattedBanks = fetchedBanks.map((bank) => ({
        id: bank.id,
        name: bank.bankName,
        accountName: bank.bankName, 
        accountNameAr: bank.accountNameAr,
        accountNameEn: bank.accountNameEn,
        accountNumber: bank.accountNumber,
        iban: bank.iban,
        logo: bank.bankLogo, // 👈 حفظ اللوجو
        qrCodeData: bank.qrCodeData, // 👈 🌟 السطر الجديد: جلب وحفظ الـ QR Code
        account: bank.iban || bank.accountNumber,
      }));
      setBankAccountsData(formattedBanks);
    }
  }, [fetchedBanks, setBankAccountsData]);

  const totalQuotationAmount =
    finalPayable > 0
      ? finalPayable
      : paymentsList.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

  const handleConditionChange = (id, newCondition) => {
    setPaymentsList(
      paymentsList.map((p) =>
        p.id === id ? { ...p, condition: newCondition } : p,
      ),
    );
  };

  const handlePercentageChange = (id, newPct) => {
    const parsedPct = parseFloat(newPct) || 0;
    const newAmount =
      totalQuotationAmount > 0 ? (parsedPct / 100) * totalQuotationAmount : 0;
    setPaymentsList(
      paymentsList.map((p) =>
        p.id === id
          ? { ...p, percentage: newPct, amount: newAmount.toFixed(2) }
          : p,
      ),
    );
  };

  const handleAmountChange = (id, newAmt) => {
    const parsedAmt = parseFloat(newAmt) || 0;
    const newPct =
      totalQuotationAmount > 0 ? (parsedAmt / totalQuotationAmount) * 100 : 0;
    setPaymentsList(
      paymentsList.map((p) =>
        p.id === id
          ? { ...p, amount: newAmt, percentage: newPct.toFixed(2) }
          : p,
      ),
    );
  };

  const toggleBankAccount = (id) => {
    if (!setSelectedBankAccounts) return;
    setSelectedBankAccounts((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const totalPercentage = paymentsList.reduce(
    (sum, p) => sum + (parseFloat(p.percentage) || 0),
    0,
  );
  const isTotalValid = Math.abs(totalPercentage - 100) <= 0.1;

  const PAYMENT_METHODS = [
    { id: "bank", label: "تحويل بنكي" },
    { id: "cash", label: "نقدي" },
    { id: "sadad", label: "رقم سداد" },
    { id: "pos", label: "دفع الكترونى POS" },
  ];

  return (
    <div className="animate-in fade-in duration-300 flex flex-col text-[#123f59] pb-4">
      {/* 🌟 جدول توزيع الدفعات (كما هو) */}
      <div className="p-3 bg-white rounded-xl border border-[#d8b46a]/25 mb-4 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim relative">
        <div className="flex min-w-0 items-center gap-3 mb-4 border-b border-slate-100 pb-3">
          <label className="text-[11px] font-bold text-[#475569] mb-0">
            عدد الدفعات:
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setPaymentCount(num)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${paymentCount === num ? "bg-[#0e7490] text-white border-[#0e7490] shadow-md" : "bg-white text-[#64748b] border-[#d8b46a]/25 hover:bg-[#fbf8f1]"}`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-y border-[#d8b46a]/25">
              <th className="p-2 text-[10px] text-[#64748b] font-bold">
                الدفعة
              </th>
              <th className="p-2 text-[10px] text-[#64748b] font-bold text-center">
                النسبة %
              </th>
              <th className="p-2 text-[10px] text-[#64748b] font-bold text-center">
                المبلغ (ر.س)
              </th>
              <th className="p-2 text-[10px] text-[#64748b] font-bold w-1/3">
                الاستحقاق (متى تُدفع؟)
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentsList.map((p) => (
              <tr
                key={p.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="p-2 text-[11px] font-bold text-[#475569] whitespace-nowrap">
                  {p.label}
                </td>
                <td className="p-2">
                  <div className="flex justify-center items-center gap-1">
                    <input
                      type="number"
                      value={p.percentage}
                      onChange={(e) =>
                        handlePercentageChange(p.id, e.target.value)
                      }
                      className="w-16 p-1.5 text-center bg-white border border-[#d8b46a]/40 rounded-lg text-[11px] font-bold text-[#123f59] outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all"
                    />
                    <span className="text-[10px] text-slate-400">%</span>
                  </div>
                </td>
                <td className="p-2">
                  <input
                    type="number"
                    value={p.amount}
                    onChange={(e) => handleAmountChange(p.id, e.target.value)}
                    className="w-full min-w-[80px] p-1.5 text-center bg-white border border-[#d8b46a]/40 rounded-lg text-[11px] font-black text-emerald-700 outline-none focus:border-[#0e7490] focus:ring-1 focus:ring-[#0e7490] transition-all font-mono"
                  />
                </td>
                <td className="p-2">
                  <input
                    type="text"
                    value={p.condition}
                    onChange={(e) =>
                      handleConditionChange(p.id, e.target.value)
                    }
                    placeholder="مثال: عند التعاقد..."
                    className="w-full p-1.5 bg-transparent border-b border-dashed border-slate-300 text-[10.5px] font-bold text-[#475569] outline-none focus:border-[#0e7490] transition-colors"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!isTotalValid && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span className="text-[10px] font-bold">
              تنبيه: مجموع نسب الدفعات الحالية هو ({totalPercentage.toFixed(1)}
              %). يجب أن يكون المجموع الكلي 100% بالضبط.
            </span>
          </div>
        )}
      </div>

      {/* 🌟 طرق الدفع والحسابات البنكية */}
      <div className="p-4 bg-white rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] shrink-0">
        <label className="block text-[11.5px] font-black text-[#123f59] mb-3">
          طرق وقنوات الدفع المعتمدة
        </label>
        <div className="flex gap-2 flex-wrap mb-1">
          {PAYMENT_METHODS.map((method) => (
            <label
              key={method.id}
              className={`flex min-w-0 items-center gap-2 px-3 py-2 rounded-xl text-[10.5px] cursor-pointer border transition-colors select-none ${acceptedMethods.includes(method.id) ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-bold shadow-sm" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-white hover:border-indigo-200"}`}
            >
              <input
                type="checkbox"
                checked={acceptedMethods.includes(method.id)}
                onChange={() => toggleMethod(method.id)}
                className="hidden"
              />
              <div
                className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${acceptedMethods.includes(method.id) ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-300"}`}
              >
                {acceptedMethods.includes(method.id) && (
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              {method.label}
            </label>
          ))}
        </div>

        {acceptedMethods.includes("bank") && (
          <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-900">
                <Landmark className="w-3.5 h-3.5" /> اختر الحسابات البنكية
                لإظهارها للعميل:
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
              {isLoadingBanks ? (
                <div className="col-span-2 flex flex-col items-center justify-center p-4 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin mb-2" />
                  <span className="text-[10px] font-bold">
                    جاري تحميل الحسابات البنكية...
                  </span>
                </div>
              ) : bankAccountsData.length === 0 ? (
                <div className="col-span-2 p-3 text-center text-[10px] font-bold text-slate-500 bg-white rounded-lg border border-slate-200">
                  لا توجد حسابات بنكية مسجلة في النظام. الرجاء إضافتها من
                  إعدادات الحسابات.
                </div>
              ) : (
                bankAccountsData.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => toggleBankAccount(bank.id)}
                    className={`flex items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer transition-all shadow-sm ${
                      selectedBankAccounts.includes(bank.id)
                        ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/30"
                        : "border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedBankAccounts.includes(bank.id) ? "border-blue-500 bg-blue-500" : "border-slate-300"}`}
                    >
                      {selectedBankAccounts.includes(bank.id) && (
                        <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>

                    {bank.logo ? (
                      <img
                        src={bank.logo}
                        alt="logo"
                        className="w-8 h-8 object-contain rounded"
                      />
                    ) : (
                      <Building className="w-6 h-6 text-slate-300 shrink-0" />
                    )}

                    <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                      <span className="font-bold text-[11px] text-slate-800 truncate">
                        {bank.name}
                      </span>
                      <span
                        className="text-[10px] text-slate-500 font-mono truncate"
                        dir="ltr"
                      >
                        {bank.iban || bank.accountNumber}
                      </span>
                    </div>

                    <QrCode
                      className={`w-5 h-5 shrink-0 ${selectedBankAccounts.includes(bank.id) ? "text-blue-500" : "text-slate-300"}`}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
