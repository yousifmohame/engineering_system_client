import React, { useState, useMemo } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { clsx } from "clsx";
import AccessControl from "../../AccessControl";
import { useAuth } from "../../../context/AuthContext";
import { usePermissionBuilder } from "../../../context/PermissionBuilderContext";
import { DEFAULT_MENU_CATEGORIES } from "../../../constants/menuConstants"; // 💡 استيراد

import {
  LayoutDashboard,
  Users,
  FileText,
  FolderOpen,
  BrainCircuit,
  Wallet,
  Building2,
  Handshake,
  UserCog,
  Map as MapIcon,
  BarChart3,
  ScrollText,
  Cpu,
  Laptop,
  Award,
  Globe,
  Settings,
  FileSliders,
  Sliders,
  Zap,
  Search,
  Star,
  MessageCircle,
} from "lucide-react";

const formatScreenId = (id) => {
  if (isNaN(id)) return id;
  return id.padStart(3, "0");
};

const Sidebar = () => {
  // 💡 إضافة: جلب sidebarConfig من الـ Store
  const { activeScreenId, openScreen, sidebarConfig } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [openCategories, setOpenCategories] = useState([
    "CAT_DASHBOARD",
    "CAT_TRANSACTIONS",
    "CAT_CLIENTS",
  ]);

  const { user } = useAuth();
  const { isBuildMode } = usePermissionBuilder();
  const userPermissions = user?.permissions || [];
  const isSuperAdmin = user?.email === "admin@wms.com";

  // 💡 إعداد المتغيرات الديناميكية للمظهر مع قيم افتراضية مطابقة لتصميمك الأصلي
  const sbWidth = sidebarConfig?.width || 280;
  const sbBgColor = sidebarConfig?.bgColor || "#293241";
  const sbTextColor = sidebarConfig?.textColor || "#cbd5e1"; // slate-300
  const sbActiveColor = sidebarConfig?.activeColor || "#2563eb"; // blue-600

  const logoUrl = sidebarConfig?.logoUrl || "/logo.jpeg";
  const customLabels = sidebarConfig?.customLabels || {};
  const categoryOrder = sidebarConfig?.categoryOrder || [];

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const filteredCategories = useMemo(() => {
    // 1. إنشاء نسخة من المصفوفة مع تطبيق الأسماء المخصصة (Custom Labels)
    let processedCategories = DEFAULT_MENU_CATEGORIES.map((category) => ({
      ...category,
      title: customLabels[category.id] || category.title,
      items: category.items.map((item) => ({
        ...item,
        label: customLabels[item.id] || item.label, // تطبيق الاسم المخصص للشاشة إن وجد
      })),
    }));

    // 2. تطبيق الترتيب المخصص (Sorting)
    if (categoryOrder.length > 0) {
      processedCategories.sort((a, b) => {
        let indexA = categoryOrder.indexOf(a.id);
        let indexB = categoryOrder.indexOf(b.id);
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;
        return indexA - indexB;
      });
    }

    // 3. الفلترة حسب الصلاحيات والبحث
    return processedCategories
      .map((category) => {
        let filteredItems = category.items.filter((item) => {
          const hasAccess =
            isSuperAdmin || isBuildMode || userPermissions.includes(item.code);
          return hasAccess;
        });

        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          filteredItems = filteredItems.filter(
            (item) =>
              item.label.toLowerCase().includes(query) ||
              formatScreenId(item.id).includes(query),
          );
        }
        return { ...category, items: filteredItems };
      })
      .filter((category) => category.items.length > 0);
  }, [
    searchQuery,
    isSuperAdmin,
    isBuildMode,
    userPermissions,
    customLabels,
    categoryOrder,
  ]);

  return (
    <aside
      style={{
        width: `${sbWidth}px`,
        backgroundColor: sbBgColor,
        color: sbTextColor,
      }}
      className="flex flex-col h-screen fixed right-0 top-0 z-40 shadow-[0_0_20px_rgba(0,0,0,0.3)] direction-rtl border-l border-white/5 transition-all duration-300"
    >
      {/* 1. الشعار الديناميكي */}
      <div className="px-8 pt-4">
        <div
          style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
          className="h-[72px] rounded-lg border-b border-white/5 overflow-hidden flex items-center justify-center p-1"
        >
          <img
            src={logoUrl} // 💡 الشعار المخصص
            alt="Company Logo"
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* 2. شريط البحث المدمج */}
      <div className="p-3 border-b border-white/5 shrink-0 mt-4">
        <div className="relative">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
            style={{ color: sbTextColor }}
          />
          <input
            type="text"
            placeholder="بحث في الشاشات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              backgroundColor: "rgba(0,0,0,0.2)", // لون أغمق للبحث
              color: sbTextColor,
            }}
            className="w-full border border-white/10 text-[11px] rounded-lg py-2 pr-9 pl-3 focus:outline-none focus:border-white/30 transition-colors placeholder:opacity-50"
          />
        </div>
      </div>

      {/* 3. القائمة (Navigation) */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
        {filteredCategories.map((category) => {
          const isOpen = openCategories.includes(category.id);

          // تصميم خاص للقسم الرئيسي (لوحة التحكم)
          if (category.isMain) {
            return (
              <div key={category.id} className="mb-2">
                <div className="px-3 py-2 text-[10px] font-bold flex items-center justify-between opacity-70">
                  <span>الشاشة الحالية:</span>
                </div>
                <div className="space-y-0.5">
                  {category.items.map((item) => {
                    const isActive = activeScreenId === item.id;
                    return (
                      <AccessControl
                        key={item.id}
                        code={item.code}
                        name={item.label}
                        moduleName={category.title}
                        type="screen"
                      >
                        <button
                          onClick={() => openScreen(item.id, item.label)}
                          style={{
                            // 💡 تطبيق لون الـ Active برمجياً
                            backgroundColor: isActive
                              ? sbActiveColor
                              : "transparent",
                            color: isActive ? "#ffffff" : sbTextColor,
                          }}
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-right",
                            isActive
                              ? "font-bold shadow-md"
                              : "hover:bg-white/5 opacity-90 hover:opacity-100",
                          )}
                        >
                          <span className="text-[13px]">{item.label}</span>
                          <span
                            style={{
                              backgroundColor: isActive
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.3)",
                            }}
                            className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold"
                          >
                            {formatScreenId(item.id)}
                          </span>
                        </button>
                      </AccessControl>
                    );
                  })}
                </div>
              </div>
            );
          }

          // تصميم باقي الأقسام
          return (
            <div
              key={category.id}
              className="mb-1 border-b border-white/5 pb-1"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                style={{
                  color: isOpen ? sbActiveColor : sbTextColor,
                }}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group text-right",
                  !isOpen && "hover:bg-white/5 opacity-90 hover:opacity-100",
                )}
              >
                <div className="flex items-center gap-2">
                  <category.icon size={16} />
                  <span className="font-bold text-[13px]">
                    {category.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
                    className="text-[10px] px-1.5 rounded font-bold opacity-80"
                  >
                    {category.items.length}
                  </span>
                </div>
              </button>

              <div
                className={clsx(
                  "overflow-hidden transition-all duration-200 ease-in-out",
                  isOpen ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
                )}
              >
                <div className="pr-1 py-1 space-y-0.5">
                  {category.items.map((item) => {
                    const isActive = activeScreenId === item.id;
                    return (
                      <AccessControl
                        key={item.id}
                        code={item.code}
                        name={item.label}
                        moduleName={category.title}
                        type="screen"
                      >
                        <button
                          onClick={() => openScreen(item.id, item.label)}
                          style={{
                            // 💡 تطبيق الألوان الفرعية
                            backgroundColor: isActive
                              ? sbActiveColor
                              : "transparent",
                            color: isActive ? "#ffffff" : sbTextColor,
                          }}
                          className={clsx(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group text-right",
                            isActive
                              ? "shadow-sm"
                              : "hover:bg-white/10 opacity-80 hover:opacity-100",
                          )}
                        >
                          <div className="flex items-center gap-1.5 shrink-0 w-8 justify-center">
                            {item.isFavorite ? (
                              <Star
                                size={12}
                                className="fill-yellow-500 text-yellow-500"
                              />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                            )}
                            <div
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full bg-emerald-500",
                                isActive && "shadow-[0_0_5px_#10b981]",
                              )}
                            />
                          </div>

                          <span
                            className={clsx(
                              "text-[12px] flex-1",
                              isActive && "font-bold",
                            )}
                          >
                            {item.label}
                          </span>

                          <span
                            style={{
                              backgroundColor: isActive
                                ? "rgba(255,255,255,0.2)"
                                : "rgba(0,0,0,0.3)",
                            }}
                            className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 border border-white/5"
                          >
                            {formatScreenId(item.id)}
                          </span>
                        </button>
                      </AccessControl>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* 4. الفوتر */}
      <div
        style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
        className="p-3 border-t border-white/5 text-center shrink-0"
      >
        <div className="text-[9px] opacity-50 font-mono tracking-wider">
          Master List v2.0 | WMS System
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
