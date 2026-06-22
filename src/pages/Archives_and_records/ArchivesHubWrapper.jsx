import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { FileText, ClipboardList, Book, Megaphone, ShieldAlert } from "lucide-react";
// استيراد الشاشات الحقيقية التي برمجناها سابقاً
import HubScreen from "./HubScreen";
import ProjectsArchiveScreen from "./ProjectsArchive/ProjectsArchiveScreen";
import BuildingPermitsRegistry from "./Permits/BuildingPermitsRegistry";
import ReferenceBaseScreen from "./Reference/ReferenceBaseScreen";
import { PropertyDocumentsArchive } from "./PropertyDocuments/PropertyDocumentsArchive";


function ArchivesModernStyles() {
  return (
    <style>{`
      .archives-modern { --navy:#0f3d50; --navy2:#174e65; --gold:#d7b96d; --ink:#123B5D; --line:#e8dcc8; }
      .archives-modern * { scrollbar-width: thin; scrollbar-color: var(--gold) #eef3f5; }
      .archives-modern button { font-weight: 800; }
      .archives-modern input, .archives-modern select, .archives-modern textarea {
        border-radius: 0.85rem !important;
        color: var(--ink) !important;
      }
      .archives-modern input::placeholder, .archives-modern textarea::placeholder { color:#8aa0b2 !important; }
      .archives-modern [class*="bg-indigo-600"],
      .archives-modern [class*="bg-purple-600"],
      .archives-modern [class*="bg-blue-600"] { background: var(--navy) !important; color:#fff !important; }
      .archives-modern [class*="text-indigo-"],
      .archives-modern [class*="text-purple-"],
      .archives-modern [class*="text-blue-"] { color: var(--ink); }
      .archives-modern [class*="border-indigo-"],
      .archives-modern [class*="border-purple-"],
      .archives-modern [class*="border-blue-"] { border-color: var(--line) !important; }
      .archives-modern table thead tr { background:#f4f7f8 !important; }
      .archives-modern table th { color:var(--ink) !important; font-weight:900 !important; }
      .archives-modern table td { color:#1f2d3d; }
      .archives-modern .custom-scrollbar::-webkit-scrollbar,
      .archives-modern .custom-scrollbar-slim::-webkit-scrollbar { width:8px; height:8px; }
      .archives-modern .custom-scrollbar::-webkit-scrollbar-thumb,
      .archives-modern .custom-scrollbar-slim::-webkit-scrollbar-thumb { background:var(--gold); border-radius:999px; }
      .archives-modern .custom-scrollbar::-webkit-scrollbar-track,
      .archives-modern .custom-scrollbar-slim::-webkit-scrollbar-track { background:#eef3f5; }
      .archives-modern .legacy-white-action,
      .archives-modern [class*="bg-white/10"] { backdrop-filter: blur(8px); }
      /* Harmonisation globale forte : pages internes + modals */
      .archives-modern [class*="fixed"][class*="inset-0"] { background: rgba(15,61,80,.55) !important; backdrop-filter: blur(10px); }
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] {
        border-radius: 1.75rem !important;
        border: 1px solid rgba(232,220,200,.9) !important;
        overflow: hidden !important;
        box-shadow: 0 22px 70px rgba(15,61,80,.28) !important;
      }
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child {
        background: linear-gradient(90deg,#167080 0%,#0f3d50 45%,#0b2332 100%) !important;
        color: #fff !important;
        border-bottom: 1px solid rgba(255,255,255,.12) !important;
        min-height: unset !important;
      }
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child h1,
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child h2,
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child h3,
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child p,
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child span { color:#fff !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child svg { color:#d7b96d !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] > [class*="bg-white"] > div:first-child button {
        background: rgba(255,255,255,.10) !important;
        color: #fff !important;
        border: 1px solid rgba(255,255,255,.18) !important;
        border-radius: .9rem !important;
      }
      .archives-modern [class*="fixed"][class*="inset-0"] label,
      .archives-modern [class*="fixed"][class*="inset-0"] h3,
      .archives-modern [class*="fixed"][class*="inset-0"] h4 { color:var(--ink) !important; font-weight:900 !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] input,
      .archives-modern [class*="fixed"][class*="inset-0"] select,
      .archives-modern [class*="fixed"][class*="inset-0"] textarea {
        background:#f8fafb !important;
        border:1px solid #dbe4ea !important;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.65) !important;
      }
      .archives-modern [class*="fixed"][class*="inset-0"] [class*="bg-slate-50"],
      .archives-modern [class*="fixed"][class*="inset-0"] [class*="bg-gray-50"] { background:#f4f7f8 !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] [class*="border-slate"],
      .archives-modern [class*="fixed"][class*="inset-0"] [class*="border-gray"] { border-color:#e8dcc8 !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] button[class*="bg-white"] {
        background:#f4f7f8 !important;
        color:var(--ink) !important;
        border:1px solid #e8dcc8 !important;
      }
      .archives-modern [class*="fixed"][class*="inset-0"] button[class*="bg-white"] svg { color:var(--ink) !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] aside,
      .archives-modern [class*="fixed"][class*="inset-0"] nav { background:#ffffff !important; }
      .archives-modern [class*="fixed"][class*="inset-0"] [class*="rounded-xl"],
      .archives-modern [class*="fixed"][class*="inset-0"] [class*="rounded-lg"] { border-radius: .95rem !important; }
      .archives-modern [class*="bg-[#0f3d50]"] { background:#0f3d50 !important; }
      .archives-modern [class*="bg-[#d7b96d]"] { background:#d7b96d !important; color:#0f3d50 !important; }

    `}</style>
  );
}

export default function ArchivesHubWrapper() {
  const screenId = "ARCHIVE_HUB_SCREEN"; // 💡 كود فريد لهذا القسم في السيستم
  const { activeTabPerScreen, setActiveTab, addTab } = useAppStore();

  // جلب التبويب النشط حالياً من الستور، وإذا لم يوجد نفتح شاشة المربعات (MAIN_HUB)
  const activeTabId = activeTabPerScreen[screenId] || "MAIN_HUB";

  // دالة التنقل: تضيف تابة جديدة في الأعلى وتغير المحتوى
  const handleNavigate = (targetId, title) => {
    addTab(screenId, {
      id: targetId,
      title: title,
      type: "panel",
      closable: true,
    });
    setActiveTab(screenId, targetId);
  };

  const renderContent = () => {
    switch (activeTabId) {
      case "PROJ_ARCHIVE":
        return <ProjectsArchiveScreen />;

      case "INTERNAL_PERMITS":
        // 👈 نمرر اسم المكتب ليفلتر تلقائياً كما طلبنا سابقاً
        return <BuildingPermitsRegistry fixedOffice="مكتب ديتيلز" />;

      case "EXTERNAL_PERMITS":
        return <BuildingPermitsRegistry />;

      case "REF_REQUIREMENTS":
        return (
          <ReferenceBaseScreen
            fixedCategory="اشتراطات"
            pageTitle="مركز الاشتراطات"
            pageDescription="إدارة واستعراض جميع الاشتراطات الفنية والبلدية"
            themeColor="purple"
            HeaderIcon={ClipboardList} // تأكد من استيراد ClipboardList من lucide-react في الأعلى
          />
        );

      case "REF_GUIDES":
        return (
          <ReferenceBaseScreen
            fixedCategory="أدلة"
            pageTitle="مركز الأدلة"
            pageDescription="أدلة الكود السعودي وإصدارات الوزارة الرسمية"
            themeColor="blue"
            HeaderIcon={Book} // تأكد من استيراد Book
          />
        );

      case "REF_CIRCULARS":
        return (
          <ReferenceBaseScreen
            fixedCategory="تعاميم"
            pageTitle="التعاميم والتحديثات"
            pageDescription="متابعة التعاميم الهندسية الصادرة حديثاً"
            themeColor="amber"
            HeaderIcon={Megaphone} // تأكد من استيراد Megaphone
          />
        );

      case "REF_EXCEPTIONS":
        return (
          <ReferenceBaseScreen
            fixedCategory="حالات خاصة واستثناءات"
            pageTitle="الاستثناءات والحالات الخاصة"
            pageDescription="أرشفة القرارات الاستثنائية والحالات المرجعية الخاصة"
            themeColor="emerald"
            HeaderIcon={ShieldAlert} // تأكد من استيراد ShieldAlert
          />
        );

      case "DEEDS_ARCHIVE":
        return (
          <PropertyDocumentsArchive
          fixedCategory= ""
          />
        );

      case "CAD_REVIT":
        return (
          <div className="p-20 text-center font-bold text-slate-400">
            قريباً: أرشيف ملفات التصميم الهندسي
          </div>
        );

      default:
        // الشاشة الافتراضية هي شاشة المربعات
        return <HubScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="archives-modern flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      <ArchivesModernStyles />
      {/* الإطار الأبيض الجمالي الذي يحوي المحتوى */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-2 rounded-[1.75rem] border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
