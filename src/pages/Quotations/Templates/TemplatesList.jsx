import React from "react";
import api from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TemplatesList({ onCreateNew, onEdit }) {
  const queryClient = useQueryClient();

  // جلب كل النماذج
  const { data: templates, isLoading } = useQuery({
    queryKey: ["quotation-templates"],
    queryFn: async () => {
      const res = await api.get("/quotation-templates");
      return res.data.data;
    },
  });

  // حذف نموذج
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      return await api.delete(`/quotation-templates/${id}`);
    },
    onSuccess: () => {
      toast.success("تم حذف النموذج بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النموذج؟")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin w-8 h-8 text-violet-600"/></div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">نماذج عروض الأسعار</h1>
          <p className="text-slate-500 mt-1">إدارة وتخصيص قوالب عروض الأسعار للعملاء</p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 font-bold"
        >
          <Plus className="w-5 h-5" /> إنشاء نموذج جديد
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((tpl) => (
          <div key={tpl.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(tpl.id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(tpl.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-lg text-slate-800">{tpl.title}</h3>
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{tpl.description || "لا يوجد وصف"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}