import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../../api/axios'; 
import { toast } from 'sonner';

export default function ClientUploadPage() {
  const { shortLink } = useParams();
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({ senderName: '', senderPhone: '', senderEmail: '' });
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('يرجى اختيار ملف أولاً');

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('senderName', formData.senderName);
    data.append('senderPhone', formData.senderPhone);
    data.append('senderEmail', formData.senderEmail);

    try {
      // 💡 يتم الإرسال للمسار الذي برمجناه في الباك إند
      const res = await api.post(`/file-requests/upload/${shortLink}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setIsSuccess(true);
        toast.success('تم إرسال الملف بنجاح');
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'حدث خطأ. قد يكون الرابط منتهي الصلاحية.';
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-[Tajawal]" dir="rtl">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={45} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">شكراً لكم، تم الاستلام</h2>
          <p className="text-slate-500 leading-relaxed">تم رفع الملف وفحصه أمنياً بنجاح. سيقوم الفريق المختص بمراجعته قريباً.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-[Tajawal]" dir="rtl">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="bg-emerald-600 p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10"><UploadCloud size={100} /></div>
          <h1 className="text-2xl font-black mb-1">بوابة رفع الوثائق</h1>
          <p className="text-emerald-100 text-sm font-bold">شركة ديتيلز كونسولتس للاستشارات الهندسية</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
            <p className="font-medium">أمانكم يهمنا: جميع الملفات يتم فحصها عبر ClamAV للحماية من الفيروسات قبل دخولها للنظام.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">الاسم الكامل</label>
              <input required type="text" value={formData.senderName} onChange={e=>setFormData({...formData, senderName: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="أدخل اسمك الثلاثي" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">رقم الجوال</label>
                <input required type="tel" value={formData.senderPhone} onChange={e=>setFormData({...formData, senderPhone: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="05xxxxxxxx" />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">البريد الإلكتروني</label>
                <input type="email" value={formData.senderEmail} onChange={e=>setFormData({...formData, senderEmail: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all" placeholder="اختياري" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">اختيار الملف</label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group">
                <div className="text-center">
                  <FileText className={`w-12 h-12 mx-auto mb-2 transition-transform group-hover:scale-110 ${file ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className="text-sm text-slate-600 font-bold">{file ? file.name : "اسحب الملف هنا أو اضغط للاختيار"}</p>
                  {!file && <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG (بحد أقصى 15MB)</p>}
                </div>
                <input type="file" required className="hidden" onChange={e => setFile(e.target.files[0])} accept=".pdf,.jpg,.jpeg,.png" />
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading || !file}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 mt-4"
          >
            {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
            {isUploading ? 'جاري الفحص والرفع...' : 'تأكيد وإرسال الوثيقة'}
          </button>
        </form>
      </div>
    </div>
  );
}