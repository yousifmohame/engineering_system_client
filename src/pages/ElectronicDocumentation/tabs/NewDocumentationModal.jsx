import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Upload,
  FileText,
  Loader2,
  Sparkles,
  Settings2,
  QrCode,
  X,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { STAMP_TEMPLATE } from "../../../components/Stamp/stampTemplate";
import { STAMP_TEMPLATE_QR } from "../../../components/Stamp/stampTemplateـqrcode";

// 💡 استخدمنا مسار الـ legacy ليقوم بتوليد ملف .js عادي يقبله أي سيرفر
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

// 💡 نمرر الـ Worker هنا كـ workerPort بدلاً من workerSrc
pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();

export default function NewDocumentationModal({ isOpen, onClose, onSuccess }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [stampData, setStampData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [step, setStep] = useState(1);

  const [stampScale, setStampScale] = useState(1);
  const [stampRotation, setStampRotation] = useState(0);
  const [qrScale, setQrScale] = useState(1);
  const [qrRotation, setQrRotation] = useState(0);

  const renderWidth = 800;

  const constraintsRef = useRef(null);
  const mainStampRef = useRef(null);
  const qrStampRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(null);
      setPreviewUrl(null);
      setStampData(null);
      setRecordId(null);
      setStep(1);
      setStampScale(1);
      setStampRotation(0);
      setQrScale(1);
      setQrRotation(0);
    }
  }, [isOpen, previewUrl]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  const generateStamp = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", "EXTERNAL");
      formData.append("fileName", file.name);
      formData.append("signatureType", "DIGITAL_SEAL");

      const res = await api.post(`/documentation`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStampData(res.data.data.stamp);
      setRecordId(res.data.data.record.id);
      toast.success("تم رفع الملف وتوليد الأختام الأمنية 🛡️");
    } catch (error) {
      toast.error(error.response?.data?.message || "فشل الاتصال بخادم الأمان");
    } finally {
      setIsProcessing(false);
    }
  };

  const ensureXmlns = (svg) => {
    if (!svg.includes('xmlns="http://www.w3.org/2000/svg"')) {
      return svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
    }
    return svg;
  };

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

  // 💡 الحل الرياضي الدقيق لحساب الـ Pivot Point (Bottom-Left)
  const getCoordinates = (elementRef, scale, rotation) => {
    if (!elementRef.current || !constraintsRef.current) return null;

    const container = constraintsRef.current.getBoundingClientRect();
    const rect = elementRef.current.getBoundingClientRect();

    // 1. الأبعاد الحقيقية بدون دوران
    const actualWidth = elementRef.current.offsetWidth * scale;
    const actualHeight = elementRef.current.offsetHeight * scale;

    // 2. المركز الفعلي للختم على الشاشة
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // 3. تحويل المركز لنسب مئوية (الـ Y تُحسب من الأسفل ليتطابق مع PDF)
    const centerXPercent = (centerX - container.left) / container.width;
    const centerYPercent = (container.bottom - centerY) / container.height;

    const widthPercent = actualWidth / container.width;
    const heightPercent = actualHeight / container.height;

    const angleRad = (rotation * Math.PI) / 180;

    // 4. معادلة حساب النقطة السفلية اليسرى (Pivot) بدلالة المركز وزاوية الدوران
    const xPercent =
      centerXPercent -
      (widthPercent / 2) * Math.cos(angleRad) -
      (heightPercent / 2) * Math.sin(angleRad);
    // 💡 التعديل الجذري هنا: المعادلة أصبحت تحسب من الأسفل بشكل صحيح
    const yPercent =
      centerYPercent +
      (widthPercent / 2) * Math.sin(angleRad) -
      (heightPercent / 2) * Math.cos(angleRad);

    return {
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      rotation: -rotation, // نعكس الزاوية للـ pdf-lib
    };
  };

  const handleApprove = async () => {
    if (!recordId || !stampData) return;
    setIsApproving(true);

    try {
      const mainCoords = getCoordinates(
        mainStampRef,
        stampScale,
        stampRotation,
      );
      const qrCoords = getCoordinates(qrStampRef, qrScale, qrRotation);

      const stampsToBurn = [];
      if (mainCoords) {
        stampsToBurn.push({
          ...mainCoords,
          svgString: ensureXmlns(renderMainStampPreview()),
        });
      }
      if (qrCoords) {
        stampsToBurn.push({
          ...qrCoords,
          svgString: ensureXmlns(renderQrStampPreview()),
        });
      }

      await api.put(`/documentation/${recordId}/approve`, {
        stamps: stampsToBurn,
      });

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-black text-emerald-600">
            تم حرق الأختام واعتماد الوثيقة! ✅
          </span>
          <span className="text-xs">التطابق 100% مع مكان المعاينة.</span>
        </div>,
        { duration: 5000 },
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error("حدث خطأ أثناء دمج الأختام بالملف.");
    } finally {
      setIsApproving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-tajawal"
        dir="rtl"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-[95vw] h-[95vh] bg-slate-100 rounded-[2rem] shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="bg-white px-6 py-4 flex justify-between items-center shrink-0 z-20 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-800">
                  توثيق وختم مستند جديد
                </h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Enterprise Stamping Engine
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            {step === 1 ? (
              <div className="h-full flex items-center justify-center p-6 bg-slate-50">
                <div
                  onClick={() => fileInputRef.current.click()}
                  className="w-full max-w-3xl aspect-video bg-white border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                  />
                  <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                    <Upload className="w-10 h-10 text-blue-600" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-slate-800 group-hover:text-blue-700 transition-colors">
                      اسحب الملف هنا أو اضغط للرفع
                    </h3>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col lg:flex-row bg-slate-200/50">
                <div className="w-full lg:w-[400px] bg-white/90 backdrop-blur-xl border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)] shrink-0">
                  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" /> تفاصيل
                      وإجراءات
                    </h3>
                    {!stampData ? (
                      <button
                        onClick={generateStamp}
                        disabled={isProcessing}
                        className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-black flex justify-center items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}{" "}
                        توليد الأختام
                      </button>
                    ) : (
                      <button
                        onClick={handleApprove}
                        disabled={isApproving}
                        className="w-full py-3.5 bg-emerald-500 text-white rounded-xl text-sm font-black flex justify-center items-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isApproving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5" />
                        )}{" "}
                        اعتماد وحفظ الوثيقة
                      </button>
                    )}
                  </div>

                  {stampData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4"
                    >
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                          <Settings2 className="w-4 h-4 text-slate-400" /> الختم
                          الرئيسي
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2">
                              <span>تكبير/تصغير</span>{" "}
                              <span>{Math.round(stampScale * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="2"
                              step="0.05"
                              value={stampScale}
                              onChange={(e) =>
                                setStampScale(parseFloat(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2">
                              <span>دوران</span> <span>{stampRotation}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="1"
                              value={stampRotation}
                              onChange={(e) =>
                                setStampRotation(parseInt(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                          <QrCode className="w-4 h-4 text-slate-400" /> ختم الـ
                          QR المصغر
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2">
                              <span>تكبير/تصغير</span>{" "}
                              <span>{Math.round(qrScale * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="3"
                              step="0.05"
                              value={qrScale}
                              onChange={(e) =>
                                setQrScale(parseFloat(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2">
                              <span>دوران</span> <span>{qrRotation}°</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              step="1"
                              value={qrRotation}
                              onChange={(e) =>
                                setQrRotation(parseInt(e.target.value))
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex-1 flex justify-center items-start overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-300/30">
                  <div
                    ref={constraintsRef}
                    className="relative shadow-2xl bg-white flex flex-col mx-auto"
                    style={{ width: "max-content" }}
                  >
                    {file?.type.startsWith("image/") ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        width={renderWidth}
                        className="block pointer-events-none"
                      />
                    ) : file?.type === "application/pdf" ? (
                      <Document file={file} className="pointer-events-none">
                        <Page
                          pageNumber={1}
                          width={renderWidth}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                    ) : null}

                    {stampData && (
                      <motion.div
                        ref={mainStampRef}
                        drag
                        dragConstraints={constraintsRef}
                        dragMomentum={false}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                          scale: stampScale,
                          rotate: stampRotation,
                          opacity: 1,
                        }}
                        // 💡 تم مسح كلاسات الـ translate واستبدالها بتموضع CSS بسيط للسلاسة
                        style={{
                          originX: 0.5,
                          originY: 0.5,
                          top: "20%",
                          left: "30%",
                        }}
                        className="absolute w-72 z-50 cursor-grab active:cursor-grabbing drop-shadow-2xl"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderMainStampPreview(),
                          }}
                          className="pointer-events-none"
                        />
                      </motion.div>
                    )}

                    {stampData && (
                      <motion.div
                        ref={qrStampRef}
                        drag
                        dragConstraints={constraintsRef}
                        dragMomentum={false}
                        initial={{ opacity: 0, x: 0, y: 0 }}
                        animate={{
                          scale: qrScale,
                          rotate: qrRotation,
                          opacity: 1,
                        }}
                        style={{
                          originX: 0.5,
                          originY: 0.5,
                          bottom: "10%",
                          left: "10%",
                        }}
                        className="absolute w-32 z-50 cursor-grab active:cursor-grabbing drop-shadow-xl"
                      >
                        <div
                          dangerouslySetInnerHTML={{
                            __html: renderQrStampPreview(),
                          }}
                          className="pointer-events-none"
                        />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
