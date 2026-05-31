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
        <Activity className="w-8 h-8 text-[#0f6d7c] animate-spin" />
        <span className="text-sm font-bold text-[#71839a]">
          جاري تأمين الاتصال...
        </span>
      </div>
    );

  return (
    <div
      className="flex flex-col h-full bg-[#eef5f7] p-4 md:p-5 font-cairo animate-in fade-in duration-500"
      dir="rtl"
    >
      <div className="max-w-5xl mx-auto w-full">
        {/* --- Header Section --- */}
        <div className="sys-compact-page-header flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
            <div className="w-9 h-9 rounded-[13px] bg-[#d9b85b] text-[#083646] flex items-center justify-center shrink-0 shadow-sm">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold leading-tight whitespace-nowrap text-white">محرك الذكاء الاصطناعي</h2>
              <p className="text-[10px] font-semibold text-white/75 mt-0.5 whitespace-nowrap">النظام يعمل عبر معمارية BullMQ و Gemini 2.5 Pro</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate("AI_MONITOR")}
            className="h-10 px-4 rounded-[15px] bg-white text-[#123B5D] border border-[#d8e6ee] shadow-sm text-xs font-black flex items-center gap-2 hover:bg-[#f8fbfd] transition-all"
          >
            <Activity className="w-4 h-4 text-[#0f6d7c]" />
            شاشة المراقبة الحية
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {/* --- Configuration Card --- */}
          <div className="bg-white rounded-[24px] border border-[#d8e6ee] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d8e6ee] bg-[#f3f8fb] flex justify-between items-center">
              <div>
                <h3 className="text-[15px] font-black text-[#123B5D] flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#0f6d7c]" />
                  إعدادات المفتاح الأمني
                </h3>
              </div>
              {isConnected === "connected" && (
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-[#0f6d7c] rounded-full text-[10px] font-black border border-[#c7f0dc]">
                  <CheckCircle className="w-3 h-3" /> تم التحقق من التشفير
                </div>
              )}
            </div>

            <div className="p-5 md:p-6">
              {/* Security Banner */}
              <div className="bg-[#eef5f7] border border-[#d8e6ee] rounded-[20px] p-4 flex gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-[#0f6d7c] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-black text-[#123B5D]">
                    تشفير AES-256 Symmetric
                  </h4>
                  <p className="text-[11px] font-bold text-[#52677e] mt-1 leading-relaxed">
                    يتم تخزين المفتاح كـ Ciphertext داخل قاعدة البيانات. لا يمكن
                    فكه إلا من خلال "مفتاح السيرفر الرئيسي" المحفوظ في ملفات
                    البيئة المحمية.
                  </p>
                </div>
              </div>

              {/* API Key Input */}
              <div className="space-y-3">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[13px] font-black text-[#123B5D]">
                    Google API Key
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-[#0f6d7c] hover:underline"
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
                    className="w-full h-12 pl-12 pr-4 bg-[#f7fbfd] border border-[#d8e6ee] rounded-[16px] text-sm font-bold focus:bg-white focus:border-[#d9b85b] outline-none transition-all shadow-sm"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-[#8aa0b4] hover:text-[#0f6d7c] hover:bg-[#eef5f7] rounded-lg transition-all"
                  >
                    {showKey ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-[11px] font-bold text-[#8aa0b4] px-1">
                  💡 ملاحظة: إذا ظهرت النجوم (***) فهذا يعني أن النظام يحتفظ
                  بنسخة مشفرة وآمنة بالفعل.
                </p>
              </div>

              {/* Concurrency Selector */}
              <div className="mt-7 pt-6 border-t border-[#e7eef2]">
                <div className="flex items-center gap-3 mb-4">
                  <Cpu className="w-4 h-4 text-[#0f6d7c]" />
                  <h4 className="text-[14px] font-black text-[#123B5D]">
                    إدارة الأداء (Concurrency)
                  </h4>
                </div>

                <div className="flex flex-col md:flex-row items-stretch gap-4">
                  <div className="flex-1 bg-[#f7fbfd] rounded-[20px] p-4 border border-[#e7eef2]">
                    <p className="text-[12px] font-bold text-[#52677e] leading-relaxed">
                      يحدد هذا الإعداد عدد المشاريع التي يستطيع السيرفر تحليلها{" "}
                      <strong>في نفس اللحظة</strong>. تقليل العدد يحسن الاستقرار
                      في سرعات الإنترنت الضعيفة، بينما زيادته ترفع الإنتاجية.
                    </p>
                  </div>

                  <div className="w-full md:w-56 bg-white border border-[#d8e6ee] rounded-[20px] p-4 flex flex-col items-center justify-center gap-2 shadow-sm">
                    <span className="text-[10px] font-black text-[#71839a] uppercase tracking-wider">
                      سعة المعالجة
                    </span>
                    <select
                      value={aiConcurrency}
                      onChange={(e) => setAiConcurrency(e.target.value)}
                      className="w-full bg-transparent text-[22px] font-black text-[#123B5D] text-center outline-none cursor-pointer"
                      dir="ltr"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Job" : "Jobs"}
                        </option>
                      ))}
                    </select>
                    <div className="w-full h-1 bg-[#eef5f7] rounded-full mt-2 overflow-hidden">
                      <div
                        className="h-full bg-[#0f6d7c] transition-all duration-700"
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
            <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#d8e6ee] bg-white">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-[#083646] text-white rounded-[16px] font-black text-sm hover:bg-[#0f6d7c] active:scale-95 transition-all disabled:opacity-50 shadow-sm"
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
