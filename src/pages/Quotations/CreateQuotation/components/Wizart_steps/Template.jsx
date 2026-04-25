import React, { useState } from "react";
import {
  Loader2,
  CheckCircle2,
  Eye,
  LayoutTemplate,
  Settings2,
  X,
  FileText,
  ListChecks,
  Table as TableIcon,
} from "lucide-react";

export const Step2Template = ({ props }) => {
  const {
    templateType,
    setTemplateType,
    selectedTemplate,
    setSelectedTemplate,
    showClientCode,
    setShowClientCode,
    showPropertyCode,
    setShowPropertyCode,
    templatesLoading,
    serverTemplates,
    setTermsText,
  } = props;

  // حالة التحكم في نافذة المعاينة
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const summaryTemplates =
    serverTemplates?.filter((t) => t.type === "SUMMARY") || [];
  const detailedTemplates =
    serverTemplates?.filter((t) => t.type === "DETAILED") || [];
  const currentTemplates =
    templateType === "SUMMARY" ? summaryTemplates : detailedTemplates;

  // ==========================================
  // مكون المعاينة المنبثق (Preview Modal)
  // ==========================================
  const PreviewModal = () => {
    if (!previewTemplate) return null;
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 animate-in zoom-in-95 duration-200">
          {/* رأس المعاينة */}
          <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {previewTemplate.title}
                </h3>
                <p className="text-[10px] font-mono text-slate-500">
                  {previewTemplate.id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* محتوى المعاينة المكتف */}
          <div className="p-4 overflow-y-auto max-h-[300px] custom-scrollbar space-y-4">
            <div>
              <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> نص المقدمة:
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg text-xs leading-relaxed text-slate-700 text-justify border border-slate-100">
                {previewTemplate.sections?.intro?.text ||
                  previewTemplate.desc ||
                  "لا يوجد نص مقدمة"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <TableIcon className="w-3 h-3" /> إعدادات الجدول:
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-[10px] text-slate-700 border border-slate-100 space-y-1 font-medium">
                  <div className="flex justify-between">
                    <span>عرض الوحدة:</span>{" "}
                    <span>
                      {previewTemplate.options?.showUnit ? "نعم" : "لا"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>عرض الكمية:</span>{" "}
                    <span>
                      {previewTemplate.options?.showQuantity ? "نعم" : "لا"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>عرض السعر:</span>{" "}
                    <span>
                      {previewTemplate.options?.showUnitPrice ? "نعم" : "لا"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                  <ListChecks className="w-3 h-3" /> الشروط والأحكام:
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg text-[10px] leading-relaxed text-slate-700 border border-slate-100 max-h-[70px] overflow-hidden relative">
                  {previewTemplate.defaultTerms || "لا يوجد شروط"}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* زر الاختيار المباشر من المعاينة */}
          <div className="p-3 border-t border-slate-100 bg-slate-50 flex justify-end">
            <button
              onClick={() => {
                setSelectedTemplate(previewTemplate.id);
                setTermsText(previewTemplate.defaultTerms || "");
                setPreviewTemplate(null);
              }}
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              اختيار هذا النموذج
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300 relative h-full flex flex-col">
      <PreviewModal />

      {templatesLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[250px]">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
          <span className="text-xs font-bold text-slate-500">
            جاري تحميل النماذج...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
          {/* العمود الأيمن: الإعدادات والخيارات (كثافة عالية) */}
          <div className="lg:col-span-1 space-y-1">
            {/* اختيار نوع النموذج (Segmented Control) */}
            <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
              <div className="text-[10px] font-bold text-slate-500 mb-2 flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5" /> هيكل عرض السعر
              </div>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => {
                    setTemplateType("SUMMARY");
                    setSelectedTemplate("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    templateType === "SUMMARY"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {templateType === "SUMMARY" && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}{" "}
                  مختصر
                </button>
                <button
                  onClick={() => {
                    setTemplateType("DETAILED");
                    setSelectedTemplate("");
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                    templateType === "DETAILED"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {templateType === "DETAILED" && (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}{" "}
                  تفصيلي
                </button>
              </div>
            </div>
          </div>

          {/* العمود الأيسر: قائمة النماذج (Grid View) */}
          <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col h-[230px]">
            <div className="text-[10px] font-bold text-slate-500 mb-2.5 flex justify-between items-center">
              <span>النماذج الإدارية المعتمدة ({currentTemplates.length})</span>
              {selectedTemplate && (
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  تم الاختيار
                </span>
              )}
            </div>

            {/* القائمة بخاصية الشبكة لتكثيف العرض */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto custom-scrollbar pr-1 content-start flex-1">
              {currentTemplates.length === 0 ? (
                <div className="col-span-2 text-center text-xs text-slate-400 py-8">
                  لا توجد نماذج متاحة لهذا النوع
                </div>
              ) : (
                currentTemplates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className={`group relative flex flex-col justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-50/40 shadow-[0_0_0_1px_rgba(99,102,241,1)]"
                          : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                      }`}
                    >
                      {/* منطقة الضغط لاختيار النموذج */}
                      <div
                        className="absolute inset-0 z-0"
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          setTermsText(tpl.defaultTerms || "");
                        }}
                      ></div>

                      <div className="flex justify-between items-start z-10 pointer-events-none">
                        <div className="flex items-center gap-1.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300 group-hover:border-indigo-400"></div>
                          )}
                          <div
                            className={`text-[11px] font-bold line-clamp-1 pr-1 ${isSelected ? "text-indigo-800" : "text-slate-800"}`}
                          >
                            {tpl.title}
                          </div>
                        </div>
                        {tpl.isDefault && (
                          <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[8px] font-bold">
                            افتراضي
                          </span>
                        )}
                      </div>

                      <div className="mt-1.5 flex justify-between items-end z-10">
                        <div className="text-[9px] text-slate-400 font-mono pointer-events-none">
                          {tpl.id}
                        </div>

                        {/* زر المعاينة - يظهر عند التمرير أو إذا كان مختاراً */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // منع تفعيل الاختيار عند ضغط زر المعاينة
                            setPreviewTemplate(tpl);
                          }}
                          className={`p-1.5 rounded-md flex items-center justify-center transition-all ${
                            isSelected
                              ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 opacity-100"
                              : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100"
                          }`}
                          title="معاينة النموذج"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
