import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../../../../api/axios"; // 💡 تأكد من مسار الـ axios الصحيح
import { toast } from "sonner";
import {
  FileBox,
  UploadCloud,
  Activity,
  Shield,
  LayoutPanelTop,
  Send,
  CheckCircle2,
  X,
  Link as LinkIcon,
  Users,
  Eye,
  Search,
  Unlock,
  Lock,
  Hash,
  Calendar,
  CheckSquare,
  MonitorSmartphone,
  QrCode,
  Copy,
  Loader2,
} from "lucide-react";
import ExternalUploadPage from "../../Components/ExternalUploadPage";
import TemplateSenderModal from "../../Components/TemplateSenderModal";
import ContactPicker from "../../Components/ContactPicker";
import {useAuth} from "../../../../../context/AuthContext"; // 💡 جلب بيانات الموظف المسجل

export default function RequestLinkModal({ onClose }) {
  const queryClient = useQueryClient();
  const { user } = useAuth(); // 🚀 بيانات الموظف

  const [step, setStep] = useState(1);
  const [showSender, setShowSender] = useState(false);
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [generatedLinkData, setGeneratedLinkData] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    instructions: "",
    targetType: "specific",
    entityName: "",
    mobile: "",
    email: "",
    reqSenderName: true,
    reqSenderMobile: true,
    reqSenderEmail: true,
    reqSenderNote: false,
    reqRefNumber: false,
    allowMultiple: true,
    maxFiles: 10,
    maxFileSize: 50,
    totalSize: 500,
    linkType: "open",
    pinCode: "",
    expireDate: "",
    maxUses: 0,
    allowedTypes: "all",
    showDisclaimer: true,
    disclaimerText:
      "برفعك لهذه الملفات، أنت تقر بأنها صحيحة وخالية من أي فيروسات وتتحمل كامل المسؤولية القانونية.",
    systemLinkStatus: "unlinked",
    linkedEntityId: "",
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

  const uploadSettings = centerData?.settings?.uploadSettings || {};

  // 🚀 إرسال البيانات للباك إند (Mutation)
  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/transfer-center/requests", data);
      return response.data;
    },
    onSuccess: (res) => {
      if (res.success) {
        setGeneratedLinkData(res.data);
        setStep(6); // الانتقال لشاشة النجاح
        toast.success("تم إنشاء وتأمين الرابط بنجاح");
        queryClient.invalidateQueries(["transfer-center-data"]); // تحديث القوائم
      }
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "حدث خطأ أثناء إنشاء الرابط، يرجى المحاولة لاحقاً",
      );
    },
  });

  const handleFinalSave = () => {
    if (!formData.title) {
      return toast.error("يرجى إدخال عنوان الطلب قبل الاعتماد");
    }
    createRequestMutation.mutate(formData);
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
            <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">
                إنشاء رابط طلب وثائق احترافي
              </h2>
              <p className="text-xs text-slate-400 font-bold">
                نموذج متقدم لتجهيز وحماية رابط استقبال الملفات
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
                { id: 1, title: "تفاصيل الطلب", icon: FileBox },
                { id: 2, title: "إعدادات الرفع", icon: UploadCloud },
                { id: 3, title: "الربط بالنظام", icon: Activity },
                { id: 4, title: "الحماية والصلاحية", icon: Shield },
                { id: 5, title: "البراندينج والهبوط", icon: LayoutPanelTop },
                { id: 6, title: "المعاينة والإرسال", icon: Send },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    // نمنع المستخدم من التنقل للخطوة 6 إذا لم يتم توليد الرابط بعد
                    if (s.id === 6 && !generatedLinkData) return;
                    setStep(s.id);
                  }}
                  disabled={s.id === 6 && !generatedLinkData}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-black transition-all ${
                    step === s.id
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm"
                      : step > s.id
                        ? "bg-white text-slate-600 border border-slate-100 hover:bg-slate-100"
                        : "text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  <div
                    className={`p-1.5 rounded-lg ${step === s.id ? "bg-indigo-100 text-indigo-600" : step > s.id ? "bg-emerald-100 text-emerald-600" : "bg-slate-100"}`}
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

            <div className="mt-8 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-black text-indigo-900">
                  مؤشر الأمان
                </span>
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-1.5 mb-2">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: formData.linkType === "pin" ? "90%" : "40%" }}
                ></div>
              </div>
              <p className="text-[9px] font-bold text-indigo-700">
                اضبط إعدادات الحماية في الخطوة 4 للحصول على أقصى أمان للرابط.
              </p>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  المعلومات الأساسية للطلب
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1.5">
                      عنوان الطلب (يظهر للمستلم){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => updateForm({ title: e.target.value })}
                      placeholder="مثال: طلب مستندات رخصة بناء لفيلا الملقا"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1.5">
                      وصف تفصيلي للوثائق المطلوبة
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        updateForm({ description: e.target.value })
                      }
                      placeholder="نرجو تزويدنا بالمخططات المعمارية وصورة الصك..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm h-24 resize-none focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black text-slate-700 block mb-1.5">
                      تعليمات إضافية للمرسل (تظهر كملاحظة تحذيرية)
                    </label>
                    <input
                      type="text"
                      value={formData.instructions}
                      onChange={(e) =>
                        updateForm({ instructions: e.target.value })
                      }
                      placeholder="ملاحظة: المرجو دمج المخططات في ملف PDF واحد إن أمكن"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 outline-none"
                    />
                  </div>
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-black text-slate-800 block mb-3">
                      توجيه الطلب وجهة الاتصال
                    </label>
                    <div className="flex gap-4 mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.targetType === "specific"}
                          onChange={() =>
                            updateForm({ targetType: "specific" })
                          }
                          className="accent-indigo-600"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          لشخص / جهة محددة
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={formData.targetType === "general"}
                          onChange={() => updateForm({ targetType: "general" })}
                          className="accent-indigo-600"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          رابط عام (استقبال مفتوح)
                        </span>
                      </label>
                    </div>

                    {formData.targetType === "specific" && (
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowContactPicker(true)}
                            className="flex-1 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
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
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  بيانات المرسل وقيود الرفع
                </h3>
                <div>
                  <label className="text-xs font-black text-slate-800 block mb-3">
                    الحقول الإلزامية المطلوبة من المرسل
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.reqSenderName}
                        onChange={(e) =>
                          updateForm({ reqSenderName: e.target.checked })
                        }
                        className="accent-indigo-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        اسم المرسل
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.reqSenderMobile}
                        onChange={(e) =>
                          updateForm({ reqSenderMobile: e.target.checked })
                        }
                        className="accent-indigo-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        رقم الجوال
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.reqSenderEmail}
                        onChange={(e) =>
                          updateForm({ reqSenderEmail: e.target.checked })
                        }
                        className="accent-indigo-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        البريد الإلكتروني
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.reqSenderNote}
                        onChange={(e) =>
                          updateForm({ reqSenderNote: e.target.checked })
                        }
                        className="accent-indigo-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        ملاحظة نصية
                      </span>
                    </label>
                    <label className="flex items-center gap-2 p-3 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={formData.reqRefNumber}
                        onChange={(e) =>
                          updateForm({ reqRefNumber: e.target.checked })
                        }
                        className="accent-indigo-600 rounded"
                      />
                      <span className="text-xs font-bold text-slate-700">
                        رقم مرجعي
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <label className="text-xs font-black text-slate-800 block mb-3">
                    تفاصيل الملفات المسموحة
                  </label>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer">
                      <span className="text-xs font-bold text-slate-700">
                        السماح برفع ملفات متعددة دفعة واحدة
                      </span>
                      <div
                        className={`w-10 h-5 rounded-full relative transition-colors ${formData.allowMultiple ? "bg-indigo-600" : "bg-slate-300"}`}
                        onClick={() =>
                          updateForm({ allowMultiple: !formData.allowMultiple })
                        }
                      >
                        <div
                          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${formData.allowMultiple ? "left-0.5" : "left-5"}`}
                        ></div>
                      </div>
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">
                          الحد الأقصى لعدد الملفات
                        </label>
                        <input
                          type="number"
                          value={formData.maxFiles}
                          onChange={(e) =>
                            updateForm({ maxFiles: Number(e.target.value) })
                          }
                          className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">
                          أقصى حجم للملف (MB)
                        </label>
                        <input
                          type="number"
                          value={formData.maxFileSize}
                          onChange={(e) =>
                            updateForm({ maxFileSize: Number(e.target.value) })
                          }
                          className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-500 block mb-1">
                          إجمالي الحجم المسموح (MB)
                        </label>
                        <input
                          type="number"
                          value={formData.totalSize}
                          onChange={(e) =>
                            updateForm({ totalSize: Number(e.target.value) })
                          }
                          className="w-full p-2.5 border border-slate-200 bg-white rounded-lg text-xs outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  الربط واستلام الملفات (Routing)
                </h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 text-blue-800 text-sm font-bold">
                  <Activity className="w-5 h-5 shrink-0" />
                  <p>
                    توجيه الملفات المستلمة يحدد أين ستظهر فور وصولها في النظام
                    لتقليل عبء الفرز اليدوي.
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: "unlinked",
                      title: "صندوق الاستقبال العام (غير مرتبط)",
                      desc: "تصل الملفات إلى مركز الإرسال وتنتظر التوزيع.",
                    },
                    {
                      id: "client",
                      title: "ربط بملف عميل",
                      desc: "تضاف فوراً إلى محفظة الوثائق الخاصة بالعميل.",
                    },
                    {
                      id: "transaction",
                      title: "ربط بمعاملة نشطة",
                      desc: "ترفق كمسوغات ضمن معاملة محددة.",
                    },
                    {
                      id: "property",
                      title: "ربط بملكية / عقار",
                      desc: "تدرج ضمن أرشيف العقار.",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.systemLinkStatus === opt.id ? "border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500" : "border-slate-200 hover:border-indigo-300"}`}
                    >
                      <input
                        type="radio"
                        checked={formData.systemLinkStatus === opt.id}
                        onChange={() =>
                          updateForm({ systemLinkStatus: opt.id })
                        }
                        className="mt-1 accent-indigo-600"
                      />
                      <div>
                        <h4 className="text-sm font-black text-slate-800 mb-1">
                          {opt.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>

                {formData.systemLinkStatus !== "unlinked" && (
                  <div className="animate-in fade-in zoom-in-95 mt-4">
                    <label className="text-xs font-black text-slate-700 block mb-2">
                      البحث عن السجل المرتبط
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="ابحث برقم المعاملة أو اسم العميل..."
                        className="w-full pl-3 pr-10 py-3 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4">
                <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">
                  الحماية والصلاحية
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      id: "open",
                      title: "رابط مفتوح",
                      icon: Unlock,
                      desc: "أي شخص يملك الرابط يمكنه الرفع بحرية.",
                    },
                    {
                      id: "pin",
                      title: "محمي برمز (PIN)",
                      icon: Lock,
                      desc: "يتطلب إدخال رمز مرور لفتح صفحة الرفع.",
                    },
                    {
                      id: "single",
                      title: "استخدام لمرة واحدة",
                      icon: Hash,
                      desc: "ينتهي الرابط فور الانتهاء من عملية رفع واحدة.",
                    },
                    {
                      id: "expire",
                      title: "ينتهي بتاريخ",
                      icon: Calendar,
                      desc: "صالح للرفع حتى تاريخ معين فقط.",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${formData.linkType === opt.id ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600" : "border-slate-200 hover:border-slate-300"}`}
                    >
                      <input
                        type="radio"
                        checked={formData.linkType === opt.id}
                        onChange={() => updateForm({ linkType: opt.id })}
                        className="mt-1 accent-indigo-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <opt.icon className="w-4 h-4 text-slate-600" />
                          <h4 className="text-sm font-black text-slate-800">
                            {opt.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold">
                          {opt.desc}
                        </p>
                      </div>
                    </label>
                  ))}
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
                      className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg text-sm tracking-widest font-mono text-center outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                      className="w-full md:w-1/2 p-2.5 border border-slate-300 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <label className="flex items-center justify-between p-4 border border-rose-100 rounded-xl bg-rose-50 cursor-pointer">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-2">
                      <CheckSquare className="w-4 h-4" /> عرض نص إخلاء المسؤولية
                      (Disclaimer)
                    </span>
                    <div
                      className={`w-10 h-5 rounded-full relative transition-colors ${formData.showDisclaimer ? "bg-rose-600" : "bg-slate-300"}`}
                      onClick={() =>
                        updateForm({ showDisclaimer: !formData.showDisclaimer })
                      }
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${formData.showDisclaimer ? "left-0.5" : "left-5"}`}
                      ></div>
                    </div>
                  </label>
                  {formData.showDisclaimer && (
                    <textarea
                      value={formData.disclaimerText}
                      onChange={(e) =>
                        updateForm({ disclaimerText: e.target.value })
                      }
                      className="w-full mt-3 p-3 bg-white border border-rose-200 rounded-xl text-xs text-rose-800 h-20 resize-none outline-none focus:ring-1 focus:ring-rose-400"
                    />
                  )}
                </div>
              </div>
            )}

            {/* 🚀 الخطوة 5: المعاينة مع بيانات الباك إند */}
            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 h-full flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-800">
                      هوية المتصفح (Branding) ومعاينة الرابط
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 mt-1">
                      عاين واجهة الرفع كما ستظهر للعميل الخارجي.
                    </p>
                  </div>
                  <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white shadow-sm text-indigo-700 flex items-center gap-1">
                      <MonitorSmartphone className="w-3.5 h-3.5" /> ديسكتوب
                    </button>
                  </div>
                </div>

                <div className="flex-1 min-h-[400px] border border-slate-200 rounded-2xl overflow-hidden bg-slate-200 flex flex-col">
                  {/* Pseudo Browser Header */}
                  <div className="bg-slate-100 border-b border-slate-200 p-2 flex items-center gap-2 shrink-0">
                    <div className="flex gap-1.5 ml-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                    </div>
                    <div className="flex-1 bg-white border border-slate-200 rounded-lg py-1 px-3 text-[10px] font-mono text-slate-500 text-center flex items-center justify-center gap-2">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>https://remix.sa/req/preview-xyz</span>
                    </div>
                    <div className="w-16"></div>
                  </div>

                  <div className="flex-1 overflow-y-auto bg-white relative custom-scrollbar">
                    <div className="h-full pointer-events-auto transform origin-top w-full">
                      <ExternalUploadPage
                        config={{
                          // 💡 تمرير إعدادات الباك إند
                          companyName:
                            uploadSettings.companyName ||
                            "مكتب ريمكس للاستشارات الهندسية",
                          brandColor: uploadSettings.brandColor || "#4f46e5",
                          footerText:
                            uploadSettings.footerText ||
                            "نظام ريمكس للإدارة الهندسية",
                          contactEmail:
                            uploadSettings.contactEmail || "info@remix-eng.com",
                          contactPhone:
                            uploadSettings.contactPhone || "920000000",
                          enableWhatsApp: uploadSettings.enableWhatsApp ?? true,
                          enableEmailCTA: uploadSettings.enableEmailCTA ?? true,
                          enableSms: uploadSettings.enableSms ?? true,

                          // إعدادات الطلب
                          title: formData.title || "طلب ملفات ووثائق المشروع",
                          welcomeText:
                            formData.description ||
                            "نأمل منكم تزويدنا بالملفات المطلوبة أدناه للبدء في الإجراءات.",
                          status:
                            formData.linkType === "pin"
                              ? "pin-required"
                              : "active",
                          pinCode: formData.pinCode,
                          clientName: formData.entityName || "عميل تجريبي",
                          showClientName: formData.targetType === "specific",
                          reqDescription: formData.instructions,
                          showReqDescription: !!formData.instructions,
                          reqRefNumber: "SYS-REQ-99X",
                          showRefNumber: true,
                          reqSenderName: formData.reqSenderName,
                          reqSenderMobile: formData.reqSenderMobile,
                          reqSenderEmail: formData.reqSenderEmail,
                          reqSenderNote: formData.reqSenderNote,
                          maxFiles: formData.maxFiles,
                          maxFileSize: formData.maxFileSize,
                          allowedTypes: ["all"],
                          showDisclaimer: formData.showDisclaimer,
                          disclaimerText: formData.disclaimerText,
                          isPreview: true,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🚀 خطوة النجاح (المحدثة لتستقبل بيانات الباك إند الحقيقية) */}
            {step === 6 && generatedLinkData && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-4 h-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center w-full max-w-lg">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">
                    الرابط جاهز للعمل!
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mb-8">
                    تم توليد الرابط وتأمين صلاحياته بنجاح في قاعدة البيانات.
                  </p>

                  {/* 💡 عرض الرابط الحقيقي الذي تم توليده من السيرفر */}
                  <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 shadow-sm">
                    <div className="flex items-center justify-center mb-4">
                      <QrCode className="w-24 h-24 text-slate-700" />
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                      <span
                        className="text-xs font-mono font-bold text-indigo-600 truncate mr-2"
                        dir="ltr"
                      >
                        {`https://details-worksystem1.com/req/${generatedLinkData.shortLink}`}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://details-worksystem1.com/req/${generatedLinkData.shortLink}`,
                          );
                          toast.success("تم نسخ الرابط الحقيقي بنجاح");
                        }}
                        className="p-2 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg text-indigo-600 transition-colors"
                        title="نسخ الرابط"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="w-full flex gap-3">
                    <button
                      onClick={() => setShowSender(true)}
                      className="flex-1 py-3.5 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 flex justify-center items-center gap-2 transition-all"
                    >
                      <Send className="w-4 h-4" /> إرسال الرابط للعميل الآن
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-black hover:bg-slate-50"
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
          {step < 6 && (
            <>
              <button
                disabled={step === 1 || createRequestMutation.isPending}
                onClick={() => setStep((s) => s - 1)}
                className="px-6 py-2.5 rounded-xl font-black text-xs text-slate-600 bg-white border border-slate-200 drop-shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                السابق
              </button>

              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all ${i === step ? "bg-indigo-600 w-8" : "bg-slate-200 w-3"}`}
                  />
                ))}
              </div>

              {step === 5 ? (
                <button
                  onClick={handleFinalSave}
                  disabled={createRequestMutation.isPending}
                  className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-70 transition-all"
                >
                  {createRequestMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  اعتماد وحفظ الرابط
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (step < 5) setStep((s) => s + 1);
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
            url: `https://details-worksystem1.com/req/${generatedLinkData.shortLink}`, // 💡 تمرير الرابط החقيقي للمرسل
            title: generatedLinkData.title,
            targetName: formData.entityName,
            pin: formData.pinCode,
            expireDate: formData.expireDate,
            type: "request",
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
