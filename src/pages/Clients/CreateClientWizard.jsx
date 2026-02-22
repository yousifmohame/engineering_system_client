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

const WIZARD_STEPS = [
  { id: 1, label: "الوثيقة والذكاء الاصطناعي" },
  { id: 2, label: "نوع العميل" },
  { id: 3, label: "البيانات الأساسية" },
  { id: 4, label: "العنوان الوطني" },
  { id: 5, label: "التواصل والوثائق" },
];

// ==========================================
// المكون الرئيسي
// ==========================================
const CreateClientWizard = ({ onComplete }) => {
  const queryClient = useQueryClient();

  // Refs للملفات
  const identityInputRef = useRef(null);
  const addressInputRef = useRef(null);
  const profilePicRef = useRef(null);
  const generalDocRef = useRef(null);

  // حالات التنقل والذكاء الاصطناعي
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState(null);
  const [isAnalyzingId, setIsAnalyzingId] = useState(false);
  const [isAnalyzingAddress, setIsAnalyzingAddress] = useState(false);
  const [aiResults, setAiResults] = useState(null);
  const [useSameAsMobile, setUseSameAsMobile] = useState(true);

  // === إدارة الملفات الشاملة ===
  const [profilePicture, setProfilePicture] = useState(null); // { file, previewBase64 }
  const [documents, setDocuments] = useState([]); // Array of { id, file, name, size, type, privacy, version, base64 }

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
    if (useSameAsMobile)
      handleChange("contact", "whatsapp", formData.contact.mobile);
  }, [formData.contact.mobile, useSameAsMobile]);

  // ==========================================
  // دوال إدارة المستندات (إضافة، تعديل، حذف)
  // ==========================================
  const addDocumentToState = (file, docType = "", base64Data = null) => {
    setDocuments((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: (file.size / 1024).toFixed(2), // بالحجم بـ KB
        type: docType, // نوع المستند
        privacy: "internal", // الافتراضي
        version: "v1", // الافتراضي
        base64: base64Data,
      },
    ]);
  };

  const updateDocumentMeta = (docId, field, value) => {
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === docId ? { ...doc, [field]: value } : doc)),
    );
  };

  const removeDocument = (docId) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  // ==========================================
  // معالجة الملفات والذكاء الاصطناعي
  // ==========================================

  // 1. صورة العميل
  const handleProfilePicUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfilePicture({ file, preview: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // 2. الهوية (الخطوة 1)
  // 2. الهوية (الخطوة 1) - النسخة المنيعة
  const handleIdentityUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzingId(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageBase64 = reader.result;
        // إضافة الملف لقائمة المستندات
        addDocumentToState(file, "dt-001", imageBase64);

        // 🚀 الحل الجذري: إجبار الإرسال كـ JSON وتمرير الاسمين معاً لقطع الشك باليقين
        const payload = {
          base64Image: imageBase64,
          imageBase64: imageBase64,
          documentType: formData.documentType || "هوية شخصية",
        };

        const response = await axios.post(
          "/clients/analyze-identity",
          payload,
          {
            headers: {
              "Content-Type": "application/json", // إجبار السيرفر على قراءتها
              Accept: "application/json",
            },
          },
        );

        if (response.data?.success) {
          setAiResults(response.data.data);
          toast.success("تم استخراج البيانات بنجاح!");
        }
      } catch (error) {
        const serverError =
          error.response?.data?.message || error.message || "خطأ غير معروف";
        toast.error(`سبب الفشل: ${serverError}`);
        console.error(
          "🔥 تفاصيل الخطأ الكاملة:",
          error.response?.data || error,
        );
      } finally {
        setIsAnalyzingId(false);
      }
    };
  };

  // 3. مستند العنوان الوطني (الخطوة 4)
  const handleAddressUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsAnalyzingAddress(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const imageBase64 = reader.result;
        // إضافة الملف لقائمة المستندات كإثبات عنوان
        addDocumentToState(file, "dt-009", imageBase64); // افترضنا أن dt-009 هو إثبات عنوان

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

  // 4. مستندات عامة إضافية (الخطوة 5)
  const handleGeneralDocsUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => addDocumentToState(file, "", reader.result);
      reader.readAsDataURL(file);
    });
  };

  const handleAcceptAIData = () => {
    if (aiResults) {
      setFormData((prev) => ({
        ...prev,
        identification: {
          ...prev.identification,
          idNumber: aiResults.idNumber || "",
          birthDate: aiResults.birthDate || "",
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

  // ==========================================
  // الحفظ النهائي للباك إند
  // ==========================================
  const saveMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("تم حفظ العميل ومستنداته بنجاح!");
      queryClient.invalidateQueries(["clients"]);
      if (onComplete) onComplete();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "حدث خطأ أثناء الحفظ"),
  });

  const handleFinalSave = () => {
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
      !formData.contact.mobile
    ) {
      toast.error("يرجى التأكد من إدخال الاسم الأول، رقم الهوية، ورقم الجوال!");
      return;
    }

    const payload = {
      mobile: formData.contact.mobile,
      email: formData.contact.email,
      idNumber: formData.identification.idNumber,
      type: formData.type,
      officialNameAr,
      name: { ar: officialNameAr, en: officialNameEn, details: formData.name },
      contact: formData.contact,
      address: formData.address,
      identification: formData.identification,
      isActive: true,

      // إرسال الصورة والمستندات (يحتاج دعم من الباك إند لاستقبالها كـ Base64)
      profilePictureBase64: profilePicture?.preview || null,
      attachments: documents.map((doc) => ({
        name: doc.name,
        type: doc.type,
        privacy: doc.privacy,
        version: doc.version,
        base64: doc.base64,
      })),
    };

    saveMutation.mutate(payload);
  };

  const nextStep = () => currentStep < 5 && setCurrentStep((p) => p + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  // ==========================================
  // الريندر (Render Steps)
  // ==========================================
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
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
                  ارفع صورة أو ملف PDF لهوية العميل
                  <br />
                  وسيتم استخراج البيانات تلقائياً
                </div>
                <div className="inline-block px-3 py-1.5 bg-violet-50 text-violet-600 rounded-full text-[11px] font-bold">
                  OCR + NER + GPT
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
                  أدخل بيانات العميل يدوياً
                  <br />
                  اختيار النوع ثم تعبئة الحقول
                </div>
                <div className="inline-block px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold">
                  كلاسيكي
                </div>
              </div>
            </div>

            {creationMethod === "ai" && (
              <div className="p-6 bg-violet-50/50 border border-violet-100 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    نوع وثيقة الهوية المرفوعة *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "هوية شخصية", icon: "🪪", desc: "وطنية أو إقامة" },
                      { id: "سجل تجاري", icon: "🏢", desc: "شركات ومؤسسات" },
                      {
                        id: "رقم وطني موحد",
                        icon: "🔢",
                        desc: "الرقم الموحد (700)",
                      },
                      {
                        id: "رقم منشأة",
                        icon: "🏛️",
                        desc: "لدى الجهات الحكومية",
                      },
                    ].map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() =>
                          handleChange(null, "documentType", doc.id)
                        }
                        className={`p-3 rounded-xl cursor-pointer text-center transition-all ${formData.documentType === doc.id ? "bg-white border-2 border-violet-500 shadow-sm" : "bg-white/60 border border-slate-200 hover:bg-white"}`}
                      >
                        <div className="text-2xl mb-1">{doc.icon}</div>
                        <div className="text-[12px] font-bold text-slate-800">
                          {doc.id}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
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

                {(isAnalyzingId || aiResults) && (
                  <div className="mt-4 p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 w-full">
                      {isAnalyzingId ? (
                        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                      ) : (
                        <CircleCheckBig className="w-6 h-6 text-emerald-600" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-bold text-slate-800">
                          تحليل الهوية
                        </div>
                        <div className="text-xs text-slate-500">
                          {isAnalyzingId
                            ? "جاري الاستخراج عبر OpenAI..."
                            : `تم التحليل بنجاح - تمت إضافته للمستندات`}
                        </div>
                      </div>
                    </div>
                    {!isAnalyzingId && aiResults && (
                      <button
                        onClick={handleAcceptAIData}
                        className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                      >
                        اعتماد ومتابعة <CircleCheckBig className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        const clientTypes = [
          { id: "فرد سعودي", icon: Users, color: "emerald" },
          { id: "فرد غير سعودي", icon: Users, color: "blue" },
          { id: "شركة", label: "شركة/مؤسسة", icon: Building, color: "violet" },
          { id: "جهة حكومية", icon: Building, color: "red" },
          { id: "ورثة", icon: UsersRound, color: "amber" },
          {
            id: "مكتب هندسي",
            label: "مكتب هندسي/وسيط",
            icon: Building,
            color: "cyan",
          },
        ];

        const colorClasses = {
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
        };

        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-6 text-slate-800">
              اختر نوع العميل
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {clientTypes.map((type) => {
                const isSelected = formData.type === type.id;
                const colors = colorClasses[type.color];
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

      case 3:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-4 text-slate-800">
              البيانات الأساسية
            </h3>
            {aiResults && (
              <div className="p-3 bg-violet-50 rounded-lg mb-5 flex items-center gap-2 border border-violet-100">
                <Star className="w-4 h-4 text-violet-600" />
                <span className="text-xs text-violet-800 font-bold">
                  الحقول المحاطة بإطار أخضر أو أصفر تم استخراجها عبر الذكاء
                  الاصطناعي بدقة عالية.
                </span>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* === الصورة الشخصية (محدثة) === */}
              <div className="flex-shrink-0 md:w-32">
                <label className="block text-[13px] font-bold mb-2 text-slate-700">
                  صورة العميل
                </label>
                <div
                  onClick={() => profilePicRef.current?.click()}
                  className="w-[120px] h-[140px] rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors overflow-hidden relative"
                >
                  {profilePicture ? (
                    <img
                      src={profilePicture.preview}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-slate-400 mb-2" />
                      <span className="text-[11px] text-slate-500">
                        رفع صورة
                      </span>
                    </>
                  )}
                  <input
                    type="file"
                    ref={profilePicRef}
                    className="hidden"
                    accept="image/png, image/jpeg"
                    onChange={handleProfilePicUpload}
                  />
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold text-slate-700">
                    الاسم الرباعي — عربي / إنجليزي
                  </span>
                </div>
                <DualInputWithAI
                  labelAr="الاسم الأول / الشركة *"
                  labelEn="First Name / Company *"
                  valAr={formData.name.firstAr}
                  valEn={formData.name.firstEn}
                  onChangeAr={(v) => handleChange("name", "firstAr", v)}
                  onChangeEn={(v) => handleChange("name", "firstEn", v)}
                  aiConfidence={
                    aiResults?.firstAr ? aiResults.confidence : null
                  }
                />
                <DualInputWithAI
                  labelAr="اسم الأب"
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
                  labelAr="اسم الجد"
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
                  labelAr="اسم العائلة *"
                  labelEn="Family Name *"
                  valAr={formData.name.familyAr}
                  valEn={formData.name.familyEn}
                  onChangeAr={(v) => handleChange("name", "familyAr", v)}
                  onChangeEn={(v) => handleChange("name", "familyEn", v)}
                  aiConfidence={
                    aiResults?.familyAr ? aiResults.confidence : null
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  رقم الهوية/السجل *
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
                  تاريخ الميلاد / التأسيس
                </label>
                <input
                  type="text"
                  value={formData.identification.birthDate}
                  onChange={(e) =>
                    handleChange("identification", "birthDate", e.target.value)
                  }
                  placeholder="1405/06/15"
                  className={`w-full p-2.5 rounded-lg text-sm border-2 outline-none focus:border-violet-500 text-left ${aiResults?.birthDate ? "border-emerald-300 bg-emerald-50 font-bold" : "border-slate-200 bg-white"}`}
                  dir="ltr"
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
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-800">
                العنوان الوطني
              </h3>
              {/* === زر رفع مستند العنوان (محدث) === */}
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
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  رقم الجوال (للاتصال) *
                </label>
                <input
                  type="tel"
                  value={formData.contact.mobile}
                  onChange={(e) =>
                    handleChange("contact", "mobile", e.target.value)
                  }
                  dir="ltr"
                  className="w-full p-2.5 border-2 border-slate-200 focus:border-violet-500 outline-none rounded-lg text-sm text-left font-bold"
                  placeholder="05XXXXXXXX"
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    رقم الواتساب *
                  </label>
                  <label className="text-[11px] flex items-center gap-1.5 cursor-pointer text-slate-600 font-bold hover:text-violet-600">
                    <input
                      type="checkbox"
                      checked={useSameAsMobile}
                      onChange={(e) => setUseSameAsMobile(e.target.checked)}
                      className="rounded text-violet-600 w-3.5 h-3.5"
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
                  disabled={useSameAsMobile}
                  dir="ltr"
                  className={`w-full p-2.5 border-2 outline-none rounded-lg text-sm text-left font-bold ${useSameAsMobile ? "bg-slate-100 border-slate-200 text-slate-500" : "border-slate-200 focus:border-violet-500 bg-white"}`}
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

            {/* === قسم المستندات (محدث بالكامل ليدعم العرض والرفع والإدارة) === */}
            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-slate-800">
                  الوثائق والمرفقات
                </h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors text-slate-700 rounded-md text-[11px] font-bold">
                  <FileCheck className="w-4 h-4" /> إدارة الأنواع
                </button>
              </div>

              {/* منطقة الرفع الإضافي */}
              <div
                onClick={() => generalDocRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-violet-400 transition-colors mb-6"
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700 mb-1">
                  انقر هنا لرفع مستندات إضافية (وكالات، تفويض...)
                </p>
                <input
                  type="file"
                  ref={generalDocRef}
                  multiple
                  className="hidden"
                  onChange={handleGeneralDocsUpload}
                />
              </div>

              {/* قائمة المستندات المرفوعة */}
              {documents.length > 0 && (
                <div className="flex flex-col gap-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="text-sm font-bold text-slate-800 mb-1">
                            {doc.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {doc.size} KB
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(doc.id)}
                          className="p-1.5 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* خيارات المستند */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            نوع المستند *
                          </label>
                          <select
                            value={doc.type}
                            onChange={(e) =>
                              updateDocumentMeta(doc.id, "type", e.target.value)
                            }
                            className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-violet-500"
                          >
                            <option value="">اختر النوع</option>
                            <option value="dt-001">هوية وطنية</option>
                            <option value="dt-002">إقامة</option>
                            <option value="dt-003">سجل تجاري</option>
                            <option value="dt-009">إثبات عنوان</option>
                            <option value="dt-007">وكالة شرعية</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            مستوى السرية
                          </label>
                          <select
                            value={doc.privacy}
                            onChange={(e) =>
                              updateDocumentMeta(
                                doc.id,
                                "privacy",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-violet-500"
                          >
                            <option value="internal">داخلي</option>
                            <option value="client">عميل</option>
                            <option value="authority">جهة</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">
                            الإصدار
                          </label>
                          <input
                            type="text"
                            value={doc.version}
                            onChange={(e) =>
                              updateDocumentMeta(
                                doc.id,
                                "version",
                                e.target.value,
                              )
                            }
                            className="w-full p-2 border border-slate-200 rounded text-xs outline-none focus:border-violet-500"
                            placeholder="v1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 z-0 rounded-full"></div>
            {WIZARD_STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors duration-300 ${isActive ? "bg-violet-600 text-white ring-4 ring-violet-100" : isCompleted ? "bg-emerald-100 text-emerald-600 border border-emerald-200" : "bg-white border-2 border-slate-200 text-slate-400"}`}
                  >
                    {isCompleted ? (
                      <CircleCheckBig className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-bold absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${isActive ? "text-violet-700" : "text-slate-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {renderStepContent()}

        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center border border-slate-100 sticky bottom-4 z-20">
          <button
            onClick={prevStep}
            className={`px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors ${currentStep === 1 ? "invisible" : ""}`}
          >
            السابق
          </button>
          {currentStep === 5 ? (
            <button
              onClick={handleFinalSave}
              disabled={saveMutation.isPending}
              className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md shadow-emerald-200 hover:bg-emerald-700 flex items-center gap-2 transition-colors disabled:opacity-70"
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CircleCheckBig className="w-5 h-5" />
              )}{" "}
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
