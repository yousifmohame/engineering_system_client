import React, { useState } from "react";
import { 
  Vault, 
  X, 
  Paperclip, 
  Eye, 
  Calendar, 
  Tag, 
  FileText, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
// (تأكد من عدد النقاط للوصول لمجلد utils في مشروعك)
import { getFullUrl } from "../../../../../utils/urlUtils"; 
import FileViewerModal from "../../../../FilesExplorer/modals/FileViewerModal";

const TransactionDetailsModal = ({ transaction, onClose }) => {
  const [viewerFile, setViewerFile] = useState(null);

  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(transaction.amount || 0);

  const isApprove = transaction.status === 'APPROVED';
  const isInbound = transaction.direction === 'INBOUND';

  // دالة لتحويل الرابط وتمريره للمودال
  const handleViewFile = (fileUrl) => {
    if (!fileUrl) return;

    // 💡 استخدام الدالة المركزية للحصول على الرابط الصحيح
    const fullUrl = getFullUrl(fileUrl);

    // استخراج اسم الملف والامتداد
    const fileName = fileUrl.split('/').pop() || "مستند_مرفق";
    const extension = fileName.split('.').pop().toLowerCase();

    // تحديد نوع الملف (لكي يتعرف عليه FileViewerModal)
    let fileCategory = "unknown";
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(extension)) {
      fileCategory = "image";
    } else if (extension === 'pdf') {
      fileCategory = "pdf";
    } else if (['doc', 'docx', 'xls', 'xlsx'].includes(extension)) {
      fileCategory = "document";
    }

    // بناء الكائن
    setViewerFile({
      url: fullUrl,
      path: fullUrl,
      name: fileName,            
      type: fileCategory,        
      extension: extension,      
      mimeType: `${fileCategory}/${extension === 'jpg' ? 'jpeg' : extension}` 
    });
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300" 
        dir="rtl" 
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all" 
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-slate-900 p-5 text-white flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <Vault className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-tight">تفاصيل القيد المالي</h3>
                <p className="text-slate-400 text-xs mt-0.5 font-mono">#{transaction.transactionNo}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="p-6 space-y-6">
            
            {/* مربع المبلغ */}
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-sm">
              <span className="text-slate-500 text-sm font-semibold">إجمالي المبلغ</span>
              <div className={`flex items-center gap-1.5 font-mono text-2xl font-black tracking-tight ${isInbound ? 'text-emerald-600' : 'text-rose-600'}`}>
                <span className="text-lg font-bold">{isInbound ? '+' : '-'}</span>
                {formattedAmount}
                <span className="text-sm font-bold text-slate-400 ml-1 uppercase">SAR</span>
              </div>
            </div>

            {/* تفاصيل البيانات */}
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> التصنيف
                </span>
                <p className="font-bold text-slate-800 text-sm">{transaction.transactionType}</p>
              </div>
              
              <div className="space-y-1.5">
                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" /> التاريخ
                </span>
                <p className="font-mono font-bold text-slate-800 text-sm">
                  {new Date(transaction.transactionDate).toLocaleDateString("en-GB")}
                </p>
              </div>

              <div className="col-span-2 space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5 mb-1">
                  <FileText className="w-3.5 h-3.5" /> البيان الوصفي
                </span>
                <p className="font-medium text-slate-700 text-sm leading-relaxed">
                  {transaction.description || "لا يوجد وصف تفصيلي."}
                </p>
              </div>

              <div className="col-span-2 space-y-2">
                <span className="text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                   الحالة الماليـة
                </span>
                <div className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border ${
                  isApprove 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}>
                  {isApprove ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  {isApprove ? 'مُعتمد ومُرحّل بنجاح في السجلات' : 'ملغى (تم عكس القيد ماليًا)'}
                </div>
              </div>
            </div>

            {/* قسم المرفقات */}
            {transaction.attachmentIds && transaction.attachmentIds.length > 0 && (
              <div className="pt-5 border-t border-slate-100">
                <span className="text-slate-800 text-sm font-bold flex items-center gap-2 mb-3">
                  <Paperclip className="w-4 h-4 text-slate-400" /> 
                  المرفقات الرقمية ({transaction.attachmentIds.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {transaction.attachmentIds.map((fileUrl, index) => (
                    <button 
                      key={index} 
                      onClick={() => handleViewFile(fileUrl)} 
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md rounded-xl transition-all group w-full text-right cursor-pointer"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-700 truncate" dir="ltr">
                          {fileUrl.split('/').pop()}
                        </span>
                      </div>
                      <Eye className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {viewerFile && (
        <FileViewerModal 
          file={viewerFile} 
          onClose={() => setViewerFile(null)} 
        />
      )}
    </>
  );
};

export default TransactionDetailsModal;