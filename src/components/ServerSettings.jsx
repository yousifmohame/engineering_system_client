import React, { useState, useEffect } from "react";
import api from "../api/axios";

const ServerSettings = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/server/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBackup = async () => {
    try {
      const baseURL =
        import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";
      window.open(`${baseURL}/server/backup`, "_blank");
    } catch (error) {
      alert("فشل تحميل النسخة الاحتياطية");
    }
  };

  if (loading)
    return <p className="p-6">جاري تحميل بيانات النظام الدقيقة...</p>;

  // حماية إضافية: إذا كانت البيانات فارغة لسبب ما
  if (!stats)
    return <p className="p-6 text-red-500">فشل في قراءة بيانات السيرفر.</p>;

  return (
    <div
      className="p-6 bg-transparent h-full overflow-y-auto direction-rtl"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          مراقبة موارد السيرفر (Hardware Monitor)
        </h2>

        <div className="flex flex-col gap-8">
          {/* 1. قسم المعالج */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              💻 المعالج (CPU)
            </h3>
            <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 flex justify-between items-center">
              <div>
                <p className="font-medium text-blue-900">
                  {stats?.cpu?.model || "غير متوفر"}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  عدد الأنوية: {stats?.cpu?.cores || "-"} Cores
                </p>
              </div>
              <div className="text-left">
                {/* يدعم الصيغة الجديدة والصيغة القديمة */}
                <p className="text-3xl font-bold text-blue-600">
                  {stats?.cpu?.load || stats?.cpuLoad || 0}%
                </p>
                <p className="text-xs text-blue-500 mt-1">الاستهلاك الحالي</p>
              </div>
            </div>
          </div>

          {/* 2. قسم الذاكرة */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              🧠 الذاكرة العشوائية (الإجمالي: {stats?.ram?.total || 0} GB)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50/50 rounded-xl border border-green-200">
                <p className="text-sm font-bold text-green-800 mb-2">
                  الاستهلاك الكلي
                </p>
                <p className="text-3xl font-bold text-green-600 mb-1">
                  {stats?.ram?.percent || 0}%
                </p>
                <p className="text-xs text-green-700">
                  مستخدم: {stats?.ram?.used || 0} GB من {stats?.ram?.total || 0}{" "}
                  GB
                </p>
              </div>

              {/* عرض الشرائح إن وجدت */}
              {stats?.ram?.sticks?.map((stick, index) => (
                <div
                  key={index}
                  className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    شريحة (Slot {stick?.bank || "-"})
                  </p>
                  <p className="text-xl font-bold text-gray-900 mb-1">
                    {stick?.size || 0} GB
                  </p>
                  <p className="text-xs text-gray-500">
                    النوع: {stick?.type || "-"} | السرعة:{" "}
                    {stick?.clockSpeed || "-"} MHz
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. قسم الهاردات */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
              💾 وحدات التخزين (Hard Drives)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* يدعم المصفوفة الجديدة (disks) أو الكائن القديم (disk) */}
              {(stats?.disks || (stats?.disk ? [stats.disk] : [])).map(
                (disk, index) => (
                  <div
                    key={index}
                    className="p-4 bg-purple-50/50 rounded-xl border border-purple-200 relative overflow-hidden"
                  >
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-purple-500"
                      style={{
                        width: `${disk?.percent || 0}%`,
                        transition: "width 0.5s",
                      }}
                    ></div>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-sm font-bold text-purple-800">
                        قرص ({disk?.mount || "/"})
                      </p>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                        {disk?.type || "Drive"}
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-purple-600 mb-1">
                      {disk?.percent || 0}%
                    </p>
                    <p className="text-xs text-purple-700">
                      مستخدم: {disk?.used || 0} GB من {disk?.total || 0} GB
                    </p>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex gap-4">
        <button
          onClick={handleBackup}
          className="flex-1 bg-indigo-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-indigo-700 transition shadow-sm flex items-center justify-center gap-2"
        >
          <span>⬇️</span> تحميل نسخة احتياطية من قاعدة البيانات
        </button>

        <button
          onClick={async () => {
            if (
              window.confirm(
                "إعادة التشغيل ستؤدي إلى فصل النظام لثوانٍ. هل أنت متأكد؟",
              )
            ) {
              await api.post("/server/restart");
              alert("جاري إعادة التشغيل... يرجى تحديث الصفحة.");
            }
          }}
          className="bg-red-50 text-red-600 border border-red-200 font-medium px-6 py-3 rounded-lg hover:bg-red-100 transition shadow-sm flex items-center justify-center gap-2"
        >
          <span>🔄</span> إعادة تشغيل السيرفر
        </button>
      </div>
    </div>
  );
};

export default ServerSettings;
