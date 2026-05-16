import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  X,
  QrCode,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  FileText,
  User,
  Calendar,
  Hash,
  Eye,
  Download,
  AlertTriangle,
  Clock,
  Lock,
  EyeOff,
  SearchCheck,
  Smartphone,
  Database,
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext";

// 💡 استدعاء عارض الملفات الاحترافي الخاص بالنظام
import FileViewerModal from "../../FilesExplorer/modals/FileViewerModal";

// 💡 دالة جلب الرابط الكامل للملف
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  let fixedUrl = url;
  if (url.startsWith("/uploads/")) fixedUrl = `/api${url}`;
  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

// 💡 دالة لتعمية الأسماء الحساسة (يوسف محمد -> ي*** م***)
const maskSensitiveData = (text) => {
  if (!text || text.length < 3) return text;
  return text
    .split(" ")
    .map((word) => {
      if (word.length <= 2) return word;
      return word[0] + "*".repeat(word.length - 2) + word[word.length - 1];
    })
    .join(" ");
};

export default function VerificationModal({ isOpen, onClose }) {
  const { user } = useAuth(); // 💡 جلب بيانات الموظف الفاحص حالياً
  const queryClient = useQueryClient; // متاح إذا كان مستخدماً في السياق أو يمكن تجاهله

  const [token, setToken] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error, revoked, expired, pending, limit_exceeded, unauthorized, otp_required
  const [docData, setDocData] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // حالات الـ OTP الداخلي
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // 💡 حالة تخزين الملف المراد معاينته في FileViewerModal
  const [viewingFile, setViewingFile] = useState(null);

  const handleVerify = async () => {
    if (token.length < 8) {
      toast.error("يرجى إدخال الرمز المكون من 8 أرقام كاملة");
      return;
    }

    setStatus("loading");
    setDocData(null);
    setViewingFile(null);
    setOtpCode("");

    try {
      const res = await api.get(`/documentation/verify/${token}`);

      // 💡 التحقق إذا كان المستند محمي بـ OTP
      if (res.data.data.status === "OTP_REQUIRED" || res.data.data.requireOTP) {
        setDocData(res.data.data);
        setStatus("otp_required");
        toast.info("هذا المستند مؤمن، يرجى كتابة رمز التحقق (OTP)");
      } else {
        setDocData(res.data.data);
        setStatus("success");
        toast.success("تم التحقق من الوثيقة بنجاح ✅");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "";
      const errorData = error.response?.data?.data || null;

      setDocData(errorData);
      setErrorMessage(msg || "رمز التحقق غير صحيح أو المستند غير موجود");

      if (error.response?.status === 403) {
        if (msg.includes("إبطال")) setStatus("revoked");
        else if (msg.includes("منتهية")) setStatus("expired");
        else if (msg.includes("قيد المراجعة")) setStatus("pending");
        else if (msg.includes("الحد الأقصى") || msg.includes("تجاوز"))
          setStatus("limit_exceeded");
        else if (msg.includes("غير مصرح")) setStatus("unauthorized");
        else setStatus("error");
      } else {
        setStatus("error");
      }
    }
  };

  // 💡 دالة إرسال الـ OTP للباك إند والتحقق منه لفك قفل المستند
  const handleVerifyOTP = async () => {
    if (otpCode.length < 4) return;
    setIsVerifyingOtp(true);
    try {
      const res = await api.post(`/documentation/verify-otp`, {
        token,
        otpCode,
      });
      setDocData(res.data.data);
      setStatus("success");
      toast.success("تم تأمين الجلسة وفتح المستند بنجاح 🔓");
    } catch (error) {
      toast.error(error.response?.data?.message || "رمز التحقق غير صحيح");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && token.length >= 8) {
      handleVerify();
    }
  };

  const resetModal = () => {
    setToken("");
    setStatus("idle");
    setDocData(null);
    setViewingFile(null);
    setOtpCode("");
  };

  // 💡 دالة تجهيز الملف للمعاينة في FileViewerModal
  const handleViewFile = () => {
    if (!docData || !docData.fileUrl) return;
    const extension = docData.fileUrl.split(".").pop().toLowerCase();

    setViewingFile({
      url: getFullUrl(docData.fileUrl),
      name: docData.name || "مستند موثق",
      extension: extension,
      size: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <AnimatePresence>
        <div
          className="fixed inset-0 z-[100000] flex items-center justify-center p-4 sm:p-6 font-tajawal"
          dir="rtl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-500 max-h-[95vh]"
          >
            {/* ── Header ── */}
            <div className="bg-slate-50 px-6 py-4 flex justify-between items-center shrink-0 border-b border-slate-200 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center shadow-md">
                  <SearchCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-800">
                    أداة الفحص والتحقق الأمني
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400">
                    الموظف الحالي:{" "}
                    <span className="text-emerald-600">
                      {user?.name || "مدير النظام"}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              {/* ── قسم إدخال الرمز ── */}
              <div
                className={`p-6 sm:p-8 flex flex-col items-center w-full shrink-0 ${status === "success" ? "border-b border-slate-100 bg-slate-50/50 pb-6" : ""}`}
              >
                <div className="w-20 h-20 bg-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-slate-200">
                  <QrCode size={40} />
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-2">
                  أدخل رمز الوثيقة
                </h3>
                <p className="text-sm font-bold text-slate-400 text-center mb-6">
                  قم بكتابة الرمز الأمني المكون من 8 أرقام للتحقق من سلامة
                  وصلاحية المستند.
                </p>

                <div className="w-full max-w-sm space-y-4">
                  <input
                    type="text"
                    maxLength={8}
                    value={token}
                    onChange={(e) => {
                      setToken(
                        e.target.value
                          .replace(/[^a-zA-Z0-9]/g, "")
                          .toUpperCase(),
                      );
                      if (status !== "idle") resetModal();
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="00000000"
                    className="w-full text-center text-3xl sm:text-4xl font-black tracking-[0.5em] sm:tracking-[0.7em] py-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-mono uppercase shadow-sm"
                  />
                  {status !== "otp_required" && (
                    <button
                      onClick={handleVerify}
                      disabled={token.length < 8 || status === "loading"}
                      className="w-full py-4 bg-gradient-to-l from-slate-800 to-slate-900 text-white rounded-2xl font-black shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:hover:translate-y-0 transition-all flex justify-center items-center gap-2"
                    >
                      {status === "loading" ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5" /> فحص المستند
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* ── طلب الـ OTP الداخلي ── */}
                <AnimatePresence>
                  {status === "otp_required" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-sm mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center space-y-3"
                    >
                      <div className="flex items-center justify-center gap-2 text-rose-700 font-black text-sm">
                        <Smartphone className="w-4 h-4" /> مستند محمي بـ OTP
                      </div>
                      <p className="text-[11px] font-bold text-slate-500">
                        تم إرسال كود فك القفل لجوال العميل:{" "}
                        <span className="font-mono text-rose-600">
                          {docData?.clientPhone || "المسجل"}
                        </span>
                      </p>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="أدخل الرمز (1234)"
                        value={otpCode}
                        onChange={(e) =>
                          setOtpCode(e.target.value.replace(/\D/g, ""))
                        }
                        className="w-full text-center text-xl font-black py-2 bg-white border border-rose-200 rounded-xl font-mono outline-none"
                      />
                      <button
                        onClick={handleVerifyOTP}
                        disabled={otpCode.length < 4 || isVerifyingOtp}
                        className="w-full py-2.5 bg-rose-600 text-white text-xs font-black rounded-xl hover:bg-rose-700 flex justify-center items-center gap-1.5 shadow-md shadow-rose-600/10"
                      >
                        {isVerifyingOtp ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          "تأكيد فك قفل الوثيقة"
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── رسائل الأخطاء والحالات الأمنية ── */}
                <AnimatePresence mode="popLayout">
                  {status !== "idle" &&
                    status !== "loading" &&
                    status !== "success" &&
                    status !== "otp_required" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-sm mt-6"
                      >
                        {status === "error" && (
                          <div className="bg-rose-50 border border-rose-100 p-5 rounded-2xl text-center">
                            <ShieldAlert className="w-8 h-8 mx-auto text-rose-500 mb-2" />
                            <h4 className="font-black text-rose-800 mb-1">
                              فشل التحقق
                            </h4>
                            <p className="text-xs font-bold text-rose-600">
                              {errorMessage}
                            </p>
                          </div>
                        )}

                        {status === "revoked" && (
                          <div className="bg-rose-50/80 border border-rose-200 p-5 rounded-2xl text-center shadow-sm">
                            <AlertTriangle className="w-8 h-8 mx-auto text-rose-600 mb-2" />
                            <h4 className="font-black text-rose-900 mb-1">
                              وثيقة مُلغاة (غير سارية)
                            </h4>
                            <p className="text-xs font-bold text-rose-700 mb-3">
                              {errorMessage}
                            </p>
                            {docData?.serialNumber && (
                              <code className="bg-white px-3 py-1 rounded-lg border border-rose-100 text-xs font-black text-rose-600 shadow-sm">
                                {docData.serialNumber}
                              </code>
                            )}
                          </div>
                        )}

                        {status === "expired" && (
                          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center shadow-sm">
                            <Clock className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                            <h4 className="font-black text-amber-900 mb-1">
                              وثيقة منتهية الصلاحية
                            </h4>
                            <p className="text-xs font-bold text-amber-700">
                              {errorMessage}
                            </p>
                          </div>
                        )}

                        {status === "pending" && (
                          <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl text-center shadow-sm">
                            <Loader2 className="w-8 h-8 mx-auto text-blue-500 mb-2 animate-spin" />
                            <h4 className="font-black text-blue-900 mb-1">
                              قيد المراجعة والموافقة
                            </h4>
                            <p className="text-xs font-bold text-blue-700">
                              {errorMessage}
                            </p>
                          </div>
                        )}

                        {(status === "limit_exceeded" ||
                          status === "unauthorized") && (
                          <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl text-center shadow-sm">
                            {status === "limit_exceeded" ? (
                              <EyeOff className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                            ) : (
                              <Lock className="w-8 h-8 mx-auto text-slate-500 mb-2" />
                            )}
                            <h4 className="font-black text-slate-800 mb-1">
                              وصول مقيد أمنياً
                            </h4>
                            <p className="text-xs font-bold text-slate-600">
                              {errorMessage}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                </AnimatePresence>
              </div>

              {/* ── قسم عرض تفاصيل المستند ── */}
              <AnimatePresence>
                {status === "success" && docData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex-1 flex flex-col p-6 sm:p-8 bg-slate-50"
                  >
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-500 p-6 rounded-2xl text-white shadow-lg mb-6 flex items-center gap-4">
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0 border-2 border-white/30">
                        <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black drop-shadow-md">
                          وثيقة معتمدة وآمنة
                        </h2>
                        <p className="text-emerald-50 font-bold mt-1 text-sm opacity-90">
                          سجل مطابق للبيانات الموثقة بنجاح
                        </p>
                      </div>
                    </div>

                    {/* شبكة عرض كروت البيانات بما فيها الميتا داتا الديناميكية */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="flex items-center gap-2 text-slate-400 mb-1.5">
                          <FileText className="w-3.5 h-3.5" />{" "}
                          <span className="text-[10px] font-black uppercase">
                            اسم المستند
                          </span>
                        </p>
                        <p
                          className="font-black text-slate-800 text-sm truncate"
                          title={docData.name}
                        >
                          {docData.name}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="flex items-center gap-2 text-slate-400 mb-1.5">
                          <User className="w-3.5 h-3.5" />{" "}
                          <span className="text-[10px] font-black uppercase">
                            الجهة/الطرف المعني
                          </span>
                        </p>
                        <p className="font-black text-slate-800 text-sm">
                          {docData.partyB}
                        </p>
                      </div>

                      {/* 💡 عرض الميتا داتا المرنة المضافة ديناميكياً */}
                      {docData.customMetadata &&
                        docData.customMetadata.map((meta, idx) => {
                          // تعمية الأسماء لخصوصية الداتا
                          const isNameField =
                            
                            meta.key.includes("مالك") ||
                            meta.key.includes("عميل") ||
                            meta.key.includes("موظف");
                          const displayValue = isNameField
                            ? maskSensitiveData(meta.value)
                            : meta.value;

                          return (
                            <div
                              key={idx}
                              className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                            >
                              <p className="flex items-center gap-2 text-slate-400 mb-1.5">
                                <Database className="w-3.5 h-3.5" />{" "}
                                <span className="text-[10px] font-black uppercase">
                                  {meta.key}
                                </span>
                              </p>
                              <p className="font-black text-slate-800 text-sm">
                                {displayValue}
                              </p>
                            </div>
                          );
                        })}

                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="flex items-center gap-2 text-slate-400 mb-1.5">
                          <Hash className="w-3.5 h-3.5" />{" "}
                          <span className="text-[10px] font-black uppercase">
                            السيريال الأمني
                          </span>
                        </p>
                        <p className="font-mono font-black text-blue-600 text-sm">
                          {docData.serialNumber}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <p className="flex items-center gap-2 text-slate-400 mb-1.5">
                          <Calendar className="w-3.5 h-3.5" />{" "}
                          <span className="text-[10px] font-black uppercase">
                            تاريخ التوثيق
                          </span>
                        </p>
                        <p
                          className="font-black text-slate-800 text-sm"
                          dir="ltr"
                        >
                          {new Date(
                            docData.timestamp || docData.createdAt,
                          ).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
                      <div className="flex items-center gap-2 text-slate-400 mb-2">
                        <ShieldCheck className="w-4 h-4" />{" "}
                        <span className="text-xs font-black">
                          البصمة الأمنية الرقمية (SHA-256 Hash)
                        </span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-500 break-all bg-white p-2 rounded-xl border border-slate-200">
                        {docData.hash}
                      </p>
                    </div>

                    {/* ── Actions ── */}
                    {docData.fileUrl && (
                      <div className="flex flex-col sm:flex-row gap-3 mt-auto shrink-0">
                        <button
                          onClick={handleViewFile}
                          className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-900/20 transition-all active:scale-[0.98]"
                        >
                          <Eye className="w-5 h-5" /> معاينة وقراءة المستند
                        </button>

                        <a
                          href={getFullUrl(docData.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="flex-1 py-4 bg-blue-50 text-blue-700 border border-blue-200 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-blue-100 transition-all shadow-sm active:scale-[0.98]"
                        >
                          <Download className="w-5 h-5" /> تنزيل النسخة الأصلية
                        </a>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {/* 💡 استدعاء عارض الملفات المستقل يطفو فوق المودال بشكل معزول كلياً */}
      {viewingFile && (
        <FileViewerModal
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </>
  );
}
