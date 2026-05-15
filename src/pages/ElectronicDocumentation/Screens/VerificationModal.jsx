import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, SearchCheck, ShieldCheck, ShieldAlert, Loader2, QrCode } from "lucide-react";
import api from "../../../api/axios";

export default function VerificationModal({ isOpen, onClose }) {
  const [token, setToken] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (token.length < 8) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await api.get(`/documentation/verify/${token}`);
      setResult({ status: "SUCCESS", data: res.data.data });
    } catch (e) {
      setResult({ status: "ERROR", message: e.response?.data?.message || "رمز غير صحيح" });
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 font-tajawal">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <QrCode size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800">مركز فحص المستندات</h2>
          <p className="text-sm font-bold text-slate-400 mt-1">أدخل الرمز الرقمي المكون من 8 أرقام للتحقق</p>

          <div className="w-full mt-8 space-y-4">
            <input 
              type="text" maxLength={8} value={token} onChange={(e) => setToken(e.target.value.replace(/\D/g,''))}
              placeholder="0 0 0 0 0 0 0 0"
              className="w-full text-center text-3xl font-black tracking-[0.5em] py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
            />
            <button 
              onClick={handleVerify} disabled={token.length < 8 || loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-blue-600 disabled:opacity-50 transition-all flex justify-center items-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "بدء الفحص الأمني"}
            </button>
          </div>

          {/* Result Area */}
          <div className="mt-8 w-full min-h-[150px]">
            {result?.status === "SUCCESS" && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-right">
                <div className="flex items-center gap-3 text-emerald-600 mb-3">
                  <ShieldCheck size={24} /> <span className="font-black text-lg">مستند موثق وسليم</span>
                </div>
                <div className="space-y-2 text-sm font-bold text-slate-600">
                  <p>اسم الوثيقة: {result.data.name}</p>
                  <p>الطرف الثاني: {result.data.partyB}</p>
                  <p>تاريخ الإصدار: {new Date(result.data.timestamp).toLocaleString("ar-SA")}</p>
                </div>
              </motion.div>
            )}
            {result?.status === "ERROR" && (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-rose-50 border border-rose-100 p-6 rounded-3xl text-right">
                <div className="flex items-center gap-3 text-rose-600 mb-3">
                  <ShieldAlert size={24} /> <span className="font-black text-lg">فشل التحقق</span>
                </div>
                <p className="text-sm font-bold text-rose-800">{result.message}</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}