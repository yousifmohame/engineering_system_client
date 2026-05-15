import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../api/axios";
import { toast } from "sonner";
import {
  FolderOpen,
  FileText,
  UploadCloud,
  FolderPlus,
  Trash2,
  Check,
  Loader2,
  FileBox,
  Image as ImageIcon,
  Clock,
  ChevronLeft,
  ArrowRight,
  ExternalLink,
  Download,
  Printer,
  Paperclip,
  X,
  Folder,
  Archive,
} from "lucide-react";

// معالجة الروابط لتعمل مع الباك إند
export const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;

  let fixedUrl = url;

  if (url.startsWith("/uploads/")) {
    fixedUrl = `/api${url}`;
  }

  const baseUrl = "https://details-worksystem1.com";
  return `${baseUrl}${fixedUrl}`;
};

export const AttachmentsTab = ({
  tx,
  currentUser,
  backendUrl,
}) => {
  const queryClient = useQueryClient();

  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [currentFolderName, setCurrentFolderName] = useState("");

  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [previewFileUrl, setPreviewFileUrl] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");

  const { data: folderData = { folders: [], files: [] }, isLoading } = useQuery({
    queryKey: ["transaction-folders", tx.id, currentFolderId],
    queryFn: async () => {
      const params = new URLSearchParams({ transactionId: tx.id });

      if (currentFolderId) {
        params.append("folderId", currentFolderId);
      }

      const res = await api.get(`/files/contents?${params.toString()}`);

      return res.data || { folders: [], files: [] };
    },
    enabled: !!tx.id,
  });

  const createFolderMutation = useMutation({
    mutationFn: async (folderName) => {
      return api.post("/files/folder", {
        name: folderName,
        transactionId: tx.id,
        parentId: currentFolderId || null,
        createdBy: currentUser,
      });
    },
    onSuccess: () => {
      toast.success("تم إنشاء المجلد بنجاح");
      setNewFolderName("");
      setIsCreatingFolder(false);

      queryClient.invalidateQueries([
        "transaction-folders",
        tx.id,
        currentFolderId,
      ]);
    },
    onError: () => toast.error("حدث خطأ أثناء إنشاء المجلد"),
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const fd = new FormData();

      fd.append("files", file);
      fd.append("transactionId", tx.id);

      if (currentFolderId) {
        fd.append("folderId", currentFolderId);
      }

      fd.append("uploadedBy", currentUser);

      return api.post("/files/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تم رفع الملف بنجاح");

      queryClient.invalidateQueries([
        "transaction-folders",
        tx.id,
        currentFolderId,
      ]);
    },
    onError: () => toast.error("حدث خطأ أثناء رفع الملف"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async ({ id, type }) => {
      const payload = {
        deletedBy: currentUser,
        transactionId: tx.id,
      };

      if (type === "folder") {
        payload.folderIds = [id];
      }

      if (type === "file") {
        payload.fileIds = [id];
      }

      return api.post("/files/delete", payload);
    },
    onSuccess: () => {
      toast.success("تم النقل لسلة المحذوفات");

      queryClient.invalidateQueries([
        "transaction-folders",
        tx.id,
        currentFolderId,
      ]);
    },
  });

  const getFileIcon = (filename) => {
    if (!filename) {
      return <FileBox className="h-8 w-8 text-slate-500" />;
    }

    const ext = filename.split(".").pop().toLowerCase();

    if (["pdf"].includes(ext)) {
      return <FileText className="h-8 w-8 text-rose-500" />;
    }

    if (["jpg", "jpeg", "png", "webp"].includes(ext)) {
      return <ImageIcon className="h-8 w-8 text-cyan-600" />;
    }

    return <FileBox className="h-8 w-8 text-slate-500" />;
  };

  const formatSize = (bytes) => {
    if (!bytes) return "0 B";

    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFileMutation.mutate(e.dataTransfer.files[0]);
    }
  };

  const openRootFolder = () => {
    setCurrentFolderId(null);
    setCurrentFolderName("");
  };

  return (
    <div
      className="
        flex h-full min-h-[500px] flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        animate-in fade-in
      "
      dir="rtl"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      {/* Toolbar */}
      <div
        className="
          relative shrink-0 overflow-hidden rounded-t-[26px]
          border border-[#d8b46a]/30
          bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
          p-4 shadow-[0_18px_45px_rgba(18,63,89,0.18)]
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-[#c5983c]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-cyan-400/12 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Breadcrumb */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <button
              onClick={openRootFolder}
              className={`
                flex items-center gap-2 rounded-2xl border px-4 py-2
                text-xs font-black transition-all
                ${
                  !currentFolderId
                    ? "border-[#e2bf74]/40 bg-[#e2bf74] text-[#123f59]"
                    : "border-white/15 bg-white/10 text-white hover:bg-white/15"
                }
              `}
              type="button"
            >
              <FolderOpen className="h-4 w-4" />
              الملفات الأساسية
            </button>

            {currentFolderId && (
              <>
                <ChevronLeft className="h-4 w-4 text-[#e2bf74]/70" />

                <div
                  className="
                    flex max-w-[220px] items-center gap-2 rounded-2xl
                    border border-[#e2bf74]/35 bg-white/10
                    px-4 py-2 text-xs font-black text-white
                    backdrop-blur-md
                  "
                >
                  <Folder className="h-4 w-4 shrink-0 text-[#e2bf74]" />
                  <span className="truncate">{currentFolderName}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isCreatingFolder ? (
              <div
                className="
                  flex items-center gap-1 rounded-2xl
                  border border-white/15 bg-white/10
                  p-1.5 backdrop-blur-md
                  animate-in slide-in-from-left-2
                "
              >
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="اسم المجلد..."
                  className="
                    h-9 w-36 rounded-xl border border-white/15
                    bg-white/90 px-3 text-xs font-bold text-[#123f59]
                    outline-none focus:border-[#e2bf74]
                  "
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newFolderName.trim()) {
                      createFolderMutation.mutate(newFolderName);
                    }
                  }}
                />

                <button
                  onClick={() =>
                    newFolderName.trim() &&
                    createFolderMutation.mutate(newFolderName)
                  }
                  disabled={
                    createFolderMutation.isPending || !newFolderName.trim()
                  }
                  className="
                    grid h-9 w-9 place-items-center rounded-xl
                    bg-emerald-500 text-white transition
                    hover:bg-emerald-600 disabled:opacity-50
                  "
                  type="button"
                >
                  {createFolderMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderName("");
                  }}
                  className="
                    grid h-9 w-9 place-items-center rounded-xl
                    bg-white/10 text-white transition hover:bg-rose-500
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreatingFolder(true)}
                className="
                  flex h-11 items-center gap-2 rounded-2xl
                  border border-white/15 bg-white/10 px-4
                  text-xs font-black text-white transition
                  hover:bg-white/15
                "
                type="button"
              >
                <FolderPlus className="h-4 w-4 text-[#e2bf74]" />
                مجلد جديد
              </button>
            )}

            <label
              className="
                flex h-11 cursor-pointer items-center gap-2 rounded-2xl
                bg-white px-5 text-xs font-black text-[#123f59]
                shadow-[0_12px_30px_rgba(255,255,255,0.14)]
                transition hover:-translate-y-[1px] hover:bg-[#fbf8f1]
              "
            >
              {uploadFileMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#c5983c]" />
              ) : (
                <UploadCloud className="h-4 w-4 text-[#c5983c]" />
              )}

              {uploadFileMutation.isPending ? "جاري الرفع..." : "رفع ملف هنا"}

              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    uploadFileMutation.mutate(e.target.files[0]);
                  }
                }}
                disabled={uploadFileMutation.isPending}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <div
        className="
          relative min-h-0 flex-1 overflow-y-auto
          rounded-b-[26px] border-x border-b border-[#d8b46a]/30
          bg-white/85 p-4 shadow-[0_18px_45px_rgba(18,63,89,0.08)]
          custom-scrollbar-slim
        "
      >
        {currentFolderId && (
          <button
            onClick={openRootFolder}
            className="
              mb-4 flex w-fit items-center gap-2 rounded-2xl
              border border-[#d8b46a]/30 bg-[#fbf8f1]
              px-4 py-2 text-xs font-black text-[#123f59]
              shadow-sm transition hover:bg-[#f8efe0]
            "
            type="button"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للملفات الأساسية
          </button>
        )}

        {isLoading ? (
          <div className="flex h-56 flex-col items-center justify-center text-[#64748b]">
            <Loader2 className="mb-3 h-9 w-9 animate-spin text-[#c5983c]" />
            <p className="text-xs font-black">جاري جلب الملفات والمجلدات...</p>
          </div>
        ) : folderData.folders.length === 0 && folderData.files.length === 0 ? (
          <div
            className="
              mx-auto mt-6 flex h-72 max-w-xl flex-col items-center
              justify-center rounded-[26px] border border-dashed
              border-[#d8b46a]/45 bg-[#fbf8f1]/70
              p-6 text-center shadow-sm
            "
          >
            <div
              className="
                mb-4 grid h-20 w-20 place-items-center rounded-[28px]
                bg-[#f8efe0] text-[#c5983c]
              "
            >
              <UploadCloud className="h-12 w-12" />
            </div>

            <p className="mb-1 text-sm font-black text-[#123f59]">
              المجلد فارغ تماماً
            </p>

            <p className="text-xs font-bold leading-relaxed text-[#64748b]">
              يمكنك النقر على زر{" "}
              <span className="font-black text-[#c5983c]">رفع ملف هنا</span>{" "}
              في الأعلى
              <br />
              أو سحب وإفلات الملفات مباشرة داخل هذه الشاشة لرفعها.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {/* Folders */}
            {folderData.folders.map((folder) => (
              <div
                key={folder.id}
                onDoubleClick={() => {
                  setCurrentFolderId(folder.id);
                  setCurrentFolderName(folder.name);
                }}
                className="
                  group relative flex cursor-pointer flex-col items-center
                  rounded-[24px] border border-[#d8b46a]/30
                  bg-gradient-to-br from-[#fbf8f1] via-white to-[#eef7f6]
                  p-4 text-center shadow-sm transition-all
                  hover:-translate-y-[2px] hover:border-[#c5983c]/55
                  hover:shadow-[0_16px_35px_rgba(18,63,89,0.12)]
                "
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();

                    if (
                      window.confirm(
                        `هل أنت متأكد من حذف مجلد "${folder.name}" وما يحتويه؟`,
                      )
                    ) {
                      deleteItemMutation.mutate({
                        id: folder.id,
                        type: "folder",
                      });
                    }
                  }}
                  className="
                    absolute right-2 top-2 grid h-8 w-8 place-items-center
                    rounded-xl bg-rose-50 text-rose-500 opacity-0
                    transition-all hover:bg-rose-500 hover:text-white
                    group-hover:opacity-100
                  "
                  type="button"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>

                <div
                  className="
                    mb-3 grid h-20 w-20 place-items-center rounded-[28px]
                    bg-[#f8efe0] text-[#c5983c]
                    transition-transform duration-300 group-hover:scale-105
                  "
                >
                  <FolderOpen
                    className="h-12 w-12 fill-[#f5d99b] text-[#c5983c]"
                    strokeWidth={1.5}
                  />
                </div>

                <h4
                  className="w-full truncate px-2 text-xs font-black text-[#123f59]"
                  title={folder.name}
                >
                  {folder.name}
                </h4>

                <p className="mt-1 text-[10px] font-bold text-[#64748b]">
                  انقر مرتين للفتح
                </p>
              </div>
            ))}

            {/* Files */}
            {folderData.files.map((file) => {
              const displayName =
                file.originalName || file.name || "ملف غير معروف";

              const fileUrl = file.path || file.url;
              const fullUrl = getFullUrl(fileUrl);

              return (
                <div
                  key={file.id}
                  className="
                    group relative flex flex-col overflow-hidden
                    rounded-[24px] border border-[#d8b46a]/30 bg-white
                    p-4 shadow-sm transition-all
                    hover:-translate-y-[2px] hover:border-[#c5983c]/55
                    hover:shadow-[0_16px_35px_rgba(18,63,89,0.12)]
                  "
                >
                  <div className="absolute left-2 right-2 top-2 z-10 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setPreviewFileUrl(fullUrl);
                        setPreviewFileName(displayName);
                      }}
                      className="
                        grid h-8 w-8 place-items-center rounded-xl
                        bg-[#123f59] text-[#e2bf74]
                        shadow-sm transition hover:bg-[#0f3448]
                      "
                      title="عرض الملف"
                      type="button"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm("حذف هذا الملف؟")) {
                          deleteItemMutation.mutate({
                            id: file.id,
                            type: "file",
                          });
                        }
                      }}
                      className="
                        grid h-8 w-8 place-items-center rounded-xl
                        bg-rose-500 text-white shadow-sm
                        transition hover:bg-rose-700
                      "
                      title="حذف الملف"
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="relative flex flex-1 flex-col items-center justify-center py-5">
                    {fileUrl?.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                      <div
                        className="
                          h-20 w-20 overflow-hidden rounded-[24px]
                          border border-[#d8b46a]/35 bg-[#fbf8f1]
                          shadow-sm transition-transform group-hover:scale-105
                        "
                      >
                        <img
                          src={fullUrl}
                          alt={displayName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    ) : (
                      <div
                        className="
                          grid h-20 w-20 place-items-center rounded-[24px]
                          bg-[#fbf8f1] transition-transform
                          group-hover:scale-105
                        "
                      >
                        {getFileIcon(displayName)}
                      </div>
                    )}
                  </div>

                  <div className="mt-auto border-t border-[#e8ddc8] pt-3 text-center">
                    <h4
                      className="
                        mb-1 w-full cursor-pointer truncate
                        text-[11px] font-black text-[#123f59]
                        transition hover:text-[#c5983c]
                      "
                      title={displayName}
                      onClick={() => {
                        setPreviewFileUrl(fullUrl);
                        setPreviewFileName(displayName);
                      }}
                    >
                      {displayName}
                    </h4>

                    <div className="flex items-center justify-center gap-2 text-[9px] font-black text-[#64748b]">
                      <span dir="ltr">{formatSize(file.size)}</span>

                      <span className="flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5 text-[#c5983c]" />
                        {new Date(file.createdAt).toLocaleDateString("en-GB")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFileUrl && (
        <div
          className="
            fixed inset-0 z-[200] flex items-center justify-center
            bg-slate-900/80 p-4 backdrop-blur-md
            animate-in fade-in sm:p-10
          "
          onClick={() => setPreviewFileUrl(null)}
        >
          <div
            className="
              relative flex h-[90vh] w-full max-w-5xl
              flex-col overflow-hidden rounded-[28px]
              bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)]
            "
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="
                flex shrink-0 items-center justify-between
                bg-gradient-to-l from-[#08111c] via-[#0f3448] to-[#123f59]
                px-5 py-4 text-white
              "
            >
              <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                <span
                  className="
                    grid h-10 w-10 shrink-0 place-items-center
                    rounded-2xl bg-[#e2bf74] text-[#123f59]
                  "
                >
                  <Paperclip className="h-5 w-5" />
                </span>

                <h3
                  className="truncate text-sm font-black"
                  title={previewFileName}
                >
                  {previewFileName}
                </h3>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <a
                  href={previewFileUrl}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex items-center gap-1.5 rounded-2xl
                    border border-white/15 bg-white/10
                    px-3 py-2 text-xs font-black text-white
                    transition hover:bg-white/15
                  "
                >
                  <Download className="h-4 w-4 text-[#e2bf74]" />
                  <span className="hidden sm:inline">تحميل</span>
                </a>

                <button
                  onClick={() => {
                    const printWindow = window.open(previewFileUrl);
                    if (printWindow) {
                      printWindow.print();
                    }
                  }}
                  className="
                    flex items-center gap-1.5 rounded-2xl
                    border border-white/15 bg-white/10
                    px-3 py-2 text-xs font-black text-white
                    transition hover:bg-white/15
                  "
                  type="button"
                >
                  <Printer className="h-4 w-4 text-[#e2bf74]" />
                  <span className="hidden sm:inline">طباعة</span>
                </button>

                <div className="mx-1 h-7 w-px bg-white/15" />

                <button
                  onClick={() => setPreviewFileUrl(null)}
                  className="
                    grid h-10 w-10 place-items-center rounded-2xl
                    bg-rose-500 text-white transition hover:bg-rose-600
                  "
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#eef7f6] p-3">
              {previewFileUrl.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewFileUrl}
                  className="
                    h-full w-full rounded-2xl border border-[#d8b46a]/35
                    bg-white shadow-inner
                  "
                  title="PDF Preview"
                />
              ) : previewFileUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
                  <img
                    src={previewFileUrl}
                    alt="Preview"
                    className="
                      max-h-full max-w-full rounded-2xl
                      border-4 border-white object-contain
                      shadow-[0_18px_45px_rgba(18,63,89,0.20)]
                    "
                  />
                </div>
              ) : (
                <div className="text-center text-[#64748b]">
                  <ExternalLink className="mx-auto mb-4 h-16 w-16 text-[#c5983c]/45" />

                  <p className="mb-4 text-sm font-black text-[#123f59]">
                    هذا النوع من الملفات لا يمكن معاينته داخل التطبيق مباشرة
                  </p>

                  <a
                    href={previewFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="
                      inline-flex items-center gap-2 rounded-2xl
                      bg-[#123f59] px-6 py-3
                      text-xs font-black text-white
                      transition hover:bg-[#0f3448]
                    "
                  >
                    <Download className="h-4 w-4 text-[#e2bf74]" />
                    تحميل أو فتح في علامة تبويب جديدة
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};