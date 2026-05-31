import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palmtree, Calendar, User, Clock, CheckCircle, XCircle, 
  Search, ShieldAlert, Loader2, Filter, FileText, Check, X, Building
} from "lucide-react";
import api from "../../../../api/axios";

export default function LeavesAbsenceManagement() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL"); // ALL | PENDING | APPROVED | REJECTED
  const [searchQuery, setSearchQuery] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // جلب كافة الطلبات المرفوعة من السيرفر
  const fetchAllRequests = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/employees/all/leave-requests");
      setRequests(res.data || []);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
  }, []);

  // معالجة قرار الإدارة (قبول أو رفض الطلب آلياً في قاعدة البيانات)
  const handleProcessRequest = async (leaveId, decision) => {
    setActionLoadingId(leaveId);
    try {
      await api.put(`/employees/leave-requests/${leaveId}/status`, { status: decision });
      
      // تحديث الحالة محلياً في الواجهة لتوفير سرعة استجابة فائقة
      setRequests(prev => 
        prev.map(req => req.id === leaveId ? { ...req, status: decision } : req)
      );
    } catch (error) {
      alert("فشل تحديث حالة الطلب في قاعدة البيانات");
    } finally {
      setActionLoadingId(null);
    }
  };

  // حساب الأيام ديناميكياً لتجنب مشاكل التخزين
  const calculateDays = (start, end) => {
    const diffTime = Math.abs(new Date(end) - new Date(start));
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // تصفية وحصر الطلبات بناءً على البحث والفلترة المخصصة
  const filteredRequests = requests.filter(req => {
    const matchesStatus = filterStatus === "ALL" || req.status === filterStatus;
    const matchesSearch = (req.employee?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (req.type || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === "PENDING").length;

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] p-4 lg:p-6 overflow-y-auto custom-scrollbar animate-in fade-in">
      
      {/* قسم كروت الإحصائيات العليا الإستراتيجية */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        <div className="bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><Clock size={24} /></div>
          <div>
            <p className="text-[11px] font-bold text-[#64748b]">طلبات قيد المراجعة</p>
            <p className="text-xl font-black text-[#123f59]">{pendingCount} طلبات</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><CheckCircle size={24} /></div>
          <div>
            <p className="text-[11px] font-bold text-[#64748b]">الطلبات المعتمدة</p>
            <p className="text-xl font-black text-[#123f59]">{requests.filter(r => r.status === "APPROVED").length} طلب</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center"><Palmtree size={24} /></div>
          <div>
            <p className="text-[11px] font-bold text-[#64748b]">إجمالي الطلبات المرفوعة</p>
            <p className="text-xl font-black text-[#123f59]">{requests.length} إجازة</p>
          </div>
        </div>
      </div>

      {/* شريط التحكم، أدوات الفلترة والبحث الذكي */}
      <div className="bg-white rounded-xl border border-[#e8ddc8] p-3 shadow-xs shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" size={16} />
          <input 
            type="text" 
            placeholder="بحث باسم الموظف أو نوع الإجازة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-9 pl-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[11px] font-bold outline-none focus:border-[#0e7490]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-[#fbf8f1] p-1 rounded-xl border border-[#e8ddc8] w-full sm:w-auto overflow-x-auto">
          {[
            { id: "ALL", label: "الكل" },
            { id: "PENDING", label: "قيد الانتظار" },
            { id: "APPROVED", label: "المعتمدة" },
            { id: "REJECTED", label: "المرفوضة" }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilterStatus(btn.id)}
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all whitespace-nowrap ${
                filterStatus === btn.id ? "bg-[#0e7490] text-white shadow-xs" : "text-[#64748b] hover:text-[#123f59]"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* لوحة عرض البيانات المركزية ومستندات الموظفين */}
      <div className="flex-1 bg-white border border-[#e8ddc8] rounded-2xl shadow-xs overflow-hidden flex flex-col relative min-h-[400px]">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-xs">
            <Loader2 className="w-8 h-8 animate-spin text-[#0e7490]" />
          </div>
        ) : (
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-right border-collapse text-[11px]">
              <thead className="bg-[#fbf8f1] border-b border-[#e8ddc8] sticky top-0 font-black text-[#123f59]">
                <tr>
                  <th className="p-4">الموظف</th>
                  <th className="p-4">تفاصيل ونوع الإجازة</th>
                  <th className="p-4">الفترة الزمنية</th>
                  <th className="p-4">المدة المحسوبة</th>
                  <th className="p-4">الحالة الإدارية</th>
                  <th className="p-4 text-center">الإجراء والاعتماد</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16 text-[#94a3b8] font-bold">
                      <ShieldAlert className="mx-auto mb-2 opacity-40 text-[#123f59]" size={40} />
                      لا توجد طلبات إجازة تطابق الفلاتر المحددة حالياً.
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map(req => {
                    const days = calculateDays(req.startDate, req.endDate);
                    return (
                      <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors last:border-0">
                        {/* عمود الموظف وعقد العمل */}
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-[#fbf8f1] border border-[#e8ddc8] flex items-center justify-center text-[#0e7490] font-bold"><User size={14} /></div>
                            <div>
                              <p className="font-black text-[#123f59] text-[12px]">{req.employee?.name || "موظف عام"}</p>
                              <p className="text-[9px] text-[#94a3b8] font-bold flex items-center gap-1 mt-0.5"><Building size={10} /> {req.employee?.department} • {req.employee?.position}</p>
                            </div>
                          </div>
                        </td>

                        {/* تفاصيل المبررات */}
                        <td className="p-4">
                          <p className="font-black text-[#123f59]">{req.type}</p>
                          <p className="text-[10px] text-[#94a3b8] font-bold max-w-xs truncate mt-0.5" title={req.reason}>📝 السبب: {req.reason || "لم تدون ملاحظات"}</p>
                        </td>

                        {/* التاريخ المسجل للتفرغ */}
                        <td className="p-4 font-medium text-gray-600">
                          <span className="block">من: {new Date(req.startDate).toLocaleDateString('ar-SA')}</span>
                          <span className="block mt-0.5">إلى: {new Date(req.endDate).toLocaleDateString('ar-SA')}</span>
                        </td>

                        {/* المدة الفعالة للأيام */}
                        <td className="p-4 font-black text-[#0e7490]">{days} أيام دوام</td>

                        {/* الحالة الجارية */}
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black ${
                            req.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' :
                            req.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {req.status === 'APPROVED' ? 'مقبولة ومعتمدة' : req.status === 'REJECTED' ? 'مرفوضة قطيعاً' : 'في انتظار التدقيق'}
                          </span>
                        </td>

                        {/* أزرار اتخاذ القرار التشغيلي آلياً لقاعدة البيانات */}
                        <td className="p-4 text-center">
                          {req.status === "PENDING" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleProcessRequest(req.id, "APPROVED")}
                                disabled={actionLoadingId !== null}
                                className="p-1.5 bg-green-50 text-green-700 border border-green-200 hover:bg-green-600 hover:text-white rounded-lg transition-all"
                                title="اعتماد الإجازة"
                              >
                                {actionLoadingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={13} />}
                              </button>
                              <button
                                onClick={() => handleProcessRequest(req.id, "REJECTED")}
                                disabled={actionLoadingId !== null}
                                className="p-1.5 bg-red-50 text-red-700 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-all"
                                title="رفض الإجازة"
                              >
                                {actionLoadingId === req.id ? <Loader2 size={12} className="animate-spin" /> : <X size={13} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-[#94a3b8]">تمت معالجة الطلب</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}