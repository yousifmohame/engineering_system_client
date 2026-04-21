import React, { useState, lazy, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Save,
  ChevronRight,
  Layout,
  Printer,
  Link as LinkIcon,
  Plus,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// استيراد الأقسام
import BasicInfoSection from "./Sections/BasicInfoSection";
import AttendeesSection from "./Sections/AttendeesSection";
import ContentSection from "./Sections/ContentSection";
import StepsSection from "./Sections/StepsSection";
import VerificationSection from "./Sections/VerificationSection";
import SignatureSettingsSection from "./Sections/SignatureSettingsSection";
import InternalNotesSection from "./Sections/InternalNotesSection";
import AttachmentsSection from "./Sections/AttachmentsSection";
import LinksSection from "./Sections/LinksSection";

// استيراد النوافذ والمكونات المشتركة
import ContactPickerModal from "./Modals/ContactPickerModal";
import TransactionPickerModal from "./Modals/TransactionPickerModal";
import AiSuggestionBox from "./Common/AiSuggestionBox";

const MeetingMinutePreview = lazy(() => import("../MeetingMinutePreview"));

const SECTIONS = [
  { id: "basic", label: "البيانات الأساسية" },
  { id: "attendees", label: "قائمة الحضور" },
  { id: "content", label: "جدول الأعمال والمحتوى" },
  { id: "steps", label: "خطوات سير الاجتماع" },
  { id: "verification", label: "إعدادات التحقق (QR)" },
  { id: "settings", label: "التوقيع والطباعة" },
  { id: "internal", label: "الملاحظات الداخلية" },
  { id: "attachments", label: "المرفقات" },
  { id: "links", label: "الربط المرجعي" },
];

export default function MeetingMinuteGenerator({
  minute: initialMinute,
  transaction,
  onClose,
  onSave,
  onGoToTransaction,
  isNew,
}) {
  const [minute, setMinute] = useState(() => {
    const min = { ...initialMinute };
    if (!min.axes || min.axes.length === 0) {
      min.axes = [
        {
          id: `ax-${Date.now()}`,
          title: "المحور العام",
          clientRequests: [],
          companyResponses: [],
          outcomes: [],
        },
      ];
    }
    if (!min.verification) {
      min.verification = {
        publicReference: `REF-${Math.floor(Math.random() * 10000)}`,
        verificationToken: "",
        verificationUrl: "",
        verificationStatus: "internal_only",
        qrSettings: {
          enabled: true,
          type: "verification",
          position: "bottom",
          isPrimary: true,
          dataCovered: "basic_info",
        },
      };
    }
    if (!min.advancedSignatureSettings) {
      min.advancedSignatureSettings = {
        signatureType: "none",
        stampType: "none",
        signingParties: "both",
        showAuthStatement: false,
        authStatementText: "",
      };
    }
    return min;
  });

  const [activeSection, setActiveSection] = useState("basic");
  const [zoom, setZoom] = useState(0.85);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 💡 حالة الوضع المبسط والمتقدم
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [pickerTarget, setPickerTarget] = useState(null);
  const [showTransactionPicker, setShowTransactionPicker] = useState(false);

  const updateField = (field, value) =>
    setMinute((prev) => ({ ...prev, [field]: value }));

  const handleManualSave = async (status = "مسودة", closeAfter = true) => {
    if (!minute.title || !minute.meetingDate) {
      return toast.error(
        "يرجى ملء البيانات الأساسية (العنوان والتاريخ) قبل الحفظ",
      );
    }
    const dataToSave = { ...minute, status };
    updateField("status", status);

    const saveToast = toast.loading("جاري حفظ المحضر...");
    try {
      await onSave(dataToSave, closeAfter);
      toast.success(
        status === "مؤرشف" ? "تم الاعتماد بنجاح" : "تم الحفظ بنجاح",
        { id: saveToast },
      );
    } catch (e) {
      toast.error("فشل الحفظ، حاول مرة أخرى", { id: saveToast });
    }
  };

  const handlePrint = () => {
    toast.info('لحفظ المحضر كـ PDF، اختر "Save as PDF" من نافذة الطباعة.');
    setTimeout(() => window.print(), 1000);
  };

  const getSectionCompletenessIndicator = (sectionId) => {
    let isComplete = false,
      isPartial = false;
    switch (sectionId) {
      case "basic":
        isComplete = !!(
          minute.title &&
          minute.meetingDate &&
          minute.location &&
          minute.clientName
        );
        isPartial = !!minute.title;
        break;
      case "attendees":
        isComplete = minute.attendees?.length > 0;
        isPartial = minute.attendees?.length > 0;
        break;
      case "content":
        isComplete = minute.axes?.some((a) => a.outcomes?.length > 0);
        isPartial = minute.axes?.length > 0;
        break;
      case "verification":
        isComplete = minute.verification?.qrSettings?.enabled;
        isPartial = !!minute.verification;
        break;
      case "internal":
        isComplete = !!minute.internalNotes;
        isPartial = !!minute.internalNotes;
        break;
      case "attachments":
        isComplete = minute.attachments?.length > 0;
        isPartial = minute.attachments?.length > 0;
        break;
      case "links":
        isComplete = !!minute.transactionId;
        isPartial = !!minute.transactionId;
        break;
      default:
        isComplete = true;
    }
    if (isComplete)
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (isPartial) return <div className="w-2 h-2 rounded-full bg-amber-400" />;
    return <AlertCircle className="w-3.5 h-3.5 text-slate-300" />;
  };

  // إخفاء الأقسام المتقدمة إذا كان الوضع "مبسط"
  const activeSections = SECTIONS.filter(
    (s) =>
      isAdvancedMode || !["internal", "attachments", "links"].includes(s.id),
  );

  const applyAiSuggestion = (action) => {
    if (!aiSuggestion) return;
    if (action === "replace") {
      updateField(aiSuggestion.field, aiSuggestion.text);
    } else if (action === "append") {
      const currentText = minute[aiSuggestion.field] || "";
      updateField(
        aiSuggestion.field,
        currentText
          ? currentText + "\n\n" + aiSuggestion.text
          : aiSuggestion.text,
      );
    }
    setAiSuggestion(null);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-slate-100 overflow-hidden"
      dir="rtl"
    >
      {/* 🟢 القائمة الجانبية (Sidebar) */}
      <aside
        className={`flex flex-col bg-white border-l border-slate-200 shadow-xl shadow-slate-200/50 z-30 shrink-0 transition-all duration-300 print:hidden overflow-hidden ${isSidebarOpen ? "w-[240px]" : "w-0"}`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <Layout size={16} />
            </div>
            <h2 className="text-sm font-black text-slate-900">الأقسام</h2>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-xl transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar bg-slate-50/50">
          {activeSections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs transition-all text-right font-bold ${activeSection === s.id ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-600 hover:bg-slate-100"}`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${activeSection === s.id ? "bg-indigo-600" : "bg-transparent"}`}
              />
              {s.label}
              <div className="mr-auto">
                {getSectionCompletenessIndicator(s.id)}
              </div>
            </button>
          ))}

          <div className="mt-8 pt-4 border-t border-slate-200 space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              التكامل والربط
            </p>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              {minute.transactionId ? (
                <button
                  onClick={() => setShowTransactionPicker(true)}
                  className="w-full flex flex-col gap-1 px-3 py-2 text-[11px] font-bold text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-xl transition-colors border border-blue-100"
                >
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5" /> تغيير المعاملة
                  </div>
                  <span className="text-[9px] font-black opacity-60 self-end">
                    {minute.transactionRef || minute.transactionId}
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => setShowTransactionPicker(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-amber-100"
                >
                  <Plus className="w-3.5 h-3.5" /> ربط بمعاملة
                </button>
              )}
            </div>

            <div className="mt-4 p-4 bg-slate-900 rounded-2xl text-white relative overflow-hidden group shadow-lg">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150"></div>
              <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-2 text-indigo-400">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    AI Copilot
                  </span>
                </div>
                <div className="text-[9px] text-slate-300 font-bold leading-relaxed">
                  يحلل مدخلاتك ويصيغها بلغة رسمية فوراً لرفع الجودة.
                </div>
              </div>
            </div>
          </div>
        </nav>
      </aside>

      {/* 🔵 منطقة المحرر (Editor Area) - عرض ثابت 450px */}
      <main className="flex flex-col shrink-0 min-w-0 bg-white shadow-2xl relative z-20 print:hidden w-full lg:w-[450px] border-l border-slate-200">
        <header className="h-16 border-b flex items-center justify-between px-3 shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="p-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-slate-600"
              >
                <Layout size={16} />
              </button>
            )}
            <div className="flex flex-col max-w-[120px] sm:max-w-[160px]">
              <h2 className="text-xs font-black text-slate-800 truncate">
                {minute.title || "محضر جديد"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[8px] font-black text-slate-500 bg-slate-100 px-1 rounded">
                  {minute.referenceNumber}
                </span>
                <span
                  className={`text-[8px] font-black px-1 rounded ${minute.status === "مؤرشف" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  {minute.status}
                </span>
              </div>
            </div>
          </div>

          {/* 💡 أزرار التحكم: مبسط / متقدم ، حفظ ، إغلاق */}
          <div className="flex items-center gap-2">
            {/* زر مبسط / متقدم */}
            <div className="flex items-center bg-slate-200/60 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  setIsAdvancedMode(false);
                  setActiveSection("basic");
                }}
                className={`px-2.5 py-1 text-[9px] font-black rounded-md transition-all ${!isAdvancedMode ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
              >
                مبسط
              </button>
              <button
                onClick={() => setIsAdvancedMode(true)}
                className={`px-2.5 py-1 text-[9px] font-black rounded-md transition-all ${isAdvancedMode ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
              >
                متقدم
              </button>
            </div>

            <button
              onClick={() => handleManualSave("مسودة", true)}
              className="px-3 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-sm hover:bg-indigo-700 transition-all active:scale-95 flex items-center gap-1"
            >
              <Save size={12} /> حفظ
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          <AiSuggestionBox
            suggestion={aiSuggestion}
            setSuggestion={setAiSuggestion}
            onApply={(text) => updateField(aiSuggestion.field, text)}
          />

          {/* عرض القسم النشط فقط */}
          {activeSection === "basic" && (
            <BasicInfoSection
              minute={minute}
              updateField={updateField}
              onOpenContacts={() => setPickerTarget("client")}
            />
          )}
          {activeSection === "attendees" && (
            <AttendeesSection
              minute={minute}
              updateField={updateField}
              onOpenContacts={() => setPickerTarget("attendee")}
            />
          )}
          {activeSection === "content" && (
            <ContentSection minute={minute} setMinute={setMinute} />
          )}
          {activeSection === "steps" && (
            <StepsSection minute={minute} setMinute={setMinute} />
          )}
          {activeSection === "verification" && (
            <VerificationSection minute={minute} updateField={updateField} />
          )}
          {activeSection === "settings" && (
            <SignatureSettingsSection
              minute={minute}
              updateField={updateField}
            />
          )}
          {activeSection === "internal" && (
            <InternalNotesSection minute={minute} updateField={updateField} />
          )}
          {activeSection === "attachments" && (
            <AttachmentsSection minute={minute} updateField={updateField} />
          )}
          {activeSection === "links" && (
            <LinksSection
              minute={minute}
              onGoToTransaction={onGoToTransaction}
            />
          )}
        </div>
      </main>

      {/* 🟠 منطقة المعاينة (Preview Panel) - 65% */}
      <section className="hidden lg:flex flex-1 flex-col items-center bg-slate-50 p-6 md:p-10 overflow-y-auto custom-scrollbar relative shrink-0">
        <div className="sticky top-0 z-20 mb-6 flex items-center justify-between w-full max-w-[450px] bg-white/90 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, z - 0.1))}
              className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm hover:text-indigo-600 font-bold transition-colors"
            >
              -
            </button>
            <span className="text-[10px] font-black w-14 text-center text-slate-600">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(1.2, z + 0.1))}
              className="w-7 h-7 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm hover:text-indigo-600 font-bold transition-colors"
            >
              +
            </button>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-[10px] font-black hover:bg-slate-900 transition-all shadow-md"
          >
            <Printer size={14} /> طباعة
          </button>
        </div>

        <div
          className="w-full flex justify-center pb-20 origin-top transition-transform duration-500"
          style={{ transform: `scale(${zoom})` }}
        >
          <Suspense
            fallback={
              <div className="h-[297mm] w-[210mm] bg-white border border-slate-200 animate-pulse rounded-lg shadow-xl flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={30} />
              </div>
            }
          >
            <MeetingMinutePreview
              minute={minute}
              transaction={transaction}
              zoom={1}
              isInternal={minute.printSettings?.copyType === "internal"}
            />
          </Suspense>
        </div>
      </section>

      {/* النوافذ (Modals) */}
      {pickerTarget !== null && (
        <ContactPickerModal
          onClose={() => setPickerTarget(null)}
          onSelect={(contact) => {
            const contactName = contact.name || contact.displayName;
            if (pickerTarget === "client") {
              updateField("clientName", contactName);
              updateField("clientId", contact.id);
              toast.success("تم تحديد العميل بنجاح");
            } else if (pickerTarget === "attendee") {
              const exists = minute.attendees?.find(
                (a) => a.contactId === contact.id,
              );
              if (exists)
                return toast.error("هذا الشخص مضاف بالفعل لقائمة الحضور");

              updateField("attendees", [
                ...(minute.attendees || []),
                {
                  id: Date.now().toString(),
                  name: contactName,
                  entity: contact.companyName ? "العميل" : "فرد",
                  role: "ممثل",
                  attendanceMethod: "حضوري",
                  contactId: contact.id,
                },
              ]);
              toast.success("تمت إضافة الشخص إلى قائمة الحضور");
            }
            setPickerTarget(null);
          }}
        />
      )}

      {showTransactionPicker && (
        <TransactionPickerModal
          onClose={() => setShowTransactionPicker(false)}
          onSelect={(tx) => {
            updateField("transactionId", tx.id); // 💡 حفظ الـ ID الحقيقي لقاعدة البيانات
            updateField("transactionRef", tx.ref || tx.id); // 💡 حفظ الكود للعرض
            updateField(
              "clientName",
              tx.client?.name || tx.client?.displayName || "عميل غير محدد",
            );
            setShowTransactionPicker(false);
            toast.success(`تم ربط المعاملة بنجاح`);
          }}
        />
      )}
    </div>
  );
}
