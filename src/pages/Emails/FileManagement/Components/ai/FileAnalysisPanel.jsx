import React, { useState, useEffect } from 'react';
import { FileSearch, CheckCircle2, AlertCircle, Calendar, Link as LinkIcon, Building2, X, FileText } from 'lucide-react';

export function FileAnalysisPanel({ file, onClose, onApprove }) {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);

  // Fake AI Processing Delay
  useEffect(() => {
    setTimeout(() => {
      setResult({
        expectedType: 'مخطط إنشائي (PDF)',
        relatedEntity: 'مكتب الرؤية للتصميم',
        issueDate: '2026-04-10',
        expiryDate: 'لا يوجد',
        referenceNumber: 'STR-2026-092',
        isOfficial: true,
        isMissingInfo: false,
        reviewNotes: 'الملف مطابق للاشتراطات الفنية ولا يحتوي على صفحات فارغة.',
        linkageSuggestions: ['معاملة #1024 - فيلا سكنية بحي الملقا']
      });
      setLoading(false);
    }, 2000);
  }, [file]);

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4 bg-white rounded-3xl w-full max-w-sm">
        <div className="relative w-16 h-16 mx-auto">
           <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-ping"></div>
           <div className="absolute inset-2 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
             <FileSearch className="w-6 h-6 text-white animate-pulse" />
           </div>
        </div>
        <div>
          <h3 className="font-black text-indigo-900 text-lg">جاري التحليل الشامل للملف...</h3>
          <p className="text-sm font-bold text-slate-500 mt-1">يتم استخراج البيانات والتحقق من التواريخ والمراجع</p>
        </div>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div className="p-6 bg-white rounded-3xl border border-indigo-100 shadow-2xl max-w-lg w-full relative overflow-hidden" dir="rtl">
      
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
            <SparklesIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">نتائج التحليل الذكي</h2>
            <p className="text-xs font-bold text-slate-500 truncate max-w-[200px]">{file.name || 'ملف مستند'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 relative">
        {/* Core Info */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">النوع المتوقع</span>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-slate-800">{result.expectedType}</span>
            </div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col gap-1">
            <span className="text-[10px] font-black text-slate-400 uppercase">الجهة المصدرة/المرتبطة</span>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-bold text-slate-800">{result.relatedEntity}</span>
            </div>
          </div>
        </div>

        {/* Dates & Refs */}
        <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3">
           <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-slate-600 font-bold">
               <Calendar className="w-4 h-4" /> تاريخ الإصدار
             </div>
             <span className="font-black text-slate-800">{result.issueDate}</span>
           </div>
           <div className="flex items-center justify-between text-sm">
             <div className="flex items-center gap-2 text-slate-600 font-bold">
               <Calendar className="w-4 h-4 text-rose-500" /> تاريخ الانتهاء
             </div>
             <span className="font-black text-rose-600">{result.expiryDate}</span>
           </div>
           <div className="border-t border-slate-200 my-2"></div>
           <div className="flex items-center justify-between text-sm">
             <span className="text-slate-600 font-bold">الرقم المرجعي المستخرج</span>
             <span className="font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800 tracking-wider flex items-center gap-1">
                {result.referenceNumber}
             </span>
           </div>
        </div>

        {/* Status flags */}
        <div className="flex gap-2">
           <span className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black tracking-wide border ${result.isOfficial ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
             {result.isOfficial ? 'وثيقة رسمية خارجية' : 'مستند داخلي'}
           </span>
           <span className={`flex-1 text-center py-1.5 rounded-lg text-[10px] font-black tracking-wide border ${!result.isMissingInfo ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
             {!result.isMissingInfo ? 'مكتمل البيانات' : 'ينقصه بيانات أساسية'}
           </span>
        </div>

        {/* Linkage Suggestions */}
        {result.linkageSuggestions && result.linkageSuggestions.length > 0 && (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
             <LinkIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
             <div>
               <p className="text-xs font-black text-blue-900 mb-1">اقتراح ربط بمعاملات قائمة:</p>
               {result.linkageSuggestions.map((ls, i) => (
                  <p key={i} className="text-xs font-bold text-blue-700 underline cursor-pointer hover:text-blue-800">{ls}</p>
               ))}
             </div>
          </div>
        )}

        {/* Notes */}
        {result.reviewNotes && (
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
             <div>
               <p className="text-xs font-black text-amber-900">ملاحظات الفحص الآلي</p>
               <p className="text-xs font-bold text-amber-700 mt-1 leading-relaxed">{result.reviewNotes}</p>
             </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
         <button onClick={onClose} className="px-4 py-2 text-xs font-black text-slate-500 hover:bg-slate-50 rounded-xl transition">تجاهل</button>
         <button className="px-4 py-2 text-xs font-black text-indigo-600 hover:bg-indigo-50 border border-indigo-100 rounded-xl transition">تعديل الاستخراج</button>
         <button onClick={() => { onApprove(result); onClose(); }} className="px-4 py-2 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition flex items-center gap-2">
            اعتماد وربط <CheckCircle2 className="w-4 h-4" />
         </button>
      </div>
    </div>
  );
}

function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/>
    </svg>
  );
}