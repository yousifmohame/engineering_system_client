import React, { useState, useRef, useEffect } from 'react';
import api from '../../../../api/axios'; // 💡 تأكد من مسار axios حسب مشروعك
import { toast } from 'sonner';
import { 
  UploadCloud, FileText, X, CheckCircle2, AlertTriangle, Send, Shield, 
  Lock, Clock, Building, Mail, Phone, Info, Trash2, File, ArrowRight
} from 'lucide-react';

export default function ExternalUploadPage({ config }) {
  const [internalStatus, setInternalStatus] = useState(config.status);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  // 💡 غيرنا الاسم لـ senderData لتجنب التعارض مع كائن FormData الخاص برفع الملفات
  const [senderData, setSenderData] = useState({
    senderName: '',
    senderMobile: '',
    senderEmail: '',
    senderNote: ''
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (config.isPreview) {
      setInternalStatus(config.status);
    }
  }, [config.status, config.isPreview]);

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === config.pinCode || config.isPreview) { 
      setInternalStatus('active');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const validateFile = (file) => {
    if (file.size > config.maxFileSize * 1024 * 1024) {
      return `حجم الملف يتجاوز ${config.maxFileSize}MB`;
    }
    return null;
  };

  const processFiles = (newFiles) => {
    const filesArray = Array.from(newFiles);
    
    if (files.length + filesArray.length > config.maxFiles) {
      alert(`عذراً، الحد الأقصى للملفات هو ${config.maxFiles} ملفات.`);
      return;
    }

    const processed = filesArray.map(f => {
      const error = validateFile(f);
      return {
        id: Math.random().toString(36).substring(7),
        file: f,
        progress: 0,
        status: error ? 'error' : 'pending',
        errorMsg: error || undefined
      };
    });

    setFiles(prev => [...prev, ...processed]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => setIsDragging(false);
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // 🚀 الرفع الفعلي للملفات للباك إند
  const handleSubmit = async () => {
    const validFiles = files.filter(f => f.status === 'pending');
    if (validFiles.length === 0) return;

    // 1. تحديث حالة الملفات إلى "جاري الرفع"
    setFiles(prev => prev.map(f => f.status === 'pending' ? { ...f, status: 'uploading' } : f));

    // 💡 2. إذا كانت الشاشة في وضع المعاينة (من لوحة التحكم)، نقوم بمحاكاة الرفع فقط
    if (config.isPreview) {
      for (let i = 0; i <= 100; i += 20) {
        await new Promise(r => setTimeout(r, 200));
        setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, progress: i } : f));
      }
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'success' } : f));
      setTimeout(() => setInternalStatus('success'), 500);
      return;
    }

    // 🚀 3. الرفع الفعلي للسيرفر
    const uploadFormData = new FormData();
    validFiles.forEach(f => {
      uploadFormData.append('files', f.file); // إضافة الملفات
    });
    
    // إضافة بيانات المرسل
    uploadFormData.append('senderName', senderData.senderName);
    uploadFormData.append('senderMobile', senderData.senderMobile);
    uploadFormData.append('senderEmail', senderData.senderEmail);
    uploadFormData.append('senderNote', senderData.senderNote);
    uploadFormData.append('requestId', config.id || ''); // الـ ID الخاص بالطلب (من الباك إند)

    try {
      // 💡 افترض أن مسار رفع الملفات في الباك إند هو هذا (يجب إنشاؤه في مساراتك)
      await api.post(`/transfer-center/upload/${config.shortLink}`, uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // تحديث شريط التقدم الفعلي بناءً على سرعة رفع العميل
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, progress: percentCompleted } : f));
        }
      });

      // نجاح الرفع
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'success', progress: 100 } : f));
      setTimeout(() => setInternalStatus('success'), 1000);
      
    } catch (error) {
      console.error('Upload Error:', error);
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء رفع الملفات، يرجى المحاولة مرة أخرى');
      // إعادة الملفات لحالة معلقة في حال الفشل ليحاول العميل مجدداً
      setFiles(prev => prev.map(f => f.status === 'uploading' ? { ...f, status: 'error', errorMsg: 'فشل الرفع' } : f));
    }
  };

  const brandStyle = { color: config.brandColor };
  const brandBgStyle = { backgroundColor: config.brandColor };

  const handleWhatsApp = () => {
    if (config.isPreview) return;
    const msg = encodeURIComponent(config.whatsAppMessage || `مرحباً، بخصوص رابط الطلب: ${config.title}`);
    window.open(`https://wa.me/${config.contactPhone?.replace(/\D/g,'')}?text=${msg}`);
  };

  const handleEmail = () => {
    if (config.isPreview) return;
    const subj = encodeURIComponent(`استفسار بخصوص: ${config.title}`);
    const body = encodeURIComponent(config.emailMessage || `لدي استفسار بخصوص طلب الملفات المرسل.`);
    window.open(`mailto:${config.contactEmail}?subject=${subj}&body=${body}`);
  };

  const handleSMS = () => {
    if (config.isPreview) return;
    const msg = encodeURIComponent(config.smsMessage || `بخصوص رقم المرجع: ${config.title}`);
    window.open(`sms:${config.contactPhone}?body=${msg}`);
  };

  if (internalStatus === 'expired') {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-4 py-12" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-3">انتهت صلاحية الرابط</h1>
          <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
            عذراً، هذا الرابط لم يعد متاحاً لاستقبال الملفات. يرجى التواصل مع الجهة المرسلة لطلب رابط جديد.
          </p>
          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Building className="w-4 h-4" /> {config.companyName}
          </div>
        </div>
      </div>
    );
  }

  if (internalStatus === 'success') {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-4 py-12" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-2">تم الإرسال بنجاح!</h1>
          <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">
            شكراً لك، تم استقبال ملفاتك وحفظها بأمان. سيتم عرضها ومراجعتها من قبل فريق العمل.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 flex flex-col gap-2 text-sm font-bold">
            <div className="flex justify-between text-slate-600">
               <span>رقم المرجع:</span>
               <span className="font-mono text-slate-800 tracking-widest text-left" dir="ltr">REF-{Math.floor(Math.random() * 1000000)}</span>
            </div>
          </div>

          <button onClick={() => {
             setInternalStatus('active');
             setFiles([]);
          }} className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-2 mx-auto">
             <ArrowRight className="w-4 h-4" /> إرسال ملفات إضافية
          </button>
        </div>
      </div>
    );
  }

  if (internalStatus === 'pin-required') {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-4 py-12" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600" style={{ color: config.brandColor }}>
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-3">الرابط محمي برمز مرور</h1>
          <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
            يرجى إدخال رمز المرور (PIN) المرسل لك للتمكن من الوصول لصفحة رفع الملفات.
          </p>
          
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <input 
              type="text" 
              value={pin}
              onChange={e => setPin(e.target.value)}
              placeholder="••••"
              className={`w-full text-center tracking-widest text-2xl font-mono p-4 border rounded-xl outline-none focus:ring-2 transition-all ${pinError ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-300 bg-slate-50 focus:border-slate-400'}`}
            />
            {pinError && <p className="text-xs text-rose-500 font-bold">الرمز غير صحيح، حاول مرة أخرى</p>}
            <button type="submit" className="w-full py-4 text-white rounded-xl font-black text-sm transition-all shadow-lg hover:opacity-90" style={brandBgStyle}>
              فتح الرابط
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 text-slate-800 font-sans" dir="rtl">
      <header className="bg-white border-b border-slate-200 py-6 px-4 shrink-0 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5" style={brandBgStyle}></div>
        <div className="max-w-3xl mx-auto flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md" style={brandBgStyle}>
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-slate-800">{config.companyName}</h2>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200">
          <h1 className="text-2xl font-black text-slate-900 mb-3 leading-tight" style={brandStyle}>{config.title}</h1>
          {config.welcomeText && (
            <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{config.welcomeText}</p>
          )}

          {(config.showClientName || config.showRefNumber) && (
            <div className="flex flex-wrap gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4 text-xs font-bold">
              {config.showClientName && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">لصالح العميل:</span>
                  <span className="text-slate-800">{config.clientName}</span>
                </div>
              )}
              {config.showRefNumber && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">رقم المرجع:</span>
                  <span className="text-slate-800" dir="ltr">{config.reqRefNumber}</span>
                </div>
              )}
            </div>
          )}

          {config.showReqDescription && config.reqDescription && (
            <div className="mt-4 p-4 border-r-4 rounded-l-xl bg-orange-50 border-orange-400">
               <div className="flex gap-2 items-start text-orange-800 text-sm font-bold leading-relaxed">
                 <Info className="w-5 h-5 shrink-0 mt-0.5" />
                 <p>{config.reqDescription}</p>
               </div>
            </div>
          )}
        </div>

        {(config.reqSenderName || config.reqSenderMobile || config.reqSenderEmail || config.reqSenderNote) && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileText className="w-4 h-4 text-slate-400"/> بيانات المرسل (مطلوبة)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.reqSenderName && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">الاسم الكريم <span className="text-rose-500">*</span></label>
                  <input type="text" value={senderData.senderName} onChange={e=>setSenderData(p=>({...p, senderName: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none" style={{ '--tw-ring-color': config.brandColor }} required />
                </div>
              )}
              {config.reqSenderMobile && (
                <div>
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">رقم الجوال <span className="text-rose-500">*</span></label>
                  <input type="tel" value={senderData.senderMobile} onChange={e=>setSenderData(p=>({...p, senderMobile: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none" style={{ '--tw-ring-color': config.brandColor }} dir="ltr" required />
                </div>
              )}
              {config.reqSenderEmail && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">البريد الإلكتروني <span className="text-rose-500">*</span></label>
                  <input type="email" value={senderData.senderEmail} onChange={e=>setSenderData(p=>({...p, senderEmail: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:outline-none" style={{ '--tw-ring-color': config.brandColor }} required />
                </div>
              )}
              {config.reqSenderNote && (
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-slate-600 block mb-1.5">ملاحظة للجهة المستلمة</label>
                  <textarea value={senderData.senderNote} onChange={e=>setSenderData(p=>({...p, senderNote: e.target.value}))} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-20 resize-none focus:ring-2 focus:outline-none" style={{ '--tw-ring-color': config.brandColor }} />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
           <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-slate-400"/> إرفاق المستندات المحددة
              </h3>
              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">الحد: {config.maxFiles} ملفات</span>
           </div>

           <div 
             className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5 scale-[0.99]': 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
             onDragOver={handleDragOver}
             onDragLeave={handleDragLeave}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
             style={isDragging ? { borderColor: config.brandColor } : {}}
           >
             <input type="file" multiple className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files) processFiles(e.target.files); }} />
             <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <UploadCloud className="w-8 h-8" />
             </div>
             <p className="text-sm font-black text-slate-700 mb-2">اسحب الملفات وأفلتها هنا</p>
             <p className="text-xs font-bold text-slate-500">أو اضغط لاختيار الملفات من جهازك</p>
             <p className="text-[10px] items-center gap-2 font-bold text-slate-400 mt-4 bg-white inline-flex px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
                <span>تصل مساحة كل ملف إلى {config.maxFileSize}MB</span>
             </p>
           </div>

           {files.length > 0 && (
             <div className="mt-6 space-y-3">
               {files.map(file => (
                 <div key={file.id} className={`flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl border ${file.status === 'error' ? 'border-rose-200 bg-rose-50/50' : 'border-slate-200 bg-white'}`}>
                   <div className={`p-2 shrink-0 rounded-lg ${file.status === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-indigo-50 text-indigo-600'}`}>
                     <File className="w-5 h-5" />
                   </div>
                   
                   <div className="flex-1 w-full min-w-0">
                     <div className="flex justify-between items-start mb-1 text-xs">
                        <span className="font-bold text-slate-700 truncate ml-2" dir="ltr">{file.file.name}</span>
                        <span className="font-bold text-slate-500 shrink-0">{(file.file.size / (1024*1024)).toFixed(1)} MB</span>
                     </div>
                     
                     {file.status === 'error' ? (
                       <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-1"><AlertTriangle className="w-3 h-3" /> {file.errorMsg}</p>
                     ) : (
                       <div className="flex items-center gap-3 w-full">
                         <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                           <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${file.progress}%` }}></div>
                         </div>
                         <span className="text-[10px] font-black text-slate-400 shrink-0 w-8">{file.progress}%</span>
                       </div>
                     )}
                   </div>

                   {file.status === 'pending' && (
                     <button onClick={() => removeFile(file.id)} className="p-2 shrink-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                       <Trash2 className="w-4 h-4" />
                     </button>
                   )}
                   {file.status === 'success' && (
                     <div className="p-2 shrink-0 text-emerald-500">
                       <CheckCircle2 className="w-5 h-5" />
                     </div>
                   )}
                 </div>
               ))}
             </div>
           )}
        </div>

        {config.showDisclaimer && (
          <div className="bg-slate-100 rounded-2xl p-4 flex gap-3 text-slate-600 border border-slate-200">
             <Shield className="w-5 h-5 shrink-0 text-slate-500" />
             <p className="text-[10px] font-bold leading-relaxed">{config.disclaimerText}</p>
          </div>
        )}

        <button 
          onClick={handleSubmit}
          disabled={files.length === 0 || files.some(f => f.status === 'uploading')}
          className="w-full py-4 text-white rounded-2xl font-black text-sm transition-all shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
          style={brandBgStyle}
        >
          <Send className="w-4 h-4" /> تأكيد وإرسال الملفات
        </button>

        {(config.enableWhatsApp || config.enableEmailCTA || config.enableSms) && (
          <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-6 shadow-sm border border-indigo-100 mt-6 text-center">
            <h3 className="text-sm font-black text-indigo-900 mb-2">هل لديك استفسار؟</h3>
            <p className="text-xs text-indigo-700 font-bold mb-4">تواصل معنا مباشرة عبر القنوات التالية</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {config.enableWhatsApp && (
                <button onClick={handleWhatsApp} className="px-4 py-2 bg-green-500 text-white font-bold text-xs rounded-xl hover:bg-green-600 transition-colors shadow-sm flex items-center gap-2">
                  واتساب
                </button>
              )}
              {config.enableEmailCTA && (
                <button onClick={handleEmail} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" /> مراسلة إلكترونية
                </button>
              )}
              {config.enableSms && (
                <button onClick={handleSMS} className="px-4 py-2 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-200 transition-colors shadow-sm flex items-center gap-2">
                  رسالة نصية SMS
                </button>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-3xl mx-auto p-6 text-center border-t border-slate-200 mt-8 mb-4 flex flex-col items-center gap-3">
        <p className="text-xs font-bold text-slate-500">{config.footerText}</p>
        <div className="flex gap-4 text-xs font-bold text-slate-400">
           {config.contactEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {config.contactEmail}</span>}
           {config.contactPhone && <span className="flex items-center gap-1" dir="ltr"><Phone className="w-3 h-3" /> {config.contactPhone}</span>}
        </div>
      </footer>
    </div>
  );
}