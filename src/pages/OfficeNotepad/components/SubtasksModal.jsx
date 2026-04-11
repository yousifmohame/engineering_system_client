import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"; // 👈 أضفنا useQuery
import api from "../../../api/axios";
import { ListTodo, X, Check, Trash2, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SubtasksModal({ task, onClose }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");

  // 🚀 السر هنا: نقرأ البيانات "اللحظية" من الكاش لضمان تحديث الواجهة فوراً داخل المودال
  const { data: allTasks = [] } = useQuery({
    queryKey: ["office-tasks"],
    enabled: false, // لا نريد عمل Fetch جديد، فقط نريد القراءة من الكاش الحالي
  });

  // نجد المهمة الحالية من القائمة المحدثة، وإذا لم نجدها نستخدم المرسلة كـ prop
  const currentTask = allTasks.find((t) => t.id === task.id) || task;

  // 1. إضافة مهمة فرعية
  const addMutation = useMutation({
    mutationFn: (title) =>
      api.post(`/office-tasks/${currentTask.id}/subtasks`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] }); // ✅ الصيغة الصحيحة
      setNewTitle("");
      toast.success("تمت الإضافة");
    },
  });

  // 2. تغيير حالة المهمة الفرعية (تفعيل/إلغاء)
  const toggleMutation = useMutation({
    mutationFn: (subId) => api.put(`/office-tasks/subtasks/${subId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] }); // ✅ الصيغة الصحيحة
    },
  });

  // 3. حذف مهمة فرعية (يفضل استخدام mutation بدلاً من api مباشرة)
  const deleteMutation = useMutation({
    mutationFn: (subId) => api.delete(`/office-tasks/subtasks/${subId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] }); // ✅ الصيغة الصحيحة
      toast.success("تم الحذف");
    },
  });

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-600" /> المهام الفرعية
            </h3>
            <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed truncate max-w-md">
              {currentTask.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50 custom-scrollbar-slim">
          <div className="space-y-3">
            {/* 💡 نستخدم هنا currentTask المحدثة من الكاش */}
            {currentTask.subTasks?.map((st) => (
              <div
                key={st.id}
                className={`flex items-center justify-between p-4 bg-white border rounded-xl shadow-sm transition-colors ${st.isCompleted ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleMutation.mutate(st.id)}
                    disabled={toggleMutation.isPending}
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${st.isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-300 hover:border-emerald-500"}`}
                  >
                    {toggleMutation.isPending &&
                    toggleMutation.variables === st.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      st.isCompleted && <Check className="w-4 h-4" />
                    )}
                  </button>
                  <span
                    className={`text-sm font-bold ${st.isCompleted ? "text-slate-400 line-through" : "text-slate-700"}`}
                  >
                    {st.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (window.confirm("حذف المهمة الفرعية؟"))
                        deleteMutation.mutate(st.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {(!currentTask.subTasks || currentTask.subTasks.length === 0) && (
              <p className="text-center text-sm font-bold text-slate-400 py-10">
                لا توجد مهام فرعية
              </p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && newTitle && addMutation.mutate(newTitle)
              }
              placeholder="إضافة مهمة فرعية جديدة..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => addMutation.mutate(newTitle)}
              disabled={!newTitle || addMutation.isPending}
              className="px-6 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
            >
              {addMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}{" "}
              إضافة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
