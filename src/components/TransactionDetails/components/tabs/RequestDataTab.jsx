import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios";
import {
  Save,
  Building,
  FileText,
  Calendar,
  User,
  Inbox,
  Mail,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Bot,
  ClipboardList,
  PenLine,
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
      className="h-full flex flex-col gap-3 animate-in fade-in pb-10"
      dir="rtl"
    >
      {/* ── Header (Compact) ── */}
      <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-600" /> بيانات الطلب
          والرخصة
        </h3>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1.5"
          >
            <PenLine className="w-3.5 h-3.5" /> تعديل
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={updateTxMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm disabled:opacity-50"
            >
              {updateTxMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}{" "}
              حفظ
            </button>
          </div>
        )}
      </div>

      {/* ── Main Content Grid (Two Columns) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 flex-1 min-h-0">
        {/* العمود الأيمن: البيانات الأساسية */}
        <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar-slim pr-1">
          {/* المكاتب */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <Building className="w-3 h-3 text-purple-500" /> المصمم
              </label>
              {isEditing ? (
                <select
                  value={requestDataForm.designerOffice}
                  onChange={(e) =>
                    handleChange("designerOffice", e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg p-1.5 text-[11px] font-bold outline-none bg-slate-50"
                >
                  <option value="">-- اختر --</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-black text-slate-800 truncate">
                  {offices.find((o) => o.id === requestDataForm.designerOffice)
                    ?.name || "غير محدد (ديتيلز)"}
                </div>
              )}
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
              <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                <Building className="w-3 h-3 text-emerald-500" /> المشرف
              </label>
              {isEditing ? (
                <select
                  value={requestDataForm.supervisorOffice}
                  onChange={(e) =>
                    handleChange("supervisorOffice", e.target.value)
                  }
                  className="w-full border border-slate-200 rounded-lg p-1.5 text-[11px] font-bold outline-none bg-slate-50"
                >
                  <option value="">-- اختر --</option>
                  {offices.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-xs font-black text-slate-800 truncate">
                  {offices.find(
                    (o) => o.id === requestDataForm.supervisorOffice,
                  )?.name || "غير محدد"}
                </div>
              )}
            </div>
          </div>

          {/* أرقام التتبع */}
          <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 shadow-sm">
            <h4 className="text-[11px] font-black text-blue-900 mb-2 border-b border-blue-100 pb-1">
              أرقام التتبع (بلدي)
            </h4>
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-blue-700 block mb-0.5">
                  رقم الخدمة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.serviceNumber}
                    onChange={(e) =>
                      handleChange("serviceNumber", e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-md p-1.5 text-[11px] font-mono outline-none"
                  />
                ) : (
                  <div className="font-mono text-sm font-black text-blue-800 bg-white border border-blue-100 px-2 py-1 rounded-md">
                    {requestDataForm.serviceNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-blue-700 block mb-0.5">
                  سنة الخدمة
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.serviceYear}
                    onChange={(e) =>
                      handleChange("serviceYear", e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-md p-1.5 text-[11px] font-mono outline-none"
                  />
                ) : (
                  <div className="font-mono text-sm font-black text-blue-800 bg-white border border-blue-100 px-2 py-1 rounded-md">
                    {requestDataForm.serviceYear || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-blue-700 block mb-0.5">
                  رقم الطلب
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.requestNumber}
                    onChange={(e) =>
                      handleChange("requestNumber", e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-md p-1.5 text-[11px] font-mono outline-none"
                  />
                ) : (
                  <div className="font-mono text-sm font-black text-blue-800 bg-white border border-blue-100 px-2 py-1 rounded-md">
                    {requestDataForm.requestNumber || "—"}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-[9px] font-bold text-blue-700 block mb-0.5">
                  سنة الطلب
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.requestYear}
                    onChange={(e) =>
                      handleChange("requestYear", e.target.value)
                    }
                    className="w-full border border-blue-200 rounded-md p-1.5 text-[11px] font-mono outline-none"
                  />
                ) : (
                  <div className="font-mono text-sm font-black text-blue-800 bg-white border border-blue-100 px-2 py-1 rounded-md">
                    {requestDataForm.requestYear || "—"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* بيانات الرخصة */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col">
            <h4 className="text-[11px] font-black text-slate-800 mb-2 border-b border-slate-100 pb-1 flex justify-between">
              بيانات الرخصة
              <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                <User className="w-3 h-3" />{" "}
                {requestDataForm.responsibleEmployee || "غير محدد"}
              </span>
            </h4>

            <div className="grid grid-cols-3 gap-2 mb-2">
              <div>
                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                  الرقم الإلكتروني
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.electronicLicenseNumber}
                    onChange={(e) =>
                      handleChange("electronicLicenseNumber", e.target.value)
                    }
                    className="w-full border rounded-md p-1.5 text-[10px] font-mono bg-slate-50"
                  />
                ) : (
                  <div className="font-mono text-xs font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-md">
                    {requestDataForm.electronicLicenseNumber || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                  السنة (هجري)
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={requestDataForm.electronicLicenseHijriYear}
                    onChange={(e) =>
                      handleChange("electronicLicenseHijriYear", e.target.value)
                    }
                    className="w-full border rounded-md p-1.5 text-[10px] font-mono bg-slate-50"
                  />
                ) : (
                  <div className="font-mono text-xs font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-md">
                    {requestDataForm.electronicLicenseHijriYear || "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[9px] font-bold text-slate-500 block mb-0.5">
                  تاريخ (ميلادي)
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={requestDataForm.electronicLicenseDate}
                    onChange={(e) =>
                      handleChange("electronicLicenseDate", e.target.value)
                    }
                    className="w-full border rounded-md p-1.5 text-[10px] font-mono bg-slate-50"
                  />
                ) : (
                  <div className="font-mono text-xs font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-md">
                    {requestDataForm.electronicLicenseDate
                      ? new Date(
                          requestDataForm.electronicLicenseDate,
                        ).toLocaleDateString("en-GB")
                      : "—"}
                  </div>
                )}
              </div>
            </div>

            {/* تصحيح الوضع */}
            {isApprovalRequest && (
              <div className="grid grid-cols-3 gap-2 pt-2 mt-auto border-t border-dashed border-slate-200 bg-amber-50/50 p-2 rounded-lg">
                <div className="col-span-3 text-[9px] font-bold text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> بيانات الرخصة القديمة
                </div>
                <div>
                  <label className="text-[8px] font-bold text-slate-500 block mb-0.5">
                    رقم القديمة
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={requestDataForm.oldLicenseNumber}
                      onChange={(e) =>
                        handleChange("oldLicenseNumber", e.target.value)
                      }
                      className="w-full border rounded text-[10px] p-1 font-mono"
                    />
                  ) : (
                    <div className="font-mono text-[11px] font-black text-slate-700">
                      {requestDataForm.oldLicenseNumber || "—"}
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
                      value={requestDataForm.oldLicenseHijriYear}
                      onChange={(e) =>
                        handleChange("oldLicenseHijriYear", e.target.value)
                      }
                      className="w-full border rounded text-[10px] p-1 font-mono"
                    />
                  ) : (
                    <div className="font-mono text-[11px] font-black text-slate-700">
                      {requestDataForm.oldLicenseHijriYear || "—"}
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
                      value={requestDataForm.oldLicenseDate}
                      onChange={(e) =>
                        handleChange("oldLicenseDate", e.target.value)
                      }
                      className="w-full border rounded text-[10px] p-1 font-mono"
                    />
                  ) : (
                    <div className="font-mono text-[11px] font-black text-slate-700">
                      {requestDataForm.oldLicenseDate
                        ? new Date(
                            requestDataForm.oldLicenseDate,
                          ).toLocaleDateString("en-GB")
                        : "—"}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* العمود الأيسر: رسائل الذكاء الاصطناعي */}
        <div className="bg-slate-900 rounded-xl p-3 shadow-md flex flex-col min-h-0 border border-slate-800">
          <div className="flex items-center justify-between mb-3 border-b border-slate-700 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <div>
                <h4 className="text-[12px] font-black text-white leading-none mb-0.5">
                  ملاحظات الجهات (AI)
                </h4>
                <p className="text-[8px] text-slate-400">
                  سحب آلي برقم:{" "}
                  <span className="font-mono text-purple-400">
                    {requestDataForm.serviceNumber || "—"}
                  </span>
                </p>
              </div>
            </div>
            {emailsLoading && (
              <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin" />
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-1 space-y-2">
            {!requestDataForm.serviceNumber &&
            !requestDataForm.requestNumber ? (
              <div className="text-center py-6 opacity-40">
                <Inbox className="w-8 h-8 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-white">
                  أدخل أرقام التتبع للبحث الآلي
                </p>
              </div>
            ) : relatedEmails.length === 0 ? (
              <div className="text-center py-6 opacity-40">
                <Mail className="w-8 h-8 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-white">
                  لا توجد إفادات مطابقة
                </p>
              </div>
            ) : (
              relatedEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-slate-800/80 border border-slate-700 rounded-lg p-2.5"
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] font-bold text-slate-200 truncate pr-2 border-r-2 border-emerald-500">
                      {email.subject}
                    </span>
                    <span className="text-[8px] text-slate-400 font-mono shrink-0">
                      {new Date(email.date).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2 rounded border-r border-purple-500/50 text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
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
