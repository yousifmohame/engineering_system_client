import React from "react";
import {
  Building,
  Search,
  Users,
  Loader2,
  Sparkles,
  MapPin,
  FolderOpen,
  ClipboardList,
  CalendarDays,
  CheckCircle2,
} from "lucide-react";
import { getClientName } from "../../utils/quotationConstants";

export const Step0ClientProperty = ({ props }) => {
  const {
    selectedClient,
    setSelectedClient,
    selectedProperty,
    setSelectedProperty,
    clientSearch,
    setClientSearch,
    propertySearch,
    setPropertySearch,
    clientsData,
    propertiesData,
    clientsLoading,
    propertiesLoading,
    selectedTransaction,
    setSelectedTransaction,
    transactionSearch,
    setTransactionSearch,
    transactionsData,
    transactionsLoading,
    selectedMeeting,
    setSelectedMeeting,
    meetingSearch,
    setMeetingSearch,
    meetingsData,
    meetingsLoading,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full">
      {/* شبكة 2x2 للشاشات الكبيرة لتكثيف العرض */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ========================================== */}
        {/* 1️⃣ اختيار الملكية (سماوي) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-[230px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500"></div>

          <div className="flex justify-between items-center mb-2.5 pl-1">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-cyan-500" /> تحديد ملف
              الملكية <span className="text-red-500">*</span>
            </div>
            {selectedProperty && (
              <span className="text-[9px] px-1.5 py-0.5 bg-cyan-50 text-cyan-600 rounded font-bold">
                تم التحديد
              </span>
            )}
          </div>

          <div className="relative mb-2">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="بحث برقم الصك، الكود..."
              className="w-full py-1.5 pr-8 pl-2 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 bg-slate-50"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5">
            {propertiesLoading ? (
              <div className="m-auto">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
            ) : propertiesData?.length > 0 ? (
              propertiesData.map((prop) => {
                const isSelected = selectedProperty === prop.id;
                return (
                  <div
                    key={prop.id}
                    onClick={() => {
                      setSelectedProperty(prop.id);
                      const relatedClientId = prop.clientId || prop.client?.id;
                      if (relatedClientId) setSelectedClient(relatedClientId);
                    }}
                    className={`flex flex-col p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "border-cyan-400 bg-cyan-50/50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-cyan-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                        <span
                          className={`font-bold text-[11px] ${isSelected ? "text-cyan-800" : "text-slate-700"}`}
                        >
                          {prop.code}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500 px-1.5 py-0.5 rounded border border-slate-100 bg-slate-50">
                        صك: {prop.deedNumber || "—"}
                      </span>
                    </div>
                    {prop.district && (
                      <div className="text-[9.5px] text-slate-500 flex items-center gap-1 mr-5">
                        <MapPin className="w-2.5 h-2.5" /> {prop.city} -{" "}
                        {prop.district}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-400 text-center mt-4">
                لا توجد ملكيات مطابقة
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* 2️⃣ اختيار العميل (أزرق) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-[230px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-blue-500"></div>

          <div className="flex justify-between items-center mb-2.5 pl-1">
            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-500" /> تحديد ملف العميل{" "}
              <span className="text-red-500">*</span>
            </div>
            {selectedClient && (
              <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-bold">
                تم التحديد
              </span>
            )}
          </div>

          <div className="relative mb-2">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="بحث بالاسم، الهوية، الجوال..."
              className="w-full py-1.5 pr-8 pl-2 border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-slate-50"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5">
            {clientsLoading ? (
              <div className="m-auto">
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              </div>
            ) : clientsData?.length > 0 ? (
              clientsData.map((client) => {
                const isSelected = selectedClient === client.id;
                return (
                  <div
                    key={client.id}
                    onClick={() => setSelectedClient(client.id)}
                    className={`flex flex-col p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "border-blue-400 bg-blue-50/50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-blue-200"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                        )}
                        <span
                          className={`font-bold text-[11px] ${isSelected ? "text-blue-800" : "text-slate-700"}`}
                        >
                          {getClientName(client)}
                        </span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-500 px-1.5 py-0.5 bg-slate-50 rounded border border-slate-100">
                        {client.clientCode}
                      </span>
                    </div>
                    {(client.idNumber || client.mobile) && (
                      <div className="text-[9.5px] text-slate-500 flex gap-2 mr-5">
                        {client.idNumber && (
                          <span>هوية: {client.idNumber}</span>
                        )}
                        {client.mobile && (
                          <span className="dir-ltr text-left">
                            {client.mobile}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-[10px] text-slate-400 text-center mt-4">
                لا يوجد عملاء مطابقين
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* 3️⃣ اختيار المعاملة (بنفسجي - اختياري) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-[180px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-purple-500"></div>

          <div className="flex justify-between items-center mb-2.5 pl-1">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-500" /> ربط بمعاملة
              قائمة
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
              اختياري
            </span>
          </div>

          <div className="relative mb-2">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={transactionSearch || ""}
              onChange={(e) =>
                setTransactionSearch && setTransactionSearch(e.target.value)
              }
              placeholder="بحث برقم المعاملة، الوصف..."
              className="w-full py-1.5 pr-8 pl-2 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 bg-slate-50"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
            {transactionsLoading ? (
              <div className="m-auto">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
            ) : transactionsData?.length > 0 ? (
              transactionsData.map((txn) => {
                // 👇🔥 التصحيح هنا: نستخدم txn.id بدلاً من txn.ref
                const isSelected = selectedTransaction === txn.id;
                return (
                  <div
                    key={txn.id}
                    // 👇🔥 التصحيح هنا: نحفظ txn.id في الـ State
                    onClick={() =>
                      setSelectedTransaction && setSelectedTransaction(txn.id)
                    }
                    className={`flex justify-between items-center p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "border-purple-400 bg-purple-50/50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-purple-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                      <span
                        className={`font-bold text-[10px] truncate max-w-[140px] ${isSelected ? "text-purple-800" : "text-slate-700"}`}
                      >
                        {txn.client || txn.description || "معاملة بدون وصف"}
                      </span>
                    </div>
                    <span className="font-mono text-[8px] text-slate-500 px-1 py-0.5 rounded border border-slate-100 bg-slate-50">
                      {txn.referenceNumber || txn.ref}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="text-[9px] text-slate-400 text-center mt-4">
                لا توجد معاملات مطابقة
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* 4️⃣ اختيار محضر الاجتماع (أصفر - اختياري) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden flex flex-col h-[180px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-amber-500"></div>

          <div className="flex justify-between items-center mb-2.5 pl-1">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-amber-500" /> الاستناد
              لمحضر اجتماع
            </div>
            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
              اختياري
            </span>
          </div>

          <div className="relative mb-2">
            <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={meetingSearch || ""}
              onChange={(e) =>
                setMeetingSearch && setMeetingSearch(e.target.value)
              }
              placeholder="بحث بعنوان المحضر، التاريخ..."
              className="w-full py-1.5 pr-8 pl-2 border border-slate-200 rounded-lg text-[10px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 bg-slate-50"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1">
            {meetingsLoading ? (
              <div className="m-auto">
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
              </div>
            ) : meetingsData?.length > 0 ? (
              meetingsData.map((meeting) => {
                const isSelected = selectedMeeting === meeting.id;
                return (
                  <div
                    key={meeting.id}
                    onClick={() =>
                      setSelectedMeeting && setSelectedMeeting(meeting.id)
                    }
                    className={`flex justify-between items-center p-2 rounded-lg cursor-pointer border transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-50/50 shadow-sm"
                        : "border-slate-100 bg-white hover:border-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <div className="w-3.5 h-3.5 rounded-full border border-slate-300" />
                      )}
                      <span
                        className={`font-bold text-[10px] truncate max-w-[140px] ${isSelected ? "text-amber-800" : "text-slate-700"}`}
                      >
                        {meeting.title || "محضر اجتماع"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[8px] text-slate-500 font-mono bg-slate-50 px-1 py-0.5 border border-slate-100 rounded">
                      <CalendarDays className="w-2.5 h-2.5" />
                      {meeting.meetingDate
                        ? new Date(meeting.meetingDate).toLocaleDateString(
                            "ar-SA",
                          )
                        : "---"}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-[9px] text-slate-400 text-center mt-4">
                {selectedClient
                  ? "لا توجد محاضر لهذا العميل"
                  : "حدد العميل أولاً"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 💡 نصيحة السفلية (أكثر كثافة) */}
      <div className="mt-3 p-2.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100/50 rounded-lg flex items-center gap-2.5 text-[10.5px] text-indigo-800">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
        <div>
          <strong className="font-bold mr-1">تلميح ذكي:</strong>
          تحديد <span className="text-cyan-600 font-bold">الملكية</span> أولاً
          يقوم بجلب <span className="text-blue-600 font-bold">العميل</span>{" "}
          تلقائياً. ربط العرض بـ{" "}
          <span className="text-amber-600 font-bold">محضر اجتماع</span> يسرع من
          عملية الاعتماد.
        </div>
      </div>
    </div>
  );
};
