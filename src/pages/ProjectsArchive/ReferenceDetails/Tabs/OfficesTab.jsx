import React, { useState, useRef, useEffect } from "react";
import { Briefcase, Search, ChevronDown, AlertTriangle, FileText, Merge, XCircle } from "lucide-react";
import LinkStatusBadge from "../LinkStatusBadge"; 

export default function OfficesTab({
  data,
  handleChange,
  offices,
  linkingStates,
  handleAutoLink,
  inputClass,
  labelClass,
  onMergeProjects // 👈 دالة الدمج سنمررها من الملف الأب
}) {
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [designerSearch, setDesignerSearch] = useState("");
  const designerRef = useRef(null);

  const [isSupervisorOpen, setIsSupervisorOpen] = useState(false);
  const [supervisorSearch, setSupervisorSearch] = useState("");
  const supervisorRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (designerRef.current && !designerRef.current.contains(event.target)) setIsDesignerOpen(false);
      if (supervisorRef.current && !supervisorRef.current.contains(event.target)) setIsSupervisorOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredDesigners = offices.filter((o) =>
    o.nameAr?.toLowerCase().includes(designerSearch.toLowerCase()) || 
    o.commercialRegister?.includes(designerSearch)
  );

  const filteredSupervisors = offices.filter((o) =>
    o.nameAr?.toLowerCase().includes(supervisorSearch.toLowerCase()) || 
    o.commercialRegister?.includes(supervisorSearch)
  );

  const handleSmartOfficeLink = (type, extractedName) => {
    if (!extractedName) return;
    let normalizedExtracted = extractedName
      .replace(/أ|إ|آ/g, "ا").replace(/ة/g, "ه")
      .replace(/شركة /g, "").replace(/مؤسسة /g, "").replace(/مكتب /g, "")
      .replace(/ للاستشارات الهندسية/g, "").replace(/ للاستشارات/g, "")
      .trim();

    const existingOffice = offices.find((o) => {
      const normalizedExisting = (o.nameAr || "")
        .replace(/أ|إ|آ/g, "ا").replace(/ة/g, "ه")
        .replace(/شركة /g, "").replace(/مؤسسة /g, "").replace(/مكتب /g, "")
        .replace(/ للاستشارات الهندسية/g, "").trim();

      if (normalizedExisting === normalizedExtracted) return true;
      if (normalizedExtracted.length >= 4 && normalizedExisting.includes(normalizedExtracted)) return true;
      if (normalizedExisting.length >= 4 && normalizedExtracted.includes(normalizedExisting)) return true;
      return false;
    });

    if (existingOffice) {
      alert(`تم العثور على مكتب هندسي مشابه "${existingOffice.nameAr}" وتم اختياره تلقائياً لمنع التكرار.`);
      const fieldName = type === "designer" ? "designerOfficeId" : "supervisorOfficeId";
      handleChange({ target: { name: fieldName, value: existingOffice.id } });
    } else {
      handleAutoLink(type, extractedName);
    }
  };

  const getSelectedOfficeName = (officeId) => {
    if (!officeId) return "-- اختر أو ابحث عن مكتب --";
    const office = offices.find((o) => o.id === officeId);
    return office ? office.nameAr : "مكتب غير معروف";
  };

  // ========================================================
  // 💡 منطق التعامل مع التكرار (Ignore or Merge)
  // ========================================================
  const hasWarning = data.archiveNotes && data.archiveNotes.includes("⚠️");

  // استخراج كود المشروع القديم من نص الملاحظات (مثال: ARC-2024-001)
  const extractTargetArchiveCode = () => {
    if (!data.archiveNotes) return null;
    const match = data.archiveNotes.match(/\((ARC-\d{4}-\d+)\)/);
    return match ? match[1] : null;
  };
  const targetArchiveCode = extractTargetArchiveCode();

  // دالة تجاهل التكرار
  const handleIgnoreWarning = () => {
    // إزالة السطور التي تبدأ برمز التحذير
    const cleanNotes = data.archiveNotes.replace(/⚠️.*?\n\n/g, "").trim();
    handleChange({ target: { name: "archiveNotes", value: cleanNotes } });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h4 className="text-sm font-black text-purple-800 border-b border-purple-100 pb-3 mb-5 flex items-center gap-2">
        <Briefcase className="w-4 h-4" /> المكاتب الهندسية والملاحظات
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* حقل المكتب المصمم */}
        <div className="w-full relative" ref={designerRef}>
          <div className="flex justify-between items-center mb-1.5">
            <label className={labelClass}>المكتب الهندسي المصمم</label>
            <LinkStatusBadge isLinked={!!data.designerOfficeId} extractedText={data.designerOfficeName} isLinking={linkingStates.designer} onLinkClick={() => handleSmartOfficeLink("designer", data.designerOfficeName)} />
          </div>
          <div onClick={() => setIsDesignerOpen(!isDesignerOpen)} className={`${inputClass} mt-1.5 flex items-center justify-between cursor-pointer w-full select-none`}>
            <span className={data.designerOfficeId ? "text-slate-700" : "text-slate-400"}>{getSelectedOfficeName(data.designerOfficeId)}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDesignerOpen ? "rotate-180" : ""}`} />
          </div>
          {isDesignerOpen && (
             // ... نفس كود القائمة المنسدلة للبحث ...
             <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input type="text" value={designerSearch} onChange={(e) => setDesignerSearch(e.target.value)} className="w-full bg-transparent text-xs font-bold outline-none" placeholder="ابحث..." autoFocus />
                </div>
                <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredDesigners.map((office) => (
                    <li key={office.id} onClick={() => { handleChange({ target: { name: "designerOfficeId", value: office.id } }); setIsDesignerOpen(false); setDesignerSearch(""); }} className="px-4 py-2.5 text-xs font-bold cursor-pointer hover:bg-slate-50">{office.nameAr}</li>
                  ))}
                </ul>
             </div>
          )}
        </div>

        {/* حقل المكتب المشرف */}
        <div className="w-full relative" ref={supervisorRef}>
          {/* ... نفس الكود المعتاد للمكتب المشرف ... */}
          <div className="flex justify-between items-center mb-1.5">
            <label className={labelClass}>المكتب الهندسي المشرف</label>
            <LinkStatusBadge isLinked={!!data.supervisorOfficeId} extractedText={data.supervisorOfficeName} isLinking={linkingStates.supervisor} onLinkClick={() => handleSmartOfficeLink("supervisor", data.supervisorOfficeName)} />
          </div>
          <div onClick={() => setIsSupervisorOpen(!isSupervisorOpen)} className={`${inputClass} mt-1.5 flex items-center justify-between cursor-pointer w-full select-none`}>
            <span className={data.supervisorOfficeId ? "text-slate-700" : "text-slate-400"}>{getSelectedOfficeName(data.supervisorOfficeId)}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isSupervisorOpen ? "rotate-180" : ""}`} />
          </div>
        </div>

        {/* حقل الملاحظات */}
        <div className="md:col-span-2 mt-2">
          <label className={`${labelClass} flex items-center gap-2 mb-2`}>
            <FileText className="w-4 h-4 text-slate-400" /> 
            ملاحظات التحليل والذكاء الاصطناعي
          </label>
          
          <div className={`relative rounded-xl border transition-all duration-300 ${
            hasWarning 
              ? "border-amber-300 bg-amber-50/30 focus-within:ring-4 focus-within:ring-amber-500/10 focus-within:border-amber-500" 
              : "border-slate-200 bg-slate-50/50 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500"
          }`}>
            <textarea
              name="archiveNotes"
              value={data.archiveNotes || ""}
              onChange={handleChange}
              rows="6"
              className={`w-full p-4 text-sm font-bold bg-transparent outline-none resize-y min-h-[120px] custom-scrollbar ${hasWarning ? "text-amber-900" : "text-slate-700"}`}
              dir="rtl"
            />
          </div>
          
          {/* 💡 أزرار التعامل مع التكرار تظهر فقط إذا كان هناك تحذير */}
          {hasWarning && (
            <div className="mt-4 p-4 bg-amber-100/50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-200 rounded-full text-amber-700">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-black text-amber-800">إجراء مطلوب: مشروع مكرر</h5>
                  <p className="text-xs font-bold text-amber-700/80 mt-0.5">
                    الرخصة أو المخطط مسجل مسبقاً {targetArchiveCode ? `برمز (${targetArchiveCode})` : ""}. ماذا تريد أن تفعل؟
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleIgnoreWarning}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 rounded-lg text-xs font-black transition-colors"
                >
                  <XCircle className="w-4 h-4" /> تجاهل التنبيه
                </button>
                
                {targetArchiveCode && (
                  <button
                    onClick={() => onMergeProjects(targetArchiveCode)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-500 text-white hover:bg-amber-600 rounded-lg text-xs font-black transition-colors shadow-sm"
                  >
                    <Merge className="w-4 h-4" /> دمج الملفات مع الأقدم
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}