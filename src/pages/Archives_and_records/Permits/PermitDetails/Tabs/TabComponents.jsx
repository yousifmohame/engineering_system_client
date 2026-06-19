import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import { Edit3, Save, Loader2, Plus, Trash2 } from "lucide-react";

export function TabComponents({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [components, setComponents] = useState(() => {
    try {
      return permit.componentsData ? JSON.parse(permit.componentsData) : [];
    } catch {
      return [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await api.put(`/permits/${permit.id}`, {
        componentsData: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("تم تحديث جدول المكونات");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
  });

  const addRow = () =>
    setComponents([
      ...components,
      { name: "", usage: "", area: "", units: "" },
    ]);
  const removeRow = (idx) =>
    setComponents(components.filter((_, i) => i !== idx));
  const updateRow = (idx, field, val) => {
    const newComp = [...components];
    newComp[idx][field] = val;
    setComponents(newComp);
  };

  return (
    <div className="p-4 animate-in fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          مكونات المبنى
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-[#123B5D] bg-[#f4f7f8] px-3 py-1.5 rounded-lg hover:bg-[#edf2f4] flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل المكونات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(components)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-[#0f3d50] px-3 py-1.5 rounded-lg hover:bg-[#174e65] flex items-center gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ المكونات
            </button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-1/3">المكون</th>
              <th className="px-3 py-2 w-1/4">الاستخدام</th>
              <th className="px-3 py-2 w-1/4">المساحة م²</th>
              <th className="px-3 py-2 w-1/6">عدد الوحدات</th>
              {isEditing && <th className="px-3 py-2 w-10 text-center">حذف</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {components.length === 0 && !isEditing && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-400">
                  لا توجد مكونات مضافة
                </td>
              </tr>
            )}
            {components.map((c, i) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors">
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => updateRow(i, "name", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-700">{c.name}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={c.usage}
                      onChange={(e) => updateRow(i, "usage", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.usage}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.area}
                      onChange={(e) => updateRow(i, "area", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.area}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={c.units}
                      onChange={(e) => updateRow(i, "units", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="font-bold text-slate-600">{c.units}</span>
                  )}
                </td>
                {isEditing && (
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => removeRow(i)}
                      className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isEditing && (
        <button
          onClick={addRow}
          className="w-full mt-3 py-2 bg-slate-50 border border-dashed border-slate-300 text-slate-500 rounded-lg hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center gap-1 text-[11px] font-bold transition-colors"
        >
          <Plus size={14} /> إضافة مكون جديد
        </button>
      )}
    </div>
  );
}
