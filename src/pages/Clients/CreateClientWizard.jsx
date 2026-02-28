import React, { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../../api/clientApi";
import axios from "../../api/axios";
import { toast } from "sonner";
import {
  Upload,
  SquarePen,
  CircleCheckBig,
  Star,
  Shield,
  X,
  User,
  Building,
  Users,
  UsersRound,
  FileCheck,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Download,
  Check,
  Trash2,
  CalendarDays,
  AlertTriangle,
  MapPin,
  Image as ImageIcon,
  FileText,
  ScanSearch,
  Clock,
  Landmark,
  UserPlus,
} from "lucide-react";

// ==========================================
// مكونات مساعدة
// ==========================================
const DualInputWithAI = ({
  labelAr,
  labelEn,
  valAr,
  valEn,
  onChangeAr,
  onChangeEn,
  aiConfidence,
}) => (
  <div className="grid grid-cols-2 gap-2">
    <div
      className={`p-2.5 rounded-lg border-2 transition-colors ${aiConfidence > 80 ? "bg-emerald-50 border-emerald-200" : "bg-white border-slate-200"}`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-bold text-slate-700">{labelAr}</label>
        {aiConfidence > 80 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            {aiConfidence}%
          </span>
        )}
      </div>
      <input
        type="text"
        value={valAr}
        onChange={(e) => onChangeAr(e.target.value)}
        className="w-full bg-transparent outline-none text-sm font-bold text-slate-800"
        dir="rtl"
        placeholder={labelAr}
      />
    </div>
    <div
      className={`p-2.5 rounded-lg border-2 transition-colors ${aiConfidence > 80 ? "bg-amber-50 border-amber-200" : "bg-white border-slate-200"}`}
    >
      <div className="flex justify-between items-center mb-1.5 flex-row-reverse">
        <label className="text-xs font-bold text-slate-700">{labelEn}</label>
        {aiConfidence > 80 && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
            {aiConfidence - 5}%
          </span>
        )}
      </div>
      <input
        type="text"
        value={valEn}
        onChange={(e) => onChangeEn(e.target.value)}
        className="w-full bg-transparent outline-none text-sm font-bold text-slate-800 text-left"
        dir="ltr"
        placeholder={labelEn}
      />
    </div>
  </div>
);

// 👈 دالة حساب الوقت المتبقي للوكالة
const getRemainingTime = (expiryDateString) => {
  if (!expiryDateString) return null;
  const expiryDate = new Date(expiryDateString);
  if (isNaN(expiryDate)) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0); // تصفير الوقت للمقارنة الدقيقة للأيام

  const diffTime = expiryDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0)
    return {
      expired: true,
      text: "منتهية الصلاحية",
      color: "bg-red-50 border-red-200 text-red-700",
    };
  if (diffDays === 0)
    return {
      expired: false,
      text: "تنتهي اليوم!",
      color: "bg-orange-50 border-orange-200 text-orange-700",
    };

  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  const days = (diffDays % 365) % 30;

  let textParts = [];
  if (years > 0) textParts.push(`${years} سنة`);
  if (months > 0) textParts.push(`${months} شهر`);
  if (days > 0) textParts.push(`${days} يوم`);

  const color =
    diffDays < 30
      ? "bg-orange-50 border-orange-200 text-orange-700"
      : "bg-emerald-50 border-emerald-200 text-emerald-700";

  return { expired: false, text: textParts.join(" و "), color };
};
// ==========================================
// 2. مكون بطاقة الوريث (ديناميكي مع AI مستقل)
// ==========================================
const HeirCard = ({
  heir,
  index,
  updateHeir,
  removeHeir,
  addDocumentToState,
}) => {
  // 👈 إضافة Prop جديد هنا
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleHeirAI = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const imageBase64 = reader.result;

      // 👈 1. إضافة الصورة فوراً إلى المرفقات العامة بنوع واضح
      if (addDocumentToState) {
        addDocumentToState(file, `هوية وريث (${index + 1})`, imageBase64);
      }

      try {
        // 2. إرسال الصورة للتحليل بالذكاء الاصطناعي
        const response = await axios.post("/clients/analyze-identity", {
          imageBase64,
          documentType: "هوية شخصية",
        });

        if (response.data?.success) {
          const aiData = response.data.data;
          // تجميع الاسم
          const fullName =
            `${aiData.firstAr || ""} ${aiData.fatherAr || ""} ${aiData.grandAr || ""} ${aiData.familyAr || ""}`
              .replace(/\s+/g, " ")
              .trim();

          updateHeir(index, "name", fullName);
          updateHeir(index, "idNumber", aiData.idNumber || "");
          updateHeir(index, "nationality", aiData.nationality || "سعودي");
          updateHeir(index, "birthDate", aiData.birthDate || "");
          toast.success(
            `تم استخراج بيانات الوريث (${index + 1}) وإرفاق الهوية بنجاح!`,
          ); // 👈 تحديث رسالة النجاح
        }
      } catch (error) {
        toast.error("فشل استخراج بيانات الوريث، ولكن تم إرفاق الملف."); // 👈 تنبيه أدق
      } finally {
        setIsScanning(false);
      }
    };
  };

  return (
    <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-xl relative group transition-all hover:shadow-sm">
      <div className="absolute top-3 left-3 flex gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="p-1.5 bg-white border border-amber-300 text-amber-700 rounded-md hover:bg-amber-100 transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
          title="استخراج بالذكاء الاصطناعي"
        >
          {isScanning ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ScanSearch className="w-3.5 h-3.5" />
          )}
          <span className="text-[10px] font-bold">
            قراءة وإرفاق الهوية (AI)
          </span>{" "}
          {/* 👈 تحديث النص */}
        </button>
        <button
          onClick={() => removeHeir(index)}
          className="p-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-md transition-colors shadow-sm"
          title="حذف الوريث"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleHeirAI}
        />
      </div>

      {/* باقي كود عرض بيانات الوريث يبقى كما هو */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
        <span className="text-sm font-bold text-slate-700">بيانات الوريث</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 block mb-1">
            الاسم الرباعي *
          </label>
          <input
            type="text"
            value={heir.name}
            onChange={(e) => updateHeir(index, "name", e.target.value)}
            className="w-full p-2 text-xs border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-white"
            placeholder="الاسم كما بالهوية"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">
            رقم الهوية *
          </label>
          <input
            type="text"
            value={heir.idNumber}
            onChange={(e) => updateHeir(index, "idNumber", e.target.value)}
            className="w-full p-2 text-xs border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-white font-mono"
            placeholder="10XXXXXXXX"
            dir="ltr"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold text-slate-500 block mb-1">
            تاريخ الميلاد / الجنسية
          </label>
          <div className="flex gap-1">
            <input
              type="text"
              value={heir.birthDate}
              onChange={(e) => updateHeir(index, "birthDate", e.target.value)}
              className="w-2/3 p-2 text-xs border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-white"
              placeholder="التاريخ"
            />
            <input
              type="text"
              value={heir.nationality}
              onChange={(e) => updateHeir(index, "nationality", e.target.value)}
              className="w-1/3 p-2 text-xs border border-amber-200 rounded-lg outline-none focus:border-amber-500 bg-white text-center"
              placeholder="سعودي"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const WIZARD_STEPS = [
  { id: 1, label: "طريقة الإنشاء" },
  { id: 2, label: "نوع العميل" },
  { id: 3, label: "البيانات الأساسية" },
  { id: 4, label: "العنوان الوطني" },
  { id: 5, label: "بيانات الاتصال" },
  { id: 6, label: "الوكيل/المفوض" },
  { id: 7, label: "الوثائق" },
];

// ==========================================
// المكون الرئيسي
// ==========================================
const CreateClientWizard = ({ onComplete }) => {
  const queryClient = useQueryClient();

  const identityInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const profilePicRef = useRef(null);
  const generalDocRef = useRef(null);
  const repIdRef = useRef(null);
  const repAuthRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState(null);
  const [isAnalyzingId, setIsAnalyzingId] = useState(false);
  const [isAnalyzingAddress, setIsAnalyzingAddress] = useState(false);
  const [isAnalyzingRepAuth, setIsAnalyzingRepAuth] = useState(false);
  const [isAnalyzingRepId, setIsAnalyzingRepId] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [useSameAsMobile, setUseSameAsMobile] = useState(true);
  const [isMobileUnavailable, setIsMobileUnavailable] = useState(false);

  // 👈 إضافة حالة لتخزين نوع الملف المرفوع للمعاينات
  const [previewFileType, setPreviewFileType] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewFileSize, setPreviewFileSize] = useState("");
  const [viewerScale, setViewerScale] = useState(1);
  const [viewerRotation, setViewerRotation] = useState(0);

  const [profilePicture, setProfilePicture] = useState(null);
  const [documents, setDocuments] = useState([]);
  // 👈 حالات أداة الضبط اليدوي للصورة
  const [showPicControls, setShowPicControls] = useState(false);
  const [picConfig, setPicConfig] = useState({ scale: 1, x: 0, y: 0 });

  const [formData, setFormData] = useState({
    documentType: "هوية شخصية",
    type: "فرد سعودي",
    name: {
      firstAr: "",
      fatherAr: "",
      grandAr: "",
      familyAr: "",
      firstEn: "",
      fatherEn: "",
      grandEn: "",
      familyEn: "",
    },
    heirs: [], // مصفوفة الورثة
    contact: {
      mobile: "",
      email: "",
      whatsapp: "",
      additionalPhone: "",
      notes: "",
    },
    identification: {
      idNumber: "",
      idType: "هوية وطنية",
      birthDate: "",
      placeOfBirth: "",
      age: "",
      birthDateGregorian: "",
      birthDateHijri: "",
      nationality: "سعودي",
    },
    address: {
      city: "",
      district: "",
      street: "",
      buildingNo: "",
      unitNo: "",
      zipCode: "",
      additionalNo: "",
      shortCodeAr: "",
      shortCodeEn: "",
    },
    representative: {
      hasRepresentative: false,
      type: "وكيل",
      name: "",
      idNumber: "",
      idExpiry: "",
      mobile: "",
      email: "",
      authNumber: "",
      authExpiry: "",
      authIssueDate: "",
      authIssuer: "",
      powersScope: "",
      notes: "",
    },
  });

  const handleChange = (section, field, value) => {
    if (section)
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    else setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (useSameAsMobile && !isMobileUnavailable)
      handleChange("contact", "whatsapp", formData.contact.mobile);
  }, [formData.contact.mobile, useSameAsMobile, isMobileUnavailable]);

  const addDocumentToState = (file, docType = "", base64Data = null) => {
    setDocuments((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: (file.size / 1024).toFixed(2),
        type: docType,
        privacy: "internal",
        version: "v1",
        base64: base64Data,
      },
    ]);
  };

  const removeDocument = (docId) =>
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));

  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setProfilePicture({ file, preview: reader.result, isFromAi: false });
    reader.readAsDataURL(file);
  };

  const handleIdentityUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzingId(true);
    setPreviewFileName(file.name);
    setPreviewFileSize((file.size / 1024).toFixed(1) + " KB");
    setPreviewFileType(file.type); // 👈 حفظ نوع الملف (pdf أو صورة)

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageBase64 = reader.result;
        setPreviewImage(imageBase64);
        addDocumentToState(file, "dt-001", imageBase64);

        // 👈 إذا كانت الصورة هوية واسم العميل سيكون (فرد)، نحفظ الصورة المرفوعة لتستخدم كصورة للملف في التاب 3
        if (file.type.startsWith("image/")) {
          setProfilePicture({
            file: null,
            preview: imageBase64,
            isFromAi: true,
          });
        }

        const response = await axios.post("/clients/analyze-identity", {
          imageBase64,
          documentType: formData.documentType,
        });

        if (response.data?.success) {
          setAiResults(response.data.data);
          toast.success("تم استخراج البيانات بنجاح!");
        }
      } catch (error) {
        toast.error("فشل استخراج البيانات من الهوية.");
        setPreviewImage(null);
      } finally {
        setIsAnalyzingId(false);
      }
    };
  };

  const handleAddressUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsAnalyzingAddress(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageBase64 = reader.result;
        addDocumentToState(file, "dt-009", imageBase64);
        const response = await axios.post("/clients/analyze-address", {
          imageBase64,
        });
        if (response.data?.success) {
          const ad = response.data.data;
          setFormData((prev) => ({
            ...prev,
            address: {
              ...prev.address,
              city: ad.city || prev.address.city,
              district: ad.district || prev.address.district,
              street: ad.street || prev.address.street,
              buildingNo: ad.buildingNo || prev.address.buildingNo,
              unitNo: ad.unitNo || prev.address.unitNo,
              zipCode: ad.zipCode || prev.address.zipCode,
              additionalNo: ad.additionalNo || prev.address.additionalNo,
              shortCodeAr: ad.shortCodeAr || prev.address.shortCodeAr,
              shortCodeEn: ad.shortCodeEn || prev.address.shortCodeEn,
            },
          }));
          toast.success("تم استخراج العنوان الوطني بنجاح!");
        }
      } catch (error) {
        toast.error("فشل استخراج العنوان.");
      } finally {
        setIsAnalyzingAddress(false);
      }
    };
  };

  const handleGeneralDocsUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => addDocumentToState(file, "", reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleRepDocUpload = (e, type, aiAnalyze = false) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    if (aiAnalyze) {
      const isAuthDoc = type.includes("مستند");
      if (isAuthDoc) setIsAnalyzingRepAuth(true);
      else setIsAnalyzingRepId(true);

      reader.onload = async () => {
        const base64Data = reader.result;
        addDocumentToState(file, type, base64Data);

        try {
          const response = await axios.post("/clients/analyze-representative", {
            imageBase64: base64Data,
            docType: isAuthDoc ? "وكالة" : "هوية",
          });

          if (response.data?.success) {
            const data = response.data.data;
            setFormData((prev) => ({
              ...prev,
              representative: {
                ...prev.representative,
                // تحديث الحقول إذا تم استخراجها بنجاح
                name: data.agentName || prev.representative.name,
                idNumber: data.agentIdNumber || prev.representative.idNumber,
                authNumber: data.authNumber || prev.representative.authNumber,
                authExpiry: data.authExpiry || prev.representative.authExpiry,
                idExpiry: data.idExpiry || prev.representative.idExpiry,
                powersScope:
                  data.powersScope || prev.representative.powersScope,
              },
            }));
            toast.success(`تم استخراج بيانات ${type} بنجاح!`);
          }
        } catch (error) {
          toast.error(`فشل في استخراج البيانات من ${type}`);
        } finally {
          if (isAuthDoc) setIsAnalyzingRepAuth(false);
          else setIsAnalyzingRepId(false);
        }
      };
    } else {
      reader.onload = () => {
        addDocumentToState(file, type, reader.result);
        toast.success(`تم إرفاق ${type} للممثل بنجاح`);
      };
    }

    reader.readAsDataURL(file);
  };

  const handleAcceptAIData = () => {
    if (aiResults) {
      setFormData((prev) => ({
        ...prev,
        identification: {
          ...prev.identification,
          idNumber: aiResults.idNumber || "",
          birthDate: aiResults.birthDate || "",
          placeOfBirth: aiResults.placeOfBirth || "",
          age: aiResults.age || "",
          birthDateGregorian: aiResults.birthDateGregorian || "",
          birthDateHijri: aiResults.birthDateHijri || "",
          nationality: aiResults.nationality || "سعودي",
        },
        name: {
          ...prev.name,
          firstAr: aiResults.firstAr || "",
          fatherAr: aiResults.fatherAr || "",
          grandAr: aiResults.grandAr || "",
          familyAr: aiResults.familyAr || "",
          firstEn: aiResults.firstEn || "",
          fatherEn: aiResults.fatherEn || "",
          grandEn: aiResults.grandEn || "",
          familyEn: aiResults.familyEn || "",
        },
      }));
    }
    nextStep();
  };

  const saveMutation = useMutation({
    mutationFn: async (formDataPayload) => {
      const res = await axios.post("/clients", formDataPayload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("تم حفظ العميل ومستنداته بنجاح!");
      queryClient.invalidateQueries(["clients"]);
      if (onComplete) onComplete();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ"),
  });

  const handleFinalSave = () => {
    const isHeirs = formData.type === "ورثة";
    const officialNameAr =
      `${formData.name.firstAr} ${formData.name.fatherAr} ${formData.name.grandAr} ${formData.name.familyAr}`
        .replace(/\s+/g, " ")
        .trim();
    const officialNameEn =
      `${formData.name.firstEn} ${formData.name.fatherEn} ${formData.name.grandEn} ${formData.name.familyEn}`
        .replace(/\s+/g, " ")
        .trim();

    if (
      !formData.name.firstAr ||
      !formData.identification.idNumber ||
      (!isMobileUnavailable && !formData.contact.mobile)
    ) {
      toast.error("يرجى التأكد من إدخال الاسم الأول، رقم الهوية، ورقم الجوال!");
      return;
    }

    // التحقق الإضافي للورثة
    if (isHeirs && formData.heirs.length === 0) {
      toast.error("يرجى إضافة وريث واحد على الأقل أو تغيير نوع العميل!");
      return;
    }

    const finalMobileNumber = isMobileUnavailable
      ? "غير متوفر"
      : formData.contact.mobile;
    const finalContactObj = { ...formData.contact, mobile: finalMobileNumber };
    const formDataToSend = new FormData();

    formDataToSend.append("mobile", finalMobileNumber);
    formDataToSend.append("email", formData.contact.email);
    formDataToSend.append("idNumber", formData.identification.idNumber);
    formDataToSend.append("type", formData.type);
    formDataToSend.append("officialNameAr", officialNameAr);
    formDataToSend.append(
      "name",
      JSON.stringify({
        ar: officialNameAr,
        en: officialNameEn,
        details: formData.name,
      }),
    );
    formDataToSend.append("contact", JSON.stringify(finalContactObj));
    formDataToSend.append("address", JSON.stringify(formData.address));
    formDataToSend.append(
      "identification",
      JSON.stringify(formData.identification),
    );
    formDataToSend.append(
      "representative",
      JSON.stringify(formData.representative),
    );
    if (isHeirs) {
      formDataToSend.append("heirs", JSON.stringify(formData.heirs));
    }
    formDataToSend.append("isActive", true);

    // نرفع الصورة الشخصية فقط إذا تم رفعها يدوياً. إذا كانت مأخوذة من الهوية لن نرفعها كملف منفصل لتوفير المساحة.
    if (profilePicture?.file && !profilePicture.isFromAi)
      formDataToSend.append("profilePicture", profilePicture.file);

    documents.forEach((doc, index) => {
      formDataToSend.append("files", doc.file);
      formDataToSend.append(`fileMeta_${index}_type`, doc.type);
      formDataToSend.append(`fileMeta_${index}_name`, doc.name);
      formDataToSend.append(`fileMeta_${index}_privacy`, doc.privacy);
    });

    saveMutation.mutate(formDataToSend);
  };

  const nextStep = () => currentStep < 7 && setCurrentStep((p) => p + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  // ==========================================
  // الريندر (Render Steps)
  // ==========================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            {!aiResults && !isAnalyzingId && !previewImage && (
              <>
                <h3 className="text-xl font-bold mb-2 text-slate-800">
                  طريقة إنشاء ملف العميل
                </h3>
                <p className="text-[13px] text-slate-500 mb-6">
                  يمكنك رفع وثيقة هوية العميل لاستخراج البيانات تلقائياً بالذكاء
                  الاصطناعي، أو الإدخال يدوياً
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div
                    onClick={() => setCreationMethod("ai")}
                    className={`p-7 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 text-center relative overflow-hidden shadow-sm hover:shadow-md ${creationMethod === "ai" ? "border-violet-500 ring-4 ring-violet-50 scale-[1.02]" : "border-slate-200 hover:border-violet-200"}`}
                  >
                    <div className="w-[72px] h-[72px] bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/30">
                      <Upload className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-[17px] font-bold text-slate-800 mb-2">
                      رفع وثيقة هوية (AI)
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed mb-3">
                      ارفع صورة أو ملف PDF لهوية العميل وسيتم استخراج البيانات
                      تلقائياً
                    </div>
                  </div>
                  <div
                    onClick={() => {
                      setCreationMethod("manual");
                      setAiResults(null);
                      nextStep();
                    }}
                    className={`p-7 bg-white border-2 rounded-2xl cursor-pointer transition-all duration-200 text-center relative overflow-hidden shadow-sm hover:shadow-md ${creationMethod === "manual" ? "border-emerald-500 ring-4 ring-emerald-50 scale-[1.02]" : "border-slate-200 hover:border-emerald-200"}`}
                  >
                    <div className="w-[72px] h-[72px] bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
                      <SquarePen className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-[17px] font-bold text-slate-800 mb-2">
                      إدخال يدوي
                    </div>
                    <div className="text-xs text-slate-500 leading-relaxed mb-3">
                      أدخل بيانات العميل يدوياً اختيار النوع ثم تعبئة الحقول
                    </div>
                  </div>
                </div>

                {creationMethod === "ai" && (
                  <div className="p-6 bg-violet-50/50 border border-violet-100 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-slate-700 mb-3">
                        نوع وثيقة الهوية المرفوعة *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          {
                            id: "هوية شخصية",
                            icon: "🪪",
                            desc: "هوية وطنية للسعوديين",
                          },
                          {
                            id: "سجل تجاري",
                            icon: "🏢",
                            desc: "سجل تجاري للشركات والمؤسسات",
                          },
                          {
                            id: "رقم وطني موحد",
                            icon: "🔢",
                            desc: "رقم الهوية الوطني الموحد (700)",
                          },
                          {
                            id: "رقم منشأة",
                            icon: "🏛️",
                            desc: "رقم منشأة لدى الجهات الحكومية",
                          },
                          {
                            id: "إقامة",
                            icon: "📋",
                            desc: "بطاقة إقامة لفرد غير سعودي",
                          },
                          {
                            id: "جواز سفر",
                            icon: "🛂",
                            desc: "جواز سفر لفرد غير سعودي",
                          },
                        ].map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() =>
                              handleChange(null, "documentType", doc.id)
                            }
                            className={`p-3 rounded-xl cursor-pointer text-center transition-all ${formData.documentType === doc.id ? "bg-white border-2 border-violet-500 shadow-sm scale-[1.02]" : "bg-white/60 border border-slate-200 hover:bg-white hover:border-violet-300"}`}
                          >
                            <div className="text-2xl mb-1.5">{doc.icon}</div>
                            <div className="text-[12px] font-bold text-slate-800">
                              {doc.id}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                              {doc.desc}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div
                      onClick={() => identityInputRef.current?.click()}
                      className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center bg-white cursor-pointer hover:bg-violet-50 transition-colors mt-4"
                    >
                      <Upload className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-700">
                        انقر هنا لرفع الوثيقة (PDF, JPG, PNG)
                      </p>
                      <input
                        type="file"
                        ref={identityInputRef}
                        className="hidden"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleIdentityUpload}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {isAnalyzingId && (
              <div className="flex flex-col items-center justify-center p-20 animate-in fade-in text-center">
                <Loader2 className="w-12 h-12 text-violet-600 animate-spin mb-4" />
                <h3 className="text-lg font-bold text-violet-900">
                  جاري قراءة وتحليل الوثيقة بالذكاء الاصطناعي...
                </h3>
                <p className="text-slate-500 mt-2 text-sm">
                  يرجى الانتظار، قد يستغرق هذا بضع ثوانٍ
                </p>
              </div>
            )}

            {!isAnalyzingId && aiResults && previewImage && (
              <div className="p-6 bg-purple-50/30 border-2 border-purple-200 rounded-2xl animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-2 mb-5 text-purple-700 font-bold text-[15px]">
                  <Shield className="w-5 h-5" /> رفع وثيقة هوية العميل
                </div>
                <div className="bg-emerald-50 border-2 border-dashed border-emerald-500 rounded-xl p-4 text-center mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <CircleCheckBig className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-800">
                        {previewFileName}
                      </div>
                      <div className="text-xs text-slate-500">
                        {previewFileSize}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setAiResults(null);
                      setPreviewImage(null);
                    }}
                    className="p-1.5 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-5">
                  <div className="bg-white border-2 border-emerald-100 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <CircleCheckBig className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-[15px] font-bold text-slate-800">
                            نتائج الاستخراج الذكي
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            دقة:{" "}
                            <span className="font-bold text-emerald-600">
                              97%
                            </span>{" "}
                            — نوع العميل:{" "}
                            <span className="font-bold text-violet-600">
                              {formData.documentType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[11px] font-bold">
                        مكتمل
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      {[
                        { label: "الاسم الأول (عربي)", val: aiResults.firstAr },
                        { label: "اسم الأب (عربي)", val: aiResults.fatherAr },
                        { label: "اسم الجد (عربي)", val: aiResults.grandAr },
                        {
                          label: "اسم العائلة (عربي)",
                          val: aiResults.familyAr,
                        },
                        {
                          label: "الاسم الأول (إنجليزي)",
                          val: aiResults.firstEn,
                          en: true,
                        },
                        {
                          label: "اسم الأب (إنجليزي)",
                          val: aiResults.fatherEn,
                          en: true,
                        },
                        {
                          label: "اسم الجد (إنجليزي)",
                          val: aiResults.grandEn,
                          en: true,
                        },
                        {
                          label: "اسم العائلة (إنجليزي)",
                          val: aiResults.familyEn,
                          en: true,
                        },
                        {
                          label: "رقم الهوية",
                          val: aiResults.idNumber,
                          full: true,
                        },
                        {
                          label: "تاريخ الميلاد هجري",
                          val: aiResults.birthDateHijri,
                          full: true,
                        },
                        {
                          label: "تاريخ الميلاد ميلادي",
                          val: aiResults.birthDateGregorian,
                          full: true,
                        },
                        { label: "العمر", val: aiResults.age, full: true },
                        {
                          label: "مكان الميلاد",
                          val: aiResults.placeOfBirth,
                          full: true,
                        },
                        {
                          label: "الجنسية",
                          val: aiResults.nationality,
                          full: true,
                        },
                      ].map((field, idx) =>
                        field.val ? (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border ${field.en ? "bg-amber-50/50 border-amber-200" : "bg-emerald-50/50 border-emerald-200"} ${field.full ? "col-span-2" : ""}`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[11px] font-bold text-slate-500">
                                {field.label}
                              </span>
                              <span
                                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${field.en ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}
                              >
                                AI
                              </span>
                            </div>
                            <div
                              className={`text-sm font-bold text-slate-800 ${field.en || field.label.includes("رقم") ? "dir-ltr text-left" : ""}`}
                            >
                              {field.val}
                            </div>
                          </div>
                        ) : null,
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleAcceptAIData}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg flex justify-center items-center gap-2 transition-all"
                      >
                        <CircleCheckBig className="w-5 h-5" /> اعتماد ومتابعة
                      </button>
                      <button
                        onClick={() => {
                          setAiResults(null);
                          setPreviewImage(null);
                        }}
                        className="px-5 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors"
                      >
                        إعادة المحاولة
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <div className="mb-2">
                      <h4 className="text-sm font-bold text-slate-800">
                        معاينة المستند المرفوع
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        طابق البيانات المستخرجة مع الوثيقة بصرياً
                      </p>
                    </div>
                    {/* 👈 تعديل العارض لدعم PDF */}
                    <div className="flex-1 bg-slate-800 rounded-xl overflow-hidden relative flex flex-col min-h-[400px] border border-slate-700 shadow-inner">
                      <div className="flex justify-between items-center px-3 py-2 bg-slate-900 border-b border-slate-700 z-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-200 font-bold truncate max-w-[120px]">
                            {previewFileName}
                          </span>
                          <span className="text-[9px] text-slate-400 bg-slate-700 px-2 py-0.5 rounded uppercase">
                            {previewFileType?.split("/")[1] || "DOC"}
                          </span>
                        </div>
                        {previewFileType?.startsWith("image/") && (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                setViewerScale((s) => Math.max(0.5, s - 0.2))
                              }
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white"
                              title="تصغير"
                            >
                              <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setViewerScale(1);
                                setViewerRotation(0);
                              }}
                              className="px-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-[10px] font-bold"
                              title="إعادة تعيين"
                            >
                              100%
                            </button>
                            <button
                              onClick={() =>
                                setViewerScale((s) => Math.min(3, s + 0.2))
                              }
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white"
                              title="تكبير"
                            >
                              <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setViewerRotation((r) => r + 90)}
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded text-white ml-1"
                              title="تدوير"
                            >
                              <RotateCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 flex items-center justify-center overflow-hidden relative select-none w-full h-full bg-white">
                        {previewFileType === "application/pdf" ? (
                          <embed
                            src={previewImage}
                            type="application/pdf"
                            width="100%"
                            height="100%"
                            className="w-full h-full"
                          />
                        ) : (
                          <img
                            src={previewImage}
                            alt="Document Preview"
                            draggable="false"
                            className="max-w-full max-h-full transition-transform duration-200 object-contain"
                            style={{
                              transform: `scale(${viewerScale}) rotate(${viewerRotation}deg)`,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-6 text-slate-800">
              اختر نوع العميل
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { id: "فرد سعودي", icon: Users, color: "emerald" },
                { id: "فرد غير سعودي", icon: Users, color: "blue" },
                {
                  id: "شركة",
                  label: "شركة/مؤسسة",
                  icon: Building,
                  color: "violet",
                },
                { id: "جهة حكومية", icon: Building, color: "red" },
                { id: "ورثة", icon: UsersRound, color: "amber" },
                {
                  id: "مكتب هندسي",
                  label: "مكتب هندسي/وسيط",
                  icon: Building,
                  color: "cyan",
                },
                {
                  id: "وقف",
                  label: "وقف (نظارة)",
                  icon: Landmark,
                  color: "teal",
                }, // 👈 إضافة نوع الوقف
              ].map((type) => {
                const isSelected = formData.type === type.id;
                const colors = {
                  emerald: {
                    bg: "bg-emerald-50 text-emerald-500",
                    border: "border-emerald-500 ring-emerald-50",
                  },
                  blue: {
                    bg: "bg-blue-50 text-blue-500",
                    border: "border-blue-500 ring-blue-50",
                  },
                  violet: {
                    bg: "bg-violet-50 text-violet-500",
                    border: "border-violet-500 ring-violet-50",
                  },
                  red: {
                    bg: "bg-red-50 text-red-500",
                    border: "border-red-500 ring-red-50",
                  },
                  amber: {
                    bg: "bg-amber-50 text-amber-500",
                    border: "border-amber-500 ring-amber-50",
                  },
                  cyan: {
                    bg: "bg-cyan-50 text-cyan-500",
                    border: "border-cyan-500 ring-cyan-50",
                  },
                  teal: {
                    bg: "bg-teal-50 text-teal-500",
                    border: "border-teal-500 ring-teal-50",
                  }, // 👈 لون الوقف
                }[type.color];

                return (
                  <div
                    key={type.id}
                    onClick={() => handleChange(null, "type", type.id)}
                    className={`p-6 bg-white border-2 rounded-xl cursor-pointer transition-all duration-200 text-center shadow-sm hover:shadow-md ${isSelected ? `${colors.border} scale-105 ring-4` : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div
                      className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${colors.bg}`}
                    >
                      <type.icon className="w-8 h-8" />
                    </div>
                    <div className="text-base font-bold text-slate-800">
                      {type.label || type.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      // ==========================================
      // 👈 الخطوة 3: معالجة (وقف) و (ورثة) بديناميكية
      // ==========================================
      case 3:
        const currentAge = formData.identification.age
          ? parseInt(formData.identification.age)
          : null;
        const isWarningAge =
          currentAge !== null && (currentAge > 85 || currentAge < 18);

        // المتغيرات الذكية للتحكم بالواجهة
        const isWaqf = formData.type === "وقف";
        const isHeirs = formData.type === "ورثة";
        const isCompany = ["شركة", "جهة حكومية", "مكتب هندسي", "وقف"].includes(
          formData.type,
        );

        // ضبط مسميات الحقول بناءً على النوع
        const labelNameAr1 = isWaqf
          ? "اسم الوقف *"
          : isHeirs
            ? "اسم المورث (المتوفى) *"
            : "الاسم الأول / الشركة *";
        const labelNameEn1 = isWaqf
          ? "Waqf Name *"
          : isHeirs
            ? "Deceased Name *"
            : "First Name / Company *";

        const labelNameAr2 = isWaqf ? "اسم الناظر (الأول)" : "اسم الأب";
        const labelNameAr3 = isWaqf ? "اسم الناظر (الأب)" : "اسم الجد";
        const labelNameAr4 = isWaqf ? "عائلة الناظر" : "اسم العائلة *";

        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-4 text-slate-800">
              {isWaqf
                ? "بيانات الوقف والناظر"
                : isHeirs
                  ? "بيانات المورث والورثة"
                  : "البيانات الأساسية"}
            </h3>

            {aiResults && (
              <div className="p-3 bg-violet-50 rounded-lg mb-5 flex items-center gap-2 border border-violet-100">
                <Star className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-violet-800 font-bold">
                  الحقول المحاطة بإطار أخضر تم استخراجها عبر الذكاء الاصطناعي
                  بدقة.
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* صورة الملف */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <label className="block text-[13px] font-bold mb-2 text-slate-700 w-full text-right">
                  {isCompany ? "شعار المنشأة" : "صورة العميل"}
                </label>

                <div className="relative">
                  <div className="w-[120px] h-[140px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center overflow-hidden relative group shadow-inner">
                    {profilePicture ? (
                      <>
                        <img
                          src={profilePicture.preview}
                          alt="Profile"
                          className="w-full h-full origin-center"
                          style={{
                            objectFit: "cover",
                            transform: `scale(${picConfig.scale}) translate(${picConfig.x}px, ${picConfig.y}px)`,
                            transition: showPicControls
                              ? "none"
                              : "transform 0.2s ease-out",
                          }}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPicControls(!showPicControls);
                            }}
                            className="px-3 py-1.5 bg-violet-500 hover:bg-violet-600 rounded-lg text-[11px] text-white font-bold transition-colors flex items-center gap-1"
                          >
                            ✂️ ضبط الصورة
                          </button>
                          <button
                            onClick={() => profilePicRef.current?.click()}
                            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-[11px] text-white font-bold transition-colors flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" /> تغيير
                          </button>
                        </div>
                      </>
                    ) : (
                      <div
                        onClick={() => profilePicRef.current?.click()}
                        className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-100 transition-colors"
                      >
                        {isCompany ? (
                          <Building className="w-8 h-8 text-slate-300 mb-2" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-slate-300 mb-2" />
                        )}
                        <span className="text-[11px] text-slate-500 font-bold text-center px-2">
                          {isCompany
                            ? "رفع الشعار (اختياري)"
                            : "لقطة من الهوية"}
                        </span>
                      </div>
                    )}
                    <input
                      type="file"
                      ref={profilePicRef}
                      className="hidden"
                      accept="image/png, image/jpeg"
                      onChange={(e) => {
                        handleProfilePicUpload(e);
                        setPicConfig({ scale: 1, x: 0, y: 0 });
                        setShowPicControls(true);
                      }}
                    />
                  </div>

                  {profilePicture && showPicControls && (
                    <div className="absolute top-[150px] right-[-40px] w-[200px] bg-white border border-slate-200 rounded-xl shadow-xl p-3 z-50 animate-in fade-in zoom-in-95">
                      <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-bold text-slate-700">
                          أبعاد الصورة
                        </span>
                        <button
                          onClick={() => setPicConfig({ scale: 1, x: 0, y: 0 })}
                          className="text-[9px] text-blue-600 hover:underline font-bold"
                        >
                          إعادة تعيين
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                            <span>تكبير/تصغير</span>
                            <span>{picConfig.scale}x</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="4"
                            step="0.1"
                            value={picConfig.scale}
                            onChange={(e) =>
                              setPicConfig((p) => ({
                                ...p,
                                scale: parseFloat(e.target.value),
                              }))
                            }
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                            <span>ارتفاع (عمودي)</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={picConfig.y}
                            onChange={(e) =>
                              setPicConfig((p) => ({
                                ...p,
                                y: parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between text-[9px] text-slate-500 mb-1">
                            <span>إزاحة (أفقي)</span>
                          </div>
                          <input
                            type="range"
                            min="-100"
                            max="100"
                            value={picConfig.x}
                            onChange={(e) =>
                              setPicConfig((p) => ({
                                ...p,
                                x: parseInt(e.target.value),
                              }))
                            }
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPicControls(false)}
                        className="w-full mt-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition-colors"
                      >
                        تم الضبط
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* حقول الاسم الديناميكية */}
              <div className="flex-1 space-y-3">
                <div
                  className={`p-2.5 rounded-lg flex items-center gap-2 mb-2 ${isWaqf ? "bg-teal-50 border border-teal-200 text-teal-800" : isHeirs ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-slate-50 border border-slate-200 text-slate-700"}`}
                >
                  {isWaqf ? (
                    <Landmark className="w-4 h-4" />
                  ) : isHeirs ? (
                    <UsersRound className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="text-xs font-bold">
                    {isWaqf
                      ? "البيانات الرئيسية للوقف"
                      : isHeirs
                        ? "بيانات المورث (صاحب التركة)"
                        : "الاسم الرباعي — عربي / إنجليزي"}
                  </span>
                </div>

                <DualInputWithAI
                  labelAr={labelNameAr1}
                  labelEn={labelNameEn1}
                  valAr={formData.name.firstAr}
                  valEn={formData.name.firstEn}
                  onChangeAr={(v) => handleChange("name", "firstAr", v)}
                  onChangeEn={(v) => handleChange("name", "firstEn", v)}
                  aiConfidence={
                    aiResults?.firstAr ? aiResults.confidence : null
                  }
                />

                {/* إخفاء باقي الأسماء في حالة الورثة فقط */}
                {!isHeirs && (
                  <>
                    <DualInputWithAI
                      labelAr={labelNameAr2}
                      labelEn="Father Name"
                      valAr={formData.name.fatherAr}
                      valEn={formData.name.fatherEn}
                      onChangeAr={(v) => handleChange("name", "fatherAr", v)}
                      onChangeEn={(v) => handleChange("name", "fatherEn", v)}
                      aiConfidence={
                        aiResults?.fatherAr ? aiResults.confidence : null
                      }
                    />
                    <DualInputWithAI
                      labelAr={labelNameAr3}
                      labelEn="Grandfather"
                      valAr={formData.name.grandAr}
                      valEn={formData.name.grandEn}
                      onChangeAr={(v) => handleChange("name", "grandAr", v)}
                      onChangeEn={(v) => handleChange("name", "grandEn", v)}
                      aiConfidence={
                        aiResults?.grandAr ? aiResults.confidence : null
                      }
                    />
                    <DualInputWithAI
                      labelAr={labelNameAr4}
                      labelEn="Family Name *"
                      valAr={formData.name.familyAr}
                      valEn={formData.name.familyEn}
                      onChangeAr={(v) => handleChange("name", "familyAr", v)}
                      onChangeEn={(v) => handleChange("name", "familyEn", v)}
                      aiConfidence={
                        aiResults?.familyAr ? aiResults.confidence : null
                      }
                    />
                  </>
                )}
              </div>
            </div>

            {/* قسم الهوية الرئيسي للملف */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5 mb-5">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  {isWaqf
                    ? "رقم صك الوقفية / السجل *"
                    : isHeirs
                      ? "رقم هوية المورث *"
                      : "رقم الهوية/السجل *"}
                </label>
                <input
                  type="text"
                  value={formData.identification.idNumber}
                  onChange={(e) =>
                    handleChange("identification", "idNumber", e.target.value)
                  }
                  className={`w-full p-2.5 rounded-lg text-sm border-2 outline-none focus:border-violet-500 ${aiResults?.idNumber ? "border-emerald-300 bg-emerald-50 font-bold" : "border-slate-200"}`}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الجنسية
                </label>
                <input
                  type="text"
                  value={formData.identification.nationality}
                  onChange={(e) =>
                    handleChange(
                      "identification",
                      "nationality",
                      e.target.value,
                    )
                  }
                  className={`w-full p-2.5 rounded-lg text-sm border-2 outline-none focus:border-violet-500 ${aiResults?.nationality ? "border-emerald-300 bg-emerald-50 font-bold" : "border-slate-200 bg-white"}`}
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  مكان الميلاد / التأسيس
                </label>
                <div className="relative">
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.identification.placeOfBirth}
                    onChange={(e) =>
                      handleChange(
                        "identification",
                        "placeOfBirth",
                        e.target.value,
                      )
                    }
                    className={`w-full pr-9 pl-3 py-2.5 rounded-lg text-sm border-2 outline-none focus:border-violet-500 ${aiResults?.placeOfBirth ? "border-emerald-300 bg-emerald-50 font-bold" : "border-slate-200 bg-white"}`}
                    placeholder="مثال: الرياض"
                  />
                </div>
              </div>
            </div>

            {/* مربع التاريخ والعمر الرئيسي */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6 items-center mb-6">
              <div className="md:col-span-2 space-y-3">
                <div>
                  <label className="text-xs font-bold mb-1.5 flex items-center gap-2 text-slate-700">
                    تاريخ الميلاد (هجري) {isHeirs && "للمتوفى"}
                  </label>
                  <input
                    type="text"
                    value={formData.identification.birthDateHijri}
                    onChange={(e) =>
                      handleChange(
                        "identification",
                        "birthDateHijri",
                        e.target.value,
                      )
                    }
                    placeholder="مثال: 1405/06/15"
                    className={`w-full p-2.5 rounded-lg text-sm border-2 outline-none focus:border-violet-500 text-left ${aiResults?.birthDateHijri ? "border-emerald-300 bg-emerald-50 font-bold" : "border-slate-200 bg-white"}`}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold mb-1.5 flex items-center gap-2 text-slate-700">
                    تاريخ الميلاد (ميلادي) {isHeirs && "للمتوفى"}
                  </label>
                  <input
                    type="text"
                    value={formData.identification.birthDateGregorian}
                    onChange={(e) =>
                      handleChange(
                        "identification",
                        "birthDateGregorian",
                        e.target.value,
                      )
                    }
                    placeholder="مثال: 1985/02/05"
                    className={`w-full p-2.5 rounded-lg text-sm border-2 outline-none focus:border-violet-500 text-left ${aiResults?.birthDateGregorian ? "border-emerald-300 bg-emerald-50 font-bold" : "border-slate-200 bg-white"}`}
                    dir="ltr"
                  />
                </div>
              </div>
              <div className="md:col-span-1 h-full">
                <div
                  className={`h-full p-3 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-colors ${isWarningAge ? "bg-red-50 border-red-200" : currentAge !== null ? "bg-white border-violet-200 shadow-sm" : "bg-slate-100 border-slate-200 opacity-50"}`}
                >
                  <span className="text-[10px] font-bold text-slate-500 mb-1">
                    العمر التقريبي
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-3xl font-black ${isWarningAge ? "text-red-600" : "text-violet-700"}`}
                    >
                      {currentAge !== null ? currentAge : "--"}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      سنة
                    </span>
                  </div>
                  {isWarningAge && (
                    <div className="mt-2 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-md leading-tight">
                      يرجى الانتباه للعمر!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 👈 قسم إضافة الورثة الديناميكي يظهر فقط إذا كان النوع "ورثة" */}
            {isHeirs && (
              <div className="mt-8 border-t-2 border-amber-100 pt-6 animate-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center mb-5">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <UsersRound className="w-5 h-5 text-amber-700" />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900">
                        سجل الورثة المستفيدين
                      </h4>
                      <p className="text-[10px] text-amber-700 font-bold mt-0.5">
                        يمكنك إضافة أي عدد من الورثة واستخراج بيانات هوياتهم
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      const newHeirs = [
                        ...formData.heirs,
                        {
                          name: "",
                          idNumber: "",
                          nationality: "سعودي",
                          birthDate: "",
                          documentType: "هوية شخصية",
                        },
                      ];
                      handleChange(null, "heirs", newHeirs);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> إضافة وريث جديد
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.heirs.length === 0 ? (
                    <div className="text-center py-10 bg-amber-50/50 border border-dashed border-amber-200 rounded-xl">
                      <UsersRound className="w-10 h-10 text-amber-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-amber-600">
                        لم يتم إضافة أي ورثة بعد. اضغط على الزر أعلاه للبدء.
                      </p>
                    </div>
                  ) : (
                    formData.heirs.map((heir, index) => (
                      <HeirCard
                        key={index}
                        heir={heir}
                        index={index}
                        updateHeir={(idx, fld, val) => {
                          const newHeirs = [...formData.heirs];
                          newHeirs[idx][fld] = val;
                          handleChange(null, "heirs", newHeirs);
                        }}
                        removeHeir={(idx) => {
                          const newHeirs = formData.heirs.filter(
                            (_, i) => i !== idx,
                          );
                          handleChange(null, "heirs", newHeirs);
                        }}
                        addDocumentToState={addDocumentToState}
                      />
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                العنوان الوطني
              </h3>
              <button
                onClick={() => addressInputRef.current?.click()}
                disabled={isAnalyzingAddress}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
              >
                {isAnalyzingAddress ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> جاري
                    الاستخراج...
                  </>
                ) : (
                  <>
                    <Star className="w-4 h-4" /> استخراج من مستند
                  </>
                )}
              </button>
              <input
                type="file"
                ref={addressInputRef}
                className="hidden"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleAddressUpload}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  المدينة *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleChange("address", "city", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الحي *
                </label>
                <input
                  type="text"
                  value={formData.address.district}
                  onChange={(e) =>
                    handleChange("address", "district", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الشارع
                </label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    handleChange("address", "street", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  رقم المبنى
                </label>
                <input
                  type="text"
                  value={formData.address.buildingNo}
                  onChange={(e) =>
                    handleChange("address", "buildingNo", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  رقم الوحدة
                </label>
                <input
                  type="text"
                  value={formData.address.unitNo}
                  onChange={(e) =>
                    handleChange("address", "unitNo", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الرمز البريدي
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) =>
                    handleChange("address", "zipCode", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الرقم الإضافي
                </label>
                <input
                  type="text"
                  value={formData.address.additionalNo}
                  onChange={(e) =>
                    handleChange("address", "additionalNo", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الرمز المختصر (عربي)
                </label>
                <input
                  type="text"
                  value={formData.address.shortCodeAr}
                  onChange={(e) =>
                    handleChange("address", "shortCodeAr", e.target.value)
                  }
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الرمز المختصر (English)
                </label>
                <input
                  type="text"
                  value={formData.address.shortCodeEn}
                  onChange={(e) =>
                    handleChange("address", "shortCodeEn", e.target.value)
                  }
                  dir="ltr"
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm text-left"
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-5 text-slate-800">
              بيانات الاتصال والتواصل
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    رقم الجوال (للاتصال) {isMobileUnavailable ? "" : "*"}
                  </label>
                  <label className="text-[11px] flex items-center gap-1.5 cursor-pointer text-slate-600 font-bold hover:text-red-600">
                    <input
                      type="checkbox"
                      checked={isMobileUnavailable}
                      onChange={(e) => {
                        setIsMobileUnavailable(e.target.checked);
                        if (e.target.checked) {
                          handleChange("contact", "mobile", "");
                          setUseSameAsMobile(false);
                        }
                      }}
                      className="rounded text-red-600 w-3.5 h-3.5"
                    />
                    رقم الاتصال غير متوفر
                  </label>
                </div>
                <input
                  type="tel"
                  value={formData.contact.mobile}
                  onChange={(e) =>
                    handleChange("contact", "mobile", e.target.value)
                  }
                  disabled={isMobileUnavailable}
                  dir="ltr"
                  className={`w-full p-2.5 border-2 outline-none rounded-lg text-sm text-left font-bold transition-colors ${
                    isMobileUnavailable
                      ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 focus:border-violet-500 bg-white"
                  }`}
                  placeholder={isMobileUnavailable ? "غير متوفر" : "05XXXXXXXX"}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    رقم الواتساب
                  </label>
                  <label
                    className={`text-[11px] flex items-center gap-1.5 cursor-pointer font-bold ${isMobileUnavailable ? "text-slate-400 opacity-50" : "text-slate-600 hover:text-violet-600"}`}
                  >
                    <input
                      type="checkbox"
                      checked={useSameAsMobile && !isMobileUnavailable}
                      onChange={(e) => setUseSameAsMobile(e.target.checked)}
                      disabled={isMobileUnavailable}
                      className="rounded text-violet-600 w-3.5 h-3.5 disabled:opacity-50"
                    />{" "}
                    نفس الجوال
                  </label>
                </div>
                <input
                  type="tel"
                  value={formData.contact.whatsapp}
                  onChange={(e) =>
                    handleChange("contact", "whatsapp", e.target.value)
                  }
                  disabled={useSameAsMobile && !isMobileUnavailable}
                  dir="ltr"
                  className={`w-full p-2.5 border-2 outline-none rounded-lg text-sm text-left font-bold ${
                    useSameAsMobile && !isMobileUnavailable
                      ? "bg-slate-100 border-slate-200 text-slate-500"
                      : "border-slate-200 focus:border-violet-500 bg-white"
                  }`}
                  placeholder="05XXXXXXXX"
                />
              </div>

              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) =>
                    handleChange("contact", "email", e.target.value)
                  }
                  dir="ltr"
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm text-left"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  هاتف إضافي
                </label>
                <input
                  type="tel"
                  value={formData.contact.additionalPhone}
                  onChange={(e) =>
                    handleChange("contact", "additionalPhone", e.target.value)
                  }
                  dir="ltr"
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm text-left"
                  placeholder="01XXXXXXXX"
                />
              </div>
            </div>
          </div>
        );
      case 6:
        const { hasRepresentative, type: repType } = formData.representative;
        const repIdDoc = documents.find((d) => d.type === `هوية ${repType}`);
        const repAuthDoc = documents.find((d) => d.type === `مستند ${repType}`);

        // حساب العداد الزمني للوكالة
        const authRemainingTime = getRemainingTime(
          formData.representative.authExpiry,
        );

        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px] animate-in fade-in">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                الوكيل / المفوض
              </h3>
              <p className="text-[13px] text-slate-500">
                حدد إذا كان هناك وكيل شرعي أو مفوض ينوب عن العميل، مع إضافة
                البيانات والصور
              </p>
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm mb-4">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-sm font-bold text-slate-800">
                    يوجد وكيل أو مفوض؟
                  </div>
                  <div className="text-[10px] text-slate-400">
                    في حال وجود شخص مخول بالتعامل نيابة عن العميل
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleChange("representative", "hasRepresentative", false)
                  }
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!hasRepresentative ? "bg-slate-200 text-slate-700" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  لا
                </button>
                <button
                  onClick={() =>
                    handleChange("representative", "hasRepresentative", true)
                  }
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${hasRepresentative ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}
                >
                  نعم
                </button>
              </div>
            </div>

            {hasRepresentative && (
              <div className="bg-white rounded-xl border-2 border-blue-200 shadow-sm overflow-hidden animate-in slide-in-from-top-2">
                <div className="w-full flex items-center justify-between p-3.5 bg-gradient-to-l from-blue-50 to-indigo-50 border-b border-blue-200">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div className="text-sm font-bold text-blue-900">
                      بيانات {repType}
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-6">
                  {/* اختيار نوع الممثل */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 mb-1.5 block">
                      نوع الممثل
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          handleChange("representative", "type", "وكيل")
                        }
                        className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${repType === "وكيل" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${repType === "وكيل" ? "border-blue-500" : "border-slate-300"}`}
                        >
                          {repType === "وكيل" && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-800">
                            وكيل
                          </div>
                          <div className="text-[9px] text-slate-400">
                            وكالة شرعية
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={() =>
                          handleChange("representative", "type", "مفوض")
                        }
                        className={`flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${repType === "مفوض" ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${repType === "مفوض" ? "border-blue-500" : "border-slate-300"}`}
                        >
                          {repType === "مفوض" && (
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-bold text-slate-800">
                            مفوض
                          </div>
                          <div className="text-[9px] text-slate-400">
                            تفويض/خطاب
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 👈 قسم مستند التفويض/الوكالة والذكاء الاصطناعي */}
                  <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-indigo-900">
                        <FileCheck className="w-4 h-4" /> بيانات وثيقة{" "}
                        {repType === "وكيل" ? "الوكالة" : "التفويض"}
                      </div>
                      <button
                        onClick={() => repAuthRef.current?.click()}
                        disabled={isAnalyzingRepAuth}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-70"
                      >
                        {isAnalyzingRepAuth ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ScanSearch className="w-3.5 h-3.5" />
                        )}
                        استخراج البيانات بالـ AI
                      </button>
                      <input
                        type="file"
                        ref={repAuthRef}
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) =>
                          handleRepDocUpload(e, `مستند ${repType}`, true)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          رقم المستند *
                        </label>
                        <input
                          type="text"
                          value={formData.representative.authNumber}
                          onChange={(e) =>
                            handleChange(
                              "representative",
                              "authNumber",
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 text-sm border-2 border-slate-200 rounded-lg outline-none font-mono focus:border-indigo-500"
                          dir="ltr"
                        />
                      </div>

                      {/* 👈 حقل تاريخ الانتهاء مع العداد الزمني */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          تاريخ الانتهاء (ميلادي) *
                        </label>
                        <div className="flex gap-2 h-10">
                          <input
                            type="date"
                            value={formData.representative.authExpiry}
                            onChange={(e) =>
                              handleChange(
                                "representative",
                                "authExpiry",
                                e.target.value,
                              )
                            }
                            className="flex-1 px-3 text-sm border-2 border-slate-200 rounded-lg outline-none focus:border-indigo-500"
                            dir="ltr"
                          />
                          {authRemainingTime && (
                            <div
                              className={`px-3 flex items-center justify-center gap-1.5 rounded-lg border-2 text-[10px] font-bold whitespace-nowrap ${authRemainingTime.color}`}
                            >
                              {authRemainingTime.expired ? (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {authRemainingTime.text}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          نطاق الصلاحيات والبنود
                        </label>
                        <textarea
                          value={formData.representative.powersScope}
                          onChange={(e) =>
                            handleChange(
                              "representative",
                              "powersScope",
                              e.target.value,
                            )
                          }
                          className="w-full h-20 px-3 py-2 text-xs border-2 border-slate-200 rounded-lg outline-none resize-none focus:border-indigo-500 leading-relaxed"
                          placeholder="أدخل ملخص الصلاحيات الممنوحة للوكيل..."
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* 👈 قسم بيانات الممثل وهوية الذكاء الاصطناعي */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                        <User className="w-4 h-4 text-slate-500" /> بيانات{" "}
                        {repType} الشخصية
                      </div>
                      <button
                        onClick={() => repIdRef.current?.click()}
                        disabled={isAnalyzingRepId}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-100 transition-all disabled:opacity-70 shadow-sm"
                      >
                        {isAnalyzingRepId ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <ScanSearch className="w-3.5 h-3.5" />
                        )}
                        قراءة الهوية (AI)
                      </button>
                      <input
                        type="file"
                        ref={repIdRef}
                        className="hidden"
                        accept=".pdf,image/*"
                        onChange={(e) =>
                          handleRepDocUpload(e, `هوية ${repType}`, true)
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          الاسم (كما بالهوية) *
                        </label>
                        <input
                          type="text"
                          value={formData.representative.name}
                          onChange={(e) =>
                            handleChange(
                              "representative",
                              "name",
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                          placeholder="الاسم الكامل"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          رقم الهوية/الإقامة *
                        </label>
                        <input
                          type="text"
                          value={formData.representative.idNumber}
                          onChange={(e) =>
                            handleChange(
                              "representative",
                              "idNumber",
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-mono"
                          placeholder="10XXXXXXXX"
                          dir="ltr"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          تاريخ انتهاء الهوية
                        </label>
                        <input
                          type="date"
                          value={formData.representative.idExpiry}
                          onChange={(e) =>
                            handleChange(
                              "representative",
                              "idExpiry",
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none"
                          dir="ltr"
                        />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          رقم الجوال
                        </label>
                        <input
                          type="tel"
                          value={formData.representative.mobile}
                          onChange={(e) =>
                            handleChange(
                              "representative",
                              "mobile",
                              e.target.value,
                            )
                          }
                          className="w-full h-10 px-3 text-sm border-2 border-slate-200 rounded-lg focus:border-blue-500 outline-none font-mono"
                          placeholder="05XXXXXXXX"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      // ==========================================
      // 👈 الخطوة 7: الوثائق والمرفقات العامة (الجديدة)
      // ==========================================
      case 7:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px] animate-in fade-in">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  وثائق ومرفقات العميل
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  جميع المرفقات التي تم جمعها أثناء إنشاء الملف (الهوية،
                  العنوان، الوكالات، إلخ)
                </p>
              </div>
              <button
                onClick={() => generalDocRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors rounded-lg text-xs font-bold"
              >
                <Upload className="w-4 h-4" /> إضافة مستند إضافي
              </button>
              <input
                type="file"
                ref={generalDocRef}
                multiple
                className="hidden"
                onChange={handleGeneralDocsUpload}
              />
            </div>

            {documents.length > 0 ? (
              <div className="flex flex-col gap-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-50 text-slate-400 rounded-lg border border-slate-100">
                        <FileCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 mb-1">
                          {doc.name}
                        </div>
                        <div className="flex gap-3 text-[10px] font-bold">
                          <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {doc.type || "مستند عام"}
                          </span>
                          <span className="text-slate-500">{doc.size} KB</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-bold">
                  لا توجد وثائق مرفوعة حتى الآن
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 custom-scrollbar"
      dir="rtl"
    >
      <div className="max-w-4xl mx-auto">
        {/* شريط التقدم (الخطوات) */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-slate-100 overflow-x-auto custom-scrollbar">
          <div className="flex items-center justify-between relative min-w-[600px] px-4">
            <div className="absolute left-10 right-10 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 rounded-full"></div>
            {WIZARD_STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center group"
                >
                  <div
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs md:text-sm font-bold shadow-sm transition-colors duration-300 ${isActive ? "bg-violet-600 text-white ring-4 ring-violet-100" : isCompleted ? "bg-emerald-500 text-white border border-emerald-600" : "bg-white border-2 border-slate-200 text-slate-400"}`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-[9px] md:text-[10px] mt-2 font-bold absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${isActive ? "text-violet-700" : "text-slate-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {renderStepContent()}

        {/* أزرار التنقل السفلية */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center border border-slate-100 sticky bottom-4 z-20">
          <button
            onClick={prevStep}
            className={`px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors ${currentStep === 1 ? "invisible" : ""}`}
          >
            السابق
          </button>

          {/* يظهر زر الحفظ في الخطوة 7 فقط */}
          {currentStep === 7 ? (
            <button
              onClick={handleFinalSave}
              disabled={saveMutation.isPending}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-70"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CircleCheckBig className="w-5 h-5" />
              )}
              حفظ واعتماد ملف العميل
            </button>
          ) : (
            <button
              onClick={nextStep}
              className="px-8 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-bold shadow-md shadow-violet-200 hover:bg-violet-700 active:scale-95 transition-all"
            >
              التالي
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateClientWizard;
