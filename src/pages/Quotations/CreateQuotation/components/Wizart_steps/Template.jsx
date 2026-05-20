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
      className={`
        inline-flex min-w-0 items-center justify-center
        ${vertical ? "flex-col gap-0.5" : "gap-1.5"}
        ${className}
      `}
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
      <div className="absolute inset-0 z-50 flex min-w-0 items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-2xl rounded-[20px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] overflow-hidden flex flex-col border border-[#d8b46a]/25 animate-in zoom-in-95 duration-200">
          {/* رأس المعاينة */}
          <div className="flex min-w-0 justify-between items-center p-3 border-b border-[#e8ddc8] bg-[#fbf8f1]/50">
            <div className="flex min-w-0 items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <IconWithText icon={FileText} iconClassName="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#123f59]">
                  {previewTemplate.title}
                </h3>
                <p className="text-[10px] font-mono text-[#64748b]">
                  {previewTemplate.id}
                </p>
              </div>
            </div>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* محتوى المعاينة المكتف */}
          <div className="p-3 overflow-y-auto overflow-x-hidden custom-scrollbar-slim max-h-[300px] custom-scrollbar-slim space-y-3">
            <div>
              <div className="text-[10px] font-bold text-[#64748b] mb-1 flex min-w-0 items-center gap-1">
                <FileText className="w-3 h-3" /> نص المقدمة:
              </div>
              <div className="p-2.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl text-xs leading-relaxed text-[#475569] text-justify border border-[#e8ddc8]">
                {previewTemplate.sections?.intro?.text ||
                  previewTemplate.desc ||
                  "لا يوجد نص مقدمة"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[10px] font-bold text-[#64748b] mb-1 flex min-w-0 items-center gap-1">
                  <TableIcon className="w-3 h-3" /> إعدادات الجدول:
                </div>
                <div className="p-2.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl text-[10px] text-[#475569] border border-[#e8ddc8] space-y-1 font-medium">
                  <div className="flex min-w-0 justify-between">
                    <span>عرض الوحدة:</span>{" "}
                    <span>
                      {previewTemplate.options?.showUnit ? "نعم" : "لا"}
                    </span>
                  </div>
                  <div className="flex min-w-0 justify-between">
                    <span>عرض الكمية:</span>{" "}
                    <span>
                      {previewTemplate.options?.showQuantity ? "نعم" : "لا"}
                    </span>
                  </div>
                  <div className="flex min-w-0 justify-between">
                    <span>عرض السعر:</span>{" "}
                    <span>
                      {previewTemplate.options?.showUnitPrice ? "نعم" : "لا"}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-[#64748b] mb-1 flex min-w-0 items-center gap-1">
                  <ListChecks className="w-3 h-3" /> الشروط والأحكام:
                </div>
                <div className="p-2.5 bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white rounded-xl text-[10px] leading-relaxed text-[#475569] border border-[#e8ddc8] max-h-[70px] overflow-hidden relative">
                  {previewTemplate.defaultTerms || "لا يوجد شروط"}
                  <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-slate-50 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>

          {/* زر الاختيار المباشر من المعاينة */}
          <div className="p-3 border-t border-[#e8ddc8] bg-gradient-to-br from-[#eef7f6] via-[#fbf8f1] to-white flex justify-end">
            <button
              onClick={() => {
                setSelectedTemplate(previewTemplate.id);
                setTermsText(previewTemplate.defaultTerms || "");
                setPreviewTemplate(null);
              }}
              className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
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
          <span className="text-xs font-bold text-[#64748b]">
            جاري تحميل النماذج...
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-1 gap-3">
          {/* العمود الأيمن: الإعدادات والخيارات (كثافة عالية) */}
          <div className="lg:col-span-1 space-y-1">
            {/* اختيار نوع النموذج (Segmented Control) */}
            <div className="bg-white p-2 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)]">
              <div className="text-[10px] font-bold text-[#64748b] mb-2 flex min-w-0 items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5" /> هيكل عرض السعر
              </div>
              <div className="flex bg-[#fbf8f1] p-1 rounded-xl">
                <button
                  onClick={() => {
                    setTemplateType("SUMMARY");
                    setSelectedTemplate("");
                  }}
                  className={`flex-1 flex min-w-0 items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    templateType === "SUMMARY"
                      ? "bg-white text-indigo-700 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                      : "text-[#64748b] hover:text-[#475569]"
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
                  className={`flex-1 flex min-w-0 items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                    templateType === "DETAILED"
                      ? "bg-white text-indigo-700 shadow-[0_8px_22px_rgba(18,63,89,0.06)]"
                      : "text-[#64748b] hover:text-[#475569]"
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
          <div className="lg:col-span-8 bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex flex-col h-[230px]">
            <div className="text-[10px] font-bold text-[#64748b] mb-2.5 flex min-w-0 justify-between items-center">
              <span>النماذج الإدارية المعتمدة ({currentTemplates.length})</span>
              {selectedTemplate && (
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  تم الاختيار
                </span>
              )}
            </div>

            {/* القائمة بخاصية الشبكة لتكثيف العرض */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar-slim pr-1 content-start flex-1">
              {currentTemplates.length === 0 ? (
                <div className="col-span-2 text-center text-xs text-[#94a3b8] py-3">
                  لا توجد نماذج متاحة لهذا النوع
                </div>
              ) : (
                currentTemplates.map((tpl) => {
                  const isSelected = selectedTemplate === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      className={`group relative flex flex-col justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? "border-indigo-400 bg-indigo-50/40 shadow-[0_0_0_1px_rgba(99,102,241,1)]"
                          : "border-[#d8b46a]/25 bg-white hover:border-indigo-300 hover:shadow-[0_8px_18px_rgba(18,63,89,0.05)]"
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

                      <div className="flex min-w-0 justify-between items-start z-10 pointer-events-none">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {isSelected ? (
                            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-[#d8b46a]/25 group-hover:border-indigo-400"></div>
                          )}
                          <div
                            className={`text-[11px] font-bold line-clamp-1 pr-1 ${isSelected ? "text-indigo-800" : "text-[#123f59]"}`}
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

                      <div className="mt-1.5 flex min-w-0 justify-between items-end z-10">
                        <div className="text-[9px] text-[#94a3b8] font-mono pointer-events-none">
                          {tpl.id}
                        </div>

                        {/* زر المعاينة - يظهر عند التمرير أو إذا كان مختاراً */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // منع تفعيل الاختيار عند ضغط زر المعاينة
                            setPreviewTemplate(tpl);
                          }}
                          className={`p-1.5 rounded-xl flex min-w-0 items-center justify-center transition-all ${
                            isSelected
                              ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 opacity-100"
                              : "bg-[#fbf8f1] text-[#64748b] hover:bg-indigo-50 hover:text-indigo-600 opacity-0 group-hover:opacity-100"
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
