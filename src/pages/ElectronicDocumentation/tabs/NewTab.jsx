import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Upload,
  Link as LinkIcon,
  FileText,
  Loader2,
  Shield,
  QrCode,
  FileImage,
  Eye
} from "lucide-react";

export const NewDocumentationTab = ({
  selectedFile,
  setSelectedFile,
  selectedDocType,
  setSelectedDocType,
  selectedDocId,
  setSelectedDocId,
  selectedSignatureType,
  setSelectedSignatureType,
  selectedTemplateId,
  setSelectedTemplateId,
  sealTemplates,
  isUploading,
  executeDocumentation,
  mockInternalDocs,
}) => {
  // حالة محلية لعرض معاينة الصورة المرفوعة
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);

  // دالة مستقلة تماماً لرفع الملفات داخل هذه الشاشة لضمان عمل الزر 100%
  const handleLocalFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedDocType("EXTERNAL");
      setSelectedDocId("");
      
      // إذا كان الملف صورة، قم بإنشاء رابط معاينة له
      if (file.type.startsWith("image/")) {
        setFilePreviewUrl(URL.createObjectURL(file));
      } else {
        setFilePreviewUrl(null);
      }
    }
  };

  // تنظيف الذاكرة عند تغيير أو مسح الملف
  useEffect(() => {
    if (!selectedFile) setFilePreviewUrl(null);
    return () => {
      if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
    };
  }, [selectedFile]);

  // جلب القالب المختار حالياً لعرضه في المعاينة
  const currentTemplate = sealTemplates?.find((t) => t.id === selectedTemplateId) || sealTemplates?.[0];

  // -----------------------------------------------------
  // تصميم الورقة الأمنية المعقدة (Guilloche Pattern)
  // -----------------------------------------------------
  const securityPaperStyle = {
    backgroundColor: "#fafafa",
    backgroundImage: `
      radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.03) 0%, transparent 60%),
      repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.15) 0px, rgba(148, 163, 184, 0.15) 1px, transparent 1px, transparent 12px),
      repeating-linear-gradient(-45deg, rgba(148, 163, 184, 0.15) 0px, rgba(148, 163, 184, 0.15) 1px, transparent 1px, transparent 12px)
    `,
    backgroundSize: "100% 100%, 24px 24px, 24px 24px",
  };

  const sealSecurityBackground = {
    backgroundImage: `repeating-radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08) 0, transparent 2px, rgba(37, 99, 235, 0.04) 3px, transparent 5px)`,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" /> معالج التوثيق والاعتماد الرقمي
            </h3>
            <p className="text-blue-100 text-sm mt-2 font-medium">
              قم بتوثيق المستندات الداخلية أو الملفات الخارجية بسريال رقمي معتمد وختم مؤمن عصياً على التزوير.
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* ================================================================= */}
          {/* المرحلة 1: شاشة اختيار / رفع الملف (تظهر فقط إذا لم يتم اختيار ملف) */}
          {/* ================================================================= */}
          {!selectedFile && !selectedDocId ? (
            <div className="space-y-6 animate-in zoom-in-95">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. رفع ملف خارجي */}
                <label className="p-8 border-2 border-dashed border-slate-300 rounded-3xl hover:border-blue-600 hover:bg-blue-50 transition-all group text-center space-y-4 cursor-pointer block">
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleLocalFileUpload}
                    accept=".pdf,image/png,image/jpeg,image/jpg" 
                  />
                  <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform shadow-sm">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-xl font-black text-slate-800">
                      رفع ملف خارجي
                    </div>
                    <p className="text-sm text-slate-500 font-bold mt-2">
                      اضغط هنا لاختيار ملف (PDF, JPG, PNG)
                    </p>
                  </div>
                </label>

                {/* 2. ربط مستند من النظام */}
                <div className="p-8 border-2 border-slate-100 rounded-3xl bg-slate-50/50 space-y-6 hover:border-blue-200 transition-colors shadow-sm">
                  <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                    <LinkIcon className="w-10 h-10 text-indigo-600" />
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-slate-800">
                      ربط مستند من النظام
                    </div>
                    <p className="text-sm text-slate-500 font-bold mt-2">
                      عقود، فواتير، أو عروض أسعار مسجلة بقاعدة البيانات
                    </p>
                  </div>
                  <div className="space-y-4">
                    <select
                      value={selectedDocType}
                      onChange={(e) => {
                        setSelectedDocType(e.target.value);
                        setSelectedDocId("");
                      }}
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all cursor-pointer shadow-sm"
                    >
                      <option value="">-- اختر نوع المستند --</option>
                      <option value="CONTRACT">عقد مهني</option>
                      <option value="INVOICE">فاتورة مالية</option>
                      <option value="QUOTATION">عرض سعر</option>
                    </select>

                    {selectedDocType && selectedDocType !== "EXTERNAL" && (
                      <select
                        value={selectedDocId}
                        onChange={(e) => setSelectedDocId(e.target.value)}
                        className="w-full p-3.5 bg-white border border-blue-300 rounded-xl text-sm font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200 animate-in fade-in transition-all cursor-pointer shadow-md"
                      >
                        <option value="">-- اختر المستند المطلوب --</option>
                        {mockInternalDocs[selectedDocType.toLowerCase()]?.map((doc) => (
                          <option key={doc.id} value={doc.id}>
                            {doc.name} (Ref: #{doc.id})
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (

          /* ================================================================= */
          /* المرحلة 2: إعدادات واعتماد الوثيقة والمحرك البصري (A4 Engine)     */
          /* ================================================================= */
            <div className="space-y-8 animate-in slide-in-from-right-4">
              <div className="flex flex-col lg:flex-row gap-8">
                
                {/* ----------------------------------------------------- */}
                {/* المعاينة الحية للورقة A4 (Live Preview Canvas)        */}
                {/* ----------------------------------------------------- */}
                <div className="flex-1 bg-slate-200/50 rounded-3xl p-6 flex flex-col items-center justify-center border border-slate-200 shadow-inner relative overflow-hidden">
                  <div className="text-center mb-6 w-full flex justify-between items-center px-4">
                     <span className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Eye className="w-4 h-4" /> Live Secure Preview
                     </span>
                     <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-200">
                        A4 Document Ready
                     </span>
                  </div>

                  {/* حاوية A4 المصغرة */}
                  <div 
                     className="w-[210mm] h-[297mm] bg-white shadow-2xl relative origin-top scale-[0.4] sm:scale-[0.5] md:scale-[0.6] lg:scale-[0.45] xl:scale-[0.55] transition-transform select-none border border-slate-300 overflow-hidden"
                     style={{ ...securityPaperStyle, marginBottom: '-140mm' }} 
                  >
                    
                    {/* عرض الصورة المرفوعة إذا كانت موجودة */}
                    {filePreviewUrl ? (
                      <img src={filePreviewUrl} alt="Document" className="w-full h-full object-cover opacity-90 mix-blend-darken" />
                    ) : (
                      /* عرض محتوى وهمي للمستند الداخلي أو ملف الـ PDF */
                      <div className="p-16 space-y-10 relative z-10">
                        {/* ترويسة وهمية */}
                        <div className="flex justify-between items-start border-b-2 border-slate-300 pb-8">
                           <div className="space-y-4 w-1/2">
                              <div className="h-6 bg-slate-300/80 rounded w-3/4" />
                              <div className="h-4 bg-slate-200/80 rounded w-1/2" />
                           </div>
                           <div className="w-24 h-24 bg-blue-100/50 rounded-xl flex items-center justify-center border border-blue-200/50">
                              {selectedFile?.type === 'application/pdf' ? <FileText className="w-10 h-10 text-blue-300" /> : <Shield className="w-10 h-10 text-blue-300" />}
                           </div>
                        </div>
                        
                        <div className="h-10 bg-slate-800/80 rounded-xl w-1/2 mx-auto mt-8 flex items-center justify-center">
                           <span className="text-white font-black text-2xl tracking-widest opacity-50">
                             {selectedDocType} DOCUMENT
                           </span>
                        </div>
                        
                        <div className="space-y-8 pt-8">
                          <div className="h-4 bg-slate-300/60 rounded w-full" />
                          <div className="h-4 bg-slate-300/60 rounded w-full" />
                          <div className="h-4 bg-slate-300/60 rounded w-full" />
                          <div className="h-4 bg-slate-300/60 rounded w-5/6" />
                        </div>
                      </div>
                    )}

                    {/* الشريط الأمني الجانبي */}
                    <div className="absolute top-0 bottom-0 left-6 w-2 bg-gradient-to-b from-blue-300 via-slate-300 to-blue-300 opacity-60 border-x border-white mix-blend-multiply" />

                    {/* علامة مائية مركزية */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03]">
                      <div className="text-[120px] font-black text-slate-900 -rotate-45 whitespace-nowrap tracking-widest">
                        SECURE SYSTEM
                      </div>
                    </div>

                    {/* ========================================== */}
                    {/* الختم الأمني (Secure Seal Overlay)         */}
                    {/* ========================================== */}
                    {currentTemplate && selectedSignatureType !== "NONE" && !selectedSignatureType.includes("MANUAL_ONLY") && (
                      <div
                        className="absolute bottom-[140px] left-[60px] flex flex-col items-center justify-center z-20 group"
                        style={{ width: '180px', height: '180px' }}
                      >
                        {/* إطار الختم ذو النقش المعقد */}
                        <div 
                          className="absolute inset-0 rounded-full border-[4px] border-blue-600/30 flex items-center justify-center mix-blend-multiply p-1.5 shadow-lg"
                          style={{ ...sealSecurityBackground, backgroundColor: currentTemplate.backgroundColor + "CC" || "#eff6ffCC" }}
                        >
                          <div className="w-full h-full rounded-full border-[1.5px] border-dashed border-blue-800/40 flex items-center justify-center backdrop-blur-[1px] bg-white/20">
                             <img 
                               src={currentTemplate.stampImage || "https://picsum.photos/seed/stamp/200/200"} 
                               alt="Seal" 
                               className="w-20 h-20 rounded-full mix-blend-multiply opacity-95 object-cover" 
                             />
                          </div>
                        </div>

                        {/* النصوص الدائرية */}
                        <div className="absolute top-4 text-[8px] font-black text-blue-900/90 uppercase tracking-widest mix-blend-multiply">
                          {currentTemplate.backgroundText || "رسمي وموثق"}
                        </div>
                        <div className="absolute bottom-4 text-[7px] font-black text-blue-800/80 uppercase tracking-widest mix-blend-multiply">
                          VALIDATED SYSTEM
                        </div>

                        <ShieldCheck className="w-24 h-24 text-blue-600 absolute opacity-[0.08] mix-blend-multiply pointer-events-none" />

                        {/* السريال الرقمي المدمج */}
                        <div className="absolute -bottom-10 bg-white/90 border border-blue-300 px-3 py-1 rounded-lg shadow-sm mix-blend-multiply text-center backdrop-blur-sm">
                          <div className="text-[9px] font-mono font-black text-slate-800">
                            SN: {currentTemplate.serialPrefix || "SEC-"}9928-11
                          </div>
                          <div className="text-[5px] font-black text-emerald-600 mt-0.5">
                            NEURAL HASH VERIFIED
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ========================================== */}
                    {/* التوقيع الرقمي المدمج (Digital Signature)  */}
                    {/* ========================================== */}
                    {(selectedSignatureType.includes("MANUAL") || selectedSignatureType.includes("SIG")) && (
                      <div className="absolute bottom-[140px] right-[60px] flex flex-col items-center z-10 w-[220px]">
                        <div className="text-[12px] font-black text-slate-600 mb-2 border-b-2 border-slate-300 border-dashed w-full text-center pb-2">
                          توقيع المسؤول المعتمد
                        </div>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/3/3a/Jon_Foreman_Signature.png" 
                          className="w-40 opacity-80 invert grayscale mix-blend-multiply -rotate-6" 
                          alt="Signature" 
                        />
                        {selectedSignatureType.includes("SECURE") && (
                          <div className="mt-6 text-[9px] font-black text-blue-700 flex items-center gap-1 bg-blue-50/90 px-3 py-1.5 rounded-lg border border-blue-200 mix-blend-multiply shadow-sm">
                            <ShieldCheck className="w-3 h-3" /> SECURE DIGITAL SIGNATURE
                          </div>
                        )}
                      </div>
                    )}

                    {/* تذييل الورقة الأمني (QR + Microprint) */}
                    <div className="absolute bottom-10 left-12 right-12 flex justify-between items-end border-t-2 border-slate-300 pt-6 mix-blend-multiply">
                       <div className="flex gap-4 items-center">
                          <div className="p-1.5 bg-white border-2 border-slate-300 rounded-lg">
                             <QrCode className="w-16 h-16 text-slate-800" />
                          </div>
                          <div className="space-y-1.5 text-right">
                             <div className="text-[10px] font-black text-slate-800">امسح الرمز للتحقق من صحة الوثيقة</div>
                             <div className="text-[8px] font-mono text-slate-600 font-bold bg-slate-100 px-2 py-0.5 rounded inline-block">verify.system.com/doc/9928</div>
                          </div>
                       </div>
                    </div>
                    
                    {/* نص مايكرو لا يُرى بالعين المجردة لمنع تصوير المستند */}
                    <div className="absolute bottom-2 left-0 right-0 overflow-hidden opacity-30 select-none">
                       <p className="text-[4px] font-mono text-slate-500 whitespace-nowrap tracking-tighter">
                          {Array(40).fill("REMIX-ENGINEERING-SECURE-DOCUMENT-AUTHENTIC-RECORD").join(" · ")}
                       </p>
                    </div>

                  </div>
                </div>

                {/* ----------------------------------------------------- */}
                {/* شريط الإعدادات والتحكم الجانبي                        */}
                {/* ----------------------------------------------------- */}
                <div className="w-full lg:w-96 space-y-6 flex flex-col justify-between">
                  <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h4 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-blue-600" /> إعدادات الاعتماد الرقمي
                    </h4>

                    <div className="space-y-5">
                      {/* عرض اسم المستند */}
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                         <span className="block text-[10px] font-black text-slate-400 mb-1">المستند المستهدف:</span>
                         <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                           {selectedFile?.type?.includes('image') ? <FileImage className="w-4 h-4 text-blue-500"/> : <FileText className="w-4 h-4 text-blue-500"/>}
                           <span className="truncate max-w-[200px]">
                             {selectedFile ? selectedFile.name : mockInternalDocs[selectedDocType.toLowerCase()]?.find((d) => d.id === selectedDocId)?.name}
                           </span>
                         </span>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">قالب الختم المعتمد</label>
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                        >
                          {sealTemplates?.length > 0 ? (
                            sealTemplates.map((t) => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))
                          ) : (
                            <option value="">جاري التحميل...</option>
                          )}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">طريقة التوقيع والختم</label>
                        <select
                          value={selectedSignatureType}
                          onChange={(e) => setSelectedSignatureType(e.target.value)}
                          className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
                        >
                          <option value="SIG_AND_STAMP">توقيع وختم النظام</option>
                          <option value="SECURE_AND_MANUAL">توقيع مؤمن (محمي بالهاش) + ختم</option>
                          <option value="STAMP_ONLY">ختم النظام فقط</option>
                          <option value="MANUAL">توقيع فقط (بدون ختم)</option>
                          <option value="NONE">وثيقة مسجلة (بدون أختام)</option>
                        </select>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-slate-100">
                         <h5 className="text-[11px] font-black text-slate-800 mb-2">الطبقات الأمنية</h5>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">تشفير الهاش (SHA-256)</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">تضمين رمز QR للتحقق</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer" />
                          <span className="text-xs font-bold text-slate-600 group-hover:text-blue-600 transition-colors">تسطيح المستند (Flatten PDF)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={executeDocumentation}
                      disabled={isUploading}
                      className="w-full py-4 bg-blue-600 text-white rounded-2xl text-sm font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {isUploading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <ShieldCheck className="w-5 h-5" />
                      )}
                      إعتماد، تشفير، وتوثيق المستند
                    </button>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setSelectedDocId("");
                      }}
                      className="w-full py-3.5 bg-white text-rose-600 border border-rose-200 rounded-2xl text-sm font-black hover:bg-rose-50 transition-all"
                    >
                      إلغاء وتغيير المستند
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};