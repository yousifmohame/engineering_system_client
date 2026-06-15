import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, Bot, FileText, CheckCircle, Loader2, 
  Building, User, Banknote, Landmark, CalendarCheck, Briefcase, Mail, Phone, MapPin, GraduationCap,
  Plus, Search, Eye, X, AlertCircle
} from 'lucide-react';
import api from '../../../../api/axios';

export default function EmployeeContractsManager() {
  const [contracts, setContracts] = useState([]);
  const [employeesList, setEmployeesList] = useState([]); // 👈 قائمة الموظفين
  const [isLoadingContracts, setIsLoadingContracts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(""); // 👈 الموظف المختار يدوياً
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [aiData, setAiData] = useState(null);

  // جلب العقود
  const fetchContracts = async () => {
    setIsLoadingContracts(true);
    try {
      const res = await api.get('/employees/all/contracts'); 
      setContracts(res.data.contracts || res.data || []);
    } catch (error) {
      console.error("Error fetching contracts:", error);
    } finally {
      setIsLoadingContracts(false);
    }
  };

  // 👈 جلب قائمة الموظفين لاختيارهم
  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees'); 
      setEmployeesList(res.data.data || res.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchEmployees(); // 👈 استدعاء جلب الموظفين عند فتح الشاشة
  }, []);

  const handleUploadAndAnalyze = async () => {
    if (!file) return alert("الرجاء اختيار ملف العقد أولاً");
    // إذا أردت إجبار المشرف على الاختيار، يمكنك تفعيل هذا السطر:
    // if (!selectedEmployeeId) return alert("الرجاء اختيار الموظف من القائمة أولاً");
    
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append("contractFile", file);

    try {
      const res = await api.post('/employees/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAiData({
        ...res.data.extractedData,
        fileUrl: res.data.fileUrl
      });
    } catch (error) {
      console.error(error);
      alert("فشل في تحليل العقد. يرجى التأكد من جودة الملف.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAiData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSaveContract = async () => {
    setIsSaving(true);
    try {
      const payload = { 
        ...aiData, 
        aiExtractedData: aiData,
        employeeId: selectedEmployeeId // 👈 إرسال الـ ID اليدوي إلى الباك إند
      };
      
      await api.post(`/employees/contracts/auto-link`, payload);
      alert("تم حفظ العقد وربطه بنجاح!");
      
      setAiData(null);
      setFile(null);
      setSelectedEmployeeId(""); // تصفير الاختيار
      setIsAddModalOpen(false);
      
      fetchContracts();
    } catch (error) {
      console.error("Error saving contract:", error);
      alert(error.response?.data?.message || "حدث خطأ أثناء حفظ العقد.");
    } finally {
      setIsSaving(false);
    }
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAiData(null);
    setFile(null);
    setSelectedEmployeeId("");
  };

  const filteredContracts = contracts.filter(c => 
    (c.secondPartyName?.includes(searchQuery)) || 
    (c.contractNumber?.includes(searchQuery)) ||
    (c.employee?.name?.includes(searchQuery))
  );

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative" dir="rtl">
      
      {/* 1. الشاشة الرئيسية */}
      <div className="shrink-0 p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-[#123f59] flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[#c5983c]" />
            سجل عقود الموظفين
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">إدارة واستعراض كافة العقود الرسمية للموظفين في النظام.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="ابحث باسم الموظف أو رقم العقد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-sm font-bold text-[#123f59] focus:outline-none focus:border-[#c5983c] shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#123f59] hover:bg-[#0e7490] text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عقد جديد</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar-slim bg-slate-50/30">
        {isLoadingContracts ? (
          <div className="flex flex-col items-center justify-center h-40 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#c5983c]" />
            <p className="text-sm font-bold text-slate-500">جاري جلب بيانات العقود...</p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white border border-dashed border-slate-200 rounded-2xl">
            <FileText className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-slate-500 font-bold">لا توجد عقود مسجلة حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredContracts.map((contract) => (
              <div key={contract.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={contract.fileUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg" title="عرض الملف">
                    <Eye className="w-4 h-4" />
                  </a>
                </div>
                
                <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black mb-3 ${contract.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {contract.isActive ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {contract.isActive ? 'ساري المفعول' : 'منتهي / ملغي'}
                </div>
                
                <h3 className="font-black text-[#123f59] text-sm mb-1 truncate">{contract.secondPartyName || contract.employee?.name || "غير محدد"}</h3>
                <p className="text-xs text-slate-500 font-bold mb-4">{contract.contractType} - {contract.source}</p>
                
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">رقم العقد:</span>
                    <span className="font-bold text-[#123f59]">{contract.contractNumber || '---'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">البداية:</span>
                    <span className="font-bold text-[#123f59]">{contract.startDate ? new Date(contract.startDate).toLocaleDateString() : '---'}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">النهاية:</span>
                    <span className="font-bold text-rose-600">{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'غير محدد'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. النافذة المنبثقة (Modal) لمحرك إضافة العقد */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-[#06111d]/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
            
            <div className="shrink-0 p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-[#123f59] flex items-center gap-2">
                  <Bot className="w-5 h-5 text-emerald-600" />
                  محرك إضافة وتحليل العقود
                </h2>
                <p className="text-[11px] text-slate-500 font-bold mt-1">اختر الموظف وارفع العقد لاستخراج بياناته وحفظه.</p>
              </div>
              <button onClick={closeAddModal} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar-slim">
              {!aiData ? (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-10 text-center max-w-2xl mx-auto mt-8">
                  
                  {/* 👈 التعديل الجديد: قائمة اختيار الموظف */}
                  <div className="mb-8 text-right bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <label className="block text-sm font-black text-[#123f59] mb-2 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#c5983c]" /> 1. اختر الموظف (الطرف الثاني)
                    </label>
                    <select 
                      value={selectedEmployeeId}
                      onChange={(e) => setSelectedEmployeeId(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg p-3 text-sm font-bold text-[#123f59] outline-none focus:border-[#c5983c] focus:ring-1 focus:ring-[#c5983c]"
                    >
                      <option value="">-- التخطي وترك النظام يربط تلقائياً برقم الهوية --</option>
                      {employeesList.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} {emp.nationalId ? `(${emp.nationalId})` : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400 mt-2 font-bold">إذا تركت هذا الحقل فارغاً، سيحاول النظام التعرف على الموظف من خلال رقم هويته في العقد، أو إنشاء ملف جديد له.</p>
                  </div>

                  <UploadCloud className="w-14 h-14 text-slate-400 mx-auto mb-4" />
                  <p className="text-sm font-bold text-slate-700 mb-6">2. قم بإسقاط ملف العقد بصيغة (PDF) هنا</p>
                  <input 
                    type="file" 
                    accept=".pdf" 
                    onChange={(e) => setFile(e.target.files[0])}
                    className="block w-full max-w-sm mx-auto text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:font-bold file:bg-[#123f59] file:text-white hover:file:bg-[#0e7490] cursor-pointer mb-6"
                  />
                  <button 
                    onClick={handleUploadAndAnalyze}
                    disabled={!file || isAnalyzing}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-800 text-white px-8 py-3 rounded-xl font-black shadow-md hover:shadow-lg disabled:opacity-50 transition-all hover:-translate-y-0.5"
                  >
                    {isAnalyzing ? <Loader2 className="w-5 h-5 animate-spin text-emerald-200" /> : <Bot className="w-5 h-5 text-emerald-200" />}
                    {isAnalyzing ? "جاري قراءة وتحليل العقد..." : "بدء التحليل بـ AI"}
                  </button>
                </div>
              ) : (
                /* ... (باقي كود عرض البيانات aiData المعتاد الذي قدمته لك مسبقاً، ضعه هنا بالكامل بدون تغيير) ... */
                <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 pb-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                    <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                    <div>
                      <h3 className="font-black text-emerald-800 text-sm mb-1">اكتمل استخراج البيانات بنجاح</h3>
                      <p className="text-xs text-emerald-600 font-bold">تأكد من صحة البيانات التالية قبل الاعتماد النهائي.</p>
                    </div>
                  </div>

                  {/* 1. بيانات العقد الأساسية */}
                  <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                    <h4 className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-4 border-b border-slate-100 pb-3">
                      <CalendarCheck className="w-4 h-4 text-[#c5983c]" /> 1. بيانات العقد الأساسية والتواريخ
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5">رقم العقد</label>
                        <input type="text" name="contractNumber" value={aiData.contractNumber || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5">المصدر (المنصة)</label>
                        <input type="text" name="source" value={aiData.source || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5">نوع العقد</label>
                        <input type="text" name="contractType" value={aiData.contractType || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5">تاريخ الإبرام</label>
                        <input type="date" name="executionDate" value={aiData.executionDate || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5">تاريخ البداية (المباشرة)</label>
                        <input type="date" name="startDate" value={aiData.startDate || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1.5">تاريخ النهاية</label>
                        <input type="date" name="endDate" value={aiData.endDate || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                      </div>
                      <div className="col-span-2 flex items-center gap-6 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input type="checkbox" name="isActive" checked={aiData.isActive || false} onChange={handleInputChange} className="w-4 h-4 accent-[#123f59]" /> العقد ساري
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input type="checkbox" name="isRenewable" checked={aiData.isRenewable || false} onChange={handleInputChange} className="w-4 h-4 accent-[#123f59]" /> قابل للتجديد
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                          <input type="checkbox" name="autoRenew" checked={aiData.autoRenew || false} onChange={handleInputChange} className="w-4 h-4 accent-[#123f59]" /> يجدد تلقائياً
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 2. بيانات المنشأة */}
                    <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                      <h4 className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-4 border-b border-slate-100 pb-3">
                        <Building className="w-4 h-4 text-[#c5983c]" /> 2. بيانات الطرف الأول (المنشأة)
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">اسم المنشأة</label>
                            <input type="text" name="firstPartyName" value={aiData.firstPartyName || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">الرقم الوطني الموحد</label>
                            <input type="text" name="unifiedNationalNo" value={aiData.unifiedNationalNo || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none font-mono" />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3"/> بريد المنشأة</label>
                          <input type="email" name="firstPartyEmail" value={aiData.firstPartyEmail || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none text-left" dir="ltr" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">الممثل النظامي</label>
                            <input type="text" name="firstPartyRep" value={aiData.firstPartyRep || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">هوية המمثل</label>
                            <input type="text" name="firstPartyRepId" value={aiData.firstPartyRepId || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none font-mono" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. بيانات الموظف */}
                    <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                      <h4 className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-4 border-b border-slate-100 pb-3">
                        <User className="w-4 h-4 text-[#c5983c]" /> 3. بيانات الطرف الثاني (الموظف)
                      </h4>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">الاسم الكامل</label>
                            <input type="text" name="secondPartyName" value={aiData.secondPartyName || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">الجنسية</label>
                            <input type="text" name="secondPartyNationality" value={aiData.secondPartyNationality || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                          </div>
                          <div className="col-span-2">
                            <label className="text-[10px] font-bold text-rose-500 block mb-1.5">رقم الهوية (يُستخدم للربط التلقائي)</label>
                            <input type="text" name="secondPartyIdNumber" value={aiData.secondPartyIdNumber || ''} onChange={handleInputChange} className="w-full bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-sm font-black text-rose-700 outline-none font-mono focus:ring-2 focus:ring-rose-500" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3"/> رقم الجوال</label>
                            <input type="text" name="secondPartyPhone" value={aiData.secondPartyPhone || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none font-mono text-left" dir="ltr" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3"/> البريد الإلكتروني</label>
                            <input type="text" name="secondPartyEmail" value={aiData.secondPartyEmail || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none text-left" dir="ltr" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 4. تفاصيل الوظيفة ونطاق العمل */}
                    <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                      <h4 className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-4 border-b border-slate-100 pb-3">
                        <Briefcase className="w-4 h-4 text-[#c5983c]" /> 4. تفاصيل الوظيفة ونطاق العمل
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1.5">المسمى الوظيفي</label>
                          <input type="text" name="jobTitle" value={aiData.jobTitle || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3"/> مقر العمل</label>
                          <input type="text" name="workLocation" value={aiData.workLocation || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 block mb-1.5">فترة التجربة (أيام)</label>
                          <input type="number" name="probationDays" value={aiData.probationDays || 0} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none font-mono" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] font-bold text-slate-500 block mb-1.5">أيام وساعات العمل</label>
                          <input type="text" name="workingHours" value={aiData.workingHours || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                        </div>
                      </div>
                    </div>

                    {/* 5 & 6. المالية والبنك */}
                    <div className="space-y-6">
                      <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                        <h4 className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-4 border-b border-slate-100 pb-3">
                          <Banknote className="w-4 h-4 text-[#c5983c]" /> 5. الرواتب والبدلات
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">الأجر الأساسي</label>
                            <input type="number" name="basicSalary" value={aiData.basicSalary || 0} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-emerald-600 outline-none font-mono" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">الإجمالي الشهري</label>
                            <input type="number" name="totalSalary" value={aiData.totalSalary || 0} onChange={handleInputChange} className="w-full bg-emerald-50 border border-emerald-300 rounded-lg p-2.5 text-sm font-black text-emerald-800 outline-none font-mono" />
                          </div>
                        </div>
                      </div>

                      <div className="border border-slate-200 rounded-xl p-5 shadow-sm bg-white">
                        <h4 className="flex items-center gap-2 text-sm font-black text-[#123f59] mb-4 border-b border-slate-100 pb-3">
                          <Landmark className="w-4 h-4 text-[#c5983c]" /> 6. البيانات البنكية
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">اسم البنك</label>
                            <input type="text" name="bankName" value={aiData.bankName || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-bold text-[#123f59] outline-none" />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 block mb-1.5">رقم الآيبان (IBAN)</label>
                            <input type="text" name="iban" value={aiData.iban || ''} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm font-black text-[#123f59] outline-none font-mono text-left" dir="ltr" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ذيل الأزرار في المودل */}
            {aiData && (
              <div className="shrink-0 flex justify-end gap-3 p-5 border-t border-slate-200 bg-slate-50 z-10">
                <button 
                  onClick={() => setAiData(null)} 
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl text-slate-600 bg-white border border-slate-300 hover:bg-slate-100 font-bold text-sm transition-colors disabled:opacity-50"
                >
                  إلغاء وإعادة الرفع
                </button>
                <button 
                  onClick={handleSaveContract} 
                  disabled={isSaving}
                  className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-white bg-gradient-to-l from-[#123f59] to-[#0e7490] hover:shadow-lg font-black text-sm shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#e2bf74]" /> : <CheckCircle className="w-4 h-4 text-[#e2bf74]" />}
                  {isSaving ? "جاري الاعتماد والحفظ..." : "اعتماد و ربط العقد"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}