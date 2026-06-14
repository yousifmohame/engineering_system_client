import React, { useState, useRef, useEffect } from "react";
import { 
  X, Save, User, DollarSign, FileText, Paperclip, 
  Check, ChevronRight, ChevronLeft, Loader2, ZoomIn, ZoomOut, Printer,
  Briefcase, Scale, ShieldCheck
} from "lucide-react";
import { createJobOffer } from "../../../../../api/jobOfferApi"; // تأكد من مسار الـ API الخاص بك

// ==========================================
// 1. ثوابت التصميم (تطابق عروض الأسعار)
// ==========================================
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const STEPS = [
  { id: 0, label: "بيانات المرشح", icon: User },
  { id: 1, label: "التفاصيل المالية", icon: DollarSign },
  { id: 2, label: "صياغة العرض", icon: FileText },
  { id: 3, label: "الغلاف والمرفقات", icon: Paperclip },
];

const selectedStyle = {
  accent: "#123f59",
  gold: "#c5983c",
  paper: "#ffffff",
};

// ==========================================
// 2. مكون المعاينة الحية (Live Preview) للعرض الوظيفي
// ==========================================
const JobOfferLivePreview = ({ data, zoomScale }) => {
  const componentRef = useRef(null);
  const totalSalary = Number(data.basicSalary || 0) + Number(data.housingAllowance || 0) + Number(data.transportAllowance || 0);

  const issueDate = new Date().toLocaleDateString("ar-SA", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });

  return (
    <div className="flex-1 overflow-auto p-6 bg-[#e8edf0] custom-scrollbar-slim flex flex-col items-center relative h-full">
      <div
        style={{
          transform: `scale(${zoomScale})`,
          transformOrigin: "top center",
          transition: "transform 0.2s",
        }}
      >
        <div ref={componentRef} className="flex flex-col gap-8 items-center pb-12" style={{ width: `${A4_WIDTH_PX}px` }}>
          
          {/* 📄 الغلاف الأمامي */}
          <div
            className="relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] flex flex-col justify-center items-center text-center p-[80px]"
            style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px` }}
          >
            <div className="absolute inset-0 opacity-5 bg-[url('/safe_background/1.webp')] bg-cover"></div>
            
            <img src="/logo.jpeg" alt="Logo" className="w-[250px] object-contain mb-16 mix-blend-multiply z-10" />
            
            <div className="w-4/5 border-t-[5px] border-b-[5px] py-12 mb-12 z-10" style={{ borderColor: selectedStyle.accent }}>
              <h1 className="text-[46px] font-black mb-4" style={{ color: selectedStyle.accent }}>عرض وظيفي</h1>
              <h2 className="text-[24px] font-bold text-[#475569] tracking-wide">Job Offer</h2>
            </div>

            <div className="w-full text-right p-8 rounded-3xl border border-[#d8b46a]/30 bg-white/80 backdrop-blur-sm z-10">
              <p className="text-[18px] font-black text-slate-500 mb-2">مقدم إلى المرشح:</p>
              <p className="text-[36px] font-black mb-6" style={{ color: selectedStyle.accent }}>
                {data.candidateName || "اسم المرشح ...."}
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-[16px] font-bold text-slate-700">
                <div className="flex justify-between border-b border-dashed border-slate-300 pb-2">
                  <span className="text-slate-500">المسمى الوظيفي:</span>
                  <span className="text-[#123f59]">{data.jobTitle || "---"}</span>
                </div>
                <div className="flex justify-between border-b border-dashed border-slate-300 pb-2">
                  <span className="text-slate-500">التاريخ:</span>
                  <span className="font-mono">{issueDate}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 📄 تفاصيل العرض الوظيفي */}
          <div
            className="relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
            style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px` }}
          >
            <table className="w-full border-collapse">
              <thead className="table-header-group">
                <tr>
                  <td style={{ padding: "60px 70px 20px 70px" }}>
                    <div className="flex justify-between items-start border-b-[3px] pb-4" style={{ borderColor: selectedStyle.accent }}>
                      <img src="/logo.jpeg" alt="Logo" className="h-16 object-contain mix-blend-multiply" />
                      <div className="text-right text-[11px] font-bold text-slate-500 space-y-1">
                        <p>نوع المستند: <span className="text-[#123f59] font-black text-[13px]">عرض وظيفي رسمي</span></p>
                        <p>التاريخ: <span className="font-mono text-[#123f59] font-black">{issueDate}</span></p>
                      </div>
                    </div>
                  </td>
                </tr>
              </thead>
              <tbody className="table-row-group">
                <tr>
                  <td style={{ padding: "10px 70px 20px 70px" }}>
                    {/* المقدمة */}
                    <div className="text-right font-bold text-[#475569] text-[13px] leading-loose whitespace-pre-wrap mb-8">
                      {data.introduction}
                    </div>

                    {/* جدول البيانات المالية */}
                    <h4 className="mb-3 text-[14px] font-black flex items-center gap-2" style={{ color: selectedStyle.accent }}>
                      <Briefcase className="w-5 h-5 text-[#c5983c]" /> أولاً: التفاصيل المالية والمزايا
                    </h4>
                    <table className="w-full border-collapse text-center text-[13px] mb-8" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                      <thead>
                        <tr className="text-white" style={{ backgroundColor: selectedStyle.accent }}>
                          <th className="p-3 border" style={{ borderColor: selectedStyle.accent }}>البيان</th>
                          <th className="p-3 border" style={{ borderColor: selectedStyle.accent }}>القيمة (ر.س)</th>
                          <th className="p-3 border" style={{ borderColor: selectedStyle.accent }}>دورة الصرف</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-[#123f59]">
                        <tr className="bg-slate-50">
                          <td className="p-3 border text-right pr-4" style={{ borderColor: `${selectedStyle.accent}44` }}>الراتب الأساسي</td>
                          <td className="p-3 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{data.basicSalary || 0}</td>
                          <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>شهرياً</td>
                        </tr>
                        <tr>
                          <td className="p-3 border text-right pr-4" style={{ borderColor: `${selectedStyle.accent}44` }}>بدل السكن</td>
                          <td className="p-3 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{data.housingAllowance || 0}</td>
                          <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>شهرياً</td>
                        </tr>
                        <tr className="bg-slate-50">
                          <td className="p-3 border text-right pr-4" style={{ borderColor: `${selectedStyle.accent}44` }}>بدل النقل</td>
                          <td className="p-3 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{data.transportAllowance || 0}</td>
                          <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>شهرياً</td>
                        </tr>
                        <tr className="bg-emerald-50 text-emerald-800 text-[14px]">
                          <td className="p-3 border text-right pr-4 font-black" style={{ borderColor: `${selectedStyle.accent}44` }}>إجمالي الراتب الشهري</td>
                          <td colSpan="2" className="p-3 border font-mono font-black" style={{ borderColor: `${selectedStyle.accent}44` }}>{totalSalary} ر.س</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* الشروط */}
                    <h4 className="mb-3 text-[14px] font-black flex items-center gap-2" style={{ color: selectedStyle.accent }}>
                      <ShieldCheck className="w-5 h-5 text-[#c5983c]" /> ثانياً: الشروط والأحكام العامة
                    </h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right font-bold text-[#475569] text-[12.5px] leading-loose whitespace-pre-wrap mb-10">
                      {data.conditions}
                    </div>

                    {/* التوقيعات */}
                    <table className="w-full border-collapse text-center text-[12px]" style={{ border: `2px solid ${selectedStyle.accent}` }}>
                      <thead>
                        <tr className="text-white" style={{ backgroundColor: selectedStyle.accent }}>
                          <th className="p-3 border-l w-1/2" style={{ borderColor: selectedStyle.accent }}>الطرف الأول (الشركة)</th>
                          <th className="p-3 w-1/2">الطرف الثاني (المرشح)</th>
                        </tr>
                      </thead>
                      <tbody className="font-bold text-[#123f59]">
                        <tr>
                          <td className="p-4 border-l align-top text-right" style={{ borderColor: `${selectedStyle.accent}44` }}>
                            <p className="mb-2 text-slate-500">اسم الشركة: <span className="text-[#123f59] font-black">شركة ديتيلز كونسولتس</span></p>
                            <p className="mb-6 text-slate-500">الختم والتوقيع:</p>
                            <div className="h-16 flex items-center justify-center text-slate-300">مساحة الختم</div>
                          </td>
                          <td className="p-4 align-top text-right">
                            <p className="mb-2 text-slate-500">الاسم: <span className="text-[#123f59] font-black">{data.candidateName || "........................"}</span></p>
                            <p className="mb-6 text-slate-500">توقيع القبول:</p>
                            <div className="h-16 flex items-center justify-center text-slate-300">........................</div>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                  </td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};

// ==========================================
// 3. المكون الرئيسي (المعالج - Wizard)
// ==========================================
export default function CreateJobOfferModal({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.65);

  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    jobTitle: "",
    basicSalary: "",
    housingAllowance: "",
    transportAllowance: "",
    introduction: "يسرنا في شركة ديتيلز للاستشارات الهندسية تقديم هذا العرض الوظيفي لكم للانضمام إلى فريق عملنا، وذلك وفقاً للتفاصيل والمزايا الموضحة أدناه:",
    conditions: "1. يخضع هذا العرض لأنظمة العمل والعمال في المملكة العربية السعودية.\n2. مدة التجربة 90 يوماً قابلة للتمديد.\n3. الإجازة السنوية 21 يوماً مدفوعة الأجر.\n4. التأمين الطبي يوفر للموظف بحسب سياسة الشركة.",
  });

  const [files, setFiles] = useState({ frontCover: null, backCover: null, cvFile: null });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles[0]) setFiles(prev => ({ ...prev, [name]: selectedFiles[0] }));
  };

  const handleSubmit = async () => {
    if (!formData.candidateName || !formData.jobTitle || !formData.basicSalary) {
      return alert("يرجى تعبئة البيانات الأساسية (الاسم، المسمى، الراتب)");
    }
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key !== 'housingAllowance' && key !== 'transportAllowance') {
          submitData.append(key, formData[key]);
        }
      });
      submitData.append("allowances", JSON.stringify({
        housing: formData.housingAllowance,
        transport: formData.transportAllowance
      }));
      submitData.append("status", "DRAFT");

      if (files.frontCover) submitData.append("frontCover", files.frontCover);
      if (files.backCover) submitData.append("backCover", files.backCover);
      if (files.cvFile) submitData.append("cvFile", files.cvFile);

      await createJobOffer(submitData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving offer:", error);
      alert("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
      <div className="bg-white w-full h-[95vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* --- Header الموحد --- */}
        <div className="shrink-0 border-b border-[#e8ddc8] bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74] shadow-md">
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-black flex items-center gap-2">بناء عرض وظيفي جديد</h2>
              <p className="text-[11px] font-bold text-white/60">بناء العرض المالي، الشروط، والمرفقات بشكل احترافي.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* --- Body Area --- */}
        <div className="flex flex-1 overflow-hidden bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-3 gap-3">
          
          {/* قسم الإدخال (اليسار) */}
          <section className="flex flex-col w-[450px] shrink-0 bg-white rounded-[20px] border border-[#d8b46a]/25 shadow-sm overflow-hidden">
            
            {/* أزرار التبديل العلوية (Tabs) */}
            <div className="flex overflow-x-auto custom-scrollbar-slim border-b border-gray-100 bg-gray-50/50 p-2 gap-1">
              {STEPS.map(step => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-1 flex flex-col items-center p-2 rounded-xl text-[11px] font-black transition-all ${
                    currentStep === step.id ? "bg-[#123f59] text-white shadow-md" : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <step.icon className={`w-4 h-4 mb-1 ${currentStep === step.id ? "text-[#e2bf74]" : ""}`} />
                  {step.label}
                </button>
              ))}
            </div>

            {/* منطقة الإدخال النشطة */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar-slim">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-[#123f59] mb-1.5">اسم المرشح كاملاً *</label>
                    <input type="text" name="candidateName" value={formData.candidateName} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" placeholder="أحمد محمد..." />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#123f59] mb-1.5">رقم الجوال</label>
                    <input type="text" name="candidatePhone" value={formData.candidatePhone} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none text-left" dir="ltr" placeholder="0500000000" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-[#123f59] mb-1.5">البريد الإلكتروني</label>
                    <input type="email" name="candidateEmail" value={formData.candidateEmail} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none text-left" dir="ltr" placeholder="email@example.com" />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-black text-[#123f59] mb-1.5">المسمى الوظيفي المقترح *</label>
                    <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" placeholder="مثال: مهندس معماري" />
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                    <div>
                      <label className="block text-xs font-black text-[#123f59] mb-1.5">الراتب الأساسي (ر.س) *</label>
                      <input type="number" name="basicSalary" value={formData.basicSalary} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" placeholder="5000" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#123f59] mb-1.5">بدل السكن (ر.س)</label>
                      <input type="number" name="housingAllowance" value={formData.housingAllowance} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" placeholder="1000" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-[#123f59] mb-1.5">بدل النقل (ر.س)</label>
                      <input type="number" name="transportAllowance" value={formData.transportAllowance} onChange={handleInputChange} className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none" placeholder="500" />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-black text-[#123f59] mb-1.5">المقدمة الافتتاحية</label>
                    <textarea name="introduction" value={formData.introduction} onChange={handleInputChange} className="w-full flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none leading-relaxed resize-none min-h-[120px]" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <label className="block text-xs font-black text-[#123f59] mb-1.5">الشروط والأحكام</label>
                    <textarea name="conditions" value={formData.conditions} onChange={handleInputChange} className="w-full flex-1 border border-gray-300 rounded-xl p-3 text-sm focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c] outline-none leading-relaxed resize-none min-h-[150px]" />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-5">
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                    <label className="block text-sm font-black text-emerald-800 mb-2">السيرة الذاتية (CV)</label>
                    <p className="text-[10px] text-emerald-600 mb-3 font-bold">ستُحفظ بملف الموظف عند قبوله العرض.</p>
                    <input type="file" name="cvFile" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="w-full text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer" />
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl">
                    <label className="block text-sm font-black text-[#123f59] mb-2">الغلاف الأمامي المخصص (اختياري)</label>
                    <input type="file" name="frontCover" accept="image/*" onChange={handleFileChange} className="w-full text-xs" />
                  </div>
                  <div className="border border-slate-200 p-4 rounded-xl">
                    <label className="block text-sm font-black text-[#123f59] mb-2">الغلاف الخلفي المخصص (اختياري)</label>
                    <input type="file" name="backCover" accept="image/*" onChange={handleFileChange} className="w-full text-xs" />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Navigation */}
            <div className="shrink-0 border-t border-[#e8ddc8] bg-gray-50 p-4 flex justify-between items-center gap-3">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep(p => p - 1)}
                className="flex items-center gap-1 h-10 px-4 rounded-xl border-2 border-slate-200 text-xs font-black text-slate-500 hover:bg-white disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" /> السابق
              </button>
              
              {currentStep === STEPS.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 h-10 px-6 bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] rounded-xl text-white text-xs font-black shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 text-[#e2bf74]" />}
                  اعتماد وحفظ العرض
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(p => p + 1)}
                  className="flex items-center gap-1 h-10 px-4 bg-[#123f59] rounded-xl text-white text-xs font-black hover:bg-[#0e7490]"
                >
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>

          {/* قسم المعاينة الحية (اليمين) */}
          <section className="flex-1 bg-white rounded-[20px] border border-[#d8b46a]/25 shadow-sm overflow-hidden flex flex-col">
            <div className="h-12 border-b border-gray-100 bg-gray-50 flex items-center justify-between px-4">
              <span className="text-xs font-black text-[#123f59]">المعاينة الحية للوثيقة (Live Preview)</span>
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                <button onClick={() => setZoomScale(p => Math.max(0.4, p - 0.1))} className="p-1 text-gray-500 hover:text-[#123f59]"><ZoomOut className="w-4 h-4" /></button>
                <span className="text-[10px] font-mono font-bold px-2">{Math.round(zoomScale * 100)}%</span>
                <button onClick={() => setZoomScale(p => Math.min(1.2, p + 0.1))} className="p-1 text-gray-500 hover:text-[#123f59]"><ZoomIn className="w-4 h-4" /></button>
              </div>
            </div>
            
            {/* ربط الفورم بالمعاينة */}
            <JobOfferLivePreview data={formData} zoomScale={zoomScale} />
            
          </section>

        </div>
      </div>
    </div>
  );
}