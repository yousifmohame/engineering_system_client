import React, { useState, useEffect } from "react";
import { BrainCircuit, CheckCircle2, XCircle, Clock, Activity, AlertTriangle } from "lucide-react";
import api from "../../api/axios";

export default function AiDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get("/ai-dashboard/stats");
      const jobsRes = await api.get("/ai-dashboard/jobs");
      
      setStats(statsRes.data?.data);
      setJobs(jobsRes.data?.data || []); // 👈 وضعنا fallback خالي
      setLoading(false);
    } catch (error) {
      console.error("Error fetching AI data", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // تحديث تلقائي كل 5 ثواني لتراقب الطابور الحي
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500">جاري تحميل مركز الذكاء الاصطناعي...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500" dir="rtl">
      
      {/* 1. الترويسة */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
          <BrainCircuit className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800">مركز الذكاء الاصطناعي للطوابير</h1>
          <p className="text-sm font-bold text-slate-500">مراقبة حية لعمليات تحليل البيانات والمطابقة في الخلفية</p>
        </div>
      </div>

      {/* 2. البطاقات الإحصائية (Stats Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 mb-1">في الطابور الآن</p>
            <h3 className="text-3xl font-black text-sky-600">{stats?.activeQueue || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 mb-1">إجمالي مهام اليوم</p>
            <h3 className="text-3xl font-black text-indigo-600">{stats?.today?.totalJobs || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-400 mb-1">نجح اليوم</p>
            <h3 className="text-3xl font-black text-emerald-600">{stats?.today?.successJobs || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-rose-400 mb-1">أخطاء وتحذيرات</p>
            <h3 className="text-3xl font-black text-rose-600">{stats?.totalFailed || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. جدول المهام الحي (Live Queue Table) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="text-base font-black text-slate-700">سجل العمليات الأخير (Live)</h3>
          <span className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> متصل بالطابور
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white text-slate-400 text-xs font-bold border-b border-slate-100">
                <th className="p-4">رقم المهمة</th>
                <th className="p-4">نوع العملية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 w-1/4">نسبة الإنجاز</th>
                <th className="p-4">الوقت</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-600">
              {/* 💡 أضفنا علامة الاستفهام هنا لحماية الكود إذا كانت jobs تساوي undefined */}
              {jobs?.map((job) => (
                <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-400">{job.id.substring(0, 8)}...</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">
                      {job.jobType === "ANALYZE_ARCHIVE" ? "تحليل أرشيف" : job.jobType}
                    </span>
                  </td>
                  <td className="p-4">
                    {job.status === "COMPLETED" && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> مكتمل</span>}
                    {job.status === "FAILED" && <span className="text-rose-500 flex items-center gap-1"><XCircle className="w-4 h-4"/> فشل</span>}
                    {job.status === "PROCESSING" && <span className="text-sky-500 flex items-center gap-1"><Activity className="w-4 h-4 animate-spin"/> جاري التحليل</span>}
                    {job.status === "PENDING" && <span className="text-amber-500 flex items-center gap-1"><Clock className="w-4 h-4"/> في الانتظار</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${
                            job.status === 'FAILED' ? 'bg-rose-500' : 
                            job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-sky-500'
                          }`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400 min-w-[35px]">{job.progress}%</span>
                    </div>
                    {job.errorMessage && (
                      <p className="text-[10px] text-rose-500 mt-1 font-normal break-words max-w-[200px]">
                        {job.errorMessage}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-xs text-slate-400" dir="ltr">
                    {new Date(job.createdAt).toLocaleTimeString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!jobs || jobs.length === 0) && (
            <div className="p-10 text-center text-slate-400 font-bold">
              لا توجد مهام حالياً في السجل.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}