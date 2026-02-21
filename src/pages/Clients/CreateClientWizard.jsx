import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient, analyzeClientIdentity } from "../../api/clientApi";
import { toast } from "sonner";
import {
  Upload,
  SquarePen,
  CircleCheckBig,
  Star,
  Shield,
  X,
  User,
  MapPin,
  Building,
  Users,
  UsersRound,
  FileCheck,
  Loader2,
} from "lucide-react";

// ==========================================
// مكونات مساعدة (مفصولة لمنع فقدان التركيز عند الكتابة)
// ==========================================
const AIFilledInput = ({
  label,
  labelEn,
  valueAr,
  valueEn,
  onChangeAr,
  onChangeEn,
  isAI,
}) => (
  <div className="flex gap-2">
    <div className="flex-1">
      <label className="flex items-center text-[11px] font-bold mb-1.5 text-slate-700">
        {label}{" "}
        {isAI && (
          <span className="text-[8px] text-violet-600 bg-violet-100 px-1 py-0.5 rounded ml-1 font-black">
            AI
          </span>
        )}
      </label>
      <input
        type="text"
        value={valueAr}
        onChange={(e) => onChangeAr(e.target.value)}
        className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors ${isAI ? "border-2 border-violet-400 bg-violet-50 font-bold text-slate-800" : "border border-slate-300 focus:border-blue-500"}`}
      />
    </div>
    <div className="flex-1" dir="ltr">
      <label className="flex items-center text-[11px] font-bold mb-1.5 text-slate-700 justify-end">
        {isAI && (
          <span className="text-[8px] text-violet-600 bg-violet-100 px-1 py-0.5 rounded mr-1 font-black">
            AI
          </span>
        )}{" "}
        {labelEn}
      </label>
      <input
        type="text"
        value={valueEn}
        onChange={(e) => onChangeEn(e.target.value)}
        className={`w-full p-2.5 rounded-lg text-sm outline-none transition-colors text-left ${isAI ? "border-2 border-violet-400 bg-violet-50 font-bold text-slate-800" : "border border-slate-300 focus:border-blue-500"}`}
      />
    </div>
  </div>
);

const WIZARD_STEPS = [
  { id: 1, label: "الوثيقة والذكاء الاصطناعي" },
  { id: 2, label: "نوع العميل" },
  { id: 3, label: "البيانات الأساسية" },
  { id: 4, label: "العنوان والتواصل" },
  { id: 5, label: "حفظ واعتماد" },
];

const CreateClientWizard = ({ onComplete }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [creationMethod, setCreationMethod] = useState("ai"); // 'ai' or 'manual'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [aiResults, setAiResults] = useState(null);

  // حالة النموذج (State)
  const [formData, setFormData] = useState({
    documentType: "هوية شخصية", // نوع الوثيقة المرفوعة
    type: "فرد سعودي",
    name: {
      firstName: "",
      fatherName: "",
      grandFatherName: "",
      familyName: "",
      englishName: "",
    },
    contact: { mobile: "", email: "", phone: "", whatsapp: "", notes: "" },
    identification: {
      idNumber: "",
      idType: "هوية وطنية",
      issueDate: "",
      expiryDate: "",
    },
    address: {
      city: "الرياض",
      district: "",
      street: "",
      postalCode: "",
      fullAddress: "",
    },
    nationality: "سعودي",
    birthDate: "",
  });

  const handleChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // ==========================================
  // OpenAI Integration (Vision API)
  // ==========================================
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);

    if (!file.type.startsWith("image/")) {
      toast.error(
        "يرجى رفع صورة (JPG/PNG) لكي يتمكن الذكاء الاصطناعي من قراءتها.",
      );
      return;
    }

    setIsAnalyzing(true);
    try {
      const base64Image = await fileToBase64(file);

      // استدعاء الباك إند
      const response = await analyzeClientIdentity(
        base64Image,
        formData.documentType,
      );

      // ✅ حماية إضافية: التأكد من وجود response و success
      if (response && response.success) {
        // ✅ حماية ضد الـ null: لو كانت response.data فارغة، نستخدم كائن فارغ {}
        const parsedResult = response.data || {};

        // حفظ النتائج مع استخدام `?.` لمنع الكراش في حال اختفاء أي حقل
        setAiResults({
          name: {
            firstName: parsedResult?.firstName || "",
            fatherName: parsedResult?.fatherName || "",
            grandFatherName: parsedResult?.grandFatherName || "",
            familyName: parsedResult?.familyName || "",
            englishName: parsedResult?.englishName || "",
          },
          identification: { idNumber: parsedResult?.idNumber || "" },
          nationality: parsedResult?.nationality || "سعودي",
          birthDate: parsedResult?.birthDate || "",
        });

        toast.success("تم استخراج البيانات بنجاح!");
      } else {
        throw new Error("لم يقم الخادم بإرجاع بيانات صالحة");
      }
    } catch (error) {
      console.error("AI Error:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "فشل استخراج البيانات من الخادم",
      );

      // تفريغ الملف في حال الفشل لكي يتمكن من المحاولة مرة أخرى
      setUploadedFile(null);
      setAiResults(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAcceptAIData = () => {
    if (aiResults) {
      setFormData((prev) => ({
        ...prev,
        nationality: aiResults.nationality,
        birthDate: aiResults.birthDate,
        name: { ...prev.name, ...aiResults.name },
        identification: { ...prev.identification, ...aiResults.identification },
      }));
    }
    nextStep();
  };

  // ==========================================
  // Backend Save
  // ==========================================
  const saveMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      toast.success("تم حفظ العميل في قاعدة البيانات بنجاح!");
      queryClient.invalidateQueries(["clients"]);
      if (onComplete) onComplete();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "حدث خطأ أثناء الحفظ");
    },
  });

  const handleFinalSave = () => {
    if (!formData.name.firstName || !formData.identification.idNumber) {
      toast.error("الاسم الأول ورقم الهوية مطلوبان!");
      setCurrentStep(3);
      return;
    }
    const payload = {
      ...formData,
      mobile: formData.contact.mobile,
      email: formData.contact.email,
      idNumber: formData.identification.idNumber,
      isActive: true,
    };
    saveMutation.mutate(payload);
  };

  const nextStep = () => currentStep < 5 && setCurrentStep((p) => p + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep((p) => p - 1);

  // ==========================================
  // دالة العرض (Rendering Steps dynamically)
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
                className={`p-7 rounded-2xl cursor-pointer transition-all text-center relative overflow-hidden ${creationMethod === "ai" ? "bg-violet-50 border-2 border-violet-500 shadow-md" : "bg-white border-2 border-slate-200"}`}
              >
                {creationMethod === "ai" && (
                  <div className="absolute top-3 left-3">
                    <CircleCheckBig className="w-5 h-5 text-violet-500" />
                  </div>
                )}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-700 mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-bold text-slate-800 mb-2">
                  رفع وثيقة هوية (AI)
                </div>
                <div className="text-xs text-slate-500">
                  ارفع صورة لهوية العميل <br />
                  وسيتم استخراج البيانات تلقائياً
                </div>
              </div>

              <div
                onClick={() => {
                  setCreationMethod("manual");
                  setAiResults(null);
                }}
                className={`p-7 rounded-2xl cursor-pointer transition-all text-center relative ${creationMethod === "manual" ? "bg-emerald-50 border-2 border-emerald-500 shadow-md" : "bg-white border-2 border-slate-200"}`}
              >
                {creationMethod === "manual" && (
                  <div className="absolute top-3 left-3">
                    <CircleCheckBig className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600 mx-auto mb-4">
                  <SquarePen className="w-8 h-8 text-white" />
                </div>
                <div className="text-lg font-bold text-slate-800 mb-2">
                  إدخال يدوي
                </div>
                <div className="text-xs text-slate-500">
                  أدخل بيانات العميل يدوياً <br />
                  اختيار النوع ثم تعبئة الحقول
                </div>
              </div>
            </div>

            {creationMethod === "ai" && (
              <div className="p-6 bg-violet-50/50 border-2 border-violet-200 rounded-2xl animate-in fade-in">
                <div className="text-[15px] font-bold text-violet-700 mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5" /> رفع وثيقة العميل
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-slate-700 mb-3">
                    نوع وثيقة الهوية المرفوعة *
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { id: "هوية شخصية", icon: "🪪", desc: "وطنية/إقامة" },
                      { id: "سجل تجاري", icon: "🏢", desc: "شركات/مؤسسات" },
                      {
                        id: "رقم وطني موحد",
                        icon: "🔢",
                        desc: "الرقم الموحد (700)",
                      },
                      { id: "جواز سفر", icon: "🛂", desc: "لغير السعوديين" },
                    ].map((doc) => (
                      <div
                        key={doc.id}
                        onClick={() =>
                          handleChange(null, "documentType", doc.id)
                        }
                        className={`p-3 rounded-xl cursor-pointer text-center transition-all ${formData.documentType === doc.id ? "bg-white border-2 border-violet-500 shadow-sm" : "bg-white/60 border border-slate-200 hover:bg-white"}`}
                      >
                        <div className="text-2xl mb-1">{doc.icon}</div>
                        <div className="text-[11px] font-bold text-slate-800">
                          {doc.id}
                        </div>
                        <div className="text-[9px] text-slate-500">
                          {doc.desc}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {!uploadedFile ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-violet-300 rounded-xl p-8 text-center bg-white cursor-pointer hover:bg-violet-50 transition-colors mt-4"
                  >
                    <Upload className="w-10 h-10 text-violet-400 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-700">
                      انقر هنا لرفع الوثيقة (JPG, PNG)
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept=".jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                    />
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-emerald-500 rounded-xl p-4 bg-emerald-50 mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-100 rounded-lg">
                        {isAnalyzing ? (
                          <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                        ) : (
                          <CircleCheckBig className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-800">
                          {uploadedFile.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUploadedFile(null);
                        setAiResults(null);
                      }}
                      className="p-1.5 bg-red-100 text-red-600 rounded-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {isAnalyzing && (
                  <div className="text-center py-4 text-violet-600 font-bold animate-pulse">
                    جاري تحليل الوثيقة باستخدام OpenAI Vision...
                  </div>
                )}

                {aiResults && !isAnalyzing && (
                  <div className="mt-4 p-5 bg-white rounded-xl border-2 border-emerald-100 shadow-sm animate-in fade-in">
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {Object.entries(aiResults.name).map(
                        ([key, val]) =>
                          val && (
                            <div
                              key={key}
                              className="p-2 bg-emerald-50 rounded border border-emerald-100"
                            >
                              <div className="text-[10px] text-slate-500">
                                {key}
                              </div>
                              <div className="text-xs font-bold text-slate-800">
                                {val}
                              </div>
                            </div>
                          ),
                      )}
                      <div className="p-2 bg-emerald-50 rounded border border-emerald-100">
                        <div className="text-[10px] text-slate-500">
                          رقم الهوية/السجل
                        </div>
                        <div className="text-xs font-bold text-slate-800">
                          {aiResults.identification.idNumber}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleAcceptAIData}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90"
                    >
                      <CircleCheckBig className="w-5 h-5" /> اعتماد هذه البيانات
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-5 text-slate-800">
              اختر نوع العميل
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                {
                  id: "فرد سعودي",
                  label: "فرد سعودي",
                  icon: Users,
                  color: "emerald",
                },
                {
                  id: "فرد غير سعودي",
                  label: "فرد غير سعودي",
                  icon: Users,
                  color: "blue",
                },
                {
                  id: "شركة",
                  label: "شركة/مؤسسة",
                  icon: Building,
                  color: "violet",
                },
                {
                  id: "جهة حكومية",
                  label: "جهة حكومية",
                  icon: Building,
                  color: "red",
                },
                { id: "ورثة", label: "ورثة", icon: UsersRound, color: "amber" },
                {
                  id: "مكتب هندسي",
                  label: "مكتب هندسي/وسيط",
                  icon: Building,
                  color: "cyan",
                },
              ].map((type) => (
                <div
                  key={type.id}
                  onClick={() => handleChange(null, "type", type.id)}
                  className={`p-5 rounded-xl cursor-pointer text-center transition-all ${formData.type === type.id ? `bg-white border-2 border-${type.color}-500 shadow-md scale-105` : "bg-white border-2 border-slate-100 hover:border-slate-300"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${formData.type === type.id ? `bg-${type.color}-100 text-${type.color}-600` : "bg-slate-50 text-slate-400"}`}
                  >
                    <type.icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`text-sm font-bold ${formData.type === type.id ? "text-slate-800" : "text-slate-600"}`}
                  >
                    {type.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-5 text-slate-800">
              البيانات الأساسية
            </h3>
            {aiResults && (
              <div className="p-2.5 bg-violet-50 border border-violet-100 rounded-lg mb-5 flex items-center gap-2">
                <Star className="w-4 h-4 text-violet-600 shrink-0" />
                <span className="text-[11px] text-violet-800 font-medium">
                  الحقول المحاطة بإطار بنفسجي تم تعبئتها تلقائياً عبر OpenAI.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <AIFilledInput
                label="الاسم الأول *"
                labelEn="First Name"
                valueAr={formData.name.firstName}
                valueEn={formData.name.englishName.split(" ")[0] || ""}
                onChangeAr={(v) => handleChange("name", "firstName", v)}
                onChangeEn={() => {}}
                isAI={!!aiResults?.name?.firstName}
              />
              <AIFilledInput
                label="اسم الأب"
                labelEn="Father Name"
                valueAr={formData.name.fatherName}
                valueEn={formData.name.englishName.split(" ")[1] || ""}
                onChangeAr={(v) => handleChange("name", "fatherName", v)}
                onChangeEn={() => {}}
                isAI={!!aiResults?.name?.fatherName}
              />
              <AIFilledInput
                label="اسم العائلة *"
                labelEn="Family Name"
                valueAr={formData.name.familyName}
                valueEn={formData.name.englishName.split(" ").pop() || ""}
                onChangeAr={(v) => handleChange("name", "familyName", v)}
                onChangeEn={() => {}}
                isAI={!!aiResults?.name?.familyName}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  رقم الجوال *
                </label>
                <input
                  type="tel"
                  value={formData.contact.mobile}
                  onChange={(e) =>
                    handleChange("contact", "mobile", e.target.value)
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="05xxxxxxxx"
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
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                  placeholder="example@email.com"
                />
              </div>
              <div>
                <label className="flex items-center text-xs font-bold mb-1.5 text-slate-700">
                  رقم الهوية/السجل *{" "}
                  {aiResults && (
                    <span className="text-[8px] text-violet-600 bg-violet-100 px-1 py-0.5 rounded ml-1 font-black">
                      AI
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.identification.idNumber}
                  onChange={(e) =>
                    handleChange("identification", "idNumber", e.target.value)
                  }
                  className={`w-full p-2.5 rounded-lg text-sm outline-none ${aiResults ? "border-2 border-violet-400 bg-violet-50 font-bold" : "border border-slate-300"}`}
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px]">
            <h3 className="text-lg font-bold mb-5 text-slate-800">
              العنوان الوطني
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  الحي
                </label>
                <input
                  type="text"
                  value={formData.address.district}
                  onChange={(e) =>
                    handleChange("address", "district", e.target.value)
                  }
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold mb-1.5 block text-slate-700">
                  العنوان بالتفصيل
                </label>
                <textarea
                  value={formData.address.fullAddress}
                  onChange={(e) =>
                    handleChange("address", "fullAddress", e.target.value)
                  }
                  rows="3"
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 resize-none"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm min-h-[400px] flex flex-col justify-center items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
              <CircleCheckBig className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              البيانات جاهزة للاعتماد
            </h3>
            <p className="text-slate-500 mb-6">
              تأكد من صحة البيانات أدناه ثم انقر على "حفظ نهائي"
            </p>
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl w-full max-w-md text-right space-y-3">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">الاسم:</span>
                <span className="font-bold text-slate-800">
                  {formData.name.firstName} {formData.name.familyName}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">النوع:</span>
                <span className="font-bold text-slate-800">
                  {formData.type}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500 text-sm">
                  رقم الهوية/السجل:
                </span>
                <span className="font-bold text-slate-800">
                  {formData.identification.idNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 text-sm">الجوال:</span>
                <span className="font-bold text-slate-800" dir="ltr">
                  {formData.contact.mobile}
                </span>
              </div>
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
        {/* Stepper */}
        <div className="bg-white rounded-xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-slate-100 rounded-full z-0"></div>
            {WIZARD_STEPS.map((step) => {
              const isActive = step.id === currentStep;
              const isCompleted = step.id < currentStep;
              return (
                <div
                  key={step.id}
                  className="relative z-10 flex flex-col items-center"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${isActive ? "bg-blue-600 text-white ring-4 ring-blue-100" : isCompleted ? "bg-blue-100 text-blue-600 border border-blue-200" : "bg-white border-2 border-slate-200 text-slate-400"}`}
                  >
                    {isCompleted ? (
                      <CircleCheckBig className="w-5 h-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span
                    className={`text-[10px] mt-2 font-bold absolute -bottom-6 whitespace-nowrap ${isActive ? "text-blue-700" : "text-slate-500"}`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Form Render */}
        {renderStepContent()}

        {/* Footer */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center border border-slate-100 sticky bottom-4 z-20">
          <div></div> {/* Spacer */}
          <div className="flex items-center gap-3">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
              >
                السابق
              </button>
            ) : (
              <button
                onClick={() => onComplete && onComplete()}
                className="px-5 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-colors"
              >
                إلغاء وإغلاق
              </button>
            )}

            {currentStep === 5 ? (
              <button
                onClick={handleFinalSave}
                disabled={saveMutation.isPending}
                className="px-8 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CircleCheckBig className="w-5 h-5" />
                )}
                حفظ نهائي في القاعدة
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="px-8 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all"
              >
                التالي
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateClientWizard;
