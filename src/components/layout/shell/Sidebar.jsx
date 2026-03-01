import React, { useState } from "react";
import { useAppStore } from "../../../stores/useAppStore";
import { clsx } from "clsx";
import AccessControl from "../../AccessControl";
import { useAuth } from "../../../context/AuthContext"; // 👈 1. استيراد لمعرفة الصلاحيات والمستخدم
import { usePermissionBuilder } from "../../../context/PermissionBuilderContext"; // 👈 2. استيراد لمعرفة وضع البناء

import {
  LayoutDashboard, Users, FileText, FolderOpen, BrainCircuit,
  Wallet, Building2, Handshake, UserCog, Map as MapIcon,
  BarChart3, ScrollText, Cpu, Laptop, Award, Globe,
  Settings, FileSliders, Sliders, Zap, ChevronDown, CircleDot,
  ShieldCheck, FileSignature, AlertCircle, CheckSquare, Target
} from "lucide-react";

// ==========================================
// الهيكل الشامل للنظام (Master List v1.0)
// ==========================================
const MENU_CATEGORIES = [
  {
    id: "CAT_DASHBOARD",
    title: "لوحة التحكم",
    icon: LayoutDashboard,
    items: [
      { id: "01", label: "لوحة التحكم الرئيسية", code: "SCR_01_VIEW" },
      { id: "02", label: "التنبيهات", code: "SCR_02_VIEW" },
      { id: "03", label: "المهام", code: "SCR_03_VIEW" },
      { id: "04", label: "الإحصائيات السريعة", code: "SCR_04_VIEW" },
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
      { id: "08", label: "الهويات", code: "SCR_08_VIEW" },
      { id: "09", label: "الرخص", code: "SCR_09_VIEW" },
    ],
  },
  {
    id: "CAT_TRANSACTIONS",
    title: "المعاملات",
    icon: FileText,
    items: [
      { id: "10", label: "المعاملات", code: "SCR_10_VIEW" },
      { id: "815", label: "عروض الأسعار", code: "SCREEN_815_VIEW" },
      { id: "11", label: "ويزرد إنشاء معاملة", code: "SCR_11_VIEW" },
      { id: "12", label: "متابعة المعاملات", code: "SCR_12_VIEW" },
      { id: "13", label: "سجل حالات المعاملات", code: "SCR_13_VIEW" },
      { id: "14", label: "أنواع المعاملات", code: "SCR_14_VIEW" },
      { id: "15", label: "إعدادات المعاملات", code: "SCR_15_VIEW" },
    ],
  },
  {
    id: "CAT_DOCS",
    title: "المستندات",
    icon: FolderOpen,
    items: [
      { id: "16", label: "مركز المستندات", code: "SCR_16_VIEW" },
      { id: "17", label: "أنواع المستندات", code: "SCR_17_VIEW" },
      { id: "18", label: "نماذج الجهات الرسمية", code: "SCR_18_VIEW" },
      { id: "19", label: "مركز تجهيز الملفات", code: "SCR_19_VIEW" },
      { id: "20", label: "مركز استقبال الملفات", code: "SCR_20_VIEW" },
      { id: "21", label: "الملفات المؤرشفة", code: "SCR_21_VIEW" },
    ],
  },
  {
    id: "CAT_AI_ANALYTICS",
    title: "تحليلات الذكاء الصناعي",
    icon: BrainCircuit,
    items: [
      { id: "22", label: "تحليلات AI الشاملة", code: "SCR_22_VIEW" },
    ],
  },
  {
    id: "CAT_FINANCE",
    title: "المالية والمحاسبة",
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
    id: "CAT_ACCOUNTING_PORTAL",
    title: "بوابة المحاسبة",
    icon: Building2,
    items: [
      { id: "29", label: "بوابة شركة المحاسبة", code: "SCR_29_VIEW" },
    ],
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
    title: "إعدادات النظام",
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
      { id: "83", label: "السياسات", code: "SCR_83_VIEW" },
    ],
  },
  {
    id: "CAT_QUICK_TOOLS",
    title: "أدوات سريعة",
    icon: Zap,
    items: [
      { id: "84", label: "البحث الشامل", code: "SCR_84_VIEW" },
      { id: "85", label: "رفع ملفات سريع", code: "SCR_85_VIEW" },
      { id: "86", label: "إنشاء معاملة سريع", code: "SCR_86_VIEW" },
      { id: "87", label: "إنشاء عميل سريع", code: "SCR_87_VIEW" },
    ],
  },
];

const Sidebar = () => {
  const { activeScreenId, openScreen } = useAppStore();
  const [openCategories, setOpenCategories] = useState(["CAT_CLIENTS", "CAT_TRANSACTIONS", "CAT_HR"]);

  // 👈 3. جلب بيانات المستخدم وصلاحياته ووضع البناء
  const { user } = useAuth();
  const { isBuildMode } = usePermissionBuilder();
  const userPermissions = user?.permissions || [];
  
  // نفترض أن المدير العام (position: 'مدير عام') يرى كل شيء دائماً
  // 👈 الحل الآمن: الاعتماد على إيميل مالك النظام بدلاً من المسمى الوظيفي
  const isSuperAdmin = user?.email === "admin@wms.com"; // ⚠️ ضع إيميلك الحقيقي هنا

  const toggleCategory = (categoryId) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // 👈 4. فلترة الفئات الرئيسية ديناميكياً
  const visibleCategories = MENU_CATEGORIES.filter((category) => {
    // إظهار الفئة دائماً للمدير أو في وضع البناء
    if (isSuperAdmin || isBuildMode) return true;

    // الفئة تظهر فقط إذا كان المستخدم يملك صلاحية لشاشة واحدة على الأقل بداخلها
    return category.items.some((item) => userPermissions.includes(item.code));
  });

  return (
    <aside className="w-[280px] bg-slate-900 text-white flex flex-col h-screen fixed right-0 top-0 z-40 shadow-2xl direction-rtl border-l border-slate-800">
      {/* 1. الشعار (Header) */}
      <div className="h-[60px] flex items-center justify-center border-b border-slate-800 bg-slate-950 shadow-sm shrink-0">
        <div className="flex items-center gap-3 font-bold text-lg tracking-wide text-slate-100">
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span>النظام الهندسي ERP</span>
        </div>
      </div>

      {/* 2. القائمة (Navigation) */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-2 custom-scrollbar">
        {visibleCategories.map((category) => {
          const CategoryIcon = category.icon;
          const isOpen = openCategories.includes(category.id);
          
          const isCategoryActive = category.items.some(item => item.id === activeScreenId);

          return (
            <div key={category.id} className="flex flex-col">
              {/* زر القسم الرئيسي */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={clsx(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group text-right",
                  isOpen ? "bg-slate-800/50" : "hover:bg-slate-800/50",
                  isCategoryActive && !isOpen ? "border-r-2 border-blue-500" : "border-r-2 border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <CategoryIcon
                    size={18}
                    className={clsx(
                      "transition-colors",
                      isCategoryActive ? "text-blue-400" : "text-slate-400 group-hover:text-blue-300"
                    )}
                  />
                  <span className={clsx("font-bold text-sm", isCategoryActive ? "text-slate-100" : "text-slate-300")}>
                    {category.title}
                  </span>
                </div>
                <ChevronDown
                  size={14}
                  className={clsx(
                    "text-slate-500 transition-transform duration-300",
                    isOpen ? "rotate-180" : ""
                  )}
                />
              </button>

              {/* الشاشات الفرعية داخل القسم */}
              <div
                className={clsx(
                  "overflow-hidden transition-all duration-300 ease-in-out",
                  isOpen ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
                )}
              >
                <div className="pr-8 pl-2 py-1 space-y-1 border-r border-slate-700/50 mr-4">
                  {category.items.map((item) => {
                    const isActive = activeScreenId === item.id;

                    return (
                      <AccessControl
                        key={item.id}
                        code={item.code}
                        name={`رؤية شاشة: ${item.label}`}
                        moduleName={category.title}
                        type="screen"
                      >
                        <button
                          onClick={() => openScreen(item.id, item.label)}
                          className={clsx(
                            "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all duration-200 group text-right relative",
                            isActive
                              ? "bg-blue-600/10 text-blue-400 font-bold"
                              : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-200"
                          )}
                        >
                          {isActive ? (
                            <CircleDot size={12} className="text-blue-500" />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-400" />
                          )}
                          <span className="text-[13px] flex-1">{item.label}</span>
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
      
      {/* الفوتر الخاص بالقائمة */}
      <div className="p-4 border-t border-slate-800 bg-slate-950 text-center">
        <div className="text-[10px] text-slate-500 font-mono">Master List v1.0</div>
      </div>
    </aside>
  );
};

export default Sidebar;