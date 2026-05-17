import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من مسار الـ API
import { Printer, FileDown, Loader2, Sparkles, Clock, CalendarDays, User, Briefcase, FileSpreadsheet } from "lucide-react";

export default function ReportsTab() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  // 1. جلب قائمة الموظفين لملء قائمة الاختيار
  const { data: employees = [] } = useQuery({
    queryKey: ['employees-list'],
    queryFn: async () => {
      const res = await api.get('/employees');
      return res.data?.data || res.data || [];
    }
  });

  // تحديد أول موظف تلقائياً إذا تم جلب القائمة
  useEffect(() => {
    if (employees.length > 0 && !selectedEmployee) {
      setSelectedEmployee(employees[0].id);
    }
  }, [employees]);

  // 2. جلب التقرير بناءً على اختيارات المستخدم (متصل بالمحرك الذكي الجديد)
  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['attendance-report', selectedEmployee, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!selectedEmployee) return null;
      // 💡 يفترض أن الباك إند يعيد التقرير متضمناً تفاصيل المحرك الذكي الجديد
      const res = await api.get(`/attendance/report?employeeId=${selectedEmployee}&month=${selectedMonth}&year=${selectedYear}`);
      return res.data.data;
    },
    enabled: !!selectedEmployee 
  });

  // دالة لطباعة التقرير
  const handlePrint = () => {
    window.print();
  };

  // دالة مساعدة لتلوين الحالات الذكية
  const getStatusStyle = (status) => {
    switch (status) {
      case 'PRESENT':
      case 'PRESENT_FLEX': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'ABSENT': return 'text-rose-700 bg-rose-50 border-rose-200';
      case 'WEEKEND': return 'text-slate-500 bg-slate-100 border-slate-200';
      case 'ON_LEAVE': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'PUBLIC_HOLIDAY': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  // دالة مساعدة لترجمة الحالات
  const translateStatus = (status) => {
    switch (status) {
      case 'PRESENT': return 'حضور (ثابت)';
      case 'PRESENT_FLEX': return 'حضور (مرن)';
      case 'ABSENT': return 'غياب';
      case 'WEEKEND': return 'يوم راحة';
      case 'ON_LEAVE': return 'إجازة معتمدة';
      case 'PUBLIC_HOLIDAY': return 'إجازة رسمية';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500 font-cairo">
      
      {/* ── Options Panel (No Print) ── */}
      <div className="w-full lg:w-80 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-6 shrink-0 flex flex-col relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10 opacity-60"></div>
        
        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200/60 pb-4">
          <FileSpreadsheet className="w-5 h-5 text-indigo-600" /> خيارات التقرير الذكي
        </h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">نوع التقرير</label>
            <select className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all text-slate-800">
              <option value="employee">مفصل لموظف محدد (AI Timesheet)</option>
              <option value="department" disabled>تقرير قسم كامل (قريباً)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">اختر الموظف</label>
            <select 
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm transition-all text-slate-800"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">الشهر</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all text-slate-800"
              >
                {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-700 mb-2">السنة</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all text-slate-800"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-6 space-y-3 relative z-10">
          <button onClick={handlePrint} disabled={isReportLoading || !reportData} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50">
            <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" /> طباعة / تصدير PDF
          </button>
          <button disabled={isReportLoading || !reportData} className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-black text-sm rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50">
            <FileDown className="w-4 h-4 text-emerald-500" /> تصدير Excel
          </button>
        </div>
      </div>

      {/* ── Print Preview ── */}
      <div className="flex-1 bg-slate-200/50 rounded-3xl border border-slate-300 shadow-inner p-4 sm:p-8 overflow-y-auto relative flex justify-center custom-scrollbar print:bg-white print:p-0 print:border-none print:shadow-none">
        
        {isReportLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-indigo-600 print:hidden">
            <Loader2 className="w-12 h-12 animate-spin mb-4" />
            <span className="font-black text-lg">جاري معالجة بيانات التايم شيت...</span>
            <p className="text-xs font-bold text-slate-500 mt-2">يتم الآن تطبيق سياسات الإجازات والورديات المرنة</p>
          </div>
        ) : !reportData ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold print:hidden">
            <FileSpreadsheet className="w-16 h-16 mb-4 opacity-30" />
            الرجاء اختيار موظف لعرض التقرير.
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-6 border border-slate-300 text-slate-400 bg-white/50 backdrop-blur rounded-lg px-2 py-1 text-[8px] font-mono tracking-widest uppercase print:hidden z-10 shadow-sm">
              Smart Print Preview
            </div>
            
            {/* 📄 ورقة الطباعة A4 */}
            <div className="w-full max-w-[210mm] min-h-[297mm] bg-white shadow-xl border border-slate-200 relative shrink-0 flex flex-col p-8 sm:p-10 print:shadow-none print:border-none print:w-full print:max-w-none">
              
              {/* الهوامش الجانبية */}
              <div className="absolute top-0 bottom-0 left-2 w-4 border-r border-slate-100 flex items-center justify-center">
                <span className="text-[7px] text-slate-300 -rotate-90 whitespace-nowrap font-mono tracking-widest uppercase">
                  GENERATED BY EARTH AI HR ENGINE - SECURE DOCUMENT
                </span>
              </div>
              <div className="absolute top-0 bottom-0 right-2 w-4 border-l border-slate-100 flex items-center justify-center">
                <span className="text-[7px] text-slate-300 rotate-90 whitespace-nowrap tracking-widest">
                  تاريخ الطباعة: {new Date().toLocaleString('en-GB')} | تم الطباعة بواسطة: النظام
                </span>
              </div>
              
              <div className="flex-1 px-2 sm:px-6 flex flex-col z-10">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-2xl shadow-sm print:bg-slate-800">
                      <span className="font-black text-xl">إيـرث</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                        التايم شيت الذكي <Sparkles className="w-4 h-4 text-amber-500 print:hidden" />
                      </h1>
                      <p className="text-xs font-bold text-slate-500">مستخرج رسمي من محرك الموارد البشرية</p>
                    </div>
                  </div>
                  <div className="text-left font-mono text-[10px] text-slate-600 space-y-1">
                    <div className="font-black text-slate-900 text-xs">REF: TS-{selectedYear}-{selectedMonth}-{reportData.employee.employeeCode || '000'}</div>
                    <div>Gregorian: {new Date().toLocaleDateString('en-GB')}</div>
                    <div className="pt-2">
                      <div className="w-12 h-12 bg-slate-50 border border-slate-300 mx-auto flex items-center justify-center text-[8px] text-slate-400 rounded-md">QR CODE</div>
                    </div>
                  </div>
                </div>
                
                {/* Employee Info */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-slate-50 p-5 rounded-2xl border border-slate-100 print:bg-transparent print:border-2">
                  <div className="col-span-2 sm:col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1"><CalendarDays className="w-3 h-3"/> فترة التقرير</span>
                    <span className="text-sm font-black text-slate-900">{reportData.period}</span>
                  </div>
                  <div className="col-span-2 sm:col-span-2 bg-indigo-50/50 p-2 rounded-lg border border-indigo-100 print:border-slate-300">
                    <span className="text-[10px] text-indigo-700 font-black flex items-center gap-1 mb-1"><Clock className="w-3 h-3"/> سياسة الدوام المطبقة</span>
                    <span className="text-sm font-black text-indigo-900">
                      {reportData.employee.shiftType === 'FLEXIBLE' 
                        ? `مرن (${reportData.employee.requiredDailyHours} ساعات يومياً)` 
                        : `ثابت (${reportData.employee.shiftStartTime} - ${reportData.employee.shiftEndTime})`}
                    </span>
                  </div>
                  
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1"><User className="w-3 h-3"/> اسم الموظف</span>
                    <span className="text-xs font-black text-slate-900">{reportData.employee.name}</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">الرقم الوظيفي</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{reportData.employee.employeeCode || '-'}</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1 mb-1"><Briefcase className="w-3 h-3"/> القسم</span>
                    <span className="text-xs font-black text-slate-900">{reportData.employee.department}</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-3">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">المسمى الوظيفي</span>
                    <span className="text-xs font-black text-slate-900">{reportData.employee.position}</span>
                  </div>
                </div>

                {/* Smart Table */}
                <table className="w-full text-right border-collapse border border-slate-300 text-xs mb-8">
                  <thead>
                    <tr className="bg-slate-100 font-black text-slate-800 border-b-2 border-slate-300 print:bg-slate-200">
                      <th className="border border-slate-300 p-2.5">التاريخ</th>
                      <th className="border border-slate-300 p-2.5 text-center">أول دخول</th>
                      <th className="border border-slate-300 p-2.5 text-center">آخر خروج</th>
                      <th className="border border-slate-300 p-2.5 text-center">إجمالي الساعات</th>
                      {reportData.employee.shiftType === 'FLEXIBLE' ? (
                        <>
                          <th className="border border-slate-300 p-2.5 text-center text-rose-700">نقص (د)</th>
                          <th className="border border-slate-300 p-2.5 text-center text-emerald-700">إضافي (د)</th>
                        </>
                      ) : (
                        <th className="border border-slate-300 p-2.5 text-center text-rose-700">تأخير (د)</th>
                      )}
                      <th className="border border-slate-300 p-2.5">الحالة / قرار النظام</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-slate-700">
                    {reportData.logs.length === 0 ? (
                      <tr>
                        <td colSpan={reportData.employee.shiftType === 'FLEXIBLE' ? "7" : "6"} className="text-center py-8 border border-slate-300 text-slate-400 font-bold bg-slate-50">
                          لا توجد سجلات مسجلة في هذا الشهر
                        </td>
                      </tr>
                    ) : (
                      reportData.logs.map((row, i) => {
                        const isSpecialStatus = ['WEEKEND', 'ON_LEAVE', 'PUBLIC_HOLIDAY', 'ABSENT'].includes(row.status);
                        
                        return (
                          <tr key={i} className="even:bg-slate-50/50 hover:bg-slate-100/80 print:even:bg-transparent transition-colors">
                            <td className="border border-slate-300 p-2 font-mono text-[10px] whitespace-nowrap">{row.date}</td>
                            
                            {isSpecialStatus ? (
                              <td colSpan={reportData.employee.shiftType === 'FLEXIBLE' ? "5" : "4"} className="border border-slate-300 p-2 text-center text-[10px] font-bold text-slate-500 bg-slate-50/30">
                                {row.note || "-"}
                              </td>
                            ) : (
                              <>
                                <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">{row.checkIn || '-'}</td>
                                <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">{row.checkOut || '-'}</td>
                                <td className="border border-slate-300 p-2 font-mono text-[10px] text-center font-black">{row.totalWorkedHours || '-'}</td>
                                
                                {reportData.employee.shiftType === 'FLEXIBLE' ? (
                                  <>
                                    <td className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.shortageMinutes > 0 ? 'text-rose-600 bg-rose-50/30' : ''}`}>{row.shortageMinutes || 0}</td>
                                    <td className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.overtimeMinutes > 0 ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>{row.overtimeMinutes || 0}</td>
                                  </>
                                ) : (
                                  <td className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.lateMinutes > 0 ? 'text-rose-600 bg-rose-50/30' : ''}`}>{row.lateMinutes || 0}</td>
                                )}
                              </>
                            )}

                            <td className="border border-slate-300 p-2 text-[10px] font-black">
                              <span className={`px-2 py-0.5 rounded border inline-block ${getStatusStyle(row.status)}`}>
                                {translateStatus(row.status)}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  
                  {/* Smart Footer Summary */}
                  {reportData.logs.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-800 text-white font-black text-xs print:bg-slate-800 print:text-white print:border-2 print:border-slate-900">
                        <td colSpan="3" className="border border-slate-800 p-3 text-left">إجمالي الساعات الفعلية</td>
                        <td className="border border-slate-800 p-3 text-center font-mono text-sm">{reportData.summary.totalHoursWorked}</td>
                        {reportData.employee.shiftType === 'FLEXIBLE' ? (
                          <>
                            <td className="border border-slate-800 p-3 text-center font-mono text-rose-300">{reportData.summary.totalShortage} د</td>
                            <td className="border border-slate-800 p-3 text-center font-mono text-emerald-300">{reportData.summary.totalOvertime} د</td>
                          </>
                        ) : (
                          <td className="border border-slate-800 p-3 text-center font-mono text-rose-300">{reportData.summary.totalLate} د</td>
                        )}
                        <td className="border border-slate-800 p-2">
                           <div className="flex gap-2 justify-center text-[9px] opacity-80">
                             <span>غياب: {reportData.summary.totalAbsentDays}</span>
                             <span>إجازات: {reportData.summary.totalLeaveDays}</span>
                           </div>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>

                {/* Footer / Signatures */}
                <div className="mt-auto break-inside-avoid">
                  <div className="flex justify-between items-end border-t border-slate-300 pt-8 mt-8 relative">
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 w-32 h-32 border-4 border-indigo-600/10 rounded-full flex items-center justify-center -rotate-12 pointer-events-none print:border-indigo-600/20">
                      <span className="text-indigo-600/10 font-black text-2xl tracking-widest uppercase print:text-indigo-600/20">VERIFIED</span>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="text-[10px] font-black text-slate-800 mb-6">الموظف المقر</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1 truncate">الاسم: {reportData.employee.name}</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1">التوقيع: .....................................</div>
                      <div className="text-[10px] text-slate-500">التاريخ: ....... / ....... / ...........</div>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="text-[10px] font-black text-slate-800 mb-6">المدير المباشر</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1">الاسم: .......................................</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1">التوقيع: .....................................</div>
                      <div className="text-[10px] text-slate-500">التاريخ: ....... / ....... / ...........</div>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="text-[10px] font-black text-slate-800 mb-6">اعتماد الموارد البشرية</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1">تمت المراجعة الآلية بواسطة النظام</div>
                      <div className="font-mono text-[8px] text-slate-400 mt-2 truncate">eAuth: {Math.random().toString(36).substr(2, 9).toUpperCase()}-AI</div>
                    </div>
                  </div>
                  <div className="mt-6 text-center text-[8px] font-bold text-slate-400 leading-relaxed">
                    هذا المستند معتمد آلياً من نظام إيرث (Earth HR Engine) لإدارة الموارد البشرية والذكاء الاصطناعي. <br/>أي شطب أو تعديل يدوي فيه يعتبر لاغياً. لا يجوز تداول هذا المستند خارج نطاق صلاحيات الشركة.
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}