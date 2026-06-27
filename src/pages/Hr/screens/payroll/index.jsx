// src/pages/Hr/screens/payroll/index.jsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import api from "../../../../api/axios"; // تأكد من مسار axios
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import GenerateView from "./components/views/GenerateView";
import HistoryView from "./components/views/HistoryView";
import MudadView from "./components/views/MudadView";
import ReportsView from "./components/views/ReportsView";
import PayslipModal from "./components/PayslipModal";

export default function PayrollManagement() {
  const [activeView, setActiveView] = useState("HISTORY");
  const [isLoading, setIsLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  
  // فلاتر البحث
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterSource, setFilterSource] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // حالة النافذة (القسيمة)
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // جلب البيانات
  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payrolls?month=${filterMonth}&source=${filterSource}`);
      setPayrolls(res.data || []);
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("حدث خطأ أثناء جلب المسيرات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [filterMonth, filterSource]); // تحديث عند تغيير الشهر أو المصدر

  // تصفية البيانات محلياً بناءً على البحث
  const filteredPayrolls = payrolls.filter(p => 
    p.employee?.name.includes(searchQuery) || 
    p.employee?.employeeCode.includes(searchQuery)
  );

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] font-cairo relative" dir="rtl">
      {/* خلفيات مضيئة */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob pointer-events-none"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

      {/* الشريط الجانبي */}
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <TopBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          filterMonth={filterMonth} 
          setFilterMonth={setFilterMonth}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          {activeView === "GENERATE" && <GenerateView filterMonth={filterMonth} refreshData={fetchPayrolls} />}
          {activeView === "HISTORY" && <HistoryView payrolls={filteredPayrolls} isLoading={isLoading} filterSource={filterSource} setFilterSource={setFilterSource} onOpenPayslip={setSelectedPayslip} />}
          {activeView === "MUDAD" && <MudadView refreshData={fetchPayrolls} setActiveView={setActiveView} />}
          {activeView === "REPORTS" && <ReportsView payrolls={payrolls} filterMonth={filterMonth} />}
        </div>
      </div>

      {/* نافذة تفاصيل القسيمة */}
      <PayslipModal 
        selectedPayslip={selectedPayslip} 
        setSelectedPayslip={setSelectedPayslip}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        refreshData={fetchPayrolls}
      />
    </div>
  );
}