import React, { useState } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import { clsx } from "clsx";
import {
  Settings,
  AlertTriangle,
  RefreshCcw,
  Loader2,
  Server,
  LayoutTemplate,
  MonitorPlay,
  PanelBottom,
  PaintBucket,
  ListOrdered,
  Image as ImageIcon
} from "lucide-react";

export default function SystemSettings() {
  // حالة التحكم بالتبويب النشط
  const [activeTab, setActiveTab] = useState("sidebar");
  const [isRestarting, setIsRestarting] = useState(false);

  // إعدادات التبويبات الداخلية
  const TABS = [
    {
      id: "sidebar",
      title: "إعدادات القائمة الجانبية",
      icon: LayoutTemplate,
      desc: "ترتيب القوائم، الألوان، اللوجو، وسلوك الفتح والإغلاق",
    },
    {
      id: "header",
      title: "إعدادات الشريط العلوي",
      icon: MonitorPlay,
      desc: "التحكم في شريط البحث، الإشعارات، وملف المستخدم",
    },
    {
      id: "footer",
      title: "إعدادات التذييل",
      icon: PanelBottom,
      desc: "تغيير نصوص الفوتر، الإصدار، وحقوق الملكية",
    },
    {
      id: "server",
      title: "إدارة السيرفر (منطقة الخطر)",
      icon: Server,
      desc: "إعادة تشغيل المحرك والعمليات الحرجة للنظام",
    },
  ];

  const handleRestart = async () => {
    if (
      !window.confirm(
        "تحذير: إعادة التشغيل ستؤدي إلى إيقاف النظام لعدة ثوانٍ وقد تقطع العمليات الجارية للمستخدمين الآخرين. هل أنت متأكد؟"
      )
    )
      return;

    setIsRestarting(true);
    toast.info("تم إرسال أمر إعادة التشغيل للسيرفر...");
    try {
      await api.post("/server/restart");
      setTimeout(() => {
        window.location.reload();
      }, 5000); // تحديث الصفحة بعد 5 ثوانٍ
    } catch (error) {
      toast.error("فشل إرسال أمر إعادة التشغيل");
      setIsRestarting(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#f8fafc] font-[Tajawal] overflow-hidden"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-inner">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 leading-tight">
            إعدادات النظام الشاملة
          </h1>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            تحكم في مظهر النظام، ترتيب القوائم، والعمليات الحرجة
          </p>
        </div>
      </div>

      {/* ── Main Content Area (Layout with Internal Sidebar) ── */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ── Internal Sidebar (Right) ── */}
        <div className="w-[260px] bg-white border-l border-slate-200 shadow-[2px_0_10px_rgba(0,0,0,0.02)] flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar-slim">
          <div className="p-4 space-y-1">
            <h3 className="text-[10px] font-black text-slate-400 mb-3 px-2 uppercase tracking-wider">
              أقسام الإعدادات
            </h3>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-right group",
                    isActive
                      ? "bg-blue-50 border border-blue-100 shadow-sm"
                      : "hover:bg-slate-50 border border-transparent"
                  )}
                >
                  <div
                    className={clsx(
                      "p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors",
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-50"
                    )}
                  >
                    <TabIcon size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={clsx(
                        "text-[13px] font-black transition-colors",
                        isActive ? "text-blue-800" : "text-slate-700"
                      )}
                    >
                      {tab.title}
                    </span>
                    <span
                      className={clsx(
                        "text-[9px] font-bold leading-tight",
                        isActive ? "text-blue-600/80" : "text-slate-400"
                      )}
                    >
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Dynamic Content Area (Left) ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 custom-scrollbar-slim relative">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* ── 1. تبويب القائمة الجانبية (Sidebar Settings) ── */}
            {activeTab === "sidebar" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-blue-600" /> مظهر وسلوك القائمة الجانبية
                      </h3>
                      <p className="text-[11px] font-bold text-slate-500">
                        تحكم كامل في ترتيب الشاشات، الألوان، وشعار النظام (Logo).
                      </p>
                    </div>
                  </div>
                  
                  {/* Placeholder for future specific controls */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <ListOrdered className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                      <span className="text-xs font-black text-slate-600">ترتيب القوائم (Drag & Drop)</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1">سيتم إضافته قريباً</span>
                    </div>
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                      <span className="text-xs font-black text-slate-600">تغيير شعار النظام (Logo)</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1">سيتم إضافته قريباً</span>
                    </div>
                    <div className="border border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                      <PaintBucket className="w-8 h-8 text-slate-300 group-hover:text-blue-500 mb-2 transition-colors" />
                      <span className="text-xs font-black text-slate-600">ألوان وتنسيقات القائمة</span>
                      <span className="text-[9px] text-slate-400 font-bold mt-1">سيتم إضافته قريباً</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── 2. تبويب الشريط العلوي (Header Settings) ── */}
            {activeTab === "header" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4 text-blue-600" /> إعدادات الشريط العلوي
                    </h3>
                  </div>
                </div>
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                  <MonitorPlay className="w-12 h-12 mb-3 text-slate-200" />
                  <p className="text-sm font-bold text-slate-500">جاري تطوير هذا القسم</p>
                </div>
              </div>
            )}

            {/* ── 3. تبويب التذييل (Footer Settings) ── */}
            {activeTab === "footer" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                      <PanelBottom className="w-4 h-4 text-blue-600" /> إعدادات التذييل
                    </h3>
                  </div>
                </div>
                <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                  <PanelBottom className="w-12 h-12 mb-3 text-slate-200" />
                  <p className="text-sm font-bold text-slate-500">جاري تطوير هذا القسم</p>
                </div>
              </div>
            )}

            {/* ── 4. إدارة السيرفر (Danger Zone) ── */}
            {activeTab === "server" && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-md relative overflow-hidden">
                  {/* Decorative Background Element */}
                  <AlertTriangle className="absolute -left-4 -top-4 w-32 h-32 text-red-100 opacity-50 rotate-12" />
                  
                  <div className="relative z-10">
                    <h3 className="text-red-800 font-black text-base mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> منطقة الخطر (Danger Zone)
                    </h3>
                    <p className="text-red-700/80 text-[11px] font-bold mb-6 max-w-xl leading-relaxed">
                      استخدم هذا الزر فقط في حالة تعليق النظام، أو بعد تنصيب تحديثات برمجية جديدة تتطلب إعادة تشغيل محرك السيرفر الخلفي (Node.js). 
                      إعادة التشغيل ستؤدي إلى طرد المستخدمين مؤقتاً لعدة ثوانٍ.
                    </p>
                    
                    <div className="flex items-center gap-4 border-t border-red-200/50 pt-5 mt-2">
                      <button
                        onClick={handleRestart}
                        disabled={isRestarting}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white font-black px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:shadow-none"
                      >
                        {isRestarting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="w-4 h-4" />
                        )}
                        {isRestarting
                          ? "جاري إرسال الأمر..."
                          : "إعادة تشغيل السيرفر (Restart Node.js)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}