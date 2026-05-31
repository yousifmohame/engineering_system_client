import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar, Clock,
  FileText, Edit2, Plus, CheckCircle, XCircle, AlertCircle,
  Building, CreditCard, Shield, Palmtree, ArrowRight, Lock, KeyRound, Loader2, RefreshCw
} from "lucide-react";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext"; // ✅ استيراد سياق المصادقة (تأكد من دقة مسار الاستيراد حسب مجلداتك)

// --- مكونات فرعية مساعدة وموحدة التصميم ---
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 bg-[#fbf8f1] rounded-xl border border-[#e8ddc8]/50">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white text-[#0e7490] shadow-sm shrink-0">
      <Icon size={16} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold text-[#94a3b8]">{label}</p>
      <p className="text-[12px] font-black text-[#123f59] truncate">{value || "غير محدد"}</p>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, colorClass }) => (
  <div className="bg-white p-4 rounded-2xl border border-[#e8ddc8] shadow-sm flex items-center gap-4 flex-1 min-w-[200px]">
    <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${colorClass}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-[11px] font-bold text-[#64748b]">{label}</p>
      <p className="text-xl font-black text-[#123f59]">{value}</p>
    </div>
  </div>
);

const EmployeePortal = () => {
  // ✅ 1. جلب المستخدم الحالي من الـ Context
  const { user } = useAuth(); 

  // --- حالات التبويبات والتحميل ---
  const [activeTab, setActiveTab] = useState("overview");
  
  // تهيئة مبدئية لبيانات الموظف من الـ Context لتسريع عرض الواجهة
  const [employee, setEmployee] = useState(user || null); 
  const [leaves, setLeaves] = useState([]);
  const [attendanceAnalysis, setAttendanceAnalysis] = useState(null);
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // --- حالات النوافذ المنبثقة (Modals) ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // --- حالات النماذج ---
  const [editForm, setEditForm] = useState({ phone: "", email: "", cityAr: "", districtAr: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [leaveForm, setLeaveForm] = useState({ type: "إجازة سنوية", startDate: "", endDate: "", reason: "" });

  // ==========================================
  // 2. محرك جلب البيانات المركزي من الباك-إند
  // ==========================================
  const loadPortalData = useCallback(async () => {
    // إذا لم يكن المستخدم موجوداً في الـ Context بعد، انتظر.
    if (!user || !user.id) return; 

    setIsLoading(true);
    setErrorMessage("");
    try {
      // أ. جلب أحدث بيانات الموظف (لضمان حصولنا على رصيد الإجازات المحدث وغيرها)
      const meRes = await api.get("/employees/me");
      const empData = meRes.data;
      setEmployee(empData);

      setEditForm({
        phone: empData.phone || "",
        email: empData.email || "",
        cityAr: empData.cityAr || "",
        districtAr: empData.districtAr || "",
      });

      // ب. جلب سجل الإجازات الخاص بالموظف بناءً على user.id
      const leavesRes = await api.get(`/employees/${user.id}/leave-requests`);
      setLeaves(leavesRes.data || []);

      // ج. استدعاء محرك تحليل التايم شيت لليوم الحالي بناءً على user.id
      const attendanceRes = await api.get(`/employees/${user.id}/attendance-analysis`, {
        params: { targetDate: targetDate }
      });
      setAttendanceAnalysis(attendanceRes.data);

    } catch (error) {
      console.error("Portal Data Load Error:", error);
      setErrorMessage("حدث خطأ أثناء جلب بيانات البوابة من الخادم. يرجى التحقق من الصلاحيات.");
    } finally {
      setIsLoading(false);
    }
  }, [targetDate, user]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // تحديث تحليل الحضور عند تغيير التاريخ המختار
  const handleRefreshAttendance = async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/employees/${user.id}/attendance-analysis`, {
        params: { targetDate: targetDate }
      });
      setAttendanceAnalysis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // 3. معالجة الإجراءات (تحديث، طلب إجازة، تغيير باسورد)
  // ==========================================
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await api.put(`/employees/${user.id}`, editForm);
      setEmployee(res.data);
      setIsEditModalOpen(false);
      alert("تم تحديث بيانات التواصل بنجاح.");
    } catch (error) {
      alert(error.response?.data?.message || "فشل تحديث البيانات");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("كلمة المرور الجديدة غير متطابقة مع تأكيد كلمة المرور!");
      return;
    }
    setIsActionLoading(true);
    try {
      await api.put(`/employees/${user.id}`, { password: passwordForm.newPassword });
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("تم تغيير كلمة المرور بنجاح.");
    } catch (error) {
      alert("حدث خطأ أثناء الاتصال بالخادم.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      await api.post(`/employees/${user.id}/leave-requests`, leaveForm);
      
      // جلب الإجازات المحدثة بعد إضافة الطلب الجديد
      const leavesRes = await api.get(`/employees/${user.id}/leave-requests`);
      setLeaves(leavesRes.data || []);
      
      setIsLeaveModalOpen(false);
      setLeaveForm({ type: "إجازة سنوية", startDate: "", endDate: "", reason: "" });
      alert("تم إرسال طلب الإجازة بنجاح، وهو الآن قيد المراجعة الإدارية.");
    } catch (error) {
      alert(error.response?.data?.message || "فشل إرسال طلب الإجازة");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !employee) {
    return (
      <div className="flex h-full items-center justify-center bg-[#fbf8f1]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#0e7490]" />
          <span className="text-[12px] font-black text-[#123f59]">جاري تحميل بيئة بوابة الموظف...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#f4f1ea] overflow-y-auto custom-scrollbar animate-in fade-in">
      
      {/* غلاف الحساب الرأسي واللوحة التعريفية */}
      <div className="bg-white border-b border-[#e8ddc8] pb-6 shrink-0 relative">
        <div className="h-32 bg-gradient-to-r from-[#123f59] to-[#0e7490] w-full relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 relative flex flex-col sm:flex-row gap-6 items-start sm:items-end -mt-12">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl border-4 border-white bg-[#fbf8f1] shadow-md flex items-center justify-center overflow-hidden">
              {employee?.profilePicture ? (
                <img src={employee.profilePicture} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-[#0e7490]" />
              )}
            </div>
            <div className={`absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-sm border-2 border-white text-white ${employee?.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}>
              {employee?.status === 'active' ? 'نشط' : 'مجمّد'}
            </div>
          </div>

          <div className="flex-1 mb-2">
            <h1 className="text-xl font-black text-[#123f59]">{employee?.name}</h1>
            <p className="text-[11px] font-bold text-[#64748b] flex items-center gap-2 mt-1">
              <Briefcase size={13} className="text-[#d8b46a]" /> {employee?.position} 
              <span className="text-gray-300">•</span> 
              <Building size={13} className="text-[#d8b46a]" /> {employee?.department}
            </p>
          </div>

          {/* أزرار لوحة العمليات الخاصة بالموظف */}
          <div className="flex items-center gap-2 mb-2 w-full sm:w-auto flex-wrap">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-[#e8ddc8] text-[#123f59] hover:bg-gray-50 rounded-xl text-[11px] font-black transition-all shadow-xs"
            >
              <Edit2 size={14} /> تعديل بياناتي
            </button>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-rose-100 text-rose-600 hover:bg-rose-50 rounded-xl text-[11px] font-black transition-all shadow-xs"
            >
              <Lock size={14} /> كلمة المرور
            </button>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-[#0e7490] text-white rounded-xl text-[11px] font-black hover:bg-[#123f59] transition-all shadow-sm"
            >
              <Plus size={14} /> طلب إجازة
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-6xl mx-auto w-full px-6 mt-4">
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 font-bold text-[11px] rounded-xl flex items-center gap-2">
            <AlertCircle size={16} /> {errorMessage}
          </div>
        </div>
      )}

      {/* المحتوى والمؤشرات الرقمية */}
      <div className="max-w-6xl mx-auto w-full p-4 lg:p-6 flex flex-col md:flex-row gap-6 flex-1">
        
        {/* اللوحة اليمنى التفصيلية */}
        <div className="w-full md:w-72 flex flex-col gap-4 shrink-0">
          <StatCard icon={Palmtree} label="رصيد الإجازات الحالي" value={`${employee?.leaveBalance || 21} يوم`} colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" />
          <StatCard icon={Clock} label="نوع ونظام الدوام" value={employee?.shiftType === 'FIXED' ? 'دوام ثابت رسمي' : 'ساعات مرنة تخدم المشاريع'} colorClass="bg-cyan-50 text-cyan-600 border border-cyan-100" />

          <div className="bg-white rounded-2xl border border-[#e8ddc8] shadow-sm overflow-hidden">
            <div className="bg-[#fbf8f1] px-4 py-2.5 border-b border-[#e8ddc8]">
              <h3 className="text-[11px] font-black text-[#123f59] flex items-center gap-1.5">
                <Shield size={14} className="text-[#d8b46a]" /> قنوات الاتصال والعنوان
              </h3>
            </div>
            <div className="p-3 flex flex-col gap-2">
              <InfoItem icon={Mail} label="البريد الوظيفي المعتمد" value={employee?.email} />
              <InfoItem icon={Phone} label="رقم الجوال الشخصي" value={employee?.phone} />
              <InfoItem icon={MapPin} label="المنطقة والسكن" value={employee?.cityAr ? `${employee.cityAr}، ${employee.districtAr || ''}` : 'غير مدخل'} />
            </div>
          </div>
        </div>

        {/* لوحة تبويبات التنقل الكبرى */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-[#e8ddc8] shadow-xs overflow-x-auto custom-scrollbar-slim">
            {[
              { id: "overview", label: "البنية الوظيفية", icon: Shield },
              { id: "leaves", label: "الأرشيف التاريخي للإجازات", icon: Palmtree },
              { id: "attendance", label: "سجل البصمة والتايم شيت", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[11px] font-black transition-all whitespace-nowrap ${
                  activeTab === tab.id ? "bg-[#0e7490] text-white shadow-xs" : "text-[#64748b] hover:bg-[#fbf8f1] hover:text-[#123f59]"
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex-1">
            <AnimatePresence mode="wait">
              
              {/* التبويب الأول: البنية الوظيفية */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="bg-white rounded-xl border border-[#e8ddc8] shadow-xs p-5 space-y-4">
                  <h3 className="text-[13px] font-black text-[#123f59] border-b border-[#e8ddc8] pb-2">التوثيق الإداري والملف العقدي</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem icon={User} label="الرقم التعريفي (Code)" value={employee?.employeeCode} />
                    <InfoItem icon={Building} label="القطاع والإدارة" value={employee?.department} />
                    <InfoItem icon={Briefcase} label="وظيفة المنصة (Position)" value={employee?.position} />
                    <InfoItem icon={Calendar} label="تاريخ توقيع المباشرة" value={employee?.hireDate ? new Date(employee.hireDate).toLocaleDateString('ar-SA') : ''} />
                    <InfoItem icon={CreditCard} label="رقم الهوية الوطنية / الإقامة" value={employee?.nationalId || employee?.iqamaNumber} />
                    <InfoItem icon={Clock} label="معرف نظام البصمة (ZKTeco ID)" value={employee?.fingerprintId || "غير مرتبط بجهاز الحضور"} />
                  </div>
                </motion.div>
              )}

              {/* التبويب الثاني: أرشيف الإجازات */}
              {activeTab === "leaves" && (
                <motion.div key="leaves" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="bg-white rounded-xl border border-[#e8ddc8] shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-[#e8ddc8] bg-[#fbf8f1] flex justify-between items-center">
                    <h3 className="text-[13px] font-black text-[#123f59]">الطلبات المرفوعة ومراحل الاعتماد</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-[11px]">
                      <thead className="bg-gray-50 font-bold text-[#64748b] border-b border-[#e8ddc8]">
                        <tr>
                          <th className="p-3">نوع الإجازة</th>
                          <th className="p-3">تاريخ البدء</th>
                          <th className="p-3">تاريخ الانتهاء</th>
                          <th className="p-3">المدة</th>
                          <th className="p-3">مرحلة ومعرف الطلب</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaves.length === 0 ? (
                          <tr><td colSpan="5" className="text-center p-8 text-[#94a3b8] font-bold">لا يوجد طلبات إجازة مسجلة في ملفك حتى الآن.</td></tr>
                        ) : (
                          leaves.map((leave) => {
                            // 🚀 حساب عدد الأيام برمجياً لأنها غير مسجلة في الداتابيز
                            const start = new Date(leave.startDate);
                            const end = new Date(leave.endDate);
                            const daysCount = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

                            return (
                              <tr key={leave.id} className="hover:bg-[#fbf8f1]/50 border-b border-gray-100 last:border-0 transition-colors">
                                <td className="p-3 font-black text-[#123f59]">{leave.type || 'إجازة سنوية'}</td>
                                <td className="p-3 font-medium text-gray-600">{start.toLocaleDateString('ar-SA')}</td>
                                <td className="p-3 font-medium text-gray-600">{end.toLocaleDateString('ar-SA')}</td>
                                
                                {/* 🚀 عرض عدد الأيام المحسوبة */}
                                <td className="p-3 font-black text-[#0e7490]">{daysCount} أيام</td>
                                
                                <td className="p-3">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${
                                    leave.status === 'APPROVED' ? 'bg-green-50 text-green-700 border border-green-200' : 
                                    leave.status === 'REJECTED' ? 'bg-red-50 text-red-700 border border-red-200' : 
                                    'bg-orange-50 text-orange-700 border border-orange-200'
                                  }`}>
                                    {leave.status === 'APPROVED' ? 'تمت الموافقة والاعتماد' : 
                                     leave.status === 'REJECTED' ? 'مرفوضة' : 'قيد المراجعة والتدقيق'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* التبويب الثالث: تفعيل شاشة الحضور والانصراف بالكامل من الباك-إند */}
              {activeTab === "attendance" && (
                <motion.div key="attendance" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="bg-white rounded-xl border border-[#e8ddc8] shadow-xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8ddc8] pb-3">
                    <div>
                      <h3 className="text-[13px] font-black text-[#123f59]">محلل الدوام والتايم شيت الذكي</h3>
                      <p className="text-[10px] text-[#94a3b8] font-bold mt-0.5">استعلم وحلل حركة البصمة الخاصة بك مباشرة من الخادم المربوط بالأجهزة.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <input 
                        type="date" 
                        value={targetDate} 
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="p-1.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-lg text-[11px] font-black text-[#123f59] outline-none focus:border-[#0e7490]"
                      />
                      <button 
                        onClick={handleRefreshAttendance}
                        className="p-2 hover:bg-gray-100 rounded-lg text-[#0e7490] transition-colors border border-gray-100"
                        title="تحديث واستعلام"
                      >
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </div>

                  {/* استعراض نتائج محرك التحليل الحقيقي */}
                  {attendanceAnalysis ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl border border-[#e8ddc8]/60 bg-[#fbf8f1]/30">
                        <span className="text-[10px] text-[#94a3b8] font-bold block">حالة الدوام المسجلة لليوم المحدد:</span>
                        <span className={`text-[13px] font-black inline-block mt-1 px-2 py-0.5 rounded ${
                          attendanceAnalysis.status === 'PRESENT' || attendanceAnalysis.status === 'PRESENT_FLEX' ? 'bg-green-100 text-green-800' :
                          attendanceAnalysis.status === 'ABSENT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {attendanceAnalysis.status === 'PRESENT' ? 'حاضر (دوام ثابت)' :
                           attendanceAnalysis.status === 'PRESENT_FLEX' ? 'حاضر (ساعات مرنة)' :
                           attendanceAnalysis.status === 'ABSENT' ? 'غياب بدون عذر رسمي' :
                           attendanceAnalysis.status === 'WEEKEND' ? 'يوم راحة أسبوعية' :
                           attendanceAnalysis.status === 'ON_LEAVE' ? 'في مهمة أو إجازة معتمدة' : attendanceAnalysis.status}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl border border-[#e8ddc8]/60 bg-[#fbf8f1]/30">
                        <span className="text-[10px] text-[#94a3b8] font-bold block">ملاحظات المحرك الآلي للخادم:</span>
                        <p className="text-[12px] font-black text-[#123f59] mt-1">{attendanceAnalysis.note || "لا توجد ملاحظات تذكر على سجل البصمة اليوم."}</p>
                      </div>

                      {(attendanceAnalysis.checkIn || attendanceAnalysis.totalWorkedHours) && (
                        <div className="sm:col-span-2 p-3 rounded-xl border border-cyan-100 bg-cyan-50/20 grid grid-cols-2 gap-4">
                          {attendanceAnalysis.checkIn && (
                            <div>
                              <span className="text-[10px] text-[#64748b] font-bold block">أول لقطة حضور (Check-In):</span>
                              <span className="text-[12px] font-mono font-bold text-[#123f59]">
                                {new Date(attendanceAnalysis.checkIn).toLocaleTimeString('ar-SA')}
                              </span>
                            </div>
                          )}
                          {attendanceAnalysis.checkOut && (
                            <div>
                              <span className="text-[10px] text-[#64748b] font-bold block">آخر لقطة انصراف (Check-Out):</span>
                              <span className="text-[12px] font-mono font-bold text-[#123f59]">
                                {new Date(attendanceAnalysis.checkOut).toLocaleTimeString('ar-SA')}
                              </span>
                            </div>
                          )}
                          {attendanceAnalysis.totalWorkedHours && (
                            <div className="col-span-2">
                              <span className="text-[10px] text-[#64748b] font-bold block">إجمالي الساعات المنجزة للمشروع اليوم:</span>
                              <span className="text-[13px] font-black text-[#0e7490]">{attendanceAnalysis.totalWorkedHours} ساعة عمل فعالة</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-[#94a3b8] font-bold text-[11px]">حدد التاريخ واضغط تحديث لتحليل التايم شيت الحالي.</div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* النوافذ المنبثقة التفاعلية الحقيقية (Modals) */}
      {/* ========================================== */}

      {/* أ. نافذة تحديث بيانات التواصل الشخصية */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#e8ddc8]">
              <div className="bg-[#123f59] p-4 text-white flex justify-between items-center">
                <h3 className="text-[13px] font-black flex items-center gap-2"><Edit2 size={16} className="text-[#d8b46a]" /> مراجعة وتحديث قنوات التواصل الشخصية</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-white/70 hover:text-white"><XCircle size={18} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-5 flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#123f59] mb-1">رقم الجوال الفعال</label>
                    <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#123f59] mb-1">البريد الإلكتروني الشخصي</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#123f59] mb-1">المدينة الحالية</label>
                    <input type="text" value={editForm.cityAr} onChange={(e) => setEditForm({...editForm, cityAr: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#123f59] mb-1">الحي السكني</label>
                    <input type="text" value={editForm.districtAr} onChange={(e) => setEditForm({...editForm, districtAr: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">إلغاء</button>
                  <button type="submit" disabled={isActionLoading} className="px-4 py-2 text-[11px] font-black text-white bg-[#0e7490] hover:bg-[#123f59] rounded-xl transition-colors flex items-center gap-1 shadow-sm">
                    {isActionLoading && <Loader2 size={12} className="animate-spin" />} حفظ في ملف الموظف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ب. نافذة تغيير وتشفير كلمة المرور الجديدة */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#e8ddc8]">
              <div className="bg-[#123f59] p-4 text-white flex justify-between items-center">
                <h3 className="text-[13px] font-black flex items-center gap-2"><KeyRound size={16} className="text-[#d8b46a]" /> تحديث كلمة المرور للحساب الرسمي</h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-white/70 hover:text-white"><XCircle size={18} /></button>
              </div>
              <form onSubmit={handleChangePassword} className="p-5 flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#123f59] mb-1">كلمة المرور الجديدة</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#123f59] mb-1">تأكيد كلمة المرور الجديدة</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl transition-colors">إلغاء</button>
                  <button type="submit" disabled={isActionLoading} className="px-4 py-2 text-[11px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors flex items-center gap-1 shadow-sm">
                    {isActionLoading && <Loader2 size={12} className="animate-spin" />} تشفير وحفظ الباسورد
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ج. نافذة تقديم طلب إجازة رسمي جديد لجدول الـ Prisma الفرعي */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-[#e8ddc8]">
              <div className="bg-[#123f59] p-4 text-white flex justify-between items-center">
                <h3 className="text-[13px] font-black flex items-center gap-2"><Palmtree size={16} className="text-[#d8b46a]" /> رفع طلب إجازة لمركز عمليات الموارد البشرية</h3>
                <button onClick={() => setIsLeaveModalOpen(false)} className="text-white/70 hover:text-white"><XCircle size={18} /></button>
              </div>
              <form onSubmit={handleApplyLeave} className="p-5 flex flex-col gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#123f59] mb-1">تصنيف الإجازة</label>
                  <select value={leaveForm.type} onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})} className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]">
                    <option value="إجازة سنوية">إجازة سنوية</option>
                    <option value="إجازة مرضية">إجازة مرضية</option>
                    <option value="إجازة بدون راتب">إجازة بدون راتب</option>
                    <option value="إجازة طارئة">إجازة طارئة (اضطرارية)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#123f59] mb-1">تاريخ البدء</label>
                    <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full px-3 py-1.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#123f59] mb-1">تاريخ الانتهاء</label>
                    <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full px-3 py-1.5 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#123f59] mb-1">المبررات والأسباب المرفقة (اختياري)</label>
                  <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} rows="2" className="w-full px-3 py-2 bg-[#fbf8f1] border border-[#e8ddc8] rounded-xl text-[12px] font-bold focus:outline-none focus:border-[#0e7490] resize-none" placeholder="اكتب تفاصيل إضافية للإدارة..."></textarea>
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">إلغاء</button>
                  <button type="submit" disabled={isActionLoading} className="px-4 py-2 text-[11px] font-black text-white bg-[#0e7490] hover:bg-[#123f59] rounded-xl transition-colors flex items-center gap-1 shadow-sm">
                    {isActionLoading && <Loader2 size={12} className="animate-spin" />} إرسال إلى المراجعة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EmployeePortal;