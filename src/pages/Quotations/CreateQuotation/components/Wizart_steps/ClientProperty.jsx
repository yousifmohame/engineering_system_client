import React, { useState } from "react";
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
  PlusCircle,
  List,
  X,
} from "lucide-react";
import { getClientName } from "../../utils/quotationConstants";

// 🚨 التأكد من مسارات الاستيراد
import NewPropertyWizard from "../../../../Property/components/NewPropertyWizard";
import CreateClientPanel from "../../../../Clients/screens/CreateClientPanel";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

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

  // 🚀 حالات فتح النوافذ المنبثقة
  const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  return (
    <>
      <div className="animate-in fade-in duration-300 flex flex-col h-full text-[#123f59]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* ========================================== */}
          {/* 1️⃣ اختيار/إضافة الملكية (المشروع) */}
          {/* ========================================== */}
          <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col min-h-[230px]">
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500"></div>

            <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
              <div className="text-xs font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
                <IconWithText
                  icon={Building}
                  iconClassName="w-3.5 h-3.5 text-cyan-500"
                />
                بيانات المشروع / الملكية <span className="text-red-500">*</span>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                <button className="px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all bg-white shadow-sm text-cyan-700 cursor-default">
                  <List className="w-3 h-3" /> بحث
                </button>
                <button
                  onClick={() => setIsDeedModalOpen(true)}
                  className="px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all text-slate-500 hover:text-cyan-700 hover:bg-slate-200"
                >
                  <PlusCircle className="w-3 h-3" /> جديد
                </button>
              </div>
            </div>

            {/* مربع البحث وعرض النتائج */}
            <div className="relative mb-2">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                type="text"
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                placeholder="بحث برقم الصك، الكود..."
                className="w-full py-1.5 pr-8 pl-2 border border-[#d8b46a]/25 rounded-xl text-[11px] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim pr-1 flex flex-col gap-1.5 h-[150px]">
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
                        const relatedClientId =
                          prop.clientId || prop.client?.id;
                        if (relatedClientId) setSelectedClient(relatedClientId);
                      }}
                      className={`flex flex-col p-2 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? "border-cyan-400 bg-cyan-50/50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                          : "border-[#e8ddc8] bg-white hover:border-cyan-200"
                      }`}
                    >
                      <div className="flex min-w-0 justify-between items-center mb-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-[#d8b46a]/25" />
                          )}
                          <span
                            className={`font-bold text-[11px] ${isSelected ? "text-cyan-800" : "text-[#475569]"}`}
                          >
                            {prop.code}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#64748b] px-1.5 py-0.5 rounded border border-[#e8ddc8] bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
                          صك: {prop.deedNumber || "—"}
                        </span>
                      </div>
                      {prop.district && (
                        <div className="text-[9.5px] text-[#64748b] flex min-w-0 items-center gap-1 mr-5">
                          <MapPin className="w-2.5 h-2.5" /> {prop.city} -{" "}
                          {prop.district}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-[10px] text-[#94a3b8] text-center mt-4">
                  لا توجد ملكيات مطابقة
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 2️⃣ اختيار/إضافة العميل (صاحب العلاقة) */}
          {/* ========================================== */}
          <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col min-h-[230px]">
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#0e7490]"></div>

            <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
              <div className="text-xs font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#0e7490]" />
                بيانات المالك (صاحب العلاقة){" "}
                <span className="text-red-500">*</span>
              </div>

              <div className="flex bg-slate-100 rounded-lg p-0.5">
                <button className="px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all bg-white shadow-sm text-[#0e7490] cursor-default">
                  <List className="w-3 h-3" /> بحث
                </button>
                <button
                  onClick={() => setIsClientModalOpen(true)}
                  className="px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all text-slate-500 hover:text-[#0e7490] hover:bg-slate-200"
                >
                  <PlusCircle className="w-3 h-3" /> جديد
                </button>
              </div>
            </div>

            {/* مربع البحث وعرض النتائج */}
            <div className="relative mb-2">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                placeholder="بحث بالاسم، الهوية، الجوال..."
                className="w-full py-1.5 pr-8 pl-2 border border-[#d8b46a]/25 rounded-xl text-[11px] focus:outline-none focus:border-[#c5983c]/70 focus:ring-1 focus:ring-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim pr-1 flex flex-col gap-1.5 h-[150px]">
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
                      className={`flex flex-col p-2 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? "border-blue-400 bg-[#eef7f6]/50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                          : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/35"
                      }`}
                    >
                      <div className="flex min-w-0 justify-between items-center mb-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#123f59]" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-[#d8b46a]/25" />
                          )}
                          <span
                            className={`font-bold text-[11px] ${isSelected ? "text-[#123f59]" : "text-[#475569]"}`}
                          >
                            {getClientName(client)}
                          </span>
                        </div>
                        <span className="font-mono text-[9px] text-[#64748b] px-1.5 py-0.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded border border-[#e8ddc8]">
                          {client.clientCode}
                        </span>
                      </div>
                      {(client.idNumber || client.mobile) && (
                        <div className="text-[9.5px] text-[#64748b] flex gap-2 mr-5">
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
                <div className="text-[10px] text-[#94a3b8] text-center mt-4">
                  لا يوجد عملاء مطابقين
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 3️⃣ اختيار المعاملة (اختياري) */}
          {/* ========================================== */}
          <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col h-[180px]">
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-purple-500"></div>

            <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
              <div className="text-[11px] font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-purple-500" /> ربط
                بمعاملة قائمة
              </div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#fbf8f1] text-[#64748b] rounded">
                اختياري
              </span>
            </div>

            <div className="relative mb-2">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                type="text"
                value={transactionSearch || ""}
                onChange={(e) =>
                  setTransactionSearch && setTransactionSearch(e.target.value)
                }
                placeholder="بحث برقم المعاملة، الوصف..."
                className="w-full py-1.5 pr-8 pl-2 border border-[#d8b46a]/25 rounded-xl text-[10px] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim pr-1 flex flex-col gap-1">
              {transactionsLoading ? (
                <div className="m-auto">
                  <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                </div>
              ) : transactionsData?.length > 0 ? (
                transactionsData.map((txn) => {
                  const isSelected = selectedTransaction === txn.id;
                  return (
                    <div
                      key={txn.id}
                      onClick={() =>
                        setSelectedTransaction && setSelectedTransaction(txn.id)
                      }
                      className={`flex min-w-0 justify-between items-center p-2 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? "border-purple-400 bg-purple-50/50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                          : "border-[#e8ddc8] bg-white hover:border-purple-200"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#d8b46a]/25" />
                        )}
                        <span
                          className={`font-bold text-[10px] truncate max-w-[140px] ${isSelected ? "text-purple-800" : "text-[#475569]"}`}
                        >
                          {txn.client || txn.description || "معاملة بدون وصف"}
                        </span>
                      </div>
                      <span className="font-mono text-[8px] text-[#64748b] px-1 py-0.5 rounded border border-[#e8ddc8] bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
                        {txn.referenceNumber || txn.ref}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-[9px] text-[#94a3b8] text-center mt-4">
                  لا توجد معاملات مطابقة
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 4️⃣ اختيار محضر الاجتماع (اختياري) */}
          {/* ========================================== */}
          <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col h-[180px]">
            <div className="absolute top-0 bottom-0 right-0 w-1 bg-amber-500"></div>

            <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
              <div className="text-[11px] font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
                <ClipboardList className="w-3.5 h-3.5 text-amber-500" />{" "}
                الاستناد لمحضر اجتماع
              </div>
              <span className="text-[8px] font-bold px-1.5 py-0.5 bg-[#fbf8f1] text-[#64748b] rounded">
                اختياري
              </span>
            </div>

            <div className="relative mb-2">
              <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94a3b8]" />
              <input
                type="text"
                value={meetingSearch || ""}
                onChange={(e) =>
                  setMeetingSearch && setMeetingSearch(e.target.value)
                }
                placeholder="بحث بعنوان المحضر، التاريخ..."
                className="w-full py-1.5 pr-8 pl-2 border border-[#d8b46a]/25 rounded-xl text-[10px] focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
              />
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-slim pr-1 flex flex-col gap-1">
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
                      className={`flex min-w-0 justify-between items-center p-2 rounded-xl cursor-pointer border transition-all ${
                        isSelected
                          ? "border-amber-400 bg-amber-50/50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                          : "border-[#e8ddc8] bg-white hover:border-amber-200"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-1.5">
                        {isSelected ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-[#d8b46a]/25" />
                        )}
                        <span
                          className={`font-bold text-[10px] truncate max-w-[140px] ${isSelected ? "text-amber-800" : "text-[#475569]"}`}
                        >
                          {meeting.title || "محضر اجتماع"}
                        </span>
                      </div>
                      <div className="flex min-w-0 items-center gap-1 text-[8px] text-[#64748b] font-mono bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white px-1 py-0.5 border border-[#e8ddc8] rounded">
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
                <div className="text-[9px] text-[#94a3b8] text-center mt-4">
                  {selectedClient
                    ? "لا توجد محاضر لهذا العميل"
                    : "حدد العميل أولاً"}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 💡 نصيحة السفلية */}
        <div className="mt-3 p-2.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100/50 rounded-xl flex min-w-0 items-center gap-2.5 text-[10.5px] text-indigo-800">
          <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
          <div>
            <strong className="font-bold mr-1">تلميح ذكي:</strong>
            يمكنك الآن{" "}
            <span className="text-cyan-600 font-bold">
              إضافة عميل أو مشروع جديد
            </span>{" "}
            مباشرة عبر النقر على زر "جديد" ليتم حفظه واستخدامه في عروض الأسعار
            والمعاملات الأخرى.
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🌟 النوافذ المنبثقة (Modals) للإضافة المباشرة للقاعدة */}
      {/* ============================================================== */}

      {/* 🚀 تغليف NewPropertyWizard داخل مودال ليظهر كـ Popup */}
      {isDeedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#eef5f7] rounded-[24px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col h-[95vh] animate-in zoom-in-95 duration-200">
            {/* رأس المودال للملكية */}
            <div className="bg-white flex justify-between items-center p-4 border-b border-slate-200 shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#123B5D]">
                    إضافة ملف ملكية جديد (معالج الصكوك)
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500">
                    سيتم حفظ الملكية واستخدامها فوراً في النظام
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeedModalOpen(false)}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوى المودال (معالج الملكية) */}
            <div className="flex-1 overflow-hidden relative">
              <NewPropertyWizard
                onComplete={() => {
                  setIsDeedModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* مودال إضافة العميل (يغلف مكون CreateClientPanel) */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#eef5f7] rounded-[24px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[95vh] animate-in zoom-in-95 duration-200">
            {/* رأس المودال للعميل */}
            <div className="bg-white flex justify-between items-center p-4 border-b border-slate-200 shadow-sm z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#123B5D]">
                    إضافة عميل جديد
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500">
                    سيتم حفظ العميل في قاعدة البيانات واستخدامه فوراً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* محتوى المودال (إنشاء العميل) */}
            <div className="flex-1 overflow-hidden relative">
              <CreateClientPanel
                onComplete={() => {
                  setIsClientModalOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};