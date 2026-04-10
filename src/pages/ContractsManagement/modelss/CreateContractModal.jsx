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
      <div className="w-full h-full bg-slate-50 flex flex-col md:flex-row overflow-hidden animate-in fade-in duration-300">
        {/* Left Panel: Inputs */}
        <div className="w-full md:w-1/2 flex flex-col bg-white border-l border-slate-200 shadow-xl z-10 h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {contract.isAddendum
                  ? "إنشاء عقد إلحاقي"
                  : "إنشاء عقد متقدم (V2)"}
              </h2>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Steps Indicator */}
          <div className="flex border-b border-slate-100 bg-slate-50/50 shrink-0 overflow-x-auto scrollbar-hide">
            {steps.map((s) => (
              <button
                key={s.id}
                onClick={() => setStep(s.id)}
                className={`flex-1 min-w-[100px] py-3 flex flex-col items-center gap-1 relative transition-colors ${
                  step === s.id
                    ? "text-emerald-700 bg-emerald-50/50"
                    : "text-slate-400 hover:bg-slate-100/50"
                }`}
              >
                <s.icon
                  className={`w-4 h-4 ${step === s.id ? "text-emerald-600" : ""}`}
                />
                <span className="text-[10px] font-black">{s.title}</span>
                {step === s.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
                )}
              </button>
            ))}
          </div>

          {/* Form Content Area - استدعاء المكونات الفرعية */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 bg-slate-50/30">
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
          <div className="p-4 border-t border-slate-200 bg-white flex justify-between items-center shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
            <button
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" /> السابق
            </button>

            {step < 8 ? (
              <button
                onClick={() => setStep(Math.min(8, step + 1))}
                className="px-8 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/20"
              >
                التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                disabled={isSaving}
                className="px-8 py-2.5 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-70 disabled:cursor-not-allowed"
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
          className="hidden md:flex w-1/2 bg-slate-200 p-8 flex-col items-center overflow-y-auto relative"
          ref={previewContainerRef}
        >
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

          <div className="w-full flex justify-between items-center mb-4 z-10 max-w-[794px]">
            <h3 className="text-sm font-black text-slate-700 flex items-center gap-2 bg-white/80 backdrop-blur px-4 py-2 rounded-xl shadow-sm border border-white">
              <Eye className="w-4 h-4 text-emerald-600" /> معاينة حية (A4)
            </h3>
            <div className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
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
