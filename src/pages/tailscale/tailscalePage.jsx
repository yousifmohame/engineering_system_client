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
  Globe,
  MonitorSmartphone,
  Monitor,
  RefreshCw,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios"; // تأكد من مسار الـ API الصحيح لديك

export default function TailscaleIntegrationScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  // حالات البيانات
  const [formData, setFormData] = useState({
    tailnet: "-", // افتراضياً نستخدم علامة - لتسهيل التعرف على الشبكة
    apiKey: "",
    authKey: "",
    isActive: false,
  });

  const [hasExistingKey, setHasExistingKey] = useState(false);
  const [hasExistingAuthKey, setHasExistingAuthKey] = useState(false);

  // حالات الأجهزة والـ Exit Node
  const [devices, setDevices] = useState([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [selectedExitNode, setSelectedExitNode] = useState("");
  const [isSettingExitNode, setIsSettingExitNode] = useState(false);

  // 1. جلب الإعدادات الحالية عند فتح الشاشة
  const fetchConfig = async () => {
    try {
      const res = await api.get("/settings/tailscale");
      if (res.data?.data) {
        setFormData({
          tailnet: res.data.data.tailnet || "-",
          apiKey: "",
          authKey: "",
          isActive: res.data.data.isActive || false,
        });
        setHasExistingKey(res.data.data.hasKey);
        setHasExistingAuthKey(res.data.data.hasAuthKey);

        // إذا كان هناك مفتاح API محفوظ مسبقاً، اجلب قائمة الأجهزة فوراً
        if (res.data.data.hasKey) {
          fetchDevices();
        }
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

  // 2. جلب قائمة الأجهزة المتصلة
  const fetchDevices = async () => {
    setIsLoadingDevices(true);
    try {
      const res = await api.get("/settings/tailscale/devices");
      if (res.data.success) {
        setDevices(res.data.devices || []);
      }
    } catch (error) {
      toast.error("لم نتمكن من جلب قائمة الأجهزة. تأكد من صحة الـ API Key.");
    } finally {
      setIsLoadingDevices(false);
    }
  };

  // 3. تطبيق مسار الإنترنت (Exit Node)
  const handleApplyExitNode = async () => {
    setIsSettingExitNode(true);
    try {
      const res = await api.post("/settings/tailscale/exit-node", {
        exitNodeIp: selectedExitNode,
      });
      if (res.data.success) {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("فشل في توجيه الإنترنت. تأكد من إعدادات السيرفر وصلاحياته.");
    } finally {
      setIsSettingExitNode(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 4. حفظ الإعدادات
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

      // مسح المفاتيح من الشاشة بعد الحفظ للأمان
      setFormData((prev) => ({ ...prev, apiKey: "", authKey: "" }));

      // تحديث قائمة الأجهزة بعد الحفظ
      fetchDevices();
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsSaving(false);
    }
  };

  // 5. اختبار الاتصال السريع
  const handleTestConnection = async () => {
    setIsTesting(true);
    setConnectionStatus(null);
    try {
      const res = await api.get("/settings/tailscale/test");
      toast.success(res.data.message);
      setConnectionStatus({ success: true, count: res.data.devicesCount });
      fetchDevices(); // جلب الأجهزة بعد نجاح الاختبار
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

  // دالة مساعدة لتحديد أيقونة نظام التشغيل
  const getOsIcon = (os) => {
    if (!os) return <Server className="w-4 h-4 text-slate-400" />;
    const o = os.toLowerCase();
    if (o.includes("linux") || o.includes("ubuntu"))
      return <Terminal className="w-4 h-4 text-orange-500" />;
    if (o.includes("windows"))
      return <Monitor className="w-4 h-4 text-blue-500" />;
    if (o.includes("android") || o.includes("ios") || o.includes("mac"))
      return <Smartphone className="w-4 h-4 text-slate-600" />;
    return <Server className="w-4 h-4 text-slate-400" />;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 font-[Tajawal]" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {/* ================= Header ================= */}
        <div className="bg-slate-900 px-6 py-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
              <Network className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                إدارة شبكة Tailscale
              </h1>
              <p className="text-blue-200 mt-1 text-sm">
                التحكم في الـ VPN، الأتمتة، وتوجيه مسار الإنترنت للسيرفر
              </p>
            </div>
          </div>
        </div>

        {/* ================= Content ================= */}
        <div className="p-8 space-y-8">
          {/* Status Alert */}
          {connectionStatus && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${connectionStatus.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"}`}
            >
              {connectionStatus.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              )}
              <div>
                <h3 className="font-bold text-sm">
                  {connectionStatus.success
                    ? "الاتصال نشط ومستقر 🟢"
                    : "فشل في الاتصال 🔴"}
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
            {/* --- Form Fields --- */}
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
                  placeholder="يفضل تركها (-) للتعرف التلقائي"
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors text-left font-mono"
                />
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" /> مفتاح Tailscale
                    API
                  </div>
                  {hasExistingKey && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      محفوظ مسبقاً
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
                      ? "•••••••••••••••••••• (اكتب للتحديث)"
                      : "tskey-api-..."
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors text-left"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  لقراءة بيانات الشبكة واختبار الاتصال.
                </p>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm font-bold text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-slate-400" /> مفتاح الربط
                    التلقائي (Auth Key)
                  </div>
                  {hasExistingAuthKey && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                      محفوظ مسبقاً
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
                      ? "•••••••••••••••••••• (اكتب للتحديث)"
                      : "tskey-auth-..."
                  }
                  dir="ltr"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-500 outline-none transition-colors text-left"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  لأتمتة ربط السيرفرات الجديدة بشبكتك.
                </p>
              </div>
            </div>

            {/* --- Actions & Automation Command --- */}
            <div className="flex flex-col">
              <div className="bg-slate-900 rounded-xl p-4 mb-5 shadow-lg relative overflow-hidden">
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-white text-xs font-bold">
                    أمر الأتمتة (السيرفرات الجديدة)
                  </h4>
                </div>

                <div className="bg-slate-950/50 p-3 rounded-lg flex items-center justify-between border border-slate-700/50 relative z-10">
                  <code
                    className="text-emerald-400/90 text-[10px] font-mono whitespace-nowrap overflow-x-auto flex-1 text-left scrollbar-hide"
                    dir="ltr"
                  >
                    curl -s "{window.location.origin}
                    /api/provision-tailscale?token=YOUR_SECRET" | bash
                  </code>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        `curl -s "${window.location.origin}/api/provision-tailscale?token=YOUR_SECRET" | bash`,
                      )
                    }
                    className="text-slate-400 hover:text-white p-1.5 ml-2 bg-slate-800 rounded-md transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-slate-400 text-[10px] mt-3 leading-relaxed relative z-10">
                  نفذ هذا الأمر في الـ Terminal لأي سيرفر جديد لربطه تلقائياً
                  بشبكتك. (استبدل YOUR_SECRET بالرمز الموجود في ملف .env).
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

          <hr className="border-slate-100" />

          {/* ================= Exit Node Routing Section ================= */}
          <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Globe className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-blue-900">
                  توجيه إنترنت السيرفر (Exit Node)
                </h3>
                <p className="text-sm text-blue-800/80">
                  اجعل السيرفر يتصفح الإنترنت كأنه داخل مكتبكم بالسعودية (لتخطي
                  الحظر الجغرافي).
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-end gap-4">
              <div className="flex-1 w-full">
                <label className="block text-sm font-bold text-blue-900 mb-2">
                  اختر جهاز التوجيه المتاح
                </label>
                <div className="relative">
                  <select
                    value={selectedExitNode}
                    onChange={(e) => setSelectedExitNode(e.target.value)}
                    disabled={isLoadingDevices || devices.length === 0}
                    className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-colors appearance-none text-slate-700"
                  >
                    <option value="">
                      -- إيقاف التوجيه (العودة لإنترنت السيرفر الافتراضي) --
                    </option>
                    {devices.map((dev) => (
                      <option key={dev.id} value={dev.ip}>
                        {dev.name} - ({dev.ip})
                      </option>
                    ))}
                  </select>
                  {isLoadingDevices && (
                    <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-blue-500" />
                  )}
                </div>
              </div>

              <button
                onClick={handleApplyExitNode}
                disabled={isSettingExitNode || isLoadingDevices}
                className="w-full md:w-auto px-8 py-3 bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 h-[46px]"
              >
                {isSettingExitNode ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MonitorSmartphone className="w-4 h-4" />
                )}
                تطبيق التوجيه
              </button>
            </div>

            <p className="text-xs text-blue-700 mt-3 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              ملاحظة: يجب تفعيل خيار (Run as exit node) من إعدادات Tailscale في
              جهاز الكمبيوتر المراد استخدامه.
            </p>
          </div>
        </div>
      </div>

      {/* ================= Connected Devices Table Section ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              الأجهزة المتصلة بالشبكة الافتراضية
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              تحديث حي لحالة أجهزة الموظفين والسيرفرات
            </p>
          </div>

          <button
            onClick={fetchDevices}
            disabled={isLoadingDevices}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-bold text-slate-700 transition-colors"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoadingDevices ? "animate-spin text-blue-500" : ""}`}
            />
            تحديث القائمة
          </button>
        </div>

        <div className="p-0 overflow-x-auto">
          {devices.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              {isLoadingDevices ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <p>جاري تحميل الأجهزة...</p>
                </div>
              ) : (
                <p>
                  لا توجد أجهزة متصلة، أو يرجى التأكد من صحة مفتاح API وإجراء
                  "اختبار الاتصال".
                </p>
              )}
            </div>
          ) : (
            <table className="w-full text-sm text-right">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold">اسم الجهاز (Hostname)</th>
                  <th className="px-6 py-4 font-bold">نظام التشغيل</th>
                  <th className="px-6 py-4 font-bold">عنوان الشبكة (IP)</th>
                  <th className="px-6 py-4 font-bold">حالة الاتصال</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {devices.map((device) => (
                  <tr
                    key={device.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        {getOsIcon(device.os)}
                      </div>
                      {device.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 capitalize">
                      {device.os || "غير معروف"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700 border border-slate-200">
                        {device.ip}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {device.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          نشط الآن
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          غير نشط
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
