import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Key,
  Save,
  ShieldCheck,
  Activity,
  Info,
  Eye,
  EyeOff,
  Cpu,
  Globe,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "react-hot-toast";

export default function AiSettings({ onNavigate }) {
  const [apiKey, setApiKey] = useState("");
  const [aiConcurrency, setAiConcurrency] = useState(1);
  const [showKey, setShowKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isConnected, setIsConnected] = useState(null); // 'connected' | 'error' | null

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings");
      if (res.data.success) {
        setApiKey(res.data.data.geminiApiKey || "");
        setAiConcurrency(res.data.data.aiConcurrency || 1);
        // إذا كان المفتاح موجوداً (حتى لو مشفراً)، نفترض الربط مبدئياً
        if (res.data.data.geminiApiKey) setIsConnected("connected");
      }
    } catch (error) {
      toast.error("فشل في مزامنة الإعدادات مع السيرفر");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey) return toast.error("يرجى تزويد مفتاح API صالح");

    setSaving(true);
    try {
      await api.put("/settings", {
        geminiApiKey: apiKey,
        aiConcurrency: parseInt(aiConcurrency),
      });

      toast.success(
        "تم تحديث " +
          (apiKey.includes("*") ? "إعدادات الأداء" : "المفتاح المشفر") +
          " بنجاح",
      );
      fetchSettings();
    } catch (error) {
      toast.error("حدث خطأ تقني أثناء التشفير");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Activity className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-bold text-slate-500">
          جاري تأمين الاتصال...
        </span>
      </div>
    );

  return (
    <div
      className="flex flex-col h-full bg-slate-50/50 p-4 md:p-8 font-cairo animate-in fade-in duration-500"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto w-full">
        {/* --- Header Section --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center shadow-2xl shadow-indigo-200">
              <BrainCircuit className="text-white w-9 h-9" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">
                محرك الذكاء الاصطناعي
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-xs font-bold text-slate-500">
                  النظام يعمل عبر معمارية BullMQ و Gemini 2.5 Pro
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate("AI_MONITOR")}
            className="group flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-700 hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm"
          >
            <Activity className="w-4 h-4 text-indigo-500 group-hover:scale-125 transition-transform" />
            شاشة المراقبة الحية
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* --- Configuration Card --- */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100 overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500" />
                  إعدادات المفتاح الأمني
                </h3>
              </div>
              {isConnected === "connected" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                  <CheckCircle className="w-3 h-3" /> تم التحقق من التشفير
                </div>
              )}
            </div>

            <div className="p-8">
              {/* Security Banner */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-5 flex gap-4 mb-8">
                <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0" />
                <div>
                  <h4 className="text-sm font-black text-indigo-900">
                    تشفير AES-256 Symmetric
                  </h4>
                  <p className="text-xs font-bold text-indigo-700/80 mt-1 leading-relaxed">
                    يتم تخزين المفتاح كـ Ciphertext داخل قاعدة البيانات. لا يمكن
                    فكه إلا من خلال "مفتاح السيرفر الرئيسي" المحفوظ في ملفات
                    البيئة المحمية.
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-sm font-black text-slate-700">
                    Google API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-indigo-600 hover:underline"
                  >
                    جلب مفتاح جديد من Google
                  </a>
                </div>
                <div className="relative group">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    dir="ltr"
                    placeholder="AIzaSy..."
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border-2 border-transparent rounded-2xl text-sm font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-inner"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute left-5 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  >
                    {showKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] font-bold text-slate-400 px-1">
                  💡 ملاحظة: إذا ظهرت النجوم (***) فهذا يعني أن النظام يحتفظ
                  بنسخة مشفرة وآمنة بالفعل.
                </p>
              </div>

              {/* Concurrency Selector */}
              <div className="mt-12 pt-10 border-t border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <Cpu className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-base font-black text-slate-800">
                    إدارة الأداء (Concurrency)
                  </h4>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-6">
                  <div className="flex-1 bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <p className="text-xs md:text-sm font-bold text-slate-600 leading-relaxed">
                      يحدد هذا الإعداد عدد المشاريع التي يستطيع السيرفر تحليلها{" "}
                      <strong>في نفس اللحظة</strong>. تقليل العدد يحسن الاستقرار
                      في سرعات الإنترنت الضعيفة، بينما زيادته ترفع الإنتاجية.
                    </p>
                  </div>

                  <div className="w-full md:w-64 bg-white border-2 border-indigo-100 rounded-3xl p-4 flex flex-col items-center justify-center gap-2 shadow-lg shadow-indigo-50">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider">
                      سعة المعالجة
                    </span>
                    <select
                      value={aiConcurrency}
                      onChange={(e) => setAiConcurrency(e.target.value)}
                      className="w-full bg-transparent text-2xl font-black text-indigo-700 text-center outline-none cursor-pointer"
                      dir="ltr"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Job" : "Jobs"}
                        </option>
                      ))}
                    </select>
                    <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 transition-all duration-700"
                        style={{ width: `${(aiConcurrency / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {aiConcurrency > 3 && (
                  <div className="mt-4 flex items-center gap-2 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span className="text-[11px] font-bold">
                      تحذير: الرفع المتزامن لـ {aiConcurrency} مشاريع قد يسبب
                      بطء في استجابة الشبكة للمستخدمين الآخرين.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* --- Footer Action --- */}
            <div className="flex justify-end gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-3 px-12 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-indigo-600 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-2xl shadow-slate-300"
              >
                {saving ? (
                  <>
                    <Activity className="w-5 h-5 animate-spin" />
                    جاري التشفير والحفظ...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5" />
                    حفظ وتأمين الإعدادات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
