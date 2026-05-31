import React, { useState } from "react";
import { Server, AlertOctagon, RefreshCw, ShieldAlert } from "lucide-react";
import api from "../../../api/axios";
import { toast } from "sonner";

export default function ServerManagementTab() {
  const [isRestarting, setIsRestarting] = useState(false);

  const handleRestart = async () => {
    if (!window.confirm("تحذير: سيتم إيقاف النظام مؤقتاً لجميع المستخدمين، هل أنت متأكد؟")) return;
    setIsRestarting(true);
    toast.info("تم إرسال أمر إعادة التشغيل...");
    try {
      await api.post("/server/restart");
      setTimeout(() => window.location.reload(), 5000);
    } catch (error) {
      toast.error("فشل إرسال أمر إعادة التشغيل");
      setIsRestarting(false);
    }
  };

  return (
    <div className="p-4 md:p-5 max-w-3xl mx-auto animate-in fade-in" dir="rtl">
      <div className="sys-compact-page-header flex items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-[13px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0 shadow-sm">
            <Server className="w-4 h-4" />
          </div>
          <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
            <h2 className="text-[16px] font-bold leading-tight whitespace-nowrap text-white">إدارة المحرك والسيرفر</h2>
            <p className="text-[10px] font-semibold text-white/75 mt-0.5 whitespace-nowrap">إعادة تشغيل النظام والتحكم بالخدمات الحرجة</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#d8e6ee] rounded-[24px] p-6 md:p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-[#fbf7ef] border border-[#ecd8a6] rounded-[20px] flex items-center justify-center mx-auto mb-5 text-[#c7862f]">
          <ShieldAlert size={30} />
        </div>
        <h3 className="text-lg font-black text-[#123B5D] mb-2">منطقة حساسة</h3>
        <p className="text-sm font-bold text-[#71839a] mb-8 leading-relaxed max-w-xl mx-auto">
          هذه المنطقة مخصصة للإدارة العليا ومطوري النظام. إعادة تشغيل السيرفر ستؤدي إلى فصل جميع المستخدمين المتصلين حالياً.
        </p>

        <button
          onClick={handleRestart}
          disabled={isRestarting}
          className="bg-[#083646] hover:bg-[#0f6d7c] text-white px-8 py-3.5 rounded-[18px] font-black text-sm flex items-center justify-center gap-3 mx-auto shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          {isRestarting ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <AlertOctagon className="w-5 h-5" />
          )}
          {isRestarting ? "جاري إعادة تشغيل النظام..." : "إعادة تشغيل النظام فوراً"}
        </button>
      </div>
    </div>
  );
}