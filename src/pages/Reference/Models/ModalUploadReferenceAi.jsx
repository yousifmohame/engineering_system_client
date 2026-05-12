import React, { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { X, Brain, CloudUpload, FileText, Sparkles, Loader2 } from "lucide-react";
import api from "../../../api/axios";

export default function ModalUploadReferenceAi({ onClose, fixedCategory }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // حالات عمل الطابور في الخلفية
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(0);
  const [jobStatus, setJobStatus] = useState("");

  // دعم لصق الملفات (Ctrl+V)
  useEffect(() => {
    const handlePaste = (e) => {
      if (jobId) return; // لا تقبل اللصق إذا كان هناك تحليل جارٍ
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1 || items[i].type.indexOf("pdf") !== -1) {
          setFile(items[i].getAsFile());
          toast.success("تم التقاط الملف من الحافظة!");
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [jobId]);

  // دوال السحب والإفلات
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length > 0) setFile(e.dataTransfer.files[0]);
  };

  // 1. بدء المعالجة في الخلفية
  const startBackgroundAnalysis = async () => {
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append("file", file);

      if (fixedCategory) {
        fd.append("fixedCategory", fixedCategory); 
      }
      
      // 💡 يتم إرسال الطلب لـ API المراجع ليقوم برميه في الطابور (Worker)
      const res = await api.post("/references/analyze-async", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.jobId) {
        setJobId(res.data.jobId);
        setJobStatus("PENDING");
        setProgress(5);
        toast.info("تم استلام الملف وجاري تحليله في الخلفية...");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "فشل بدء التحليل.");
      setJobId(null);
    }
  };

  // 2. المتابعة التلقائية لعمل الذكاء الاصطناعي (Polling)
  useEffect(() => {
    let interval;
    if (jobId) {
      interval = setInterval(async () => {
        try {
          const res = await api.get(`/ai-dashboard/ai-jobs/${jobId}`);
          const job = res.data.data;
          
          setProgress(job.progress || 0);
          setJobStatus(job.status);

          if (job.status === 'COMPLETED') {
            clearInterval(interval);
            setJobId(null);
            setProgress(100);
            
            toast.success("تم استخراج، تصنيف وحفظ المرجع في المكتبة بنجاح! 🚀");
            queryClient.invalidateQueries(["reference-documents"]); // تحديث الجدول
            
            setTimeout(() => onClose(), 1500); // إغلاق النافذة
          } else if (job.status === 'FAILED') {
            clearInterval(interval);
            setJobId(null);
            toast.error(job.errorMessage || "فشل التحليل الذكي.");
          }
        } catch (error) {
          console.error("خطأ المتابعة:", error);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center flex flex-col items-center relative overflow-hidden">
        <button onClick={onClose} className="absolute top-4 left-4 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
          <X size={20} />
        </button>
        
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-5 relative">
          <Brain className="w-8 h-8 text-purple-600" />
        </div>
        
        <h3 className="text-xl font-black text-slate-800 mb-2">أرشفة المراجع بالذكاء الاصطناعي</h3>
        <p className="text-xs text-slate-500 font-bold mb-6 leading-relaxed px-2">
          ارفع ملف الدليل أو التعميم، وسيقوم النظام باستخراج عنوانه، تصنيفه تلقائياً، وإنشاء التلخيص له.
        </p>

        {jobId ? (
          <div className="w-full flex flex-col items-center py-4">
             <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-500 ease-out flex items-center justify-end pr-2" style={{ width: `${progress}%` }}>
                   <span className="text-[8px] text-white font-black">{progress}%</span>
                </div>
             </div>
             <div className="flex items-center gap-2 text-purple-700 font-bold text-sm animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin" />
                {jobStatus === 'PROCESSING' ? 'جاري قراءة وتلخيص المرجع...' : 'جاري التحضير...'}
             </div>
             <button
               onClick={() => {
                 toast.info("جاري استكمال التحليل في الخلفية. سيظهر المرجع في الجدول فور الانتهاء.");
                 onClose();
               }}
               className="mt-6 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors border border-slate-200"
             >
               إخفاء ومتابعة في الخلفية ⏱️
             </button>
          </div>
        ) : (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-2xl p-8 mb-6 cursor-pointer transition-all duration-300 group
                ${isDragging ? "border-purple-500 bg-purple-50 scale-105 shadow-lg" : 
                  file ? "border-emerald-300 bg-emerald-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-purple-300"}`}
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <FileText className="w-10 h-10 text-emerald-500 mb-2" />
                  <div className="text-sm font-bold text-emerald-700 truncate px-2 max-w-[250px]">{file.name}</div>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="mt-2 text-[10px] bg-red-100 text-red-600 px-3 py-1 rounded-lg font-bold hover:bg-red-200 transition-colors">إزالة وتغيير</button>
                </div>
              ) : (
                <>
                  <CloudUpload className={`w-12 h-12 mx-auto mb-3 transition-colors ${isDragging ? "text-purple-600" : "text-slate-400 group-hover:text-purple-500"}`} />
                  <div className="text-sm font-black text-slate-700">اسحب وافلت المستند هنا</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">أو اضغط للاختيار، أو الصق (Ctrl+V)</div>
                </>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <button
              onClick={startBackgroundAnalysis}
              disabled={!file}
              className="w-full py-3.5 bg-purple-600 text-white font-black rounded-xl hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all"
            >
              <Sparkles className="w-5 h-5" /> البدء بالتحليل والأرشفة
            </button>
          </>
        )}
      </div>
    </div>
  );
}