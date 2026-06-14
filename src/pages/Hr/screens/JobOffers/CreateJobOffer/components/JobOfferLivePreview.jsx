// src/pages/Hr/screens/JobOffers/CreateJobOffer/components/JobOfferLivePreview.jsx
import React, { useRef, useState } from "react";
import { 
  Briefcase, 
  ShieldCheck, 
  Printer, 
  ZoomIn, 
  ZoomOut, 
  Loader2 
} from "lucide-react";
import { generateJobOfferPdf } from "../../../../../../api/jobOfferApi"; // تأكد من مسار الـ API

// ==========================================
// 1. ثوابت التصميم
// ==========================================
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

const selectedStyle = {
  accent: "#123f59",
  gold: "#c5983c",
  paper: "#ffffff",
};

const SECURITY_BACKGROUNDS = {
  none: { label: "بدون (سادة)", value: "none" },
  official1: {
    label: "خلفية رسمية 1 (الذهبية)",
    value: "url('/safe_background/1.webp')",
  },
  official2: {
    label: "خلفية رسمية 2",
    value: "url('/safe_background/2.webp')",
  },
  official3: {
    label: "خلفية رسمية 3",
    value: "url('/safe_background/3.webp')",
  },
};

// ==========================================
// 2. مكون المعاينة الحية (Live Preview)
// ==========================================
export default function JobOfferLivePreview({ data }) {
  const componentRef = useRef(null);
  
  // حالات التحكم بالشريط العلوي
  const [zoomScale, setZoomScale] = useState(0.65);
  const [bgType, setBgType] = useState("official1");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // حسابات العرض
  const totalSalary = Number(data.basicSalary || 0) + Number(data.housingAllowance || 0) + Number(data.transportAllowance || 0);
  const issueDate = new Date().toLocaleDateString("ar-SA", {
    year: "numeric", month: "2-digit", day: "2-digit"
  });

  // إعدادات الخلفية
  const bgStyleConfig = {
    backgroundColor: selectedStyle.paper,
    backgroundImage: SECURITY_BACKGROUNDS[bgType].value !== "none" ? SECURITY_BACKGROUNDS[bgType].value : "none",
    backgroundSize: `${A4_WIDTH_PX}px 1123px`,
    backgroundRepeat: "repeat-y",
    backgroundPosition: "top center",
  };

  // دوال التحكم
  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.1, 0.38));

  const handlePrint = async () => {
    setIsGeneratingPdf(true);
    try {
      // إرسال البيانات للواجهة الخلفية لتوليد الـ PDF
      const blob = await generateJobOfferPdf(data);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `عرض_وظيفي_${data.candidateName || 'جديد'}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("حدث خطأ أثناء استخراج الوثيقة.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <section className="flex flex-col h-full w-full overflow-hidden rounded-[20px] bg-[#e8edf0]" dir="rtl">
      
      {/* 🛠️ شريط الأدوات العلوي (الخلفية، الطباعة، التكبير) */}
      <div className="shrink-0 border-b border-[#e8ddc8] bg-white px-3 py-2 z-10 shadow-sm">
        <div className="mx-auto rounded-[14px] border border-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white p-2 shadow-[0_4px_12px_rgba(18,63,89,0.04)]">
          <div className="flex min-w-0 items-center justify-between gap-2">
            
            {/* اختيار الخلفية */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-white border border-[#d8b46a]/25 rounded-xl shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-[#c5983c]" />
              <select
                value={bgType}
                onChange={(e) => setBgType(e.target.value)}
                className="bg-transparent text-[10px] font-black text-[#123f59] outline-none cursor-pointer"
              >
                {Object.entries(SECURITY_BACKGROUNDS).map(([key, bg]) => (
                  <option key={key} value={key}>
                    {bg.label}
                  </option>
                ))}
              </select>
            </div>

            {/* أزرار الطباعة والزوم */}
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1">
              <button
                onClick={handlePrint}
                disabled={isGeneratingPdf}
                className="inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#123f59] px-3 text-[10px] font-black text-white transition hover:bg-[#0f3448] disabled:opacity-70 disabled:cursor-not-allowed"
                type="button"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري المعالجة...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-3.5 h-3.5 text-[#e2bf74]" />
                    <span>تصدير (PDF)</span>
                  </>
                )}
              </button>

              <div className="w-px h-5 bg-[#d8b46a]/30 mx-1"></div>

              <button
                onClick={handleZoomOut}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="inline-flex h-8 min-w-[46px] shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 text-[9px] font-black text-[#123f59]">
                {Math.round(zoomScale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="inline-flex h-8 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/25 bg-white px-2 text-[9px] font-black text-[#64748b] hover:bg-[#fbf8f1]"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 منطقة عرض الورقة (A4) */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar-slim flex flex-col items-center relative">
        <div
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: "top center",
            transition: "transform 0.2s",
          }}
        >
          <div ref={componentRef} className="flex flex-col gap-8 items-center pb-12" style={{ width: `${A4_WIDTH_PX}px` }}>
            
            {/* --- الصفحة الأولى: الغلاف الأمامي --- */}
            <div
              className="relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)] flex flex-col justify-center items-center text-center p-[80px]"
              style={{ width: `${A4_WIDTH_PX}px`, height: `${A4_HEIGHT_PX}px`, ...bgStyleConfig }}
            >
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

            {/* --- الصفحة الثانية: تفاصيل العرض الوظيفي --- */}
            <div
              className="relative overflow-hidden bg-white shadow-[0_15px_40px_rgba(0,0,0,0.12)]"
              style={{ width: `${A4_WIDTH_PX}px`, minHeight: `${A4_HEIGHT_PX}px`, ...bgStyleConfig }}
            >
              <table className="w-full border-collapse relative z-10">
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
                      <table className="w-full border-collapse text-center text-[13px] mb-8 bg-white/50 backdrop-blur-sm" style={{ border: `1px solid ${selectedStyle.accent}` }}>
                        <thead>
                          <tr className="text-white" style={{ backgroundColor: selectedStyle.accent }}>
                            <th className="p-3 border" style={{ borderColor: selectedStyle.accent }}>البيان</th>
                            <th className="p-3 border" style={{ borderColor: selectedStyle.accent }}>القيمة (ر.س)</th>
                            <th className="p-3 border" style={{ borderColor: selectedStyle.accent }}>دورة الصرف</th>
                          </tr>
                        </thead>
                        <tbody className="font-bold text-[#123f59]">
                          <tr className="bg-slate-50/50">
                            <td className="p-3 border text-right pr-4" style={{ borderColor: `${selectedStyle.accent}44` }}>الراتب الأساسي</td>
                            <td className="p-3 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{data.basicSalary || 0}</td>
                            <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>شهرياً</td>
                          </tr>
                          <tr>
                            <td className="p-3 border text-right pr-4" style={{ borderColor: `${selectedStyle.accent}44` }}>بدل السكن</td>
                            <td className="p-3 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{data.housingAllowance || 0}</td>
                            <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>شهرياً</td>
                          </tr>
                          <tr className="bg-slate-50/50">
                            <td className="p-3 border text-right pr-4" style={{ borderColor: `${selectedStyle.accent}44` }}>بدل النقل</td>
                            <td className="p-3 border font-mono" style={{ borderColor: `${selectedStyle.accent}44` }}>{data.transportAllowance || 0}</td>
                            <td className="p-3 border" style={{ borderColor: `${selectedStyle.accent}44` }}>شهرياً</td>
                          </tr>
                          <tr className="bg-emerald-50/80 text-emerald-800 text-[14px]">
                            <td className="p-3 border text-right pr-4 font-black" style={{ borderColor: `${selectedStyle.accent}44` }}>إجمالي الراتب الشهري</td>
                            <td colSpan="2" className="p-3 border font-mono font-black" style={{ borderColor: `${selectedStyle.accent}44` }}>{totalSalary} ر.س</td>
                          </tr>
                        </tbody>
                      </table>

                      {/* الشروط */}
                      <h4 className="mb-3 text-[14px] font-black flex items-center gap-2" style={{ color: selectedStyle.accent }}>
                        <ShieldCheck className="w-5 h-5 text-[#c5983c]" /> ثانياً: الشروط والأحكام العامة
                      </h4>
                      <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 text-right font-bold text-[#475569] text-[12.5px] leading-loose whitespace-pre-wrap mb-10">
                        {data.conditions}
                      </div>

                      {/* التوقيعات */}
                      <table className="w-full border-collapse text-center text-[12px] bg-white/50 backdrop-blur-sm" style={{ border: `2px solid ${selectedStyle.accent}` }}>
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
    </section>
  );
}