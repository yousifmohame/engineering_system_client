import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, FileSignature, FileText, Plus, Palette, Shield, Settings, Upload, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../api/axios'; // تأكد من مسار إعداد الـ axios الخاص بك

// استيراد المكونات الفرعية (التبويبات)
import { TemplateModal } from './components/SharedComponents';
import { DashboardTab } from './tabs/DashboardTab';
import { NewDocumentationTab } from './tabs/NewTab'; 
import { LinkageTab } from './tabs/LinkageTab';
import { RegistryTab } from './tabs/RegistryTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SignNowTab } from './tabs/SignNowTab';
import { TemplatesTab } from './tabs/TemplatesTab';

// استيراد القوائم الثابتة للربط (يمكن استبدالها لاحقاً بـ API)
import { mockInternalDocs, initialLinkageMappings } from './data';

export default function ElectronicDocumentation() {
  // ---------------------------------------------------------
  // States
  // ---------------------------------------------------------
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  
  // States for New Documentation
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedSignatureType, setSelectedSignatureType] = useState('SIG_AND_STAMP');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Data States from Backend
  const [dashboardStats, setDashboardStats] = useState(null);
  const [sealTemplates, setSealTemplates] = useState([]);
  const [documentedItems, setDocumentedItems] = useState([]); 
  const [linkageMappings, setLinkageMappings] = useState(initialLinkageMappings); // يمكن جلبها من API لاحقاً
  
  // Settings State
  const [docSettings, setDocSettings] = useState({
    defaultStamp: {
      backgroundColor: '#eff6ff',
      backgroundOpacity: 0.6,
      backgroundText: 'توثيق إلكتروني معتمد',
      serialPosition: 'inside',
      serialPrefix: 'SEC-',
      stampImage: 'https://picsum.photos/seed/stamp1/200/200'
    }
  });

  // Modal States
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const fileInputRef = useRef(null);

  // ---------------------------------------------------------
  // Fetch Data Functions
  // ---------------------------------------------------------
  const fetchDashboardData = async () => {
    try {
      const res = await api.get('/documentation/dashboard');
      if (res.data.success) {
        setDashboardStats(res.data.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await api.get('/documentation/templates');
      if (res.data.success) {
        setSealTemplates(res.data.data);
        // تعيين أول قالب كافتراضي في نموذج التوثيق الجديد
        if (res.data.data.length > 0 && !selectedTemplateId) {
          const defaultTemp = res.data.data.find(t => t.isDefault) || res.data.data[0];
          setSelectedTemplateId(defaultTemp.id);
        }
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب قوالب الأختام');
    }
  };

  const fetchRegistry = async () => {
    try {
      const res = await api.get('/documentation/registry');
      if (res.data.success) {
        setDocumentedItems(res.data.data);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء جلب سجل التوثيق');
    }
  };

  // جلب البيانات عند تحميل المكون
  useEffect(() => {
    fetchDashboardData();
    fetchTemplates();
    fetchRegistry();
  }, []);


  // ---------------------------------------------------------
  // Action Handlers
  // ---------------------------------------------------------
  
  // معالجة اختيار ملف خارجي
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedDocType('EXTERNAL');
      setActiveTab('new');
    }
  };

  // معالجة حفظ أو تعديل القالب في قاعدة البيانات
  const handleSaveTemplate = async () => {
    if (!editingTemplate?.name) {
      toast.error('يرجى إدخال اسم القالب');
      return;
    }
    
    try {
      const response = await api.post('/documentation/templates', editingTemplate);
      
      if (response.data.success) {
        toast.success(editingTemplate.id ? 'تم تحديث القالب بنجاح' : 'تم إضافة القالب الجديد بنجاح');
        fetchTemplates(); // تحديث قائمة القوالب من الباك إند
        setIsTemplateModalOpen(false);
        setEditingTemplate(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ القالب');
    }
  };

  // إرسال طلب التوثيق للسيرفر (إصدار السريال والهاش وحفظ الملف)
  const executeDocumentation = async () => {
    if (!selectedFile && !selectedDocId) {
      toast.error('يرجى اختيار مستند من النظام أو رفع ملف أولاً');
      return;
    }
    
    if (!selectedTemplateId) {
      toast.error('يرجى اختيار قالب الختم');
      return;
    }

    setIsUploading(true);

    try {
      // إعداد البيانات كـ FormData لدعم رفع الملفات
      const formData = new FormData();
      formData.append('docType', selectedDocType);
      formData.append('signatureType', selectedSignatureType);
      formData.append('templateId', selectedTemplateId);

      if (selectedFile) {
        formData.append('externalFile', selectedFile);
        formData.append('fileName', selectedFile.name);
      } else {
        formData.append('docId', selectedDocId);
        
        // سحب اسم الطرف الثاني من البيانات (يجب تحديث هذا الجزء ليجلب الاسم من الـ API الفعلي للعقود والفواتير)
        const partyBName = mockInternalDocs[selectedDocType]?.find(d => d.id === selectedDocId)?.partyB || 'عميل';
        formData.append('partyBName', partyBName);
      }

      // إرسال الطلب للباك إند الحقيقي
      const response = await api.post('/documentation/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success('تم التوثيق الرقمي بنجاح وإصدار ملف الاعتماد');
        
        // تحديث البيانات في الشاشات
        fetchRegistry();
        fetchDashboardData();
        
        // إعادة تعيين الحقول
        setSelectedFile(null);
        setSelectedDocId('');
        setActiveTab('registry');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشلت عملية التوثيق الرقمي');
    } finally {
      setIsUploading(false);
    }
  };

  // ---------------------------------------------------------
  // UI Tabs Configuration
  // ---------------------------------------------------------
  const tabsConfig = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'sign-now', label: 'مراجعة وتوقيع', icon: FileSignature },
    { id: 'registry', label: 'سجل التوثيق', icon: FileText },
    { id: 'new', label: 'توثيق جديد', icon: Plus },
    { id: 'templates', label: 'قوالب الأختام', icon: Palette },
    { id: 'linkage', label: 'ربط الأنواع', icon: Shield },
    { id: 'settings', label: 'إعدادات النظام', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">نظام التوثيق الإلكتروني</h1>
            <p className="text-xs text-slate-500 font-bold">إدارة الأختام الرقمية والتوثيق الآمن للمستندات (متصل بالسيرفر)</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md">
            <Upload className="w-4 h-4" /> توثيق ملف خارجي
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-8 shrink-0 overflow-x-auto custom-scrollbar">
        {tabsConfig.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center whitespace-nowrap gap-2 py-4 text-xs font-black transition-all border-b-2 ${
              activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* نافذة إنشاء/تعديل القوالب */}
        {isTemplateModalOpen && (
          <TemplateModal 
            editingTemplate={editingTemplate} 
            setEditingTemplate={setEditingTemplate} 
            setIsTemplateModalOpen={setIsTemplateModalOpen} 
            handleSaveTemplate={handleSaveTemplate}
          />
        )}

        {/* التبويبات */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            documentedItems={documentedItems} 
            stats={dashboardStats} // تمرير إحصائيات السيرفر
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'new' && (
          <NewDocumentationTab 
             selectedFile={selectedFile} setSelectedFile={setSelectedFile}
             selectedDocType={selectedDocType} setSelectedDocType={setSelectedDocType}
             selectedDocId={selectedDocId} setSelectedDocId={setSelectedDocId}
             selectedSignatureType={selectedSignatureType} setSelectedSignatureType={setSelectedSignatureType}
             selectedTemplateId={selectedTemplateId} setSelectedTemplateId={setSelectedTemplateId}
             sealTemplates={sealTemplates} isUploading={isUploading} executeDocumentation={executeDocumentation}
             fileInputRef={fileInputRef} mockInternalDocs={mockInternalDocs}
          />
        )}

        {activeTab === 'sign-now' && (
          <SignNowTab 
             selectedItems={selectedItems} 
             setSelectedItems={setSelectedItems} 
             setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'registry' && (
          <RegistryTab 
             documentedItems={documentedItems}
             selectedItems={selectedItems}
             setSelectedItems={setSelectedItems}
             searchQuery={searchQuery}
             setSearchQuery={setSearchQuery}
          />
        )}

        {activeTab === 'templates' && (
          <TemplatesTab 
             sealTemplates={sealTemplates}
             setSealTemplates={setSealTemplates}
             setEditingTemplate={setEditingTemplate}
             setIsTemplateModalOpen={setIsTemplateModalOpen}
          />
        )}

        {activeTab === 'linkage' && (
          <LinkageTab 
             linkageMappings={linkageMappings}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
             docSettings={docSettings}
             setDocSettings={setDocSettings}
          />
        )}

      </main>
    </div>
  );
}