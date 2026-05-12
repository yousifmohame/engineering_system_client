import React, { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  BookOpen,
  Layers,
  FileBadge,
  Archive,
  ClipboardList,
  Book,
  Megaphone,
  ShieldAlert,
  X,
  FileText,
  ScrollText,
} from "lucide-react";

// 💡 1. استيراد الشاشات التي سيتم فتحها داخل الـ Popup
// (تأكد من تعديل المسارات حسب مشروعك)
import ProjectsArchiveScreen from "../ProjectsArchive/ProjectsArchiveScreen";
import BuildingPermitsRegistry from "../Permits/BuildingPermitsRegistry";
import ReferenceBaseScreen from "../Reference/ReferenceBaseScreen";

const HubScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");

  // 💡 2. حالة جديدة للتحكم في النافذة المنبثقة (أي شاشة مفتوحة الآن؟)
  const [activePopup, setActivePopup] = useState(null);

  const screenItems = [
    {
      id: "PROJ_ARCHIVE",
      title: "أرشيف المشاريع",
      icon: BookOpen,
      color: "bg-indigo-500 shadow-indigo-500/20",
      iconColor: "text-indigo-600",
      stat: "المخططات والعقود",
    },
    {
      id: "CAD_REVIT",
      title: "أرشيف الاوتوكاد والريفيت",
      icon: Layers,
      color: "bg-emerald-500 shadow-emerald-500/20",
      iconColor: "text-emerald-600",
      stat: "ملفات التصميم",
    },
    {
      id: "INTERNAL_PERMITS",
      title: "أرشيف رخص مكتبنا",
      icon: FileBadge,
      color: "bg-teal-500 shadow-teal-500/20",
      iconColor: "text-teal-600",
      stat: "سجلات المكتب",
    },
    {
      id: "EXTERNAL_PERMITS",
      title: "أرشيف رخص خارجية",
      icon: Archive,
      color: "bg-cyan-600 shadow-cyan-600/20",
      iconColor: "text-cyan-600",
      stat: "سجلات البلدية",
    },
    {
      id: "REF_REQUIREMENTS",
      title: "مركز الاشتراطات",
      icon: ClipboardList,
      color: "bg-violet-500 shadow-violet-500/20",
      iconColor: "text-violet-600",
      stat: "المكتبة الفنية",
    },
    {
      id: "REF_GUIDES",
      title: "مركز الأدلة",
      icon: Book,
      color: "bg-blue-500 shadow-blue-500/20",
      iconColor: "text-blue-600",
      stat: "أدلة الوزارة",
    },
    {
      id: "REF_CIRCULARS",
      title: "التعاميم",
      icon: Megaphone,
      color: "bg-rose-500 shadow-rose-500/20",
      iconColor: "text-rose-600",
      stat: "تحديثات الأنظمة",
    },
    {
      id: "REF_EXCEPTIONS",
      title: "الاستثناءات",
      icon: ShieldAlert,
      color: "bg-amber-500 shadow-amber-500/20",
      iconColor: "text-amber-600",
      stat: "حالات خاصة",
    },
    {
      id: "REF_FORMS",
      title: "أرشيف النماذج",
      icon: FileText,
      color: "bg-fuchsia-500 shadow-fuchsia-500/20",
      iconColor: "text-fuchsia-600",
      stat: "نماذج المكتب",
    },
    {
      id: "DEEDS_ARCHIVE",
      title: "أرشيف الصكوك",
      icon: ScrollText,
      color: "bg-orange-500 shadow-orange-500/20",
      iconColor: "text-orange-600",
      stat: "صكوك ومستندات الملكية",
    },
  ];

  const filteredItems = useMemo(
    () =>
      screenItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  );

  return (
    <div
      className="p-8 h-full flex flex-col bg-slate-50 overflow-y-auto animate-in fade-in duration-500"
      dir="rtl"
    >
      {/* Header Section */}
      <div className="mb-8 w-full flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60">
            <LayoutGrid className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">
              الأرشيف والسجلات
            </h2>
            <p className="text-sm font-bold text-slate-500">
              مركز حفظ واسترجاع كافة وثائق المكتب والمشاريع والرخص
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-md relative">
          <input
            placeholder="بحث شامل..."
            className="w-full bg-white border border-slate-200/60 rounded-2xl py-3.5 pr-12 pl-4 text-sm font-bold text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePopup(item)} // 👈 عند الضغط نحدد الشاشة كـ (نافذة نشطة)
            className={`${item.color} p-6 rounded-[2.5rem] text-white hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center justify-center gap-4 group aspect-square relative overflow-hidden`}
          >
            <div className="p-4 bg-white/20 rounded-3xl group-hover:scale-110 transition-transform">
              <item.icon className="w-10 h-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col items-center">
              <span className="font-black text-[15px] text-center leading-tight">
                {item.title}
              </span>
              <span className="text-[9px] font-bold opacity-70 mt-1 uppercase tracking-widest">
                {item.stat}
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="w-full text-center py-20 text-slate-400 font-bold">
          لا توجد نتائج مطابقة
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 النافذة المنبثقة العملاقة (Popup Window) */}
      {/* ========================================== */}
      {activePopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full h-[96vh] max-w-[1700px] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300">
            {/* 1. هيدر النافذة المنبثقة */}
            <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-b border-slate-200 shrink-0 z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 ${activePopup.iconColor}`}
                >
                  <activePopup.icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">
                    {activePopup.title}
                  </h2>
                  <p className="text-xs font-bold text-slate-500 mt-0.5">
                    {activePopup.stat}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActivePopup(null)} // 👈 زر إغلاق النافذة
                className="p-2 bg-white hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-all shadow-sm border border-slate-200 text-slate-400 flex items-center gap-2"
              >
                <span className="text-[10px] font-bold px-1">
                  إغلاق النافذة
                </span>
                <X size={18} />
              </button>
            </div>

            {/* 2. محتوى النافذة المنبثقة (الشاشة الحقيقية) */}
            <div className="flex-1 overflow-hidden relative bg-white">
              {activePopup.id === "PROJ_ARCHIVE" && <ProjectsArchiveScreen />}

              {activePopup.id === "INTERNAL_PERMITS" && (
                <BuildingPermitsRegistry fixedOffice="مكتب ديتيلز" />
              )}

              {activePopup.id === "EXTERNAL_PERMITS" && (
                <BuildingPermitsRegistry />
              )}

              {/* === شاشات المكتبة المرجعية الأربع === */}

              {activePopup.id === "REF_REQUIREMENTS" && (
                <ReferenceBaseScreen
                  fixedCategory="اشتراطات"
                  pageTitle="مركز الاشتراطات"
                  pageDescription="إدارة واستعراض جميع الاشتراطات الفنية والبلدية"
                  themeColor="purple"
                  HeaderIcon={ClipboardList}
                />
              )}

              {activePopup.id === "REF_GUIDES" && (
                <ReferenceBaseScreen
                  fixedCategory="أدلة"
                  pageTitle="مركز الأدلة"
                  pageDescription="أدلة الكود السعودي وإصدارات الوزارة الرسمية"
                  themeColor="blue"
                  HeaderIcon={Book}
                />
              )}

              {activePopup.id === "REF_CIRCULARS" && (
                <ReferenceBaseScreen
                  fixedCategory="تعاميم"
                  pageTitle="التعاميم والتحديثات"
                  pageDescription="متابعة التعاميم الهندسية الصادرة حديثاً"
                  themeColor="amber"
                  HeaderIcon={Megaphone}
                />
              )}

              {activePopup.id === "REF_EXCEPTIONS" && (
                <ReferenceBaseScreen
                  fixedCategory="حالات خاصة واستثناءات"
                  pageTitle="الاستثناءات والحالات الخاصة"
                  pageDescription="أرشفة القرارات الاستثنائية والحالات المرجعية الخاصة"
                  themeColor="emerald"
                  HeaderIcon={ShieldAlert}
                />
              )}

              {activePopup.id === "CAD_REVIT" && (
                <div className="flex flex-col h-full items-center justify-center text-slate-400">
                  <Layers className="w-20 h-20 mb-4 opacity-20" />
                  <div className="font-bold text-xl">
                    قريباً: أرشيف ملفات التصميم الهندسي
                  </div>
                </div>
              )}

              {activePopup.id === "REF_FORMS" && (
                <div className="flex flex-col h-full items-center justify-center text-slate-400">
                  <FileText className="w-20 h-20 mb-4 opacity-20" />
                  <div className="font-bold text-xl">قريباً: أرشيف النماذج</div>
                </div>
              )}

              {activePopup.id === "DEEDS_ARCHIVE" && (
                <div className="flex flex-col h-full items-center justify-center text-slate-400">
                  <ScrollText className="w-20 h-20 mb-4 opacity-20" />
                  <div className="font-bold text-xl">
                    قريباً: أرشيف الصكوك ومستندات الملكية
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HubScreen;
