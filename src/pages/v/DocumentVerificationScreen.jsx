import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  XCircle, 
  AlertTriangle, 
  Loader2, 
  FileText, 
  Calendar, 
  User, 
  Hash, 
  Download,
  Eye,
  Clock,
  EyeOff,
  Lock,
  CheckCircle,
  Database,
  Smartphone
} from "lucide-react";
import api from "../../api/axios";

import { getFullUrl } from "../../utils/urlUtils";

// 💡 دالة لتعمية الأسماء (يوسف محمد -> ي*** م***)
const maskSensitiveData = (text) => {
  if (!text || text.length < 3) return text;
  return text.split(' ').map(word => {
    if (word.length <= 2) return word;
    return word[0] + '*'.repeat(word.length - 2) + word[word.length - 1];
  }).join(' ');
};

export default function DocumentVerificationScreen() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, verified, revoked, expired, pending, limit_exceeded, unauthorized, invalid, otp_required
  const [docData, setDocData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showIframe, setShowIframe] = useState(false);
  
  // 💡 حالات الـ OTP
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    const verifyDoc = async () => {
      try {
        const res = await api.get(`/documentation/verify/${token}`);
        setDocData(res.data.data);
        
        // 💡 التحقق مما إذا كان المستند يطلب OTP
        if (res.data.data.requireOTP && !res.data.data.otpVerified) {
           setStatus("otp_required");
           // يمكنك هنا إضافة استدعاء للباك إند لإرسال رسالة SMS للعميل فوراً
        } else {
           setStatus("verified");
        }

      } catch (error) {
        const msg = error.response?.data?.message || "";
        const errorData = error.response?.data?.data || null;
        
        setErrorMessage(msg || "وثيقة غير صالحة");
        setDocData(errorData);

        if (error.response?.status === 403) {
          if (msg.includes("إبطال")) setStatus("revoked");
          else if (msg.includes("منتهية")) setStatus("expired");
          else if (msg.includes("قيد المراجعة")) setStatus("pending");
          else if (msg.includes("الحد الأقصى")) setStatus("limit_exceeded");
          else if (msg.includes("غير مصرح")) setStatus("unauthorized");
          else setStatus("invalid");
        } else {
          setStatus("invalid");
        }
      }
    };

    if (token) verifyDoc();
  }, [token]);

  // 💡 محاكاة أو ربط دالة تأكيد الـ OTP
  const handleVerifyOTP = async () => {
    if(otpCode.length < 4) return;
    setIsVerifyingOtp(true);
    try {
       // هنا يفترض وجود راوت في الباك إند: POST /documentation/verify-otp { token, otpCode }
       // مؤقتاً، سنفترض النجاح
       await new Promise(resolve => setTimeout(resolve, 1500)); 
       setStatus("verified");
    } catch (err) {
       setErrorMessage("رمز التحقق غير صحيح");
    } finally {
       setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-tajawal flex flex-col items-center py-10 px-4" dir="rtl">
      
      {/* ── Logo / Header ── */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">بوابة التحقق الإلكتروني</h1>
        <p className="text-sm font-bold text-slate-500 mt-1">نظام التوثيق الهندسي المعتمد</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden"
      >
        {/* ── Loading State ── */}
        {status === "loading" && (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-14 h-14 animate-spin text-blue-600 mb-6" />
            <p className="font-black text-lg text-slate-700">جاري الاتصال بخوادم التوثيق...</p>
            <p className="font-bold text-sm mt-2">يرجى الانتظار للتحقق من سلامة البيانات</p>
          </div>
        )}

        {/* ── OTP Required State ── */}
        {status === "otp_required" && (
          <div className="p-10 flex flex-col items-center text-center bg-rose-50/30">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <Smartphone className="w-12 h-12 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-rose-900 mb-2">مستند محمي برمز تحقق</h2>
            <p className="text-rose-700 font-bold leading-relaxed mb-6 bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
              تم إرسال رمز تحقق (OTP) إلى رقم الجوال المسجل لدينا. يرجى إدخاله لفتح المستند.
            </p>
            
            <div className="w-full max-w-xs space-y-4">
               <input 
                 type="text" 
                 maxLength={6} 
                 placeholder="أدخل الرمز هنا..." 
                 value={otpCode}
                 onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                 className="w-full text-center text-2xl font-black tracking-widest py-3 border-2 border-rose-200 rounded-xl outline-none focus:border-rose-500 font-mono"
               />
               <button 
                 onClick={handleVerifyOTP}
                 disabled={otpCode.length < 4 || isVerifyingOtp}
                 className="w-full py-3.5 bg-rose-600 text-white font-black rounded-xl hover:bg-rose-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-rose-600/20 disabled:opacity-50"
               >
                  {isVerifyingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />} تأكيد وفتح المستند
               </button>
               {errorMessage && <p className="text-rose-600 text-xs font-bold">{errorMessage}</p>}
            </div>
          </div>
        )}

        {/* ── Invalid State ── */}
        {status === "invalid" && (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-12 h-12 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">وثيقة غير مسجلة أو مزورة</h2>
            <p className="text-slate-500 font-bold leading-relaxed">
              {errorMessage || "عفواً، لم نتمكن من العثور على أي سجل مطابق لهذه الوثيقة في قاعدة بيانات النظام. الرجاء التأكد من مصدر الوثيقة."}
            </p>
          </div>
        )}

        {/* ── Revoked State ── */}
        {status === "revoked" && (
          <div className="p-10 flex flex-col items-center text-center bg-rose-50/30">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <AlertTriangle className="w-12 h-12 text-rose-600" />
            </div>
            <h2 className="text-2xl font-black text-rose-900 mb-2">وثيقة مُلغاة (غير سارية)</h2>
            <p className="text-rose-700 font-bold leading-relaxed mb-6 bg-white p-4 rounded-xl border border-rose-100 shadow-sm">
              {errorMessage || "تم إبطال هذه الوثيقة من قبل الجهة المصدرة ولم تعد صالحة للاستخدام القانوني أو التجاري."}
            </p>
            {docData?.serialNumber && (
              <div className="bg-white px-5 py-2.5 rounded-xl border border-rose-200 font-mono text-sm font-black text-rose-600 shadow-sm">
                الرقم التسلسلي: {docData.serialNumber}
              </div>
            )}
          </div>
        )}

        {/* ── Expired State ── */}
        {status === "expired" && (
          <div className="p-10 flex flex-col items-center text-center bg-amber-50/30">
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <Clock className="w-12 h-12 text-amber-600" />
            </div>
            <h2 className="text-2xl font-black text-amber-900 mb-2">انتهت صلاحية الوثيقة</h2>
            <p className="text-amber-700 font-bold leading-relaxed mb-4 bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
              لقد تجاوزت هذه الوثيقة تاريخ الصلاحية المحدد لها من قبل الجهة المصدرة. يرجى طلب وثيقة حديثة.
            </p>
          </div>
        )}

        {/* ── Pending Approval State ── */}
        {status === "pending" && (
          <div className="p-10 flex flex-col items-center text-center bg-blue-50/30">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <Clock className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-blue-900 mb-2">وثيقة قيد الاعتماد</h2>
            <p className="text-blue-700 font-bold leading-relaxed mb-4 bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
              هذه الوثيقة مسجلة في النظام ولكنها لا تزال قيد المراجعة ولم يتم اعتمادها بشكل نهائي من قبل إدارة العمليات.
            </p>
          </div>
        )}

        {/* ── Limit Exceeded State ── */}
        {status === "limit_exceeded" && (
          <div className="p-10 flex flex-col items-center text-center bg-slate-100">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <EyeOff className="w-12 h-12 text-slate-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">تم تجاوز حد المشاهدات</h2>
            <p className="text-slate-600 font-bold leading-relaxed mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              لا يمكن عرض هذه الوثيقة لأنه تم استنفاد الحد الأقصى لمرات العرض المسموح بها والمحددة لأسباب أمنية.
            </p>
          </div>
        )}

        {/* ── Unauthorized State ── */}
        {status === "unauthorized" && (
          <div className="p-10 flex flex-col items-center text-center bg-slate-50">
            <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-sm">
              <Lock className="w-12 h-12 text-slate-600" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">وصول مقيد (مستند خاص)</h2>
            <p className="text-slate-600 font-bold leading-relaxed mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              هذا المستند محمي بإعدادات الخصوصية ولا يُسمح للعامة بالتحقق منه أو الاطلاع على تفاصيله.
            </p>
          </div>
        )}

        {/* ── Verified State (Success) ── */}
        {status === "verified" && docData && (
          <div>
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 p-8 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 relative z-10 drop-shadow-md" />
              <h2 className="text-3xl font-black relative z-10 drop-shadow-md">وثيقة معتمدة وآمنة</h2>
              <p className="text-emerald-50 font-bold mt-2 relative z-10 opacity-95">
                سجل مطابق للبيانات الموثقة بتقنية التشفير المتقدمة
              </p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              
              {/* 💡 قسم البيانات الأساسية والميتا داتا المرنة */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <FileText className="w-4 h-4" /> <span className="text-xs font-black uppercase">اسم المستند</span>
                  </div>
                  <p className="font-bold text-slate-800 line-clamp-2" title={docData.name}>{docData.name}</p>
                </div>
                
                {/* 💡 عرض البيانات الوصفية المرنة التي تم إضافتها في المودال */}
                {docData.customMetadata && docData.customMetadata.map((meta, idx) => {
                   // تعمية الأسماء إذا كان الحقل يعبر عن شخص
                   const isNameField =  meta.key.includes("مالك") || meta.key.includes("عميل");
                   const displayValue = isNameField ? maskSensitiveData(meta.value) : meta.value;

                   return (
                     <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                       <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                         <Database className="w-4 h-4" /> <span className="text-xs font-black uppercase">{meta.key}</span>
                       </div>
                       <p className="font-bold text-slate-800">{displayValue}</p>
                     </div>
                   );
                })}

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <Hash className="w-4 h-4" /> <span className="text-xs font-black uppercase">الرقم التسلسلي</span>
                  </div>
                  <p className="font-mono font-black text-blue-600">{docData.serialNumber}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 text-slate-400 mb-1.5">
                    <Calendar className="w-4 h-4" /> <span className="text-xs font-black uppercase">تاريخ الإصدار</span>
                  </div>
                  <p className="font-bold text-slate-800" dir="ltr">
                    {new Date(docData.timestamp).toLocaleString("ar-SA")}
                  </p>
                </div>
              </div>

              {/* <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <ShieldCheck className="w-4 h-4" /> <span className="text-xs font-black">البصمة الأمنية المشفرة (SHA-256)</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded-xl border border-slate-200">
                    {docData.hash}
                  </p>
              </div> */}

              {/* ── Actions ── */}
              {docData.fileUrl && (
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowIframe(!showIframe)}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
                  >
                    <Eye className="w-5 h-5" />
                    {showIframe ? "إخفاء المستند" : "معاينة المستند"}
                  </button>
                  <a 
                    href={getFullUrl(docData.fileUrl)} 
                    target="_blank" 
                    rel="noreferrer"
                    download
                    className="flex-1 py-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-100 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Download className="w-5 h-5" /> تحميل النسخة الأصلية
                  </a>
                </div>
              )}
            </div>

            {/* ── Document Viewer (Iframe) ── */}
            <AnimatePresence>
              {showIframe && docData.fileUrl && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-200 bg-slate-100 p-4 sm:p-6"
                >
                  <div className="rounded-2xl overflow-hidden shadow-inner border border-slate-300 bg-white">
                    <iframe 
                      src={`${getFullUrl(docData.fileUrl)}#toolbar=0`} 
                      className="w-full h-[600px] md:h-[800px]"
                      title="Document Preview"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      <div className="mt-8 text-center text-slate-400 text-xs font-bold leading-loose">
        جميع الحقوق محفوظة © {new Date().getFullYear()} <br />
        هذا المستند محمي بواسطة <span className="text-blue-500 font-black">نظام التوثيق والاعتماد</span>
      </div>
    </div>
  );
}