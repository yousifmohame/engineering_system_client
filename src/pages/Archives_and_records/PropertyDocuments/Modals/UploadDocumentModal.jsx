import React, { useState, useRef, useEffect } from "react";
import {
  X, UploadCloud, FileText, BrainCircuit, FileSearch, ShieldAlert,
  CheckCircle2, ChevronRight, ChevronLeft, Save, Map, Users, AlertTriangle,
  FileBadge, Check, Building2, Link as LinkIcon, Search, Trash2, Loader2, Minimize2, Maximize2, MessageSquare, Layers
} from "lucide-react";
import { toast } from "sonner";
import axios from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";

// ==========================================================================================
// 🚀 المكون الرئيسي: نافذة رفع وتحليل وثيقة الملكية (Liquid Glass & Enterprise Grade)
// ==========================================================================================
export const UploadDocumentModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  // --- Background UX & Queue State ---
  const [isMinimized, setIsMinimized] = useState(false);
  const isMinimizedRef = useRef(false);
  const [archiveDocId, setArchiveDocId] = useState(null); 
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

  // --- State: Step 4 (Review - MULTIPLE DEEDS SUPPORT) ---
  const [extractedDeeds, setExtractedDeeds] = useState([]); // مصفوفة الصكوك
  const [currentDeedIndex, setCurrentDeedIndex] = useState(0); // مؤشر الصك الحالي
  const [activeReviewTab, setActiveReviewTab] = useState("basic");

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
      setExtractedDeeds([]);
      setCurrentDeedIndex(0);
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
  // 🧠 1. دالة الرفع والتحليل (Upload & Enqueue)
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
        setAiMessage("جاري إرسال الملف لمحرك الذكاء الاصطناعي المركزي...");

        try {
          const response = await axios.post("/doc-archive/analyze", { 
            imageBase64,
            originalFileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            uploadNotes,
            userId: user?.id || user?.userId
          });
          
          const { dbJobId, archiveDocId: newArchiveDocId } = response.data.data;
          setArchiveDocId(newArchiveDocId); 
          
          setAiProgress(25);
          setAiMessage("الملف الآن في الطابور بانتظار دورة التحليل...");

          pollIntervalRef.current = setInterval(async () => {
            try {
              const jobsRes = await axios.get("/ai-dashboard/jobs");
              const currentJob = jobsRes.data.data?.find(j => j.id === dbJobId);

              if (currentJob) {
                setAiProgress(currentJob.progress);
                
                if (currentJob.status === "PROCESSING") {
                  setAiMessage(`يتم الآن قراءة واستخراج البيانات... ${currentJob.progress}%`);
                } 
                else if (currentJob.status === "COMPLETED") {
                  clearInterval(pollIntervalRef.current);
                  setAiMessage("اكتمل التحليل! جاري تهيئة البيانات...");
                  
                  // ============================================================
                  // 🛡️ المحلل الشرس لفك التشفير المزدوج (Aggressive Unwrapping)
                  // ============================================================
                  let parsedAiData = [];
                  try {
                    let rawData = currentJob.result;
                    console.log("📦 1. Raw Data from Backend:", rawData);

                    // 1. فك التشفير التكراري (حتى نضمن تحوله من نص إلى مصفوفة/كائن)
                    let attempts = 0;
                    while (typeof rawData === 'string' && attempts < 5) {
                        try {
                            const cleanedString = rawData.replace(/```json/gi, "").replace(/```/g, "").trim();
                            rawData = JSON.parse(cleanedString);
                            console.log(`📦 2. Unwrapped (Attempt ${attempts + 1}):`, rawData);
                            attempts++;
                        } catch(parseErr) {
                            break; // إذا فشل الـ Parse، نتوقف
                        }
                    }

                    // 2. معالجة تغليف الكائنات (إن وجد)
                    if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
                       const possibleKeys = ["data", "documents", "deeds", "records", "result"];
                       for (const key of possibleKeys) {
                         if (rawData[key] && Array.isArray(rawData[key])) {
                           rawData = rawData[key];
                           break;
                         }
                       }
                       // إذا استمر كونه كائناً (صك واحد)، نضعه في مصفوفة
                       if (!Array.isArray(rawData) && rawData.basic) {
                         rawData = [rawData];
                       }
                    }

                    console.log("📦 3. Final Array before mapping:", rawData);

                    // 3. التأكد النهائي والهيكلة
                    const finalArray = Array.isArray(rawData) ? rawData : [rawData];

                    parsedAiData = finalArray.map(doc => ({
                      aiConfidenceScore: doc?.aiConfidenceScore || 95,
                      aiNotes: doc?.aiNotes || "",
                      basic: {
                        docType: doc?.basic?.docType || "",
                        docSource: doc?.basic?.docSource || "",
                        documentNumber: doc?.basic?.documentNumber || "",
                        propertyNumber: doc?.basic?.propertyNumber || "",
                        issueDate: doc?.basic?.issueDate || "",
                        versionNumber: String(doc?.basic?.versionNumber || ""),
                        operationType: doc?.basic?.operationType || "",
                        previousDocNumber: doc?.basic?.previousDocNumber || ""
                      },
                      properties: Array.isArray(doc?.properties) ? doc.properties.map(p => ({
                         city: p?.city || "", district: p?.district || "", planNumber: String(p?.planNumber || ""),
                         plotNumber: String(p?.plotNumber || ""), area: p?.area || 0, areaText: p?.areaText || "",
                         usageType: p?.usageType || "", propertyType: p?.propertyType || "",
                         boundaries: Array.isArray(p?.boundaries) ? p.boundaries : []
                      })) : [],
                      owners: Array.isArray(doc?.owners) ? doc.owners.map(o => ({
                         name: o?.name || "", identityNumber: String(o?.identityNumber || ""), 
                         percentage: o?.percentage || 100, nationality: o?.nationality || "سعودي", isMain: !!o?.isMain
                      })) : [],
                      restrictions: {
                         hasRestrictions: doc?.restrictions?.hasRestrictions || "لا يوجد",
                         restrictedTo: doc?.restrictions?.restrictedTo || "",
                         value: doc?.restrictions?.value || 0,
                         text: doc?.restrictions?.text || ""
                      }
                    }));

                    console.log("✅ 4. Parsed and Mapped Successfully!", parsedAiData);

                  } catch (e) {
                    console.error("Frontend Parse Error:", e);
                    toast.error("تحذير: البيانات المستخرجة غير مهيكلة بشكل صحيح.");
                    parsedAiData = [{ basic: {}, properties: [], owners: [], restrictions: {} }];
                  }

                  if (isMinimizedRef.current) {
                    toast.success("اكتمل تحليل الوثائق في الخلفية، تجدها في الأرشيف.", { duration: 6000 });
                    onClose();
                  } else {
                    setExtractedDeeds(parsedAiData);
                    setCurrentDeedIndex(0);
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
            } catch (pollErr) { /* Silent ignore */ }
          }, 2000);

        } catch (error) {
          toast.error("فشل في الاتصال بمحرك التحليل.");
          setCurrentStep(2);
        }
      };
    } catch (error) {
      toast.error("حدث خطأ غير متوقع.");
      setCurrentStep(2);
    }
  };

  // ==========================================
  // 💾 2. دالة التحديث والاعتماد النهائي (Save Array)
  // ==========================================
  const handleFinalSave = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        aiDataArray: extractedDeeds, 
        saveAction: saveAction,
        selectedPropertyId: selectedPropertyId || null,
        uploadNotes: uploadNotes,
        isFinalApproval: true, 
        userId: user?.id || user?.userId
      };

      const response = await axios.put(`/doc-archive/${archiveDocId}`, payload);
      
      if (response.data.success) {
        toast.success(response.data.message || "تم اعتماد الوثائق وحفظ التعديلات بنجاح!");
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الاعتماد.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // ✍️ دوال تحديث الحالة داخل المصفوفة العميقة
  // ==========================================
  const updateBasic = (field, value) => {
    setExtractedDeeds(prev => {
      const newDeeds = [...prev];
      newDeeds[currentDeedIndex] = { ...newDeeds[currentDeedIndex], basic: { ...newDeeds[currentDeedIndex].basic, [field]: value } };
      return newDeeds;
    });
  };

  const updateProperty = (idx, field, value) => {
    setExtractedDeeds(prev => {
      const newDeeds = [...prev];
      const props = [...(newDeeds[currentDeedIndex].properties || [])];
      props[idx] = { ...props[idx], [field]: value };
      newDeeds[currentDeedIndex] = { ...newDeeds[currentDeedIndex], properties: props };
      return newDeeds;
    });
  };

  const updateBoundary = (pIdx, bIdx, field, value) => {
    setExtractedDeeds(prev => {
      const newDeeds = [...prev];
      const props = [...(newDeeds[currentDeedIndex].properties || [])];
      const bounds = [...(props[pIdx].boundaries || [])];
      bounds[bIdx] = { ...bounds[bIdx], [field]: value };
      props[pIdx] = { ...props[pIdx], boundaries: bounds };
      newDeeds[currentDeedIndex] = { ...newDeeds[currentDeedIndex], properties: props };
      return newDeeds;
    });
  };

  const updateOwner = (idx, field, value) => {
    setExtractedDeeds(prev => {
      const newDeeds = [...prev];
      const owners = [...(newDeeds[currentDeedIndex].owners || [])];
      owners[idx] = { ...owners[idx], [field]: value };
      newDeeds[currentDeedIndex] = { ...newDeeds[currentDeedIndex], owners: owners };
      return newDeeds;
    });
  };

  const updateRestrictions = (field, value) => {
    setExtractedDeeds(prev => {
      const newDeeds = [...prev];
      newDeeds[currentDeedIndex] = { ...newDeeds[currentDeedIndex], restrictions: { ...newDeeds[currentDeedIndex].restrictions, [field]: value } };
      return newDeeds;
    });
  };

  // ==========================================
  // 🎨 واجهات الخطوات (Steps UI)
  // ==========================================

  const renderStep1Upload = () => (
    <div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-2">
        <h3 className="text-2xl font-black text-[#123f59] drop-shadow-sm">رفع وثيقة ملكية</h3>
        <p className="text-sm font-bold text-slate-500/80 mt-1">أرفق الملف (أو مجمع الملفات) وأضف ملاحظاتك.</p>
      </div>

      <div onClick={() => fileInputRef.current?.click()} className="relative w-full h-52 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer bg-white/30 backdrop-blur-xl border-2 border-white/60 hover:border-[#0e7490]/50 hover:bg-white/50 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] group overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#123f59]/5 to-[#0e7490]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="p-4 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white mb-4 transform group-hover:-translate-y-1 transition-transform duration-300">
          <UploadCloud className="w-10 h-10 text-[#0e7490]" />
        </div>
        <p className="text-base font-black text-[#123f59] z-10">اضغط هنا لاختيار ملف (أو اسحب وأفلت)</p>
        <p className="text-xs font-bold text-slate-400 mt-2 z-10">PDF, JPG, PNG (أقصى حجم 30MB)</p>
        <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={(e) => setFiles(Array.from(e.target.files))} />
      </div>

      {files.length > 0 && (
        <div className="max-h-32 overflow-y-auto pr-1 custom-scrollbar flex flex-col gap-3">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-lg border border-white/60 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.03)]">
              <div className="flex items-center gap-4">
                <div className="p-2.5 bg-gradient-to-br from-[#d8b46a] to-amber-500 rounded-xl shadow-inner border border-white/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-[#123f59] truncate max-w-[250px]">{file.name}</span>
                  <span className="text-[11px] text-[#0e7490] font-mono font-bold mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              <button onClick={() => setFiles(files.filter((_, i) => i !== idx))} className="p-2 text-rose-400 hover:text-rose-600 hover:bg-rose-50/50 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-xs font-black text-[#123f59] flex items-center gap-1.5 ml-1">
          <MessageSquare className="w-4 h-4 text-[#0e7490]" /> ملاحظات الموظف التوضيحية
        </label>
        <textarea
          value={uploadNotes}
          onChange={(e) => setUploadNotes(e.target.value)}
          placeholder="مثال: هذا الملف يحتوي على 8 صكوك مجمعة لمشروع الياسمين..."
          className="w-full h-24 p-4 bg-white/40 backdrop-blur-md border border-white/60 rounded-2xl text-sm font-bold text-[#123f59] focus:bg-white/60 focus:border-[#0e7490]/50 outline-none resize-none transition-all shadow-inner placeholder:text-slate-400"
        ></textarea>
      </div>
    </div>
  );

  const renderStep2Classification = () => {
    const docTypes = [
      { id: "صكوك مجمعة", label: "ملف مجمع (عدة صكوك)", desc: "يحتوي على أكثر من وثيقة مستقلة", icon: Layers },
      { id: "صك تسجيل ملكية", label: "صك تسجيل ملكية", desc: "صادر من السجل العقاري العيني", icon: FileBadge },
      { id: "وثيقة تملك عقار", label: "وثيقة تملك عقار", desc: "صادر من وزارة العدل أو البورصة", icon: FileText },
      { id: "غير مصنف", label: "دع الذكاء الاصطناعي يقرر", desc: "تحليل ذكي تلقائي لجميع المحتويات", icon: BrainCircuit },
    ];
    return (
      <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500">
        <div className="text-center mb-2">
          <h3 className="text-2xl font-black text-[#123f59]">مساعدة محرك التحليل (اختياري)</h3>
          <p className="text-sm font-bold text-slate-500 mt-2">حدد طبيعة الملف لتسريع دقة استخراج القطع المتعددة.</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {docTypes.map(type => (
            <div key={type.id} onClick={() => setDocType(type.id)} className={`p-5 rounded-[1.5rem] cursor-pointer flex items-start gap-4 transition-all duration-300 border-2 ${docType === type.id ? "border-[#0e7490] bg-gradient-to-br from-[#0e7490]/10 to-transparent shadow-[0_8px_30px_rgba(14,116,144,0.15)] scale-[1.02]" : "border-white/60 bg-white/40 backdrop-blur-md hover:bg-white/60 hover:border-white"}`}>
              <div className={`p-3 rounded-2xl shadow-sm border ${docType === type.id ? "bg-gradient-to-br from-[#123f59] to-[#0e7490] border-[#0e7490] text-white" : "bg-white/50 border-white text-slate-500"}`}>
                <type.icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col mt-1">
                <span className={`text-sm font-black ${docType === type.id ? "text-[#123f59]" : "text-slate-600"}`}>{type.label}</span>
                <span className="text-[11px] font-bold text-slate-400/90 mt-1 leading-relaxed">{type.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep3Analysis = () => (
    <div className="flex flex-col items-center justify-center py-16 gap-8 animate-in zoom-in-95 duration-700">
      <div className="relative flex items-center justify-center w-36 h-36">
        <div className="absolute inset-0 rounded-full border-4 border-[#0e7490]/20 animate-ping"></div>
        <div className="absolute inset-4 rounded-full border-4 border-[#d8b46a]/30 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-[#123f59] to-[#0e7490] w-24 h-24 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(14,116,144,0.5)] z-10 border border-white/20">
          <BrainCircuit className="w-12 h-12 text-white animate-bounce" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-3 text-center w-full max-w-lg">
        <h3 className="text-2xl font-black text-[#123f59] drop-shadow-sm">جاري الاستخراج العميق للبيانات...</h3>
        <p className="text-sm font-bold text-[#0e7490] h-6">{aiMessage}</p>
        
        <div className="w-full bg-slate-200/50 backdrop-blur-sm rounded-full h-4 mt-4 overflow-hidden shadow-inner border border-white/40 p-0.5">
          <div className="bg-gradient-to-r from-[#d8b46a] via-[#0e7490] to-[#123f59] h-full rounded-full transition-all duration-500 relative" style={{ width: `${aiProgress}%` }}>
            <div className="absolute top-0 bottom-0 right-0 left-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
        <span className="text-xs font-black text-[#123f59] mt-2 font-mono bg-white/50 px-3 py-1 rounded-lg border border-white/50">{aiProgress}%</span>
      </div>

      <div className="mt-8 p-5 bg-amber-50/50 backdrop-blur-md border border-amber-200/60 rounded-3xl max-w-md text-center shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
         <h4 className="text-sm font-black text-amber-800 mb-2 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> العمليات في الخلفية</h4>
         <p className="text-xs font-bold text-amber-700/80 leading-relaxed">
           هذه العملية قد تستغرق حتى دقيقة واحدة حسب عدد الصكوك في الملف. يمكنك المتابعة في الخلفية، وسيقوم النظام بالاحتفاظ بالنتائج للمراجعة لاحقاً.
         </p>
         <button 
          onClick={() => setIsMinimized(true)}
          className="mt-4 w-full px-5 py-3 bg-white/70 backdrop-blur-sm text-[#123f59] border border-amber-300/50 rounded-xl text-sm font-black flex items-center justify-center gap-2 hover:bg-amber-100/50 transition-colors shadow-sm"
        >
          <Minimize2 className="w-5 h-5" /> إخفاء النافذة ومتابعة العمل
        </button>
      </div>
      <style>{`@keyframes shimmer { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }`}</style>
    </div>
  );

  const renderStep4Review = () => {
    if (!extractedDeeds || extractedDeeds.length === 0) return null;
    
    const currentDeed = extractedDeeds[currentDeedIndex] || {};
    
    const tabs = [
      { id: "basic", label: "المعلومات الأساسية", icon: FileText, alerts: 0 }, 
      { id: "properties", label: "العقارات والحدود", icon: Building2, alerts: currentDeed.properties?.length === 0 ? 1 : 0 },
      { id: "owners", label: "بيانات الملاك", icon: Users, alerts: currentDeed.owners?.length === 0 ? 1 : 0 }, 
      { id: "restrictions", label: "القيود والرهون", icon: ShieldAlert, alerts: currentDeed.restrictions?.hasRestrictions !== "لا يوجد" ? 1 : 0 },
    ];

    return (
      <div className="flex flex-col h-full overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-8 duration-700">
        {/* شريط الإشعارات الذكي (Glassy) */}
        <div className="flex flex-col md:flex-row gap-4 mb-5 shrink-0">
          <div className="flex-1 bg-gradient-to-l from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-200/50 p-4 rounded-3xl flex items-start gap-4 shadow-[0_8px_30px_rgba(16,185,129,0.05)]">
            <div className="p-2 bg-emerald-500 rounded-full shadow-md"><CheckCircle2 className="w-6 h-6 text-white shrink-0" /></div>
            <div className="flex flex-col gap-1.5">
              <h4 className="text-sm font-black text-emerald-800">اكتمل الاستخراج ({currentDeed.aiConfidenceScore || 100}%)</h4>
              <p className="text-xs font-bold text-emerald-700/80 leading-relaxed">
                تم استخراج البيانات، يمكنك التعديل المباشر على الحقول أدناه. {extractedDeeds.length > 1 ? `يحتوي الملف على (${extractedDeeds.length}) وثائق.` : ''}
              </p>
            </div>
          </div>
          {(currentDeed.aiNotes || uploadNotes) && (
            <div className="flex-1 bg-white/40 backdrop-blur-xl border border-white/60 p-4 rounded-3xl flex flex-col gap-2 shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
               <h4 className="text-xs font-black text-[#123f59] flex items-center gap-1.5"><MessageSquare className="w-4 h-4 text-[#d8b46a]"/> ملاحظات المراجع الذكي</h4>
               <p className="text-[11px] font-bold text-slate-600 leading-relaxed max-h-12 overflow-y-auto custom-scrollbar-slim pr-1">{currentDeed.aiNotes || uploadNotes}</p>
            </div>
          )}
        </div>

        {/* 🚀 متصفح الصكوك المتعددة (إذا كان الملف مجمعاً) */}
        {extractedDeeds.length > 1 && (
          <div className="flex items-center gap-3 p-2 mb-5 overflow-x-auto custom-scrollbar-slim bg-white/30 backdrop-blur-xl border border-white/50 rounded-2xl shadow-inner shrink-0">
             <span className="text-xs font-black text-[#123f59] px-3 border-l border-white/50">تصفح الوثائق:</span>
             {extractedDeeds.map((_, idx) => (
                <button 
                  key={idx} 
                  onClick={() => setCurrentDeedIndex(idx)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 whitespace-nowrap border ${currentDeedIndex === idx ? "bg-gradient-to-r from-[#123f59] to-[#0e7490] text-white border-[#0e7490] shadow-md scale-105" : "bg-white/50 text-slate-600 border-white/60 hover:bg-white/80"}`}
                >
                  صك / وثيقة {idx + 1}
                </button>
             ))}
          </div>
        )}

        {/* قائمة التبويبات للوثيقة الحالية */}
        <div className="flex border-b border-white/40 gap-2 shrink-0 overflow-x-auto custom-scrollbar-slim pb-px">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveReviewTab(tab.id)} className={`px-5 py-3.5 flex items-center gap-2.5 border-b-[3px] text-xs font-black transition-all duration-300 whitespace-nowrap ${activeReviewTab === tab.id ? "border-[#0e7490] text-[#0e7490] bg-white/60 backdrop-blur-md rounded-t-2xl" : "border-transparent text-slate-500 hover:text-[#123f59] hover:bg-white/30 rounded-t-2xl"}`}>
              <tab.icon className={`w-4 h-4 ${activeReviewTab === tab.id ? "text-[#d8b46a]" : ""}`} />
              {tab.label}
              {tab.alerts > 0 && <span className="bg-rose-500 text-white px-1.5 py-0.5 rounded-md text-[10px] font-mono ml-1 shadow-sm">{tab.alerts}</span>}
            </button>
          ))}
        </div>

        {/* محتوى التبويبات (Glassy Container) */}
        <div className="p-2 pr-2 custom-scrollbar mt-4">
          
          {activeReviewTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ReviewField label="رقم الوثيقة / الصك" value={currentDeed.basic?.documentNumber} onChange={(v) => updateBasic('documentNumber', v)} confidence={0.99} fontMono />
              <ReviewField label="رقم العقار (للتسجيل العيني)" value={currentDeed.basic?.propertyNumber} onChange={(v) => updateBasic('propertyNumber', v)} fontMono />
              <ReviewField label="نوع الوثيقة" value={currentDeed.basic?.docType} onChange={(v) => updateBasic('docType', v)} />
              <ReviewField label="مصدر الإصدار" value={currentDeed.basic?.docSource} onChange={(v) => updateBasic('docSource', v)} />
              <ReviewField label="تاريخ الإصدار" value={currentDeed.basic?.issueDate} onChange={(v) => updateBasic('issueDate', v)} type="date" />
              <ReviewField label="نوع العملية" value={currentDeed.basic?.operationType} onChange={(v) => updateBasic('operationType', v)} />
              <ReviewField label="رقم الوثيقة السابقة (إن وجد)" value={currentDeed.basic?.previousDocNumber} onChange={(v) => updateBasic('previousDocNumber', v)} fontMono />
              <ReviewField label="رقم النسخة" value={currentDeed.basic?.versionNumber} onChange={(v) => updateBasic('versionNumber', v)} fontMono />
            </div>
          )}
          
          {activeReviewTab === "properties" && (
            <div className="flex flex-col gap-6">
              {currentDeed.properties?.length === 0 && <div className="p-10 text-center text-slate-500 font-bold border-2 border-dashed border-white/60 bg-white/30 backdrop-blur-sm rounded-3xl">لم يتم استخراج بيانات عقارات من هذه الوثيقة.</div>}
              {currentDeed.properties?.map((prop, idx) => (
                <div key={idx} className="p-6 border border-white/60 rounded-[2rem] bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.03)] flex flex-col gap-5 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-2.5 h-full bg-gradient-to-b from-[#d8b46a] to-[#123f59]"></div>
                  
                  <div className="flex justify-between items-center border-b border-white/50 pb-4">
                     <h5 className="text-sm font-black text-[#123f59] flex items-center gap-2"><Map className="w-5 h-5 text-[#0e7490]"/> بيانات القطعة رقم {idx + 1}</h5>
                     <span className="text-[10px] bg-white/70 px-3 py-1.5 rounded-lg text-[#123f59] font-black border border-white/60 shadow-sm">{prop.propertyType || "غير محدد"}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <ReviewField label="المدينة" value={prop.city} onChange={(v) => updateProperty(idx, 'city', v)} />
                    <ReviewField label="الحي" value={prop.district} onChange={(v) => updateProperty(idx, 'district', v)} />
                    <ReviewField label="رقم المخطط" value={prop.planNumber} onChange={(v) => updateProperty(idx, 'planNumber', v)} fontMono />
                    <ReviewField label="رقم القطعة" value={prop.plotNumber} onChange={(v) => updateProperty(idx, 'plotNumber', v)} fontMono />
                    <ReviewField label="المساحة (أرقام)" value={prop.area} onChange={(v) => updateProperty(idx, 'area', v)} type="number" fontMono />
                    <ReviewField label="الاستخدام المعتمد" value={prop.usageType} onChange={(v) => updateProperty(idx, 'usageType', v)} />
                    <div className="col-span-2 md:col-span-3">
                       <ReviewField label="المساحة نصاً (كتابةً)" value={prop.areaText} onChange={(v) => updateProperty(idx, 'areaText', v)} />
                    </div>
                  </div>

                  {/* 📍 قسم الحدود للقطعة الحالية */}
                  <div className="mt-4 p-5 bg-slate-50/50 backdrop-blur-sm rounded-2xl border border-white/50 shadow-inner">
                     <h6 className="text-xs font-black text-[#0e7490] mb-4">الحدود والأطوال (الاتجاهات الأربعة)</h6>
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {prop.boundaries?.map((b, bIdx) => (
                           <div key={bIdx} className="p-4 bg-white/70 border border-white/80 rounded-xl shadow-sm flex flex-col gap-3">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100/50">
                                <span className="text-xs font-black text-[#123f59]">يحدها {b.direction}</span>
                                <input value={b.type || ""} onChange={(e) => updateBoundary(idx, bIdx, 'type', e.target.value)} placeholder="شارع/قطعة" className="text-[10px] font-bold bg-white/50 border border-white/60 px-2 py-1 rounded-lg outline-none w-24 text-center" />
                              </div>
                              <ReviewField label="وصف الحد (الجار)" value={b.desc} onChange={(v) => updateBoundary(idx, bIdx, 'desc', v)} isTextarea className="h-16 text-[11px]" />
                              <div className="flex items-center justify-between mt-1 bg-white/40 p-2 rounded-lg border border-white/50">
                                <span className="text-[10px] font-black text-slate-500">الطول (م):</span>
                                <ConfidenceInput value={b.length} onChange={(v) => updateBoundary(idx, bIdx, 'length', v)} className="w-24 text-center font-mono text-[#0e7490] h-8 text-[11px] py-1" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeReviewTab === "owners" && (
             <div className="overflow-hidden border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)] bg-white/40 backdrop-blur-xl">
               <div className="overflow-x-auto">
                 <table className="w-full text-right text-xs">
                    <thead className="bg-[#123f59] text-white">
                      <tr>
                        <th className="p-4 font-black rounded-tr-[1.8rem]">الاسم الرباعي / الشركة</th>
                        <th className="p-4 font-black">رقم الهوية / السجل</th>
                        <th className="p-4 font-black w-24">النسبة %</th>
                        <th className="p-4 font-black">الجنسية</th>
                        <th className="p-4 font-black text-center w-20">رئيسي؟</th>
                        <th className="p-4 w-12 text-center rounded-tl-[1.8rem]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/50">
                      {currentDeed.owners?.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-bold">لا يوجد ملاك مستخرجين.</td></tr>}
                      {currentDeed.owners?.map((owner, idx) => (
                        <tr key={idx} className="hover:bg-white/50 transition-colors">
                          <td className="p-3"><ConfidenceInput value={owner.name} onChange={(v) => updateOwner(idx, 'name', v)} /></td>
                          <td className="p-3"><ConfidenceInput value={owner.identityNumber} onChange={(v) => updateOwner(idx, 'identityNumber', v)} fontMono /></td>
                          <td className="p-3"><ConfidenceInput value={owner.percentage} onChange={(v) => updateOwner(idx, 'percentage', v)} type="number" fontMono /></td>
                          <td className="p-3"><ConfidenceInput value={owner.nationality} onChange={(v) => updateOwner(idx, 'nationality', v)} /></td>
                          <td className="p-3 text-center">
                             <input type="checkbox" checked={owner.isMain} onChange={(e) => updateOwner(idx, 'isMain', e.target.checked)} className="w-5 h-5 rounded border-white/60 text-[#0e7490] focus:ring-[#0e7490] cursor-pointer" />
                          </td>
                          <td className="p-3 text-center">
                             <button onClick={() => {
                               setExtractedDeeds(prev => {
                                 const newDeeds = [...prev];
                                 newDeeds[currentDeedIndex].owners = newDeeds[currentDeedIndex].owners.filter((_, i) => i !== idx);
                                 return newDeeds;
                               });
                             }} className="p-2 bg-rose-500/10 text-rose-600 rounded-xl hover:bg-rose-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4"/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
               </div>
               <div className="p-4 bg-white/30 backdrop-blur-md border-t border-white/50">
                 <button onClick={() => {
                    setExtractedDeeds(prev => {
                      const newDeeds = [...prev];
                      if (!newDeeds[currentDeedIndex].owners) newDeeds[currentDeedIndex].owners = [];
                      newDeeds[currentDeedIndex].owners.push({name:"", identityNumber:"", percentage:"", nationality:"سعودي", isMain:false});
                      return newDeeds;
                    });
                 }} className="text-xs font-black text-[#0e7490] hover:text-[#123f59] flex items-center gap-1.5 transition-colors">+ إضافة مالك يدوياً</button>
               </div>
             </div>
          )}

           {activeReviewTab === "restrictions" && (
              <div className="flex flex-col gap-6 p-6 bg-white/40 backdrop-blur-xl border border-white/60 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                <div className={`p-6 border-2 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500 ${currentDeed.restrictions?.hasRestrictions === "مرهون" ? "border-rose-400 bg-gradient-to-r from-rose-500/10 to-rose-500/5" : currentDeed.restrictions?.hasRestrictions === "إيقاف" ? "border-amber-400 bg-gradient-to-r from-amber-500/10 to-amber-500/5" : "border-emerald-400 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5"}`}>
                  <div className="flex items-center gap-5">
                    <div className={`p-4 rounded-full shadow-inner border border-white/50 ${currentDeed.restrictions?.hasRestrictions === "مرهون" ? "bg-rose-500" : currentDeed.restrictions?.hasRestrictions === "إيقاف" ? "bg-amber-500" : "bg-emerald-500"}`}>
                       <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-600">حالة القيود المانعة للتصرف للوثيقة:</span>
                      <span className={`text-xl font-black mt-1 ${currentDeed.restrictions?.hasRestrictions === "مرهون" ? "text-rose-800" : currentDeed.restrictions?.hasRestrictions === "إيقاف" ? "text-amber-800" : "text-emerald-800"}`}>
                        {currentDeed.restrictions?.hasRestrictions || "لا يوجد"}
                      </span>
                    </div>
                  </div>
                  <select value={currentDeed.restrictions?.hasRestrictions || "لا يوجد"} onChange={(e) => updateRestrictions('hasRestrictions', e.target.value)} className="w-full md:w-auto p-3.5 rounded-xl bg-white/80 backdrop-blur-md border border-white text-sm font-black outline-none shadow-sm focus:border-[#0e7490] cursor-pointer text-[#123f59]">
                    <option value="لا يوجد">لا يوجد قيود (سليم)</option><option value="مرهون">عقار مرهون</option><option value="إيقاف">إيقاف صك / نزاع</option>
                  </select>
                </div>

                {currentDeed.restrictions?.hasRestrictions !== "لا يوجد" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-6 bg-slate-50/50 backdrop-blur-sm border border-white/60 rounded-[1.5rem] shadow-inner animate-in fade-in zoom-in-95">
                     <ReviewField label="الجهة المرتهنة / الموقفة" value={currentDeed.restrictions?.restrictedTo} onChange={(v) => updateRestrictions('restrictedTo', v)} />
                     <ReviewField label="قيمة الرهن (ريال)" value={currentDeed.restrictions?.value} onChange={(v) => updateRestrictions('value', v)} type="number" fontMono />
                     <div className="col-span-1 md:col-span-2">
                       <ReviewField label="النص الحرفي للقيد أو التهميش بالصك" value={currentDeed.restrictions?.text} onChange={(v) => updateRestrictions('text', v)} isTextarea className="h-24" />
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
    <div className="flex flex-col gap-6 animate-in slide-in-from-right-8 duration-500 py-6">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-black text-[#123f59] drop-shadow-sm">الاعتماد والربط التشغيلي</h3>
        <p className="text-sm font-bold text-slate-500 mt-2">كيف تريد إدخال {extractedDeeds.length > 1 ? `هذه الوثائق (${extractedDeeds.length})` : 'هذه الوثيقة'} في دورة عمل المكتب؟</p>
      </div>

      <div className="grid grid-cols-1 gap-5 max-w-3xl mx-auto w-full">
        {[
          { id: "ARCHIVE_ONLY", title: "حفظ في الأرشيف المركزي فقط", desc: "أرشفة الوثائق وحفظ بياناتها للرجوع إليها مستقبلاً في قسم البحث والتوثيق.", icon: FileSearch, bgFrom: "from-slate-100", bgTo: "to-white", border: "border-slate-300", accent: "text-slate-600" },
          { id: "LINK_EXISTING", title: "ربط بملف ملكية / مشروع قائم", desc: "تحديث ملف ملكية موجود مسبقاً في النظام بهذه الوثائق وإضافتها كسجل جديد تحته.", icon: LinkIcon, bgFrom: "from-indigo-100", bgTo: "to-indigo-50/50", border: "border-indigo-400", accent: "text-indigo-600" },
          { id: "CREATE_NEW", title: "تأسيس ملفات ملكية جديدة (مشاريع)", desc: "فتح ملف ملكية تشغيلي جديد لكل صك، ليكون جاهزاً لإصدار العروض والعقود.", icon: Building2, bgFrom: "from-emerald-100", bgTo: "to-emerald-50/50", border: "border-emerald-400", accent: "text-emerald-600" },
        ].map(action => (
          <div 
            key={action.id}
            onClick={() => setSaveAction(action.id)}
            className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group
              ${saveAction === action.id ? `border-[#0e7490] shadow-[0_10px_40px_rgba(14,116,144,0.15)] bg-gradient-to-br ${action.bgFrom} ${action.bgTo} scale-[1.02]` : "border-white/60 bg-white/40 backdrop-blur-md hover:bg-white/70"}`}
          >
            <div className="flex items-center gap-5 z-10">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm transition-all duration-300 ${saveAction === action.id ? `bg-white ${action.border} ${action.accent} scale-110` : "bg-white/50 border-white/60 text-slate-400 group-hover:text-slate-500"}`}>
                <action.icon className="w-7 h-7" />
              </div>
              <div className="flex flex-col flex-1">
                <span className={`text-lg font-black ${saveAction === action.id ? "text-[#123f59]" : "text-slate-700"}`}>{action.title}</span>
                <span className="text-xs font-bold text-slate-500 mt-1.5 leading-relaxed">{action.desc}</span>
              </div>
              <div className={`w-7 h-7 rounded-full border-[3px] flex items-center justify-center shrink-0 transition-colors ${saveAction === action.id ? "border-[#0e7490] bg-[#0e7490]" : "border-white/80 bg-white/30"}`}>
                {saveAction === action.id && <div className="w-3 h-3 bg-white rounded-full"></div>}
              </div>
            </div>

            {/* الحقل الإضافي للبحث عن مشروع */}
            {saveAction === "LINK_EXISTING" && action.id === "LINK_EXISTING" && (
              <div className="mt-3 ml-20 animate-in slide-in-from-top-4 duration-300 z-10">
                <label className="text-[11px] font-black text-indigo-800 mb-2 block">ابحث عن كود المشروع أو اسم العميل</label>
                <div className="relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                  <input 
                    type="text" 
                    placeholder="مثال: OWN-2026-991" 
                    value={selectedPropertyId} 
                    onChange={(e) => setSelectedPropertyId(e.target.value)} 
                    className="w-full pl-4 pr-12 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-indigo-200 rounded-xl text-sm font-black text-[#123f59] outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all" 
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
  // 🖼️ 1. وضع النافذة المصغرة (Background Widget)
  // ==========================================
  if (isMinimized) {
    return (
      <div className="fixed bottom-8 left-8 z-[200] w-80 bg-white/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-white overflow-hidden animate-in slide-in-from-bottom-12 font-[Tajawal] duration-500" dir="rtl">
        <div className="bg-gradient-to-l from-[#123f59] to-[#0e7490] px-5 py-4 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center gap-3">
            <BrainCircuit className="w-6 h-6 text-[#d8b46a] animate-pulse" />
            <span className="text-sm font-black tracking-wide">التحليل العميق يعمل...</span>
          </div>
          <button onClick={() => setIsMinimized(false)} className="hover:bg-white/20 p-2 rounded-xl transition-colors backdrop-blur-md" title="استعادة الشاشة"><Maximize2 className="w-5 h-5" /></button>
        </div>
        <div className="p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <p className="text-[11px] font-bold text-slate-600 truncate max-w-[200px]">{aiMessage}</p>
            <span className="text-xs font-black text-[#0e7490] font-mono bg-cyan-50 px-2 py-0.5 rounded-lg border border-cyan-100">{aiProgress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-200">
            <div className="bg-gradient-to-l from-[#d8b46a] to-[#0e7490] h-full rounded-full transition-all duration-500 relative" style={{ width: `${aiProgress}%` }}>
               <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🖼️ 2. وضع النافذة العادية (Liquid Glass Full Modal)
  // ==========================================
  
  // تحديد حجم النافذة: تتوسع إلى 80% في خطوة المراجعة لراحة العين
  const modalSizeClasses = currentStep === 4 
    ? "w-[85vw] md:w-[80vw] h-[90vh] md:h-[85vh]" 
    : "w-[90vw] md:w-[700px] max-h-[90vh]";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 md:p-6 font-[Tajawal]" dir="rtl">
      <div className={`relative flex flex-col overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_8px_40px_rgba(0,0,0,0.12)] rounded-[2.5rem] ${modalSizeClasses}`}>
        
        {/* Modal Header */}
        <div className="shrink-0 flex items-center justify-between p-6 md:p-8 border-b border-white/50 bg-white/40 backdrop-blur-md">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#123f59] to-[#0e7490] flex items-center justify-center shadow-lg border border-white/20">
              <FileText className="w-7 h-7 text-[#d8b46a]" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-[#123f59] drop-shadow-sm">معالج الأرشفة الذكي للوثائق العقارية</h2>
              <span className="text-xs font-bold text-slate-500 mt-1">الخطوة {currentStep} من 5</span>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50/80 rounded-2xl transition-all hover:scale-105 border border-transparent hover:border-rose-100 bg-white/50 backdrop-blur-sm shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stepper Bar (Liquid style) */}
        {currentStep !== 3 && (
          <div className="shrink-0 px-10 pt-6 pb-4 bg-white/20 backdrop-blur-sm">
            <div className="flex items-center justify-between relative">
              <div className="absolute top-1/2 -translate-y-1/2 right-0 left-0 h-2 bg-white/60 rounded-full z-0 shadow-inner border border-white/40"></div>
              <div className="absolute top-1/2 -translate-y-1/2 right-0 h-2 bg-gradient-to-l from-[#123f59] to-[#0e7490] rounded-full z-0 transition-all duration-700 shadow-[0_0_15px_rgba(14,116,144,0.4)]" style={{ width: `${(currentStep - 1) * 25}%` }}></div>
              {[1, 2, 3, 4, 5].map(step => (
                <div key={step} className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black border-4 transition-all duration-500 ${currentStep === step ? "bg-white border-[#0e7490] text-[#0e7490] shadow-[0_8px_20px_rgba(14,116,144,0.3)] scale-110 rotate-3" : currentStep > step ? "bg-gradient-to-br from-[#123f59] to-[#0e7490] border-transparent text-white shadow-md" : "bg-white/60 backdrop-blur-md border-white text-slate-400"}`}>
                  {currentStep > step && step !== 3 ? <Check className="w-6 h-6" strokeWidth={3} /> : step}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative">
          {/* Subtle gradient background for the body */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/30 pointer-events-none"></div>
          <div className="relative z-10 h-full">
            {currentStep === 1 && renderStep1Upload()}
            {currentStep === 2 && renderStep2Classification()}
            {currentStep === 3 && renderStep3Analysis()}
            {currentStep === 4 && renderStep4Review()}
            {currentStep === 5 && renderStep5Save()}
          </div>
        </div>

        {/* Modal Footer Controls */}
        {currentStep !== 3 && (
          <div className="shrink-0 p-6 md:px-10 border-t border-white/50 bg-white/40 backdrop-blur-xl flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(p => Math.max(1, p - 1))}
              disabled={currentStep === 1 || isSubmitting}
              className={`px-6 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-all duration-300 ${currentStep === 1 ? "opacity-0 pointer-events-none" : "text-[#123f59] bg-white/70 backdrop-blur-md border border-white/80 hover:bg-white shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-md hover:-translate-x-1"}`}
            >
              <ChevronRight className="w-5 h-5" /> رجوع
            </button>
            
            {currentStep < 5 ? (
              <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className="px-8 py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-[#123f59] to-[#0e7490] text-white hover:shadow-[0_10px_25px_rgba(14,116,144,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2 border border-white/20 backdrop-blur-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {currentStep === 2 ? "بدء محرك الذكاء الاصطناعي" : "متابعة"} <ChevronLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleFinalSave}
                disabled={isNextDisabled() || isSubmitting}
                className="px-10 py-3.5 rounded-2xl text-sm font-black bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-[0_10px_30px_rgba(16,185,129,0.4)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 border border-white/20 backdrop-blur-md disabled:opacity-50 disabled:hover:translate-y-0"
              >
                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                {isSubmitting ? "جاري الاعتماد التشغيلي..." : "اعتماد وحفظ نهائي"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// =======================================================================
// --- Micro Components (Glassy Inputs for the Review Step) ---
// =======================================================================
const ReviewField = ({ label, value, confidence, onChange, type = "text", fontMono = false, isTextarea = false, className="" }) => {
  const isLow = confidence && confidence < 0.8;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex justify-between items-center px-1">
        <label className="text-[11px] font-black text-[#123f59]/80">{label}</label>
        {confidence && <span className={`text-[9px] font-black px-2 py-0.5 rounded-md shadow-sm border backdrop-blur-md ${isLow ? "bg-amber-100/50 text-amber-700 border-amber-200" : "bg-emerald-100/50 text-emerald-700 border-emerald-200"}`}>{Math.round(confidence * 100)}%</span>}
      </div>
      <ConfidenceInput value={value} confidence={confidence} onChange={onChange} type={type} fontMono={fontMono} isTextarea={isTextarea} />
    </div>
  );
};

const ConfidenceInput = ({ value, confidence, onChange, type, fontMono, isTextarea, className = "" }) => {
  const isLow = confidence && confidence < 0.8;
  const cls = `w-full p-3.5 text-xs font-black outline-none rounded-xl border-2 transition-all duration-300 shadow-inner backdrop-blur-md ${isLow ? "bg-amber-50/50 border-amber-300 focus:border-amber-500 text-amber-900 focus:bg-white" : "bg-white/50 border-white/60 focus:bg-white/80 focus:border-[#0e7490] text-[#123f59] focus:shadow-[0_0_0_4px_rgba(14,116,144,0.1)]"} ${fontMono ? "font-mono tracking-wider" : ""} ${className}`;
  
  const safeValue = value !== null && value !== undefined ? String(value) : "";

  return isTextarea 
    ? <textarea value={safeValue} onChange={e=>onChange(e.target.value)} className={`${cls} resize-none leading-relaxed`} /> 
    : <input type={type} value={safeValue} onChange={e=>onChange(e.target.value)} className={cls} />;
};