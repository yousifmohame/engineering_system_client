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
  FileBox,
  Building2,
  Save,
  Printer,
  UserCheck,
  AlignCenter,
  FileText,
  Link2,
  UploadCloud,
  User,
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

  // تعبئة المحتوى المبدئي لمربع النص والتوقيع
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
    setComposeData((prev) => ({ ...prev, body: editorRef.current.innerHTML }));
  };

  const handlePrintDraft = () => {
    toast.info("جاري تجهيز المسودة للطباعة...");
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>مسودة - ${composeData.subject}</title>
          <style>
            body { font-family: Arial; padding: 40px; line-height: 1.6; }
            .header { border-bottom: 2px solid #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .content { font-size: 16px; margin-bottom: 40px; }
            .sig { padding-top: 10px; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <div><strong>إلى:</strong> ${composeData.to}</div>
            <div><strong>الموضوع:</strong> ${composeData.subject}</div>
          </div>
          <div class="content">${composeData.body}</div>
          <div class="sig">${composeData.signature}</div>
          <div style="margin-top:20px; color:${composeData.footerColor}; font-size:${composeData.footerSize}; text-align:center;">
            ${composeData.footerText}
          </div>
          <script>window.onload=()=>{window.print();window.close();}</script>
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
        let generatedSubject = res.data.data
          .replace(/\[.*?\]/g, "")
          .replace(/عنوان:|Subject:/gi, "")
          .trim();
        setComposeData({ ...composeData, subject: generatedSubject });
        toast.success("تم صياغة العنوان بنجاح ✨");
      }
    } catch (error) {
      toast.error("فشل في توليد الموضوع");
    } finally {
      setIsGeneratingSubject(false);
    }
  };

  // 🚀 دالة ترجمة الفوتر (إخلاء المسؤولية)
  // 🚀 دالة ترجمة الفوتر (إخلاء المسؤولية) باستخدام الدالة الجديدة
  const handleTranslateFooter = async () => {
    if (!composeData.footerText) return toast.error("الرجاء كتابة نص الفوتر أولاً");
    
    setIsTranslatingFooter(true);
    try {
      const res = await api.post("/email/translate", {
        text: composeData.footerText,
        targetLanguage: "English" // يمكنك تغييرها لأي لغة مستقبلاً
      });
      
      if (res.data?.success) {
        // إضافة الترجمة الإنجليزية تحت النص العربي مع فاصل
        setComposeData({ 
          ...composeData, 
          footerText: composeData.footerText + "\n\n" + res.data.data 
        });
        toast.success("تم إضافة الترجمة الإنجليزية بنجاح ✨");
      }
    } catch (error) {
      toast.error("فشل في ترجمة الفوتر. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsTranslatingFooter(false);
    }
  };

  // 🚀 دالة تغيير لوجو الشركة في التوقيع
  const handleChangeLogo = () => {
    const newUrl = prompt("أدخل الرابط المباشر للشعار الجديد (URL):");
    if (newUrl) {
      // استبدال الـ src الخاص بالصورة باستخدام Regex
      const updatedSig = composeData.signature.replace(
        /<img[^>]+src="([^">]+)"/i,
        `<img src="${newUrl}"`,
      );
      setComposeData({ ...composeData, signature: updatedSig });
      if (signatureRef.current) {
        signatureRef.current.innerHTML = updatedSig;
      }
      toast.success("تم تحديث الشعار بنجاح");
    }
  };

  // 🚀 دالة رفع المرفقات (تحويل الملف لـ Base64 لكي يُحفظ في الـ JSON والمسودات بسلاسة)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        setComposeData({
          ...composeData,
          attachments: [
            ...composeData.attachments,
            { 
              filename: file.name, // 👈 Nodemailer يحتاج كلمة filename ليتعرف على الاسم الحقيقي
              path: reader.result, // 👈 Nodemailer يقبل ملفات Base64 داخل خاصية path
              size: file.size,
              type: file.type
            }
          ],
        });
      };
      
      // بدء قراءة الملف وتحويله
      reader.readAsDataURL(file);
    }
    
    // تصفير المدخل ليقبل نفس الملف لو حذفته وأردت إضافته مجدداً
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col overflow-hidden animate-in zoom-in-95"
        style={{ height: "95vh" }}
      >
        {/* ================= HEADER (مطابق للصورة) ================= */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between shrink-0 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <MailPlus className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-sm">
              {composerMode === "new"
                ? "صياغة رسالة جديدة"
                : "الرد على الرسالة"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* الأزرار العلوية كما في التصميم المطلوب */}
            <button
              onClick={handleSaveDraft}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              الحفظ مسودة
            </button>
            <div className="w-px h-4 bg-slate-700"></div>
            <button
              onClick={handlePrintDraft}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              طباعتها كمسودة
            </button>
            <div className="w-px h-4 bg-slate-700"></div>
            <button
              onClick={handleSendForReview}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              ارسال لموظف لمراجعة الرساله
            </button>

            <div className="w-px h-5 bg-slate-600 mx-2"></div>

            <button
              onClick={() => setIsComposerOpen(false)}
              className="hover:bg-slate-700 p-1 rounded-lg transition-colors text-slate-300 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
          {/* ================= INPUT FIELDS ================= */}
          <div className="bg-white border-b border-gray-200 shrink-0">
            {/* حقل إلى (To) */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 relative">
              <span className="text-gray-500 text-sm font-bold w-12">إلى:</span>
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

              <div className="relative">
                <button
                  onClick={() => setShowSystemSelect(!showSystemSelect)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors border border-gray-200"
                >
                  <Users className="w-3.5 h-3.5" /> إدراج من النظام
                </button>
                {showSystemSelect && (
                  <div className="absolute top-full right-0 mt-1 w-64 bg-white border border-gray-200 shadow-xl rounded-xl py-1 z-50">
                    <div className="px-3 py-2 text-[10px] font-bold text-gray-400 bg-gray-50 border-b border-gray-100 mb-1 leading-relaxed">
                      اتاحة اختيار من جهات التواصل المحفوظة في السيستم - او ملف
                      عميل او ملف ملكية او ملف معامله او ملف عرض سعر او ملف عقد
                      او رقم فاتورة او بحث باسم العميل او برقم الرخصة او برقم
                      الخدمة
                    </div>
                    <button className="w-full text-right px-4 py-2 text-xs font-semibold hover:bg-blue-50 text-gray-700">
                      جهات الاتصال
                    </button>
                    <button className="w-full text-right px-4 py-2 text-xs font-semibold hover:bg-blue-50 text-gray-700">
                      ملفات العملاء / الأملاك
                    </button>
                    <button className="w-full text-right px-4 py-2 text-xs font-semibold hover:bg-blue-50 text-gray-700">
                      المعاملات / العقود / الفواتير
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* حقل نسخة (CC) وزر (BCC) */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
              <span className="text-gray-500 text-sm font-bold w-12">
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
              <button
                onClick={() => setShowBcc(!showBcc)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${showBcc ? "bg-red-50 text-red-600 border border-red-100" : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"}`}
              >
                <EyeOff className="w-3.5 h-3.5" /> نسخة مخفية (BCC)
              </button>
            </div>

            {showBcc && (
              <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-3 bg-red-50/30">
                <span className="text-red-500 text-sm font-bold w-12 flex items-center gap-1">
                  مخفية:
                </span>
                <input
                  type="email"
                  list="contactsList"
                  value={composeData.bcc}
                  onChange={(e) =>
                    setComposeData({ ...composeData, bcc: e.target.value })
                  }
                  className="flex-1 outline-none text-sm font-mono text-left bg-transparent focus:text-red-600"
                  dir="ltr"
                />
              </div>
            )}

            {/* حقل الموضوع */}
            <div className="px-5 py-3 flex items-center gap-3 bg-red-50/10">
              <span className="text-red-500 text-sm font-bold w-12">
                الموضوع:
              </span>
              <input
                type="text"
                placeholder="أدخل وصف للموضوع أو اتركه للذكاء الاصطناعي..."
                value={composeData.subject}
                onChange={(e) =>
                  setComposeData({ ...composeData, subject: e.target.value })
                }
                className="flex-1 outline-none text-sm font-bold text-gray-800 placeholder-gray-400 bg-transparent"
              />
              <button
                onClick={handleGenerateSubject}
                disabled={isGeneratingSubject}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors border border-red-100 disabled:opacity-50"
              >
                {isGeneratingSubject ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                صياغة الموضوع (AI)
              </button>
            </div>
          </div>

          {/* ================= TOOLBAR ================= */}
          <div className="bg-purple-50/50 border-b border-purple-100 px-4 py-2 flex items-center justify-between shrink-0 z-10">
            <div className="relative">
              <button
                onClick={() => setShowAIComposerMenu(!showAIComposerMenu)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg text-xs font-bold transition-all border border-purple-200"
              >
                <Wand2 className="w-3.5 h-3.5" /> الذكاء الاصطناعي 🪄
              </button>

              {showAIComposerMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 shadow-2xl rounded-xl py-1.5 z-50 overflow-hidden">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-gray-400 bg-gray-50 border-b border-gray-100 mb-1">
                    اختر الإجراء المطلوب:
                  </div>
                  <button
                    onClick={() => handleAIAssist("rewrite")}
                    className="w-full text-right px-4 py-2.5 text-xs font-semibold hover:bg-purple-50 text-gray-700 flex items-center gap-2.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-500" /> صياغة
                    احترافية
                  </button>
                  <button
                    onClick={() => handleAIAssist("formal")}
                    className="w-full text-right px-4 py-2.5 text-xs font-semibold hover:bg-blue-50 text-gray-700 flex items-center gap-2.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-500" /> تحويل
                    لصيغة رسمية
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1">
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("bold");
                }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("italic");
                }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("underline");
                }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
              >
                <Underline className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-gray-300 mx-1"></div>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("justifyRight");
                }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
              >
                <AlignRight className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("justifyCenter");
                }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  execFormat("justifyLeft");
                }}
                className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================= COMPOSER BODY AREA ================= */}
          <div className="flex-1 flex flex-col bg-white overflow-y-auto custom-scrollbar-slim relative">
            {isAILoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
                <Sparkles className="w-10 h-10 text-purple-500 animate-pulse mb-3" />
                <p className="text-sm font-black text-purple-800">
                  جاري صياغة النص ببراعة...
                </p>
              </div>
            )}

            {/* 1. جسم الرسالة */}
            <div className="p-2 border-b border-dashed border-red-200 bg-red-50/10 text-[10px] font-bold text-red-400 text-center uppercase tracking-wider">
              جسم الرسالة
            </div>
            <div
              ref={editorRef}
              contentEditable
              onInput={(e) =>
                setComposeData({
                  ...composeData,
                  body: e.currentTarget.innerHTML,
                })
              }
              className="w-full min-h-[200px] p-6 outline-none text-[15px] font-medium text-gray-800 leading-relaxed"
              placeholder="اكتب رسالتك هنا..."
            />

            {/* 2. منطقة المرفقات */}
            <div className="px-6 py-4 border-y border-dashed border-red-200 bg-gray-50 shrink-0">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-red-500 flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4" /> المرفقات سواء الروابط الخاصه
                  بها او المرفق كملف
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[11px] font-bold text-blue-600 bg-white border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors shadow-sm"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> إرفاق ملف
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>

              {composeData.attachments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {composeData.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm text-xs font-bold text-gray-700"
                    >
                      <FileText className="w-3.5 h-3.5 text-blue-500" />
                      {/* 💡 التعديل هنا: استخدام filename */}
                      {att.filename || att.name} 
                      <button
                        onClick={() =>
                          setComposeData({
                            ...composeData,
                            attachments: composeData.attachments.filter((_, i) => i !== idx),
                          })
                        }
                        className="ml-2 text-red-400 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ):(
                <p className="text-center text-gray-400 text-sm italic">
                  لا توجد مرفقات حتى الآن
                </p>
              )}
            </div>

            {/* 3. منطقة التوقيع (التصميم المعتمد + تغيير اللوجو) */}
            <div className="px-6 py-5 shrink-0 bg-white border-b border-dashed border-red-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider">
                  التوقيع
                </span>
                <button
                  onClick={handleChangeLogo}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1 border border-blue-100"
                >
                  <ImageIcon className="w-3 h-3" /> تغيير الشعار
                </button>
              </div>
              <div
                ref={signatureRef}
                contentEditable
                onInput={(e) =>
                  setComposeData({
                    ...composeData,
                    signature: e.currentTarget.innerHTML,
                  })
                }
                className="w-full p-4 outline-none border border-gray-200 rounded-xl bg-white focus:border-blue-400 transition-colors custom-scrollbar-slim"
                style={{ minHeight: "150px" }}
              />
            </div>

            {/* 4. منطقة الفوتر (إخلاء المسؤولية) */}
            <div className="px-6 py-5 shrink-0 bg-slate-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider leading-relaxed max-w-sm">
                  نص ثابت في جميع الرسائل لإخلاء المسؤولية يكون قابل لتعديل
                  والتحكم في حجم الخط الخاص به ولونه بشكل منفرد مع ذكاء صناعي
                  لترجمته للإنجليزية
                </span>

                {/* 💡 أدوات التحكم بالفوتر */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                  <input
                    type="color"
                    value={composeData.footerColor}
                    onChange={(e) =>
                      setComposeData({
                        ...composeData,
                        footerColor: e.target.value,
                      })
                    }
                    className="w-6 h-6 rounded cursor-pointer border-0 p-0"
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
                    className="text-[10px] font-bold bg-gray-50 border border-gray-200 rounded px-1 py-1 outline-none"
                  >
                    <option value="9px">9px</option>
                    <option value="10px">10px</option>
                    <option value="11px">11px</option>
                    <option value="12px">12px</option>
                    <option value="14px">14px</option>
                  </select>
                  <div className="w-px h-4 bg-gray-200 mx-1"></div>
                  <button
                    onClick={handleTranslateFooter}
                    disabled={isTranslatingFooter}
                    className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 flex items-center gap-1"
                  >
                    {isTranslatingFooter ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      <Languages className="w-3 h-3" />
                    )}{" "}
                    ترجمة (AI)
                  </button>
                </div>
              </div>

              <textarea
                value={composeData.footerText}
                onChange={(e) =>
                  setComposeData({ ...composeData, footerText: e.target.value })
                }
                className="w-full p-3 outline-none border border-gray-200 rounded-xl bg-white focus:border-blue-400 transition-colors resize-none"
                style={{
                  color: composeData.footerColor,
                  fontSize: composeData.footerSize,
                }}
                rows="4"
              />
            </div>
          </div>

          {/* ================= FOOTER ACTIONS ================= */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between shrink-0 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-20">
            <button
              onClick={() => setIsComposerOpen(false)}
              className="px-6 py-2.5 text-gray-500 hover:bg-gray-100 rounded-xl text-sm font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center gap-2 px-10 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:-translate-y-0.5"
            >
              إرسال الرسالة <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
