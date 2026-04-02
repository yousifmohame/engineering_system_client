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

// ==========================================
// 💡 البيانات الوهمية (Mock Data)
// ==========================================
const MOCK_MESSAGES = [
  {
    id: "MSG-001",
    accountId: "ACC-1",
    from: "noreply@balady.gov.sa",
    to: "inbox@company.sa",
    subject: "إشعار بتحديث حالة الطلب",
    body: "عزيزنا المراجع...\nبخصوص طلبكم رقم: 863883 / 1447\nالخاص بخدمة : اصدار رخصة بناء الكترونية\nنفيدكم بأنه : تم الإطلاع في 20:38:27 PM\nأمانة منطقة الرياض - قطاع وسط مدينة الرياض",
    date: new Date("2026-04-02T08:30:00"),
    isRead: false,
    isStarred: true,
    isArchived: false,
    isDeleted: false,
    isSent: false,
    hasAttachments: false,
    messageCategory: "building-license",
    readInfo: { isRead: false },
    aiExtraction: {
      requestNumber: "863883",
      serviceNumber: "863883",
      ownerName: "عبدالله محمد الغامدي",
      serviceType: "اصدار رخصة بناء الكترونية",
      confidence: 0.95,
      matches: [{ transactionNumber: "2026/001", matchPercentage: 95 }],
    },
  },
  {
    id: "MSG-002",
    accountId: "ACC-1",
    from: "contracts@legal.sa",
    to: "inbox@company.sa",
    subject: "إشعار بموعد توقيع العقد",
    body: "السادة الكرام،\n\nنحيطكم علماً بأن موعد توقيع عقد البيع للعقار رقم 78901 محدد يوم الأحد 06/04/2026 الساعة 10:00 صباحاً.",
    date: new Date("2026-04-01T14:20:00"),
    isRead: true,
    isStarred: true,
    isArchived: false,
    isDeleted: false,
    isSent: false,
    hasAttachments: true,
    messageCategory: "client-contract",
    readInfo: {
      isRead: true,
      readBy: "أحمد محمد الإداري",
      readAt: new Date("2026-04-01T15:30:00"),
    },
    aiExtraction: {
      requestNumber: "CON-2026-567",
      ownerName: "خالد سعد المطيري",
      serviceType: "توقيع عقد البيع",
      confidence: 0.97,
      matches: [{ transactionNumber: "2026/003", matchPercentage: 96 }],
    },
  },
  {
    id: "SENT-001",
    accountId: "ACC-1",
    from: "inbox@company.sa",
    to: "client@example.sa",
    subject: "رد: استفسار عن حالة المعاملة",
    body: "السادة الكرام،\nتحية طيبة وبعد،\nبخصوص استفساركم عن المعاملة رقم TRX-2026-045، نفيدكم بأنه تم إنجاز المعاملة بنجاح.",
    date: new Date("2026-04-02T09:15:00"),
    isRead: true,
    isStarred: false,
    isArchived: false,
    isDeleted: false,
    isSent: true,
    hasAttachments: false,
  },
];

const MOCK_ACCOUNTS = [
  {
    id: "ACC-1",
    accountName: "بريد العمل الرئيسي",
    email: "inbox@company.sa",
    isActive: true,
  },
];

// ==========================================
// 💡 مكون النافذة المنبثقة المبسط (Inline Modal)
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
  // States
  const [accounts, setAccounts] = useState(MOCK_ACCOUNTS);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentView, setCurrentView] = useState("inbox");
  const [selectedAccount, setSelectedAccount] = useState("all");

  // Modals State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showComposer, setShowComposer] = useState(false);
  const [showSignatureSettings, setShowSignatureSettings] = useState(false);
  const [showAccountsManager, setShowAccountsManager] = useState(false);
  const [showCategorySettings, setShowCategorySettings] = useState(false);
  const [showExtractionSettings, setShowExtractionSettings] = useState(false);
  const [showMatchingSettings, setShowMatchingSettings] = useState(false);
  const [showAISmartSearch, setShowAISmartSearch] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    sender: "",
    keyword: "",
    isStarred: false,
    isRead: null,
  });

  const [signature, setSignature] = useState("--\nمع تحياتي،\nفريق العمل");
  const [preamble, setPreamble] = useState(
    "السادة الكرام،\n\nتحية طيبة وبعد،\n\n",
  );
  const [unreadCount, setUnreadCount] = useState(0);

  // تحديث عداد غير المقروء
  useEffect(() => {
    const count = messages.filter(
      (m) => !m.isRead && !m.isDeleted && !m.isArchived,
    ).length;
    setUnreadCount(count);
  }, [messages]);

  // فلترة الرسائل
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

    if (
      filters.sender &&
      !msg.from.toLowerCase().includes(filters.sender.toLowerCase())
    )
      return false;
    if (
      filters.keyword &&
      !msg.body.toLowerCase().includes(filters.keyword.toLowerCase())
    )
      return false;
    if (filters.isStarred && !msg.isStarred) return false;
    if (filters.isRead !== null && msg.isRead !== filters.isRead) return false;

    return true;
  });

  const sortedMessages = [...filteredMessages].sort(
    (a, b) => b.date.getTime() - a.date.getTime(),
  );

  // الإجراءات
  const handleToggleStar = (id) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, isStarred: !msg.isStarred } : msg,
      ),
    );
  };

  const handleMarkAsRead = (id, isRead) => {
    setMessages(
      messages.map((msg) => (msg.id === id ? { ...msg, isRead } : msg)),
    );
  };

  const handleArchive = (id) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, isArchived: true } : msg,
      ),
    );
    toast.success("تم الأرشفة بنجاح");
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const handleDelete = (id) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, isDeleted: true } : msg,
      ),
    );
    toast.success("تم النقل إلى سلة المهملات");
    if (selectedMessage?.id === id) setSelectedMessage(null);
  };

  const handleRefresh = () => {
    toast.success("تم تحديث البريد", { duration: 1500 });
  };

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    if (!msg.isRead) handleMarkAsRead(msg.id, true);
  };

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
                الصادر والوارد - نظام البريد الإلكتروني
              </h1>
              <p className="text-sm text-blue-100">
                إدارة البريد الإلكتروني مع ذكاء صناعي وتصنيف تلقائي
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
              onClick={() => setShowCategorySettings(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="التصنيفات"
            >
              <Tag className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowExtractionSettings(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="حقول الاستخراج"
            >
              <Sliders className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowMatchingSettings(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="المطابقة"
            >
              <Bot className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSignatureSettings(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="التوقيع"
            >
              <FileSignature className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowAccountsManager(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="إدارة الحسابات"
            >
              <Users className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg"
              title="إعدادات POP3/SMTP"
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
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${showFilters ? "bg-blue-600 text-white" : "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50"}`}
          >
            <Filter className="w-4 h-4" /> فلاتر{" "}
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleRefresh}
            className="p-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
            title="تحديث"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-white border border-slate-200 rounded-lg mb-3">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  كلمة محددة
                </label>
                <input
                  type="text"
                  value={filters.keyword}
                  onChange={(e) =>
                    setFilters({ ...filters, keyword: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm"
                  placeholder="بحث في المحتوى"
                />
              </div>
              <div className="col-span-3 flex items-end gap-3">
                <button
                  onClick={() =>
                    setFilters({ ...filters, isStarred: !filters.isStarred })
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${filters.isStarred ? "bg-yellow-100 text-yellow-700 border border-yellow-300" : "bg-slate-100 text-slate-700"}`}
                >
                  <Star
                    className={`w-4 h-4 ${filters.isStarred ? "fill-yellow-500" : ""}`}
                  />{" "}
                  المميزة فقط
                </button>
                <button
                  onClick={() =>
                    setFilters({
                      sender: "",
                      keyword: "",
                      isStarred: false,
                      isRead: null,
                    })
                  }
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-200"
                >
                  إعادة تعيين
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Storage Bar */}
        <div className="flex items-center justify-between p-2.5 bg-slate-100 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md">
              <HardDrive className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-bold text-slate-900">
                12.4 ميغابايت مستخدمة
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 rounded-md">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-slate-900">
                {messages.length} رسالة إجمالية
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowAISmartSearch(true)}
            className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-l from-purple-600 to-blue-600 text-white text-xs font-bold rounded-md hover:brightness-110 shadow-sm"
          >
            <Sparkles className="w-4 h-4" /> بحث ذكي بالذكاء الصناعي
          </button>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Messages List */}
        <div className="w-2/5 border-l border-slate-200 overflow-y-auto custom-scrollbar">
          {sortedMessages.length === 0 ? (
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
                        handleToggleStar(msg.id);
                      }}
                      className="flex-shrink-0 mt-0.5"
                    >
                      <Star
                        className={`w-4 h-4 ${msg.isStarred ? "text-yellow-500 fill-yellow-500" : "text-slate-300 hover:text-yellow-500"}`}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`text-[11px] font-bold font-mono ${msg.isRead ? "text-slate-400" : "text-blue-600"}`}
                        >
                          {msg.id}
                        </span>
                        {msg.messageCategory && (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded border ${getAICategoryBadge(msg.messageCategory).color}`}
                          >
                            {getAICategoryBadge(msg.messageCategory).label}
                          </span>
                        )}
                        {msg.readInfo?.isRead && (
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                            <CheckCircle size={10} /> قرأها:{" "}
                            {msg.readInfo.readBy}
                          </span>
                        )}
                      </div>

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
                        onClick={() => handleToggleStar(selectedMessage.id)}
                        className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200"
                      >
                        <Star
                          className={`w-5 h-5 ${selectedMessage.isStarred ? "text-yellow-500 fill-yellow-500" : "text-slate-400"}`}
                        />
                      </button>
                      {!selectedMessage.isArchived && (
                        <button
                          onClick={() => handleArchive(selectedMessage.id)}
                          className="p-2 hover:bg-slate-50 rounded-lg border border-slate-200 text-slate-600"
                          title="أرشفة"
                        >
                          <Archive size={20} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
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

                {/* AI Panel Inline */}
                {selectedMessage.aiExtraction &&
                  selectedMessage.aiExtraction.confidence > 0.8 && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 p-4">
                      <div className="flex items-center gap-2 mb-3 text-indigo-800 font-bold text-sm">
                        <Bot size={18} /> تم استخراج البيانات التالية بالذكاء
                        الاصطناعي (ثقة{" "}
                        {selectedMessage.aiExtraction.confidence * 100}%)
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {selectedMessage.aiExtraction.requestNumber && (
                          <div className="bg-white p-2 rounded border border-indigo-100">
                            رقم الطلب:{" "}
                            <strong>
                              {selectedMessage.aiExtraction.requestNumber}
                            </strong>
                          </div>
                        )}
                        {selectedMessage.aiExtraction.ownerName && (
                          <div className="bg-white p-2 rounded border border-indigo-100">
                            المالك:{" "}
                            <strong>
                              {selectedMessage.aiExtraction.ownerName}
                            </strong>
                          </div>
                        )}
                        {selectedMessage.aiExtraction.serviceType && (
                          <div className="bg-white p-2 rounded border border-indigo-100 col-span-2">
                            الخدمة:{" "}
                            <strong>
                              {selectedMessage.aiExtraction.serviceType}
                            </strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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
                      onClick={() => setShowComposer(true)}
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

      {/* 1. Modal إضافة/تعديل رسالة */}
      <SimpleModal
        title="رسالة جديدة"
        icon={MailPlus}
        isOpen={showComposer}
        onClose={() => setShowComposer(false)}
      >
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="إلى (البريد الإلكتروني)"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
          <input
            type="text"
            placeholder="الموضوع"
            className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
          />
          <textarea
            className="w-full p-3 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 h-48 resize-none"
            defaultValue={`${preamble}\n\n\n\n${signature}`}
          />
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                toast.success("تم الإرسال بنجاح");
                setShowComposer(false);
              }}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Send size={16} /> إرسال
            </button>
          </div>
        </div>
      </SimpleModal>

      {/* 2. Modal البحث الذكي */}
      <SimpleModal
        title="البحث الذكي بالذكاء الاصطناعي"
        icon={Sparkles}
        isOpen={showAISmartSearch}
        onClose={() => setShowAISmartSearch(false)}
      >
        <div className="flex flex-col gap-4 text-center">
          <p className="text-sm text-slate-600 leading-relaxed">
            اكتب ما تبحث عنه بلغتك الطبيعية، وسيقوم الذكاء الاصطناعي بتحليل
            نواياك والبحث في جميع الرسائل وتصنيفاتها.
          </p>
          <div className="relative">
            <input
              type="text"
              placeholder="مثال: اعرض لي رسائل الرخص الخاصة بمحمد الغامدي"
              className="w-full p-3 pr-10 border-2 border-purple-200 rounded-xl text-sm outline-none focus:border-purple-500 bg-purple-50/30"
            />
            <Bot
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400"
            />
          </div>
          <button
            onClick={() => {
              toast.info("جاري البحث العميق...");
              setShowAISmartSearch(false);
            }}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-sm rounded-xl hover:opacity-90"
          >
            بحث الآن
          </button>
        </div>
      </SimpleModal>

      {/* 3. Modal إعدادات التوقيع والديباجة */}
      <SimpleModal
        title="إعدادات القوالب (التوقيع والديباجة)"
        icon={FileSignature}
        isOpen={showSignatureSettings}
        onClose={() => setShowSignatureSettings(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold mb-2">
              الديباجة الافتراضية (تظهر في بداية الرسالة)
            </label>
            <textarea
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none h-24 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold mb-2">
              التوقيع الافتراضي (يظهر في نهاية الرسالة)
            </label>
            <textarea
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none h-24 resize-none"
            />
          </div>
          <button
            onClick={() => {
              toast.success("تم حفظ التوقيع");
              setShowSignatureSettings(false);
            }}
            className="w-full py-2.5 bg-slate-800 text-white font-bold text-sm rounded-lg hover:bg-slate-900"
          >
            حفظ الإعدادات
          </button>
        </div>
      </SimpleModal>

      {/* 4. Modal التصنيفات الذكية */}
      <SimpleModal
        title="إعدادات التصنيف التلقائي"
        icon={Tag}
        isOpen={showCategorySettings}
        onClose={() => setShowCategorySettings(false)}
      >
        <div className="text-sm text-slate-600 text-center mb-4">
          يقوم النظام بتصنيف الرسائل الواردة تلقائياً بناءً على الكلمات
          المفتاحية والمصدر.
        </div>
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
          {[
            "رخصة بناء",
            "عقد عميل",
            "معاملة رسمية",
            "طلب توظيف",
            "عرض سعر",
          ].map((cat, i) => (
            <div
              key={i}
              className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between"
            >
              <span className="font-bold text-slate-700 text-sm">{cat}</span>
              <div className="w-8 h-4 bg-blue-600 rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowCategorySettings(false)}
          className="w-full mt-4 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg"
        >
          إغلاق
        </button>
      </SimpleModal>

      {/* 5. Modal حسابات البريد (POP3/SMTP) */}
      <SimpleModal
        title="إعدادات خوادم البريد"
        icon={Settings}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      >
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="اسم الحساب"
            className="col-span-2 p-2 border rounded text-sm"
          />
          <input
            type="email"
            placeholder="البريد الإلكتروني"
            className="col-span-2 p-2 border rounded text-sm"
          />

          <div className="col-span-2 text-xs font-bold text-slate-500 mt-2">
            إعدادات POP3 (للاستقبال)
          </div>
          <input
            type="text"
            placeholder="الخادم (Server)"
            className="p-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="المنفذ (Port)"
            className="p-2 border rounded text-sm"
          />

          <div className="col-span-2 text-xs font-bold text-slate-500 mt-2">
            إعدادات SMTP (للإرسال)
          </div>
          <input
            type="text"
            placeholder="الخادم (Server)"
            className="p-2 border rounded text-sm"
          />
          <input
            type="text"
            placeholder="المنفذ (Port)"
            className="p-2 border rounded text-sm"
          />

          <button
            onClick={() => {
              toast.success("تم ربط الخادم بنجاح");
              setShowSettingsModal(false);
            }}
            className="col-span-2 mt-4 py-2.5 bg-green-600 text-white font-bold text-sm rounded-lg"
          >
            حفظ واختبار الاتصال
          </button>
        </div>
      </SimpleModal>
    </div>
  );
}
