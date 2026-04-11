import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  ListTodo,
  X,
  Check,
  Trash2,
  Plus,
  Loader2,
  User,
  Clock,
  Edit3,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function SubtasksModal({ task, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  // جلب البيانات الحية من الباك أند
  const { data: allTasks = [] } = useQuery({
    queryKey: ["office-tasks"],
    enabled: false, // نعتمد على البيانات الموجودة في الكاش أو التي تم تحديثها
  });

  const currentTask = allTasks.find((t) => t.id === task.id) || task;
  const isTaskCompleted = currentTask.status === "completed";

  // 🚀 العمليات المربوطة بالباك أند

  // 1. إضافة
  const addMutation = useMutation({
    mutationFn: (title) =>
      api.post(`/office-tasks/${currentTask.id}/subtasks`, {
        title,
        authorName: currentUser?.name || "مستخدم",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
      setNewTitle("");
      toast.success("تمت إضافة المهمة");
    },
  });

  // 2. تعديل العنوان
  const updateTitleMutation = useMutation({
    mutationFn: ({ subId, title }) =>
      api.put(`/office-tasks/subtasks/${subId}`, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
      setEditingId(null);
      toast.success("تم التحديث");
    },
  });

  // 3. تبديل الحالة
  const toggleMutation = useMutation({
    mutationFn: (subId) => api.put(`/office-tasks/subtasks/${subId}/toggle`),
    onSuccess: () => queryClient.invalidateQueries(["office-tasks"]),
  });

  // 4. حذف
  const deleteMutation = useMutation({
    mutationFn: (subId) => api.delete(`/office-tasks/subtasks/${subId}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["office-tasks"]);
      toast.success("تم الحذف");
    },
  });

  const handleStartEdit = (st) => {
    setEditingId(st.id);
    setEditValue(st.title);
  };

  const isFrozen = task.status === "frozen";

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-blue-600" /> المهام الفرعية
            </h3>
            <p className="text-xs font-bold text-slate-600 mt-1 truncate max-w-md">
              {currentTask.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {isTaskCompleted && (
          <div className="bg-amber-50 border-b border-amber-100 p-3 text-center">
            <p className="text-xs font-black text-amber-700">
              ⚠️ هذه المهمة مكتملة، لا يمكن التعديل عليها.
            </p>
          </div>
        )}

        {/* List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-slate-50/50 custom-scrollbar-slim">
          {currentTask.subTasks?.map((st) => (
            <div
              key={st.id}
              className={`flex flex-col p-4 bg-white border rounded-2xl shadow-sm transition-all ${st.isCompleted ? "border-emerald-200 bg-emerald-50/20" : "border-slate-200"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1">
                  <button
                    onClick={() => toggleMutation.mutate(st.id)}
                    disabled={isTaskCompleted || toggleMutation.isPending}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${st.isCompleted ? "bg-emerald-500 border-emerald-500 text-white shadow-sm" : "border-slate-300 bg-white"}`}
                  >
                    {st.isCompleted ? (
                      <Check size={14} strokeWidth={3} />
                    ) : null}
                  </button>

                  {editingId === st.id ? (
                    <input
                      className="flex-1 bg-slate-50 border border-emerald-500 rounded-lg px-2 py-1 text-sm font-bold focus:outline-none"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`text-sm font-black ${st.isCompleted ? "text-slate-400 line-through" : "text-slate-800"}`}
                    >
                      {st.title}
                    </span>
                  )}
                </div>

                {!isTaskCompleted && (
                  <div className="flex items-center gap-1">
                    {editingId === st.id ? (
                      <button
                        onClick={() =>
                          updateTitleMutation.mutate({
                            subId: st.id,
                            title: editValue,
                          })
                        }
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                      >
                        <Save size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(st)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit3 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        window.confirm("حذف المهمة؟") &&
                        deleteMutation.mutate(st.id)
                      }
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 flex items-center gap-4 text-[9px] text-slate-400 font-bold border-t border-slate-50 pt-2">
                <div className="flex items-center gap-1">
                  <User size={10} /> <span>بواسطة: {st.authorName}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={10} />{" "}
                  <span>
                    {new Date(st.createdAt).toLocaleDateString("ar-SA")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Input */}
        {!isTaskCompleted && (
          <div className="p-4 border-t border-slate-100 bg-white">
            {isFrozen ? (
              <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-center text-xs font-bold border border-blue-100">
                ❄️ لا يمكن إضافة مهام فرعية، المهمة مجمدة حالياً.
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="أدخل المهمة الفرعية..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={() => addMutation.mutate(newTitle)}
                  disabled={!newTitle || addMutation.isPending}
                  className="px-6 bg-emerald-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
                >
                  {addMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Plus size={16} />
                  )}{" "}
                  إضافة
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
