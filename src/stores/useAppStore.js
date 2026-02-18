import { create } from "zustand";

// تعريف الشاشات الرئيسية للنظام
export const SCREENS = {
  DASH: {
    id: "DASH",
    title: "لوحة التحكم",
    icon: "LayoutDashboard",
    closable: false,
  },
  "055": { id: "055", title: "المعاملات", icon: "FileText" },
  300: { id: "300", title: "العملاء", icon: "Users" },
  310: { id: "310", title: "إدارة الملكيات", icon: "ShieldCheck" },
  942: { id: "942", title: "المستندات والقوالب", icon: "FileCode" },
  285: { id: "285", title: "المشاريع", icon: "Briefcase" },
  817: { id: "817", title: "شؤون الموظفين", icon: "UserCog" },
  937: { id: "937", title: "إدارة المعقبين", icon: "Truck" },
  939: { id: "939", title: "شوارع الرياض", icon: "Map" },
  FIN: { id: "FIN", title: "المالية", icon: "Banknote" },
  SET: { id: "SET", title: "إعدادات النظام", icon: "Settings" },
};

export const useAppStore = create((set, get) => ({
  // ==========================================
  // 1. Global State (الشريط العلوي - الشاشات المفتوحة)
  // ==========================================
  activeScreenId: "DASH",
  openScreens: [{ id: "DASH", title: "لوحة التحكم", isClosable: false }],

  // ==========================================
  // 2. Local State (التابات الداخلية لكل شاشة)
  // ==========================================
  screenTabs: {
    DASH: [
      {
        id: "DASH-MAIN",
        title: "النظرة العامة",
        type: "dashboard",
        closable: false,
      },
    ],
    "055": [
      {
        id: "055-MAIN",
        title: "إدارة المعاملات",
        type: "wrapper",
        closable: false,
      },
    ],
    300: [
      {
        id: "300-MAIN",
        title: "سجل العملاء",
        type: "wrapper",
        closable: false,
      },
    ],
    310: [
      { id: "310-MAIN", title: "سجل الصكوك", type: "wrapper", closable: false },
    ],
    942: [
      {
        id: "942-MAIN",
        title: "الإعدادات العامة",
        type: "wrapper",
        closable: false,
      },
    ],
  },

  activeTabPerScreen: {
    DASH: "DASH-MAIN",
    "055": "055-MAIN",
    300: "300-MAIN",
    310: "310-MAIN",
    942: "942-MAIN",
  },

  // ==========================================
  // 3. Actions (الوظائف والأوامر)
  // ==========================================

  // فتح شاشة من السايد بار الرئيسي (تم التحديث لإنشاء تاب افتراضي ديناميكياً)
  openScreen: (screenId) =>
    set((state) => {
      const screenConfig = SCREENS[screenId];
      if (!screenConfig) return {}; // تجاهل إذا كانت الشاشة غير معرفة

      const isAlreadyOpen = state.openScreens.find((s) => s.id === screenId);

      // أ) إذا كانت مفتوحة مسبقاً، قم بتنشيطها فقط
      if (isAlreadyOpen) {
        return { activeScreenId: screenId };
      }

      // ب) إذا كانت شاشة جديدة:
      const mainTabId = `${screenId}-MAIN`;
      const hasExistingTabs = !!state.screenTabs[screenId];

      return {
        // 1. إضافتها للشريط العلوي
        openScreens: [
          ...state.openScreens,
          { id: screenId, title: screenConfig.title, isClosable: true },
        ],
        activeScreenId: screenId,

        // 2. تهيئة التاب الداخلي الأساسي لها إذا لم يكن موجوداً
        screenTabs: {
          ...state.screenTabs,
          ...(hasExistingTabs
            ? {}
            : {
                [screenId]: [
                  {
                    id: mainTabId,
                    title: screenConfig.title,
                    type: "wrapper",
                    closable: false,
                  },
                ],
              }),
        },
        activeTabPerScreen: {
          ...state.activeTabPerScreen,
          ...(hasExistingTabs ? {} : { [screenId]: mainTabId }),
        },
      };
    }),

  // إغلاق شاشة بالكامل من الشريط العلوي (Global)
  closeScreen: (screenId) =>
    set((state) => {
      const newScreens = state.openScreens.filter((s) => s.id !== screenId);

      let newActiveId = state.activeScreenId;
      if (state.activeScreenId === screenId) {
        newActiveId =
          newScreens.length > 0 ? newScreens[newScreens.length - 1].id : "DASH";
      }

      // (اختياري) يمكننا مسح تابات الشاشة المغلقة لتنظيف الذاكرة، لكن تركها يسمح بالاحتفاظ بحالتها إذا أعاد فتحها
      return { openScreens: newScreens, activeScreenId: newActiveId };
    }),

  // تنشيط تاب داخلي معين
  setActiveTab: (screenId, tabId) =>
    set((state) => ({
      activeTabPerScreen: { ...state.activeTabPerScreen, [screenId]: tabId },
    })),

  // إضافة تاب فرعي جديد داخل شاشة (مثلاً: فتح "تفاصيل معاملة")
  addTab: (screenId, tab) =>
    set((state) => {
      const existingTabs = state.screenTabs[screenId] || [];
      const isTabExists = existingTabs.find((t) => t.id === tab.id);

      // إذا كان التاب مفتوحاً بالفعل، قم بالانتقال إليه فقط
      if (isTabExists) {
        return {
          activeTabPerScreen: {
            ...state.activeTabPerScreen,
            [screenId]: tab.id,
          },
        };
      }

      // إذا كان التاب جديداً، أضفه (مع التأكد أنه قابل للإغلاق افتراضياً)
      const newTab = { ...tab, closable: tab.closable !== false };

      return {
        screenTabs: {
          ...state.screenTabs,
          [screenId]: [...existingTabs, newTab],
        },
        activeTabPerScreen: { ...state.activeTabPerScreen, [screenId]: tab.id },
      };
    }),

  // إغلاق تاب فرعي داخلي
  removeTab: (screenId, tabId) =>
    set((state) => {
      const tabs = state.screenTabs[screenId].filter((t) => t.id !== tabId);

      // إذا أغلق التاب النشط، نعود للتاب الأخير في القائمة المتبقية
      let newActiveTab = state.activeTabPerScreen[screenId];
      if (newActiveTab === tabId) {
        newActiveTab = tabs[tabs.length - 1]?.id || tabs[0]?.id;
      }

      return {
        screenTabs: { ...state.screenTabs, [screenId]: tabs },
        activeTabPerScreen: {
          ...state.activeTabPerScreen,
          [screenId]: newActiveTab,
        },
      };
    }),
}));
