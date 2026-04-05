import React, { useState, useEffect } from "react";
import {
  Network,
  Key,
  Server,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Save,
  Activity,
  Terminal,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios"; // تأكد من مسار الـ API

export default function TailscaleIntegrationScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null); // null, 'success', 'error'

  const [formData, setFormData] = useState({
    tailnet: "",
    apiKey: "",
    authKey: "", // 👈 إضافة حقل Auth Key للربط التلقائي
    isActive: false,
  });

  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [hasExistingAuthKey, setHasExistingAuthKey] = useState(false);

  // جلب الإعدادات الحالية
  const fetchConfig = async () => {
    try {
      const res = await api.get("/settings/tailscale");
      if (res.data?.data) {
        setFormData({
          tailnet: res.data.data.tailnet || "",
          apiKey: "", // نتركه فارغاً للأمان
          authKey: "", // نتركه فارغاً للأمان
          isActive: res.data.data.isActive || false,
        });
        setHasExistingKey(res.data.data.hasKey);
        // نفترض أن الباك إند سيرسل hasAuthKey أيضاً
        setHasExistingAuthKey(res.data.data.hasAuthKey || false);
      }
    } catch (error) {
      toast.error("فشل في جلب إعدادات Tailscale");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!formData.tailnet) return toast.error("يرجى إدخال اسم شبكة Tailnet");
    if (!hasExistingKey && !formData.apiKey)
      return toast.error("يرجى إدخال مفتاح API");

    setIsSaving(true);
    try {
      await api.post("/settings/tailscale", formData);
      toast.success("تم حفظ إعدادات Tailscale بنجاح");

      setHasExistingKey(true);
      if (formData.authKey) setHasExistingAuthKey(true);

      // مسح المفاتيح من الشاشة بعد الحفظ لأسباب أمنية
      setFormData((prev) => ({ ...prev, apiKey: "", authKey: "" }));
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      const res = await api.get("/settings/tailscale/test");
      toast.success(res.data.message);
      setConnectionStatus({ success: true, count: res.data.devicesCount });
    } catch (error) {
      toast.error(
        error.response?.data?.message || "فشل الاتصال بخوادم Tailscale",
      );
      setConnectionStatus({ success: false });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الأمر بنجاح");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-[Tajawal]" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ربط Tailscale</h1>
              <p className="text-blue-200 mt-1 text-sm">
                إدارة الاتصال الآمن بشبكة العمل الافتراضية الخاصة بك وأتمتة
                السيرفرات
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Status Alert */}
          {connectionStatus && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${connectionStatus.success ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}
            >
              {connectionStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {connectionStatus.success
                    ? "الاتصال نشط ومستقر"
                    : "فشل في الاتصال"}
                </h3>
                <p className="text-xs mt-1 opacity-80">
                  {connectionStatus.success
                    ? `تم التعرف على ${connectionStatus.count} أجهزة متصلة بالشبكة حالياً.`
                    : "يرجى مراجعة مفتاح API واسم الشبكة والمحاولة مرة أخرى."}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form Fields */}
            <div className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                  <Server className="w-4 h-4 text-slate-400" /> اسم شبكة Tailnet
                </label>
                <input
                  type="text"
                  name="tailnet"
                  value={formData.tailnet}
                  onChange={handleInputChange}
                  placeholder="مثال: mydomain.github.beta.tailscale.net"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors text-left"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" /> مفتاح Tailscale
                    API
                  </div>
                  {hasExistingKey && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      مفتاح محفوظ مسبقاً
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  name="apiKey"
                  value={formData.apiKey}
                  onChange={handleInputChange}
                  placeholder={
                    hasExistingKey
                      ? "•••••••••••••••••••• (اكتب هنا لتحديث المفتاح)"
                      : "tskey-api-..."
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors text-left"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  يُستخدم لقراءة بيانات الشبكة واختبار الاتصال.
                </p>
              </div>

              {/* 👈 حقل Auth Key الجديد */}
              <div>
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" /> مفتاح الربط (Auth
                    Key)
                  </div>
                  {hasExistingAuthKey && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      مفتاح محفوظ مسبقاً
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  name="authKey"
                  value={formData.authKey}
                  onChange={handleInputChange}
                  placeholder={
                    hasExistingAuthKey
                      ? "•••••••••••••••••••• (اكتب هنا لتحديث المفتاح)"
                      : "tskey-auth-..."
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors text-left"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  يُستخدم لأتمتة ربط السيرفرات الجديدة بشبكتك.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    تفعيل الربط مع النظام
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    السماح للنظام بقراءة حالة الأجهزة والتفاعل مع الشبكة
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Help & Actions */}
            <div className="flex flex-col">
              <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 mb-5">
                <h3 className="font-bold text-blue-900 text-sm mb-3">
                  كيف أحصل على بيانات الربط؟
                </h3>
                <ul className="text-xs text-blue-800 space-y-3 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                      1
                    </span>
                    سجل دخول إلى لوحة تحكم{" "}
                    <strong>Tailscale Admin Console</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                      2
                    </span>
                    للحصول على <strong>Tailnet</strong>: اذهب إلى{" "}
                    <strong>Settings &gt; General</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center shrink-0">
                      3
                    </span>
                    للحصول على <strong>API Key و Auth Key</strong>: اذهب إلى{" "}
                    <strong>Settings &gt; Keys</strong> وقم بتوليد كل مفتاح في
                    قسمه المخصص.
                  </li>
                </ul>
              </div>

              {/* 👈 قسم أمر الأتمتة (Provisioning Command) */}
              <div className="bg-slate-900 rounded-xl p-4 mb-5 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-white text-xs font-bold">
                    أمر الأتمتة (Auto-Provisioning)
                  </h4>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-lg flex items-center justify-between border border-slate-700/50">
                  <code
                    className="text-emerald-400/90 text-[10px] font-mono whitespace-nowrap overflow-x-auto flex-1 text-left scrollbar-hide"
                    dir="ltr"
                  >
                    curl -s "{window.location.origin}
                    /api/tailscale/provision?token=YOUR_SECRET" | bash
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -s "${window.location.origin}/api/tailscale/provision?token=YOUR_SECRET" | bash`,
                      )
                    }
                    className="text-slate-400 hover:text-white p-1.5 ml-2 bg-slate-800 rounded-md transition-colors"
                    title="نسخ الأمر"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] mt-3 leading-relaxed">
                  انسخ هذا الأمر ونفذه في الـ Terminal لأي سيرفر جديد لربطه
                  تلقائياً بشبكة الـ VPN الخاصة بك بناءً على الـ Auth Key
                  المحفوظ. (لا تنسَ استبدال{" "}
                  <span className="text-emerald-300 font-mono">
                    YOUR_SECRET
                  </span>{" "}
                  بالرمز المحفوظ في ملف{" "}
                  <span className="text-slate-300 font-mono">.env</span>).
                </p>
              </div>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || (!hasExistingKey && !formData.apiKey)}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  اختبار الاتصال
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-[2] px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  حفظ الإعدادات
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
