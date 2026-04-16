import React, { useState, useEffect } from "react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { useAppStore } from "../../../stores/useAppStore";
import { DEFAULT_MENU_CATEGORIES } from "../../../constants/menuConstants";
import { LayoutTemplate, Loader2, Save, ListOrdered, ImageIcon, Upload, X, ChevronUp, ChevronDown, Edit2 } from "lucide-react";

export default function SidebarSettingsTab() {
  const [isSaving, setIsSaving] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [isMenuSaving, setIsMenuSaving] = useState(false);

  const { sidebarConfig, setSidebarConfig } = useAppStore();

  const [localSidebar, setLocalSidebar] = useState({
    bgColor: "#293241", textColor: "#cbd5e1", activeColor: "#2563eb", width: 280,
    logoUrl: "/logo.jpeg", categoryOrder: [], itemOrder: {}, customLabels: {},
  });

  const [modalSidebarData, setModalSidebarData] = useState({
    logoUrl: "/logo.jpeg", categoryOrder: [], itemOrder: {}, customLabels: {},
  });

  useEffect(() => {
    if (sidebarConfig) {
      const updated = {
        bgColor: sidebarConfig.bgColor || "#293241", textColor: sidebarConfig.textColor || "#cbd5e1",
        activeColor: sidebarConfig.activeColor || "#2563eb", width: sidebarConfig.width || 280,
        logoUrl: sidebarConfig.logoUrl || "/logo.jpeg",
        categoryOrder: sidebarConfig.categoryOrder?.length > 0 ? sidebarConfig.categoryOrder : DEFAULT_MENU_CATEGORIES.map(c => c.id),
        itemOrder: sidebarConfig.itemOrder || {}, customLabels: sidebarConfig.customLabels || {},
      };
      setLocalSidebar(updated);
    }
  }, [sidebarConfig]);

  useEffect(() => {
    if (isMenuModalOpen) {
      setModalSidebarData({
        logoUrl: localSidebar.logoUrl, categoryOrder: [...localSidebar.categoryOrder],
        itemOrder: { ...localSidebar.itemOrder }, customLabels: { ...localSidebar.customLabels },
      });
    }
  }, [isMenuModalOpen, localSidebar]);

  const saveSidebarSettings = async () => {
    setIsSaving(true);
    try {
      const res = await api.put("/settings/sidebar", localSidebar);
      setSidebarConfig(res.data);
      toast.success("تم تطبيق إعدادات المظهر بنجاح ✨");
    } catch (error) {
      toast.error(error.response?.data?.error || "حدث خطأ أثناء حفظ الإعدادات");
    } finally { setIsSaving(false); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData(); formData.append("logo", file);
    try {
      toast.info("جاري رفع الشعار...");
      const res = await api.post("/settings/upload-logo", formData, { headers: { "Content-Type": "multipart/form-data" }});
      setModalSidebarData(prev => ({ ...prev, logoUrl: res.data.logoUrl }));
      toast.success("تم رفع الشعار بنجاح ✓");
    } catch (error) { toast.error("فشل رفع الشعار"); }
  };

  const handleLabelChange = (id, newLabel) => setModalSidebarData(prev => ({ ...prev, customLabels: { ...prev.customLabels, [id]: newLabel } }));

  const moveCategory = (categoryId, direction) => {
    setModalSidebarData(prev => {
      const newOrder = [...prev.categoryOrder]; const index = newOrder.indexOf(categoryId);
      if (index === -1) return prev;
      if (direction === "up" && index > 0) [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      else if (direction === "down" && index < newOrder.length - 1) [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      return { ...prev, categoryOrder: newOrder };
    });
  };

  const moveItem = (categoryId, itemId, direction) => {
    setModalSidebarData(prev => {
      const categoryConfig = DEFAULT_MENU_CATEGORIES.find(c => c.id === categoryId);
      if (!categoryConfig) return prev;
      const currentOrder = prev.itemOrder[categoryId] || categoryConfig.items.map(i => i.id);
      const index = currentOrder.indexOf(itemId);
      if (index === -1) return prev;
      const newOrder = [...currentOrder];
      if (direction === "up" && index > 0) [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      else if (direction === "down" && index < newOrder.length - 1) [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];
      return { ...prev, itemOrder: { ...prev.itemOrder, [categoryId]: newOrder } };
    });
  };

  const sortedCategories = [...DEFAULT_MENU_CATEGORIES].sort((a, b) => {
    let indexA = modalSidebarData.categoryOrder.indexOf(a.id); let indexB = modalSidebarData.categoryOrder.indexOf(b.id);
    if (indexA === -1) indexA = 999; if (indexB === -1) indexB = 999; return indexA - indexB;
  });

  const getSortedItems = (category) => {
    const order = modalSidebarData.itemOrder[category.id] || category.items.map(i => i.id);
    return [...category.items].sort((a, b) => {
      let indexA = order.indexOf(a.id); let indexB = order.indexOf(b.id);
      if (indexA === -1) indexA = 999; if (indexB === -1) indexB = 999; return indexA - indexB;
    });
  };

  const saveMenuModalChanges = async () => {
    setIsMenuSaving(true);
    try {
      const updatedSidebar = { ...localSidebar, logoUrl: modalSidebarData.logoUrl, categoryOrder: modalSidebarData.categoryOrder, itemOrder: modalSidebarData.itemOrder, customLabels: modalSidebarData.customLabels };
      const res = await api.put("/settings/sidebar", updatedSidebar);
      setLocalSidebar(res.data); setSidebarConfig(res.data);
      toast.success("تم حفظ الهيكلة وترتيب الشاشات بنجاح 🎉");
      setIsMenuModalOpen(false);
    } catch (error) { toast.error("حدث خطأ أثناء الحفظ"); } finally { setIsMenuSaving(false); }
  };

  return (
    <div className="p-6 font-cairo max-w-5xl mx-auto animate-in fade-in" dir="rtl">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-blue-600" /> الألوان والمظهر العام</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">لون الخلفية الأساسي</label>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200"><input type="color" value={localSidebar.bgColor} onChange={e => setLocalSidebar({...localSidebar, bgColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer" /><span className="text-xs font-mono font-bold text-slate-500 uppercase">{localSidebar.bgColor}</span></div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">لون النصوص</label>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200"><input type="color" value={localSidebar.textColor} onChange={e => setLocalSidebar({...localSidebar, textColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer" /><span className="text-xs font-mono font-bold text-slate-500 uppercase">{localSidebar.textColor}</span></div>
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-700">لون التبويب النشط</label>
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200"><input type="color" value={localSidebar.activeColor} onChange={e => setLocalSidebar({...localSidebar, activeColor: e.target.value})} className="w-8 h-8 rounded-lg cursor-pointer" /><span className="text-xs font-mono font-bold text-slate-500 uppercase">{localSidebar.activeColor}</span></div>
            </div>
            <div className="md:col-span-3 mt-2 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-xs font-black text-slate-700">عرض القائمة الجانبية</label>
                <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{localSidebar.width}px</span>
              </div>
              <input type="range" min="200" max="400" step="5" value={localSidebar.width} onChange={e => setLocalSidebar({...localSidebar, width: parseInt(e.target.value)})} className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-blue-600" />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button onClick={saveSidebarSettings} disabled={isSaving} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-sm hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ المظهر
            </button>
          </div>
        </div>
      </div>

      <button onClick={() => setIsMenuModalOpen(true)} className="w-full bg-white border-2 border-blue-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 hover:border-blue-400 transition-all cursor-pointer group shadow-sm">
        <ListOrdered className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-black text-slate-800">تخصيص الهيكلة والترتيب الشامل</span>
        <span className="text-[11px] text-slate-500 font-bold mt-1">تغيير اللوجو • إعادة تسمية الشاشات • ترتيب الأقسام</span>
      </button>

      {/* ════════════ مودال الترتيب ═══════════ */}
      {isMenuModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuModalOpen(false)}>
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2"><ListOrdered className="w-5 h-5 text-blue-600" /> تخصيص هيكل النظام</h2>
              <button onClick={() => setIsMenuModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-xl"><X className="w-4 h-4 text-slate-500" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex gap-4 items-center">
                <img src={modalSidebarData.logoUrl} alt="Logo" className="h-16 w-16 rounded-xl border border-slate-200 object-contain p-1" />
                <label className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold cursor-pointer hover:bg-blue-100 text-xs flex items-center gap-2"><Upload size={14} /> رفع شعار جديد<input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} /></label>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                {sortedCategories.map((category, catIndex) => (
                  <div key={category.id} className="border-2 border-slate-100 rounded-xl p-4 bg-slate-50/30">
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-200">
                      <div className="flex flex-col gap-0.5">
                        <button onClick={() => moveCategory(category.id, "up")} disabled={catIndex===0} className="text-slate-400 hover:text-blue-600 disabled:opacity-20 bg-white border border-slate-200 rounded p-0.5"><ChevronUp size={12} /></button>
                        <button onClick={() => moveCategory(category.id, "down")} disabled={catIndex===sortedCategories.length-1} className="text-slate-400 hover:text-blue-600 disabled:opacity-20 bg-white border border-slate-200 rounded p-0.5"><ChevronDown size={12} /></button>
                      </div>
                      <category.icon size={16} className="text-slate-700" />
                      <input type="text" value={modalSidebarData.customLabels[category.id] ?? category.title} onChange={e => handleLabelChange(category.id, e.target.value)} className="font-black text-sm bg-white border border-slate-300 rounded-lg px-3 py-1.5 w-full max-w-sm focus:border-blue-500 outline-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {getSortedItems(category).map((item, itemIndex, arr) => (
                        <div key={item.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 hover:border-blue-300 group">
                          <div className="flex flex-col gap-0 opacity-40 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => moveItem(category.id, item.id, "up")} disabled={itemIndex===0} className="text-slate-500 hover:text-blue-600 disabled:opacity-20"><ChevronUp size={12}/></button>
                            <button onClick={() => moveItem(category.id, item.id, "down")} disabled={itemIndex===arr.length-1} className="text-slate-500 hover:text-blue-600 disabled:opacity-20"><ChevronDown size={12}/></button>
                          </div>
                          <Edit2 size={10} className="text-slate-400" />
                          <input type="text" value={modalSidebarData.customLabels[item.id] ?? item.label} onChange={e => handleLabelChange(item.id, e.target.value)} className="text-[11px] font-bold text-slate-700 w-full focus:outline-none bg-transparent" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white">
              <button onClick={() => setIsMenuModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200">إلغاء</button>
              <button onClick={saveMenuModalChanges} disabled={isMenuSaving} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50">
                {isMenuSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} حفظ التعديلات الشاملة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}