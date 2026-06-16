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
  CheckCircle2,
  PlusCircle,
  List,
  X,
  Scale,
  ShieldAlert,
  FileSignature,
  FileText,
} from "lucide-react";
import { getClientName } from "../../utils/quotationConstants";

// 🚨 التأكد من مسارات الاستيراد لديك
import NewPropertyWizard from "../../../../Property/components/NewPropertyWizard";
import CreateClientPanel from "../../../../Clients/screens/CreateClientPanel";

export const Step0ClientProperty = ({ props }) => {
  const {
    // 📦 الـ Props الأساسية
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

    // 🆕 الـ Props الجديدة للتمثيل النظامي (أضفها في المكون الأب)
    clientType = "فرد",
    setClientType,
    signatureMethod = "SELF",
    setSignatureMethod,
    repName,
    setRepName,
    repIdNumber,
    setRepIdNumber,
    repPhone,
    setRepPhone,
    repCapacity,
    setRepCapacity,
    authDocType,
    setAuthDocType,
    authDocNumber,
    setAuthDocNumber,
    authDocDate,
    setAuthDocDate,
  } = props;

  const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // تنسيق سكرول بار مخصص
  const scrollbarClasses = `
    [&::-webkit-scrollbar]:w-1.5
    [&::-webkit-scrollbar-track]:bg-slate-50
    [&::-webkit-scrollbar-track]:rounded-full
    [&::-webkit-scrollbar-thumb]:bg-slate-200
    [&::-webkit-scrollbar-thumb]:rounded-full
    hover:[&::-webkit-scrollbar-thumb]:bg-slate-300
    transition-all
  `;

  // 🧠 دالة ذكية لإرجاع المستندات المطلوبة حسب نوع العميل
  const getRequiredDocumentsTip = (type) => {
    switch (type) {
      case "ورثة":
        return "المستندات المطلوبة: صك حصر الورثة، وكالة شرعية من جميع الورثة، وهوية الوكيل/الممثل.";
      case "شركة_مؤسسة":
        return "المستندات المطلوبة: السجل التجاري ساري المفعول، هوية المفوض، خطاب تفويض أو قرار مديرين يثبت صلاحية التوقيع.";
      case "وقف":
        return "المستندات المطلوبة: صك الوقف، صك نظارة ساري، وهوية ناظر الوقف.";
      case "جهة_حكومية":
        return "المستندات المطلوبة: خطاب تفويض رسمي أو تعميد من الإدارة المختصة يوضح صفة وصلاحية المفوض.";
      case "فرد":
      default:
        return "المستندات المطلوبة: هوية المالك، أو وكالة شرعية سارية في حال كان الموقّع وكيلًا.";
    }
  };

  return (
    <>
      <div className="animate-in fade-in duration-300 flex flex-col h-full text-[#123f59] overflow-y-auto pr-1 pb-4 custom-scrollbar-slim">
        {/* ========================================== */}
        {/* 🌟 الصف الأول: اختيار الملكية والعميل */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* 1️⃣ كارت بيانات المشروع / الملكية */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-[280px] overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-cyan-500 transition-all group-hover:w-1.5"></div>
            <div className="p-3.5 flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-cyan-50 rounded-lg">
                    <Building className="w-4 h-4 text-cyan-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">
                    بيانات المشروع / الملكية{" "}
                    <span className="text-red-500">*</span>
                  </h3>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setIsDeedModalOpen(true)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 text-slate-500 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> جديد
                  </button>
                </div>
              </div>
              <div className="relative mb-3 shrink-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={propertySearch}
                  onChange={(e) => setPropertySearch(e.target.value)}
                  placeholder="ابحث برقم الصك، أو كود المشروع..."
                  className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 bg-slate-50/50"
                />
              </div>
              <div
                className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-2 ${scrollbarClasses}`}
              >
                {propertiesLoading ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  propertiesData?.map((prop) => {
                    const isSelected = selectedProperty === prop.id;
                    return (
                      <div
                        key={prop.id}
                        // الكود المعدل للملكية
                        onClick={() => {
                          if (selectedProperty === prop.id) {
                            // إلغاء التحديد إذا ضغط عليه مرة أخرى
                            setSelectedProperty("");
                          } else {
                            // تحديد جديد
                            setSelectedProperty(prop.id);
                            if (prop.clientId) setSelectedClient(prop.clientId);
                          }
                        }}
                        className={`flex flex-col p-2.5 rounded-lg cursor-pointer border transition-all ${isSelected ? "border-cyan-500 bg-cyan-50/50 shadow-sm" : "border-slate-100 hover:border-cyan-200"}`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-cyan-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                            )}
                            <span className="font-bold text-xs">
                              {prop.code}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 bg-white border px-1.5 rounded">
                            صك: {prop.deedNumber || "—"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* 2️⃣ كارت بيانات المالك (العميل) */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-[280px] overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 transition-all group-hover:w-1.5"></div>
            <div className="p-3.5 flex flex-col h-full">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">
                    بيانات المالك (العميل){" "}
                    <span className="text-red-500">*</span>
                  </h3>
                </div>
                <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-md flex items-center gap-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> جديد
                  </button>
                </div>
              </div>
              <div className="relative mb-3 shrink-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  placeholder="ابحث بالاسم، الهوية، الجوال..."
                  className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-slate-50/50"
                />
              </div>
              <div
                className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-2 ${scrollbarClasses}`}
              >
                {clientsLoading ? (
                  <div className="flex-1 flex items-center justify-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                ) : (
                  clientsData?.map((client) => {
                    const isSelected = selectedClient === client.id;
                    return (
                      <div
                        key={client.id}
                        // الكود المعدل للعميل
                        onClick={() => {
                          if (selectedClient === client.id) {
                            // إلغاء التحديد
                            setSelectedClient("");
                          } else {
                            // تحديد جديد وسحب بياناته
                            setSelectedClient(client.id);
                            if (setRepPhone)
                              setRepPhone(client.phone || client.mobile || "");
                            if (setClientType && client.clientType)
                              setClientType(client.clientType);
                          }
                        }}
                        className={`flex flex-col p-2.5 rounded-lg cursor-pointer border transition-all ${isSelected ? "border-blue-500 bg-blue-50/50 shadow-sm" : "border-slate-100 hover:border-blue-200"}`}
                      >
                        <div className="flex justify-between items-center mb-1.5">
                          <div className="flex items-center gap-2">
                            {isSelected ? (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-slate-200" />
                            )}
                            <span className="font-bold text-xs">
                              {getClientName(client)}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 bg-white border px-1.5 rounded">
                            {client.clientCode}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 🌟 الصف الثاني: الصفة النظامية والتمثيل القانوني */}
        {/* ========================================== */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative overflow-hidden mb-4 group">
          <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 transition-all group-hover:w-1.5"></div>

          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Scale className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-700">
                  الصفة النظامية والتمثيل بالتوقيع
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  تحديد نوع العميل ومن يحق له التوقيع على هذا العرض/العقد
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* نوع العميل وطريقة التوقيع */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  نوع العميل <span className="text-red-500">*</span>
                </label>
                <select
                  value={clientType}
                  onChange={(e) => {
                    if (setClientType) setClientType(e.target.value);
                    if (e.target.value === "فرد" && setSignatureMethod)
                      setSignatureMethod("SELF");
                  }}
                  className="w-full p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="فرد">فرد</option>
                  <option value="شركة_مؤسسة">شركة / مؤسسة</option>
                  <option value="ورثة">ورثة</option>
                  <option value="وقف">وقف</option>
                  <option value="جهة_حكومية">جهة حكومية</option>
                  <option value="جمعية">جمعية / كيان غير ربحي</option>
                  <option value="اخرى">كيان آخر</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                  طريقة التوقيع والاعتماد{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FileSignature className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={signatureMethod}
                    onChange={(e) =>
                      setSignatureMethod && setSignatureMethod(e.target.value)
                    }
                    className="w-full py-2 pr-9 pl-3 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                  >
                    <option value="SELF">المالك سيوقع بنفسه</option>
                    <option value="AGENT">وكيل عن المالك بموجب وكالة</option>
                    <option value="MANAGER">المدير العام / مفوض إداري</option>
                    <option value="HEIRS_REP">ممثل ومفوض عن الورثة</option>
                    <option value="WAQF_NAZER">ناظر الوقف</option>
                    <option value="GOV_REP">مفوض عن جهة حكومية</option>
                    <option value="OTHER">شخص آخر له صفة نظامية</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 🚨 عرض صندوق المستندات الإرشادية */}
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 flex gap-3 items-start">
              <ShieldAlert className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-emerald-800 mb-0.5">
                  المستندات المؤيدة للتمثيل النظامي ({clientType})
                </p>
                <p className="text-[10px] text-emerald-700 leading-relaxed">
                  {getRequiredDocumentsTip(clientType)}
                </p>
              </div>
            </div>

            {/* 📄 حقول المفوض (تظهر فقط إذا كان التوقيع لغير المالك) */}
            {signatureMethod !== "SELF" && (
              <div className="mt-2 pt-4 border-t border-slate-100 animate-in slide-in-from-top-2 duration-300">
                <h4 className="text-[11px] font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" /> بيانات
                  الممثل النظامي / المفوض بالتوقيع
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      الاسم الرباعي للمفوض
                    </label>
                    <input
                      type="text"
                      value={repName}
                      onChange={(e) => setRepName && setRepName(e.target.value)}
                      placeholder="اسم الموقّع..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      رقم الهوية / الإقامة
                    </label>
                    <input
                      type="text"
                      value={repIdNumber}
                      onChange={(e) =>
                        setRepIdNumber && setRepIdNumber(e.target.value)
                      }
                      placeholder="رقم الهوية الوطنية..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      الصفة بالتحديد
                    </label>
                    <input
                      type="text"
                      value={repCapacity}
                      onChange={(e) =>
                        setRepCapacity && setRepCapacity(e.target.value)
                      }
                      placeholder="مثال: وكيل شرعي، مدير عام..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      نوع مستند التفويض
                    </label>
                    <input
                      type="text"
                      value={authDocType}
                      onChange={(e) =>
                        setAuthDocType && setAuthDocType(e.target.value)
                      }
                      placeholder="مثال: وكالة، قرار، صك نظارة..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      رقم المستند
                    </label>
                    <input
                      type="text"
                      value={authDocNumber}
                      onChange={(e) =>
                        setAuthDocNumber && setAuthDocNumber(e.target.value)
                      }
                      placeholder="رقم الوكالة أو القرار..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">
                      تاريخ إصدار المستند
                    </label>
                    <input
                      type="date"
                      value={authDocDate}
                      onChange={(e) =>
                        setAuthDocDate && setAuthDocDate(e.target.value)
                      }
                      className="w-full p-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================== */}
        {/* 🌟 الصف الثالث: المعاملات ومحاضر الاجتماعات (اختياري) */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative flex flex-col h-[200px] overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-purple-500 transition-all group-hover:w-1.5"></div>
            <div className="p-3.5 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-50 rounded-lg">
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">
                    ربط بمعاملة قائمة
                  </h3>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  اختياري
                </span>
              </div>
              <div className="relative mb-2 shrink-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={transactionSearch || ""}
                  onChange={(e) =>
                    setTransactionSearch && setTransactionSearch(e.target.value)
                  }
                  placeholder="بحث برقم المعاملة..."
                  className="w-full py-1.5 pr-9 pl-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-purple-500 bg-slate-50/50"
                />
              </div>
              <div
                className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 ${scrollbarClasses}`}
              >
                {transactionsData?.map((txn) => (
                  <div
                    key={txn.id}
                    // الكود المعدل للمعاملات
                    onClick={() => {
                      if (setSelectedTransaction) {
                        setSelectedTransaction(
                          selectedTransaction === txn.id ? "" : txn.id,
                        );
                      }
                    }}
                    className={`flex justify-between items-center p-2 rounded-lg cursor-pointer border ${selectedTransaction === txn.id ? "border-purple-500 bg-purple-50/50" : "border-slate-100 hover:border-purple-200"}`}
                  >
                    <span className="font-bold text-[10px] truncate">
                      {txn.client || txn.description || "معاملة بدون وصف"}
                    </span>
                    <span className="font-mono text-[9px] text-slate-500">
                      {txn.referenceNumber || txn.ref}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm relative flex flex-col h-[200px] overflow-hidden group">
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-amber-500 transition-all group-hover:w-1.5"></div>
            <div className="p-3.5 flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 rounded-lg">
                    <ClipboardList className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-700">
                    الاستناد لمحضر اجتماع
                  </h3>
                </div>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                  اختياري
                </span>
              </div>
              <div className="relative mb-2 shrink-0">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={meetingSearch || ""}
                  onChange={(e) =>
                    setMeetingSearch && setMeetingSearch(e.target.value)
                  }
                  placeholder="ابحث بعنوان المحضر..."
                  className="w-full py-1.5 pr-9 pl-3 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 bg-slate-50/50"
                />
              </div>
              <div
                className={`flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5 ${scrollbarClasses}`}
              >
                {meetingsData?.map((meeting) => (
                  <div
                    key={meeting.id}
                    // الكود المعدل لمحاضر الاجتماعات
                    onClick={() => {
                      if (setSelectedMeeting) {
                        setSelectedMeeting(
                          selectedMeeting === meeting.id ? "" : meeting.id,
                        );
                      }
                    }}
                    className={`flex justify-between items-center p-2 rounded-lg cursor-pointer border ${selectedMeeting === meeting.id ? "border-amber-500 bg-amber-50/50" : "border-slate-100 hover:border-amber-200"}`}
                  >
                    <span className="font-bold text-[10px] truncate">
                      {meeting.title || "محضر اجتماع"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDeedModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-4 w-full max-w-6xl h-[95vh] rounded-2xl flex flex-col relative">
            <button
              onClick={() => setIsDeedModalOpen(false)}
              className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <NewPropertyWizard onComplete={() => setIsDeedModalOpen(false)} />
          </div>
        </div>
      )}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-4 w-full max-w-5xl h-[95vh] rounded-2xl flex flex-col relative">
            <button
              onClick={() => setIsClientModalOpen(false)}
              className="absolute top-4 left-4 p-2 bg-red-50 text-red-500 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
            <CreateClientPanel onComplete={() => setIsClientModalOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
};
