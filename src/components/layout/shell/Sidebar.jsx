import React, { useState, useMemo } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { clsx } from "clsx";
import AccessControl from "../../AccessControl";
import { useAuth } from "../../../context/AuthContext";
import { usePermissionBuilder } from "../../../context/PermissionBuilderContext";

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
  ChevronDown,
  CircleDot,
  Search,
  Star,
  MessageCircle,
} from "lucide-react";

// ==========================================
// الهيكل الشامل للنظام (مرتب حسب الأولوية)
// ==========================================
const MENU_CATEGORIES = [
  {
    id: "CAT_DASHBOARD",
    title: "الشاشة الحالية: الرئيسية", // تغيير العنوان ليتوافق مع التصميم
    icon: LayoutDashboard,
    isMain: true, // علامة لتمييز القسم الأول
    items: [
      { id: "01", label: "لوحة التحكم الرئيسية", code: "SCR_01_VIEW" },
      { id: "02", label: "التنبيهات", code: "SCR_02_VIEW" },
      { id: "109", label: "الروابط السريعه", code: "SCR_109_VIEW" },
      { id: "03", label: "المهام", code: "SCR_03_VIEW" },
      { id: "030", label: "مفكره المكتب", code: "SCR_030_VIEW" },
      { id: "04", label: "الإحصائيات السريعة", code: "SCR_04_VIEW" },
    ],
  },
  {
    id: "CAT_TRANSACTIONS",
    title: "إدارة المعاملات",
    icon: FileText,
    items: [
      { id: "10", label: "المعاملات", code: "SCR_10_VIEW", isFavorite: true },
      {
        id: "815",
        label: "عروض الأسعار",
        code: "SCREEN_815_VIEW",
        isFavorite: true,
      },
      {
        id: "11",
        label: "ويزرد إنشاء معاملة",
        code: "SCR_11_VIEW",
        isFavorite: true,
      },
      {
        id: "12",
        label: "متابعة المعاملات",
        code: "SCR_12_VIEW",
        isFavorite: true,
      },
      {
        id: "13",
        label: "سجل حالات المعاملات",
        code: "SCR_13_VIEW",
        isFavorite: true,
      },
      { id: "14", label: "أنواع المعاملات", code: "SCR_14_VIEW" },
      { id: "15", label: "إعدادات المعاملات", code: "SCR_15_VIEW" },
    ],
  },
  {
    id: "CAT_CLIENTS",
    title: "العملاء والملكية",
    icon: Users,
    items: [
      { id: "300", label: "العملاء", code: "SCREEN_300_VIEW" },
      { id: "310", label: "ملفات الملكية", code: "SCREEN_310_VIEW" },
      { id: "07", label: "الصكوك", code: "SCR_07_VIEW" },
      { id: "222", label: "تعاقدات العملاء", code: "SCR_222_VIEW" },
      { id: "08", label: "الهويات", code: "SCR_08_VIEW" },
      { id: "09", label: "سجلات الرخص الخارجية", code: "SCR_09_VIEW" },
      { id: "0010", label: "سجلات رخص مكتبنا", code: "SCR_0010_VIEW" },
      {
        id: "112",
        label: "اشتراطات و أدلة و تعاميم و عروض",
        code: "SCR_112_VIEW",
      },
    ],
  },
  {
    id: "CAT_DOCS",
    title: "المستندات",
    icon: FolderOpen,
    items: [
      { id: "16", label: "مركز المستندات", code: "SCR_16_VIEW" },
      { id: "17", label: "أنواع المستندات", code: "SCR_17_VIEW" },
      { id: "170", label: "العقود", code: "SCR_170_VIEW" },
      { id: "18", label: "نماذج الجهات الرسمية", code: "SCR_18_VIEW" },
      { id: "19", label: "مركز تجهيز الملفات", code: "SCR_19_VIEW" },
      { id: "20", label: "مركز استقبال الملفات", code: "SCR_20_VIEW" },
      { id: "21", label: "الملفات المؤرشفة", code: "SCR_21_VIEW" },
      { id: "90", label: "أرشيف المخططات", code: "SCR_90_VIEW" },
      { id: "91", label: "أدلة واشتراطات وتعاميم", code: "SCR_91_VIEW" },
    ],
  },
  {
    id: "CAT_FINANCE",
    title: "العمليات المالية",
    icon: Wallet,
    items: [
      { id: "23", label: "المالية (الشاشة الموحدة)", code: "SCR_23_VIEW" },
      { id: "24", label: "الفواتير", code: "SCR_24_VIEW" },
      { id: "25", label: "التسويات", code: "SCR_25_VIEW" },
      { id: "26", label: "إعدادات المالية", code: "SCR_26_VIEW" },
      { id: "27", label: "الحسابات المرتبطة", code: "SCR_27_VIEW" },
      { id: "28", label: "الإيرادات والمصروفات", code: "SCR_28_VIEW" },
    ],
  },
  {
    id: "CAT_HR_TOOLS",
    title: "الموارد البشرية",
    icon: Zap,
    items: [{ id: "88", label: "إدارة الموارد البشرية", code: "SCR_88_VIEW" }],
  },
  {
    id: "EMAIL_SETTINGS",
    title: "الايميل و الرسائل",
    icon: MessageCircle,
    items: [
      { id: "98", label: "مركز الإشعارات", code: "SCR_98_VIEW" },
      { id: "99", label: "الصادر و الوارد", code: "SCR_99_VIEW" },
      { id: "100", label: "مركز طلب و إرسال الوثائق", code: "SCR_100_VIEW" },
      { id: "101", label: "اعدادات الايميل", code: "SCR_101_VIEW" },
    ],
  },
  {
    id: "CAT_AI_ANALYTICS",
    title: "تحليلات الذكاء الصناعي",
    icon: BrainCircuit,
    items: [{ id: "22", label: "تحليلات AI الشاملة", code: "SCR_22_VIEW" }],
  },
  {
    id: "CAT_ACCOUNTING_PORTAL",
    title: "بوابة المحاسبة",
    icon: Building2,
    items: [{ id: "29", label: "بوابة شركة المحاسبة", code: "SCR_29_VIEW" }],
  },
  {
    id: "CAT_BROKERS",
    title: "الوسطاء والشركاء",
    icon: Handshake,
    items: [
      { id: "30", label: "الوسطاء", code: "SCR_30_VIEW" },
      { id: "31", label: "المكاتب الوسيطة", code: "SCR_31_VIEW" },
      { id: "32", label: "الشركاء", code: "SCR_32_VIEW" },
      { id: "33", label: "اتفاقيات الشراكة", code: "SCR_33_VIEW" },
    ],
  },
  {
    id: "CAT_HR",
    title: "الموظفين",
    icon: UserCog,
    items: [
      { id: "817", label: "سجل الموظفين والأدوار", code: "SCREEN_817_VIEW" },
      { id: "35", label: "الحضور والانصراف", code: "SCR_35_VIEW" },
      { id: "36", label: "تسويات الموظفين", code: "SCR_36_VIEW" },
      { id: "37", label: "الموظفون عن بعد", code: "SCR_37_VIEW" },
    ],
  },
  {
    id: "CAT_RIYADH",
    title: "تقسيم مدينة الرياض",
    icon: MapIcon,
    items: [
      { id: "39", label: "تقسيم الرياض", code: "SCR_39_VIEW" },
      { id: "40", label: "القطاعات", code: "SCR_40_VIEW" },
      { id: "41", label: "الأحياء", code: "SCR_41_VIEW" },
    ],
  },
  {
    id: "CAT_REPORTS",
    title: "التقارير",
    icon: BarChart3,
    items: [
      { id: "42", label: "التقارير العامة", code: "SCR_42_VIEW" },
      { id: "43", label: "تقارير المعاملات", code: "SCR_43_VIEW" },
      { id: "44", label: "تقارير المالية", code: "SCR_44_VIEW" },
      { id: "45", label: "تقارير الموظفين", code: "SCR_45_VIEW" },
      { id: "46", label: "تقارير العملاء", code: "SCR_46_VIEW" },
      { id: "47", label: "تقارير المستندات", code: "SCR_47_VIEW" },
    ],
  },
  {
    id: "CAT_LOGS",
    title: "سجلات النظام",
    icon: ScrollText,
    items: [
      { id: "48", label: "سجلات النظام الشاملة", code: "SCR_48_VIEW" },
      { id: "49", label: "سجل الجلسات", code: "SCR_49_VIEW" },
      { id: "50", label: "سجل العمليات", code: "SCR_50_VIEW" },
      { id: "51", label: "سجل الطباعة", code: "SCR_51_VIEW" },
      { id: "52", label: "سجل الذكاء الصناعي", code: "SCR_52_VIEW" },
    ],
  },
  {
    id: "CAT_AI_MGMT",
    title: "إدارة الذكاء الصناعي",
    icon: Cpu,
    items: [
      { id: "53", label: "إدارة الذكاء الصناعي", code: "SCR_53_VIEW" },
      { id: "54", label: "مزودات AI", code: "SCR_54_VIEW" },
      { id: "55", label: "استهلاك التوكن", code: "SCR_55_VIEW" },
      { id: "57", label: "سياسات AI", code: "SCR_57_VIEW" },
    ],
  },
  {
    id: "CAT_ASSETS",
    title: "أصول المكتب",
    icon: Laptop,
    items: [
      { id: "58", label: "أصول المكتب", code: "SCR_58_VIEW" },
      { id: "59", label: "الأجهزة", code: "SCR_59_VIEW" },
      { id: "60", label: "البرمجيات", code: "SCR_60_VIEW" },
      { id: "61", label: "التراخيص", code: "SCR_61_VIEW" },
      { id: "62", label: "فواتير الأصول", code: "SCR_62_VIEW" },
      { id: "63", label: "تنبيهات الأصول", code: "SCR_63_VIEW" },
    ],
  },
  {
    id: "CAT_QUALIFICATION",
    title: "تأهيل المكتب",
    icon: Award,
    items: [
      { id: "64", label: "التأهيل لدى الجهات", code: "SCR_64_VIEW" },
      { id: "65", label: "الجهات الحكومية", code: "SCR_65_VIEW" },
      { id: "66", label: "ملفات التأهيل", code: "SCR_66_VIEW" },
    ],
  },
  {
    id: "CAT_WEBSITE",
    title: "الموقع الإلكتروني",
    icon: Globe,
    items: [
      { id: "67", label: "إدارة الموقع", code: "SCR_67_VIEW" },
      { id: "68", label: "حقن بيانات الموقع", code: "SCR_68_VIEW" },
      { id: "69", label: "إحصائيات الموقع", code: "SCR_69_VIEW" },
      { id: "70", label: "خريطة المشاريع", code: "SCR_70_VIEW" },
    ],
  },
  {
    id: "CAT_SYS_SETTINGS",
    title: "إدارة النظام",
    icon: Settings,
    items: [
      { id: "71", label: "إعدادات النظام", code: "SCR_71_VIEW" },
      { id: "73", label: "النسخ الاحتياطي", code: "SCR_73_VIEW" },
      { id: "74", label: "مراقبة الموارد", code: "SCR_74_VIEW" },
    ],
  },
  {
    id: "CAT_REPORT_SETTINGS",
    title: "إعدادات التقارير",
    icon: FileSliders,
    items: [
      { id: "76", label: "ترميز التقارير", code: "SCR_76_VIEW" },
      { id: "77", label: "تكويد التقارير", code: "SCR_77_VIEW" },
      { id: "78", label: "التوقيع الرقمي", code: "SCR_78_VIEW" },
      { id: "79", label: "تشفير التقارير", code: "SCR_79_VIEW" },
    ],
  },
  {
    id: "CAT_GENERAL_SETTINGS",
    title: "الإعدادات العامة",
    icon: Sliders,
    items: [
      { id: "SET", label: "إعدادات عامة", code: "SCREEN_SET_VIEW" },
      { id: "83", label: "اعدادات Tailscale", code: "SCR_83_VIEW" },
    ],
  },
  {
    id: "CAT_QUICK_TOOLS",
    title: "أدوات المطور",
    icon: Zap,
    items: [
      { id: "84", label: "البحث الشامل", code: "SCR_84_VIEW" },
      { id: "85", label: "رفع ملفات سريع", code: "SCR_85_VIEW" },
      { id: "86", label: "إنشاء معاملة سريع", code: "SCR_86_VIEW" },
      { id: "87", label: "إنشاء عميل سريع", code: "SCR_87_VIEW" },
    ],
  },
];

// دالة مساعدة لتنسيق رقم الشاشة (دائماً 3 خانات)
const formatScreenId = (id) => {
  // إذا كان النص يحتوي على أحرف (مثل SET) نتركه كما هو، وإلا نكمله بالأصفار
  if (isNaN(id)) return id;
  return id.padStart(3, "0");
};

const Sidebar = () => {
  const { activeScreenId, openScreen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  // فتح لوحة التحكم والمعاملات والعملاء افتراضياً
  const [openCategories, setOpenCategories] = useState([
    "CAT_DASHBOARD",
    "CAT_TRANSACTIONS",
    "CAT_CLIENTS",
  ]);

  const { user } = useAuth();
  const { isBuildMode } = usePermissionBuilder();
  const userPermissions = user?.permissions || [];
  const isSuperAdmin = user?.email === "admin@wms.com";

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // معالجة البحث والفلترة مع الصلاحيات
  const filteredCategories = useMemo(() => {
    return MENU_CATEGORIES.map((category) => {
      // 1. تصفية الشاشات داخل الفئة بناءً على الصلاحيات أو وضع الإدمن
      let filteredItems = category.items.filter((item) => {
        const hasAccess =
          isSuperAdmin || isBuildMode || userPermissions.includes(item.code);
        return hasAccess;
      });

      // 2. تطبيق البحث إذا وجد
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        filteredItems = filteredItems.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            formatScreenId(item.id).includes(query),
        );
      }

      return { ...category, items: filteredItems };
    }).filter((category) => category.items.length > 0); // إخفاء الفئات الفارغة
  }, [searchQuery, isSuperAdmin, isBuildMode, userPermissions]);

  // فتح كل الفئات تلقائياً عند البحث
  React.useEffect(() => {
    if (searchQuery.trim() !== "") {
      setOpenCategories(MENU_CATEGORIES.map((c) => c.id));
    } else {
      setOpenCategories(["CAT_DASHBOARD", "CAT_TRANSACTIONS", "CAT_CLIENTS"]);
    }
  }, [searchQuery]);

  return (
    <aside className="w-[280px] bg-[#293241] text-slate-300 flex flex-col h-screen fixed right-0 top-0 z-40 shadow-[0_0_20px_rgba(0,0,0,0.3)] direction-rtl border-l border-slate-700/50">
      {/* 1. الشعار (Header) */}
      <div className="px-8 pt-4 ">
        <div className="h-[72px] rounded-lg border-b border-slate-700/50 bg-[#1e2532] shadow-sm shrink-0 flex items-center justify-center">
          <img
            src="/logo.jpeg"
            alt="Company Logo"
            className="h-full rounded-lg w-full object-cover opacity-90"
          />
        </div>
      </div>

      {/* 2. شريط البحث المدمج */}
      <div className="p-3 border-b border-slate-700/50 bg-[#293241] shrink-0">
        <div className="relative">
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            placeholder="بحث في الشاشات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1e2532] border border-slate-700 text-slate-200 text-[11px] rounded-lg py-2 pr-9 pl-3 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* 3. القائمة (Navigation) */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">
        {filteredCategories.map((category) => {
          const isOpen = openCategories.includes(category.id);
          const isCategoryActive = category.items.some(
            (item) => item.id === activeScreenId,
          );

          // تصميم خاص للقسم الرئيسي (لوحة التحكم)
          if (category.isMain) {
            return (
              <div key={category.id} className="mb-2">
                <div className="px-3 py-2 text-[10px] font-bold text-slate-500 flex items-center justify-between">
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
                          className={clsx(
                            "w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all text-right",
                            isActive
                              ? "bg-blue-600 text-white font-bold"
                              : "hover:bg-slate-700/50 text-slate-300",
                          )}
                        >
                          <span className="text-[13px]">{item.label}</span>
                          <span
                            className={clsx(
                              "text-[10px] px-1.5 py-0.5 rounded font-mono font-bold",
                              isActive
                                ? "bg-blue-500 text-white"
                                : "bg-slate-700 text-slate-400",
                            )}
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
              className="mb-1 border-b border-slate-700/30 pb-1"
            >
              <button
                onClick={() => toggleCategory(category.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group text-right",
                  isOpen
                    ? "text-blue-400"
                    : "hover:bg-slate-800/50 text-blue-500",
                )}
              >
                <div className="flex items-center gap-2">
                  <category.icon
                    size={16}
                    className={clsx(
                      "transition-colors",
                      isOpen ? "text-blue-400" : "text-blue-500",
                    )}
                  />
                  <span className="font-bold text-[13px]">
                    {category.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-slate-700/50 text-slate-400 text-[10px] px-1.5 rounded font-bold">
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
                          className={clsx(
                            "w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all group text-right",
                            isActive
                              ? "bg-slate-800 text-white"
                              : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200",
                          )}
                        >
                          {/* أيقونات الحالة (نجمة / نقطة) */}
                          <div className="flex items-center gap-1.5 shrink-0 w-8 justify-center">
                            {item.isFavorite ? (
                              <Star
                                size={12}
                                className={clsx(
                                  "fill-yellow-500 text-yellow-500",
                                )}
                              />
                            ) : (
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-400" />
                            )}
                            <div
                              className={clsx(
                                "w-1.5 h-1.5 rounded-full",
                                isActive
                                  ? "bg-emerald-500 shadow-[0_0_5px_#10b981]"
                                  : "bg-emerald-500",
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
                            className={clsx(
                              "text-[9px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0",
                              isActive
                                ? "bg-slate-700 text-slate-300"
                                : "bg-[#1e2532] text-slate-500 border border-slate-700/50",
                            )}
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
      <div className="p-3 border-t border-slate-700/50 bg-[#1e2532] text-center shrink-0">
        <div className="text-[9px] text-slate-500 font-mono tracking-wider">
          Master List v2.0 | WMS System
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
