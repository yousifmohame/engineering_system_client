import React from "react";
import { useAppStore } from "../../../stores/useAppStore";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Briefcase,
  Building2,
  FileCheck,
  Map as MapIcon,
  UserCog,
  ShieldCheck,
  FileSignature, 
} from "lucide-react";
import { clsx } from "clsx";
import AccessControl from "../../AccessControl"; // 👈 1. استيراد مكون الصلاحيات

// 👈 2. إضافة أكواد الصلاحيات (code) وأسمائها (permName) لكل شاشة
const MENU_ITEMS = [
  // { id: "DASH", label: "لوحة التحكم", icon: LayoutDashboard },
  // { id: "055", label: "المعاملات", icon: FileText },
  { id: "310", label: "ملفات الملكية", icon: ShieldCheck, code: "SCREEN_310_VIEW", permName: "رؤية شاشة ملفات الملكية" }, 
  { id: "300", label: "العملاء", icon: Users, code: "SCREEN_300_VIEW", permName: "رؤية شاشة العملاء" },
  { id: "815", label: "عروض الأسعار", icon: FileSignature, code: "SCREEN_815_VIEW", permName: "رؤية شاشة عروض الأسعار" }, 
  { id: "817", label: "إدارة الموظفين", icon: UserCog, code: "SCREEN_817_VIEW", permName: "رؤية شاشة إدارة الموظفين" },
  // { id: "937", label: "إدارة المعقبين", icon: Users },
  // { id: "939", label: "شوارع الرياض", icon: MapIcon },
  // { id: "285", label: "المشاريع", icon: Briefcase },
  // { id: "FIN", label: "المالية", icon: FileCheck },
  // { id: "942", label: "إدارة المستندات والقوالب", icon: Settings },
  
  { id: "SET", label: "الإعدادات", icon: Settings, code: "SCREEN_SET_VIEW", permName: "رؤية شاشة الإعدادات" },
];

const Sidebar = () => {
  const { activeScreenId, openScreen } = useAppStore();

  return (
    <aside className="w-[260px] bg-slate-900 text-white flex flex-col h-screen fixed right-0 top-0 z-40 shadow-2xl direction-rtl border-l border-slate-800">
      {/* 1. الشعار (Header) */}
      <div className="h-[60px] flex items-center justify-center border-b border-slate-800 bg-slate-950 shadow-sm">
        <div className="flex items-center gap-3 font-bold text-lg tracking-wide text-slate-100">
          <div className="p-1.5 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span>النظام الهندسي</span>
        </div>
      </div>

      {/* 2. القائمة (Navigation) */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreenId === item.id;

          return (
            /* 👈 3. تغليف الزر بمكون AccessControl 
               لن يظهر الزر في الوضع الطبيعي إلا لمن يمتلك الصلاحية، 
               وفي وضع البناء سيتمكن المدير من النقر عليه لتسجيل الصلاحية */
            <AccessControl 
              key={item.id}
              code={item.code} 
              name={item.permName} 
              moduleName="القائمة الجانبية"
              type="screen"
            >
              <button
                onClick={() => openScreen(item.id)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group text-right relative overflow-hidden",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100",
                )}
              >
                {/* Active Indicator Line */}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l" />
                )}

                <Icon
                  size={20}
                  className={clsx(
                    "transition-colors",
                    isActive
                      ? "text-white"
                      : "text-slate-500 group-hover:text-blue-400",
                  )}
                />

                <span className="font-medium text-sm flex-1">{item.label}</span>

                {/* مؤشر بسيط للنشط */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 shadow-sm" />
                )}
              </button>
            </AccessControl>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;