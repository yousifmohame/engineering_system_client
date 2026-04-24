import React, { useState } from "react";
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
  Search
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/axios"; // تأكد من مسار الـ axios الخاص بك

export const DashboardTab = ({ documentedItems, stats, setActiveTab }) => {
  const [verifySerial, setVerifySerial] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // دالة التحقق من المستند عبر السيرفر
  const handleVerify = async () => {
    if (!verifySerial.trim()) {
      toast.error("يرجى إدخال السريال الرقمي للتحقق");
      return;
    }
    
    setIsVerifying(true);
    try {
      const response = await api.get(`/documentation/verify/${verifySerial}`);
      if (response.data.success) {
        toast.success(`مستند سليم وموثق! خاص بـ: ${response.data.data.partyB}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "مستند مزور أو غير موجود في النظام");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* شبكة الإحصائيات (مربوطة بالسيرفر) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[
          {
            label: "إجمالي العقود الموثقة",
            value: stats?.totalContracts || 0,
            icon: FileSignature,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "فواتير موثقة",
            value: stats?.totalInvoices || 0,
            icon: Receipt,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
          {
            label: "عروض أسعار موثقة",
            value: stats?.totalQuotes || 0,
            icon: FileText,
            color: "text-violet-600",
            bg: "bg-violet-50",
          },
          {
            label: "ملفات خارجية",
            value: stats?.totalExternal || 0,
            icon: FileUp,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}
            >
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-800">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs font-bold text-slate-500 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
        
        {/* شارة الذكاء الاصطناعي والأمان */}
        <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-1 p-6 bg-indigo-600 rounded-3xl border border-indigo-500 shadow-xl shadow-indigo-200 text-white group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="text-2xl font-black text-white">
              AI Integrity Scan
            </div>
            <div className="text-[10px] font-bold text-indigo-100 mt-1 uppercase tracking-widest">
              Neural Accuracy: 99.9%
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* النشاطات الأخيرة (آخر 5 عمليات توثيق) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> آخر عمليات التوثيق
            </h3>
            <button
              onClick={() => setActiveTab("registry")}
              className="text-xs font-black text-blue-600 hover:underline"
            >
              عرض الكل
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {documentedItems && documentedItems.length > 0 ? (
              documentedItems.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-2 rounded-lg ${
                        item.type === "CONTRACT"
                          ? "bg-blue-50 text-blue-600"
                          : item.type === "INVOICE"
                            ? "bg-indigo-50 text-indigo-600"
                            : item.type === "QUOTATION"
                              ? "bg-violet-50 text-violet-600"
                              : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {item.type === "CONTRACT" ? (
                        <FileSignature className="w-4 h-4" />
                      ) : item.type === "INVOICE" ? (
                        <Receipt className="w-4 h-4" />
                      ) : item.type === "QUOTATION" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <FileUp className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-800">
                        {item.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        {item.partyB} •{" "}
                        {/* دعم التوافق مع Prisma createdAt أو timestamp الوهمي */}
                        {new Date(item.createdAt || item.timestamp).toLocaleString("ar-SA")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <code className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 font-mono">
                      {item.serialNumber || item.serial}
                    </code>
                    <div className="flex flex-col items-end">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-[7px] font-black text-slate-400 mt-0.5 uppercase">
                        Anchored @ Blockchain
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-sm font-bold text-slate-400">
                لا توجد عمليات توثيق حتى الآن.
              </div>
            )}
          </div>
        </div>

        {/* حالة الأمان والتحقق السريع */}
        <div className="space-y-6">
          {/* حالة الأمان */}
          <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl">
            <h4 className="text-lg font-black flex items-center gap-2 mb-4">
              <ShieldCheck className="w-6 h-6 text-blue-500" /> حالة الأمان
              الرقمي
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">تشفير البيانات</span>
                <span className="text-blue-400 font-black">نشط (AES-256)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">سيرفر التوثيق</span>
                <span className="text-emerald-400 font-black">متصل ومستقر</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold">إجمالي الأختام</span>
                <span className="text-blue-400 font-black">
                  {stats ? Object.values(stats).reduce((a, b) => a + b, 0).toLocaleString() : 0} ختم
                </span>
              </div>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  يتم تأمين كافة المستندات الموثقة عبر نظام Remix Engineering
                  بطابع زمني مشفر وسريال رقمي فريد مرتبط بقاعدة بيانات الشركة.
                </p>
              </div>
            </div>
          </div>

          {/* أداة التحقق السريع */}
          <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-600" /> التحقق السريع
            </h4>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={verifySerial}
                  onChange={(e) => setVerifySerial(e.target.value)}
                  placeholder="أدخل السريال (مثال: SEC-2024-123)..."
                  className="w-full pr-9 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-blue-600/20 transition-all text-left"
                  dir="ltr"
                  onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                />
              </div>
              <button 
                onClick={handleVerify}
                disabled={isVerifying || !verifySerial.trim()}
                className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
              >
                {isVerifying ? (
                  <>جاري التحقق...</>
                ) : (
                  <>تحقق من المستند</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};