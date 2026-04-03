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
import api from "../../api/axios"; // 👈 تأكد من المسار الصحيح للـ API

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
  // ── States ──
  const [accounts, setAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentView, setCurrentView] = useState("inbox");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  // 💡 States خاصة بالتحميل اللانهائي (Pagination)
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // ── Modals State ──
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showSignatureSettings, setShowSignatureSettings] = useState(false);
  const [showAISmartSearch, setShowAISmartSearch] = useState(false);

  // ── Email Compose State ──
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

  // ── جلب البيانات من الـ API ──
  const fetchEmails = async (pageNumber = 1) => {
    if (pageNumber === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      // 1. جلب الحسابات (يتم مرة واحدة فقط)
      if (pageNumber === 1) {
        const accRes = await api.get("/email/accounts");
        setAccounts(accRes.data?.data || []);
      }

      // 2. جلب الرسائل الحية من Hostinger مع تحديد الصفحة
      const imapRes = await api.get(`/email/sync?page=${pageNumber}&limit=50`);
      const liveMsgs = (imapRes.data?.data || []).map((m) => ({
        ...m,
        date: new Date(m.date),
      }));

      // التحقق إذا ما كان هناك المزيد من الرسائل
      if (liveMsgs.length < 50) setHasMore(false);
      else setHasMore(true);

      if (pageNumber === 1) {
        // جلب رسائل قاعدة البيانات (الصادر، الأرشيف) فقط في الصفحة الأولى
        const dbRes = await api.get("/email/messages");
        const dbMsgs = (dbRes.data?.data || []).map((m) => ({
          ...m,
          date: new Date(m.date),
        }));

        // دمج الحي (الوارد) مع المحفوظ (الصادر)
        setMessages([...liveMsgs, ...dbMsgs]);
      } else {
        // إضافة الرسائل الجديدة للقديمة عند التمرير (مع منع التكرار)
        setMessages((prev) => {
          const combined = [...prev, ...liveMsgs];
          // فلترة ذكية لمنع تكرار الرسائل إذا نزلت رسالة جديدة أثناء السحب
          const uniqueMessages = Array.from(
            new Map(combined.map((item) => [item.id, item])).values(),
          );
          return uniqueMessages;
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
    fetchEmails(1); // تحميل الصفحة الأولى عند فتح الشاشة
  }, []);

  useEffect(() => {
    const count = messages.filter(
      (m) => !m.isRead && !m.isDeleted && !m.isArchived,
    ).length;
    setUnreadCount(count);
  }, [messages]);

  // ── التصفية والترتيب ──
  const [searchQuery, setSearchQuery] = useState("");
  const filteredMessages = messages.filter((msg) => {
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
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  // ── الإجراءات (Actions) التي تتواصل مع الباك إند ──
  const updateMessageInDB = async (id, data) => {
    try {
      await api.put(`/email/messages/${id}`, data);
      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, ...data } : msg)),
      );
    } catch (error) {
      toast.error("حدث خطأ أثناء التحديث");
    }
  };

  const handleToggleStar = (msg) => {
    updateMessageInDB(msg.id, { isStarred: !msg.isStarred });
  };

  const handleArchive = (msg) => {
    updateMessageInDB(msg.id, { isArchived: true });
    toast.success("تم الأرشفة");
    if (selectedMessage?.id === msg.id) setSelectedMessage(null);
  };

  const handleDelete = (msg) => {
    updateMessageInDB(msg.id, { isDeleted: true });
    toast.success("نُقلت للمهملات");
    if (selectedMessage?.id === msg.id) setSelectedMessage(null);
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) {
      updateMessageInDB(msg.id, { isRead: true });
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
        accountId: accounts[0].id, // يستخدم الحساب الأول مبدئياً
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

  // 💡 دالة مراقبة التمرير (Scroll Handler)
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // إذا وصل المستخدم لآخر 100 بيكسل في القائمة، ولم نكن نحمل مسبقاً، وهناك المزيد
    if (scrollHeight - scrollTop <= clientHeight + 100) {
      if (hasMore && !isFetchingMore && !isLoading && currentView === "inbox") {
        fetchEmails(page + 1);
      }
    }
  };

  // المساعدات البصرية
  const getAICategoryBadge = (category) => {
    switch (category) {
      case "building-license":
        return {
          label: "رخصة بناء",
          color: "bg-green-100 text-green-700 border-green-200",
        };
      case "client-contract":
        return {
          label: "عقد عميل",
          color: "bg-purple-100 text-purple-700 border-purple-200",
        };
      default:
        return {
          label: "عام",
          color: "bg-slate-100 text-slate-700 border-slate-200",
        };
    }
  };

  const formatDate = (date) => {
    const diffMins = Math.floor(
      (new Date().getTime() - date.getTime()) / 60000,
    );
    let timeAgo =
      diffMins < 60
        ? `منذ ${diffMins} دقيقة`
        : diffMins < 1440
          ? `منذ ${Math.floor(diffMins / 60)} ساعة`
          : `منذ ${Math.floor(diffMins / 1440)} يوم`;
    return `${timeAgo} • ${date.toLocaleDateString("ar-SA", { year: "numeric", month: "2-digit", day: "2-digit" })}`;
  };

  return (
    <div className="flex flex-col h-full bg-white font-[Tajawal]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-l from-blue-600 to-blue-700 text-white px-6 py-4">
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
              <span className="px-3 py-1 bg-white/20 text-white text-sm font-bold rounded-full">
                091
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex items-center gap-3 mb-3">
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

          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden">
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
            className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            title="تحديث البريد من السيرفر"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages List - 💡 تم نقل onScroll هنا ليعمل بشكل صحيح */}
        <div
          className="w-2/5 border-l border-slate-200 overflow-y-auto custom-scrollbar relative"
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
                  className={`p-4 cursor-pointer transition-all border-r-4 ${selectedMessage?.id === msg.id ? "bg-blue-50/80 border-blue-600" : msg.isRead ? "hover:bg-slate-50 border-transparent" : "bg-blue-50/30 hover:bg-blue-50/50 border-blue-400"}`}
                >
                  <div className="flex items-start gap-3">
                    <CircleDot
                      className={`w-3.5 h-3.5 flex-shrink-0 mt-1 ${msg.isRead ? "text-slate-300" : "text-blue-600 fill-blue-600"}`}
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
                      <h3
                        className={`text-sm mb-1 truncate ${msg.isRead ? "font-medium text-slate-700" : "font-bold text-slate-900"}`}
                      >
                        {msg.subject}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
                        <User size={12} />
                        <span className="truncate">{msg.from}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                        {msg.body}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={10} /> {formatDate(msg.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {/* 💡 مؤشر التحميل السفلي (Loading Indicator) عند التمرير */}
              {isFetchingMore && (
                <div className="py-6 flex justify-center items-center gap-2 text-slate-500 font-bold text-sm bg-slate-50">
                  <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
                  جاري تحميل المزيد من الرسائل...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Details */}
        <div className="flex-1 bg-slate-50 overflow-y-auto">
          {selectedMessage ? (
            <div className="p-6 max-w-4xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                {/* Header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStar(selectedMessage)}
                        className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <Star
                          className={`w-5 h-5 ${selectedMessage.isStarred ? "text-yellow-500 fill-yellow-500" : "text-slate-400"}`}
                        />
                      </button>
                      {!selectedMessage.isArchived && (
                        <button
                          onClick={() => handleArchive(selectedMessage)}
                          className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-600"
                          title="أرشفة"
                        >
                          <Archive size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedMessage)}
                        className="p-2 hover:bg-red-50 rounded-lg border border-slate-200 text-red-500"
                        title="حذف"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-12 font-bold">من:</span>
                      <span className="font-bold text-slate-900">
                        {selectedMessage.from}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-12 font-bold">
                        إلى:
                      </span>
                      <span className="text-slate-700">
                        {selectedMessage.to}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 w-12 font-bold">
                        التاريخ:
                      </span>
                      <span className="text-slate-700">
                        {formatDate(selectedMessage.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="p-6 min-h-[300px]">
                  <div className="whitespace-pre-wrap text-slate-800 leading-loose text-sm font-medium">
                    {selectedMessage.body}
                  </div>
                </div>

                {/* Reply Box Placeholder */}
                {!selectedMessage.isSent && currentView !== "trash" && (
                  <div className="p-4 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => {
                        setComposeData({
                          to: selectedMessage.from,
                          subject: `رد: ${selectedMessage.subject}`,
                          body: "",
                        });
                        setShowComposer(true);
                      }}
                      className="w-full text-right p-3 bg-white border border-slate-300 rounded-lg text-slate-500 text-sm hover:border-blue-400 transition-colors flex items-center gap-2"
                    >
                      <Send size={16} className="text-slate-400" /> انقر هنا
                      للرد على الرسالة...
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                <Mail className="w-8 h-8 text-slate-300" />
              </div>
              <p className="font-bold text-slate-500">
                اختر رسالة لعرض التفاصيل
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ========================================== */}
      {/* 💡 النوافذ المنبثقة المبسطة (Inline Modals) */}
      {/* ========================================== */}

      {/* 1. Modal إرسال رسالة جديدة */}
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
          <div className="bg-slate-50 p-2 text-xs text-slate-500 whitespace-pre-wrap rounded">
            <span className="font-bold text-slate-700">ملاحظة:</span> سيتم إرفاق
            الديباجة والتوقيع المحفوظ تلقائياً.
          </div>
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSendEmail}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send size={16} /> إرسال
            </button>
          </div>
        </div>
      </SimpleModal>

      {/* 2. Modal إعدادات Hostinger */}
      <SimpleModal
        title="إعدادات خوادم Hostinger"
        icon={Settings}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 text-xs bg-blue-50 text-blue-700 p-2 rounded mb-2">
            هذه الإعدادات مخصصة لربط سيرفرات <strong>Hostinger</strong> للبريد
            الوارد والصادر.
          </div>
          <input
            type="text"
            placeholder="اسم الحساب (مثال: بريد العمل)"
            className="col-span-2 p-2 border rounded text-sm"
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="col-span-2 p-2 border rounded text-sm"
          />
          <input
            type="password"
            placeholder="كلمة المرور"
            className="col-span-2 p-2 border rounded text-sm"
          />

          <div className="col-span-2 text-xs font-bold text-slate-500 mt-2">
            إعدادات IMAP (للاستقبال)
          </div>
          <input
            type="text"
            defaultValue="imap.hostinger.com"
            disabled
            className="p-2 border bg-slate-50 rounded text-sm text-slate-500"
          />
          <input
            type="text"
            defaultValue="993"
            disabled
            className="p-2 border bg-slate-50 rounded text-sm text-slate-500"
          />

          <div className="col-span-2 text-xs font-bold text-slate-500 mt-2">
            إعدادات SMTP (للإرسال)
          </div>
          <input
            type="text"
            defaultValue="smtp.hostinger.com"
            disabled
            className="p-2 border bg-slate-50 rounded text-sm text-slate-500"
          />
          <input
            type="text"
            defaultValue="465"
            disabled
            className="p-2 border bg-slate-50 rounded text-sm text-slate-500"
          />

          <button
            onClick={async () => {
              // في المشروع الحقيقي سترسل هذه للـ API
              toast.success("تمت إضافة حساب Hostinger بنجاح");
              setShowSettingsModal(false);
            }}
            className="col-span-2 mt-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700"
          >
            حفظ وربط الحساب
          </button>
        </div>
      </SimpleModal>

      {/* 3. Modal إعدادات التوقيع والديباجة */}
      <SimpleModal
        title="إعدادات القوالب"
        icon={FileSignature}
        isOpen={showSignatureSettings}
        onClose={() => setShowSignatureSettings(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold mb-2">
              الديباجة الافتراضية
            </label>
            <textarea
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2">
              التوقيع الافتراضي
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none h-24 resize-none"
            />
          </div>
          <button
            onClick={() => {
              toast.success("تم الحفظ");
              setShowSignatureSettings(false);
            }}
            className="w-full py-2.5 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900"
          >
            حفظ الإعدادات
          </button>
        </div>
      </SimpleModal>

      {/* 4. Modal البحث الذكي */}
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
              placeholder="مثال: استخرج كل رخص البناء المرفقة الأسبوع الماضي"
              className="w-full p-3 pr-10 border-2 border-purple-200 rounded-xl text-sm outline-none focus:border-purple-500 bg-purple-50/30"
            />
            <Bot
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400"
            />
          </div>
          <button
            onClick={() => {
              toast.info("الميزة ستتوفر بعد ربط الـ AI");
              setShowAISmartSearch(false);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm rounded-xl"
          >
            ابحث الآن
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
