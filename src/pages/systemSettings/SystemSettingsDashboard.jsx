import React, { useMemo } from "react";
import {
  Settings,
  LayoutTemplate,
  MonitorPlay,
  PanelBottom,
  Server,
  DatabaseBackup,
  Cpu,
  ShieldCheck,
  Smartphone
} from "lucide-react";

export default function SystemSettingsDashboard({ onNavigate }) {
  const SETTINGS_MODULES = useMemo(
    () => [
      {
        id: 1,
        targetId: "SET_SIDEBAR",
        title: "المظهر والهيكلة",
        desc: "تخصيص الألوان وترتيب القوائم والشعار",
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
      {
        id: 6,
        targetId: "SET_HEADER",
        title: "الشريط العلوي",
        desc: "إعدادات البحث والإشعارات",
        stat: "إعدادات",
        gradient: "from-indigo-500 to-purple-600",
        icon: MonitorPlay,
      },
      {
        id: 7,
        targetId: "SET_DEVICES", // 👈 اسم الـ ID للتاب
        title: "إدارة الأجهزة",
        desc: "تتبع الأجهزة، طباعة الـ QR Code والعهد",
        stat: "الأصول",
        gradient: "from-cyan-500 to-blue-600",
        icon: Smartphone, 
      },
    ],
    [],
  );

  return (
    <div className="flex flex-col h-full bg-slate-50 font-cairo" dir="rtl">
      <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50">
        <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Settings className="text-slate-800 w-6 h-6 md:w-8 md:h-8" />
              لوحة التحكم وإعدادات النظام
            </h2>
            <p className="text-xs md:text-sm font-bold text-slate-500 mt-1.5">
              إدارة المظهر، الأداء، والموارد الخاصة بالنظام
            </p>
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
                className="relative flex flex-col items-center justify-center p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-400 hover:-translate-y-1.5 transition-all duration-300 group"
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${module.gradient} shadow-inner group-hover:scale-110 transition-transform duration-300`}
                >
                  <module.icon className="text-white w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div className="flex flex-col items-center gap-1 w-full">
                  <h3 className="font-black text-[13px] md:text-[15px] text-slate-800 text-center leading-tight">
                    {module.title}
                  </h3>
                  <p className="text-[10px] md:text-[11px] font-bold text-slate-400 text-center line-clamp-2 w-full mt-1">
                    {module.desc}
                  </p>
                </div>
                <div className="mt-4 w-full bg-slate-50 border border-slate-100 rounded-lg py-1.5 px-2 text-center text-[9px] md:text-[10px] font-black text-slate-500 truncate group-hover:bg-slate-100 group-hover:text-slate-800 transition-colors">
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
