import React, { useState, useCallback } from "react";
import { 
  CloudUpload, 
  Trash2, 
  Brain, 
  Loader2, 
  FileText, 
  Image as ImageIcon, 
  FileCheck,
  Minimize2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import api from "../../../api/axios"; // تأكد من مسار الأكسيوس لديك

export default function UploadAnalysisStep({ onAnalysisStarted, onClose }) {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // حالات الرفع: 'idle' | 'uploading' | 'success' | 'error'
  const [uploadStatus, setUploadStatus] = useState('idle');
  const [uploadProgress, setUploadProgress] = useState(0);

  // ===================== دوال السحب والإفلات =====================
  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  // ===================== دوال مساعدة للواجهة =====================
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
    if (type.includes('image')) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    return <FileCheck className="w-5 h-5 text-indigo-500" />;
  };

  const formatSize = (bytes) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // ===================== دالة الإرسال للسيرفر =====================
  const startAnalysis = async (runInBackground = false) => {
    if (files.length === 0) return;
    setUploadStatus('uploading');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await api.post("/archived-projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      if (response.data.success) {
        setUploadStatus('success');
        
        // إعطاء المستخدم فرصة لرؤية علامة النجاح لمدة ثانية قبل الانتقال
        setTimeout(() => {
          if (runInBackground && onClose) {
            onClose(); // إغلاق المودال بالكامل والعودة للجدول
          } else {
            onAnalysisStarted(response.data.data.projectId); // الانتقال لشاشة التفاصيل
          }
        }, 1200);
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus('error');
    }
  };

  // ===================== شاشة تقدم الرفع (Uploading State) =====================
  if (uploadStatus === 'uploading' || uploadStatus === 'success') {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-50/50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center">
          {uploadStatus === 'uploading' ? (
            <>
              <div className="relative w-20 h-20 mx-auto mb-6">
                <svg className="animate-spin w-full h-full text-indigo-100" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600 font-black text-sm">
                  {uploadProgress}%
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">جاري رفع الملفات للسيرفر...</h3>
              <p className="text-sm font-bold text-slate-500 mb-8">سيبدأ الذكاء الاصطناعي بالتحليل فور اكتمال الرفع.</p>
              
              {/* زر العمل في الخلفية */}
              <button 
                onClick={() => onClose()} 
                className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-black transition-colors flex items-center justify-center gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                إخفاء ومتابعة في الخلفية
              </button>
            </>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">تم الرفع بنجاح!</h3>
              <p className="text-sm font-bold text-slate-500">جاري توجيهك لشاشة المراجعة...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== شاشة الخطأ (Error State) =====================
  if (uploadStatus === 'error') {
    return (
      <div className="flex-1 p-8 flex flex-col items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-rose-100 shadow-xl text-center">
          <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">حدث خطأ أثناء الرفع</h3>
          <p className="text-sm font-bold text-slate-500 mb-8">تعذر إرسال الملفات للسيرفر، يرجى المحاولة مرة أخرى.</p>
          <button 
            onClick={() => setUploadStatus('idle')} 
            className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-black transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  // ===================== الشاشة الرئيسية (Idle State) =====================
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full">
        
        {/* العناوين */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-indigo-100/50">
            <CloudUpload className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
            المستندات الهندسية والقانونية
          </h2>
          <p className="text-sm font-bold text-slate-500 max-w-lg mx-auto leading-relaxed">
            ارفع رخص البناء، الصكوك، والكروكيات. سيقوم محرك الذكاء الاصطناعي (Gemini AI) بقراءة وتفريغ البيانات تلقائياً بدقة عالية.
          </p>
        </div>

        {/* منطقة السحب والإفلات */}
        <div 
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`relative overflow-hidden transition-all duration-300 ease-out border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center mb-8
            ${isDragging 
              ? "border-indigo-500 bg-indigo-50 scale-[1.02] shadow-xl shadow-indigo-100" 
              : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50"
            }`}
        >
          {/* دائرة خلفية للزينة */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
          
          <div className="relative z-10">
            <h3 className={`text-base font-black mb-2 transition-colors ${isDragging ? "text-indigo-700" : "text-slate-700"}`}>
              {isDragging ? "أفلت الملفات هنا الآن..." : "اسحب وأفلت الملفات هنا"}
            </h3>
            <p className="text-xs font-bold text-slate-400 mb-6">
              يدعم الصيغ: PDF, PNG, JPG, DWG (الحد الأقصى 50MB)
            </p>
            <label className="px-8 py-3.5 bg-white text-indigo-600 rounded-xl text-sm font-black hover:bg-indigo-50 transition-all border border-indigo-200 cursor-pointer shadow-sm hover:shadow active:scale-95 inline-flex items-center gap-2">
              <CloudUpload className="w-4 h-4" />
              تصفح الملفات يدوياً
              <input multiple className="hidden" type="file" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        {/* قائمة الملفات */}
        {files.length > 0 && (
          <div className="mb-8 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-700 mb-4 px-2 flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px]">
                {files.length}
              </span>
              الملفات المرفوعة للتحليل
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {files.map((file, index) => (
                <div key={index} className="bg-slate-50 p-3 border border-slate-100 rounded-xl flex items-center justify-between hover:border-slate-200 transition-colors group">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-sm shrink-0">
                      {getFileIcon(file.type || file.name)}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-700 truncate" dir="ltr">{file.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5">{formatSize(file.size)}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => removeFile(index)} 
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                    title="حذف الملف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* أزرار الإجراءات */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {/* زر المتابعة الفورية */}
          <button
            onClick={() => startAnalysis(false)}
            disabled={files.length === 0}
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:bg-indigo-700 hover:shadow-[0_0_25px_rgba(79,70,229,0.4)] disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Brain className="w-5 h-5" />
            تحليل فوري ومراجعة النتائج
          </button>
          
          {/* زر العمل في الخلفية */}
          <button
            onClick={() => startAnalysis(true)}
            disabled={files.length === 0}
            className="px-6 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl text-sm font-black shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 active:scale-95"
            title="إرسال الملفات والعودة لعملك، سيعمل الذكاء الاصطناعي في الخلفية"
          >
            <Minimize2 className="w-4 h-4 text-slate-400" />
            تحليل في الخلفية وإغلاق
          </button>
        </div>

      </div>
    </div>
  );
}