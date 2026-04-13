import React, { useState, useMemo, useRef } from "react";
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
  X
} from "lucide-react";

export const AuthorityNotesTab = ({ tx, currentUser, backendUrl }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [noteText, setNoteText] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. جلب الرسائل الآلية (الإيميلات) المرتبطة برقم الخدمة أو الطلب
  const { data: relatedEmails = [], isLoading: emailsLoading } = useQuery({
    queryKey: ["related-emails", tx.serviceNumber, tx.requestNumber],
    queryFn: async () => {
      if (!tx.serviceNumber && !tx.requestNumber) return [];
      const res = await api.get(`/email/messages/search`, {
        params: { serviceNumber: tx.serviceNumber, reqNumber: tx.requestNumber }
      });
      return res.data?.data || [];
    },
    enabled: !!(tx.serviceNumber || tx.requestNumber),
  });

  // 2. إرسال الملاحظة اليدوية للباك إند
  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const fd = new FormData();
      fd.append("note", noteText);
      fd.append("addedBy", currentUser);
      if (selectedFile) fd.append("file", selectedFile);

      return api.post(`/private-transactions/${tx.id}/authority-notes`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("تمت إضافة الملاحظة بنجاح");
      setNoteText("");
      setSelectedFile(null);
      queryClient.invalidateQueries(["private-transactions-full"]);
    },
    onError: () => toast.error("حدث خطأ أثناء إضافة الملاحظة"),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return toast.error("يرجى كتابة نص الملاحظة");
    addNoteMutation.mutate();
  };

  // 3. دمج الملاحظات اليدوية والرسائل الآلية وترتيبها زمنياً
  const combinedNotes = useMemo(() => {
    const manualNotes = (tx.notes?.authorityNotesHistory || []).map(note => ({
      ...note,
      type: "manual",
      timestamp: new Date(note.date).getTime()
    }));

    const autoNotes = relatedEmails.map(email => ({
      id: email.id,
      note: email.replyText || email.body || "لا يوجد نص تفصيلي",
      addedBy: email.from || "رسالة واردة (بلدي)",
      subject: email.subject,
      date: email.date,
      type: "auto",
      timestamp: new Date(email.date).getTime()
    }));

    return [...manualNotes, ...autoNotes].sort((a, b) => b.timestamp - a.timestamp);
  }, [tx.notes?.authorityNotesHistory, relatedEmails]);

  return (
    <div className="h-full flex flex-col gap-3 animate-in fade-in pb-10" dir="rtl">
      
      {/* ── إدخال ملاحظة جديدة (مضغوط) ── */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <h3 className="text-xs font-black text-slate-800 mb-2 flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-blue-600" /> تدوين إفادة أو ملاحظة يدوية
        </h3>
        <div className="flex gap-2 items-start">
          <div className="flex-1 relative">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب توجيهات الأمانة، المجمعات، أو أي إفادة هنا..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] font-bold outline-none focus:border-blue-400 min-h-[40px] resize-none pr-10"
            />
            {/* زر المرفقات مدمج داخل الحقل */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`absolute left-2 top-2 p-1.5 rounded-md transition-colors ${selectedFile ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500 hover:bg-slate-300"}`}
              title="إرفاق ملف"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>
            <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={addNoteMutation.isPending || !noteText.trim()}
            className="h-10 px-4 bg-blue-600 text-white rounded-lg text-[11px] font-black hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 shrink-0"
          >
            {addNoteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            إرسال
          </button>
        </div>
        {selectedFile && (
          <div className="flex items-center gap-1 mt-1.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
            مرفق: {selectedFile.name} 
            <X className="w-3 h-3 ml-1 cursor-pointer hover:text-red-500" onClick={() => setSelectedFile(null)} />
          </div>
        )}
      </div>

      {/* ── الخط الزمني للملاحظات ── */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="flex justify-between items-center bg-slate-50 px-3 py-2 border-b border-slate-100 shrink-0">
          <h3 className="text-[11px] font-black text-slate-700">سجل الإفادات والملاحظات</h3>
          {emailsLoading && <RefreshCw className="w-3 h-3 text-slate-400 animate-spin" />}
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar-slim p-3 space-y-3">
          {combinedNotes.length === 0 ? (
            <div className="text-center py-10 opacity-50">
               <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-400" />
               <p className="text-[10px] font-bold text-slate-500">لا توجد إفادات أو ملاحظات مسجلة لهذه المعاملة.</p>
            </div>
          ) : (
            combinedNotes.map((item, idx) => (
              <div key={item.id || idx} className={`p-2.5 rounded-xl border ${item.type === 'auto' ? 'bg-purple-50/30 border-purple-100' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-start mb-1.5 border-b border-slate-100 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    {item.type === 'auto' ? (
                      <div className="p-1 bg-purple-100 text-purple-600 rounded-md"><Bot className="w-3 h-3" /></div>
                    ) : (
                      <div className="p-1 bg-blue-100 text-blue-600 rounded-md"><User className="w-3 h-3" /></div>
                    )}
                    <div className="flex flex-col">
                      <span className={`text-[10px] font-black ${item.type === 'auto' ? 'text-purple-800' : 'text-slate-800'}`}>
                        {item.type === 'auto' ? 'سحب آلي (نظام بلدي)' : item.addedBy}
                      </span>
                      {item.subject && <span className="text-[8px] text-slate-500 truncate max-w-[200px]">{item.subject}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[8px] font-mono text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                    <CalendarClock className="w-2.5 h-2.5" />
                    {new Date(item.date).toLocaleString('en-GB')}
                  </div>
                </div>

                <div className={`text-[10px] font-bold leading-relaxed whitespace-pre-wrap ${item.type === 'auto' ? 'text-purple-900' : 'text-slate-700'}`}>
                  {item.note}
                </div>

                {item.attachment && (
                  <div className="mt-2 pt-2 border-t border-slate-100/50">
                    <button 
                      onClick={() => window.open(`${backendUrl}${item.attachment}`, '_blank')}
                      className="flex items-center gap-1 text-[9px] font-black text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded w-fit transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" /> عرض المرفق
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};