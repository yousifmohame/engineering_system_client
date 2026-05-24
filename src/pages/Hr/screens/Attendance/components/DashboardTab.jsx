import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من مسار الـ API
import { Users, BrainCircuit, Ban, Clock, TriangleAlert, Loader2 } from "lucide-react";


const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


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
      <div className="flex flex-col items-center justify-center h-96 text-[#0e7490]">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <h3 className="font-bold text-[#94a3b8]">جاري تحليل البيانات...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full max-w-full pb-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ─── الأرقام العلوية (Real Data) ─── */}
      <div className="grid min-w-0 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2.5">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-[#e8ddc8]/60 shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex items-start gap-2.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0e7490]/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-[#0e7490] shadow-[0_8px_22px_rgba(18,63,89,0.06)] shadow-[0_8px_18px_rgba(14,116,144,0.18)]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-[#94a3b8] mb-1">إجمالي الموظفين</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-[#123f59] font-mono">{stats?.totalEmployees || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-100">نشط</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-[#e8ddc8]/60 shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex items-start gap-2.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-emerald-500 shadow-[0_8px_22px_rgba(18,63,89,0.06)] shadow-emerald-500/30">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-[#94a3b8] mb-1">نسبة الانضباط (AI)</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-[#123f59] font-mono">%{stats?.disciplineRate || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-emerald-50 text-emerald-600 border-emerald-100">ممتاز</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-[#e8ddc8]/60 shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex items-start gap-2.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-rose-500 shadow-[0_8px_22px_rgba(18,63,89,0.06)] shadow-rose-500/30">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-[#94a3b8] mb-1">غياب متكرر</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-[#123f59] font-mono">{stats?.recurringAbsences || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-[#fff8e7] text-[#c5983c] border-[#f8edcf]">يحتاج مراجعة</span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-3 border border-[#e8ddc8]/60 shadow-[0_6px_14px_rgba(18,63,89,0.04)] flex items-start gap-2.5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0e7490]/10 rounded-full blur-3xl -z-10 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="p-4 rounded-2xl text-white bg-[#0e7490] shadow-[0_8px_22px_rgba(18,63,89,0.06)] shadow-[0_8px_18px_rgba(14,116,144,0.18)]">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-black text-[#94a3b8] mb-1">ساعات إضافية</div>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-[#123f59] font-mono">{stats?.overtimeHours || 0}</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-xl border bg-[#fff8e7] text-[#c5983c] border-[#f8edcf]">ساعة/شهر</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── باقي التصميم كما هو ─── */}
      <div className="grid min-w-0 grid-cols-1 lg:grid-cols-3 gap-2.5">
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl border border-[#e8ddc8]/60 shadow-[0_6px_14px_rgba(18,63,89,0.04)] p-4 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-full h-1.5 bg-gradient-to-l from-[#0e7490] via-[#15536f] to-[#e2bf74]"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#0e7490]/5 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black text-[#123f59] text-lg flex items-center gap-2.5">
                <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-[#eef7f6]/50 rounded-xl text-[#0e7490]">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                تحليل السلوك الوظيفي العميق (AI Insights)
              </h3>
              <p className="text-xs font-bold text-[#94a3b8] mt-2">يتم تحليل سجلات 6 أشهر مضت للتعرف على الأنماط والتنبؤ بالمخاطر</p>
            </div>
            <button onClick={() => refetch()} className="px-2.5 py-2 bg-[#06111d] text-white text-xs font-black rounded-xl hover:bg-[#123f59] transition-colors flex items-center gap-2 shadow-[0_10px_24px_rgba(18,63,89,0.08)] shadow-[0_8px_18px_rgba(6,17,29,0.18)] active:scale-95">
              تحديث التحليل
            </button>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2.5 flex-1">
            <div className="p-3 bg-[#fbf8f1]/50 border border-[#e8ddc8]/60 rounded-2xl flex flex-col group hover:bg-[#fbf8f1] transition-colors">
              <h4 className="text-sm font-black text-[#123f59] mb-4 border-b border-[#e8ddc8]/60 pb-3 flex items-center gap-2">أنماط التأخير المكتشفة</h4>
              <ul className="space-y-4 text-xs font-bold text-[#64748b]">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-rose-500 rounded-full shadow-[0_6px_14px_rgba(18,63,89,0.04)] shadow-rose-500/40"></span>
                  تركيز التأخير بنسبة 45% في أيام الأحد بعد الإجازة الأسبوعية.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-[#fff8e7]0 rounded-full shadow-[0_6px_14px_rgba(18,63,89,0.04)] shadow-[0_8px_18px_rgba(226,191,116,0.18)]"></span>
                  الموظف "سارة خالد" لديها نمط تأخير مرتبط بظروف مرورية محطتها معتادة.
                </li>
              </ul>
            </div>
            <div className="p-3 bg-[#fbf8f1]/50 border border-[#e8ddc8]/60 rounded-2xl flex flex-col group hover:bg-[#fbf8f1] transition-colors">
              <h4 className="text-sm font-black text-[#123f59] mb-4 border-b border-[#e8ddc8]/60 pb-3 flex items-center gap-2">الإنتاجية والساعات الإضافية</h4>
              <ul className="space-y-4 text-xs font-bold text-[#64748b]">
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-emerald-500 rounded-full shadow-[0_6px_14px_rgba(18,63,89,0.04)] shadow-emerald-500/40"></span>
                  فريق "تطوير الواجهات" يسجل أعلى معدل ساعات إضافية مثمرة.
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-2 h-2 mt-1 shrink-0 bg-[#0e7490] rounded-full shadow-[0_6px_14px_rgba(18,63,89,0.04)] shadow-[0_8px_18px_rgba(14,116,144,0.18)]"></span>
                  لا توجد ظاهرة تعب إرهاق (Burnout) مسجلة حالياً في أي قسم.
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-[#e8ddc8]/60 shadow-[0_6px_14px_rgba(18,63,89,0.04)] p-4 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -z-10 opacity-60"></div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-[#123f59] text-lg">تنبيهات استباقية</h3>
            <div className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-rose-50 text-rose-500 rounded-xl">
              <TriangleAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-[#fbf8f1] to-white border border-[#f8edcf] flex gap-2.5 hover:shadow-[0_8px_22px_rgba(18,63,89,0.06)] hover:shadow-[0_8px_18px_rgba(197,152,60,0.08)] transition-all">
              <Ban className="w-6 h-6 text-[#c5983c] shrink-0" />
              <div>
                <div className="text-sm font-black text-[#5f430b] mb-1">احتمالية غياب متوقعة</div>
                <div className="text-xs text-[#a87819]/80 font-bold leading-relaxed">النموذج الذكي يتوقع غياب "محمد فهد" غداً بنسبة 80% بناءً على سلوكه السابق في نفس الوقت من الشهر.</div>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 flex gap-2.5 hover:shadow-[0_8px_22px_rgba(18,63,89,0.06)] hover:shadow-rose-500/5 transition-all">
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