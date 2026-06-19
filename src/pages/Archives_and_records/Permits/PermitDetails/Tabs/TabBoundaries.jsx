import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import { Edit3, Save, Loader2 } from "lucide-react";

export function TabBoundaries({ permit }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [boundaries, setBoundaries] = useState(() => {
    try {
      return permit.boundariesData
        ? JSON.parse(permit.boundariesData)
        : [
            { direction: "شمال", length: "", neighbor: "" },
            { direction: "جنوب", length: "", neighbor: "" },
            { direction: "شرق", length: "", neighbor: "" },
            { direction: "غرب", length: "", neighbor: "" },
          ];
    } catch {
      return [];
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data) =>
      await api.put(`/permits/${permit.id}`, {
        boundariesData: JSON.stringify(data),
      }),
    onSuccess: () => {
      toast.success("تم تحديث حدود الأرض");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
  });

  const updateRow = (idx, field, val) => {
    const newB = [...boundaries];
    newB[idx][field] = val;
    setBoundaries(newB);
  };

  return (
    <div className="p-4 animate-in fade-in space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          حدود وأبعاد الأرض
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-[#123B5D] bg-[#f4f7f8] px-3 py-1.5 rounded-lg hover:bg-[#edf2f4] flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل الحدود
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
              onClick={() => updateMutation.mutate(boundaries)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-[#0f3d50] px-3 py-1.5 rounded-lg hover:bg-[#174e65] flex items-center gap-1"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <table className="w-full text-[11px] text-right">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-3 py-2 w-20">الاتجاه</th>
              <th className="px-3 py-2 w-24">الطول (م)</th>
              <th className="px-3 py-2">يحدها</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {boundaries.map((b, i) => (
              <tr
                key={i}
                className="hover:bg-slate-50 transition-colors font-bold"
              >
                <td className="px-3 py-2 text-slate-700">{b.direction}</td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="number"
                      value={b.length}
                      onChange={(e) => updateRow(i, "length", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-slate-600">{b.length || "—"}</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={b.neighbor}
                      onChange={(e) => updateRow(i, "neighbor", e.target.value)}
                      className="w-full border border-slate-200 rounded px-2 py-1 outline-none focus:border-blue-400"
                    />
                  ) : (
                    <span className="text-slate-600">{b.neighbor || "—"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
