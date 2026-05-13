import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // ⚠️ تأكد من مسار الـ API
import { Printer, FileDown, Loader2 } from "lucide-react";

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

  // 2. جلب التقرير بناءً على اختيارات المستخدم
  const { data: reportData, isLoading: isReportLoading } = useQuery({
    queryKey: ['attendance-report', selectedEmployee, selectedMonth, selectedYear],
    queryFn: async () => {
      if (!selectedEmployee) return null;
      const res = await api.get(`/attendance/report?employeeId=${selectedEmployee}&month=${selectedMonth}&year=${selectedYear}`);
      return res.data.data;
    },
    enabled: !!selectedEmployee // لا تجلب التقرير إلا إذا تم اختيار موظف
  });

  // دالة لطباعة التقرير
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full max-w-7xl mx-auto pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Options Panel (No Print class to hide when printing) ── */}
      <div className="w-full lg:w-80 bg-white/80 backdrop-blur-xl rounded-3xl border border-slate-200/60 shadow-sm p-6 shrink-0 flex flex-col relative overflow-hidden print:hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl -z-10 opacity-60"></div>
        <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-200/60 pb-4">خيارات التقرير</h3>
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">نوع التقرير</label>
            <select className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all text-slate-800">
              <option value="employee">مفصل لموظف محدد (Timesheet)</option>
              <option value="department" disabled>تقرير قسم كامل (قريباً)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">اختر الموظف</label>
            <select 
              value={selectedEmployee} 
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-sm transition-all text-slate-800"
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
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all text-slate-800"
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
                className="w-full bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20 shadow-sm transition-all text-slate-800"
              >
                {[currentYear, currentYear - 1, currentYear - 2].map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="mt-auto pt-6 space-y-3 relative z-10">
          <button onClick={handlePrint} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-xl shadow-slate-900/20 transition-all flex items-center justify-center gap-2 group">
            <Printer className="w-4 h-4 group-hover:scale-110 transition-transform" /> طباعة / تصدير PDF
          </button>
          <button className="w-full py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-black text-sm rounded-xl border border-slate-200 shadow-sm transition-all flex items-center justify-center gap-2">
            <FileDown className="w-4 h-4 text-emerald-500" /> تصدير Excel
          </button>
        </div>
      </div>

      {/* ── Print Preview Simulation ── */}
      <div className="flex-1 bg-slate-200/50 rounded-3xl border border-slate-300 shadow-inner p-8 overflow-y-auto relative flex justify-center custom-scrollbar print:bg-white print:p-0 print:border-none print:shadow-none">
        
        {isReportLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-amber-500 print:hidden">
            <Loader2 className="w-10 h-10 animate-spin mb-4" />
            <span className="font-black">جاري إنشاء التقرير...</span>
          </div>
        ) : !reportData ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 font-bold print:hidden">
            الرجاء اختيار موظف لعرض التقرير.
          </div>
        ) : (
          <>
            <div className="absolute top-4 left-6 border border-slate-300 text-slate-400 bg-white/50 backdrop-blur rounded-lg px-2 py-1 text-[8px] font-mono tracking-widest uppercase print:hidden">
              Print Preview Simulation
            </div>
            
            {/* 📄 ورقة الطباعة A4 */}
            <div className="w-[210mm] min-h-[297mm] bg-white shadow-xl border border-slate-200 relative shrink-0 flex flex-col p-10 print:shadow-none print:border-none print:w-full">
              
              {/* الهوامش الجانبية */}
              <div className="absolute top-0 bottom-0 left-2 w-4 border-r border-slate-100 flex items-center justify-center">
                <span className="text-[7px] text-slate-300 -rotate-90 whitespace-nowrap font-mono tracking-widest uppercase">
                  GENERATED BY EARTH SYSTEM HR MODULE - DO NOT DISTRIBUTE UNLESS AUTHORIZED
                </span>
              </div>
              <div className="absolute top-0 bottom-0 right-2 w-4 border-l border-slate-100 flex items-center justify-center">
                <span className="text-[7px] text-slate-300 rotate-90 whitespace-nowrap tracking-widest">
                  تاريخ الطباعة: {new Date().toLocaleString('en-GB')} | تم الطباعة بواسطة: النظام
                </span>
              </div>
              
              <div className="flex-1 px-4 flex flex-col z-10">
                {/* Header */}
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-slate-900 text-white flex items-center justify-center rounded-2xl shadow-sm print:bg-slate-800">
                      <span className="font-black text-xl">إيـرث</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-slate-900 mb-1">التايم شيت وسجل الدوام</h1>
                      <p className="text-xs font-bold text-slate-500">مستخرج رسمي من نظام الموارد البشرية</p>
                    </div>
                  </div>
                  <div className="text-left font-mono text-[10px] text-slate-600 space-y-1">
                    <div className="font-black text-slate-900 text-xs">REF: TS-{selectedYear}-{selectedMonth}-{reportData.employee.employeeCode || '000'}</div>
                    <div>Gregorian: {new Date().toLocaleDateString('en-GB')}</div>
                    <div className="pt-2">
                      <div className="w-12 h-12 bg-slate-100 border border-slate-300 mx-auto flex items-center justify-center text-[8px] text-slate-400">QR CODE</div>
                    </div>
                  </div>
                </div>
                
                {/* Employee Info */}
                <div className="grid grid-cols-4 gap-4 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:border-2">
                  <div className="col-span-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">فترة التقرير الزمنية</span>
                    <span className="text-sm font-black text-slate-900">{reportData.period}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">حالة التقرير</span>
                    <span className="text-sm font-black text-slate-900">نهائي - مغلق</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">عدد الصفحات</span>
                    <span className="text-sm font-black text-slate-900">1/1</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">اسم الموظف</span>
                    <span className="text-xs font-black text-slate-900">{reportData.employee.name}</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">الرقم الوظيفي</span>
                    <span className="text-xs font-black text-slate-900 font-mono">{reportData.employee.employeeCode || '-'}</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">القسم</span>
                    <span className="text-xs font-black text-slate-900">{reportData.employee.department}</span>
                  </div>
                  <div className="col-span-1 border-t border-slate-200 mt-2 pt-2">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">المسمى الوظيفي</span>
                    <span className="text-xs font-black text-slate-900">{reportData.employee.position}</span>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-right border-collapse border border-slate-300 text-xs mb-8">
                  <thead>
                    <tr className="bg-slate-100 font-black text-slate-800 border-b-2 border-slate-300 print:bg-slate-200">
                      <th className="border border-slate-300 p-2">التاريخ</th>
                      <th className="border border-slate-300 p-2 text-center">دخول</th>
                      <th className="border border-slate-300 p-2 text-center">خروج</th>
                      <th className="border border-slate-300 p-2 text-center">ساعات</th>
                      <th className="border border-slate-300 p-2 text-center">تأخير (د)</th>
                      <th className="border border-slate-300 p-2">الحالة / الملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium text-slate-700">
                    {reportData.logs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4 border border-slate-300 text-slate-400">لا توجد سجلات بصمة في هذا الشهر</td>
                      </tr>
                    ) : (
                      reportData.logs.map((row, i) => (
                        <tr key={i} className="even:bg-slate-50 hover:bg-slate-100/50 print:even:bg-transparent">
                          <td className="border border-slate-300 p-2 font-mono text-[10px]">{row.date}</td>
                          <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">{row.inTime}</td>
                          <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">{row.outTime}</td>
                          <td className="border border-slate-300 p-2 font-mono text-[10px] text-center">{row.hours}</td>
                          <td className={`border border-slate-300 p-2 font-bold font-mono text-[10px] text-center ${row.delay > 0 ? 'text-rose-600' : ''}`}>{row.delay}</td>
                          <td className="border border-slate-300 p-2 text-[10px] font-bold">{row.status}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-800 text-white font-black text-xs print:bg-slate-800 print:text-black print:border-2 print:border-slate-900">
                      <td colSpan="3" className="border border-slate-800 p-2 text-left">الإجمالي</td>
                      <td className="border border-slate-800 p-2 text-center font-mono">{reportData.summary.totalHours}</td>
                      <td className="border border-slate-800 p-2 text-center font-mono">{reportData.summary.totalDelay}</td>
                      <td className="border border-slate-800 p-2"></td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer / Signatures */}
                <div className="mt-auto break-inside-avoid">
                  <div className="flex justify-between items-end border-t border-slate-300 pt-8 mt-12 relative">
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 w-32 h-32 border-4 border-indigo-600/10 rounded-full flex items-center justify-center -rotate-12 pointer-events-none print:border-indigo-600/30">
                      <span className="text-indigo-600/10 font-black text-2xl tracking-widest uppercase print:text-indigo-600/30">APPROVED</span>
                    </div>
                    <div className="text-center w-1/3">
                      <div className="text-[10px] font-black text-slate-800 mb-6">الموظف المقر</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1">الاسم: {reportData.employee.name}</div>
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
                      <div className="text-[10px] font-black text-slate-800 mb-6">اعتماد الموارد البشرية (الختم الرسمي)</div>
                      <div className="text-[10px] text-slate-500 border-b border-slate-400 pb-1 mb-1">بصمة إلكترونية صالحة وموثقة</div>
                      <div className="font-mono text-[8px] text-slate-400 mt-2 truncate">eAuth: {Math.random().toString(36).substr(2, 9).toUpperCase()}-EARTH</div>
                    </div>
                  </div>
                  <div className="mt-8 text-center text-[8px] font-bold text-slate-400">
                    هذا المستند معتمد من نظام إيرث (Earth System) لإدارة الموارد البشرية. أي شطب أو تعديل فيه يعتبر لاغياً. لا يجوز تداول هذا المستند خارج نطاق صلاحيات الشركة.
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