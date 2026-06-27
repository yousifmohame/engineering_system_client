// src/pages/Hr/screens/payroll/components/views/HistoryView.jsx
import React from "react";
import { User, FileText, FileBox, Loader2 } from "lucide-react";

export default function HistoryView({ payrolls, isLoading, filterSource, setFilterSource, onOpenPayslip }) {
  
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-gray-100 text-gray-700 border-gray-200",
      UNDER_REVIEW: "bg-cyan-50 text-cyan-700 border-cyan-200",
      APPROVED: "bg-indigo-50 text-indigo-700 border-indigo-200",
      RETURNED: "bg-amber-50 text-amber-700 border-amber-200",
      REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
      PAID: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
    const labels = {
      PENDING: "مسودة",
      UNDER_REVIEW: "عند المشرف",
      APPROVED: "معتمد",
      RETURNED: "مُرجع للتعديل",
      REJECTED: "مرفوض",
      PAID: "مدفوع (مدد)"
    };
    return (
      <span className={`px-2.5 py-1 rounded-xl text-[11px] font-black border backdrop-blur-sm ${badges[status] || badges.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* فلاتر المصدر */}
      <div className="flex items-center gap-2 mb-4">
        {[{ id: "ALL", label: "الكل" }, { id: "SYSTEM", label: "نظامي" }, { id: "MUDAD", label: "مدد" }].map(btn => (
          <button 
            key={btn.id} 
            onClick={() => setFilterSource(btn.id)} 
            className={`px-5 py-2 rounded-xl text-sm font-black transition-all border ${
              filterSource === btn.id 
                ? "bg-[#123f59] text-white border-[#123f59] shadow-md" 
                : "bg-white/40 text-[#123f59] border-white/60 hover:bg-white/60"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* الجدول */}
      <div className="flex-1 bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-sm flex flex-col relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-10">
            <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#123f59]/10 text-[#123f59] border-b border-white/60">
                  <th className="p-5 font-black text-sm whitespace-nowrap">الموظف</th>
                  <th className="p-5 font-black text-sm whitespace-nowrap">الأساسي</th>
                  <th className="p-5 font-black text-sm whitespace-nowrap text-emerald-700">البدلات</th>
                  <th className="p-5 font-black text-sm whitespace-nowrap text-rose-700">الخصم</th>
                  <th className="p-5 font-black text-base whitespace-nowrap">الصافي</th>
                  <th className="p-5 font-black text-sm whitespace-nowrap">المصدر والحالة</th>
                  <th className="p-5 font-black text-sm whitespace-nowrap text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {payrolls.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-24 text-gray-500">
                      <FileBox className="mx-auto mb-4 opacity-40 text-[#123f59]" size={64} />
                      <p className="font-black text-lg">لا توجد مسيرات مسجلة.</p>
                    </td>
                  </tr>
                ) : (
                  payrolls.map(record => (
                    <tr key={record.id} className="hover:bg-white/60 transition-colors duration-200">
                      <td className="p-5 align-middle">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 flex items-center justify-center text-teal-700 border border-teal-500/20 shadow-inner shrink-0">
                            <User size={20} />
                          </div>
                          <div>
                            <p className="font-black text-[#123f59] text-sm">{record.employee?.name}</p>
                            <p className="text-xs text-gray-500 font-bold mt-1">{record.employee?.employeeCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 font-bold text-gray-600 text-sm align-middle">{Number(record.baseSalary)?.toLocaleString()} ر.س</td>
                      <td className="p-5 font-bold text-emerald-600 text-sm align-middle">+{(Number(record.housingAllow) + Number(record.transportAllow))?.toLocaleString()} ر.س</td>
                      <td className="p-5 font-bold text-rose-500 text-sm align-middle">-{Number(record.deductions)?.toLocaleString()} ر.س</td>
                      <td className="p-5 font-black text-[#123f59] text-base align-middle">{Number(record.netSalary)?.toLocaleString()} ر.س</td>
                      <td className="p-5 align-middle">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border backdrop-blur-sm ${record.source === 'MUDAD' ? 'bg-purple-500/20 text-purple-800 border-purple-500/30' : 'bg-blue-500/20 text-blue-800 border-blue-500/30'}`}>
                            {record.source === 'MUDAD' ? 'منصة مدد' : 'نظام داخلي'}
                          </span>
                          {getStatusBadge(record.status)}
                        </div>
                      </td>
                      <td className="p-5 text-center align-middle">
                        <button onClick={() => onOpenPayslip(record)} className="h-10 px-4 rounded-xl bg-white/50 text-[#123f59] border border-white/60 hover:bg-white hover:shadow-md font-black text-xs flex items-center justify-center gap-2 mx-auto transition-all">
                          <FileText size={16} /> تفاصيل
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}