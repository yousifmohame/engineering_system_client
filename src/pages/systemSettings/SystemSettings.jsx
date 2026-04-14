import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import { clsx } from "clsx";
import { useAppStore } from "../../stores/useAppStore";
import { DEFAULT_MENU_CATEGORIES } from "../../constants/menuConstants"; // 💡 تأكد من وجود هذا الملف
import {
  Settings,
  AlertTriangle,
  RefreshCcw,
  Loader2,
  Server,
  LayoutTemplate,
  MonitorPlay,
  PanelBottom,
  PaintBucket,
  ListOrdered,
  Image as ImageIcon,
  Save,
  X,
  Upload,
  ChevronUp,
  ChevronDown,
  Edit2,
} from "lucide-react";

export default function SystemSettings() {
  // حالة التحكم بالتبويب النشط
  const [activeTab, setActiveTab] = useState("sidebar");
  const [isRestarting, setIsRestarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // حالة المودال الجديد لترتيب القوائم
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isMenuSaving, setIsMenuSaving] = useState(false);

  // جلب الحالة والدالة من الـ Store العالمي
  const { sidebarConfig, setSidebarConfig } = useAppStore();

  // حالة محلية للتحكم بالمدخلات قبل الحفظ (قيم افتراضية)
  const [localSidebar, setLocalSidebar] = useState({
    bgColor: "#293241",
    textColor: "#cbd5e1",
    activeColor: "#2563eb",
    width: 280,
    logoUrl: "/logo.jpeg",
    categoryOrder: [],
    customLabels: {},
  });

  // حالة محلية خاصة بمودال الترتيب (نسخة مستقلة للتعديل)
  const [modalSidebarData, setModalSidebarData] = useState({
    logoUrl: "/logo.jpeg",
    categoryOrder: [],
    customLabels: {},
  });

  // مزامنة الحالة المحلية مع الإعدادات القادمة من السيرفر/Store عند التحميل
  useEffect(() => {
    if (sidebarConfig) {
      const updated = {
        bgColor: sidebarConfig.bgColor || "#293241",
        textColor: sidebarConfig.textColor || "#cbd5e1",
        activeColor: sidebarConfig.activeColor || "#2563eb",
        width: sidebarConfig.width || 280,
        logoUrl: sidebarConfig.logoUrl || "/logo.jpeg",
        categoryOrder:
          sidebarConfig.categoryOrder ||
          DEFAULT_MENU_CATEGORIES.map((c) => c.id),
        customLabels: sidebarConfig.customLabels || {},
      };
      setLocalSidebar(updated);
      setModalSidebarData({
        logoUrl: updated.logoUrl,
        categoryOrder: [...updated.categoryOrder],
        customLabels: { ...updated.customLabels },
      });
    }
  }, [sidebarConfig]);

  // عند فتح المودال، نأخذ نسخة من البيانات الحالية للتعديل
  useEffect(() => {
    if (isMenuModalOpen) {
      setModalSidebarData({
        logoUrl: localSidebar.logoUrl,
        categoryOrder: [...localSidebar.categoryOrder],
        customLabels: { ...localSidebar.customLabels },
      });
    }
  }, [isMenuModalOpen, localSidebar]);

  // دالة حفظ إعدادات الـ Sidebar الأساسية
  const saveSidebarSettings = async () => {
    setIsSaving(true);
    try {
      const res = await api.put("/settings/sidebar", localSidebar);
      setSidebarConfig(res.data);
      toast.success("تم تطبيق إعدادات القائمة بنجاح ✨");
    } catch (error) {
      console.error("تفاصيل الخطأ:", error.response?.data || error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== دوال مودال ترتيب القوائم ====================

  // 1. دالة رفع الشعار داخل المودال
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("logo", file);

    try {
      toast.info("جاري رفع الشعار...");
      const res = await api.post("/settings/upload-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setModalSidebarData((prev) => ({ ...prev, logoUrl: res.data.logoUrl }));
      toast.success("تم رفع الشعار بنجاح ✓");
    } catch (error) {
      toast.error("فشل رفع الشعار");
    }
  };

  // 2. دالة تغيير الاسم (لقسم أو شاشة)
  const handleLabelChange = (id, newLabel) => {
    setModalSidebarData((prev) => ({
      ...prev,
      customLabels: { ...prev.customLabels, [id]: newLabel },
    }));
  };

  // 3. دوال الترتيب (صعود وهبوط)
  const moveCategory = (index, direction) => {
    const newOrder = [...modalSidebarData.categoryOrder];
    if (direction === "up" && index > 0) {
      [newOrder[index - 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index - 1],
      ];
    } else if (direction === "down" && index < newOrder.length - 1) {
      [newOrder[index + 1], newOrder[index]] = [
        newOrder[index],
        newOrder[index + 1],
      ];
    }
    setModalSidebarData((prev) => ({ ...prev, categoryOrder: newOrder }));
  };

  // ترتيب الأقسام للعرض بناءً على categoryOrder
  const sortedCategories = [...DEFAULT_MENU_CATEGORIES].sort((a, b) => {
    let indexA = modalSidebarData.categoryOrder.indexOf(a.id);
    let indexB = modalSidebarData.categoryOrder.indexOf(b.id);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  // 4. حفظ تعديلات المودال وتطبيقها على الحالة الرئيسية
  const saveMenuModalChanges = async () => {
    setIsMenuSaving(true);
    try {
      const updatedSidebar = {
        ...localSidebar,
        logoUrl: modalSidebarData.logoUrl,
        categoryOrder: modalSidebarData.categoryOrder,
        customLabels: modalSidebarData.customLabels,
      };

      // إرسال للباك إند
      const res = await api.put("/settings/sidebar", updatedSidebar);

      // تحديث الحالة المحلية والعالمية
      setLocalSidebar(res.data);
      setSidebarConfig(res.data);

      toast.success("تم حفظ ترتيب القوائم والأسماء بنجاح 🎉");
      setIsMenuModalOpen(false);
    } catch (error) {
      console.error("Error saving menu settings:", error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsMenuSaving(false);
    }
  };

  // إعدادات التبويبات الداخلية
  const TABS = [
    {
      id: "sidebar",
      title: "إعدادات القائمة الجانبية",
      icon: LayoutTemplate,
      desc: "ترتيب القوائم، الألوان، اللوجو، وسلوك الفتح والإغلاق",
    },
    {
      id: "header",
      title: "إعدادات الشريط العلوي",
      icon: MonitorPlay,
      desc: "التحكم في شريط البحث، الإشعارات، وملف المستخدم",
    },
    {
      id: "footer",
      title: "إعدادات التذييل",
      icon: PanelBottom,
      desc: "تغيير نصوص الفوتر، الإصدار، وحقوق الملكية",
    },
    {
      id: "server",
      title: "إدارة السيرفر (منطقة الخطر)",
      icon: Server,
      desc: "إعادة تشغيل المحرك والعمليات الحرجة للنظام",
    },
  ];

  const handleRestart = async () => {
    if (
      !window.confirm(
        "تحذير: إعادة التشغيل ستؤدي إلى إيقاف النظام لعدة ثوانٍ وقد تقطع العمليات الجارية للمستخدمين الآخرين. هل أنت متأكد؟",
      )
    )
      return;

    setIsRestarting(true);
    toast.info("تم إرسال أمر إعادة التشغيل للسيرفر...");
    try {
      await api.post("/server/restart");
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      toast.error("فشل إرسال أمر إعادة التشغيل");
      setIsRestarting(false);
    }
  };

  return (
    <div
      className="flex flex-col h-full bg-[#f8fafc] font-[Tajawal] overflow-hidden"
      dir="rtl"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-inner">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 leading-tight">
            إعدادات النظام الشاملة
          </h1>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            تحكم في مظهر النظام، ترتيب القوائم، والعمليات الحرجة
          </p>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* ── Internal Sidebar (Right) ── */}
        <div className="w-[260px] bg-white border-l border-slate-200 shadow-[2px_0_10px_rgba(0,0,0,0.02)] flex flex-col shrink-0 z-10 overflow-y-auto custom-scrollbar-slim">
          <div className="p-4 space-y-1">
            <h3 className="text-[10px] font-black text-slate-400 mb-3 px-2 uppercase tracking-wider">
              أقسام الإعدادات
            </h3>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    "w-full flex items-start gap-3 px-3 py-3 rounded-xl transition-all duration-200 text-right group",
                    isActive
                      ? "bg-blue-50 border border-blue-100 shadow-sm"
                      : "hover:bg-slate-50 border border-transparent",
                  )}
                >
                  <div
                    className={clsx(
                      "p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors",
                      isActive
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-slate-100 text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-50",
                    )}
                  >
                    <TabIcon size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={clsx(
                        "text-[13px] font-black transition-colors",
                        isActive ? "text-blue-800" : "text-slate-700",
                      )}
                    >
                      {tab.title}
                    </span>
                    <span
                      className={clsx(
                        "text-[9px] font-bold leading-tight",
                        isActive ? "text-blue-600/80" : "text-slate-400",
                      )}
                    >
                      {tab.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Dynamic Content Area (Left) ── */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 custom-scrollbar-slim relative">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* ── 1. تبويب القائمة الجانبية ── */}
            {activeTab === "sidebar" && (
              <div className="space-y-6">
                {/* بطاقة الألوان والعرض */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-blue-600" />{" "}
                        مظهر وسلوك القائمة الجانبية
                      </h3>
                      <p className="text-[11px] font-bold text-slate-500">
                        تحكم كامل في الألوان الحية وحجم القائمة، مع إمكانية
                        المعاينة والتطبيق الفوري.
                      </p>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      {/* لون الخلفية */}
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-700">
                          لون الخلفية الأساسي
                        </label>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <input
                            type="color"
                            value={localSidebar.bgColor}
                            onChange={(e) =>
                              setLocalSidebar({
                                ...localSidebar,
                                bgColor: e.target.value,
                              })
                            }
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                          />
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase flex-1 text-left">
                            {localSidebar.bgColor}
                          </span>
                        </div>
                      </div>
                      {/* لون النص */}
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-700">
                          لون النصوص والأيقونات
                        </label>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <input
                            type="color"
                            value={localSidebar.textColor}
                            onChange={(e) =>
                              setLocalSidebar({
                                ...localSidebar,
                                textColor: e.target.value,
                              })
                            }
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                          />
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase flex-1 text-left">
                            {localSidebar.textColor}
                          </span>
                        </div>
                      </div>
                      {/* لون العنصر النشط */}
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-700">
                          لون الشاشة الحالية (Active)
                        </label>
                        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <input
                            type="color"
                            value={localSidebar.activeColor}
                            onChange={(e) =>
                              setLocalSidebar({
                                ...localSidebar,
                                activeColor: e.target.value,
                              })
                            }
                            className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0 shadow-sm"
                          />
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase flex-1 text-left">
                            {localSidebar.activeColor}
                          </span>
                        </div>
                      </div>
                      {/* عرض القائمة */}
                      <div className="md:col-span-3 mt-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-xs font-black text-slate-700">
                            عرض القائمة الجانبية
                          </label>
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">
                            {localSidebar.width}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="200"
                          max="400"
                          step="5"
                          value={localSidebar.width}
                          onChange={(e) =>
                            setLocalSidebar({
                              ...localSidebar,
                              width: parseInt(e.target.value),
                            })
                          }
                          className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold">
                          <span>200px (نحيف)</span>
                          <span>400px (عريض)</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={saveSidebarSettings}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:shadow-none"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {isSaving
                          ? "جاري الحفظ والتطبيق..."
                          : "حفظ وتطبيق التغييرات"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ميزات إضافية - الآن مع مودال عامل! */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ✅ زر ترتيب القوائم - يفتح المودال */}
                  <button
                    onClick={() => setIsMenuModalOpen(true)}
                    className="bg-white border-2 border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group"
                  >
                    <ListOrdered className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-black text-slate-700">
                      ترتيب القوائم وتغيير الأسماء
                    </span>
                    <span className="text-[9px] text-blue-500 font-bold mt-1">
                      اضغط للتعديل ✦
                    </span>
                  </button>

                  
                </div>
              </div>
            )}

            {/* ── 2. تبويب الشريط العلوي ── */}
            {activeTab === "header" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                      <MonitorPlay className="w-4 h-4 text-blue-600" /> إعدادات
                      الشريط العلوي
                    </h3>
                  </div>
                </div>
                <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                  <MonitorPlay className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-sm font-bold text-slate-500">
                    جاري تطوير هذا القسم
                  </p>
                </div>
              </div>
            )}

            {/* ── 3. تبويب التذييل ── */}
            {activeTab === "footer" && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                      <PanelBottom className="w-4 h-4 text-blue-600" /> إعدادات
                      التذييل
                    </h3>
                  </div>
                </div>
                <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                  <PanelBottom className="w-16 h-16 mb-4 text-slate-200" />
                  <p className="text-sm font-bold text-slate-500">
                    جاري تطوير هذا القسم
                  </p>
                </div>
              </div>
            )}

            {/* ── 4. إدارة السيرفر ── */}
            {activeTab === "server" && (
              <div className="space-y-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-md relative overflow-hidden">
                  <AlertTriangle className="absolute -left-4 -top-4 w-32 h-32 text-red-100 opacity-50 rotate-12" />
                  <div className="relative z-10">
                    <h3 className="text-red-800 font-black text-base mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5" /> منطقة الخطر (Danger
                      Zone)
                    </h3>
                    <p className="text-red-700/80 text-[11px] font-bold mb-6 max-w-xl leading-relaxed">
                      استخدم هذا الزر فقط في حالة تعليق النظام، أو بعد تنصيب
                      تحديثات برمجية جديدة تتطلب إعادة تشغيل محرك السيرفر الخلفي
                      (Node.js).
                    </p>
                    <div className="flex items-center gap-4 border-t border-red-200/50 pt-5 mt-2">
                      <button
                        onClick={handleRestart}
                        disabled={isRestarting}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white font-black px-6 py-3 rounded-xl hover:bg-red-700 transition-all shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:shadow-none"
                      >
                        {isRestarting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCcw className="w-4 h-4" />
                        )}
                        {isRestarting
                          ? "جاري إرسال الأمر..."
                          : "إعادة تشغيل السيرفر (Restart Node.js)"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* ════════════ مودال ترتيب القوائم وتغيير الأسماء ═══════════ */}
      {/* ═══════════════════════════════════════════════════════════ */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMenuModalOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <ListOrdered className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">
                    ترتيب وتخصيص القوائم
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500">
                    غيّر الأسماء، رتّب الأقسام، وارفع شعاراً جديداً
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar-slim">
              {/* قسم تغيير الشعار */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> شعار النظام
                  (Logo)
                </h3>
                <div className="flex items-center gap-6">
                  <img
                    src={modalSidebarData.logoUrl}
                    alt="Logo Preview"
                    className="h-20 w-20 rounded-xl object-cover border-2 border-dashed border-slate-300 bg-white"
                  />
                  <div>
                    <label className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2 text-xs">
                      <Upload size={14} /> اختيار شعار جديد
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                    <p className="text-[9px] text-slate-500 mt-2 font-bold">
                      يفضل أبعاد 1:1 أو 16:9 • حجم أقصى 2MB • PNG/SVG مفضل
                    </p>
                  </div>
                </div>
              </div>

              {/* قسم ترتيب وتسمية القوائم */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
                <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-blue-600" /> التحكم
                    في الأقسام والشاشات
                  </span>
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">
                    اسحب للأعلى/الأسفل للترتيب ✦ عدّل الأسماء مباشرة
                  </span>
                </h3>

                <div className="space-y-3">
                  {sortedCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1">
                          {/* أزرار الترتيب */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveCategory(index, "up")}
                              disabled={index === 0}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors p-1"
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => moveCategory(index, "down")}
                              disabled={index === sortedCategories.length - 1}
                              className="text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors p-1"
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          {/* أيقونة القسم */}
                          <div className="p-2 bg-slate-100 rounded-lg">
                            <category.icon
                              size={18}
                              className="text-slate-600"
                            />
                          </div>

                          {/* حقل تغيير اسم القسم */}
                          <div className="flex-1">
                            <label className="text-[9px] font-bold text-slate-400 mb-1 block">
                              اسم القسم الرئيسي
                            </label>
                            <input
                              type="text"
                              value={
                                modalSidebarData.customLabels[category.id] !==
                                undefined
                                  ? modalSidebarData.customLabels[category.id]
                                  : category.title
                              }
                              onChange={(e) =>
                                handleLabelChange(category.id, e.target.value)
                              }
                              className="font-bold text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                              placeholder={category.title}
                            />
                          </div>
                        </div>
                      </div>

                      {/* شاشات القسم الفرعية */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pr-2 border-r-2 border-blue-100 mr-3">
                        {category.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 transition-colors"
                          >
                            <Edit2
                              size={11}
                              className="text-slate-400 shrink-0"
                            />
                            <input
                              type="text"
                              value={
                                modalSidebarData.customLabels[item.id] !==
                                undefined
                                  ? modalSidebarData.customLabels[item.id]
                                  : item.label
                              }
                              onChange={(e) =>
                                handleLabelChange(item.id, e.target.value)
                              }
                              className="text-[10px] font-bold text-slate-600 w-full focus:outline-none bg-transparent border-b border-transparent focus:border-blue-400 transition-colors"
                              placeholder={item.label}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={saveMenuModalChanges}
                disabled={isMenuSaving}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMenuSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isMenuSaving ? "جاري الحفظ..." : "حفظ جميع التعديلات ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
