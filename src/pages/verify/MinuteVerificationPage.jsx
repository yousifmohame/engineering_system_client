import React from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import api from "../../api/axios"; // تأكد من مسار axios
// 💡 استيراد مكون الطباعة والمعاينة (تأكد من صحة مسار الاستيراد حسب مجلداتك)
import MeetingMinutePreview from "../MeetingMinute/MeetingMinutePreview";

export default function MinuteVerificationPage() {
  const { refNumber } = useParams(); // استخراج الرمز من الرابط

  const {
    data: minute,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["verify-minute", refNumber],
    queryFn: async () => {
      const res = await api.get(`/meeting-minutes/verify/${refNumber}`);
      return res.data?.data;
    },
    retry: false,
  });

  // حالة التحميل
  if (isLoading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-sm font-black text-slate-500">
          جاري التحقق من المستند عبر قواعد البيانات...
        </p>
      </div>
    );

  // حالة الخطأ أو المستند مزور
  if (isError || !minute)
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6"
        dir="rtl"
      >
        <ShieldAlert className="w-24 h-24 text-rose-500 mb-6 drop-shadow-md" />
        <h1 className="text-3xl font-black text-slate-900 mb-3">
          مستند غير صالح
        </h1>
        <p className="text-base font-bold text-slate-500 text-center max-w-md leading-relaxed">
          تعذر التحقق من صحة هذا المستند. إما أن رمز التحقق غير صحيح، أو أن
          المستند تم إلغاؤه من النظام، أو أنه مزور.
        </p>
      </div>
    );

  return (
    <div
      className="min-h-screen bg-slate-100 flex flex-col items-center py-10 px-4 custom-scrollbar"
      dir="rtl"
    >
      {/* 🟢 شريط تأكيد الموثوقية (Banner) */}
      <div className="w-full max-w-[210mm] bg-gradient-to-l from-emerald-600 to-emerald-700 rounded-3xl shadow-xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-white relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="flex items-center gap-5 z-10 text-center sm:text-right">
          <div className="bg-white text-emerald-600 p-3 rounded-full shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black mb-1">مستند موثق ومعتمد</h1>
            <p className="text-emerald-100 text-sm font-bold">
              هذا المستند صادر من النظام الآلي ومسجل رسمياً
            </p>
          </div>
        </div>

        <div className="z-10 bg-black/10 border border-white/20 rounded-2xl p-4 flex flex-col items-center sm:items-end min-w-[180px]">
          <div className="text-xs font-bold text-emerald-200 mb-1">
            تاريخ التحقق الآني
          </div>
          <div className="text-base font-black font-mono tracking-wider">
            {new Date().toLocaleString("ar-SA")}
          </div>
        </div>
      </div>

      {/* 📄 عرض المحضر بالكامل */}
      <div className="w-full flex justify-center pb-20">
        {/* نمرر isInternal={false} لضمان عدم ظهور أي بيانات داخلية بالخطأ */}
        <MeetingMinutePreview minute={minute} zoom={1} isInternal={false} />
      </div>
    </div>
  );
}
