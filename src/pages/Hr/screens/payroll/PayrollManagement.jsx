import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Banknote, User, Search, Plus, Download, 
  CheckCircle, Clock, FileText, Building, Users,
  Calculator, AlertCircle, ChevronLeft, XCircle, Printer, Edit3, Save, Loader2
} from "lucide-react";
import api from "../../../../api/axios"; // تأكد من صحة مسار استيراد axios

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-xs flex items-center gap-4 flex-1 min-w-[200px] print:hidden">
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-[#64748b]">{label}</p>
      <p className="text-lg font-black text-[#123f59] mt-0.5">{value}</p>
    </div>
  </div>
);

export default function PayrollManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [filterStatus, setFilterStatus] = useState("ALL");
  
  // حالات القسيمة
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  // ==========================================
  // 1. جلب البيانات من السيرفر
  // ==========================================
  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payrolls?month=${filterMonth}`);
      setPayrolls(res.data || []);
    } catch (error) {
      console.error("Fetch Payrolls Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [filterMonth]);

  // ==========================================
  // 2. توليد مسيرات الرواتب للشهر الحالي
  // ==========================================
  const handleGeneratePayroll = async () => {
    if (!window.confirm(`هل أنت متأكد من توليد رواتب شهر ${filterMonth} لجميع الموظفين؟`)) return;
    
    setIsGenerating(true);
    try {
      const res = await api.post('/payrolls/generate', { month: filterMonth });
      alert(res.data.message);
      fetchPayrolls(); // إعادة جلب البيانات
    } catch (error) {
      alert("حدث خطأ أثناء التوليد.");
    } finally {
      setIsGenerating(false);
    }
  };

  // ==========================================
  // 3. تحديث القسيمة (حفظ التعديلات أو الاعتماد)
  // ==========================================
  const handleUpdatePayroll = async (id, updatedData) => {
    try {
      const res = await api.put(`/payrolls/${id}`, updatedData);
      
      // تحديث المصفوفة محلياً
      setPayrolls(prev => prev.map(p => p.id === id ? res.data : p));
      setSelectedPayslip(res.data);
      setIsEditing(false);
      
      alert("تم تحديث وحفظ بيانات المسير بنجاح.");
    } catch (error) {
      alert("فشل تحديث البيانات.");
    }
  };

  const handleApprove = () => {
    handleUpdatePayroll(selectedPayslip.id, { ...selectedPayslip, status: "APPROVED" });
  };

  const handleSaveEdit = () => {
    handleUpdatePayroll(selectedPayslip.id, editForm);
  };

  // ==========================================
  // 4. الحسابات الحية أثناء التعديل
  // ==========================================
  useEffect(() => {
    if (isEditing && editForm) {
      const net = (Number(editForm.baseSalary) + Number(editForm.housingAllow) + Number(editForm.transportAllow)) - Number(editForm.deductions);
      setEditForm(prev => ({ ...prev, netSalary: net }));
    }
  }, [editForm?.baseSalary, editForm?.housingAllow, editForm?.transportAllow, editForm?.deductions, isEditing]);

  const openPayslip = (record) => {
    setSelectedPayslip(record);
    setEditForm({
      baseSalary: record.baseSalary,
      housingAllow: record.housingAllow,
      transportAllow: record.transportAllow,
      deductions: record.deductions,
      netSalary: record.netSalary,
      status: record.status
    });
    setIsEditing(false);
  };

  // ==========================================
  // 5. الطباعة (Print)
  // ==========================================
  const handlePrint = () => {
    window.print();
  };

  // --- الفلترة والإحصائيات ---
  const filteredPayrolls = payrolls.filter(p => {
    const matchesSearch = p.employee.name.includes(searchQuery) || p.employee.employeeCode.includes(searchQuery);
    const matchesStatus = filterStatus === "ALL" || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalNetSalaries = filteredPayrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalDeductions = filteredPayrolls.reduce((sum, p) => sum + p.deductions, 0);
  const pendingCount = filteredPayrolls.filter(p => p.status === "PENDING").length;

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] p-4 lg:p-6 overflow-y-auto custom-scrollbar animate-in fade-in">
      
      {/* 1. الترويسة وأزرار الإجراءات */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shrink-0 bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-xs print:hidden">
        <div>
          <h1 className="text-xl font-black text-[#123f59] flex items-center gap-2">
            <Banknote className="text-[#d8b46a]" size={24} /> إدارة الرواتب والمسيرات
          </h1>
          <p className="text-[11px] font-bold text-[#64748b] mt-1">
            إصدار، مراجعة، وتعديل مسيرات الرواتب الشهرية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-[#fbf8f1] border border-[#e8ddc8] text-[#123f59] rounded-xl text-[11px] font-black hover:bg-white transition-all shadow-xs flex items-center gap-2">
            <Download size={14} /> تصدير ملف البنك
          </button>
          <button onClick={handleGeneratePayroll} disabled={isGenerating} className="px-4 py-2 bg-[#0e7490] text-white rounded-xl text-[11px] font-black hover:bg-[#123f59] transition-all shadow-md flex items-center gap-2 disabled:opacity-50">
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Calculator size={14} />} 
            توليد مسير {filterMonth}
          </button>
        </div>
      </div>

      {/* 2. البطاقات الإحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 shrink-0 print:hidden">
        <StatCard icon={Banknote} label="إجمالي الرواتب الصافية" value={`${totalNetSalaries.toLocaleString()} ر.س`} colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <StatCard icon={AlertCircle} label="إجمالي الاستقطاعات" value={`${totalDeductions.toLocaleString()} ر.س`} colorClass="bg-rose-50 text-rose-600 border border-rose-100" />
        <StatCard icon={Users} label="عدد الموظفين المستحقين" value={`${filteredPayrolls.length} موظف`} colorClass="bg-blue-50 text-blue-600 border border-blue-100" />
        <StatCard icon={Clock} label="مسيرات بانتظار الاعتماد" value={`${pendingCount} طلب`} colorClass="bg-amber-50 text-amber-600 border border-amber-100" />
      </div>

      {/* 3. شريط الفلترة */}
      <div className="bg-white rounded-xl border border-[#e8ddc8] p-3 shadow-xs shrink-0 flex flex-col md:flex-row items-center justify-between gap-3 mb-4 print:hidden">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
            <input 
              type="text" 
              placeholder="ابحث بالاسم أو الرقم الوظيفي..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-9 pl-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[11px] font-bold outline-none focus:border-[#0e7490]"
            />
          </div>
          <input 
            type="month" 
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="py-2 px-3 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[11px] font-black text-[#123f59] outline-none focus:border-[#0e7490]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#fbf8f1] p-1 rounded-xl border border-[#e8ddc8] w-full sm:w-auto overflow-x-auto">
          {[{ id: "ALL", label: "الكل" }, { id: "PENDING", label: "قيد المراجعة" }, { id: "APPROVED", label: "معتمد" }, { id: "PAID", label: "تم التحويل" }].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${filterStatus === btn.id ? "bg-[#0e7490] text-white shadow-xs" : "text-[#64748b] hover:text-[#123f59]"}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. جدول الرواتب الرئيسي */}
      <div className="flex-1 bg-white border border-[#e8ddc8] rounded-2xl shadow-xs overflow-hidden flex flex-col relative min-h-[400px] print:hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-xs z-10"><Loader2 className="w-10 h-10 animate-spin text-[#0e7490]" /></div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-right border-collapse text-[11px]">
              <thead className="bg-[#fbf8f1] border-b border-[#e8ddc8] sticky top-0 font-black text-[#123f59] z-0">
                <tr>
                  <th className="p-4 whitespace-nowrap">الموظف</th>
                  <th className="p-4 whitespace-nowrap">الراتب الأساسي</th>
                  <th className="p-4 whitespace-nowrap text-green-700">إجمالي البدلات</th>
                  <th className="p-4 whitespace-nowrap text-red-700">الاستقطاعات</th>
                  <th className="p-4 whitespace-nowrap font-black text-lg">الصافي للدفع</th>
                  <th className="p-4 whitespace-nowrap">الحالة</th>
                  <th className="p-4 whitespace-nowrap text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayrolls.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-16 text-[#94a3b8] font-bold"><Banknote className="mx-auto mb-3 opacity-20 text-[#123f59]" size={48} />لا توجد مسيرات مسجلة لهذا الشهر.</td></tr>
                ) : (
                  filteredPayrolls.map(record => (
                    <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors last:border-0">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#fbf8f1] border border-[#e8ddc8] flex items-center justify-center text-[#0e7490]"><User size={14} /></div>
                          <div>
                            <p className="font-black text-[#123f59] text-[12px]">{record.employee?.name}</p>
                            <p className="text-[9px] text-[#94a3b8] font-bold mt-0.5">{record.employee?.employeeCode} • {record.employee?.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-bold text-gray-600">{record.baseSalary.toLocaleString()} ر.س</td>
                      <td className="p-4 font-bold text-green-600">+{(record.housingAllow + record.transportAllow).toLocaleString()} ر.س</td>
                      <td className="p-4 font-bold text-red-500">-{record.deductions.toLocaleString()} ر.س</td>
                      <td className="p-4 font-black text-[#0e7490] text-[13px]">{record.netSalary.toLocaleString()} ر.س</td>
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black ${record.status === 'PAID' ? 'bg-green-50 text-green-700' : record.status === 'APPROVED' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                          {record.status === 'PAID' ? 'تم التحويل' : record.status === 'APPROVED' ? 'معتمد' : 'قيد المراجعة'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => openPayslip(record)} className="px-3 py-1.5 bg-[#fbf8f1] text-[#0e7490] border border-[#0e7490]/20 hover:bg-[#0e7490] hover:text-white rounded-lg text-[10px] font-black transition-colors">
                          فتح القسيمة
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

      {/* ========================================== */}
      {/* 5. نافذة تفاصيل وتعديل مسير الراتب (Payslip Modal) */}
      {/* ========================================== */}
      <AnimatePresence>
        {selectedPayslip && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4 print:bg-white print:p-0">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#e8ddc8] flex flex-col max-h-[90vh] print:shadow-none print:border-0 print:max-h-none print:h-full">
              
              <div className="bg-[#123f59] p-4 text-white flex justify-between items-center shrink-0 print:hidden">
                <h3 className="text-[14px] font-black flex items-center gap-2"><FileText size={18} className="text-[#d8b46a]" /> قسيمة راتب ({selectedPayslip.month})</h3>
                <div className="flex gap-3">
                  {!isEditing && selectedPayslip.status !== 'PAID' && (
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-1 text-[11px] font-bold text-blue-200 hover:text-white"><Edit3 size={14} /> تعديل</button>
                  )}
                  <button onClick={() => setSelectedPayslip(null)} className="text-white/70 hover:text-white"><XCircle size={20} /></button>
                </div>
              </div>

              {/* ورقة الطباعة */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed print:bg-none print:p-10">
                
                {/* ترويسة الشركة (تظهر في الطباعة فقط بشكل واضح) */}
                <div className="hidden print:flex justify-between items-center border-b-2 border-gray-800 pb-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-black text-gray-900">مكتب الهندسة المتكامل</h1>
                    <p className="text-sm text-gray-600">قسيمة راتب موظف (Payslip)</p>
                  </div>
                  <div className="text-left text-gray-600 text-sm font-bold">
                    <p>شهر الاستحقاق: {selectedPayslip.month}</p>
                    <p>تاريخ الإصدار: {new Date().toLocaleDateString('ar-SA')}</p>
                  </div>
                </div>

                <div className="bg-white border border-[#e8ddc8] rounded-xl p-4 mb-6 shadow-sm flex justify-between items-center print:border-gray-300 print:shadow-none">
                  <div>
                    <h2 className="text-lg font-black text-[#123f59] print:text-black">{selectedPayslip.employee?.name}</h2>
                    <p className="text-[11px] text-[#64748b] font-bold mt-1 print:text-black">الرقم الوظيفي: {selectedPayslip.employee?.employeeCode} | القسم: {selectedPayslip.employee?.department}</p>
                  </div>
                  <div className="text-center print:hidden">
                    <span className="block text-[10px] text-[#94a3b8] font-bold">حالة المسير</span>
                    <span className="block text-[12px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-1">{selectedPayslip.status}</span>
                  </div>
                </div>

                <div className="bg-white border border-[#e8ddc8] rounded-xl shadow-sm overflow-hidden print:border-gray-300 print:shadow-none">
                  <div className="p-4 border-b border-[#e8ddc8] print:border-gray-300">
                    <h4 className="text-[12px] font-black text-emerald-700 mb-3 flex items-center gap-1.5 print:text-black"><Plus size={14}/> المستحقات (Earnings)</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-bold text-gray-700 items-center print:text-black">
                        <span>الراتب الأساسي</span> 
                        {isEditing ? <input type="number" className="border rounded p-1 w-24 text-left" value={editForm.baseSalary} onChange={e => setEditForm({...editForm, baseSalary: e.target.value})} /> : <span>{Number(editForm?.baseSalary || 0).toLocaleString()} ر.س</span>}
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-700 items-center print:text-black">
                        <span>بدل السكن</span> 
                        {isEditing ? <input type="number" className="border rounded p-1 w-24 text-left" value={editForm.housingAllow} onChange={e => setEditForm({...editForm, housingAllow: e.target.value})} /> : <span>{Number(editForm?.housingAllow || 0).toLocaleString()} ر.س</span>}
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-gray-700 items-center print:text-black">
                        <span>بدل النقل</span> 
                        {isEditing ? <input type="number" className="border rounded p-1 w-24 text-left" value={editForm.transportAllow} onChange={e => setEditForm({...editForm, transportAllow: e.target.value})} /> : <span>{Number(editForm?.transportAllow || 0).toLocaleString()} ر.س</span>}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border-b border-[#e8ddc8] bg-rose-50/30 print:bg-transparent print:border-gray-300">
                    <h4 className="text-[12px] font-black text-rose-700 mb-3 flex items-center gap-1.5 print:text-black"><AlertCircle size={14}/> الاستقطاعات (Deductions)</h4>
                    <div className="flex justify-between text-[11px] font-bold text-rose-600 items-center print:text-black">
                      <span>غياب / تأمينات / أخرى</span> 
                      {isEditing ? <input type="number" className="border border-red-300 rounded p-1 w-24 text-left" value={editForm.deductions} onChange={e => setEditForm({...editForm, deductions: e.target.value})} /> : <span>{Number(editForm?.deductions || 0).toLocaleString()} ر.س</span>}
                    </div>
                  </div>

                  <div className="p-5 bg-[#123f59] text-white flex justify-between items-center print:bg-gray-100 print:text-black">
                    <span className="text-[13px] font-bold text-[#d8b46a] print:text-black">صافي الراتب المستحق الدفع (Net Pay)</span>
                    <span className="text-xl font-black">{Number(editForm?.netSalary || 0).toLocaleString()} ر.س</span>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="p-4 border-t border-[#e8ddc8] bg-[#fbf8f1] flex justify-end gap-3 shrink-0 print:hidden">
                {isEditing ? (
                  <>
                    <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-[11px] font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">إلغاء</button>
                    <button onClick={handleSaveEdit} className="px-4 py-2 text-[11px] font-black text-white bg-[#0e7490] hover:bg-[#123f59] rounded-xl flex items-center gap-2 shadow-sm"><Save size={14} /> حفظ التعديلات</button>
                  </>
                ) : (
                  <>
                    <button onClick={handlePrint} className="px-4 py-2 text-[11px] font-black text-[#123f59] bg-white border border-[#e8ddc8] rounded-xl hover:bg-gray-50 flex items-center gap-2"><Printer size={14} /> طباعة القسيمة</button>
                    {selectedPayslip.status === "PENDING" && (
                      <button onClick={handleApprove} className="px-4 py-2 text-[11px] font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-2 shadow-sm"><CheckCircle size={14} /> اعتماد هذا المسير</button>
                    )}
                  </>
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* إضافة ستايل خفي لضبط الطباعة */}
      <style dangerouslySetContent={{__html: `
        @media print {
          body * { visibility: hidden; }
          .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
          .fixed.inset-0 { position: absolute; left: 0; top: 0; background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}} />
    </div>
  );
}