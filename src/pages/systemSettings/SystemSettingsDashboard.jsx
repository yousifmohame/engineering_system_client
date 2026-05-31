import React, { useMemo } from "react";
import {
  Settings,
  LayoutTemplate,
  BrainCircuit,
  Server,
  DatabaseBackup,
  Cpu,
  ShieldCheck,
  Smartphone,
  Sparkles
} from "lucide-react";

export default function SystemSettingsDashboard({ onNavigate }) {
  const SETTINGS_MODULES = useMemo(
    () => [
      {
        id: 1,
        targetId: "SET_SIDEBAR",
        title: "المظهر والهيكلة",
        desc: "تخصيص الهيكلة وترتيب القوائم",
        stat: "UI / UX",
        gradient: "from-blue-500 to-blue-700",
        icon: LayoutTemplate,
      },
      {
        id: 2,
        targetId: "SET_BACKUP",
        title: "النسخ الاحتياطي",
        desc: "أخذ نسخة احتياطية لقواعد البيانات والملفات",
        stat: "آمن",
        gradient: "from-emerald-500 to-teal-700",
        icon: DatabaseBackup,
      },
      {
        id: 3,
        targetId: "SET_MONITOR",
        title: "مراقبة الموارد",
        desc: "استهلاك المعالج، الرام، ومساحة التخزين",
        stat: "Live",
        gradient: "from-amber-500 to-orange-600",
        icon: Cpu,
      },
      {
        id: 4,
        targetId: "SET_SERVER",
        title: "إدارة المحرك",
        desc: "إعادة تشغيل النظام والتحكم بالسيرفر",
        stat: "منطقة خطرة",
        gradient: "from-rose-500 to-red-700",
        icon: Server,
      },
      {
        id: 5,
        targetId: "SET_TAILSCALE",
        title: "اعدادات TailScale",
        desc: "إدارة الشبكة الخاصة الافتراضية (VPN)",
        stat: "متقدم",
        gradient: "from-sky-500 to-cyan-600",
        icon: ShieldCheck,
      },
      // Header settings module is temporarily disabled.
      // It is not used for now, so the dashboard card is hidden.
      // {
      //   id: 6,
      //   targetId: "SET_HEADER",
      //   title: "الشريط العلوي",
      //   desc: "إعدادات البحث والإشعارات",
      //   stat: "إعدادات",
      //   gradient: "from-indigo-500 to-purple-600",
      //   icon: MonitorPlay,
      // },
      {
        id: 7,
        targetId: "SET_DEVICES", // 👈 اسم الـ ID للتاب
        title: "إدارة الأجهزة",
        desc: "تتبع الأجهزة، طباعة الـ QR Code والعهد",
        stat: "الأصول",
        gradient: "from-cyan-500 to-blue-600",
        icon: Smartphone,
      },
      {
        id: 8,
        targetId: "SET_AI",
        title: "الذكاء الاصطناعي",
        desc: "إدارة مفاتيح Gemini، الطوابير، والأرشفة الذكية",
        stat: "مركز المعالجة",
        gradient: "from-purple-600 to-indigo-700",
        icon: BrainCircuit,
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col h-full bg-[#eef5f7] font-cairo" dir="rtl">
      <div className="flex-1 overflow-auto p-4 md:p-5 bg-[#eef5f7]">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
          <div className="sys-compact-page-header flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-[13px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0 shadow-sm">
                <Settings className="w-4 h-4" />
              </div>
              <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
                <h2 className="text-[16px] font-bold leading-tight whitespace-nowrap text-white">لوحة التحكم وإعدادات النظام</h2>
                <p className="text-[10px] font-semibold text-white/75 mt-0.5 whitespace-nowrap">إدارة المظهر، الأداء، والموارد الخاصة بالنظام</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-5">
            {SETTINGS_MODULES.map((module) => (
              <button
                key={module.id}
                onClick={() => {
                  if (module.targetId && onNavigate) {
                    onNavigate(module.targetId, module.title);
                  }
                }}
                className="relative overflow-hidden flex flex-col items-center justify-center p-4 bg-white border border-[#d8e6ee] rounded-[24px] shadow-sm hover:shadow-lg hover:border-[#d9b85b] hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className={`absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l ${module.gradient}`} />
                <div
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-[20px] flex items-center justify-center mb-3 bg-gradient-to-br ${module.gradient} text-white shadow-sm group-hover:scale-105 transition-transform duration-300`}
                >
                  <module.icon className="w-7 h-7 md:w-8 md:h-8" />
                </div>
                <div className="flex flex-col items-center gap-1 w-full relative z-10">
                  <h3 className="font-black text-[12px] md:text-[13px] text-[#123B5D] text-center leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-[9.5px] md:text-[10px] font-bold text-[#71839a] text-center line-clamp-2 w-full mt-1">
                    {module.desc}
                  </p>
                </div>
                <div className="mt-3 w-full bg-[#fbf7ef] border border-[#ead9b8] rounded-lg py-1.5 px-2 text-center text-[9px] md:text-[10px] font-black text-[#123B5D] truncate group-hover:bg-[#eef5f7] transition-colors relative z-10">
                  {module.stat}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
