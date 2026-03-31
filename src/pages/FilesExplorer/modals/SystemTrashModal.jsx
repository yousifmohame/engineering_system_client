import React, { useMemo } from "react";
import { X, Trash2, FolderOpen, File, RotateCcw, AlertOctagon, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "../../../api/axios";

export default function SystemTrashModal({ onClose, currentUser }) {
  const queryClient = useQueryClient();

  const { data: trashData, isLoading } = useQuery({
    queryKey: ["system-trash-items"],
    queryFn: async () => (await api.get("/system-files/trash")).data?.data || { folders: [], files: [] }
  });

  const deletedItems = useMemo(() => {
    if (!trashData) return [];
    return [
      ...(trashData.folders || []).map(f => ({ ...f, _type: "folder" })),
      ...(trashData.files || []).map(f => ({ ...f, _type: "file" }))
    ].sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));
  }, [trashData]);

  const restoreMutation = useMutation({
    mutationFn: async ({ id, type }) => api.post("/system-files/restore", {
      folderIds: type === "folder" ? [id] : [],
      fileIds: type === "file" ? [id] : [],
      restoredBy: currentUser
    }),
    onSuccess: () => {
      toast.success("تم الاستعادة بنجاح");
      queryClient.invalidateQueries(["system-trash-items"]);
      queryClient.invalidateQueries(["system-files"]);
    }
  });

  const permanentDeleteMutation = useMutation({
    mutationFn: async ({ id, type }) => api.post("/system-files/permanent-delete", {
      folderIds: type === "folder" ? [id] : [],
      fileIds: type === "file" ? [id] : [],
      deletedBy: currentUser
    }),
    onSuccess: () => {
      toast.success("تم الحذف النهائي بنجاح");
      queryClient.invalidateQueries(["system-trash-items"]);
    }
  });

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[500] backdrop-blur-sm p-4" onClick={onClose} dir="rtl">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-red-100 bg-red-50/80 shrink-0">
          <div className="flex items-center gap-3 text-red-900">
            <div className="p-2 bg-red-100 rounded-lg"><Trash2 size={24} className="text-red-600" /></div>
            <div>
              <h3 className="text-lg font-bold">سلة المحذوفات المركزية</h3>
              <p className="text-xs text-red-500 font-semibold mt-0.5">ملفات ومجلدات النظام المحذوفة مؤقتاً</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition-colors"><X size={20} /></button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 custom-scrollbar-slim">
          {isLoading ? (
             <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-500" size={40} /></div>
          ) : deletedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-80 gap-3 py-10">
              <Trash2 size={64} className="text-slate-300 mb-2" />
              <p className="text-xl font-bold text-slate-600">سلة المحذوفات فارغة</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {deletedItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                  <div className={`p-3 rounded-lg shrink-0 ${item._type === "folder" ? "bg-amber-50 text-amber-500" : "bg-slate-50 text-slate-500"}`}>
                    {item._type === "folder" ? <FolderOpen size={24} /> : <File size={24} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-sm truncate">{item.originalName || item.name}</div>
                    <div className="text-xs text-slate-500 mt-1.5 flex gap-3">
                      <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded font-bold">حذف بواسطة: {item.deletedBy || "النظام"}</span>
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded font-mono">{new Date(item.deletedAt).toLocaleString("ar-EG")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => restoreMutation.mutate({ id: item.id, type: item._type })} disabled={restoreMutation.isPending} className="px-4 py-2 text-xs font-bold bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 flex items-center gap-1 disabled:opacity-50 transition-colors shadow-sm">
                      <RotateCcw size={14} /> استعادة
                    </button>
                    <button onClick={() => { if(window.confirm("حذف نهائي لا رجعة فيه؟")) permanentDeleteMutation.mutate({ id: item.id, type: item._type }); }} disabled={permanentDeleteMutation.isPending} className="px-4 py-2 text-xs font-bold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 flex items-center gap-1 disabled:opacity-50 transition-colors shadow-sm">
                      <Trash2 size={14} /> حذف نهائي
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-slate-200 flex justify-between items-center shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 font-bold"><AlertOctagon size={16} className="text-amber-500" /><span>العناصر المحذوفة نهائياً لا يمكن استعادتها أبداً.</span></div>
          <button onClick={onClose} className="px-8 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-700 shadow-md transition-colors">إغلاق</button>
        </div>
      </div>
    </div>
  );
}