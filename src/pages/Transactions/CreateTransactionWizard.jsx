import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createTransaction, searchClients } from "../../api/transactionApi";
import { getDeeds } from "../../api/propertyApi";
import { getDocumentTypes } from "../../api/documentTypeApi";
import { createClient } from "../../api/clientApi";
import {
  User,
  Building2,
  FileText,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Loader2,
  MapPin,
  Ruler,
  UploadCloud,
  X,
  FileCheck,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";

// --- Utility Functions ---
const getClientNameSafe = (client) => {
  if (!client) return "";
  const actualClient = client.data || client;
  const name = actualClient.name;
  if (!name) return "عميل جديد";
  if (typeof name === "string") return name; // حالة البحث البسيط (string)
  if (name.ar) return name.ar;
  if (typeof name === "object") {
    const { firstName, fatherName, grandFatherName, familyName } = name;
    return [firstName, fatherName, grandFatherName, familyName]
      .filter(Boolean)
      .join(" ");
  }
  return "اسم غير معروف";
};

// --- Modern Quick Client Modal ---
const QuickClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const [clientData, setClientData] = useState({
    nameAr: "",
    mobile: "",
    idNumber: "",
    type: "individual",
  });

  const mutation = useMutation({
    mutationFn: createClient,
    onSuccess: (response) => {
      toast.success("تم تسجيل العميل بنجاح");
      const newClient = response.data || response;
      onClientCreated(newClient);
      onClose();
      setClientData({
        nameAr: "",
        mobile: "",
        idNumber: "",
        type: "individual",
      });
    },
    onError: (err) =>
      toast.error("فشل: " + (err.response?.data?.message || err.message)),
  });

  const handleSubmit = () => {
    const parts = clientData.nameAr.trim().split(/\s+/);
    let nameObject = {
      firstName: parts[0] || "",
      fatherName: "",
      grandFatherName: "",
      familyName: "",
    };

    if (parts.length > 1) nameObject.familyName = parts[parts.length - 1];
    if (parts.length > 2) nameObject.fatherName = parts[1];
    if (parts.length > 3) nameObject.grandFatherName = parts[2];
    if (parts.length === 2) nameObject.fatherName = "";

    const payload = { ...clientData, name: nameObject };
    delete payload.nameAr;
    mutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden scale-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-slate-50 to-white p-5 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" /> تسجيل عميل سريع
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              إضافة عميل جديد لقاعدة البيانات لإتمام المعاملة
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-slate-100 hover:bg-red-50 text-slate-500 hover:text-red-500 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              الاسم الكامل <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              placeholder="الاسم رباعي يفضل..."
              value={clientData.nameAr}
              onChange={(e) =>
                setClientData({ ...clientData, nameAr: e.target.value })
              }
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                رقم الجوال <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all dir-ltr"
                placeholder="05xxxxxxxx"
                value={clientData.mobile}
                onChange={(e) =>
                  setClientData({ ...clientData, mobile: e.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                رقم الهوية
              </label>
              <input
                type="text"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                placeholder="10xxxxxxxx"
                value={clientData.idNumber}
                onChange={(e) =>
                  setClientData({ ...clientData, idNumber: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 rounded-xl transition-all"
          >
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              mutation.isPending || !clientData.nameAr || !clientData.mobile
            }
            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md hover:shadow-lg shadow-blue-200 flex items-center gap-2 disabled:opacity-50 disabled:shadow-none transition-all"
          >
            {mutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}{" "}
            حفظ واختيار
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Wizard Component ---
const CreateTransactionWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: null,
    clientName: "",
    ownershipId: null,
    transactionTypeId: "",
    title: "",
    priority: "Normal",
    internalContractNumber: "",
    attachments: [],
    notes: "",
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);

  // Queries
  const { data: deedsData, isLoading: isLoadingDeeds } = useQuery({
    queryKey: ["clientDeeds", formData.clientId],
    queryFn: () => getDeeds({ clientId: formData.clientId }),
    enabled: !!formData.clientId,
  });
  const { data: docTypesData } = useQuery({
    queryKey: ["documentTypes"],
    queryFn: () => getDocumentTypes(),
  });

  const clientDeeds = deedsData?.data || [];
  const documentTypes = docTypesData || [];

  // Search Logic (Optimized)
  useEffect(() => {
    const timer = setTimeout(async () => {
      // البحث فقط إذا كان النص أطول من حرف واحد ولم يتم اختيار العميل بعد
      if (searchQuery.length > 1) {
        if (formData.clientName && searchQuery === formData.clientName) return; // منع البحث إذا كان الاسم مطابقاً للمختار

        setIsSearching(true);
        try {
          const results = await searchClients(searchQuery);
          setSearchResults(results || []);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 400); // Debounce
    return () => clearTimeout(timer);
  }, [searchQuery, formData.clientName]);

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      toast.success("تم إنشاء المعاملة بنجاح!");
      // navigate('/transactions'); // Uncomment to redirect
    },
    onError: (err) => toast.error("فشل الإنشاء: " + err.message),
  });

  const handleFileUpload = (docTypeId, file) => {
    const newAttachment = {
      docTypeId,
      file,
      fileName: file.name,
      status: "uploaded",
    };
    setFormData((prev) => ({
      ...prev,
      attachments: [
        ...prev.attachments.filter((a) => a.docTypeId !== docTypeId),
        newAttachment,
      ],
    }));
    toast.success(`تم إرفاق: ${file.name}`);
  };

  // --- Step 1: Client Selection (Enhanced) ---
  const renderStep1_Client = () => (
    <div className="flex flex-col max-w-2xl mx-auto pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          من هو العميل صاحب المعاملة؟
        </h2>
        <p className="text-slate-500 text-sm">
          ابحث في قاعدة البيانات أو أضف عميلاً جديداً
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-1 relative z-20">
        <div className="relative">
          <Search className="absolute right-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            className="w-full pl-12 pr-12 py-3 bg-transparent text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none"
            placeholder="ابحث بالاسم، رقم الجوال، أو الهوية..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              // إذا عدل المستخدم النص، نلغي الاختيار السابق
              if (formData.clientId)
                setFormData((prev) => ({
                  ...prev,
                  clientId: null,
                  clientName: "",
                }));
            }}
          />
          {isSearching ? (
            <Loader2 className="absolute left-4 top-3.5 w-5 h-5 text-blue-500 animate-spin" />
          ) : formData.clientId ? (
            <CheckCircle2 className="absolute left-4 top-3.5 w-5 h-5 text-green-500" />
          ) : null}
        </div>

        {/* Dropdown Results */}
        {searchResults.length > 0 && !formData.clientId && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-72 overflow-y-auto z-50">
            {searchResults.map((client) => {
              const safeName = getClientNameSafe(client);
              return (
                <div
                  key={client.id}
                  onClick={() => {
                    setFormData({
                      ...formData,
                      clientId: client.id,
                      clientName: safeName,
                    });
                    setSearchQuery(safeName);
                    setSearchResults([]);
                  }}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 group-hover:text-blue-700">
                        {safeName}
                      </div>
                      <div className="text-xs text-slate-500 flex gap-3 mt-0.5">
                        <span className="font-mono">{client.mobile}</span>
                        <span className="w-px h-3 bg-slate-300"></span>
                        <span className="font-mono">{client.idNumber}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-blue-500" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {!formData.clientId && (
        <div className="mt-6 text-center">
          <span className="text-slate-400 text-xs font-medium px-3 bg-slate-50 relative z-10">
            أو
          </span>
          <div className="h-px bg-slate-200 -mt-2 mb-6"></div>
          <button
            onClick={() => setIsClientModalOpen(true)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 hover:shadow-md text-slate-600 hover:text-blue-600 font-bold rounded-xl transition-all duration-300 group"
          >
            <div className="p-1 bg-slate-100 group-hover:bg-blue-100 rounded-full transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            تسجيل عميل جديد
          </button>
        </div>
      )}
    </div>
  );

  // --- Step 2: Ownership ---
  const renderStep2_Ownership = () => (
    <div className="flex flex-col max-w-3xl mx-auto pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            اختيار العقار (الصك)
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            اختر الصك المرتبط بالمعاملة من ملف العميل
          </p>
        </div>
        <button
          onClick={() => setFormData({ ...formData, ownershipId: null })}
          className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
        >
          تخطي هذه الخطوة
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoadingDeeds ? (
          <div className="py-20 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
            <p className="text-sm">جاري جلب الصكوك...</p>
          </div>
        ) : clientDeeds.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 font-medium">
              لا توجد صكوك مسجلة لهذا العميل
            </p>
          </div>
        ) : (
          clientDeeds.map((deed) => (
            <div
              key={deed.id}
              onClick={() => setFormData({ ...formData, ownershipId: deed.id })}
              className={`relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 group flex items-start gap-4 ${
                formData.ownershipId === deed.id
                  ? "bg-blue-50 border-blue-500 shadow-md"
                  : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-sm"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  formData.ownershipId === deed.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500"
                }`}
              >
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base mb-1">
                      صك رقم:{" "}
                      <span className="font-mono">{deed.deedNumber}</span>
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <MapPin className="w-3 h-3" />{" "}
                        {deed.district || "غير محدد"}
                      </span>
                      <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded">
                        <Ruler className="w-3 h-3" /> {deed.area} م²
                      </span>
                    </div>
                  </div>
                  {formData.ownershipId === deed.id && (
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-sm scale-110">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // --- Step 3 ---
  const renderStep3_Service = () => (
    <div className="flex flex-col h-full max-w-2xl mx-auto pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-xl font-bold text-slate-800 mb-6">
        تفاصيل الخدمة المطلوبة
      </h2>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            نوع المعاملة
          </label>
          <select
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
            value={formData.transactionTypeId}
            onChange={(e) => {
              setFormData({ ...formData, transactionTypeId: e.target.value });
              if (!formData.title)
                setFormData((prev) => ({
                  ...prev,
                  title: e.target.options[e.target.selectedIndex].text,
                }));
            }}
          >
            <option value="">-- اختر من القائمة --</option>
            <option value="560-01">560-01 - رخص البناء</option>
            <option value="560-02">560-02 - شهادات الإتمام</option>
            <option value="560-03">560-03 - تجزئة الأراضي</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-bold text-slate-700">
            عنوان المعاملة (وصف مختصر)
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 outline-none transition-all"
            placeholder="مثال: رخصة بناء فيلا سكنية - حي الملقا"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">الأولوية</label>
            <select
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
            >
              <option value="Normal">عادي</option>
              <option value="High">مهم</option>
              <option value="Urgent">عاجل جداً</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              رقم العقد الداخلي
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono outline-none"
              placeholder="INT-202X-000"
              value={formData.internalContractNumber}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  internalContractNumber: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );

  // --- Step 4 ---
  const renderStep4_Attachments = () => {
    const requiredDocs = documentTypes
      .filter((d) => d.classification === "فني" || d.classification === "عام")
      .slice(0, 5);
    return (
      <div className="flex flex-col h-full max-w-3xl mx-auto pt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            المرفقات والمتطلبات
          </h2>
          <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
            {formData.attachments.length} / {requiredDocs.length} مكتمل
          </div>
        </div>

        <div className="grid gap-3">
          {requiredDocs.map((doc) => {
            const isUploaded = formData.attachments.some(
              (a) => a.docTypeId === doc.id,
            );
            return (
              <div
                key={doc.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${isUploaded ? "bg-green-50 border-green-200 shadow-sm" : "bg-white border-slate-200"}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${isUploaded ? "bg-green-200 text-green-700" : "bg-slate-100 text-slate-400"}`}
                  >
                    {isUploaded ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <FileText className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p
                      className={`font-bold text-sm ${isUploaded ? "text-green-800" : "text-slate-700"}`}
                    >
                      {doc.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      {doc.code}
                    </p>
                  </div>
                </div>
                {isUploaded ? (
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter(
                          (a) => a.docTypeId !== doc.id,
                        ),
                      }))
                    }
                    className="p-2 hover:bg-white text-red-500 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <label className="cursor-pointer px-4 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-bold rounded-lg border border-slate-200 hover:border-blue-200 transition-all flex items-center gap-2">
                    <UploadCloud className="w-4 h-4" /> رفع الملف{" "}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files[0] &&
                        handleFileUpload(doc.id, e.target.files[0])
                      }
                    />
                  </label>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Step 5 ---
  const renderStep5_Confirmation = () => (
    <div className="flex flex-col h-full max-w-2xl mx-auto pt-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
        <BadgeCheck className="w-10 h-10" />
      </div>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        جاهز لإنشاء المعاملة؟
      </h2>
      <p className="text-slate-500 text-sm mb-8">
        يرجى مراجعة التفاصيل أدناه قبل التأكيد النهائي
      </p>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-right">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-sm text-slate-500">العميل</span>
          <span className="font-bold text-slate-800">
            {formData.clientName}
          </span>
        </div>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <span className="text-sm text-slate-500">نوع الخدمة</span>
          <span className="font-bold text-blue-600">
            {formData.transactionTypeId || "-"}
          </span>
        </div>
        <div className="p-4 flex justify-between items-center">
          <span className="text-sm text-slate-500">المرفقات</span>
          <span className="font-bold text-slate-800">
            {formData.attachments.length} ملفات
          </span>
        </div>
      </div>
    </div>
  );

  // --- Main Layout ---
  return (
    <div className="flex flex-col h-full bg-slate-50/50 relative">
      {/* Top Progress Bar */}
      <div className="h-1 bg-slate-200 w-full">
        <div
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${(step / 5) * 100}%` }}
        ></div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-blue-200 shadow-lg">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              إنشاء معاملة جديدة
            </h1>
            <p className="text-xs text-slate-500">الخطوة {step} من 5</p>
          </div>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-32 custom-scrollbar">
        {step === 1 && renderStep1_Client()}
        {step === 2 && renderStep2_Ownership()}
        {step === 3 && renderStep3_Service()}
        {step === 4 && renderStep4_Attachments()}
        {step === 5 && renderStep5_Confirmation()}
      </div>

      {/* Fixed Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            السابق
          </button>

          {step < 5 ? (
            <button
              onClick={() => {
                if (step === 1 && !formData.clientId) {
                  toast.error("الرجاء اختيار عميل أولاً");
                  return;
                }
                setStep((s) => Math.min(5, s + 1));
              }}
              className="flex-1 px-6 py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              متابعة <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => createMutation.mutate(formData)}
              disabled={createMutation.isPending}
              className="flex-1 px-6 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              {createMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
              تأكيد وإنشاء المعاملة
            </button>
          )}
        </div>
      </div>

      <QuickClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onClientCreated={(client) => {
          const safeName = getClientNameSafe(client);
          setFormData((prev) => ({
            ...prev,
            clientId: client.id,
            clientName: safeName,
          }));
          setSearchQuery(safeName);
        }}
      />
    </div>
  );
};

export default CreateTransactionWizard;
