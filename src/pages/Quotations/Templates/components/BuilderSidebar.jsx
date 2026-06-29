import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../api/axios"; // تأكد من صحة مسار الاستيراد
import {
  Layout,
  Save,
  Table as TableIcon,
  ListChecks,
  Image as ImageIcon,
  Type,
  AlignRight,
  Loader2,
  ArrowRight,
  FileText,
  Hash,
  Percent,
  Signature,
  CheckSquare,
  Palette,
  ListPlus,
  BookOpen,
  Plus,
  Trash2,
  Search,
  X,
  Square,
  Package,
} from "lucide-react";
import { DYNAMIC_VARIABLES } from "../constants";

const IconWithText = ({
  icon: Icon,
  text,
  className = "",
  iconClassName = "",
  textClassName = "",
  vertical = false,
}) => {
  return (
    <span
      className={`inline-flex min-w-0 items-center justify-center ${vertical ? "flex-col gap-0.5" : "gap-1.5"} ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span
          className={
            textClassName ||
            "min-w-0 break-words text-[10px] font-black leading-tight"
          }
        >
          {text}
        </span>
      )}
    </span>
  );
};

export default function BuilderSidebar({
  template,
  setTemplate,
  handleSaveTemplate,
  isSaving,
  templateId,
  onBack,
}) {
  const [activeTab, setActiveTab] = useState("intro");

  // حالات نافذة استيراد البنود من المكتبة
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [librarySearchTerm, setLibrarySearchTerm] = useState("");
  const [selectedLibraryItems, setSelectedLibraryItems] = useState([]);

  // جلب البنود من المكتبة المركزية
  const { data: dbItems = [], isLoading: itemsLoading } = useQuery({
    queryKey: ["quotation-items-library"],
    queryFn: async () => {
      const res = await api.get("/quotation-library/items");
      // تحويل البيانات لتناسب العرض
      return res.data.data.map((i) => ({
        id: i.code,
        name: i.title,
        description: i.description || "",
        unit: i.unit || "متر",
        price: i.price || 0,
      }));
    },
    enabled: isLibraryModalOpen, // لا يتم الجلب إلا عند فتح النافذة لتخفيف الحمل
  });

  const insertVariable = (field, variable) => {
    setTemplate((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        [field]: `${prev.intro[field] || ""} ${variable}`.trim(),
      },
    }));
  };

  const handleAddCustomItem = () => {
    setTemplate((prev) => ({
      ...prev,
      items: [
        ...(prev.items || []),
        {
          name: "بند جديد",
          description: "وصف البند...",
          quantity: 1,
          unit: "متر",
          unitPrice: 0,
        },
      ],
    }));
  };

  const handleRemoveItem = (indexToRemove) => {
    setTemplate((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  // دوال التعامل مع نافذة المكتبة
  const toggleLibraryItem = (item) => {
    const isSelected = selectedLibraryItems.some((i) => i.id === item.id);
    if (isSelected) {
      setSelectedLibraryItems(
        selectedLibraryItems.filter((i) => i.id !== item.id),
      );
    } else {
      setSelectedLibraryItems([...selectedLibraryItems, item]);
    }
  };

  const confirmImportItems = () => {
    const itemsToAdd = selectedLibraryItems.map((item) => ({
      name: item.name,
      description: item.description,
      quantity: 1,
      unit: item.unit,
      unitPrice: item.price,
    }));

    setTemplate((prev) => ({
      ...prev,
      items: [...(prev.items || []), ...itemsToAdd],
    }));

    setIsLibraryModalOpen(false);
    setSelectedLibraryItems([]);
    setLibrarySearchTerm("");
  };

  const handleImportTermsFromLibrary = () => {
    const dummyLibraryTerm =
      "\n- يلتزم الطرف الثاني بتسديد الدفعات حسب الجدول المتفق عليه.\n- مدة العرض صالحة لمدة 30 يوماً من تاريخ الإصدار.";
    setTemplate((prev) => ({
      ...prev,
      terms: {
        ...prev.terms,
        text: (prev.terms.text + dummyLibraryTerm).trim(),
      },
    }));
    alert("تم إدراج شروط من المكتبة بنجاح للتجربة.");
  };

  const tabs = [
    { id: "intro", label: "المقدمة", icon: AlignRight },
    { id: "items", label: "البنود", icon: ListPlus },
    { id: "table", label: "الجدول", icon: TableIcon },
    { id: "terms", label: "الشروط", icon: ListChecks },
    { id: "header", label: "الترويسة", icon: ImageIcon },
    { id: "style", label: "ستايل A4", icon: Palette },
  ];

  const availableItemsFiltered = dbItems.filter(
    (i) =>
      i.name.includes(librarySearchTerm) || i.id.includes(librarySearchTerm),
  );

  return (
    <aside
      className="z-10 flex h-full min-h-0 w-[420px] shrink-0 flex-col overflow-hidden border-l border-white/60 bg-white/70 shadow-[-10px_0_40px_rgba(18,63,89,0.06)] backdrop-blur-3xl"
      dir="rtl"
    >
      {/* Header */}
      <div className="relative overflow-hidden border-b border-[#d8b46a]/25 bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490] px-4 py-4 text-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-32 w-32 rounded-full bg-[#e2bf74]/20 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-80px] h-36 w-36 rounded-full bg-cyan-400/20 blur-3xl" />
        </div>
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onBack}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20 hover:scale-105 shadow-sm"
              type="button"
              title="رجوع"
            >
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-black">
                {templateId
                  ? "تعديل النموذج الإداري"
                  : "بناء نموذج عرض سعر جديد"}
              </h2>
              <p className="mt-0.5 truncate text-[10px] font-bold text-white/70">
                تخصيص هيكل العرض، البنود الافتراضية، والشروط.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation (Glassy) */}
      <div className="shrink-0 border-b border-white/50 bg-white/40 px-2 pt-2 backdrop-blur-md">
        <div className="flex overflow-x-auto custom-scrollbar-slim pb-1 gap-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 min-w-[70px] h-12 flex-col items-center justify-center gap-1 rounded-t-xl border-b-2 text-[10px] font-black transition-all ${active ? "border-[#123f59] bg-white/80 text-[#123f59] shadow-sm" : "border-transparent text-slate-500 hover:bg-white/50 hover:text-[#123f59]"}`}
                type="button"
              >
                <tab.icon
                  className={active ? "h-4 w-4 text-[#c5983c]" : "h-4 w-4"}
                />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-0 flex-1 overflow-y-auto bg-transparent p-3 custom-scrollbar-slim">
        {/* TAB: INTRO */}
        {activeTab === "intro" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorSection
              icon={FileText}
              title="بيانات النموذج الأساسية"
              subtitle="اسم النموذج وتحديد وضع الاختصار والتفصيل."
            >
              <div className="space-y-4">
                <Field label="اسم القالب (يظهر للموظفين فقط)">
                  <input
                    type="text"
                    value={template.title}
                    onChange={(e) =>
                      setTemplate({ ...template, title: e.target.value })
                    }
                    className={INPUT_CLASS}
                    placeholder="مثال: عرض تصميم فيلا سكنية..."
                  />
                </Field>

                <Field label="نوع التخطيط لعرض السعر">
                  <div className="flex rounded-xl bg-white/50 p-1 border border-white/80 shadow-inner">
                    <button
                      type="button"
                      onClick={() =>
                        setTemplate({ ...template, type: "DETAILED" })
                      }
                      className={`flex-1 rounded-lg py-2.5 text-[11px] font-black transition-all ${template.type === "DETAILED" ? "bg-gradient-to-b from-[#123f59] to-[#0e7490] text-white shadow-md transform scale-[1.02]" : "text-slate-500 hover:bg-white/80 hover:shadow-sm"}`}
                    >
                      عرض تفصيلي (بالكميات)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setTemplate({ ...template, type: "SIMPLE" })
                      }
                      className={`flex-1 rounded-lg py-2.5 text-[11px] font-black transition-all ${template.type === "SIMPLE" ? "bg-gradient-to-b from-[#123f59] to-[#0e7490] text-white shadow-md transform scale-[1.02]" : "text-slate-500 hover:bg-white/80 hover:shadow-sm"}`}
                    >
                      عرض مختصر (إجمالي)
                    </button>
                  </div>
                </Field>

                <Field label="وصف داخلي للنموذج">
                  <input
                    type="text"
                    value={template.desc || ""}
                    onChange={(e) =>
                      setTemplate({ ...template, desc: e.target.value })
                    }
                    className={INPUT_CLASS}
                    placeholder="شرح مبسط لاستخدام هذا النموذج..."
                  />
                </Field>
              </div>
            </EditorSection>

            <EditorSection
              icon={Type}
              title="صياغة المقدمة الافتراضية"
              subtitle="أدرج المتغيرات الديناميكية لتتغير تلقائياً حسب العميل."
            >
              <div className="space-y-3">
                <div className="rounded-2xl border border-violet-200/60 bg-violet-50/50 backdrop-blur-sm p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black text-violet-800">
                    <Hash className="h-3.5 w-3.5" /> إدراج المتغيرات السريعة:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DYNAMIC_VARIABLES.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => insertVariable("text", v.value)}
                        className="rounded-lg border border-violet-200 bg-white/80 px-2.5 py-1.5 text-[10px] font-black text-violet-700 transition hover:bg-violet-600 hover:text-white shadow-2xs"
                        type="button"
                      >
                        + {v.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="مخاطبة العميل">
                    <input
                      type="text"
                      value={template.intro.addresseePrefix}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          intro: {
                            ...template.intro,
                            addresseePrefix: e.target.value,
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </Field>
                  <Field label="التحية">
                    <input
                      type="text"
                      value={template.intro.greeting}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          intro: {
                            ...template.intro,
                            greeting: e.target.value,
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    />
                  </Field>
                </div>
                <Field label="نص المقدمة الرئيسي">
                  <textarea
                    rows={6}
                    value={template.intro.text}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        intro: { ...template.intro, text: e.target.value },
                      })
                    }
                    className={`${INPUT_CLASS} h-auto min-h-[140px] resize-y py-3 leading-6`}
                  />
                </Field>
              </div>
            </EditorSection>
          </div>
        )}

        {/* TAB: ITEMS (البنود مع التفعيل الزجاجي للاستيراد) */}
        {activeTab === "items" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorSection
              icon={ListPlus}
              title="مكتبة البنود الافتراضية"
              subtitle="البنود التي ستُدرج تلقائياً عند استخدام هذا النموذج."
            >
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsLibraryModalOpen(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#123f59]/30 bg-[#123f59]/5 py-2.5 text-[11px] font-black text-[#123f59] transition hover:bg-[#123f59]/10 shadow-sm backdrop-blur-md"
                >
                  <BookOpen className="h-4 w-4" /> استيراد من المكتبة
                </button>
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-[#123f59] to-[#0e7490] py-2.5 text-[11px] font-black text-white shadow-md transition hover:scale-[1.02]"
                >
                  <Plus className="h-4 w-4" /> بند مخصص جديد
                </button>
              </div>

              <div className="space-y-2.5">
                {!template.items || template.items.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 p-6 text-center text-slate-400 backdrop-blur-sm">
                    <ListPlus className="mx-auto h-8 w-8 mb-2 text-slate-300" />
                    <p className="text-[11px] font-black">
                      القائمة فارغة. ابدأ باستيراد البنود.
                    </p>
                  </div>
                ) : (
                  template.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-2xl border border-white/80 bg-white/60 p-3 shadow-sm hover:border-[#d8b46a]/50 transition-colors group backdrop-blur-sm"
                    >
                      <button
                        onClick={() => handleRemoveItem(idx)}
                        className="absolute left-3 top-3 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition bg-white rounded-full p-1 shadow-sm"
                        title="حذف البند"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <div className="pr-2 space-y-2 w-full">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => {
                            const newItems = [...template.items];
                            newItems[idx].name = e.target.value;
                            setTemplate({ ...template, items: newItems });
                          }}
                          className="w-[90%] bg-transparent text-[11px] font-black text-[#123f59] outline-none placeholder:text-slate-400"
                          placeholder="اسم البند الرئيسي..."
                        />
                        <textarea
                          rows={1}
                          value={item.description}
                          onChange={(e) => {
                            const newItems = [...template.items];
                            newItems[idx].description = e.target.value;
                            setTemplate({ ...template, items: newItems });
                          }}
                          className="w-full resize-none bg-transparent text-[10px] font-bold text-slate-500 outline-none placeholder:text-slate-400"
                          placeholder="الوصف التفصيلي (اختياري)..."
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </EditorSection>
          </div>
        )}

        {/* TAB: TABLE */}
        {activeTab === "table" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorSection
              icon={TableIcon}
              title="تكوين أعمدة الجدول"
              subtitle="التحكم في الأعمدة المعروضة في وضع التفصيل."
            >
              <div className="space-y-2">
                <ToggleRow checked disabled label="مسلسل (م) - إجباري أساسي" />
                <ToggleRow
                  checked
                  disabled
                  label="اسم ووصف البند - إجباري أساسي"
                />
                <ToggleRow
                  checked={template.table.showUnit}
                  label="إظهار عمود الوحدة (متر، مقطوعية...)"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      table: { ...template.table, showUnit: checked },
                    })
                  }
                />
                <ToggleRow
                  checked={template.table.showQuantity}
                  label="إظهار عمود الكمية"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      table: { ...template.table, showQuantity: checked },
                    })
                  }
                />
                <ToggleRow
                  checked={template.table.showUnitPrice}
                  label="إظهار عمود سعر الوحدة التفصيلي"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      table: { ...template.table, showUnitPrice: checked },
                    })
                  }
                />
              </div>
            </EditorSection>

            <EditorSection
              icon={Percent}
              title="الإجماليات والضرائب"
              subtitle="تحديد شكل الخلاصة المالية أسفل الجدول."
            >
              <div className="space-y-3">
                <ToggleRow
                  checked={template.financials.showSubtotal}
                  label="إظهار الإجمالي قبل الضريبة المضافة"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      financials: {
                        ...template.financials,
                        showSubtotal: checked,
                      },
                    })
                  }
                />
                <ToggleRow
                  checked={template.financials.showTotal}
                  label="إظهار الإجمالي الصافي النهائي"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      financials: {
                        ...template.financials,
                        showTotal: checked,
                      },
                    })
                  }
                />
                <Field label="نسبة ضريبة القيمة المضافة الافتراضية (VAT %)">
                  <input
                    type="number"
                    value={template.financials.vatPercentage}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        financials: {
                          ...template.financials,
                          vatPercentage: e.target.value,
                        },
                      })
                    }
                    className={`${INPUT_CLASS} w-32 text-center text-lg`}
                  />
                </Field>
              </div>
            </EditorSection>
          </div>
        )}

        {/* TAB: TERMS */}
        {activeTab === "terms" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorSection
              icon={ListChecks}
              title="مكتبة الشروط والملاحظات"
              subtitle="الشروط التي ستطبع آلياً في ذيل العرض המالي."
            >
              <div className="space-y-3">
                <Field label="عنوان القسم المطبوع (مثال: الشروط والأحكام)">
                  <input
                    type="text"
                    value={template.terms.title}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        terms: { ...template.terms, title: e.target.value },
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-slate-500">
                      النص الافتراضي للشروط
                    </span>
                    <button
                      type="button"
                      onClick={handleImportTermsFromLibrary}
                      className="flex items-center gap-1 text-[9px] font-black text-[#0e7490] hover:text-[#123f59] bg-white/60 px-2 py-1.5 rounded-lg transition border border-white shadow-2xs backdrop-blur-sm"
                    >
                      <BookOpen className="h-3 w-3" /> استيراد من مكتبة الشروط
                    </button>
                  </div>
                  <textarea
                    rows={10}
                    value={template.terms.text}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        terms: { ...template.terms, text: e.target.value },
                      })
                    }
                    className={`${INPUT_CLASS} h-auto min-h-[220px] resize-y py-3 leading-7 text-justify`}
                    placeholder="أدخل الشروط والأحكام هنا..."
                  />
                </div>
              </div>
            </EditorSection>

            <EditorSection
              icon={Signature}
              title="توثيق التوقيعات"
              subtitle="تحديد خانات الاعتماد في نهاية العرض."
            >
              <div className="space-y-3">
                <SignatureRow
                  checked={template.signatures.showClient}
                  label="تفعيل توقيع العميل (الطرف الثاني)"
                  value={template.signatures.clientLabel}
                  onToggle={(checked) =>
                    setTemplate({
                      ...template,
                      signatures: {
                        ...template.signatures,
                        showClient: checked,
                      },
                    })
                  }
                  onChange={(value) =>
                    setTemplate({
                      ...template,
                      signatures: {
                        ...template.signatures,
                        clientLabel: value,
                      },
                    })
                  }
                />
                <SignatureRow
                  checked={template.signatures.showOffice}
                  label="تفعيل توقيع المكتب (الطرف الأول)"
                  value={template.signatures.officeLabel}
                  onToggle={(checked) =>
                    setTemplate({
                      ...template,
                      signatures: {
                        ...template.signatures,
                        showOffice: checked,
                      },
                    })
                  }
                  onChange={(value) =>
                    setTemplate({
                      ...template,
                      signatures: {
                        ...template.signatures,
                        officeLabel: value,
                      },
                    })
                  }
                />
              </div>
            </EditorSection>
          </div>
        )}

        {/* TAB: HEADER */}
        {activeTab === "header" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorSection
              icon={ImageIcon}
              title="الترويسة والهوية البصرية"
              subtitle="تفعيل الشعار والتاريخ وعنوان الوثيقة الرسمي."
            >
              <div className="space-y-3">
                <ToggleRow
                  checked={template.header.showLogo}
                  label="إظهار شعار المكتب המعتمد في الترويسة"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      header: { ...template.header, showLogo: checked },
                    })
                  }
                />
                <ToggleRow
                  checked={template.header.showDate}
                  label="إظهار تاريخ إصدار العرض"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      header: { ...template.header, showDate: checked },
                    })
                  }
                />
                <Field label="عنوان الوثيقة الرئيسي (يظهر بمنتصف الترويسة)">
                  <input
                    type="text"
                    value={template.header.documentTitle}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        header: {
                          ...template.header,
                          documentTitle: e.target.value,
                        },
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </EditorSection>
          </div>
        )}

        {/* TAB: STYLE */}
        {activeTab === "style" && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <EditorSection
              icon={Palette}
              title="ستايل وهندسة الطباعة (A4)"
              subtitle="الألوان المؤسسية، حجم الخط، وكثافة الورقة."
            >
              <div className="space-y-4">
                <Field label="القوالب اللونية الجاهزة">
                  <select
                    value={template.pageStyle?.preset || "classic"}
                    onChange={(e) => {
                      const presets = {
                        classic: {
                          preset: "classic",
                          accentColor: "#123f59",
                          goldColor: "#c5983c",
                          paperTone: "white",
                        },
                        teal: {
                          preset: "teal",
                          accentColor: "#0e7490",
                          goldColor: "#d8b46a",
                          paperTone: "white",
                        },
                        emerald: {
                          preset: "emerald",
                          accentColor: "#0f766e",
                          goldColor: "#c5983c",
                          paperTone: "white",
                        },
                        graphite: {
                          preset: "graphite",
                          accentColor: "#1f2937",
                          goldColor: "#b0893c",
                          paperTone: "soft",
                        },
                      };
                      setTemplate({
                        ...template,
                        pageStyle: {
                          ...(template.pageStyle || {}),
                          ...presets[e.target.value],
                        },
                      });
                    }}
                    className={INPUT_CLASS}
                  >
                    <option value="classic">كلاسيكي (أزرق داكن / ذهبي)</option>
                    <option value="teal">تركواز رسمي (ألوان هندسية)</option>
                    <option value="emerald">أخضر زمردي (احترافي)</option>
                    <option value="graphite">رسمي داكن (رمادي / برونزي)</option>
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-200/50 pt-3">
                  <Field label="لون العناوين الأساسي">
                    <input
                      type="color"
                      value={template.pageStyle?.accentColor || "#123f59"}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          pageStyle: {
                            ...(template.pageStyle || {}),
                            accentColor: e.target.value,
                          },
                        })
                      }
                      className="h-10 w-full cursor-pointer rounded-xl border border-white bg-white/50 p-1 shadow-sm"
                    />
                  </Field>
                  <Field label="لون التمييز (الذهبي)">
                    <input
                      type="color"
                      value={template.pageStyle?.goldColor || "#c5983c"}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          pageStyle: {
                            ...(template.pageStyle || {}),
                            goldColor: e.target.value,
                          },
                        })
                      }
                      className="h-10 w-full cursor-pointer rounded-xl border border-white bg-white/50 p-1 shadow-sm"
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-200/50 pt-3">
                  <Field label="حجم الخط المطبوع">
                    <select
                      value={String(template.pageStyle?.fontScale || 1)}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          pageStyle: {
                            ...(template.pageStyle || {}),
                            fontScale: Number(e.target.value),
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="0.92">صغير ومكثف</option>
                      <option value="1">قياسي (عادي)</option>
                      <option value="1.08">كبير وواضح</option>
                    </select>
                  </Field>
                  <Field label="كثافة ومساحة الورقة">
                    <select
                      value={template.pageStyle?.density || "normal"}
                      onChange={(e) =>
                        setTemplate({
                          ...template,
                          pageStyle: {
                            ...(template.pageStyle || {}),
                            density: e.target.value,
                            pagePaddingMm:
                              e.target.value === "compact"
                                ? 11
                                : e.target.value === "wide"
                                  ? 18
                                  : 15,
                          },
                        })
                      }
                      className={INPUT_CLASS}
                    >
                      <option value="compact">مضغوط (محتوى أكثر)</option>
                      <option value="normal">متوازن القياس</option>
                      <option value="wide">مريح وواسع (مساحات بيضاء)</option>
                    </select>
                  </Field>
                </div>
                <ToggleRow
                  checked={Boolean(template.pageStyle?.showOuterBorder)}
                  label="إظهار إطار زخرفي خارجي للصفحة"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      pageStyle: {
                        ...(template.pageStyle || {}),
                        showOuterBorder: checked,
                      },
                    })
                  }
                />
              </div>
            </EditorSection>
          </div>
        )}
      </div>

      {/* Footer / Save Action */}
      <div className="shrink-0 border-t border-white/60 bg-white/60 backdrop-blur-xl p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-20">
        <button
          onClick={handleSaveTemplate}
          disabled={isSaving}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490] text-[13px] font-black text-white shadow-[0_10px_22px_rgba(18,63,89,0.16)] transition-all hover:shadow-lg hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          type="button"
        >
          {isSaving ? (
            <Loader2 className="h-5 w-5 animate-spin text-[#e2bf74]" />
          ) : (
            <Save className="h-5 w-5 text-[#e2bf74]" />
          )}
          {templateId
            ? "تحديث التعديلات على النموذج"
            : "اعتماد النموذج الإداري الجديد"}
        </button>
      </div>

      {/* ============================================================== */}
      {/* نافذة استيراد البنود (Liquid Glass Modal) */}
      {/* ============================================================== */}
      {isLibraryModalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300"
          dir="rtl"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white/60 rounded-[30px] p-5 w-full max-w-[650px] max-h-[90vh] flex flex-col shadow-[0_20px_60px_-15px_rgba(18,63,89,0.3)]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <div className="text-[15px] font-black text-[#123f59] flex items-center gap-2">
                <span className="p-2 bg-gradient-to-br from-[#123f59] to-[#0e7490] rounded-xl text-[#d8b46a] shadow-sm">
                  <Package className="w-4.5 h-4.5" />
                </span>
                استيراد بنود مسعرة من المكتبة المركزية
              </div>
              <button
                onClick={() => setIsLibraryModalOpen(false)}
                className="p-2 bg-white/50 hover:bg-white rounded-xl text-slate-500 transition-colors shadow-2xs border border-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* شريط البحث */}
            <div className="relative shrink-0 mb-4">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث عن البند بالاسم أو الكود..."
                value={librarySearchTerm}
                onChange={(e) => setLibrarySearchTerm(e.target.value)}
                className="w-full pl-4 pr-11 py-3.5 bg-white/70 border border-white/80 rounded-2xl text-[12px] font-bold outline-none focus:border-[#d8b46a] focus:bg-white shadow-sm transition-all"
              />
            </div>

            {/* قائمة البنود */}
            <div className="flex-1 overflow-y-auto custom-scrollbar-slim bg-slate-50/50 rounded-2xl border border-slate-200/50 p-2 space-y-1.5">
              {itemsLoading ? (
                <div className="flex flex-col items-center justify-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-[#0e7490] mb-2" />
                  <p className="text-[10px] font-bold text-slate-500">
                    جاري جلب البنود المعتمدة...
                  </p>
                </div>
              ) : availableItemsFiltered.length === 0 ? (
                <div className="text-center p-8 text-[11px] font-bold text-slate-400">
                  لا توجد بنود تطابق بحثك.
                </div>
              ) : (
                availableItemsFiltered.map((item) => {
                  const isSelected = selectedLibraryItems.some(
                    (i) => i.id === item.id,
                  );
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleLibraryItem(item)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border shadow-2xs ${isSelected ? "bg-emerald-50/80 border-emerald-200 text-emerald-800" : "bg-white/80 border-white hover:border-[#d8b46a]/40 hover:bg-white"}`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-black truncate text-[#123f59]">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">
                          {item.description || "لا يوجد وصف إضافي"}
                        </p>
                      </div>
                      <div className="text-left shrink-0">
                        <p className="text-[12px] font-black font-mono text-[#0e7490]">
                          {item.price.toLocaleString()}{" "}
                          <span className="text-[9px] text-slate-400">ر.س</span>
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 border border-slate-200 bg-slate-50 rounded px-1.5 py-0.5 inline-block">
                          {item.unit}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* شريط الإجراءات السفلي */}
            <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-200/50 shrink-0">
              <div className="text-[11px] font-black text-slate-500 bg-white/60 px-3 py-1.5 rounded-lg border border-white">
                تم تحديد:{" "}
                <span className="text-[#0e7490] font-mono text-[13px]">
                  {selectedLibraryItems.length}
                </span>{" "}
                بنود
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setIsLibraryModalOpen(false);
                    setLibrarySearchTerm("");
                  }}
                  className="px-5 py-2.5 bg-white/50 text-slate-600 border border-slate-200 rounded-xl text-xs font-black hover:bg-white shadow-sm transition-all"
                >
                  إلغاء الأمر
                </button>
                <button
                  onClick={confirmImportItems}
                  disabled={selectedLibraryItems.length === 0}
                  className="px-6 py-2.5 bg-gradient-to-r from-[#123f59] to-[#0e7490] text-white rounded-xl text-xs font-black shadow-[0_8px_16px_rgba(18,63,89,0.2)] hover:shadow-[0_8px_20px_rgba(18,63,89,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4 text-[#d8b46a]" /> إدراج في النموذج
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

// -------------------------------------------------------------
// المكونات المساعدة الداعمة (Glassmorphism Styled)
// -------------------------------------------------------------

const EditorSection = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/80 bg-white/50 backdrop-blur-xl shadow-[0_4px_15px_rgba(18,63,89,0.03)] transition-shadow hover:shadow-[0_8px_25px_rgba(18,63,89,0.06)]">
      <div className="flex items-center gap-3 border-b border-white/60 bg-white/40 px-4 py-3.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#123f59] to-[#0e7490] text-[#e2bf74] shadow-sm">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-xs font-black text-[#123f59]">
            {title}
          </h3>
          <p className="mt-0.5 truncate text-[9px] font-bold text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
};

const Field = ({ label, children }) => {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-black text-slate-600 pl-1">
        {label}
      </span>
      {children}
    </label>
  );
};

const ToggleRow = ({ checked, label, onChange, disabled = false }) => {
  return (
    <label
      className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 transition-all shadow-2xs ${disabled ? "bg-slate-50/50 border-slate-200/50 opacity-70" : "bg-white/60 border-white/80 hover:bg-white hover:border-[#d8b46a]/40"}`}
    >
      <span className="flex min-w-0 items-center gap-2.5 text-[11px] font-black text-[#123f59]">
        <CheckSquare
          className={`h-4.5 w-4.5 shrink-0 ${disabled ? "text-slate-400" : "text-[#c5983c]"}`}
        />
        <span className="break-words">{label}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4.5 w-4.5 shrink-0 rounded border-[#d8b46a]/50 text-[#123f59] focus:ring-[#c5983c]/20 disabled:opacity-50 cursor-pointer"
      />
    </label>
  );
};

const SignatureRow = ({ checked, label, value, onToggle, onChange }) => {
  return (
    <div
      className={`rounded-[20px] border p-3.5 transition-all shadow-2xs ${checked ? "bg-white/70 border-white" : "bg-slate-50/50 border-slate-200/50"}`}
    >
      <ToggleRow checked={checked} label={label} onChange={onToggle} />
      <div
        className={`mt-3 overflow-hidden transition-all duration-300 ${checked ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}
      >
        <input
          type="text"
          value={value}
          disabled={!checked}
          onChange={(e) => onChange(e.target.value)}
          placeholder="اسم / مسمى الموقع..."
          className={`${INPUT_CLASS} disabled:bg-slate-100/50 disabled:text-slate-400`}
        />
      </div>
    </div>
  );
};

const INPUT_CLASS = `
  h-11 w-full rounded-2xl
  border border-white/80 bg-white/60
  px-4 text-[11px] font-black text-[#123f59]
  shadow-sm outline-none transition-all
  placeholder:text-slate-400 placeholder:font-bold
  focus:border-[#d8b46a] focus:bg-white focus:ring-4 focus:ring-[#d8b46a]/15
`;
