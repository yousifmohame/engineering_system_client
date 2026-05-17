import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
} from "react";

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../../../../api/axios";
import { toast } from "sonner";

import {
  MessageSquare,
  Bot,
  User,
  Paperclip,
  Send,
  Loader2,
  CalendarClock,
  ExternalLink,
  RefreshCw,
  X,
  Edit2,
  Trash2,
  UserPlus,
  Download,
  Printer,
  Share2,
  Send as SendIcon,
  ClipboardPaste,
  FileCheck,
  History,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export const AuthorityNotesTab = ({
  tx,
  currentUser,
  persons,
}) => {
  const queryClient = useQueryClient();

  const fileInputRef = useRef(null);

  const [noteText, setNoteText] = useState("");
  const [selectedFile, setSelectedFile] =
    useState(null);

  const [assignedTo, setAssignedTo] =
    useState("");

  const [editingNoteId, setEditingNoteId] =
    useState(null);

  const [previewFile, setPreviewFile] =
    useState(null);

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;

    let fixedUrl = url.replace(/\.\.\//g, "");

    if (!fixedUrl.startsWith("/")) {
      fixedUrl = `/${fixedUrl}`;
    }

    if (fixedUrl.startsWith("/uploads/")) {
      fixedUrl = `/api${fixedUrl}`;
    }

    const baseUrl =
      "https://details-worksystem1.com";

    return `${baseUrl}${fixedUrl}`;
  };

  const resetForm = () => {
    setEditingNoteId(null);
    setNoteText("");
    setAssignedTo("");
    setSelectedFile(null);
  };

  useEffect(() => {
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;

      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (
          items[i].type.indexOf("image") !== -1 ||
          items[i].type.indexOf("pdf") !== -1
        ) {
          const file = items[i].getAsFile();

          if (file) {
            setSelectedFile(file);

            toast.success(
              <div className="flex items-center gap-2">
                <ClipboardPaste className="h-4 w-4 text-emerald-600" />
                <span>
                  تم إرفاق الملف من الحافظة بنجاح
                </span>
              </div>,
            );

            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);

    return () =>
      window.removeEventListener(
        "paste",
        handlePaste,
      );
  }, []);

  const {
    data: relatedEmails = [],
    isLoading: emailsLoading,
  } = useQuery({
    queryKey: [
      "related-emails",
      tx.serviceNumber,
      tx.requestNumber,
    ],

    queryFn: async () => {
      if (
        !tx.serviceNumber &&
        !tx.requestNumber
      ) {
        return [];
      }

      const res = await api.get(
        `/email/messages/search`,
        {
          params: {
            serviceNumber: tx.serviceNumber,
            reqNumber: tx.requestNumber,
          },
        },
      );

      return res.data?.data || [];
    },

    enabled: !!(
      tx.serviceNumber || tx.requestNumber
    ),
  });

  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();

      fd.append("note", noteText);

      if (assignedTo) {
        fd.append("assignedTo", assignedTo);
      }

      if (selectedFile) {
        fd.append("file", selectedFile);
      }

      if (editingNoteId) {
        return api.put(
          `/private-transactions/${tx.id}/authority-notes/${editingNoteId}`,
          fd,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          },
        );
      }

      fd.append("addedBy", currentUser);

      return api.post(
        `/private-transactions/${tx.id}/authority-notes`,
        fd,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        },
      );
    },

    onSuccess: () => {
      toast.success(
        editingNoteId
          ? "تم تعديل الإفادة بنجاح"
          : "تم حفظ الإفادة بنجاح",
      );

      resetForm();

      queryClient.invalidateQueries([
        "private-transactions-full",
      ]);
    },

    onError: () => {
      toast.error(
        "حدث خطأ أثناء الحفظ، يرجى المحاولة لاحقاً",
      );
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) =>
      api.delete(
        `/private-transactions/${tx.id}/authority-notes/${noteId}`,
      ),

    onSuccess: () => {
      toast.success("تم حذف الإفادة");

      queryClient.invalidateQueries([
        "private-transactions-full",
      ]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!noteText.trim()) {
      return toast.error(
        "يرجى كتابة نص الإفادة أولاً",
      );
    }

    saveNoteMutation.mutate();
  };

  const handleEditInit = (noteObj) => {
    setNoteText(noteObj.note);

    setAssignedTo(noteObj.assignedTo || "");

    setEditingNoteId(noteObj.id);

    setSelectedFile(null);
  };

  const combinedNotes = useMemo(() => {
    const manualNotes = (
      tx.notes?.authorityNotesHistory || []
    ).map((note) => ({
      ...note,
      type: "manual",
      timestamp: new Date(
        note.date,
      ).getTime(),
    }));

    const autoNotes = relatedEmails.map(
      (email) => ({
        id: email.id,
        note:
          email.replyText ||
          email.body ||
          "لا يوجد نص",

        addedBy:
          email.from || "رسالة واردة",

        subject: email.subject,
        date: email.date,
        type: "auto",

        timestamp: new Date(
          email.date,
        ).getTime(),
      }),
    );

    return [...manualNotes, ...autoNotes].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [
    tx.notes?.authorityNotesHistory,
    relatedEmails,
  ]);

  return (
    <div
      className="
        flex h-full flex-col gap-5 overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        p-4 pb-10 animate-in fade-in md:p-5
        font-[Tajawal]
      "
      dir="rtl"
    >
      {/* Composer */}
      <form
        onSubmit={handleSubmit}
        className="
          relative shrink-0 overflow-hidden rounded-[30px]
          border border-[#d8b46a]/30
          bg-white
          shadow-[0_20px_50px_rgba(18,63,89,0.10)]
        "
      >
        {/* Header */}
        <div
          className="
            relative overflow-hidden
            bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
            px-5 py-4 text-white
          "
        >
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-70px] top-[-70px] h-44 w-44 rounded-full bg-[#e2bf74]/18 blur-3xl" />
            <div className="absolute left-[-80px] bottom-[-80px] h-48 w-48 rounded-full bg-cyan-400/14 blur-3xl" />
          </div>

          <div className="relative z-10 flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  grid h-12 w-12 shrink-0 place-items-center
                  rounded-2xl border border-[#e2bf74]/35
                  bg-white/12 text-[#e2bf74]
                  shadow-[0_14px_30px_rgba(0,0,0,0.20)]
                "
              >
                <MessageSquare className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-black md:text-base">
                  {editingNoteId
                    ? "تعديل الإفادة المحددة"
                    : "تدوين إفادة أو توجيه جديد"}
                </h3>

                <p className="mt-1 text-[11px] font-bold text-white/60">
                  كتابة ملاحظات داخلية وربطها بالموظفين والمرفقات.
                </p>

                <div
                  className="
                    mt-3 inline-flex items-center gap-1.5 rounded-xl
                    border border-white/15 bg-white/10
                    px-3 py-1.5 text-[10px]
                    font-black text-white
                  "
                >
                  <Sparkles className="h-3.5 w-3.5 text-[#e2bf74]" />
                  يدعم اللصق المباشر Ctrl + V
                </div>
              </div>
            </div>

            {editingNoteId && (
              <button
                onClick={resetForm}
                type="button"
                className="
                  flex items-center gap-1.5 rounded-2xl
                  border border-rose-300/25 bg-rose-500/15
                  px-3 py-2 text-[11px]
                  font-black text-rose-100
                  transition hover:bg-rose-500 hover:text-white
                "
              >
                <X className="h-3.5 w-3.5" />
                إلغاء
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4 md:p-5">
          <textarea
            value={noteText}
            onChange={(e) =>
              setNoteText(e.target.value)
            }
            placeholder="اكتب تفاصيل التوجيه أو الإفادة هنا..."
            className="
              min-h-[120px] w-full resize-y rounded-[24px]
              border border-[#d8b46a]/30 bg-[#fbf8f1]/70
              p-4 text-xs font-bold leading-8 text-[#123f59]
              outline-none transition-all
              placeholder:text-[#64748b]/70
              focus:border-[#c5983c]
              focus:bg-white
              focus:ring-4 focus:ring-[#c5983c]/10
            "
          />

          {/* Bottom controls */}
          <div
            className="
              flex flex-col gap-3 rounded-[24px]
              border border-[#e8ddc8]
              bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
              p-3
            "
          >
            <div className="flex flex-wrap items-center gap-2">
              {/* Upload */}
              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className={`
                  flex h-11 items-center gap-2 rounded-2xl border
                  px-4 text-[11px] font-black transition-all
                  ${
                    selectedFile
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "border-[#d8b46a]/35 bg-white text-[#123f59] hover:bg-[#f8efe0]"
                  }
                `}
              >
                {selectedFile ? (
                  <FileCheck className="h-4 w-4" />
                ) : (
                  <Paperclip className="h-4 w-4 text-[#c5983c]" />
                )}

                {selectedFile
                  ? "تم إرفاق ملف"
                  : "رفع ملف"}
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) =>
                  setSelectedFile(
                    e.target.files[0],
                  )
                }
                className="hidden"
                accept="image/*,.pdf"
              />

              {/* File preview */}
              {selectedFile && (
                <div
                  className="
                    flex max-w-[260px] items-center gap-2 rounded-2xl
                    border border-emerald-200 bg-emerald-50
                    px-3 py-2
                  "
                >
                  <FileCheck className="h-4 w-4 shrink-0 text-emerald-600" />

                  <span
                    className="
                      truncate text-[10px]
                      font-black text-emerald-800
                    "
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedFile(null)
                    }
                    className="
                      shrink-0 text-emerald-600
                      transition hover:text-rose-500
                    "
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              {/* Assign */}
              <div
                className="
                  flex min-w-[210px] items-center rounded-2xl
                  border border-[#d8b46a]/35 bg-white
                  px-3 shadow-sm
                "
              >
                <UserPlus className="h-4 w-4 shrink-0 text-[#c5983c]" />

                <select
                  value={assignedTo}
                  onChange={(e) =>
                    setAssignedTo(
                      e.target.value,
                    )
                  }
                  className="
                    w-full cursor-pointer border-none
                    bg-transparent px-2 py-3
                    text-[11px] font-black text-[#123f59]
                    outline-none
                  "
                >
                  <option value="">
                    توجيه لموظف...
                  </option>

                  {persons?.map((p) => (
                    <option
                      key={p.name}
                      value={p.name}
                    >
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={
                  saveNoteMutation.isPending ||
                  !noteText.trim()
                }
                className="
                  mr-auto flex h-11 items-center justify-center gap-2
                  rounded-2xl bg-gradient-to-l
                  from-[#123f59] via-[#15536f] to-[#0e7490]
                  px-6 text-[11px]
                  font-black text-white
                  shadow-[0_14px_30px_rgba(18,63,89,0.20)]
                  transition hover:-translate-y-[1px]
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {saveNoteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
                ) : (
                  <Send className="h-4 w-4 text-[#e2bf74]" />
                )}

                {editingNoteId
                  ? "حفظ التعديل"
                  : "إرسال واعتماد"}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Timeline */}
      <div
        className="
          flex min-h-0 flex-1 flex-col overflow-hidden
          rounded-[30px] border border-[#d8b46a]/30
          bg-white shadow-[0_20px_50px_rgba(18,63,89,0.10)]
        "
      >
        {/* Header */}
        <div
          className="
            flex shrink-0 items-center justify-between
            border-b border-[#e8ddc8]
            bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6]
            px-5 py-4
          "
        >
          <h3
            className="
              flex items-center gap-2
              text-xs font-black text-[#123f59]
            "
          >
            <span
              className="
                grid h-9 w-9 place-items-center rounded-2xl
                bg-[#123f59] text-[#e2bf74]
              "
            >
              <History className="h-4 w-4" />
            </span>

            سجل الإفادات والملاحظات
          </h3>

          {emailsLoading && (
            <div
              className="
                flex items-center gap-1.5 rounded-2xl
                border border-[#d8b46a]/25 bg-white
                px-3 py-1.5 text-[10px]
                font-black text-[#64748b]
              "
            >
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-[#c5983c]" />
              جاري التحديث
            </div>
          )}
        </div>

        {/* Content */}
        <div
          className="
            custom-scrollbar flex-1 space-y-4 overflow-y-auto
            bg-gradient-to-br from-[#eef7f6]/60 via-[#fbf8f1]/60 to-white
            p-5
          "
        >
          {combinedNotes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div
                className="
                  mb-4 grid h-20 w-20 place-items-center rounded-[28px]
                  border border-[#d8b46a]/35 bg-[#f8efe0]
                  text-[#c5983c]
                "
              >
                <AlertCircle className="h-10 w-10" />
              </div>

              <p className="text-sm font-black text-[#123f59]">
                لا توجد إفادات أو ملاحظات مسجلة
              </p>

              <p className="mt-1 text-xs font-bold text-[#64748b]">
                يمكنك البدء بإضافة أول إفادة من الأعلى.
              </p>
            </div>
          ) : (
            combinedNotes.map((item, idx) => {
              const fullAttachmentUrl =
                getFullUrl(item.attachment);

              const isAuto =
                item.type === "auto";

              return (
                <NoteCard
                  key={item.id || idx}
                  item={item}
                  isAuto={isAuto}
                  fullAttachmentUrl={
                    fullAttachmentUrl
                  }
                  onEdit={() =>
                    handleEditInit(item)
                  }
                  onDelete={() => {
                    if (
                      window.confirm(
                        "هل أنت متأكد من حذف هذه الإفادة؟",
                      )
                    ) {
                      deleteNoteMutation.mutate(
                        item.id,
                      );
                    }
                  }}
                  onPreview={() =>
                    setPreviewFile(
                      fullAttachmentUrl,
                    )
                  }
                />
              );
            })
          )}
        </div>
      </div>

      {/* Preview modal */}
      {previewFile && (
        <PreviewModal
          previewFile={previewFile}
          onClose={() =>
            setPreviewFile(null)
          }
        />
      )}
    </div>
  );
};

const NoteCard = ({
  item,
  isAuto,
  fullAttachmentUrl,
  onEdit,
  onDelete,
  onPreview,
}) => {
  return (
    <div
      className={`
        overflow-hidden rounded-[26px] border
        shadow-sm transition-all
        hover:shadow-[0_14px_34px_rgba(18,63,89,0.12)]
        ${
          isAuto
            ? "border-purple-200 bg-gradient-to-l from-purple-50 via-white to-white"
            : "border-[#d8b46a]/30 bg-white"
        }
      `}
    >
      {/* Header */}
      <div
        className={`
          border-b px-4 py-3
          ${
            isAuto
              ? "border-purple-100 bg-purple-50/65"
              : "border-[#e8ddc8] bg-[#fbf8f1]/60"
          }
        `}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div
              className={`
                grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-sm
                ${
                  isAuto
                    ? "border-purple-200 bg-purple-100 text-purple-700"
                    : "border-[#d8b46a]/30 bg-[#123f59] text-[#e2bf74]"
                }
              `}
            >
              {isAuto ? (
                <Bot className="h-5 w-5" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </div>

            <div className="min-w-0">
              <div
                className={`truncate text-xs font-black ${
                  isAuto
                    ? "text-purple-900"
                    : "text-[#123f59]"
                }`}
              >
                {isAuto
                  ? "سحب آلي من البريد"
                  : item.addedBy}
              </div>

              <div className="mt-1 flex flex-wrap gap-1.5">
                {item.assignedTo && (
                  <span
                    className="
                      flex items-center gap-1 rounded-xl
                      border border-amber-200 bg-amber-50
                      px-2 py-0.5 text-[9px]
                      font-black text-amber-700
                    "
                  >
                    <UserPlus className="h-3 w-3" />
                    توجيه لـ: {item.assignedTo}
                  </span>
                )}

                {!isAuto && (
                  <span
                    className="
                      rounded-xl border border-[#d8b46a]/25
                      bg-white px-2 py-0.5
                      text-[9px] font-black text-[#64748b]
                    "
                  >
                    إضافة يدوية
                  </span>
                )}
              </div>

              {item.subject && (
                <div
                  className="
                    mt-2 max-w-[320px] truncate rounded-xl
                    border border-[#e8ddc8] bg-white
                    px-2 py-1 text-[10px]
                    font-bold text-[#64748b]
                  "
                  title={item.subject}
                >
                  الموضوع: {item.subject}
                </div>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <div
              className="
                flex items-center gap-1.5 rounded-xl
                border border-[#d8b46a]/25 bg-white
                px-2.5 py-1.5 text-[11px]
                font-black text-[#123f59] shadow-sm
              "
            >
              <CalendarClock className="h-3.5 w-3.5 text-[#c5983c]" />

              <span dir="ltr">
                {new Date(
                  item.date,
                ).toLocaleString("en-GB", {
                  dateStyle: "short",
                  timeStyle: "short",
                })}
              </span>
            </div>

            {!isAuto && (
              <div className="flex gap-1.5">
                <ActionButton
                  onClick={onEdit}
                  tone="cyan"
                  icon={Edit2}
                  label="تعديل"
                />

                <ActionButton
                  onClick={onDelete}
                  tone="rose"
                  icon={Trash2}
                  label="حذف"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div
        className={`whitespace-pre-wrap px-5 py-4 text-xs font-bold leading-8 ${
          isAuto
            ? "text-purple-950"
            : "text-[#334155]"
        }`}
      >
        {item.note}
      </div>

      {/* Attachment */}
      {fullAttachmentUrl && (
        <div
          className="
            flex flex-wrap items-center gap-2
            border-t border-[#e8ddc8]
            bg-[#fbf8f1]/65
            px-5 py-3
          "
        >
          <button
            onClick={onPreview}
            className="
              flex items-center gap-1.5 rounded-2xl
              border border-[#d8b46a]/35 bg-white
              px-3 py-2 text-[11px]
              font-black text-[#123f59]
              shadow-sm transition hover:bg-[#f8efe0]
            "
            type="button"
          >
            <ExternalLink className="h-4 w-4 text-[#c5983c]" />
            عرض المرفق
          </button>

          <a
            href={`https://wa.me/?text=مرفق إفادة بلدي: ${fullAttachmentUrl}`}
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center gap-1.5 rounded-2xl
              border border-emerald-200 bg-emerald-50
              px-3 py-2 text-[10px]
              font-black text-emerald-700
              transition hover:bg-emerald-100
            "
          >
            <Share2 className="h-3.5 w-3.5" />
            واتساب
          </a>

          <a
            href={`https://t.me/share/url?url=${fullAttachmentUrl}&text=مرفق إفادة بلدي`}
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center gap-1.5 rounded-2xl
              border border-sky-200 bg-sky-50
              px-3 py-2 text-[10px]
              font-black text-sky-700
              transition hover:bg-sky-100
            "
          >
            <SendIcon className="h-3.5 w-3.5" />
            تليجرام
          </a>
        </div>
      )}
    </div>
  );
};

const ActionButton = ({
  icon: Icon,
  label,
  tone = "cyan",
  onClick,
}) => {
  const tones = {
    cyan: `
      border-cyan-200 bg-cyan-50
      text-cyan-700 hover:bg-cyan-100
    `,
    rose: `
      border-rose-200 bg-rose-50
      text-rose-600 hover:bg-rose-100
    `,
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-1 rounded-xl border
        px-2.5 py-1 text-[10px]
        font-black transition
        ${tones[tone]}
      `}
      type="button"
    >
      <Icon className="h-3 w-3" />
      {label}
    </button>
  );
};

const PreviewModal = ({
  previewFile,
  onClose,
}) => (
  <div
    className="
      fixed inset-0 z-[200] flex items-center justify-center
      bg-slate-900/90 p-2 backdrop-blur-sm
      animate-in fade-in sm:p-6
    "
    onClick={onClose}
  >
    <div
      className="
        relative flex h-[95vh] w-full max-w-5xl
        flex-col overflow-hidden rounded-[30px]
        bg-white shadow-[0_28px_80px_rgba(15,23,42,0.35)]
        sm:h-[90vh]
      "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="
          flex shrink-0 items-center justify-between
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-4 py-4 text-white sm:px-5
        "
      >
        <h3 className="flex min-w-0 items-center gap-2 text-sm font-black">
          <span
            className="
              grid h-10 w-10 shrink-0 place-items-center
              rounded-2xl bg-[#e2bf74] text-[#123f59]
            "
          >
            <Paperclip className="h-5 w-5" />
          </span>

          <span className="truncate">
            معاينة المرفق
          </span>
        </h3>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={previewFile}
            download
            target="_blank"
            rel="noreferrer"
            className="
              flex items-center gap-1.5 rounded-2xl
              border border-white/15 bg-white/10
              px-3 py-2 text-[11px]
              font-black text-white transition
              hover:bg-white/15
            "
          >
            <Download className="h-4 w-4 text-[#e2bf74]" />
            <span className="hidden sm:inline">
              تحميل
            </span>
          </a>

          <button
            onClick={() => {
              const printWindow =
                window.open(previewFile);

              if (printWindow) {
                printWindow.print();
              }
            }}
            className="
              flex items-center gap-1.5 rounded-2xl
              border border-white/15 bg-white/10
              px-3 py-2 text-[11px]
              font-black text-white transition
              hover:bg-white/15
            "
            type="button"
          >
            <Printer className="h-4 w-4 text-[#e2bf74]" />

            <span className="hidden sm:inline">
              طباعة
            </span>
          </button>

          <div className="mx-1 h-7 w-px bg-white/15" />

          <button
            onClick={onClose}
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

      {/* Body */}
      <div
        className="
          relative flex flex-1 items-center justify-center
          overflow-hidden bg-[#eef7f6] p-3 sm:p-4
        "
      >
        {previewFile
          .toLowerCase()
          .includes(".pdf") ? (
          <iframe
            src={previewFile}
            className="
              h-full w-full rounded-2xl
              border border-[#d8b46a]/35
              bg-white shadow-inner
            "
            title="PDF Preview"
          />
        ) : previewFile.match(
            /\.(jpeg|jpg|gif|png|webp|svg)/i,
          ) ? (
          <img
            src={previewFile}
            alt="Preview"
            className="
              max-h-full max-w-full rounded-2xl
              border border-[#d8b46a]/35
              bg-white object-contain p-2
              shadow-[0_18px_45px_rgba(18,63,89,0.20)]
            "
          />
        ) : (
          <div
            className="
              rounded-3xl border border-[#d8b46a]/35
              bg-white p-10 text-center
              shadow-[0_18px_45px_rgba(18,63,89,0.12)]
            "
          >
            <ExternalLink className="mx-auto mb-4 h-16 w-16 text-[#c5983c]/50" />

            <p className="mb-4 text-sm font-black text-[#123f59]">
              هذا النوع من الملفات لا يمكن
              معاينته مباشرة داخل المتصفح
            </p>

            <a
              href={previewFile}
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
              فتحه أو تحميله
            </a>
          </div>
        )}
      </div>
    </div>
  </div>
);