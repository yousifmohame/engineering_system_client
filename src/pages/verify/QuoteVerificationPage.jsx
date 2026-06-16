import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from '../../api/axios'; // تأكد من مسار الـ axios الخاص بك
import { 
  ShieldCheck, 
  XCircle, 
  Loader2, 
  FileText, 
  Calendar, 
  User, 
  BadgeDollarSign,
  DownloadCloud,
  CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

// دالة لتنظيف الرابط
const getFullUrl = (path) => {
  if (!path) return '#';
  if (path.startsWith('http')) return path;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  return `${baseUrl.replace('/api', '')}${path}`;
};

// مترجم الحالات للواجهة العامة
const STATUS_LABELS = {
  APPROVED: "معتمد وموثق",
  SENT: "معتمد وموثق",
  ACCEPTED: "معتمد ومسدد",
  PARTIALLY_PAID: "معتمد (سداد جزئي)",
  EXPIRED: "منتهي الصلاحية",
  CANCELLED: "ملغى",
  REJECTED: "ملغى"
};

export default function QuoteVerificationPage() {
  const { barcode } = useParams();

  // جلب بيانات التحقق من الباك إند
  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-quote', barcode],
    queryFn: async () => {
      // نستخدم المسار العام الذي أنشأناه للتو
      const res = await axios.get(`/quotations/verify/${barcode}`);
      return res.data.data;
    },
    retry: false // لا داعي للمحاولة إذا كان الـ QR خاطئاً
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-[Tajawal]" dir="rtl">
        <Loader2 className="w-12 h-12 text-[#123f59] animate-spin mb-4" />
        <h2 className="text-lg font-black text-slate-700">جاري التحقق من الوثيقة...</h2>
        <p className="text-sm text-slate-500 mt-2">يرجى الانتظار، يتم الاتصال بقاعدة البيانات</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 font-[Tajawal]" dir="rtl">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">وثيقة غير صالحة!</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            عفواً، لم نتمكن من العثور على هذه الوثيقة في سجلاتنا، أو أن رمز التحقق (QR Code) غير صحيح.
          </p>
          <div className="text-xs font-bold text-slate-400 font-mono bg-slate-100 p-2 rounded-lg break-all">
            {barcode}
          </div>
        </div>
      </div>
    );
  }

  // 🌟 إذا كانت الوثيقة صحيحة
  const clientName = data.client?.name?.ar || data.client?.name || "عميل النظام";
  const isValidAndActive = ["APPROVED", "SENT", "ACCEPTED", "PARTIALLY_PAID"].includes(data.status);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center py-10 px-4 font-[Tajawal]" dir="rtl">
      
      {/* الترويسة (اللوجو) */}
      <div className="mb-6">
         {/* ضع رابط اللوجو الخاص بشركتك هنا */}
        <img src="https://details-worksystem1.com/logo.svg" alt="Details Consults" className="h-16 object-contain mix-blend-multiply" />
      </div>

      <div className="bg-white max-w-md w-full rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100 relative">
        
        {/* خلفية أمنية زخرفية */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#123f59] to-[#0f3448] z-0"></div>

        {/* كارت النتيجة */}
        <div className="relative z-10 pt-8 px-6 pb-6 text-center">
          
          <div className="relative inline-block mb-4">
            <div className={`w-24 h-24 rounded-full border-4 border-white flex items-center justify-center shadow-lg mx-auto ${isValidAndActive ? 'bg-emerald-500' : 'bg-rose-500'}`}>
              {isValidAndActive ? <ShieldCheck className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
            </div>
            {isValidAndActive && (
              <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
            )}
          </div>

          <h1 className={`text-2xl font-black mb-1 ${isValidAndActive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isValidAndActive ? 'وثيقة أصلية ومعتمدة' : 'وثيقة ملغاة أو منتهية'}
          </h1>
          <p className="text-sm font-bold text-slate-500 mb-6">
            تم التحقق بنجاح من قاعدة بيانات شركة ديتيلز كونسولتس
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 text-right space-y-4 border border-slate-100">
            
            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><FileText className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">الرقم المرجعي للمستند</p>
                <p className="text-sm font-black text-[#123f59] font-mono mt-0.5">{data.number}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><User className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">العميل المُصدر له</p>
                <p className="text-sm font-black text-[#123f59] mt-0.5">{clientName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">تاريخ الاعتماد والختم</p>
                <p className="text-sm font-black text-[#123f59] mt-0.5 font-mono">
                  {data.stampedAt ? format(new Date(data.stampedAt), 'yyyy-MM-dd hh:mm a', { locale: arSA }) : 'غير محدد'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><BadgeDollarSign className="w-5 h-5" /></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400">إجمالي قيمة العرض</p>
                <p className="text-sm font-black text-emerald-700 mt-0.5 font-mono">
                  {Number(data.total).toLocaleString()} ر.س
                </p>
              </div>
            </div>

          </div>

          <div className="mt-4 flex items-center justify-between px-2">
            <span className="text-xs font-bold text-slate-500">حالة المستند الحالية:</span>
            <span className={`text-xs font-black px-3 py-1 rounded-full ${isValidAndActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {STATUS_LABELS[data.status] || data.status}
            </span>
          </div>

        </div>

        {/* زر تحميل النسخة الأصلية */}
        {data.pdfUrl && isValidAndActive && (
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <a 
              href={getFullUrl(data.pdfUrl)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#123f59] hover:bg-[#0f3448] text-white rounded-xl text-sm font-black transition-colors shadow-md"
            >
              <DownloadCloud className="w-5 h-5 text-[#e2bf74]" />
              تحميل النسخة الإلكترونية المعتمدة
            </a>
          </div>
        )}
      </div>

      <p className="text-[10px] font-bold text-slate-400 mt-6 text-center max-w-xs leading-relaxed">
        هذه الصفحة تم إنشاؤها آلياً بواسطة نظام الأختام الرقمية الآمنة لشركة ديتيلز كونسولتس.
      </p>

    </div>
  );
}