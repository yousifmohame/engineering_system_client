import React from "react";
import { FolderOpen, User, Clock, Trash2, X } from "lucide-react";

export default function TrashModal({ deletedItems, onRestore, onPermanentDelete, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[300]" onClick={onClose} dir="rtl">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50 rounded-t-lg">
          <div className="flex items-center gap-2 text-red-900">
            <Trash2 size={20} className="text-red-600" />
            <h3 className="text-lg font-bold">سلة المحذوفات</h3>
            <span className="text-sm text-red-600 bg-white px-2 py-0.5 rounded-full font-mono">{deletedItems.length} عناصر</span>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-red-100 text-red-500"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          {deletedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
              <Trash2 size={64} strokeWidth={1.5} className="mb-4" />
              <p className="text-lg font-bold">سلة المحذوفات فارغة</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedItems.map((deleted) => (
                <div key={deleted.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:border-gray-300">
                  <FolderOpen size={32} className="text-amber-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900 text-sm truncate">{deleted.item?.name || "مجلد"}</div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                      <User size={12} /> بواسطة {deleted.deletedBy}
                      <span className="text-gray-300">|</span>
                      <Clock size={12} /> {deleted.deletedAt}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 font-mono">{deleted.originalPath}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => onRestore(deleted.id)} className="px-4 py-2 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100">استعادة</button>
                    <button onClick={() => onPermanentDelete(deleted.id)} className="px-4 py-2 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1"><Trash2 size={14} /> حذف نهائي</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}