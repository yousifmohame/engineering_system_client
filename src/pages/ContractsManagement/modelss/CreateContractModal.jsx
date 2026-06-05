// ContractGenerator.jsx
import React, { useState, useEffect, useRef } from "react";
import api from "../../../api/axios";
import {
  X,
  Save,
  ChevronRight,
  ChevronLeft,
  Eye,
  Users,
  MapPin,
  DollarSign,
  Scale,
  Settings,
  LayoutTemplate,
  Layout,
  Shield,
  Loader2, // أضف هذا
  Sparkles, // أضف هذا
  FileText,
} from "lucide-react";
import { generateContractHtml } from "../utils/contractExporter";
import { emptyContractState } from "./components/initialState";
import AiRephraseModal from "./components/AiRephraseModal";

// استيراد مكونات الخطوات (تأكد من وجودها في نفس المجلد أو تعديل المسار)
import { Step1BasicInfo } from "./components/Steps/Step1BasicInfo";
import { Step2ProjectScope } from "./components/Steps/Step2ProjectScope";
import { Step3Financials } from "./components/Steps/Step3Financials";
import { Step4Obligations } from "./components/Steps/Step4Obligations";
import { Step5Settings } from "./components/Steps/Step5Settings";
import { Step6Templates } from "./components/Steps/Step6Templates";
import { Step7Formatting } from "./components/Steps/Step7Formatting";
import { Step8RiskAssessment } from "./components/Steps/Step8RiskAssessment";

export default function ContractGenerator({ initialData, onSave, onCancel }) {
  const [step, setStep] = useState(1);
  // الدمج بين الحالة الأولية الفارغة والبيانات القادمة (إن وجدت)
  const [contract, setContract] = useState({
    ...emptyContractState,
    ...initialData,
  });
  const [previewHtml, setPreviewHtml] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const previewContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isSaving, setIsSaving] = useState(false); // حالة التحميل أثناء الحفظ

  const [aiModalConfig, setAiModalConfig] = useState({
    isOpen: false,
    field: null,
    currentText: "",
    formality: "strict",
    length: "detailed",
  });

  // تحديث المعاينة الحية عند أي تغيير في العقد
  useEffect(() => {
    setPreviewHtml(generateContractHtml(contract));
  }, [contract]);

  // ضبط مقياس العرض (Scale) ليناسب حجم الشاشة
  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        const targetWidth = 794; // عرض ورقة A4
        const availableWidth = containerWidth - 40;
        setPreviewScale(Math.min(availableWidth / targetWidth, 1));
      }
    };
    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  const openAiModal = (field, currentText) => {
    if (!currentText) return;
    setAiModalConfig({
      isOpen: true,
      field,
      currentText,
      formality: "strict",
      length: "detailed",
    });
  };

  // ----- دوال الاتصال بالباك اند للذكاء الاصطناعي -----

  const executeAiRephrase = async () => {
    if (!aiModalConfig.field) return;
    setIsGeneratingAI(true);
    try {
      const response = await api.post("/contracts-management/ai/rephrase", {
        text: aiModalConfig.currentText,
        formality: aiModalConfig.formality,
        length: aiModalConfig.length,
      });

      const rephrased = response.data.rephrased;

      if (aiModalConfig.field === "obligationsList") {
        try {
          const parsed = JSON.parse(rephrased);
          setContract((prev) => ({ ...prev, obligationsList: parsed }));
        } catch (e) {
          console.error("Failed to parse obligations", e);
        }
      } else if (aiModalConfig.field.startsWith("obs_")) {
        const id = aiModalConfig.field.replace("obs_", "");
        setContract((prev) => ({
          ...prev,
          obligationsList: prev.obligationsList.map((o) =>
            o.id === id ? { ...o, content: rephrased } : o,
          ),
        }));
      } else {
        setContract((prev) => ({ ...prev, [aiModalConfig.field]: rephrased }));
      }
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setIsGeneratingAI(false);
      setAiModalConfig((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleGenerateAiSummary = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await api.post("/contracts-management/ai/summary", {
        partyA: contract.partyA,
        partyB: contract.partyB,
        projectDetails: contract.projectDetails,
        financials: contract.financials,
      });

      setContract((prev) => ({
        ...prev,
        coverSummary: response.data.coverSummary || prev.coverSummary,
        aiSummary: response.data.aiSummary || prev.aiSummary,
      }));
    } catch (error) {
      console.error("Summary AI Error:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRiskAssessment = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await api.post(
        "/contracts-management/ai/risk-assessment",
        {
          contractData: contract,
        },
      );
      setContract((prev) => ({
        ...prev,
        aiRiskAssessment: response.data.assessment,
      }));
    } catch (error) {
      console.error("Risk Assessment Error:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleFinalSave = async () => {
    setIsSaving(true);
    try {
      let response;

      // نتحقق مما إذا كان initialData يحتوي على id حقيقي من الداتابيز
      // هذا يعني أننا في وضع "التعديل"
      const isEditing = initialData && initialData.id;

      if (isEditing) {
        // إرسال طلب PUT لتعديل العقد الموجود
        response = await api.put(
          `/contracts-management/${contract.id}`,
          contract,
        );
      } else {
        // إرسال طلب POST لإنشاء عقد جديد
        response = await api.post("/contracts-management", contract);
      }

      // إشعار بالنجاح
      alert(isEditing ? "تم تعديل العقد بنجاح!" : "تم إنشاء العقد بنجاح!");

      // إخبار المكون الأب بإغلاق النافذة المنبثقة وتحديث القائمة
      if (onSave) {
        onSave(response.data.data);
      }
    } catch (error) {
      console.error("Failed to save contract:", error);
      alert("حدث خطأ أثناء حفظ العقد. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSaving(false);
    }
  };

  // ------------------------------------------------------------------

  const steps = [
    { id: 1, title: "البيانات والأطراف", icon: Users },
    { id: 2, title: "المشروع والنطاق", icon: MapPin },
    { id: 3, title: "المالية والدفعات", icon: DollarSign },
    { id: 4, title: "الشروط والالتزامات", icon: Scale },
    { id: 5, title: "إعدادات الغلاف", icon: Settings },
    { id: 6, title: "القوالب", icon: LayoutTemplate },
    { id: 7, title: "التنسيق", icon: Layout },
    { id: 8, title: "تقييم المخاطر", icon: Shield },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex bg-slate-900/60 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="w-full h-full bg-[#eef5f7] flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300 font-cairo">
        {/* Left Panel: Inputs */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border-l border-[#d8e6ee] shadow-xl z-10 h-full">
          {/* Header */}
          <div className="m-3 mb-2 rounded-[20px] bg-gradient-to-l from-[#071927] via-[#0b2f3f] to-[#147785] border border-[#d9b85b]/25 px-4 py-3 flex justify-between items-center shrink-0 shadow-sm">
            <div className="flex items-center gap-3 min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
              <div className="w-10 h-10 rounded-[14px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-[15px] font-bold text-white leading-tight whitespace-nowrap">
                  {contract.isAddendum ? "إنشاء عقد إلحاقي" : "إنشاء عقد متقدم"}
                </h2>
                <p className="text-[10px] font-semibold text-white/75 mt-0.5">إعداد البيانات، البنود، والمعاينة الحية</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="h-9 px-3 hover:bg-white/10 rounded-xl text-white/80 hover:text-white transition-colors flex items-center gap-2 text-[12px] font-bold"
            >
              <X className="w-4 h-4" /> إغلاق
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="mx-3 mb-2 bg-[#f7fbfd] border border-[#d8e6ee] rounded-[18px] p-1.5 shrink-0 overflow-x-auto custom-scrollbar-slim">
            <div className="flex items-center gap-1.5 min-w-max">
              {steps.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStep(s.id)}
                  className={`h-9 px-3 rounded-[13px] flex items-center gap-2 transition-colors text-[11px] font-black whitespace-nowrap ${
                    step === s.id
                      ? "bg-[#083646] text-white shadow-sm"
                      : "bg-white text-[#52677e] border border-[#d8e6ee] hover:bg-[#eef5f7]"
                  }`}
                >
                  <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] ${step === s.id ? "bg-white/15 text-white" : "bg-[#eef5f7] text-[#123B5D]"}`}>{s.id}</span>
                  <s.icon className="w-3.5 h-3.5" />
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Content Area - استدعاء المكونات الفرعية */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-200 bg-[#f7fbfd]">
            {step === 1 && (
              <Step1BasicInfo
                contract={contract}
                setContract={setContract}
                openAiModal={openAiModal}
              />
            )}
            {step === 2 && (
              <Step2ProjectScope
                contract={contract}
                setContract={setContract}
                openAiModal={openAiModal}
                isGeneratingAI={isGeneratingAI}
              />
            )}
            {step === 3 && (
              <Step3Financials contract={contract} setContract={setContract} />
            )}
            {step === 4 && (
              <Step4Obligations
                contract={contract}
                setContract={setContract}
                openAiModal={openAiModal}
                isGeneratingAI={isGeneratingAI}
              />
            )}
            {step === 5 && (
              <Step5Settings
                contract={contract}
                setContract={setContract}
                handleGenerateAiSummary={handleGenerateAiSummary}
                isGeneratingAI={isGeneratingAI}
              />
            )}
            {step === 6 && (
              <Step6Templates contract={contract} setContract={setContract} />
            )}
            {step === 7 && (
              <Step7Formatting contract={contract} setContract={setContract} />
            )}
            {step === 8 && (
              <Step8RiskAssessment
                contract={contract}
                isGeneratingAI={isGeneratingAI}
                handleRiskAssessment={handleRiskAssessment}
              />
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-3 border-t border-[#d8e6ee] bg-white flex justify-between items-center shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-4 py-2 text-[#52677e] font-bold hover:bg-[#eef5f7] rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 text-[12px]"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>

            {step < 8 ? (
              <button
                onClick={() => setStep(Math.min(8, step + 1))}
                className="px-6 py-2 bg-[#083646] text-white font-bold rounded-xl hover:bg-[#0f6d7c] transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20 text-[12px]"
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                disabled={isSaving}
                className="px-6 py-2 bg-[#083646] text-white font-black rounded-xl hover:bg-[#0f6d7c] transition-colors flex items-center gap-2 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed text-[12px]"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> حفظ وإصدار العقد
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div
          className="hidden md:flex w-1/2 bg-[#e5eef2] p-5 flex-col items-center overflow-y-auto relative"
          ref={previewContainerRef}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

          <div className="w-full flex justify-between items-center mb-3 z-10 max-w-[794px]">
            <h3 className="text-[12px] font-black text-[#123B5D] flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-2 rounded-xl shadow-sm border border-[#d8e6ee]">
              <Eye className="w-4 h-4 text-emerald-600" /> معاينة حية (A4)
            </h3>
            <div className="text-[10px] font-bold text-[#0f6d7c] bg-white border border-[#d8e6ee] px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
              يتم التحديث تلقائياً
            </div>
          </div>

          {/* A4 Preview Container with Auto-Scaling */}
          <div
            className="bg-white shadow-2xl rounded-sm overflow-hidden z-10 ring-1 ring-slate-900/5 transition-transform duration-200 origin-top"
            style={{
              width: "794px",
              minHeight: "1123px",
              transform: `scale(${previewScale})`,
              marginBottom: `${(previewScale - 1) * 1123}px`,
            }}
          >
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-none"
              title="Contract Preview"
              style={{ minHeight: "1123px" }}
            />
          </div>
        </div>
      </div>

      {/* AI Modal */}
      <AiRephraseModal
        config={aiModalConfig}
        setConfig={setAiModalConfig}
        onExecute={executeAiRephrase}
        isGenerating={isGeneratingAI}
      />
    </div>
  );
}
