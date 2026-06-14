// src/pages/Hr/screens/JobOffers/CreateJobOffer/CreateJobOfferModal.jsx
import React, { useState } from "react";
import {
  X,
  Save,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ZoomIn,
  ZoomOut,
  Briefcase,
} from "lucide-react";
import { createJobOffer } from "../../../../../api/jobOfferApi"; // تأكد من المسار
import { STEPS } from "./constants";

import JobOfferLivePreview from "./components/JobOfferLivePreview";
import Step1BasicInfo from "./components/steps/Step1BasicInfo";
import Step2Financials from "./components/steps/Step2Financials";
import Step3Terms from "./components/steps/Step3Terms";
import Step4Attachments from "./components/steps/Step4Attachments";
import { generateJobOfferPdf } from "../../../../../api/jobOfferApi";

export default function CreateJobOfferModal({ onClose, onSuccess }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.65);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [formData, setFormData] = useState({
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    jobTitle: "",
    basicSalary: "",
    housingAllowance: "",
    transportAllowance: "",
    introduction:
      "يسرنا في شركة ديتيلز للاستشارات الهندسية تقديم هذا العرض الوظيفي لكم للانضمام إلى فريق عملنا، وذلك وفقاً للتفاصيل والمزايا الموضحة أدناه:",
    conditions:
      "1. يخضع هذا العرض لأنظمة العمل والعمال في المملكة العربية السعودية.\n2. مدة التجربة 90 يوماً قابلة للتمديد.\n3. الإجازة السنوية 21 يوماً مدفوعة الأجر.\n4. التأمين الطبي يوفر للموظف بحسب سياسة الشركة.",
  });

  const [files, setFiles] = useState({
    frontCover: null,
    backCover: null,
    cvFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    if (selectedFiles[0])
      setFiles((prev) => ({ ...prev, [name]: selectedFiles[0] }));
  };

  const handlePrint = async () => {
    setIsGeneratingPdf(true);
    try {
      const blob = await generateJobOfferPdf(formData);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" }),
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `عرض_وظيفي_${formData.candidateName || "جديد"}.pdf`;
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

  const handleSubmit = async () => {
    if (
      !formData.candidateName ||
      !formData.jobTitle ||
      !formData.basicSalary
    ) {
      return alert("يرجى تعبئة البيانات الأساسية (الاسم، المسمى، الراتب)");
    }
    setLoading(true);
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key !== "housingAllowance" && key !== "transportAllowance") {
          submitData.append(key, formData[key]);
        }
      });
      submitData.append(
        "allowances",
        JSON.stringify({
          housing: formData.housingAllowance,
          transport: formData.transportAllowance,
        }),
      );
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

  // الموجه لعرض محتوى الخطوات
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Step1BasicInfo
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 1:
        return (
          <Step2Financials
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <Step3Terms
            formData={formData}
            handleInputChange={handleInputChange}
          />
        );
      case 3:
        return <Step4Attachments handleFileChange={handleFileChange} />;
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4 font-[Tajawal]"
      dir="rtl"
    >
      <div className="bg-white w-full h-[95vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        {/* --- Header الموحد --- */}
        <div className="shrink-0 border-b border-[#e8ddc8] bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74] shadow-md">
              <Briefcase className="h-5 w-5" />
            </span>
            <div className="flex flex-col">
              <h2 className="text-lg font-black flex items-center gap-2">
                بناء عرض وظيفي جديد
              </h2>
              <p className="text-[11px] font-bold text-white/60">
                بناء العرض المالي، الشروط، والمرفقات بشكل احترافي.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/80 transition-colors"
            >
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
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex-1 flex flex-col items-center p-2 rounded-xl text-[11px] font-black transition-all ${
                    currentStep === step.id
                      ? "bg-[#123f59] text-white shadow-md"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  <step.icon
                    className={`w-4 h-4 mb-1 ${currentStep === step.id ? "text-[#e2bf74]" : ""}`}
                  />
                  {step.label}
                </button>
              ))}
            </div>

            {/* منطقة الإدخال النشطة المستدعاة من الـ Components */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar-slim">
              {renderStepContent()}
            </div>

            {/* Footer Navigation */}
            <div className="shrink-0 border-t border-[#e8ddc8] bg-gray-50 p-4 flex justify-between items-center gap-3">
              <button
                disabled={currentStep === 0}
                onClick={() => setCurrentStep((p) => p - 1)}
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
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-[#e2bf74]" />
                  )}
                  اعتماد وحفظ العرض
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep((p) => p + 1)}
                  className="flex items-center gap-1 h-10 px-4 bg-[#123f59] rounded-xl text-white text-xs font-black hover:bg-[#0e7490]"
                >
                  التالي <ChevronLeft className="w-4 h-4" />
                </button>
              )}
            </div>
          </section>

          {/* قسم المعاينة الحية (اليمين) المستدعى من الـ Component */}
          <section className="flex-1 overflow-hidden flex flex-col">
            <JobOfferLivePreview data={formData} />
          </section>
        </div>
      </div>
    </div>
  );
}
