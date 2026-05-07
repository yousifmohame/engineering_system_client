import React, { useState, useRef, useEffect } from "react";
import { Building2, Search, ChevronDown, Brain, Loader2 } from "lucide-react"; // 👈 استيراد الأيقونات الجديدة
import LinkStatusBadge from "../LinkStatusBadge"; 

export default function BasicInfoTab({ 
  data, 
  handleChange, 
  clients, 
  linkingStates, 
  handleAutoLink, 
  inputClass, 
  labelClass,
  onReanalyze,     // 👈 دالة إعادة التحليل ممررة من الأب
  isReanalyzing    // 👈 حالة التحميل
}) {
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearchTerm, setClientSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredClients = clients.filter((client) => {
    const clientName = typeof client.name === "object" ? client.name?.ar : client.name;
    const searchTerm = clientSearchTerm.toLowerCase();
    const matchesName = clientName?.toLowerCase().includes(searchTerm);
    const matchesId = client.idNumber?.includes(searchTerm);
    return matchesName || matchesId;
  });

  const getSelectedClientName = () => {
    if (!data.clientId) return "-- اختر أو ابحث عن مالك --";
    const selectedClient = clients.find((c) => c.id === data.clientId);
    if (!selectedClient) return "عميل غير معروف";
    const clientName = typeof selectedClient.name === "object" ? selectedClient.name?.ar : selectedClient.name;
    return `${clientName} ${selectedClient.idNumber ? `(${selectedClient.idNumber})` : ""}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      
      {/* ======================================================== */}
      {/* 💡 التعديل هنا: إضافة زر إعادة التحليل في الرأس */}
      {/* ======================================================== */}
      <div className="flex justify-between items-center border-b border-indigo-100 pb-3 mb-5">
        <h4 className="text-sm font-black text-indigo-800 flex items-center gap-2">
          <Building2 className="w-4 h-4" /> بيانات المشروع والمالك
        </h4>
        
        <button
          onClick={onReanalyze}
          disabled={isReanalyzing || !data.id}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white border border-purple-100 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
          title="إعادة تحليل كافة المرفقات بالذكاء الاصطناعي"
        >
          {isReanalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
          إعادة التحليل الذكي
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label className={labelClass}>اسم المشروع <span className="text-rose-500">*</span></label>
          <input name="title" value={data.title || ""} onChange={handleChange} className={`${inputClass} mt-1.5`} type="text" />
        </div>
        <div>
          <label className={labelClass}>الرقم الموحد</label>
          <input readOnly value={data.archiveCode || ""} className={`${inputClass} bg-slate-100 text-slate-500 mt-1.5 cursor-not-allowed`} type="text" />
        </div>
        <div>
          <label className={labelClass}>نوع المشروع</label>
          <input name="projectType" value={data.projectType || ""} onChange={handleChange} className={`${inputClass} mt-1.5`} type="text" />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>نوع المعاملة</label>
          <input name="transactionType" value={data.transactionType || ""} onChange={handleChange} className={`${inputClass} mt-1.5`} type="text" />
        </div>
        
        {/* حقل اختيار المالك */}
        <div className="md:col-span-2 mt-4 border-t border-slate-100 pt-5">
          <div className="flex justify-between items-center mb-1.5">
            <label className={labelClass}>اسم المالك (ربط بسجل العملاء)</label>
            <LinkStatusBadge isLinked={!!data.clientId} extractedText={data.ownerName} isLinking={linkingStates.client} onLinkClick={() => handleAutoLink("client", data.ownerName)} />
          </div>
          
          <div className="w-full relative" ref={dropdownRef}>
            <div
              onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
              className={`${inputClass} mt-1.5 flex items-center justify-between cursor-pointer w-full select-none`}
            >
              <span className={data.clientId ? "text-slate-700" : "text-slate-400"}>
                {getSelectedClientName()}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isClientDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {isClientDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={clientSearchTerm}
                    onChange={(e) => setClientSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold outline-none text-slate-700"
                    placeholder="ابحث عن اسم المالك أو رقم الهوية..."
                    autoFocus
                  />
                </div>
                
                <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => {
                      const clientName = typeof client.name === "object" ? client.name?.ar : client.name;
                      return (
                        <li
                          key={client.id}
                          onClick={() => {
                            handleChange({ target: { name: "clientId", value: client.id } });
                            setIsClientDropdownOpen(false);
                            setClientSearchTerm(""); 
                          }}
                          className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                            data.clientId === client.id
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {clientName} {client.idNumber && <span className="text-slate-400 mx-1">({client.idNumber})</span>}
                        </li>
                      );
                    })
                  ) : (
                    <li className="px-4 py-4 text-xs text-slate-400 text-center font-bold">
                      لا يوجد عميل يطابق بحثك
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass}>نوع المالك</label>
          <select name="ownerType" value={data.ownerType || ""} onChange={handleChange} className={`${inputClass} mt-1.5`}>
            <option value="">اختر...</option>
            <option value="اعتباري (شركة)">اعتباري (شركة)</option>
            <option value="طبيعي (أفراد)">طبيعي (أفراد)</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>رقم الجوال</label>
          <input name="contactMobile" value={data.contactMobile || ""} onChange={handleChange} className={`${inputClass} mt-1.5 font-mono`} dir="ltr" />
        </div>
      </div>
    </div>
  );
}