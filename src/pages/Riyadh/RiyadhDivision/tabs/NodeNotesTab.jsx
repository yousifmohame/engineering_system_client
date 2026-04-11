import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { FileEdit, Plus, Loader2 } from "lucide-react";

const NodeNotesTab = ({ selectedType, selectedNode }) => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
    status: "نشطة",
  });

  const { data: notes, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "notes"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/notes`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  const addNoteMutation = useMutation({
    mutationFn: async (payload) =>
      await api.post(
        `/riyadh-streets/details/${selectedType}/${selectedNode.id}/notes`,
        payload,
      ),
    onSuccess: () => {
      toast.success("تمت إضافة الملاحظة");
      queryClient.invalidateQueries([
        "node-details",
        selectedType,
        selectedNode?.id,
        "notes",
      ]);
      setIsModalOpen(false);
      setNewNote({ title: "", content: "", status: "نشطة" });
    },
  });

  if (isLoading)
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200">
        <h4 className="text-[13px] font-bold text-stone-800 flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-amber-500" /> سجل الملاحظات والنبذات
        </h4>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-[11px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 font-bold shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> إضافة ملاحظة
        </button>
      </div>

      <div className="space-y-3">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-stone-200 bg-white p-4 transition-all hover:shadow-md"
          >
            <div className="flex items-start justify-between mb-2">
              <h5 className="text-[13px] font-bold text-stone-800">
                {note.title}
              </h5>

              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${note.status === "نشطة" ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}
              >
                {note.status}
              </span>
            </div>

            <p className="text-[11px] text-stone-600 mb-3 whitespace-pre-line leading-relaxed">
              {note.content}
            </p>

            <div className="text-[9px] text-stone-400 font-mono border-t border-stone-100 pt-2">
              {new Date(note.createdAt).toLocaleString("ar-SA")}
            </div>
          </div>
        ))}

        {(!notes || notes.length === 0) && (
          <div className="p-12 text-center bg-white rounded-xl border border-stone-200 border-dashed">
            <FileEdit className="w-10 h-10 text-stone-300 mx-auto mb-2" />

            <p className="text-sm font-bold text-stone-500">
              لا توجد ملاحظات مسجلة
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5">
            <h3 className="font-bold text-stone-800 mb-4">
              إضافة ملاحظة جديدة
            </h3>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="عنوان الملاحظة"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote({ ...newNote, title: e.target.value })
                }
                className="w-full p-2 border border-stone-300 rounded-lg text-sm outline-none focus:border-blue-500"
              />

              <textarea
                placeholder="التفاصيل..."
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                className="w-full h-24 p-2 border border-stone-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-stone-100 rounded-lg text-xs font-bold text-stone-700 flex-1"
              >
                إلغاء
              </button>

              <button
                onClick={() => addNoteMutation.mutate(newNote)}
                disabled={!newNote.title || addNoteMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold flex-1 disabled:opacity-50"
              >
                حفظ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodeNotesTab;
