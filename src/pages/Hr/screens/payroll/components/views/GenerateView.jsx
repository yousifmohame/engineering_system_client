// src/pages/Hr/screens/payroll/components/views/GenerateView.jsx
import React, { useState } from "react";
import { Calculator, Banknote, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "../../../../../../api/axios";

export default function GenerateView({ filterMonth, refreshData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(filterMonth);

  const handleGeneratePayroll = async () => {
    if (!window.confirm(`هل أنت متأكد من توليد رواتب شهر ${selectedMonth} لجميع الموظفين النشطين؟`)) return;
    
    setIsLoading(true);
    try {
      const res = await api.post('/payrolls/generate', { month: selectedMonth });
      toast.success(res.data.message || "تم توليد المسير بنجاح");
      refreshData(); // تحديث البيانات في الشاشات الأخرى
    } catch (error) {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء التوليد.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full mt-10">
      <div className="bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)] rounded-[28px] p-8 transition-all duration-300">
        <div className="flex flex-col items-center text-center p-6">
          <div className="h-24 w-24 rounded-full bg-teal-50 border-2 border-dashed border-teal-500 flex items-center justify-center text-teal-600 mb-6">
            <Banknote size={40} />
          </div>
          <h3 className="text-2xl font-black text-[#123f59] mb-2">إصدار مسير رواتب جديد</h3>
          <p className="text-sm font-bold text-gray-500 mb-8">سيقوم النظام باحتساب الرواتب بناءً على العقود والحضور والانصراف.</p>
          
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full max-w-sm h-14 px-5 bg-white/60 backdrop-blur-sm border border-white/60 rounded-2xl text-lg font-black text-[#123f59] outline-none focus:bg-white/90 focus:ring-2 focus:ring-teal-500/40 transition-all shadow-inner text-center mb-8"
          />

          <button 
            onClick={handleGeneratePayroll}
            disabled={isLoading}
            className="w-full max-w-sm h-14 rounded-2xl bg-gradient-to-r from-teal-500 to-teal-600 text-lg font-black text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:scale-105 flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Calculator size={24} />}
            توليد المسير الآن
          </button>
        </div>
      </div>
    </div>
  );
}