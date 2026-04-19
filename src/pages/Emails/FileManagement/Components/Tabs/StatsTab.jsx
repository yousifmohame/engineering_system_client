import React from 'react';
import { Activity, Send, Search, Sparkles } from 'lucide-react';

export default function StatsTab({ stats = {} }) {
  
  // دمج بيانات الباك إند الحقيقية في مصفوفة العرض
  const dynamicStats = [
    { l: 'روابط نشطة', v: stats.activeLinks || 0, c: 'text-emerald-600', bg: 'bg-emerald-50', line: 'bg-emerald-200' },
    { l: 'إرسالات مكتملة', v: stats.totalSent || 0, c: 'text-indigo-600', bg: 'bg-indigo-50', line: 'bg-indigo-200' },
    { l: 'ملفات مستلمة', v: stats.totalReceived || 0, c: 'text-blue-600', bg: 'bg-blue-50', line: 'bg-blue-200' },
    { l: 'ملفات قيد الفرز', v: stats.pendingFiles || 0, c: 'text-amber-600', bg: 'bg-amber-50', line: 'bg-amber-200' },
    
    // قيم افتراضية لإبقاء التصميم مكتملاً
    { l: 'روابط منتهية', v: 0, c: 'text-rose-600', bg: 'bg-rose-50', line: 'bg-rose-200' },
    { l: 'متوسط الملفات/الطلب', v: 0, c: 'text-slate-700', bg: 'bg-slate-100', line: 'bg-slate-300' },
    { l: 'روابط مرتبطة بمعاملات', v: 0, c: 'text-sky-600', bg: 'bg-sky-50', line: 'bg-sky-200' },
    { l: 'ملفات مرفوضة/مشبوهة', v: 0, c: 'text-slate-400', bg: 'bg-slate-50', line: 'bg-slate-200' },
  ];

  return (
    <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">إحصائيات المركز</h2>
            <p className="text-[10px] font-bold text-slate-500">نظرة شاملة على حركة الملفات والروابط</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {dynamicStats.map((st, i) => (
            <div key={i} className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:border-indigo-200 hover:shadow-sm transition-all">
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${st.line} opacity-50`}></div>
              <span className={`text-3xl font-black ${st.c} mb-1 drop-shadow-sm`}>{st.v}</span>
              <span className="text-[11px] font-bold text-slate-500">{st.l}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2"><Send className="w-4 h-4 text-indigo-500" /> قنوات الإرسال الأكثر استخدامًا</h3>
            <div className="space-y-5">
              {[
                { ch: 'واتساب', perc: 65, color: 'bg-emerald-500' },
                { ch: 'البريد الإلكتروني', perc: 20, color: 'bg-indigo-500' },
                { ch: 'رسائل قصيرة (SMS)', perc: 10, color: 'bg-sky-500' },
                { ch: 'تيليجرام', perc: 5, color: 'bg-blue-500' },
              ].map((ch, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-2">
                    <span>{ch.ch}</span>
                    <span className="text-slate-400">{ch.perc}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${ch.color} h-2 rounded-full transition-all duration-1000`} style={{ width: `${ch.perc}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2"><Search className="w-4 h-4 text-indigo-500" /> نظرة على الملفات المستلمة</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 cursor-pointer">
                <span className="text-xs font-black text-slate-700">تحتاج تعيينًا لعميل/مشروع</span>
                <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg text-[10px] font-black">{stats.pendingFiles || 0} ملف</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 cursor-pointer relative group">
                <span className="text-xs font-black text-slate-700">بانتظار مراجعة الذكاء الاصطناعي</span>
                <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1"><Sparkles className="w-3 h-3"/> 0 ملف</span>
                <div className="hidden group-hover:block absolute top-full right-0 mt-2 z-10 w-64 bg-white border border-slate-200 shadow-xl rounded-xl p-3 text-[10px] text-slate-600 line-clamp-2">
                  الذكاء الاصطناعي يقوم الآن باستخراج البيانات الحيوية من هذه الملفات لمقارنتها بشروط الجودة وتنبيهك بوجود نقص.
                </div>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 cursor-pointer">
                <span className="text-xs font-black text-slate-700">مكتملة ومعتمدة</span>
                <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg text-[10px] font-black">{stats.totalReceived ? stats.totalReceived - (stats.pendingFiles || 0) : 0} ملف</span>
              </div>
              <div className="flex justify-between items-center p-3.5 bg-slate-50 hover:bg-slate-100 transition-colors rounded-xl border border-slate-100 cursor-pointer">
                <span className="text-xs font-black text-slate-700">مرفوضة من النظام</span>
                <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg text-[10px] font-black">0 ملف</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}