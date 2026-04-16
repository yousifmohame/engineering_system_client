import { create } from "zustand";
import api from "../api/axios"; // 💡 تأكد من مسار الاستيراد الخاص بـ axios لديك (مهم لجلب الإعدادات)

// تعريف الشاشات المبرمجة والمعروفة مسبقاً
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
  815: { id: "815", title: "عروض الأسعار", icon: "FileSignature" },
  942: { id: "942", title: "المستندات والقوالب", icon: "FileCode" },
  285: { id: "285", title: "المشاريع", icon: "Briefcase" },
  88: { id: "88", title: "الموارد البشرية", icon: "Briefcase" },

  937: { id: "937", title: "إدارة المعقبين", icon: "Truck" },
  939: { id: "939", title: "شوارع الرياض", icon: "Map" },
  FIN: { id: "FIN", title: "المالية", icon: "Banknote" },
  SET: { id: "SET", title: "إعدادات النظام", icon: "Settings" },
};

export const useAppStore = create((set, get) => ({
  // ==========================================
  // 1. Global State
  // ==========================================
  activeScreenId: "DASH",
  openScreens: [{ id: "DASH", title: "لوحة التحكم", isClosable: false }],

  // ==========================================
  // 2. Local State
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
        id: "DASHBOARD_CLIENTS",
        title: "لوحة العملاء",
        type: "dashboard",
        closable: false,
      },
    ],
    310: [
      {
        id: "DASHBOARD_TAB",
        title: "لوحة الملكيات",
        type: "dashboard",
        closable: false,
      },
    ],
    815: [
      {
        id: "QUOTATIONS_DASH",
        title: "لوحة عروض الأسعار",
        type: "dashboard",
        closable: false,
      },
    ],
    942: [
      {
        id: "942-MAIN",
        title: "الإعدادات العامة",
        type: "wrapper",
        closable: false,
      },
    ],
    SET: [
      {
        id: "SET-SERVER",
        title: "حالة السيرفر",
        type: "wrapper",
        closable: false,
      },
    ],
    88: [
      {
        id: "DASHBOARD_HR",
        title: "لوحة الموارد البشرية",
        type: "dashboard",
        closable: false,
      },
    ],
  },

  activeTabPerScreen: {
    DASH: "DASH-MAIN",
    "055": "055-MAIN",
    300: "DASHBOARD_CLIENTS",
    310: "DASHBOARD_TAB",
    815: "QUOTATIONS_DASH",
    942: "942-MAIN",
    SET: "SET-SERVER",
    88: "DASHBOARD_HR",
  },

  // ==========================================
  // 3. Actions
  // ==========================================
  openScreen: (screenId, dynamicTitle = "شاشة جديدة") =>
    set((state) => {
      const screenConfig = SCREENS[screenId] || {
        id: screenId,
        title: dynamicTitle,
      };
      const isAlreadyOpen = state.openScreens.find((s) => s.id === screenId);

      if (isAlreadyOpen) {
        return { activeScreenId: screenId };
      }

      const mainTabId = `${screenId}-MAIN`;
      const hasExistingTabs = !!state.screenTabs[screenId];

      return {
        openScreens: [
          ...state.openScreens,
          { id: screenId, title: screenConfig.title, isClosable: true },
        ],
        activeScreenId: screenId,
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

  closeScreen: (screenId) =>
    set((state) => {
      const newScreens = state.openScreens.filter((s) => s.id !== screenId);
      let newActiveId = state.activeScreenId;
      if (state.activeScreenId === screenId) {
        newActiveId =
          newScreens.length > 0 ? newScreens[newScreens.length - 1].id : "DASH";
      }
      return { openScreens: newScreens, activeScreenId: newActiveId };
    }),

  setActiveTab: (screenId, tabId) =>
    set((state) => ({
      activeTabPerScreen: { ...state.activeTabPerScreen, [screenId]: tabId },
    })),

  addTab: (screenId, tab) =>
    set((state) => {
      const existingTabs = state.screenTabs[screenId] || [];
      const isTabExists = existingTabs.find((t) => t.id === tab.id);

      if (isTabExists) {
        return {
          activeTabPerScreen: {
            ...state.activeTabPerScreen,
            [screenId]: tab.id,
          },
        };
      }

      const newTab = { ...tab, closable: tab.closable !== false };
      return {
        screenTabs: {
          ...state.screenTabs,
          [screenId]: [...existingTabs, newTab],
        },
        activeTabPerScreen: { ...state.activeTabPerScreen, [screenId]: tab.id },
      };
    }),

  removeTab: (screenId, tabId) =>
    set((state) => {
      const tabs = state.screenTabs[screenId].filter((t) => t.id !== tabId);
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

  // ==========================================
  // 4. إعدادات النظام والمظهر (System Settings)
  // ==========================================

  sidebarConfig: null,

  // 💡 الدالة التي كانت مفقودة لجلب الإعدادات من السيرفر عند تحميل النظام
  fetchSidebarConfig: async () => {
    try {
      const response = await api.get("/settings/sidebar");
      set({ sidebarConfig: response.data });
    } catch (error) {
      console.error("Failed to fetch sidebar config", error);
    }
  },

  // دالة التحديث المحلي اللحظي
  setSidebarConfig: (newConfig) =>
    set((state) => ({
      sidebarConfig: { ...state.sidebarConfig, ...newConfig },
    })),
}));
