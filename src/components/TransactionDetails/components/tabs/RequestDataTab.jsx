import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  Building,
  User,
  Inbox,
  Mail,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Bot,
  ClipboardList,
  PenLine,
  Map,
  FileSignature,
  Copy,
  X,
  Save,
  Link2,
  ShieldCheck,
  Hash,
  CalendarDays,
  FileText,
  CheckCircle,
} from "lucide-react";

export const RequestDataTab = ({
  tx,
  requestDataForm,
  setRequestDataForm,
  saveRequestDataEdits,
  updateTxMutation,
  isApprovalRequest,
  offices = [],
  persons = [],
}) => {
  const [editingField, setEditingField] = useState(null);

  const handleChange = (field, value) => {
    setRequestDataForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSingleField = async (e) => {
    e?.preventDefault();

    if (updateTxMutation.isPending) return;

    saveRequestDataEdits();
    setEditingField(null);
  };

  const handleCopy = async (text, label) => {
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      toast.success(`تم نسخ ${label} بنجاح`);
    } catch {
      toast.error("تعذر النسخ، حاول مرة أخرى");
    }
  };

  const {
    data: relatedEmails = [],
    isLoading: emailsLoading,
    refetch: refetchEmails,
  } = useQuery({
    queryKey: [
      "related-emails",
      requestDataForm.serviceNumber,
      requestDataForm.requestNumber,
    ],
    queryFn: async () => {
      if (!requestDataForm.serviceNumber && !requestDataForm.requestNumber) {
        return [];
      }

      const res = await api.get(`/email/messages/search`, {
        params: {
          serviceNumber: requestDataForm.serviceNumber,
          reqNumber: requestDataForm.requestNumber,
        },
      });

      return res.data?.data || [];
    },
    enabled: !!(requestDataForm.serviceNumber || requestDataForm.requestNumber),
  });

  const hasAgreementValue =
    requestDataForm.hasAgreement !== undefined
      ? requestDataForm.hasAgreement
      : tx?.hasAgreement || false;

  const FieldShell = ({ children, label, icon: Icon }) => (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-[#64748b]">
        {Icon && <Icon className="h-3.5 w-3.5 text-[#c5983c]" />}
        {label}
      </label>
      {children}
    </div>
  );

  const EditableField = ({
    label,
    field,
    value,
    type = "text",
    options = [],
    isSelect = false,
    icon,
  }) => {
    const isEditingThis = editingField === field;
    const hasValue = value && value.toString().trim() !== "";

    const displayValue = isSelect
      ? options.find((o) => (o.id || o.name) === value)?.name || "—"
      : value || "—";

    return (
      <FieldShell label={label} icon={icon}>
        {isEditingThis ? (
          <div
            className="
              rounded-2xl border border-[#d8b46a]/35
              bg-[#fbf8f1] p-3 shadow-sm
            "
          >
            {isSelect ? (
              <select
                value={value || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="
                  h-11 w-full rounded-xl border border-[#d8b46a]/35
                  bg-white px-3 text-xs font-black text-[#123f59]
                  outline-none transition
                  focus:border-[#c5983c]
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
                autoFocus
              >
                <option value="">-- يرجى الاختيار --</option>

                {options.map((o) => (
                  <option key={o.id || o.name} value={o.id || o.name}>
                    {o.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={type}
                value={value || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="
                  h-11 w-full rounded-xl border border-[#d8b46a]/35
                  bg-white px-3 text-xs font-black text-[#123f59]
                  outline-none transition
                  focus:border-[#c5983c]
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
                dir={type === "date" ? "ltr" : "rtl"}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSingleField();
                  if (e.key === "Escape") setEditingField(null);
                }}
              />
            )}

            <div className="mt-3 flex gap-2">
              <button
                onClick={handleSaveSingleField}
                disabled={updateTxMutation.isPending}
                className="
                  flex flex-1 items-center justify-center gap-1.5
                  rounded-xl bg-[#123f59] py-2
                  text-[10px] font-black text-white
                  transition hover:bg-[#0f3448]
                  disabled:opacity-50
                "
                type="button"
              >
                {updateTxMutation.isPending && editingField === field ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e2bf74]" />
                ) : (
                  <Save className="h-3.5 w-3.5 text-[#e2bf74]" />
                )}
                تأكيد
              </button>

              <button
                onClick={() => setEditingField(null)}
                className="
                  flex items-center justify-center gap-1.5
                  rounded-xl border border-rose-200
                  bg-rose-50 px-3 py-2
                  text-[10px] font-black text-rose-600
                  transition hover:bg-rose-100
                "
                type="button"
              >
                <X className="h-3.5 w-3.5" />
                إلغاء
              </button>
            </div>
          </div>
        ) : (
          <div
            className="
              flex min-h-[70px] flex-col justify-between
              rounded-2xl border border-[#d8b46a]/25
              bg-white p-3 shadow-sm
              transition hover:border-[#c5983c]/55 hover:bg-[#fbf8f1]
            "
          >
            <div
              className="
                min-h-[22px] break-all px-1
                text-xs font-black text-[#123f59]
              "
            >
              {displayValue}
            </div>

            <div className="mt-3 flex items-center gap-1.5 border-t border-[#e8ddc8] pt-2">
              <button
                onClick={() => setEditingField(field)}
                className="
                  flex flex-1 items-center justify-center gap-1
                  rounded-xl border border-[#d8b46a]/25
                  bg-[#fbf8f1] py-1.5
                  text-[9px] font-black text-[#123f59]
                  transition hover:bg-[#f8efe0]
                "
                type="button"
              >
                <PenLine className="h-3.5 w-3.5 text-[#c5983c]" />
                تعديل
              </button>

              <button
                onClick={() => hasValue && handleCopy(value, label)}
                disabled={!hasValue}
                className={`
                  flex flex-1 items-center justify-center gap-1
                  rounded-xl border py-1.5
                  text-[9px] font-black transition
                  ${
                    hasValue
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                  }
                `}
                type="button"
              >
                <Copy className="h-3.5 w-3.5" />
                نسخ
              </button>
            </div>
          </div>
        )}
      </FieldShell>
    );
  };

  const CombinedNumberYearGroup = ({
    label,
    numField,
    yearField,
    numValue,
    yearValue,
  }) => {
    const isEditingNum = editingField === numField;
    const isEditingYear = editingField === yearField;

    const combinedValue =
      numValue && yearValue
        ? `${numValue} / ${yearValue}`
        : numValue || yearValue || "";

    const hasValue = combinedValue.trim() !== "";

    const MiniEditableInput = ({
      label: miniLabel,
      field,
      value,
      isEditing,
      placeholder,
    }) => (
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] font-black text-[#64748b]">
          {miniLabel}
        </label>

        {isEditing ? (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={value || ""}
              onChange={(e) => handleChange(field, e.target.value)}
              className="
                h-10 min-w-0 flex-1 rounded-xl
                border border-[#d8b46a]/35 bg-white
                px-3 text-xs font-black text-[#123f59]
                outline-none focus:border-[#c5983c]
                focus:ring-4 focus:ring-[#c5983c]/10
              "
              placeholder={placeholder}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveSingleField();
                if (e.key === "Escape") setEditingField(null);
              }}
            />

            <button
              onClick={handleSaveSingleField}
              disabled={updateTxMutation.isPending}
              className="
                rounded-xl bg-[#123f59] px-3
                text-[9px] font-black text-white
                transition hover:bg-[#0f3448]
                disabled:opacity-50
              "
              type="button"
            >
              حفظ
            </button>

            <button
              onClick={() => setEditingField(null)}
              className="
                rounded-xl border border-rose-200
                bg-rose-50 px-3
                text-[9px] font-black text-rose-600
                transition hover:bg-rose-100
              "
              type="button"
            >
              X
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditingField(field)}
            className="
              flex h-10 w-full items-center justify-between gap-2
              rounded-xl border border-[#d8b46a]/25
              bg-white px-3 text-right
              transition hover:border-[#c5983c]/55 hover:bg-[#f8efe0]
            "
            type="button"
          >
            <span className="font-mono text-xs font-black text-[#123f59]">
              {value || "—"}
            </span>

            <span
              className="
                flex items-center gap-1 rounded-lg
                bg-[#fbf8f1] px-2 py-0.5
                text-[9px] font-black text-[#c5983c]
              "
            >
              <PenLine className="h-3 w-3" />
              تعديل
            </span>
          </button>
        )}
      </div>
    );

    return (
      <div
        className="
          flex h-full flex-col rounded-[24px]
          border border-[#d8b46a]/30
          bg-white p-4 shadow-sm
          transition hover:border-[#c5983c]/55
        "
      >
        <div className="mb-3 flex items-center gap-2">
          <span
            className="
              grid h-8 w-8 place-items-center
              rounded-2xl bg-[#123f59] text-[#e2bf74]
            "
          >
            <Hash className="h-4 w-4" />
          </span>

          <div>
            <div className="text-[11px] font-black text-[#123f59]">
              {label}
            </div>

            <div className="font-mono text-[10px] font-bold text-[#64748b]">
              {combinedValue || "لا توجد بيانات"}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <MiniEditableInput
            label="الرقم"
            field={numField}
            value={numValue}
            isEditing={isEditingNum}
            placeholder="رقم"
          />

          <MiniEditableInput
            label="السنة"
            field={yearField}
            value={yearValue}
            isEditing={isEditingYear}
            placeholder="السنة"
          />
        </div>

        <button
          onClick={() => hasValue && handleCopy(combinedValue, label)}
          disabled={!hasValue}
          className={`
            mt-4 flex w-full items-center justify-center gap-2
            rounded-2xl border py-2.5
            text-[11px] font-black transition
            ${
              hasValue
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            }
          `}
          type="button"
        >
          <Copy className="h-4 w-4" />
          نسخ{" "}
          {label.includes("خدمة")
            ? "الخدمة"
            : label.includes("طلب")
              ? "الطلب"
              : "الرخصة"}
        </button>
      </div>
    );
  };

  const SectionCard = ({ title, subtitle, icon: Icon, tone = "blue", children }) => {
    const tones = {
      blue: {
        wrapper: "border-[#d8b46a]/30 bg-white",
        header: "from-[#f8efe0] via-white to-[#eef7f6]",
        icon: "bg-[#123f59] text-[#e2bf74]",
        title: "text-[#123f59]",
      },
      cyan: {
        wrapper: "border-cyan-200 bg-white",
        header: "from-cyan-50 via-white to-[#eef7f6]",
        icon: "bg-cyan-600 text-white",
        title: "text-cyan-900",
      },
      amber: {
        wrapper: "border-amber-200 bg-white",
        header: "from-amber-50 via-white to-[#fbf8f1]",
        icon: "bg-amber-500 text-white",
        title: "text-amber-900",
      },
      purple: {
        wrapper: "border-purple-200 bg-white",
        header: "from-purple-50 via-white to-[#fbf8f1]",
        icon: "bg-purple-600 text-white",
        title: "text-purple-900",
      },
    };

    const t = tones[tone] || tones.blue;

    return (
      <section
        className={`
          overflow-hidden rounded-[26px] border
          shadow-[0_14px_34px_rgba(18,63,89,0.08)]
          ${t.wrapper}
        `}
      >
        <div
          className={`
            flex items-center gap-3 border-b border-[#e8ddc8]
            bg-gradient-to-l px-5 py-4 ${t.header}
          `}
        >
          <span
            className={`grid h-10 w-10 place-items-center rounded-2xl ${t.icon}`}
          >
            <Icon className="h-5 w-5" />
          </span>

          <div>
            <h4 className={`text-sm font-black ${t.title}`}>{title}</h4>

            {subtitle && (
              <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="p-4">{children}</div>
      </section>
    );
  };

  return (
    <div
      className="
        flex h-full flex-col gap-5 overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-4 pb-6 animate-in fade-in md:p-5
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative shrink-0 overflow-hidden rounded-[28px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-5 shadow-[0_20px_55px_rgba(18,63,89,0.20)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                grid h-14 w-14 place-items-center rounded-3xl
                bg-[#e2bf74] text-[#123f59]
                shadow-[0_12px_24px_rgba(0,0,0,0.18)]
              "
            >
              <ClipboardList className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                بيانات الطلب الإجرائية
              </h3>

              <p className="mt-1 text-xs font-bold text-white/55">
                إدارة أرقام الخدمة والطلب والرخصة والتقارير المرتبطة بالمعاملة.
              </p>
            </div>
          </div>

          {updateTxMutation.isPending && (
            <span
              className="
                flex w-max items-center gap-2 rounded-2xl
                border border-white/15 bg-white/10
                px-4 py-3 text-xs font-black text-white
                backdrop-blur-md
              "
            >
              <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
              جاري الحفظ...
            </span>
          )}
        </div>
      </div>

      {/* Main Layout */}
      <div className="min-h-0 flex-1 overflow-y-auto custom-scrollbar-slim pr-1">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          {/* Main form */}
          <div className="space-y-5 xl:col-span-8">
            {/* Offices */}
            <SectionCard
              title="الهيكلة الإدارية"
              subtitle="المكاتب والمسؤولون المرتبطون بالطلب"
              icon={Building}
              tone="blue"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <EditableField
                  label="المكتب المصمم"
                  field="designerOffice"
                  value={requestDataForm.designerOffice}
                  isSelect
                  options={offices}
                  icon={Building}
                />

                <EditableField
                  label="المكتب المشرف"
                  field="supervisorOffice"
                  value={requestDataForm.supervisorOffice}
                  isSelect
                  options={offices}
                  icon={Building}
                />

                <FieldShell label="مسؤول الرفع" icon={User}>
                  <div
                    className="
                      flex min-h-[70px] flex-col justify-between
                      rounded-2xl border border-[#d8b46a]/25
                      bg-[#fbf8f1] p-3 shadow-sm
                    "
                  >
                    <div className="flex items-center gap-2 text-xs font-black text-[#123f59]">
                      <User className="h-4 w-4 text-[#c5983c]" />
                      <span className="truncate">
                        {requestDataForm.responsibleEmployee || "غير محدد"}
                      </span>
                    </div>

                    <div className="border-t border-[#e8ddc8] pt-2 text-center text-[9px] font-black text-[#64748b]">
                      للقراءة فقط
                    </div>
                  </div>
                </FieldShell>
              </div>

              <div
                className="
                  mt-4 flex flex-col gap-3 rounded-2xl
                  border border-purple-200 bg-purple-50/70
                  p-4 sm:flex-row sm:items-center sm:justify-between
                "
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-5 w-5 cursor-pointer accent-[#123f59]"
                    checked={hasAgreementValue}
                    onChange={(e) => {
                      handleChange("hasAgreement", e.target.checked);
                      setEditingField("hasAgreement");
                    }}
                  />

                  <div>
                    <div className="text-xs font-black text-purple-900">
                      المعاملة بموجب اتفاقية مسبقة
                    </div>

                    <div className="mt-0.5 text-[10px] font-bold text-purple-700/70">
                      فعّل الخيار ثم اضغط حفظ لتثبيت التعديل.
                    </div>
                  </div>
                </label>

                {editingField === "hasAgreement" && (
                  <button
                    onClick={handleSaveSingleField}
                    disabled={updateTxMutation.isPending}
                    className="
                      flex items-center justify-center gap-1.5
                      rounded-2xl bg-[#123f59] px-4 py-2.5
                      text-xs font-black text-white
                      transition hover:bg-[#0f3448]
                      disabled:opacity-50
                    "
                    type="button"
                  >
                    {updateTxMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                    ) : (
                      <Save className="h-4 w-4 text-[#e2bf74]" />
                    )}
                    حفظ
                  </button>
                )}
              </div>
            </SectionCard>

            {/* Transaction Numbers */}
            <SectionCard
              title="بيانات المعاملة"
              subtitle="أرقام الخدمة، الطلب، والرخصة الإلكترونية"
              icon={FileText}
              tone="cyan"
            >
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="md:col-span-2">
                    <CombinedNumberYearGroup
                      label="بيانات الخدمة"
                      numField="serviceNumber"
                      yearField="serviceYear"
                      numValue={requestDataForm.serviceNumber}
                      yearValue={requestDataForm.serviceYear}
                    />
                  </div>

                  <EditableField
                    label="تاريخ الخدمة"
                    field="serviceDate"
                    value={requestDataForm.serviceDate}
                    type="date"
                    icon={CalendarDays}
                  />
                </div>

                <div className="border-t border-dashed border-cyan-200 pt-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <CombinedNumberYearGroup
                        label="بيانات الطلب"
                        numField="requestNumber"
                        yearField="requestYear"
                        numValue={requestDataForm.requestNumber}
                        yearValue={requestDataForm.requestYear}
                      />
                    </div>

                    <EditableField
                      label="تاريخ الطلب"
                      field="requestDate"
                      value={requestDataForm.requestDate}
                      type="date"
                      icon={CalendarDays}
                    />
                  </div>
                </div>

                <div className="border-t border-dashed border-cyan-200 pt-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <CombinedNumberYearGroup
                        label="الرخصة الإلكترونية"
                        numField="electronicLicenseNumber"
                        yearField="electronicLicenseHijriYear"
                        numValue={requestDataForm.electronicLicenseNumber}
                        yearValue={requestDataForm.electronicLicenseHijriYear}
                      />
                    </div>

                    <EditableField
                      label="تاريخ الرخصة"
                      field="electronicLicenseDate"
                      value={requestDataForm.electronicLicenseDate}
                      type="date"
                      icon={CalendarDays}
                    />
                  </div>
                </div>

                {isApprovalRequest && (
                  <div
                    className="
                      rounded-2xl border border-amber-200
                      bg-amber-50/70 p-4
                    "
                  >
                    <div className="mb-4 flex items-center gap-2">
                      <span
                        className="
                          grid h-9 w-9 place-items-center
                          rounded-2xl bg-amber-500 text-white
                        "
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </span>

                      <div>
                        <div className="text-xs font-black text-amber-900">
                          بيانات الرخصة القديمة
                        </div>

                        <div className="text-[10px] font-bold text-amber-700/70">
                          تظهر فقط في معاملات تصحيح الوضع.
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <EditableField
                        label="رقم الرخصة القديمة"
                        field="oldLicenseNumber"
                        value={requestDataForm.oldLicenseNumber}
                        icon={Hash}
                      />

                      <EditableField
                        label="سنة الرخصة القديمة"
                        field="oldLicenseHijriYear"
                        value={requestDataForm.oldLicenseHijriYear}
                        icon={CalendarDays}
                      />

                      <EditableField
                        label="تاريخ الإصدار"
                        field="oldLicenseDate"
                        value={requestDataForm.oldLicenseDate}
                        type="date"
                        icon={CalendarDays}
                      />
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Survey */}
            <SectionCard
              title="التقرير المساحي"
              subtitle="بيانات طلب وخدمة المساحة والتقرير النهائي"
              icon={Map}
              tone="amber"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <CombinedNumberYearGroup
                  label="طلب المساحة"
                  numField="surveyRequestNumber"
                  yearField="surveyRequestYear"
                  numValue={requestDataForm.surveyRequestNumber}
                  yearValue={requestDataForm.surveyRequestYear}
                />

                <CombinedNumberYearGroup
                  label="خدمة المساحة"
                  numField="surveyServiceNumber"
                  yearField="surveyServiceYear"
                  numValue={requestDataForm.surveyServiceNumber}
                  yearValue={requestDataForm.surveyServiceYear}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <EditableField
                  label="رقم التقرير"
                  field="surveyReportNumber"
                  value={requestDataForm.surveyReportNumber}
                  icon={Hash}
                />

                <EditableField
                  label="تاريخ التقرير"
                  field="surveyReportDate"
                  value={requestDataForm.surveyReportDate}
                  type="date"
                  icon={CalendarDays}
                />
              </div>
            </SectionCard>

            {/* Contract */}
            <SectionCard
              title="التعاقد الإلكتروني"
              subtitle="بيانات العقد والاعتماد"
              icon={FileSignature}
              tone="purple"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <EditableField
                  label="رقم العقد"
                  field="contractNumber"
                  value={requestDataForm.contractNumber}
                  icon={Hash}
                />

                <EditableField
                  label="تاريخ الاعتماد"
                  field="contractApprovalDate"
                  value={requestDataForm.contractApprovalDate}
                  type="date"
                  icon={CalendarDays}
                />

                <EditableField
                  label="المعتمد"
                  field="contractApprovedBy"
                  value={requestDataForm.contractApprovedBy}
                  isSelect
                  options={persons}
                  icon={ShieldCheck}
                />
              </div>
            </SectionCard>
          </div>

          {/* Sidebar summary */}
          <div className="space-y-5 xl:col-span-4">
            <div
              className="
                sticky top-0 overflow-hidden rounded-[26px]
                border border-[#d8b46a]/30 bg-white
                shadow-[0_14px_34px_rgba(18,63,89,0.08)]
              "
            >
              <div
                className="
                  flex items-center gap-3 border-b border-[#e8ddc8]
                  bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
                  px-5 py-4
                "
              >
                <span
                  className="
                    grid h-9 w-9 place-items-center
                    rounded-2xl bg-[#123f59] text-[#e2bf74]
                  "
                >
                  <Link2 className="h-4 w-4" />
                </span>

                <h4 className="text-sm font-black text-[#123f59]">
                  ملخص سريع
                </h4>
              </div>

              <div className="space-y-2.5 p-4 text-[11px]">
                <SummaryLine
                  label="حالة الاتفاقية"
                  value={hasAgreementValue ? "نعم ✓" : "لا"}
                  active={hasAgreementValue}
                />

                <SummaryLine
                  label="رقم الخدمة"
                  value={requestDataForm.serviceNumber || "—"}
                />

                <SummaryLine
                  label="رقم الطلب"
                  value={requestDataForm.requestNumber || "—"}
                />

                <SummaryLine
                  label="الرخصة"
                  value={requestDataForm.electronicLicenseNumber || "—"}
                />

                <SummaryLine
                  label="رقم التقرير"
                  value={requestDataForm.surveyReportNumber || "—"}
                />

                <SummaryLine
                  label="رقم العقد"
                  value={requestDataForm.contractNumber || "—"}
                />
              </div>
            </div>

            {/* Emails */}
            <section
              className="
                overflow-hidden rounded-[26px]
                border border-[#d8b46a]/25
                bg-[#08111c]
                shadow-[0_18px_45px_rgba(15,23,42,0.24)]
              "
            >
              <div
                className="
                  flex items-center justify-between gap-3
                  border-b border-white/10
                  bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
                  px-4 py-4
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="
                      grid h-10 w-10 shrink-0 place-items-center
                      rounded-2xl bg-[#e2bf74] text-[#123f59]
                    "
                  >
                    <Bot className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-black text-white">
                      سجل إفادات المنصة
                    </h4>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-white/45">
                      <span className="flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        سحب آلي
                      </span>

                      {requestDataForm.serviceNumber && (
                        <span
                          className="
                            rounded-lg border border-white/10
                            bg-white/10 px-2 py-0.5
                            font-mono text-cyan-200
                          "
                        >
                          خ: {requestDataForm.serviceNumber}
                        </span>
                      )}

                      {requestDataForm.requestNumber && (
                        <span
                          className="
                            rounded-lg border border-white/10
                            bg-white/10 px-2 py-0.5
                            font-mono text-[#e2bf74]
                          "
                        >
                          ط: {requestDataForm.requestNumber}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => refetchEmails()}
                  disabled={emailsLoading}
                  className="
                    flex items-center gap-1.5 rounded-xl
                    border border-white/10 bg-white/10
                    px-3 py-2 text-[10px]
                    font-black text-white
                    transition hover:bg-white/15
                    disabled:opacity-50
                  "
                  type="button"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${
                      emailsLoading
                        ? "animate-spin text-[#e2bf74]"
                        : "text-[#e2bf74]"
                    }`}
                  />
                  {emailsLoading ? "جاري..." : "تحديث"}
                </button>
              </div>

              <div className="custom-scrollbar-slim max-h-[520px] space-y-3 overflow-y-auto p-4">
                {!requestDataForm.serviceNumber &&
                !requestDataForm.requestNumber ? (
                  <EmailEmptyState
                    icon={Inbox}
                    title="أدخل أرقام المعاملة"
                    message="سيتم سحب الإفادات تلقائياً عند إدخال رقم الخدمة أو الطلب."
                  />
                ) : relatedEmails.length === 0 ? (
                  <EmailEmptyState
                    icon={Mail}
                    title="لا توجد إفادات"
                    message="لم تصل رسائل من المنصة لهذه الأرقام بعد."
                  />
                ) : (
                  relatedEmails.map((email) => (
                    <div
                      key={email.id}
                      className="
                        rounded-2xl border border-white/10
                        bg-white/[0.06] p-3.5
                        transition hover:border-[#e2bf74]/35
                        hover:bg-white/[0.08]
                      "
                    >
                      <div className="mb-2.5 flex items-start justify-between gap-2 border-b border-white/10 pb-2.5">
                        <span className="line-clamp-2 flex-1 text-xs font-black leading-snug text-white">
                          {email.subject}
                        </span>

                        <span
                          className="
                            shrink-0 rounded-lg border border-white/10
                            bg-black/20 px-2 py-1
                            font-mono text-[10px]
                            font-black text-white/45
                          "
                        >
                          {new Date(email.date).toLocaleDateString("ar-EG")}
                        </span>
                      </div>

                      <div
                        className="
                          max-h-[130px] overflow-y-auto
                          rounded-xl border border-white/10
                          bg-black/20 p-3
                          text-[11px] font-bold leading-relaxed
                          text-white/70 custom-scrollbar-slim
                        "
                      >
                        {email.replyText || email.body || "محتوى غير متاح"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryLine = ({ label, value, active = false }) => (
  <div
    className="
      flex items-center justify-between gap-3
      rounded-xl border border-[#e8ddc8]
      bg-[#fbf8f1] px-3 py-2
    "
  >
    <span className="font-black text-[#64748b]">{label}</span>

    <span
      className={`
        max-w-[160px] truncate rounded-xl px-2 py-0.5
        font-mono text-[10px] font-black
        ${
          active
            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
            : "bg-white text-[#123f59] border border-[#d8b46a]/25"
        }
      `}
    >
      {value}
    </span>
  </div>
);

const EmailEmptyState = ({ icon: Icon, title, message }) => (
  <div
    className="
      flex flex-col items-center justify-center
      rounded-2xl border border-white/10
      bg-white/[0.05] px-5 py-10 text-center
    "
  >
    <div
      className="
        mb-3 grid h-16 w-16 place-items-center
        rounded-3xl bg-white/10 text-white/35
      "
    >
      <Icon className="h-8 w-8" />
    </div>

    <p className="mb-1 text-sm font-black text-white/75">{title}</p>

    <p className="max-w-[240px] text-[11px] font-bold leading-relaxed text-white/35">
      {message}
    </p>
  </div>
);