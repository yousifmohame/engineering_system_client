import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Trash2,
  Star,
  Settings,
  Search,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  CircleDot,
  Calendar,
  User,
  Sparkles,
  Users,
  MailPlus,
  FileSignature,
  Bot,
  CheckCircle,
  X,
  Reply,
  ReplyAll,
  Forward,
  Paperclip,
  Image,
  Link2,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  ArrowRight,
  Wand2,
  BookOpen,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios"; // تأكد من مسار الـ axios الخاص بك
import { useMutation } from "@tanstack/react-query";

// ==========================================
// 💡 مكونات مساعدة (Loading & Empty States)
// ==========================================
const LoadingSkeleton = () => (
  <div className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-3.5 h-3.5 bg-gray-200 rounded-full mt-1"></div>
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <div className="h-3 bg-gray-200 rounded w-32"></div>
              <div className="h-2 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ icon: Icon, title, message, action }) => (
  <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl flex items-center justify-center mb-4">
      <Icon className="w-10 h-10 text-blue-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
      >
        {action.label}
      </button>
    )}
  </div>
);

// ==========================================
// 💡 المكون الرئيسي: صندوق الوارد
// ==========================================
export default function InboxCenter() {
  const [accounts, setAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentView, setCurrentView] = useState("inbox");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // حالة نافذة الإرسال
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("new");

  // جهات الاتصال للإكمال التلقائي
  const [contacts, setContacts] = useState([]);

  // حالة الذكاء الاصطناعي
  const [showAIComposerMenu, setShowAIComposerMenu] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  // التمرير والصفحات
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // النوافذ المنبثقة الجانبية
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSignatureSettings, setShowSignatureSettings] = useState(false);
  const [showAISmartSearch, setShowAISmartSearch] = useState(false);

  const [composeData, setComposeData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    attachments: [],
  });

  const [signature, setSignature] = useState("");
  const [preamble, setPreamble] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef(null);

  // فلترة الكلمات المزعجة (سبام)
  const spamKeywords = [
    "باقة",
    "رصيد",
    "ميجابايت",
    "سلفني",
    "عروض",
    "خصم",
    "موبايلي",
    "stc",
    "زين",
  ];

  // ==========================================
  // 🚀 جلب البيانات الأساسية (رسائل + حسابات + جهات اتصال)
  // ==========================================
  const fetchEmails = async (pageNumber = 1) => {
    if (pageNumber === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      if (pageNumber === 1) {
        const accRes = await api.get("/email/accounts");
        setAccounts(accRes.data?.data || []);

        // 💡 جلب جهات الاتصال المحفوظة
        try {
          const contactsRes = await api.get("/email/contacts");
          if (contactsRes.data?.success) {
            setContacts(contactsRes.data.data);
          }
        } catch (cErr) {
          console.warn("تعذر جلب جهات الاتصال", cErr);
        }
      }

      // جلب الرسائل من السيرفر (IMAP)
      const imapRes = await api.get(`/email/sync?page=${pageNumber}&limit=50`);
      const liveMsgs = (imapRes.data?.data || []).map((m) => ({
        ...m,
        date: new Date(m.date),
      }));

      if (liveMsgs.length < 50) setHasMore(false);
      else setHasMore(true);

      // جلب الرسائل المحفوظة (DB) للدمج
      if (pageNumber === 1) {
        const dbRes = await api.get("/email/messages");
        const dbMsgs = (dbRes.data?.data || []).map((m) => ({
          ...m,
          date: new Date(m.date),
          uid: m.messageId || m.id,
        }));

        const combinedMap = new Map();
        dbMsgs.forEach((msg) => combinedMap.set(msg.uid, msg));
        liveMsgs.forEach((msg) => {
          if (!combinedMap.has(msg.id)) combinedMap.set(msg.id, msg);
        });
        setMessages(Array.from(combinedMap.values()));
      } else {
        setMessages((prev) => {
          const combinedMap = new Map();
          prev.forEach((msg) => combinedMap.set(msg.messageId || msg.id, msg));
          liveMsgs.forEach((msg) => combinedMap.set(msg.id, msg));
          return Array.from(combinedMap.values());
        });
      }
      setPage(pageNumber);
    } catch (error) {
      console.error("فشل الجلب:", error);
      toast.error("حدث خطأ أثناء جلب الرسائل من السيرفر");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEmails(1);
  }, []);

  // ==========================================
  // 🚀 الفلترة والترتيب
  // ==========================================
  const filteredMessages = messages.filter((msg) => {
    // فلترة التبويبات
    if (
      currentView === "inbox" &&
      (msg.isArchived || msg.isDeleted || msg.isSent)
    )
      return false;
    if (currentView === "sent" && !msg.isSent) return false;
    if (currentView === "archived" && !msg.isArchived) return false;
    if (currentView === "trash" && !msg.isDeleted) return false;
    if (currentView === "starred" && !msg.isStarred) return false;

    // فلترة الحسابات
    if (selectedAccount !== "all" && msg.accountId !== selectedAccount)
      return false;

    // فلترة السبام
    const fullText = (
      (msg.subject || "") +
      " " +
      (msg.body || "")
    ).toLowerCase();
    if (spamKeywords.some((keyword) => fullText.includes(keyword)))
      return false;

    // فلترة البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !(
          msg.subject?.toLowerCase().includes(query) ||
          msg.from?.toLowerCase().includes(query) ||
          msg.body?.toLowerCase().includes(query)
        )
      )
        return false;
    }

    return true;
  });

  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // تحديث عداد الرسائل غير المقروءة
  useEffect(() => {
    const validCount = messages.filter((m) => {
      const isSpam = spamKeywords.some((k) =>
        ((m.subject || "") + " " + (m.body || "")).toLowerCase().includes(k),
      );
      return !m.isRead && !m.isDeleted && !m.isArchived && !isSpam && !m.isSent;
    }).length;
    setUnreadCount(validCount);
  }, [messages]);

  // ==========================================
  // 🚀 العمليات على الرسائل (قراءة، أرشفة، حذف)
  // ==========================================
  const updateMessageInDB = async (msg, data) => {
    try {
      // التحديث في الباك إند
      await api.put(
        `/email/messages/${msg.id || msg.messageId || msg.uid}/status`,
        {
          from: msg.from,
          subject: msg.subject,
          ...data,
        },
      );
      // التحديث في الواجهة
      setMessages(
        messages.map((m) => (m.id === msg.id ? { ...m, ...data } : m)),
      );
    } catch (error) {
      console.error(error);
      toast.error("تعذر تحديث حالة الرسالة");
    }
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      updateMessageInDB(msg, { isRead: true });
    }
  };

  // 🚀 دالة الحذف النهائي من قاعدة البيانات
  const deletePermanentlyMutation = useMutation({
    mutationFn: (msgId) => api.delete(`/email/messages/${msgId}/permanent`),
    onSuccess: (_, msgId) => {
      toast.success("تم الحذف النهائي بنجاح");
      // إزالة الرسالة من الشاشة
      setMessages(
        messages.filter(
          (m) => m.id !== msgId && m.messageId !== msgId && m.uid !== msgId,
        ),
      );
      setSelectedMessage(null);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف النهائي"),
  });

  // ==========================================
  // 🚀 الذكاء الاصطناعي (تحليل الرسائل الواردة)
  // ==========================================
  const analyzeMutation = useMutation({
    mutationFn: (msg) =>
      api.post(
        `/email/messages/${msg.id || msg.messageId || msg.uid}/analyze`,
        {
          subject: msg.subject,
          body: msg.body,
          text: msg.text,
          from: msg.from,
          date: msg.date,
        },
      ),
    onSuccess: (res) => {
      toast.success("تم تحليل الرسالة واستخراج البيانات");
      setSelectedMessage({ ...selectedMessage, ...res.data.data });
      setMessages(
        messages.map((m) =>
          m.id === res.data.data.messageId || m.id === res.data.data.id
            ? { ...m, ...res.data.data }
            : m,
        ),
      );
    },
    onError: () => toast.error("فشل تحليل الرسالة"),
  });

  // ==========================================
  // 🚀 الذكاء الاصطناعي (صياغة الرسائل الصادرة)
  // ==========================================
  const handleAIAssist = async (action) => {
    if (!composeData.body.trim())
      return toast.error(
        "الرجاء كتابة نص أولي ليقوم الذكاء الاصطناعي بمعالجته",
      );

    setIsAILoading(true);
    setShowAIComposerMenu(false);

    try {
      // الاتصال بالباك إند الذي برمجناه (aiComposeEmail)
      const res = await api.post("/email/ai-compose", {
        text: composeData.body,
        action: action,
      });

      if (res.data?.success) {
        setComposeData((prev) => ({ ...prev, body: res.data.data }));
        toast.success("تم تطبيق الذكاء الاصطناعي بنجاح ✨");
      }
    } catch (error) {
      toast.error("فشل الذكاء الاصطناعي في معالجة النص");
    } finally {
      setIsAILoading(false);
    }
  };

  // ==========================================
  // 🚀 الإرسال والـ Composer
  // ==========================================
  const handleCompose = (mode = "new", message = null) => {
    setComposerMode(mode);
    setShowAIComposerMenu(false);

    if (mode === "reply" && message) {
      const replyTo = message.from.match(/<([^>]+)>/)?.[1] || message.from;
      setComposeData({
        to: replyTo,
        cc: "",
        bcc: "",
        subject: `رد: ${message.subject}`,
        body: "",
        attachments: [],
      });
    } else if (mode === "replyall" && message) {
      const replyTo = message.from.match(/<([^>]+)>/)?.[1] || message.from;
      setComposeData({
        to: replyTo,
        cc: message.cc || "",
        bcc: "",
        subject: `رد: ${message.subject}`,
        body: "",
        attachments: [],
      });
    } else if (mode === "forward" && message) {
      setComposeData({
        to: "",
        cc: "",
        bcc: "",
        subject: `إعادة توجيه: ${message.subject}`,
        body: `\n\n--- الرسالة الأصلية ---\nمن: ${message.from}\nالتاريخ: ${new Date(message.date).toLocaleString("ar-SA")}\nالموضوع: ${message.subject}\n\n${message.body}`,
        attachments: [],
      });
    } else {
      setComposeData({
        to: "",
        cc: "",
        bcc: "",
        subject: "",
        body: "",
        attachments: [],
      });
    }
    setIsComposerOpen(true);
  };

  const handleSendEmail = async () => {
    if (!accounts.length)
      return toast.error("يرجى إضافة حساب بريد أولاً من الإعدادات");
    if (!composeData.to || !composeData.subject)
      return toast.error("يرجى إكمال الحقول المطلوبة (إلى، والموضوع)");

    const toastId = toast.loading("جاري الإرسال...");
    try {
      const res = await api.post("/email/send", {
        accountId: accounts[0].id,
        to: composeData.to,
        cc: composeData.cc,
        bcc: composeData.bcc,
        subject: composeData.subject,
        body: composeData.body, // الباك إند سيقوم بإضافة القالب الاحترافي والتوقيع
        attachments: composeData.attachments,
      });

      if (res.data?.success) {
        toast.success("تم إرسال الرسالة بنجاح", { id: toastId });
        setIsComposerOpen(false);
        // تحديث القائمة لإظهار الرسالة المرسلة
        const newMsg = { ...res.data.data, date: new Date(res.data.data.date) };
        setMessages([newMsg, ...messages]);
      }
    } catch (error) {
      toast.error("فشل في الإرسال. تأكد من الاتصال بالخادم", { id: toastId });
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchEmails(1);
    toast.success("تم التحديث وجلب أحدث الرسائل");
  };

  const handleDelete = (msg) => {
    // إذا كنا في تاب المهملات، نقوم بالحذف النهائي
    if (currentView === "trash") {
      if (
        window.confirm(
          "هل أنت متأكد من حذف هذه الرسالة نهائياً؟ لا يمكن التراجع عن هذا الإجراء.",
        )
      ) {
        deletePermanentlyMutation.mutate(msg.id || msg.messageId || msg.uid);
      }
    } else {
      // نقل للمهملات (Soft Delete)
      updateMessageInDB(msg, { isDeleted: true, isArchived: false });
      toast.success("تم النقل إلى المهملات");
      if (selectedMessage?.id === msg.id) setSelectedMessage(null);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !isFetchingMore && !isLoading && currentView === "inbox")
        fetchEmails(page + 1);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const diffMins = Math.floor((new Date() - d) / 60000);
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffMins < 1440) return `منذ ${Math.floor(diffMins / 60)} ساعة`;
    return d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="flex h-screen bg-gray-50 font-[Tajawal] overflow-hidden"
      dir="rtl"
    >
      {/* 🚀 Datalist لجهات الاتصال للـ Auto-complete */}
      <datalist id="contactsList">
        {contacts.map((c, i) => (
          <option key={i} value={c.email}>
            {c.name}
          </option>
        ))}
      </datalist>

      {/* ========================================== */}
      {/* الشريط الجانبي */}
      {/* ========================================== */}
      <aside
        className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-64"} shrink-0 z-10`}
      >
        <div className="p-4">
          <button
            onClick={() => handleCompose("new")}
            className={`w-full bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:bg-blue-700 flex items-center justify-center gap-2 ${isSidebarCollapsed ? "h-12" : "h-12 px-6"}`}
          >
            <MailPlus className="w-5 h-5" />
            {!isSidebarCollapsed && <span>رسالة جديدة</span>}
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {[
            { id: "inbox", label: "الوارد", icon: Inbox, badge: unreadCount },
            { id: "starred", label: "المهم", icon: Star },
            { id: "sent", label: "الصادر", icon: Send },
            { id: "archived", label: "الأرشيف", icon: Archive },
            { id: "trash", label: "المهملات", icon: Trash2 },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentView(item.id);
                setSelectedMessage(null);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                currentView === item.id
                  ? "bg-blue-50 text-blue-700 font-bold"
                  : "text-gray-600 hover:bg-gray-100"
              } ${isSidebarCollapsed ? "justify-center" : ""}`}
            >
              <item.icon
                className={`w-5 h-5 ${currentView === item.id ? "text-blue-600" : ""}`}
              />
              {!isSidebarCollapsed && (
                <>
                  <span className="flex-1 text-right text-sm">
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          ))}
        </nav>

        {/* زر التصغير */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronLeft className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* المحتوى الرئيسي */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* شريط البحث (يختفي عند فتح رسالة لإعطاء مساحة أكبر) */}
        {!selectedMessage && (
          <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-4 shrink-0">
            <div className="flex-1 relative max-w-2xl">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في البريد..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                title="تحديث"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAISmartSearch(true)}
                className="p-2.5 text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                title="البحث الذكي بالذكاء الاصطناعي"
              >
                <Sparkles className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSignatureSettings(true)}
                className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                title="إعدادات التوقيع"
              >
                <FileSignature className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* 🚀 منطقة العرض (قائمة الرسائل) */}
        {!selectedMessage && (
          <div
            ref={listRef}
            className="flex-1 overflow-y-auto custom-scrollbar-slim"
            onScroll={handleScroll}
          >
            {isLoading ? (
              <LoadingSkeleton />
            ) : sortedMessages.length === 0 ? (
              <EmptyState
                icon={Mail}
                title="صندوق الوارد فارغ"
                message={
                  searchQuery
                    ? "لا توجد نتائج مطابقة للبحث"
                    : "لم يتم العثور على رسائل"
                }
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {sortedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group px-6 py-4 cursor-pointer transition-all hover:shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] hover:z-10 relative bg-white ${
                      !msg.isRead ? "bg-blue-50/20" : ""
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* النجمة والحالة */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateMessageInDB(msg, {
                              isStarred: !msg.isStarred,
                            });
                          }}
                          className="text-gray-300 hover:text-yellow-400"
                        >
                          <Star
                            className={`w-4 h-4 ${msg.isStarred ? "text-yellow-400 fill-yellow-400" : ""}`}
                          />
                        </button>
                        {!msg.isRead && (
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[13px] truncate ${!msg.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}
                          >
                            {msg.from?.split("<")[0].replace(/"/g, "") ||
                              "بدون مرسل"}
                          </span>
                          <span
                            className={`text-[11px] shrink-0 ${!msg.isRead ? "font-bold text-blue-600" : "text-gray-400"}`}
                          >
                            {formatDate(msg.date)}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <h4
                            className={`text-sm truncate flex-1 ${!msg.isRead ? "font-bold text-gray-900" : "text-gray-600 font-medium"}`}
                          >
                            {msg.subject || "(بدون موضوع)"}
                            <span className="text-gray-400 font-normal mx-2">
                              -
                            </span>
                            <span className="text-gray-500 font-normal text-xs">
                              {msg.body
                                ?.replace(/<[^>]*>/g, "")
                                .substring(0, 80)}
                            </span>
                          </h4>
                        </div>
                      </div>

                      {/* أدوات سريعة */}
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 bg-white shadow-sm border border-gray-100 rounded-lg p-1">
                        {currentView === "trash" ? (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMessageInDB(msg, { isDeleted: false });
                                toast.success("تم الاسترجاع للوارد");
                              }}
                              className="p-1.5 text-gray-400 hover:text-emerald-600 rounded"
                              title="استرجاع"
                            >
                              <Inbox className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(msg);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                              title="حذف نهائي"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMessageInDB(msg, { isArchived: true });
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-700 rounded"
                              title="أرشفة"
                            >
                              <Archive className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(msg);
                              }}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded"
                              title="نقل للمهملات"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isFetchingMore && (
                  <div className="py-4 flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 🚀 منطقة العرض (الرسالة الكاملة) - تظهر بدلاً من القائمة */}
        {selectedMessage && (
          <div className="absolute inset-0 z-20 flex flex-col bg-white animate-in slide-in-from-right-4 duration-300">
            {/* شريط الإجراءات العلوي للرسالة */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowRight className="w-4 h-4" /> العودة
                </button>
                <div className="w-px h-5 bg-gray-200"></div>
                <button
                  onClick={() =>
                    updateMessageInDB(selectedMessage, {
                      isArchived: true,
                    }).then(() => setSelectedMessage(null))
                  }
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="أرشفة"
                >
                  <Archive className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    updateMessageInDB(selectedMessage, {
                      isDeleted: true,
                    }).then(() => setSelectedMessage(null))
                  }
                  className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                  title="حذف"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    updateMessageInDB(selectedMessage, { isRead: false });
                    setSelectedMessage(null);
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                  title="تحديد كغير مقروء"
                >
                  <CircleDot className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCompose("reply", selectedMessage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" /> رد
                </button>
                <button
                  onClick={() => handleCompose("replyall", selectedMessage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <ReplyAll className="w-3.5 h-3.5" /> للجميع
                </button>
                <button
                  onClick={() => handleCompose("forward", selectedMessage)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                >
                  <Forward className="w-3.5 h-3.5" /> تحويل
                </button>
              </div>
            </div>

            {/* جسم الرسالة المقروءة */}
            <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full custom-scrollbar-slim">
              <div className="flex items-start justify-between mb-8">
                <h1 className="text-2xl font-black text-gray-900 leading-tight">
                  {selectedMessage.subject || "(بدون موضوع)"}
                </h1>
              </div>

              <div className="flex items-start gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg border border-blue-200 shadow-sm shrink-0">
                  {selectedMessage.from?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-gray-900 text-sm">
                        {selectedMessage.from?.split("<")[0].replace(/"/g, "")}
                      </span>
                      <span
                        className="text-xs text-gray-500 font-mono"
                        dir="ltr"
                      >
                        {selectedMessage.from?.match(/<([^>]+)>/)?.[1] ||
                          selectedMessage.from}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">
                      {new Date(selectedMessage.date).toLocaleString("ar-SA", {
                        dateStyle: "full",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    إلى: {selectedMessage.to || "أنا"}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none text-gray-800 text-[15px] leading-relaxed mb-10">
                {selectedMessage.html ? (
                  <div
                    className="email-content"
                    dangerouslySetInnerHTML={{ __html: selectedMessage.html }}
                  />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {selectedMessage.body || selectedMessage.text}
                  </div>
                )}
              </div>

              {/* قسم تحليل الذكاء الاصطناعي (يظهر في الأسفل) */}
              <div className="mt-auto border-t border-gray-100 pt-8">
                {!selectedMessage.isAnalyzed ? (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-6 text-center">
                    <Bot className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-purple-900 mb-2">
                      هل تريد استخراج البيانات من هذه الرسالة؟
                    </h3>
                    <p className="text-xs text-gray-600 mb-4 max-w-md mx-auto">
                      سيقوم الذكاء الاصطناعي بقراءة النص واستخراج أرقام الطلبات،
                      الرخص، واسم المالك تلقائياً لربطها بالنظام.
                    </p>
                    <button
                      onClick={() => analyzeMutation.mutate(selectedMessage)}
                      disabled={analyzeMutation.isPending}
                      className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2 mx-auto shadow-md"
                    >
                      {analyzeMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      بدء التحليل الذكي
                    </button>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-100 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <h3 className="font-bold text-emerald-900">
                        البيانات المستخرجة (AI)
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedMessage.reqNumber && (
                        <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                          <div className="text-[10px] text-gray-500 mb-1 font-bold">
                            رقم الطلب
                          </div>
                          <div className="font-black text-gray-900 text-sm">
                            {selectedMessage.reqNumber}
                          </div>
                        </div>
                      )}
                      {selectedMessage.serviceNumber && (
                        <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                          <div className="text-[10px] text-gray-500 mb-1 font-bold">
                            رقم الخدمة
                          </div>
                          <div className="font-black text-gray-900 text-sm">
                            {selectedMessage.serviceNumber}
                          </div>
                        </div>
                      )}
                      {selectedMessage.ownerName && (
                        <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                          <div className="text-[10px] text-gray-500 mb-1 font-bold">
                            اسم المالك
                          </div>
                          <div className="font-black text-gray-900 text-sm">
                            {selectedMessage.ownerName}
                          </div>
                        </div>
                      )}
                      {selectedMessage.serviceType && (
                        <div className="bg-white rounded-xl p-3 border border-emerald-100 shadow-sm">
                          <div className="text-[10px] text-gray-500 mb-1 font-bold">
                            نوع الخدمة
                          </div>
                          <div className="font-black text-gray-900 text-sm">
                            {selectedMessage.serviceType}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================== */}
      {/* 🚀 نافذة الإرسال (Modal في منتصف الشاشة) */}
      {/* ========================================== */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden animate-in zoom-in-95"
            style={{ height: "80vh" }}
          >
            {/* Header */}
            <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm flex items-center gap-2">
                <MailPlus className="w-4 h-4 text-blue-400" />
                {composerMode === "new"
                  ? "صياغة رسالة جديدة"
                  : "الرد على الرسالة"}
              </span>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="hover:bg-slate-700 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
              {/* Inputs */}
              <div className="bg-white border-b border-gray-200 shrink-0">
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-bold w-10">
                    إلى:
                  </span>
                  <input
                    type="email"
                    list="contactsList"
                    value={composeData.to}
                    onChange={(e) =>
                      setComposeData({ ...composeData, to: e.target.value })
                    }
                    className="flex-1 outline-none text-sm font-mono text-left focus:text-blue-600"
                    dir="ltr"
                    placeholder="example@domain.com"
                  />
                </div>
                <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
                  <span className="text-gray-400 text-sm font-bold w-10">
                    نسخة:
                  </span>
                  <input
                    type="email"
                    list="contactsList"
                    value={composeData.cc}
                    onChange={(e) =>
                      setComposeData({ ...composeData, cc: e.target.value })
                    }
                    className="flex-1 outline-none text-sm font-mono text-left focus:text-blue-600"
                    dir="ltr"
                  />
                </div>
                <div className="px-5 py-3 flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="الموضوع"
                    value={composeData.subject}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        subject: e.target.value,
                      })
                    }
                    className="w-full outline-none text-base font-bold text-gray-800 placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Toolbar & AI */}
              <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shrink-0 shadow-sm z-10">
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                    <Bold className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                    <Italic className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                    <Underline className="w-4 h-4" />
                  </button>
                  <div className="w-px h-5 bg-gray-200 mx-1"></div>
                  <button
                    className="p-1.5 hover:bg-gray-100 rounded text-gray-600"
                    title="إرفاق ملف"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>

                {/* 🚀 زر الذكاء الاصطناعي السحري */}
                <div className="relative">
                  <button
                    onClick={() => setShowAIComposerMenu(!showAIComposerMenu)}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 hover:from-purple-200 hover:to-blue-200 rounded-lg text-xs font-bold transition-all border border-purple-200 shadow-sm"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    الذكاء الاصطناعي 🪄
                  </button>

                  {showAIComposerMenu && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 shadow-2xl rounded-xl py-1.5 z-50 overflow-hidden">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 border-b border-gray-100 mb-1">
                        اختر الإجراء المطلوب للنص الحالي:
                      </div>
                      <button
                        onClick={() => handleAIAssist("rewrite")}
                        className="w-full text-right px-4 py-2.5 text-xs font-semibold hover:bg-purple-50 text-gray-700 flex items-center gap-2.5 transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-purple-500" />{" "}
                        تحسين وإعادة صياغة
                      </button>
                      <button
                        onClick={() => handleAIAssist("formal")}
                        className="w-full text-right px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 text-gray-700 flex items-center gap-2.5 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-blue-500" /> تحويل
                        لصيغة رسمية
                      </button>
                      <button
                        onClick={() => handleAIAssist("shorten")}
                        className="w-full text-right px-4 py-2.5 text-xs font-semibold hover:bg-amber-50 text-gray-700 flex items-center gap-2.5 transition-colors"
                      >
                        <AlignLeft className="w-3.5 h-3.5 text-amber-500" />{" "}
                        تلخيص واختصار
                      </button>
                      <button
                        onClick={() => handleAIAssist("expand")}
                        className="w-full text-right px-4 py-2.5 text-xs font-semibold hover:bg-emerald-50 text-gray-700 flex items-center gap-2.5 transition-colors"
                      >
                        <AlignRight className="w-3.5 h-3.5 text-emerald-500" />{" "}
                        إطالة وتوسيع الفكرة
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Area */}
              <div className="flex-1 relative bg-white">
                {isAILoading && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
                      <Sparkles className="w-8 h-8 text-purple-500 animate-pulse" />
                    </div>
                    <p className="text-sm font-black text-purple-800">
                      جاري صياغة النص ببراعة...
                    </p>
                  </div>
                )}
                <textarea
                  value={composeData.body}
                  onChange={(e) =>
                    setComposeData({ ...composeData, body: e.target.value })
                  }
                  className="w-full h-full p-6 outline-none resize-none text-sm font-medium text-gray-800 leading-relaxed custom-scrollbar-slim"
                  placeholder="اكتب رسالتك هنا... (يمكنك كتابة فكرة مبسطة وترك الذكاء الاصطناعي يقوم بصياغتها بشكل رسمي)"
                />
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0">
                <button
                  onClick={() => setIsComposerOpen(false)}
                  className="px-5 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSendEmail}
                  className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)] hover:-translate-y-0.5"
                >
                  إرسال الرسالة <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* النوافذ الجانبية الأخرى (الإعدادات وغيرها) */}
      {/* ========================================== */}
      {showSignatureSettings && (
        // نافذة إعدادات التوقيع (كما هي)
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            {/* محتوى إعدادات التوقيع */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <FileSignature className="w-5 h-5 text-blue-600" />
                إعدادات التوقيع (مكتب ديتيلز)
              </h3>
              <button
                onClick={() => setShowSignatureSettings(false)}
                className="p-1 hover:bg-gray-200 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 text-center text-sm font-semibold text-gray-600">
              تم برمجة التوقيع الرسمي للشركة برمجياً في الباك إند، سيتم إضافته
              تلقائياً بتنسيق HTML (متضمن اللوجو والبيانات) أسفل كل رسالة يتم
              إرسالها من النظام.
            </div>
          </div>
        </div>
      )}

      {/* CSS */}
      <style jsx>{`
        .email-content {
          line-height: 1.8;
          font-size: 15px;
          color: #1f2937;
        }
        .email-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 15px 0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .email-content a {
          color: #2563eb;
          text-decoration: none;
          font-weight: 600;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
