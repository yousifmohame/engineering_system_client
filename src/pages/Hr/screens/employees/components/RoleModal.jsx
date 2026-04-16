import React from "react";
import { X, KeyRound, Loader2, CheckCircle } from "lucide-react";

export default function RoleModal({ modal, setModal, onSubmit, isPending }) {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-cairo">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-black text-sm text-slate-800 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            {modal.mode === "create" ? "إنشاء دور وظيفي جديد" : "تعديل اسم الدور"}
          </h3>
          <button onClick={() => setModal({ ...modal, isOpen: false })} className="p-1 bg-slate-200 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[10px] font-black mb-1.5 text-slate-600">مسمى الدور (عربي) *</label>
            <input required value={modal.data.nameAr} onChange={(e) => setModal({ ...modal, data: { ...modal.data, nameAr: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-500" placeholder="مثال: مهندس مشاريع" />
          </div>
          <div>
            <label className="block text-[10px] font-black mb-1.5 text-slate-600">الوصف</label>
            <textarea value={modal.data.description} onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })} className="w-full p-2 border border-slate-300 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 h-20 resize-none" placeholder="وصف مهام الدور..." />
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="px-5 py-2 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-black hover:bg-slate-200">إلغاء</button>
            <button type="submit" disabled={isPending} className="flex-1 bg-indigo-600 text-white rounded-lg text-[11px] font-black flex justify-center items-center gap-1.5 hover:bg-indigo-700 disabled:opacity-50">
              {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} حفظ الدور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}