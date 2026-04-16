import React, { useState } from "react";
import { Server, AlertOctagon, RefreshCw } from "lucide-react";
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
    <div className="p-8 max-w-2xl mx-auto text-center animate-in fade-in" dir="rtl">
      <div className="bg-red-50 border border-red-200 rounded-3xl p-8 shadow-sm">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
          <Server size={40} />
        </div>
        <h2 className="text-2xl font-black text-red-800 mb-2">إدارة المحرك والسيرفر</h2>
        <p className="text-sm font-bold text-red-600 mb-8 leading-relaxed">
          هذه المنطقة مخصصة للإدارة العليا ومطوري النظام. إعادة تشغيل السيرفر ستؤدي إلى فصل جميع المستخدمين المتصلين حالياً.
        </p>

        <button
          onClick={handleRestart}
          disabled={isRestarting}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 mx-auto shadow-lg shadow-red-200 transition-all active:scale-95 disabled:opacity-50"
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