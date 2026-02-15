import { create } from "zustand";

// تعريف الشاشات الرئيسية للنظام
export const SCREENS = {
  DASH: {
    id: "DASH",
    title: "لوحة التحكم",
    icon: "LayoutDashboard",
    closable: false,
  },
  "055": { id: "055", title: "المعاملات (055)", icon: "FileText" },
  300: { id: "300", title: "العملاء (300)", icon: "Users" },
  310: { id: "310", title: "صكوك الملكية", icon: "ShieldCheck" },
  285: { id: "285", title: "المشاريع", icon: "Briefcase" },
  817: { id: "817", title: "شؤون الموظفين", icon: "Users" },
  937: { id: "937", title: "إدارة المعقبين", icon: "FileText" },
  939: { id: "939", title: "شوارع الرياض", icon: "Map" }, // أيقونة مفترضة
  FIN: { id: "FIN", title: "المالية", icon: "FileCheck" },
  SET: { id: "SET", title: "إعدادات النظام", icon: "Settings" },
};

export const useAppStore = create((set, get) => ({
  // --- Global State (الشريط العلوي الأسود) ---
  activeScreenId: "DASH",
  openScreens: [{ id: "DASH", title: "لوحة التحكم", isClosable: false }],

  // --- Local State (التبويبات الداخلية لكل شاشة) ---
  // الهيكل: { '300': [ {id, title, type} ], '310': [...] }
  screenTabs: {
    // شاشة العملاء: نبدأ بتبويب القائمة
    300: [
      { id: "300-LST", title: "سجل العملاء", type: "list", closable: false },
      // { id: '300-NEW', title: 'إضافة عميل', type: 'form', closable: true } // يمكن إغلاقه
    ],
    // شاشة المعاملات: نبدأ بتبويب السجل
    "055": [
      { id: "055-LOG", title: "سجل المعاملات", type: "list", closable: false },
      { id: "055-NEW", title: "إنشاء معاملة", type: "form", closable: true },
    ],

    // أضف هذا داخل كائن screenTabs في useAppStore
    310: [
      { id: "310-LST", title: "سجل الصكوك", type: "list", closable: false },
      { id: "310-UPL", title: "تحليل صك جديد", type: "form", closable: true },
    ],
    // شاشة لوحة التحكم
    DASH: [
      {
        id: "DASH-MAIN",
        title: "النظرة العامة",
        type: "dashboard",
        closable: false,
      },
    ],
  },

  // تحديد التبويب النشط لكل شاشة
  activeTabPerScreen: {
    300: "300-LST",
    310: "310-LST",
    "055": "055-LOG",
    DASH: "DASH-MAIN",
  },

  // --- Actions (الوظائف) ---

  // 1. فتح شاشة من السايد بار
  openScreen: (screenId) =>
    set((state) => {
      const screenConfig = SCREENS[screenId];
      if (!screenConfig) return {};

      const isAlreadyOpen = state.openScreens.find((s) => s.id === screenId);

      // إذا كانت مفتوحة، فقط نشطها
      if (isAlreadyOpen) {
        return { activeScreenId: screenId };
      }

      // إذا جديدة، أضفها للقائمة ونشطها
      return {
        openScreens: [
          ...state.openScreens,
          { id: screenId, title: screenConfig.title, isClosable: true },
        ],
        activeScreenId: screenId,
      };
    }),

  // 2. إغلاق شاشة من الشريط العلوي
  closeScreen: (screenId) =>
    set((state) => {
      const newScreens = state.openScreens.filter((s) => s.id !== screenId);

      // إذا أغلقنا الشاشة النشطة، ننتقل لآخر واحدة كانت مفتوحة
      let newActiveId = state.activeScreenId;
      if (state.activeScreenId === screenId) {
        newActiveId =
          newScreens.length > 0 ? newScreens[newScreens.length - 1].id : null;
      }

      return { openScreens: newScreens, activeScreenId: newActiveId };
    }),

  // 3. إدارة التبويبات الداخلية (Chrome Tabs)
  setActiveTab: (screenId, tabId) =>
    set((state) => ({
      activeTabPerScreen: { ...state.activeTabPerScreen, [screenId]: tabId },
    })),

  addTab: (screenId, tab) =>
    set((state) => {
      const existingTabs = state.screenTabs[screenId] || [];
      // إذا التبويب موجود مسبقاً، نشطه فقط
      if (existingTabs.find((t) => t.id === tab.id)) {
        return {
          activeTabPerScreen: {
            ...state.activeTabPerScreen,
            [screenId]: tab.id,
          },
        };
      }
      return {
        screenTabs: { ...state.screenTabs, [screenId]: [...existingTabs, tab] },
        activeTabPerScreen: { ...state.activeTabPerScreen, [screenId]: tab.id },
      };
    }),

  removeTab: (screenId, tabId) =>
    set((state) => {
      const tabs = state.screenTabs[screenId].filter((t) => t.id !== tabId);
      // منطق العودة للتبويب السابق عند الإغلاق
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
