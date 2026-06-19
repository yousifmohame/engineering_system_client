import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  Loader2,
  Save,
  CloudUpload,
  Eye,
  FileText,
  FileDown,
} from "lucide-react";
import { getFullUrl } from "../../../../../utils/urlUtils";

export function TabDocument({ permit }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newFile, setNewFile] = useState(null);

  const fileUrl = getFullUrl(permit?.attachmentUrl);
  const isImage = fileUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i) != null;
  const isPdf =
    fileUrl?.toLowerCase().endsWith(".pdf") || (fileUrl && !isImage);

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      return await api.put(`/permits/${permit.id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث مستند الرخصة بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
      setIsEditing(false);
      setNewFile(null);
    },
    onError: () => toast.error("حدث خطأ أثناء رفع المستند"),
  });

  const handleSave = () => {
    if (!newFile) return toast.error("يرجى اختيار ملف أولاً");
    uploadMutation.mutate(newFile);
  };

  return (
    <div className="space-y-4 p-4 animate-in fade-in">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-slate-700">
          مستند الرخصة
        </span>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="text-[10px] font-bold text-[#123B5D] bg-[#f4f7f8] px-3 py-1.5 rounded-lg hover:bg-[#edf2f4] flex items-center gap-1 transition-colors"
          >
            <Edit3 size={12} /> تحديث المرفق
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setNewFile(null);
              }}
              className="text-[10px] font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-200"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              disabled={uploadMutation.isPending || !newFile}
              className="text-[10px] font-bold text-white bg-[#0f3d50] px-3 py-1.5 rounded-lg hover:bg-[#174e65] flex items-center gap-1 disabled:opacity-50"
            >
              {uploadMutation.isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Save size={12} />
              )}{" "}
              حفظ المستند
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#d7b96d] rounded-xl bg-[#f4f7f8]/50 h-64 flex flex-col items-center justify-center text-[#0f3d50] cursor-pointer hover:bg-[#f4f7f8] transition-colors"
        >
          <CloudUpload size={32} className="mb-2" />
          <span className="text-sm font-bold">
            {newFile ? newFile.name : "اضغط لاختيار ملف PDF أو صورة"}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => setNewFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl bg-slate-50 h-[400px] flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
          {fileUrl ? (
            isPdf ? (
              <iframe
                src={fileUrl}
                className="w-full h-full rounded-xl"
                title="Permit Document"
              />
            ) : (
              <img
                src={fileUrl}
                alt="رخصة"
                className="w-full h-full object-contain"
              />
            )
          ) : (
            <>
              <FileText size={40} className="mb-2 opacity-50" />
              <span className="text-xs font-bold">المستند غير متوفر</span>
            </>
          )}
        </div>
      )}

      {!isEditing && fileUrl && (
        <div className="flex gap-2">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-[11px] font-bold bg-[#0f3d50] text-white rounded-lg py-2.5 hover:bg-[#174e65] flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Eye size={14} /> عرض المستند كامل
          </a>
          <a
            href={fileUrl}
            download
            className="flex-1 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-lg py-2.5 hover:bg-slate-200 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <FileDown size={14} /> تحميل المرفق
          </a>
        </div>
      )}
    </div>
  );
}
