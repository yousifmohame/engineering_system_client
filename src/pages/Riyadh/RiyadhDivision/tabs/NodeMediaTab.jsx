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
    <div className="space-y-2.5 animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#e8ddc8] shadow-[0_6px_14px_rgba(18,63,89,0.04)]">
        <h4 className="text-[13px] font-bold text-[#123f59] flex items-center gap-2">
          <FolderOpen className="w-4 h-4 text-[#0e7490]" /> ملفات ووسائط النطاق
        </h4>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMutation.isPending}
          className="px-4 py-2 text-[11px] bg-[#0e7490] text-white rounded-lg hover:bg-[#15536f] flex items-center gap-1.5 font-bold shadow-[0_6px_14px_rgba(18,63,89,0.04)] transition-colors"
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {mediaFiles?.map((file, idx) => (
          <div
            key={file.id}
            className="p-3 bg-white border border-[#e8ddc8] rounded-xl flex items-center gap-3 hover:border-[#d8b46a]/40 transition-colors"
          >
            <div
              className={`p-3 rounded-lg ${
                file.type === "PDF"
                  ? "bg-red-50 text-red-500"
                  : "bg-[#eef7f6] text-[#0e7490]"
              }`}
            >
              {file.type === "PDF" ? (
                <FileText className="w-6 h-6" />
              ) : (
                <ImageIcon className="w-6 h-6" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h5 className="text-[11px] font-bold text-[#123f59] truncate mb-1">
                {file.name}
              </h5>

              <div className="text-[9px] text-[#94a3b8] font-mono">
                {file.size} MB • {file.date}
              </div>
            </div>

            <a
              href={file.url}
              target="_blank"
              rel="noreferrer"
              className="p-2 bg-[#fbf8f1] text-[#94a3b8] rounded-lg hover:bg-[#e8ddc8] transition-colors"
            >
              <Download className="w-4 h-4" />
            </a>
          </div>
        ))}

        {(!mediaFiles || mediaFiles.length === 0) && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[#e8ddc8] rounded-xl bg-[#fbf8f1]">
            <FolderOpen className="w-10 h-10 text-[#cbd5e1] mx-auto mb-2" />

            <p className="text-sm font-bold text-[#94a3b8]">
              لا توجد ملفات مرفوعة
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NodeMediaTab;
