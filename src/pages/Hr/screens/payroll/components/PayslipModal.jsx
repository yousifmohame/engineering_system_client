// src/pages/Hr/screens/payroll/components/PayslipModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, XCircle, Plus, AlertCircle, Printer, Edit3, Save, Send } from "lucide-react";
import { toast } from "sonner";
import api from "../../../../../api/axios";

export default function PayslipModal({ selectedPayslip, setSelectedPayslip, isEditing, setIsEditing, refreshData }) {
  const [editForm, setEditForm] = useState(null);

  // تحديث بيانات التعديل عند فتح النافذة
  useEffect(() => {
    if (selectedPayslip) setEditForm({ ...selectedPayslip });
  }, [selectedPayslip]);

  if (!selectedPayslip || !editForm) return null;

  const currentNetSalary = isEditing 
    ? ((Number(editForm.baseSalary) || 0) + (Number(editForm.housingAllow) || 0) + (Number(editForm.transportAllow) || 0)) - (Number(editForm.deductions) || 0)
    : editForm.netSalary;

  // حفظ التعديلات
  const handleSaveEdit = async () => {
    try {
      await api.put(`/payrolls/${editForm.id}`, {
        baseSalary: Number(editForm.baseSalary),
        housingAllow: Number(editForm.housingAllow),
        transportAllow: Number(editForm.transportAllow),
        deductions: Number(editForm.deductions)
      });
      toast.success("تم حفظ التعديلات بنجاح");
      setIsEditing(false);
      setSelectedPayslip(null);
      refreshData();
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  // إرسال للمراجعة
  const handleRequestReview = async () => {
    try {
      await api.patch(`/payrolls/${selectedPayslip.id}/request-review`);
      toast.success("تم إرسال المسير للمراجعة بنجاح");
      setSelectedPayslip(null);
      refreshData();
    } catch (error) {
      toast.error("حدث خطأ أثناء الإرسال للمراجعة");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#06111d]/60 backdrop-blur-md overflow-y-auto print:bg-transparent print:p-0 print:block">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/90 backdrop-blur-2xl border border-white/70 rounded-[32px] w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col print:shadow-none print:border-0 print:block print:rounded-none">
          
          <div className="print:hidden flex flex-col h-full max-h-[85vh]">
            <div className="p-6 border-b border-white/50 flex justify-between items-center bg-white/50">
              <h3 className="font-black text-2xl text-[#123f59] flex items-center gap-3">
                <FileText className="text-teal-600" size={28}/> قسيمة راتب ({selectedPayslip.month})
              </h3>
              <button onClick={() => { setSelectedPayslip(null); setIsEditing(false); }} className="h-10 w-10 rounded-full bg-white/50 border border-white/60 text-gray-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white">
              {/* ملاحظات المشرف في حال الرفض أو الإرجاع */}
              {selectedPayslip.supervisorNote && (
                <div className={`border rounded-2xl p-4 mb-6 ${selectedPayslip.status === 'REJECTED' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                  <h4 className="text-sm font-black flex items-center gap-2 mb-1">
                    <AlertCircle size={18}/> {selectedPayslip.status === 'REJECTED' ? 'سبب الرفض:' : 'ملاحظات وتعديلات مطلوبة:'}
                  </h4>
                  <p className="text-sm font-bold">{selectedPayslip.supervisorNote}</p>
                </div>
              )}

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6">
                <h2 className="text-xl font-black text-[#123f59]">{selectedPayslip.employee?.name}</h2>
                <p className="text-sm text-gray-500 font-bold mt-1">الرقم الوظيفي: {selectedPayslip.employee?.employeeCode}</p>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-emerald-50/30">
                  <h4 className="text-sm font-black text-emerald-700 mb-4 flex items-center gap-2"><Plus size={18}/> المستحقات</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm font-bold text-gray-700 items-center">
                      <span>الراتب الأساسي</span> 
                      {isEditing ? <input type="number" className="border border-gray-300 rounded-lg p-2 w-32 outline-none focus:border-teal-500 font-black" value={editForm.baseSalary} onChange={e => setEditForm({...editForm, baseSalary: e.target.value})} /> : <span>{Number(editForm.baseSalary).toLocaleString()} ر.س</span>}
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-700 items-center">
                      <span>بدل السكن</span> 
                      {isEditing ? <input type="number" className="border border-gray-300 rounded-lg p-2 w-32 outline-none focus:border-teal-500 font-black" value={editForm.housingAllow} onChange={e => setEditForm({...editForm, housingAllow: e.target.value})} /> : <span>{Number(editForm.housingAllow).toLocaleString()} ر.س</span>}
                    </div>
                    <div className="flex justify-between text-sm font-bold text-gray-700 items-center">
                      <span>بدل النقل</span> 
                      {isEditing ? <input type="number" className="border border-gray-300 rounded-lg p-2 w-32 outline-none focus:border-teal-500 font-black" value={editForm.transportAllow} onChange={e => setEditForm({...editForm, transportAllow: e.target.value})} /> : <span>{Number(editForm.transportAllow).toLocaleString()} ر.س</span>}
                    </div>
                  </div>
                </div>

                <div className="p-5 border-b border-gray-200 bg-rose-50/50">
                  <h4 className="text-sm font-black text-rose-700 mb-4 flex items-center gap-2"><AlertCircle size={18}/> الاستقطاعات</h4>
                  <div className="flex justify-between text-sm font-bold text-rose-600 items-center">
                    <span>الخصومات</span> 
                    {isEditing ? <input type="number" className="border border-rose-300 rounded-lg p-2 w-32 outline-none focus:border-rose-500 font-black text-rose-700" value={editForm.deductions} onChange={e => setEditForm({...editForm, deductions: e.target.value})} /> : <span>{Number(editForm.deductions).toLocaleString()} ر.س</span>}
                  </div>
                </div>

                <div className="p-6 bg-[#123f59] text-white flex justify-between items-center">
                  <span className="text-base font-bold text-[#e0eafc]">الصافي المستحق</span>
                  <span className="text-2xl font-black">{currentNetSalary.toLocaleString()} ر.س</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 shrink-0">
              {isEditing ? (
                <>
                  <button onClick={() => {setIsEditing(false); setEditForm({...selectedPayslip});}} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">إلغاء</button>
                  <button onClick={handleSaveEdit} className="px-5 py-2.5 rounded-xl font-bold bg-teal-500 text-white hover:bg-teal-600 shadow-md transition-colors flex items-center gap-2">
                    <Save size={18} /> حفظ التعديلات
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => window.print()} className="px-5 py-2.5 rounded-xl font-bold bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors flex items-center gap-2">
                    <Printer size={18} /> طباعة
                  </button>

                  {(selectedPayslip.status === "PENDING" || selectedPayslip.status === "RETURNED") && (
                    <>
                      <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-2">
                        <Edit3 size={18} /> تعديل الأرقام
                      </button>
                      <button onClick={handleRequestReview} className="px-5 py-2.5 rounded-xl font-bold bg-[#123f59] text-white hover:bg-[#0c2a3d] shadow-md transition-colors flex items-center gap-2">
                        <Send size={18} /> إرسال للمراجعة
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ======================= */}
          {/* قالب الطباعة (مخفي بالشاشة) */}
          {/* ======================= */}
          <div id="printable-payslip" className="hidden print:block w-full bg-white text-black p-8" dir="rtl">
            <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
              <div>
                <h1 className="text-3xl font-black mb-1">مكتب الهندسة المتكامل</h1>
                <p className="text-lg text-gray-600 font-bold">قسيمة راتب موظف (Payslip)</p>
              </div>
              <div className="text-left font-bold text-sm">
                <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                <p>عن شهر: {selectedPayslip.month}</p>
              </div>
            </div>
            <div className="mb-8 p-4 border border-black rounded-lg bg-gray-50">
              <table className="w-full text-sm font-bold">
                <tbody>
                  <tr>
                    <td className="pb-2 w-1/4">اسم الموظف:</td>
                    <td className="pb-2 w-1/4 text-lg font-black">{selectedPayslip.employee?.name}</td>
                    <td className="pb-2 w-1/4">الرقم الوظيفي:</td>
                    <td className="pb-2 w-1/4 font-black">{selectedPayslip.employee?.employeeCode}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-6 mb-8">
              <div className="flex-1">
                <table className="w-full border-collapse border border-black text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-2 text-right font-black">المستحقات</th>
                      <th className="border border-black p-2 text-left font-black w-32">المبلغ (ر.س)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-black p-2 font-bold">الراتب الأساسي</td><td className="border border-black p-2 text-left">{Number(selectedPayslip.baseSalary).toLocaleString()}</td></tr>
                    <tr><td className="border border-black p-2 font-bold">بدل السكن</td><td className="border border-black p-2 text-left">{Number(selectedPayslip.housingAllow).toLocaleString()}</td></tr>
                    <tr><td className="border border-black p-2 font-bold">بدل النقل</td><td className="border border-black p-2 text-left">{Number(selectedPayslip.transportAllow).toLocaleString()}</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="flex-1">
                <table className="w-full border-collapse border border-black text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-black p-2 text-right font-black">الاستقطاعات</th>
                      <th className="border border-black p-2 text-left font-black w-32">المبلغ (ر.س)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-black p-2 font-bold">خصومات / غياب</td><td className="border border-black p-2 text-left">{Number(selectedPayslip.deductions).toLocaleString()}</td></tr>
                    <tr><td className="border border-black p-2 font-bold">&nbsp;</td><td className="border border-black p-2 text-left">&nbsp;</td></tr>
                    <tr><td className="border border-black p-2 font-bold">&nbsp;</td><td className="border border-black p-2 text-left">&nbsp;</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="border-2 border-black rounded-lg p-4 bg-gray-100 flex justify-between items-center mb-16">
              <span className="text-lg font-black">صافي الراتب المستحق الدفع</span>
              <span className="text-2xl font-black">{Number(selectedPayslip.netSalary).toLocaleString()} ر.س</span>
            </div>
            <div className="flex justify-between px-10 text-center font-bold">
              <div><p className="mb-8">توقيع الموظف</p><p className="border-t border-black w-48 mx-auto pt-2">التوقيع / التاريخ</p></div>
              <div><p className="mb-8">اعتماد الإدارة</p><p className="border-t border-black w-48 mx-auto pt-2">الختم والتوقيع</p></div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}