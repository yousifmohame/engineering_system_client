import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Loader2, Sparkles, Settings2, QrCode, X, CheckCircle2,
  ShieldCheck, Image as ImageIcon, Copy, Layers
} from "lucide-react";
import api from "../../../../../api/axios";
import { toast } from "sonner";

// استيراد قوالب الأختام (تأكد من صحة المسار لديك)
import { STAMP_TEMPLATE } from "../../../../../components/Stamp/stampTemplate";
import { STAMP_TEMPLATE_QR } from "../../../../../components/Stamp/stampTemplateـqrcode";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();

export default function QuotationStampingModal({
  isOpen,
  onClose,
  onSuccess,
  pdfFile,
  quotationData,
  quotationId // الآي دي الخاص بعرض السعر المحفوظ
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [stampData, setStampData] = useState(null);
  const [numPages, setNumPages] = useState(null);

  // إحداثيات الأختام
  const [stampScale, setStampScale] = useState(1);
  const [stampRotation, setStampRotation] = useState(0);
  const [qrScale, setQrScale] = useState(1);
  const [qrRotation, setQrRotation] = useState(0);

  const [customStampsList, setCustomStampsList] = useState([{ id: "stamp-1" }]);
  const [applyToAllPages, setApplyToAllPages] = useState(false);
  const [useCustomStamp, setUseCustomStamp] = useState(false);
  const [customStampBase64, setCustomStampBase64] = useState(null);
  const customStampInputRef = useRef(null);

  // إعدادات أمان عرض السعر
  const [securitySettings, setSecuritySettings] = useState({
    isVerifiable: true,
    requireOTP: false,
    clientPhone: quotationData?.repPhone || "",
    validityDays: quotationData?.validityDays || 30,
  });

  const renderWidth = 800;
  const constraintsRef = useRef(null);
  const mainStampRefs = useRef({});
  const qrStampRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setStampData(null);
      setStampScale(1);
      setQrScale(1);
      setCustomStampsList([{ id: "stamp-1" }]);
    }
  }, [isOpen]);

  const handleCustomStampUpload = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomStampBase64(reader.result);
      reader.readAsDataURL(selectedImage);
    }
  };

  const duplicateStamp = () => setCustomStampsList([...customStampsList, { id: `stamp-${Date.now()}` }]);

  // 🚀 توليد الأختام الخاصة بعرض السعر
  const generateStamp = async () => {
    setIsProcessing(true);
    try {
      // نتخاطب مع Endpoint مخصص لعروض الأسعار ليولد توكن فريد لهذا العرض
      const res = await api.post(`/quotations/${quotationId}/generate-stamps`);
      setStampData(res.data.data.stamp); // يحتوي على QR و Barcode و Token
      toast.success("تم تجهيز الأختام الأمنية الخاصة بعرض السعر 🛡️");
    } catch (error) {
      toast.error(error.response?.data?.message || "فشل الاتصال بخادم الأمان");
    } finally {
      setIsProcessing(false);
    }
  };

  const ensureXmlns = (svg) => svg.includes('xmlns="http://www.w3.org/2000/svg"') ? svg : svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');

  const renderMainStampPreview = () => {
    if (!stampData) return null;
    return STAMP_TEMPLATE.replace(/{{QR_DATA_URL}}/g, stampData.qrBase64)
      .replace(/{{BARCODE_DATA_URL}}/g, stampData.barcodeBase64)
      .replace(/{{BARCODE_TEXT}}/g, stampData.dynamicBarcodeText)
      .replace(/{{TOKEN}}/g, stampData.token);
  };

  const renderQrStampPreview = () => {
    if (!stampData) return null;
    return STAMP_TEMPLATE_QR.replace(/{{QR_DATA_URL}}/g, stampData.qrBase64)
      .replace(/{{BARCODE_DATA_URL}}/g, stampData.barcodeBase64)
      .replace(/{{BARCODE_TEXT}}/g, stampData.dynamicBarcodeText)
      .replace(/{{TOKEN}}/g, stampData.token);
  };

  const getCoordinates = (elementRef, scale, rotation) => {
    if (!elementRef || !elementRef.current || !constraintsRef.current) return null;
    const firstPageElement = constraintsRef.current.querySelector(".react-pdf__Page");
    if (!firstPageElement) return null;

    const container = firstPageElement.getBoundingClientRect();
    const rect = elementRef.current.getBoundingClientRect();

    const actualWidth = elementRef.current.offsetWidth * scale;
    const actualHeight = elementRef.current.offsetHeight * scale;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const centerXPercent = (centerX - container.left) / container.width;
    const centerYPercent = (container.bottom - centerY) / container.height;
    const widthPercent = actualWidth / container.width;
    const heightPercent = actualHeight / container.height;
    const angleRad = (rotation * Math.PI) / 180;

    const xPercent = centerXPercent - (widthPercent / 2) * Math.cos(angleRad) - (heightPercent / 2) * Math.sin(angleRad);
    const yPercent = centerYPercent + (widthPercent / 2) * Math.sin(angleRad) - (heightPercent / 2) * Math.cos(angleRad);

    return { xPercent, yPercent, widthPercent, heightPercent, rotation: -rotation };
  };

  // 🚀 إرسال العرض للاعتماد النهائي
  const handleApprove = async () => {
    if (!quotationId || !stampData) return;
    setIsApproving(true);

    try {
      const stampsToBurn = [];
      customStampsList.forEach((stamp) => {
        const domRef = { current: mainStampRefs.current[stamp.id] };
        const mainCoords = getCoordinates(domRef, stampScale, stampRotation);
        if (mainCoords) {
          let finalSvgData = (useCustomStamp && customStampBase64) 
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500"><image href="${customStampBase64}" width="500" height="500" preserveAspectRatio="xMidYMid meet" /></svg>`
            : ensureXmlns(renderMainStampPreview());
          stampsToBurn.push({ ...mainCoords, svgString: finalSvgData, isCustomImage: useCustomStamp });
        }
      });

      const qrCoords = getCoordinates(qrStampRef, qrScale, qrRotation);
      if (qrCoords) {
        stampsToBurn.push({ ...qrCoords, svgString: ensureXmlns(renderQrStampPreview()) });
      }

      // رفع الملف الـ PDF مع الإحداثيات لمحرك الأختام الخاص بعروض الأسعار
      const formData = new FormData();
      formData.append("file", pdfFile);
      formData.append("stamps", JSON.stringify(stampsToBurn));
      formData.append("applyToAllPages", applyToAllPages);
      formData.append("securitySettings", JSON.stringify(securitySettings));

      await api.put(`/quotations/${quotationId}/approve-and-stamp`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-black text-emerald-600">تم اعتماد عرض السعر بنجاح! ✅</span>
          <span className="text-xs">تم إرسال إشعار للعميل وحفظ العرض في السجلات المعتمدة.</span>
        </div>,
        { duration: 5000 }
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء دمج الأختام واعتماد العرض.");
    } finally {
      setIsApproving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-[Tajawal]" dir="rtl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />

        <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-[95vw] h-[95vh] bg-slate-100 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden">
          <div className="bg-white px-6 py-4 flex justify-between items-center shrink-0 z-20 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#123f59] text-[#e2bf74] rounded-xl flex items-center justify-center shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">توثيق واعتماد عرض السعر</h2>
                <p className="text-[10px] font-bold text-slate-400">Quotation Approval Engine</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative flex flex-col lg:flex-row bg-slate-200/50">
            {/* 🎛️ Sidebar */}
            <div className="w-full lg:w-[380px] bg-white/90 backdrop-blur-xl border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)] shrink-0">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">إجراءات الاعتماد</h3>
                {!stampData ? (
                  <button onClick={generateStamp} disabled={isProcessing} className="w-full py-3.5 bg-[#123f59] text-white rounded-xl text-sm font-black flex justify-center items-center gap-2 hover:bg-[#0f3448] transition-all disabled:opacity-50">
                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-[#e2bf74]" />} توليد أختام العرض
                  </button>
                ) : (
                  <button onClick={handleApprove} disabled={isApproving} className="w-full py-3.5 bg-emerald-500 text-white rounded-xl text-sm font-black flex justify-center items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50">
                    {isApproving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} اعتماد وإصدار العرض
                  </button>
                )}
              </div>

              {stampData && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                  {/* 🛡️ إعدادات الأمان */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-600" /> إعدادات التحقق للعميل</h3>
                    <div className="space-y-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={securitySettings.isVerifiable} onChange={(e) => setSecuritySettings({ ...securitySettings, isVerifiable: e.target.checked })} className="w-4 h-4 accent-emerald-600 rounded" />
                        <span className="text-xs font-bold text-slate-700">تفعيل التحقق من العرض عبر QR</span>
                      </label>
                      <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={securitySettings.requireOTP} onChange={(e) => setSecuritySettings({ ...securitySettings, requireOTP: e.target.checked })} className="w-4 h-4 accent-rose-600 rounded" />
                          <span className="text-xs font-bold text-rose-700">تأمين فتح العرض بـ OTP للموبايل</span>
                        </label>
                        {securitySettings.requireOTP && (
                          <input type="text" value={securitySettings.clientPhone} onChange={(e) => setSecuritySettings({ ...securitySettings, clientPhone: e.target.value })} placeholder="رقم جوال العميل..." className="mt-3 w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg outline-none focus:border-rose-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 🎚️ إعدادات الختم الرئيسي والتكرار */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
                      <h4 className="font-black text-slate-800 flex items-center gap-2"><Settings2 className="w-4 h-4 text-slate-400" /> إعدادات الختم</h4>
                      <div className="flex bg-slate-100 rounded-lg p-1">
                        <button onClick={() => setUseCustomStamp(false)} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${!useCustomStamp ? "bg-white shadow-sm text-[#123f59]" : "text-slate-500"}`}>القالب الذكي</button>
                        <button onClick={() => setUseCustomStamp(true)} className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${useCustomStamp ? "bg-white shadow-sm text-[#123f59]" : "text-slate-500"}`}>صورة خارجية</button>
                      </div>
                    </div>
                    {useCustomStamp && (
                      <div className="mb-4">
                        <input type="file" accept="image/png, image/jpeg" ref={customStampInputRef} onChange={handleCustomStampUpload} className="hidden" />
                        <div onClick={() => customStampInputRef.current.click()} className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50">
                          {customStampBase64 ? <img src={customStampBase64} alt="Custom" className="h-16 object-contain" /> : <span className="text-[10px] font-bold text-slate-500">اضغط لرفع صورة الختم</span>}
                        </div>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                      <button onClick={duplicateStamp} className="w-full py-2 bg-[#eef7f6] text-[#123f59] rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-[#e8edf0]"><Copy className="w-3.5 h-3.5" /> إضافة ختم إضافي</button>
                      <label className="flex items-center gap-2 cursor-pointer mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <input type="checkbox" checked={applyToAllPages} onChange={(e) => setApplyToAllPages(e.target.checked)} className="w-4 h-4 accent-[#123f59] rounded" />
                        <span className="text-[10px] font-black text-slate-700">تطبيق الأختام على كافة الصفحات</span>
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* 📄 Workspace (منطقة العمل) */}
            <div className="flex-1 flex justify-center items-start overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
              {applyToAllPages && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#123f59] text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg z-[100] flex items-center gap-2 animate-bounce">
                  <Layers className="w-3 h-3 text-[#e2bf74]" /> سيتم حرق الأختام على كافة الصفحات
                </div>
              )}

              <div className="py-8 flex flex-col items-center">
                <div ref={constraintsRef} className="relative shadow-2xl bg-white flex flex-col mx-auto" style={{ width: "max-content" }}>
                  <Document file={pdfFile} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className="pointer-events-none flex flex-col gap-4 bg-slate-200 p-4">
                    {Array.from(new Array(numPages || 1), (el, index) => (
                      <div key={`page_${index + 1}`} className="shadow-lg relative bg-white">
                        <Page pageNumber={index + 1} width={renderWidth} renderTextLayer={false} renderAnnotationLayer={false} />
                      </div>
                    ))}
                  </Document>

                  {/* الأختام القابلة للسحب */}
                  {stampData && customStampsList.map((stamp, index) => (
                    <motion.div key={stamp.id} ref={(el) => (mainStampRefs.current[stamp.id] = el)} drag dragConstraints={constraintsRef} dragMomentum={false} initial={{ opacity: 0, x: index * 20, y: index * 20 }} animate={{ scale: stampScale, rotate: stampRotation, opacity: 1 }} style={{ originX: 0.5, originY: 0.5, top: "85%", left: "60%" }} className="absolute w-64 h-max z-50 cursor-grab active:cursor-grabbing drop-shadow-xl [&>div>svg]:w-full [&>div>svg]:h-auto">
                      {useCustomStamp && customStampBase64 ? (
                        <img src={customStampBase64} alt="Stamp" className="w-full h-auto pointer-events-none object-contain" />
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: renderMainStampPreview() }} className="pointer-events-none w-full" />
                      )}
                    </motion.div>
                  ))}

                  {stampData && (
                    <motion.div ref={qrStampRef} drag dragConstraints={constraintsRef} dragMomentum={false} initial={{ opacity: 0, x: 0, y: 0 }} animate={{ scale: qrScale, rotate: qrRotation, opacity: 1 }} style={{ originX: 0.5, originY: 0.5, top: "88%", left: "10%" }} className="absolute w-28 h-max z-50 cursor-grab active:cursor-grabbing drop-shadow-xl [&>div>svg]:w-full [&>div>svg]:h-auto">
                      <div dangerouslySetInnerHTML={{ __html: renderQrStampPreview() }} className="pointer-events-none w-full" />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}