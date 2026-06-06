import React, { useState } from "react";
import { Settings, Plus, Trash2 } from "lucide-react";

export default function CategoryModal({ categories, onClose, onAdd, onDelete }) {
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAdd = () => {
    if (newCategoryName.trim()) {
      onAdd(newCategoryName);
      setNewCategoryName("");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" dir="rtl">
      <div className="w-full max-w-xs overflow-hidden rounded-[26px] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.30)]">
        <div className="bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-4 text-white">
          <h3 className="flex items-center gap-2 text-sm font-black">
            <Settings className="h-4 w-4 text-[#e2bf74]" /> إدارة التصنيفات
          </h3>
        </div>

        <div className="space-y-4 p-5">
          <div className="custom-scrollbar-slim max-h-48 space-y-2 overflow-y-auto pr-1">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center justify-between rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1] p-2.5">
                <span className="text-xs font-black text-[#123f59]">{cat.name}</span>
                <button onClick={() => onDelete(cat.id)} className="text-rose-400 transition hover:text-rose-600" type="button">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="تصنيف جديد..."
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1 rounded-xl border border-[#d8b46a]/35 p-2 text-xs font-bold outline-none focus:border-[#c5983c]"
            />
            <button onClick={handleAdd} disabled={!newCategoryName.trim()} className="rounded-xl bg-[#123f59] p-2 text-white transition hover:bg-[#0f3448] disabled:opacity-50" type="button">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <button onClick={onClose} className="w-full rounded-xl bg-[#08111c] p-2 text-xs font-black text-white transition hover:bg-[#123f59]" type="button">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}