import React, { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  FolderOpen,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  Download,
} from "lucide-react";

const NodeMediaTab = ({ selectedType, selectedNode }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const { data: mediaFiles, isLoading } = useQuery({
    queryKey: ["node-details", selectedType, selectedNode?.id, "media"],
    queryFn: async () =>
      (
        await api.get(
          `/riyadh-streets/details/${selectedType}/${selectedNode.id}/media`,
        )
      ).data,
    enabled: !!selectedNode,
  });

  const uploadMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("files", file);
      // إرسال الـ IDs بناءً على النوع
      if (selectedType === "sector")
        formData.append("sectorId", selectedNode.id);
      if (selectedType === "neighborhood")
        formData.append("districtId", selectedNode.id);

      return await api.post("/riyadh-streets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم رفع الملف بنجاح");
      queryClient.invalidateQueries([
        "node-details",
        selectedType,
        selectedNode?.id,
        "media",
      ]);
    },
    onError: () => toast.error("فشل رفع الملف"),
  });

  // 👈 هنا الدالة التي كانت مفقودة وتسببت في الخطأ
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200 shadow-sm">
        <h4 className="text-[13px] font-bold text-stone-800 flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-blue-500" /> ملفات ووسائط النطاق
        </h4>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="px-4 py-2 text-[11px] bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1.5 font-bold shadow-sm transition-colors"
        >
          {uploadMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          رفع ملف جديد
        </button>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaFiles?.map((file, idx) => (
          <div
            key={file.id}
            className="p-3 bg-white border border-stone-200 rounded-xl flex items-center gap-3 hover:border-blue-300 transition-colors"
          >
            <div
              className={`p-3 rounded-lg ${
                file.type === "PDF"
                  ? "bg-red-50 text-red-500"
                  : "bg-blue-50 text-blue-500"
              }`}
            >
              {file.type === "PDF" ? (
                <FileText className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-[11px] font-bold text-stone-800 truncate mb-1">
                {file.name}
              </h5>

              <div className="text-[9px] text-stone-500 font-mono">
                {file.size} MB • {file.date}
              </div>
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-stone-50 text-stone-500 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}

        {(!mediaFiles || mediaFiles.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
            <FolderOpen className="w-10 h-10 text-stone-300 mx-auto mb-2" />

            <p className="text-sm font-bold text-stone-500">
              لا توجد ملفات مرفوعة
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeMediaTab;
