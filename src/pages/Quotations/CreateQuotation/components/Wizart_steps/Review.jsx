import React, { useState } from "react";
import { 
  Loader2, 
  Save, 
  FileSignature, 
  ShieldCheck, 
  FileText,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// 🚨 تأكد من صحة مسار استدعاء المودال لديك
import NewDocumentationModal from "../../../../../pages/ElectronicDocumentation/tabs/NewDocumentationModal"; 

export const Step8Review = ({ props }) => {
  const { 
    handleSave,        
    saveMutation,      
    quotationData      
  } = props;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pdfFileToStamp, setPdfFileToStamp] = useState(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 🚀 المحرك المؤسسي المتطور لالتقاط الـ PDF بنظام Auto-Flow
  const createPdfDocument = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    
    // البحث عن الحاوية الرئيسية للعرض والتي تحمل الكلاس pdf-page-capture
    const pageContainer = document.querySelector(".pdf-page-capture");

    if (!pageContainer) {
      throw new Error("لم يتم العثور على محتوى العرض. تأكد من إعداد المكون الأب بشكل صحيح.");
    }

    // إيقاف التكبير والتصغير مؤقتاً بالخلفية لضمان أبعاد التقاط 100% حقيقية بدون تشوهات
    const scaleWrapper = document.getElementById("pdf-scale-wrapper");
    let originalTransform = "";
    if (scaleWrapper) {
      originalTransform = scaleWrapper.style.transform;
      scaleWrapper.style.transform = "none";
    }

    try {
      // التقاط اللوحة بالكامل بدقة عالية (Scale: 2 للوضوح الفائق)
      const canvas = await html2canvas(pageContainer, {
        scale: 2, 
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          // تنظيف وإلغاء حقول الإدخال والتحرير لمنع انضغاط النصوص العربية
          const editables = clonedDoc.querySelectorAll('[contenteditable]');
          editables.forEach(el => {
              el.removeAttribute('contenteditable');
              el.style.border = 'none';
              el.style.backgroundColor = 'transparent';
              el.style.letterSpacing = 'normal'; 
              el.style.wordSpacing = 'normal'; 
          });
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      
      // تقطيع الـ Canvas الطويل رياضياً لصفحات A4
      const pdfWidth = 210; // مليمتر
      const pageHeight = 297; // مليمتر
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;
      
      // إضافة الصفحة الأولى
      pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // الدوران لإنشاء صفحات جديدة إذا كان المحتوى يتجاوز الصفحة الأولى
      while (heightLeft > 0) {
        position = heightLeft - imgHeight; 
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

    } catch (err) {
      console.error("Stamping Canvas Error: ", err);
      throw err;
    } finally {
      // إرجاع الزووم لوضعه السابق في الشاشة
      if (scaleWrapper && originalTransform) {
        scaleWrapper.style.transform = originalTransform;
      }
    }
    
    return pdf;
  };

  const handleOpenStampingEngine = async () => {
    setIsGeneratingPdf(true);
    const toastId = toast.loading("جاري تجميع وحرق الصفحات في وثيقة PDF ذكية...");
    
    try {
      const pdf = await createPdfDocument();
      const pdfBlob = pdf.output("blob");
      
      const fileName = `عرض_سعر_${quotationData?.clientName || "جديد"}_${Date.now()}.pdf`;
      const generatedFile = new File([pdfBlob], fileName, { type: "application/pdf" });

      setPdfFileToStamp(generatedFile);
      toast.success("تم تشييد وثيقة الـ PDF بنجاح! جاري التوجيه للختم والاعتماد 🛡️", { id: toastId });
      
      setIsModalOpen(true);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error(error.message || "فشل النظام في تشييد ملف الـ PDF المعزول.", { id: toastId });
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleStampingSuccess = () => {
    toast.success("تم توثيق العرض ورفعه للسجلات بنجاح! ✅");
    if(props.onSuccess) props.onSuccess(); 
  };

  return (
    <>
      <div className="animate-in fade-in duration-300 h-full flex flex-col items-center justify-center max-w-2xl mx-auto gap-6 p-4">
        
        <div className="text-center flex flex-col items-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500 blur-[40px] opacity-20 rounded-full animate-pulse"></div>
            <div className="w-24 h-24 bg-gradient-to-br from-[#123f59] to-blue-800 rounded-3xl flex items-center justify-center shadow-2xl relative z-10 border-4 border-white">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white z-20 shadow-lg">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-[#123f59] mb-2">جاهز للتوثيق والاعتماد</h2>
          <p className="text-sm text-[#64748b] font-medium max-w-md mx-auto leading-relaxed">
            تم تشييد صفحات العرض بنجاح وبشكل متناسق. خطوتك الأخيرة هي تشفير الملف وتوجيهه لمنصة الأختام المتقدمة.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col gap-3 mt-4">
          <button
            onClick={handleOpenStampingEngine}
            disabled={isGeneratingPdf || saveMutation?.isPending}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#123f59] to-blue-800 text-white rounded-2xl text-sm font-black cursor-pointer flex justify-between items-center gap-2 hover:shadow-[0_15px_30px_rgba(18,63,89,0.2)] transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 group relative overflow-hidden"
          >
            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
            
            <span className="flex items-center gap-3 relative z-10">
              {isGeneratingPdf ? (
                <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
              ) : (
                <FileText className="w-5 h-5 text-blue-200" />
              )}
              {isGeneratingPdf ? "جاري تشييد صفحات الـ PDF..." : "تحويل العرض لوثيقة رسمية"}
            </span>
            <ArrowLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleSave(true)}
            disabled={isGeneratingPdf || saveMutation?.isPending}
            className="w-full py-3.5 px-6 bg-white border-2 border-[#d8b46a]/30 text-[#475569] hover:bg-[#fbf8f1] hover:border-[#d8b46a] rounded-2xl text-sm font-bold cursor-pointer flex justify-center items-center gap-2 transition-all disabled:opacity-50"
          >
            {saveMutation?.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 text-[#d8b46a]" />
            )}
            حفظ العرض كمسودة والعودة لاحقاً
          </button>
        </div>

        <div className="mt-8 px-4 py-3 bg-[#eef7f6] rounded-xl border border-[#0f766e]/20 flex items-center gap-3 max-w-md w-full">
          <ShieldCheck className="w-5 h-5 text-[#0f766e] flex-shrink-0" />
          <p className="text-[10px] font-bold text-[#0f766e]">
            المحرك يعتمد الآن على تقسيم الـ DOM المرئي لمنع تداخل الحروف والقص العشوائي نهائياً وضمان مظهر كالمطبعة وثابت.
          </p>
        </div>
      </div>

      {isModalOpen && pdfFileToStamp && (
        <NewDocumentationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleStampingSuccess}
          initialFile={pdfFileToStamp}
          initialMetadata={{
            employeeName: quotationData?.clientName || "عميل النظام",
            documentName: `عرض سعر هندسي (${quotationData?.projectName || "مشروع جديد"})`,
          }}
        />
      )}
    </>
  );
};

export default Step8Review;