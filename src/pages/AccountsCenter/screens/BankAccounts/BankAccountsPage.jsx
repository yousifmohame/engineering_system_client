import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  QrCode,
  Copy,
  CheckCircle2,
  Building2,
  X,
  Building,
  Loader2,
  UploadCloud,
  Share2, // 👈 تم استيراد أيقونة المشاركة
} from "lucide-react";
import api from "../../../../api/axios";

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EditableSpan = ({ value, placeholder = "---", className = "" }) => {
  return (
    <span className={`outline-none transition-colors ${className}`}>
      {value || placeholder}
    </span>
  );
};

export default function BankAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mobilePreviewAccount, setMobilePreviewAccount] = useState(null);

  const [formData, setFormData] = useState({
    bankName: "",
    bankLogo: "",
    accountNameAr: "",
    accountNameEn: "",
    currency: "SAR",
    accountNumber: "",
    iban: "",
    authorizedPersons: "",
    initialBalance: 0,
  });

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/bank-accounts");
      if (response.data.success) {
        setAccounts(response.data.data || []);
      }
    } catch (error) {
      console.error("خطأ:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleOpenForm = (account = null) => {
    if (account) {
      setFormData({
        bankName: account.bankName || "",
        bankLogo: account.bankLogo || "",
        accountNameAr: account.accountNameAr || "",
        accountNameEn: account.accountNameEn || "",
        currency: account.currency || "SAR",
        accountNumber: account.accountNumber || "",
        iban: account.iban || "",
        authorizedPersons: account.authorizedPersons || "",
        initialBalance: account.initialBalance || 0,
      });
      setEditingId(account.id);
    } else {
      setFormData({
        bankName: "",
        bankLogo: "",
        accountNameAr: "",
        accountNameEn: "",
        currency: "SAR",
        accountNumber: "",
        iban: "",
        authorizedPersons: "",
        initialBalance: 0,
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, bankLogo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await api.put(`/bank-accounts/${editingId}`, formData);
      } else {
        await api.post("/bank-accounts", formData);
      }
      await fetchAccounts();
      setIsFormOpen(false);
    } catch (error) {
      alert(error.response?.data?.message || "حدث خطأ أثناء الحفظ.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("حذف الحساب؟")) {
      try {
        await api.delete(`/bank-accounts/${id}`);
        setAccounts(accounts.filter((acc) => acc.id !== id));
      } catch (error) {
        alert("لا يمكن حذف الحساب لوجود حركات مالية مرتبطة به.");
      }
    }
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert(`تم نسخ ${fieldName} بنجاح!`);
  };

  const getQrCodeUrl = (acc) => {
    const publicUrl = `${window.location.origin}/shared/bank/${acc.id}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(publicUrl)}`;
  };

  // 🚀 دالة المشاركة الجديدة
  const handleShareLink = async () => {
    if (!mobilePreviewAccount) return;

    const publicUrl = `${window.location.origin}/shared/bank/${mobilePreviewAccount.id}`;
    const shareData = {
      title: `بيانات الحساب البنكي - ${mobilePreviewAccount.bankName}`,
      text: `تفضل بيانات الحساب البنكي لـ ${mobilePreviewAccount.accountNameAr || mobilePreviewAccount.bankName}`,
      url: publicUrl,
    };

    try {
      // تجربة استخدام ميزة المشاركة الأصلية للموبايل/المتصفح
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // بديل: نسخ الرابط إذا كان المتصفح لا يدعم المشاركة (مثل بعض متصفحات الديسكتوب)
        await navigator.clipboard.writeText(publicUrl);
        alert("تم نسخ الرابط بنجاح! يمكنك الآن لصقه ومشاركته.");
      }
    } catch (error) {
      console.error("تم إلغاء المشاركة أو حدث خطأ:", error);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar bg-slate-50/50">
      {/* الهيدر */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            إدارة الحسابات البنكية
          </h2>
          <p className="text-sm font-bold text-slate-500 mt-1">
            إضافة، تعديل، إدارة الحسابات، والأرصدة، واستخراج رموز المشاركة (QR)
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-md shadow-violet-600/20"
        >
          <Plus className="w-5 h-5" /> إضافة حساب بنكي
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-0"></div>

              <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                      {acc.bankLogo ? (
                        <img
                          src={acc.bankLogo}
                          alt="logo"
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-violet-300" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-slate-800">
                        {acc.bankName}
                      </h3>
                      <p className="text-xs font-bold text-slate-400">
                        {acc.accountNameAr || "بدون اسم عربي"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMobilePreviewAccount(acc)}
                    className="w-10 h-10 bg-slate-50 hover:bg-violet-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-violet-600 transition-colors shrink-0"
                    title="استخراج QR والمشاركة"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 mb-1">
                      رقم الحساب
                    </p>
                    <p className="font-mono font-black text-slate-800 tracking-wider text-sm">
                      {acc.accountNumber}
                    </p>
                  </div>
                  <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100">
                    <p className="text-[10px] font-bold text-violet-400 mb-1">
                      رقم الآيبان (IBAN)
                    </p>
                    <p className="font-mono font-black text-violet-900 tracking-wider text-xs sm:text-sm break-all">
                      {acc.iban || "---"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    onClick={() => handleOpenForm(acc)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-black transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(acc.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-black transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───────────────── نافذة إضافة/تعديل الحساب ───────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800">
                {editingId ? "تعديل حساب بنكي" : "إضافة حساب بنكي"}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-rose-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer hover:bg-violet-100 transition-colors">
                  {formData.bankLogo ? (
                    <img
                      src={formData.bankLogo}
                      alt="Logo"
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <>
                      <UploadCloud className="w-6 h-6 text-violet-400 mb-1" />
                      <span className="text-[9px] font-bold text-violet-600">
                        شعار البنك
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    اسم البنك <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm"
                    placeholder="مثال: مصرف الراجحي"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    اسم العميل (بالعربي)
                  </label>
                  <input
                    type="text"
                    value={formData.accountNameAr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNameAr: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm"
                    placeholder="شركة ... لتقنية المعلومات"
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    اسم العميل (بالإنجليزي)
                  </label>
                  <input
                    type="text"
                    value={formData.accountNameEn}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNameEn: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm"
                    placeholder="... IT Company"
                    dir="ltr"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    رقم الحساب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-mono font-bold text-sm text-left"
                    dir="ltr"
                    placeholder="رقم الحساب الأساسي"
                  />
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    العملة
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm"
                  >
                    <option value="SAR">ريال سعودي (SAR)</option>
                    <option value="USD">دولار أمريكي (USD)</option>
                    <option value="AED">درهم إماراتي (AED)</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">
                    رقم الآيبان (IBAN)
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) =>
                      setFormData({ ...formData, iban: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-mono font-black text-sm text-left uppercase tracking-widest"
                    dir="ltr"
                    placeholder="SA..."
                  />
                </div>

                {!editingId && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2">
                      الرصيد الافتتاحي
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.initialBalance}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          initialBalance: e.target.value,
                        })
                      }
                      className="w-full bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl outline-none focus:border-emerald-500 font-mono font-black text-sm text-left text-emerald-800"
                      dir="ltr"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  disabled={isSaving}
                  type="submit"
                  className="flex-1 flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white py-3 rounded-xl font-black transition-colors"
                >
                  {isSaving ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    "حفظ البيانات"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-black transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── نافذة العرض ومشاركة الـ QR والروابط ───────────────── */}
      {mobilePreviewAccount && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-[360px] bg-white rounded-3xl shadow-2xl relative overflow-hidden flex flex-col items-center p-6 text-center animate-in zoom-in-95">
            <button
              onClick={() => setMobilePreviewAccount(null)}
              className="absolute top-4 left-4 p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-black text-slate-800 text-lg mb-1 mt-2">
              شارك بيانات الحساب
            </h3>
            <p className="text-[11px] font-bold text-slate-500 mb-6">
              امسح الكود بكاميرا الجوال لعرض البيانات ونسخها، أو شارك الرابط مباشرة
            </p>

            <div className="p-2 bg-white rounded-2xl shadow-sm border border-slate-200 mb-6">
              <img
                src={getQrCodeUrl(mobilePreviewAccount)}
                alt="Bank QR Code"
                className="w-48 h-48"
              />
            </div>

            <div className="w-full bg-violet-50 border border-violet-100 rounded-xl p-4 flex items-center gap-3">
              {mobilePreviewAccount.bankLogo ? (
                <img
                  src={mobilePreviewAccount.bankLogo}
                  alt="logo"
                  className="w-10 h-10 object-contain rounded-md"
                />
              ) : (
                <Building className="w-8 h-8 text-violet-400" />
              )}
              <div className="text-right flex-1">
                <p className="font-black text-violet-900 text-sm">
                  {mobilePreviewAccount.bankName}
                </p>
                <p className="font-mono text-violet-700 text-xs font-bold tracking-wider mt-1">
                  {mobilePreviewAccount.accountNumber}
                </p>
              </div>
            </div>

            {/* 🚀 زر المشاركة الجديد 🚀 */}
            <button
              onClick={handleShareLink}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-3.5 rounded-xl font-black shadow-lg shadow-violet-600/30 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5" /> {/*[cite: 1] */}
              مشاركة رابط الحساب البنكي
            </button>

          </div>
        </div>
      )}
    </div>
  );
}