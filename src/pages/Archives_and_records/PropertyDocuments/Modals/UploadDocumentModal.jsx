import React, { useState, useRef, useEffect } from "react";
import {
  X, UploadCloud, FileText, BrainCircuit, FileSearch, ShieldAlert,
  CheckCircle2, ChevronRight, ChevronLeft, Save, Map, Users, AlertTriangle,
  FileBadge, Check, Building2, Link as LinkIcon, AlertCircle, Trash2, MapPin, Loader2, Minimize2, Maximize2, MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import axios from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";

// ==========================================================================================
// 🚀 المكون الرئيسي: نافذة رفع وتحليل وثيقة الملكية (Enterprise Grade)
// ==========================================================================================
export const UploadDocumentModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // --- Background UX & Queue State ---
  const [isMinimized, setIsMinimized] = useState(false);
  const isMinimizedRef = useRef(false);
  const [archiveDocId, setArchiveDocId] = useState(null); // ID السجل الذي تم إنشاؤه مبدئياً
  const pollIntervalRef = useRef(null);

  useEffect(() => {
    isMinimizedRef.current = isMinimized;
  }, [isMinimized]);

  // --- State: Step 1 & 2 (Upload & Classify) ---
  const [files, setFiles] = useState([]);
  const [uploadNotes, setUploadNotes] = useState("");
  const [docType, setDocType] = useState("");
  const [docSource, setDocSource] = useState("");
  const fileInputRef = useRef(null);

  // --- State: Step 3 (AI Analysis) ---
  const [aiProgress, setAiProgress] = useState(0);
  const [aiMessage, setAiMessage] = useState("");

  // --- State: Step 4 (Review) ---
  const [activeReviewTab, setActiveReviewTab] = useState("basic");
  const [extractedData, setExtractedData] = useState(null);

  // --- State: Step 5 (Save) ---
  const [saveAction, setSaveAction] = useState("ARCHIVE_ONLY");
  const [selectedPropertyId, setSelectedPropertyId] = useState("");

  // ==========================================
  // 🧹 إعادة ضبط النافذة عند الفتح
  // ==========================================
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFiles([]);
      setUploadNotes("");
      setDocType("");
      setDocSource("");
      setExtractedData(null);
      setArchiveDocId(null);
      setAiProgress(0);
      setAiMessage("");
      setSaveAction("ARCHIVE_ONLY");
      setSelectedPropertyId("");
      setIsMinimized(false);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    }
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  if (!isOpen && !isMinimized) return null;

  // ==========================================
  // 🧠 1. دالة الرفع والتحليل عبر الطابور (Upload & Enqueue)
  // ==========================================
  const startAiAnalysis = async () => {
    if (files.length === 0) return toast.error("يرجى اختيار ملف أولاً");

    setCurrentStep(3);
    setAiProgress(5);
    setAiMessage("جاري تشفير وتجهيز الملف...");

    try {
      const file = files[0];
      const reader = new FileReader();
      
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const imageBase64 = reader.result;
        setAiProgress(15);
        setAiMessage("جاري إرسال الملف لطابور المعالجة المركزي...");

        try {
          // 🚀 1. إرسال الطلب (الكنترولر سيحفظ الملف، ينشئ السجل، ويطلقه للطابور)
          const response = await axios.post("/doc-archive/analyze", { 
            imageBase64,
            originalFileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadNotes,
            userId: user?.id || user?.userId
          });
          
          const { dbJobId, archiveDocId: newArchiveDocId } = response.data.data;
          setArchiveDocId(newArchiveDocId); // حفظ ID الوثيقة لنقوم بتحديثها لاحقاً
          
          setAiProgress(25);
          setAiMessage("تم الاستلام. الملف الآن في الطابور بانتظار دورة التحليل...");

          // 🚀 2. المراقبة الحية (Polling)
          pollIntervalRef.current = setInterval(async () => {
            try {
              const jobsRes = await axios.get("/ai-dashboard/jobs");
              const currentJob = jobsRes.data.data?.find(j => j.id === dbJobId);

              if (currentJob) {
                setAiProgress(currentJob.progress);
                
                if (currentJob.status === "PROCESSING") {
                  setAiMessage(`محرك الذكاء الاصطناعي يقوم بالتحليل... ${currentJob.progress}%`);
                } 
                else if (currentJob.status === "COMPLETED") {
                  clearInterval(pollIntervalRef.current);
                  setAiMessage("اكتمل التحليل! جاري جلب ومطابقة البيانات...");
                  
                  // 🛡️ فك التشفير الآمن جداً (Bulletproof JSON Parse)
                  let parsedAiData = {};
                  try {
                    let rawData = currentJob.result;
                    if (typeof rawData === 'string') {
                      rawData = rawData.replace(/```json/gi, "").replace(/```/g, "").trim();
                      parsedAiData = JSON.parse(rawData);
                      if (typeof parsedAiData === 'string') {
                        parsedAiData = JSON.parse(parsedAiData);
                      }
                    } else {
                      parsedAiData = rawData;
                    }
                  } catch (e) {
                    console.error("AI JSON Parse Error:", e);
                    toast.error("تحذير: البيانات المستخرجة غير مهيكلة بشكل صحيح، تم تطبيق وضع الاسترداد الآمن.");
                    parsedAiData = { basic: {}, properties: [], owners: [], restrictions: {} };
                  }

                  // 🛡️ دمج وضمان وجود جميع الحقول (Fallback Injection)
                  const safeBasic = parsedAiData?.basic || {};
                  const finalAiData = {
                    aiConfidenceScore: parsedAiData?.aiConfidenceScore || parsedAiData?.aiConfidence || 100,
                    aiNotes: parsedAiData?.aiNotes || "لا توجد ملاحظات من المحرك.",
                    basic: {
                      ...safeBasic,
                      docType: docType || safeBasic.docType || "غير مصنف",
                      docSource: docSource || safeBasic.docSource || "غير محدد",
                      documentNumber: safeBasic.documentNumber || "",
                      propertyNumber: safeBasic.propertyNumber || "",
                      issueDate: safeBasic.issueDate || "",
                      versionNumber: safeBasic.versionNumber || "",
                      operationType: safeBasic.operationType || ""
                    },
                    properties: Array.isArray(parsedAiData?.properties) ? parsedAiData.properties : [],
                    owners: Array.isArray(parsedAiData?.owners) ? parsedAiData.owners : [],
                    restrictions: parsedAiData?.restrictions || { hasRestrictions: "لا يوجد", text: "", restrictedTo: "", value: 0 }
                  };

                  // 🚀 3. التوجيه بناءً على قرار المستخدم (العمل في الخلفية أم المراجعة الفورية)
                  if (isMinimizedRef.current) {
                    // المستخدم أغلق الشاشة وذهب. الـ Worker أصلاً حفظها في الداتابيز.
                    toast.success("اكتمل تحليل الوثيقة في الخلفية، تجدها في الأرشيف للمراجعة والاعتماد.", { duration: 6000 });
                    onClose();
                  } else {
                    // المستخدم لا يزال هنا، نعرض له شاشة المراجعة الشاملة
                    setExtractedData(finalAiData);
                    setCurrentStep(4);
                  }
                } 
                else if (currentJob.status === "FAILED") {
                  clearInterval(pollIntervalRef.current);
                  toast.error("فشل التحليل: " + (currentJob.errorMessage || "يرجى المحاولة لاحقاً"));
                  setIsMinimized(false);
                  setCurrentStep(2);
                }
              }
            } catch (pollErr) {
               // تجاهل صامت لمشاكل الشبكة
            }
          }, 2000);

        } catch (error) {
          toast.error("فشل في الاتصال بمحرك التحليل.");
          setCurrentStep(2);
        }
      };
      reader.onerror = () => { toast.error("حدث خطأ أثناء قراءة الملف."); setCurrentStep(2); };

    } catch (error) {
      toast.error("حدث خطأ غير متوقع.");
      setCurrentStep(2);
    }
  };

  // ==========================================
  // 💾 2. دالة التحديث النهائي (Update Existing Record)
  // ==========================================
  const handleFinalSave = async () => {
    setIsSubmitting(true);
    try {
      // 🚀 بدلاً من POST نقوم بعمل PUT/PATCH لتحديث السجل الذي أنشأه الكنترولر وحلله الـ Worker
      const payload = {
        aiData: extractedData, 
        saveAction: saveAction,
        selectedPropertyId: selectedPropertyId || null,
        uploadNotes: uploadNotes,
        isFinalApproval: true, // لتغيير الحالة إلى CONFIRMED
        userId: user?.id || user?.userId
      };

      // ملاحظة للمبرمج: تأكد أن لديك مسار PUT /api/doc-archive/:id يعمل في الكنترولر الخاص بك
      const response = await axios.put(`/doc-archive/${archiveDocId}`, payload);
      
      if (response.data.success) {
        toast.success("تم اعتماد الوثيقة وحفظ التعديلات بنجاح!");
        onClose();
      } else {
        toast.error("حدث خطأ أثناء الاعتماد.");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "حدث خطأ في الاتصال بالخادم للاعتماد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ✍️ دوال تحديث الحالة العميقة (Deep State Updaters)
  // ==========================================
  const updateBasic = (field, value) => {
    setExtractedData(p => ({ ...p, basic: { ...p.basic, [field]: value } }));
  };

  const updateProperty = (idx, field, value) => {
    setExtractedData(p => { 
      const props = [...p.properties]; 
      props[idx] = { ...props[idx], [field]: value }; 
      return { ...p, properties: props }; 
    });
  };

  const updateBoundary = (pIdx, bIdx, field, value) => {
    setExtractedData(p => {
      const props = [...p.properties];
      const bounds = [...props[pIdx].boundaries];
      bounds[bIdx] = { ...bounds[bIdx], [field]: value };
      props[pIdx] = { ...props[pIdx], boundaries: bounds };
      return { ...p, properties: props };
    });
  };

  const updateOwner = (idx, field, value) => {
    setExtractedData(p => { 
      const owners = [...p.owners]; 
      owners[idx] = { ...owners[idx], [field]: value }; 
      return { ...p, owners: owners }; 
    });
  };

  const updateRestrictions = (field, value) => {
    setExtractedData(p => ({ ...p, restrictions: { ...p.restrictions, [field]: value } }));
  };

  // ==========================================
  // 🎨 واجهات الخطوات (Steps UI)
  // ==========================================

  const renderStep1Upload = () => (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center mb-2">
        <h3 className="text-lg font-black text-[#123f59]">رفع وثيقة ملكية جديدة</h3>
        <p className="text-sm font-bold text-slate-500 mt-1">الخطوة الأولى: أرفق الملف وأضف ملاحظاتك.</p>
      </div>

      <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-[#123f59]/5 border-slate-300 hover:border-[#123f59] transition-all">
        <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-4"><UploadCloud className="w-8 h-8 text-[#123f59]" /></div>
        <p className="text-sm font-black text-[#123f59]">اضغط هنا لاختيار ملف (أو اسحب وأفلت)</p>
        <p className="text-xs font-bold text-slate-400 mt-2">PDF, JPG, PNG (أقصى حجم 20MB)</p>
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={(e) => setFiles(Array.from(e.target.files))} />
      </div>

      {files.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="max-h-32 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-2">
            {files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-[#d8b46a]" />
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700 truncate max-w-[200px]">{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
                <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5" /> ملاحظات الموظف التوضيحية (اختياري)
        </label>
        <textarea
          value={uploadNotes}
          onChange={(e) => setUploadNotes(e.target.value)}
          placeholder="مثال: هذه الوثيقة وردت من العميل عبر الواتساب وتحتاج لتدقيق الحدود مع المخطط المعتمد..."
          className="w-full h-20 p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#123f59] focus:border-[#123f59] focus:ring-1 focus:ring-[#123f59] outline-none resize-none transition-all shadow-sm"
        ></textarea>
      </div>
    </div>
  );

  const renderStep2Classification = () => {
    const docTypes = [
      { id: "صك تسجيل ملكية", label: "صك تسجيل ملكية", desc: "صادر من السجل العقاري", icon: FileBadge },
      { id: "وثيقة تملك عقار", label: "وثيقة تملك عقار", desc: "وزارة العدل أو البورصة", icon: FileText },
      { id: "صك قديم مصور", label: "صك قديم مصور", desc: "ورقي ممسوح ضوئياً", icon: FileSearch },
      { id: "غير مصنف", label: "دع النظام يقرر", desc: "الذكاء الاصطناعي سيقوم بتصنيفه", icon: BrainCircuit },
    ];
    return (
      <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
        <div className="text-center mb-2">
          <h3 className="text-lg font-black text-[#123f59]">مساعدة النظام (اختياري)</h3>
          <p className="text-sm font-bold text-slate-500 mt-1">تحديد نوع الوثيقة مسبقاً يرفع من دقة وسرعة الاستخراج.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {docTypes.map(type => (
            <div key={type.id} onClick={() => setDocType(type.id)} className={`p-4 border-2 rounded-xl cursor-pointer flex items-start gap-3 transition-all ${docType === type.id ? "border-[#0e7490] bg-[#eef7f6] shadow-md" : "border-slate-200 bg-white hover:border-slate-300"}`}>
              <div className={`p-2 rounded-lg ${docType === type.id ? "bg-[#0e7490] text-white" : "bg-slate-100 text-slate-500"}`}><type.icon className="w-5 h-5" /></div>
              <div className="flex flex-col mt-0.5">
                <span className={`text-xs font-black ${docType === type.id ? "text-[#0e7490]" : "text-slate-700"}`}>{type.label}</span>
                <span className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">{type.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep3Analysis = () => (
    <div className="flex flex-col items-center justify-center py-12 gap-6 animate-in zoom-in-95 duration-500">
      <div className="relative flex items-center justify-center w-28 h-28">
        <div className="absolute inset-0 rounded-full border-4 border-[#0e7490]/20 animate-ping"></div>
        <div className="absolute inset-2 rounded-full border-4 border-[#0e7490]/40 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-[#123f59] to-[#0e7490] w-20 h-20 rounded-full flex items-center justify-center shadow-xl z-10">
          <BrainCircuit className="w-10 h-10 text-white animate-bounce" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 text-center w-full max-w-md">
        <h3 className="text-xl font-black text-[#123f59]">جاري التحليل المعماري والقانوني...</h3>
        <p className="text-sm font-bold text-[#0e7490] h-6">{aiMessage}</p>
        <div className="w-full bg-slate-100 rounded-full h-3 mt-4 overflow-hidden shadow-inner p-0.5">
          <div className="bg-gradient-to-l from-[#d8b46a] to-[#0e7490] h-full rounded-full transition-all duration-500 relative" style={{ width: `${aiProgress}%` }}>
            <div className="absolute top-0 bottom-0 right-0 left-0 bg-white/20 w-full animate-[shimmer_1.5s_infinite]"></div>
          </div>
        </div>
        <span className="text-[11px] font-black text-slate-500 mt-1 font-mono">{aiProgress}%</span>
      </div>

      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl max-w-md text-center">
         <h4 className="text-xs font-black text-amber-800 mb-1">العمليات في الخلفية</h4>
         <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
           هذه العملية قد تستغرق حتى 20 ثانية حسب دقة الملف، يمكنك المتابعة في الخلفية، وسيقوم النظام بحفظ البيانات المستخرجة في الأرشيف تلقائياً.
         </p>
         <button 
          onClick={() => setIsMinimized(true)}
          className="mt-3 w-full px-5 py-2.5 bg-white text-[#123f59] border border-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors shadow-sm"
        >
          <Minimize2 className="w-4 h-4" /> إخفاء النافذة والاستمرار
        </button>
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
    </div>
  );

  const renderStep4Review = () => {
    if (!extractedData) return null;
    const tabs = [
      { id: "basic", label: "الأساسية", icon: FileText, alerts: 0 }, 
      { id: "properties", label: "العقارات والمساحات", icon: Building2, alerts: 0 },
      { id: "boundaries", label: "الحدود والأطوال", icon: Map, alerts: 0 },
      { id: "owners", label: "الملاك", icon: Users, alerts: 0 }, 
      { id: "restrictions", label: "القيود", icon: ShieldAlert, alerts: extractedData.restrictions?.hasRestrictions === "مرهون" ? 1 : 0 },
    ];
    return (
      <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        
        {/* شريط الإشعارات الذكي العُلوي */}
        <div className="flex gap-4 mb-4 shrink-0">
          <div className="flex-1 bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200 p-3 rounded-2xl flex items-start gap-3 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex flex-col gap-1">
              <h4 className="text-xs font-black text-emerald-800">تم الاستخراج بنجاح ({extractedData.aiConfidenceScore || 100}%)</h4>
              <p className="text-[10px] font-bold text-emerald-700 leading-relaxed">
                يرجى مراجعة وتأكيد البيانات أدناه قبل اعتمادها في النظام. الحقول المدخلة يمكن تعديلها يدوياً.
              </p>
            </div>
          </div>
          {(extractedData.aiNotes || uploadNotes) && (
            <div className="flex-1 bg-slate-50 border border-slate-200 p-3 rounded-2xl flex flex-col gap-1.5 shadow-sm overflow-hidden">
               <h4 className="text-[10px] font-black text-slate-500 flex items-center gap-1"><MessageSquare className="w-3 h-3"/> ملاحظات مرفقة</h4>
               <p className="text-[10px] font-bold text-slate-700 truncate">{extractedData.aiNotes || uploadNotes}</p>
            </div>
          )}
        </div>

        {/* قائمة التبويبات */}
        <div className="flex border-b border-slate-200 gap-2 shrink-0 overflow-x-auto custom-scrollbar-slim pb-px">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveReviewTab(tab.id)} className={`px-4 py-3 flex items-center gap-2 border-b-2 text-xs font-black transition-all whitespace-nowrap ${activeReviewTab === tab.id ? "border-[#123f59] text-[#123f59] bg-slate-50/50 rounded-t-xl" : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50/30 rounded-t-xl"}`}>
              <tab.icon className={`w-4 h-4 ${activeReviewTab === tab.id ? "text-[#d8b46a]" : ""}`} />
              {tab.label}
              {tab.alerts > 0 && <span className="bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded-md text-[9px] font-mono ml-1">{tab.alerts}</span>}
            </button>
          ))}
        </div>

        {/* محتوى التبويبات */}
        <div className="flex-1 overflow-y-auto py-5 pr-1 custom-scrollbar-slim">
          {activeReviewTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ReviewField label="رقم الوثيقة / الصك" value={extractedData.basic?.documentNumber} confidence={0.99} fontMono onChange={(v) => updateBasic('documentNumber', v)} />
              <ReviewField label="رقم العقار (للتسجيل العيني)" value={extractedData.basic?.propertyNumber} confidence={0.99} fontMono onChange={(v) => updateBasic('propertyNumber', v)} />
              <ReviewField label="نوع الوثيقة" value={extractedData.basic?.docType} confidence={0.95} onChange={(v) => updateBasic('docType', v)} />
              <ReviewField label="مصدر الإصدار" value={extractedData.basic?.docSource} confidence={0.95} onChange={(v) => updateBasic('docSource', v)} />
              <ReviewField label="تاريخ الإصدار" value={extractedData.basic?.issueDate} confidence={0.90} type="date" onChange={(v) => updateBasic('issueDate', v)} />
              <div className="grid grid-cols-2 gap-3">
                 <ReviewField label="رقم النسخة" value={extractedData.basic?.versionNumber} fontMono onChange={(v) => updateBasic('versionNumber', v)} />
                 <ReviewField label="نوع العملية" value={extractedData.basic?.operationType} onChange={(v) => updateBasic('operationType', v)} />
              </div>
            </div>
          )}
          
          {activeReviewTab === "properties" && (
            <div className="flex flex-col gap-5">
              {extractedData.properties?.length === 0 && <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed rounded-xl">لم يتم استخراج بيانات قطع أراضي/عقارات من الوثيقة.</div>}
              {extractedData.properties?.map((prop, idx) => (
                <div key={idx} className="p-5 border border-slate-200 rounded-2xl bg-white shadow-sm flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-[#d8b46a]"></div>
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                     <h5 className="text-sm font-black text-[#123f59]">بيانات العقار رقم {idx + 1}</h5>
                     <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-bold">{prop.propertyType || "غير محدد"}</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <ReviewField label="المدينة" value={prop.city} confidence={0.95} onChange={(v) => updateProperty(idx, 'city', v)} />
                    <ReviewField label="الحي" value={prop.district} confidence={0.95} onChange={(v) => updateProperty(idx, 'district', v)} />
                    <ReviewField label="رقم المخطط" value={prop.planNumber} confidence={0.90} fontMono onChange={(v) => updateProperty(idx, 'planNumber', v)} />
                    <ReviewField label="رقم القطعة" value={prop.plotNumber} confidence={0.99} fontMono onChange={(v) => updateProperty(idx, 'plotNumber', v)} />
                    <ReviewField label="المساحة (متر مربع)" value={prop.area} confidence={0.85} fontMono type="number" onChange={(v) => updateProperty(idx, 'area', v)} />
                    <ReviewField label="الاستخدام المعتمد" value={prop.usageType} confidence={0.85} onChange={(v) => updateProperty(idx, 'usageType', v)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeReviewTab === "boundaries" && (
            <div className="flex flex-col gap-6">
               {extractedData.properties?.length === 0 && <div className="p-8 text-center text-slate-400 font-bold border-2 border-dashed rounded-xl">لا توجد عقارات لاستخراج حدودها.</div>}
               {extractedData.properties?.map((prop, pIdx) => (
                  <div key={`b_${pIdx}`} className="flex flex-col gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
                     <h5 className="text-sm font-black text-[#123f59] bg-white border border-slate-200 p-2.5 rounded-xl shadow-sm inline-block w-fit">
                        حدود وأطوال القطعة رقم: <span className="font-mono text-[#0e7490] mx-1">{prop.plotNumber || "---"}</span>
                     </h5>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {prop.boundaries?.map((b, bIdx) => (
                          <div key={bIdx} className="p-4 border border-slate-200 rounded-xl bg-white flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
                             <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                               <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 rounded-full bg-[#d8b46a]"></div>
                                 <span className="text-xs font-black text-[#123f59]">يحدها {b.direction}</span>
                               </div>
                               <select value={b.type || "شارع"} onChange={(e) => updateBoundary(pIdx, bIdx, 'type', e.target.value)} className="text-[10px] font-bold bg-slate-50 border border-slate-200 px-2 py-1 rounded outline-none text-slate-600">
                                 <option value="شارع">شارع</option><option value="قطعة">قطعة</option><option value="ممر">ممر</option><option value="مواقف">مواقف</option><option value="أخرى">أخرى</option>
                               </select>
                             </div>
                             <ReviewField label="وصف الحد (الجار)" value={b.desc} isTextarea onChange={(v) => updateBoundary(pIdx, bIdx, 'desc', v)} />
                             <div className="flex items-center gap-3 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                               <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">طول الحد (بالمتر):</span>
                               <ConfidenceInput value={b.length} className="font-mono font-black text-[#0e7490] bg-white text-center h-8" onChange={(v) => updateBoundary(pIdx, bIdx, 'length', v)} />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
          )}

          {activeReviewTab === "owners" && (
             <div className="overflow-hidden border border-slate-200 rounded-2xl shadow-sm bg-white">
               <table className="w-full text-right text-xs">
                  <thead className="bg-[#123f59] text-white">
                    <tr>
                      <th className="p-4 font-black">اسم المالك</th>
                      <th className="p-4 font-black">الهوية / السجل</th>
                      <th className="p-4 font-black w-24">النسبة %</th>
                      <th className="p-4 font-black text-center w-20">رئيسي؟</th>
                      <th className="p-4 w-12 text-center">إزالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {extractedData.owners?.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-400">لا يوجد ملاك.</td></tr>}
                    {extractedData.owners?.map((owner, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-3"><ConfidenceInput value={owner.name} onChange={(v) => updateOwner(idx, 'name', v)} /></td>
                        <td className="p-3 font-mono"><ConfidenceInput value={owner.identityNumber} onChange={(v) => updateOwner(idx, 'identityNumber', v)} /></td>
                        <td className="p-3 font-mono"><ConfidenceInput value={owner.percentage} type="number" onChange={(v) => updateOwner(idx, 'percentage', v)} /></td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center">
                             <input type="checkbox" checked={owner.isMain} onChange={(e) => updateOwner(idx, 'isMain', e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-[#0e7490] focus:ring-[#0e7490] cursor-pointer" />
                          </div>
                        </td>
                        <td className="p-3 text-center">
                           <button onClick={() => setExtractedData(p => ({...p, owners: p.owners.filter((_, i) => i !== idx)}))} className="p-1.5 bg-rose-50 text-rose-500 rounded hover:bg-rose-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
               <div className="p-3 border-t border-slate-100 bg-slate-50">
                 <button onClick={() => setExtractedData(p => ({...p, owners: [...p.owners, {name:"", identityNumber:"", percentage:"", isMain:false}]}))} className="text-xs font-black text-[#0e7490] hover:underline flex items-center gap-1">+ إضافة مالك جديد</button>
               </div>
             </div>
          )}

           {activeReviewTab === "restrictions" && (
              <div className="flex flex-col gap-5 bg-white p-5 border border-slate-200 rounded-2xl shadow-sm">
                <div className={`p-5 border-2 rounded-xl flex items-center justify-between transition-colors ${extractedData.restrictions?.hasRestrictions === "مرهون" ? "border-rose-300 bg-rose-50" : extractedData.restrictions?.hasRestrictions === "إيقاف" ? "border-amber-300 bg-amber-50" : "border-emerald-300 bg-emerald-50"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${extractedData.restrictions?.hasRestrictions === "مرهون" ? "bg-rose-100" : extractedData.restrictions?.hasRestrictions === "إيقاف" ? "bg-amber-100" : "bg-emerald-100"}`}>
                       <ShieldAlert className={`w-6 h-6 ${extractedData.restrictions?.hasRestrictions === "مرهون" ? "text-rose-600" : extractedData.restrictions?.hasRestrictions === "إيقاف" ? "text-amber-600" : "text-emerald-600"}`} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-500">حالة القيود المانعة للتصرف:</span>
                      <span className={`text-lg font-black ${extractedData.restrictions?.hasRestrictions === "مرهون" ? "text-rose-800" : extractedData.restrictions?.hasRestrictions === "إيقاف" ? "text-amber-800" : "text-emerald-800"}`}>
                        {extractedData.restrictions?.hasRestrictions}
                      </span>
                    </div>
                  </div>
                  <select value={extractedData.restrictions?.hasRestrictions || "لا يوجد"} onChange={(e) => updateRestrictions('hasRestrictions', e.target.value)} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-black outline-none shadow-sm focus:border-[#0e7490] cursor-pointer">
                    <option value="لا يوجد">لا يوجد قيود</option><option value="مرهون">مرهون</option><option value="إيقاف">إيقاف صك</option>
                  </select>
                </div>

                {extractedData.restrictions?.hasRestrictions !== "لا يوجد" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                     <ReviewField label="الجهة المرتهنة / الموقفة" value={extractedData.restrictions?.restrictedTo} confidence={0.95} onChange={(v) => updateRestrictions('restrictedTo', v)} />
                     <ReviewField label="قيمة الرهن (ريال)" value={extractedData.restrictions?.value} confidence={0.88} fontMono type="number" onChange={(v) => updateRestrictions('value', v)} />
                     <div className="col-span-1 md:col-span-2">
                       <ReviewField label="النص الحرفي للقيد أو التهميش بالصك" value={extractedData.restrictions?.text} confidence={0.99} isTextarea onChange={(v) => updateRestrictions('text', v)} />
                     </div>
                   </div>
                )}
              </div>
           )}
        </div>
      </div>
    );
  };

  const renderStep5Save = () => (
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300 py-4">
      <div className="text-center mb-4">
        <h3 className="text-xl font-black text-[#123f59]">المرحلة الأخيرة: الاعتماد والربط التشغيلي</h3>
        <p className="text-sm font-bold text-slate-500 mt-2">اختر الإجراء المناسب لإدخال هذه الوثيقة في دورة العمل.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto w-full">
        {[
          { id: "ARCHIVE_ONLY", title: "حفظ في الأرشيف المركزي فقط", desc: "أرشفة الوثيقة وتجهيزها للرجوع إليها مستقبلاً بدون ربطها بمشروع حالي.", icon: FileSearch, color: "text-slate-600", bg: "bg-slate-100", border: "border-slate-300" },
          { id: "LINK_EXISTING", title: "ربط بملف ملكية / مشروع قائم", desc: "تحديث ملف ملكية (صك) موجود مسبقاً في النظام ببيانات هذه الوثيقة وإصداراتها.", icon: LinkIcon, color: "text-indigo-600", bg: "bg-indigo-100", border: "border-indigo-400" },
          { id: "CREATE_NEW", title: "إنشاء ملف ملكية جديد (بداية مشروع)", desc: "فتح ملف ملكية جديد فوراً باستخدام بيانات هذه الوثيقة كقاعدة للمشروع القادم.", icon: Building2, color: "text-emerald-600", bg: "bg-emerald-100", border: "border-emerald-400" },
        ].map(action => (
          <div 
            key={action.id}
            onClick={() => setSaveAction(action.id)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col gap-4 ${saveAction === action.id ? `border-[#0e7490] shadow-md bg-[#f8fbfc]` : "border-slate-200 bg-white hover:border-[#0e7490]/40"}`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${saveAction === action.id ? `${action.bg} ${action.border} ${action.color}` : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                <action.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col flex-1">
                <span className={`text-base font-black ${saveAction === action.id ? "text-[#123f59]" : "text-slate-700"}`}>{action.title}</span>
                <span className="text-[11px] font-bold text-slate-500 mt-1 leading-relaxed">{action.desc}</span>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${saveAction === action.id ? "border-[#0e7490] bg-[#0e7490]" : "border-slate-300"}`}>
                {saveAction === action.id && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
              </div>
            </div>

            {/* الحقل الإضافي للبحث عن مشروع */}
            {saveAction === "LINK_EXISTING" && action.id === "LINK_EXISTING" && (
              <div className="mt-2 ml-[4.5rem] animate-in slide-in-from-top-2">
                <label className="text-[10px] font-black text-indigo-800 mb-1.5 block">بحث عن ملف الملكية / المشروع</label>
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="اكتب رقم أو اسم المشروع (مثال: OWN-1234)" 
                    value={selectedPropertyId} 
                    onChange={(e) => setSelectedPropertyId(e.target.value)} 
                    className="w-full pl-3 pr-9 py-3 bg-white border border-indigo-200 rounded-xl text-xs font-black text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all shadow-inner" 
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const isNextDisabled = () => (currentStep === 1 && files.length === 0) || (currentStep === 5 && saveAction === "LINK_EXISTING" && !selectedPropertyId);
  const handleNext = () => currentStep === 2 ? startAiAnalysis() : setCurrentStep(p => Math.min(5, p + 1));

  // ==========================================
  // 🖼️ 1. وضع النافذة المصغرة (Widget)
  // ==========================================
  if (isMinimized) {
    return (
      <div className="fixed bottom-6 left-6 z-[200] w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-8 font-[Tajawal]" dir="rtl">
        <div className="bg-gradient-to-l from-[#123f59] to-[#0e7490] px-4 py-3 flex items-center justify-between text-white shadow-sm">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-[#d8b46a] animate-pulse" />
            <span className="text-xs font-black">جاري تحليل الأرشيف...</span>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsMinimized(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors" title="استعادة النافذة"><Maximize2 className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="p-5 bg-slate-50 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-bold text-slate-600 truncate">{aiMessage}</p>
            <span className="text-[10px] font-black text-[#0e7490] font-mono">{aiProgress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden shadow-inner">
            <div className="bg-gradient-to-l from-[#d8b46a] to-[#0e7490] h-full rounded-full transition-all duration-500 relative" style={{ width: `${aiProgress}%` }}>
               <div className="absolute top-0 bottom-0 right-0 left-0 bg-white/20 w-full animate-[shimmer_1.5s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🖼️ 2. وضع النافذة العادية (Full Modal)
  // ==========================================
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 font-[Tajawal]" dir="rtl">
      <div className={`bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${currentStep === 4 ? "w-[1000px] h-[90vh]" : "w-[650px] max-h-[90vh]"}`}>
        
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#123f59] to-[#0e7490] flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-[#d8b46a]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-black text-[#123f59]">نظام الأرشفة الذكي لوثائق الملكية</h2>
              <span className="text-[11px] font-bold text-slate-500">الخطوة {currentStep} من 5</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper Bar */}
        {currentStep !== 3 && (
          <div className="shrink-0 px-8 pt-5 pb-3 bg-white">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 -translate-y-1/2 right-0 left-0 h-1.5 bg-slate-100 rounded-full z-0 shadow-inner"></div>
              <div className="absolute top-1/2 -translate-y-1/2 right-0 h-1.5 bg-[#0e7490] rounded-full z-0 transition-all duration-500 shadow-[0_0_10px_rgba(14,116,144,0.3)]" style={{ width: `${(currentStep - 1) * 25}%` }}></div>
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-4 transition-all duration-300 ${currentStep === step ? "bg-white border-[#0e7490] text-[#0e7490] shadow-lg scale-110" : currentStep > step ? "bg-[#0e7490] border-[#0e7490] text-white" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                  {currentStep > step && step !== 3 ? <Check className="w-5 h-5" strokeWidth={3} /> : step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className={`flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar ${currentStep === 4 ? "bg-[#f8fafc]" : "bg-white"}`}>
          {currentStep === 1 && renderStep1Upload()}
          {currentStep === 2 && renderStep2Classification()}
          {currentStep === 3 && renderStep3Analysis()}
          {currentStep === 4 && renderStep4Review()}
          {currentStep === 5 && renderStep5Save()}
        </div>

        {/* Modal Footer Controls */}
        {currentStep !== 3 && (
          <div className="shrink-0 p-5 md:px-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-6 py-3 rounded-xl text-xs font-black flex items-center gap-2 transition-all ${currentStep === 1 ? "opacity-0 pointer-events-none" : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 shadow-sm"}`}
            >
              <ChevronRight className="w-4 h-4" /> العودة للسابق
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="px-8 py-3 rounded-xl text-xs font-black bg-[#123f59] text-white hover:bg-[#0e7490] hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentStep === 2 ? "بدء التحليل الآلي (AI)" : "المتابعة للخطوة التالية"} <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                disabled={isNextDisabled() || isSubmitting}
                className="px-10 py-3 rounded-xl text-sm font-black bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSubmitting ? "جاري الحفظ والاعتماد..." : "اعتماد وحفظ الوثيقة"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Micro Components (Inputs for the Review Step) ---
const ReviewField = ({ label, value, confidence, onChange, type = "text", fontMono = false, isTextarea = false }) => {
  const isLow = confidence && confidence < 0.8;
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <label className="text-[11px] font-black text-slate-500">{label}</label>
        {confidence && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm border ${isLow ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>{Math.round(confidence * 100)}%</span>}
      </div>
      <ConfidenceInput value={value} confidence={confidence} onChange={onChange} type={type} fontMono={fontMono} isTextarea={isTextarea} />
    </div>
  );
};

const ConfidenceInput = ({ value, confidence, onChange, type, fontMono, isTextarea, className = "" }) => {
  const isLow = confidence && confidence < 0.8;
  const cls = `w-full p-3 text-xs font-black outline-none rounded-xl border-2 transition-colors ${isLow ? "bg-amber-50/40 border-amber-300 focus:border-amber-500 text-amber-900" : "bg-white border-slate-200 focus:border-[#0e7490] text-[#123f59] focus:shadow-[0_0_0_4px_rgba(14,116,144,0.1)]"} ${fontMono ? "font-mono" : ""} ${className}`;
  
  // تحويل القيمة إلى String لتجنب أخطاء React عند استلام أرقام (Numbers) في حقل نصي
  const safeValue = value !== null && value !== undefined ? String(value) : "";

  return isTextarea 
    ? <textarea value={safeValue} onChange={e=>onChange(e.target.value)} className={`${cls} h-24 resize-none leading-relaxed`} /> 
    : <input type={type} value={safeValue} onChange={e=>onChange(e.target.value)} className={cls} />;
};