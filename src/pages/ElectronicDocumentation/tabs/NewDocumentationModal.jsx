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
  Image as ImageIcon,
  Link as LinkIcon,
  Database,
  Plus,
  Trash2,
  Copy,
  Layers,
} from "lucide-react";
import api from "../../../api/axios";
import { toast } from "sonner";
import { STAMP_TEMPLATE } from "../../../components/Stamp/stampTemplate";
import { STAMP_TEMPLATE_QR } from "../../../components/Stamp/stampTemplateـqrcode";
import { useAuth } from "../../../context/AuthContext";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker();

export default function NewDocumentationModal({
  isOpen,
  onClose,
  onSuccess,
  initialFile = null,
  initialMetadata = null,
}) {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [stampData, setStampData] = useState(null);
  const [recordId, setRecordId] = useState(null);
  const [step, setStep] = useState(1);

  const [numPages, setNumPages] = useState(null);

  // إحداثيات الأختام
  const [stampScale, setStampScale] = useState(1);
  const [stampRotation, setStampRotation] = useState(0);
  const [qrScale, setQrScale] = useState(1);
  const [qrRotation, setQrRotation] = useState(0);

  // 💡 إعدادات الختم المتعدد والصفحات
  const [customStampsList, setCustomStampsList] = useState([{ id: "stamp-1" }]);
  const [applyToAllPages, setApplyToAllPages] = useState(false);

  // إعدادات ختم الـ PNG المخصص
  const [useCustomStamp, setUseCustomStamp] = useState(false);
  const [customStampBase64, setCustomStampBase64] = useState(null);
  const customStampInputRef = useRef(null);

  // 💡 إعدادات الأمان
  const [securitySettings, setSecuritySettings] = useState({
    isVerifiable: true,
    requireOTP: false,
    clientPhone: "",
    maxViews: "",
    expiryDate: "",
    transactionId: "",
    clientId: "",
  });

  // 💡 البيانات الوصفية المرنة (Metadata)
  const [metadata, setMetadata] = useState([
    { id: 1, key: "اسم المالك", value: "" },
    { id: 2, key: "اسم المستند", value: "" },
  ]);

  const renderWidth = 800;

  const constraintsRef = useRef(null);
  const mainStampRefs = useRef({});
  const qrStampRef = useRef(null);
  const fileInputRef = useRef(null);

  // 🚀 مراقبة الملف الابتدائي (Integration مع التقارير)
  useEffect(() => {
    if (isOpen) {
      if (initialFile) {
        setFile(initialFile);
        setPreviewUrl(URL.createObjectURL(initialFile));
        setStep(2); // تخطي خطوة الرفع

        // تعبئة البيانات تلقائياً إن وجدت
        if (initialMetadata) {
          setMetadata([
            {
              id: 1,
              key: "اسم المالك / المعني",
              value: initialMetadata.employeeName || "",
            },
            {
              id: 2,
              key: "اسم المستند",
              value: initialMetadata.documentName || "تقرير مستخرج آلياً",
            },
          ]);
        }
      }
    } else {
      resetModalState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialFile]);

  // دالة لتنظيف الـ State عند الإغلاق
  const resetModalState = () => {
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
    setUseCustomStamp(false);
    setCustomStampBase64(null);
    setCustomStampsList([{ id: "stamp-1" }]);
    setApplyToAllPages(false);
    setSecuritySettings({
      isVerifiable: true,
      requireOTP: false,
      clientPhone: "",
      maxViews: "",
      expiryDate: "",
      transactionId: "",
      clientId: "",
    });
    setMetadata([
      { id: 1, key: "اسم المالك", value: "" },
      { id: 2, key: "اسم المستند", value: "" },
    ]);
    setNumPages(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setStep(2);
    }
  };

  const handleCustomStampUpload = (e) => {
    const selectedImage = e.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomStampBase64(reader.result);
      reader.readAsDataURL(selectedImage);
    }
  };

  // 💡 دوال الميتا داتا
  const addMetadataField = () =>
    setMetadata([...metadata, { id: Date.now(), key: "", value: "" }]);
  const updateMetadata = (id, field, val) =>
    setMetadata(
      metadata.map((m) => (m.id === id ? { ...m, [field]: val } : m)),
    );
  const removeMetadata = (id) =>
    setMetadata(metadata.filter((m) => m.id !== id));

  // 💡 دالة تكرار الختم
  const duplicateStamp = () =>
    setCustomStampsList([...customStampsList, { id: `stamp-${Date.now()}` }]);

  const generateStamp = async () => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("docType", "EXTERNAL");
      formData.append(
        "fileName",
        metadata.find((m) => m.key === "اسم المستند")?.value || file.name,
      );
      formData.append("signatureType", "DIGITAL_SEAL");

      if (user && user.id) formData.append("employeeId", user.id);

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

  const getCoordinates = (elementRef, scale, rotation) => {
    if (!elementRef || !elementRef.current || !constraintsRef.current)
      return null;

    const firstPageElement =
      constraintsRef.current.querySelector(".react-pdf__Page");
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

    const xPercent =
      centerXPercent -
      (widthPercent / 2) * Math.cos(angleRad) -
      (heightPercent / 2) * Math.sin(angleRad);
    const yPercent =
      centerYPercent +
      (widthPercent / 2) * Math.sin(angleRad) -
      (heightPercent / 2) * Math.cos(angleRad);

    return {
      xPercent,
      yPercent,
      widthPercent,
      heightPercent,
      rotation: -rotation,
    };
  };

  const handleApprove = async () => {
    if (!recordId || !stampData) return;
    setIsApproving(true);

    try {
      const stampsToBurn = [];

      // 💡 معالجة كافة الأختام المكررة
      customStampsList.forEach((stamp) => {
        const domRef = { current: mainStampRefs.current[stamp.id] };
        const mainCoords = getCoordinates(domRef, stampScale, stampRotation);

        if (mainCoords) {
          let finalSvgData = "";
          if (useCustomStamp && customStampBase64) {
            finalSvgData = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500"><image href="${customStampBase64}" width="500" height="500" preserveAspectRatio="xMidYMid meet" /></svg>`;
          } else {
            finalSvgData = ensureXmlns(renderMainStampPreview());
          }
          stampsToBurn.push({
            ...mainCoords,
            svgString: finalSvgData,
            isCustomImage: useCustomStamp,
          });
        }
      });

      // ختم الـ QR الثابت
      const qrCoords = getCoordinates(qrStampRef, qrScale, qrRotation);
      if (qrCoords) {
        stampsToBurn.push({
          ...qrCoords,
          svgString: ensureXmlns(renderQrStampPreview()),
        });
      }

      const validMetadata = metadata.filter(
        (m) => m.key.trim() !== "" && m.value.trim() !== "",
      );

      await api.put(`/documentation/${recordId}/approve`, {
        stamps: stampsToBurn,
        transactionId: securitySettings.transactionId,
        clientId: securitySettings.clientId,
        isVerifiable: securitySettings.isVerifiable,
        requireOTP: securitySettings.requireOTP,
        clientPhone: securitySettings.clientPhone,
        maxViews: securitySettings.maxViews
          ? parseInt(securitySettings.maxViews)
          : null,
        expiryDate: securitySettings.expiryDate
          ? new Date(securitySettings.expiryDate).toISOString()
          : null,
        applyToAllPages: applyToAllPages,
        customMetadata: validMetadata,
      });

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-black text-emerald-600">
            تم إرسال المستند للمشرف للاعتماد! ✅
          </span>
          <span className="text-xs">تم دمج الأختام وتطبيق إعدادات الأمان.</span>
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

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
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
                {/* 🎛️ Sidebar */}
                <div className="w-full lg:w-[420px] bg-white/90 backdrop-blur-xl border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto custom-scrollbar z-20 shadow-[4px_0_24px_rgba(0,0,0,0.05)] shrink-0">
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
                        إرسال للمشرف للاعتماد
                      </button>
                    )}
                  </div>

                  {stampData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-4"
                    >
                      {/* 🛡️ إعدادات الأمان والـ OTP */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />{" "}
                          إعدادات الأمان والربط
                        </h3>
                        <div className="space-y-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={securitySettings.isVerifiable}
                              onChange={(e) =>
                                setSecuritySettings({
                                  ...securitySettings,
                                  isVerifiable: e.target.checked,
                                })
                              }
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                            <span className="text-xs font-bold text-slate-700">
                              السماح بالتحقق الإلكتروني للعامة (عبر QR)
                            </span>
                          </label>

                          <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={securitySettings.requireOTP}
                                onChange={(e) =>
                                  setSecuritySettings({
                                    ...securitySettings,
                                    requireOTP: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 accent-rose-600 rounded"
                              />
                              <span className="text-xs font-bold text-rose-700">
                                تأمين المستند برمز تحقق (OTP) عند الفتح
                              </span>
                            </label>
                            <AnimatePresence>
                              {securitySettings.requireOTP && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="mt-3 overflow-hidden"
                                >
                                  <label className="text-[10px] font-bold text-rose-600 block mb-1">
                                    رقم جوال العميل (سيتم إرسال הـ OTP إليه)
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="مثال: 05XXXXXXXX"
                                    value={securitySettings.clientPhone}
                                    onChange={(e) =>
                                      setSecuritySettings({
                                        ...securitySettings,
                                        clientPhone: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 py-2 text-xs bg-white border border-rose-200 rounded-lg outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all shadow-sm"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {securitySettings.isVerifiable && (
                            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                  الحد الأقصى للفتح
                                </label>
                                <input
                                  type="number"
                                  placeholder="غير محدود"
                                  value={securitySettings.maxViews}
                                  onChange={(e) =>
                                    setSecuritySettings({
                                      ...securitySettings,
                                      maxViews: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                                  تاريخ الصلاحية
                                </label>
                                <input
                                  type="date"
                                  value={securitySettings.expiryDate}
                                  onChange={(e) =>
                                    setSecuritySettings({
                                      ...securitySettings,
                                      expiryDate: e.target.value,
                                    })
                                  }
                                  className="w-full px-2 py-1.5 text-[10px] bg-white border border-slate-200 rounded-lg outline-none focus:border-emerald-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 📋 البيانات الإضافية (Metadata) المرنة */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                          <Database className="w-4 h-4 text-indigo-600" />{" "}
                          البيانات الوصفية (Metadata)
                        </h3>
                        <div className="space-y-2">
                          {metadata.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-2"
                            >
                              <input
                                value={item.key}
                                onChange={(e) =>
                                  updateMetadata(item.id, "key", e.target.value)
                                }
                                placeholder="اسم الحقل"
                                className="w-1/3 text-[10px] px-2 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                              />
                              <input
                                value={item.value}
                                onChange={(e) =>
                                  updateMetadata(
                                    item.id,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                placeholder="القيمة..."
                                className="flex-1 text-[10px] px-2 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                              />
                              <button
                                onClick={() => removeMetadata(item.id)}
                                className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={addMetadataField}
                            className="w-full mt-2 py-2 border border-dashed border-indigo-200 text-indigo-600 rounded-lg text-[10px] font-black flex justify-center items-center gap-1 hover:bg-indigo-50 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> إضافة حقل جديد
                          </button>
                        </div>
                      </div>

                      {/* 🎚️ إعدادات الختم الرئيسي والتكرار */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-center border-b border-slate-50 pb-3 mb-4">
                          <h4 className="font-black text-slate-800 flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-slate-400" />{" "}
                            إعدادات الختم الرئيسي
                          </h4>
                          <div className="flex bg-slate-100 rounded-lg p-1">
                            <button
                              onClick={() => setUseCustomStamp(false)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${!useCustomStamp ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
                            >
                              القالب الذكي
                            </button>
                            <button
                              onClick={() => setUseCustomStamp(true)}
                              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-all ${useCustomStamp ? "bg-white shadow-sm text-blue-600" : "text-slate-500"}`}
                            >
                              صورة PNG
                            </button>
                          </div>
                        </div>

                        {useCustomStamp && (
                          <div className="mb-4">
                            <input
                              type="file"
                              accept="image/png, image/jpeg"
                              ref={customStampInputRef}
                              onChange={handleCustomStampUpload}
                              className="hidden"
                            />
                            <div
                              onClick={() =>
                                customStampInputRef.current.click()
                              }
                              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all"
                            >
                              {customStampBase64 ? (
                                <img
                                  src={customStampBase64}
                                  alt="Custom"
                                  className="h-16 object-contain"
                                />
                              ) : (
                                <>
                                  <ImageIcon className="w-6 h-6 text-slate-400" />
                                  <span className="text-[10px] font-bold text-slate-500">
                                    اضغط لرفع صورة الختم
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-[10px] font-black text-slate-500 mb-2">
                              <span>تكبير/تصغير</span>{" "}
                              <span>{Math.round(stampScale * 100)}%</span>
                            </div>
                            <input
                              type="range"
                              min="0.05"
                              max="3"
                              step="0.05"
                              value={stampScale}
                              onChange={(e) =>
                                setStampScale(parseFloat(e.target.value))
                              }
                              className="w-full accent-blue-600"
                            />
                          </div>
                          <div className="pt-3 border-t border-slate-100 flex flex-col gap-3">
                            <button
                              onClick={duplicateStamp}
                              className="w-full py-2 bg-blue-50 text-blue-700 rounded-lg text-[10px] font-black flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                            >
                              <Copy className="w-3.5 h-3.5" /> إضافة نسخة أخرى
                            </button>
                            <label className="flex items-center gap-2 cursor-pointer mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                              <input
                                type="checkbox"
                                checked={applyToAllPages}
                                onChange={(e) =>
                                  setApplyToAllPages(e.target.checked)
                                }
                                className="w-4 h-4 accent-blue-600 rounded"
                              />
                              <span className="text-[10px] font-black text-slate-700">
                                تطبيق الأختام الحالية على كافة صفحات הـ PDF
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                        <h4 className="font-black text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3 mb-4">
                          <QrCode className="w-4 h-4 text-slate-400" /> ختم QR
                          المصغر
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
                              className="w-full accent-purple-600"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* 📄 Workspace (منطقة العمل) */}
                <div className="flex-1 flex justify-center items-start overflow-y-auto p-4 sm:p-8 custom-scrollbar bg-slate-300/30 relative">
                  {applyToAllPages && file?.type === "application/pdf" && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-lg z-[100] flex items-center gap-2 animate-bounce">
                      <Layers className="w-3 h-3" /> سيتم حرق هذه الأختام على
                      كافة الصفحات
                    </div>
                  )}

                  <div className="py-8 flex flex-col items-center">
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
                        <Document
                          file={file}
                          onLoadSuccess={onDocumentLoadSuccess}
                          className="pointer-events-none flex flex-col gap-4 bg-slate-200 p-4"
                        >
                          {Array.from(new Array(numPages || 1), (el, index) => (
                            <div
                              key={`page_${index + 1}`}
                              className="shadow-lg relative bg-white"
                            >
                              <Page
                                pageNumber={index + 1}
                                width={renderWidth}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                              />
                              <div className="absolute bottom-2 left-2 bg-slate-900/50 text-white text-[10px] px-2 py-0.5 rounded-md font-bold">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </Document>
                      ) : null}

                      {/* 💡 عرض الأختام مع إصلاح التشويه وخصائص Custom Image */}
                      {stampData &&
                        customStampsList.map((stamp, index) => (
                          <motion.div
                            key={stamp.id}
                            ref={(el) => (mainStampRefs.current[stamp.id] = el)}
                            drag
                            dragConstraints={constraintsRef}
                            dragMomentum={false}
                            initial={{
                              opacity: 0,
                              x: index * 20,
                              y: index * 20,
                            }}
                            animate={{
                              scale: stampScale,
                              rotate: stampRotation,
                              opacity: 1,
                            }}
                            style={{
                              originX: 0.5,
                              originY: 0.5,
                              top: "5%",
                              left: "30%",
                            }}
                            // 🚀 كلاسات منع التشويه
                            className="absolute w-72 h-max z-50 cursor-grab active:cursor-grabbing drop-shadow-2xl [&>div>svg]:w-full [&>div>svg]:h-auto"
                          >
                            {useCustomStamp && customStampBase64 ? (
                              // 💡 عرض الختم المخصص كصورة بدلاً من SVG
                              <img
                                src={customStampBase64}
                                alt="Custom Stamp"
                                className="w-full h-auto pointer-events-none object-contain"
                              />
                            ) : (
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: renderMainStampPreview(),
                                }}
                                className="pointer-events-none w-full"
                              />
                            )}
                            {customStampsList.length > 1 && (
                              <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm z-10">
                                {index + 1}
                              </div>
                            )}
                          </motion.div>
                        ))}

                      {/* الـ QR كالمعتاد */}
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
                            top: "5%",
                            left: "5%",
                          }}
                          className="absolute w-32 h-max z-50 cursor-grab active:cursor-grabbing drop-shadow-xl [&>div>svg]:w-full [&>div>svg]:h-auto"
                        >
                          <div
                            dangerouslySetInnerHTML={{
                              __html: renderQrStampPreview(),
                            }}
                            className="pointer-events-none w-full"
                          />
                        </motion.div>
                      )}
                    </div>
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
