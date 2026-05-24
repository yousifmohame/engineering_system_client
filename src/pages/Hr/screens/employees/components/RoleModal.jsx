import React from "react";
import { X, KeyRound, Loader2, CheckCircle } from "lucide-react";


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
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


export default function RoleModal({ modal, setModal, onSubmit, isPending }) {
  if (!modal.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#06111d]/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 font-cairo">
      <div className="bg-white/95 rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 overflow-hidden">
        <div className="p-4 border-b border-[#e8ddc8] flex justify-between items-center bg-[#fbf8f1]">
          <h3 className="font-black text-sm text-[#123f59] flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#0e7490]" />
            {modal.mode === "create" ? "إنشاء دور وظيفي جديد" : "تعديل اسم الدور"}
          </h3>
          <button onClick={() => setModal({ ...modal, isOpen: false })} className="inline-flex h-8 items-center justify-center gap-1.5 px-2.5 bg-[#eef7f6] hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors">
            <IconWithText icon={X} text="إغلاق" iconClassName="w-4 h-4 text-[#64748b]" />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-3 space-y-4">
          <div>
            <label className="block text-[10px] font-black mb-1.5 text-[#64748b]">مسمى الدور (عربي) *</label>
            <input required value={modal.data.nameAr} onChange={(e) => setModal({ ...modal, data: { ...modal.data, nameAr: e.target.value } })} className="w-full p-2 border border-[#d8b46a]/25 rounded-lg text-xs font-bold outline-none focus:border-[#d8b46a]/35" placeholder="مثال: مهندس مشاريع" />
          </div>
          <div>
            <label className="block text-[10px] font-black mb-1.5 text-[#64748b]">الوصف</label>
            <textarea value={modal.data.description} onChange={(e) => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })} className="w-full p-2 border border-[#d8b46a]/25 rounded-lg text-xs font-bold outline-none focus:border-[#d8b46a]/35 h-20 resize-none" placeholder="وصف مهام الدور..." />
          </div>

          <div className="pt-2 flex gap-2">
            <button type="button" onClick={() => setModal({ ...modal, isOpen: false })} className="px-3 py-2 bg-[#fbf8f1] text-[#64748b] rounded-lg text-[11px] font-black hover:bg-[#eef7f6]">إلغاء</button>
            <button type="submit" disabled={isPending} className="flex-1 bg-[#0e7490] text-white rounded-lg text-[11px] font-black flex justify-center items-center gap-1.5 hover:bg-[#0e7490] disabled:opacity-50">
              {isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4" />} حفظ الدور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}