import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import { Edit3, Save, Loader2, Copy } from "lucide-react";

export function TabExtractedData({ permit, flatDistricts = [] }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...permit });

  useEffect(() => {
    const data = { ...permit };
    // إذا كان طول النص أكبر من 20 فهو CUID وليس اسماً عادياً
    if (
      data.district &&
      data.district.length > 20 &&
      flatDistricts.length > 0
    ) {
      const foundDistrict = flatDistricts.find((x) => x.id === data.district);
      if (foundDistrict) {
        data.district = foundDistrict.name; // استبدال الـ ID بالاسم
      }
    }
    setFormData(data);
  }, [permit, flatDistricts]);

  const updateMutation = useMutation({
    mutationFn: async (data) => await api.put(`/permits/${permit.id}`, data),
    onSuccess: () => {
      toast.success("تم تحديث البيانات بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
    },
    onError: () => toast.error("حدث خطأ أثناء تحديث البيانات"),
  });

  const fields = [
    { key: "permitNumber", label: "رقم الرخصة" },
    { key: "year", label: "سنة الرخصة" },
    { key: "type", label: "نوع الرخصة" },
    { key: "ownerName", label: "اسم المالك" },
    { key: "idNumber", label: "رقم الهوية" },
    { key: "district", label: "الحي" },
    { key: "sector", label: "القطاع" },
    { key: "plotNumber", label: "رقم القطعة" },
    { key: "planNumber", label: "رقم المخطط" },
    { key: "mainUsage", label: "التصنيف الرئيسي (الاستخدام)" },
    { key: "subUsage", label: "التصنيف الفرعي" },
    { key: "landArea", label: "مساحة الأرض", type: "number" },
    { key: "engineeringOffice", label: "المكتب الهندسي" },
  ];

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <span className="text-[12px] font-black text-slate-700">
          البيانات الأساسية المستخرجة
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-[#123B5D] bg-[#f4f7f8] px-3 py-1.5 rounded-lg hover:bg-[#edf2f4] flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تعديل البيانات
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({ ...permit });
              }}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={() => updateMutation.mutate(formData)}
              disabled={updateMutation.isPending}
              className="text-[10px] font-bold text-white bg-[#0f3d50] px-3 py-1.5 rounded-lg hover:bg-[#174e65] flex items-center gap-1 disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ التعديلات
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-slate-500 flex items-center justify-between">
              {f.label}
              {!isEditing && (
                <button
                  onClick={() => copyToClipboard(formData[f.key])}
                  className="text-slate-400 hover:text-[#123B5D]"
                  title="نسخ"
                >
                  <Copy size={10} />
                </button>
              )}
            </span>
            {isEditing ? (
              <input
                type={f.type || "text"}
                value={formData[f.key] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [f.key]: e.target.value })
                }
                className="w-full text-[11px] font-bold border border-slate-300 rounded-md px-2 py-1.5 bg-white text-slate-800 outline-none focus:ring-1 focus:ring-blue-500"
              />
            ) : (
              <span className="text-[11px] font-bold text-slate-800 bg-slate-50 px-2 py-1.5 rounded-md border border-slate-100 min-h-[28px] flex items-center">
                {formData[f.key] || "—"}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
