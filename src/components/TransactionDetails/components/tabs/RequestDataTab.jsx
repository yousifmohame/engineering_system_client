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
  Check,
  X,
  Save,
  Link2,
} from "lucide-react";

export const RequestDataTab = ({
  tx,
  requestDataForm,
  setRequestDataForm,
  saveRequestDataEdits,
  updateTxMutation,
  isApprovalRequest,
  offices,
  persons,
}) => {
  // حالة التحكم في الحقل الذي يتم تعديله حالياً (Inline Editing)
  const [editingField, setEditingField] = useState(null);

  // دالة لتغيير القيمة في الـ Form State
  const handleChange = (field, value) => {
    setRequestDataForm((prev) => ({ ...prev, [field]: value }));
  };

  // دالة لحفظ التعديل الفردي
  const handleSaveSingleField = async (e) => {
    e?.preventDefault();
    if (updateTxMutation.isPending) return;

    // نستدعي دالة الحفظ الموجودة في الأب
    saveRequestDataEdits();
    setEditingField(null);
  };

  // دالة النسخ الموحدة
  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} بنجاح`);
  };

  // جلب الإيميلات المرتبطة بـ (الخدمة أو الطلب)
  const { data: relatedEmails = [], isLoading: emailsLoading } = useQuery({
    queryKey: [
      "related-emails",
      requestDataForm.serviceNumber,
      requestDataForm.requestNumber,
    ],
    queryFn: async () => {
      if (!requestDataForm.serviceNumber && !requestDataForm.requestNumber)
        return [];
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

  // ------------------------------------------------------------------
  // مكون مساعد (Component) لبناء حقل قابل للتعديل والنسخ معاً (Inline Field)
  // ------------------------------------------------------------------
  const EditableField = ({
    label,
    field,
    value,
    type = "text",
    options = [],
    isSelect = false,
  }) => {
    const isEditingThis = editingField === field;

    return (
      <div className="flex flex-col gap-1 group">
        <label className="text-[9px] font-bold text-slate-500">{label}</label>
        {isEditingThis ? (
          <div className="flex items-center gap-1">
            {isSelect ? (
              <select
                value={value || ""}
                onChange={(e) => handleChange(field, e.target.value)}
                className="flex-1 w-full border border-blue-300 rounded p-1.5 text-[10px] font-bold outline-none bg-blue-50 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">-- اختر --</option>
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
                className="flex-1 w-full border border-blue-300 rounded p-1.5 text-[10px] font-mono outline-none bg-blue-50 focus:ring-2 focus:ring-blue-200"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSingleField();
                  if (e.key === "Escape") setEditingField(null);
                }}
              />
            )}
            <button
              onClick={handleSaveSingleField}
              disabled={updateTxMutation.isPending}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {updateTxMutation.isPending && editingField === field ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={() => setEditingField(null)}
              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded p-1.5 min-h-[30px]">
            <div
              className="flex-1 text-[10px] font-black text-slate-800 truncate"
              title={
                isSelect
                  ? options.find((o) => (o.id || o.name) === value)?.name
                  : value
              }
            >
              {isSelect
                ? options.find((o) => (o.id || o.name) === value)?.name || "—"
                : value || "—"}
            </div>

            {/* أزرار الإجراءات (تظهر عند التمرير) */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {value && (
                <button
                  onClick={() => handleCopy(value, label)}
                  className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                  title="نسخ"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setEditingField(field)}
                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="تعديل"
              >
                <PenLine className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ------------------------------------------------------------------
  // مكون مساعد للمجموعة المدمجة (الرقم + السنة) مع زر نسخ موحد
  // ------------------------------------------------------------------
  const CombinedNumberYearGroup = ({
    label,
    numField,
    yearField,
    numValue,
    yearValue,
    bgColorClass,
    borderColorClass,
    textColorClass,
  }) => {
    const isEditingNum = editingField === numField;
    const isEditingYear = editingField === yearField;
    const combinedValue =
      numValue && yearValue
        ? `${numValue} / ${yearValue}`
        : numValue || yearValue || "";

    return (
      <div
        className={`p-2 rounded-lg border ${borderColorClass} ${bgColorClass} flex flex-col gap-1.5 group relative`}
      >
        <div className="flex items-center justify-between">
          <label className={`text-[9px] font-bold ${textColorClass}`}>
            {label}
          </label>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {combinedValue && (
              <button
                onClick={() => handleCopy(combinedValue, label)}
                className={`p-1 ${textColorClass} hover:bg-white rounded shadow-sm transition-colors`}
                title="نسخ (الرقم / السنة)"
              >
                <Copy className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-start gap-1">
          {/* حقل الرقم */}
          <div className="flex-1">
            {isEditingNum ? (
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="الرقم"
                  value={numValue || ""}
                  onChange={(e) => handleChange(numField, e.target.value)}
                  className="w-full border border-blue-400 rounded p-1 text-[10px] font-mono outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveSingleField();
                    if (e.key === "Escape") setEditingField(null);
                  }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveSingleField}
                    disabled={updateTxMutation.isPending}
                    className="flex-1 p-1 bg-blue-600 text-white rounded flex justify-center items-center"
                  >
                    <Save className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="flex-1 p-1 bg-red-50 text-red-600 rounded flex justify-center items-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-between bg-white border border-slate-200 rounded p-1.5 cursor-text hover:border-blue-300"
                onClick={() => setEditingField(numField)}
                title="تعديل الرقم"
              >
                <span className="font-mono text-[10px] font-black text-slate-800">
                  {numValue || "—"}
                </span>
                <PenLine className="w-2.5 h-2.5 text-slate-300" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center pt-1.5">
            <Link2 className={`w-3.5 h-3.5 ${textColorClass} opacity-50`} />
          </div>

          {/* حقل السنة */}
          <div className="w-20 shrink-0">
            {isEditingYear ? (
              <div className="flex flex-col gap-1">
                <input
                  type="text"
                  placeholder="السنة"
                  value={yearValue || ""}
                  onChange={(e) => handleChange(yearField, e.target.value)}
                  className="w-full border border-blue-400 rounded p-1 text-[10px] font-mono outline-none focus:ring-2 focus:ring-blue-200 bg-white text-center"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveSingleField();
                    if (e.key === "Escape") setEditingField(null);
                  }}
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleSaveSingleField}
                    disabled={updateTxMutation.isPending}
                    className="flex-1 p-1 bg-blue-600 text-white rounded flex justify-center items-center"
                  >
                    <Save className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    className="flex-1 p-1 bg-red-50 text-red-600 rounded flex justify-center items-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center justify-between bg-white border border-slate-200 rounded p-1.5 cursor-text hover:border-blue-300"
                onClick={() => setEditingField(yearField)}
                title="تعديل السنة"
              >
                <span className="font-mono text-[10px] font-black text-slate-800 text-center w-full">
                  {yearValue || "—"}
                </span>
                <PenLine className="w-2.5 h-2.5 text-slate-300" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="h-full flex flex-col gap-3 animate-in fade-in pb-10"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-600" /> بيانات الطلب
          الإجرائية
        </h3>
        {updateTxMutation.isPending && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Loader2 className="w-3 h-3 animate-spin" /> جاري الحفظ...
          </span>
        )}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-3 flex-1 min-h-0">
        {/* ── العمود الأيمن (البيانات الفنية) ── */}
        <div className="xl:col-span-7 flex flex-col gap-4 overflow-y-auto custom-scrollbar-slim pr-1">
          {/* المكاتب والهيكلة الإدارية */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
            <EditableField
              label="المكتب المصمم"
              field="designerOffice"
              value={requestDataForm.designerOffice}
              isSelect
              options={offices}
            />
            <EditableField
              label="المكتب المشرف"
              field="supervisorOffice"
              value={requestDataForm.supervisorOffice}
              isSelect
              options={offices}
            />

            {/* مسؤول الرفع لا يمكن تعديله من هذه الشاشة حسب السياق السابق */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] font-bold text-slate-500">
                مسؤول الرفع
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded p-1.5 min-h-[30px] opacity-70">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <div className="flex-1 text-[10px] font-black text-slate-800 truncate">
                  {requestDataForm.responsibleEmployee || "غير محدد"}
                </div>
              </div>
            </div>
          </div>

          {/* التقرير المساحي الإلكتروني */}
          <div className="bg-amber-50/30 p-3 rounded-xl border border-amber-100 shadow-sm">
            <h4 className="text-[11px] font-black text-amber-900 mb-3 flex items-center gap-1.5 border-b border-amber-100 pb-2">
              <Map className="w-4 h-4 text-amber-600" /> التقرير المساحي
              الإلكتروني
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <CombinedNumberYearGroup
                label="رقم وسنة طلب المساحة"
                numField="surveyRequestNumber"
                yearField="surveyRequestYear"
                numValue={requestDataForm.surveyRequestNumber}
                yearValue={requestDataForm.surveyRequestYear}
                bgColorClass="bg-amber-50"
                borderColorClass="border-amber-200"
                textColorClass="text-amber-800"
              />
              <CombinedNumberYearGroup
                label="رقم وسنة خدمة المساحة"
                numField="surveyServiceNumber"
                yearField="surveyServiceYear"
                numValue={requestDataForm.surveyServiceNumber}
                yearValue={requestDataForm.surveyServiceYear}
                bgColorClass="bg-amber-50"
                borderColorClass="border-amber-200"
                textColorClass="text-amber-800"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <EditableField
                label="رقم التقرير المساحي النهائي"
                field="surveyReportNumber"
                value={requestDataForm.surveyReportNumber}
              />
              <EditableField
                label="تاريخ التقرير (ميلادي)"
                field="surveyReportDate"
                value={requestDataForm.surveyReportDate}
                type="date"
              />
            </div>
          </div>

          {/* التعاقد والتفويض */}
          <div className="bg-indigo-50/30 p-3 rounded-xl border border-indigo-100 shadow-sm">
            <h4 className="text-[11px] font-black text-indigo-900 mb-3 flex items-center gap-1.5 border-b border-indigo-100 pb-2">
              <FileSignature className="w-4 h-4 text-indigo-600" /> التعاقد
              الإلكتروني (التفويض)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EditableField
                label="رقم التعاقد"
                field="contractNumber"
                value={requestDataForm.contractNumber}
              />
              <EditableField
                label="تاريخ الموافقة"
                field="contractApprovalDate"
                value={requestDataForm.contractApprovalDate}
                type="date"
              />
              <EditableField
                label="الموافق عليه (الموظف)"
                field="contractApprovedBy"
                value={requestDataForm.contractApprovedBy}
                isSelect
                options={persons}
              />
            </div>
          </div>

          {/* بيانات الرخص وبلدي */}
          <div className="bg-blue-50/30 p-3 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="text-[11px] font-black text-blue-900 mb-3 flex items-center gap-1.5 border-b border-blue-100 pb-2">
              <Building className="w-4 h-4 text-blue-600" /> بيانات طلب ورخصة
              البناء (بلدي)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <CombinedNumberYearGroup
                label="رقم وسنة الطلب (بلدي)"
                numField="requestNumber"
                yearField="requestYear"
                numValue={requestDataForm.requestNumber}
                yearValue={requestDataForm.requestYear}
                bgColorClass="bg-blue-50"
                borderColorClass="border-blue-200"
                textColorClass="text-blue-800"
              />
              <CombinedNumberYearGroup
                label="رقم وسنة الخدمة (بلدي)"
                numField="serviceNumber"
                yearField="serviceYear"
                numValue={requestDataForm.serviceNumber}
                yearValue={requestDataForm.serviceYear}
                bgColorClass="bg-blue-50"
                borderColorClass="border-blue-200"
                textColorClass="text-blue-800"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <EditableField
                label="رقم الرخصة (الإلكترونية)"
                field="electronicLicenseNumber"
                value={requestDataForm.electronicLicenseNumber}
              />
              <EditableField
                label="السنة (هجري)"
                field="electronicLicenseHijriYear"
                value={requestDataForm.electronicLicenseHijriYear}
              />
              <EditableField
                label="تاريخ (ميلادي)"
                field="electronicLicenseDate"
                value={requestDataForm.electronicLicenseDate}
                type="date"
              />
            </div>

            {/* خاص بتصحيح الوضع */}
            {isApprovalRequest && (
              <div className="mt-4 pt-4 border-t border-dashed border-amber-200">
                <div className="text-[10px] font-black text-amber-700 flex items-center gap-1.5 mb-3 bg-amber-50 px-2 py-1.5 rounded-lg w-fit border border-amber-100">
                  <AlertTriangle className="w-3.5 h-3.5" /> بيانات الرخصة
                  القديمة (تصحيح وضع)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <EditableField
                    label="رقم الرخصة القديمة"
                    field="oldLicenseNumber"
                    value={requestDataForm.oldLicenseNumber}
                  />
                  <EditableField
                    label="سنة الرخصة (هجري)"
                    field="oldLicenseHijriYear"
                    value={requestDataForm.oldLicenseHijriYear}
                  />
                  <EditableField
                    label="تاريخ (ميلادي)"
                    field="oldLicenseDate"
                    value={requestDataForm.oldLicenseDate}
                    type="date"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── العمود الأيسر: رسائل الذكاء الاصطناعي ── */}
        <div className="xl:col-span-5 bg-slate-900 rounded-2xl p-4 shadow-lg flex flex-col min-h-[400px] border border-slate-800">
          <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                <Bot className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white leading-none mb-1">
                  إفادات بلدي (سحب آلي)
                </h4>
                <div className="text-[9px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                  المتابعة بواسطة:
                  {requestDataForm.serviceNumber && (
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-purple-300">
                      ر.خدمة: {requestDataForm.serviceNumber}
                    </span>
                  )}
                  {requestDataForm.requestNumber && (
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-cyan-300">
                      ر.طلب: {requestDataForm.requestNumber}
                    </span>
                  )}
                  {!requestDataForm.serviceNumber &&
                    !requestDataForm.requestNumber && <span>غير مرتبط</span>}
                </div>
              </div>
            </div>
            {emailsLoading && (
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded-full">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> جاري السحب
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-2 space-y-3">
            {!requestDataForm.serviceNumber &&
            !requestDataForm.requestNumber ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10">
                <Inbox className="w-12 h-12 mx-auto mb-3" />
                <p className="text-xs font-bold text-white mb-1">
                  لا توجد أرقام تتبع مسجلة
                </p>
                <p className="text-[10px] text-slate-400">
                  الرجاء إدخال رقم الخدمة أو الطلب في اليمين ليبدأ السحب الآلي
                </p>
              </div>
            ) : relatedEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-10">
                <Mail className="w-12 h-12 mx-auto mb-3" />
                <p className="text-xs font-bold text-white mb-1">
                  لا توجد إفادات مطابقة
                </p>
                <p className="text-[10px] text-slate-400">
                  لم تصل أي رسائل من بلدي على هذه الأرقام حتى الآن
                </p>
              </div>
            ) : (
              relatedEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 hover:border-purple-500/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2 border-b border-slate-700/50 pb-2 gap-2">
                    <span className="text-[10px] font-bold text-slate-200 leading-snug border-r-2 border-purple-500 pr-2 flex-1">
                      {email.subject}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-700 shrink-0">
                      {new Date(email.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-[11px] font-bold text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {email.replyText || email.body || "محتوى غير متاح"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
