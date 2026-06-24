import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Banknote, User, Search, Plus, Download,
  CheckCircle, Clock, FileText, Users,
  Calculator, AlertCircle, XCircle, Printer, Edit3, Save, Loader2,
  ArrowRight, UploadCloud, PieChart, History, Sparkles, CheckCircle2, FileBox, Send
} from "lucide-react";
import { toast } from "sonner";
import api from "../../../../api/axios"; // تأكد من مسار الـ axios حسب مشروعك

// ==========================================
// مكونات مساعدة للتصميم الزجاجي
// ==========================================
const GlassCard = ({ children, className = "", onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/40 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(31,38,135,0.07)] rounded-[28px] p-6 transition-all duration-300 ${onClick ? "cursor-pointer hover:bg-white/60 hover:-translate-y-1" : ""} ${className}`}
  >
    {children}
  </div>
);

const ViewHeader = ({ title, subtitle, icon: Icon, onBack, extraActions }) => (
  <div className="shrink-0 p-6 border-b border-white/40 flex flex-wrap gap-4 items-center justify-between bg-white/40 backdrop-blur-md z-10 relative rounded-t-3xl mb-6">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="h-10 w-10 rounded-full bg-white/50 border border-white/60 text-gray-600 hover:bg-teal-50 hover:text-teal-600 flex items-center justify-center transition shadow-sm">
          <ArrowRight size={20} />
        </button>
      )}
      <div>
        <h2 className="text-2xl font-black text-[#123f59] flex items-center gap-3 drop-shadow-sm">
          {Icon && <Icon className="text-teal-600" size={28} />}
          {title}
        </h2>
        {subtitle && <p className="text-sm font-bold text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
    {extraActions && <div className="flex items-center gap-3">{extraActions}</div>}
  </div>
);

// ==========================================
// المكون الرئيسي
// ==========================================
export default function PayrollManagement() {
  const [activeView, setActiveView] = useState("HUB");
  const [isLoading, setIsLoading] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filterSource, setFilterSource] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [mudadFile, setMudadFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  // 1. جلب المسيرات
  const fetchPayrolls = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/payrolls?month=${filterMonth}&source=${filterSource}`);
      setPayrolls(res.data || []);
    } catch (error) {
      console.error("Fetch Payrolls Error:", error);
      toast.error("حدث خطأ أثناء جلب المسيرات");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === "HISTORY") {
      fetchPayrolls();
    }
  }, [filterMonth, filterSource, activeView]);

  // 2. توليد مسير جديد
  const handleGeneratePayroll = async () => {
    if (!window.confirm(`هل أنت متأكد من توليد رواتب شهر ${filterMonth} لجميع الموظفين؟`)) return;
    setIsLoading(true);
    try {
      const res = await api.post('/payrolls/generate', { month: filterMonth });
      toast.success(res.data.message || "تم توليد المسير بنجاح");
      setActiveView("HISTORY");
    } catch (error) {
      toast.error("حدث خطأ أثناء التوليد.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. تحديث مالي للقسيمة
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
      setSelectedPayslip(null); // إغلاق النافذة
      fetchPayrolls(); // تحديث القائمة
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ التعديلات");
    }
  };

  // 4. إرسال للمراجعة (طلب مراجعة من المشرف)
  const handleRequestReview = async (id) => {
    try {
      await api.patch(`/payrolls/${id}/request-review`);
      toast.success("تم إرسال المسير للمراجعة بنجاح");
      setSelectedPayslip(null);
      fetchPayrolls();
    } catch (error) {
      toast.error("حدث خطأ أثناء الإرسال للمراجعة");
    }
  };

  // 5. رفع وتحليل مسير مدد
  const handleMudadUpload = async (e) => {
    e.preventDefault();
    if (!mudadFile) return toast.error("يرجى اختيار ملف مسير مدد أولاً");
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("file", mudadFile);

    try {
      const res = await api.post('/payrolls/upload-mudad', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(res.data.message || "تم تحليل مسير مدد والمطابقة بنجاح");
      setMudadFile(null);
      setActiveView("HISTORY");
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع وتحليل ملف مدد");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // احتساب الصافي المباشر أثناء التعديل
  const currentNetSalary = isEditing && editForm 
    ? ((Number(editForm.baseSalary) || 0) + (Number(editForm.housingAllow) || 0) + (Number(editForm.transportAllow) || 0)) - (Number(editForm.deductions) || 0)
    : editForm?.netSalary;


  // --- الواجهة الرئيسية (Hub) ---
  const renderHub = () => (
    <div className="flex-1 flex flex-col justify-center max-w-6xl mx-auto w-full p-6 z-10 relative">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black text-[#123f59] mb-4 drop-shadow-sm">إدارة مسيرات الرواتب</h1>
        <p className="text-lg font-bold text-gray-600">اختر الإجراء المطلوب لإدارة رواتب الموظفين والمطابقات المالية</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard onClick={() => setActiveView("GENERATE")} className="group">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 text-teal-700 flex items-center justify-center mb-4 border border-teal-500/30 group-hover:scale-110 transition-transform">
            <Calculator size={32} />
          </div>
          <h3 className="text-xl font-black text-[#123f59] mb-2">إصدار مسير نظامي</h3>
          <p className="text-sm font-bold text-gray-500">توليد مسير الرواتب للشهر الحالي بناءً على الحضور والانصراف والعقود المسجلة في النظام.</p>
        </GlassCard>

        <GlassCard onClick={() => setActiveView("HISTORY")} className="group">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-400/20 to-blue-600/20 text-blue-700 flex items-center justify-center mb-4 border border-blue-500/30 group-hover:scale-110 transition-transform">
            <History size={32} />
          </div>
          <h3 className="text-xl font-black text-[#123f59] mb-2">سجل المسيرات السابقة</h3>
          <p className="text-sm font-bold text-gray-500">استعراض المسيرات، التعديل عليها، إرسالها للمراجعة، وطباعة القسائم.</p>
        </GlassCard>

        <GlassCard onClick={() => setActiveView("MUDAD")} className="group">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/20 text-purple-700 flex items-center justify-center mb-4 border border-purple-500/30 group-hover:scale-110 transition-transform">
            <Sparkles size={32} />
          </div>
          <h3 className="text-xl font-black text-[#123f59] mb-2">تسجيل ومطابقة منصة "مُدد"</h3>
          <p className="text-sm font-bold text-gray-500">ارفع ملف المسير المعتمد من منصة مدد ليقوم الذكاء الاصطناعي بمطابقته وأرشفته كمدفوع.</p>
        </GlassCard>

        <GlassCard onClick={() => toast.info("قريباً: لوحة الإحصائيات الشاملة")} className="group">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-amber-600/20 text-amber-700 flex items-center justify-center mb-4 border border-amber-500/30 group-hover:scale-110 transition-transform">
            <PieChart size={32} />
          </div>
          <h3 className="text-xl font-black text-[#123f59] mb-2">التقارير والإحصائيات</h3>
          <p className="text-sm font-bold text-gray-500">تحليل ميزانية الرواتب، تتبع الاستقطاعات، ومقارنة المصروفات عبر الأشهر المختلفة.</p>
        </GlassCard>
      </div>
    </div>
  );

  // --- واجهة إصدار المسير النظامي ---
  const renderGenerate = () => (
    <div className="flex-1 flex flex-col z-10 relative p-6">
      <ViewHeader title="إصدار مسير رواتب جديد" subtitle="إنشاء مسير رواتب من بيانات النظام" icon={Calculator} onBack={() => setActiveView("HUB")} />
      <div className="max-w-2xl mx-auto w-full mt-10">
        <GlassCard>
          <div className="flex flex-col items-center text-center p-6">
            <div className="h-24 w-24 rounded-full bg-teal-50 border-2 border-dashed border-teal-500 flex items-center justify-center text-teal-600 mb-6">
              <Banknote size={40} />
            </div>
            <h3 className="text-xl font-black text-[#123f59] mb-2">اختر شهر الاستحقاق</h3>
            <p className="text-sm font-bold text-gray-500 mb-8">سيقوم النظام باحتساب الرواتب بناءً على العقود المسجلة.</p>
            
            <input 
              type="month" 
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
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
        </GlassCard>
      </div>
    </div>
  );

  // --- واجهة منصة مدد ---
  const renderMudad = () => (
    <div className="flex-1 flex flex-col z-10 relative p-6">
      <ViewHeader title="مطابقة منصة مدد" subtitle="ارفع المسير النهائي من مُدد للمطابقة الذكية" icon={Sparkles} onBack={() => setActiveView("HUB")} />
      <div className="max-w-3xl mx-auto w-full mt-4">
        <GlassCard>
          <div className="flex flex-col items-center p-6">
            <div className="w-full bg-white/40 backdrop-blur-md border-2 border-dashed border-purple-500/40 rounded-3xl p-10 text-center hover:bg-white/60 transition-all relative group overflow-hidden mb-8">
              <input type="file" accept=".pdf,.xlsx,.xls,.csv" onChange={(e) => setMudadFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
              <div className="relative z-10 pointer-events-none flex flex-col items-center gap-4">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${mudadFile ? "bg-purple-500 text-white" : "bg-white border border-purple-200 text-purple-600"}`}>
                  {mudadFile ? <CheckCircle2 size={36} /> : <UploadCloud size={36} />}
                </div>
                <div>
                  <p className="text-xl font-black text-[#123f59]">{mudadFile ? mudadFile.name : "اسحب وافلت ملف مدد هنا"}</p>
                  <p className="text-sm font-bold text-gray-500 mt-2">يدعم ملفات Excel أو CSV</p>
                </div>
              </div>
            </div>

            <div className="w-full flex gap-4">
              <div className="flex-1 bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex gap-4 items-start">
                <AlertCircle className="text-purple-600 shrink-0" />
                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                  سيتم تحويل حالة الرواتب المعتمدة لهذا الشهر إلى "مدفوعة" ومصدرها "مُدد" تلقائياً.
                </p>
              </div>
              <button onClick={handleMudadUpload} disabled={isAnalyzing || !mudadFile} className="shrink-0 px-8 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 text-base font-black text-white shadow-[0_8px_20px_rgba(168,85,247,0.3)] transition-all hover:scale-105 flex items-center gap-2 disabled:opacity-70">
                {isAnalyzing ? <><Loader2 size={20} className="animate-spin" /> جاري المطابقة...</> : <><Sparkles size={20} /> بدء المطابقة</>}
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );

  // --- واجهة السجل ---
  const renderHistory = () => {
    const filteredPayrolls = payrolls.filter(p => {
      const matchesSearch = p.employee?.name.includes(searchQuery) || p.employee?.employeeCode.includes(searchQuery);
      return matchesSearch;
    });

    return (
      <div className="flex-1 flex flex-col min-w-0 z-10 relative p-6">
        <ViewHeader 
          title="سجل المسيرات" 
          subtitle="استعراض وإرسال المسيرات للمراجعة" 
          icon={History} 
          onBack={() => setActiveView("HUB")}
        />

        <div className="bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-4 mb-6 shadow-sm flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4 items-center w-full md:w-auto">
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="ابحث بالاسم..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full h-12 pr-12 pl-4 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/30 transition-all placeholder-gray-400" />
            </div>
            <input type="month" value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="h-12 px-4 bg-white/50 border border-white/60 rounded-xl text-sm font-black text-[#123f59] outline-none focus:bg-white focus:ring-2 focus:ring-teal-500/30" />
          </div>

          <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-xl border border-white/60">
            {[{ id: "ALL", label: "الكل" }, { id: "SYSTEM", label: "نظامي" }, { id: "MUDAD", label: "مدد" }].map(btn => (
              <button key={btn.id} onClick={() => setFilterSource(btn.id)} className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${filterSource === btn.id ? "bg-[#123f59] text-white shadow-md" : "text-[#123f59] hover:bg-white/50"}`}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-white/50 backdrop-blur-xl border border-white/60 rounded-3xl overflow-hidden shadow-lg flex flex-col relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/30 backdrop-blur-sm z-10">
              <Loader2 className="w-12 h-12 animate-spin text-teal-600" />
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-[#123f59]/10 text-[#123f59] border-b border-white/60">
                    <th className="p-5 font-black text-sm whitespace-nowrap">الموظف</th>
                    <th className="p-5 font-black text-sm whitespace-nowrap">الأساسي</th>
                    <th className="p-5 font-black text-sm whitespace-nowrap text-emerald-700">البدلات</th>
                    <th className="p-5 font-black text-sm whitespace-nowrap text-rose-700">الخصم</th>
                    <th className="p-5 font-black text-base whitespace-nowrap">الصافي</th>
                    <th className="p-5 font-black text-sm whitespace-nowrap">المصدر والحالة</th>
                    <th className="p-5 font-black text-sm whitespace-nowrap text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-24 text-gray-500">
                        <FileBox className="mx-auto mb-4 opacity-40 text-[#123f59]" size={64} />
                        <p className="font-black text-lg">لا توجد مسيرات ضمن هذا الفلتر.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map(record => (
                      <tr key={record.id} className="hover:bg-white/60 transition-colors duration-200">
                        <td className="p-5 align-middle">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-teal-400/20 to-teal-600/20 flex items-center justify-center text-teal-700 border border-teal-500/20 shadow-inner">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="font-black text-[#123f59] text-sm">{record.employee?.name}</p>
                              <p className="text-xs text-gray-500 font-bold mt-1">{record.employee?.employeeCode}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-5 font-bold text-gray-600 text-sm align-middle">{Number(record.baseSalary)?.toLocaleString()} ر.س</td>
                        <td className="p-5 font-bold text-emerald-600 text-sm align-middle">+{(Number(record.housingAllow) + Number(record.transportAllow))?.toLocaleString()} ر.س</td>
                        <td className="p-5 font-bold text-rose-500 text-sm align-middle">-{Number(record.deductions)?.toLocaleString()} ر.س</td>
                        <td className="p-5 font-black text-[#123f59] text-base align-middle">{Number(record.netSalary)?.toLocaleString()} ر.س</td>
                        <td className="p-5 align-middle">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border backdrop-blur-sm ${record.source === 'MUDAD' ? 'bg-purple-500/20 text-purple-800 border-purple-500/30' : 'bg-blue-500/20 text-blue-800 border-blue-500/30'}`}>
                              {record.source === 'MUDAD' ? 'منصة مدد' : 'نظام داخلي'}
                            </span>
                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-xl border backdrop-blur-sm flex items-center gap-1 
                              ${record.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/30' : 
                                record.status === 'APPROVED' ? 'bg-indigo-500/20 text-indigo-800 border-indigo-500/30' : 
                                record.status === 'UNDER_REVIEW' ? 'bg-cyan-500/20 text-cyan-800 border-cyan-500/30' : 
                                'bg-amber-500/20 text-amber-800 border-amber-500/30'}`}>
                              {record.status === 'PAID' ? 'تم التحويل (مدد)' : 
                               record.status === 'APPROVED' ? 'معتمد' : 
                               record.status === 'UNDER_REVIEW' ? 'قيد المراجعة' : 'مسودة'}
                            </span>
                          </div>
                        </td>
                        <td className="p-5 text-center align-middle">
                          <button onClick={() => {
                            setSelectedPayslip(record);
                            setEditForm({...record});
                            setIsEditing(false); // التأكد من إغلاق وضع التعديل عند الفتح
                          }} className="h-10 px-4 rounded-xl bg-white/50 text-[#123f59] border border-white/60 hover:bg-white hover:shadow-md font-black text-xs flex items-center justify-center gap-2 mx-auto transition-all">
                            <FileText size={16} /> تفاصيل
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
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-gradient-to-br from-[#e0eafc] to-[#cfdef3] font-cairo relative" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-teal-300 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-amber-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-4000"></div>

      {activeView === "HUB" && renderHub()}
      {activeView === "GENERATE" && renderGenerate()}
      {activeView === "MUDAD" && renderMudad()}
      {activeView === "HISTORY" && renderHistory()}

      {/* نافذة القسيمة (Modal) */}
      <AnimatePresence>
        {selectedPayslip && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#06111d]/60 backdrop-blur-md overflow-y-auto print:bg-transparent print:p-0 print:block">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white/90 backdrop-blur-2xl border border-white/70 rounded-[32px] w-full max-w-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] relative overflow-hidden flex flex-col print:shadow-none print:border-0 print:block print:rounded-none">
              
              {/* واجهة العرض التفاعلية (مخفية عند الطباعة) */}
              <div className="print:hidden flex flex-col h-full">
                <div className="p-6 border-b border-white/50 flex justify-between items-center relative z-10 bg-white/50">
                  <div>
                    <h3 className="font-black text-2xl text-[#123f59] flex items-center gap-3">
                      <FileText className="text-teal-600" size={28}/> قسيمة راتب ({selectedPayslip.month})
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => {setSelectedPayslip(null); setIsEditing(false);}} className="h-12 w-12 rounded-full bg-white/50 border border-white/60 text-gray-600 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center transition shadow-sm">
                      <XCircle size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-white min-h-[400px]">
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
                          {isEditing ? <input type="number" className="border border-gray-300 rounded-lg p-2 w-32 text-left outline-none focus:border-teal-500 font-black" value={editForm.baseSalary} onChange={e => setEditForm({...editForm, baseSalary: e.target.value})} /> : <span className="font-black">{Number(editForm?.baseSalary || 0).toLocaleString()} ر.س</span>}
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-700 items-center">
                          <span>بدل السكن</span> 
                          {isEditing ? <input type="number" className="border border-gray-300 rounded-lg p-2 w-32 text-left outline-none focus:border-teal-500 font-black" value={editForm.housingAllow} onChange={e => setEditForm({...editForm, housingAllow: e.target.value})} /> : <span className="font-black">{Number(editForm?.housingAllow || 0).toLocaleString()} ر.س</span>}
                        </div>
                        <div className="flex justify-between text-sm font-bold text-gray-700 items-center">
                          <span>بدل النقل</span> 
                          {isEditing ? <input type="number" className="border border-gray-300 rounded-lg p-2 w-32 text-left outline-none focus:border-teal-500 font-black" value={editForm.transportAllow} onChange={e => setEditForm({...editForm, transportAllow: e.target.value})} /> : <span className="font-black">{Number(editForm?.transportAllow || 0).toLocaleString()} ر.س</span>}
                        </div>
                      </div>
                    </div>

                    <div className="p-5 border-b border-gray-200 bg-rose-50/50">
                      <h4 className="text-sm font-black text-rose-700 mb-4 flex items-center gap-2"><AlertCircle size={18}/> الاستقطاعات</h4>
                      <div className="flex justify-between text-sm font-bold text-rose-600 items-center">
                        <span>الخصومات</span> 
                        {isEditing ? <input type="number" className="border border-rose-300 rounded-lg p-2 w-32 text-left outline-none focus:border-rose-500 font-black text-rose-700" value={editForm.deductions} onChange={e => setEditForm({...editForm, deductions: e.target.value})} /> : <span className="font-black">{Number(editForm?.deductions || 0).toLocaleString()} ر.س</span>}
                      </div>
                    </div>

                    <div className="p-6 bg-[#123f59] text-white flex justify-between items-center">
                      <span className="text-base font-bold text-[#e0eafc]">صافي الراتب المستحق</span>
                      <span className="text-2xl font-black">{currentNetSalary.toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                {/* أزرار الإجراءات (مخفية عند الطباعة) */}
                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
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

                      {/* زر التعديل وإرسال المراجعة يظهران فقط في حالة PENDING */}
                      {selectedPayslip.status === "PENDING" && (
                        <>
                          <button onClick={() => setIsEditing(true)} className="px-5 py-2.5 rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-2">
                            <Edit3 size={18} /> تعديل مالياً
                          </button>
                          
                          <button onClick={() => handleRequestReview(selectedPayslip.id)} className="px-5 py-2.5 rounded-xl font-bold bg-[#123f59] text-white hover:bg-[#0c2a3d] shadow-md transition-colors flex items-center gap-2">
                            <Send size={18} /> إرسال للمراجعة
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ======================================= */}
              {/* قالب الطباعة الاحترافي (يظهر فقط في الطباعة) */}
              {/* ======================================= */}
              <div id="printable-payslip" className="hidden print:block w-full bg-white text-black p-8" dir="rtl">
                {/* ترويسة الشركة */}
                <div className="flex justify-between items-end border-b-2 border-black pb-4 mb-6">
                  <div>
                    <h1 className="text-3xl font-black mb-1">مكتب الهندسة المتكامل</h1>
                    <p className="text-lg text-gray-600 font-bold">قسيمة راتب موظف (Payslip)</p>
                  </div>
                  <div className="text-left font-bold text-sm">
                    <p>التاريخ: {new Date().toLocaleDateString('ar-SA')}</p>
                    <p>رقم القسيمة: #{selectedPayslip.id.slice(0,8).toUpperCase()}</p>
                  </div>
                </div>

                {/* معلومات الموظف */}
                <div className="mb-8 p-4 border border-black rounded-lg bg-gray-50">
                  <table className="w-full text-sm font-bold">
                    <tbody>
                      <tr>
                        <td className="pb-2 w-1/4">اسم الموظف:</td>
                        <td className="pb-2 w-1/4 text-lg font-black">{selectedPayslip.employee?.name}</td>
                        <td className="pb-2 w-1/4">الرقم الوظيفي:</td>
                        <td className="pb-2 w-1/4 font-black">{selectedPayslip.employee?.employeeCode}</td>
                      </tr>
                      <tr>
                        <td className="w-1/4">القسم:</td>
                        <td className="w-1/4 font-black">{selectedPayslip.employee?.department || 'غير محدد'}</td>
                        <td className="w-1/4">عن شهر:</td>
                        <td className="w-1/4 font-black">{selectedPayslip.month}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* جدول المستحقات والخصومات */}
                <div className="flex gap-6 mb-8">
                  {/* المستحقات */}
                  <div className="flex-1">
                    <table className="w-full border-collapse border border-black text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-black p-2 text-right font-black">المستحقات (Earnings)</th>
                          <th className="border border-black p-2 text-left font-black w-32">المبلغ (ر.س)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-2 font-bold">الراتب الأساسي</td>
                          <td className="border border-black p-2 text-left font-bold">{Number(selectedPayslip.baseSalary).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 font-bold">بدل السكن</td>
                          <td className="border border-black p-2 text-left font-bold">{Number(selectedPayslip.housingAllow).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 font-bold">بدل النقل</td>
                          <td className="border border-black p-2 text-left font-bold">{Number(selectedPayslip.transportAllow).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 font-black bg-gray-100">إجمالي المستحقات</td>
                          <td className="border border-black p-2 text-left font-black bg-gray-100">
                            {((Number(selectedPayslip.baseSalary) + Number(selectedPayslip.housingAllow) + Number(selectedPayslip.transportAllow))).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* الاستقطاعات */}
                  <div className="flex-1">
                    <table className="w-full border-collapse border border-black text-sm">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-black p-2 text-right font-black">الاستقطاعات (Deductions)</th>
                          <th className="border border-black p-2 text-left font-black w-32">المبلغ (ر.س)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-black p-2 font-bold">خصومات أخرى / غياب</td>
                          <td className="border border-black p-2 text-left font-bold">{Number(selectedPayslip.deductions).toLocaleString()}</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 font-bold">&nbsp;</td>
                          <td className="border border-black p-2 text-left font-bold">&nbsp;</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 font-bold">&nbsp;</td>
                          <td className="border border-black p-2 text-left font-bold">&nbsp;</td>
                        </tr>
                        <tr>
                          <td className="border border-black p-2 font-black bg-gray-100">إجمالي الاستقطاعات</td>
                          <td className="border border-black p-2 text-left font-black bg-gray-100">{Number(selectedPayslip.deductions).toLocaleString()}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* الصافي */}
                <div className="border-2 border-black rounded-lg p-4 bg-gray-100 flex justify-between items-center mb-16">
                  <span className="text-lg font-black">صافي الراتب المستحق الدفع (Net Pay)</span>
                  <span className="text-2xl font-black border-b-2 border-black pb-1">{Number(selectedPayslip.netSalary).toLocaleString()} ر.س</span>
                </div>

                {/* التواقيع */}
                <div className="flex justify-between px-10 text-center font-bold">
                  <div>
                    <p className="mb-8">توقيع الموظف المـُقِر بالاستلام</p>
                    <p className="border-t border-black w-48 mx-auto pt-2">التوقيع / التاريخ</p>
                  </div>
                  <div>
                    <p className="mb-8">اعتماد الموارد البشرية والمالية</p>
                    <p className="border-t border-black w-48 mx-auto pt-2">الختم والتوقيع</p>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetContent={{__html: `
        @media print {
          @page { size: A4 portrait; margin: 15mm; }
          body * { visibility: hidden; }
          .fixed.inset-0 { position: absolute; left: 0; top: 0; background: white; padding: 0; width: 100%; height: 100%; overflow: visible; }
          .fixed.inset-0 * { visibility: visible; }
          .print\\:hidden { display: none !important; }
          #printable-payslip { width: 100% !important; color: black !important; background: white !important;}
        }
      `}} />
    </div>
  );
}