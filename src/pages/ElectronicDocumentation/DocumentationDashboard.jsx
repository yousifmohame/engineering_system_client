import React, { useMemo, useState } from "react";
import {
  History,
  SearchCheck,
  Settings2,
  ShieldCheck,
  Fingerprint,
  Stamp,
  Database,
} from "lucide-react";

// استيراد المودالات (النوافذ المنبثقة)
import RegistryModal from "./Screens/RegistryModal";
import VerificationModal from "./Screens/VerificationModal";
import DocSettingsModal from "./Screens/DocSettingsModal";

export default function DocumentationDashboard({ onNavigate }) {
  // حالة فتح النوافذ المنبثقة
  const [modalOpen, setModalOpen] = useState({
    registry: false,
    verify: false,
    settings: false,
  });

  const DOC_MODULES = useMemo(
    () => [
      {
        id: 1,
        type: "modal",
        target: "registry",
        title: "سجل الوثائق",
        desc: "أرشيف كامل لجميع المستندات التي تم توثيقها مسبقاً",
        stat: "الأرشيف الرقمي",
        gradient: "from-blue-600 to-indigo-700",
        icon: History,
      },
      {
        id: 2,
        type: "modal",
        target: "verify",
        title: "فحص ملف موثق",
        desc: "التحقق من صحة المستند عبر الرمز الرقمي أو الـ QR",
        stat: "أداة التحقق",
        gradient: "from-emerald-500 to-teal-700",
        icon: SearchCheck,
      },
      {
        id: 3,
        type: "modal",
        target: "settings",
        title: "إعدادات التوثيق",
        desc: "تخصيص أختام التوثيق وصلاحيات الوصول",
        stat: "تكوين النظام",
        gradient: "from-purple-600 to-pink-600",
        icon: Settings2,
      },
      {
        id: 4,
        type: "tab",
        targetId: "DOC_TEMPLATES",
        title: "قوالب الأختام",
        desc: "إدارة وتصميم أشكال الأختام والعلامات المائية",
        stat: "الهوية الرسمية",
        gradient: "from-amber-500 to-orange-600",
        icon: Stamp,
      },
      {
        id: 5,
        type: "tab",
        targetId: "DOC_LOGS",
        title: "سجل العمليات",
        desc: "تتبع من قام بالتوثيق ومتى تم الوصول للملفات",
        stat: "رقابة أمنية",
        gradient: "from-slate-700 to-slate-900",
        icon: Fingerprint,
      },
      {
        id: 6,
        type: "tab",
        targetId: "DOC_STORAGE",
        title: "إدارة التخزين",
        desc: "مراقبة مساحة الملفات الموثقة والنسخ السحابي",
        stat: "قواعد البيانات",
        gradient: "from-sky-500 to-blue-500",
        icon: Database,
      },
    ],
    [],
  );

  return (
    <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-7xl mx-auto">
        
        {/* قسم الترحيب والإحصائيات السريعة */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              <ShieldCheck className="text-blue-600 w-8 h-8" />
              مركز إدارة التوثيق الرقمي
            </h2>
            <p className="text-sm font-bold text-slate-500 mt-2">
              مرحباً بك في وحدة التحكم الأمنية، يمكنك إدارة وفحص كافة الوثائق الرسمية.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-3 text-center">
              <span className="block text-xs font-black text-blue-400 uppercase font-tajawal">الموثقة اليوم</span>
              <span className="text-xl font-black text-blue-700 font-mono">24</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-6 py-3 text-center">
              <span className="block text-xs font-black text-emerald-400 uppercase font-tajawal">ملفات سليمة</span>
              <span className="text-xl font-black text-emerald-700 font-mono">100%</span>
            </div>
          </div>
        </div>

        {/* شبكة الوحدات */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOC_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => {
                if (module.type === "modal") {
                  setModalOpen(prev => ({ ...prev, [module.target]: true }));
                } else {
                  onNavigate && onNavigate(module.targetId, module.title);
                }
              }}
              className="relative flex items-start gap-5 p-6 bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300 group text-right"
            >
              <div className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br ${module.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <module.icon className="text-white w-8 h-8" />
              </div>

              <div className="flex flex-col gap-1 overflow-hidden">
                <h3 className="font-black text-lg text-slate-800 group-hover:text-blue-700 transition-colors">
                  {module.title}
                </h3>
                <p className="text-xs font-bold text-slate-400 leading-relaxed line-clamp-2">
                  {module.desc}
                </p>
                <div className="mt-3 inline-flex items-center text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full w-fit group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {module.stat}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* استدعاء المودالات (Popups) */}
      <RegistryModal
        isOpen={modalOpen.registry}
        onClose={() => setModalOpen(prev => ({ ...prev, registry: false }))}
      />
      <VerificationModal
        isOpen={modalOpen.verify}
        onClose={() => setModalOpen(prev => ({ ...prev, verify: false }))}
      />
      <DocSettingsModal
        isOpen={modalOpen.settings}
        onClose={() => setModalOpen(prev => ({ ...prev, settings: false }))}
      />
    </div>
  );
}