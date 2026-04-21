import React from "react";
import { Building2, ShieldCheck } from "lucide-react";
import QRCode from "react-qr-code"; // 💡 استيراد مكتبة الـ QR Code الحقيقية

export default function MeetingMinutePreview({
  minute,
  transaction,
  zoom = 1,
  isInternal = false,
}) {
  // تجهيز المتغيرات بأمان
  const serialNumber = minute?.referenceNumber || minute?.id || "MM-000-000";
  const meetingDate = minute?.meetingDate || "غير محدد";
  const footerText =
    "يُعتبر هذا المحضر مسودة عمل ما لم يتم اعتماده وتوقيعه من قبل جميع الأطراف المعنية. في حال عدم استلام أي ملاحظات خلال 3 أيام، يُعتبر معتمداً.";

  // حساب التكبير لضبط الهوامش في المعاينة
  const marginBottom = zoom !== 1 ? `-${(1 - zoom) * 297}mm` : "0";

  // استخراج الإعدادات
  const signatureSettings = minute?.advancedSignatureSettings || {};
  const showStamp =
    minute?.printSettings?.showPrintStamp !== false &&
    signatureSettings.stampType !== "none";
  const showQR = minute?.verification?.qrSettings?.enabled !== false;
  const signingParties = signatureSettings.signingParties || "both";

  // 💡 تجهيز رابط التحقق الحقيقي الذي سيُقرأ عند مسح الـ QR
  // يمكنك تغيير window.location.origin إلى الدومين الحقيقي الخاص بك إذا كنت تطبع من الخادم
  const verificationUrl = minute?.verificationToken
    ? `${window.location.origin}/verify/${minute.verificationToken}`
    : `${window.location.origin}/verify/unverified`;

  return (
    <div
      id="printable-minute-a4"
      className="origin-top transition-transform duration-300 shadow-2xl print:shadow-none print:m-0 flex flex-col items-center"
      style={{
        transform: `scale(${zoom})`,
        marginBottom: marginBottom,
      }}
    >
      {/* 📄 ورقة A4 */}
      <div
        className="bg-white mx-auto relative flex flex-col font-sans print:shadow-none print:m-0 w-full sm:w-[210mm] print:w-[210mm]"
        dir="rtl"
        style={{
          minHeight: "297mm",
          fontFamily: "Arial, Helvetica, sans-serif",
          padding: "15mm 15mm 10mm",
          boxSizing: "border-box",
        }}
      >
        {/* إعدادات الطباعة المدمجة */}
        <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            body { counter-reset: page; }
            .css-page-number::before {
              counter-increment: page;
              content: counter(page);
            }
          }
        `}</style>

        {/* 🛡️ الختم المائي (حسب الإعدادات) */}
        {showStamp && (
          <div className="absolute top-32 left-16 opacity-30 pointer-events-none z-0 print:opacity-50">
            <div className="w-32 h-32 border-4 border-indigo-600 rounded-full flex flex-col items-center justify-center -rotate-12 bg-transparent">
              <span className="text-xs font-black text-indigo-700 tracking-widest uppercase">
                مكتب معتمد
              </span>
              <span className="text-lg font-black text-indigo-800 my-0.5">
                صورة رسمية
              </span>
              <span className="text-[8px] font-bold text-indigo-600 font-mono">
                {serialNumber}
              </span>
            </div>
          </div>
        )}

        <table className="w-full h-full border-collapse relative z-10">
          <thead className="print:table-header-group">
            <tr>
              <td className="p-0 border-none m-0">
                <div className="absolute top-4 right-4 text-[9px] font-black uppercase text-slate-300 print:hidden tracking-widest pl-4">
                  محضر اجتماع - A4 DOCUMENT VIEW
                </div>
                <div className="h-6"></div>
              </td>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="p-0 border-none m-0 align-top">
                <div className="flex-1 w-full relative">
                  <div className="relative h-full" dir="rtl">
                    {/* =======================================
                        1. الترويسة (Header & Basic Info)
                        ======================================= */}
                    <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8 mt-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center font-black text-white text-xl">
                          LOGO
                        </div>
                        <div>
                          <h1 className="text-3xl font-black text-slate-900 mb-2 font-sans flex items-center gap-2">
                            محضر اجتماع
                            {isInternal && (
                              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-300 rounded px-2 py-0.5 font-bold">
                                نسخة داخلية
                              </span>
                            )}
                          </h1>
                          <p
                            className="text-sm font-bold text-slate-600 font-sans max-w-sm truncate"
                            title={minute?.title}
                          >
                            {minute?.title || "عنوان المحضر"}
                          </p>
                        </div>
                      </div>
                      <div className="text-left text-sm space-y-1 font-sans">
                        <p>
                          <span className="font-bold text-slate-500">
                            رقم المحضر:
                          </span>{" "}
                          <span className="font-black font-mono">
                            {serialNumber}
                          </span>
                        </p>
                        <p>
                          <span className="font-bold text-slate-500">
                            التاريخ:
                          </span>{" "}
                          <span className="font-black">{meetingDate}</span>
                        </p>
                        <p>
                          <span className="font-bold text-slate-500">
                            الحالة:
                          </span>{" "}
                          <span className="font-black">
                            {minute?.status || "مسودة"}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 text-sm font-sans relative">
                      {transaction?.processingEntities?.length > 0 && (
                        <div className="col-span-2 mb-2 bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-3">
                          <Building2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-black text-indigo-900">
                              جهة المعالجة (الارتباط الحكومي)
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {transaction.processingEntities.map(
                                (entity, i) => (
                                  <span
                                    key={i}
                                    className={`px-2 py-1 rounded text-[10px] font-bold ${entity.isPrimary ? "bg-indigo-600 text-white" : "bg-white text-indigo-700 border border-indigo-200"}`}
                                  >
                                    {entity.name}
                                    <span className="opacity-70 text-[9px] mr-1 font-normal">
                                      (
                                      {entity.status === "مؤكدة"
                                        ? "مؤكدة"
                                        : "غير ملزمة"}
                                      )
                                    </span>
                                  </span>
                                ),
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">
                          نوع وصفة الاجتماع:
                        </span>{" "}
                        <span className="font-black">
                          {minute?.meetingType || "غير محدد"} -{" "}
                          {minute?.meetingCapacity || "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">
                          التسلسل:
                        </span>{" "}
                        <span className="font-black">
                          {minute?.isFollowUp ? "متابعة" : "أولي"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">
                          وقت البداية:
                        </span>{" "}
                        <span className="font-black">
                          {minute?.startTime || "--:--"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">
                          وقت النهاية:
                        </span>{" "}
                        <span className="font-black">
                          {minute?.endTime || "--:--"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">
                          طريقة/مكان الاجتماع:
                        </span>{" "}
                        <span className="font-black">
                          {minute?.channel || "غير محدد"} -{" "}
                          {minute?.location || "غير محدد"}
                        </span>
                      </div>
                      <div>
                        <span className="font-bold text-slate-500 block mb-1">
                          العميل / ممثل العميل:
                        </span>{" "}
                        <span className="font-black">
                          {minute?.clientName || "غير محدد"}
                        </span>
                      </div>
                      {minute?.requester && (
                        <div>
                          <span className="font-bold text-slate-500 block mb-1">
                            الجهة الطالبة:
                          </span>{" "}
                          <span className="font-black">{minute.requester}</span>
                        </div>
                      )}
                      {minute?.transactionId && (
                        <div>
                          <span className="font-bold text-slate-500 block mb-1">
                            رقم المعاملة:
                          </span>
                          <span className="font-black font-mono text-indigo-700 bg-indigo-50 px-1 rounded">
                            {minute.transactionRef || minute.transactionId}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* =======================================
                        2. قائمة الحضور (Attendees)
                        ======================================= */}
                    <div className="mb-8 font-sans break-inside-avoid">
                      <h2 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-200 pb-2">
                        قائمة الحضور
                      </h2>
                      <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <th className="p-2 text-right">الاسم</th>
                            <th className="p-2 text-right">الجهة</th>
                            <th className="p-2 text-right">الصفة</th>
                            <th className="p-2 text-right">طريقة الحضور</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {minute?.attendees?.length > 0 ? (
                            minute.attendees.map((a) => (
                              <tr key={a.id}>
                                <td className="p-2 font-black">{a.name}</td>
                                <td className="p-2">{a.entity}</td>
                                <td className="p-2 text-slate-600">{a.role}</td>
                                <td className="p-2 text-slate-600">
                                  {a.attendanceMethod}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-slate-400 font-bold"
                              >
                                لا يوجد حضور مسجل
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* =======================================
                        3. المحاور والمخرجات (Axes & Content)
                        ======================================= */}
                    {minute?.axes && minute.axes.length > 0 && (
                      <div className="mb-8 space-y-6 font-sans">
                        {minute.axes.map((axis, index) => (
                          <div
                            key={axis.id}
                            className="border border-slate-200 rounded-xl overflow-hidden page-break-inside-avoid shadow-sm print:shadow-none print:border-slate-300"
                          >
                            <div className="bg-slate-100 p-3 border-b border-slate-200 flex justify-between items-center print:bg-slate-50">
                              <h2 className="text-base font-black text-slate-900">
                                محور {index + 1}: {axis.title}
                              </h2>
                            </div>
                            <div className="p-4 space-y-6">
                              {/* طلبات وردود */}
                              {(axis.clientRequests?.filter((r) => r.trim())
                                .length > 0 ||
                                axis.companyResponses?.filter((r) => r.trim())
                                  .length > 0) && (
                                <div className="grid grid-cols-2 gap-4">
                                  {axis.clientRequests?.filter((r) => r.trim())
                                    .length > 0 && (
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>{" "}
                                        نقاشات وطلبات العميل
                                      </h3>
                                      <ul className="text-xs list-disc list-inside space-y-1 text-slate-700 font-medium">
                                        {axis.clientRequests
                                          .filter((r) => r.trim())
                                          .map((req, i) => (
                                            <li
                                              key={i}
                                              className="leading-relaxed"
                                            >
                                              {req}
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  )}
                                  {axis.companyResponses?.filter((r) =>
                                    r.trim(),
                                  ).length > 0 && (
                                    <div>
                                      <h3 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{" "}
                                        إفادات الشركة
                                      </h3>
                                      <ul className="text-xs list-disc list-inside space-y-1 text-slate-700 font-medium">
                                        {axis.companyResponses
                                          .filter((r) => r.trim())
                                          .map((res, i) => (
                                            <li
                                              key={i}
                                              className="leading-relaxed"
                                            >
                                              {res}
                                            </li>
                                          ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* المخرجات النهائية */}
                              {axis.outcomes && axis.outcomes.length > 0 && (
                                <div className="border-t border-slate-100 pt-4">
                                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>{" "}
                                    القرارات والمخرجات
                                  </h3>
                                  <div className="space-y-3">
                                    {axis.outcomes.map((outcome) => (
                                      <div
                                        key={outcome.id}
                                        className="bg-slate-50 border border-slate-100 rounded-lg p-3"
                                      >
                                        <div className="flex justify-between items-start mb-2">
                                          <h4 className="font-bold text-sm text-slate-800">
                                            {outcome.title}{" "}
                                            <span className="text-[10px] text-slate-500 font-normal mr-2">
                                              ({outcome.source})
                                            </span>
                                          </h4>
                                          <span
                                            className={`text-[9px] px-2 py-0.5 rounded font-bold ${outcome.status === "منجز" ? "bg-emerald-100 text-emerald-700" : outcome.status === "قيد التنفيذ" ? "bg-amber-100 text-amber-700" : "bg-slate-200 text-slate-600"}`}
                                          >
                                            {outcome.status}
                                          </span>
                                        </div>
                                        <p className="text-slate-800 text-xs whitespace-pre-wrap leading-relaxed font-bold">
                                          {outcome.content}
                                        </p>
                                        {(outcome.responsible ||
                                          outcome.targetDate ||
                                          outcome.dueDate) && (
                                          <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 mt-2 pt-2 border-t border-slate-200/50">
                                            {outcome.responsible && (
                                              <span>
                                                <span className="font-bold text-slate-700">
                                                  المسؤول:
                                                </span>{" "}
                                                {outcome.responsible}
                                              </span>
                                            )}
                                            {outcome.targetDate && (
                                              <span>
                                                <span className="font-bold text-slate-700">
                                                  البدء:
                                                </span>{" "}
                                                {outcome.targetDate}
                                              </span>
                                            )}
                                            {outcome.dueDate && (
                                              <span>
                                                <span className="font-bold text-slate-700">
                                                  الاستحقاق:
                                                </span>{" "}
                                                {outcome.dueDate}
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* =======================================
                        4. الخطوات القادمة (Steps / Action Items)
                        ======================================= */}
                    {minute?.steps && minute.steps.length > 0 && (
                      <div className="mb-8 font-sans break-inside-avoid">
                        <h2 className="text-lg font-black text-slate-900 mb-4 border-b border-slate-200 pb-2">
                          الخطوات والإجراءات التنفيذية
                        </h2>
                        <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                            <tr>
                              <th className="p-2 text-right w-10">م</th>
                              <th className="p-2 text-right">
                                الخطوة / المهمة
                              </th>
                              <th className="p-2 text-right">المسؤول</th>
                              <th className="p-2 text-right">التاريخ</th>
                              <th className="p-2 text-right">الحالة</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {minute.steps.map((step, index) => (
                              <tr key={step.id}>
                                <td className="p-2 font-black text-slate-400">
                                  {index + 1}
                                </td>
                                <td className="p-2 font-black text-slate-800">
                                  {step.description}
                                </td>
                                <td className="p-2 text-slate-600">
                                  {step.responsible || "--"}
                                </td>
                                <td className="p-2 text-slate-600">
                                  {step.deadline || "--"}
                                </td>
                                <td className="p-2">
                                  <span
                                    className={`text-[9px] px-2 py-0.5 rounded font-bold ${step.status === "مكتمل" ? "bg-emerald-100 text-emerald-700" : step.status === "جاري" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}
                                  >
                                    {step.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* =======================================
                        5. المرفقات (Attachments)
                        ======================================= */}
                    {minute?.attachments && minute.attachments.length > 0 && (
                      <div className="mb-8 font-sans break-inside-avoid">
                        <h2 className="text-lg font-black text-slate-900 mb-2 border-b border-slate-200 pb-2">
                          المرفقات المرجعية
                        </h2>
                        <ul className="text-xs list-disc list-inside text-slate-700 font-medium space-y-1">
                          {minute.attachments.map((att, i) => (
                            <li key={i}>
                              {att.name}{" "}
                              <span className="text-[10px] text-slate-400 ml-1">
                                ({att.date})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* =======================================
                        6. الملاحظات الداخلية (تظهر فقط في النسخة الداخلية)
                        ======================================= */}
                    {isInternal && minute?.internalNotes && (
                      <div className="mb-8 p-4 bg-amber-50/50 border border-amber-200 border-dashed rounded-xl font-sans break-inside-avoid">
                        <h2 className="text-sm font-black text-amber-900 mb-2 flex items-center gap-2">
                          ملاحظات فريق العمل (نسخة داخلية محجوبة عن العميل)
                        </h2>
                        <p className="text-xs whitespace-pre-wrap leading-relaxed text-amber-800">
                          {minute.internalNotes}
                        </p>
                      </div>
                    )}

                    {/* =======================================
                        7. قسم التوقيع (Signatures) - ديناميكي حسب الإعدادات
                        ======================================= */}
                    {signatureSettings.signatureType !== "none" && (
                      <div className="mt-12 pt-6 border-t-2 border-slate-800 break-inside-avoid">
                        <div
                          className={`grid gap-8 text-center ${signingParties === "both" ? "grid-cols-2" : "grid-cols-1 max-w-sm mx-auto"}`}
                        >
                          {/* توقيع الطرف الأول (المكتب) */}
                          {(signingParties === "both" ||
                            signingParties === "party1_only" ||
                            signingParties === "company_only") && (
                            <div>
                              <p className="font-black text-[11px] text-slate-800">
                                {signingParties === "company_only"
                                  ? "جهة الإصدار والاعتماد"
                                  : "الطرف الأول (ممثل المكتب)"}
                              </p>
                              <p className="text-[9px] text-slate-500 mt-0.5 mb-6">
                                الاسم والتوقيع
                              </p>
                              <div className="h-16 mx-4 border-b border-slate-300 border-dashed relative flex items-center justify-center">
                                {signatureSettings.signatureType ===
                                "secure" ? (
                                  <span className="text-emerald-600 font-bold text-[10px] border border-emerald-200 bg-emerald-50 px-2 py-1 rounded">
                                    تم الاعتماد والمصادقة الرقمية
                                  </span>
                                ) : (
                                  <span className="text-slate-300 text-xs italic opacity-50 select-none absolute bottom-2">
                                    مساحة التوقيع
                                  </span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* توقيع الطرف الثاني (العميل) */}
                          {(signingParties === "both" ||
                            signingParties === "party2_only") && (
                            <div>
                              <p className="font-black text-[11px] text-slate-800">
                                الطرف الثاني (ممثل العميل)
                              </p>
                              <p className="text-[9px] text-slate-500 mt-0.5 mb-6">
                                الاسم والتوقيع
                              </p>
                              <div className="h-16 mx-4 border-b border-slate-300 border-dashed relative flex items-center justify-center">
                                <span className="text-slate-300 text-xs italic opacity-50 select-none absolute bottom-2">
                                  مساحة التوقيع
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* بيان التوثيق (إذا كان مفعلاً) */}
                        {signatureSettings.showAuthStatement &&
                          signatureSettings.authStatementText && (
                            <div className="mt-8 text-center text-[10px] text-slate-500 font-bold bg-slate-50 p-3 rounded-lg border border-slate-200">
                              {signatureSettings.authStatementText}
                            </div>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tbody>

          {/* =======================================
              8. التذييل الثابت في الطباعة (Footer)
              ======================================= */}
          <tfoot className="print:table-footer-group">
            <tr>
              <td className="p-0 border-none m-0 align-bottom h-32 pt-8">
                <div className="border-t border-slate-200 pt-6 flex justify-between items-end text-[10px] text-slate-500 font-sans print:border-slate-300 break-inside-avoid">
                  <div className="flex flex-col gap-1 w-1/3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 tracking-tight">
                        الرقم المرجعي:
                      </span>
                      <span className="font-mono text-xs text-slate-900">
                        {serialNumber}
                      </span>
                    </div>
                    <p className="leading-relaxed opacity-75 max-w-xs">
                      {footerText}
                    </p>
                  </div>

                  {/* 💡 مـكـان الـ QR Code الـحـقـيـقـي */}
                  <div className="flex flex-col items-center gap-1 w-1/3">
                    {showQR && (
                      <div className="bg-white p-1.5 border border-slate-200 rounded-lg shadow-sm">
                        {/* توليد الباركود بناءً على الرابط */}
                        <QRCode value={verificationUrl} size={60} level="L" />
                      </div>
                    )}
                    <span className="font-mono text-[9px] tracking-[0.2em] mt-1">
                      {serialNumber}
                    </span>
                  </div>

                  <div className="flex justify-end gap-6 items-end w-1/3">
                    <div className="text-left font-black text-slate-900 border-r-2 border-slate-900 pr-4 h-full flex flex-col justify-center">
                      <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">
                        Page
                      </div>
                      <div className="text-base leading-none print:hidden">
                        1 <span className="text-slate-300 mx-0.5">/</span> 1
                      </div>
                      <div className="text-base leading-none hidden print:block css-page-number"></div>
                    </div>
                  </div>
                </div>

                {/* شريط معلومات الاتصال السفلي */}
                <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <span className="text-slate-400">هاتف:</span>{" "}
                      {minute?.printSettings?.contactPhone || "920000000"}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-slate-400">بريد:</span>{" "}
                      {minute?.printSettings?.contactEmail ||
                        "info@company.com"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/50">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="uppercase tracking-widest text-[8px] font-black">
                      Secure Digital Original
                    </span>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
