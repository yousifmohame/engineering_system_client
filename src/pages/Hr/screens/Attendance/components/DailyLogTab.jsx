import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من صحة مسار ملف الـ API
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Loader2, User, ArrowDownRight, ArrowUpRight, 
  Clock, ShieldCheck, X, FileHeart, CalendarOff, AlertCircle, Coffee
} from "lucide-react";

export default function DailyLogTab() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState("");

  // 💡 حالات النوافذ المنبثقة للقرارات الإدارية
  const [excuseModal, setExcuseModal] = useState({ isOpen: false, log: null, reason: "ظرف صحي / طارئ" });
  const [leaveModal, setLeaveModal] = useState({ isOpen: false, log: null, type: "SICK", duration: "FULL_DAY" });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['attendance-daily', selectedDate],
    queryFn: async () => {
      // 💡 يفترض أن هذا الـ API يعيد بيانات تتضمن نوع الدوام والإجازات
      const res = await api.get(`/attendance/daily?date=${selectedDate}`);
      return res.data.data;
    }
  });

  // 🚀 اعتماد تجاوز التأخير
  const excuseMutation = useMutation({
    mutationFn: async (payload) => await api.put(`/attendance/excuse-delay`, payload),
    onSuccess: () => {
      toast.success("تم تجاوز التأخير واعتماده كعذر رسمي ✅");
      queryClient.invalidateQueries(['attendance-daily']);
      setExcuseModal({ isOpen: false, log: null, reason: "" });
    },
    onError: () => toast.error("حدث خطأ أثناء اعتماد العذر")
  });

  // 🚀 منح إجازة فورية
  const leaveMutation = useMutation({
    mutationFn: async (payload) => await api.post(`/attendance/grant-leave`, payload),
    onSuccess: () => {
      toast.success("تم تسجيل الإجازة للموظف بنجاح ✅");
      queryClient.invalidateQueries(['attendance-daily']);
      setLeaveModal({ isOpen: false, log: null, type: "SICK", duration: "FULL_DAY" });
    },
    onError: () => toast.error("حدث خطأ أثناء تسجيل الإجازة")
  });

  const filteredLogs = logs.filter(log => 
    (log.employeeName || "").includes(search) || (log.position || "").includes(search)
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden max-w-7xl mx-auto flex flex-col min-h-[600px] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo">
      
      {/* ── Header & Filters ── */}
      <div className="p-5 border-b border-slate-200/60 flex flex-wrap justify-between items-center bg-slate-50/50 gap-4">
        <div className="flex items-center gap-3 w-full sm:w-1/3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="ابحث بالاسم أو المسمى الوظيفي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200/60 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px] font-black text-slate-500 uppercase">تاريخ السجل:</label>
          <input
            className="bg-white border border-slate-200/60 shadow-sm rounded-xl px-4 py-2 text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      
      {/* ── Data Grid ── */}
      <div className="overflow-x-auto flex-1 custom-scrollbar">
        <table className="w-full text-right min-w-[900px]">
          <thead className="bg-slate-100/80 border-b border-slate-200 sticky top-0 z-10">
            <tr>
              <th className="py-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-wider w-1/4">الموظف</th>
              <th className="py-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-wider text-center">نظام الدوام</th>
              <th className="py-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-wider text-center">البصمات (دخول / خروج)</th>
              <th className="py-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-wider text-center">حالة الحضور</th>
              <th className="py-4 px-5 text-[11px] font-black text-slate-600 uppercase tracking-wider text-center w-48">إجراءات الإدارة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-blue-600">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
                  <p className="font-bold text-sm">جاري جلب السجلات والتحليل الذكي...</p>
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-16 text-center text-slate-400">
                  <CalendarOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="font-black text-lg">لا توجد حركات مسجلة</p>
                  <p className="text-xs font-bold mt-1">لم يتم تسجيل أي بصمات أو إجازات في هذا اليوم.</p>
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => {
                const isLeave = log.status === 'ON_LEAVE' || log.status === 'PUBLIC_HOLIDAY';
                const isWeekend = log.status === 'WEEKEND';
                const isAbsent = log.status === 'ABSENT';

                return (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                    
                    {/* 1. الموظف */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shrink-0 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900">{log.employeeName}</div>
                          <div className="text-[10px] font-bold text-slate-500">{log.position || "موظف"}</div>
                        </div>
                      </div>
                    </td>

                    {/* 2. نظام الدوام */}
                    <td className="py-3 px-5 text-center">
                      <div className="inline-flex flex-col items-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg shadow-sm">
                        <span className="text-[9px] font-black text-indigo-600 mb-0.5 uppercase tracking-wide">
                          {log.shiftType === 'FLEXIBLE' ? 'دوام مرن' : 'دوام ثابت'}
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-700">
                          {log.shiftType === 'FLEXIBLE' ? `${log.requiredDailyHours} ساعات` : `${log.shiftStartTime} - ${log.shiftEndTime}`}
                        </span>
                      </div>
                    </td>

                    {/* 3. البصمات (تُخفى أو تظهر بشكل مختلف إذا كان إجازة) */}
                    <td className="py-3 px-5 text-center">
                      {isLeave || isWeekend ? (
                        <span className="text-xs font-black text-slate-400">- مستثنى -</span>
                      ) : (
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <span className="block text-[9px] text-slate-400 font-bold mb-0.5">دخول</span>
                            <span className={`font-mono text-sm font-black ${log.inTime ? 'text-slate-800' : 'text-slate-300'}`}>
                              {log.inTime ? <><ArrowDownRight className="w-3.5 h-3.5 text-emerald-500 inline-block" /> {log.inTime}</> : "--:--"}
                            </span>
                          </div>
                          <div className="w-px h-6 bg-slate-200"></div>
                          <div className="text-center">
                            <span className="block text-[9px] text-slate-400 font-bold mb-0.5">خروج</span>
                            <span className={`font-mono text-sm font-black ${log.outTime ? 'text-slate-800' : 'text-slate-300'}`}>
                              {log.outTime ? <><ArrowUpRight className="w-3.5 h-3.5 text-rose-500 inline-block" /> {log.outTime}</> : "--:--"}
                            </span>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 4. حالة الحضور والتأخير */}
                    <td className="py-3 px-5 text-center">
                      {isLeave ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-blue-50 text-blue-700 border border-blue-200 shadow-sm">
                          <FileHeart className="w-3.5 h-3.5" /> إجازة ({log.leaveType || 'معتمدة'})
                        </span>
                      ) : isWeekend ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">
                          <Coffee className="w-3.5 h-3.5" /> راحة أسبوعية
                        </span>
                      ) : isAbsent ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-sm">
                          <CalendarOff className="w-3.5 h-3.5" /> غياب
                        </span>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                           <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded border text-[10px] font-black bg-emerald-50 text-emerald-700 border-emerald-200">
                             <ShieldCheck className="w-3 h-3" /> حاضر
                           </span>
                           {/* عرض التأخير للثابت، أو النقص للمرن */}
                           {log.shiftType === 'FIXED' && log.delayMinutes > 0 && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${log.isExcused ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                {log.isExcused ? `تأخير مبرر (${log.delayMinutes}د)` : `تأخير (${log.delayMinutes}د)`}
                              </span>
                           )}
                           {log.shiftType === 'FLEXIBLE' && log.shortageMinutes > 0 && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded ${log.isExcused ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                {log.isExcused ? `نقص مبرر (${log.shortageMinutes}د)` : `نقص ساعات (${log.shortageMinutes}د)`}
                              </span>
                           )}
                        </div>
                      )}
                    </td>

                    {/* 5. إجراءات الإدارة */}
                    <td className="py-3 px-5 text-center">
                      <div className="flex justify-center gap-2 opacity-30 group-hover:opacity-100 transition-opacity">
                        
                        {/* زر التجاوز يظهر فقط إذا كان هناك تأخير غير مبرر */}
                        {((log.shiftType === 'FIXED' && log.delayMinutes > 0) || (log.shiftType === 'FLEXIBLE' && log.shortageMinutes > 0)) && !log.isExcused && !isLeave && !isAbsent && (
                          <button 
                            onClick={() => setExcuseModal({ isOpen: true, log, reason: "استئذان / ظرف طارئ" })}
                            className="bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <AlertCircle className="w-3 h-3" /> تجاوز
                          </button>
                        )}

                        {/* زر الإجازة يظهر لمن هو غير مجاز */}
                        {!isLeave && (
                          <button 
                            onClick={() => setLeaveModal({ isOpen: true, log, type: "SICK", duration: "FULL_DAY" })}
                            className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-[10px] font-black transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <FileHeart className="w-3 h-3" /> منح إجازة
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ================================================== */}
      {/* 🚀 المودالات الإدارية (تجاوز التأخير / منح إجازة) */}
      {/* ================================================== */}

      {/* 1. مودال تجاوز التأخير */}
      <AnimatePresence>
        {excuseModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 flex justify-between items-center border-b border-amber-100">
                <h3 className="font-black text-amber-800 flex items-center gap-2"><AlertCircle className="w-5 h-5"/> تجاوز تأخير للموظف</h3>
                <button onClick={() => setExcuseModal({ isOpen: false, log: null, reason: "" })} className="text-amber-500 hover:bg-amber-100 p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-700">
                  <span className="block text-[10px] text-slate-500 mb-1">الموظف المعني:</span>
                  {excuseModal.log?.employeeName} 
                  <span className="text-rose-600 font-mono text-xs mr-2">(وقت التأخير/النقص: {excuseModal.log?.delayMinutes || excuseModal.log?.shortageMinutes} دقيقة)</span>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">سبب التجاوز والاعتماد (يُحفظ في السجل)</label>
                  <select value={excuseModal.reason} onChange={(e) => setExcuseModal({...excuseModal, reason: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-amber-500 shadow-sm">
                    <option value="استئذان مسبق معتمد">استئذان مسبق معتمد</option>
                    <option value="ظرف صحي / طارئ">ظرف صحي / طارئ</option>
                    <option value="مهمة عمل خارجية">مهمة عمل خارجية</option>
                    <option value="عطل في نظام البصمة">عطل في نظام البصمة</option>
                    <option value="أخرى">أخرى (موافقة إدارية)</option>
                  </select>
                </div>
              </div>
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <button onClick={() => setExcuseModal({ isOpen: false, log: null, reason: "" })} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200">إلغاء</button>
                <button onClick={() => excuseMutation.mutate({ logId: excuseModal.log?.id, employeeId: excuseModal.log?.employeeId, date: selectedDate, reason: excuseModal.reason })} disabled={excuseMutation.isPending} className="flex-1 bg-amber-500 text-white text-sm font-black rounded-xl hover:bg-amber-600 flex justify-center items-center gap-2 shadow-md shadow-amber-500/30">
                  {excuseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "اعتماد وتجاوز"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. مودال منح إجازة سريعة */}
      <AnimatePresence>
        {leaveModal.isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" dir="rtl">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 flex justify-between items-center border-b border-blue-100">
                <h3 className="font-black text-blue-800 flex items-center gap-2"><FileHeart className="w-5 h-5"/> تسجيل إجازة فورية</h3>
                <button onClick={() => setLeaveModal({ isOpen: false, log: null, type: "SICK", duration: "FULL_DAY" })} className="text-blue-500 hover:bg-blue-100 p-1.5 rounded-lg"><X className="w-5 h-5"/></button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-bold text-slate-700">
                  <span className="block text-[10px] text-slate-500 mb-1">الموظف المعني:</span>
                  {leaveModal.log?.employeeName}
                </div>
                
                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">نوع الإجازة</label>
                  <select value={leaveModal.type} onChange={(e) => setLeaveModal({...leaveModal, type: e.target.value})} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-blue-500 shadow-sm">
                    <option value="SICK">مرضية (Sick Leave)</option>
                    <option value="ANNUAL">اعتيادية (Annual Leave)</option>
                    <option value="EMERGENCY">اضطرارية (Emergency)</option>
                    <option value="UNPAID">بدون راتب (Unpaid)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-2">مدة الإجازة لهذا اليوم</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`border rounded-xl p-3 text-center cursor-pointer font-bold text-xs transition-colors ${leaveModal.duration === 'FULL_DAY' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input type="radio" name="duration" value="FULL_DAY" checked={leaveModal.duration === 'FULL_DAY'} onChange={() => setLeaveModal({...leaveModal, duration: 'FULL_DAY'})} className="hidden" />
                      يوم كامل
                    </label>
                    <label className={`border rounded-xl p-3 text-center cursor-pointer font-bold text-xs transition-colors ${leaveModal.duration === 'REST_OF_DAY' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input type="radio" name="duration" value="REST_OF_DAY" checked={leaveModal.duration === 'REST_OF_DAY'} onChange={() => setLeaveModal({...leaveModal, duration: 'REST_OF_DAY'})} className="hidden" />
                      باقي اليوم (انصراف مبكر)
                    </label>
                  </div>
                </div>

              </div>
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <button onClick={() => setLeaveModal({ isOpen: false, log: null, type: "SICK", duration: "FULL_DAY" })} className="px-5 py-2.5 bg-slate-100 text-slate-700 text-xs font-black rounded-xl hover:bg-slate-200">إلغاء</button>
                <button onClick={() => leaveMutation.mutate({ employeeId: leaveModal.log?.employeeId, date: selectedDate, type: leaveModal.type, duration: leaveModal.duration })} disabled={leaveMutation.isPending} className="flex-1 bg-blue-600 text-white text-sm font-black rounded-xl hover:bg-blue-700 flex justify-center items-center gap-2 shadow-md shadow-blue-600/30">
                  {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الإجازة"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}