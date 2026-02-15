import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import api from "../../api/axios";
import {
  FileUp,
  Loader2,
  CheckCircle2,
  Search,
  FileText,
  ShieldCheck,
  Zap,
  Save,
  RefreshCcw,
  Layers,
  ChevronLeft,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { Card, CardContent } from "../../components/ui/card";
import { InputWithCopy } from "../../components/InputWithCopy";
import { toast } from "react-hot-toast";

export const PropertyAIWorkspace = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analysisStep, setAnalysisStep] = useState(0); // 0: Idle, 1: Uploading, 2: Analyzing, 3: Review
  const [progress, setProgress] = useState(0);
  const [extractedDocs, setExtractedDocs] = useState([]); // مصفوفة الصكوك الثمانية
  const [selectedIdx, setSelectedIdx] = useState(0); // مؤشر الصك المختار للعرض

  // محاكاة التقدم أثناء معالجة الصفحات المتعددة
  useEffect(() => {
    let interval;
    if (analysisStep === 2) {
      interval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 800); // إبطاء المؤشر لأن معالجة 8 صفحات تأخذ وقتاً
    }
    return () => clearInterval(interval);
  }, [analysisStep]);

  const aiMutation = useMutation({
    mutationFn: async (formData) => {
      setAnalysisStep(1);
      const res = await api.post("/properties/extract-ai", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (p) => {
          const percent = Math.round((p.loaded * 30) / p.total); // الرفع يمثل 30% فقط
          setProgress(percent);
          if (percent >= 30) setAnalysisStep(2);
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.success) {
        setExtractedDocs(data.documents);
        setAnalysisStep(3);
        setProgress(100);
        toast.success(`تم استخراج ${data.documents.length} صكوك بنجاح`);
      } else {
        throw new Error(data.error);
      }
    },
    onError: (err) => {
      setAnalysisStep(0);
      setProgress(0);
      toast.error(err.message || "فشل في تحليل الملفات");
    },
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const startAnalysis = () => {
    const fd = new FormData();
    fd.append("file", file);
    aiMutation.mutate(fd);
  };

  // واجهة التحميل والرفع
  if (analysisStep < 3) {
    return (
      <div className="flex items-center justify-center min-h-full bg-slate-50 p-6">
        <Card className="w-full max-w-xl shadow-2xl border-none">
          <CardContent className="p-12 text-center">
            {analysisStep === 0 ? (
              <div className="space-y-6">
                <div className="mx-auto w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Layers size={36} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    معالج الصكوك المتعددة
                  </h2>
                  <p className="text-slate-500 mt-2 text-sm">
                    ارفع ملف PDF يحتوي على عدة صكوك وسنقوم بفرزها آلياً
                  </p>
                </div>
                <input
                  type="file"
                  id="bulk-upload"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf"
                />
                <label
                  htmlFor="bulk-upload"
                  className="block p-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-blue-50 transition-all"
                >
                  <span className="text-slate-600 font-medium">
                    {file ? file.name : "اختر ملف PDF الصكوك"}
                  </span>
                </label>
                {file && (
                  <Button
                    onClick={startAnalysis}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold rounded-xl"
                  >
                    بدء تحليل {file.name} <Zap className="mr-2" size={18} />
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-8 py-4">
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-slate-100 stroke-current"
                      strokeWidth="8"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-blue-600 stroke-current transition-all duration-500"
                      strokeWidth="8"
                      strokeDasharray={251}
                      strokeDashoffset={251 - (251 * progress) / 100}
                      strokeLinecap="round"
                      fill="transparent"
                      r="40"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-2xl text-slate-800">
                    {progress}%
                  </div>
                </div>
                <div className="animate-pulse">
                  <h3 className="text-lg font-bold text-blue-600">
                    جاري تحليل الصفحات بالتوازي...
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    يتم الآن قراءة البيانات من 8 صفحات مختلفة
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentDoc = extractedDocs[selectedIdx];

  // واجهة المراجعة الاحترافية
  return (
    <div className="flex h-full bg-slate-50 overflow-hidden animate-in fade-in duration-700">
      {/* 1. القائمة الجانبية للصكوك المكتشفة */}
      <div className="w-80 bg-white border-l flex flex-col shadow-xl z-20">
        <div className="p-6 border-b bg-slate-50/50">
          <h2 className="text-sm font-bold text-slate-800">
            الصكوك المكتشفة ({extractedDocs.length})
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">
            انقر للمراجعة والتبديل
          </p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {extractedDocs.map((doc, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`w-full p-4 rounded-xl text-right transition-all border ${
                selectedIdx === idx
                  ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white border-slate-100 hover:border-blue-200 text-slate-600"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${selectedIdx === idx ? "bg-blue-500 text-white" : "bg-slate-100"}`}
                >
                  صفحة {doc.page}
                </span>
                {doc.success && (
                  <CheckCircle2
                    size={12}
                    className={
                      selectedIdx === idx ? "text-blue-200" : "text-emerald-500"
                    }
                  />
                )}
              </div>
              <div className="text-xs font-bold truncate">
                {doc.documentNo || "بيانات ناقصة"}
              </div>
              <div className="text-[10px] opacity-70 mt-1">
                {doc.ownerName || "لم يتم التعرف على المالك"}
              </div>
            </button>
          ))}
        </div>
        <div className="p-4 bg-slate-50 border-t">
          <Button
            onClick={() => setAnalysisStep(0)}
            variant="outline"
            className="w-full text-xs h-10 border-slate-200"
          >
            <RefreshCcw size={12} className="ml-2" /> رفع ملف جديد
          </Button>
        </div>
      </div>

      {/* 2. منطقة العرض والمراجعة */}
      <div className="flex-1 flex overflow-hidden">
        {/* معاينة الصك */}
        <div className="flex-1 p-6 flex flex-col border-l">
          <div className="bg-white rounded-2xl shadow-inner border border-slate-200 flex-1 overflow-hidden relative">
            <iframe
              src={`${previewUrl}#page=${currentDoc.page}`}
              className="w-full h-full border-none"
            />
          </div>
        </div>

        {/* نموذج البيانات */}
        <div className="w-[450px] bg-white overflow-y-auto p-8 shadow-2xl z-10">
          <div className="mb-10">
            <h3 className="text-xl font-bold text-slate-800 mb-2">
              مراجعة الصك الحالي
            </h3>
            <p className="text-xs text-slate-400">
              يرجى التأكد من مطابقة أرقام الصفحة {currentDoc.page} مع البيانات
              أدناه
            </p>
          </div>

          <div className="space-y-8">
            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest border-b pb-2">
                بيانات الصك الأساسية
              </h4>
              <InputWithCopy
                label="رقم الصك"
                value={currentDoc?.documentNo || ""}
              />
              <InputWithCopy
                label="تاريخ الصك"
                value={currentDoc?.documentDate || ""}
              />
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest border-b pb-2">
                التفاصيل الفنية
              </h4>
              <InputWithCopy
                label="المساحة الإجمالية (م٢)"
                value={currentDoc?.areaSqm || ""}
                className="font-mono font-bold text-blue-800"
              />
              <InputWithCopy
                label="اسم المالك"
                value={currentDoc?.ownerName || ""}
              />
            </section>

            <div className="pt-10 flex gap-3">
              <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-14 font-bold rounded-xl shadow-lg shadow-emerald-100 transition-transform active:scale-95">
                <Save size={18} className="ml-2" /> اعتماد وحفظ الصك
              </Button>
              <Button
                variant="outline"
                className="h-14 px-6 border-slate-200 text-slate-400"
              >
                تجاهل
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
