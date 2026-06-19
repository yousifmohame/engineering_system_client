import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import {
  FileText,
  Loader2,
  Trash2,
  CloudUpload,
  User,
  Paperclip,
  Clock,
} from "lucide-react";
import { useAuth } from "../../../../../context/AuthContext";
import { getFullUrl } from "../../../../../utils/urlUtils";

export function TabExtraAttachments({ permit }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // 💡 جلب بيانات المستخدم الحالي من الـ Auth Context
  const { user } = useAuth();

  const [attachments, setAttachments] = useState(() => {
    try {
      return permit.extraAttachments ? JSON.parse(permit.extraAttachments) : [];
    } catch {
      return [];
    }
  });

  const [newFile, setNewFile] = useState(null);
  const [fileNote, setFileNote] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async (fileToUpload) => {
      const fd = new FormData();
      fd.append("file", fileToUpload);
      const res = await api.post(`/attachments/upload-general`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (data) => {
      const newAttachment = {
        id: Date.now().toString(),
        name: newFile.name,
        url: data.url || `/uploads/general/${newFile.name}`,
        size: newFile.size,
        note: fileNote,
        uploadDate: new Date().toISOString(),
        // 💡 استخدام اسم الموظف الفعلي أو الافتراضي في حال عدم توفره
        uploader: user?.name || user?.fullName || "موظف النظام",
      };

      const updatedAttachments = [...attachments, newAttachment];
      saveAttachmentsToPermit.mutate(updatedAttachments);
    },
    onError: () =>
      toast.error("حدث خطأ أثناء رفع الملف. تأكد من وجود مسار الرفع العام."),
  });

  const saveAttachmentsToPermit = useMutation({
    mutationFn: async (updatedArray) => {
      return await api.put(`/permits/${permit.id}`, {
        extraAttachments: JSON.stringify(updatedArray),
      });
    },
    onSuccess: (_, variables) => {
      setAttachments(variables);
      setNewFile(null);
      setFileNote("");
      toast.success("تم تحديث المرفقات الإضافية بنجاح");
      queryClient.invalidateQueries(["building-permits"]);
    },
  });

  const handleDelete = (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا المرفق؟")) return;
    const updated = attachments.filter((a) => a.id !== id);
    saveAttachmentsToPermit.mutate(updated);
  };

  const handleUpload = () => {
    if (!newFile) return toast.error("يرجى اختيار ملف");
    uploadMutation.mutate(newFile);
  };

  return (
    <div className="p-5 animate-in fade-in space-y-6">
      <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-4">
        <h4 className="text-[12px] font-black text-slate-800 flex items-center gap-2">
          <CloudUpload size={16} className="text-[#0f3d50]" /> رفع مرفق إضافي
        </h4>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`flex items-center justify-between p-3 border border-dashed rounded-xl cursor-pointer transition-colors ${newFile ? "border-emerald-400 bg-emerald-50" : "border-slate-300 bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Paperclip
                  size={16}
                  className={newFile ? "text-emerald-500" : "text-slate-400"}
                />
                <span
                  className={`text-[11px] font-bold truncate ${newFile ? "text-emerald-700" : "text-slate-500"}`}
                >
                  {newFile
                    ? newFile.name
                    : "اضغط لاختيار ملف (PDF, صور, مخططات)..."}
                </span>
              </div>
              {newFile && (
                <span className="text-[9px] font-bold text-emerald-600 bg-white px-2 py-1 rounded-md">
                  {formatBytes(newFile.size)}
                </span>
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setNewFile(e.target.files[0])}
              />
            </div>

            <input
              type="text"
              value={fileNote}
              onChange={(e) => setFileNote(e.target.value)}
              placeholder="اسم داخلي للمستند أو ملاحظة (اختياري)..."
              className="w-full p-3 text-[11px] font-bold border border-slate-200 rounded-xl outline-none focus:border-blue-400 bg-white"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={
              !newFile ||
              uploadMutation.isPending ||
              saveAttachmentsToPermit.isPending
            }
            className="md:w-32 h-auto py-3 md:py-0 bg-[#0f3d50] text-white font-black text-[11px] rounded-xl hover:bg-[#174e65] shadow-md flex flex-col items-center justify-center gap-2 disabled:opacity-50 transition-all"
          >
            {uploadMutation.isPending || saveAttachmentsToPermit.isPending ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <CloudUpload size={20} />
            )}
            <span>رفع وحفظ</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-right">
          <thead className="bg-slate-50 text-[10px] font-black text-slate-500 border-b border-slate-200">
            <tr>
              <th className="p-3 w-1/3">اسم المستند وملاحظاته</th>
              <th className="p-3">تاريخ الرفع</th>
              <th className="p-3">بواسطة</th>
              <th className="p-3">الحجم</th>
              <th className="p-3 text-center w-24">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-[11px] font-bold text-slate-700">
            {attachments.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-slate-400">
                  لا توجد مرفقات إضافية مسجلة لهذه الرخصة.
                </td>
              </tr>
            ) : (
              attachments.map((att) => (
                <tr
                  key={att.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-3">
                    <div className="flex items-start gap-2">
                      <FileText
                        size={16}
                        className="text-[#0f3d50] mt-0.5 shrink-0"
                      />
                      <div>
                        <a
                          href={getFullUrl(att.url)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[#123B5D] hover:underline"
                        >
                          {att.name}
                        </a>
                        {att.note && (
                          <div className="text-[10px] text-slate-500 mt-1 leading-relaxed bg-slate-100 p-1.5 rounded-md inline-block">
                            {att.note}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} />{" "}
                      {new Date(att.uploadDate).toLocaleDateString("ar-EG")}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />{" "}
                      {att.uploader}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[10px] text-slate-500">
                    {formatBytes(att.size)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(att.id)}
                      className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="حذف المرفق"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
