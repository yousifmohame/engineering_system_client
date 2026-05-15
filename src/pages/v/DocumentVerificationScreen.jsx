import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
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
  Eye
} from "lucide-react";
import api from "../../api/axios"; // تأكد من مسار الـ axios لديك

// للحصول على الرابط الكامل للملف
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com"; // 💡 الدومين والبورت
  return `${baseUrl}${fixedUrl}`;
};

export default function DocumentVerificationScreen() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading"); // loading, verified, revoked, invalid
  const [docData, setDocData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    const verifyDoc = async () => {
      try {
        const res = await api.get(`/documentation/verify/${token}`);
        setDocData(res.data.data);
        setStatus("verified");
      } catch (error) {
        if (error.response?.status === 403) {
          setStatus("revoked");
          setDocData(error.response?.data?.data); // لجلب السيريال إن وجد
        } else {
          setStatus("invalid");
          setErrorMessage(error.response?.data?.message || "وثيقة غير صالحة");
        }
      }
    };

    if (token) verifyDoc();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 font-tajawal flex flex-col items-center py-10 px-4" dir="rtl">
      
      {/* ── Logo / Header ── */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-slate-800">بوابة التحقق الإلكتروني</h1>
        <p className="text-sm font-bold text-slate-500 mt-1">نظام التوثيق الهندسي المعتمد</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden"
      >
        {/* ── Loading State ── */}
        {status === "loading" && (
          <div className="p-16 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="font-bold">جاري التحقق من الوثيقة بأمان...</p>
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
              عفواً، لم نتمكن من العثور على أي سجل مطابق لهذه الوثيقة في قاعدة بيانات النظام. الرجاء التأكد من مصدر الوثيقة.
            </p>
          </div>
        )}

        {/* ── Revoked State ── */}
        {status === "revoked" && (
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">وثيقة مُلغاة (غير سارية)</h2>
            <p className="text-slate-500 font-bold leading-relaxed mb-4">
              تم إبطال هذه الوثيقة من قبل مصدرها ولم تعد صالحة للاستخدام القانوني أو التجاري.
            </p>
            {docData?.serialNumber && (
              <div className="bg-slate-50 px-4 py-2 rounded-lg border font-mono text-sm font-black text-slate-600">
                {docData.serialNumber}
              </div>
            )}
          </div>
        )}

        {/* ── Verified State ── */}
        {status === "verified" && docData && (
          <div>
            <div className="bg-emerald-500 p-8 text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 relative z-10" />
              <h2 className="text-3xl font-black relative z-10">وثيقة معتمدة وآمنة</h2>
              <p className="text-emerald-100 font-bold mt-2 relative z-10 opacity-90">
                هذه الوثيقة مسجلة وموثقة بتقنية التشفير المتقدم
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText className="w-4 h-4" /> <span className="text-xs font-black">اسم المستند</span>
                  </div>
                  <p className="font-bold text-slate-800">{docData.name}</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <User className="w-4 h-4" /> <span className="text-xs font-black">الطرف المعني</span>
                  </div>
                  <p className="font-bold text-slate-800">{docData.partyB}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Hash className="w-4 h-4" /> <span className="text-xs font-black">الرقم التسلسلي</span>
                  </div>
                  <p className="font-mono font-black text-blue-600">{docData.serialNumber}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Calendar className="w-4 h-4" /> <span className="text-xs font-black">تاريخ التوثيق</span>
                  </div>
                  <p className="font-bold text-slate-800" dir="ltr">
                    {new Date(docData.timestamp).toLocaleString("ar-SA")}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <ShieldCheck className="w-4 h-4" /> <span className="text-xs font-black">البصمة الأمنية (SHA-256 Hash)</span>
                  </div>
                  <p className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded border border-slate-200">
                    {docData.hash}
                  </p>
              </div>

              {/* ── Actions ── */}
              {docData.fileUrl && (
                <div className="pt-4 flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={() => setShowIframe(!showIframe)}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    {showIframe ? "إخفاء المستند" : "معاينة المستند"}
                  </button>
                  <a 
                    href={getFullUrl(docData.fileUrl)} 
                    target="_blank" 
                    rel="noreferrer"
                    download
                    className="flex-1 py-4 bg-blue-50 text-blue-700 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                  >
                    <Download className="w-5 h-5" /> تحميل النسخة الأصلية
                  </a>
                </div>
              )}
            </div>

            {/* ── Document Viewer (Iframe) ── */}
            {showIframe && docData.fileUrl && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="border-t border-slate-100 bg-slate-100 p-4"
              >
                <iframe 
                  src={`${getFullUrl(docData.fileUrl)}#toolbar=0`} 
                  className="w-full h-[600px] rounded-xl border border-slate-200 shadow-inner bg-white"
                  title="Document Preview"
                />
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      <div className="mt-8 text-center text-slate-400 text-xs font-bold">
        جميع الحقوق محفوظة © {new Date().getFullYear()} <br />
        بوابة التوثيق الإلكتروني الآمن
      </div>
    </div>
  );
}