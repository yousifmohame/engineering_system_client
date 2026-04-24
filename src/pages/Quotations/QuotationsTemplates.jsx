import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Layout,
  Save,
  Table as TableIcon,
  ListChecks,
  Image as ImageIcon,
  Type,
  AlignRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ==========================================
// المتغيرات الديناميكية المتاحة للنظام
// ==========================================
const DYNAMIC_VARIABLES = [
  { label: "اسم العميل", value: "{{clientName}}" },
  { label: "نوع الخدمة", value: "{{serviceType}}" },
  { label: "رقم القطعة", value: "{{plotNumber}}" },
  { label: "رقم المخطط", value: "{{planNumber}}" },
  { label: "الحي", value: "{{district}}" },
  { label: "المساحة", value: "{{area}}" },
  { label: "رقم الرخصة القديمة", value: "{{oldLicenseNo}}" },
];

// قالب فارغ افتراضي للإنشاء الجديد
const DEFAULT_TEMPLATE = {
  title: "نموذج عرض سعر - جديد",
  type: "DETAILED",
  desc: "وصف النموذج هنا...",
  header: {
    showLogo: true,
    documentTitle: "عرض سعر خدمات هندسية",
    showDate: true,
  },
  intro: {
    addresseePrefix: "السادة / ",
    greeting: "السلام عليكم ورحمة الله وبركاته ،،،،",
    text: "إشارة إلى طلبكم بخصوص تقديم عرض سعر خدمات ({{serviceType}}) لقطعة الأرض رقم ({{plotNumber}}) ضمن المخطط التنظيمي رقم ({{planNumber}}) بحي {{district}} بمدينة الرياض بإجمالي مساحة ({{area}} م2)، وفقاً لرخصة البناء رقم ({{oldLicenseNo}})، فإنه يسرنا تقديم العرض لإنهاء الأعمال المطلوبة على أن يكون نطاق العمل كما يلي:",
  },
  table: {
    showUnit: true,
    showQuantity: true,
    showUnitPrice: true,
  },
  financials: {
    showSubtotal: true,
    vatPercentage: 15,
    showTotal: true,
  },
  terms: {
    title: "ملاحظات :",
    text: "1. عند اعتماد العرض المقدم يتم التعاقد مع مكتبنا مع دفع دفعة أولى 50% عند التعاقد ودفعة ثانية 30% عند اعتماد المخططات المعمارية ودفعة ثالثة 20% عند اعتماد الرخصة.\n2. يشترط التعاقد مع الاستشاري بعقد إشراف منفصل.\n3. يتحمل المالك جميع الرسوم الحكومية الخاصة بالطلب.",
  },
  signatures: {
    showClient: true,
    clientLabel: "توقيع العميل / الممثل",
    showOffice: true,
    officeLabel: "بلاك كيوب للاستشارات الهندسية",
  },
};

// ملاحظة: تأكد من تمرير templateId (مثلاً TPL-001) إذا كنت في وضع التعديل
export default function AdvancedQuotationBuilder({
  templateId = null,
  onBack,
}) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("intro");

  // حالة النموذج الحالية في المحرر
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE);

  // ==========================================
  // 1. جلب البيانات إذا كنا في وضع التعديل
  // ==========================================
  const { data: fetchedTemplate, isLoading: isFetching } = useQuery({
    queryKey: ["quotation-template", templateId],
    queryFn: async () => {
      // نفترض وجود مسار جلب قالب واحد في الباك إند
      const res = await api.get(`/quotation-templates/${templateId}`);
      return res.data.data;
    },
    enabled: !!templateId, // يعمل فقط إذا تم تمرير ID
  });

  // تحديث المحرر بمجرد وصول البيانات من السيرفر
  useEffect(() => {
    if (fetchedTemplate) {
      setTemplate({
        title: fetchedTemplate.title || DEFAULT_TEMPLATE.title,
        type: fetchedTemplate.type || DEFAULT_TEMPLATE.type,
        desc:
          fetchedTemplate.description ||
          fetchedTemplate.desc ||
          DEFAULT_TEMPLATE.desc,
        header: fetchedTemplate.sections?.header || DEFAULT_TEMPLATE.header,
        intro: fetchedTemplate.sections?.intro || DEFAULT_TEMPLATE.intro,
        table: fetchedTemplate.options || DEFAULT_TEMPLATE.table, // الباك إند يحفظ الجدول في options
        financials:
          fetchedTemplate.sections?.financials || DEFAULT_TEMPLATE.financials,
        terms: {
          title:
            fetchedTemplate.sections?.terms?.title ||
            DEFAULT_TEMPLATE.terms.title,
          text: fetchedTemplate.defaultTerms || DEFAULT_TEMPLATE.terms.text,
        },
        signatures:
          fetchedTemplate.sections?.signatures || DEFAULT_TEMPLATE.signatures,
      });
    }
  }, [fetchedTemplate]);

  // ==========================================
  // 2. دالة الحفظ وإرسال البيانات للباك إند
  // ==========================================
  const saveMutation = useMutation({
    mutationFn: async (payload) => {
      return await api.post("/quotation-templates", payload);
    },
    onSuccess: () => {
      toast.success("تم حفظ واعتماد قالب عرض السعر بنجاح");
      queryClient.invalidateQueries(["quotation-templates"]);
      if (onBack) onBack(); // العودة للشاشة السابقة إن لزم الأمر
    },
    onError: (err) => {
      toast.error(
        "حدث خطأ أثناء حفظ القالب: " +
          (err.response?.data?.message || err.message),
      );
    },
  });

  const handleSaveTemplate = () => {
    // تجهيز الـ Payload ليتطابق 100% مع الـ Controller الخاص بك
    const payload = {
      id: templateId || "NEW",
      title: template.title,
      type: template.type,
      desc: template.desc,
      // الـ sectionsConfig في الباك إند نتوقع أن يكون كائناً يحتوي أجزاء العرض
      sections: {
        header: template.header,
        intro: template.intro,
        financials: template.financials,
        terms: { title: template.terms.title }, // نص الشروط يُحفظ في defaultTerms
        signatures: template.signatures,
      },
      // الـ displayOptions في الباك إند
      options: template.table,
      defaultTerms: template.terms.text,
    };

    saveMutation.mutate(payload);
  };

  // دالة لإدراج المتغيرات في النص
  const insertVariable = (field, variable) => {
    setTemplate((prev) => ({
      ...prev,
      intro: {
        ...prev.intro,
        [field]: prev.intro[field] + " " + variable,
      },
    }));
  };

  // ==========================================
  // 3. مكون الورقة A4 (Live Preview)
  // ==========================================
  const A4Preview = () => {
    const dummyData = {
      clientName: "شركة البلاد العقارية المحدودة",
      serviceType: "تعديل مكونات - مستودعات",
      plotNumber: "الثانية من ج (14)",
      planNumber: "1391",
      district: "المشاعل",
      area: "54726.75",
      oldLicenseNo: "1483/8744",
      date: new Date().toLocaleDateString("ar-SA"),
    };

    let previewIntroText = template.intro.text;
    Object.keys(dummyData).forEach((key) => {
      previewIntroText = previewIntroText.replace(
        new RegExp(`{{${key}}}`, "g"),
        dummyData[key],
      );
    });

    return (
      <div className="flex-1 bg-slate-200 p-8 overflow-y-auto flex justify-center custom-scrollbar">
        <div
          className="bg-white shadow-2xl relative"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "20mm 15mm",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-8">
            <div className="flex flex-col items-center">
              {template.header.showLogo && (
                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 mb-2 border border-slate-200">
                  [Logo]
                </div>
              )}
              <h1 className="font-bold text-sm text-slate-800">
                بلاك كيوب للإستشارات الهندسية
              </h1>
              <h2 className="text-[10px] text-slate-500 uppercase tracking-widest">
                Black Cube Engineering
              </h2>
            </div>
            <div className="text-left mt-2">
              <h3 className="text-xl font-bold text-slate-800 mb-2">
                {template.header.documentTitle}
              </h3>
              {template.header.showDate && (
                <p className="text-xs text-slate-600">
                  التاريخ : {dummyData.date}
                </p>
              )}
            </div>
          </div>

          {/* Intro */}
          <div className="mb-6">
            <h4 className="text-sm font-bold text-slate-800 mb-1">
              {template.intro.addresseePrefix} {dummyData.clientName}
            </h4>
            <p className="text-sm font-bold mb-4">المحترم</p>
            <p className="text-sm mb-4">{template.intro.greeting}</p>
            <p className="text-xs leading-relaxed text-slate-700 text-justify">
              {previewIntroText}
            </p>
          </div>

          {/* Table */}
          <div className="mb-8">
            <table className="w-full border-collapse border border-slate-800 text-xs text-center">
              <thead>
                <tr className="bg-slate-100 font-bold">
                  <th className="border border-slate-800 p-2 w-8">م</th>
                  <th className="border border-slate-800 p-2 text-right">
                    الوصف
                  </th>
                  {template.table.showUnit && (
                    <th className="border border-slate-800 p-2 w-16">الوحدة</th>
                  )}
                  {template.table.showQuantity && (
                    <th className="border border-slate-800 p-2 w-16">الكمية</th>
                  )}
                  {template.table.showUnitPrice && (
                    <th className="border border-slate-800 p-2 w-20">
                      سعر الوحدة
                    </th>
                  )}
                  <th className="border border-slate-800 p-2 w-24">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-800 p-2">1</td>
                  <td className="border border-slate-800 p-2 text-right">
                    المخططات المعمارية حسب كود البناء السعودي
                  </td>
                  {template.table.showUnit && (
                    <td className="border border-slate-800 p-2">-</td>
                  )}
                  {template.table.showQuantity && (
                    <td className="border border-slate-800 p-2">-</td>
                  )}
                  {template.table.showUnitPrice && (
                    <td className="border border-slate-800 p-2">-</td>
                  )}
                  <td className="border border-slate-800 p-2">-</td>
                </tr>
                <tr>
                  <td className="border border-slate-800 p-2">2</td>
                  <td className="border border-slate-800 p-2 text-right">
                    رفع وإصدار رخصة تعديل مكونات
                  </td>
                  {template.table.showUnit && (
                    <td className="border border-slate-800 p-2">رخصة</td>
                  )}
                  {template.table.showQuantity && (
                    <td className="border border-slate-800 p-2">1</td>
                  )}
                  {template.table.showUnitPrice && (
                    <td className="border border-slate-800 p-2">60,000</td>
                  )}
                  <td className="border border-slate-800 p-2 font-bold">
                    60,000
                  </td>
                </tr>

                {/* Financials */}
                {template.financials.showSubtotal && (
                  <tr>
                    <td
                      colSpan={
                        template.table.showUnit
                          ? template.table.showQuantity
                            ? template.table.showUnitPrice
                              ? 5
                              : 4
                            : 3
                          : 2
                      }
                      className="border border-slate-800 p-2 text-left font-bold"
                    >
                      الإجمالي بدون ضريبة القيمة المضافة{" "}
                      {template.financials.vatPercentage}%
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-700">
                      60,000 ريال
                    </td>
                  </tr>
                )}
                <tr>
                  <td
                    colSpan={
                      template.table.showUnit
                        ? template.table.showQuantity
                          ? template.table.showUnitPrice
                            ? 5
                            : 4
                          : 3
                        : 2
                    }
                    className="border border-slate-800 p-2 text-left font-bold"
                  >
                    ضريبة القيمة المضافة {template.financials.vatPercentage}%
                  </td>
                  <td className="border border-slate-800 p-2 font-bold text-slate-700">
                    9,000 ريال
                  </td>
                </tr>
                {template.financials.showTotal && (
                  <tr className="bg-slate-50">
                    <td
                      colSpan={
                        template.table.showUnit
                          ? template.table.showQuantity
                            ? template.table.showUnitPrice
                              ? 5
                              : 4
                            : 3
                          : 2
                      }
                      className="border border-slate-800 p-2 text-left font-bold text-slate-900"
                    >
                      الإجمالي شامل ضريبة القيمة المضافة
                    </td>
                    <td className="border border-slate-800 p-2 font-bold text-slate-900">
                      69,000 ريال
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Terms */}
          <div className="mb-12">
            <h4 className="text-sm font-bold text-slate-800 mb-2 underline decoration-slate-400 underline-offset-4">
              {template.terms.title}
            </h4>
            <div className="text-xs text-slate-700 leading-loose whitespace-pre-line text-justify">
              {template.terms.text}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center mt-16 pt-8">
            {template.signatures.showClient && (
              <div>
                <p className="text-xs font-bold text-slate-800 mb-12">
                  {template.signatures.clientLabel}
                </p>
                <div className="border-b border-slate-400 w-2/3 mx-auto"></div>
              </div>
            )}
            {template.signatures.showOffice && (
              <div>
                <p className="text-xs font-bold text-slate-800 mb-12">
                  {template.signatures.officeLabel}
                </p>
                <div className="border-b border-slate-400 w-2/3 mx-auto"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // حالة التحميل أثناء الجلب
  if (isFetching) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
        <span className="ml-4 font-bold text-slate-600">
          جاري تحميل بيانات القالب...
        </span>
      </div>
    );
  }

  // ==========================================
  // 4. الواجهة الرئيسية
  // ==========================================
  return (
    <div className="flex h-screen bg-white" dir="rtl">
      {/* Editor Panel */}
      <div className="w-[450px] border-l border-slate-200 flex flex-col bg-slate-50/50 shadow-lg z-10">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Layout className="w-5 h-5 text-violet-600" />{" "}
              {templateId ? "تعديل النموذج" : "محرر النماذج المتقدم"}
            </h2>
            {templateId && (
              <span className="px-2 py-0.5 bg-violet-100 text-violet-700 font-mono text-[10px] rounded-lg">
                {templateId}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            قم بتخصيص هيكل عرض السعر وسيطبق ديناميكياً
          </p>
        </div>

        {/* Tabs */}
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

        {/* Content */}
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
                  className="w-full p-2.5 text-sm border border-slate-300 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-200 outline-none"
                />
              </div>
              <div className="p-4 bg-white border border-slate-200 rounded-xl">
                <label className="block text-xs font-bold text-slate-700 mb-3 flex items-center gap-2">
                  <Type className="w-4 h-4 text-violet-600" /> صياغة فقرة
                  المقدمة
                </label>
                <div className="mb-3 p-3 bg-violet-50 rounded-lg border border-violet-100">
                  <p className="text-[10px] font-bold text-violet-800 mb-2">
                    إدراج بيانات ديناميكية (تُسحب من المعاملة):
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {DYNAMIC_VARIABLES.map((v) => (
                      <button
                        key={v.value}
                        onClick={() => insertVariable("text", v.value)}
                        className="px-2 py-1 bg-white text-violet-700 text-[10px] font-bold border border-violet-200 rounded hover:bg-violet-600 hover:text-white transition-colors"
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
                  className="w-full p-3 text-sm border border-slate-300 rounded-xl focus:border-violet-500 outline-none resize-y"
                />
              </div>
            </div>
          )}

          {/* Table Tab */}
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

        {/* Action Buttons */}
        <div className="p-5 border-t border-slate-200 bg-white">
          <button
            onClick={handleSaveTemplate}
            disabled={saveMutation.isPending}
            className="w-full py-3 bg-violet-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20 hover:bg-violet-700 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {templateId ? "حفظ التعديلات" : "حفظ وإعتماد النموذج"}
          </button>
        </div>
      </div>

      <A4Preview />
    </div>
  );
}
