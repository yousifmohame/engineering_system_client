import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";
import { X, Check, Loader2, AlertCircle } from "lucide-react";

export default function StatusConfirmModal({ config, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const updateMutation = useMutation({
    mutationFn: () =>
      api.put(`/office-tasks/${config.task.id}/status`, {
        status: config.newStatus,
        commentText: comment,
        authorName: currentUser?.name || "موظف",
      }),
    onSuccess: () => {
      toast.success(
        `تم تحديث حالة المهمة إلى ${getStatusInfo(config.newStatus).name}`,
      );
      queryClient.invalidateQueries({ queryKey: ["office-tasks"] });
      onClose();
    },
    onError: (error) => {
      toast.error(
        "فشل تحديث الحالة: " +
          (error.response?.data?.message || "خطأ في السيرفر"),
      );
    },
  });

  // 💡 دالة متطورة لجلب الاسم واللون بناءً على الحالة الجديدة
  const getStatusInfo = (st) => {
    switch (st) {
      case "completed":
        return {
          name: "مكتملة",
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
      case "cancelled":
        return {
          name: "ملغاة",
          color: "bg-slate-100 text-slate-600 border-slate-200",
        };
      case "frozen":
        return {
          name: "مجمدة",
          color: "bg-blue-100 text-blue-700 border-blue-200",
        };
      default:
        return {
          name: "نشطة",
          color: "bg-amber-100 text-amber-700 border-amber-200",
        };
    }
  };

  const statusInfo = getStatusInfo(config.newStatus);

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
      dir="rtl"
    >
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <AlertCircle className="text-slate-400" size={20} />
            تأكيد تغيير الحالة
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div
            className={`p-5 rounded-2xl border text-center transition-all ${statusInfo.color}`}
          >
            <p className="text-xs font-bold mb-1 opacity-80">
              سيتم نقل المهمة إلى حالة:
            </p>
            <span className="text-lg font-black">{statusInfo.name}</span>
            {config.newStatus === "frozen" && (
              <p className="text-[10px] mt-2 font-bold opacity-70">
                * ملاحظة: تجميد المهمة سيمنع أي إضافات أو تعديلات عليها مؤقتاً.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 mr-1">
              إضافة تعليق توضيحي (سيظهر في سجل الملاحظات)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب هنا سبب تغيير الحالة أو أي ملاحظات..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none transition-all"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors"
          >
            إلغاء
          </button>
          <button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className={`px-8 py-2.5 text-white text-sm font-black rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg ${
              config.newStatus === "cancelled"
                ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
                : config.newStatus === "frozen"
                  ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                  : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200"
            }`}
          >
            {updateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            تأكيد التغيير
          </button>
        </div>
      </div>
    </div>
  );
}
