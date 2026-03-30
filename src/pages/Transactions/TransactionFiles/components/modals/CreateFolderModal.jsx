import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderPlus,
  X,
  Image as ImageIcon,
  CheckSquare,
  Loader2,
  Layers,
} from "lucide-react";
import { toast } from "sonner";
import {TRANSACTION_PACKAGES} from "../../utils"


export default function CreateFolderModal({
  categories,
  onConfirm,
  onClose,
  isPending,
}) {
  const [tab, setTab] = useState("single"); // 'single' | 'package'

  // Single State
  const [folderName, setFolderName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Package State
  const [selectedTxType, setSelectedTxType] = useState("");

  // Auto-fill folder name based on category
  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.id === selectedCategory);
      if (
        cat &&
        (!folderName || categories.some((c) => c.name === folderName))
      ) {
        setFolderName(cat.name);
      }
    }
  }, [selectedCategory, categories]);

  const handleCreate = () => {
    if (tab === "single") {
      if (!folderName.trim()) return toast.error("يرجى إدخال اسم المجلد");
      if (!selectedCategory) return toast.error("يرجى اختيار تصنيف المجلد");

      const cat = categories.find((c) => c.id === selectedCategory);
      const payload = [
        {
          name: folderName,
          categoryId: selectedCategory,
          subFolders: cat?.subFolders || [],
        },
      ];

      onConfirm(payload);
    } else {
      if (!selectedTxType)
        return toast.error("يرجى اختيار نوع المعاملة لإنشاء الحزمة");
      const catIdsToCreate = TRANSACTION_PACKAGES[selectedTxType] || [];
      if (catIdsToCreate.length === 0)
        return toast.error("لا يوجد حزمة مبرمجة لهذا النوع");

      const payload = catIdsToCreate.map((catId) => {
        const cat = categories.find((c) => c.id === catId);
        return {
          name: cat ? cat.name : "مجلد",
          categoryId: catId,
          subFolders: cat?.subFolders || [],
        };
      });

      onConfirm(payload);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[350] p-4"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3 text-gray-900">
            <div className="bg-blue-100 p-2 rounded-lg">
              <FolderPlus size={20} className="text-blue-600" />
            </div>
            <h3 className="text-lg font-bold">إنشاء مجلدات</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-white">
          <button
            onClick={() => setTab("single")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === "single" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
          >
            مجلد مفرد
          </button>
          <button
            onClick={() => setTab("package")}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${tab === "package" ? "border-blue-600 text-blue-600 bg-blue-50/50" : "border-transparent text-gray-500 hover:bg-gray-50"}`}
          >
            <Layers size={16} /> حزمة مجلدات (Bulk)
          </button>
        </div>

        <div className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          {tab === "single" ? (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  تصنيف المجلد *
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar-slim bg-white p-2 border border-gray-200 rounded-lg">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border-2 transition-all ${selectedCategory === category.id ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-300 bg-white shadow-sm"}`}
                    >
                      <span className="text-2xl">{category.icon}</span>
                      <span className="text-xs font-bold text-gray-800 text-center">
                        {category.name}
                      </span>
                      {category.subFolders?.length > 0 && (
                        <span className="text-[9px] font-bold text-blue-600">
                          {category.subFolders.length} فرعي
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  اسم المجلد *
                </label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="سيتم التسمية تلقائياً بناءً على التصنيف..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all font-bold text-sm"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  نوع المعاملة للمطابقة *
                </label>
                <select
                  value={selectedTxType}
                  onChange={(e) => setSelectedTxType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-white font-bold text-sm"
                >
                  <option value="">-- اختر نوع المعاملة --</option>
                  {Object.keys(TRANSACTION_PACKAGES).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {selectedTxType && (
                <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-sm">
                  <h4 className="text-xs font-bold text-blue-800 mb-3 flex items-center gap-2">
                    <CheckSquare size={14} /> سيتم إنشاء المجلدات التالية فوراً:
                  </h4>
                  <div className="space-y-2">
                    {TRANSACTION_PACKAGES[selectedTxType].map((catId) => {
                      const cat = categories.find((c) => c.id === catId);
                      if (!cat) return null;
                      return (
                        <div
                          key={cat.id}
                          className="flex flex-col p-2.5 bg-gray-50 rounded border border-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cat.icon}</span>
                            <span className="font-bold text-sm text-gray-800">
                              {cat.name}
                            </span>
                          </div>
                          {cat.subFolders?.length > 0 && (
                            <div className="flex gap-1 mt-2 pr-8">
                              {cat.subFolders.map((sub) => (
                                <span
                                  key={sub}
                                  className="text-[9px] font-bold bg-white border border-gray-200 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1"
                                >
                                  <Folder size={10} /> {sub}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-white shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={handleCreate}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-md disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <FolderPlus size={16} />
            )}
            {tab === "single" ? "إنشاء المجلد" : "توليد الحزمة"}
          </button>
        </div>
      </div>
    </div>
  );
}
