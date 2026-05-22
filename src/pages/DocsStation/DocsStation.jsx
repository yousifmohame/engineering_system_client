import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  FileText, Search, Settings, Hash, Funnel, PenLine, 
  Printer, X, Plus, Loader2, Trash2, Edit
} from 'lucide-react';

// استيراد مودال الإعدادات الذي قمنا بإنشائه مسبقاً
import DocumentSettingsModal from './models/DocumentSettingsModal'; 

// بيانات وهمية لمحاكاة سجل المستندات المولدة (Generated Docs Log)
const mockGeneratedDocs = [
  { id: 1, serial: 'CLI-REP-001-GEN-2026-05-20-901', type: 'مستند تقرير عن عميل', transaction: '-', status: 'مكتمل', statusColor: 'emerald', user: 'المستخدم الحالي', date: '2026-05-20 16:15' },
  { id: 2, serial: 'CLI-REP-001-GEN-2026-05-20-254', type: 'مستند تقرير عن عميل', transaction: '-', status: 'مسودة', statusColor: 'amber', user: 'المستخدم الحالي', date: '2026-05-20 16:15' },
  { id: 3, serial: 'DOC-TRX5001-2026-05-01-001', type: 'التقرير الفني الموحد', transaction: 'TRX-5001', status: 'مكتمل', statusColor: 'emerald', user: 'م. خالد', date: '2026-05-01 10:30' }
];

export default function DocumentCenterScreen() {
  // 1. حالات التنقل والبحث
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' | 'log'
  const [catalogSearch, setCatalogSearch] = useState('');
  const [logSearch, setLogSearch] = useState('');

  // 2. حالات البيانات (Data States)
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 3. حالات المودال (الإضافة / التعديل)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState('');
  
  // للمعاينة الحية في الشاشة الرئيسية
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // ==========================================
  // دوال الاتصال بالخادم (API Calls)
  // ==========================================

  // جلب القوالب
  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/doc-templates');
      setTemplates(res.data);
      if (res.data.length > 0 && !previewTemplate) {
        setPreviewTemplate(res.data[0]);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // حذف قالب
  const handleDeleteTemplate = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("هل أنت متأكد من حذف هذا القالب؟")) return;
    try {
      await api.delete(`/doc-templates/${id}`);
      fetchTemplates(); // تحديث القائمة فوراً
      if (previewTemplate?.id === id) setPreviewTemplate(null);
    } catch (error) {
      alert("خطأ أثناء الحذف");
    }
  };

  // فتح مودال الإعدادات (للإضافة أو التعديل)
  const openSettingsModal = (e, template = null) => {
    if(e) e.stopPropagation();
    setSelectedTemplateId(template?.id || null);
    setSelectedTemplateTitle(template?.title || 'مستند جديد');
    setIsModalOpen(true);
  };

  // ==========================================
  // مكون: شاشة عرض القوالب/الكتالوج (Catalog View)
  // ==========================================
  const renderCatalogView = () => {
    const filteredDocs = templates.filter(doc => 
      doc.title?.includes(catalogSearch) || doc.code?.includes(catalogSearch)
    );

    return (
      <div className="h-full flex flex-col md:flex-row overflow-hidden animate-in fade-in">
        
        {/* Sidebar - قائمة القوالب */}
        <div className="w-full md:w-[350px] bg-white border-l border-slate-200 flex flex-col shrink-0 z-10 shadow-[2px_0_10px_rgba(0,0,0,0.02)]">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700">أنواع المستندات</h3>
              <button 
                onClick={(e) => openSettingsModal(e)}
                className="p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                title="إضافة نوع جديد"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
              <input 
                placeholder="بحث برمز أو اسم المستند..." 
                className="w-full pl-3 pr-9 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" 
                type="text" 
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 text-indigo-500 animate-spin" /></div>
            ) : filteredDocs.length === 0 ? (
              <div className="text-center py-10 text-xs font-bold text-slate-400">لا توجد مستندات، أضف مستنداً جديداً.</div>
            ) : (
              filteredDocs.map((doc) => {
                const isActive = previewTemplate?.id === doc.id;
                return (
                  <div 
                    key={doc.id} 
                    onClick={() => setPreviewTemplate(doc)}
                    className={`w-full text-right p-3 rounded-xl border transition-all flex items-start gap-3 cursor-pointer group ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-transparent border-slate-100 hover:bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:text-indigo-500'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`text-xs font-black truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {doc.title}
                        </h4>
                        
                        {/* أزرار الإجراءات (تظهر عند الـ Hover أو التفعيل) */}
                        <div className={`flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`}>
                          <button onClick={(e) => openSettingsModal(e, doc)} className="p-1 hover:bg-indigo-100 text-indigo-500 rounded transition-colors" title="إعدادات المستند">
                            <Settings className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={(e) => handleDeleteTemplate(e, doc.id)} className="p-1 hover:bg-rose-100 text-rose-500 rounded transition-colors" title="حذف">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${isActive ? 'bg-white text-indigo-600 border-indigo-100' : 'text-slate-400 bg-slate-50 border-slate-200'}`}>
                          {doc.code}
                        </span>
                        <p className="text-[9px] font-bold text-slate-500 truncate">{doc.category || 'غير مصنف'}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* مساحة العرض الرئيسية لمعاينة المستند المختار */}
        <div className="flex-1 bg-slate-50/50 flex flex-col overflow-hidden relative">
          {previewTemplate ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-6 text-center animate-in zoom-in-95">
              <div className="w-20 h-20 bg-white border border-indigo-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-100/50">
                <FileText className="w-10 h-10 text-indigo-500" />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">{previewTemplate.title}</h2>
              <p className="text-sm font-bold text-slate-500 max-w-sm mb-6">
                هذا القالب مخصص لـ ({previewTemplate.category || 'عام'}) وله الرمز المرجعي <span className="font-mono text-indigo-600">{previewTemplate.code}</span>
              </p>
              <div className="flex gap-3">
                <button onClick={(e) => openSettingsModal(e, previewTemplate)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-md hover:bg-indigo-700 transition-colors flex items-center gap-2">
                  <Settings className="w-4 h-4" /> تعديل الإعدادات
                </button>
                <button className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2">
                  <PenLine className="w-4 h-4" /> إنشاء مسودة 
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h2 className="text-sm font-black text-slate-600 mb-2">الرجاء اختيار نوع المستند للبدء</h2>
            </div>
          )}
        </div>

      </div>
    );
  };

  // ----------------------------------------------------
  // مكون: شاشة سجل المستندات (Log View)
  // ----------------------------------------------------
  const renderLogView = () => {
    return (
      <div className="h-full flex flex-col bg-white animate-in fade-in">
        <div className="p-2 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2" />
              <input 
                placeholder="بحث برقم المرجع..." 
                className="w-64 pl-2 pr-8 py-1.5 bg-white border border-slate-200 rounded text-[11px] font-black focus:border-indigo-500 outline-none" 
                type="text" 
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
              />
            </div>
            <button className="p-1.5 bg-white border border-slate-200 rounded text-slate-500 hover:bg-slate-100">
              <Funnel className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[11px] font-black hover:bg-indigo-100 transition-colors">
              تصدير السجل المكثف
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-right border-collapse text-[11px]">
            <thead className="sticky top-0 bg-slate-100 shadow-sm z-10">
              <tr className="text-slate-600 font-extrabold uppercase tracking-wide">
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 w-8 text-center text-slate-400">
                  <Hash className="w-3 h-3 mx-auto" />
                </th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 whitespace-nowrap">الرقم المرجعي (Serial)</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50">نوع المستند</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">الحالة</th>
                <th className="px-3 py-2 border-b border-slate-200 border-l border-slate-200/50 text-center">التاريخ</th>
                <th className="px-3 py-2 border-b border-slate-200 text-center w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody className="font-bold text-slate-700">
              {mockGeneratedDocs
                .filter(doc => doc.serial.includes(logSearch) || doc.type.includes(logSearch))
                .map((doc) => (
                <tr key={doc.id} className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-400">{doc.id}</td>
                  <td className="px-3 py-2 border-l border-slate-100 font-mono text-indigo-700">{doc.serial}</td>
                  <td className="px-3 py-2 border-l border-slate-100">{doc.type}</td>
                  <td className="px-3 py-2 border-l border-slate-100 text-center">
                    <span className={`px-2 py-0.5 rounded uppercase text-[9px] bg-${doc.statusColor}-50 text-${doc.statusColor}-700 border border-${doc.statusColor}-100`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 border-l border-slate-100 text-center text-slate-400 font-mono">{doc.date}</td>
                  <td className="px-3 py-2 text-center">
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="استكمال/تعديل" className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded">
                        <PenLine className="w-3.5 h-3.5" />
                      </button>
                      <button title="معاينة وطباعة" className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded">
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans overflow-hidden" dir="rtl">
      
      {/* Header */}
      <div className="h-14 bg-white border-b border-indigo-100 flex items-center justify-between px-6 shrink-0 shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 leading-tight">مركز المستندات والقوالب</h1>
          </div>
        </div>
        
        {/* أزرار التبديل */}
        <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200">
          <button 
            onClick={() => setActiveTab('catalog')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'catalog' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700 border border-transparent'
            }`}
          >
            أنواع القوالب (Templates)
          </button>
          <button 
            onClick={() => setActiveTab('log')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              activeTab === 'log' 
                ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:text-slate-700 border border-transparent'
            }`}
          >
            سجل المستندات المولدة
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'catalog' ? renderCatalogView() : renderLogView()}
      </div>

      {/* مودال الإعدادات (إنشاء / تعديل) */}
      {isModalOpen && (
        <DocumentSettingsModal 
          isOpen={isModalOpen}
          templateId={selectedTemplateId}
          documentTitle={selectedTemplateTitle}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchTemplates} // تحديث القائمة بعد الحفظ
        />
      )}

      {/* Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}