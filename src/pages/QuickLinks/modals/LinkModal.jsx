import React, { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";

export default function LinkModal({ categories, linkToEdit, onClose, onSave, isSaving }) {
  const initialForm = {
    title: "", url: "", description: "", categoryId: categories[0]?.id || "",
    accessLevel: "الموظفين", requiresLogin: false, loginData: "", assignedEmployees: "",
    hasInfiniteExpiry: false, validUntil: "", importance: "عادي", notes: "",
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (linkToEdit) {
      setFormData({
        ...linkToEdit,
        hasInfiniteExpiry: !linkToEdit.validUntil,
        validUntil: linkToEdit.validUntil ? linkToEdit.validUntil.split("T")[0] : "",
      });
    }
  }, [linkToEdit]);

  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4 backdrop-blur-sm" dir="rtl">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.34)]">
        <div className="shrink-0 bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59] px-5 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#e2bf74] text-[#123f59]">
                <Plus className="h-4 w-4" />
              </span>
              <h3 className="text-sm font-black">{linkToEdit ? "تعديل بيانات الرابط" : "إضافة رابط سريع جديد"}</h3>
            </div>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-2xl bg-white/10 transition hover:bg-white/15" type="button">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="custom-scrollbar-slim space-y-6 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#123f59]">اسم الرابط *</label>
              <input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full rounded-xl border border-[#d8b46a]/35 p-2.5 text-xs font-bold outline-none focus:border-[#c5983c] focus:ring-4 focus:ring-[#c5983c]/10" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#123f59]">التصنيف *</label>
              <select value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} className="w-full rounded-xl border border-[#d8b46a]/35 bg-white p-2.5 text-xs font-bold outline-none">
                <option value="">اختر...</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </select>
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-[10px] font-black text-[#123f59]">الرابط (URL) *</label>
              <input value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} dir="ltr" placeholder="https://..." className="w-full rounded-xl border border-[#d8b46a]/35 p-2.5 text-left font-mono text-xs font-bold outline-none focus:border-[#c5983c] focus:ring-4 focus:ring-[#c5983c]/10" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-[#e8ddc8] pt-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#123f59]">الأهمية</label>
              <select value={formData.importance} onChange={(e) => setFormData({ ...formData, importance: e.target.value })} className="w-full rounded-xl border border-[#d8b46a]/35 bg-white p-2.5 text-xs font-bold outline-none">
                <option value="عادي">عادي</option>
                <option value="متوسط">متوسط</option>
                <option value="عالي الأهمية">عالي الأهمية</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#123f59]">مستوى الوصول</label>
              <select value={formData.accessLevel} onChange={(e) => setFormData({ ...formData, accessLevel: e.target.value })} className="w-full rounded-xl border border-[#d8b46a]/35 bg-white p-2.5 text-xs font-bold outline-none">
                <option>الإدارة العليا</option>
                <option>الموظفين</option>
                <option>الكل</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-[#123f59]">تاريخ الانتهاء</label>
              <label className="mb-1 mt-1 flex cursor-pointer items-center gap-1">
                <input type="checkbox" className="accent-[#123f59]" checked={formData.hasInfiniteExpiry} onChange={(e) => setFormData({ ...formData, hasInfiniteExpiry: e.target.checked, validUntil: "" })} />
                <span className="text-[9px] font-black text-[#123f59]">غير محدد</span>
              </label>
              <input type="date" disabled={formData.hasInfiniteExpiry} value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} className="w-full rounded-xl border border-[#d8b46a]/35 p-2 text-xs font-bold outline-none disabled:bg-slate-100 disabled:text-slate-400" />
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-[#d8b46a]/35 bg-[#fbf8f1] p-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 accent-[#123f59]" checked={formData.requiresLogin} onChange={(e) => setFormData({ ...formData, requiresLogin: e.target.checked })} />
              <span className="text-xs font-black text-[#123f59]">تفعيل حماية بيانات الدخول</span>
            </label>
            {formData.requiresLogin && (
              <input type="text" value={formData.loginData} onChange={(e) => setFormData({ ...formData, loginData: e.target.value })} placeholder="بيانات الدخول..." className="w-full rounded-xl border border-[#d8b46a]/35 p-2.5 text-xs font-bold outline-none" />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-[#123f59]">وصف / ملاحظات</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="min-h-[70px] w-full resize-none rounded-2xl border border-[#d8b46a]/35 p-3 text-xs font-bold outline-none focus:border-[#c5983c] focus:ring-4 focus:ring-[#c5983c]/10" />
          </div>
        </div>

        <div className="flex shrink-0 justify-end gap-2 border-t border-[#e8ddc8] bg-[#fbf8f1] p-4">
          <button onClick={onClose} className="rounded-xl border border-[#d8b46a]/35 bg-white px-6 py-2 text-xs font-black text-[#64748b] transition hover:bg-[#f8efe0]" type="button">إلغاء</button>
          <button onClick={handleSubmit} disabled={isSaving || !formData.title || !formData.url || !formData.categoryId} className="rounded-xl bg-[#123f59] px-8 py-2 text-xs font-black text-white shadow-sm transition hover:bg-[#0f3448] disabled:opacity-50" type="button">
            {isSaving ? "جاري الحفظ..." : "حفظ الرابط"}
          </button>
        </div>
      </div>
    </div>
  );
}