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
  Wallet
} from "lucide-react";
import api from "../../../../api/axios"; // تأكد من صحة مسار axios

// دالة لتنسيق المبالغ المالية
const formatCurrency = (value) =>
  Number(value || 0).toLocaleString("ar-SA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// مكون مساعد لتعديل وعرض النصوص داخل شاشة الجوال
const EditableSpan = ({ value, placeholder = "---", className = "" }) => {
  return (
    <span className={`outline-none transition-colors ${className}`}>
      {value || placeholder}
    </span>
  );
};

export default function BankAccountsPage({ onClose }) {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mobilePreviewAccount, setMobilePreviewAccount] = useState(null);

  // تطابق الـ State مع نموذج Prisma (BankAccount)
  const [formData, setFormData] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    iban: "",
    authorizedPersons: "",
    initialBalance: 0,
  });

  // 🚀 1. جلب الحسابات من الباك إند
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/bank-accounts");
      if (response.data.success) {
        setAccounts(response.data.data || []);
      }
    } catch (error) {
      console.error("خطأ في جلب الحسابات:", error);
      alert("حدث خطأ أثناء جلب الحسابات البنكية.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // 🚀 فتح نموذج الإضافة/التعديل
  const handleOpenForm = (account = null) => {
    if (account) {
      setFormData({
        bankName: account.bankName || "",
        accountName: account.accountName || "",
        accountNumber: account.accountNumber || "",
        iban: account.iban || "",
        authorizedPersons: account.authorizedPersons || "",
        initialBalance: account.initialBalance || 0,
      });
      setEditingId(account.id);
    } else {
      setFormData({
        bankName: "",
        accountName: "",
        accountNumber: "",
        iban: "",
        authorizedPersons: "",
        initialBalance: 0,
      });
      setEditingId(null);
    }
    setIsFormOpen(true);
  };

  // 🚀 2. حفظ أو تعديل البيانات
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        // تعديل حساب
        await api.put(`/bank-accounts/${editingId}`, formData);
      } else {
        // إضافة حساب جديد
        await api.post("/bank-accounts", formData);
      }
      await fetchAccounts(); // تحديث القائمة
      setIsFormOpen(false);
    } catch (error) {
      console.error("خطأ في الحفظ:", error);
      alert(error.response?.data?.message || "حدث خطأ أثناء حفظ البيانات.");
    } finally {
      setIsSaving(false);
    }
  };

  // 🚀 3. حذف الحساب
  const handleDelete = async (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا الحساب؟ ستفقد القدرة على الوصول إليه.")) {
      try {
        const res = await api.delete(`/bank-accounts/${id}`);
        if (res.data.success) {
          setAccounts(accounts.filter((acc) => acc.id !== id));
        }
      } catch (error) {
        console.error("خطأ في الحذف:", error);
        alert(error.response?.data?.message || "لا يمكن حذف الحساب لوجود حركات مالية مرتبطة به.");
      }
    }
  };

  const handleCopy = (text, fieldName) => {
    if(!text) return;
    navigator.clipboard.writeText(text);
    alert(`تم نسخ ${fieldName} بنجاح!`);
  };

  // 🚀 توليد رابط QR (تشفير URI لضمان عمله بشكل صحيح عند المسح)
  const getQrCodeUrl = (acc) => {
    const qrData = `Bank: ${acc.bankName}\nName: ${acc.accountName}\nAcc: ${acc.accountNumber}\nIBAN: ${acc.iban}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`;
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-10 overflow-y-auto custom-scrollbar">
      
      {/* ───────────────── الهيدر ───────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800">إدارة الحسابات البنكية</h2>
          <p className="text-sm font-bold text-slate-500 mt-1">
            إضافة، تعديل، إدارة الحسابات، والأرصدة، واستخراج رموز المشاركة (QR)
          </p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-md shadow-violet-600/20"
        >
          <Plus className="w-5 h-5" />
          إضافة حساب بنكي
        </button>
      </div>

      {/* ───────────────── المحتوى ───────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center flex-1 py-20">
          <Loader2 className="w-10 h-10 animate-spin text-violet-600 mb-4" />
          <p className="font-bold text-slate-500">جاري جلب الحسابات البنكية...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div key={acc.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-50 rounded-bl-full -z-0"></div>
                
                <div className="relative z-10 flex-1 flex flex-col">
                  {/* رأس البطاقة */}
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center shrink-0">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-slate-800">{acc.bankName}</h3>
                        <p className="text-xs font-bold text-slate-400">{acc.accountName || "بدون اسم حساب"}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setMobilePreviewAccount(acc)}
                      className="w-10 h-10 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 transition-colors shrink-0"
                      title="عرض ومشاركة البيانات (QR)"
                    >
                      <QrCode className="w-5 h-5" />
                    </button>
                  </div>

                  {/* بيانات الحساب */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 mb-1">رقم الحساب</p>
                      <p className="font-mono font-black text-slate-800 tracking-wider text-sm">{acc.accountNumber}</p>
                    </div>
                    <div className="p-3 bg-violet-50/50 rounded-xl border border-violet-100">
                      <p className="text-[10px] font-bold text-violet-400 mb-1">رقم الآيبان (IBAN)</p>
                      <p className="font-mono font-black text-violet-900 tracking-wider text-xs sm:text-sm break-all">{acc.iban || "---"}</p>
                    </div>

                    {/* الأرصدة القادمة من الباك إند */}
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 mb-1">رصيد النظام</p>
                        <p className="font-mono font-black text-emerald-900">{formatCurrency(acc.systemBalance)} ر.س</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 mb-1">الرصيد الإجمالي</p>
                        <p className="font-mono font-black text-blue-900">{formatCurrency(acc.totalBalance)} ر.س</p>
                      </div>
                    </div>
                  </div>

                  {/* أزرار التحكم */}
                  <div className="flex items-center gap-2 pt-4 border-t border-slate-100 shrink-0">
                    <button onClick={() => handleOpenForm(acc)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-black transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> تعديل
                    </button>
                    <button onClick={() => handleDelete(acc.id)} className="flex-1 flex items-center justify-center gap-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-black transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> حذف
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {accounts.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-bold">لا توجد حسابات بنكية مضافة حالياً.</div>
          )}
        </>
      )}

      {/* ───────────────── نافذة إضافة/تعديل الحساب ───────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 my-auto">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800">{editingId ? "تعديل حساب بنكي" : "إضافة حساب بنكي"}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-rose-500"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">اسم البنك <span className="text-rose-500">*</span></label>
                  <input required type="text" value={formData.bankName} onChange={(e) => setFormData({...formData, bankName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm" placeholder="مثال: مصرف الراجحي" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">اسم الحساب (الشركة)</label>
                  <input type="text" value={formData.accountName} onChange={(e) => setFormData({...formData, accountName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm" placeholder="اسم الشركة المربوط بالحساب" />
                </div>
                
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">رقم الحساب <span className="text-rose-500">*</span></label>
                  <input required type="text" value={formData.accountNumber} onChange={(e) => setFormData({...formData, accountNumber: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-mono font-bold text-sm text-left" dir="ltr" placeholder="رقم الحساب الأساسي" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-2">الأشخاص المفوضين</label>
                  <input type="text" value={formData.authorizedPersons} onChange={(e) => setFormData({...formData, authorizedPersons: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-bold text-sm" placeholder="أسماء المفوضين بالتوقيع" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-600 mb-2">رقم الآيبان (IBAN)</label>
                  <input type="text" value={formData.iban} onChange={(e) => setFormData({...formData, iban: e.target.value})} className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl outline-none focus:border-violet-500 font-mono font-black text-sm text-left uppercase" dir="ltr" placeholder="SA..." />
                </div>

                {!editingId && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-2">الرصيد الافتتاحي (ر.س)</label>
                    <input type="number" step="0.01" value={formData.initialBalance} onChange={(e) => setFormData({...formData, initialBalance: e.target.value})} className="w-full bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl outline-none focus:border-emerald-500 font-mono font-black text-sm text-left text-emerald-800" dir="ltr" placeholder="0.00" />
                    <p className="text-[10px] text-slate-400 mt-1">يُدخل مرة واحدة فقط عند إنشاء الحساب.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button disabled={isSaving} type="submit" className="flex-1 flex justify-center items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white py-3 rounded-xl font-black transition-colors">
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "حفظ البيانات"}
                </button>
                <button disabled={isSaving} type="button" onClick={() => setIsFormOpen(false)} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-black transition-colors">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────────────── نافذة محاكي الموبايل للعميل (Mobile Shared View Preview) ───────────────── */}
      {mobilePreviewAccount && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="w-[360px] h-[700px] bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
              <div className="w-32 h-full bg-slate-800 rounded-b-2xl"></div>
            </div>

            <div className="bg-violet-600 text-white pt-10 pb-6 px-6 relative rounded-b-3xl shadow-md z-10 shrink-0">
              <button onClick={() => setMobilePreviewAccount(null)} className="absolute top-10 left-4 text-white/70 hover:text-white"><X className="w-6 h-6" /></button>
              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 border border-white/20">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h2 className="font-black text-lg">{mobilePreviewAccount.bankName}</h2>
                <p className="text-xs font-semibold text-violet-200 mt-1">بيانات التحويل البنكي</p>
              </div>
            </div>

            <div className="flex-1 bg-slate-50 p-5 overflow-y-auto custom-scrollbar">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col items-center justify-center">
                <img 
                  src={getQrCodeUrl(mobilePreviewAccount)} 
                  alt="QR Code" 
                  className="w-32 h-32 rounded-xl mb-3 border border-slate-100 p-1 bg-white"
                />
                <p className="text-[10px] text-slate-400 font-bold text-center">امسح الكود عبر الكاميرا لمشاركة الحساب</p>
              </div>

              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="min-w-0 flex-1 pl-3">
                    <p className="text-[10px] text-slate-400 font-bold">اسم المستفيد / الحساب</p>
                    <p className="font-black text-sm text-slate-800 truncate">
                      <EditableSpan value={mobilePreviewAccount.accountName} placeholder="اسم الشركة أو العميل" />
                    </p>
                  </div>
                  <button onClick={() => handleCopy(mobilePreviewAccount.accountName, "اسم الحساب")} className="shrink-0 w-10 h-10 bg-slate-50 hover:bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="min-w-0 flex-1 pl-3">
                    <p className="text-[10px] text-slate-400 font-bold">رقم الحساب</p>
                    <p className="font-mono font-black text-lg text-slate-800 tracking-wide" dir="ltr">
                      {mobilePreviewAccount.accountNumber}
                    </p>
                  </div>
                  <button onClick={() => handleCopy(mobilePreviewAccount.accountNumber, "رقم الحساب")} className="shrink-0 w-10 h-10 bg-slate-50 hover:bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-violet-50/50 p-4 rounded-2xl border border-violet-100 shadow-sm flex items-center justify-between">
                  <div className="min-w-0 flex-1 pl-3">
                    <p className="text-[10px] text-violet-400 font-bold">رقم الآيبان (IBAN)</p>
                    <p className="font-mono font-black text-[13px] text-violet-900 tracking-wider break-all leading-relaxed" dir="ltr">
                      {mobilePreviewAccount.iban || "---"}
                    </p>
                  </div>
                  <button onClick={() => handleCopy(mobilePreviewAccount.iban, "الآيبان")} className="shrink-0 w-10 h-10 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-xl flex items-center justify-center transition-colors">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-slate-400 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                حساب بنكي معتمد
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}