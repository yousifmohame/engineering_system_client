import React, { useState } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import { Settings, AlertTriangle, RefreshCcw, Loader2, Server } from "lucide-react";

export default function SystemSettings() {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = async () => {
    if (!window.confirm("تحذير: إعادة التشغيل ستؤدي إلى إيقاف النظام لعدة ثوانٍ وقد تقطع العمليات الجارية للمستخدمين الآخرين. هل أنت متأكد؟")) return;
    
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
    <div className="flex flex-col h-full bg-gray-50/50" dir="rtl" style={{ fontFamily: "Tajawal, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-5 bg-white border-b border-gray-200 shrink-0 shadow-sm">
        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shadow-inner">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800">إعدادات النظام (Settings)</h1>
          <p className="text-xs font-semibold text-slate-500">تحكم في متغيرات النظام والعمليات الحرجة</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
          
          {/* Settings Area Placeholder */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-black text-gray-800 mb-1">إعدادات النظام الأساسية</h3>
                <p className="text-[11px] font-semibold text-gray-500">تحكم في المتغيرات العامة التي تؤثر على جميع الواجهات.</p>
              </div>
            </div>
            <div className="p-6">
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Settings className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-sm font-bold">هذه الشاشة مخصصة لإعدادات النظام المستقبلية</p>
                <p className="text-xs font-semibold mt-2">مثل (تغيير اسم النظام، اللوجو، إعدادات البريد، إلخ...)</p>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-red-800 font-black text-sm mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> منطقة الخطر (Danger Zone)
            </h3>
            <p className="text-red-600 text-xs font-semibold mb-5">
              استخدم هذا الزر فقط في حالة تعليق النظام، أو بعد تنصيب تحديثات جديدة تتطلب إعادة تشغيل محرك السيرفر الخلفي (Node.js).
            </p>
            <button
              onClick={handleRestart}
              disabled={isRestarting}
              className="flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {isRestarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
              {isRestarting ? "جاري إعادة التشغيل..." : "إعادة تشغيل السيرفر (Restart)"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}