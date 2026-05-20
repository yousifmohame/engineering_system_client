import React, { useState } from "react";
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
  Settings2,
  Percent,
  Signature,
  CheckSquare,
  Palette,
  SlidersHorizontal,
  Maximize2,
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
      className={`inline-flex min-w-0 items-center justify-center ${
        vertical ? "flex-col gap-0.5" : "gap-1.5"
      } ${className}`}
    >
      {Icon && <Icon className={iconClassName || "h-4 w-4 shrink-0"} />}
      {text && (
        <span className={textClassName || "min-w-0 break-words text-[10px] font-black leading-tight"}>
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

  const insertVariable = (field, variable) => {
    setTemplate((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        [field]: `${prev.intro[field] || ""} ${variable}`.trim(),
      },
    }));
  };

  const tabs = [
    { id: "intro", label: "المقدمة", icon: AlignRight },
    { id: "table", label: "الجدول", icon: TableIcon },
    { id: "terms", label: "الشروط", icon: ListChecks },
    { id: "header", label: "الترويسة", icon: ImageIcon },
    { id: "style", label: "ستايل A4", icon: Palette },
  ];

  return (
    <aside
      className="
        z-10 flex h-full min-h-0 w-[400px] shrink-0 flex-col overflow-hidden
        border-l border-[#d8b46a]/25 bg-white/90
        shadow-[0_10px_24px_rgba(18,63,89,0.10)] backdrop-blur-xl
      "
      dir="rtl"
    >
      <div
        className="
          relative overflow-hidden border-b border-[#d8b46a]/25
          bg-gradient-to-l from-[#06111d] via-[#123f59] to-[#0e7490]
          px-3 py-3 text-white
        "
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute right-[-70px] top-[-70px] h-32 w-32 rounded-full bg-[#e2bf74]/18 blur-3xl" />
          <div className="absolute left-[-70px] bottom-[-80px] h-36 w-36 rounded-full bg-cyan-400/16 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <button
              onClick={onBack}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/18"
              type="button"
              title="رجوع"
            >
              <ArrowRight className="h-4 w-4" />
            </button>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-[#e2bf74]/35 bg-white/10 text-[#e2bf74]">
              <IconWithText
                icon={Layout}
                text="قالب"
                vertical
                iconClassName="h-4.5 w-4.5"
                textClassName="text-[6px] font-black leading-none"
              />
            </span>

            <div className="min-w-0">
              <h2 className="truncate text-sm font-black">
                {templateId ? "تعديل النموذج" : "إنشاء نموذج جديد"}
              </h2>
              <p className="mt-0.5 truncate text-[10px] font-bold text-white/60">
                تخصيص هيكل العرض والمعاينة المباشرة.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-b border-[#d8b46a]/25 bg-white px-2 pt-2">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex h-12 flex-col items-center justify-center gap-0.5 rounded-t-xl
                  border-b-2 text-[10px] font-black transition-all
                  ${
                    active
                      ? "border-[#123f59] bg-[#fbf8f1] text-[#123f59]"
                      : "border-transparent text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"
                  }
                `}
                type="button"
              >
                <tab.icon className={active ? "h-4 w-4 text-[#c5983c]" : "h-4 w-4"} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#fbf8f1]/55 p-3 custom-scrollbar-slim">
        {activeTab === "intro" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
            <EditorSection icon={FileText} title="بيانات النموذج" subtitle="اسم القالب ونوعه ووصفه الداخلي.">
              <div className="space-y-3">
                <Field label="اسم القالب الإداري">
                  <input
                    type="text"
                    value={template.title}
                    onChange={(e) => setTemplate({ ...template, title: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="نوع القالب">
                    <select
                      value={template.type}
                      onChange={(e) => setTemplate({ ...template, type: e.target.value })}
                      className={INPUT_CLASS}
                    >
                      <option value="DETAILED">تفصيلي</option>
                      <option value="SIMPLE">مختصر</option>
                    </select>
                  </Field>

                  <Field label="وصف داخلي">
                    <input
                      type="text"
                      value={template.desc || ""}
                      onChange={(e) => setTemplate({ ...template, desc: e.target.value })}
                      className={INPUT_CLASS}
                      placeholder="وصف سريع..."
                    />
                  </Field>
                </div>
              </div>
            </EditorSection>

            <EditorSection icon={Type} title="صياغة فقرة المقدمة" subtitle="أدرج المتغيرات الديناميكية داخل نص المقدمة.">
              <div className="space-y-3">
                <div className="rounded-2xl border border-violet-200 bg-violet-50/70 p-2.5">
                  <div className="mb-2 flex items-center gap-1.5 text-[10px] font-black text-violet-700">
                    <Hash className="h-3.5 w-3.5" />
                    المتغيرات السريعة
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {DYNAMIC_VARIABLES.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => insertVariable("text", v.value)}
                        className="rounded-xl border border-violet-200 bg-white px-2 py-1 text-[9px] font-black text-violet-700 transition hover:bg-violet-100"
                        type="button"
                      >
                        + {v.label}
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="مخاطبة العميل">
                  <input
                    type="text"
                    value={template.intro.addresseePrefix}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        intro: { ...template.intro, addresseePrefix: e.target.value },
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
                        intro: { ...template.intro, greeting: e.target.value },
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </Field>

                <Field label="نص المقدمة">
                  <textarea
                    rows={8}
                    value={template.intro.text}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        intro: { ...template.intro, text: e.target.value },
                      })
                    }
                    className={`${INPUT_CLASS} h-auto min-h-[160px] resize-y py-3 leading-6`}
                  />
                </Field>
              </div>
            </EditorSection>
          </div>
        )}

        {activeTab === "table" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
            <EditorSection icon={TableIcon} title="أعمدة الجدول" subtitle="تحديد الأعمدة التي تظهر في عرض السعر.">
              <div className="space-y-2">
                <ToggleRow checked disabled label="مسلسل (م) - إجباري" />
                <ToggleRow checked disabled label="الوصف - إجباري" />
                <ToggleRow
                  checked={template.table.showUnit}
                  label="عمود الوحدة"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      table: { ...template.table, showUnit: checked },
                    })
                  }
                />
                <ToggleRow
                  checked={template.table.showQuantity}
                  label="عمود الكمية"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      table: { ...template.table, showQuantity: checked },
                    })
                  }
                />
                <ToggleRow
                  checked={template.table.showUnitPrice}
                  label="عمود سعر الوحدة"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      table: { ...template.table, showUnitPrice: checked },
                    })
                  }
                />
              </div>
            </EditorSection>

            <EditorSection icon={Percent} title="المالية والضرائب" subtitle="إظهار الإجماليات ونسبة ضريبة القيمة المضافة.">
              <div className="space-y-3">
                <ToggleRow
                  checked={template.financials.showSubtotal}
                  label="إظهار الإجمالي قبل الضريبة"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      financials: { ...template.financials, showSubtotal: checked },
                    })
                  }
                />

                <ToggleRow
                  checked={template.financials.showTotal}
                  label="إظهار الإجمالي النهائي"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      financials: { ...template.financials, showTotal: checked },
                    })
                  }
                />

                <Field label="نسبة الضريبة VAT %">
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
                    className="h-10 w-28 rounded-xl border border-[#d8b46a]/25 bg-white px-3 text-xs font-bold text-[#123f59] outline-none focus:border-[#c5983c]/70 focus:ring-4 focus:ring-[#c5983c]/10"
                  />
                </Field>
              </div>
            </EditorSection>
          </div>
        )}

        {activeTab === "terms" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
            <EditorSection icon={ListChecks} title="الشروط والملاحظات" subtitle="العنوان والنص الذي يظهر أسفل العرض.">
              <div className="space-y-3">
                <Field label="عنوان القسم">
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

                <Field label="الشروط والأحكام">
                  <textarea
                    rows={8}
                    value={template.terms.text}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        terms: { ...template.terms, text: e.target.value },
                      })
                    }
                    className={`${INPUT_CLASS} h-auto min-h-[170px] resize-y py-3 leading-6`}
                  />
                </Field>
              </div>
            </EditorSection>

            <EditorSection icon={Signature} title="التوقيعات" subtitle="تحديد التوقيعات والمسميات التي تظهر في نهاية العرض.">
              <div className="space-y-3">
                <SignatureRow
                  checked={template.signatures.showClient}
                  label="توقيع العميل"
                  value={template.signatures.clientLabel}
                  onToggle={(checked) =>
                    setTemplate({
                      ...template,
                      signatures: { ...template.signatures, showClient: checked },
                    })
                  }
                  onChange={(value) =>
                    setTemplate({
                      ...template,
                      signatures: { ...template.signatures, clientLabel: value },
                    })
                  }
                />

                <SignatureRow
                  checked={template.signatures.showOffice}
                  label="توقيع المكتب"
                  value={template.signatures.officeLabel}
                  onToggle={(checked) =>
                    setTemplate({
                      ...template,
                      signatures: { ...template.signatures, showOffice: checked },
                    })
                  }
                  onChange={(value) =>
                    setTemplate({
                      ...template,
                      signatures: { ...template.signatures, officeLabel: value },
                    })
                  }
                />
              </div>
            </EditorSection>
          </div>
        )}

        {activeTab === "header" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
            <EditorSection icon={ImageIcon} title="الترويسة" subtitle="الشعار، التاريخ، وعنوان الوثيقة.">
              <div className="space-y-3">
                <ToggleRow
                  checked={template.header.showLogo}
                  label="إظهار شعار المكتب المعتمد"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      header: { ...template.header, showLogo: checked },
                    })
                  }
                />

                <ToggleRow
                  checked={template.header.showDate}
                  label="إظهار تاريخ العرض"
                  onChange={(checked) =>
                    setTemplate({
                      ...template,
                      header: { ...template.header, showDate: checked },
                    })
                  }
                />

                <Field label="عنوان الوثيقة الرئيسي">
                  <input
                    type="text"
                    value={template.header.documentTitle}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        header: { ...template.header, documentTitle: e.target.value },
                      })
                    }
                    className={INPUT_CLASS}
                  />
                </Field>
              </div>
            </EditorSection>
          </div>
        )}

        {activeTab === "style" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4">
            <EditorSection
              icon={Palette}
              title="ستايل صفحة A4"
              subtitle="الألوان، حجم الخط، كثافة الصفحة، والإطار."
            >
              <div className="space-y-3">
                <Field label="ستايل جاهز">
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
                    <option value="classic">كلاسيكي أزرق / ذهبي</option>
                    <option value="teal">تركواز رسمي</option>
                    <option value="emerald">أخضر احترافي</option>
                    <option value="graphite">رسمي داكن</option>
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-2">
                  <Field label="لون العنوان">
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
                      className="h-10 w-full cursor-pointer rounded-xl border border-[#d8b46a]/25 bg-white p-1"
                    />
                  </Field>

                  <Field label="لون التمييز">
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
                      className="h-10 w-full cursor-pointer rounded-xl border border-[#d8b46a]/25 bg-white p-1"
                    />
                  </Field>
                </div>

                <Field label="حجم خط المستند">
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
                    <option value="1">عادي</option>
                    <option value="1.08">كبير وواضح</option>
                  </select>
                </Field>

                <Field label="كثافة الصفحة">
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
                    <option value="compact">مضغوط</option>
                    <option value="normal">عادي</option>
                    <option value="wide">واسع</option>
                  </select>
                </Field>

                <ToggleRow
                  checked={Boolean(template.pageStyle?.showOuterBorder)}
                  label="إظهار إطار خارجي للصفحة"
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

                <div className="rounded-2xl border border-[#d8b46a]/25 bg-[#fbf8f1]/75 p-3">
                  <div className="mb-2 flex items-center gap-2 text-[10px] font-black text-[#123f59]">
                    <SlidersHorizontal className="h-4 w-4 text-[#c5983c]" />
                    ملاحظة
                  </div>
                  <p className="text-[10px] font-bold leading-5 text-[#64748b]">
                    هذه الإعدادات تُحفظ مع النموذج وتظهر مباشرة في معاينة A4 والطباعة.
                  </p>
                </div>
              </div>
            </EditorSection>
          </div>
        )}

      </div>

      <div className="shrink-0 border-t border-[#d8b46a]/25 bg-white p-3">
        <button
          onClick={handleSaveTemplate}
          disabled={isSaving}
          className="
            inline-flex h-11 w-full items-center justify-center gap-2
            rounded-xl bg-gradient-to-l from-[#123f59] via-[#15536f] to-[#0e7490]
            text-xs font-black text-white
            shadow-[0_10px_22px_rgba(18,63,89,0.16)]
            transition hover:-translate-y-[1px]
            disabled:cursor-not-allowed disabled:opacity-50
          "
          type="button"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin text-[#e2bf74]" />
          ) : (
            <Save className="h-4 w-4 text-[#e2bf74]" />
          )}
          {templateId ? "حفظ التعديلات" : "حفظ واعتماد النموذج"}
        </button>
      </div>
    </aside>
  );
}

const EditorSection = ({ icon: Icon, title, subtitle, children }) => {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#d8b46a]/25 bg-white shadow-[0_8px_18px_rgba(18,63,89,0.05)]">
      <div className="flex items-center gap-2 border-b border-[#e8ddc8] bg-gradient-to-l from-[#fbf8f1] via-white to-[#eef7f6] px-3 py-2.5">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-xs font-black text-[#123f59]">{title}</h3>
          <p className="mt-0.5 truncate text-[9px] font-bold text-[#94a3b8]">{subtitle}</p>
        </div>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
};

const Field = ({ label, children }) => {
  return (
    <label className="block space-y-1.5">
      <span className="text-[10px] font-black text-[#64748b]">{label}</span>
      {children}
    </label>
  );
};

const ToggleRow = ({ checked, label, onChange, disabled = false }) => {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-[#e8ddc8] bg-[#fbf8f1]/75 px-3 py-2 transition hover:bg-[#f8efe0]">
      <span className="flex min-w-0 items-center gap-2 text-xs font-black text-[#123f59]">
        <CheckSquare className="h-4 w-4 shrink-0 text-[#c5983c]" />
        <span className="break-words">{label}</span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded border-[#d8b46a]/50 text-[#123f59] focus:ring-[#c5983c]/20 disabled:opacity-50"
      />
    </label>
  );
};

const SignatureRow = ({ checked, label, value, onToggle, onChange }) => {
  return (
    <div className="rounded-2xl border border-[#e8ddc8] bg-[#fbf8f1]/75 p-3">
      <ToggleRow checked={checked} label={label} onChange={onToggle} />
      <input
        type="text"
        value={value}
        disabled={!checked}
        onChange={(e) => onChange(e.target.value)}
        className={`${INPUT_CLASS} mt-2 disabled:bg-[#fbf8f1]/80 disabled:text-[#94a3b8]`}
      />
    </div>
  );
};

const INPUT_CLASS = `
  h-10 w-full rounded-xl
  border border-[#d8b46a]/25 bg-white
  px-3 text-xs font-bold text-[#123f59]
  shadow-[0_8px_18px_rgba(18,63,89,0.05)] outline-none transition-all
  placeholder:text-[#94a3b8]
  focus:border-[#c5983c]/70
  focus:bg-white
  focus:ring-4 focus:ring-[#c5983c]/10
`;
