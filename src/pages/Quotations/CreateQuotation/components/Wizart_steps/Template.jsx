import React, { useState, useMemo } from "react";
import {
  Loader2,
  CheckCircle2,
  Eye,
  LayoutTemplate,
  X,
  FileText,
  ListChecks,
  Table as TableIcon,
  Search,
  Tag,
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
    selectedTemplate,
    setSelectedTemplate,
    templatesLoading,
    serverTemplates,
    setTermsText,
  } = props;

  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const currentTemplates = serverTemplates || [];

  // 🚀 تصفية النماذج بناءً على البحث
  const filteredTemplates = useMemo(() => {
    if (!searchTerm.trim()) return currentTemplates;
    const term = searchTerm.toLowerCase();
    return currentTemplates.filter(
      (tpl) =>
        tpl.title?.toLowerCase().includes(term) ||
        tpl.category?.toLowerCase().includes(term) ||
        tpl.id?.toLowerCase().includes(term),
    );
  }, [currentTemplates, searchTerm]);

  // ==========================================
  // مكون المعاينة المنبثق (Preview Modal)
  // ==========================================
  const PreviewModal = () => {
    if (!previewTemplate) return null;
    return (
      <div className="absolute inset-0 z-50 flex min-w-0 items-center justify-center p-3 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
        <div className="bg-white w-full max-w-2xl rounded-[20px] shadow-[0_20px_55px_rgba(18,63,89,0.18)] overflow-hidden flex flex-col border border-[#d8b46a]/25 animate-in zoom-in-95 duration-200">
          <div className="flex min-w-0 justify-between items-center p-3 border-b border-[#e8ddc8] bg-[#fbf8f1]/50">
            <div className="flex min-w-0 items-center gap-2">
              <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <IconWithText icon={FileText} iconClassName="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#123f59]">
                  {previewTemplate.title}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-mono text-[#64748b] bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {previewTemplate.id}
                  </span>
                  {/* 🌟 عرض نوع المستند / التصنيف من بيانات النموذج */}
                  <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <Tag className="w-2.5 h-2.5" />
                    {previewTemplate.documentType ||
                      previewTemplate.category ||
                      "عرض سعر فني ومالي"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setPreviewTemplate(null)}
              className="p-1.5 text-[#94a3b8] hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-3 overflow-y-auto overflow-x-hidden custom-scrollbar-slim max-h-[300px] space-y-3">
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
        <div className="flex-1 bg-white p-3 rounded-xl border border-[#d8b46a]/25 shadow-[0_8px_22px_rgba(18,63,89,0.06)] flex flex-col h-[400px]">
          {/* 🌟 شريط الأدوات: العنوان + مربع البحث */}
          <div className="flex flex-col gap-3 mb-3 pb-3 border-b border-slate-100 shrink-0">
            <div className="text-[11px] font-bold text-[#64748b] flex min-w-0 justify-between items-center">
              <span className="flex items-center gap-1.5">
                <LayoutTemplate className="w-4 h-4 text-indigo-500" />
                النماذج الإدارية المعتمدة ({currentTemplates.length})
              </span>
              {selectedTemplate && (
                <span className="text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full text-[10px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> تم تحديد نموذج
                </span>
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، رقم النموذج، أو التصنيف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-3 pr-8 py-1.5 text-[10.5px] border border-slate-200 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-bold text-[#123f59]"
              />
            </div>
          </div>

          {/* 🌟 جدول البيانات المكثف (Excel Style) */}
          <div className="flex-1 overflow-auto custom-scrollbar-slim border border-slate-200 rounded-lg bg-slate-50/30">
            <table className="w-full text-right border-collapse table-auto min-w-[500px]">
              <thead className="bg-slate-100 sticky top-0 z-10 shadow-sm text-[#475569]">
                <tr>
                  <th className="p-1.5 border border-slate-200 w-8 text-center text-[10px] font-black">
                    ✔
                  </th>
                  <th className="p-1.5 border border-slate-200 w-12 text-center text-[10px] font-black">
                    الرقم
                  </th>
                  <th className="p-1.5 border border-slate-200 text-[10px] font-black">
                    اسم النموذج
                  </th>
                  <th className="p-1.5 border border-slate-200 w-32 text-center text-[10px] font-black">
                    تصنيف المعاملة
                  </th>
                  <th className="p-1.5 border border-slate-200 w-14 text-center text-[10px] font-black">
                    الإجراء
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {filteredTemplates.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="p-4 text-center text-[10.5px] font-bold text-slate-400"
                    >
                      لا توجد نماذج مطابقة للبحث
                    </td>
                  </tr>
                ) : (
                  filteredTemplates.map((tpl, index) => {
                    const isSelected =
                      String(selectedTemplate) === String(tpl.id);
                    return (
                      <tr
                        key={tpl.id}
                        onClick={() => {
                          setSelectedTemplate(tpl.id);
                          setTermsText(tpl.defaultTerms || "");
                        }}
                        className={`cursor-pointer transition-colors border-b border-slate-100 group ${
                          isSelected ? "bg-indigo-50/80" : "hover:bg-slate-50"
                        }`}
                      >
                        {/* خانة التحديد */}
                        <td className="p-1 border-x border-slate-100 text-center align-middle">
                          <div
                            className={`w-3.5 h-3.5 mx-auto rounded-sm border flex items-center justify-center ${
                              isSelected
                                ? "bg-indigo-600 border-indigo-600"
                                : "bg-white border-slate-300 group-hover:border-indigo-400"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 text-white" />
                            )}
                          </div>
                        </td>

                        {/* خانة الرقم التسلسلي */}
                        <td className="p-1.5 border-x border-slate-100 text-center font-mono text-[9px] text-slate-500 align-middle">
                          {index + 1}
                        </td>

                        {/* خانة اسم النموذج */}
                        <td className="p-1.5 border-x border-slate-100 text-[10.5px] align-middle">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold ${isSelected ? "text-indigo-800" : "text-[#123f59]"}`}
                            >
                              {tpl.title}
                            </span>
                            {tpl.isDefault && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded-[4px] text-[8px] font-bold">
                                افتراضي
                              </span>
                            )}
                          </div>
                          <div className="text-[8.5px] font-mono text-slate-400 mt-0.5">
                            {tpl.id}
                          </div>
                        </td>

                        {/* خانة التصنيف الرئيسي */}
                        <td className="p-1.5 border-x border-slate-100 text-center align-middle">
                          <span className="inline-block px-1.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-[4px] text-[9px] font-bold whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]">
                            {tpl.category || tpl.documentType || "معاملة عامة"}
                          </span>
                        </td>

                        {/* خانة زر المعاينة */}
                        <td className="p-1 border-x border-slate-100 text-center align-middle">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewTemplate(tpl);
                            }}
                            className="p-1.5 rounded-lg flex items-center justify-center mx-auto transition-colors bg-slate-50 text-slate-500 border border-slate-200 hover:bg-indigo-100 hover:text-indigo-700 hover:border-indigo-200"
                            title="معاينة"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
