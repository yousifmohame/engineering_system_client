// src/pages/Hr/screens/payroll/components/views/ReportsView.jsx
import React from "react";
import { PieChart, TrendingUp, DollarSign, Users, Activity } from "lucide-react";

export default function ReportsView({ payrolls, filterMonth }) {
  // عمليات حسابية سريعة للإحصائيات بناءً على بيانات الجدول الحالي
  const totalNet = payrolls.reduce((sum, p) => sum + Number(p.netSalary), 0);
  const totalDeductions = payrolls.reduce((sum, p) => sum + Number(p.deductions), 0);
  const totalAllowances = payrolls.reduce((sum, p) => sum + (Number(p.housingAllow) + Number(p.transportAllow)), 0);
  const paidCount = payrolls.filter(p => p.status === 'PAID').length;

  const stats = [
    { title: "إجمالي الرواتب المصروفة", value: `${totalNet.toLocaleString()} ر.س`, icon: DollarSign, color: "text-teal-600", bg: "bg-teal-50" },
    { title: "إجمالي الخصومات", value: `${totalDeductions.toLocaleString()} ر.س`, icon: TrendingUp, color: "text-rose-600", bg: "bg-rose-50" },
    { title: "إجمالي البدلات", value: `${totalAllowances.toLocaleString()} ر.س`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "الموظفين المصروف لهم", value: `${paidCount} / ${payrolls.length}`, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <PieChart className="text-amber-500" size={28} />
        <h2 className="text-2xl font-black text-[#123f59]">الملخص المالي لشهر {filterMonth}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 flex flex-col justify-center shadow-sm hover:-translate-y-1 transition-transform">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <p className="text-sm font-bold text-gray-500 mb-1">{stat.title}</p>
            <p className="text-2xl font-black text-[#123f59]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* رسم بياني بصري (مبني بالـ CSS) */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-3xl p-6 shadow-sm mt-6">
        <h3 className="text-lg font-black text-[#123f59] mb-6">توزيع ميزانية الرواتب</h3>
        <div className="w-full h-8 flex rounded-full overflow-hidden bg-gray-100 shadow-inner">
          <div style={{ width: '70%' }} className="bg-teal-500 flex items-center justify-center text-xs font-bold text-white">الأساسي 70%</div>
          <div style={{ width: '20%' }} className="bg-blue-500 flex items-center justify-center text-xs font-bold text-white">البدلات 20%</div>
          <div style={{ width: '10%' }} className="bg-rose-500 flex items-center justify-center text-xs font-bold text-white">الخصومات 10%</div>
        </div>
        <div className="flex justify-center gap-6 mt-6">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-500"></div><span className="text-sm font-bold text-gray-600">الراتب الأساسي</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm font-bold text-gray-600">البدلات والتسويات</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-rose-500"></div><span className="text-sm font-bold text-gray-600">الاستقطاعات</span></div>
        </div>
      </div>
    </div>
  );
}