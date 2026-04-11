import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../api/axios";
import { MessageSquare, X, User } from "lucide-react";

export default function CommentsModal({ task, onClose, currentUser }) {
  const queryClient = useQueryClient();
  const [text, setText] = useState("");

  const addMutation = useMutation({
    mutationFn: (text) => api.post(`/office-tasks/${task.id}/comments`, { text, authorName: currentUser?.name || "مستخدم" }),
    onSuccess: () => { queryClient.invalidateQueries(["office-tasks"]); setText(""); },
  });

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[200] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in" dir="rtl">
      <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
          <div><h3 className="text-xl font-black text-slate-900 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-600" /> الملاحظات والتعليقات</h3><p className="text-xs font-bold text-slate-600 mt-1 leading-relaxed truncate max-w-md">{task.description}</p></div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50 custom-scrollbar-slim">
          <div className="relative border-r-2 border-slate-200 pr-6 space-y-6 ml-4 py-2">
            {task.comments?.map((c) => (
              <div key={c.id} className="relative">
                <div className={`absolute -right-[31px] top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm ${c.isSystem ? "bg-amber-500" : "bg-emerald-500"}`}></div>
                <div className={`p-4 rounded-2xl border shadow-sm ${c.isSystem ? "bg-amber-50/50 border-amber-100" : "bg-white border-slate-200"}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center"><User className="w-3 h-3 text-slate-500" /></div><span className="font-bold text-slate-800 text-sm">{c.authorName}</span></div>
                    <div className="flex items-center gap-2"><div className="text-left"><div className="text-[10px] font-mono text-slate-400">{new Date(c.createdAt).toLocaleDateString("ar-SA")}</div><div className="text-[10px] font-mono text-slate-400">{new Date(c.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</div></div></div>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed whitespace-pre-wrap mt-2">{c.text}</p>
                </div>
              </div>
            ))}
            {(!task.comments || task.comments.length === 0) && <p className="text-center text-sm font-bold text-slate-400 py-10">لا توجد تعليقات</p>}
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-white shrink-0">
          <div className="flex gap-2">
            <textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); addMutation.mutate(text); } }} placeholder="اكتب تعليقاً جديداً..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none h-12" />
            <button onClick={() => addMutation.mutate(text)} disabled={!text || addMutation.isPending} className="px-6 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-700 disabled:opacity-50">إرسال</button>
          </div>
        </div>
      </div>
    </div>
  );
}