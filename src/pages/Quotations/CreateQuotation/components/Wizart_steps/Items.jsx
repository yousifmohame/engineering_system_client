import React, { useState } from "react";
import { Loader2, Plus, Trash2, Search, X, Package, CheckSquare, List as ListIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
// 🚨 تأكد من مسار الأكسيوس الصحيح لديك
import axios from "../../../../../api/axios"; 

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
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
};

// ==========================================
// الخطوة 3: البنود (النسخة المطورة مع المجموعات والضريبة)
// ==========================================
export const Step3Items = ({ props }) => {
  const {
    items,
    setItems,
    handleItemChange,
    removeItem,
    serverItems,
    libItemsLoading,
    subtotal,
  } = props;

  // حالات النافذة المنبثقة (Modal)
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'bundles'
  const [searchTerm, setSearchTerm] = useState("");
  
  // حالات التحديد المتعدد
  const [selectedItemIds, setSelectedItemIds] = useState([]);
  const [selectedBundleIds, setSelectedBundleIds] = useState([]);

  // جلب المجموعات (Bundles) المحفوظة في النظام
  const { data: dbBundles = [], isLoading: bundlesLoading } = useQuery({
    queryKey: ["quotation-bundles"],
    queryFn: async () => {
      const res = await axios.get("/quotation-library/bundles");
      return res.data.data;
    },
    enabled: showModal, // جلب البيانات فقط عند فتح المودال لتخفيف التحميل
  });

  // فلاتر البحث داخل المودال
  const filteredItems = (serverItems || []).filter((i) =>
    i.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBundles = dbBundles.filter((b) =>
    b.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // دوال التحديد المتعدد
  const toggleItemSelect = (id) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleBundleSelect = (id) => {
    setSelectedBundleIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🚀 دالة إضافة كافة البنود والمجموعات المحددة للجدول
  const handleAddSelected = () => {
    let newItems = [...items];

    // 1. استخراج وإضافة بنود المجموعات المحددة
    selectedBundleIds.forEach((bundleId) => {
      const bundle = dbBundles.find((b) => b.code === bundleId || b.id === bundleId);
      if (bundle && bundle.itemsIds) {
        bundle.itemsIds.forEach((itemId) => {
          const sItem = serverItems?.find((i) => i.code === itemId || i.id === itemId);
          if (sItem) {
            newItems.push({
              id: Date.now() + Math.random(), // ID فريد للجدول
              title: sItem.title,
              category: sItem.category || "عام",
              qty: 1,
              unit: sItem.unit || "وحدة",
              price: sItem.price || 0,
              discount: 0,
              taxRate: 15, // ضريبة افتراضية
            });
          }
        });
      }
    });

    // 2. إضافة البنود المفردة المحددة
    selectedItemIds.forEach((itemId) => {
      const sItem = serverItems?.find((i) => i.code === itemId || i.id === itemId);
      if (sItem) {
        newItems.push({
          id: Date.now() + Math.random(),
          title: sItem.title,
          category: sItem.category || "عام",
          qty: 1,
          unit: sItem.unit || "وحدة",
          price: sItem.price || 0,
          discount: 0,
          taxRate: 15, // ضريبة افتراضية
        });
      }
    });

    setItems(newItems);
    setShowModal(false);
    setSelectedItemIds([]);
    setSelectedBundleIds([]);
    setSearchTerm("");
  };

  // دالة إضافة بند حر (فارغ)
  const handleAddFreeItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        title: "",
        category: "عام",
        qty: 1,
        unit: "وحدة",
        price: 0,
        discount: 0,
        taxRate: 15, // 👈 تم إضافة الضريبة للبند الحر هنا
      },
    ]);
  };

  return (
    <div className="animate-in fade-in duration-300 flex flex-col h-full text-[#123f59]">
      {/* رأس القسم وأزرار الإضافة */}
      <div className="flex min-w-0 justify-between items-center mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setShowModal(true)}
            className="px-3 py-1.5 bg-[#eef7f6] text-[#123f59] border border-[#d8b46a]/35 rounded-xl text-[11px] font-bold flex items-center gap-1.5 hover:bg-[#e0f2f1] shadow-sm transition-colors"
          >
            <Package className="w-3.5 h-3.5" /> إضافة من المكتبة (متعدد / مجموعات)
          </button>
          <button
            onClick={handleAddFreeItem}
            className="px-3 py-1.5 bg-[#123f59] text-white rounded-xl text-[11px] font-bold flex min-w-0 items-center gap-1 hover:bg-[#0f3448] shadow-sm transition-colors"
          >
            <Plus className="w-3 h-3" /> بند حر
          </button>
        </div>
      </div>

      {/* جدول البنود المختارة */}
      <div className="bg-white rounded-xl border border-[#d8b46a]/25 p-3 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex-1 flex flex-col min-h-0">
        <div className="overflow-x-auto custom-scrollbar-slim flex-1">
          <table className="w-full text-right border-collapse min-w-[700px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white border-b border-[#d8b46a]/25">
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-6">#</th>
                <th className="p-2 text-[10px] text-[#64748b] font-bold">البند</th>
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-14">الكمية</th>
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-16">الوحدة</th>
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-20">السعر</th>
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-16">خصم</th>
                {/* 👈 عمود الضريبة الجديد */}
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-16">الضريبة %</th> 
                <th className="p-2 text-[10px] text-[#64748b] font-bold w-24">الإجمالي (شامل)</th>
                <th className="p-2 w-6"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                // الحسابات المباشرة للصف
                const baseSubtotal = item.qty * item.price - item.discount;
                const currentTaxRate = item.taxRate !== undefined ? item.taxRate : 15;
                const rowTotalWithTax = baseSubtotal + (baseSubtotal * currentTaxRate / 100);

                return (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-[#fbf8f1]/50">
                    <td className="p-2 text-[11px] text-[#94a3b8] font-mono">{index + 1}</td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleItemChange(item.id, "title", e.target.value)}
                        className="w-full p-1.5 border border-[#d8b46a]/25 rounded text-[11px] font-bold text-[#475569] outline-none focus:border-[#c5983c]/70"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                        className="w-full p-1.5 border border-[#d8b46a]/25 rounded text-[11px] outline-none text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                        className="w-full p-1.5 border border-[#d8b46a]/25 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded text-[10px] outline-none text-center text-[#64748b]"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, "price", e.target.value)}
                        className="w-full p-1.5 border border-[#d8b46a]/25 rounded text-[11px] font-mono outline-none text-center"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        min="0"
                        value={item.discount}
                        onChange={(e) => handleItemChange(item.id, "discount", e.target.value)}
                        className="w-full p-1.5 border border-[#d8b46a]/25 rounded text-[11px] font-mono outline-none text-center text-red-500"
                      />
                    </td>
                    {/* 👈 حقل تحديد الضريبة (إدخال يدوي) */}
                    <td className="p-2 relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1" // يسمح بكسور مثل 15.5
                        value={currentTaxRate}
                        onChange={(e) => {
                          const val = e.target.value === "" ? 0 : Number(e.target.value);
                          handleItemChange(item.id, "taxRate", val);
                        }}
                        className="w-full p-1.5 border border-[#d8b46a]/25 rounded text-[11px] font-mono outline-none text-center focus:border-[#c5983c]/70 bg-white"
                      />
                      {/* إضافة علامة % كشكل جمالي داخل الحقل */}
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] text-[#94a3b8] font-bold pointer-events-none">
                        %
                      </span>
                    </td>
                    <td className="p-2 text-[11px] font-bold text-[#123f59] font-mono text-left">
                      {rowTotalWithTax.toLocaleString()}
                    </td>
                    <td className="p-2 text-left">
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-[11px] text-[#94a3b8] font-bold">
                    لا يوجد بنود، انقر على "إضافة من المكتبة" لاختيار مجموعات أو بنود، أو "بند حر".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end pt-3 mt-2 border-t border-[#d8b46a]/25 text-[13px] font-black text-[#123f59]">
          صافي المجموع الفرعي (بدون ضريبة): {subtotal?.toLocaleString()} ر.س
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🚀 نافذة المكتبة (Modal) للتحديد المتعدد والمجموعات */}
      {/* ============================================================== */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in" dir="rtl">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-[#d8b46a]/25">
              <h3 className="text-[#123f59] font-bold text-sm flex items-center gap-2">
                <Package className="w-5 h-5 text-[#0e7490]" /> إضافة بنود أو مجموعات
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex flex-col flex-1 min-h-0 bg-[#fbf8f1]/30">
              
              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94a3b8]" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم البند أو المجموعة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 pr-9 pl-3 border border-[#d8b46a]/25 rounded-xl text-xs font-bold outline-none focus:border-[#0e7490] bg-white shadow-sm"
                />
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-3 border-b-2 border-[#d8b46a]/25">
                <button
                  onClick={() => setActiveTab("items")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-x-2 border-t-2 rounded-t-lg -mb-[2px] ${activeTab === "items" ? "bg-white text-[#0e7490] border-[#d8b46a]/25 border-b-white" : "bg-transparent text-[#94a3b8] border-transparent hover:text-[#64748b]"}`}
                >
                  البنود المفردة ({filteredItems.length})
                </button>
                <button
                  onClick={() => setActiveTab("bundles")}
                  className={`px-4 py-2 text-xs font-bold transition-all border-x-2 border-t-2 rounded-t-lg -mb-[2px] ${activeTab === "bundles" ? "bg-white text-violet-600 border-[#d8b46a]/25 border-b-white" : "bg-transparent text-[#94a3b8] border-transparent hover:text-[#64748b]"}`}
                >
                  المجموعات (Bundles) ({filteredBundles.length})
                </button>
              </div>

              {/* Selection Lists */}
              <div className="flex-1 overflow-y-auto custom-scrollbar-slim pr-1 space-y-2">
                {/* 1. قائمة البنود المفردة */}
                {activeTab === "items" && (
                  <>
                    {libItemsLoading ? (
                       <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : filteredItems.length > 0 ? (
                      filteredItems.map(item => {
                        const id = item.id || item.code;
                        const isChecked = selectedItemIds.includes(id);
                        return (
                          <label key={id} className={`flex min-w-0 items-center gap-3 p-3 bg-white border rounded-xl cursor-pointer transition-colors ${isChecked ? "border-[#0e7490] bg-[#eef7f6]/50 shadow-sm" : "border-[#d8b46a]/25 hover:border-[#0e7490]/50"}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleItemSelect(id)}
                              className="w-4 h-4 text-[#0e7490] rounded border-gray-300 focus:ring-[#0e7490]"
                            />
                            <div className="flex-1">
                              <div className="font-bold text-[#123f59] text-xs">{item.title}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{item.category}</div>
                            </div>
                            <div className="font-mono text-[#0e7490] font-bold text-xs">{item.price?.toLocaleString()} ر.س</div>
                          </label>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold">لا يوجد بنود مطابقة للبحث</div>
                    )}
                  </>
                )}

                {/* 2. قائمة المجموعات */}
                {activeTab === "bundles" && (
                  <>
                    {bundlesLoading ? (
                       <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
                    ) : filteredBundles.length > 0 ? (
                      filteredBundles.map(bundle => {
                        const id = bundle.id || bundle.code;
                        const isChecked = selectedBundleIds.includes(id);
                        return (
                          <label key={id} className={`flex items-start gap-3 p-3 bg-white border rounded-xl cursor-pointer transition-colors ${isChecked ? "border-violet-500 bg-violet-50/50 shadow-sm" : "border-[#d8b46a]/25 hover:border-violet-300"}`}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleBundleSelect(id)}
                              className="w-4 h-4 text-violet-600 rounded border-gray-300 mt-1 focus:ring-violet-500"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-[#123f59] text-sm flex items-center gap-2">
                                <span>{bundle.icon || "📦"}</span> {bundle.title}
                              </div>
                              <div className="text-[10px] text-slate-500 mt-1">{bundle.description || bundle.desc}</div>
                              {/* عرض البنود المصغرة داخل المجموعة */}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {bundle.itemsIds?.map((iId, idx) => {
                                    const iData = serverItems?.find(si => si.id === iId || si.code === iId);
                                    return <span key={idx} className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[9px] text-slate-600 font-bold">{iData ? iData.title : iId}</span>;
                                })}
                              </div>
                            </div>
                          </label>
                        )
                      })
                    ) : (
                      <div className="text-center py-8 text-slate-400 text-xs font-bold">لا يوجد مجموعات مطابقة للبحث</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#d8b46a]/25 bg-white rounded-b-2xl flex justify-between items-center">
              <div className="text-[11px] font-bold text-slate-500">
                المحدد: <span className="text-[#0e7490] mx-1">{selectedItemIds.length} بند</span> | <span className="text-violet-600 mx-1">{selectedBundleIds.length} مجموعة</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-[#fbf8f1] text-[#64748b] rounded-xl text-xs font-bold hover:bg-[#eef7f6] transition-colors">
                  إلغاء
                </button>
                <button
                  onClick={handleAddSelected}
                  disabled={selectedItemIds.length === 0 && selectedBundleIds.length === 0}
                  className="px-4 py-2 bg-[#123f59] text-white rounded-xl text-xs font-bold hover:bg-[#0f3448] shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex min-w-0 items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" /> إضافة للجدول
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};