import React, { useState, useEffect } from "react";
import { 
  BrainCircuit, CheckCircle2, XCircle, Clock, Activity, 
  AlertTriangle, RefreshCw, XSquare, Eye, Trash2, Filter
} from "lucide-react";
import api from "../../api/axios";

export default function AiDashboard() {
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL, PROCESSING, COMPLETED, FAILED
  const [actionLoading, setActionLoading] = useState(null); // ID of the job being processed
  const [selectedJob, setSelectedJob] = useState(null); // For details modal

  const fetchDashboardData = async () => {
    try {
      const statsRes = await api.get("/ai-dashboard/stats");
      const jobsRes = await api.get("/ai-dashboard/jobs");
      
      setStats(statsRes.data?.data);
      setJobs(jobsRes.data?.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching AI data", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  // --- الإجراءات (Actions) ---
  const handleRetry = async (jobId) => {
    if (!window.confirm("هل أنت متأكد من إعادة تشغيل هذه المهمة؟")) return;
    setActionLoading(jobId);
    try {
      await api.post(`/ai-dashboard/jobs/${jobId}/retry`);
      fetchDashboardData();
    } catch (error) {
      alert("فشلت إعادة المحاولة");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (jobId) => {
    if (!window.confirm("هل تريد إيقاف هذه المهمة فوراً؟")) return;
    setActionLoading(jobId);
    try {
      await api.post(`/ai-dashboard/jobs/${jobId}/cancel`);
      fetchDashboardData();
    } catch (error) {
      alert("فشل إيقاف المهمة");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm("هل تريد حذف هذا السجل نهائياً؟")) return;
    setActionLoading(jobId);
    try {
      await api.delete(`/ai-dashboard/jobs/${jobId}`);
      fetchDashboardData();
    } catch (error) {
      alert("فشل الحذف");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredJobs = jobs.filter(job => filter === "ALL" || job.status === filter);

  if (loading) return <div className="p-10 text-center font-bold text-slate-500 flex items-center justify-center gap-2"><Activity className="animate-spin" /> جاري تحميل مركز الذكاء الاصطناعي...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto animate-in fade-in duration-500" dir="rtl">
      
      {/* 1. الترويسة */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl">
            <BrainCircuit className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">مركز التحكم بالذكاء الاصطناعي</h1>
            <p className="text-sm font-bold text-slate-500">إدارة ومراقبة حية لعمليات التحليل والاستخراج</p>
          </div>
        </div>
        <button onClick={fetchDashboardData} className="btn-secondary flex items-center gap-2 text-sm bg-white border border-slate-200 px-4 py-2 rounded-lg hover:bg-slate-50 font-bold text-slate-600">
          <RefreshCw className="w-4 h-4" /> تحديث الآن
        </button>
      </div>

      {/* 2. البطاقات الإحصائية */}
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
        {/* ... (باقي البطاقات كما هي في كودك الأصلي) ... */}
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
            <p className="text-sm font-bold text-rose-400 mb-1">مهام فاشلة (اليوم)</p>
            <h3 className="text-3xl font-black text-rose-600">{stats?.today?.failedJobs || 0}</h3>
          </div>
          <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 3. أدوات الفلترة */}
      <div className="flex gap-2 mb-4">
        {["ALL", "PROCESSING", "PENDING", "COMPLETED", "FAILED"].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
              filter === status ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {status === "ALL" && <Filter className="w-4 h-4"/>}
            {status === "ALL" ? "الكل" : status === "PROCESSING" ? "جاري المعالجة" : status === "PENDING" ? "في الانتظار" : status === "COMPLETED" ? "مكتملة" : "فاشلة"}
          </button>
        ))}
      </div>

      {/* 4. جدول المهام الحي */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs font-bold border-b border-slate-100">
                <th className="p-4">رقم المهمة</th>
                <th className="p-4">نوع العملية</th>
                <th className="p-4">الحالة</th>
                <th className="p-4 w-1/4">نسبة الإنجاز</th>
                <th className="p-4">الوقت</th>
                <th className="p-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="text-sm font-bold text-slate-600">
              {filteredJobs.map((job) => (
                <tr key={job.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-mono text-xs text-slate-400">{job.id.substring(0, 8)}...</td>
                  <td className="p-4">
                    <span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded text-xs">
                      {job.jobType}
                    </span>
                  </td>
                  <td className="p-4">
                    {job.status === "COMPLETED" && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> مكتمل</span>}
                    {job.status === "FAILED" && <span className="text-rose-500 flex items-center gap-1"><XCircle className="w-4 h-4"/> فشل</span>}
                    {job.status === "PROCESSING" && <span className="text-sky-500 flex items-center gap-1"><Activity className="w-4 h-4 animate-spin"/> قيد المعالجة</span>}
                    {job.status === "PENDING" && <span className="text-amber-500 flex items-center gap-1"><Clock className="w-4 h-4"/> معلق</span>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`h-2.5 rounded-full transition-all duration-500 ${job.status === 'FAILED' ? 'bg-rose-500' : job.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-sky-500'}`}
                          style={{ width: `${job.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-400 min-w-[35px]">{job.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-xs text-slate-400" dir="ltr">
                    {new Date(job.createdAt).toLocaleTimeString('ar-SA')}
                  </td>
                  
                  {/* 💡 أدوات التحكم الجديدة */}
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => setSelectedJob(job)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {job.status === "FAILED" && (
                        <button 
                          onClick={() => handleRetry(job.id)}
                          disabled={actionLoading === job.id}
                          className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded disabled:opacity-50"
                          title="إعادة المحاولة"
                        >
                          <RefreshCw className={`w-4 h-4 ${actionLoading === job.id ? 'animate-spin' : ''}`} />
                        </button>
                      )}

                      {(job.status === "PROCESSING" || job.status === "PENDING") && (
                        <button 
                          onClick={() => handleCancel(job.id)}
                          disabled={actionLoading === job.id}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded disabled:opacity-50"
                          title="إيقاف إجباري"
                        >
                          <XSquare className="w-4 h-4" />
                        </button>
                      )}

                      {(job.status === "COMPLETED" || job.status === "FAILED") && (
                        <button 
                          onClick={() => handleDelete(job.id)}
                          disabled={actionLoading === job.id}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-50"
                          title="حذف السجل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredJobs.length === 0 && (
            <div className="p-10 text-center text-slate-400 font-bold">لا توجد مهام مطابقة للفلتر المحدد.</div>
          )}
        </div>
      </div>

      {/* 5. نافذة التفاصيل (Details Modal) */}
      {selectedJob && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-black text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" /> تفاصيل العملية
              </h3>
              <button onClick={() => setSelectedJob(null)} className="text-slate-400 hover:text-rose-500 p-1">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">نوع المهمة</p>
                  <p className="font-bold text-slate-700">{selectedJob.jobType}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold mb-1">رقم المعرف (ID)</p>
                  <p className="font-mono text-xs text-slate-600 bg-slate-100 p-1 rounded inline-block">{selectedJob.id}</p>
                </div>
              </div>

              {selectedJob.errorMessage && (
                <div className="mb-4 bg-rose-50 border border-rose-100 rounded-xl p-4">
                  <h4 className="font-bold text-rose-700 mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> سبب الفشل:
                  </h4>
                  <p className="text-sm font-mono text-rose-600 break-words">{selectedJob.errorMessage}</p>
                </div>
              )}

              {selectedJob.result && (
                <div className="mb-4">
                  <h4 className="font-bold text-emerald-700 mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> النتيجة المستخرجة:
                  </h4>
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-left" dir="ltr">
                    <pre className="text-xs text-emerald-400 font-mono">
                      {/* نحاول تنسيق الـ JSON إذا كان نصاً */}
                      {typeof selectedJob.result === 'string' 
                        ? (() => { try { return JSON.stringify(JSON.parse(selectedJob.result), null, 2) } catch { return selectedJob.result } })() 
                        : JSON.stringify(selectedJob.result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}