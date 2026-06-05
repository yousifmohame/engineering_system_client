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
  ArrowLeft,
} from "lucide-react";

import ProjectsArchiveScreen from "./ProjectsArchive/ProjectsArchiveScreen";
import BuildingPermitsRegistry from "./Permits/BuildingPermitsRegistry";
import ReferenceBaseScreen from "./Reference/ReferenceBaseScreen";

const HubScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activePopup, setActivePopup] = useState(null);

  const screenItems = [
    {
      id: "PROJ_ARCHIVE",
      title: "أرشيف المشاريع",
      icon: BookOpen,
      accent: "from-indigo-500 to-violet-600",
      soft: "bg-[#f4f7f8] text-[#123B5D] border-[#e8dcc8]",
      stat: "المخططات والعقود",
    },
    {
      id: "CAD_REVIT",
      title: "أرشيف الاوتوكاد والريفيت",
      icon: Layers,
      accent: "from-emerald-500 to-teal-600",
      soft: "bg-emerald-50 text-emerald-700 border-emerald-100",
      stat: "ملفات التصميم",
    },
    {
      id: "INTERNAL_PERMITS",
      title: "أرشيف رخص مكتبنا",
      icon: FileBadge,
      accent: "from-teal-500 to-cyan-600",
      soft: "bg-teal-50 text-teal-700 border-teal-100",
      stat: "سجلات المكتب",
    },
    {
      id: "EXTERNAL_PERMITS",
      title: "أرشيف رخص خارجية",
      icon: Archive,
      accent: "from-cyan-500 to-sky-600",
      soft: "bg-cyan-50 text-cyan-700 border-cyan-100",
      stat: "سجلات البلدية",
    },
    {
      id: "REF_REQUIREMENTS",
      title: "مركز الاشتراطات",
      icon: ClipboardList,
      accent: "from-violet-500 to-purple-600",
      soft: "bg-violet-50 text-violet-700 border-violet-100",
      stat: "المكتبة الفنية",
    },
    {
      id: "REF_GUIDES",
      title: "مركز الأدلة",
      icon: Book,
      accent: "from-blue-500 to-indigo-600",
      soft: "bg-[#f4f7f8] text-[#123B5D] border-[#e8dcc8]",
      stat: "أدلة الوزارة",
    },
    {
      id: "REF_CIRCULARS",
      title: "التعاميم",
      icon: Megaphone,
      accent: "from-rose-500 to-pink-600",
      soft: "bg-rose-50 text-rose-700 border-rose-100",
      stat: "تحديثات الأنظمة",
    },
    {
      id: "REF_EXCEPTIONS",
      title: "الاستثناءات",
      icon: ShieldAlert,
      accent: "from-amber-500 to-orange-600",
      soft: "bg-amber-50 text-amber-700 border-amber-100",
      stat: "حالات خاصة",
    },
    {
      id: "REF_FORMS",
      title: "أرشيف النماذج",
      icon: FileText,
      accent: "from-fuchsia-500 to-purple-600",
      soft: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100",
      stat: "نماذج المكتب",
    },
    {
      id: "DEEDS_ARCHIVE",
      title: "أرشيف الصكوك",
      icon: ScrollText,
      accent: "from-orange-500 to-amber-600",
      soft: "bg-orange-50 text-orange-700 border-orange-100",
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
      className="h-full flex flex-col bg-[#f4f7f8] overflow-y-auto animate-in fade-in duration-500"
      dir="rtl"
    >
      <div className="m-3 mb-2 rounded-[1.35rem] bg-gradient-to-l from-[#0b2332] via-[#0f3d50] to-[#167080] text-white shadow-lg border border-white/10 overflow-hidden shrink-0">
        <div className="px-4 py-2 flex items-center justify-between gap-3" dir="ltr">
          <div className="flex items-center gap-2.5 flex-wrap min-w-0" dir="rtl">
            <div className="relative w-[220px] shrink-0">
              <input
                placeholder="بحث داخل الأقسام..."
                className="w-full h-9 bg-white text-[#123B5D] border border-white/30 rounded-2xl pr-16 pl-11 text-[12px] font-extrabold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-[#d7b96d]/60 focus:border-[#d7b96d] transition-all shadow-sm"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[12px] font-black text-[#123B5D]">
                بحث
              </span>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#123B5D]" strokeWidth={2.4} />
            </div>

          </div>

          <div className="flex items-center gap-3 min-w-0 text-right" dir="rtl">
            <div className="w-11 h-11 rounded-xl bg-[#d7b96d] text-[#0f3d50] flex items-center justify-center shadow-md shrink-0">
              <LayoutGrid className="w-5 h-5" strokeWidth={2.6} />
            </div>
            <div className="min-w-0" style={{ fontFamily: "Tajawal, sans-serif" }}>
              <h2 className="text-[16px] font-bold leading-tight whitespace-nowrap text-white">الأرشيف والسجلات</h2>
              <p className="text-[10px] font-semibold text-white/75 mt-0.5 leading-tight whitespace-nowrap">
                مركز ذكي لحفظ واسترجاع وثائق المكتب والمشاريع والرخص بطريقة منظمة
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="px-4 pb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePopup(item)}
            className="group relative overflow-hidden rounded-[1.4rem] bg-white border border-[#e8dcc8] shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all text-right min-h-[112px]"
          >
            <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-l ${item.accent}`} />
            <div className="p-3.5 flex flex-col h-full justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${item.soft} shadow-sm`}>
                  <item.icon className="w-5 h-5" strokeWidth={2.4} />
                </div>
                <div className="w-7 h-7 rounded-full bg-slate-50 text-slate-400 group-hover:bg-[#0f3d50] group-hover:text-white flex items-center justify-center transition-all">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </div>
              </div>
              <div>
                <h3 className="text-[15px] font-black text-[#123B5D] leading-tight mb-1">
                  {item.title}
                </h3>
                <p className="text-[10px] font-bold text-slate-500">
                  {item.stat}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="w-full text-center py-20 text-slate-400 font-bold">
          لا توجد نتائج مطابقة
        </div>
      )}

      {activePopup && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/65 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full h-[96vh] max-w-[1700px] flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-300 border border-white/20">
            <div className="px-5 py-3 flex items-center justify-between bg-[#0f3d50] text-white shrink-0 z-10">
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl bg-white shadow-sm ${activePopup.soft}`}>
                  <activePopup.icon className="w-5 h-5" strokeWidth={2.5} />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-black truncate">{activePopup.title}</h2>
                  <p className="text-xs font-bold text-white/65 mt-0.5">{activePopup.stat}</p>
                </div>
              </div>

              <button
                onClick={() => setActivePopup(null)}
                className="px-3 py-2 bg-white/10 hover:bg-rose-500/90 hover:text-white rounded-xl transition-all border border-white/15 text-white/80 flex items-center gap-2"
              >
                <span className="text-[11px] font-bold">إغلاق النافذة</span>
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-hidden relative bg-white">
              {activePopup.id === "PROJ_ARCHIVE" && <ProjectsArchiveScreen />}
              {activePopup.id === "INTERNAL_PERMITS" && <BuildingPermitsRegistry fixedOffice="مكتب ديتيلز" />}
              {activePopup.id === "EXTERNAL_PERMITS" && <BuildingPermitsRegistry />}
              {activePopup.id === "REF_REQUIREMENTS" && (
                <ReferenceBaseScreen fixedCategory="اشتراطات" pageTitle="مركز الاشتراطات" pageDescription="إدارة واستعراض جميع الاشتراطات الفنية والبلدية" themeColor="purple" HeaderIcon={ClipboardList} />
              )}
              {activePopup.id === "REF_GUIDES" && (
                <ReferenceBaseScreen fixedCategory="أدلة" pageTitle="مركز الأدلة" pageDescription="أدلة الكود السعودي وإصدارات الوزارة الرسمية" themeColor="blue" HeaderIcon={Book} />
              )}
              {activePopup.id === "REF_CIRCULARS" && (
                <ReferenceBaseScreen fixedCategory="تعاميم" pageTitle="التعاميم والتحديثات" pageDescription="متابعة التعاميم الهندسية الصادرة حديثاً" themeColor="amber" HeaderIcon={Megaphone} />
              )}
              {activePopup.id === "REF_EXCEPTIONS" && (
                <ReferenceBaseScreen fixedCategory="حالات خاصة واستثناءات" pageTitle="الاستثناءات والحالات الخاصة" pageDescription="أرشفة القرارات الاستثنائية والحالات المرجعية الخاصة" themeColor="emerald" HeaderIcon={ShieldAlert} />
              )}
              {activePopup.id === "CAD_REVIT" && (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50/60">
                  <Layers className="w-20 h-20 mb-4 opacity-20" />
                  <div className="font-black text-xl">قريباً: أرشيف ملفات التصميم الهندسي</div>
                </div>
              )}
              {activePopup.id === "REF_FORMS" && (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50/60">
                  <FileText className="w-20 h-20 mb-4 opacity-20" />
                  <div className="font-black text-xl">قريباً: أرشيف النماذج</div>
                </div>
              )}
              {activePopup.id === "DEEDS_ARCHIVE" && (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 bg-slate-50/60">
                  <ScrollText className="w-20 h-20 mb-4 opacity-20" />
                  <div className="font-black text-xl">قريباً: أرشيف الصكوك ومستندات الملكية</div>
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
