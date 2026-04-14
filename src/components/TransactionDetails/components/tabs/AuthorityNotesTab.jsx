import React, { useState, useMemo, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "lucide-react";

export const AuthorityNotesTab = ({ tx, currentUser, persons }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // States
  const [noteText, setNoteText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [assignedTo, setAssignedTo] = useState("");

  // حالات التعديل
  const [editingNoteId, setEditingNoteId] = useState(null);

  // حالة عارض المرفقات (Modal)
  const [previewFile, setPreviewFile] = useState(null);

  // دالة بناء الرابط الصحيح (استخدام الرابط المباشر من السيرفر)
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    // التأكد من إضافة /api قبل الرابط إذا لم تكن موجودة وكان الرابط يبدأ بـ /uploads
    const fixedUrl = url.startsWith("/uploads") ? `/api${url}` : url;
    return `https://details-worksystem1.com${fixedUrl}`;
  };

  // 💡 اللصق من الـ Clipboard
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
            toast.success("تم إرفاق الملف من الحافظة");
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const { data: relatedEmails = [], isLoading: emailsLoading } = useQuery({
    queryKey: ["related-emails", tx.serviceNumber, tx.requestNumber],
    queryFn: async () => {
      if (!tx.serviceNumber && !tx.requestNumber) return [];
      const res = await api.get(`/email/messages/search`, {
        params: {
          serviceNumber: tx.serviceNumber,
          reqNumber: tx.requestNumber,
        },
      });
      return res.data?.data || [];
    },
    enabled: !!(tx.serviceNumber || tx.requestNumber),
  });

  // حفظ أو تعديل
  const saveNoteMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("note", noteText);
      if (assignedTo) fd.append("assignedTo", assignedTo);
      if (selectedFile) fd.append("file", selectedFile);

      if (editingNoteId) {
        return api.put(
          `/private-transactions/${tx.id}/authority-notes/${editingNoteId}`,
          fd,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
      } else {
        fd.append("addedBy", currentUser);
        return api.post(`/private-transactions/${tx.id}/authority-notes`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
    },
    onSuccess: () => {
      toast.success(editingNoteId ? "تم التعديل بنجاح" : "تمت الإضافة بنجاح");
      setNoteText("");
      setSelectedFile(null);
      setAssignedTo("");
      setEditingNoteId(null);
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
    onError: () => toast.error("حدث خطأ أثناء الحفظ"),
  });

  // الحذف
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId) =>
      api.delete(`/private-transactions/${tx.id}/authority-notes/${noteId}`),
    onSuccess: () => {
      toast.success("تم الحذف بنجاح");
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return toast.error("يرجى كتابة نص الملاحظة");
    saveNoteMutation.mutate();
  };

  const handleEditInit = (noteObj) => {
    setNoteText(noteObj.note);
    setAssignedTo(noteObj.assignedTo || "");
    setEditingNoteId(noteObj.id);
    setSelectedFile(null); // لا يمكننا جلب الملف القديم كـ File object، سنبقيه كما هو في الباك إند إن لم نرفع جديداً
  };

  const combinedNotes = useMemo(() => {
    const manualNotes = (tx.notes?.authorityNotesHistory || []).map((note) => ({
      ...note,
      type: "manual",
      timestamp: new Date(note.date).getTime(),
    }));

    const autoNotes = relatedEmails.map((email) => ({
      id: email.id,
      note: email.replyText || email.body || "لا يوجد نص",
      addedBy: email.from || "رسالة واردة",
      subject: email.subject,
      date: email.date,
      type: "auto",
      timestamp: new Date(email.date).getTime(),
    }));

    return [...manualNotes, ...autoNotes].sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }, [tx.notes?.authorityNotesHistory, relatedEmails]);

  return (
    <div
      className="h-full flex flex-col gap-3 animate-in fade-in pb-10"
      dir="rtl"
    >
      {/* ── إدخال ملاحظة جديدة ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0 transition-all">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-blue-600" />{" "}
            {editingNoteId ? "تعديل الملاحظة" : "تدوين إفادة أو ملاحظة يدوية"}
          </h3>
          {editingNoteId && (
            <button
              onClick={() => {
                setEditingNoteId(null);
                setNoteText("");
                setAssignedTo("");
                setSelectedFile(null);
              }}
              className="text-[10px] font-bold text-red-500 hover:bg-red-50 px-2 py-1 rounded"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2 items-start relative">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب توجيهات الأمانة، أو الإفادة (يمكنك اللصق Ctrl+V للإرفاق المباشر)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-bold outline-none focus:border-blue-400 min-h-[60px] resize-none pr-12 leading-relaxed"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute right-2 top-2 p-2 rounded-lg transition-colors ${selectedFile ? "bg-emerald-100 text-emerald-600" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 shadow-sm"}`}
              title="إرفاق ملف"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 shadow-sm">
                <UserPlus className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold p-2 outline-none w-32 cursor-pointer"
                >
                  <option value="">-- توجيه لموظف --</option>
                  {persons?.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1.5 rounded-lg">
                  مرفق جاهز
                  <X
                    className="w-3.5 h-3.5 ml-1 cursor-pointer hover:text-red-500"
                    onClick={() => setSelectedFile(null)}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={saveNoteMutation.isPending || !noteText.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 shrink-0"
            >
              {saveNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {editingNoteId ? "حفظ التعديل" : "إرسال واعتماد"}
            </button>
          </div>
        </div>
      </div>

      {/* ── الخط الزمني للملاحظات ── */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex justify-between items-center bg-slate-50 px-4 py-3 border-b border-slate-100 shrink-0">
          <h3 className="text-xs font-black text-slate-800">
            سجل الإفادات والملاحظات
          </h3>
          {emailsLoading && (
            <RefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-4 space-y-4">
          {combinedNotes.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <MessageSquare className="w-10 h-10 mx-auto mb-3 text-slate-400" />
              <p className="text-xs font-bold text-slate-500">
                لا توجد إفادات أو ملاحظات مسجلة.
              </p>
            </div>
          ) : (
            combinedNotes.map((item, idx) => {
              const fullAttachmentUrl = getFullUrl(item.attachment);

              return (
                <div
                  key={item.id || idx}
                  className={`p-4 rounded-xl border transition-all hover:shadow-md ${item.type === "auto" ? "bg-purple-50/20 border-purple-100" : "bg-slate-50/50 border-slate-200"}`}
                >
                  <div className="flex justify-between items-start mb-3 border-b border-slate-100/80 pb-3">
                    <div className="flex items-start gap-2.5">
                      {item.type === "auto" ? (
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg shadow-sm">
                          <Bot className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shadow-sm">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex flex-col gap-1">
                        <span
                          className={`text-xs font-black ${item.type === "auto" ? "text-purple-800" : "text-slate-800"}`}
                        >
                          {item.type === "auto"
                            ? "سحب آلي (بلدي)"
                            : item.addedBy}
                        </span>
                        {item.assignedTo && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded w-fit border border-amber-200">
                            موجه إلى: {item.assignedTo}
                          </span>
                        )}
                        {item.subject && (
                          <span className="text-[10px] text-slate-500 font-bold max-w-[250px] truncate">
                            {item.subject}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {/* تكبير التاريخ وتوضيحه */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-sm">
                        <CalendarClock className="w-3.5 h-3.5 text-slate-400" />
                        <span dir="ltr">
                          {new Date(item.date).toLocaleString("en-GB", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                      </div>

                      {/* أزرار التعديل والحذف للملاحظات اليدوية فقط */}
                      {item.type === "manual" && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleEditInit(item)}
                            className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-md transition-colors border border-transparent hover:border-blue-200"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("حذف؟"))
                                deleteNoteMutation.mutate(item.id);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-md transition-colors border border-transparent hover:border-red-200"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`text-xs font-bold leading-loose whitespace-pre-wrap ${item.type === "auto" ? "text-purple-900" : "text-slate-700"}`}
                  >
                    {item.note}
                  </div>

                  {fullAttachmentUrl && (
                    <div className="mt-4 pt-3 border-t border-slate-200/50 flex gap-2">
                      <button
                        onClick={() => setPreviewFile(fullAttachmentUrl)}
                        className="flex items-center gap-1.5 text-xs font-black text-blue-700 bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition-colors shadow-sm border border-blue-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> عرض المرفق
                        (PDF/Image)
                      </button>

                      {/* بلوكاية الإرسال (مختصرة) */}
                      <a
                        href={`https://wa.me/?text=مرفق إفادة بلدي: ${fullAttachmentUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200"
                        title="واتساب"
                      >
                        <Share2 className="w-4 h-4" />
                      </a>
                      <a
                        href={`https://t.me/share/url?url=${fullAttachmentUrl}&text=مرفق إفادة بلدي`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-sky-500 bg-sky-50 hover:bg-sky-100 rounded-lg border border-sky-200"
                        title="تليجرام"
                      >
                        <SendIcon className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── عارض المرفقات الداخلي (Modal) ── */}
      {previewFile && (
        <div
          className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-10 animate-in fade-in"
          onClick={() => setPreviewFile(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
              <h3 className="font-bold flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-emerald-400" /> عرض المرفق
              </h3>
              <div className="flex gap-3 items-center">
                <a
                  href={previewFile}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-300 hover:text-white flex items-center gap-1 text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" /> تحميل
                </a>
                <button
                  onClick={() => {
                    const printWindow = window.open(previewFile);
                    printWindow.print();
                  }}
                  className="text-slate-300 hover:text-white flex items-center gap-1 text-sm font-bold bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Printer className="w-4 h-4" /> طباعة
                </button>
                <div className="w-px h-6 bg-slate-700 mx-1"></div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-100 p-2 overflow-hidden flex items-center justify-center relative">
              {/* إذا كان المرفق PDF أو صورة نستخدم iframe أو img */}
              {previewFile.toLowerCase().endsWith(".pdf") ? (
                <iframe
                  src={previewFile}
                  className="w-full h-full rounded-xl bg-white shadow-inner"
                  title="PDF Preview"
                />
              ) : previewFile.match(/\.(jpeg|jpg|gif|png|webp)$/i) ? (
                <img
                  src={previewFile}
                  alt="Preview"
                  className="max-w-full max-h-full object-contain rounded-xl shadow-lg border-4 border-white"
                />
              ) : (
                <div className="text-center text-slate-500">
                  <ExternalLink className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                  <p className="font-bold mb-4">
                    هذا النوع من الملفات لا يمكن معاينته مباشرة
                  </p>
                  <a
                    href={previewFile}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 inline-block"
                  >
                    انقر هنا لفتحه أو تحميله
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
