import React from 'react';
import { ShieldCheck, X , QrCode} from 'lucide-react';

export const DocumentationA4Preview = ({ mapping }) => {
  // دالة لتحديد موقع الختم والتوقيع
  const getPositionValue = (pos) => {
    switch (pos) {
      case 'top_right': return { top: '40px', right: '40px' };
      case 'top_left': return { top: '40px', left: '40px' };
      case 'bottom_right': return { bottom: '120px', right: '40px' };
      case 'bottom_left': return { bottom: '120px', left: '40px' };
      case 'center': return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
      default: return { bottom: '120px', right: '40px' };
    }
  };

  // 1. تصميم خلفية الورقة الأمنية (تشبه شهادة الميلاد)
  const securityPaperStyle = {
    backgroundColor: '#fafafa',
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 60%),
      repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.15) 0px, rgba(148, 163, 184, 0.15) 1px, transparent 1px, transparent 12px),
      repeating-linear-gradient(-45deg, rgba(148, 163, 184, 0.15) 0px, rgba(148, 163, 184, 0.15) 1px, transparent 1px, transparent 12px)
    `,
    backgroundSize: '100% 100%, 24px 24px, 24px 24px'
  };

  // 2. تصميم خلفية الختم الأمنية المتداخلة (Guilloche Pattern)
  const sealSecurityBackground = {
    backgroundImage: `repeating-radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08) 0, transparent 2px, rgba(37, 99, 235, 0.04) 3px, transparent 5px)`
  };

  return (
    <div 
      className="w-[210mm] min-h-[297mm] shadow-2xl relative mx-auto overflow-hidden scale-[0.25] origin-top border border-slate-300 mt-[-200px] mb-[-400px] select-none"
      style={securityPaperStyle}
    >
      {/* علامة مائية مركزية (Watermark) - لا يمكن تحديدها */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03] overflow-hidden">
        <div className="text-[150px] font-black text-slate-900 -rotate-45 whitespace-nowrap tracking-widest">
          SECURE DOCUMENT
        </div>
      </div>

      {/* شريط أمني جانبي (Security Thread) */}
      <div className="absolute top-0 bottom-0 left-4 w-1.5 bg-gradient-to-b from-blue-200 via-slate-300 to-blue-200 opacity-50 border-x border-white mix-blend-multiply" />

      {/* المحتوى الوهمي للمستند */}
      <div className="p-16 space-y-10 relative z-10">
        <div className="flex justify-between items-start border-b-2 border-slate-300 pb-8">
           <div className="space-y-4 w-1/2">
              <div className="h-6 bg-slate-200/80 rounded w-3/4" />
              <div className="h-4 bg-slate-200/80 rounded w-1/2" />
           </div>
           <div className="w-24 h-24 bg-slate-200/50 rounded-xl" />
        </div>
        
        <div className="h-10 bg-slate-200/80 rounded-xl w-1/3 mx-auto" />
        
        <div className="space-y-6 pt-8">
          <div className="h-4 bg-slate-200/80 rounded w-full" />
          <div className="h-4 bg-slate-200/80 rounded w-full" />
          <div className="h-4 bg-slate-200/80 rounded w-full" />
          <div className="h-4 bg-slate-200/80 rounded w-5/6" />
        </div>

        <div className="grid grid-cols-2 gap-12 pt-8">
          <div className="h-32 bg-slate-200/50 rounded-3xl border border-slate-300/50" />
          <div className="h-32 bg-slate-200/50 rounded-3xl border border-slate-300/50" />
        </div>
      </div>

      {/* ==========================================
          الختم الأمني المعقد (Advanced Secure Seal)
          ========================================== */}
      {mapping.defaultSealType !== 'none' && (
        <div
          className="absolute flex flex-col items-center justify-center z-20 group"
          style={{ ...getPositionValue(mapping.sealPosition), width: '160px', height: '160px' }}
        >
          {/* دائرة الختم الخارجية ذات النقش المعقد */}
          <div 
            className="absolute inset-0 rounded-full border-[3px] border-blue-600/30 flex items-center justify-center mix-blend-multiply p-1"
            style={sealSecurityBackground}
          >
            {/* دائرة داخلية متموجة (تأثير بصري للختم) */}
            <div className="w-full h-full rounded-full border-[1px] border-dashed border-blue-800/40 flex items-center justify-center bg-blue-50/40 backdrop-blur-[1px]">
               
               {/* شعار أو أيقونة الختم (مدمجة لونيًا لمنع القص) */}
               <img 
                 loading="lazy" 
                 src="https://picsum.photos/seed/seal/200/200" 
                 alt="Seal" 
                 className="w-16 h-16 rounded-full mix-blend-multiply opacity-90 object-cover" 
               />
            </div>
          </div>

          {/* نصوص الختم العلوية والسفلية (دائرية تقريباً) */}
          <div className="absolute top-3 text-[7px] font-black text-blue-900/80 uppercase tracking-widest mix-blend-multiply">
            رسمي وموثق
          </div>
          <div className="absolute bottom-3 text-[6px] font-black text-blue-800/70 uppercase tracking-widest mix-blend-multiply">
            VALIDATED SYSTEM
          </div>

          {/* درع الأمان بالخلفية */}
          <ShieldCheck className="w-20 h-20 text-blue-600 absolute opacity-[0.08] mix-blend-multiply pointer-events-none" />

          {/* السريال الخاص بالختم (يُطبع فوق النقش ويُدمج معه) */}
          <div className="absolute -bottom-8 bg-white/80 border border-blue-200 px-2 py-0.5 rounded shadow-sm mix-blend-multiply text-center">
            <div className="text-[6px] font-mono font-black text-slate-800">SN: {mapping.docTypeId.toUpperCase()}-9928-11</div>
            <div className="text-[4px] font-black text-emerald-600">NEURAL HASH VERIFIED</div>
          </div>
        </div>
      )}

      {/* ==========================================
          التوقيع المدمج (Integrated Signature)
          ========================================== */}
      {mapping.defaultSignatureType !== 'none' && (
        <div className="absolute p-4 flex flex-col items-center z-10" style={{ ...getPositionValue(mapping.signaturePosition), width: '180px' }}>
          <div className="text-[10px] font-black text-slate-500 mb-2 border-b border-slate-300 border-dashed w-full text-center pb-2">
            توقيع المسؤول المعتمد
          </div>
          {/* استخدام mix-blend-multiply يجعل التوقيع الأسود يتفاعل مع خطوط الورقة الخلفية (مثل الحبر الحقيقي) */}
          <img 
            loading="lazy" 
            src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png" 
            className="w-32 opacity-80 invert grayscale mix-blend-multiply -rotate-6" 
            alt="Signature" 
          />
          {mapping.defaultSignatureType.includes('secure') && (
            <div className="mt-4 text-[7px] font-black text-blue-700 flex items-center gap-1 bg-blue-50/80 px-2 py-1 rounded border border-blue-100 mix-blend-multiply">
              <ShieldCheck className="w-2.5 h-2.5" /> SECURE DIGITAL SIGNATURE
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          تذييل الوثيقة الأمني (Security Footer & Microprint)
          ========================================== */}
      <div className="absolute bottom-8 left-12 right-12 flex justify-between items-end border-t border-slate-300 pt-4 mix-blend-multiply">
         {/* QR Code للمصادقة */}
         <div className="flex gap-3 items-center">
            <div className="p-1 bg-white border border-slate-300">
               <QrCode className="w-12 h-12 text-slate-800" />
            </div>
            <div className="space-y-1 text-right">
               <div className="text-[8px] font-black text-slate-800">امسح الرمز للتحقق من صحة الوثيقة</div>
               <div className="text-[6px] font-mono text-slate-500">https://verify.system.com/doc/9928</div>
            </div>
         </div>

         {/* نص التوثيق */}
         {mapping.showDocumentationStatement && (
            <div className="text-[8px] text-slate-600 font-bold text-left max-w-[200px] leading-relaxed">
              {mapping.statementTemplate.replace('{{serial}}', 'SEC-9928-11').replace('{{date}}', new Date().toLocaleDateString('ar-SA'))}
            </div>
         )}
      </div>

      {/* سطر Micro-printing في أسفل الورقة (لا يُرى بالعين المجردة بسهولة وتتشوه عند التصوير) */}
      <div className="absolute bottom-2 left-0 right-0 overflow-hidden opacity-30">
         <p className="text-[3px] font-mono text-slate-500 whitespace-nowrap tracking-tighter">
            {Array(50).fill("REMIX-ENGINEERING-SECURE-DOCUMENT-AUTHENTIC-RECORD").join(" · ")}
         </p>
      </div>
    </div>
  );
};

export const TemplateModal = ({ editingTemplate, setEditingTemplate, setIsTemplateModalOpen, handleSaveTemplate }) => {
  if (!editingTemplate) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-black text-slate-800">
            {editingTemplate.id ? 'تعديل قالب الختم' : 'إضافة قالب ختم جديد'}
          </h3>
          <button onClick={() => setIsTemplateModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Modal Body / Form Fields */}
        <div className="p-8 grid grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-black text-slate-700">اسم القالب</label>
            <input 
              type="text" 
              value={editingTemplate.name || ''} 
              onChange={e => setEditingTemplate({ ...editingTemplate, name: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
              placeholder="مثلاً: الختم الرسمي للمشاريع" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">رابط صورة الختم (URL)</label>
            <input 
              type="text" 
              value={editingTemplate.stampImage || ''} 
              onChange={e => setEditingTemplate({ ...editingTemplate, stampImage: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
              placeholder="https://..." 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">بادئة السريال</label>
            <input 
              type="text" 
              value={editingTemplate.serialPrefix || ''} 
              onChange={e => setEditingTemplate({ ...editingTemplate, serialPrefix: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
              placeholder="مثال: SEC-" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">نص الخلفية للختم</label>
            <input 
              type="text" 
              value={editingTemplate.backgroundText || ''} 
              onChange={e => setEditingTemplate({ ...editingTemplate, backgroundText: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
              placeholder="مثال: وثيقة رسمية" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">لون خلفية الختم</label>
            <input 
              type="color" 
              value={editingTemplate.backgroundColor || '#eff6ff'} 
              onChange={e => setEditingTemplate({ ...editingTemplate, backgroundColor: e.target.value })} 
              className="w-full h-[42px] p-1 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">موقع السريال الرقمي</label>
            <select 
              value={editingTemplate.serialPosition || 'bottom'} 
              onChange={e => setEditingTemplate({ ...editingTemplate, serialPosition: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
            >
              <option value="top">أعلى الختم</option>
              <option value="bottom">أسفل الختم</option>
              <option value="inside">داخل الختم</option>
              <option value="around">حول الختم بشكل دائري</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700">شفافية الخلفية</label>
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="1" 
              value={editingTemplate.backgroundOpacity ?? 0.6} 
              onChange={e => setEditingTemplate({ ...editingTemplate, backgroundOpacity: e.target.value })} 
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" 
              placeholder="0.6" 
            />
          </div>

          {/* خيارات الأمان والإظهار */}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-4 col-span-2 pt-5 border-t border-slate-100">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={editingTemplate.showTimestamp ?? true} 
                onChange={e => setEditingTemplate({ ...editingTemplate, showTimestamp: e.target.checked })} 
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer" 
              />
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">إظهار الوقت والتاريخ</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={editingTemplate.securityHash ?? true} 
                onChange={e => setEditingTemplate({ ...editingTemplate, securityHash: e.target.checked })} 
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer" 
              />
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">إظهار الهاش الأمني (SHA-256)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={editingTemplate.verificationCode ?? true} 
                onChange={e => setEditingTemplate({ ...editingTemplate, verificationCode: e.target.checked })} 
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600 cursor-pointer" 
              />
              <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">تضمين كود التحقق السريع</span>
            </label>
          </div>

        </div>

        {/* Modal Footer / Actions */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={() => setIsTemplateModalOpen(false)} 
            className="px-6 py-2.5 text-slate-600 font-black text-sm hover:bg-slate-200 rounded-xl transition-colors"
          >
            إلغاء
          </button>
          <button 
            onClick={handleSaveTemplate} 
            className="px-8 py-2.5 bg-blue-600 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-95 transition-all"
          >
            حفظ القالب
          </button>
        </div>

      </div>
    </div>
  );
};