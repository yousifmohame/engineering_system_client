import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../../../api/axios'; 
import ExternalDownloadPage from './ExternalDownloadPage';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function ClientDownloadWrapper() {
  const { shortLink } = useParams(); 

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-send-link', shortLink],
    queryFn: async () => {
      // 💡 استدعاء الـ API للتحقق من رابط حزمة الإرسال
      const res = await api.get(`/transfer-center/verify/send/${shortLink}`);
      return res.data;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mb-4" />
        <p className="text-slate-500 font-bold">جاري فك تشفير وتجهيز الملفات المرسلة...</p>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50" dir="rtl">
        <AlertTriangle className="w-20 h-20 text-rose-500 mb-4" />
        <h1 className="text-2xl font-black text-slate-800 mb-2">رابط غير صالح</h1>
        <p className="text-sm font-bold text-slate-500">عذراً، هذا الرابط غير صحيح، أو تم سحب صلاحيته من قبل المرسل.</p>
      </div>
    );
  }

  const combinedConfig = {
    ...data.config, 
    ...data.data,   
    // تحويل JSON الخاص بالملفات إلى مصفوفة ليستطيع المكون قراءتها
    files: typeof data.data.filesData === 'string' ? JSON.parse(data.data.filesData) : data.data.filesData,
    isPreview: false
  };

  return <ExternalDownloadPage config={combinedConfig} />;
}