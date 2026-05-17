import React, { useState } from "react";
import {
  Calculator,
  Banknote,
  Check,
  Plus,
  ChevronUp,
  ChevronDown,
  Trash2,
  Wallet,
  Save,
  Loader2,
  User,
  Handshake,
  Monitor,
  PieChart,
  Scale,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  AlertCircle,
  ReceiptText,
  Coins,
  DollarSign,
  Landmark,
  FileText,
  Sparkles,
} from "lucide-react";

import { safeNum } from "../../utils/transactionUtils";

// =========================================================================
// حقل إدخال عملة ذكي + تحويل SAR -> USD / EGP
// =========================================================================
const FormattedCurrencyInput = ({
  value,
  onChange,
  placeholder = "0",
  rates,
  compact = false,
}) => {
  const numericValue = safeNum(value);
  const displayValue = numericValue > 0 ? Number(numericValue).toLocaleString("en-US") : "";

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    onChange(rawValue ? parseFloat(rawValue) : 0);
  };

  const inputWidth = `${Math.min(Math.max(displayValue.length + 1, 4), 14)}ch`;

  const usdRate = rates?.find((r) => r.currency === "USD")?.rate || 0.266;
  const egpRate = rates?.find((r) => r.currency === "EGP")?.rate || 13.2;

  const usdValue = numericValue * usdRate;
  const egpValue = numericValue * egpRate;

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div
        className="
          flex items-center gap-1.5 rounded-2xl
          border border-[#d8b46a]/25 bg-white
          px-3 py-2 shadow-sm transition-all
          hover:border-[#c5983c]/55
          focus-within:border-[#c5983c]/80
          focus-within:ring-4 focus-within:ring-[#c5983c]/10
        "
      >
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          style={{
            width: inputWidth,
            minWidth: compact ? "48px" : "64px",
            maxWidth: compact ? "130px" : "170px",
          }}
          className="
            bg-transparent text-center font-mono text-lg
            font-black text-[#123f59] outline-none
            placeholder:text-[#94a3b8]
          "
          dir="ltr"
        />

        <span className="select-none text-[10px] font-black text-[#94a3b8]">
          ر.س
        </span>
      </div>

      {!compact && numericValue > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5">
          <CurrencyChip label="USD" value={`$${usdValue.toLocaleString(undefined, { maximumFractionDigits: 1 })}`} tone="blue" />
          <CurrencyChip label="EGP" value={`£${egpValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`} tone="emerald" />
        </div>
      )}
    </div>
  );
};

// =========================================================================
// المكون الرئيسي: التبويب المالي
// =========================================================================
export const FinancialTab = ({
  tx,
  editFormData,
  setEditFormData,
  exchangeRates,
  totalFees,
  editNetAmount,
  editTaxAmount,
  openSections,
  toggleSection,
  setIsAddBrokerModalOpen,
  deleteBrokerMutation,
  setIsAddAgentOpen,
  deleteAgentMutation,
  setIsAddRemoteTaskOpen,
  deleteRemoteTaskMutation,
  setPayPersonData,
  setPayTaskData,
  actualExpenses,
  addExpenseMutation,
  expenseForm,
  setExpenseForm,
  estimatedProfit,
  totalCosts,
  reserveDeduction,
  distributableProfit,
  availableForPartners,
  updateTxMutation,
  setActiveTab,
  sourcePercent,
  sourceShare,
}) => {
  const [isDirty, setIsDirty] = useState(false);

  const handleFinancialChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setIsDirty(true);
  };

  const handleTaxTypeChange = (e) => {
    setEditFormData((prev) => ({
      ...prev,
      taxType: e.target.value,
    }));

    setIsDirty(true);
  };

  const handleSave = () => {
    updateTxMutation.mutate(editFormData, {
      onSuccess: () => {
        setIsDirty(false);
      },
    });
  };

  return (
    <div
      className="
        relative min-h-full space-y-5 p-4 pb-28 md:p-5
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal] animate-in fade-in duration-300
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          p-5 text-white
          shadow-[0_20px_55px_rgba(18,63,89,0.18)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-14 w-14 shrink-0 place-items-center
                rounded-3xl border border-[#e2bf74]/35
                bg-white/12 text-[#e2bf74]
                shadow-[0_14px_30px_rgba(0,0,0,0.20)]
              "
            >
              <Calculator className="h-7 w-7" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-lg font-black md:text-xl">
                المحرك المالي
              </h2>

              <p className="mt-1 text-xs font-bold text-white/65">
                تعديل مباشر للأرقام مع حساب الصافي، التكاليف، الأرباح، التسويات، وحصص الشركاء.
              </p>
            </div>
          </div>

          <div
            className="
              flex w-fit items-center gap-2 rounded-2xl
              border border-[#e2bf74]/25 bg-[#e2bf74]/15
              px-4 py-2 text-xs font-black text-[#f8efe0]
            "
          >
            <Sparkles className="h-4 w-4 text-[#e2bf74]" />
            يتم الحفظ بعد الضغط على زر حفظ التعديلات المالية
          </div>
        </div>
      </div>

      {/* Revenue */}
      <section
        className="
          overflow-hidden rounded-[30px]
          border border-emerald-200 bg-white/90
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          backdrop-blur-xl
        "
      >
        <div
          className="
            flex flex-col gap-5 border-b border-emerald-100
            bg-gradient-to-l from-emerald-50 via-white to-[#fbf8f1]
            p-5 lg:flex-row lg:items-center lg:justify-between
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                grid h-12 w-12 shrink-0 place-items-center
                rounded-2xl border border-emerald-200
                bg-emerald-50 text-emerald-700
              "
            >
              <TrendingUp className="h-6 w-6" />
            </span>

            <div>
              <h3 className="text-sm font-black text-[#123f59]">
                الإيرادات وقيمة التعاقد
              </h3>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                إجمالي المبلغ المتفق عليه مع العميل مع طريقة احتساب الضريبة.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <select
              value={editFormData.taxType || "بدون احتساب ضريبة"}
              onChange={handleTaxTypeChange}
              className="
                h-11 rounded-2xl border border-emerald-200
                bg-white px-4 text-xs font-black text-emerald-800
                shadow-sm outline-none transition-all
                focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
              "
            >
              <option value="بدون احتساب ضريبة">بدون ضريبة / صافي</option>
              <option value="شامل الضريبة">شامل الضريبة 15%</option>
              <option value="غير شامل الضريبة">غير شامل / تضاف 15%</option>
            </select>

            <FormattedCurrencyInput
              value={editFormData.totalFees}
              onChange={(val) => handleFinancialChange("totalFees", val)}
              rates={exchangeRates}
            />
          </div>
        </div>

        {editFormData.taxType !== "بدون احتساب ضريبة" && (
          <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
            <MiniFinancialCard
              icon={Landmark}
              label="المبلغ الصافي"
              value={`${editNetAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ر.س`}
              tone="emerald"
            />

            <MiniFinancialCard
              icon={ReceiptText}
              label="ضريبة القيمة المضافة"
              value={`${editTaxAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ر.س`}
              tone="rose"
            />
          </div>
        )}
      </section>

      {/* Costs sections */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Brokers */}
        <CostSection
          id="brokers"
          title="أتعاب الوسطاء"
          subtitle="إدارة الوسطاء، الأتعاب، المدفوع، والمتبقي."
          icon={Handshake}
          tone="indigo"
          isOpen={openSections.brokers}
          onToggle={() => toggleSection("brokers")}
          headerValue={
            <FormattedCurrencyInput
              value={editFormData.mediatorFees || 0}
              onChange={(val) => handleFinancialChange("mediatorFees", val)}
              rates={exchangeRates}
              compact
            />
          }
        >
          <PersonCostList
            emptyText="لا يوجد وسطاء"
            items={tx.brokers || []}
            getCost={(item) => safeNum(item.fees)}
            getPaid={(item) =>
              tx.settlements
                ?.filter(
                  (settlement) =>
                    settlement.targetId === item.personId &&
                    settlement.status === "DELIVERED",
                )
                .reduce((sum, settlement) => sum + settlement.amount, 0) || 0
            }
            getName={(item) => item.name}
            getSubText={() => "أتعاب وساطة"}
            onPay={(item, remaining) =>
              setPayPersonData({
                targetType: "وسيط",
                targetId: item.personId,
                workerName: item.name,
                taskName: "أتعاب وساطة",
                totalCost: remaining,
                paymentType: "full",
                amountSar: remaining,
                paymentDate: new Date().toISOString().split("T")[0],
              })
            }
            onDelete={(item) => deleteBrokerMutation.mutate(item.id)}
            deletePending={deleteBrokerMutation.isPending}
            payButtonLabel="سداد"
          />

          <DashedAddButton
            label="ربط وسيط جديد"
            tone="indigo"
            onClick={() => setIsAddBrokerModalOpen(true)}
          />
        </CostSection>

        {/* Agents */}
        <CostSection
          id="agents"
          title="أتعاب المعقبين"
          subtitle="متابعة أتعاب التعقيب والمدفوعات لكل معقب."
          icon={User}
          tone="cyan"
          isOpen={openSections.agents}
          onToggle={() => toggleSection("agents")}
          headerValue={
            <FormattedCurrencyInput
              value={editFormData.agentCost || 0}
              onChange={(val) => handleFinancialChange("agentCost", val)}
              rates={exchangeRates}
              compact
            />
          }
        >
          <PersonCostList
            emptyText="لا يوجد معقبين"
            items={tx.agents || []}
            getCost={(item) => safeNum(item.fees)}
            getPaid={(item) =>
              tx.settlements
                ?.filter(
                  (settlement) =>
                    settlement.targetId === item.id &&
                    settlement.status === "DELIVERED",
                )
                .reduce((sum, settlement) => sum + settlement.amount, 0) || 0
            }
            getName={(item) => item.name}
            getSubText={(item) => item.role || "أتعاب تعقيب"}
            onPay={(item, remaining) =>
              setPayPersonData({
                targetType: "معقب",
                targetId: item.id,
                workerName: item.name,
                taskName: item.role || "أتعاب تعقيب",
                totalCost: remaining,
                paymentType: "full",
                amountSar: remaining,
                paymentDate: new Date().toISOString().split("T")[0],
              })
            }
            onDelete={(item) => deleteAgentMutation.mutate(item.id)}
            deletePending={deleteAgentMutation.isPending}
            payButtonLabel="سداد"
          />

          <DashedAddButton
            label="ربط معقب جديد"
            tone="cyan"
            onClick={() => setIsAddAgentOpen(true)}
          />
        </CostSection>

        {/* Remote tasks */}
        <CostSection
          id="remote"
          title="مهام العمل عن بعد"
          subtitle="تكاليف المهام الخارجية أو الأعمال المسندة عن بعد."
          icon={Monitor}
          tone="purple"
          isOpen={openSections.remote}
          onToggle={() => toggleSection("remote")}
          headerValue={
            <StaticMoneyValue value={safeNum(tx.remoteCost)} />
          }
        >
          {tx.remoteTasks?.length > 0 ? (
            <div className="mb-4 space-y-3">
              {tx.remoteTasks.map((task, index) => {
                const taskCost = safeNum(task.cost);
                const taskPaid = task.isPaid ? taskCost : safeNum(task.paidAmount);
                const taskRemaining = Math.max(0, taskCost - taskPaid);

                return (
                  <CostRow
                    key={task.id || index}
                    title={task.taskName}
                    subtitle={task.workerName}
                    cost={taskCost}
                    paid={taskPaid}
                    remaining={taskRemaining}
                    payLabel="تسوية"
                    tone="purple"
                    onPay={() =>
                      setPayTaskData({
                        taskId: task.id,
                        workerName: task.workerName,
                        taskName: task.taskName,
                        totalCost: taskRemaining,
                        paymentType: "full",
                        amountSar: taskRemaining,
                        paymentDate: new Date().toISOString().split("T")[0],
                      })
                    }
                    onDelete={() => deleteRemoteTaskMutation.mutate(task.id)}
                    deletePending={deleteRemoteTaskMutation.isPending}
                  />
                );
              })}
            </div>
          ) : (
            <EmptyInline text="لا توجد مهام عمل عن بعد" />
          )}

          <DashedAddButton
            label="إسناد مهمة جديدة"
            tone="purple"
            onClick={() => setIsAddRemoteTaskOpen(true)}
          />
        </CostSection>

        {/* Expenses */}
        <CostSection
          id="expenses"
          title="مصاريف وتشغيل"
          subtitle="المصاريف التشغيلية والمبالغ الإضافية المصروفة على المعاملة."
          icon={Wallet}
          tone="rose"
          isOpen={openSections.expenses}
          onToggle={() => toggleSection("expenses")}
          headerValue={<StaticMoneyValue value={safeNum(actualExpenses)} />}
        >
          <div
            className="
              mb-4 rounded-[24px] border border-rose-200
              bg-rose-50/65 p-4
            "
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
              <input
                type="text"
                value={expenseForm.description}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    description: e.target.value,
                  })
                }
                placeholder="وصف المصروف..."
                className="sm:col-span-6 input-premium"
              />

              <input
                type="number"
                value={expenseForm.amount}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    amount: e.target.value,
                  })
                }
                placeholder="المبلغ"
                className="sm:col-span-3 input-premium text-center font-mono"
              />

              <input
                type="date"
                value={expenseForm.date}
                onChange={(e) =>
                  setExpenseForm({
                    ...expenseForm,
                    date: e.target.value,
                  })
                }
                className="sm:col-span-3 input-premium"
              />
            </div>

            <button
              onClick={() => {
                addExpenseMutation.mutate(expenseForm);
                setIsDirty(true);
              }}
              disabled={
                addExpenseMutation.isPending ||
                !expenseForm.amount ||
                !expenseForm.description
              }
              className="
                mt-3 flex h-10 w-full items-center justify-center gap-2
                rounded-2xl bg-rose-600 px-4
                text-xs font-black text-white
                transition hover:bg-rose-700
                disabled:cursor-not-allowed disabled:opacity-50
              "
              type="button"
            >
              {addExpenseMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              إضافة المصروف
            </button>
          </div>

          {tx.expenses?.length > 0 ? (
            <div className="max-h-[230px] space-y-2 overflow-y-auto pr-1 custom-scrollbar-slim">
              {tx.expenses.map((expense, index) => (
                <div
                  key={expense.id || index}
                  className="
                    flex items-center justify-between gap-3
                    rounded-2xl border border-[#e8ddc8]
                    bg-white p-3 shadow-sm
                  "
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black text-[#123f59]">
                      {expense.description || expense.notes || expense.item}
                    </p>

                    <p className="mt-1 font-mono text-[10px] font-bold text-[#94a3b8]">
                      {new Date(expense.date || expense.createdAt).toLocaleDateString("en-GB")}
                    </p>
                  </div>

                  <span
                    className="
                      rounded-xl border border-rose-200
                      bg-rose-50 px-3 py-1.5
                      font-mono text-xs font-black text-rose-600
                    "
                  >
                    {safeNum(expense.amount).toLocaleString()} ر.س
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyInline text="لا توجد مصاريف" />
          )}
        </CostSection>
      </div>

      {/* Profit dashboard */}
      <section
        className="
          relative overflow-hidden rounded-[32px]
          border border-[#d8b46a]/25
          bg-[#06111d] p-6 text-white
          shadow-[0_24px_70px_rgba(6,17,29,0.28)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-90px] top-[-90px] h-72 w-72 rounded-full bg-[#e2bf74]/14 blur-[80px]" />
          <div className="absolute left-[-100px] bottom-[-100px] h-72 w-72 rounded-full bg-emerald-500/14 blur-[80px]" />
          <div className="absolute left-[40%] top-[20%] h-56 w-56 rounded-full bg-cyan-500/10 blur-[80px]" />
        </div>

        <div className="relative z-10">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <span
                className="
                  grid h-12 w-12 place-items-center rounded-2xl
                  border border-[#e2bf74]/30
                  bg-white/10 text-[#e2bf74]
                "
              >
                <PieChart className="h-6 w-6" />
              </span>

              <div>
                <h3 className="text-lg font-black">
                  الخلاصة المالية وتوزيع الأرباح
                </h3>

                <p className="mt-0.5 text-xs font-bold text-white/55">
                  ملخص الربحية، الاحتياطي، حصة المصدر، وصافي التوزيع.
                </p>
              </div>
            </div>

            <div
              className="
                flex w-fit items-center gap-2 rounded-2xl
                border border-white/15 bg-white/10
                px-4 py-2 text-[11px] font-black text-white/75
              "
            >
              <ShieldCheck className="h-4 w-4 text-[#e2bf74]" />
              حسابات تقديرية حسب البيانات الحالية
            </div>
          </div>

          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <DarkMetricCard
              label="إجمالي التكاليف"
              value={totalCosts}
              tone="rose"
              icon={ReceiptText}
            />

            <DarkMetricCard
              label="الربح التقديري"
              value={estimatedProfit}
              tone="emerald"
              icon={TrendingUp}
            />

            <DarkMetricCard
              label="خصم الاحتياطي 10%"
              value={reserveDeduction}
              tone="cyan"
              icon={ShieldCheck}
            />

            <DarkMetricCard
              label={`حصة المُصدر ${sourcePercent || 0}%`}
              value={sourceShare}
              tone="purple"
              icon={Coins}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ProfitActionCard
              label="الصافي القابل للتسوية"
              value={distributableProfit}
              icon={Scale}
              buttonLabel="إجراء تسوية"
              tone="emerald"
              onClick={() => setActiveTab("settlement")}
            />

            <ProfitActionCard
              label="أرباح الشركاء للتوزيع"
              value={availableForPartners}
              icon={PieChart}
              buttonLabel="عرض التوزيع"
              tone="amber"
              onClick={() => setActiveTab("profits")}
            />
          </div>
        </div>
      </section>

      {/* Floating save */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-5">
          <button
            onClick={handleSave}
            disabled={updateTxMutation.isPending}
            className="
              flex items-center gap-3 rounded-full
              bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
              px-8 py-3.5 text-base font-black text-white
              shadow-[0_18px_45px_rgba(18,63,89,0.30)]
              transition hover:-translate-y-[2px]
              disabled:cursor-not-allowed disabled:opacity-50
            "
            type="button"
          >
            {updateTxMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
            ) : (
              <Save className="h-5 w-5 text-[#e2bf74]" />
            )}
            حفظ التعديلات المالية
          </button>
        </div>
      )}
    </div>
  );
};

// =========================================================================
// Components
// =========================================================================

const CostSection = ({
  title,
  subtitle,
  icon: Icon,
  tone,
  isOpen,
  onToggle,
  headerValue,
  children,
}) => {
  const toneClass = getToneClass(tone);

  return (
    <section
      className="
        overflow-hidden rounded-[28px]
        border border-[#d8b46a]/30 bg-white/90
        shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        backdrop-blur-xl
      "
    >
      <button
        onClick={onToggle}
        className="
          flex w-full flex-col gap-4
          border-b border-[#e8ddc8]
          bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
          p-4 text-right transition hover:bg-[#fbf8f1]
          sm:flex-row sm:items-center sm:justify-between
        "
        type="button"
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`
              grid h-11 w-11 shrink-0 place-items-center
              rounded-2xl border ${toneClass.icon}
            `}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div className="min-w-0">
            <h3 className="truncate text-sm font-black text-[#123f59]">
              {title}
            </h3>

            <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <div onClick={(e) => e.stopPropagation()}>
            {headerValue}
          </div>

          <span
            className="
              grid h-9 w-9 shrink-0 place-items-center
              rounded-xl border border-[#e8ddc8]
              bg-white text-[#64748b]
            "
          >
            {isOpen ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="p-4 animate-in slide-in-from-top-2">
          {children}
        </div>
      )}
    </section>
  );
};

const PersonCostList = ({
  items,
  emptyText,
  getCost,
  getPaid,
  getName,
  getSubText,
  onPay,
  onDelete,
  deletePending,
  payButtonLabel,
}) => {
  if (!items?.length) {
    return <EmptyInline text={emptyText} />;
  }

  return (
    <div className="mb-4 space-y-3">
      {items.map((item, index) => {
        const cost = safeNum(getCost(item));
        const paid = safeNum(getPaid(item));
        const remaining = Math.max(0, cost - paid);

        return (
          <CostRow
            key={item.id || item.personId || index}
            title={getName(item)}
            subtitle={getSubText(item)}
            cost={cost}
            paid={paid}
            remaining={remaining}
            payLabel={payButtonLabel}
            tone="amber"
            onPay={() => onPay(item, remaining)}
            onDelete={() => onDelete(item)}
            deletePending={deletePending}
          />
        );
      })}
    </div>
  );
};

const CostRow = ({
  title,
  subtitle,
  cost,
  paid,
  remaining,
  payLabel,
  tone = "amber",
  onPay,
  onDelete,
  deletePending,
}) => (
  <div
    className="
      rounded-[22px] border border-[#e8ddc8]
      bg-white p-3 shadow-sm
    "
  >
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h4 className="truncate text-xs font-black text-[#123f59]">
          {title}
        </h4>

        {subtitle && (
          <p className="mt-1 truncate text-[10px] font-bold text-[#64748b]">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <MoneyBadge label="تكلفة" value={cost} tone="slate" />
        <MoneyBadge label="مدفوع" value={paid} tone="emerald" />
        <MoneyBadge label="متبقي" value={remaining} tone={remaining > 0 ? "rose" : "emerald"} />
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {remaining > 0 ? (
          <button
            onClick={onPay}
            className={`
              rounded-xl px-3 py-2 text-[10px] font-black
              transition hover:-translate-y-[1px]
              ${getPayButtonClass(tone)}
            `}
            type="button"
          >
            {payLabel} ({remaining.toLocaleString()})
          </button>
        ) : (
          <span
            className="
              inline-flex items-center gap-1 rounded-xl
              border border-emerald-200 bg-emerald-50
              px-3 py-2 text-[10px] font-black text-emerald-700
            "
          >
            <Check className="h-3.5 w-3.5" />
            مسدد
          </span>
        )}

        <button
          onClick={onDelete}
          disabled={deletePending}
          className="
            grid h-9 w-9 place-items-center rounded-xl
            border border-rose-200 bg-rose-50
            text-rose-600 transition hover:bg-rose-100
            disabled:cursor-not-allowed disabled:opacity-50
          "
          type="button"
        >
          {deletePending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  </div>
);

const StaticMoneyValue = ({ value }) => (
  <div
    className="
      rounded-2xl border border-[#d8b46a]/25
      bg-white px-4 py-2
      font-mono text-lg font-black text-[#123f59]
      shadow-sm
    "
    dir="ltr"
  >
    {safeNum(value).toLocaleString()}
    <span className="mr-1 text-[10px] font-black text-[#94a3b8]">
      ر.س
    </span>
  </div>
);

const MiniFinancialCard = ({ icon: Icon, label, value, tone }) => {
  const toneClass = getToneClass(tone);

  return (
    <div
      className="
        rounded-[24px] border border-[#d8b46a]/25
        bg-white p-4 shadow-sm
      "
    >
      <div className="flex items-center gap-3">
        <span
          className={`
            grid h-11 w-11 place-items-center rounded-2xl border
            ${toneClass.icon}
          `}
        >
          <Icon className="h-5 w-5" />
        </span>

        <div>
          <p className="text-[11px] font-black text-[#64748b]">
            {label}
          </p>

          <p className="mt-1 font-mono text-lg font-black text-[#123f59]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

const MoneyBadge = ({ label, value, tone }) => {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-xl border
        px-2.5 py-1 text-[9px] font-black
        ${tones[tone] || tones.slate}
      `}
    >
      <span className="opacity-75">{label}:</span>
      <span className="font-mono">{safeNum(value).toLocaleString()}</span>
    </span>
  );
};

const CurrencyChip = ({ label, value, tone }) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-xl border
        px-2 py-0.5 text-[9px] font-black
        ${tones[tone] || tones.blue}
      `}
    >
      <span className="opacity-70">{label}</span>
      <span className="font-mono">{value}</span>
    </span>
  );
};

const DashedAddButton = ({ label, tone, onClick }) => {
  const toneClass = getToneClass(tone);

  return (
    <button
      onClick={onClick}
      className={`
        flex h-11 w-full items-center justify-center gap-2
        rounded-2xl border border-dashed text-xs font-black
        transition hover:-translate-y-[1px]
        ${toneClass.add}
      `}
      type="button"
    >
      <Plus className="h-4 w-4" />
      {label}
    </button>
  );
};

const EmptyInline = ({ text }) => (
  <div
    className="
      mb-4 flex min-h-[88px] flex-col items-center justify-center
      rounded-[22px] border border-dashed border-[#d8b46a]/35
      bg-[#fbf8f1]/70 px-4 py-5 text-center
    "
  >
    <AlertCircle className="mb-2 h-6 w-6 text-[#c5983c]" />
    <p className="text-xs font-black text-[#94a3b8]">
      {text}
    </p>
  </div>
);

const DarkMetricCard = ({ icon: Icon, label, value, tone }) => {
  const tones = {
    rose: "text-rose-400 border-rose-400/20 bg-rose-400/8",
    emerald: "text-emerald-400 border-emerald-400/20 bg-emerald-400/8",
    cyan: "text-cyan-400 border-cyan-400/20 bg-cyan-400/8",
    purple: "text-purple-400 border-purple-400/20 bg-purple-400/8",
  };

  return (
    <div
      className={`
        rounded-[24px] border p-4 backdrop-blur-xl
        ${tones[tone] || tones.cyan}
      `}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[10px] font-black text-white/50">
          {label}
        </span>

        <Icon className="h-4 w-4" />
      </div>

      <div className="font-mono text-xl font-black text-white">
        {safeNum(value).toLocaleString()}
        <span className="mr-1 text-[10px] font-bold text-white/40">
          ر.س
        </span>
      </div>
    </div>
  );
};

const ProfitActionCard = ({
  label,
  value,
  icon: Icon,
  buttonLabel,
  tone,
  onClick,
}) => {
  const tones = {
    emerald: {
      card: "border-emerald-500/30 from-emerald-900/40 to-white/5",
      text: "text-emerald-300",
      button: "bg-emerald-500 hover:bg-emerald-400 text-[#06111d]",
    },
    amber: {
      card: "border-amber-500/30 from-amber-900/40 to-white/5",
      text: "text-amber-300",
      button: "bg-amber-500 hover:bg-amber-400 text-[#06111d]",
    },
  };

  const toneClass = tones[tone] || tones.emerald;

  return (
    <div
      className={`
        flex flex-col gap-4 rounded-[26px] border
        bg-gradient-to-l p-5 sm:flex-row sm:items-center sm:justify-between
        ${toneClass.card}
      `}
    >
      <div>
        <p className={`mb-1 text-[11px] font-black ${toneClass.text}`}>
          {label}
        </p>

        <div className="font-mono text-3xl font-black text-white">
          {safeNum(value).toLocaleString()}
          <span className="mr-1 text-[12px] font-bold text-white/45">
            ر.س
          </span>
        </div>
      </div>

      <button
        onClick={onClick}
        className={`
          flex h-12 items-center justify-center gap-2
          rounded-2xl px-5 text-sm font-black
          shadow-[0_14px_30px_rgba(0,0,0,0.18)]
          transition hover:-translate-y-[1px]
          ${toneClass.button}
        `}
        type="button"
      >
        <Icon className="h-4 w-4" />
        {buttonLabel}
      </button>
    </div>
  );
};

const getToneClass = (tone) => {
  const tones = {
    indigo: {
      icon: "border-indigo-200 bg-indigo-50 text-indigo-700",
      add: "border-indigo-300 bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
    },
    cyan: {
      icon: "border-cyan-200 bg-cyan-50 text-cyan-800",
      add: "border-cyan-300 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
    },
    purple: {
      icon: "border-purple-200 bg-purple-50 text-purple-700",
      add: "border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100",
    },
    rose: {
      icon: "border-rose-200 bg-rose-50 text-rose-700",
      add: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
    },
    emerald: {
      icon: "border-emerald-200 bg-emerald-50 text-emerald-700",
      add: "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    },
  };

  return tones[tone] || tones.cyan;
};

const getPayButtonClass = (tone) => {
  const tones = {
    amber: "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
    purple: "border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
  };

  return tones[tone] || tones.amber;
};