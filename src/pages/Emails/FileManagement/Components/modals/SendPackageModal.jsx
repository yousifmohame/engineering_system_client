import React, { useState, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // 💡 تأكد من مسار الـ axios الصحيح
import { toast } from "sonner";
import {
  FileBox,
  Users,
  Shield,
  LayoutPanelTop,
  Share2,
  Send,
  X,
  CheckCircle2,
  Plus,
  LayoutTemplate,
  Eye,
  Download,
  Unlock,
  Lock,
  Clock,
  QrCode,
  Copy,
  Loader2,
  Trash2,
  Sparkles, // 💡 أضفنا أيقونة الذكاء الاصطناعي
} from "lucide-react";
import ExternalDownloadPage from "../../Components/ExternalDownloadPage";
import TemplateSenderModal from "../../Components/TemplateSenderModal";
import ContactPicker from "../../Components/ContactPicker";

// 💡 استدعاء هوك المصادقة لجلب بيانات المستخدم
import {useAuth} from "../../../../../context/AuthContext";

export default function SendPackageModal({ onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // 🚀 جلب بيانات الموظف المسجل

  const [step, setStep] = useState(1);
  const [showSender, setShowSender] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [generatedLinkData, setGeneratedLinkData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // 🚀 حالة التحميل لزر الذكاء الاصطناعي
  const [isEnhancing, setIsEnhancing] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    targetType: "specific",
    entityName: "",
    mobile: "",
    email: "",
    linkType: "open",
    pinCode: "",
    expireDate: "",
    permissions: "both",
    showDisclaimer: true,
    disclaimerText:
      "هذه الملفات سرية ومخصصة للمستلم فقط. يمنع تداولها أو نشرها دون إذن مسبق.",
    selectedFiles: [], // 🚀 سيتم تخزين الملفات الحقيقية هنا
    directDownloadMode: false,
  });

  const updateForm = (updates) =>
    setFormData((prev) => ({ ...prev, ...updates }));

  // 🚀 جلب إعدادات الهوية من الباك إند (من الـ Cache مباشرة)
  const { data: centerData } = useQuery({
    queryKey: ["transfer-center-data"],
    queryFn: async () => {
      const res = await api.get("/transfer-center/dashboard");
      return res.data?.data;
    },
    staleTime: Infinity, // الاعتماد على البيانات الموجودة مسبقاً
  });

  const downloadSettings = centerData?.settings?.downloadSettings || {};

  // =========================================
  // 🚀 دالة تحسين الرسالة بالذكاء الاصطناعي
  // =========================================
  const enhanceMessageWithAI = async () => {
    if (!formData.message.trim()) {
      return toast.error("يرجى كتابة نص مبدئي ليقوم الذكاء الاصطناعي بتحسينه");
    }

    setIsEnhancing(true);
    try {
      const res = await api.post("/transfer-center/ai/rephrase", {
        text: formData.message,
        tone: "professional",
      });

      if (res.data?.success) {
        updateForm({ message: res.data.text });
        toast.success("تم تحسين الصياغة بنجاح ✨");
      }
    } catch (error) {
      console.error("AI Rephrase Error:", error);
      toast.error("فشل الاتصال بالذكاء الاصطناعي.");
    } finally {
      setIsEnhancing(false);
    }
  };

  // =========================================
  // 🚀 دوال التعامل مع الملفات (رفع وحذف)
  // =========================================
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file: file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      type: file.type,
    }));

    updateForm({ selectedFiles: [...formData.selectedFiles, ...newFiles] });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (id) => {
    updateForm({
      selectedFiles: formData.selectedFiles.filter((f) => f.id !== id),
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      handleFileSelect({ target: { files: e.dataTransfer.files } });
    }
  };

  // =========================================
  // 🚀 ميوتيشن إنشاء الحزمة في قاعدة البيانات
  // =========================================
  const createPackageMutation = useMutation({
    mutationFn: async (data) => {
      const uploadData = new FormData();

      // دمج اسم الموظف إذا تم إرسال {userName} في الرسالة
      let finalMessage = data.message;
      if (finalMessage && user?.name) {
        finalMessage = finalMessage.replace(/{userName}/g, user.name);
      }

      Object.keys(data).forEach((key) => {
        if (key === "message") {
          uploadData.append("message", finalMessage);
        } else if (
          key !== "selectedFiles" &&
          data[key] !== null &&
          data[key] !== undefined
        ) {
          uploadData.append(key, data[key]);
        }
      });

      const fileMetadata = [];
      data.selectedFiles.forEach((f) => {
        uploadData.append("files", f.file);
        fileMetadata.push({ name: f.name, size: f.size, type: f.type });
      });

      uploadData.append("filesMetadata", JSON.stringify(fileMetadata));

      const response = await api.post("/transfer-center/packages", uploadData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        setGeneratedLinkData(res.data);
        setStep(5);
        toast.success("تم إنشاء حزمة الإرسال بنجاح");
        queryClient.invalidateQueries(["transfer-center-data"]);
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "حدث خطأ أثناء حفظ الحزمة، يرجى المحاولة لاحقاً",
      );
    },
  });

  const handleFinalSave = () => {
    if (formData.selectedFiles.length === 0) {
      return toast.error("يرجى إرفاق ملف واحد على الأقل قبل الاعتماد");
    }
    if (!formData.title) {
      return toast.error("يرجى إدخال عنوان الحزمة قبل الاعتماد");
    }
    createPackageMutation.mutate(formData);
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                إنشاء حزمة إرسال ملفات جديدة
              </h2>
              <p className="text-xs text-slate-400 font-bold">
                نموذج تجميع وإرسال الوثائق للأطراف الخارجية
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body with Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Steps */}
          <div className="w-64 bg-slate-50 border-l border-slate-200 p-4 shrink-0 overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-2">
              {[
                { id: 1, title: "تجميع الملفات", icon: FileBox },
                { id: 2, title: "المرسل إليه", icon: Users },
                { id: 3, title: "صلاحيات الاستعراض", icon: Shield },
                { id: 4, title: "تخصيص الهوية", icon: LayoutPanelTop },
                { id: 5, title: "مشاركة الحزمة", icon: Share2 },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    if (s.id === 5 && !generatedLinkData) return;
                    setStep(s.id);
                  }}
                  disabled={s.id === 5 && !generatedLinkData}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-all ${
                    step === s.id
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm"
                      : step > s.id
                        ? "bg-white text-slate-600 border border-slate-100 hover:bg-slate-100"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${step === s.id ? "bg-emerald-100 text-emerald-600" : step > s.id ? "bg-indigo-100 text-indigo-600" : "bg-slate-100"}`}
                  >
                    {step > s.id ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <s.icon className="w-4 h-4" />
                    )}
                  </div>
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {/* 🚀 الخطوة 1 */}
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  تجميع الملفات للحزمة
                </h3>
                <p className="text-xs font-bold text-slate-500 mb-4">
                  اختر الملفات من داخل النظام أو قم برفع ملفات جديدة لإدراجها في
                  هذه الحزمة.
                </p>

                <input
                  type="file"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                />

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`bg-slate-50 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${isDragging ? "border-emerald-500 bg-emerald-50 scale-[0.99]" : "border-slate-300"}`}
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 mb-1">
                    أضف ملفات للحزمة
                  </h4>
                  <p className="text-xs font-bold text-slate-500 mb-4">
                    يمكنك السحب والإفلات هنا
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-indigo-700 transition-colors"
                    >
                      تصفح جهازك
                    </button>
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50 transition-colors">
                      من مكتبة النظام
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-black text-slate-800">
                    الملفات المحددة ({formData.selectedFiles.length})
                  </h4>
                  {formData.selectedFiles.length === 0 ? (
                    <div className="text-center py-6 border border-slate-100 rounded-xl bg-slate-50">
                      <p className="text-[10px] font-bold text-slate-400">
                        لم يتم اختيار أي ملفات بعد
                      </p>
                    </div>
                  ) : (
                    formData.selectedFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-white hover:border-indigo-200 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                            <LayoutTemplate className="w-4 h-4" />
                          </div>
                          <div>
                            <p
                              className="text-xs font-bold text-slate-800 truncate max-w-[200px] md:max-w-[300px]"
                              dir="ltr"
                              style={{ textAlign: "right" }}
                            >
                              {f.name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              {f.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFile(f.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* 🚀 الخطوة 2 */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  بيانات الحزمة والمرسل إليه
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1.5">
                      عنوان الحزمة (يظهر للمستلم){" "}
                      <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      placeholder="مثال: المخططات المعتمدة للمشروع"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div>
                    {/* 🚀 إضافة زر تحسين الصياغة بالذكاء الاصطناعي هنا */}
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-black text-slate-700">
                        رسالة إضافية (تظهر في صفحة الهبوط)
                      </label>
                      <button
                        onClick={enhanceMessageWithAI}
                        disabled={isEnhancing || !formData.message}
                        className="text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md flex items-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {isEnhancing ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Sparkles className="w-3 h-3" />
                        )}
                        تحسين بالذكاء الاصطناعي
                      </button>
                    </div>
                    <textarea
                      value={formData.message}
                      onChange={(e) => updateForm({ message: e.target.value })}
                      placeholder="نرفق لكم المخططات النهائية للاعتماد..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      disabled={isEnhancing}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-800 block mb-3">
                      بيانات المرسل إليه
                    </label>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowContactPicker(true)}
                          className="flex-1 py-3 bg-white border border-emerald-200 text-emerald-600 rounded-lg text-xs font-bold shadow-sm hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                        >
                          <Users className="w-4 h-4" /> اختيار من جهات الاتصال
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-500 block mb-1">
                            اسم الجهة / العميل
                          </label>
                          <input
                            type="text"
                            value={
                              selectedContact
                                ? selectedContact.displayName
                                : formData.entityName
                            }
                            onChange={(e) =>
                              !selectedContact &&
                              updateForm({ entityName: e.target.value })
                            }
                            disabled={!!selectedContact}
                            className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs outline-none disabled:bg-slate-100"
                            placeholder="الاسم"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-500 block mb-1">
                            رقم الجوال
                          </label>
                          <input
                            type="text"
                            value={
                              selectedContact
                                ? selectedContact.mobile1
                                : formData.mobile
                            }
                            onChange={(e) =>
                              !selectedContact &&
                              updateForm({ mobile: e.target.value })
                            }
                            disabled={!!selectedContact}
                            className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs outline-none disabled:bg-slate-100"
                            placeholder="05XXXXXXXX"
                            dir="ltr"
                          />
                        </div>
                      </div>
                      {selectedContact && (
                        <button
                          onClick={() => setSelectedContact(null)}
                          className="text-[10px] text-rose-500 hover:underline text-left"
                        >
                          إلغاء الربط بجهة الاتصال
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* الخطوة 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  الصلاحيات والحماية
                </h3>
                <div className="space-y-4">
                  <label className="text-xs font-black text-slate-800 block mb-3">
                    صلاحيات المستلم على الملفات المرفقة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      {
                        id: "view",
                        title: "عرض فقط (View)",
                        icon: Eye,
                        desc: "يستطيع مشاهدة الملفات بدون قدرة على تنزيلها للأمان.",
                      },
                      {
                        id: "download",
                        title: "تنزيل فقط (Download)",
                        icon: Download,
                        desc: "يمكنه تنزيل الملفات مباشرة لجهازه.",
                      },
                      {
                        id: "both",
                        title: "عرض وتنزيل",
                        icon: FileBox,
                        desc: "الخيار الافتراضي لعرض وتحميل المرفقات.",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex flex-col items-center text-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${formData.permissions === opt.id ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500" : "border-slate-200 hover:border-emerald-300"}`}
                      >
                        <input
                          type="radio"
                          checked={formData.permissions === opt.id}
                          onChange={() => updateForm({ permissions: opt.id })}
                          className="sr-only"
                        />
                        <div
                          className={`p-2 rounded-full ${formData.permissions === opt.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                        >
                          <opt.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-black text-slate-800">
                          {opt.title}
                        </span>
                        <p className="text-[10px] font-bold text-slate-500">
                          {opt.desc}
                        </p>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-800 block mb-3">
                    حماية الوصول للرابط
                  </label>
                  <div className="space-y-3">
                    {[
                      {
                        id: "open",
                        title: "مفتوح (بدون رمز مرور)",
                        icon: Unlock,
                        desc: "أي شخص يملك الرابط يمكنه الدخول",
                      },
                      {
                        id: "pin",
                        title: "محمي برمز مرور (PIN)",
                        icon: Lock,
                        desc: "يتطلب إدخال رمز صحيح للوصول",
                      },
                      {
                        id: "expire",
                        title: "ينتهي بوقت محدد",
                        icon: Clock,
                        desc: "يغلق الرابط بعد تاريخ معين",
                      },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${formData.linkType === opt.id ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500" : "border-slate-200 hover:border-emerald-300"}`}
                      >
                        <div className="pt-1">
                          <input
                            type="radio"
                            checked={formData.linkType === opt.id}
                            onChange={() => updateForm({ linkType: opt.id })}
                            className="accent-emerald-600"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <opt.icon
                              className={`w-4 h-4 ${formData.linkType === opt.id ? "text-emerald-500" : "text-slate-400"}`}
                            />
                            <span className="text-sm font-black text-slate-800">
                              {opt.title}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500 font-bold">
                            {opt.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {formData.linkType === "pin" && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4 animate-in fade-in zoom-in-95">
                    <label className="text-xs font-black text-slate-700 block mb-1.5">
                      تعيين رمز مرور للرابط
                    </label>
                    <input
                      type="text"
                      value={formData.pinCode}
                      onChange={(e) => updateForm({ pinCode: e.target.value })}
                      placeholder="مثال: 9482"
                      className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg text-sm tracking-widest font-mono text-center outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}

                {formData.linkType === "expire" && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-4 animate-in fade-in zoom-in-95">
                    <label className="text-xs font-black text-slate-700 block mb-1.5">
                      تاريخ ووقت الانتهاء
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.expireDate}
                      onChange={(e) =>
                        updateForm({ expireDate: e.target.value })
                      }
                      className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                )}
              </div>
            )}

            {/* 🚀 الخطوة 4: المعاينة الحية */}
            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      معاينة واجهة تنزيل وعرض الوثائق
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      عاين كيف ستظهر الحزمة للعميل واضبط التنزيل المباشر.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <input
                        type="checkbox"
                        checked={formData.directDownloadMode || false}
                        onChange={(e) =>
                          updateForm({ directDownloadMode: e.target.checked })
                        }
                        className="accent-indigo-600 rounded"
                      />
                      <span className="text-[10px] font-bold text-slate-700">
                        تنزيل مباشر (بدون واجهة)
                      </span>
                    </label>
                  </div>
                </div>

                <div className="flex-1 min-h-[400px] border-4 border-slate-800 rounded-3xl overflow-hidden bg-slate-200 flex flex-col relative isolate shadow-xl">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
                  <div className="w-full h-full overflow-y-auto overflow-x-hidden pt-2 custom-scrollbar">
                    <div className="pointer-events-auto transform scale-[0.85] origin-top">
                      <ExternalDownloadPage
                        config={{
                          companyName:
                            downloadSettings.companyName ||
                            "مكتب ريمكس للاستشارات الهندسية",
                          brandColor: downloadSettings.brandColor || "#10b981",
                          footerText:
                            downloadSettings.footerText ||
                            "نظام ريمكس للإدارة الهندسية",
                          contactEmail: downloadSettings.contactEmail || "",
                          contactPhone: downloadSettings.contactPhone || "",
                          enableWhatsApp:
                            downloadSettings.enableWhatsApp ?? true,
                          enableEmailCTA:
                            downloadSettings.enableEmailCTA ?? true,
                          enableSms: downloadSettings.enableSms ?? true,

                          title:
                            formData.title || "حزمة مستندات للاستلام والتنزيل",
                          message:
                            formData.message ||
                            "هذه الواجهة ستظهر للعميل الخارجي عند استقباله للملفات المرسلة من المركز.",
                          status:
                            formData.linkType === "pin"
                              ? "pin-required"
                              : "active",
                          pinCode: formData.pinCode,
                          permissions: formData.permissions,
                          showDisclaimer: formData.showDisclaimer,
                          disclaimerText: formData.disclaimerText,

                          files:
                            formData.selectedFiles.length > 0
                              ? formData.selectedFiles
                              : [
                                  {
                                    id: "1",
                                    name: "المخططات المعمارية المعتمدة.pdf",
                                    size: "2.4 MB",
                                    type: "application/pdf",
                                  },
                                ],
                          directDownloadMode:
                            formData.directDownloadMode || false,
                          isPreview: true,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* الخطوة 5: النجاح */}
            {step === 5 && generatedLinkData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    الحزمة جاهزة للمشاركة!
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mb-6">
                    تم حفظ الحزمة وتأمين رابط الإرسال بنجاح.
                  </p>

                  <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-8">
                    <div className="flex items-center justify-center mb-4">
                      <QrCode className="w-24 h-24 text-slate-700" />
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <span
                        className="text-sm font-mono font-bold text-emerald-700 truncate mr-2"
                        dir="ltr"
                      >
                        {`https://details-worksystem1.com/s/${generatedLinkData.shortLink}`}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://details-worksystem1.com/s/${generatedLinkData.shortLink}`,
                          );
                          toast.success("تم نسخ الرابط");
                        }}
                        className="p-2 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-600 transition-colors"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full max-w-md flex gap-3">
                    <button
                      onClick={() => setShowSender(true)}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 flex justify-center items-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" /> شارك الرابط الآن
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-4 bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-200"
                    >
                      العودة للمركز
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="bg-slate-50 border-t border-slate-200 p-5 shrink-0 flex justify-between items-center px-6">
          {step < 5 && (
            <>
              <button
                disabled={step === 1 || createPackageMutation.isPending}
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-2.5 rounded-xl font-black text-xs text-slate-600 bg-white border border-slate-200 drop-shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-all"
              >
                السابق
              </button>

              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === step ? "bg-emerald-600 w-8" : "bg-slate-200 w-3"}`}
                  />
                ))}
              </div>

              {step === 4 ? (
                <button
                  onClick={handleFinalSave}
                  disabled={createPackageMutation.isPending}
                  className="px-8 py-2.5 bg-emerald-600 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-600/30 hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-70 transition-all"
                >
                  {createPackageMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  اعتماد وإنشاء الرابط
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step < 4) setStep((s) => s + 1);
                  }}
                  className="px-8 py-2.5 bg-slate-800 text-white rounded-xl font-black text-xs hover:bg-slate-900 transition-colors"
                >
                  التالي
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showSender && generatedLinkData && (
        <TemplateSenderModal
          onClose={() => {
            setShowSender(false);
            onClose();
          }}
          linkInfo={{
            id: generatedLinkData.id,
            url: `https://details-worksystem1.com/s/${generatedLinkData.shortLink}`,
            title: generatedLinkData.title,
            targetCompany: formData.entityName || "",
            pin: formData.pinCode,
            expireDate: formData.expireDate,
            type: "send",
          }}
        />
      )}

      {showContactPicker && (
        <ContactPicker
          onClose={() => setShowContactPicker(false)}
          onSelect={(contacts) => {
            setSelectedContact(contacts[0]);
            setShowContactPicker(false);
            updateForm({
              entityName: contacts[0].displayName,
              mobile: contacts[0].mobile1,
            });
          }}
          multiSelect={false}
        />
      )}
    </div>
  );
}
