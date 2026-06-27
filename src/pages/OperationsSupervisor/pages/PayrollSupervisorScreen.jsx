import React, { useState, useEffect, useRef } from "react";
import { 
  CheckCircle, 
  UploadCloud, 
  Edit, 
  Search, 
  RefreshCw, 
  AlertCircle,
  FileText,
  DollarSign,
  X,
  CheckCheck,
  Undo
} from "lucide-react";
import axios from "../../../api/axios"; // تأكد من المسار حسب مشروعك

const PayrollSupervisorScreen = () => {
  // === الحالات (States) ===
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [sourceFilter, setSourceFilter] = useState("ALL");
  
  // حالة نافذة إجراءات المشرف (الاعتماد / الرفض / الإرجاع)
  const [actionModal, setActionModal] = useState({ isOpen: false, data: null, actionType: null, note: "" });
  
  // حالات التعديل المالي المباشر (اختياري للمشرف)
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [saving, setSaving] = useState(false);

  // مرجع لرفع الملفات
  const fileInputRef = useRef(null);

  // === جلب البيانات ===
  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/payrolls?month=${monthFilter}&source=${sourceFilter}`);
      setPayrolls(response.data);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [monthFilter, sourceFilter]);

  // === العمليات (Actions) ===

  // 1. توليد المسير
  const handleGenerate = async () => {
    setLoading(true);
    try {
      await axios.post('/payrolls/generate', { month: monthFilter });
      fetchPayrolls();
    } catch (error) {
      console.error("Error generating payrolls:", error);
    }
  };

  // 2. تنفيذ إجراء المشرف (اعتماد / إرجاع / رفض)
  const executeSupervisorAction = async () => {
    setSaving(true);
    try {
      await axios.post(`/payrolls/${actionModal.data.id}/supervisor-action`, {
        action: actionModal.actionType,
        note: actionModal.note
      });
      setActionModal({ isOpen: false, data: null, actionType: null, note: "" });
      fetchPayrolls();
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setSaving(false);
    }
  };

  // 3. إلغاء الاعتماد
  const handleRevoke = async (id) => {
    if(!window.confirm("هل أنت متأكد من إلغاء الاعتماد لإرجاعه للتعديل؟")) return;
    try {
      await axios.patch(`/payrolls/${id}/revoke`);
      fetchPayrolls();
    } catch (error) {
      console.error("Revoke error:", error);
    }
  };

  // 4. تحديث القسيمة مالياً (تعديل مباشر من المشرف)
  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      await axios.put(`/payrolls/${editModal.data.id}`, {
        baseSalary: editModal.data.baseSalary,
        housingAllow: editModal.data.housingAllow,
        transportAllow: editModal.data.transportAllow,
        deductions: editModal.data.deductions
      });
      setEditModal({ isOpen: false, data: null });
      fetchPayrolls();
    } catch (error) {
      console.error("Error updating payroll:", error);
    } finally {
      setSaving(false);
    }
  };

  // 5. رفع ملف مدد
  const handleMudadUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      await axios.post('/payrolls/upload-mudad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchPayrolls();
    } catch (error) {
      console.error("Error uploading mudad:", error);
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  // === دوال مساعدة للواجهة ===
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
      UNDER_REVIEW: "قيد المراجعة",
      APPROVED: "معتمد",
      RETURNED: "مُرجع للتعديل",
      REJECTED: "مرفوض",
      PAID: "مدفوع (مدد)"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${badges[status] || badges.PENDING}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getSourceBadge = (source) => {
    return source === "MUDAD" ? (
      <span className="text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded text-xs border border-emerald-100">مدد</span>
    ) : (
      <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded text-xs border border-indigo-100">نظامي</span>
    );
  };

  return (
    <div className="h-full flex flex-col p-6 font-cairo">
      {/* ─── الهيدر والفلترة ─── */}
      <div className="bg-white/60 backdrop-blur-xl border border-white/50 p-5 rounded-3xl shadow-sm mb-6 flex flex-wrap gap-4 items-end justify-between">
        
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-bold text-[#123f59] mb-1">الشهر</label>
            <input 
              type="month" 
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-white/80 border border-gray-200 text-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[#123f59] mb-1">المصدر</label>
            <select 
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-white/80 border border-gray-200 text-gray-700 rounded-xl px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold min-w-[150px]"
            >
              <option value="ALL">الكل</option>
              <option value="SYSTEM">نظامي (مكتبي)</option>
              <option value="MUDAD">منصة مدد</option>
            </select>
          </div>

          <button 
            onClick={fetchPayrolls}
            className="mt-6 bg-white border border-gray-200 text-gray-600 p-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={handleGenerate}
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>توليد المسير</span>
          </button>

          <input 
            type="file" 
            accept=".csv, .xlsx, .xls"
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleMudadUpload} 
          />
          <button 
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2.5 rounded-xl font-bold shadow-md hover:bg-teal-600 transition-colors shadow-teal-500/20"
          >
            <UploadCloud className="w-5 h-5" />
            <span>رفع ملف مدد</span>
          </button>
        </div>
      </div>

      {/* ─── جدول البيانات ─── */}
      <div className="flex-1 bg-white/60 backdrop-blur-xl border border-white/50 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-[#123f59]/5 text-[#123f59] sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="p-4 font-black text-sm whitespace-nowrap">الموظف</th>
                <th className="p-4 font-black text-sm whitespace-nowrap">الأساسي</th>
                <th className="p-4 font-black text-sm whitespace-nowrap">البدلات</th>
                <th className="p-4 font-black text-sm whitespace-nowrap text-rose-700">الخصومات</th>
                <th className="p-4 font-black text-sm whitespace-nowrap">الصافي</th>
                <th className="p-4 font-black text-sm whitespace-nowrap">المصدر</th>
                <th className="p-4 font-black text-sm whitespace-nowrap text-center">الحالة</th>
                <th className="p-4 font-black text-sm whitespace-nowrap text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading && payrolls.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-8 text-center text-gray-500 font-bold">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40 text-[#123f59]" />
                    <p className="font-black text-lg text-[#123f59]">لا توجد مسيرات رواتب لهذا الشهر</p>
                    <p className="text-sm font-bold">قم بتوليد المسير أو تغيير فلاتر البحث</p>
                  </td>
                </tr>
              ) : (
                payrolls.map((record) => (
                  <tr key={record.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4 align-middle">
                      <div className="font-black text-[#123f59] text-sm">{record.employee?.name}</div>
                      <div className="text-xs text-gray-500 font-bold mt-1">{record.employee?.employeeCode} - {record.employee?.department}</div>
                    </td>
                    <td className="p-4 font-bold text-gray-600 text-sm align-middle">{Number(record.baseSalary).toLocaleString()} ر.س</td>
                    <td className="p-4 text-sm font-bold text-emerald-600 align-middle">
                      +{(Number(record.housingAllow) + Number(record.transportAllow)).toLocaleString()} ر.س
                    </td>
                    <td className="p-4 font-bold text-rose-500 text-sm align-middle">-{Number(record.deductions).toLocaleString()} ر.س</td>
                    <td className="p-4 font-black text-[#123f59] text-base align-middle">{Number(record.netSalary).toLocaleString()} ر.س</td>
                    <td className="p-4 align-middle">{getSourceBadge(record.source)}</td>
                    <td className="p-4 text-center align-middle">{getStatusBadge(record.status)}</td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* أزرار الإجراءات إذا كان قيد المراجعة */}
                        {record.status === "UNDER_REVIEW" && (
                          <>
                            <button onClick={() => setActionModal({ isOpen: true, data: record, actionType: "APPROVE", note: "" })} className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="اعتماد">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => setActionModal({ isOpen: true, data: record, actionType: "RETURN", note: "" })} className="p-2 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors" title="إرجاع للتعديل">
                              <Undo className="w-4 h-4" />
                            </button>
                            <button onClick={() => setActionModal({ isOpen: true, data: record, actionType: "REJECT", note: "" })} className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors" title="رفض">
                              <X className="w-4 h-4" />
                            </button>
                            
                            {/* زر تعديل مباشر للمشرف (اختياري) */}
                            <button onClick={() => setEditModal({ isOpen: true, data: { ...record } })} className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-200 transition-colors" title="تعديل مالي مباشر">
                              <Edit className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {/* زر إلغاء الاعتماد إذا كان معتمداً */}
                        {record.status === "APPROVED" && (
                          <button onClick={() => handleRevoke(record.id)} className="px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 border border-gray-200 hover:bg-rose-50 hover:text-rose-600 transition-colors text-xs font-bold shadow-sm">
                            إلغاء الاعتماد
                          </button>
                        )}

                        {record.status === "RETURNED" && <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-lg">عند الموارد البشرية</span>}
                        {record.status === "REJECTED" && <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-1 rounded-lg">مرفوض نهائياً</span>}
                        
                        {/* حالة المسودة */}
                        {record.status === "PENDING" && (
                           <span className="text-xs text-gray-500 font-bold bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg">بانتظار الإرسال</span>
                        )}

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── مودال إجراءات المشرف (اعتماد / إرجاع / رفض) ─── */}
      {actionModal.isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className={`p-5 border-b flex justify-between items-center text-white 
              ${actionModal.actionType === 'APPROVE' ? 'bg-emerald-600' : 
                actionModal.actionType === 'RETURN' ? 'bg-amber-500' : 'bg-rose-600'}`}>
              <h3 className="font-black text-xl flex items-center gap-2">
                {actionModal.actionType === 'APPROVE' && <CheckCircle className="w-6 h-6"/>}
                {actionModal.actionType === 'RETURN' && <Undo className="w-6 h-6"/>}
                {actionModal.actionType === 'REJECT' && <X className="w-6 h-6"/>}
                
                {actionModal.actionType === 'APPROVE' && 'تأكيد الاعتماد'}
                {actionModal.actionType === 'RETURN' && 'إرجاع للتعديل'}
                {actionModal.actionType === 'REJECT' && 'رفض المسير'}
              </h3>
            </div>
            
            <div className="p-6">
              <div className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <p className="text-sm font-bold text-gray-600">الموظف: <span className="font-black text-[#123f59]">{actionModal.data?.employee?.name}</span></p>
                <p className="text-sm font-bold text-gray-600 mt-1">الصافي: <span className="font-black text-[#123f59]">{Number(actionModal.data?.netSalary).toLocaleString()} ر.س</span></p>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">ملاحظات المشرف (اختياري / إلزامي في حالة الرفض)</label>
              <textarea 
                rows="4"
                value={actionModal.note}
                onChange={(e) => setActionModal({ ...actionModal, note: e.target.value })}
                placeholder="اكتب أسباب الإرجاع أو الرفض أو أي ملاحظات هنا..."
                className="w-full bg-white border border-gray-300 rounded-xl p-3 font-bold focus:ring-2 focus:ring-teal-500 outline-none resize-none"
              />
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
              <button onClick={() => setActionModal({ isOpen: false, data: null, actionType: null, note: "" })} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                إلغاء
              </button>
              <button onClick={executeSupervisorAction} disabled={saving || (actionModal.actionType === 'REJECT' && !actionModal.note.trim())} className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-md transition-colors flex items-center gap-2 disabled:opacity-50 
                ${actionModal.actionType === 'APPROVE' ? 'bg-emerald-600 hover:bg-emerald-700' : 
                  actionModal.actionType === 'RETURN' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-600 hover:bg-rose-700'}`}>
                {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'تأكيد الإجراء'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ─── مودال التعديل المالي المباشر (للمشرف) ─── */}
      {editModal.isOpen && editModal.data && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-5 bg-gradient-to-r from-gray-50 to-white border-b flex justify-between items-center">
              <h3 className="font-black text-xl text-[#123f59] flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-teal-600" />
                تعديل مسير {editModal.data.employee.name}
              </h3>
              <button onClick={() => setEditModal({ isOpen: false, data: null })} className="text-gray-400 hover:text-rose-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">الراتب الأساسي</label>
                <input 
                  type="number" 
                  value={editModal.data.baseSalary}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, baseSalary: e.target.value } })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">بدل السكن</label>
                  <input 
                    type="number" 
                    value={editModal.data.housingAllow}
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, housingAllow: e.target.value } })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">بدل النقل</label>
                  <input 
                    type="number" 
                    value={editModal.data.transportAllow}
                    onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, transportAllow: e.target.value } })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-rose-600 mb-1">الخصومات</label>
                <input 
                  type="number" 
                  value={editModal.data.deductions}
                  onChange={(e) => setEditModal({ ...editModal, data: { ...editModal.data, deductions: e.target.value } })}
                  className="w-full bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-2.5 font-bold focus:ring-2 focus:ring-rose-500"
                />
              </div>

              {/* حساب الصافي المباشر */}
              <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex justify-between items-center">
                <span className="font-bold text-emerald-800">الصافي المتوقع:</span>
                <span className="text-xl font-black text-emerald-600">
                  {((parseFloat(editModal.data.baseSalary || 0) + parseFloat(editModal.data.housingAllow || 0) + parseFloat(editModal.data.transportAllow || 0)) - parseFloat(editModal.data.deductions || 0)).toFixed(2)} ر.س
                </span>
              </div>
            </div>

            <div className="p-5 bg-gray-50 border-t flex justify-end gap-3">
              <button 
                onClick={() => setEditModal({ isOpen: false, data: null })}
                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-bold bg-teal-500 text-white hover:bg-teal-600 shadow-md shadow-teal-500/30 transition-colors flex items-center gap-2"
              >
                {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                حفظ التعديلات
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PayrollSupervisorScreen;