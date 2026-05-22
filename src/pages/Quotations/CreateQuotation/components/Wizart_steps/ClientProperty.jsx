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
} from "lucide-react";
import { getClientName } from "../../utils/quotationConstants";

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

// مكون حقل الإدخال لتوحيد التصميم
const InputField = ({ label, placeholder, value, onChange, type = "text", required = false }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-[10px] font-bold text-[#475569]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full py-1.5 px-2 border border-[#d8b46a]/30 rounded-lg text-[11px] focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-200 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white"
    />
  </div>
);

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
    
    // يفضل تمرير هذه الحالات من الـ Parent Component عند الربط الفعلي
    manualData = {},
    setManualData = () => {},
  } = props;

  // حالات محلية للتبديل بين البحث والإدخال اليدوي
  const [clientMode, setClientMode] = useState("search"); // 'search' | 'manual'
  const [propertyMode, setPropertyMode] = useState("search"); // 'search' | 'manual'

  // حالة محلية لبيانات الإدخال اليدوي (يجب رفعها للـ Parent لاحقاً)
  const [manualClient, setManualClient] = useState({
    ownerType: "individual", // individual (شخص) | entity (كيان)
    capacity: "self", // self (عن نفسه) | agent (وكيل/مفوض)
    // فرد
    firstName: "", secondName: "", thirdName: "", lastName: "",
    idNumber: "", mobile: "", address: "",
    // كيان
    entityType: "company", entityNameAr: "", entityNameEn: "", unifiedNumber: "",
    // وكيل/مفوض
    agentName: "", agentId: "", agentMobile: "", agentEmail: "", authNumber: "",
  });

  const [manualProperty, setManualProperty] = useState({
    projectName: "", city: "", district: "", deedNumber: "", area: "",
  });

  const handleManualClientChange = (field, value) => {
    setManualClient(prev => {
      const newData = { ...prev, [field]: value };
      // إذا تم اختيار كيان، يجب أن تكون الصفة "مفوض" إجبارياً
      if (field === 'ownerType' && value === 'entity') {
        newData.capacity = 'agent';
      }
      return newData;
    });
  };

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full text-[#123f59]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* ========================================== */}
        {/* 1️⃣ اختيار/إضافة الملكية (المشروع) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col min-h-[230px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-cyan-500"></div>

          <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
            <div className="text-xs font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
              <IconWithText icon={Building} iconClassName="w-3.5 h-3.5 text-cyan-500" /> 
              بيانات المشروع / الملكية <span className="text-red-500">*</span>
            </div>
            
            {/* أزرار التبديل (بحث / يدوي) */}
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setPropertyMode("search")}
                className={`px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${propertyMode === "search" ? "bg-white shadow-sm text-cyan-700" : "text-slate-500"}`}
              >
                <List className="w-3 h-3" /> موجود
              </button>
              <button
                onClick={() => {
                  setPropertyMode("manual");
                  setSelectedProperty(null); // إلغاء تحديد الموجود
                }}
                className={`px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${propertyMode === "manual" ? "bg-white shadow-sm text-cyan-700" : "text-slate-500"}`}
              >
                <PlusCircle className="w-3 h-3" /> جديد
              </button>
            </div>
          </div>

          {propertyMode === "search" ? (
            <>
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
                  <div className="m-auto"><Loader2 className="w-4 h-4 text-cyan-400 animate-spin" /></div>
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
                        className={`flex flex-col p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected ? "border-cyan-400 bg-cyan-50/50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]" : "border-[#e8ddc8] bg-white hover:border-cyan-200"
                        }`}
                      >
                        <div className="flex min-w-0 justify-between items-center mb-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#d8b46a]/25" />}
                            <span className={`font-bold text-[11px] ${isSelected ? "text-cyan-800" : "text-[#475569]"}`}>{prop.code}</span>
                          </div>
                          <span className="font-mono text-[9px] text-[#64748b] px-1.5 py-0.5 rounded border border-[#e8ddc8] bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white">
                            صك: {prop.deedNumber || "—"}
                          </span>
                        </div>
                        {prop.district && (
                          <div className="text-[9.5px] text-[#64748b] flex min-w-0 items-center gap-1 mr-5">
                            <MapPin className="w-2.5 h-2.5" /> {prop.city} - {prop.district}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-[#94a3b8] text-center mt-4">لا توجد ملكيات مطابقة</div>
                )}
              </div>
            </>
          ) : (
            // الإدخال اليدوي للمشروع
            <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-1 flex flex-col gap-2 mt-1">
               <InputField label="اسم المشروع / الوصف" placeholder="مثال: فيلا سكنية" value={manualProperty.projectName} onChange={(e) => setManualProperty({...manualProperty, projectName: e.target.value})} required />
               <div className="grid grid-cols-2 gap-2">
                 <InputField label="المدينة" placeholder="الرياض" value={manualProperty.city} onChange={(e) => setManualProperty({...manualProperty, city: e.target.value})} />
                 <InputField label="الحي" placeholder="الملقا" value={manualProperty.district} onChange={(e) => setManualProperty({...manualProperty, district: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-2">
                 <InputField label="رقم الصك" placeholder="123456..." value={manualProperty.deedNumber} onChange={(e) => setManualProperty({...manualProperty, deedNumber: e.target.value})} />
                 <InputField label="المساحة (م٢)" placeholder="500" type="number" value={manualProperty.area} onChange={(e) => setManualProperty({...manualProperty, area: e.target.value})} />
               </div>
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 2️⃣ اختيار/إضافة العميل (صاحب العلاقة) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col min-h-[230px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-[#0e7490]"></div>

          <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
            <div className="text-xs font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#0e7490]" /> 
              بيانات المالك (صاحب العلاقة) <span className="text-red-500">*</span>
            </div>
            
            {/* أزرار التبديل (بحث / يدوي) */}
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setClientMode("search")}
                className={`px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${clientMode === "search" ? "bg-white shadow-sm text-[#0e7490]" : "text-slate-500"}`}
              >
                <List className="w-3 h-3" /> موجود
              </button>
              <button
                onClick={() => {
                  setClientMode("manual");
                  setSelectedClient(null);
                }}
                className={`px-2 py-1 text-[9px] font-bold rounded-md flex items-center gap-1 transition-all ${clientMode === "manual" ? "bg-white shadow-sm text-[#0e7490]" : "text-slate-500"}`}
              >
                <PlusCircle className="w-3 h-3" /> جديد
              </button>
            </div>
          </div>

          {clientMode === "search" ? (
            <>
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
                  <div className="m-auto"><Loader2 className="w-4 h-4 text-blue-400 animate-spin" /></div>
                ) : clientsData?.length > 0 ? (
                  clientsData.map((client) => {
                    const isSelected = selectedClient === client.id;
                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClient(client.id)}
                        className={`flex flex-col p-2 rounded-xl cursor-pointer border transition-all ${
                          isSelected ? "border-blue-400 bg-[#eef7f6]/50 shadow-[0_8px_22px_rgba(18,63,89,0.06)]" : "border-[#e8ddc8] bg-white hover:border-[#d8b46a]/35"
                        }`}
                      >
                        <div className="flex min-w-0 justify-between items-center mb-1">
                          <div className="flex min-w-0 items-center gap-1.5">
                            {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-[#123f59]" /> : <div className="w-3.5 h-3.5 rounded-full border border-[#d8b46a]/25" />}
                            <span className={`font-bold text-[11px] ${isSelected ? "text-[#123f59]" : "text-[#475569]"}`}>{getClientName(client)}</span>
                          </div>
                          <span className="font-mono text-[9px] text-[#64748b] px-1.5 py-0.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded border border-[#e8ddc8]">
                            {client.clientCode}
                          </span>
                        </div>
                        {(client.idNumber || client.mobile) && (
                          <div className="text-[9.5px] text-[#64748b] flex gap-2 mr-5">
                            {client.idNumber && <span>هوية: {client.idNumber}</span>}
                            {client.mobile && <span className="dir-ltr text-left">{client.mobile}</span>}
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-[10px] text-[#94a3b8] text-center mt-4">لا يوجد عملاء مطابقين</div>
                )}
              </div>
            </>
          ) : (
            // الإدخال اليدوي للعميل / المالك
            <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-1 flex flex-col gap-3 mt-1 pb-2">
              
              {/* خيارات المالك والصفة */}
              <div className="flex flex-wrap gap-2 mb-1 p-2 bg-slate-50 border border-slate-100 rounded-lg">
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <input type="radio" checked={manualClient.ownerType === 'individual'} onChange={() => handleManualClientChange('ownerType', 'individual')} className="text-[#0e7490] focus:ring-[#0e7490]" /> شخص
                  </label>
                  <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <input type="radio" checked={manualClient.ownerType === 'entity'} onChange={() => handleManualClientChange('ownerType', 'entity')} className="text-[#0e7490] focus:ring-[#0e7490]" /> كيان
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <label className={`text-[10px] font-bold flex items-center gap-1 ${manualClient.ownerType === 'entity' ? 'text-slate-400' : 'text-slate-700'}`}>
                    <input type="radio" disabled={manualClient.ownerType === 'entity'} checked={manualClient.capacity === 'self'} onChange={() => handleManualClientChange('capacity', 'self')} className="text-[#0e7490] focus:ring-[#0e7490]" /> عن نفسه
                  </label>
                  <label className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                    <input type="radio" checked={manualClient.capacity === 'agent'} onChange={() => handleManualClientChange('capacity', 'agent')} className="text-[#0e7490] focus:ring-[#0e7490]" /> وكيل/مفوض
                  </label>
                </div>
              </div>

              {/* إذا كان المالك شخص */}
              {manualClient.ownerType === 'individual' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#0e7490] bg-cyan-50 px-2 py-1 rounded w-max">بيانات المالك</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    <InputField placeholder="الأول" value={manualClient.firstName} onChange={(e) => handleManualClientChange('firstName', e.target.value)} />
                    <InputField placeholder="الثاني" value={manualClient.secondName} onChange={(e) => handleManualClientChange('secondName', e.target.value)} />
                    <InputField placeholder="الثالث" value={manualClient.thirdName} onChange={(e) => handleManualClientChange('thirdName', e.target.value)} />
                    <InputField placeholder="العائلة" value={manualClient.lastName} onChange={(e) => handleManualClientChange('lastName', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <InputField label="رقم الهوية" placeholder="10xxxxxxxx" value={manualClient.idNumber} onChange={(e) => handleManualClientChange('idNumber', e.target.value)} />
                    <InputField label="رقم الجوال" placeholder="05xxxxxxxx" value={manualClient.mobile} onChange={(e) => handleManualClientChange('mobile', e.target.value)} />
                  </div>
                  <InputField label="العنوان" placeholder="المدينة، الحي، الشارع" value={manualClient.address} onChange={(e) => handleManualClientChange('address', e.target.value)} />
                </div>
              )}

              {/* إذا كان المالك كيان */}
              {manualClient.ownerType === 'entity' && (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-[#0e7490] bg-cyan-50 px-2 py-1 rounded w-max">بيانات المنشأة</span>
                  <div className="flex flex-col gap-1">
                     <label className="text-[10px] font-bold text-[#475569]">نوع الكيان</label>
                     <select 
                       value={manualClient.entityType} 
                       onChange={(e) => handleManualClientChange('entityType', e.target.value)}
                       className="w-full py-1.5 px-2 border border-[#d8b46a]/30 rounded-lg text-[11px] focus:outline-none focus:border-cyan-500 bg-white"
                     >
                       <option value="company">شركة / مؤسسة</option>
                       <option value="government">جهة حكومية</option>
                       <option value="nonprofit">جهة غير ربحية</option>
                     </select>
                  </div>
                  <InputField label="اسم الكيان (عربي)" placeholder="مثال: شركة تفاصيل..." value={manualClient.entityNameAr} onChange={(e) => handleManualClientChange('entityNameAr', e.target.value)} />
                  {/* الترجمة الانجليزية بالذكاء الاصطناعي يمكن تفعيلها برمجياً في الخلفية، هنا نترك الحقل */}
                  <InputField label="اسم الكيان (إنجليزي) - تلقائي بالذكاء الاصطناعي" placeholder="Details Company..." value={manualClient.entityNameEn} onChange={(e) => handleManualClientChange('entityNameEn', e.target.value)} />
                  <InputField label="الرقم الموحد للمنشأة" placeholder="700xxxxxxx" value={manualClient.unifiedNumber} onChange={(e) => handleManualClientChange('unifiedNumber', e.target.value)} />
                </div>
              )}

              {/* قسم الوكيل أو المفوض يظهر في حالة الكيان، أو في حالة الفرد إذا اختار وكيل */}
              {manualClient.capacity === 'agent' && (
                <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-max">
                    بيانات {manualClient.ownerType === 'entity' ? 'المفوض' : 'الوكيل'}
                  </span>
                  <InputField label="الاسم الرباعي" placeholder="اسم الوكيل/المفوض..." value={manualClient.agentName} onChange={(e) => handleManualClientChange('agentName', e.target.value)} required />
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="رقم الهوية" placeholder="10xxxxxxxx" value={manualClient.agentId} onChange={(e) => handleManualClientChange('agentId', e.target.value)} required />
                    <InputField label="رقم الجوال" placeholder="05xxxxxxxx" value={manualClient.agentMobile} onChange={(e) => handleManualClientChange('agentMobile', e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <InputField label="البريد الإلكتروني" placeholder="example@mail.com" type="email" value={manualClient.agentEmail} onChange={(e) => handleManualClientChange('agentEmail', e.target.value)} />
                    <InputField label="رقم الوكالة / التفويض" placeholder="اكتب 'بدون' إذا لم يوجد" value={manualClient.authNumber} onChange={(e) => handleManualClientChange('authNumber', e.target.value)} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* 3️⃣ اختيار المعاملة (بنفسجي - اختياري) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col h-[180px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-purple-500"></div>

          <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
            <div className="text-[11px] font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-purple-500" /> ربط بمعاملة
              قائمة
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
        {/* 4️⃣ اختيار محضر الاجتماع (أصفر - اختياري) */}
        {/* ========================================== */}
        <div className="bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] relative overflow-hidden flex flex-col h-[180px]">
          <div className="absolute top-0 bottom-0 right-0 w-1 bg-amber-500"></div>

          <div className="flex min-w-0 justify-between items-center mb-2.5 pl-1">
            <div className="text-[11px] font-bold text-[#475569] flex min-w-0 items-center gap-1.5">
              <ClipboardList className="w-3.5 h-3.5 text-amber-500" /> الاستناد
              لمحضر اجتماع
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

      {/* 💡 نصيحة السفلية (أكثر كثافة) */}
      <div className="mt-3 p-2.5 bg-gradient-to-r from-slate-50 to-indigo-50/50 border border-indigo-100/50 rounded-xl flex min-w-0 items-center gap-2.5 text-[10.5px] text-indigo-800">
        <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
        <div>
          <strong className="font-bold mr-1">تلميح ذكي:</strong>
          يمكنك الآن <span className="text-cyan-600 font-bold">إضافة عميل أو مشروع جديد</span> يدوياً في حال لم يكن مسجلاً في النظام، النظام سيتعرف على نوع الكيان ويطلب بيانات الوكيل أو المفوض تلقائياً.
        </div>
      </div>
    </div>
  );
};