import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Package,
  Plus,
  Search,
  ArrowRight,
  PenLine,
  Copy,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Ban,
  Loader2,
} from "lucide-react";

const CATEGORIES_MAP = {
  "خدمات هندسية": "bg-blue-50 text-blue-600",
  "خدمات عقارية": "bg-emerald-50 text-emerald-700",
  "خدمات قانونية": "bg-red-50 text-red-600",
  استشارات: "bg-purple-50 text-purple-600",
  أخرى: "bg-slate-50 text-slate-600",
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

  // ==========================================
  // API Calls
  // ==========================================

  // 1. جلب البنود
  const { data: dbItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["quotation-items"],
    queryFn: async () => {
      const res = await axios.get("/quotation-library/items");
      // تحويل صيغة الداتا لتناسب الواجهة
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

  // 2. جلب المجموعات
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

  // حفظ بند
  const saveItemMutation = useMutation({
    mutationFn: async (payload) =>
      axios.post("/quotation-library/items", payload),
    onSuccess: () => {
      toast.success("تم حفظ البند بنجاح");
      queryClient.invalidateQueries(["quotation-items"]);
      setEditingItem(null);
    },
  });

  // تعطيل/تفعيل بند
  const toggleItemMutation = useMutation({
    mutationFn: async (id) =>
      axios.patch(`/quotation-library/items/${id}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries(["quotation-items"]);
    },
  });

  // حفظ مجموعة
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
  // الفلاتر
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
  // المودال الخاص بالبنود
  // ==========================================
  const renderItemModal = () => {
    if (!editingItem) return null;
    const isNew = editingItem.id === "NEW";
    const item = editingItem;

    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl p-6 w-full max-w-[580px] max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-orange-600" />{" "}
              {isNew ? "إنشاء بند جديد" : `تعديل البند — ${item.id}`}
            </div>
            <button
              onClick={() => setEditingItem(null)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                العنوان المختصر
              </label>
              <input
                value={item.title}
                onChange={(e) =>
                  setEditingItem({ ...item, title: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                الكود
              </label>
              <input
                readOnly
                value={isNew ? "تلقائي" : item.id}
                className="w-full p-2 border border-slate-300 bg-slate-50 rounded-lg text-xs font-mono outline-none text-slate-500"
              />
            </div>
          </div>

          <div className="mb-3">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              الوصف التفصيلي
            </label>
            <textarea
              value={item.desc || ""}
              onChange={(e) =>
                setEditingItem({ ...item, desc: e.target.value })
              }
              rows={3}
              placeholder="وصف مفصّل يظهر في النموذج التفصيلي..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500 resize-y"
            />
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                الفئة (القسم الرئيسي)
              </label>
              <select
                value={item.category}
                onChange={(e) =>
                  setEditingItem({ ...item, category: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500"
              >
                <option value="خدمات عقارية">خدمات عقارية</option>
                <option value="خدمات هندسية">خدمات هندسية</option>
                <option value="خدمات قانونية">خدمات قانونية</option>
                <option value="استشارات">استشارات</option>
                <option value="أخرى">أخرى</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                الوحدة
              </label>
              <input
                value={item.unit}
                onChange={(e) =>
                  setEditingItem({ ...item, unit: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                السعر الافتراضي (ر.س)
              </label>
              <input
                type="number"
                value={item.price}
                onChange={(e) =>
                  setEditingItem({ ...item, price: Number(e.target.value) })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                التصنيف الفرعي
              </label>
              <input
                list="item-groups-list"
                value={item.subCategory || ""}
                onChange={(e) =>
                  setEditingItem({ ...item, subCategory: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500"
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
              <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                خيارات
              </label>
              <div className="flex gap-4 mt-2">
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.editable}
                    onChange={(e) =>
                      setEditingItem({ ...item, editable: e.target.checked })
                    }
                    className="w-3.5 h-3.5 text-orange-600 rounded"
                  />{" "}
                  السعر قابل للتعديل
                </label>
                <label className="flex items-center gap-1.5 text-[10px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(e) =>
                      setEditingItem({ ...item, isActive: e.target.checked })
                    }
                    className="w-3.5 h-3.5 text-orange-600 rounded"
                  />{" "}
                  نشط
                </label>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              ملاحظات قانونية / استثناءات (Warning)
            </label>
            <textarea
              value={item.warning || ""}
              onChange={(e) =>
                setEditingItem({ ...item, warning: e.target.value })
              }
              rows={2}
              placeholder="مثلاً: لا يشمل رسوم كتابة العدل..."
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500 resize-y text-orange-700"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setEditingItem(null)}
              className="px-5 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إغلاق
            </button>
            <button
              onClick={() => saveItemMutation.mutate(item)}
              disabled={saveItemMutation.isPending}
              className="px-5 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-orange-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveItemMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}{" "}
              حفظ البند
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // المودال الخاص بالمجموعات (Bundles)
  // ==========================================
  const renderBundleModal = () => {
    if (!editingBundle) return null;
    const isNew = editingBundle.id === "NEW";
    const bdl = editingBundle;

    const handleAddItemToBundle = (e) => {
      const selectedId = e.target.value;
      if (selectedId && !bdl.items.includes(selectedId)) {
        setEditingBundle({ ...bdl, items: [...bdl.items, selectedId] });
      }
      e.target.value = ""; // Reset select
    };

    const handleRemoveItemFromBundle = (itemId) => {
      setEditingBundle({
        ...bdl,
        items: bdl.items.filter((id) => id !== itemId),
      });
    };

    return (
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
        dir="rtl"
      >
        <div className="bg-white rounded-2xl p-6 w-full max-w-[640px] max-h-[85vh] overflow-y-auto shadow-2xl custom-scrollbar animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-4">
            <div className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-violet-600" />{" "}
              {isNew ? "إنشاء مجموعة جديدة" : `تعديل المجموعة — ${bdl.id}`}
            </div>
            <button
              onClick={() => setEditingBundle(null)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                اسم المجموعة
              </label>
              <input
                value={bdl.title}
                onChange={(e) =>
                  setEditingBundle({ ...bdl, title: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                الرمز (Emoji)
              </label>
              <input
                value={bdl.icon}
                onChange={(e) =>
                  setEditingBundle({ ...bdl, icon: e.target.value })
                }
                className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500 text-center"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              الوصف
            </label>
            <input
              value={bdl.desc || ""}
              onChange={(e) =>
                setEditingBundle({ ...bdl, desc: e.target.value })
              }
              className="w-full p-2 border border-slate-300 rounded-lg text-xs outline-none focus:border-violet-500"
            />
          </div>

          <div className="mb-5">
            <label className="block text-[12px] font-bold text-slate-700 mb-2">
              بنود المجموعة ({bdl.items.length} بند)
            </label>
            <div className="space-y-1.5 mb-2">
              {bdl.items.map((itemId, idx) => {
                const itemData = getItemDetails(itemId);
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-100 rounded-lg text-[10px]"
                  >
                    <span className="text-slate-400 font-mono w-4">
                      {idx + 1}
                    </span>
                    <span className="flex-1 font-bold text-slate-700 truncate">
                      {itemData.title}
                    </span>
                    <span className="font-mono text-blue-700 font-bold">
                      {itemData.price.toLocaleString()} ر.س
                    </span>
                    <button
                      onClick={() => handleRemoveItemFromBundle(itemId)}
                      className="text-red-400 hover:text-red-600 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
            <select
              onChange={handleAddItemToBundle}
              className="w-full p-2 border border-slate-300 rounded-lg text-[11px] outline-none text-slate-500"
            >
              <option value="">+ إضافة بند من المكتبة...</option>
              {dbItems.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.id} — {i.title} ({i.price} ر.س)
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => setEditingBundle(null)}
              className="px-5 py-2 bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200"
            >
              إغلاق
            </button>
            <button
              onClick={() => saveBundleMutation.mutate(bdl)}
              disabled={saveBundleMutation.isPending}
              className="px-5 py-2 bg-violet-600 text-white rounded-lg text-xs font-bold shadow-md hover:bg-violet-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              {saveBundleMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}{" "}
              حفظ المجموعة
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // Render Main Page
  // ==========================================
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50" dir="rtl">
      <div className="p-5 md:p-6 font-sans max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-5">
          <div>
            <div className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Package className="w-5 h-5 text-orange-600" /> البنود ومجموعات
              البنود
              <span className="px-2 py-0.5 bg-orange-50 text-orange-600 border border-orange-100 rounded text-[10px] font-mono font-bold">
                815-I01
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {dbItems.length} بند مفرد · {dbBundles.length} مجموعة
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
            className="px-4 py-2 bg-orange-600 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-orange-700 shadow-md shadow-orange-200 transition-colors"
          >
            <Plus className="w-4 h-4" />{" "}
            {activeTab === "items" ? "بند جديد" : "مجموعة جديدة"}
          </button>
        </div>

        <div className="flex gap-1 mb-5 border-b-2 border-slate-200">
          <button
            onClick={() => setActiveTab("items")}
            className={`px-6 py-2.5 text-xs font-bold transition-all border-x-2 border-t-2 rounded-t-lg -mb-[2px] ${activeTab === "items" ? "bg-white text-orange-600 border-slate-200 border-b-white" : "bg-transparent text-slate-400 border-transparent hover:text-slate-600"}`}
          >
            البنود المفردة ({dbItems.length})
          </button>
          <button
            onClick={() => setActiveTab("bundles")}
            className={`px-6 py-2.5 text-xs font-bold transition-all border-x-2 border-t-2 rounded-t-lg -mb-[2px] ${activeTab === "bundles" ? "bg-white text-violet-600 border-slate-200 border-b-white" : "bg-transparent text-slate-400 border-transparent hover:text-slate-600"}`}
          >
            المجموعات والـ Bundles ({dbBundles.length})
          </button>
        </div>

        <div className="flex gap-2 mb-4 items-center flex-wrap">
          <div className="flex-1 relative min-w-[200px]">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              placeholder="بحث بالكود أو الوصف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pr-9 pl-3 border border-slate-300 rounded-lg text-xs outline-none focus:border-orange-500"
            />
          </div>
          {activeTab === "items" && (
            <>
              <select
                value={filterSubCat}
                onChange={(e) => setFilterSubCat(e.target.value)}
                className="w-[140px] p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white"
              >
                <option value="all">كل التصنيفات</option>
                <option value="رخص وأمانة">رخص وأمانة</option>
                <option value="خدمات مساحية">خدمات مساحية</option>
                <option value="مستندات داعمة">مستندات داعمة</option>
              </select>
              <select
                value={filterCat}
                onChange={(e) => setFilterCat(e.target.value)}
                className="w-[140px] p-2 border border-slate-300 rounded-lg text-xs outline-none bg-white"
              >
                <option value="all">كل الفئات</option>
                <option value="خدمات عقارية">خدمات عقارية</option>
                <option value="خدمات هندسية">خدمات هندسية</option>
                <option value="خدمات قانونية">خدمات قانونية</option>
              </select>
            </>
          )}
        </div>

        {itemsLoading || bundlesLoading ? (
          <div className="flex justify-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : activeTab === "items" ? (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b-2 border-slate-200">
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الكود
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      البند
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      التصنيف الفرعي
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الفئة
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      الوحدة
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold">
                      السعر
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold text-center">
                      الاستخدام
                    </th>
                    <th className="p-2 text-[10px] text-slate-500 font-bold text-center">
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${!item.isActive ? "opacity-50 bg-slate-50" : ""}`}
                    >
                      <td className="p-2 text-[10px] font-mono font-bold text-orange-600">
                        {item.id}
                      </td>
                      <td className="p-2 max-w-[280px]">
                        <div className="font-bold text-[11px] text-slate-800">
                          {item.title}
                        </div>
                        {item.desc && (
                          <div className="text-[9px] text-slate-500 mt-1 line-clamp-1">
                            {item.desc}
                          </div>
                        )}
                        {item.warning && (
                          <div className="text-[8px] text-orange-700 flex items-center gap-1 mt-1 bg-orange-50 w-fit px-1.5 py-0.5 rounded">
                            <AlertTriangle className="w-2.5 h-2.5" />{" "}
                            {item.warning}
                          </div>
                        )}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                          {item.subCategory}
                        </span>
                      </td>
                      <td className="p-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold ${CATEGORIES_MAP[item.category] || CATEGORIES_MAP["أخرى"]}`}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="p-2 text-[10px] text-slate-600">
                        {item.unit}
                      </td>
                      <td className="p-2 text-[11px] font-bold text-blue-700 font-mono">
                        {item.price.toLocaleString()}
                      </td>
                      <td className="p-2 text-center text-[10px] text-slate-500 font-mono">
                        {item.uses}
                      </td>
                      <td className="p-2">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => setEditingItem(item)}
                            title="تعديل"
                            className="p-1.5 bg-orange-50 text-orange-600 rounded hover:bg-orange-100"
                          >
                            <PenLine className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleItemMutation.mutate(item.id)}
                            title={item.isActive ? "تعطيل" : "تفعيل"}
                            className={`p-1.5 rounded ${item.isActive ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
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
                        colSpan={8}
                        className="p-6 text-center text-slate-400 text-xs"
                      >
                        لا يوجد بنود
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredBundles.map((bdl) => (
              <div
                key={bdl.id}
                className={`p-4 bg-white rounded-xl border-y border-l border-r-4 border-slate-200 shadow-sm border-r-${bdl.color}-500 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{bdl.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-1.5 py-0.5 bg-${bdl.color}-50 text-${bdl.color}-600 rounded text-[9px] font-mono font-bold`}
                      >
                        {bdl.id}
                      </span>
                      <span className="font-bold text-sm text-slate-800">
                        {bdl.title}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {bdl.desc}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-2 mb-3 border border-slate-100">
                  {bdl.items.map((itemId, idx) => {
                    const itemData = getItemDetails(itemId);
                    return (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-[9px] py-1 border-b border-slate-200/60 last:border-0"
                      >
                        <span className="text-slate-600 truncate flex-1 pl-2">
                          <span className="text-slate-400 font-mono ml-1">
                            {idx + 1}.
                          </span>{" "}
                          {itemData.title}
                        </span>
                        <span className="font-bold text-blue-700 font-mono">
                          {itemData.price.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                  <div className="text-[9px] text-slate-400">
                    {bdl.items.length} بنود · استُخدم {bdl.uses} مرة
                  </div>
                  <div className="text-sm font-black text-blue-700">
                    {bdl.items
                      .reduce((s, id) => s + getItemDetails(id).price, 0)
                      .toLocaleString()}{" "}
                    ر.س
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => setEditingBundle(bdl)}
                    className="flex-1 py-1.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold hover:bg-slate-200 flex items-center justify-center gap-1.5"
                  >
                    <PenLine className="w-3 h-3" /> تعديل
                  </button>
                  <button className="flex-1 py-1.5 bg-red-50 text-red-600 rounded-md text-[10px] font-bold hover:bg-red-100 flex items-center justify-center gap-1.5">
                    <Ban className="w-3 h-3" /> تعطيل
                  </button>
                </div>
              </div>
            ))}
            {filteredBundles.length === 0 && (
              <div className="col-span-2 p-6 text-center text-slate-400 text-xs bg-white rounded-xl border border-slate-200">
                لا يوجد مجموعات
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
