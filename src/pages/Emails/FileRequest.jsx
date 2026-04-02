import React, { useState } from 'react';
import {
  Link as LinkIcon,
  Inbox,
  Send,
  BarChart3,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Users,
  Search,
  X,
  UploadCloud,
  Settings,
  ShieldCheck,
  Share2,
  Copy,
  Bot,
  CheckCircle2,
  FolderInput
} from 'lucide-react';
import { toast } from 'sonner';

// ==========================================
// 💡 البيانات الوهمية (Mock Data)
// ==========================================
const MOCK_FILE_REQUESTS = [
  {
    id: 'REQ-001',
    requestNumber: 'FR-2026-0001',
    title: 'طلب وثائق المشروع السكني - حي النرجس',
    description: 'رخصة بناء + صك + هوية المالك',
    message: 'السادة الكرام، نرجو رفع المستندات المطلوبة',
    createdBy: 'أحمد محمد',
    createdAt: new Date('2026-04-02T10:00:00'),
    status: 'uploaded',
    sendMethod: 'email',
    sentTo: ['client@example.com'],
    sentAt: new Date('2026-04-02T10:05:00'),
    uniqueLink: 'https://files.company.sa/upload/abc123xyz',
    shortLink: 'https://fls.sa/r1a2b3',
    viewCount: 5,
    uploadCount: 3,
    lastViewedAt: new Date('2026-04-02T14:30:00'),
    expiresAt: new Date('2026-05-02T10:00:00'),
  }
];

const MOCK_RECEIVED_FILES = [
  {
    id: 'FILE-001',
    requestId: 'REQ-001',
    fileName: 'license-863883-1447.pdf',
    originalName: 'رخصة البناء رقم 863883.pdf',
    fileSize: 2458624,
    fileExtension: 'pdf',
    uploadedAt: new Date('2026-04-02T14:30:00'),
    senderName: 'عبدالله محمد الغامدي',
    senderEmail: 'client@example.com',
    senderPhone: '+966501234567',
    senderNotes: 'رخصة البناء الإلكترونية',
    aiAnalysis: {
      category: 'building-license',
      categoryConfidence: 0.96,
      suggestedTransaction: {
        transactionId: 'TRX-2026-001',
        transactionNumber: '2026/001',
        ownerName: 'عبدالله محمد الغامدي',
        matchPercentage: 95,
        matchReasons: ['رقم الرخصة متطابق', 'اسم المالك متطابق']
      },
      fileQuality: 'excellent',
      isComplete: true
    },
    isProcessed: false
  }
];

// ==========================================
// 💡 المكونات الداخلية المدمجة (Inline Components)
// ==========================================

// 1. نافذة إنشاء طلب جديد (File Request Generator)
const InlineFileRequestGenerator = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 z-[100] flex items-center justify-center backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden animate-in zoom-in-95 max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <LinkIcon size={18} className="text-emerald-600" /> إنشاء رابط طلب وثائق جديد
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto flex flex-col gap-5 bg-slate-50/50">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText size={16} className="text-blue-500"/> تفاصيل الطلب</h4>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">عنوان الطلب</label>
                <input type="text" placeholder="مثال: طلب مستندات المعاملة رقم 1024" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">الوثائق المطلوبة (وصف)</label>
                <textarea placeholder="يرجى إرفاق الهوية الوطنية ورخصة البناء..." className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500 h-20 resize-none" />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings size={16} className="text-amber-500"/> إعدادات الرفع</h4>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">أقصى حجم للملف (MB)</label>
                  <input type="number" defaultValue={10} className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">تاريخ انتهاء الرابط</label>
                  <input type="date" className="w-full p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500" />
               </div>
            </div>
            <div className="flex gap-4 mt-4 text-sm font-medium text-slate-700">
               <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-emerald-600 w-4 h-4" /> طلب اسم المرسل</label>
               <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked className="accent-emerald-600 w-4 h-4" /> طلب رقم الجوال</label>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Share2 size={16} className="text-purple-500"/> خيارات الإرسال (اختياري)</h4>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">البريد الإلكتروني للعميل</label>
              <input type="email" placeholder="client@example.com" className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-emerald-500" />
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">إلغاء</button>
          <button onClick={() => { toast.success('تم توليد الرابط بنجاح'); onSave(); onClose(); }} className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-md flex items-center gap-2">
            <LinkIcon size={16} /> توليد وإرسال الرابط
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. إدارة الملفات المستلمة (Received Files Manager)
const InlineReceivedFilesManager = ({ files, onMoveToTransaction, onPreview }) => {
  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Inbox className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-sm font-bold">لا توجد ملفات مستلمة حالياً</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-slate-50/50">
      <div className="space-y-4">
        {files.map(file => (
          <div key={file.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                   <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold uppercase shrink-0 border border-blue-100 shadow-sm">
                      {file.fileExtension}
                   </div>
                   <div>
                      <h3 className="text-base font-bold text-slate-900 mb-1">{file.originalName}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                         <span className="flex items-center gap-1"><Clock size={12} /> {file.uploadedAt.toLocaleString('ar-SA')}</span>
                         <span className="flex items-center gap-1"><HardDrive size={12} /> {formatFileSize(file.fileSize)}</span>
                         <span className="flex items-center gap-1"><User size={12} /> المرسل: {file.senderName}</span>
                      </div>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => onPreview(file)} className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-1.5">
                      <Eye size={14} /> معاينة
                   </button>
                   <button onClick={() => onMoveToTransaction(file.id, file.aiAnalysis?.suggestedTransaction?.transactionId)} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5">
                      <FolderInput size={14} /> حفظ في المعاملة
                   </button>
                </div>
             </div>

             {/* تحليل الذكاء الاصطناعي للملف المستلم */}
             {file.aiAnalysis && (
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl">
                   <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
                      <Bot size={18} /> تحليل النظام الذكي للملف (ثقة {file.aiAnalysis.categoryConfidence * 100}%)
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                         <span className="block text-slate-500 mb-1">نوع المستند</span>
                         <strong className="text-slate-800">{file.aiAnalysis.category === 'building-license' ? 'رخصة بناء' : 'أخرى'}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                         <span className="block text-slate-500 mb-1">المعاملة المقترحة</span>
                         <strong className="text-blue-600 block">{file.aiAnalysis.suggestedTransaction.transactionNumber}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm">
                         <span className="block text-slate-500 mb-1">اسم المالك</span>
                         <strong className="text-slate-800 truncate block">{file.aiAnalysis.suggestedTransaction.ownerName}</strong>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-100 shadow-sm bg-emerald-600 text-white flex flex-col justify-center items-center text-center">
                         <span className="block opacity-90 mb-0.5">نسبة المطابقة</span>
                         <strong className="text-lg leading-none">{file.aiAnalysis.suggestedTransaction.matchPercentage}%</strong>
                      </div>
                   </div>
                   <div className="mt-3 flex gap-2 flex-wrap">
                      {file.aiAnalysis.suggestedTransaction.matchReasons.map((reason, idx) => (
                         <span key={idx} className="bg-white/60 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> {reason}
                         </span>
                      ))}
                   </div>
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
};


// ==========================================
// 💡 المكون الرئيسي للصفحة (Main Screen)
// ==========================================
export default function FileRequest() {
  const [currentView, setCurrentView] = useState('requests'); // requests | received | stats
  const [fileRequests, setFileRequests] = useState(MOCK_FILE_REQUESTS);
  const [receivedFiles, setReceivedFiles] = useState(MOCK_RECEIVED_FILES);
  const [showGenerator, setShowGenerator] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const stats = {
    totalRequests: fileRequests.length,
    activeRequests: fileRequests.filter(r => r.status === 'sent' || r.status === 'viewed').length,
    completedRequests: fileRequests.filter(r => r.status === 'completed').length,
    expiredRequests: fileRequests.filter(r => r.status === 'expired').length,
    totalFilesReceived: receivedFiles.length,
    totalFileSize: receivedFiles.reduce((sum, f) => sum + f.fileSize, 0),
  };

  const handleSaveRequest = () => {
    // محاكاة حفظ طلب جديد
    const newReq = {
      ...MOCK_FILE_REQUESTS[0],
      id: `REQ-${Date.now()}`,
      requestNumber: `FR-2026-${Math.floor(Math.random()*1000)}`,
      createdAt: new Date(),
      status: 'sent',
      uploadCount: 0,
      viewCount: 0
    };
    setFileRequests([newReq, ...fileRequests]);
  };

  const handleMoveToTransaction = (fileId, transactionId) => {
    setReceivedFiles(receivedFiles.map(file =>
      file.id === fileId ? { ...file, isProcessed: true } : file
    ));
    toast.success('تم حفظ الملف في المعاملة بنجاح');
  };

  const handlePreviewFile = (file) => {
    toast.info('جاري تحميل المعاينة للملف: ' + file.originalName);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status) => {
    const configs = {
      draft: { label: 'مسودة', color: 'bg-gray-100 text-gray-700 border-gray-300', icon: FileText },
      sent: { label: 'تم الإرسال', color: 'bg-blue-100 text-blue-700 border-blue-300', icon: Send },
      viewed: { label: 'تم الاطلاع', color: 'bg-purple-100 text-purple-700 border-purple-300', icon: Eye },
      uploaded: { label: 'تم الرفع', color: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle },
      completed: { label: 'مكتمل', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', icon: CheckCircle },
      expired: { label: 'منتهي', color: 'bg-red-100 text-red-700 border-red-300', icon: AlertCircle }
    };
    return configs[status] || configs.draft;
  };

  const filteredRequests = fileRequests.filter(req => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.title.toLowerCase().includes(query) ||
      req.requestNumber.toLowerCase().includes(query) ||
      req.description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex flex-col h-full bg-white font-[Tajawal]" dir="rtl">
      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-gradient-to-l from-emerald-600 to-emerald-700 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg shadow-sm">
              <LinkIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">مركز طلب وإرسال الوثائق</h1>
              <p className="text-sm text-emerald-100 mt-0.5">توليد روابط احترافية واستقبال الملفات وتوجيهها بذكاء صناعي</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowGenerator(true)} className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 text-sm font-bold rounded-lg hover:bg-emerald-50 transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> إنشاء رابط طلب جديد
            </button>
            <span className="px-3 py-1.5 bg-white/20 text-white text-sm font-bold rounded-full border border-emerald-500/30">092</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="flex-shrink-0 bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {currentView === 'requests' && (
            <div className="flex-1 w-full relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="ابحث برقم أو عنوان الطلب..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-emerald-500 shadow-sm"
              />
            </div>
          )}

          <div className="flex items-center bg-white border border-slate-300 rounded-lg overflow-hidden shadow-sm w-full md:w-auto">
            <button onClick={() => setCurrentView('requests')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold transition-colors ${currentView === 'requests' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Send className="w-4 h-4" /> الروابط المرسلة
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentView === 'requests' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>{fileRequests.length}</span>
            </button>
            <button onClick={() => setCurrentView('received')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold border-r border-slate-300 transition-colors ${currentView === 'received' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
              <Inbox className="w-4 h-4" /> الملفات المستلمة
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${currentView === 'received' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-600'}`}>{receivedFiles.filter(f => !f.isProcessed).length} جديدة</span>
            </button>
            <button onClick={() => setCurrentView('stats')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-bold border-r border-slate-300 transition-colors ${currentView === 'stats' ? 'bg-emerald-600 text-white' : 'text-slate-700 hover:bg-slate-50'}`}>
              <BarChart3 className="w-4 h-4" /> الإحصائيات
            </button>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      <div className="flex-1 overflow-hidden bg-slate-50/30">
        
        {/* 1. Requests View */}
        {currentView === 'requests' && (
          <div className="h-full overflow-y-auto p-6 custom-scrollbar">
            {filteredRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <LinkIcon className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-sm font-bold">لا توجد طلبات تطابق بحثك</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRequests.map(req => {
                  const statusBadge = getStatusBadge(req.status);
                  const StatusIcon = statusBadge.icon;
                  
                  return (
                    <div key={req.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-sm font-bold text-slate-900 mb-1.5 leading-tight">{req.title}</h3>
                          <p className="text-xs text-slate-500 mb-3 line-clamp-1">{req.description}</p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium bg-slate-50 w-fit px-2 py-1 rounded border border-slate-100">
                            <span className="font-bold text-emerald-700 font-mono">{req.requestNumber}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock size={10}/> {req.createdAt.toLocaleDateString('ar-SA')}</span>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold shrink-0 ${statusBadge.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" /> {statusBadge.label}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-slate-50 border border-slate-100 rounded-xl mt-auto">
                        <div className="text-center border-l border-slate-200">
                          <div className="text-lg font-black text-slate-700">{req.viewCount}</div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">زيارة للرابط</div>
                        </div>
                        <div className="text-center border-l border-slate-200">
                          <div className="text-lg font-black text-emerald-600">{req.uploadCount}</div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">ملف مرفوع</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-black text-blue-600">{req.sentTo.length}</div>
                          <div className="text-[10px] font-bold text-slate-500 mt-0.5">مستلم (إيميل)</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button onClick={() => { navigator.clipboard.writeText(req.uniqueLink); toast.success('تم نسخ الرابط السري'); }} className="flex-1 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5">
                          <Copy size={14} /> نسخ الرابط
                        </button>
                        <button className="px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5">
                          <Eye size={14} /> التفاصيل
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 2. Received Files View */}
        {currentView === 'received' && (
          <InlineReceivedFilesManager
            files={receivedFiles}
            onMoveToTransaction={handleMoveToTransaction}
            onPreview={handlePreviewFile}
          />
        )}

        {/* 3. Stats View */}
        {currentView === 'stats' && (
          <div className="h-full overflow-y-auto p-6 bg-slate-50/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden group">
                <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Send size={100} /></div>
                <div className="flex flex-col relative z-10">
                  <span className="text-sm font-bold text-slate-500 mb-1">إجمالي الروابط المولدة</span>
                  <span className="text-3xl font-black text-blue-600">{stats.totalRequests}</span>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden group">
                <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><Clock size={100} /></div>
                <div className="flex flex-col relative z-10">
                  <span className="text-sm font-bold text-slate-500 mb-1">الروابط النشطة</span>
                  <span className="text-3xl font-black text-emerald-600">{stats.activeRequests}</span>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden group">
                <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><FileText size={100} /></div>
                <div className="flex flex-col relative z-10">
                  <span className="text-sm font-bold text-slate-500 mb-1">الملفات المستلمة</span>
                  <span className="text-3xl font-black text-purple-600">{stats.totalFilesReceived}</span>
                </div>
              </div>
              <div className="p-5 bg-white border border-slate-200 shadow-sm rounded-xl relative overflow-hidden group">
                <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform"><HardDrive size={100} /></div>
                <div className="flex flex-col relative z-10">
                  <span className="text-sm font-bold text-slate-500 mb-1">إجمالي الحجم</span>
                  <span className="text-3xl font-black text-orange-600" dir="ltr">{formatFileSize(stats.totalFileSize)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center py-20">
               <BarChart3 size={64} className="mx-auto text-slate-300 mb-4" />
               <h3 className="text-lg font-bold text-slate-700">مخططات الإحصائيات قيد التطوير</h3>
               <p className="text-sm text-slate-500 mt-2">قريباً سيتم عرض رسوم بيانية توضح معدل استجابة العملاء ومعدل دقة الذكاء الاصطناعي.</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Inline Modals ── */}
      <InlineFileRequestGenerator
        isOpen={showGenerator}
        onClose={() => setShowGenerator(false)}
        onSave={handleSaveRequest}
      />
    </div>
  );
}