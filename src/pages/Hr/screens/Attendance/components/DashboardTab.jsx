import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من مسار الـ API
import { Users, BrainCircuit, Ban, Clock, TriangleAlert, Loader2 } from "lucide-react";

export default function DashboardTab() {
  // 💡 جلب الإحصائيات من الباك إند
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['attendance-stats'],
    queryFn: async () => {
      const res = await api.get('/attendance/stats');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-indigo-500">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <h3 className="font-bold text-slate-500">جاري تحليل البيانات...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ─── الأرقام العلوية (Real Data) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-blue-500 shadow-lg shadow-blue-500/30">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-500 mb-1">إجمالي الموظفين</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{stats?.totalEmployees || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-100">نشط</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-emerald-500 shadow-lg shadow-emerald-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-500 mb-1">نسبة الانضباط (AI)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">%{stats?.disciplineRate || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-100">ممتاز</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-rose-500 shadow-lg shadow-rose-500/30">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-500 mb-1">غياب متكرر</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{stats?.recurringAbsences || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-amber-50 text-amber-600 border-amber-100">يحتاج مراجعة</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-sm flex items-start gap-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-indigo-500 shadow-lg shadow-indigo-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-500 mb-1">ساعات إضافية</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 font-mono">{stats?.overtimeHours || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-amber-50 text-amber-600 border-amber-100">ساعة/شهر</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── باقي التصميم كما هو ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-8 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-indigo-500 via-purple-500 to-amber-500"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-black text-slate-900 text-lg flex items-center gap-3">
                <div className="p-2 bg-indigo-100/50 rounded-xl text-indigo-600">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                تحليل السلوك الوظيفي العميق (AI Insights)
              </h3>
              <p className="text-xs font-bold text-slate-500 mt-2">يتم تحليل سجلات 6 أشهر مضت للتعرف على الأنماط والتنبؤ بالمخاطر</p>
            </div>
            <button onClick={() => refetch()} className="px-5 py-2.5 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xl shadow-slate-900/20 active:scale-95">
              تحديث التحليل
            </button>
          </div>
          <div className="grid grid-cols-2 gap-6 flex-1">
            <div className="p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col group hover:bg-slate-50 transition-colors">
              <h4 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-200/60 pb-3 flex items-center gap-2">أنماط التأخير المكتشفة</h4>
              <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-rose-500 rounded-full shadow-sm shadow-rose-500/40"></span>
                  تركيز التأخير بنسبة 45% في أيام الأحد بعد الإجازة الأسبوعية.
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-amber-500 rounded-full shadow-sm shadow-amber-500/40"></span>
                  الموظف "سارة خالد" لديها نمط تأخير مرتبط بظروف مرورية محطتها معتادة.
                </li>
              </ul>
            </div>
            <div className="p-6 bg-slate-50/50 border border-slate-200/60 rounded-2xl flex flex-col group hover:bg-slate-50 transition-colors">
              <h4 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-200/60 pb-3 flex items-center gap-2">الإنتاجية والساعات الإضافية</h4>
              <ul className="space-y-4 text-xs font-bold text-slate-600">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/40"></span>
                  فريق "تطوير الواجهات" يسجل أعلى معدل ساعات إضافية مثمرة.
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-indigo-500 rounded-full shadow-sm shadow-indigo-500/40"></span>
                  لا توجد ظاهرة تعب إرهاق (Burnout) مسجلة حالياً في أي قسم.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-8 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-slate-900 text-lg">تنبيهات استباقية</h3>
            <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
              <TriangleAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-white border border-orange-100 flex gap-4 hover:shadow-lg hover:shadow-orange-500/5 transition-all">
              <Ban className="w-6 h-6 text-orange-500 shrink-0" />
              <div>
                <div className="text-sm font-black text-orange-950 mb-1">احتمالية غياب متوقعة</div>
                <div className="text-xs text-orange-700/80 font-bold leading-relaxed">النموذج الذكي يتوقع غياب "محمد فهد" غداً بنسبة 80% بناءً على سلوكه السابق في نفس الوقت من الشهر.</div>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 flex gap-4 hover:shadow-lg hover:shadow-rose-500/5 transition-all">
              <Clock className="w-6 h-6 text-rose-500 shrink-0" />
              <div>
                <div className="text-sm font-black text-rose-950 mb-1">تجاوز الحد المسموح للتأخير</div>
                <div className="text-xs text-rose-700/80 font-bold leading-relaxed">3 موظفين تجاوزوا الحد الشهري للسماحية (120 دقيقة) هذا الشهر.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}