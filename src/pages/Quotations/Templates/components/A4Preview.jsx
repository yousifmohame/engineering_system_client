import React from "react";

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

  let previewIntroText = template.intro.text;
  Object.keys(dummyData).forEach((key) => {
    previewIntroText = previewIntroText.replace(
      new RegExp(`{{${key}}}`, "g"),
      dummyData[key]
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
            <h1 className="font-bold text-sm text-slate-800">بلاك كيوب للإستشارات الهندسية</h1>
            <h2 className="text-[10px] text-slate-500 uppercase tracking-widest">Black Cube Engineering</h2>
          </div>
          <div className="text-left mt-2">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{template.header.documentTitle}</h3>
            {template.header.showDate && (
              <p className="text-xs text-slate-600">التاريخ : {dummyData.date}</p>
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
          <p className="text-xs leading-relaxed text-slate-700 text-justify">{previewIntroText}</p>
        </div>

        {/* Table */}
        <div className="mb-8">
          <table className="w-full border-collapse border border-slate-800 text-xs text-center">
            <thead>
              <tr className="bg-slate-100 font-bold">
                <th className="border border-slate-800 p-2 w-8">م</th>
                <th className="border border-slate-800 p-2 text-right">الوصف</th>
                {template.table.showUnit && <th className="border border-slate-800 p-2 w-16">الوحدة</th>}
                {template.table.showQuantity && <th className="border border-slate-800 p-2 w-16">الكمية</th>}
                {template.table.showUnitPrice && <th className="border border-slate-800 p-2 w-20">سعر الوحدة</th>}
                <th className="border border-slate-800 p-2 w-24">الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-slate-800 p-2">1</td>
                <td className="border border-slate-800 p-2 text-right">المخططات المعمارية حسب كود البناء السعودي</td>
                {template.table.showUnit && <td className="border border-slate-800 p-2">-</td>}
                {template.table.showQuantity && <td className="border border-slate-800 p-2">-</td>}
                {template.table.showUnitPrice && <td className="border border-slate-800 p-2">-</td>}
                <td className="border border-slate-800 p-2">-</td>
              </tr>
              {/* Financials Logic... */}
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
              <p className="text-xs font-bold text-slate-800 mb-12">{template.signatures.clientLabel}</p>
              <div className="border-b border-slate-400 w-2/3 mx-auto"></div>
            </div>
          )}
          {template.signatures.showOffice && (
            <div>
              <p className="text-xs font-bold text-slate-800 mb-12">{template.signatures.officeLabel}</p>
              <div className="border-b border-slate-400 w-2/3 mx-auto"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}