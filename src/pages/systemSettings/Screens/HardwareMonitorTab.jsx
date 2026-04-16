import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import {
  Activity,
  HardDrive,
  Cpu,
  AlertTriangle,
  Server,
  Loader2,
} from "lucide-react";

export default function HardwareMonitorTab() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const response = await api.get("/server/stats");
        if (isMounted) setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000); // تحديث كل 5 ثوانٍ
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="flex flex-col h-full bg-gray-50/50"
      dir="rtl"
      style={{ fontFamily: "Tajawal, sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-inner">
          <Server className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800">
            مراقبة الموارد (Hardware)
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            حالة السيرفر، المعالج، والذاكرة بشكل لحظي
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-blue-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-sm font-bold text-gray-600">
              جاري قراءة مستشعرات السيرفر...
            </p>
          </div>
        ) : !stats ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
            <h3 className="text-red-800 font-bold mb-1">
              فشل الاتصال بالسيرفر
            </h3>
            <p className="text-red-600 text-xs">
              تعذر قراءة بيانات الموارد الحالية. تأكد من عمل السيرفر الداخلي.
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in">
            {/* CPU Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-black text-gray-800">
                  المعالج (CPU)
                </h3>
              </div>
              <div className="p-5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex-1">
                  <p className="text-lg font-black text-indigo-900 mb-1">
                    {stats?.cpu?.model || "غير متوفر"}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-xs font-bold border border-indigo-100">
                      عدد الأنوية: {stats?.cpu?.cores || "-"} Cores
                    </span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-center bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 min-w-[120px]">
                  <p className="text-3xl font-black text-indigo-600 font-mono">
                    {stats?.cpu?.load || stats?.cpuLoad || 0}%
                  </p>
                  <p className="text-[10px] font-bold text-indigo-400 mt-1 uppercase tracking-wider">
                    الاستهلاك الحالي
                  </p>
                </div>
              </div>
            </div>

            {/* RAM Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-black text-gray-800">
                    الذاكرة العشوائية (RAM)
                  </h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-lg text-xs font-bold">
                  الإجمالي: {stats?.ram?.total || 0} GB
                </span>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="col-span-1 p-5 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute bottom-0 left-0 w-full h-1.5 bg-emerald-200">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${stats?.ram?.percent || 0}%` }}
                    />
                  </div>
                  <p className="text-3xl font-black text-emerald-700 font-mono mb-1">
                    {stats?.ram?.percent || 0}%
                  </p>
                  <p className="text-[11px] font-bold text-emerald-600">
                    نسبة الاستهلاك
                  </p>
                  <p className="text-[10px] text-emerald-500 mt-2 font-mono font-semibold">
                    مستخدم: {stats?.ram?.used || 0} GB
                  </p>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-3">
                  {stats?.ram?.sticks?.length > 0 ? (
                    stats.ram.sticks.map((stick, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                      >
                        <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wider">
                          شريحة (Slot {stick?.bank || "-"})
                        </p>
                        <p className="text-xl font-black text-gray-800 font-mono mb-2">
                          {stick?.size || 0} GB
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">
                            {stick?.type || "Unknown"}
                          </span>
                          <span className="text-[9px] bg-white border border-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold font-mono">
                            {stick?.clockSpeed || "-"} MHz
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 flex items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-100 border-dashed text-gray-400 text-xs font-bold">
                      بيانات الشرائح غير متوفرة في هذا النظام
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Storage Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-black text-gray-800">
                  وحدات التخزين (Storage)
                </h3>
              </div>
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(stats?.disks || (stats?.disk ? [stats.disk] : [])).map(
                  (disk, index) => {
                    const isWarning = disk?.percent > 85;
                    return (
                      <div
                        key={index}
                        className={`p-5 rounded-xl border relative overflow-hidden ${isWarning ? "bg-red-50 border-red-200" : "bg-amber-50/30 border-amber-100"}`}
                      >
                        <div
                          className={`absolute top-0 left-0 w-1.5 h-full ${isWarning ? "bg-red-500" : "bg-amber-400"}`}
                        />
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p
                              className={`text-xs font-bold ${isWarning ? "text-red-800" : "text-amber-900"} mb-0.5`}
                            >
                              قرص مسار ({disk?.mount || "/"})
                            </p>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded ${isWarning ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}
                            >
                              {disk?.type || "Drive"}
                            </span>
                          </div>
                          <div className="text-left">
                            <p
                              className={`text-2xl font-black font-mono ${isWarning ? "text-red-600" : "text-amber-600"}`}
                            >
                              {disk?.percent || 0}%
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full overflow-hidden ${isWarning ? "bg-red-200" : "bg-amber-200"}`}
                        >
                          <div
                            className={`h-full transition-all duration-500 ${isWarning ? "bg-red-500" : "bg-amber-500"}`}
                            style={{ width: `${disk?.percent || 0}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center mt-2 text-[10px] font-bold font-mono">
                          <span
                            className={
                              isWarning ? "text-red-500" : "text-amber-600"
                            }
                          >
                            {disk?.used || 0} GB مستخدم
                          </span>
                          <span className="text-gray-400">
                            {disk?.total || 0} GB كلي
                          </span>
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
