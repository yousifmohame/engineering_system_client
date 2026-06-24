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
  CheckCheck
} from "lucide-react";
import axios from "../../../api/axios"; // تأكد من استيراد إعدادات axios الخاصة بمشروعك (مثلاً من api/axiosConfig)

const PayrollSupervisorScreen = () => {
  // === الحالات (States) ===
  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [sourceFilter, setSourceFilter] = useState("ALL");
  
  // حالات التعديل
  const [editModal, setEditModal] = useState({ isOpen: false, data: null });
  const [saving, setSaving] = useState(false);

  // مرجع لرفع الملفات
  const fileInputRef = useRef(null);

  // === جلب البيانات ===
  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      // قم بتعديل المسار حسب إعدادات الـ axios الخاصة بك
      const response = await axios.get(`/payrolls?month=${monthFilter}&source=${sourceFilter}`);
      setPayrolls(response.data);
    } catch (error) {
      console.error("Error fetching payrolls:", error);
      // يمكن إضافة إشعار خطأ هنا (Toast)
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

  // 2. الاعتماد (Approve)
  const handleApprove = async (id) => {
    try {
      await axios.patch(`/payrolls/${id}/approve`);
      fetchPayrolls(); // تحديث القائمة
    } catch (error) {
      console.error("Error approving payroll:", error);
    }
  };

  // 3. تحديث القسيمة
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

  // 4. رفع ملف مدد
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
      e.target.value = null; // إعادة تعيين الحقل
    }
  };

  // === دوال مساعدة للواجهة ===
  const getStatusBadge = (status) => {
    const badges = {
      PENDING: "bg-gray-100 text-gray-700 border-gray-200",
      UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
      APPROVED: "bg-blue-50 text-blue-700 border-blue-200",
      PAID: "bg-emerald-50 text-emerald-700 border-emerald-200"
    };
    const labels = {
      PENDING: "مسودة",
      UNDER_REVIEW: "بانتظار الاعتماد",
      APPROVED: "معتمد",
      PAID: "مدفوع (مدد)"
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[status] || badges.PENDING}`}>
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
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-right">
            <thead className="bg-[#123f59]/5 text-[#123f59] sticky top-0 backdrop-blur-md z-10">
              <tr>
                <th className="p-4 font-black whitespace-nowrap">الموظف</th>
                <th className="p-4 font-black whitespace-nowrap">القسم</th>
                <th className="p-4 font-black whitespace-nowrap">الأساسي</th>
                <th className="p-4 font-black whitespace-nowrap">البدلات</th>
                <th className="p-4 font-black whitespace-nowrap">الخصومات</th>
                <th className="p-4 font-black whitespace-nowrap">الصافي</th>
                <th className="p-4 font-black whitespace-nowrap">المصدر</th>
                <th className="p-4 font-black whitespace-nowrap text-center">الحالة</th>
                <th className="p-4 font-black whitespace-nowrap text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/50">
              {loading && payrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-8 text-center text-gray-500 font-bold">
                    جاري تحميل البيانات...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="9" className="p-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-lg">لا توجد مسيرات رواتب لهذا الشهر</p>
                    <p className="text-sm">قم بتوليد المسير أو تغيير فلاتر البحث</p>
                  </td>
                </tr>
              ) : (
                payrolls.map((record) => (
                  <tr key={record.id} className="hover:bg-white/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#123f59]">{record.employee.name}</div>
                      <div className="text-xs text-gray-500 font-bold">{record.employee.employeeCode}</div>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-600">{record.employee.department}</td>
                    <td className="p-4 font-bold text-gray-700">{record.baseSalary} ر.س</td>
                    <td className="p-4 text-sm font-bold text-gray-600">
                      <div>سكن: {record.housingAllow}</div>
                      <div>نقل: {record.transportAllow}</div>
                    </td>
                    <td className="p-4 font-bold text-rose-600">{record.deductions} ر.س</td>
                    <td className="p-4 font-black text-emerald-600 text-lg">{record.netSalary} ر.س</td>
                    <td className="p-4">{getSourceBadge(record.source)}</td>
                    <td className="p-4 text-center">{getStatusBadge(record.status)}</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        {/* زر التعديل يظهر فقط إذا لم يكن مدفوعاً */}
                        {record.status !== "PAID" && (
                          <button 
                            onClick={() => setEditModal({ isOpen: true, data: { ...record } })}
                            className="p-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200 transition-colors"
                            title="تعديل الأرقام"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        
                        {/* زر الاعتماد يظهر للمسودات أو تحت المراجعة */}
                        {(record.status === "PENDING" || record.status === "UNDER_REVIEW") && (
                          <button 
                            onClick={() => handleApprove(record.id)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#123f59] text-white hover:bg-[#0c2a3d] shadow-md transition-colors text-sm font-bold"
                          >
                            <CheckCircle className="w-4 h-4" />
                            اعتماد
                          </button>
                        )}

                        {record.status === "APPROVED" && (
                          <span className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 text-sm font-bold cursor-default">
                            <CheckCheck className="w-4 h-4" />
                            بانتظار مدد
                          </span>
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

      {/* ─── مودال التعديل ─── */}
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