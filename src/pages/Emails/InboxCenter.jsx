import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import api from "../../api/axios";
import { useMutation } from "@tanstack/react-query";
import { FileSignature, X, ShieldCheck, Info } from "lucide-react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import MessageList from "./components/MessageList";
import EmailViewer from "./components/EmailViewer";
import ComposerModal from "./components/ComposerModal";

export default function InboxCenter() {
  const [accounts, setAccounts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [currentView, setCurrentView] = useState("inbox");
  const [selectedAccount, setSelectedAccount] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerMode, setComposerMode] = useState("new");
  const [contacts, setContacts] = useState([]);
  const [showAIComposerMenu, setShowAIComposerMenu] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [visibleCount, setVisibleCount] = useState(30);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSignatureSettings, setShowSignatureSettings] = useState(false);
  const [showAISmartSearch, setShowAISmartSearch] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);

  // 💡 تصميم التوقيع الافتراضي (مطابق تماماً للصورة المرفقة)
  // 💡 التوقيع فقط (بدون الفوتر)
  const DEFAULT_SIGNATURE = `
  <div dir="ltr" style="text-align: right; font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #444; line-height: 1.6;">
    <img src="https://details-worksystem1.com/logo.jpeg" alt="Details Consults Logo" style="max-height: 55px; margin-bottom: 10px; display: inline-block;" />
    <br/>
    <strong style="color: #111; font-size: 12px;">DETAILS CONSULTS CO. LTD – Engineering Consultants</strong><br/>
    <strong style="color: #111; font-size: 13px;" dir="rtl">شركة ديتيلز كونسلتس المحدودة للاستشارات الهندسية</strong><br/>
    Office No. 7, First Floor – Building 2957<br/>
    Saud Ibn Abdulaziz Ibn Muhammad Branch St.<br/>
    Riyadh 12274, Kingdom of Saudi Arabia<br/>
    +966-590722827<br/>
    <a href="mailto:info@details-consults.sa" style="color: #0056b3; text-decoration: none;">info@details-consults.sa</a>
  </div>
  `;

  const DEFAULT_FOOTER_TEXT =
    "إخلاء مسؤولية: هذه الرسالة ومرفقاتها سرية وقد تكون محمية بموجب القانون. إذا وصلتكم بالخطأ، يرجى حذفها وإبلاغنا فوراً.";

  const [composeData, setComposeData] = useState({
    to: "",
    cc: "",
    bcc: "",
    subject: "",
    body: "",
    attachments: [],
    signature: DEFAULT_SIGNATURE,
    footerText: DEFAULT_FOOTER_TEXT,
    footerColor: "#64748b", // لون افتراضي رمادي
    footerSize: "11px", // حجم افتراضي صغير
  });

  // تحديث دالة فتح نافذة الإرسال لتعيين التوقيع الافتراضي دائماً
  const handleCompose = (mode = "new", message = null) => {
    setComposerMode(mode);
    setShowAIComposerMenu(false);

    let baseData = {
      to: "",
      cc: "",
      bcc: "",
      subject: "",
      body: "",
      attachments: [],
      signature: DEFAULT_SIGNATURE,
      footerText: DEFAULT_FOOTER_TEXT,
      footerColor: "#64748b",
      footerSize: "11px",
    };

    if (mode === "reply" && message) {
      const replyTo = message.from.match(/<([^>]+)>/)?.[1] || message.from;
      baseData = {
        ...baseData,
        to: replyTo,
        subject: `رد: ${message.subject}`,
      };
    } else if (mode === "replyall" && message) {
      const replyTo = message.from.match(/<([^>]+)>/)?.[1] || message.from;
      baseData = {
        ...baseData,
        to: replyTo,
        cc: message.cc || "",
        subject: `رد: ${message.subject}`,
      };
    } else if (mode === "forward" && message) {
      baseData = {
        ...baseData,
        subject: `إعادة توجيه: ${message.subject}`,
        body: `\n\n--- الرسالة الأصلية ---\nمن: ${message.from}\nالتاريخ: ${new Date(message.date).toLocaleString("ar-SA")}\nالموضوع: ${message.subject}\n\n${message.body}`,
      };
    }

    setComposeData(baseData);
    setIsComposerOpen(true);
  };

  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    setVisibleCount(30);
  }, [currentView, searchQuery]);

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

  const fetchEmails = async (pageNumber = 1) => {
    if (pageNumber === 1) setIsLoading(true);
    else setIsFetchingMore(true);

    try {
      if (pageNumber === 1) {
        const accRes = await api.get("/email/accounts");
        setAccounts(accRes.data?.data || []);
        try {
          const contactsRes = await api.get("/email/contacts");
          if (contactsRes.data?.success) setContacts(contactsRes.data.data);
        } catch (cErr) {
          console.warn("تعذر جلب جهات الاتصال", cErr);
        }
      }

      // داخل دالة fetchEmails
      const imapRes = await api.get(
        `/email/sync?page=${pageNumber}&limit=50&folder=${currentView}`,
      );
      const liveMsgs = (imapRes.data?.data || []).map((m) => ({
        ...m,
        date: new Date(m.date),
      }));

      if (liveMsgs.length < 50) setHasMore(false);
      else setHasMore(true);

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
      toast.error("حدث خطأ أثناء جلب الرسائل من السيرفر");
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    fetchEmails(1);
  }, [currentView]);

  // 💡 دالة البحث الذكي المتصلة بالـ API الجديد
  const handleAISearch = async () => {
    if (!searchQuery.trim()) {
      return toast.error(
        "يرجى كتابة ما تبحث عنه (مثال: رسائل شركة الاتصالات الأسبوع الماضي)",
      );
    }

    setIsAISearching(true);
    const toastId = toast.loading("🤖 الذكاء الاصطناعي يبحث في رسائلك...");

    try {
      // استدعاء הـ API الجديد الذي أنشأناه في الباك إند
      const res = await api.post("/email/search-ai", { query: searchQuery });

      if (res.data?.success) {
        setMessages(res.data.data); // وضع نتائج الذكاء الاصطناعي في القائمة

        // 🚨 خدعة برمجية هامة:
        // نقوم بمسح نص البحث حتى لا تقوم الفلترة المحلية (Client-side)
        // بإخفاء الرسائل المعقدة التي جلبها الـ AI بناءً على السياق
        setSearchQuery("");

        // تغيير التاب تلقائياً لـ "الوارد" لعرض نتائج البحث مباشرة
        setCurrentView("inbox");

        toast.success("تم جلب نتائج البحث الذكي بنجاح ✨", { id: toastId });
      }
    } catch (error) {
      toast.error("حدث خطأ أثناء البحث بالذكاء الاصطناعي", { id: toastId });
    } finally {
      setIsAISearching(false);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    // 💡 1. الإضافة الأهم: إخفاء الرسائل المحذوفة من جميع التبويبات (باستثناء تاب المهملات)
    if (currentView !== "trash" && msg.isDeleted) return false;

    // 2. فلترة التبويبات بدقة
    if (
      currentView === "inbox" &&
      (msg.isArchived || msg.isDeleted || msg.isSent || msg.isDraft)
    )
      return false;
    if (currentView === "sent" && (!msg.isSent || msg.isDraft)) return false;
    if (currentView === "drafts" && !msg.isDraft) return false;
    if (currentView === "archived" && (!msg.isArchived || msg.isDraft))
      return false;
    if (currentView === "trash" && !msg.isDeleted) return false;
    if (currentView === "starred" && (!msg.isStarred || msg.isDraft))
      return false;
    if (selectedAccount !== "all" && msg.accountId !== selectedAccount)
      return false;

    const fullText = (
      (msg.subject || "") +
      " " +
      (msg.body || "")
    ).toLowerCase();
    if (spamKeywords.some((keyword) => fullText.includes(keyword)))
      return false;

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

  const messagesToRender = sortedMessages.slice(0, visibleCount);

  useEffect(() => {
    const validCount = messages.filter((m) => {
      const isSpam = spamKeywords.some((k) =>
        ((m.subject || "") + " " + (m.body || "")).toLowerCase().includes(k),
      );
      return !m.isRead && !m.isDeleted && !m.isArchived && !isSpam && !m.isSent;
    }).length;
    setUnreadCount(validCount);
  }, [messages]);

  const updateMessageInDB = async (msg, data) => {
    try {
      await api.put(
        `/email/messages/${msg.id || msg.messageId || msg.uid}/status`,
        { from: msg.from, subject: msg.subject, ...data },
      );
      setMessages(
        messages.map((m) => (m.id === msg.id ? { ...m, ...data } : m)),
      );
    } catch (error) {
      toast.error("تعذر تحديث حالة الرسالة");
    }
  };

  // 💡 التعديل الهام هنا للتحميل الكسول للمسودات
  const handleSelectMessage = async (msg) => {
    if (msg.isDraft) {
      const toastId = toast.loading("جاري تحميل المسودة...");
      try {
        // 💡 جلب التفاصيل الكاملة للمسودة من الباك إند
        const res = await api.get(
          `/email/messages/${msg.id || msg.messageId || msg.uid}`,
        );
        const fullDraft = res.data.data;

        setComposeData({
          id: fullDraft.id,
          to: fullDraft.to || "",
          cc: fullDraft.cc || "",
          bcc: fullDraft.bcc || "",
          subject: fullDraft.subject || "",
          body: fullDraft.body || "",
          attachments: fullDraft.attachments || [],
          signature: fullDraft.signature || DEFAULT_SIGNATURE,
          footerText: fullDraft.footerText || DEFAULT_FOOTER_TEXT,
          footerColor: fullDraft.footerColor || "#64748b",
          footerSize: fullDraft.footerSize || "11px",
        });
        setComposerMode("draft");
        setIsComposerOpen(true);
      } catch (error) {
        toast.error("حدث خطأ أثناء فتح المسودة");
      } finally {
        toast.dismiss(toastId);
      }
    } else {
      setSelectedMessage(msg);
    }
  };

  const deletePermanentlyMutation = useMutation({
    mutationFn: (msgId) => api.delete(`/email/messages/${msgId}/permanent`),
    onSuccess: (_, msgId) => {
      toast.success("تم الحذف النهائي بنجاح");
      setMessages(
        messages.filter(
          (m) => m.id !== msgId && m.messageId !== msgId && m.uid !== msgId,
        ),
      );
      setSelectedMessage(null);
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف النهائي"),
  });

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

  const handleAIAssist = async (action) => {
    if (!composeData.body.trim())
      return toast.error(
        "الرجاء كتابة نص أولي ليقوم الذكاء الاصطناعي بمعالجته",
      );
    setIsAILoading(true);
    setShowAIComposerMenu(false);
    try {
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

  const handleSendEmail = async () => {
    if (!accounts.length)
      return toast.error("يرجى إضافة حساب بريد أولاً من الإعدادات");
    if (!composeData.to || !composeData.subject)
      return toast.error("يرجى إكمال الحقول المطلوبة (إلى، والموضوع)");

    const toastId = toast.loading("جاري الإرسال...");
    try {
      const res = await api.post("/email/send", {
        draftId: composeData.id, // 👈 إرسال الآي دي ليقوم الباك إند بحذف المسودة
        accountId: accounts[0].id,
        to: composeData.to,
        cc: composeData.cc,
        bcc: composeData.bcc,
        subject: composeData.subject,
        body: composeData.body,
        attachments: composeData.attachments,
        signature: composeData.signature, // 👈 إرسال التوقيع الحي للباك إند
        footer: composeData.footerText, // 👈 إرسال الفوتر الحي للباك إند
      });

      if (res.data?.success) {
        toast.success("تم إرسال الرسالة بنجاح", { id: toastId });
        setIsComposerOpen(false);

        // 💡 تحديث الشاشة: إزالة المسودة من القائمة ووضع الرسالة في الصادر
        const newMsg = { ...res.data.data, date: new Date(res.data.data.date) };
        setMessages((prevMessages) => {
          // فلترة المسودة التي تم إرسالها لكي تختفي فوراً من الشاشة
          const filtered = prevMessages.filter((m) => m.id !== composeData.id);
          return [newMsg, ...filtered];
        });
      }
    } catch (error) {
      toast.error("فشل في الإرسال", { id: toastId });
    }
  };

  // 🚀 دالة حفظ المسودة في قاعدة البيانات
  const handleSaveDraft = async () => {
    if (!accounts.length) return toast.error("يرجى إضافة حساب بريد أولاً");

    const toastId = toast.loading("جاري حفظ المسودة...");
    try {
      if (composeData.id) {
        await api.put(`/email/messages/${composeData.id}/status`, {
          ...composeData,
          isDraft: true,
        });
      } else {
        const res = await api.post("/email/messages/draft", {
          accountId: accounts[0].id,
          to: composeData.to,
          cc: composeData.cc,
          bcc: composeData.bcc,
          subject: composeData.subject || "(بدون موضوع)",
          body: composeData.body,
          attachments: composeData.attachments,
          // 💡 إرسال بيانات التوقيع والفوتر للباك إند
          signature: composeData.signature,
          footerText: composeData.footerText,
          footerColor: composeData.footerColor,
          footerSize: composeData.footerSize,
        });
        setMessages([res.data.data, ...messages]);
      }

      toast.success("تم حفظ المسودة بنجاح", { id: toastId });
      setIsComposerOpen(false);
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ المسودة", { id: toastId });
    }
  };

  const handleDelete = (msg) => {
    if (currentView === "trash") {
      if (window.confirm("هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع.")) {
        deletePermanentlyMutation.mutate(msg.id || msg.messageId || msg.uid);
      }
    } else {
      updateMessageInDB(msg, { isDeleted: true, isArchived: false });
      toast.success("تم النقل إلى المهملات");
      if (selectedMessage?.id === msg.id) setSelectedMessage(null);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;

    // استخدمنا 300 بكسل بدلاً من 100 لضمان تحميل الرسائل قبل وصول المستخدم لنهاية الشاشة بقليل
    if (scrollHeight - scrollTop <= clientHeight + 300) {
      // أ) إذا كان لدينا رسائل محملة في الذاكرة ولم تُعرض بعد، نعرض 20 رسالة إضافية
      if (visibleCount < sortedMessages.length) {
        setVisibleCount((prev) => prev + 20);
      }
      // ب) إذا انتهينا من عرض كل ما في الذاكرة، نطلب رسائل قديمة من السيرفر (IMAP)
      else if (
        hasMore &&
        !isFetchingMore &&
        !isLoading &&
        currentView === "inbox"
      ) {
        fetchEmails(page + 1);
      }
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
      className="
        relative flex h-full w-full overflow-hidden
        bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white
        font-[Tajawal]
      "
      dir="rtl"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute right-[-140px] top-[-140px] h-80 w-80 rounded-full bg-[#123f59]/10 blur-3xl" />
        <div className="absolute left-[-140px] bottom-[-140px] h-80 w-80 rounded-full bg-[#c5983c]/16 blur-3xl" />
      </div>
      <datalist id="contactsList">
        {contacts.map((c, i) => (
          <option key={i} value={c.email}>
            {c.name}
          </option>
        ))}
      </datalist>

      <Sidebar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSelectedMessage={setSelectedMessage}
        unreadCount={unreadCount}
        handleCompose={handleCompose}
      />

      <main
        className="
          relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden
          border-r border-[#d8b46a]/20 bg-white/75 backdrop-blur-xl
        "
      >
        {!selectedMessage && (
          <Header
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleRefresh={() => {
              setPage(1);
              fetchEmails(1);
              toast.success("تم التحديث");
            }}
            handleAISearch={handleAISearch}
            isAILoading={isAISearching}
            setShowAISmartSearch={setShowAISmartSearch}
            setShowSignatureSettings={setShowSignatureSettings}
          />
        )}

        {!selectedMessage && (
          <MessageList
            sortedMessages={messagesToRender}
            isLoading={isLoading}
            isFetchingMore={isFetchingMore}
            searchQuery={searchQuery}
            currentView={currentView}
            listRef={listRef}
            handleScroll={handleScroll}
            handleSelectMessage={handleSelectMessage}
            updateMessageInDB={updateMessageInDB}
            handleDelete={handleDelete}
            formatDate={formatDate}
          />
        )}

        {selectedMessage && (
          <EmailViewer
            selectedMessage={selectedMessage}
            setSelectedMessage={setSelectedMessage}
            updateMessageInDB={updateMessageInDB}
            handleCompose={handleCompose}
            analyzeMutation={analyzeMutation}
          />
        )}
      </main>

      {isComposerOpen && (
        <ComposerModal
          composerMode={composerMode}
          composeData={composeData}
          setComposeData={setComposeData}
          contacts={contacts}
          setIsComposerOpen={setIsComposerOpen}
          handleSendEmail={handleSendEmail}
          handleAIAssist={handleAIAssist}
          showAIComposerMenu={showAIComposerMenu}
          setShowAIComposerMenu={setShowAIComposerMenu}
          isAILoading={isAILoading}
          handleSaveDraft={handleSaveDraft}
        />
      )}

      {showSignatureSettings && (
        <div
          className="
            fixed inset-0 z-[60] flex items-center justify-center
            bg-[#06111d]/70 p-4 backdrop-blur-md
          "
          dir="rtl"
        >
          <div
            className="
              w-full max-w-md overflow-hidden rounded-[28px]
              border border-[#d8b46a]/35 bg-white
              shadow-[0_30px_90px_rgba(0,0,0,0.35)]
            "
          >
            <div
              className="
                relative overflow-hidden border-b border-[#d8b46a]/25
                bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
                px-5 py-4 text-white
              "
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute right-[-55px] top-[-55px] h-32 w-32 rounded-full bg-[#e2bf74]/18 blur-3xl" />
                <div className="absolute left-[-55px] bottom-[-55px] h-32 w-32 rounded-full bg-emerald-400/14 blur-3xl" />
              </div>

              <div className="relative z-10 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className="
                      grid h-11 w-11 shrink-0 place-items-center
                      rounded-2xl border border-[#e2bf74]/35
                      bg-white/12 text-[#e2bf74]
                    "
                  >
                    <FileSignature className="h-5 w-5" />
                  </span>

                  <div className="min-w-0">
                    <h3 className="truncate text-base font-black">
                      إعدادات التوقيع
                    </h3>

                    <p className="mt-0.5 truncate text-[11px] font-bold text-white/60">
                      Signature configuration
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowSignatureSettings(false)}
                  className="
                    flex min-w-[54px] flex-col items-center justify-center gap-0.5
                    rounded-xl border border-white/15 bg-white/10
                    px-2 py-1 text-[8px] font-black leading-none text-white
                    transition hover:bg-red-500/30
                  "
                  type="button"
                >
                  <X className="h-4 w-4" />
                  <span>إغلاق</span>
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div
                className="
                  flex items-start gap-3 rounded-2xl
                  border border-cyan-700/20 bg-cyan-50/80
                  p-4 text-cyan-900
                "
              >
                <span
                  className="
                    grid h-10 w-10 shrink-0 place-items-center
                    rounded-2xl bg-white text-cyan-800 shadow-sm
                  "
                >
                  <Info className="h-5 w-5" />
                </span>

                <div>
                  <p className="text-xs font-black">معلومة</p>
                  <p className="mt-1 text-xs font-bold leading-6 text-cyan-900/80">
                    تم برمجة التوقيع الرسمي للشركة برمجياً في الباك إند، ويتم
                    إضافته تلقائياً عند إنشاء الرسائل.
                  </p>
                </div>
              </div>

              <div
                className="
                  flex items-center gap-3 rounded-2xl
                  border border-emerald-200 bg-emerald-50
                  p-4 text-emerald-800
                "
              >
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <span className="text-xs font-black">
                  التوقيع الرسمي مفعل ومحمي.
                </span>
              </div>

              <button
                onClick={() => setShowSignatureSettings(false)}
                className="
                  flex h-11 w-full items-center justify-center gap-2
                  rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
                  text-sm font-black text-white
                  shadow-[0_14px_30px_rgba(18,63,89,0.22)]
                  transition hover:-translate-y-[1px]
                "
                type="button"
              >
                تم الفهم
                <ShieldCheck className="h-4 w-4 text-[#e2bf74]" />
              </button>
            </div>
          </div>
        </div>
      )}

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
