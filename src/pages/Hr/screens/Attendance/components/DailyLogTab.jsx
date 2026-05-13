import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من صحة مسار ملف الـ API
import { Search, Loader2, User, ArrowDownRight, ArrowUpRight } from "lucide-react";

export default function DailyLogTab() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState("");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['attendance-daily', selectedDate],
    queryFn: async () => {
      const res = await api.get(`/attendance/daily?date=${selectedDate}`);
      return res.data.data;
    }
  });

  const filteredLogs = logs.filter(log => 
    log.employeeName.includes(search) || log.position?.includes(search)
  );

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden max-w-7xl mx-auto flex flex-col min-h-[600px] mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-5 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/50">
        <div className="flex items-center gap-3 w-1/3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="ابحث بالاسم أو المسمى الوظيفي..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200/60 rounded-xl py-2.5 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            className="bg-white border border-slate-200/60 shadow-sm rounded-xl px-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">الموظف</th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">الدخول</th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">الخروج</th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-wider text-center">تأخير (د)</th>
              <th className="py-4 px-6 text-[10px] font-black text-slate-500 uppercase tracking-wider">الحالة</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  جاري جلب البصمات من السيرفر...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-10 text-center text-slate-400 font-bold">لا توجد حركات بصمة مسجلة في هذا اليوم.</td>
              </tr>
            ) : (
              filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">{log.employeeName}</div>
                        <div className="text-[10px] font-bold text-slate-500">{log.position || "موظف"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 font-mono text-sm font-black text-slate-800">
                    {log.inTime ? <><ArrowDownRight className="w-4 h-4 text-emerald-500 inline-block ml-1" /> {log.inTime}</> : "-"}
                  </td>
                  <td className="py-3 px-6 font-mono text-sm font-black text-slate-800">
                    {log.outTime ? <><ArrowUpRight className="w-4 h-4 text-rose-500 inline-block ml-1" /> {log.outTime}</> : "-"}
                  </td>
                  <td className="py-3 px-6 text-center">
                    {log.delayMinutes > 0 ? <span className="text-xs font-bold text-rose-600">{log.delayMinutes}</span> : "-"}
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black ring-1 ring-inset shadow-sm ${
                      log.status === 'غياب' ? 'bg-rose-50 text-rose-700 ring-rose-600/20' :
                      log.status === 'تأخير' ? 'bg-amber-50 text-amber-700 ring-amber-600/20' :
                      'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}