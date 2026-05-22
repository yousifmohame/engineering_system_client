import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import { FileEdit, Plus, Loader2 } from "lucide-react";


const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-3.5 w-3.5 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 whitespace-nowrap text-[10px] font-black leading-none"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};


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
      <div className="p-4 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="space-y-2.5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-3 bg-[#fbf8f1] rounded-xl border border-[#e8ddc8]">
        <h4 className="text-[13px] font-bold text-[#123f59] flex items-center gap-2">
          <FileEdit className="w-4 h-4 text-amber-500" /> سجل الملاحظات والنبذات
        </h4>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-[11px] bg-[#0e7490] text-white rounded-lg hover:bg-[#15536f] flex items-center gap-1.5 font-bold shadow-[0_6px_14px_rgba(18,63,89,0.04)]"
        >
          <IconWithText icon={Plus} text="إضافة ملاحظة" iconClassName="w-3.5 h-3.5" /></button>
      </div>

      <div className="space-y-3">
        {notes?.map((note) => (
          <div
            key={note.id}
            className="rounded-xl border border-[#e8ddc8] bg-white p-4 transition-all hover:shadow-[0_8px_18px_rgba(18,63,89,0.05)]"
          >
            <div className="flex items-start justify-between mb-2">
              <h5 className="text-[13px] font-bold text-[#123f59]">
                {note.title}
              </h5>

              <span
                className={`px-2 py-0.5 rounded text-[9px] font-bold ${note.status === "نشطة" ? "bg-green-100 text-green-700" : "bg-[#e8ddc8] text-[#64748b]"}`}
              >
                {note.status}
              </span>
            </div>

            <p className="text-[11px] text-[#64748b] mb-3 whitespace-pre-line leading-relaxed">
              {note.content}
            </p>

            <div className="text-[9px] text-[#94a3b8] font-mono border-t border-[#fbf8f1] pt-2">
              {new Date(note.createdAt).toLocaleString("ar-SA")}
            </div>
          </div>
        ))}

        {(!notes || notes.length === 0) && (
          <div className="p-3 text-center bg-white rounded-xl border border-[#e8ddc8] border-dashed">
            <FileEdit className="w-10 h-10 text-[#cbd5e1] mx-auto mb-2" />

            <p className="text-sm font-bold text-[#94a3b8]">
              لا توجد ملاحظات مسجلة
            </p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#123f59]/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-3">
            <h3 className="font-bold text-[#123f59] mb-4">
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
                className="w-full p-2 border border-[#cbd5e1] rounded-lg text-sm outline-none focus:border-[#0e7490]"
              />

              <textarea
                placeholder="التفاصيل..."
                value={newNote.content}
                onChange={(e) =>
                  setNewNote({ ...newNote, content: e.target.value })
                }
                className="w-full h-24 p-2 border border-[#cbd5e1] rounded-lg text-sm outline-none focus:border-[#0e7490] resize-none"
              ></textarea>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[#fbf8f1] rounded-lg text-xs font-bold text-[#475569] flex-1"
              >
                إلغاء
              </button>

              <button
                onClick={() => addNoteMutation.mutate(newNote)}
                disabled={!newNote.title || addNoteMutation.isPending}
                className="px-4 py-2 bg-[#0e7490] text-white rounded-lg text-xs font-bold flex-1 disabled:opacity-50"
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
