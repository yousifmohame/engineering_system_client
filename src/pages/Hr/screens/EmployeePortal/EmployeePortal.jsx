import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar, Clock,
  FileText, Edit2, Plus, CheckCircle, XCircle, AlertCircle,
  Building, CreditCard, Shield, Palmtree, ArrowRight, Lock, 
  KeyRound, Loader2, RefreshCw, DollarSign, FileCheck, Landmark, 
  UserCheck, ShieldAlert, Layers, Activity
} from "lucide-react";
import api from "../../../../api/axios";
import { useAuth } from "../../../../context/AuthContext";

// --- نظام التصميم: المكونات الزجاجية السائلة الفاخرة (Liquid Glass UI Components) ---

const GlassCard = ({ children, className = "", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -15 }}
    transition={{ duration: 0.4, delay: delay, ease: "easeOut" }}
    className={`bg-white/50 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(18,63,89,0.06)] rounded-3xl p-5 ${className}`}
  >
    {children}
  </motion.div>
);

const LockedInfoItem = ({ icon: Icon, label, value, badge }) => (
  <div className="flex items-center gap-3.5 p-3.5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-xs group transition-all duration-300 hover:bg-white/70">
    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-[#123f59]/10 to-[#0e7490]/10 text-[#0e7490] shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
      <Icon size={16} />
    </div>
    <div className="min-w-0 flex-1 relative">
      <p className="text-[10px] font-black text-[#64748b] tracking-wide mb-0.5 flex items-center gap-1">
        {label}
        <Lock size={10} className="text-slate-400 inline" title="حقل محمي غير قابل للتعديل" />
      </p>
      <div className="flex items-center gap-2">
        <p className="text-[13px] font-black text-[#123f59] truncate">{value || "غير مدرج"}</p>
        {badge && (
          <span className="text-[9px] font-black px-2 py-0.5 bg-[#123f59]/5 text-[#123f59] rounded-md border border-[#123f59]/10">
            {badge}
          </span>
        )}
      </div>
    </div>
  </div>
);

const StatCard = ({ icon: Icon, label, value, subtext, gradient }) => (
  <motion.div 
    whileHover={{ y: -4, scale: 1.02 }}
    className={`p-5 rounded-3xl border border-white/50 shadow-[0_12px_24px_-10px_rgba(18,63,89,0.08)] flex items-center gap-4 flex-1 min-w-[240px] bg-gradient-to-br ${gradient} backdrop-blur-lg`}
  >
    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/80 text-[#123f59] shadow-sm shrink-0">
      <Icon size={26} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-black text-[#64748b] tracking-wide uppercase">{label}</p>
      <p className="text-xl font-black text-[#123f59] mt-0.5 truncate">{value}</p>
      {subtext && <p className="text-[9px] font-bold text-slate-500 mt-0.5 truncate">{subtext}</p>}
    </div>
  </motion.div>
);

const EmployeePortal = () => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [employee, setEmployee] = useState(user || null);
  const [leaves, setLeaves] = useState([]);
  const [attendanceAnalysis, setAttendanceAnalysis] = useState(null);
  
  // حل مشكلة التاريخ الفعلي: عدم قبول تواريخ مستقبلية نهائياً
  const todayStr = new Date().toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState(todayStr);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attendanceError, setAttendanceError] = useState("");

  // حالات النوافذ المنبثقة
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // حالات النماذج القابلة للتعديل
  const [editForm, setEditForm] = useState({ phone: "", email: "", cityAr: "", districtAr: "", emergencyContactName: "", emergencyContactPhone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [leaveForm, setLeaveForm] = useState({ type: "إجازة سنوية", startDate: "", endDate: "", reason: "" });

  const loadPortalData = useCallback(async () => {
    if (!user || !user.id) return;

    setIsLoading(true);
    setErrorMessage("");
    try {
      // جلب ملف البيانات الشامل والمحدث الخاص بالموظف الحالي
      const meRes = await api.get("/employees/me");
      const empData = meRes.data;
      setEmployee(empData);

      setEditForm({
        phone: empData.phone || "",
        email: empData.email || "",
        cityAr: empData.cityAr || "",
        districtAr: empData.districtAr || "",
        emergencyContactName: empData.emergencyContactName || "",
        emergencyContactPhone: empData.emergencyContactPhone || ""
      });

      const leavesRes = await api.get(`/employees/${user.id}/leave-requests`);
      setLeaves(leavesRes.data || []);

      // فحص أمان منطقي للتاريخ قبل استدعاء الخادم
      if (targetDate > todayStr) {
        setAttendanceAnalysis(null);
        setAttendanceError("لا يمكن الاستعلام عن سجلات بصمة لتاريخ مستقبلي.");
      } else {
        setAttendanceError("");
        const attendanceRes = await api.get(`/employees/${user.id}/attendance-analysis`, {
          params: { targetDate: targetDate }
        });
        setAttendanceAnalysis(attendanceRes.data);
      }

    } catch (error) {
      console.error("Portal Structural Error:", error);
      setErrorMessage("حدث خطأ أثناء جلب البنية الوظيفية الشاملة من الخادم الرئيسي.");
    } finally {
      setIsLoading(false);
    }
  }, [targetDate, user, todayStr]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  const handleRefreshAttendance = async () => {
    if (!user?.id) return;
    if (targetDate > todayStr) {
      setAttendanceAnalysis(null);
      setAttendanceError("التاريخ المختار يتجاوز تاريخ اليوم الحالي. يرجى اختيار تاريخ دقيق.");
      return;
    }
    setAttendanceError("");
    try {
      const res = await api.get(`/employees/${user.id}/attendance-analysis`, {
        params: { targetDate: targetDate }
      });
      setAttendanceAnalysis(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await api.put(`/employees/${user.id}`, editForm);
      setEmployee(res.data);
      setIsEditModalOpen(false);
      alert("تمت مزامنة وتحديث قنوات التواصل بنجاح.");
    } catch (error) {
      alert(error.response?.data?.message || "فشل تحديث البيانات الشخصية.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("البيانات المدخلة لتأكيد كلمة المرور غير متطابقة!");
      return;
    }
    setIsActionLoading(true);
    try {
      await api.put(`/employees/${user.id}`, { password: passwordForm.newPassword });
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      alert("تم تشفير وحفظ كلمة المرور الجديدة على الخادم بنجاح.");
    } catch (error) {
      alert("فشل تحديث نظام الحماية الشخصي.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (leaveForm.startDate > leaveForm.endDate) {
      alert("تاريخ بدء الإجازة لا يمكن أن يكون بعد تاريخ الانتهاء!");
      return;
    }
    setIsActionLoading(true);
    try {
      await api.post(`/employees/${user.id}/leave-requests`, leaveForm);
      const leavesRes = await api.get(`/employees/${user.id}/leave-requests`);
      setLeaves(leavesRes.data || []);
      setIsLeaveModalOpen(false);
      setLeaveForm({ type: "إجازة سنوية", startDate: "", endDate: "", reason: "" });
      alert("تم رفع طلب الإجازة بنجاح إلى شجرة الاعتمادات الإدارية للتدقيق.");
    } catch (error) {
      alert(error.response?.data?.message || "فشل إرسال طلب الإجازة المعتمد.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading && !employee) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#f4f1ea] to-[#e8ddc8]/30">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white/40 backdrop-blur-md border border-white/50">
          <Loader2 className="w-9 h-9 animate-spin text-[#0e7490]" />
          <span className="text-[12px] font-black text-[#123f59] tracking-widest">جاري فحص وتأمين بيئة الموظف الشاملة...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#f4f1ea] via-[#edf0f2] to-[#e4e9ec] overflow-y-auto custom-scrollbar p-4 lg:p-6 space-y-6">
      
      {/* غلاف وبطاقة الموظف الرئيسية - Liquid Glass Premium Header */}
      <div className="bg-white/40 backdrop-blur-2xl border border-white/60 shadow-[0_10px_40px_rgba(18,63,89,0.05)] rounded-3xl overflow-hidden shrink-0 relative">
        <div className="h-36 bg-gradient-to-r from-[#123f59] via-[#1a587a] to-[#0e7490] w-full relative">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 2px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d8b46a]/20 rounded-full blur-2xl"></div>
        </div>
        
        <div className="px-6 pb-6 relative flex flex-col md:flex-row gap-6 items-start md:items-end -mt-10">
          <div className="relative group shrink-0 mx-auto md:mx-0">
            <div className="w-28 h-28 rounded-2xl border-4 border-white/90 bg-white/80 backdrop-blur-sm shadow-xl flex items-center justify-center overflow-hidden">
              {employee?.profilePicture ? (
                <img src={employee.profilePicture} alt={employee.name} className="w-full h-full object-cover" />
              ) : (
                <User size={48} className="text-[#0e7490]" />
              )}
            </div>
            <div className={`absolute bottom-[-8px] left-1/2 transform -translate-x-1/2 text-[10px] font-black px-3 py-0.5 rounded-full shadow-md border-2 border-white text-white tracking-wider uppercase ${employee?.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-rose-500 to-red-600'}`}>
              {employee?.status === 'active' ? 'الملف نشط' : 'موقوف إدارياً'}
            </div>
          </div>

          <div className="flex-1 text-center md:text-right mt-2 md:mt-0">
            <div className="flex flex-col md:flex-row md:items-center gap-2 justify-center md:justify-start">
              <h1 className="text-2xl font-black text-[#123f59] tracking-tight">{employee?.name}</h1>
              <span className="text-[10px] font-black px-2.5 py-1 bg-[#d8b46a]/10 text-[#bc964d] rounded-lg border border-[#d8b46a]/20 self-center">
                كود الموظف: {employee?.employeeCode}
              </span>
            </div>
            <p className="text-[12px] font-black text-[#64748b] flex items-center justify-center md:justify-start gap-2 mt-1.5">
              <Briefcase size={14} className="text-[#d8b46a]" /> {employee?.position || "لم تحدد الوظيفة"} 
              <span className="text-slate-300">|</span> 
              <Building size={14} className="text-[#0e7490]" /> {employee?.department || "الإدارة العامة"}
            </p>
          </div>

          {/* أزرار العمليات التفاعلية */}
          <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap justify-center">
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-md border border-white text-[#123f59] hover:bg-white rounded-2xl text-[11px] font-black transition-all shadow-2xs hover:shadow-xs"
            >
              <Edit2 size={14} className="text-[#0e7490]" /> تحديث قنوات التواصل
            </button>
            <button 
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white/70 backdrop-blur-md border border-rose-200/60 text-rose-600 hover:bg-rose-50/50 rounded-2xl text-[11px] font-black transition-all shadow-2xs"
            >
              <Lock size={14} /> أمان الحساب
            </button>
            <button 
              onClick={() => setIsLeaveModalOpen(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0e7490] to-[#123f59] text-white rounded-2xl text-[11px] font-black hover:opacity-95 transition-all shadow-md shadow-[#0e7490]/10"
            >
              <Plus size={14} /> طلب إجازة رسمي
            </button>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="w-full animate-in slide-in-from-top duration-300">
          <div className="p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-800 font-black text-[12px] rounded-2xl flex items-center gap-2.5 shadow-sm">
            <AlertCircle size={18} className="text-rose-600 shrink-0" /> {errorMessage}
          </div>
        </div>
      )}

      {/* لوحة المؤشرات المالية والرصيدية الكبرى */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        <StatCard icon={Palmtree} label="رصيد الإجازات السنوية المتاح" value={`${employee?.leaveBalance ?? 21} يوم`} subtext="محدث تلقائياً من الإدارة" gradient="from-emerald-500/5 to-teal-500/5" />
        <StatCard icon={DollarSign} label="إجمالي الحزمة المالية الإجمالية" value={`${(Number(employee?.basicSalary || 0) + Number(employee?.housingAllowance || 0) + Number(employee?.transportAllowance || 0)).toLocaleString('ar-SA')} ريال`} subtext={`الأساسي: ${(employee?.basicSalary || 0).toLocaleString('ar-SA')} ريال`} gradient="from-amber-500/5 to-[#d8b46a]/5" />
        <StatCard icon={Clock} label="قنوات ونظام الدوام" value={employee?.shiftType === 'FIXED' ? 'دوام مكتبي ثابت' : 'ساعات مرنة / مشاريع'} subtext={`الرقم السري للبصمة: ${employee?.fingerprintId || "غير مرتبط"}`} gradient="from-cyan-500/5 to-blue-500/5" />
      </div>

      {/* لوحة تبويبات التنقل العريضة وعرض البيانات الهيكلية */}
      <div className="flex flex-col lg:flex-row gap-6 items-start w-full flex-1">
        
        {/* العمود الجانبي الأيمن: قنوات الاتصال وحالة الطوارئ المؤمنة */}
        <div className="w-full lg:w-80 flex flex-col gap-4 shrink-0">
          <GlassCard className="!p-4">
            <div className="px-2 pb-2.5 border-b border-slate-200/60 mb-3 flex items-center gap-2">
              <Activity size={15} className="text-[#d8b46a]" />
              <h3 className="text-[12px] font-black text-[#123f59]">قنوات الاتصال النشطة</h3>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-white/60 border border-white/80 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block">البريد الوظيفي</span>
                <span className="text-[11px] font-black text-[#123f59] block truncate">{employee?.email}</span>
              </div>
              <div className="p-2.5 bg-white/60 border border-white/80 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block">رقم الجوال الشخصي</span>
                <span className="text-[11px] font-black text-[#123f59] block font-mono">{employee?.phone || "غير مسجل"}</span>
              </div>
              <div className="p-2.5 bg-white/60 border border-white/80 rounded-xl">
                <span className="text-[9px] font-bold text-slate-400 block">محل الإقامة الفعلي</span>
                <span className="text-[11px] font-black text-[#123f59] block">{employee?.cityAr ? `${employee.cityAr} - ${employee.districtAr || ''}` : "لم يحدد بعد"}</span>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="!p-4 !bg-rose-50/20">
            <div className="px-2 pb-2.5 border-b border-rose-200/50 mb-3 flex items-center gap-2">
              <ShieldAlert size={15} className="text-rose-600" />
              <h3 className="text-[12px] font-black text-rose-900">بيانات الاتصال بالطوارئ</h3>
            </div>
            <div className="flex flex-col gap-2">
              <div className="p-2.5 bg-white/40 border border-white/80 rounded-xl">
                <span className="text-[9px] font-bold text-rose-600/70 block">اسم الشخص المفوض</span>
                <span className="text-[11px] font-black text-slate-800 block">{employee?.emergencyContactName || "غير محدد"}</span>
              </div>
              <div className="p-2.5 bg-white/40 border border-white/80 rounded-xl">
                <span className="text-[9px] font-bold text-rose-600/70 block">رقم جوال الطوارئ</span>
                <span className="text-[11px] font-black text-slate-800 block font-mono">{employee?.emergencyContactPhone || "غير مسجل"}</span>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* لوحة التحكم والتبويبات الرئيسية اليسرى */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          <div className="flex items-center gap-2 bg-white/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/60 shadow-2xs overflow-x-auto custom-scrollbar-slim">
            {[
              { id: "overview", label: "البنية والملف الهيكلي", icon: Layers },
              { id: "financials", label: "البنية المالية والمميزات", icon: DollarSign },
              { id: "leaves", label: "أرشيف الإجازات والاعتمادات", icon: Palmtree },
              { id: "attendance", label: "محرك البصمة والتايم شيت الفعلي", icon: Clock },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id 
                    ? "bg-gradient-to-r from-[#123f59] to-[#0e7490] text-white shadow-xs" 
                    : "text-[#64748b] hover:bg-white/60 hover:text-[#123f59]"
                }`}
              >
                <tab.icon size={14} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex-1 w-full">
            <AnimatePresence mode="wait">
              
              {/* تبويب 1: البنية والملف الهيكلي المؤمن (Locked Structure) */}
              {activeTab === "overview" && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <GlassCard>
                    <h3 className="text-[13px] font-black text-[#123f59] border-b border-slate-200/60 pb-2.5 mb-4 flex items-center gap-2">
                      <FileCheck size={16} className="text-[#d8b46a]" /> التوثيق الحكومي والملف العقدي للمكتب الهندي
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <LockedInfoItem icon={User} label="الرقم الوظيفي الفرعي للتسجيل" value={employee?.employeeCode} />
                      <LockedInfoItem icon={Briefcase} label="المسمى الوظيفي المسجل رسمياً" value={employee?.position} />
                      <LockedInfoItem icon={Building} label="القطاع التابع له الموظف" value={employee?.department} />
                      <LockedInfoItem icon={Calendar} label="تاريخ مباشرة العمل الفعلي" value={employee?.hireDate ? new Date(employee.hireDate).toLocaleDateString('ar-SA') : 'غير مدرج'} />
                      <LockedInfoItem icon={CreditCard} label="رقم الهوية الوطنية / الإقامة" value={employee?.nationalId || employee?.iqamaNumber || "غير متوفر"} />
                      <LockedInfoItem icon={Calendar} label="تاريخ انتهاء وثيقة الهوية" value={employee?.idExpiryDate ? new Date(employee.idExpiryDate).toLocaleDateString('ar-SA') : "لم يحدد"} />
                      <LockedInfoItem icon={Shield} label="رقم جواز السفر" value={employee?.passportNumber} />
                      <LockedInfoItem icon={Calendar} label="تاريخ انتهاء جواز السفر" value={employee?.passportExpiryDate ? new Date(employee.passportExpiryDate).toLocaleDateString('ar-SA') : "لم يحدد"} />
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* تبويب 2: البنية المالية الشاملة والمميزات */}
              {activeTab === "financials" && (
                <motion.div key="financials" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <GlassCard>
                    <h3 className="text-[13px] font-black text-[#123f59] border-b border-slate-200/60 pb-2.5 mb-4 flex items-center gap-2">
                      <Landmark size={16} className="text-[#0e7490]" /> تفاصيل الراتب البنكي والتأمينات الاجتماعية (GOSI)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <LockedInfoItem icon={DollarSign} label="الراتب الأساسي المعتمد" value={`${(employee?.basicSalary || 0).toLocaleString('ar-SA')} ريال سعودي`} />
                      <LockedInfoItem icon={MapPin} label="بدل السكن الموفر" value={`${(employee?.housingAllowance || 0).toLocaleString('ar-SA')} ريال`} />
                      <LockedInfoItem icon={Briefcase} label="بدل الانتقال / المواصلات" value={`${(employee?.transportAllowance || 0).toLocaleString('ar-SA')} ريال`} />
                      <LockedInfoItem icon={Plus} label="البدلات الأخرى والمكافآت الثابتة" value={`${(employee?.otherAllowances || 0).toLocaleString('ar-SA')} ريال`} />
                      <LockedInfoItem icon={Shield} label="رقم الاشتراك بالتأمينات الاجتماعية (GOSI)" value={employee?.gosiNumber || "غير خاضع للتأمينات"} />
                      <LockedInfoItem icon={Landmark} label="اسم البنك المعتمد للمسيرات" value={employee?.bankName || "مصرف الراجحي"} />
                      <LockedInfoItem icon={CreditCard} label="رقم الحساب البنكي الدولي (IBAN)" value={employee?.ibanNumber || "غير متوفر"} />
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* تبويب 3: أرشيف الإجازات والاعتمادات التاريخية */}
              {activeTab === "leaves" && (
                <motion.div key="leaves" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <GlassCard className="!p-0 overflow-hidden">
                    <div className="p-4 border-b border-slate-200/60 bg-white/40 flex justify-between items-center">
                      <h3 className="text-[12px] font-black text-[#123f59]">سجل طلبات الإجازة الرسمية عبر المنصة</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-right border-collapse text-[11px]">
                        <thead className="bg-slate-100/50 font-black text-[#64748b] border-b border-slate-200/60">
                          <tr>
                            <th className="p-3.5">نوع وتصنيف الإجازة</th>
                            <th className="p-3.5">تاريخ البدء المعتمد</th>
                            <th className="p-3.5">تاريخ الانتهاء</th>
                            <th className="p-3.5">المدة المحسوبة</th>
                            <th className="p-3.5">حالة الاعتماد الإداري</th>
                          </tr>
                        </thead>
                        <tbody>
                          {leaves.length === 0 ? (
                            <tr><td colSpan="5" className="text-center p-8 text-slate-400 font-bold">لا توجد طلبات إجازة مسجلة في ملفك الشخصي حتى الآن.</td></tr>
                          ) : (
                            leaves.map((leave) => {
                              const start = new Date(leave.startDate);
                              const end = new Date(leave.endDate);
                              const daysCount = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

                              return (
                                <tr key={leave.id} className="hover:bg-white/40 border-b border-slate-100 last:border-0 transition-colors">
                                  <td className="p-3.5 font-black text-[#123f59]">{leave.type || 'إجازة سنوية'}</td>
                                  <td className="p-3.5 font-bold text-slate-600 font-mono">{start.toLocaleDateString('ar-SA')}</td>
                                  <td className="p-3.5 font-bold text-slate-600 font-mono">{end.toLocaleDateString('ar-SA')}</td>
                                  <td className="p-3.5 font-black text-[#0e7490]">{daysCount} أيام فعالة</td>
                                  <td className="p-3.5">
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-lg text-[10px] font-black border ${
                                      leave.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                      leave.status === 'REJECTED' ? 'bg-rose-50 text-red-700 border-rose-200' : 
                                      'bg-amber-50 text-amber-700 border-amber-200'
                                    }`}>
                                      {leave.status === 'APPROVED' ? 'تمت الموافقة والاعتماد' : 
                                       leave.status === 'REJECTED' ? 'مرفوض من الإدارة' : 'قيد التدقيق والمراجعة'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* تبويب 4: محرك البصمة الذكي مع إصلاح ثغرة التاريخ المستقبلية بشكل حاسم */}
              {activeTab === "attendance" && (
                <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <GlassCard className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-3">
                      <div>
                        <h3 className="text-[13px] font-black text-[#123f59]">سجل التايم شيت والبصمة التلقائي</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">استعلم عن الحركة اليومية المسجلة من أجهزة الحضور التابعة للمكتب الهندي.</p>
                      </div>
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <input 
                          type="date" 
                          value={targetDate} 
                          max={todayStr} // منع اختيار أي يوم مستقبلي نهائياً من الواجهة المعمارية
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-[#123f59] outline-none focus:border-[#0e7490] font-mono shadow-2xs"
                        />
                        <button 
                          onClick={handleRefreshAttendance}
                          className="p-2.5 bg-white hover:bg-slate-50 text-[#0e7490] rounded-xl transition-all border border-slate-200/80 shadow-2xs"
                          title="استعلام وتحديث فوري"
                        >
                          <RefreshCw size={14} />
                        </button>
                      </div>
                    </div>

                    {/* عرض خطأ التحقق المنطقي في حال حاول المستخدم التلاعب بالتاريخ هاتفياً أو عبر الكونسول */}
                    {attendanceError ? (
                      <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center gap-2 text-[11px] font-black">
                        <AlertCircle size={16} className="text-amber-600 shrink-0" />
                        {attendanceError}
                      </div>
                    ) : attendanceAnalysis ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
                        <div className="p-4 rounded-2xl border border-white/80 bg-white/40">
                          <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wide">حالة الحضور الإدارية:</span>
                          <span className={`text-[12px] font-black inline-block mt-1 px-3 py-0.5 rounded-lg border ${
                            attendanceAnalysis.status === 'PRESENT' || attendanceAnalysis.status === 'PRESENT_FLEX' 
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                              : attendanceAnalysis.status === 'ABSENT' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-slate-50 text-slate-800 border-slate-200'
                          }`}>
                            {attendanceAnalysis.status === 'PRESENT' ? 'حاضر (دوام ثابت متكامل)' :
                             attendanceAnalysis.status === 'PRESENT_FLEX' ? 'حاضر (نظام الساعات المرنة)' :
                             attendanceAnalysis.status === 'ABSENT' ? 'غياب غير مبرر رسمياً' :
                             attendanceAnalysis.status === 'WEEKEND' ? 'عطلة نهاية الأسبوع الرسمية' :
                             attendanceAnalysis.status === 'ON_LEAVE' ? 'مهمة عمل خارجية / إجازة معتمدة' : attendanceAnalysis.status}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl border border-white/80 bg-white/40">
                          <span className="text-[9px] text-slate-400 font-black block uppercase tracking-wide">تقرير وملاحظات محرك التحليل:</span>
                          <p className="text-[12px] font-black text-[#123f59] mt-1">{attendanceAnalysis.note || "سجل الحضور سليم لليوم المختار ولا توجد أي ملاحظات نظامية."}</p>
                        </div>

                        {(attendanceAnalysis.checkIn || attendanceAnalysis.totalWorkedHours) && (
                          <div className="sm:col-span-2 p-4 rounded-2xl border border-cyan-100 bg-cyan-50/10 grid grid-cols-2 gap-4">
                            {attendanceAnalysis.checkIn && (
                              <div>
                                <span className="text-[9px] text-slate-400 font-black block">لقطة تسجيل الدخول الأولى:</span>
                                <span className="text-[13px] font-mono font-black text-[#123f59] mt-0.5 block">
                                  {new Date(attendanceAnalysis.checkIn).toLocaleTimeString('ar-SA')}
                                </span>
                              </div>
                            )}
                            {attendanceAnalysis.checkOut && (
                              <div>
                                <span className="text-[9px] text-slate-400 font-black block">لقطة تسجيل الانصراف الأخيرة:</span>
                                <span className="text-[13px] font-mono font-black text-[#123f59] mt-0.5 block">
                                  {new Date(attendanceAnalysis.checkOut).toLocaleTimeString('ar-SA')}
                                </span>
                              </div>
                            )}
                            {attendanceAnalysis.totalWorkedHours && (
                              <div className="col-span-2 pt-2 border-t border-slate-200/50 mt-1">
                                <span className="text-[9px] text-slate-400 font-black block">إجمالي عدد ساعات العمل الفعلية المنجزة اليوم:</span>
                                <span className="text-[14px] font-black text-[#0e7490] mt-0.5 block">{attendanceAnalysis.totalWorkedHours} ساعة عمل موثقة</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400 font-black text-[11px]">الرجاء اختيار تاريخ متاح للاستعلام عن البصمات والمزامنة الفورية.</div>
                    )}
                  </GlassCard>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- النوافذ المنبثقة التفاعلية المؤمنة (Modals) --- */}

      {/* 1. نافذة تحديث بيانات التواصل الشخصية */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white/90 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50">
              <div className="bg-gradient-to-r from-[#123f59] to-[#0e7490] p-4 text-white flex justify-between items-center">
                <h3 className="text-[13px] font-black flex items-center gap-2"><Edit2 size={15} className="text-[#d8b46a]" /> تحديث قنوات التواصل والاتصال في الحالات الطارئة</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="text-white/80 hover:text-white transition-colors"><XCircle size={18} /></button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">رقم الجوال الفعال</label>
                    <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490] font-mono" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">البريد الإلكتروني الشخصي</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">المدينة الحالية</label>
                    <input type="text" value={editForm.cityAr} onChange={(e) => setEditForm({...editForm, cityAr: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">الحي السكني</label>
                    <input type="text" value={editForm.districtAr} onChange={(e) => setEditForm({...editForm, districtAr: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" />
                  </div>
                  <div className="sm:col-span-2 border-t border-slate-200/60 pt-3 mt-1">
                    <span className="text-[10px] font-black text-rose-600 block mb-2">تحديث جهة اتصال الطوارئ:</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">اسم الشخص المفوض</label>
                    <input type="text" value={editForm.emergencyContactName} onChange={(e) => setEditForm({...editForm, emergencyContactName: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">رقم جوال الطوارئ</label>
                    <input type="tel" value={editForm.emergencyContactPhone} onChange={(e) => setEditForm({...editForm, emergencyContactPhone: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490] font-mono" required />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">إلغاء</button>
                  <button type="submit" disabled={isActionLoading} className="px-5 py-2 text-[11px] font-black text-white bg-[#0e7490] hover:bg-[#123f59] rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                    {isActionLoading && <Loader2 size={12} className="animate-spin" />} حفظ ومزامنة ملف الموظف
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. نافذة تحديث وتغيير كلمة المرور الشخصية */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/50">
              <div className="bg-gradient-to-r from-[#123f59] to-[#0e7490] p-4 text-white flex justify-between items-center">
                <h3 className="text-[13px] font-black flex items-center gap-2"><KeyRound size={15} className="text-[#d8b46a]" /> مراجعة وتعديل معايير الحماية (كلمة المرور)</h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-white/80 hover:text-white"><XCircle size={18} /></button>
              </div>
              <form onSubmit={handleChangePassword} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-[#123f59] mb-1">كلمة المرور الجديدة</label>
                  <input type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#123f59] mb-1">تأكيد كلمة المرور الجديدة المعمارية</label>
                  <input type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]" required />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-2 text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">إلغاء</button>
                  <button type="submit" disabled={isActionLoading} className="px-5 py-2 text-[11px] font-black text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                    {isActionLoading && <Loader2 size={12} className="animate-spin" />} تشفير وحفظ كلمة المرور الجديدة
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. نافذة تقديم طلب إجازة رسمي جديد */}
      <AnimatePresence>
        {isLeaveModalOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/50">
              <div className="bg-gradient-to-r from-[#123f59] to-[#0e7490] p-4 text-white flex justify-between items-center">
                <h3 className="text-[13px] font-black flex items-center gap-2"><Palmtree size={15} className="text-[#d8b46a]" /> رفع طلب إجازة رسمي لمركز الموارد البشرية</h3>
                <button onClick={() => setIsLeaveModalOpen(false)} className="text-white/80 hover:text-white"><XCircle size={18} /></button>
              </div>
              <form onSubmit={handleApplyLeave} className="p-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-black text-[#123f59] mb-1">تصنيف وترخيص الإجازة</label>
                  <select value={leaveForm.type} onChange={(e) => setLeaveForm({...leaveForm, type: e.target.value})} className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490]">
                    <option value="إجازة سنوية">إجازة سنوية (خصم من الرصيد)</option>
                    <option value="إجازة مرضية">إجازة مرضية (بتقرير طبي موثق)</option>
                    <option value="إجازة بدون راتب">إجازة بدون راتب</option>
                    <option value="إجازة طارئة">إجازة طارئة / اضطرارية</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">تاريخ البدء</label>
                    <input type="date" value={leaveForm.startDate} onChange={(e) => setLeaveForm({...leaveForm, startDate: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490] font-mono" required />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-[#123f59] mb-1">تاريخ الانتهاء</label>
                    <input type="date" value={leaveForm.endDate} onChange={(e) => setLeaveForm({...leaveForm, endDate: e.target.value})} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-black focus:outline-none focus:border-[#0e7490] font-mono" required />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-[#123f59] mb-1">المبررات والأسباب المرفقة للطلب</label>
                  <textarea value={leaveForm.reason} onChange={(e) => setLeaveForm({...leaveForm, reason: e.target.value})} rows="3" className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold focus:outline-none focus:border-[#0e7490] resize-none" placeholder="يرجى كتابة تفاصيل الإجازة ومبرراتها لسرعة الاعتماد الإداري..." required></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button type="button" onClick={() => setIsLeaveModalOpen(false)} className="px-4 py-2 text-[11px] font-black text-slate-500 bg-slate-50 border border-slate-200 rounded-xl">إلغاء</button>
                  <button type="submit" disabled={isActionLoading} className="px-5 py-2 text-[11px] font-black text-white bg-[#0e7490] hover:bg-[#123f59] rounded-xl transition-all flex items-center gap-1.5 shadow-sm">
                    {isActionLoading && <Loader2 size={12} className="animate-spin" />} إرسال الطلب للاعتماد
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