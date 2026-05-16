import React, { useState, useRef, useEffect } from "react";
import {
  MailPlus,
  X,
  Bold,
  Italic,
  Underline,
  Paperclip,
  Wand2,
  RefreshCw,
  BookOpen,
  AlignLeft,
  AlignRight,
  Sparkles,
  Send,
  EyeOff,
  Users,
  Save,
  Printer,
  UserCheck,
  AlignCenter,
  FileText,
  UploadCloud,
  Image as ImageIcon,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../api/axios";

export default function ComposerModal({
  composerMode,
  composeData,
  setComposeData,
  contacts,
  setIsComposerOpen,
  handleSendEmail,
  handleAIAssist,
  showAIComposerMenu,
  setShowAIComposerMenu,
  isAILoading,
  handleSaveDraft,
}) {
  const [showBcc, setShowBcc] = useState(false);
  const [showSystemSelect, setShowSystemSelect] = useState(false);
  const [isGeneratingSubject, setIsGeneratingSubject] = useState(false);
  const [isTranslatingFooter, setIsTranslatingFooter] = useState(false);

  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const signatureRef = useRef(null);

  useEffect(() => {
    if (
      editorRef.current &&
      composeData.body &&
      editorRef.current.innerHTML === ""
    ) {
      editorRef.current.innerHTML = composeData.body;
    }

    if (
      signatureRef.current &&
      composeData.signature &&
      signatureRef.current.innerHTML === ""
    ) {
      signatureRef.current.innerHTML = composeData.signature;
    }
  }, []);

  const execFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    setComposeData((prev) => ({
      ...prev,
      body: editorRef.current?.innerHTML || "",
    }));
  };

  const handlePrintDraft = () => {
    toast.info("جاري تجهيز المسودة للطباعة...");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      toast.error("تعذر فتح نافذة الطباعة");
      return;
    }

    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>مسودة - ${composeData.subject || "بدون موضوع"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.7;
              color: #1f2937;
            }

            .header {
              border-bottom: 2px solid #d8b46a;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }

            .content {
              font-size: 16px;
              margin-bottom: 40px;
            }

            .sig {
              padding-top: 10px;
              color: #555;
            }
          </style>
        </head>

        <body>
          <div class="header">
            <div><strong>إلى:</strong> ${composeData.to || ""}</div>
            <div><strong>الموضوع:</strong> ${composeData.subject || ""}</div>
          </div>

          <div class="content">${composeData.body || ""}</div>
          <div class="sig">${composeData.signature || ""}</div>

          <div style="margin-top:20px; color:${
            composeData.footerColor || "#64748b"
          }; font-size:${composeData.footerSize || "11px"}; text-align:center;">
            ${composeData.footerText || ""}
          </div>

          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  const handleSendForReview = () => {
    const reviewer = prompt(
      "أدخل اسم الموظف أو البريد لإرسال الرسالة لمراجعتها:",
    );

    if (reviewer) {
      toast.success(`تم إرسال المسودة إلى ${reviewer} للمراجعة`);
      setIsComposerOpen(false);
    }
  };

  const handleGenerateSubject = async () => {
    const textContent = editorRef.current?.innerText || composeData.body;

    if (!textContent || textContent.length < 10) {
      return toast.error(
        "الرجاء كتابة جزء من الرسالة أولاً ليتمكن الذكاء الاصطناعي من اقتراح موضوع.",
      );
    }

    setIsGeneratingSubject(true);

    try {
      const res = await api.post("/email/ai-compose", {
        text: `اقترح عنواناً قصيراً ورسمياً لهذا البريد:\n\n${textContent}`,
        action: "shorten",
      });

      if (res.data?.success) {
        const generatedSubject = res.data.data
          .replace(/\[.*?\]/g, "")
          .replace(/عنوان:|Subject:/gi, "")
          .trim();

        setComposeData((prev) => ({
          ...prev,
          subject: generatedSubject,
        }));

        toast.success("تم صياغة العنوان بنجاح ✨");
      }
    } catch (error) {
      toast.error("فشل في توليد الموضوع");
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  const handleTranslateFooter = async () => {
    if (!composeData.footerText) {
      return toast.error("الرجاء كتابة نص الفوتر أولاً");
    }

    setIsTranslatingFooter(true);

    try {
      const res = await api.post("/email/translate", {
        text: composeData.footerText,
        targetLanguage: "English",
      });

      if (res.data?.success) {
        setComposeData((prev) => ({
          ...prev,
          footerText: `${prev.footerText}\n\n${res.data.data}`,
        }));

        toast.success("تم إضافة الترجمة الإنجليزية بنجاح ✨");
      }
    } catch (error) {
      toast.error("فشل في ترجمة الفوتر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsTranslatingFooter(false);
    }
  };

  const handleChangeLogo = () => {
    const newUrl = prompt("أدخل الرابط المباشر للشعار الجديد (URL):");

    if (newUrl) {
      const updatedSig = composeData.signature?.match(/<img[^>]+src=/i)
        ? composeData.signature.replace(
            /<img[^>]+src="([^">]+)"/i,
            `<img src="${newUrl}"`,
          )
        : `<img src="${newUrl}" style="max-width:160px; height:auto;" />${
            composeData.signature || ""
          }`;

      setComposeData((prev) => ({
        ...prev,
        signature: updatedSig,
      }));

      if (signatureRef.current) {
        signatureRef.current.innerHTML = updatedSig;
      }

      toast.success("تم تحديث الشعار بنجاح");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setComposeData((prev) => ({
          ...prev,
          attachments: [
            ...(prev.attachments || []),
            {
              filename: file.name,
              path: reader.result,
              size: file.size,
              type: file.type,
            },
          ],
        }));
      };

      reader.readAsDataURL(file);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const attachments = composeData.attachments || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0b1f2a]/65 p-2 backdrop-blur-md sm:p-4"
      dir="rtl"
    >
      <style>
        {`
          .composer-editable:empty:before {
            content: attr(data-placeholder);
            color: #94a3b8;
            pointer-events: none;
          }

          .composer-editable img {
            max-width: 100%;
            height: auto;
          }

          .composer-editable a {
            color: #123f59;
            font-weight: 700;
          }
        `}
      </style>

      <div className="flex h-[96dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-[#d8b46a]/30 bg-[#f6f1e8] shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
        {/* HEADER */}
        <div className="relative shrink-0 overflow-hidden border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#123f59] via-[#174b63] to-[#0f3448] px-4 py-3 text-white sm:px-5">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute right-[-60px] top-[-60px] h-40 w-40 rounded-full bg-[#e2bf74]/15 blur-3xl" />
            <div className="absolute left-[-60px] bottom-[-60px] h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#d8b46a]/40 bg-white/10 text-[#e2bf74]">
                <MailPlus className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-black">
                  {composerMode === "new"
                    ? "صياغة رسالة جديدة"
                    : "الرد على الرسالة"}
                </h2>
                <p className="text-[11px] font-semibold text-white/60">
                  Details Mail Composer
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleSaveDraft}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15"
                type="button"
              >
                <Save className="h-3.5 w-3.5 text-[#e2bf74]" />
                حفظ مسودة
              </button>

              <button
                onClick={handlePrintDraft}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15"
                type="button"
              >
                <Printer className="h-3.5 w-3.5 text-[#e2bf74]" />
                طباعة
              </button>

              <button
                onClick={handleSendForReview}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-bold text-white transition hover:bg-white/15"
                type="button"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#e2bf74]" />
                مراجعة
              </button>

              <button
                onClick={() => setIsComposerOpen(false)}
                className="
                  flex min-w-[54px] flex-col items-center justify-center gap-0.5
                  rounded-xl border border-white/15 bg-white/10
                  px-2 py-1 text-[8px] font-black leading-none text-white
                  transition hover:bg-red-500/30
                "
                title="إغلاق"
                type="button"
              >
                <X className="h-4 w-4" />
                <span>إغلاق</span>
              </button>
            </div>
          </div>
        </div>

        {/* FIELDS */}
        <div className="shrink-0 border-b border-[#e8ddc8] bg-white/75 px-4 py-3 backdrop-blur-xl sm:px-5">
          <div className="grid gap-2 lg:grid-cols-2">
            {/* TO */}
            <div className="relative flex min-w-0 items-center gap-3 rounded-2xl border border-[#e8ddc8] bg-white px-3 py-2 shadow-sm">
              <span className="shrink-0 text-xs font-black text-[#123f59]">
                إلى:
              </span>

              <input
                type="email"
                list="contactsList"
                value={composeData.to}
                onChange={(e) =>
                  setComposeData({ ...composeData, to: e.target.value })
                }
                className="min-w-0 flex-1 bg-transparent text-left font-mono text-sm text-[#123f59] outline-none placeholder:text-slate-400"
                dir="ltr"
                placeholder="example@domain.com"
              />

              <div className="relative shrink-0">
                <button
                  onClick={() => setShowSystemSelect(!showSystemSelect)}
                  className="
                    flex h-8 items-center gap-1.5 rounded-xl
                    border border-[#d8b46a]/25 bg-[#f8efe0]/70
                    px-3 text-[11px] font-bold text-[#123f59]
                    transition hover:bg-[#f8efe0]
                  "
                  title="اختيار من النظام"
                  type="button"
                >
                  <Users className="h-3.5 w-3.5" />
                  <span>النظام</span>
                </button>

                {showSystemSelect && (
                  <div className="absolute top-full right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-[#e8ddc8] bg-white shadow-2xl">
                    <div className="border-b border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[10px] font-bold leading-relaxed text-[#6b7a80]">
                      اختيار من جهات التواصل أو ملفات العملاء أو الأملاك أو
                      المعاملات أو العقود أو الفواتير.
                    </div>

                    <button className="w-full px-4 py-2.5 text-right text-xs font-bold text-[#123f59] hover:bg-[#f8efe0]/60">
                      جهات الاتصال
                    </button>

                    <button className="w-full px-4 py-2.5 text-right text-xs font-bold text-[#123f59] hover:bg-[#f8efe0]/60">
                      ملفات العملاء / الأملاك
                    </button>

                    <button className="w-full px-4 py-2.5 text-right text-xs font-bold text-[#123f59] hover:bg-[#f8efe0]/60">
                      المعاملات / العقود / الفواتير
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* CC */}
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e8ddc8] bg-white px-3 py-2 shadow-sm">
              <span className="shrink-0 text-xs font-black text-[#123f59]">
                نسخة:
              </span>

              <input
                type="email"
                list="contactsList"
                value={composeData.cc}
                onChange={(e) =>
                  setComposeData({ ...composeData, cc: e.target.value })
                }
                className="min-w-0 flex-1 bg-transparent text-left font-mono text-sm text-[#123f59] outline-none"
                dir="ltr"
              />

              <button
                onClick={() => setShowBcc(!showBcc)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-[11px] font-bold transition ${
                  showBcc
                    ? "border-red-200 bg-red-50 text-red-600"
                    : "border-[#d8b46a]/25 bg-[#f8efe0]/60 text-[#123f59] hover:bg-[#f8efe0]"
                }`}
                type="button"
              >
                <EyeOff className="h-3.5 w-3.5" />
                BCC
              </button>
            </div>

            {/* BCC */}
            {showBcc && (
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-red-200 bg-red-50/55 px-3 py-2 shadow-sm lg:col-span-2">
                <span className="shrink-0 text-xs font-black text-red-600">
                  مخفية:
                </span>

                <input
                  type="email"
                  list="contactsList"
                  value={composeData.bcc}
                  onChange={(e) =>
                    setComposeData({ ...composeData, bcc: e.target.value })
                  }
                  className="min-w-0 flex-1 bg-transparent text-left font-mono text-sm text-red-700 outline-none"
                  dir="ltr"
                />
              </div>
            )}

            {/* SUBJECT */}
            <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 shadow-sm lg:col-span-2">
              <span className="shrink-0 text-xs font-black text-[#c5983c]">
                الموضوع:
              </span>

              <input
                type="text"
                placeholder="أدخل وصف للموضوع أو اتركه للذكاء الاصطناعي..."
                value={composeData.subject}
                onChange={(e) =>
                  setComposeData({ ...composeData, subject: e.target.value })
                }
                className="min-w-0 flex-1 bg-transparent text-sm font-bold text-[#123f59] outline-none placeholder:text-slate-400"
              />

              <button
                onClick={handleGenerateSubject}
                disabled={isGeneratingSubject}
                className="
                  flex h-8 shrink-0 items-center gap-1.5 rounded-xl
                  border border-[#d8b46a]/25 bg-white px-3
                  text-[11px] font-black text-[#123f59]
                  transition hover:bg-[#f8efe0] disabled:opacity-50
                "
                title="توليد موضوع بالذكاء الاصطناعي"
                type="button"
              >
                {isGeneratingSubject ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Sparkles className="h-3.5 w-3.5 text-[#c5983c]" />
                )}
                <span>عنوان AI</span>
              </button>
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="shrink-0 border-b border-[#e8ddc8] bg-[#fbf8f1]/90 px-4 py-2 sm:px-5">
          <div className="flex items-center justify-between gap-2">
            <div className="relative shrink-0">
              <button
                onClick={() => setShowAIComposerMenu(!showAIComposerMenu)}
                className="flex h-9 items-center gap-1.5 rounded-xl border border-[#d8b46a]/30 bg-gradient-to-l from-[#123f59] to-[#1a5874] px-3 text-xs font-black text-white shadow-sm"
                type="button"
              >
                <Wand2 className="h-3.5 w-3.5 text-[#e2bf74]" />
                الذكاء الاصطناعي
              </button>

              {showAIComposerMenu && (
                <div className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-[#e8ddc8] bg-white shadow-2xl">
                  <div className="border-b border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2 text-[10px] font-bold text-[#6b7a80]">
                    اختر الإجراء المطلوب:
                  </div>

                  <button
                    onClick={() => handleAIAssist("rewrite")}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-xs font-bold text-[#123f59] hover:bg-[#f8efe0]/60"
                    type="button"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-[#c5983c]" />
                    صياغة احترافية
                  </button>

                  <button
                    onClick={() => handleAIAssist("formal")}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-right text-xs font-bold text-[#123f59] hover:bg-[#f8efe0]/60"
                    type="button"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-[#c5983c]" />
                    تحويل لصيغة رسمية
                  </button>
                </div>
              )}
            </div>

            <div className="flex min-w-0 items-center gap-1 overflow-x-auto custom-scrollbar-slim">
              {[
                { icon: Bold, command: "bold", label: "عريض" },
                { icon: Italic, command: "italic", label: "مائل" },
                { icon: Underline, command: "underline", label: "تحته" },
                { icon: AlignRight, command: "justifyRight", label: "يمين" },
                { icon: AlignCenter, command: "justifyCenter", label: "وسط" },
                { icon: AlignLeft, command: "justifyLeft", label: "يسار" },
              ].map((item, index) => {
                const Icon = item.icon;

                return (
                  <button
                    key={index}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      execFormat(item.command);
                    }}
                    className="
                      flex min-w-[48px] shrink-0 flex-col items-center justify-center
                      gap-0.5 rounded-xl border border-[#e8ddc8]
                      bg-white px-1.5 py-1
                      text-[#123f59] transition
                      hover:bg-[#f8efe0] hover:text-[#c5983c]
                    "
                    title={item.label}
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[8px] font-black leading-none">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="relative min-h-0 flex-1 overflow-hidden bg-[#f6f1e8]">
          {isAILoading && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <Sparkles className="mb-3 h-10 w-10 animate-pulse text-[#c5983c]" />
              <p className="text-sm font-black text-[#123f59]">
                جاري صياغة النص ببراعة...
              </p>
            </div>
          )}

          <div className="grid h-full grid-cols-1 gap-3 overflow-hidden p-3 xl:grid-cols-[minmax(0,1fr)_360px]">
            {/* EDITOR */}
            <section className="flex min-h-0 flex-col overflow-hidden rounded-[24px] border border-[#e8ddc8] bg-white shadow-[0_14px_38px_rgba(18,63,89,0.08)]">
              <div className="flex shrink-0 items-center justify-between border-b border-[#e8ddc8] bg-[#fbf8f1] px-4 py-3">
                <span className="text-xs font-black text-[#123f59]">
                  جسم الرسالة
                </span>

                <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#6b7a80]">
                  Message Body
                </span>
              </div>

              <div
                ref={editorRef}
                contentEditable
                data-placeholder="اكتب رسالتك هنا..."
                onInput={(e) =>
                  setComposeData({
                    ...composeData,
                    body: e.currentTarget.innerHTML,
                  })
                }
                className="composer-editable min-h-0 flex-1 overflow-y-auto p-5 text-[15px] font-medium leading-relaxed text-[#25313b] outline-none custom-scrollbar-slim"
              />
            </section>

            {/* SIDE PANEL */}
            <aside className="grid min-h-0 grid-cols-1 gap-3 overflow-hidden sm:grid-cols-2 xl:flex xl:flex-col">
              {/* ATTACHMENTS */}
              <section className="min-h-0 overflow-hidden rounded-[24px] border border-[#e8ddc8] bg-white shadow-[0_12px_30px_rgba(18,63,89,0.07)] xl:shrink-0">
                <div className="flex items-center justify-between border-b border-[#e8ddc8] bg-[#fbf8f1] px-4 py-3">
                  <span className="flex items-center gap-2 text-xs font-black text-[#123f59]">
                    <Paperclip className="h-4 w-4 text-[#c5983c]" />
                    المرفقات
                  </span>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-8 items-center gap-1 rounded-xl bg-[#123f59] px-3 text-[11px] font-black text-white transition hover:bg-[#0f3448]"
                    type="button"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-[#e2bf74]" />
                    إرفاق
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="max-h-[170px] overflow-y-auto p-3 custom-scrollbar-slim">
                  {attachments.length > 0 ? (
                    <div className="space-y-2">
                      {attachments.map((att, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-2 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1] px-3 py-2"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <FileText className="h-3.5 w-3.5 shrink-0 text-[#123f59]" />
                            <span className="truncate text-xs font-bold text-[#334155]">
                              {att.filename || att.name}
                            </span>
                          </div>

                          <button
                            onClick={() =>
                              setComposeData({
                                ...composeData,
                                attachments: attachments.filter(
                                  (_, i) => i !== idx,
                                ),
                              })
                            }
                            className="
                              flex min-w-[42px] shrink-0 flex-col items-center justify-center
                              gap-0.5 rounded-lg px-1 py-1
                              text-red-400 transition hover:bg-red-50 hover:text-red-600
                            "
                            title="حذف المرفق"
                            type="button"
                          >
                            <X className="h-3.5 w-3.5" />
                            <span className="text-[8px] font-black leading-none">
                              حذف
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="py-6 text-center text-xs font-semibold text-slate-400">
                      لا توجد مرفقات حتى الآن
                    </p>
                  )}
                </div>
              </section>

              {/* SIGNATURE */}
              <section className="min-h-0 overflow-hidden rounded-[24px] border border-[#e8ddc8] bg-white shadow-[0_12px_30px_rgba(18,63,89,0.07)] xl:flex-1">
                <div className="flex items-center justify-between border-b border-[#e8ddc8] bg-[#fbf8f1] px-4 py-3">
                  <span className="text-xs font-black text-[#123f59]">
                    التوقيع
                  </span>

                  <button
                    onClick={handleChangeLogo}
                    className="flex h-8 items-center gap-1 rounded-xl border border-[#d8b46a]/25 bg-white px-3 text-[11px] font-bold text-[#123f59] transition hover:bg-[#f8efe0]"
                    type="button"
                  >
                    <ImageIcon className="h-3.5 w-3.5 text-[#c5983c]" />
                    الشعار
                  </button>
                </div>

                <div
                  ref={signatureRef}
                  contentEditable
                  data-placeholder="أضف التوقيع هنا..."
                  onInput={(e) =>
                    setComposeData({
                      ...composeData,
                      signature: e.currentTarget.innerHTML,
                    })
                  }
                  className="composer-editable min-h-[160px] overflow-y-auto p-4 text-sm leading-relaxed text-[#25313b] outline-none custom-scrollbar-slim xl:h-full xl:min-h-0"
                />
              </section>

              {/* FOOTER */}
              <section className="min-h-0 overflow-hidden rounded-[24px] border border-[#e8ddc8] bg-white shadow-[0_12px_30px_rgba(18,63,89,0.07)] sm:col-span-2 xl:shrink-0">
                <div className="flex flex-col gap-2 border-b border-[#e8ddc8] bg-[#fbf8f1] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-xs font-black text-[#123f59]">
                    نص إخلاء المسؤولية
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="color"
                      value={composeData.footerColor}
                      onChange={(e) =>
                        setComposeData({
                          ...composeData,
                          footerColor: e.target.value,
                        })
                      }
                      className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                      title="لون الخط"
                    />

                    <select
                      value={composeData.footerSize}
                      onChange={(e) =>
                        setComposeData({
                          ...composeData,
                          footerSize: e.target.value,
                        })
                      }
                      className="h-8 rounded-xl border border-[#e8ddc8] bg-white px-2 text-[11px] font-bold text-[#123f59] outline-none"
                    >
                      <option value="9px">9px</option>
                      <option value="10px">10px</option>
                      <option value="11px">11px</option>
                      <option value="12px">12px</option>
                      <option value="14px">14px</option>
                    </select>

                    <button
                      onClick={handleTranslateFooter}
                      disabled={isTranslatingFooter}
                      className="flex h-8 items-center gap-1 rounded-xl border border-[#d8b46a]/25 bg-white px-3 text-[11px] font-bold text-[#123f59] transition hover:bg-[#f8efe0] disabled:opacity-50"
                      type="button"
                    >
                      {isTranslatingFooter ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Languages className="h-3.5 w-3.5 text-[#c5983c]" />
                      )}
                      ترجمة
                    </button>
                  </div>
                </div>

                <textarea
                  value={composeData.footerText}
                  onChange={(e) =>
                    setComposeData({
                      ...composeData,
                      footerText: e.target.value,
                    })
                  }
                  className="h-[120px] w-full resize-none bg-white p-3 text-sm font-medium leading-relaxed outline-none custom-scrollbar-slim"
                  style={{
                    color: composeData.footerColor,
                    fontSize: composeData.footerSize,
                  }}
                />
              </section>
            </aside>
          </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="shrink-0 border-t border-[#e8ddc8] bg-white/90 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => setIsComposerOpen(false)}
              className="h-10 rounded-2xl border border-[#e8ddc8] bg-white px-5 text-sm font-black text-[#6b7a80] transition hover:bg-[#f8efe0]"
              type="button"
            >
              إلغاء
            </button>

            <button
              onClick={handleSendEmail}
              className="flex h-10 items-center gap-2 rounded-2xl bg-gradient-to-l from-[#123f59] to-[#1a5874] px-7 text-sm font-black text-white shadow-[0_12px_26px_rgba(18,63,89,0.22)] transition hover:-translate-y-[1px]"
              type="button"
            >
              إرسال الرسالة
              <Send className="h-4 w-4 text-[#e2bf74]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}