import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { useAppStore } from "../../../stores/useAppStore";
import { DEFAULT_MENU_CATEGORIES } from "../../../constants/menuConstants";
import { ListOrdered, Loader2, Save, ChevronUp, ChevronDown, Edit2 } from "lucide-react";

export default function SidebarSettingsTab() {
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuSaving, setIsMenuSaving] = useState(false);

  const { sidebarConfig, setSidebarConfig } = useAppStore();

  const [localSidebar, setLocalSidebar] = useState({
    bgColor: "#293241",
    textColor: "#cbd5e1",
    activeColor: "#2563eb",
    width: 280,
    logoUrl: "/logo.jpeg",
    categoryOrder: [],
    itemOrder: {},
    customLabels: {},
  });

  const [modalSidebarData, setModalSidebarData] = useState({
    logoUrl: "/logo.jpeg",
    categoryOrder: [],
    itemOrder: {},
    customLabels: {},
  });

  useEffect(() => {
    if (sidebarConfig) {
      const updated = {
        bgColor: sidebarConfig.bgColor || "#293241",
        textColor: sidebarConfig.textColor || "#cbd5e1",
        activeColor: sidebarConfig.activeColor || "#2563eb",
        width: sidebarConfig.width || 280,
        logoUrl: sidebarConfig.logoUrl || "/logo.jpeg",
        categoryOrder:
          sidebarConfig.categoryOrder?.length > 0
            ? sidebarConfig.categoryOrder
            : DEFAULT_MENU_CATEGORIES.map((c) => c.id),
        itemOrder: sidebarConfig.itemOrder || {},
        customLabels: sidebarConfig.customLabels || {},
      };
      setLocalSidebar(updated);
      setModalSidebarData({
        logoUrl: updated.logoUrl,
        categoryOrder: [...updated.categoryOrder],
        itemOrder: { ...updated.itemOrder },
        customLabels: { ...updated.customLabels },
      });
    }
  }, [sidebarConfig]);

  const saveSidebarSettings = async () => {
    setIsSaving(true);
    try {
      const res = await api.put("/settings/sidebar", localSidebar);
      setSidebarConfig(res.data);
      toast.success("تم تطبيق إعدادات المظهر بنجاح ✨");
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLabelChange = (id, newLabel) =>
    setModalSidebarData((prev) => ({
      ...prev,
      customLabels: { ...prev.customLabels, [id]: newLabel },
    }));

  const moveCategory = (categoryId, direction) => {
    setModalSidebarData((prev) => {
      const newOrder = [...prev.categoryOrder];
      const index = newOrder.indexOf(categoryId);
      if (index === -1) return prev;
      if (direction === "up" && index > 0)
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      else if (direction === "down" && index < newOrder.length - 1)
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      return { ...prev, categoryOrder: newOrder };
    });
  };

  const moveItem = (categoryId, itemId, direction) => {
    setModalSidebarData((prev) => {
      const categoryConfig = DEFAULT_MENU_CATEGORIES.find((c) => c.id === categoryId);
      if (!categoryConfig) return prev;
      const currentOrder = prev.itemOrder[categoryId] || categoryConfig.items.map((i) => i.id);
      const index = currentOrder.indexOf(itemId);
      if (index === -1) return prev;
      const newOrder = [...currentOrder];
      if (direction === "up" && index > 0)
        [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      else if (direction === "down" && index < newOrder.length - 1)
        [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      return { ...prev, itemOrder: { ...prev.itemOrder, [categoryId]: newOrder } };
    });
  };

  const sortedCategories = [...DEFAULT_MENU_CATEGORIES].sort((a, b) => {
    let indexA = modalSidebarData.categoryOrder.indexOf(a.id);
    let indexB = modalSidebarData.categoryOrder.indexOf(b.id);
    if (indexA === -1) indexA = 999;
    if (indexB === -1) indexB = 999;
    return indexA - indexB;
  });

  const getSortedItems = (category) => {
    const order = modalSidebarData.itemOrder[category.id] || category.items.map((i) => i.id);
    return [...category.items].sort((a, b) => {
      let indexA = order.indexOf(a.id);
      let indexB = order.indexOf(b.id);
      if (indexA === -1) indexA = 999;
      if (indexB === -1) indexB = 999;
      return indexA - indexB;
    });
  };

  const saveMenuModalChanges = async () => {
    setIsMenuSaving(true);
    try {
      const updatedSidebar = {
        ...localSidebar,
        logoUrl: modalSidebarData.logoUrl,
        categoryOrder: modalSidebarData.categoryOrder,
        itemOrder: modalSidebarData.itemOrder,
        customLabels: modalSidebarData.customLabels,
      };
      const res = await api.put("/settings/sidebar", updatedSidebar);
      setLocalSidebar(res.data);
      setSidebarConfig(res.data);
      toast.success("تم حفظ الهيكلة وترتيب الشاشات بنجاح 🎉");
    } catch (error) {
      toast.error("حدث خطأ أثناء الحفظ");
    } finally {
      setIsMenuSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-5 font-cairo max-w-6xl mx-auto animate-in fade-in" dir="rtl">
      <div className="mb-5 bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-gradient-to-l from-[#071927] to-[#0f6d7c] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#d9b85b] text-[#083646] flex items-center justify-center shadow-sm">
              <ListOrdered className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[15px] md:text-[16px] font-extrabold" style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.28)" }}>الهيكلة وترتيب القوائم</div>
              <div className="text-[11px] font-bold mt-1" style={{ color: "rgba(255,255,255,0.92)" }}>إعادة تسمية الشاشات وترتيب الأقسام</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[22px] border border-[#d8e6ee] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#d8e6ee] bg-[#f7fbfd] flex items-center justify-between gap-3">
          <div>
            <h4 className="text-[15px] font-black text-[#123B5D]">تخصيص الهيكلة</h4>
            <p className="text-[11px] font-bold text-[#7b90a5] mt-1">يمكنك تعديل أسماء الأقسام والصفحات وترتيبها مباشرة من هنا.</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-[#fbf7ef] text-[#c49b3d] border border-[#ecd8a6] flex items-center justify-center">
            <ListOrdered className="w-5 h-5" />
          </div>
        </div>

        <div className="p-6 space-y-6 bg-[#f7fbfd]">
          <div className="bg-white rounded-[22px] p-5 border border-[#d8e6ee] shadow-sm space-y-4">
            {sortedCategories.map((category, catIndex) => (
              <div key={category.id} className="border-2 border-[#e7eef2] rounded-xl p-4 bg-[#f7fbfd]/30">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#d8e6ee]">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => moveCategory(category.id, "up")} disabled={catIndex === 0} className="text-[#8aa0b4] hover:text-[#0f6d7c] disabled:opacity-20 bg-white border border-[#d8e6ee] rounded p-0.5">
                      <ChevronUp size={12} />
                    </button>
                    <button onClick={() => moveCategory(category.id, "down")} disabled={catIndex === sortedCategories.length - 1} className="text-[#8aa0b4] hover:text-[#0f6d7c] disabled:opacity-20 bg-white border border-[#d8e6ee] rounded p-0.5">
                      <ChevronDown size={12} />
                    </button>
                  </div>
                  <category.icon size={16} className="text-[#123B5D]" />
                  <input type="text" value={modalSidebarData.customLabels[category.id] ?? category.title} onChange={(e) => handleLabelChange(category.id, e.target.value)} className="font-black text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 w-full max-w-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {getSortedItems(category).map((item, itemIndex, arr) => (
                    <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-[#d8e6ee] hover:border-blue-300 group">
                      <div className="flex flex-col gap-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => moveItem(category.id, item.id, "up")} disabled={itemIndex === 0} className="text-[#71839a] hover:text-[#0f6d7c] disabled:opacity-20">
                          <ChevronUp size={12} />
                        </button>
                        <button onClick={() => moveItem(category.id, item.id, "down")} disabled={itemIndex === arr.length - 1} className="text-[#71839a] hover:text-[#0f6d7c] disabled:opacity-20">
                          <ChevronDown size={12} />
                        </button>
                      </div>
                      <Edit2 size={10} className="text-[#8aa0b4]" />
                      <input type="text" value={modalSidebarData.customLabels[item.id] ?? item.label} onChange={(e) => handleLabelChange(item.id, e.target.value)} className="text-[11px] font-bold text-[#123B5D] w-full focus:outline-none bg-transparent" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-[#d8e6ee] bg-white flex-wrap">
          <button
            onClick={saveSidebarSettings}
            disabled={isSaving}
            className="bg-[#eef5f8] text-[#123B5D] px-5 py-2.5 rounded-xl font-black text-xs border border-[#d8e6ee] hover:bg-[#e4eef3] flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ إعدادات العرض
          </button>

          <button
            onClick={saveMenuModalChanges}
            disabled={isMenuSaving}
            className="bg-[#083646] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-[#0f6d7c] flex items-center gap-2 disabled:opacity-50"
          >
            {isMenuSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التعديلات الشاملة
          </button>
        </div>
      </div>
    </div>
  );
}
