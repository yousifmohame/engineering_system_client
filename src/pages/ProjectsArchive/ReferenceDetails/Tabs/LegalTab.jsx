import React, { useState, useRef, useEffect } from "react";
import { FileBadge2, Search, ChevronDown } from "lucide-react";
import LinkStatusBadge from "../LinkStatusBadge";

export default function LegalTab({
  data,
  handleChange,
  sectors,
  districts,
  selectedSectorId,
  setSelectedSectorId,
  linkingStates,
  handleAutoLink,
  inputClass,
  labelClass,
}) {
  // ========================================================
  // 1. حالات (States) قائمة البحث الخاصة بالأحياء
  // ========================================================
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [districtSearchTerm, setDistrictSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // إغلاق القائمة المنسدلة عند الضغط في أي مكان خارجها
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDistrictDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // تصفية الأحياء بناءً على القطاع المحدد ونص البحث
  const filteredDistricts = districts
    .filter((dist) => !selectedSectorId || dist.sectorId === selectedSectorId)
    .filter((dist) => dist.name.includes(districtSearchTerm));

  // ========================================================
  // 2. دالة استخراج السنة الهجرية من التاريخ
  // ========================================================
  const handleIssueDateChange = (e) => {
    handleChange(e);
    const dateValue = e.target.value;

    if (dateValue && dateValue.length >= 4) {
      const year = dateValue.substring(0, 4);
      if (year.startsWith("14")) {
        handleChange({
          target: { name: "licenseHijriYear", value: year },
        });
      }
    } else if (!dateValue) {
      handleChange({
        target: { name: "licenseHijriYear", value: "" },
      });
    }
  };

  // ========================================================
  // 3. المطابقة الذكية لمنع التكرار (Smart Matching)
  // ========================================================
  // دالة لتجريد النص العربي من الفروق الشائعة (الـ التعريف، الهمزات، التاء المربوطة)
  const normalizeArabicText = (text) => {
    if (!text) return "";
    return text
      .replace(/أ|إ|آ/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ال/g, "")
      .replace(/\s+/g, "")
      .trim();
  };

  const handleSmartDistrictLink = () => {
    const extractedName = data.districtName;
    if (!extractedName) return;

    const normalizedExtracted = normalizeArabicText(extractedName);

    // البحث عن حي مطابق في القائمة الحالية
    const existingDistrict = districts.find(
      (d) => normalizeArabicText(d.name) === normalizedExtracted
    );

    if (existingDistrict) {
      // إذا وجدنا حياً مطابقاً، نختاره تلقائياً بدلاً من إنشاء واحد جديد
      alert(`تم العثور على حي مشابه "${existingDistrict.name}" وتم اختياره تلقائياً لمنع التكرار.`);
      handleChange({ target: { name: "districtId", value: existingDistrict.id } });
    } else {
      // إذا لم نجد مطابقاً، نرسل الأمر للإنشاء الفعلي
      handleAutoLink("district", extractedName);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <h4 className="text-sm font-black text-emerald-800 border-b border-emerald-100 pb-3 mb-5 flex items-center gap-2">
        <FileBadge2 className="w-4 h-4" /> الرخص والموقع الجغرافي
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* حقل مدمج: رقم الرخصة + السنة المستخرجة تلقائياً */}
        <div className="w-full">
          <label className={labelClass}>رقم رخصة البناء والسنة الهجرية</label>
          <div className="flex items-stretch mt-1.5 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-500 transition-all shadow-sm">
            <input
              name="licenseNumber"
              value={data.licenseNumber || ""}
              onChange={handleChange}
              className="flex-[3] px-4 py-2.5 text-xs font-bold text-slate-700 bg-transparent outline-none font-mono min-w-0 placeholder-slate-400"
              placeholder="رقم الرخصة (مثال: 45000123)"
            />
            
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="w-full">
            <label className={labelClass}>تاريخ الإصدار (هجري)</label>
            <input
              name="licenseIssueDate"
              type="text"
              value={data.licenseIssueDate?.split("T")[0] || ""}
              onChange={handleIssueDateChange}
              className={`${inputClass} mt-1.5 w-full font-mono`}
              placeholder="مثال: 1445-07-22"
              dir="ltr"
            />
          </div>
          <div className="w-full">
            <label className={labelClass}>تاريخ الانتهاء</label>
            <input
              name="licenseExpiryDate"
              type="date"
              value={data.licenseExpiryDate?.split("T")[0] || ""}
              onChange={handleChange}
              className={`${inputClass} mt-1.5 w-full`}
            />
          </div>
        </div>

        <div className="w-full">
          <label className={labelClass}>رقم صك الملكية</label>
          <input
            name="deedNumber"
            value={data.deedNumber || ""}
            onChange={handleChange}
            className={`${inputClass} mt-1.5 font-mono w-full`}
            placeholder="مثال: 71000..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="w-full">
            <label className={labelClass}>تاريخ الصك</label>
            <input
              name="deedDate"
              type="date"
              value={data.deedDate?.split("T")[0] || ""}
              onChange={handleChange}
              className={`${inputClass} mt-1.5 w-full`}
            />
          </div>
          <div className="w-full">
            <label className={labelClass}>المدينة</label>
            <input
              name="city"
              value={data.city || ""}
              onChange={handleChange}
              className={`${inputClass} mt-1.5 w-full`}
              placeholder="مثال: الرياض"
            />
          </div>
        </div>

        <div className="md:col-span-2 mt-4 border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          
          <div className="w-full">
            <label className={labelClass}>القطاع</label>
            <select
              value={selectedSectorId}
              onChange={(e) => setSelectedSectorId(e.target.value)}
              className={`${inputClass} mt-1.5 w-full`}
            >
              <option value="">-- حدد القطاع --</option>
              {sectors.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </select>
          </div>

          {/* ======================================================== */}
          {/* حقل اختيار الحي الجديد (مخصص وقابل للبحث) */}
          {/* ======================================================== */}
          <div className="w-full relative" ref={dropdownRef}>
            <div className="flex justify-between items-center mb-1.5">
              <label className={labelClass}>الحي (مزوّد بخاصية البحث)</label>
              <LinkStatusBadge
                isLinked={!!data.districtId}
                extractedText={data.districtName}
                isLinking={linkingStates.district}
                // استخدمنا دالة المطابقة الذكية هنا بدلاً من الدالة المباشرة
                onLinkClick={handleSmartDistrictLink}
              />
            </div>
            
            {/* الزر الرئيسي الذي يفتح القائمة المنسدلة */}
            <div
              onClick={() => setIsDistrictDropdownOpen(!isDistrictDropdownOpen)}
              className={`${inputClass} mt-1.5 flex items-center justify-between cursor-pointer w-full select-none`}
            >
              <span className={data.districtId ? "text-slate-700" : "text-slate-400"}>
                {data.districtId
                  ? districts.find((d) => d.id === data.districtId)?.name || "حي غير معروف"
                  : "-- اختر أو ابحث عن حي --"}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDistrictDropdownOpen ? "rotate-180" : ""}`} />
            </div>

            {/* القائمة المنسدلة (تظهر فقط عند الضغط) */}
            {isDistrictDropdownOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* حقل البحث */}
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={districtSearchTerm}
                    onChange={(e) => setDistrictSearchTerm(e.target.value)}
                    className="w-full bg-transparent text-xs font-bold outline-none text-slate-700"
                    placeholder="ابحث عن اسم الحي..."
                    autoFocus
                  />
                </div>
                
                {/* الخيارات */}
                <ul className="max-h-48 overflow-y-auto custom-scrollbar">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map((dist) => (
                      <li
                        key={dist.id}
                        onClick={() => {
                          handleChange({ target: { name: "districtId", value: dist.id } });
                          setIsDistrictDropdownOpen(false);
                          setDistrictSearchTerm("");
                        }}
                        className={`px-4 py-2.5 text-xs font-bold cursor-pointer transition-colors ${
                          data.districtId === dist.id
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {dist.name}
                      </li>
                    ))
                  ) : (
                    <li className="px-4 py-4 text-xs text-slate-400 text-center font-bold">
                      لا يوجد حي يطابق بحثك
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <div className="w-full">
            <label className={labelClass}>رقم المخطط التنظيمي</label>
            <input
              name="planNumber"
              value={data.planNumber || ""}
              onChange={handleChange}
              className={`${inputClass} mt-1.5 font-mono w-full`}
              placeholder="أدخل رقم المخطط"
            />
          </div>
          <div className="w-full">
            <label className={labelClass}>أرقام القطع</label>
            <input
              value={data.plots?.join(", ") || ""}
              onChange={(e) =>
                handleChange({
                  target: { name: "plots", value: e.target.value.split(", ") },
                })
              }
              className={`${inputClass} mt-1.5 font-mono w-full`}
              placeholder="مثال: 10, 11"
            />
          </div>
          <div className="md:col-span-2 w-full">
            <label className={labelClass}>الشارع الرئيسي وعرضه</label>
            <input
              name="mainStreet"
              value={data.mainStreet || ""}
              onChange={handleChange}
              className={`${inputClass} mt-1.5 w-full`}
              placeholder="مثال: شارع العليا، عرض 30م"
            />
          </div>
        </div>
      </div>
    </div>
  );
}