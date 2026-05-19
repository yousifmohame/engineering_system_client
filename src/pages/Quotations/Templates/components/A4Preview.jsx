import React from "react";
import { FileText, CalendarDays, Building2, Eye } from "lucide-react";

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

export default function A4Preview({ template }) {
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

  let previewIntroText = template.intro.text || "";
  Object.keys(dummyData).forEach((key) => {
    previewIntroText = previewIntroText.replace(
      new RegExp(`{{${key}}}`, "g"),
      dummyData[key],
    );
  });

  return (
    <div
      className="
        min-h-0 flex-1 overflow-auto
        bg-gradient-to-br from-slate-200 via-slate-100 to-[#fbf8f1]
        p-6 pb-24 custom-scrollbar-slim
      "
      dir="rtl"
    >
      <div className="mx-auto mb-4 flex max-w-[210mm] items-center justify-between gap-3 rounded-[18px] border border-[#d8b46a]/25 bg-white/80 px-3 py-2 shadow-[0_8px_18px_rgba(18,63,89,0.06)] backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#123f59] text-[#e2bf74]">
            <Eye className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-[#123f59]">معاينة A4</p>
            <p className="truncate text-[9px] font-bold text-[#94a3b8]">
              بيانات تجريبية لعرض شكل النموذج النهائي.
            </p>
          </div>
        </div>
        <span className="rounded-xl border border-[#d8b46a]/25 bg-[#fbf8f1] px-2.5 py-1 text-[9px] font-black text-[#64748b]">
          210 × 297 mm
        </span>
      </div>

      <div className="mx-auto w-fit min-w-[794px]">
        <div
          className="relative mx-auto overflow-hidden bg-white shadow-[0_20px_55px_rgba(18,63,89,0.18)]"
          style={{
            width: "210mm",
            minHeight: "297mm",
            padding: "18mm 15mm",
            transformOrigin: "top center",
          }}
        >
        <header className="mb-5 border-b-2 border-[#123f59] pb-4">
          <div className="flex items-start justify-between gap-8">
            <div className="flex items-start gap-3">
              {template.header.showLogo && (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-[#d8b46a]/35 bg-[#fbf8f1] text-center text-[10px] font-black text-[#94a3b8]">
                  Logo
                </div>
              )}

              <div>
                <h1 className="text-sm font-black text-[#123f59]">
                  بلاك كيوب للإستشارات الهندسية
                </h1>
                <h2 className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                  Black Cube Engineering
                </h2>
                <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-[#94a3b8]">
                  <Building2 className="h-3 w-3" />
                  Consulting Engineers
                </div>
              </div>
            </div>

            <div className="text-left">
              <h3 className="mb-2 text-lg font-black text-[#123f59]">
                {template.header.documentTitle}
              </h3>
              {template.header.showDate && (
                <p className="inline-flex items-center gap-1 rounded-lg border border-[#d8b46a]/25 bg-[#fbf8f1] px-2 py-1 text-xs font-bold text-[#64748b]">
                  <CalendarDays className="h-3.5 w-3.5 text-[#c5983c]" />
                  التاريخ: {dummyData.date}
                </p>
              )}
            </div>
          </div>
        </header>

        <section className="mb-5">
          <h4 className="mb-1 text-sm font-black text-[#123f59]">
            {template.intro.addresseePrefix} {dummyData.clientName}
          </h4>
          <p className="mb-3 text-sm font-bold text-[#123f59]">المحترم</p>
          <p className="mb-3 text-sm font-bold text-[#475569]">
            {template.intro.greeting}
          </p>
          <p className="text-justify text-xs font-medium leading-7 text-[#475569]">
            {previewIntroText}
          </p>
        </section>

        <section className="mb-5">
          <div className="mb-2 flex items-center gap-1.5 text-xs font-black text-[#123f59]">
            <FileText className="h-4 w-4 text-[#c5983c]" />
            نطاق العمل والتكاليف
          </div>

          <table className="w-full border-collapse border border-[#123f59] text-center text-xs">
            <thead>
              <tr className="bg-[#123f59] font-black text-white">
                <th className="w-8 border border-[#123f59] p-2">م</th>
                <th className="border border-[#123f59] p-2 text-right">الوصف</th>
                {template.table.showUnit && (
                  <th className="w-16 border border-[#123f59] p-2">الوحدة</th>
                )}
                {template.table.showQuantity && (
                  <th className="w-16 border border-[#123f59] p-2">الكمية</th>
                )}
                {template.table.showUnitPrice && (
                  <th className="w-20 border border-[#123f59] p-2">سعر الوحدة</th>
                )}
                <th className="w-24 border border-[#123f59] p-2">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-700 p-2">1</td>
                <td className="border border-slate-700 p-2 text-right">
                  المخططات المعمارية حسب كود البناء السعودي
                </td>
                {template.table.showUnit && <td className="border border-slate-700 p-2">خدمة</td>}
                {template.table.showQuantity && <td className="border border-slate-700 p-2">1</td>}
                {template.table.showUnitPrice && <td className="border border-slate-700 p-2">—</td>}
                <td className="border border-slate-700 p-2">—</td>
              </tr>
              {template.financials.showSubtotal && (
                <tr className="bg-[#fbf8f1] font-bold">
                  <td className="border border-slate-700 p-2 text-left" colSpan={
                    2 +
                    (template.table.showUnit ? 1 : 0) +
                    (template.table.showQuantity ? 1 : 0) +
                    (template.table.showUnitPrice ? 1 : 0)
                  }>
                    الإجمالي قبل الضريبة
                  </td>
                  <td className="border border-slate-700 p-2">—</td>
                </tr>
              )}
              <tr className="font-bold">
                <td className="border border-slate-700 p-2 text-left" colSpan={
                  2 +
                  (template.table.showUnit ? 1 : 0) +
                  (template.table.showQuantity ? 1 : 0) +
                  (template.table.showUnitPrice ? 1 : 0)
                }>
                  ضريبة القيمة المضافة {template.financials.vatPercentage}%
                </td>
                <td className="border border-slate-700 p-2">—</td>
              </tr>
              {template.financials.showTotal && (
                <tr className="bg-[#123f59] font-black text-white">
                  <td className="border border-[#123f59] p-2 text-left" colSpan={
                    2 +
                    (template.table.showUnit ? 1 : 0) +
                    (template.table.showQuantity ? 1 : 0) +
                    (template.table.showUnitPrice ? 1 : 0)
                  }>
                    الإجمالي النهائي
                  </td>
                  <td className="border border-[#123f59] p-2">—</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="mb-10">
          <h4 className="mb-2 text-sm font-black text-[#123f59] underline decoration-[#c5983c] underline-offset-4">
            {template.terms.title}
          </h4>
          <div className="whitespace-pre-line text-justify text-xs leading-7 text-[#475569]">
            {template.terms.text}
          </div>
        </section>

        <section className="mt-14 grid grid-cols-2 gap-8 text-center">
          {template.signatures.showClient && (
            <div>
              <p className="mb-12 text-xs font-black text-[#123f59]">
                {template.signatures.clientLabel}
              </p>
              <div className="mx-auto w-2/3 border-b border-slate-400" />
            </div>
          )}
          {template.signatures.showOffice && (
            <div>
              <p className="mb-12 text-xs font-black text-[#123f59]">
                {template.signatures.officeLabel}
              </p>
              <div className="mx-auto w-2/3 border-b border-slate-400" />
            </div>
          )}
        </section>
        </div>
      </div>
    </div>
  );
}
