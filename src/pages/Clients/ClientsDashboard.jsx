import React from "react";
import {
  Users,
  Plus,
  Search,
  RefreshCw,
  Grid3x3,
  UserPlus,
  BookUser,
  Star,
  FileCheck,
  MapPin,
  Receipt,
  UsersRound,
  FileText,
  BarChart3,
  History,
  Archive,
} from "lucide-react";
import { toast } from "sonner"; // 👈 تأكد من وجود هذا الاستيراد للتنبيهات

const CLIENT_TOOLS = [
  {
    id: "A01",
    title: "إنشاء عميل",
    icon: UserPlus,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    badge: null,
  },
  {
    id: "B01",
    title: "دليل العملاء",
    icon: BookUser,
    color: "text-blue-500",
    bg: "bg-blue-50",
    badge: 12,
  },
  {
    id: "C01",
    title: "تقييمات وتصنيفات",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-50",
    badge: null,
    target: "CLIENTS_RATINGS", // 👈 تمت إضافته
  },
  {
    id: "D01",
    title: "وثائق العملاء",
    icon: FileCheck,
    color: "text-purple-500",
    bg: "bg-purple-50",
    badge: 3,
    target: "CLIENTS_DOCS", // 👈 تمت إضافته
  },
  {
    id: "E01",
    title: "العنوان الوطني",
    icon: MapPin,
    color: "text-cyan-500",
    bg: "bg-cyan-50",
    badge: null,
  },
  {
    id: "F01",
    title: "الزكاة والضريبة",
    icon: Receipt,
    color: "text-red-500",
    bg: "bg-red-50",
    badge: 2,
  },
  {
    id: "G01",
    title: "وكلاء ومفوضون",
    icon: UsersRound,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    badge: null,
  },
  {
    id: "H01",
    title: "معاملات العميل",
    icon: FileText,
    color: "text-teal-500",
    bg: "bg-teal-50",
    badge: null,
  },
  {
    id: "I01",
    title: "السجل المالي",
    icon: BarChart3,
    color: "text-orange-500",
    bg: "bg-orange-50",
    badge: null,
  },
  {
    id: "J01",
    title: "تقارير العملاء",
    icon: BarChart3,
    color: "text-lime-500",
    bg: "bg-lime-50",
    badge: null,
  },
  {
    id: "K01",
    title: "سجل التدقيق",
    icon: History,
    color: "text-slate-500",
    bg: "bg-slate-100",
    badge: null,
  },
  {
    id: "L01",
    title: "سلة مؤقتة",
    icon: Archive,
    color: "text-slate-400",
    bg: "bg-slate-100",
    badge: null,
  },
  {
    id: "M01",
    title: "التزامات الأمانة",
    icon: Receipt,
    color: "text-orange-600",
    bg: "bg-orange-50",
    badge: null,
  },
];

const ClientsDashboard = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-full bg-slate-50" dir="rtl">
      {/* المنطقة العلوية الثابتة (Header) */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-black text-slate-800 m-0">
                  ملفات العملاء
                </h1>
                <span className="px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[11px] font-bold">
                  066
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                إدارة ملفات العملاء وربطها ثنائيًا بالمعاملات والمستندات
              </p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* الإحصائيات السريعة */}
            <div className="flex gap-2">
              <div className="text-center px-4 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="text-lg font-black text-blue-600 leading-none mb-1">
                  12
                </div>
                <div className="text-[10px] font-bold text-slate-500">
                  إجمالي العملاء
                </div>
              </div>
              <div className="text-center px-4 py-1.5 bg-amber-50 rounded-lg border border-amber-200">
                <div className="text-lg font-black text-amber-600 leading-none mb-1">
                  1
                </div>
                <div className="text-[10px] font-bold text-amber-700">
                  متعثرين
                </div>
              </div>
              <div className="text-center px-4 py-1.5 bg-red-50 rounded-lg border border-red-200">
                <div className="text-lg font-black text-red-600 leading-none mb-1">
                  2
                </div>
                <div className="text-[10px] font-bold text-red-700">
                  وثائق ناقصة
                </div>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

            {/* الأزرار والإجراءات */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate && onNavigate("NEW_CLIENT_TAB")}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" /> إضافة عميل جديد
              </button>
              <button className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm">
                <Search className="w-4 h-4" />
              </button>
              <button className="p-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-600 transition-colors shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* منطقة المحتوى (الشبكة / Grid) */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50/50 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-black text-slate-800 m-0 flex items-center gap-2">
              <Grid3x3 className="w-5 h-5 text-slate-400" />
              أدوات إدارة العملاء
            </h2>
            <button className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">
              تخصيص الواجهة
            </button>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-5">
            {CLIENT_TOOLS.map((tool, idx) => (
              <div
                key={idx}
                onClick={() => {
                  // 👇 هنا التعديل الأهم لدعم فتح التابات الديناميكية
                  if (!onNavigate) return;

                  if (tool.id === "A01") {
                    onNavigate("NEW_CLIENT_TAB");
                  } else if (tool.id === "B01") {
                    onNavigate("300-MAIN");
                  } else if (tool.target) {
                    onNavigate(tool.target); // 👈 يفتح التاب المربوط بالـ target
                  } else {
                    toast.info("قريباً - جاري العمل على هذه الشاشة", {
                      position: "top-center",
                    });
                  }
                }}
                className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-blue-400 cursor-pointer transition-all duration-300 relative shadow-sm hover:shadow-lg hover:-translate-y-1 group flex flex-col items-center text-center"
              >
                {tool.badge && (
                  <div className="absolute top-3 left-3 min-w-[24px] h-6 px-1.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm z-10">
                    {tool.badge}
                  </div>
                )}

                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${tool.bg} ${tool.color}`}
                >
                  <tool.icon className="w-8 h-8" />
                </div>

                <h3 className="text-sm font-black text-slate-800 mb-1 group-hover:text-blue-600 transition-colors">
                  {tool.title}
                </h3>
                <p className="text-[10px] text-slate-400 font-mono font-bold">
                  {tool.id}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsDashboard;
