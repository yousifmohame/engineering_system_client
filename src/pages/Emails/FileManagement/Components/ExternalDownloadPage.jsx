import React, { useState, useEffect } from 'react';
import { 
  Building, Download, FileText, Lock, Clock, Shield,
  Mail, Phone, Eye, AlertCircle, FileArchive, FileImage, FileVideo, File
} from 'lucide-react';
import { toast } from 'sonner';

// 💡 دالة تحويل الروابط للعمل بشكل صحيح مع الباك إند
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com"; // 💡 الدومين والبورت الخاص بك
  return `${baseUrl}${fixedUrl}`;
};

// 💡 أضفنا config = {} كحماية لمنع انهيار المكون
export default function ExternalDownloadPage({ config = {} }) {
  const [internalStatus, setInternalStatus] = useState(config.status || 'active');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    if (config.isPreview) {
      setInternalStatus(config.status || 'active');
    }
  }, [config.status, config.isPreview]);

  // 🚀 تفعيل وضع التنزيل التلقائي إذا كان مفعلاً بالرابط
  useEffect(() => {
    if (config.directDownloadMode && internalStatus === 'active') {
       setDownloading('all');
       // تنزيل جميع الملفات برمجياً بعد مهلة قصيرة
       const t = setTimeout(() => {
         if (!config.isPreview && config.files) {
            config.files.forEach(file => {
               handleRealDownload(file);
            });
         }
         setDownloading(null);
       }, 2500);
       return () => clearTimeout(t);
    }
  }, [config.directDownloadMode, internalStatus, config.files, config.isPreview]);

  // التحقق من الرمز السري
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin === config.pinCode || config.isPreview) {
      setInternalStatus('active');
    } else {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    }
  };

  const getFileIcon = (type) => {
    if (!type) return <File className="w-6 h-6" />;
    const t = type.toLowerCase();
    if (t.includes('pdf')) return <FileText className="w-6 h-6" />;
    if (t.includes('image') || t.includes('png') || t.includes('jpg')) return <FileImage className="w-6 h-6" />;
    if (t.includes('video') || t.includes('mp4')) return <FileVideo className="w-6 h-6" />;
    if (t.includes('zip') || t.includes('rar') || t.includes('archive')) return <FileArchive className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  // 🚀 الدالة الحقيقية لتحميل الملف من السيرفر
  const handleRealDownload = (file) => {
    if (config.isPreview) {
      toast.info('هذه مجرد معاينة، لا يوجد ملف حقيقي للتنزيل');
      return;
    }

    setDownloading(file.id);
    
    try {
      const fileUrl = getFullUrl(file.url || file.filePath);
      if (fileUrl) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.name || file.fileName || 'document'; // إجبار المتصفح على التحميل
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error('رابط الملف غير متوفر');
      }
    } catch (err) {
      toast.error('حدث خطأ أثناء محاولة تنزيل الملف');
    } finally {
      setTimeout(() => setDownloading(null), 1000);
    }
  };

  // 🚀 الدالة الحقيقية لعرض الملف (في نافذة جديدة)
  const handleRealView = (file) => {
    if (config.isPreview) {
      toast.info('هذه مجرد معاينة، لا يوجد ملف حقيقي للعرض');
      return;
    }

    const fileUrl = getFullUrl(file.url || file.filePath);
    if (fileUrl) {
      window.open(fileUrl, '_blank');
    } else {
      toast.error('رابط الملف غير متوفر');
    }
  };

  const brandStyle = { color: config.brandColor };
  const brandBgStyle = { backgroundColor: config.brandColor };

  const handleWhatsApp = () => {
    if (config.isPreview) return;
    const msg = encodeURIComponent(config.whatsAppMessage || `مرحباً، بخصوص الحزمة: ${config.title}`);
    window.open(`https://wa.me/${(config.contactPhone || '').replace(/\D/g,'')}?text=${msg}`);
  };

  const handleEmail = () => {
    if (config.isPreview) return;
    const subj = encodeURIComponent(`استفسار بخصوص: ${config.title}`);
    const body = encodeURIComponent(config.emailMessage || `لدي استفسار بخصوص الحزمة المرسلة.`);
    window.open(`mailto:${config.contactEmail}?subject=${subj}&body=${body}`);
  };

  const handleSMS = () => {
    if (config.isPreview) return;
    const msg = encodeURIComponent(config.smsMessage || `بخصوص رقم المرجع: ${config.title}`);
    window.open(`sms:${config.contactPhone}?body=${msg}`);
  };

  if (internalStatus === 'expired' || internalStatus === 'revoked') {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-4 py-12" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-500">
            <Clock className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-3">
            {internalStatus === 'expired' ? 'انتهت صلاحية الرابط' : 'تم سحب صلاحية الرابط'}
          </h1>
          <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
            عذراً، هذا الرابط لم يعد متاحاً لعرض أو تحميل الملفات. يرجى التواصل مع الجهة المرسلة.
          </p>
          <div className="pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
            <Building className="w-4 h-4" /> {config.companyName}
          </div>
        </div>
      </div>
    );
  }

  if (internalStatus === 'pin-required') {
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center p-4 py-12" dir="rtl">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-600" style={brandStyle}>
            <Lock className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-black text-slate-800 mb-3">الرابط محمي برمز مرور</h1>
          <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">
            يرجى إدخال رمز المرور (PIN) المرسل لك للتمكن من الوصول للملفات.
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
          {config.message && (
            <p className="text-sm font-bold text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">{config.message}</p>
          )}

          <div className="flex gap-4 p-4 border rounded-xl border-indigo-100 bg-indigo-50/50">
            <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0" />
            <p className="text-xs font-bold text-indigo-800 leading-relaxed">
              هذا الرابط يحتوي على ملفات مرسلة لكم. 
              {config.permissions === 'download' && ' يمكنك تحميل الملفات للرجوع إليها.'}
              {config.permissions === 'view' && ' هذه الملفات متاحة للاستعراض فقط ولا يمكن تحميلها.'}
              {config.permissions === 'both' && ' يمكنك استعراض الملفات أو تحميلها على جهازك.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> الملفات المرفقة
            </h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
              {config.files?.length || 0} ملفات
            </span>
          </div>

          <div className="space-y-3">
            {config.files && config.files.map((file, idx) => (
              <div key={file.id || idx} className="group flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white gap-4">
                <div className="p-3 bg-slate-50 rounded-xl text-slate-500 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-colors shrink-0">
                  {getFileIcon(file.type)}
                </div>
                
                <div className="flex-1 min-w-0 w-full">
                  <p className="text-sm font-black text-slate-800 truncate mb-1" dir="ltr" style={{ textAlign: 'right' }}>
                    {file.name || file.fileName || 'ملف غير معروف'}
                  </p>
                  <div className="flex gap-3 text-xs font-bold text-slate-400">
                    <span>{file.size}</span>
                    {file.type && <span className="uppercase">{file.type.split('/')[1] || file.type}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 mt-3 sm:mt-0">
                  {(config.permissions === 'both' || config.permissions === 'view') && (
                    <button 
                      onClick={() => handleRealView(file)}
                      className="flex-1 sm:flex-none px-4 py-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-black text-slate-600 flex items-center justify-center gap-2 transition-colors"
                    >
                      <Eye className="w-4 h-4" /> عرض
                    </button>
                  )}
                  {(config.permissions === 'both' || config.permissions === 'download') && (
                    <button 
                      onClick={() => handleRealDownload(file)}
                      disabled={downloading === file.id}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-black text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      style={brandBgStyle}
                    >
                      {downloading === file.id ? (
                        <span className="flex items-center gap-2">جاري التحميل...</span>
                      ) : (
                        <><Download className="w-4 h-4" /> تنزيل</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {(!config.files || config.files.length === 0) && (
              <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400">لا توجد ملفات مرفقة</p>
              </div>
            )}
          </div>

          {(config.permissions === 'both' || config.permissions === 'download') && config.files && config.files.length > 1 && (
            <div className="mt-6 pt-6 border-t border-slate-100 text-center">
              <button 
                onClick={() => toast.info('جاري تجهيز حزمة ZIP...')}
                className="w-full sm:w-auto px-8 py-3 rounded-xl text-sm font-black transition-all border-2 flex items-center justify-center gap-2 mx-auto hover:bg-slate-50"
                style={{ borderColor: config.brandColor, color: config.brandColor }}
              >
                <Download className="w-4 h-4" /> تنزيل كل الملفات كـ ZIP
              </button>
            </div>
          )}
        </div>

        {config.showDisclaimer && config.disclaimerText && (
          <div className="bg-slate-100 rounded-2xl p-4 flex gap-3 text-slate-600 border border-slate-200">
             <Shield className="w-5 h-5 shrink-0 text-slate-500" />
             <p className="text-[10px] font-bold leading-relaxed">{config.disclaimerText}</p>
          </div>
        )}

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

      {config.directDownloadMode && internalStatus === 'active' && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4">
           <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-500 animate-pulse border-4 border-white shadow-xl">
             <Download className="w-8 h-8" />
           </div>
           <h2 className="text-xl font-black text-slate-800 mb-2">جاري بدء التنزيل...</h2>
           <p className="text-sm font-bold text-slate-500">سيتم حفظ الملفات على جهازك تلقائياً.</p>
           {downloading === 'all' && (
             <div className="mt-8 w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
               <div className="h-full bg-slate-800 animate-[pulse_1s_ease-in-out_infinite]" style={{width: '60%'}}></div>
             </div>
           )}
        </div>
      )}

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