import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";
import {
  FolderOpen,
  X,
  Home,
  ChevronLeft,
  Folder,
  File,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Database,
  Search,
  FolderCheck,
  FileCheck2,
  AlertCircle,
} from "lucide-react";

const SYSTEM_ROOT_FOLDERS = [
  { id: "sys-transactions", name: "ملفات المعاملات", isSystemRoot: true },
  { id: "sys-forms", name: "مخرجات النماذج الداخلية", isSystemRoot: true },
  { id: "sys-hr", name: "شؤون الموظفين (HR)", isSystemRoot: true },
  { id: "sys-finance", name: "الإدارة المالية", isSystemRoot: true },
  { id: "sys-legal", name: "الشؤون القانونية", isSystemRoot: true },
  { id: "sys-archive", name: "الأرشيف العام", isSystemRoot: true },
];

export default function FileSelectorModal({ isOpen, onClose, onSelect }) {
  const [pathStack, setPathStack] = useState([
    {
      id: "root",
      name: "ملفات النظام المركزية",
    },
  ]);

  const currentFolder = pathStack[pathStack.length - 1];
  const isAtRoot = currentFolder.id === "root";

  const { data: folderContents, isLoading } = useQuery({
    queryKey: ["system-files-picker", currentFolder.id],
    queryFn: async () => {
      if (isAtRoot) {
        return {
          folders: SYSTEM_ROOT_FOLDERS,
          files: [],
        };
      }

      const res = await api.get(
        `/system-files/contents?folderId=${currentFolder.id}`,
      );

      return (
        res.data.data || {
          folders: [],
          files: [],
        }
      );
    },
    enabled: isOpen,
  });

  if (!isOpen) return null;

  const folders = folderContents?.folders || [];
  const files = folderContents?.files || [];

  const handleNavigateForward = (folder) => {
    setPathStack([
      ...pathStack,
      {
        id: folder.id,
        name: folder.name,
      },
    ]);
  };

  const handleNavigateToStep = (index) => {
    setPathStack(pathStack.slice(0, index + 1));
  };

  const buildPathString = (itemName = "") => {
    const basePath = pathStack.map((item) => item.name).join("/");
    return itemName ? `${basePath}/${itemName}` : basePath;
  };

  return (
    <div
      className="
        fixed inset-0 z-[300] flex items-center justify-center
        bg-[#06111d]/70 p-4 backdrop-blur-md
        animate-in fade-in
      "
      dir="rtl"
    >
      <div
        className="
          flex max-h-[84vh] w-full max-w-3xl flex-col overflow-hidden
          rounded-[32px] border border-[#d8b46a]/35
          bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]
          animate-in zoom-in-95 duration-200
        "
      >
        {/* Header */}
        <div
          className="
            relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white md:px-6
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-70px] bottom-[-70px] h-44 w-44 rounded-full bg-emerald-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  grid h-12 w-12 shrink-0 place-items-center rounded-2xl
                  border border-[#e2bf74]/35 bg-white/12 text-[#e2bf74]
                  shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                "
              >
                <FolderOpen className="h-6 w-6" />
              </div>

              <div className="min-w-0">
                <h4 className="truncate text-lg font-black md:text-xl">
                  اختيار ملف أو مجلد من النظام
                </h4>

                <p className="mt-1 truncate text-xs font-bold text-white/65">
                  تصفح الأرشيف المركزي واربط المهمة بمسار ملف أو مجلد.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="
                flex min-w-[54px] flex-col items-center justify-center gap-0.5
                rounded-xl border border-white/15 bg-white/10
                px-2 py-1 text-[8px] font-black leading-none text-white
                transition hover:bg-red-500/30
              "
              type="button"
            >
              <X className="h-4 w-4" />
              إغلاق
            </button>
          </div>
        </div>

        {/* Breadcrumb */}
        <div
          className="
            shrink-0 border-b border-[#e8ddc8]
            bg-white/85 px-4 py-3 backdrop-blur-xl
          "
        >
          <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap custom-scrollbar-slim">
            <button
              onClick={() => handleNavigateToStep(0)}
              className="
                grid h-9 w-9 shrink-0 place-items-center
                rounded-xl border border-[#d8b46a]/25
                bg-[#fbf8f1] text-[#123f59]
                transition hover:bg-[#f8efe0]
              "
              type="button"
              title="الرئيسية"
            >
              <Home className="h-4 w-4" />
            </button>

            {pathStack.length > 1 && (
              <ChevronLeft className="h-4 w-4 shrink-0 text-[#c5983c]" />
            )}

            {pathStack.slice(1).map((step, index) => {
              const isLast = index === pathStack.length - 2;

              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => handleNavigateToStep(index + 1)}
                    className={`
                      rounded-xl px-3 py-1.5 text-[11px] font-black transition
                      ${
                        isLast
                          ? "border border-[#d8b46a]/30 bg-[#123f59] text-white"
                          : "border border-[#e8ddc8] bg-white text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"
                      }
                    `}
                    type="button"
                  >
                    {step.name}
                  </button>

                  {index < pathStack.length - 2 && (
                    <ChevronLeft className="h-4 w-4 shrink-0 text-[#c5983c]" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div
          className="
            min-h-0 flex-1 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
            p-4 custom-scrollbar-slim
          "
        >
          {isLoading ? (
            <LoadingState />
          ) : (
            <>
              <div
                className="
                  mb-4 flex flex-col gap-3 rounded-[24px]
                  border border-[#d8b46a]/30 bg-white/85
                  p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
                  sm:flex-row sm:items-center sm:justify-between
                "
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#123f59] text-[#e2bf74]">
                    <Database className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-[#123f59]">
                      {currentFolder.name}
                    </p>

                    <p className="mt-0.5 text-[11px] font-bold text-[#64748b]">
                      {folders.length} مجلد • {files.length} ملف
                    </p>
                  </div>
                </div>

                <div
                  className="
                    flex w-fit items-center gap-1.5 rounded-xl
                    border border-emerald-200 bg-emerald-50
                    px-3 py-1.5 text-[10px] font-black text-emerald-700
                  "
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  أرشيف آمن
                </div>
              </div>

              {folders.length === 0 && files.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {folders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onOpen={() => handleNavigateForward(folder)}
                      onSelect={() => onSelect(buildPathString(folder.name))}
                    />
                  ))}

                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      onSelect={() =>
                        onSelect(
                          buildPathString(file.originalName || file.name),
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="
            shrink-0 border-t border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              onClick={() => onSelect(buildPathString())}
              disabled={isAtRoot}
              className="
                flex h-10 items-center justify-center gap-2
                rounded-2xl border border-emerald-200
                bg-emerald-50 px-4 text-xs font-black text-emerald-700
                transition hover:bg-emerald-100
                disabled:cursor-not-allowed disabled:opacity-40
              "
              type="button"
            >
              <FolderCheck className="h-4 w-4" />
              اختيار المجلد الحالي بالكامل
            </button>

            <button
              onClick={onClose}
              className="
                h-10 rounded-2xl border border-[#d8b46a]/30
                bg-white px-6 text-xs font-black text-[#64748b]
                transition hover:bg-[#f8efe0]
              "
              type="button"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const FolderCard = ({ folder, onOpen, onSelect }) => (
  <div
    className="
      group relative overflow-hidden rounded-[24px]
      border border-[#d8b46a]/25 bg-white/92
      p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
      backdrop-blur-xl transition-all
      hover:-translate-y-[1px]
      hover:border-[#c5983c]/45
      hover:bg-[#fbf8f1]/90
      hover:shadow-[0_18px_42px_rgba(18,63,89,0.12)]
    "
  >
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center gap-3 text-right"
        type="button"
      >
        <span
          className="
            grid h-12 w-12 shrink-0 place-items-center
            rounded-2xl border border-amber-200 bg-amber-50
            text-amber-600 transition
            group-hover:bg-[#123f59] group-hover:text-[#e2bf74]
          "
        >
          <Folder className="h-6 w-6" />
        </span>

        <span className="min-w-0">
          <span className="block truncate text-sm font-black text-[#123f59]">
            {folder.name}
          </span>

          <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#94a3b8]">
            <Search className="h-3 w-3" />
            اضغط للدخول إلى المجلد
          </span>
        </span>
      </button>

      <button
        onClick={onSelect}
        className="
          flex min-w-[58px] flex-col items-center justify-center gap-0.5
          rounded-xl border border-emerald-200 bg-emerald-50
          px-2 py-1.5 text-[8px] font-black leading-none text-emerald-700
          opacity-100 transition-all
          hover:-translate-y-[1px] hover:bg-emerald-100
          sm:opacity-0 sm:group-hover:opacity-100
        "
        type="button"
      >
        <FolderCheck className="h-4 w-4" />
        تحديد
      </button>
    </div>
  </div>
);

const FileCard = ({ file, onSelect }) => (
  <div
    className="
      group relative overflow-hidden rounded-[24px]
      border border-[#d8b46a]/25 bg-white/92
      p-4 shadow-[0_12px_30px_rgba(18,63,89,0.07)]
      backdrop-blur-xl transition-all
      hover:-translate-y-[1px]
      hover:border-blue-300
      hover:bg-blue-50/45
      hover:shadow-[0_18px_42px_rgba(18,63,89,0.12)]
    "
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span
          className="
            grid h-12 w-12 shrink-0 place-items-center
            rounded-2xl border border-blue-200 bg-blue-50
            text-blue-700 transition
            group-hover:bg-[#123f59] group-hover:text-[#e2bf74]
          "
        >
          <File className="h-6 w-6" />
        </span>

        <span className="min-w-0">
          <span
            className="block truncate text-sm font-black text-[#123f59]"
            title={file.originalName || file.name}
            dir="ltr"
            style={{ textAlign: "right" }}
          >
            {file.originalName || file.name}
          </span>

          <span className="mt-1 flex items-center gap-1 text-[10px] font-bold text-[#94a3b8]">
            <FileCheck2 className="h-3 w-3" />
            ملف قابل للإرفاق
          </span>
        </span>
      </div>

      <button
        onClick={onSelect}
        className="
          flex min-w-[58px] flex-col items-center justify-center gap-0.5
          rounded-xl border border-blue-200 bg-blue-50
          px-2 py-1.5 text-[8px] font-black leading-none text-blue-700
          opacity-100 transition-all
          hover:-translate-y-[1px] hover:bg-blue-100
          sm:opacity-0 sm:group-hover:opacity-100
        "
        type="button"
      >
        <CheckCircle2 className="h-4 w-4" />
        إرفاق
      </button>
    </div>
  </div>
);

const LoadingState = () => (
  <div
    className="
      flex h-56 flex-col items-center justify-center
      rounded-[28px] border border-[#d8b46a]/30
      bg-white/75 text-center
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
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      جاري تحميل محتويات المجلد...
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      يرجى الانتظار قليلاً.
    </p>
  </div>
);

const EmptyState = () => (
  <div
    className="
      flex min-h-[260px] flex-col items-center justify-center
      rounded-[28px] border border-dashed border-[#d8b46a]/40
      bg-white/75 px-5 py-12 text-center
      shadow-[0_18px_45px_rgba(18,63,89,0.08)]
      sm:col-span-2
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
      <AlertCircle className="h-8 w-8" />
    </div>

    <p className="text-sm font-black text-[#123f59]">
      هذا المجلد فارغ
    </p>

    <p className="mt-1 text-xs font-bold text-[#64748b]">
      لا توجد مجلدات فرعية أو ملفات قابلة للاختيار هنا.
    </p>
  </div>
);