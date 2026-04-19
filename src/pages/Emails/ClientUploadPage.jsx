import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  XCircle,
} from "lucide-react";
import api from "../../api/axios";
import { toast } from "sonner";

export default function ClientUploadPage() {
  const { shortLink } = useParams();

  const [requestData, setRequestData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    senderEmail: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 🚀 جلب تفاصيل الرابط فور تحميل الصفحة
  useEffect(() => {
    const fetchLinkDetails = async () => {
      try {
        const res = await api.get(`/file-requests/verify/${shortLink}`);
        if (res.data?.success) {
          setRequestData(res.data.data);
        }
      } catch (error) {
        setErrorMsg(
          error.response?.data?.message ||
            "حدث خطأ غير معروف، يرجى المحاولة لاحقاً.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinkDetails();
  }, [shortLink]);

  // 🚀 التحقق من حجم الملف قبل اعتماده
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const maxSizeBytes = requestData.maxSizeMB * 1024 * 1024;
      if (selectedFile.size > maxSizeBytes) {
        toast.error(
          `حجم الملف يتجاوز الحد الأقصى المسموح به (${requestData.maxSizeMB}MB)`,
        );
        setFile(null);
        e.target.value = null; // تفريغ الـ input
      } else {
        setFile(selectedFile);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("يرجى اختيار ملف أولاً");

    setIsUploading(true);
    const data = new FormData();
    data.append("file", file);
    if (requestData.reqSenderName)
      data.append("senderName", formData.senderName);
    if (requestData.reqSenderPhone)
      data.append("senderPhone", formData.senderPhone);
    data.append("senderEmail", formData.senderEmail);

    try {
      const res = await api.post(`/file-requests/upload/${shortLink}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        setIsSuccess(true);
        toast.success("تم إرسال الملف بنجاح");
      }
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        "حدث خطأ. قد يكون الرابط منتهي الصلاحية.";
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  // 💡 1. شاشة التحميل (أثناء التحقق من الرابط)
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-4 font-[Tajawal]"
        dir="rtl"
      >
        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin" />
        <p className="text-slate-500 font-bold">جاري التحقق من الرابط...</p>
      </div>
    );
  }

  // 💡 2. شاشة الخطأ (إذا كان الرابط محذوف أو منتهي الصلاحية)
  if (errorMsg) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-[Tajawal]"
        dir="rtl"
      >
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle size={45} />
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-2">
            الرابط غير متاح
          </h2>
          <p className="text-slate-500 leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // 💡 3. شاشة النجاح (بعد رفع الملف)
  if (isSuccess) {
    return (
      <div
        className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-[Tajawal]"
        dir="rtl"
      >
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={45} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">
            شكراً لكم، تم الاستلام
          </h2>
          <p className="text-slate-500 leading-relaxed">
            تم رفع الملف وفحصه أمنياً بنجاح. سيقوم الفريق المختص بمراجعته
            قريباً.
          </p>
        </div>
      </div>
    );
  }

  // 💡 4. شاشة الرفع (الرئيسية)
  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-[Tajawal]"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* هيدر يعرض بيانات الطلب من الباك إند */}
        <div className="bg-emerald-600 p-8 text-center text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <UploadCloud size={100} />
          </div>
          <h1 className="text-xl font-black mb-2 leading-tight">
            {requestData.title}
          </h1>
          {requestData.description && (
            <p className="text-emerald-100 text-sm font-medium bg-black/10 p-3 rounded-xl inline-block mt-1 max-w-[90%]">
              {requestData.description}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div className="bg-blue-50 text-blue-800 text-xs p-4 rounded-2xl flex items-start gap-3 border border-blue-100">
            <AlertCircle className="w-5 h-5 shrink-0 text-blue-500" />
            <p className="font-medium leading-relaxed">
              أمانكم يهمنا: جميع الملفات يتم فحصها عبر نظام الحماية من الفيروسات
              قبل دخولها للنظام.
            </p>
          </div>

          <div className="space-y-4">
            {/* إظهار/إخفاء الحقول بناءً على إعدادات الموظف */}
            {requestData.reqSenderName && (
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                  الاسم الكامل
                </label>
                <input
                  required
                  type="text"
                  value={formData.senderName}
                  onChange={(e) =>
                    setFormData({ ...formData, senderName: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="أدخل اسمك الثلاثي"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {requestData.reqSenderPhone && (
                <div className={!requestData.reqSenderName ? "col-span-2" : ""}>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                    رقم الجوال
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.senderPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, senderPhone: e.target.value })
                    }
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                    placeholder="05xxxxxxxx"
                  />
                </div>
              )}
              <div
                className={
                  !requestData.reqSenderPhone && !requestData.reqSenderName
                    ? "col-span-2"
                    : ""
                }
              >
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.senderEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, senderEmail: e.target.value })
                  }
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:border-emerald-500 focus:bg-white outline-none transition-all"
                  placeholder="اختياري"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-wider">
                اختيار الملف
              </label>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-300 rounded-3xl cursor-pointer hover:bg-emerald-50 hover:border-emerald-400 transition-all group relative overflow-hidden">
                <div className="text-center p-4">
                  <FileText
                    className={`w-12 h-12 mx-auto mb-2 transition-transform group-hover:scale-110 ${file ? "text-emerald-500" : "text-slate-400"}`}
                  />
                  <p className="text-sm text-slate-600 font-bold px-2 truncate max-w-xs">
                    {file ? file.name : "اسحب الملف هنا أو اضغط للاختيار"}
                  </p>
                  {!file && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      PDF, JPG, PNG (الحد الأقصى {requestData.maxSizeMB}MB)
                    </p>
                  )}
                </div>
                <input
                  type="file"
                  required
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2 mt-4"
          >
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
            {isUploading ? "جاري الفحص والرفع..." : "تأكيد وإرسال الوثيقة"}
          </button>
        </form>
      </div>
    </div>
  );
}
