import React from "react";
import {
  Building,
  Search,
  Users,
  Loader2,
  Sparkles,
  FileSearch,
  CircleCheckBig,
  Plus,
  Trash2,
  TriangleAlert,
  ScrollText,
  QrCode,
  Save,
  Send,
  MapPin,
  Eye,
  Paperclip,
  FolderOpen,
  ClipboardList,
  CalendarDays
} from "lucide-react";
import {
  getClientName,
  PRESET_TERMS,
  CLIENT_TITLES,
  HANDLING_METHODS,
} from "../utils/quotationConstants";

// ==========================================
// الخطوة 0: تحديد الملكية والعميل
// ==========================================
export const Step0ClientProperty = ({ props }) => {
  const {
    // Client & Property (الأساسيات)
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

    // Transactions (المعاملات)
    selectedTransaction,
    setSelectedTransaction,
    transactionSearch,
    setTransactionSearch,
    transactionsData,
    transactionsLoading,

    // Meetings (محاضر الاجتماعات)
    selectedMeeting,
    setSelectedMeeting,
    meetingSearch,
    setMeetingSearch,
    meetingsData,
    meetingsLoading,
  } = props;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="text-[15px] font-bold text-slate-800 mb-5 flex items-center gap-2">
        <Building className="w-5 h-5 text-blue-600" />
        الخطوة 0 — تحديد الملكية، العميل والارتباطات
      </div>

      {/* ========================================== */}
      {/* تخطيط عمودي: جميع العناصر تحت بعضها */}
      {/* ========================================== */}
      <div className="flex flex-col gap-2">
        
        {/* 1️⃣ اختيار الملكية */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500"></div>
          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-500" /> تحديد ملف الملكية
          </div>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
              placeholder="بحث برقم الصك، الحي، أو الكود..."
              className="w-full py-2.5 pr-9 pl-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
            {propertiesLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : propertiesData?.length > 0 ? (
              propertiesData.map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => {
                    setSelectedProperty(prop.id);
                    const relatedClientId = prop.clientId || prop.client?.id;
                    if (relatedClientId) {
                      setSelectedClient(relatedClientId);
                    }
                  }}
                  className={`flex flex-col gap-1 p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedProperty === prop.id
                      ? "border-cyan-500 bg-cyan-50 text-cyan-800 shadow-sm"
                      : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-sm text-cyan-700">
                      {prop.code}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-100">
                      صك: {prop.deedNumber || "—"}
                    </div>
                  </div>
                  {prop.district && (
                    <div className="text-[11px] text-slate-600 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {prop.city}{" "}
                      - {prop.district}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center p-4">
                لا توجد ملكيات مطابقة
              </div>
            )}
          </div>
        </div>

        {/* فاصل بصري اختياري */}
        <div className="h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent"></div>

        {/* 2️⃣ اختيار العميل */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-blue-500"></div>
          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" /> تحديد ملف العميل
          </div>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="بحث بالاسم، الهوية، الجوال..."
              className="w-full py-2.5 pr-9 pl-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
            {clientsLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : clientsData?.length > 0 ? (
              clientsData.map((client) => (
                <div
                  key={client.id}
                  onClick={() => setSelectedClient(client.id)}
                  className={`flex flex-col p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedClient === client.id
                      ? "border-blue-500 bg-blue-50 text-blue-800 shadow-sm"
                      : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="font-bold text-sm text-blue-800">
                      {getClientName(client)}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200">
                      {client.clientCode}
                    </div>
                  </div>
                  {(client.idNumber || client.mobile) && (
                    <div className="text-[10px] text-slate-500 flex gap-3 mt-1">
                      {client.idNumber && <span>هوية: {client.idNumber}</span>}
                      {client.mobile && (
                        <span className="dir-ltr text-left">
                          {client.mobile}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 text-center p-4">
                لا يوجد عملاء مطابقين
              </div>
            )}
          </div>
        </div>

        {/* فاصل بصري اختياري */}
        <div className="h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent"></div>

        {/* 3️⃣ اختيار المعاملة (اختياري) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-purple-500"></div>
          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-purple-500" /> ربط بمعاملة قائمة
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">اختياري</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={transactionSearch || ""}
              onChange={(e) => setTransactionSearch && setTransactionSearch(e.target.value)}
              placeholder="بحث برقم المعاملة، الوصف..."
              className="w-full py-2 pr-9 pl-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-200"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {transactionsLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : transactionsData?.length > 0 ? (
              transactionsData.map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => setSelectedTransaction && setSelectedTransaction(txn.ref)}
                  className={`flex flex-col gap-1 p-2.5 rounded-xl cursor-pointer border transition-all ${
                    selectedTransaction === txn.ref
                      ? "border-purple-500 bg-purple-50 text-purple-800 shadow-sm"
                      : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-xs text-purple-700 truncate max-w-[180px]">
                      {txn.client || txn.description || "معاملة بدون وصف"}
                    </div>
                    <div className="font-mono text-[9px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                      {txn.referenceNumber || txn.ref}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-slate-400 text-center p-4">
                لا توجد معاملات مطابقة
              </div>
            )}
          </div>
        </div>

        {/* فاصل بصري اختياري */}
        <div className="h-px bg-gradient-to-l from-transparent via-slate-200 to-transparent"></div>

        {/* 4️⃣ اختيار محضر الاجتماع (اختياري) */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-amber-500"></div>
          <div className="text-sm font-bold text-slate-700 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" /> الاستناد لمحضر اجتماع العميل
            </div>
            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded">اختياري</span>
          </div>
          <div className="relative mb-3">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={meetingSearch || ""}
              onChange={(e) => setMeetingSearch && setMeetingSearch(e.target.value)}
              placeholder="بحث بعنوان المحضر، التاريخ..."
              className="w-full py-2 pr-9 pl-3 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
            />
          </div>
          <div className="flex flex-col gap-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
            {meetingsLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : meetingsData?.length > 0 ? (
              meetingsData.map((meeting) => (
                <div
                  key={meeting.id}
                  onClick={() => setSelectedMeeting && setSelectedMeeting(meeting.id)}
                  className={`flex flex-col gap-1 p-2.5 rounded-xl cursor-pointer border transition-all ${
                    selectedMeeting === meeting.id
                      ? "border-amber-500 bg-amber-50 text-amber-800 shadow-sm"
                      : "border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="font-bold text-xs text-amber-700 truncate ">
                      {meeting.title || "محضر اجتماع"}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] text-slate-500 font-mono">
                      <CalendarDays className="w-3 h-3" />
                      {meeting.meetingDate ? new Date(meeting.meetingDate).toLocaleDateString("ar-SA") : "---"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-[10px] text-slate-400 text-center p-4">
                {selectedClient ? "لا توجد محاضر اجتماعات لهذا العميل" : "يرجى تحديد العميل لعرض المحاضر المرتبطة"}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 💡 نصيحة السفلية */}
      <div className="mt-6 p-4 bg-gradient-to-l from-blue-50 to-cyan-50 border border-blue-100 rounded-xl flex items-start gap-3 text-xs text-blue-800">
        <Sparkles className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
        <div>
          <strong>نصيحة احترافية:</strong> اختيار ملف الملكية أولاً سيقوم بتحديد العميل المالك لها تلقائياً. 
          ربط عرض السعر بمحضر اجتماع يُسهل الرجوع للاتفاقيات المبدئية ويُحسّن تتبع حالة الملف.
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 1: البيانات الأساسية
// ==========================================
export const Step1BasicInfo = ({ props }) => {
  const {
    issueDate,
    setIssueDate,
    validityDays,
    setValidityDays,
    isRenewable,
    setIsRenewable,
    transactionType,
    setTransactionType,
    serviceNumber,
    setServiceNumber,
    serviceYear,
    setServiceYear,
    licenseNumber,
    setLicenseNumber,
    licenseYear,
    setLicenseYear,
    serviceYearsList,
    licenseYearsList,
  } = props;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="text-[15px] font-bold text-slate-800 mb-3">
        الخطوة 1 — البيانات الأساسية
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200 mb-3 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              تاريخ العرض
            </label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              صلاحية العرض (أيام)
            </label>
            <input
              type="text"
              value={validityDays === "unlimited" ? "غير محدد" : validityDays}
              onChange={(e) => setValidityDays(e.target.value)}
              readOnly={validityDays === "unlimited"}
              className={`w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 ${validityDays === "unlimited" ? "bg-slate-100 font-bold" : ""}`}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 justify-center md:justify-start">
          {[3, 7, 14, 30, 60, "unlimited"].map((val) => (
            <button
              key={val}
              onClick={() => setValidityDays(val)}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold cursor-pointer border transition-colors ${
                validityDays === val
                  ? "bg-slate-800 text-white border-slate-800 shadow-md"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              }`}
            >
              {val === "unlimited" ? "غير محدد" : `${val} أيام`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
          <label className="text-[11px] font-bold text-slate-700">
            قابل للتجديد التلقائي؟
          </label>
          <button
            onClick={() => setIsRenewable(!isRenewable)}
            className={`px-4 py-1 rounded-full text-[10px] font-bold cursor-pointer border transition-colors ${
              isRenewable
                ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                : "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isRenewable ? "نعم" : "لا"}
          </button>
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200 border-r-[3px] border-r-cyan-600 mb-3 shadow-sm relative">
        <div className="text-xs font-bold text-cyan-700 mb-3 flex items-center gap-1.5">
          <FileSearch className="w-3.5 h-3.5" /> بيانات الخدمة والرخصة
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              نوع المعاملة
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— اختر المعاملة —</option>
              <option value="إفراغ عقاري">إفراغ عقاري</option>
              <option value="رهن عقاري">رهن عقاري</option>
              <option value="تصحيح وضع مبنى قائم">تصحيح وضع مبنى قائم</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              رقم الخدمة
            </label>
            <input
              type="text"
              value={serviceNumber}
              onChange={(e) => setServiceNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              سنة طلب الخدمة
            </label>
            <select
              value={serviceYear}
              onChange={(e) => setServiceYear(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500 bg-white"
            >
              <option value="">— اختر السنة —</option>
              {serviceYearsList?.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              رقم الرخصة
            </label>
            <input
              type="text"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              سنة الرخصة
            </label>
            <select
              value={licenseYear}
              onChange={(e) => setLicenseYear(e.target.value)}
              className={`w-full p-2 border rounded-lg text-xs font-mono outline-none bg-white transition-colors ${
                transactionType === "تصحيح وضع مبنى قائم"
                  ? "border-amber-400 focus:border-amber-500 bg-amber-50/30"
                  : "border-slate-300 focus:border-blue-500"
              }`}
            >
              <option value="">— اختر السنة —</option>
              {licenseYearsList?.map((year) => (
                <option key={year.value} value={year.value}>
                  {year.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 2: اختيار النموذج
// ==========================================
export const Step2Template = ({ props }) => {
  const {
    templateType,
    setTemplateType,
    selectedTemplate,
    setSelectedTemplate,
    showClientCode,
    setShowClientCode,
    showPropertyCode,
    setShowPropertyCode,
    templatesLoading,
    serverTemplates,
    setTermsText,
  } = props;

  const summaryTemplates =
    serverTemplates?.filter((t) => t.type === "SUMMARY") || [];
  const detailedTemplates =
    serverTemplates?.filter((t) => t.type === "DETAILED") || [];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="text-[15px] font-bold text-slate-800 mb-3">
        الخطوة 2 — اختيار النموذج
      </div>

      {templatesLoading ? (
        <div className="p-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div
              onClick={() => {
                setTemplateType("SUMMARY");
                setSelectedTemplate("");
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                templateType === "SUMMARY"
                  ? "bg-blue-50/30 border-blue-500 shadow-sm"
                  : "bg-white border-slate-200 hover:border-blue-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {templateType === "SUMMARY" ? (
                  <CircleCheckBig className="w-4 h-4 text-blue-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
                <span
                  className={`text-[13px] font-bold ${templateType === "SUMMARY" ? "text-blue-600" : "text-slate-700"}`}
                >
                  مختصر (صفحة واحدة)
                </span>
              </div>
            </div>
            <div
              onClick={() => {
                setTemplateType("DETAILED");
                setSelectedTemplate("");
              }}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                templateType === "DETAILED"
                  ? "bg-violet-50/30 border-violet-500 shadow-sm"
                  : "bg-white border-slate-200 hover:border-violet-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                {templateType === "DETAILED" ? (
                  <CircleCheckBig className="w-4 h-4 text-violet-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
                )}
                <span
                  className={`text-[13px] font-bold ${templateType === "DETAILED" ? "text-violet-600" : "text-slate-700"}`}
                >
                  تفصيلي (عدة صفحات)
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 mb-3 shadow-sm">
            <div className="text-xs font-bold text-slate-700 mb-2">
              النماذج المتاحة
            </div>
            <div className="flex flex-col gap-1.5 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
              {(templateType === "SUMMARY"
                ? summaryTemplates
                : detailedTemplates
              ).map((tpl) => {
                const isSelected = selectedTemplate === tpl.id;
                const activeColor =
                  templateType === "SUMMARY" ? "blue" : "violet";
                return (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTemplate(tpl.id);
                      setTermsText(tpl.defaultTerms || "");
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer border transition-colors ${
                      isSelected
                        ? `border-${activeColor}-200 bg-${activeColor}-50/50`
                        : "border-slate-100 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${isSelected ? `bg-${activeColor}-100 text-${activeColor}-700` : "bg-slate-100 text-slate-500"}`}
                    >
                      {tpl.id}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-bold truncate ${isSelected ? `text-${activeColor}-800` : "text-slate-800"}`}
                      >
                        {tpl.title}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">
                        {tpl.desc}
                      </div>
                    </div>
                    {tpl.isDefault && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[9px] font-bold whitespace-nowrap">
                        افتراضي
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-700 mb-2">
              خيارات العرض
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 font-medium hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={showClientCode}
                  onChange={(e) => setShowClientCode(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />{" "}
                إظهار كود العميل
              </label>
              <label className="flex items-center gap-1.5 text-[11px] cursor-pointer text-slate-700 font-medium hover:text-blue-600">
                <input
                  type="checkbox"
                  checked={showPropertyCode}
                  onChange={(e) => setShowPropertyCode(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />{" "}
                إظهار كود الملكية
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ==========================================
// الخطوة 3: البنود
// ==========================================
export const Step3Items = ({ props }) => {
  const {
    items,
    setItems,
    handleItemChange,
    removeItem,
    addItemFromLibrary,
    serverItems,
    libItemsLoading,
    subtotal,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[15px] font-bold text-slate-800">
          الخطوة 3 — البنود والتسعير
        </div>
        <div className="flex gap-1.5">
          {libItemsLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
          ) : (
            <select
              onChange={addItemFromLibrary}
              className="px-2 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-bold outline-none cursor-pointer max-w-[150px]"
            >
              <option value="">+ إضافة من المكتبة</option>
              {serverItems?.map((i) => (
                <option key={i.code} value={i.code}>
                  {i.title} ({i.price} ر.س)
                </option>
              ))}
            </select>
          )}
          <button
            onClick={() =>
              setItems([
                ...items,
                {
                  id: Date.now(),
                  title: "",
                  category: "عام",
                  qty: 1,
                  unit: "وحدة",
                  price: 0,
                  discount: 0,
                },
              ])
            }
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 hover:bg-emerald-700"
          >
            <Plus className="w-3 h-3" /> بند حر
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm flex-1">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-2 text-[10px] text-slate-500 font-bold w-6">
                  #
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold">
                  البند
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-14">
                  الكمية
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-14">
                  الوحدة
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-20">
                  السعر
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-16">
                  خصم
                </th>
                <th className="p-2 text-[10px] text-slate-500 font-bold w-16">
                  الإجمالي
                </th>
                <th className="p-2 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 hover:bg-slate-50/50"
                >
                  <td className="p-2 text-[11px] text-slate-400 font-mono">
                    {index + 1}
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        handleItemChange(item.id, "title", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-bold text-slate-700 outline-none focus:border-blue-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(item.id, "qty", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] outline-none text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) =>
                        handleItemChange(item.id, "unit", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 bg-slate-50 rounded text-[10px] outline-none text-center text-slate-500"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        handleItemChange(item.id, "price", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-mono outline-none text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={item.discount}
                      onChange={(e) =>
                        handleItemChange(item.id, "discount", e.target.value)
                      }
                      className="w-full p-1.5 border border-slate-200 rounded text-[11px] font-mono outline-none text-center text-red-500"
                    />
                  </td>
                  <td className="p-2 text-[11px] font-bold text-blue-700 font-mono text-left">
                    {(item.qty * item.price - item.discount).toLocaleString()}
                  </td>
                  <td className="p-2 text-left">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="p-4 text-center text-[10px] text-slate-400"
                  >
                    لا يوجد بنود، قم بإضافة بند حر أو من المكتبة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-slate-200 text-[13px] font-black text-blue-700">
          المجموع الفرعي: {subtotal.toLocaleString()} ر.س
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 4: الضريبة
// ==========================================
export const Step4Tax = ({ props }) => {
  const {
    taxRate,
    setTaxRate,
    officeTaxBearing,
    setOfficeTaxBearing,
    subtotal,
    taxAmount,
    grandTotal,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="text-[15px] font-bold text-slate-800 mb-4">
        الخطوة 4 — الضريبة (VAT)
      </div>
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              نسبة الضريبة %
            </label>
            <input
              type="number"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
              المكتب يتحمل (% من الضريبة)
            </label>
            <div className="flex gap-1.5">
              {[0, 50, 100].map((val) => (
                <button
                  key={val}
                  onClick={() => setOfficeTaxBearing(val)}
                  className={`flex-1 p-1.5 rounded-lg text-[11px] font-bold border transition-colors ${
                    officeTaxBearing === val
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl">
          <div className="flex justify-between text-xs mb-1.5 text-slate-600">
            <span>إجمالي قبل الضريبة:</span>
            <strong className="font-mono">
              {subtotal.toLocaleString()} ر.س
            </strong>
          </div>
          <div className="flex justify-between text-xs mb-1.5 text-slate-600">
            <span>ضريبة ({taxRate}%):</span>
            <strong className="font-mono">
              {taxAmount.toLocaleString()} ر.س
            </strong>
          </div>
          <div className="flex justify-between pt-2 mt-2 border-t border-slate-200 text-sm font-black text-blue-700">
            <span>الإجمالي شامل:</span>
            <span className="font-mono">{grandTotal.toLocaleString()} ر.س</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 5: الدفعات
// ==========================================
export const Step5Payments = ({ props }) => {
  const {
    paymentCount,
    setPaymentCount,
    paymentsList,
    acceptedMethods,
    toggleMethod,
    grandTotal,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="text-[15px] font-bold text-slate-800 mb-4">
        الخطوة 5 — الدفعات وطرق الدفع
      </div>
      <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-3 mb-4">
          <label className="text-[11px] font-bold text-slate-700 mb-0">
            عدد الدفعات:
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setPaymentCount(num)}
                className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${
                  paymentCount === num
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                الدفعة
              </th>
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                النسبة %
              </th>
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                المبلغ
              </th>
              <th className="p-1.5 text-[10px] text-slate-500 font-bold">
                الاستحقاق
              </th>
            </tr>
          </thead>
          <tbody>
            {paymentsList.map((p) => (
              <tr key={p.id} className="border-b border-slate-50">
                <td className="p-1.5 text-[11px] font-bold text-slate-700">
                  {p.label}
                </td>
                <td className="p-1.5 text-[11px] text-slate-600">
                  {p.percentage}%
                </td>
                <td className="p-1.5 text-[11px] font-bold text-blue-700 font-mono">
                  {p.amount.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ر.س
                </td>
                <td className="p-1.5 text-[10px] text-slate-500">
                  <input
                    type="text"
                    defaultValue={p.condition}
                    className="w-full p-1 bg-transparent border-b border-dashed border-slate-300 outline-none focus:border-blue-500"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm mt-4">
        <label className="block text-[12px] font-bold text-slate-700 mb-2">
          طرق الدفع المقبولة
        </label>
        <div className="flex gap-2 flex-wrap">
          {[
            { id: "bank", label: "تحويل بنكي" },
            { id: "cash", label: "نقدي بالمقر" },
            { id: "sadad", label: "سداد" },
          ].map((method) => (
            <label
              key={method.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] cursor-pointer border transition-colors ${
                acceptedMethods.includes(method.id)
                  ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={acceptedMethods.includes(method.id)}
                onChange={() => toggleMethod(method.id)}
                className="w-3 h-3 text-blue-600 rounded"
              />
              {method.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 6: المرفقات
// ==========================================
export const Step6Attachments = ({ props }) => {
  const { missingDocs, setMissingDocs, showMissingDocs, setShowMissingDocs } =
    props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="text-[15px] font-bold text-slate-800 mb-4 flex items-center gap-2">
        <Paperclip className="w-5 h-5 text-amber-600" /> الخطوة 6 — المرفقات
        والنواقص
      </div>
      <div className="p-4 bg-white rounded-xl border-y border-l border-r-[3px] border-slate-200 border-r-red-600 mb-4 shadow-sm relative overflow-hidden">
        <div className="text-xs font-bold text-red-800 mb-2 flex items-center gap-1.5">
          <TriangleAlert className="w-4 h-4" /> نواقص مستندات (Free text)
        </div>
        <textarea
          value={missingDocs}
          onChange={(e) => setMissingDocs(e.target.value)}
          placeholder="اكتب هنا أي ملاحظات حول نواقص المستندات..."
          rows={4}
          className="w-full p-2.5 border border-slate-300 rounded-lg text-xs outline-none focus:border-red-400 focus:ring-1 focus:ring-red-100 resize-y leading-relaxed"
        />
        <label className="flex items-center gap-1.5 text-[11px] cursor-pointer mt-3 font-medium text-slate-700 hover:text-red-600 transition-colors w-fit">
          <input
            type="checkbox"
            checked={showMissingDocs}
            onChange={(e) => setShowMissingDocs(e.target.checked)}
            className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
          />
          <Eye className="w-3.5 h-3.5 text-red-500" /> إظهار نواقص المستندات في
          عرض السعر المطبوع
        </label>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 7: الشروط والأحكام
// ==========================================
export const Step7Terms = ({ props }) => {
  const {
    termsText,
    setTermsText,
    clientTitle,
    setClientTitle,
    handlingMethod,
    setHandlingMethod,
    selectedPresetTerm,
    setSelectedPresetTerm,
  } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col">
      <div className="text-[15px] font-bold text-slate-800 mb-4">
        الخطوة 7 — الشروط والأحكام
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm">
        <label className="block text-[11px] font-bold text-slate-700 mb-2">
          اختر حزمة شروط جاهزة (اختياري)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_TERMS.map((term) => (
            <button
              key={term.id}
              onClick={() => setSelectedPresetTerm(term.id)}
              className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer flex items-center gap-1.5 transition-colors ${
                selectedPresetTerm === term.id
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {term.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200 mb-4 shadow-sm flex-1 flex flex-col">
        <label className="block text-[11px] font-bold text-slate-700 mb-2">
          الشروط والأحكام (تظهر للعميل)
        </label>
        <textarea
          value={termsText}
          onChange={(e) => setTermsText(e.target.value)}
          className="w-full flex-1 min-h-[150px] p-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 resize-y leading-[1.7] text-slate-700 custom-scrollbar"
        />
      </div>

      <div className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 shadow-sm mt-auto">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText className="w-4 h-4 text-purple-600" />
          <label className="block text-[12px] font-bold text-purple-700 mb-0">
            الافتتاحية الذكية والتفويض
          </label>
        </div>
        <div className="mb-4">
          <div className="text-[11px] font-bold text-slate-700 mb-2">
            لقب العميل المستهدف:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CLIENT_TITLES.map((title) => (
              <button
                key={title}
                onClick={() => setClientTitle(title)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer border transition-colors ${
                  clientTitle === title
                    ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-700 mb-2">
            أسلوب التعامل والتفويض:
          </div>
          <div className="flex gap-2">
            {HANDLING_METHODS.map((method) => (
              <button
                key={method}
                onClick={() => setHandlingMethod(method)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg cursor-pointer border transition-colors ${
                  handlingMethod === method
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-600 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// الخطوة 8: المعاينة والإرسال
// ==========================================
export const Step8Review = ({ props }) => {
  const { handleSave, saveMutation } = props;

  return (
    <div className="animate-in fade-in duration-300 h-full flex flex-col justify-center items-center text-center p-8">
      <div className="text-[20px] font-black text-slate-800 mb-2">
        الخطوة الأخيرة — المعاينة والتصدير
      </div>
      <div className="text-[13px] text-slate-500 mb-8 max-w-sm">
        قم بمراجعة العرض بشكله النهائي في الجهة اليسرى. إذا كان كل شيء صحيحاً،
        يمكنك حفظه أو إرساله للعميل مباشرة.
      </div>
      <div className="p-8 bg-white rounded-2xl border border-slate-200 shadow-sm w-full max-w-md">
        <QrCode className="w-16 h-16 text-blue-600 mx-auto mb-4 opacity-20" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => handleSave(true)}
            disabled={saveMutation?.isPending}
            className="py-3 px-4 bg-slate-100 text-slate-700 hover:bg-slate-200 border-none rounded-xl text-xs font-bold cursor-pointer flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> حفظ كمسودة
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saveMutation?.isPending}
            className="py-3 px-4 bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 border-none rounded-xl text-xs font-bold cursor-pointer flex justify-center items-center gap-2 transition-colors disabled:opacity-50"
          >
            {saveMutation?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}{" "}
            إرسال لاعتماد
          </button>
        </div>
      </div>
    </div>
  );
};
