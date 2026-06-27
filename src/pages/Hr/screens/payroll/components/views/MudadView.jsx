// src/pages/Hr/screens/payroll/components/views/MudadView.jsx
import React, { useState } from "react";
import { Sparkles, UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import api from "../../../../../../api/axios";

export default function MudadView({ refreshData, setActiveView }) {
  const [mudadFile, setMudadFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleMudadUpload = async (e) => {
    e.preventDefault();
    if (!mudadFile) return toast.error("يرجى اختيار ملف مسير مدد أولاً");
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", mudadFile);

    try {
      const res = await api.post('/payrolls/upload-mudad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || "تم تحليل مسير مدد والمطابقة بنجاح");
      setMudadFile(null);
      refreshData();
      setActiveView("HISTORY");
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع وتحليل ملف مدد");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="h-20 w-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles size={40} />
          </div>
          <h2 className="text-2xl font-black text-[#123f59]">مطابقة منصة مُدد (AI)</h2>
          <p className="text-gray-500 font-bold mt-2">ارفع ملف المسير المعتمد من منصة مدد ليقوم الذكاء الاصطناعي بمطابقته وإغلاق الدفعات تلقائياً.</p>
        </div>

        <div className="w-full bg-white/60 border-2 border-dashed border-purple-400 rounded-3xl p-10 text-center hover:bg-white transition-all relative group overflow-hidden mb-8">
          <input type="file" accept=".pdf,.xlsx,.csv" onChange={(e) => setMudadFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
          <div className="relative z-10 pointer-events-none flex flex-col items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 ${mudadFile ? "bg-purple-500 text-white" : "bg-purple-50 text-purple-500"}`}>
              {mudadFile ? <CheckCircle2 size={32} /> : <UploadCloud size={32} />}
            </div>
            <div>
              <p className="text-xl font-black text-[#123f59]">{mudadFile ? mudadFile.name : "اسحب وافلت ملف مدد هنا أو اضغط للاختيار"}</p>
              <p className="text-sm font-bold text-gray-500 mt-2">يدعم ملفات Excel, CSV, PDF</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3 items-start">
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
            <p className="text-xs font-bold text-amber-800 leading-relaxed">
              سيقوم النظام بقراءة رواتب الموظفين ومطابقتها مع السجلات المعتمدة، وتغيير حالة الراتب إلى "مدفوع".
            </p>
          </div>
          <button onClick={handleMudadUpload} disabled={isAnalyzing || !mudadFile} className="shrink-0 px-8 h-14 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-700 text-base font-black text-white shadow-lg transition-all hover:shadow-xl hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:transform-none">
            {isAnalyzing ? <><Loader2 size={24} className="animate-spin" /> جاري التحليل...</> : <><Sparkles size={24} /> بدء المطابقة</>}
          </button>
        </div>
      </div>
    </div>
  );
}