import React, { useState } from 'react';
import { Clock, Search, Plus, Eye, AlertCircle, UploadCloud, Activity, Send, Settings } from 'lucide-react';

export default function HistoryTab({ logs = [] }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 💡 دالة لتحديد الأيقونة واللون بناءً على الحدث لكي يبقى التصميم احترافياً كما هو
  const getLogStyle = (actionText) => {
    if (actionText.includes('إنشاء')) return { icon: Plus, bg: 'bg-emerald-100', text: 'text-emerald-600' };
    if (actionText.includes('فتح')) return { icon: Eye, bg: 'bg-indigo-100', text: 'text-indigo-600' };
    if (actionText.includes('فشل') || actionText.includes('خطأ')) return { icon: AlertCircle, bg: 'bg-rose-100', text: 'text-rose-600' };
    if (actionText.includes('رفع') || actionText.includes('تنزيل')) return { icon: UploadCloud, bg: 'bg-blue-100', text: 'text-blue-600' };
    if (actionText.includes('إرسال') || actionText.includes('مشاركة')) return { icon: Send, bg: 'bg-emerald-100', text: 'text-emerald-600' };
    if (actionText.includes('تغيير') || actionText.includes('تحديث')) return { icon: Settings, bg: 'bg-slate-200', text: 'text-slate-700' };
    return { icon: Activity, bg: 'bg-slate-100', text: 'text-slate-600' }; // افتراضي
  };

  // 💡 تنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('ar-SA', { 
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  // فلترة السجل بناءً على البحث
  const filteredLogs = logs.filter(log => 
    log.action.includes(searchTerm) || 
    log.target.includes(searchTerm) || 
    log.user.includes(searchTerm)
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/30 overflow-hidden">
      <div className="p-6 border-b border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
         <div className="flex items-center gap-3">
           <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
             <Clock className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-lg font-black text-slate-800">السجل الشامل (Audit Trail)</h2>
             <p className="text-[10px] font-bold text-slate-500">مراقبة توثيقية لجميع الحركات التي تمت على الروابط والملفات.</p>
           </div>
         </div>
         <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="ابحث في السجل..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" 
              />
           </div>
           <select className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 outline-none">
             <option>كل الأحداث</option>
             <option>إنشاء/تعديل</option>
             <option>تحميل/رفع</option>
             <option>أخطاء/محاولات</option>
           </select>
         </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar animate-in fade-in zoom-in-95 duration-200">
        <div className="max-w-4xl mx-auto space-y-3">
          {filteredLogs.map((log) => {
            const style = getLogStyle(log.action);
            return (
              <div key={log.id} className="flex gap-4 p-4 border border-slate-200 bg-white rounded-2xl hover:border-indigo-200 transition-colors shadow-sm group">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${style.bg} ${style.text} shadow-inner`}>
                   <style.icon className="w-4 h-4" />
                 </div>
                 <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-1.5">
                       <p className="text-xs font-black text-slate-800">{log.action}</p>
                       <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">{formatDate(log.createdAt)}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
                       <span><span className="font-bold text-slate-400">المنفذ:</span> {log.user}</span>
                       <span className="text-slate-300">•</span>
                       <span><span className="font-bold text-slate-400">التفاصيل:</span> {log.target}</span>
                       {log.meta && (
                         <>
                           <span className="text-slate-300">•</span>
                           <span className="text-indigo-500 font-bold">{log.meta}</span>
                         </>
                       )}
                    </div>
                 </div>
              </div>
            )
          })}
          {filteredLogs.length === 0 && (
             <div className="text-center py-12">
               <p className="text-xs font-bold text-slate-400">لا توجد سجلات لعرضها</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}