import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../api/axios'; // 💡 تأكد من مسار axios
import ExternalUploadPage from './ExternalUploadPage';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function ClientRequestWrapper() {
  const { shortLink } = useParams(); // قراءة الكود من الرابط

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-req-link', shortLink],
    queryFn: async () => {
      // 💡 استدعاء الـ API الذي بنيناه سابقاً للتحقق من الرابط الخارجي
      const res = await api.get(`/transfer-center/verify/req/${shortLink}`);
      return res.data;
    },
    retry: false // لا داعي للمحاولة إذا كان الرابط خاطئاً
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-bold">جاري تجهيز بيئة الرفع الآمنة...</p>
      </div>
    );
  }

  // إذا الرابط خاطئ أو محذوف أو السيرفر أرجع خطأ
  if (isError || !data?.success) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50" dir="rtl">
        <AlertTriangle className="w-20 h-20 text-rose-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800 mb-2">رابط غير صالح</h1>
        <p className="text-sm font-bold text-slate-500">عذراً، هذا الرابط غير صحيح أو انتهت صلاحيته.</p>
      </div>
    );
  }

  // 🚀 دمج بيانات الرابط من الداتابيز مع إعدادات الألوان والفوتر
  const combinedConfig = {
    ...data.config, // الإعدادات (companyName, brandColor, footerText...)
    ...data.data,   // بيانات الرابط (title, maxFiles, status, pinCode...)
    isPreview: false // هذا عميل حقيقي، وليس معاينة
  };

  return <ExternalUploadPage config={combinedConfig} />;
}