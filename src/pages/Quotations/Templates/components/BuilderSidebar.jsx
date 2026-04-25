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
} from "lucide-react";
import { DYNAMIC_VARIABLES } from "../constants";

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
      intro: { ...prev.intro, [field]: prev.intro[field] + " " + variable },
    }));
  };

  return (
    <div className="w-[450px] border-l border-slate-200 flex flex-col bg-slate-50/50 shadow-lg z-10">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1 hover:bg-slate-100 rounded text-slate-500"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <Layout className="w-5 h-5 text-violet-600" />
            {templateId ? "تعديل النموذج" : "إنشاء نموذج جديد"}
          </h2>
        </div>
        <p className="text-xs text-slate-500 mr-8">
          قم بتخصيص هيكل عرض السعر وسيطبق ديناميكياً
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex px-4 pt-4 gap-1 border-b border-slate-200 bg-white">
        {[
          { id: "intro", label: "المقدمة", icon: AlignRight },
          { id: "table", label: "الجدول", icon: TableIcon },
          { id: "terms", label: "الشروط", icon: ListChecks },
          { id: "header", label: "الترويسة", icon: ImageIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 text-[11px] font-bold border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-violet-600 text-violet-700 bg-violet-50/50"
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {/* Intro Tab */}
        {activeTab === "intro" && (
          <div className="space-y-5 animate-in slide-in-from-right-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                اسم القالب الإداري
              </label>
              <input
                type="text"
                value={template.title}
                onChange={(e) =>
                  setTemplate({ ...template, title: e.target.value })
                }
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
              />
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Type className="w-4 h-4 text-violet-600" /> صياغة فقرة المقدمة
              </label>
              <div className="mb-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                <div className="flex flex-wrap gap-1.5">
                  {DYNAMIC_VARIABLES.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => insertVariable("text", v.value)}
                      className="px-2 py-1 bg-white text-violet-700 text-[10px] font-bold border border-violet-200 rounded"
                    >
                      + {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                rows={8}
                value={template.intro.text}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    intro: { ...template.intro, text: e.target.value },
                  })
                }
                className="w-full p-3 text-sm border border-slate-300 rounded-xl outline-none resize-y"
              />
            </div>
          </div>
        )}

        {activeTab === "table" && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b pb-2">
                أعمدة الجدول المعروضة
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="w-4 h-4 text-violet-600 rounded bg-slate-100"
                />
                <span className="text-sm text-slate-500">
                  مسلسل (م) - إجباري
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="w-4 h-4 text-violet-600 rounded bg-slate-100"
                />
                <span className="text-sm text-slate-500">الوصف - إجباري</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.table.showUnit}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      table: {
                        ...template.table,
                        showUnit: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  عمود الوحدة
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.table.showQuantity}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      table: {
                        ...template.table,
                        showQuantity: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  عمود الكمية
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.table.showUnitPrice}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      table: {
                        ...template.table,
                        showUnitPrice: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  عمود سعر الوحدة
                </span>
              </label>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-slate-800 border-b pb-2">
                المالية والضرائب
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.financials.showSubtotal}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      financials: {
                        ...template.financials,
                        showSubtotal: e.target.checked,
                      },
                    })
                  }
                  className="w-4 h-4 text-violet-600 rounded"
                />
                <span className="text-sm font-medium text-slate-700">
                  إظهار الإجمالي قبل الضريبة
                </span>
              </label>
              <div>
                <label className="block text-xs text-slate-500 mb-1 mt-2">
                  نسبة الضريبة (VAT) %
                </label>
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
                  className="w-24 p-2 text-sm border border-slate-300 rounded-lg outline-none focus:border-violet-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Terms Tab */}
        {activeTab === "terms" && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                عنوان قسم الملاحظات
              </label>
              <input
                type="text"
                value={template.terms.title}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    terms: { ...template.terms, title: e.target.value },
                  })
                }
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl mb-4"
              />

              <label className="block text-xs font-bold text-slate-700 mb-2">
                الشروط والأحكام
              </label>
              <textarea
                rows={8}
                value={template.terms.text}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    terms: { ...template.terms, text: e.target.value },
                  })
                }
                className="w-full p-3 text-sm border border-slate-300 rounded-xl resize-y"
              />
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-800 border-b pb-2">
                التوقيعات
              </h3>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.signatures.showClient}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        signatures: {
                          ...template.signatures,
                          showClient: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-violet-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    توقيع العميل
                  </span>
                </label>
                <input
                  type="text"
                  value={template.signatures.clientLabel}
                  disabled={!template.signatures.showClient}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      signatures: {
                        ...template.signatures,
                        clientLabel: e.target.value,
                      },
                    })
                  }
                  className="w-48 p-1.5 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={template.signatures.showOffice}
                    onChange={(e) =>
                      setTemplate({
                        ...template,
                        signatures: {
                          ...template.signatures,
                          showOffice: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 text-violet-600 rounded"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    توقيع المكتب
                  </span>
                </label>
                <input
                  type="text"
                  value={template.signatures.officeLabel}
                  disabled={!template.signatures.showOffice}
                  onChange={(e) =>
                    setTemplate({
                      ...template,
                      signatures: {
                        ...template.signatures,
                        officeLabel: e.target.value,
                      },
                    })
                  }
                  className="w-48 p-1.5 text-xs border border-slate-300 rounded-lg disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        )}

        {/* Header Tab */}
        {activeTab === "header" && (
          <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-4 animate-in slide-in-from-right-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={template.header.showLogo}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    header: {
                      ...template.header,
                      showLogo: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-violet-600 rounded"
              />
              <span className="text-sm font-medium text-slate-700">
                إظهار شعار المكتب المعتمد
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={template.header.showDate}
                onChange={(e) =>
                  setTemplate({
                    ...template,
                    header: {
                      ...template.header,
                      showDate: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-violet-600 rounded"
              />
              <span className="text-sm font-medium text-slate-700">
                إظهار تاريخ العرض
              </span>
            </label>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                عنوان الوثيقة الرئيسي
              </label>
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
                className="w-full p-2.5 text-sm border border-slate-300 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="p-5 border-t border-slate-200 bg-white">
        <button
          onClick={handleSaveTemplate}
          disabled={isSaving}
          className="w-full py-3 bg-violet-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {templateId ? "حفظ التعديلات" : "حفظ وإعتماد النموذج"}
        </button>
      </div>
    </div>
  );
}
