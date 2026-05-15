import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileSignature,
  Receipt,
  FileText,
  FileUp,
  Zap,
  Clock,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Search,
  Loader2,
  Ban,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api from "../../../api/axios";

export default function DashboardTab({ setActiveTab }) {
  const [verifyToken, setVerifyToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // 🚀 جلب البيانات والإحصائيات من الباك إند مباشرة
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["documentation-dashboard"],
    queryFn: async () => {
      const res = await api.get("/documentation/dashboard"); // تأكد من مسار الروتر الخاص بك
      return res.data;
    }
  });

  const stats = dashboardData?.stats;
  const recentActivity = dashboardData?.recentActivity || [];

  // 🛡️ دالة التحقق من المستند عبر السيرفر (بنظام الـ 8 أرقام)
  const handleVerify = async () => {
    const cleanToken = verifyToken.trim();
    if (!cleanToken) {
      toast.error("يرجى إدخال رمز التحقق (8 أرقام)");
      return;
    }
    
    setIsVerifying(true);
    try {
      // استدعاء دالة التحقق التي برمجناها في الباك إند
      const response = await api.get(`/documentation/verify/${cleanToken}`);
      
      if (response.data.success) {
        const doc = response.data.data;
        toast.success(
          <div className="flex flex-col gap-1">
            <span className="font-black text-emerald-600">مستند سليم وموثق! ✅</span>
            <span className="text-xs">الاسم: {doc.name}</span>
            <span className="text-xs">الطرف الثاني: {doc.partyB}</span>
          </div>,
          { duration: 5000 }
        );
      }
    } catch (error) {
      // معالجة الأخطاء (مزور أو تم إبطاله REVOKED)
      const status = error.response?.status;
      const message = error.response?.data?.message || "مستند مزور أو غير موجود في النظام";
      
      if (status === 403) {
        toast.error(`⚠️ تحذير أمني: ${message}`, { duration: 6000 });
      } else {
        toast.error(`❌ ${message}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // دالة مساعدة لاختيار الأيقونة واللون بناءً على نوع المستند
  const getDocStyles = (type) => {
    switch (type) {
      case "CONTRACT": return { icon: FileSignature, bg: "bg-blue-50", color: "text-blue-600" };
      case "INVOICE": return { icon: Receipt, bg: "bg-indigo-50", color: "text-indigo-600" };
      case "QUOTATION": return { icon: FileText, bg: "bg-violet-50", color: "text-violet-600" };
      default: return { icon: FileUp, bg: "bg-amber-50", color: "text-amber-600" };
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* 📊 شبكة الإحصائيات (مربوطة بالسيرفر) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "عقود موثقة", value: stats?.totalContracts || 0, icon: FileSignature, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "فواتير موثقة", value: stats?.totalInvoices || 0, icon: Receipt, color: "text-indigo-600", bg: "bg-indigo-50" },
          { label: "عروض أسعار", value: stats?.totalQuotes || 0, icon: FileText, color: "text-violet-600", bg: "bg-violet-50" },
          { label: "ملفات خارجية", value: stats?.totalExternal || 0, icon: FileUp, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "وثائق مبطلة (Revoked)", value: stats?.revokedDocs || 0, icon: Ban, color: "text-rose-600", bg: "bg-rose-50" },
        ].map((stat, i) => (
          <div key={i} className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-800">{stat.value.toLocaleString()}</div>
            <div className="text-[11px] font-bold text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 🕒 النشاطات الأخيرة (آخر عمليات التوثيق) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> آخر عمليات التوثيق
            </h3>
            {setActiveTab && (
              <button onClick={() => setActiveTab("registry")} className="text-xs font-black text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
                عرض السجل الكامل
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-50 flex-1 overflow-y-auto custom-scrollbar">
            {recentActivity.length > 0 ? (
              recentActivity.map((item) => {
                const docStyle = getDocStyles(item.type);
                const DocIcon = docStyle.icon;
                const isRevoked = item.status === "REVOKED";

                return (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={`p-2.5 rounded-xl ${isRevoked ? 'bg-rose-50 text-rose-600' : docStyle.bg + ' ' + docStyle.color}`}>
                        {isRevoked ? <AlertTriangle className="w-5 h-5" /> : <DocIcon className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className={`text-sm font-black ${isRevoked ? 'text-rose-900 line-through decoration-rose-300' : 'text-slate-800'}`}>
                          {item.name}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                          الطرف المعني: {item.partyB || "غير محدد"} • {new Date(item.createdAt).toLocaleString("ar-SA")}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="flex flex-col items-end">
                        <code className="px-2.5 py-1 bg-slate-100 rounded-md text-[11px] font-black text-slate-600 font-mono tracking-widest border border-slate-200" title="رمز التحقق">
                          {item.verificationToken}
                        </code>
                        <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Token</span>
                      </div>
                      <div className="flex flex-col items-center justify-center w-8">
                        {isRevoked ? (
                          <Ban className="w-5 h-5 text-rose-500" title="تم إبطال الوثيقة" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" title="موثق" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="p-12 flex flex-col items-center justify-center text-slate-400">
                <FileText className="w-12 h-12 mb-3 opacity-20" />
                <span className="text-sm font-bold">لا توجد عمليات توثيق حتى الآن.</span>
              </div>
            )}
          </div>
        </div>

        {/* 🛡️ حالة الأمان والتحقق السريع */}
        <div className="space-y-6">
          
          {/* شارة الأمان */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl relative overflow-hidden">
            <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
            <h4 className="text-lg font-black flex items-center gap-2 mb-5 relative z-10">
              <ShieldCheck className="w-6 h-6 text-blue-400" /> حالة الأمان الرقمي
            </h4>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-bold">تشفير البيانات</span>
                <span className="text-blue-400 font-black">نشط (AES-256)</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-3">
                <span className="text-slate-400 font-bold">سيرفر التوثيق</span>
                <span className="text-emerald-400 font-black flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> مستقر</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">إجمالي الأختام المصدرة</span>
                <span className="text-white font-black">
                  {stats ? (stats.totalContracts + stats.totalInvoices + stats.totalQuotes + stats.totalExternal).toLocaleString() : 0} ختم
                </span>
              </div>
              <div className="pt-2">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-slate-300 font-medium leading-relaxed">
                    يتم تأمين كافة المستندات الموثقة عبر نظامك بطابع زمني مشفر ورمز تحقق فريد (8 أرقام) مرتبط بقاعدة البيانات لضمان عدم التزوير.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* أداة التحقق السريع */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" /> التحقق السريع (Token)
            </h4>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  maxLength={8}
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value.replace(/[^0-9]/g, ''))} // إجبار على إدخال أرقام فقط
                  placeholder="أدخل الـ 8 أرقام (مثال: 83749215)"
                  className="w-full pr-9 pl-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-left font-mono tracking-widest"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <button 
                onClick={handleVerify}
                disabled={isVerifying || verifyToken.length < 8}
                className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-black hover:bg-slate-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 active:scale-95"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "تحقق من صحة المستند"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}