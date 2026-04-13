import React, { useState, useEffect } from "react";
import {
  Mail,
  Inbox,
  Send,
  Archive,
  Trash2,
  Star,
  Settings,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Calendar,
  User,
  FileText,
  Sparkles,
  Users,
  MailPlus,
  FileSignature,
  Bot,
  AlertCircle,
  CheckCircle,
  Tag,
  Sliders,
  HardDrive,
  Trash,
  X,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../api/axios";
import { useMutation } from "@tanstack/react-query";

// ==========================================
// 💡 المكونات المنبثقة المبسطة (Inline Modal)
// ==========================================
const SimpleModal = ({ title, isOpen, onClose, children, icon: Icon }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            {Icon && <Icon size={18} className="text-blue-600" />} {title}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ==========================================
// 💡 المكون الرئيسي
// ==========================================
export default function InboxCenter() {
  const [accounts, setAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentView, setCurrentView] = useState("inbox");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showSignatureSettings, setShowSignatureSettings] = useState(false);
  const [showAISmartSearch, setShowAISmartSearch] = useState(false);

  const [composeData, setComposeData] = useState({
    to: "",
    subject: "",
    body: "",
  });

  const [signature, setSignature] = useState("--\nمع تحياتي،\nفريق العمل");
  const [preamble, setPreamble] = useState(
    "السادة الكرام،\n\nتحية طيبة وبعد،\n\n",
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchEmails = async (pageNumber = 1) => {
    if (pageNumber === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      if (pageNumber === 1) {
        const accRes = await api.get("/email/accounts");
        setAccounts(accRes.data?.data || []);
      }

      // جلب الرسائل من السيرفر الحي
      const imapRes = await api.get(`/email/sync?page=${pageNumber}&limit=50`);
      const liveMsgs = (imapRes.data?.data || []).map((m) => ({
        ...m,
        date: new Date(m.date),
      }));

      if (liveMsgs.length < 50) setHasMore(false);
      else setHasMore(true);

      if (pageNumber === 1) {
        // جلب الرسائل من قاعدة البيانات
        const dbRes = await api.get("/email/messages");
        const dbMsgs = (dbRes.data?.data || []).map((m) => ({
          ...m,
          date: new Date(m.date),
          // تحويل id قاعدة البيانات إلى uid إذا لم يكن موجوداً لتسهيل المقارنة
          uid: m.messageId || m.id,
        }));

        // 🚀 دمج ذكي بدون تكرار باستخدام Map و messageId أو uid
        const combinedMap = new Map();

        // إعطاء الأولوية لرسائل قاعدة البيانات (لأنها تحتوي على التحليلات والتعديلات)
        dbMsgs.forEach((msg) => combinedMap.set(msg.uid, msg));

        // إضافة الرسائل الحية فقط إذا لم تكن موجودة في الداتابيز
        liveMsgs.forEach((msg) => {
          if (!combinedMap.has(msg.id)) {
            combinedMap.set(msg.id, msg);
          }
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
      toast.error("حدث خطأ أثناء جلب الرسائل");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEmails(1);
  }, []);

  // 💡 كلمات السبام (شركات الاتصال والدعاية) للإخفاء المباشر
  const spamKeywords = [
    "باقة",
    "باقات",
    "رصيد",
    "اشحن",
    "ميجابايت",
    "جيجابايت",
    "نت",
    "سلفني",
    "عرض",
    "عروض",
    "خصم",
    "حصريا",
    "استمتع",
    "موبايلي",
    "stc",
    "زين",
    "فودافون",
    "اتصالات",
    "وي",
    "نغمات",
    "كول تون",
    "اشترك",
    "ارسل رقم",
  ];

  // 💡 تحديث الفلتر ليخفي الرسائل التي تحتوي على كلمات السبام
  const [searchQuery, setSearchQuery] = useState("");
  const filteredMessages = messages.filter((msg) => {
    // 1. فلترة العرض (وارد، صادر، مؤرشف، مهملات)
    if (
      currentView === "inbox" &&
      (msg.isArchived || msg.isDeleted || msg.isSent)
    )
      return false;
    if (currentView === "sent" && !msg.isSent) return false;
    if (currentView === "archived" && !msg.isArchived) return false;
    if (currentView === "trash" && !msg.isDeleted) return false;
    if (selectedAccount !== "all" && msg.accountId !== selectedAccount)
      return false;

    // 2. 🚀 فلترة السبام (Spam Filter) - نخفي الرسالة إذا كانت تحتوي على إحدى الكلمات في العنوان أو النص
    const fullText = (
      (msg.subject || "") +
      " " +
      (msg.body || "")
    ).toLowerCase();
    const isSpam = spamKeywords.some((keyword) => fullText.includes(keyword));
    if (isSpam) return false; // إخفاء رسائل السبام

    // 3. فلترة البحث اليدوي
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !(
          msg.subject.toLowerCase().includes(query) ||
          msg.from.toLowerCase().includes(query) ||
          msg.body.toLowerCase().includes(query)
        )
      )
        return false;
    }
    return true;
  });

  const sortedMessages = [...filteredMessages].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // تحديث عداد الغير مقروء ليحسب فقط الرسائل الصالحة (المفلترة من السبام)
  useEffect(() => {
    const validCount = messages.filter((m) => {
      const isSpam = spamKeywords.some((keyword) =>
        ((m.subject || "") + " " + (m.body || ""))
          .toLowerCase()
          .includes(keyword),
      );
      return !m.isRead && !m.isDeleted && !m.isArchived && !isSpam;
    }).length;
    setUnreadCount(validCount);
  }, [messages]);

  const updateMessageInDB = async (msg, data) => {
    try {
      await api.put(`/email/messages/${msg.id}`, {
        from: msg.from,
        subject: msg.subject,
        ...data,
      });
      setMessages(
        messages.map((m) => (m.id === msg.id ? { ...m, ...data } : m)),
      );
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const analyzeMutation = useMutation({
    // 👇 التعديل هنا: استخدام المعرف المتاح أياً كان اسمه
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

  const handleToggleStar = (msg) => {
    updateMessageInDB(msg, { isStarred: !msg.isStarred });
  };

  const handleArchive = (msg) => {
    updateMessageInDB(msg, { isArchived: true });
    toast.success("تم الأرشفة");
    if (selectedMessage?.id === msg.id) setSelectedMessage(null);
  };

  const handleDelete = (msg) => {
    updateMessageInDB(msg, { isDeleted: true });
    toast.success("نُقلت للمهملات");
    if (selectedMessage?.id === msg.id) setSelectedMessage(null);
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      setMessages(
        messages.map((m) => (m.id === msg.id ? { ...m, isRead: true } : m)),
      );
      updateMessageInDB(msg, { isRead: true });
    }
  };

  const handleSendEmail = async () => {
    if (!accounts.length) return toast.error("يرجى إضافة حساب بريد أولاً");
    if (!composeData.to || !composeData.subject)
      return toast.error("يرجى إكمال الحقول");

    const toastId = toast.loading("جاري الإرسال عبر خوادم Hostinger...");
    try {
      const fullBody = `${preamble}\n${composeData.body}\n\n${signature}`;

      const res = await api.post("/email/send", {
        accountId: accounts[0].id,
        to: composeData.to,
        subject: composeData.subject,
        body: fullBody,
      });

      const newMsg = { ...res.data.data, date: new Date(res.data.data.date) };
      setMessages([newMsg, ...messages]);

      toast.success("تم إرسال الرسالة بنجاح", { id: toastId });
      setShowComposer(false);
      setComposeData({ to: "", subject: "", body: "" });
    } catch (error) {
      toast.error("فشل في الإرسال. تأكد من إعدادات Hostinger", { id: toastId });
    }
  };

  const handleRefresh = () => {
    setPage(1);
    fetchEmails(1);
    toast.success("تم التحديث وجلب أحدث الرسائل");
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !isFetchingMore && !isLoading && currentView === "inbox") {
        fetchEmails(page + 1);
      }
    }
  };

  const formatDate = (date) => {
    const d = new Date(date); // 👈 الحل هنا

    const diffMins = Math.floor((new Date().getTime() - d.getTime()) / 60000);

    let timeAgo =
      diffMins < 60
        ? `منذ ${diffMins} دقيقة`
        : diffMins < 1440
          ? `منذ ${Math.floor(diffMins / 60)} ساعة`
          : `منذ ${Math.floor(diffMins / 1440)} يوم`;

    return `${timeAgo} • ${d.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })}`;
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Tajawal]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-l from-blue-600 to-blue-700 text-white px-4 py-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                الصادر والوارد - Hostinger Email
              </h1>
              <p className="text-sm text-blue-100">
                إدارة البريد الإلكتروني مع خوادم هوستنقر
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowComposer(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
              <MailPlus className="w-4 h-4" /> رسالة جديدة
            </button>
            <button
              onClick={() => setShowAISmartSearch(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="البحث الذكي"
            >
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSignatureSettings(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="التوقيع"
            >
              <FileSignature className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="إعدادات Hostinger POP3/SMTP"
            >
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mr-2 border-r border-white/20 pr-4">
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                  {unreadCount} جديد
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-3 mb-0">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="بحث في البريد (موضوع، مرسل، محتوى...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-10 pl-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm">
            <button
              onClick={() => setCurrentView("inbox")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium ${currentView === "inbox" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Inbox className="w-4 h-4" /> الوارد
            </button>
            <button
              onClick={() => setCurrentView("sent")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-r border-slate-300 ${currentView === "sent" ? "bg-green-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Send className="w-4 h-4" /> الصادر
            </button>
            <button
              onClick={() => setCurrentView("archived")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-r border-slate-300 ${currentView === "archived" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Archive className="w-4 h-4" /> الأرشيف
            </button>
            <button
              onClick={() => setCurrentView("trash")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-r border-slate-300 ${currentView === "trash" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-50"}`}
            >
              <Trash2 className="w-4 h-4" /> المهملات
            </button>
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm"
            title="تحديث البريد من السيرفر"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages List */}
        <div
          className={`border-l border-slate-200 overflow-y-auto custom-scrollbar relative transition-all duration-300 ${selectedMessage ? "w-3/5 hidden md:block" : "w-full"}`}
          onScroll={handleScroll}
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <RefreshCw className="w-8 h-8 mb-3 animate-spin text-blue-500" />
              <p className="font-bold">جاري المزامنة مع Hostinger...</p>
            </div>
          ) : sortedMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Mail className="w-12 h-12 mb-3 opacity-50" />
              <p className="text-sm font-bold">لا توجد رسائل</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {sortedMessages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 cursor-pointer transition-all border-r-4 ${
                    selectedMessage?.id === msg.id
                      ? "bg-blue-50/80 border-blue-600"
                      : !msg.isRead
                        ? "bg-blue-50/50 border-blue-400 hover:bg-blue-100/50"
                        : "bg-white border-transparent hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <CircleDot
                      className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${
                        !msg.isRead
                          ? "text-blue-600 fill-blue-600"
                          : "text-slate-300"
                      }`}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStar(msg);
                      }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${msg.isStarred ? "text-yellow-500 fill-yellow-500" : "text-slate-300 hover:text-yellow-500"}`}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold truncate">
                          <User size={12} className="flex-shrink-0" />
                          <span className="truncate">
                            {msg.from.split("<")[0].replace(/"/g, "")}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap flex items-center gap-1">
                          {formatDate(msg.date)}
                        </span>
                      </div>

                      <h3
                        className={`text-sm mb-1.5 truncate ${
                          !msg.isRead
                            ? "font-black text-slate-900"
                            : "font-semibold text-slate-700"
                        }`}
                      >
                        {msg.subject}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {msg.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {isFetchingMore && (
                <div className="py-6 flex justify-center items-center gap-2 text-slate-500 font-bold text-sm bg-slate-50 border-t">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                  جاري تحميل المزيد من الرسائل...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Details */}
        <div
          className={`bg-slate-50 overflow-y-auto transition-all duration-300 ${selectedMessage ? "w-full md:w-full block" : "w-0 hidden"}`}
        >
          {selectedMessage ? (
            <div className="p-4 md:p-6 h-full flex flex-col">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex flex-col">
                {/* Header */}
                <div className="p-5 border-b border-slate-100 relative">
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="absolute top-4 left-4 p-2 bg-red hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors border border-slate-200"
                    title="إغلاق العارض"
                  >
                    <X size={18} />
                  </button>

                  <div className="flex items-start justify-between mb-4 pl-10">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStar(selectedMessage)}
                        className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <Star
                          className={`w-4 h-4 ${selectedMessage.isStarred ? "text-yellow-500 fill-yellow-500" : "text-slate-400"}`}
                        />
                      </button>
                      {!selectedMessage.isArchived && (
                        <button
                          onClick={() => handleArchive(selectedMessage)}
                          className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-600"
                          title="أرشفة"
                        >
                          <Archive size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedMessage)}
                        className="p-2 hover:bg-red-50 rounded-lg border border-slate-200 text-red-500"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-12 font-bold text-xs">
                        من:
                      </span>
                      <span
                        className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100"
                        dir="ltr"
                      >
                        {selectedMessage.from}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-12 font-bold text-xs">
                        إلى:
                      </span>
                      <span className="text-slate-700" dir="ltr">
                        {selectedMessage.to || "البريد الوارد"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-slate-500 w-12 font-bold text-xs">
                        التاريخ:
                      </span>
                      <span className="text-slate-700 text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                        {new Date(selectedMessage.date).toLocaleString("ar-SA")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 flex-1 overflow-y-auto bg-white">
                  {selectedMessage.html ? (
                    // عرض رسائل Gmail والبريد الحديث بتنسيقاتها الأصلية
                    <div
                      className="email-html-content text-sm text-slate-800"
                      dangerouslySetInnerHTML={{ __html: selectedMessage.html }}
                    />
                  ) : (
                    // عرض الرسائل النصية القديمة
                    <div className="whitespace-pre-wrap text-slate-800 leading-loose text-sm font-medium">
                      {selectedMessage.body ||
                        selectedMessage.text ||
                        "لا يوجد نص لعرضه"}
                    </div>
                  )}
                </div>

                {/* 🚀 قسم الذكاء الاصطناعي 🚀 */}
                <div className="p-4 bg-slate-50 border-t border-slate-100">
                  {!selectedMessage.isAnalyzed ? (
                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-purple-200 rounded-xl bg-purple-50/30">
                      <Sparkles className="w-8 h-8 text-purple-400 mb-3" />
                      <h3 className="text-sm font-bold text-purple-900 mb-1">
                        تحليل ذكي للبيانات
                      </h3>
                      <p className="text-xs text-slate-500 mb-4 text-center max-w-sm">
                        سيقوم النظام بقراءة الرسالة واستخراج رقم الطلب، الخدمة،
                        اسم المالك، والإفادة لربطها بالمعاملات تلقائياً.
                      </p>
                      {/* الكود الصحيح: */}
                      <button
                        onClick={() => analyzeMutation.mutate(selectedMessage)}
                        disabled={analyzeMutation.isPending}
                        className="flex items-center gap-2 px-5 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 shadow-md shadow-purple-200 transition-all disabled:opacity-50"
                      >
                        {analyzeMutation.isPending ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                        بدء استخراج البيانات
                      </button>
                    </div>
                  ) : (
                    // 🚀 عرض البيانات المستخرجة
                    <div className="bg-gradient-to-l from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-purple-600" />
                          <h3 className="text-sm font-bold text-purple-900">
                            البيانات المستخرجة آلياً
                          </h3>
                          <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-[10px] font-bold rounded">
                            AI Analyzed
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            analyzeMutation.mutate(selectedMessage)
                          }
                          disabled={analyzeMutation.isPending}
                          className="text-[10px] text-purple-600 hover:text-purple-800 font-bold underline"
                        >
                          إعادة التحليل
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                        {[
                          {
                            label: "رقم الطلب",
                            value: selectedMessage.reqNumber,
                          },
                          {
                            label: "سنة الطلب",
                            value: selectedMessage.reqYear,
                          },
                          {
                            label: "اسم المالك",
                            value: selectedMessage.ownerName,
                          },
                          {
                            label: "نوع الخدمة",
                            value: selectedMessage.serviceType,
                          },
                          { label: "الجهة", value: selectedMessage.entityName },
                          {
                            label: "وقت الإطلاع",
                            value: selectedMessage.viewTime,
                          },
                        ].map((item, idx) =>
                          item.value ? (
                            <div
                              key={idx}
                              className="p-3 bg-white border border-purple-100 rounded-lg shadow-sm"
                            >
                              <div className="text-[10px] text-slate-500 mb-1">
                                {item.label}
                              </div>
                              <div
                                className="text-xs font-bold text-slate-900 truncate"
                                title={item.value}
                              >
                                {item.value}
                              </div>
                            </div>
                          ) : null,
                        )}
                      </div>

                      {selectedMessage.replyText && (
                        <div className="p-3 bg-white border border-purple-100 rounded-lg shadow-sm mb-4">
                          <div className="text-[10px] text-slate-500 mb-1">
                            محتوى الإفادة / التحديث
                          </div>
                          <div className="text-sm font-bold text-slate-900 leading-relaxed">
                            {selectedMessage.replyText}
                          </div>
                        </div>
                      )}

                      {/* 🚀 قسم الربط الذكي بالمعاملات */}
                      {selectedMessage.linkedTxId ? (
                        <div className="p-3 bg-white border rounded-lg border-green-300">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-bold text-slate-900">
                              تم إيجاد معاملة مطابقة
                            </span>
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-green-100 text-green-700">
                              تطابق {selectedMessage.matchConfidence}%
                            </span>
                          </div>
                          <div className="text-xs text-slate-600 mb-2">
                            رقم المعاملة في النظام:{" "}
                            {selectedMessage.linkedTxId.slice(-6)}
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700">
                            فتح المعاملة وإرفاق الإفادة
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 text-xs text-orange-800 font-bold leading-relaxed">
                            لم يتم العثور على معاملة مطابقة تلقائياً لهذا الطلب.
                            يمكنك البحث عن المعاملة يدوياً لربطها.
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Reply Box Placeholder */}
                {!selectedMessage.isSent && currentView !== "trash" && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                    <button
                      onClick={() => {
                        setComposeData({
                          to:
                            selectedMessage.from.match(/<([^>]+)>/)?.[1] ||
                            selectedMessage.from,
                          subject: `رد: ${selectedMessage.subject}`,
                          body: "",
                        });
                        setShowComposer(true);
                      }}
                      className="w-full text-right p-3 bg-white border border-slate-300 rounded-lg text-slate-500 text-sm hover:border-blue-400 transition-colors flex items-center gap-2 shadow-sm"
                    >
                      <Send size={16} className="text-slate-400" /> انقر هنا
                      للرد على هذه الرسالة...
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* ========================================== */}
      {/* 💡 النوافذ المنبثقة المبسطة (Inline Modals) */}
      {/* ========================================== */}

      <SimpleModal
        title="رسالة جديدة عبر Hostinger"
        icon={MailPlus}
        isOpen={showComposer}
        onClose={() => setShowComposer(false)}
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="إلى (البريد الإلكتروني)"
            value={composeData.to}
            onChange={(e) =>
              setComposeData({ ...composeData, to: e.target.value })
            }
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
            dir="ltr"
          />
          <input
            type="text"
            placeholder="الموضوع"
            value={composeData.subject}
            onChange={(e) =>
              setComposeData({ ...composeData, subject: e.target.value })
            }
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
          <textarea
            placeholder="اكتب رسالتك هنا..."
            value={composeData.body}
            onChange={(e) =>
              setComposeData({ ...composeData, body: e.target.value })
            }
            className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 h-32 resize-none"
          />
          <div className="bg-slate-50 p-2 text-xs text-slate-500 whitespace-pre-wrap rounded border border-slate-100">
            <span className="font-bold text-slate-700">ملاحظة:</span> سيتم إرفاق
            الديباجة والتوقيع المحفوظ تلقائياً.
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSendEmail}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow-md"
            >
              <Send size={16} /> إرسال
            </button>
          </div>
        </div>
      </SimpleModal>

      <SimpleModal
        title="إعدادات خوادم Hostinger"
        icon={Settings}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      >
        <div className="text-center p-4">
          <Settings className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-600">
            يرجى استخدام شاشة <strong>"إعدادات البريد"</strong> الرئيسية لإدارة
            الحسابات وربطها.
          </p>
        </div>
      </SimpleModal>

      <SimpleModal
        title="إعدادات القوالب"
        icon={FileSignature}
        isOpen={showSignatureSettings}
        onClose={() => setShowSignatureSettings(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-700">
              الديباجة الافتراضية
            </label>
            <textarea
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2 text-slate-700">
              التوقيع الافتراضي
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 h-24 resize-none"
            />
          </div>
          <button
            onClick={() => {
              toast.success("تم الحفظ");
              setShowSignatureSettings(false);
            }}
            className="w-full py-2.5 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900 shadow-md"
          >
            حفظ الإعدادات
          </button>
        </div>
      </SimpleModal>

      <SimpleModal
        title="البحث الذكي بالذكاء الاصطناعي"
        icon={Sparkles}
        isOpen={showAISmartSearch}
        onClose={() => setShowAISmartSearch(false)}
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            اكتب ما تبحث عنه بلغتك الطبيعية.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="مثال: استخرج كل الفواتير المرفقة الأسبوع الماضي"
              className="w-full p-3 pr-10 border-2 border-purple-200 rounded-xl text-sm outline-none focus:border-purple-500 bg-purple-50/30"
            />
            <Bot
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400"
            />
          </div>
          <button
            onClick={() => {
              toast.info("الميزة قيد التطوير");
              setShowAISmartSearch(false);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm rounded-xl shadow-md"
          >
            ابحث الآن
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
