import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import {
  Save,
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
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field, value) => {
    setRequestDataForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveRequestDataEdits();
    setIsEditing(false);
  };

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

  return (
    <div
      className="h-full flex flex-col gap-2 animate-in fade-in pb-10"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5 text-cyan-600" /> بيانات الطلب
          الفنية
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-100 flex items-center gap-1"
          >
            <PenLine className="w-3 h-3" /> تعديل
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-white border border-red-200 text-red-600 rounded-lg text-[10px] font-bold hover:bg-red-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={updateTxMutation.isPending}
              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {updateTxMutation.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}{" "}
              حفظ
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 flex-1 min-h-0">
        {/* ── العمود الأيمن (يأخذ 7 أعمدة لضمان احتواء الحقول الكثيرة) ── */}
        <div className="lg:col-span-7 flex flex-col gap-2 overflow-y-auto custom-scrollbar-slim pr-1">
          {/* المكاتب والهيكلة الإدارية */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <label className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Building className="w-2.5 h-2.5 text-purple-500" /> المصمم
              </label>
              {isEditing ? (
                <select
                  value={requestDataForm.designerOffice}
                  onChange={(e) =>
                    handleChange("designerOffice", e.target.value)
                  }
                  className="w-full border rounded p-1 text-[10px] font-bold outline-none bg-slate-50"
                >
                  <option value="">-- اختر --</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-[10px] font-black text-slate-800 truncate">
                  {offices.find((o) => o.id === requestDataForm.designerOffice)
                    ?.name || "ديتيلز"}
                </div>
              )}
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <label className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <Building className="w-2.5 h-2.5 text-emerald-500" /> المشرف
              </label>
              {isEditing ? (
                <select
                  value={requestDataForm.supervisorOffice}
                  onChange={(e) =>
                    handleChange("supervisorOffice", e.target.value)
                  }
                  className="w-full border rounded p-1 text-[10px] font-bold outline-none bg-slate-50"
                >
                  <option value="">-- اختر --</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-[10px] font-black text-slate-800 truncate">
                  {offices.find(
                    (o) => o.id === requestDataForm.supervisorOffice,
                  )?.name || "غير محدد"}
                </div>
              )}
            </div>
            <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
              <label className="text-[9px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <User className="w-2.5 h-2.5 text-blue-500" /> مسؤول الرفع
              </label>
              <div className="text-[10px] font-black text-slate-800 truncate">
                {requestDataForm.responsibleEmployee || "غير محدد"}
              </div>
            </div>
          </div>

          {/* التقرير المساحي (جديد) */}
          <div className="bg-amber-50/50 p-2 rounded-lg border border-amber-100 shadow-sm">
            <h4 className="text-[10px] font-black text-amber-900 mb-1.5 flex items-center gap-1">
              <Map className="w-3 h-3" /> التقرير المساحي الإلكتروني
            </h4>
            <div className="grid grid-cols-6 gap-1.5">
              <div className="col-span-2">
                <label className="text-[8px] font-bold text-amber-700 block mb-0.5">
                  رقم الطلب
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.surveyRequestNumber}
                    onChange={(e) =>
                      handleChange("surveyRequestNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.surveyRequestNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="text-[8px] font-bold text-amber-700 block mb-0.5">
                  سنة الطلب
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.surveyRequestYear}
                    onChange={(e) =>
                      handleChange("surveyRequestYear", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.surveyRequestYear || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-[8px] font-bold text-amber-700 block mb-0.5">
                  رقم الخدمة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.surveyServiceNumber}
                    onChange={(e) =>
                      handleChange("surveyServiceNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.surveyServiceNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="text-[8px] font-bold text-amber-700 block mb-0.5">
                  سنة الخدمة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.surveyServiceYear}
                    onChange={(e) =>
                      handleChange("surveyServiceYear", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.surveyServiceYear || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <label className="text-[8px] font-bold text-amber-700 block mb-0.5">
                  رقم التقرير المساحي النهائي
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.surveyReportNumber}
                    onChange={(e) =>
                      handleChange("surveyReportNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.surveyReportNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <label className="text-[8px] font-bold text-amber-700 block mb-0.5">
                  تاريخ التقرير (ميلادي)
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={requestDataForm.surveyReportDate}
                    onChange={(e) =>
                      handleChange("surveyReportDate", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.surveyReportDate
                      ? new Date(
                          requestDataForm.surveyReportDate,
                        ).toLocaleDateString("en-GB")
                      : "—"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* التعاقد والتفويض (جديد) */}
          <div className="bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 shadow-sm">
            <h4 className="text-[10px] font-black text-indigo-900 mb-1.5 flex items-center gap-1">
              <FileSignature className="w-3 h-3" /> التعاقد الإلكتروني (التفويض)
            </h4>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-[8px] font-bold text-indigo-700 block mb-0.5">
                  رقم التعاقد
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.contractNumber}
                    onChange={(e) =>
                      handleChange("contractNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.contractNumber || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[8px] font-bold text-indigo-700 block mb-0.5">
                  تاريخ الموافقة
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={requestDataForm.contractApprovalDate}
                    onChange={(e) =>
                      handleChange("contractApprovalDate", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.contractApprovalDate
                      ? new Date(
                          requestDataForm.contractApprovalDate,
                        ).toLocaleDateString("en-GB")
                      : "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[8px] font-bold text-indigo-700 block mb-0.5">
                  الموافق عليه (الموظف)
                </label>
                {isEditing ? (
                  <select
                    value={requestDataForm.contractApprovedBy}
                    onChange={(e) =>
                      handleChange("contractApprovedBy", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-bold outline-none"
                  >
                    <option value="">-- اختر --</option>
                    {persons?.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-[10px] font-black bg-white px-1.5 py-0.5 rounded truncate">
                    {requestDataForm.contractApprovedBy || "—"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* أرقام الرخص (بلدي) */}
          <div className="bg-blue-50/50 p-2 rounded-lg border border-blue-100 shadow-sm flex flex-col">
            <h4 className="text-[10px] font-black text-blue-900 mb-1.5">
              بيانات طلب ورخصة البناء (بلدي)
            </h4>

            <div className="grid grid-cols-6 gap-1.5 mb-2">
              <div className="col-span-2">
                <label className="text-[8px] font-bold text-blue-700 block mb-0.5">
                  رقم الطلب
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.requestNumber}
                    onChange={(e) =>
                      handleChange("requestNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.requestNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="text-[8px] font-bold text-blue-700 block mb-0.5">
                  السنة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.requestYear}
                    onChange={(e) =>
                      handleChange("requestYear", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.requestYear || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-[8px] font-bold text-blue-700 block mb-0.5">
                  رقم الخدمة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.serviceNumber}
                    onChange={(e) =>
                      handleChange("serviceNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.serviceNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-1">
                <label className="text-[8px] font-bold text-blue-700 block mb-0.5">
                  السنة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.serviceYear}
                    onChange={(e) =>
                      handleChange("serviceYear", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black bg-white px-1.5 py-0.5 rounded">
                    {requestDataForm.serviceYear || "—"}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white rounded border border-blue-50">
              <div>
                <label className="text-[8px] font-bold text-slate-500 block mb-0.5">
                  رقم الرخصة (الإلكترونية)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.electronicLicenseNumber}
                    onChange={(e) =>
                      handleChange("electronicLicenseNumber", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono bg-slate-50"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black text-slate-800 px-1 py-0.5">
                    {requestDataForm.electronicLicenseNumber || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[8px] font-bold text-slate-500 block mb-0.5">
                  السنة (هجري)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.electronicLicenseHijriYear}
                    onChange={(e) =>
                      handleChange("electronicLicenseHijriYear", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono bg-slate-50"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black text-slate-800 px-1 py-0.5">
                    {requestDataForm.electronicLicenseHijriYear || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[8px] font-bold text-slate-500 block mb-0.5">
                  تاريخ (ميلادي)
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={requestDataForm.electronicLicenseDate}
                    onChange={(e) =>
                      handleChange("electronicLicenseDate", e.target.value)
                    }
                    className="w-full border rounded p-1 text-[9px] font-mono bg-slate-50"
                  />
                ) : (
                  <div className="font-mono text-[10px] font-black text-slate-800 px-1 py-0.5">
                    {requestDataForm.electronicLicenseDate
                      ? new Date(
                          requestDataForm.electronicLicenseDate,
                        ).toLocaleDateString("en-GB")
                      : "—"}
                  </div>
                )}
              </div>
            </div>

            {isApprovalRequest && (
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 pt-1.5 border-t border-dashed border-amber-200">
                <div className="col-span-3 text-[8px] font-bold text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> خاص بتصحيح الوضع
                  (الرخصة القديمة)
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="الرقم"
                      value={requestDataForm.oldLicenseNumber}
                      onChange={(e) =>
                        handleChange("oldLicenseNumber", e.target.value)
                      }
                      className="w-full border rounded p-1 text-[9px] font-mono"
                    />
                  ) : (
                    <div className="font-mono text-[9px] font-black text-slate-700 bg-white px-1 py-0.5 rounded border">
                      {requestDataForm.oldLicenseNumber || "رقم القديمة"}
                    </div>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="text"
                      placeholder="السنة (هجري)"
                      value={requestDataForm.oldLicenseHijriYear}
                      onChange={(e) =>
                        handleChange("oldLicenseHijriYear", e.target.value)
                      }
                      className="w-full border rounded p-1 text-[9px] font-mono"
                    />
                  ) : (
                    <div className="font-mono text-[9px] font-black text-slate-700 bg-white px-1 py-0.5 rounded border">
                      {requestDataForm.oldLicenseHijriYear || "سنة (هـ)"}
                    </div>
                  )}
                </div>
                <div>
                  {isEditing ? (
                    <input
                      type="date"
                      value={requestDataForm.oldLicenseDate}
                      onChange={(e) =>
                        handleChange("oldLicenseDate", e.target.value)
                      }
                      className="w-full border rounded p-1 text-[9px] font-mono"
                    />
                  ) : (
                    <div className="font-mono text-[9px] font-black text-slate-700 bg-white px-1 py-0.5 rounded border">
                      {requestDataForm.oldLicenseDate
                        ? new Date(
                            requestDataForm.oldLicenseDate,
                          ).toLocaleDateString("en-GB")
                        : "تاريخ (م)"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── العمود الأيسر: رسائل الذكاء الاصطناعي (يأخذ 5 أعمدة) ── */}
        <div className="lg:col-span-5 bg-slate-900 rounded-lg p-2 shadow-md flex flex-col min-h-0 border border-slate-800">
          <div className="flex items-center justify-between mb-2 border-b border-slate-700 pb-1.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <div>
                <h4 className="text-[10px] font-black text-white leading-none mb-0.5">
                  إفادات بلدي (AI)
                </h4>
                <p className="text-[7px] text-slate-400">
                  سحب برقم:{" "}
                  <span className="font-mono text-purple-400">
                    {requestDataForm.serviceNumber || "—"}
                  </span>
                </p>
              </div>
            </div>
            {emailsLoading && (
              <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-1 space-y-1.5">
            {!requestDataForm.serviceNumber &&
            !requestDataForm.requestNumber ? (
              <div className="text-center py-6 opacity-40">
                <Inbox className="w-6 h-6 mx-auto mb-1" />
                <p className="text-[9px] font-bold text-white">
                  أدخل أرقام التتبع للبحث
                </p>
              </div>
            ) : relatedEmails.length === 0 ? (
              <div className="text-center py-6 opacity-40">
                <Mail className="w-6 h-6 mx-auto mb-1" />
                <p className="text-[9px] font-bold text-white">
                  لا توجد إفادات مطابقة
                </p>
              </div>
            ) : (
              relatedEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-slate-800/80 border border-slate-700 rounded p-2"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[9px] font-bold text-slate-200 truncate pr-1.5 border-r-2 border-emerald-500">
                      {email.subject}
                    </span>
                    <span className="text-[7px] text-slate-400 font-mono shrink-0">
                      {new Date(email.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-1.5 rounded border-r border-purple-500/50 text-[9px] text-slate-300 whitespace-pre-wrap leading-snug">
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
