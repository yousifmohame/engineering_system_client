import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios";
import {
  Printer,
  FileDown,
  Loader2,
  Sparkles,
  Clock,
  CalendarDays,
  User,
  Briefcase,
  FileSpreadsheet,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

// 💡 استدعاء مودال التوثيق
import NewDocumentationModal from "../../../../ElectronicDocumentation/tabs/NewDocumentationModal";

export default function ReportsTab() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState(firstDay);
  const [endDate, setEndDate] = useState(lastDay);

  // 💡 حالات الـ Loading المنفصلة
  const [isGeneratingDoc, setIsGeneratingDoc] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // 💡 حالات مودال الختم
  const [isStampingModalOpen, setIsStampingModalOpen] = useState(false);
  const [generatedPdfFile, setGeneratedPdfFile] = useState(null);

  const reportRef = useRef(null);

  const { data: employees = [] } = useQuery({
    queryKey: ["employees-list"],
    queryFn: async () => {
      const res = await api.get("/employees");
      return res.data?.data || res.data || [];
    },
  });

  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0].id);
    }
  }, [employees]);

  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ["attendance-report", selectedEmployee, startDate, endDate],
    queryFn: async () => {
      if (!selectedEmployee) return null;
      const res = await api.get(
        `/attendance/report?employeeId=${selectedEmployee}&startDate=${startDate}&endDate=${endDate}`,
      );
      return res.data.data;
    },
    enabled: !!selectedEmployee,
  });

  const paginateLogs = (logs) => {
    if (!logs || logs.length === 0) return [[]];
    const pages = [];
    const FIRST_PAGE_ROWS = 12;
    const OTHER_PAGES_ROWS = 28;

    if (logs.length <= FIRST_PAGE_ROWS) {
      pages.push(logs);
    } else {
      pages.push(logs.slice(0, FIRST_PAGE_ROWS));
      let remainingLogs = logs.slice(FIRST_PAGE_ROWS);
      while (remainingLogs.length > 0) {
        pages.push(remainingLogs.slice(0, OTHER_PAGES_ROWS));
        remainingLogs = remainingLogs.slice(OTHER_PAGES_ROWS);
      }
    }
    return pages;
  };

  const pages = reportData ? paginateLogs(reportData.logs) : [];

  // 🚀 دالة توليد الـ PDF المشتركة (للختم والطباعة)
  const createPdfDocument = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageElements = document.querySelectorAll(".pdf-page-capture");

    // التقاط الصفحات بدقة عالية جداً لمنع التشويه
    for (let i = 0; i < pageElements.length; i++) {
      const canvas = await html2canvas(pageElements[i], {
        scale: 2, // دقة ممتازة لـ PDF
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);

      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }
    return pdf;
  };

  // 🖨️ دالة الطباعة الاحترافية الجديدة (تحول لـ PDF ثم تطبع)
  const handlePrint = async () => {
    setIsPrinting(true);
    const toastId = toast.loading("جاري تجهيز وثيقة الـ PDF للطباعة...");

    try {
      const pdf = await createPdfDocument();
      // تحويل الـ PDF إلى رابط مؤقت (Blob URL)
      const pdfBlob = pdf.output("blob");
      const blobUrl = URL.createObjectURL(pdfBlob);

      // فتح الـ PDF في نافذة جديدة للطباعة
      window.open(blobUrl, "_blank");

      toast.success("تم التجهيز! يمكنك الآن طباعة المستند", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تجهيز الطباعة", { id: toastId });
    } finally {
      setIsPrinting(false);
    }
  };

  // 🛡️ دالة تحويل الـ HTML إلى PDF وتمريره لشاشة الختم
  const generatePDFAndStamp = async () => {
    setIsGeneratingDoc(true);
    const toastId = toast.loading(
      "جاري معالجة التقرير وتحويله إلى وثيقة PDF رقمية...",
    );

    try {
      const pdf = await createPdfDocument();
      const pdfBlob = pdf.output("blob");
      const fileName = `Timesheet_${reportData.employee.name}_${startDate}.pdf`;
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      setGeneratedPdfFile(file);
      toast.success("تم تجهيز الوثيقة! جاري تحويلك لشاشة الاعتماد والختم 🛡️", {
        id: toastId,
      });

      setIsStampingModalOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء تحويل التقرير إلى PDF", { id: toastId });
    } finally {
      setIsGeneratingDoc(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "PRESENT":
      case "PRESENT_FLEX":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "ABSENT":
        return "text-rose-700 bg-rose-50 border-rose-200";
      case "WEEKEND":
        return "text-slate-500 bg-slate-100 border-slate-200";
      case "ON_LEAVE":
        return "text-blue-700 bg-blue-50 border-blue-200";
      case "PUBLIC_HOLIDAY":
        return "text-purple-700 bg-purple-50 border-purple-200";
      default:
        return "text-slate-700 bg-slate-50 border-slate-200";
    }
  };

  const translateStatus = (status) => {
    switch (status) {
      case "PRESENT":
        return "حضور (ثابت)";
      case "PRESENT_FLEX":
        return "حضور (مرن)";
      case "ABSENT":
        return "غياب";
      case "WEEKEND":
        return "يوم راحة";
      case "ON_LEAVE":
        return "إجازة معتمدة";
      case "PUBLIC_HOLIDAY":
        return "إجازة رسمية";
      default:
        return status;
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6 h-full max-w-[1600px] mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo">
        {/* ── Options Panel (No Print & Added Scroll) ── */}
        <div className="w-full lg:w-80 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm shrink-0 flex flex-col relative overflow-hidden print:hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 opacity-60"></div>

          <div className="p-6 border-b border-slate-200/60 shrink-0">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> خيارات
              التقرير الذكي
            </h3>
          </div>

          {/* 🚀 السكرول الجانبي (Scrollable Options Area) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">
                نوع التقرير
              </label>
              <select className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm">
                <option value="employee">مفصل لموظف (AI Timesheet)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">
                اختر الموظف
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  من تاريخ
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-700 mb-2">
                  إلى تاريخ
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-[11px] font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-200/60 bg-slate-50/50 shrink-0 space-y-3 relative z-10">
            {/* 🖨️ زر الطباعة المحدث (يعتمد على הـ PDF Engine) */}
            <button
              onClick={handlePrint}
              disabled={isReportLoading || !reportData || isPrinting}
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isPrinting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              معاينة وطباعة PDF
            </button>

            {/* 🚀 زر التوثيق والختم */}
            <button
              onClick={generatePDFAndStamp}
              disabled={isReportLoading || !reportData || isGeneratingDoc}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isGeneratingDoc ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
              )}
              تحويل لوثيقة واعتماد أمني
            </button>
          </div>
        </div>

        {/* ── Print Preview Panel ── */}
        <div className="flex-1 bg-slate-200/50 rounded-3xl border border-slate-300 shadow-inner p-4 sm:p-8 overflow-y-auto relative flex justify-center custom-scrollbar print:hidden">
          {isReportLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-indigo-600 print:hidden">
              <Loader2 className="w-12 h-12 animate-spin mb-4" />
              <span className="font-black text-lg">
                جاري معالجة بيانات التايم شيت...
              </span>
            </div>
          ) : !reportData ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold print:hidden">
              <FileSpreadsheet className="w-16 h-16 mb-4 opacity-30" />
              الرجاء تحديد موظف وفترة لعرض التقرير.
            </div>
          ) : (
            <div
              ref={reportRef}
              className="flex flex-col gap-8 w-full max-w-[210mm]"
            >
              <div className="fixed top-4 left-6 border border-slate-300 text-slate-400 bg-white/50 backdrop-blur rounded-lg px-2 py-1 text-[8px] font-mono tracking-widest uppercase print:hidden z-10 shadow-sm pointer-events-none">
                Smart PDF Preview ({pages.length} Pages)
              </div>

              {/* 📄 حلقة تكرار لرسم الصفحات (Pagination) - كلاس pdf-page-capture هام جداً للالتقاط */}
              {pages.map((pageRows, pageIndex) => {
                const isFirstPage = pageIndex === 0;
                const isLastPage = pageIndex === pages.length - 1;

                return (
                  <div
                    key={pageIndex}
                    className="pdf-page-capture w-full h-[297mm] bg-white shadow-xl border border-slate-200 relative shrink-0 flex flex-col p-8 sm:p-10"
                  >
                    {/* الهوامش الجانبية */}
                    <div className="absolute top-0 bottom-0 left-2 w-4 border-r border-slate-100 flex items-center justify-center">
                      <span className="text-[7px] text-slate-300 -rotate-90 whitespace-nowrap font-mono tracking-widest uppercase">
                        GENERATED BY EARTH AI HR ENGINE
                      </span>
                    </div>
                    <div className="absolute top-0 bottom-0 right-2 w-4 border-l border-slate-100 flex items-center justify-center">
                      <span className="text-[7px] text-slate-300 rotate-90 whitespace-nowrap tracking-widest">
                        تاريخ الاستخراج:{" "}
                        {new Date().toLocaleDateString("en-GB")} | صفحة{" "}
                        {pageIndex + 1} من {pages.length}
                      </span>
                    </div>

                    <div className="flex-1 px-2 sm:px-6 flex flex-col z-10">
                      {isFirstPage && (
                        <>
                          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-2xl shadow-sm">
                                <span className="font-black text-xl">
                                  إيـرث
                                </span>
                              </div>
                              <div>
                                <h1 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                                  التايم شيت الذكي{" "}
                                  <Sparkles className="w-4 h-4 text-amber-500" />
                                </h1>
                                <p className="text-xs font-bold text-slate-500">
                                  مستخرج رسمي من محرك الموارد البشرية
                                </p>
                              </div>
                            </div>
                            <div className="text-left font-mono text-[10px] text-slate-600 space-y-1">
                              <div className="font-black text-slate-900 text-xs">
                                REF: TS-{startDate}-
                                {reportData.employee.employeeCode || "000"}
                              </div>
                              <div>
                                Gregorian:{" "}
                                {new Date().toLocaleDateString("en-GB")}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            <div className="col-span-2 sm:col-span-2">
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1">
                                <CalendarDays className="w-3 h-3" /> فترة
                                التقرير
                              </span>
                              <span className="text-sm font-black text-slate-900">
                                {startDate} إلى {endDate}
                              </span>
                            </div>
                            <div className="col-span-2 sm:col-span-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100">
                              <span className="text-[10px] text-indigo-700 font-black flex items-center gap-1 mb-1">
                                <Clock className="w-3 h-3" /> سياسة الدوام
                                המطبقة
                              </span>
                              <span className="text-sm font-black text-indigo-900">
                                {reportData.employee.shiftType === "FLEXIBLE"
                                  ? `مرن (${reportData.employee.requiredDailyHours} ساعات يومياً)`
                                  : `ثابت (${reportData.employee.shiftStartTime} - ${reportData.employee.shiftEndTime})`}
                              </span>
                            </div>

                            <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1">
                                <User className="w-3 h-3" /> اسم الموظف
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                {reportData.employee.name}
                              </span>
                            </div>
                            <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                                الرقم الوظيفي
                              </span>
                              <span className="text-xs font-black text-slate-900 font-mono">
                                {reportData.employee.employeeCode || "-"}
                              </span>
                            </div>
                            <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                              <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1">
                                <Briefcase className="w-3 h-3" /> القسم
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                {reportData.employee.department}
                              </span>
                            </div>
                            <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                              <span className="text-[10px] text-slate-500 font-bold block mb-1">
                                المسمى الوظيفي
                              </span>
                              <span className="text-xs font-black text-slate-900">
                                {reportData.employee.position}
                              </span>
                            </div>
                          </div>
                        </>
                      )}

                      <table className="w-full text-right border-collapse border border-slate-300 text-xs mb-8">
                        <thead>
                          <tr className="bg-slate-100 font-black text-slate-800 border-b-2 border-slate-300">
                            <th className="border border-slate-300 p-2.5">
                              التاريخ
                            </th>
                            <th className="border border-slate-300 p-2.5 text-center">
                              أول دخول
                            </th>
                            <th className="border border-slate-300 p-2.5 text-center">
                              آخر خروج
                            </th>
                            <th className="border border-slate-300 p-2.5 text-center">
                              الساعات
                            </th>
                            {reportData.employee.shiftType === "FLEXIBLE" ? (
                              <>
                                <th className="border border-slate-300 p-2.5 text-center text-rose-700">
                                  نقص
                                </th>
                                <th className="border border-slate-300 p-2.5 text-center text-emerald-700">
                                  إضافي
                                </th>
                              </>
                            ) : (
                              <th className="border border-slate-300 p-2.5 text-center text-rose-700">
                                تأخير
                              </th>
                            )}
                            <th className="border border-slate-300 p-2.5">
                              الحالة
                            </th>
                          </tr>
                        </thead>
                        <tbody className="font-medium text-slate-700">
                          {pageRows.map((row, i) => {
                            const isSpecialStatus = [
                              "WEEKEND",
                              "ON_LEAVE",
                              "PUBLIC_HOLIDAY",
                              "ABSENT",
                            ].includes(row.status);
                            return (
                              <tr key={i} className="even:bg-slate-50/50">
                                <td className="border border-slate-300 p-2 font-mono text-[10px] whitespace-nowrap">
                                  {row.date}
                                </td>
                                {isSpecialStatus ? (
                                  <td
                                    colSpan={
                                      reportData.employee.shiftType ===
                                      "FLEXIBLE"
                                        ? "5"
                                        : "4"
                                    }
                                    className="border border-slate-300 p-2 text-center text-[10px] font-bold text-slate-500 bg-slate-50/30"
                                  >
                                    {row.note || "-"}
                                  </td>
                                ) : (
                                  <>
                                    <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">
                                      {row.checkIn || "-"}
                                    </td>
                                    <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">
                                      {row.checkOut || "-"}
                                    </td>
                                    <td className="border border-slate-300 p-2 font-mono text-[10px] text-center font-black">
                                      {row.totalWorkedHours || "-"}
                                    </td>
                                    {reportData.employee.shiftType ===
                                    "FLEXIBLE" ? (
                                      <>
                                        <td
                                          className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.shortageMinutes > 0 ? "text-rose-600" : ""}`}
                                        >
                                          {row.shortageMinutes || 0}
                                        </td>
                                        <td
                                          className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.overtimeMinutes > 0 ? "text-emerald-600" : ""}`}
                                        >
                                          {row.overtimeMinutes || 0}
                                        </td>
                                      </>
                                    ) : (
                                      <td
                                        className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.lateMinutes > 0 ? "text-rose-600" : ""}`}
                                      >
                                        {row.lateMinutes || 0}
                                      </td>
                                    )}
                                  </>
                                )}
                                <td className="border border-slate-300 p-2 text-[10px] font-black">
                                  <span
                                    className={`px-2 py-0.5 rounded border inline-block ${getStatusStyle(row.status)}`}
                                  >
                                    {translateStatus(row.status)}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>

                        {isLastPage && (
                          <tfoot>
                            <tr className="bg-slate-800 text-white font-black text-xs">
                              <td
                                colSpan="3"
                                className="border border-slate-800 p-3 text-left"
                              >
                                الإجمالي
                              </td>
                              <td className="border border-slate-800 p-3 text-center font-mono text-sm">
                                {reportData.summary.totalHoursWorked}
                              </td>
                              {reportData.employee.shiftType === "FLEXIBLE" ? (
                                <>
                                  <td className="border border-slate-800 p-3 text-center font-mono text-rose-300">
                                    {reportData.summary.totalShortage} د
                                  </td>
                                  <td className="border border-slate-800 p-3 text-center font-mono text-emerald-600">
                                    {reportData.summary.totalOvertime} د
                                  </td>
                                </>
                              ) : (
                                <td className="border border-slate-800 p-3 text-center font-mono text-rose-600">
                                  {reportData.summary.totalLate} د
                                </td>
                              )}
                              <td className="border border-slate-800 p-2"></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>

                      {isLastPage && (
                        <div className="mt-auto pt-8">
                          <div className="flex justify-between text-center border-t border-slate-300 pt-6">
                            <div className="w-1/3 text-[10px] text-slate-500">
                              إقرار الموظف
                              <br />
                              <br />
                              ...................
                            </div>
                            <div className="w-1/3 text-[10px] text-slate-500">
                              المدير المباشر
                              <br />
                              <br />
                              ...................
                            </div>
                            <div className="w-1/3 text-[10px] text-slate-500">
                              الموارد البشرية
                              <br />
                              <br />
                              ...................
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 🚀 استدعاء شاشة الاعتماد وتمرير الـ PDF لها */}
      {isStampingModalOpen && generatedPdfFile && (
        <NewDocumentationModal
          isOpen={isStampingModalOpen}
          onClose={() => setIsStampingModalOpen(false)}
          initialFile={generatedPdfFile}
          initialMetadata={{
            employeeName: reportData?.employee?.name,
            documentName: `تايم شيت (${startDate} إلى ${endDate})`,
          }}
          onSuccess={() => {
            setIsStampingModalOpen(false);
            toast.success("التقرير معتمد وتم رفعه للسجل المركزي!");
          }}
        />
      )}
    </>
  );
}
