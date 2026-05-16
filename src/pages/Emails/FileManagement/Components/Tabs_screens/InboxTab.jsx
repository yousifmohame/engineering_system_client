import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import { toast } from "sonner";
import {
  Search,
  Filter,
  FileBox,
  Activity,
  Shield,
  Clock,
  FolderInput,
  Download,
  Eye,
  Trash2,
  Loader2,
  UploadCloud,
  FileText,
} from "lucide-react";
import { AIActionButton } from "../ai/AIActionButton";

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

export default function InboxTab({ inboxFiles = [], setAnalyzingFile }) {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [safeFilter, setSafeFilter] = useState("all");
  const [linkFilter, setLinkFilter] = useState("all");
  const [isDeleting, setIsDeleting] = useState(null);

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB";
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const deleteMutation = useMutation({
    mutationFn: async (fileId) => {
      await api.delete(`/transfer-center/files/${fileId}`);
    },

    onMutate: (fileId) => {
      setIsDeleting(fileId);
    },

    onSuccess: () => {
      toast.success("تم حذف الملف بنجاح");
      queryClient.invalidateQueries(["transfer-center-data"]);
    },

    onError: () => {
      toast.error("فشل حذف الملف، يرجى المحاولة لاحقاً");
    },

    onSettled: () => {
      setIsDeleting(null);
    },
  });

  const handleDelete = (e, id) => {
    e.preventDefault();

    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الملف نهائياً؟")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredFiles = inboxFiles.filter((file) => {
    const query = searchTerm.trim();

    const searchMatch =
      !query ||
      String(file.fileName || "").includes(query) ||
      String(file.originalName || "").includes(query) ||
      String(file.senderName || "").includes(query) ||
      String(file.fileRequest?.title || "").includes(query);

    const safeMatch =
      safeFilter === "all" ||
      (safeFilter === "safe" && file.isSafe) ||
      (safeFilter === "pending" && !file.isSafe);

    const linkMatch =
      linkFilter === "all" ||
      (linkFilter === "linked" && file.isProcessed) ||
      (linkFilter === "unlinked" && !file.isProcessed);

    return searchMatch && safeMatch && linkMatch;
  });

  return (
    <div
      className="
        flex h-full flex-1 flex-col overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Header / Filters */}
      <div
        className="
          shrink-0 border-b border-[#e8ddc8]
          bg-white/80 px-4 py-4 backdrop-blur-xl
        "
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                grid h-11 w-11 shrink-0 place-items-center
                rounded-2xl bg-gradient-to-br from-[#123f59] to-[#0e7490]
                text-[#e2bf74]
                shadow-[0_14px_30px_rgba(18,63,89,0.18)]
              "
            >
              <UploadCloud className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-base font-black text-[#123f59]">
                صندوق الملفات المستلمة
              </h2>

              <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                {filteredFiles.length} ملف معروض من أصل {inboxFiles.length}
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 md:flex-row xl:w-auto">
            <div className="relative flex-1 xl:w-72">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#c5983c]" />

              <input
                type="text"
                placeholder="بحث بالاسم أو اسم المرسل..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  h-10 w-full rounded-2xl border border-[#d8b46a]/30
                  bg-white pr-10 pl-3 text-xs font-bold text-[#123f59]
                  outline-none transition-all
                  placeholder:text-slate-400
                  focus:border-[#c5983c]/70
                  focus:ring-4 focus:ring-[#c5983c]/10
                "
              />
            </div>

            <select
              value={safeFilter}
              onChange={(e) => setSafeFilter(e.target.value)}
              className="
                h-10 rounded-2xl border border-[#d8b46a]/30
                bg-white px-3 text-xs font-black text-[#123f59]
                outline-none transition-all
                focus:border-[#c5983c]/70
                focus:ring-4 focus:ring-[#c5983c]/10
              "
            >
              <option value="all">إحصائيات الفحص</option>
              <option value="safe">مفحوص وآمن</option>
              <option value="pending">بانتظار الفحص</option>
            </select>

            <select
              value={linkFilter}
              onChange={(e) => setLinkFilter(e.target.value)}
              className="
                h-10 rounded-2xl border border-[#d8b46a]/30
                bg-white px-3 text-xs font-black text-[#123f59]
                outline-none transition-all
                focus:border-[#c5983c]/70
                focus:ring-4 focus:ring-[#c5983c]/10
              "
            >
              <option value="all">حالة الربط</option>
              <option value="linked">مرتبط</option>
              <option value="unlinked">غير مرتبط</option>
            </select>

            <button
              className="
                flex h-10 min-w-[48px] items-center justify-center
                rounded-2xl border border-[#d8b46a]/30 bg-white
                text-[#64748b] transition
                hover:bg-[#f8efe0] hover:text-[#123f59]
              "
              type="button"
              title="تصفية"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Files List */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid gap-3">
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              className="
                group relative overflow-hidden rounded-[26px]
                border border-[#d8b46a]/25 bg-white/90
                p-4 shadow-[0_14px_34px_rgba(18,63,89,0.08)]
                backdrop-blur-xl transition-all
                hover:-translate-y-[1px]
                hover:border-[#c5983c]/45
                hover:bg-[#fbf8f1]/80
                hover:shadow-[0_20px_45px_rgba(18,63,89,0.12)]
              "
            >
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[#fbf8f1]/45 via-white/10 to-transparent opacity-0 transition group-hover:opacity-100" />

              <div className="relative z-10 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                {/* File Info */}
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className="
                      grid h-12 w-12 shrink-0 place-items-center
                      rounded-2xl bg-rose-50 text-rose-500
                      shadow-sm transition group-hover:bg-rose-100
                    "
                  >
                    <FileBox className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h4
                        className="max-w-full truncate text-sm font-black text-[#123f59]"
                        dir="ltr"
                      >
                        {file.originalName || file.fileName}
                      </h4>

                      {file.isProcessed ? (
                        <StatusBadge
                          tone="blue"
                          icon={Activity}
                          label="مرتبط"
                        />
                      ) : (
                        <StatusBadge
                          tone="amber"
                          icon={Clock}
                          label="غير مرتبط"
                        />
                      )}
                    </div>

                    <p className="mb-2 text-[10px] font-bold text-[#64748b]">
                      المرسل:{" "}
                      <span className="font-black text-[#123f59]">
                        {file.senderName || "غير محدد"}
                      </span>{" "}
                      • {formatDate(file.uploadedAt)}
                    </p>

                    <div className="flex flex-wrap gap-2 text-[10px] font-black">
                      <InfoPill label={`الحجم: ${formatFileSize(file.fileSize)}`} />
                      <InfoPill
                        label={`المصدر: ${
                          file.fileRequest?.title || "استقبال عام"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 xl:items-end">
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <AIActionButton
                      label="استخراج البيانات"
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setAnalyzingFile({
                          name: file.originalName || file.fileName,
                          id: file.id,
                        })
                      }
                    />

                    {file.isSafe ? (
                      <StatusBadge
                        tone="emerald"
                        icon={Shield}
                        label="مفحوص وآمن"
                      />
                    ) : (
                      <StatusBadge
                        tone="amber"
                        icon={Clock}
                        label="قيد الفحص الأمني"
                      />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {!file.isProcessed && (
                      <ActionButton
                        label="تعيين"
                        tone="cyan"
                        title="تعيين لمجلد"
                      >
                        <FolderInput className="h-4 w-4" />
                      </ActionButton>
                    )}

                    <a
                      href={getFullUrl(file.filePath)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="معاينة الملف"
                    >
                      <ActionButton label="معاينة" tone="blue" asSpan>
                        <Eye className="h-4 w-4" />
                      </ActionButton>
                    </a>

                    <a
                      href={getFullUrl(file.filePath)}
                      download={file.originalName || file.fileName}
                      title="تنزيل الملف"
                    >
                      <ActionButton label="تنزيل" tone="emerald" asSpan>
                        <Download className="h-4 w-4" />
                      </ActionButton>
                    </a>

                    <ActionButton
                      label={isDeleting === file.id ? "حذف..." : "حذف"}
                      tone="rose"
                      title="حذف الملف"
                      disabled={isDeleting === file.id}
                      onClick={(e) => handleDelete(e, file.id)}
                    >
                      {isDeleting === file.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredFiles.length === 0 && (
            <div
              className="
                flex flex-col items-center justify-center
                rounded-[28px] border border-dashed border-[#d8b46a]/40
                bg-white/75 px-5 py-16 text-center
                shadow-[0_18px_45px_rgba(18,63,89,0.08)]
              "
            >
              <div
                className="
                  mb-4 grid h-16 w-16 place-items-center
                  rounded-[24px] bg-gradient-to-br from-[#123f59] to-[#0e7490]
                  text-[#e2bf74]
                  shadow-[0_16px_34px_rgba(18,63,89,0.22)]
                "
              >
                <Search className="h-8 w-8" />
              </div>

              <p className="text-sm font-black text-[#123f59]">
                لا توجد ملفات مستلمة تطابق بحثك
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                جرّب تغيير كلمات البحث أو الفلاتر.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const InfoPill = ({ label }) => (
  <span
    className="
      rounded-xl border border-[#e8ddc8]
      bg-[#fbf8f1] px-2.5 py-1
      text-[#64748b]
    "
  >
    {label}
  </span>
);

const StatusBadge = ({ icon: Icon, label, tone = "emerald" }) => {
  const tones = {
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-xl border
        px-2.5 py-1 text-[9px] font-black
        ${tones[tone] || tones.emerald}
      `}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {label}
    </span>
  );
};

const ActionButton = ({
  children,
  label,
  tone = "blue",
  title,
  onClick,
  disabled,
  asSpan = false,
}) => {
  const tones = {
    blue: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
    emerald:
      "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    rose: "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
  };

  const className = `
    flex min-w-[54px] flex-col items-center justify-center gap-0.5
    rounded-xl border px-2 py-1.5
    text-[8px] font-black leading-none
    transition-all hover:-translate-y-[1px]
    disabled:cursor-not-allowed disabled:opacity-50
    ${tones[tone] || tones.blue}
  `;

  if (asSpan) {
    return (
      <span className={className} title={title}>
        {children}
        <span>{label}</span>
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={className}
      type="button"
    >
      {children}
      <span>{label}</span>
    </button>
  );
};