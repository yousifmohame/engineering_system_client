import React from "react";
import { useReport } from "../../context/ReportContext";
import { QrCode } from "lucide-react";

export default function BuilderPreview() {
  const { data } = useReport();

  return (
    <div className="flex-1 bg-slate-200 overflow-y-auto p-4 sm:p-8 flex justify-center items-start print:p-0 print:bg-white custom-scrollbar">
      <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl relative flex flex-col font-sans print:shadow-none print:w-full print:h-auto break-words shrink-0">
        
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 opacity-5">
          <div className="text-[120px] font-black outline-none tracking-widest -rotate-45 text-slate-900">مسودة</div>
        </div>

        {data.settings.showHeaderCover && (
          <div className="h-[35mm] border-b-[4px] border-emerald-700 px-10 flex items-center justify-between relative z-10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-700 text-white flex items-center justify-center rounded-xl font-black text-xl shadow-sm">د</div>
              <div><h1 className="font-black text-slate-900 text-lg">ديتيلز للاستشارات الهندسية</h1><p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Details Engineering Consulting</p></div>
            </div>
            <div className="text-left w-64">
              <h2 className="text-xl font-black text-slate-800 mb-1">تقرير فني هندسي</h2>
              <div className="text-[8px] font-mono font-bold text-slate-500 leading-tight">REP: REP-TECH-2026-0044<br/>SN: OUT-01-R00<br/>DATE: 30/05/2026</div>
            </div>
          </div>
        )}

        <div className="flex-1 px-12 py-10 relative z-10 text-slate-800">
          
          {/* قسم 1: البيانات الأساسية */}
          <div className="mb-6">
            <div className="bg-emerald-800 text-white px-4 py-1.5 text-[12px] font-black flex items-center border border-emerald-900 shadow-sm rounded-t-lg">
              <span className="w-6 h-6 rounded bg-emerald-700 font-mono text-white flex items-center justify-center ml-2 shadow-inner text-[10px]">01</span> البيانات الأساسية للمعاملة
            </div>
            <table className="w-full text-xs border-collapse border-x border-b border-slate-300 shadow-sm rounded-b-lg overflow-hidden">
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="bg-slate-100 border-l border-slate-300 px-4 py-2.5 font-bold w-1/4 text-slate-700">الغرض من التقرير</td>
                  <td className="px-4 py-2.5 font-bold text-emerald-700 bg-emerald-50/30 font-semibold">{data.purpose}</td>
                  <td className="bg-slate-100 border-l border-slate-300 px-4 py-2.5 font-bold w-1/4 text-slate-700">رقم المعاملة</td>
                  <td className="px-4 py-2.5 font-mono text-slate-900 tracking-wider bg-slate-50">TRX-DEFAULT</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="bg-slate-100 border-l border-slate-300 px-4 py-2.5 font-bold text-slate-700">اسم {data.ownerType}</td>
                  <td className="px-4 py-2.5 font-bold text-slate-900 border-l border-slate-300">{data.showOwnerName ? data.ownerName : "******"}</td>
                  <td className="bg-slate-100 border-l border-slate-300 px-4 py-2.5 font-bold text-slate-700">رقم الهوية</td>
                  <td className="px-4 py-2.5 font-mono text-slate-600 tracking-wider bg-slate-50">{data.maskOwnerId ? data.ownerId.replace(/\d(?=\d{4})/g, "*") : data.ownerId}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* قسم 2: بيانات الموقع والملكية */}
          <div className="mb-6">
            <div className="bg-emerald-800 text-white px-4 py-1.5 text-[12px] font-black flex items-center border border-emerald-900 shadow-sm rounded-t-lg">
              <span className="w-6 h-6 rounded bg-emerald-700 font-mono text-white flex items-center justify-center ml-2 shadow-inner text-[10px]">02</span> بيانات الموقع والملكية
            </div>
            <table className="w-full text-[11px] border-collapse border-x border-b border-slate-300 shadow-sm rounded-b-lg overflow-hidden">
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="bg-slate-100 border-l border-slate-300 px-3 py-2.5 font-bold w-[20%]">رقم الصك وتاريخه</td>
                  <td className="px-3 py-2.5 font-mono text-slate-900 border-l border-slate-300 font-semibold w-[30%]">
                    <div className="flex justify-between items-center"><span>{data.deedNumber}</span><span className="text-[10px] text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded font-sans font-bold">{data.deedDate}</span></div>
                  </td>
                  <td className="bg-slate-100 border-l border-slate-300 px-3 py-2.5 font-bold w-[20%] text-slate-700">بيانات الرخصة</td>
                  <td className="px-3 py-2.5 font-bold text-emerald-700 bg-emerald-50/20 w-[30%]">{data.licenseStatus}</td>
                </tr>
                <tr>
                  <td className="bg-slate-100 border-l border-slate-300 px-3 py-2.5 font-bold text-slate-700">الموقع (حي / مخطط)</td>
                  <td className="px-3 py-2.5 border-l border-slate-300 text-slate-800 font-medium">{data.district} <span className="text-slate-400 mx-1">|</span> مخطط {data.planNumber}</td>
                  <td className="bg-slate-100 border-l border-slate-300 px-3 py-2.5 font-bold text-slate-700">القطعة</td>
                  <td className="px-3 py-2.5 text-slate-800 font-medium">رقم {data.plotNumber}</td>
                </tr>
                <tr className="bg-amber-50/10">
                  <td className="bg-slate-100 border-l border-slate-300 px-3 py-2.5 font-bold text-slate-800">مساحة الصك (م²)</td>
                  <td className="px-3 py-2.5 font-mono font-black text-slate-900 border-l border-slate-300 bg-white text-base text-center">{data.areaDeed}</td>
                  <td className="bg-amber-100/50 border-l border-amber-200 px-3 py-2.5 font-bold text-amber-900">مساحة الطبيعة (م²)</td>
                  <td className="px-3 py-2.5 font-mono font-black text-amber-700 bg-amber-50 text-base shadow-inner text-center">{data.areaSite}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* قسم 3: المكونات */}
          <div className="mb-6">
            <div className="bg-emerald-800 text-white px-4 py-1.5 text-[12px] font-black flex items-center border border-emerald-900 shadow-sm rounded-t-lg">
              <span className="w-6 h-6 rounded bg-emerald-700 font-mono text-white flex items-center justify-center ml-2 shadow-inner text-[10px]">03</span> تفصيل مكونات المبنى والمقارنة
            </div>
            <div className="border border-slate-300 shadow-sm rounded-b-lg overflow-hidden">
              <table className="w-full text-[11px] border-collapse text-center">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="px-2 py-2 border-b border-l border-slate-300 w-[12%] bg-slate-200/50">المستوى</th>
                    <th className="px-2 py-2 border-b border-l border-slate-300 w-[24%] text-right bg-slate-200/50">طبيعة المكون</th>
                    <th className="px-0 py-0 border-b border-l border-slate-300 align-top" colSpan="3">
                      <div className="border-b border-slate-200 py-1.5 bg-slate-50 w-full font-black text-center text-[10px]">بيان المساحات (م²)</div>
                      <div className="grid grid-cols-3 gap-0 text-[10px] items-stretch">
                        <div className="border-l border-slate-200 py-1.5">القائم</div>
                        <div className="border-l border-slate-200 py-1.5">المرخص</div>
                        <div className="text-emerald-700 font-black bg-emerald-100/50 py-1.5 border-b-2 border-emerald-500">المقترح</div>
                      </div>
                    </th>
                    <th className="px-2 py-2 border-b border-r border-slate-400 w-[24%] text-right bg-slate-200/50">ملاحظات والتطابق</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium bg-white">
                  {data.components.map((comp, idx) => (
                    <tr key={comp.id} className={idx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                      <td className="px-2 py-2.5 border-l border-slate-200 font-black text-slate-800">{comp.level}</td>
                      <td className="px-3 py-2.5 border-l border-slate-200 text-right text-slate-700 font-bold">{comp.usage}</td>
                      <td className="px-0 py-0 border-l border-slate-200" colSpan="3">
                        <div className="grid grid-cols-3 h-full divide-x divide-x-reverse divide-slate-100">
                          <div className="py-2.5 font-mono text-slate-600">{comp.site}</div>
                          <div className="py-2.5 font-mono text-slate-500">{comp.license}</div>
                          <div className="py-2.5 font-mono text-emerald-700 font-black bg-emerald-50/50">{comp.proposed}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right bg-gradient-to-l from-transparent to-amber-50/30 border-r border-slate-200">
                        <div className="text-[10px] text-amber-900 font-bold leading-relaxed">{comp.notes}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* قسم 4: المطابقة */}
          <div className="mb-6">
            <div className="bg-emerald-800 text-white px-4 py-1.5 text-[12px] font-black flex items-center border border-emerald-900 shadow-sm rounded-t-lg">
              <span className="w-6 h-6 rounded bg-emerald-700 font-mono text-white flex items-center justify-center ml-2 shadow-inner text-[10px]">04</span> نتائج المطابقة والتحقق
            </div>
            <div className="border border-slate-300 shadow-sm rounded-b-lg overflow-hidden bg-white">
              <table className="w-full text-[11px] border-collapse text-right">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr><th className="px-3 py-2 border-b border-l border-slate-300 w-[50%] bg-slate-200/50">بند المطابقة والتحقق</th><th className="px-3 py-2 border-b border-slate-300 w-[50%] text-center bg-slate-200/50">النتيجة</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  <tr><td className="px-3 py-2.5 border-l border-slate-200 text-slate-800 font-bold">تطابق اسم المالك مع الصك</td><td className={`px-3 py-2.5 text-center font-bold ${data.compliance.nameMatch==='مطابق'?'text-emerald-700 bg-emerald-50/50':'text-amber-700 bg-amber-50/50'}`}>{data.compliance.nameMatch}</td></tr>
                  <tr><td className="px-3 py-2.5 border-l border-slate-200 text-slate-800 font-bold">تطابق المخطط والقطعة</td><td className={`px-3 py-2.5 text-center font-bold ${data.compliance.plotMatch==='مطابق'?'text-emerald-700 bg-emerald-50/50':'text-amber-700 bg-amber-50/50'}`}>{data.compliance.plotMatch}</td></tr>
                  <tr><td className="px-3 py-2.5 border-l border-slate-200 text-slate-800 font-bold">تطابق المساحات (صك/طبيعة/رخصة)</td><td className={`px-3 py-2.5 text-center font-bold ${data.compliance.areaMatch==='مطابق'?'text-emerald-700 bg-emerald-50/50':data.compliance.areaMatch==='غير مطابق'?'text-rose-700 bg-rose-50/50':'text-amber-700 bg-amber-50/50'}`}>{data.compliance.areaMatch}</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* قسم 5: الملاحظات */}
          <div className="mb-8">
            <div className="bg-emerald-800 text-white px-4 py-1.5 text-[12px] font-black flex items-center border border-emerald-900 shadow-sm rounded-t-lg">
              <span className="w-6 h-6 rounded bg-emerald-700 font-mono text-white flex items-center justify-center ml-2 shadow-inner text-[10px]">05</span> الإفادة والملاحظات الفنية للمطابقة
            </div>
            <div className="border border-slate-300 border-t-0 p-5 rounded-b-lg text-[11px] leading-loose text-slate-800 text-justify bg-white shadow-sm relative overflow-hidden whitespace-pre-wrap">
              <div className="absolute top-0 right-0 w-1 h-full bg-slate-400"></div>
              {data.technicalNotes}
            </div>
          </div>

          {/* الختم والتوقيع */}
          <div className="flex justify-between items-end mt-12">
            {data.settings.showQR && (
              <div className="w-24 border border-slate-200 p-2 rounded flex flex-col items-center justify-center text-center bg-white shadow-sm">
                <QrCode className="w-16 h-16 text-slate-800 mb-1" />
                <span className="text-[6px] font-mono font-black uppercase text-slate-500">Scan to Verify</span>
              </div>
            )}
            <div className="text-center w-48 relative ml-auto">
              <p className="text-[10px] font-black mb-10 text-slate-600">اعتماد المهندس المختص</p>
              <p className="text-xs font-bold text-slate-900 border-t border-slate-300 pt-2">م. عبدالمجيد محمد</p>
            </div>
          </div>
        </div>

        {data.settings.showFooterInner && (
          <div className="border-t border-slate-200 bg-slate-50 px-10 py-4 flex items-center justify-between text-[8px] text-slate-500 font-bold shrink-0 mt-auto">
            <div>المملكة العربية السعودية - مدينة الرياض - صندوق بريد 12345</div>
            <div className="font-mono">www.details.sa | DOC: TPL-TECH-STD-01</div>
            <div>الصفحة 1 من 1</div>
          </div>
        )}
      </div>
    </div>
  );
}