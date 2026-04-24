import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, Search, Filter, ExternalLink, QrCode, Calendar, 
  User, FileText, CheckCircle2, AlertCircle, Clock, Upload, 
  Settings, LayoutDashboard, FileSignature, Receipt, Plus, 
  ChevronRight, Shield, Image as ImageIcon, Type, Hash, 
  Palette, MousePointer2, Download, Trash2, Link as LinkIcon,
  Check, X, Loader2, FileUp, Lock, Zap, DollarSign, Smartphone, Eye
} from 'lucide-react';
// يتم استخدام sonner للإشعارات، تأكد من تثبيتها (npm install sonner) أو استبدالها بمكتبة الإشعارات الخاصة بك
import { toast } from 'sonner'; 

// ==========================================
// 1. المكونات الفرعية (Sub-components)
// ==========================================

const DocumentationA4Preview = ({ mapping }) => {
  const getPositionValue = (pos) => {
    switch(pos) {
      case 'top_right': return { top: '30px', right: '30px' };
      case 'top_left': return { top: '30px', left: '30px' };
      case 'bottom_right': return { bottom: '100px', right: '30px' };
      case 'bottom_left': return { bottom: '100px', left: '30px' };
      default: return { bottom: '100px', right: '30px' };
    }
  };

  return (
    <div className="bg-white w-[210mm] min-h-[297mm] shadow-2xl relative mx-auto overflow-hidden scale-[0.25] origin-top border border-slate-300 mt-[-200px] mb-[-400px]">
      <div className="p-16 space-y-10">
        <div className="h-10 bg-slate-100 rounded-lg w-1/3" />
        <div className="h-1 bg-slate-900 rounded-full w-full" />
        <div className="h-16 bg-slate-50 rounded-2xl w-3/4" />
        <div className="grid grid-cols-2 gap-12">
           <div className="h-40 bg-slate-50 rounded-3xl" />
           <div className="h-40 bg-slate-50 rounded-3xl" />
        </div>
        <div className="space-y-6">
          <div className="h-4 bg-slate-50 rounded-lg w-full" />
          <div className="h-4 bg-slate-50 rounded-lg w-full" />
          <div className="h-4 bg-slate-50 rounded-lg w-full" />
          <div className="h-4 bg-slate-50 rounded-lg w-5/6" />
        </div>
        <div className="pt-20 grid grid-cols-2 gap-20">
           <div className="h-32 border-t-2 border-slate-200" />
           <div className="h-32 border-t-2 border-slate-200" />
        </div>
      </div>

      {/* الختم الديناميكي (Dynamic Seal) */}
      {mapping.defaultSealType !== 'none' && (
        <div 
          className="absolute border-2 border-primary rounded-3xl p-4 flex flex-col items-center justify-center shadow-lg bg-white/80 backdrop-blur-sm rotate-[-8deg] z-20 group"
          style={{ ...getPositionValue(mapping.sealPosition), width: '130px', height: '130px' }}
        >
          <div className="absolute inset-0 bg-primary/5 animate-pulse rounded-3xl" />
          <div className="text-[9px] font-black text-primary-dark mb-1 uppercase tracking-tighter">رسمي معتمد عصبيًا</div>
          <ShieldCheck className="w-12 h-12 text-primary opacity-20 absolute" />
          <img loading="lazy" src="https://picsum.photos/seed/seal/200/200" className="w-14 h-14 relative z-10 rounded-full border border-primary/20" referrerPolicy="no-referrer" alt="Seal" />
          <div className="text-[7px] font-mono font-black mt-2 text-slate-500">SN: AI-VERI-992-SEC</div>
          <div className="text-[5px] font-black text-primary mt-1">NEURAL INTEGRITY VERIFIED</div>
        </div>
      )}

      {/* التوقيع الديناميكي (Dynamic Signature) */}
      {mapping.defaultSignatureType !== 'none' && (
        <div 
          className="absolute p-4 flex flex-col items-center z-10"
          style={{ ...getPositionValue(mapping.signaturePosition), width: '180px' }}
        >
          <div className="text-[12px] font-black text-slate-400 mb-4 border-b border-slate-100 w-full text-center pb-2">توقيع المسؤول المعتمد</div>
          <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png" className="w-32 opacity-80 invert grayscale" referrerPolicy="no-referrer" alt="Signature" />
          {mapping.defaultSignatureType.includes('secure') && (
            <div className="mt-2 text-[10px] font-black text-primary flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-lg">
              <ShieldCheck className="w-3 h-3" /> SECURE DIGITAL SIGNATURE
            </div>
          )}
        </div>
      )}

      {/* نص التوثيق (Documentation Statement) */}
      {mapping.showDocumentationStatement && (
        <div className="absolute bottom-16 left-0 right-0 px-20">
          <div className="text-[11px] text-slate-400 font-bold border-t border-slate-100 pt-6 text-center leading-relaxed italic">
            "{mapping.statementTemplate.replace('{{serial}}', 'ABC-123-XYZ').replace('{{date}}', new Date().toLocaleDateString('ar-SA'))}"
          </div>
        </div>
      )}
    </div>
  );
};


// ==========================================
// 2. المكون الرئيسي (Main Component)
// ==========================================

export default function ElectronicDocumentation() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedDocType, setSelectedDocType] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [selectedSignatureType, setSelectedSignatureType] = useState('sig_and_stamp');
  const [selectedTemplateId, setSelectedTemplateId] = useState('default');
  const fileInputRef = useRef(null);

  // البيانات الوهمية لقوالب الأختام
  const [sealTemplates, setSealTemplates] = useState([
    {
      id: 'default',
      name: 'الختم الرسمي العام',
      stampImage: 'https://picsum.photos/seed/stamp1/200/200',
      serialPrefix: 'SEC-',
      backgroundText: 'توثيق إلكتروني معتمد',
      backgroundColor: '#f8fafc',
      backgroundOpacity: 0.6,
      serialPosition: 'inside',
      showTimestamp: true,
      securityHash: true,
      verificationCode: true,
      isDefault: true
    },
    {
      id: 'confidential',
      name: 'ختم الوثائق السرية',
      stampImage: 'https://picsum.photos/seed/stamp2/200/200',
      serialPrefix: 'CONF-',
      backgroundText: 'وثيقة سرية - يمنع التداول',
      backgroundColor: '#fef2f2',
      backgroundOpacity: 0.8,
      serialPosition: 'bottom',
      showTimestamp: true,
      securityHash: true,
      verificationCode: true,
      isDefault: false
    }
  ]);

  // البيانات الوهمية لقواعد الربط (Linkage)
  const [linkageMappings, setLinkageMappings] = useState([
    {
      docTypeId: 'dt-1',
      docTypeName: 'محضر اجتماع',
      defaultSignatureType: 'secure_and_manual',
      defaultSealType: 'office_stamp',
      signerRoles: ['مهندس المشروع', 'العميل'],
      showDocumentationStatement: true,
      signaturePosition: 'bottom_right',
      sealPosition: 'bottom_left',
      statementTemplate: 'تم توثيق هذا المحضر إلكترونياً بموجب نظام Remix بتاريخ {{date}}'
    },
    {
      docTypeId: 'dt-3',
      docTypeName: 'عقد مهني',
      defaultSignatureType: 'sig_and_stamp',
      defaultSealType: 'office_stamp',
      signerRoles: ['المدير التنفيذي', 'العميل'],
      showDocumentationStatement: true,
      signaturePosition: 'bottom_right',
      sealPosition: 'bottom_right',
      statementTemplate: 'عقد موثق رقم {{serial}} - النسخة الأصلية'
    },
    {
      docTypeId: 'dt-4',
      docTypeName: 'فاتورة ضريبية',
      defaultSignatureType: 'stamp_only',
      defaultSealType: 'verified_badge',
      signerRoles: ['المحاسب'],
      showDocumentationStatement: true,
      signaturePosition: 'bottom_left',
      sealPosition: 'bottom_left',
      statementTemplate: 'فاتورة ضريبية رسمية موثقة ومعتمدة'
    },
    {
      docTypeId: 'dt-5',
      docTypeName: 'تقرير فني',
      defaultSignatureType: 'secure_placeholder',
      defaultSealType: 'internal_stamp',
      signerRoles: ['المهندس المعتمد'],
      showDocumentationStatement: true,
      signaturePosition: 'bottom_right',
      sealPosition: 'top_right',
      statementTemplate: 'تقرير فني رقم {{serial}} معتمد داخلياً'
    }
  ]);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const handleSaveTemplate = () => {
    if (!editingTemplate?.name) return;
    
    if (editingTemplate.id) {
      setSealTemplates(sealTemplates.map(t => t.id === editingTemplate.id ? { ...t, ...editingTemplate } : t));
      toast.success('تم تحديث القالب بنجاح');
    } else {
      const newTemplate = {
        ...editingTemplate,
        id: `seal-${Date.now()}`,
        isDefault: false
      };
      setSealTemplates([...sealTemplates, newTemplate]);
      toast.success('تم إضافة القالب الجديد بنجاح');
    }
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  };

  // ملفات داخلية وهمية للاختيار منها في صفحة التوثيق الجديد
  const mockInternalDocs = {
    contract: [
      { id: 'CT-492', name: 'عقد تصميم فيلا الملقا', partyB: 'أحمد محمد' },
      { id: 'CT-501', name: 'عقد إشراف برج الياسمين', partyB: 'شركة عقارات' }
    ],
    quote: [
      { id: 'QT-102', name: 'عرض سعر فيلا حطين', partyB: 'سارة خالد' },
      { id: 'QT-105', name: 'عرض سعر مجمع تجاري', partyB: 'مجموعة الفوزان' }
    ],
    invoice: [
      { id: 'INV-882', name: 'فاتورة دفعة أولى - تصميم', partyB: 'أحمد محمد' },
      { id: 'INV-901', name: 'فاتورة إشراف شهري', partyB: 'شركة عقارات' }
    ]
  };

  // إعدادات النظام الوهمية
  const [docSettings, setDocSettings] = useState({
    defaultStamp: {
      enabled: true,
      type: 'secured',
      stampImage: 'https://picsum.photos/seed/stamp/200/200',
      serialPosition: 'inside',
      backgroundText: 'توثيق إلكتروني معتمد',
      backgroundColor: '#f8fafc',
      backgroundOpacity: 0.6,
      serialPrefix: 'SEC-',
      showTimestamp: true,
      securityHash: true,
      verificationCode: true
    },
    defaultSignature: {
      layout: 'horizontal',
      showTitles: true,
      showDates: true,
      showLocations: true,
      showCR: true,
      showEmails: false,
      showPhones: false,
      borderStyle: 'solid',
      borderColor: '#cbd5e1',
      padding: '20px',
      alignment: 'right'
    },
    autoDocumentContracts: true,
    autoDocumentInvoices: true,
    autoDocumentQuotes: false,
    verificationUrl: 'https://verify.remix-eng.com',
    defaultFolderName: 'Generated Documents'
  });

  // سجل المستندات الموثقة
  const [documentedItems, setDocumentedItems] = useState([
    {
      id: 'DOC-2024-001',
      name: 'عقد تصميم فيلا سكنية - الملقا',
      type: 'contract',
      partyB: 'أحمد محمد علي',
      timestamp: '2024-03-15T10:30:00Z',
      serial: 'SEC-20240315-452',
      status: 'verified',
      stampSettings: docSettings.defaultStamp
    },
    {
      id: 'DOC-2024-002',
      name: 'فاتورة خدمات هندسية #102',
      type: 'invoice',
      partyB: 'شركة التطوير العقاري',
      timestamp: '2024-03-12T14:20:00Z',
      serial: 'SEC-20240312-102',
      status: 'verified',
      stampSettings: docSettings.defaultStamp
    },
    {
      id: 'DOC-2024-003',
      name: 'ملف خارجي - مخططات معمارية',
      type: 'external',
      partyB: 'مكتب هندسي شريك',
      timestamp: '2024-03-10T09:15:00Z',
      serial: 'SEC-20240310-992',
      status: 'verified',
      stampSettings: docSettings.defaultStamp
    }
  ]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setActiveTab('new');
    }
  };

  const executeDocumentation = () => {
    if (!selectedFile && !selectedDocId) {
      toast.error('يرجى اختيار مستند أو رفع ملف أولاً');
      return;
    }
    
    setIsUploading(true);
    setTimeout(() => {
      const template = sealTemplates.find(t => t.id === selectedTemplateId) || sealTemplates[0];
      const docName = selectedFile ? selectedFile.name : mockInternalDocs[selectedDocType]?.find((d) => d.id === selectedDocId)?.name;
      const partyBName = selectedDocId ? mockInternalDocs[selectedDocType]?.find((d) => d.id === selectedDocId)?.partyB : 'عميل خارجي';

      const newItem = {
        id: `DOC-${Date.now()}`,
        name: docName,
        type: selectedDocType || 'external',
        partyB: partyBName,
        timestamp: new Date().toISOString(),
        serial: `${template.serialPrefix}${new Date().getFullYear()}${Math.floor(Math.random() * 1000000)}`,
        status: 'verified',
        stampSettings: {
          enabled: true,
          type: 'secured',
          stampImage: template.stampImage,
          serialPosition: template.serialPosition,
          backgroundText: template.backgroundText,
          backgroundColor: template.backgroundColor,
          backgroundOpacity: template.backgroundOpacity,
          serialPrefix: template.serialPrefix,
          showTimestamp: template.showTimestamp,
          securityHash: template.securityHash,
          verificationCode: template.verificationCode
        }
      };
      
      setDocumentedItems([newItem, ...documentedItems]);
      setIsUploading(false);
      setSelectedFile(null);
      setSelectedDocId('');
      setActiveTab('registry');
      toast.success('تم التوثيق الرقمي بنجاح وإصدار ملف الاعتماد');
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm shrink-0 z-10">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">نظام التوثيق الإلكتروني</h1>
            <p className="text-xs text-slate-500 font-bold">إدارة الأختام الرقمية والتوثيق الآمن للمستندات</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary-hover transition-all shadow-md active:scale-95"
          >
            <Upload className="w-4 h-4" /> توثيق ملف خارجي
          </button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-8 shrink-0 overflow-x-auto custom-scrollbar">
        {[
          { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
          { id: 'sign-now', label: 'مراجعة وتوقيع الان', icon: FileSignature },
          { id: 'registry', label: 'سجل التوثيق', icon: FileText },
          { id: 'new', label: 'توثيق جديد', icon: Plus },
          { id: 'templates', label: 'قوالب الأختام', icon: Palette },
          { id: 'linkage', label: 'ربط الأنواع (Linkage)', icon: Shield },
          { id: 'settings', label: 'إعدادات النظام', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center whitespace-nowrap gap-2 py-4 text-xs font-black transition-all border-b-2 ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        
        {/* ==================================
            نافذة إضافة/تعديل قالب الختم
        ================================== */}
        {isTemplateModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h3 className="text-lg font-black text-slate-800">{editingTemplate?.id ? 'تعديل قالب الختم' : 'إضافة قالب ختم جديد'}</h3>
                <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-2 gap-6">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-xs font-black text-slate-700">اسم القالب</label>
                  <input type="text" value={editingTemplate?.name || ''} onChange={e => setEditingTemplate({...editingTemplate, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="مثلاً: الختم الرسمي للمشاريع" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">رابط صورة الختم</label>
                  <input type="text" value={editingTemplate?.stampImage || ''} onChange={e => setEditingTemplate({...editingTemplate, stampImage: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="https://..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">بادئة السريال</label>
                  <input type="text" value={editingTemplate?.serialPrefix || ''} onChange={e => setEditingTemplate({...editingTemplate, serialPrefix: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="SEC-" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">نص الخلفية</label>
                  <input type="text" value={editingTemplate?.backgroundText || ''} onChange={e => setEditingTemplate({...editingTemplate, backgroundText: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20" placeholder="CONFIDENTIAL" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">لون الخلفية</label>
                  <input type="color" value={editingTemplate?.backgroundColor || '#f8fafc'} onChange={e => setEditingTemplate({...editingTemplate, backgroundColor: e.target.value})} className="w-full h-10 p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700">موقع السريال</label>
                  <select value={editingTemplate?.serialPosition || 'bottom'} onChange={e => setEditingTemplate({...editingTemplate, serialPosition: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none">
                    <option value="top">أعلى</option>
                    <option value="bottom">أسفل</option>
                    <option value="inside">داخل الختم</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 col-span-2 pt-4 border-t border-slate-100">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingTemplate?.showTimestamp} onChange={e => setEditingTemplate({...editingTemplate, showTimestamp: e.target.checked})} className="w-4 h-4 text-primary rounded border-slate-300" />
                    <span className="text-xs font-bold text-slate-700">إظهار الوقت</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingTemplate?.securityHash} onChange={e => setEditingTemplate({...editingTemplate, securityHash: e.target.checked})} className="w-4 h-4 text-primary rounded border-slate-300" />
                    <span className="text-xs font-bold text-slate-700">تشفير الهاش الأمني</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editingTemplate?.verificationCode} onChange={e => setEditingTemplate({...editingTemplate, verificationCode: e.target.checked})} className="w-4 h-4 text-primary rounded border-slate-300" />
                    <span className="text-xs font-bold text-slate-700">كود التحقق</span>
                  </label>
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={() => setIsTemplateModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-black text-sm hover:bg-slate-200 rounded-xl transition-colors">إلغاء</button>
                <button onClick={handleSaveTemplate} className="px-8 py-2.5 bg-primary text-white font-black text-sm rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all">حفظ القالب</button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================
            تبويب: ربط الأنواع (Linkage)
        ================================== */}
        {activeTab === 'linkage' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
                <div>
                   <h3 className="text-lg font-black text-slate-800">إدارة ربط التوثيق بأنواع المستندات</h3>
                   <p className="text-xs text-slate-500 font-bold mt-1">تحديد القواعد الافتراضية لكل نوع مستند لدعم التوليد الآلي</p>
                </div>
                <div className="flex gap-2 text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                   <Lock className="w-3 h-3" /> Programmer Logic Only
                </div>
             </div>

             <div className="grid grid-cols-1 gap-4">
                {linkageMappings.map(map => (
                  <div key={map.docTypeId} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-primary/40 transition-all p-6">
                     <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                           <div className="p-3 bg-slate-100 rounded-xl">
                              <FileText className="w-5 h-5 text-slate-600" />
                           </div>
                           <div>
                              <div className="text-sm font-black text-slate-800">{map.docTypeName}</div>
                              <div className="text-[10px] font-bold text-slate-400">ID: {map.docTypeId}</div>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <span className="px-2 py-1 bg-primary/5 text-primary text-[9px] font-black rounded border border-primary/10">التوقيع: {map.defaultSignatureType}</span>
                           <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[9px] font-black rounded border border-blue-100">الختم: {map.defaultSealType}</span>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1 flex items-center justify-center p-4 bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 relative">
                           <div className="h-64 overflow-hidden w-full flex items-center justify-center">
                              <DocumentationA4Preview mapping={map} />
                           </div>
                        </div>

                        <div className="md:col-span-1 space-y-2">
                           <label className="text-[10px] font-black text-slate-500">من يوقع (Roles)</label>
                           <div className="flex flex-wrap gap-1">
                              {map.signerRoles.map(role => (
                                <span key={role} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">{role}</span>
                              ))}
                           </div>
                           <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                              <label className="text-[10px] font-black text-slate-500">مواضع التوقيع والختم</label>
                              <div className="text-[10px] font-bold text-slate-800 flex flex-col gap-1">
                                 <span className="flex items-center gap-2 text-slate-600"><FileSignature className="w-3 h-3" /> Signature: {map.signaturePosition}</span>
                                 <span className="flex items-center gap-2 text-slate-600"><QrCode className="w-3 h-3" /> Seal: {map.sealPosition}</span>
                              </div>
                           </div>
                        </div>
                        <div className="md:col-span-2 space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-500">نص التوثيق التلقائي</label>
                              <p className="text-[10px] text-slate-700 font-bold leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 min-h-[60px] flex items-center">
                                 {map.statementTemplate}
                              </p>
                           </div>
                           <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                              <h5 className="text-[10px] font-black text-primary mb-2">حالة الربط التقني</h5>
                              <div className="text-[9px] text-slate-600 font-bold flex items-center gap-2 mb-1">
                                 <Check className="w-3 h-3 text-emerald-500" /> متاح للتوليد التلقائي عبر الـ Hook
                              </div>
                              <div className="text-[9px] text-slate-600 font-bold flex items-center gap-2">
                                 <Check className="w-3 h-3 text-emerald-500" /> يدعم التوثيق المتعدد (Multi-sig)
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                        <button className="px-5 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black hover:bg-slate-100 transition-colors">إعدادات متقدمة</button>
                        <button className="px-5 py-2 bg-primary text-white rounded-xl text-[10px] font-black hover:bg-primary-hover shadow-sm transition-all">تعديل التوثيق</button>
                     </div>
                  </div>
                ))}
             </div>

             <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary rounded-2xl">
                    <Zap className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black">تعميم نظام التوثيق (Verification Logic)</h4>
                    <p className="text-xs text-slate-400 font-bold mt-1">تعليمات المطورين لربط المحرك بملفات النظام</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <div className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                         <p className="text-[10px] leading-relaxed text-slate-300">
                           يجب على محرك الطباعة استدعاء <code>VerificationEngine.getSerial(docId)</code> قبل الرسم النهائي للملف.
                         </p>
                      </div>
                      <div className="flex items-start gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                         <p className="text-[10px] leading-relaxed text-slate-300">
                           يتم إسقاط الختم في إحداثيات (X, Y) المستمدة من <code>map.sealPosition</code> مع دعم خاص للأختام المتكررة (Watermarks).
                         </p>
                      </div>
                   </div>
                   <div className="bg-slate-800/50 p-4 rounded-2xl border border-white/5 space-y-4">
                      <h5 className="text-[11px] font-black text-primary">الحالات القادمة للتكامل</h5>
                      <ul className="space-y-2 text-[10px] text-slate-400 font-bold">
                         <li className="flex items-center gap-2"><Check className="w-3 h-3 text-slate-600" /> ربط بوابة نفاذ (IAM Integration) لإتمام التوقيع المؤمن.</li>
                         <li className="flex items-center gap-2"><Check className="w-3 h-3 text-slate-600" /> تطبيق تقنية LTV (Long Term Validation) لملفات الـ PDF الموقعة.</li>
                         <li className="flex items-center gap-2"><Check className="w-3 h-3 text-slate-600" /> توليد الـ ZATCA QR التلقائي للفواتير الموثقة.</li>
                      </ul>
                   </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/10">
                   <h5 className="text-sm font-black text-white mb-6">دليل البرمجة والتحقق (Programmer Manual)</h5>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                         <div className="flex items-center gap-3">
                            <Smartphone className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black">نظام التحقق بخطوتين (OTP/SMS)</span>
                         </div>
                         <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                           عند تفعيل "التوقيع المؤمن"، يجب استدعاء <code>OTP_Service.send(userPhone)</code> قبل منح صلاحية التوقيع. يتم تخزين بصمة المتصفح (Fingerprint) والـ IP مع سجل التوقيع لضمان عدم الإنكار (Non-Repudiation).
                         </p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-2xl space-y-4">
                         <div className="flex items-center gap-3">
                            <ExternalLink className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black">رابط التحقق العام (Verification URL)</span>
                         </div>
                         <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                           يجب أن يوجه الـ QR Code إلى <code>/verify/DOC_ID/HASH</code>. تقوم الصفحة بمطابقة الهاش في قاعدة البيانات وعرض بيانات الوثيقة (الطرفين، التاريخ، النوع) مع خيار تحميل النسخة الأصلية للتحقق من سلامة البكسلات (Image Integrity).
                         </p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* ==================================
            تبويب: مراجعة وتوقيع الان (Sign-now)
        ================================== */}
        {activeTab === 'sign-now' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                       <FileSignature className="w-5 h-5 text-primary" /> أوامر التوقيع المعلقة (Bulk Sign)
                    </h3>
                    <p className="text-xs font-bold text-slate-500 mt-1">تحديد مجموعة مستندات لتطبيق توقيعك المعتمد دفعة واحدة.</p>
                  </div>
                  <button 
                    onClick={() => {
                        if (selectedItems.length === 0) return toast.error('يرجى تحديد مستند واحد على الأقل للبدء');
                        toast.success(`تم إرسال طلب التوقيع الجماعي لـ ${selectedItems.length} مستند وتطبيق الختم بنجاح.`);
                        setSelectedItems([]);
                        setActiveTab('dashboard');
                    }}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                  >
                     <Zap className="w-4 h-4" /> توقيع المحددة ({selectedItems.length})
                  </button>
                </div>
                
                <div className="p-0 overflow-x-auto">
                   <table className="w-full text-right text-sm whitespace-nowrap">
                      <thead className="bg-slate-50 text-slate-500 text-xs shadow-sm border-b border-slate-200">
                         <tr>
                            <th className="p-4 w-12 text-center">
                               <input type="checkbox" onChange={(e) => {
                                  if (e.target.checked) {
                                     setSelectedItems(['mock-pen-1', 'mock-pen-2', 'mock-pen-3']);
                                  } else {
                                     setSelectedItems([]);
                                  }
                               }} checked={selectedItems.length === 3} className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" />
                            </th>
                            <th className="p-4 font-black">رقم المرجع (ID)</th>
                            <th className="p-4 font-black">اسم المستند</th>
                            <th className="p-4 font-black">الطرف الآخر (العميل)</th>
                            <th className="p-4 font-black">تاريخ الإنشاء</th>
                            <th className="p-4 font-black">الإجراءات</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                         {[
                            { id: 'mock-pen-1', type: 'عقد مهني', name: 'عقد تصميم فيلا السالم', client: 'عبدالله السالم', date: '2026-04-18', ref: 'CNT-2026-1049' },
                            { id: 'mock-pen-2', type: 'عرض سعر', name: 'تعديلات رخصة البناء', client: 'مؤسسة البناء الحديث', date: '2026-04-17', ref: 'QUT-2026-0881' },
                            { id: 'mock-pen-3', type: 'فاتورة ضريبية', name: 'دفعة أولى - مخططات تصميم', client: 'شركة الأفق المحدودة', date: '2026-04-16', ref: 'INV-2026-041' },
                         ].map((item) => (
                           <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-4 text-center">
                                 <input 
                                   type="checkbox" 
                                   checked={selectedItems.includes(item.id)}
                                   onChange={(e) => {
                                      if (e.target.checked) {
                                         setSelectedItems([...selectedItems, item.id]);
                                      } else {
                                         setSelectedItems(selectedItems.filter(i => i !== item.id));
                                      }
                                   }}
                                   className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary" 
                                 />
                              </td>
                              <td className="p-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs tracking-wider">{item.ref}</span>
                              </td>
                              <td className="p-4">
                                 <div className="flex items-center gap-3">
                                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                                       <FileSignature className="w-4 h-4" />
                                    </div>
                                    <div>
                                       <div className="text-sm font-black text-slate-900">{item.name}</div>
                                       <div className="text-[10px] text-slate-400">{item.type}</div>
                                    </div>
                                 </div>
                              </td>
                              <td className="p-4">{item.client}</td>
                              <td className="p-4">{item.date}</td>
                              <td className="p-4">
                                 <button className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg text-xs hover:bg-slate-50 hover:text-primary transition-all">مراجعة المستند</button>
                              </td>
                           </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        )}

        {/* ==================================
            تبويب: لوحة التحكم (Dashboard)
        ================================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'إجمالي العقود الموثقة', value: '1,284', icon: FileSignature, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'فواتير موثقة', value: '452', icon: Receipt, color: 'text-blue-600', bg: 'bg-blue-100' },
                { label: 'عروض أسعار موثقة', value: '312', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-100' },
                { label: 'ملفات خارجية', value: '86', icon: FileUp, color: 'text-amber-600', bg: 'bg-amber-100' }
              ].map((stat, i) => (
                <div key={i} className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-4`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <div className="text-2xl font-black text-slate-800">{stat.value}</div>
                  <div className="text-xs font-bold text-slate-500 mt-1">{stat.label}</div>
                </div>
              ))}
              {/* AI Badge */}
              <div className="col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-1 p-6 bg-indigo-600 rounded-3xl border border-indigo-500 shadow-xl shadow-indigo-200 text-white group overflow-hidden relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-black text-white">AI Integrity Scan</div>
                  <div className="text-[10px] font-bold text-indigo-100 mt-1 uppercase tracking-widest">Neural Accuracy: 99.9%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-black text-slate-800 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" /> آخر عمليات التوثيق
                  </h3>
                  <button onClick={() => setActiveTab('registry')} className="text-xs font-black text-primary hover:underline">عرض الكل</button>
                </div>
                <div className="divide-y divide-slate-50">
                  {documentedItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          item.type === 'contract' ? 'bg-primary/10 text-primary' :
                          item.type === 'invoice' ? 'bg-blue-50 text-blue-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                          {item.type === 'contract' ? <FileSignature className="w-4 h-4" /> :
                           item.type === 'invoice' ? <Receipt className="w-4 h-4" /> :
                           <FileUp className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-800">{item.name}</div>
                          <div className="text-[10px] font-bold text-slate-400">{item.partyB} • {new Date(item.timestamp).toLocaleString('ar-SA')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <code className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-600 font-mono">{item.serial}</code>
                        <div className="flex flex-col items-end">
                           <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                           <span className="text-[7px] font-black text-slate-400 mt-0.5 uppercase">Anchored @ Blockchain</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Status */}
              <div className="space-y-6">
                <div className="p-6 bg-slate-900 rounded-3xl text-white shadow-xl">
                  <h4 className="text-lg font-black flex items-center gap-2 mb-4">
                    <ShieldCheck className="w-6 h-6 text-primary" /> حالة الأمان الرقمي
                  </h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">تشفير البيانات</span>
                      <span className="text-primary font-black">نشط (AES-256)</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">سيرفر التوثيق</span>
                      <span className="text-primary font-black">متصل</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-bold">الأختام النشطة</span>
                      <span className="text-primary font-black">856 ختم</span>
                    </div>
                    <div className="pt-4 border-t border-slate-800">
                      <p className="text-[10px] text-slate-500 leading-relaxed">
                        يتم تأمين كافة المستندات الموثقة عبر نظام Remix Engineering بطابع زمني مشفر وسريال رقمي فريد مرتبط بقاعدة بيانات الشركة.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm">
                  <h4 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" /> التحقق السريع
                  </h4>
                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="أدخل السريال للتحقق..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button className="w-full py-2.5 bg-slate-800 text-white rounded-xl text-xs font-black hover:bg-slate-700 transition-colors">
                      تحقق من المستند
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================
            تبويب: سجل التوثيق (Registry)
        ================================== */}
        {activeTab === 'registry' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {selectedItems.length > 0 && (
              <div className="bg-slate-900 px-6 py-3 rounded-2xl text-white flex items-center justify-between animate-in slide-in-from-top-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-black">{selectedItems.length} مستند محدد</span>
                  <div className="h-4 w-px bg-slate-700" />
                  <button className="text-[10px] font-black hover:text-primary transition-colors">تحميل الكل (ZIP)</button>
                  <button className="text-[10px] font-black hover:text-primary transition-colors">إعادة توثيق جماعي</button>
                </div>
                <button onClick={() => setSelectedItems([])} className="text-[10px] font-black text-slate-400 hover:text-white transition-colors">إلغاء التحديد</button>
              </div>
            )}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="البحث في سجل التوثيق..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right whitespace-nowrap">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-4 w-10">
                         <input 
                           type="checkbox" 
                           onChange={(e) => {
                             if(e.target.checked) setSelectedItems(documentedItems.map(i => i.id));
                             else setSelectedItems([]);
                           }}
                           checked={selectedItems.length === documentedItems.length && documentedItems.length > 0}
                           className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                         />
                      </th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">المستند</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">النوع</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">التحقق</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الطرف الثاني</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">تاريخ التوثيق</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">السريال الرقمي</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الحالة</th>
                      <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documentedItems.map((item) => (
                      <tr key={item.id} className={`hover:bg-slate-50 transition-colors group ${selectedItems.includes(item.id) ? 'bg-primary/5' : ''}`}>
                        <td className="px-6 py-4">
                          <input 
                            type="checkbox" 
                            checked={selectedItems.includes(item.id)}
                            onChange={() => {
                              setSelectedItems(prev => 
                                prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                              );
                            }}
                            className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-slate-800">{item.name}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">{item.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            item.type === 'contract' ? 'bg-primary/10 text-primary' :
                            item.type === 'invoice' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {item.type === 'contract' ? 'عقد' : item.type === 'invoice' ? 'فاتورة' : 'ملف خارجي'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-black text-slate-700">{Math.floor(Math.random() * 50) + 12}</span>
                            <span className="text-[10px] font-bold text-slate-400">تحقق</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{item.partyB}</td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-600">{new Date(item.timestamp).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4">
                          <code className="px-2 py-1 bg-slate-100 rounded text-[10px] font-black text-slate-700 font-mono">{item.serial}</code>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-primary text-[10px] font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" /> موثق
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button className="p-2 text-slate-400 hover:text-primary transition-colors"><ExternalLink className="w-4 h-4" /></button>
                            <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors"><Download className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================
            تبويب: توثيق جديد (New)
        ================================== */}
        {activeTab === 'new' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
              <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-primary to-blue-700 text-white">
                <h3 className="text-2xl font-black flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8" /> معالج التوثيق والاعتماد الرقمي
                </h3>
                <p className="text-white/80 text-sm mt-2 font-medium">قم بتوثيق المستندات الداخلية أو الملفات الخارجية بسريال رقمي معتمد وختم مؤمن</p>
              </div>

              <div className="p-8 space-y-8">
                {/* اختيار ملف للموثوقية */}
                {!selectedFile && !selectedDocId ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button 
                        onClick={() => {
                          setSelectedDocType('external');
                          fileInputRef.current?.click();
                        }}
                        className="p-8 border-2 border-dashed border-slate-200 rounded-3xl hover:border-primary hover:bg-primary/5 transition-all group text-center space-y-4"
                      >
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <div className="text-lg font-black text-slate-800">رفع ملف خارجي</div>
                          <p className="text-xs text-slate-500 font-bold mt-1">PDF, JPG, PNG (حد أقصى 10MB)</p>
                        </div>
                      </button>

                      <div className="p-8 border-2 border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto">
                          <LinkIcon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-slate-800">ربط مستند من النظام</div>
                          <p className="text-xs text-slate-500 font-bold mt-1">عقود، فواتير، عروض أسعار</p>
                        </div>
                        <div className="space-y-3">
                          <select 
                            value={selectedDocType}
                            onChange={(e) => {
                                setSelectedDocType(e.target.value);
                                setSelectedDocId('');
                            }}
                            className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none"
                          >
                            <option value="">اختر نوع المستند...</option>
                            <option value="contract">عقد</option>
                            <option value="invoice">فاتورة</option>
                            <option value="quote">عرض سعر</option>
                          </select>
                          {selectedDocType && selectedDocType !== 'external' && (
                            <select 
                              value={selectedDocId}
                              onChange={(e) => setSelectedDocId(e.target.value)}
                              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none animate-in fade-in"
                            >
                              <option value="">اختر المستند المحدد...</option>
                              {mockInternalDocs[selectedDocType]?.map((doc) => (
                                <option key={doc.id} value={doc.id}>{doc.name} (#{doc.id})</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* إعدادات واعتماد الوثيقة */}
                    <div className="flex flex-col md:flex-row gap-8">
                      {/* معاينة مبدئية */}
                      <div className="flex-1 bg-slate-100 rounded-2xl aspect-[3/4] flex items-center justify-center border border-slate-200 relative overflow-hidden shadow-inner">
                        <div className="text-center space-y-2">
                          <FileText className="w-16 h-16 text-slate-300 mx-auto" />
                          <div className="text-xs font-black text-slate-400">
                            {selectedFile ? selectedFile.name : mockInternalDocs[selectedDocType]?.find((d) => d.id === selectedDocId)?.name}
                          </div>
                        </div>
                        
                        {/* Simulated Stamp Preview */}
                        {selectedTemplateId && (
                          <div 
                            className="absolute w-36 h-36 border-2 border-primary rounded-2xl p-3 flex flex-col items-center justify-center shadow-2xl animate-pulse"
                            style={{
                              backgroundColor: sealTemplates.find(t => t.id === selectedTemplateId)?.backgroundColor + 'CC',
                              bottom: '10%',
                              left: '10%',
                              transform: 'rotate(-10deg)'
                            }}
                          >
                            <div className="text-[9px] font-black text-primary-dark mb-1 text-center">
                              {sealTemplates.find(t => t.id === selectedTemplateId)?.backgroundText}
                            </div>
                            <img loading="lazy"
                              src={sealTemplates.find(t => t.id === selectedTemplateId)?.stampImage} 
                              alt="Stamp Preview" 
                              className="w-12 h-12 object-contain opacity-80"
                            />
                            <div className="text-[7px] font-mono text-slate-600 mt-2 font-black">
                              {sealTemplates.find(t => t.id === selectedTemplateId)?.serialPrefix}PREVIEW-000
                            </div>
                            <div className="text-[6px] font-mono text-primary mt-1">
                              HASH: {sealTemplates.find(t => t.id === selectedTemplateId)?.securityHash ? '8f3e2a1c9d0b...' : 'N/A'}
                            </div>
                          </div>
                        )}

                        {/* Simulated Signature Preview */}
                        {(selectedSignatureType === 'manual' || selectedSignatureType === 'sig_and_stamp' || selectedSignatureType === 'secure_and_manual') && (
                           <div className="absolute bottom-10 right-10 w-32 animate-in zoom-in-50">
                              <div className="text-[8px] font-black text-slate-400 mb-2">توقيع الطرف الأول:</div>
                              <img loading="lazy" src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png" className="w-24 opacity-60 invert grayscale" alt="Signature Placeholder" />
                              {selectedSignatureType.includes('secure') && (
                                 <div className="mt-1 flex items-center gap-1 text-[7px] text-primary font-black">
                                    <ShieldCheck className="w-2 h-2" /> موثق رقمياً
                                 </div>
                              )}
                           </div>
                        )}
                      </div>

                      {/* شريط الإعدادات */}
                      <div className="w-full md:w-80 space-y-6">
                        <div className="p-5 bg-primary/5 rounded-2xl border border-primary/10 space-y-6">
                          <h4 className="text-xs font-black text-primary-dark mb-3 flex items-center gap-2">
                            <Shield className="w-4 h-4" /> إعدادات الاعتماد الرقمي
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600">قالب الختم المستخدم</label>
                              <select 
                                value={selectedTemplateId}
                                onChange={(e) => setSelectedTemplateId(e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none"
                              >
                                {sealTemplates.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600">نوع التوقيع (Signature Mode)</label>
                              <select 
                                value={selectedSignatureType}
                                onChange={(e) => setSelectedSignatureType(e.target.value)}
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-black outline-none"
                              >
                                <option value="manual">توقيع يدوي فقط</option>
                                <option value="stamp_only">ختم فقط</option>
                                <option value="sig_and_stamp">توقيع + ختم</option>
                                <option value="secure_placeholder">توقيع مؤمن (رقمي)</option>
                                <option value="secure_and_manual">توقيع مؤمن + يدوي</option>
                                <option value="none">بدون توقيع</option>
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-600">اسم الطرف الثاني (للتوثيق)</label>
                              <input 
                                type="text" 
                                defaultValue={selectedDocId ? mockInternalDocs[selectedDocType]?.find((d) => d.id === selectedDocId)?.partyB : ''}
                                placeholder="اسم العميل أو الجهة" 
                                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none" 
                              />
                            </div>

                            <div className="space-y-3 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300" />
                                <span className="text-[10px] font-bold text-slate-700">تشفير الهاش الأمني (Security Hash)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300" />
                                <span className="text-[10px] font-bold text-slate-700">إضافة كود التحقق السريع (QR)</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" defaultChecked className="w-4 h-4 text-primary rounded border-slate-300" />
                                <span className="text-[10px] font-bold text-slate-700">تسطيح المستند (Flattening) لمنع التعديل</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button 
                            onClick={executeDocumentation}
                            disabled={isUploading}
                            className="w-full py-4 bg-primary text-white rounded-2xl text-sm font-black hover:bg-primary-hover transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                          >
                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            اعتماد وتوثيق المستند
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedFile(null);
                              setSelectedDocId('');
                            }}
                            className="w-full py-3 bg-white text-slate-600 border border-slate-200 rounded-2xl text-sm font-black hover:bg-slate-50 transition-all"
                          >
                            تغيير المستند
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ==================================
            تبويب: قوالب الأختام (Templates)
        ================================== */}
        {activeTab === 'templates' && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">قوالب الأختام الرقمية</h3>
                <p className="text-xs text-slate-500 font-bold">إدارة وتخصيص قوالب الأختام المؤمنة لمختلف أنواع الوثائق</p>
              </div>
              <button 
                onClick={() => {
                  setEditingTemplate({
                    name: '',
                    stampImage: 'https://picsum.photos/seed/stamp/200/200',
                    serialPrefix: 'SEC-',
                    backgroundText: 'ORIGINAL DOCUMENT',
                    backgroundColor: '#f8fafc',
                    backgroundOpacity: 0.6,
                    serialPosition: 'bottom',
                    showTimestamp: true,
                    securityHash: true,
                    verificationCode: true
                  });
                  setIsTemplateModalOpen(true);
                }}
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-primary-hover transition-all shadow-md"
              >
                <Plus className="w-4 h-4" /> إضافة قالب جديد
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sealTemplates.map(template => (
                <div key={template.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl transition-all">
                  <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Palette className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-black text-slate-800">{template.name}</span>
                    </div>
                    {template.isDefault && <span className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black rounded-full">افتراضي</span>}
                  </div>
                  
                  <div className="p-8 bg-slate-50 flex items-center justify-center relative overflow-hidden h-48">
                    <div 
                      className="w-32 h-32 border-2 border-primary rounded-2xl p-2 flex flex-col items-center justify-center shadow-xl rotate-[-5deg]"
                      style={{ backgroundColor: template.backgroundColor + 'CC' }}
                    >
                      <div className="text-[7px] font-black text-primary-dark mb-1 text-center">{template.backgroundText}</div>
                      <img loading="lazy" src={template.stampImage} alt="Stamp" className="w-10 h-10 object-contain" />
                      <div className="text-[6px] font-mono text-slate-600 mt-2 font-black">{template.serialPrefix}00000000</div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold">بادئة السريال</span>
                        <div className="text-slate-700 font-black">{template.serialPrefix}</div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-slate-400 font-bold">موقع السريال</span>
                        <div className="text-slate-700 font-black">{template.serialPosition === 'inside' ? 'داخل' : template.serialPosition === 'bottom' ? 'أسفل' : 'أعلى'}</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsTemplateModalOpen(true);
                        }}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black transition-colors"
                      >
                        تعديل القالب
                      </button>
                      {!template.isDefault && (
                        <button 
                          onClick={() => {
                            setSealTemplates(sealTemplates.map(t => ({
                              ...t,
                              isDefault: t.id === template.id
                            })));
                            toast.success('تم تعيين القالب كافتراضي');
                          }}
                          className="flex-1 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black transition-colors"
                        >
                          تعيين كافتراضي
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          if (template.isDefault) {
                            toast.error('لا يمكن حذف القالب الافتراضي');
                            return;
                          }
                          if (confirm('هل أنت متأكد من حذف هذا القالب؟')) {
                            setSealTemplates(sealTemplates.filter(t => t.id !== template.id));
                            toast.success('تم حذف القالب');
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================
            تبويب: الإعدادات (Settings)
        ================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* إعدادات الختم العامة */}
            <div className="bg-white rounded-[40px] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-black text-slate-800 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" /> إعدادات الختم المؤمن الافتراضية
                </h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-slate-400" /> صورة الختم الرسمية
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-2xl border border-slate-200 flex items-center justify-center overflow-hidden">
                      {docSettings.defaultStamp.stampImage ? (
                        <img loading="lazy" src={docSettings.defaultStamp.stampImage} alt="Stamp Default" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                      )}
                    </div>
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-black text-slate-700 transition-colors">تغيير الصورة</button>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <Type className="w-4 h-4 text-slate-400" /> نص الخلفية المؤمنة
                  </label>
                  <input 
                    type="text" 
                    value={docSettings.defaultStamp.backgroundText}
                    onChange={(e) => setDocSettings({...docSettings, defaultStamp: {...docSettings.defaultStamp, backgroundText: e.target.value}})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                      <Hash className="w-4 h-4 text-slate-400" /> بادئة السريال
                    </label>
                    <input 
                      type="text" 
                      value={docSettings.defaultStamp.serialPrefix}
                      onChange={(e) => setDocSettings({...docSettings, defaultStamp: {...docSettings.defaultStamp, serialPrefix: e.target.value}})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                      <MousePointer2 className="w-4 h-4 text-slate-400" /> موقع السريال
                    </label>
                    <select 
                      value={docSettings.defaultStamp.serialPosition}
                      onChange={(e) => setDocSettings({...docSettings, defaultStamp: {...docSettings.defaultStamp, serialPosition: e.target.value}})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    >
                      <option value="inside">داخل الختم</option>
                      <option value="top">أعلى الختم</option>
                      <option value="bottom">أسفل الختم</option>
                      <option value="around">حول الختم</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-slate-400" /> لون وشفافية الخلفية
                  </label>
                  <div className="flex items-center gap-4">
                    <input 
                      type="color" 
                      value={docSettings.defaultStamp.backgroundColor}
                      onChange={(e) => setDocSettings({...docSettings, defaultStamp: {...docSettings.defaultStamp, backgroundColor: e.target.value}})}
                      className="w-12 h-12 rounded-xl border-none cursor-pointer"
                    />
                    <input 
                      type="range" 
                      min="0" max="1" step="0.1"
                      value={docSettings.defaultStamp.backgroundOpacity}
                      onChange={(e) => setDocSettings({...docSettings, defaultStamp: {...docSettings.defaultStamp, backgroundOpacity: parseFloat(e.target.value)}})}
                      className="flex-1 accent-primary"
                    />
                    <span className="text-xs font-black text-slate-500">{Math.round(docSettings.defaultStamp.backgroundOpacity * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* الأمان والتكامل */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <Lock className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">إعدادات الأمان والتشفير</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700">خوارزمية التشفير</span>
                      <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100">AES-256-GCM</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-700">طول مفتاح الهاش</span>
                      <span className="text-[10px] font-black text-blue-600 bg-white px-2 py-1 rounded-lg border border-blue-100">512-bit</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black text-slate-500">مفتاح التوقيع الرقمي (Private Key)</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value="••••••••••••••••"
                        readOnly
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none"
                      />
                      <button className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 hover:underline">تغيير المفتاح</button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-slate-800">التحقق بخطوتين</p>
                      <p className="text-[10px] text-slate-400 font-bold">طلب تأكيد عند كل عملية ختم</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                    <Zap className="w-5 h-5" />
                  </div>
                  <h4 className="text-lg font-black text-slate-800">إعدادات الربط والتكامل</h4>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800">نظام العقود</p>
                        <p className="text-[10px] text-primary font-bold">متصل ومفعل</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-slate-400 hover:text-slate-600">إعدادات</button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-slate-400" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-slate-800">نظام الفواتير</p>
                        <p className="text-[10px] text-primary font-bold">متصل ومفعل</p>
                      </div>
                    </div>
                    <button className="text-[10px] font-black text-slate-400 hover:text-slate-600">إعدادات</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button 
                onClick={() => toast.success('تم حفظ جميع الإعدادات المتقدمة بنجاح.')}
                className="px-12 py-4 bg-slate-900 text-white rounded-[24px] text-sm font-black shadow-2xl shadow-slate-200 hover:bg-slate-800 transition-all transform hover:-translate-y-1"
              >
                حفظ جميع الإعدادات المتقدمة
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}