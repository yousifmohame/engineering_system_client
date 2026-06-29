import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  PenLine,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Ban,
  Loader2,
  Check,
  CheckSquare,
  Square,
} from "lucide-react";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
}) => (
  <span
    className={`inline-flex min-w-0 items-center justify-center gap-1.5 ${className}`}
  >
    {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
    {text && (
      <span
        className={
          textClassName ||
          "min-w-0 break-words text-[10px] font-black leading-tight"
        }
      >
        {text}
      </span>
    )}
  </span>
);

const CATEGORIES_MAP = {
  "خدمات هندسية": "bg-blue-50/80 text-blue-700 border border-blue-100",
  "خدمات عقارية": "bg-emerald-50/80 text-emerald-700 border border-emerald-100",
  "خدمات قانونية": "bg-rose-50/80 text-rose-700 border border-rose-100",
  استشارات: "bg-violet-50/80 text-violet-700 border border-violet-100",
  أخرى: "bg-slate-50/80 text-slate-700 border border-slate-200",
};

const QuotationsItems = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'bundles'
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubCat, setFilterSubCat] = useState("all");
  const [filterCat, setFilterCat] = useState("all");

  // Modals States
  const [editingItem, setEditingItem] = useState(null);
  const [editingBundle, setEditingBundle] = useState(null);
  const [bundleSearchTerm, setBundleSearchTerm] = useState(""); // 👈 حالة بحث البنود داخل المودال

  // ==========================================
  // API Calls
  // ==========================================
  const { data: dbItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["quotation-items"],
    queryFn: async () => {
      const res = await axios.get("/quotation-library/items");
      return res.data.data.map((i) => ({
        id: i.code,
        title: i.title,
        desc: i.description,
        category: i.category,
        subCategory: i.subCategory,
        unit: i.unit,
        price: i.price,
        editable: i.isEditable,
        isActive: i.isActive,
        warning: i.warningText,
        uses: i.usesCount,
      }));
    },
  });

  const { data: dbBundles = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ["quotation-bundles"],
    queryFn: async () => {
      const res = await axios.get("/quotation-library/bundles");
      return res.data.data.map((b) => ({
        id: b.code,
        title: b.title,
        desc: b.description,
        icon: b.icon,
        color: b.color,
        items: b.itemsIds,
        isActive: b.isActive,
        uses: b.usesCount,
      }));
    },
  });

  const saveItemMutation = useMutation({
    mutationFn: async (payload) =>
      axios.post("/quotation-library/items", payload),
    onSuccess: () => {
      toast.success("تم حفظ البند بنجاح");
      queryClient.invalidateQueries(["quotation-items"]);
      setEditingItem(null);
    },
  });

  const toggleItemMutation = useMutation({
    mutationFn: async (id) =>
      axios.patch(`/quotation-library/items/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries(["quotation-items"]),
  });

  const saveBundleMutation = useMutation({
    mutationFn: async (payload) =>
      axios.post("/quotation-library/bundles", payload),
    onSuccess: () => {
      toast.success("تم حفظ المجموعة بنجاح");
      queryClient.invalidateQueries(["quotation-bundles"]);
      setEditingBundle(null);
    },
  });

  // ==========================================
  // الفلاتر الرئيسية
  // ==========================================
  const filteredItems = dbItems.filter((item) => {
    const matchSearch =
      item.title.includes(searchTerm) || item.id.includes(searchTerm);
    const matchSubCat =
      filterSubCat === "all" || item.subCategory === filterSubCat;
    const matchCat = filterCat === "all" || item.category === filterCat;
    return matchSearch && matchSubCat && matchCat;
  });

  const filteredBundles = dbBundles.filter(
    (b) => b.title.includes(searchTerm) || b.id.includes(searchTerm),
  );

  const getItemDetails = (id) =>
    dbItems.find((i) => i.id === id) || {
      title: "بند غير معروف",
      price: 0,
      category: "عام",
    };

  // ==========================================
  // 1. مودال إضافة/تعديل بند (Liquid Glass)
  // ==========================================
  const renderItemModal = () => {
    if (!editingItem) return null;
    const isNew = editingItem.id === "NEW";
    const item = editingItem;

    return (
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
        dir="rtl"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 w-full max-w-[600px] max-h-[90vh] overflow-y-auto custom-scrollbar shadow-[0_20px_60px_-15px_rgba(18,63,89,0.3)]">
          <div className="flex justify-between items-center mb-5 border-b border-slate-200/50 pb-3">
            <div className="text-[14px] font-black text-[#123f59] flex items-center gap-2">
              <span className="p-1.5 bg-gradient-to-br from-orange-500 to-rose-500 rounded-lg text-white shadow-sm">
                <PenLine className="w-4 h-4" />
              </span>
              {isNew
                ? "إنشاء بند جديد لمكتبة التسعير"
                : `تعديل خصائص البند — ${item.id}`}
            </div>
            <button
              onClick={() => setEditingItem(null)}
              className="p-1.5 bg-white/50 hover:bg-white rounded-xl text-slate-500 transition-colors shadow-2xs border border-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  العنوان المختصر للبند
                </label>
                <input
                  value={item.title}
                  onChange={(e) =>
                    setEditingItem({ ...item, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#d8b46a] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  كود البند (آلي)
                </label>
                <input
                  readOnly
                  value={isNew ? "توليد تلقائي عند الحفظ" : item.id}
                  className="w-full p-2.5 bg-slate-100/50 border border-slate-200/50 rounded-xl text-xs font-mono font-bold text-slate-500 outline-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                الوصف التفصيلي (يظهر في العرض التفصيلي للعميل)
              </label>
              <textarea
                value={item.desc || ""}
                onChange={(e) =>
                  setEditingItem({ ...item, desc: e.target.value })
                }
                rows={3}
                placeholder="شرح مفصل لنطاق العمل الخاص بهذا البند..."
                className="w-full p-3 bg-white/60 border border-white/80 focus:border-[#d8b46a] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm resize-y"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  القسم الرئيسي
                </label>
                <select
                  value={item.category}
                  onChange={(e) =>
                    setEditingItem({ ...item, category: e.target.value })
                  }
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#d8b46a] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm"
                >
                  <option value="خدمات عقارية">خدمات عقارية</option>
                  <option value="خدمات هندسية">خدمات هندسية</option>
                  <option value="خدمات قانونية">خدمات قانونية</option>
                  <option value="استشارات">استشارات</option>
                  <option value="أخرى">أخرى</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  وحدة القياس
                </label>
                <input
                  value={item.unit}
                  onChange={(e) =>
                    setEditingItem({ ...item, unit: e.target.value })
                  }
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#d8b46a] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm text-center"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  السعر الافتراضي (ر.س)
                </label>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    setEditingItem({ ...item, price: Number(e.target.value) })
                  }
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#d8b46a] focus:bg-white rounded-xl text-xs font-mono font-black text-[#123f59] outline-none transition-all shadow-sm dir-ltr text-right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200/50 pt-4 mt-2">
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  التصنيف الفرعي
                </label>
                <input
                  list="item-groups-list"
                  value={item.subCategory || ""}
                  onChange={(e) =>
                    setEditingItem({ ...item, subCategory: e.target.value })
                  }
                  placeholder="مثال: رخص وأمانة"
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#d8b46a] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm"
                />
                <datalist id="item-groups-list">
                  <option value="رخص وأمانة" />
                  <option value="خدمات مساحية" />
                  <option value="مستندات داعمة" />
                  <option value="إفراغ عقاري" />
                  <option value="تقييم" />
                </datalist>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-2 ml-1">
                  صلاحيات وتفعيل
                </label>
                <div className="flex gap-4 p-2.5 bg-white/40 border border-white/60 rounded-xl shadow-xs">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#123f59] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.editable}
                      onChange={(e) =>
                        setEditingItem({ ...item, editable: e.target.checked })
                      }
                      className="w-4 h-4 text-orange-600 rounded border-slate-300 focus:ring-orange-500"
                    />{" "}
                    السعر مرن
                  </label>
                  <label className="flex items-center gap-2 text-[10px] font-black text-[#123f59] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(e) =>
                        setEditingItem({ ...item, isActive: e.target.checked })
                      }
                      className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                    />{" "}
                    البند نشط
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-rose-500 mb-1.5 ml-1">
                ملاحظات / استثناءات تحذيرية (تطبع مع البند)
              </label>
              <textarea
                value={item.warning || ""}
                onChange={(e) =>
                  setEditingItem({ ...item, warning: e.target.value })
                }
                rows={2}
                placeholder="مثال: لا يشمل رسوم إصدار الرخص الحكومية..."
                className="w-full p-3 bg-rose-50/50 border border-rose-200/50 focus:border-rose-400 focus:bg-rose-50 rounded-xl text-xs font-bold text-rose-700 outline-none transition-all shadow-sm resize-y"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-5 mt-4 border-t border-slate-200/50">
            <button
              onClick={() => setEditingItem(null)}
              className="px-5 py-2.5 bg-white/50 text-slate-600 border border-slate-200 rounded-xl text-xs font-black hover:bg-white shadow-sm transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={() => saveItemMutation.mutate(item)}
              disabled={saveItemMutation.isPending}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl text-xs font-black shadow-[0_8px_16px_rgba(249,115,22,0.2)] hover:shadow-[0_8px_20px_rgba(249,115,22,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saveItemMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}{" "}
              اعتماد وحفظ
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 2. مودال إضافة/تعديل مجموعة (البحث والاختيار المتعدد) - Liquid Glass
  // ==========================================
  const renderBundleModal = () => {
    if (!editingBundle) return null;
    const isNew = editingBundle.id === "NEW";
    const bdl = editingBundle;

    // تصفية البنود المتاحة بناءً على حقل البحث الداخلي للمودال
    const availableItemsFiltered = dbItems.filter(
      (i) =>
        i.title.includes(bundleSearchTerm) || i.id.includes(bundleSearchTerm),
    );

    const toggleItemInBundle = (itemId) => {
      if (bdl.items.includes(itemId)) {
        setEditingBundle({
          ...bdl,
          items: bdl.items.filter((id) => id !== itemId),
        });
      } else {
        setEditingBundle({ ...bdl, items: [...bdl.items, itemId] });
      }
    };

    return (
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300"
        dir="rtl"
      >
        <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-5 w-full max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_60px_-15px_rgba(18,63,89,0.3)]">
          <div className="flex justify-between items-center mb-4 shrink-0">
            <div className="text-[14px] font-black text-[#123f59] flex items-center gap-2">
              <span className="p-1.5 bg-gradient-to-br from-[#123f59] to-[#0e7490] rounded-lg text-[#d8b46a] shadow-sm">
                <Package className="w-4 h-4" />
              </span>
              {isNew
                ? "بناء مجموعة بنود جديدة (Bundle)"
                : `تحديث الباندل — ${bdl.id}`}
            </div>
            <button
              onClick={() => {
                setEditingBundle(null);
                setBundleSearchTerm("");
              }}
              className="p-1.5 bg-white/50 hover:bg-white rounded-xl text-slate-500 transition-colors shadow-2xs border border-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-y-auto custom-scrollbar flex-1 pr-1 space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-3">
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  اسم المجموعة المجمعة
                </label>
                <input
                  value={bdl.title}
                  onChange={(e) =>
                    setEditingBundle({ ...bdl, title: e.target.value })
                  }
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#0e7490] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm"
                  placeholder="مثال: باقة تأسيس الشركات..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                  أيقونة (Emoji)
                </label>
                <input
                  value={bdl.icon}
                  onChange={(e) =>
                    setEditingBundle({ ...bdl, icon: e.target.value })
                  }
                  className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#0e7490] focus:bg-white rounded-xl text-base outline-none transition-all shadow-sm text-center"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-500 mb-1.5 ml-1">
                وصف تسويقي للمجموعة
              </label>
              <input
                value={bdl.desc || ""}
                onChange={(e) =>
                  setEditingBundle({ ...bdl, desc: e.target.value })
                }
                className="w-full p-2.5 bg-white/60 border border-white/80 focus:border-[#0e7490] focus:bg-white rounded-xl text-xs font-bold text-[#123f59] outline-none transition-all shadow-sm"
                placeholder="وصف قصير لمحتوى الباقة..."
              />
            </div>

            {/* نظام البحث والاختيار المتعدد الجديد */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200/60 pt-4">
              {/* القائمة المتاحة مع البحث */}
              <div className="flex flex-col bg-slate-50/50 rounded-2xl border border-slate-200/50 overflow-hidden h-[280px]">
                <div className="p-2 border-b border-slate-200/50 bg-white/50 backdrop-blur-sm shrink-0 relative">
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="ابحث لاختيار البنود..."
                    value={bundleSearchTerm}
                    onChange={(e) => setBundleSearchTerm(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-bold outline-none focus:border-[#0e7490]"
                  />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-2 space-y-1.5">
                  {availableItemsFiltered.map((item) => {
                    const isSelected = bdl.items.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleItemInBundle(item.id)}
                        className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all border ${isSelected ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-white border-white hover:border-slate-200 hover:bg-slate-50 shadow-2xs"}`}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black truncate">
                            {item.title}
                          </p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                            {item.price.toLocaleString()} ر.س
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  {availableItemsFiltered.length === 0 && (
                    <div className="text-center p-4 text-[10px] font-bold text-slate-400">
                      لا توجد بنود تطابق بحثك.
                    </div>
                  )}
                </div>
              </div>

              {/* قائمة البنود المحددة (سلة الباندل) */}
              <div className="flex flex-col bg-white/60 rounded-2xl border border-white/80 shadow-sm h-[280px] overflow-hidden">
                <div className="p-3 border-b border-slate-200/50 bg-[#fbf8f1]/50 backdrop-blur-sm shrink-0 flex justify-between items-center">
                  <span className="text-[11px] font-black text-[#123f59]">
                    سلة بنود المجموعة
                  </span>
                  <span className="px-2 py-0.5 bg-[#123f59] text-white rounded-md text-[9px] font-mono font-bold">
                    {bdl.items.length} محدد
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-2 space-y-1.5">
                  {bdl.items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                      <Package className="w-8 h-8 mb-2" />
                      <span className="text-[10px] font-bold text-center px-4">
                        استخدم قائمة البحث لإضافة بنود لهذه المجموعة.
                      </span>
                    </div>
                  ) : (
                    bdl.items.map((itemId, idx) => {
                      const itemData = getItemDetails(itemId);
                      return (
                        <div
                          key={idx}
                          className="flex min-w-0 items-center gap-2 p-2 bg-white border border-slate-100 rounded-xl shadow-2xs group hover:border-rose-100 transition-colors"
                        >
                          <span className="text-slate-300 font-mono text-[9px] w-3 shrink-0">
                            {idx + 1}
                          </span>
                          <span className="flex-1 font-bold text-[#123f59] text-[10px] truncate">
                            {itemData.title}
                          </span>
                          <span className="font-mono text-[#0e7490] font-black text-[10px] bg-cyan-50 px-1.5 py-0.5 rounded">
                            {itemData.price.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleItemInBundle(itemId);
                            }}
                            className="text-slate-300 hover:text-rose-500 bg-slate-50 hover:bg-rose-50 p-1 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
                {bdl.items.length > 0 && (
                  <div className="p-2.5 border-t border-slate-200/50 bg-slate-50/50 shrink-0 flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-500">
                      الإجمالي للمجموعة:
                    </span>
                    <span className="text-[13px] font-black text-emerald-600 font-mono">
                      {bdl.items
                        .reduce((s, id) => s + getItemDetails(id).price, 0)
                        .toLocaleString()}{" "}
                      ر.س
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-slate-200/50 shrink-0">
            <button
              onClick={() => {
                setEditingBundle(null);
                setBundleSearchTerm("");
              }}
              className="px-5 py-2.5 bg-white/50 text-slate-600 border border-slate-200 rounded-xl text-xs font-black hover:bg-white shadow-sm transition-all"
            >
              إلغاء
            </button>
            <button
              onClick={() => saveBundleMutation.mutate(bdl)}
              disabled={saveBundleMutation.isPending || bdl.items.length === 0}
              className="px-6 py-2.5 bg-gradient-to-r from-[#123f59] to-[#0e7490] text-white rounded-xl text-xs font-black shadow-[0_8px_16px_rgba(18,63,89,0.2)] hover:shadow-[0_8px_20px_rgba(18,63,89,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saveBundleMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-[#d8b46a]" />
              )}{" "}
              حفظ الباندل
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Render Main Page (Liquid Glass & Scroll Fix)
  // ==========================================
  return (
    // الغلاف الخارجي مع سكرول رئيسي وهيكل زجاجي سائل
    <div
      className="h-full w-full overflow-y-auto custom-scrollbar bg-gradient-to-br from-[#f4f1ea] via-[#edf0f2] to-[#e4e9ec]"
      dir="rtl"
    >
      <div className="p-4 md:p-6 font-[Tajawal] max-w-7xl mx-auto space-y-5 animate-in fade-in duration-500">
        {/* الهيدر الرئيسي للمكتبة */}
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_0_rgba(18,63,89,0.04)] rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-xl font-black text-[#123f59] flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-[#123f59] to-[#0e7490] rounded-xl text-white shadow-md">
                <Package className="w-5 h-5" />
              </span>
              المكتبة المركزية للبنود والمجموعات
              <span className="px-2 py-1 bg-[#123f59]/5 text-[#123f59] border border-[#123f59]/10 rounded-lg text-[10px] font-mono font-bold tracking-widest hidden sm:inline-block">
                815-I01
              </span>
            </div>
            <div className="text-xs font-bold text-slate-500 mt-2 ml-14">
              إدارة وتحديث الأسعار القياسية ومجموعات البيع (الباندل) المتاحة
              للإدراج في عروض الأسعار.
            </div>
          </div>
          <button
            onClick={() =>
              activeTab === "items"
                ? setEditingItem({
                    id: "NEW",
                    title: "",
                    desc: "",
                    price: 0,
                    category: "خدمات هندسية",
                    subCategory: "",
                    unit: "خدمة",
                    editable: true,
                    isActive: true,
                  })
                : setEditingBundle({
                    id: "NEW",
                    title: "",
                    icon: "📦",
                    desc: "",
                    items: [],
                  })
            }
            className="px-5 py-2.5 bg-gradient-to-l from-orange-500 to-rose-500 text-white rounded-2xl text-[11px] font-black flex items-center gap-2 hover:shadow-[0_8px_20px_rgba(249,115,22,0.25)] hover:-translate-y-0.5 transition-all w-full md:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />{" "}
            {activeTab === "items" ? "إضافة بند مفرد جديد" : "تجميع باندل جديد"}
          </button>
        </div>

        {/* لوحة التحكم والتبويبات */}
        <div className="bg-white/50 backdrop-blur-md border border-white/80 rounded-3xl p-2 flex flex-col sm:flex-row gap-3 shadow-sm">
          <div className="flex bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50 w-full sm:w-fit">
            <button
              onClick={() => setActiveTab("items")}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-[11px] font-black rounded-xl transition-all ${activeTab === "items" ? "bg-white text-orange-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
            >
              قاعدة البنود ({dbItems.length})
            </button>
            <button
              onClick={() => setActiveTab("bundles")}
              className={`flex-1 sm:flex-none px-6 py-2.5 text-[11px] font-black rounded-xl transition-all ${activeTab === "bundles" ? "bg-white text-violet-600 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`}
            >
              المجموعات الاستراتيجية ({dbBundles.length})
            </button>
          </div>

          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                placeholder="بحث سريع باسم أو كود..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full py-2.5 pr-10 pl-4 bg-white/70 border border-white focus:bg-white rounded-2xl text-[11px] font-bold outline-none focus:border-[#d8b46a] focus:ring-4 focus:ring-[#d8b46a]/10 transition-all shadow-2xs"
              />
            </div>
            {activeTab === "items" && (
              <>
                <select
                  value={filterSubCat}
                  onChange={(e) => setFilterSubCat(e.target.value)}
                  className="hidden md:block w-[140px] p-2.5 bg-white/70 border border-white rounded-2xl text-[11px] font-bold outline-none focus:border-[#d8b46a] shadow-2xs cursor-pointer"
                >
                  <option value="all">التصنيف الفرعي (الكل)</option>
                  <option value="رخص وأمانة">رخص وأمانة</option>
                  <option value="خدمات مساحية">خدمات مساحية</option>
                  <option value="مستندات داعمة">مستندات داعمة</option>
                </select>
                <select
                  value={filterCat}
                  onChange={(e) => setFilterCat(e.target.value)}
                  className="hidden md:block w-[140px] p-2.5 bg-white/70 border border-white rounded-2xl text-[11px] font-bold outline-none focus:border-[#d8b46a] shadow-2xs cursor-pointer"
                >
                  <option value="all">فئة البند (الكل)</option>
                  <option value="خدمات عقارية">خدمات عقارية</option>
                  <option value="خدمات هندسية">خدمات هندسية</option>
                  <option value="خدمات قانونية">خدمات قانونية</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* عرض المحتوى (البنود أو المجموعات) */}
        {itemsLoading || bundlesLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-[#0e7490] mb-3" />
            <p className="text-xs font-black text-[#123f59]">
              جاري تهيئة ومزامنة قاعدة بيانات المكتبة...
            </p>
          </div>
        ) : activeTab === "items" ? (
          <div className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_10px_40px_-10px_rgba(18,63,89,0.08)] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200/60">
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                      كود النظام
                    </th>
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                      المسمى التفصيلي للبند
                    </th>
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                      التصنيف الهيكلي
                    </th>
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                      القياس
                    </th>
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider">
                      التسعير (ر.س)
                    </th>
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider text-center">
                      الاستخدام
                    </th>
                    <th className="p-3 text-[10px] text-slate-500 font-black uppercase tracking-wider text-center">
                      الإدارة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/50">
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-white/80 transition-colors ${!item.isActive ? "opacity-40 grayscale-[30%]" : ""}`}
                    >
                      <td className="p-3 text-[10px] font-mono font-black text-[#0e7490]">
                        {item.id}
                      </td>
                      <td className="p-3 max-w-[300px]">
                        <div className="font-black text-[11px] text-[#123f59] truncate">
                          {item.title}
                        </div>
                        {item.desc && (
                          <div className="text-[9px] text-slate-500 mt-1 truncate">
                            {item.desc}
                          </div>
                        )}
                        {item.warning && (
                          <div className="text-[8px] text-rose-600 flex items-center gap-1 mt-1.5 bg-rose-50 w-fit px-2 py-0.5 rounded-md border border-rose-100">
                            <AlertTriangle className="w-3 h-3" /> {item.warning}
                          </div>
                        )}
                      </td>
                      <td className="p-3 space-y-1.5">
                        <div
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-black w-fit ${CATEGORIES_MAP[item.category] || CATEGORIES_MAP["أخرى"]}`}
                        >
                          {item.category}
                        </div>
                        <div className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold w-fit border border-slate-200">
                          {item.subCategory || "عام"}
                        </div>
                      </td>
                      <td className="p-3 text-[10px] font-bold text-slate-600">
                        {item.unit}
                      </td>
                      <td className="p-3 text-[12px] font-black text-[#123f59] font-mono">
                        {item.price.toLocaleString()}
                      </td>
                      <td className="p-3 text-center text-[10px] text-slate-400 font-mono font-bold">
                        {item.uses}
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-1.5">
                          <button
                            onClick={() => setEditingItem(item)}
                            title="تحرير البند"
                            className="p-2 bg-white border border-slate-200 text-orange-500 rounded-xl hover:bg-orange-50 hover:border-orange-200 transition-colors shadow-2xs"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleItemMutation.mutate(item.id)}
                            title={item.isActive ? "إيقاف وتجميد" : "تفعيل"}
                            className={`p-2 bg-white border rounded-xl transition-colors shadow-2xs ${item.isActive ? "border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200" : "border-emerald-200 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"}`}
                          >
                            <Ban className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredItems.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-slate-400 text-xs font-bold"
                      >
                        لم يتم العثور على أي بنود تطابق معايير البحث.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBundles.map((bdl) => (
              <div
                key={bdl.id}
                className="bg-white/60 backdrop-blur-2xl rounded-3xl border border-white shadow-[0_10px_40px_-10px_rgba(18,63,89,0.06)] p-5 hover:shadow-[0_15px_45px_-10px_rgba(18,63,89,0.1)] transition-all relative overflow-hidden group"
              >
                <div
                  className={`absolute top-0 right-0 w-2 h-full bg-${bdl.color}-500 opacity-80`}
                />
                <div className="flex items-start gap-4 mb-4 pl-2">
                  <div
                    className={`w-12 h-12 shrink-0 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-${bdl.color}-100`}
                  >
                    {bdl.icon}
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 bg-${bdl.color}-50 text-${bdl.color}-700 border border-${bdl.color}-100 rounded-md text-[9px] font-mono font-black`}
                      >
                        {bdl.id}
                      </span>
                      <h3 className="font-black text-sm text-[#123f59] truncate">
                        {bdl.title}
                      </h3>
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 truncate">
                      {bdl.desc || "مجموعة بنود مجهزة للاستخدام السريع"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50/80 rounded-2xl p-3 mb-4 border border-slate-100 space-y-1.5 h-[130px] overflow-y-auto custom-scrollbar-slim">
                  {bdl.items.map((itemId, idx) => {
                    const itemData = getItemDetails(itemId);
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[10px] py-1.5 border-b border-slate-200/50 last:border-0 hover:bg-white px-2 rounded-lg transition-colors"
                      >
                        <span className="text-slate-600 truncate flex-1 font-bold">
                          <span className="text-slate-300 font-mono ml-1.5">
                            {idx + 1}.
                          </span>{" "}
                          {itemData.title}
                        </span>
                        <span className="font-black text-[#123f59] font-mono bg-white px-1.5 py-0.5 rounded border border-slate-100">
                          {itemData.price.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                  {bdl.items.length === 0 && (
                    <div className="text-center text-[10px] text-slate-400 font-bold mt-10">
                      المجموعة فارغة حالياً
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-200/60">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      إجمالي الباقة
                    </span>
                    <span className="text-base font-black text-emerald-600 font-mono">
                      {bdl.items
                        .reduce((s, id) => s + getItemDetails(id).price, 0)
                        .toLocaleString()}{" "}
                      <span className="text-[10px] text-slate-400 font-bold">
                        ر.س
                      </span>
                    </span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingBundle(bdl)}
                      className="px-4 py-2 bg-white border border-slate-200 text-[#123f59] rounded-xl text-[10px] font-black hover:bg-slate-50 shadow-2xs flex items-center gap-1.5"
                    >
                      <PenLine className="w-3.5 h-3.5 text-[#d8b46a]" /> تحرير
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {filteredBundles.length === 0 && (
              <div className="col-span-1 lg:col-span-2 p-12 text-center text-slate-400 text-xs font-bold bg-white/40 backdrop-blur-xl border border-white/60 rounded-3xl">
                لا توجد مجموعات مُسجلة في المكتبة.
              </div>
            )}
          </div>
        )}
      </div>

      {renderItemModal()}
      {renderBundleModal()}
    </div>
  );
};

export default QuotationsItems;
