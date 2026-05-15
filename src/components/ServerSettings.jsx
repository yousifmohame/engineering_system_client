import React, { useState, useEffect } from "react";
import api from "../api/axios";
import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  Download,
  RotateCw,
  Activity,
  ShieldCheck,
  AlertTriangle,
  DatabaseBackup,
} from "lucide-react";

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

  if (loading) {
    return (
      <div
        className="
          flex h-full items-center justify-center
          bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
          p-6
        "
        dir="rtl"
      >
        <div
          className="
            flex items-center gap-3 rounded-[26px]
            border border-[#d8b46a]/30 bg-white
            px-6 py-5 shadow-[0_18px_45px_rgba(18,63,89,0.10)]
          "
        >
          <RotateCw className="h-5 w-5 animate-spin text-[#c5983c]" />

          <span className="text-sm font-black text-[#123f59]">
            جاري تحميل بيانات النظام الدقيقة...
          </span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="
          flex h-full items-center justify-center
          bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
          p-6
        "
        dir="rtl"
      >
        <div
          className="
            flex items-center gap-3 rounded-[26px]
            border border-rose-300 bg-rose-50
            px-6 py-5 shadow-[0_18px_45px_rgba(244,63,94,0.10)]
          "
        >
          <AlertTriangle className="h-5 w-5 text-rose-600" />

          <span className="text-sm font-black text-rose-700">
            فشل في قراءة بيانات السيرفر.
          </span>
        </div>
      </div>
    );
  }

  const cpuLoad = stats?.cpu?.load || stats?.cpuLoad || 0;
  const ramPercent = stats?.ram?.percent || 0;
  const disks = stats?.disks || (stats?.disk ? [stats.disk] : []);

  return (
    <div
      className="
        h-full overflow-y-auto
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-4 pb-10 md:p-6
        custom-scrollbar-slim
      "
      dir="rtl"
    >
      {/* Header */}
      <div
        className="
          relative mb-6 overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-5 shadow-[0_22px_60px_rgba(18,63,89,0.22)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#c5983c]/18 blur-3xl" />
          <div className="absolute left-[-80px] bottom-[-80px] h-52 w-52 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div
              className="
                grid h-14 w-14 place-items-center rounded-3xl
                bg-[#e2bf74] text-[#123f59]
                shadow-[0_12px_24px_rgba(0,0,0,0.18)]
              "
            >
              <Server className="h-7 w-7" />
            </div>

            <div>
              <h2 className="text-lg font-black text-white">
                مراقبة موارد السيرفر
              </h2>

              <p className="mt-1 text-xs font-bold text-white/55">
                متابعة حالة المعالج، الذاكرة، وحدات التخزين مع تحديث تلقائي كل
                5 ثوانٍ.
              </p>
            </div>
          </div>

          <div
            className="
              flex w-max items-center gap-2 rounded-2xl
              border border-white/15 bg-white/10
              px-4 py-3 backdrop-blur-md
            "
          >
            <span
              className="
                grid h-10 w-10 place-items-center rounded-2xl
                bg-[#e2bf74]/15 text-[#e2bf74]
              "
            >
              <Activity className="h-5 w-5" />
            </span>

            <div>
              <div className="text-[10px] font-black text-white/55">
                حالة المراقبة
              </div>

              <div className="text-xs font-black text-white">
                نشطة ومتزامنة
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Monitor Card */}
      <div
        className="
          mb-6 overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        "
      >
        <div
          className="
            flex items-center justify-between gap-3
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <h3 className="flex items-center gap-2 text-sm font-black text-[#123f59]">
            <span
              className="
                grid h-9 w-9 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <ShieldCheck className="h-4 w-4" />
            </span>
            Hardware Monitor
          </h3>

          <span
            className="
              rounded-2xl border border-[#d8b46a]/25
              bg-white px-3 py-1.5 text-[10px]
              font-black text-[#123f59]
            "
          >
            Auto Refresh / 5s
          </span>
        </div>

        <div className="space-y-8 p-5">
          {/* CPU */}
          <section>
            <SectionTitle
              icon={Cpu}
              title="المعالج"
              subtitle="CPU performance and cores"
            />

            <div
              className="
                rounded-[26px] border border-cyan-200
                bg-cyan-50/60 p-5
                shadow-sm
              "
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black text-[#123f59]">
                    {stats?.cpu?.model || "غير متوفر"}
                  </p>

                  <p className="mt-1 text-xs font-bold text-cyan-700">
                    عدد الأنوية: {stats?.cpu?.cores || "-"} Cores
                  </p>
                </div>

                <div className="text-right md:text-left">
                  <p className="font-mono text-4xl font-black text-cyan-700">
                    {cpuLoad}%
                  </p>

                  <p className="mt-1 text-[11px] font-black text-cyan-700/70">
                    الاستهلاك الحالي
                  </p>
                </div>
              </div>

              <ProgressBar value={cpuLoad} tone="cyan" />
            </div>
          </section>

          {/* RAM */}
          <section>
            <SectionTitle
              icon={MemoryStick}
              title={`الذاكرة العشوائية`}
              subtitle={`الإجمالي: ${stats?.ram?.total || 0} GB`}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MetricCard
                label="الاستهلاك الكلي"
                value={`${ramPercent}%`}
                subtitle={`مستخدم: ${stats?.ram?.used || 0} GB من ${
                  stats?.ram?.total || 0
                } GB`}
                tone="emerald"
              />

              {stats?.ram?.sticks?.map((stick, index) => (
                <div
                  key={index}
                  className="
                    rounded-[24px] border border-[#d8b46a]/30
                    bg-white p-4
                    shadow-[0_12px_30px_rgba(18,63,89,0.06)]
                  "
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-black text-[#123f59]">
                      شريحة Slot {stick?.bank || "-"}
                    </p>

                    <span
                      className="
                        rounded-xl border border-[#d8b46a]/25
                        bg-[#fbf8f1] px-2 py-1
                        text-[10px] font-black text-[#c5983c]
                      "
                    >
                      RAM
                    </span>
                  </div>

                  <p className="font-mono text-2xl font-black text-[#123f59]">
                    {stick?.size || 0} GB
                  </p>

                  <p className="mt-2 text-[11px] font-bold text-[#64748b]">
                    النوع: {stick?.type || "-"} | السرعة:{" "}
                    {stick?.clockSpeed || "-"} MHz
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Disks */}
          <section>
            <SectionTitle
              icon={HardDrive}
              title="وحدات التخزين"
              subtitle="Hard drives and disk usage"
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {disks.map((disk, index) => (
                <div
                  key={index}
                  className="
                    relative overflow-hidden rounded-[24px]
                    border border-purple-200
                    bg-purple-50/60 p-4
                    shadow-[0_12px_30px_rgba(18,63,89,0.06)]
                  "
                >
                  <div
                    className="
                      absolute bottom-0 right-0 h-1
                      bg-purple-500 transition-all duration-500
                    "
                    style={{
                      width: `${disk?.percent || 0}%`,
                    }}
                  />

                  <div className="mb-3 flex items-start justify-between gap-3">
                    <p className="text-sm font-black text-purple-900">
                      قرص ({disk?.mount || "/"})
                    </p>

                    <span
                      className="
                        rounded-xl border border-purple-200
                        bg-white px-2 py-1
                        text-[10px] font-black text-purple-700
                      "
                    >
                      {disk?.type || "Drive"}
                    </span>
                  </div>

                  <p className="font-mono text-4xl font-black text-purple-700">
                    {disk?.percent || 0}%
                  </p>

                  <p className="mt-2 text-xs font-bold text-purple-700/80">
                    مستخدم: {disk?.used || 0} GB من {disk?.total || 0} GB
                  </p>

                  <ProgressBar value={disk?.percent || 0} tone="purple" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Actions */}
      <div
        className="
          overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30 bg-white
          shadow-[0_18px_45px_rgba(18,63,89,0.10)]
        "
      >
        <div
          className="
            flex items-center gap-3 border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#f8efe0] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <span
            className="
              grid h-9 w-9 place-items-center rounded-2xl
              bg-[#123f59] text-[#e2bf74]
            "
          >
            <DatabaseBackup className="h-4 w-4" />
          </span>

          <div>
            <h3 className="text-sm font-black text-[#123f59]">
              إجراءات السيرفر
            </h3>

            <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
              النسخ الاحتياطي وإعادة تشغيل النظام
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-5 md:flex-row">
          <button
            onClick={handleBackup}
            className="
              flex flex-1 items-center justify-center gap-2
              rounded-2xl bg-[#123f59] px-6 py-3
              text-sm font-black text-white
              shadow-[0_12px_30px_rgba(18,63,89,0.22)]
              transition-all duration-300
              hover:-translate-y-[1px]
              hover:bg-[#0f3448]
            "
            type="button"
          >
            <Download className="h-5 w-5 text-[#e2bf74]" />
            تحميل نسخة احتياطية من قاعدة البيانات
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
            className="
              flex items-center justify-center gap-2
              rounded-2xl border border-rose-200
              bg-rose-50 px-6 py-3
              text-sm font-black text-rose-700
              shadow-sm transition-all duration-300
              hover:-translate-y-[1px]
              hover:bg-rose-600
              hover:text-white
            "
            type="button"
          >
            <RotateCw className="h-5 w-5" />
            إعادة تشغيل السيرفر
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionTitle = ({ icon: Icon, title, subtitle }) => (
  <div className="mb-3 flex items-center gap-3">
    <span
      className="
        grid h-10 w-10 place-items-center rounded-2xl
        bg-[#123f59] text-[#e2bf74]
      "
    >
      <Icon className="h-5 w-5" />
    </span>

    <div>
      <h3 className="text-sm font-black text-[#123f59]">{title}</h3>
      <p className="mt-0.5 text-[10px] font-bold text-[#64748b]">
        {subtitle}
      </p>
    </div>
  </div>
);

const MetricCard = ({ label, value, subtitle, tone = "emerald" }) => {
  const tones = {
    emerald: {
      card: "border-emerald-300/45 bg-emerald-50/70",
      label: "text-emerald-700",
      value: "text-emerald-800",
    },
  };

  const t = tones[tone] || tones.emerald;

  return (
    <div
      className={`
        rounded-[24px] border p-4
        shadow-[0_12px_30px_rgba(18,63,89,0.06)]
        ${t.card}
      `}
    >
      <p className={`mb-2 text-xs font-black ${t.label}`}>{label}</p>

      <p className={`font-mono text-4xl font-black ${t.value}`}>{value}</p>

      <p className="mt-2 text-xs font-bold text-[#64748b]">{subtitle}</p>
    </div>
  );
};

const ProgressBar = ({ value = 0, tone = "cyan" }) => {
  const colors = {
    cyan: "from-cyan-500 to-[#123f59]",
    purple: "from-purple-500 to-[#123f59]",
  };

  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/80">
      <div
        className={`h-full rounded-full bg-gradient-to-l ${
          colors[tone] || colors.cyan
        } transition-all duration-500`}
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
};

export default ServerSettings;