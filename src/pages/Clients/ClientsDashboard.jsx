import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../api/axios"; // تأكد من مسار axios
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
  Loader2,
  Lock, // 👈 إضافة أيقونة القفل للحقول المخفية
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";

// 👈 1. استيراد مكون الصلاحيات
import AccessControl from "../../components/AccessControl"; 

// 👈 2. إضافة كود الصلاحية (code) واسمها (permName) لكل أداة
const CLIENT_TOOLS = [
  {
    id: "A01",
    title: "إنشاء عميل",
    icon: UserPlus,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
    badge: null,
    code: "CLIENT_TOOL_CREATE",
    permName: "أداة إنشاء عميل"
  },
  {
    id: "B01",
    title: "دليل العملاء",
    icon: BookUser,
    color: "text-blue-500",
    bg: "bg-blue-50",
    badge: null,
    target: "300-MAIN",
    code: "CLIENT_TOOL_DIRECTORY",
    permName: "أداة دليل العملاء"
  },
  {
    id: "C01",
    title: "تقييمات وتصنيفات",
    icon: Star,
    color: "text-amber-500",
    bg: "bg-amber-50",
    badge: null,
    target: "CLIENTS_RATINGS",
    code: "CLIENT_TOOL_RATINGS",
    permName: "أداة تقييم وتصنيف العملاء"
  },
  {
    id: "D01",
    title: "وثائق العملاء",
    icon: FileCheck,
    color: "text-purple-500",
    bg: "bg-purple-50",
    badge: null,
    target: "CLIENTS_DOCS",
    code: "CLIENT_TOOL_DOCS",
    permName: "أداة إدارة وثائق العملاء"
  },
  {
    id: "E01",
    title: "العنوان الوطني",
    icon: MapPin,
    color: "text-cyan-500",
    bg: "bg-cyan-50",
    badge: null,
    code: "CLIENT_TOOL_ADDRESS",
    permName: "أداة العناوين الوطنية"
  },
  {
    id: "F01",
    title: "الزكاة والضريبة",
    icon: Receipt,
    color: "text-red-500",
    bg: "bg-red-50",
    badge: null,
    code: "CLIENT_TOOL_TAX",
    permName: "أداة بيانات الزكاة والضريبة"
  },
  {
    id: "G01",
    title: "وكلاء ومفوضون",
    icon: UsersRound,
    color: "text-indigo-500",
    bg: "bg-indigo-50",
    badge: null,
    code: "CLIENT_TOOL_AGENTS",
    permName: "أداة إدارة الوكلاء والمفوضين"
  },
  {
    id: "H01",
    title: "معاملات العميل",
    icon: FileText,
    color: "text-teal-500",
    bg: "bg-teal-50",
    badge: null,
    code: "CLIENT_TOOL_TRANS",
    permName: "أداة استعراض معاملات العملاء"
  },
  {
    id: "I01",
    title: "السجل المالي",
    icon: BarChart3,
    color: "text-orange-500",
    bg: "bg-orange-50",
    badge: null,
    code: "CLIENT_TOOL_FINANCE",
    permName: "أداة السجل المالي للعميل"
  },
  {
    id: "J01",
    title: "تقارير العملاء",
    icon: BarChart3, // Note: You might want to change this to PieChart or FileSpreadsheet later to avoid duplicates
    color: "text-lime-500",
    bg: "bg-lime-50",
    badge: null,
    code: "CLIENT_TOOL_REPORTS",
    permName: "أداة تقارير العملاء الشاملة"
  },
  {
    id: "K01",
    title: "سجل التدقيق",
    icon: History,
    color: "text-slate-500",
    bg: "bg-slate-100",
    badge: null,
    code: "CLIENT_TOOL_AUDIT",
    permName: "أداة سجل تدقيق حركات العملاء"
  },
  {
    id: "L01",
    title: "سلة مؤقتة",
    icon: Archive,
    color: "text-slate-400",
    bg: "bg-slate-100",
    badge: null,
    code: "CLIENT_TOOL_ARCHIVE",
    permName: "أداة سلة المحذوفات المؤقتة"
  },
];

const ClientsDashboard = ({ onNavigate }) => {
  // جلب إحصائيات العملاء الحقيقية
  const {
    data: statsData,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["clients-stats"],
    queryFn: async () => {
      const response = await axios.get("/clients/stats");
      return response.data.data;
    },
    refetchInterval: 60000, // تحديث تلقائي كل دقيقة
  });

  const stats = statsData || {
    totalClients: 0,
    defaulters: 0,
    missingDocs: 0,
  };

  // تحديث بيانات الـ Badges في الأدوات بناءً على السيرفر
  const toolsWithStats = CLIENT_TOOLS.map((tool) => {
    if (tool.id === "B01") return { ...tool, badge: stats.totalClients };
    if (tool.id === "D01")
      return {
        ...tool,
        badge: stats.missingDocs > 0 ? stats.missingDocs : null,
      };
    return tool;
  });

  const cardAccents = [
    "from-purple-500 to-indigo-500",
    "from-sky-500 to-cyan-500",
    "from-teal-500 to-emerald-500",
    "from-emerald-500 to-green-500",
    "from-indigo-500 to-blue-500",
    "from-orange-500 to-amber-500",
    "from-fuchsia-500 to-purple-500",
    "from-amber-500 to-yellow-500",
    "from-rose-500 to-red-500",
    "from-blue-500 to-indigo-500",
    "from-cyan-500 to-teal-500",
    "from-slate-500 to-slate-700",
  ];

  const iconSoftClasses = [
    "bg-purple-50 text-purple-600 border-purple-100",
    "bg-cyan-50 text-cyan-600 border-cyan-100",
    "bg-emerald-50 text-emerald-600 border-emerald-100",
    "bg-green-50 text-green-600 border-green-100",
    "bg-blue-50 text-blue-600 border-blue-100",
    "bg-orange-50 text-orange-600 border-orange-100",
    "bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100",
    "bg-amber-50 text-amber-600 border-amber-100",
    "bg-rose-50 text-rose-600 border-rose-100",
    "bg-indigo-50 text-indigo-600 border-indigo-100",
    "bg-teal-50 text-teal-600 border-teal-100",
    "bg-slate-50 text-slate-600 border-slate-200",
  ];

  return (
    <div className="flex flex-col h-full bg-[#eef5f7]" dir="rtl">
      {/* Header redesigned like Archives & Records */}
      <div className="sticky top-0 z-20 px-4 pt-3 pb-2 bg-[#eef5f7] border-b border-[#d8e6ee]">
        <div className="rounded-[24px] bg-gradient-to-l from-[#071927] via-[#0b2f3f] to-[#147785] border border-[#d9b85b]/25 shadow-[0_12px_24px_rgba(8,54,70,0.14)] px-4 md:px-5 py-2.5">
          <div className="flex items-center justify-between gap-4" dir="ltr">
            <div className="flex items-center gap-2.5 shrink-0" dir="rtl">
              <button
                onClick={() => onNavigate && onNavigate("300-MAIN")}
                className="h-10 min-w-[240px] px-3 rounded-[17px] bg-white text-[#123B5D] border border-white/40 shadow-sm font-black text-[12px] flex items-center gap-2 hover:bg-[#f8fbfd]"
              >
                <Search className="w-4.5 h-4.5 text-[#123B5D]" />
                <span className="text-[12px] font-black">بحث</span>
                <span className="text-[12px] font-bold text-[#8aa0b4] truncate">داخل ملفات العملاء...</span>
              </button>
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-10 px-3.5 rounded-[17px] bg-white/12 text-white border border-white/20 shadow-sm font-black text-[12px] flex items-center gap-2 hover:bg-white/18 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span>تحديث</span>
              </button>
              <AccessControl
                code="CLIENT_DASH_BTN_ADD"
                name="زر إضافة عميل جديد سريع"
                moduleName="لوحة تحكم العملاء"
                tabName="الشريط العلوي"
              >
                <button
                  onClick={() => onNavigate && onNavigate("NEW_CLIENT_TAB")}
                  className="h-10 px-4 rounded-[17px] bg-[#d9b85b] text-[#083646] border border-[#f0d98d] shadow-sm font-black text-[12px] flex items-center gap-2 hover:bg-[#e6c86c] active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>عميل جديد</span>
                </button>
              </AccessControl>
            </div>

            <div className="flex items-center gap-3 min-w-0 text-right" dir="rtl">
              <div className="w-11 h-11 rounded-xl bg-[#d9b85b] text-[#083646] flex items-center justify-center shadow-md shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
                <h1 className="text-[16px] font-bold leading-tight whitespace-nowrap m-0 text-white">ملفات العملاء</h1>
                <p className="text-[10px] font-semibold text-white/75 mt-0.5 whitespace-nowrap">
                  مركز ذكي لإدارة ملفات العملاء وربطها بالمعاملات والمستندات
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* منطقة المحتوى (الشبكة) */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 bg-[#eef5f7] custom-scrollbar">
        <div className="max-w-[1600px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-white rounded-[20px] border border-[#d8e6ee] shadow-sm p-3 flex items-center justify-between">
              <div className="text-right">
                <div className="text-[11px] font-bold text-[#71839a]">إجمالي العملاء</div>
                <div className="text-[22px] font-black text-[#123B5D] leading-none mt-1">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.totalClients}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <AccessControl
              code="CLIENT_DASH_STAT_DEFAULTERS"
              name="إحصائية المتعثرين مالياً"
              moduleName="لوحة تحكم العملاء"
              tabName="المؤشرات"
              fallback={
                <div className="bg-white rounded-[20px] border border-[#d8e6ee] shadow-sm p-3 flex items-center justify-between opacity-70">
                  <div className="text-[11px] font-bold text-[#71839a]">مؤشر محمي</div>
                  <Lock className="w-5 h-5 text-[#8aa0b4]" />
                </div>
              }
            >
              <div className="bg-white rounded-[20px] border border-[#ecd8a6] shadow-sm p-3 flex items-center justify-between">
                <div className="text-right">
                  <div className="text-[11px] font-bold text-[#8a5a16]">متعثرين مالياً</div>
                  <div className="text-[22px] font-black text-[#b7791f] leading-none mt-1">
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.defaulters}
                  </div>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-[#fff8e8] text-[#b7791f] border border-[#ecd8a6] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
              </div>
            </AccessControl>
            <div className="bg-white rounded-[20px] border border-[#fecdd3] shadow-sm p-3 flex items-center justify-between">
              <div className="text-right">
                <div className="text-[11px] font-bold text-[#9f1239]">وثائق ناقصة</div>
                <div className="text-[22px] font-black text-[#be123c] leading-none mt-1">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : stats.missingDocs}
                </div>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#fff1f2] text-[#be123c] border border-[#fecdd3] flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fill,minmax(235px,1fr))] gap-4">
            {toolsWithStats.map((tool, idx) => (
              /* 👈 5. تغليف كل أداة في الشبكة بمكون AccessControl */
              <AccessControl 
                key={tool.id} 
                code={tool.code} 
                name={tool.permName} 
                moduleName="لوحة تحكم العملاء" 
                tabName="شبكة الأدوات" 
                type="screen"
              >
                <div
                  onClick={() => {
                    if (!onNavigate) return;
                    if (tool.id === "A01") onNavigate("NEW_CLIENT_TAB");
                    else if (tool.id === "B01") onNavigate("300-MAIN");
                    else if (tool.target) onNavigate(tool.target);
                    else
                      toast.info("قريباً - جاري العمل على هذه الشاشة", {
                        position: "top-center",
                      });
                  }}
                  className="group relative overflow-hidden rounded-[24px] bg-white border border-[#e8dcc8] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-right min-h-[132px] cursor-pointer"
                >
                  <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l ${cardAccents[idx % cardAccents.length]}`} />
                  {tool.badge > 0 && (
                    <div className="absolute top-3 left-3 min-w-[24px] h-6 px-1.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[11px] font-bold shadow-sm z-10">
                      {tool.badge}
                    </div>
                  )}
                  <div className="p-4 flex flex-col h-full justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${iconSoftClasses[idx % iconSoftClasses.length]} shadow-sm`}>
                        <tool.icon className="w-5 h-5" strokeWidth={2.4} />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#0f3d50] group-hover:text-white flex items-center justify-center transition-all">
                        <ArrowLeft className="w-4 h-4" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-black text-[#123B5D] leading-tight mb-1 group-hover:text-[#0f6d7c] transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-[10px] font-bold text-[#71839a] leading-tight">
                        {tool.permName || "أداة ضمن مركز ملفات العملاء"}
                      </p>
                    </div>
                  </div>
                </div>
              </AccessControl>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientsDashboard;