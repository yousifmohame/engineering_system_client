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
  Send,
  LockKeyhole,
  X,
  Wifi,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";

export default function EmailSettingsScreen() {
  const [accounts, setAccounts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

    const toastId = toast.loading(
      "جاري الاتصال بخوادم Hostinger وحفظ الحساب...",
    );

    try {
      if (editingId) {
        await api.put(`/email/accounts/${editingId}`, formData);
        toast.success("تم تحديث الحساب بنجاح", { id: toastId });
      } else {
        await api.post("/email/accounts", formData);
        toast.success("تم ربط الحساب بنجاح!", { id: toastId });
      }

      fetchAccounts();
      setShowForm(false);
      setFormData(defaultFormState);
      setEditingId(null);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "فشل الاتصال بالخادم، تأكد من صحة البيانات.",
        { id: toastId },
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async (id, accountName) => {
    if (!window.confirm(`هل أنت متأكد من حذف الحساب "${accountName}"؟`)) {
      return;
    }

    try {
      toast.loading("جاري الحذف...", { id: "delete" });
      await api.delete(`/email/accounts/${id}`);
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
      password: account.password || "",
      imapServer: account.imapServer,
      imapPort: account.imapPort,
      smtpServer: account.smtpServer,
      smtpPort: account.smtpPort,
      useSSL: account.useSSL,
    });

    setEditingId(account.id);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setFormData(defaultFormState);
    setEditingId(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData(defaultFormState);
  };

  return (
    <div
      className="
        flex h-full flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative shrink-0 overflow-hidden
          border-b border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-5 py-4 text-white shadow-[0_14px_34px_rgba(18,63,89,0.16)]
          md:px-8 md:py-5
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Settings className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-lg font-black md:text-xl">
                إعدادات خوادم البريد الإلكتروني
              </h1>

              <p className="mt-1 truncate text-xs font-bold text-white/65">
                إدارة حسابات البريد وربطها بنظام المراسلات الخاص بك.
              </p>
            </div>
          </div>

          {!showForm && (
            <button
              onClick={openCreateForm}
              className="
                flex h-11 shrink-0 items-center justify-center gap-2
                rounded-2xl bg-[#e2bf74] px-5
                text-sm font-black text-[#082032]
                shadow-[0_12px_28px_rgba(226,191,116,0.25)]
                transition-all hover:-translate-y-[1px] hover:bg-[#f5d99b]
              "
              type="button"
            >
              <Plus className="h-4 w-4" />
              إضافة حساب جديد
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl">
          {showForm ? (
            <div
              className="
                overflow-hidden rounded-[28px]
                border border-[#d8b46a]/30 bg-white/90
                shadow-[0_24px_70px_rgba(18,63,89,0.14)]
                backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4
              "
            >
              <div
                className="
                  flex flex-col gap-3 border-b border-[#e8ddc8]
                  bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
                  px-5 py-4 md:flex-row md:items-center md:justify-between
                "
              >
                <div className="flex items-center gap-2">
                  <span
                    className="
                      grid h-10 w-10 place-items-center rounded-2xl
                      bg-[#123f59] text-[#e2bf74]
                    "
                  >
                    <Mail className="h-5 w-5" />
                  </span>

                  <div>
                    <h2 className="text-base font-black text-[#123f59]">
                      {editingId ? "تعديل حساب البريد" : "ربط حساب بريد جديد"}
                    </h2>

                    <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                      إعدادات IMAP / SMTP مهيأة افتراضياً لـ Hostinger.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge icon={Server} text="Hostinger" tone="gold" />
                  <Badge icon={ShieldCheck} text="SSL/TLS" tone="emerald" />
                </div>
              </div>

              <form onSubmit={handleSaveAccount} className="space-y-8 p-5 md:p-6">
                {/* Basic data */}
                <section>
                  <SectionTitle icon={User} title="البيانات الأساسية" />

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    <FormField label="اسم الحساب" required>
                      <input
                        type="text"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        required
                        placeholder="مثال: الدعم الفني"
                        className={INPUT_CLASS}
                      />
                    </FormField>

                    <FormField label="البريد الإلكتروني" required>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="info@yourdomain.com"
                        dir="ltr"
                        className={`${INPUT_CLASS} text-left font-mono`}
                      />
                    </FormField>

                    <FormField label="كلمة المرور" required>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="••••••••"
                        dir="ltr"
                        className={`${INPUT_CLASS} text-left font-mono`}
                      />
                    </FormField>
                  </div>
                </section>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* IMAP */}
                  <ServerCard
                    icon={Inbox}
                    title="خادم الاستقبال"
                    subtitle="IMAP"
                    tone="emerald"
                  >
                    <FormField label="الخادم / Server">
                      <input
                        type="text"
                        name="imapServer"
                        value={formData.imapServer}
                        onChange={handleInputChange}
                        dir="ltr"
                        className={`${INPUT_CLASS} text-left font-mono`}
                      />
                    </FormField>

                    <FormField label="المنفذ / Port">
                      <input
                        type="number"
                        name="imapPort"
                        value={formData.imapPort}
                        onChange={handleInputChange}
                        dir="ltr"
                        className={`${INPUT_CLASS} text-left font-mono`}
                      />
                    </FormField>
                  </ServerCard>

                  {/* SMTP */}
                  <ServerCard
                    icon={Send}
                    title="خادم الإرسال"
                    subtitle="SMTP"
                    tone="cyan"
                  >
                    <FormField label="الخادم / Server">
                      <input
                        type="text"
                        name="smtpServer"
                        value={formData.smtpServer}
                        onChange={handleInputChange}
                        dir="ltr"
                        className={`${INPUT_CLASS} text-left font-mono`}
                      />
                    </FormField>

                    <FormField label="المنفذ / Port">
                      <input
                        type="number"
                        name="smtpPort"
                        value={formData.smtpPort}
                        onChange={handleInputChange}
                        dir="ltr"
                        className={`${INPUT_CLASS} text-left font-mono`}
                      />
                    </FormField>
                  </ServerCard>
                </div>

                {/* Security */}
                <div
                  className="
                    flex flex-col gap-4 rounded-[22px]
                    border border-cyan-700/20 bg-cyan-50/80
                    p-4 md:flex-row md:items-center md:justify-between
                  "
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="
                        grid h-11 w-11 shrink-0 place-items-center
                        rounded-2xl bg-white text-cyan-800 shadow-sm
                      "
                    >
                      <LockKeyhole className="h-5 w-5" />
                    </div>

                    <div>
                      <div className="text-sm font-black text-[#123f59]">
                        تشفير الاتصال SSL/TLS
                      </div>

                      <div className="mt-1 text-xs font-bold leading-6 text-[#64748b]">
                        مستحسن بشدة لحماية بيانات البريد المرسلة والمستقبلة.
                      </div>
                    </div>
                  </div>

                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      name="useSSL"
                      checked={formData.useSSL}
                      onChange={handleInputChange}
                      className="peer sr-only"
                    />

                    <div
                      className="
                        h-7 w-14 rounded-full bg-slate-300
                        after:absolute after:right-[3px] after:top-[3px]
                        after:h-5 after:w-5 after:rounded-full after:bg-white
                        after:transition-all after:content-['']
                        peer-checked:bg-[#123f59]
                        peer-checked:after:-translate-x-7
                      "
                    />
                  </label>
                </div>

                {/* Actions */}
                <div
                  className="
                    flex flex-col-reverse gap-3 border-t border-[#e8ddc8]
                    pt-5 sm:flex-row sm:items-center sm:justify-end
                  "
                >
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={isSaving}
                    className="
                      flex h-11 items-center justify-center gap-2
                      rounded-2xl border border-[#d8b46a]/30
                      bg-white px-6 text-sm font-black text-[#64748b]
                      transition hover:bg-[#f8efe0]
                    "
                  >
                    <X className="h-4 w-4" />
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="
                      flex h-11 items-center justify-center gap-2
                      rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                      px-8 text-sm font-black text-white
                      shadow-[0_14px_30px_rgba(18,63,89,0.24)]
                      transition hover:-translate-y-[1px]
                      disabled:cursor-not-allowed disabled:opacity-70
                    "
                  >
                    {isSaving ? (
                      <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
                    ) : (
                      <Save className="h-5 w-5 text-[#e2bf74]" />
                    )}

                    {isSaving ? "جاري الحفظ والاتصال..." : "حفظ واختبار الاتصال"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-5">
              {isLoading ? (
                <LoadingState />
              ) : accounts.length === 0 ? (
                <EmptyState onCreate={openCreateForm} />
              ) : (
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                  {accounts.map((acc) => (
                    <AccountCard
                      key={acc.id}
                      account={acc}
                      onEdit={() => openEditForm(acc)}
                      onDelete={() =>
                        handleDeleteAccount(acc.id, acc.accountName)
                      }
                    />
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

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="mb-4 flex items-center gap-2 border-b border-[#e8ddc8] pb-2">
    <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f8efe0] text-[#c5983c]">
      <Icon className="h-4 w-4" />
    </span>

    <h3 className="text-sm font-black text-[#123f59]">{title}</h3>
  </div>
);

const FormField = ({ label, required, children }) => (
  <div>
    <label className="mb-1.5 block text-xs font-black text-[#123f59]">
      {label}
      {required && <span className="mr-1 text-rose-500">*</span>}
    </label>

    {children}
  </div>
);

const ServerCard = ({ icon: Icon, title, subtitle, tone = "cyan", children }) => {
  const tones = {
    emerald: {
      border: "border-emerald-200",
      bg: "from-emerald-50 via-white to-[#fbf8f1]",
      icon: "bg-emerald-100 text-emerald-700",
    },
    cyan: {
      border: "border-cyan-200",
      bg: "from-cyan-50 via-white to-[#fbf8f1]",
      icon: "bg-cyan-100 text-cyan-800",
    },
  };

  const t = tones[tone] || tones.cyan;

  return (
    <section
      className={`
        rounded-[24px] border ${t.border}
        bg-gradient-to-br ${t.bg}
        p-5 shadow-[0_12px_30px_rgba(18,63,89,0.06)]
      `}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`grid h-10 w-10 place-items-center rounded-2xl ${t.icon}`}>
            <Icon className="h-5 w-5" />
          </span>

          <div>
            <h3 className="text-sm font-black text-[#123f59]">{title}</h3>
            <p className="text-[10px] font-black text-[#64748b]">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">{children}</div>
    </section>
  );
};

const AccountCard = ({ account, onEdit, onDelete }) => (
  <div
    className="
      group overflow-hidden rounded-[26px]
      border border-[#d8b46a]/28 bg-white/90
      shadow-[0_16px_40px_rgba(18,63,89,0.10)]
      backdrop-blur-xl transition-all
      hover:-translate-y-[1px]
      hover:shadow-[0_22px_50px_rgba(18,63,89,0.14)]
    "
  >
    <div
      className="
        flex items-start justify-between gap-3
        border-b border-[#e8ddc8]
        bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
        p-5
      "
    >
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="
            grid h-12 w-12 shrink-0 place-items-center
            rounded-2xl bg-[#123f59]
            text-lg font-black text-[#e2bf74]
            shadow-[0_12px_26px_rgba(18,63,89,0.18)]
          "
        >
          {account.accountName?.charAt(0) || "@"}
        </div>

        <div className="min-w-0">
          <h3 className="truncate text-base font-black text-[#123f59]">
            {account.accountName}
          </h3>

          <p className="truncate font-mono text-xs font-bold text-[#64748b]" dir="ltr">
            {account.email}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        <ActionButton label="تعديل" tone="cyan" onClick={onEdit}>
          <Edit2 className="h-4 w-4" />
        </ActionButton>

        <ActionButton label="حذف" tone="rose" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </ActionButton>
      </div>
    </div>

    <div className="space-y-4 p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" dir="ltr">
        <ServerInfo title="IMAP" value={`${account.imapServer}:${account.imapPort}`} />
        <ServerInfo title="SMTP" value={`${account.smtpServer}:${account.smtpPort}`} />
      </div>

      <div className="flex flex-col gap-3 border-t border-[#e8ddc8] pt-4 sm:flex-row sm:items-center sm:justify-between">
        <span
          className={`
            inline-flex w-fit items-center gap-1.5 rounded-xl border px-3 py-1.5
            text-[10px] font-black
            ${
              account.isActive
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-100 text-slate-500"
            }
          `}
        >
          {account.isActive ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}

          {account.isActive ? "متصل ونشط" : "غير نشط"}
        </span>

        <span className="inline-flex w-fit items-center gap-1.5 rounded-xl bg-[#f8efe0] px-3 py-1.5 text-[10px] font-black text-[#9a6b16]">
          <Wifi className="h-3.5 w-3.5" />
          تم الربط بـ Hostinger
        </span>
      </div>
    </div>
  </div>
);

const ServerInfo = ({ title, value }) => (
  <div
    className="
      rounded-2xl border border-[#d8b46a]/25
      bg-[#fbf8f1] p-3 text-left
    "
  >
    <span className="mb-1 block text-right font-[Tajawal] text-[10px] font-black text-[#64748b]">
      {title}
    </span>

    <p className="truncate font-mono text-xs font-black text-[#123f59]">
      {value}
    </p>
  </div>
);

const ActionButton = ({ label, tone, onClick, children }) => {
  const tones = {
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700 hover:bg-cyan-100",
    rose: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex min-w-[48px] flex-col items-center justify-center
        gap-0.5 rounded-xl border px-1.5 py-1
        text-[8px] font-black leading-none
        transition hover:-translate-y-[1px]
        ${tones[tone] || tones.cyan}
      `}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
};

const Badge = ({ icon: Icon, text, tone }) => {
  const tones = {
    gold: "border-[#d8b46a]/35 bg-[#f8efe0] text-[#9a6b16]",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5
        text-[10px] font-black
        ${tones[tone] || tones.gold}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
};

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#d8b46a]/30 bg-white/80 py-20 text-[#64748b] shadow-[0_18px_45px_rgba(18,63,89,0.08)]">
    <RefreshCw className="mb-4 h-9 w-9 animate-spin text-[#c5983c]" />
    <p className="font-black">جاري تحميل الحسابات...</p>
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div
    className="
      flex flex-col items-center justify-center rounded-[28px]
      border border-dashed border-[#d8b46a]/45 bg-white/80
      px-5 py-20 text-center shadow-[0_18px_45px_rgba(18,63,89,0.08)]
    "
  >
    <div
      className="
        mb-5 grid h-20 w-20 place-items-center
        rounded-[28px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
        text-[#e2bf74] shadow-[0_16px_34px_rgba(18,63,89,0.22)]
      "
    >
      <HardDrive className="h-10 w-10" />
    </div>

    <h3 className="mb-2 text-lg font-black text-[#123f59]">
      لا توجد حسابات مربوطة
    </h3>

    <p className="mb-6 max-w-md text-sm font-bold leading-7 text-[#64748b]">
      قم بإضافة حساب بريد إلكتروني جديد للبدء في استقبال وإرسال الرسائل.
    </p>

    <button
      onClick={onCreate}
      className="
        flex items-center gap-2 rounded-2xl
        bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
        px-6 py-3 text-sm font-black text-white
        shadow-[0_14px_30px_rgba(18,63,89,0.22)]
        transition hover:-translate-y-[1px]
      "
      type="button"
    >
      <Plus className="h-4 w-4 text-[#e2bf74]" />
      ربط حساب جديد
    </button>
  </div>
);

const INPUT_CLASS = `
  w-full rounded-2xl border border-[#d8b46a]/25
  bg-white px-4 py-3 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4
  focus:ring-[#c5983c]/10
`;
