import React from "react";
import api from "../../../api/axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Copy, Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../context/AuthContext"; // تأكد من صحة مسار الاستيراد

export default function TemplatesList({ onCreateNew, onEdit }) {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // جلب بيانات المستخدم الحالي

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

  // نسخ (دوبلكيت) نموذج
  // نسخ (دوبلكيت) نموذج
  const duplicateMutation = useMutation({
    mutationFn: async (id) => {
      // إرسال employeeId لتوثيق من قام بالنسخ
      return await api.post(`/quotation-templates/${id}/duplicate`, {
        employeeId: user?.id,
      });
    },
    onSuccess: () => {
      toast.success("تم إنشاء نسخة من النموذج بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
  });

  // تجميد/إلغاء تجميد النموذج
  const toggleFreezeMutation = useMutation({
    mutationFn: async ({ id, isFrozen }) => {
      // إرسال employeeId لتوثيق من قام بالتجميد
      return await api.patch(`/quotation-templates/${id}/freeze`, {
        isFrozen: !isFrozen,
        employeeId: user?.id,
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث حالة النموذج بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
    },
  });

  const handleDelete = (id) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النموذج؟")) {
      deleteMutation.mutate(id);
    }
  };

  const handleDuplicate = (id) => {
    if (window.confirm("هل تريد إنشاء نسخة من هذا النموذج؟")) {
      duplicateMutation.mutate(id);
    }
  };

  const handleToggleFreeze = (tpl) => {
    const action = tpl.isFrozen ? "إلغاء تجميد" : "تجميد";
    if (window.confirm(`هل أنت متأكد من ${action} هذا النموذج؟`)) {
      toggleFreezeMutation.mutate({ id: tpl.id, isFrozen: tpl.isFrozen });
    }
  };

  // دالة مساعدة لتنسيق التاريخ
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin w-8 h-8 text-violet-600" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            نماذج عروض الأسعار
          </h1>
          <p className="text-slate-500 mt-1">
            إدارة وتخصيص قوالب عروض الأسعار للعملاء
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors font-bold shadow-sm"
        >
          <Plus className="w-5 h-5" /> إنشاء نموذج جديد
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse min-w-[1000px]">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  م
                </th>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  اسم النموذج
                </th>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  رمز النموذج
                </th>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap text-center">
                  مرات الاستخدام
                </th>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  تاريخ الإنشاء
                </th>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  آخر تعديل
                </th>
                <th className="p-4 font-semibold text-slate-700 whitespace-nowrap">
                  بواسطة
                </th>
                <th className="p-4 font-semibold text-slate-700 text-center whitespace-nowrap">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody>
              {templates?.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-slate-500">
                    لا توجد نماذج حالياً.
                  </td>
                </tr>
              ) : (
                templates?.map((tpl, index) => (
                  <tr
                    key={tpl.id}
                    className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${tpl.isFrozen ? "opacity-70 bg-slate-50" : ""}`}
                  >
                    <td className="p-4 text-slate-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="p-4 text-slate-800 font-bold">
                      {tpl.title}
                      {tpl.isFrozen && (
                        <span className="mr-2 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                          مجمد
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 font-mono text-sm">
                      {tpl.code || "—"}
                    </td>
                    <td className="p-4 text-slate-600 text-center font-semibold">
                      {tpl.uses || 0}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {formatDate(tpl.createdAt)}
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {formatDate(tpl.updatedAt)}
                    </td>
                    <td className="p-4 text-slate-600 text-sm">
                      {/* عرض اسم المنشئ إما من العلاقة المرجعية (إن وجدت) أو مقارنة المعرف بالمستخدم الحالي */}
                      {tpl.creator?.name ||
                        (tpl.userId === user?.id ? "أنت" : "—")}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(tpl.id)}
                          title="تعديل"
                          disabled={tpl.isFrozen}
                          className={`p-2 rounded-lg transition-colors ${tpl.isFrozen ? "text-slate-300 cursor-not-allowed" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDuplicate(tpl.id)}
                          title="نسخ (دوبلكيت)"
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleFreeze(tpl)}
                          title={tpl.isFrozen ? "إلغاء التجميد" : "تجميد"}
                          className={`p-2 rounded-lg transition-colors ${tpl.isFrozen ? "text-amber-500 bg-amber-50 hover:bg-amber-100" : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"}`}
                        >
                          {tpl.isFrozen ? (
                            <Unlock className="w-4 h-4" />
                          ) : (
                            <Lock className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(tpl.id)}
                          title="حذف"
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
