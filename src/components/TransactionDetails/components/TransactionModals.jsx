import React from "react";
import {
  X,
  Save,
  Loader2,
  Banknote,
  User,
  Building2,
  Monitor,
  Upload,
  TriangleAlert,
  Handshake,
  Info,
  FileText,
  ShieldCheck,
  Sparkles,
  ReceiptText,
  CreditCard,
  Wallet,
  CalendarDays,
  CheckCircle2,
  Landmark,
  DollarSign,
  Briefcase,
  Users,
  FolderOpen,
  ExternalLink,
} from "lucide-react";
import { TripleCurrencyInput } from "./TransactionSharedUI";
import { toast } from "sonner";

// ============================================================
// Shared premium UI
// ============================================================

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => (
  <span
    className={`
      inline-flex items-center justify-center gap-1
      ${vertical ? "flex-col" : "flex-row"}
      ${className}
    `}
  >
    {Icon && <Icon className={iconClassName || "h-4 w-4"} />}

    {text && (
      <span className={textClassName || "text-[9px] font-black leading-none"}>
        {text}
      </span>
    )}
  </span>
);

const toneMap = {
  blue: {
    icon: "bg-[#123f59] text-[#e2bf74]",
    soft: "border-blue-200 bg-blue-50 text-blue-700",
    button: "bg-[#123f59] hover:bg-[#0f3448] text-white",
    ring: "focus:border-blue-500 focus:ring-blue-500/10",
  },
  emerald: {
    icon: "bg-emerald-600 text-white",
    soft: "border-emerald-200 bg-emerald-50 text-emerald-700",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
    ring: "focus:border-emerald-500 focus:ring-emerald-500/10",
  },
  purple: {
    icon: "bg-purple-600 text-white",
    soft: "border-purple-200 bg-purple-50 text-purple-700",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
    ring: "focus:border-purple-500 focus:ring-purple-500/10",
  },
  cyan: {
    icon: "bg-cyan-700 text-white",
    soft: "border-cyan-200 bg-cyan-50 text-cyan-800",
    button: "bg-cyan-700 hover:bg-cyan-800 text-white",
    ring: "focus:border-cyan-500 focus:ring-cyan-500/10",
  },
  amber: {
    icon: "bg-amber-500 text-white",
    soft: "border-amber-200 bg-amber-50 text-amber-700",
    button: "bg-amber-600 hover:bg-amber-700 text-white",
    ring: "focus:border-amber-500 focus:ring-amber-500/10",
  },
};

const ModalShell = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  iconText,
  tone = "blue",
  maxWidth = "max-w-xl",
  children,
  footer,
  dir = "rtl",
  zIndex = "z-[200]",
}) => {
  if (!open) return null;

  const toneClass = toneMap[tone] || toneMap.blue;

  return (
    <div
      className={`
        fixed inset-0 ${zIndex} flex items-center justify-center
        bg-[#06111d]/78 p-3 backdrop-blur-md
        animate-in fade-in duration-200 sm:p-5
      `}
      dir={dir}
      onClick={onClose}
    >
      <div
        className={`
          flex max-h-[92vh] w-full ${maxWidth}
          flex-col overflow-hidden rounded-[30px]
          border border-[#d8b46a]/35 bg-white
          shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95 duration-200
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="
            relative shrink-0 overflow-hidden
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-80px] bottom-[-80px] h-48 w-48 rounded-full bg-cyan-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span
                className={`
                  grid h-12 w-12 shrink-0 place-items-center
                  rounded-2xl border border-white/15 shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                  ${tone === "blue" ? "bg-[#e2bf74] text-[#123f59]" : toneClass.icon}
                `}
              >
                <IconWithText
                  icon={icon}
                  text={iconText}
                  vertical={!!iconText}
                  iconClassName={iconText ? "h-5 w-5" : "h-6 w-6"}
                  textClassName="text-[8px] font-black leading-none"
                />
              </span>

              <div className="min-w-0">
                <h3 className="truncate text-base font-black md:text-lg">
                  {title}
                </h3>

                {subtitle && (
                  <p className="mt-1 text-[11px] font-bold leading-5 text-white/65">
                    {subtitle}
                  </p>
                )}

                <div
                  className="
                    mt-3 inline-flex items-center gap-1.5 rounded-xl
                    border border-white/15 bg-white/10 px-3 py-1.5
                    text-[10px] font-black text-white/80
                  "
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#e2bf74]" />
                  تصميم موحد مع صفحات النظام
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                grid h-10 w-10 shrink-0 place-items-center rounded-2xl
                bg-white/10 text-white transition hover:bg-rose-500/70
              "
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar-slim min-h-0 flex-1 overflow-y-auto bg-gradient-to-br from-[#eef7f6]/75 via-[#fbf8f1]/80 to-white p-5">
          {children}
        </div>

        {footer && (
          <div
            className="
              shrink-0 border-t border-[#e8ddc8]
              bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
              px-5 py-4
            "
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Field = ({ label, icon: Icon, required, children, hint }) => (
  <div>
    <label className="mb-1.5 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
      {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />}
      {label}
      {required && <span className="text-rose-500">*</span>}
    </label>

    {children}

    {hint && (
      <p className="mt-1.5 text-[10px] font-bold leading-5 text-[#64748b]">
        {hint}
      </p>
    )}
  </div>
);

const FooterActions = ({
  onCancel,
  onConfirm,
  confirmLabel = "حفظ",
  cancelLabel = "إلغاء",
  pending,
  disabled,
  icon: Icon = Save,
  tone = "blue",
}) => {
  const toneClass = toneMap[tone] || toneMap.blue;

  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
      <button
        onClick={onCancel}
        className="
          flex h-11 items-center justify-center gap-2
          rounded-2xl border border-[#d8b46a]/25
          bg-white px-5 text-xs font-black text-[#123f59]
          transition hover:bg-[#f8efe0]
        "
        type="button"
      >
        <X className="h-4 w-4" />
        {cancelLabel}
      </button>

      <button
        onClick={onConfirm}
        disabled={pending || disabled}
        className={`
          flex h-11 items-center justify-center gap-2 rounded-2xl
          px-7 text-xs font-black shadow-[0_14px_30px_rgba(18,63,89,0.20)]
          transition hover:-translate-y-[1px]
          disabled:cursor-not-allowed disabled:opacity-50
          ${toneClass.button}
        `}
        type="button"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        {confirmLabel}
      </button>
    </div>
  );
};

const INPUT_CLASS = `
  h-12 w-full rounded-2xl
  border border-[#d8b46a]/25 bg-white
  px-4 text-sm font-bold text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;

const SELECT_CLASS = INPUT_CLASS;

const CurrencyPanel = ({ children, tone = "emerald", title }) => {
  const toneClass = toneMap[tone] || toneMap.emerald;

  return (
    <div className={`rounded-[24px] border p-4 ${toneClass.soft}`}>
      {title && (
        <div className="mb-3 flex items-center gap-2 text-xs font-black">
          <Wallet className="h-4 w-4" />
          {title}
        </div>
      )}
      {children}
    </div>
  );
};

// ============================================================
// 1. نافذة معاينة المرفقات
// ============================================================

export const PreviewModal = ({ previewFile, setPreviewFile }) => {
  if (!previewFile) return null;

  const isPdf = previewFile.url?.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="
        fixed inset-0 z-[250] flex items-center justify-center
        bg-slate-950/90 p-3 backdrop-blur-md animate-in fade-in sm:p-6
      "
      onClick={(e) => {
        e.stopPropagation();
        setPreviewFile(null);
      }}
    >
      <div
        className="
          flex h-[92vh] w-full max-w-6xl flex-col overflow-hidden
          rounded-[30px] border border-white/10 bg-white
          shadow-[0_30px_90px_rgba(0,0,0,0.45)]
        "
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="
            flex shrink-0 items-center justify-between gap-3
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e2bf74] text-[#123f59]">
              <IconWithText
                icon={isPdf ? FileText : FolderOpen}
                text="عرض"
                vertical
                iconClassName="h-5 w-5"
                textClassName="text-[7px] font-black leading-none"
              />
            </span>

            <div className="min-w-0">
              <h3 className="truncate text-sm font-black" title={previewFile.name}>
                {previewFile.name}
              </h3>
              <p className="mt-0.5 text-[10px] font-bold text-white/55">
                معاينة الملف داخل النظام
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => window.open(previewFile.url, "_blank")}
              className="
                hidden items-center gap-1.5 rounded-2xl
                border border-white/15 bg-white/10 px-4 py-2
                text-xs font-black text-white transition hover:bg-white/15 sm:flex
              "
              type="button"
            >
              <ExternalLink className="h-4 w-4 text-[#e2bf74]" />
              فتح في نافذة جديدة
            </button>

            <button
              onClick={() => setPreviewFile(null)}
              className="
                grid h-10 w-10 place-items-center rounded-2xl
                bg-rose-500 text-white transition hover:bg-rose-600
              "
              type="button"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef7f6] p-3">
          {isPdf ? (
            <iframe
              src={previewFile.url}
              className="h-full w-full rounded-2xl border border-[#d8b46a]/30 bg-white"
              title="PDF Preview"
            />
          ) : (
            <>
              <img
                src={previewFile.url}
                alt="Preview"
                className="
                  max-h-full max-w-full rounded-2xl border-4 border-white
                  object-contain shadow-[0_18px_45px_rgba(18,63,89,0.20)]
                "
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />

              <div className="hidden flex-col items-center justify-center rounded-[28px] border border-rose-200 bg-white p-10 text-center text-[#64748b]">
                <TriangleAlert className="mb-3 h-12 w-12 text-rose-500" />
                <span className="mb-4 text-sm font-black text-[#123f59]">
                  تعذر عرض الملف داخل النظام
                </span>
                <button
                  onClick={() => window.open(previewFile.url, "_blank")}
                  className="rounded-2xl bg-[#123f59] px-5 py-2.5 text-xs font-black text-white"
                  type="button"
                >
                  حاول فتحه في المتصفح
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// 2. نافذة إضافة دفعة تحصيل
// ============================================================

export const AddPaymentModal = ({
  isAddPaymentOpen,
  setIsAddPaymentOpen,
  paymentForm,
  setPaymentForm,
  bankAccounts = [],
  addPaymentMutation,
}) => (
  <ModalShell
    open={isAddPaymentOpen}
    onClose={() => setIsAddPaymentOpen(false)}
    title="إضافة دفعة تحصيل"
    subtitle="تسجيل دفعة جديدة من العميل وربطها بالحساب البنكي أو الخزنة."
    icon={Banknote}
    iconText="دفعة"
    tone="emerald"
    maxWidth="max-w-xl"
    zIndex="z-[210]"
    footer={
      <FooterActions
        onCancel={() => setIsAddPaymentOpen(false)}
        onConfirm={() => addPaymentMutation.mutate(paymentForm)}
        confirmLabel="حفظ الدفعة"
        pending={addPaymentMutation.isPending}
        disabled={!paymentForm.amount}
        tone="emerald"
        icon={Save}
      />
    }
  >
    <div className="space-y-4">
      <Field label="المبلغ المحصل" icon={Banknote} required>
        <input
          type="number"
          value={paymentForm.amount}
          onChange={(e) =>
            setPaymentForm({ ...paymentForm, amount: e.target.value })
          }
          className={`${INPUT_CLASS} font-mono text-lg text-emerald-700`}
          placeholder="0"
          dir="ltr"
        />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="التاريخ" icon={CalendarDays}>
          <input
            type="date"
            value={paymentForm.date}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, date: e.target.value })
            }
            className={`${INPUT_CLASS} font-mono`}
            dir="ltr"
          />
        </Field>

        <Field label="طريقة الدفع" icon={CreditCard}>
          <select
            value={paymentForm.method}
            onChange={(e) =>
              setPaymentForm({ ...paymentForm, method: e.target.value })
            }
            className={SELECT_CLASS}
          >
            <option>تحويل بنكي</option>
            <option>نقدي</option>
            <option>شيك</option>
          </select>
        </Field>
      </div>

      {paymentForm.method === "تحويل بنكي" && (
        <div className="space-y-3 rounded-[24px] border border-blue-200 bg-blue-50/75 p-4 animate-in fade-in">
          <Field
            label="الحساب المحول إليه"
            icon={Landmark}
            hint="سيتم تغذية رصيد الحساب تلقائياً بعد حفظ الدفعة."
          >
            <select
              value={paymentForm.bankAccountId}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  bankAccountId: e.target.value,
                })
              }
              className={SELECT_CLASS}
            >
              <option value="">-- اختر الحساب البنكي --</option>
              {bankAccounts.map((bankAccount) => (
                <option key={bankAccount.id} value={bankAccount.id}>
                  {bankAccount.bankName} - {bankAccount.accountName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="إيصال التحويل" icon={Upload}>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files[0]) {
                  setPaymentForm({
                    ...paymentForm,
                    receiptFile: e.dataTransfer.files[0],
                  });
                }
              }}
              className="
                flex cursor-pointer items-center justify-center gap-2
                rounded-2xl border-2 border-dashed border-blue-300
                bg-white px-4 py-3 text-xs font-black text-blue-700
                transition hover:bg-blue-100
              "
            >
              <Upload className="h-4 w-4" />

              <span className="truncate">
                {paymentForm.receiptFile
                  ? paymentForm.receiptFile.name
                  : "اختر أو اسحب الإيصال هنا..."}
              </span>

              <input
                type="file"
                className="hidden"
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    receiptFile: e.target.files[0],
                  })
                }
              />
            </label>
          </Field>
        </div>
      )}

      {paymentForm.method === "نقدي" && (
        <div className="space-y-3 rounded-[24px] border border-amber-200 bg-amber-50/75 p-4 animate-in fade-in">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-black text-amber-900">
            <input
              type="checkbox"
              checked={paymentForm.isDepositedToSafe}
              onChange={(e) =>
                setPaymentForm({
                  ...paymentForm,
                  isDepositedToSafe: e.target.checked,
                })
              }
              className="h-4 w-4 accent-amber-600"
            />
            تم إيداع المبلغ بالخزنة الرئيسية
          </label>

          {!paymentForm.isDepositedToSafe && (
            <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-white p-3 text-[10px] font-bold leading-5 text-amber-800">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              سيُسجل هذا المبلغ كـ "تحصيل غير مورد للخزينة" وسيبقى عهدة مع
              المحصل لحين توريده.
            </div>
          )}
        </div>
      )}

      <Field label="المرجع / رقم الحوالة" icon={ReceiptText}>
        <input
          value={paymentForm.ref}
          onChange={(e) =>
            setPaymentForm({ ...paymentForm, ref: e.target.value })
          }
          className={INPUT_CLASS}
          placeholder="رقم الحوالة أو المرجع..."
        />
      </Field>

      <Field label="ملاحظات" icon={Info}>
        <input
          value={paymentForm.notes}
          onChange={(e) =>
            setPaymentForm({ ...paymentForm, notes: e.target.value })
          }
          className={INPUT_CLASS}
          placeholder="ملاحظات إضافية..."
        />
      </Field>
    </div>
  </ModalShell>
);

// ============================================================
// 3. نافذة إضافة معقب
// ============================================================

export const AddAgentModal = ({
  isAddAgentOpen,
  setIsAddAgentOpen,
  agentForm,
  setAgentForm,
  agentsList = [],
  addAgentMutation,
}) => (
  <ModalShell
    open={isAddAgentOpen}
    onClose={() => setIsAddAgentOpen(false)}
    title="تعيين معقب"
    subtitle="ربط معقب بالمعاملة وتحديد الدور والأتعاب."
    icon={User}
    iconText="معقب"
    tone="purple"
    maxWidth="max-w-lg"
    zIndex="z-[210]"
    footer={
      <FooterActions
        onCancel={() => setIsAddAgentOpen(false)}
        onConfirm={() => addAgentMutation.mutate(agentForm)}
        confirmLabel="حفظ المعقب"
        pending={addAgentMutation.isPending}
        disabled={!agentForm.agentId}
        tone="purple"
        icon={Save}
      />
    }
  >
    <div className="space-y-4">
      <Field label="اسم المعقب" icon={User} required>
        <select
          value={agentForm.agentId}
          onChange={(e) =>
            setAgentForm({ ...agentForm, agentId: e.target.value })
          }
          className={SELECT_CLASS}
        >
          <option value="">-- اختر معقب --</option>
          {agentsList.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="الدور / المهمة" icon={Briefcase}>
          <input
            value={agentForm.role}
            onChange={(e) =>
              setAgentForm({ ...agentForm, role: e.target.value })
            }
            className={INPUT_CLASS}
            placeholder="مثال: مراجعة البلدية..."
          />
        </Field>

        <Field label="الأتعاب" icon={Banknote} required>
          <input
            type="number"
            value={agentForm.fees}
            onChange={(e) =>
              setAgentForm({ ...agentForm, fees: e.target.value })
            }
            className={`${INPUT_CLASS} font-mono text-lg text-purple-700`}
            placeholder="0"
            dir="ltr"
          />
        </Field>
      </div>
    </div>
  </ModalShell>
);

// ============================================================
// 4. نافذة إضافة وسيط
// ============================================================

export const AddBrokerModal = ({
  isAddBrokerModalOpen,
  setIsAddBrokerModalOpen,
  brokerForm,
  setBrokerForm,
  brokersList = [],
  addBrokerMutation,
}) => (
  <ModalShell
    open={isAddBrokerModalOpen}
    onClose={() => setIsAddBrokerModalOpen(false)}
    title="تعيين وسيط"
    subtitle="ربط وسيط بالمعاملة وتحديد أتعاب الوساطة."
    icon={Handshake}
    iconText="وسيط"
    tone="blue"
    maxWidth="max-w-lg"
    zIndex="z-[210]"
    footer={
      <FooterActions
        onCancel={() => setIsAddBrokerModalOpen(false)}
        onConfirm={() => addBrokerMutation.mutate(brokerForm)}
        confirmLabel="حفظ الوسيط"
        pending={addBrokerMutation.isPending}
        disabled={!brokerForm.brokerId}
        tone="blue"
        icon={Save}
      />
    }
  >
    <div className="space-y-4">
      <Field label="اختر الوسيط" icon={Handshake} required>
        <select
          value={brokerForm.brokerId}
          onChange={(e) =>
            setBrokerForm({ ...brokerForm, brokerId: e.target.value })
          }
          className={SELECT_CLASS}
        >
          <option value="">-- اختر الوسيط --</option>
          {brokersList.map((broker) => (
            <option key={broker.id} value={broker.id}>
              {broker.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="أتعاب الوسيط" icon={Banknote} required>
        <input
          type="number"
          value={brokerForm.fees}
          onChange={(e) =>
            setBrokerForm({ ...brokerForm, fees: e.target.value })
          }
          className={`${INPUT_CLASS} font-mono text-lg text-blue-700`}
          placeholder="0"
          dir="ltr"
        />
      </Field>
    </div>
  </ModalShell>
);

// ============================================================
// 5. نافذة تعيين مهمة عمل عن بعد
// ============================================================

export const AddRemoteTaskModal = ({
  isAddRemoteTaskOpen,
  setIsAddRemoteTaskOpen,
  remoteTaskForm,
  setRemoteTaskForm,
  remoteWorkersList = [],
  exchangeRates,
  addRemoteTaskMutation,
  tx,
}) => (
  <ModalShell
    open={isAddRemoteTaskOpen}
    onClose={() => setIsAddRemoteTaskOpen(false)}
    title="تعيين مهمة ودفع لموظف عن بعد"
    subtitle="إنشاء مهمة خارجية مع تكلفة متعددة العملات وإمكانية تسجيل دفعة مباشرة."
    icon={Monitor}
    iconText="عن بعد"
    tone="emerald"
    maxWidth="max-w-2xl"
    zIndex="z-[220]"
    footer={
      <FooterActions
        onCancel={() => setIsAddRemoteTaskOpen(false)}
        onConfirm={() => {
          if (!remoteTaskForm.workerId || !remoteTaskForm.costSar) {
            return toast.error("يرجى تحديد الموظف وإدخال تكلفة المهمة (SAR)");
          }

          const payload = {
            transactionId: tx?.id,
            workerId: remoteTaskForm.workerId,
            isPaid: remoteTaskForm.isPaid,
            paymentAmount: remoteTaskForm.paymentAmount,
            paymentCurrency: remoteTaskForm.paymentCurrency,
            paymentDate: remoteTaskForm.paymentDate,
            tasks: [
              {
                name: remoteTaskForm.taskName || "مهمة هندسية / رسم",
                cost: remoteTaskForm.costSar,
              },
            ],
          };

          addRemoteTaskMutation.mutate(payload);
        }}
        confirmLabel="حفظ المهمة"
        pending={addRemoteTaskMutation.isPending}
        disabled={!remoteTaskForm.workerId}
        tone="emerald"
        icon={Save}
      />
    }
  >
    <div className="space-y-5">
      <Field label="الموظف المستهدف" icon={Monitor} required>
        <select
          value={remoteTaskForm.workerId}
          onChange={(e) =>
            setRemoteTaskForm({
              ...remoteTaskForm,
              workerId: e.target.value,
            })
          }
          className={SELECT_CLASS}
        >
          <option value="">-- اختر موظف عن بعد --</option>
          {remoteWorkersList.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name}
            </option>
          ))}
        </select>
      </Field>

      <Field label="وصف المهمة" icon={FileText}>
        <input
          type="text"
          value={remoteTaskForm.taskName}
          onChange={(e) =>
            setRemoteTaskForm({
              ...remoteTaskForm,
              taskName: e.target.value,
            })
          }
          className={INPUT_CLASS}
          placeholder="مثال: رسم معماري"
        />
      </Field>

      <CurrencyPanel tone="emerald" title="تكلفة المهمة">
        <TripleCurrencyInput
          valueSar={remoteTaskForm.costSar}
          onChangeSar={(value) =>
            setRemoteTaskForm({ ...remoteTaskForm, costSar: value })
          }
          rates={exchangeRates}
        />
      </CurrencyPanel>

      <div className="rounded-[24px] border border-[#d8b46a]/25 bg-white p-4">
        <label className="mb-4 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={remoteTaskForm.isPaid}
            onChange={(e) =>
              setRemoteTaskForm({
                ...remoteTaskForm,
                isPaid: e.target.checked,
              })
            }
            className="h-4 w-4 accent-emerald-600"
          />
          <span className="text-sm font-black text-[#123f59]">
            تم دفع جزء أو كل المبلغ للموظف الآن
          </span>
        </label>

        {remoteTaskForm.isPaid && (
          <div className="grid grid-cols-1 gap-4 animate-in fade-in sm:grid-cols-2">
            <Field label="المبلغ المدفوع الفعلي" icon={Banknote}>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={remoteTaskForm.paymentAmount}
                  onChange={(e) =>
                    setRemoteTaskForm({
                      ...remoteTaskForm,
                      paymentAmount: e.target.value,
                    })
                  }
                  className={`${INPUT_CLASS} font-mono`}
                  dir="ltr"
                />

                <select
                  value={remoteTaskForm.paymentCurrency}
                  onChange={(e) =>
                    setRemoteTaskForm({
                      ...remoteTaskForm,
                      paymentCurrency: e.target.value,
                    })
                  }
                  className="h-12 rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-3 text-xs font-black text-[#123f59] outline-none"
                >
                  <option>SAR</option>
                  <option>EGP</option>
                  <option>USD</option>
                </select>
              </div>
            </Field>

            <Field label="تاريخ الدفع" icon={CalendarDays}>
              <input
                type="date"
                value={remoteTaskForm.paymentDate}
                onChange={(e) =>
                  setRemoteTaskForm({
                    ...remoteTaskForm,
                    paymentDate: e.target.value,
                  })
                }
                className={`${INPUT_CLASS} font-mono`}
                dir="ltr"
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  </ModalShell>
);

// ============================================================
// 6. نافذة إضافة/تعديل مطالبة مكتب متعاون
// ============================================================

export const CoopFeeModal = ({
  isCoopFeeModalOpen,
  setIsCoopFeeModalOpen,
  coopFeeMode,
  coopFeeForm,
  setCoopFeeForm,
  offices = [],
  saveCoopFeeMutation,
  tx,
}) => (
  <ModalShell
    open={isCoopFeeModalOpen}
    onClose={() => setIsCoopFeeModalOpen(false)}
    title={coopFeeMode === "add" ? "إضافة تكلفة مكتب متعاون" : "تعديل تكلفة المكتب"}
    subtitle="ربط تكلفة مكتب خارجي بالمعاملة مع تفاصيل الأتعاب والرخصة والمنصة."
    icon={Building2}
    iconText="مكتب"
    tone="cyan"
    maxWidth="max-w-5xl"
    zIndex="z-[230]"
    footer={
      <FooterActions
        onCancel={() => setIsCoopFeeModalOpen(false)}
        onConfirm={() => {
          if (coopFeeForm.officeId === "") {
            return toast.error("يرجى اختيار المكتب");
          }

          saveCoopFeeMutation.mutate(coopFeeForm);
        }}
        confirmLabel={coopFeeMode === "add" ? "حفظ التكلفة" : "تعديل التكلفة"}
        pending={saveCoopFeeMutation.isPending}
        tone="cyan"
        icon={Save}
      />
    }
  >
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-[24px] border border-cyan-200 bg-cyan-50/75 p-4">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-cyan-700" />
        <span className="text-xs font-bold leading-6 text-cyan-900">
          سيتم ربط هذه التكلفة تلقائياً بالمعاملة الحالية (
          {tx.internalName || tx.client || "المعاملة الحالية"}).
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Field label="اسم المكتب المتعاون" icon={Building2} required>
            <select
              value={coopFeeForm.officeId}
              onChange={(e) =>
                setCoopFeeForm({
                  ...coopFeeForm,
                  officeId: e.target.value,
                })
              }
              className={SELECT_CLASS}
            >
              <option value="">-- اختر المكتب --</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="نوع الطلب" icon={FileText}>
          <select
            value={coopFeeForm.requestType}
            onChange={(e) =>
              setCoopFeeForm({
                ...coopFeeForm,
                requestType: e.target.value,
              })
            }
            className={SELECT_CLASS}
          >
            <option value="اصدار">إصدار</option>
            <option value="تجديد وتعديل">تجديد وتعديل</option>
            <option value="تصحيح وضع مبني قائم">تصحيح وضع مبنى قائم</option>
            <option value="اخرى">أخرى</option>
          </select>
        </Field>

        <Field label="الأتعاب المستحقة للمكتب" icon={Banknote} required>
          <input
            type="number"
            value={coopFeeForm.officeFees}
            onChange={(e) =>
              setCoopFeeForm({
                ...coopFeeForm,
                officeFees: e.target.value,
              })
            }
            className={`${INPUT_CLASS} font-mono text-lg text-blue-700`}
            placeholder="0"
            dir="ltr"
          />
        </Field>

        <Field label="المدفوع مقدماً" icon={CheckCircle2}>
          <input
            type="number"
            value={coopFeeForm.paidAmount}
            onChange={(e) =>
              setCoopFeeForm({
                ...coopFeeForm,
                paidAmount: e.target.value,
              })
            }
            className={`${INPUT_CLASS} font-mono text-lg text-emerald-600`}
            placeholder="0"
            dir="ltr"
          />
        </Field>

        <Field label="تاريخ الاستحقاق" icon={CalendarDays}>
          <input
            type="date"
            value={coopFeeForm.dueDate}
            onChange={(e) =>
              setCoopFeeForm({
                ...coopFeeForm,
                dueDate: e.target.value,
              })
            }
            className={`${INPUT_CLASS} font-mono`}
            dir="ltr"
          />
        </Field>
      </div>

      <div className="rounded-[24px] border border-[#d8b46a]/25 bg-white/85 p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Field label="الخدمات المقدمة" icon={Briefcase}>
              <input
                type="text"
                value={coopFeeForm.providedServices}
                onChange={(e) =>
                  setCoopFeeForm({
                    ...coopFeeForm,
                    providedServices: e.target.value,
                  })
                }
                className={INPUT_CLASS}
                placeholder="مثال: تصميم معماري، إنشائي، تنسيق حدائق..."
              />
            </Field>
          </div>

          <Field label="حالة الرفع على النظام" icon={Upload}>
            <select
              value={coopFeeForm.uploadStatus}
              onChange={(e) =>
                setCoopFeeForm({
                  ...coopFeeForm,
                  uploadStatus: e.target.value,
                })
              }
              className={SELECT_CLASS}
            >
              <option value="مع الرفع على النظام">مع الرفع على النظام</option>
              <option value="بدون رفع على النظام">بدون رفع على النظام</option>
            </select>
          </Field>
        </div>
      </div>

      <div className="rounded-[24px] border border-orange-200 bg-orange-50/60 p-4">
        <div className="mb-4 flex items-center gap-2 border-b border-orange-200 pb-3 text-xs font-black text-orange-800">
          <ShieldCheck className="h-4 w-4" />
          بيانات الرخصة والمنصات التابعة للمكتب
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field label="رقم الرخصة" icon={FileText}>
            <input
              type="text"
              value={coopFeeForm.licenseNumber}
              onChange={(e) =>
                setCoopFeeForm({
                  ...coopFeeForm,
                  licenseNumber: e.target.value,
                })
              }
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="سنة الرخصة هجرية" icon={CalendarDays}>
            <input
              type="text"
              value={coopFeeForm.licenseYear}
              onChange={(e) =>
                setCoopFeeForm({
                  ...coopFeeForm,
                  licenseYear: e.target.value,
                })
              }
              className={INPUT_CLASS}
            />
          </Field>

          <Field label="رقم الخدمة" icon={ReceiptText}>
            <input
              type="text"
              value={coopFeeForm.serviceNumber}
              onChange={(e) =>
                setCoopFeeForm({
                  ...coopFeeForm,
                  serviceNumber: e.target.value,
                })
              }
              className={INPUT_CLASS}
            />
          </Field>

          <div className="md:col-span-3">
            <Field label="اسم الجهة" icon={Landmark}>
              <input
                type="text"
                value={coopFeeForm.entityName}
                onChange={(e) =>
                  setCoopFeeForm({
                    ...coopFeeForm,
                    entityName: e.target.value,
                  })
                }
                placeholder="مثال: أمانة منطقة الرياض"
                className={INPUT_CLASS}
              />
            </Field>
          </div>
        </div>
      </div>
    </div>
  </ModalShell>
);

// ============================================================
// 7. نافذة تسديد أتعاب للمعقب أو الوسيط
// ============================================================

export const PayPersonModal = ({
  payPersonData,
  setPayPersonData,
  payPersonMutation,
  payRemoteTaskMutation,
  tx,
  remoteWorkersList = [],
  exchangeRates,
}) => (
  <ModalShell
    open={!!payPersonData}
    onClose={() => setPayPersonData(null)}
    title={`تسديد مستحقات (${payPersonData?.targetType || ""})`}
    subtitle={
      payPersonData
        ? `الاسم: ${payPersonData.workerName} | التفاصيل: ${payPersonData.taskName}`
        : ""
    }
    icon={Banknote}
    iconText="دفع"
    tone="emerald"
    maxWidth="max-w-xl"
    zIndex="z-[240]"
    footer={
      payPersonData && (
        <FooterActions
          onCancel={() => setPayPersonData(null)}
          onConfirm={() => {
            if (!payPersonData.amountSar) {
              return toast.error("الرجاء إدخال المبلغ");
            }

            const payload = {
              targetType: payPersonData.targetType,
              targetId:
                payPersonData.targetId ||
                remoteWorkersList.find(
                  (worker) => worker.name === payPersonData.workerName,
                )?.id,
              transactionId: tx.id,
              amount: parseFloat(payPersonData.amountSar),
              status: "DELIVERED",
              source: "سداد مباشر من المعاملة",
              notes: `تاريخ الدفع: ${payPersonData.paymentDate} | نوع السداد: ${
                payPersonData.paymentType === "full"
                  ? "سداد كلي للمتبقي"
                  : "سداد جزئي"
              }`,
            };

            payPersonMutation.mutate(payload);

            if (
              payPersonData.targetType === "موظف عن بعد" &&
              payPersonData.taskId
            ) {
              payRemoteTaskMutation.mutate({
                taskId: payPersonData.taskId,
                workerId: payload.targetId,
                transactionId: tx.id,
                amountSar: payload.amount,
                paymentDate: payPersonData.paymentDate,
                isFullPayment: payPersonData.paymentType === "full",
              });
            }
          }}
          confirmLabel="تأكيد الدفع"
          pending={payPersonMutation.isPending || payRemoteTaskMutation.isPending}
          tone="emerald"
          icon={Banknote}
        />
      )
    }
  >
    {payPersonData && (
      <PaymentBody
        data={payPersonData}
        setData={setPayPersonData}
        exchangeRates={exchangeRates}
        fullLabel={`كامل المتبقي (${payPersonData.totalCost} ر.س)`}
      />
    )}
  </ModalShell>
);

// ============================================================
// 8. نافذة تسديد أتعاب مهمة عمل عن بعد
// ============================================================

export const PayTaskModal = ({
  payTaskData,
  setPayTaskData,
  remoteWorkersList = [],
  tx,
  exchangeRates,
  payRemoteTaskMutation,
}) => (
  <ModalShell
    open={!!payTaskData}
    onClose={() => setPayTaskData(null)}
    title="تسديد أتعاب موظف"
    subtitle={
      payTaskData
        ? `الموظف: ${payTaskData.workerName} | المهمة: ${payTaskData.taskName}`
        : ""
    }
    icon={Banknote}
    iconText="دفع"
    tone="emerald"
    maxWidth="max-w-xl"
    zIndex="z-[240]"
    footer={
      payTaskData && (
        <FooterActions
          onCancel={() => setPayTaskData(null)}
          onConfirm={() => {
            if (!payTaskData.amountSar) {
              return toast.error("الرجاء إدخال المبلغ");
            }

            const payload = {
              taskId: payTaskData.taskId,
              workerId: remoteWorkersList.find(
                (worker) => worker.name === payTaskData.workerName,
              )?.id,
              transactionId: tx.id,
              amountSar: parseFloat(payTaskData.amountSar),
              paymentDate: payTaskData.paymentDate,
              isFullPayment: payTaskData.paymentType === "full",
            };

            payRemoteTaskMutation.mutate(payload);
          }}
          confirmLabel="تأكيد الدفع"
          pending={payRemoteTaskMutation.isPending}
          tone="emerald"
          icon={Banknote}
        />
      )
    }
  >
    {payTaskData && (
      <PaymentBody
        data={payTaskData}
        setData={setPayTaskData}
        exchangeRates={exchangeRates}
        fullLabel={`كامل المبلغ (${payTaskData.totalCost} ر.س)`}
      />
    )}
  </ModalShell>
);

const PaymentBody = ({ data, setData, exchangeRates, fullLabel }) => (
  <div className="space-y-5">
    <Field label="مقدار الدفعة" icon={Wallet}>
      <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#e8ddc8] bg-white p-1.5 sm:grid-cols-2">
        <button
          onClick={() =>
            setData({
              ...data,
              paymentType: "full",
              amountSar: data.totalCost,
            })
          }
          className={`
            rounded-xl px-4 py-2.5 text-xs font-black transition
            ${
              data.paymentType === "full"
                ? "bg-emerald-600 text-white"
                : "text-[#64748b] hover:bg-emerald-50 hover:text-emerald-700"
            }
          `}
          type="button"
        >
          {fullLabel}
        </button>

        <button
          onClick={() =>
            setData({
              ...data,
              paymentType: "partial",
              amountSar: "",
            })
          }
          className={`
            rounded-xl px-4 py-2.5 text-xs font-black transition
            ${
              data.paymentType === "partial"
                ? "bg-emerald-600 text-white"
                : "text-[#64748b] hover:bg-emerald-50 hover:text-emerald-700"
            }
          `}
          type="button"
        >
          جزء من المبلغ
        </button>
      </div>
    </Field>

    <CurrencyPanel tone="emerald" title="المبلغ الفعلي المدفوع">
      <TripleCurrencyInput
        valueSar={data.amountSar}
        onChangeSar={(value) => setData({ ...data, amountSar: value })}
        rates={exchangeRates}
      />
    </CurrencyPanel>

    <Field label="تاريخ الدفع" icon={CalendarDays}>
      <input
        type="date"
        value={data.paymentDate}
        onChange={(e) =>
          setData({
            ...data,
            paymentDate: e.target.value,
          })
        }
        className={`${INPUT_CLASS} font-mono`}
        dir="ltr"
      />
    </Field>
  </div>
);
