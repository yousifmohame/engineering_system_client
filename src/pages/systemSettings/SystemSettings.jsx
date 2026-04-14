import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { toast } from "sonner";
import { clsx } from "clsx";
import { useAppStore } from "../../stores/useAppStore";
import { DEFAULT_MENU_CATEGORIES } from "../../constants/menuConstants";
import {
  Settings,
  AlertTriangle,
  RefreshCcw,
  Loader2,
  Server,
  LayoutTemplate,
  MonitorPlay,
  PanelBottom,
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

  // حالة محلية للتحكم بالمدخلات
  const [localSidebar, setLocalSidebar] = useState({
    bgColor: "#293241",
    textColor: "#cbd5e1",
    activeColor: "#2563eb",
    width: 280,
    logoUrl: "/logo.jpeg",
    categoryOrder: [],
    itemOrder: {}, // 💡 إضافة تخزين ترتيب الشاشات
    customLabels: {},
  });

  // حالة محلية خاصة بمودال الترتيب
  const [modalSidebarData, setModalSidebarData] = useState({
    logoUrl: "/logo.jpeg",
    categoryOrder: [],
    itemOrder: {},
    customLabels: {},
  });

  // مزامنة الحالة مع الإعدادات القادمة من السيرفر
  useEffect(() => {
    if (sidebarConfig) {
      const updated = {
        bgColor: sidebarConfig.bgColor || "#293241",
        textColor: sidebarConfig.textColor || "#cbd5e1",
        activeColor: sidebarConfig.activeColor || "#2563eb",
        width: sidebarConfig.width || 280,
        logoUrl: sidebarConfig.logoUrl || "/logo.jpeg",
        // 💡 ضمان وجود ترتيب افتراضي إذا كانت المصفوفة فارغة
        categoryOrder:
          sidebarConfig.categoryOrder && sidebarConfig.categoryOrder.length > 0
            ? sidebarConfig.categoryOrder
            : DEFAULT_MENU_CATEGORIES.map((c) => c.id),
        itemOrder: sidebarConfig.itemOrder || {},
        customLabels: sidebarConfig.customLabels || {},
      };
      setLocalSidebar(updated);
      setModalSidebarData({
        logoUrl: updated.logoUrl,
        categoryOrder: [...updated.categoryOrder],
        itemOrder: { ...updated.itemOrder },
        customLabels: { ...updated.customLabels },
      });
    }
  }, [sidebarConfig]);

  // عند فتح المودال، نأخذ نسخة من البيانات
  useEffect(() => {
    if (isMenuModalOpen) {
      setModalSidebarData({
        logoUrl: localSidebar.logoUrl,
        categoryOrder: [...localSidebar.categoryOrder],
        itemOrder: { ...localSidebar.itemOrder },
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
      toast.success("تم تطبيق إعدادات المظهر بنجاح ✨");
    } catch (error) {
      console.error("تفاصيل الخطأ:", error.response?.data || error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  // ==================== دوال مودال الترتيب والتخصيص ====================

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

  const handleLabelChange = (id, newLabel) => {
    setModalSidebarData((prev) => ({
      ...prev,
      customLabels: { ...prev.customLabels, [id]: newLabel },
    }));
  };

  // 💡 إصلاح ترتيب الأقسام الرئيسية (يعتمد على ID بدلاً من Index)
  const moveCategory = (categoryId, direction) => {
    setModalSidebarData((prev) => {
      const newOrder = [...prev.categoryOrder];
      const index = newOrder.indexOf(categoryId);

      if (index === -1) return prev;

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

      return { ...prev, categoryOrder: newOrder };
    });
  };

  // 💡 إضافة: دالة ترتيب الشاشات الفرعية داخل القسم
  const moveItem = (categoryId, itemId, direction) => {
    setModalSidebarData((prev) => {
      // جلب الترتيب الحالي للشاشات أو استخراج الترتيب الافتراضي
      const categoryConfig = DEFAULT_MENU_CATEGORIES.find(
        (c) => c.id === categoryId,
      );
      if (!categoryConfig) return prev;

      const currentOrder =
        prev.itemOrder[categoryId] || categoryConfig.items.map((i) => i.id);
      const index = currentOrder.indexOf(itemId);

      if (index === -1) return prev;

      const newOrder = [...currentOrder];
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

      return {
        ...prev,
        itemOrder: {
          ...prev.itemOrder,
          [categoryId]: newOrder,
        },
      };
    });
  };

  // تجهيز الأقسام للعرض بترتيبها الصحيح
  const sortedCategories = [...DEFAULT_MENU_CATEGORIES].sort((a, b) => {
    let indexA = modalSidebarData.categoryOrder.indexOf(a.id);
    let indexB = modalSidebarData.categoryOrder.indexOf(b.id);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  // تجهيز الشاشات للعرض بترتيبها الصحيح داخل كل قسم
  const getSortedItems = (category) => {
    const order =
      modalSidebarData.itemOrder[category.id] ||
      category.items.map((i) => i.id);
    return [...category.items].sort((a, b) => {
      let indexA = order.indexOf(a.id);
      let indexB = order.indexOf(b.id);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });
  };

  const saveMenuModalChanges = async () => {
    setIsMenuSaving(true);
    try {
      const updatedSidebar = {
        ...localSidebar,
        logoUrl: modalSidebarData.logoUrl,
        categoryOrder: modalSidebarData.categoryOrder,
        itemOrder: modalSidebarData.itemOrder,
        customLabels: modalSidebarData.customLabels,
      };

      const res = await api.put("/settings/sidebar", updatedSidebar);
      setLocalSidebar(res.data);
      setSidebarConfig(res.data);

      toast.success("تم حفظ الهيكلة وترتيب الشاشات بنجاح 🎉");
      setIsMenuModalOpen(false);
    } catch (error) {
      console.error("Error saving menu settings:", error);
      toast.error(error.response?.data?.error || "حدث خطأ أثناء الحفظ");
    } finally {
      setIsMenuSaving(false);
    }
  };

  const TABS = [
    {
      id: "sidebar",
      title: "إعدادات القائمة الجانبية",
      icon: LayoutTemplate,
      desc: "ترتيب القوائم، الألوان، اللوجو",
    },
    {
      id: "header",
      title: "إعدادات الشريط العلوي",
      icon: MonitorPlay,
      desc: "التحكم في شريط البحث والإشعارات",
    },
    {
      id: "footer",
      title: "إعدادات التذييل",
      icon: PanelBottom,
      desc: "تغيير نصوص الفوتر والإصدار",
    },
    {
      id: "server",
      title: "إدارة السيرفر (منطقة الخطر)",
      icon: Server,
      desc: "إعادة تشغيل المحرك",
    },
  ];

  const handleRestart = async () => {
    if (!window.confirm("تحذير: سيتم إيقاف النظام مؤقتاً، هل أنت متأكد؟"))
      return;
    setIsRestarting(true);
    toast.info("تم إرسال أمر إعادة التشغيل...");
    try {
      await api.post("/server/restart");
      setTimeout(() => window.location.reload(), 5000);
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
      <div className="flex items-center gap-3 px-6 py-4 bg-white border-b border-slate-200 shrink-0 shadow-sm z-10">
        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-inner">
          <Settings className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-lg font-black text-slate-800 leading-tight">
            إعدادات النظام الشاملة
          </h1>
          <p className="text-[11px] font-bold text-slate-500 mt-0.5">
            تحكم في مظهر النظام والعمليات الحرجة
          </p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="w-[260px] bg-white border-l border-slate-200 shadow-[2px_0_10px_rgba(0,0,0,0.02)] flex flex-col shrink-0 z-10 overflow-y-auto">
          <div className="p-4 space-y-1">
            <h3 className="text-[10px] font-black text-slate-400 mb-3 px-2 uppercase">
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
                      ? "bg-blue-50 border border-blue-100"
                      : "hover:bg-slate-50 border border-transparent",
                  )}
                >
                  <div
                    className={clsx(
                      "p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors",
                      isActive
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:text-blue-500 group-hover:bg-blue-50",
                    )}
                  >
                    <TabIcon size={16} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={clsx(
                        "text-[13px] font-black",
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

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 relative">
          <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {activeTab === "sidebar" && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div>
                      <h3 className="text-sm font-black text-slate-800 mb-1 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-blue-600" />{" "}
                        الألوان والمظهر
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                            {localSidebar.bgColor}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-700">
                          لون النصوص
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
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                            {localSidebar.textColor}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-xs font-black text-slate-700">
                          لون الشاشة الحالية
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
                          <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                            {localSidebar.activeColor}
                          </span>
                        </div>
                      </div>
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
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={saveSidebarSettings}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black text-xs flex items-center gap-2 shadow-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        حفظ الألوان والمقاس
                      </button>
                    </div>
                  </div>
                </div>

                {/* زر فتح مودال الترتيب والتخصيص */}
                <button
                  onClick={() => setIsMenuModalOpen(true)}
                  className="w-full bg-white border-2 border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm"
                >
                  <ListOrdered className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-black text-slate-800">
                    تخصيص الهيكلة والترتيب الشامل
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold mt-1">
                    تغيير اللوجو • إعادة تسمية الشاشات • ترتيب الأقسام والعناصر
                  </span>
                </button>
              </div>
            )}

            {/* ... Other Tabs omitted for brevity (Header, Footer, Server remain same) ... */}
          </div>
        </div>
      </div>

      {/* ════════════ مودال الترتيب المتقدم ═══════════ */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMenuModalOpen(false)}
          />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-gradient-to-l from-blue-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                  <ListOrdered className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-black text-slate-800">
                    تخصيص هيكل النظام
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500">
                    غيّر الأسماء، رتّب الأقسام والشاشات، وارفع الشعار
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-xl"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar-slim bg-slate-50">
              {/* قسم الشعار */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" /> الشعار (Logo)
                </h3>
                <div className="flex items-center gap-6">
                  <img
                    src={modalSidebarData.logoUrl}
                    alt="Logo"
                    className="h-20 w-20 rounded-xl object-contain border border-slate-200 bg-slate-50 p-2"
                  />
                  <div>
                    <label className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-100 text-xs flex items-center gap-2 w-fit">
                      <Upload size={14} /> رفع شعار جديد
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* قسم الأقسام والشاشات */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                <h3 className="font-black text-slate-800 mb-4 text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 text-blue-600" /> ترتيب
                    الأقسام والشاشات
                  </span>
                </h3>

                <div className="space-y-4">
                  {sortedCategories.map((category, catIndex) => (
                    <div
                      key={category.id}
                      className="border-2 border-slate-100 rounded-xl p-4 bg-slate-50/30"
                    >
                      {/* رأس القسم */}
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={() => moveCategory(category.id, "up")}
                            disabled={catIndex === 0}
                            className="text-slate-400 hover:text-blue-600 disabled:opacity-20 bg-white border border-slate-200 rounded p-0.5"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => moveCategory(category.id, "down")}
                            disabled={catIndex === sortedCategories.length - 1}
                            className="text-slate-400 hover:text-blue-600 disabled:opacity-20 bg-white border border-slate-200 rounded p-0.5"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                        <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                          <category.icon size={16} className="text-slate-700" />
                        </div>
                        <div className="flex-1 max-w-sm">
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
                            className="font-black text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                          />
                        </div>
                      </div>

                      {/* الشاشات الفرعية (مربعات داخل القسم) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pr-2">
                        {getSortedItems(category).map(
                          (item, itemIndex, arr) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm hover:border-blue-300 transition-colors group"
                            >
                              {/* أزرار ترتيب الشاشة */}
                              <div className="flex flex-col gap-0 opacity-40 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    moveItem(category.id, item.id, "up")
                                  }
                                  disabled={itemIndex === 0}
                                  className="text-slate-500 hover:text-blue-600 disabled:opacity-20"
                                >
                                  <ChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() =>
                                    moveItem(category.id, item.id, "down")
                                  }
                                  disabled={itemIndex === arr.length - 1}
                                  className="text-slate-500 hover:text-blue-600 disabled:opacity-20"
                                >
                                  <ChevronDown size={14} />
                                </button>
                              </div>

                              <Edit2
                                size={12}
                                className="text-slate-400 shrink-0 mx-1"
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
                                className="text-xs font-bold text-slate-700 w-full focus:outline-none bg-transparent border-b border-transparent focus:border-blue-400"
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
              <button
                onClick={() => setIsMenuModalOpen(false)}
                className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200"
              >
                إلغاء
              </button>
              <button
                onClick={saveMenuModalChanges}
                disabled={isMenuSaving}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
              >
                {isMenuSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                حفظ التعديلات الشاملة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
