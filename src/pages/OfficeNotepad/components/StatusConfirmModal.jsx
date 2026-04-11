import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { toast } from "sonner";
import { X, Check, Loader2 } from "lucide-react";

export default function StatusConfirmModal({ config, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const updateMutation = useMutation({
    mutationFn: () => api.put(`/office-tasks/${config.task.id}/status`, { status: config.newStatus, commentText: comment, authorName: currentUser?.name }),
    onSuccess: () => { toast.success("تم تغيير الحالة"); queryClient.invalidateQueries({ queryKey: ["office-tasks"] }); onClose(); },
  });

  const getStatusName = (st) => {
    if (st === "completed") return "مكتملة";
    if (st === "cancelled") return "ملغاة";
    return "نشطة";
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-900">تأكيد تغيير الحالة</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <p className="text-sm font-bold text-slate-700 mb-2">تأكيد الانتقال إلى الحالة:</p>
            <span className="px-4 py-2 rounded-xl text-sm font-black border inline-block bg-emerald-100 text-emerald-700 border-emerald-200">{getStatusName(config.newStatus)}</span>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500">إضافة تعليق يوضح السبب (اختياري)</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="مثال: تم تسليم المخططات للعميل..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px] resize-none" />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-50">إلغاء</button>
          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} className="px-6 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50">
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} تأكيد
          </button>
        </div>
      </div>
    </div>
  );
}