import React, { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  MessageSquare,
  X,
  User,
  Loader2,
  Edit3,
  Trash2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

export default function CommentsModal({ task, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  // 💡 حالات التعديل
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const { data: allTasks = [] } = useQuery({
    queryKey: ["office-tasks"],
    enabled: false,
  });

  const currentTask = allTasks.find((t) => t.id === task.id) || task;

  // 1. إضافة تعليق
  const addMutation = useMutation({
    mutationFn: (text) =>
      api.post(`/office-tasks/${currentTask.id}/comments`, {
        text,
        authorName: currentUser?.name || "مستخدم",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      setText("");
      toast.success("تم إضافة التعليق");
    },
  });

  // 2. تعديل تعليق
  const updateMutation = useMutation({
    mutationFn: ({ commentId, newText }) =>
      api.put(`/office-tasks/comments/${commentId}`, { text: newText }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      setEditingId(null);
      toast.success("تم تعديل التعليق بنجاح");
    },
  });

  // 3. حذف تعليق
  const deleteMutation = useMutation({
    mutationFn: (commentId) =>
      api.delete(`/office-tasks/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      toast.success("تم حذف التعليق");
    },
  });

  const handleStartEdit = (c) => {
    setEditingId(c.id);
    setEditValue(c.text);
  };

  const isFrozen = task.status === "frozen";

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" /> الملاحظات
              والتعليقات
            </h3>
            <p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed truncate max-w-md">
              {currentTask.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comments List */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 custom-scrollbar-slim">
          <div className="relative border-r-2 border-slate-200 pr-6 space-y-6 ml-4 py-2">
            {currentTask.comments?.map((c) => (
              <div key={c.id} className="relative">
                <div
                  className={`absolute -right-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${c.isSystem ? "bg-amber-500" : "bg-emerald-500"}`}
                ></div>
                <div
                  className={`p-4 rounded-2xl border shadow-sm ${c.isSystem ? "bg-amber-50/50 border-amber-100" : "bg-white border-slate-200"}`}
                >
                  {/* معلومات التعليق (الاسم والوقت والأزرار) */}
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-slate-500" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">
                        {c.authorName}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* 💡 أزرار التعديل والحذف (لا تظهر للتعليقات الآلية الخاصة بالنظام) */}
                      {!c.isSystem && (
                        <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                          {editingId === c.id ? (
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400"
                            >
                              <X size={14} />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={() => handleStartEdit(c)}
                                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition-colors"
                              >
                                <Edit3 size={14} />
                              </button>
                              <button
                                onClick={() =>
                                  window.confirm(
                                    "هل أنت متأكد من حذف هذا التعليق؟",
                                  ) && deleteMutation.mutate(c.id)
                                }
                                className="p-1 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      )}

                      {/* الوقت والتاريخ */}
                      <div className="text-left leading-tight">
                        <div className="text-[10px] font-mono font-bold text-slate-400">
                          {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-400">
                          {new Date(c.createdAt).toLocaleTimeString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* نص التعليق أو مربع التعديل */}
                  {editingId === c.id ? (
                    <div className="mt-3 flex gap-2">
                      <textarea
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 bg-white border border-emerald-500 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none h-16"
                        autoFocus
                      />
                      <button
                        onClick={() =>
                          updateMutation.mutate({
                            commentId: c.id,
                            newText: editValue,
                          })
                        }
                        disabled={!editValue.trim() || updateMutation.isPending}
                        className="px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 flex items-center justify-center disabled:opacity-50 transition-colors"
                      >
                        {updateMutation.isPending ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Save size={16} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-sm font-medium leading-relaxed whitespace-pre-wrap mt-2 ${c.isSystem ? "text-amber-800" : "text-slate-600"}`}
                    >
                      {c.text}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {(!currentTask.comments || currentTask.comments.length === 0) && (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="text-slate-300" size={32} />
                </div>
                <p className="text-sm font-bold text-slate-400">
                  لا توجد تعليقات حتى الآن
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          {isFrozen ? (
            <div className="bg-blue-50 text-blue-700 p-3 rounded-xl text-center text-xs font-bold border border-blue-100">
              ❄️ لا يمكن إضافة مهام فرعية، المهمة مجمدة حالياً.
            </div>
          ) : (
            <div className="flex gap-2">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (text.trim()) addMutation.mutate(text);
                  }
                }}
                placeholder="اكتب تعليقاً جديداً..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-14"
              />
              <button
                onClick={() => addMutation.mutate(text)}
                disabled={!text.trim() || addMutation.isPending}
                className="px-6 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center min-w-[100px] transition-all"
              >
                {addMutation.isPending ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  "إرسال"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
