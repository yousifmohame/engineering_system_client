import React, { useState, useEffect } from "react";
import {
  Settings,
  Mail,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  Loader2,
  Save,
  RefreshCw,
  HardDrive,
  User,
  Inbox,
  Send
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios"; // 👈 تأكد من تعديل المسار حسب مشروعك

export default function EmailSettingsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // 💡 الإعدادات الافتراضية مجهزة لـ Hostinger
  const defaultFormState = {
    accountName: "",
    email: "",
    password: "",
    imapServer: "imap.hostinger.com",
    imapPort: 993,
    smtpServer: "smtp.hostinger.com",
    smtpPort: 465,
    useSSL: true,
  };

  const [formData, setFormData] = useState(defaultFormState);

  // جلب الحسابات المربوطة
  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/email/accounts");
      setAccounts(res.data.data || []);
    } catch (error) {
      toast.error("فشل في جلب حسابات البريد الإلكتروني");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSaveAccount = async (e) => {
    e.preventDefault();
    if (!formData.accountName || !formData.email || !formData.password) {
      return toast.error("يرجى تعبئة جميع الحقول الأساسية");
    }

    setIsSaving(true);
    const toastId = toast.loading("جاري الاتصال بخوادم Hostinger وحفظ الحساب...");

    try {
      if (editingId) {
        // تحديث حساب موجود (تحتاج لإضافة مسار الـ PUT في الباك إند لاحقاً إذا أردت التعديل)
        await api.put(`/email/accounts/${editingId}`, formData);
        toast.success("تم تحديث الحساب بنجاح", { id: toastId });
      } else {
        // إضافة حساب جديد
        await api.post("/email/accounts", formData);
        toast.success("تم ربط الحساب بنجاح!", { id: toastId });
      }
      
      fetchAccounts();
      setShowForm(false);
      setFormData(defaultFormState);
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "فشل الاتصال بالخادم، تأكد من صحة البيانات.", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (id, accountName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الحساب "${accountName}"؟`)) return;

    try {
      toast.loading("جاري الحذف...", { id: "delete" });
      await api.delete(`/email/accounts/${id}`); // تأكد من إضافة مسار الحذف في الباك إند
      toast.success("تم الحذف بنجاح", { id: "delete" });
      setAccounts(accounts.filter((acc) => acc.id !== id));
    } catch (error) {
      toast.error("فشل الحذف", { id: "delete" });
    }
  };

  const openEditForm = (account) => {
    setFormData({
      accountName: account.accountName,
      email: account.email,
      password: account.password || "", // الباسورد قد لا يأتي من الباك إند لأسباب أمنية
      imapServer: account.imapServer,
      imapPort: account.imapPort,
      smtpServer: account.smtpServer,
      smtpPort: account.smtpPort,
      useSSL: account.useSSL,
    });
    setEditingId(account.id);
    setShowForm(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 font-[Tajawal]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b border-slate-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
              <Settings size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">إعدادات خوادم البريد الإلكتروني</h1>
              <p className="text-sm text-slate-500 mt-1">
                إدارة حسابات البريد (Hostinger) وربطها بنظام المراسلات الخاص بك.
              </p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                setFormData(defaultFormState);
                setEditingId(null);
                setShowForm(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20"
            >
              <Plus size={18} /> إضافة حساب جديد
            </button>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-5xl mx-auto">
          {showForm ? (
            /* ── نموذج إضافة / تعديل حساب ── */
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Mail size={20} className="text-blue-600" />
                  {editingId ? "تعديل حساب البريد" : "ربط حساب بريد جديد"}
                </h2>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                  <Server size={14} /> مجهز تلقائياً لـ Hostinger
                </div>
              </div>

              <form onSubmit={handleSaveAccount} className="p-6">
                {/* البيانات الأساسية */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User size={16} className="text-slate-400" /> البيانات الأساسية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم الحساب (يظهر للمستلمين) *</label>
                      <input type="text" name="accountName" value={formData.accountName} onChange={handleInputChange} required placeholder="مثال: الدعم الفني" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">البريد الإلكتروني *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} required placeholder="info@yourdomain.com" dir="ltr" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-left" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور *</label>
                      <input type="password" name="password" value={formData.password} onChange={handleInputChange} required placeholder="••••••••" dir="ltr" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-colors text-left" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  {/* إعدادات الاستقبال IMAP */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Inbox size={16} className="text-emerald-500" /> خادم الاستقبال (IMAP)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الخادم (Server)</label>
                        <input type="text" name="imapServer" value={formData.imapServer} onChange={handleInputChange} dir="ltr" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-left focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المنفذ (Port)</label>
                        <input type="number" name="imapPort" value={formData.imapPort} onChange={handleInputChange} dir="ltr" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-left focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* إعدادات الإرسال SMTP */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                      <Send size={16} className="text-blue-500" /> خادم الإرسال (SMTP)
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">الخادم (Server)</label>
                        <input type="text" name="smtpServer" value={formData.smtpServer} onChange={handleInputChange} dir="ltr" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-left focus:outline-none focus:border-blue-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">المنفذ (Port)</label>
                        <input type="number" name="smtpPort" value={formData.smtpPort} onChange={handleInputChange} dir="ltr" className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-left focus:outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* خيارات الأمان */}
                <div className="mb-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-blue-600" />
                    <div>
                      <div className="text-sm font-bold text-slate-800">تشفير الاتصال (SSL/TLS)</div>
                      <div className="text-xs text-slate-500 mt-0.5">مستحسن بشدة لحماية بيانات البريد المرسلة والمستقبلة.</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" name="useSSL" checked={formData.useSSL} onChange={handleInputChange} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* أزرار الحفظ */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button type="button" onClick={() => setShowForm(false)} disabled={isSaving} className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                    إلغاء
                  </button>
                  <button type="submit" disabled={isSaving} className="px-8 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all disabled:opacity-70">
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    {isSaving ? "جاري الحفظ والاتصال..." : "حفظ واختبار الاتصال"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ── قائمة الحسابات المربوطة ── */
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <RefreshCw size={32} className="animate-spin mb-4 text-blue-500" />
                  <p className="font-bold">جاري تحميل الحسابات...</p>
                </div>
              ) : accounts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <HardDrive size={48} className="text-slate-300 mb-4" />
                  <h3 className="text-lg font-bold text-slate-700 mb-2">لا توجد حسابات مربوطة</h3>
                  <p className="text-sm text-slate-500 mb-6">قم بإضافة حساب بريد إلكتروني جديد للبدء في استقبال وإرسال الرسائل.</p>
                  <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 shadow-md transition-all">
                    <Plus size={18} /> ربط حساب جديد
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                            {acc.accountName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900">{acc.accountName}</h3>
                            <p className="text-sm text-slate-500 font-mono" dir="ltr">{acc.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditForm(acc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="تعديل">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteAccount(acc.id, acc.accountName)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="حذف">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl text-xs font-mono text-slate-600 mb-4" dir="ltr">
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5 font-[Tajawal]" dir="rtl">خادم الاستقبال</span>
                          {acc.imapServer}:{acc.imapPort}
                        </div>
                        <div>
                          <span className="block text-[10px] text-slate-400 mb-0.5 font-[Tajawal]" dir="rtl">خادم الإرسال</span>
                          {acc.smtpServer}:{acc.smtpPort}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${acc.isActive ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
                          {acc.isActive ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                          {acc.isActive ? 'متصل ونشط' : 'غير نشط'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          تم الربط بـ Hostinger
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}