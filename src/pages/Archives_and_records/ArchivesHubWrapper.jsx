import React from "react";
import { useAppStore } from "../../stores/useAppStore";
import { FileText } from "lucide-react";
// استيراد الشاشات الحقيقية التي برمجناها سابقاً
import HubScreen from "./HubScreen";
import ProjectsArchiveScreen from "../ProjectsArchive/ProjectsArchiveScreen";
import BuildingPermitsRegistry from "../Permits/BuildingPermitsRegistry";
import ReferenceBaseScreen from "../Reference/ReferenceBaseScreen";

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
    <div className="flex h-full w-full bg-slate-50 overflow-hidden" dir="rtl">
      {/* الإطار الأبيض الجمالي الذي يحوي المحتوى */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-xl m-3 rounded-[2rem] border border-slate-200 overflow-hidden relative">
        <div className="flex-1 relative h-full overflow-y-auto custom-scrollbar">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
